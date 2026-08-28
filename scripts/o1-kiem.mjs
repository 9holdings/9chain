#!/usr/bin/env node
/**
 * o1-kiem.mjs — **MỘT lệnh cho O1**: bản sao khoá quỹ này có còn cứu được mạng đang chạy không.
 *
 * ═══ VÌ SAO GỘP HAI LỆNH LÀM MỘT ═══
 *
 * D-090 đã dựng đủ hai phép đo, và tài liệu đã dặn *"phải chạy CẢ HAI"*. Nhưng **một lời dặn
 * không phải một cổng** — nó chỉ có hiệu lực với người đọc đúng tài liệu, đúng hôm ấy, và
 * nhớ tới lệnh thứ hai sau khi lệnh thứ nhất vừa in một dòng xanh rất thuyết phục:
 *
 *     ✓ 6/6 quỹ khôi phục đúng — mọi địa chỉ suy lại từ khoá đều khớp thứ tệp tự khai.
 *
 * Dòng đó là dòng `kiem-khoa` in ra cho bộ khoá **thế hệ 9001 ĐÃ CHẾT**, tiền của nó không
 * tồn tại ở đâu cả. Tình huống nguy hiểm nhất của O1 không phải "tệp hỏng" mà là **cất đúng
 * một bản, của thế hệ trước** — và trên chính con đường đó, phép đo còn thiếu là phép đo
 * người ta dễ quên nhất.
 *
 * ⇒ Tệp này biến *"nhớ chạy cả hai"* từ **quy trình** thành **cổng**.
 *
 * ═══ BA MÃ THOÁT — VÀ VÌ SAO PHẢI LÀ BA ═══
 *
 * | mã | nghĩa | khi nào |
 * |---:|---|---|
 * | `0` | **ĐẠT** | cả hai vế chạy được **và** cả hai xanh |
 * | `1` | **SAI** | một vế chạy được và **báo đỏ** — bản sao này không dùng được |
 * | `2` | 🔴 **CHƯA KẾT LUẬN** | một vế **không chạy được** (thiếu tệp/thiếu docker/không tới được chain) |
 *
 * Gộp `2` vào `1` thì "hỏng" nuốt mất "không biết", và người ta đi sửa nhầm thứ. Gộp `2` vào
 * `0` thì tệ hơn nhiều: **một bản sao chưa được kiểm sẽ được chấm là đã kiểm.** Đó đúng là
 * lớp lỗi cả D-090 lẫn tệp này sinh ra để chặn.
 *
 * ⚠️ **Không đọc, không in, không gửi đi khoá riêng nào.** Vế 1 chạy trong container và chỉ
 * in **địa chỉ**; vế 2 chỉ đọc `allocation.md` (tệp tự khai là công khai được). Thư mục khoá
 * mount vào container ở chế độ **`:ro`**.
 *
 * Dùng:
 *   node scripts/o1-kiem.mjs C:/Users/abc/9chain-a1-keys/g0
 *   node scripts/o1-kiem.mjs <thư-mục> --rpc https://rpc-a1.9chain.org
 *   node scripts/o1-kiem.mjs --tu-kiem     # đối chứng ngược — có ca PHẢI ra 1 và ca PHẢI ra 2
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, copyFileSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const lay = (co, mac) => {
  const i = argv.indexOf(co);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : mac;
};
const RPC = lay("--rpc", "https://rpc-a1.9chain.org");
const DOCKER = lay("--docker", "docker");
const ANH = lay("--anh", "golang:1.25.10");
const TU_KIEM = argv.includes("--tu-kiem");
const CO_CO = new Set(["--rpc", "--docker", "--anh"]);
const thuMuc = argv.find((a, i) => !a.startsWith("--") && !CO_CO.has(argv[i - 1]));

const FORK = path.join(GOC, "upstream", "avalanchego");
// Docker trên Windows nhận cả `C:\...` lẫn `C:/...`; chuẩn hoá về gạch chéo xuôi để
// chuỗi mount không bao giờ mang ký tự thoát.
const mount = (p) => path.resolve(p).replace(/\\/g, "/");

/** Kết quả một vế: chạy được không, và nếu chạy thì xanh hay đỏ. */
const VE_DAT = "dat", VE_DO = "do", VE_KHONG_CHAY = "khong-chay";

