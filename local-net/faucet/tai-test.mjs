// tai-test.mjs — bơm tải thật lên một L1 riêng để đo năng lực chain.
//
//   Trên server:
//     set -a; . ~/9chain-a1/console.env; set +a
//     cd ~/9chain-a1/src
//     node local-net/faucet/tai-test.mjs --phut 5            # hiệu chỉnh, chạy ngắn
//     node local-net/faucet/tai-test.mjs --gio 3             # chạy dài
//     node local-net/faucet/tai-test.mjs --gio 3 --vi 40     # nhiều ví gửi hơn
//     node local-net/faucet/tai-test.mjs --phut 10 --vi 60 --preset thong-luong-cao
//                                                            # đo trần của gasLimit 60M (M9.4)
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
// Giới hạn tốc độ. 0 = bơm hết sức (dùng để tìm trần).
const TPS_MUC_TIEU = Number(opt("tps", 0));
// Kiểu chain đem ra đo. Mặc định `chuan` để mọi số cũ vẫn so được với nhau.
//
// Có cờ này vì M9.3 chứng minh **trần TPS là tham số genesis, không phải phần cứng**
// — nên "đo năng lực chain" mà chỉ đo được đúng một bộ tham số genesis thì nó trả
// lời sai câu hỏi. `--preset thong-luong-cao` là cách đo xem trần mới nằm ở đâu và
// tới mức nào thì MÁY mới thành nút thắt (M9.4).
const PRESET = opt("preset", "chuan");

// ═══ CHẾ ĐỘ C-CHAIN — ĐỌC KỸ TRƯỚC KHI DÙNG ═══
// Bơm thẳng vào C-Chain công khai: mạng mà faucet, MetaMask và mọi ví đang cắm vào.
// Chỉ dùng cho đợt NGẮN, có chủ đích — ví dụ để explorer có dữ liệu thật mà hiện,
// vì Blockscout chỉ index C-Chain nên tải trên L1 riêng KHÔNG hiện ở đó.
// Chế độ này KHÔNG đẻ chain và KHÔNG thu hồi gì; nó dùng ví đã có tiền sẵn.
// Khoá lấy từ biến môi trường `A1_TAI_KHOA` — KHÔNG truyền qua dòng lệnh, vì dòng
// lệnh lọt vào `ps`, vào log shell, và vào `err.message` của execFile.
const C_CHAIN = co("c-chain");
const C_CHAIN_RPC = `${RPC_GOC}/ext/bc/C/rpc`;
const BLOCKSCOUT = opt("blockscout", "http://127.0.0.1:8100");

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
// Token console CHỈ cần khi phải đẻ/thu hồi chain. Hai chế độ dùng chain có sẵn
// (`--chain-rpc`, `--c-chain`) không đụng tới console nên không đòi token.
if (!TOKEN && !CHAIN_CO_SAN && !C_CHAIN) { console.log("✗ thiếu A1_CONSOLE_TOKEN"); process.exit(1); }

/** Chiều cao block Blockscout ĐÃ INDEX — để biết bộ index có bám kịp chain không. */
async function blockscoutCao() {
  try {
    const r = await fetch(`${BLOCKSCOUT}/api/v2/main-page/blocks`, { signal: AbortSignal.timeout(8000) });
    const j = await r.json();
    return Array.isArray(j) && j.length ? j[0].height : null;
  } catch { return null; }
}

let chain = null, chuKhoa = null;
if (C_CHAIN) {
  chuKhoa = process.env.A1_TAI_KHOA || KHOA_CO_SAN;
  if (!chuKhoa) { console.log("✗ --c-chain cần khoá ví có tiền qua biến A1_TAI_KHOA"); process.exit(1); }
  chain = { rpc: C_CHAIN_RPC, name: null };
  log(`🔴 CHẾ ĐỘ C-CHAIN — bơm thẳng vào mạng công khai (${C_CHAIN_RPC})`);
  log(`   không đẻ chain, không thu hồi. Chốt an toàn vẫn bật.`);
} else if (CHAIN_CO_SAN) {
  if (!KHOA_CO_SAN) { console.log("✗ --chain-rpc phải đi kèm --khoa"); process.exit(1); }
  chain = { rpc: CHAIN_CO_SAN, name: "(chain có sẵn)" };
  chuKhoa = KHOA_CO_SAN;
  log(`dùng lại chain có sẵn: ${CHAIN_CO_SAN}`);
} else {
  const chu = ethers.Wallet.createRandom();
  chuKhoa = chu.privateKey;
  const ten = "Tai" + Date.now().toString(36).slice(-5).toUpperCase();
  log(`đẻ chain đo tải "${ten}" (mất ~170s vì restart lần lượt 5 node)…`);
  chain = await api("/api/create", { name: ten, admin: chu.address, preset: PRESET });
  log(`✓ chain ${ten} · chainId ${chain.chainId} · kiểu "${chain.preset}"`);
  log(`  RPC  ${chain.rpc}`);
  log(`  khoá chủ chain (ví dùng một lần, chain này sẽ bị thu hồi): ${chu.privateKey}`);
}

