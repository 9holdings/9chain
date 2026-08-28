#!/usr/bin/env node
/**
 * wallet-over-tunnel.mjs — **M11.10: ví ký ở MÁY DEV, khoá quỹ không bao giờ chạm server.**
 *
 * 🔴 VÌ SAO CÓ. Hôm nay ví X/P chạy **trên server** (`9chain-a1-xpwallet`), khoá nằm trong env
 * của container ⇒ mọi lượt nạp quỹ là một lượt khoá quỹ đi lên một máy công khai. Lượt g0
 * `27/08` đã phải lách bằng container tạm `a1-fund-tmp` rồi `docker rm -f` ngay — **né được,
 * không đóng được**. Ngày G nạp lại cả 6 quỹ ⇒ phải đóng thật.
 *
 * ## Hai lớp chặn của đường đi thẳng — cả hai ĐÚNG, đo lại `28/08`
 *
 * | Đường | Đo được |
 * |---|---|
 * | RPC công khai `rpc-a1.9chain.org` | `/ext/info` `/ext/bc/X` `/ext/bc/P` `/ext/bc/C/rpc` = **200**, nhưng **`/ext/bc/C/avax` = 404** — đúng đường `primary.MakeWallet` cần |
 * | Hầm SSH mở từ Windows, ví trong container | ví gọi `host.docker.internal` ⇒ **header `Host` mang đúng chuỗi đó** ⇒ node **403** (`A1_HTTP_ALLOWED_HOSTS=localhost,127.0.0.1`, D-083) |
 *
 * ⚠️ **403 đó là tin tốt đọc ngược:** bộ lọc Host chặn đúng một thứ đáng chặn, trong một tình
 * huống không ai dựng ra để thử nó. Đường ra **không phải nới nó**.
 *
 * ⇒ Hầm SSH chạy **TRONG CÙNG container với ví**: ví gọi `127.0.0.1:9650`, header `Host` tự nó
 * đã nằm trong danh sách cho phép. **Không nới một cổng nào ở server.**
 *
 * ## Thứ tự trong `enter.sh` là toàn bộ giá trị của nó
 *
 * Chứng minh đường đi **trước**, nạp khoá **sau**. Ba phép đo chạy **mỗi lượt**, không phải
 * lượt đầu rồi tin mãi: `networkID` đúng băng · `/ext/bc/C/avax` = 200 · **đối chứng ngược**
 * `Host` lạ = 403. Ô thứ ba là thứ giữ cho ô thứ hai còn nghĩa: ngày nào nó ra 200 thì bộ lọc
 * Host đã bị nới và phép đo kia không chứng minh gì nữa.
 *
 * Dùng:
 *   node scripts/wallet-over-tunnel.mjs --kiem       # nghiệm thu đường đi, KHÔNG cần khoá, KHÔNG chạy ví
 *   node scripts/wallet-over-tunnel.mjs --tu-kiem    # đối chứng ngược — 3 ca PHẢI ra ĐỎ
 *   node scripts/wallet-over-tunnel.mjs --khoa D:/tam/wallet-key.txt --cong 8090
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir, homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FORK = path.join(GOC, "upstream/avalanchego");
const BOI_CANH = path.join(GOC, "local-net/deploy/wallet-tunnel");
const ANH = "9chain-a1/wallet-over-tunnel:dev";

const argv = process.argv.slice(2);
const lay = (co, mac) => {
  const i = argv.indexOf(co);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : mac;
};
const DICH = lay("--dich", ""$A1_SSH_HOST"");
const KHOA_SSH = lay("--khoa-ssh", path.join(homedir(), ".ssh/9chain-a1"));
const KNOWN = lay("--known-hosts", path.join(homedir(), ".ssh/known_hosts"));
const NETWORK_ID = lay("--network-id", "999999999");
const CONG = lay("--cong", "8090");
const KHOA_VI = lay("--khoa", null);
const QUY = lay("--quy", null); // tên khối trong keys.txt, vd `foundation`
const CHI_KIEM = argv.includes("--kiem");
const TU_KIEM = argv.includes("--tu-kiem");

/** Windows + Git Bash: `MSYS_NO_PATHCONV=1` hoặc `/src` biến thành `C:/Program Files/Git/src`. */
const MOI_TRUONG = { ...process.env, MSYS_NO_PATHCONV: "1" };

