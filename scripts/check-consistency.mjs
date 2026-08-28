#!/usr/bin/env node
/**
 * check-consistency.mjs — cổng nhất quán cho tokenomics 9Chain-A1.
 *
 * ═══ VÌ SAO CÓ TỆP NÀY ═══
 * Genesis là **bất biến**. Một con số sai đi vào đó thì không sửa được bằng bất kỳ
 * thao tác nào sau này — chỉ sinh lại toàn mạng. Nên các ràng buộc giữa những con số
 * đó phải được **khẳng định bằng máy**, không phải bằng người đọc lại bảng.
 *
 * Nó bắt được đúng lớp lỗi đã suýt xảy ra ngày 2026-08-26:
 *   • `SupplyCap` 90 tỷ ở thang `1e9` = 4,88 lần `uint64` — Go từ chối biên dịch, nhưng
 *     chỉ khi đã viết vào mã. Cổng này bắt từ lúc còn là con số trên bảng.
 *   • tổng các quỹ không bằng 100%, hoặc tổng chia nhỏ không bằng số của quỹ.
 *   • self-bond mỗi node vượt `MaxValidatorStake`, hoặc dưới `MinValidatorStake`.
 *
 * ⚠️ PHẠM VI: đây là cổng **SỐ HỌC + HẰNG SỐ**, không phải cổng hành vi. Nó nói được
 * "các con số nhất quán với nhau" — nó KHÔNG nói được "mạng chạy đúng". Đừng để nó
 * xanh rồi tưởng đã nghiệm thu.
 *
 * ═══ THEO D-035: MỌI CỔNG CHẶN PHẢI TRẢ LỜI "LÀM SAO BIẾT MÀY VỪA CHẠY?" ═══
 * Tệp này in ra **con số nó vừa kiểm** ở mỗi dòng, và có `--self-test` chạy một bộ ca
 * SAI đã biết để chứng minh nó biết báo đỏ.
 *
 * Dùng:
 *   node scripts/check-consistency.mjs            # kiểm bảng đang khai bên dưới
 *   node scripts/check-consistency.mjs --self-test  # đối chứng ngược
 */

import { readFileSync } from "node:fs";
// 🔴 `import` chứ không chép: đây là ĐÚNG mô-đun console dùng để cấp chainId cho
// L1 người dùng. Chép bảng số sang đây là tái phạm lỗi mà chính tệp này đã dính
// một lần với `SupplyCap` (xem khối chú thích ngay dưới).
import {
  A1_GEN,
  A1_ID_GOC,
  NETWORK_ID,
  TEN_MANG,
  GOC_DAI_CHAINID,
  TRAN_DAI_CHAINID,
  TRAN_TOAN_DAI,
} from "../local-net/lib/chainid.mjs";

const U64_MAX = (1n << 64n) - 1n;

// ═════════════════════════════════════════════════════════════════════════════
// ĐỌC `SupplyCap` THẲNG TỪ GO — patch 0013.
//
// 🔴 VÌ SAO: HANDOFF đã cảnh báo cổng này "giữ bảng số riêng bằng JS, không đọc
// một dòng Go nào". Đúng, và tới `27/08` bản chép tay đó ĐÃ TRÔI LỆCH THẬT: cổng
// vẫn khẳng định `SupplyCap = 9,000,000,000` trong khi binary đã đổi sang
// 7,900,000,001. Một cổng khẳng định một hằng số không còn tồn tại thì tệ hơn là
// không có cổng — nó cho người ta niềm tin sai.
//
// Nay số này KHÔNG còn được chép: đọc từ chính tệp mà node biên dịch. Bảng JS
// bên dưới giữ những thứ Go không khai (tổng cung công bố, %, chia nhỏ) — đó là
// phần cổng này thật sự có việc để làm.
// ═════════════════════════════════════════════════════════════════════════════
const HE_SO_UNITS = { Avax: 1n, KiloAvax: 1_000n, MegaAvax: 1_000_000n };
const GO_SUPPLY_CAP = new URL(
  "../upstream/avalanchego/genesis/genesis_9chain_a1.go",
  import.meta.url,
);

