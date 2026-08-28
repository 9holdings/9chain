#!/usr/bin/env node
/**
 * close-ledger-before-regenesis.mjs — **đóng sổ danh bạ TRƯỚC một lượt sinh lại mạng** (O3b).
 *
 * ═══ VÌ SAO CÓ ═══
 *
 * Lượt `26/08` reset `console-chains.json` về `{"chains":[],"retired":[]}` ⇒ **43 bản ghi
 * chống phát lại biến mất**. Hệ quả không lộ ra ngay: `createChain` kiểm trùng trên
 * `chains ∪ retired`, nên xoá sổ là **trả lại cho vòng quay 43 tên + chainId đã phát cho
 * người thật** — ví của họ sẽ lặng lẽ trỏ vào chain của người khác.
 *
 * `NGAY-G-A1-CON-LAI.md` §5c đã chỉ đúng cách làm: **dồn `chains` sang `retired` rồi GIỮ
 * tệp**, đừng giữ nguyên cả tệp (console sẽ tưởng các chain đó còn sống trên một mạng chúng
 * không tồn tại) và đừng reset (mất sổ chống phát lại). Nhưng tới `28/08` **chưa có công cụ
 * nào làm việc đó** — nó vẫn là một thao tác tay trên một tệp JSON, đúng loại việc đã hỏng
 * một lần rồi.
 *
 * 🔴 **VÀ CÓ MỘT LỖ THỨ HAI, ĐO ĐƯỢC `28/08`:** `gen-chainid-issued.mjs` đọc sổ **trong
 * repo** (`9chain-a1-config/console-chains.json` + `docs/archive/`), trong khi sổ **đang
 * sống nằm trên server**, và `check-deploy-drift.mjs` cố ý **bỏ qua** tệp đó (`boQua`).
 * ⇒ Không cổng nào canh khoảng cách giữa hai sổ. Đo `28/08`: server `0 sống · 0 thu hồi`,
 * repo `1 sống (DeltaChain#9201) · 0 thu hồi` — **hai tệp không phải bản sao của nhau**.
 * Nếu server có chain mà repo không có, lượt sinh lại sẽ xoá chúng khỏi mọi nơi.
 *
 * ⇒ Tệp này làm ba việc, theo đúng thứ tự đó:
 *   1. **KÉO** sổ sống từ server về (chỉ đọc) và đối chiếu với những gì repo đã biết;
 *   2. **LƯU** bản ghi chưa ai biết vào `docs/archive/` — trước khi có gì bị xoá;
 *   3. **DỒN** `chains` → `retired` và ghi ra sổ mới, kèm `thuHoiLuc`.
 *
 * ⚠️ **KHÔNG ghi gì lên server.** Nó chuẩn bị tệp ở máy dev; đưa lên là việc có người bấm.
 *
 * Dùng:
 *   node scripts/close-ledger-before-regenesis.mjs --pull          # kéo sổ sống + đối chiếu
 *   node scripts/close-ledger-before-regenesis.mjs --compact <vào.json> --out <ra.json>
 *   node scripts/close-ledger-before-regenesis.mjs --self-test      # đối chứng ngược
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const lay = (co, mac) => {
  const i = argv.indexOf(co);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : mac;
};
const HOST = lay("--host", ""$A1_SSH_HOST"");
const KHOA = lay("--ssh-key", `${process.env.HOME || process.env.USERPROFILE}/.ssh/9chain-a1`);
const SO_SERVER = lay("--server-ledger", "~/9chain-a1/src/9chain-a1-config/console-chains.json");

/** Khoá nhận dạng một bản ghi: chainId + tên thường hoá. */
const khoaBanGhi = (c) => `${Number(c.chainId)}|${String(c.name ?? "").trim().toLowerCase()}`;

/**
 * DỒN — hàm thuần, để bài đối chứng gọi được mà không cần server.
 *
 * 🔴 Ba tính chất phải giữ, và cả ba đều đã có ca đỏ riêng:
 *   1. **Không mất bản ghi nào**: |ra.retired| = |vào.chains| + |vào.retired|.
 *   2. **Không đẻ ra bản ghi**: mọi bản ghi ở ra đều truy được về vào.
 *   3. `chains` ra **rỗng** — sổ mới không được khai chain nào còn sống trên một mạng
 *      chúng chưa từng tồn tại.
 */
