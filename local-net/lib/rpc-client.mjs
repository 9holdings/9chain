// Read-only JSON-RPC requests with a deadline covering headers and the response body.
export class RpcResponseError extends Error {
  constructor(message, retryable = false) {
    super(message);
    this.name = 'RpcResponseError';
    this.retryable = retryable;
  }
}

export async function requestRpc(url, method, params = [], { timeoutMs = 10_000, maxResponseBytes = 16 * 1024 * 1024 } = {}) {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1) throw new RangeError('RPC timeout must be a positive integer');
  if (!Number.isSafeInteger(maxResponseBytes) || maxResponseBytes < 1 || maxResponseBytes > 64 * 1024 * 1024) throw new RangeError('RPC response bound must be 1 through 64 MiB');
  const signal = AbortSignal.timeout(timeoutMs);
  let response, message;
  try {
    response = await fetch(url, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }), signal,
    });
    if (!response.ok) {
      await response.body?.cancel();
      throw new RpcResponseError(`RPC ${method} returned HTTP ${response.status}`, true);
    }
    const reader = response.body?.getReader();
    if (!reader) throw new RpcResponseError(`RPC ${method} returned no response body`);
    const chunks = []; let size = 0;
    for (;;) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.length;
      if (size > maxResponseBytes) {
        await reader.cancel(); throw new RpcResponseError(`RPC ${method} response exceeds its ${maxResponseBytes}-byte bound`);
      }
      chunks.push(value);
    }
    try { message = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch (error) {
      if (signal.aborted) throw error;
      throw new RpcResponseError(`RPC ${method} returned invalid JSON`);
    }
  } catch (error) {
    if (signal.aborted) throw new RpcResponseError(`RPC ${method} timed out after ${timeoutMs}ms`, true);
    throw error;
  }
  return rpcResult(message, method);
}

export function rpcResult(message, method) {
  const invalid = reason => new RpcResponseError(`RPC returned an invalid ${method} response: ${reason}`);
  if (!message || typeof message !== 'object' || Array.isArray(message) ||
      message.jsonrpc !== '2.0' || message.id !== 1) {
    throw invalid('JSON-RPC version or request ID does not match');
  }
  const hasResult = Object.hasOwn(message, 'result');
  const hasError = Object.hasOwn(message, 'error');
  if (hasResult === hasError) throw invalid('expected exactly one of result or error');
  if (hasError) {
    if (!message.error || typeof message.error.message !== 'string') throw invalid('malformed error object');
    throw new RpcResponseError(`RPC ${method}: ${message.error.message}`, true);
  }
  return message.result;
}