function docSupplyCapTuGo() {
  let src;
  try {
    src = readFileSync(GO_SUPPLY_CAP, "utf8");
  } catch (e) {
    return { love9: null, vi: `không đọc được ${GO_SUPPLY_CAP.pathname}: ${e.code ?? e.message}` };
  }
  // Chỉ khớp DÒNG GÁN, không khớp chú thích: neo `SupplyCap:` ở đầu dòng (sau
  // khoảng trắng) và đòi dấu phẩy cuối. Khối chú thích phía trên nhắc `SupplyCap`
  // nhiều lần; khớp nhầm vào đó là đọc ra số của một ví dụ.
  const m = src.match(/^\s*SupplyCap:\s*([0-9_]+)\s*\*\s*units\.(Avax|KiloAvax|MegaAvax)\s*,/m);
  if (!m) {
    return { love9: null, vi: "không tìm thấy dòng gán `SupplyCap: <số> * units.<đơn vị>,`" };
  }
  const so = BigInt(m[1].replace(/_/g, ""));
  return { love9: so * HE_SO_UNITS[m[2]], vi: `${m[1]} * units.${m[2]}` };
}

const SUPPLY_CAP_GO = docSupplyCapTuGo();

// ═════════════════════════════════════════════════════════════════════════════
// BỘ ĐỊNH DANH THẾ HỆ — `A1Gen` (Go) ↔ `A1_GEN` (JS)
//
// 🔴 VÌ SAO CÓ. Đo `2026-08-28`: thế hệ mạng được khai **hai lần, bằng hai ngôn
// ngữ, ở hai tệp không ai nối với nhau** —
//
//   Go  `utils/constants/network_ids.go`  → `A1Gen`   ⇒ binary + netgen
//   JS  `local-net/lib/chainid.mjs`       → `A1_GEN`  ⇒ console cấp chainId L1
//
// `chainid.mjs` **tự khai** rằng nó là bản chép (*"Đây là bản chép, và bản chép
// thì trôi lệch… Đừng sửa số này một mình"*) — nhưng lời dặn ấy sống trong một
// khối chú thích, tức nó chỉ có hiệu lực với người ĐỌC ĐÚNG TỆP ĐÓ đúng hôm ấy.
//
// Ngày G bump `0 → 1`. Bump một bên mà quên bên kia thì **không có gì báo lỗi**:
// node lên bình thường, console chạy bình thường, và console cấp chainId từ khối
// của **thế hệ khác**. Số đó đi vào ví người dùng qua một genesis **bất biến**.
// Đúng lớp lỗi đã ghi ở `CLAUDE.md` §2 — mọi cổng xanh vì không cổng nào đo
// **quan hệ giữa hai tệp**.
//
// ⚠️ Phía JS **`import` mã thật**, không regex: `chainid.mjs` là lib thuần (không
// `listen()`), nên đọc được giá trị đã TÍNH — gồm cả công thức dẫn xuất. Regex
// chỉ đọc được chữ; ở đây thứ cần kiểm là **kết quả**.
// ═════════════════════════════════════════════════════════════════════════════
const GO_DINH_DANH = new URL(
  "../upstream/avalanchego/utils/constants/network_ids.go",
  import.meta.url,
);

function docDinhDanhTuGo() {
  let src;
  try {
    src = readFileSync(GO_DINH_DANH, "utf8");
  } catch (e) {
    return { loiDoc: `không đọc được ${GO_DINH_DANH.pathname}: ${e.code ?? e.message}` };
  }
  // Neo vào DÒNG GÁN, không vào chú thích — khối chú thích phía trên nhắc cả năm
  // tên này nhiều lần, khớp nhầm vào đó là đọc ra số của một ví dụ (cùng kỷ luật
  // với `docSupplyCapTuGo`).
  const soU32 = (ten) => {
    const m = src.match(new RegExp(`^\\s*${ten}\\s+uint32\\s*=\\s*([0-9_]+)`, "m"));
    return m ? Number(m[1].replace(/_/g, "")) : null;
  };
  const chuoi = (ten) => {
    const m = src.match(new RegExp(`^\\s*${ten}\\s*=\\s*"([^"]+)"`, "m"));
    return m ? m[1] : null;
  };
  return {
    gen: soU32("A1Gen"),
    idGoc: soU32("A1IDGoc"),
    idGocTap: soU32("A1IDGocTap"),
    ten: chuoi("A1Name"),
    tenTap: chuoi("A1NameTap"),
    loiDoc: null,
  };
}

