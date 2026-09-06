#!/usr/bin/env node
// Preserve operator knowledge without modifying artifacts or authorizing recovery.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { parseLedger } from '../local-net/lib/ledger-read.mjs';
import { cb58Decode } from '../local-net/lib/cb58.mjs';
import { NETWORK_ID, TEN_MANG, GOC_DAI_CHAINID, TRAN_DAI_CHAINID } from '../local-net/lib/chainid.mjs';
import { inspectionOrigin, inspectionRpc } from '../local-net/lib/inspection-rpc.mjs';

const fileLimit = 4 * 1024 * 1024, totalLimit = 128 * 1024 * 1024, entryLimit = 1024;
const sha = value => createHash('sha256').update(value).digest('hex');
const stateFiles = ['console-chains.json', 'console-chains.json.bak', 'console-chains.json.tmp',
  'console-chains.json.bak.tmp', 'creation-journal/pending.json', 'creation-journal/pending.json.tmp'];
const inBand = value => Number.isSafeInteger(value) && value >= GOC_DAI_CHAINID && value <= TRAN_DAI_CHAINID;
const validId = value => {
  if (typeof value !== 'string' || value.length > 50) return false;
  try { return cb58Decode(value).length === 32; } catch { return false; }
};
const networkId = value => (typeof value === 'number' && Number.isSafeInteger(value) ||
  typeof value === 'string' && /^[0-9]{1,10}$/.test(value)) && Number(value) === NETWORK_ID;
function realDirectory(directory) {
  const stat = fs.lstatSync(directory);
  if (!stat.isDirectory() || stat.isSymbolicLink() || fs.realpathSync(directory) !== path.resolve(directory)) throw new Error('Directory is not real');
}
function boundedFile(file, budget) {
  if (budget.bytes > totalLimit) throw new Error('Artifact byte budget exhausted');
  realDirectory(path.dirname(file));
  const initial = fs.lstatSync(file);
  if (!initial.isFile() || initial.isSymbolicLink() || fs.realpathSync(file) !== path.resolve(file) || initial.size > fileLimit) throw new Error('Invalid artifact file');
  const fd = fs.openSync(file, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0));
  try {
    const opened = fs.fstatSync(fd);
    if (!opened.isFile() || opened.dev !== initial.dev || opened.ino !== initial.ino || opened.size > fileLimit) throw new Error('Artifact changed before read');
    const buffer = Buffer.alloc(65536), chunks = []; let count = 0;
    for (;;) {
      const length = fs.readSync(fd, buffer, 0, Math.min(buffer.length, fileLimit - count + 1, totalLimit - budget.bytes + 1), null); if (!length) break;
      count += length; budget.bytes += length;
      if (count > fileLimit || budget.bytes > totalLimit) throw new Error('Artifact byte bound exceeded');
      chunks.push(Buffer.from(buffer.subarray(0, length)));
    }
    const after = fs.fstatSync(fd);
    if (after.size !== count || after.size !== opened.size || after.mtimeMs !== opened.mtimeMs) throw new Error('Artifact changed during read');
    return Buffer.concat(chunks);
  } finally { fs.closeSync(fd); }
}
function snapshot(directory) {
  realDirectory(directory);
  const entries = [], budget = { bytes: 0 }; let ledger = null;
  const read = (relative, genesis = false) => {
    try {
      const bytes = boundedFile(path.join(directory, relative), budget);
      const entry = { path: relative, kind: 'file', bytes: bytes.length, sha256: sha(bytes) };
      if (genesis) {
        try {
          const parsed = JSON.parse(bytes.toString('utf8'));
          if (!Number.isSafeInteger(parsed?.config?.chainId) || parsed.config.chainId <= 0 ||
              !parsed.alloc || typeof parsed.alloc !== 'object' || Array.isArray(parsed.alloc)) throw new Error('Invalid genesis identity');
          entry.declaredEvmChainId = parsed.config.chainId; entry.allocAccounts = Object.keys(parsed.alloc).length;
          entry.classification = inBand(parsed.config.chainId) ? 'current_band_candidate' : 'outside_current_band';
        } catch { entry.classification = 'invalid_genesis_identity'; }
      } else if (relative === 'console-chains.json') {
        try {
          const parsed = parseLedger(bytes.toString('utf8'));
          if (parsed.chains.length + parsed.retired.length > entryLimit || [...parsed.chains, ...parsed.retired].some(chain =>
            !validId(chain.blockchainID) || !validId(chain.subnetID) || !Number.isSafeInteger(chain.chainId) || chain.chainId <= 0 ||
            Buffer.byteLength(chain.name) > 128 || (chain.vmID !== undefined && !validId(chain.vmID)))) throw new Error('Incomplete ledger identities');
          ledger = parsed;
        } catch { entry.classification = 'invalid_ledger'; }
      }
      entries.push(entry);
    } catch (error) { entries.push({ path: relative, kind: error.code === 'ENOENT' ? 'absent' : 'unreadable' }); }
  };
  for (const relative of stateFiles) read(relative);
  const temporary = path.join(directory, 'console-tmp');
  try {
    realDirectory(temporary); const handle = fs.opendirSync(temporary), names = [];
    try { for (;;) { const entry = handle.readSync(); if (!entry) break; names.push(entry.name); if (names.length > entryLimit) throw new Error('Too many artifacts'); } }
    finally { handle.closeSync(); }
    entries.push({ path: 'console-tmp', kind: 'directory' });
    for (const name of names.sort()) {
      if (!/^[A-Za-z0-9_-]{1,80}\.json$/.test(name)) { entries.push({ path: 'console-tmp/' + name, kind: 'unrecognized' }); continue; }
      read('console-tmp/' + name, true);
    }
  } catch (error) { entries.push({ path: 'console-tmp', kind: error.code === 'ENOENT' ? 'absent' : 'unreadable' }); }
  const manifest = entries.sort((left, right) => left.path < right.path ? -1 : left.path > right.path ? 1 : 0);
  return { entries: manifest, bytes: budget.bytes, sha256: sha(JSON.stringify(manifest)), ledger };
}

