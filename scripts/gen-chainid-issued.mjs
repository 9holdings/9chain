#!/usr/bin/env node
/**
 * gen-chainid-issued.mjs — dựng danh sách **chainId và TÊN mà A1 ĐÃ TỪNG CẤP**
 * cho L1 người dùng, gộp từ MỌI sổ console còn lưu được.
 *
 * 🔴 VÌ SAO CẦN. Mỗi lượt re-genesis xoá sạch `console-chains.json`, nên sổ
 * `chains ∪ retired` — thứ `createChain` dựa vào để chặn trùng — **quay về rỗng**.
 * Đo `2026-08-27` sau lượt g0: sổ đang chạy đúng **27 byte**. Tức mọi chainId và
 * mọi TÊN từng cấp cho người dùng **đã tự do trở lại**, gồm cả `9141 "David Do"`.
 *
 * Hậu quả không phải "một chain trùng tên". `createChain` cấp lại `9102` cho một
 * chain KHÁC nghĩa là ví của người từng dùng chain cũ nay trỏ vào một chain lạ
 * **dưới cùng một chainId**: MetaMask coi hai chain là MỘT mạng, và chữ ký ký cho
 * chain cũ **phát lại được** trên chain mới. Thu hồi không gỡ được mạng khỏi ví ai.
 *
 * 🔴 VÀ VÌ SAO KHÔNG "KHÔI PHỤC SỔ CŨ" (§5c, David chốt `27/08`):
 * khôi phục sổ là kéo **trạng thái** của một mạng đã chết vào mạng mới — chain
 * `retired` ở đó trỏ tới `subnetID`/`blockchainID` **không còn tồn tại**, và mọi
 * heuristic đo chain sống sẽ vấp phải chúng. Thứ cần giữ lại không phải trạng
 * thái mà là **lời hứa**: con số này, cái tên này, đã phát ra ngoài rồi.
 * ⇒ Rút đúng hai trường đó ra thành danh sách chặn TĨNH, bỏ phần còn lại.
 *
 * ⚠️ KHÔNG đọc sổ trên server. Nguồn là `docs/archive/console-chains-*.json` +
 * `9chain-a1-config/console-chains.json`, tức **trong repo** — nếu không thì danh
 * sách chặn không tái lập được, và một danh sách chặn không tái lập được thì
 * không ai dám sinh lại nó.
 *
 * 🔴 RATCHET — THIS LIST MAY ONLY GROW (added 2026-09-01).
 *
 * Before this, `--write` wrote whatever it managed to build. `gom()` only dies on **zero**
 * sources, so losing 5 of 6 ledgers still produced a smaller list, `--write` overwrote the file,
 * `--check` went green again — and chainIds and NAMES already handed out **returned to
 * circulation in silence**. Worse: on any drift `--check` printed exactly *"run --write"*, i.e.
 * **the dangerous operation was the reflex the gate itself trained**.
 *
 * `check-english-code.mjs` has a ratchet for the LANGUAGE DEBT; here the direction matters far
 * more and there was none. Now there is:
 *
 *   - `--write` **REFUSES** any entry that disappears relative to the existing file…
 *   - …**EXCEPT** entries declared explicitly in `local-net/console/chainid-released.json`.
 *
 * That is the only distinction that matters: **shrinking because a SOURCE WENT MISSING** (an
 * accident — blocked) is not **shrinking because SOMEBODY DECIDED TO RELEASE** (deliberate —
 * written down, with a name and a reason). A command-line flag leaves no trace; a file does.
 *
 * Usage:
 *   node scripts/gen-chainid-issued.mjs                    # print, write nothing
 *   node scripts/gen-chainid-issued.mjs --write            # write into console/ (ratcheted)
 *   node scripts/gen-chainid-issued.mjs --check            # exit 1 if it drifted from the file
 *   node scripts/gen-chainid-issued.mjs --self-test        # counter-check: the ratchet knows how to go red
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RA = path.join(GOC, "local-net", "console", "chainid-issued.json");
const RELEASED_FILE = path.join(GOC, "local-net", "console", "chainid-released.json");

/**
 * Entries DELIBERATELY released — the only authority that lets the block-list shrink.
 * No file ⇒ empty sets ⇒ **nothing may be lost**, i.e. the default is the strictest setting.
 */
