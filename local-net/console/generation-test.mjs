#!/usr/bin/env node
/**
 * generation-test.mjs — cổng THẾ HỆ của console: nó có hỏi node đang chạy không, và
 * nó có **từ chối** khi thế hệ lệch không.
 *
 * 🔴 VÌ SAO CÓ BÀI NÀY. Tới `2026-08-28` console **chưa bao giờ hỏi node nó đang
 * nói chuyện với thế hệ mạng nào** (`grep networkID server.mjs` ⇒ 0 kết quả).
 * Thế hệ nằm ở `lib/chainid.mjs` dưới dạng hằng số **chép tay**, độc lập với
 * `constants.A1Gen` bên Go. Ngày G bump `0 → 1`; quên một bên thì console phát
 * chainId của thế hệ khác vào ví người dùng, qua một genesis **BẤT BIẾN**, và
 * không có gì báo lỗi.
 *
 * ═══ CÁCH ĐO — VÀ VÌ SAO KHÔNG ĐO BẰNG MẠNG THẬT ═══
 * Bài dựng một **node giả đổi được câu trả lời** rồi lái console qua đủ ba trạng
 * thái. Đo bằng mạng thật thì chỉ tới được **một** trạng thái (khớp) — đúng trạng
 * thái không cần cổng. Thứ phải chứng minh là hai trạng thái **CHẶN**.
 *
 * 🔴 Ca `khớp` KHÔNG được gọi một lượt đẻ chain thật. Nó gửi **tên sai** và đòi
 * lỗi trả về phải là lỗi TÊN — tức cổng thế hệ đã cho đi qua. Chứng minh được
 * "cổng mở" mà không tiêu một slot L1 nào.
 *
 * Dùng:  node local-net/console/generation-test.mjs
 */
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdirSync, mkdtempSync, copyFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NETWORK_ID, TEN_MANG, A1_GEN, NETWORK_ID_TAP, TEN_MANG_TAP, GOC_DAI_CHAINID, GOC_DAI_CHAINID_TAP, TRAN_DAI_CHAINID_TAP } from "../lib/chainid.mjs";

const PORT = 8497;
const PORT_NODE_GIA = 8498;
// A SECOND console, started with A1_DRILL_BAND=1, against the SAME fake node (P-81). Two
// processes, because the band is a start-up choice by design — there is no runtime switch.
const PORT_TAP = 8495;
const GOC = `http://127.0.0.1:${PORT}`;
const GOC_TAP = `http://127.0.0.1:${PORT_TAP}`;
const TOKEN = "token-van-hanh-chi-song-trong-bai-kiem";

// The generation fixture must never use the caller's operational ledger/state.
const SOURCE_ROOT = fileURLToPath(new URL('../../', import.meta.url));
mkdirSync(path.join(SOURCE_ROOT, 'work'), { recursive: true });
const FIXTURE_ROOT = mkdtempSync(path.join(SOURCE_ROOT, 'work/generation-console-'));
mkdirSync(path.join(FIXTURE_ROOT, 'local-net/console'), { recursive: true });
copyFileSync(path.join(SOURCE_ROOT, 'local-net/console/index.html'), path.join(FIXTURE_ROOT, 'local-net/console/index.html'));
// The genesis template, so `/api/preview` (same code path as create, spends nothing) can show
// which chainId BLOCK each console allocates from — the quantity the band decides (section 8).
mkdirSync(path.join(FIXTURE_ROOT, '9chain-a1-config/console-tmp'), { recursive: true });
copyFileSync(path.join(SOURCE_ROOT, '9chain-a1-config/l1-evm-genesis.json'), path.join(FIXTURE_ROOT, '9chain-a1-config/l1-evm-genesis.json'));

let dat = 0, hong = 0;
const kiem = (ten, ok, chiTiet = "") => {
  if (ok) { dat++; console.log(`  ✓ ${ten}${chiTiet ? "  — " + chiTiet : ""}`); }
  else { hong++; console.log(`  ✗ ${ten}${chiTiet ? "  — " + chiTiet : ""}`); }
};

