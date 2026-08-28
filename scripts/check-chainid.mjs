// G4 — TRA SỔ ĐĂNG KÝ chainId CÔNG KHAI (`chainid.network` / `ethereum-lists/chains`)
//
// ═══ Vì sao ═══
// `chainId` là thứ **ví người dùng đọc**, và EIP-155 buộc chữ ký vào nó. Hai chuỗi cùng
// `chainId` là hai chuỗi ví không phân biệt được: người dùng thêm mạng, thấy số dư 0, và
// không có gì báo lỗi. Sổ `chainid.network` không phải luật, nhưng nó là thứ MetaMask và mọi
// công cụ "thêm mạng" tra vào — trùng ở đó là trùng ở nơi người thật va phải.
//
// ═══ 🔴 Phải tra LẠI ngay trước bước sinh genesis ngày G ═══
// Sổ này thay đổi hàng ngày. Lần tra hôm nay chứng minh **hôm nay** trống, không chứng minh
// `01/09` trống. `GDAY-A1-REMAINING.md` §7 điều 3 nói rõ điều đó.
//
//   node scripts/check-chainid.mjs                       # tải mới rồi tra
//   node scripts/check-chainid.mjs --file <chains.json>   # tra một bản đã tải (tái lập)
//   node scripts/check-chainid.mjs --save <thư mục>       # lưu bản đã tải làm vật chứng
//   node scripts/check-chainid.mjs --add 1              # ⇦ ĐỐI CHỨNG NGƯỢC: 1 = Ethereum
//                                                        #    Mainnet, PHẢI ra "bị chiếm"
//   node scripts/check-chainid.mjs --gen-blocklist local-net/console/chainid-taken.json
//        # sinh danh sách chặn TĨNH cho console (mặc định HAI dải: 9100–9999 cũ +
//        # 9000000010–9000009999 mới). Console không gọi mạng lúc đẻ chain — nó đọc ảnh chụp
//        # này. Ảnh chụp CŨ DẦN, nên tệp mang theo ngày tra. Thêm dải: `--range lo-hi` (lặp lại).
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const NGUON = "https://chainid.network/chains.json";

function cờ(tên, mặcĐịnh = undefined) {
  const i = process.argv.indexOf(tên);
  return i === -1 ? mặcĐịnh : process.argv[i + 1];
}
function cờNhiều(tên) {
  const ra = [];
  process.argv.forEach((v, i) => { if (v === tên) ra.push(process.argv[i + 1]); });
  return ra.filter(Boolean);
}

// ─── Số A1 quan tâm ───
// Không chỉ có 9000000009. Console tự cấp chainId cho L1 người dùng, và **đó cũng là chainId
// EVM thật** — người dùng thêm nó vào MetaMask y như mọi mạng khác. Bản kế hoạch G4 chỉ nêu
// 9000000009; thiếu dải L1 là bỏ sót đúng chỗ có người thật.
//
// 🔴 **Gốc dải đã ĐỔI `2026-08-27`: 9100 → 9000000010** (D-069, David chốt). Danh sách dưới
// đây phải đi theo, nếu không thì ngày G bài G4 tra một dải mà console không còn cấp — xanh
// đúng ở chỗ không ai đứng.
// 🔴 TRA THEO **DẢI**, KHÔNG LIỆT KÊ N SỐ ĐẦU.
//
// Bản trước liệt kê 100 số đầu của dải. Điều đó đúng khi dải rộng 100; sau khi David chốt trần
// `9999999999` thì dải rộng **~1 tỷ số**, và tra 100 số đầu là **xanh đúng ở chỗ không ai
// đứng**: nó không nói gì về 999.999.900 số còn lại mà console vẫn sẽ cấp.
//
// Cách đúng rẻ hơn hẳn: **lọc ngược** — quét toàn bộ sổ (2.7k mục) tìm mục nào rơi vào dải.
// O(số mục) thay vì O(độ rộng dải), và nó **phủ trọn dải** thay vì phủ một mẫu đầu.
const GOC_DAI = 9_000_000_010;
const TRAN_DAI = 9_999_999_999;
const CAN_TRA = [
  { id: 9000000009, vaiTrò: "C-Chain của 9Chain-A1 — bản sắc, chốt ở D-047" },
];

