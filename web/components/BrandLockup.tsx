import { Outfit } from 'next/font/google';

/**
 * Logo khoá ngang 9Chain — dấu + chữ, **nguyên bản từ bộ kit của David**
 * (`9chain-lockup-dark.svg` / `9chain-lockup-light-transparent.svg`, đưa
 * `2026-08-27`). Bản gốc nằm ở `public/brand/`.
 *
 * ═══ 🔴 KHÔNG CHẾ LẠI. ĐÂY LÀ YÊU CẦU CỦA DAVID, KHÔNG PHẢI GU CỦA TÔI. ═══
 * Giữ NGUYÊN: hình học, tỉ lệ, `viewBox 0 0 360 128`, `stroke-width 6.5`,
 * `font-size 57`, `letter-spacing -0.01em`, và **màu**:
 *
 *     dấu       #F5C542   — mọi nền
 *     chữ       #FFFFFF   — trên nền TỐI
 *     chữ       #0D1733   — trên nền SÁNG
 *
 * Hai màu chữ đó là thứ bộ kit quy định cho hai nền, nên đổi chữ theo theme
 * KHÔNG phải là chế lại — đó chính là cách dùng đúng của kit.
 *
 * ⚠️ `#F5C542` KHÁC `--color-gold` (`#ffcb24`) của hệ token, và điều đó có chủ ý
 * (David chốt `2026-08-27`). Đừng "dọn dẹp" bằng cách cho dấu ăn theo token —
 * xem `docs/BRAND-AUDIT-2026-08-27.md`.
 *
 * ═══ 🔴 VÌ SAO PHẢI NẠP FONT `Outfit` Ở ĐÂY ═══
 * SVG trong kit khai `font-family="Outfit, Arial, sans-serif"`. Outfit **không
 * có sẵn trên máy hầu hết người dùng**, nên nếu chỉ chép SVG vào là chữ rơi về
 * **Arial** — logo sai font mà không có lỗi nào báo. Đó là lý do component này
 * tồn tại thay vì một thẻ `<img src="/brand/....svg">`: `<img>` render SVG trong
 * ngữ cảnh riêng và **không** với tới được font của trang.
 *
 * ⚠️ NẠP QUA `.style.fontFamily`, TUYỆT ĐỐI KHÔNG QUA BIẾN CSS.
 * Ba font giao diện của site hiện KHÔNG chạy vì đúng cái bẫy đó: `@theme` đổ
 * `--font-sans: var(--font-instrument)` vào `:root` (`<html>`) trong khi lớp
 * `__variable_*` của `next/font` nằm ở `<body>` ⇒ `var()` không giải được ⇒ cả
 * khai báo thành guaranteed-invalid. Ở đây `outfit.style.fontFamily` là một
 * chuỗi họ chữ THẬT, đặt thẳng vào `style` của phần tử — không đi qua `:root`,
 * nên không dính bẫy. Xem `docs/BRAND-AUDIT-2026-08-27.md` mục B.
 *
 * Và vì lý do đó, tệp này **không** đụng `tokens.css` (có vân tay chống trôi
 * lệch) lẫn `--font-*`. Nó độc lập với cụm B1+B2 đang chờ David chốt.
 */

// `subsets: ['latin']` là đủ và đúng: chữ trong logo là "9Chain" — toàn ASCII.
// Đây là font của LOGO, không phải font giao diện; nó không thay thế gì cả.
const outfit = Outfit({ subsets: ['latin'], weight: ['700'], display: 'swap' });

/** Màu chữ theo nền, đúng như bộ kit quy định. */
export const CHU_TREN_NEN_TOI = '#FFFFFF';
export const CHU_TREN_NEN_SANG = '#0D1733';
/** Vàng của dấu — giống nhau ở mọi nền. */
export const VANG_DAU = '#F5C542';

type Props = {
  /**
   * `'toi'`  — nền luôn tối (header của site luôn là `bg-navy`) ⇒ chữ trắng.
   * `'sang'` — nền luôn sáng ⇒ chữ navy.
   * `'theo-theme'` — chữ đổi theo `html[data-theme]`, qua biến `--mau-chu-logo`
   *   khai trong `globals.css`. Dùng cho chỗ nền tự đổi (chân trang).
   */
  nen?: 'toi' | 'sang' | 'theo-theme';
  /** Chiều cao hiển thị, px. Tỉ lệ khoá ở 360:128 nên rộng = cao × 2,8125. */
  cao?: number;
  className?: string;
  /**
   * Chữ thay thế cho trình đọc màn hình. Để rỗng khi cạnh logo đã có chữ
   * "9Chain" hiện ra rồi — đọc lên hai lần là tệ hơn im lặng.
   */
  nhan?: string;
};

export function BrandLockup({ nen = 'theo-theme', cao = 30, className, nhan }: Props) {
  const mauChu =
    nen === 'toi' ? CHU_TREN_NEN_TOI : nen === 'sang' ? CHU_TREN_NEN_SANG : 'var(--mau-chu-logo)';

  return (
    <svg
      viewBox="0 0 360 128"
      height={cao}
      width={cao * (360 / 128)}
      className={className}
      role={nhan ? 'img' : undefined}
      aria-label={nhan || undefined}
      aria-hidden={nhan ? undefined : 'true'}
      focusable="false"
    >
      {nhan ? <title>{nhan}</title> : null}
      {/* Dấu — nguyên văn từ kit, không đổi một con số nào. */}
      <g transform="translate(16 16)">
        <g fill="none" stroke={VANG_DAU} strokeWidth="6.5">
          <polygon points="48,14 77.4,65 18.6,65" transform="rotate(20 48 48)" />
          <polygon points="48,14 77.4,65 18.6,65" transform="rotate(60 48 48)" />
          <polygon points="48,14 77.4,65 18.6,65" transform="rotate(100 48 48)" />
        </g>
      </g>
      <text
        x="144"
        y="64"
        fontWeight="700"
        fontSize="57"
        letterSpacing="-0.01em"
        fill={mauChu}
        textAnchor="start"
        dominantBaseline="central"
        // Xem chú thích đầu tệp: đặt thẳng vào `style`, không qua biến CSS.
        style={{ fontFamily: outfit.style.fontFamily }}
      >
        9Chain
      </text>
    </svg>
  );
}
