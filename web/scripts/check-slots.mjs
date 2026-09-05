#!/usr/bin/env node
/**
 * check-slots.mjs — does the LIVE directory still fit under the ceiling the site publishes?
 *
 * ═══ WHAT THIS MEASURES, AND WHY IT IS NOT A UNIT TEST ═══
 * `L1_SLOTS` in `lib/chain.ts` is a hand-copied 15. A unit test can only prove the constant
 * is what it says; it cannot notice the day the world stops agreeing with it. This asks the
 * public directory the site itself reads and compares the two.
 *
 * Two ways it goes red, and they mean different things:
 *   · chains > ceiling  — the constant is WRONG. Every public page is telling visitors a
 *     ceiling the network has already passed, and the badge would render 0 slots left while
 *     chains keep appearing. Fix the constant (and find out how the protocol limit moved).
 *   · directory unreadable — do not deploy a page that computes a public number from a file
 *     that cannot be read. The page itself degrades to a dash, which is correct at runtime;
 *     at deploy time it means the measurement is missing, and this repo does not treat a
 *     missing measurement as a pass.
 *
 * 🔴 IT DOES NOT ASK `/api/status`. That endpoint returns the authoritative `tran`, and it
 * needs a session — so a gate built on it would only run where an operator token exists,
 * i.e. not on the path that publishes the page. This measures exactly the data the anonymous
 * visitor's browser will use.
 *
 * Usage: node web/scripts/check-slots.mjs [https://a1.9chain.org]
 * Exit: 0 pass · 1 red.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const NAY = path.dirname(fileURLToPath(import.meta.url));
const GOC = process.argv[2] ?? 'https://a1.9chain.org';
const URL_DANH_BA = `${GOC.replace(/\/$/, '')}/chains/data/console-chains.json`;

/** Read the ceiling from the source of truth rather than retyping it here. */
function docTran() {
  const s = readFileSync(path.join(NAY, '..', 'lib', 'chain.ts'), 'utf8');
  const m = s.match(/export const L1_SLOTS = (\d+);/);
  if (!m) throw new Error('could not find `export const L1_SLOTS` in lib/chain.ts');
  return Number(m[1]);
}

const tran = docTran();

let du;
try {
  const r = await fetch(URL_DANH_BA, { signal: AbortSignal.timeout(20_000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  du = await r.json();
} catch (e) {
  console.log(`✗ could not read the live directory (${URL_DANH_BA}): ${e.message}`);
  console.log('  The public slot badge is computed from this file. A deploy that cannot');
  console.log('  measure it is a deploy publishing an unverified number.');
  process.exitCode = 1;
}

if (du) {
  const song = Array.isArray(du.chains) ? du.chains.length : null;
  if (song === null) {
    console.log('✗ the directory has no `chains` array — the shape changed');
    process.exitCode = 1;
  } else if (song > tran) {
    console.log(`✗ ${song} chains live, ceiling published on the site is ${tran}`);
    console.log('  The constant `L1_SLOTS` in web/lib/chain.ts is WRONG: every public page');
    console.log('  is quoting a ceiling the network has already passed.');
    process.exitCode = 1;
  } else {
    console.log(`✓ ${song}/${tran} slots used · ${tran - song} left (measured on ${GOC})`);
  }
}
