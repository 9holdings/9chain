'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useT } from './i18n';
import type { Dict } from './i18n/en';
import { interpolate } from './i18n/interpolate';
import { composeTitle, composeHomeTitle } from './seo';

/**
 * `<title>` follows the language the reader chose.
 *
 * ═══ THE BUG BEING FIXED — MEASURED IN THE 2026-09-03 MULTILINGUAL REVIEW ═══
 * Next's `metadata` is generated at BUILD time, and with `output: 'export'` each page has
 * exactly ONE HTML file. So `<title>` is always English for all 30 languages. Caught in the
 * act: `/re-genesis/` displayed **its entire contents in Arabic** while the browser tab
 * still read *"A1 is being rebuilt on 2026-09-01"*.
 *
 * The cost is not cosmetic: the tab title is what a user relies on to **find a page again**
 * among twenty open tabs, and it is the text that goes into their **bookmarks** and browsing
 * history. An Arabic reader who bookmarks this page ends up with a bookmark they cannot read.
 *
 * ═══ 🔴 WHAT THIS CANNOT FIX, AND DO NOT ASSUME IT DOES ═══
 * The share cards (`og:title`, `twitter:title`) stay English for everyone, forever, as long
 * as we export statically: the crawlers at Telegram/Zalo/X/Facebook **do not run JS**, so
 * they only ever see the build-time HTML. This hook changes `document.title` after
 * hydration — useful to a HUMAN with the tab open, invisible to a crawler.
 * ⇒ Language-aware share cards would require a separate URL per language (`/vi/faucet/`…).
 *   That is an architectural decision, far more expensive, and not done. See the comment in
 *   `lib/seo.ts`.
 *
 * ═══ WHY ONE PLACE KEYED BY PATH, NOT EIGHT CALLS ON EIGHT PAGES ═══
 * The obvious approach is to let each content component set its own title. With eight of
 * them, the ninth — a page added next month — gets forgotten, and the symptom is *a tab
 * carrying another page's title*: a silent bug nobody reports. The table below gathers all
 * eight in one place, and `scripts/check-title-map.mjs` reconciles it against the REAL pages
 * in `out/` before every build — adding a page and forgetting the table is immediately red.
 */

/**
 * Path → BARE title (before the product name is joined on), from the dictionary in use.
 *
 * `null` = use the HOME PAGE shape (product name first). The key must MATCH the `tieuDe:`
 * that the corresponding `page.tsx` passes to `pageMeta()` — otherwise the title **jumps**
 * once on hydration: the HTML carries one sentence and the JS replaces it with another.
 */
export const TITLE_BY_PATH: Record<string, (t: Dict) => string | null> = {
  '/': () => null,
  '/faucet/': (t) => t.faucet.title,
  '/create-chain/': (t) => t.launch.title,
  '/my-chains/': (t) => t.myChains.title,
  '/compare/': (t) => t.compare.title,
  '/chains/': (t) => t.nav.directory,
  '/live/': (t) => t.loadTest.title,
  '/ceremony/': (t) => t.ceremony.title,
  '/re-genesis/': (t) => interpolate(t.rebuildDone.title, { date: t.rebuild.date }),
};

/** The title for any path NOT in the table — i.e. the 404 page. */
const NOT_FOUND_TITLE = (t: Dict) => t.notFound.title;

/**
 * Set `document.title` from the chosen language. Call EXACTLY ONCE, in the layout.
 *
 * ⚠️ There is deliberately NO cleanup branch restoring the old title: navigating within the
 * site re-runs the hook with the new path, and leaving the site means the tab is no longer
 * ours. A `return () => { document.title = cu }` here would run BEFORE the new assignment
 * and make the title flicker twice.
 */
export function useLocalisedTitle(): void {
  const t = useT();
  const urlPath = usePathname();

  useEffect(() => {
    // `usePathname()` may return a path WITHOUT a trailing slash depending on how the page was
    // entered, while the table is written for `trailingSlash: true` from `next.config.ts`.
    // Normalise once here, instead of declaring two keys per page.
    const d = urlPath === '/' ? '/' : urlPath.endsWith('/') ? urlPath : `${urlPath}/`;
    const lay = TITLE_BY_PATH[d] ?? NOT_FOUND_TITLE;
    const tran = lay(t);
    const muon =
      tran === null
        ? composeHomeTitle(t.common.productName, t.common.tagline)
        : composeTitle(tran, t.common.productName);

    document.title = muon;

    /**
     * 🔴 GUARD `<title>`, BECAUSE WRITING IT ONCE IS NOT ENOUGH — MEASURED AGAINST THE
     * LIVE SITE ON `2026-09-03`.
     *
     * The first version had only the `document.title = muon` line above. It worked when the
     * user changed language THROUGH THE PICKER (measured: the title flipped to `L1 目录`
     * then `Danh bạ L1`), but on the **first load** — when the language comes from
     * `localStorage` — the title stayed English while `<html lang>` and the whole page had
     * already switched to Vietnamese.
     *
     * Measuring those two cases apart is what pointed at the cause: the only difference
     * between "first load" and "changed via the picker" is **hydration**. Next builds
     * `<title>` from the server's `metadata`, and the post-hydration tree reconciliation
     * writes that value back AFTER this effect has written — so the translation is
     * overwritten, silently.
     *
     * ⚠️ THIS CAN BE PATCHED WITH `setTimeout(0)` — AND THAT IS THE THING NOT TO DO. It only
     * moves us to the end of a queue we do not control; the day Next changes its timing the
     * bug returns, and returns SILENTLY. `MutationObserver` races nobody: whenever anyone
     * sets `<title>` to something other than the value we want, set it back. The `!==` check
     * keeps it from re-triggering itself.
     *
     * Safe here because every in-site navigation is a FULL PAGE LOAD —
     * `check-static-export.mjs` requires every path to travel through an `<a>` tag — so
     * there is no client-side route change for this observer to fight with.
     */
    const the = document.querySelector('title');
    if (!the) return;
    const canh = new MutationObserver(() => {
      if (document.title !== muon) document.title = muon;
    });
    canh.observe(the, { childList: true, characterData: true, subtree: true });
    return () => canh.disconnect();
  }, [t, urlPath]);
}
