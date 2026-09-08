#!/usr/bin/env node
/**
 * node-health-test.mjs — counter-checks for what a managed node's answers mean
 * (D-256, P-106 step 6).
 *
 * 🔴 Two rules here were learned from real failures and had no test:
 *   - the PRIMARY-network verdict must read P, X and C individually, because the overall flag
 *     folds in the subnet being created — false during exactly the operation it guards;
 *   - a chain can be HEALTHY and still be running the WRONG upgrade file, and reporting that as
 *     success is what the 2026-09-05 drill caught the undo path doing.
 */
import { guardEntry } from '../lib/cli.mjs';
import { counter } from '../../scripts/lib/report.mjs';
import {
  extractJson, judgeChainConfig, judgeChainHealth, judgePrimaryHealth, judgeWaitStep, servesChain,
} from './node-health.mjs';

guardEntry(import.meta.url, ['--self-test']);

const { ok, finish } = counter('COUNTER-CHECK — reading a managed node');

const health = (checks) => JSON.stringify({ jsonrpc: '2.0', id: 1, result: { checks } });
const clean = { P: {}, X: {}, C: {} };

// ── extractJson ───────────────────────────────────────────────────────────────────────────
ok('a bare JSON object parses', extractJson('{"a":1}').a === 1);
ok('🔴 compose noise around the JSON does not stop it being read',
  extractJson('service node-1 is up\n{"a":1}\nDone\n').a === 1,
  'compose writes its own lines to the same stream; that noise is compose being compose, not an error');
ok('nested braces do not truncate the object',
  extractJson('x {"a":{"b":2}} y').a.b === 2);
ok('🔴 nothing parseable is null — every caller reads that as "not answering", not as "answered no"',
  extractJson('curl: (7) Failed to connect') === null && extractJson('') === null && extractJson(null) === null);
ok('a broken object is null rather than a throw', extractJson('{"a":') === null);

// ── The primary network ───────────────────────────────────────────────────────────────────
ok('P, X and C all clean is ready', judgePrimaryHealth(health(clean)).ok === true);
ok('the reason is stated even on success, so a log line says what was checked',
  /P\/X\/C/.test(judgePrimaryHealth(health(clean)).why));

ok('🔴 one chain in error is NOT ready, and the reason names WHICH chain', (() => {
  const verdict = judgePrimaryHealth(health({ P: {}, X: { error: 'bootstrapping' }, C: {} }));
  return verdict.ok === false && verdict.why.includes('X-Chain') && verdict.why.includes('bootstrapping');
})());
ok('a missing check is not ready either — absent is not clean', (() => {
  const verdict = judgePrimaryHealth(health({ P: {}, C: {} }));
  return verdict.ok === false && /no X-Chain check yet/.test(verdict.why);
})());
ok('an error object, not a string, is still rendered rather than printed as [object Object]',
  /"code":5/.test(judgePrimaryHealth(health({ P: { error: { code: 5 } }, X: {}, C: {} })).why));

ok('🔴 an UNRELATED subnet in error does not make the primary network unready',
  judgePrimaryHealth(health({ ...clean, 'some-subnet-id': { error: 'syncing' } })).ok === true,
  'the overall flag folds that in, which is why it is not the quantity read here');

ok('an unparseable answer is not ready, and says so',
  judgePrimaryHealth('curl: (7) Failed to connect').why === 'health response not parseable');
ok('a valid JSON answer with no checks is not ready',
  judgePrimaryHealth('{"result":{}}').why === 'health response has no checks');

// ── One L1 ────────────────────────────────────────────────────────────────────────────────
ok('a clean chain check is ready', judgeChainHealth(health({ 'bc-1': {} }), 'bc-1').ok === true);
ok('🔴 a chain with no check YET is not ready — that is the state right after creation', (() => {
  const verdict = judgeChainHealth(health(clean), 'bc-1');
  return verdict.ok === false && verdict.why.includes('bc-1');
})());
ok('a chain check carrying an error is not ready and quotes it',
  /VM not initialised/.test(judgeChainHealth(health({ 'bc-1': { error: 'VM not initialised' } }), 'bc-1').why));
ok('another chain being healthy says nothing about this one',
  judgeChainHealth(health({ 'bc-OTHER': {} }), 'bc-1').ok === false);

