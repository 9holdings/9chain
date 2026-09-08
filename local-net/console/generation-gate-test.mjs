#!/usr/bin/env node
/**
 * generation-gate-test.mjs — counter-checks for the refusal that protects immutable chainIds
 * (D-257, P-106 step 7).
 *
 * 🔴 Three of the four verdicts are REFUSALS, and they are the reason this gate exists. A chainId
 * issued into the wrong generation lives in a genesis nobody can edit — not the console, not the
 * operator, not the chain's owner. So the cases here are mostly about refusing, and about
 * refusing with the RIGHT remedy: a correct diagnosis carrying the wrong fix sends someone to
 * change the one thing that was already right.
 */
import { guardEntry } from '../lib/cli.mjs';
import { counter } from '../../scripts/lib/report.mjs';
import { judgeGeneration } from './generation-gate.mjs';

guardEntry(import.meta.url, ['--self-test']);

const { ok, finish } = counter('COUNTER-CHECK — the generation gate');

const BAND = { networkId: 999999998, name: '9chain-a1-g1', floor: 9001000000, ceiling: 9001999999 };
const DRILL = { networkId: 899999998, name: '9chain-a1-tap-g1', floor: 8001000000, ceiling: 8001999999 };
const bandOfNetworkId = (id) => (id === 999999998 ? 'real' : id === 899999998 ? 'drill' : 'other');
const real = { gen: 1, band: BAND, drillBand: false, api: 'http://node:9650', bandOfNetworkId };
const drill = { ...real, band: DRILL, drillBand: true };

// ── The happy path ────────────────────────────────────────────────────────────────────────
ok('the right network on a real console matches',
  judgeGeneration({ networkId: 999999998, networkName: '9chain-a1-g1' }, real).status === 'match');
ok('the drill network on a drill console matches',
  judgeGeneration({ networkId: 899999998, networkName: '9chain-a1-tap-g1' }, drill).status === 'match');
ok('a match still says what it saw, so a startup line is worth reading',
  /networkID 999999998/.test(judgeGeneration({ networkId: 999999998, networkName: '9chain-a1-g1' }, real).why));
ok('a drill match SAYS it is a drill — a console that quietly serves the drill band is a trap',
  /DRILL BAND/.test(judgeGeneration({ networkId: 899999998, networkName: '9chain-a1-tap-g1' }, drill).why));

// ── Could not measure ─────────────────────────────────────────────────────────────────────
ok('🔴 an unreachable node is UNMEASURED — not a match, and not a mismatch either', (() => {
  const verdict = judgeGeneration({ error: 'connect ECONNREFUSED' }, real);
  return verdict.status === 'unmeasured' && verdict.why.includes('ECONNREFUSED');
})(), '"I could not ask" is a refusal, not a shrug — the console must not create anything on it');
ok('the unmeasured reason says WHY it refuses, not just that it failed',
  /permanent/.test(judgeGeneration({ error: 'x' }, real).why));
ok('the unmeasured reason names the node it could not reach',
  judgeGeneration({ error: 'x' }, real).why.includes('http://node:9650'));

ok('🔴 a networkID that is not a number is UNMEASURED, never compared', (() => {
  return ['not-a-number', undefined, {}, NaN, 1.5, [], true]
    .every((networkId) => judgeGeneration({ networkId, networkName: 'x' }, real).status === 'unmeasured');
})(), 'comparing NaN would be false against every band and would read as a mismatch');

// 🔴 The case that found a real defect carried in from server.mjs.
ok('🔴 null and "" are UNMEASURED, not networkID ZERO', (() => {
  return [null, '', '   '].every((networkId) =>
    judgeGeneration({ networkId, networkName: 'x' }, real).status === 'unmeasured');
})(), 'Number(null) === 0 and Number.isSafeInteger(0) is true, so a node that answered NOTHING used '
   + 'to be reported as a MISMATCH on network 0 — wrong verdict, wrong remedy, stated confidently');
