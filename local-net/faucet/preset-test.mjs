// preset-test.mjs — nghiệm thu M5.3: mỗi kiểu chain (preset) có THẬT SỰ có hiệu lực
// hay không, chứng minh bằng giao dịch thật trên chain thật.
//
//   Trên server:
//     set -a; . ~/9chain-a1/console.env; set +a
//     cd ~/9chain-a1/src && node local-net/faucet/preset-test.mjs
//     node local-net/faucet/preset-test.mjs --chi kin        # chỉ một preset
//     node local-net/faucet/preset-test.mjs --giu            # không thu hồi
//
// ═══ VÌ SAO PHẢI ĐẺ CHAIN THẬT ═══
// Precompile của subnet-evm được bật bằng một khoá trong genesis. Gõ sai tên khoá
// thì subnet-evm **bỏ qua khoá lạ trong im lặng**: chain lên bình thường, RPC trả
// lời bình thường, không lỗi, không cảnh báo — chỉ là tính năng người dùng đã chọn
// không tồn tại. Không có cách nào phát hiện bằng cách đọc file genesis, vì file
// genesis trông đúng y như ý định. Cách duy nhất là **dùng thử tính năng đó**.
//
// Bài học cùng họ từ kho tri thức (Cosmos EVM, 2026-08-23): precompile có trong
// binary vẫn có thể "không tồn tại" với Solidity, và staticcall trả về SUCCESS +
// dữ liệu RỖNG — không revert, không log. Nên bài kiểm phải đòi một THAY ĐỔI TRẠNG
// THÁI quan sát được (số dư tăng, giao dịch bị chặn), không phải "gọi được thì coi là bật".
//
// ═══ TỰ DỌN ═══
// Mỗi preset: đẻ chain → thử → THU HỒI (M4.4). Không có bước thu hồi thì bài này
// ăn 4 trong 15 slot vĩnh viễn và chỉ chạy được đúng một lần.
import { ethers } from "ethers";

const args = process.argv.slice(2);
const co = t => args.includes("--" + t);
const opt = (t, mac) => { const i = args.indexOf("--" + t); return i >= 0 && args[i + 1] ? args[i + 1] : mac; };

const CONSOLE = opt("console", "http://127.0.0.1:8091");
const TOKEN = process.env.A1_CONSOLE_TOKEN || "";
const GIU = co("giu");
const CHI = opt("chi", null);
// Chạy lại bài kiểm trên một chain ĐÃ CÓ, không đẻ chain mới.
//
// Mỗi lượt đẻ+thu hồi mất ~5,5 phút, nên gỡ lỗi bằng cách đẻ lại chain mỗi lần thử
// là vòng lặp chậm đến mức người ta bắt đầu đoán thay vì đo. Hai cờ này cắt vòng
// lặp xuống còn vài giây: đẻ MỘT chain với `--giu`, rồi thử bao nhiêu lần cũng được.
const RPC_CO_SAN = opt("rpc", null);
const KHOA = opt("khoa", null);

const DEPLOYER_ALLOWLIST = "0x0200000000000000000000000000000000000000";
const NATIVE_MINTER = "0x0200000000000000000000000000000000000001";
const TX_ALLOWLIST = "0x0200000000000000000000000000000000000002";
// Mã khởi tạo hợp đồng nhỏ nhất hợp lệ: PUSH1 0 PUSH1 0 RETURN — deploy ra một
// hợp đồng có runtime rỗng.
//
// Giữ PUSH1 (không PUSH0) là **chủ ý, nhưng KHÔNG phải vì lý do ghi trong HANDOFF cũ**.
// Ghi chú cũ nói "L1 EVM chưa bật Durango nên không có PUSH0" — đã đo và **sai**:
// chain 9122 deploy `0x5f5ff3` (có PUSH0) ra `status 1`. Lý do thật để giữ PUSH1 ở
// đây là bài này kiểm **quyền deploy**, nên mã deploy phải là thứ chạy được trên mọi
// cấu hình EVM có thể có; dùng opcode mới ở đây là trộn hai câu hỏi vào một phép đo.
const MA_DEPLOY = "0x60006000f3";