export function readReleased(file = RELEASED_FILE) {
  const chainIds = new Set();
  const names = new Set(); // lower-cased: name comparison must ignore case
  if (!existsSync(file)) return { chainIds, names, releases: 0 };
  const d = JSON.parse(readFileSync(file, "utf8"));
  const rs = d.releases ?? [];
  for (const r of rs) {
    for (const c of r.chainIds ?? []) chainIds.add(Number(c));
    for (const t of r.names ?? []) names.add(String(t).trim().toLowerCase());
  }
  return { chainIds, names, releases: rs.length };
}

/**
 * The ratchet: what the OLD file blocked, the NEW one no longer blocks, and nobody declared as
 * released. An empty result means the write is allowed.
 */
export function unaccountedLosses(before, after, released) {
  const afterIds = new Set(after.chainIds);
  const afterNames = new Set(after.names.map((t) => String(t).toLowerCase()));
  return {
    chainIds: (before.chainIds ?? []).filter((c) => !afterIds.has(Number(c)) && !released.chainIds.has(Number(c))),
    names: (before.names ?? []).filter((t) => {
      const k = String(t).toLowerCase();
      return !afterNames.has(k) && !released.names.has(k);
    }),
  };
}

/** Mọi sổ console trong repo. Thêm sổ mới = thả tệp vào `docs/archive/`. */
function nguon() {
  const ds = [];
  const kho = path.join(GOC, "docs", "archive");
  if (existsSync(kho)) {
    for (const f of readdirSync(kho).sort()) {
      if (/^console-chains.*\.json$/.test(f)) ds.push(path.join(kho, f));
    }
  }
  const cfg = path.join(GOC, "9chain-a1-config", "console-chains.json");
  if (existsSync(cfg)) ds.push(cfg);
  return ds;
}

function gom() {
  const ds = nguon();
  if (ds.length === 0) {
    // Nguồn rỗng ≡ nguồn hỏng. Một bộ sinh ra danh sách chặn RỖNG mà thoát 0 là
    // một bộ sinh nói dối: nó biến "không đọc được gì" thành "không có gì bị chặn".
    console.error("FATAL không thấy sổ console nào trong docs/archive/ — nguồn rỗng ≡ nguồn hỏng.");
    process.exit(1);
  }
  const chainIds = new Map(); // chainId -> Set<tên>
  const names = new Map();    // tên thường hoá -> tên gốc đầu tiên gặp
  const daDoc = [];

  for (const f of ds) {
    let d;
    try { d = JSON.parse(readFileSync(f, "utf8")); } catch (e) {
      console.error(`FATAL không đọc được ${path.relative(GOC, f)}: ${e.message}`);
      process.exit(1);
    }
    let dem = 0;
    for (const nhom of ["chains", "retired"]) {
      for (const c of d[nhom] ?? []) {
        const cid = Number(c.chainId);
        const ten = String(c.name ?? "").trim();
        if (!Number.isSafeInteger(cid)) continue;
        dem++;
        if (!chainIds.has(cid)) chainIds.set(cid, new Set());
        if (ten) {
          chainIds.get(cid).add(ten);
          if (!names.has(ten.toLowerCase())) names.set(ten.toLowerCase(), ten);
        }
      }
    }
    daDoc.push({ file: path.relative(GOC, f).replace(/\\/g, "/"), entries: dem });
  }
  return { chainIds, names, daDoc };
}

function dungBan({ chainIds, names, daDoc }, released = { chainIds: new Set(), names: new Set(), releases: 0 }) {
  // 🔴 SUBTRACT what was declared released — the ONLY path that makes this list smaller, and it
  // runs through a file carrying the name of whoever decided. Every other loss is refused below.
  const stillBlockedIds = [...chainIds.keys()].filter((c) => !released.chainIds.has(c));
  const stillBlockedNames = [...names.entries()].filter(([k]) => !released.names.has(k)).map(([, v]) => v);
  return {
    _doc:
      "chainId VÀ TÊN mà 9Chain-A1 ĐÃ TỪNG CẤP cho L1 người dùng, gộp từ mọi sổ console " +
      "trong repo. Chặn cấp lại VĨNH VIỄN: thu hồi không gỡ được mạng khỏi ví ai, nên cấp " +
      "lại một chainId là để chữ ký của chain cũ phát lại được trên chain mới. " +
      "SINH TỰ ĐỘNG — đừng sửa tay, chạy `node scripts/gen-chainid-issued.mjs --write`.",
    sources: daDoc,
    // How many entries were DELIBERATELY released. Carried in the file so that an EMPTY list
    // explains itself: empty because somebody decided is not empty because a source vanished.
    released: { chainIds: released.chainIds.size, names: released.names.size, releases: released.releases },
    chainIdCount: stillBlockedIds.length,
    nameCount: stillBlockedNames.length,
    chainIds: stillBlockedIds.sort((a, b) => a - b),
    // Tên giữ nguyên dạng gốc để câu lỗi đọc được; so sánh thì thường hoá ở nơi dùng.
    names: stillBlockedNames.sort((a, b) => a.localeCompare(b, "vi")),
  };
}

