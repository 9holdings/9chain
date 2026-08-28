#!/usr/bin/env node
/**
 * check-single-source.mjs — **cổng canh: một hằng số, MỘT nơi khai.**
 *
 * ═══ 🔴 VÌ SAO CÓ ═══
 *
 * Lớp lỗi này đã cháy **ba lần** trong dự án, mỗi lần ở một chỗ khác, cùng một hình dạng:
 * *một giá trị được chép tay ở nhiều nơi, và không cổng nào nối chúng lại.*
 *
 *   D-093  `A1Gen` (Go) ↔ `A1_GEN` (JS) — bump một bên, bên kia im lặng cấp chainId của
 *          thế hệ khác vào ví người dùng, qua một genesis BẤT BIẾN.
 *   D-111  `--network-id=9001` cắm cứng ở 4 tệp compose, khớp với một `genesis.json`
 *          cũng 9001 ⇒ node boot sạch, mọi cổng xanh, mạng dev chạy thế hệ ĐÃ CHẾT.
 *   D-113  Một khái niệm "máy chủ" mang **sáu** tên biến môi trường. Chưa cháy — nhưng
 *          đường cháy đã có tên: **O4** (dời node sang nhà cung cấp thứ hai). Đặt một
 *          biến, vài lệnh trỏ đúng, còn `h6b-backup.sh` **lặng lẽ sao lưu máy cũ**.
 *
 * ⚠️ **Sao lưu sai máy không báo lỗi.** Nó chạy xong, in một dòng xanh, và chỉ sai vào
 * đúng ngày cần dùng tới. Đó là lý do cổng này tồn tại thay vì một dòng quy ước.
 *
 * ## Cổng này đo ĐẠI LƯỢNG NÀO
 *
 * Đếm số tệp **chứa chuỗi hằng**, so với danh sách nơi được phép. Nó **không** đo ngữ
 * nghĩa — một chuỗi nằm trong chú thích giải thích lịch sử vẫn bị đếm. Đó là **chủ ý**:
 * cổng thà bắt người ta khai một ngoại lệ có lý do còn hơn tự đoán ý.
 *
 * ## Mã thoát
 *   0  ĐẠT — mỗi hằng số chỉ nằm ở nơi đã khai
 *   1  SAI — có bản chép ngoài danh sách
 *
 * Dùng:
 *   node scripts/check-single-source.mjs
 *   node scripts/check-single-source.mjs --self-test
 */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SELF_TEST = process.argv.includes("--self-test");

/**
 * Mỗi mục: hằng số + **danh sách trắng có LÝ DO**.
 *
 * 🔴 Thêm một đường dẫn vào `nơiĐược` là một QUYẾT ĐỊNH, không phải cách làm cho cổng
 * xanh. Mỗi mục phải nói THẬT vì sao bản chép đó được phép tồn tại.
 */
export const RANG_BUOC = [
  {
    ten: "đích ssh máy chủ công khai",
    chuoi: "139.99.145.13",
    noiDuoc: [
      { duong: "local-net/lib/server.mjs", ly: "NGUỒN — phía .mjs" },
      { duong: "local-net/deploy/server-env.sh", ly: "NGUỒN — phía bash" },
      { duong: "local-net/deploy/Caddyfile", ly: "thuộc worktree web-home (luật cứng #4); chỉ nằm trong CHÚ THÍCH ví dụ curl/ssh" },
    ],
  },
  {
    ten: "đường dẫn khoá ssh",
    chuoi: ".ssh/9chain-a1",
    noiDuoc: [
      { duong: "local-net/lib/server.mjs", ly: "NGUỒN — phía .mjs" },
      { duong: "local-net/deploy/server-env.sh", ly: "NGUỒN — phía bash" },
      { duong: "local-net/deploy/Caddyfile", ly: "worktree khác; chỉ trong chú thích" },
      
    ],
  },
  {
    ten: "networkID mạng đang chạy",
    chuoi: "999_999_999",
    noiDuoc: [
      { duong: "local-net/lib/chainid.mjs", ly: "NGUỒN phía JS — `A1_ID_GOC`, mọi thứ khác suy ra" },
      { duong: "scripts/check-consistency.mjs", ly: "cổng nối Go↔JS: nó PHẢI biết con số để đối chiếu, đó là việc của nó (D-093)" },
      { duong: "local-net/console/chainid-test.mjs", ly: "🔴 CỐ Ý — bài kiểm phải khai SỐ MONG ĐỢI bằng chữ. Nếu nó import cùng nguồn với thứ đang bị kiểm thì nó không chứng minh gì cả." },
    ],
  },
];

