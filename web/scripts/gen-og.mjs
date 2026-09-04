/**
 * gen-og.mjs — generates the share (Open Graph) image for 9Chain Testnet A1.
 *
 * ═══ WHY THIS FILE EXISTS INSTEAD OF A HAND-MADE PNG ═══
 * The OG image carries a **number** (the chainId) and the **network name**. That number has
 * already changed once (re-genesis) and will change again. A hand-made PNG is a place where
 * the old number sits on with no gate able to catch it — it is not code, and nobody runs
 * tests against it. Here the chainId is read straight out of `web/lib/chain.ts`, so
 * regenerating is by definition in step with the code.
 *
 * ═══ 🔴 RUN BY HAND, NOT PART OF `postbuild` ═══
 * `sharp` is an INDIRECT dependency (Next's), not one of ours. Putting it on the build path
 * would turn something that can vanish after a `pnpm update` into a gate that blocks deploys.
 * The generated image is **committed to the repo**; regenerate it when the branding or the
 * chainId changes:
 *
 *     node web/scripts/gen-og.mjs
 *
 * ═══ 🔴 THE LOGO IS PASTED VERBATIM, NEVER REDRAWN ═══
 * The logo in this image is `public/brand/9chain-lockup-dark@2x.png` — the ORIGINAL file from
 * David's kit, pasted in rather than rebuilt as SVG.
 *
 * Why that matters: the word "9Chain" in the kit uses **Outfit 700**, and Outfit is not
 * installed on this machine. Rebuilding it as SVG `<text font-family="Outfit,…">` and
 * rendering through librsvg would silently fall back to Arial — producing a logo in the WRONG
 * FONT that still looks "fine", with no measurement able to catch it. Pasting the
 * already-rendered image makes the font, the colours and the proportions correct by definition.
 *
 * The kit's lockup background is `#0D1733` with rounded corners, so the canvas here must be
 * EXACTLY `#0D1733` — one shade off and the rectangle around the logo becomes visible.
 *
 * ⚠️ The SECONDARY text (the "TESTNET A1" label, the chainId line) uses system fonts. It is
 * not the logo, so the "keep the logo's font" constraint does not apply. And it deliberately
 * does NOT use the site's three brand fonts: those currently do not run on the site itself
 * (see `docs/BRAND-AUDIT-2026-08-27.md`, section B), so embedding them here would advertise
 * an identity the real page does not yet have.
 *
 * The image is a REAL PNG, not an SVG: Telegram, X, Zalo and Facebook all refuse to render
 * SVG in a preview card — which is why `og:image` has to be a raster image.
 */

import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GOC = join(__dirname, '..');

// `sharp` lives in pnpm's store rather than being hoisted to `node_modules/sharp`.
const require = createRequire(import.meta.url);
let sharp;
try {
  sharp = require('sharp');
} catch {
  const { globSync } = await import('node:fs');
  const [duong] = globSync('node_modules/.pnpm/sharp@*/node_modules/sharp', { cwd: GOC });
  if (!duong) {
    console.error('✗ `sharp` not found. Run `pnpm install` in web/ first.');
    process.exit(1);
  }
  sharp = require(join(GOC, duong));
}

// ═══ Source of truth for the number ═══
// Read from `lib/chain.ts` itself rather than retyped — that is the point of this file.
const { readFileSync } = await import('node:fs');
const chainTs = readFileSync(join(GOC, 'lib/chain.ts'), 'utf8');
const doc = (khoa, mac) => (chainTs.match(new RegExp(`${khoa}:\\s*'?([^,'\\n]+)'?`)) ?? [, mac])[1].trim();

const CHAIN_ID = doc('chainId', '9000000009');
const KY_HIEU = doc('kyHieu', 'LOVE9');
const TEN = doc('ten', '9Chain Testnet A1');

// ═══ Colours ═══
// navy comes from tokens.css; the gold comes from the MARK (9chain.org), not from a UI
// token — see `components/BrandLockup.tsx` for why two golds coexist.
const NAVY = '#0d1733';
const MARK_GOLD = '#F5C542';
const MO = '#8f9cba';

const W = 1200;
const H = 630;

const CHU = "'Segoe UI',system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif";
const MONO = "'Cascadia Mono',Consolas,'Courier New',monospace";

