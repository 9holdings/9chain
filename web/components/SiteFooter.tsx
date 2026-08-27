import { vi } from '@/lib/i18n/vi';
import { CHAIN } from '@/lib/chain';
import { BrandLockup } from './BrandLockup';

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="khung flex flex-col gap-3 py-8 text-sm text-body-2">
        {/* Chân trang dùng `bg-surface` — nền ĐỔI theo theme (trắng ở bản sáng,
            #131c33 ở bản tối) ⇒ logo phải đổi theo, nên `nen="theo-theme"`.
            Khác header: header luôn navy nên luôn dùng bản nền tối. */}
        <BrandLockup nen="theo-theme" cao={26} nhan={vi.chung.tenSanPham} />
        <p>{vi.chung.moTaNgan}</p>
        <p className="font-mono text-xs text-muted">
          Chain ID {CHAIN.chainId} · {CHAIN.kyHieu} · networkID {CHAIN.networkId}
        </p>
      </div>
    </footer>
  );
}