// ═══ NODE GIẢ ═══
// `traLoi` đổi được giữa các ca; `song` tắt được để dựng ca "không đo được".
let traLoi = { networkID: String(NETWORK_ID), networkName: TEN_MANG };
let song = true;
const nodeGia = createServer((req, res) => {
  if (!song) { req.socket.destroy(); return; }
  let b = "";
  req.on("data", (d) => { b += d; });
  req.on("end", () => {
    let method = "";
    try { method = JSON.parse(b).method; } catch { /* thân hỏng */ }
    const key = method === "info.getNetworkID" ? "networkID"
      : method === "info.getNetworkName" ? "networkName" : null;
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(
      key ? { jsonrpc: "2.0", id: 1, result: { [key]: traLoi[key] } }
        : { jsonrpc: "2.0", id: 1, error: { message: `bài kiểm không giả lập ${method}` } },
    ));
  });
});
await new Promise((r) => nodeGia.listen(PORT_NODE_GIA, "127.0.0.1", r));

const ENV_CHUNG = {
  ...process.env,
  A1_CONSOLE_START_PAUSED: '0',
  A1_CONSOLE_HOST: "127.0.0.1",
  A1_CONSOLE_TOKEN: TOKEN,
  A1_CLI_KEY: "PrivateKey-khoa-gia-chi-de-console-chiu-khoi-dong",
  NODE_URI: `http://127.0.0.1:${PORT_NODE_GIA}`,
  // Cổng thế hệ nằm SAU cổng `A1_DE_CHAIN_MO`, nên phải mở cửa đó mới chạm tới nó.
  A1_DE_CHAIN_MO: "1",
  // ═══ CHỐT CHẶN AN TOÀN — ĐỪNG BỎ (cùng lý do với auth-e2e-test.mjs) ═══
  // Mọi lượt tạo ở đây ĐƯỢC THIẾT KẾ để bị từ chối. "Được thiết kế" không phải
  // bảo đảm: trỏ compose vào đường không tồn tại để một lỗ logic cũng chỉ chết
  // vì thiếu file, chứ không restart validator của mạng thật.
  A1_COMPOSE_FILE: "/khong-ton-tai/an-toan-cho-bai-kiem.yml",
  A1_LIMIT_CREATE: "99",
  // 🔴 The band each console serves is set BELOW, per console — never inherited. This test starts
  // one real console and one drill console and compares them, so an ambient A1_DRILL_BAND=1 turns
  // the "real" one into a second drill console and 12 cases fail for a reason outside the test.
  // Clearing it here also means the pair can never both be drill by accident, which is the way
  // this test could have been green for the wrong reason.
  A1_DRILL_BAND: "",
};
const con = spawn(process.execPath, [path.join(SOURCE_ROOT, 'local-net/console/server.mjs')], {
  cwd: FIXTURE_ROOT,
  env: { ...ENV_CHUNG, PORT: String(PORT) },
  stdio: ["ignore", "pipe", "pipe"],
});
let logCon = "";
con.stdout.on("data", (d) => { logCon += d; });
con.stderr.on("data", (d) => { logCon += d; });
// The drill-band console: same fixture, same fake node, one flag more.
const conTap = spawn(process.execPath, [path.join(SOURCE_ROOT, 'local-net/console/server.mjs')], {
  cwd: FIXTURE_ROOT,
  env: { ...ENV_CHUNG, PORT: String(PORT_TAP), A1_DRILL_BAND: "1" },
  stdio: ["ignore", "pipe", "pipe"],
});
let logConTap = "";
conTap.stdout.on("data", (d) => { logConTap += d; });
conTap.stderr.on("data", (d) => { logConTap += d; });
// 🔴 Phải CHỐNG GỌI HAI LẦN. `dong()` được gọi cả ở cuối bài lẫn ở `process.on("exit")`;
// đóng lần thứ hai một handle đang đóng làm libuv ném assertion **sau khi** bài đã in
// "✅ 13 đạt" — tức bài xanh mà tiến trình chết, và mã thoát thành mã của một vụ sập.
// 🔴 `process.on("exit")` KHÔNG được đóng handle của libuv — đóng một server ngay
// trong lượt thoát làm libuv ném assertion (`src\win\async.c`) **sau khi** bài đã in
// "✅ 13 đạt": bài xanh, tiến trình sập, và mã thoát thành mã của một vụ sập (127).
// Cổng nào cũng vô dụng nếu thứ gọi nó đọc nhầm mã thoát. Ở đây chỉ giết tiến trình
// con (việc bắt buộc nếu bài chết sớm); server đóng ở cuối, bằng đường bình thường.
process.on("exit", () => { try { con.kill(); } catch { /* đã chết */ } try { conTap.kill(); } catch { /* already gone */ } });

