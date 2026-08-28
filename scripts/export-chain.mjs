// QUY TRÌNH O2 — XUẤT + BĂM MỘT MẠNG SẮP CHẾT, TRƯỚC KHI XOÁ NÓ
//
// ═══ Vì sao bài này tồn tại ═══
// Lượt re-genesis `2026-08-26` xoá chain data 9 node **và** DB Blockscout mà **không có bản
// công bố nào**. Chuỗi đó nay không kiểm lại được: câu hỏi "20M/70M có thật trên chain cũ
// không" đã vĩnh viễn không trả lời được. Ngày G `01/09` sẽ xoá một mạng nữa. Bài này để lần
// đó có vật chứng.
//
// ═══ Nó KHÔNG phải cái gì ═══
// 🔴 Đây **không phải bản sao lưu khôi phục được**. Nó không dựng lại được mạng cũ. Nó là
// **vật chứng**: một bộ byte + một con số để sau này ai cũng chứng minh được "chuỗi cũ đúng
// là như thế này". Đừng khai nó mạnh hơn thế — H-6b đã trả giá một lần cho việc một bản
// "backup" tự khai "is okay" trong khi clone ngược chết ngay.
//
// ═══ Con số công bố ═══
// `MANIFEST.txt` liệt kê `sha256` từng tệp theo **đúng khuôn `sha256sum`**, nên kiểm lại được
// bằng công cụ chuẩn (`sha256sum -c MANIFEST.txt`) mà **không cần tin bài này**. `GOC.txt` là
// `sha256` của chính `MANIFEST.txt` — **đó là con số duy nhất phải công bố**, và nó neo toàn
// bộ phần còn lại.
//
// 🔴 **`GỐC` NEO MỘT THỜI ĐIỂM, KHÔNG NEO MỘT CHUỖI** (đo `2026-08-27`, lượt chạy thật đầu
// tiên trên mạng công khai). Hai lượt xuất cùng một mạng, cách nhau vài phút, **không đẻ thêm
// block nào**, vẫn ra hai `GỐC` khác nhau. Khác nhau **duy nhất** ở `p-chain/tip.json`, và
// trong đó **duy nhất** ở `uptime` của validator: `99.8756` → `99.8758`.
//
// `uptime` trôi liên tục, và nó **không phải thuộc tính của chuỗi** — nó là ý kiến của **node
// đang được hỏi** về peer của nó, nên hỏi node khác cũng ra số khác. Giữ nó lại là cố ý (nó
// là dữ liệu pháp y: mạng lúc chết có khoẻ không), nhưng **cái giá là bộ xuất không tái lập
// được**, và điều đó phải được khai ra chứ không để người sau tự vấp.
//
// ⇒ Thấy hai `GỐC` lệch thì **đừng kết luận có người sửa**. So từng tệp trước.
// ⇒ `GỐC` **vẫn** chống được sửa đổi SAU khi xuất — đó mới là việc của nó, và đã đối chứng
//    ngược: sửa 1 byte ⇒ đỏ; sửa cả `MANIFEST` để che ⇒ `GỐC` vẫn đỏ.
//
//   node scripts/export-chain.mjs --rpc http://127.0.0.1:9750 --out ./xuat-2026-09-01 \
//        --attach local-net/net-public/genesis.json --attach docs/ALLOCATION-PUBLIC.md
//   node scripts/export-chain.mjs --check ./xuat-2026-09-01     # kiểm lại, exit≠0 nếu lệch
//
// Cờ:
//   --rpc <url>          gốc API của node (KHÔNG kèm /ext/…). Mặc định http://127.0.0.1:9650
//   --out <thư mục>       nơi ghi. Phải chưa tồn tại hoặc rỗng.
//   --attach <đường dẫn>    kèm một tệp cục bộ vào bộ xuất (lặp lại được). Ví dụ genesis.json,
//                        bảng phân bổ, `console-chains.json` (sổ chống phát lại — §5c).
//   --add-evm <n=id>    xuất thêm một chuỗi EVM (L1 người dùng), `nhãn=blockchainID`. Lặp
//                        lại được. 🔴 KHÔNG có cờ này thì bộ xuất **chỉ có P/X/C của mạng
//                        chính** — mọi L1 người dùng biến mất không dấu vết. Lấy danh sách
//                        từ `console-chains.json` hoặc `platform.getBlockchains`.
//   --max-blocks <n>   trần số block mỗi chuỗi. Mặc định KHÔNG trần. Nếu cắt, bài này GHI
//                        RÕ vào manifest — bộ xuất im lặng thiếu dữ liệu là bộ xuất nói dối.
//   --check <thư mục>     chế độ kiểm lại.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, appendFileSync } from "node:fs";
import { basename, join, posix } from "node:path";

