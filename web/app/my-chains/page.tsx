import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';
import { DauTrang } from '@/components/DauTrang';
import { trangMeta } from '@/lib/seo';
import { MyChainsScreen } from './MyChainsScreen';

export const metadata: Metadata = trangMeta({
  tieuDe: EN.chainCuaToi.tieuDe,
  moTa: EN.chainCuaToi.moTa,
  duong: '/my-chains/',
});

export default function TrangChainCuaToi() {
  return (
    <div className="khung py-10 md:py-14">
      <DauTrang nhom="chainCuaToi" />
      <MyChainsScreen />
    </div>
  );
}
