import { NoiDungTrangChu } from './HomeContent';

/**
 * TRANG CHỦ — **David chọn bản C ngày 2026-08-26** (M10.3, U-3).
 *
 * Cách dẫn: **bằng chứng trước, lời mời sau**. Cho thấy L1 có thật đang chạy, có chủ
 * thật, rồi mới mời người ta đẻ chain của mình. Hai bản còn lại (A — dẫn bằng lời
 * hứa; B — đặt thẳng ô đặt tên lên trang chủ) đã gỡ cùng thanh chọn biến thể; lịch
 * sử nằm trong git nếu cần đọc lại.
 *
 * 🔴 **Điểm yếu đã biết của bản này, ghi ra để đừng ai ngạc nhiên:** nó mạnh dần
 * theo số chain trong danh bạ, mà hôm nay danh bạ đang **vắng** (2 L1, cả hai của hệ
 * thống). Vì vậy `ChainTable` có trạng thái rỗng viết như một **lời mời** ("bạn sẽ là
 * người đầu tiên"), không phải một ô trống — chọn bản C là đặt cược vào việc danh bạ
 * sẽ đầy lên, và màn phải chịu được quãng chờ đó mà không trông như hỏng.
 */
export default function TrangChu() {
  return <NoiDungTrangChu />;
}