function cờ(tên, mặcĐịnh = undefined) {
  const i = process.argv.indexOf(tên);
  return i === -1 ? mặcĐịnh : process.argv[i + 1];
}
function cờNhiều(tên) {
  const ra = [];
  process.argv.forEach((v, i) => { if (v === tên) ra.push(process.argv[i + 1]); });
  return ra.filter(Boolean);
}

const băm = (buf) => createHash("sha256").update(buf).digest("hex");

// ═════════════════════════════ CHẾ ĐỘ KIỂM ═════════════════════════════
const KIEM = cờ("--check");
if (KIEM) {
  const đườngManifest = join(KIEM, "MANIFEST.txt");
  const đườngGốc = join(KIEM, "GOC.txt");
  if (!existsSync(đườngManifest) || !existsSync(đườngGốc)) {
    console.error(`🔴 ${KIEM} thiếu MANIFEST.txt hoặc GOC.txt — không phải bộ xuất của bài này.`);
    process.exit(2);
  }
  const bytesManifest = readFileSync(đườngManifest);
  const dòng = bytesManifest.toString("utf8").split("\n").filter((d) => d.trim());

  let lệch = 0, thiếu = 0, ok = 0;
  for (const d of dòng) {
    // khuôn sha256sum: "<64 hex><2 khoảng trắng><đường dẫn>"
    const m = d.match(/^([0-9a-f]{64})\s\s(.+)$/);
    if (!m) { console.log(`  ? dòng không đọc được: ${d.slice(0, 60)}`); lệch++; continue; }
    const [, hMong, tên] = m;
    const đ = join(KIEM, tên);
    if (!existsSync(đ)) { console.log(`  ✗ THIẾU TỆP  ${tên}`); thiếu++; continue; }
    const hThật = băm(readFileSync(đ));
    if (hThật !== hMong) {
      console.log(`  ✗ LỆCH BYTE  ${tên}`);
      console.log(`      manifest: ${hMong}`);
      console.log(`      trên đĩa: ${hThật}`);
      lệch++;
    } else ok++;
  }

  // Gốc neo chính manifest — thiếu bước này thì sửa cả tệp lẫn manifest là qua sạch.
  const gốcMong = readFileSync(đườngGốc, "utf8").match(/[0-9a-f]{64}/)?.[0];
  const gốcThật = băm(bytesManifest);
  const gốcKhớp = gốcMong === gốcThật;
  console.log(`\n  ${gốcKhớp ? "✓" : "✗"} GỐC (sha256 của MANIFEST.txt)`);
  console.log(`      công bố : ${gốcMong}`);
  console.log(`      tính lại: ${gốcThật}`);

  const hỏng = lệch + thiếu + (gốcKhớp ? 0 : 1);
  console.log(`\n${hỏng === 0 ? "✅" : "🔴"} ${ok} tệp khớp · ${lệch} lệch byte · ${thiếu} thiếu · gốc ${gốcKhớp ? "khớp" : "LỆCH"}`);
  process.exit(hỏng === 0 ? 0 : 1);
}

