#!/usr/bin/env node
/**
 * check-keys-on-chain.mjs — **cổng canh: bộ khoá này có phải bộ khoá của MẠNG ĐANG CHẠY không.**
 *
 * 🔴 VÌ SAO CÓ. `kiem-khoa` (patch 0023, D-085) là công cụ O1 dựa vào để kiểm bản sao khoá quỹ.
 * Đo `2026-08-28`: chạy nó trên bộ khoá **thế hệ 9001 đã chết** (`local-net/net-public/`, bộ
 * `26/08`, tiền của nó **không tồn tại ở đâu cả**) thì nó in:
 *
 *     ✓ 6/6 quỹ khôi phục đúng — mọi địa chỉ suy lại từ khoá đều khớp thứ tệp tự khai.
 *     EXIT=0
 *
 * Nó **có** cảnh báo `networkID 9001 KHÔNG thuộc băng 9Chain-A1` — nhưng câu phán cuối vẫn
 * xanh và mã thoát vẫn `0`, mà câu phán cuối mới là thứ người ta đọc.
 *
 * **Đó là lớp lỗi "đo sai đại lượng".** `kiem-khoa` đo `keys.txt` ↔ `allocation.md` —
 * **hai tệp nằm cùng một thư mục, chép cùng một lượt**. Nó chứng minh bản sao **tự nhất
 * quán**, không chứng minh bản sao **còn giá trị**. Và tình huống nguy hiểm nhất của O1 không
 * phải "tệp hỏng" — mà là **David cất đúng một bản, của thế hệ trước**: bộ `26/08` là bộ đang
 * tồn tại đúng lúc anh được nhắc phải sao lưu. Bộ đó qua `kiem-khoa` sạch 6/6.
 *
 * ⇒ Tệp này đo **đại lượng còn thiếu**: các địa chỉ đó có thật sự giữ tiền trên chain đang
 * chạy không, và **đúng bằng số đã công bố** không.
 *
 * 🔴 **KHÔNG ĐỌC, KHÔNG IN, KHÔNG GỬI ĐI KHOÁ RIÊNG NÀO.** Nó chỉ đọc `allocation.md` — tệp
 * tự khai *"CÔNG KHAI được — chỉ chứa địa chỉ, không chứa khoá bí mật"*. Mắt xích
 * `keys.txt → địa chỉ` do `kiem-khoa` chứng minh; tệp này nối tiếp `địa chỉ → tiền`.
 * **Hai lệnh nối nhau mới đóng được vòng, một mình không lệnh nào đủ.**
 *
 * ## Thang đo — vì sao từng ô chọn phép so đó
 *
 * | Ô trong `allocation.md` | Đo bằng | Phép so |
 * |---|---|---|
 * | X/P **khoá** | `platform.getBalance.lockedStakeable` + `platform.getStake` | **khớp từng nLOVE9** — tiền khoá không tiêu được, lệch = sai bộ |
 * | **C-Chain** | `eth_getBalance(addr, "0x0")` — số dư ở **block 0** | **khớp từng wei** — lịch sử genesis bất biến, không trôi |
 * | X/P **thanh khoản** | số dư X hiện tại | `0 < đo ≤ khai` — ví tiêu được, đòi khớp là đẻ báo động giả |
 * | `networkID` ở đầu tệp | `info.getNetworkID` của RPC | khớp, **CHẶN** nếu lệch |
 *
 * ⚠️ Quỹ **staking** không có `lockedStakeable`: 8.999.991 LOVE9 của nó nằm trong stake của 9
 * validator. Nên vế khoá đo bằng **tổng** `lockedStakeable + staked`, không cần biết ô nào là
 * quỹ nào — không đặc cách theo tên, vì tên đổi được còn phép cộng thì không.
 *
 * Dùng:
 *   node scripts/check-keys-on-chain.mjs C:/Users/abc/9chain-a1-keys/g0/allocation.md
 *   node scripts/check-keys-on-chain.mjs <allocation.md> --rpc https://rpc-a1.9chain.org
 *   node scripts/check-keys-on-chain.mjs --self-test      # đối chứng ngược, 4 ca PHẢI ra ĐỎ
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { A1_GEN, A1_ID_GOC } from "../local-net/lib/chainid.mjs";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const lay = (co, mac) => {
  const i = argv.indexOf(co);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : mac;
};
const RPC = lay("--rpc", "https://rpc-a1.9chain.org");
const TU_KIEM = argv.includes("--self-test");
const duongDan = argv.find((a) => !a.startsWith("--") && a !== RPC);

const NANO = 1_000_000_000n; // LOVE9 có 9 chữ số thập phân trên X/P
const WEI = 1_000_000_000_000_000_000n; // C-Chain dùng 18 như mọi EVM

/* ─────────────────────────── đọc allocation.md ─────────────────────────── */

