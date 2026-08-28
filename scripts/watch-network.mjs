#!/usr/bin/env node
/**
 * watch-network.mjs — **một lệnh đo mạng đang chạy**, thay cho "phải nhớ tự đo".
 *
 * ═══ VÌ SAO CÓ ═══
 *
 * Tới `2026-08-28`, hai thứ có thể **giết mạng** đều đang được canh bằng trí nhớ:
 *
 * 1. **Số dư `chain-factory`.** `HANDOFF.md` tự khai: *"chưa có giám sát, phải nhớ tự đo"*.
 *    Ví cạn ⇒ đẻ chain **chết câm** — không lỗi to, chỉ là một lượt tạo hỏng.
 * 2. **B-12 — hạn validator.** 9 validator hết hạn lần lượt trong một cửa sổ **56 ngày**;
 *    **node cuối rụng là mạng DỪNG**. `BLOCKERS.md` ghi *"cần David dựng lịch nhắc"* — tức
 *    một mốc sống trong đầu người, cho một sự kiện cách đây gần một năm.
 *
 * 🔴 Và ngày hết hạn **chỉ đọc được bằng phép đo**: `platform.getCurrentValidators` →
 * `endTime`. `BLOCKERS.md` dặn thẳng *"đừng tính tay"* — vì mốc thật phụ thuộc
 * `InitialStakeDurationOffset` (so le 7 ngày, **cố ý**) và giờ sinh genesis.
 *
 * ⇒ Tệp này biến cả hai từ **việc phải nhớ** thành **một lệnh có mã thoát**.
 *
 * ═══ BA MÃ THOÁT — cùng họ với `o1-check.mjs` ═══
 *   0  mọi mục đo được và đạt
 *   1  có mục ĐỎ
 *   2  có mục **không đo được** — *không biết* KHÔNG phải *đạt*
 *
 * ⚠️ **Chỉ đọc.** Không gửi giao dịch, không ghi gì lên server, không đụng mạng.
 *
 * Dùng:
 *   node scripts/watch-network.mjs
 *   node scripts/watch-network.mjs --khong-ssh     # bỏ các mục cần ssh (supplyCap, drift)
 *   node scripts/watch-network.mjs --tu-kiem       # đối chứng ngược
 */
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { A1_GEN, NETWORK_ID, TEN_MANG } from "../local-net/lib/chainid.mjs";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const lay = (co, mac) => { const i = argv.indexOf(co); return i >= 0 && argv[i + 1] ? argv[i + 1] : mac; };
const RPC = lay("--rpc", "https://rpc-a1.9chain.org");
const WEB = lay("--web", "https://a1.9chain.org");
const HOST = lay("--host", ""$A1_SSH_HOST"");
const KHOA = lay("--key", `${process.env.HOME || process.env.USERPROFILE}/.ssh/9chain-a1`);
const KHONG_SSH = argv.includes("--khong-ssh");
const VI_FACTORY = lay("--vi", "P-love91vgh2whn746dzzvg0dj4w9rsqvlalcldvpueuvj");

// ─── Ngưỡng — khai ở MỘT chỗ, và bài đối chứng lái được chúng ───
export const NGUONG = {
  soNodeMongDoi: 9,
  // B-12: node ĐẦU rụng ở ~ngày 309, còn 8 node chạy ⇒ có ~56 ngày để phản ứng.
  // Vàng ở 120 ngày là để lời nhắc đến **trước** khi cần gấp; đỏ ở 45 vì gia hạn
  // validator không phải việc làm trong một buổi chiều.
  ngayHetHanVang: 120,
  ngayHetHanDo: 45,
  // Một lượt đẻ chain tiêu ~0,1 LOVE9 (đo D-091). Vàng ở 10 = còn ~100 lượt.
  factoryVang: 10,
  factoryDo: 1,
};

/** Một mục đo: `do` là giá trị đo được (null = KHÔNG đo được). */
const muc = (ten, doDuoc, cham, ghiChu = "") => ({ ten, do: doDuoc, cham, ghiChu });

/**
 * CHẤM ĐIỂM — hàm thuần, bài đối chứng gọi được mà không cần mạng.
 * Trả `{ ma, dong[] }`. 🔴 `do === null` ⇒ **"không đo được"**, không bao giờ là ✓.
 */