/** Ghép hai nguồn thành MỘT đối tượng để `chayDinhDanh` (và ca đối chứng) đọc. */
function ganDinhDanh() {
  return {
    go: docDinhDanhTuGo(),
    js: {
      gen: A1_GEN,
      idGoc: A1_ID_GOC,
      netID: NETWORK_ID,
      ten: TEN_MANG,
      gocDai: GOC_DAI_CHAINID,
      tranDai: TRAN_DAI_CHAINID,
      tranToanDai: TRAN_TOAN_DAI,
    },
  };
}

const TRAN_U32 = 4_294_967_295;
const BIEN_DO_GEN = 999; // khớp `bienDo` trong `network_ids.go`

function chayDinhDanh(d) {
  const loi = [];
  const ok = [];
  const K = (n) => (typeof n === "number" ? n.toLocaleString("en-US") : String(n));
  const dat = (dieuKien, cau) => (dieuKien ? ok : loi).push(cau);

  if (d.go.loiDoc) {
    loi.push(`KHÔNG ĐỌC ĐƯỢC bộ định danh bên Go — ${d.go.loiDoc}`);
    return { ok, loi };
  }
  for (const [khoa, ten] of [["gen", "A1Gen"], ["idGoc", "A1IDGoc"], ["idGocTap", "A1IDGocTap"]]) {
    if (d.go[khoa] === null) loi.push(`không tìm thấy dòng gán \`${ten} uint32 = <số>\` trong Go`);
  }
  for (const [khoa, ten] of [["ten", "A1Name"], ["tenTap", "A1NameTap"]]) {
    if (d.go[khoa] === null) loi.push(`không tìm thấy dòng gán \`${ten} = "<tên>"\` trong Go`);
  }
  if (loi.length) return { ok, loi };

  // 1. 🔴 CÂU HỎI CHÍNH CỦA CẢ KHỐI NÀY. Mọi dòng dưới đây chỉ có nghĩa nếu dòng này đúng.
  dat(
    d.go.gen === d.js.gen,
    `thế hệ khớp HAI ngôn ngữ: Go \`A1Gen\` = ${K(d.go.gen)} · JS \`A1_GEN\` = ${K(d.js.gen)}`,
  );

  // 2. A1Gen trong biên độ — Go tự khai `bienDo = 999` khi nhận diện băng.
  dat(
    d.go.gen >= 0 && d.go.gen <= BIEN_DO_GEN,
    `A1Gen ${K(d.go.gen)} nằm trong biên độ 0…${BIEN_DO_GEN} (khối chainId chỉ đủ ${BIEN_DO_GEN + 1} thế hệ)`,
  );

  // 3. TÊN mạng phải mang đúng thế hệ. Tên đi vào **đường dẫn DB** (config.go:1008),
  //    nên tên lệch thế hệ là mạng mới đọc thư mục dữ liệu của mạng cũ.
  dat(d.go.ten === `9chain-a1-g${d.go.gen}`, `A1Name = "${d.go.ten}" khớp A1Gen ${K(d.go.gen)}`);
  dat(
    d.go.tenTap === `9chain-a1-tap-g${d.go.gen}`,
    `A1NameTap = "${d.go.tenTap}" khớp A1Gen ${K(d.go.gen)}`,
  );

  // 4. networkID suy ra từ thế hệ — hai băng THẬT/TẬP không bao giờ chạm nhau.
  const netID = d.go.idGoc - d.go.gen;
  const netIDTap = d.go.idGocTap - d.go.gen;
  ok.push(`networkID suy ra = ${K(d.go.idGoc)} − ${K(d.go.gen)} = ${K(netID)}`);

  // 4b. 🔴 Ba số console DÙNG ĐỂ ĐỐI CHIẾU VỚI NODE ĐANG CHẠY. Chúng phải là hệ
  //     quả của Go, không phải ba lần gõ tay độc lập — nếu không thì cổng
  //     "console hỏi node thế hệ nào" (`kiemTheHeMang`) đang so node với một con
  //     số trôi lệch, tức nó xanh vì hai cái sai giống nhau.
  dat(
    d.js.idGoc === d.go.idGoc,
    `đỉnh băng khớp: Go \`A1IDGoc\` = ${K(d.go.idGoc)} · JS \`A1_ID_GOC\` = ${K(d.js.idGoc)}`,
  );
  dat(
    d.js.netID === netID,
    `JS \`NETWORK_ID\` = ${K(d.js.netID)} = networkID suy từ Go (${K(netID)})`,
  );
  dat(
    d.js.ten === d.go.ten,
    `JS \`TEN_MANG\` = "${d.js.ten}" khớp Go \`A1Name\` = "${d.go.ten}"`,
  );
  dat(
    d.go.idGoc - BIEN_DO_GEN > d.go.idGocTap,
    `băng THẬT (${K(d.go.idGoc - BIEN_DO_GEN)}…${K(d.go.idGoc)}) không chạm băng TẬP (…${K(d.go.idGocTap)})`,
  );

  // 5. Khối chainId của JS phải SUY ĐÚNG từ thế hệ. Đây là chỗ thiệt hại thật:
  //    console thế hệ mới mà giữ khối cũ thì nó phát lại số thế hệ trước đã phát.
  const gocDung = d.js.gen === 0 ? 9_000_000_010 : 9_000_000_000 + d.js.gen * 1_000_000;
  const tranDung = 9_000_000_000 + d.js.gen * 1_000_000 + 999_999;
  dat(
    d.js.gocDai === gocDung,
    `gốc khối chainId = ${K(d.js.gocDai)} (suy từ A1_GEN ${K(d.js.gen)} phải là ${K(gocDung)})`,
  );
  dat(
    d.js.tranDai === tranDung,
    `trần khối chainId = ${K(d.js.tranDai)} (suy từ A1_GEN ${K(d.js.gen)} phải là ${K(tranDung)})`,
  );
  dat(d.js.gocDai < d.js.tranDai, `khối thế hệ không rỗng: ${K(d.js.gocDai)} < ${K(d.js.tranDai)}`);
  dat(
    d.js.tranDai <= d.js.tranToanDai,
    `khối thế hệ nằm trong toàn dải L1 (trần ${K(d.js.tranToanDai)})`,
  );

  // 6. Ba tính chất an toàn mà `chainid.mjs` khai — kiểm chúng bằng SỐ, đừng tin chú thích.
  dat(
    netID < d.js.gocDai,
    `networkID ${K(netID)} nằm DƯỚI sàn khối chainId ${K(d.js.gocDai)} (chép nhầm ô thì cổng console bắt được)`,
  );
  dat(
    netIDTap < d.js.gocDai,
    `networkID mạng TẬP ${K(netIDTap)} cũng nằm dưới sàn khối chainId`,
  );
  dat(
    d.js.gocDai > TRAN_U32,
    `toàn dải L1 vượt trần uint32 ${K(TRAN_U32)} (chép nhầm chiều ngược lại ⇒ node KHÔNG khởi động được, lỗi to chứ không im lặng)`,
  );
  dat(
    String(netID).length < String(d.js.gocDai).length,
    `networkID ${String(netID).length} chữ số < chainId L1 ${String(d.js.gocDai).length} chữ số (không nhìn nhầm nhau)`,
  );

  return { ok, loi };
}

