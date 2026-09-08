#!/usr/bin/env node
/**
 * console-state-test.mjs — counter-checks for the router contract and secret redaction
 * (D-258, P-106 step 8).
 *
 * 🔴 Both of these fail SILENTLY when they fail. A wrong assignment map does not throw: it builds
 * a router that sends requests to a node which does not serve the chain, and the symptom is a
 * chain that looks like it does not exist from outside while being perfectly healthy inside. A
 * redaction that matches nothing does not throw either — it just puts a key in a log.
 */
import { guardEntry } from '../lib/cli.mjs';
import { counter } from '../../scripts/lib/report.mjs';
import { buildAssignment, redactSecret } from './console-state.mjs';

guardEntry(import.meta.url, ['--self-test']);

const { ok, finish } = counter('COUNTER-CHECK — router contract and redaction');

const PUBLIC = '9chain-a1-node-1';
const opts = { nodeContainer: PUBLIC, port: '9650' };
const chain = (over) => ({ blockchainID: 'bc-1', chainId: 9001000010, name: 'MyChain', subnetID: 'sn-1', ...over });

// ── The every-node model: nothing may change for it ───────────────────────────────────────
{
  const map = buildAssignment([chain({ validators: null })], opts);
  ok('🔴 a chain with NO validators is served by the public node — the every-node model, unchanged',
    map['bc-1'].node === PUBLIC && map['bc-1'].validators === null);
  ok('its uri is the public node reached as a container on the compose network',
    map['bc-1'].uri === `http://${PUBLIC}:9650`);
  ok('the row carries what the router needs to route and a person needs to read it',
    map['bc-1'].chainId === 9001000010 && map['bc-1'].name === 'MyChain' && map['bc-1'].subnetID === 'sn-1');
  ok('a validators field that is not an array is treated as absent, not as a list of one',
    buildAssignment([chain({ validators: 'node-2' })], opts)['bc-1'].node === PUBLIC);
}

// ── The per-node model ────────────────────────────────────────────────────────────────────
{
  const withPublic = buildAssignment([chain({ validators: ['node-3', PUBLIC, 'node-5'] })], opts);
  ok('🔴 when the public node IS a validator it serves the chain — nothing changes for those chains',
    withPublic['bc-1'].node === PUBLIC,
    'that is what keeps the per-node model from moving traffic it does not have to move');

  const without = buildAssignment([chain({ validators: ['node-3', 'node-5', 'node-7'] })], opts);
  ok('when the public node is NOT a validator, the FIRST validator serves it',
    without['bc-1'].node === 'node-3');
  ok('and the uri points at that node, not at the public one',
    without['bc-1'].uri === 'http://node-3:9650');
  ok('the validator list is carried through unchanged, so the router can see the whole set',
    without['bc-1'].validators.join() === 'node-3,node-5,node-7');

  ok('🔴 rollout ORDER decides the server, not sorting — first in the list, whatever it is named',
    buildAssignment([chain({ validators: ['node-9', 'node-2'] })], opts)['bc-1'].node === 'node-9');
}

// ── Shape ─────────────────────────────────────────────────────────────────────────────────
{
  const many = buildAssignment([
    chain({ blockchainID: 'bc-1' }),
    chain({ blockchainID: 'bc-2', name: 'Second', validators: ['node-4'] }),
  ], opts);
  ok('every chain gets a row, keyed by blockchainID — the key the router looks up',
    Object.keys(many).join() === 'bc-1,bc-2');
  ok('a row has exactly the six fields of the contract',
    Object.keys(many['bc-2']).join() === 'node,uri,chainId,name,subnetID,validators');

  ok('no chains is an empty map, not a throw', Object.keys(buildAssignment([], opts)).length === 0);
  ok('a missing chain list is an empty map too', Object.keys(buildAssignment(undefined, opts)).length === 0);
  ok('🔴 no public node name is refused — every row would otherwise say "undefined"',
    (() => { try { buildAssignment([chain({})], { port: '9650' }); return false; } catch { return true; } })());
  ok('the port is whatever the console was told, not a hardcoded one',
    buildAssignment([chain({})], { nodeContainer: PUBLIC, port: '9750' })['bc-1'].uri.endsWith(':9750'));
}

// ── Redaction ─────────────────────────────────────────────────────────────────────────────
{
  const KEY = 'PrivateKey-averyrealisticlookingsecretvalue';
  ok('the secret is replaced wherever it appears',
    redactSecret(`docker run -e A1_CLI_KEY=${KEY} node`, KEY, '<A1_CLI_KEY>')
      === 'docker run -e A1_CLI_KEY=<A1_CLI_KEY> node');
  ok('🔴 EVERY occurrence goes, not just the first',
    redactSecret(`${KEY} and again ${KEY}`, KEY, '<K>') === '<K> and again <K>');
  ok('text without the secret is untouched', redactSecret('nothing here', KEY, '<K>') === 'nothing here');
  ok('null and undefined become the empty string rather than the word "null"',
    redactSecret(null, KEY) === '' && redactSecret(undefined, KEY) === '');
  ok('a non-string is stringified first, so an Error object is still scrubbed',
    redactSecret(new Error(`failed with ${KEY}`), KEY, '<K>').includes('<K>'));

  ok('🔴 an EMPTY secret THROWS — it would otherwise match between every character', (() => {
    // "abc".split("").join("<K>") is "a<K>b<K>c": the message becomes rubbish at exactly the
    // moment someone is reading it to diagnose a failure.
    for (const empty of ['', null, undefined, 12345]) {
      try { redactSecret('abc', empty); return false; } catch { /* expected */ }
    }
    return true;
  })(), 'requireSecret makes this impossible in the console today — but that guarantee lives 300 lines away');
  ok('the refusal explains the mechanism rather than just saying "invalid"',
    (() => { try { redactSecret('abc', ''); return false; } catch (e) { return /between every character/.test(e.message); } })());
}

process.exitCode = finish('an empty needle is refused, and the public node keeps serving what it validates');
