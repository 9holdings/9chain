import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { formatNumber } from '../lib/numbers';

/**
 * The gate for language-aware number formatting.
 *
 * 🔴 THIS TEST DELIBERATELY DOES NOT READ THE REAL BLOCK HEIGHT.
 * The network was just reborn, so `eth_blockNumber` = 1, and with a single digit **every language
 * prints it identically**. A test measured through the network would be green today, green after
 * G-day (the network returns to 1), and **prove nothing at all** — precisely the "green because
 * it measures the wrong quantity" class this project has paid for repeatedly. So: measure the
 * function directly, with a number large enough to force a separator to appear.
 */
describe('number formatting by language', () => {
  const N = 1_234_567;

  it('English uses commas', () => {
    expect(formatNumber(N, 'en')).toBe('1,234,567');
  });

  it('Vietnamese and German use dots', () => {
    expect(formatNumber(N, 'vi')).toBe('1.234.567');
    expect(formatNumber(N, 'de')).toBe('1.234.567');
  });

  /**
   * 🔴 THE REVERSE CHECK — the most important half of this file.
   * The bug being fixed is "every language comes out Vietnamese-style". If someone hard-codes a
   * locale again, the two assertions above can STILL be green (vi and de coincide). This one
   * requires two languages to come out DIFFERENT — i.e. the function genuinely reads its `ma`
   * argument.
   */
  it('two languages with different conventions must differ', () => {
    expect(formatNumber(N, 'en')).not.toBe(formatNumber(N, 'vi'));
  });

  it('keeps Latin digits even in languages with their own numerals (D-web-2)', () => {
    // `ar` defaults to Arabic-Indic digits `١٢٣`. Block height has to be comparable against the
    // explorer and a wallet — both of which print Latin digits.
    const s = formatNumber(N, 'ar');
    expect(s).toMatch(/[0-9]/);
    expect(s).not.toMatch(/[٠-٩۰-۹]/);
  });

  it('a junk language code does not throw, and does NOT fall back to vi-VN', () => {
    expect(formatNumber(N, 'khong-phai-locale-!!')).toBe('1,234,567');
  });
});

/**
 * A regression gate: nobody may hard-code a locale into a formatting call again.
 * It lives here rather than in the linter for a readable reason: it carries the WHY with it.
 */
describe('no hard-coded locale is left', () => {
  const GOC = path.resolve(__dirname, '..');
  const BO_QUA = new Set(['node_modules', 'out', '.next', 'test']);

  function quet(thuMuc: string, ra: string[] = []): string[] {
    for (const m of readdirSync(thuMuc, { withFileTypes: true })) {
      if (BO_QUA.has(m.name)) continue;
      const p = path.join(thuMuc, m.name);
      if (m.isDirectory()) quet(p, ra);
      else if (/\.tsx?$/.test(m.name)) ra.push(p);
    }
    return ra;
  }

  it('no source file calls toLocaleString with a fixed locale', () => {
    const pham: string[] = [];
    for (const p of quet(GOC)) {
      // `lib/numbers.ts` is allowed — it is the ONLY place that knows about locales, and it reads its argument.
      // 🔴 THE FILE WAS RENAMED `so.ts` → `numbers.ts` (2026-09-03, the English-code rule), and
      // this exemption list still pointed at the old name ⇒ it stopped matching, so the test
      // accused THE VERY FIX it exists to protect. An exemption keyed by FILE NAME is something
      // that breaks silently on every rename; here it broke in the safe direction (red, not falsely
      // green) so it was caught immediately.
      if (p.endsWith(`lib${path.sep}numbers.ts`)) continue;
      // 🔴 STRIP COMMENTS BEFORE SCANNING (fixed 2026-09-03).
      // The previous version scanned whole files, so it accused `app/chains/DirectoryContent.tsx`
      // purely because that file's header comment EXPLAINS this rule by citing
      // `toLocaleString('vi-VN')` as an example. A gate that complains about its own documentation
      // is a gate somebody is about to remove — and with it the real measurement. What reaches the
      // browser is the CODE, so scan only the code.
      const noiDung = readFileSync(p, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '');
      // Catch `toLocaleString('xx')` / `Intl.NumberFormat('xx')` with a literal string.
      if (/(toLocaleString|Intl\.(NumberFormat|DateTimeFormat))\(\s*['"]/.test(noiDung)) {
        pham.push(path.relative(GOC, p));
      }
    }
    expect(
      pham,
      `use \`formatNumber(n, ma)\` from \`lib/numbers.ts\` instead of hard-coding a locale — see the comment there. Offenders: ${pham.join(', ')}`,
    ).toEqual([]);
  });
});
