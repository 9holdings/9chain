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
 * 🔴 **SKEW ACROSS THE 9 NODES IS 0 — and as of 2026-09-03 that is MEASURED, not assumed.**
 * All nine are containers on ONE host, so they read one `CLOCK_REALTIME`. Measuring them nine
 * times and reporting *"0ms, checked"* would still be measuring the wrong quantity: the number is
 * decided by the infrastructure layout, not by any clock. It becomes a real measurement only
 * after O4 (a validator at a second provider).
 *
 * ⚠️ **THE REASON THIS PARAGRAPH USED TO GIVE WAS WRONG, and a wrong reason is a landmine.**
 * It said *"Docker does not virtualise the clock (it uses no time namespace)"*. Measured on the
 * server: every container HAS its own time namespace — host `time:[4026531834]`, node-1
 * `[4026533895]`, node-9 `[4026533894]`, all nine distinct. Docker does create them here.
 *
 * The conclusion survives for a DIFFERENT reason: Linux time namespaces virtualise
 * `CLOCK_MONOTONIC` and `CLOCK_BOOTTIME`, **not `CLOCK_REALTIME`** — and here the boottime offset
 * is zero anyway. Both halves measured 2026-09-03:
 *   · `/proc/uptime` host 854947.21 · node-1 .27 · node-5 .34 · node-9 .42 — the increments are
 *     exactly the sequential `docker exec` cost, so the namespaces carry NO offset;
 *   · `date` inside each container, bracketed by host reads taken around it, fell strictly
 *     between them for all nine (windows 59–110 ms) ⇒ one shared wall clock.
 *
 * ⇒ Right answer, wrong reason. Somebody who later checks the stated reason finds a time
 *   namespace and concludes the premise broke, or changes something that breaks the REAL reason
 *   while the stated one still reads fine. Both directions are worse than not writing a reason.
 *
 * ═══ AND WHAT A SECOND MACHINE ACTUALLY COSTS — measured 2026-09-03 ═══
 *
 * The question B-13(b) was reaching for is what happens after O4. Asked of the machines' own NTP
 * daemons rather than probed from outside:
 *   · OVH (chrony, stratum 3): system time **14 µs** fast of NTP, last offset 98 µs, RMS 124 µs
 *   · Hetzner (timesyncd, stratum 2): jitter **72 µs**, root delay 9.3 ms, 55 packets
 * ⇒ Mutual skew between the two hosts is bounded at **hundreds of microseconds** — four orders of
 *   magnitude below the 3000 ms Block Adam floor. Cross-machine clocks are not the risk; TRANSPORT
 *   is (0.3–2.9 s over the public hostname, measured 2026-09-01).
 *
 * 🔴 An `ssh 'date'` probe from the dev machine put the two hosts **658 ms** apart on the same day.
 * That number is an artefact and it is wrong by three orders of magnitude: the ssh bias only
 * cancels in a difference when it is EQUAL on both sides, and the two RTTs were 3372 ms and
 * 1911 ms. The table below already rejected `ssh` for this, and it was used anyway — ask the
 * machine's own timekeeper instead of timing a shell.
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
// 🔴 WHAT THIS NUMBER IS, AND WHAT IT IS NOT — checked 2026-09-01 during a sweep for measurements
// frozen into constants that then act like live claims (the sweep found nothing worse).
//
// It is a POLICY FLOOR, not a reading: `chonBu` returns max(floor, what it just measured), so a
// live measurement can only push the offset UP. That is what keeps it honest.
//
// ⚠️ But its provenance is a drill run against the public hostname, and on 2026-09-01 both this
// project and the 9Scan team discovered that a naive reading of that path is dominated by the
// TOOL: cold `curl` reads 1.3–2.9s per call where a kept-alive connection reads ~0.31–0.5s, and
// ~9–10ms from inside the server. So some transport may well be baked into this 3000.
//
// It does not endanger the ceremony, and the direction is why: transport delay makes the
// ceremonial block LATER, i.e. more certainly at or past the mark, which is the safe side of the
// D-147 boundary. An inflated floor costs a slightly later Block Adam, never a missed one.
// ⇒ Do not "correct" it by arithmetic. Re-measure it (B-13(b)) over the link the ceremony will
//   actually use, warm, on a chain that is producing blocks — and let this floor be overridden by
//   that measurement if it is larger.
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

