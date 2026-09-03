import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';
import { PageHeader } from '@/components/PageHeader';
import { pageMeta } from '@/lib/seo';
import { MyChainsScreen } from './MyChainsScreen';

export const metadata: Metadata = pageMeta({
  tieuDe: EN.myChains.title,
  moTa: EN.myChains.desc,
  duong: '/my-chains/',
});

export default function TrangChainCuaToi() {
  return (
    <div className="khung py-10 md:py-14">
      <PageHeader nhom="myChains" />
      <MyChainsScreen />
    </div>
  );
}
