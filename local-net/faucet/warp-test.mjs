/**
 * warp-test.mjs — M6.2 bước 1: một message đi từ L1 này sang L1 kia và ĐƯỢC XÁC MINH.
 *
 * ═══ BÀI NÀY ĐO CÁI GÌ, VÀ VÌ SAO PHẢI ĐO ĐÚNG CÁI ĐÓ ═══
 * M6.1 đã chứng minh `sendWarpMessage` là giao dịch thật, chốt được, có log. Nhưng
 * đó là **một nửa**: gửi đi mà đầu kia không chứng minh được thì chưa có cầu nào cả.
 * Nửa còn lại có ba mắt xích, và mỗi mắt xích hỏng theo kiểu riêng:
 *
 *   1. **API Warp** (`warp_getMessageAggregateSignature`) — TẮT MẶC ĐỊNH. Không có
 *      nó thì không gom được chữ ký BLS của validator. Hỏng ở đây trông như gọi sai
 *      tên hàm, không như thiếu cấu hình.
 *   2. **Chữ ký tổng hợp** — phải đủ quorum của subnet NGUỒN.
 *   3. **Predicate** — chữ ký đi vào giao dịch qua **access list**, KHÔNG phải
 *      calldata. Đặt nhầm chỗ thì `getVerifiedWarpMessage` trả `valid=false` mà
 *      giao dịch vẫn chốt bình thường.
 *
 * ═══ VÌ SAO CÓ HAI BÀI PHẢI ĐỎ ═══
 * `validateWarpMessage` chỉ `require` — không đổi trạng thái gì. Nên "status 1" một
 * mình KHÔNG chứng minh được điều gì cho tới khi ta cũng chứng minh được rằng nó
 * **biết đỏ**: sửa một byte payload phải revert, và bỏ predicate đi phải revert.
 * Thiếu hai bài đó thì một hợp đồng rỗng cũng qua bài này.
 *
 * Chạy TRÊN SERVER (cần token console + đường loopback tới node):
 *   ssh ... 'cd ~/9chain-a1/src && set -a; . ~/9chain-a1/console.env; set +a; \
 *            node local-net/faucet/warp-test.mjs'
 *
 * Mặc định **tự thu hồi cả hai chain** khi xong ⇒ chạy lại được vô hạn. `--giu` để
 * giữ lại soi tay (khi đó chúng ăn hai slot vĩnh viễn trong trần 15).
 */
import { ethers } from "ethers";
import { hex32ToCb58, cb58ToHex } from "../lib/cb58.mjs";
import { EXAMPLE_WARP_ABI, EXAMPLE_WARP_BIN } from "../lib/example-warp.mjs";
import {
  WARP, guiVoiNonce, chot, napHopDong, moBlock1,
  goiPredicate, bocLogWarp, apiWarpDaBat, xinChuKy, phaiRevert,
  thaoTacDai,
} from "./warp-common.mjs";

const args = process.argv.slice(2);
const co = t => args.includes("--" + t);
const opt = (t, mac) => { const i = args.indexOf("--" + t); return i >= 0 && args[i + 1] ? args[i + 1] : mac; };

const CONSOLE = opt("console", "http://127.0.0.1:8091");
const TOKEN = process.env.A1_CONSOLE_TOKEN || "";
const GIU = co("giu");

const ket = [];
let hong = 0;
function kiem(ten, dat, chiTiet = "") {
  ket.push({ ten, dat: !!dat, chiTiet });
  if (!dat) hong++;
  console.log(`  ${dat ? "✓" : "✗"} ${ten}${chiTiet ? "  — " + chiTiet : ""}`);
}
function sach(s) { const t = String(s ?? ""); return TOKEN ? t.split(TOKEN).join("<TOKEN>") : t; }
async function api(duong, body) {
  const r = await fetch(CONSOLE + duong, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify(body),
  });
  const t = await r.text();
  let j; try { j = JSON.parse(t); } catch { throw new Error(`đáp án không phải JSON (HTTP ${r.status}): ${t.slice(0, 200)}`); }
  if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
  return j;
}

/**
 * Dựng một chain mới rồi mở block 1 và nạp hợp đồng ExampleWarp lên đó.
 *
 * Mở block 1 bằng một giao dịch CHUYỂN TIỀN THƯỜNG trước khi deploy là bắt buộc, không
 * phải cho gọn: `eth_estimateGas` ước lượng THIẾU cho giao dịch đầu tiên của chain vừa
 * đẻ (D-025), và nó hỏng câm — receipt chỉ có `status: 0`, không lý do. Chuyển tiền
 * thường tốn đúng 21.000 gas (hằng số EVM) nên không cần ước lượng gì cả.
 */
