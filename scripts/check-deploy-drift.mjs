#!/usr/bin/env node
/**
 * check-deploy-drift.mjs — **cổng canh khoảng cách giữa REPO và SERVER**.
 *
 * 🔴 VÌ SAO CÓ. Ngày `2026-08-28`, lúc chuẩn bị deploy một thay đổi console, so `sha256` hai
 * đầu thì lộ ra: **console công khai đang chạy đứng ở commit `69c80ce` (26/08)**, và ba commit
 * sau nó chưa bao giờ lên — gồm `b53c8f5` là **B-14, gốc dải chainId `9000000010`, mục David
 * đích thân chốt**. `lib/chainid.mjs` và `chainid-taken.json` **không tồn tại trên server**.
 * Tức console sống vẫn cấp chainId từ `9100` (số trùng **Genesis Coin**) suốt hai ngày, trong
 * khi `BLOCKERS.md` ghi B-14 *"ĐÃ ĐÓNG"*.
 *
 * **Điều đóng là QUYẾT ĐỊNH, không phải LỖ.**
 *
 * Repo đã có luật *"cổng chỉ chứng minh được đường mà chính nó đi"* và *"phải đo trên node
 * đang chạy"* — cả hai nói về **cùng một máy**. Lớp này nằm giữa **hai máy**: mã đúng, bài
 * kiểm xanh, quyết định đã chốt, tài liệu ghi "đóng", và **không byte nào của nó tồn tại ở
 * nơi người dùng chạm vào**. Không cổng nào canh lớp đó — cho tới tệp này.
 *
 * ⚠️ NÓ KHÔNG SỬA GÌ. Chỉ đo và nói ra. Deploy vẫn là việc có người bấm.
 *
 * Dùng:
 *   node scripts/check-deploy-drift.mjs
 *   node scripts/check-deploy-drift.mjs --host ubuntu@1.2.3.4 --src '~/9chain-a1/src'
 *   node scripts/check-deploy-drift.mjs --all      # in cả những tệp KHỚP
 */
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SSH_HOST, SSH_KEY } from "../local-net/lib/server.mjs";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const lay = (co, mac) => {
  const i = argv.indexOf(co);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : mac;
};
const HOST = lay("--host", SSH_HOST);
const KHOA = lay("--ssh-key", SSH_KEY);
const SRC = lay("--src", "/home/ubuntu/9chain-a1/src");
const TAT_CA = argv.includes("--all");