/**
 * Cột trong bảng (theo `netgen`):
 * 0 Hạng mục · 1 Quỹ · 2 % · 3 Tổng · 4 X/P thanh khoản · 5 X/P khoá · 6 Mở khoá ·
 * 7 C-Chain · 8 Địa chỉ X · 9 Địa chỉ EVM
 */
function docAllocation(p) {
  const txt = readFileSync(p, "utf8");

  const mNet = txt.match(/networkID\s+(\d+)/);
  if (!mNet) throw new Error(`không thấy "networkID <số>" ở đầu ${p}`);

  const so = (s) => BigInt(String(s).replace(/[,\s]/g, "") || "0");
  const quy = [];
  for (const dong of txt.split(/\r?\n/)) {
    if (!dong.startsWith("|")) continue;
    const c = dong.split("|").slice(1, -1).map((x) => x.trim());
    if (c.length < 10) continue;
    const mX = c[8].match(/X-love9[0-9a-z]+/);
    const mE = c[9].match(/0x[0-9a-fA-F]{40}/);
    if (!mX || !mE) continue; // dòng tiêu đề / dòng gạch
    quy.push({
      ten: c[1],
      // giữ nguyên thang LOVE9 để cộng lại được với ô `Tổng` — đổi thang rồi mới cộng
      // là đúng lớp lỗi "số chép sang thang khác" đã ghi trong HANDOFF.
      tongKhai: so(c[3]),
      thanhKhoanKhai: so(c[4]),
      khoaKhai: so(c[5]),
      cChainKhai: so(c[7]),
      thanhKhoan: so(c[4]) * NANO,
      khoa: so(c[5]) * NANO,
      cChain: so(c[7]) * WEI,
      x: mX[0],
      p: "P-" + mX[0].slice(2),
      evm: mE[0],
    });
  }
  if (!quy.length) throw new Error(`không đọc được dòng quỹ nào trong ${p}`);
  return { networkID: Number(mNet[1]), quy };
}

/* ─────────────────────────────── đo trên chain ─────────────────────────── */

async function rpc(duong, method, params) {
  const r = await fetch(RPC + duong, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!r.ok) throw new Error(`${duong} ${method} → HTTP ${r.status}`);
  const j = await r.json();
  if (j.error) throw new Error(`${method}: ${j.error.message}`);
  return j.result;
}

async function doMotQuy(q) {
  const [bal, stake, cGenesis, xBal] = await Promise.all([
    rpc("/ext/bc/P", "platform.getBalance", { addresses: [q.p] }),
    rpc("/ext/bc/P", "platform.getStake", { addresses: [q.p] }),
    rpc("/ext/bc/C/rpc", "eth_getBalance", [q.evm, "0x0"]),
    rpc("/ext/bc/X", "avm.getBalance", { address: q.x, assetID: "LOVE9" }),
  ]);
  return {
    khoaDo: BigInt(bal.lockedStakeable) + BigInt(stake.staked),
    cChainDo: BigInt(cGenesis),
    thanhKhoanDo: BigInt(xBal.balance) + BigInt(bal.unlocked),
  };
}

const nl = (n) => (n / NANO).toLocaleString("en-US");
const wl = (n) => (n / WEI).toLocaleString("en-US");

/* ────────────────────────────── một lượt kiểm ──────────────────────────── */

