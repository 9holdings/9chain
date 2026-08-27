// DIỄN TẬP GIAO DỊCH NGHI LỄ — "Block Adam"
//
// Bài này trả lời đúng một câu hỏi: **đúng vào một giây đã định trước, có ép được chuỗi đẻ
// ra một block, và đọc lại được nó không?**
//
// ═══ Vì sao bài này tồn tại ═══
// A1 định khắc "Block Adam = block đầu tiên vượt 2026-09-09T06:09:09Z". Đo `26/08` trên mạng
// công khai lúc rảnh (10 mẫu / 5 phút): P-Chain đứng nguyên ở 330, C-Chain ở 0x73 — **không
// một block nào**. Avalanche không đẻ block rỗng. ⇒ luật đó có thể **không có block nào để
// trỏ vào** hàng giờ sau mốc. Đối sách: hẹn sẵn giao dịch nghi lễ. Nhưng đối sách chưa diễn
// tập thì chỉ là ý định — và `09/09` không có lần thứ hai.
//
// ═══ 🔴 HAI ĐỒNG HỒ, ĐỪNG TRỘN ═══
// Ta **hẹn giờ** bằng đồng hồ MÁY (`Date.now`) vì đó là đồng hồ duy nhất ta ra lệnh được.
// Ta **nghiệm thu** bằng `block.timestamp` vì đó là đồng hồ duy nhất thứ được khắc mang theo.
// Hai cái đó KHÔNG bằng nhau: `block.timestamp` là giờ của node đề xuất block, lấy lúc đóng
// block chứ không phải lúc ta bấm gửi. Nên bài này **đo cả độ lệch giữa hai đồng hồ** thay vì
// giả định chúng khớp — nếu đồng hồ node chạy chậm, block nghi lễ có thể mang timestamp
// **chưa vượt mốc**, và lúc đó nó không đủ tư cách làm Block Adam theo đúng luật đã công bố.
//
// ═══ Cách chấm ═══
// Ô ✓ mạnh nhất KHÔNG phải "giao dịch của tôi có receipt". Nó là: **quét chuỗi tìm block đầu
// tiên có `timestamp` vượt mốc, và block đó đúng là block nghi lễ.** Đó mới là mệnh đề sẽ
// được khắc.
//
//   node local-net/faucet/block-adam-drill.mjs --moc 2026-09-09T06:09:09Z
//
// Cờ:
//   --rpc <url>       mặc định http://127.0.0.1:9750/ext/bc/C/rpc (mạng tập, xem
//                     local-net/docker-compose.drill.yml)
//   --moc <ISO>       mốc nghi lễ. BẮT BUỘC.
//   --khoa <0x…>      khoá gửi; hoặc biến môi trường A1_DRILL_PK. KHÔNG nhận khoá qua tệp
//                     nằm trong git.
//   --truoc-ms <n>    nạp nonce/phí + ký sẵn trước mốc bao nhiêu ms (mặc định 3000)
//   --cho-sau-s <n>   sau mốc chờ bao lâu rồi mới chấm (mặc định 20)
//   --bu-ms <n>       bắn ở mốc + n ms (mặc định 0; ÂM = bắn sớm). Đây vừa là núm VÁ vừa là
//                     núm PHÁ — xem "bù bao nhiêu" ở cuối tệp.
//   --khong-gui       ĐỐI CHỨNG NGƯỢC: không gửi gì cả, chỉ nhìn mốc trôi qua.
//   --doi-chung-nguoc khai rằng lượt này MONG ĐỢI không có Block Adam. Đảo cách chấm: có
//                     Block Adam mới là ĐỎ. `--khong-gui` tự bật cờ này.
//   --json <tệp>      ghi toàn bộ số đo ra JSON để lưu làm vật chứng.
import { ethers } from "ethers";
import { writeFileSync } from "node:fs";

