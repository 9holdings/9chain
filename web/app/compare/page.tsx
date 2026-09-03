import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';
import { PageHeader } from '@/components/PageHeader';
import { pageMeta } from '@/lib/seo';
import { ComparisonTable } from './ComparisonTable';

export const metadata: Metadata = pageMeta({
  title: EN.compare.title,
  desc: EN.compare.desc,
  urlPath: '/compare/',
});

export default function TrangBang() {
  return (
    <div className="khung py-10 md:py-14">
      <PageHeader group="compare" width="vua" />
      <ComparisonTable />
    </div>
  );
}