/**
 * ═══ 🔴 THE READING THAT WORKS ON AN IDLE CHAIN — added 2026-09-02, and it had to be ═══
 *
 * The block reading above is honest about its bias and still unusable today. Measured
 * 2026-09-02 on g1: C-Chain height **22**, latest block **7,062 seconds old**, zero new blocks
 * in twenty seconds. The chain is not slow — it is *empty*, because the pump that used to fill
 * it stopped with g0. Feed that into the block reading and it answers `-7,195,576ms`, and this
 * gate then printed **`--offset-ms 7197020`** — a two-hour offset — and **exited 0**. Anybody
 * trusting that line fires Block Adam two hours after the moment it exists to mark.
 *
 * That is this project's own error class landing, for the second time, inside the very gate
 * written to warn about it: the header already says *"treat a large negative number on a quiet
 * chain as no traffic, not as a 10s-slow node"* — and then computed the offset from it anyway.
 * **A warning in prose is not a guard.** (Same lesson as D-160's ratchet: a rule that is written
 * but not measured does not hold.)
 *
 * ⇒ `info.peers[].lastReceived` is a timestamp **stamped by the node's own clock**, in the JSON
 * body so Cloudflare passes it through unchanged, and — unlike a block — it **advances with no
 * transactions at all**, because the nine nodes gossip continuously. Verified 2026-09-02: it
 * moved 14s across 12s of wall clock while the chain produced nothing.
 *
 * 🔴 **Its bias points the SAFE way, and it is bounded by seconds rather than by hours.**
 * `max(lastReceived) <= node_now` always, so this UNDER-reads the node's clock, i.e. reports the
 * node as slower than it is, and `chonBu` answers with a LARGER offset. The gap is bounded by
 * how long the busiest of eight peers can go without sending anything — seconds — where block
 * age is bounded by nothing at all.
 *
 * ⚠️ It reads ONE node's clock: whichever answers the RPC. That is sufficient here for the
 * reason the header already gives — nine containers on one host share `CLOCK_REALTIME` — and it
 * stops being sufficient the day a validator runs on a second machine.
 */
async function doLechPeers() {
  const mau = [];
  for (let i = 0; i < SO_MAU; i++) {
    const t0 = Date.now();
    let j;
    try {
      const r = await fetch(`${new URL(DICH).origin}/ext/info`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "info.peers", params: {} }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!r.ok) continue;
      j = await r.json();
    } catch { continue; }
    const t1 = Date.now();
    const moc = (j?.result?.peers ?? [])
      .map((p) => Date.parse(p?.lastReceived))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (!moc.length) continue;
    mau.push({ rtt: t1 - t0, lech: Math.max(...moc) - Math.round((t0 + t1) / 2), bien: Math.round((t1 - t0) / 2) + 500 });
  }
  return mau.sort((a, b) => a.rtt - b.rtt);
}

/**
 * How old the latest block may be before its timestamp stops being a clock reading.
 *
 * A1 blocks have a two-second floor, so on a chain carrying any traffic at all the newest block
 * is a few seconds old. 30s sits far above that and far below the hours an idle chain reaches —
 * the threshold does not need to be precise, it needs to separate *seconds* from *unbounded*.
 */
export const NGUONG_TUOI_BLOCK_MS = 30_000;

/**
 * WHICH reading may set the offset — pure, so `--self-test` can pin it.
 *
 * 🔴 The whole point is the REFUSAL. A stale block must never reach `chonBu`, no matter how
 * confidently it can be formatted. Preferring the block when it IS fresh is not sentiment: it is
 * the exact quantity the ceremony compares (`block.timestamp > mark`), where the peer reading is
 * a proxy for the same clock.
 */
