import type { Metadata } from 'next';
import { vi } from '@/lib/i18n/vi';

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
  title: `${vi.khongThay.tieuDe.replace(' [?]', '')} — ${vi.chung.tenSanPham}`,
  description: vi.khongThay.moTa.replace(/ \[\?\]/g, ''),
  robots: { index: false, follow: true },
  openGraph: {
    type: 'website',
    siteName: vi.chung.tenSanPham,
    title: `${vi.khongThay.tieuDe.replace(' [?]', '')} — ${vi.chung.tenSanPham}`,
    description: vi.khongThay.moTa.replace(/ \[\?\]/g, ''),
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
  const t = vi.khongThay;
  return (
    <div className="khung flex min-h-[60vh] flex-col justify-center py-14 md:py-20">
      <div className="max-w-xl">
        <p className="font-mono text-sm font-bold tracking-[0.18em] text-muted">{t.ma}</p>
        <h1 className="mt-3 font-display text-2xl font-extrabold text-ink md:text-3xl">{t.tieuDe}</h1>
        <p className="mt-4 text-base text-body">{t.moTa}</p>
        <p className="mt-2 text-base text-body">{t.timGiaoDich}</p>

        <p className="mt-8 text-sm font-semibold text-muted">{t.dayLaGi}</p>
        <nav aria-label={t.nhanNav} className="mt-3 flex flex-wrap gap-3">
          <a
            href="/"
            className="tap-target inline-flex items-center rounded-[10px] bg-gold px-4 py-2.5 font-semibold text-navy transition-colors hover:bg-gold-hover"
          >
            {t.veTrangChu}
          </a>
          <a
            href="/faucet/"
            className="tap-target inline-flex items-center rounded-[10px] border border-line px-4 py-2.5 font-semibold text-ink transition-colors hover:border-gold"
          >
            {t.diFaucet}
          </a>
          <a
            href="/create-chain/"
            className="tap-target inline-flex items-center rounded-[10px] border border-line px-4 py-2.5 font-semibold text-ink transition-colors hover:border-gold"
          >
            {t.diDeChain}
          </a>
        </nav>
      </div>
    </div>
  );
}
