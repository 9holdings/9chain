import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';
import { PageHeader } from '@/components/PageHeader';
import { pageMeta } from '@/lib/seo';
import { CreateChainScreen } from './CreateChainScreen';

export const metadata: Metadata = pageMeta({
  tieuDe: EN.launch.title,
  moTa: EN.launch.desc,
  duong: '/create-chain/',
});

export default function TrangDeChain() {
  return (
    <div className="khung py-10 md:py-14">
      <PageHeader nhom="launch" />
      <CreateChainScreen />
    </div>
  );
}
