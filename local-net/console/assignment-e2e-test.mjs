#!/usr/bin/env node
// assignment-e2e-test.mjs — validator assignment on the REAL console HTTP path (P-82).
//
// Run: node local-net/console/assignment-e2e-test.mjs
//
// The console runs with the Docker fixture (`fixtures/fake-create-docker.mjs`) modelling a
// nine-service compose file and a synthetic node; nothing real is touched. What is measured:
//   1. with A1_L1_VALIDATORS_PER_CHAIN=5 the record on disk carries `validators` (5 names) and
//      three chains spread deterministically — least-loaded, ties by name;
//   2. a node at capacity refuses the next chain BEFORE the CLI runs (no `create` in the Docker
//      log), naming the node — and legacy records (no key) count on every node;
//   3. without the variable, nothing changes: no `validators` key, preview says null.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer as httpServer } from 'node:http';
import { createServer as netServer } from 'node:net';
import { mkdirSync, mkdtempSync, copyFileSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { NETWORK_ID, TEN_MANG } from '../lib/chainid.mjs';
import { nodeLoad } from '../lib/validator-assignment.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const SERVICES = ['node-b', 'node-c', 'node-d', 'node-e', 'node-f', 'node-g', 'node-h', 'node-i', 'test-node'];
let currentChainIdHex = '0x0';
const children = new Set();
process.on('exit', () => { for (const child of children) child.kill(); });
let pass = 0, fail = 0;
const ok = (label, cond, detail = '') => {
  if (cond) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; console.log(`  ✗ ${label}${detail ? `  — ${detail}` : ''}`); }
};

// ═══ synthetic node: generation, version, C-Chain id, and the L1 id the test expects ═══
const node = httpServer(async (request, response) => {
  let text = '';
  for await (const chunk of request) text += chunk;
  const { method, id } = JSON.parse(text);
  let result;
  if (method === 'info.getNetworkID') result = { networkID: String(NETWORK_ID) };
  else if (method === 'info.getNetworkName') result = { networkName: TEN_MANG };
  else if (method === 'info.getNodeVersion') result = { version: '9chaingo/1.14.2', rpcProtocolVersion: '45' };
  else if (method === 'eth_chainId' && request.url === '/ext/bc/C/rpc') result = '0x218711a09';
  else if (method === 'eth_chainId' && /^\/ext\/bc\/TestBlockchain\d+\/rpc$/.test(request.url)) result = currentChainIdHex;
  else {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ jsonrpc: '2.0', id, error: { message: `Not simulated: ${method}` } }));
    return;
  }
  response.writeHead(200, { 'content-type': 'application/json' });
  response.end(JSON.stringify({ jsonrpc: '2.0', id, result }));
});
node.listen(0, '127.0.0.1');
await once(node, 'listening');
const nodeUrl = `http://127.0.0.1:${node.address().port}`;
mkdirSync(path.join(root, 'work'), { recursive: true });

