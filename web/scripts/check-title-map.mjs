#!/usr/bin/env node
/**
 * check-title-map.mjs — bảng tiêu đề phía client phải phủ ĐÚNG các trang có thật.
 *
 * Ra 0 = khớp hai chiều. Ra 1 = lệch. Ra 2 = không đo được.
 *
 * ═══ VÌ SAO CỔNG NÀY TỒN TẠI ═══
 * `metadata` của Next sinh lúc build nên `<title>` vĩnh viễn tiếng Anh cho cả 30
 * ngôn ngữ. `lib/tieuDe.ts` vá điều đó bằng MỘT bảng `đường dẫn → khoá từ điển`, đặt
 * ở layout. Gom về một chỗ là để không phải nhớ tám lời gọi — nhưng nó đổi lấy một
 * điểm hỏng mới: **thêm trang mà quên bảng thì trang đó rơi vào nhánh 404**, và tab
 * mang tiêu đề *"This page does not exist"* trong khi nội dung hiện ra hoàn toàn
 * bình thường. Không lỗi, không cảnh báo, và người duy nhất thấy là người dùng.
 *
 * Cùng họ với `check-routes.mjs` (trang mới mà quên Caddyfile) — và với `/re-genesis/`
 * đã sinh ra ở commit `0d65eca` mà không ai thêm vào danh sách, nên dải banner dẫn
 * thẳng vào 404 suốt nhiều ngày.
 *
 * ═══ ĐO HAI CHIỀU, KHÔNG MỘT CHIỀU ═══
 *   • trang có trong `out/` mà THIẾU trong bảng ⇒ tab mang tiêu đề 404
 *   • khoá có trong bảng mà KHÔNG có trang ⇒ bảng nói về một trang không tồn tại,
 *     tức nó đã lạc hậu và không ai biết
 * Một cổng chỉ đo chiều thứ nhất sẽ xanh mãi sau khi ai đó xoá một trang.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RA = path.join(GOC, 'out');
const BANG = path.join(GOC, 'lib', 'tieuDe.ts');

if (!existsSync(RA)) {
  console.log('   ✗ chưa có out/ — chạy `pnpm build` trước');
  process.exit(2);
}
if (!existsSync(BANG)) {
  console.log('   ✗ không thấy lib/tieuDe.ts');
  process.exit(2);
}

// ── Khoá khai trong bảng ────────────────────────────────────────────────────
const src = readFileSync(BANG, 'utf8');
// 🔴 `[\s\S]*?` chứ KHÔNG `[^=]*`. Khai báo mang chú thích kiểu
// `Record<string, (t: Tu) => string | null>`, và `[^=]*` dừng ngay ở dấu `=` bên
// trong `=>` ⇒ không bao giờ khớp. `=\s*\{` thì không nhầm với `=>` được (sau `=` là
// `>`, không phải `{`). Bản đầu của cổng này dính đúng thế và trả mã 2 — nó từ chối
// đi qua thay vì xanh giả, và đó là lý do nhánh "không đo được" phải tồn tại.
const khoi = src.match(/TIEU_DE_THEO_DUONG[\s\S]*?=\s*\{([\s\S]*?)\n\};/);
if (!khoi) {
  console.log('   ✗ không tách được khối `TIEU_DE_THEO_DUONG` trong lib/tieuDe.ts');
  console.log('     Nếu vừa đổi cấu trúc, sửa bộ tách ở đây — ĐỪNG gỡ cổng.');
  process.exit(2);
}
const khaiBang = [...khoi[1].matchAll(/'([^']+)':/g)].map((m) => m[1]).sort();

// ── Trang có thật trong out/ ────────────────────────────────────────────────
/**
 * 🔴 `404/index.html` và `404.html` KHÔNG tính là trang.
 * Trang 404 CỐ Ý không nằm trong bảng: nó là nhánh rơi về cho mọi đường lạ, nên khai
 * nó vào bảng vừa vô nghĩa vừa che mất đúng thứ cổng này muốn bắt.
 */
const BO_QUA = new Set(['/404/', '/404.html']);
function timTrang(dir, tien = '/', ra = []) {
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e);
    if (e === '_next' || e === 'brand' || e === 'chains') continue;
    if (statSync(p).isDirectory()) timTrang(p, `${tien}${e}/`, ra);
    else if (e === 'index.html') ra.push(tien);
  }
  return ra;
}
const trangThat = timTrang(RA).filter((d) => !BO_QUA.has(d)).sort();

const thieu = trangThat.filter((d) => !khaiBang.includes(d));
const thua = khaiBang.filter((d) => !trangThat.includes(d));

console.log(`   ${trangThat.length} trang trong out/ · ${khaiBang.length} khoá trong bảng`);
if (thieu.length) {
  console.log(`   ✗ THIẾU trong bảng: ${thieu.join('  ')}`);
  console.log('     ⇒ những trang này sẽ mang tiêu đề tab của trang 404.');
}
if (thua.length) {
  console.log(`   ✗ THỪA trong bảng (không có trang): ${thua.join('  ')}`);
  console.log('     ⇒ bảng đang nói về một trang không tồn tại.');
}
if (thieu.length || thua.length) {
  console.log('\n✗ Bảng tiêu đề lệch với các trang có thật. Sửa `TIEU_DE_THEO_DUONG`');
  console.log('  trong lib/tieuDe.ts — và nhớ khoá `tieuDe` phải TRÙNG với thứ');
  console.log('  `page.tsx` truyền cho `trangMeta()`, nếu không tiêu đề sẽ nhảy một');
  console.log('  nhịp lúc hydrate (HTML một câu, JS thay bằng câu khác).');
  process.exit(1);
}

console.log('✓ bảng tiêu đề phía client phủ đúng các trang có thật (khớp hai chiều).');
process.exit(0);