// ═════ ĐỐI CHỨNG NGƯỢC cho phép PHÂN LOẠI TỆP THỪA ═════
// Chạy trên danh sách TỔNG HỢP, không chạm server: phép phân loại phải phân biệt được
// bốn nhóm **trước khi** ta tin nó trên dữ liệu thật.
if (argv.includes("--self-test")) {
  const inMan = new Set(["a/trong-manifest.mjs"]);
  const trongRepo = (f) => f === "a/co-trong-repo.mjs" || f === "a/trong-manifest.mjs";
  // 🔴 The fixture returns the manifest's REAL shape (`reason`). It used to invent `{ ly: … }`,
  // which is why this suite stayed green while every declared orphan printed "— undefined".
  // A counter-check built on a shape production never emits proves nothing about production.
  const khai = (f) => (f === "a/da-khai.bak" ? { pattern: "^a/da-khai\\.bak$", reason: "counter-check" } : undefined);
  const ca = [
    ["tệp lạ KHÔNG có trong repo ⇒ MỒ CÔI", ["a/la.bak"], (r) => r.moCoi.length === 1],
    ["tệp mồ côi ĐÃ KHAI ⇒ không tính đỏ", ["a/da-khai.bak"], (r) => r.moCoi.length === 0 && r.moCoiDaKhai.length === 1],
    ["🔴 the declared REASON must reach the output (not `undefined`)", ["a/da-khai.bak"],
      (r) => r.moCoiDaKhai[0]?.ly === "counter-check"],
    ["🔴 a declaration MISSING its reason says so loudly, it does not go quiet", ["a/no-reason.bak"],
      (r) => /NO REASON/.test(r.moCoiDaKhai[0]?.ly ?? ""), (f) => (f === "a/no-reason.bak" ? { pattern: "x" } : undefined)],
    ["tệp trong manifest ⇒ không vào nhóm thừa nào", ["a/trong-manifest.mjs"],
      (r) => r.moCoi.length === 0 && r.ngoaiTam.length === 0],
    ["tệp có trong repo, ngoài manifest ⇒ NGOÀI TẦM CANH, không đỏ", ["a/co-trong-repo.mjs"],
      (r) => r.moCoi.length === 0 && r.ngoaiTam.length === 1],
    // 🔴 Ca đắt nhất: `null` (không quét được) TUYỆT ĐỐI không được đọc thành "sạch".
    ["🔴 KHÔNG quét được ⇒ khai 'không biết', KHÔNG kết luận sạch", null,
      (r) => r.khongQuetDuoc === true && r.moCoi.length === 0],
    ["danh sách RỖNG ⇒ là khẳng định thật, khác hẳn null", [],
      (r) => r.khongQuetDuoc === false && r.moCoi.length === 0],
  ];
  // 🔴 THE REAL manifest patterns, not a fixture. `console-chains.json.bak` was carved out of
  // the B-17 ban on 2026-09-01 because the console writes it on every save — but the ban still
  // covers every OTHER `.bak` beside running code, and a carve-out that quietly widened would
  // remove the tripwire without anyone noticing. Anchoring is the whole safety property here,
  // so it is measured rather than trusted to a comment.
  const carveOutCases = [
    ["the exact file the console writes IS declared", "9chain-a1-config/console-chains.json.bak", true],
    ["🔴 a -pre-* variant is NOT declared (B-17 shape must stay red)", "9chain-a1-config/console-chains.json.bak-pre-D087", false],
    // Suffixes here are deliberately generic: the property under test is "no rollback copy of
    // CODE is declared", which must hold for every suffix, not just the three B-17 happened to
    // find. (The historical names are recorded in `_extraDeleted`, where they belong.)
    ["🔴 a server.mjs rollback copy is NOT declared", "local-net/console/server.mjs.bak-pre-D087-20260827", false],
    ["🔴 an index.html rollback copy is NOT declared", "local-net/console/index.html.bak-20260824", false],
  ];

  // Read the manifest here: it is loaded further down, after this block runs and exits.
  const realKnownExtra = (JSON.parse(readFileSync(path.join(GOC, "local-net", "deploy", "manifest-deploy.json"), "utf8"))
    .knownExtra ?? []);
  const isDeclared = (p) => realKnownExtra.some((t) => new RegExp(t.pattern).test(p));

  let hong = 0;
  console.log("══ ĐỐI CHỨNG NGƯỢC — phân loại tệp thừa ══");
  for (const [label, filePath, expected] of carveOutCases) {
    const declared = isDeclared(filePath);
    if (declared === expected) console.log(`  ✓ ${label}`);
    else { console.log(`  ✗ ${label} — declared=${declared}, expected ${expected}`); hong++; }
  }
  // A 4th element lets one case swap the declaration lookup — used by the missing-reason case.
  for (const [ten, dsSv, dung, khaiRieng] of ca) {
    const r = phanLoaiThua(dsSv, inMan, trongRepo, khaiRieng ?? khai);
    if (dung(r)) console.log(`  ✓ ${ten}`);
    else { console.log(`  ✗ ${ten} — ra ${JSON.stringify(r)}`); hong++; }
  }
  // Count EVERY case that ran. Printing `8/8` while twelve ran is a small lie in the one line
  // a reader takes away, and it hides four checks going missing if they are ever dropped.
  const total = ca.length + carveOutCases.length;
  console.log(`\n${hong ? "✗" : "✅"} ${total - hong}/${total} đúng`);
  process.exit(hong ? 1 : 0);
}

