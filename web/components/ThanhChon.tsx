import { vi } from '@/lib/i18n/vi';
import { gop } from '@/lib/gop';

/**
 * Thanh chuyển nhanh giữa ba biến thể — **chỉ tồn tại trong lúc chờ David chọn**.
 *
 * Khi M10.3 chốt, thanh này và hai biến thể không được chọn sẽ bị gỡ. Để nó lại sau
 * khi đã chốt là để một bộ điều khiển nội bộ nằm trên trang chủ công khai.
 */
const BAN = [
  { ma: 'a', ten: vi.bienThe.aTen, href: '/tc-a/' },
  { ma: 'b', ten: vi.bienThe.bTen, href: '/tc-b/' },
  { ma: 'c', ten: vi.bienThe.cTen, href: '/tc-c/' },
] as const;

export function ThanhChon({ dang }: { dang: 'a' | 'b' | 'c' }) {
  return (
    <nav aria-label={vi.bienThe.tieuDe} className="border-b border-dev-line bg-gold-tint-2">
      <div className="khung flex flex-wrap items-center gap-2 py-2 text-sm">
        <span className="font-semibold text-dev-ink">{vi.bienThe.tieuDe}</span>
        {BAN.map((b) => (
          <a
            key={b.ma}
            href={b.href}
            // `aria-current` chứ không chỉ tô đậm: người dùng trình đọc màn hình
            // không thấy màu, nên "đang xem bản nào" phải nằm trong ngữ nghĩa.
            aria-current={b.ma === dang ? 'page' : undefined}
            className={gop(
              'rounded-chip border px-2 py-1 font-semibold',
              b.ma === dang
                ? 'border-dev-line bg-gold text-navy'
                : 'border-transparent text-dev-ink underline hover:bg-gold-tint',
            )}
          >
            {b.ten}
          </a>
        ))}
      </div>
    </nav>
  );
}
