#!/usr/bin/env node
/**
 * check-robots.mjs — B-10: `robots.txt` của A1 có tới được người đọc không?
 *
 * ═══ 🔴 BẢN ĐẦU CỦA CHÍNH TỆP NÀY ĐÃ SAI, VÀ SAI Ở ĐÚNG CHỖ NÓ ĐỊNH CANH ═══
 *
 * Bản `28/08` đầu tiên chấm: *"nội dung mang dấu Cloudflare ⇒ ĐỎ"*. Nó đỏ thật, và
 * kết luận sai. Đo lại đầy đủ 5.367 byte thì Cloudflare **CHÈN THÊM VÀO ĐẦU**, không
 * **THAY** — tệp của A1 còn nguyên bên dưới, đủ `Allow: /`, 7 dòng `Disallow:` và
 * `Sitemap:`.
 *
 * Cay hơn nữa: **chính `web/public/robots.txt` đã viết sẵn luật đúng trong chú thích
 * của nó** — *"đo NỘI DUNG mà không phụ thuộc VỊ TRÍ … `grep -q 'Sitemap: …'`. Đây là
 * mặt trái của xanh giả: **đỏ giả** cũng phá đúng thứ đó, chỉ chậm hơn."* Cổng bản đầu
 * đọc 3 dòng đầu rồi phán, tức nó **đo VỊ TRÍ trong khi tưởng mình đo NỘI DUNG**.
 *
 * ⇒ Luật của tệp này: **chỉ một câu hỏi quyết định xanh/đỏ** — *chuỗi chỉ có thể tới
 * từ tệp của A1 có xuất hiện không?* Mọi thứ khác là **ghi chú**, không phải điểm.
 *
 * ═══ THANG ĐO (`CLAUDE.md` §1) ═══
 *   mã HTTP · content-type      → in ra, KHÔNG chấm (cả hai xanh trong ca hỏng thật)
 *   NỘI DUNG                    → CHẤM Ở ĐÂY
 *   `cf-cache-status`           → ghi chú: nói VÌ SAO, không nói ĐÚNG/SAI
 *
 * ═══ MÃ THOÁT ═══   0 ĐẠT · 1 SAI (tệp A1 không tới nơi) · 2 CHƯA KẾT LUẬN
 * 🔴 `2` KHÔNG phải `0`. Không đo được là *không biết*.
 *
 * Dùng:
 *   node scripts/check-robots.mjs
 *   node scripts/check-robots.mjs --self-test
 */

const TEN_MIEN = process.env.A1_TEN_MIEN || "a1.9chain.org";
const HET_GIO = 15000;

/**
 * 🔴 DẤU DUY NHẤT ĐƯỢC DÙNG ĐỂ CHẤM. Chuỗi này chỉ có thể tới từ `web/public/robots.txt`
 * — Cloudflare không sinh ra dòng `Sitemap:` trỏ vào tên miền của ta. Nó xanh khi tệp có
 * hiệu lực, và đỏ THẬT nếu route `/robots.txt` biến mất khỏi Caddyfile.
 * Đừng thêm dấu thứ hai kiểu `"user-agent:"` — Cloudflare cũng in chuỗi đó, và một dấu
 * mà cả hai bên đều sinh ra được thì không phân biệt được gì.
 */
const DAU_A1 = `Sitemap: https://${TEN_MIEN}/sitemap.xml`;

/** Dấu vân tay khối Cloudflare chèn thêm — chỉ để GHI CHÚ, không để chấm. */
const DAU_CLOUDFLARE = "BEGIN Cloudflare Managed content";
const DAU_CHINH_SACH = "as a condition of accessing this website";

async function lay(duong) {
  try {
    const r = await fetch(`https://${TEN_MIEN}${duong}`, {
      signal: AbortSignal.timeout(HET_GIO),
      redirect: "follow",
    });
    return {
      ok: true,
      ma: r.status,
      kieu: r.headers.get("content-type") || "",
      cache: (r.headers.get("cf-cache-status") || "").toUpperCase(),
      tuoi: r.headers.get("age") || "",
      dieuKhien: r.headers.get("cache-control") || "",
      than: await r.text(),
    };
  } catch (e) {
    return { ok: false, loi: String(e?.message || e) };
  }
}

