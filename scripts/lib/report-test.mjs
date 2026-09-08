#!/usr/bin/env node
/**
 * report-test.mjs — counter-checks for the counter-check helper (D-247, P-102).
 *
 * The one that matters is the exit code: a helper whose tally is right but whose code is wrong
 * would hand a false verdict to every gate that adopts it.
 */
import assert from 'node:assert/strict';
import { guardEntry } from '../../local-net/lib/cli.mjs';
import { EXIT, cannotRun, counter } from './report.mjs';

guardEntry(import.meta.url, ['--self-test']);

const lines = [];
const log = (line) => lines.push(line);
let failures = 0;
const say = (what, condition) => {
  if (condition) console.log(`  ✓ ${what}`);
  else { failures += 1; console.log(`  🔴 ${what}`); }
};

console.log('══ COUNTER-CHECK — the tally, and the code it returns ══\n');

// ── Codes ──
say('the three codes are 0 / 1 / 2', EXIT.PASS === 0 && EXIT.RED === 1 && EXIT.CANNOT_RUN === 2);
say('the table is frozen — a gate cannot redefine what 2 means', Object.isFrozen(EXIT));

// ── All passing ──
{
  lines.length = 0;
  const c = counter('title', { log });
  c.ok('one', true); c.ok('two', true);
  const code = c.finish('nothing broke');
  say('all passing ⇒ exit 0', code === EXIT.PASS);
  say('the tally counts every case', c.total === 2 && c.failures === 0);
  say('the summary text reaches the reader', lines.at(-1).includes('2 case(s); nothing broke'));
  say('a ✓ is printed per passing case', lines.filter((l) => l.startsWith('  ✓')).length === 2);
}

// ── One failing ──
{
  lines.length = 0;
  const c = counter(null, { log });
  c.ok('good', true);
  c.ok('bad', false, 'here is why');
  const code = c.finish();
  say('🔴 one failing case ⇒ exit 1, never 0', code === EXIT.RED);
  say('the failing line carries its detail', lines.some((l) => l.includes('here is why')));
  say('the tally names how many of how many', lines.at(-1).includes('1 of 2'));
  say('no title ⇒ no header line', !lines[0].startsWith('══'));
}

// ── A case whose body throws ──
{
  lines.length = 0;
  const c = counter(null, { log });
  c.check('throws', () => { throw new Error('boom'); });
  say('🔴 a case that THROWS is a failure, not a crash', c.failures === 1);
  say('…and the message is shown, so it is debuggable', lines.some((l) => l.includes('boom')));

  c.check('returns false', () => false);
  say('🔴 returning false is a failure', c.failures === 2);
  c.check('returns nothing', () => {});
  say('returning undefined is a PASS — a case that ran without asserting is not a failure',
    c.failures === 2);
}

// ── ok() gives its answer back, so a case can gate the next one ──
{
  const c = counter(null, { log: () => {} });
  say('ok() returns the condition', c.ok('x', true) === true && c.ok('y', false) === false);
}

// ── cannotRun ──
{
  lines.length = 0;
  const code = cannotRun('the fork tree is dirty', 'commit or clean it first', { log });
  say('🔴 cannotRun returns 2, not 1 — nothing was measured (D-116)', code === EXIT.CANNOT_RUN);
  say('it says out loud that this is not a verdict',
    lines.join('\n').includes('not a verdict'));
  say('the "how" line is printed when given', lines.join('\n').includes('commit or clean it first'));
}

// ── The property that made this file necessary ──
say('finish() does NOT exit the process — the caller keeps control (Windows/undici, exit 127)',
  typeof counter(null, { log: () => {} }).finish() === 'number');

console.log(failures === 0
  ? '\n✅ PASS — the tally is right and so is the code it returns.'
  : `\n🔴 FAIL — ${failures} case(s).`);
process.exitCode = failures === 0 ? 0 : 1;
