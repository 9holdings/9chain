/**
 * THE PAGE TITLE SHAPE — **the single source**, used by BOTH paths:
 *   • `pageMeta()` in `lib/seo.ts`, running at BUILD time, always with `EN`
 *   • `useLocalisedTitle()` in `lib/pageTitle.ts`, running IN THE BROWSER with the reader's
 *     chosen dictionary
 *
 * 🔴 WHY THIS HAS TO BE A FUNCTION AND NOT TWO IDENTICAL-LOOKING CONCATENATIONS:
 * two independent concatenations drift the first time someone changes a dash or the order —
 * and at that point the title **jumps** on hydration (the tab changes its text in front of the
 * user) with no error reported, because both strings are "correct". One function cannot drift.
 *
 * 🔴 WHY THIS IS ITS OWN FILE AND NOT PART OF `seo.ts` (2026-09-05):
 * `seo.ts` imports the FULL English dictionary for `pageMeta()`, and `pageTitle.ts` — a
 * `'use client'` module mounted in the root layout — imported these three helpers from there.
 * That one import edge would have carried all fourteen English files into the shared bundle
 * of every page, undoing the per-page split of `lib/i18n/en/` while every gate but the size
 * one stayed green. These helpers touch no dictionary, so they live where nothing does.
 */

/**
 * Strip the `[?]` voice-review mark. See the reason in the comment on `pageMeta` in `seo.ts`.
 * Exported so the client-side path uses THIS one function rather than copying the regex.
 */
export const stripReviewMark = (s: string) => s.replace(/ \[\?\]/g, '');

export function composeTitle(tieuDeTran: string, tenSanPham: string): string {
  return `${stripReviewMark(tieuDeTran)} — ${tenSanPham}`;
}

/** The HOME PAGE title shape — different from the sub-pages: the product name comes FIRST. */
export function composeHomeTitle(tenSanPham: string, tagTitle: string): string {
  return `${stripReviewMark(tenSanPham)} — ${stripReviewMark(tagTitle)}`;
}
