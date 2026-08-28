#!/usr/bin/env node
/**
 * gday-preflight.mjs — **runbook ngày G, ở dạng chạy được.**
 *
 * ═══ VÌ SAO CÓ ═══
 *
 * Tới `2026-08-28`, runbook ngày G nằm rải ở **năm tệp tài liệu** (`GDAY-A1-REMAINING.md`,
 * `PLAN-REGENESIS-2026-09-01.md`, `GDAY-ENGRAVING.md`, `QUY-TRINH-O2-…`, `HANDOFF.md`) và
 * **không có gì chạy được**. Một quy trình chỉ tồn tại dưới dạng văn bản là một quy trình
 * được thi hành bằng trí nhớ, vào đúng ngày người ta bận nhất và ít ngủ nhất.
 *
 * Ngày G là **cơ hội một lần**: genesis bất biến, và sàn trượt cứng là `2026-09-06` (sau đó
 * Block Adam `2026-09-09T06:09:09Z` trôi qua trước khi chain kịp sống).
 *
 * ═══ 🔴 LUẬT QUAN TRỌNG NHẤT CỦA TỆP NÀY ═══
 *
 * **Mục nào chưa tự động hoá được thì in ra là VIỆC TAY — tuyệt đối không giả vờ xanh.**
 * Một preflight in "✅ tất cả đạt" trong khi ba việc quyết định nhất chưa ai làm thì nó
 * không phải cổng, nó là **giấy chứng nhận giả**. Nhóm VIỆC TAY dưới đây luôn hiện, luôn
 * là ô trống, và **không bao giờ** được tính vào "đạt".
 *
 * ═══ MÃ THOÁT ═══
 *   0  mọi cổng BẮT BUỘC đều xanh   (VIỆC TAY vẫn còn đó — đọc chúng)
 *   1  có cổng bắt buộc ĐỎ
 *   2  có cổng **không chạy được** — *không biết* KHÔNG phải *đạt*
 *
 * Dùng:
 *   node scripts/gday-preflight.mjs
 *   node scripts/gday-preflight.mjs --no-network    # bỏ mọi cổng cần mạng/ssh
 */
