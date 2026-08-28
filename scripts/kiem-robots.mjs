#!/usr/bin/env node
/**
 * kiem-robots.mjs — B-10: `robots.txt` tới được người đọc chưa?
 *
 * 🔴 VÌ SAO CẦN MỘT CỔNG RIÊNG CHO MỘT TỆP TEXT 5KB:
 * đây là **ca xanh giả sách giáo khoa** của repo này, và nó đã sống nhiều ngày.
 *
 *   curl -o /dev/null -w '%{http_code}'   ⇒ 200        ✓ (sai)
 *   content-type                          ⇒ text/plain ✓ (sai)
 *   NỘI DUNG                              ⇒ văn bản của CLOUDFLARE, không phải của A1
 *
 * Ba tầng đầu của thang đo trong `CLAUDE.md` §1 đều xanh. Chỉ tầng 3 (nội dung) và
 * tầng 4 (`cf-cache-status`) mới thấy. Nên cổng này **không bao giờ được chấm bằng
 * mã HTTP** — nó chấm bằng chữ trong tệp.
 *
 * ═══ PHÉP ĐO ═══
 * Hai đường, và sức mạnh nằm ở CHỖ SO SÁNH chứ không ở từng đường:
 *
 *   /sitemap.xml  → `cf-cache-status: DYNAMIC`  = yêu cầu ĐI TỚI origin
 *   /robots.txt   → `cf-cache-status: HIT/MISS` + `Cache-Control: max-age=…`
 *                   ở một đường mà origin CÓ tệp thật
 *                 = Cloudflare tự sinh phản hồi và KHÔNG hỏi origin
 *
 * `sitemap.xml` là **đối chứng dương**: nó chứng minh đường qua Cloudflare tới origin
 * vẫn thông. Thiếu nó thì một origin chết cũng cho ra cùng triệu chứng, và ta sẽ đi
 * sửa nhầm chỗ. (Đúng bài học D-096: hai tên miền hỏng/sống khác nhau thì lỗi không
 * nằm ở server.)
 *
 * ⚠️ KHÔNG đo được origin trực tiếp từ máy dev: origin trả **403** cho mọi yêu cầu
 * không qua Cloudflare (bộ lọc `Host` của M11.10 — đo `28/08`, và 403 đó là cổng
 * THẬT, đừng nới nó ra để "kiểm cho tiện").
 *
 * ═══ MÃ THOÁT ═══   0 ĐẠT · 1 SAI (Cloudflare đang che) · 2 CHƯA KẾT LUẬN
 * 🔴 `2` KHÔNG phải `0`. Không đo được là *không biết*, không phải *đạt*.
 *
 * Dùng:
 *   node scripts/kiem-robots.mjs
 *   node scripts/kiem-robots.mjs --tu-kiem     # đối chứng ngược trên dữ liệu tổng hợp
 */

const TEN_MIEN = process.env.A1_TEN_MIEN || "a1.9chain.org";
const HET_GIO = 15000;

/** Dấu vân tay của văn bản Cloudflare tự sinh (Managed robots.txt / Content Signals). */
const DAU_CLOUDFLARE = [
  "as a condition of accessing this website",
  "content-signal",
  "content signals",
];

/** Thứ PHẢI có trong robots.txt thật của A1. Rỗng ⇒ không kết luận được. */
const DAU_A1 = ["sitemap:", "user-agent:"];

