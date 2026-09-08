#!/usr/bin/env node
// Real isolated console/RPC HTTP. No operational credentials or child commands.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer, request as httpRequest } from 'node:http';
import { createServer as portServer } from 'node:net';
import { randomUUID } from 'node:crypto';
import { Wallet } from 'ethers';
import { consoleConfigurationFingerprint, readConsoleReadiness, CONSOLE_CONFIGURATION_KEYS,
  CONSOLE_CONFIGURATION_EXCLUSIONS } from '../lib/console-readiness.mjs';
import { A1_PARENT_EVM_CHAIN_ID } from '../lib/chainid.mjs';
import { CreationJournal } from '../lib/creation-journal.mjs';
import { resolveGraph } from '../lib/import-graph.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
fs.mkdirSync(path.join(root, 'work'), { recursive: true });
const scratch = fs.mkdtempSync(path.join(root, 'work/readiness-console-'));
const config = path.join(scratch, '9chain-a1-config'); fs.mkdirSync(config);
const page = path.join(scratch, 'local-net/console'); fs.mkdirSync(page, { recursive: true });
fs.copyFileSync(path.join(root, 'local-net/console/index.html'), path.join(page, 'index.html'));
const ledgerFile = path.join(config, 'console-chains.json');
const ledger = Buffer.from(JSON.stringify({ chains: [{ name: 'SyntheticReadinessChain' }], retired: [] })); fs.writeFileSync(ledgerFile, ledger);
const token = 'synthetic-readiness-operator-' + randomUUID(), secret = 'synthetic-node-error-that-must-not-leak';
const preload = path.join(scratch, 'deny-processes.mjs');
fs.writeFileSync(preload, "import cp from 'node:child_process'; import fs from 'node:fs'; import http from 'node:http'; import {syncBuiltinESMExports} from 'node:module';\n" +
  "const create=http.createServer; http.createServer=listener=>create((req,res)=>{if(req.headers['x-fixture-change-configuration']==='1') process.env.A1_MAX_L1='14'; return listener(req,res);});\n" +
  `for(const name of ['exec','execFile','spawn','fork','execSync','execFileSync','spawnSync']) cp[name]=()=>{fs.writeFileSync(${JSON.stringify(path.join(scratch, 'unexpected-process'))},'Blocked');throw new Error('Child commands forbidden in readiness fixture');}; syncBuiltinESMExports();\n`);
let mode = 'ok', rpcCalls = 0;
const rpc = createServer(async (req, res) => {
  let text = ''; for await (const chunk of req) text += chunk;
  const { method, id } = JSON.parse(text); rpcCalls++;
  res.setHeader('content-type', 'application/json');
  if (mode === 'hang' && method === 'info.getNetworkID') return;
  if (mode === 'large' && method === 'info.getNetworkID') { res.end(JSON.stringify({ jsonrpc: '2.0', id, result: { networkID: '999999998', extra: 'x'.repeat(65536) } })); return; }
  if (mode === 'error' && method === 'info.getNetworkID') { res.end(JSON.stringify({ jsonrpc: '2.0', id, error: { message: secret } })); return; }
  let result = method === 'info.getNetworkID' ? { networkID: mode === 'wrong-id' ? '999999997' : mode === 'hex-id' ? '0x3b9ac9fe' : '999999998' } :
    method === 'info.getNetworkName' ? { networkName: mode === 'wrong-name' ? '9chain-a1' : '9chain-a1-g1' } :
    method === 'info.getNodeVersion' ? { version: mode === 'bad-version' ? secret : '9chaingo/1.14.2' } :
    mode === 'wrong-chain' ? '0x1' : mode === 'numeric-chain' ? 9000000009 : '0x218711a09';
  res.end(JSON.stringify({ jsonrpc: '2.0', id: mode === 'wrong-envelope' ? 2 : id, result }));
});
rpc.listen(0, '127.0.0.1'); await once(rpc, 'listening');
const reservation = portServer(); reservation.listen(0, '127.0.0.1'); await once(reservation, 'listening');
const port = reservation.address().port; await new Promise(resolve => reservation.close(resolve));
const base = 'http://127.0.0.1:' + port;
const env = { ...process.env, NODE_OPTIONS: '', PORT: String(port), NODE_URI: 'http://127.0.0.1:' + rpc.address().port,
  A1_CONSOLE_HOST: '127.0.0.1', A1_CONSOLE_TOKEN: token, A1_CLI_KEY: 'PrivateKey-invalid-synthetic-only',
  A1_CONSOLE_START_PAUSED: '0', A1_DE_CHAIN_MO: '1', A1_COMPOSE_FILE: path.join(scratch, 'missing-compose.yml'),
  A1_CONSOLE_DOMAIN: 'readiness-fixture.invalid', A1_CONSOLE_URI: 'https://readiness-fixture.invalid/console', A1_L1_ALLOWLIST: '' };
