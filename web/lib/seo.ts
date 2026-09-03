import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';

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
 * 🔴 DÙNG `EN` TĨNH, KHÔNG DÙNG `useT()` — và đó KHÔNG phải thiếu sót.
 * `metadata` được Next sinh lúc BUILD, trước khi có trình duyệt, nên ở đó không có
 * ngôn ngữ nào "đang chọn" cả. Với `output: 'export'` mỗi trang chỉ có MỘT bản HTML,
 * nên thẻ meta buộc phải ở một thứ tiếng — và đó là tiếng Anh, ngôn ngữ mặc định.
 * ⚠️ Hệ quả đã biết, ghi ra để không ai tưởng là lỗi: người đọc tiếng Việt dán liên
 * kết vào nhóm chat vẫn thấy thẻ chia sẻ tiếng Anh. Muốn thẻ theo ngôn ngữ thì phải
 * có URL riêng cho từng ngôn ngữ (`/vi/faucet/`…) — một quyết định kiến trúc khác,
 * đắt hơn nhiều, chưa làm.
 *
 * Dùng: `export const metadata = trangMeta({ tieuDe, moTa, duong })`.
 * Không gõ lại chuỗi ở lời gọi — truyền đúng biến đã dùng cho `title`.
 */
/**
 * Cắt dấu duyệt giọng `[?]`. Xem lý do ở chú thích trong `trangMeta`.
 * Xuất ra ngoài để đường phía client dùng ĐÚNG một hàm này, không chép lại regex.
 */
export const boDauDuyet = (s: string) => s.replace(/ \[\?\]/g, '');

/**
 * KHUÔN TIÊU ĐỀ TRANG — **nguồn duy nhất**, dùng bởi CẢ HAI đường:
 *   • `trangMeta()` ngay dưới, chạy lúc BUILD, luôn với `EN`
 *   • `useTieuDeTrang()` trong `lib/pageTitle.ts`, chạy trên TRÌNH DUYỆT với từ điển
 *     người đọc đang chọn
 *
 * 🔴 VÌ SAO PHẢI LÀ MỘT HÀM CHỨ KHÔNG PHẢI HAI CHỖ GHÉP CHUỖI GIỐNG NHAU:
 * hai đường ghép độc lập sẽ trôi lệch ở lần đầu ai đó đổi dấu gạch ngang hay thứ tự
 * — và khi đó tiêu đề **nhảy** lúc hydrate xong (tab đổi chữ trước mắt người dùng)
 * mà không có lỗi nào báo, vì cả hai chuỗi đều "đúng". Một hàm thì không lệch được.
 */
export function ghepTieuDe(tieuDeTran: string, tenSanPham: string): string {
  return `${boDauDuyet(tieuDeTran)} — ${tenSanPham}`;
}

/** Khuôn tiêu đề của TRANG CHỦ — khác các trang con: tên sản phẩm đứng TRƯỚC. */
export function ghepTieuDeGoc(tenSanPham: string, tagTitle: string): string {
  return `${boDauDuyet(tenSanPham)} — ${boDauDuyet(tagTitle)}`;
}

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
  const t = ghepTieuDe(tieuDe, EN.common.productName);
  const d = boDauDuyet(moTa);

  return {
    title: t,
    description: d,
    alternates: { canonical: duong },
    openGraph: { type: 'website', siteName: EN.common.productName, title: t, description: d, url: duong },
    twitter: { card: 'summary_large_image', title: t, description: d },
  };
}
