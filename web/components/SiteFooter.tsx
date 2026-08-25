import { vi } from '@/lib/i18n/vi';
import { CHAIN } from '@/lib/chain';

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="khung flex flex-col gap-2 py-8 text-sm text-body-2">
        <p className="font-display font-semibold text-ink">{vi.chung.tenSanPham}</p>
        <p>{vi.chung.moTaNgan}</p>
        <p className="font-mono text-xs text-muted">
          Chain ID {CHAIN.chainId} · {CHAIN.kyHieu} · networkID {CHAIN.networkId}
        </p>
      </div>
    </footer>
  );
}
