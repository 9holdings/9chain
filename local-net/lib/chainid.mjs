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

// ─── Trần dải — David chốt `2026-08-27` cùng bộ định danh ngày G ───
//
// Dải L1 là **`9000000010` – `9999999999`** (~1 tỷ số). Sàn giữ nguyên D-069; chỉ trần được
// khai tường minh.
//
// 🔴 **Vì sao phải có trần, chứ không để `chainId++` chạy tới `MAX_SAFE_INTEGER`:** ba tính
// chất an toàn của bộ định danh này đều sinh ra từ **độ dài chữ số**, và tràn khỏi dải là mất
// cả ba trong im lặng —
//   1. `networkID` 9 chữ số vs chainId L1 **10 chữ số** ⇒ không nhìn nhầm nhau;
//   2. `networkID` (`999999999`) nằm **DƯỚI** sàn dải ⇒ chép nhầm sang ô chainId thì cổng
//      console bắt;
//   3. **toàn bộ** dải L1 (≥ 9.000.000.010) **vượt trần `uint32`** (4.294.967.295) ⇒ chép
//      nhầm chiều ngược lại thì node **không khởi động được** — lỗi to, không im lặng.
// Số thứ 1.000.000.001 sẽ là `10000000010`: **11 chữ số**, và tính chất (1) tan biến.
//
// ⇒ Cạn dải thì **DỪNG CỨNG**, không tự tràn. Cạn dải là chuyện của một tỷ L1 sau — nếu nó
// xảy ra thật thì đó là lúc cần một quyết định, không phải lúc cần một `chainId++`.
export const TRAN_DAI_CHAINID = 9_999_999_999;

// Trần EIP-2294 = `2^53-1`, đúng bằng `Number.MAX_SAFE_INTEGER`. Sau khi có `TRAN_DAI_CHAINID`
// thì trần này **không còn là ràng buộc thực tế** cho đường tự cấp (dải kết thúc sớm hơn rất
// nhiều), nhưng nó vẫn canh **đường người dùng TỰ NHẬP** ở `server.mjs`.
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
export function capChainIdTuDong(daDungTrongNha, daChiemSoCongKhai, goc = GOC_DAI_CHAINID, tran = TRAN_DAI_CHAINID) {
  // Lấy số CÒN TRỐNG, không phải `goc + số chain`: chỉ cần một lượt trước đó tự chọn chainId
  // là công thức đếm đó đâm trúng số đã dùng.
  let chainId = goc;
  while (chainId <= tran && (daDungTrongNha.has(chainId) || daChiemSoCongKhai.has(chainId))) chainId++;
  // 🔴 DỪNG CỨNG ở trần dải — xem khối chú thích ở `TRAN_DAI_CHAINID`. Tràn khỏi dải là mất
  // cả ba tính chất an toàn của bộ định danh, và mất chúng **trong im lặng**.
  if (chainId > tran) {
    // 🔴 Câu lỗi phải ĐÚNG cả khi tham số vô lý (`goc > tran`). Bản đầu in thẳng
    // `tran - goc + 1` nên một ca gọi với `goc` trên `tran` ra **số âm**: *"(-9.007.189.254.740.991
    // số)"*. Cổng vẫn **chặn đúng**, nhưng người đọc nó — người đang đứng trước một lượt đẻ chain
    // hỏng — bị dẫn sai. Cùng lớp lỗi với `Fprintf` thiếu tham số mà patch 0013 đã trả giá:
    // **một cổng mới kiểm được nửa "có chặn không", chưa kiểm nửa "chặn xong nó nói gì".**
    const rong = tran - goc + 1;
    throw new Error(
      rong > 0
        ? `Đã cấp hết dải chainId ${goc}–${tran} (${rong.toLocaleString("vi-VN")} số). ` +
          `KHÔNG tự tràn ra ngoài dải: chainId 11 chữ số làm mất tính chất "nhìn là phân biệt ` +
          `được với networkID". Đây là lúc cần một quyết định, không phải một chainId++.`
        : `Dải chainId vô lý: gốc ${goc} nằm TRÊN trần ${tran} ⇒ không có số nào để cấp. ` +
          `Đây là lỗi tham số của người gọi, không phải dải đã cạn.`
    );
  }
  // Trần EIP-2294 nay không với tới được từ đường này (trần dải chặn sớm hơn), nhưng hàm còn
  // nhận `goc`/`tran` tuỳ ý nên cổng vẫn phải đứng đó.
  if (!Number.isSafeInteger(chainId)) {
    throw new Error(`Không còn chainId trống dưới trần EIP-2294 (${TRAN_EIP2294}) từ gốc dải ${goc}`);
  }
  return chainId;
}
