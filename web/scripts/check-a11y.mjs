/**
 * check-a11y.mjs — chạy axe-core trên **HTML THẬT đã xuất ra**, không trên bản render giả.
 *
 * ═══ VÌ SAO ĐO Ở ĐÂY CHỨ KHÔNG PHẢI TRONG VITEST ═══
 * Cách thông thường là render component trong jsdom rồi soi. Nhưng dự án này đã trả
 * giá nhiều lần cho việc nghiệm thu thứ mình dựng thay vì thứ thật sự được phục vụ
 * ("đã chép ≠ đang chạy" — HANDOFF ghi ít nhất bốn lần). Thứ Caddy phục vụ là
 * `out/**.html`. Đo đúng file đó thì một lỗi ở khâu build (component bị cây rung
 * loại mất, thuộc tính rơi lúc render tĩnh) cũng bị bắt, còn render lại trong test
 * thì không.
 *
 * ⚠️ GIỚI HẠN PHẢI NÓI RÕ: đây là ảnh chụp TĨNH, trước khi React hydrate. Nó bắt
 * được cấu trúc, nhãn, tương phản, thứ bậc tiêu đề — nhưng KHÔNG bắt được trạng
 * thái chỉ xuất hiện sau tương tác (ngăn kéo mở, thông báo lỗi của ô nhập). Những
 * thứ đó phải soi bằng tay trên trang công khai; đừng đọc "axe sạch" thành "a11y
 * xong".
 *
 * Chạy tự động ở `postbuild`.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import axe from 'axe-core';

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RA = path.join(GOC, 'out');

if (!existsSync(RA)) {
  console.error('✗ chưa có thư mục out/ — chạy `pnpm build` trước');
  process.exit(1);
}

function timHtml(dir) {
  const ra = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) ra.push(...timHtml(p));
    // Bỏ trang lỗi dựng sẵn của Next: chúng không nằm trong đường đi của người dùng
    // và chứa khung rỗng, nên chỉ tạo nhiễu.
    else if (e.name.endsWith('.html') && !/^(404|_error)\.html$/.test(e.name)) ra.push(p);
  }
  return ra;
}

const files = timHtml(RA);
if (!files.length) {
  console.error('✗ out/ không có file .html nào — build hỏng?');
  process.exit(1);
}

let tongLoi = 0;
for (const f of files) {
  const ten = path.relative(RA, f).replace(/\\/g, '/');
  // `runScripts: 'outside-only'` là BẮT BUỘC để `window.eval` thật sự chạy trong
  // ngữ cảnh của trang. Mặc định jsdom không cho chạy script nào, và khi đó
  // `window.eval(axe.source)` im lặng không làm gì — `window.axe` là `undefined` và
  // lỗi hiện ra ở tận dòng gọi `.run()`, đọc như axe hỏng chứ không như thiếu cờ.
  // Cố ý KHÔNG bật `'dangerously'`: script của chính trang không được chạy ở đây,
  // ta chỉ đo ảnh chụp tĩnh.
  const dom = new JSDOM(readFileSync(f, 'utf8'), {
    pretendToBeVisual: true,
    runScripts: 'outside-only',
  });
  const { window } = dom;

  window.eval(axe.source);

  const kq = await window.axe.run(window.document, {
    // `color-contrast` cần layout thật để tính màu nền kế thừa — jsdom không có
    // layout engine nên nó cho ra cả dương tính giả lẫn âm tính giả. Tương phản của
    // dự án này được bảo đảm ở tầng TOKEN (9Scan đã đo và ghi lý do từng giá trị),
    // nên tắt ở đây là trung thực hơn là báo cáo một con số không có nghĩa.
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
    console.log(`  ✓ ${ten}`);
  }
  window.close();
}

console.log(
  tongLoi
    ? `\n✗ axe-core: ${tongLoi} vi phạm trên ${files.length} trang`
    : `\n✓ axe-core sạch trên ${files.length} trang (tắt color-contrast — xem chú thích đầu file)`,
);
process.exit(tongLoi ? 1 : 0);
