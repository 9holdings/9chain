import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';
import { PageHeader } from '@/components/PageHeader';
import { pageMeta } from '@/lib/seo';
import { MyChainsScreen } from './MyChainsScreen';

export const metadata: Metadata = pageMeta({
  title: EN.myChains.title,
  desc: EN.myChains.desc,
  urlPath: '/my-chains/',
});

export default function TrangChainCuaToi() {
  return (
    <div className="khung py-10 md:py-14">
      <PageHeader group="myChains" />
      <MyChainsScreen />
    </div>
  );
}
