import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

/**
 * Bắt trôi lệch BỀ MẶT CHIA SẺ (Đ1-5, 2026-08-27).
 *
 * ═══ VÌ SAO BÀI NÀY TỒN TẠI ═══
 * Trước lượt vá, `og:title` / `og:description` / `twitter:*` **giống hệt nhau trên
 * cả 6 trang** — đều là nội dung trang chủ. Dán `/re-genesis/` vào nhóm chat thì
 * hiện ra lời mời "đẻ chain của bạn mất khoảng ba phút", ngược hẳn điều trang nói.
 *
 * 🔴 KHÔNG MỘT CỔNG NÀO BẮT ĐƯỢC, và lý do đáng nhớ: mọi cổng hiện có đo `<title>`,
 * mà `<title>` thì ĐÃ riêng từ lâu. Đo đúng đại lượng nghĩa là đo `og:title`, chứ
 * không phải đo một thứ tương quan với nó.
 *
 * 🔴 BÀI NÀY ĐỌC `out/`, KHÔNG ĐỌC MÃ NGUỒN. Nó phải chứng minh thứ ĐÃ XUẤT RA —
 * `metadata` đúng trong `.tsx` mà Next không sinh thẻ thì vẫn hỏng y như cũ.
 * Bỏ qua (không đỏ) khi chưa có `out/`: bắt nó đỏ ở máy chưa build là dạy người ta
 * bỏ qua kết quả test — đắt hơn nhiều so với thiếu một phép đo.
 */
const OUT = path.resolve(__dirname, '..', 'out');
const coOut = existsSync(OUT);

/** Đọc mọi `index.html` cấp một trong `out/`, kèm `404.html` ở gốc. */
function cacTrang(): { duong: string; html: string }[] {
  const ds: { duong: string; html: string }[] = [];
  const goc = path.join(OUT, 'index.html');
  if (existsSync(goc)) ds.push({ duong: '/', html: readFileSync(goc, 'utf8') });
  for (const t of readdirSync(OUT, { withFileTypes: true })) {
    if (!t.isDirectory() || t.name.startsWith('_')) continue;
    const p = path.join(OUT, t.name, 'index.html');
    if (existsSync(p)) ds.push({ duong: `/${t.name}/`, html: readFileSync(p, 'utf8') });
  }
  return ds;
}

function thePropertyContent(html: string, khoa: string): string | null {
  // Next có thể xuất `property="og:title" content="…"` theo cả hai thứ tự thuộc tính.
  const a = html.match(new RegExp(`<meta[^>]+(?:property|name)="${khoa}"[^>]+content="([^"]*)"`, 'i'));
  if (a) return a[1];
  const b = html.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]+(?:property|name)="${khoa}"`, 'i'));
  return b ? b[1] : null;
}

describe.skipIf(!coOut)('bề mặt chia sẻ', () => {
  /**
   * `/404/` CỐ Ý không có `og:url` — và cũng không có `canonical`.
   * Một trang lỗi không có URL chính tắc: nó là câu trả lời cho **mọi** đường sai,
   * không phải một tài liệu ở một địa chỉ. Khai `og:url` cho nó là mời bò tìm kiếm
   * coi đó là một trang thật (nó đã mang `noindex`, nhưng hai tầng nói cùng một
   * điều thì rẻ). Ngoại lệ này hẹp và có lý do — đừng nới thành "bỏ qua 404".
   */
  const KHONG_CAN_URL = new Set(['/404/']);

  it('mọi trang đều có og:title và og:description', () => {
    for (const { duong, html } of cacTrang()) {
      expect(thePropertyContent(html, 'og:title'), `${duong} thiếu og:title`).toBeTruthy();
      expect(thePropertyContent(html, 'og:description'), `${duong} thiếu og:description`).toBeTruthy();
    }
  });

  it('mọi trang THẬT đều có og:url (404 là ngoại lệ có chủ ý)', () => {
    for (const { duong, html } of cacTrang()) {
      if (KHONG_CAN_URL.has(duong)) {
        // Đối chứng ngược cho chính ngoại lệ: nếu ngày nào đó 404 có og:url thì
        // gần như chắc chắn ai đó đã gắn `pageMeta` vào nó mà không đọc lý do.
        expect(thePropertyContent(html, 'og:url'), `${duong} KHÔNG được có og:url`).toBeNull();
        continue;
      }
      expect(thePropertyContent(html, 'og:url'), `${duong} thiếu og:url`).toBeTruthy();
    }
  });

  it('og:title KHÁC NHAU giữa các trang — đây là phần hôm qua còn đỏ', () => {
    const ds = cacTrang();
    const theo = new Map<string, string[]>();
    for (const { duong, html } of ds) {
      const t = thePropertyContent(html, 'og:title') ?? '(thiếu)';
      theo.set(t, [...(theo.get(t) ?? []), duong]);
    }
    const trung = [...theo.entries()].filter(([, ds2]) => ds2.length > 1);
    expect(
      trung,
      `og:title bị dùng chung:\n${trung.map(([t, ds2]) => `  "${t}"\n    ← ${ds2.join(', ')}`).join('\n')}`,
    ).toEqual([]);
  });

  it('og:url của mỗi trang trỏ đúng đường dẫn của chính nó', () => {
    for (const { duong, html } of cacTrang()) {
      if (KHONG_CAN_URL.has(duong)) continue;
      const u = thePropertyContent(html, 'og:url') ?? '';
      expect(u, `${duong} có og:url = "${u}"`).toContain(duong);
    }
  });

  it('không một thẻ meta nào mang dấu [?] chờ duyệt giọng', () => {
    // Dấu `[?]` là cơ chế duyệt NỘI BỘ. Lọt ra thẻ meta là nó bị máy khác đọc và
    // hiện lại nguyên văn trong thẻ chia sẻ — ngoài tầm với của mọi lượt sửa sau.
    for (const { duong, html } of cacTrang()) {
      for (const k of ['og:title', 'og:description', 'twitter:title', 'twitter:description']) {
        const v = thePropertyContent(html, k) ?? '';
        expect(v, `${duong} — ${k} còn dấu [?]`).not.toContain('[?]');
      }
    }
  });
});

describe('sitemap.xml', () => {
  const P = path.resolve(__dirname, '..', 'public', 'sitemap.xml');

  it('khai đúng namespace sitemaps.org (CÓ chữ "s")', () => {
    // Namespace sai không làm hỏng cú pháp XML, nên không phép đo nào ở tầng vận
    // chuyển bắt được — bộ máy tìm kiếm chỉ lặng lẽ bỏ qua cả tệp. Bản trước
    // 2026-08-27 khai `www.sitemap.org`, thiếu đúng một ký tự.
    const s = readFileSync(P, 'utf8');
    const ns = s.match(/<urlset[^>]+xmlns="([^"]+)"/)?.[1];
    expect(ns).toBe('http://www.sitemaps.org/schemas/sitemap/0.9');
  });

  it('mọi <loc> đều là URL tuyệt đối trên đúng tên miền', () => {
    const s = readFileSync(P, 'utf8');
    const locs = [...s.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBeGreaterThan(0);
    for (const l of locs) expect(l, `<loc> lạ: ${l}`).toMatch(/^https:\/\/a1\.9chain\.org\//);
  });
});
