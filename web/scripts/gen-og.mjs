/**
 * gen-og.mjs — sinh ảnh chia sẻ (Open Graph) cho 9Chain Testnet A1.
 *
 * ═══ VÌ SAO CÓ TỆP NÀY THAY VÌ MỘT PNG CHÉP TAY ═══
 * Ảnh OG mang **con số** (chainId) và **tên mạng**. Số đó đã đổi một lần
 * (re-genesis) và sẽ còn đổi. Một PNG chép tay là chỗ con số cũ nằm lại mà không
 * cổng nào bắt được — nó không phải mã, không ai chạy test lên nó.
 * Ở đây chainId đọc thẳng từ `web/lib/chain.ts`, nên sinh lại là đúng theo mã.
 *
 * ═══ 🔴 CHẠY TAY, KHÔNG NẰM TRONG `postbuild` ═══
 * `sharp` là dependency GIÁN TIẾP (của Next), không phải của dự án. Đưa nó vào
 * đường build là biến một thứ có thể biến mất sau `pnpm update` thành cổng chặn
 * deploy. Ảnh sinh ra được **commit vào repo**; chạy lại khi đổi nhận diện hoặc
 * đổi chainId:
 *
 *     node web/scripts/gen-og.mjs
 *
 * ═══ 🔴 LOGO ĐƯỢC DÁN NGUYÊN BẢN, KHÔNG VẼ LẠI ═══
 * Phần logo trong ảnh này là `public/brand/9chain-lockup-dark@2x.png` — tệp
 * NGUYÊN BẢN từ bộ kit của David, dán vào chứ không dựng lại bằng SVG.
 *
 * Vì sao quan trọng: chữ "9Chain" trong kit dùng font **Outfit 700**, mà Outfit
 * không có trên máy này. Dựng lại bằng SVG `<text font-family="Outfit,…">` rồi
 * render bằng librsvg sẽ âm thầm rơi về Arial — ra một logo SAI FONT mà trông
 * vẫn "ổn", và không có phép đo nào bắt được. Dán ảnh đã render sẵn thì font,
 * màu, tỉ lệ đều đúng theo định nghĩa.
 *
 * Nền lockup của kit là `#0D1733` bo góc, nên canvas ở đây cũng phải là ĐÚNG
 * `#0D1733` — lệch một sắc là lộ ngay khối chữ nhật quanh logo.
 *
 * ⚠️ Chữ PHỤ (nhãn "TESTNET A1", dòng chainId) dùng font hệ thống. Đó không phải
 * logo, nên không thuộc ràng buộc "giữ nguyên font logo". Và cố ý KHÔNG dùng ba
 * font thương hiệu của site: chúng hiện không chạy trên chính site (xem
 * `docs/BRAND-AUDIT-2026-08-27.md` mục B), nên nhúng vào đây là khai một nhận
 * diện mà trang thật chưa có.
 *
 * Ảnh là PNG THẬT, không phải SVG: Telegram, X, Zalo và Facebook đều không render
 * SVG trong thẻ preview — đó là lý do `og:image` phải là ảnh raster.
 */

import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GOC = join(__dirname, '..');

// `sharp` nằm trong store của pnpm chứ không được hoist ra `node_modules/sharp`.
const require = createRequire(import.meta.url);
let sharp;
try {
  sharp = require('sharp');
} catch {
  const { globSync } = await import('node:fs');
  const [duong] = globSync('node_modules/.pnpm/sharp@*/node_modules/sharp', { cwd: GOC });
  if (!duong) {
    console.error('✗ không tìm thấy `sharp`. Chạy `pnpm install` trong web/ trước.');
    process.exit(1);
  }
  sharp = require(join(GOC, duong));
}

// ═══ Nguồn sự thật cho con số ═══
// Đọc từ chính `lib/chain.ts` thay vì gõ lại — đó là điểm của tệp này.
const { readFileSync } = await import('node:fs');
const chainTs = readFileSync(join(GOC, 'lib/chain.ts'), 'utf8');
const doc = (khoa, mac) => (chainTs.match(new RegExp(`${khoa}:\\s*'?([^,'\\n]+)'?`)) ?? [, mac])[1].trim();

const CHAIN_ID = doc('chainId', '9000000009');
const KY_HIEU = doc('kyHieu', 'LOVE9');
const TEN = doc('ten', '9Chain Testnet A1');

// ═══ Màu ═══
// navy lấy từ tokens.css; vàng lấy từ DẤU (9chain.org), không phải từ token giao
// diện — xem `components/BrandLockup.tsx` về vì sao hai sắc vàng cùng tồn tại.
const NAVY = '#0d1733';
const VANG_DAU = '#F5C542';
const MO = '#8f9cba';

const W = 1200;
const H = 630;

const CHU = "'Segoe UI',system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif";
const MONO = "'Cascadia Mono',Consolas,'Courier New',monospace";

