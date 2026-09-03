/**
 * check-static-export.mjs — traps SPECIFIC to `output: 'export'`, where the build is green and the
 * page is dead.
 *
 * Neither trap below **makes the build red** or **makes `curl` red** — they only appear in a real
 * browser, so without an automatic measurement they are found only by users.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RA = path.join(GOC, 'out');
if (!existsSync(RA)) {
  console.error('✗ chưa có out/ — chạy `pnpm build` trước');
  process.exit(1);
}

function quet(dir, duoi, ra = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) quet(p, duoi, ra);
    else if (e.name.endsWith(duoi)) ra.push(p);
  }
  return ra;
}

let hong = 0;

/* ─────────────────────────────────────────────────────────────────────────────
   TRAP 1 — a stray <Suspense> leaves the whole page STUCK IN ITS SKELETON FOREVER.

   With `output:'export'`, if the component inside <Suspense> no longer reads
   `useSearchParams()`, Next still writes the HTML out as the **fallback** together with a
   `<template id="B:N">` marker, and that boundary is **never resolved** in the browser:
   `<main>` stays at skeleton size while the entire content sits inert in a `<div hidden>` at
   the end of the page. The page looks like it is loading forever.

   This genuinely bit the explorer home page (9chain). The check itself is the line below.
   ───────────────────────────────────────────────────────────────────────────── */
{
  const dinh = [];
  for (const f of quet(RA, '.html')) {
    const noi = readFileSync(f, 'utf8');
    const so = (noi.match(/template id="B:/g) || []).length;
    if (so) dinh.push(`${path.relative(RA, f).replace(/\\/g, '/')} (${so} marker)`);
  }
  if (dinh.length) {
    hong++;
    console.log('✗ có biên <Suspense> KHÔNG BAO GIỜ giải — trang sẽ treo ở khung xương:');
    for (const d of dinh) console.log(`   ${d}`);
    console.log('   Gỡ <Suspense> nếu bên trong không còn đọc useSearchParams().');
  } else {
    console.log('✓ không có biên <Suspense> treo');
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   TRAP 2 — `next/link` pointing at a path that is NOT a Next route.

   `/console/`, `/chains/` and `/dashboard/` exist only because Caddy proxies them to another
   service — they are NOT in this export. Clicking a `<Link>` to one makes the router fetch an
   RSC payload from `<path>/index.txt`; that file does not exist, the edge returns something
   else, and the user lands somewhere strange. `prefetch={false}` does NOT save it, and
   `router.push()` hits it identically.
   ⇒ For every path served by the EDGE, use a real `<a>` tag.
   ───────────────────────────────────────────────────────────────────────────── */
{
  const NGOAI_NEXT = ['/console/', '/chains/', '/dashboard/', '/lite/'];
  const dinh = [];
  for (const f of quet(GOC + '/app', '.tsx').concat(quet(GOC + '/components', '.tsx'))) {
    const noi = readFileSync(f, 'utf8');
    if (!/from ['"]next\/link['"]/.test(noi)) continue;
    for (const d of NGOAI_NEXT) {
      if (new RegExp(`<Link[^>]*href=["']${d}`).test(noi)) {
        dinh.push(`${path.relative(GOC, f).replace(/\\/g, '/')} → ${d}`);
      }
    }
  }
  if (dinh.length) {
    hong++;
    console.log('✗ dùng <Link> cho đường dẫn KHÔNG phải route Next (edge phục vụ):');
    for (const d of dinh) console.log(`   ${d}`);
    console.log('   Đổi sang thẻ <a> thật.');
  } else {
    console.log('✓ mọi đường dẫn do edge phục vụ đều đi bằng thẻ <a>');
  }
}

process.exit(hong ? 1 : 0);