// ═════════════════════════════════════════════════════════════════════════════
// BẢNG SỐ — nguồn duy nhất. Sửa ở đây rồi mới sửa Go, và chạy cổng này trước.
// Xem DECISIONS.md D-039 (tổng cung) và D-042 (phân bổ).
// ═════════════════════════════════════════════════════════════════════════════
export const THANG = 1_000_000_000n; // 1 LOVE9 = 1e9 đơn vị P/X (D-039: GIỮ NGUYÊN)

export const BANG = {
  tongCung: 9_000_000_000n, // D-039 — TỔNG CUNG CÔNG BỐ, khác `supplyCap` bên dưới
  // `supplyCap` = trần của `currentSupply` trên P-Chain, ĐỌC TỪ GO, không chép.
  // Nó nhỏ hơn `tongCung` đúng bằng phần phát hành thẳng trên C-Chain — xem
  // ràng buộc 6b và khối chú thích ở `genesis/genesis_9chain_a1.go`.
  supplyCap: SUPPLY_CAP_GO.love9,
  supplyCapNguon: SUPPLY_CAP_GO.vi,
  quy: [
    { ten: "Team", pct: 9, love9: 810_000_000n, capOGenesis: true, cChain: 0n },
    { ten: "Private Sale", pct: 9, love9: 810_000_000n, capOGenesis: true, cChain: 0n },
    { ten: "Foundation", pct: 12, love9: 1_080_000_000n, capOGenesis: true },
    { ten: "Community", pct: 30, love9: 2_700_000_000n, capOGenesis: true },
    // 🔴 KHÔNG cấp ở genesis — đây là quỹ mint dần. Xem D-042.
    { ten: "Staking Rewards", pct: 40, love9: 3_600_000_000n, capOGenesis: false, cChain: 0n },
  ],
  // Chia nhỏ bên trong một quỹ. Tổng phải khớp đúng số của quỹ đó.
  //
  // 🔴 `cChain` = phần phát hành THẲNG trên C-Chain. Bắt buộc khai ở MỌI mục, kể
  // cả khi bằng 0: `Config.InitialSupply()` không đếm phần này, nên nó là đại
  // lượng quyết định `supplyCap` phải là bao nhiêu. Quên khai một mục là bảng
  // cộng thiếu và ràng buộc 6b sẽ đỏ — đúng như mong muốn.
  chiaNho: {
    Community: [
      { ten: "faucet (ví NÓNG, C-Chain)", love9: 99_999_999n, cChain: 99_999_999n },
      { ten: "quỹ Community (khoá 2 năm)", love9: 2_600_000_001n, cChain: 0n },
    ],
    Foundation: [
      { ten: "self-bond 9 node (địa chỉ RIÊNG)", love9: 8_999_991n, cChain: 0n },
      // 1,071,000,009 = 71,000,009 thanh khoản X/P + 1,000,000,000 trên C-Chain
      { ten: "Foundation vận hành", love9: 1_071_000_009n, cChain: 1_000_000_000n },
    ],
  },
  soNode: 9,
  selfBondMoiNode: 999_999n,
  minValidatorStake: 25_000n,
  maxValidatorStake: 625_000_000n,
};

