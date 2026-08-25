/**
 * dong-bo-token.mjs — chép hệ token từ 9Scan-A1 sang `web/app/tokens.css`.
 *
 * ═══ VÌ SAO CHÉP CHỨ KHÔNG DÙNG PACKAGE CHUNG ═══
 * 9Chain **đã có** hệ thiết kế đang chạy thật, tự nhận là "nguồn sự thật duy nhất
 * cho màu/chữ/shape", sống trong `9Scan-A1/app/globals.css`. Việc của A1 không phải
 * nghĩ ra một giao diện — là dọn về đúng hệ đã có. Vẽ hệ thứ hai là chủ động tạo ra
 * đúng sự thiếu nhất quán mà mốc M10 sinh ra để xoá.
 *
 * Nhưng KHÔNG gom vào một package nội bộ: hai repo độc lập, deploy độc lập, một
 * package chung kéo theo ràng buộc phiên bản mà lợi ích không bù nổi. Bản chép +
 * **một phép đo trôi lệch** là đủ và trung thực hơn.
 *
 * ═══ HASH LÀ CỦA KHỐI TOKEN, KHÔNG PHẢI CỦA CẢ FILE ═══
 * `globals.css` bên 9Scan còn chứa animation, layer components, luật RTL… — những
 * thứ họ sửa liên tục và A1 không quan tâm. Băm cả file thì phép đo trôi lệch sẽ
 * kêu mỗi lần họ đụng bất cứ gì, tức là kêu tới lúc không ai nghe nữa. Băm đúng hai
 * khối `@theme` + `html[data-theme='dark']` thì nó chỉ kêu khi **màu thật sự đổi**.
 *
 * Chạy:  node web/scripts/dong-bo-token.mjs [--nguon <đường dẫn globals.css>]
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

/** Cắt một khối `<mở> { … }` cân bằng ngoặc, kể cả khi bên trong có ngoặc lồng. */
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
  // Chuẩn hoá xuống dòng trước khi băm: hai repo có `.gitattributes * -text`, nhưng
  // một lượt chép tay qua Windows vẫn có thể đổi CRLF/LF và làm hash lệch ở chỗ
  // KHÔNG có gì đổi về màu — đúng loại báo động giả giết một phép đo.
  return createHash("sha256").update(s.replace(/\r\n/g, "\n")).digest("hex").slice(0, 16);
}

// So bằng `pathToFileURL`, KHÔNG nối chuỗi "file://" + argv[1]: trên Windows
// `import.meta.url` là `file:///C:/…` (BA gạch) nên phép nối tay không bao giờ khớp
// và script im lặng không làm gì — đúng kiểu hỏng không có thông báo nào.
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
   Dựng lại: node web/scripts/dong-bo-token.mjs

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
