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
// ═══ Cách chấm — ĐỔI `2026-08-27` theo D-070 ═══
// Ô ✓ mạnh nhất KHÔNG phải "giao dịch của tôi có receipt", và **cũng không còn là** "block
// đầu tiên vượt mốc đúng là block nghi lễ".
//
// David chốt `27/08`: chữ khắc **neo vào hash giao dịch nghi lễ**. Lý do — luật cũ *"block
// đầu tiên vượt mốc"* là mệnh đề về **toàn chuỗi**, mà nghi lễ chỉ điều khiển được **giao
// dịch của mình**; ai gửi một giao dịch vào khoảng giữa mốc và lúc ta bắn là chiếm mất ô đó,
// không giành lại được, và thứ đã khắc thì vĩnh viễn.
//
// ⇒ Ô mạnh nhất nay là: **đưa hash cho chuỗi, chuỗi trả lại đúng giao dịch đó** (đường NGƯỢC
// — đọc `rcAdam.hash` từ biến trong tay mình rồi khai "neo đọc được" là tự hỏi chính mình).
//
// Ô cũ **không bị xoá**, nó xuống hạng **lưu ý** (`lưuÝRa`): nó thôi quyết định đúng/sai của
// chữ khắc, nhưng vẫn là phép đo độ lệch đồng hồ mà B-13(b) cần, và vẫn nói cho ta biết câu
// chữ "vượt mốc" trong bản khắc có trung thực hay không.
//
//   node local-net/faucet/block-adam-drill.mjs --at 2026-09-09T06:09:09Z
//
// Cờ:
//   --rpc <url>       mặc định http://127.0.0.1:9750/ext/bc/C/rpc (mạng tập, xem
//                     local-net/docker-compose.drill.yml)
//   --at <ISO>       mốc nghi lễ. BẮT BUỘC.
//   --wallet-key <0x…>      khoá gửi; hoặc biến môi trường A1_DRILL_PK. KHÔNG nhận khoá qua tệp
//                     nằm trong git.
//   --lead-ms <n>    nạp nonce/phí + ký sẵn trước mốc bao nhiêu ms (mặc định 3000)
//   --settle-s <n>   sau mốc chờ bao lâu rồi mới chấm (mặc định 20)
//   --offset-ms <n>       bắn ở mốc + n ms (mặc định 0; ÂM = bắn sớm). Đây vừa là núm VÁ vừa là
//                     núm PHÁ — xem "bù bao nhiêu" ở cuối tệp.
//   --no-send       ĐỐI CHỨNG NGƯỢC: không gửi gì cả, chỉ nhìn mốc trôi qua.
//   --counter-check khai rằng lượt này MONG ĐỢI không có Block Adam. Đảo cách chấm: có
//                     Block Adam mới là ĐỎ. `--no-send` tự bật cờ này.
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
const MOC_ISO = cờ("--at");
const PK = cờ("--wallet-key", process.env.A1_DRILL_PK);
const TRUOC_MS = Number(cờ("--lead-ms", 3000));
const CHO_SAU_S = Number(cờ("--settle-s", 20));
const KHONG_GUI = có("--no-send");
const BU_MS = Number(cờ("--offset-ms", 0));
const NGUOC = KHONG_GUI || có("--counter-check");
const RA_JSON = cờ("--json");