/** One console on a fresh scratch directory. `ledger` pre-writes console-chains.json. */
async function startConsole({ perChain, ledger } = {}) {
  // The fixture insists on a `create-rpc-` scratch prefix (it refuses to run anywhere else).
  const scratch = mkdtempSync(path.join(root, 'work/create-rpc-assign-'));
  const config = path.join(scratch, '9chain-a1-config');
  mkdirSync(path.join(config, 'console-tmp'), { recursive: true });
  mkdirSync(path.join(scratch, 'local-net/console'), { recursive: true });
  copyFileSync(path.join(root, '9chain-a1-config/l1-evm-genesis.json'), path.join(config, 'l1-evm-genesis.json'));
  copyFileSync(path.join(root, 'local-net/console/index.html'), path.join(scratch, 'local-net/console/index.html'));
  if (ledger) writeFileSync(path.join(config, 'console-chains.json'), JSON.stringify(ledger, null, 2));
  const reservation = netServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  const token = `synthetic-operator-token-${port}`;
  const child = spawn(process.execPath, ['--import',
    pathToFileURL(path.join(root, 'local-net/console/fixtures/fake-create-docker.mjs')).href,
    path.join(root, 'local-net/console/server.mjs')], {
    cwd: scratch, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: String(port), A1_CONSOLE_HOST: '127.0.0.1',
      A1_CONSOLE_TOKEN: token, A1_CLI_KEY: 'PrivateKey-synthetic-not-valid',
      A1_DE_CHAIN_MO: '1', A1_NODE_CONTAINER: 'test-node', NODE_URI: nodeUrl,
      A1_TEST_REQUIRE_JOURNAL: '1', A1_TEST_UNIQUE_IDS: '1', A1_TEST_SERVICES: SERVICES.join(','),
      A1_COMPOSE_FILE: path.join(scratch, 'no-real-compose.yml'), A1_PUBLIC_RPC_BASE: nodeUrl,
      A1_LIMIT_CREATE: '99',
      ...(perChain === undefined ? {} : { A1_L1_VALIDATORS_PER_CHAIN: String(perChain) }) },
  });
  children.add(child);
  let log = '';
  child.stdout.on('data', d => { log += d; }); child.stderr.on('data', d => { log += d; });
  const base = `http://127.0.0.1:${port}`;
  const headers = { authorization: `Bearer ${token}`, 'content-type': 'application/json' };
  let ready = false;
  for (let attempt = 0; attempt < 60 && !ready; attempt++) {
    if (child.exitCode !== null) throw new Error(`console exited ${child.exitCode}: ${log}`);
    try { ready = (await fetch(base + '/api/progress', { headers, signal: AbortSignal.timeout(500) })).status === 200; } catch { /* starting */ }
    if (!ready) await new Promise(r => setTimeout(r, 100));
  }
  assert.ok(ready, 'console startup: ' + log);
  const call = async (route, body) => {
    const r = await fetch(base + route, { method: body ? 'POST' : 'GET', headers, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(20000) });
    return { status: r.status, j: await r.json() };
  };
  const create = async (name, chainId) => { currentChainIdHex = '0x' + chainId.toString(16); return call('/api/create', { name, chainId }); };
  const dockerLog = () => existsSync(path.join(scratch, 'fake-docker.log')) ? readFileSync(path.join(scratch, 'fake-docker.log'), 'utf8').trim().split('\n') : [];
  const readLedger = () => JSON.parse(readFileSync(path.join(config, 'console-chains.json'), 'utf8'));
  const stop = async () => { if (child.exitCode === null) { const exited = once(child, 'exit'); child.kill('SIGTERM'); await exited; } children.delete(child); };
  return { call, create, dockerLog, readLedger, stop, log: () => log };
}

console.log('═══ ASSIGNMENT ON THE PRODUCT PATH — 9 synthetic services, cap 15 per node ═══');

console.log('\n── 1. V = 5: records carry validators, placement is deterministic ──');
{
  const c = await startConsole({ perChain: 5 });
  const preview = await c.call('/api/preview', { name: 'Assign Preview' });
  ok('preview names the 5 nodes the chain WOULD go to', preview.status === 200 && JSON.stringify(preview.j.validators) === JSON.stringify(['node-b', 'node-c', 'node-d', 'node-e', 'node-f']), JSON.stringify(preview.j.validators ?? preview.j.error));
  ok('preview wrote nothing', !existsSync(path.join(path.dirname(c.readLedger.toString()), 'x')) && c.dockerLog().every(l => l !== 'create'));
  const r1 = await c.create('Assign One', 9001000101);
  ok('chain 1 created (fixture CLI + 9 fake restarts)', r1.status === 200 && r1.j.chainId === 9001000101, JSON.stringify(r1.j).slice(0, 120));
  ok('chain 1 record carries validators = the 5 lowest names', JSON.stringify(r1.j.validators) === JSON.stringify(['node-b', 'node-c', 'node-d', 'node-e', 'node-f']), JSON.stringify(r1.j.validators));
  const r2 = await c.create('Assign Two', 9001000102);
  ok('chain 2 goes to the 4 idle nodes + the lowest loaded name', JSON.stringify(r2.j.validators) === JSON.stringify(['node-g', 'node-h', 'node-i', 'test-node', 'node-b']), JSON.stringify(r2.j.validators ?? r2.j.error));
  const r3 = await c.create('Assign Three', 9001000103);
  ok('chain 3 lands on c,d,e,f,g (ties by name after b took a second)', JSON.stringify(r3.j.validators) === JSON.stringify(['node-c', 'node-d', 'node-e', 'node-f', 'node-g']), JSON.stringify(r3.j.validators ?? r3.j.error));
  const ledger = c.readLedger();
  ok('the ledger on disk holds 3 records, each with 5 validators', ledger.chains.length === 3 && ledger.chains.every(x => Array.isArray(x.validators) && x.validators.length === 5));
  const load = nodeLoad(ledger.chains, SERVICES);
  ok('loads after 3 chains: b..g = 2, h/i/test-node = 1 (15 slots used)', [...load.values()].reduce((a, b) => a + b, 0) === 15 && Math.max(...load.values()) === 2 && Math.min(...load.values()) === 1, JSON.stringify([...load]));
  const status = await c.call('/api/status');
  ok('/api/status exposes validators on every chain', status.j.chains.every(x => x.validators?.length === 5));
  ok('the journal accepted a plan carrying validators (3 creates, 0 pending)', status.j.pendingCreation === null && c.dockerLog().filter(l => l === 'create').length === 3);
  await c.stop();
}

