#!/usr/bin/env node
// Read-only evidence for an operator. Never retry, sign, repair, archive or delete.
import { readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseCreationJob } from '../local-net/lib/creation-journal.mjs';
import { parseLedger } from '../local-net/lib/ledger-read.mjs';
import { requestRpc } from '../local-net/lib/rpc-client.mjs';
import { cb58Decode } from '../local-net/lib/cb58.mjs';

const artifactNames = ['creation-journal/pending.json', 'creation-journal/pending.json.tmp',
  'console-chains.json', 'console-chains.json.bak', 'console-chains.json.tmp', 'console-chains.json.bak.tmp'];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function snapshot(directory) {
  return artifactNames.map(name => {
    try {
      const file = path.join(directory, name);
      const stat = statSync(file);
      if (!stat.isFile() || stat.size > 16 * 1024 * 1024) return { name, state: 'unreadable' };
      const bytes = readFileSync(file);
      return { name, state: 'present', size: bytes.length, sha256: hash(bytes), bytes };
    } catch (error) { return { name, state: error.code === 'ENOENT' ? 'absent' : 'unreadable' }; }
  });
}
const describe = artifacts => artifacts.map(({ bytes, ...entry }) => entry);
function validId(value) {
  if (typeof value !== 'string' || value.length > 50) return false;
  try { return cb58Decode(value).length === 32; } catch { return false; }
}
function networkId(value) {
  if (!((typeof value === 'string' && /^\d{1,10}$/.test(value)) || Number.isSafeInteger(value))) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 && id <= 0xffffffff ? id : null;
}
function rpcBase(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error('RPC must be an HTTP(S) origin without credentials, path, query or fragment.'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
      url.pathname !== '/' || url.search || url.hash) {
    throw new Error('RPC must be an HTTP(S) origin without credentials, path, query or fragment.');
  }
  return url.origin;
}

