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
 * ═══ 🔴 WHICH VALIDATORS (changed 2026-09-03, the evening the first outsider staked) ═══
 *
 * Until then "every validator" and "the nine nodes this project runs" were the same set, and this
 * gate measured the first while meaning the second. The first guest staked for 14 days from a node
 * behind NAT — following the guide to the letter — and this gate went red twice for it:
 * "validators 10, expected 9" and "B-12 earliest expiry 14 days". Neither is B-12. B-12 is the
 * network STOPPING when the last FOUNDING term ends; a guest's term ending stops nothing.
 *
 * ⇒ Headcount and B-12 are scored over the FOUNDING SET (`initialStakers` of the tracked
 *   genesis, via `local-net/lib/genesis-stakers.mjs`). Guests get their own line: counted,
 *   warned about when they are not earning (uptime under the reward floor), never a red here —
 *   a guest who cannot earn is a defect of the ONBOARDING PATH, and that is what the line says.
 *
 * Dùng:
 *   node scripts/watch-network.mjs
 *   node scripts/watch-network.mjs --no-ssh     # bỏ các mục cần ssh (supplyCap, drift)
 *   node scripts/watch-network.mjs --self-test       # đối chứng ngược
 */
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { A1_GEN, NETWORK_ID, TEN_MANG } from "../local-net/lib/chainid.mjs";
import { SSH_HOST, SSH_KEY } from "../local-net/lib/server.mjs";
import { VI_FACTORY_THEO_THE_HE } from "../local-net/lib/factory-wallets.mjs";
import { genesisStakerIDs, partitionByFounding } from "../local-net/lib/genesis-stakers.mjs";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const lay = (co, mac) => { const i = argv.indexOf(co); return i >= 0 && argv[i + 1] ? argv[i + 1] : mac; };
const RPC = lay("--rpc", "https://rpc-a1.9chain.org");
const WEB = lay("--web", "https://a1.9chain.org");
const HOST = lay("--host", SSH_HOST);
const KHOA = lay("--ssh-key", SSH_KEY);
const KHONG_SSH = argv.includes("--no-ssh");
// The per-generation `chain-factory` wallet. Moved to its own module 2026-09-01: this file is a
// SCRIPT, so a second reader importing it to borrow the table would run the whole gate and then
// hit `process.exit`. The rationale for the map travels with the map — see the module.
const VI_FACTORY = lay("--wallet", VI_FACTORY_THEO_THE_HE[A1_GEN] ?? null);

