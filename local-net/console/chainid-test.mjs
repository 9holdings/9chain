// ═══ BÀI KIỂM PHÉP CẤP chainId (D-069 / B-14) ═══
//
// Chạy: `node local-net/console/chainid-test.mjs`
//
// 🔴 Bài này `import` **mã thật** (`../lib/chainid.mjs`) và đọc **danh sách chặn thật**
// (`chainid-taken.json`). Nó KHÔNG chép lại công thức cấp số — chép là đúng lớp lỗi
// `check-consistency.mjs` đã dính, nơi bản chép tay bằng JS xanh suốt trong khi con số nó
// khẳng định đã trôi lệch khỏi mã thật.
//
// Mọi ca ĐẠT đều đi kèm một ca **đối chứng ngược**: cổng chỉ biết xanh không chứng minh gì
// (luật cứng #1/#2 của repo).
import { readFileSync } from "node:fs";
import path from "node:path";
import { capChainIdTuDong, loiChainIdDaCap, loiTenDaCap, A1_GEN, GOC_DAI_CHAINID, TRAN_DAI_CHAINID, TRAN_TOAN_DAI, TRAN_EIP2294 } from "../lib/chainid.mjs";

const THU_MUC = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const chan = JSON.parse(readFileSync(path.join(THU_MUC, "chainid-taken.json"), "utf8"));
const daChiem = new Map(chan.taken.map((m) => [m.chainId, m.name]));

let dat = 0, hong = 0;
const ok = (nhan, dieuKien, chiTiet = "") => {
  if (dieuKien) { dat++; console.log(`  ✓ ${nhan}${chiTiet ? ` — ${chiTiet}` : ""}`); }
  else { hong++; console.log(`  ✗ ${nhan}${chiTiet ? ` — ${chiTiet}` : ""}`); }
};

console.log("═══ CẤP chainId — D-069 ═══");
console.log(`thế hệ  : ${A1_GEN}`);
console.log(`khối    : ${GOC_DAI_CHAINID} – ${TRAN_DAI_CHAINID}`);
console.log(`chặn    : ${daChiem.size} số · tra ${chan.lookupDate} · nguồn ${chan.source}`);

// ─── 1. Danh sách chặn phải LÀNH ─────────────────────────────────────────────
// Một danh sách rỗng cho ra kết quả y hệt một danh sách hỏng. Neo vào thứ ta biết chắc
// phải có: 9100 = Genesis Coin, chính là số đã đẻ ra B-14.
console.log("\n─── 1. Danh sách chặn có thật không ───");
ok("khác rỗng", daChiem.size > 0, `${daChiem.size} số`);
ok("neo 9100 = Genesis Coin", /genesis coin/i.test(daChiem.get(9100) ?? ""), daChiem.get(9100) ?? "KHÔNG CÓ");
ok("phủ cả 3 số còn lại của dải cũ", [9108, 9134, 9170].every((n) => daChiem.has(n)));
ok("khai đúng nguồn nó đọc", typeof chan.source === "string" && chan.source.length > 0, chan.source);

// ─── 2. Sổ rỗng: người ĐẦU TIÊN bấm nút nhận số nào? ─────────────────────────
// Đây là câu hỏi đã đẻ ra B-14. Trước D-069 câu trả lời là 9100 = Genesis Coin.
console.log("\n─── 2. Sổ rỗng — số cấp đầu tiên ───");
const dau = capChainIdTuDong(new Set(), daChiem);
ok("cấp đúng gốc dải", dau === GOC_DAI_CHAINID, String(dau));
ok("🔴 KHÔNG còn là 9100", dau !== 9100);
ok("không nằm trong sổ công khai", !daChiem.has(dau));

// ─── 3. Bỏ qua sổ NHÀ (gồm cả `retired`) ─────────────────────────────────────
console.log("\n─── 3. Bỏ qua số đã dùng trong sổ nhà ───");
const nha = new Set([GOC_DAI_CHAINID, GOC_DAI_CHAINID + 1, GOC_DAI_CHAINID + 2]);
ok("nhảy qua 3 số đã dùng", capChainIdTuDong(nha, daChiem) === GOC_DAI_CHAINID + 3);

