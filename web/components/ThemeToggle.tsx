'use client';

import { useEffect, useState } from 'react';
import { useT } from '@/lib/i18n';

/**
 * Nút chuyển sáng/tối.
 *
 * `data-theme-switching` bật trong đúng một khung hình để tắt sạch transition —
 * không có nó thì mục nav đang chọn kẹt ở màu bản sáng giữa nền tối (navy trên
 * navy, tương phản 1,05:1) suốt thời gian transition chạy.
 */
export function ThemeToggle() {
  const t = useT();
  const [dark, setDark] = useState<boolean | null>(null);

  // Đọc trạng thái THẬT từ DOM (ThemeScript đã đặt trước khi vẽ), không tự đoán lại
  // từ localStorage: hai nguồn sự thật cho cùng một thứ là hai thứ phải giữ cho khớp.
  useEffect(() => {
    setDark(document.documentElement.getAttribute('data-theme') === 'dark');
  }, []);

  function doi() {
    const moi = !(document.documentElement.getAttribute('data-theme') === 'dark');
    const html = document.documentElement;
    html.setAttribute('data-theme-switching', '');
    html.setAttribute('data-theme', moi ? 'dark' : 'light');
    try {
      localStorage.setItem('9chain-theme', moi ? 'dark' : 'light');
    } catch {
      /* Không lưu được thì vẫn đổi cho phiên này — thà đổi tạm còn hơn nút chết. */
    }
    setDark(moi);
    // Gỡ cờ ở khung hình kế tiếp, khi màu mới đã được vẽ xong.
    requestAnimationFrame(() => requestAnimationFrame(() => html.removeAttribute('data-theme-switching')));
  }

  // Trước khi biết trạng thái, vẽ nút với nhãn trung tính thay vì không vẽ gì:
  // nút biến mất rồi hiện lại làm nhảy bố cục thanh điều hướng.
  const label = dark === null ? t.common.switchToDark : dark ? t.common.switchToLight : t.common.switchToDark;

  return (
    <button
      type="button"
      onClick={doi}
      aria-label={label}
      title={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-btn border border-line-dark text-on-dark-2 hover:text-on-dark hover:bg-navy-hover"
    >
      <span aria-hidden="true">{dark ? '☀' : '☾'}</span>
    </button>
  );
}