// ═════════════════════════════ CHẾ ĐỘ XUẤT ═════════════════════════════
const RPC = (cờ("--rpc", "http://127.0.0.1:9650")).replace(/\/+$/, "");
const RA = cờ("--out");
const TEP_KEM = cờNhiều("--attach");
const TRAN_BLOCK = cờ("--max-blocks") ? Number(cờ("--max-blocks")) : Infinity;

if (!RA) {
  console.error("thiếu --out <thư mục>  (hoặc --check <thư mục> để kiểm lại)");
  process.exit(2);
}
if (existsSync(RA) && readdirSync(RA).length) {
  console.error(`🔴 ${RA} đã có nội dung. Chọn thư mục khác — ghi đè lên một bộ xuất cũ là xoá vật chứng.`);
  process.exit(2);
}

async function gọi(đường, method, params = {}) {
  const r = await fetch(`${RPC}${đường}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const j = await r.json();
  if (j.error) throw new Error(`${method}: ${j.error.message ?? JSON.stringify(j.error)}`);
  return j.result;
}
/** Gọi mà chấp nhận hỏng — nhưng GHI LẠI chỗ hỏng, không nuốt. */
const cảnhBáo = [];
async function gọiMềm(đường, method, params = {}) {
  try { return await gọi(đường, method, params); }
  catch (e) { cảnhBáo.push(`${method} (${đường}): ${e.message}`); return null; }
}

const tệp = new Map(); // đường dẫn tương đối (posix) -> Buffer
function ghi(tên, nộiDung) {
  const buf = Buffer.isBuffer(nộiDung) ? nộiDung : Buffer.from(nộiDung, "utf8");
  tệp.set(tên, buf);
}
const jsonỔnĐịnh = (o) => JSON.stringify(o, null, 2) + "\n";

console.log("═══ XUẤT MẠNG TRƯỚC KHI XOÁ (quy trình O2) ═══");
console.log(`rpc : ${RPC}`);
console.log(`ra  : ${RA}`);

// ─── info: mạng này là mạng nào ───
const info = {
  nodeVersion: await gọiMềm("/ext/info", "info.getNodeVersion"),
  networkID: await gọiMềm("/ext/info", "info.getNetworkID"),
  networkName: await gọiMềm("/ext/info", "info.getNetworkName"),
  nodeID: await gọiMềm("/ext/info", "info.getNodeID"),
  blockchains: await gọiMềm("/ext/info", "info.getBlockchainID", { alias: "C" }),
};
ghi("info.json", jsonỔnĐịnh(info));
console.log(`mạng: ${info.networkName?.networkName ?? "?"} (id ${info.networkID?.networkID ?? "?"}) · node ${info.nodeVersion?.version ?? "?"}`);

/** Xuất block thô của một chuỗi avalanchego (P hoặc X) dưới dạng hex — byte gốc, không
 *  diễn giải. Diễn giải là nơi phiên bản phần mềm len vào và làm bản xuất thôi trung lập. */
async function xuấtChuỗiThô(nhãn, đường, mHeight, mBlock) {
  const h = await gọiMềm(đường, mHeight);
  if (!h) return null;
  const cao = Number(h.height);
  const đến = Math.min(cao, TRAN_BLOCK === Infinity ? cao : TRAN_BLOCK);
  if (đến < cao) console.log(`  ⚠️ ${nhãn}: CẮT ở ${đến}/${cao} (--max-blocks)`);
  const dòng = [];
  for (let n = 0; n <= đến; n++) {
    const b = await gọiMềm(đường, mBlock, { height: n, encoding: "hex" });
    if (!b) break;
    dòng.push(JSON.stringify({ height: n, hex: b.block }));
  }
  ghi(`${nhãn}/blocks.jsonl`, dòng.join("\n") + (dòng.length ? "\n" : ""));
  console.log(`  ${nhãn}: ${dòng.length} block (chiều cao ${cao})`);
  return { cao, đãXuất: dòng.length, cắt: đến < cao };
}

// ─── P-Chain ───
const pTip = {
  height: await gọiMềm("/ext/bc/P", "platform.getHeight"),
  currentSupply: await gọiMềm("/ext/bc/P", "platform.getCurrentSupply", { subnetID: "11111111111111111111111111111111LpoYY" }),
  currentValidators: await gọiMềm("/ext/bc/P", "platform.getCurrentValidators"),
  subnets: await gọiMềm("/ext/bc/P", "platform.getSubnets"),
  blockchains: await gọiMềm("/ext/bc/P", "platform.getBlockchains"),
};
ghi("p-chain/tip.json", jsonỔnĐịnh(pTip));
const pBlocks = await xuấtChuỗiThô("p-chain", "/ext/bc/P", "platform.getHeight", "platform.getBlockByHeight");

// ─── X-Chain ───
ghi("x-chain/tip.json", jsonỔnĐịnh({ height: await gọiMềm("/ext/bc/X", "avm.getHeight") }));
const xBlocks = await xuấtChuỗiThô("x-chain", "/ext/bc/X", "avm.getHeight", "avm.getBlockByHeight");

// ─── Mọi chuỗi EVM: C-Chain + các L1 người dùng ───
// Ở đây xuất block ĐÃ DIỄN GIẢI kèm đủ giao dịch, cố ý khác P/X: đây là chuỗi người dùng
// thật đứng trên, và câu hỏi sau này sẽ là "ví X có bao nhiêu, giao dịch Y có thật không".
async function xuấtEVM(nhãn, đường) {
  const chainId = await gọiMềm(đường, "eth_chainId", []);
  const cao = await gọiMềm(đường, "eth_blockNumber", []);
  if (chainId === null || cao === null) {
    console.log(`  ⚠️ ${nhãn}: KHÔNG gọi được (${đường}) — bỏ qua, đã ghi vào 00-DOC-TRUOC.md`);
    return null;
  }
  const caoSố = parseInt(cao, 16);
  const đến = Math.min(caoSố, TRAN_BLOCK === Infinity ? caoSố : TRAN_BLOCK);
  if (đến < caoSố) console.log(`  ⚠️ ${nhãn}: CẮT ở ${đến}/${caoSố} (--max-blocks)`);
  const dòng = [];
  for (let n = 0; n <= đến; n++) {
    const b = await gọiMềm(đường, "eth_getBlockByNumber", ["0x" + n.toString(16), true]);
    if (!b) break;
    dòng.push(JSON.stringify(b));
  }
  ghi(`${nhãn}/blocks.jsonl`, dòng.join("\n") + (dòng.length ? "\n" : ""));
  ghi(`${nhãn}/tip.json`, jsonỔnĐịnh({
    rpc: đường, chainId, chainIdThập: parseInt(chainId, 16),
    blockNumber: cao, blockNumberThập: caoSố,
    hashBlockCuoi: dòng.length ? JSON.parse(dòng[dòng.length - 1]).hash : null,
  }));
  console.log(`  ${nhãn}: ${dòng.length} block (chiều cao ${caoSố}) · chainId ${parseInt(chainId, 16)}`);
  return { caoSố, cắt: đến < caoSố, chainIdThập: parseInt(chainId, 16) };
}
const cChain = await xuấtEVM("c-chain", "/ext/bc/C/rpc");
const l1Cắt = [];
const l1Xin = cờNhiều("--add-evm");
let l1ĐãXuất = 0;
for (const spec of l1Xin) {
  const [nhãn, id] = spec.split("=");
  if (!nhãn || !id) { cảnhBáo.push(`--add-evm ${spec}: sai khuôn, cần nhãn=blockchainID`); continue; }
  const r = await xuấtEVM(`l1-${nhãn}`, `/ext/bc/${id}/rpc`);
  if (r === null) cảnhBáo.push(`--add-evm ${spec}: node không phục vụ chuỗi này (không track subnet?) — KHÔNG có trong bộ xuất`);
  else { l1ĐãXuất++; if (r.cắt) l1Cắt.push(`l1-${nhãn}`); }
}

// ─── Tệp cục bộ kèm theo ───
for (const đ of TEP_KEM) {
  if (!existsSync(đ)) { cảnhBáo.push(`--attach ${đ}: không tồn tại, BỎ QUA`); console.log(`  ⚠️ bỏ qua ${đ} (không tồn tại)`); continue; }
  ghi(posix.join("tep-kem", basename(đ)), readFileSync(đ));
  console.log(`  kèm: ${đ}`);
}

// ─── Tờ đầu: bộ này là gì, và KHÔNG chứa gì ───
const cắtGì = [
  pBlocks?.cắt ? "P-Chain" : null, xBlocks?.cắt ? "X-Chain" : null, cChain?.cắt ? "C-Chain" : null,
  ...l1Cắt,
].filter(Boolean);
// 🔴 Đếm cái ĐÃ XUẤT, không đếm cái ĐÃ XIN. Bản đầu đếm nhầm và tờ đầu khai "kèm 1 L1"
// trong khi L1 đó gọi hỏng và không có một byte nào trong bộ — đúng lớp lỗi tệp này sinh
// ra để chặn, và nó suýt đi vào chính công cụ chống nói dối.
ghi("00-DOC-TRUOC.md", `# Bộ xuất mạng trước khi xoá — quy trình O2

Mạng: **${info.networkName?.networkName ?? "?"}** (networkID ${info.networkID?.networkID ?? "?"}) ·
node \`${info.nodeVersion?.version ?? "?"}\` · C-Chain chainId **${cChain?.chainIdThập ?? "?"}**
L1 người dùng: **xin ${l1Xin.length} · XUẤT ĐƯỢC ${l1ĐãXuất}**${l1ĐãXuất < l1Xin.length ? " 🔴 **THIẾU — xem mục “Chỗ không lấy được” bên dưới.**" : ""}${l1Xin.length === 0 ? " — 🔴 **KHÔNG có L1 nào trong bộ này.** Nếu mạng đang phục vụ L1 người dùng thì bộ xuất này **thiếu**; xem `--add-evm`." : ""}

## Kiểm lại bộ này

\`\`\`bash
node scripts/export-chain.mjs --check <thư mục này>
# hoặc, KHÔNG cần tin bài trên, bằng công cụ chuẩn:
cd <thư mục này> && sha256sum -c MANIFEST.txt && sha256sum MANIFEST.txt
\`\`\`

Con số phải công bố là **\`GOC.txt\`** — \`sha256\` của \`MANIFEST.txt\`. Nó neo toàn bộ phần
còn lại, nên công bố một dòng đó là đủ.

## 🔴 Bộ này KHÔNG chứa

- **Không khôi phục lại được mạng.** Đây là **vật chứng**, không phải bản sao lưu.
  Không có LevelDB, không có staker key, không dựng lại node từ đây được.
- **Không có khoá bí mật nào** — cố ý.
- **Không có DB Blockscout** (chỉ số phái sinh; nguồn gốc là block, đã có ở đây).
- **Không có trạng thái ví ở từng thời điểm** — chỉ có block. Số dư suy lại được từ block,
  nhưng phải tự dựng lại, bộ này không tính hộ.

## 🔴 \`GỐC\` neo một THỜI ĐIỂM, không neo một chuỗi

**Hai lượt xuất cùng một mạng KHÔNG bao giờ ra cùng \`GỐC\`** — kể cả khi mạng không đẻ thêm
block nào. Đo được: hai lượt cách nhau vài phút trên mạng công khai \`2026-08-27\` ra hai
\`GỐC\` khác nhau, khác nhau **duy nhất** ở \`p-chain/tip.json\`, và trong đó **duy nhất** ở
trường \`uptime\` của validator (\`99.8756\` → \`99.8758\`).

\`uptime\` là số đo **trôi liên tục**, và sâu hơn: **nó không phải thuộc tính của chuỗi** — nó
là *ý kiến của node đang được hỏi* về các peer của nó, nên hỏi node khác sẽ ra số khác.

**Nghĩa là gì, đọc cho đúng:**
- \`GỐC\` chứng minh *"đây đúng là bộ byte tôi lấy lúc T"* — nó **có** chống được sửa đổi sau
  khi xuất (đã đối chứng ngược: sửa 1 byte ⇒ đỏ; sửa cả MANIFEST để che ⇒ \`GỐC\` vẫn đỏ).
- Nó **không** chứng minh *"chuỗi lúc đó là như thế này và ai xuất cũng ra thế"*. Hai người
  xuất cùng lúc sẽ ra hai \`GỐC\` khác nhau, và **cả hai đều đúng**.
- ⇒ Thấy hai \`GỐC\` lệch thì **đừng kết luận có người sửa**. So từng tệp trước; nếu chỉ lệch
  ở \`tip.json\` thì đó là chuyện bình thường.
${cắtGì.length ? `\n🔴 **BỘ NÀY BỊ CẮT** ở: ${cắtGì.join(", ")} (\`--max-blocks\`). Nó KHÔNG đầy đủ.\n` : ""}
${cảnhBáo.length ? `\n## ⚠️ Chỗ không lấy được\n\n${cảnhBáo.map((c) => `- ${c}`).join("\n")}\n` : ""}
`);

// ─── Ghi ra đĩa ───
mkdirSync(RA, { recursive: true });
const tênSắp = [...tệp.keys()].sort();
for (const tên of tênSắp) {
  const đ = join(RA, tên);
  mkdirSync(join(RA, posix.dirname(tên)), { recursive: true });
  writeFileSync(đ, tệp.get(tên));
}

// ─── MANIFEST + GỐC ───
// Khuôn `sha256sum`: "<hash><2 khoảng trắng><đường dẫn>". Giữ đúng để kiểm lại được bằng
// công cụ chuẩn — một bộ vật chứng chỉ kiểm được bằng chính công cụ sinh ra nó thì yếu.
// LF tường minh: repo này chạy trên Windows, mà CRLF làm đổi hash và làm hỏng `sha256sum -c`.
const manifest = tênSắp.map((tên) => `${băm(tệp.get(tên))}  ${tên}`).join("\n") + "\n";
writeFileSync(join(RA, "MANIFEST.txt"), Buffer.from(manifest, "utf8"));
const gốc = băm(Buffer.from(manifest, "utf8"));
const tổngByte = tênSắp.reduce((s, t) => s + tệp.get(t).length, 0);
writeFileSync(join(RA, "GOC.txt"),
  Buffer.from(`${gốc}  MANIFEST.txt\n# ${tênSắp.length} tệp · ${tổngByte} byte\n`, "utf8"));

console.log(`\n${tênSắp.length} tệp · ${tổngByte} byte`);
if (cảnhBáo.length) {
  console.log(`\n⚠️ ${cảnhBáo.length} chỗ không lấy được (đã ghi vào 00-DOC-TRUOC.md):`);
  cảnhBáo.forEach((c) => console.log(`   · ${c}`));
}
console.log(`\n═══ CÔNG BỐ DÒNG NÀY TRƯỚC KHI XOÁ MẠNG ═══`);
console.log(`  sha256(MANIFEST.txt) = ${gốc}`);
console.log(`\n🔴 Công bố = đưa con số đó ra chỗ NGOÀI thư mục này (commit vào git, đăng lên`);
console.log(`   trang, nhắn cho người khác). Để nó nằm cạnh dữ liệu nó bảo vệ thì nó không`);
console.log(`   bảo vệ gì cả — ai sửa được dữ liệu thì cũng sửa được nó.`);