// ═════════════════════════════════════════════════════════════════════════════

function chay(b, thang) {
  const loi = [];
  const ok = [];
  const K = (n) => n.toLocaleString("en-US");

  // 1. Tổng phần trăm = 100
  const tongPct = b.quy.reduce((s, q) => s + q.pct, 0);
  (tongPct === 100 ? ok : loi).push(`tổng phần trăm các quỹ = ${tongPct}% (phải 100%)`);

  // 2. Mỗi quỹ: pct × tổng cung == số khai. Bắt lệch làm tròn/gõ nhầm.
  for (const q of b.quy) {
    const dung = (b.tongCung * BigInt(q.pct)) / 100n;
    (q.love9 === dung ? ok : loi).push(
      `${q.ten}: ${q.pct}% của ${K(b.tongCung)} = ${K(dung)}, khai ${K(q.love9)}`,
    );
  }

  // 3. Tổng các quỹ = tổng cung
  const tongQuy = b.quy.reduce((s, q) => s + q.love9, 0n);
  (tongQuy === b.tongCung ? ok : loi).push(
    `tổng các quỹ = ${K(tongQuy)} (tổng cung ${K(b.tongCung)})`,
  );

  // 4. Chia nhỏ bên trong quỹ phải khớp đúng quỹ đó — chỗ dễ lệch nhất vì người ta
  //    sửa một dòng con mà quên dòng tổng.
  for (const [tenQuy, phan] of Object.entries(b.chiaNho)) {
    const q = b.quy.find((x) => x.ten === tenQuy);
    if (!q) { loi.push(`chiaNho trỏ vào quỹ không tồn tại: ${tenQuy}`); continue; }
    const tong = phan.reduce((s, p) => s + p.love9, 0n);
    (tong === q.love9 ? ok : loi).push(
      `${tenQuy}: tổng ${phan.length} phần = ${K(tong)} (quỹ ${K(q.love9)})`,
    );
  }

  // 5. Phát hành genesis + quỹ mint = tổng cung
  const gen = b.quy.filter((q) => q.capOGenesis).reduce((s, q) => s + q.love9, 0n);
  const mint = b.tongCung - gen;
  ok.push(`phát hành genesis = ${K(gen)} (${(Number(gen * 1000n / b.tongCung) / 10).toFixed(1)}%) · quỹ mint = ${K(mint)}`);

  // 6. 🔴 TRẦN uint64 — đây là ràng buộc đã suýt chặn cả kế hoạch (90 tỷ tràn 4,88 lần)
  const kiemU64 = (ten, love9) => {
    const dv = love9 * thang;
    const pct = Number((dv * 10000n) / U64_MAX) / 100;
    (dv <= U64_MAX ? ok : loi).push(
      `${ten} = ${K(dv)} đơn vị (${pct.toFixed(3)}% uint64)${dv <= U64_MAX ? "" : " ← TRÀN uint64"}`,
    );
  };
  // 6b. 🔴 KẾ TOÁN TỔNG CUNG — ràng buộc quan trọng nhất của cổng này.
  //
  //	supplyCap (trần P/X, trong binary)  +  phát hành thẳng C-Chain  ==  tổng cung
  //
  // `Config.InitialSupply()` (genesis/config.go:146) chỉ cộng `Allocations` (X/P);
  // `CChainGenesis` nằm ngoài vòng lặp ⇒ token trên C-Chain TỒN TẠI mà
  // `currentSupply` không bao giờ đếm tới. Nên đặt `supplyCap = tổng cung` là cho
  // staking mint thừa đúng bằng phần C-Chain — mạng vẫn xanh, chỉ lời hứa sai.
  // Đây là lỗi đã có thật trong mã tới `2026-08-27`; xem docs/CORE-AUDIT-2026-08-27.md.
  const cChainCuaQuy = (q) =>
    b.chiaNho[q.ten] ? b.chiaNho[q.ten].reduce((s, p) => s + (p.cChain ?? 0n), 0n) : (q.cChain ?? 0n);
  const tongCChain = b.quy.reduce((s, q) => s + cChainCuaQuy(q), 0n);

  if (b.supplyCap == null) {
    loi.push(`KHÔNG đọc được SupplyCap từ Go — ${b.supplyCapNguon}`);
  } else {
    ok.push(`SupplyCap đọc TỪ GO: ${K(b.supplyCap)} LOVE9 (\`${b.supplyCapNguon}\`) — không chép tay`);
    (b.supplyCap + tongCChain === b.tongCung ? ok : loi).push(
      `SupplyCap ${K(b.supplyCap)} + C-Chain ${K(tongCChain)} = ${K(b.supplyCap + tongCChain)} ` +
        `(tổng cung ${K(b.tongCung)})`,
    );
    // Dư địa mint thực tế PHẢI bằng ô Staking Rewards, nếu không thì bảng công bố
    // và hành vi của `reward/calculator.go` nói hai chuyện khác nhau.
    const genXP = gen - tongCChain;
    const duDiaMint = b.supplyCap - genXP;
    const oMint = b.quy.find((q) => !q.capOGenesis)?.love9 ?? 0n;
    (duDiaMint === oMint ? ok : loi).push(
      `dư địa mint = SupplyCap ${K(b.supplyCap)} − genesis X/P ${K(genXP)} = ${K(duDiaMint)} ` +
        `(ô mint khai ${K(oMint)})`,
    );
  }

  kiemU64("SupplyCap", b.supplyCap ?? b.tongCung);
  kiemU64("tổng cung công bố", b.tongCung);
  kiemU64("phát hành genesis", gen);
  kiemU64("MaxValidatorStake", b.maxValidatorStake);

  // 7. self-bond: chia hết cho số node, và nằm trong [Min, Max]ValidatorStake
  const sbTong = b.selfBondMoiNode * BigInt(b.soNode);
  (sbTong % BigInt(b.soNode) === 0n ? ok : loi).push(
    `self-bond ${K(sbTong)} chia cho ${b.soNode} node = ${K(sbTong / BigInt(b.soNode))} (không dư)`,
  );
  (b.selfBondMoiNode >= b.minValidatorStake ? ok : loi).push(
    `self-bond/node ${K(b.selfBondMoiNode)} ≥ MinValidatorStake ${K(b.minValidatorStake)}`,
  );
  (b.selfBondMoiNode <= b.maxValidatorStake ? ok : loi).push(
    `self-bond/node ${K(b.selfBondMoiNode)} ≤ MaxValidatorStake ${K(b.maxValidatorStake)}`,
  );

  // 8. self-bond phải NẰM TRONG một mục chia nhỏ nào đó — nếu không thì nó là tiền
  //    từ trên trời, và genesis sẽ phát hành nhiều hơn bảng khai.
  const coTrongChiaNho = Object.values(b.chiaNho)
    .flat()
    .some((p) => p.love9 === sbTong);
  (coTrongChiaNho ? ok : loi).push(
    `self-bond ${K(sbTong)} có nằm trong một mục chia nhỏ (không phải tiền ngoài bảng)`,
  );

  return { ok, loi };
}