async function goi(duong, { method = "GET", body, goc = GOC } = {}) {
  const r = await fetch(goc + duong, {
    method,
    headers: { "content-type": "application/json", authorization: `Bearer ${TOKEN}` },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
  });
  let j = null;
  try { j = await r.json(); } catch { /* có endpoint trả rỗng */ }
  return { status: r.status, j };
}

let len = false;
for (let i = 0; i < 50; i++) {
  try { await goi("/whoami"); len = true; break; } catch { await new Promise((r) => setTimeout(r, 200)); }
}
if (!len) { console.log("✗ console KHÔNG khởi động được. Log:\n" + logCon); process.exit(1); }
let lenTap = false;
for (let i = 0; i < 50; i++) {
  try { await goi("/whoami", { goc: GOC_TAP }); lenTap = true; break; } catch { await new Promise((r) => setTimeout(r, 200)); }
}
if (!lenTap) { console.log("✗ the drill-band console did not start. Log:\n" + logConTap); process.exit(1); }

/** Gửi một lượt đẻ chain và trả về câu lỗi. Tên CỐ Ý SAI ở mọi ca. */
const thu = async (ten = "!!") => (await goi("/api/create", { method: "POST", body: { name: ten } })).j?.error || "";
/** Same, against the drill-band console. The name is deliberately invalid in every case. */
const thuTap = async (ten = "!!") => (await goi("/api/create", { method: "POST", body: { name: ten }, goc: GOC_TAP })).j?.error || "";

console.log(`\n══ CỔNG THẾ HỆ — console dựng cho g${A1_GEN} (networkID ${NETWORK_ID}, "${TEN_MANG}") ══`);

console.log("\n── 1. KHỚP → cổng phải CHO ĐI QUA ──");
{
  traLoi = { networkID: String(NETWORK_ID), networkName: TEN_MANG };
  const loi = await thu();
  kiem("không phải lỗi thế hệ (cổng đã mở)", !/THẾ HỆ/i.test(loi), loi.slice(0, 60));
  // 🔴 This asserts on PROSE, and that is a known weakness rather than an oversight. It broke on
  // 2026-09-03 when the user-facing errors were translated to English — the rule had not changed
  // at all, only its wording, and this gate went red for a reason that had nothing to do with
  // what it measures (the generation gate letting the request through to the NEXT check).
  //
  // ⚠️ The durable fix is a stable machine-readable error CODE beside the human message, which
  // `web/` also needs so it can localise from its own dictionary instead of printing the server's
  // raw sentence. That spans two worktrees (hard rule #4), so it is written down here rather than
  // done here. Until then, match a fragment broad enough to survive rewording.
  kiem("đi tới được phép kiểm KẾ TIẾP (tên sai)",
    /only letters, digits and spaces|2-32 characters long/.test(loi), loi.slice(0, 60));
}

console.log("\n── 2. 🔴 BẪY ĐÃ ĐO: node trả networkID là CHUỖI, không phải số ──");
{
  // `info.getNetworkID` trên avalanchego trả `"networkID":"999999999"`. So bằng
  // `===` với số là cổng ĐỎ VĨNH VIỄN — hỏng theo hướng "chặn tất", dễ bị gỡ bỏ.
  traLoi = { networkID: NETWORK_ID, networkName: TEN_MANG }; // số trần
  kiem("dạng SỐ vẫn khớp", !/THẾ HỆ/i.test(await thu()));
  traLoi = { networkID: String(NETWORK_ID), networkName: TEN_MANG }; // chuỗi
  kiem("dạng CHUỖI vẫn khớp (dạng node thật trả về)", !/THẾ HỆ/i.test(await thu()));
}

// ⚠️ The strings asserted in sections 3-5 became ENGLISH on 2026-09-08 (D-257). All four verdicts
// of the generation gate are read by an OPERATOR, and two of the four used to be Vietnamese while
// the other two were English — so the language of a refusal depended on which branch produced it.
// The BEHAVIOUR is unchanged: every case below still refuses, for the same reason, with the same
// remedy. Only the words moved.
console.log("\n── 3. LỆCH THẾ HỆ → phải CHẶN ──");
{
  traLoi = { networkID: String(NETWORK_ID - 1), networkName: `9chain-a1-g${A1_GEN + 1}` };
  const loi = await thu("TenHopLe");
  kiem("🔴 chặn khi node thuộc thế hệ SAU", /GENERATION MISMATCH/.test(loi));
  kiem("câu lỗi nêu CẢ HAI số", loi.includes(String(NETWORK_ID)) && loi.includes(String(NETWORK_ID - 1)), loi.slice(0, 90));
  kiem("câu lỗi chỉ đúng chỗ sửa", /chainid\.mjs/.test(loi) && /A1Gen/.test(loi));
}

