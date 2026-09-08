#!/usr/bin/env node
/**
 * cli-test.mjs — counter-checks for the flag guard (D-244, P-100).
 *
 * The two cases that opened the milestone are at the top and they are written with the exact
 * strings that were measured on 2026-09-08, not with invented ones: `--dril` on
 * check-chain-ledger and `--self-tset` on check-net-dirs both printed PASS and exited 0.
 * If either of those two ever stops being caught here, the hole is back.
 */
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import {
  EXIT_CANNOT_RUN, editDistance, findUnknownFlags, guardEntry, guardFlags, isEntryModule,
  nearestFlag, unknownFlagMessage,
} from './cli.mjs';

let failures = 0;
let total = 0;
function check(what, fn) {
  total += 1;
  try { fn(); console.log(`  ✓ ${what}`); }
  catch (error) { failures += 1; console.error(`  ✗ ${what}\n      ${error.message}`); }
}

// ── The two real misses that opened D-244 ──────────────────────────────────────────────────
check('--dril is caught and --drill is suggested (the check-chain-ledger miss)', () => {
  const spec = { '--drill': false, '--self-test': false, '--file': true, '--rpc': true };
  const { unknown } = findUnknownFlags(['--dril'], spec);
  assert.deepEqual(unknown, ['--dril']);
  assert.equal(nearestFlag('--dril', Object.keys(spec)), '--drill');
});

check('--self-tset is caught and --self-test is suggested (the check-net-dirs miss)', () => {
  const spec = ['--self-test'];
  const { unknown } = findUnknownFlags(['--self-tset'], spec);
  assert.deepEqual(unknown, ['--self-tset']);
  assert.equal(nearestFlag('--self-tset', spec), '--self-test');
});

// ── The verdict a mistyped flag produces ──────────────────────────────────────────────────
check('guardFlags exits 2, not 1 — a refused flag is NOT a verdict (D-116)', () => {
  const codes = [];
  const stderr = [];
  const realError = console.error;
  console.error = (line) => stderr.push(line);
  try {
    guardFlags(['--dril'], { '--drill': false }, { name: 'gate', exit: (code) => codes.push(code) });
  } finally { console.error = realError; }
  assert.deepEqual(codes, [EXIT_CANNOT_RUN]);
  assert.equal(EXIT_CANNOT_RUN, 2);
  assert.match(stderr.join('\n'), /unknown flag --dril — did you mean --drill\?/);
  assert.match(stderr.join('\n'), /COULD NOT RUN, not a verdict/);
});

check('a declared flag runs through untouched and exit is never called', () => {
  let exited = false;
  const positionals = guardFlags(['--drill', 'ledger.json'], { '--drill': false },
    { name: 'gate', exit: () => { exited = true; } });
  assert.equal(exited, false);
  assert.deepEqual(positionals, ['ledger.json']);
});

// ── Shapes that must NOT be mistaken for a bad flag ────────────────────────────────────────
check('--flag=value checks only the name before the equals sign', () => {
  assert.deepEqual(findUnknownFlags(['--expect=250MiB'], { '--expect': true }).unknown, []);
  assert.deepEqual(findUnknownFlags(['--expct=250MiB'], { '--expect': true }).unknown, ['--expct']);
});

check('a value-taking flag swallows a value that itself starts with a dash', () => {
  const spec = { '--offset-ms': true, '--since': true };
  assert.deepEqual(findUnknownFlags(['--offset-ms', '-250'], spec).unknown, []);
  assert.deepEqual(findUnknownFlags(['--since', '-1h'], spec).unknown, []);
});

check('a BOOLEAN flag does not swallow the next token — a typo after it is still caught', () => {
  // The failure this prevents: declaring every flag as value-taking would make
  // `--self-test --dril` swallow `--dril` and go quiet again.
  const spec = { '--self-test': false, '--drill': false };
  assert.deepEqual(findUnknownFlags(['--self-test', '--dril'], spec).unknown, ['--dril']);
});

check('-- ends flag parsing, so a path starting with a dash stays a positional', () => {
  const { unknown, positionals } = findUnknownFlags(['--', '--weird-file-name'], ['--drill']);
  assert.deepEqual(unknown, []);
  assert.deepEqual(positionals, ['--weird-file-name']);
});

check('a bare negative number is a value, not a flag', () => {
  assert.deepEqual(findUnknownFlags(['-250'], []).unknown, []);
  assert.deepEqual(findUnknownFlags(['-'], []).positionals, ['-']);
});

check('positionals survive: <dir>/allocation.md style arguments are returned, not rejected', () => {
  const { unknown, positionals } = findUnknownFlags(['local-net/net-public/allocation.md'], []);
  assert.deepEqual(unknown, []);
  assert.deepEqual(positionals, ['local-net/net-public/allocation.md']);
});

check('several typos are all reported, not just the first', () => {
  const { unknown } = findUnknownFlags(['--dril', '--fil', 'x'], { '--drill': false, '--file': true });
  assert.deepEqual(unknown, ['--dril', '--fil']);
});

check('an unrelated long flag gets no suggestion rather than a misleading one', () => {
  assert.equal(nearestFlag('--completely-different', ['--drill', '--file']), null);
});

check('the accepted list is printed so the reader can fix it without opening the source', () => {
  const message = unknownFlagMessage('gate', ['--nope'], { '--drill': false, '--file': true });
  assert.match(message, /This gate accepts: --drill · --file/);
});

check('a gate with no flags at all still refuses one', () => {
  const message = unknownFlagMessage('gate', ['--anything'], []);
  assert.match(message, /This gate accepts: \(no flags\)/);
  assert.deepEqual(findUnknownFlags(['--anything'], []).unknown, ['--anything']);
});

// ── A gate is often ALSO a library: the guard must be silent on import ────────────────────
check('isEntryModule is true for the module node was started with', () => {
  // argv[1] in this process is this very test file.
  assert.equal(isEntryModule(import.meta.url), true);
  assert.equal(isEntryModule(pathToFileURL(process.argv[1]).href), true);
});

check('🔴 isEntryModule is FALSE for an imported module — the case that would kill preflight', () => {
  // check-supply.mjs exports measureChain and IS imported. If its guard ran on import it would
  // read the IMPORTER's argv and reject the importer's own flags with exit 2.
  assert.equal(isEntryModule(new URL('./cli.mjs', import.meta.url).href), false);
  assert.equal(isEntryModule(undefined), false);
});

check('guardEntry does nothing when the module is merely imported', () => {
  let exited = false;
  const result = guardEntry(new URL('./cli.mjs', import.meta.url).href, ['--nothing'],
    { exit: () => { exited = true; } });
  assert.equal(exited, false);
  assert.deepEqual(result, []);
});

// ── The distance function itself, since every suggestion rests on it ───────────────────────
check('editDistance is exact on the cases the suggestions depend on', () => {
  assert.equal(editDistance('--dril', '--drill'), 1);
  assert.equal(editDistance('--self-tset', '--self-test'), 2);
  assert.equal(editDistance('abc', 'abc'), 0);
  assert.equal(editDistance('', 'abc'), 3);
});

console.log(failures === 0
  ? `\n✅ PASS — ${total} cases, including the two flags that measured green on 2026-09-08.`
  : `\n🔴 FAIL — ${failures} of ${total} case(s).`);
process.exit(failures === 0 ? 0 : 1);