/**
 * VẾ 1 — khoá riêng có suy ra ĐÚNG những địa chỉ tệp tự khai không (`kiem-khoa`, patch 0023).
 *
 * 🔴 Chạy qua `spawnSync` chứ không qua shell: trên Git Bash (Windows), MSYS đổi mọi đối số
 * bắt đầu bằng `/` thành đường dẫn Windows, nên `-w /src` biến thành
 * `C:/Program Files/Git/src` và docker từ chối. Đã dính `28/08`. `spawnSync` không đi qua
 * MSYS ⇒ lỗi đó không tồn tại ở đây.
 */
function veKhoaRaDiaChi(dirKhoa) {
  if (!existsSync(FORK)) {
    return { trangThai: VE_KHONG_CHAY, vi: `không thấy cây fork ở ${FORK}` };
  }
  const args = [
    "run", "--rm",
    "-v", `${mount(FORK)}:/src`,
    "-v", `${mount(dirKhoa)}:/keys:ro`,
    "-v", "9chain-gomod:/go/pkg/mod",
    "-w", "/src", ANH,
    "sh", "-c", "go run ./9chain-a1-tools/kiem-khoa -allocation /keys/allocation.md /keys/keys.txt",
  ];
  const r = spawnSync(DOCKER, args, { encoding: "utf8", timeout: 180_000 });
  const ra = `${r.stdout || ""}${r.stderr || ""}`.trim();
  if (r.error || r.status === null) {
    return { trangThai: VE_KHONG_CHAY, vi: `không chạy được ${DOCKER}: ${r.error?.message || "hết giờ"}`, ra };
  }
  // `kiem-khoa` dùng exit 2 cho lỗi CÁCH DÙNG (thiếu đối số, cờ đặt sai chỗ) — đó là
  // "không đo được", không phải "đo ra sai". Giữ nguyên sự phân biệt đó thay vì gộp.
  if (r.status === 2) return { trangThai: VE_KHONG_CHAY, vi: "kiem-khoa từ chối chạy (lỗi cách dùng)", ra };
  if (r.status !== 0) return { trangThai: VE_DO, vi: `kiem-khoa báo ĐỎ (exit ${r.status})`, ra };
  return { trangThai: VE_DAT, vi: "khoá riêng suy ra đúng mọi địa chỉ tệp tự khai", ra };
}

/** VẾ 2 — những địa chỉ đó có giữ tiền thật trên MẠNG ĐANG CHẠY không (D-090). */
function veDiaChiRaTien(fileAlloc) {
  const bai = path.join(GOC, "scripts", "kiem-khoa-tren-chain.mjs");
  if (!existsSync(bai)) {
    return { trangThai: VE_KHONG_CHAY, vi: `thiếu ${bai} — KHÔNG được coi vế này là đã kiểm` };
  }
  const r = spawnSync(process.execPath, [bai, fileAlloc, "--rpc", RPC], {
    encoding: "utf8", timeout: 180_000,
  });
  const ra = `${r.stdout || ""}${r.stderr || ""}`.trim();
  if (r.error || r.status === null) {
    return { trangThai: VE_KHONG_CHAY, vi: `không chạy được phép đo trên chain: ${r.error?.message || "hết giờ"}`, ra };
  }
  // Bài đó dùng exit 2 cho "không tới được chain / sổ không đọc được" — cũng là *không
  // biết*, không phải *sai*.
  if (r.status === 2) return { trangThai: VE_KHONG_CHAY, vi: "không đo được trên chain (RPC/tệp)", ra };
  if (r.status !== 0) return { trangThai: VE_DO, vi: `địa chỉ KHÔNG khớp chain đang chạy (exit ${r.status})`, ra };
  return { trangThai: VE_DAT, vi: "các địa chỉ đó giữ tiền thật trên chain đang chạy", ra };
}