/**
 * Phạm vi: **MÃ THỰC THI**, và chỉ nó.
 *
 * 🔴 Tài liệu CỐ Ý chứa các hằng số này — `README.md` in một lệnh `ssh …@139.99.145.13` là
 * để người ta **dán vào terminal**, và bắt nó viết `$A1_SSH_HOST` sẽ làm runbook vô dụng.
 * Một cổng ép tài liệu giấu đi con số mà người đọc cần là cổng đo sai đại lượng: đại lượng
 * cần canh là *"mã có bản chép thứ hai không"*, không phải *"chuỗi này xuất hiện mấy lần"*.
 *
 * `patches/` và `docs/` còn là **bản ghi** — sửa chúng để cho cổng xanh là viết lại lịch sử.
 * Dùng `--cached --others` để thấy cả tệp MỚI chưa `git add`; nếu không, một nguồn vừa tạo
 * sẽ đọc ra *"không còn chứa chuỗi"* và cổng xanh vì lý do sai.
 */
const MA_THUC_THI = /\.(mjs|js|ts|tsx|sh|yml|yaml|json)$/i;
const cacTep = () =>
  execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: ROOT, encoding: "utf8" })
    .split("\n").filter(Boolean)
    .filter((f) => !f.startsWith("patches/") && !f.startsWith("docs/"))
    .filter((f) => MA_THUC_THI.test(f) || f.endsWith("Caddyfile"))
    .filter((f) => !f.includes("node_modules") && !/(package|pnpm)-lock/.test(f))
    // Loai tru CHINH TEP NAY: noi khai rang buoc tat nhien chua hang so no canh. Khong
    // loai thi cong tu bat minh va khong bao gio xanh duoc — mot cong luon do se bi
    // nguoi ta tat di, va luc do no thanh vo dung dung luc can.
    .filter((f) => f !== "scripts/check-single-source.mjs");

export function quet(rangBuoc, tep) {
  // Hằng số SỐ phải khớp có biên: `999_999_999` là chuỗi con của `9_999_999_999` (trần dải
  // L1) ⇒ khớp chuỗi trần sẽ báo động giả ngay tại `check-chainid.mjs`. Đã dính khi dựng.
  const laSo = /^[\d_]+$/.test(rangBuoc.chuoi);
  const rx = laSo
    ? new RegExp(`(?<![\\d_])${rangBuoc.chuoi}(?![\\d_])`)
    : null;
  const thay = [];
  for (const f of tep) {
    let s;
    try { s = readFileSync(path.join(ROOT, f), "utf8"); } catch { continue; }
    if (rx ? rx.test(s) : s.includes(rangBuoc.chuoi)) thay.push(f);
  }
  const duoc = new Set(rangBuoc.noiDuoc.map((n) => n.duong));
  return { thay, thua: thay.filter((f) => !duoc.has(f)), thieu: [...duoc].filter((d) => !thay.includes(d)) };
}