const p = new ethers.JsonRpcProvider(chain.rpc, undefined, { staticNetwork: true });
const chu = new ethers.Wallet(chuKhoa, p);

// ── Nạp tiền cho các ví gửi ────────────────────────────────────────────────
// Một ví không bơm nhanh được: giao dịch của cùng một ví phải theo đúng thứ tự
// nonce, nên nó tuần tự hoá mọi thứ. Nhiều ví chạy song song mới đẩy được tải.
// Trên L1 đo tải thì tiền là tiền chơi trên một chain sắp bị thu hồi — nạp thoải mái.
// Trên C-CHAIN thì đây là quỹ THẬT của testnet công khai, và ví gửi là ví dùng một
// lần (khoá sinh trong bộ nhớ rồi mất) ⇒ nạp bao nhiêu là **mất** bấy nhiêu.
// Nạp đúng mức đủ trả gas: 3 phút × 50 TPS ÷ 10 ví ≈ 900 giao dịch/ví, mỗi giao dịch
// 21.000 gas × 2 wei ≈ 0,00000000004 LOVE9. 1 LOVE9 là dư gấp hàng chục triệu lần.
const NAP = C_CHAIN ? ethers.parseEther("1") : ethers.parseEther("100000");
log(`nạp tiền cho ${SO_VI} ví gửi (${ethers.formatEther(NAP)} LOVE9/ví)…`);
const vis = Array.from({ length: SO_VI }, () => ethers.Wallet.createRandom().connect(p));
{
  let nonce = await p.getTransactionCount(chu.address, "latest");
  const cho = [];
  for (const v of vis) {
    cho.push(chu.sendTransaction({ to: v.address, value: NAP, nonce: nonce++, gasLimit: 100000n }));
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
  // Nhịp của TỪNG ví = tổng số ví ÷ TPS mục tiêu. Ghìm ở phía ví chứ không ghìm ở
  // một bộ điều phối chung: bộ điều phối chung là một điểm nghẽn nữa, và khi nó
  // trễ thì con số đo được là độ trễ của nó chứ không phải của chain.
  const nhipMs = TPS_MUC_TIEU ? (1000 * SO_VI) / TPS_MUC_TIEU : 0;
  while (dangChay) {
    const batDau = Date.now();
    try {
      await v.sendTransaction({ to: dich, value: 1n, nonce: nonce++, gasLimit: 21000n });
      daGui++;
      if (nhipMs) {
        const con = nhipMs - (Date.now() - batDau);
        if (con > 0) await new Promise(r => setTimeout(r, con));
      }
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

    // Bộ index có bám kịp chain không? Chỉ hỏi khi bơm vào C-Chain, vì Blockscout
    // KHÔNG index L1 — hỏi ở chế độ L1 chỉ đo được sự vắng mặt.
    let bsCao = null, bsTre = null;
    if (C_CHAIN) {
      bsCao = await blockscoutCao();
      if (bsCao != null) bsTre = blockNay - bsCao;
    }

    mau.push({ luc: Date.now(), blockL1: blockNay, txTrongCua, cchainMs, bsTre });
    const giay = (Date.now() - t0) / 1000;
    log(`  ${giay.toFixed(0)}s · gửi ${daGui} (lỗi ${loiGui}) · block ${blockNay} (+${blockNay - blockTruoc}) · ` +
        `chốt ${txTrongCua} tx/5s = ${(txTrongCua / 5).toFixed(1)} TPS · C-Chain ${cchainMs ?? "HỎNG"}ms` +
        (C_CHAIN ? ` · Blockscout ${bsCao ?? "?"} (chậm ${bsTre ?? "?"} block)` : ""));
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

if (C_CHAIN) {
  const tre = mau.map(m => m.bsTre).filter(x => x != null);
  if (tre.length) {
    console.log(`Blockscout bám kịp : chậm trung bình ${(tre.reduce((a, b) => a + b, 0) / tre.length).toFixed(1)} block · ` +
                `chậm nhất ${Math.max(...tre)} block`);
  }
  // Trả lại tiền thừa cho ví nguồn. Trên C-Chain đây là quỹ THẬT — ví gửi là ví
  // dùng một lần, không quét lại thì số dư còn lại mất vĩnh viễn.
  let traLai = 0n;
  for (const v of vis) {
    try {
      const du = await p.getBalance(v.address);
      const phi = 21000n * 3n;                    // gasPrice C-Chain ~2 wei, chừa dư
      if (du > phi) {
        await (await v.sendTransaction({ to: chu.address, value: du - phi, gasLimit: 21000n })).wait(1);
        traLai += du - phi;
      }
    } catch { /* một ví không quét được không đáng dừng cả bài */ }
  }
  console.log(`đã trả lại ví nguồn: ${ethers.formatEther(traLai)} LOVE9`);
} else if (!GIU && !CHAIN_CO_SAN && chain.name) {
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