export function don(so, { luc = null } = {}) {
  const loi = [];
  if (so === null || typeof so !== "object") {
    return { loi: ["sổ không đọc được (không phải đối tượng JSON)"], chuY: [], ra: null };
  }
  // 🔴 THIẾU KHOÁ ≠ SAI KIỂU, và bản đầu của tôi gộp hai thứ đó rồi từ chối cả sổ
  // `9chain-a1-config/console-chains.json` thật. Sai: `loadState()` trong
  // `console/server.mjs` khai rõ tệp **không có khoá `retired`** là **định dạng trước
  // M4.4** và vẫn hợp lệ — nó chuẩn hoá bằng `if (!Array.isArray(...)) = []`.
  //   • khoá VẮNG MẶT  ⇒ định dạng cũ, coi như rỗng, **nhưng khai ra** (đừng im lặng)
  //   • khoá CÓ mà SAI KIỂU (chuỗi/đối tượng/số) ⇒ **HỎNG** — đó mới là lúc "coi như
  //     rỗng" nghĩa là im lặng vứt đi phần sổ mình không đọc được.
  const chuY = [];
  const doc = (ten) => {
    const v = so[ten];
    if (v === undefined) { chuY.push(`sổ không có khoá \`${ten}\` (định dạng trước M4.4) — coi như rỗng`); return []; }
    if (!Array.isArray(v)) { loi.push(`\`${ten}\` có mặt nhưng KHÔNG phải mảng (${typeof v}) — tệp hỏng`); return null; }
    return v;
  };
  const chains = doc("chains");
  const retired = doc("retired");
  if (loi.length) return { loi, chuY, ra: null };

  const thieuId = [...chains, ...retired].filter((c) => !Number.isSafeInteger(Number(c?.chainId)));
  if (thieuId.length) {
    // Nuốt một bản ghi thiếu chainId là bỏ đúng thứ sổ này tồn tại để giữ.
    loi.push(`${thieuId.length} bản ghi không có chainId đọc được — dừng, đừng nuốt`);
    return { loi, chuY, ra: null };
  }

  const moc = luc ?? new Date().toISOString();
  const daCo = new Set(retired.map(khoaBanGhi));
  const chuyen = chains.map((c) => (daCo.has(khoaBanGhi(c))
    ? null                                   // đã có trong retired ⇒ không nhân đôi
    : { ...c, thuHoiLuc: c.thuHoiLuc ?? moc, lyDo: "re-genesis — mạng của chain này không còn tồn tại" }
  )).filter(Boolean);

  const ra = { ...so, chains: [], retired: [...retired, ...chuyen] };
  return { loi: [], chuY, ra, soChuyen: chuyen.length, soTrung: chains.length - chuyen.length };
}

/** Mọi bản ghi repo đã biết — dùng để hỏi "sổ sống có gì repo CHƯA biết không". */
function repoDaBiet() {
  const ds = [];
  const kho = path.join(GOC, "docs", "archive");
  if (existsSync(kho)) {
    for (const f of readdirSync(kho).sort()) {
      if (/^console-chains.*\.json$/.test(f)) ds.push(path.join(kho, f));
    }
  }
  const cfg = path.join(GOC, "9chain-a1-config", "console-chains.json");
  if (existsSync(cfg)) ds.push(cfg);
  const biet = new Set();
  for (const f of ds) {
    try {
      const d = JSON.parse(readFileSync(f, "utf8"));
      for (const nhom of ["chains", "retired"]) for (const c of d[nhom] ?? []) biet.add(khoaBanGhi(c));
    } catch { /* tệp hỏng: `gen-chainid-issued.mjs` mới là nơi báo, không phải đây */ }
  }
  return { biet, nguon: ds.length };
}