function inKetQua({ ok, loi }, tieuDe) {
  console.log(`\n── ${tieuDe} ──`);
  for (const d of ok) console.log(`  ✓ ${d}`);
  for (const d of loi) console.log(`  ✗ ${d}`);
  console.log(`  ${ok.length} đạt · ${loi.length} lỗi`);
  return loi.length;
}

// ═════ ĐỐI CHỨNG NGƯỢC (D-035) ═════
// Không có phần này thì "0 lỗi" có thể chỉ nghĩa là phép kiểm không chạy.
function tuKiem() {
  const caSai = [
    ["tổng % thành 101", (b) => { b.quy[0].pct = 10; }],
    ["một quỹ lệch số so với %", (b) => { b.quy[3].love9 += 1n; }],
    ["chia nhỏ không khớp quỹ", (b) => { b.chiaNho.Community[0].love9 += 1n; }],
    ["tổng cung 90 tỷ (tràn uint64)", (b) => {
      b.tongCung = 90_000_000_000n;
      for (const q of b.quy) q.love9 = (b.tongCung * BigInt(q.pct)) / 100n;
      b.chiaNho = {};
    }],
    ["self-bond/node dưới MinValidatorStake", (b) => { b.selfBondMoiNode = 1n; }],
    ["self-bond/node vượt MaxValidatorStake", (b) => { b.selfBondMoiNode = 999_999_999n; }],
    // 🔴 Ba ca dưới đây là LỖI CÓ THẬT trong mã tới 2026-08-27, không phải giả định.
    ["SupplyCap = tổng cung (bỏ quên phần C-Chain)", (b) => { b.supplyCap = b.tongCung; }],
    ["quên khai cChain của một mục", (b) => { b.chiaNho.Foundation[1].cChain = 0n; }],
    ["không đọc được SupplyCap từ Go", (b) => { b.supplyCap = null; b.supplyCapNguon = "ca thử"; }],
  ];
  let hong = 0;
  console.log("\n══ ĐỐI CHỨNG NGƯỢC — mỗi ca dưới đây PHẢI ra đỏ ══");
  for (const [ten, pha] of caSai) {
    const b = JSON.parse(JSON.stringify(BANG, (k, v) => (typeof v === "bigint" ? `${v}n` : v)),
      (k, v) => (typeof v === "string" && /^\d+n$/.test(v) ? BigInt(v.slice(0, -1)) : v));
    pha(b);
    const { loi } = chay(b, THANG);
    if (loi.length > 0) console.log(`  ✓ "${ten}" → bắt được (${loi.length} lỗi)`);
    else { console.log(`  ✗ "${ten}" → KHÔNG bắt được — cổng này đang MÙ ở chỗ đó`); hong++; }
  }
  return hong;
}