// ── Which file the node came up with ──────────────────────────────────────────────────────
const shapeOf = (list) => list.map((u) => Object.keys(u)[0]).join(',');
ok('the upgrade shape is read from what the node reports', (() => {
  const out = JSON.stringify({ result: { upgrades: { precompileUpgrades: [{ txAllowListConfig: {} }] } } });
  return judgeChainConfig(out, shapeOf).shape === 'txAllowListConfig';
})());
ok('🔴 a node with NO precompileUpgrades key is the empty shape, not an error',
  judgeChainConfig(JSON.stringify({ result: { upgrades: {} } }), shapeOf).shape === '',
  'upgrades is always present and precompileUpgrades is not (D-186 gotcha 2)');
ok('an RPC error is reported, not read as an empty shape',
  judgeChainConfig(JSON.stringify({ error: { message: 'method not found' } }), shapeOf).ok === false);
ok('an unreachable chain RPC is not parseable rather than empty',
  judgeChainConfig('curl: (22)', shapeOf).ok === false);

// ── Still serving? ────────────────────────────────────────────────────────────────────────
ok('a chainId answer means the node still serves the chain',
  servesChain('{"jsonrpc":"2.0","id":1,"result":"0x1dce59240"}') === true);
ok('🔴 anything that is not a result is NOT serving — including an error and a dead API',
  servesChain('{"error":{"message":"unknown chain"}}') === false
  && servesChain('curl: (7) Failed to connect') === false && servesChain('') === false,
  'for a revocation the question is whether it is still reachable, not why it is not');

// ── The wait step: healthy is not the same as correct ─────────────────────────────────────
ok('healthy with no shape expected is done',
  judgeWaitStep({ ok: true }, null, undefined).ok === true);
ok('healthy AND running the expected file is done',
  judgeWaitStep({ ok: true }, { ok: true, shape: 'a,b' }, 'a,b').ok === true);

ok('🔴 HEALTHY but running the WRONG file is NOT done — the drill caught the undo path here', (() => {
  const verdict = judgeWaitStep({ ok: true }, { ok: true, shape: 'new' }, 'old');
  return verdict.ok === false && verdict.why.includes('loaded "new"') && verdict.why.includes('expected "old"');
})(), 'a restart proves the node went down; it does not say which file it came back with');

ok('the empty shape is named "empty" rather than printed as nothing', (() => {
  const verdict = judgeWaitStep({ ok: true }, { ok: true, shape: 'x' }, '');
  return verdict.why.includes('expected "empty"');
})());
ok('an unhealthy chain is returned as-is, with its own reason', (() => {
  const verdict = judgeWaitStep({ ok: false, why: 'chain bc-1: still bootstrapping' }, null, 'x');
  return verdict.ok === false && /still bootstrapping/.test(verdict.why);
})());
ok('healthy but the config could not be read is not done, and keeps that reason',
  judgeWaitStep({ ok: true }, { ok: false, why: 'eth_getChainConfig not parseable' }, 'x').why
    === 'eth_getChainConfig not parseable');

// ── Section 0 on the product path ─────────────────────────────────────────────────────────
ok('🔴 every reason this module produces is English — they are interpolated into user errors', (() => {
  const reasons = [
    judgePrimaryHealth('nope').why,
    judgePrimaryHealth('{"result":{}}').why,
    judgePrimaryHealth(health({ P: {}, C: {} })).why,
    judgePrimaryHealth(health(clean)).why,
    judgeChainHealth(health(clean), 'bc-1').why,
    judgeChainConfig('nope', shapeOf).why,
    judgeWaitStep({ ok: true }, { ok: true, shape: 'a' }, 'b').why,
  ];
  // 🔴 Non-ASCII, expressed as a RANGE rather than as a list of Vietnamese letters. An earlier
  // version spelled the alphabet out and `check-english-code` went red on this very file — the
  // third time in one session that quoting the thing under test broke section 0. These reasons
  // are plain English sentences, so any byte outside ASCII is the signal.
  return reasons.every((why) => typeof why === 'string' && !/[^ -]/.test(why));
})(), 'eip55.mjs was Vietnamese until a dump of the console error sentences found one on the product path');

process.exitCode = finish('healthy is not the same as correct, and unparseable is not the same as no');
