#!/usr/bin/env node
/**
 * check-title-map.mjs — bảng tiêu đề phía client phải phủ ĐÚNG các trang có thật.
 *
 * Ra 0 = khớp hai chiều. Ra 1 = lệch. Ra 2 = không đo được.
 *
 * ═══ VÌ SAO CỔNG NÀY TỒN TẠI ═══
 * `metadata` của Next sinh lúc build nên `<title>` vĩnh viễn tiếng Anh cho cả 30
 * ngôn ngữ. `lib/pageTitle.ts` vá điều đó bằng MỘT bảng `đường dẫn → khoá từ điển`, đặt
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
// 🔴 TỆP ĐỔI TÊN `tieuDe.ts` → `pageTitle.ts` (2026-09-03, luật mã tiếng Anh).
// Đường dẫn ở đây ghép bằng HAI đối số (`'lib', 'tieuDe.ts'`) nên bộ đổi tên tự động
// — chỉ khớp dạng `lib/tieuDe.ts` liền một chuỗi — đã bỏ sót nó, trong khi các CHÚ
// THÍCH quanh nó thì đã đổi. Cổng in "không thấy lib/pageTitle.ts" và thoát 2: một
// thông báo đúng về một đường dẫn nó KHÔNG thật sự đang tra. Đó là hình dạng khó lần
// nhất — tài liệu nói một đằng, mã làm một nẻo — và nó chỉ lộ ra vì cổng từ chối
// xanh khi không mở được tệp.
const BANG = path.join(GOC, 'lib', 'pageTitle.ts');

if (!existsSync(RA)) {
  console.log('   ✗ chưa có out/ — chạy `pnpm build` trước');
  process.exit(2);
}
if (!existsSync(BANG)) {
  console.log('   ✗ không thấy lib/pageTitle.ts');
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
  console.log('   ✗ không tách được khối `TIEU_DE_THEO_DUONG` trong lib/pageTitle.ts');
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
    // `chains` ĐÃ RA KHỎI danh sách loại trừ (2026-09-03): `/chains/` nay là một
    // route Next thật, nên nó PHẢI có khoá trong bảng như mọi trang khác.
    if (e === '_next' || e === 'brand') continue;
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
  console.log('  trong lib/pageTitle.ts — và nhớ khoá `tieuDe` phải TRÙNG với thứ');
  console.log('  `page.tsx` truyền cho `trangMeta()`, nếu không tiêu đề sẽ nhảy một');
  console.log('  nhịp lúc hydrate (HTML một câu, JS thay bằng câu khác).');
  process.exit(1);
}

console.log('✓ bảng tiêu đề phía client phủ đúng các trang có thật (khớp hai chiều).');
process.exit(0);
