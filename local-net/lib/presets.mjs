// presets.mjs — các kiểu L1 mà console đẻ ra được (M5).
//
// Trước file này `l1-evm-genesis.json` là cố định: mọi chain giống hệt nhau, chỉ
// khác `chainId` / `alloc` / `feeManagerConfig`. Nghĩa là "đẻ chain của riêng bạn"
// mới đúng một nửa — chain là của bạn, nhưng nó không làm được gì mà chain khác
// không làm.
//
// ═══ HAI LUẬT CỨNG CỦA MỌI PRESET ═══
//
// 1. **Chủ chain là admin của MỌI precompile được bật.** Bật một precompile mà
//    không cho ai quyền quản nó nghĩa là đẻ ra một chain có cái công tắc không ai
//    bấm được — và genesis là bất biến, không sửa lại được sau.
//
// 2. **Không preset nào được làm chain không giao dịch nổi.** Nguy hiểm nhất là
//    `txAllowList`: nếu chủ chain không nằm trong danh sách thì **không ai gửi
//    được giao dịch nào, vĩnh viễn** — chain chết ngay lúc sinh ra, và không có
//    đường sửa vì sửa allowlist cũng phải bằng một giao dịch.
//    Đã kiểm ở source thay vì tin trực giác: `precompile/allowlist/role.go:51`,
//    `IsEnabled()` trả true cho AdminRole/EnabledRole/ManagerRole ⇒ để chủ chain
//    vào `adminAddresses` là đủ để họ giao dịch được.
//
// Tên khoá JSON và địa chỉ precompile đều LẤY TỪ SOURCE subnet-evm
// (`precompile/contracts/*/module.go`), không gõ theo trí nhớ: sai một chữ thì
// subnet-evm **bỏ qua khoá lạ trong im lặng** và chain ra đời thiếu đúng thứ
// người dùng đã chọn — không lỗi, không cảnh báo.

/** Địa chỉ precompile — để giao diện và bài nghiệm thu tham chiếu, không đoán. */
export const DIA_CHI = {
  deployerAllowList: "0x0200000000000000000000000000000000000000",
  nativeMinter:      "0x0200000000000000000000000000000000000001",
  txAllowList:       "0x0200000000000000000000000000000000000002",
  feeManager:        "0x0200000000000000000000000000000000000003",
  rewardManager:     "0x0200000000000000000000000000000000000004",
  warp:              "0x0200000000000000000000000000000000000005",
};

/**
 * Mỗi preset nhận `(cfg, admin)` và sửa `cfg` (phần `config` của genesis) tại chỗ.
 * `feeManagerConfig` do `createChain` đặt sẵn cho MỌI chain — preset không đụng vào,
 * nên chủ chain luôn giữ quyền chỉnh phí bất kể chọn kiểu nào.
 */
