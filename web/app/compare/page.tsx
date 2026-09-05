import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';
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
      {/* The `<h1>` header is rendered INSIDE the screen since 2026-09-05 — see `components/PageHeader.tsx`. */}
      <ComparisonTable />
    </div>
  );
}
