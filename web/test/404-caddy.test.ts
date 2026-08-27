import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

/**
 * Trang 404 viết THẲNG trong Caddyfile — bắt nó trôi lệch khỏi hệ nhận diện.
 * (Đ1-2 đường (b), 2026-08-27)
 *
 * ═══ VÌ SAO BÀI NÀY TỒN TẠI ═══
 * David chọn đường (b): trang 404 tự chứa, viết thẳng vào `local-net/deploy/Caddyfile`,
 * vì bản Caddy đang chạy không có `replace_status` nên không trả được `out/404.html`
 * kèm mã 404, mà trả kèm mã 200 thì thành soft 404.
 *
 * 🔴 CÁI GIÁ ĐÃ ĐƯỢC NÓI TRƯỚC KHI CHỌN: nội dung bị nhân đôi, và bản trong Caddyfile
 * **không đọc `tokens.css`**. Nghĩa là ngày nào 9Scan đổi màu thương hiệu → A1 chạy
 * `sync-tokens.mjs` → `tokens.css` đổi → còn trang 404 **giữ nguyên màu cũ, im lặng**.
 * Không ai mở trang 404 ra xem sau một lượt đổi màu.
 *
 * Bài này biến đúng cái bẫy đó thành phép đo: rút mọi mã màu ra khỏi khối 404 trong
 * Caddyfile, rồi đòi từng mã phải CÓ MẶT trong `tokens.css`. Trôi lệch ⇒ đỏ.
 *
 * ⚠️ Bài này KHÔNG đòi hai bên giống nhau về bố cục hay câu chữ — chỉ đòi **bảng màu
 * là tập con**. Đòi hơn thế là biến một cổng hữu ích thành một cổng hay kêu oan.
 */
const CADDY = path.resolve(__dirname, '..', '..', 'local-net', 'deploy', 'Caddyfile');
const TOKENS = path.resolve(__dirname, '..', 'app', 'tokens.css');

const coCaddy = existsSync(CADDY);

/** Cắt đúng khối `respond <<HTML … HTML 404`. */
function khoi404(): string | null {
  const s = readFileSync(CADDY, 'utf8');
  const i = s.indexOf('respond <<HTML');
  if (i < 0) return null;
  const j = s.indexOf('HTML 404', i);
  return j < 0 ? null : s.slice(i, j);
}

describe.skipIf(!coCaddy)('trang 404 trong Caddyfile', () => {
  it('vẫn còn trong Caddyfile và trả đúng mã 404', () => {
    const s = readFileSync(CADDY, 'utf8');
    // `respond … 404` là thứ phân biệt trang lỗi thật với soft 404. Nếu ai đó gỡ
    // con số đó đi thì trang vẫn hiện ra y hệt — và lỗi trở nên vô hình.
    expect(s, 'thiếu khối respond trả 404').toContain('HTML 404');
    expect(s, 'thiếu matcher status 404').toMatch(/@loi404\s+status\s+404/);
  });

  it('KHÔNG kéo tài nguyên ngoài — nó phải sống được khi mọi thứ khác đã hỏng', () => {
    const k = khoi404();
    expect(k).toBeTruthy();
    // Người ta rơi vào trang này lúc thứ khác đang hỏng. Mỗi tài nguyên ngoài là
    // thêm một cách để nó chết cùng lúc với thứ nó đang thay thế.
    expect(k!, 'không được có <script>').not.toMatch(/<script/i);
    expect(k!, 'không được có <link rel=…>').not.toMatch(/<link\s/i);
    expect(k!, 'không được có <img>').not.toMatch(/<img\s/i);
    expect(k!, 'không được gọi font/tài nguyên qua http').not.toMatch(/https?:\/\//i);
  });

  it('mọi mã màu đều là màu CÓ THẬT trong tokens.css', () => {
    const k = khoi404();
    const tokens = readFileSync(TOKENS, 'utf8').toLowerCase();
    const mau = [...new Set((k!.toLowerCase().match(/#[0-9a-f]{6}\b/g) ?? []))];
    expect(mau.length, 'khối 404 không có mã màu nào — chắc chắn đã bị sửa hỏng').toBeGreaterThan(4);

    const lac = mau.filter((m) => !tokens.includes(m));
    expect(
      lac,
      `Trang 404 trong Caddyfile dùng màu KHÔNG có trong tokens.css: ${lac.join(', ')}\n` +
        '  Đây đúng là kiểu trôi lệch mà đường (b) được cảnh báo trước khi chọn:\n' +
        '  Caddyfile không đọc tokens.css, nên một lượt `sync-tokens.mjs` đổi màu\n' +
        '  thương hiệu sẽ bỏ quên trang này, im lặng.\n' +
        '  Sửa: mở local-net/deploy/Caddyfile, khối `respond <<HTML`, cập nhật màu.',
    ).toEqual([]);
  });

  it('có đủ ba đường ra, và chúng là đường THẬT của site', () => {
    const k = khoi404()!;
    // Một trang 404 không có đường ra thì chỉ đổi ngôn ngữ của ngõ cụt.
    for (const d of ['href="/"', 'href="/faucet/"', 'href="/create-chain/"']) {
      expect(k, `thiếu đường ra ${d}`).toContain(d);
    }
    // 🔴 Ba đường này phải nằm trong `@trangmoi`, nếu không chính trang 404 lại dẫn
    // vào 404 — `check-routes.mjs` canh phần đó, đây chỉ canh phần câu chữ.
    const s = readFileSync(CADDY, 'utf8');
    const dsTrangMoi = s.match(/@trangmoi\s+path\s+([^\n]*)/)?.[1] ?? '';
    expect(dsTrangMoi, '/faucet/* phải có route').toContain('/faucet/*');
    expect(dsTrangMoi, '/create-chain/* phải có route').toContain('/create-chain/*');
  });

  it('không mang dấu [?] chờ duyệt giọng ra mạng công khai', () => {
    // Caddyfile không đi qua `pnpm build` nên cổng chặn `[?]` ở `out/` không với tới
    // đây. Trang này lại là trang người lạ hay gặp nhất khi gõ sai.
    expect(khoi404()!).not.toContain('[?]');
  });
});
