/**
 * bridge-test.mjs — M6.2 bước 2: TÀI SẢN đi từ L1 này sang L1 kia, có bằng chứng hai đầu.
 *
 * `warp-test.mjs` đã chứng minh **message** qua được và được xác minh. Bài này đi
 * nốt quãng còn lại của mốc: một khoản token gốc rời chain nguồn và xuất hiện ở
 * chain đích, và cả hai đầu đều có giao dịch thật đối chiếu được.
 *
 * ═══ ĐO BẰNG SỐ DƯ, KHÔNG ĐO BẰNG "GỌI ĐƯỢC HÀM" ═══
 * Bài này không kết luận từ status 1. Nó đọc **bốn số dư** trước và sau:
 *   - chain nguồn: ví gửi giảm · hợp đồng cầu tăng đúng số đã khoá
 *   - chain đích : hợp đồng cầu giảm · người nhận tăng đúng số đó
 * Bốn số này khớp thì tài sản thật sự đã chuyển; thiếu chúng thì "cầu chạy" và
 * "hàm không revert" là hai câu không phân biệt được.
 *
 * ═══ BA BÀI PHẢI ĐỎ ═══
 * Một cây cầu chỉ đúng khi nó biết TỪ CHỐI. Ba đường tấn công rẻ nhất, và cả ba
 * đều phải revert:
 *   1. **Phát lại** — nộp đúng giao dịch nhận lần thứ hai. Message đã ký thì ký
 *      vĩnh viễn; không có sổ chống phát lại thì một lượt gửi rút cạn thanh khoản.
 *   2. **Mạo danh đầu gửi** — khai `hopDongNguon` là một địa chỉ khác. Chữ ký
 *      validator vẫn hợp lệ hoàn toàn; thứ duy nhất chặn là phép so danh tính.
 *   3. **Không predicate** — chữ ký đi bằng access list, không phải calldata.
 *
 * Chạy TRÊN SERVER:
 *   ssh ... 'cd ~/9chain-a1/src && set -a; . ~/9chain-a1/console.env; set +a; \
 *            node local-net/faucet/bridge-test.mjs'
 * Mặc định tự thu hồi cả hai chain ⇒ chạy lại được vô hạn. `--giu` để giữ lại.
 */
import { ethers } from "ethers";
import { hex32ToCb58, cb58ToHex } from "../lib/cb58.mjs";
import { CAU_TAI_SAN_ABI, CAU_TAI_SAN_BIN, CAU_TAI_SAN_VAN_TAY_NGUON } from "../lib/asset-bridge.mjs";
import {
  WARP, guiVoiNonce, chot, napHopDong, moBlock1,
  goiPredicate, bocLogWarp, apiWarpDaBat, xinChuKy, phaiRevert,
} from "./warp-common.mjs";

const args = process.argv.slice(2);
const co = t => args.includes("--" + t);
const opt = (t, mac) => { const i = args.indexOf("--" + t); return i >= 0 && args[i + 1] ? args[i + 1] : mac; };

const CONSOLE = opt("console", "http://127.0.0.1:8091");
const TOKEN = process.env.A1_CONSOLE_TOKEN || "";
const GIU = co("giu");

const THANH_KHOAN = ethers.parseEther("100");   // nạp sẵn cho đầu nhận
const SO_CHUYEN = ethers.parseEther("7");       // khoản đem qua cầu

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

/** Đẻ chain, mở block 1, nạp hợp đồng cầu. Ghi tên vào sổ dọn NGAY sau khi đẻ. */
async function dungChain(ten, vi, nhan, daDe) {
  const t0 = Date.now();
  const chain = await api("/api/create", { name: ten, admin: vi.address });
  daDe.push(ten);
  kiem(`${nhan}: đẻ được chain`, true, `${((Date.now() - t0) / 1000).toFixed(1)}s · chainId ${chain.chainId}`);

  const p = new ethers.JsonRpcProvider(chain.rpc, undefined, { staticNetwork: true });
  const chu = vi.connect(p);
  await moBlock1(chu, nhan);
  const { hd, diaChi } = await napHopDong(chu, CAU_TAI_SAN_ABI, CAU_TAI_SAN_BIN, `${nhan} nạp AssetBridge`);
  kiem(`${nhan}: nạp được hợp đồng cầu`, /^0x[0-9a-fA-F]{40}$/.test(diaChi), diaChi);
  return { chain, p, chu, hd, diaChi, idHex: cb58ToHex(chain.blockchainID) };
}