export async function inspectLegacyArtifacts({ configDirectory, rpcUrl, timeoutMs = 5000 } = {}) {
  if (typeof configDirectory !== 'string' || !configDirectory || !Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 10000) throw new Error('Explicit config directory and bounded timeout are required');
  const directory = path.resolve(configDirectory), origin = rpcUrl === undefined ? null : inspectionOrigin(rpcUrl);
  const report = { schema: 1, kind: '9chain-legacy-artifacts', mode: origin ? 'rpc' : 'local', observedAt: new Date().toISOString(),
    expectedNetworkID: NETWORK_ID, recoveryAuthorized: false, checks: [], candidates: [],
    limits: ['Only selected state metadata and console-tmp genesis candidates; no raw artifacts, allocations or credentials returned.',
      'Outside-band files remain evidence, not permission to erase or reuse identifiers.',
      'RPC matching is a node observation, not independent transaction/consensus validation.',
      'No proof of admission drain, mempool emptiness, subnet-only operation completion or non-acceptance.',
      'Not an atomic snapshot, backup, restoration, retry, import or deployment authorization.'] };
  const add = (code, status, artifact) => report.checks.push({ code, status, ...(artifact ? { artifact } : {}) });
  let before;
  function finish() {
    if (before) {
      try { const after = snapshot(directory); report.afterSnapshotSha256 = after.sha256;
        if (after.sha256 !== before.sha256) add('artifacts_changed', 'unknown'); }
      catch { add('artifacts_changed', 'unknown'); }
    }
    report.verdict = report.checks.some(check => check.status === 'unknown') ? 'inconclusive' :
      report.checks.some(check => check.status === 'conflict') ? 'review_required' : origin ? report.counts?.candidates === 0 ? 'no_current_candidates' : 'matched' : 'inventory_only';
    report.exitCode = report.verdict === 'inconclusive' ? 2 : report.verdict === 'review_required' ? 1 : 0;
    report.finishedAt = new Date().toISOString(); return report;
  }
  try { before = snapshot(directory); } catch { add('config_directory_unreadable', 'unknown'); return finish(); }
  report.artifacts = { entries: before.entries, bytes: before.bytes, snapshotSha256: before.sha256 };
  for (const entry of before.entries) {
    if (['unreadable', 'unrecognized'].includes(entry.kind) || ['invalid_genesis_identity', 'invalid_ledger'].includes(entry.classification)) add('artifact_unreadable_or_invalid', 'unknown', entry.path);
    if (entry.kind !== 'absent' && (entry.path.endsWith('.tmp') || entry.path === 'creation-journal/pending.json')) add('recovery_artifact_present', 'conflict', entry.path);
  }
  if (!before.ledger) { add('primary_ledger_unavailable', 'unknown'); return finish(); }
  const candidates = before.entries.filter(entry => entry.classification === 'current_band_candidate');
  report.counts = { candidates: candidates.length, outsideBand: before.entries.filter(entry => entry.classification === 'outside_current_band').length,
    active: before.ledger.chains.length, retired: before.ledger.retired.length, matched: 0 };
  const chainIds = new Set(), blockchains = new Set();
  for (const chain of [...before.ledger.chains, ...before.ledger.retired]) {
    if (chainIds.has(chain.chainId) || blockchains.has(chain.blockchainID)) add('duplicate_ledger_identity', 'conflict');
    chainIds.add(chain.chainId); blockchains.add(chain.blockchainID);
  }
  const work = [];
  for (const artifact of candidates) {
    const records = [...before.ledger.chains.map(chain => ({ chain, retired: false })), ...before.ledger.retired.map(chain => ({ chain, retired: true }))]
      .filter(({ chain }) => chain.chainId === artifact.declaredEvmChainId);
    const item = { path: artifact.path, declaredEvmChainId: artifact.declaredEvmChainId, genesisSha256: artifact.sha256, status: 'unverified' };
    report.candidates.push(item);
    if (candidates.filter(entry => entry.declaredEvmChainId === artifact.declaredEvmChainId).length !== 1) { item.status = 'duplicate_artifact_identity'; add(item.status, 'conflict', artifact.path); continue; }
    if (records.length !== 1) { item.status = records.length ? 'ambiguous_ledger_identity' : 'unlisted_artifact'; add(item.status, 'conflict', artifact.path); continue; }
    item.blockchainID = records[0].chain.blockchainID; item.retired = records[0].retired;
    work.push({ artifact, item, chain: records[0].chain });
  }
  for (const chain of before.ledger.chains) {
    if (!inBand(chain.chainId)) add('active_chain_outside_band', 'conflict');
    else if (!candidates.some(entry => entry.declaredEvmChainId === chain.chainId)) add('active_genesis_artifact_missing', 'conflict');
  }
  if (!origin) return finish();
  report.rpcOrigin = origin;
  if (work.length > 128) { add('rpc_candidate_limit_exceeded', 'unknown'); return finish(); }
  const deadline = Date.now() + 30000;
  const rpc = async (method, params = {}) => {
    const remaining = deadline - Date.now(); if (remaining <= 0) throw new Error('Inspection deadline exhausted');
    return inspectionRpc(origin, method, params, { timeoutMs: Math.min(timeoutMs, remaining), maxResponseBytes: 8 * 1024 * 1024 });
  };
  async function identity() {
    const results = await Promise.allSettled([rpc('info.getNetworkID'), rpc('info.getNetworkName')]);
    if (results.some(value => value.status !== 'fulfilled') || !networkId(results[0].value?.networkID) || results[1].value?.networkName !== TEN_MANG) throw new Error('Network identity mismatch');
  }
  try { await identity(); } catch { add('network_identity_unavailable_or_mismatch', 'unknown'); return finish(); }
  for (let index = 0; index < work.length; index += 3) {
    await Promise.all(work.slice(index, index + 3).map(async ({ artifact, item, chain }) => {
      try {
        const [status, value] = await Promise.all([rpc('platform.getTxStatus', { txID: chain.blockchainID }), rpc('platform.getTx', { txID: chain.blockchainID, encoding: 'json' })]);
        if (status?.status !== 'Committed') { item.status = 'transaction_not_confirmed'; add(item.status, 'unknown', artifact.path); return; }
        const tx = value?.tx, unsigned = tx?.unsignedTx;
        if (value?.encoding !== 'json' || tx?.id !== chain.blockchainID || !networkId(unsigned?.networkID) ||
            unsigned?.chainName !== chain.name || unsigned?.subnetID !== chain.subnetID || !validId(unsigned?.vmID) ||
            (chain.vmID !== undefined && unsigned.vmID !== chain.vmID) || !validId(unsigned?.blockchainID) ||
            !cb58Decode(unsigned.blockchainID).every(byte => byte === 0) || typeof unsigned.genesisData !== 'string') {
          item.status = 'transaction_identity_mismatch'; add(item.status, 'conflict', artifact.path); return;
        }
        const bytes = Buffer.from(unsigned.genesisData, 'base64');
        if (!bytes.length || bytes.length > fileLimit || bytes.toString('base64') !== unsigned.genesisData) throw new Error('Invalid genesis encoding');
        item.registeredGenesisSha256 = sha(bytes);
        if (item.registeredGenesisSha256 !== artifact.sha256) { item.status = 'genesis_bytes_mismatch'; add(item.status, 'conflict', artifact.path); return; }
        item.status = 'matched'; report.counts.matched++;
      } catch { item.status = 'transaction_unavailable_or_invalid'; add(item.status, 'unknown', artifact.path); }
    }));
  }
  try { await identity(); } catch { add('network_identity_changed', 'unknown'); }
  return finish();
}

const usage = 'Usage: node scripts/inspect-legacy-artifacts.mjs --config-dir PATH [--rpc ORIGIN] [--timeout-ms 5000]';
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    if (args.length === 1 && args[0] === '--help') console.log(usage);
    else {
      const flags = { '--config-dir': 'configDirectory', '--rpc': 'rpcUrl', '--timeout-ms': 'timeoutMs' }, options = {};
      for (let index = 0; index < args.length; index += 2) {
        const key = Object.hasOwn(flags, args[index]) ? flags[args[index]] : undefined, value = args[index + 1];
        if (!key || value === undefined || value.startsWith('--') || Object.hasOwn(options, key)) throw new Error(usage);
        options[key] = key === 'timeoutMs' ? Number(value) : value;
      }
      const report = await inspectLegacyArtifacts(options); console.log(JSON.stringify(report, null, 2)); process.exitCode = report.exitCode;
    }
  } catch { console.error(usage); process.exitCode = 2; }
}
