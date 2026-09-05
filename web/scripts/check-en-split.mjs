#!/usr/bin/env node
/**
 * check-en-split.mjs — each page's JavaScript may carry ONLY the English that page reads.
 *
 * Exit 0 = every page-only group is on some pages and off others. Exit 1 = a group leaked into
 * every page (or into none). Exit 2 = could not measure.
 *
 * ═══ WHY THIS GATE EXISTS — AND WHY THE BUDGET GATE IS NOT ENOUGH ═══
 * On 2026-09-05 English was split from one object into `lib/i18n/en/*.ts`: a core every page
 * reads, and one file per screen that only that screen imports. The point is structural — a new
 * page must cost only itself — and nothing in the build enforces structure. The size gate
 * (`check-budget.mjs`) would notice the day the ceiling breaks, which is many pages later, and
 * it would say "too big", not "the ceremony's sentences are in the faucet again".
 *
 * The ways the split silently comes undone, each of them working code:
 *   • a `'use client'` module imports `EN` from `@/lib/i18n/en` (the full assembly, meant for
 *     the server and the tests) — one line, and all fourteen files ride in the shared bundle;
 *   • a component mounted in the layout reads a page's group (`t.docs.title` in the footer);
 *   • a helper that a client module imports pulls the full `EN` in transitively (`seo.ts` did,
 *     through `pageTitle.ts`, before `titleShape.ts` cut that edge).
 *
 * ═══ THE MEASUREMENT ═══
 * Read from `out/` — the built pages, not the source. For each page, the scripts a module-aware
 * browser fetches unconditionally (same rule as `check-budget.mjs`: `<script src>` WITHOUT
 * `noModule`). For each page-only group, a SENTINEL: the first plain ASCII value of that group
 * long enough to be unmistakable, read out of the group's source file. Then, per group, the set
 * of pages whose scripts contain the sentinel:
 *   • it must be NON-EMPTY — otherwise the sentinel is not being found and the rest of this
 *     gate measures nothing (a gate that can never go red);
 *   • it must be SMALLER than the set of all pages — a group on every page is a group in the
 *     shared bundle, i.e. the split has come undone for that group.
 * The core groups are not measured here: by definition they are everywhere.
 *
 * 🔴 SEEN RED BEFORE IT WAS EVER GREEN. Run against the `out/` built from the day's earlier
 * commit (one English object), every one of the 13 page-only groups was on 14/14 pages:
 *   ✗ directory … on ALL 14 pages — this group is in the shared bundle
 * After the split: `directory` on 1 page, `launch` on 4, `home` on 3, and so on.
 *
 * ⚠️ LIMITS. A sentinel is one string; a group could in principle leak partially (one key
 * copied into a shared component's own literal) and this gate would not see it — but that is
 * a copy, not the group, and `check-dict-values` is the gate for text drifting between places.
 * And "on some pages, not all" is the whole assertion: it does NOT check that a group is only
 * on the pages that need it. The per-group page list is printed so a person can read that.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RA = path.join(GOC, 'out');
const EN_DIR = path.join(GOC, 'lib', 'i18n', 'en');
const CORE = 'core.ts';

if (!existsSync(RA)) {
  console.log('   ✗ no out/ yet — run `pnpm build` first');
  process.exit(2);
}
if (!existsSync(EN_DIR)) {
  console.log('   ✗ cannot find lib/i18n/en/');
  process.exit(2);
}

// ── the page-only groups and their sentinels ────────────────────────────────
const CORE_SRC = readFileSync(path.join(EN_DIR, CORE), 'utf8');

/** `  group: {` … `  },` blocks of one file, with the first usable string value of each. */
function groupsOf(file) {
  const src = readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '');
  const ra = [];
  let group = null;
  for (const line of src.split('\n')) {
    const g = /^  (\w+): \{$/.exec(line);
    if (g) {
      group = { name: g[1], sentinel: null };
      ra.push(group);
      continue;
    }
    if (/^  \},$/.test(line)) {
      group = null;
      continue;
    }
    if (!group || group.sentinel) continue;
    // The first string literal of the group that is clean ASCII, free of quotes and backslashes
    // (so the minifier cannot re-encode it) and long enough not to occur by chance. A part of a
    // multi-line `'…' + '…'` value counts: the minifier folds the concatenation, and the folded
    // string still contains each part verbatim.
    for (const m of line.matchAll(/'([^'\\]*)'|"([^"\\]*)"/g)) {
      const s = m[1] ?? m[2];
      // 🔴 …and NOT a string the core also carries. Seen red for the wrong reason on the first
      // run: `nineYears.title` had just been copied into `nav.nineYears` (core) for the footer,
      // so the sentinel was on every page while the group itself was on one.
      if (s.length >= 24 && /^[\x20-\x7e]+$/.test(s) && !/['"]/.test(s) && !CORE_SRC.includes(s)) {
        group.sentinel = s;
        break;
      }
    }
  }
  return ra;
}

