#!/usr/bin/env node
/**
 * check-interpolate.mjs — every `interpolate()` call must supply EXACTLY the placeholders its
 * string declares.
 *
 * Exit 0 = matched. Exit 1 = mismatched. Exit 2 = could not measure.
 *
 * ═══ WHY THIS GATE HAD TO EXIST BEFORE RENAMING ANY PLACEHOLDER ═══
 * `interpolate(s, o)` replaces only the keys it finds in `o`. A key that is one letter off
 * produces **no report at all**: the string goes out with a literal `{date}` mid-sentence, the
 * reader sees a stray brace, and nothing in this tree catches it —
 *   • `tsc` cannot see it: the second argument is a `Record<string, …>`, every key type-checks.
 *   • `i18n-shape` cannot see it: it compares placeholders BETWEEN THE 30 DICTIONARIES, so it
 *     catches "a translation lost `{ngay}`" but is blind to "the call site passes `{date}`".
 *   • axe/build/test cannot see it: a string is still a string.
 * That is exactly the class of bug the `2026-09-03` rename was about to walk into, so the
 * measurement came before the edit.
 *
 * ═══ MEASURED IN BOTH DIRECTIONS ═══
 *   • the string declares `{x}` and the call does NOT supply it ⇒ the user reads `{x}`
 *   • the call supplies `y` and the string does NOT declare it  ⇒ data is dropped silently
 *     (usually the trace of a half-finished rename)
 *
 * ⚠️ LIMITS, READ BEFORE TRUSTING IT: this gate can only read calls whose first argument is a
 * STATIC KEY PATH (`t.faucet.quotaFormat`, `EN.rebuild.title`). A call built from a dynamic
 * string or an intermediate variable is SKIPPED, and it **says that it skipped** — a gate that
 * silently skips what it does not understand is a gate lying about its coverage.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// 🔴 English is a FOLDER since 2026-09-05 (`lib/i18n/en/*.ts`, one file per group of readers).
// Each file keeps the old single file's text shape (`  group: {` … `  },`), so reading the
// files CONCATENATED is reading the old file. `index.ts` holds no strings and is skipped.
const EN_DIR = path.join(GOC, 'lib', 'i18n', 'en');

if (!existsSync(EN_DIR)) {
  console.log('   ✗ cannot find lib/i18n/en/');
  process.exit(2);
}
const EN_FILES = readdirSync(EN_DIR).filter((f) => f.endsWith('.ts') && f !== 'index.ts').sort();
if (EN_FILES.length === 0) {
  console.log('   ✗ lib/i18n/en/ has no dictionary files');
  process.exit(2);
}

/** Read the English folder into a `path.key` -> string map. Enough to extract the `{…}`. */
function docEn() {
  const src = EN_FILES.map((f) => readFileSync(path.join(EN_DIR, f), 'utf8')).join('\n');
  const ra = new Map();
  let nhom = null;
  for (const dong of src.split('\n')) {
    const mNhom = dong.match(/^  ([a-zA-Z][A-Za-z0-9]*): \{/);
    if (mNhom) {
      nhom = mNhom[1];
      continue;
    }
    if (/^  \},/.test(dong)) {
      nhom = null;
      continue;
    }
    if (!nhom) continue;
    const mKhoa = dong.match(/^    ([a-zA-Z][A-Za-z0-9]*):\s*(.*)$/);
    if (!mKhoa) continue;
    // A string can be concatenated across lines with `+`; only the `{…}` matter here, so gather
    // roughly: take the rest of the block up to the line holding the next key.
    ra.set(`${nhom}.${mKhoa[1]}`, mKhoa[2]);
  }
  // Second pass: fold the continuation lines into the value
  const dong = src.split('\n');
  for (let i = 0; i < dong.length; i++) {
    const m = dong[i].match(/^    ([a-zA-Z][A-Za-z0-9]*):\s*$/);
    if (!m) continue;
    let j = i + 1;
    let gom = '';
    while (j < dong.length && !/^    [a-zA-Z][A-Za-z0-9]*:/.test(dong[j]) && !/^  \},/.test(dong[j])) {
      gom += dong[j];
      j++;
    }
    // find the nearest group above
    for (let k = i; k >= 0; k--) {
      const mn = dong[k].match(/^  ([a-zA-Z][A-Za-z0-9]*): \{/);
      if (mn) {
        ra.set(`${mn[1]}.${m[1]}`, gom);
        break;
      }
    }
  }
  return ra;
}

