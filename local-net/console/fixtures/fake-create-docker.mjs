// Test-only preload. No command is ever forwarded to the real Docker executable.
import childProcess from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';
import { promisify } from 'node:util';
import { appendFileSync, readFileSync } from 'node:fs';
import fs from 'node:fs';
import path from 'node:path';

if (!path.basename(process.cwd()).startsWith('create-rpc-')) {
  throw new Error('The Docker fixture requires an isolated create-rpc scratch directory');
}
const record = action => appendFileSync('fake-docker.log', action + '\n');
const services = process.env.A1_TEST_NODE_MODE ? ['worker-node', 'test-node'] : ['test-node'];
const restarted = new Set();
const nodeAction = (action, svc) => appendFileSync('fake-node-actions.jsonl', JSON.stringify({ action, svc }) + '\n');
if (process.env.A1_TEST_LEDGER_SYNC_FAILURE === '1') {
  const originalOpen = fs.openSync, originalClose = fs.closeSync, originalSync = fs.fsyncSync;
  const descriptors = new Map();
  fs.openSync = (file, ...args) => {
    const fd = originalOpen(file, ...args); descriptors.set(fd, String(file)); return fd;
  };
  fs.closeSync = fd => { descriptors.delete(fd); return originalClose(fd); };
  fs.fsyncSync = fd => {
    if (descriptors.get(fd)?.endsWith('console-chains.json.tmp')) {
      record('ledger-sync-failed');
      throw new Error('Synthetic primary ledger flush failure');
    }
    return originalSync(fd);
  };
}
function output(file, args) {
  if (file !== 'docker') throw new Error('Unexpected executable in the Docker fixture');
  if (args.includes('l1') && args.includes('create')) {
    if (process.env.A1_TEST_REQUIRE_JOURNAL === '1') {
      const pending = JSON.parse(readFileSync('9chain-a1-config/creation-journal/pending.json', 'utf8'));
      if (pending.phase !== 'submitting') throw new Error('Journal must record intent before CLI submission');
    }
    record('create');
    if (process.env.A1_TEST_CREATE_FAILURE === '1') throw new Error('Synthetic lost CLI response after submission');
    return 'SUBNET_ID=TestSubnet111\nBLOCKCHAIN_ID=TestBlockchain111\n';
  }
  if (args.includes('config') && args.includes('--services')) {
    record('services');
    return services.join('\n') + '\n';
  }
  if (args.includes('up')) {
    const svc = args.at(-1); restarted.add(svc); nodeAction('restart', svc);
    record('restart'); return '';
  }
  if (args.includes('curl')) {
    const request = JSON.parse(args[args.indexOf('--data') + 1]);
    const svc = args[args.indexOf('curl') - 1];
    const badNode = svc === 'worker-node';
    if (request.method === 'health.health' && request.params?.tags?.includes('TestSubnet111')) {
      if (restarted.size !== services.length) throw new Error('All nodes must roll out before new-L1 readiness is checked');
      record('l1-health'); nodeAction('l1-health', svc);
      const missing = badNode && process.env.A1_TEST_NODE_MODE === 'missing';
      return JSON.stringify({ jsonrpc: '2.0', id: badNode && process.env.A1_TEST_NODE_MODE === 'bad-envelope' ? 7 : 1,
        result: { healthy: true, checks: missing ? {} : { TestBlockchain111: {} } } });
    }
    if (request.method === 'eth_chainId') {
      record('l1-id'); nodeAction('l1-id', svc);
      const wrong = badNode && process.env.A1_TEST_NODE_MODE === 'wrong-id';
      return JSON.stringify({ jsonrpc: '2.0', id: 1,
        result: wrong ? '0x1' : '0x' + Number(process.env.A1_TEST_EXPECTED_CHAIN_ID).toString(16) });
    }
    if (request.method === 'health.health') {
      nodeAction('primary-health', svc);
      record('health');
      return JSON.stringify({ jsonrpc: '2.0', id: 1, result: { checks: { P: {}, X: {}, C: {} } } });
    }
  }
  throw new Error('Unexpected Docker command: the test must model it explicitly');
}
function fakeExecFile(file, args, options, callback) {
  try { callback(null, output(file, args), ''); } catch (error) { callback(error); }
}
fakeExecFile[promisify.custom] = async (file, args, options) => {
  const stdout = output(file, args);
  if (args.includes('l1') && args.includes('create') && process.env.A1_TEST_CREATE_PAUSE === '1') {
    // Intent and the synthetic submission are recorded, but the CLI never returns.
    await new Promise(() => {});
  }
  const stderr = options?.signal && process.env.A1_TEST_NODE_MODE === 'stderr'
    ? 'Synthetic compose warning containing {diagnostics}\n' : '';
  return { stdout, stderr };
};
childProcess.execFile = fakeExecFile;
syncBuiltinESMExports();
