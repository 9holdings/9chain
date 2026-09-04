/**
 * check-a11y.mjs — runs axe-core against **the REAL exported HTML**, not against a fake render.
 *
 * ═══ WHY IT IS MEASURED HERE AND NOT IN VITEST ═══
 * The usual approach is to render a component in jsdom and inspect that. But this project has
 * paid repeatedly for accepting what it built instead of what is actually served ("copied ≠
 * running" — HANDOFF records it at least four times). What Caddy serves is `out/` HTML. Measuring
 * those exact files also catches a fault introduced during the build (a component tree-shaken
 * away, an attribute dropped in static rendering); re-rendering in a test does not.
 *
 * ⚠️ A LIMIT THAT MUST BE STATED: this is a STATIC snapshot, taken before React hydrates. It
 * catches structure, labels, contrast and heading hierarchy — but NOT any state that only
 * appears after interaction (an open drawer, a field's error message). Those must be inspected
 * by hand on the public site; do not read "axe is clean" as "accessibility is done".
 *
 * Runs automatically in `postbuild`.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import axe from 'axe-core';

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RA = path.join(GOC, 'out');

if (!existsSync(RA)) {
  console.error('✗ no out/ directory yet — run `pnpm build` first');
  process.exit(1);
}

function timHtml(dir) {
  const ra = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) ra.push(...timHtml(p));
    // Skip Next's pre-built error pages: they are not on any user path and they contain empty
    // shells, so they only add noise.
    else if (e.name.endsWith('.html') && !/^(404|_error)\.html$/.test(e.name)) ra.push(p);
  }
  return ra;
}

const files = timHtml(RA);
if (!files.length) {
  console.error('✗ out/ has no .html file at all — did the build fail?');
  process.exit(1);
}

let tongLoi = 0;
for (const f of files) {
  const ten = path.relative(RA, f).replace(/\\/g, '/');
  // `runScripts: 'outside-only'` is REQUIRED for `window.eval` to actually run in the page
  // context. By default jsdom runs no scripts at all, and then `window.eval(axe.source)`
  // silently does nothing — `window.axe` is `undefined` and the error surfaces down at the
  // `.run()` call, reading as "axe is broken" rather than "a flag is missing".
  // Deliberately NOT `'dangerously'`: the page's own scripts must not run here, we are only
  // measuring a static snapshot.
  const dom = new JSDOM(readFileSync(f, 'utf8'), {
    pretendToBeVisual: true,
    runScripts: 'outside-only',
  });
  const { window } = dom;

  window.eval(axe.source);

  const kq = await window.axe.run(window.document, {
    // `color-contrast` needs real layout to compute inherited background colours — jsdom has no
    // layout engine, so it produces both false positives and false negatives. This project's
    // contrast is guaranteed at the TOKEN layer (9Scan measured it and recorded the reason for
    // each value), so disabling it here is more honest than reporting a meaningless number.
    rules: { 'color-contrast': { enabled: false } },
    resultTypes: ['violations'],
  });

  if (kq.violations.length) {
    tongLoi += kq.violations.length;
    console.log(`\n✗ ${ten}`);
    for (const v of kq.violations) {
      console.log(`   [${v.impact}] ${v.id} — ${v.help}`);
      for (const n of v.nodes.slice(0, 3)) console.log(`      ${n.html.slice(0, 120)}`);
    }
  } else {
    // 🔴 PRINT THE NUMBER OF CONTROLS ACTUALLY INSPECTED, not just a ✓.
    // The two pages behind the wallet gate (`create-chain`, `my-chains`) export HTML containing
    // only the site chrome: 3 buttons (theme toggle, open menu, "Connect wallet"), **0 inputs,
    // 0 selects**. Which means axe-core has NEVER inspected the chain-name field, the chain-type
    // `<select>`, the review screen, the progress bar — or the "retype the chain name" field on
    // the revoke screen, the only thing standing between one click and killing a chain.
    // Printing the number makes that gap surface on every run, instead of hiding behind a ✓.
    const d = window.document;
    const dem = ['button', 'input', 'select', 'a[href]', '[role]']
      .map((k) => `${k}=${d.querySelectorAll(k).length}`)
      .join(' ');
    console.log(`  ✓ ${ten}  · ${dem}`);
  }
  window.close();
}

console.log(
  tongLoi
    ? `\n✗ axe-core: ${tongLoi} violations across ${files.length} pages`
    : `\n✓ axe-core clean on ${files.length} pages (color-contrast disabled — see the comment at the top)`,
);
process.exit(tongLoi ? 1 : 0);