// ═══ Step 1: THE ORIGINAL LOGO — strip the card, measure the real proportions ═══
//
// 🔴 THE KIT FILE IS NOT A BARE LOGO — IT IS A PRESENTATION CARD.
// Background `#0D1733`, a **2px `#1C2A4D` border**, rounded corners. (Pixel-measured:
// (387,0) reads [28,42,77]; from y=2 inward it reads [13,23,51].) Pasted as-is onto the
// navy canvas the background blends perfectly, but **the border and the four rounded
// corners surface as a faint frame around the logo** — looking exactly like a compositing bug. Seen with my own eyes on the first two runs.
//
// ⚠️ `.trim()` ON ITS OWN IS NOT ENOUGH — tried, and it does not remove the border.
// `trim()` takes its reference colour from the **top-left pixel**, and that corner is
// TRANSPARENT (rounded corner, alpha 0). So it nibbles the four transparent corners and
// stops the instant it meets the opaque border — the card survives intact, and the generated image still shows the faint frame.
//
// The correct order, in two steps:
//   1. `extract` cuts a hard margin covering border + rounded corners (8px at scale 774 is plenty).
//   2. `trim` with the background **stated explicitly** as `#0D1733` ⇒ eats the remaining
//      solid background, leaving exactly the inked area: the mark plus the wordmark.
// This is unwrapping PACKAGING, not touching the logo — geometry, colour and font are intact.
// The proportions come FROM THE TRIM RESULT, not from an assumed 774:364, because stripping the card changes the frame.
const logoGoc = join(GOC, 'public/brand/9chain-lockup-dark@2x.png');

const LOGO_W = 560; // width of the LOGO (after the card is stripped) — leaving breathing room on both sides

const LE = 24; // covers the 2px border plus the full corner radius (measured: 8px still left a corner smudge)
const trimmed = await sharp(logoGoc)
  .extract({ left: LE, top: LE, width: 774 - LE * 2, height: 364 - LE * 2 })
  .flatten({ background: '#0D1733' }) // drop the alpha so trim has a solid background to grip
  .trim({ background: '#0D1733', threshold: 10 })
  .png()
  .toBuffer();
const kt = await sharp(trimmed).metadata();
const LOGO_H = Math.round((kt.height / kt.width) * LOGO_W);
const LOGO_X = Math.round((W - LOGO_W) / 2);
const LOGO_Y = 168;

const logo = await sharp(trimmed).resize(LOGO_W, LOGO_H, { fit: 'fill' }).png().toBuffer();

// ═══ Step 2: background + secondary text ═══
// Built AFTER the real `LOGO_H` is known, because the label and the chainId line have to align to the logo's baseline.
const nenSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${NAVY}"/>
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="28"
        fill="none" stroke="#24304d" stroke-width="2"/>

  <!-- The TESTNET A1 label: what tells this image apart from the main site's. Without it,
       an A1 link pasted anywhere looks like a 9chain.org link.
       Secondary text, not the logo ⇒ a system font is the right choice here. -->
  <rect x="${W / 2 - 116}" y="${LOGO_Y + LOGO_H + 40}" width="232" height="46" rx="10"
        fill="none" stroke="${MARK_GOLD}" stroke-width="2"/>
  <text x="${W / 2}" y="${LOGO_Y + LOGO_H + 72}" text-anchor="middle"
        font-family="${CHU}" font-size="25" font-weight="600"
        fill="${MARK_GOLD}" letter-spacing="3.4">TESTNET A1</text>

  <text x="${W / 2}" y="558" text-anchor="middle" font-family="${MONO}"
        font-size="27" fill="${MO}">chainId ${CHAIN_ID} · ${KY_HIEU} · a1.9chain.org</text>
</svg>`;

const raDir = join(GOC, 'public/brand');
mkdirSync(raDir, { recursive: true });
const ra = join(raDir, 'og-9chain-a1.png');

await sharp(Buffer.from(nenSvg))
  .composite([{ input: logo, left: LOGO_X, top: LOGO_Y }])
  .png({ compressionLevel: 9 })
  .toFile(ra);

const { size } = await import('node:fs').then((m) => m.statSync(ra));
console.log(`✓ ${ra}`);
console.log(`  ${W}×${H} · ${(size / 1024).toFixed(1)} KB`);
console.log(`  network: ${TEN} · chainId ${CHAIN_ID} · ${KY_HIEU}`);