// ─── Ngưỡng — khai ở MỘT chỗ, và bài đối chứng lái được chúng ───
export const NGUONG = {
  // FOUNDING nodes expected in the validator set — the `initialStakers` of genesis, not the
  // total headcount. Guests raise the total and must not move this number (see header).
  soNodeMongDoi: 9,
  // B-12: node ĐẦU rụng ở ~ngày 309, còn 8 node chạy ⇒ có ~56 ngày để phản ứng.
  // Vàng ở 120 ngày là để lời nhắc đến **trước** khi cần gấp; đỏ ở 45 vì gia hạn
  // validator không phải việc làm trong một buổi chiều.
  ngayHetHanVang: 120,
  ngayHetHanDo: 45,
  // Uptime below this earns nothing — the network's own reward floor, quoted in
  // `docs/RUN-A-VALIDATOR.md` ("Rewards require 80%"). A guest under it is a WARNING, not a red:
  // the network is fine, the guest is not, and the onboarding path is what let that happen.
  uptimeThuongToiThieu: 80,
  /**
   * 🔴 THIS BALANCE IS NOT A CAPACITY, AND THIS COMMENT USED TO SAY IT WAS.
   *
   * It read: "one chain creation costs ~0.1 LOVE9 (D-091), so yellow at 10 = ~100 left."
   * Both halves were wrong by 2026-09-03, and this file is what people actually read — so the
   * wrong halves were the ones being quoted.
   *
   * ① **The 0.1 is the PRE-ETNA STATIC fee and is no longer charged.** `info.getTxFee` still
   *    advertises `createSubnetTxFee: 0.1` and `createBlockchainTxFee: 0.1`, but P-Chain has
   *    used DYNAMIC fees since Etna. Measured on g1 when the first L1 was created
   *    (2026-09-03): **0.00023015 LOVE9** for the whole creation — about 869x less than the
   *    static schedule predicts. `docs/PROGRESS.md` had already measured 0.000141468 on the dev
   *    network and written "the static numbers are no longer used" — weeks before this comment
   *    kept quoting them. A fact recorded in one place does not fix a number left in another.
   *
   * ② 🔴 **The binding limit is not money at all.** `local-net/console/server.mjs` refuses at
   *    `MAX_L1` (15) because `TRAN_SUBNET_GIAO_THUC` is 16: a node declaring more than 16
   *    subnets at handshake is dropped by EVERY peer — the network breaks, it does not slow
   *    down. So the ceiling is ~15 chains, while this wallet at 999 LOVE9 could pay for
   *    millions. Reading capacity off this balance overstates it by five orders of magnitude.
   *    Raising it means changing the architecture (per-L1 validator sets / ACP-77), not a number.
   *
   * ⇒ The thresholds below stay where they are. They are a "the wallet is running dry" alarm
   *   and nothing more, and at the measured price they are enormously conservative — which is
   *   the safe direction for an alarm. What changed is that they no longer claim to say how
   *   many chains are left, because they never could.
   */
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

/**
 * Split the live validator set into founders and guests and read off what each line scores on.
 * Pure — the reverse controls drive it with fixtures.
 *
 * Returns `null` fields for "could not read" so the caller scores them as NOT MEASURED (exit 2),
 * never as passed. `guestsNotEarning` names guests under the reward floor or not connected to the
 * node asked: those are the guests the onboarding path failed, and the warning says so.
 */
export function assessValidatorSet(validators, foundingIDs, nowMs = Date.now()) {
  if (!Array.isArray(validators)) {
    return { foundersPresent: null, missingFounders: [], guests: [], guestsNotEarning: [], earliestFounderEndDays: null, earliestGuestEndDays: null };
  }
  const days = (sec) => Math.round((Number(sec) * 1000 - nowMs) / 86_400_000);
  const { founders, guests, missingFounders } = partitionByFounding(validators, foundingIDs);
  const guestsNotEarning = guests.filter((g) => g.connected === false || Number(g.uptime) < NGUONG.uptimeThuongToiThieu);
  const earliest = (rows) => (rows.length ? days(Math.min(...rows.map((v) => Number(v.endTime)))) : null);
  return {
    foundersPresent: founders.length,
    missingFounders,
    guests,
    guestsNotEarning,
    earliestFounderEndDays: earliest(founders),
    earliestGuestEndDays: earliest(guests),
  };
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
  const ten = await thu(() => rpc("/ext/info", "info.getNetworkName").then((r) => r.networkName));
  const nid = await thu(() => rpc("/ext/info", "info.getNetworkID").then((r) => Number(r.networkID)));
  const peers = await thu(() => rpc("/ext/info", "info.peers").then((r) => Number(r.numPeers)));
  const vals = await thu(() => rpc("/ext/bc/P", "platform.getCurrentValidators").then((r) => r.validators));
  // No declared address for this generation => null => scored "could not measure" => exit 2.
  // Asking the chain about the PREVIOUS generation's wallet would answer 0 and look like a
  // measurement. See VI_FACTORY_THEO_THE_HE.
  const soDu = VI_FACTORY === null ? null
    : await thu(() => rpc("/ext/bc/P", "platform.getBalance", { addresses: [VI_FACTORY] })
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

  // 🔴 The founding set comes from the tracked genesis and a missing artefact THROWS: an unknown
  // founding set must not score as "no founders" (see genesis-stakers.mjs).
  const founding = genesisStakerIDs();
  const set = assessValidatorSet(vals, founding);
  const guestNote = set.guests.length === 0
    ? "no guest validators yet"
    : `${set.guests.length} guest(s); ${set.guestsNotEarning.length} not earning (disconnected or uptime < ${NGUONG.uptimeThuongToiThieu}%)`
      + (set.guestsNotEarning.length ? `: ${set.guestsNotEarning.map((g) => `${g.nodeID} uptime ${Number(g.uptime).toFixed(1)}%`).join(", ")}` : "")
      + (set.earliestGuestEndDays !== null ? ` · earliest guest term ends in ${set.earliestGuestEndDays} day(s)` : "");

  return [
    muc("tên mạng ↔ A1_GEN của repo", ten,
      (v) => (v === TEN_MANG ? "dat" : "do"), `repo dựng cho g${A1_GEN} = "${TEN_MANG}"`),
    muc("networkID ↔ A1_GEN của repo", nid,
      (v) => (v === NETWORK_ID ? "dat" : "do"), `repo mong ${NETWORK_ID}`),
    muc("founding validators present", set.foundersPresent,
      (v) => (v === NGUONG.soNodeMongDoi ? "dat" : "do"),
      set.missingFounders.length
        ? `expected ${NGUONG.soNodeMongDoi}; MISSING ${set.missingFounders.join(", ")}`
        : `expected ${NGUONG.soNodeMongDoi} (genesis initialStakers); total in set ${vals?.length ?? "?"}`),
    muc("guest validators (not in genesis)", vals ? set.guests.length : null,
      () => (set.guestsNotEarning.length ? "vang" : "dat"), guestNote),
    muc("peer node-1 thấy", peers,
      (v) => (v >= NGUONG.soNodeMongDoi - 1 ? "dat" : "do"), `mong ≥ ${NGUONG.soNodeMongDoi - 1}`),
    muc("B-12 · earliest FOUNDING term end (days)", set.earliestFounderEndDays,
      (v) => (v <= NGUONG.ngayHetHanDo ? "do" : v <= NGUONG.ngayHetHanVang ? "vang" : "dat"),
      set.earliestFounderEndDays === null ? "" : "founders only — a guest's term ending stops nothing"),
    muc("số dư chain-factory (LOVE9)", soDu,
      (v) => (v <= NGUONG.factoryDo ? "do" : v <= NGUONG.factoryVang ? "vang" : "dat"),
      VI_FACTORY === null
        ? `no factory wallet declared for g${A1_GEN}; measure another one with --wallet <P-addr>`
        : "empty ⇒ chain creation dies silently. NOT a capacity: the ceiling is MAX_L1 (15), set by the P2P subnet limit, not by this balance"),
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

  // ── founders vs guests: the population B-12 and the headcount are scored over ──
  // Fixture = the shape measured on g1 on 2026-09-03 20:1xZ: nine founders 306–362 days out, one
  // guest 14 days out, disconnected, uptime 14.6%. Before this change the gate read that as
  // "10 validators, expected 9" and "B-12: 14 days" — two reds, neither about the network.
  console.log("\n══ REVERSE CONTROLS — founding set vs guests ══");
  const NOW = Date.UTC(2026, 8, 3, 20, 0, 0);
  const at = (d) => (NOW + d * 86_400_000) / 1000;
  const founders = Array.from({ length: 9 }, (_, i) => ({ nodeID: `NodeID-F${i}`, endTime: at(306 + 7 * i), connected: true, uptime: 99.99 }));
  const FOUNDING = new Set(founders.map((f) => f.nodeID));
  const guest14 = { nodeID: "NodeID-GUEST", endTime: at(14), connected: false, uptime: 14.57 };
  const chk = (label, got, want) => {
    if (got === want) console.log(`  ✓ ${label}`);
    else { console.log(`  ✗ ${label} — expected ${want}, got ${got}`); hong++; }
  };
  const live = assessValidatorSet([...founders, guest14], FOUNDING, NOW);
  chk("🔴 THE 2026-09-03 SHAPE — 9 founders + 1 guest: founders present is 9, not 10", live.foundersPresent, 9);
  chk("🔴 … and B-12 reads the earliest FOUNDER (306 d), not the guest (14 d)", live.earliestFounderEndDays, 306);
  chk("… the guest's 14 days is reported on its own line", live.earliestGuestEndDays, 14);
  chk("… a disconnected guest at 14.6% uptime is named as not earning", live.guestsNotEarning.length, 1);
  chk("… the gate stays GREEN on that shape (B-12 threshold on 306 d)", chamHan(live.earliestFounderEndDays), "dat");
  const noGuest = assessValidatorSet(founders, FOUNDING, NOW);
  chk("no guests ⇒ zero guests, zero not earning", `${noGuest.guests.length}/${noGuest.guestsNotEarning.length}`, "0/0");
  const oneGone = assessValidatorSet([...founders.slice(1), guest14], FOUNDING, NOW);
  chk("🔴 a founder MISSING is still counted — 8 present, and the guest does not fill the seat", oneGone.foundersPresent, 8);
  chk("🔴 … and the missing founder is NAMED, because absence is what a filter cannot show", oneGone.missingFounders.join(","), "NodeID-F0");
  const shortFounder = assessValidatorSet([{ ...founders[0], endTime: at(30) }, ...founders.slice(1)], FOUNDING, NOW);
  chk("🔴 a FOUNDER at 30 days is still RED — the founding population is what B-12 is about", chamHan(shortFounder.earliestFounderEndDays), "do");
  const earningGuest = assessValidatorSet([...founders, { ...guest14, connected: true, uptime: 95 }], FOUNDING, NOW);
  chk("a connected guest above the reward floor is not flagged", earningGuest.guestsNotEarning.length, 0);
  chk("🔴 an unreadable validator set is NOT MEASURED (null), never zero founders", assessValidatorSet(null, FOUNDING, NOW).foundersPresent, null);
  return hong;
}

if (argv.includes("--self-test")) {
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
if (KHONG_SSH) console.log("   (chạy với --no-ssh: các mục cần ssh đã bị bỏ, không phải 'đạt')");
process.exit(ma);