/** Chấm điểm — TÁCH THUẦN khỏi mạng để `--self-test` chạy trên dữ liệu tổng hợp (D-100). */
export function cham(robots, sitemap) {
  const luuY = [];
  if (!robots?.ok) return { ma: 2, loi: [`không lấy được /robots.txt: ${robots?.loi}`], luuY };

  const than = robots.than || "";
  const thap = than.toLowerCase();

  const coDauA1 = than.includes(DAU_A1);
  const coKhoiCF = thap.includes(DAU_CLOUDFLARE.toLowerCase()) || thap.includes(DAU_CHINH_SACH);

  // ── Đối chứng dương: đường qua Cloudflare tới origin có còn thông không ──
  // Thiếu vế này thì một origin chết cũng cho ra cùng triệu chứng, và ta đi sửa nhầm
  // chỗ (bài học D-096: hai tên miền hỏng/sống khác nhau ⇒ lỗi không ở server).
  if (!sitemap?.ok) luuY.push(`không đo được /sitemap.xml (${sitemap?.loi}) — thiếu đối chứng dương.`);
  else if (sitemap.cache === "DYNAMIC") luuY.push("đối chứng dương: /sitemap.xml = DYNAMIC ⇒ đường tới origin VẪN THÔNG.");
  else luuY.push(`⚠️ /sitemap.xml cũng không tới origin (cf-cache-status=${sitemap.cache || "?"}) ⇒ có thể là chuyện của cả zone.`);

  // ── PHÉP CHẤM: đúng một câu hỏi ──
  if (!coDauA1) {
    return {
      ma: coKhoiCF ? 1 : 2,
      loi: [
        coKhoiCF
          ? `KHÔNG thấy "${DAU_A1}" mà CHỈ có khối Cloudflare ⇒ tệp của A1 KHÔNG tới nơi (bị THAY, không phải chèn thêm).`
          : `KHÔNG thấy "${DAU_A1}", và cũng không nhận ra khối Cloudflare ⇒ không biết đang phục vụ tệp của ai. Không biết ≠ đạt.`,
      ],
      luuY,
    };
  }

  // ── Từ đây trở xuống là ĐẠT. Phần còn lại là ghi chú cho người đọc. ──
  if (coKhoiCF) {
    luuY.push("Cloudflare CHÈN THÊM khối Content Signals vào ĐẦU tệp — nó không thay tệp của A1.");
    const cam = [...than.matchAll(/^User-agent:\s*(\S+)\s*\nDisallow:\s*\/\s*$/gim)].map((m) => m[1]);
    if (cam.length) {
      luuY.push(
        `🔴 QUYẾT ĐỊNH CHÍNH SÁCH, KHÔNG PHẢI LỖI: khối đó CẤM HẲN ${cam.length} bot ` +
          `(${cam.slice(0, 5).join(", ")}${cam.length > 5 ? ", …" : ""}) và khai điều khoản ` +
          `"as a condition of accessing this website" NHÂN DANH A1. Đây là lựa chọn của David, không phải mặc định kỹ thuật.`,
      );
    }
    // RFC 9309 §2.2.1 buộc gộp các nhóm cùng user-agent; nhưng bot không tuân thủ thì
    // có thể chỉ đọc nhóm ĐẦU TIÊN — mà nhóm đầu là của Cloudflare, không có Disallow của ta.
    const viCF = thap.indexOf("user-agent:");
    const viA1 = than.indexOf(DAU_A1);
    if (viCF >= 0 && viCF < viA1) {
      luuY.push(
        "⚠️ Nhóm `User-agent: *` của Cloudflare đứng TRƯỚC nhóm của A1. RFC 9309 §2.2.1 buộc bot GỘP " +
          "hai nhóm cùng tên, nên bot tuân thủ vẫn thấy các dòng `Disallow:` của A1; bot chỉ đọc nhóm " +
          "đầu tiên thì KHÔNG. Rủi ro thấp, nhưng nó là lý do thứ hai để cân nhắc tắt khối kia.",
      );
    }
  }
  if (robots.cache && robots.cache !== "DYNAMIC") {
    luuY.push(`cf-cache-status = ${robots.cache}${robots.tuoi ? ` (age ${robots.tuoi}s)` : ""} + ${robots.dieuKhien || "không có cache-control"} — Cloudflare trả từ cache của nó.`);
  }
  return { ma: 0, loi: [], luuY };
}

// ─────────────────────────── đối chứng ngược ───────────────────────────
const CF_KHOI = `# As a condition of accessing this website, you agree to abide by the following
# content signals:
# BEGIN Cloudflare Managed content
User-agent: *
Content-Signal: search=yes,ai-train=no,use=reference
Allow: /
User-agent: GPTBot
Disallow: /
`;
const A1_KHOI = `User-agent: *\nAllow: /\nDisallow: /api/\n\n${DAU_A1}\n`;

