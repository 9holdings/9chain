import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';
import { NotFoundContent } from './NotFoundContent';

/**
 * 🔴 `noindex` IS THE MOST IMPORTANT PART OF THIS BLOCK, NOT THE TITLE.
 * Caddy serves this page with `replace_status 404`, so search crawlers already understand. But
 * two layers saying the same thing is cheap, while one layer saying the wrong thing is expensive:
 * if someone later removes `replace_status` (or serves `/404.html` directly, where nginx returns
 * **200**), `noindex` is the only thing left keeping an error page out of the search index.
 *
 * A page-specific title is needed too: without it this page inherits the home page's `og:*`, and
 * `test/seo.test.ts` catches exactly that — `/` and `/404/` sharing one `og:title`.
 */
export const metadata: Metadata = {
  title: `${EN.notFound.title.replace(' [?]', '')} — ${EN.common.productName}`,
  description: EN.notFound.desc.replace(/ \[\?\]/g, ''),
  robots: { index: false, follow: true },
  openGraph: {
    type: 'website',
    siteName: EN.common.productName,
    title: `${EN.notFound.title.replace(' [?]', '')} — ${EN.common.productName}`,
    description: EN.notFound.desc.replace(/ \[\?\]/g, ''),
  },
};

/**
 * The 404 page (Đ1-2, 2026-08-27).
 *
 * ═══ WHY THIS PAGE EARNS ITS OWN TICKET ═══
 * Measured before the fix: every wrong URL on `a1.9chain.org` returned Blockscout's 404 shell —
 * 75,964 bytes, in English, with an empty `<title>`, `grep -ci 9chain` = **0**, and **not one
 * `href`** leading back to the site. Three of our own paths (`/create-chain`, `/my-chains`,
 * `/compare` without a trailing slash) landed there, and the home page's main gold button pointed
 * at one of the three. Both halves were fixed in the same Caddy pass (Đ1-1).
 *
 * 🔴 THE EXPENSIVE PART IS NOT HERE, IT IS IN CADDY. Next's static export produces `out/404.html`,
 * but nginx only serves that file if Caddy ROUTES to it. And this 404 comes from the upstream
 * (Blockscout), so `handle_errors` cannot catch it — it needs `handle_response` +
 * `replace_status 404`. See the last block of `local-net/deploy/Caddyfile`.
 * ⇒ Editing this file alone changes NOTHING on the public site.
 *
 * 🔴 A PURELY STATIC PAGE — NO `fetch`, NO hooks, NO `'use client'`.
 * It is where people land when something else has already broken; it must be the page LEAST
 * likely to break on the whole site. Do not add live numbers here.
 *
 * Navigation uses `<a>` rather than `next/link`: `check-static-export.mjs` requires every
 * edge-served path to travel through an `<a>` tag — and this is one of them.
 */
export default function KhongThay() {
  return <NotFoundContent />;
}