export function chamDiem(mucs) {
  const dong = [];
  let coDo = false, coKhongDo = false;
  for (const m of mucs) {
    if (m.do === null || m.do === undefined) {
      coKhongDo = true;
      dong.push({ bieu: "🟡", ten: m.ten, gt: "KHÔNG ĐO ĐƯỢC", ghiChu: m.ghiChu });
      continue;
    }
    const kq = m.cham(m.do);           // "dat" | "vang" | "do"
    if (kq === "do") coDo = true;
    dong.push({ bieu: kq === "dat" ? "✓" : kq === "vang" ? "⚠️ " : "🔴", ten: m.ten, gt: String(m.do), ghiChu: m.ghiChu });
  }
  // Thứ tự: ĐỎ trước, rồi KHÔNG ĐO ĐƯỢC. Một mục đỏ đã biết quan trọng hơn một mục chưa biết.
  return { ma: coDo ? 1 : coKhongDo ? 2 : 0, dong };
}

async function rpc(duong, method, params = {}) {
  const r = await fetch(RPC + duong, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(20_000),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message);
  return j.result;
}
const thu = async (f) => { try { return await f(); } catch { return null; } };

function sshDoc(lenh) {
  if (KHONG_SSH) return null;
  try {
    return execFileSync("ssh",
      ["-o", "BatchMode=yes", "-o", "ConnectTimeout=20", "-i", KHOA, HOST, lenh],
      { encoding: "utf8", timeout: 60_000 }).trim();
  } catch { return null; }
}

/** `SupplyCap` mà REPO khai (đọc thẳng Go) — để so với thứ NODE ĐANG CHẠY in ra. */
function supplyCapTuGo() {
  try {
    const src = readFileSync(path.join(GOC, "upstream/avalanchego/genesis/genesis_9chain_a1.go"), "utf8");
    const m = src.match(/^\s*SupplyCap:\s*([0-9_]+)\s*\*\s*units\.(Avax|KiloAvax|MegaAvax)\s*,/m);
    if (!m) return null;
    const he = { Avax: 1n, KiloAvax: 1_000n, MegaAvax: 1_000_000n }[m[2]];
    return (BigInt(m[1].replace(/_/g, "")) * he * 1_000_000_000n).toString();
  } catch { return null; }
}

async function doMang() {
  const ngay = (giay) => Math.round((giay * 1000 - Date.now()) / 86_400_000);

  const ten = await thu(() => rpc("/ext/info", "info.getNetworkName").then((r) => r.networkName));
  const nid = await thu(() => rpc("/ext/info", "info.getNetworkID").then((r) => Number(r.networkID)));
  const peers = await thu(() => rpc("/ext/info", "info.peers").then((r) => Number(r.numPeers)));
  const vals = await thu(() => rpc("/ext/bc/P", "platform.getCurrentValidators").then((r) => r.validators));
  const soDu = await thu(() => rpc("/ext/bc/P", "platform.getBalance", { addresses: [VI_FACTORY] })
    .then((r) => Number(BigInt(r.unlocked) / 1_000_000n) / 1000));
  const capNode = sshDoc(
    `docker exec 9chain-a1-node-1 sh -c 'grep -rho "supplyCap[^,]*" /root/.avalanchego/logs | head -1'`,
  );
  const capRepo = supplyCapTuGo();
  const faucet = await thu(async () => {
    const r = await fetch(`${WEB}/faucet/api/supply`, { signal: AbortSignal.timeout(20_000) });
    const j = await r.json();
    return j?.xpCurrentSupply ? "có số đo" : "thiếu trường đo";
  });
  const consoleOk = await thu(async () => {
    const r = await fetch(`${WEB}/console/whoami`, { signal: AbortSignal.timeout(20_000) });
    return r.status;
  });

  const hanSom = vals?.length ? Math.min(...vals.map((v) => Number(v.endTime))) : null;

  return [
    muc("tên mạng ↔ A1_GEN của repo", ten,
      (v) => (v === TEN_MANG ? "dat" : "do"), `repo dựng cho g${A1_GEN} = "${TEN_MANG}"`),
    muc("networkID ↔ A1_GEN của repo", nid,
      (v) => (v === NETWORK_ID ? "dat" : "do"), `repo mong ${NETWORK_ID}`),
    muc("số validator", vals?.length ?? null,
      (v) => (v === NGUONG.soNodeMongDoi ? "dat" : "do"), `mong ${NGUONG.soNodeMongDoi}`),
    muc("peer node-1 thấy", peers,
      (v) => (v >= NGUONG.soNodeMongDoi - 1 ? "dat" : "do"), `mong ≥ ${NGUONG.soNodeMongDoi - 1}`),
    muc("B-12 · validator hết hạn sớm nhất (ngày nữa)", hanSom === null ? null : ngay(hanSom),
      (v) => (v <= NGUONG.ngayHetHanDo ? "do" : v <= NGUONG.ngayHetHanVang ? "vang" : "dat"),
      hanSom ? new Date(hanSom * 1000).toISOString().slice(0, 10) : ""),
    muc("số dư chain-factory (LOVE9)", soDu,
      (v) => (v <= NGUONG.factoryDo ? "do" : v <= NGUONG.factoryVang ? "vang" : "dat"),
      "cạn ⇒ đẻ chain chết câm"),
    muc("supplyCap TRÊN NODE ĐANG CHẠY ↔ repo", capNode === null || capRepo === null ? null : capNode,
      (v) => (capRepo && v.includes(capRepo) ? "dat" : "do"), `repo khai ${capRepo ?? "?"}`),
    muc("faucet /api/supply", faucet, (v) => (v === "có số đo" ? "dat" : "do")),
    muc("console /whoami", consoleOk, (v) => (v === 200 ? "dat" : "do")),
  ];
}

