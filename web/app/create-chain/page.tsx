import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';
import { DauTrang } from '@/components/DauTrang';
import { trangMeta } from '@/lib/seo';
import { CreateChainScreen } from './CreateChainScreen';

export const metadata: Metadata = trangMeta({
  tieuDe: EN.deChain.tieuDe,
  moTa: EN.deChain.moTa,
  duong: '/create-chain/',
});

export default function TrangDeChain() {
  return (
    <div className="khung py-10 md:py-14">
      <DauTrang nhom="deChain" />
      <CreateChainScreen />
    </div>
  );
}
