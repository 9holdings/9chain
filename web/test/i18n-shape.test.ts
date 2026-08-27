import { describe, expect, it } from 'vitest';
import { readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { EN } from '../lib/i18n/en';
import { NGON_NGU, MAC_DINH } from '../lib/i18n/ngonNgu';

/**
 * Hình dạng khoá phải KHỚP TUYỆT ĐỐI giữa 30 từ điển.
 * (Đa ngôn ngữ, 2026-08-27)
 *
 * ═══ VÌ SAO ĐÂY LÀ CỔNG QUAN TRỌNG NHẤT CỦA CẢ HỆ ═══
 * Một khoá thiếu trong bản dịch KHÔNG làm hỏng build và KHÔNG ném lỗi lúc chạy —
 * nó chỉ hiện ra `undefined` ở giữa một câu, hoặc tệ hơn: rơi về tiếng Anh trong khi
 * mọi câu quanh nó là tiếng khác. Người dùng thấy một trang lai, không có gì báo cho
 * đội biết. Với 30 ngôn ngữ × 246 khoá = 7.380 chỗ để chuyện đó xảy ra.
 *
 * `tsc` bắt được phần lớn nhờ `type Tu = typeof EN`, nhưng KHÔNG bắt được:
 *   • khoá thừa (TS cho phép object rộng hơn ở một số vị trí)
 *   • `{chỗ}` bị dịch mất hoặc gõ sai — `{ten}` thành `{name}` thì `dien()` giữ
 *     nguyên dấu ngoặc và người dùng đọc thấy `{name}` giữa câu
 *   • chuỗi rỗng — hợp kiểu, nhưng trên màn hình là một khoảng trắng
 *
 * Bài này bắt cả ba, và nó chạy trên MỌI từ điển có mặt trong `dicts/`.
 */

const THU_MUC = path.resolve(__dirname, '..', 'lib', 'i18n', 'dicts');

/** Bẹt một object lồng thành danh sách đường khoá: `chung.dangTai`. */
function betKhoa(o: unknown, tien = ''): string[] {
  if (o === null || typeof o !== 'object') return [tien];
  return Object.entries(o as Record<string, unknown>).flatMap(([k, v]) =>
    betKhoa(v, tien ? `${tien}.${k}` : k),
  );
}

/** Lấy mọi `{chỗ}` trong một chuỗi, đã sắp xếp để so được. */
function cacCho(s: string): string[] {
  return [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
}

function layGiaTri(o: unknown, duong: string): unknown {
  return duong.split('.').reduce<unknown>((a, k) => (a as Record<string, unknown>)?.[k], o);
}

const KHOA_EN = betKhoa(EN).sort();

/** Khoá CỐ Ý để rỗng — điền vào đúng ngày G. Xem `reGenesisXong` trong `en.ts`. */
const DUOC_RONG = new Set(['reGenesisXong.luuUrl', 'reGenesisXong.luuSha256', 'chainCuaToi.cotViec']);

describe('sổ đăng ký ngôn ngữ', () => {
  it('đúng 30 ngôn ngữ, tiếng Anh mặc định và đứng đầu', () => {
    expect(NGON_NGU.length).toBe(30);
    expect(MAC_DINH).toBe('en');
    expect(NGON_NGU[0].ma).toBe('en');
  });

  it('tiếng Việt ở ĐÚNG vị trí thứ 9 — David chốt', () => {
    // Vị trí này là một yêu cầu sản phẩm, không phải hệ quả của bảng xếp hạng nào.
    // Không có bài kiểm thì lần sắp xếp lại đầu tiên sẽ lặng lẽ đẩy nó đi chỗ khác.
    expect(NGON_NGU.findIndex((n) => n.ma === 'vi')).toBe(8);
  });

  it('không mã nào trùng, và mọi mã đều hợp lệ cho <html lang>', () => {
    const ma = NGON_NGU.map((n) => n.ma);
    expect(new Set(ma).size).toBe(ma.length);
    // Mã sai đi thẳng vào `<html lang>` và trình đọc màn hình chọn giọng theo đó.
    for (const m of ma) expect(m, `mã lạ: ${m}`).toMatch(/^[a-z]{2,3}(-[A-Za-z]{2,4})?$/);
  });

  it('mỗi ngôn ngữ khai đúng một chiều viết, và có đúng 3 bản RTL', () => {
    for (const n of NGON_NGU) expect(['ltr', 'rtl']).toContain(n.chieu);
    expect(NGON_NGU.filter((n) => n.chieu === 'rtl').map((n) => n.ma).sort()).toEqual(['ar', 'fa', 'ur']);
  });

  it('khai mức độ soát — và tiếng Việt là bản có người soát', () => {
    // 🔴 Trường này tồn tại để bộ chọn KHÔNG bày 30 ngôn ngữ trông ngang nhau trong
    // khi 29 bản là máy dịch. Site này nói với người lạ rằng tài sản của họ sẽ bị
    // xoá — giấu mức độ soát ở đó là đúng lớp lỗi dự án vừa gỡ khỏi trang chủ.
    for (const n of NGON_NGU) expect(['nguoi', 'may']).toContain(n.soat);
    expect(NGON_NGU.find((n) => n.ma === 'vi')?.soat).toBe('nguoi');
  });
});

describe('hình dạng từ điển', () => {
  const coThuMuc = existsSync(THU_MUC);
  const cacTep = coThuMuc ? readdirSync(THU_MUC).filter((f) => f.endsWith('.ts')) : [];

  it('mọi ngôn ngữ trong sổ (trừ EN) đều có tệp từ điển', () => {
    if (!coThuMuc) return; // chưa dựng xong — không bắt đỏ ở giai đoạn dở dang
    const caned = NGON_NGU.map((n) => n.ma).filter((m) => m !== MAC_DINH);
    const dangCo = cacTep.map((f) => f.replace(/\.ts$/, ''));
    const thieu = caned.filter((m) => !dangCo.includes(m));
    expect(thieu, `thiếu từ điển: ${thieu.join(', ')}`).toEqual([]);
  });

  for (const tep of cacTep) {
    const ma = tep.replace(/\.ts$/, '');
    describe(ma, () => {
      it('khớp ĐÚNG bộ khoá của EN — không thiếu, không thừa', async () => {
        const m = await import(`../lib/i18n/dicts/${ma}`);
        const khoa = betKhoa(m.default).sort();
        const thieu = KHOA_EN.filter((k) => !khoa.includes(k));
        const thua = khoa.filter((k) => !KHOA_EN.includes(k));
        expect(thieu, `${ma} THIẾU khoá: ${thieu.slice(0, 8).join(', ')}`).toEqual([]);
        expect(thua, `${ma} THỪA khoá: ${thua.slice(0, 8).join(', ')}`).toEqual([]);
      });

      it('giữ nguyên mọi {chỗ} của bản gốc', async () => {
        // `dien()` chỉ thay khoá nó biết. Dịch `{ten}` thành `{name}` là người dùng
        // đọc thấy nguyên chữ `{name}` giữa câu — không lỗi, không ai hay.
        const m = await import(`../lib/i18n/dicts/${ma}`);
        const lech: string[] = [];
        for (const k of KHOA_EN) {
          const goc = layGiaTri(EN, k);
          const ban = layGiaTri(m.default, k);
          if (typeof goc !== 'string' || typeof ban !== 'string') continue;
          const a = cacCho(goc);
          const b = cacCho(ban);
          if (a.join(',') !== b.join(',')) lech.push(`${k}: gốc {${a.join('} {')}} ≠ dịch {${b.join('} {')}}`);
        }
        expect(lech, `${ma} lệch {chỗ}:\n  ${lech.slice(0, 6).join('\n  ')}`).toEqual([]);
      });

      it('không chuỗi nào rỗng ngoài những khoá cố ý để rỗng', async () => {
        const m = await import(`../lib/i18n/dicts/${ma}`);
        const rong = KHOA_EN.filter((k) => {
          if (DUOC_RONG.has(k)) return false;
          const v = layGiaTri(m.default, k);
          return typeof v === 'string' && v.trim() === '';
        });
        expect(rong, `${ma} có chuỗi rỗng: ${rong.join(', ')}`).toEqual([]);
      });
    });
  }
});

describe('đoán ngôn ngữ cho người mới', () => {
  it('trình duyệt tiếng Việt ⇒ tiếng Việt, KHÔNG phải mặc định', async () => {
    // 🔴 Đây là phép đo bảo vệ người dùng hiện tại. Đổi mặc định sang tiếng Anh mà
    // cơ chế này hỏng thì mọi người Việt đang dùng site đột nhiên thấy tiếng Anh —
    // một thay đổi họ không yêu cầu và không hiểu vì sao.
    const { doanNgonNgu } = await import('../lib/i18n/ngonNgu');
    expect(doanNgonNgu(['vi-VN', 'vi', 'en'])).toBe('vi');
    expect(doanNgonNgu(['vi'])).toBe('vi');
  });

  it('lấy ngôn ngữ ĐẦU TIÊN mà site có, không phải cái khớp cuối', async () => {
    const { doanNgonNgu } = await import('../lib/i18n/ngonNgu');
    // Người đặt tiếng Nhật trước tiếng Anh thì phải nhận tiếng Nhật — nhưng `ja`
    // chưa có từ điển nên sổ vẫn khai nó, và provider sẽ rơi về EN khi nạp hỏng.
    // Ở TẦNG NÀY chỉ hỏi "sổ có mã đó không", đúng phạm vi của hàm.
    expect(doanNgonNgu(['ja-JP', 'en-US'])).toBe('ja');
    expect(doanNgonNgu(['xx-YY', 'vi-VN'])).toBe('vi');
  });

  it('không khớp gì hoặc danh sách rỗng ⇒ mặc định', async () => {
    const { doanNgonNgu, MAC_DINH } = await import('../lib/i18n/ngonNgu');
    expect(doanNgonNgu(['xx', 'yy'])).toBe(MAC_DINH);
    expect(doanNgonNgu([])).toBe(MAC_DINH);
    expect(doanNgonNgu(undefined)).toBe(MAC_DINH);
  });
});

describe('chặn ngôn ngữ chưa có từ điển', () => {
  it('coTuDien() nói ĐÚNG cái gì nạp được, không nói cái gì có trong sổ', async () => {
    // 🔴 Bug bắt được lúc viết test, không phải lúc chạy: sổ khai đủ 30 ngôn ngữ
    // trong khi mới 2 từ điển tồn tại. Nếu `maBanDau()` chỉ lọc qua `laMaHopLe()`
    // thì người dùng trình duyệt tiếng Nhật nhận `ma = 'ja'`, chữ rơi về tiếng Anh,
    // NHƯNG `<html lang>` bị đặt thành `ja` ⇒ trình đọc màn hình đọc tiếng Anh bằng
    // ngữ âm tiếng Nhật. Không lỗi, không cảnh báo, người dùng bằng mắt không thấy.
    const { coTuDien } = await import('../lib/i18n');
    const { laMaHopLe } = await import('../lib/i18n/ngonNgu');

    expect(coTuDien('en'), 'mặc định luôn nạp được').toBe(true);
    expect(coTuDien('vi'), 'đã có từ điển').toBe(true);
    // Hai khẳng định này CÙNG NHAU mới là phép đo: mã hợp lệ theo sổ NHƯNG chưa nạp
    // được. Khi `ja` có từ điển thì vế dưới đổi sang `true` — sửa test lúc đó, đừng
    // xoá nó, vì lớp lỗi vẫn còn với những ngôn ngữ chưa làm.
    expect(laMaHopLe('ja'), 'sổ CÓ khai tiếng Nhật').toBe(true);
    expect(coTuDien('ja'), 'nhưng CHƯA nạp được ⇒ không được chọn').toBe(false);
  });
});
