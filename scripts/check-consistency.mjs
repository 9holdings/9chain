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
 * Tệp này in ra **con số nó vừa kiểm** ở mỗi dòng, và có `--tu-kiem` chạy một bộ ca
 * SAI đã biết để chứng minh nó biết báo đỏ.
 *
 * Dùng:
 *   node scripts/check-consistency.mjs            # kiểm bảng đang khai bên dưới
 *   node scripts/check-consistency.mjs --tu-kiem  # đối chứng ngược
 */

import { readFileSync } from "node:fs";

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

const tuKiemMode = process.argv.includes("--tu-kiem");
let hong = inKetQua(chay(BANG, THANG), "BẢNG ĐANG KHAI (DECISIONS D-039 · D-042)");
if (tuKiemMode) hong += tuKiem();

if (hong) {
  console.log(`\n✗ ${hong} vấn đề — ĐỪNG sửa genesis cho tới khi sạch.`);
  process.exit(1);
}
console.log(`\n✓ nhất quán${tuKiemMode ? " · đối chứng ngược đầy đủ" : " (chạy --tu-kiem để chứng minh cổng biết báo đỏ)"}`);
