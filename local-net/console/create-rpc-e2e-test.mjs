#!/usr/bin/env node
// Real console HTTP creation path; synthetic node and intercepted Docker calls.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer as httpServer } from 'node:http';
import { createServer as netServer } from 'node:net';
import { mkdirSync, mkdtempSync, copyFileSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { NETWORK_ID, TEN_MANG } from '../lib/chainid.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const expected = 9001000899;
let reported;
let chainQueries = 0;
let failuresRemaining = 0;
const children = new Set();
process.on('exit', () => { for (const child of children) child.kill(); });
const node = httpServer(async (request, response) => {
  let text = '';
  for await (const chunk of request) text += chunk;
  const { method, id } = JSON.parse(text);
  let result;
  if (method === 'info.getNetworkID') result = { networkID: String(NETWORK_ID) };
  else if (method === 'info.getNetworkName') result = { networkName: TEN_MANG };
  else if (method === 'info.getNodeVersion') result = { version: '9chaingo/1.14.2', rpcProtocolVersion: '45' };
  else if (method === 'eth_chainId' && request.url === '/ext/bc/C/rpc') result = '0x218711a09';
  else if (method === 'eth_chainId' && request.url === '/ext/bc/TestBlockchain111/rpc') {
    chainQueries++;
    if (failuresRemaining > 0) {
      failuresRemaining--;
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ jsonrpc: '2.0', id, error: { message: 'Synthetic VM starting' } }));
      return;
    }
    result = reported;
  }
  else {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ jsonrpc: '2.0', id, error: { message: `Not simulated: ${method}` } }));
    return;
  }
  response.writeHead(200, { 'content-type': 'application/json' });
  response.end(JSON.stringify({ jsonrpc: '2.0', id, result }));
});
node.listen(0, '127.0.0.1');
await once(node, 'listening');
const nodeUrl = `http://127.0.0.1:${node.address().port}`;
mkdirSync(path.join(root, 'work'), { recursive: true });
let pass = 0, fail = 0;