// ─── 4. Bỏ qua sổ CÔNG KHAI ──────────────────────────────────────────────────
// Dải mới hiện trống, nên dựng một sổ giả để kiểm chính cơ chế — nếu mai có ai chiếm
// 9000000010 thật thì đường này phải chạy.
console.log("\n─── 4. Bỏ qua số bị chiếm trong sổ công khai ───");
const giaSuChiem = new Map([[GOC_DAI_CHAINID, "Ai Đó Chiếm Mất"]]);
ok("nhảy qua số bị chiếm", capChainIdTuDong(new Set(), giaSuChiem) === GOC_DAI_CHAINID + 1);

// ─── 5. ĐỐI CHỨNG NGƯỢC — phép cấp có PHÂN BIỆT được không? ──────────────────
// Mọi ca trên đều là "cổng xanh". Nếu `capChainIdTuDong` bị thay bằng `() => GOC_DAI`
// thì 2/3/4 vẫn có ca xanh. Các ca dưới đây PHẢI đỏ với một hàm hỏng như thế.
console.log("\n─── 5. Đối chứng ngược ───");
ok("🔴 gốc dải cũ 9100 vẫn bị chặn nếu ai đó ép dùng lại",
  capChainIdTuDong(new Set(), daChiem, 9100) !== 9100,
  `9100 → ${capChainIdTuDong(new Set(), daChiem, 9100)} (nhảy qua Genesis Coin)`);

// Trần EIP-2294: đẩy gốc dải sát trần rồi bịt kín ⇒ PHẢI ném lỗi, không được treo im lặng.
let nem = null;
try {
  capChainIdTuDong(new Set([TRAN_EIP2294]), new Map(), TRAN_EIP2294);
} catch (e) { nem = e.message; }
ok("🔴 vượt trần EIP-2294 thì NÉM LỖI, không treo im lặng", nem !== null, nem ?? "KHÔNG ném — SAI");

// Phép cấp phải thật sự đọc hai sổ: bịt kín 500 số liên tiếp.
const bit = new Set(Array.from({ length: 500 }, (_, i) => GOC_DAI_CHAINID + i));
ok("🔴 bịt 500 số liên tiếp ⇒ phải nhảy đúng 500",
  capChainIdTuDong(bit, daChiem) === GOC_DAI_CHAINID + 500,
  String(capChainIdTuDong(bit, daChiem)));

// ─── 6. Trần EIP-2294 với gốc dải thật ───────────────────────────────────────
console.log("\n─── 6. Gốc dải nằm dưới trần EIP-2294 ───");
ok("gốc dải < trần", GOC_DAI_CHAINID < TRAN_EIP2294,
  `còn ${(TRAN_EIP2294 - GOC_DAI_CHAINID).toLocaleString("vi-VN")} số`);

// ─── 7. TRẦN DẢI — David chốt cùng bộ định danh ngày G ───────────────────────
console.log("\n─── 7. Trần dải: cạn thì DỪNG CỨNG, không tự tràn ───");
// 🔴 These assertions must hold at EVERY generation, so they are written as properties of the
// block, never as the numbers of one generation.
//
// Measured 2026-08-30 during the g1 rehearsal: the previous wording pinned the literals of
// generation 0 (`9_000_999_999`, width `999_990`). Bumping `A1Gen` to 1 turned this gate red
// while nothing was wrong — a false red, and a false red two days before G-day is worse than
// no gate, because it teaches the operator that red lines here are noise.
//
// They also do NOT restate the formula in `lib/chainid.mjs` (that would make the test green by
// construction, the very failure this file's header warns about). They check it BACKWARDS:
// modulo and integer division recover the block from the number itself.
ok("trần KHỐI THẾ HỆ là số CUỐI của một khối triệu", TRAN_DAI_CHAINID % 1_000_000 === 999_999,
  String(TRAN_DAI_CHAINID));
ok(`🔴 khối đó đúng là khối của thế hệ ${A1_GEN}`,
  Math.floor((TRAN_DAI_CHAINID - 9_000_000_000) / 1_000_000) === A1_GEN,
  `khối ${Math.floor((TRAN_DAI_CHAINID - 9_000_000_000) / 1_000_000)}`);
