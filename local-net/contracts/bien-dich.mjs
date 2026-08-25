/**
 * bien-dich.mjs — biên dịch `CauTaiSan.sol` thành artifact commit được.
 *
 * ═══ VÌ SAO BIÊN DỊCH Ở ĐÂY MÀ KHÔNG PHẢI TRÊN SERVER ═══
 * Bộ biên dịch là công cụ lúc DỰNG, không phải phụ thuộc lúc CHẠY. Bắt server có
 * solc nghĩa là mọi lượt nghiệm thu phụ thuộc vào một bản solc cài ở đó, và "hợp
 * đồng chạy trên mạng công khai" trở thành thứ không tái lập được. Chép artifact
 * đã biên dịch vào repo thì thứ chạy thật là thứ đọc được trong git — cùng lý do
 * `ExampleWarp.bin` nằm sẵn trong source subnet-evm.
 *
 * Chạy (solc KHÔNG nằm trong repo — cài tạm ở đâu cũng được):
 *   npm install solc@0.8.28
 *   node local-net/contracts/bien-dich.mjs --solc <đường dẫn tới node_modules/solc>
 *
 * Kết quả: `local-net/lib/cau-tai-san.mjs` (ABI + bytecode + dấu vân tay bản dịch).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { createRequire } from "node:module";

const args = process.argv.slice(2);
const i = args.indexOf("--solc");
const duongSolc = i >= 0 && args[i + 1] ? args[i + 1] : "solc";
const require = createRequire(import.meta.url);
const solc = require(duongSolc);

const GOC = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")));
const doc = f => readFileSync(path.join(GOC, f), "utf8");

const nguon = {
  "CauTaiSan.sol": { content: doc("CauTaiSan.sol") },
  "IWarpMessenger.sol": { content: doc("IWarpMessenger.sol") },
};

// `evmVersion` KHÔNG hạ xuống `paris`.
//
// Ghi chú cũ của dự án dặn hạ vì "L1 chưa bật Durango" — đã ĐO và đã bỏ: networkID
// 9001 không phải Mainnet/Fuji ⇒ `upgrade.GetConfig` trả `Default`, ở đó
// `DurangoTime = InitiallyActiveTime` (2020-12-05) nên Durango (và Etna/Granite)
// bật sẵn từ block đầu. Bằng chứng bằng chain thật: deploy `0x5f5ff3` (PUSH0) chốt
// status 1. Hạ xuống paris là tự trói vào một EVM cũ hơn cần thiết.
const input = {
  language: "Solidity",
  sources: nguon,
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
  },
};

const kq = JSON.parse(solc.compile(JSON.stringify(input)));
const loi = (kq.errors || []).filter(e => e.severity === "error");
for (const e of kq.errors || []) console.log(`  ${e.severity}: ${e.formattedMessage.trim().split("\n")[0]}`);
if (loi.length) { console.log("✗ biên dịch hỏng"); process.exit(1); }

const hd = kq.contracts["CauTaiSan.sol"]["CauTaiSan"];
const bytecode = "0x" + hd.evm.bytecode.object;
if (bytecode.length <= 2) { console.log("✗ bytecode rỗng"); process.exit(1); }

// Vân tay của NGUỒN, không phải của bytecode: nó trả lời đúng câu hỏi hay bị hỏi
// nhất — "artifact trong repo có còn khớp file .sol trong repo không". Bytecode đổi
// theo phiên bản solc, nguồn thì không.
const van = createHash("sha256").update(nguon["CauTaiSan.sol"].content).digest("hex").slice(0, 16);

const ra = `/**
 * CauTaiSan — artifact SINH TỰ ĐỘNG, đừng sửa tay.
 *
 * Nguồn : local-net/contracts/CauTaiSan.sol  (sha256 16 ký tự đầu: ${van})
 * solc  : ${solc.version()}
 * dựng lại: node local-net/contracts/bien-dich.mjs --solc <đường dẫn solc>
 */
export const CAU_TAI_SAN_ABI = ${JSON.stringify(hd.abi, null, 2)};

export const CAU_TAI_SAN_BIN = "${bytecode}";

/** sha256 (16 ký tự đầu) của file .sol lúc biên dịch — bài kiểm đối chiếu lại. */
export const CAU_TAI_SAN_VAN_TAY_NGUON = "${van}";
`;
const dich = path.join(GOC, "..", "lib", "cau-tai-san.mjs");
writeFileSync(dich, ra);
console.log(`✓ ${path.relative(process.cwd(), dich)} — ${(bytecode.length - 2) / 2} byte, vân tay nguồn ${van}`);
