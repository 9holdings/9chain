import type { Metadata } from 'next';
import { vi } from '@/lib/i18n/vi';
import { ComparisonTable } from './ComparisonTable';

export const metadata: Metadata = {
  title: `${vi.bang.tieuDe} — ${vi.chung.tenSanPham}`,
  description: vi.bang.moTa,
  alternates: { canonical: '/compare/' },
};

export default function TrangBang() {
  return (
    <div className="khung py-10 md:py-14">
      <header className="max-w-3xl">
        <h1 className="font-display text-2xl font-extrabold text-ink md:text-3xl">{vi.bang.tieuDe}</h1>
        <p className="mt-3 text-base text-body">{vi.bang.moTa}</p>
      </header>
      <ComparisonTable />
    </div>
  );
}