function dungAnh({ im = false } = {}) {
  const r = spawnSync("docker", ["build", "-q", "-t", ANH, BOI_CANH], {
    encoding: "utf8",
    env: MOI_TRUONG,
  });
  if (r.status !== 0) {
    console.log(`🔴 dựng ảnh hỏng:\n${r.stderr || r.stdout}`);
    process.exit(1);
  }
  if (!im) console.log(`✓ ảnh ${ANH} sẵn sàng`);
}

/**
 * Một lượt chạy container. `chiKiem` ⇒ dừng sau phần nghiệm thu, không cần khoá.
 * Mount fork và khoá đều **chỉ đọc**.
 */
function chay({ chiKiem, networkID = NETWORK_ID, dich = DICH, known = KNOWN, khoaVi = null, quy = QUY, im = false }) {
  const tay = [
    "run", "--rm",
    ...(im || chiKiem ? [] : ["-d", "--name", "9chain-a1-vi-ham", "-p", `127.0.0.1:${CONG}:8090`]),
    "-v", `${FORK}:/src:ro`,
    "-v", `${KHOA_SSH}:/ssh/key:ro`,
    "-v", `${known}:/ssh/known_hosts:ro`,
    ...(khoaVi ? ["-v", `${khoaVi}:/vi/wallet-key:ro`] : []),
    "-v", "9chain-gomod:/go/pkg/mod",
    "-e", `A1_SSH_TARGET=${dich}`,
    "-e", `A1_NETWORK_ID=${networkID}`,
    ...(quy ? ["-e", `A1_VI_QUY=${quy}`] : []),
    ...(chiKiem ? ["-e", "A1_CHI_KIEM=1"] : []),
    "-w", "/src",
    ANH,
  ];
  return spawnSync("docker", tay, { encoding: "utf8", env: MOI_TRUONG });
}

/* ─────────────────── đối chứng ngược — 3 ca PHẢI ra đỏ ──────────────────── */

function tuKiem() {
  dungAnh();
  const tmp = mkdtempSync(path.join(tmpdir(), "m1110-"));
  const knownRong = path.join(tmp, "known_hosts_rong");
  writeFileSync(knownRong, "");

  const ca = [
    ["networkID khai SAI băng — ví bắn vào thế hệ khác", { networkID: "999999998" }],
    ["known_hosts RỖNG — không cho tin-lần-đầu (TOFU)", { known: knownRong }],
    ["đích SSH sai", { dich: "ubuntu@127.0.0.2" }],
  ];

  /**
   * Ba ca của đường CHỌN QUỸ. Dùng **bộ khoá thế hệ 9001 ĐÃ CHẾT** trong repo, không dùng
   * khoá thật: nó có đúng khuôn 6 khối, và tiền của nó **đo được là 0 trên chain** (D-090)
   * nên bản chép tạm không phơi thứ gì. Bản chép nằm trong `mkdtemp` và bị xoá ở cuối hàm.
   */
  const chet = path.join(GOC, "local-net/net-public/keys.txt");
  if (existsSync(chet)) {
    const txt = readFileSync(chet, "utf8");
    const dc = (ten) => new RegExp(`\\[${ten}\\][\\s\\S]*?P-addr\\s*:\\s*(\\S+)`).exec(txt)?.[1];
    const i = txt.indexOf("[team]");
    // 🔴 Dán địa chỉ của quỹ KHÁC vào khối `[team]`: dòng "quỹ chọn" in ra vẫn **trông
    //    đúng** — nó chỉ đang đọc chữ. Chỉ `kiem-khoa` suy lại từ khoá mới bác được.
    const treo = path.join(tmp, "keys-treo.txt");
    writeFileSync(treo, txt.slice(0, i) + txt.slice(i).replace(dc("team"), dc("foundation")));

    ca.push(
      ["tệp 6 khoá mà KHÔNG khai --quy — phải dừng, không lấy khối đầu", { khoaVi: chet }],
      ["--quy trỏ tên quỹ không tồn tại", { khoaVi: chet, quy: "khong-co-that" }],
      ["khối [team] dán nhầm địa chỉ của [foundation] — dòng in ra vẫn trông đúng", { khoaVi: treo, quy: "team" }],
    );
  }

  console.log("\n══ ĐỐI CHỨNG NGƯỢC — mỗi ca dưới đây PHẢI ra đỏ ══\n");
  let hong = 0;
  for (const [ten, sua] of ca) {
    const r = chay({ chiKiem: true, im: true, ...sua });
    const ra = `${r.stdout || ""}${r.stderr || ""}`.trim().split("\n").filter(Boolean).pop() || "(không có đầu ra)";
    if (r.status !== 0) console.log(`  ✓ ${ten}\n      → dừng đúng (exit ${r.status}): ${ra.slice(0, 120)}`);
    else { console.log(`  🔴 ${ten}\n      → KHÔNG dừng — cổng này không phân biệt được gì.`); hong++; }
  }
  rmSync(tmp, { recursive: true, force: true });
  console.log();
  if (hong) { console.log(`🔴 ${hong}/${ca.length} ca đối chứng KHÔNG đỏ.`); process.exit(1); }
  console.log(`✓ ${ca.length}/${ca.length} ca đối chứng đỏ đúng chỗ.`);
}