async function kiem(p, { im = false } = {}) {
  const loi = [];
  const noi = (s) => { if (!im) console.log(s); };

  const { networkID, quy } = docAllocation(p);
  const [tenMang, idMang] = await Promise.all([
    rpc("/ext/info", "info.getNetworkName", {}).then((r) => r.networkName),
    rpc("/ext/info", "info.getNetworkID", {}).then((r) => Number(r.networkID)),
  ]);

  noi(`check-keys-on-chain — ${p}`);
  noi(`  tệp khai networkID ${networkID} · chain đang chạy ${idMang} (${tenMang}) · ${quy.length} quỹ\n`);

  // 🔴 Cổng đầu tiên và rẻ nhất: bộ khoá của thế hệ khác thì dừng ngay, đừng đo tiếp.
  //    Đây đúng là ca `kiem-khoa` chỉ CẢNH BÁO rồi vẫn thoát 0.
  if (networkID !== idMang) {
    loi.push(`networkID lệch: tệp khai ${networkID}, chain đang chạy ${idMang}`);
    noi(`  🔴 networkID LỆCH — bộ khoá này thuộc THẾ HỆ KHÁC, không phải mạng đang chạy.\n`);
  }

  for (const q of quy) {
    const d = await doMotQuy(q);
    const xau = [];

    // 🔴 Ô `Tổng` KHÔNG đo được trên chain — nó là tổng của ba ô kia. Nhưng nó lại là ô
    //    người ta ĐỌC và trích ra ngoài. Bỏ trống nó là để một con số công bố sai đi qua
    //    cổng mà không ô nào mâu thuẫn. Đối chứng ngược đã bắt đúng chỗ này.
    const tongCong = q.thanhKhoanKhai + q.khoaKhai + q.cChainKhai;
    if (q.tongKhai !== tongCong) {
      xau.push(`ô Tổng tự mâu thuẫn: khai ${q.tongKhai.toLocaleString("en-US")} · ` +
        `lỏng+khoá+C = ${tongCong.toLocaleString("en-US")}`);
    }

    if (d.khoaDo !== q.khoa) xau.push(`khoá khai ${nl(q.khoa)} · đo ${nl(d.khoaDo)}`);
    if (d.cChainDo !== q.cChain) xau.push(`C-Chain@block0 khai ${wl(q.cChain)} · đo ${wl(d.cChainDo)}`);
    if (q.thanhKhoan > 0n && d.thanhKhoanDo === 0n) xau.push(`thanh khoản khai ${nl(q.thanhKhoan)} · đo 0`);
    if (d.thanhKhoanDo > q.thanhKhoan) xau.push(`thanh khoản đo ${nl(d.thanhKhoanDo)} > khai ${nl(q.thanhKhoan)}`);

    noi(
      `  ${xau.length ? "✗" : "✓"} ${q.ten.padEnd(28)} ` +
        `khoá ${nl(d.khoaDo).padStart(13)} · C@0 ${wl(d.cChainDo).padStart(13)} · lỏng ${nl(d.thanhKhoanDo).padStart(11)}`
    );
    for (const s of xau) { noi(`      🔴 ${s}`); loi.push(`${q.ten}: ${s}`); }
  }

  noi("");
  if (loi.length) noi(`🔴 ${loi.length} lệch — bộ khoá này KHÔNG khớp mạng đang chạy.`);
  else noi(`✓ ${quy.length}/${quy.length} quỹ khớp CHAIN ĐANG CHẠY — khoá khoá/C-Chain khớp từng đơn vị.`);
  return loi;
}

/* ─────────────────────── đối chứng ngược (--self-test) ───────────────────── */

/**
 * Luật cứng số 2 của repo: **cổng chưa ai thấy nó ĐỎ thì mới kiểm được một nửa.**
 * Bốn ca dưới đây đều PHẢI ra đỏ. Ca 1 là ca thật — bộ khoá đã chết còn nằm trên máy dev.
 */