const files = readdirSync(EN_DIR).filter((f) => f.endsWith('.ts') && f !== 'index.ts' && f !== CORE).sort();
const groups = files.flatMap((f) => groupsOf(path.join(EN_DIR, f)).map((g) => ({ ...g, file: f })));
if (groups.length === 0) {
  console.log('   ✗ read 0 groups from lib/i18n/en/ — the reader does not understand the files');
  process.exit(2);
}
const noSentinel = groups.filter((g) => !g.sentinel);
if (noSentinel.length) {
  console.log(`   ✗ no usable sentinel for: ${noSentinel.map((g) => g.name).join(', ')} — refuse to measure`);
  process.exit(2);
}

// ── the pages and their blocking scripts ─────────────────────────────────────
function findHtml(dir, ra = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) findHtml(p, ra);
    else if (e.name.endsWith('.html')) ra.push(p);
  }
  return ra;
}
/** `<script src>` without `noModule`, `?dpl=` stripped — the same rule as `check-budget.mjs`. */
function blockingScripts(html) {
  const ra = new Set();
  for (const m of html.matchAll(/<script\b([^>]*)>/gi)) {
    const attrs = m[1];
    const src = attrs.match(/\ssrc=["']([^"']+)["']/i)?.[1];
    if (!src || !src.startsWith('/_next/') || /\snomodule\b/i.test(attrs)) continue;
    ra.add(src.split('?')[0]);
  }
  return [...ra];
}
const jsCache = new Map();
function js(src) {
  if (!jsCache.has(src)) {
    const p = path.join(RA, src.replace(/^\//, ''));
    if (!existsSync(p)) {
      console.log(`   ✗ HTML references ${src} but out/ has no such file`);
      process.exit(2);
    }
    jsCache.set(src, readFileSync(p, 'utf8'));
  }
  return jsCache.get(src);
}

// `404.html` and `404/index.html` are the same page written twice; count it once.
const pages = findHtml(RA)
  .map((f) => path.relative(RA, f).replace(/\\/g, '/'))
  .filter((p) => p !== '404.html')
  .sort();
if (pages.length < 2) {
  console.log(`   ✗ only ${pages.length} page(s) in out/ — cannot tell "some pages" from "all pages"`);
  process.exit(2);
}
const scriptsOf = new Map(pages.map((p) => [p, blockingScripts(readFileSync(path.join(RA, p), 'utf8'))]));

// ── measure ──────────────────────────────────────────────────────────────────
let bad = 0;
for (const g of groups) {
  const on = pages.filter((p) => scriptsOf.get(p).some((s) => js(s).includes(g.sentinel)));
  const where = on.map((p) => '/' + p.replace(/index\.html$/, '')).join(' ');
  if (on.length === 0) {
    console.log(`   ✗ ${g.name.padEnd(12)} on NO page — sentinel not found, so nothing here is being measured`);
    console.log(`       sentinel: ${JSON.stringify(g.sentinel)}`);
    bad++;
  } else if (on.length === pages.length) {
    console.log(`   ✗ ${g.name.padEnd(12)} on ALL ${pages.length} pages — this group is in the shared bundle`);
    bad++;
  } else {
    console.log(`   ✓ ${g.name.padEnd(12)} ${String(on.length).padStart(2)}/${pages.length} pages  ${where}`);
  }
}

if (bad) {
  console.log(`\n✗ ${bad} English group(s) are not split per page. The usual causes, in order:`);
  console.log('  1. a `\'use client\'` module imports `EN` from `@/lib/i18n/en` (server/tests only);');
  console.log('  2. a component mounted in the layout (header, footer, banners) reads a page group;');
  console.log('  3. a client module imports a helper that imports the full `EN` (see lib/titleShape.ts).');
  process.exit(1);
}
console.log(`✓ ${groups.length} page-only English groups each travel with some pages, none with all ${pages.length}.`);
process.exit(0);
