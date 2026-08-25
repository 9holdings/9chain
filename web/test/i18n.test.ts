import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { vi, dien } from '../lib/i18n/vi';

/**
 * Giữ cho việc tách chuỗi KHÔNG bị bào mòn.
 *
 * Tiếng Anh làm sau, nhưng gom chuỗi lại sau thì đắt gấp nhiều lần — và cách nó bị
 * bào mòn luôn giống nhau: một người thêm một chuỗi thẳng vào JSX vì "chỉ một chữ
 * thôi". Bài này bắt đúng lúc đó, chứ không phải lúc đi dịch.
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
  it('dien() giữ nguyên khoá thiếu thay vì để trống', () => {
    // Một chỗ trống lặng lẽ đọc như dữ liệu bị mất; `{so}` lộ ra thì sửa được ngay.
    expect(dien('còn {con}/{tong}', { con: 3 })).toBe('còn 3/{tong}');
  });

  it('dien() thay đúng mọi khoá có mặt', () => {
    expect(dien(vi.faucet.hanMucCachDoc, { con: 3, tong: 5, gio: 1 })).toBe('3/5 lượt trong 1 giờ');
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