if (process.argv.includes("--self-test")) { process.exit(selfTest()); }

const ban = dungBan(gom(), readReleased());
const chuoi = JSON.stringify(ban, null, 2) + "\n";

if (process.argv.includes("--check")) {
  if (!existsSync(RA)) {
    console.error(`FATAL chưa có ${path.relative(GOC, RA)} — chạy với --write.`);
    process.exit(1);
  }
  const cu = readFileSync(RA, "utf8");
  if (cu !== chuoi) {
    console.error("FATAL chainid-issued.json ĐÃ TRÔI LỆCH khỏi các sổ trong repo.");
    // 🔴 SAY WHICH DIRECTION IT DRIFTED before telling anyone to run `--write`. The previous
    // version printed "run --write" for EVERY kind of drift, including the kind where `--write`
    // would DESTROY a promise. A gate that only checks "does it block" has not yet checked
    // "and what does it say when it blocks".
    try {
      const lost = unaccountedLosses(JSON.parse(cu), ban, readReleased());
      if (lost.chainIds.length || lost.names.length) {
        console.error("");
        console.error("🔴 AND IT DRIFTED THE DANGEROUS WAY — the file on disk blocks MORE than the rebuild:");
        if (lost.chainIds.length) console.error(`   chainId that would be LOST: ${lost.chainIds.join(", ")}`);
        if (lost.names.length) console.error(`   names that would be LOST: ${lost.names.join(", ")}`);
        console.error("   ⇒ do NOT run --write. It will be REFUSED, and rightly so: almost certainly");
        console.error("     a ledger under docs/archive/ went missing or was renamed.");
        process.exit(1);
      }
    } catch { /* the old file will not parse — fall through to the generic line below */ }
    console.error("      Chạy: node scripts/gen-chainid-issued.mjs --write");
    process.exit(1);
  }
  console.log(`✓ chainid-issued.json khớp nguồn — ${ban.chainIdCount} chainId · ${ban.nameCount} tên`);
  process.exit(0);
}

if (process.argv.includes("--write")) {
  // 🔴 THE RATCHET. The block-list may only grow; shrinking needs a signature in
  // `chainid-released.json`. Without this, losing one source file hands issued names back.
  if (existsSync(RA)) {
    let before = null;
    try { before = JSON.parse(readFileSync(RA, "utf8")); } catch (e) {
      console.error(`FATAL ${path.relative(GOC, RA)} will not parse (${e.message}) — the ratchet cannot compare.`);
      console.error("      Repair or remove that file deliberately first; never overwrite what cannot be read.");
      process.exit(1);
    }
    const lost = unaccountedLosses(before, ban, readReleased());
    if (lost.chainIds.length || lost.names.length) {
      console.error("🔴 REFUSING TO WRITE — the block-list would SHRINK with nobody declaring it deliberate.");
      console.error("");
      if (lost.chainIds.length) console.error(`   chainId lost: ${lost.chainIds.join(", ")}`);
      if (lost.names.length) console.error(`   names lost: ${lost.names.join(", ")}`);
      console.error("");
      console.error("   Retiring a chain does not remove that network from anybody's wallet, so re-issuing");
      console.error("   a chainId is what lets signatures made for the old chain REPLAY on the new one.");
      console.error("   This list may only GROW.");
      console.error("");
      console.error("   If this is an ACCIDENT (it usually is): a ledger under docs/archive/ went missing");
      console.error("   or was renamed — restore it, do not overwrite.");
      console.error("   If this is a DECISION: name every entry in local-net/console/chainid-released.json");
      console.error("   with who decided and why, then run again.");
      process.exit(1);
    }
  }
  writeFileSync(RA, chuoi, "utf8");
  console.log(`✓ đã ghi ${path.relative(GOC, RA)}`);
}

