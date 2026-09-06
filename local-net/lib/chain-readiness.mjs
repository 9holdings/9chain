// Observe every managed node after rollout. This does not prove consensus liveness.
import { performance } from 'node:perf_hooks';

export async function waitForChainNodes(services, { subnetID, blockchainID, chainId }, rpc,
  { timeoutMs = 90000, probeTimeoutMs = 5000, intervalMs = 2000, concurrency = 3 } = {}) {
  if (!Array.isArray(services) || !services.length || new Set(services).size !== services.length ||
      services.some(svc => typeof svc !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(svc))) {
    throw new Error('Chain readiness requires a non-empty unique managed node list');
  }
  if (!Number.isSafeInteger(chainId) || chainId < 1 || typeof rpc !== 'function' ||
      typeof subnetID !== 'string' || typeof blockchainID !== 'string' ||
      !/^[A-Za-z0-9]+$/.test(subnetID ?? '') || !/^[A-Za-z0-9]+$/.test(blockchainID ?? '')) {
    throw new Error('Chain readiness requires the planned chain identity');
  }
  for (const value of [timeoutMs, probeTimeoutMs, intervalMs, concurrency]) {
    if (!Number.isSafeInteger(value) || value < 1) throw new Error('Chain readiness budgets must be positive integers');
  }
  const deadline = performance.now() + timeoutMs;
  let pending = new Set(services);
  const ready = new Map(), last = new Map();
  let fatal;
  const permanent = message => Object.assign(new Error(message), { retryable: false });
  async function observe(svc, options) {
    const health = await rpc(svc, '/ext/health', 'health.health', { tags: [subnetID] }, options);
    if (options.signal.aborted) throw new Error(`${svc} readiness probe was cancelled`);
    if (!health || typeof health.healthy !== 'boolean' || !health.checks ||
        typeof health.checks !== 'object' || Array.isArray(health.checks)) {
      throw permanent(`${svc} returned an invalid L1 health result`);
    }
    const check = Object.hasOwn(health.checks, blockchainID) ? health.checks[blockchainID] : undefined;
    if (!check || typeof check !== 'object' || Array.isArray(check) || check.error || !health.healthy) {
      throw new Error(`${svc} has no healthy check for L1 ${blockchainID} yet`);
    }
    const actual = await rpc(svc, `/ext/bc/${blockchainID}/rpc`, 'eth_chainId', [], options);
    if (typeof actual !== 'string' || !/^0x[0-9a-f]+$/i.test(actual)) {
      throw permanent(`${svc} returned an invalid L1 eth_chainId result`);
    }
    if (BigInt(actual) !== BigInt(chainId)) {
      throw permanent(`${svc} L1 chain ID mismatch: expected ${chainId}, received ${BigInt(actual)}`);
    }
  }
  async function sample(svc) {
    const budget = Math.max(1, Math.min(probeTimeoutMs, Math.ceil(deadline - performance.now())));
    const controller = new AbortController();
    let timer;
    const expired = new Promise((_, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        reject(new Error(`${svc} readiness probe timed out`));
      }, budget);
    });
    try {
      // The race bounds even a broken probe implementation that ignores its signal.
      await Promise.race([observe(svc, { signal: controller.signal, timeoutMs: budget }), expired]);
      if (performance.now() >= deadline) throw new Error(`${svc} readiness deadline elapsed`);
      pending.delete(svc);
      ready.set(svc, { svc, chainId, checkedAt: Date.now() });
    } catch (error) {
      last.set(svc, error.message);
      if (error.retryable === false) fatal ??= error;
    } finally { clearTimeout(timer); controller.abort(); }
  }
  while (pending.size && performance.now() < deadline && !fatal) {
    // Do not combine an old success with another node that only became ready later.
    // All nodes must succeed in the same observation round after rollout.
    pending = new Set(services);
    ready.clear();
    const batch = [...pending];
    let cursor = 0;
    await Promise.all(Array.from({ length: Math.min(concurrency, batch.length) }, async () => {
      while (cursor < batch.length && !fatal && performance.now() < deadline) await sample(batch[cursor++]);
    }));
    if (!pending.size || fatal) break;
    const remaining = deadline - performance.now();
    if (remaining > 0) await new Promise(resolve => setTimeout(resolve, Math.min(intervalMs, remaining)));
  }
  if (fatal) throw fatal;
  if (pending.size) {
    throw new Error(`L1 readiness was not confirmed within ${timeoutMs}ms. Pending: ` +
      [...pending].map(svc => `${svc} (${last.get(svc) ?? 'not checked before deadline'})`).join('; ') +
      '. Creation remains reserved; contact the operator before retrying.');
  }
  return services.map(svc => ready.get(svc));
}
