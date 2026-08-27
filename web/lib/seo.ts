import type { Metadata } from 'next';
import { vi } from '@/lib/i18n/vi';

/**
 * Thẻ chia sẻ cho từng trang (Đ1-5, 2026-08-27).
 *
 * ═══ LỖI ĐANG VÁ, VÀ VÌ SAO KHÔNG CỔNG NÀO BẮT ĐƯỢC ═══
 * Đo `27/08`: `og:title`, `og:description`, `twitter:*` **giống hệt nhau trên cả 6
 * trang** — đều là nội dung của trang chủ. Từng trang có khai `title`/`description`
 * riêng, nhưng KHÔNG khai `openGraph`, mà `openGraph` của `layout.tsx` thì không tự
 * kế thừa `title` của trang con: Next lấy nguyên khối `openGraph` gần nhất.
 *
 * Cái giá cụ thể: dán `/re-genesis/` vào một nhóm chat thì thứ hiện lên là lời mời
 * *"đẻ chain của bạn mất khoảng ba phút"* — NGƯỢC HẲN điều trang muốn nói, đúng
 * tuần cần nó nhất.
 *
 * 🔴 ĐÂY LÀ CA "XANH GIẢ" KINH ĐIỂN, ghi lại vì nó sẽ tái diễn ở chỗ khác:
 * mọi cổng kiểm hiện có đo `<title>` — và `<title>` thì ĐÃ riêng từ lâu. Phép đo
 * đúng đại lượng nằm ở `test/seo.test.ts`: nó đọc từng `index.html` trong `out/`
 * và đòi `og:title` KHÁC nhau giữa các trang.
 * Cổng đó đáng tin vì **hôm nay nó ĐỎ** — đã chạy thử trên bản build cũ:
 *   ✗ og:title bị dùng chung  ·  ✗ /compare/ có og:url = "https://a1.9chain.org/"
 *
 * ⚠️ Đừng viết đường dẫn dạng `out` + `/` + hai dấu sao + `/` trong chú thích KHỐI:
 * cặp ký tự đó đóng luôn khối chú thích, và lỗi hiện ra ở tận dòng dưới nên rất
 * khó lần. Bản đầu của tệp này dính đúng thế.
 *
 * Dùng: `export const metadata = trangMeta({ tieuDe, moTa, duong })`.
 * Không gõ lại chuỗi ở lời gọi — truyền đúng biến đã dùng cho `title`.
 */
export function trangMeta({
  tieuDe,
  moTa,
  duong,
}: {
  /** Tiêu đề TRẦN của trang, chưa nối tên sản phẩm. */
  tieuDe: string;
  moTa: string;
  /** Đường dẫn canonical, luôn có gạch chéo cuối. Ví dụ `/faucet/`. */
  duong: string;
}): Metadata {
  // Dấu `[?]` là cơ chế duyệt giọng NỘI BỘ (xem đầu `vi.ts`). Nó không được đi ra
  // thẻ meta — nơi đó chữ bị máy khác đọc và hiện lại nguyên văn trong thẻ chia sẻ,
  // ngoài tầm với của mọi lượt sửa sau này. Cắt ở ĐÂY là hợp lệ; cắt ở tầng render
  // của trang thì KHÔNG — xem mục "cố ý không làm" số 15 trong lộ trình.
  const sach = (s: string) => s.replace(/ \[\?\]/g, '');
  const t = `${sach(tieuDe)} — ${vi.chung.tenSanPham}`;
  const d = sach(moTa);

  return {
    title: t,
    description: d,
    alternates: { canonical: duong },
    openGraph: { type: 'website', siteName: vi.chung.tenSanPham, title: t, description: d, url: duong },
    twitter: { card: 'summary_large_image', title: t, description: d },
  };
}
