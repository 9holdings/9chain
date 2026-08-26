import { vi, dien } from '@/lib/i18n/vi';

/**
 * Dải cảnh báo re-genesis — nằm TRÊN header, ở mọi trang.
 *
 * 🔴 CỐ Ý KHÔNG CHO TẮT. Tắt được nghĩa là phải nhớ ai đã tắt, tức localStorage,
 * tức `'use client'`, tức một mảnh JS nữa cho mọi trang — đổi lấy việc người dùng
 * bấm tắt một lần rồi không bao giờ thấy lại lời cảnh báo quan trọng nhất site
 * đang có. Với một dải chỉ sống vài ngày, đó là món hời tồi.
 *
 * Là server component: 0 byte JS. Đặt ngoài `<main>` nhưng TRƯỚC liên kết bỏ qua
 * điều hướng thì sai — người đi bàn phím sẽ vấp vào nó trước khi tới lối tắt. Nên
 * nó đứng sau lối tắt, trước `<SiteHeader>`.
 *
 * 🔴 KHI QUA NGÀY G: đây là thứ phải gỡ, và gỡ nó là việc thủ công. Không có gì
 * trong mã tự biết ngày G đã tới — cố ý, vì một dải tự tắt theo đồng hồ máy khách
 * sẽ tắt sai ở mọi máy đặt sai giờ.
 */
export function ReGenesisBanner() {
  // 🔴 `text-ink`, KHÔNG phải `text-navy`. Bản tối lật `--color-gold-tint` thành nâu
  // sẫm `#2b2410`, mà `--color-navy` ở bản tối là `#1b2748` — tối trên tối, gần như
  // không đọc được. `--color-ink` lật theo nền (`#e9eefa`) nên đọc được ở CẢ HAI bản.
  // Đúng lớp lỗi chỉ lộ ra khi đổi theme, không lộ lúc viết.
  return (
    <aside aria-label={vi.reGenesis.nhan} className="border-b border-gold-line bg-gold-tint text-ink">
      <div className="khung flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5 text-sm">
        <span className="font-semibold">
          {dien(vi.reGenesis.bang, { ngay: vi.reGenesis.ngay })}
        </span>
        <a
          href="/re-genesis/"
          className="font-semibold text-gold-ink-strong underline underline-offset-2 hover:no-underline"
        >
          {vi.reGenesis.bangNut}
        </a>
      </div>
    </aside>
  );
}
