/**
 * check-budget.mjs — the size ceiling for **ONE page's first load, measured after compression**.
 *
 * Why it exists: this is a testnet site, visitors may be on a weak connection, and the price
 * of adding a build step (M10.1) is that the bundle can grow without anyone noticing — the
 * four hand-written HTML pages that came before had **no JS at all**. A number with a ceiling
 * makes every overrun a conscious decision; without one it only ever goes up.
 *
 * ═══ FOUR WRONG MEASUREMENTS, TRIED AND ABANDONED ═══
 * 1. **Summing every file in `chunks/`** — gives 800 KB, but that is the total across EVERY
 *    page; no user downloads that much. A number nobody pays is not a budget.
 * 2. **Measuring uncompressed size** — Caddy serves compressed JS, so the uncompressed number
 *    is about 5× what actually crosses the wire. A budget built on it is either far too tight
 *    (blocking wrongly) or far too loose (never firing).
 * 3. 🔴 **Matching every `/_next/static/*.js` with a regex over the HTML** (the version up to
 *    2026-08-27). It swallowed `polyfills-*.js`, whose tag carries **`noModule=""`** — by
 *    definition, **every browser that understands ES modules IGNORES it**. Measured for real
 *    on https://a1.9chain.org in Chrome (2026-08-27): of the 8 JS files the regex counted, the
 *    browser fetched **7**; polyfills produced **not one request**. 38.7 KB = **25.5% of the
 *    ceiling** that nobody pays. It now counts only scripts WITHOUT `noModule`, and that count
 *    matches the real request list **exactly, 7 for 7**.
 * 4. 🔴 **Counting JS only** (also up to 2026-08-27) — while the file's own title claimed to
 *    measure "what someone opening that page actually has to download". CSS is downloaded by
 *    **everyone**, always, and it is a render-blocking `<link>`. Leaving it out puts a fixed
 *    cost outside every budget. HTML + CSS are now counted too.
 *
 * The measurement in use: for EACH HTML page, sum **the HTML file itself** + **the CSS in
 * `<link rel=stylesheet>`** + **the JS in `<script src>` WITHOUT `noModule`**, each gzipped.
 * Those are the files a browser fetches **unconditionally** when the page opens.
 *
 * ═══ THE LIMITS OF THIS MEASUREMENT — READ BEFORE TRUSTING THE NUMBER ═══
 *
 * ▸ **Fonts are NOT part of what blocks.** Not because they are cheap, but because whether
 *   they are fetched is **conditional**: `next/font` splits each typeface into several files
 *   by `unicode-range`, and the browser takes only the files holding characters the page
 *   actually uses — AND only if some CSS rule genuinely applies that typeface to an element.
 *   Deciding the second half requires running the whole cascade, and this script only reads
 *   static files. So fonts are printed as a **diagnostic upper bound**, never used to block.
 *
 *   🔴 MEASURED FOR REAL 2026-08-27 against the live site — **the true figure is 0 KB, not an
 *   upper bound**: `document.fonts` declares **27 faces with `loaded` = 0**, and there is not
 *   one `.woff2` request. The reason: `tokens.css` declares `--font-sans: var(--font-instrument)`
 *   inside `@theme` ⇒ Tailwind v4 emits it onto **`:root` (`<html>`)**, while `next/font`'s
 *   `__variable_*` classes sit on **`<body>`** (`layout.tsx`). At `:root` `--font-instrument`
 *   does not exist yet and there is no fallback, so `--font-sans` becomes *guaranteed-invalid*
 *   and `font-family: var(--font-sans)` collapses to the system stack. Measured:
 *   `getComputedStyle` of EVERY element on the home page returns **exactly one** family — the
 *   Tailwind default stack.
 *   ⇒ The three brand typefaces are **currently running nowhere at all**. The day that is
 *   fixed, the font line below becomes a REAL cost (roughly 120 KB for the home page) and
 *   **the ceiling must be revisited** — do not fix the fonts and leave this number alone.
 *
 * ▸ **This is a LOCAL compressed number, not CDN bytes.** Compared against Chrome through
 *   Cloudflare, home page 2026-08-27: JS 112.9 KB here / **117.3 KB** real (−3.9%), CSS
 *   6.5 / 6.7 (−3.2%), HTML 4.8 / 5.4 (−11.3%). No single gzip level matches all three at once
 *   (JS matches level 4, CSS sits between 4 and 5, HTML is worse than level 1) ⇒ the CDN does
 *   not use one fixed level, and chasing a byte-for-byte match is wasted effort. Keep Node's
 *   default level for **stability and comparability between builds**; the real figure runs a
 *   **few percent** higher, and the 160 ceiling already leaves room for that.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Renamed from `A1_TRAN_JS_KB` when the measurement stopped being JS-only. Nothing else in
// the repo sets the old variable (grepped) — but if anyone still has it in a shell, it is now inert.
const TRAN_KB = Number(process.env.A1_TRAN_KB || 160);
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RA = path.join(GOC, 'out');

if (!existsSync(RA)) {
  console.error('✗ no out/ directory yet — run `pnpm build` first');
  process.exit(1);
}

function timHtml(dir, ra = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) timHtml(p, ra);
    else if (e.name.endsWith('.html')) ra.push(p);
  }
  return ra;
}

const nenCache = new Map();
/** Gzipped KB of a file in `out/`, looked up by absolute web-style path. */
function kbNen(duongTuongDoi) {
  if (nenCache.has(duongTuongDoi)) return nenCache.get(duongTuongDoi);
  const p = path.join(RA, duongTuongDoi.replace(/^\//, ''));
  const kb = existsSync(p) ? gzipSync(readFileSync(p)).length / 1024 : 0;
  nenCache.set(duongTuongDoi, kb);
  return kb;
}

/**
 * Split `<script src>` into two groups. `noModule` is a real boundary, not a detail: a browser
 * that understands ES modules ignores that tag, and a browser that does not could never have
 * run this page in the first place. Read the attribute off THE TAG ITSELF, do not infer it
 * from the filename — the filename is a Next convention and can change at any time.
 */
function chiaScript(html) {
  const dungModule = new Set();
  const cuKyThuat = new Set();
  for (const m of html.matchAll(/<script\b([^>]*)>/gi)) {
    const attrs = m[1];
    const src = attrs.match(/\ssrc=["']([^"']+)["']/i)?.[1];
    if (!src || !src.startsWith('/_next/')) continue;
    (/\snomodule\b/i.test(attrs) ? cuKyThuat : dungModule).add(src);
  }
  return { dungModule: [...dungModule], cuKyThuat: [...cuKyThuat] };
}

function timCss(html) {
  const ra = new Set();
  for (const m of html.matchAll(/<link\b([^>]*)>/gi)) {
    const attrs = m[1];
    if (!/\srel=["']?stylesheet/i.test(attrs)) continue;
    const href = attrs.match(/\shref=["']([^"']+)["']/i)?.[1];
    if (href?.startsWith('/_next/')) ra.add(href);
  }
  return [...ra];
}

/** The characters the page actually displays — strip script/style, then strip tags. Enough for a diagnostic. */
function kyTuCuaTrang(html) {
  const chu = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  return new Set([...chu].map((c) => c.codePointAt(0)));
}

/** `u+0100-02ba` · `u+00??` · `u+0131` → [start, end]. */
function docUnicodeRange(txt) {
  const ra = [];
  for (const phan of txt.split(',')) {
    const t = phan.trim().toLowerCase().replace(/^u\+/, '');
    if (!t) continue;
    if (t.includes('?')) {
      ra.push([parseInt(t.replace(/\?/g, '0'), 16), parseInt(t.replace(/\?/g, 'f'), 16)]);
    } else if (t.includes('-')) {
      const [a, b] = t.split('-');
      ra.push([parseInt(a, 16), parseInt(b, 16)]);
    } else {
      const v = parseInt(t, 16);
      ra.push([v, v]);
    }
  }
  return ra;
}

/**
 * An upper bound for fonts: the files whose `unicode-range` intersects the page's characters.
 * Not gzipped — `.woff2` is already compressed, and compressing it again invents a number
 * smaller than what crosses the wire. A missing `unicode-range` ⇒ treat it as covering every
 * character (which is what the CSS standard says).
 */
function fontCoThe(cssPaths, kyTu) {
  const ra = new Map();
  for (const cssPath of cssPaths) {
    const p = path.join(RA, cssPath.replace(/^\//, ''));
    if (!existsSync(p)) continue;
    const css = readFileSync(p, 'utf8');
    for (const m of css.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
      const than = m[1];
      const src = than.match(/url\(\s*["']?([^"')]+)["']?\s*\)/)?.[1];
      if (!src) continue;
      const urTxt = than.match(/unicode-range:\s*([^;}]+)/i)?.[1];
      const dung = !urTxt
        ? true
        : docUnicodeRange(urTxt).some(([a, b]) => [...kyTu].some((c) => c >= a && c <= b));
      if (!dung) continue;
      const f = path.join(RA, src.replace(/^\//, ''));
      if (existsSync(f)) ra.set(src, readFileSync(f).length / 1024);
    }
  }
  return ra;
}

let teNhat = { ten: '', kb: 0 };
const dong = [];
for (const f of timHtml(RA)) {
  const ten = path.relative(RA, f).replace(/\\/g, '/');
  const html = readFileSync(f, 'utf8');

  const { dungModule, cuKyThuat } = chiaScript(html);
  const cssPaths = timCss(html);

  const kbHtml = gzipSync(Buffer.from(html)).length / 1024;
  const kbJs = dungModule.reduce((t, d) => t + kbNen(d), 0);
  const kbCss = cssPaths.reduce((t, d) => t + kbNen(d), 0);
  const kbBoQua = cuKyThuat.reduce((t, d) => t + kbNen(d), 0);
  const font = fontCoThe(cssPaths, kyTuCuaTrang(html));
  const kbFont = [...font.values()].reduce((t, v) => t + v, 0);

  const kb = kbHtml + kbJs + kbCss;
  dong.push({ ten, kb, kbHtml, kbJs, kbCss, kbFont, soJs: dungModule.length, kbBoQua, soFont: font.size });
  if (kb > teNhat.kb) teNhat = { ten, kb };
}

const so = (v, w = 6) => v.toFixed(1).padStart(w);
console.log('   total  =  html +    js +   css        (fonts: an upper bound, NOT blocking)');
for (const d of dong) {
  console.log(
    `   ${so(d.kb, 6)} KB gz = ${so(d.kbHtml, 5)} + ${so(d.kbJs, 5)} + ${so(d.kbCss, 5)}` +
      ` · ${String(d.soJs).padStart(2)} js` +
      `  ${d.ten}` +
      (d.kbFont ? `   [fonts ≤ ${d.kbFont.toFixed(1)} KB / ${d.soFont} files]` : ''),
  );
}

const boQua = dong[0]?.kbBoQua ?? 0;
if (boQua) {
  console.log(`   (excluding ${boQua.toFixed(1)} KB of \`noModule\` polyfills — module-aware browsers skip them)`);
}

const vuot = teNhat.kb > TRAN_KB;
console.log(
  `${vuot ? '✗' : '✓'} heaviest page: ${teNhat.ten} — ${teNhat.kb.toFixed(1)} KB gzip / ceiling ${TRAN_KB} KB`,
);
if (vuot) {
  console.log('  Going over the ceiling is a DECISION, not a fault to dodge: either cut something,');
  console.log('  or raise A1_TRAN_KB and write the reason into DECISIONS.');
}
process.exit(vuot ? 1 : 0);
