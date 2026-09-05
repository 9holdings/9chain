import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';
import { pageMeta } from '@/lib/seo';
import { DocsContent } from './DocsContent';

/**
 * `/docs/` — the documentation hub this project did not have.
 *
 * Measured 2026-08-27 and still true until today: `https://9chain.org/docs/` returns 404 in
 * all three shapes, so there was NO address on the internet that meant "9Chain documentation".
 * The footer deliberately carried no documentation entry rather than point at that 404, and
 * the 9Scan-A1 home page had two dead links into it.
 *
 * The guides themselves are complete and public — they were simply unreachable unless you
 * already knew to browse the repository, which is precisely the person who does not need a
 * documentation page.
 */
export const metadata: Metadata = pageMeta({
  title: EN.docs.title,
  desc: EN.docs.desc,
  urlPath: '/docs/',
});

export default function Trang() {
  return <DocsContent />;
}
