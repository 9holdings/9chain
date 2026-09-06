// Container-only integration. No Docker socket, host ports, validator state or keys.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawn, execFile } from 'node:child_process';
import { once } from 'node:events';
import { createServer, request } from 'node:http';
import { promisify } from 'node:util';
import { randomUUID } from 'node:crypto';
import { controlMaintenance } from './src/local-net/deploy/console-maintenance.mjs';

assert.equal(process.env.A1_ISOLATED_FIXTURE, 'console-restart', 'This fixture runs only in its isolated container');
assert.equal(process.platform, 'linux');
const negative = process.env.A1_NEGATIVE_LEGACY === '1';
const execute = promisify(execFile);
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const token = 'synthetic-restart-operator-token';
const target = { root: '/tmp/console-restart-lab/target', port: 18091 };
const other = { root: '/tmp/console-restart-lab/other', port: 18092 };
const children = [];
const rpc = createServer(async (req, res) => {
  let body = ''; for await (const part of req) body += part;
  const { id, method } = JSON.parse(body);
  const result = method === 'info.getNetworkID' ? { networkID: '999999998' } :
    method === 'info.getNetworkName' ? { networkName: '9chain-a1' } :
    method === 'info.getNodeVersion' ? { version: '9chaingo/1.14.2' } : '0x218711a09';
  res.end(JSON.stringify({ jsonrpc: '2.0', id, result }));
});
rpc.listen(18093, '127.0.0.1'); await once(rpc, 'listening');
async function state(console, options = {}) {
  return controlMaintenance({ url: `http://127.0.0.1:${console.port}`, token, timeoutMs: 2000, ...options });
}
async function ready(console) {
  for (let count = 0; count < 80; count++) {
    if (console.child?.exitCode !== null && console.child?.exitCode !== undefined) throw new Error('Fixture console exited before listening');
    try { return await state(console); } catch { await delay(50); }
  }
  throw new Error('Fixture console did not listen');
}
function prepare(console) {
  fs.mkdirSync(console.root, { recursive: true });
  fs.cpSync('/inputs/src', console.root + '/src', { recursive: true });
  fs.symlinkSync('/opt/fixture/node_modules', console.root + '/src/local-net/console/node_modules', 'dir');
  console.env = { ...process.env, PORT: String(console.port), A1_ROOT: console.root,
    A1_CONSOLE_TOKEN: token, A1_CONSOLE_HOST: '127.0.0.1', A1_CONSOLE_START_PAUSED: '0',
    NODE_URI: 'http://127.0.0.1:18093', A1_CLI_KEY: 'PrivateKey-invalid-synthetic-only',
    A1_DE_CHAIN_MO: '1', A1_COMPOSE_FILE: console.root + '/missing-compose.yml' };
  const names = ['PORT', 'A1_CONSOLE_TOKEN', 'A1_CONSOLE_HOST', 'A1_CONSOLE_START_PAUSED',
    'NODE_URI', 'A1_CLI_KEY', 'A1_DE_CHAIN_MO', 'A1_COMPOSE_FILE'];
  fs.writeFileSync(console.root + '/console.env', names.map(key => `${key}='${console.env[key]}'`).join('\n') + '\n', { mode: 0o600 });
}
function start(console) {
  const log = fs.openSync(console.root + '/first-process.log', 'a', 0o600);
  console.child = spawn('node', ['local-net/console/server.mjs'], {
    cwd: console.root + '/src', env: console.env, stdio: ['ignore', log, log] });
  fs.closeSync(log); children.push(console.child);
}
async function restart(identity, expectedCode = 0) {
  let result;
  try {
    result = await execute('bash', [target.root + '/src/local-net/deploy/console-restart.sh',
      '--instance-id', identity.instanceId, '--maintenance-id', identity.maintenanceId],
    { env: target.env, timeout: 50_000, maxBuffer: 64 << 10 });
    result.code = 0;
  } catch (error) { result = error; }
  assert.equal(Number(result.code), expectedCode, `Restart exit: ${result.stderr || result.stdout || result.message}`);
  return result;
}
async function unchanged(first, second) {
  assert.equal((await state(target)).instanceId, first.instanceId, 'Refused restart must preserve target process');
  assert.equal((await state(other)).instanceId, second.instanceId, 'Unrelated console must remain unchanged');
}
let slow;
try {
  prepare(target); prepare(other); start(target); start(other);
  const initial = await ready(target); const unrelated = await ready(other);
  if (!negative) {
    await restart({ instanceId: initial.instanceId, maintenanceId: randomUUID() }, 1);
    await unchanged(initial, unrelated);
    slow = request(`http://127.0.0.1:${target.port}/api/create`, { method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' } });
    slow.on('error', () => {}); slow.write('{');
    for (let n = 0; n < 50 && (await state(target)).activeOperations === 0; n++) await delay(20);
    const pausedResponse = await fetch(`http://127.0.0.1:${target.port}/api/maintenance/pause`, {
      method: 'POST', headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(2000) });
    const busy = await pausedResponse.json(); assert.equal(busy.activeOperations, 1);
    await restart(busy, 1); await unchanged(initial, unrelated);
    slow.destroy(); slow = undefined;
    for (let n = 0; n < 50 && !(await state(target)).readyForRestart; n++) await delay(20);
    await restart({ instanceId: randomUUID(), maintenanceId: busy.maintenanceId }, 1);
    await restart({ instanceId: busy.instanceId, maintenanceId: randomUUID() }, 1);
    await unchanged(initial, unrelated);
    // A valid API at another port cannot authorize stopping a process in another source tree.
    await state(other, { action: 'pause-and-wait' });
    const envPath = target.root + '/console.env'; const originalEnv = fs.readFileSync(envPath, 'utf8');
    fs.writeFileSync(envPath, originalEnv.replace('PORT=\'18091\'', 'PORT=\'18092\''));
    const mismatch = await restart(await state(other), 1);
    assert.match(mismatch.stderr, /not the expected Node console/);
    fs.writeFileSync(envPath, originalEnv);
    await unchanged(initial, unrelated);
    console.log('PASS: open, busy, stale process, stale pause and foreign source-tree listeners refused before stop');
  }
  const before = await state(target, { action: 'pause-and-wait' });
  const output = await restart(before);
  // Check the unrelated real process first so the legacy negative fails for the intended reason.
  assert.equal(other.child.exitCode, null, 'Restart must not kill another console process on this machine');
  assert.equal(other.child.signalCode, null, 'Restart must not signal another console process on this machine');
  assert.equal((await state(other)).instanceId, unrelated.instanceId);
  const after = await state(target, { action: 'assert-paused', previousInstanceId: before.instanceId });
  assert.notEqual(after.instanceId, before.instanceId); assert.equal(after.readyForRestart, true);
  assert.match(output.stdout, /PASS: console PID [0-9]+ replaced [0-9]+ and remains paused/);
  assert.equal(target.child.signalCode, 'SIGTERM');
  const blocked = await fetch(`http://127.0.0.1:${target.port}/api/create`, { method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: '{}',
    signal: AbortSignal.timeout(2000) });
  assert.equal(blocked.status, 503);
  for (const console of [target, other]) {
    assert.equal(fs.existsSync(console.root + '/src/9chain-a1-config/console-chains.json'), false);
    assert.deepEqual(fs.readdirSync(console.root + '/src/9chain-a1-config/console-tmp'), []);
  }
  console.log('PASS: only the verified target restarted, replacement stays paused, second console survives, no ledger/genesis writes');
} catch (error) {
  console.error(`FAIL: ${error.message}`); process.exitCode = 1;
} finally {
  slow?.destroy();
  for (const child of children) { if (child.exitCode === null && child.signalCode === null) child.kill(); }
  rpc.closeAllConnections(); await new Promise(resolve => rpc.close(resolve));
  // Replacement is adopted by container PID 1 and ends when this bounded fixture exits.
}
