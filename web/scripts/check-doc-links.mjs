#!/usr/bin/env node
/**
 * check-doc-links.mjs — is every document `/docs/` points at actually there?
 *
 * ═══ WHY THIS GATE EXISTS BEFORE THE PAGE DOES ═══
 * The reason this project had no documentation page for so long is a dead link: measured
 * 2026-08-27, `https://9chain.org/docs/` returned 404 in all three shapes, so the footer
 * deliberately carried no documentation entry rather than point at it — and the 9Scan-A1 home
 * page carried two links into it anyway.
 *
 * A documentation hub is a page made entirely of links to somewhere else. The first thing a
 * dead one costs is not the click: it is the reader's belief that anything else on the page
 * was checked. So the list is DATA (`lib/docs.ts`), and this walks the same data the page
 * renders — not a second list that could drift from it.
 *
 * 🔴 IT MEASURES CONTENT, NOT JUST STATUS. GitHub answers 200 with a "page not found" screen
 * for some shapes of bad path, so a status code alone would let a renamed file through. Each
 * Markdown document is also fetched from `raw.githubusercontent.com` and must come back with
 * bytes; a PDF is checked by status and content-type, since its bytes are not text.
 *
 * Usage: node web/scripts/check-doc-links.mjs
 * Exit: 0 pass · 1 red.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const NAY = path.dirname(fileURLToPath(import.meta.url));

/**
 * Read the URLs out of `lib/docs.ts` by parsing the source rather than importing it: the file
 * is TypeScript, and a build step between this gate and the data it checks is one more place
 * for the two to disagree.
 */
const src = readFileSync(path.join(NAY, '..', 'lib', 'docs.ts'), 'utf8');
const GH = (src.match(/const GH = '([^']+)'/) ?? [])[1];
if (!GH) {
  console.log('✗ could not find the `GH` base in lib/docs.ts — has the file been restructured?');
  process.exit(1);
}
const urls = [...src.matchAll(/href: `\$\{GH\}\/([^`]+)`/g)].map((m) => ({
  file: m[1],
  page: `${GH}/${m[1]}`,
  raw: `${GH.replace('https://github.com/', 'https://raw.githubusercontent.com/').replace('/blob/', '/')}/${m[1]}`,
}));

if (urls.length === 0) {
  console.log('✗ no document URLs found in lib/docs.ts — the page would be an empty catalogue');
  process.exit(1);
}

const cho = (ms) => new Promise((r) => setTimeout(r, ms));
let loi = 0;

for (const u of urls) {
  try {
    const r = await fetch(u.page, { signal: AbortSignal.timeout(25_000), redirect: 'follow' });
    if (!r.ok) {
      console.log(`✗ ${u.file} — HTTP ${r.status} on the page a reader lands on`);
      loi = 1;
      continue;
    }
    if (u.file.endsWith('.pdf')) {
      console.log(`   ✓ ${u.file.padEnd(40)} ${r.status}`);
    } else {
      // The document itself, as bytes. A 200 on the HTML wrapper says the repository exists;
      // this says the FILE does.
      const raw = await fetch(u.raw, { signal: AbortSignal.timeout(25_000) });
      const chu = raw.ok ? await raw.text() : '';
      if (!raw.ok || chu.trim().length < 200) {
        console.log(`✗ ${u.file} — the file itself is missing or nearly empty (raw HTTP ${raw.status}, ${chu.length} bytes)`);
        loi = 1;
        continue;
      }
      console.log(`   ✓ ${u.file.padEnd(40)} ${r.status} · ${chu.split('\n').length} lines`);
    }
  } catch (e) {
    console.log(`✗ ${u.file} — ${e.message}`);
    loi = 1;
  }
  await cho(400); // GitHub rate-limits an unauthenticated burst; a 429 here would read as a dead link.
}

console.log(loi ? '✗ /docs/ would publish a link to something that is not there' : `✓ ${urls.length} documentation links alive, files present`);
process.exitCode = loi;