function chay(dir, { im = false } = {}) {
  const noi = (...a) => { if (!im) console.log(...a); };
  const keys = path.join(dir, "keys.txt");
  const alloc = path.join(dir, "allocation.md");

  noi(`\n══ O1 — bản sao khoá quỹ: ${dir} ══`);
  if (!existsSync(dir)) return { ma: 2, vi: `thư mục không tồn tại: ${dir}` };
  // Thiếu MỘT trong hai tệp là "chưa kết luận", không phải "sai": ta chưa đo được gì cả.
  for (const [ten, p] of [["keys.txt", keys], ["allocation.md", alloc]]) {
    if (!existsSync(p)) return { ma: 2, vi: `thiếu ${ten} trong ${dir} — chưa đo được gì` };
  }

  noi("\n── vế 1/2 · khoá riêng → địa chỉ  (kiem-khoa, trong container) ──");
  const v1 = veKhoaRaDiaChi(dir);
  noi(`  ${v1.trangThai === VE_DAT ? "✓" : "✗"} ${v1.vi}`);
  if (!im && v1.ra) noi(v1.ra.split("\n").map((l) => `    │ ${l}`).join("\n"));

  noi("\n── vế 2/2 · địa chỉ → TIỀN THẬT trên chain đang chạy ──");
  const v2 = veDiaChiRaTien(alloc);
  noi(`  ${v2.trangThai === VE_DAT ? "✓" : "✗"} ${v2.vi}`);
  if (!im && v2.ra) noi(v2.ra.split("\n").map((l) => `    │ ${l}`).join("\n"));

  // 🔴 THỨ TỰ PHÁN XÉT: "không chạy được" đứng TRƯỚC "sai". Một vế không đo được thì kết
  // luận chung không thể là "đạt", kể cả khi vế kia xanh — và cũng không thể là "sai",
  // vì ta chưa biết. Xếp sai thứ tự này là gộp *không biết* vào *biết*.
  if (v1.trangThai === VE_KHONG_CHAY || v2.trangThai === VE_KHONG_CHAY) {
    const ai = v1.trangThai === VE_KHONG_CHAY ? v1.vi : v2.vi;
    return { ma: 2, vi: `chưa kết luận được — ${ai}` };
  }
  if (v1.trangThai === VE_DO || v2.trangThai === VE_DO) {
    return { ma: 1, vi: v1.trangThai === VE_DO ? v1.vi : v2.vi };
  }
  return { ma: 0, vi: "cả hai vế xanh — bản sao này khôi phục được mạng đang chạy" };
}

function inPhan({ ma, vi }) {
  const bang = {
    0: ["✅ ĐẠT", "Bộ khoá này suy ra đúng địa chỉ, VÀ những địa chỉ đó đang giữ tiền thật\n   trên mạng đang chạy. Vòng đã khép."],
    1: ["🔴 SAI", "Bản sao này KHÔNG dùng được cho mạng đang chạy. Đừng cất nó làm bản O1."],
    2: ["🟡 CHƯA KẾT LUẬN", "Một vế không chạy được ⇒ **không biết**, và *không biết* KHÔNG phải *đạt*.\n   Sửa nguyên nhân rồi chạy lại; đừng chấm O1 dựa trên lượt này."],
  };
  const [nhan, giai] = bang[ma];
  console.log(`\n${nhan} — ${vi}\n   ${giai}`);
}