async function dungChain(ten, vi, nhan, daDe) {
  const t0 = Date.now();
  const chain = await thaoTacDai({
    consoleUrl: CONSOLE, token: TOKEN,
    danhBaUrl: "https://a1.9chain.org/chains/data/console-chains.json",
    loai: "create", ten, body: { name: ten, admin: vi.address },
  });   // POST dài KHÔNG kết luận được — xem thaoTacDai() trong warp-common.mjs
  // GHI VÀO SỔ DỌN NGAY, trước mọi bước có thể ném lỗi.
  //
  // Bản đầu ghi ở chỗ gọi, SAU khi hàm này trả về — nên lượt chạy đầu tiên vấp bẫy
  // nonce ở bước nạp hợp đồng và để lại một chain mồ côi ăn một slot vĩnh viễn.
  // Chain đã tồn tại từ giây `api()` trả về; sổ dọn phải phản ánh đúng giây đó.
  daDe.push(ten);
  kiem(`${nhan}: đẻ được chain`, true, `${((Date.now() - t0) / 1000).toFixed(1)}s · chainId ${chain.chainId} · ${chain.blockchainID}`);

  const p = new ethers.JsonRpcProvider(chain.rpc, undefined, { staticNetwork: true });
  const chu = vi.connect(p);
  const du = await p.getBalance(vi.address);
  kiem(`${nhan}: genesis cấp phát cho chủ chain`, du > 0n, ethers.formatEther(du));

  await moBlock1(chu, nhan);

  const { hd, diaChi } = await napHopDong(chu, EXAMPLE_WARP_ABI, EXAMPLE_WARP_BIN, `${nhan} nạp ExampleWarp`);
  kiem(`${nhan}: nạp được hợp đồng ExampleWarp`, /^0x[0-9a-fA-F]{40}$/.test(diaChi), diaChi);

  // Warp precompile CÓ bật thật chưa — đọc qua chính hợp đồng, và đọc SAU khi chain
  // đã qua block 0. `validateGetBlockchainID` revert nếu số không khớp, nên nó vừa
  // là phép kiểm precompile sống vừa là phép kiểm ta hiểu đúng blockchainID.
  const idHex = cb58ToHex(chain.blockchainID);
  let khop = false, viSao = "";
  try { await hd.validateGetBlockchainID(idHex); khop = true; }
  catch (e) { viSao = sach(e.shortMessage || e.message); }
  kiem(`${nhan}: precompile Warp sống, getBlockchainID khớp danh bạ`, khop, khop ? idHex : viSao);

  return { chain, p, chu, hd, diaChi, idHex };
}

// ══════════════════════════════════════════════════════════════════════════
if (!TOKEN) {
  console.log("✗ thiếu A1_CONSOLE_TOKEN — nạp console.env trước khi chạy");
  process.exit(1);
}

const hau = Date.now().toString(36).slice(-4).toUpperCase();
const TEN_A = "WarpNguon" + hau;
const TEN_B = "WarpDich" + hau;
const vi = ethers.Wallet.createRandom();
const daDe = [];

console.log(`\n── M6.2: message qua lại giữa hai L1 ──`);
console.log(`   ví chủ (dùng chung cho cả hai chain): ${vi.address}`);

