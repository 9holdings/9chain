#!/usr/bin/env node
/**
 * check-evidence.mjs — **cổng canh: gói vật chứng còn TỰ NGHIỆM THU được không.**
 *
 * 🔴 VÌ SAO CÓ — và nó sinh ra từ một lỗi có thật của phiên `2026-08-28`.
 *
 * Quy trình O2 (*"xuất trước khi xoá"*) đóng gói trạng thái chain kèm `MANIFEST.txt`
 * chứa `sha256` **của từng tệp trong gói**. Giá trị của gói **nằm ở chỗ hash khớp**:
 * một gói không tự nghiệm thu được thì không còn là vật chứng, chỉ là mấy tệp cũ.
 *
 * Phiên `28/08` chạy một lượt đổi cờ CLI *"trên mọi tệp văn bản"*. Nó sửa `--tu-kiem`
 * thành `--self-test` **bên trong `00-DOC-TRUOC.md` của gói vật chứng** ⇒ hai gói O2
 * tụt từ **9/9 xuống 7/9**, và **không có gì kêu lên**. Cùng lượt quét đó cũng sửa một
 * dòng trong `patches/0006` làm tree fork trôi khỏi `074aaa93` — cái đó thì
 * `gday-preflight` bắt được ngay, vì luật cứng #3 có cổng. Vật chứng thì **không có**.
 *
 * ⇒ Bài học: **thứ nào phải đóng băng theo BYTE thì phải có cổng canh byte.** Một quy
 * ước *"đừng sửa thư mục đó"* nằm trong đầu người viết script không chặn được gì.
 *
 * ## Cổng này đo ĐẠI LƯỢNG NÀO
 *
 * `sha256` **thực tế trên đĩa** ↔ `sha256` **gói tự khai**. Không đọc git, không so với
 * commit nào — một gói vật chứng phải đứng được **một mình**, kể cả khi tách khỏi repo.
 *
 * ⚠️ Cổng này KHÔNG nói gói mô tả đúng sự thật lúc đó hay không. Nó chỉ nói gói **chưa
 * bị sửa kể từ lúc niêm**. Hai câu hỏi khác nhau; đừng đọc cái này thành cái kia.
 *
 * ## Mã thoát
 *   0  ĐẠT           — mọi gói khớp từng byte
 *   1  SAI           — có tệp lệch hash, hoặc tệp trong manifest đã biến mất
 *   2  CHƯA KẾT LUẬN — không đọc được manifest (⚠️ KHÔNG phải "sạch")
 *
 * Dùng:
 *   node scripts/check-evidence.mjs
 *   node scripts/check-evidence.mjs --self-test
 */
import { readFileSync, readdirSync, statSync, existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SELF_TEST = process.argv.includes("--self-test");
const MANIFEST_NAMES = new Set(["MANIFEST.txt", "SHA256SUMS.txt"]);

const sha256 = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

/** Tìm mọi tệp manifest dưới một gốc. */
export function findManifests(root) {
  const out = [];
  const walk = (d) => {
    let entries;
    try { entries = readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (MANIFEST_NAMES.has(e.name)) out.push(full);
    }
  };
  walk(root);
  return out.sort();
}

/**
 * Đọc một manifest kiểu `sha256sum`. Chấp nhận cả hai khuôn:
 *   `<hash>  <đường dẫn>`   (văn bản)
 *   `<hash> *<đường dẫn>`   (nhị phân — `sha256sum -b`, `SHA256SUMS.txt` dùng khuôn này)
 * Bỏ sót khuôn thứ hai là cổng đọc ra "0 mục" rồi báo XANH — im lặng, và sai.
 */
export function parseManifest(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    const m = /^([0-9a-fA-F]{64})\s+\*?(.+?)\s*$/.exec(line);
    if (m) rows.push({ hash: m[1].toLowerCase(), file: m[2].replace(/\\/g, "/") });
  }
  return rows;
}

/** Nghiệm thu một gói. Trả về {ok, missing, mismatch, total}. */
export function verifyBundle(manifestPath) {
  const dir = path.dirname(manifestPath);
  const rows = parseManifest(readFileSync(manifestPath, "utf8"));
  const missing = [], mismatch = [];
  for (const r of rows) {
    const f = path.join(dir, r.file);
    if (!existsSync(f) || !statSync(f).isFile()) { missing.push(r.file); continue; }
    if (sha256(f) !== r.hash) mismatch.push(r.file);
  }
  return { ok: rows.length - missing.length - mismatch.length, missing, mismatch, total: rows.length };
}

