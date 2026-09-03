/**
 * Định dạng số nguyên theo ngôn ngữ người đọc đang chọn.
 *
 * ═══ LỖI NÀY SINH RA TỪ ĐÂU ═══
 * `NetworkStats.tsx` và `ComparisonTable.tsx` gọi `toLocaleString('vi-VN')` — một
 * locale **cắm cứng**, viết từ thời site chỉ có tiếng Việt. Sau khi site lên 30 ngôn
 * ngữ, chiều cao block hiện ra kiểu Việt (`1.234.567`) cho **mọi** người đọc; người
 * đọc tiếng Anh chờ `1,234,567`, và với họ dấu chấm đó đọc ra thành số thập phân.
 *
 * 🔴 VÌ SAO KHÔNG CỔNG NÀO BẮT ĐƯỢC, VÀ VÌ SAO NÓ SẼ CÒN ẨN TIẾP:
 * Hôm nay mạng vừa sinh lại (thế hệ g0) nên `eth_blockNumber` = **1**. Một chữ số
 * thì **không có dấu phân cách nào** ⇒ mọi ngôn ngữ in ra y hệt nhau ⇒ triệu chứng
 * bằng 0. Nó chỉ lộ khi chuỗi vượt 1.000 block — và `01/09` mạng lại sinh lại về 1,
 * nên cửa sổ ẩn mở thêm một lượt nữa.
 * ⇒ Đây là lớp lỗi mà **chính phép reset mạng làm triệu chứng biến mất trong khi
 *   khuyết tật ở nguyên đó**. Vì vậy bài kiểm dưới `test/so.test.ts` đo THẲNG hàm
 *   này với số đủ lớn, KHÔNG đo qua mạng — một bài kiểm đọc chiều cao block thật sẽ
 *   xanh hôm nay và xanh cả sau ngày G, mà không chứng minh gì.
 *
 * ═══ QUYẾT ĐỊNH: GIỮ CHỮ SỐ LATIN (`-u-nu-latn`) ═══
 * `Intl` mặc định cho `ar` ra chữ số Ả Rập-Ấn: `٤٬٣٠٠`. Đúng về mặt bản địa hoá,
 * nhưng SAI về mặt việc người ta làm với con số này: chiều cao block là thứ để
 * **đối chiếu** với explorer, với ví, với phản hồi RPC — cả ba đều in chữ số Latin.
 * Một con số không đối chiếu được thì không còn là số liệu.
 * ⇒ Lấy **dấu phân cách** theo ngôn ngữ (thứ giúp đọc), giữ **chữ số** Latin (thứ
 *   giúp đối chiếu). Ghi ở `DECISIONS.md` D-web-2.
 */

/**
 * @param n   số nguyên (chiều cao block, số chain…)
 * @param ma  mã BCP-47 của ngôn ngữ đang chọn — lấy từ `useLanguage().ma`
 */
export function formatNumber(n: number, code: string): string {
  try {
    // `-u-nu-latn` = ép hệ chữ số Latin. Phần còn lại của locale (dấu phân cách,
    // cách nhóm chữ số — `hi` nhóm 2 chữ số sau nhóm 3 đầu) vẫn theo ngôn ngữ.
    return new Intl.NumberFormat(`${code}-u-nu-latn`).format(n);
  } catch {
    // 🔴 KHÔNG rơi về `vi-VN` — đó chính là lỗi đang sửa. Rơi về `en` (mặc định của
    // site) thì cùng lắm là một người đọc thấy quy ước của ngôn ngữ mặc định, chứ
    // không phải quy ước của một ngôn ngữ thứ ba mà họ không chọn.
    return new Intl.NumberFormat('en').format(n);
  }
}