console.log("\n── 4. networkID đúng nhưng TÊN mạng lệch → vẫn phải chặn ──");
{
  // Hai phép đo độc lập của cùng một sự thật. Chỉ kiểm một là bỏ nửa kia.
  traLoi = { networkID: String(NETWORK_ID), networkName: "9chain-a1-tap-g0" };
  kiem("chặn khi tên mạng lệch (mạng TẬP đội lốt)", /GENERATION MISMATCH/.test(await thu("TenHopLe")));
}

console.log("\n── 5. KHÔNG ĐO ĐƯỢC → cũng phải chặn (rỗng ≡ hỏng) ──");
{
  song = false;
  const loi = await thu("TenHopLe");
  kiem("🔴 chặn khi không hỏi được node", /could not ask the running node/.test(loi), loi.slice(0, 80));
  kiem("nói rõ vì sao từ chối, không im lặng", /permanent/.test(loi));
  song = true;
  traLoi = { networkID: "khong-phai-so", networkName: TEN_MANG };
  kiem("chặn khi node trả networkID không đọc được thành số", /not a number/.test(await thu("TenHopLe")));
}

console.log("\n── 6. ĐỐI CHỨNG: cổng KHÔNG chặn bừa ──");
{
  // Không có ca này thì "chặn hết" cũng ra 100% xanh ở mục 3–5.
  traLoi = { networkID: String(NETWORK_ID), networkName: TEN_MANG };
  const loi = await thu();
  kiem("về lại trạng thái khớp thì cổng mở lại", !/THẾ HỆ|không hỏi được/.test(loi), loi.slice(0, 60));
  kiem("⇒ ba trạng thái PHÂN BIỆT ĐƯỢC, không phải chặn tất", true);
}

// ═══ DRILL BAND (P-81, D-233) — the flag is checked in BOTH directions ═══
//
// Every case below sends a deliberately invalid name, exactly like sections 1–6: "the gate let it
// through" is proven by the NEXT check's error, never by a chain being created.
console.log(`\n══ DRILL BAND — second console started with A1_DRILL_BAND=1 (expects networkID ${NETWORK_ID_TAP}, "${TEN_MANG_TAP}") ══`);

console.log("\n── 7. flag ON + drill node → the gate must OPEN ──");
{
  traLoi = { networkID: String(NETWORK_ID_TAP), networkName: TEN_MANG_TAP };
  const loi = await thuTap();
  // Asserted on the NEXT check's error and on the absence of the flag's name: the generation
  // message itself is Vietnamese, and this file must not grow the language debt (CLAUDE.md §0).
  kiem("not a band/generation refusal (the drill gate opened)", !/A1_DRILL_BAND|chainid\.mjs/.test(loi), loi.slice(0, 60));
  kiem("reached the NEXT check (invalid name)", /only letters, digits and spaces|2-32 characters long/.test(loi), loi.slice(0, 60));
}

console.log("\n── 8. 🔴 flag ON + REAL node → must REFUSE, naming the flag ──");
{
  traLoi = { networkID: String(NETWORK_ID), networkName: TEN_MANG };
  const loi = await thuTap("TenHopLe");
  kiem("🔴 refused when the node is the live network", /A1_DRILL_BAND=1 is set/.test(loi), loi.slice(0, 90));
  kiem("the refusal names BOTH networkIDs (seen and expected)", loi.includes(String(NETWORK_ID)) && loi.includes(String(NETWORK_ID_TAP)));
  kiem("the refusal points at the remedy (unset the flag / point at a drill node)", /Unset A1_DRILL_BAND/.test(loi));
  kiem("…and NOT at the generation-bump remedy (that would be the wrong fix)", !/A1Gen/.test(loi));
}

console.log("\n── 9. flag OFF + drill node → still refused, with the one-line remedy ──");
{
  traLoi = { networkID: String(NETWORK_ID_TAP), networkName: TEN_MANG_TAP };
  const loi = await thu("TenHopLe");
  // The mismatch branch is recognised by its remedy line (`chainid.mjs` / `A1Gen`), the same
  // fragment section 3 asserts on — and by NOT reaching the name check.
  kiem("🔴 the real console still refuses the drill band", /chainid\.mjs/.test(loi) && !/only letters/.test(loi), loi.slice(0, 60));
  kiem("the hint names the flag to start the console with", /A1_DRILL_BAND=1/.test(loi));
  // The hint is for THIS case only: a node of another generation must not be told to use the flag.
  traLoi = { networkID: String(NETWORK_ID - 1), networkName: `9chain-a1-g${A1_GEN + 1}` };
  kiem("CONTROL — a node of another generation gets NO drill hint", !/A1_DRILL_BAND/.test(await thu("TenHopLe")));
}

