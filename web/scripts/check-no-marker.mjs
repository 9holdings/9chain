#!/usr/bin/env node
/**
 * check-no-marker.mjs — not one `[?]` mark may reach the build.
 * (Đ1-3, 2026-08-27)
 *
 * ═══ THE INCIDENT THIS EXISTS TO PREVENT ═══
 * `[?]` is an INTERNAL mechanism for David to approve the voice (see the top of `lib/i18n/vi.ts`).
 * It must never reach a user's eyes. But measured `27/08` on the public site:
 *
 *     /re-genesis/    64 marks   ← including the <h1> and EVERY <h2>
 *     /faucet/         9 marks
 *     / and 4 other pages, 6 marks each  ← the banner strip lives in the root layout
 *
 * `/re-genesis/` is the page that tells strangers their assets are about to be erased. A question
 * mark in brackets after every warning reads exactly as it looks.
 *
 * 🔴 WHY THIS IS ENFORCED AT `out/` AND NOT AT `vi.ts`:
 * Strings can reach the product by routes other than the dictionary — text written straight into
 * JSX, `aria-label`, `alt`, meta tags. Measuring the source measures a quantity CORRELATED with
 * what we care about; measuring `out/` measures the thing ITSELF. This project has paid several
 * times for measuring the wrong quantity (the link gate trying an alias and then printing the
 * canonical path; the `<title>` gate green while `og:*` was shared).
 *
 * 🔴 AND ABSOLUTELY DO NOT "fix" this by stripping the mark in the render layer. That hides it
 * from David — destroying the very mechanism the mark exists for. There is exactly one correct
 * fix: put the string in front of David, then remove the mark in `vi.ts`.
 *
 * Runs in `postbuild`. Exit 0 = clean. Exit 1 = a mark reached the product.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const GOC = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const RA = path.join(GOC, 'out');
const DAU = '[?]';

if (!existsSync(RA)) {
  console.log('✗ no out/ yet — run `pnpm build` first');
  process.exit(1);
}

/** Only inspect files a person reads: HTML and RSC payloads. Not the name-hashed JS chunks. */
const DUOI = new Set(['.html', '.txt', '.xml', '.webmanifest']);

function quet(dir, ra = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === '_next') continue; // JS chunks: hashed names, not a text surface
      quet(p, ra);
    } else if (DUOI.has(path.extname(e.name))) ra.push(p);
  }
  return ra;
}

const dinh = [];
for (const f of quet(RA)) {
  const noi = readFileSync(f, 'utf8');
  if (!noi.includes(DAU)) continue;
  const so = noi.split(DAU).length - 1;
  // Take a short sample around the FIRST mark so whoever fixes it knows immediately which sentence.
  const i = noi.indexOf(DAU);
  const mau = noi
    .slice(Math.max(0, i - 60), i + 3)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  dinh.push({ tep: path.relative(RA, f).replace(/\\/g, '/'), so, mau });
}

const tong = dinh.reduce((a, d) => a + d.so, 0);

if (dinh.length) {
  console.log(`\n✗ ${tong} "${DAU}" MARKS REACHED THE BUILD — readers will see them:`);
  for (const d of dinh.sort((a, b) => b.so - a.so)) {
    console.log(`     ${String(d.so).padStart(3)} marks · ${d.tep}`);
    console.log(`         …${d.mau}`);
  }
  console.log('');
  console.log('  The `[?]` mark is an INTERNAL mechanism for David to approve voice, not product text.');
  console.log('  The RIGHT fix: put the string in front of David, then remove the mark in web/lib/i18n/vi.ts.');
  console.log('  🔴 The WRONG fix: stripping the mark in the render layer — that hides it from David, destroying');
  console.log('     the very mechanism the mark exists for. See the comment at the top of vi.ts.');
  process.exit(1);
}

console.log(`✓ no "${DAU}" mark reached the build (${quet(RA).length} text files)`);
