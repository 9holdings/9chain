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
// ─── Thế hệ mạng — PHẢI khớp `constants.A1Gen` bên Go ───
//
// 🔴 Đây là bản chép, và bản chép thì trôi lệch. Cổng `netgen/identity.go` in ra khối
// chainId nó tính được ở MỖI lượt sinh mạng, và runbook ngày G đối chiếu dòng đó với
// `chainid-test.mjs`. Đừng sửa số này một mình.
export const A1_GEN = 0;

// ─── Ba thứ dẫn xuất từ thế hệ — KHAI Ở ĐÂY, đừng chép lẻ ra chỗ khác ───
//
// 🔴 Trước `2026-08-28` mỗi nơi cần networkID lại gõ lại `999999999`. Gõ lại là
// đẻ thêm một bản chép nữa, mà bản chép nào cũng trôi lệch được — và ở đây trôi
// lệch nghĩa là console nói chuyện với một thế hệ mạng khác mà không biết.
// `scripts/check-consistency.mjs` nối cả ba số này về `constants.A1*` bên Go.
export const A1_ID_GOC = 999_999_999; // ⇦ PHẢI khớp `constants.A1IDGoc`
export const NETWORK_ID = A1_ID_GOC - A1_GEN;
export const TEN_MANG = `9chain-a1-g${A1_GEN}`;

// Khối chainId của thế hệ: `[9_000_000_000 + gen×1_000_000 , +999_999]`.
// Thế hệ 0 nâng sàn lên `…010` để chừa chain mẹ `…009` và chín số đệm.
export const GOC_DAI_CHAINID = A1_GEN === 0
  ? 9_000_000_010
  : 9_000_000_000 + A1_GEN * 1_000_000;

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
// 🔴 TRẦN CỦA **KHỐI THẾ HỆ**, không phải trần của cả dải.
//
// David chốt dải L1 là `9000000010–9999999999`. Đó là **toàn bộ không gian**; thế hệ chia
// ngăn bên trong nó (1000 thế hệ × 1 triệu). Console của thế hệ `n` **chỉ cấp trong ngăn
// của mình** — nếu không thì thế hệ sau lại nhận đúng những số thế hệ này đã phát, và bảo
// đảm *"không cấp lại"* quay về chỗ treo lên `console-chains.json` phải sống sót qua mọi
// lượt wipe. Đó là đặt bảo đảm lên đúng chỗ yếu nhất của A1.
export const TRAN_DAI_CHAINID = 9_000_000_000 + A1_GEN * 1_000_000 + 999_999;

// Trần của TOÀN dải — chỉ để kiểm khối thế hệ không tràn ra ngoài nó.
export const TRAN_TOAN_DAI = 9_999_999_999;

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

// ═══ SỔ "A1 ĐÃ TỪNG CẤP" — nhớ XUYÊN THẾ HỆ (D-086) ═══
//
// 🔴 `console-chains.json` bị xoá sạch mỗi lượt re-genesis. Đo `2026-08-27` sau lượt g0: sổ
// đang chạy đúng **27 byte**. Tức `chains ∪ retired` — thứ `createChain` dựa vào để chặn
// trùng — quay về RỖNG, và mọi chainId/tên từng cấp cho người dùng **tự do trở lại**.
//
// Hai hàm dưới đặt ở ĐÂY chứ không ở `server.mjs`, cùng lý do đã tách `capChainIdTuDong`:
// bài kiểm phải đọc được **mã thật**. Một phép kiểm sống trong `server.mjs` chỉ chạy được
// khi có node, có SIWE, có mạng — nên thực tế nó không bao giờ được kiểm.

/**
 * chainId này A1 đã cấp ở một thế hệ trước chưa? Trả câu lỗi, hoặc `null` nếu sạch.
 *
 * @param {number} n
 * @param {Set<number>} daCap
 * @returns {string|null}
 */
export function loiChainIdDaCap(n, daCap) {
  if (!daCap.has(n)) return null;
  return `Chain ID ${n} đã được 9Chain-A1 cấp cho một L1 ở một thế hệ mạng TRƯỚC. ` +
    `Số nhận dạng không được cấp lại kể cả khi mạng cũ đã biến mất: ví của người từng dùng ` +
    `chain đó vẫn giữ mạng, và EIP-155 buộc chữ ký vào chainId — chữ ký cũ sẽ PHÁT LẠI được ` +
    `trên chain mới của bạn. Chọn số khác.`;
}

/**
 * Tên này A1 đã cấp ở một thế hệ trước chưa? So **không phân biệt hoa/thường**.
 *
 * 🔴 So thường hoá là cố ý: `"david do"` và `"David Do"` là cùng một lời hứa với cùng một
 * người. Chặn theo byte thì chỉ cần đổi một chữ hoa là lách được, và người lách không nhất
 * thiết cố ý — họ chỉ gõ lại tên họ nhớ.
 *
 * @param {string} ten
 * @param {Map<string,string>} tenDaCap  tên thường hoá -> tên gốc
 * @returns {string|null}
 */
export function loiTenDaCap(ten, tenDaCap) {
  const goc = tenDaCap.get(String(ten).trim().toLowerCase());
  if (!goc) return null;
  return `Tên "${goc}" đã được 9Chain-A1 cấp cho một L1 ở một thế hệ mạng TRƯỚC. Tên không được ` +
    `cấp lại, kể cả khi mạng cũ đã biến mất: người từng dùng chain đó vẫn còn nó trong ví và ` +
    `trong tài liệu của họ. Chọn tên khác.`;
}