// ───────────────────────────── tham số ─────────────────────────────
function cờ(tên, mặcĐịnh = undefined) {
  const i = process.argv.indexOf(tên);
  return i === -1 ? mặcĐịnh : process.argv[i + 1];
}
const có = (tên) => process.argv.includes(tên);

const RPC = cờ("--rpc", "http://127.0.0.1:9750/ext/bc/C/rpc");
const MOC_ISO = cờ("--moc");
const PK = cờ("--khoa", process.env.A1_DRILL_PK);
const TRUOC_MS = Number(cờ("--truoc-ms", 3000));
const CHO_SAU_S = Number(cờ("--cho-sau-s", 20));
const KHONG_GUI = có("--khong-gui");
const BU_MS = Number(cờ("--bu-ms", 0));
const NGUOC = KHONG_GUI || có("--doi-chung-nguoc");
const RA_JSON = cờ("--json");

if (!MOC_ISO) {
  console.error("thiếu --moc <ISO>, ví dụ --moc 2026-09-09T06:09:09Z");
  process.exit(2);
}
const MOC_MS = Date.parse(MOC_ISO);
if (!Number.isFinite(MOC_MS)) {
  console.error(`--moc không đọc được: ${MOC_ISO}`);
  process.exit(2);
}
// `block.timestamp` đếm bằng GIÂY. Mốc phải quy về cùng đơn vị trước khi so, không so ms với s.
const MOC_GIAY = Math.floor(MOC_MS / 1000);
if (!KHONG_GUI && !PK) {
  console.error("thiếu khoá: đặt A1_DRILL_PK hoặc --khoa 0x…");
  process.exit(2);
}

// ───────────────────────────── tiện ích ─────────────────────────────
const nghỉ = (ms) => new Promise((r) => setTimeout(r, ms));
const utc = (ms) => new Date(ms).toISOString().replace("T", " ").replace("Z", "Z");
const kýGiây = (s) => new Date(s * 1000).toISOString().replace("T", " ").replace("Z", "Z");

/** Chờ tới đúng một mốc theo đồng hồ MÁY. Ngủ từng đoạn rồi siết dần — `setTimeout` một
 *  phát cho đoạn dài trôi vài chục ms, mà bài này lấy độ chính xác làm sản phẩm. */
async function chờTới(mốcMs) {
  for (;;) {
    const còn = mốcMs - Date.now();
    if (còn <= 0) return;
    if (còn > 2000) await nghỉ(Math.min(còn - 1000, 30_000));
    else if (còn > 50) await nghỉ(10);
    else await new Promise((r) => setImmediate(r)); // siết chặt đoạn cuối
  }
}

const đạt = [];
const hỏng = [];
function chấm(ok, nhãn, chiTiết = "") {
  (ok ? đạt : hỏng).push(nhãn);
  console.log(`  ${ok ? "✓" : "✗"} ${nhãn}${chiTiết ? "  — " + chiTiết : ""}`);
}

// ───────────────────────────── vào việc ─────────────────────────────
const p = new ethers.JsonRpcProvider(RPC, undefined, { staticNetwork: true });
const số = { moc: MOC_ISO, mocGiay: MOC_GIAY, rpc: RPC, khongGui: KHONG_GUI, buMs: BU_MS, doiChungNguoc: NGUOC };

console.log("═══ DIỄN TẬP GIAO DỊCH NGHI LỄ — BLOCK ADAM ═══");
console.log(`chế độ   : ${KHONG_GUI ? "🔴 ĐỐI CHỨNG NGƯỢC (không gửi gì)" : NGUOC ? `🔴 ĐỐI CHỨNG NGƯỢC (bù ${BU_MS} ms)` : `diễn tập thật (bù ${BU_MS >= 0 ? "+" : ""}${BU_MS} ms)`}`);
console.log(`rpc      : ${RPC}`);
console.log(`mốc      : ${utc(MOC_MS)}  (epoch giây ${MOC_GIAY})`);

