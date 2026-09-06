// Strict bounded reads used by operator evidence inspectors; no write methods.
import { rpcResult } from './rpc-client.mjs';
const methods = new Set(['info.getNetworkID', 'info.getNetworkName', 'info.getBlockchainID',
  'platform.getBlockchains', 'platform.getTxStatus', 'platform.getTx']);
export function inspectionOrigin(value) {
  let url; try { url = new URL(value); } catch { throw new Error('An explicit HTTP(S) RPC origin is required'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('RPC origin must have no credentials, path, query or fragment');
  }
  return url.origin;
}
export async function inspectionRpc(origin, method, params = {}, { timeoutMs = 5000, maxResponseBytes = 4 * 1024 * 1024 } = {}) {
  origin = inspectionOrigin(origin);
  if (!methods.has(method)) throw new Error('Inspection RPC method is not an allowed read');
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 10000 ||
      !Number.isSafeInteger(maxResponseBytes) || maxResponseBytes < 1 || maxResponseBytes > 8 * 1024 * 1024) throw new Error('Inspection RPC bounds are invalid');
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
      count += value.length; if (count > maxResponseBytes) { await reader.cancel(); throw new Error('RPC reply exceeded its bound'); }
      chunks.push(value);
    }
    return rpcResult(JSON.parse(Buffer.concat(chunks).toString('utf8')), method);
  } finally { await response.body?.cancel().catch(() => {}); }
}
