#!/usr/bin/env node
/**
 * chain-ownership-test.mjs — counter-checks for who may govern which chain (D-255, P-106 step 5).
 *
 * 🔴 This is a rule about spend authority over a permanent resource, so the cases that matter are
 * the REFUSALS. A gate on ownership that has only been tested with the owner has been tested with
 * the one caller it was never meant to stop.
 */
import { guardEntry } from '../lib/cli.mjs';
import { counter } from '../../scripts/lib/report.mjs';
import { assertChainOwner, createRoleReader, findGovernableChain } from './chain-ownership.mjs';

guardEntry(import.meta.url, ['--self-test']);

const { ok, finish } = counter('COUNTER-CHECK — chain ownership');

const OWNER = '0x1212b2445e74f788B30BfA9C42aa46f252345a0B';
const OTHER = '0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC';
const operator = { kieu: 'vanHanh' };
const wallet = (address) => ({ kieu: 'vi', diaChi: address });

const state = {
  chains: [
    { name: 'MyChain', admin: OWNER, blockchainID: 'bc-1' },
    { name: 'SystemChain', blockchainID: 'bc-2' },
    { name: 'GoingAway', admin: OWNER, thuHoi: { batDau: 1 } },
  ],
  retired: [{ name: 'OldChain' }],
};

const threw = (fn) => { try { fn(); return null; } catch (error) { return error; } };

// ── Finding the chain ─────────────────────────────────────────────────────────────────────
ok('a live chain is found by name', findGovernableChain(state, 'MyChain').blockchainID === 'bc-1');
ok('surrounding whitespace is trimmed, not treated as a different name',
  findGovernableChain(state, '  MyChain  ').name === 'MyChain');

ok('🔴 a REVOKED chain says it was revoked — not "not found"',
  /has been revoked/.test(threw(() => findGovernableChain(state, 'OldChain')).message),
  'the three refusals need different actions from the reader; collapsing them costs the only clue');
ok('🔴 an unknown name says it is not in the directory — that reads as a typo, which it usually is',
  /No L1 named/.test(threw(() => findGovernableChain(state, 'Nonexistent')).message));
ok('🔴 a chain MID-REVOCATION is refused, and says so',
  /being revoked right now/.test(threw(() => findGovernableChain(state, 'GoingAway')).message));
ok('the three refusals are three different sentences', (() => {
  const messages = ['OldChain', 'Nonexistent', 'GoingAway'].map((n) => threw(() => findGovernableChain(state, n)).message);
  return new Set(messages).size === 3;
})());

ok('an empty name is refused before anything is searched',
  /Missing the chain name/.test(threw(() => findGovernableChain(state, '')).message));
ok('null and undefined are refused the same way',
  /Missing the chain name/.test(threw(() => findGovernableChain(state, null)).message)
  && /Missing the chain name/.test(threw(() => findGovernableChain(state, undefined)).message));
ok('🔴 name matching is EXACT — a different case is a different chain here',
  /No L1 named/.test(threw(() => findGovernableChain(state, 'mychain')).message),
  'the console decides case-collision at CREATION; this lookup must not quietly widen it');

// ── Who may govern ────────────────────────────────────────────────────────────────────────
const mine = state.chains[0];
const systemChain = state.chains[1];

ok('the owner may govern their own chain', threw(() => assertChainOwner(mine, wallet(OWNER))) === null);
ok('the operator token may govern any chain',
  threw(() => assertChainOwner(mine, operator)) === null
  && threw(() => assertChainOwner(systemChain, operator)) === null);

ok('🔴 ANOTHER wallet is refused with 403 — it is known, and it is not the owner', (() => {
  const error = threw(() => assertChainOwner(mine, wallet(OTHER)));
  return error?.status === 403;
})());
ok('the 403 names both the real owner and the wallet that asked', (() => {
  const message = threw(() => assertChainOwner(mine, wallet(OTHER))).message;
  return message.includes(OWNER) && message.includes(OTHER);
})());

ok('🔴 NO identity is 401, not 403 — "I do not know you" and "not your chain" are different facts',
  threw(() => assertChainOwner(mine, null))?.status === 401,
  'a client that cannot tell them apart cannot decide whether signing in again would help');
ok('an identity shape nobody planned for is 401, not waved through',
  threw(() => assertChainOwner(mine, { kieu: 'something-new' }))?.status === 401);
ok('a wallet identity with no address is 401',
  threw(() => assertChainOwner(mine, { kieu: 'vi' }))?.status === 401);

ok('🔴 casing does not decide ownership — EIP-55 is a checksum, not an identity', (() => {
  return threw(() => assertChainOwner(mine, wallet(OWNER.toLowerCase()))) === null
    && threw(() => assertChainOwner(mine, wallet(OWNER.toUpperCase()))) === null;
})(), 'refusing a correct wallet over casing would lock an owner out of their own chain');

ok('🔴 a chain with NO admin is operator-only — an empty owner is not "everyone"', (() => {
  const error = threw(() => assertChainOwner(systemChain, wallet(OWNER)));
  return error?.status === 403 && /system chain/.test(error.message);
})());
ok('an admin field that is blank or not a string is treated as no admin', (() => {
  return threw(() => assertChainOwner({ name: 'X', admin: '   ' }, wallet(OWNER)))?.status === 403
    && threw(() => assertChainOwner({ name: 'X', admin: 12345 }, wallet(OWNER)))?.status === 403;
})());

// ── The role reader ───────────────────────────────────────────────────────────────────────
ok('🔴 the role reader refuses to be built without an rpc caller',
  threw(() => createRoleReader({})) !== null);

await (async () => {
  const seen = [];
  const readRole = createRoleReader({
    rpc: async (...args) => { seen.push(args); return '0xrole'; },
    encodeReadAllowList: (address) => `encoded(${address})`,
    decodeRole: (hex) => `decoded(${hex})`,
  });
  const role = await readRole('/ext/bc/bc-1/rpc', '0xPRECOMPILE', OWNER);
  ok('the role reader asks eth_call on the precompile and decodes what comes back',
    role === 'decoded(0xrole)' && seen[0][1] === 'eth_call'
    && seen[0][2][0].to === '0xPRECOMPILE' && seen[0][2][0].data === `encoded(${OWNER})`);
  ok('it reads at "latest", not at a pinned block', seen[0][2][1] === 'latest');
})();

process.exitCode = finish('every refusal is tested, and casing never decides ownership');