// ═════ ĐỐI CHỨNG NGƯỢC ═════
function tuKiem() {
  const ca = [
    ["mọi mục đạt ⇒ 0", [muc("a", 1, () => "dat")], 0],
    ["một mục ĐỎ ⇒ 1", [muc("a", 1, () => "dat"), muc("b", 1, () => "do")], 1],
    ["một mục VÀNG ⇒ vẫn 0 (cảnh báo không phải hỏng)", [muc("a", 1, () => "vang")], 0],
    ["🔴 một mục KHÔNG ĐO ĐƯỢC ⇒ 2, KHÔNG phải 0", [muc("a", null, () => "dat")], 2],
    ["đỏ + không đo được ⇒ 1 (đã biết hỏng quan trọng hơn chưa biết)",
      [muc("a", null, () => "dat"), muc("b", 1, () => "do")], 1],
    ["do = 0 vẫn là ĐO ĐƯỢC, không phải null", [muc("a", 0, (v) => (v === 0 ? "dat" : "do"))], 0],
  ];
  let hong = 0;
  console.log("══ ĐỐI CHỨNG NGƯỢC — chấm điểm ══");
  for (const [ten, mucs, mong] of ca) {
    const { ma } = chamDiem(mucs);
    if (ma === mong) console.log(`  ✓ ${ten}`);
    else { console.log(`  ✗ ${ten} — mong ${mong}, ra ${ma}`); hong++; }
  }
  console.log("\n══ ĐỐI CHỨNG NGƯỠNG B-12 (ngày còn lại → màu) ══");
  const chamHan = (v) => (v <= NGUONG.ngayHetHanDo ? "do" : v <= NGUONG.ngayHetHanVang ? "vang" : "dat");
  for (const [ngay, mong] of [[309, "dat"], [121, "dat"], [119, "vang"], [46, "vang"], [44, "do"], [0, "do"], [-5, "do"]]) {
    const ra = chamHan(ngay);
    if (ra === mong) console.log(`  ✓ còn ${ngay} ngày ⇒ ${mong}`);
    else { console.log(`  ✗ còn ${ngay} ngày ⇒ mong ${mong}, ra ${ra}`); hong++; }
  }
  return hong;
}

if (argv.includes("--tu-kiem")) {
  const hong = tuKiem();
  console.log(`\n${hong ? "✗" : "✅"} ${hong} ca sai`);
  process.exit(hong ? 1 : 0);
}

const mucs = await doMang();
const { ma, dong } = chamDiem(mucs);
console.log(`\n══ CANH MẠNG — ${RPC} · ${new Date().toISOString()} ══\n`);
for (const d of dong) {
  console.log(`  ${d.bieu} ${d.ten.padEnd(44)} ${d.gt}${d.ghiChu ? `   (${d.ghiChu})` : ""}`);
}
const nhan = { 0: "✅ MẠNG BÌNH THƯỜNG", 1: "🔴 CÓ MỤC ĐỎ", 2: "🟡 CÓ MỤC KHÔNG ĐO ĐƯỢC — không biết KHÔNG phải đạt" };
console.log(`\n${nhan[ma]}`);
if (KHONG_SSH) console.log("   (chạy với --khong-ssh: các mục cần ssh đã bị bỏ, không phải 'đạt')");
process.exit(ma);
