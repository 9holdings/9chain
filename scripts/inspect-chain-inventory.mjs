#!/usr/bin/env node
// Read-only P-chain/ledger comparison. Never imports, relaunches or removes chains.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { parseLedger } from '../local-net/lib/ledger-read.mjs';
import { cb58Decode } from '../local-net/lib/cb58.mjs';
import { NETWORK_ID, TEN_MANG } from '../local-net/lib/chainid.mjs';
import { rpcResult } from '../local-net/lib/rpc-client.mjs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const byteLimit = 4 * 1024 * 1024, entryLimit = 10000;
const id = value => {
  if (typeof value !== 'string' || value.length > 50) return false;
  try { return cb58Decode(value).length === 32; } catch { return false; }
};
const name = value => typeof value === 'string' && value.trim().length > 0 && Buffer.byteLength(value) <= 128;
const primary = value => cb58Decode(value).every(byte => byte === 0);
function originOf(value) {
  let url; try { url = new URL(value); } catch { throw new Error('An explicit HTTP(S) RPC origin is required'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('RPC origin must have no credentials, path, query or fragment');
  }
  return url.origin;
}
function readInput(file) {
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink() || fs.realpathSync(file) !== path.resolve(file) || stat.size > byteLimit) throw new Error('Invalid ledger input');
  for (const suffix of ['.tmp', '.bak.tmp']) {
    try { fs.lstatSync(file + suffix); throw new Error('Unfinished ledger write'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  const bytes = fs.readFileSync(file); if (bytes.length > byteLimit) throw new Error('Ledger exceeded its bound');
  const ledger = parseLedger(bytes.toString('utf8'));
  if (ledger.chains.length + ledger.retired.length > entryLimit) throw new Error('Ledger has too many entries');
  for (const entry of [...ledger.chains, ...ledger.retired]) {
    if (!name(entry.name) || !id(entry.blockchainID) || !id(entry.subnetID) ||
        !Number.isSafeInteger(entry.chainId) || entry.chainId <= 0 || (entry.vmID !== undefined && !id(entry.vmID))) throw new Error('Ledger identity is incomplete');
  }
  return { ledger, sha256: sha(bytes), bytes: bytes.length };
}
function inventoryOf(value) {
  if (!Array.isArray(value?.blockchains) || value.blockchains.length > entryLimit) throw new Error('Invalid inventory');
  const seen = new Set();
  return value.blockchains.map(entry => {
    if (!entry || !id(entry.id) || !id(entry.subnetID) || !id(entry.vmID) || !name(entry.name) || seen.has(entry.id)) throw new Error('Invalid inventory identity');
    seen.add(entry.id);
    return { blockchainID: entry.id, name: entry.name, subnetID: entry.subnetID, vmID: entry.vmID };
  }).sort((left, right) => left.blockchainID < right.blockchainID ? -1 : left.blockchainID > right.blockchainID ? 1 : 0);
}
async function readRpc(origin, method, params, timeoutMs) {
  const segment = method.startsWith('info.') ? '/ext/info' : '/ext/bc/P';
  const response = await fetch(origin + segment, { method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(timeoutMs),
    headers: { 'content-type': 'application/json', connection: 'close' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) });
  try {
    if (response.status !== 200 || !/^application\/json(?:\s*;|$)/i.test(response.headers.get('content-type') ?? '')) throw new Error('RPC HTTP or content type refused');
    const reader = response.body?.getReader(); if (!reader) throw new Error('RPC body absent');
    const chunks = []; let count = 0;
    for (;;) {
      const { value, done } = await reader.read(); if (done) break;
      count += value.length; if (count > byteLimit) { await reader.cancel(); throw new Error('RPC reply exceeded its bound'); }
      chunks.push(value);
    }
    return rpcResult(JSON.parse(Buffer.concat(chunks).toString('utf8')), method);
  } finally { await response.body?.cancel().catch(() => {}); }
}

export async function inspectChainInventory({ ledgerFile, rpcUrl, timeoutMs = 5000 } = {}) {
  if (typeof ledgerFile !== 'string' || !ledgerFile) throw new Error('An explicit --ledger-file is required');
  const origin = originOf(rpcUrl), file = path.resolve(ledgerFile);
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 10000) throw new Error('Timeout must be 1 through 10000 milliseconds');
  const report = { schema: 1, kind: '9chain-ledger-inventory', observedAt: new Date().toISOString(),
    rpcOrigin: origin, expectedNetworkID: NETWORK_ID, recoveryAuthorized: false, checks: [],
    limits: ['Only observed P-chain registration identities and the selected ledger are compared.',
      'Unlisted chains may be intentional; no automatic ownership or recovery classification.',
      'No EVM chain ID, genesis, transaction acceptance timing, tracking or consensus liveness proof.',
      'Stable repeated observations are not an atomic snapshot, trusted-node proof or admission drain.',
      'No proof that an interrupted submission was never accepted; no import, retry, restore or deletion.'] };
  const add = (code, status) => report.checks.push({ code, status });
  let before;
  function finish() {
    if (before) {
      try { if (readInput(file).sha256 !== before.sha256) add('ledger_changed', 'unknown'); }
      catch { add('ledger_changed', 'unknown'); }
    }
    report.verdict = report.checks.some(check => check.status === 'unknown') ? 'inconclusive'
      : report.checks.some(check => check.status === 'conflict') ? 'review_required' : 'aligned';
    report.exitCode = report.verdict === 'inconclusive' ? 2 : report.verdict === 'review_required' ? 1 : 0;
    report.finishedAt = new Date().toISOString(); return report;
  }
  try { before = readInput(file); } catch { add('ledger_unreadable_or_incomplete', 'unknown'); return finish(); }
  report.ledger = { sha256: before.sha256, bytes: before.bytes, active: before.ledger.chains.length, retired: before.ledger.retired.length };
  const deadline = Date.now() + 30000;
  const rpc = async (method, params = {}) => {
    const remaining = deadline - Date.now(); if (remaining <= 0) throw new Error('Inspection deadline exhausted');
    return readRpc(origin, method, params, Math.min(timeoutMs, remaining));
  };
  async function identity() {
    const results = await Promise.allSettled([rpc('info.getNetworkID'), rpc('info.getNetworkName'),
      rpc('info.getBlockchainID', { alias: 'C' }), rpc('info.getBlockchainID', { alias: 'X' })]);
    if (results.some(result => result.status !== 'fulfilled')) throw new Error('Network identity unavailable');
    const [network, label, c, x] = results.map(result => result.value), value = network?.networkID;
    if (!((typeof value === 'number' && Number.isSafeInteger(value) || typeof value === 'string' && /^[0-9]{1,10}$/.test(value)) && Number(value) === NETWORK_ID) ||
        label?.networkName !== TEN_MANG || !id(c?.blockchainID) || !id(x?.blockchainID) || c.blockchainID === x.blockchainID) throw new Error('Network identity mismatch');
    return { networkID: Number(value), networkName: label.networkName, C: c.blockchainID, X: x.blockchainID };
  }
  let initial;
  try { initial = await identity(); report.network = initial; }
  catch { add('network_identity_unavailable_or_mismatch', 'unknown'); return finish(); }
  let inventory;
  try {
    inventory = inventoryOf(await rpc('platform.getBlockchains'));
    const repeated = inventoryOf(await rpc('platform.getBlockchains'));
    report.inventory = { entries: inventory.length, sha256: sha(JSON.stringify(inventory)), repeatedSha256: sha(JSON.stringify(repeated)) };
    if (report.inventory.sha256 !== report.inventory.repeatedSha256) { add('inventory_changed', 'unknown'); return finish(); }
  } catch { add('inventory_unavailable_or_invalid', 'unknown'); return finish(); }
  try { if (JSON.stringify(await identity()) !== JSON.stringify(initial)) throw new Error('Identity changed'); }
  catch { add('network_identity_changed', 'unknown'); return finish(); }
  add('repeated_inventory_identity', 'match');
  const byId = new Map(inventory.map(entry => [entry.blockchainID, entry])), accounted = new Set();
  report.primary = [];
  for (const alias of ['C', 'X']) {
    const entry = byId.get(initial[alias]);
    if (!entry || !primary(entry.subnetID)) { add('primary_alias_' + alias + '_inconsistent', 'conflict'); continue; }
    report.primary.push({ alias, ...entry }); accounted.add(entry.blockchainID);
  }
  const seenIds = new Set(), seenEvmIds = new Set();
  report.active = []; report.retired = [];
  for (const kind of ['active', 'retired']) for (const entry of before.ledger[kind === 'active' ? 'chains' : 'retired']) {
    if (seenIds.has(entry.blockchainID) || seenEvmIds.has(entry.chainId)) add('duplicate_ledger_identity', 'conflict');
    seenIds.add(entry.blockchainID); seenEvmIds.add(entry.chainId);
    const observed = byId.get(entry.blockchainID);
    let status = observed ? 'matched' : kind === 'active' ? 'missing' : 'not_observed';
    if (entry.blockchainID === initial.C || entry.blockchainID === initial.X) status = 'primary_alias_collision';
    else if (observed && (observed.subnetID !== entry.subnetID || observed.name !== entry.name ||
      (entry.vmID !== undefined && observed.vmID !== entry.vmID))) status = 'identity_mismatch';
    if (['missing', 'primary_alias_collision', 'identity_mismatch'].includes(status)) add(kind + '_' + status, 'conflict');
    if (observed) accounted.add(entry.blockchainID);
    report[kind].push({ name: entry.name, blockchainID: entry.blockchainID, subnetID: entry.subnetID,
      declaredEvmChainId: entry.chainId, status, ...(observed ? { observed } : {}) });
  }
  report.unlisted = inventory.filter(entry => !accounted.has(entry.blockchainID));
  if (report.unlisted.length) add('unlisted_registrations', 'conflict');
  report.counts = { primary: report.primary.length, active: report.active.length, retired: report.retired.length,
    unlisted: report.unlisted.length, registered: inventory.length };
  return finish();
}

const usage = 'Usage: node scripts/inspect-chain-inventory.mjs --ledger-file PATH --rpc ORIGIN [--timeout-ms 5000]';
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    if (args.length === 1 && args[0] === '--help') console.log(usage);
    else {
      const flags = { '--ledger-file': 'ledgerFile', '--rpc': 'rpcUrl', '--timeout-ms': 'timeoutMs' }, options = {};
      for (let index = 0; index < args.length; index += 2) {
        const key = Object.hasOwn(flags, args[index]) ? flags[args[index]] : undefined, value = args[index + 1];
        if (!key || value === undefined || value.startsWith('--') || Object.hasOwn(options, key)) throw new Error(usage);
        options[key] = key === 'timeoutMs' ? Number(value) : value;
      }
      const result = await inspectChainInventory(options); console.log(JSON.stringify(result, null, 2)); process.exitCode = result.exitCode;
    }
  } catch { console.error(usage); process.exitCode = 2; }
}
