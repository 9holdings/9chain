import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { interpolate } from '../lib/i18n';
import vi from '../lib/i18n/dicts/vi';

/**
 * Giữ cho việc tách chuỗi KHÔNG bị bào mòn.
 *
 * Cách nó bị bào mòn luôn giống nhau: một người thêm một chuỗi thẳng vào JSX vì
 * "chỉ một chữ thôi". Bài này bắt đúng lúc đó, chứ không phải lúc đi dịch.
 *
 * 🔴 TỪ 2026-08-27 LUẬT NÀY ĐẮT HƠN TRƯỚC, KHÔNG RẺ ĐI.
 * Trước đây site chỉ có tiếng Việt, nên một chuỗi lọt vào JSX chỉ là chuyện dọn dẹp.
 * Nay site có **30 ngôn ngữ**: một chuỗi viết thẳng trong JSX là một câu **không bao
 * giờ dịch được**, và nó sẽ đứng nguyên tiếng Việt giữa một trang tiếng Ả Rập —
 * không lỗi, không cảnh báo, chỉ người đọc chịu.
 * Bài này vẫn quét chữ có dấu tiếng Việt vì đó là thứ dễ nhận nhất; nó KHÔNG bắt
 * được chuỗi tiếng Anh viết thẳng. Cổng thật cho chuyện đó là `useT()` — mã không
 * lấy chữ từ đâu khác được.
 */

const GOC = path.resolve(__dirname, '..');

function docTsx(dir: string, ra: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.') || e.name === 'out') continue;
    const p = path.join(dir, e.name);
    if (statSync(p).isDirectory()) docTsx(p, ra);
    else if (e.name.endsWith('.tsx')) ra.push(p);
  }
  return ra;
}

describe('i18n', () => {
  it('interpolate() giữ nguyên khoá thiếu thay vì để trống', () => {
    // Một chỗ trống lặng lẽ đọc như dữ liệu bị mất; `{so}` lộ ra thì sửa được ngay.
    expect(interpolate('còn {con}/{tong}', { con: 3 })).toBe('còn 3/{tong}');
  });

  it('interpolate() thay đúng mọi khoá có mặt', () => {
    expect(interpolate(vi.faucet.quotaFormat, { con: 3, tong: 5, gio: 1 })).toBe('3/5 lượt trong 1 giờ');
  });

  it('không có chuỗi tiếng Việt viết thẳng trong JSX', () => {
    // Dấu hiệu: chữ có dấu tiếng Việt nằm giữa hai thẻ JSX. Không bắt được 100%
    // mọi cách viết, nhưng bắt đúng cách người ta hay làm nhất.
    const nghiVan: string[] = [];
    for (const f of docTsx(GOC)) {
      const noi = readFileSync(f, 'utf8');
      for (const [i, dong] of noi.split('\n').entries()) {
        if (/^\s*(\/\/|\*|\/\*)/.test(dong)) continue; // chú thích thì được
        if (/>\s*[^<>{}\n]*[àáảãạăâèéẻẽẹêìíỉĩịòóỏõọôơùúủũụưỳýỷỹỵđ][^<>{}\n]*\s*</i.test(dong)) {
          nghiVan.push(`${path.relative(GOC, f).replace(/\\/g, '/')}:${i + 1}  ${dong.trim().slice(0, 70)}`);
        }
      }
    }
    expect(nghiVan, `chuỗi phải qua lib/i18n/vi.ts:\n${nghiVan.join('\n')}`).toEqual([]);
  });
});
