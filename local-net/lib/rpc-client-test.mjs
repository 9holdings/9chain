#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { requestRpc } from './rpc-client.mjs';

let responseMode = 'ok';
const replies = {
  ok: { jsonrpc: '2.0', id: 1, result: 7 },
  null: { jsonrpc: '2.0', id: 1, result: null },
  wrongId: { jsonrpc: '2.0', id: 2, result: 7 },
  wrongVersion: { jsonrpc: '1.0', id: 1, result: 7 },
  missingResult: { jsonrpc: '2.0', id: 1 },
  both: { jsonrpc: '2.0', id: 1, result: 7, error: { message: 'ambiguous' } },
  badError: { jsonrpc: '2.0', id: 1, error: null },
  rpcError: { jsonrpc: '2.0', id: 1, error: { message: 'VM starting' } },
  rootArray: [],
};
const server = createServer(async (req, res) => {
  for await (const _ of req) { /* consume the request */ }
  if (responseMode === 'headersHang' || responseMode === 'bodyHang') {
    if (responseMode === 'bodyHang') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.write('{"jsonrpc":"2.0",');
    }
    // A finite delay also permits an independent control without an AbortSignal.
    const timer = setTimeout(() => {
      if (!res.headersSent) res.writeHead(200, { 'content-type': 'application/json' });
      res.end(responseMode === 'bodyHang' ? '"id":1,"result":7}' : JSON.stringify(replies.ok));
    }, 500);
    res.on('close', () => clearTimeout(timer));
    return;
  }
  res.writeHead(responseMode === 'httpError' ? 503 : 200, { 'content-type': 'application/json' });
  res.end(responseMode === 'invalidJson' ? '{broken' : JSON.stringify(replies[responseMode] ?? replies.ok));
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const url = `http://127.0.0.1:${server.address().port}`;
let cases = 0;
try {
  assert.equal(await requestRpc(url, 'test'), 7); cases++;
  responseMode = 'null';
  assert.equal(await requestRpc(url, 'test'), null); cases++;
  for (const [mode, pattern, retryable] of [
    ['httpError', /HTTP 503/, true],
    ['wrongId', /request ID/, false],
    ['wrongVersion', /version/, false],
    ['missingResult', /exactly one/, false],
    ['both', /exactly one/, false],
    ['badError', /malformed error/, false],
    ['rpcError', /VM starting/, true],
    ['rootArray', /version or request ID/, false],
    ['invalidJson', /invalid JSON/, false],
  ]) {
    responseMode = mode;
    await assert.rejects(requestRpc(url, 'test'), error =>
      pattern.test(error.message) && error.retryable === retryable, mode);
    cases++;
  }
  for (const mode of ['headersHang', 'bodyHang']) {
    responseMode = mode;
    const started = Date.now();
    await assert.rejects(requestRpc(url, 'test', [], { timeoutMs: 75 }), /timed out after 75ms/);
    assert.ok(Date.now() - started < 450, 'the deadline must fire before the delayed response');
    cases++;
    // Control: without the deadline, the same endpoint is reachable but takes 500ms.
    const controlStart = Date.now();
    const control = await fetch(url, { method: 'POST', body: '{}' });
    assert.equal((await control.json()).result, 7);
    assert.ok(Date.now() - controlStart >= 450, 'the control must actually experience the delay');
    cases++;
  }
  await assert.rejects(requestRpc(url, 'test', [], { timeoutMs: 0 }), /positive integer/); cases++;
  responseMode = 'ok';
  assert.equal(await requestRpc(url, 'test'), 7); cases++;
  console.log(`PASS: ${cases} RPC transport/envelope cases, including header/body deadlines and slow controls`);
} finally {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
