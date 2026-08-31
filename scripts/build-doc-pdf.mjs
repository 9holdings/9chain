#!/usr/bin/env node
/**
 * build-doc-pdf.mjs — render one of the hand-written guides in `docs/` to a print-ready PDF.
 *
 * ═══ WHY THIS EXISTS AS A SCRIPT ═══
 *
 * The Vietnamese PDF was produced once, by hand, and the HTML it was rendered from was not kept.
 * So the only way to make the English one match was to reconstruct the pipeline from a note in
 * `HANDOFF.md` — which is exactly the situation that note was written to prevent. A document that
 * gets handed to strangers should be reproducible by a command, not by remembering.
 *
 * ═══ 🔴 THE TRAP THIS FILE EXISTS TO NOT REPEAT (HANDOFF gotcha 5) ═══
 *
 * **A closed `<details>` block DOES NOT PRINT.** The last run nearly shipped a guide whose
 * network-settings table — one of the two values the page exists to hand over — was simply absent
 * from the PDF, silently, because the browser does not paint collapsed content.
 *
 * ⇒ Every `<details>` is forced open before rendering. `--counter-check` builds the closed variant
 *   too and compares byte sizes, so the difference is demonstrated rather than asserted.
 *
 * Second lesson from the same run: `break-inside: avoid` applied to every step produced blank
 * pages (9 -> 7 once loosened). It is applied here only to tables and callouts, which are the
 * things genuinely ruined by a split.
 *
 * ═══ NO NEW DEPENDENCY ═══
 *
 * The renderer below covers exactly the Markdown these guides use — headings, tables,
 * blockquotes, ordered/unordered lists, rules, inline code/bold/italic/links, and raw
 * `<details>`/`<summary>`/`<sub>`. It is deliberately not a general Markdown implementation:
 * a general one would be a dependency, and this repo ships to people who rebuild it from source.
 *
 * Usage:
 *   node scripts/build-doc-pdf.mjs docs/CREATE-A-CHAIN.md
 *   node scripts/build-doc-pdf.mjs docs/CREATE-A-CHAIN.md --counter-check
 *   node scripts/build-doc-pdf.mjs docs/CREATE-A-CHAIN.md --keep-html
 */
import { readFileSync, writeFileSync, existsSync, statSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { tmpdir } from "node:os";

const argv = process.argv.slice(2);
const SRC = argv.find((a) => !a.startsWith("--"));
const COUNTER_CHECK = argv.includes("--counter-check");
const KEEP_HTML = argv.includes("--keep-html");

if (!SRC) {
  console.error("usage: node scripts/build-doc-pdf.mjs <file.md> [--counter-check] [--keep-html]");
  process.exit(2);
}
if (!existsSync(SRC)) {
  console.error(`FATAL ${SRC} does not exist`);
  process.exit(2);
}

/** Chrome, wherever this machine keeps it. Refuses rather than guessing silently. */
function findChrome() {
  const candidates = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ];
  const found = candidates.find((c) => existsSync(c));
  if (!found) {
    console.error("FATAL no Chrome found. Tried:\n  " + candidates.join("\n  "));
    process.exit(2);
  }
  return found;
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Inline markup. Code spans are extracted FIRST so their contents are never re-parsed. */
function inline(raw) {
  const code = [];
  let s = raw.replace(/`([^`]+)`/g, (_, c) => `\u0000${code.push(c) - 1}\u0000`);
  s = esc(s);
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  // Bare URLs, but never one already inside an href="..."
  s = s.replace(/(^|[\s(>])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2">$2</a>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(code[+i])}</code>`);
}

const cellsOf = (line) => line.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());

function render(md) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let i = 0;

  const flushList = (buf, tag) => {
    if (!buf.length) return;
    out.push(`<${tag}>` + buf.map((li) => `<li>${inline(li)}</li>`).join("") + `</${tag}>`);
    buf.length = 0;
  };

  while (i < lines.length) {
    const line = lines[i];

    // Raw HTML the guides use directly. `<details>` is forced OPEN - see the header.
    if (/^<details>/.test(line)) { out.push("<details open>"); i++; continue; }
    if (/^<\/details>|^<summary>|^<\/summary>|^<sub>|^<\/sub>/.test(line)) { out.push(line); i++; continue; }

    if (/^---+\s*$/.test(line)) { out.push("<hr>"); i++; continue; }
    if (!line.trim()) { i++; continue; }

    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); i++; continue; }

    // Table: a header row followed by a |---|---| separator.
    if (/^\|/.test(line) && /^\|[\s:|-]+\|?\s*$/.test(lines[i + 1] ?? "")) {
      const head = cellsOf(line);
      i += 2;
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) rows.push(cellsOf(lines[i++]));
      out.push(
        "<table><thead><tr>" + head.map((c) => `<th>${inline(c)}</th>`).join("") + "</tr></thead><tbody>" +
        rows.map((r) => "<tr>" + r.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>").join("") +
        "</tbody></table>",
      );
      continue;
    }

    // Blockquote: consecutive `>` lines become one callout.
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ""));
      out.push(`<blockquote><p>${inline(buf.join(" ").trim())}</p></blockquote>`);
      continue;
    }

    // Ordered list. Continuation lines are indented and belong to the item above.
    if (/^\d+\.\s/.test(line)) {
      const buf = [];
      while (i < lines.length) {
        const m = lines[i].match(/^\d+\.\s+(.*)$/);
        if (m) { buf.push(m[1]); i++; continue; }
        if (/^\s{2,}\S/.test(lines[i]) && buf.length) { buf[buf.length - 1] += " " + lines[i].trim(); i++; continue; }
        if (!lines[i].trim() && /^(\s{2,}\S|\d+\.\s)/.test(lines[i + 1] ?? "")) { i++; continue; }
        break;
      }
      flushList(buf, "ol");
      continue;
    }

    if (/^[-*]\s/.test(line)) {
      const buf = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) buf.push(lines[i++].replace(/^[-*]\s+/, ""));
      flushList(buf, "ul");
      continue;
    }

    // Paragraph: run of plain lines, joined.
    const buf = [];
    while (i < lines.length && lines[i].trim() && !/^(#|\||>|---|\d+\.\s|[-*]\s|<)/.test(lines[i])) buf.push(lines[i++]);
    if (buf.length) out.push(`<p>${inline(buf.join(" "))}</p>`);
    else { out.push(`<p>${inline(line)}</p>`); i++; }
  }
  return out.join("\n");
}

