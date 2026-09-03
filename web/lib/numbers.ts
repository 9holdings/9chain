/**
 * Format whole numbers in the language the reader has chosen.
 *
 * ═══ WHERE THIS BUG CAME FROM ═══
 * `NetworkStats.tsx` and `ComparisonTable.tsx` called `toLocaleString('vi-VN')` — a **hard-coded**
 * locale, written when the site was Vietnamese only. Once the site went to 30 languages, block
 * height rendered Vietnamese-style (`1.234.567`) for **every** reader; an English reader expects
 * `1,234,567`, and to them that dot reads as a decimal point.
 *
 * 🔴 WHY NO GATE CAUGHT IT, AND WHY IT WILL STAY HIDDEN LONGER:
 * The network had just been reborn (generation g0), so `eth_blockNumber` = **1**. A single digit
 * has **no separator at all** ⇒ every language prints it identically ⇒ zero symptoms. It only
 * surfaces once the chain passes 1,000 blocks — and on `01/09` the network was reborn back to 1,
 * so the window of invisibility opened again.
 * ⇒ This is the class of bug where **the network reset itself makes the symptom disappear while
 *   the defect stays exactly where it was**. Which is why the test in `test/so.test.ts` measures
 *   this function DIRECTLY with a large enough number, and NOT through the network — a test that
 *   read the real block height would be green today and green after G-day, proving nothing.
 *
 * ═══ THE DECISION: KEEP LATIN DIGITS (`-u-nu-latn`) ═══
 * By default `Intl` gives `ar` Arabic-Indic digits: `٤٬٣٠٠`. Correct as localisation, but WRONG
 * for what people do with this number: block height is something you **compare** against the
 * explorer, against a wallet, against an RPC response — all three of which print Latin digits.
 * A number you cannot compare is no longer a measurement.
 * ⇒ Take the **separators** from the language (which helps reading), keep the **digits** Latin
 *   (which helps comparing). Recorded in `DECISIONS.md` as D-web-2.
 */

/**
 * @param n   a whole number (block height, chain count…)
 * @param ma  the BCP-47 code of the chosen language — from `useLanguage().ma`
 */
export function formatNumber(n: number, code: string): string {
  try {
    // `-u-nu-latn` = force the Latin digit system. The rest of the locale (separators, and how
    // digits are grouped — `hi` groups in 2s after the first group of 3) still follows the language.
    return new Intl.NumberFormat(`${code}-u-nu-latn`).format(n);
  } catch {
    // 🔴 Do NOT fall back to `vi-VN` — that is the very bug being fixed. Falling back to `en` (the
    // site default) means at worst a reader sees the default language's convention, rather than
    // the convention of some third language they never chose.
    return new Intl.NumberFormat('en').format(n);
  }
}
