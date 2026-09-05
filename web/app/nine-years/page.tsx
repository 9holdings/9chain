import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';
import { pageMeta } from '@/lib/seo';
import { NineYearsContent } from './NineYearsContent';

/**
 * `/nine-years/` — what this network is for.
 *
 * Until today the site described the product ("an L1 of your own, in about five minutes") and
 * stopped there. A visitor had no way to learn that this is step one of a nine-year plan —
 * the single thing that distinguishes A1 from any other testnet faucet. The manifesto existed,
 * was finished, and was reachable only by browsing a repository.
 *
 * The page carries the argument in thirty languages and hands over the full document at the
 * end; `/docs/` owns the links to it.
 */
export const metadata: Metadata = pageMeta({
  title: EN.nineYears.title,
  desc: EN.nineYears.lede,
  urlPath: '/nine-years/',
});

export default function Trang() {
  return <NineYearsContent />;
}
