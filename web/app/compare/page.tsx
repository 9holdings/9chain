import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';
import { DauTrang } from '@/components/DauTrang';
import { trangMeta } from '@/lib/seo';
import { ComparisonTable } from './ComparisonTable';

export const metadata: Metadata = trangMeta({
  tieuDe: EN.bang.tieuDe,
  moTa: EN.bang.moTa,
  duong: '/compare/',
});

export default function TrangBang() {
  return (
    <div className="khung py-10 md:py-14">
      <DauTrang nhom="bang" rong="vua" />
      <ComparisonTable />
    </div>
  );
}
