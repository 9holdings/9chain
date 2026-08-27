import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { docJson, LoiMang, HAN_DOC_MS } from '../lib/mang';

/**
 * Lưới an toàn mạng (Đ1-8).
 *
 * Điều kiện qua của mục này là *"giả lập API chết/chậm/trả rác, màn hình không
 * treo"*. Ba ca đó ở dưới. Nhưng phần **đắt nhất** của tệp là khối cuối: cổng canh
 * ràng buộc *"KHÔNG hạn giờ cho `/api/create` và `/api/revoke`"*.
 */
afterEach(() => vi.unstubAllGlobals());

/** Dựng một `fetch` giả trả về đúng thứ ta muốn thử. */
function gia(opts: { status?: number; body?: string; treo?: boolean; nem?: Error }) {
  vi.stubGlobal('fetch', (_u: string, init?: RequestInit) => {
    if (opts.nem) return Promise.reject(opts.nem);
    if (opts.treo) {
      // Treo THẬT, nhưng tôn trọng signal — đúng như một máy chủ không trả lời.
      return new Promise<Response>((_res, rej) => {
        init?.signal?.addEventListener('abort', () => {
          const e = new Error('timed out');
          e.name = 'TimeoutError';
          rej(e);
        });
      });
    }
    return Promise.resolve({
      ok: (opts.status ?? 200) < 400,
      status: opts.status ?? 200,
      text: () => Promise.resolve(opts.body ?? '{}'),
    } as Response);
  });
}

describe('docJson — ba kiểu hỏng phải phân biệt được', () => {
  it('máy chủ CHẬM/treo ⇒ hetGio, không treo mãi', async () => {
    gia({ treo: true });
    // Hạn 0,05s để bài kiểm không tự nó chậm.
    await expect(docJson('/x', {}, 0.05)).rejects.toMatchObject({ loai: 'hetGio' });
  });

  it('máy chủ CHẾT (500) ⇒ http, và thử lại KHÔNG vô ích', async () => {
    gia({ status: 500, body: '{"error":"vo"}' });
    const e = await docJson('/x').catch((x) => x as LoiMang);
    expect(e.loai).toBe('http');
    expect(e.status).toBe(500);
    expect(e.thuLaiVoIch).toBe(false);
  });

  it('máy chủ TỪ CHỐI THẬT (401) ⇒ thử lại vô ích', async () => {
    gia({ status: 401, body: '{"error":"chưa xác thực"}' });
    const e = await docJson('/x').catch((x) => x as LoiMang);
    expect(e.thuLaiVoIch).toBe(true);
    expect(e.message).toContain('chưa xác thực');
  });

  it('máy chủ trả RÁC (HTML) ⇒ khongPhaiJson, và câu lỗi phải nghi ĐỊNH TUYẾN', async () => {
    // Ca thật: request rơi xuống Blockscout ở gốc `/` và ta nhận về khung HTML.
    gia({ status: 200, body: '<!DOCTYPE html><html><body>Blockscout</body></html>' });
    const e = await docJson('/x').catch((x) => x as LoiMang);
    expect(e.loai).toBe('khongPhaiJson');
    expect(e.message).toMatch(/đường dẫn/i);
  });

  it('đứt mạng ⇒ dutMang, KHÔNG bị nhầm thành hetGio', async () => {
    gia({ nem: new TypeError('Failed to fetch') });
    await expect(docJson('/x')).rejects.toMatchObject({ loai: 'dutMang' });
  });

  it('không truyền hanGiay ⇒ KHÔNG gắn signal (mặc định là không hạn giờ)', async () => {
    let thay: RequestInit | undefined;
    vi.stubGlobal('fetch', (_u: string, init?: RequestInit) => {
      thay = init;
      return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve('{}') } as Response);
    });
    await docJson('/x');
    expect(thay?.signal).toBeUndefined();

    await docJson('/x', {}, HAN_DOC_MS / 1000);
    expect(thay?.signal).toBeDefined(); // có yêu cầu thì mới có
  });
});

