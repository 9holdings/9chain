#!/usr/bin/env node
/**
 * check-no-marker.mjs — không một dấu `[?]` nào được đi ra bản dựng.
 * (Đ1-3, 2026-08-27)
 *
 * ═══ SỰ CỐ BÀI NÀY SINH RA ĐỂ CHẶN ═══
 * `[?]` là cơ chế NỘI BỘ để David duyệt giọng (xem đầu `lib/i18n/vi.ts`). Nó không
 * bao giờ được ra tới mắt người dùng. Nhưng đo `27/08` trên mạng công khai:
 *
 *     /re-genesis/    64 dấu   ← gồm cả <h1> và MỌI <h2>
 *     /faucet/         9 dấu
 *     / và 4 trang khác 6 dấu mỗi trang  ← dải banner nằm trong layout gốc
 *
 * `/re-genesis/` là trang nói với người lạ rằng tài sản của họ sắp bị xoá. Một dấu
 * ngoặc-hỏi sau mỗi câu cảnh báo đọc đúng nghĩa đen của nó.
 *
 * 🔴 VÌ SAO KHÔNG CHỐT Ở `vi.ts` MÀ CHỐT Ở `out/`:
 * Chuỗi có thể lọt ra sản phẩm bằng nhiều đường khác ngoài từ điển — chữ viết thẳng
 * trong JSX, `aria-label`, `alt`, thẻ meta. Đo tệp nguồn là đo một đại lượng TƯƠNG
 * QUAN với thứ ta quan tâm; đo `out/` là đo CHÍNH nó. Dự án này đã trả giá nhiều lần
 * cho việc đo nhầm đại lượng (cổng liên kết thử alias rồi in ra đường gốc; cổng
 * `<title>` xanh trong khi `og:*` dùng chung).
 *
 * 🔴 VÀ TUYỆT ĐỐI KHÔNG "sửa" bằng cách cắt dấu ở tầng render. Làm thế là giấu khỏi
 * mắt David — phá đúng cơ chế mà dấu này dựng ra. Cách sửa đúng chỉ có một: đưa
 * chuỗi cho David duyệt, rồi gỡ dấu trong `vi.ts`.
 *
 * Chạy trong `postbuild`. Ra 0 = sạch. Ra 1 = có dấu lọt ra sản phẩm.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const GOC = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const RA = path.join(GOC, 'out');
const DAU = '[?]';

if (!existsSync(RA)) {
  console.log('✗ chưa có out/ — chạy `pnpm build` trước');
  process.exit(1);
}

/** Chỉ soi tệp người đọc được: HTML và payload RSC. Không soi chunk JS đã nén tên. */
const DUOI = new Set(['.html', '.txt', '.xml', '.webmanifest']);

function quet(dir, ra = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === '_next') continue; // chunk JS: tên đã băm, không phải bề mặt chữ
      quet(p, ra);
    } else if (DUOI.has(path.extname(e.name))) ra.push(p);
  }
  return ra;
}

const dinh = [];
for (const f of quet(RA)) {
  const noi = readFileSync(f, 'utf8');
  if (!noi.includes(DAU)) continue;
  const so = noi.split(DAU).length - 1;
  // Lấy một mẫu ngắn quanh dấu ĐẦU TIÊN để người sửa biết ngay câu nào.
  const i = noi.indexOf(DAU);
  const mau = noi
    .slice(Math.max(0, i - 60), i + 3)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  dinh.push({ tep: path.relative(RA, f).replace(/\\/g, '/'), so, mau });
}

const tong = dinh.reduce((a, d) => a + d.so, 0);

if (dinh.length) {
  console.log(`\n✗ CÓ ${tong} DẤU "${DAU}" ĐI RA BẢN DỰNG — chúng sẽ hiện ra cho người đọc:`);
  for (const d of dinh.sort((a, b) => b.so - a.so)) {
    console.log(`     ${String(d.so).padStart(3)} dấu · ${d.tep}`);
    console.log(`         …${d.mau}`);
  }
  console.log('');
  console.log('  Dấu `[?]` là cơ chế NỘI BỘ để David duyệt giọng, không phải chữ của sản phẩm.');
  console.log('  Sửa ĐÚNG: đưa chuỗi cho David duyệt rồi gỡ dấu trong web/lib/i18n/vi.ts.');
  console.log('  🔴 Sửa SAI: cắt dấu ở tầng render — đó là giấu khỏi mắt David, tức phá');
  console.log('     đúng cơ chế mà dấu này dựng ra. Xem chú thích đầu vi.ts.');
  process.exit(1);
}

console.log(`✓ không dấu "${DAU}" nào lọt ra bản dựng (${quet(RA).length} tệp chữ)`);
