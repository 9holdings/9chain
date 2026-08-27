import { describe, expect, it, vi as vitest, beforeEach, afterEach } from 'vitest';
import { LoiConsole } from '../lib/wallet';

/**
 * `choTienTrinhXong` — hàm quyết định người dùng phải nhìn thanh tiến trình bao lâu.
 * (Đ1-6, 2026-08-27)
 *
 * ═══ LỖI ĐANG KHOÁ LẠI ═══
 * Đo 2026-08-27: `POST /console/api/create` với token rác bị từ chối **401 trong
 * 0,831 giây**. Nhưng màn hình đứng im tới **trần chờ** (khi đó là 900 giây), vì
 * hàm này chỉ thoát khi `daThayChay && !running` — mà lượt bị từ chối sớm thì
 * `running` KHÔNG BAO GIỜ bật. Người dùng nhìn tiến trình của một việc chưa hề
 * bắt đầu, rồi rất có thể bấm lại — và mỗi lần bấm lại là một chain thừa ăn vĩnh
 * viễn một slot trong trần 15, giữ luôn tên và chainId.
 *
 * 🔴 BA CA PHẢI XỬ KHÁC NHAU, và đây là chỗ dễ vá quá tay nhất:
 *   4xx thật      → dừng ngay (việc chưa bắt đầu)
 *   524 / 5xx     → CHỜ TIẾP (Cloudflare cắt ở ~100s, server vẫn làm tới cùng)
 *   đứt mạng      → CHỜ TIẾP (không biết gì cả)
 * Vá thành "hễ POST hỏng thì dừng" là dựng lại đúng cái bug 2026-08-25: giao diện
 * báo "không thu hồi được" trong khi danh bạ đã ghi chain vào `retired`.
 */

// Hàm gọi `goiConsole` nội bộ (cùng module), nên chặn ở tầng `fetch`.
const gocThat = globalThis.fetch;

function datFetch(chuoi: Array<{ ok?: boolean; status?: number; body: unknown }>) {
  let i = 0;
  globalThis.fetch = vitest.fn(async () => {
    const b = chuoi[Math.min(i, chuoi.length - 1)];
    i += 1;
    return {
      ok: b.ok ?? true,
      status: b.status ?? 200,
      text: async () => JSON.stringify(b.body),
    } as unknown as Response;
  }) as typeof fetch;
  return () => i;
}

let choTienTrinhXong: typeof import('../lib/wallet')['choTienTrinhXong'];

beforeEach(async () => {
  ({ choTienTrinhXong } = await import('../lib/wallet'));
});
afterEach(() => {
  globalThis.fetch = gocThat;
  vitest.restoreAllMocks();
});

const CHAY = { running: true, kind: 'create', name: 'X', steps: [], error: null, etaSeconds: 170 };
const XONG = { running: false, kind: 'create', name: 'X', steps: [], error: null, etaSeconds: 0 };

describe('choTienTrinhXong', () => {
  it('thoát ngay khi POST bị TỪ CHỐI THẬT (4xx) và chưa từng thấy running', async () => {
    // Đây là ca đã treo 900 giây. `running` luôn false vì việc chưa vào hàng đợi.
    datFetch([{ body: XONG }]);
    const t0 = Date.now();
    const kq = await choTienTrinhXong('token', { moiMs: 5, tranGiay: 30, tuChoiSom: () => true });
    expect(Date.now() - t0, 'phải thoát gần như tức thì, không chờ hết trần').toBeLessThan(2000);
    expect(kq).not.toBeNull();
  });

  it('KHÔNG thoát sớm khi chưa có tín hiệu từ chối — 524 phải chờ tới cùng', async () => {
    // Cloudflare cắt ở ~100s nhưng server vẫn làm: đây là ca PHẢI kiên nhẫn.
    // Chuỗi: chạy → chạy → xong. Nếu hàm thoát sớm thì nó trả về lúc còn `running`.
    datFetch([{ body: CHAY }, { body: CHAY }, { body: XONG }]);
    const kq = await choTienTrinhXong('token', { moiMs: 5, tranGiay: 30, tuChoiSom: () => false });
    expect(kq?.running, 'phải chờ tới khi running=false').toBe(false);
  });

  it('đã thấy running rồi thì tín hiệu từ chối KHÔNG còn được nghe', async () => {
    // Token hết hạn giữa chừng là 4xx muộn — nhưng việc đang chạy thật ở server.
    // Bỏ cuộc lúc đó là dựng lại đúng bug "giao diện nói dối" của 2026-08-25.
    datFetch([{ body: CHAY }, { body: CHAY }, { body: XONG }]);
    let batDauTuChoi = false;
    const p = choTienTrinhXong('token', { moiMs: 5, tranGiay: 30, tuChoiSom: () => batDauTuChoi });
    setTimeout(() => { batDauTuChoi = true; }, 12); // bật SAU khi đã thấy running
    const kq = await p;
    expect(kq?.running, 'đã thấy chạy thì phải theo tới cùng').toBe(false);
  });

  it('không kết luận "xong" trước khi thấy running lần nào', async () => {
    // `running=false` ở nhịp đầu là trạng thái của lượt TRƯỚC, không phải của mình.
    let solan = 0;
    globalThis.fetch = vitest.fn(async () => {
      solan += 1;
      const b = solan <= 2 ? XONG : solan <= 4 ? CHAY : XONG;
      return { ok: true, status: 200, text: async () => JSON.stringify(b) } as unknown as Response;
    }) as typeof fetch;
    const kq = await choTienTrinhXong('token', { moiMs: 5, tranGiay: 30 });
    expect(solan, 'phải đọc quá 2 nhịp đầu chứ không kết luận ngay').toBeGreaterThan(4);
    expect(kq?.running).toBe(false);
  });
});

describe('LoiConsole', () => {
  it('phân biệt từ chối thật với Cloudflare cắt và với đứt mạng', () => {
    expect(new LoiConsole('unauthorized', 401).laTuChoiThat, '401 = từ chối thật').toBe(true);
    expect(new LoiConsole('trùng tên', 409).laTuChoiThat, '409 = từ chối thật').toBe(true);
    expect(new LoiConsole('timeout', 524).laTuChoiThat, '524 = Cloudflare cắt, KHÔNG phải từ chối').toBe(false);
    expect(new LoiConsole('bad gateway', 502).laTuChoiThat, '5xx = chưa kết luận được').toBe(false);
    // 🔴 `0` = không có phản hồi HTTP nào. Coi nó như 4xx là bỏ cuộc trong lúc
    // server vẫn đang đẻ chain — đúng ca tệ nhất.
    expect(new LoiConsole('failed to fetch', 0).laTuChoiThat, '0 = đứt mạng, KHÔNG kết luận').toBe(false);
  });
});
