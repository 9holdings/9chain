import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';
import { DauTrang } from '@/components/DauTrang';
import { trangMeta } from '@/lib/seo';
import { CreateChainScreen } from './CreateChainScreen';

export const metadata: Metadata = trangMeta({
  tieuDe: EN.launch.title,
  moTa: EN.launch.desc,
  duong: '/create-chain/',
});

export default function TrangDeChain() {
  return (
    <div className="khung py-10 md:py-14">
      <DauTrang nhom="launch" />
      <CreateChainScreen />
    </div>
  );
}
