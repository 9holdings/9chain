#!/usr/bin/env node
// Optional Docker integration. Uses synthetic RPC containers, never validator data.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdirSync, mkdtempSync, copyFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import { createManagedNodeRpc } from '../local-net/lib/managed-node-rpc.mjs';
import { waitForChainNodes } from '../local-net/lib/chain-readiness.mjs';

const execute = promisify(execFile);
const root = fileURLToPath(new URL('../', import.meta.url));
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const args = process.argv.slice(2);
if (args.length && !(args.length === 2 && args[0] === '--runtime-image')) {
  console.error('Usage: node scripts/check-managed-node-rpc.mjs [--runtime-image <existing-node-image>]');
  process.exit(2);
}
const runtime = args[1] ?? '9chain-a1/node:autopilot-20260906';
const builder = 'golang@sha256:154bd7001b6eb339e88c964442c0ad6ed5e53f09844cc818a41ce4ecb3ce3b43';
const work = path.join(root, 'work');
mkdirSync(work, { recursive: true });
const scratch = mkdtempSync(path.join(work, 'managed-rpc-'));
const project = `a1-rpc-${path.basename(scratch).toLowerCase()}`;
const compose = ['compose', '-p', project, '-f', path.join(scratch, 'compose.json')];
const commands = [];
async function docker(argv, timeout = 30_000) {
  const result = await execute('docker', argv, { cwd: root, encoding: 'utf8',
    timeout, windowsHide: true, maxBuffer: 1 << 24 });
  commands.push({ args: argv, stdout: result.stdout, stderr: result.stderr });
  return result.stdout;
}
const services = ['good-node', 'second-node', 'wrong-node'];
const identity = { subnetID: 'Subnet111', blockchainID: 'Blockchain111', chainId: 9001000100 };
const expectedId = `0x${identity.chainId.toString(16)}`;
// Emit a synthetic diagnostic through the real in-container process stderr,
// then execute the runtime image's actual curl with unchanged arguments.
writeFileSync(path.join(scratch, 'curl'), '#!/bin/sh\nprintf "Synthetic curl diagnostic\\n" >&2\nexec /usr/bin/curl "$@"\n');
writeFileSync(path.join(scratch, 'compose.json'), JSON.stringify({ services:
  Object.fromEntries(services.map(svc => [svc, {
    image: runtime, pull_policy: 'never', entrypoint: ['/fixture/server'],
    network_mode: 'none', read_only: true, cap_drop: ['ALL'],
    security_opt: ['no-new-privileges:true'], mem_limit: '128m', cpus: 0.5, pids_limit: 32,
    volumes: [{ type: 'bind', source: scratch, target: '/fixture', read_only: true },
      { type: 'bind', source: path.join(scratch, 'curl'), target: '/usr/local/bin/curl', read_only: true }],
    environment: { FIXTURE_WRONG_ID: svc === 'wrong-node' ? '1' : '0' },
  }])) }, null, 2));