// ═════ ĐỐI CHỨNG NGƯỢC ═════
// Không có phần này thì "ĐẠT" có thể chỉ nghĩa là cổng không phân biệt được gì.
function tuKiem() {
  const tam = mkdtempSync(path.join(tmpdir(), "o1-"));
  const boChet = path.join(GOC, "local-net", "net-public");
  const boSong = lay("--bo-song", "C:/Users/abc/9chain-a1-keys/g0");
  // Thư mục rỗng: có thật nhưng KHÔNG có tệp nào ⇒ phải ra 2, không phải 0.
  const rong = path.join(tam, "rong");
  mkdirSync(rong, { recursive: true });

  const ca = [
    ["thư mục không tồn tại ⇒ 2", path.join(tam, "khong-co"), 2, {}],
    ["thư mục RỖNG (có thật, không tệp nào) ⇒ 2", rong, 2, {}],
    ["thiếu `kiem-khoa-tren-chain.mjs` ⇒ 2, KHÔNG được xanh", boSong, 2, { veHong: true }],
    ["không gọi được docker ⇒ 2", boSong, 2, { docker: "docker-khong-ton-tai-o-day" }],
    // 🔴 CA ĐẮT NHẤT — bộ khoá THẾ HỆ 9001 ĐÃ CHẾT, vẫn nằm trên máy dev.
    // `kiem-khoa` một mình chấm nó 6/6 ✓ exit 0. Cổng gộp PHẢI ra 1.
    ["🔴 bộ khoá thế hệ ĐÃ CHẾT ⇒ 1 (kiem-khoa một mình chấm 6/6 ✓)", boChet, 1, {}],
    ["bộ khoá g0 ĐANG SỐNG ⇒ 0 (đối chứng: cổng không chặn bừa)", boSong, 0, {}],
  ];

  let hong = 0;
  console.log("\n══ ĐỐI CHỨNG NGƯỢC — mỗi ca phải ra ĐÚNG mã thoát đã nêu ══");
  for (const [ten, dir, mongDoi, tuyChon] of ca) {
    if (!existsSync(dir) && mongDoi !== 2) {
      console.log(`  ⚠️  "${ten}" → BỎ QUA, không có ${dir} trên máy này`);
      continue;
    }
    let ma;
    if (tuyChon.veHong) {
      // Giấu phép đo trên chain đi bằng cách trỏ bài sang đường không tồn tại — mô phỏng
      // đúng kịch bản "người ta chỉ chạy kiem-khoa".
      const goc = path.join(GOC, "scripts", "kiem-khoa-tren-chain.mjs");
      const cat = `${goc}.tam-doi-chung`;
      try {
        copyFileSync(goc, cat); rmSync(goc);
        ma = chay(dir, { im: true }).ma;
      } finally {
        copyFileSync(cat, goc); rmSync(cat);
      }
    } else {
      const luuDocker = tuyChon.docker;
      if (luuDocker) {
        const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), dir, "--docker", luuDocker],
          { encoding: "utf8", timeout: 180_000 });
        ma = r.status;
      } else {
        ma = chay(dir, { im: true }).ma;
      }
    }
    if (ma === mongDoi) console.log(`  ✓ "${ten}" → đúng, exit ${ma}`);
    else { console.log(`  ✗ "${ten}" → SAI: mong ${mongDoi}, ra ${ma}`); hong++; }
  }
  try { rmSync(tam, { recursive: true, force: true }); } catch { /* kệ */ }
  return hong;
}

if (TU_KIEM) {
  const hong = tuKiem();
  console.log(`\n${hong ? "✗" : "✅"} đối chứng ngược: ${hong} ca sai`);
  process.exit(hong ? 1 : 0);
}

if (!thuMuc) {
  console.error("Dùng: node scripts/o1-kiem.mjs <thư-mục-chứa keys.txt + allocation.md>");
  console.error("      node scripts/o1-kiem.mjs --tu-kiem");
  process.exit(2);
}
const kq = chay(thuMuc);
inPhan(kq);
process.exit(kq.ma);
