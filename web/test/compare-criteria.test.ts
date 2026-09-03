import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { EN } from '../lib/i18n/en';

/**
 * Every criterion in the /compare/ table must have BOTH a name and a note in the dictionary, and
 * conversely the dictionary must not hold keys for criteria that are gone.
 *
 * ═══ WHY NO OTHER GATE CAN SEE THIS ═══
 * `ComparisonTable` looks text up by a CONCATENATED key: `t.compare['crit' + c.id]`. Being a
 * concatenation, `tsc` cannot check it, and a mistyped `id` renders `undefined` — a blank cell in
 * the middle of the table, in **all 30 languages at once**, with no error and no warning.
 *   • `i18n-shape` is blind: it compares the 30 dictionaries WITH EACH OTHER, so "all 30 missing
 *     it" is perfectly valid.
 *   • `check-dict-values` is blind: no value changed, it is only that nobody reads it.
 *   • `check-interpolate` is blind: these keys have no placeholders.
 * ⇒ The right measurement joins the CRITERIA ARRAY to the DICTIONARY, in BOTH DIRECTIONS.
 *
 * The `id`s are read straight from the source rather than importing the array: `GOC` is not
 * exported, and exporting it just so a test can read it means letting the test reshape the product.
 */
const NGUON = path.resolve(__dirname, '..', 'app', 'compare', 'ComparisonTable.tsx');

describe('bảng /compare/ — tiêu chí ↔ từ điển', () => {
  const src = readFileSync(NGUON, 'utf8');
  const ids = [...src.matchAll(/\{ id: '(\w+)',/g)].map((m) => m[1]);
  const compare = EN.compare as unknown as Record<string, string>;

  it('đọc được mảng tiêu chí (nếu không, mọi khẳng định dưới đây là xanh giả)', () => {
    // 🔴 Without this line, a change to the array's shape leaves `ids` empty and every loop
    // below runs zero times and reports green — the gate switching itself off unnoticed.
    expect(ids.length, 'không đọc ra tiêu chí nào từ ComparisonTable.tsx').toBeGreaterThan(0);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it('mọi tiêu chí có đủ tên và ghi chú', () => {
    for (const id of ids) {
      expect(compare[`crit${id}`], `thiếu compare.crit${id}`).toBeTruthy();
      expect(compare[`note${id}`], `thiếu compare.note${id}`).toBeTruthy();
    }
  });

  it('từ điển không giữ tiêu chí đã bỏ khỏi bảng', () => {
    const treo = Object.keys(compare)
      .filter((k) => /^(crit|note)[A-Z]/.test(k))
      .filter((k) => !ids.includes(k.replace(/^(crit|note)/, '')));
    expect(treo, 'khoá tiêu chí không còn ai tra tới').toEqual([]);
  });
});
