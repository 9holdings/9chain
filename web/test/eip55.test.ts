import { describe, expect, it } from 'vitest';
import { toChecksumAddress, checkAddress, shortenAddress } from '../lib/eip55';
// `allowJs` cho TS suy kiểu thẳng từ file .mjs — không cần khai báo kiểu riêng.
import { toChecksumAddress as chuanGoc } from '../../local-net/lib/eip55.mjs';

/**
 * Bản TS ở `web/lib/eip55.ts` là bản CHÉP của `local-net/lib/eip55.mjs` (lý do ở
 * đầu file đó). Bài này là phép đo trôi lệch: hai bản phải cho ra **y hệt** nhau.
 *
 * 🔴 Vì sao đắt: địa chỉ chủ chain đi vào genesis BẤT BIẾN. Nếu bản trình duyệt
 * chấp nhận một địa chỉ mà bản server từ chối (hoặc ngược lại), người dùng gặp một
 * lỗi không giải thích được ở đúng thao tác không làm lại được.
 */
describe('EIP-55', () => {
  const VECTOR = [
    '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
    '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
    '0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB',
    '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb',
  ];

  it('khớp vector chuẩn của EIP-55', () => {
    for (const v of VECTOR) expect(toChecksumAddress(v.toLowerCase())).toBe(v);
  });

  it('trùng từng ký tự với bản .mjs đang chạy trên server', () => {
    // Vector ngẫu nhiên tất định: một bộ cố định chỉ chứng minh hai bản cùng thuộc
    // vài trường hợp, còn 200 địa chỉ trải đều mới bắt được lệch ở nhánh hiếm.
    let x = 123456789n;
    for (let i = 0; i < 200; i++) {
      x = (x * 6364136223846793005n + 1442695040888963407n) & ((1n << 64n) - 1n);
      const hex = x.toString(16).padStart(16, '0').repeat(3).slice(0, 40);
      const a = '0x' + hex;
      expect(toChecksumAddress(a)).toBe(chuanGoc(a));
    }
  });

  it('từ chối địa chỉ sai checksum, và gợi ý đường thoát', () => {
    const hong = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAeD'; // đổi ký tự cuối
    const kq = checkAddress(hong);
    expect(kq.ok).toBe(false);
    if (!kq.ok) {
      expect(kq.loi).toMatch(/checksum/i);
      // Gợi ý phải là đường đi TIẾP được, không phải một lời trách.
      expect(kq.goiY).toBe(hong.toLowerCase());
    }
  });

  it('chấp nhận toàn thường và toàn hoa (không mang thông tin checksum)', () => {
    expect(checkAddress(VECTOR[0].toLowerCase()).ok).toBe(true);
    expect(checkAddress('0x' + VECTOR[0].slice(2).toUpperCase()).ok).toBe(true);
  });

  it('từ chối địa chỉ 0 và chuỗi sai hình dạng', () => {
    expect(checkAddress('0x' + '0'.repeat(40)).ok).toBe(false);
    expect(checkAddress('0x123').ok).toBe(false);
    expect(checkAddress('').ok).toBe(false);
  });

  it('rút gọn vẫn giữ đủ hai đầu để đối chiếu', () => {
    const r = shortenAddress(VECTOR[0]);
    expect(r.startsWith('0x5aAeb6')).toBe(true);
    expect(r.endsWith('eAed')).toBe(true);
  });
});