// ═════ ĐỐI CHỨNG NGƯỢC — BỘ ĐỊNH DANH ═════
// 🔴 Ca 1 và ca 2 KHÔNG phải giả định: chúng là đúng hai cách quên của ngày G.
function tuKiemDinhDanh() {
  const caSai = [
    ["ngày G: bump JS mà QUÊN Go", (d) => { d.js.gen = 1; }],
    ["ngày G: bump Go mà QUÊN JS", (d) => { d.go.gen = 1; }],
    ["bump cả hai nhưng quên đổi A1Name", (d) => { d.go.gen = 1; d.js.gen = 1; d.js.gocDai = 9_001_000_000; d.js.tranDai = 9_001_999_999; }],
    ["thế hệ mới nhưng khối chainId GIỮ NGUYÊN của thế hệ cũ", (d) => {
      d.go.gen = 1; d.js.gen = 1; d.go.ten = "9chain-a1-g1"; d.go.tenTap = "9chain-a1-tap-g1";
    }],
    ["trần khối lệch gốc khối", (d) => { d.js.tranDai = d.js.gocDai - 1; }],
    ["khối thế hệ tràn ra ngoài toàn dải L1", (d) => { d.js.tranToanDai = 9_000_000_100; }],
    ["networkID rơi VÀO trong khối chainId", (d) => { d.go.idGoc = 9_000_000_100; }],
    ["A1Gen vượt biên độ 999", (d) => { d.go.gen = 1000; d.js.gen = 1000; }],
    ["băng THẬT chạm băng TẬP", (d) => { d.go.idGocTap = 999_999_000; }],
    ["JS gõ lại đỉnh băng thành số khác", (d) => { d.js.idGoc = 999_999_998; }],
    ["🔴 console mang networkID của thế hệ TRƯỚC (số console so với node)", (d) => { d.js.netID = 999_999_998; }],
    ["JS TEN_MANG lệch A1Name của Go", (d) => { d.js.ten = "9chain-a1"; }],
    ["không đọc được network_ids.go", (d) => { d.go = { loiDoc: "ca thử" }; }],
    ["Go đổi cách khai A1Gen (regex hết khớp)", (d) => { d.go.gen = null; }],
  ];
  let hong = 0;
  console.log("\n══ ĐỐI CHỨNG NGƯỢC — BỘ ĐỊNH DANH: mỗi ca PHẢI ra đỏ ══");
  for (const [ten, pha] of caSai) {
    const d = ganDinhDanh();
    pha(d);
    const { loi } = chayDinhDanh(d);
    if (loi.length > 0) console.log(`  ✓ "${ten}" → bắt được (${loi.length} lỗi)`);
    else { console.log(`  ✗ "${ten}" → KHÔNG bắt được — cổng này đang MÙ ở chỗ đó`); hong++; }
  }
  return hong;
}

const tuKiemMode = process.argv.includes("--self-test");
let hong = inKetQua(chay(BANG, THANG), "BẢNG ĐANG KHAI (DECISIONS D-039 · D-042)");
hong += inKetQua(chayDinhDanh(ganDinhDanh()), "BỘ ĐỊNH DANH THẾ HỆ (Go ↔ JS) — D-079 · D-093");
if (tuKiemMode) hong += tuKiem() + tuKiemDinhDanh();

if (hong) {
  console.log(`\n✗ ${hong} vấn đề — ĐỪNG sửa genesis cho tới khi sạch.`);
  process.exit(1);
}
console.log(`\n✓ nhất quán${tuKiemMode ? " · đối chứng ngược đầy đủ" : " (chạy --self-test để chứng minh cổng biết báo đỏ)"}`);