function tuKiem() {
  const R = (than, cache = "DYNAMIC") => ({ ok: true, ma: 200, kieu: "text/plain", cache, than, tuoi: "", dieuKhien: "" });
  const S_OK = { ok: true, cache: "DYNAMIC" };

  const ca = [
    {
      ten: "🔴 CA THẬT `28/08` — Cloudflare CHÈN THÊM, tệp A1 còn nguyên bên dưới ⇒ ĐẠT",
      cham: () => cham(R(CF_KHOI + A1_KHOI, "HIT"), S_OK),
      mong: 0,
    },
    {
      ten: "🔴 CA BẢN ĐẦU CHẤM SAI — chỉ đọc 3 dòng đầu thì thấy Cloudflare và phán đỏ. Nay phải XANH.",
      cham: () => cham(R(CF_KHOI + A1_KHOI, "HIT"), S_OK),
      mong: 0,
    },
    {
      ten: "tệp A1 tới thẳng, không có khối Cloudflare ⇒ ĐẠT",
      cham: () => cham(R(A1_KHOI), S_OK),
      mong: 0,
    },
    {
      ten: "🔴 THAY THẬT — chỉ có khối Cloudflare, mất dòng Sitemap của A1 ⇒ SAI",
      cham: () => cham(R(CF_KHOI, "HIT"), S_OK),
      mong: 1,
    },
    {
      ten: "🔴 route /robots.txt biến mất khỏi Caddyfile (trang 404 trả HTML) ⇒ SAI hoặc CHƯA KẾT LUẬN, KHÔNG xanh",
      cham: () => cham(R("<!doctype html><title>404</title>")),
      mong: 2,
    },
    {
      ten: "Sitemap trỏ tên miền KHÁC (chép nhầm cấu hình) ⇒ không tính là dấu của A1",
      cham: () => cham(R("User-agent: *\nSitemap: https://testnet-a1.9chain.org/sitemap.xml")),
      mong: 2,
    },
    {
      ten: "không lấy được ⇒ CHƯA KẾT LUẬN, tuyệt đối không xanh",
      cham: () => cham({ ok: false, loi: "timeout" }, S_OK),
      mong: 2,
    },
  ];

  console.log("══ ĐỐI CHỨNG NGƯỢC — mỗi ca phải ra ĐÚNG mã thoát đã khai ══\n");
  let hong = 0;
  for (const c of ca) {
    const kq = c.cham();
    const dat = kq.ma === c.mong;
    if (!dat) hong++;
    console.log(`  ${dat ? "✓" : "✗"} ${c.ten}\n      → mã ${kq.ma} (mong ${c.mong})`);
  }
  console.log(hong ? `\n✗ ${hong} ca sai mã thoát` : `\n✓ ${ca.length}/${ca.length} ca đúng mã thoát.`);
  return hong ? 1 : 0;
}

// ─────────────────────────── chạy ───────────────────────────
if (process.argv.includes("--self-test")) process.exit(tuKiem());

const [robots, sitemap] = await Promise.all([lay("/robots.txt"), lay("/sitemap.xml")]);
console.log(`══ B-10 · robots.txt của https://${TEN_MIEN} ══\n`);
if (robots.ok) {
  console.log(`  mã HTTP         ${robots.ma}   ⇦ tầng YẾU NHẤT, KHÔNG chấm bằng nó`);
  console.log(`  content-type    ${robots.kieu}`);
  console.log(`  cf-cache-status ${robots.cache || "(không có)"}${robots.tuoi ? ` · age ${robots.tuoi}s` : ""}`);
  console.log(`  kích thước      ${(robots.than || "").length} byte`);
  console.log(`  PHÉP CHẤM       tìm "${DAU_A1}" ⇒ ${robots.than?.includes(DAU_A1) ? "CÓ" : "KHÔNG"}`);
}
console.log("");
const kq = cham(robots, sitemap);
for (const l of kq.loi) console.log(`  🔴 ${l}`);
for (const l of kq.luuY) console.log(`  ℹ️  ${l}`);
console.log("");
if (kq.ma === 0) {
  console.log("✅ ĐẠT — robots.txt của A1 TỚI ĐƯỢC người đọc.");
  console.log("   Muốn bỏ khối Cloudflare chèn thêm (quyết định CHÍNH SÁCH, không phải sửa lỗi):");
  console.log("   dash.cloudflare.com → zone 9chain.org → Overview → Control AI Crawlers");
  console.log("   → bỏ chọn 'Display Content Signals Policy'. Hoặc: Security → Settings,");
  console.log("   lọc 'Bot traffic' → 'Instruct AI bot traffic with robots.txt'.");
} else if (kq.ma === 1) {
  console.log("❌ SAI — tệp robots.txt của A1 KHÔNG tới được người đọc.");
} else {
  console.log("🟡 CHƯA KẾT LUẬN — không đo được, hoặc không nhận ra đang phục vụ tệp của ai.");
}
process.exit(kq.ma);
