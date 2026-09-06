#!/usr/bin/env node
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { waitForChainNodes } from './chain-readiness.mjs';

const identity = { subnetID: 'Subnet111', blockchainID: 'Blockchain111', chainId: 9001000100 };
const healthy = () => ({ healthy: true, checks: { Blockchain111: {} } });
const correctId = '0x' + identity.chainId.toString(16);
const quick = { timeoutMs: 400, probeTimeoutMs: 100, intervalMs: 5, concurrency: 2 };
const answer = method => method === 'health.health' ? healthy() : correctId;

let active = 0, peak = 0;
const calls = [];
const result = await waitForChainNodes(['node1', 'node2', 'node3', 'node4'], identity,
  async (svc, segment, method, params, { signal }) => {
    active++; peak = Math.max(peak, active); calls.push({ svc, segment, method, params });
    assert.equal(signal.aborted, false);
    await new Promise(resolve => setTimeout(resolve, 5));
    active--; return answer(method);
  }, quick);
assert.equal(peak, 2, 'probe concurrency must be bounded');
assert.deepEqual(result.map(node => node.svc), ['node1', 'node2', 'node3', 'node4']);
for (const node of result) {
  assert.equal(node.chainId, identity.chainId);
  assert.ok(Number.isSafeInteger(node.checkedAt));
  assert.deepEqual(calls.filter(call => call.svc === node.svc).map(call => call.method), ['health.health', 'eth_chainId']);
}
assert.ok(calls.filter(call => call.method === 'health.health').every(call => call.params.tags[0] === identity.subnetID));
assert.ok(calls.filter(call => call.method === 'eth_chainId').every(call => call.segment.includes(identity.blockchainID)));
console.log('PASS: every managed node, tagged health, own RPC and bounded concurrency');

const attempts = new Map();
await waitForChainNodes(['ready-node', 'starting-node'], identity, async (svc, segment, method) => {
  if (method === 'health.health') {
    attempts.set(svc, (attempts.get(svc) ?? 0) + 1);
    if (svc === 'starting-node' && attempts.get(svc) === 1) return { healthy: true, checks: {} };
  }
  return answer(method);
}, quick);
assert.equal(attempts.get('ready-node'), 2, 'recheck an earlier success when another node needs a later round');
assert.equal(attempts.get('starting-node'), 2, 'a missing chain check must be retried');
console.log('PASS: one node starts later without hiding its missing check');

const changing = new Map();
await assert.rejects(waitForChainNodes(['early-node', 'late-node'], identity, async (svc, segment, method) => {
  if (method === 'health.health') {
    changing.set(svc, (changing.get(svc) ?? 0) + 1);
    const isHealthy = svc === 'early-node' ? changing.get(svc) === 1 : changing.get(svc) > 1;
    return isHealthy ? healthy() : { healthy: false, checks: {} };
  }
  return correctId;
}, { ...quick, timeoutMs: 50 }), /not confirmed within 50ms/,
'a stale successful sample must not combine with another node that only became ready later');
console.log('PASS: readiness requires one fresh successful round for all nodes');

for (const [label, probe, pattern] of [
  ['wrong ID', async (_, __, method) => method === 'health.health' ? healthy() : '0x1', /chain ID mismatch/],
  ['malformed ID', async (_, __, method) => method === 'health.health' ? healthy() : identity.chainId, /invalid L1 eth_chainId/],
  ['invalid health', async () => ({ healthy: 'true', checks: {} }), /invalid L1 health/],
  ['invalid envelope', async () => { throw Object.assign(new Error('Invalid envelope'), { retryable: false }); }, /Invalid envelope/],
]) {
  let count = 0;
  await assert.rejects(waitForChainNodes(['bad-node'], identity, async (...args) => { count++; return probe(...args); }, quick), pattern);
  assert.ok(count <= 2, `${label}: permanent faults must not loop to the deadline`);
  console.log(`PASS: ${label} fails without retrying a definite identity/protocol error`);
}
for (const [label, probe] of [
  ['missing chain', async () => ({ healthy: true, checks: {} })],
  ['unhealthy chain', async () => ({ healthy: false, checks: { Blockchain111: { error: 'not ready' } } })],
  ['probe ignoring cancellation', async () => new Promise(() => {})],
]) {
  const started = performance.now();
  await assert.rejects(waitForChainNodes(['node1', 'node2'], identity, probe,
    { ...quick, timeoutMs: 50, probeTimeoutMs: 20 }), /not confirmed within 50ms.*Pending:/);
  const elapsed = performance.now() - started;
  assert.ok(elapsed >= 40 && elapsed < 1500, `${label}: shared deadline must bound the entire operation (${elapsed}ms)`);
  console.log(`PASS: ${label} remains pending and respects the shared deadline`);
}

let releaseHealth, lateCalls = 0;
const timedOut = waitForChainNodes(['late-node'], identity, async () => {
  lateCalls++;
  return new Promise(resolve => { releaseHealth = resolve; });
}, { ...quick, timeoutMs: 30, probeTimeoutMs: 100 });
await assert.rejects(timedOut, /not confirmed within 30ms/);
releaseHealth(healthy());
await new Promise(resolve => setImmediate(resolve));
assert.equal(lateCalls, 1, 'a late health response must not start a new RPC after cancellation');
console.log('PASS: late completion cannot trigger another request after deadline');
for (const nodes of [[], ['node1', 'node1'], ['../other-node']]) {
  await assert.rejects(waitForChainNodes(nodes, identity, async () => { throw new Error('must not probe'); }), /managed node list/);
}
console.log('PASS: invalid managed-node inventories are refused before probing');
