#!/usr/bin/env node
/**
 * check-clock-skew.mjs — **B-13(b)**: đo lệch đồng hồ rồi chọn `--offset-ms` cho Block Adam.
 *
 * ═══ ĐẠI LƯỢNG CẦN ĐO LÀ GÌ — và nó KHÔNG phải "lệch giữa 9 node" ═══
 *
 * `BLOCKERS.md` B-13(b) viết *"đo lệch đồng hồ 9 node"*. Câu đó đúng **ý** nhưng sai **đại
 * lượng**, và sai theo hướng làm người ta đo một con số vô nghĩa rồi tin nó.
 *
 * Thứ quyết định Block Adam là một phép so sánh duy nhất:
 *
 *     block.timestamp  >  2026-09-09T06:09:09Z
 *
 * `block.timestamp` là đồng hồ của **node ĐỀ XUẤT block**; mốc thì cố định; còn thời điểm ta
 * **bấm gửi** là đồng hồ của **máy bắn**. ⇒ Đại lượng thật là
 * **lệch(máy bắn ↔ node đề xuất)**, không phải lệch giữa các node với nhau.
 *
 * 🔴 **VÀ HÔM NAY LỆCH GIỮA 9 NODE LÀ 0 THEO KIẾN TRÚC, KHÔNG PHẢI THEO PHÉP ĐO.**
 * Cả 9 node là 9 container **trên cùng MỘT máy**, và Docker **không** ảo hoá đồng hồ (không
 * dùng time namespace) ⇒ chúng đọc chung một `CLOCK_REALTIME`. Đo chúng 9 lần rồi khai
 * *"lệch 0ms, đã kiểm"* là **đo sai đại lượng**: con số đó do bố cục hạ tầng quyết định, không
 * do đồng hồ. Nó chỉ trở thành phép đo thật **sau O4** (node ở nhà cung cấp thứ hai).
 *
 * ⇒ Hôm nay bài này đo **một** lệch có thật và có ích: **máy dev ↔ server**.
 *
 * ═══ 🔴 BA BẪY ĐO, đã dính đủ cả ba khi viết bài này (`2026-08-28`) ═══
 *
 * | cách đo | RTT | ước lượng | vì sao BỎ |
 * |---|--:|--:|---|
 * | `ssh 'date +%s%3N'` | **4.100ms** | +3.150ms ±2.050 | lệnh chạy **cuối** lượt bắt tay, không ở giữa ⇒ giả định đường đi đối xứng của NTP **vỡ**. Năm mẫu ra 3140–3195ms: **thiên lệch hệ thống**, không phải nhiễu — và không tách được khỏi lệch thật |
 * | `curl -sI` | 1.600ms | +1.650ms ±1.300 | chi phí **sinh tiến trình** trên Windows nằm trong khung đo |
 * | `fetch` trong tiến trình | **600ms** | +1.279ms **±800** | ✅ dùng cái này |
 *
 * ⚠️ **Sàn sai số ±500ms là BẤT KHẢ KHÁNG:** header HTTP `Date` chỉ có **độ phân giải giây**.
 * Bài nào khai chính xác hơn thế là đang bịa chữ số.
 *
 * Lọc kiểu NTP: lấy **mẫu có RTT NHỎ NHẤT** — nó có biên chặt nhất, vì biên là ±(RTT/2 + 500).
 *
 * Dùng:
 *   node scripts/check-clock-skew.mjs
 *   node scripts/check-clock-skew.mjs --self-test
 */
const argv = process.argv.slice(2);
const lay = (co, mac) => { const i = argv.indexOf(co); return i >= 0 && argv[i + 1] ? argv[i + 1] : mac; };
const DICH = lay("--target", "https://rpc-a1.9chain.org/ext/info");
const SO_MAU = Number(lay("--samples", 7));
/**
 * C-Chain RPC, derived from `--target` unless given. This is where the NODE'S OWN clock is
 * readable — see the block comment on `doLechChain`.
 */
const RPC_C = lay("--rpc", new URL(DICH).origin + "/ext/bc/C/rpc");

/** Sàn: `--offset-ms 3000` là con số đã đạt 9/9 ở lượt diễn tập `27/08` (D-052…D-055). */
export const SAN_BU_MS = 3000;

/**
 * CHỌN BÙ — hàm thuần.
 *
 * 🔴 Chọn theo **trường hợp xấu nhất còn nằm trong biên**, không theo giá trị trung tâm.
 * Lấy giá trị trung tâm là chọn con số đúng 50% số lần — mà đây là việc **không có lần hai**.
 *
 * `lech > 0` = server (node) **nhanh hơn** máy bắn ⇒ chiều AN TOÀN (block.timestamp lớn hơn,
 * dễ vượt mốc hơn). Chiều nguy hiểm là node **chậm hơn**: lúc đó block mang mốc nhỏ hơn ta
 * tưởng và có thể **không vượt** mốc thiêng.
 */
