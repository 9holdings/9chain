import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { EN } from '../lib/i18n/en';

/**
 * Mỗi tiêu chí của bảng /compare/ phải có ĐỦ tên + ghi chú trong từ điển, và ngược
 * lại từ điển không được ôm khoá đã bỏ.
 *
 * ═══ VÌ SAO KHÔNG CỔNG NÀO KHÁC THẤY ĐƯỢC ═══
 * `ComparisonTable` tra chữ bằng khoá GHÉP: `t.compare['crit' + c.id]`. Ghép chuỗi
 * nên `tsc` không kiểm được, và một `id` gõ sai in ra `undefined` — nguyên một ô
 * trống ở giữa bảng, ở **cả 30 ngôn ngữ cùng lúc**, không lỗi, không cảnh báo.
 *   • `i18n-shape` mù: nó so 30 từ điển VỚI NHAU, nên "cả 30 cùng thiếu" là hợp lệ.
 *   • `check-dict-values` mù: giá trị không đổi, chỉ là không ai tra tới.
 *   • `check-interpolate` mù: những khoá này không có chỗ giữ chỗ.
 * ⇒ Phép đo đúng là nối MẢNG TIÊU CHÍ với TỪ ĐIỂN, và phải đo CẢ HAI CHIỀU.
 *
 * Đọc `id` thẳng từ mã nguồn thay vì import mảng: `GOC` không được export, và export
 * nó chỉ để bài kiểm đọc được là để bài kiểm đổi hình dạng của sản phẩm.
 */
const NGUON = path.resolve(__dirname, '..', 'app', 'compare', 'ComparisonTable.tsx');

describe('bảng /compare/ — tiêu chí ↔ từ điển', () => {
  const src = readFileSync(NGUON, 'utf8');
  const ids = [...src.matchAll(/\{ id: '(\w+)',/g)].map((m) => m[1]);
  const compare = EN.compare as unknown as Record<string, string>;

  it('đọc được mảng tiêu chí (nếu không, mọi khẳng định dưới đây là xanh giả)', () => {
    // 🔴 Không có dòng này thì một lượt đổi hình dạng mảng làm `ids` rỗng, và mọi
    // vòng lặp bên dưới chạy 0 lần rồi báo xanh — cổng tự tắt mà không ai biết.
    expect(ids.length, 'không đọc ra tiêu chí nào từ ComparisonTable.tsx').toBeGreaterThan(0);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it('mọi tiêu chí có đủ tên và ghi chú', () => {
    for (const id of ids) {
      expect(compare[`crit${id}`], `thiếu compare.crit${id}`).toBeTruthy();
      expect(compare[`note${id}`], `thiếu compare.note${id}`).toBeTruthy();
    }
  });

  it('từ điển không giữ tiêu chí đã bỏ khỏi bảng', () => {
    const treo = Object.keys(compare)
      .filter((k) => /^(crit|note)[A-Z]/.test(k))
      .filter((k) => !ids.includes(k.replace(/^(crit|note)/, '')));
    expect(treo, 'khoá tiêu chí không còn ai tra tới').toEqual([]);
  });
});
