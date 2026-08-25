import type { Metadata } from 'next';
import { vi } from '@/lib/i18n/vi';
import { ManDeChain } from './ManDeChain';

export const metadata: Metadata = {
  title: `${vi.deChain.tieuDe} — ${vi.chung.tenSanPham}`,
  description: vi.deChain.moTa,
  alternates: { canonical: '/de-chain/' },
};

export default function TrangDeChain() {
  return (
    <div className="khung py-10 md:py-14">
      <header className="max-w-2xl">
        <h1 className="font-display text-2xl font-extrabold text-ink md:text-3xl">{vi.deChain.tieuDe}</h1>
        <p className="mt-3 text-base text-body">{vi.deChain.moTa}</p>
      </header>
      <ManDeChain />
    </div>
  );
}
