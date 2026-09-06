#!/usr/bin/env node
// Actual CLI, real local files and HTTP. The node fixture accepts read methods only.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, readdirSync, renameSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CreationJournal, creationGenesisText } from '../local-net/lib/creation-journal.mjs';
import { cb58Encode } from '../local-net/lib/cb58.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
mkdirSync(path.join(root, 'work'), { recursive: true });
const scratch = mkdtempSync(path.join(root, 'work/inspect-creation-test-'));
const networkID = 999999998, chainId = 9001000789;
const blockchainID = cb58Encode(Buffer.alloc(32, 1)), subnetID = cb58Encode(Buffer.alloc(32, 2));
const vmID = cb58Encode(Buffer.alloc(32, 3)), pChainID = cb58Encode(Buffer.alloc(32));
const marker = 'PrivateKey-synthetic-inspection-marker';
const plan = { name: 'Inspection Test', chainId, tpl: { config: { chainId }, alloc: {} }, syntheticPrivateMarker: marker };
const goodTransaction = () => ({ encoding: 'json', tx: { id: blockchainID, unsignedTx: {
  networkID, blockchainID: pChainID, subnetID, vmID, chainName: plan.name,
  genesisData: Buffer.from(creationGenesisText(plan)).toString('base64') }, credentials: [] } });
