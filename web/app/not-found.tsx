import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';
import { NoiDungKhongThay } from './NotFoundContent';

/**
 * 🔴 `noindex` LÀ PHẦN QUAN TRỌNG NHẤT CỦA KHỐI NÀY, KHÔNG PHẢI TIÊU ĐỀ.
 * Caddy trả trang này kèm `replace_status 404`, nên bò tìm kiếm đã hiểu đúng. Nhưng
 * hai tầng nói cùng một điều thì rẻ, còn một tầng nói sai thì đắt: nếu ai đó sau này
 * gỡ `replace_status` (hoặc phục vụ `/404.html` trực tiếp, khi đó nginx trả **200**)
 * thì `noindex` là thứ duy nhất còn ngăn trang lỗi vào chỉ mục tìm kiếm.
 *
 * Tiêu đề riêng cũng cần: không có nó, trang này kế thừa `og:*` của trang chủ, và
 * `test/seo.test.ts` bắt đúng — `/` và `/404/` dùng chung một `og:title`.
 */
export const metadata: Metadata = {
  title: `${EN.notFound.title.replace(' [?]', '')} — ${EN.common.productName}`,
  description: EN.notFound.desc.replace(/ \[\?\]/g, ''),
  robots: { index: false, follow: true },
  openGraph: {
    type: 'website',
    siteName: EN.common.productName,
    title: `${EN.notFound.title.replace(' [?]', '')} — ${EN.common.productName}`,
    description: EN.notFound.desc.replace(/ \[\?\]/g, ''),
  },
};

/**
 * Trang 404 (Đ1-2, 2026-08-27).
 *
 * ═══ VÌ SAO TRANG NÀY ĐÁNG MỘT VÉ RIÊNG ═══
 * Đo trước khi vá: mọi URL sai trên `a1.9chain.org` trả vỏ 404 của Blockscout —
 * 75.964 byte, tiếng Anh, `<title>` rỗng, `grep -ci 9chain` = **0**, và **không một
 * `href` nào** dẫn về site. Ba đường của chính mình (`/create-chain`, `/my-chains`,
 * `/compare` thiếu gạch chéo) rơi vào đó, mà nút vàng chính của trang chủ trỏ đúng
 * một trong ba. Cả hai vế đã vá trong cùng lượt Caddy (Đ1-1).
 *
 * 🔴 PHẦN ĐẮT NHẤT KHÔNG NẰM Ở ĐÂY MÀ Ở CADDY. Next xuất tĩnh sinh `out/404.html`,
 * nhưng nginx phục vụ tệp đó chỉ khi Caddy ĐỊNH TUYẾN tới. Mà 404 này do upstream
 * (Blockscout) trả về, nên `handle_errors` không bắt được — phải dùng
 * `handle_response` + `replace_status 404`. Xem khối cuối `local-net/deploy/Caddyfile`.
 * ⇒ Sửa một mình tệp này thì KHÔNG có gì đổi trên mạng công khai.
 *
 * 🔴 TRANG TĨNH THUẦN — KHÔNG `fetch`, KHÔNG hook, KHÔNG `'use client'`.
 * Nó là chỗ người ta rơi vào khi thứ khác đã hỏng; nó phải là trang ÍT có khả năng
 * hỏng nhất trong cả site. Đừng thêm số liệu sống vào đây.
 *
 * Điều hướng dùng `<a>` chứ không `next/link`: `check-static-export.mjs` bắt buộc
 * mọi đường do edge phục vụ đều đi bằng thẻ `<a>` — và đây đúng là một trong số đó.
 */
export default function KhongThay() {
  return <NoiDungKhongThay />;
}
