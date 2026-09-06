#!/usr/bin/env node
// Actual CLI/files/HTTP; no signing, chain mutation or implicit public requests.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { cb58Encode } from '../local-net/lib/cb58.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
fs.mkdirSync(path.join(root, 'work'), { recursive: true });
const scratch = fs.mkdtempSync(path.join(root, 'work/inventory-test-'));
const makeId = value => cb58Encode(Buffer.alloc(32, value));
const C = makeId(1), X = makeId(2), chain = makeId(3), subnet = makeId(4), vm = makeId(5), zero = makeId(0);
const marker = 'PrivateKey-synthetic-inventory-marker';
const registered = () => [
  { id: C, subnetID: zero, vmID: vm, name: 'C-Chain' },
  { id: X, subnetID: zero, vmID: vm, name: 'X-Chain' },
  { id: chain, subnetID: subnet, vmID: vm, name: 'Recorded Chain', unrelatedSecret: marker },
];
const record = () => ({ name: 'Recorded Chain', subnetID: subnet, blockchainID: chain, chainId: 9001000007,
  admin: marker, rpc: 'http://never-contact.invalid', irrelevantSecret: marker });
let scenario = '', calls = [], inventories = 0, ledgerFile, activeDir, changed = false, redirects = 0;
const allowed = new Set(['info.getNetworkID', 'info.getNetworkName', 'info.getBlockchainID', 'platform.getBlockchains']);
const server = createServer(async (request, response) => {
  if (request.url === '/redirect-target') { redirects++; response.end('should never follow'); return; }
  let body = ''; for await (const chunk of request) body += chunk;
  const { method, params, id } = JSON.parse(body); calls.push({ method, params, path: request.url });
  if (!allowed.has(method)) { response.writeHead(500); response.end('Mutation is unsupported'); return; }
  if (scenario === 'headers-timeout') return;
  if (scenario === 'body-timeout') { response.writeHead(200, { 'content-type': 'application/json' }); response.write('{'); return; }
  if (scenario === 'redirect') { response.writeHead(302, { location: '/redirect-target' }); response.end(); return; }
  const send = value => {
    if (scenario === 'http201') { response.writeHead(201, { 'content-type': 'application/json' }); response.end(JSON.stringify({ jsonrpc: '2.0', id, result: value })); return; }
    if (scenario === 'http503') { response.writeHead(503); response.end(marker); return; }
    if (scenario === 'wrong-type') { response.writeHead(200, { 'content-type': 'text/plain' }); response.end(marker); return; }
    response.writeHead(200, { 'content-type': 'application/json' });
    if (scenario === 'bad-json') { response.end('{'+marker); return; }
    if (scenario === 'rpc-error') { response.end(JSON.stringify({ jsonrpc: '2.0', id, error: { code: -1, message: marker } })); return; }
    response.end(JSON.stringify({ jsonrpc: '2.0', id: scenario === 'wrong-id' ? 2 : id, result: value, ignored: marker }));
  };
  if (scenario === 'ledger-changed' && !changed) { changed = true; fs.appendFileSync(ledgerFile, ' '); }
  if (scenario === 'pending-write-created' && !changed) { changed = true; fs.writeFileSync(ledgerFile + '.tmp', marker); }
  if (method === 'info.getNetworkID') {
    send({ networkID: scenario === 'wrong-network' || scenario === 'changed-network' && inventories === 2 ? '1' : scenario === 'bad-network-type' ? [999999998] : '999999998' }); return;
  }
  if (method === 'info.getNetworkName') { send({ networkName: scenario === 'wrong-network-name' ? '9chain-a1' : '9chain-a1-g1' }); return; }
  if (method === 'info.getBlockchainID') {
    send({ blockchainID: scenario === 'invalid-alias' ? marker : scenario === 'duplicate-alias' ? C :
      scenario === 'changed-alias' && inventories === 2 ? makeId(9) : params.alias === 'C' ? C : X }); return;
  }
  inventories++;
  if (scenario === 'inventory-headers-timeout') return;
  if (scenario === 'inventory-body-timeout') { response.writeHead(200, { 'content-type': 'application/json' }); response.write('{'); return; }
  let values = registered();
  if (['unlisted', 'unlisted-same-name'].includes(scenario)) values.push({ ...values[2], id: makeId(6), name: scenario === 'unlisted-same-name' ? values[2].name : 'Unlisted Chain' });
  if (scenario === 'missing-active') values = values.slice(0, 2);
  if (scenario === 'wrong-subnet') values[2].subnetID = makeId(6);
  if (scenario === 'wrong-chain-name') values[2].name = 'Different Chain';
  if (scenario === 'wrong-vm') values[2].vmID = makeId(6);
  if (scenario === 'duplicate-inventory') values.push(values[2]);
  if (scenario === 'bad-chain-id') values[2].id = marker;
  if (scenario === 'bad-subnet-id') values[2].subnetID = marker;
  if (scenario === 'bad-vm-id') values[2].vmID = marker;
  if (scenario === 'oversized-name') values[2].name = 'x'.repeat(129);
  if (scenario === 'malformed-entry') values[2] = null;
  if (scenario === 'missing-primary') values = values.slice(1);
  if (scenario === 'wrong-primary-subnet') values[0].subnetID = subnet;
  if (scenario === 'unlisted-primary') values.push({ ...values[0], id: makeId(6) });
  if (scenario === 'inventory-changed' && inventories === 2) values.push({ ...values[2], id: makeId(6) });
  if (scenario === 'order-changed' && inventories === 2) values.reverse();
  if (scenario === 'empty-inventory') values = [];
  if (scenario === 'too-many-entries') values = Array(10001).fill(values[2]);
  if (scenario === 'huge-reply') { send({ blockchains: values, unrelatedSecret: 'x'.repeat(4 * 1024 * 1024) }); return; }
  if (scenario === 'malformed-inventory') { send({ blockchains: null }); return; }
  send({ blockchains: values, ignored: marker });
});
server.listen(0, '127.0.0.1'); await once(server, 'listening');
const origin = `http://127.0.0.1:${server.address().port}`, children = new Set();
process.on('exit', () => { for (const child of children) child.kill(); });
function files(dir) {
  return Object.fromEntries(fs.readdirSync(dir, { withFileTypes: true }).map(entry => [entry.name,
    entry.isFile() ? createHash('sha256').update(fs.readFileSync(path.join(dir, entry.name))).digest('hex') : 'directory']));
}
async function cli(args) {
  const child = spawn(process.execPath, [path.join(root, 'scripts/inspect-chain-inventory.mjs'), ...args],
    { cwd: scratch, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  children.add(child); let stdout = '', stderr = '';
  child.stdout.on('data', bytes => { stdout += bytes; }); child.stderr.on('data', bytes => { stderr += bytes; });
  const timer = setTimeout(() => child.kill(), 10000);
  try { const [code, signal] = await once(child, 'close'); assert.equal(signal, null, 'CLI must exit within independent timeout');
    return { code, stdout, stderr, report: stdout.trim().startsWith('{') ? JSON.parse(stdout) : null }; }
  finally { clearTimeout(timer); children.delete(child); }
}
let checks = 0;
async function check(label, expected = 0, mutate, code) {
  scenario = label; calls = []; inventories = 0; changed = false;
  activeDir = fs.mkdtempSync(path.join(scratch, 'case-')); ledgerFile = path.join(activeDir, 'ledger.json');
  const ledger = { chains: [record()], retired: [] };
  if (mutate) mutate(ledger);
  fs.writeFileSync(ledgerFile, JSON.stringify(ledger));
  if (label === 'bad-ledger-json') fs.writeFileSync(ledgerFile, '{'+marker);
  if (label === 'unfinished-write') fs.writeFileSync(ledgerFile + '.tmp', marker);
  if (label === 'missing-ledger') fs.renameSync(ledgerFile, path.join(activeDir, 'retained.json'));
  if (label === 'ledger-directory') { fs.renameSync(ledgerFile, path.join(activeDir, 'retained.json')); fs.mkdirSync(ledgerFile); }
  if (label === 'large-ledger') fs.writeFileSync(ledgerFile, 'x'.repeat(4 * 1024 * 1024 + 1));
  const before = files(activeDir), started = Date.now();
  const result = await cli(['--ledger-file', ledgerFile, '--rpc', origin, '--timeout-ms', '250']);
  assert.equal(result.code, expected, label + ': ' + result.stderr + result.stdout);
  assert.equal(result.report.recoveryAuthorized, false);
  if (code) assert.ok(result.report.checks.some(check => check.code === code), label + ': missing ' + code);
  assert.equal(result.stdout.includes(marker), false, 'no raw errors, unused ledger or RPC fields are exposed');
  assert.ok(calls.every(call => allowed.has(call.method) && call.path === (call.method.startsWith('info.') ? '/ext/info' : '/ext/bc/P')));
  assert.ok(calls.filter(call => call.method === 'info.getBlockchainID').every(call => ['C','X'].includes(call.params.alias)));
  assert.ok(calls.length <= 10, 'bounded fixed read calls; never fetch per-chain URLs from ledger');
  if (!['ledger-changed', 'pending-write-created'].includes(label)) assert.deepEqual(files(activeDir), before, 'CLI is read-only');
  if (code === 'ledger_unreadable_or_incomplete') assert.equal(calls.length, 0, 'bad local evidence stops before network');
  if (code === 'network_identity_unavailable_or_mismatch') assert.equal(inventories, 0, 'bad network stops before inventory');
  if (['headers-timeout', 'body-timeout', 'inventory-headers-timeout', 'inventory-body-timeout'].includes(label)) assert.ok(Date.now() - started < 3000, 'timeout covers headers/body');
  if (label === 'matched') { assert.deepEqual(result.report.counts, { primary: 2, active: 1, retired: 0, unlisted: 0, registered: 3 }); assert.equal(result.report.active[0].status, 'matched'); }
  if (['unlisted','unlisted-same-name','unlisted-primary'].includes(label)) assert.equal(result.report.unlisted.length,1);
  if (label === 'retired-registered') { assert.equal(result.report.retired[0].status, 'matched'); assert.equal(result.report.unlisted.length,0); }
  if (label === 'retired-absent') assert.equal(result.report.retired[0].status,'not_observed');
  if (label === 'order-changed') assert.equal(result.report.inventory.sha256, result.report.inventory.repeatedSha256);
  checks++; console.log('PASS: ' + label);
}
try {
  await check('matched'); await check('order-changed');
  for (const label of ['unlisted','unlisted-same-name','unlisted-primary']) await check(label,1,undefined,'unlisted_registrations');
  await check('missing-active',1,undefined,'active_missing');
  for (const label of ['wrong-subnet','wrong-chain-name']) await check(label,1,undefined,'active_identity_mismatch');
  await check('wrong-vm',1,ledger => { ledger.chains[0].vmID=vm; },'active_identity_mismatch');
  await check('retired-registered',0,ledger => { ledger.retired=ledger.chains; ledger.chains=[]; });
  await check('retired-absent',0,ledger => { ledger.retired=[{...record(), blockchainID:makeId(9), chainId:9000000010}]; });
  await check('duplicate-ledger-id',1,ledger=>{ledger.retired=[{...record(),chainId:9001000008}];},'duplicate_ledger_identity');
  await check('duplicate-ledger-evm-id',1,ledger=>{ledger.retired=[{...record(),blockchainID:makeId(9)}];},'duplicate_ledger_identity');
  await check('primary-collision',1,ledger=>{ledger.chains[0].blockchainID=C;},'active_primary_alias_collision');
  for (const label of ['missing-primary','wrong-primary-subnet','empty-inventory']) await check(label,1,undefined,'primary_alias_C_inconsistent');
  for (const label of ['duplicate-inventory','bad-chain-id','bad-subnet-id','bad-vm-id','oversized-name','malformed-entry',
    'too-many-entries','huge-reply','malformed-inventory','inventory-headers-timeout','inventory-body-timeout']) await check(label,2,undefined,'inventory_unavailable_or_invalid');
  await check('inventory-changed',2,undefined,'inventory_changed');
  for (const label of ['changed-network','changed-alias']) await check(label,2,undefined,'network_identity_changed');
  for (const label of ['wrong-network','bad-network-type','wrong-network-name','invalid-alias','duplicate-alias','headers-timeout',
    'body-timeout','redirect','http201','http503','wrong-type','bad-json','rpc-error','wrong-id']) await check(label,2,undefined,'network_identity_unavailable_or_mismatch');
  for (const label of ['bad-ledger-json','unfinished-write','missing-ledger','ledger-directory','large-ledger']) await check(label,2,undefined,'ledger_unreadable_or_incomplete');
  await check('incomplete-ledger',2,ledger=>{delete ledger.chains[0].subnetID;},'ledger_unreadable_or_incomplete');
  await check('invalid-ledger-vm',2,ledger=>{ledger.chains[0].vmID=marker;},'ledger_unreadable_or_incomplete');
  await check('invalid-ledger-evm-id',2,ledger=>{ledger.chains[0].chainId=1.5;},'ledger_unreadable_or_incomplete');
  await check('invalid-retired-id',2,ledger=>{ledger.retired=[{...record(),blockchainID:marker}];},'ledger_unreadable_or_incomplete');
  await check('malformed-ledger',2,ledger=>{ledger.chains={};},'ledger_unreadable_or_incomplete');
  await check('oversized-ledger-count',2,ledger=>{ledger.chains=Array(10001).fill({name:'n'});},'ledger_unreadable_or_incomplete');
  for (const label of ['ledger-changed','pending-write-created']) await check(label,2,undefined,'ledger_changed');
  assert.equal(redirects,0,'redirect target must never be contacted');
  scenario='matched'; inventories=0; calls=[]; changed=false;
  activeDir=fs.mkdtempSync(path.join(scratch,'clean-input-')); ledgerFile=path.join(activeDir,'ledger.json');
  fs.writeFileSync(ledgerFile,JSON.stringify({chains:[record()],retired:[]}));
  const clean=await cli(['--ledger-file',ledgerFile,'--rpc',origin]); assert.equal(clean.code,0,'link and argument controls must start from accepted input');
  const linked = path.join(scratch,'linked'); fs.symlinkSync(activeDir,linked,process.platform==='win32'?'junction':'dir');
  calls=[]; const linkedResult=await cli(['--ledger-file',path.join(linked,'ledger.json'),'--rpc',origin]);
  assert.equal(linkedResult.code,2); assert.equal(calls.length,0); checks++; console.log('PASS: linked ledger parent refused');
  for (const args of [[],['--rpc',origin],['--ledger-file',ledgerFile],['--ledger-file',ledgerFile,'--rpc',origin,'--force'],
    ['--ledger-file',ledgerFile,'--ledger-file',ledgerFile,'--rpc',origin],
    ...['https://user:pass@host.invalid','http://host.invalid/path','http://host.invalid/?x=1','http://host.invalid/#x','file:///ledger'].map(url=>['--ledger-file',ledgerFile,'--rpc',url]),
    ...['0','-1','1.5','NaN','10001'].map(value=>['--ledger-file',ledgerFile,'--rpc',origin,'--timeout-ms',value])]) {
    calls=[]; const result=await cli(args); assert.equal(result.code,2); assert.equal(result.report,null,'invalid arguments must fail parsing, not a later ledger read'); assert.match(result.stderr,/Usage:/); assert.equal(calls.length,0); assert.equal(result.stdout.includes(marker),false); checks++;
  }
  console.log('PASS: '+checks+' actual inventory CLI/file/HTTP checks; bidirectional identity, fixed read methods, bounds and preserved inputs');
} catch(error) { console.error(error.stack); process.exitCode=1; }
finally { server.closeAllConnections(); await new Promise(resolve=>server.close(resolve)); console.log('Inventory fixture retained: '+scratch); }
