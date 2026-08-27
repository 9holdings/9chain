// ═══ CẤP chainId CHO L1 NGƯỜI DÙNG ═══
//
// Tách khỏi `console/server.mjs` vì một lý do cụ thể, không phải vì gọn: `server.mjs` gọi
// `server.listen()` ở mức module, nên bài kiểm nào `import` nó cũng dựng một cổng thật. Kết
// quả là phép cấp số — thứ quyết định **con số ví người dùng đọc** — chưa từng có bài kiểm
// nào chạm tới, và cách duy nhất để kiểm là **chép lại công thức** sang bài kiểm.
//
// 🔴 Chép công thức sang bài kiểm là đúng lớp lỗi `check-consistency.mjs` đã dính: bản chép
// tay bằng JS khẳng định `SupplyCap = 9 tỷ` **sau khi binary đã đổi**, và nó xanh suốt vì nó
// đang so bản chép với chính nó. Bài kiểm phải đọc MÃ THẬT.

// ─── Gốc dải — David chốt `2026-08-27` (D-069, B-14) ───
//
// Dải cũ bắt đầu ở 9100, và tra sổ công khai `27/08` phát hiện **9100 = Genesis Coin**: số
// console cấp ĐẦU TIÊN trùng một chuỗi có thật, và điều đó đã xảy ra rồi (chain `OwnerTest`
// nhận 9100 hai lần). Trong 100 số đầu của dải cũ còn 9108 · 9134 · 9170 bị chiếm.
//
// Gốc mới = chainId của A1 (`9000000009`) **+1**. Đo trên sổ `27/08` (2.725 mục): **không một
// chuỗi nào trong bán kính 10 triệu** quanh 9000000009.
export const GOC_DAI_CHAINID = 9_000_000_010;

// Trần EIP-2294 = `2^53-1`, đúng bằng `Number.MAX_SAFE_INTEGER`. Không phải ràng buộc thực tế
// ở đây (còn ~9.007.190 tỷ số trống trên gốc dải) nhưng vắng nó thì vượt trần là `chainId++`
// mất độ chính xác và vòng lặp treo **trong im lặng**.
export const TRAN_EIP2294 = Number.MAX_SAFE_INTEGER;

/**
 * Số trống đầu tiên từ gốc dải, bỏ qua CẢ HAI sổ.
 *
 * @param {Set<number>|Map<number,unknown>} daDungTrongNha  chainId trong `console-chains.json`
 *        — gồm cả `chains` LẪN `retired`. Thu hồi **không** trả lại số nhận dạng: cấp lại số
 *        của một L1 đã chết nghĩa là ví của người dùng cũ coi chain mới là cùng một mạng.
 * @param {Set<number>|Map<number,unknown>} daChiemSoCongKhai  ảnh chụp `chainid.network`.
 * @param {number} goc  gốc dải, mặc định `GOC_DAI_CHAINID`.
 * @returns {number}
 */
export function capChainIdTuDong(daDungTrongNha, daChiemSoCongKhai, goc = GOC_DAI_CHAINID) {
  // Lấy số CÒN TRỐNG, không phải `goc + số chain`: chỉ cần một lượt trước đó tự chọn chainId
  // là công thức đếm đó đâm trúng số đã dùng.
  let chainId = goc;
  while (daDungTrongNha.has(chainId) || daChiemSoCongKhai.has(chainId)) chainId++;
  if (!Number.isSafeInteger(chainId)) {
    throw new Error(`Không còn chainId trống dưới trần EIP-2294 (${TRAN_EIP2294}) từ gốc dải ${goc}`);
  }
  return chainId;
}