import { spawnSync, execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const KHONG_MANG = argv.includes("--no-network");

// Tree của cây fork hiện tại — luật cứng #3. Đổi số này là một quyết định, không phải
// một lần cập nhật: nó chỉ đổi cùng lượt sinh lại CẢ BỘ patch.
const TREE_FORK = "f2b9486b71ad53b584a86f77d6017c34d74e6fa6";
const SO_PATCH = 25;
// 🔴 Đối chứng ngược của cây này: áp **24/25** phải ra `074aaa93` — ĐÚNG cái cây mà
// image đang chạy dựng lên trên. Patch 0025 chỉ đổi tên công cụ `kiem-khoa`→`check-keys`
// và sửa một chú thích dẫn cờ đã bỏ; nó KHÔNG đụng node. (2026-08-28)
const TREE_TRUOC_0025 = "074aaa9327be70103b25d5a3873d41cacd431652";

const node = (...a) => ({ lenh: process.execPath, args: a });

/**
 * Cổng. `mang` = cần mạng hoặc ssh (bỏ được bằng `--no-network`).
 *
 * 🔴 **MỌI CỔNG Ở ĐÂY ĐỀU BẮT BUỘC — đỏ là chặn.** Không có hạng "thông tin".
 * (Chú thích cũ khai một cờ `batBuoc` cho phép đỏ-mà-không-chặn; cờ đó **chưa từng
 * được cài**, phát hiện `28/08` — tài liệu mô tả một hành vi không tồn tại là đúng
 * lớp lỗi netgen đã dính ở D-083. Đã bỏ lời hứa đó thay vì cài nó: một cổng "đỏ
 * nhưng không sao" sẽ bị bỏ qua **đúng lúc nó kêu thật** — cùng lý lẽ D-070 dùng khi
 * hạ ô Block Adam xuống "lưu ý".)
 * ⇒ Cổng nào chưa đủ tư cách chặn ngày G thì để **ngoài tệp này** và ghi vào
 * `CLAUDE.md` §3 — ví dụ `check-robots.mjs` (B-10: mặt web, không chạm genesis).
 */
const CONG = [
  // ── 1. Cây fork: thứ mọi thứ khác dựng lên trên ──
  { nhom: "1 · CÂY FORK", ten: `tái lập ${SO_PATCH} patch → tree ${TREE_FORK.slice(0, 8)}`, rieng: taiLapFork },

  // ── 2. Cổng repo — rẻ, không mạng, chạy trước để hỏng sớm ──
  { nhom: "2 · CỔNG REPO", ten: "số học tokenomics + bộ định danh Go↔JS", ...node("scripts/check-consistency.mjs", "--self-test") },
  { nhom: "2 · CỔNG REPO", ten: "phép cấp chainId (chainid-test)", ...node("local-net/console/chainid-test.mjs") },
  { nhom: "2 · CỔNG REPO", ten: "cb58 self-test", ...node("local-net/lib/cb58.mjs", "--self-test") },
  { nhom: "2 · CỔNG REPO", ten: "sổ chainId đã cấp khớp nguồn", ...node("scripts/gen-chainid-issued.mjs", "--check") },
  { nhom: "2 · CỔNG REPO", ten: "cổng THẾ HỆ của console (generation-test)", ...node("local-net/console/generation-test.mjs") },
  { nhom: "2 · CỔNG REPO", ten: "phân loại tệp thừa (đối chứng)", ...node("scripts/check-deploy-drift.mjs", "--self-test") },
  { nhom: "2 · CỔNG REPO", ten: "phép dồn sổ danh bạ (đối chứng)", ...node("scripts/close-ledger-before-regenesis.mjs", "--self-test") },
  { nhom: "2 · CỔNG REPO", ten: "chấm điểm canh mạng (đối chứng)", ...node("scripts/watch-network.mjs", "--self-test") },
  // Vật chứng O2 phải TỰ nghiệm thu được. Đặt ở đây vì O2 là **việc tay của chính ngày
  // G** — phát hiện gói đã hỏng lúc đang chạy runbook thì đã muộn. (28/08)
  { nhom: "2 · CỔNG REPO", ten: "gói vật chứng khớp từng byte", ...node("scripts/check-evidence.mjs") },
  { nhom: "2 · CỔNG REPO", ten: "cổng vật chứng biết báo đỏ (đối chứng)", ...node("scripts/check-evidence.mjs", "--self-test") },

  // ── 3. Thế giới thật — mạng đang chạy và server ──
  { nhom: "3 · THẾ GIỚI THẬT", mang: true, ten: "mạng đang chạy (watch-network)", ...node("scripts/watch-network.mjs") },
  { nhom: "3 · THẾ GIỚI THẬT", mang: true, ten: "khoảng cách repo ↔ server + tệp mồ côi", ...node("scripts/check-deploy-drift.mjs") },
  // Đo TIỀN THẬT trên chain nên nó thuộc nhóm 3, không phải cổng repo: bản `--offline`
  // chỉ trả lời được nửa câu hỏi và mã thoát của nó là 2 (CHƯA KẾT LUẬN) — đúng bản chất,
  // nhưng một cổng ngày G mà "chưa kết luận" thì không dùng được. Chặn bẫy "xoá mấy thư
  // mục chết đi" ngay trước lượt dọn dẹp.
  { nhom: "3 · THẾ GIỚI THẬT", mang: true, ten: "thư mục net* — thế hệ + TIỀN THẬT", ...node("scripts/check-net-dirs.mjs") },
  {
    nhom: "3 · THẾ GIỚI THẬT", mang: true,
    ten: "G4 · tra sổ chainId công khai (PHẢI tra lại ngay trước genesis)",
    ...node("scripts/check-chainid.mjs"),
  },
];

/**
 * 🔴 VIỆC TAY — không tự động hoá được, và **không bao giờ được tính là đạt**.
 * Thứ tự ở đây LÀ thứ tự thi hành; vài mục chỉ đúng khi làm trước `down -v`.
 */
const VIEC_TAY = [
  ["TRƯỚC khi đụng gì", "🔴 **B-16** — bản sao thứ hai bộ khoá quỹ: `node scripts/o1-check.mjs <thư-mục>` phải ra **exit 0**. Chặn GO/NO-GO."],
  ["TRƯỚC khi đụng gì", "🔴 **B-17** — xoá 6 tệp `.bak` trên server (đường lui trỏ vào quyết định đã đóng). Lệnh ở `BLOCKERS.md`."],
  ["TRƯỚC `down -v`", "🔴 **O2** — `node scripts/export-chain.mjs` rồi **công bố `sha256` RA CHỖ NGOÀI** trước khi xoá. Thứ tự đó LÀ toàn bộ giá trị của quy trình (lượt `26/08` đã bỏ lỡ)."],
  ["TRƯỚC `down -v`", "🔴 **Sổ danh bạ** — `node scripts/close-ledger-before-regenesis.mjs --pull` rồi `--compact`; sổ mới phải lên server. Reset sổ = trả 43 tên + chainId lại cho vòng quay."],
  ["TRƯỚC `down -v`", "🔴 **H-6b** — `bash scripts/h6b-backup.sh` và đọc kỹ số patch nó khai."],
  ["Lúc sinh mạng", "🔴 **Bump `A1Gen` ở CẢ HAI ngôn ngữ** — `utils/constants/network_ids.go` **và** `local-net/lib/chainid.mjs`, rồi chạy lại `check-consistency`. Quên một bên thì không có gì báo lỗi (D-093)."],
  ["Lúc sinh mạng", "🔴 **Build lại image node** — image đang chạy là **18 patch**, repo là **25**. Patch 0019/0022 (bí danh `LOVE9`) chưa vào image; thiếu nó là **mọi ví X/C chết câm**. Đường build đã diễn tập `28/08` và ĐẠT (D-105) — nhưng ở `A1Gen 0`; bump lên 1 là đổi binary ⇒ **vẫn phải build lại**."],
  ["Lúc sinh mạng", "🔴 **SỬA DÒNG `image:` TRONG COMPOSE NETGEN VỪA SINH** — netgen ghi cắm cứng `9chain-a1/node:dev` và **không biến nào đổi được** (D-105). Quên là mạng lên bằng binary **18 patch** trong khi mọi cổng vẫn xanh: `grep image: <net>/docker-compose.multinode.yml` phải ra **tag vừa build**."],
  ["Lúc sinh mạng", "🔴 **Đo BINARY, đừng đo mạng:** `docker exec <node> ./avalanchego --version` phải in đúng `commit=` của lượt build ngày G, và `avm.getAssetDescription` alias `LOVE9` phải ra tài sản còn `AVAX` phải **ĐỎ có lý do**. Mạng xanh không nói gì về việc node đang chạy binary nào."],
  ["Lúc sinh mạng", "🔴 **Sinh token + khoá MỚI** — `A1_CONSOLE_TOKEN`, `FAUCET_PK`, `A1_CLI_KEY`. Token cũ **chưa từng đổi qua hai lượt re-genesis** (gotcha 15)."],
  ["Lúc sinh mạng", "🔴 **Chữ khắc** — cơ chế xong 100%. Nội dung là **ĐẦU VÀO David cấp** (D-104: C1 do David điều phối riêng, A1 không theo dõi). ⚠️ Byte tới **sau** bước sinh genesis là **không khắc được nữa trong thế hệ đó** — hỏi David chốt byte TRƯỚC khi chạy netgen, không phải sau."],
  ["SAU khi mạng lên", "🔴 Đo **trên node đang chạy**: `supplyCap` · `networkID` · HRP · `eth_chainId` · 9/9 node. `node scripts/watch-network.mjs`."],
  ["SAU khi mạng lên", "🔴 **B-13(b)** — đo lệch đồng hồ 9 node rồi chọn `--offset-ms` cho Block Adam. Chỉ làm được sau khi mạng g1 lên, và **phải xong trước `09/09`**."],
  ["SAU khi deploy", "🔴 `node scripts/check-deploy-drift.mjs` — **chạy TRƯỚC khi tin bất kỳ dòng \"ĐÃ ĐÓNG\" nào**."],
];

/** Tái lập cây fork trong worktree tách rời rồi so tree. Dọn dẹp trong `finally`. */
function taiLapFork() {
  const fork = path.join(GOC, "upstream", "avalanchego");
  if (!existsSync(fork)) return { ma: 2, vi: "không thấy cây fork" };
  const w = path.join(tmpdir(), `a1-preflight-${process.pid}`);
  const git = (args, cwd) => execFileSync("git", args, { cwd, encoding: "utf8", timeout: 120_000 });
  try {
    try { rmSync(w, { recursive: true, force: true }); } catch { /* chưa có */ }
    git(["worktree", "add", "--detach", w, "1cf1fc3"], fork);
    const patches = execFileSync(process.execPath,
      ["-e", `const fs=require('fs');process.stdout.write(fs.readdirSync(${JSON.stringify(path.join(GOC, "patches"))}).filter(f=>f.endsWith('.patch')).sort().join('\\n'))`],
      { encoding: "utf8" }).split("\n").filter(Boolean);
    if (patches.length !== SO_PATCH) {
      return { ma: 1, vi: `thấy ${patches.length} patch, luật cứng khai ${SO_PATCH} — sinh lại CẢ BỘ hay sửa luật, đừng thêm lẻ` };
    }
    // ── Đối chứng ngược, CHẠY TRƯỚC: áp N−1 patch phải ra ĐÚNG tree đã biết ──
    //
    // 🔴 Vì sao nó phải là MÃ, không phải một dòng nghi thức trong tài liệu. Cổng "áp đủ
    // bộ rồi so tree" chỉ chứng minh **bộ patch tự nhất quán với hằng số ta vừa chép vào
    // đây**. Ai sinh lại cả bộ rồi dán tree mới vào `TREE_FORK` cũng làm nó xanh — kể cả
    // khi nội dung đã trôi. Đối chứng N−1 neo vào một tree **có gốc độc lập**: `074aaa93`
    // là cây mà **image đang chạy** dựng lên trên. Hai đầu neo mới nói được điều gì đó.
    // (Luật cứng #2: cổng chưa từng đỏ vì đúng lý do thì chưa phải cổng.)
    git(["am", "--keep-cr", ...patches.slice(0, SO_PATCH - 1).map((f) => path.join(GOC, "patches", f))], w);
    const treeTruoc = git(["rev-parse", "HEAD^{tree}"], w).trim();
    if (treeTruoc !== TREE_TRUOC_0025) {
      return {
        ma: 1,
        vi: `đối chứng ${SO_PATCH - 1}/${SO_PATCH}: tree ${treeTruoc.slice(0, 12)} ≠ ${TREE_TRUOC_0025.slice(0, 12)} — bộ patch đã trôi Ở GIỮA`,
      };
    }
    git(["am", "--keep-cr", path.join(GOC, "patches", patches[SO_PATCH - 1])], w);
    const tree = git(["rev-parse", "HEAD^{tree}"], w).trim();
    if (tree !== TREE_FORK) {
      return { ma: 1, vi: `tree ${tree.slice(0, 12)} ≠ ${TREE_FORK.slice(0, 12)} — cây fork ĐÃ TRÔI` };
    }
    return { ma: 0, vi: `${SO_PATCH} patch → tree khớp · đối chứng ${SO_PATCH - 1}/${SO_PATCH} → ${TREE_TRUOC_0025.slice(0, 8)} ✓` };
  } catch (e) {
    return { ma: 2, vi: `không tái lập được: ${String(e.message).split("\n")[0].slice(0, 120)}` };
  } finally {
    try { git(["worktree", "remove", "--force", w], fork); } catch { /* đã đi */ }
    try { rmSync(w, { recursive: true, force: true }); } catch { /* kệ */ }
  }
}

function chay(c) {
  if (c.rieng) return c.rieng();
  const r = spawnSync(c.lenh, c.args, { cwd: GOC, encoding: "utf8", timeout: 240_000 });
  if (r.error || r.status === null) return { ma: 2, vi: `không chạy được: ${r.error?.message || "hết giờ"}` };
  const ra = `${r.stdout || ""}`.trim().split("\n").filter(Boolean);
  return { ma: r.status === 0 ? 0 : r.status === 2 ? 2 : 1, vi: ra[ra.length - 1]?.slice(0, 96) ?? "" };
}

console.log(`\n╔═══ PREFLIGHT NGÀY G ═══ ${new Date().toISOString()}`);
console.log(`║ cây fork: ${SO_PATCH} patch · tree ${TREE_FORK.slice(0, 8)}`);
if (KHONG_MANG) console.log("║ ⚠️  --no-network: bỏ cổng cần mạng/ssh — CHÚNG KHÔNG PHẢI 'ĐẠT'");
console.log("╚" + "═".repeat(60));

let nhomHienTai = "";
let do_ = 0, khongChay = 0, dat = 0, boQua = 0;
for (const c of CONG) {
  if (c.nhom !== nhomHienTai) { nhomHienTai = c.nhom; console.log(`\n── ${nhomHienTai} ──`); }
  if (c.mang && KHONG_MANG) { boQua++; console.log(`  ⏭️  ${c.ten}  — BỎ QUA (không phải "đạt")`); continue; }
  const { ma, vi } = chay(c);
  if (ma === 0) { dat++; console.log(`  ✓ ${c.ten}`); }
  else if (ma === 2) { khongChay++; console.log(`  🟡 ${c.ten}\n       KHÔNG CHẠY ĐƯỢC — ${vi}`); }
  else { do_++; console.log(`  🔴 ${c.ten}\n       ${vi}`); }
}

console.log(`\n── 4 · 🔴 VIỆC TAY — KHÔNG tự động hoá được, KHÔNG bao giờ tính là "đạt" ──`);
let giaiDoan = "";
for (const [gd, viec] of VIEC_TAY) {
  if (gd !== giaiDoan) { giaiDoan = gd; console.log(`\n  【${giaiDoan}】`); }
  console.log(`   ☐ ${viec}`);
}

console.log(`\n${"═".repeat(62)}`);
console.log(`  ${dat} đạt · ${do_} đỏ · ${khongChay} không chạy được · ${boQua} bỏ qua · ${VIEC_TAY.length} việc tay`);
const ma = do_ ? 1 : khongChay ? 2 : 0;
// 🔴 Một câu "mọi cổng xanh" in ra sau khi BỎ QUA ba cổng là một câu nói dối gọn gàng.
// Số bỏ qua phải nằm trong chính câu phán, không nằm ở một dòng phía trên mà mắt đã lướt qua.
const xanh = boQua
  ? `\n🟡 ${dat} cổng đã chạy đều xanh — NHƯNG ${boQua} cổng BỊ BỎ QUA (--no-network).\n   Ba cổng đó đo THẾ GIỚI THẬT; bỏ chúng đi thì lượt này không nói được gì về\n   mạng đang chạy hay về server. Chạy lại KHÔNG có --no-network trước ngày G.`
  : `\n✅ MỌI CỔNG TỰ ĐỘNG ĐỀU XANH.`;
console.log({
  0: `${xanh}\n   🔴 Và ${VIEC_TAY.length} VIỆC TAY ở trên CHƯA ai làm thay được — preflight xanh\n   KHÔNG có nghĩa là sẵn sàng sinh mạng.`,
  1: `\n🔴 CÓ CỔNG ĐỎ — dừng. Đừng sinh genesis khi còn một dòng đỏ.`,
  2: `\n🟡 CÓ CỔNG KHÔNG CHẠY ĐƯỢC — "không biết" KHÔNG phải "đạt". Sửa rồi chạy lại.`,
}[ma]);
process.exit(ma);
