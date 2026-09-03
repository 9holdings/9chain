import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
// `allowJs` cho TS suy kiểu thẳng từ file .mjs — không cần khai báo kiểu riêng.
import { catKhoi, bam } from '../scripts/sync-tokens.mjs';

/**
 * Bắt TRÔI LỆCH hệ token giữa A1 và 9Scan-A1.
 *
 * Hai repo cố tình độc lập (không gom vào package chung — xem đầu
 * `scripts/sync-tokens.mjs`), nên "cùng một hệ màu" là một lời hứa không có gì
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
    //
    // 🔴 NỚI 2026-08-27, và nói rõ vì sao để lần sau không ai nới thêm:
    // bài này đọc CẢ CHÚ THÍCH, nên một chú thích ghi lại phép đo — ví dụ
    // *"`bg-surface-alt` trùng byte với nền trang: sáng #f5f7fb / tối #0a1122"* —
    // cũng làm nó đỏ. Nhưng hex trong chú thích là **bằng chứng của một phép đo**,
    // không phải màu đang được vẽ ra; nó không thể trôi lệch vì nó không chạy.
    // Cấm nó là dạy người ta viết chú thích mơ hồ ("màu nền hơi giống nhau"), tức
    // làm hỏng đúng thứ dự án này dựa vào.
    // ⇒ Cắt chú thích TRƯỚC khi soi. Ý định của bài không đổi: hex trong **MÃ** vẫn cấm.
    const boChuThich = (s: string) =>
      s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');

    const urlPath = ['components/ui/index.tsx', 'components/SiteHeader.tsx', 'app/faucet/FaucetForm.tsx'];
    for (const d of urlPath) {
      const p = path.resolve(__dirname, '..', d);
      if (!existsSync(p)) continue;
      const code = boChuThich(readFileSync(p, 'utf8'));
      expect(code, `${d} không được chứa mã hex trong MÃ (chú thích thì được)`).not.toMatch(
        /#[0-9a-fA-F]{6}\b/,
      );
    }
  });

  it.skipIf(!existsSync(NGUON))('vân tay khớp bản 9Scan-A1', () => {
    const goc = readFileSync(NGUON, 'utf8');
    const vanGoc = bam(catKhoi(goc, '@theme') + catKhoi(goc, "html[data-theme='dark'] {"));
    const vanChep = /Vân tay: ([0-9a-f]{16})/.exec(readFileSync(TOKENS, 'utf8'))?.[1];
    expect(
      vanChep,
      'token đã trôi lệch — chạy `node web/scripts/sync-tokens.mjs` rồi soi lại giao diện',
    ).toBe(vanGoc);
  });
});