console.log("\n── 10. the band decides the chainId BLOCK (/api/preview, same code path as create, spends nothing) ──");
{
  traLoi = { networkID: String(NETWORK_ID_TAP), networkName: TEN_MANG_TAP };
  const tap = (await goi("/api/preview", { method: "POST", body: { name: "Drill Band Preview" }, goc: GOC_TAP })).j || {};
  kiem("drill console allocates from the DRILL block",
    Number.isInteger(tap.chainId) && tap.chainId >= GOC_DAI_CHAINID_TAP && tap.chainId <= TRAN_DAI_CHAINID_TAP, String(tap.chainId ?? tap.error));
  traLoi = { networkID: String(NETWORK_ID), networkName: TEN_MANG };
  const that = (await goi("/api/preview", { method: "POST", body: { name: "Real Band Preview" } })).j || {};
  kiem("CONTROL — real console allocates from the REAL block", Number.isInteger(that.chainId) && that.chainId >= GOC_DAI_CHAINID, String(that.chainId ?? that.error));
  kiem("⇒ the two blocks are disjoint", Number.isInteger(tap.chainId) && Number.isInteger(that.chainId) && tap.chainId < GOC_DAI_CHAINID);
  // Hand-typed numbers from the other band, both directions, plus the control that a matching one passes.
  traLoi = { networkID: String(NETWORK_ID_TAP), networkName: TEN_MANG_TAP };
  const tapSaiBang = (await goi("/api/preview", { method: "POST", body: { name: "Drill Typed Real", chainId: GOC_DAI_CHAINID + 777 }, goc: GOC_TAP })).j || {};
  kiem("🔴 a REAL chainId typed on the drill console is refused", /REAL network's L1 range/.test(tapSaiBang.error || ""), (tapSaiBang.error || "").slice(0, 70));
  const tapDungBang = (await goi("/api/preview", { method: "POST", body: { name: "Drill Typed Drill", chainId: GOC_DAI_CHAINID_TAP + 777 }, goc: GOC_TAP })).j || {};
  kiem("CONTROL — a DRILL chainId typed on the drill console passes", tapDungBang.chainId === GOC_DAI_CHAINID_TAP + 777, String(tapDungBang.chainId ?? tapDungBang.error));
  traLoi = { networkID: String(NETWORK_ID), networkName: TEN_MANG };
  const thatSaiBang = (await goi("/api/preview", { method: "POST", body: { name: "Real Typed Drill", chainId: GOC_DAI_CHAINID_TAP + 777 } })).j || {};
  kiem("🔴 a DRILL chainId typed on the real console is refused", /DRILL band's chainId space/.test(thatSaiBang.error || ""), (thatSaiBang.error || "").slice(0, 70));
}

console.log("\n── 11. /api/status says which band it serves ──");
{
  const tap = (await goi("/api/status", { goc: GOC_TAP })).j || {};
  const that = (await goi("/api/status")).j || {};
  kiem("drill console: band=drill, drill networkID, drill block", tap.band === "drill" && tap.networkId === NETWORK_ID_TAP && tap.chainIdBlock?.floor === GOC_DAI_CHAINID_TAP, JSON.stringify({ band: tap.band, networkId: tap.networkId }));
  kiem("real console: band=real, real networkID, real block", that.band === "real" && that.networkId === NETWORK_ID && that.chainIdBlock?.floor === GOC_DAI_CHAINID, JSON.stringify({ band: that.band, networkId: that.networkId }));
  kiem("drill console announces the band at start-up", /band\s*: 🧪 DRILL \(A1_DRILL_BAND=1\)/.test(logConTap));
}

console.log(`\n${hong ? "✗" : "✅"} ${dat} đạt · ${hong} hỏng`);
// Không `process.exit()`: đặt mã thoát rồi để vòng lặp sự kiện tự cạn. `exit()` cắt
// ngang lúc tiến trình con và server còn đang tháo gỡ — xem chú thích ở `process.on("exit")`.
process.exitCode = hong ? 1 : 0;
con.kill();
conTap.kill();
nodeGia.close();
