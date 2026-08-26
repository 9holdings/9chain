/**
 * check-budget.mjs — trần dung lượng JS **cho MỘT trang, đo sau khi nén**.
 *
 * Vì sao có: đây là trang testnet, người xem có thể ở đường truyền yếu, và cái giá
 * của việc thêm một bước build (M10.1) là bundle có thể phình lên mà không ai để ý
 * — bốn trang HTML viết tay trước đó **không có JS nào cả**. Một con số có trần thì
 * mỗi lần vượt là một quyết định có ý thức; không có trần thì nó chỉ tăng.
 *
 * ═══ HAI PHÉP ĐO SAI ĐÃ THỬ VÀ ĐÃ BỎ ═══
 * 1. **Cộng mọi file trong `chunks/`** — ra 800 KB, nhưng đó là tổng của MỌI trang
 *    cộng lại; không người dùng nào tải chừng đó. Một con số không ai phải trả thì
 *    không phải là ngân sách.
 * 2. **Đo dung lượng chưa nén** — Caddy trả JS đã nén, nên con số chưa nén cao gấp
 *    ~5 lần thứ thật sự đi qua đường truyền. Ngân sách đặt trên nó hoặc là quá chặt
 *    (chặn oan) hoặc là quá lỏng (không bao giờ kêu).
 *
 * Phép đo đúng: với TỪNG trang HTML, lấy đúng các file JS mà trang đó tham chiếu,
 * nén gzip, cộng lại. Đó là thứ một người mở trang đó thật sự phải tải.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TRAN_KB = Number(process.env.A1_TRAN_JS_KB || 160);
const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RA = path.join(GOC, 'out');

if (!existsSync(RA)) {
  console.error('✗ chưa có thư mục out/ — chạy `pnpm build` trước');
  process.exit(1);
}

function timHtml(dir, ra = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) timHtml(p, ra);
    else if (e.name.endsWith('.html')) ra.push(p);
  }
  return ra;
}

const nenCache = new Map();
function kbNen(duongTuongDoi) {
  if (nenCache.has(duongTuongDoi)) return nenCache.get(duongTuongDoi);
  const p = path.join(RA, duongTuongDoi.replace(/^\//, ''));
  const kb = existsSync(p) ? gzipSync(readFileSync(p)).length / 1024 : 0;
  nenCache.set(duongTuongDoi, kb);
  return kb;
}

let teNhat = { ten: '', kb: 0 };
for (const f of timHtml(RA)) {
  const ten = path.relative(RA, f).replace(/\\/g, '/');
  const html = readFileSync(f, 'utf8');
  // Bắt cả `<script src>` lẫn đường dẫn nằm trong payload RSC — Next nhắc tới chunk
  // ở cả hai chỗ, và bỏ sót một chỗ là báo cáo thiếu đúng phần nặng nhất.
  const duong = new Set([...html.matchAll(/\/_next\/static\/[^"'\\ ]+?\.js/g)].map((m) => m[0]));
  const kb = [...duong].reduce((t, d) => t + kbNen(d), 0);
  console.log(`   ${kb.toFixed(1).padStart(7)} KB gz · ${String(duong.size).padStart(2)} tệp  ${ten}`);
  if (kb > teNhat.kb) teNhat = { ten, kb };
}

const vuot = teNhat.kb > TRAN_KB;
console.log(
  `${vuot ? '✗' : '✓'} trang nặng nhất: ${teNhat.ten} — ${teNhat.kb.toFixed(1)} KB gzip / trần ${TRAN_KB} KB`,
);
if (vuot) {
  console.log('  Vượt trần là một QUYẾT ĐỊNH, không phải một lỗi cần né: hoặc bỏ bớt,');
  console.log('  hoặc nâng A1_TRAN_JS_KB và ghi lý do vào DECISIONS.');
}
process.exit(vuot ? 1 : 0);
