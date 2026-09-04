#!/usr/bin/env node
/**
 * check-dict-values.mjs — a translated VALUE may only change when somebody changes it DELIBERATELY.
 *
 * Exit 0 = matches the ledger. Exit 1 = a translation changed undeclared. Exit 2 = could not measure.
 * Re-record the ledger after an intentional edit:  node scripts/check-dict-values.mjs --accept
 *
 * ═══ WHY THIS GATE EXISTS — IT HAS BEEN GENUINELY RED ═══
 * On `2026-09-03`, three Vietnamese→English identifier renames ran over the whole of `web/`.
 * Dictionaries are `.ts` too, so the renamer treated them as code and rewrote **five** places in
 * the Spanish translation: `Tu monedero` (YOUR wallet) became `Dict monedero` — because `tu` was
 * in the `tuDien → dict` map. Spanish readers got a meaningless sentence on four screens, one of
 * them the label on the faucet's wallet-address field.
 *
 * 🔴 **Not one gate in this tree could see it**, because no gate reads the CONTENT of a translation:
 *   • `tsc` green — `'Dict monedero'` is a valid string like any other.
 *   • `i18n-shape` green — it compares KEY SETS and PLACEHOLDER SETS across the 30, not the words.
 *   • `check-interpolate` green — this string has no placeholders at all.
 *   • build/axe/budget green — text is still text, and the same length.
 * This is exactly the "every gate is green because they all measure the wrong quantity" class.
 * The only gate that catches it is one that reads the very words people will read, and remembers
 * what those words used to be.
 *
 * ═══ IT IS A RATCHET, NOT A FREEZE ═══
 * Adding a new key **passes** (it is reported, so you know) — because `i18n-shape` already
 * requires the 30 key sets to match `en`, and a rename never ADDS a key. Changing the value of an
 * existing key **blocks**, until someone runs `--accept`. That direction is deliberate: the thing
 * I do daily (add keys) is never questioned, while the rare and dangerous thing (already
 * translated words spontaneously differing) requires a signature.
 *
 * ⚠️ LIMITS: the gate reads single-line strings AND multi-line concatenations (`'…' + '…'`). It
 * does **not** read a value built from a variable or a function call. The first scan I wrote read
 * only single lines, and precisely because of that it missed 1 of the 5 Spanish breakages — the
 * one inside a concatenation. The gate counts and DECLARES how many values it could not read;
 * a gate that silently skips what it does not understand is a gate lying about its coverage.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const I18N = path.join(WEB, 'lib/i18n');
const DICTS = path.join(I18N, 'dicts');
const LOCK = path.join(I18N, 'values.lock.json');
const ACCEPT = process.argv.includes('--accept');
// `--list-skipped` prints BY NAME the values the reader could not reconstruct, so a person can
// judge the part this gate does NOT guard — rather than trusting a single total.
const LIST_SKIPPED = process.argv.includes('--list-skipped');

const fail = (m) => {
  console.error(`✗ ${m}`);
  process.exitCode = 1;
};
const cannotMeasure = (m) => {
  console.error(`? COULD NOT MEASURE — ${m}`);
  process.exitCode = 2;
};

/**
 * Read one dictionary file into `{ "group.key": value }`.
 *
 * Strip comments first, then walk the lines: `  group: {` opens a group, `key: 'value'` is an
 * entry, and a line ending in `+` continues onto the next. Also returns `skipped`: the number of
 * entries whose value this reader could not reconstruct as a plain string.
 */
