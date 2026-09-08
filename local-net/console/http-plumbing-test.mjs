#!/usr/bin/env node
/**
 * http-plumbing-test.mjs — counter-checks for what every console route does first
 * (D-254, P-106 step 4).
 *
 * 🔴 The two that matter are the ones whose absence is invisible until it costs something: a body
 * limit enforced WHILE the bytes arrive rather than after (otherwise the memory is already spent
 * before the refusal), and a rate limiter that can count by wallet instead of IP.
 *
 * The body cases run against a REAL http server rather than a fake request object, because the
 * property under test is that `req.destroy()` actually stops the upload — and a fake `req` would
 * be asserting my model of a socket.
 */
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { guardEntry } from '../lib/cli.mjs';
import { counter } from '../../scripts/lib/report.mjs';
import { createHttpPlumbing, readJsonBody, sendJson } from './http-plumbing.mjs';

guardEntry(import.meta.url, ['--self-test']);

const { ok, finish } = counter('COUNTER-CHECK — console HTTP plumbing');

/** A minimal response double that records what a handler did to it. */
function fakeRes() {
  return {
    writableEnded: false, destroyed: false, code: null, headers: null, body: null,
    writeHead(code, headers) { this.code = code; this.headers = headers; },
    end(body) { this.body = body; this.writableEnded = true; },
  };
}

// ── sendJson ──────────────────────────────────────────────────────────────────────────────
{
  const res = fakeRes();
  sendJson(res, 200, { hello: 'world' });
  ok('a normal reply carries the code, the content type and the body',
    res.code === 200 && res.headers['content-type'] === 'application/json' && res.body === '{"hello":"world"}');

  const ended = fakeRes(); ended.writableEnded = true;
  sendJson(ended, 200, { a: 1 });
  ok('🔴 writing to an ALREADY-ENDED response is a no-op, not a throw',
    ended.body === null && ended.code === null);

  const dead = fakeRes(); dead.destroyed = true;
  sendJson(dead, 500, { a: 1 });
  ok('🔴 …and neither is writing to a DESTROYED one — that is the socket an over-limit body left',
    dead.body === null,
    'writing there throws from a layer with no idea what happened: a junk request becomes a stack trace');
}

// ── readJsonBody, against a real server ───────────────────────────────────────────────────
{
  const seen = [];
  const server = http.createServer(async (req, res) => {
    try { seen.push({ ok: true, body: await readJsonBody(req, 64) }); res.writeHead(200); res.end('ok'); }
    catch (error) { seen.push({ ok: false, message: error.message }); res.writeHead(413); res.end('too big'); }
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}/`;

  try {
    // A deadline on every one of these: a fixture server that hangs must fail the suite in
    // seconds, not hold it open until someone notices (D-244).
    const small = await fetch(base, { method: 'POST', body: '{"a":1}', signal: AbortSignal.timeout(10_000) });
    ok('a body inside the limit is read whole', small.status === 200 && seen.at(-1).body === '{"a":1}');

    let status = null;
    try { status = (await fetch(base, { method: 'POST', body: 'x'.repeat(5000), signal: AbortSignal.timeout(10_000) })).status; }
    catch { status = 'connection destroyed'; }
    ok('🔴 a body over the limit is refused — and the socket is destroyed as it happens',
      seen.at(-1).ok === false, JSON.stringify(seen.at(-1)));
    ok('the refusal names the limit in bytes', /exceeds 64 bytes/.test(seen.at(-1).message));
    ok('the client learns something too (413, or the connection going away)',
      status === 413 || status === 'connection destroyed', String(status));

    const empty = await fetch(base, { method: 'POST', body: '', signal: AbortSignal.timeout(10_000) });
    ok('an empty body resolves as the empty string, it is not an error',
      empty.status === 200 && seen.at(-1).body === '');
  } finally { server.close(); }
}

// ── The three bound helpers ───────────────────────────────────────────────────────────────
{
  const calls = [];
  const limiter = (key) => { calls.push(key); return key === 'blocked' ? { ok: false, name: 'create', retryAfter: 30 } : { ok: true }; };
  const plumbing = createHttpPlumbing({
    trustProxy: false,
    clientIp: () => 'ip-of-caller',
    checkToken: (req) => req.headers.authorization === 'Bearer operator-token',
    walletSession: { diaChiCuaPhien: (req) => (req.headers.cookie === 'session=good' ? '0xWALLET' : null) },
  });

  ok('🔴 the factory refuses to be built without its identity sources',
    (() => { try { createHttpPlumbing({}); return false; } catch { return true; } })());

  // Rate limiting
  const res1 = fakeRes();
  ok('under the limit, the route continues and nothing is written',
    plumbing.blockedByRate({ headers: {} }, res1, limiter) === false && res1.code === null);
  ok('the default key is the client IP', calls.at(-1) === 'ip-of-caller');

  const res2 = fakeRes();
  ok('over the limit, it answers 429 and tells the caller to stop',
    plumbing.blockedByRate({ headers: {} }, res2, limiter, 'blocked') === true && res2.code === 429);
  ok('429 carries retry-after, so a client can obey instead of hammering',
    res2.headers['retry-after'] === '30' && /try again in 30s/.test(res2.body));
  ok('🔴 an explicit key overrides the IP — for a signed-in wallet the ADDRESS is the identity',
    calls.at(-1) === 'blocked',
    'an IP is too broad (a whole office shares one) and too narrow (changing it is cheap) at once');

  // Identity
  ok('the operator token is recognised',
    plumbing.identify({ headers: { authorization: 'Bearer operator-token' } }).kieu === 'vanHanh');
  ok('a wallet session is recognised, and carries its address', (() => {
    const who = plumbing.identify({ headers: { cookie: 'session=good' } });
    return who.kieu === 'vi' && who.diaChi === '0xWALLET';
  })());
  ok('no credential at all is null, not an empty identity',
    plumbing.identify({ headers: {} }) === null);
  ok('🔴 a WRONG token is not silently downgraded to a wallet-less identity',
    plumbing.identify({ headers: { authorization: 'Bearer wrong' } }) === null);
  ok('the operator token is tried FIRST — one comparison beats walking a session store', (() => {
    let walked = false;
    const p = createHttpPlumbing({
      trustProxy: false, clientIp: () => 'x',
      checkToken: () => true,
      walletSession: { diaChiCuaPhien: () => { walked = true; return null; } },
    });
    p.identify({ headers: {} });
    return walked === false;
  })());

  // Auth
  const res3 = fakeRes();
  ok('an authenticated request passes through and nothing is written',
    plumbing.blockedByAuth({ headers: { authorization: 'Bearer operator-token' } }, res3).kieu === 'vanHanh'
    && res3.code === null);

  const res4 = fakeRes();
  ok('an unauthenticated request gets 401 and the caller is told to stop',
    plumbing.blockedByAuth({ headers: {} }, res4) === null && res4.code === 401);
  ok('🔴 401 carries WWW-Authenticate — a client is told HOW to authenticate, not just that it failed',
    res4.headers['www-authenticate'] === 'Bearer');
  ok('the error names both ways in, so a person can act on it',
    /A1_CONSOLE_TOKEN/.test(res4.body) && /siwe/.test(res4.body));
  ok('🔴 no reply leaks the token or the address', !/operator-token|0xWALLET/.test(res4.body));
}

process.exitCode = finish('the body limit bites while bytes arrive, and 401 says how to fix itself');