async function lay(duong) {
  const url = `https://${TEN_MIEN}${duong}`;
  const bo = AbortSignal.timeout(HET_GIO);
  try {
    const r = await fetch(url, { signal: bo, redirect: "follow" });
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

/**
 * Chấm điểm — TÁCH THUẦN khỏi mạng để `--tu-kiem` chạy được trên dữ liệu tổng hợp.
 * Đây là chỗ D-100 đã học: hàm chấm dính vào fetch thì không ai đối chứng ngược được nó.
 */
export function cham(robots, sitemap) {
  const loi = [];
  const luuY = [];

  if (!robots?.ok) return { ma: 2, loi: [`không lấy được /robots.txt: ${robots?.loi}`], luuY };

  const than = (robots.than || "").toLowerCase();

  // ── Tầng 3: NỘI DUNG. Đây là phép đo chính, hai tầng trên chỉ để in ra cho người đọc.
  const laCuaCloudflare = DAU_CLOUDFLARE.some((d) => than.includes(d));
  const coDauA1 = DAU_A1.some((d) => than.includes(d));

  if (laCuaCloudflare) {
    loi.push(
      "NỘI DUNG là văn bản do CLOUDFLARE tự sinh (Managed robots.txt / Content Signals) — " +
        "không phải tệp của A1. Mã HTTP và content-type đều XANH ⇒ đừng chấm bằng chúng.",
    );
  } else if (!coDauA1) {
    // Không phải của Cloudflare, nhưng cũng không nhận ra là của A1 ⇒ KHÔNG kết luận.
    return {
      ma: 2,
      loi: [
        `/robots.txt không mang dấu Cloudflare, nhưng cũng không thấy ${DAU_A1.map((d) => `"${d}"`).join(" hoặc ")} ` +
          "⇒ không nhận ra là tệp của A1. Không biết ≠ đạt.",
      ],
      luuY,
    };
  }

  // ── Tầng 4: header tầng trước. Bằng chứng phụ, nhưng nó nói VÌ SAO.
  if (robots.cache && robots.cache !== "DYNAMIC") {
    luuY.push(
      `cf-cache-status = ${robots.cache}${robots.tuoi ? ` (age ${robots.tuoi}s)` : ""} ` +
        `+ ${robots.dieuKhien || "không có cache-control"} ⇒ Cloudflare trả lời THAY origin.`,
    );
  }

  // ── Đối chứng DƯƠNG: đường qua Cloudflare tới origin có còn thông không.
  if (!sitemap?.ok) {
    luuY.push(`không đo được /sitemap.xml (${sitemap?.loi}) — thiếu đối chứng dương.`);
  } else if (sitemap.cache === "DYNAMIC") {
    luuY.push("đối chứng dương: /sitemap.xml = DYNAMIC ⇒ đường tới origin VẪN THÔNG. Lỗi nằm ở Cloudflare, không ở server.");
  } else {
    // Cả hai đường đều không tới origin ⇒ triệu chứng khác hẳn, đừng đi sửa robots.
    luuY.push(
      `⚠️ /sitemap.xml cũng KHÔNG tới origin (cf-cache-status=${sitemap.cache || "?"}) ` +
        "⇒ đây có thể là chuyện của cả zone, không riêng robots.txt. Đừng kết luận vội.",
    );
  }

  return { ma: loi.length ? 1 : 0, loi, luuY };
}

// ─────────────────────────── đối chứng ngược ───────────────────────────
function tuKiem() {
  const R = (than, cache, extra = {}) => ({ ok: true, ma: 200, kieu: "text/plain", cache, than, tuoi: "", dieuKhien: "", ...extra });
  const S_OK = { ok: true, cache: "DYNAMIC" };

  const ca = [
    {
      ten: "🔴 CA THẬT — Cloudflare che (đo được trên sản phẩm 28/08)",
      cham: () => cham(R("# As a condition of accessing this website, you agree...", "HIT"), S_OK),
      mong: 1,
    },
    {
      ten: "robots.txt THẬT của A1 tới được người đọc",
      cham: () => cham(R("User-agent: *\nAllow: /\nSitemap: https://a1.9chain.org/sitemap.xml", "DYNAMIC"), S_OK),
      mong: 0,
    },
    {
      ten: "🔴 mã 200 + text/plain nhưng NỘI DUNG của Cloudflare — hai tầng đầu KHÔNG cứu được",
      cham: () => cham(R("...content signals policy...", "MISS"), S_OK),
      mong: 1,
    },
    {
      ten: "không lấy được robots.txt ⇒ CHƯA KẾT LUẬN, tuyệt đối không xanh",
      cham: () => cham({ ok: false, loi: "timeout" }, S_OK),
      mong: 2,
    },
    {
      ten: "nội dung lạ, không nhận ra của ai ⇒ CHƯA KẾT LUẬN",
      cham: () => cham(R("hello", "DYNAMIC"), S_OK),
      mong: 2,
    },
    {
      ten: "robots.txt thật NHƯNG sitemap cũng không tới origin ⇒ vẫn ĐẠT, kèm lưu ý về cả zone",
      cham: () => cham(R("User-agent: *\nSitemap: x", "DYNAMIC"), { ok: true, cache: "HIT" }),
      mong: 0,
    },
  ];

  console.log("══ ĐỐI CHỨNG NGƯỢC — mỗi ca phải ra ĐÚNG mã thoát đã khai ══\n");
  let hong = 0;
  for (const c of ca) {
    const kq = c.cham();
    const dat = kq.ma === c.mong;
    if (!dat) hong++;
    console.log(`  ${dat ? "✓" : "✗"} ${c.ten}\n      → mã ${kq.ma} (mong ${c.mong})${kq.loi[0] ? ` · ${kq.loi[0].slice(0, 90)}…` : ""}`);
  }
  console.log(hong ? `\n✗ ${hong} ca sai mã thoát` : `\n✓ ${ca.length}/${ca.length} ca đúng mã thoát — cổng phân biệt được ba trạng thái.`);
  return hong ? 1 : 0;
}

// ─────────────────────────── chạy ───────────────────────────
if (process.argv.includes("--tu-kiem")) process.exit(tuKiem());

const [robots, sitemap] = await Promise.all([lay("/robots.txt"), lay("/sitemap.xml")]);
console.log(`══ B-10 · robots.txt của https://${TEN_MIEN} ══\n`);
if (robots.ok) {
  console.log(`  mã HTTP        ${robots.ma}          ⇦ tầng YẾU NHẤT, đừng chấm bằng nó`);
  console.log(`  content-type   ${robots.kieu}`);
  console.log(`  cf-cache-status ${robots.cache || "(không có)"}${robots.tuoi ? ` · age ${robots.tuoi}s` : ""}`);
  console.log(`  dòng đầu       ${(robots.than || "").split("\n")[0].slice(0, 78)}`);
}
console.log("");
const kq = cham(robots, sitemap);
for (const l of kq.loi) console.log(`  🔴 ${l}`);
for (const l of kq.luuY) console.log(`  ℹ️  ${l}`);
console.log("");
if (kq.ma === 0) console.log("✅ ĐẠT — robots.txt của A1 tới được người đọc.");
else if (kq.ma === 1) {
  console.log("❌ SAI — B-10 CÒN HỞ. Chỉ David sửa được, trong dashboard Cloudflare:");
  console.log("   zone 9chain.org → Settings → tắt Managed robots.txt / Content Signals Policy.");
  console.log("   Không sửa được từ mã nguồn hay từ Caddy — tệp và route đã đúng, chúng bị che.");
  console.log("   Sửa xong: chạy lại lệnh này. Cache Cloudflare tới 4 giờ ⇒ purge hoặc chờ.");
} else console.log("🟡 CHƯA KẾT LUẬN — không đo được. Không biết KHÔNG phải là đạt.");
process.exit(kq.ma);
