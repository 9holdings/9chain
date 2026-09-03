'use client';

import { useT } from '@/lib/i18n';

/**
 * Liên kết "bỏ qua điều hướng" — thứ đầu tiên nhận tiêu điểm khi bấm Tab.
 *
 * Tách thành component client CHỈ vì một lý do: chữ của nó phải đổi theo ngôn ngữ,
 * mà `layout.tsx` là server component (nó phải thế — `export const metadata` chỉ
 * hợp lệ ở server). Xem `components/PageHeader.tsx` cho ranh giới chung của cả site.
 *
 * 🔴 Nó phải đứng TRƯỚC mọi thứ trong `<body>`. Đó là toàn bộ công dụng: người đi
 * bằng bàn phím không phải đi qua cả thanh điều hướng ở mỗi trang.
 */
export function BoQuaToiNoiDung() {
  const t = useT();
  return (
    <a
      href="#noi-dung"
      className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-btn focus:bg-gold focus:px-4 focus:py-2 focus:font-semibold focus:text-navy"
    >
      {t.common.skipToContent}
    </a>
  );
}