/**
 * Print stylesheet. Deliberately plain: this is handed to people who may print it on paper, so
 * nothing here spends ink on decoration, and no colour carries meaning on its own.
 */
const CSS = `
@page { size: A4; margin: 16mm 15mm 14mm; }
* { box-sizing: border-box; }
body { font: 10.5pt/1.5 "Segoe UI", system-ui, -apple-system, sans-serif; color: #14161a; margin: 0; }
h1 { font-size: 21pt; line-height: 1.2; margin: 0 0 .4em; letter-spacing: -.01em; }
h2 { font-size: 13.5pt; margin: 1.5em 0 .5em; padding-bottom: .25em; border-bottom: 1.5px solid #d8dbe0; break-after: avoid; }
h3 { font-size: 11.5pt; margin: 1.2em 0 .4em; break-after: avoid; }
p { margin: .55em 0; }
a { color: #14161a; text-decoration: none; border-bottom: .5px solid #9aa0a6; word-break: break-word; }
code { font: 9.5pt "Cascadia Mono", "Consolas", monospace; background: #f1f3f5; padding: .1em .35em; border-radius: 3px; word-break: break-word; }
hr { border: 0; border-top: .5px solid #e3e6ea; margin: 1.4em 0; }
ol, ul { margin: .55em 0; padding-left: 1.5em; }
li { margin: .3em 0; }
/* 🔴 Only tables and callouts get break protection. Applying it per step produced blank pages. */
table { width: 100%; border-collapse: collapse; margin: .8em 0; font-size: 9.5pt; break-inside: avoid; }
th, td { border: .5px solid #d8dbe0; padding: .42em .6em; text-align: left; vertical-align: top; }
th { background: #f1f3f5; font-weight: 600; }
blockquote { margin: .9em 0; padding: .6em .9em; border-left: 3px solid #c8ccd2; background: #f8f9fa; break-inside: avoid; }
blockquote p { margin: 0; }
details { margin: .8em 0; }
summary { font-weight: 600; margin-bottom: .4em; }
sub { font-size: 8.5pt; color: #5f6469; }
`;

function toHtml(md, { detailsOpen = true } = {}) {
  let body = render(md);
  if (!detailsOpen) body = body.replace(/<details open>/g, "<details>");
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>\n${body}\n</body></html>`;
}

function printPdf(chrome, htmlPath, pdfPath) {
  execFileSync(chrome, [
    "--headless=new", "--disable-gpu", "--no-sandbox",
    "--virtual-time-budget=20000", "--no-pdf-header-footer",
    `--print-to-pdf=${pdfPath}`, `file:///${htmlPath.replace(/\\/g, "/")}`,
  ], { stdio: "pipe", timeout: 180_000 });
}

const chrome = findChrome();
const md = readFileSync(SRC, "utf8");
const outPdf = path.resolve(SRC.replace(/\.md$/, ".pdf"));
const htmlPath = path.join(KEEP_HTML ? path.dirname(path.resolve(SRC)) : tmpdir(), path.basename(SRC).replace(/\.md$/, ".html"));

writeFileSync(htmlPath, toHtml(md), "utf8");
printPdf(chrome, htmlPath, outPdf);

const html = readFileSync(htmlPath, "utf8");
const detailsCount = (html.match(/<details open>/g) || []).length;
console.log(`source   : ${SRC}`);
console.log(`html     : ${htmlPath}${KEEP_HTML ? "" : "  (temporary)"}`);
console.log(`pdf      : ${outPdf}  ${(statSync(outPdf).size / 1024).toFixed(0)} KB`);
console.log(`details  : ${detailsCount} block(s), all forced OPEN`);

if (COUNTER_CHECK) {
  // 🔴 Show the trap rather than assert it: render the same document with <details> collapsed
  // and compare. A closed block prints nothing, so the closed PDF must come out SMALLER.
  const closedHtml = htmlPath.replace(/\.html$/, ".closed.html");
  const closedPdf = path.join(tmpdir(), path.basename(outPdf).replace(/\.pdf$/, ".closed.pdf"));
  writeFileSync(closedHtml, toHtml(md, { detailsOpen: false }), "utf8");
  printPdf(chrome, closedHtml, closedPdf);
  const open = statSync(outPdf).size, closed = statSync(closedPdf).size;
  console.log(`\n══ COUNTER-CHECK — HANDOFF gotcha 5 ══`);
  console.log(`  <details> OPEN   : ${open} bytes`);
  console.log(`  <details> CLOSED : ${closed} bytes`);
  console.log(closed < open
    ? `  ✅ the closed build IS smaller — collapsed content really does not print, and this PDF is on the right side of it`
    : `  🔴 no size difference — the counter-check proved nothing; do not trust the open build either`);
  unlinkSync(closedHtml); unlinkSync(closedPdf);
  if (closed >= open) process.exit(1);
}