const mạng = await p.getNetwork();
số.chainId = mạng.chainId.toString();
console.log(`chainId  : ${số.chainId}`);

// ─── Đo độ lệch hai đồng hồ TRƯỚC khi làm gì khác ───
// Không đo được cái này thì mọi kết luận về "vượt mốc hay chưa" đều là giả định.
const cao0 = await p.getBlockNumber();
const b0 = await p.getBlock(cao0);
const lệchĐồngHồ = b0.timestamp - Math.floor(Date.now() / 1000);
số.caoTruoc = cao0;
số.tsBlockCuoiTruoc = b0.timestamp;
số.lechDongHoGiay = lệchĐồngHồ;
console.log(`block đầu: #${cao0}  ts=${b0.timestamp} (${kýGiây(b0.timestamp)})`);
console.log(`lệch đồng hồ (ts block cuối − giờ máy): ${lệchĐồngHồ >= 0 ? "+" : ""}${lệchĐồngHồ}s`);
console.log("  ⚠️ Đây là lệch của block CŨ, tức cận dưới thô — nó chỉ nói block gần nhất được");
console.log("     đóng lúc nào, không nói đồng hồ node đang chạy lệch bao nhiêu.");

/** Quét chuỗi tìm block ĐẦU TIÊN có timestamp vượt mốc. Đây là phép đo chấm điểm. */
async function blockĐầuTiênVượtMốc(từ, đến) {
  for (let n = từ; n <= đến; n++) {
    const b = await p.getBlock(n);
    if (b && b.timestamp > MOC_GIAY) return b;
  }
  return null;
}

// Trước mốc: khẳng định chưa có block nào vượt mốc (nếu có thì bài này vô nghĩa từ đầu).
const vượtSẵn = await blockĐầuTiênVượtMốc(Math.max(0, cao0 - 20), cao0);
chấm(vượtSẵn === null, "trước mốc: chưa có block nào vượt mốc",
  vượtSẵn ? `đã có #${vượtSẵn.number} ts=${vượtSẵn.timestamp} ⇒ mốc nằm trong quá khứ, chọn --moc khác` : `cao nhất #${cao0}`);
if (vượtSẵn) {
  console.log("\n🔴 DỪNG: mốc đã trôi qua trước khi bài chạy. Không diễn tập được.");
  process.exit(1);
}

let rawAdam = null, rawEva = null, ví = null;
if (!KHONG_GUI) {
  ví = new ethers.Wallet(PK, p);
  const sốDư = await p.getBalance(ví.address);
  console.log(`ví       : ${ví.address}  ${ethers.formatEther(sốDư)} LOVE9`);
  chấm(sốDư > ethers.parseEther("1"), "ví nghi lễ có tiền", ethers.formatEther(sốDư) + " LOVE9");
  if (sốDư <= ethers.parseEther("1")) process.exit(1);

  // ─── NẠP SẴN + KÝ SẴN ───
  // Vì sao ký trước: `sendTransaction` phải hỏi nonce rồi hỏi phí rồi mới ký — ba vòng RPC
  // nằm CHÈN GIỮA lúc ta quyết bắn và lúc byte thật sự rời máy. Đặt chúng trước mốc thì
  // lúc mốc tới chỉ còn đúng một lời gọi `eth_sendRawTransaction`.
  // ⚠️ Đánh đổi: phí được chốt ở thời điểm nạp sẵn. Trên một chuỗi đang tắc, phí có thể
  //    trôi trong khoảng đó và giao dịch ký sẵn bị bỏ lại. Nên nhân đôi `maxFeePerGas`.
  const nạpLúc = MOC_MS + BU_MS - TRUOC_MS;
  if (nạpLúc > Date.now()) {
    console.log(`\nchờ tới lúc nạp sẵn ${utc(nạpLúc)} (trước mốc ${TRUOC_MS} ms)…`);
    await chờTới(nạpLúc);
  } else {
    console.log(`\n⚠️ đã quá thời điểm nạp sẵn, nạp ngay`);
  }
  const nonce = await p.getTransactionCount(ví.address, "pending");
  const phí = await p.getFeeData();
  const maxFee = (phí.maxFeePerGas ?? ethers.parseUnits("50", "gwei")) * 2n;
  const maxTip = phí.maxPriorityFeePerGas ?? ethers.parseUnits("1", "gwei");
  số.nonce = nonce;
  số.maxFeePerGas = maxFee.toString();

  const chung = { chainId: mạng.chainId, type: 2, gasLimit: 21000n, maxFeePerGas: maxFee, maxPriorityFeePerGas: maxTip };
  // Hai giao dịch: Adam trước, Eva ngay sau — đúng sơ đồ §4 NGAY-G-A1-CON-LAI.
  rawAdam = await ví.signTransaction({ ...chung, nonce, to: ví.address, value: 0n });
  rawEva = await ví.signTransaction({ ...chung, nonce: nonce + 1, to: ví.address, value: 0n });
  console.log(`đã ký sẵn 2 giao dịch (nonce ${nonce}, ${nonce + 1}) lúc ${utc(Date.now())}`);
}