function readDict(file) {
  const src = readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '');
  const lines = src.split(/\r?\n/);
  const out = {};
  let group = '?';
  let skipped = 0;

  for (let i = 0; i < lines.length; i++) {
    const g = /^ {2}(\w+): \{/.exec(lines[i]);
    if (g) {
      group = g[1];
      continue;
    }
    const m = /^\s*(\w+):\s*(.*)$/.exec(lines[i]);
    if (!m || m[2].startsWith('{')) continue;

    // Gather the whole value expression. Both kinds of line break must be readable:
    //   • `key:` with the value starting ON THE NEXT LINE  (what prettier does when a line is too long)
    //   • `'…' +` continuing onto the next line
    // 🔴 The first version dropped the first kind entirely — and that is exactly where the fifth
    // `Dict monedero` breakage lived, so the gate was GREEN when I re-injected the real bug to
    // test it. A gate that silently skips what it cannot read proves nothing.
    let expr = m[2];
    let j = i;
    while ((expr.trim() === '' || /\+\s*$/.test(expr)) && j + 1 < lines.length) {
      expr += lines[++j].trim();
    }
    i = j;
    expr = expr.replace(/,\s*$/, '').trim();

    // Accept only plain strings and concatenations of plain strings. BOTH quote styles: a
    // translation uses double quotes whenever the sentence contains an apostrophe
    // (`"9Chain's public testnet…"`), and the first version read only single quotes, so it left 8
    // sentences unguarded — one of them `common.shortDesc`, the line directly under the home page `<h1>`.
    const LIT = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g;
    const parts = [...expr.matchAll(LIT)].map((x) => x[0].slice(1, -1));
    const noiSach = parts.length > 0 && expr.replace(LIT, '').replace(/[+\s]/g, '') === '';
    if (!noiSach) {
      if (/^['"`]/.test(expr)) {
        skipped++;
        if (LIST_SKIPPED) console.log(`  … ${path.basename(file)}  ${group}.${m[1]}  ${expr.slice(0, 72)}`);
      }
      continue;
    }
    out[`${group}.${m[1]}`] = parts.join('');
  }
  return { values: out, skipped };
}

const short = (s) => createHash('sha1').update(s, 'utf8').digest('hex').slice(0, 12);

// ── read all 30 ──────────────────────────────────────────────────────────────
if (!existsSync(DICTS)) {
  cannotMeasure(`cannot find ${path.relative(WEB, DICTS)}`);
  process.exit(process.exitCode);
}
const files = [
  ['en', path.join(I18N, 'en.ts')],
  ...readdirSync(DICTS)
    .filter((f) => f.endsWith('.ts'))
    .map((f) => [f.slice(0, -3), path.join(DICTS, f)]),
];

const now = {};
let tongSkipped = 0;
let tongKey = 0;
for (const [lang, file] of files) {
  const { values, skipped } = readDict(file);
  if (Object.keys(values).length === 0) {
    cannotMeasure(`${lang}: read 0 strings — the reader does not understand this file`);
    process.exit(process.exitCode);
  }
  now[lang] = values;
  tongSkipped += skipped;
  tongKey += Object.keys(values).length;
}

// ── write the ledger ─────────────────────────────────────────────────────────
if (ACCEPT) {
  const lock = {};
  for (const lang of Object.keys(now).sort()) {
    lock[lang] = {};
    for (const k of Object.keys(now[lang]).sort()) lock[lang][k] = short(now[lang][k]);
  }
  writeFileSync(LOCK, JSON.stringify(lock, null, 1) + '\n', 'utf8');
  console.log(`✓ ledger written to ${path.relative(WEB, LOCK)} — ${files.length} languages · ${tongKey} strings`);
  process.exit(0);
}

// ── reconcile ────────────────────────────────────────────────────────────────
if (!existsSync(LOCK)) {
  cannotMeasure(`no ledger at ${path.relative(WEB, LOCK)} yet — run \`--accept\` once to create it`);
  process.exit(process.exitCode);
}
const lock = JSON.parse(readFileSync(LOCK, 'utf8'));

let doi = 0;
let them = 0;
let mat = 0;
for (const lang of Object.keys(now)) {
  const cu = lock[lang];
  if (!cu) {
    console.log(`  + ${lang}: a new language, not in the ledger yet`);
    them += Object.keys(now[lang]).length;
    continue;
  }
  for (const [k, v] of Object.entries(now[lang])) {
    if (!(k in cu)) {
      them++;
      continue;
    }
    if (cu[k] !== short(v)) {
      doi++;
      fail(`${lang}  ${k}  — the translation changed and nobody declared it`);
      console.error(`      nay: ${JSON.stringify(v.slice(0, 90))}`);
    }
  }
  for (const k of Object.keys(cu)) if (!(k in now[lang])) mat++;
}

if (doi) {
  console.error(
    `\n${doi} translations changed outside the ledger. If that was DELIBERATE: \`node scripts/check-dict-values.mjs --accept\`.\n` +
      `If NOT: most likely a rename or text pass just ran over \`lib/i18n/\` — see the top of this file.`,
  );
} else {
  console.log(
    `✓ ${tongKey} strings match the ledger (${files.length} languages)` +
      `${them ? ` · ${them} new keys not yet in the ledger` : ''}` +
      `${mat ? ` · ${mat} ledger keys no longer present` : ''}` +
      `${tongSkipped ? ` · ${tongSkipped} values the reader COULD NOT read` : ''}`,
  );
}
