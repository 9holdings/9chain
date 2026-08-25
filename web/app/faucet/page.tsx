import type { Metadata } from 'next';
import { vi } from '@/lib/i18n/vi';
import { FaucetForm } from './FaucetForm';

export const metadata: Metadata = {
  title: `${vi.faucet.tieuDe} — ${vi.chung.tenSanPham}`,
  description: vi.faucet.moTa,
  alternates: { canonical: '/faucet/' },
};

export default function TrangFaucet() {
  return (
    <div className="khung py-10 md:py-14">
      <header className="max-w-2xl">
        <h1 className="font-display text-2xl font-extrabold text-ink md:text-3xl">{vi.faucet.tieuDe}</h1>
        <p className="mt-3 text-base text-body">{vi.faucet.moTa}</p>
      </header>
      <FaucetForm />
    </div>
  );
}