// Generation 0 is the only one that gives up numbers: its floor is lifted to …010 to leave the
// parent chainId 9000000009 plus nine spare. Every later generation gets the full million.
ok(`khối thế hệ ${A1_GEN} rộng ${A1_GEN === 0 ? "999.990" : "1.000.000"} số`,
  TRAN_DAI_CHAINID - GOC_DAI_CHAINID + 1 === (A1_GEN === 0 ? 999_990 : 1_000_000),
  (TRAN_DAI_CHAINID - GOC_DAI_CHAINID + 1).toLocaleString("vi-VN"));
ok("🔴 khối thế hệ nằm TRỌN trong dải David chốt", TRAN_DAI_CHAINID <= TRAN_TOAN_DAI);
ok("🔴 khối thế hệ KHÔNG chạm chainId chain mẹ 9000000009", GOC_DAI_CHAINID > 9_000_000_009);

// Ba tính chất an toàn sinh ra từ ĐỘ DÀI CHỮ SỐ — tràn khỏi dải là mất cả ba, im lặng.
ok("mọi số trong dải có ĐÚNG 10 chữ số",
  String(GOC_DAI_CHAINID).length === 10 && String(TRAN_DAI_CHAINID).length === 10,
  `${String(GOC_DAI_CHAINID).length} … ${String(TRAN_DAI_CHAINID).length}`);
ok("🔴 networkID 999999999 (9 chữ số) nằm DƯỚI sàn dải ⇒ chép nhầm thì cổng bắt",
  999_999_999 < GOC_DAI_CHAINID);
ok("🔴 TOÀN BỘ dải vượt trần uint32 ⇒ chép nhầm chiều ngược lại thì node CHẾT TO, không im lặng",
  GOC_DAI_CHAINID > 4_294_967_295);

// 🔴 Ca đắt nhất: bịt kín tới trần rồi xin thêm một số ⇒ PHẢI ném lỗi, KHÔNG được trả
// 10000000010 (11 chữ số — mất tính chất "nhìn là phân biệt được với networkID").
const dảiNhỏ = { lo: 9_000_000_010, hi: 9_000_000_012 };
const bitKin = new Set([dảiNhỏ.lo, dảiNhỏ.lo + 1, dảiNhỏ.hi]);
let nemCanDai = null;
try {
  capChainIdTuDong(bitKin, new Map(), dảiNhỏ.lo, dảiNhỏ.hi);
} catch (e) { nemCanDai = e.message; }
ok("🔴 cạn dải ⇒ NÉM LỖI, không tràn ra ngoài dải",
  nemCanDai !== null && /cấp hết dải/i.test(nemCanDai),
  nemCanDai ? nemCanDai.slice(0, 72) + "…" : "KHÔNG ném — SAI");

// Đối chứng ngược cho chính ca trên: chừa đúng MỘT chỗ trống thì phải cấp được.
const conMotCho = new Set([dảiNhỏ.lo, dảiNhỏ.lo + 1]);
ok("chừa một chỗ trong dải ⇒ vẫn cấp được (phép đo phân biệt được cạn với không cạn)",
  capChainIdTuDong(conMotCho, new Map(), dảiNhỏ.lo, dảiNhỏ.hi) === dảiNhỏ.hi,
  String(capChainIdTuDong(conMotCho, new Map(), dảiNhỏ.lo, dảiNhỏ.hi)));

// ═══ 8. SỔ "A1 ĐÃ TẮNG CẤP" — nhớ xuyên thế hệ (D-086) ═══
//
// 🔴 Lỗ này chỉ lộ ra SAU một lượt re-genesis, tức đúng lúc không ai đang nhìn: sổ
// `console-chains.json` về rỗng, và mọi tên/số từng phát cho người dùng "còn trống".
console.log("\n─── 8. Sổ A1 đã từng cấp — xuyên thế hệ ───");

// 🔴 THE MECHANISM IS TESTED AGAINST A FIXTURE, NOT AGAINST THE LIVE LEDGER.
//
// Until 2026-09-01 every case below read `chainid-issued.json` and asserted that *those 49
// specific entries* were blocked. That conflates two different claims: **the gate blocks what
// it is given** (a property, always true) and **these entries are currently blocked**
// (operational data, legitimately changeable). When David released the team's test names on
// G-day the property was untouched, yet eight cases went red — a gate reporting a fault that
// did not exist, on the morning when a red line is most expensive.
//
// The fixture keeps the historical values because they are good cases (9201 sits OUTSIDE the
// contiguous 9100-9145 run, which is what proves the list is merged from real ledgers rather
// than derived from a range), but nothing here depends on them still being in the live file.
const FIXTURE_IDS = new Set([9100, 9141, 9201]);
const FIXTURE_NAMES = new Map([["david do", "David Do"], ["ownertest", "OwnerTest"]]);