console.log('\n── 2. 🔴 a node at capacity refuses the next chain BEFORE the CLI, naming the node ──');
{
  const pinned = { chains: Array.from({ length: 15 }, (_, i) => ({ name: `Pinned ${i + 1}`, subnetID: `PinnedSubnet${i + 1}`, blockchainID: `PinnedChain${i + 1}`,
    chainId: 9001000200 + i, admin: '0x1212b2445e74f788B30BfA9C42aa46f252345a0B', validators: ['test-node'] })), retired: [] };
  const c = await startConsole({ perChain: 9, ledger: pinned });
  const r = await c.create('One Too Many', 9001000299);
  ok('refused with 400', r.status === 400, String(r.status));
  ok('…naming test-node as the full node', /At capacity[^:]*: test-node/.test(r.j.error ?? ''), (r.j.error ?? '').slice(0, 120));
  ok('…and BEFORE the CLI: no `create` in the Docker log (only the service read)', !c.dockerLog().includes('create') && c.dockerLog().includes('services'), c.dockerLog().join(','));
  ok('the ledger is untouched (still 15)', c.readLedger().chains.length === 15);
  const eight = await c.create('Eight Fits', 9001000298);
  ok('CONTROL — the same ledger with V=9 refused, but V=8 would fit: preview with 8 idle nodes is not what this console runs (V is start-up config)', eight.status === 400);
  await c.stop();
}

console.log('\n── 3. 🔴 legacy records (no key) count on EVERY node ──');
{
  const legacy = { chains: Array.from({ length: 15 }, (_, i) => ({ name: `Legacy ${i + 1}`, subnetID: `LegacySubnet${i + 1}`, blockchainID: `LegacyChain${i + 1}`,
    chainId: 9001000300 + i, admin: '0x1212b2445e74f788B30BfA9C42aa46f252345a0B' })), retired: [] };
  const c = await startConsole({ perChain: 1, ledger: legacy });
  const r = await c.create('No Room', 9001000399);
  ok('15 legacy chains fill the fleet — even V=1 is refused before the CLI', r.status === 400 && /only 0 of 9/.test(r.j.error ?? '') && !c.dockerLog().includes('create'), (r.j.error ?? '').slice(0, 100));
  await c.stop();
  const fourteen = { chains: legacy.chains.slice(0, 14), retired: [] };
  const d = await startConsole({ perChain: 9, ledger: fourteen });
  const s = await d.create('Last Slot', 9001000398);
  ok('CONTROL — 14 legacy chains leave one slot on every node: V=9 fits', s.status === 200 && s.j.validators?.length === 9, JSON.stringify(s.j.validators ?? s.j.error));
  await d.stop();
}

console.log('\n── 4. without the variable nothing changes (the model every live chain was created under) ──');
{
  const c = await startConsole();
  const preview = await c.call('/api/preview', { name: 'Old Model' });
  ok('preview says validators: null', preview.status === 200 && preview.j.validators === null, JSON.stringify(preview.j.validators));
  const r = await c.create('Old Model', 9001000401);
  ok('the record has NO validators key', r.status === 200 && !('validators' in r.j) && !('validators' in c.readLedger().chains[0]), JSON.stringify(Object.keys(r.j)));
  ok('the service list was not consulted before the CLI (old path reads it only at rollout)', c.dockerLog().indexOf('create') < c.dockerLog().indexOf('services'), c.dockerLog().join(','));
  await c.stop();
}

console.log(`\n${fail === 0 ? '✅' : '🔴'} ${pass} passed · ${fail} failed`);
node.close();
process.exitCode = fail === 0 ? 0 : 1;
