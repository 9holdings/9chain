/**
 * check-links.mjs — every internal link on the deployed site must be alive.
 *
 * ═══ WHY THIS NEEDS ITS OWN MEASUREMENT ═══
 * This site points at three kinds of destination, and Next only checks ONE of them:
 *   1. routes of this export (`/faucet/`, `/create-chain/`) — the build goes red if one is missing;
 *   2. paths served by **Caddy** from another service (`/console/`, `/chains/`) — Next does not
 *      know they exist, so a typo is a **silent 404**;
 *   3. external domains (9Scan) — a change on their side is invisible here.
 * Kind (2) is the dangerous one: in the code it looks exactly like kind (1).
 *
 * Run AFTER deploying, measured through the public domain:
 *   node web/scripts/check-links.mjs [https://a1.9chain.org]
 *
 * 🔴 THE `/moi/` FALLBACK ONCE TURNED THIS INTO A USELESS TEST — 2026-08-27.
 *
 * The old version: try `/x/`, and on failure try `/moi/x/`; if either passed it **printed the
 * canonical path** with a ✓. That fallback dated from when the root `/` was still Blockscout and
 * the site lived under `/moi/`. M10.3 moved the site to the root, but the fallback stayed — and
 * `/moi/*` still serves the ENTIRE static site, so it **always passes**. The consequence: a page
 * dead at its canonical path was still reported ✓ with the correct `<title>`, because that title
 * came from the alias.
 *
 * The real cost: `/re-genesis/` was **404 on the public network** (falling through to Blockscout,
 * trailing slash stripped, then 404) from the day it was created, while every run of
 * `web-deploy.sh` printed `✓ /re-genesis/ 200`. The G-day warning strip was on EVERY page and
 * pointed at exactly that path. Root cause at `Caddyfile:328` — the `@trangmoi` list had no
 * `/re-genesis/*`.
 *
 * Now: **the canonical path is what is graded.** The alias is used only for DIAGNOSIS — alive at
 * the alias but dead at the canonical is its OWN kind of failure, and it is named as such,
 * because it points straight at a route missing from the Caddyfile.
 * Set `A1_TIEN_TO=` (empty) to switch that diagnosis off entirely.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RA = path.join(GOC, 'out');
const NEN = (process.argv[2] || 'https://a1.9chain.org').replace(/\/$/, '');
const TIEN_TO = process.env.A1_TIEN_TO ?? '/moi';

if (!existsSync(RA)) {
  console.error('✗ no out/ yet — run `pnpm build` first');
  process.exit(1);
}

function quet(dir, ra = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) quet(p, ra);
    else if (e.name.endsWith('.html')) ra.push(p);
  }
  return ra;
}

const dich = new Map(); // path -> [source pages]
for (const f of quet(RA)) {
  const tu = path.relative(RA, f).replace(/\\/g, '/');
  for (const m of readFileSync(f, 'utf8').matchAll(/href="(\/[^"#?]*)"/g)) {
    const d = m[1];
    // Skip static assets: `web-deploy.sh` already checks those with one real chunk.
    if (d.startsWith('/_next/') || /\.(css|js|png|svg|ico|webmanifest)$/.test(d)) continue;
    if (!dich.has(d)) dich.set(d, []);
    dich.get(d).push(tu);
  }
}

/**
 * 🔴 MEASURE THE CONTENT, NOT THE STATUS CODE.
 *
 * The root `/` is Blockscout, and it is an SPA: every unknown path returns **HTTP 200** with an
 * empty shell, not a 404. So a link check that only looks at the code comes back **all green**
 * while users click through to a blank page — that exact false green happened on 2026-08-25 with
 * `/tc-a/` and `/create-chain/`.
 *
 * The "this is the right page" signal: a NON-EMPTY `<title>`. Our pages always have one;
 * Blockscout's empty shell does not.
 */
async function thu(url) {
  try {
    const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000) });
    if (r.status < 200 || r.status >= 400) return { ma: r.status, ok: false };
    const html = await r.text();
    const tieuDe = /<title>([^<]*)<\/title>/.exec(html)?.[1]?.trim() ?? '';
    return { ma: r.status, ok: tieuDe.length > 0, tieuDe };
  } catch {
    return { ma: 0, ok: false };
  }
}

let hong = 0;
let chiSongOAlias = 0;
for (const [d, nguon] of [...dich].sort()) {
  const goc = await thu(`${NEN}${d}`);
  const tuDau = [...new Set(nguon)].join(', ');

  if (goc.ok) {
    console.log(`  ✓ ${d.padEnd(18)} ${goc.ma}  · ${goc.tieuDe.slice(0, 46)}`);
    continue;
  }

  // The canonical path is dead. Ask the alias ONE question: is this "not deployed yet" or
  // "route missing"? Those are fixed in two different places, so they must be told apart —
  // but both are FAILURES; a live alias does not rescue the canonical path.
  const alias = TIEN_TO && !d.startsWith(TIEN_TO) ? await thu(`${NEN}${TIEN_TO}${d}`) : null;
  hong++;
  const maGoc = `${goc.ma}${goc.ma === 200 ? '(empty shell)' : ''}`;
  if (alias?.ok) {
    chiSongOAlias++;
    console.log(`  ✗ ${d.padEnd(18)} ${maGoc}  · ALIVE at ${TIEN_TO}${d} — MISSING ROUTE, not a missing file`);
  } else {
    console.log(`  ✗ ${d.padEnd(18)} ${maGoc}  · linked from: ${tuDau}`);
  }
}

