#!/usr/bin/env node
// Actual HTTP client tests. Stale, contradictory and oversized data cannot authorize resume.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { readConsoleReadiness } from './console-readiness.mjs';

const token = 'synthetic-readiness-client-token', configurationSha256 = 'a'.repeat(64);
const instanceId = randomUUID(), maintenanceId = randomUUID();
let mode = 'ok', count = 0, captures = 0;
const mutations = {
  stale: value => { value.probeId = randomUUID(); }, unhealthy: value => { value.healthy = false; },
  reasons: value => { value.reasons = ['wrong-network']; }, pending: value => { value.pendingCreation = true; },
  ledger: value => { value.ledger.chains = -1; }, generation: value => { value.network.generation = 0; },
  network: value => { value.network.networkId = '999999998'; }, name: value => { value.network.networkName = '9chain-a1'; },
  chain: value => { value.network.parentChainId = 1; }, version: value => { value.network.nodeVersion = '?'; },
  config: value => { value.configurationSha256 = 'b'.repeat(64); }, instance: value => { value.maintenance.instanceId = randomUUID(); },
  pause: value => { value.maintenance.maintenanceId = randomUUID(); }, open: value => { value.maintenance.paused = false; },
  active: value => { value.maintenance.activeOperations = 1; }, persistence: value => { value.maintenance.persistent = false; },
  contradiction: value => { value.maintenance.readyForRestart = false; }, bool: value => { value.healthy = 'true'; },
};
const server = createServer((req, res) => {
  count++; assert.equal(req.method, 'GET'); assert.equal(req.headers.authorization, 'Bearer ' + token);
  if (req.url === '/capture') { captures++; res.end('{}'); return; }
  if (mode === 'headers') return;
  const status = /^http[0-9]+$/.test(mode) ? Number(mode.slice(4)) : mode === 'redirect' ? 302 : 200;
  res.writeHead(status, { 'content-type': mode === 'html' ? 'text/html' : 'application/json', location: '/capture' });
  if (mode === 'body') { res.write('{'); return; }
  if (mode === 'json') { res.end('{broken ' + token); return; }
  const value = { schema: 1, kind: '9chain-console-readiness', probeId: new URL(req.url, 'http://localhost').searchParams.get('probeId'),
    healthy: true, reasons: [], pendingCreation: false, configurationSha256,
    ledger: { chains: 1, retired: 0 }, network: { generation: 1, networkId: 999999998, networkName: '9chain-a1-g1', parentChainId: 9000000009, nodeVersion: '9chaingo/1.14.2', secret: token },
    maintenance: { instanceId, maintenanceId, paused: true, persistent: true, readyForRestart: true, activeOperations: 0 }, secret: token };
  mutations[mode]?.(value); if (mode === 'large') value.padding = 'x'.repeat(65536);
  res.end(JSON.stringify(value));
});
server.listen(0, '127.0.0.1'); await once(server, 'listening');
const options = { url: 'http://127.0.0.1:' + server.address().port, token, configurationSha256, instanceId, maintenanceId };
let checks = 0;
try {
  const good = await readConsoleReadiness(options); assert.equal(good.healthy, true); assert.equal(JSON.stringify(good).includes(token), false); checks++;
  for (const [scenario, pattern] of Object.keys(mutations).map(name => [name, name === 'config' ? /different startup configuration/ : ['instance', 'pause', 'open', 'active', 'persistence', 'contradiction'].includes(name) ? /drained paused process/ : /stale, unhealthy or inconsistent/])) {
    mode = scenario; await assert.rejects(readConsoleReadiness(options), error => pattern.test(error.message) && !error.message.includes(token), scenario); checks++;
  }
  for (const [scenario, pattern] of [['http401', /HTTP 401/], ['http403', /HTTP 403/], ['http404', /HTTP 404/], ['http503', /HTTP 503/],
    ['redirect', /HTTP 302/], ['html', /did not return JSON/], ['json', /invalid JSON/], ['large', /64 KiB/], ['headers', /timed out/], ['body', /timed out/]]) {
    mode = scenario; const started = Date.now();
    await assert.rejects(readConsoleReadiness({ ...options, timeoutMs: 100 }), error => pattern.test(error.message) && !error.message.includes(token), scenario);
    assert.ok(Date.now() - started < 1500); checks++;
  }
  assert.equal(captures, 0);
  const before = count;
  for (const changes of [{ url: 'https://127.0.0.1' }, { url: 'http://example.invalid' }, { url: options.url + '/wrong' }, { url: 'http://user:password@localhost' },
    { token: '' }, { configurationSha256: 'not-a-hash' }, { instanceId: '' }, { maintenanceId: '' }, { timeoutMs: 0 }, { timeoutMs: 10001 }]) {
    await assert.rejects(readConsoleReadiness({ ...options, ...changes })); checks++;
  }
  assert.equal(count, before, 'Invalid client options must fail before a request');
  mode = 'ok'; assert.equal((await readConsoleReadiness(options)).healthy, true); checks++;
  console.log('PASS: ' + checks + ' actual readiness client HTTP/input checks; stale/config/identity/protocol/body/deadline controls and no secret or redirect forwarding');
} catch (error) { console.error('FAIL: ' + error.message); process.exitCode = 1; }
finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