if (!MOC_ISO) {
  console.error("thiếu --at <ISO>, ví dụ --at 2026-09-09T06:09:09Z");
  process.exit(2);
}
const MOC_MS = Date.parse(MOC_ISO);
if (!Number.isFinite(MOC_MS)) {
  console.error(`--at không đọc được: ${MOC_ISO}`);
  process.exit(2);
}
// `block.timestamp` đếm bằng GIÂY. Mốc phải quy về cùng đơn vị trước khi so, không so ms với s.
const MOC_GIAY = Math.floor(MOC_MS / 1000);
if (!KHONG_GUI && !PK) {
  console.error("thiếu khoá: đặt A1_DRILL_PK hoặc --wallet-key 0x…");
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
const lưuÝ = [];
function chấm(ok, nhãn, chiTiết = "") {
  (ok ? đạt : hỏng).push(nhãn);
  console.log(`  ${ok ? "✓" : "✗"} ${nhãn}${chiTiết ? "  — " + chiTiết : ""}`);
}

// ═══ Hạng thứ ba: LƯU Ý — không tính vào đạt/hỏng ═══
//
// Sinh ra sau D-070 (neo chữ khắc = **hash giao dịch nghi lễ**). Trước đó, ô *"block đầu tiên
// vượt mốc CHÍNH LÀ block của Adam"* là điều kiện ĐÚNG/SAI của chữ khắc. Sau D-070 nó không
// còn là thế: neo nằm ở hash giao dịch, thứ ta cầm được, nên một lượt mà ai đó chen mất ô
// "đầu tiên" **vẫn là một lượt ĐÚNG**.
//
// 🔴 Nhưng xoá hẳn ô đó thì mất luôn phép đo độ lệch đồng hồ — thứ B-13(b) cần. Và giữ nó ở
// hạng ✗ thì bài **báo đỏ ở một lượt không có gì sai**, mà một cổng kêu oan là một cổng sẽ bị
// bỏ qua đúng lúc nó kêu thật. Nên: giữ phép đo, hạ hạng thông báo.
function lưuÝRa(ok, nhãn, chiTiết = "") {
  lưuÝ.push({ nhãn, ok, chiTiết });
  console.log(`  ${ok ? "✓" : "⚠️"} ${nhãn}${chiTiết ? "  — " + chiTiết : ""}  [lưu ý, không chấm]`);
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
  vượtSẵn ? `đã có #${vượtSẵn.number} ts=${vượtSẵn.timestamp} ⇒ mốc nằm trong quá khứ, chọn --at khác` : `cao nhất #${cao0}`);
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
  //   (a) --no-send : không gửi gì. Kiểm luôn cả chiều cao không đổi.
  //   (b) --offset-ms âm  : có gửi, giao dịch chốt bình thường, nhưng block rơi TRƯỚC mốc.
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
    // Sau D-070: lưu ý, không chấm. Neo là hash giao dịch — block chứa nó là Block Adam dù
    // timestamp có vượt mốc hay không. Ô này nay trả lời một câu KHÁC và vẫn cần: *"câu chữ
    // 'vượt mốc' trong bản khắc có trung thực không"*, và nó là đầu vào của B-13(b).
    lưuÝRa(bAdam.timestamp > MOC_GIAY, "block CHỨA giao dịch Adam tự nó vượt mốc",
      `#${bAdam.number} ts=${bAdam.timestamp}, mốc=${MOC_GIAY}, cách ${bAdam.timestamp - MOC_GIAY >= 0 ? "+" : ""}${bAdam.timestamp - MOC_GIAY}s`);
  }

  // ═══ Ô MẠNH NHẤT sau D-070: NEO = HASH GIAO DỊCH NGHI LỄ ═══
  //
  // David chốt `27/08`: chữ khắc neo vào **hash giao dịch nghi lễ**, không vào mệnh đề
  // "block đầu tiên vượt mốc". Nên thứ phải nghiệm thu là: hash đó có thật, đọc NGƯỢC được
  // từ chuỗi, và trỏ về đúng một block đọc lại được.
  //
  // 🔴 `rcAdam.hash` là hash ta CÓ SẴN trong tay từ lúc gửi — đọc nó rồi khai "neo đọc được"
  // là tự hỏi chính mình. Phải đi ĐƯỜNG NGƯỢC: đưa hash cho chuỗi, bắt chuỗi trả lại giao
  // dịch. Cùng lớp lỗi với bộ xuất O2 khai "kèm 1 L1" khi không có byte nào (D-057).
  if (rcAdam?.hash) {
    const txĐọcNgược = await p.getTransaction(rcAdam.hash);
    số.neo = { hashGiaoDich: rcAdam.hash, blockNumber: rcAdam.blockNumber };
    chấm(txĐọcNgược !== null && txĐọcNgược.hash === rcAdam.hash,
      "🔴 NEO: đưa hash cho chuỗi, chuỗi trả lại đúng giao dịch đó",
      txĐọcNgược ? `${rcAdam.hash.slice(0, 18)}… → block #${txĐọcNgược.blockNumber}` : "🔴 chuỗi KHÔNG biết hash này");
    chấm(txĐọcNgược?.blockNumber === rcAdam.blockNumber,
      "NEO trỏ về đúng block của receipt",
      `#${txĐọcNgược?.blockNumber} vs #${rcAdam.blockNumber}`);
    const bNeo = txĐọcNgược ? await p.getBlock(txĐọcNgược.blockNumber) : null;
    chấm(bNeo !== null && Number.isFinite(bNeo.timestamp),
      "block mà NEO trỏ tới đọc lại được (number + timestamp)",
      bNeo ? `#${bNeo.number} ts=${bNeo.timestamp} (${kýGiây(bNeo.timestamp)})` : "🔴 không đọc được");
    if (bNeo) số.neo.blockTimestamp = bNeo.timestamp;
  } else {
    chấm(false, "🔴 NEO: không có hash giao dịch nghi lễ để neo vào", "receipt vắng mặt");
  }

  if (đầuVượt) {
    // ⚠️ Ô này TỪNG là ô mạnh nhất; sau D-070 nó xuống hạng lưu ý. Nó không còn quyết định
    // chữ khắc đúng hay sai — nhưng nó vẫn là **phép đo độ lệch đồng hồ** mà B-13(b) cần,
    // và nó vẫn nói cho ta biết câu chữ "vượt mốc" có trung thực hay không.
    lưuÝRa(đầuVượt.number === rcAdam.blockNumber, "block đầu tiên vượt mốc CHÍNH LÀ block của Adam",
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
//   số block chốt SAU khi đã sinh ra.
//
// ✅ **ĐÃ CHỐT `2026-08-27` (D-070): neo vào HASH GIAO DỊCH NGHI LỄ.** Vì thế ô *"block đầu
// tiên vượt mốc CHÍNH LÀ block của Adam"* xuống hạng **lưu ý** — xem `lưuÝRa`.
// 🔴 Nhưng `--offset-ms` **chưa hết việc**: nếu bản khắc còn CÂU CHỮ khẳng định block vượt mốc
// `2026-09-09T06:09:09Z`, thì câu đó vẫn phải đúng, và nó vẫn phụ thuộc đồng hồ node đề xuất.
// D-070 hạ B-13(b) từ *"neo sai thì hỏng"* xuống *"câu chữ sai thì không trung thực"* —
// **hạ mức, không phải đóng**. Câu chữ chốt cùng lượt C1 đóng băng byte.

// 🔴 Lưu ý KHÔNG làm đỏ lượt chạy, nên nó dễ trôi qua mắt. In gộp lại một chỗ ở cuối.
if (lưuÝ.length) {
  const cảnh = lưuÝ.filter((l) => !l.ok);
  console.log(`\n═══ LƯU Ý (${lưuÝ.length}) — không tính đạt/hỏng ═══`);
  for (const l of lưuÝ) console.log(`  ${l.ok ? "✓" : "⚠️"} ${l.nhãn}${l.chiTiết ? `  — ${l.chiTiết}` : ""}`);
  if (cảnh.length) {
    console.log(`  🔴 ${cảnh.length} lưu ý KHÔNG đạt. Không phải lỗi của neo (D-070), NHƯNG nếu`);
    console.log(`     bản khắc có câu "vượt mốc" thì câu đó đang KHÔNG trung thực. Xem B-13(b).`);
  }
}

if (RA_JSON) {
  số.đạt = đạt; số.hỏng = hỏng; số.lưuÝ = lưuÝ;
  writeFileSync(RA_JSON, JSON.stringify(số, null, 2));
  console.log(`\nvật chứng: ${RA_JSON}`);
}

console.log(`\n${hỏng.length === 0 ? "✅" : "🔴"} ${đạt.length} đạt · ${hỏng.length} hỏng` +
  (lưuÝ.length ? ` · ${lưuÝ.length} lưu ý (${lưuÝ.filter((l) => !l.ok).length} không đạt)` : ""));
if (hỏng.length) console.log("hỏng: " + hỏng.join(" · "));
process.exit(hỏng.length === 0 ? 0 : 1);
