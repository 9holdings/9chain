import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';
import { interpolate } from '@/lib/i18n/interpolate';
import { RebuildContent } from './RebuildContent';
// The Chain ID comes from the code's SOURCE OF TRUTH, not typed by hand into the dictionary: if
// that number ever really changes, the wording on the page follows, with no way for the two to drift.
import { CHAIN } from '@/lib/chain';
import { pageMeta } from '@/lib/seo';

/**
 * The re-genesis page — saying in advance what is about to be lost.
 *
 * ✅ SWITCHED TO THE PAST TENSE ON `2026-09-04`. G-day ran on `2026-09-01`, and for three days
 * after it this page still announced the rebuild in the future tense. Nothing in the code can
 * know on its own that the day has passed — the switch is manual, and the measurement that says
 * whether it has been done is `check-links.mjs` under `A1_SAU_NGAY_G=1`.
 *
 * ⏳ STILL OUTSTANDING: `rebuildDone.archiveUrl` and `archiveSha256` are empty, so the archive
 * section hides itself (see `RebuildContent`). Paste those two values in when the G-day backup
 * has a published URL and hash; no prose needs writing.
 * The full procedure (entry conditions, order, how it is accepted): section **D-web** in
 * `docs/NGAY-G-A1-CON-LAI.md`.
 *
 * ⚠️ The old comment here used to say *"A draft announcement is already written — do not start
 * from scratch"* while **it existed nowhere at all** (`grep` across the repo returned 0 results).
 * A pointer into nothing is worse than no pointer: whoever picks it up goes looking, finds
 * nothing, and then has to write it fresh under time pressure. Fixed 2026-08-27.
 *
 * 🔴 ONE THING THIS PAGE DELIBERATELY DOES NOT SAY, because nobody has measured it:
 *   • whether the name + Chain ID reservation ledger survives G-day (item O3b). Saying "it
 *     survives" and then finding it did not pushes users into the very wallet-points-at-the-wrong-
 *     chain trap. Add it when there is an answer; do not guess ahead.
 *
 * ✅ The second question DOES have an answer: **D-047 decided to KEEP chainId `9000000009`.**
 * The section "Your wallet will not tell you anything" below is the part of the page that carries
 * the cost of that decision — keeping the number means the wallet has no remaining sign that the
 * network changed, so both consequences (a zero balance, and an already-signed unbroadcast tx)
 * have to be spelled out. Do not remove that section without reading D-047.
 */
// 🔴 THIS IS THE PAGE THAT NEEDS ITS OWN SHARE CARD MORE THAN ANY OTHER ON THE SITE (Đ1-5).
// Before the fix: pasting this link into a group chat surfaced the home page's `og:*` — the
// invitation *"launching your chain takes about three minutes"*, the exact opposite of what this
// page needs to say, in the week it mattered most. `title` had been per-page for a long time, so
// every gate measuring `<title>` stayed green throughout.
// `pageMeta` strips the `[?]` mark itself — no `.replace()` call here any more.
export const metadata: Metadata = pageMeta({
  title: interpolate(EN.rebuildDone.title, { date: EN.rebuild.date }),
  desc: EN.rebuildDone.desc,
  urlPath: '/re-genesis/',
});

export default function TrangReGenesis() {
  return <RebuildContent />;
}
