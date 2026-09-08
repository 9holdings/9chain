#!/usr/bin/env node
/**
 * http-test.mjs — counter-checks for the request deadline (D-244, P-101).
 *
 * 🔴 The case that matters is the LAST kind of failure, not the first: a server that ACCEPTS the
 * connection and then never writes a byte. A refused connection fails fast on its own and proves
 * nothing about deadlines; a silent accepted socket is the one that hangs a gate forever, and it
 * is what these cases build for real with a `net` server rather than simulate.
 */
import assert from "node:assert/strict";
import net from "node:net";
import http from "node:http";
import { guardEntry } from "./cli.mjs";
import { DEFAULT_TIMEOUT_MS, RequestTimeoutError, fetchJson, fetchWithDeadline } from "./http.mjs";

guardEntry(import.meta.url, ["--self-test"]);

let failures = 0;
let total = 0;
async function check(what, fn) {
  total += 1;
  try { await fn(); console.log(`  ✓ ${what}`); }
  catch (error) { failures += 1; console.error(`  ✗ ${what}\n      ${error.message}`); }
}

/** A server that accepts every connection and answers nothing, ever. */
function silentServer() {
  const sockets = [];
  const server = net.createServer((socket) => { sockets.push(socket); });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve({
      url: `http://127.0.0.1:${server.address().port}/`,
      close: () => { for (const s of sockets) s.destroy(); server.close(); },
    }));
  });
}

function jsonServer(handler) {
  const server = http.createServer(handler);
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve({
      url: `http://127.0.0.1:${server.address().port}/`,
      close: () => server.close(),
    }));
  });
}

console.log("══ COUNTER-CHECKS — a request that is never answered ══\n");

const silent = await silentServer();
try {
  await check("🔴 a server that accepts and never answers is a TIMEOUT inside the budget", async () => {
    const started = Date.now();
    await assert.rejects(
      () => fetchWithDeadline(silent.url, {}, 900),
      (error) => error instanceof RequestTimeoutError && /did not answer within 900ms/.test(error.message),
    );
    const elapsed = Date.now() - started;
    // Generous upper bound: this asserts "it came back", not a stopwatch reading.
    assert.ok(elapsed < 8_000, `took ${elapsed}ms — the deadline did not fire`);
  });

  await check("the error names the URL and the budget, so the log says which call was abandoned", async () => {
    const error = await fetchWithDeadline(silent.url, {}, 300).catch((e) => e);
    assert.equal(error.name, "RequestTimeoutError");
    assert.equal(error.url, silent.url);
    assert.equal(error.timeoutMs, 300);
    assert.equal(error.retryable, true);
    assert.match(error.message, /nothing was measured/);
  });

  await check("🔴 the CONTROL: a bare fetch against the same server does NOT come back in that window",
    async () => {
      // This is what every one of the 28 unguarded call sites was doing. If this case ever starts
      // resolving quickly, the fixture stopped reproducing the bug and the case above proves
      // nothing.
      const raced = await Promise.race([
        fetch(silent.url).then(() => "answered").catch(() => "failed"),
        new Promise((resolve) => setTimeout(() => resolve("still waiting"), 1_500)),
      ]);
      assert.equal(raced, "still waiting");
    });

  await check("🔴 a caller's OWN long budget is not shortened by the 15 s default", async () => {
    // create-rpc-e2e-test.mjs:342 waits 110 000 ms on purpose: nine nodes restarting take ~355 s.
    // If the default were layered on top, that case would abort at 15 s and report a TIMEOUT,
    // which reads as "the console is slow" instead of "a helper overrode the budget".
    const started = Date.now();
    const raced = await Promise.race([
      fetchWithDeadline(silent.url, { signal: AbortSignal.timeout(60_000) })
        .then(() => "answered").catch((e) => `threw ${e.name}`),
      new Promise((resolve) => setTimeout(() => resolve("still waiting"), 1_800)),
    ]);
    assert.equal(raced, "still waiting", `came back after ${Date.now() - started}ms — the default was applied on top`);
  });

  await check("…but an EXPLICIT timeoutMs does combine with the caller's signal, shorter one winning",
    async () => {
      const error = await fetchWithDeadline(silent.url, { signal: AbortSignal.timeout(60_000) }, 400)
        .catch((e) => e);
      assert.ok(error instanceof RequestTimeoutError, `got ${error?.name}`);
      assert.equal(error.timeoutMs, 400);
    });

  await check("a caller's own abort stays the caller's abort — it is not relabelled a timeout",
    async () => {
      const controller = new AbortController();
      setTimeout(() => controller.abort(new Error("caller changed its mind")), 100);
      const error = await fetchWithDeadline(silent.url, { signal: controller.signal }, 30_000).catch((e) => e);
      assert.ok(!(error instanceof RequestTimeoutError),
        `got ${error.name}: reporting a 30s wait that never happened would be a false measurement`);
    });
} finally {
  silent.close();
}

const ok = await jsonServer((req, res) => {
  if (req.url === "/html") { res.writeHead(200, { "content-type": "text/html" }); res.end("<html>Just a moment…</html>"); return; }
  res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify({ hello: "world" }));
});
try {
  await check("a normal answer comes through untouched", async () => {
    const response = await fetchWithDeadline(ok.url, {}, 5_000);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { hello: "world" });
  });

  await check("fetchJson hands back the response too — an HTTP code is never the whole verdict",
    async () => {
      const { response, body, text } = await fetchJson(ok.url, {}, 5_000);
      assert.equal(response.status, 200);
      assert.deepEqual(body, { hello: "world" });
      assert.equal(text, '{"hello":"world"}');
    });

  await check("🔴 HTTP 200 carrying HTML is an error that QUOTES the page, not a bare 'invalid JSON'",
    async () => {
      // The failure this repo keeps meeting: a CDN interstitial or bot wall arriving as 200.
      const error = await fetchJson(`${ok.url}html`, {}, 5_000).catch((e) => e);
      assert.equal(error.name, "NotJsonError");
      assert.equal(error.status, 200);
      assert.match(error.message, /Just a moment/);
      assert.match(error.contentType, /text\/html/);
    });
} finally {
  ok.close();
}

await check("a nonsense budget is refused rather than silently defaulted", async () => {
  for (const bad of [0, -1, 1.5, NaN, "10s"]) {
    await assert.rejects(() => fetchWithDeadline("http://127.0.0.1:1/", {}, bad), RangeError);
  }
});

await check("the default budget is declared once and is 15 s", () => {
  assert.equal(DEFAULT_TIMEOUT_MS, 15_000);
});

console.log(failures === 0
  ? `\n✅ PASS — ${total} cases; the hanging-server control still hangs.`
  : `\n🔴 FAIL — ${failures} of ${total} case(s).`);

// 🔴 `process.exitCode`, NEVER `process.exit()`. This file uses `fetch`, and on Windows calling
// process.exit() with undici's handles still open aborts the process:
//   Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\win\async.c, line 94
// and the shell sees exit 127 — after every case printed ✓. A gate that passes and then reports
// 127 is indistinguishable from a crash, so the run would be read as red. Already written down
// at local-net/lib/chain-ledger.mjs:36; measured again here on 2026-09-08.
process.exitCode = failures === 0 ? 0 : 1;