// ─── BẮN ───
const bắnLúc = MOC_MS + BU_MS;
console.log(`\nchờ tới ${KHONG_GUI ? "mốc" : "giờ bắn"} ${utc(bắnLúc)}…`);
await chờTới(bắnLúc);
const tBắn = Date.now();
số.banLucMs = tBắn;
số.lechSoVoiMocMs = tBắn - MOC_MS;
console.log(`⏱  ${utc(tBắn)}  (lệch so với mốc: ${tBắn - MOC_MS >= 0 ? "+" : ""}${tBắn - MOC_MS} ms)`);

let rcAdam = null, rcEva = null;
if (!KHONG_GUI) {
  const txAdam = await p.broadcastTransaction(rawAdam);
  const txEva = await p.broadcastTransaction(rawEva);
  console.log(`phát Adam: ${txAdam.hash}`);
  console.log(`phát Eva : ${txEva.hash}`);
  số.txAdam = txAdam.hash;
  số.txEva = txEva.hash;
  rcAdam = await txAdam.wait(1);
  rcEva = await txEva.wait(1);
  console.log(`Adam vào block #${rcAdam.blockNumber} sau ${((Date.now() - tBắn) / 1000).toFixed(2)}s, status ${rcAdam.status}`);
  console.log(`Eva  vào block #${rcEva.blockNumber}, status ${rcEva.status}`);
}

// ─── Chờ rồi CHẤM ───
console.log(`\nchờ thêm ${CHO_SAU_S}s sau mốc rồi chấm…`);
await chờTới(MOC_MS + CHO_SAU_S * 1000);

const cao1 = await p.getBlockNumber();
số.caoSau = cao1;
const đầuVượt = await blockĐầuTiênVượtMốc(cao0, cao1);
số.blockDauVuotMoc = đầuVượt ? { number: đầuVượt.number, timestamp: đầuVượt.timestamp, hash: đầuVượt.hash } : null;

console.log("\n═══ CHẤM ═══");
console.log(`chiều cao: #${cao0} → #${cao1}  (+${cao1 - cao0} block)`);

