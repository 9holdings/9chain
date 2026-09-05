import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';
import { pageMeta } from '@/lib/seo';
import { CreateChainScreen } from './CreateChainScreen';

export const metadata: Metadata = pageMeta({
  title: EN.launch.title,
  desc: EN.launch.desc,
  urlPath: '/create-chain/',
});

export default function TrangDeChain() {
  return (
    <div className="khung py-10 md:py-14">
      {/* The `<h1>` header is rendered INSIDE the screen since 2026-09-05 — see `components/PageHeader.tsx`. */}
      <CreateChainScreen />
    </div>
  );
}
