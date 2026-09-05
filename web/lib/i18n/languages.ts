/**
 * The language registry — the ONE source for: code, endonym, writing direction, display
 * order and the **review level** of each translation.
 *
 * ═══ THREE OF DAVID'S DECISIONS, WRITTEN DOWN SO NOBODY "CORRECTS" THEM ═══
 * ① **English is the default.** Until 2026-08-27 this site was Vietnamese only and
 *    defaulted to Vietnamese. A stranger opening `a1.9chain.org` now meets English first.
 * ② **Exactly 30 languages**, chosen by number of speakers worldwide.
 * ③ **Vietnamese sits 9th in the display list** — not by speaker count (by that it would
 *    land around 21st). This is a deliberate choice, in keeping with the project's
 *    motif of the number 9.
 * 🔴 Because ③ is a DELIBERATE EXCEPTION sitting inside a list ordered by another rule,
 *    it looks exactly like a sorting bug. `test/i18n.test.ts` pins that position — anyone
 *    "tidying the order" gets a red test with the reason, instead of changing it silently.
 *
 * ═══ 🔴 `soat` — WHY A FIELD LIKE THIS HAS TO EXIST ═══
 * `vi.ts` sets the `[?]` rule: any string an agent invented carries a mark until David
 * has approved its VOICE. The 28 machine translations below are 28 bodies of text **nobody
 * on the team can read well enough to review** — including `/re-genesis/`, the page that
 * tells strangers their assets are about to be erased.
 * ⇒ Do not hide that behind 30 flags that all look equal. A `soat: 'may'` language is
 *   declared in each entry's `aria-label`, plus a sentence of explanation at the foot of
 *   the picker (`components/LanguagePicker.tsx`).
 *   ⚠️ The old comment pointed at `BanDich.tsx` — **that file does not exist**, and never
 *   existed in this tree. A dead pointer in documentation costs exactly what it costs when
 *   the next person goes looking for it to fix the disclosure and finds nothing.
 * ⚠️ Do NOT remove that disclosure to "look more professional". It is precisely what
 *   separates these 30 languages from the 10 languages our sibling project C1 had to
 *   REMOVE on 26/08 for being *"fake multilingual — click one and it is all English"*.
 * ⇒ Raise a language to `'nguoi'` if AND ONLY IF somebody who reads that language has
 *   reviewed it. Changing this field is a declaration, not a tweak.
 */

/**
 * `'goc'` = THE SOURCE, not a translation · `'nguoi'` = reviewed by a person ·
 * `'may'` = machine-translated, nobody has read it back.
 *
 * 🔴 `'goc'` WAS ADDED 2026-09-03 BECAUSE ENGLISH WAS BEING DECLARED WRONGLY.
 * Before that there were only two values, so `en` — the language the other 29 are
 * TRANSLATED FROM — was forced to take `'may'`. The measured consequence on the live
 * build: the `aria-label` of the first entry in the picker read out as **"English —
 * machine translated"**, i.e. the screen reader said the exact opposite of the sentence
 * of explanation directly beneath it ("the English text is the source of truth").
 *
 * Why NOT just promote `en` to `'nguoi'` and be done: `'nguoi'` is the claim "somebody
 * who reads that language has reviewed it" — a measurement about a PROCESS. The source
 * is not in that process: it was never translated, so there is nothing to review back.
 * Merging the two under one label destroys the very distinction this field exists to keep.
 */
export type ReviewLevel = 'source' | 'human' | 'machine';

export type Language = {
  /** BCP-47 code, used directly for the `lang` attribute of <html>. */
  code: string;
  /** The name IN that language itself — how someone finds their own language. */
  ten: string;
  /** The English name, for `aria-label` and for readers of a different script. */
  englishName: string;
  /** Writing direction. Only 3 of 30 are `'rtl'`. */
  dir: 'ltr' | 'rtl';
  review: ReviewLevel;
};

/**
 * The order HERE IS THE DISPLAY ORDER, not a ranking by speaker count.
 * English is first because it is the default; Vietnamese sits **9th** (index 8).
 * The rest are roughly by total number of speakers.
 *
 * ⚠️ `ma` must be a valid BCP-47 code — it goes straight into `<html lang>`, and screen
 * readers pick their voice from it. One mistyped code has the whole page read out in the
 * phonetics of another language.
 */
