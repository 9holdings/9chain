// tai-test.mjs — bơm tải thật lên một L1 riêng để đo năng lực chain.
//
//   Trên server:
//     set -a; . ~/9chain-a1/console.env; set +a
//     cd ~/9chain-a1/src
//     node local-net/faucet/tai-test.mjs --phut 5            # hiệu chỉnh, chạy ngắn
//     node local-net/faucet/tai-test.mjs --gio 3             # chạy dài
//     node local-net/faucet/tai-test.mjs --gio 3 --vi 40     # nhiều ví gửi hơn
//
// ═══ VÌ SAO ĐẺ MỘT L1 RIÊNG, KHÔNG BƠM THẲNG VÀO C-CHAIN ═══
// C-Chain là thứ faucet, MetaMask và mọi ví đang cắm vào. Bơm tải lên đó là lấy
// mạng người ngoài đang dùng ra làm bãi thử. L1 riêng thì: đúng câu chuyện sản phẩm
// (mỗi khách một chain), Blockscout KHÔNG index L1 nên bộ index không gãy theo, và
// nhờ M4.4 thì đo xong thu hồi được, không tốn slot vĩnh viễn.
//
// ⚠️ NHƯNG L1 KHÔNG CÔ LẬP ĐƯỢC CPU. L1 và C-Chain chạy trong CÙNG 5 tiến trình
// node. Tải nặng trên L1 vẫn ăn CPU của đúng những node đang phục vụ RPC công khai.
// Vì vậy chốt an toàn dưới đây là BẮT BUỘC, không phải trang trí: bài tự ngắt khi
// C-Chain xuống sức, và ngắt là hành vi ĐÚNG chứ không phải thất bại của bài đo.
//
// ═══ ĐO CÁI GÌ MỚI CÓ NGHĨA ═══
// "Gửi được bao nhiêu giao dịch mỗi giây" KHÔNG phải năng lực của chain — đó là
// năng lực của cái script này. Con số thật là **giao dịch được CHỐT vào block mỗi
// giây**, đọc từ chính các block. Nên bài này báo cả hai và không lẫn lộn chúng.
import { ethers } from "ethers";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const args = process.argv.slice(2);
const co = t => args.includes("--" + t);
const opt = (t, mac) => { const i = args.indexOf("--" + t); return i >= 0 && args[i + 1] ? args[i + 1] : mac; };

const CONSOLE = opt("console", "http://127.0.0.1:8091");
const RPC_GOC = opt("rpc-goc", "https://rpc-testnet-a1.9chain.org");
const TOKEN = process.env.A1_CONSOLE_TOKEN || "";
const SO_VI = Number(opt("vi", 20));
const PHUT = opt("phut", null);
const GIO = opt("gio", null);
const THOI_LUONG_MS = PHUT ? Number(PHUT) * 60_000 : Number(GIO || 3) * 3_600_000;
const GIU = co("giu");
const CHAIN_CO_SAN = opt("chain-rpc", null);
const KHOA_CO_SAN = opt("khoa", null);

// ═══ NGƯỠNG CHỐT AN TOÀN ═══
// C-Chain hỏng liên tiếp bấy nhiêu lượt thì DỪNG. Đặt 3 chứ không phải 1: một lượt
// hỏng lẻ là chuyện bình thường qua Cloudflare, còn 3 lượt liền (≈15 giây) là dấu
// hiệu thật. Đo nền M2: gián đoạn khi đẻ chain chỉ 0,5 giây.
const NGUONG_HONG_LIEN_TIEP = 3;
// C-Chain trả lời chậm hơn ngưỡng này quá nhiều lần liên tiếp cũng dừng — mạng chưa
// chết nhưng người dùng đã thấy nó lag, và đó đã là cái giá không nên trả.
const NGUONG_CHAM_MS = 4000;
const NGUONG_CHAM_LIEN_TIEP = 5;
// Đĩa còn dưới bấy nhiêu phần trăm thì dừng: bơm tải sinh dữ liệu ở CẢ 5 node.
const NGUONG_DIA_TRONG = 15;

function gio() { return new Date().toISOString().slice(11, 19); }
function log(s) { console.log(`[${gio()}] ${s}`); }