if (chiSongOAlias) {
  console.log(
    `\n🔴 ${chiSongOAlias} paths are alive at "${TIEN_TO}" but dead at the canonical path.\n` +
      `   The files ARE on the server — what is missing is the route line. See \`@trangmoi\` in the Caddyfile:\n` +
      `   that list has to grow with every new page, and it is exactly what gets forgotten.`,
  );
}
console.log(hong ? `\n✗ ${hong}/${dich.size} links dead` : `\n✓ ${dich.size}/${dich.size} links alive`);

/* ═══════════════════════════════════════════════════════════════════════════
   THE G-DAY GATE — only enabled with `A1_SAU_NGAY_G=1` (Đ1-12, 2026-08-27)

   🔴 WHY IT IS NEEDED DESPITE THE RUNBOOK: the current measurement only requires a non-empty
   `<title>`. After `01/09`, the title `A1 is being rebuilt on 2026-09-01` is **still non-empty**
   — so it goes green on a page speaking in the FUTURE TENSE about something that HAS ALREADY
   HAPPENED. A false green at the most expensive possible moment, and nobody notices because the
   gate's numbers still look fine.

   This gate measures CONTENT, and deliberately measures TWO different pages: the banner strip
   lives in the root layout, so "this page is right, that page still has the old copy" is the
   signature of an incomplete `web/out` copy — exactly the bind-mount inode trap that bit on
   `25/08`. Measuring one page cannot see it.

   Enabled by an environment variable rather than by default: today it MUST be red (the page is
   correctly in the future tense), and a gate that is red by default for 5 days gets ignored.
   Run it today to confirm it knows how to be red:
       A1_SAU_NGAY_G=1 node scripts/check-links.mjs
   ═══════════════════════════════════════════════════════════════════════════ */
let hongNgayG = 0;
if (process.env.A1_SAU_NGAY_G === '1') {
  console.log('\n── POST-G-DAY GATE (A1_SAU_NGAY_G=1) ──');
  const doNoiDung = async (duong, chuoi, phaiCo) => {
    let html = '';
    try {
      const r = await fetch(`${NEN}${duong}`, { redirect: 'follow', signal: AbortSignal.timeout(20000) });
      html = await r.text();
    } catch (e) {
      console.log(`  ✗ ${duong} — could not load: ${e.message}`);
      hongNgayG++;
      return;
    }
    const co = html.includes(chuoi);
    if (co === phaiCo) {
      console.log(`  ✓ ${duong.padEnd(16)} ${phaiCo ? 'HAS' : 'does NOT have'} "${chuoi}"`);
    } else {
      console.log(
        `  ✗ ${duong.padEnd(16)} ${phaiCo ? 'MISSING' : 'STILL HAS'} "${chuoi}"` +
          (phaiCo ? ' — the page has not been switched to the announcement' : ' — the old banner strip has not been removed'),
      );
      hongNgayG++;
    }
  };
  /* 🔴 THE PHRASES ARE READ OUT OF `en.ts`, NOT HARD-CODED — fixed 2026-09-04.
     Until today this gate looked for the Vietnamese strings 'đã sinh lại' and 'sẽ bị xoá'. The
     site's default language became English on 2026-08-27, and `output: 'export'` builds every
     page's HTML from `EN` — so those two phrases could never appear again in the deployed HTML.
     The consequence ran in both directions at once:
       · the "must contain" check was permanently red, for a reason that had nothing to do with
         whether the page had actually been switched;
       · the "must NOT contain" check was permanently GREEN — a false green that would have
         stayed green even with the old banner still on every page.
     Reading the phrases from the dictionary means the gate cannot drift from the words, and a
     reworded announcement updates the measurement instead of silently disabling it. */
  // English is a folder since 2026-09-05; the files keep the old text shape, so their
  // concatenation IS the old `en.ts` as far as the regex below is concerned.
  const EN_DIR = path.join(GOC, 'lib', 'i18n', 'en');
  const EN_SRC = readdirSync(EN_DIR)
    .filter((f) => f.endsWith('.ts'))
    .sort()
    .map((f) => readFileSync(path.join(EN_DIR, f), 'utf8'))
    .join('\n');
  const khoa = (nhom, ten) => {
    const m = new RegExp(`^  ${nhom}: \\{[\\s\\S]*?^    ${ten}: '((?:[^'\\\\]|\\\\.)*)'`, 'm').exec(EN_SRC);
    return m ? m[1] : null;
  };
  const ngay = khoa('rebuild', 'date');
  const daXong = khoa('rebuildDone', 'title');
  const sapToi = khoa('rebuild', 'title');
  if (!ngay || !daXong || !sapToi) {
    // Refuse to measure rather than measure nothing: a renamed key must not quietly switch this
    // gate off. Same reasoning as the `disclosure` lookup in check-decentralisation-claim.mjs.
    console.log('  ? could not read `rebuild.date` / `rebuild.title` / `rebuildDone.title` in en.ts');
    hongNgayG++;
  } else {
    const cauDaXong = daXong.replace('{date}', ngay);
    const cauSapToi = sapToi.replace('{date}', ngay);
    // The announcement is live: the re-genesis page speaks in the PAST tense…
    await doNoiDung('/re-genesis/', cauDaXong, true);
    // …and on the SAME page the future-tense sentence must be gone — the two are separate
    // measurements because a half-finished switch leaves both present at once.
    await doNoiDung('/re-genesis/', cauSapToi, false);
    // …and THE REVERSE CHECK ON ANOTHER PAGE: the future-tense strip lived in the root layout, so
    // "this page is right, that page still has the old copy" is the signature of an incomplete
    // `web/out` copy — exactly the bind-mount inode trap of 25/08. One page cannot show that.
    await doNoiDung('/faucet/', cauSapToi, false);
  }
  console.log(hongNgayG ? `\n✗ G-day gate: ${hongNgayG} measurements not passing` : '\n✓ G-day gate passes');
}

process.exit(hong || hongNgayG ? 1 : 0);
