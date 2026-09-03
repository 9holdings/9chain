/**
 * sync-tokens.mjs — copy the token system from 9Scan-A1 into `web/app/tokens.css`.
 *
 * ═══ WHY COPY RATHER THAN SHARE A PACKAGE ═══
 * 9Chain **already has** a design system running in production, which describes itself as "the
 * single source of truth for colour/type/shape", living in `9Scan-A1/app/globals.css`. A1's job
 * is not to invent an interface — it is to move onto the system that already exists. Drawing a
 * second system would actively create the very inconsistency milestone M10 exists to remove.
 *
 * But NOT gathered into an internal package: two independent repos, deployed independently, and a
 * shared package drags in version coupling the benefit cannot repay. A copy plus **one drift
 * measurement** is sufficient and more honest.
 *
 * ═══ THE HASH COVERS THE TOKEN BLOCKS, NOT THE WHOLE FILE ═══
 * 9Scan's `globals.css` also contains animations, a components layer, RTL rules… — things they
 * change constantly and A1 does not care about. Hashing the whole file would make the drift
 * measurement fire every time they touch anything, i.e. fire until nobody listens any more.
 * Hashing exactly the `@theme` + `html[data-theme='dark']` blocks makes it fire only when the
 * **colours actually change**.
 *
 * Run:  node web/scripts/sync-tokens.mjs [--nguon <path to globals.css>]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const NAY = fileURLToPath(import.meta.url);

const args = process.argv.slice(2);
const i = args.indexOf("--nguon");
const NGUON = i >= 0 && args[i + 1]
  ? args[i + 1]
  : path.resolve("C:/PROJECTS/9Scan-A1/app/globals.css");

/** Cut a brace-balanced `<opener> { … }` block, including nested braces. */
export function catKhoi(css, moDau) {
  const batDau = css.indexOf(moDau);
  if (batDau < 0) throw new Error(`không tìm thấy khối "${moDau}" trong nguồn`);
  let sau = css.indexOf("{", batDau);
  if (sau < 0) throw new Error(`khối "${moDau}" không có dấu {`);
  let sau_ = sau, do_ = 0;
  for (; sau_ < css.length; sau_++) {
    if (css[sau_] === "{") do_++;
    else if (css[sau_] === "}") { do_--; if (do_ === 0) break; }
  }
  if (do_ !== 0) throw new Error(`khối "${moDau}" không đóng ngoặc`);
  return css.slice(batDau, sau_ + 1);
}

export function bam(s) {
  // Normalise line endings before hashing: both repos have `.gitattributes * -text`, but a
  // manual copy through Windows can still flip CRLF/LF and shift the hash where NOTHING about
  // the colours changed — exactly the kind of false alarm that kills a measurement.
  return createHash("sha256").update(s.replace(/\r\n/g, "\n")).digest("hex").slice(0, 16);
}

// Compare using `pathToFileURL`, NOT by concatenating "file://" + argv[1]: on Windows
// `import.meta.url` is `file:///C:/…` (THREE slashes), so a hand-built string never matches
// and the script silently does nothing — precisely the kind of failure that reports nothing.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const css = readFileSync(NGUON, "utf8");
  const theme = catKhoi(css, "@theme");
  const root = catKhoi(css, ":root {");
  const dark = catKhoi(css, "html[data-theme='dark'] {");
  const shadowFix = catKhoi(css, "html[data-theme='dark'] .shadow-card");
  const van = bam(theme + dark);

  const ra = `/* ═══════════════════════════════════════════════════════════════════════
   tokens.css — CHÉP TỪ 9Scan-A1, ĐỪNG SỬA TAY.

   Nguồn : 9Scan-A1/app/globals.css  (khối @theme + html[data-theme='dark'])
   Vân tay: ${van}
   Dựng lại: node web/scripts/sync-tokens.mjs

   Sửa màu ở đây là làm hai bề mặt của cùng một sản phẩm lệch nhau — đúng thứ
   mốc M10 sinh ra để xoá. Muốn đổi màu thì đổi ở 9Scan rồi chạy lại script này.
   \`web/test/token.test.ts\` so vân tay này với bản 9Scan để bắt trôi lệch.
   ═══════════════════════════════════════════════════════════════════════ */

${theme}

/* Hằng số bố cục (không phải utility — dùng qua var()). */
${root}

/* ─────────────────────────────────────────────────────────────────────────
   Bản TỐI — chỉ ghi đè BỘ BIẾN, không đụng một class nào.

   🔴 KHỐI NÀY PHẢI NẰM NGOÀI MỌI @layer. \`@theme\` của Tailwind phát biến ra
   \`:root\` bên trong \`@layer theme\`; CSS không-layer luôn thắng CSS có layer,
   bất kể thứ tự. Bọc nó vào \`@layer base\` là bản tối im lặng mất tác dụng.

   Và chỉ áp khi \`<html data-theme="dark">\` — KHÔNG dùng
   \`@media (prefers-color-scheme: dark)\` trần. Sở thích hệ thống được đọc bằng
   JS rồi quy về cùng một thuộc tính, nên chỉ có MỘT đường vào bản tối thay vì
   hai đường phải giữ cho khớp nhau. Lệch cơ chế với 9Scan là hai trang đá nhau
   khi người dùng đổi cài đặt.
   ───────────────────────────────────────────────────────────────────────── */
${dark}

/* 🔴 Tailwind v4 KHÔNG biên dịch \`shadow-card\` thành \`box-shadow: var(--shadow-card)\`
   — nó NỘI SUY giá trị ngay lúc build. Nên ghi đè \`--shadow-card\` ở khối trên là
   ghi đè một biến mà utility không hề đọc, và ở bản tối mọi thẻ thực chất không có
   mép nào. Khối này phải nằm NGOÀI mọi @layer để thắng \`@layer utilities\`. */
${shadowFix}
`;

  const dich = path.resolve(path.dirname(NAY), "..", "app", "tokens.css");
  writeFileSync(dich, ra);
  console.log(`✓ ${path.relative(process.cwd(), dich)} — vân tay ${van}`);
  console.log(`  @theme ${theme.split("\n").length} dòng · dark ${dark.split("\n").length} dòng`);
}
