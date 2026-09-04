#!/usr/bin/env node
/**
 * check-logical-css.mjs — no physical left/right utilities in the component tree.
 *
 * Exit 0 = clean. Exit 1 = a physical-direction class is back.
 *
 * ═══ WHY THIS GATE EXISTS ═══
 * Three of the thirty languages are right-to-left (`ar`, `fa`, `ur`), and the project
 * has been telling itself since 2026-08-28 that this costs nothing — the handoff note read, in
 * translation: *"the component set already uses logical properties (`ms-`, `end-`, `text-start`),
 * so not one line needs changing for writing direction. Keep it that way."*
 *
 * That claim was false when it was written, and nothing could tell. The i18n audit of
 * 2026-09-03 measured the RUNNING site in Persian and Arabic and found ELEVEN physical
 * classes, three of them plainly wrong on screen:
 *
 *   · `border-l-2 pl-4` on the home page self-disclosure block — measured
 *     `border-left: 2px; padding-left: 16px; padding-right: 0` inside `dir: rtl`, so
 *     the accent bar sat on the far side from where the text begins.
 *   · `text-left` on 5/5 table headers — left-aligned headings in a right-to-left table.
 *   · `pl-5` on four `<ul>` in `/re-genesis/` — measured `padding-left: 20px;
 *     padding-right: 0`, so the bullets lost their gutter and the text gained a stray
 *     20px on the wrong side. That is the page telling a stranger their assets are
 *     about to be erased.
 *
 * ═══ WHY IT COULD NOT BE CAUGHT BEFORE ═══
 * Every existing gate is blind to it BY CONSTRUCTION, and each for its own reason:
 *   · `tsc` — a class name is a string.
 *   · `i18n-shape` — compares the 30 dictionaries against each other; it knows nothing
 *     about layout.
 *   · `check-a11y` (axe under jsdom) — jsdom has no layout engine, so no rule that
 *     depends on computed position can fire.
 *   · a human looking at the site — only if they read one of the three RTL languages.
 * Direction is a property nothing in the pipeline was measuring. This gate measures it.
 *
 * ⚠️ WHAT IT DOES NOT CLAIM. Passing means no PHYSICAL class is present. It does not
 * mean the RTL layout is correct — a logical class can still be pointed the wrong way,
 * and only a person reading the language can tell. This closes one mechanical hole; it
 * does not replace reading the page.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const QUET = ['app', 'components'];

/**
 * Every physical class comes with its logical replacement — the message must SAY what to change
 * it to. A gate that only shouts "wrong" leaves its reader to go and look up the Tailwind docs,
 * and by the third time they switch the gate off.
 */
const LUAT = [
  [/\btext-left\b/g, 'text-start'],
  [/\btext-right\b/g, 'text-end'],
  [/\bml-([\w.[\]/-]+)/g, 'ms-$1'],
  [/\bmr-([\w.[\]/-]+)/g, 'me-$1'],
  [/\bpl-([\w.[\]/-]+)/g, 'ps-$1'],
  [/\bpr-([\w.[\]/-]+)/g, 'pe-$1'],
  [/\bborder-l(-[\w.[\]/-]+)?\b/g, 'border-s$1'],
  [/\bborder-r(-[\w.[\]/-]+)?\b/g, 'border-e$1'],
  [/\brounded-l(-[\w.[\]/-]+)?\b/g, 'rounded-s$1'],
  [/\brounded-r(-[\w.[\]/-]+)?\b/g, 'rounded-e$1'],
  [/\bleft-([\w.[\]/-]+)/g, 'start-$1'],
  [/\bright-([\w.[\]/-]+)/g, 'end-$1'],
];

/**
 * Exemptions — a REASON is required, and the reason must be "this place really is physical", not
 * "this place is annoying to fix". Empty is the correct state; every line added here is a place
 * RTL will be wrong and we accept it knowingly.
 */
const MIEN_TRU = [];

function tepTsx(dir, ra = []) {
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e);
    if (statSync(p).isDirectory()) tepTsx(p, ra);
    else if (e.endsWith('.tsx')) ra.push(p);
  }
  return ra;
}

let hong = 0;
for (const goc of QUET) {
  for (const p of tepTsx(path.join(GOC, goc))) {
    const rel = path.relative(GOC, p).replace(/\\/g, '/');
    if (MIEN_TRU.some((m) => m.tep === rel)) continue;
    const src = readFileSync(p, 'utf8');
    // 🔴 READ ONLY INSIDE `className` — do not scan the whole file.
    // Scanning the whole file makes every comment mentioning `pl-5` (including the comment
    // EXPLAINING this rule) a violation, and a gate that complains about its own documentation is
    // a gate about to be deleted. The string inside `className` is what reaches the browser.
    for (const m of src.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\}|\{'([^']*)'\})/g)) {
      const lop = m[1] ?? m[2] ?? m[3] ?? '';
      const dong = src.slice(0, m.index).split('\n').length;
      for (const [re, thay] of LUAT) {
        for (const v of lop.matchAll(re)) {
          hong++;
          console.log(`  ✗ ${rel}:${dong}  \`${v[0]}\`  →  \`${v[0].replace(re, thay)}\``);
        }
      }
    }
  }
}

if (hong) {
  console.log(`\n✗ ${hong} PHYSICAL-direction classes — they are wrong in 3 of 30 languages (ar · fa · ur).`);
  console.log('  Logical classes (`ps-`, `me-`, `border-s`, `text-start`, `start-`) flip with `dir` by themselves,');
  console.log('  so they are correct in BOTH directions without a single RTL-specific rule.');
  console.log('  Genuinely need a physical direction? Add it to `MIEN_TRU` WITH A REASON in this file.');
  process.exit(1);
}

console.log('✓ no physical-direction CSS class — the layout flips correctly in all 3 RTL languages.');
console.log('  (This measures only the ABSENCE of physical classes. Whether the RTL layout reads well');
console.log('   needs someone who reads that language — see the comment at the top of this file.)');
process.exit(0);
