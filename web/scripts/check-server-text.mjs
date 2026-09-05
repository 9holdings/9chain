#!/usr/bin/env node
/**
 * check-server-text.mjs — every preset id the LIVE console has written must be translatable.
 *
 * Exit 0 = every id in the public directory data has a dictionary entry. Exit 1 = an id reached
 * the product that the 30 dictionaries do not know (readers will see the console's English).
 * Exit 2 = could not measure.
 *
 * Usage:  node scripts/check-server-text.mjs https://a1.9chain.org
 *         node scripts/check-server-text.mjs --fixture=test/fixtures/x.json   (offline / negative control)
 *
 * ═══ WHY THIS IS MEASURED AGAINST THE PRODUCT, NOT THE REPO ═══
 * The console lives on `main` and is deployed separately from `web/`. A preset added there
 * reaches `console-chains.json` the moment someone launches a chain with it, and no gate in
 * `web/` sees `main` change. `test/server-text.test.ts` pins a COPY of the id list; this script
 * asks the running product which ids actually exist. It has been seen red: run it with a
 * fixture whose record carries `"preset": "not-a-real-preset"`.
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const fixture = args.find((a) => a.startsWith('--fixture='))?.slice('--fixture='.length);
const origin = args.find((a) => /^https?:\/\//.test(a));

// The dictionary's preset ids, read from the English folder as TEXT: the files are TypeScript
// and this script must not depend on a build. Keys are quoted (`'zero-fee'`) or bare (`standard`).
// English is a folder since 2026-09-05 (`lib/i18n/en/*.ts`); the files keep the old text
// shape, so their concatenation reads exactly like the old single file.
const EN_DIR = path.join(WEB, 'lib/i18n/en');
const en = readdirSync(EN_DIR)
  .filter((f) => f.endsWith('.ts'))
  .sort()
  .map((f) => readFileSync(path.join(EN_DIR, f), 'utf8'))
  .join('\n');
const block = en.match(/\n  presets: \{([\s\S]*?)\n  \},/)?.[1];
if (!block) {
  console.log('✗ could not find the `presets` block in lib/i18n/en/');
  process.exit(2);
}
const known = new Set([...block.matchAll(/^\s{4}'?([A-Za-z0-9-]+)'?: \{/gm)].map((m) => m[1]));
if (known.size === 0) {
  console.log('✗ the `presets` block in en.ts yielded no ids — the reader is broken, not the data');
  process.exit(2);
}

let data;
try {
  if (fixture) {
    data = JSON.parse(readFileSync(path.resolve(WEB, fixture), 'utf8'));
  } else if (origin) {
    const r = await fetch(`${origin}/chains/data/console-chains.json`, { signal: AbortSignal.timeout(20_000) });
    if (!r.ok) {
      console.log(`✗ ${origin}/chains/data/console-chains.json → HTTP ${r.status}`);
      process.exit(2);
    }
    data = await r.json();
  } else {
    console.log('usage: check-server-text.mjs <https://origin> | --fixture=<file>');
    process.exit(2);
  }
} catch (e) {
  console.log(`✗ could not read the directory data: ${e?.message ?? e}`);
  process.exit(2);
}

const records = [...(data.chains ?? []), ...(data.retired ?? [])];
const used = new Map();
for (const r of records) if (typeof r.preset === 'string' && r.preset) used.set(r.preset, (used.get(r.preset) ?? 0) + 1);
if (used.size === 0) {
  // Not a pass: the data carried no ids at all, so nothing was measured.
  console.log(`✗ ${records.length} records, none with a \`preset\` id — the data contract changed, or the data is empty`);
  process.exit(2);
}
const missing = [...used.keys()].filter((id) => !known.has(id));
for (const [id, n] of used) console.log(`   ${missing.includes(id) ? '✗' : '✓'} ${id} · ${n} record(s)${missing.includes(id) ? '  — NOT in the dictionary' : ''}`);
if (missing.length) {
  console.log(`✗ ${missing.length} preset id(s) in the live data have no translation — readers get the console's English`);
  process.exit(1);
}
console.log(`✓ every preset id in the live directory data (${used.size}) is translated · dictionary knows ${known.size}`);