async function api(duong, body) {
  const r = await fetch(CONSOLE + duong, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify(body), signal: AbortSignal.timeout(400000),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
  return j;
}

async function rpc(url, method, params = []) {
  const r = await fetch(url, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(15000),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message);
  return j.result;
}

async function diaTrongPhanTram() {
  try {
    const { stdout } = await run("df", ["--output=pcent", "/"]);
    const dung = Number((stdout.match(/(\d+)%/) || [])[1] || 0);
    return 100 - dung;
  } catch { return 100; }   // không đo được thì đừng tự dừng vì lý do sai
}

// ══════════════════════════════════════════════════════════════════════════
if (!TOKEN && !CHAIN_CO_SAN) { console.log("✗ thiếu A1_CONSOLE_TOKEN"); process.exit(1); }

let chain = null, chuKhoa = null;
if (CHAIN_CO_SAN) {
  if (!KHOA_CO_SAN) { console.log("✗ --chain-rpc phải đi kèm --khoa"); process.exit(1); }
  chain = { rpc: CHAIN_CO_SAN, name: "(chain có sẵn)" };
  chuKhoa = KHOA_CO_SAN;
  log(`dùng lại chain có sẵn: ${CHAIN_CO_SAN}`);
} else {
  const chu = ethers.Wallet.createRandom();
  chuKhoa = chu.privateKey;
  const ten = "Tai" + Date.now().toString(36).slice(-5).toUpperCase();
  log(`đẻ chain đo tải "${ten}" (mất ~170s vì restart lần lượt 5 node)…`);
  chain = await api("/api/create", { name: ten, admin: chu.address, preset: "chuan" });
  log(`✓ chain ${ten} · chainId ${chain.chainId}`);
  log(`  RPC  ${chain.rpc}`);
  log(`  khoá chủ chain (ví dùng một lần, chain này sẽ bị thu hồi): ${chu.privateKey}`);
}

const p = new ethers.JsonRpcProvider(chain.rpc, undefined, { staticNetwork: true });
const chu = new ethers.Wallet(chuKhoa, p);

// ── Nạp tiền cho các ví gửi ────────────────────────────────────────────────
// Một ví không bơm nhanh được: giao dịch của cùng một ví phải theo đúng thứ tự
// nonce, nên nó tuần tự hoá mọi thứ. Nhiều ví chạy song song mới đẩy được tải.
log(`nạp tiền cho ${SO_VI} ví gửi…`);
const vis = Array.from({ length: SO_VI }, () => ethers.Wallet.createRandom().connect(p));
{
  let nonce = await p.getTransactionCount(chu.address, "latest");
  const cho = [];
  for (const v of vis) {
    cho.push(chu.sendTransaction({
      to: v.address, value: ethers.parseEther("100000"),
      nonce: nonce++, gasLimit: 100000n,
    }));
  }
  const txs = await Promise.all(cho);
  await txs[txs.length - 1].wait(1);
  log(`✓ đã nạp ${SO_VI} ví`);
}

// ── Trạng thái chạy ────────────────────────────────────────────────────────
let dangChay = true, lyDoDung = "hết thời gian";
let daGui = 0, loiGui = 0;
const t0 = Date.now();
const blockDau = await p.getBlockNumber();

/**
 * Một ví bơm liên tục: gửi rồi ĐI TIẾP, không chờ receipt.
 *
 * Chờ receipt từng giao dịch biến bài đo thành phép đo độ trễ mạng chứ không phải
 * đo thông lượng — mỗi ví sẽ chỉ gửi được ~1 giao dịch mỗi block. Nonce đếm cục bộ;
 * hỏng thì đọc lại từ node chứ không đoán, vì lệch nonce một lần là ví đó chết hẳn
 * cho tới cuối bài.
 */
async function bom(v) {
  let nonce = await p.getTransactionCount(v.address, "latest");
  const dich = ethers.Wallet.createRandom().address;
  while (dangChay) {
    try {
      await v.sendTransaction({ to: dich, value: 1n, nonce: nonce++, gasLimit: 21000n });
      daGui++;
    } catch (e) {
      loiGui++;
      // Lệch nonce / đầy mempool: đồng bộ lại rồi nghỉ một nhịp để mempool thoát tải.
      try { nonce = await p.getTransactionCount(v.address, "latest"); } catch { /* thử lại vòng sau */ }
      await new Promise(r => setTimeout(r, 250));
    }
  }
}

// ── Chốt an toàn: theo dõi C-CHAIN CÔNG KHAI, không phải chain đang bị bơm ──
let hongLienTiep = 0, chamLienTiep = 0;
const mau = [];   // {luc, blockL1, txTrongCua, cchainMs}
async function canhGac() {
  let blockTruoc = blockDau;
  while (dangChay) {
    await new Promise(r => setTimeout(r, 5000));
    if (!dangChay) break;

    // 1) Sức khoẻ C-Chain công khai — đây mới là thứ quyết định có dừng hay không.
    const tCC = Date.now();
    let cchainMs = null;
    try {
      await rpc(`${RPC_GOC}/ext/bc/C/rpc`, "eth_blockNumber");
      cchainMs = Date.now() - tCC;
      hongLienTiep = 0;
      chamLienTiep = cchainMs > NGUONG_CHAM_MS ? chamLienTiep + 1 : 0;
    } catch {
      hongLienTiep++;
      chamLienTiep = 0;
    }
    if (hongLienTiep >= NGUONG_HONG_LIEN_TIEP) {
      dangChay = false; lyDoDung = `🔴 C-Chain công khai hỏng ${hongLienTiep} lượt liên tiếp`;
      break;
    }
    if (chamLienTiep >= NGUONG_CHAM_LIEN_TIEP) {
      dangChay = false; lyDoDung = `🔴 C-Chain công khai chậm > ${NGUONG_CHAM_MS}ms trong ${chamLienTiep} lượt liên tiếp`;
      break;
    }

    // 2) Tiến độ trên chain đang bị bơm — đếm giao dịch ĐÃ CHỐT, không phải đã gửi.
    let blockNay = blockTruoc, txTrongCua = 0;
    try {
      blockNay = await p.getBlockNumber();
      for (let b = blockTruoc + 1; b <= blockNay; b++) {
        const blk = await p.getBlock(b);
        txTrongCua += blk?.transactions?.length || 0;
      }
    } catch { /* bỏ qua một nhịp đọc hỏng */ }

    mau.push({ luc: Date.now(), blockL1: blockNay, txTrongCua, cchainMs });
    const giay = (Date.now() - t0) / 1000;
    log(`  ${giay.toFixed(0)}s · gửi ${daGui} (lỗi ${loiGui}) · block L1 ${blockNay} (+${blockNay - blockTruoc}) · ` +
        `chốt ${txTrongCua} tx/5s = ${(txTrongCua / 5).toFixed(1)} TPS · C-Chain ${cchainMs ?? "HỎNG"}ms`);
    blockTruoc = blockNay;

    // 3) Đĩa — bơm tải sinh dữ liệu ở cả 5 node.
    if (mau.length % 12 === 0) {
      const trong = await diaTrongPhanTram();
      if (trong < NGUONG_DIA_TRONG) {
        dangChay = false; lyDoDung = `🔴 đĩa chỉ còn ${trong}% trống`;
        break;
      }
    }
  }
}

// ── Chạy ───────────────────────────────────────────────────────────────────
log(`▶ bơm tải ${SO_VI} ví trong ${(THOI_LUONG_MS / 60000).toFixed(0)} phút. Ctrl-C để dừng sớm.`);
log(`  chốt an toàn: dừng nếu C-Chain hỏng ${NGUONG_HONG_LIEN_TIEP} lượt liền, hoặc chậm >${NGUONG_CHAM_MS}ms ${NGUONG_CHAM_LIEN_TIEP} lượt liền, hoặc đĩa <${NGUONG_DIA_TRONG}%`);
const hetGio = setTimeout(() => { dangChay = false; }, THOI_LUONG_MS);
process.on("SIGINT", () => { dangChay = false; lyDoDung = "người dùng dừng (Ctrl-C)"; });

await Promise.all([canhGac(), ...vis.map(v => bom(v))]);
clearTimeout(hetGio);

// ── Báo cáo ────────────────────────────────────────────────────────────────
const giayChay = (Date.now() - t0) / 1000;
const blockCuoi = await p.getBlockNumber().catch(() => blockDau);
const tongChot = mau.reduce((s, m) => s + m.txTrongCua, 0);
const cc = mau.map(m => m.cchainMs).filter(x => x != null).sort((a, b) => a - b);
const soHong = mau.filter(m => m.cchainMs == null).length;

console.log(`\n════ KẾT QUẢ ════`);
console.log(`dừng vì            : ${lyDoDung}`);
console.log(`thời gian chạy     : ${(giayChay / 60).toFixed(1)} phút`);
console.log(`ví gửi             : ${SO_VI}`);
console.log(`GỬI đi             : ${daGui} giao dịch (${(daGui / giayChay).toFixed(1)}/s) · lỗi gửi ${loiGui}`);
console.log(`CHỐT vào block     : ${tongChot} giao dịch (${(tongChot / giayChay).toFixed(1)} TPS)  ← con số thật`);
console.log(`block sinh ra      : ${blockCuoi - blockDau} (${((blockCuoi - blockDau) / giayChay).toFixed(2)} block/s)`);
if (blockCuoi > blockDau) {
  console.log(`giao dịch/block    : ${(tongChot / (blockCuoi - blockDau)).toFixed(1)} trung bình`);
}
if (cc.length) {
  console.log(`C-Chain công khai  : p50 ${cc[Math.floor(cc.length / 2)]}ms · p95 ${cc[Math.floor(cc.length * 0.95)]}ms · ` +
              `xấu nhất ${cc[cc.length - 1]}ms · hỏng ${soHong}/${mau.length} lượt`);
}
console.log(`đĩa còn trống      : ${await diaTrongPhanTram()}%`);

if (!GIU && !CHAIN_CO_SAN) {
  try {
    const r = await api("/api/revoke", { name: chain.name, xacNhan: chain.name });
    console.log(`\n✓ đã thu hồi chain đo tải — còn ${r.dangTrack}/${r.tran} L1`);
  } catch (e) {
    console.log(`\n✗ KHÔNG thu hồi được "${chain.name}": ${e.message}`);
    console.log(`  Chain này còn chiếm một slot — thu hồi tay bằng POST /api/revoke.`);
  }
} else if (chain.name) {
  console.log(`\nℹ️  giữ lại chain "${chain.name}" (nó chiếm một slot cho tới khi thu hồi)`);
}
process.exit(0);
