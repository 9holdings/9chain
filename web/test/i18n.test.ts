import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { interpolate } from '../lib/i18n';
import vi from '../lib/i18n/dicts/vi';

/**
 * Keep the string extraction from eroding.
 *
 * The way it erodes is always the same: someone adds a string straight into JSX because "it is
 * only one word". This test catches that moment, rather than the moment of translating.
 *
 * 🔴 SINCE 2026-08-27 THIS RULE COSTS MORE, NOT LESS.
 * The site used to be Vietnamese only, so a string leaking into JSX was merely untidy. The site
 * now has **30 languages**: a string written straight into JSX is a sentence that can **never be
 * translated**, and it will sit there in Vietnamese in the middle of an Arabic page — no error,
 * no warning, only the reader bears it.
 * This test still scans for accented Vietnamese characters because that is the easiest signal;
 * it does NOT catch an English string written inline. The real gate for that is `useT()` — the
 * code has nowhere else to get text from.
 */

const GOC = path.resolve(__dirname, '..');

function docTsx(dir: string, ra: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.') || e.name === 'out') continue;
    const p = path.join(dir, e.name);
    if (statSync(p).isDirectory()) docTsx(p, ra);
    else if (e.name.endsWith('.tsx')) ra.push(p);
  }
  return ra;
}

describe('i18n', () => {
  it('interpolate() leaves a missing key visible instead of blank', () => {
    // A silent blank reads as lost data; a visible `{total}` can be fixed immediately.
    expect(interpolate('{left}/{total} left', { left: 3 })).toBe('3/{total} left');
  });

  it('interpolate() substitutes every key that is present', () => {
    // 🔴 Giá trị mong đợi PHẢI là tiếng Việt: nó là đầu ra của `vi.faucet.quotaFormat`, tức
    // của chính từ điển đang được kiểm — không phải dữ liệu tuỳ ý. Lượt dịch chuỗi `2026-09-04`
    // đổi nhầm nó sang tiếng Anh và bài kiểm đỏ ngay, đúng việc nó sinh ra để làm.
    expect(interpolate(vi.faucet.quotaFormat, { left: 3, total: 5, hours: 1 })).toBe('3/5 lượt trong 1 giờ');
  });

  it('no Vietnamese string written straight into JSX', () => {
    // The signal: accented Vietnamese characters sitting between two JSX tags. It does not catch
    // 100% of every possible spelling, but it catches the way people actually do it.
    const nghiVan: string[] = [];
    for (const f of docTsx(GOC)) {
      const noi = readFileSync(f, 'utf8');
      for (const [i, dong] of noi.split('\n').entries()) {
        if (/^\s*(\/\/|\*|\/\*)/.test(dong)) continue; // comments are fine
        if (/>\s*[^<>{}\n]*[àáảãạăâèéẻẽẹêìíỉĩịòóỏõọôơùúủũụưỳýỷỹỵđ][^<>{}\n]*\s*</i.test(dong)) {
          nghiVan.push(`${path.relative(GOC, f).replace(/\\/g, '/')}:${i + 1}  ${dong.trim().slice(0, 70)}`);
        }
      }
    }
    expect(nghiVan, `strings must go through lib/i18n/vi.ts:\n${nghiVan.join('\n')}`).toEqual([]);
  });
});