export const PRESETS = [
  {
    id: "standard",
    name: "Chuẩn",
    desc: "EVM thường. Chủ chain nhận toàn bộ token genesis và quyền chỉnh phí.",
    ap() { /* không thêm gì — đây là hình dạng nền */ },
  },
  {
    id: "zero-fee",
    name: "Phí gần như bằng 0",
    desc: "baseFee = 1 wei, giao dịch trả đúng sàn đó (một lượt chuyển tiền tốn " +
          "0,000000000000021 LOVE9). Hợp cho game, thử nghiệm, chain nội bộ. " +
          "Đổi lại gần như không có chi phí nào cản spam.",
    ap(cfg) {
      // ═══ minBaseFee PHẢI LÀ 1, TUYỆT ĐỐI KHÔNG ĐƯỢC LÀ 0 ═══
      //
      // `minBaseFee = 0` **qua được validate nhưng làm chain KHÔNG ĐẺ NỔI BLOCK NÀO**.
      // Đây là bẫy hai tầng, hai tầng nằm ở hai file khác nhau và mâu thuẫn nhau:
      //
      //   tầng 1 — `commontype/fee_config.go` `Verify()`: chỉ từ chối minBaseFee ÂM
      //            (`errMinBaseFeeNegative`). 0 hợp lệ, chain khởi động sạch sẽ.
      //   tầng 2 — `customheader/block_gas_cost.go:94` `VerifyBlockFee()`:
      //            `if baseFee == nil || baseFee.Sign() <= 0 { return errInvalidBaseFee }`
      //            và nó nằm **TRƯỚC** cái early-return `requiredBlockGasCost == 0`.
      //
      // `consensus/dummy/consensus.go:299` gọi `VerifyBlockFee` từ trong
      // `FinalizeAndAssemble` — tức là ở đường **dựng** block, không phải chỉ khi
      // kiểm block của người khác. Nên baseFee = 0 ⇒ mọi lượt dựng block trả lỗi ⇒
      // chain đứng im mãi mãi. Và baseFee = 0 là điều chắc chắn xảy ra:
      // `customheader/dynamic_fee_windower.go:32` trả thẳng `MinBaseFee` cho block
      // đầu, dòng 109 kẹp sàn `selectBigWithinBounds(MinBaseFee, …)` cho mọi block sau.
      //
      // Cách hỏng này ĐỘC vì mọi dấu hiệu đều nói chain khoẻ: RPC trả lời, `eth_chainId`
      // đúng, `eth_getBalance` đúng, `baseFeePerGas` đúng bằng 0 y như khai — chỉ có
      // giao dịch là không bao giờ chốt. Đã đốt cả B-3 vào việc này (chain
      // PkhongphiE1LM rồi PkhongphiSQSW, 2026-08-25). Xem D-028.
      //
      // ═══ blockGasCost = 0: ĐAI AN TOÀN, KHÔNG PHẢI BẢN VÁ ═══
      //
      // Nói thẳng để người sau khỏi hiểu nhầm nhân quả: **ba dòng blockGasCost dưới
      // đây không sửa được gì trên mạng 9Chain-A1 hôm nay.** Chúng đã bằng 0 sẵn.
      //
      // Lý do: `customheader/block_gas_cost.go:41` trả thẳng 0 nếu `IsGranite`. Mà
      // networkID 9001 không phải Mainnet/Fuji nên `upgrade.GetConfig` rơi vào
      // `Default`, ở đó `GraniteTime = InitiallyActiveTime` (2020-12-05) ⇒ **Granite
      // bật từ genesis** ⇒ `requiredBlockGasCost` luôn 0 ⇒ `VerifyBlockFee`
      // early-return ở dòng 101 với mọi chain của ta.
      //
      // Vậy vì sao vẫn đặt? Vì nếu Granite thôi hoạt động (ai đó ghim mốc upgrade,
      // hay mạng mới cấu hình khác) thì cơ chế cũ sống lại: giao dịch trả đúng
      // baseFee có **tip = 0** ⇒ `totalBlockFee = 0` ⇒ `blockGas = 0`
      // (`block_gas_cost.go:141`), và `blockGasCostStep: 200000` của template đẩy
      // `requiredBlockGasCost` lên mỗi khi block ra nhanh hơn `targetBlockRate` ⇒
      // `ErrInsufficientBlockGas`. Ba dòng này làm preset đúng ngay cả khi đó.
      // Hợp lệ với `Verify()`: nó chỉ đòi min ≤ max.
      //
      // Đổi lại: chain này mất hẳn cơ chế chống đẻ-block-quá-nhanh. Đúng chủ ý của
      // preset, và đã nói trong `moTa`.
      cfg.feeConfig = {
        ...cfg.feeConfig,
        minBaseFee: 1,
        minBlockGasCost: 0,
        maxBlockGasCost: 0,
        blockGasCostStep: 0,
      };
    },
  },
  {
    id: "high-throughput",
    name: "Thông lượng cao",
    desc: "Gấp 5 lần số giao dịch mỗi block (gasLimit 60 triệu thay vì 12 triệu). " +
          "Hợp cho game, sàn, thứ gì cần nhiều giao dịch nhỏ liên tục. " +
          "Đổi lại block nặng hơn, và ai chạy node cho chain này cần máy khoẻ hơn.",
    ap(cfg) {
      // ═══ VÌ SAO CÓ PRESET NÀY: TRẦN TPS LÀ THAM SỐ GENESIS, KHÔNG PHẢI PHẦN CỨNG ═══
      //
      // M9.3 đo trên máy chủ thật: bơm tải lên một L1 riêng chốt được **252–264 TPS**
      // rồi không lên nữa, dù **máy chủ chỉ ở load 2,92/8 luồng (~36%)**. Tăng số ví
      // gửi lên 3 lần chỉ đưa 174 → 258 TPS. Trần đó tính thẳng ra từ genesis:
      //
      //     gasLimit 12.000.000 ÷ 21.000 gas/tx = 571 tx/block
      //     571 ÷ 2 giây (targetBlockRate)      = 285 TPS lý thuyết
      //     đo được 252–264                     = 90% trần
      //
      // Nên "chain chạy nhanh hơn" là chuyện **sửa một con số**, không phải chuyện
      // mua máy. Preset này là kết luận đó đóng thành sản phẩm.
      //
      // ═══ HAI THAM SỐ, ĐI CÙNG NHAU ═══
      // `targetGas` giữ đúng tỉ lệ 5× gasLimit như template gốc (60M/12M). Nó là
      // lượng gas mục tiêu trong cửa sổ trượt 10 giây; nâng gasLimit mà quên nó thì
      // chain vừa dùng hết công suất mới đã bị coi là "trên mức mục tiêu" và
      // **thuật toán phí tự đẩy baseFee lên** — tức là nâng trần rồi tự thu phí
      // phạt người dùng vì đã dùng cái trần đó.
      //
      // `gasLimit` ở GỐC genesis do `createChain` đồng bộ lại từ đây — subnet-evm
      // đòi hai chỗ bằng nhau (`core/genesis.go:456`).
      //
      // ⚠️ CHƯA ĐO TRẦN MỚI. Lý thuyết là 60M ÷ 21.000 ÷ 2 = **1.428 TPS**, gấp 5
      // lần, nhưng ở mức đó **máy mới là thứ đụng trần** chứ không phải genesis —
      // và không có số đo thì đó vẫn là phép chia, không phải sự thật. M9.4 phần
      // đo còn treo; `moTa` vì vậy chỉ hứa "gấp 5 lần số giao dịch mỗi block"
      // (đúng theo định nghĩa) chứ KHÔNG hứa gấp 5 lần TPS.
      cfg.feeConfig = {
        ...cfg.feeConfig,
        gasLimit: 60000000,
        targetGas: 300000000,
      };
    },
  },
  {
    id: "mintable",
    name: "Tự in thêm token",
    desc: "Chủ chain đúc thêm token bản địa bất cứ lúc nào qua precompile " +
          DIA_CHI.nativeMinter + ". Nguồn cung KHÔNG cố định — người dùng chain này phải biết điều đó.",
    ap(cfg, admin) {
      cfg.contractNativeMinterConfig = { adminAddresses: [admin], blockTimestamp: 0 };
    },
  },
  {
    id: "owner-deploy-only",
    name: "Chỉ chủ chain deploy được hợp đồng",
    desc: "Người khác vẫn gửi giao dịch và dùng hợp đồng đã có, nhưng không tự deploy được. " +
          "Chủ chain cấp quyền cho ai tuỳ ý qua precompile " + DIA_CHI.deployerAllowList + ".",
    ap(cfg, admin) {
      cfg.contractDeployerAllowListConfig = { adminAddresses: [admin], blockTimestamp: 0 };
    },
  },
  {
    id: "permissioned",
    name: "Chain kín (chỉ ai được duyệt mới giao dịch)",
    desc: "Chỉ địa chỉ trong danh sách mới GỬI được giao dịch. Hợp cho chain nội bộ doanh nghiệp. " +
          "⚠️ Đây là preset khắt khe nhất: ví lạ vào chain này sẽ không làm được gì cả.",
    ap(cfg, admin) {
      // Chủ chain BẮT BUỘC có mặt — xem luật cứng #2 ở đầu file.
      cfg.txAllowListConfig = { adminAddresses: [admin], blockTimestamp: 0 };
    },
  },
];