export function chonBu(lechMs, bienMs, san = SAN_BU_MS) {
  if (lechMs === null || bienMs === null || !Number.isFinite(lechMs) || !Number.isFinite(bienMs)) {
    return { bu: null, vi: "KHÔNG đo được — không chọn bù dựa trên một lượt đo hỏng" };
  }
  const xauNhat = lechMs - bienMs;               // node chậm nhất còn hợp với phép đo
  if (xauNhat >= 0) {
    return { bu: san, xauNhat, vi: `kể cả ở biên xấu nhất node vẫn KHÔNG chậm hơn máy bắn (${xauNhat}ms) ⇒ giữ sàn` };
  }
  const bu = Math.max(san, Math.ceil(-xauNhat) + bienMs);
  return { bu, xauNhat, vi: `biên xấu nhất: node chậm ${-xauNhat}ms ⇒ bù phải phủ nó cộng một biên nữa` };
}

/**
 * ═══ 🔴 THE PRIMARY MEASUREMENT — AND WHY THE HTTP ONE BELOW IS NOT IT ═══
 *
 * This file spends its whole header explaining that the quantity that decides Block Adam is
 * **skew(firing machine ↔ the node that PROPOSES the block)** — and then measured it with the
 * HTTP `Date` header of `rpc-a1.9chain.org`. Measured 2026-08-31, that response carries
 * `server: cloudflare` and `cf-ray: …-CDG`: the `Date` is stamped by **Cloudflare's edge in
 * Paris**, not by the OVH origin and certainly not by avalanchego. Cloudflare's clocks are
 * NTP-tight, so that number is essentially *"how wrong is this laptop"* — and the clock error
 * of the machine that actually writes `block.timestamp` was never measured at all.
 *
 * Which is this project's own most expensive failure class, landing inside the gate written to
 * warn about it.
 *
 * `eth_getBlockByNumber` is different in the one way that matters: the value comes **out of
 * the node** and passes through Cloudflare unchanged. So the block timestamp IS a reading of
 * the node's clock, proxy or no proxy. It is the same quantity `block-adam-drill.mjs` already
 * computes on the live chain (`b0.timestamp - now`).
 *
 * ⚠️ **Known bias, and it points the SAFE way.** A block timestamp is the moment that block
 * was produced, which may be several seconds in the past on an idle chain. So this reads as
 * *"the node is slower than it is"*, and `chonBu` reacts by choosing a LARGER offset. Erring
 * large is the harmless direction: Block Adam must land AFTER the mark, never before.
 * ⇒ On a busy chain the number tightens by itself. Do not "correct" the bias by subtracting a
 *   block time — that would be guessing in the dangerous direction.
 *
 * 🔴 MEASURED IN THE 2026-08-31 DRILL: on an idle chain the block age DOMINATES. A chain whose
 * last block was ~10s old reported -10136ms +/- 501ms, essentially all of it block age. So the
 * reading is only informative while the chain is PRODUCING BLOCKS — take it during load, and
 * treat a large negative number on a quiet chain as "no traffic", not "the node is 10s slow".
 * ⚠️ And on a chain with NO blocks at all, `latest` is the genesis block whose timestamp is 0;
 * that is rejected as a sample, so the gate says "could not measure" rather than reporting a
 * 55-year skew. Open block 1 first (a plain transfer costs a fixed 21000 gas — see M5.4).
 */
