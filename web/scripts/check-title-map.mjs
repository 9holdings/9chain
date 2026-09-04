#!/usr/bin/env node
/**
 * check-title-map.mjs — the client-side title table must cover EXACTLY the pages that exist.
 *
 * Exit 0 = matched in both directions. Exit 1 = mismatched. Exit 2 = could not measure.
 *
 * ═══ WHY THIS GATE EXISTS ═══
 * Next's `metadata` is generated at build time, so `<title>` is permanently English for all 30
 * languages. `lib/pageTitle.ts` patches that with ONE `path → dictionary key` table, mounted in
 * the layout. Gathering it in one place saves remembering eight separate calls — but it trades
 * that for a new failure point: **add a page and forget the table, and that page falls into the
 * 404 branch**, so the tab reads *"This page does not exist"* while the content renders perfectly
 * normally. No error, no warning, and the only person who sees it is the user.
 *
 * Same family as `check-routes.mjs` (a new page with no Caddyfile entry) — and as `/re-genesis/`,
 * which was created in commit `0d65eca` without anyone adding it to the list, so the banner strip
 * led straight to a 404 for days.
 *
 * ═══ MEASURED IN BOTH DIRECTIONS, NOT ONE ═══
 *   • a page in `out/` MISSING from the table ⇒ the tab carries the 404 title
 *   • a key in the table with NO page ⇒ the table describes a page that does not exist, i.e. it
 *     has gone stale and nobody knows
 * A gate measuring only the first direction stays green forever after someone deletes a page.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RA = path.join(GOC, 'out');
// 🔴 THE FILE WAS RENAMED `tieuDe.ts` → `pageTitle.ts` (2026-09-03, the English-code rule).
// The path here is built from TWO arguments (`'lib', 'tieuDe.ts'`), so the automatic renamer —
// which only matched `lib/tieuDe.ts` as one contiguous string — missed it, while the COMMENTS
// around it had already been updated. The gate printed "cannot find lib/pageTitle.ts" and exited
// 2: a message that was true about a path it was NOT actually looking up. That is the hardest
// shape to trace — the documentation says one thing and the code does another — and it only
// surfaced because the gate refuses to go green when it cannot open a file.
const BANG = path.join(GOC, 'lib', 'pageTitle.ts');

if (!existsSync(RA)) {
  console.log('   ✗ no out/ yet — run `pnpm build` first');
  process.exit(2);
}
if (!existsSync(BANG)) {
  console.log('   ✗ cannot find lib/pageTitle.ts');
  process.exit(2);
}

// ── Keys declared in the table ───────────────────────────────────────────────
const src = readFileSync(BANG, 'utf8');
// 🔴 `[\s\S]*?` and NOT `[^=]*`. The declaration carries a type annotation like
// `Record<string, (t: Dict) => string | null>`, and `[^=]*` stops at the `=` inside the `=>`
// ⇒ it never matches. `=\s*\{` cannot be confused with `=>` (after `=` comes `>`, not `{`).
// The first version of this gate hit exactly that and returned exit 2 — it refused to pass
// rather than go falsely green, and that is why the "could not measure" branch has to exist.
const khoi = src.match(/TITLE_BY_PATH[\s\S]*?=\s*\{([\s\S]*?)\n\};/);
if (!khoi) {
  console.log('   ✗ could not extract the `TITLE_BY_PATH` block from lib/pageTitle.ts');
  console.log('     If the structure just changed, fix the extractor here — do NOT remove the gate.');
  process.exit(2);
}
const khaiBang = [...khoi[1].matchAll(/'([^']+)':/g)].map((m) => m[1]).sort();

// ── Pages that actually exist in out/ ────────────────────────────────────────
/**
 * 🔴 `404/index.html` and `404.html` do NOT count as pages.
 * The 404 page is DELIBERATELY absent from the table: it is the fallback for every unknown path,
 * so declaring it would be both meaningless and would mask the very thing this gate looks for.
 */
const BO_QUA = new Set(['/404/', '/404.html']);
function timTrang(dir, tien = '/', ra = []) {
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e);
    // `chains` has LEFT the exclusion list (2026-09-03): `/chains/` is now a real Next route, so
    // it MUST have a key in the table like every other page.
    if (e === '_next' || e === 'brand') continue;
    if (statSync(p).isDirectory()) timTrang(p, `${tien}${e}/`, ra);
    else if (e === 'index.html') ra.push(tien);
  }
  return ra;
}
const trangThat = timTrang(RA).filter((d) => !BO_QUA.has(d)).sort();

const thieu = trangThat.filter((d) => !khaiBang.includes(d));
const thua = khaiBang.filter((d) => !trangThat.includes(d));

console.log(`   ${trangThat.length} pages in out/ · ${khaiBang.length} keys in the table`);
if (thieu.length) {
  console.log(`   ✗ MISSING from the table: ${thieu.join('  ')}`);
  console.log('     ⇒ these pages will carry the 404 page’s tab title.');
}
if (thua.length) {
  console.log(`   ✗ EXTRA in the table (no such page): ${thua.join('  ')}`);
  console.log('     ⇒ the table describes a page that does not exist.');
}
if (thieu.length || thua.length) {
  console.log('\n✗ The title table disagrees with the real pages. Fix `TITLE_BY_PATH`');
  console.log('  in lib/pageTitle.ts — and remember the `tieuDe` key must MATCH what');
  console.log('  `page.tsx` passes to `pageMeta()`, or the title will jump once on');
  console.log('  hydration (the HTML says one thing, the JS replaces it with another).');
  process.exit(1);
}

console.log('✓ the client title table covers exactly the real pages (matched both ways).');
process.exit(0);