const THEO_ID = new Map(PRESETS.map(p => [p.id, p]));

/** Danh sách rút gọn cho giao diện / API — không lộ hàm `ap`. */
export function danhSachPreset() {
  return PRESETS.map(({ id, name, desc }) => ({ id, name, desc }));
}

/**
 * Áp preset lên `config` của genesis.
 *
 * @param {object} cfg   phần `config` của genesis (SỬA TẠI CHỖ)
 * @param {string} id    id preset; rỗng/thiếu ⇒ "standard"
 * @param {string} admin địa chỉ EIP-55 của chủ chain (đã validate ở tầng trên)
 * @returns {{id:string, name:string}} preset đã áp
 */
export function apDungPreset(cfg, id, admin) {
  const key = String(id ?? "").trim() || "standard";
  const p = THEO_ID.get(key);
  if (!p) {
    // Liệt kê lựa chọn hợp lệ ngay trong lỗi: người gọi qua API không có giao diện
    // để nhìn, và một lỗi "preset không hợp lệ" trống rỗng buộc họ đi đọc mã nguồn.
    throw new Error(`Kiểu chain "${key}" không có. Chọn một trong: ${PRESETS.map(x => x.id).join(", ")}`);
  }
  if (!/^0x[0-9a-fA-F]{40}$/.test(String(admin || ""))) {
    // Chốt chặn thừa: `createChain` đã validate EIP-55 trước khi tới đây. Giữ lại
    // vì hàm này ghi thẳng vào genesis — thứ bất biến — nên thà từ chối hai lần.
    throw new Error(`apDungPreset: địa chỉ admin không hợp lệ (${admin})`);
  }
  p.ap(cfg, admin);
  return { id: p.id, name: p.name };
}