copyFileSync(path.join(root, 'scripts/fixtures/managed-rpc-server.go'), path.join(scratch, 'server.go'));
let started = false, stopped = false;
const wire = [];
const rpc = createManagedNodeRpc({ cwd: root, compose, run: async (command, argv, options) => {
  // Test-only mutation for the live negative control, without editing production.
  if (process.env.A1_TEST_REMOVE_CURL_TIMEOUT === '1') {
    argv = [...argv]; const maxTime = argv.indexOf('-m'); argv.splice(maxTime, 2);
  }
  try {
    const result = await execute(command, argv, options);
    wire.push({ args: argv, stdout: result.stdout, stderr: result.stderr });
    return result;
  } catch (error) {
    wire.push({ args: argv, error: error.name, code: error.code });
    throw error;
  }
} });
const read = (segment, options = {}) => rpc('good-node', segment, 'eth_chainId', [], { timeoutMs: 5000, ...options });
try {
  // Require installed images: do not silently pull a moving tag or other runtime.
  await docker(['image', 'inspect', runtime, builder]);
  console.log(`Building synthetic fixture; evidence: ${scratch}`);
  await docker(['run', '--name', `${project}-build`, '--network', 'none', '--read-only',
    '--memory', '2g', '--cpus', '2', '--pids-limit', '128', '--tmpfs', '/tmp:size=805306368',
    '--mount', `type=bind,source=${scratch},target=/fixture`,
    '-e', 'CGO_ENABLED=0', '-e', 'GOCACHE=/tmp/cache', '-e', 'GOPROXY=off',
    '-e', 'GOTOOLCHAIN=local', builder, 'timeout', '170s',
    'go', 'build', '-o', '/fixture/server', '/fixture/server.go'], 180_000);
  started = true; // Even partial Compose startup must be stopped on failure.
  await docker([...compose, 'up', '-d', '--no-build', '--pull', 'never']);
  for (const svc of services) {
    const id = (await docker([...compose, 'ps', '-q', svc])).trim();
    const [state] = JSON.parse(await docker(['inspect', id]));
    assert.equal(state.State.Running, true);
    assert.equal(state.HostConfig.NetworkMode, 'none');
    assert.equal(state.HostConfig.ReadonlyRootfs, true);
    assert.deepEqual(state.HostConfig.PortBindings, {});
  }
  const ready = await waitForChainNodes(['good-node', 'second-node'], identity, rpc,
    { timeoutMs: 15_000, probeTimeoutMs: 5000, intervalMs: 200, concurrency: 2 });
  assert.equal(ready.length, 2);
  assert.equal(await read('/ext/bc/Blockchain111/rpc'), expectedId);
  assert.ok(wire.some(call => /Synthetic curl diagnostic/.test(call.stderr ?? '')),
    'The in-container diagnostic must travel over real Docker stderr for the separation control');
  console.log('PASS: real Compose exec/curl, tagged health, both nodes, independent stdout/stderr');
  await assert.rejects(waitForChainNodes(['good-node', 'wrong-node'], identity, rpc,
    { timeoutMs: 15_000, probeTimeoutMs: 5000, intervalMs: 200 }), /wrong-node L1 chain ID mismatch/);
  await assert.rejects(read('/ext/bc/BadJson/rpc'), error => error.retryable === false && /invalid eth_chainId JSON/.test(error.message));
  await assert.rejects(read('/ext/bc/BadEnvelope/rpc'), error => error.retryable === false && /request ID does not match/.test(error.message));
  await assert.rejects(read('/ext/bc/HttpError/rpc'), /not answering within the readiness probe deadline/);
  console.log('PASS: wrong managed-node identity, malformed JSON, unrelated response ID, HTTP failure');

  const start = performance.now();
  await assert.rejects(read('/ext/bc/HangDeadline/rpc', { timeoutMs: 1500 }), /readiness probe deadline/);
  const clientDeadlineMs = performance.now() - start;
  assert.ok(clientDeadlineMs >= 1000 && clientDeadlineMs < 5000,
    `Docker client deadline did not bound the hanging request: ${clientDeadlineMs}ms`);

  const controller = new AbortController();
  const hung = read('/ext/bc/HangAbort/rpc', { signal: controller.signal, timeoutMs: 10_000 });
  // Attach a handler immediately, then prove the request reached the server
  // before cancelling; aborting before Docker exec starts is a different test.
  const rejected = assert.rejects(hung, /readiness probe deadline/);
  let entered = false;
  for (let attempt = 0; attempt < 12; attempt++) {
    if ((await docker([...compose, 'logs', '--no-color', 'good-node'])).includes('REQUEST /ext/bc/HangAbort/rpc')) {
      entered = true; break;
    }
    await delay(100);
  }
  controller.abort();
  await rejected;
  assert.equal(entered, true, 'Cancellation must target an already running in-container curl');
  // Killing the Docker client can leave curl running. Its independent five-second
  // deadline must close BOTH hanging requests, even though their callers are gone.
  await delay(6000);
  const logs = await docker([...compose, 'logs', '--no-color', 'good-node']);
  assert.match(logs, /REQUEST \/ext\/bc\/HangDeadline\/rpc/);
  assert.match(logs, /CANCELLED \/ext\/bc\/HangDeadline\/rpc/,
    'In-container curl deadline must release the request after its Docker client is killed');
  assert.match(logs, /CANCELLED \/ext\/bc\/HangAbort\/rpc/,
    'In-container curl deadline must release the request after caller cancellation');
  const id = (await docker([...compose, 'ps', '-q', 'good-node'])).trim();
  const processes = await docker(['top', id, '-eo', 'pid,comm']);
  assert.ok(!/^\s*\d+\s+curl\s*$/m.test(processes), 'No in-container curl may remain after its deadline');
  console.log(`PASS: Docker client timeout (${Math.round(clientDeadlineMs)}ms), explicit abort after server entry, no stranded curl`);
} catch (error) {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (started) {
    try { await docker([...compose, 'stop', '--timeout', '2']); stopped = true; }
    catch (error) { console.error(`FAIL: could not stop synthetic project ${project}: ${error.message}`); process.exitCode = 1; }
  }
  writeFileSync(path.join(scratch, 'evidence.json'), JSON.stringify({
    measuredAt: new Date().toISOString(), project, runtime, builder, negativeControl:
      process.env.A1_TEST_REMOVE_CURL_TIMEOUT === '1', result: process.exitCode ? 'failed' : 'passed', commands, wire,
    limitations: 'Synthetic RPC with real Docker transport; no validators, blockchain genesis, consensus, or public changes.',
  }, null, 2));
  console.log(`${started ? stopped ? 'Containers stopped and retained' : 'Container stop not confirmed' : 'Runtime startup not attempted'}; evidence: ${scratch}`);
}
