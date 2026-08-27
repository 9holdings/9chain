import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';
import { dien } from '@/lib/i18n/dien';
import { NoiDungReGenesis } from './NoiDungReGenesis';
// Chain ID lấy từ NGUỒN SỰ THẬT của mã, không gõ tay vào từ điển: nếu ngày nào đó
// số này đổi thật thì câu chữ trên trang đổi theo, không có đường để hai chỗ lệch.
import { CHAIN } from '@/lib/chain';
import { trangMeta } from '@/lib/seo';

/**
 * Trang re-genesis — nói trước cái sắp mất.
 *
 * 🔴 HÔM NAY TRANG NÀY VIẾT Ở THÌ TƯƠNG LAI. Đúng ngày G nó phải được thay bằng bản
 * công bố ở thì quá khứ ("đã sinh lại"), kèm đường dẫn bản lưu và mã băm.
 *
 * ✅ BẢN CÔNG BỐ ĐÃ VIẾT SẴN — ở khối `EN.reGenesisXong` trong `lib/i18n/vi.ts`.
 * Ngày G chỉ phải: đổi trang này đọc `reGenesisXong` thay cho `reGenesis`, rồi điền
 * `luuUrl` + `luuSha256`. KHÔNG phải viết văn.
 * Quy trình đầy đủ (điều kiện vào, thứ tự, cách nghiệm thu): mục **D-web** trong
 * `docs/NGAY-G-A1-CON-LAI.md`.
 *
 * ⚠️ Chú thích cũ ở đây từng ghi *"Bản nháp công bố đã viết sẵn — đừng viết lại từ
 * đầu"* trong khi **nó không tồn tại ở đâu cả** (`grep` toàn repo ra 0 kết quả).
 * Một con trỏ trỏ vào hư không còn tệ hơn không có con trỏ: người tiếp nhận sẽ đi
 * tìm, không thấy, rồi phải viết mới trong lúc vội. Đã sửa 2026-08-27.
 *
 * 🔴 MỘT ĐIỀU TRANG NÀY CỐ Ý KHÔNG NÓI, vì chưa ai đo:
 *   • Sổ giữ chỗ tên + Chain ID có sống sót qua ngày G không (mục O3b). Nói "còn"
 *     rồi hoá ra mất là đẩy người dùng vào đúng cái bẫy ví-trỏ-nhầm-chain.
 * Khi câu đó có lời đáp thì bổ sung, đừng đoán trước.
 *
 * ✅ Câu thứ hai ĐÃ CÓ LỜI ĐÁP: **D-047 chốt GIỮ chainId `9000000009`.** Mục
 * "Ví của bạn sẽ không báo gì cả" bên dưới chính là phần trang phải gánh vì quyết
 * định đó — giữ số nghĩa là ví không còn dấu hiệu nào để tự nhận ra mạng đã đổi,
 * nên hai hệ quả (số dư 0, và tx đã ký chưa phát) phải được nói ra bằng chữ.
 * Đừng gỡ mục đó nếu chưa đọc D-047.
 */
// 🔴 TRANG NÀY LÀ TRANG CẦN THẺ CHIA SẺ RIÊNG NHẤT TRONG CẢ SITE (Đ1-5).
// Trước lượt vá: dán liên kết này vào một nhóm chat thì thứ hiện lên là `og:*` của
// trang chủ — lời mời *"đẻ chain của bạn mất khoảng ba phút"*, ngược hẳn điều trang
// muốn nói, đúng tuần cần nó nhất. `title` thì đã riêng từ lâu, nên mọi cổng đo
// `<title>` vẫn xanh suốt thời gian đó.
// `trangMeta` tự cắt dấu `[?]` — không gọi `.replace()` ở đây nữa.
export const metadata: Metadata = trangMeta({
  tieuDe: dien(EN.reGenesis.tieuDe, { ngay: EN.reGenesis.ngay }),
  moTa: EN.reGenesis.moTa,
  duong: '/re-genesis/',
});

export default function TrangReGenesis() {
  return <NoiDungReGenesis />;
}
