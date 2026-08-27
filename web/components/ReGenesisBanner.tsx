'use client';

import { dien, useT } from '@/lib/i18n';

/**
 * Dải cảnh báo re-genesis — nằm TRÊN header, ở mọi trang.
 *
 * 🔴 CỐ Ý KHÔNG CHO TẮT. Tắt được nghĩa là phải nhớ ai đã tắt, tức localStorage,
 * tức `'use client'`, tức một mảnh JS nữa cho mọi trang — đổi lấy việc người dùng
 * bấm tắt một lần rồi không bao giờ thấy lại lời cảnh báo quan trọng nhất site
 * đang có. Với một dải chỉ sống vài ngày, đó là món hời tồi.
 *
 * Đặt ngoài `<main>` nhưng TRƯỚC liên kết bỏ qua điều hướng thì sai — người đi bàn
 * phím sẽ vấp vào nó trước khi tới lối tắt. Nên nó đứng sau lối tắt, trước
 * `<SiteHeader>`.
 *
 * ⚠️ Chú thích cũ ở đây khai "là server component: 0 byte JS". SAI từ lúc i18n vào:
 * `useT()` là hook, nên tệp mang `'use client'` ngay dòng đầu. Sửa vì một chú thích
 * sai về ranh giới client/server là thứ dẫn người sau đi nhầm đúng chỗ đắt nhất.
 *
 * 🔴 HAI MỐC, KHÔNG PHẢI MỘT — và mốc ĐÃ QUA phải đứng trước.
 * Trước 2026-08-27 dải này chỉ nói về `01/09` (tương lai). Nhưng mạng đã sinh lại
 * **hôm nay** (D-081, thế hệ g0), nên người mở ví thấy số dư 0 lại **không tìm được
 * lời giải nào trên trang họ đang đứng** — câu giải thích chỉ nằm ở `/re-genesis/`,
 * sau một cú bấm. Đó đúng bài học Đ1-4 đã ghi trong `NoiDungTrangChu.tsx`: đặt lời
 * giải ở trang riêng là để nó vắng mặt ở chỗ người ta thật sự đọc.
 * ⇒ `daXayRaTieuDe` (chuỗi ĐÃ CÓ SẴN trong cả 11 từ điển — không sinh chuỗi mới)
 *   lên đầu dải; câu về `01/09` lùi xuống sau nó.
 *
 * 🔴 KHI QUA NGÀY G: đây là thứ phải gỡ, và gỡ nó là việc thủ công. Không có gì
 * trong mã tự biết ngày G đã tới — cố ý, vì một dải tự tắt theo đồng hồ máy khách
 * sẽ tắt sai ở mọi máy đặt sai giờ. Lúc đó `daXayRaTieuDe` cũng phải đổi ngày sang
 * `01/09`, hoặc gỡ cùng — đừng để nó nói về một lượt sinh lại đã cũ hai đời.
 */
export function ReGenesisBanner() {
  const t = useT();
  // 🔴 `text-ink`, KHÔNG phải `text-navy`. Bản tối lật `--color-gold-tint` thành nâu
  // sẫm `#2b2410`, mà `--color-navy` ở bản tối là `#1b2748` — tối trên tối, gần như
  // không đọc được. `--color-ink` lật theo nền (`#e9eefa`) nên đọc được ở CẢ HAI bản.
  // Đúng lớp lỗi chỉ lộ ra khi đổi theme, không lộ lúc viết.
  return (
    <aside aria-label={t.reGenesis.nhan} className="border-b border-gold-line bg-gold-tint text-ink">
      <div className="khung flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5 text-sm">
        {/* Mốc ĐÃ QUA đứng trước mốc sắp tới: người đọc dải này hôm nay đang cầm một
            cái ví vừa về 0, và đó là câu hỏi họ mang tới trang. */}
        <span className="font-semibold">{t.reGenesis.daXayRaTieuDe}</span>
        <span>{dien(t.reGenesis.bang, { ngay: t.reGenesis.ngay })}</span>
        <a
          href="/re-genesis/"
          className="font-semibold text-gold-ink-strong underline underline-offset-2 hover:no-underline"
        >
          {t.reGenesis.bangNut}
        </a>
      </div>
    </aside>
  );
}