/* ────────────────────────────────── chạy ────────────────────────────────── */

for (const [ten, p] of [["khoá SSH", KHOA_SSH], ["known_hosts", KNOWN]]) {
  if (!existsSync(p)) { console.log(`🔴 không thấy ${ten}: ${p}`); process.exit(1); }
}

if (TU_KIEM) {
  tuKiem();
} else if (CHI_KIEM) {
  // `--kiem` KÈM `--khoa/--quy` ⇒ kiểm luôn việc CHỌN QUỸ mà **không khởi động ví**.
  // Ngày G nạp 6 quỹ liên tiếp: nếu muốn biết "khối nào được chọn" mà phải chạy ví lên
  // với khoá thật thì chính phép kiểm ấy là một lần phơi khoá.
  if (KHOA_VI && !existsSync(KHOA_VI)) { console.log(`🔴 không thấy tệp khoá ví: ${KHOA_VI}`); process.exit(1); }
  dungAnh();
  const r = chay({ chiKiem: true, khoaVi: KHOA_VI ? path.resolve(KHOA_VI) : null });
  process.stdout.write(r.stdout || "");
  process.stderr.write(r.stderr || "");
  process.exit(r.status ?? 1);
} else {
  if (!KHOA_VI) {
    console.log("dùng: node scripts/wallet-over-tunnel.mjs --kiem");
    console.log("      node scripts/wallet-over-tunnel.mjs --tu-kiem");
    console.log("      node scripts/wallet-over-tunnel.mjs --khoa <tệp-khoá-ví> [--cong 8090]");
    console.log("\n🔴 Khoá ví vào bằng TỆP, không bằng tham số dòng lệnh — nó nằm lại trong");
    console.log("   lịch sử shell và trong `docker inspect` nếu truyền bằng env.");
    process.exit(2);
  }
  if (!existsSync(KHOA_VI)) { console.log(`🔴 không thấy tệp khoá ví: ${KHOA_VI}`); process.exit(1); }
  dungAnh();
  const r = chay({ chiKiem: false, khoaVi: path.resolve(KHOA_VI) });
  process.stdout.write(r.stdout || "");
  process.stderr.write(r.stderr || "");
  if (r.status !== 0) process.exit(r.status ?? 1);
  console.log(`\n✓ ví chạy nền: container 9chain-a1-vi-ham · http://127.0.0.1:${CONG}`);
  console.log("  🔴 Khoá sống TRONG container này và không rời nó. Xong việc thì dừng NGAY:");
  console.log("     docker rm -f 9chain-a1-vi-ham");
}
