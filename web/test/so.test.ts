import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { dinhDangSo } from '../lib/numbers';

/**
 * Cổng định dạng số theo ngôn ngữ.
 *
 * 🔴 BÀI KIỂM NÀY CỐ Ý KHÔNG ĐỌC CHIỀU CAO BLOCK THẬT.
 * Mạng vừa sinh lại nên `eth_blockNumber` = 1, và một chữ số thì **mọi ngôn ngữ in
 * ra y hệt nhau**. Một bài kiểm đo qua mạng sẽ xanh hôm nay, xanh sau ngày G (mạng
 * lại về 1), và **không chứng minh gì cả** — đúng lớp "cổng xanh vì đo sai đại
 * lượng" mà dự án đã trả giá nhiều lần. Nên: đo thẳng hàm, với số đủ lớn để dấu
 * phân cách buộc phải xuất hiện.
 */
describe('định dạng số theo ngôn ngữ', () => {
  const N = 1_234_567;

  it('tiếng Anh dùng dấu phẩy', () => {
    expect(dinhDangSo(N, 'en')).toBe('1,234,567');
  });

  it('tiếng Việt và tiếng Đức dùng dấu chấm', () => {
    expect(dinhDangSo(N, 'vi')).toBe('1.234.567');
    expect(dinhDangSo(N, 'de')).toBe('1.234.567');
  });

  /**
   * 🔴 ĐỐI CHỨNG NGƯỢC — vế quan trọng nhất của cả tệp.
   * Lỗi đang sửa là "mọi ngôn ngữ đều ra kiểu Việt". Nếu ai đó lỡ cắm cứng lại một
   * locale, hai vế trên VẪN có thể xanh (vi và de trùng nhau). Bài này đòi hai
   * ngôn ngữ phải ra KHÁC NHAU — tức hàm thật sự đọc tham số `ma`.
   */
  it('hai ngôn ngữ khác quy ước phải ra khác nhau', () => {
    expect(dinhDangSo(N, 'en')).not.toBe(dinhDangSo(N, 'vi'));
  });

  it('giữ chữ số Latin kể cả ở ngôn ngữ có hệ chữ số riêng (D-web-2)', () => {
    // `ar` mặc định ra chữ số Ả Rập-Ấn `١٢٣`. Chiều cao block phải đối chiếu được
    // với explorer và ví — cả hai in chữ số Latin.
    const s = dinhDangSo(N, 'ar');
    expect(s).toMatch(/[0-9]/);
    expect(s).not.toMatch(/[٠-٩۰-۹]/);
  });

  it('mã ngôn ngữ rác không làm đổ, và KHÔNG rơi về vi-VN', () => {
    expect(dinhDangSo(N, 'khong-phai-locale-!!')).toBe('1,234,567');
  });
});

/**
 * Cổng chống tái phát: không ai được cắm cứng locale vào lời gọi định dạng nữa.
 * Đặt ở đây chứ không ở lint vì lý do phải đọc được: nó mang theo VÌ SAO.
 */
describe('không còn locale cắm cứng', () => {
  const GOC = path.resolve(__dirname, '..');
  const BO_QUA = new Set(['node_modules', 'out', '.next', 'test']);

  function quet(thuMuc: string, ra: string[] = []): string[] {
    for (const m of readdirSync(thuMuc, { withFileTypes: true })) {
      if (BO_QUA.has(m.name)) continue;
      const p = path.join(thuMuc, m.name);
      if (m.isDirectory()) quet(p, ra);
      else if (/\.tsx?$/.test(m.name)) ra.push(p);
    }
    return ra;
  }

  it('không tệp nguồn nào gọi toLocaleString với locale cố định', () => {
    const pham: string[] = [];
    for (const p of quet(GOC)) {
      // `lib/numbers.ts` được phép — nó là chỗ DUY NHẤT biết về locale, và nó đọc tham số.
      // 🔴 TÊN TỆP ĐỔI `so.ts` → `numbers.ts` (2026-09-03, luật mã tiếng Anh), và
      // danh sách miễn trừ này vẫn trỏ tên cũ ⇒ nó thôi khớp, nên bài kiểm tố CHÍNH
      // bản vá mà nó sinh ra để bảo vệ. Một miễn trừ cắm theo TÊN TỆP là thứ hỏng
      // im lặng mỗi lượt đổi tên; ở đây nó hỏng theo chiều an toàn (đỏ, không xanh
      // giả) nên bắt được ngay.
      if (p.endsWith(`lib${path.sep}numbers.ts`)) continue;
      // 🔴 BỎ CHÚ THÍCH TRƯỚC KHI QUÉT (sửa 2026-09-03).
      // Bản trước quét cả tệp, nên nó tố `app/chains/DirectoryContent.tsx` chỉ vì chú
      // thích đầu tệp đó GIẢI THÍCH luật này bằng cách nêu ví dụ
      // `toLocaleString('vi-VN')`. Một cổng kêu về chính tài liệu của nó là cổng sắp
      // bị ai đó gỡ — và lúc đó mất luôn phép đo thật. Thứ tới được trình duyệt là
      // MÃ, nên chỉ quét mã.
      const noiDung = readFileSync(p, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '');
      // Bắt `toLocaleString('xx')` / `Intl.NumberFormat('xx')` với chuỗi nguyên văn.
      if (/(toLocaleString|Intl\.(NumberFormat|DateTimeFormat))\(\s*['"]/.test(noiDung)) {
        pham.push(path.relative(GOC, p));
      }
    }
    expect(
      pham,
      `dùng \`dinhDangSo(n, ma)\` trong \`lib/numbers.ts\` thay vì cắm cứng locale — xem chú thích ở đó. Phạm: ${pham.join(', ')}`,
    ).toEqual([]);
  });
});
