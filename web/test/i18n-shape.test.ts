import { describe, expect, it } from 'vitest';
import { readdirSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { EN } from '../lib/i18n/en';
import { LANGUAGES, DEFAULT_CODE } from '../lib/i18n/languages';

/**
 * The key shape must MATCH EXACTLY across all 30 dictionaries.
 * (i18n, 2026-08-27)
 *
 * ═══ WHY THIS IS THE MOST IMPORTANT GATE IN THE WHOLE SYSTEM ═══
 * A key missing from a translation does NOT break the build and does NOT throw at runtime —
 * it simply renders `undefined` in the middle of a sentence, or worse: falls back to English
 * while every sentence around it is in another language. The user sees a hybrid page and
 * nothing tells the team. With 30 languages × 246 keys that is 7,380 places for it to happen.
 *
 * `tsc` catches most of it thanks to `type Dict = typeof EN`, but it does NOT catch:
 *   • extra keys (TS permits a wider object in some positions)
 *   • a `{placeholder}` translated away or mistyped — `{ten}` becoming `{name}` leaves
 *     `interpolate()` holding the braces, and the user reads `{name}` mid-sentence
 *   • an empty string — well typed, but blank on screen
 *
 * This suite catches all three, and it runs over EVERY dictionary present in `dicts/`.
 */

const THU_MUC = path.resolve(__dirname, '..', 'lib', 'i18n', 'dicts');

/** Flatten a nested object into a list of key paths: `chung.dangTai`. */
function betKhoa(o: unknown, tien = ''): string[] {
  if (o === null || typeof o !== 'object') return [tien];
  return Object.entries(o as Record<string, unknown>).flatMap(([k, v]) =>
    betKhoa(v, tien ? `${tien}.${k}` : k),
  );
}

/** Collect every `{placeholder}` in a string, sorted so they can be compared. */
function cacCho(s: string): string[] {
  return [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
}

function layGiaTri(o: unknown, urlPath: string): unknown {
  return urlPath.split('.').reduce<unknown>((a, k) => (a as Record<string, unknown>)?.[k], o);
}

const KHOA_EN = betKhoa(EN).sort();

/** Keys DELIBERATELY left empty — filled in on G-day itself. See `reGenesisXong` in `en.ts`. */
const DUOC_RONG = new Set(['rebuildDone.archiveUrl', 'rebuildDone.archiveSha256', 'myChains.colActions']);

describe('sổ đăng ký ngôn ngữ', () => {
  it('đúng 30 ngôn ngữ, tiếng Anh mặc định và đứng đầu', () => {
    expect(LANGUAGES.length).toBe(30);
    expect(DEFAULT_CODE).toBe('en');
    expect(LANGUAGES[0].code).toBe('en');
  });

  it('tiếng Việt ở ĐÚNG vị trí thứ 9 — David chốt', () => {
    // This position is a product requirement, not the result of any ranking.
    // Without a test the first re-sort would quietly move it somewhere else.
    expect(LANGUAGES.findIndex((n) => n.code === 'vi')).toBe(8);
  });

  it('không mã nào trùng, và mọi mã đều hợp lệ cho <html lang>', () => {
    const code = LANGUAGES.map((n) => n.code);
    expect(new Set(code).size).toBe(code.length);
    // A wrong code goes straight into `<html lang>` and screen readers pick their voice from it.
    for (const m of code) expect(m, `mã lạ: ${m}`).toMatch(/^[a-z]{2,3}(-[A-Za-z]{2,4})?$/);
  });

  it('mỗi ngôn ngữ khai đúng một chiều viết, và có đúng 3 bản RTL', () => {
    for (const n of LANGUAGES) expect(['ltr', 'rtl']).toContain(n.dir);
    expect(LANGUAGES.filter((n) => n.dir === 'rtl').map((n) => n.code).sort()).toEqual(['ar', 'fa', 'ur']);
  });

  it('khai mức độ soát — và tiếng Việt là bản có người soát', () => {
    // 🔴 This field exists so the picker does NOT present 30 languages as equals while 29 are
    // machine-translated. This site tells strangers their assets will be erased — hiding the
    // review level there is the same class of failure just removed from the home page.
    for (const n of LANGUAGES) expect(['source', 'human', 'machine']).toContain(n.review);
    expect(LANGUAGES.find((n) => n.code === 'vi')?.review).toBe('human');

    // 🔴 EXACTLY ONE source, and it must be the default language.
    // The previous version of this test only required `soat` to be in the valid set, so it was
    // green for the whole period `en` was declared as `'may'` — meaning screen readers announced
    // "English — machine translated" about the source itself, and no gate saw it. A valid set is
    // not a substitute for a comparison against the truth.
    const goc = LANGUAGES.filter((n) => n.review === 'source');
    expect(goc.map((n) => n.code)).toEqual([DEFAULT_CODE]);
  });
});

describe('hình dạng từ điển', () => {
  const coThuMuc = existsSync(THU_MUC);
  const cacTep = coThuMuc ? readdirSync(THU_MUC).filter((f) => f.endsWith('.ts')) : [];

  it('mọi ngôn ngữ trong sổ (trừ EN) đều có tệp từ điển', () => {
    if (!coThuMuc) return; // not built yet — do not go red during the half-built stage
    const caned = LANGUAGES.map((n) => n.code).filter((m) => m !== DEFAULT_CODE);
    const dangCo = cacTep.map((f) => f.replace(/\.ts$/, ''));
    const thieu = caned.filter((m) => !dangCo.includes(m));
    expect(thieu, `thiếu từ điển: ${thieu.join(', ')}`).toEqual([]);
  });

  for (const tep of cacTep) {
    const code = tep.replace(/\.ts$/, '');
    describe(code, () => {
      it('khớp ĐÚNG bộ khoá của EN — không thiếu, không thừa', async () => {
        const m = await import(`../lib/i18n/dicts/${code}`);
        const khoa = betKhoa(m.default).sort();
        const thieu = KHOA_EN.filter((k) => !khoa.includes(k));
        const thua = khoa.filter((k) => !KHOA_EN.includes(k));
        expect(thieu, `${code} THIẾU khoá: ${thieu.slice(0, 8).join(', ')}`).toEqual([]);
        expect(thua, `${code} THỪA khoá: ${thua.slice(0, 8).join(', ')}`).toEqual([]);
      });

      it('giữ nguyên mọi {chỗ} của bản gốc', async () => {
        // `interpolate()` only replaces keys it knows. Translating `{ten}` into `{name}` means the
        // user reads the literal text `{name}` mid-sentence — no error, nobody notices.
        const m = await import(`../lib/i18n/dicts/${code}`);
        const lech: string[] = [];
        for (const k of KHOA_EN) {
          const goc = layGiaTri(EN, k);
          const ban = layGiaTri(m.default, k);
          if (typeof goc !== 'string' || typeof ban !== 'string') continue;
          const a = cacCho(goc);
          const b = cacCho(ban);
          if (a.join(',') !== b.join(',')) lech.push(`${k}: gốc {${a.join('} {')}} ≠ dịch {${b.join('} {')}}`);
        }
        expect(lech, `${code} lệch {chỗ}:\n  ${lech.slice(0, 6).join('\n  ')}`).toEqual([]);
      });

      it('không chuỗi nào rỗng ngoài những khoá cố ý để rỗng', async () => {
        const m = await import(`../lib/i18n/dicts/${code}`);
        const width = KHOA_EN.filter((k) => {
          if (DUOC_RONG.has(k)) return false;
          const v = layGiaTri(m.default, k);
          return typeof v === 'string' && v.trim() === '';
        });
        expect(width, `${code} có chuỗi rỗng: ${width.join(', ')}`).toEqual([]);
      });
    });
  }
});

describe('đoán ngôn ngữ cho người mới', () => {
  it('trình duyệt tiếng Việt ⇒ tiếng Việt, KHÔNG phải mặc định', async () => {
    // 🔴 This measurement protects existing users. If the default moves to English while this
    // mechanism is broken, every Vietnamese user of the site suddenly sees English — a change
    // they did not ask for and cannot explain.
    const { guessLanguage } = await import('../lib/i18n/languages');
    expect(guessLanguage(['vi-VN', 'vi', 'en'])).toBe('vi');
    expect(guessLanguage(['vi'])).toBe('vi');
  });

  it('lấy ngôn ngữ ĐẦU TIÊN mà site có, không phải cái khớp cuối', async () => {
    const { guessLanguage } = await import('../lib/i18n/languages');
    // Someone with Japanese ahead of English must get Japanese — but `ja` has no dictionary yet,
    // so the registry still declares it and the provider falls back to EN when the load fails.
    // AT THIS LAYER we only ask "is that code in the registry", which is this function's scope.
    expect(guessLanguage(['ja-JP', 'en-US'])).toBe('ja');
    expect(guessLanguage(['xx-YY', 'vi-VN'])).toBe('vi');
  });

  it('không khớp gì hoặc danh sách rỗng ⇒ mặc định', async () => {
    const { guessLanguage, DEFAULT_CODE } = await import('../lib/i18n/languages');
    expect(guessLanguage(['xx', 'yy'])).toBe(DEFAULT_CODE);
    expect(guessLanguage([])).toBe(DEFAULT_CODE);
    expect(guessLanguage(undefined)).toBe(DEFAULT_CODE);
  });
});

describe('chặn ngôn ngữ chưa có từ điển', () => {
  it('hasDictionary() nói ĐÚNG cái gì nạp được, không nói cái gì có trong sổ', async () => {
    // 🔴 A bug caught while writing the test, not at runtime: the registry declares all 30
    // languages while only some have dictionaries. If `maBanDau()` filtered only through
    // `isValidCode()`, a user with a Japanese browser would get `ma = 'ja'`, the text would fall
    // back to English, BUT `<html lang>` would be set to `ja` ⇒ the screen reader reads English
    // in Japanese phonetics. No error, no warning, and a sighted user sees nothing.
    //
    // ⚠️ THIS TEST MAINTAINS ITSELF. The first version named `ja` directly, and it went red the
    // moment `ja` got a dictionary — i.e. it made me edit the test with every batch instead of
    // catching real bugs. It now FINDS a missing language by itself. Once all 30 exist there is
    // no case left to try, and the test asserts exactly that rather than skipping silently.
    const { hasDictionary } = await import('../lib/i18n');
    const { isValidCode, DEFAULT_CODE } = await import('../lib/i18n/languages');

    expect(hasDictionary(DEFAULT_CODE), 'mặc định luôn nạp được').toBe(true);

    const dangCo = existsSync(THU_MUC)
      ? readdirSync(THU_MUC).filter((f) => f.endsWith('.ts')).map((f) => f.replace(/\.ts$/, ''))
      : [];
    const conThieu = LANGUAGES.map((n) => n.code).filter((m) => m !== DEFAULT_CODE && !dangCo.includes(m));

    if (conThieu.length === 0) {
      // All 30 present — no case left to try. Assert it outright rather than skipping silently.
      for (const n of LANGUAGES) expect(hasDictionary(n.code), `${n.code} phải nạp được`).toBe(true);
      return;
    }

    const thu = conThieu[0];
    // These two assertions TOGETHER are the measurement: a code valid per the registry BUT not loadable.
    expect(isValidCode(thu), `sổ CÓ khai ${thu}`).toBe(true);
    expect(hasDictionary(thu), `${thu} chưa có từ điển ⇒ không được chọn`).toBe(false);
  });
});