async function check(label, result, succeeds, errorPattern,
  { failuresBeforeSuccess = 0, cliFailure = false, crashDuringSubmission = false, ledgerFailure = false } = {}) {
  reported = result;
  chainQueries = 0;
  failuresRemaining = failuresBeforeSuccess;
  const scratch = mkdtempSync(path.join(root, 'work/create-rpc-'));
  const config = path.join(scratch, '9chain-a1-config');
  mkdirSync(config);
  mkdirSync(path.join(scratch, 'local-net/console'), { recursive: true });
  copyFileSync(path.join(root, '9chain-a1-config/l1-evm-genesis.json'), path.join(config, 'l1-evm-genesis.json'));
  copyFileSync(path.join(root, 'local-net/console/index.html'), path.join(scratch, 'local-net/console/index.html'));
  const reservation = netServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  const token = `synthetic-operator-token-${port}`;
  const childArgs = ['--import',
    pathToFileURL(path.join(root, 'local-net/console/fixtures/fake-create-docker.mjs')).href,
    path.join(root, 'local-net/console/server.mjs')];
  const childOptions = {
    cwd: scratch, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: String(port), A1_CONSOLE_HOST: '127.0.0.1',
      A1_CONSOLE_TOKEN: token, A1_CLI_KEY: 'PrivateKey-synthetic-not-valid',
      A1_DE_CHAIN_MO: '1', A1_NODE_CONTAINER: 'test-node', NODE_URI: nodeUrl,
      A1_TEST_REQUIRE_JOURNAL: '1', A1_TEST_CREATE_FAILURE: cliFailure ? '1' : '0',
      A1_TEST_CREATE_PAUSE: crashDuringSubmission ? '1' : '0',
      A1_TEST_LEDGER_SYNC_FAILURE: ledgerFailure ? '1' : '0',
      A1_COMPOSE_FILE: path.join(scratch, 'no-real-compose.yml'),
      A1_PUBLIC_RPC_BASE: nodeUrl },
  };
  let child;
  let spawnError;
  function startChild() {
    spawnError = undefined;
    child = spawn(process.execPath, childArgs, childOptions);
    children.add(child);
    child.on('error', error => { spawnError = error; });
    child.stdout.resume(); child.stderr.resume();
  }
  async function stopChild(signal = 'SIGTERM') {
    if (child.exitCode === null && child.signalCode === null && !spawnError) {
      const exited = once(child, 'exit'); child.kill(signal); await exited;
    }
    children.delete(child);
  }
  startChild();
  const base = `http://127.0.0.1:${port}`;
  const headers = { authorization: `Bearer ${token}`, 'content-type': 'application/json' };
  async function waitReady() {
    let ready = false;
    for (let attempt = 0; attempt < 40; attempt++) {
      if (spawnError) throw spawnError;
      if (child.exitCode !== null) throw new Error(`Console exited ${child.exitCode}`);
      try {
        const response = await fetch(base + '/api/progress', { headers, signal: AbortSignal.timeout(500) });
        if (response.status === 200) { ready = true; break; }
      } catch { /* wait for this console */ }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(ready, 'console startup');
  }
  try {
    await waitReady();
    const ledger = path.join(config, 'console-chains.json');
    let settled = false;
    const submission = fetch(base + '/api/create', { method: 'POST', headers,
      body: JSON.stringify({ name: 'RPC Identity Test', chainId: expected }), signal: AbortSignal.timeout(10000) })
      .then(response => { settled = true; return { response }; }, error => { settled = true; return { error }; });
    let body;
    if (crashDuringSubmission) {
      const commandLog = path.join(scratch, 'fake-docker.log');
      for (let attempt = 0; attempt < 100 && !existsSync(commandLog) && !settled; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      assert.equal(settled, false, 'the HTTP request must still be waiting when the console is killed');
      assert.deepEqual(readFileSync(commandLog, 'utf8').trim().split('\n'), ['create'],
        'kill only after the synthetic CLI submission, before tracking or RPC verification');
      const interrupted = JSON.parse(readFileSync(path.join(config, 'creation-journal/pending.json'), 'utf8'));
      assert.equal(interrupted.phase, 'submitting');
      assert.equal(existsSync(ledger), false);
      await stopChild('SIGKILL');
      const outcome = await submission;
      assert.equal(outcome.response, undefined, 'a killed console must not have acknowledged creation');
      assert.equal(outcome.error?.name, 'TypeError', 'the socket must close before the client timeout');
      startChild();
      await waitReady();
      assert.equal(JSON.parse(readFileSync(path.join(config, 'creation-journal/pending.json'), 'utf8')).id,
        interrupted.id, 'the fresh process must preserve the interrupted reservation');
    } else {
      const { response, error } = await submission;
      if (error) throw error;
      body = await response.json();
      assert.equal(response.status, succeeds ? 200 : 400, `${label}: ${body.error ?? 'unexpected success'}`);
    }
    if (succeeds) {
      assert.equal(body.chainId, expected);
      assert.equal(JSON.parse(readFileSync(ledger, 'utf8')).chains[0].chainId, expected);
      assert.equal(existsSync(path.join(config, 'creation-journal/pending.json')), false);
      const history = path.join(config, 'creation-journal/history');
      assert.equal(readdirSync(history).length, 1);
      assert.equal(JSON.parse(readFileSync(path.join(history, readdirSync(history)[0]), 'utf8')).phase, 'complete');
    } else {
      if (!crashDuringSubmission) assert.match(body.error, errorPattern);
      assert.equal(existsSync(ledger), false, 'an unverified creation must not publish a successful ledger entry');
    }
    const submissionUnconfirmed = cliFailure || crashDuringSubmission;
    assert.equal(chainQueries, submissionUnconfirmed ? 0 : failuresBeforeSuccess + 1, 'only transient failures may be retried');
    assert.deepEqual(readFileSync(path.join(scratch, 'fake-docker.log'), 'utf8').trim().split('\n'),
      submissionUnconfirmed ? ['create'] : ['create', 'services', 'restart', 'health', ...(ledgerFailure ? ['ledger-sync-failed'] : [])],
      'the expected launch stages must execute');
    if (!crashDuringSubmission) {
      const progress = await (await fetch(base + '/api/progress', { headers })).json();
      assert.equal(progress.running, false);
      assert.equal(progress.steps.find(step => step.code === (cliFailure ? 'subnet' : 'rpc')).status,
        succeeds || ledgerFailure ? 'done' : 'failed');
    }
    if (!succeeds) {
      const pendingFile = path.join(config, 'creation-journal/pending.json');
      const pending = JSON.parse(readFileSync(pendingFile, 'utf8'));
      assert.equal(pending.phase, submissionUnconfirmed ? 'submitting' : 'created');
      assert.equal(pending.plan.chainId, expected);
      assert.equal(pending.genesisSha256, createHash('sha256')
        .update(readFileSync(path.join(config, 'console-tmp/RPC_Identity_Test.json'))).digest('hex'),
        'the journal digest must match the exact genesis bytes passed to the CLI');
      assert.equal(readFileSync(pendingFile, 'utf8').includes('PrivateKey-'), false, 'the journal must not contain the CLI key');
      if (ledgerFailure) {
        assert.equal(existsSync(path.join(config, 'creation-journal/history')), false,
          'unconfirmed ledger persistence must never archive creation intent');
        assert.equal(JSON.parse(readFileSync(ledger + '.tmp', 'utf8')).chains[0].chainId, expected,
          'retain the attempted ledger as evidence, without claiming it was committed');
      }
      // A good RPC on the next request must not trigger a second irreversible CLI call.
      reported = '0x' + expected.toString(16);
      const retry = await fetch(base + '/api/create', { method: 'POST', headers,
        body: JSON.stringify({ name: 'Retry After Failure', chainId: expected + 1 }), signal: AbortSignal.timeout(10000) });
      const retryBody = await retry.json();
      assert.equal(retry.status, 400);
      assert.match(retryBody.error, /chain creation is pending/i,
        'an unresolved creation must block subsequent creation before the CLI');
      assert.equal(readFileSync(path.join(scratch, 'fake-docker.log'), 'utf8').split('\n').filter(x => x === 'create').length, 1);
      await stopChild();
      startChild();
      await waitReady();
      const status = await (await fetch(base + '/api/status', { headers })).json();
      if (ledgerFailure) assert.match(status.error, /ledger is missing but recovery files exist/);
      else assert.equal(status.pendingCreation.jobId, pending.id, 'a fresh process must expose the persisted job');
      const afterRestart = await fetch(base + '/api/create', { method: 'POST', headers,
        body: JSON.stringify({ name: 'Retry After Restart', chainId: expected + 2 }) });
      assert.equal(afterRestart.status, 400);
      assert.match((await afterRestart.json()).error, /chain creation is pending/i);
      const blockedRevoke = await fetch(base + '/api/revoke', { method: 'POST', headers,
        body: JSON.stringify({ name: 'RPC Identity Test', xacNhan: 'RPC Identity Test' }) });
      assert.equal(blockedRevoke.status, 400);
      assert.match((await blockedRevoke.json()).error, /chain creation is pending/i,
        'revocation must not remove the unresolved subnet from the track list');
      const blockedUpgrade = await fetch(base + '/api/upgrade', { method: 'POST', headers,
        body: JSON.stringify({ name: 'RPC Identity Test', confirm: 'RPC Identity Test' }) });
      assert.equal(blockedUpgrade.status, 400);
      assert.match((await blockedUpgrade.json()).error, /chain creation is pending/i);
      assert.equal(readFileSync(path.join(scratch, 'fake-docker.log'), 'utf8').split('\n').filter(x => x === 'create').length, 1);
    }
    pass++;
    console.log(`PASS: ${label}`);
  } catch (error) {
    fail++;
    console.error(`FAIL: ${label}: ${error.message}`);
  } finally {
    await stopChild();
  }
}
try {
  await check('matching hexadecimal chain ID', '0x' + expected.toString(16), true);
  await check('matching uppercase digits', '0x' + expected.toString(16).toUpperCase(), true);
  await check('transient RPC failure then matching identity', '0x' + expected.toString(16), true, undefined, { failuresBeforeSuccess: 1 });
  await check('wrong chain ID', '0x1', false, /chain ID mismatch/);
  await check('missing result', undefined, false, /invalid eth_chainId/);
  await check('null result', null, false, /invalid eth_chainId/);
  await check('numeric result instead of a hex quantity', expected, false, /invalid eth_chainId/);
  await check('object result instead of a hex quantity', {}, false, /invalid eth_chainId/);
  await check('malformed hexadecimal result', '0xwrong', false, /invalid eth_chainId/);
  await check('lost CLI response remains reserved across restart', null, false, /Synthetic lost CLI response/, { cliFailure: true });
  await check('hard crash during unresolved CLI submission blocks duplicates after restart', null, false, undefined, { crashDuringSubmission: true });
  await check('ledger flush failure preserves the creation reservation', '0x' + expected.toString(16), false,
    /ledger persistence could not be confirmed/, { ledgerFailure: true });
} finally {
  await new Promise(resolve => node.close(resolve));
}
console.log(`${pass} passed; ${fail} failed. No real Docker commands or public transactions executed.`);
process.exitCode = fail ? 1 : 0;
