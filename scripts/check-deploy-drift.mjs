#!/usr/bin/env node
/**
 * check-deploy-drift.mjs — **cổng canh khoảng cách giữa REPO và SERVER**.
 *
 * 🔴 VÌ SAO CÓ. Ngày `2026-08-28`, lúc chuẩn bị deploy một thay đổi console, so `sha256` hai
 * đầu thì lộ ra: **console công khai đang chạy đứng ở commit `69c80ce` (26/08)**, và ba commit
 * sau nó chưa bao giờ lên — gồm `b53c8f5` là **B-14, gốc dải chainId `9000000010`, mục David
 * đích thân chốt**. `lib/chainid.mjs` và `chainid-da-chiem.json` **không tồn tại trên server**.
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
 *   node scripts/check-deploy-drift.mjs --tat-ca      # in cả những tệp KHỚP
 */
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const lay = (co, mac) => {
  const i = argv.indexOf(co);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : mac;
};
const HOST = lay("--host", ""$A1_SSH_HOST"");
const KHOA = lay("--key", `${process.env.HOME || process.env.USERPROFILE}/.ssh/9chain-a1`);
const SRC = lay("--src", "/home/ubuntu/9chain-a1/src");
const TAT_CA = argv.includes("--tat-ca");

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
const boQua = (p) => (manifest.boQua ?? []).some((b) => new RegExp(b.mau).test(p));

const sha = (b) => createHash("sha256").update(b).digest("hex");

const nhom = manifest.nhom ?? {};
const tep = [];
const thuocNhom = new Map();
for (const [ten, n] of Object.entries(nhom)) {
  for (const f of n.tep ?? []) {
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

console.log(`\n${khop.length} khớp · ${lech.length} lệch · ${thieu.length} thiếu`);

if (lech.length || thieu.length) {
  console.log(
    `\n🔴 Mã trên server KHÔNG phải mã trong repo. Một quyết định đã chốt và một bài kiểm đã\n` +
    `   xanh KHÔNG chứng minh được điều gì về hành vi mà người dùng đang gặp.\n` +
    `   Xem D-087 — đúng lớp lỗi này đã để B-14 hở suốt hai ngày.`
  );
  process.exit(1);
}
console.log("✓ mọi tệp trong phạm vi khớp từng byte.");