ok("🔴 a chainId in the list is blocked", loiChainIdDaCap(9141, FIXTURE_IDS) !== null);
ok("🔴 the FIRST chainId the console ever issued (9100) is blocked",
  loiChainIdDaCap(9100, FIXTURE_IDS) !== null);
ok("🔴 9201 — OUTSIDE the contiguous run — is blocked too",
  loiChainIdDaCap(9201, FIXTURE_IDS) !== null,
  "a list merged from real ledgers, not inferred from a range");

ok("🔴 a name in the list is blocked", loiTenDaCap("David Do", FIXTURE_NAMES) !== null);
ok("🔴 a different CASE is still blocked",
  loiTenDaCap("david do", FIXTURE_NAMES) !== null,
  "blocking byte-for-byte means one capital letter walks straight past");
ok("🔴 surrounding WHITESPACE is still blocked",
  loiTenDaCap("  David Do  ", FIXTURE_NAMES) !== null);

// ─── Counter-checks: the gate must DISCRIMINATE, not block everything ───
ok("CONTROL — a chainId never issued is NOT blocked", loiChainIdDaCap(9146, FIXTURE_IDS) === null);
ok("CONTROL — this generation's block floor is NOT blocked",
  loiChainIdDaCap(GOC_DAI_CHAINID, FIXTURE_IDS) === null);
ok("CONTROL — an unused name is NOT blocked",
  loiTenDaCap("MotCaiTenChuaAiDung", FIXTURE_NAMES) === null);
ok("CONTROL — an EMPTY ledger blocks nothing (it reads the list, it does not invent one)",
  loiChainIdDaCap(9141, new Set()) === null && loiTenDaCap("David Do", new Map()) === null);

// Self-issue must step over the ledger too. The live block floor sits far above these numbers,
// so this case builds a SMALL range overlapping the fixture to make the measurement mean something.
const capTrongVungDaCap = capChainIdTuDong(new Set([9100, 9101, 9102]), new Map(), 9100, 9210);
ok("🔴 self-issue inside an already-issued run skips all of it and lands on the first free number",
  capTrongVungDaCap === 9103, String(capTrongVungDaCap));
ok("CONTROL — same range WITHOUT passing the ledger ⇒ 9100, a number already handed out",
  capChainIdTuDong(new Set(), new Map(), 9100, 9210) === 9100,
  "proves that passing the ledger in is what makes the difference");

// ─── The LIVE file: judged on being COHERENT, not on holding any particular entry ───
const daCapFile = JSON.parse(readFileSync(path.join(THU_MUC, "chainid-issued.json"), "utf8"));
const daCapId = new Set(daCapFile.chainIds);
const daCapTen = new Map(daCapFile.names.map((t) => [t.toLowerCase(), t]));
const daTha = daCapFile.released ?? { chainIds: 0, names: 0, releases: 0 };

ok("the live ledger's counts match its own lists",
  daCapId.size === daCapFile.chainIdCount && daCapTen.size === daCapFile.nameCount,
  `${daCapId.size}/${daCapFile.chainIdCount} · ${daCapTen.size}/${daCapFile.nameCount}`);

// 🔴 An EMPTY block-list is only acceptable when a release declaration accounts for it. Empty
// because somebody decided, and empty because an archived ledger went missing, look identical
// from here — and one of them hands issued names back into circulation.
ok("🔴 an empty live ledger is backed by a release declaration",
  daCapId.size > 0 || daTha.chainIds > 0,
  `${daCapId.size} blocked · ${daTha.chainIds} released across ${daTha.releases} declaration(s)`);
ok("the live ledger names at least one source (it was merged, not hand-written)",
  (daCapFile.sources ?? []).length > 0, String((daCapFile.sources ?? []).length));

console.log(`\n${hong === 0 ? "✅" : "🔴"} ${dat} đạt · ${hong} hỏng`);
process.exit(hong === 0 ? 0 : 1);