export async function inspectCreation({ configDirectory, rpcUrl, blockchainID, timeoutMs = 5000 }) {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30000) {
    throw new Error('Timeout must be an integer from 1 to 30000 milliseconds.');
  }
  if (!configDirectory) throw new Error('An explicit config directory is required.');
  const directory = path.resolve(configDirectory);
  try { if (!statSync(directory).isDirectory()) throw new Error(); }
  catch { throw new Error('Config directory does not exist or cannot be read.'); }
  const origin = rpcUrl === undefined ? undefined : rpcBase(rpcUrl);
  if (blockchainID !== undefined && (!origin || !validId(blockchainID))) {
    throw new Error('A candidate blockchain ID requires --rpc and a valid 32-byte CB58 identifier.');
  }
  const before = snapshot(directory);
  const report = { version: 1, observedAt: new Date().toISOString(), mode: origin ? 'rpc' : 'local',
    recoveryAuthorized: false, pending: null, artifacts: describe(before), checks: [],
    limits: ['Read-only observation; never authorizes retry or removal of recovery files.',
      'No consensus, validator tracking, backup restore or power-loss proof.',
      'A missing response or missing transaction is not proof of non-acceptance.'] };
  const add = (code, status, detail) => report.checks.push({ code, status, detail });
  function finish() {
    if (JSON.stringify(describe(snapshot(directory))) !== JSON.stringify(describe(before))) {
      add('evidence_changed', 'unknown', 'Local artifacts changed during inspection. Repeat after coordinating with the operator.');
    }
    report.verdict = report.checks.some(check => check.status === 'unknown') ? 'inconclusive'
      : report.pending || report.checks.some(check => check.status === 'conflict') ? 'review_required' : 'no_pending';
    report.exitCode = report.verdict === 'inconclusive' ? 2 : report.verdict === 'review_required' ? 1 : 0;
    return report;
  }
  if (before.some(file => file.state === 'unreadable')) add('artifact_unreadable', 'unknown', 'One or more artifacts are not readable regular files within the 16 MiB limit.');
  const get = name => before.find(file => file.name === name);
  if (before.some(file => file.name.endsWith('.tmp') && file.state !== 'absent')) {
    add('unfinished_write', 'conflict', 'An unfinished write is present. Preserve it and reconcile before any mutation.');
  }
  let job;
  const pending = get('creation-journal/pending.json');
  if (pending.state === 'present') {
    try {
      job = parseCreationJob(pending.bytes.toString('utf8'));
      report.pending = { jobId: job.id, phase: job.phase, networkID: job.networkID,
        name: job.plan.name, chainId: job.plan.chainId, genesisSha256: job.genesisSha256,
        subnetID: job.subnetID ?? null, blockchainID: job.blockchainID ?? null };
      add('journal', 'match', 'Journal structure and saved genesis digest agree.');
    } catch { add('journal_invalid', 'unknown', 'Pending journal is invalid; no network lookup will be attempted.'); }
  } else if (pending.state === 'absent') add('journal_absent', 'note', 'No pending journal was found in the selected config directory.');
  let ledger;
  for (const artifact of before.filter(file => file.name.startsWith('console-chains.json') && file.state === 'present')) {
    try {
      const parsed = parseLedger(artifact.bytes.toString('utf8'));
      if (artifact.name === 'console-chains.json') ledger = parsed;
    } catch { add('ledger_invalid', 'unknown', `${artifact.name} does not pass the console ledger parser.`); }
  }
  if (get('console-chains.json').state === 'absent' && before.some(file =>
    file.name.startsWith('console-chains.json.') && file.state !== 'absent')) {
    add('ledger_missing', 'unknown', 'Primary ledger is absent but recovery artifacts exist.');
  }
  if (job?.phase === 'complete' && !ledger) {
    add('complete_ledger_missing', 'conflict', 'Journal claims ledger completion but no valid primary ledger is available.');
  }
  if (job && ledger) {
    const candidates = [...ledger.chains.map(chain => ({ chain, retired: false })),
      ...ledger.retired.map(chain => ({ chain, retired: true }))].filter(({ chain }) =>
      chain.name === job.plan.name || chain.chainId === job.plan.chainId ||
      (job.blockchainID && chain.blockchainID === job.blockchainID));
    const exact = candidates.length === 1 && !candidates[0].retired &&
      candidates[0].chain.name === job.plan.name && candidates[0].chain.chainId === job.plan.chainId &&
      job.blockchainID && job.subnetID && candidates[0].chain.blockchainID === job.blockchainID &&
      candidates[0].chain.subnetID === job.subnetID;
    add('ledger_identity', exact ? 'match' : candidates.length ? 'conflict' : 'note',
      exact ? 'One active ledger entry matches all recorded identifiers; this alone does not authorize archival.'
        : candidates.length ? 'Ledger entries overlap this reservation without one exact active identity match.'
          : 'The primary ledger contains no matching entry for this reservation.');
  }
  if (!job || !origin) {
    if (blockchainID && !job) add('candidate_unscoped', 'unknown', 'A candidate cannot be checked without a valid saved creation plan.');
    if (origin) add('rpc_skipped', 'note', 'No valid pending job is available for an identity-scoped lookup.');
    return finish();
  }
  report.rpc = { origin, expectedNetworkID: job.networkID };
  async function readRpc(segment, method, params) {
    try { return await requestRpc(origin + segment, method, params, { timeoutMs }); }
    catch {
      add(method, 'unknown', 'RPC response could not be read or validated within the configured deadline.');
      return undefined;
    }
  }
  const info = await readRpc('/ext/info', 'info.getNetworkID', {});
  const actualNetworkID = networkId(info?.networkID);
  report.rpc.observedNetworkID = actualNetworkID;
  if (actualNetworkID === null) {
    add('network_identity', 'unknown', 'Node did not provide a valid network ID.'); return finish();
  }
  if (actualNetworkID !== job.networkID) {
    add('network_identity', 'conflict', 'Node belongs to a different network; no P-chain or EVM lookup was sent.'); return finish();
  }
  add('network_identity', 'match', 'Node reports the network ID recorded in the journal.');
  const candidate = blockchainID ?? job.blockchainID;
  if (!candidate) {
    add('submission_unresolved', 'note', 'The job has no blockchain ID. Obtain candidate IDs from operator evidence; never replay based on this absence.');
    return finish();
  }
  if (!validId(candidate)) {
    add('blockchain_identifier', 'unknown', 'Recorded blockchain ID is not a valid 32-byte CB58 identifier.'); return finish();
  }
  if (job.blockchainID && candidate !== job.blockchainID) {
    add('candidate_identifier', 'conflict', 'Candidate differs from the recorded blockchain ID; lookup stopped.'); return finish();
  }
  report.rpc.blockchainID = candidate;
  const [status, transaction] = await Promise.all([
    readRpc('/ext/bc/P', 'platform.getTxStatus', { txID: candidate }),
    readRpc('/ext/bc/P', 'platform.getTx', { txID: candidate, encoding: 'json' }),
  ]);
  if (status?.status !== 'Committed') {
    add('transaction_status', 'unknown', 'This node did not report the creation transaction as Committed.');
  } else add('transaction_status', 'match', 'This node reports the creation transaction as Committed.');
  const tx = transaction?.tx;
  const unsigned = tx?.unsignedTx;
  if (transaction?.encoding !== 'json' || !unsigned || typeof unsigned !== 'object' ||
      tx.id !== candidate || !validId(unsigned.subnetID) || !validId(unsigned.vmID) ||
      !validId(unsigned.blockchainID) || typeof unsigned.chainName !== 'string' ||
      typeof unsigned.genesisData !== 'string') {
    add('transaction_shape', 'unknown', 'Creation transaction JSON is missing required identity/genesis fields.'); return finish();
  }
  const genesisBytes = Buffer.from(unsigned.genesisData, 'base64');
  if (!genesisBytes.length || genesisBytes.toString('base64') !== unsigned.genesisData) {
    add('genesis_encoding', 'unknown', 'Genesis bytes are not canonical non-empty base64.'); return finish();
  }
  const actualHash = hash(genesisBytes);
  report.rpc.genesisSha256 = actualHash;
  report.rpc.subnetID = unsigned.subnetID;
  report.rpc.vmID = unsigned.vmID;
  const identitiesMatch = networkId(unsigned.networkID) === job.networkID &&
    cb58Decode(unsigned.blockchainID).every(byte => byte === 0) &&
    unsigned.chainName === job.plan.name && (!job.subnetID || unsigned.subnetID === job.subnetID) &&
    actualHash === job.genesisSha256;
  add('transaction_identity', identitiesMatch ? 'match' : 'conflict', identitiesMatch
    ? 'Returned transaction matches the saved network, name, recorded subnet (if any) and exact genesis bytes.'
    : 'Returned creation transaction conflicts with the saved plan or exact genesis bytes.');
  if (identitiesMatch && status?.status === 'Committed') {
    const chainId = await readRpc(`/ext/bc/${candidate}/rpc`, 'eth_chainId', []);
    if (typeof chainId !== 'string' || !/^0x[0-9a-f]+$/i.test(chainId)) {
      add('evm_identity', 'unknown', 'The EVM endpoint did not return a valid hexadecimal chain ID.');
    } else {
      add('evm_identity', BigInt(chainId) === BigInt(job.plan.chainId) ? 'match' : 'conflict',
        BigInt(chainId) === BigInt(job.plan.chainId) ? 'The EVM endpoint reports the planned chain ID; liveness is not established.'
          : 'The EVM endpoint reports a different chain ID.');
    }
  }
  return finish();
}

const usage = 'Usage: node scripts/inspect-creation.mjs --config-dir PATH [--rpc ORIGIN] [--blockchain-id ID] [--timeout-ms 5000]';
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    if (args.length === 1 && args[0] === '--help') console.log(usage);
    else {
      const names = { '--config-dir': 'configDirectory', '--rpc': 'rpcUrl', '--blockchain-id': 'blockchainID', '--timeout-ms': 'timeoutMs' };
      const options = {};
      for (let i = 0; i < args.length; i += 2) {
        const name = Object.hasOwn(names, args[i]) ? names[args[i]] : undefined, value = args[i + 1];
        if (!name || value === undefined || value.startsWith('--') || Object.hasOwn(options, name)) throw new Error(usage);
        options[name] = name === 'timeoutMs' ? Number(value) : value;
      }
      const report = await inspectCreation(options);
      console.log(JSON.stringify(report, null, 2));
      process.exitCode = report.exitCode;
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}
