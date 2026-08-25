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
// hợp đồng có runtime rỗng. Chỉ dùng PUSH1 nên KHÔNG dính PUSH0 (L1 EVM chưa bật
// Durango — đã ghi trong HANDOFF).
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
    // Đo TRỰC TIẾP: baseFee của chain phải là 0. Trên chain chuẩn nó là 25 gwei.
    const blk = await p.getBlock("latest");
    kiem("baseFee = 0", blk.baseFeePerGas === 0n, `đo được ${blk.baseFeePerGas}`);
    // Gửi với giá gas 1 wei — SÀN của mempool, không phải lựa chọn thẩm mỹ.
    // `legacypool.go:158,195`: `PriceLimit` mặc định 1 và **bị ép về 1 nếu cấu hình
    // thấp hơn**, nên giá gas 0 là thứ subnet-evm không bao giờ nhận. Đã đo: node
    // nhận giao dịch giá gas 0 rồi không bao giờ đưa nó vào block (D-026).
    // Trên chain CHUẨN, 1 wei nằm dưới minBaseFee 25 gwei ⇒ giao dịch này bị từ
    // chối. Nó chốt được ở đây chính là bằng chứng preset có hiệu lực.
    const tx = await chu.sendTransaction({
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
    const rc = await chot(await chu.sendTransaction({ to: NATIVE_MINTER, data, gasLimit: GAS_AN_TOAN }), "mint");
    kiem("gọi precompile mintNativeCoin thành công", rc.status === 1, `block ${rc.blockNumber}`);
    const sau = await p.getBalance(nhan);
    kiem("ví lạ nhận đúng 777 token đúc mới", sau === ethers.parseEther("777"), ethers.formatEther(sau));
  },

  "chi-chu-deploy": async (p, chu) => {
    const vt = await docVaiTro(p, DEPLOYER_ALLOWLIST, chu.address);
    kiem("precompile deployerAllowList ĐANG BẬT", vt.bat, vt.vi);
    kiem("chủ chain có vai Admin trên precompile", vt.vai === 2, vt.vi);

    const rc = await chot(await chu.sendTransaction({ data: MA_DEPLOY, gasLimit: GAS_AN_TOAN }), "deploy của chủ chain");
    kiem("chủ chain DEPLOY được hợp đồng", rc.status === 1 && !!rc.contractAddress, rc.contractAddress || "không có địa chỉ");

    // Ví lạ: nạp tiền trước để chắc chắn nó trượt vì KHÔNG CÓ QUYỀN, không phải vì hết tiền.
    const la = ethers.Wallet.createRandom().connect(p);
    await chot(await chu.sendTransaction({ to: la.address, value: ethers.parseEther("10"), gasLimit: 100000n }), "nạp cho ví lạ");
    kiem("ví lạ đã có tiền để trả gas", (await p.getBalance(la.address)) > 0n);
    await phaiChan("ví lạ KHÔNG deploy được", () => la.sendTransaction({ data: MA_DEPLOY, gasLimit: 200000n }));
    // Nhưng nó vẫn phải GỬI được giao dịch thường — preset này chỉ chặn deploy.
    const rc2 = await chot(await la.sendTransaction({ to: chu.address, value: 1n, gasLimit: 100000n }), "tx thường của ví lạ");
    kiem("ví lạ VẪN gửi được giao dịch thường (chỉ chặn deploy)", rc2.status === 1, `block ${rc2.blockNumber}`);
  },

  "kin": async (p, chu) => {
    const vt = await docVaiTro(p, TX_ALLOWLIST, chu.address);
    kiem("precompile txAllowList ĐANG BẬT", vt.bat, vt.vi);
    kiem("chủ chain có vai Admin trên precompile", vt.vai === 2, vt.vi);

    const rc = await chot(await chu.sendTransaction({ to: "0x000000000000000000000000000000000000dEaD", value: 1n, gasLimit: 100000n }), "tx của chủ chain");
    kiem("chủ chain giao dịch được (Admin bao hàm Enabled)", rc.status === 1, `block ${rc.blockNumber}`);

    const la = ethers.Wallet.createRandom().connect(p);
    await chot(await chu.sendTransaction({ to: la.address, value: ethers.parseEther("10"), gasLimit: 100000n }), "nạp cho ví lạ");
    kiem("ví lạ đã có tiền", (await p.getBalance(la.address)) > 0n);
    await phaiChan("ví lạ KHÔNG gửi được giao dịch nào", () => la.sendTransaction({ to: chu.address, value: 1n, gasLimit: 21000n }));
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
  if (!KHOA) { console.log("✗ --rpc phải đi kèm --khoa <privkey của chủ chain>"); process.exit(1); }
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
    if (GIU) console.log(`      ↳ giữ lại để gỡ lỗi. Chạy lại nhanh:\n` +
      `        node local-net/faucet/preset-test.mjs --chi ${id} --rpc ${chain.rpc} --khoa <privkey>`);
  } catch (e) {
    kiem("đẻ được chain", false, sach(e.message));
    continue;
  }

  try {
    const p = new ethers.JsonRpcProvider(chain.rpc, undefined, { staticNetwork: true });
    const chu = vi.connect(p);
    const du = await p.getBalance(vi.address);
    kiem("genesis cấp phát cho chủ chain", du > 0n, ethers.formatEther(du));
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