if (NGUOC) {
  // ĐỐI CHỨNG NGƯỢC — hai kiểu, chấm chung một luật: **không được có Block Adam**.
  //   (a) --khong-gui : không gửi gì. Kiểm luôn cả chiều cao không đổi.
  //   (b) --bu-ms âm  : có gửi, giao dịch chốt bình thường, nhưng block rơi TRƯỚC mốc.
  //       Ca (b) đắt hơn (a): mọi thứ trông như thành công — hai giao dịch status 1, chuỗi
  //       đẻ ra block — mà vẫn KHÔNG có Block Adam. Nếu phép đo chỉ nhìn "tx có chốt không"
  //       thì nó sẽ báo xanh ở đúng ca hỏng.
  if (KHONG_GUI) {
    chấm(cao1 === cao0, "không gửi gì ⇒ chiều cao không đổi", `#${cao0} → #${cao1}`);
  } else {
    chấm(rcAdam?.status === 1, "giao dịch vẫn chốt bình thường (bẫy xanh giả)", `block #${rcAdam?.blockNumber} status ${rcAdam?.status}`);
    chấm(cao1 > cao0, "chuỗi vẫn đẻ ra block (bẫy xanh giả)", `+${cao1 - cao0}`);
  }
  chấm(đầuVượt === null, "🔴 ĐỐI CHỨNG NGƯỢC: KHÔNG có block nào vượt mốc ⇒ không có Block Adam",
    đầuVượt ? `🔴 lại có #${đầuVượt.number} ts=${đầuVượt.timestamp}` : `quét #${cao0}..#${cao1}, không thấy`);
  console.log("\n⚠️ Ca này KHÔNG có Block Adam mới là ĐÚNG. Nó chứng minh phép đo phân biệt được");
  console.log("   'nghi lễ trúng mốc' với 'nghi lễ trượt mốc' — chứ không chỉ biết in ✓.");
} else {
  chấm(rcAdam?.status === 1, "giao dịch Adam chốt được", `block #${rcAdam?.blockNumber} status ${rcAdam?.status}`);
  chấm(rcEva?.status === 1, "giao dịch Eva chốt được", `block #${rcEva?.blockNumber} status ${rcEva?.status}`);
  chấm(cao1 > cao0, "mốc trôi qua và chuỗi ĐẺ RA block", `+${cao1 - cao0}`);
  chấm(đầuVượt !== null, "tồn tại block đầu tiên vượt mốc",
    đầuVượt ? `#${đầuVượt.number} ts=${đầuVượt.timestamp} (${kýGiây(đầuVượt.timestamp)})` : "🔴 KHÔNG CÓ");

  // Chẩn đoán: block của CHÍNH giao dịch Adam có vượt mốc không. Tách khỏi ô dưới vì khi
  // hai ô này lệch nhau thì luật khắc và hành động nghi lễ đang trỏ vào HAI BLOCK KHÁC NHAU
  // — và đó là hỏng đắt nhất mà bài này sinh ra để bắt.
  const bAdam = rcAdam ? await p.getBlock(rcAdam.blockNumber) : null;
  if (bAdam) {
    số.blockCuaAdam = { number: bAdam.number, timestamp: bAdam.timestamp };
    chấm(bAdam.timestamp > MOC_GIAY, "block CHỨA giao dịch Adam tự nó vượt mốc",
      `#${bAdam.number} ts=${bAdam.timestamp}, mốc=${MOC_GIAY}, cách ${bAdam.timestamp - MOC_GIAY >= 0 ? "+" : ""}${bAdam.timestamp - MOC_GIAY}s`);
  }

  if (đầuVượt) {
    // Ô mạnh nhất: block được khắc có ĐÚNG là block nghi lễ không.
    chấm(đầuVượt.number === rcAdam.blockNumber, "block đầu tiên vượt mốc CHÍNH LÀ block của Adam",
      `#${đầuVượt.number} vs #${rcAdam.blockNumber}`);
    // Đọc lại được — điều kiện qua của HANDOFF.
    const đọcLại = await p.getBlock(đầuVượt.number);
    chấm(đọcLại && đọcLại.number === đầuVượt.number && Number.isFinite(đọcLại.timestamp),
      "đọc lại được blockNumber + timestamp từ chuỗi",
      `#${đọcLại.number} ts=${đọcLại.timestamp}`);
    số.blockAdam = { number: đọcLại.number, timestamp: đọcLại.timestamp, hash: đọcLại.hash };

    // 🔴 Chỗ dễ mất nhất: so timestamp block với mốc.
    const cách = đầuVượt.timestamp - MOC_GIAY;
    số.cachMocGiay = cách;
    console.log(`\n  ↳ timestamp block Adam − mốc = ${cách >= 0 ? "+" : ""}${cách}s`);
    if (cách <= 0) {
      console.log("     🔴 Block nghi lễ KHÔNG vượt mốc theo nghĩa chặt (>). Xem mục cảnh báo cuối bài.");
    }
  }
}