export function chonNguon(block, peers) {
  const tuoi = block ? -block.lech : null;      // lech = ts - now, so age is its negation
  if (block && tuoi <= NGUONG_TUOI_BLOCK_MS) {
    return { nguon: "block", mau: block, vi: `latest block is ${Math.round(tuoi / 1000)}s old — the chain is producing, so its timestamp IS a clock reading` };
  }
  if (peers) {
    return {
      nguon: "peers", mau: peers,
      vi: block
        ? `latest block is ${Math.round(tuoi / 1000)}s old — that is BLOCK AGE, not skew, and it is refused as a source; falling back to peer gossip timestamps`
        : "no block sample; using peer gossip timestamps",
    };
  }
  if (block) return { nguon: null, mau: null, vi: `the only sample is a block ${Math.round(tuoi / 1000)}s old — that measures traffic, not clocks, and will not be used to pick an offset` };
  return { nguon: null, mau: null, vi: "nothing could be read — 'unknown' is not 'skew 0'" };
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

  // ═══ WHICH SOURCE MAY SET THE OFFSET — the guard added 2026-09-02 ═══
  //
  // 🔴 The first case is the live failure, replayed with the real numbers: an idle chain whose
  // latest block was 7,062 seconds old made this gate print `--offset-ms 7197020` and exit 0.
  // Every case here asserts the SOURCE, because asserting only that "an offset came out" is how
  // that bug survived a self-test in the first place (Q-5b, and again in D-161).
  const B = (lech) => ({ rtt: 300, lech, bien: 650 });
  const caNguon = [
    ["🔴 THE LIVE BUG — a 7,062s-old block is REFUSED as a source, not formatted into an offset",
      [B(-7_062_000), null], (r) => r.nguon === null],
    ["🔴 …and with peers available it falls back to them rather than refusing",
      [B(-7_062_000), B(201)], (r) => r.nguon === "peers"],
    ["a fresh block WINS over peers — it is the quantity the ceremony actually compares",
      [B(-4_000), B(201)], (r) => r.nguon === "block"],
    ["🔴 the boundary is inclusive: exactly 30s old still counts as producing",
      [B(-NGUONG_TUOI_BLOCK_MS), B(201)], (r) => r.nguon === "block"],
    ["🔴 one millisecond past it does not",
      [B(-NGUONG_TUOI_BLOCK_MS - 1), B(201)], (r) => r.nguon === "peers"],
    ["a block from the FUTURE (node ahead of us) is fresh, not stale",
      [B(+2_000), null], (r) => r.nguon === "block"],
    ["peers alone are a valid source when no block could be read", [null, B(201)], (r) => r.nguon === "peers"],
    ["🔴 nothing readable ⇒ NO source, never a default", [null, null], (r) => r.nguon === null],
  ];
  console.log("\n══ REVERSE CONTROLS — which source may set the offset ══");
  for (const [ten, [b, p], dung] of caNguon) {
    const r = chonNguon(b, p);
    if (dung(r)) console.log(`  ✓ ${ten}`);
    else { console.log(`  ✗ ${ten} — got ${JSON.stringify(r)}`); hong++; }
  }

  // 🔴 And the arithmetic that closes B-13(b), pinned with the numbers actually measured on g1
  // so a later change to `chonBu` cannot silently move the ceremony's offset.
  console.log("\n══ REVERSE CONTROL — the numbers MEASURED on g1, 2026-09-02 ══");
  const song = chonBu(201, 649);
  if (song.bu === SAN_BU_MS) console.log(`  ✓ measured +201ms ±649 ⇒ keep the ${SAN_BU_MS}ms floor (worst case: node 448ms slow, the floor covers it)`);
  else { console.log(`  ✗ measured +201ms ±649 ⇒ got ${song.bu}, wanted ${SAN_BU_MS}`); hong++; }

  return hong;
}

if (argv.includes("--self-test")) {
  const hong = tuKiem();
  console.log(`\n${hong ? "✗" : "✅"} ${hong} ca sai`);
  process.exit(hong ? 1 : 0);
}