// ══════════════════════════════════════════════════════════════════════════
if (!TOKEN) {
  console.log("✗ thiếu A1_CONSOLE_TOKEN — nạp console.env trước khi chạy");
  process.exit(1);
}

const hau = Date.now().toString(36).slice(-4).toUpperCase();
const TEN_A = "CauNguon" + hau;
const TEN_B = "CauDich" + hau;
const vi = ethers.Wallet.createRandom();
const nguoiNhan = ethers.Wallet.createRandom().address;   // ví trắng ở chain đích
const daDe = [];

console.log(`\n── M6.2 bước 2: chuyển TÀI SẢN giữa hai L1 ──`);
console.log(`   chủ chain  : ${vi.address}`);
console.log(`   người nhận : ${nguoiNhan} (ví trắng, chỉ có tiền nếu cầu trả)`);
console.log(`   hợp đồng   : AssetBridge, vân tay nguồn ${CAU_TAI_SAN_VAN_TAY_NGUON}`);

try {
  const A = await dungChain(TEN_A, vi, "nguồn", daDe);
  const B = await dungChain(TEN_B, vi, "đích", daDe);
  {
    const r = await apiWarpDaBat(A.chain.rpc, hex32ToCb58("0x" + "11".repeat(32)));
    kiem("API Warp đã bật trên chain nguồn", r.bat, r.viSao);
  }

  // ─────────────────────────────────── GHIM DANH TÍNH HAI ĐẦU (bắt buộc từ 2026-08-26)
  // Trước đây `nhanVaTra` nhận `chainNguon`/`hopDongNguon` từ NGƯỜI GỌI rồi `require`
  // so message với chính hai giá trị đó — một phép so luôn đúng, tức không chốt gì.
  // Nay danh tính là trạng thái của hợp đồng, ghim đúng một lần. Vòng gà-trứng (mỗi
  // bên cần địa chỉ của bên kia) giải bằng cách nạp cả hai rồi mới ghim.
  await chot(await guiVoiNonce(A.chu, {
    to: A.diaChi, gasLimit: 200000n,
    data: A.hd.interface.encodeFunctionData("ghimNguon", [B.idHex, B.diaChi]),
  }), "ghim nguồn cho đầu A");
  await chot(await guiVoiNonce(B.chu, {
    to: B.diaChi, gasLimit: 200000n,
    data: B.hd.interface.encodeFunctionData("ghimNguon", [A.idHex, A.diaChi]),
  }), "ghim nguồn cho đầu B");
  kiem("đầu đích đã ghim đúng chain nguồn", (await B.hd.chainNguon()) === A.idHex, A.idHex);
  kiem("đầu đích đã ghim đúng hợp đồng nguồn",
    (await B.hd.hopDongNguon()).toLowerCase() === A.diaChi.toLowerCase(), A.diaChi);
  {
    const r = await phaiRevert(B.chu, {
      to: B.diaChi, gasLimit: 200000n,
      data: B.hd.interface.encodeFunctionData("ghimNguon", [A.idHex, A.diaChi]),
    });
    kiem("đối chứng: ghim LẦN HAI ⇒ phải revert", r.chan, r.viSao);
  }

  // ───────────────────────────────────────────── nạp thanh khoản cho đầu nhận
  await chot(await guiVoiNonce(B.chu, { to: B.diaChi, value: THANH_KHOAN, gasLimit: 100000n }), "nạp thanh khoản");
  const tkTruoc = await B.p.getBalance(B.diaChi);
  kiem("đầu nhận có thanh khoản", tkTruoc === THANH_KHOAN, ethers.formatEther(tkTruoc));
  const nhanTruoc = await B.p.getBalance(nguoiNhan);
  kiem("người nhận khởi điểm TRẮNG", nhanTruoc === 0n, ethers.formatEther(nhanTruoc));

  // ──────────────────────────────────────────────── khoá tài sản ở chain nguồn
  const cauTruoc = await A.p.getBalance(A.diaChi);
  const rKhoa = await chot(await guiVoiNonce(A.chu, {
    to: A.diaChi,
    data: A.hd.interface.encodeFunctionData("khoaVaGui", [nguoiNhan]),
    value: SO_CHUYEN,
    gasLimit: 500000n,
  }), "khoá và gửi");
  const cauSau = await A.p.getBalance(A.diaChi);
  kiem("🔴 chain NGUỒN: tài sản đã bị khoá trong hợp đồng cầu",
    cauSau - cauTruoc === SO_CHUYEN,
    `${ethers.formatEther(cauTruoc)} → ${ethers.formatEther(cauSau)} · tx ${rKhoa.hash}`);

  // ────────────────────────────────────────────── message → chữ ký → predicate
  const tin = bocLogWarp(rKhoa);
  kiem("lượt khoá phát ra warp message", !!tin, tin ? `block ${rKhoa.blockNumber}` : "không có log precompile");
  if (!tin) throw new Error("không có message để đi tiếp");
  kiem("message ghi đúng hợp đồng cầu là người gửi",
    tin.nguoiGui.toLowerCase() === A.diaChi.toLowerCase(), tin.nguoiGui);

  const { signed, loi: loiKy } = await xinChuKy(A.p, hex32ToCb58(tin.messageIdHex));
  kiem("gom được chữ ký tổng hợp của validator subnet nguồn", !!signed,
    signed ? `${ethers.getBytes(signed).length} byte` : sach(loiKy).slice(0, 140));
  if (!signed) throw new Error("không có chữ ký để đi tiếp");
  const predicate = goiPredicate(signed);

  // ──────────────────────────────────────────────── nhận tài sản ở chain đích
  const goiNhan = B.hd.interface.encodeFunctionData("nhanVaTra", [0]);
  const rNhan = await (await guiVoiNonce(B.chu, {
    to: B.diaChi, data: goiNhan, gasLimit: 2000000n,
    accessList: [{ address: WARP, storageKeys: predicate }],
  })).wait(1);
  kiem("chain đích chấp nhận lượt nhận", rNhan?.status === 1, `gas ${rNhan?.gasUsed} · tx ${rNhan?.hash}`);

  const nhanSau = await B.p.getBalance(nguoiNhan);
  const tkSau = await B.p.getBalance(B.diaChi);
  kiem("🔴 chain ĐÍCH: người nhận nhận ĐÚNG số đã khoá bên nguồn",
    nhanSau - nhanTruoc === SO_CHUYEN, `${ethers.formatEther(nhanTruoc)} → ${ethers.formatEther(nhanSau)}`);
  kiem("thanh khoản đầu nhận giảm đúng bấy nhiêu",
    tkTruoc - tkSau === SO_CHUYEN, `${ethers.formatEther(tkTruoc)} → ${ethers.formatEther(tkSau)}`);

  // ─────────────────────────────────────────────────── các bài PHẢI ĐỎ
  for (const [ten, tx] of [
    ["đối chứng: PHÁT LẠI đúng message đó ⇒ phải revert", {
      to: B.diaChi, data: goiNhan, gasLimit: 2000000n,
      accessList: [{ address: WARP, storageKeys: predicate }],
    }],
    ["đối chứng: BỎ predicate ⇒ phải revert", {
      to: B.diaChi, data: goiNhan, gasLimit: 2000000n,
    }],
  ]) {
    const r = await phaiRevert(B.chu, tx);
    kiem(ten, r.chan, r.viSao);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔴 ĐỐI CHỨNG QUAN TRỌNG NHẤT: TÁI HIỆN ĐÚNG ĐÒN RÚT SẠCH CỦA BẢN CŨ
  // ═══════════════════════════════════════════════════════════════════════════
  // Bản cũ nhận `chainNguon`/`hopDongNguon` từ người gọi rồi so message với chính
  // hai giá trị đó. Kẻ tấn công nạp một bản sao hợp đồng cầu trên chain mà họ kiểm
  // soát, gửi message tuỳ ý, rồi gọi `nhanVaTra(index, chainCuaHo, hopDongCuaHo)` —
  // cả hai `require` đều qua, vì chúng LUÔN qua.
  //
  // Bài này dựng đúng kịch bản đó: một hợp đồng KHÁC, trên chính chain nguồn, gửi
  // một message hoàn toàn hợp lệ (validator subnet ký thật). Chỉ có một thứ sai:
  // nó không phải hợp đồng mà đầu đích đã GHIM.
  //
  // ⚠️ Bài đối chứng CŨ ("khai SAI hợp đồng nguồn") ĐÃ BỊ GỠ và không được đưa lại:
  // nó truyền một giá trị *sai* nên rơi khỏi phép so lặp thừa và revert — nhìn như
  // chứng minh chốt danh tính, thật ra chứng minh đúng số không. Nó xanh suốt trong
  // khi lỗ hổng đang mở.
  {
    const X = await napHopDong(A.chu, CAU_TAI_SAN_ABI, CAU_TAI_SAN_BIN, "kẻ tấn công nạp bản sao cầu trên chain nguồn");
    kiem("dựng được hợp đồng 'kẻ tấn công' trên chain nguồn",
      /^0x[0-9a-fA-F]{40}$/.test(X.diaChi) && X.diaChi.toLowerCase() !== A.diaChi.toLowerCase(), X.diaChi);

    const rX = await chot(await guiVoiNonce(A.chu, {
      to: X.diaChi, value: SO_CHUYEN,
      data: X.hd.interface.encodeFunctionData("khoaVaGui", [nguoiNhan]),
      gasLimit: 500000n,
    }), "kẻ tấn công gửi warp message");

    const tinX = bocLogWarp(rX);
    kiem("message của kẻ tấn công CÓ được validator ký (chữ ký hợp lệ hoàn toàn)", !!tinX);
    if (tinX) {
      const { signed: kyX } = await xinChuKy(A.p, hex32ToCb58(tinX.messageIdHex));
      kiem("gom được chữ ký cho message của kẻ tấn công", !!kyX);
      if (kyX) {
        const truocDon = await B.p.getBalance(nguoiNhan);
        const r = await phaiRevert(B.chu, {
          to: B.diaChi, gasLimit: 2000000n,
          data: B.hd.interface.encodeFunctionData("nhanVaTra", [0]),
          accessList: [{ address: WARP, storageKeys: goiPredicate(kyX) }],
        });
        kiem("🔴 ĐÒN RÚT SẠCH CỦA BẢN CŨ ⇒ nay phải revert 'sai hop dong nguon'", r.chan, r.viSao);
        kiem("và không một đồng nào rời khỏi thanh khoản",
          (await B.p.getBalance(nguoiNhan)) === truocDon, ethers.formatEther(truocDon));
      }
    }
  }

  const nhanCuoi = await B.p.getBalance(nguoiNhan);
  kiem("sau mọi lượt bị chặn, người nhận KHÔNG nhận thêm đồng nào",
    nhanCuoi === nhanSau, ethers.formatEther(nhanCuoi));
} catch (e) {
  kiem("bài chạy trọn vẹn", false, sach(e.message || e));
}

if (GIU) {
  console.log(`\n  ℹ️  --giu: giữ lại ${daDe.join(", ")} — mỗi chain ăn một slot vĩnh viễn`);
} else {
  for (const ten of daDe) {
    try {
      const r = await api("/api/revoke", { name: ten, xacNhan: ten });
      kiem(`thu hồi ${ten}, trả lại slot`, true, `còn ${r.dangTrack}/${r.tran} L1`);
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
