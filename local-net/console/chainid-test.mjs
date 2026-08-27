// ═══ BÀI KIỂM PHÉP CẤP chainId (D-069 / B-14) ═══
//
// Chạy: `node local-net/console/chainid-test.mjs`
//
// 🔴 Bài này `import` **mã thật** (`../lib/chainid.mjs`) và đọc **danh sách chặn thật**
// (`chainid-da-chiem.json`). Nó KHÔNG chép lại công thức cấp số — chép là đúng lớp lỗi
// `check-consistency.mjs` đã dính, nơi bản chép tay bằng JS xanh suốt trong khi con số nó
// khẳng định đã trôi lệch khỏi mã thật.
//
// Mọi ca ĐẠT đều đi kèm một ca **đối chứng ngược**: cổng chỉ biết xanh không chứng minh gì
// (luật cứng #1/#2 của repo).
import { readFileSync } from "node:fs";
import path from "node:path";
import { capChainIdTuDong, loiChainIdDaCap, loiTenDaCap, A1_GEN, GOC_DAI_CHAINID, TRAN_DAI_CHAINID, TRAN_TOAN_DAI, TRAN_EIP2294 } from "../lib/chainid.mjs";

const THU_MUC = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const chan = JSON.parse(readFileSync(path.join(THU_MUC, "chainid-da-chiem.json"), "utf8"));
const daChiem = new Map(chan.daBiChiem.map((m) => [m.chainId, m.ten]));

let dat = 0, hong = 0;
const ok = (nhan, dieuKien, chiTiet = "") => {
  if (dieuKien) { dat++; console.log(`  ✓ ${nhan}${chiTiet ? ` — ${chiTiet}` : ""}`); }
  else { hong++; console.log(`  ✗ ${nhan}${chiTiet ? ` — ${chiTiet}` : ""}`); }
};

console.log("═══ CẤP chainId — D-069 ═══");
console.log(`thế hệ  : ${A1_GEN}`);
console.log(`khối    : ${GOC_DAI_CHAINID} – ${TRAN_DAI_CHAINID}`);
console.log(`chặn    : ${daChiem.size} số · tra ${chan.ngayTra} · nguồn ${chan.nguon}`);

// ─── 1. Danh sách chặn phải LÀNH ─────────────────────────────────────────────
// Một danh sách rỗng cho ra kết quả y hệt một danh sách hỏng. Neo vào thứ ta biết chắc
// phải có: 9100 = Genesis Coin, chính là số đã đẻ ra B-14.
console.log("\n─── 1. Danh sách chặn có thật không ───");
ok("khác rỗng", daChiem.size > 0, `${daChiem.size} số`);
ok("neo 9100 = Genesis Coin", /genesis coin/i.test(daChiem.get(9100) ?? ""), daChiem.get(9100) ?? "KHÔNG CÓ");
ok("phủ cả 3 số còn lại của dải cũ", [9108, 9134, 9170].every((n) => daChiem.has(n)));
ok("khai đúng nguồn nó đọc", typeof chan.nguon === "string" && chan.nguon.length > 0, chan.nguon);

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
ok("trần KHỐI THẾ HỆ 0 = 9.000.999.999", TRAN_DAI_CHAINID === 9_000_999_999, String(TRAN_DAI_CHAINID));
ok("khối thế hệ 0 rộng 999.990 số", TRAN_DAI_CHAINID - GOC_DAI_CHAINID + 1 === 999_990,
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

const daCapFile = JSON.parse(readFileSync(path.join(THU_MUC, "chainid-da-cap.json"), "utf8"));
const daCapId = new Set(daCapFile.chainIds);
const daCapTen = new Map(daCapFile.tens.map((t) => [t.toLowerCase(), t]));

ok("danh sách có thật (≥ 40 chainId, ≥ 40 tên)",
  daCapId.size >= 40 && daCapTen.size >= 40,
  `${daCapId.size} chainId · ${daCapTen.size} tên`);

ok("🔴 9141 (chain \"David Do\") bị chặn", loiChainIdDaCap(9141, daCapId) !== null);
ok("🔴 9100 (OwnerTest — số console từng cấp ĐẦU TIÊN) bị chặn", loiChainIdDaCap(9100, daCapId) !== null);
ok("🔴 9201 (DeltaChain — NGOÀI dải liền 9100–9145) bị chặn",
  loiChainIdDaCap(9201, daCapId) !== null,
  "chứng minh danh sách gộp từ sổ thật, không suy từ một dải");

ok("🔴 tên \"David Do\" bị chặn", loiTenDaCap("David Do", daCapTen) !== null);
ok("🔴 tên \"david do\" (khác hoa/thường) VẪN bị chặn",
  loiTenDaCap("david do", daCapTen) !== null,
  "chặn theo byte thì đổi một chữ hoa là lách được");
ok("🔴 tên \"  David Do  \" (thừa khoảng trắng) VẪN bị chặn",
  loiTenDaCap("  David Do  ", daCapTen) !== null);

// ─── Đối chứng ngược: cổng phải phân biệt được, không phải chặn tất ───
ok("ĐỐI CHỨNG — 9146 (chưa từng cấp) KHÔNG bị chặn", loiChainIdDaCap(9146, daCapId) === null);
ok("ĐỐI CHỨNG — 9000000010 (gốc dải hiện tại) KHÔNG bị chặn",
  loiChainIdDaCap(GOC_DAI_CHAINID, daCapId) === null);
ok("ĐỐI CHỨNG — tên \"MotCaiTenChuaAiDung\" KHÔNG bị chặn",
  loiTenDaCap("MotCaiTenChuaAiDung", daCapTen) === null);
ok("ĐỐI CHỨNG — sổ RỖNG thì không chặn gì (phép đo đọc sổ, không tự bịa)",
  loiChainIdDaCap(9141, new Set()) === null && loiTenDaCap("David Do", new Map()) === null);

// Đường TỰ CẤP phải bỏ qua cả sổ này. Hôm nay gốc dải cách 9201 rất xa nên phép cấp
// không đổi — nên ca này dựng một dải NHỎ chồng lên vùng đã cấp để phép đo có nghĩa.
const capTrongVungDaCap = capChainIdTuDong(new Set([...daCapId]), new Map(), 9100, 9210);
ok("🔴 tự cấp trong vùng đã cấp ⇒ nhảy qua hết, ra số trống đầu tiên",
  capTrongVungDaCap === 9146,
  String(capTrongVungDaCap));
ok("ĐỐI CHỨNG — cùng dải nhưng KHÔNG truyền sổ đã cấp ⇒ ra 9100 (số đã phát cho người thật)",
  capChainIdTuDong(new Set(), new Map(), 9100, 9210) === 9100,
  "chứng minh chính việc truyền sổ vào là thứ tạo ra khác biệt");

console.log(`\n${hong === 0 ? "✅" : "🔴"} ${dat} đạt · ${hong} hỏng`);
process.exit(hong === 0 ? 0 : 1);
