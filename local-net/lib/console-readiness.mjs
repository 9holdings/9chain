// Fresh operator readiness and startup-configuration identity; never exposes values.
import { createHash, randomUUID } from 'node:crypto';
import { A1_GEN, NETWORK_ID, TEN_MANG, A1_PARENT_EVM_CHAIN_ID } from './chainid.mjs';

export const CONSOLE_CONFIGURATION_KEYS = Object.freeze([
  'PORT', 'NODE_URI', 'A1_CONSOLE_HOST', 'A1_CONSOLE_TOKEN', 'A1_CLI_KEY', 'A1_TRUST_PROXY',
  'A1_CONSOLE_DOMAIN', 'A1_CONSOLE_URI', 'A1_EVM_CHAIN_ID', 'A1_DE_CHAIN_MO', 'A1_COMPOSE_FILE',
  'A1_NODE_CONTAINER', 'LOVE9EVM_VMID', 'A1_L1_ADMIN', 'A1_L1_ALLOWLIST', 'A1_PUBLIC_RPC_BASE',
  'A1_LIMIT_CREATE', 'A1_LIMIT_REVOKE', 'A1_LIMIT_UPGRADE', 'A1_MAX_L1',
  'NODE_OPTIONS', 'NODE_PATH', 'NODE_EXTRA_CA_CERTS', 'NODE_TLS_REJECT_UNAUTHORIZED',
].sort());
export const CONSOLE_CONFIGURATION_EXCLUSIONS = Object.freeze(['A1_CONSOLE_START_PAUSED']);
// Restart intentionally forces START_PAUSED=1. The independent maintenance
// observation proves that policy; it is not part of the stable service config.
export function consoleConfigurationFingerprint(env) {
  return createHash('sha256').update(JSON.stringify({ schema: 1,
    values: CONSOLE_CONFIGURATION_KEYS.map(key => [key, env[key] === undefined ? null : String(env[key])]) })).digest('hex');
}
const uuid = value => typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);
const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const version = value => typeof value === 'string' && /^(?:9chaingo|avalanchego)\/[0-9]+\.[0-9]+\.[0-9]+(?:[-+][A-Za-z0-9.-]+)?$/.test(value) && value.length <= 100;

export async function probeConsoleReadiness({ probeId, configurationSha256, rpc, readState, readPending, maintenance }) {
  if (!uuid(probeId) || !hash(configurationSha256)) throw new Error('Readiness requires a probe UUID and startup configuration identity');
  const reasons = [], network = { generation: A1_GEN, networkId: null, networkName: null, parentChainId: null, nodeVersion: null };
  const replies = await Promise.allSettled([
    rpc('/ext/info', 'info.getNetworkID', [], { timeoutMs: 3000, maxResponseBytes: 65536 }),
    rpc('/ext/info', 'info.getNetworkName', [], { timeoutMs: 3000, maxResponseBytes: 65536 }),
    rpc('/ext/bc/C/rpc', 'eth_chainId', [], { timeoutMs: 3000, maxResponseBytes: 65536 }),
    rpc('/ext/info', 'info.getNodeVersion', [], { timeoutMs: 3000, maxResponseBytes: 65536 }),
  ]);
  for (const [index, result] of replies.entries()) {
    if (result.status !== 'fulfilled') { reasons.push(['network-id-unavailable', 'network-name-unavailable', 'parent-chain-unavailable', 'node-version-unavailable'][index]); continue; }
    const value = result.value;
    if (index === 0) {
      const id = value?.networkID;
      if ((typeof id === 'number' && Number.isSafeInteger(id) || typeof id === 'string' && /^[0-9]{1,10}$/.test(id)) && Number(id) === NETWORK_ID) network.networkId = Number(id);
      else reasons.push('network-id-mismatch');
    } else if (index === 1) {
      if (value?.networkName === TEN_MANG) network.networkName = value.networkName; else reasons.push('network-name-mismatch');
    } else if (index === 2) {
      if (typeof value === 'string' && /^0x[0-9a-f]{1,16}$/i.test(value) && BigInt(value) === BigInt(A1_PARENT_EVM_CHAIN_ID)) network.parentChainId = A1_PARENT_EVM_CHAIN_ID;
      else reasons.push('parent-chain-mismatch');
    } else if (version(value?.version)) network.nodeVersion = value.version;
    else reasons.push('node-version-invalid');
  }
  let ledger = null, pendingCreation = null;
  try {
    const state = readState();
    if (!Array.isArray(state?.chains) || !Array.isArray(state?.retired)) throw new Error('Invalid state shape');
    ledger = { chains: state.chains.length, retired: state.retired.length };
  } catch { reasons.push('ledger-unreadable'); }
  try { pendingCreation = readPending() !== null; if (pendingCreation) reasons.push('creation-pending'); }
  catch { reasons.push('creation-journal-unreadable'); }
  return { schema: 1, kind: '9chain-console-readiness', probeId, configurationSha256,
    observedAt: new Date().toISOString(), healthy: reasons.length === 0, reasons, network, ledger, pendingCreation,
    maintenance: maintenance() };
}