async function tuKiem() {
  const { writeFileSync, mkdtempSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const tmp = mkdtempSync(path.join(tmpdir(), "o1-tukiem-"));
  const that = path.join(GOC, "local-net/net-public/allocation.md");
  const goc = path.join(process.env.USERPROFILE || process.env.HOME, "9chain-a1-keys/g0/allocation.md");

  const ca = [];
  if (existsSync(that)) {
    ca.push(["🔴 CA THẬT — bộ khoá thế hệ 9001 đã chết (bộ `kiem-khoa` chấm 6/6 ✓)", that]);
  }
  if (existsSync(goc)) {
    const txt = readFileSync(goc, "utf8");
    const v = (ten, sua) => {
      const f = path.join(tmp, ten);
      writeFileSync(f, sua);
      return f;
    };
    // 🔴 This mutation used to hard-code `999999998`. That number BECAME the live networkID at
    // the g0 -> g1 bump, so the case stopped saying "another generation" and started saying
    // "the live one" — the control would have gone green and been read as the gate weakening.
    // Third file this session carrying the same literal (see `check-net-dirs.mjs`,
    // `wallet-over-tunnel.mjs`). ⇒ Derive a networkID that is in the REAL band, is NOT live,
    // and is NOT the one the fixture already declares.
    const idSong = A1_ID_GOC - A1_GEN;
    const idKhai = Number(/networkID\s+(\d+)/.exec(txt)?.[1] ?? -1);
    let idKhac = idSong - 1;
    while (idKhac === idKhai || idKhac === idSong) idKhac -= 1;
    ca.push([
      `networkID đúng khuôn nhưng của thế hệ khác (${idKhac}, mạng sống là ${idSong})`,
      v("net.md", txt.replace(/networkID\s+\d+/, `networkID ${idKhac}`)),
    ]);
    ca.push([
      "một địa chỉ EVM bị tráo (khuôn vẫn hợp lệ)",
      v("addr.md", txt.replace(/0xf408235C570d8e213F94FbdAE4a90df66C27216d/, "0x1111111111111111111111111111111111111111")),
    ]);
    // 🔴 `2,600,000,001` xuất hiện HAI lần trong cùng dòng — ô `Tổng` rồi mới tới ô `khoá`.
    //    Lượt đầu tôi viết `replace(...)` trơn: nó thay ô ĐẦU, tức thay `Tổng`, và ca đối
    //    chứng ra XANH. Cổng không sai — **ca kiểm bắn nhầm ô**. Nhưng chính vì bắn nhầm mà
    //    lộ ra ô `Tổng` không được canh gì cả. Nay tách làm hai ca, mỗi ca nói một chuyện.
    const thayLanThu = (s, tim, thay, n) => {
      let i = -1;
      return s.replace(new RegExp(tim.replace(/,/g, ","), "g"), (m) => (++i === n ? thay : m));
    };
    ca.push([
      "một ô KHOÁ lệch đúng 1 LOVE9 (đo được trên chain)",
      v("khoa.md", thayLanThu(txt, "2,600,000,001", "2,600,000,002", 1)),
    ]);
    ca.push([
      "ô TỔNG lệch 1 LOVE9 — không chain nào bác được, chỉ phép cộng bác được",
      v("tong.md", thayLanThu(txt, "2,600,000,001", "2,600,000,002", 0)),
    ]);
  }

  if (!ca.length) {
    console.log("🔴 không dựng được ca đối chứng nào — thiếu cả allocation.md của g0 lẫn bộ đã chết.");
    process.exit(1);
  }

  console.log("══ ĐỐI CHỨNG NGƯỢC — mỗi ca dưới đây PHẢI ra đỏ ══\n");
  let hong = 0;
  for (const [ten, p] of ca) {
    let loi = [];
    try { loi = await kiem(p, { im: true }); } catch (e) { loi = [String(e.message)]; }
    if (loi.length) console.log(`  ✓ ${ten}\n      → bắt được (${loi.length} lệch): ${loi[0]}`);
    else { console.log(`  🔴 ${ten}\n      → KHÔNG bắt được — cổng này không phân biệt được gì.`); hong++; }
  }
  console.log();
  if (hong) { console.log(`🔴 ${hong}/${ca.length} ca đối chứng KHÔNG đỏ.`); process.exit(1); }
  console.log(`✓ ${ca.length}/${ca.length} ca đối chứng đỏ đúng chỗ — cổng phân biệt được bản sống với bản chết.`);
}

/* ──────────────────────────────── chạy ─────────────────────────────────── */

if (TU_KIEM) {
  await tuKiem();
} else if (!duongDan) {
  console.log("dùng: node scripts/check-keys-on-chain.mjs <đường-dẫn/allocation.md> [--rpc URL]");
  console.log("      node scripts/check-keys-on-chain.mjs --self-test");
  process.exit(2);
} else {
  if (!existsSync(duongDan)) { console.log(`🔴 không thấy tệp: ${duongDan}`); process.exit(1); }
  const loi = await kiem(duongDan);
  if (loi.length) process.exit(1);
  console.log("\n⚠️  Lệnh này KHÔNG kiểm khoá riêng — nó chỉ đọc địa chỉ.");
  console.log("   Vòng chỉ khép khi CHẠY CẢ HAI, trên CÙNG một thư mục:");
  console.log("     1) check-keys -allocation allocation.md keys.txt  → khoá suy ra đúng địa chỉ");
  console.log("     2) lệnh này                                       → địa chỉ đó giữ tiền thật");
}
