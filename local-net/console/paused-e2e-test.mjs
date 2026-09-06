#!/usr/bin/env node
// Verify the closed creation gate through a real isolated console process.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { mkdirSync, mkdtempSync, existsSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
mkdirSync(path.join(root, 'work'), { recursive: true });
const scratch = mkdtempSync(path.join(root, 'work', 'paused-console-'));
mkdirSync(path.join(scratch, 'local-net/console'), { recursive: true });
copyFileSync(path.join(root, 'local-net/console/index.html'), path.join(scratch, 'local-net/console/index.html'));
const reservation = createServer();
reservation.listen(0, '127.0.0.1');
await once(reservation, 'listening');
const port = reservation.address().port;
await new Promise(resolve => reservation.close(resolve));
const token = `synthetic-operator-token-${port}`;
const child = spawn(process.execPath, [path.join(root, 'local-net/console/server.mjs')], {
  cwd: scratch, windowsHide: true,
  env: { ...process.env, PORT: String(port), A1_CONSOLE_HOST: '127.0.0.1',
    A1_CONSOLE_TOKEN: token, A1_CLI_KEY: 'PrivateKey-synthetic-not-valid',
    A1_DE_CHAIN_MO: '0', NODE_URI: 'http://127.0.0.1:1',
    A1_COMPOSE_FILE: path.join(scratch, 'does-not-exist.yml') },
  stdio: 'ignore',
});
let spawnError;
child.on('error', error => { spawnError = error; });
const base = `http://127.0.0.1:${port}`;
try {
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    if (spawnError) throw spawnError;
    if (child.exitCode !== null) throw new Error(`Console exited ${child.exitCode}`);
    try {
      const response = await fetch(`${base}/api/status`, {
        headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(500),
      });
      if (response.status === 200) { ready = true; break; }
    } catch { /* wait for this child to listen */ }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready, 'The isolated console must start');
  const response = await fetch(`${base}/api/create`, {
    method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Paused Gate Test' }), signal: AbortSignal.timeout(3000),
  });
  const body = await response.json();
  assert.equal(response.status, 400, 'Creation must remain refused');
  assert.match(body.error, /Chain creation is paused/);
  assert.doesNotMatch(body.error, /\b20\d{2}-\d{2}-\d{2}\b|will be erased|being rebuilt|A1_DE_CHAIN_MO/,
    'A generic pause must not promise a dated rebuild, erasure or expose operator configuration');
  assert.equal(existsSync(path.join(scratch, '9chain-a1-config/console-chains.json')), false,
    'A paused request must not create a ledger');
  console.log('PASS: real HTTP creation gate refuses without stale dates or ledger writes');
} catch (error) {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (child.exitCode === null && !spawnError) {
    const exited = once(child, 'exit');
    child.kill();
    await exited;
  }
}
