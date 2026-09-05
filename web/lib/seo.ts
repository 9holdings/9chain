import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';

/**
 * Per-page share cards (Đ1-5, 2026-08-27).
 *
 * ═══ THE BUG BEING FIXED, AND WHY NO GATE CAUGHT IT ═══
 * Measured `27/08`: `og:title`, `og:description` and `twitter:*` were **identical across all
 * 6 pages** — all of them the home page's content. Each page did declare its own
 * `title`/`description`, but none declared `openGraph`, and `layout.tsx`'s `openGraph` does
 * not inherit a child page's `title`: Next takes the nearest `openGraph` block whole.
 *
 * The concrete cost: pasting `/re-genesis/` into a group chat showed the invitation
 * *"launching your chain takes about three minutes"* — the EXACT OPPOSITE of what that page
 * needs to say, in the week it mattered most.
 *
 * 🔴 THIS IS THE CLASSIC "FALSE GREEN", written down because it will recur elsewhere:
 * every existing gate measured `<title>` — and `<title>` had been per-page for a long time.
 * The measurement of the right quantity lives in `test/seo.test.ts`: it reads each
 * `index.html` in `out/` and requires `og:title` to DIFFER between pages.
 * That gate is trustworthy because **it was RED the day it was written** — run against the
 * old build:
 *   ✗ og:title shared  ·  ✗ /compare/ had og:url = "https://a1.9chain.org/"
 *
 * ⚠️ Do not write a path as `out` + `/` + two asterisks + `/` inside a BLOCK comment: that
 * character pair closes the comment, and the error surfaces lines further down, making it very
 * hard to trace. The first version of this file did exactly that.
 *
 * 🔴 USES A STATIC `EN`, NOT `useT()` — and that is NOT an oversight.
 * Next generates `metadata` at BUILD time, before any browser exists, so there is no
 * "currently chosen" language there at all. With `output: 'export'` each page has exactly ONE
 * HTML file, so the meta tags must be in one language — and that language is English, the default.
 * ⚠️ A known consequence, written down so nobody mistakes it for a bug: a Vietnamese reader
 * pasting a link into a group chat still sees an English share card. Language-aware cards would
 * require a separate URL per language (`/vi/faucet/`…) — a different architectural decision,
 * far more expensive, and not done.
 *
 * Usage: `export const metadata = pageMeta({ tieuDe, moTa, duong })`.
 * Do not retype the strings at the call site — pass the same variable used for `title`.
 */
/**
 * The title shape and the `[?]` stripper live in `lib/titleShape.ts` (no dictionary import) so
 * the client-side title hook can share them WITHOUT pulling the full `EN` below into every
 * page's bundle. Re-exported here so build-time callers keep one import.
 */
import { composeTitle, stripReviewMark } from './titleShape';
export { composeTitle, composeHomeTitle, stripReviewMark } from './titleShape';

export function pageMeta({
  title,
  desc,
  urlPath,
}: {
  /** The page's BARE title, before the product name is joined on. */
  title: string;
  desc: string;
  /** The canonical path, always with a trailing slash. For example `/faucet/`. */
  urlPath: string;
}): Metadata {
  // The `[?]` mark is an INTERNAL voice-review mechanism (see the top of `vi.ts`). It must not
  // reach a meta tag — there the text is read by other machines and reproduced verbatim in the
  // share card, beyond the reach of any later edit. Stripping it HERE is legitimate; stripping
  // it in the page's render layer is NOT — see "deliberately not doing" item 15 in the roadmap.
  const t = composeTitle(title, EN.common.productName);
  const d = stripReviewMark(desc);

  return {
    title: t,
    description: d,
    alternates: { canonical: urlPath },
    openGraph: { type: 'website', siteName: EN.common.productName, title: t, description: d, url: urlPath },
    twitter: { card: 'summary_large_image', title: t, description: d },
  };
}
