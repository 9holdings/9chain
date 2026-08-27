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
// `01/09` trống. `NGAY-G-A1-CON-LAI.md` §7 điều 3 nói rõ điều đó.
//
//   node scripts/check-chainid.mjs                       # tải mới rồi tra
//   node scripts/check-chainid.mjs --tep <chains.json>   # tra một bản đã tải (tái lập)
//   node scripts/check-chainid.mjs --luu <thư mục>       # lưu bản đã tải làm vật chứng
//   node scripts/check-chainid.mjs --them 1              # ⇦ ĐỐI CHỨNG NGƯỢC: 1 = Ethereum
//                                                        #    Mainnet, PHẢI ra "bị chiếm"
//   node scripts/check-chainid.mjs --sinh-danh-sach-chan local-net/console/chainid-da-chiem.json
//        # sinh danh sách chặn TĨNH cho console (dải 9100–9999). Console không gọi mạng lúc
//        # đẻ chain — nó đọc ảnh chụp này. Ảnh chụp CŨ DẦN, nên tệp mang theo ngày tra.
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
// Không chỉ có 9000000009. Console tự cấp chainId cho L1 người dùng bằng
// `chainId = 9100; while (taken) chainId++` (`local-net/console/server.mjs`), và **đó cũng là
// chainId EVM thật** — người dùng thêm nó vào MetaMask y như mọi mạng khác. Sổ cũ chạy tới
// 9145; dải cấp tiếp theo còn đi xa hơn. Bản kế hoạch G4 chỉ nêu 9000000009; thiếu dải L1 là
// bỏ sót đúng chỗ có người thật.
const CAN_TRA = [
  { id: 9000000009, vaiTrò: "C-Chain của 9Chain-A1 — bản sắc, chốt ở D-047" },
  ...Array.from({ length: 100 }, (_, i) => ({ id: 9100 + i, vaiTrò: `dải console tự cấp cho L1 người dùng (9100+${i})` })),
];

// ═════════════════════════════ lấy sổ ═════════════════════════════
const TEP = cờ("--tep");
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

const cầnTra = [...CAN_TRA, ...cờNhiều("--them").map((s) => ({ id: Number(s), vaiTrò: "thêm bằng --them (đối chứng ngược?)" }))];

const bịChiếm = [];
for (const mục of cầnTra) {
  const hit = theoId.get(mục.id);
  if (hit) bịChiếm.push({ ...mục, boi: hit.map((c) => `${c.name} (${c.shortName ?? "?"}, ${c.chain ?? "?"})`) });
}

console.log("\n─── Kết quả ───");
console.log(`  tra ${cầnTra.length} chainId: 9000000009 · dải L1 9100–9199` +
  (cờNhiều("--them").length ? ` · thêm ${cờNhiều("--them").join(", ")}` : ""));

if (bịChiếm.length === 0) {
  console.log("  ✓ KHÔNG số nào bị chiếm trong sổ tại thời điểm tra");
} else {
  for (const b of bịChiếm) {
    console.log(`  🔴 ${b.id} BỊ CHIẾM — ${b.boi.join(" · ")}`);
    console.log(`      vai trò bên A1: ${b.vaiTrò}`);
  }
}

// Cận: số gần nhất trong sổ quanh 9000000009 — để biết vùng đó có ai lai vãng không.
const gần = [...theoId.keys()].filter((k) => Math.abs(k - 9000000009) < 1_000_000).sort((a, b) => a - b);
console.log(`  · hàng xóm trong bán kính 1 triệu quanh 9000000009: ${gần.length ? gần.join(", ") : "không có"}`);

// ─── Lưu vật chứng ───
const LUU = cờ("--luu");
if (LUU) {
  mkdirSync(LUU, { recursive: true });
  writeFileSync(join(LUU, "chains.json"), thô);
  const bảnKhai = {
    nguồn: nguồnMôTả, ngàyTra, sha256: hash, sốByte: thô.length, sốMục: sổ.length,
    neoChainId1: neo?.name ?? null,
    đãTra: cầnTra.map((m) => m.id), bịChiếm,
    hàngXómQuanh9000000009: gần,
  };
  writeFileSync(join(LUU, "KET-QUA-TRA.json"), JSON.stringify(bảnKhai, null, 2) + "\n");
  console.log(`\nvật chứng: ${join(LUU, "chains.json")} + KET-QUA-TRA.json`);
}

// ─── Sinh danh sách chặn tĩnh cho console ───
// Console **không gọi mạng** lúc đẻ chain: một lời gọi HTTP ra Internet nằm giữa đường
// người dùng bấm nút là thêm một chỗ hỏng ngoài tầm kiểm soát, và hỏng lúc đó thì hoặc
// chặn oan hoặc bỏ qua im lặng. Nên nó đọc **ảnh chụp**. Cái giá: ảnh chụp cũ dần ⇒ tệp
// mang theo `ngayTra` và console **in ra tuổi của nó**.
const SINH = cờ("--sinh-danh-sach-chan");
if (SINH) {
  const [lo, hi] = (cờ("--dai", "9100-9999")).split("-").map(Number);
  const trongDải = sổ
    .filter((c) => typeof c.chainId === "number" && c.chainId >= lo && c.chainId <= hi)
    .sort((a, b) => a.chainId - b.chainId)
    .map((c) => ({ chainId: c.chainId, ten: c.name ?? "?" }));
  writeFileSync(SINH, JSON.stringify({
    _doc: "Danh sách chainId ĐÃ BỊ CHIẾM trong sổ công khai, dùng cho console lúc cấp chainId cho L1 người dùng. SINH TỰ ĐỘNG — đừng sửa tay, chạy lại scripts/check-chainid.mjs --sinh-danh-sach-chan.",
    nguon: NGUON, ngayTra: ngàyTra, sha256Nguon: hash, soMucTrongSo: sổ.length,
    dai: [lo, hi], soBiChiem: trongDải.length, daBiChiem: trongDải,
  }, null, 2) + "\n");
  console.log(`\ndanh sách chặn: ${SINH} — ${trongDải.length} số bị chiếm trong dải ${lo}–${hi}`);
}

console.log(`\n${bịChiếm.length === 0 ? "✅ trống" : "🔴 CÓ SỐ BỊ CHIẾM"} — tra lúc ${ngàyTra}`);
console.log("🔴 Lượt tra này chỉ nói về HÔM NAY. Sổ đổi hàng ngày ⇒ phải tra LẠI ngay trước");
console.log("   bước sinh genesis ngày G (NGAY-G-A1-CON-LAI §7 điều 3).");
process.exit(bịChiếm.length === 0 ? 0 : 1);
