#!/usr/bin/env node
// Real HTTP/process tests. Synthetic RPC, invalid plans, no validator operations.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer, request as httpRequest } from 'node:http';
import { createServer as portServer } from 'node:net';
import { mkdirSync, mkdtempSync, copyFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Wallet } from 'ethers';
import { NETWORK_ID, TEN_MANG } from '../lib/chainid.mjs';
import { controlMaintenance } from '../deploy/console-maintenance.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
mkdirSync(path.join(root, 'work'), { recursive: true });
const scratch = mkdtempSync(path.join(root, 'work/maintenance-console-'));
mkdirSync(path.join(scratch, 'local-net/console'), { recursive: true });
copyFileSync(path.join(root, 'local-net/console/index.html'), path.join(scratch, 'local-net/console/index.html'));
const config = path.join(scratch, '9chain-a1-config');
const token = 'synthetic-maintenance-operator-token';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let hold = false;
const held = [];
const rpc = createServer(async (req, res) => {
  let text = ''; for await (const chunk of req) text += chunk;
  const { method, id } = JSON.parse(text);
  const result = method === 'info.getNetworkID' ? { networkID: String(NETWORK_ID) } :
    method === 'info.getNetworkName' ? { networkName: TEN_MANG } :
    method === 'info.getNodeVersion' ? { version: '9chaingo/1.14.2' } : '0x218711a09';
  const reply = () => res.end(JSON.stringify({ jsonrpc: '2.0', id, result }));
  if (hold && method === 'info.getNetworkID') held.push(reply); else reply();
});
rpc.listen(0, '127.0.0.1'); await once(rpc, 'listening');
let child, base, logs = '';
async function call(route, { method = 'GET', body, credential = token, signal } = {}) {
  const response = await fetch(base + route, { method,
    headers: { 'content-type': 'application/json', ...(credential ? { authorization: `Bearer ${credential}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body), signal: signal ?? AbortSignal.timeout(15_000) });
  return { status: response.status, body: await response.json() };
}
async function until(check, message) {
  for (let attempt = 0; attempt < 60; attempt++) { if (await check()) return; await delay(25); }
  throw new Error(message);
}
async function start(startPaused = '0', expectFailure = false) {
  logs = '';
  const port = portServer(); port.listen(0, '127.0.0.1'); await once(port, 'listening');
  const number = port.address().port; await new Promise(resolve => port.close(resolve));
  base = `http://127.0.0.1:${number}`;
  child = spawn(process.execPath, [path.join(root, 'local-net/console/server.mjs')], {
    cwd: scratch, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env,
      PORT: String(number), A1_CONSOLE_HOST: '127.0.0.1', A1_CONSOLE_TOKEN: token,
      A1_CONSOLE_START_PAUSED: startPaused,
      A1_CLI_KEY: 'PrivateKey-invalid-synthetic-only', A1_DE_CHAIN_MO: '1',
      NODE_URI: `http://127.0.0.1:${rpc.address().port}`,
      A1_COMPOSE_FILE: path.join(scratch, 'does-not-exist.yml') },
  });
  child.stdout.on('data', data => { logs += data; }); child.stderr.on('data', data => { logs += data; });
  if (expectFailure) {
    await until(() => child.exitCode !== null, 'Invalid startup policy must refuse to start');
    assert.notEqual(child.exitCode, 0);
    assert.match(logs, /A1_CONSOLE_START_PAUSED must be 0 or 1/);
    return;
  }
  await until(async () => {
    if (child.exitCode !== null) throw new Error(`Console exited ${child.exitCode}`);
    try { return (await call('/api/progress')).status === 200; } catch { return false; }
  }, 'The isolated console must start');
  await call('/api/status');
}
async function stop() {
  if (child?.exitCode === null) { const ended = once(child, 'exit'); child.kill(); await ended; }
}
process.on('exit', () => child?.kill());
try {
  await start();
  hold = true;
  const disconnected = new AbortController();
  const first = call('/api/create', { method: 'POST', body: { name: '!' }, signal: disconnected.signal })
    .catch(error => ({ aborted: error.name === 'AbortError' }));
  await until(() => held.length === 1, 'The first mutation must reach the preflight RPC');
  const second = call('/api/create', { method: 'POST', body: { name: '?' } })
    .catch(error => ({ error: error.message }));
  await delay(80);
  const progress = await call('/api/progress');
  assert.equal(progress.body.running, false, 'This fixture must target the gap before rollout progress starts');
  console.log('Observed: rollout progress is false while one mutation waits for RPC and another is queued');
  assert.equal(progress.body.maintenance?.activeOperations, 2,
    'Preflight and queued mutations must both be counted before deployment can restart the console');
  const unauthorized = await call('/api/maintenance/pause', { method: 'POST', credential: '' });
  assert.equal(unauthorized.status, 401);
  const wallet = Wallet.createRandom();
  const nonce = await call(`/api/siwe/nonce?address=${wallet.address}`);
  const login = await call('/api/siwe/login', { method: 'POST', body: {
    nonce: nonce.body.nonce, signature: await wallet.signMessage(nonce.body.message) } });
  const walletPause = await call('/api/maintenance/pause', { method: 'POST', credential: login.body.token });
  assert.equal(walletPause.status, 403, 'An authenticated wallet cannot control deployment maintenance');
  const paused = await call('/api/maintenance/pause', { method: 'POST' });
  assert.equal(paused.status, 200);
  assert.equal(paused.body.paused, true);
  assert.equal(paused.body.activeOperations, 2);
  assert.equal(paused.body.readyForRestart, false);
  assert.equal(paused.body.persistent, true);
  disconnected.abort(); assert.equal((await first).aborted, true);
  assert.equal((await call('/api/maintenance')).body.activeOperations, 2,
    'A disconnected HTTP client must not release work that is still executing');
  for (const route of ['/api/create', '/api/revoke', '/api/upgrade', '/api/transfer-owner']) {
    const denied = await call(route, { method: 'POST', body: {} });
    assert.equal(denied.status, 503, `${route} must reject new work during maintenance`);
    assert.match(denied.body.error, /maintenance/);
  }
  console.log('PASS: operator-only pause, all mutation routes refused, disconnected and queued work retained');
  hold = false; for (const reply of held.splice(0)) reply();
  assert.equal((await second).status, 400, 'The admitted invalid plan must finish without creating a chain');
  await until(async () => (await call('/api/maintenance')).body.readyForRestart === true,
    'Maintenance must become ready after admitted work ends');
  assert.equal((await call('/api/chains')).status, 200, 'Read-only chain access remains available');
  await stop(); await start();
  const restarted = await call('/api/maintenance');
  assert.equal(restarted.body.paused, true, 'Maintenance must persist across console restart');
  assert.equal(restarted.body.readyForRestart, true);
  assert.notEqual(restarted.body.instanceId, paused.body.instanceId);
  const stale = await call('/api/maintenance/resume', { method: 'POST', body: paused.body });
  assert.equal(stale.status, 409, 'An old process observation must not reopen the restarted console');
  const resumed = await call('/api/maintenance/resume', { method: 'POST', body: restarted.body });
  assert.equal(resumed.status, 200); assert.equal(resumed.body.paused, false);
  console.log('PASS: persistent pause, process identity check, explicit operator resume');

  // Count the body-reading phase too. No RPC or queue has started at this point.
  const slow = httpRequest(base + '/api/create', { method: 'POST', headers: {
    authorization: `Bearer ${token}`, 'content-type': 'application/json' } });
  const slowResult = new Promise((resolve, reject) => {
    slow.on('response', response => { response.resume(); response.on('end', () => resolve(response.statusCode)); });
    slow.on('error', reject);
  });
  slow.write('{');
  await until(async () => (await call('/api/maintenance')).body.activeOperations === 1,
    'A partially read mutation body must be counted');
  const drainingBody = await call('/api/maintenance/pause', { method: 'POST' });
  assert.equal(drainingBody.body.readyForRestart, false);
  slow.end('"name":"!"}');
  assert.equal(await slowResult, 400);
  await until(async () => (await call('/api/maintenance')).body.readyForRestart === true,
    'The completed invalid body must release its admission');
  const previous = await call('/api/maintenance');
  await call('/api/maintenance/resume', { method: 'POST', body: previous.body });
  const newPause = await call('/api/maintenance/pause', { method: 'POST' });
  assert.notEqual(newPause.body.maintenanceId, previous.body.maintenanceId);
  assert.equal((await call('/api/maintenance/resume', { method: 'POST', body: previous.body })).status, 409,
    'A stale pause from the same process must not reopen a newer pause');
  assert.equal((await call('/api/maintenance/resume', { method: 'POST', body: null })).status, 409);
  const malformed = await fetch(base + '/api/maintenance/resume', { method: 'POST',
    headers: { authorization: `Bearer ${token}` }, body: '{', signal: AbortSignal.timeout(2000) });
  assert.equal(malformed.status, 400);
  assert.equal((await call('/api/maintenance')).body.paused, true);
  await call('/api/maintenance/resume', { method: 'POST', body: newPause.body });
  const dropped = httpRequest(base + '/api/create', { method: 'POST', headers: { authorization: `Bearer ${token}` } });
  const droppedError = once(dropped, 'error');
  dropped.write('{');
  await until(async () => (await call('/api/maintenance')).body.activeOperations === 1,
    'The incomplete request must be admitted before its connection is dropped');
  await call('/api/maintenance/pause', { method: 'POST' });
  dropped.destroy(); await droppedError;
  await until(async () => (await call('/api/maintenance')).body.readyForRestart === true,
    'A dropped incomplete body must release admission without leaving the console stuck');
  const observed = await controlMaintenance({ url: base, token, action: 'status', timeoutMs: 2000 });
  const identity = { instanceId: observed.instanceId, maintenanceId: observed.maintenanceId };
  assert.equal((await controlMaintenance({ url: base, token, action: 'assert-paused', ...identity, timeoutMs: 2000 })).readyForRestart, true);
  assert.equal((await controlMaintenance({ url: base, token, action: 'resume', ...identity, timeoutMs: 2000 })).paused, false);
  assert.equal((await controlMaintenance({ url: base, token, action: 'pause-and-wait', timeoutMs: 2000 })).readyForRestart, true);
  console.log('PASS: production operator client reads, verifies, resumes and pauses the real isolated console');
  const beforePolicy = await controlMaintenance({ url: base, token });
  await controlMaintenance({ url: base, token, action: 'resume',
    instanceId: beforePolicy.instanceId, maintenanceId: beforePolicy.maintenanceId });
  assert.equal(existsSync(path.join(config, 'console-maintenance')), false);
  await stop(); await start('1');
  const forced = await controlMaintenance({ url: base, token, action: 'assert-paused' });
  assert.notEqual(forced.instanceId, beforePolicy.instanceId);
  assert.equal((await call('/api/create', { method: 'POST', body: {} })).status, 503);
  await controlMaintenance({ url: base, token, action: 'resume',
    instanceId: forced.instanceId, maintenanceId: forced.maintenanceId });
  await stop(); await start('invalid', true);
  console.log('PASS: explicit paused startup creates its own durable gate; invalid startup policy refuses to listen');
  assert.equal(existsSync(path.join(config, 'console-chains.json')), false);
  assert.deepEqual(readdirSync(path.join(config, 'console-tmp')), []);
  console.log('PASS: body-reading admission, dropped body, stale/malformed resume refusal, no ledger or genesis writes');
} catch (error) {
  console.error(`FAIL: ${error.message}`); process.exitCode = 1;
} finally {
  hold = false; for (const reply of held.splice(0)) reply();
  await stop(); rpc.closeAllConnections(); await new Promise(resolve => rpc.close(resolve));
  console.log(`Synthetic state retained: ${scratch}`);
}