/**
 * 🔴 CỔNG QUAN TRỌNG NHẤT TỆP NÀY.
 *
 * `/api/create` và `/api/revoke` mất ~170–300 giây thật. Một `AbortSignal.timeout`
 * ở đó sẽ **huỷ request của trình duyệt trong khi server vẫn đang đẻ chain**: người
 * dùng thấy "lỗi", chain vẫn ra đời, họ bấm lại — và trên mạng này **tên đã dùng
 * không bao giờ được cấp lại**, kể cả cho chain đã thu hồi.
 *
 * Đây là lớp lỗi mà bài kiểm chạy được KHÔNG bắt nổi: muốn tái hiện phải có một
 * thao tác 170 giây thật. Nên cổng này đọc **mã nguồn** — nó rẻ, và nó canh đúng
 * thứ con người sẽ vô tình phá khi "dọn dẹp cho nhất quán".
 */
describe('KHÔNG hạn giờ cho /api/create và /api/revoke', () => {
  const GOC = path.resolve(__dirname, '..');
  const BO_QUA = new Set(['node_modules', 'out', '.next', 'test']);

  function quet(d: string, ra: string[] = []): string[] {
    for (const m of readdirSync(d, { withFileTypes: true })) {
      if (BO_QUA.has(m.name)) continue;
      const p = path.join(d, m.name);
      if (m.isDirectory()) quet(p, ra);
      else if (/\.tsx?$/.test(m.name)) ra.push(p);
    }
    return ra;
  }

  /**
   * Đếm tham số ở TẦNG NGOÀI CÙNG của một lượt gọi.
   *
   * ⚠️ Bản đầu của cổng này dùng regex đếm dấu phẩy — và nó **báo oan** ngay lần chạy
   * đầu: `goiConsole('/api/revoke', token, { name, xacNhan })` chỉ có 3 tham số,
   * nhưng dấu phẩy BÊN TRONG object literal làm regex tưởng có 4. Một cổng báo oan
   * còn nguy hơn cổng không có: người ta học cách bỏ qua nó.
   * ⇒ Cân ngoặc thật, đừng đếm ký tự.
   */
  function demThamSo(src: string, tu: number): number {
    let sau = 0, so = 1, i = tu, trong: string | null = null;
    for (; i < src.length; i++) {
      const c = src[i], truoc = src[i - 1];
      if (trong) { if (c === trong && truoc !== '\\') trong = null; continue; }
      if (c === "'" || c === '"' || c === '`') { trong = c; continue; }
      if ('([{'.includes(c)) sau++;
      else if (')]}'.includes(c)) { if (sau === 0) break; sau--; }
      else if (c === ',' && sau === 0) so++;
    }
    return so;
  }

  it('không lượt gọi nào tới hai đường đó truyền tham số hạn giờ', () => {
    const pham: string[] = [];
    for (const p of quet(GOC)) {
      const s = readFileSync(p, 'utf8');
      const re = /goiConsole\s*(?:<[^>]*>)?\s*\(\s*['"]\/api\/(create|revoke)['"]/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(s))) {
        // Bắt đầu đếm ngay sau dấu `(` mở của lượt gọi.
        const mo = s.indexOf('(', m.index);
        if (demThamSo(s, mo + 1) >= 4) pham.push(`${path.relative(GOC, p)} (${m[1]})`);
      }
    }
    expect(
      pham,
      `KHÔNG được đặt hạn giờ cho /api/create hay /api/revoke — thao tác mất ~170–300s, ` +
        `huỷ giữa chừng thì server vẫn làm xong còn người dùng tưởng hỏng. Phạm: ${pham.join(', ')}`,
    ).toEqual([]);
  });

  it('`goiConsole` vẫn mặc định KHÔNG hạn giờ (chiều an toàn)', () => {
    const s = readFileSync(path.join(GOC, 'lib', 'wallet.ts'), 'utf8');
    // Tham số phải là tuỳ chọn (`hanGiay?:`) và signal chỉ gắn khi có nó.
    expect(s).toMatch(/hanGiay\?\s*:\s*number/);
    expect(s).toMatch(/hanGiay\s*\?\s*\{\s*signal:\s*AbortSignal\.timeout/);
  });
});
