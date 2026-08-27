'use client';

import { useEffect, useRef, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { BrandLockup } from './BrandLockup';
import { vi } from '@/lib/i18n/vi';
import { explorerGoc } from '@/lib/chain';
import { gop } from './ui';

/**
 * Thanh điều hướng. Tên component trùng với 9Scan-A1 có chủ đích — người sang lại
 * giữa hai bên không được thấy đứt gãy, và người sửa mã đọc hai repo như một.
 *
 * Trên nền navy nên vòng focus tự lật về vàng gốc (luật `.bg-navy` ở globals.css).
 */

type Muc = { chu: string; href: string; ngoai?: boolean };

// `/create-chain/`, `/my-chains/`, `/compare/` là trang của bản export.
// `/chains/` do Caddy proxy sang container khác — vẫn là thẻ <a> thật như mọi mục
// khác ở đây, nên không dính bẫy `next/link` trỏ vào đường không phải route Next.
//
// Console CŨ (`/console/`) vẫn sống và vẫn là đường của người vận hành; nó rời khỏi
// thanh điều hướng khi M10.7 dọn, chứ không bị gỡ trong cùng một lượt.
const MUC: Muc[] = [
  { chu: vi.dieuHuong.trangChu, href: '/' },
  { chu: vi.dieuHuong.faucet, href: '/faucet/' },
  { chu: vi.dieuHuong.console, href: '/create-chain/' },
  { chu: vi.dieuHuong.chainCuaToi, href: '/my-chains/' },
  { chu: vi.dieuHuong.bang, href: '/compare/' },
  { chu: vi.dieuHuong.danhBa, href: '/chains/' },
];

export function SiteHeader() {
  const [moNgan, datMoNgan] = useState(false);
  const nutRef = useRef<HTMLButtonElement>(null);
  const nganRef = useRef<HTMLDivElement>(null);

  // Esc đóng ngăn kéo, và tiêu điểm QUAY VỀ nút đã mở nó. Thiếu vế thứ hai thì
  // người đi bằng bàn phím bị ném về đầu trang mỗi lần đóng menu.
  useEffect(() => {
    if (!moNgan) return;
    function phim(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        datMoNgan(false);
        nutRef.current?.focus();
      }
    }
    document.addEventListener('keydown', phim);
    return () => document.removeEventListener('keydown', phim);
  }, [moNgan]);

  // Khoá cuộn nền khi ngăn kéo mở — nếu không, cuộn trên ngăn kéo sẽ cuộn trang
  // phía sau và người dùng mất chỗ đang đọc.
  useEffect(() => {
    if (!moNgan) return;
    const cu = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = cu;
    };
  }, [moNgan]);

  return (
    <header className="sticky top-0 z-40 border-b border-line-dark bg-navy">
      <div className="khung flex h-16 items-center justify-between gap-4">
        {/* Logo NGUYÊN BẢN từ bộ kit — dấu + chữ "9Chain" đã nằm trong lockup, nên
            KHÔNG viết lại chữ "9Chain" bằng font giao diện cạnh nó nữa (trước đây
            header ghép tay `◆` + chữ; đó là chế lại logo).
            Thanh này luôn `bg-navy` ở CẢ HAI theme ⇒ luôn dùng bản nền tối.
            Chip "A1" giữ nguyên: nó là nhãn phiên bản mạng, không thuộc logo. */}
        <a href="/" className="flex items-center gap-2">
          <BrandLockup nen="toi" cao={28} nhan={vi.chung.tenSanPham} className="flex-none" />
          <span className="rounded-chip border border-line-dark-2 px-1.5 py-0.5 font-sans text-[11px] font-semibold text-gold-muted">
            A1
          </span>
        </a>

        <nav aria-label={vi.dieuHuong.trangChu} className="hidden items-center gap-1 md:flex">
          {MUC.map((m) => (
            <a
              key={m.href}
              href={m.href}
              className="rounded-btn px-3 py-2 text-sm font-semibold text-on-dark-2 hover:bg-navy-hover hover:text-on-dark"
            >
              {m.chu}
            </a>
          ))}
          <a
            href={explorerGoc()}
            target="_blank"
            rel="noreferrer"
            aria-label={vi.dieuHuong.banGiao}
            className="rounded-btn px-3 py-2 text-sm font-semibold text-on-dark-2 hover:bg-navy-hover hover:text-on-dark"
          >
            {vi.dieuHuong.explorer}
            <span aria-hidden="true"> ↗</span>
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            ref={nutRef}
            type="button"
            onClick={() => datMoNgan((v) => !v)}
            aria-expanded={moNgan}
            aria-controls="ngan-dieu-huong"
            aria-label={moNgan ? vi.chung.dongMenu : vi.chung.moMenu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-btn border border-line-dark text-on-dark-2 hover:bg-navy-hover md:hidden"
          >
            <span aria-hidden="true">{moNgan ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* Ngăn kéo điện thoại. Ẩn bằng `hidden` chứ không bằng unmount để
          `aria-controls` luôn trỏ tới một phần tử có thật. */}
      <div
        id="ngan-dieu-huong"
        ref={nganRef}
        hidden={!moNgan}
        className={gop('border-t border-line-dark bg-navy-panel md:hidden')}
      >
        <nav aria-label={vi.chung.moMenu} className="khung flex flex-col py-2">
          {MUC.map((m) => (
            <a
              key={m.href}
              href={m.href}
              className="rounded-btn px-3 py-3 text-base font-semibold text-on-dark hover:bg-navy-hover"
            >
              {m.chu}
            </a>
          ))}
          <a
            href={explorerGoc()}
            target="_blank"
            rel="noreferrer"
            className="rounded-btn px-3 py-3 text-base font-semibold text-on-dark hover:bg-navy-hover"
          >
            {vi.dieuHuong.explorer}
            <span aria-hidden="true"> ↗</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
