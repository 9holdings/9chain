/**
 * kiem-xuat-tinh.mjs — bẫy RIÊNG của `output: 'export'`, thứ build vẫn xanh mà trang chết.
 *
 * Cả hai bẫy dưới đây đều **không làm build đỏ** và **không làm `curl` đỏ** — chúng
 * chỉ hiện ra trong trình duyệt thật, nên nếu không có phép đo tự động thì chúng chỉ
 * bị phát hiện bởi người dùng.
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
   BẪY 1 — <Suspense> thừa làm cả trang TREO Ở KHUNG XƯƠNG VĨNH VIỄN.

   Với `output:'export'`, nếu component bên trong <Suspense> KHÔNG còn đọc
   `useSearchParams()` thì Next vẫn ghi HTML ra là **fallback** kèm marker
   `<template id="B:N">`, và biên đó **không bao giờ được giải** trên trình duyệt:
   `<main>` đứng nguyên ở kích thước khung xương trong khi toàn bộ nội dung nằm im
   trong một `<div hidden>` cuối trang. Trang hiện ra như đang tải mãi mãi.

   Đã cắn thật ở trang chủ explorer (9chain). Cổng kiểm chính là dòng dưới.
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
   BẪY 2 — `next/link` trỏ tới đường dẫn KHÔNG PHẢI route của Next.

   `/console/`, `/chains/`, `/dashboard/` chỉ tồn tại nhờ Caddy proxy sang dịch vụ
   khác — chúng KHÔNG có trong bản export. Bấm một `<Link>` tới đó thì router đi
   lấy payload RSC ở `<đường dẫn>/index.txt`; file đó không tồn tại, edge trả về
   trang khác, và người dùng rơi vào chỗ lạ. `prefetch={false}` KHÔNG cứu được,
   `router.push()` dính y hệt.
   ⇒ Với mọi đường dẫn do EDGE phục vụ, phải dùng thẻ `<a>` thật.
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
