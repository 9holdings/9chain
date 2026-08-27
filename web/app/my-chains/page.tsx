import type { Metadata } from 'next';
import { vi } from '@/lib/i18n/vi';
import { trangMeta } from '@/lib/seo';
import { MyChainsScreen } from './MyChainsScreen';

export const metadata: Metadata = trangMeta({
  tieuDe: vi.chainCuaToi.tieuDe,
  moTa: vi.chainCuaToi.moTa,
  duong: '/my-chains/',
});

export default function TrangChainCuaToi() {
  return (
    <div className="khung py-10 md:py-14">
      <header className="max-w-2xl">
        <h1 className="font-display text-2xl font-extrabold text-ink md:text-3xl">
          {vi.chainCuaToi.tieuDe}
        </h1>
        <p className="mt-3 text-base text-body">{vi.chainCuaToi.moTa}</p>
      </header>
      <MyChainsScreen />
    </div>
  );
}
