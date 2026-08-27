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
import { capChainIdTuDong, GOC_DAI_CHAINID, TRAN_EIP2294 } from "../lib/chainid.mjs";

const THU_MUC = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const chan = JSON.parse(readFileSync(path.join(THU_MUC, "chainid-da-chiem.json"), "utf8"));
const daChiem = new Map(chan.daBiChiem.map((m) => [m.chainId, m.ten]));

let dat = 0, hong = 0;
const ok = (nhan, dieuKien, chiTiet = "") => {
  if (dieuKien) { dat++; console.log(`  ✓ ${nhan}${chiTiet ? ` — ${chiTiet}` : ""}`); }
  else { hong++; console.log(`  ✗ ${nhan}${chiTiet ? ` — ${chiTiet}` : ""}`); }
};

console.log("═══ CẤP chainId — D-069 ═══");
console.log(`gốc dải : ${GOC_DAI_CHAINID}`);
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

console.log(`\n${hong === 0 ? "✅" : "🔴"} ${dat} đạt · ${hong} hỏng`);
process.exit(hong === 0 ? 0 : 1);
