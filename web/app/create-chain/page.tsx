import type { Metadata } from 'next';
import { vi } from '@/lib/i18n/vi';
import { trangMeta } from '@/lib/seo';
import { CreateChainScreen } from './CreateChainScreen';

export const metadata: Metadata = trangMeta({
  tieuDe: vi.deChain.tieuDe,
  moTa: vi.deChain.moTa,
  duong: '/create-chain/',
});

export default function TrangDeChain() {
  return (
    <div className="khung py-10 md:py-14">
      <header className="max-w-2xl">
        <h1 className="font-display text-2xl font-extrabold text-ink md:text-3xl">{vi.deChain.tieuDe}</h1>
        <p className="mt-3 text-base text-body">{vi.deChain.moTa}</p>
      </header>
      <CreateChainScreen />
    </div>
  );
}