try {
  // ─────────────────────────────────────────────────────────── chain nguồn + đích
  const A = await dungChain(TEN_A, vi, "nguồn", daDe);
  const B = await dungChain(TEN_B, vi, "đích", daDe);
  kiem("hai chain là hai chain khác nhau", A.idHex !== B.idHex);

  // API Warp có bật không — kiểm TRƯỚC khi gửi message, xem apiWarpDaBat().
  {
    const r = await apiWarpDaBat(A.chain.rpc, hex32ToCb58("0x" + "11".repeat(32)));
    kiem("API Warp đã bật trên chain nguồn", r.bat, r.viSao);
  }

  // ─────────────────────────────────────────────────────────── gửi message từ A
  const payload = ethers.toUtf8Bytes(`9Chain-A1 M6.2 ${hau}`);
  const payloadHex = ethers.hexlify(payload);
  const rGui = await chot(
    await guiVoiNonce(A.chu, {
      to: A.diaChi,
      data: A.hd.interface.encodeFunctionData("sendWarpMessage", [payloadHex]),
      gasLimit: 500000n,
    }), "gửi warp message");

  const tin = bocLogWarp(rGui);
  kiem("chain nguồn sinh log SendWarpMessage từ precompile", !!tin,
    tin ? `block ${rGui.blockNumber}` : "không thấy log nào của precompile");
  if (!tin) throw new Error("không có log để đi tiếp");
  const { nguoiGui, messageIdHex } = tin;
  kiem("người gửi ghi trong message là hợp đồng trên chain nguồn",
    nguoiGui.toLowerCase() === A.diaChi.toLowerCase(), nguoiGui);

  const messageId58 = hex32ToCb58(messageIdHex);
  kiem("đổi được messageID hex → cb58 cho API", /^[1-9A-HJ-NP-Za-km-z]{40,60}$/.test(messageId58), messageId58);

  // Gom chữ ký BLS của validator subnet NGUỒN — xem xinChuKy().
  const { signed, loi: loiKy } = await xinChuKy(A.p, messageId58);
  kiem("gom được chữ ký tổng hợp của validator subnet nguồn", !!signed,
    signed ? `${ethers.getBytes(signed).length} byte` : sach(loiKy).slice(0, 140));
  if (!signed) throw new Error("không có chữ ký để đi tiếp");

  const predicate = goiPredicate(signed);
  kiem("đóng gói predicate đúng bội 32 byte", predicate.every(k => k.length === 66),
    `${predicate.length} khối`);

  // ────────────────────────────────────────────── chain đích XÁC MINH message
  const goiHopLe = B.hd.interface.encodeFunctionData("validateWarpMessage",
    [0, A.idHex, A.diaChi, payloadHex]);

  const rNhan = await (await guiVoiNonce(B.chu, {
    to: B.diaChi,
    data: goiHopLe,
    gasLimit: 2000000n,
    accessList: [{ address: WARP, storageKeys: predicate }],
  })).wait(1);
  kiem("🔴 CHAIN ĐÍCH XÁC MINH ĐƯỢC MESSAGE TỪ CHAIN NGUỒN", rNhan?.status === 1,
    `block ${rNhan?.blockNumber} · gas ${rNhan?.gasUsed}`);

  // ────────────────────────────────────────────── hai bài PHẢI ĐỎ (đối chứng)
  //
  // Không có hai bài này thì bài trên vô nghĩa: một hợp đồng không kiểm gì cũng
  // trả status 1. Xem phaiRevert() — `wait()` NÉM LỖI khi status 0.
  {
    const bia = ethers.hexlify(ethers.toUtf8Bytes(`9Chain-A1 M6.2 ${hau} BIA`));
    const r = await phaiRevert(B.chu, {
      to: B.diaChi,
      data: B.hd.interface.encodeFunctionData("validateWarpMessage", [0, A.idHex, A.diaChi, bia]),
      gasLimit: 2000000n,
      accessList: [{ address: WARP, storageKeys: predicate }],
    });
    kiem("đối chứng: payload bị sửa ⇒ PHẢI revert", r.chan, r.viSao);
  }
  {
    const r = await phaiRevert(B.chu, { to: B.diaChi, data: goiHopLe, gasLimit: 2000000n });
    kiem("đối chứng: bỏ predicate ⇒ PHẢI revert", r.chan, r.viSao);
  }
  {
    const r = await phaiRevert(B.chu, {
      to: B.diaChi, gasLimit: 2000000n,
      data: B.hd.interface.encodeFunctionData("validateWarpMessage", [0, B.idHex, A.diaChi, payloadHex]),
      accessList: [{ address: WARP, storageKeys: predicate }],
    });
    kiem("đối chứng: khai SAI chain nguồn ⇒ PHẢI revert", r.chan, r.viSao);
  }
} catch (e) {
  kiem("bài chạy trọn vẹn", false, sach(e.message || e));
}

// ─────────────────────────────────────────────────────────────────── dọn dẹp
if (GIU) {
  console.log(`\n  ℹ️  --giu: giữ lại ${daDe.join(", ")} — mỗi chain ăn một slot vĩnh viễn`);
} else {
  for (const ten of daDe) {
    try {
      const r = await thaoTacDai({
        consoleUrl: CONSOLE, token: TOKEN,
        danhBaUrl: "https://a1.9chain.org/chains/data/console-chains.json",
        loai: "revoke", ten, body: { name: ten, xacNhan: ten },
      });
      kiem(`thu hồi ${ten}, trả lại slot`, true, r.dangTrack !== undefined ? `còn ${r.dangTrack}/${r.tran} L1` : "xác nhận qua danh bạ");
    } catch (e) {
      kiem(`thu hồi ${ten}, trả lại slot`, false, sach(e.message));
    }
  }
}

console.log(`\n════ ${ket.length - hong}/${ket.length} ${hong ? "KHÔNG ĐẠT" : "ĐẠT"} ════`);
if (hong) {
  console.log("HỎNG:");
  for (const k of ket.filter(k => !k.dat)) console.log(`  ✗ ${k.ten}${k.chiTiet ? " — " + k.chiTiet : ""}`);
}
process.exit(hong ? 1 : 0);