ok('a numeric STRING is still accepted — that is how JSON-RPC often answers',
  judgeGeneration({ networkId: '999999998', networkName: '9chain-a1-g1' }, real).status === 'match');
ok('the unreadable-number reason quotes what was returned',
  /"not-a-number"/.test(judgeGeneration({ networkId: 'not-a-number' }, real).why));

// ── Mismatch ──────────────────────────────────────────────────────────────────────────────
ok('a different generation is a mismatch',
  judgeGeneration({ networkId: 999999999, networkName: '9chain-a1-g0' }, real).status === 'mismatch');
ok('the mismatch names both what was expected and what was found', (() => {
  const why = judgeGeneration({ networkId: 999999999, networkName: '9chain-a1-g0' }, real).why;
  return why.includes('999999998') && why.includes('999999999') && why.includes('9chain-a1-g0');
})());
ok('the mismatch says where the fix is', (() => {
  const why = judgeGeneration({ networkId: 999999999, networkName: 'x' }, real).why;
  return why.includes('A1_GEN') && why.includes('chainid.mjs');
})());

ok('🔴 the right networkID with the WRONG NAME is still a mismatch',
  judgeGeneration({ networkId: 999999998, networkName: '9chain-a1-g0' }, real).status === 'mismatch',
  'a renamed network is a different network, and the name is half the identity');
ok('a node that does not report a name at all is judged on the id alone',
  judgeGeneration({ networkId: 999999998, networkName: undefined }, real).status === 'match');

// ── The two mismatches that must NOT be told the same thing ───────────────────────────────
ok('🔴 a DRILL console on the REAL network is its own refusal, and it does NOT say to change A1_GEN', (() => {
  const why = judgeGeneration({ networkId: 999999998, networkName: '9chain-a1-g1' }, drill).why;
  return why.includes('A1_DRILL_BAND') && !why.includes('A1_GEN');
})(), 'the generic message says to fix A1_GEN; here the fix is the opposite, and that is the whole point');
ok('…and it explains the damage it is preventing, in numbers', (() => {
  const why = judgeGeneration({ networkId: 999999998, networkName: '9chain-a1-g1' }, drill).why;
  return why.includes('8001000000') && why.includes('immutable');
})());

ok('🔴 a REAL console on a DRILL node gets a hint, not the same lecture', (() => {
  const why = judgeGeneration({ networkId: 899999998, networkName: '9chain-a1-tap-g1' }, real).why;
  return why.includes('A1_DRILL_BAND=1 to serve it') && why.includes('A1_GEN');
})(), 'this mismatch has a cheap correct remedy, so it keeps the bump instructions AND adds the hint');
ok('an unrelated network gets NO drill hint — a wrong hint is worse than none',
  !judgeGeneration({ networkId: 12345, networkName: 'somewhere-else' }, real).why.includes('A1_DRILL_BAND=1 to serve it'));

// ── Section 0 ─────────────────────────────────────────────────────────────────────────────
ok('🔴 every verdict is English — an operator reads all four, and two of them used to be Vietnamese',
  [
    judgeGeneration({ error: 'x' }, real).why,
    judgeGeneration({ networkId: 'x' }, real).why,
    judgeGeneration({ networkId: 999999999, networkName: 'g0' }, real).why,
    judgeGeneration({ networkId: 999999998, networkName: '9chain-a1-g1' }, drill).why,
    judgeGeneration({ networkId: 999999998, networkName: '9chain-a1-g1' }, real).why,
  ].every((why) => !/[^\x00-\x7F]/.test(why.replace(/[·–—"]/g, ''))),
  'a message whose language depends on which branch produced it is worse than either language');

ok('the three statuses are the three English words the console switches on',
  new Set([
    judgeGeneration({ error: 'x' }, real).status,
    judgeGeneration({ networkId: 999999999 }, real).status,
    judgeGeneration({ networkId: 999999998, networkName: '9chain-a1-g1' }, real).status,
  ]).size === 3);

process.exitCode = finish('three of four verdicts refuse, and each refusal carries its own remedy');