function main() {
  const tep = cacTep();
  console.log(`\n══ MỘT HẰNG SỐ, MỘT NƠI KHAI — ${tep.length} tệp trong tầm ══\n`);
  let hong = 0;
  for (const rb of RANG_BUOC) {
    const r = quet(rb, tep);
    const dau = r.thua.length === 0 ? "✓" : "🔴";
    console.log(`  ${dau} ${rb.ten}  (\`${rb.chuoi}\`)  — ${r.thay.length} tệp chứa`);
    for (const n of rb.noiDuoc) console.log(`       · ${n.duong}  — ${n.ly}`);
    for (const f of r.thua) { console.log(`       🔴 BẢN CHÉP NGOÀI DANH SÁCH  ${f}`); hong++; }
    // Một mục trong danh sách trắng mà KHÔNG còn chứa chuỗi ⇒ danh sách đã lạc hậu. Nhắc,
    // không chặn: nó là rác trong tài liệu, không phải một lỗ đang chảy.
    for (const d of r.thieu) console.log(`       ℹ️  khai thừa (không còn chứa chuỗi): ${d}`);
  }
  console.log();
  if (hong) {
    console.log(`🔴 SAI — ${hong} bản chép ngoài danh sách.`);
    console.log(`   Nạp từ nguồn (\`local-net/lib/server.mjs\` hoặc \`deploy/server-env.sh\`),`);
    console.log(`   hoặc khai một ngoại lệ KÈM LÝ DO trong RANG_BUOC. Khai bừa là tự bịt mắt mình.`);
    return 1;
  }
  console.log(`✅ ĐẠT — ${RANG_BUOC.length} hằng số, mỗi cái chỉ nằm ở nơi đã khai.`);
  return 0;
}

function selfTest() {
  let pass = 0, fail = 0;
  const ok = (n, c, seen) => (c ? (pass++, console.log(`  ✓ ${n}`)) : (fail++, console.log(`  ✗ ${n} — ${seen}`)));
  console.log("\n══ ĐỐI CHỨNG NGƯỢC — check-single-source ══\n");

  const rb = { ten: "thử", chuoi: "CHUOI_THU_NGHIEM_XYZ", noiDuoc: [{ duong: "a.mjs", ly: "nguồn" }] };
  const gia = new Map([
    ["a.mjs", "export const X = 'CHUOI_THU_NGHIEM_XYZ';"],
    ["b.mjs", "const X = 'CHUOI_THU_NGHIEM_XYZ';"],
    ["c.mjs", "khong co gi"],
  ]);
  const quetGia = (rb) => {
    const thay = [...gia].filter(([, v]) => v.includes(rb.chuoi)).map(([k]) => k);
    const duoc = new Set(rb.noiDuoc.map((n) => n.duong));
    return { thay, thua: thay.filter((f) => !duoc.has(f)), thieu: [...duoc].filter((d) => !thay.includes(d)) };
  };
  const r = quetGia(rb);
  ok("🔴 bản chép thứ hai bị bắt", r.thua.length === 1 && r.thua[0] === "b.mjs", JSON.stringify(r.thua));
  ok("nguồn hợp lệ KHÔNG bị báo", !r.thua.includes("a.mjs"), JSON.stringify(r.thua));
  ok("tệp không chứa chuỗi thì không dính", !r.thay.includes("c.mjs"), JSON.stringify(r.thay));

  const rb2 = { ...rb, noiDuoc: [...rb.noiDuoc, { duong: "khong-ton-tai.mjs", ly: "x" }] };
  ok("🔴 danh sách trắng lạc hậu được NHẮC (không chặn)",
    quetGia(rb2).thieu.includes("khong-ton-tai.mjs"), JSON.stringify(quetGia(rb2).thieu));

  // Ca thật, và là ca đắt nhất: nếu ai đó chép lại IP vào một script sao lưu.
  const tep = cacTep();
  const ipRb = RANG_BUOC.find((x) => x.chuoi === "139.99.145.13");
  ok("hằng số THẬT: IP máy chủ hiện không có bản chép nào ngoài danh sách",
    quet(ipRb, tep).thua.length === 0, JSON.stringify(quet(ipRb, tep).thua));
  ok("🔴 và nó VẪN nằm ở đúng cả hai nguồn (cổng không xanh vì chuỗi biến mất)",
    quet(ipRb, tep).thay.includes("local-net/lib/server.mjs") &&
    quet(ipRb, tep).thay.includes("local-net/deploy/server-env.sh"),
    JSON.stringify(quet(ipRb, tep).thay));

  console.log(`\n${fail === 0 ? "✅" : "🔴"} ${pass} đạt · ${fail} hỏng`);
  return fail === 0 ? 0 : 1;
}

process.exit(SELF_TEST ? selfTest() : main());
