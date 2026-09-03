import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';
import { PageHeader } from '@/components/PageHeader';
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
      <PageHeader group="launch" />
      <CreateChainScreen />
    </div>
  );
}