// ⚠️ Dải CŨ `9100–9999` **cố ý KHÔNG nằm trong `CAN_TRA`**, dù nó có 4 số bị chiếm thật.
// Lý do: `CAN_TRA` là *"số A1 định dùng — bị chiếm là ĐỎ"*. Sau D-069 console không cấp trong
// dải đó nữa, nên để nó lại là làm bài **luôn luôn đỏ**, và một cổng đỏ vĩnh viễn thì không ai
// còn đọc. Dải cũ chuyển vai: nó vào **danh sách chặn** (người dùng vẫn TỰ NHẬP được số trong
// đó), tức thông tin, không phải báo động.

// ═════════════════════════════ lấy sổ ═════════════════════════════
const TEP = cờ("--file");
let thô, nguồnMôTả;
if (TEP) {
  thô = readFileSync(TEP);
  nguồnMôTả = `tệp cục bộ ${TEP}`;
} else {
  const r = await fetch(NGUON);
  if (!r.ok) { console.error(`🔴 ${NGUON} trả HTTP ${r.status}`); process.exit(2); }
  thô = Buffer.from(await r.arrayBuffer());
  nguồnMôTả = NGUON;
}
const ngàyTra = new Date().toISOString();
const hash = createHash("sha256").update(thô).digest("hex");

console.log("═══ G4 — TRA SỔ chainId CÔNG KHAI ═══");
console.log(`nguồn   : ${nguồnMôTả}`);
console.log(`ngày tra: ${ngàyTra}`);
console.log(`sha256  : ${hash}`);
console.log(`kích cỡ : ${thô.length} byte`);

// ─── Kiểm sổ TRƯỚC khi tin nó ───
// 🔴 HTTP 200 không chứng minh gì (luật cứng #1 của repo). Một trang chặn bot, một trang lỗi
// của CDN, một bản cắt cụt — tất cả đều 200. Phải đọc NỘI DUNG, và phải neo vào một mục ta
// biết chắc phải có. Không có bước này thì "9000000009 không thấy trong sổ" cũng đúng y hệt
// khi sổ rỗng.
let sổ;
try { sổ = JSON.parse(thô.toString("utf8")); }
catch (e) { console.error(`\n🔴 KHÔNG PHẢI JSON hợp lệ: ${e.message}\n   ⇒ đây không phải sổ. Đừng kết luận gì từ lượt tra này.`); process.exit(2); }

const neo = Array.isArray(sổ) ? sổ.find((c) => c.chainId === 1) : null;
const sổLành = Array.isArray(sổ) && sổ.length > 500 && neo && /ethereum/i.test(neo.name ?? "");
console.log(`\n  ${sổLành ? "✓" : "✗"} sổ đọc được và có thật: ${Array.isArray(sổ) ? sổ.length : 0} mục` +
  `${neo ? ` · neo chainId 1 = "${neo.name}"` : " · 🔴 KHÔNG có chainId 1"}`);
if (!sổLành) {
  console.error("\n🔴 Sổ không qua được phép kiểm lành. Có thể là trang chặn bot / bản cắt cụt / lỗi CDN.");
  console.error("   ⇒ MỌI kết luận 'không bị chiếm' từ lượt này đều VÔ GIÁ TRỊ. Tra lại.");
  process.exit(2);
}

// ═════════════════════════════ tra ═════════════════════════════
const theoId = new Map();
for (const c of sổ) if (typeof c.chainId === "number") {
  if (!theoId.has(c.chainId)) theoId.set(c.chainId, []);
  theoId.get(c.chainId).push(c);
}

const cầnTra = [...CAN_TRA, ...cờNhiều("--add").map((s) => ({ id: Number(s), vaiTrò: "thêm bằng --add (đối chứng ngược?)" }))];

const bịChiếm = [];
for (const mục of cầnTra) {
  const hit = theoId.get(mục.id);
  if (hit) bịChiếm.push({ ...mục, boi: hit.map((c) => `${c.name} (${c.shortName ?? "?"}, ${c.chain ?? "?"})`) });
}