// ─── Cảnh báo mang theo phép đo, không phải lời khuyên chung ───
console.log("\n═══ GHI CHÚ MANG THEO SỐ ĐO ═══");
console.log(`· Độ chính xác bắn: lệch ${số.lechSoVoiMocMs} ms so với mốc (đồng hồ máy).`);
if (số.blockAdam) {
  const trễ = số.blockAdam.timestamp - Math.floor(số.banLucMs / 1000);
  console.log(`· timestamp block − giờ bắn = ${trễ >= 0 ? "+" : ""}${trễ}s. Đây là thứ quyết định`);
  console.log(`  block có "vượt mốc" hay không, và nó KHÔNG nằm trong tay ta — nó là đồng hồ`);
  console.log(`  của node đề xuất block.`);
  console.log(`· ⇒ Muốn chắc block nghi lễ vượt mốc theo nghĩa CHẶT (>), phải bắn SAU mốc một`);
  console.log(`  khoảng an toàn, hoặc viết luật là "≥ mốc". Bắn đúng mốc là đánh cược vào`);
  console.log(`  việc làm tròn giây và độ lệch đồng hồ node.`);
}
console.log(`· ⚠️ Một node --sybil-protection-enabled=false KHÔNG chứng minh được đồng thuận.`);
console.log(`  Trên bộ nhiều node, block do node KHÁC đề xuất mang đồng hồ của node ĐÓ.`);

// ═══ "bù bao nhiêu" — trả lời bằng số đo, không bằng cảm tính ═══
// Lượt đo `27/08` trên mạng tập 1 node: bắn đúng mốc (bù 0) ⇒ block chứa Adam mang
// timestamp **đúng bằng mốc**, không vượt. Block vượt mốc lại là block của Eva, 2 giây sau.
// ⇒ Bù 0 làm luật khắc và hành động nghi lễ trỏ vào HAI block khác nhau.
//
// 🔴 Và bù dương KHÔNG phải là lời giải đầy đủ, chỉ là lời giải cho phần ta điều khiển được:
// luật "block ĐẦU TIÊN vượt mốc" nói về **cả chuỗi**, không nói về giao dịch của ta. Bất kỳ
// ai khác gửi một giao dịch vào khoảng giữa mốc và lúc ta bắn đều chiếm mất ô đó. Đo `26/08`
// cho thấy mạng công khai đứng yên lúc rảnh, nhưng "đo thấy đứng yên" ≠ "được bảo đảm đứng
// yên". Một nghi lễ **không thể tự bảo đảm** mệnh đề "đầu tiên trong toàn chuỗi".
// ⇒ Luật khắc chắc chắn đúng phải neo vào thứ ta cầm được: **hash giao dịch nghi lễ**, hoặc
//   số block chốt SAU khi đã sinh ra. Đây là việc của David (`NGAY-G-A1-CON-LAI.md` §6 mục 3).

if (RA_JSON) {
  số.đạt = đạt; số.hỏng = hỏng;
  writeFileSync(RA_JSON, JSON.stringify(số, null, 2));
  console.log(`\nvật chứng: ${RA_JSON}`);
}

console.log(`\n${hỏng.length === 0 ? "✅" : "🔴"} ${đạt.length} đạt · ${hỏng.length} hỏng`);
if (hỏng.length) console.log("hỏng: " + hỏng.join(" · "));
process.exit(hỏng.length === 0 ? 0 : 1);