function keo() {
  console.log(`==> kéo sổ SỐNG từ ${HOST}:${SO_SERVER} (chỉ đọc)`);
  let raw;
  try {
    raw = execFileSync("ssh",
      ["-o", "BatchMode=yes", "-o", "ConnectTimeout=20", "-i", KHOA, HOST, `cat ${SO_SERVER}`],
      { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  } catch (e) {
    // 🔴 KHÔNG hỏi được ≠ sổ rỗng. Trả 2 = "không biết".
    console.error(`FATAL không đọc được sổ sống: ${e.message.split("\n")[0]}`);
    console.error("      Đây là 'không biết', KHÔNG phải 'sổ rỗng'. Đừng dồn dựa trên lượt này.");
    return 2;
  }
  let song;
  try { song = JSON.parse(raw); } catch (e) {
    console.error(`FATAL sổ sống không phải JSON hợp lệ: ${e.message}`);
    return 1;
  }
  const banGhi = [...(song.chains ?? []), ...(song.retired ?? [])];
  const { biet, nguon } = repoDaBiet();
  const chuaBiet = banGhi.filter((c) => !biet.has(khoaBanGhi(c)));

  console.log(`  sổ sống : ${(song.chains ?? []).length} sống · ${(song.retired ?? []).length} đã thu hồi`);
  console.log(`  repo biết: ${biet.size} bản ghi (từ ${nguon} sổ)`);

  // 🔴 Sổ sống RỖNG là một trạng thái HỢP LỆ sau một lượt sinh lại — khác hẳn "không đọc
  // được". Nên ở đây KHÔNG áp luật "rỗng ≡ hỏng": áp nó sẽ chặn đúng lượt chạy đúng.
  // Nhưng phải NÓI TO, vì rỗng cũng là triệu chứng của một lượt reset vừa xảy ra.
  if (banGhi.length === 0) {
    console.log("\n🟡 Sổ sống RỖNG (0 bản ghi). Hợp lệ sau một lượt sinh lại — nhưng nếu anh");
    console.log("   ĐANG mong thấy chain trong đó thì một lượt reset vừa xảy ra và 43 bản ghi");
    console.log("   của lần trước đã mất theo đúng kiểu đó (26/08). Đối chiếu docs/archive/.");
    return 0;
  }
  if (chuaBiet.length === 0) {
    console.log("\n✓ mọi bản ghi trong sổ sống đều đã có trong repo — không có gì sắp mất.");
    return 0;
  }
  const ten = `console-chains-song-${new Date().toISOString().slice(0, 10)}.json`;
  const dich = path.join(GOC, "docs", "archive", ten);
  writeFileSync(dich, JSON.stringify(song, null, 2));
  console.log(`\n🔴 ${chuaBiet.length} bản ghi CHƯA có trong repo — đã lưu vào docs/archive/${ten}`);
  for (const c of chuaBiet) console.log(`     ${c.name} #${c.chainId}`);
  console.log("   Chạy `node scripts/gen-chainid-issued.mjs` để nạp chúng vào sổ chặn xuyên thế hệ.");
  return 0;
}

// ═════ ĐỐI CHỨNG NGƯỢC ═════
function tuKiem() {
  const LUC = "2026-09-01T00:00:00.000Z";
  const ca = [
    ["dồn 2 chain sống ⇒ 0 sống / 2 thu hồi, có thuHoiLuc",
      { chains: [{ name: "A", chainId: 9101 }, { name: "B", chainId: 9102 }], retired: [] },
      (r) => r.loi.length === 0 && r.ra.chains.length === 0 && r.ra.retired.length === 2
        && r.ra.retired.every((c) => c.thuHoiLuc === LUC)],
    ["giữ nguyên bản ghi retired có sẵn (không mất, không nhân đôi)",
      { chains: [{ name: "A", chainId: 9101 }], retired: [{ name: "Z", chainId: 9999, thuHoiLuc: "cũ" }] },
      (r) => r.ra.retired.length === 2 && r.ra.retired[0].thuHoiLuc === "cũ"],
    ["chain đã có trong retired ⇒ KHÔNG nhân đôi",
      { chains: [{ name: "A", chainId: 9101 }], retired: [{ name: "A", chainId: 9101 }] },
      (r) => r.ra.retired.length === 1 && r.soTrung === 1],
    ["sổ RỖNG hợp lệ ⇒ ra rỗng, không lỗi",
      { chains: [], retired: [] }, (r) => r.loi.length === 0 && r.ra.retired.length === 0],
    // 🔴 Ba ca dưới phải ĐỎ.
    ["khoá `retired` VẮNG MẶT ⇒ định dạng trước M4.4, hợp lệ, nhưng phải KHAI RA",
      { chains: [{ name: "A", chainId: 9101 }] },
      (r) => r.loi.length === 0 && r.ra.retired.length === 1 && r.chuY.some((c) => /retired/.test(c))],
    ["🔴 `retired` CÓ mà sai KIỂU ⇒ tệp HỎNG (đây mới là lúc 'coi như rỗng' là vứt dữ liệu)",
      { chains: [], retired: "khong-phai-mang" }, (r) => r.loi.length > 0 && r.ra === null],
    ["🔴 `chains` sai KIỂU ⇒ tệp HỎNG",
      { chains: { a: 1 }, retired: [] }, (r) => r.loi.length > 0 && r.ra === null],
    ["🔴 bản ghi thiếu chainId ⇒ dừng, KHÔNG nuốt",
      { chains: [{ name: "A" }], retired: [] }, (r) => r.loi.length > 0 && r.ra === null],
    ["🔴 sổ null ⇒ báo lỗi, không ra sổ rỗng", null, (r) => r.loi.length > 0 && r.ra === null],
  ];
  let hong = 0;
  console.log("══ ĐỐI CHỨNG NGƯỢC — phép DỒN ══");
  for (const [ten, vao, dung] of ca) {
    const r = don(vao, { luc: LUC });
    if (dung(r)) console.log(`  ✓ ${ten}`);
    else { console.log(`  ✗ ${ten} — ra ${JSON.stringify(r).slice(0, 160)}`); hong++; }
  }
  // Tính chất bao trùm: KHÔNG MẤT BẢN GHI NÀO, thử trên nhiều hình dạng.
  console.log("\n══ TÍNH CHẤT: |ra.retired| = |vào.chains ∪ vào.retired| (không mất, không đẻ) ══");
  for (const n of [0, 1, 5, 43]) {
    const vao = {
      chains: Array.from({ length: n }, (_, i) => ({ name: `C${i}`, chainId: 9100 + i })),
      retired: Array.from({ length: n }, (_, i) => ({ name: `R${i}`, chainId: 9500 + i })),
    };
    const r = don(vao, { luc: LUC });
    const ok = r.ra && r.ra.retired.length === n * 2 && r.ra.chains.length === 0;
    if (ok) console.log(`  ✓ n=${n} ⇒ ${n * 2} bản ghi giữ nguyên`);
    else { console.log(`  ✗ n=${n} MẤT bản ghi`); hong++; }
  }
  return hong;
}

if (argv.includes("--self-test")) {
  const hong = tuKiem();
  console.log(`\n${hong ? "✗" : "✅"} ${hong} ca sai`);
  process.exit(hong ? 1 : 0);
}
if (argv.includes("--pull")) process.exit(keo());
if (argv.includes("--compact")) {
  const vao = lay("--compact", null);
  const ra = lay("--out", null);
  if (!vao || !ra) { console.error("Dùng: --compact <vào.json> --out <ra.json>"); process.exit(2); }
  let d;
  try { d = JSON.parse(readFileSync(vao, "utf8")); } catch (e) {
    console.error(`FATAL không đọc được ${vao}: ${e.message}`); process.exit(1);
  }
  const kq = don(d);
  // Chú ý phải in TRƯỚC kết quả: một sổ định dạng cũ vẫn dồn được, nhưng người chạy
  // cần biết mình vừa dồn một tệp thiếu khoá — im lặng ở đây là giấu nửa sự thật.
  for (const c of kq.chuY) console.log(`  ⚠️  ${c}`);
  if (kq.loi.length) { for (const l of kq.loi) console.error(`✗ ${l}`); process.exit(1); }
  writeFileSync(ra, JSON.stringify(kq.ra, null, 2));
  console.log(`✓ dồn xong → ${ra}`);
  console.log(`  chuyển ${kq.soChuyen} chain sang retired${kq.soTrung ? ` · ${kq.soTrung} đã có sẵn, không nhân đôi` : ""}`);
  console.log(`  tổng retired: ${kq.ra.retired.length} · chains: ${kq.ra.chains.length}`);
  console.log("\n⚠️  Tệp này chưa được đưa lên server — đó là việc có người bấm.");
  process.exit(0);
}
console.error("Dùng: --pull | --compact <vào.json> --out <ra.json> | --self-test");
process.exit(2);