/**
 * PHẠM VI đọc từ `local-net/deploy/manifest-deploy.json` — **một danh sách, hai nơi đọc**.
 *
 * 🔴 Bản đầu của tệp này TỰ ĐOÁN phạm vi bằng glob (`local-net/**` + `scripts/**`). Nó chạy,
 * và nó báo **27/58 tệp lệch** — trong đó phần lớn là công cụ chỉ chạy ở máy dev, tức **đỏ
 * giả**. Một cổng đỏ ở chỗ không cần đỏ sẽ bị người ta học cách bỏ qua, và nó sẽ bị bỏ qua
 * đúng vào lần nó đỏ thật. Nay phạm vi là một **quyết định được ghi ra**, không phải một cái
 * glob rộng tay.
 *
 * Và quan trọng hơn: `console-deploy.sh` đọc CÙNG tệp đó. Hai danh sách rời nhau chính là
 * thứ đã để B-14 hở — script deploy không được cập nhật khi `lib/chainid.mjs` tách ra.
 */
const MANIFEST = path.join(GOC, "local-net", "deploy", "manifest-deploy.json");

function gitTracked() {
  const ra = execFileSync("git", ["-C", GOC, "ls-files"], { encoding: "utf8" });
  return ra.split("\n").filter(Boolean);
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
} catch (e) {
  console.error(`FATAL không đọc được ${path.relative(GOC, MANIFEST)}: ${e.message}`);
  console.error("      Không có danh sách thì cổng này đo RỖNG, tức là đang tắt.");
  process.exit(1);
}
const boQua = (p) => (manifest.ignore ?? []).some((b) => new RegExp(b.pattern).test(p));

const sha = (b) => createHash("sha256").update(b).digest("hex");

const nhom = manifest.groups ?? {};
const tep = [];
const thuocNhom = new Map();
for (const [ten, n] of Object.entries(nhom)) {
  for (const f of n.files ?? []) {
    if (boQua(f)) continue;
    tep.push(f);
    thuocNhom.set(f, ten);
  }
}
if (tep.length === 0) {
  console.error("FATAL manifest không liệt kê tệp nào — cổng này đang đo RỖNG, tức là đang tắt.");
  process.exit(1);
}

// Băm ở máy dev từ **đĩa**, không từ git: thứ ta sắp deploy là thứ đang nằm trên đĩa.
// (Lệch giữa đĩa và git là việc của `git status`, không phải của cổng này.)
const bamDev = new Map();
for (const p of tep) {
  const day = path.join(GOC, p);
  if (!existsSync(day)) continue;
  bamDev.set(p, sha(readFileSync(day)));
}

// Một lượt ssh duy nhất: nhận danh sách qua stdin, trả `<sha>  <đường dẫn>` hoặc `THIEU`.
const lenh =
  `cd ${SRC} && while IFS= read -r f; do ` +
  `if [ -f "$f" ]; then printf '%s %s\\n' "$(sha256sum "$f" | cut -d" " -f1)" "$f"; ` +
  `else printf 'THIEU %s\\n' "$f"; fi; done`;

let raw;
try {
  raw = execFileSync(
    "ssh",
    ["-o", "BatchMode=yes", "-o", "ConnectTimeout=20", "-i", KHOA, HOST, lenh],
    { input: [...bamDev.keys()].join("\n") + "\n", encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }
  );
} catch (e) {
  console.error(`FATAL không hỏi được server (${HOST}): ${e.message.split("\n")[0]}`);
  console.error("      Cổng này KHÔNG được coi là xanh khi không hỏi được — đó là 'không biết', không phải 'khớp'.");
  process.exit(2);
}

const bamServer = new Map();
for (const dong of raw.split("\n")) {
  const m = dong.match(/^(\S+)\s+(.+)$/);
  if (m) bamServer.set(m[2].trim(), m[1]);
}