const configurationSha256 = consoleConfigurationFingerprint(env);
const child = spawn(process.execPath, ['--import', pathToFileURL(preload).href, path.join(root, 'local-net/console/server.mjs')],
  { cwd: scratch, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
let logs = '', checks = 0, slow;
child.stdout.on('data', bytes => { logs += bytes; }); child.stderr.on('data', bytes => { logs += bytes; });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function call(route, { credential = token, method = 'GET', body, headers = {} } = {}) {
  const response = await fetch(base + route, { method, headers: { 'content-type': 'application/json', ...(credential ? { authorization: 'Bearer ' + credential } : {}), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(6000) });
  const text = await response.text(); assert.equal(text.includes(token), false); assert.equal(text.includes(secret), false);
  return { status: response.status, body: JSON.parse(text), cache: response.headers.get('cache-control') };
}
async function probe(expected = 200, reason) {
  const probeId = randomUUID(); const reply = await call('/api/maintenance/readiness?probeId=' + probeId);
  assert.equal(reply.status, expected, JSON.stringify(reply.body)); assert.equal(reply.body.probeId, probeId);
  assert.equal(reply.cache, 'no-store'); assert.equal(reply.body.configurationSha256, configurationSha256);
  assert.equal(reply.body.healthy, expected === 200); if (reason) assert.ok(reply.body.reasons.includes(reason), JSON.stringify(reply.body));
  checks++; return reply.body;
}
try {
  for (let attempt = 0; ; attempt++) {
    try { if ((await call('/api/maintenance')).status === 200) break; } catch { /* Wait for this isolated child. */ }
    if (attempt >= 100 || child.exitCode !== null) throw new Error('Readiness console failed to start: ' + logs);
    await delay(30);
  }
  assert.equal(A1_PARENT_EVM_CHAIN_ID, 9000000009); checks++;
  // 🔴 EVERY file the console reaches, not just server.mjs (D-249).
  //
  // This scan is what keeps the configuration fingerprint honest: every environment variable the
  // console reads must be declared in CONSOLE_CONFIGURATION_KEYS, so a restart that changes
  // behaviour cannot look identical. Reading ONE file made that property depend on where the code
  // happens to live — lift a single environment read into a helper module and this test stops
  // seeing it, the fingerprint silently stops covering it, and the test STAYS GREEN.
  //
  // That mattered on 2026-09-08, when server.mjs (2 927 lines) was about to be split. A source
  // scan does not follow the code when the code moves, and nothing would have said so.
  //
  // ⚠️ The scan reads COMMENTS as code, and that is left alone on purpose: a variable named in a
  // comment costs a false red a person clears in seconds, while a variable missed costs a console
  // whose fingerprint does not cover it. Same trade as relativeImports. (This very comment caused
  // one: an earlier draft spelled out an environment read inline and the scan duly reported it.)
  const reachedFiles = [...resolveGraph(['local-net/console/server.mjs'],
    (rel) => { try { return fs.readFileSync(path.join(root, rel), 'utf8'); } catch { return null; } }).reached];
  const source = reachedFiles
    .map((rel) => { try { return fs.readFileSync(path.join(root, rel), 'utf8'); } catch { return ''; } })
    .join('\n');
  assert.ok(reachedFiles.length > 10, `the console reaches ${reachedFiles.length} files — the walk failed`);
  // 🔴 The counter-check for the widening itself. Scanning only server.mjs must find STRICTLY
  // FEWER environment reads than scanning the graph — if the two sets were equal, this change
  // would be decoration, and the day someone moved a read out of server.mjs it would go quiet
  // again with nothing to show for it.
  const envNames = (text) => new Set([...text.matchAll(/process\.env\.([A-Z0-9_]+)|require(?:Secret|Int)\(["']([A-Z0-9_]+)["']/g)]
    .map(match => match[1] || match[2]));
  const serverOnly = envNames(fs.readFileSync(path.join(root, 'local-net/console/server.mjs'), 'utf8'));
  const wholeGraph = envNames(source);
  assert.ok([...serverOnly].every(name => wholeGraph.has(name)),
    'the wider scan must be a SUPERSET: widening may add coverage, never remove it');
  // Today every environment read still lives in server.mjs, so the walk adds no NAMES yet — it is
  // insurance taken out before the split, not coverage already gained. What has to be proved now
  // is the MECHANISM: that a read living one module away really is found. Proved over a fake tree
  // through the same resolveGraph, which is what its injectable readFile exists for.
  const fakeTree = {
    'a/entry.mjs': 'import { helper } from "./helper.mjs";\nconst port = process.env.PORT;\n',
    'a/helper.mjs': 'export const helper = () => process.env.A1_MOVED_INTO_A_HELPER;\n',
  };
  const fakeReached = [...resolveGraph(['a/entry.mjs'], (rel) => fakeTree[rel] ?? null).reached];
  const fakeWhole = envNames(fakeReached.map((rel) => fakeTree[rel] ?? '').join('\n'));
  assert.ok(!envNames(fakeTree['a/entry.mjs']).has('A1_MOVED_INTO_A_HELPER'),
    'the control is broken: the entry file must NOT contain the moved read');
  assert.ok(fakeWhole.has('A1_MOVED_INTO_A_HELPER'),
    '🔴 a read moved one module away was NOT found — this is the exact silent gap D-249 closes');
  assert.deepEqual(fakeReached.sort(), ['a/entry.mjs', 'a/helper.mjs']);
  checks++;
  const referenced = new Set([...source.matchAll(/process\.env\.([A-Z0-9_]+)|require(?:Secret|Int)\(["']([A-Z0-9_]+)["']/g)].map(match => match[1] || match[2]));
  const missing = text => [...new Set([...text.matchAll(/process\.env\.([A-Z0-9_]+)|require(?:Secret|Int)\(["']([A-Z0-9_]+)["']/g)].map(match => match[1] || match[2]))]
    .filter(name => !CONSOLE_CONFIGURATION_KEYS.includes(name) && !CONSOLE_CONFIGURATION_EXCLUSIONS.includes(name));
  assert.ok(referenced.has('A1_CLI_KEY') && referenced.has('A1_MAX_L1'));
  assert.deepEqual(missing(source), []); assert.deepEqual(missing(source + '\nprocess.env.A1_UNTRACKED_READINESS_TEST'), ['A1_UNTRACKED_READINESS_TEST']); checks++;
  assert.equal(consoleConfigurationFingerprint({ ...env, A1_CONSOLE_START_PAUSED: '1' }), configurationSha256); checks++;
  assert.notEqual(consoleConfigurationFingerprint({ ...env, A1_CLI_KEY: 'different-synthetic-key' }), configurationSha256); checks++;
  assert.notEqual(consoleConfigurationFingerprint({ ...env, A1_MAX_L1: '14' }), configurationSha256); checks++;
  // The existing boot diagnostic makes two asynchronous RPC calls. Let those
  // finish before attributing any later call to these HTTP admission controls.
  for (let attempt = 0; rpcCalls < 2 && attempt < 100; attempt++) await delay(10);
  assert.equal(rpcCalls, 2);
  const beforeAuth = rpcCalls;
  assert.equal((await call('/api/maintenance/readiness?probeId=' + randomUUID(), { credential: '' })).status, 401); checks++;
  assert.equal((await call('/api/maintenance/readiness')).status, 400); checks++;
  assert.equal((await call('/api/maintenance/readiness?probeId=' + randomUUID() + '&probeId=' + randomUUID())).status, 400); checks++;
  assert.equal(rpcCalls, beforeAuth, 'Unauthorized or malformed readiness must not query the node');
  const wallet = Wallet.createRandom(), nonce = await call('/api/siwe/nonce?address=' + wallet.address, { credential: '' });
  const login = await call('/api/siwe/login', { credential: '', method: 'POST', body: { nonce: nonce.body.nonce, signature: await wallet.signMessage(nonce.body.message) } });
  assert.equal(login.status, 200);
  assert.equal((await call('/api/maintenance/readiness?probeId=' + randomUUID(), { credential: login.body.token })).status, 403); checks++;
  const initial = await probe(); assert.deepEqual(initial.ledger, { chains: 1, retired: 0 }); assert.equal(initial.maintenance.paused, false);
  for (const [scenario, reason] of [['wrong-id', 'network-id-mismatch'], ['hex-id', 'network-id-mismatch'], ['wrong-name', 'network-name-mismatch'],
    ['wrong-chain', 'parent-chain-mismatch'], ['numeric-chain', 'parent-chain-mismatch'], ['bad-version', 'node-version-invalid'],
    ['wrong-envelope', 'network-id-unavailable'], ['error', 'network-id-unavailable'], ['large', 'network-id-unavailable'], ['hang', 'network-id-unavailable']]) {
    mode = scenario; const started = Date.now(); await probe(503, reason);
    assert.ok(Date.now() - started < 4500, 'Node readiness must be bounded');
  }
  mode = 'ok';
  fs.writeFileSync(ledgerFile, '{broken ' + secret); await probe(503, 'ledger-unreadable'); fs.writeFileSync(ledgerFile, ledger);
  fs.writeFileSync(ledgerFile + '.tmp', secret); await probe(503, 'ledger-unreadable'); fs.unlinkSync(ledgerFile + '.tmp');
  const journal = new CreationJournal(config);
  const job = journal.begin({ name: 'ReadinessPending', chainId: 9001000901, ADMIN: wallet.address, tpl: { config: { chainId: 9001000901 } } }, 999999998);
  await probe(503, 'creation-pending');
  const pending = path.join(config, 'creation-journal/pending.json'), pendingBytes = fs.readFileSync(pending);
  fs.writeFileSync(pending, '{broken ' + secret); await probe(503, 'creation-journal-unreadable');
  fs.writeFileSync(pending, pendingBytes); fs.renameSync(pending, path.join(scratch, 'retained-pending-' + job.id + '.json'));
  slow = httpRequest(base + '/api/create', { method: 'POST', headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' } });
  slow.on('error', () => {}); slow.write('{');
  for (let count = 0; count < 50 && (await call('/api/maintenance')).body.activeOperations === 0; count++) await delay(20);
  const paused = (await call('/api/maintenance/pause', { method: 'POST' })).body;
  assert.equal(paused.activeOperations, 1);
  const options = { url: base, token, configurationSha256, instanceId: paused.instanceId, maintenanceId: paused.maintenanceId };
  await assert.rejects(readConsoleReadiness(options), /drained paused process/); checks++;
  slow.destroy(); slow = null;
  for (let count = 0; count < 50 && !(await call('/api/maintenance')).body.readyForRestart; count++) await delay(20);
  const ready = await readConsoleReadiness(options); assert.equal(ready.healthy, true); checks++;
  await assert.rejects(readConsoleReadiness({ ...options, configurationSha256: consoleConfigurationFingerprint({ ...env, A1_MAX_L1: '14' }) }), /different startup configuration/); checks++;
  await assert.rejects(readConsoleReadiness({ ...options, instanceId: randomUUID() }), /drained paused process/); checks++;
  await assert.rejects(readConsoleReadiness({ ...options, maintenanceId: randomUUID() }), /drained paused process/); checks++;
  const afterEnvironmentChange = await call('/api/maintenance/readiness?probeId=' + randomUUID(), { headers: { 'x-fixture-change-configuration': '1' } });
  assert.equal(afterEnvironmentChange.status, 200);
  assert.equal(afterEnvironmentChange.body.configurationSha256, configurationSha256, 'Readiness must identify loaded startup values, not the subsequently changed environment'); checks++;
  await probe();
  assert.deepEqual(fs.readFileSync(ledgerFile), ledger); assert.equal(fs.existsSync(path.join(scratch, 'unexpected-process')), false);
  assert.deepEqual(fs.readdirSync(path.join(config, 'console-tmp')), []); assert.equal(fs.existsSync(pending), false);
  console.log('PASS: ' + checks + ' actual console/configuration readiness checks; fresh RPC, operator access, body/time bounds, unresolved state and startup identity; no child command or chain creation');
} finally {
  slow?.destroy(); if (child.exitCode === null) { child.kill('SIGTERM'); await once(child, 'exit'); }
  rpc.closeAllConnections(); await new Promise(resolve => rpc.close(resolve));
  fs.writeFileSync(path.join(scratch, 'console.log'), logs); console.log('Synthetic readiness evidence retained: ' + scratch);
}