function main() {
  const manifests = findManifests(path.join(ROOT, "docs"));
  if (manifests.length === 0) {
    console.log("⁇ CHƯA KẾT LUẬN — không thấy manifest nào dưới docs/.");
    console.log("   Không tìm thấy KHÁC với không có gì để canh: kiểm lại đường dẫn.");
    return 2;
  }
  console.log(`\n══ VẬT CHỨNG — ${manifests.length} gói ══\n`);
  let bad = 0, unresolved = 0;
  for (const m of manifests) {
    const rel = path.relative(ROOT, m).replace(/\\/g, "/");
    let r;
    try { r = verifyBundle(m); } catch (e) {
      unresolved++; console.log(`  ⁇ ${rel}\n     CHƯA KẾT LUẬN — ${e.message}`); continue;
    }
    if (r.total === 0) {
      unresolved++;
      console.log(`  ⁇ ${rel}\n     CHƯA KẾT LUẬN — manifest KHÔNG có dòng hash nào đọc được`);
      continue;
    }
    const dau = r.missing.length + r.mismatch.length === 0 ? "✓" : "🔴";
    console.log(`  ${dau} ${rel}   ${r.ok}/${r.total} khớp`);
    for (const f of r.mismatch) console.log(`       🔴 LỆCH HASH   ${f}  — tệp đã bị SỬA kể từ lúc niêm`);
    for (const f of r.missing) console.log(`       🔴 MẤT TỆP     ${f}  — manifest khai có, đĩa không có`);
    if (r.missing.length + r.mismatch.length) bad++;
  }
  console.log();
  if (bad) {
    console.log(`🔴 SAI — ${bad}/${manifests.length} gói KHÔNG còn tự nghiệm thu được.`);
    console.log(`   Một gói vật chứng lệch hash thì không còn là vật chứng. ĐỪNG sinh lại manifest`);
    console.log(`   để cho nó xanh — làm thế là xoá đúng thứ tạo ra giá trị. Khôi phục BYTE gốc:`);
    console.log(`     git show <commit-trước-khi-hỏng>:<đường-dẫn> > <tệp>`);
    return 1;
  }
  if (unresolved) { console.log(`⁇ CHƯA KẾT LUẬN — ${unresolved} gói không đọc được.`); return 2; }
  console.log(`✅ ĐẠT — ${manifests.length} gói vật chứng đều khớp từng byte.`);
  return 0;
}

/** Đối chứng ngược: cổng phải ĐỎ khi đáng đỏ, và đỏ VÌ ĐÚNG LÝ DO. */
function selfTest() {
  let pass = 0, fail = 0;
  const ok = (n, c, seen) => (c ? (pass++, console.log(`  ✓ ${n}`)) : (fail++, console.log(`  ✗ ${n} — đo được: ${seen}`)));
  console.log("\n══ ĐỐI CHỨNG NGƯỢC — check-evidence ══\n");

  console.log("── 1. Đọc được CẢ HAI khuôn dòng sha256sum ──");
  const rows = parseManifest("aa" + "0".repeat(62) + "  a.txt\n" + "bb" + "1".repeat(62) + " *b.txt\nrác\n");
  ok("khuôn văn bản (hai khoảng trắng)", rows[0]?.file === "a.txt", JSON.stringify(rows[0]));
  ok("🔴 khuôn nhị phân (dấu *) — bỏ sót là cổng đọc 0 mục rồi báo XANH",
    rows[1]?.file === "b.txt", JSON.stringify(rows[1]));
  ok("dòng rác bị bỏ, không thành mục giả", rows.length === 2, String(rows.length));

  console.log("\n── 2. Gói dựng tay ──");
  const tmp = mkdtempSync(path.join(os.tmpdir(), "a1-evi-"));
  try {
    const d = path.join(tmp, "goi");
    mkdirSync(path.join(d, "con"), { recursive: true });
    writeFileSync(path.join(d, "a.txt"), "noi dung A\n");
    writeFileSync(path.join(d, "con", "b.txt"), "noi dung B\n");
    const h = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
    const man = path.join(d, "MANIFEST.txt");
    writeFileSync(man, `${h(path.join(d, "a.txt"))}  a.txt\n${h(path.join(d, "con", "b.txt"))}  con/b.txt\n`);

    ok("gói nguyên vẹn ⇒ khớp hết", (() => { const r = verifyBundle(man); return r.ok === 2 && !r.mismatch.length && !r.missing.length; })(), "");

    writeFileSync(path.join(d, "a.txt"), "noi dung A da bi sua\n");
    const r2 = verifyBundle(man);
    ok("🔴 SỬA MỘT TỆP ⇒ báo LỆCH HASH (đúng ca đã cháy thật 28/08)",
      r2.mismatch.includes("a.txt") && r2.ok === 1, JSON.stringify(r2));
    ok("🔴 và KHÔNG báo là 'mất tệp' — hai lỗi khác nhau, đừng gộp",
      r2.missing.length === 0, JSON.stringify(r2.missing));

    rmSync(path.join(d, "con", "b.txt"));
    const r3 = verifyBundle(man);
    ok("🔴 XOÁ MỘT TỆP ⇒ báo MẤT TỆP", r3.missing.includes("con/b.txt"), JSON.stringify(r3.missing));

    ok("tìm được manifest trong thư mục con", findManifests(tmp).length === 1, String(findManifests(tmp).length));
  } finally { rmSync(tmp, { recursive: true, force: true }); }

  console.log(`\n${fail === 0 ? "✅" : "🔴"} ${pass} đạt · ${fail} hỏng`);
  return fail === 0 ? 0 : 1;
}

process.exit(SELF_TEST ? selfTest() : main());