// ═══ VÌ SAO MỌI GIAO DỊCH Ở ĐÂY ĐẶT gasLimit TƯỜNG MINH ═══
// `eth_estimateGas` ƯỚC LƯỢNG THIẾU cho GIAO DỊCH ĐẦU TIÊN của một chain vừa đẻ.
// Đo được, có đối chứng, trên CÙNG một chain (Ptuintien3C7B, 2026-08-25):
//     block 1 (giao dịch đầu): estimate 52037 → hết gas, revert, status 0
//     block 2 trở đi        : estimate 54183 → gasUsed 53388, status 1
// Cùng calldata, cùng người gửi, cùng precompile. Ba chain khác nhau đều hỏng y
// hệt ở block 1 với đúng con số 52037.
//
// Cách hỏng này ĐỘC ở chỗ nó giả dạng "tính năng không tồn tại": receipt chỉ có
// `status: 0`, không lý do, còn `eth_call` cùng lời gọi đó lại THÀNH CÔNG (vì
// eth_call chạy với trần gas rất lớn). Suýt kết luận preset nativeMinter hỏng.
const GAS_AN_TOAN = 300000n;

const ket = [];
let hong = 0;
function kiem(ten, dat, chiTiet = "") {
  ket.push({ ten, dat, chiTiet });
  if (!dat) hong++;
  console.log(`${dat ? "    ✓" : "    ✗"} ${ten}${chiTiet ? "  — " + chiTiet : ""}`);
}
function sach(s) { const t = String(s ?? ""); return TOKEN ? t.split(TOKEN).join("<TOKEN>") : t; }