console.log(`Nguồn (${ban.sources.length} sổ):`);
for (const n of ban.sources) console.log(`  ${String(n.entries).padStart(3)} mục  ${n.file}`);
console.log(`\nĐã cấp: ${ban.chainIdCount} chainId · ${ban.nameCount} tên`);
if (ban.chainIds.length) {
  console.log(`  chainId: ${ban.chainIds[0]}…${ban.chainIds[ban.chainIds.length - 1]}`);
} else {
  // 🔴 An EMPTY list must explain itself. Empty-because-somebody-decided and
  // empty-because-a-source-vanished look identical here, and one of them is an incident.
  console.log(`  (nothing is blocked — ${ban.released.chainIds} chainId · ${ban.released.names} names`);
  console.log(`   were DELIBERATELY released across ${ban.released.releases} declaration(s) in chainid-released.json)`);
}

/** Counter-check for the ratchet — it must know how to go red, and red FOR THE RIGHT REASON. */
function selfTest() {
  let pass = 0;
  let fail = 0;
  const ok = (name, cond, seen) => {
    if (cond) { pass++; console.log(`  ✓ ${name}`); }
    else { fail++; console.log(`  ✗ ${name}  — got: ${seen}`); }
  };
  const NONE = { chainIds: new Set(), names: new Set(), releases: 0 };
  const before = { chainIds: [9100, 9101, 9000000010], names: ["Eric1", "Smoke7M7Q3D"] };
  const after = { chainIds: [9100, 9101], names: ["Eric1"] };

  console.log("\n══ COUNTER-CHECK — the block-list ratchet ══\n");

  console.log("── 1. Shrinking with nobody declaring it MUST be caught ──");
  const l1 = unaccountedLosses(before, after, NONE);
  ok("🔴 a lost chainId is reported, by number", l1.chainIds.join() === "9000000010", l1.chainIds.join());
  ok("🔴 a lost name is reported, by name", l1.names.join() === "Smoke7M7Q3D", l1.names.join());

  console.log("\n── 2. Shrinking BECAUSE SOMEBODY DECIDED ⇒ allowed ──");
  const declared = { chainIds: new Set([9000000010]), names: new Set(["smoke7m7q3d"]), releases: 1 };
  const l2 = unaccountedLosses(before, after, declared);
  ok("declared losses leave NO unaccounted loss",
    l2.chainIds.length === 0 && l2.names.length === 0, JSON.stringify(l2));

  console.log("\n── 3. A release declaration must ignore CASE ──");
  // The ledger folds names case-insensitively, so `eric1` rides on `Eric1`. A case-sensitive
  // release would leave one of them behind and turn the gate red for a reason nobody can follow.
  const l3 = unaccountedLosses({ chainIds: [], names: ["eric1"] }, { chainIds: [], names: [] },
    { chainIds: new Set(), names: new Set(["eric1"]), releases: 1 });
  ok("🔴 releasing `Eric1` releases `eric1` too", l3.names.length === 0, l3.names.join());

  console.log("\n── 4. Growing is never blocked ──");
  const l4 = unaccountedLosses(before,
    { chainIds: [9100, 9101, 9000000010, 9001000000], names: ["Eric1", "Smoke7M7Q3D", "New"] }, NONE);
  ok("adding entries ⇒ no loss", l4.chainIds.length === 0 && l4.names.length === 0, JSON.stringify(l4));

  console.log("\n── 5. No release file ⇒ STRICTEST, not loosest ──");
  const absent = readReleased(path.join(GOC, "this-file-never-exists.json"));
  ok("🔴 a missing file ⇒ EMPTY release set (default is: block everything)",
    absent.chainIds.size === 0 && absent.names.size === 0, JSON.stringify([...absent.chainIds]));
  const l5 = unaccountedLosses(before, { chainIds: [], names: [] }, absent);
  ok("🔴 …so wiping everything with no declaration is caught: all 3 chainId + 2 names",
    l5.chainIds.length === 3 && l5.names.length === 2, JSON.stringify(l5));

  console.log("\n── 6. Releasing something never issued must not MASK a real loss ──");
  const strayRelease = { chainIds: new Set([424242]), names: new Set(["does-not-exist"]), releases: 1 };
  const l6 = unaccountedLosses(before, after, strayRelease);
  ok("🔴 a stray release entry ⇒ the genuine loss is still caught",
    l6.chainIds.join() === "9000000010" && l6.names.join() === "Smoke7M7Q3D", JSON.stringify(l6));

  console.log(`\n${fail === 0 ? "✅" : "🔴"} ${pass} passed · ${fail} failed`);
  return fail === 0 ? 0 : 1;
}
