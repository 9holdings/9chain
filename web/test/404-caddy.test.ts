import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

/**
 * The 404 page written DIRECTLY into the Caddyfile — catching it drifting from the design system.
 * (Đ1-2, path (b), 2026-08-27)
 *
 * ═══ WHY THIS SUITE EXISTS ═══
 * David chose path (b): a self-contained 404 page written straight into
 * `local-net/deploy/Caddyfile`, because the running Caddy build has no `replace_status` and so
 * cannot serve `out/404.html` with a 404 status, and serving it with a 200 makes it a soft 404.
 *
 * 🔴 THE COST WAS STATED BEFORE THE CHOICE WAS MADE: the content is duplicated, and the copy in
 * the Caddyfile **does not read `tokens.css`**. Which means the day 9Scan changes a brand colour →
 * A1 runs `sync-tokens.mjs` → `tokens.css` changes → and the 404 page **keeps the old colours,
 * silently**. Nobody opens the 404 page to look after a colour change.
 *
 * This suite turns that exact trap into a measurement: extract every colour code from the 404
 * block in the Caddyfile, and require each one to BE PRESENT in `tokens.css`. Drift ⇒ red.
 *
 * ⚠️ It does NOT require the two to match in layout or wording — only that the **palette is a
 * subset**. Asking for more turns a useful gate into one that cries wolf.
 */
const CADDY = path.resolve(__dirname, '..', '..', 'local-net', 'deploy', 'Caddyfile');
const TOKENS = path.resolve(__dirname, '..', 'app', 'tokens.css');

const coCaddy = existsSync(CADDY);

/** Extract exactly the `respond <<HTML … HTML 404` block. */
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
    // `respond … 404` is what separates a real error page from a soft 404. If someone removes
    // that number the page still renders identically — and the error becomes invisible.
    expect(s, 'thiếu khối respond trả 404').toContain('HTML 404');
    expect(s, 'thiếu matcher status 404').toMatch(/@loi404\s+status\s+404/);
  });

  it('KHÔNG kéo tài nguyên ngoài — nó phải sống được khi mọi thứ khác đã hỏng', () => {
    const k = khoi404();
    expect(k).toBeTruthy();
    // People land on this page while something else is broken. Every external resource is one more
    // way for it to die at the same moment as the thing it is standing in for.
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
    // A 404 page with no way out only changes the language of the dead end.
    for (const d of ['href="/"', 'href="/faucet/"', 'href="/create-chain/"']) {
      expect(k, `thiếu đường ra ${d}`).toContain(d);
    }
    // 🔴 These three paths must be in `@trangmoi`, otherwise the 404 page itself leads into a
    // 404 — `check-routes.mjs` guards that part; this only guards the wording.
    const s = readFileSync(CADDY, 'utf8');
    const dsTrangMoi = s.match(/@trangmoi\s+path\s+([^\n]*)/)?.[1] ?? '';
    expect(dsTrangMoi, '/faucet/* phải có route').toContain('/faucet/*');
    expect(dsTrangMoi, '/create-chain/* phải có route').toContain('/create-chain/*');
  });

  it('không mang dấu [?] chờ duyệt giọng ra mạng công khai', () => {
    // The Caddyfile does not pass through `pnpm build`, so the `[?]` gate over `out/` cannot reach
    // here. And this is the page a stranger most often meets after a typo.
    expect(khoi404()!).not.toContain('[?]');
  });
});
