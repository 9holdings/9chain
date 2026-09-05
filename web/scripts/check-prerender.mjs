#!/usr/bin/env node
/**
 * check-prerender.mjs — does every exported page contain its content, or only a spinner?
 *
 * ═══ THE FAULT THIS EXISTS FOR ═══
 * Measured 2026-09-05: the exported HTML of `/chains/` contained the visible word "Loading…"
 * and nothing else. Eleven chains, four summary tiles and an explainer all arrived after
 * hydration, so a search engine, an AI reader, a slow phone and anyone with JavaScript off
 * got a blank page — on the one page whose purpose is to show those chains. Every gate in
 * this repo was green, because every gate measured the page as a BROWSER sees it.
 *
 * The measurement here is deliberately crude and deliberately about the RAW FILE: strip the
 * scripts and the tags, and count what a reader who runs no JavaScript would be left with.
 *
 * ⚠️ WHAT THIS CANNOT SEE. A page can pass with plenty of text and still be missing the part
 * that matters — the chrome (header, footer, language list) alone clears a low bar. That is
 * why `/chains/` has its own floor, tuned to a page that must carry a table: a build that
 * loses the directory rows drops it by thousands of characters, not tens.
 *
 * Exit: 0 pass · 1 red.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const NAY = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(NAY, '..', 'out');

/**
 * Floor per page, in characters of visible text.
 *
 * The shared chrome is worth roughly 1,000 on its own (nav + 30 language names + footer), so
 * a floor of 1,500 only proves a page has SOMETHING; the pages whose whole point is content
 * carry a floor high enough that losing that content is what trips it.
 */
const SAN = {
  /**
   * `/my-chains/` is a WALLET GATE and nothing else until someone signs — there is no content
   * to prerender, and inventing some would be worse than the low number. Its floor exists only
   * to catch the page losing its chrome entirely.
   */
  'my-chains/index.html': 1200,
  'chains/index.html': 6000,
  'index.html': 2500,
  'validators/index.html': 4000,
  'ceremony/index.html': 3000,
  // The mission page: if this drops, the argument has stopped shipping in the HTML.
  'nine-years/index.html': 4500,
};
const SAN_MAC_DINH = 1500;

/** Text as a reader without JavaScript sees it: no scripts, no tags, whitespace collapsed. */
export function chuNhinThay(html) {
  const than = html.includes('<body') ? html.split('<body')[1] : html;
  return than
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#x?[0-9a-f]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

if (!existsSync(OUT)) {
  console.log('✗ no out/ — run `next build` first');
  process.exit(1);
}

const trang = [];
(function quet(d, tien = '') {
  for (const m of readdirSyncSafe(d)) {
    const p = path.join(d, m.name);
    if (m.isDirectory()) quet(p, tien ? `${tien}/${m.name}` : m.name);
    else if (m.name.endsWith('.html')) trang.push(tien ? `${tien}/${m.name}` : m.name);
  }
})(OUT);

function readdirSyncSafe(d) {
  // `_next` holds the chunks, not pages — walking it would measure JavaScript as if it were text.
  return readdirSync(d, { withFileTypes: true }).filter((m) => m.name !== '_next');
}

let loi = 0;
for (const t of trang.sort()) {
  const chu = chuNhinThay(readFileSync(path.join(OUT, t), 'utf8'));
  const san = SAN[t] ?? SAN_MAC_DINH;
  // "Loading…" as the ONLY content is the exact fault; name it rather than only counting.
  const chiDangTai = /^[^A-Za-z0-9]*(Loading|Đang tải)/.test(chu) && chu.length < san;
  if (chu.length < san) {
    console.log(`✗ ${t} — ${chu.length} chars of text, floor ${san}`);
    if (chiDangTai) console.log('     the page renders a loading state and nothing else without JavaScript');
    console.log(`     first 90: ${chu.slice(0, 90)}`);
    loi = 1;
  } else {
    console.log(`   ✓ ${t.padEnd(26)} ${String(chu.length).padStart(6)} chars (floor ${san})`);
  }
}

console.log(loi ? '✗ a page ships without its content' : `✓ ${trang.length} pages carry their content without JavaScript`);
process.exitCode = loi;