async function doLechChain() {
  const mau = [];
  for (let i = 0; i < SO_MAU; i++) {
    const t0 = Date.now();
    let j;
    try {
      const r = await fetch(RPC_C, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_getBlockByNumber", params: ["latest", false] }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!r.ok) continue;            // a non-200 is NOT a sample. Silence here is a fake green.
      j = await r.json();
    } catch { continue; }
    const t1 = Date.now();
    const ts = Number(j?.result?.timestamp);
    if (!Number.isFinite(ts) || ts <= 0) continue;
    // Biên = RTT/2 + 500ms (block timestamp has SECOND resolution, same floor as `Date`).
    mau.push({ rtt: t1 - t0, lech: ts * 1000 - Math.round((t0 + t1) / 2), bien: Math.round((t1 - t0) / 2) + 500 });
  }
  return mau.sort((a, b) => a.rtt - b.rtt);
}

async function doLech() {
  const mau = [];
  for (let i = 0; i < SO_MAU; i++) {
    const t0 = Date.now();
    let r;
    try { r = await fetch(DICH, { method: "HEAD", signal: AbortSignal.timeout(15_000) }); } catch { continue; }
    const t1 = Date.now();
    const d = r.headers.get("date");
    if (!d) continue;
    const sv = Date.parse(d);
    if (!Number.isFinite(sv)) continue;
    // 🔴 MEASURE who stamped the Date, do not assert it. The first version of this line said
    // "stamped by Cloudflare" unconditionally — and printed that sentence verbatim while
    // pointed at 127.0.0.1 during the 2026-08-31 drill. A claim that is not a measurement is
    // exactly what this file exists to warn about.
    const edge = r.headers.get("cf-ray") ? `Cloudflare (cf-ray ${r.headers.get("cf-ray")})`
      : /cloudflare/i.test(r.headers.get("server") || "") ? "Cloudflare"
      : null;
    // Biên = RTT/2 (bất định đường đi) + 500ms (độ phân giải GIÂY của header Date).
    mau.push({ rtt: t1 - t0, lech: sv - Math.round((t0 + t1) / 2), bien: Math.round((t1 - t0) / 2) + 500, edge });
  }
  return mau.sort((a, b) => a.rtt - b.rtt);
}

function tuKiem() {
  const ca = [
    ["lệch 0, biên 800 ⇒ giữ SÀN 3000", [0, 800], (r) => r.bu === SAN_BU_MS],
    ["node NHANH hơn (+1279 ±800) ⇒ giữ sàn (chiều an toàn)", [1279, 800], (r) => r.bu === SAN_BU_MS],
    ["🔴 node CHẬM 5000ms (±500) ⇒ bù phải VƯỢT sàn", [-5000, 500], (r) => r.bu === 6000],
    ["🔴 node chậm 2500 (±1000) ⇒ 4500, không phải 3000", [-2500, 1000], (r) => r.bu === 4500],
    ["biên rộng nuốt cả số dương ⇒ vẫn phải phủ vế âm", [200, 1500], (r) => r.bu === SAN_BU_MS && r.xauNhat === -1300],
    ["🔴 KHÔNG đo được ⇒ KHÔNG chọn bù (null), không rơi về sàn", [null, null], (r) => r.bu === null],
    ["🔴 biên null ⇒ cũng null (một nửa phép đo không phải phép đo)", [1000, null], (r) => r.bu === null],
  ];
  let hong = 0;
  console.log("══ ĐỐI CHỨNG NGƯỢC — chọn bù ══");
  for (const [ten, [l, b], dung] of ca) {
    const r = chonBu(l, b);
    if (dung(r)) console.log(`  ✓ ${ten}`);
    else { console.log(`  ✗ ${ten} — ra ${JSON.stringify(r)}`); hong++; }
  }
  return hong;
}

if (argv.includes("--self-test")) {
  const hong = tuKiem();
  console.log(`\n${hong ? "✗" : "✅"} ${hong} ca sai`);
  process.exit(hong ? 1 : 0);
}

const mau = await doLechChain();
console.log(`\n══ LỆCH ĐỒNG HỒ · máy bắn ↔ NODE (block.timestamp qua ${new URL(RPC_C).host}) ══\n`);
if (mau.length === 0) {
  console.log("🟡 no sample obtained from the chain — 'could not measure' is NOT 'skew 0'.");
  console.log(`   asked: ${RPC_C}  (override with --rpc)`);
  process.exit(2);
}
for (const m of mau) console.log(`  RTT ${String(m.rtt).padStart(5)}ms   lệch ${String(m.lech).padStart(6)}ms   biên ±${m.bien}ms`);
const tot = mau[0];
console.log(`\n  mẫu tốt nhất (RTT nhỏ nhất, biên chặt nhất): **${tot.lech}ms ± ${tot.bien}ms**`);

// SECONDARY, and labelled as what it is. Kept because the gap between the two numbers is
// itself informative: a large one usually means the edge and the origin disagree, not that the
// node is broken.
const mauHttp = await doLech();
if (mauHttp.length) {
  const h = mauHttp[0];
  console.log("");
  console.log(`  (secondary) HTTP \`Date\` header of ${new URL(DICH).host}: ${h.lech}ms ± ${h.bien}ms`);
  console.log(h.edge
    ? `        🔴 NOT the node clock — answered by ${h.edge}, so this is THEIR clock.
` +
      `        For comparison only, never for picking the offset.`
    : `        (no edge header seen — this looks like the origin, but it is still an HTTP
` +
      `        server clock, not the clock that writes block.timestamp.)`);
}

const { bu, xauNhat, vi } = chonBu(tot.lech, tot.bien);
console.log(`\n  ⇒ \`--offset-ms ${bu}\`  — ${vi}`);
console.log(`
🔴 ĐỌC ĐÚNG CON SỐ NÀY:
   • It is the skew **dev machine <-> NODE**, read from \`block.timestamp\` — NOT "skew across 9 nodes".
   • It reads the node as SLOWER than it is, because the last block may be seconds old.
     That is the SAFE direction (larger offset). Do not subtract a block time to "correct" it.
   • Lệch giữa 9 node hôm nay là **0 theo KIẾN TRÚC**: 9 container trên cùng MỘT máy,
     Docker không ảo hoá đồng hồ ⇒ chung một CLOCK_REALTIME. Đo 9 lần rồi khai
     "lệch 0ms, đã kiểm" là đo một tính chất của hạ tầng, không phải của đồng hồ.
   • Nó thành phép đo NHIỀU ĐỒNG HỒ thật chỉ **sau O4** (node ở nhà cung cấp thứ hai).
   • Sàn sai số ±500ms là bất khả kháng (header \`Date\` có độ phân giải GIÂY).
   • 🔴 **Đo LẠI sau khi mạng ngày G lên** — số này nói về mạng g0 đang chạy hôm nay.`);
process.exit(0);