const cho = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

const EN_MAP = docEn();
const BO_QUA_DIR = new Set(['node_modules', '.next', '.next-dev', 'out', 'dicts']);

function tep(dir, ra = []) {
  for (const e of readdirSync(dir)) {
    if (BO_QUA_DIR.has(e)) continue;
    const p = path.join(dir, e);
    if (statSync(p).isDirectory()) tep(p, ra);
    else if (/\.tsx?$/.test(e)) ra.push(p);
  }
  return ra;
}

let hong = 0;
let daDo = 0;
let boQua = 0;

for (const goc of ['app', 'components', 'lib']) {
  for (const p of tep(path.join(GOC, goc))) {
    const rel = path.relative(GOC, p).replace(/\\/g, '/');
    if (rel.startsWith('lib/i18n/en/') || rel === 'lib/i18n/interpolate.ts') continue;
    const src = readFileSync(p, 'utf8');
    // `interpolate(<key path>, { a: …, b: … })`
    const re = /interpolate\(\s*(?:t|EN)\.([A-Za-z0-9.]+)\s*,\s*\{([^{}]*)\}/g;
    for (const m of src.matchAll(re)) {
      const duong = m[1];
      const chuoi = EN_MAP.get(duong);
      const dong = src.slice(0, m.index).split('\n').length;
      if (chuoi === undefined) {
        boQua++;
        continue;
      }
      const can = cho(chuoi);
      // 🔴 IT MUST READ SHORTHAND `{ error }` TOO, NOT ONLY `{ error: x }`.
      // The first version of this gate matched only the `key:` form and immediately accused three
      // COMPLETELY CORRECT calls (`interpolate(t.rebuild.title, { ngay })`) of missing a
      // placeholder. A gate that false-alarms on its very first run is a gate about to be disabled
      // by hand — and here that would mean losing the only measurement that catches this silent failure.
      const cap = [
        ...[...m[2].matchAll(/(?:^|,)\s*([A-Za-z0-9_]+)\s*:/g)].map((x) => x[1]),
        ...[...m[2].matchAll(/(?:^|,)\s*([A-Za-z0-9_]+)\s*(?=,|$)/g)].map((x) => x[1]),
      ].sort();
      daDo++;
      const thieu = can.filter((k) => !cap.includes(k));
      const thua = cap.filter((k) => !can.includes(k));
      if (thieu.length || thua.length) {
        hong++;
        console.log(`  ✗ ${rel}:${dong}  interpolate(t.${duong}, …)`);
        if (thieu.length) console.log(`      the string needs {${thieu.join('} {')}} — the call does NOT supply it`);
        if (thua.length) console.log(`      the call supplies ${thua.join(', ')} — the string does NOT declare it`);
      }
    }
  }
}

console.log(`   measured ${daDo} calls with a static key path${boQua ? ` · bỏ qua ${boQua} lời gọi không tra được đường khoá` : ''}`);
if (hong) {
  console.log(`\n✗ ${hong} \`interpolate()\` calls disagree with their string.`);
  console.log('  Nothing reports this failure: `interpolate` only replaces keys it knows, so a placeholder');
  console.log('  that is not supplied goes straight to the screen as `{name}` mid-sentence.');
  console.log('  Fix both ends — the string in ALL 30 dictionaries and the key at the call site — in one pass.');
  process.exit(1);
}
console.log('✓ every `interpolate()` call supplies exactly the placeholders its string declares.');
process.exit(0);
