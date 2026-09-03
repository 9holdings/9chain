import { RPC_ORIGIN_HINT } from '@/lib/chain';

/**
 * Resource hints that go into the prerendered `<head>`, so the network work the page
 * needs starts at byte one instead of after React has hydrated.
 *
 * ═══ WHAT THIS FIXES, MEASURED ON THE LIVE SITE 2026-09-03 ═══
 * Every page here is a static export whose data is fetched by client components in a
 * `useEffect`. That means the browser cannot even *know* about those requests until
 * the whole JS bundle has arrived, parsed and hydrated. Measured through Cloudflare
 * with a warm browser cache: the JS finished at 628 ms, and the first data request
 * left at 634 ms and landed at 1263 ms. On a cold visit the same chain started at
 * ~4.5 s. For that entire window the page shows skeletons and English text — which
 * is exactly the "site takes a while before it finishes loading" complaint.
 *
 * A hint in the head is read by the browser's preload scanner, before a single line of
 * our JavaScript runs, so the connection and the two static reads overlap the bundle
 * download instead of queueing behind it.
 *
 * ═══ WHY HINTS AND NOT A REFACTOR ═══
 * The real fix for a data fetch that starts too late is to not need JS for it. That is
 * off the table here: `output: 'export'` plus "the root `/` still belongs to
 * Blockscout" is what makes this site static in the first place (see `next.config.ts`).
 * Hints buy most of the latency back without touching that decision.
 *
 * ═══ 🔴 `<link rel="preload">` FOR THE TWO JSON READS: TRIED, MEASURED, REMOVED ═══
 * The obvious next hint is to preload `/chains/data/heartbeat.json` and
 * `console-chains.json`, the two static files this site reads on load. It was written,
 * it shipped into the prerendered head, and it did NOTHING — Chrome:
 *
 *     "A preload for '…/heartbeat.json' is found, but is not used because the request
 *      credentials mode does not match."
 *     "…was preloaded using link preload but not used within a few seconds…"
 *
 * Two independent reasons, and each one alone is fatal:
 *   1. The server sends `Cache-Control: no-store` on BOTH files (measured through
 *      Cloudflare, 2026-09-03). A `no-store` response is never stored, so there is no
 *      cache entry for the later `fetch()` to hit.
 *   2. `docJson` itself passes `cache: 'no-store'` (see `lib/mang.ts`). A `no-store`
 *      request bypasses the cache on the way in as well.
 * The result is the worst shape a "speed-up" can have: one extra request per page load,
 * thrown away on arrival, while the real fetch still leaves at the old time. It looks
 * like an optimisation in the diff and in the HTML, and only the browser console says
 * otherwise — exactly the kind of green-looking nothing this project keeps paying for.
 *
 * ⇒ Do not re-add the preload on its own. Making it work needs BOTH ends changed
 *   together: a small `max-age` on those files at the edge AND dropping `no-store` from
 *   that one read. That is a decision about how fresh the load-test banner must be
 *   (`dangChay()` already refuses a reading older than 60 s), not a markup tweak.
 *
 * ⚠️ So what is left here is only what actually survives measurement: the RPC origin,
 * hinted with `preconnect` rather than `preload` — we are opening the socket, not
 * guessing the request, so no cache policy can cancel it. `crossOrigin` is required
 * because those are CORS fetches; without it the browser opens a connection the real
 * request cannot reuse, which is the quiet way this hint would become waste too.
 */
export function EarlyHints() {
  return (
    <>
      <link rel="preconnect" href={RPC_ORIGIN_HINT} crossOrigin="anonymous" />
      {/* dns-prefetch is the fallback for browsers that ignore preconnect; it is
          ignored where preconnect works, so the two do not double up. */}
      <link rel="dns-prefetch" href={RPC_ORIGIN_HINT} />
    </>
  );
}
