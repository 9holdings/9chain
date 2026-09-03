'use client';

import { useEffect, useRef, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { LanguagePicker } from './LanguagePicker';
import { BrandLockup } from './BrandLockup';
import { useT } from '@/lib/i18n';
import type { Dict } from '@/lib/i18n/en';
import { explorerOrigin } from '@/lib/chain';
import { cx } from './ui';

/**
 * Thanh điều hướng. Tên component trùng với 9Scan-A1 có chủ đích — người sang lại
 * giữa hai bên không được thấy đứt gãy, và người sửa mã đọc hai repo như một.
 *
 * Trên nền navy nên vòng focus tự lật về vàng gốc (luật `.bg-navy` ở globals.css).
 */

type Item = { label: string; href: string; external?: boolean };

// `/create-chain/`, `/my-chains/`, `/compare/` là trang của bản export.
// `/chains/` do Caddy proxy sang container khác — vẫn là thẻ <a> thật như mọi mục
// khác ở đây, nên không dính bẫy `next/link` trỏ vào đường không phải route Next.
//
// Console CŨ (`/console/`) vẫn sống và vẫn là đường của người vận hành; nó rời khỏi
// thanh điều hướng khi M10.7 dọn, chứ không bị gỡ trong cùng một lượt.
// 🔴 ĐỔI TỪ HẰNG SỐ MODULE THÀNH HÀM (đa ngôn ngữ, 2026-08-27).
// Bản cũ dựng mảng này ở PHẠM VI MODULE, tức nó bị đóng băng với từ điển có mặt lúc
// tệp được nạp. Với một từ điển tĩnh thì không sao; với `useT()` thì đó là một cái
// bẫy im lặng: đổi ngôn ngữ xong CẢ TRANG lật, riêng thanh điều hướng đứng nguyên
// tiếng Anh — và không có lỗi nào báo, vì mã vẫn chạy đúng.
// Đường dẫn thì KHÔNG đổi theo ngôn ngữ (mỗi trang chỉ có một URL), nên chỉ phần
// chữ nhận `t`.
function buildItems(t: Dict): Item[] {
  return [
    { label: t.nav.home, href: '/' },
    { label: t.nav.faucet, href: '/faucet/' },
    { label: t.nav.launch, href: '/create-chain/' },
    { label: t.nav.myChains, href: '/my-chains/' },
    { label: t.nav.compare, href: '/compare/' },
    { label: t.nav.directory, href: '/chains/' },
  ];
}

export function SiteHeader() {
  const t = useT();
  const ITEMS = buildItems(t);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Esc đóng ngăn kéo, và tiêu điểm QUAY VỀ nút đã mở nó. Thiếu vế thứ hai thì
  // người đi bằng bàn phím bị ném về đầu trang mỗi lần đóng menu.
  useEffect(() => {
    if (!drawerOpen) return;
    function phim(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', phim);
    return () => document.removeEventListener('keydown', phim);
  }, [drawerOpen]);

  // Khoá cuộn nền khi ngăn kéo mở — nếu không, cuộn trên ngăn kéo sẽ cuộn trang
  // phía sau và người dùng mất chỗ đang đọc.
  useEffect(() => {
    if (!drawerOpen) return;
    const cu = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = cu;
    };
  }, [drawerOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-line-dark bg-navy">
      <div className="khung flex h-16 items-center justify-between gap-4">
        {/* Logo NGUYÊN BẢN từ bộ kit — dấu + chữ "9Chain" đã nằm trong lockup, nên
            KHÔNG viết lại chữ "9Chain" bằng font giao diện cạnh nó nữa (trước đây
            header ghép tay `◆` + chữ; đó là chế lại logo).
            Thanh này luôn `bg-navy` ở CẢ HAI theme ⇒ luôn dùng bản nền tối.
            Chip "A1" giữ nguyên: nó là nhãn phiên bản mạng, không thuộc logo. */}
        <a href="/" className="flex items-center gap-2">
          {/* 🔴 CAO 28 → 36 (`2026-09-03`, David: "logo nhỏ quá, nhìn như bị lỗi").
              Con số đo được, không phải gu: trang chính `www.9chain.org` đặt lockup
              của nó ở **104 × 27 px** trong một thanh cao 57 px. Ở đây thanh cao 64
              px (`h-16`), và lockup của bộ kit có tỉ lệ 360:128 — tức nó gói NHIỀU
              lề trong hơn bản của trang chính, nên cùng một chiều CAO cho ra chữ
              nhỏ hơn hẳn. Khớp theo thứ mắt thật sự đọc — bề ngang và cỡ chữ:
                cao 28 → rộng 78,8 px · chữ 12,5 px   (bản cũ, nhỏ hơn trang chính)
                cao 36 → rộng 101,3 px · chữ 16,0 px  ≈ 104 px của www.9chain.org
              ĐỪNG sửa bằng cách nắn lại `viewBox` hay giãn chữ trong `BrandLockup` —
              hình học ở đó là bộ kit của David, xem chú thích đầu tệp đó. Chỉ đổi
              chiều cao hiển thị. */}
          <BrandLockup background="dark" height={36} label={t.common.productName} className="flex-none" />
          <span className="rounded-chip border border-line-dark-2 px-1.5 py-0.5 font-sans text-[11px] font-semibold text-gold-muted">
            A1
          </span>
        </a>

        <nav aria-label={t.nav.home} className="hidden items-center gap-1 md:flex">
          {ITEMS.map((m) => (
            <a
              key={m.href}
              href={m.href}
              className="rounded-btn px-3 py-2 text-sm font-semibold text-on-dark-2 hover:bg-navy-hover hover:text-on-dark"
            >
              {m.label}
            </a>
          ))}
          <a
            href={explorerOrigin()}
            target="_blank"
            rel="noreferrer"
            aria-label={t.nav.explorerAria}
            className="rounded-btn px-3 py-2 text-sm font-semibold text-on-dark-2 hover:bg-navy-hover hover:text-on-dark"
          >
            {t.nav.explorer}
            <span aria-hidden="true"> ↗</span>
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <LanguagePicker />
          <ThemeToggle />
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setDrawerOpen((v) => !v)}
            aria-expanded={drawerOpen}
            aria-controls="ngan-dieu-huong"
            aria-label={drawerOpen ? t.common.closeMenu : t.common.openMenu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-btn border border-line-dark text-on-dark-2 hover:bg-navy-hover md:hidden"
          >
            <span aria-hidden="true">{drawerOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* Ngăn kéo điện thoại. Ẩn bằng `hidden` chứ không bằng unmount để
          `aria-controls` luôn trỏ tới một phần tử có thật. */}
      <div
        id="ngan-dieu-huong"
        ref={drawerRef}
        hidden={!drawerOpen}
        className={cx('border-t border-line-dark bg-navy-panel md:hidden')}
      >
        <nav aria-label={t.common.openMenu} className="khung flex flex-col py-2">
          {ITEMS.map((m) => (
            <a
              key={m.href}
              href={m.href}
              className="rounded-btn px-3 py-3 text-base font-semibold text-on-dark hover:bg-navy-hover"
            >
              {m.label}
            </a>
          ))}
          <a
            href={explorerOrigin()}
            target="_blank"
            rel="noreferrer"
            className="rounded-btn px-3 py-3 text-base font-semibold text-on-dark hover:bg-navy-hover"
          >
            {t.nav.explorer}
            <span aria-hidden="true"> ↗</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