// ─── Quét TRỌN dải L1 bằng cách lọc ngược sổ ───
const trongDảiL1 = [...theoId.entries()]
  .filter(([id]) => id >= GOC_DAI && id <= TRAN_DAI)
  .sort((a, b) => a[0] - b[0]);
for (const [id, cs] of trongDảiL1) {
  bịChiếm.push({
    id,
    vaiTrò: `NẰM TRONG dải console tự cấp cho L1 người dùng (${GOC_DAI}–${TRAN_DAI})`,
    boi: cs.map((c) => `${c.name} (${c.shortName ?? "?"}, ${c.chain ?? "?"})`),
  });
}

console.log("\n─── Kết quả ───");
console.log(`  tra ${cầnTra.length} chainId đích danh (9000000009) + QUÉT TRỌN dải L1 ` +
  `${GOC_DAI.toLocaleString("vi-VN")}–${TRAN_DAI.toLocaleString("vi-VN")} ` +
  `(${(TRAN_DAI - GOC_DAI + 1).toLocaleString("vi-VN")} số)` +
  (cờNhiều("--add").length ? ` · thêm ${cờNhiều("--add").join(", ")}` : ""));
console.log(`  · trong dải L1: ${trongDảiL1.length === 0 ? "KHÔNG mục nào" : `🔴 ${trongDảiL1.length} mục`}`);

if (bịChiếm.length === 0) {
  console.log("  ✓ KHÔNG số nào bị chiếm trong sổ tại thời điểm tra");
} else {
  for (const b of bịChiếm) {
    console.log(`  🔴 ${b.id} BỊ CHIẾM — ${b.boi.join(" · ")}`);
    console.log(`      vai trò bên A1: ${b.vaiTrò}`);
  }
}

// Cận: số gần nhất trong sổ quanh 9000000009 — để biết vùng đó có ai lai vãng không.
// 🔴 Sau D-069 phép đo này **đắt hơn hẳn**: nó không còn chỉ nói về bản sắc A1 mà nói về
// **cả dải cấp cho người dùng**, vì dải đó nay bắt đầu ngay cạnh 9000000009. Vùng thưa =
// dải còn đi được xa mà không va ai. Đo `27/08`: trống trong bán kính 10 triệu.
const gần = [...theoId.keys()].filter((k) => Math.abs(k - 9000000009) < 10_000_000).sort((a, b) => a - b);
console.log(`  · hàng xóm trong bán kính 10 triệu quanh 9000000009: ${gần.length ? gần.join(", ") : "không có"}`);

// ─── Lưu vật chứng ───
const LUU = cờ("--save");
if (LUU) {
  mkdirSync(LUU, { recursive: true });
  writeFileSync(join(LUU, "chains.json"), thô);
  const bảnKhai = {
    nguồn: nguồnMôTả, ngàyTra, sha256: hash, sốByte: thô.length, sốMục: sổ.length,
    neoChainId1: neo?.name ?? null,
    đãTra: cầnTra.map((m) => m.id), bịChiếm,
    hàngXómQuanh9000000009: gần,
  };
  writeFileSync(join(LUU, "LOOKUP-RESULT.json"), JSON.stringify(bảnKhai, null, 2) + "\n");
  console.log(`\nvật chứng: ${join(LUU, "chains.json")} + LOOKUP-RESULT.json`);
}