// ═══════════════════════════════════════════════════════════════════════════
// QUÉT TỆP THỪA — hướng NGƯỢC lại của cổng này
//
// 🔴 VÌ SAO. Phần trên chỉ hỏi *"tệp trong danh sách có khớp không"*. Một tệp bị
// **XOÁ khỏi repo mà vẫn nằm trên server** thì không nhóm nào thấy. Đã cháy thật
// (`28/08`, D-092b): `9chain-a1-config/genesis.json` — genesis LOCAL của Avalanche,
// khoá ewoq công khai — repo xoá `27/08`, **server vẫn còn**.
//
// ⚠️ "Thừa" là HAI thứ khác nhau, và gộp chúng là đẻ ra một cổng đỏ tràn lan:
//
//   🔴 MỒ CÔI       trên server, **không tồn tại trong repo** → xoá khỏi repo mà
//                   còn ở đây, hoặc chưa bao giờ ở repo. Đây là lớp BẪY NẰM IM.
//   🟡 NGOÀI TẦM    có trong repo nhưng không có trong manifest → lỗ **phủ sóng**,
//                   một quyết định chưa ai ghi, không phải một vết thương.
//
// Chỉ MỒ CÔI **chưa khai báo** mới làm cổng đỏ. Mồ côi đã khai nằm ở
// `knownExtra` trong manifest, mỗi mục kèm **lý do** — cùng kỷ luật với `ignore`:
// *vắng mặt phải là một quyết định, không phải một lần quên.*
// ═══════════════════════════════════════════════════════════════════════════
const thuaDaBiet = manifest.knownExtra ?? [];
const daKhaiThua = (p) => thuaDaBiet.find((t) => new RegExp(t.pattern).test(p));

/**
 * Thuần, để bài đối chứng gọi được mà không cần server.
 * @param {string[]|null} tepServer  null = KHÔNG quét được (khác hẳn mảng rỗng)
 */
export function phanLoaiThua(tepServer, trongManifest, coTrongRepo, daKhai) {
  // 🔴 `null` và `[]` KHÔNG được nhập làm một. Không quét được là **không biết**;
  // quét ra rỗng là một khẳng định. Nhập hai thứ đó là đúng cách một cổng báo
  // "sạch" cho một lượt quét chưa từng chạy. (Rỗng ≡ hỏng — D-069b.)
  if (tepServer === null) return { khongQuetDuoc: true, moCoi: [], moCoiDaKhai: [], ngoaiTam: [] };
  const moCoi = [], moCoiDaKhai = [], ngoaiTam = [];
  for (const f of tepServer) {
    if (trongManifest.has(f)) continue;
    if (coTrongRepo(f)) { ngoaiTam.push(f); continue; }
    const khai = daKhai(f);
    // 🔴 The manifest key is `reason`. This read `khai.ly`, a key the manifest has never had, so
    // EVERY declared orphan printed "— undefined" since the feature shipped. The counter-check
    // below could not catch it because its fixture invented `{ ly: … }` — a shape production
    // never produces. A declaration whose reason is invisible silences the gate AND hides the
    // justification, which is the exact thing `_extraDoc` exists to prevent.
    // A declared entry with no reason is louder than silence, on purpose.
    (khai ? moCoiDaKhai : moCoi).push(
      khai ? { p: f, ly: khai.reason ?? "🔴 DECLARED WITH NO REASON — _extraDoc requires one" } : f,
    );
  }
  return { khongQuetDuoc: false, moCoi, moCoiDaKhai, ngoaiTam };
}

// Thư mục cần quét **suy ra từ chính manifest**, không khai tay: một danh sách thư
// mục viết riêng sẽ trôi lệch khỏi danh sách tệp — đúng lỗ D-088/D-094.
const thuMucQuet = [...new Set(tep.map((f) => f.split("/").slice(0, -1).join("/")))].filter(Boolean);
let tepServer = null;
try {
  // `-maxdepth 1`: không đệ quy. Đệ quy là nuốt `node_modules` và biến cổng thành
  // tiếng ồn; còn bẫy thật (D-092b) nằm ngay trong thư mục, không nằm sâu.
  const raThua = execFileSync(
    "ssh",
    ["-o", "BatchMode=yes", "-o", "ConnectTimeout=20", "-i", KHOA, HOST,
      `cd ${SRC} && for d in ${thuMucQuet.join(" ")}; do [ -d "$d" ] && find "$d" -maxdepth 1 -type f; done`],
    { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }
  );
  tepServer = raThua.split("\n").map((s) => s.trim()).filter(Boolean);
} catch {
  tepServer = null; // KHÔNG quét được — xem chú thích trong `phanLoaiThua`
}
const trongManifest = new Set(tep);
const thua = phanLoaiThua(
  tepServer, trongManifest, (f) => existsSync(path.join(GOC, f)), daKhaiThua,
);