// ═══ Bước 1: LOGO NGUYÊN BẢN — bóc thẻ, đo tỉ lệ thật ═══
//
// 🔴 TỆP KIT KHÔNG PHẢI LOGO TRẦN — NÓ LÀ MỘT THẺ TRÌNH BÀY.
// Nền `#0D1733`, **viền 2px `#1C2A4D`**, bo góc. (Đo pixel: (387,0) ra
// [28,42,77]; từ y=2 vào ra [13,23,51].) Dán nguyên si lên canvas navy thì nền
// hoà vào hoàn hảo, nhưng **viền và bốn góc bo nổi lên thành một khung mờ quanh
// logo** — trông đúng như một lỗi ghép ảnh. Đã thấy tận mắt ở hai lượt sinh đầu.
//
// ⚠️ `.trim()` MỘT MÌNH KHÔNG ĐỦ — đã thử và nó không cắt được viền.
// `trim()` lấy màu tham chiếu từ **pixel góc trên-trái**, mà góc đó đang TRONG
// SUỐT (bo góc, alpha 0). Nên nó chỉ gặm bốn góc trong suốt rồi dừng ngay khi
// chạm viền đục — thẻ vẫn còn nguyên. Ảnh sinh ra vẫn lộ khung mờ.
//
// Thứ tự đúng, hai bước:
//   1. `extract` cắt cứng lề chứa viền + bo góc (8px ở thang 774 là dư).
//   2. `trim` với **nền khai tường minh** `#0D1733` ⇒ gặm hết nền đặc còn lại,
//      để lại đúng vùng có mực: dấu + chữ.
// Đây là bóc BAO BÌ, không đụng vào logo — hình học, màu và font nguyên vẹn.
// Tỉ lệ lấy TỪ KẾT QUẢ trim chứ không giả định 774:364, vì bóc thẻ đổi khung.
const logoGoc = join(GOC, 'public/brand/9chain-lockup-dark@2x.png');

const LOGO_W = 560; // rộng của LOGO (sau khi bóc thẻ) — chừa lề thở hai bên

const LE = 24; // trùm viền 2px + trọn bán kính bo góc (đo: 8px còn sót vệt góc)
const trimmed = await sharp(logoGoc)
  .extract({ left: LE, top: LE, width: 774 - LE * 2, height: 364 - LE * 2 })
  .flatten({ background: '#0D1733' }) // bỏ alpha để trim có nền đặc mà bám vào
  .trim({ background: '#0D1733', threshold: 10 })
  .png()
  .toBuffer();
const kt = await sharp(trimmed).metadata();
const LOGO_H = Math.round((kt.height / kt.width) * LOGO_W);
const LOGO_X = Math.round((W - LOGO_W) / 2);
const LOGO_Y = 168;

const logo = await sharp(trimmed).resize(LOGO_W, LOGO_H, { fit: 'fill' }).png().toBuffer();

// ═══ Bước 2: nền + chữ phụ ═══
// Dựng SAU khi biết `LOGO_H` thật, vì nhãn và dòng chainId phải xếp theo đáy logo.
const nenSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${NAVY}"/>
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="28"
        fill="none" stroke="#24304d" stroke-width="2"/>

  <!-- Nhãn TESTNET A1: thứ phân biệt ảnh này với ảnh của trang chính. Thiếu nó
       thì dán link A1 vào đâu cũng trông như dán link 9chain.org.
       Chữ phụ, không phải logo ⇒ font hệ thống là đúng chỗ. -->
  <rect x="${W / 2 - 116}" y="${LOGO_Y + LOGO_H + 40}" width="232" height="46" rx="10"
        fill="none" stroke="${VANG_DAU}" stroke-width="2"/>
  <text x="${W / 2}" y="${LOGO_Y + LOGO_H + 72}" text-anchor="middle"
        font-family="${CHU}" font-size="25" font-weight="600"
        fill="${VANG_DAU}" letter-spacing="3.4">TESTNET A1</text>

  <text x="${W / 2}" y="558" text-anchor="middle" font-family="${MONO}"
        font-size="27" fill="${MO}">chainId ${CHAIN_ID} · ${KY_HIEU} · a1.9chain.org</text>
</svg>`;

const raDir = join(GOC, 'public/brand');
mkdirSync(raDir, { recursive: true });
const ra = join(raDir, 'og-9chain-a1.png');

await sharp(Buffer.from(nenSvg))
  .composite([{ input: logo, left: LOGO_X, top: LOGO_Y }])
  .png({ compressionLevel: 9 })
  .toFile(ra);

const { size } = await import('node:fs').then((m) => m.statSync(ra));
console.log(`✓ ${ra}`);
console.log(`  ${W}×${H} · ${(size / 1024).toFixed(1)} KB`);
console.log(`  mạng: ${TEN} · chainId ${CHAIN_ID} · ${KY_HIEU}`);
