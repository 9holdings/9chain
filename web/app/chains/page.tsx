import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';
import { pageMeta } from '@/lib/seo';
import { DirectoryContent } from './DirectoryContent';

/**
 * `/chains/` — the L1 directory.
 *
 * 🔴 THIS ROUTE REPLACES A HAND-WRITTEN HTML PAGE (2026-09-03). The page used to be
 * served by its own nginx container (`9chain-a1-chains`) from
 * `local-net/chains/index.html`, which is why it was Vietnamese-only and carried its
 * own copy of the header and footer.
 *
 * ⚠️ THE CONTAINER STAYS, AND SO DOES ITS CADDY ROUTE. It still serves
 * `/chains/data/*.json` — files the CONSOLE process writes into that directory. The
 * Caddyfile therefore matches `/chains/data/*` to the container BEFORE `/chains/*`
 * reaches the static export. Order matters: put the page rule first and the data files
 * 404, which would empty this page while every HTTP check stayed green.
 */
export const metadata: Metadata = pageMeta({
  title: EN.nav.directory,
  desc: EN.directory.lede,
  urlPath: '/chains/',
});

export default function Trang() {
  return (
    // 🔴 Do NOT put an `<h1>` here. This is a server component, it runs at BUILD time, so every
    // word written here is frozen in English for all 30 languages. The first version of this page
    // did exactly that and it was measured immediately: the content rendered in Arabic while the
    // `<h1>` still read "L1 directory". The heading lives in `DirectoryContent` (client) with its lead line.
    <div className="khung py-10 md:py-14">
      <DirectoryContent />
    </div>
  );
}