const khop = [], lech = [], thieu = [];
for (const [p, h] of bamDev) {
  const s = bamServer.get(p);
  if (s === undefined) thieu.push(p);           // ssh không trả dòng nào — bất thường
  else if (s === "THIEU") thieu.push(p);
  else if (s === h) khop.push(p);
  else lech.push(p);
}

console.log(`check-deploy-drift — ${HOST}:${SRC}`);
console.log(`  phạm vi: ${bamDev.size} tệp · ${Object.keys(nhom).length} nhóm (${Object.keys(nhom).join(" · ")})\n`);

if (TAT_CA) for (const p of khop) console.log(`  = ${p}`);
for (const p of thieu) console.log(`  🔴 THIẾU TRÊN SERVER  [${thuocNhom.get(p)}] ${p}`);
for (const p of lech) console.log(`  🔴 LỆCH               [${thuocNhom.get(p)}] ${p}`);

// ── hướng ngược: tệp THỪA trên server ──
if (thua.khongQuetDuoc) {
  console.log(`\n🟡 KHÔNG quét được tệp thừa (${thuMucQuet.length} thư mục) — đây là "không biết", KHÔNG phải "sạch".`);
} else {
  for (const f of thua.moCoi) console.log(`  🔴 MỒ CÔI (không có trong repo)  ${f}`);
  for (const { p, ly } of thua.moCoiDaKhai) console.log(`  🟡 mồ côi ĐÃ KHAI  ${p}  — ${ly}`);
  if (thua.ngoaiTam.length) {
    console.log(`  ℹ️  ${thua.ngoaiTam.length} tệp NGOÀI TẦM CANH (có trong repo, không trong manifest):`);
    for (const f of thua.ngoaiTam) console.log(`       ${f}`);
  }
}

console.log(`\n${khop.length} khớp · ${lech.length} lệch · ${thieu.length} thiếu` +
  (thua.khongQuetDuoc ? " · thừa: KHÔNG QUÉT ĐƯỢC"
    : ` · ${thua.moCoi.length} mồ côi · ${thua.moCoiDaKhai.length} mồ côi đã khai · ${thua.ngoaiTam.length} ngoài tầm canh`));

if (thua.moCoi.length) {
  console.log(
    `\n🔴 Có tệp trên server KHÔNG tồn tại trong repo. Cổng phía trên KHÔNG thấy được lớp này:\n` +
    `   nó chỉ hỏi "tệp trong danh sách có khớp không". Một bản .bak của mã cũ nằm cạnh mã đang\n` +
    `   chạy là một đường lui trỏ vào một QUYẾT ĐỊNH ĐÃ ĐÓNG — xem D-092b và D-098.\n` +
    `   Nếu tệp đó ở lại có chủ ý, khai vào "knownExtra" trong manifest kèm LÝ DO.`
  );
}

if (lech.length || thieu.length) {
  console.log(
    `\n🔴 Mã trên server KHÔNG phải mã trong repo. Một quyết định đã chốt và một bài kiểm đã\n` +
    `   xanh KHÔNG chứng minh được điều gì về hành vi mà người dùng đang gặp.\n` +
    `   Xem D-087 — đúng lớp lỗi này đã để B-14 hở suốt hai ngày.`
  );
}
if (lech.length || thieu.length || thua.moCoi.length) process.exit(1);
console.log(
  "✓ mọi tệp trong phạm vi khớp từng byte" +
  (thua.khongQuetDuoc ? " (nhưng KHÔNG quét được tệp thừa — xem dòng vàng trên)."
    : ", và không có tệp mồ côi nào chưa khai báo."),
);