// ─── Sinh danh sách chặn tĩnh cho console ───
// Console **không gọi mạng** lúc đẻ chain: một lời gọi HTTP ra Internet nằm giữa đường
// người dùng bấm nút là thêm một chỗ hỏng ngoài tầm kiểm soát, và hỏng lúc đó thì hoặc
// chặn oan hoặc bỏ qua im lặng. Nên nó đọc **ảnh chụp**. Cái giá: ảnh chụp cũ dần ⇒ tệp
// mang theo `lookupDate` và console **in ra tuổi của nó**.
const SINH = cờ("--gen-blocklist");
if (SINH) {
  // 🔴 HAI dải, không phải một — và dải CŨ ở lại là CÓ CHỦ Ý (D-069).
  //
  // Sau khi gốc dải đổi sang 9000000010, dải mới **trống hoàn toàn** trong bán kính 10 triệu.
  // Sinh danh sách chặn chỉ cho dải mới ⇒ tệp có `taken: []`. Một danh sách chặn RỖNG
  // không phân biệt được với một bộ sinh HỎNG: cả hai cho ra cùng một tệp, và console nạp
  // xong sẽ in "0 số" ở cả hai trường hợp. Đó đúng là "xanh giả" mà luật cứng #2 của repo
  // cấm — cổng chưa từng được nhìn thấy lúc nó ĐỎ.
  //
  // Giữ dải cũ 9100–9999 giải cả hai việc cùng lúc:
  //   · nó **thật sự vẫn cần chặn** — người dùng tự nhập số trong dải đó được;
  //   · nó cho tệp một **nội dung khác rỗng đã biết trước** (4 số trong 9100–9199), nên
  //     tệp rỗng từ nay là **tín hiệu HỎNG**, không phải trạng thái bình thường.
  const dảiThô = cờNhiều("--range");
  const dải = (dảiThô.length ? dảiThô : ["9100-9999", `${GOC_DAI}-${TRAN_DAI}`])
    .map((s) => s.split("-").map(Number));
  for (const [lo, hi] of dải) {
    if (!Number.isSafeInteger(lo) || !Number.isSafeInteger(hi) || lo > hi) {
      console.error(`🔴 --range không hợp lệ: ${lo}-${hi}`); process.exit(2);
    }
  }
  const trongDải = sổ
    .filter((c) => typeof c.chainId === "number" && dải.some(([lo, hi]) => c.chainId >= lo && c.chainId <= hi))
    .sort((a, b) => a.chainId - b.chainId)
    .map((c) => ({ chainId: c.chainId, ten: c.name ?? "?" }));

  if (trongDải.length === 0) {
    console.error("\n🔴 Danh sách chặn sinh ra RỖNG. Không ghi tệp.");
    console.error("   Rỗng không phân biệt được với 'bộ sinh hỏng' — xem khối chú thích ở đây.");
    console.error(`   Dải đã quét: ${dải.map(([l, h]) => `${l}-${h}`).join(", ")}`);
    process.exit(2);
  }

  writeFileSync(SINH, JSON.stringify({
    _doc: "Danh sách chainId ĐÃ BỊ CHIẾM trong sổ công khai, dùng cho console lúc cấp chainId cho L1 người dùng. SINH TỰ ĐỘNG — đừng sửa tay, chạy lại scripts/check-chainid.mjs --gen-blocklist.",
    // 🔴 `nguồnMôTả`, KHÔNG phải `NGUON`. Chạy với `--file` mà vẫn khai URL là tệp tự khai
    // rằng nó vừa hỏi Internet trong khi nó đọc một ảnh chụp trên đĩa — có thể là ảnh chụp
    // từ năm ngoái. Cùng lớp lỗi với bộ xuất O2 khai "kèm 1 L1" khi không có byte nào
    // (D-057): công cụ dựng ra để chống nói dối thì chỗ nó tự khai phải đúng trước nhất.
    source: nguồnMôTả, lookupDate: ngàyTra, sha256Source: hash, ledgerEntries: sổ.length,
    ranges: dải, takenCount: trongDải.length, taken: trongDải,
  }, null, 2) + "\n");
  console.log(`\ndanh sách chặn: ${SINH} — ${trongDải.length} số bị chiếm trong dải ` +
    dải.map(([l, h]) => `${l}–${h}`).join(" · "));
}

console.log(`\n${bịChiếm.length === 0 ? "✅ trống" : "🔴 CÓ SỐ BỊ CHIẾM"} — tra lúc ${ngàyTra}`);
console.log("🔴 Lượt tra này chỉ nói về HÔM NAY. Sổ đổi hàng ngày ⇒ phải tra LẠI ngay trước");
console.log("   bước sinh genesis ngày G (NGAY-G-A1-CON-LAI §7 điều 3).");
process.exit(bịChiếm.length === 0 ? 0 : 1);