export async function readConsoleReadiness({ url, token, configurationSha256, instanceId, maintenanceId, timeoutMs = 5000 }) {
  let origin;
  try { origin = new URL(url); } catch { throw new Error('A loopback readiness origin is required'); }
  if (origin.protocol !== 'http:' || !['127.0.0.1', '[::1]', 'localhost'].includes(origin.hostname) ||
      origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) throw new Error('Readiness accepts only a credential-free loopback HTTP origin');
  if (typeof token !== 'string' || token.length < 16 || !hash(configurationSha256) || !uuid(instanceId) || !uuid(maintenanceId)) throw new Error('Readiness requires operator authentication, expected configuration and paused process identities');
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 10000) throw new Error('Readiness timeout must be 1 through 10000 milliseconds');
  const probeId = randomUUID(), signal = AbortSignal.timeout(timeoutMs); let response, result;
  try {
    response = await fetch(new URL('/api/maintenance/readiness?probeId=' + probeId, origin), {
      headers: { authorization: 'Bearer ' + token, connection: 'close' }, signal, redirect: 'manual' });
    if (response.status !== 200) { await response.body?.cancel(); throw new Error('Console readiness returned HTTP ' + response.status + '; resume refused'); }
    if (!/^application\/json(?:\s*;|$)/i.test(response.headers.get('content-type') ?? '')) throw new Error('Console readiness did not return JSON');
    const reader = response.body?.getReader(); if (!reader) throw new Error('Console readiness has no response body');
    const chunks = []; let size = 0;
    for (;;) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.length; if (size > 65536) { await reader.cancel(); throw new Error('Console readiness exceeds 64 KiB'); } chunks.push(value);
    }
    try { result = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new Error('Console readiness contains invalid JSON'); }
  } catch (error) {
    if (signal.aborted) throw new Error('Console readiness timed out; resume refused');
    if (error instanceof TypeError) throw new Error('Console readiness connection failed; resume refused');
    throw error;
  } finally { await response?.body?.cancel().catch(() => {}); }
  const state = result?.maintenance, node = result?.network;
  if (result?.schema !== 1 || result.kind !== '9chain-console-readiness' || result.probeId !== probeId || result.healthy !== true ||
      !Array.isArray(result.reasons) || result.reasons.length || result.pendingCreation !== false ||
      !Number.isSafeInteger(result.ledger?.chains) || result.ledger.chains < 0 || !Number.isSafeInteger(result.ledger?.retired) || result.ledger.retired < 0 ||
      node?.generation !== A1_GEN || node.networkId !== NETWORK_ID || node.networkName !== TEN_MANG || node.parentChainId !== A1_PARENT_EVM_CHAIN_ID || !version(node.nodeVersion)) throw new Error('Console readiness is stale, unhealthy or inconsistent');
  if (result.configurationSha256 !== configurationSha256) throw new Error('Console loaded a different startup configuration; resume refused');
  if (state?.instanceId !== instanceId || state.maintenanceId !== maintenanceId || state.paused !== true ||
      state.persistent !== true || state.readyForRestart !== true || state.activeOperations !== 0) throw new Error('Console readiness does not match the drained paused process');
  return { schema: result.schema, kind: result.kind, probeId, configurationSha256, healthy: true,
    network: Object.fromEntries(['generation', 'networkId', 'networkName', 'parentChainId', 'nodeVersion'].map(key => [key, node[key]])),
    ledger: { chains: result.ledger.chains, retired: result.ledger.retired }, pendingCreation: false,
    maintenance: { instanceId, maintenanceId, paused: true, persistent: true, readyForRestart: true, activeOperations: 0 } };
}
