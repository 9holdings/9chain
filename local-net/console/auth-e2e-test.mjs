#!/usr/bin/env node
// Real authentication/ownership HTTP checks against isolated synthetic state.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { createServer as portServer } from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';
import { Wallet } from 'ethers';
import { NETWORK_ID, TEN_MANG } from '../lib/chainid.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
fs.mkdirSync(path.join(root, 'work'), { recursive: true });
const evidence = fs.mkdtempSync(path.join(root, 'work/auth-console-'));
const token = 'synthetic-auth-operator-' + randomUUID();
const cliKey = 'PrivateKey-invalid-synthetic-only';
const owner = Wallet.createRandom();
const outsider = Wallet.createRandom();
const consoles = [];
let checks = 0;
function check(label, actual, expected) {
  assert.deepEqual(actual, expected, label); checks++; console.log(`PASS: ${label}`);
}
const rpc = createServer(async (req, res) => {
  let text = ''; for await (const chunk of req) text += chunk;
  const { method, id } = JSON.parse(text);
  const result = method === 'info.getNetworkID' ? { networkID: String(NETWORK_ID) } :
    method === 'info.getNetworkName' ? { networkName: TEN_MANG } :
    method === 'info.getNodeVersion' ? { version: '9chaingo/1.14.2' } : '0x218711a09';
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ jsonrpc: '2.0', id, result }));
});
rpc.listen(0, '127.0.0.1'); await once(rpc, 'listening');
const nodeUri = `http://127.0.0.1:${rpc.address().port}`;
async function call(console, route, { method = 'GET', body, credential } = {}) {
  const response = await fetch(console.base + route, { method,
    headers: { 'content-type': 'application/json', ...(credential ? { authorization: `Bearer ${credential}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(5000) });
  return { status: response.status, body: await response.json() };
}
async function start(label, limit = '50') {
  const scratch = path.join(evidence, label);
  const config = path.join(scratch, '9chain-a1-config');
  fs.mkdirSync(config, { recursive: true });
  fs.mkdirSync(path.join(scratch, 'local-net/console'), { recursive: true });
  fs.copyFileSync(path.join(root, 'local-net/console/index.html'), path.join(scratch, 'local-net/console/index.html'));
  const ledger = Buffer.from(JSON.stringify({ chains: [
    { name: 'AuthOwned', admin: owner.address, subnetID: 'SyntheticSubnet1', blockchainID: 'SyntheticChain1', chainId: 9001000198, rpc: nodeUri },
    { name: 'AuthSystem', admin: '', subnetID: 'SyntheticSubnet2', blockchainID: 'SyntheticChain2', chainId: 9001000199, rpc: nodeUri },
  ], retired: [] }, null, 2));
  fs.writeFileSync(path.join(config, 'console-chains.json'), ledger);
  const preload = path.join(scratch, 'deny-processes.mjs');
  fs.writeFileSync(preload, [
    "import cp from 'node:child_process';", "import fs from 'node:fs';", "import {syncBuiltinESMExports} from 'node:module';",
    `const marker = ${JSON.stringify(path.join(scratch, 'unexpected-process.txt'))};`,
    "for (const name of ['exec','execFile','spawn','fork','execSync','execFileSync','spawnSync']) {",
    "  cp[name] = () => { fs.writeFileSync(marker, 'Unexpected child process blocked'); throw new Error('Child processes are forbidden in the authentication fixture'); };",
    '}', 'syncBuiltinESMExports();', '',
  ].join('\n'));
  const reservation = portServer(); reservation.listen(0, '127.0.0.1'); await once(reservation, 'listening');
  const port = reservation.address().port; await new Promise(resolve => reservation.close(resolve));
  const console = { scratch, config, ledger, logs: '', base: `http://127.0.0.1:${port}` };
  console.child = spawn(process.execPath, ['--import', pathToFileURL(preload).href, path.join(root, 'local-net/console/server.mjs')], {
    cwd: scratch, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env,
      NODE_OPTIONS: '', PORT: String(port), NODE_URI: nodeUri, A1_CONSOLE_HOST: '127.0.0.1',
      A1_CONSOLE_TOKEN: token, A1_CLI_KEY: cliKey, A1_CONSOLE_START_PAUSED: '0', A1_DE_CHAIN_MO: '1',
      A1_COMPOSE_FILE: path.join(scratch, 'missing-compose.yml'), A1_L1_ALLOWLIST: '',
      A1_CONSOLE_DOMAIN: 'auth-fixture.invalid', A1_CONSOLE_URI: 'https://auth-fixture.invalid/console',
      A1_LIMIT_REVOKE: limit, A1_LIMIT_CREATE: '50', A1_TRUST_PROXY: '0' },
  });
  consoles.push(console);
  console.child.stdout.on('data', data => { console.logs += data; });
  console.child.stderr.on('data', data => { console.logs += data; });
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (console.child.exitCode !== null || console.child.signalCode !== null) throw new Error('Isolated authentication console exited before readiness');
    try { ready = (await call(console, '/api/progress', { credential: token })).status === 200; } catch { /* Wait for this child. */ }
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 30));
  }
  assert.equal(ready, true, 'Isolated authentication console must listen');
  return console;
}
async function login(console, wallet) {
  const nonce = await call(console, `/api/siwe/nonce?address=${wallet.address}`);
  assert.equal(nonce.status, 200);
  const credentials = { nonce: nonce.body.nonce, signature: await wallet.signMessage(nonce.body.message) };
  const session = await call(console, '/api/siwe/login', { method: 'POST', body: credentials });
  assert.equal(session.status, 200);
  return { token: session.body.token, nonce: nonce.body, credentials, session: session.body };
}
process.on('exit', () => { for (const console of consoles) console.child.kill(); });
try {
  const primary = await start('primary');
  check('missing operator token is rejected', (await call(primary, '/api/status')).status, 401);
  check('wrong operator token is rejected', (await call(primary, '/api/status', { credential: 'wrong' })).status, 401);
  for (const route of ['/api/create', '/api/revoke', '/api/upgrade', '/api/transfer-owner']) {
    check(`unauthenticated ${route} is rejected`, (await call(primary, route, { method: 'POST', body: {} })).status, 401);
  }
  const operator = await call(primary, '/api/status', { credential: token });
  check('operator can read status', operator.status, 200);
  check('operator authentication type', operator.body.dangNhap, 'vanHanh');
  check('operator has no wallet identity', operator.body.viDangNhap, null);
  check('status reads exactly the synthetic ledger', operator.body.chains.map(chain => chain.name), ['AuthOwned', 'AuthSystem']);
  check('status exposes protocol L1 cap', operator.body.tranGiaoThuc, 16);
  const signed = await login(primary, outsider);
  check('nonce names the fixture domain', signed.nonce.message.startsWith('auth-fixture.invalid wants you to sign in'), true);
  check('nonce names the signing wallet', signed.nonce.message.includes(outsider.address), true);
  check('session binds the recovered signer', signed.session.address, outsider.address);
  check('nonce replay is rejected', (await call(primary, '/api/siwe/login', { method: 'POST', body: signed.credentials })).status, 401);
  const badNonce = await call(primary, `/api/siwe/nonce?address=${owner.address}`);
  check('another wallet cannot sign this nonce', (await call(primary, '/api/siwe/login', { method: 'POST', body: {
    nonce: badNonce.body.nonce, signature: await outsider.signMessage(badNonce.body.message) } })).status, 401);
  const walletStatus = await call(primary, '/api/status', { credential: signed.token });
  check('wallet can read status', walletStatus.status, 200);
  check('wallet authentication type', walletStatus.body.dangNhap, 'vi');
  check('status binds the recovered wallet', walletStatus.body.viDangNhap, outsider.address);
  for (const suffix of ['?address=0x1212b2445e74f788b30BfA9C42aa46f252345a0B', '?address=invalid', '']) {
    check(`invalid nonce address ${suffix || '(missing)'}`, (await call(primary, '/api/siwe/nonce' + suffix)).status, 400);
  }
  for (const name of ['AuthOwned', 'AuthSystem']) {
    const denied = await call(primary, '/api/revoke', { method: 'POST', credential: signed.token,
      body: { name, xacNhan: 'wrong' } });
    check(`foreign wallet cannot revoke ${name} before confirmation`, denied.status, 403);
    if (name === 'AuthOwned') check('ownership refusal identifies the actual owner', denied.body.error.includes(owner.address), true);
    check(`foreign wallet cannot revoke ${name} with correct confirmation`, (await call(primary, '/api/revoke', {
      method: 'POST', credential: signed.token, body: { name, xacNhan: name } })).status, 403);
  }
  check('unknown chain is a request error', (await call(primary, '/api/revoke', {
    method: 'POST', credential: signed.token, body: { name: 'MissingChain', xacNhan: 'MissingChain' } })).status, 400);
  for (const xacNhan of [undefined, 'wrong']) {
    check('operator still needs exact revoke confirmation', (await call(primary, '/api/revoke', {
      method: 'POST', credential: token, body: { name: 'AuthOwned', xacNhan } })).status, 400);
  }
  const ownerSession = await login(primary, owner);
  check('owner reaches confirmation validation', (await call(primary, '/api/revoke', { method: 'POST',
    credential: ownerSession.token, body: { name: 'AuthOwned', xacNhan: 'wrong' } })).status, 400);
  for (const [label, text] of [['status', JSON.stringify(walletStatus.body)], ['console log', primary.logs]]) {
    check(`${label} excludes operator token`, text.includes(token), false);
    check(`${label} excludes signing material`, text.includes('PrivateKey-'), false);
  }

  const limited = await start('rate-limit', '1');
  const attempt = { method: 'POST', body: { name: 'MissingChain', xacNhan: 'MissingChain' } };
  for (let count = 0; count < 5; count++) check('unauthenticated calls do not enter wallet quota', (await call(limited, '/api/revoke', attempt)).status, 401);
  const walletA = await login(limited, Wallet.createRandom());
  const walletB = await login(limited, Wallet.createRandom());
  check('wallet A retains its first quota', (await call(limited, '/api/revoke', { ...attempt, credential: walletA.token })).status, 400);
  check('wallet A second mutation hits quota', (await call(limited, '/api/revoke', { ...attempt, credential: walletA.token })).status, 429);
  check('wallet B on the same IP has independent quota', (await call(limited, '/api/revoke', { ...attempt, credential: walletB.token })).status, 400);
  for (let count = 0; count < 5; count++) check('operator bypasses the wallet quota', (await call(limited, '/api/revoke', { ...attempt, credential: token })).status, 400);
  for (const console of consoles) {
    check('synthetic ledger bytes remain unchanged', fs.readFileSync(path.join(console.config, 'console-chains.json')), console.ledger);
    check('authentication never invokes child processes', fs.existsSync(path.join(console.scratch, 'unexpected-process.txt')), false);
    check('no genesis output', fs.readdirSync(path.join(console.config, 'console-tmp')), []);
    check('no chain configuration writes', fs.readdirSync(path.join(console.config, 'chains')), []);
    check('no pending creation journal', fs.existsSync(path.join(console.config, 'creation-journal/pending.json')), false);
    check('no ledger backup was created', fs.existsSync(path.join(console.config, 'console-chains.json.bak')), false);
  }
  console.log(`PASS: ${checks} isolated authentication/ownership/quota checks; no skipped ownership cases`);
} catch (error) {
  console.error(`FAIL: ${error.message}`); process.exitCode = 1;
} finally {
  for (const console of consoles) {
    if (console.child.exitCode === null && console.child.signalCode === null) {
      const closed = once(console.child, 'exit'); console.child.kill(); await closed;
    }
  }
  rpc.closeAllConnections(); await new Promise(resolve => rpc.close(resolve));
  console.log(`Synthetic authentication evidence retained: ${evidence}`);
}
