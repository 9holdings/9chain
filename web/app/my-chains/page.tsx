import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';
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
      {/* The `<h1>` header is rendered INSIDE the screen since 2026-09-05 — see `components/PageHeader.tsx`. */}
      <MyChainsScreen />
    </div>
  );
}
