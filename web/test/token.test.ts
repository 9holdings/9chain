import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
// `allowJs` cho TS suy kiểu thẳng từ file .mjs — không cần khai báo kiểu riêng.
import { catKhoi, bam } from '../scripts/dong-bo-token.mjs';

/**
 * Bắt TRÔI LỆCH hệ token giữa A1 và 9Scan-A1.
 *
 * Hai repo cố tình độc lập (không gom vào package chung — xem đầu
 * `scripts/dong-bo-token.mjs`), nên "cùng một hệ màu" là một lời hứa không có gì
 * bảo đảm ngoài phép đo này. Không có nó, hai bề mặt của cùng một sản phẩm sẽ lệch
 * nhau dần và không ai phát hiện cho tới lúc người dùng bấm qua lại giữa hai bên.
 *
 * 🔴 Bài này BỎ QUA nếu không thấy repo 9Scan, và nói rõ là đã bỏ qua. Bắt nó đỏ ở
 * máy không có repo kia là dạy người ta bỏ qua kết quả test — đắt hơn nhiều so với
 * việc thiếu một phép đo.
 */
const NGUON = 'C:/PROJECTS/9Scan-A1/app/globals.css';
const TOKENS = path.resolve(__dirname, '..', 'app', 'tokens.css');

describe('hệ token', () => {
  it('tokens.css khai vân tay của chính nó', () => {
    const css = readFileSync(TOKENS, 'utf8');
    expect(css).toMatch(/Vân tay: [0-9a-f]{16}/);
  });

  it('không hardcode hex ngoài khối token', () => {
    // Mọi mã màu phải nằm trong tokens.css. Một hex lọt vào component là chỗ đầu
    // tiên hai bề mặt bắt đầu lệch nhau, và nó không bao giờ tự lộ ra.
    const duong = ['components/ui/index.tsx', 'components/SiteHeader.tsx', 'app/faucet/FaucetForm.tsx'];
    for (const d of duong) {
      const p = path.resolve(__dirname, '..', d);
      if (!existsSync(p)) continue;
      const noi = readFileSync(p, 'utf8');
      expect(noi, `${d} không được chứa mã hex`).not.toMatch(/#[0-9a-fA-F]{6}\b/);
    }
  });

  it.skipIf(!existsSync(NGUON))('vân tay khớp bản 9Scan-A1', () => {
    const goc = readFileSync(NGUON, 'utf8');
    const vanGoc = bam(catKhoi(goc, '@theme') + catKhoi(goc, "html[data-theme='dark'] {"));
    const vanChep = /Vân tay: ([0-9a-f]{16})/.exec(readFileSync(TOKENS, 'utf8'))?.[1];
    expect(
      vanChep,
      'token đã trôi lệch — chạy `node web/scripts/dong-bo-token.mjs` rồi soi lại giao diện',
    ).toBe(vanGoc);
  });
});
