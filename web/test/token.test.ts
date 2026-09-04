import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
// `allowJs` lets TS infer types straight from the .mjs file — no separate declaration needed.
import { catKhoi, bam } from '../scripts/sync-tokens.mjs';

/**
 * Catch DRIFT in the token system between A1 and 9Scan-A1.
 *
 * The two repos are deliberately independent (not gathered into a shared package — see the top of
 * `scripts/sync-tokens.mjs`), so "the same colour system" is a promise with nothing behind it
 * except this measurement. Without it, two surfaces of the same product drift apart gradually and
 * nobody notices until a user clicks back and forth between them.
 *
 * 🔴 This test SKIPS if the 9Scan repo is not present, and says so. Making it red on a machine
 * without the other repo teaches people to ignore test results — far more expensive than one
 * missing measurement.
 */
const NGUON = 'C:/PROJECTS/9Scan-A1/app/globals.css';
const TOKENS = path.resolve(__dirname, '..', 'app', 'tokens.css');

describe('the token system', () => {
  it('tokens.css declares its own fingerprint', () => {
    const css = readFileSync(TOKENS, 'utf8');
    expect(css).toMatch(/Vân tay: [0-9a-f]{16}/);
  });

  it('no hex hard-coded outside the token block', () => {
    // Every colour code must live in tokens.css. A hex leaking into a component is the first place
    // two surfaces start to diverge, and it never reveals itself.
    //
    // 🔴 RELAXED 2026-08-27, with the reason stated so nobody relaxes it further:
    // this test reads COMMENTS TOO, so a comment recording a measurement — for example
    // *"`bg-surface-alt` is byte-identical to the page background: light #f5f7fb / dark #0a1122"* —
    // also turned it red. But a hex in a comment is **evidence of a measurement**, not a colour
    // being painted; it cannot drift because it does not run.
    // Banning it teaches people to write vague comments ("the backgrounds look a bit similar"),
    // i.e. it breaks exactly what this project depends on.
    // ⇒ Strip comments BEFORE scanning. The intent is unchanged: a hex in the **CODE** is still banned.
    const boChuThich = (s: string) =>
      s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');

    const urlPath = ['components/ui/index.tsx', 'components/SiteHeader.tsx', 'app/faucet/FaucetForm.tsx'];
    for (const d of urlPath) {
      const p = path.resolve(__dirname, '..', d);
      if (!existsSync(p)) continue;
      const code = boChuThich(readFileSync(p, 'utf8'));
      expect(code, `${d} must contain no hex in the CODE (comments are fine)`).not.toMatch(
        /#[0-9a-fA-F]{6}\b/,
      );
    }
  });

  it.skipIf(!existsSync(NGUON))('the fingerprint matches 9Scan-A1', () => {
    const goc = readFileSync(NGUON, 'utf8');
    const vanGoc = bam(catKhoi(goc, '@theme') + catKhoi(goc, "html[data-theme='dark'] {"));
    const vanChep = /Vân tay: ([0-9a-f]{16})/.exec(readFileSync(TOKENS, 'utf8'))?.[1];
    expect(
      vanChep,
      'the tokens have drifted — run `node web/scripts/sync-tokens.mjs` then look over the UI again',
    ).toBe(vanGoc);
  });
});