export const LANGUAGES: readonly Language[] = [
  { code: 'en', ten: 'English', englishName: 'English', dir: 'ltr', review: 'source' },
  { code: 'zh', ten: '中文（简体）', englishName: 'Chinese (Simplified)', dir: 'ltr', review: 'machine' },
  { code: 'hi', ten: 'हिन्दी', englishName: 'Hindi', dir: 'ltr', review: 'machine' },
  { code: 'es', ten: 'Español', englishName: 'Spanish', dir: 'ltr', review: 'machine' },
  { code: 'ar', ten: 'العربية', englishName: 'Arabic', dir: 'rtl', review: 'machine' },
  { code: 'fr', ten: 'Français', englishName: 'French', dir: 'ltr', review: 'machine' },
  { code: 'bn', ten: 'বাংলা', englishName: 'Bengali', dir: 'ltr', review: 'machine' },
  { code: 'pt', ten: 'Português', englishName: 'Portuguese', dir: 'ltr', review: 'machine' },
  // ── POSITION 9 — David's decision. See decision ③ at the top of this file. ───────
  // The ONLY translation reviewed by a person. David approved the 57 strings that existed on
  // 2026-08-27, and on 2026-09-04 three further batches: the 108-L1 directory, that day's
  // phone-wallet and server-text strings, and the faucet's two auto-fill strings. The approved
  // wording is at the foot of `docs/WEB-PROGRESS.md`; the reasoning, and the one string whose
  // approval is tied to a measurement of the live network, is at the top of `dicts/vi.ts`.
  // ⚠️ The old comment here called `vi` "the SOURCE all the others are translated from".
  // That is WRONG, and wrong in the direction that misleads whoever comes next: `en/`
  // is the source of the keys, and it says so plainly — *"Every other translation is made
  // FROM HERE, not from `vi.ts`"* — because translating through two layers doubles the
  // places meaning can drift. `vi` is the first translation, and the reviewed one, not the source.
  { code: 'vi', ten: 'Tiếng Việt', englishName: 'Vietnamese', dir: 'ltr', review: 'human' },
  { code: 'ru', ten: 'Русский', englishName: 'Russian', dir: 'ltr', review: 'machine' },
  { code: 'ur', ten: 'اردو', englishName: 'Urdu', dir: 'rtl', review: 'machine' },
  { code: 'id', ten: 'Bahasa Indonesia', englishName: 'Indonesian', dir: 'ltr', review: 'machine' },
  { code: 'de', ten: 'Deutsch', englishName: 'German', dir: 'ltr', review: 'machine' },
  { code: 'ja', ten: '日本語', englishName: 'Japanese', dir: 'ltr', review: 'machine' },
  { code: 'mr', ten: 'मराठी', englishName: 'Marathi', dir: 'ltr', review: 'machine' },
  { code: 'te', ten: 'తెలుగు', englishName: 'Telugu', dir: 'ltr', review: 'machine' },
  { code: 'tr', ten: 'Türkçe', englishName: 'Turkish', dir: 'ltr', review: 'machine' },
  { code: 'ta', ten: 'தமிழ்', englishName: 'Tamil', dir: 'ltr', review: 'machine' },
  { code: 'ko', ten: '한국어', englishName: 'Korean', dir: 'ltr', review: 'machine' },
  { code: 'it', ten: 'Italiano', englishName: 'Italian', dir: 'ltr', review: 'machine' },
  { code: 'th', ten: 'ไทย', englishName: 'Thai', dir: 'ltr', review: 'machine' },
  { code: 'gu', ten: 'ગુજરાતી', englishName: 'Gujarati', dir: 'ltr', review: 'machine' },
  { code: 'fa', ten: 'فارسی', englishName: 'Persian', dir: 'rtl', review: 'machine' },
  { code: 'pl', ten: 'Polski', englishName: 'Polish', dir: 'ltr', review: 'machine' },
  { code: 'uk', ten: 'Українська', englishName: 'Ukrainian', dir: 'ltr', review: 'machine' },
  { code: 'ms', ten: 'Bahasa Melayu', englishName: 'Malay', dir: 'ltr', review: 'machine' },
  { code: 'nl', ten: 'Nederlands', englishName: 'Dutch', dir: 'ltr', review: 'machine' },
  { code: 'tl', ten: 'Filipino', englishName: 'Filipino', dir: 'ltr', review: 'machine' },
  { code: 'sw', ten: 'Kiswahili', englishName: 'Swahili', dir: 'ltr', review: 'machine' },
  { code: 'ha', ten: 'Hausa', englishName: 'Hausa', dir: 'ltr', review: 'machine' },
] as const;

/** The default language's code. Changing this changes what a stranger meets first. */
export const DEFAULT_CODE = 'en';

/** `localStorage` key. Same `9chain-` prefix as `9chain-theme`. */
export const STORAGE_KEY = '9chain-lang';

const THEO_MA = new Map(LANGUAGES.map((n) => [n.code, n]));

/** Whether a code is in the registry. Used to filter what comes back from `localStorage`. */
export function isValidCode(code: string | null | undefined): boolean {
  return !!code && THEO_MA.has(code);
}

/**
 * Look a code up. An unknown code ⇒ return the default language's record.
 * 🔴 Never returns `undefined`: every caller is building UI, and an `undefined` there
 * becomes `lang="undefined"` on <html> — the screen reader loses its voice with no error
 * reported anywhere.
 */
export function lookup(code: string | null | undefined): Language {
  return (code && THEO_MA.get(code)) || THEO_MA.get(DEFAULT_CODE)!;
}

/**
 * Guess the language for a NEWCOMER — someone who has never chosen one.
 *
 * 🔴 A PURE FUNCTION, KEPT OUT OF REACT ON PURPOSE. This is the logic that decides which
 * language every stranger sees first; inside a `useEffect` it cannot be covered by a test,
 * and the only way to try it would be to fake `navigator` in a browser — where reloading
 * the page loses the fake. Tried, and could not be measured.
 *
 * The rule: take the first language in the browser's list that this site has in the
 * registry. `vi-VN` matches `vi` (cut at the dash). No match at all falls back to the default.
 *
 * ⚠️ With `output: 'export'`, the HTML always ships in English and only flips after
 * hydration. A Vietnamese reader therefore sees ONE FLASH of English. That is the price of
 * static export, known in advance, not a bug — removing it would require a separate URL
 * per language.
 */
export function guessLanguage(cuaTrinhDuyet: readonly string[] | undefined): string {
  for (const l of cuaTrinhDuyet ?? []) {
    const goc = (l || '').split('-')[0].toLowerCase();
    if (isValidCode(goc)) return goc;
  }
  return DEFAULT_CODE;
}
