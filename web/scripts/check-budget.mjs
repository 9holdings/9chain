/**
 * check-budget.mjs — trần dung lượng **lần tải đầu của MỘT trang, đo sau khi nén**.
 *
 * Vì sao có: đây là trang testnet, người xem có thể ở đường truyền yếu, và cái giá
 * của việc thêm một bước build (M10.1) là bundle có thể phình lên mà không ai để ý
 * — bốn trang HTML viết tay trước đó **không có JS nào cả**. Một con số có trần thì
 * mỗi lần vượt là một quyết định có ý thức; không có trần thì nó chỉ tăng.
 *
 * ═══ BỐN PHÉP ĐO SAI ĐÃ THỬ VÀ ĐÃ BỎ ═══
 * 1. **Cộng mọi file trong `chunks/`** — ra 800 KB, nhưng đó là tổng của MỌI trang
 *    cộng lại; không người dùng nào tải chừng đó. Một con số không ai phải trả thì
 *    không phải là ngân sách.
 * 2. **Đo dung lượng chưa nén** — Caddy trả JS đã nén, nên con số chưa nén cao gấp
 *    ~5 lần thứ thật sự đi qua đường truyền. Ngân sách đặt trên nó hoặc là quá chặt
 *    (chặn oan) hoặc là quá lỏng (không bao giờ kêu).
 * 3. 🔴 **Bắt mọi `/_next/static/*.js` bằng regex trên HTML** (bản tới 2026-08-27).
 *    Nó nuốt luôn `polyfills-*.js`, mà thẻ của tệp đó mang **`noModule=""`** — theo
 *    định nghĩa, **mọi trình duyệt hiểu ES module đều BỎ QUA nó**. Đo thật trên
 *    https://a1.9chain.org bằng Chrome (2026-08-27): trong 8 tệp JS mà regex đếm,
 *    trình duyệt chỉ tải **7**; polyfills **không có một request nào**. 38,7 KB =
 *    **25,5% của trần** là dung lượng không ai trả. Nay chỉ đếm script KHÔNG có
 *    `noModule`, và phép đếm đó khớp **đúng 7/7** với danh sách request thật.
 * 4. 🔴 **Chỉ đếm JS** (bản tới 2026-08-27) — trong khi tiêu đề file tự nhận đo
 *    "thứ một người mở trang đó thật sự phải tải". CSS thì **ai cũng tải**, luôn
 *    luôn, và nó là `<link>` chặn render. Bỏ nó ra ngoài là để một khoản chi cố định
 *    nằm ngoài mọi ngân sách. Nay đếm cả HTML + CSS.
 *
 * Phép đo đang dùng: với TỪNG trang HTML, cộng **chính tệp HTML** + **CSS trong
 * `<link rel=stylesheet>`** + **JS trong `<script src>` KHÔNG mang `noModule`**,
 * mỗi thứ nén gzip. Đó là những tệp trình duyệt tải **không điều kiện** khi mở trang.
 *
 * ═══ RANH GIỚI CỦA PHÉP ĐO — ĐỌC TRƯỚC KHI TIN CON SỐ ═══
 *
 * ▸ **Font KHÔNG nằm trong số bị chặn.** Không phải vì nó rẻ, mà vì tải hay không
 *   là **có điều kiện**: `next/font` cắt mỗi bộ chữ thành nhiều tệp theo
 *   `unicode-range`, trình duyệt chỉ lấy tệp nào có ký tự trang thật sự dùng — VÀ
 *   chỉ khi có quy tắc CSS nào đó thật sự áp bộ chữ đó lên một phần tử. Vế thứ hai
 *   cần chạy cả tầng cascade mới biết, mà script này chỉ đọc tệp tĩnh.
 *   Nên font được in ra như một **trần trên chẩn đoán**, không dùng để chặn.
 *
 *   🔴 ĐO THẬT 2026-08-27 trên site đang chạy — **con số thật là 0 KB, không phải
 *   trần trên**: `document.fonts` khai **27 mặt chữ, `loaded` = 0**, và không một
 *   request `.woff2` nào. Lý do: `tokens.css` khai `--font-sans: var(--font-instrument)`
 *   trong `@theme` ⇒ Tailwind v4 đổ vào **`:root` (`<html>`)**, nhưng các lớp
 *   `__variable_*` của `next/font` lại nằm trên **`<body>`** (`layout.tsx`). Ở `:root`
 *   thì `--font-instrument` chưa tồn tại và không có giá trị lui, nên `--font-sans`
 *   thành *guaranteed-invalid*, và `font-family: var(--font-sans)` rơi hết về bộ chữ
 *   hệ thống. Đo được: `getComputedStyle` của MỌI phần tử trên trang chủ trả về
 *   **đúng một** họ chữ — stack mặc định của Tailwind.
 *   ⇒ Ba bộ chữ thương hiệu **hiện không chạy ở đâu cả**. Ngày nào vá chỗ đó thì
 *   dòng font dưới đây thành chi phí THẬT (cỡ 120 KB cho trang chủ) và **phải xem
 *   lại trần** — đừng vá font rồi để nguyên con số này.
 *
 * ▸ **Số này là số nén CỤC BỘ, không phải byte CDN.** Đối chiếu với Chrome qua
 *   Cloudflare, trang chủ 2026-08-27: JS 112,9 KB ở đây / **117,3 KB** thật (−3,9%),
 *   CSS 6,5 / 6,7 (−3,2%), HTML 4,8 / 5,4 (−11,3%). Không mức gzip nào khớp cả ba
 *   cùng lúc (JS khớp level 4, CSS nằm giữa 4–5, HTML còn tệ hơn level 1) ⇒ CDN
 *   không dùng một mức duy nhất, và đuổi theo cho khớp từng byte là việc vô ích.
 *   Giữ level mặc định của Node cho **ổn định và so sánh được giữa các lượt build**;
 *   con số thật cao hơn **vài phần trăm**, trần 160 đã chừa chỗ cho khoảng đó.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Đổi tên từ `A1_TRAN_JS_KB` khi phép đo hết chỉ-đo-JS. Không nơi nào khác trong
// repo đặt biến cũ (đã grep) — nhưng nếu ai còn nó trong shell thì nay nó câm.
const TRAN_KB = Number(process.env.A1_TRAN_KB || 160);
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
/** KB sau gzip của một tệp trong `out/`, tra theo đường dẫn tuyệt đối kiểu web. */
function kbNen(duongTuongDoi) {
  if (nenCache.has(duongTuongDoi)) return nenCache.get(duongTuongDoi);
  const p = path.join(RA, duongTuongDoi.replace(/^\//, ''));
  const kb = existsSync(p) ? gzipSync(readFileSync(p)).length / 1024 : 0;
  nenCache.set(duongTuongDoi, kb);
  return kb;
}

/**
 * Tách `<script src>` thành hai nhóm. `noModule` là ranh giới thật, không phải chi
 * tiết vặt: trình duyệt hiểu ES module bỏ qua thẻ đó, còn trình duyệt cũ thì chưa
 * bao giờ chạy nổi trang này. Đọc thuộc tính trên CHÍNH thẻ, không đoán theo tên tệp
 * — tên tệp là quy ước của Next, nó đổi lúc nào cũng được.
 */
function chiaScript(html) {
  const dungModule = new Set();
  const cuKyThuat = new Set();
  for (const m of html.matchAll(/<script\b([^>]*)>/gi)) {
    const attrs = m[1];
    const src = attrs.match(/\ssrc=["']([^"']+)["']/i)?.[1];
    if (!src || !src.startsWith('/_next/')) continue;
    (/\snomodule\b/i.test(attrs) ? cuKyThuat : dungModule).add(src);
  }
  return { dungModule: [...dungModule], cuKyThuat: [...cuKyThuat] };
}

function timCss(html) {
  const ra = new Set();
  for (const m of html.matchAll(/<link\b([^>]*)>/gi)) {
    const attrs = m[1];
    if (!/\srel=["']?stylesheet/i.test(attrs)) continue;
    const href = attrs.match(/\shref=["']([^"']+)["']/i)?.[1];
    if (href?.startsWith('/_next/')) ra.add(href);
  }
  return [...ra];
}

/** Ký tự trang thật sự hiển thị — bỏ script/style rồi bỏ thẻ. Đủ cho chẩn đoán. */
function kyTuCuaTrang(html) {
  const chu = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  return new Set([...chu].map((c) => c.codePointAt(0)));
}

/** `u+0100-02ba` · `u+00??` · `u+0131` → [đầu, cuối]. */
function docUnicodeRange(txt) {
  const ra = [];
  for (const phan of txt.split(',')) {
    const t = phan.trim().toLowerCase().replace(/^u\+/, '');
    if (!t) continue;
    if (t.includes('?')) {
      ra.push([parseInt(t.replace(/\?/g, '0'), 16), parseInt(t.replace(/\?/g, 'f'), 16)]);
    } else if (t.includes('-')) {
      const [a, b] = t.split('-');
      ra.push([parseInt(a, 16), parseInt(b, 16)]);
    } else {
      const v = parseInt(t, 16);
      ra.push([v, v]);
    }
  }
  return ra;
}

/**
 * Trần trên của font: các tệp có `unicode-range` giao với ký tự của trang. Không
 * gzip — `.woff2` đã nén sẵn, nén lại là bịa ra một con số nhỏ hơn thứ đi qua dây.
 * Thiếu `unicode-range` ⇒ coi như phủ mọi ký tự (đúng theo chuẩn CSS).
 */
function fontCoThe(cssPaths, kyTu) {
  const ra = new Map();
  for (const cssPath of cssPaths) {
    const p = path.join(RA, cssPath.replace(/^\//, ''));
    if (!existsSync(p)) continue;
    const css = readFileSync(p, 'utf8');
    for (const m of css.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
      const than = m[1];
      const src = than.match(/url\(\s*["']?([^"')]+)["']?\s*\)/)?.[1];
      if (!src) continue;
      const urTxt = than.match(/unicode-range:\s*([^;}]+)/i)?.[1];
      const dung = !urTxt
        ? true
        : docUnicodeRange(urTxt).some(([a, b]) => [...kyTu].some((c) => c >= a && c <= b));
      if (!dung) continue;
      const f = path.join(RA, src.replace(/^\//, ''));
      if (existsSync(f)) ra.set(src, readFileSync(f).length / 1024);
    }
  }
  return ra;
}

let teNhat = { ten: '', kb: 0 };
const dong = [];
for (const f of timHtml(RA)) {
  const ten = path.relative(RA, f).replace(/\\/g, '/');
  const html = readFileSync(f, 'utf8');

  const { dungModule, cuKyThuat } = chiaScript(html);
  const cssPaths = timCss(html);

  const kbHtml = gzipSync(Buffer.from(html)).length / 1024;
  const kbJs = dungModule.reduce((t, d) => t + kbNen(d), 0);
  const kbCss = cssPaths.reduce((t, d) => t + kbNen(d), 0);
  const kbBoQua = cuKyThuat.reduce((t, d) => t + kbNen(d), 0);
  const font = fontCoThe(cssPaths, kyTuCuaTrang(html));
  const kbFont = [...font.values()].reduce((t, v) => t + v, 0);

  const kb = kbHtml + kbJs + kbCss;
  dong.push({ ten, kb, kbHtml, kbJs, kbCss, kbFont, soJs: dungModule.length, kbBoQua, soFont: font.size });
  if (kb > teNhat.kb) teNhat = { ten, kb };
}

const so = (v, w = 6) => v.toFixed(1).padStart(w);
console.log('   tổng   =  html +    js +   css        (font: trần trên, KHÔNG chặn)');
for (const d of dong) {
  console.log(
    `   ${so(d.kb, 6)} KB gz = ${so(d.kbHtml, 5)} + ${so(d.kbJs, 5)} + ${so(d.kbCss, 5)}` +
      ` · ${String(d.soJs).padStart(2)} js` +
      `  ${d.ten}` +
      (d.kbFont ? `   [font ≤ ${d.kbFont.toFixed(1)} KB / ${d.soFont} tệp]` : ''),
  );
}

const boQua = dong[0]?.kbBoQua ?? 0;
if (boQua) {
  console.log(`   (không tính ${boQua.toFixed(1)} KB polyfills \`noModule\` — trình duyệt hiểu module bỏ qua)`);
}

const vuot = teNhat.kb > TRAN_KB;
console.log(
  `${vuot ? '✗' : '✓'} trang nặng nhất: ${teNhat.ten} — ${teNhat.kb.toFixed(1)} KB gzip / trần ${TRAN_KB} KB`,
);
if (vuot) {
  console.log('  Vượt trần là một QUYẾT ĐỊNH, không phải một lỗi cần né: hoặc bỏ bớt,');
  console.log('  hoặc nâng A1_TRAN_KB và ghi lý do vào DECISIONS.');
}
process.exit(vuot ? 1 : 0);