async function api(duong, body) {
  const r = await fetch(CONSOLE + duong, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(400000),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
  return j;
}

/**
 * Gửi giao dịch và đòi nó THẤT BẠI.
 *
 * Hai kiểu chặn khác nhau, phải chấp nhận cả hai: `txAllowList` chặn ngay lúc nộp
 * (node từ chối, ethers ném lỗi), còn `contractDeployerAllowList` để giao dịch vào
 * block rồi mới cho revert (receipt.status = 0). Chỉ kiểm một kiểu là bài sẽ báo
 * hỏng ở đúng chỗ tính năng đang chạy tốt.
 */
async function phaiChan(ten, gui) {
  try {
    const tx = await gui();
    const rc = await Promise.race([
      tx.wait(1),
      new Promise((_, x) => setTimeout(() => x(new Error("không chốt sau 60s")), 60000)),
    ]);
    if (rc.status === 0) kiem(ten, true, "vào block rồi revert (status 0)");
    else kiem(ten, false, `giao dịch THÀNH CÔNG — preset KHÔNG có hiệu lực (block ${rc.blockNumber})`);
  } catch (e) {
    // Bị từ chối lúc nộp cũng là chặn thành công — nhưng phải chắc nó bị chặn vì
    // ĐÚNG lý do, không phải vì hết tiền hay lỗi mạng.
    const m = sach(e.message || e);
    const hetTien = /insufficient funds|exceeds balance/i.test(m);
    kiem(ten, !hetTien, hetTien ? `SAI LÝ DO (hết tiền), không phải bị chặn: ${m}` : `bị từ chối lúc nộp`);
  }
}

// Vai trò trong allowlist, đọc THẲNG từ precompile.
//
// Đây là phép đo phân biệt ba trạng thái mà nhìn bề ngoài giống hệt nhau:
//   • precompile KHÔNG bật      → gọi vào địa chỉ trống, trả về "0x" RỖNG
//   • precompile bật, không quyền → trả 0 (NoRole)
//   • precompile bật, có quyền    → trả 1/2/3
// Bài học từ kho tri thức (Cosmos EVM 2026-08-23): "0x" rỗng và
// "0x000…000" đọc gần giống nhau, và nhầm hai cái đó là chẩn đoán sai hoàn toàn
// nguyên nhân. Nên ở đây phân biệt bằng ĐỘ DÀI dữ liệu trả về, không chỉ giá trị.
const VAI_TRO = { 0: "KhôngCó", 1: "Enabled", 2: "Admin", 3: "Manager" };
async function docVaiTro(p, precompile, ai) {
  const data = new ethers.Interface(["function readAllowList(address) view returns (uint256)"])
    .encodeFunctionData("readAllowList", [ai]);
  const raw = await p.call({ to: precompile, data });
  if (!raw || raw === "0x") return { bat: false, vai: null, vi: "precompile KHÔNG bật (trả về rỗng)" };
  const n = Number(BigInt(raw));
  return { bat: true, vai: n, vi: VAI_TRO[n] || `vai lạ ${n}` };
}

const nghi = ms => new Promise(r => setTimeout(r, ms));

/**
 * Gửi giao dịch với nonce ĐỌC TƯƠI mỗi lượt, thử lại khi node còn trả nonce cũ.
 *
 * VÌ SAO CẦN (B-4.2): `phaiChan` cố tình gửi một giao dịch bị từ chối. Có hai kiểu
 * từ chối và chúng để lại nonce ở hai trạng thái KHÁC NHAU — `txAllowList` chặn
 * ngay lúc nộp (nonce KHÔNG tiêu), `deployerAllowList` cho vào block rồi revert
 * (nonce ĐÃ tiêu). Giao dịch kế tiếp của cùng ví đó đoán sai một trong hai đường là
 * ăn `nonce has already been used`, và bài kiểm báo đỏ ở chỗ sản phẩm hoàn toàn đúng.
 *
 * Đọc `pending` cũng chưa đủ: node vừa nhận block xong có một nhịp ngắn còn trả số
 * cũ. Nên vòng thử lại này chỉ bắt ĐÚNG lỗi nonce — mọi lỗi khác ném thẳng ra, vì
 * `phaiChan` phải nhìn thấy lý do từ chối thật để phân biệt "bị chặn" với "hết tiền".
 *
 * 🔴 **MỌI lượt gửi trong file này đi qua đây, không riêng `phaiChan`.** Bản đầu chỉ
 * bọc `phaiChan` vì tưởng bẫy nằm ở "giao dịch bị từ chối". Sai: ngay lượt chạy sau
 * đó, bài `thong-luong-cao` đỏ với `nonce too low: next nonce 1, tx nonce 0` ở hai
 * giao dịch **đều thành công** của cùng một ví — `tx.wait(1)` đã trả về mà lượt
 * `getTransactionCount("pending")` kế tiếp vẫn đọc ra số cũ. Bẫy nằm ở **mọi giao
 * dịch thứ hai trở đi của cùng một ví**, và nó chỉ cắn khi hai lượt gần nhau đủ.
 * Đó là loại lỗi đỏ ngẫu nhiên — thứ làm người ta mất niềm tin vào bài kiểm.
 */
async function guiVoiNonce(vi, tx, lan = 6) {
  let cuoi;
  for (let i = 0; i < lan; i++) {
    const nonce = await vi.provider.getTransactionCount(vi.address, "pending");
    try {
      return await vi.sendTransaction({ ...tx, nonce });
    } catch (e) {
      cuoi = e;
      if (!/nonce (has already been used|too low)|replacement transaction/i.test(String(e.message || e))) throw e;
      await nghi(1000);
    }
  }
  throw cuoi;
}

/**
 * Đợi số dư đạt giá trị mong đợi, thử lại vài nhịp.
 *
 * VÌ SAO CẦN (B-4.1): `tx.wait(1)` trả về ngay khi receipt có mặt, nhưng lượt
 * `eth_getBalance` NGAY SAU ĐÓ có thể đọc trạng thái trước block đó — đo được ở
 * preset `tu-in-tien`: mint `status 1` ở block 1 mà số dư đọc ra `0.0`, trong khi
 * thử tay trên đúng chain đó vài giây sau ra đúng `777.0`. Tin lần đọc đầu là kết
 * luận "precompile không có hiệu lực" trong khi nó vừa chạy xong.
 */
async function doiSoDu(p, dc, mong, lan = 10) {
  let du = 0n;
  for (let i = 0; i < lan; i++) {
    du = await p.getBalance(dc);
    if (du === mong) return { du, nhip: i };
    await nghi(1000);
  }
  return { du, nhip: lan };
}

const WARP = "0x0200000000000000000000000000000000000005";

/**
 * Warp có THẬT SỰ bật không (M6.1) — chạy cho MỌI preset, vì Warp nay nằm trong
 * khuôn genesis chứ không phải một lựa chọn.
 *
 * Hai bậc, cố ý không dừng ở bậc một:
 *   1. `getBlockchainID()` — `eth_call` trả 32 byte khác 0 ⇒ precompile có mặt.
 *      Bậc này một mình KHÔNG đủ: nó chỉ chứng minh có thứ gì đó ở địa chỉ đó.
 *   2. `sendWarpMessage(payload)` — GIAO DỊCH THẬT phải chốt **và sinh log**.
 *      Đây mới là thay đổi trạng thái quan sát được, đúng chuẩn mà cả mốc M5 đặt ra
 *      (bài học Cosmos EVM: staticcall trả SUCCESS + dữ liệu RỖNG, không revert).
 *
 * ⚠️ KHÔNG chứng minh được ICM ở đây — gửi một message chỉ là **đầu gửi**. Đầu nhận
 * (chain khác xác minh chữ ký) cần 2 L1 sống cùng lúc, đó là M6.2.
 */
async function kiemWarp(p, chu) {
  const iface = new ethers.Interface([
    "function getBlockchainID() view returns (bytes32)",
    "function sendWarpMessage(bytes payload) returns (bytes32)",
  ]);
  const doc = async () => {
    try { return await p.call({ to: WARP, data: iface.encodeFunctionData("getBlockchainID", []) }); }
    catch { return "0x"; }
  };

  // ═══ PHẢI MỞ BLOCK 1 TRƯỚC KHI ĐỌC — nếu không phép đo NÓI DỐI ═══
  //
  // Đã dính thật (2026-08-25): bài báo "Warp TẮT" trên chain vừa đẻ, trong khi
  // `warpConfig` nằm đúng chỗ trong genesis và đã đối chiếu md5 với server.
  //
  // Lý do: precompile kích hoạt theo **thời gian của block**, và `warpConfig` buộc
  // phải khai `blockTimestamp: 1607144400` (mốc Durango — xem D-031), trong khi
  // genesis khai `"timestamp": "0x0"`. Nên ở **block 0, Warp chưa hoạt động**, và
  // `eth_call` vào một precompile chưa hoạt động trả về `0x` RỖNG — **không phân
  // biệt được với "khoá cấu hình bị bỏ qua"**, đúng cái trạng thái mà cả mốc M5
  // sinh ra để chống. Từ block 1 (thời gian thật, 2026) trở đi nó hoạt động.
  //
  // Nên: đẩy chain qua block 0 bằng một giao dịch chuyển tiền thường (21.000 gas,
  // hằng số, không cần ước lượng — cũng chính là "giao dịch mồi" của D-030), rồi
  // mới đọc. Và báo cáo cả hai lần đọc, vì chênh lệch giữa chúng mới là bằng chứng.
  const truoc = await doc();
  if ((await p.getBlockNumber()) === 0) {
    await chot(await guiVoiNonce(chu, { to: chu.address, value: 0n, gasLimit: 21000n }), "mở block 1");
  }
  const raw = await doc();
  const co = raw && raw !== "0x" && BigInt(raw) !== 0n;
  const doiTrang = (!truoc || truoc === "0x") && co;
  kiem("Warp ĐANG BẬT (M6.1)", co,
    co ? `blockchainID ${raw.slice(0, 18)}…` + (doiTrang ? " (block 0: rỗng → sau block 1: có ⇒ kích hoạt theo thời gian block, đúng như D-031)" : "")
       : `trả về rỗng NGAY CẢ SAU block ${await p.getBlockNumber()} ⇒ khoá warpConfig thật sự bị bỏ qua`);
  if (!co) return;
  try {
    const rc = await chot(await guiVoiNonce(chu, {
      to: WARP, gasLimit: GAS_AN_TOAN,
      data: iface.encodeFunctionData("sendWarpMessage", [ethers.toUtf8Bytes("9chain-a1 warp probe")]),
    }), "sendWarpMessage");
    kiem("gửi được Warp message thật (chốt + có log)", rc.status === 1 && rc.logs.length > 0,
      `status ${rc.status} · ${rc.logs.length} log · block ${rc.blockNumber}`);
  } catch (e) {
    kiem("gửi được Warp message thật (chốt + có log)", false, sach(e.message));
  }
}

/** Đợi giao dịch chốt, ném lỗi rõ ràng nếu treo (dấu hiệu subnet không có validator). */
async function chot(tx, nhan) {
  const rc = await Promise.race([
    tx.wait(1),
    new Promise((_, x) => setTimeout(() => x(new Error(`${nhan}: không chốt sau 90s — subnet có thể chưa có validator`)), 90000)),
  ]);
  return rc;
}

// ══════════════════════════════════════════════════════════════════════════
// Mỗi bài nhận (provider, ví chủ chain) và tự chứng minh preset có hiệu lực.
const BAI = {
  "khong-phi": async (p, chu) => {
    // Đo TRỰC TIẾP: baseFee của chain phải là ĐÚNG 1 wei. Trên chain chuẩn nó là 25 gwei.
    //
    // Không phải 0 — và bài này đòi đúng 1 chứ không đòi "≤ 1" là có chủ ý: baseFee 0
    // là trạng thái làm chain KHÔNG dựng nổi block nào (`VerifyBlockFee` từ chối
    // `baseFee.Sign() <= 0` ngay trong `FinalizeAndAssemble`). Nếu ai đó sau này sửa
    // preset về 0 vì thấy "0 mới đúng nghĩa không phí", bài này phải bắt được ngay ở
    // dòng đầu thay vì để nó biểu hiện thành một chain câm. Xem D-028.
    const blk = await p.getBlock("latest");
    kiem("baseFee = 1 wei (KHÔNG phải 0 — xem D-028)", blk.baseFeePerGas === 1n, `đo được ${blk.baseFeePerGas}`);
    // Gửi với giá gas 1 wei — SÀN của mempool, không phải lựa chọn thẩm mỹ.
    // `legacypool.go:158,195`: `PriceLimit` mặc định 1 và **bị ép về 1 nếu cấu hình
    // thấp hơn**, nên giá gas 0 là thứ subnet-evm không bao giờ nhận (D-026).
    // Trên chain CHUẨN, 1 wei nằm dưới minBaseFee 25 gwei ⇒ giao dịch này bị từ
    // chối. Nó chốt được ở đây chính là bằng chứng preset có hiệu lực.
    const tx = await guiVoiNonce(chu, {
      to: "0x000000000000000000000000000000000000dEaD", value: ethers.parseEther("1"),
      gasPrice: 1n, gasLimit: 21000n,
    });
    const rc = await chot(tx, "tx giá gas 1 wei");
    kiem("giao dịch giá gas 1 wei CHỐT được", rc.status === 1, `block ${rc.blockNumber} · ${rc.hash}`);
    const phi = rc.gasUsed * (rc.gasPrice ?? 0n);
    // Ngưỡng: 1 gwei. Trên chain chuẩn cùng giao dịch này tốn 21000 × 25 gwei =
    // 525.000 gwei — cách ngưỡng năm bậc độ lớn, nên phép so này không mơ hồ.
    kiem("phí thực trả gần như bằng 0 (< 1 gwei)", phi < 1000000000n, `${phi} wei`);
  },

  "thong-luong-cao": async (p, chu) => {
    // Đo THẲNG trên header block, không đọc lại file genesis mình vừa ghi.
    //
    // Đọc genesis chỉ chứng minh "ta đã viết đúng thứ ta định viết" — đúng loại
    // bằng chứng vô giá trị mà cả mốc M5 sinh ra để chối bỏ (subnet-evm bỏ qua
    // khoá lạ trong im lặng). `gasLimit` trong header là con số chain THẬT SỰ đang
    // dùng để đóng block.
    const blk = await p.getBlock("latest");
    kiem("gasLimit của chain = 60.000.000 (gấp 5 lần chuẩn)", blk.gasLimit === 60000000n,
      `đo được ${blk.gasLimit}`);
    // Và chain phải vẫn giao dịch được — nâng trần mà chain không chạy nổi thì
    // preset này tệ hơn `chuan`, không tốt hơn.
    const rc = await chot(await guiVoiNonce(chu, {
      to: "0x000000000000000000000000000000000000dEaD", value: 1n, gasLimit: 21000n,
    }), "tx trên chain thông lượng cao");
    kiem("chain vẫn chốt giao dịch bình thường", rc.status === 1, `block ${rc.blockNumber}`);
    // Trần lý thuyết in ra để bài đo tải sau này có mốc so, không phải để kết luận.
    console.log(`      ↳ trần lý thuyết ${Number(blk.gasLimit) / 21000 / 2} TPS ` +
      `(21.000 gas/tx, targetBlockRate 2s) — CHƯA đo thật, xem M9.4`);

    // ═══ PUSH0 — kiểm chứng một GOTCHA CŨ, không liên quan preset ═══
    // HANDOFF ghi: "L1 EVM chưa bật Durango → compile contract evmVersion:'paris'
    // (không PUSH0)". Đọc source thì ngược lại: networkID 9001 không phải
    // Mainnet/Fuji ⇒ `upgrade.GetConfig` trả `Default`, ở đó
    // `DurangoTime = InitiallyActiveTime` (2020) ⇒ Durango bật từ genesis.
    // Mâu thuẫn giữa tài liệu và source thì **đo**, đừng chọn bên nào.
    // `0x5f5ff3` = PUSH0 PUSH0 RETURN. Nếu PUSH0 không tồn tại thì đó là opcode
    // lạ ⇒ deploy revert. Bám vào bài này vì nó cần một chain thật mà thôi.
    try {
      // `guiVoiNonce`, KHÔNG phải `sendTransaction` trần: lượt chạy đầu của bài này
      // (2026-08-25) đỏ với `nonce too low: next nonce 1, tx nonce 0` — đúng cái bẫy
      // B-4.2 vừa vá ở chỗ khác, tôi lặp lại nó ngay trong bài đi vá nó. Ghi lại vì
      // nó cho thấy bẫy nonce không nằm ở `phaiChan`: nó nằm ở **mọi giao dịch thứ
      // hai trở đi của cùng một ví trong cùng một bài**.
      const rcP = await chot(await guiVoiNonce(chu, { data: "0x5f5ff3", gasLimit: 200000n }), "deploy PUSH0");
      kiem("PUSH0 chạy được ⇒ Durango ĐANG BẬT (HANDOFF cũ nói ngược)",
        rcP.status === 1, `status ${rcP.status} · block ${rcP.blockNumber}`);
    } catch (e) {
      kiem("PUSH0 chạy được ⇒ Durango ĐANG BẬT (HANDOFF cũ nói ngược)", false, sach(e.message));
    }
  },

  "tu-in-tien": async (p, chu) => {
    const vt = await docVaiTro(p, NATIVE_MINTER, chu.address);
    kiem("precompile nativeMinter ĐANG BẬT", vt.bat, vt.vi);
    kiem("chủ chain có vai Admin trên precompile", vt.vai === 2, vt.vi);

    const nhan = ethers.Wallet.createRandom().address;
    const truoc = await p.getBalance(nhan);
    kiem("ví nhận bắt đầu từ 0", truoc === 0n, `${truoc}`);

    // Thử bằng eth_call TRƯỚC khi gửi giao dịch thật.
    //
    // Receipt status 0 chỉ nói "hỏng", không nói VÌ SAO — precompile trả lỗi Go và
    // nó không lọt vào receipt dưới dạng đọc được. `eth_call` chạy đúng đoạn mã đó
    // nhưng trả THẲNG chuỗi lỗi. Không có bước này thì chẩn đoán một lượt revert
    // phải đẻ lại chain (5,5 phút) cho mỗi giả thuyết.
    // Đúc token bản địa từ hư không — việc KHÔNG thể làm nếu precompile không bật.
    // Đây là lý do preset này là bài kiểm sạch nhất: không có cách nào giả được.
    const data = new ethers.Interface(["function mintNativeCoin(address,uint256)"])
      .encodeFunctionData("mintNativeCoin", [nhan, ethers.parseEther("777")]);
    console.log(`      ↳ calldata ${data.length / 2 - 1} byte (selector ${data.slice(0, 10)})`);
    try {
      await p.call({ to: NATIVE_MINTER, data, from: chu.address });
      kiem("eth_call mintNativeCoin không lỗi", true);
    } catch (e) {
      kiem("eth_call mintNativeCoin không lỗi", false, sach(e.shortMessage || e.message));
      console.log(`      ↳ LÝ DO THẬT: ${sach(JSON.stringify(e.info || e.error || {})).slice(0, 300)}`);
    }
    const rc = await chot(await guiVoiNonce(chu, { to: NATIVE_MINTER, data, gasLimit: GAS_AN_TOAN }), "mint");
    kiem("gọi precompile mintNativeCoin thành công", rc.status === 1, `block ${rc.blockNumber}`);
    // Đọc lại nhiều nhịp, không tin lần đọc đầu — xem `doiSoDu` (B-4.1).
    const { du: sau, nhip } = await doiSoDu(p, nhan, ethers.parseEther("777"));
    kiem("ví lạ nhận đúng 777 token đúc mới", sau === ethers.parseEther("777"),
      `${ethers.formatEther(sau)}${nhip ? ` (thấy sau ${nhip} nhịp)` : ""}`);
  },

  "chi-chu-deploy": async (p, chu) => {
    const vt = await docVaiTro(p, DEPLOYER_ALLOWLIST, chu.address);
    kiem("precompile deployerAllowList ĐANG BẬT", vt.bat, vt.vi);
    kiem("chủ chain có vai Admin trên precompile", vt.vai === 2, vt.vi);

    const rc = await chot(await guiVoiNonce(chu, { data: MA_DEPLOY, gasLimit: GAS_AN_TOAN }), "deploy của chủ chain");
    kiem("chủ chain DEPLOY được hợp đồng", rc.status === 1 && !!rc.contractAddress, rc.contractAddress || "không có địa chỉ");

    // Ví lạ: nạp tiền trước để chắc chắn nó trượt vì KHÔNG CÓ QUYỀN, không phải vì hết tiền.
    const la = ethers.Wallet.createRandom().connect(p);
    await chot(await guiVoiNonce(chu, { to: la.address, value: ethers.parseEther("10"), gasLimit: 100000n }), "nạp cho ví lạ");
    kiem("ví lạ đã có tiền để trả gas", (await p.getBalance(la.address)) > 0n);
    await phaiChan("ví lạ KHÔNG deploy được", () => guiVoiNonce(la, { data: MA_DEPLOY, gasLimit: 200000n }));
    // Nhưng nó vẫn phải GỬI được giao dịch thường — preset này chỉ chặn deploy.
    // Nonce tường minh: lượt trên vừa tiêu một nonce bằng đường revert-trong-block (B-4.2).
    const rc2 = await chot(await guiVoiNonce(la, { to: chu.address, value: 1n, gasLimit: 100000n }), "tx thường của ví lạ");
    kiem("ví lạ VẪN gửi được giao dịch thường (chỉ chặn deploy)", rc2.status === 1, `block ${rc2.blockNumber}`);
  },

  "kin": async (p, chu) => {
    const vt = await docVaiTro(p, TX_ALLOWLIST, chu.address);
    kiem("precompile txAllowList ĐANG BẬT", vt.bat, vt.vi);
    kiem("chủ chain có vai Admin trên precompile", vt.vai === 2, vt.vi);

    const rc = await chot(await guiVoiNonce(chu, { to: "0x000000000000000000000000000000000000dEaD", value: 1n, gasLimit: 100000n }), "tx của chủ chain");
    kiem("chủ chain giao dịch được (Admin bao hàm Enabled)", rc.status === 1, `block ${rc.blockNumber}`);

    const la = ethers.Wallet.createRandom().connect(p);
    await chot(await guiVoiNonce(chu, { to: la.address, value: ethers.parseEther("10"), gasLimit: 100000n }), "nạp cho ví lạ");
    kiem("ví lạ đã có tiền", (await p.getBalance(la.address)) > 0n);
    await phaiChan("ví lạ KHÔNG gửi được giao dịch nào", () => guiVoiNonce(la, { to: chu.address, value: 1n, gasLimit: 21000n }));
  },
};

// ══════════════════════════════════════════════════════════════════════════
if (!TOKEN) {
  console.log("✗ thiếu A1_CONSOLE_TOKEN — nạp console.env trước khi chạy");
  process.exit(1);
}

const danhSach = CHI ? [CHI] : Object.keys(BAI);

// Chế độ gỡ lỗi: dùng lại chain có sẵn. Chỉ hợp lệ với MỘT preset (`--chi`) vì mỗi
// chain chỉ mang đúng một kiểu.
if (RPC_CO_SAN) {
  if (!CHI || !BAI[CHI]) { console.log("✗ --rpc phải đi kèm --chi <preset> hợp lệ"); process.exit(1); }
  if (!KHOA) { console.log("✗ --rpc phải đi kèm --wallet-key <privkey của chủ chain>"); process.exit(1); }
  console.log(`\n── chạy lại bài "${CHI}" trên chain có sẵn ──\n   ${RPC_CO_SAN}`);
  const p = new ethers.JsonRpcProvider(RPC_CO_SAN, undefined, { staticNetwork: true });
  const chu = new ethers.Wallet(KHOA, p);
  console.log(`   chủ chain: ${chu.address}`);
  try { await BAI[CHI](p, chu); }
  catch (e) { kiem(`bài "${CHI}" chạy trọn vẹn`, false, sach(e.message)); }
  console.log(`\n════ ${ket.length - hong}/${ket.length} ĐẠT ════`);
  process.exit(hong ? 1 : 0);
}

for (const id of danhSach) {
  if (!BAI[id]) { console.log(`✗ không có bài cho preset "${id}"`); hong++; continue; }
  const ten = "P" + id.replace(/-/g, "").slice(0, 8) + Date.now().toString(36).slice(-4).toUpperCase();
  console.log(`\n── preset "${id}" → chain ${ten} ──`);

  const vi = KHOA ? new ethers.Wallet(KHOA) : ethers.Wallet.createRandom();
  let chain = null;
  try {
    const t0 = Date.now();
    chain = await api("/api/create", { name: ten, admin: vi.address, preset: id });
    kiem("đẻ được chain", true, `${((Date.now() - t0) / 1000).toFixed(1)}s · chainId ${chain.chainId}`);
    kiem("console khai đúng preset", chain.preset === id, String(chain.preset));
    // M5.4: đáp án của /api/create phải mang theo lời dặn về giao dịch đầu tiên.
    // Kiểm ở đây vì đây là chỗ DUY NHẤT trong toàn bộ bộ nghiệm thu thật sự gọi
    // `/api/create` trên mạng công khai — và một lời cảnh báo không được gửi đi thì
    // im lặng y hệt lúc chưa có nó.
    kiem("đáp án kèm lời dặn giao dịch đầu (M5.4)",
      !!(chain.notes && chain.notes.title && chain.notes.how),
      chain.notes ? chain.notes.title : "THIẾU trường notes");
    if (GIU) console.log(`      ↳ giữ lại để gỡ lỗi. Chạy lại nhanh:\n` +
      `        node local-net/faucet/preset-test.mjs --chi ${id} --rpc ${chain.rpc} --wallet-key <privkey>`);
  } catch (e) {
    kiem("đẻ được chain", false, sach(e.message));
    continue;
  }

  try {
    const p = new ethers.JsonRpcProvider(chain.rpc, undefined, { staticNetwork: true });
    const chu = vi.connect(p);
    const du = await p.getBalance(vi.address);
    kiem("genesis cấp phát cho chủ chain", du > 0n, ethers.formatEther(du));
    // Warp nằm trong KHUÔN genesis (M6.1), không phải trong preset ⇒ kiểm cho MỌI
    // preset, ở đây chứ không ở trong từng bài. Đặt TRƯỚC `BAI[id]` để nó cũng là
    // phép mở block 1 (giao dịch mồi tự nhiên) cho các bài phía sau.
    await kiemWarp(p, chu);
    await BAI[id](p, chu);
  } catch (e) {
    kiem(`bài "${id}" chạy trọn vẹn`, false, sach(e.message));
  }

  if (!GIU) {
    try {
      const r = await api("/api/revoke", { name: ten, xacNhan: ten });
      kiem("thu hồi, trả lại slot", true, `còn ${r.dangTrack}/${r.tran} L1`);
    } catch (e) {
      // Thu hồi hỏng là việc PHẢI biết: nó để lại rác trong danh bạ công khai và
      // ăn mất một slot trong trần 15.
      kiem("thu hồi, trả lại slot", false, sach(e.message));
    }
  } else {
    console.log(`    ℹ️  --giu: giữ lại "${ten}", nó chiếm một slot vĩnh viễn`);
  }
}

console.log(`\n════ ${ket.length - hong}/${ket.length} ĐẠT ════`);
if (hong) {
  console.log("HỎNG:");
  for (const k of ket.filter(k => !k.dat)) console.log(`  ✗ ${k.ten}${k.chiTiet ? " — " + k.chiTiet : ""}`);
}
process.exit(hong ? 1 : 0);
