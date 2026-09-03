import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';
import { trangMeta } from '@/lib/seo';
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
export const metadata: Metadata = trangMeta({
  tieuDe: EN.nav.directory,
  moTa: EN.directory.lede,
  duong: '/chains/',
});

export default function Trang() {
  return (
    // 🔴 KHÔNG đặt `<h1>` ở đây. Đây là server component, nó chạy LÚC BUILD, nên mọi
    // chữ viết ở đây bị đóng băng ở tiếng Anh cho cả 30 ngôn ngữ. Bản đầu của trang
    // này làm đúng thế và đo được ngay: nội dung hiện ra tiếng Ả Rập, `<h1>` vẫn
    // "L1 directory". Tiêu đề nằm trong `DirectoryContent` (client) cùng câu dẫn.
    <div className="khung py-10 md:py-14">
      <DirectoryContent />
    </div>
  );
}