let scenario = 'good', calls = [], activeDirectory;
const node = createServer(async (request, response) => {
  let text = '';
  for await (const chunk of request) text += chunk;
  const { method, params, id } = JSON.parse(text);
  calls.push({ method, params, path: request.url });
  const send = result => { response.writeHead(200, { 'content-type': 'application/json' }); response.end(JSON.stringify({ jsonrpc: '2.0', id, result })); };
  if (scenario === 'timeout') return;
  if (method === 'info.getNetworkID' && request.url === '/ext/info') {
    if (scenario === 'changed-files') writeFileSync(path.join(activeDirectory, 'console-chains.json'), '{changed-during-inspection');
    send({ networkID: scenario === 'wrong-network' ? 1 : scenario === 'bad-network' ? null : String(networkID) }); return;
  }
  if (method === 'platform.getTxStatus' && request.url === '/ext/bc/P') {
    send({ status: scenario === 'unknown-tx' ? 'Unknown' : 'Committed' }); return;
  }
  if (method === 'platform.getTx' && request.url === '/ext/bc/P') {
    const result = goodTransaction();
    if (scenario === 'wrong-genesis') result.tx.unsignedTx.genesisData = Buffer.from('{}').toString('base64');
    if (scenario === 'bad-base64') result.tx.unsignedTx.genesisData = '*not-base64*';
    if (scenario === 'wrong-tx-id') result.tx.id = subnetID;
    if (scenario === 'wrong-subnet') result.tx.unsignedTx.subnetID = blockchainID;
    if (scenario === 'wrong-name') result.tx.unsignedTx.chainName = 'Another Chain';
    if (scenario === 'wrong-parent-chain') result.tx.unsignedTx.blockchainID = blockchainID;
    if (scenario === 'wrong-tx-network') result.tx.unsignedTx.networkID = 1;
    if (scenario === 'missing-vm') delete result.tx.unsignedTx.vmID;
    send(result); return;
  }
  if (method === 'eth_chainId' && request.url === `/ext/bc/${blockchainID}/rpc`) {
    send(scenario === 'wrong-evm' ? '0x1' : '0x' + chainId.toString(16)); return;
  }
  response.writeHead(500); response.end('Unexpected method or path: no mutation is supported');
});
node.listen(0, '127.0.0.1');
await once(node, 'listening');
const origin = `http://127.0.0.1:${node.address().port}`;
const children = new Set();
process.on('exit', () => { for (const child of children) child.kill(); });
function files(directory) {
  const result = {};
  for (const entry of readdirSync(directory, { recursive: true, withFileTypes: true })) {
    if (entry.isFile()) {
      const file = path.join(entry.parentPath, entry.name);
      result[path.relative(directory, file)] = createHash('sha256').update(readFileSync(file)).digest('hex');
    }
  }
  return result;
}
async function run(args) {
  const child = spawn(process.execPath, [path.join(root, 'scripts/inspect-creation.mjs'), ...args],
    { cwd: scratch, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  children.add(child);
  let stdout = '', stderr = '';
  child.stdout.on('data', chunk => { stdout += chunk; });
  child.stderr.on('data', chunk => { stderr += chunk; });
  const timer = setTimeout(() => child.kill(), 15000);
  try {
    const [code, signal] = await once(child, 'exit');
    assert.equal(signal, null, 'inspection must exit before the independent test deadline');
    return { code, stdout, stderr, report: stdout.trim().startsWith('{') ? JSON.parse(stdout) : null };
  } finally { clearTimeout(timer); children.delete(child); }
}
let passed = 0;
async function check(label, { phase = 'created', rpc = true, mutate, expectedCode = 1, expectedCheck, candidate } = {}) {
  scenario = label; calls = [];
  const directory = mkdtempSync(path.join(scratch, 'case-')); activeDirectory = directory;
  const journal = new CreationJournal(directory);
  if (phase) {
    const job = journal.begin(plan, networkID);
    if (phase !== 'prepared') journal.update(job, { phase: 'submitting' });
    if (['created', 'complete'].includes(phase)) journal.update(job, { phase: 'created', blockchainID, subnetID });
    if (phase === 'complete') journal.update(job, { phase: 'complete' });
  }
  if (mutate) mutate(directory);
  const before = files(directory);
  const result = await run(['--config-dir', directory, ...(rpc ? ['--rpc', origin, '--timeout-ms', '100'] : []),
    ...(candidate ? ['--blockchain-id', candidate] : [])]);
  assert.equal(result.code, expectedCode, `${label}: ${result.stderr || result.stdout}`);
  assert.equal(result.report.recoveryAuthorized, false, 'even matching evidence must never authorize recovery');
  if (expectedCheck) assert.ok(result.report.checks.some(check => check.code === expectedCheck[0] && check.status === expectedCheck[1]),
    `${label}: expected ${expectedCheck.join('/')} in ${result.stdout}`);
  assert.equal(result.stdout.includes(marker), false, 'report must not dump the full stored plan');
  assert.equal(result.stdout.includes('genesisData'), false, 'report must not dump raw RPC transactions');
  if (label !== 'changed-files') assert.deepEqual(files(directory), before, `${label}: inspection must not write, rename or delete artifacts`);
  assert.ok(calls.every(call => ['info.getNetworkID', 'platform.getTxStatus', 'platform.getTx', 'eth_chainId'].includes(call.method)),
    'only the four read methods may be used');
  if (!rpc || !phase || label === 'corrupt-journal') assert.equal(calls.length, 0);
  if (rpc && (['wrong-network', 'bad-network', 'timeout'].includes(label) || (phase === 'submitting' && !candidate))) {
    assert.deepEqual(calls.map(call => call.method), ['info.getNetworkID'], 'stop before identity-unscoped chain reads');
  }
  if (['wrong-genesis', 'wrong-name', 'wrong-subnet', 'wrong-tx-network', 'wrong-parent-chain', 'unknown-tx'].includes(label)) {
    assert.equal(calls.some(call => call.method === 'eth_chainId'), false, 'do not trust an EVM response for an unverified creation');
  }
  passed++; console.log(`PASS: ${label}`);
}
try {
  await check('empty-directory', { phase: null, rpc: false, expectedCode: 0, expectedCheck: ['journal_absent', 'note'] });
  await check('candidate-without-journal', { phase: null, candidate: blockchainID, expectedCode: 2, expectedCheck: ['candidate_unscoped', 'unknown'] });
  await check('prepared-offline', { phase: 'prepared', rpc: false, expectedCheck: ['journal', 'match'] });
  await check('submitting-without-id', { phase: 'submitting', expectedCheck: ['submission_unresolved', 'note'] });
  await check('candidate-after-lost-response', { phase: 'submitting', candidate: blockchainID, expectedCheck: ['transaction_identity', 'match'] });
  await check('good', { expectedCheck: ['evm_identity', 'match'] });
  await check('candidate-disagrees-with-journal', { candidate: subnetID, expectedCheck: ['candidate_identifier', 'conflict'] });
  await check('complete-with-ledger', { phase: 'complete', expectedCheck: ['ledger_identity', 'match'], mutate: directory => {
    writeFileSync(path.join(directory, 'console-chains.json'), JSON.stringify({ chains: [{ name: plan.name, chainId, subnetID, blockchainID }] }));
  } });
  await check('complete-without-ledger', { phase: 'complete', rpc: false, expectedCheck: ['complete_ledger_missing', 'conflict'] });
  await check('duplicate-ledger-identities', { rpc: false, expectedCheck: ['ledger_identity', 'conflict'], mutate: directory => {
    const chain = { name: plan.name, chainId, subnetID, blockchainID };
    writeFileSync(path.join(directory, 'console-chains.json'), JSON.stringify({ chains: [chain, chain] }));
  } });
  await check('retired-ledger-identity', { rpc: false, expectedCheck: ['ledger_identity', 'conflict'], mutate: directory => {
    writeFileSync(path.join(directory, 'console-chains.json'), JSON.stringify({ chains: [], retired: [{ name: plan.name, chainId, subnetID, blockchainID }] }));
  } });
  await check('corrupt-ledger', { rpc: false, expectedCode: 2, expectedCheck: ['ledger_invalid', 'unknown'], mutate: directory => {
    writeFileSync(path.join(directory, 'console-chains.json'), '{broken');
  } });
  for (const label of ['wrong-genesis', 'wrong-name', 'wrong-subnet', 'wrong-tx-network', 'wrong-parent-chain']) {
    await check(label, { expectedCheck: ['transaction_identity', 'conflict'] });
  }
  await check('wrong-evm', { expectedCheck: ['evm_identity', 'conflict'] });
  await check('wrong-network', { expectedCheck: ['network_identity', 'conflict'] });
  await check('bad-network', { expectedCode: 2, expectedCheck: ['network_identity', 'unknown'] });
  await check('unknown-tx', { expectedCode: 2, expectedCheck: ['transaction_status', 'unknown'] });
  for (const label of ['wrong-tx-id', 'missing-vm']) await check(label, { expectedCode: 2, expectedCheck: ['transaction_shape', 'unknown'] });
  await check('bad-base64', { expectedCode: 2, expectedCheck: ['genesis_encoding', 'unknown'] });
  await check('timeout', { expectedCode: 2, expectedCheck: ['info.getNetworkID', 'unknown'] });
  await check('changed-files', { expectedCode: 2, expectedCheck: ['evidence_changed', 'unknown'] });
  await check('corrupt-journal', { expectedCode: 2, expectedCheck: ['journal_invalid', 'unknown'], mutate: directory => {
    writeFileSync(path.join(directory, 'creation-journal/pending.json'), '{broken');
  } });
  await check('missing-primary-with-backup', { rpc: false, expectedCode: 2, expectedCheck: ['ledger_missing', 'unknown'], mutate: directory => {
    writeFileSync(path.join(directory, 'console-chains.json.bak'), JSON.stringify({ chains: [] }));
  } });
  await check('stranded-journal-without-primary', { phase: 'submitting', rpc: false, expectedCheck: ['unfinished_write', 'conflict'], mutate: directory => {
    renameSync(path.join(directory, 'creation-journal/pending.json'), path.join(directory, 'creation-journal/pending.json.tmp'));
  } });
  const invalid = await run(['--config-dir', scratch, '--rpc', 'http://synthetic-user:synthetic-secret@localhost']);
  assert.equal(invalid.code, 2); assert.equal(invalid.stderr.includes('synthetic-secret'), false);
  const forbidden = await run(['--config-dir', scratch, '--resume', 'yes']);
  assert.equal(forbidden.code, 2); assert.match(forbidden.stderr, /Usage:/);
  console.log(`PASS: ${passed} actual CLI scenarios plus credential-URL and mutation-flag refusal. No public calls or artifact changes.`);
} finally {
  node.closeAllConnections();
  await new Promise(resolve => node.close(resolve));
}