const mau = await doLechChain();
const mauPeers = await doLechPeers();
console.log(`\n══ CLOCK SKEW · firing machine <-> NODE (${new URL(RPC_C).host}) ══\n`);

console.log("  [1] block.timestamp — the exact quantity the ceremony compares, when the chain is producing");
/** One sample line, printed identically for both sources so the two can be compared by eye. */
const inMau = (m) => console.log(`      RTT ${String(m.rtt).padStart(5)}ms   skew ${String(m.lech).padStart(9)}ms   margin ±${m.bien}ms`);
if (mau.length === 0) console.log("      🟡 no sample");
for (const m of mau) inMau(m);

console.log("\n  [2] info.peers lastReceived — the node's own clock, and it advances with NO transactions");
if (mauPeers.length === 0) console.log("      🟡 no sample");
for (const m of mauPeers) inMau(m);

const chon = chonNguon(mau[0] ?? null, mauPeers[0] ?? null);
console.log(`\n  ⇒ source for the offset: **${chon.nguon ?? "NONE"}** — ${chon.vi}`);
if (chon.nguon === null) {
  console.log("\n🔴 REFUSING to pick an offset. A number formatted confidently out of the wrong");
  console.log("   quantity is worse than no number: this gate printed `--offset-ms 7197020`");
  console.log("   (two hours, all of it block age) on 2026-09-02 and exited 0.");
  process.exit(2);
}
const tot = chon.mau;
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
   • It is the skew **dev machine <-> NODE** — NOT "skew across 9 nodes".
   • Both readings under-state the node's clock (a block may be seconds old; \`lastReceived\`
     is by definition not later than now). That is the SAFE direction — it buys a LARGER
     offset. Never "correct" it by subtracting, that is guessing in the dangerous direction.
   • 🔴 A stale block is REFUSED as a source rather than formatted into an offset. Block age
     is unbounded; peer-gossip staleness is bounded by seconds.
   • Lệch giữa 9 node hôm nay là **0 theo KIẾN TRÚC**: 9 container trên cùng MỘT máy,
     Docker không ảo hoá đồng hồ ⇒ chung một CLOCK_REALTIME. Đo 9 lần rồi khai
     "lệch 0ms, đã kiểm" là đo một tính chất của hạ tầng, không phải của đồng hồ.
   • Nó thành phép đo NHIỀU ĐỒNG HỒ thật chỉ **sau O4** (node ở nhà cung cấp thứ hai).
   • The ±500ms error floor is unavoidable: BOTH sources have SECOND resolution.
   • ✅ Re-measured on the LIVE g1 network (2026-09-02) — no longer a g0 number.
     🔴 Re-measure once more on a chain that is PRODUCING BLOCKS, and prefer source [1]
     when it is available: it is the quantity the ceremony literally compares.`);

/**
 * 🔴 EXIT CODE — added 2026-09-02, because until then this exited 0 whatever it measured.
 *
 * `SAN_BU_MS` is the number written into `BLOCKERS.md` B-13(b), into the runbook, and into the
 * command a human will type on 2026-09-09. A tool that measures a requirement LARGER than that
 * and still exits 0 leaves the published number quietly wrong — which is D-150's shape (a
 * document stating a figure the live system no longer supports), arriving through a tool instead
 * of through a document.
 *
 * ⇒ Red means exactly one thing: **the floor no longer covers the measurement, so the published
 * offset must change.** It does not mean the network is broken.
 */
if (bu !== null && bu > SAN_BU_MS) {
  console.log(`\n🔴 THE PUBLISHED OFFSET IS NO LONGER ENOUGH — measurement needs ${bu}ms, the floor is ${SAN_BU_MS}ms.`);
  console.log(`   Update SAN_BU_MS, BLOCKERS.md B-13(b) and the ceremony runbook together, or the`);
  console.log(`   number a human types on 2026-09-09 is one this measurement already contradicts.`);
  process.exit(1);
}
process.exit(0);
