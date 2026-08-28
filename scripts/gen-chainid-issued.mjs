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
 * Dùng:
 *   node scripts/gen-chainid-issued.mjs                    # in ra, không ghi
 *   node scripts/gen-chainid-issued.mjs --write              # ghi vào console/
 *   node scripts/gen-chainid-issued.mjs --check             # thoát 1 nếu lệch tệp đang có
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RA = path.join(GOC, "local-net", "console", "chainid-issued.json");

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

function dungBan({ chainIds, names, daDoc }) {
  return {
    _doc:
      "chainId VÀ TÊN mà 9Chain-A1 ĐÃ TỪNG CẤP cho L1 người dùng, gộp từ mọi sổ console " +
      "trong repo. Chặn cấp lại VĨNH VIỄN: thu hồi không gỡ được mạng khỏi ví ai, nên cấp " +
      "lại một chainId là để chữ ký của chain cũ phát lại được trên chain mới. " +
      "SINH TỰ ĐỘNG — đừng sửa tay, chạy `node scripts/gen-chainid-issued.mjs --write`.",
    sources: daDoc,
    chainIdCount: chainIds.size,
    nameCount: names.size,
    chainIds: [...chainIds.keys()].sort((a, b) => a - b),
    // Tên giữ nguyên dạng gốc để câu lỗi đọc được; so sánh thì thường hoá ở nơi dùng.
    names: [...names.values()].sort((a, b) => a.localeCompare(b, "vi")),
  };
}

const ban = dungBan(gom());
const chuoi = JSON.stringify(ban, null, 2) + "\n";

if (process.argv.includes("--check")) {
  if (!existsSync(RA)) {
    console.error(`FATAL chưa có ${path.relative(GOC, RA)} — chạy với --write.`);
    process.exit(1);
  }
  const cu = readFileSync(RA, "utf8");
  if (cu !== chuoi) {
    console.error("FATAL chainid-issued.json ĐÃ TRÔI LỆCH khỏi các sổ trong repo.");
    console.error("      Chạy: node scripts/gen-chainid-issued.mjs --write");
    process.exit(1);
  }
  console.log(`✓ chainid-issued.json khớp nguồn — ${ban.chainIdCount} chainId · ${ban.nameCount} tên`);
  process.exit(0);
}

if (process.argv.includes("--write")) {
  writeFileSync(RA, chuoi, "utf8");
  console.log(`✓ đã ghi ${path.relative(GOC, RA)}`);
}

console.log(`Nguồn (${ban.sources.length} sổ):`);
for (const n of ban.sources) console.log(`  ${String(n.entries).padStart(3)} mục  ${n.file}`);
console.log(`\nĐã cấp: ${ban.chainIdCount} chainId · ${ban.nameCount} tên`);
console.log(`  chainId: ${ban.chainIds[0]}…${ban.chainIds[ban.chainIds.length - 1]}`);
