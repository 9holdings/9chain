/**
 * cb58 — cách avalanchego viết mọi ID ra chuỗi (subnetID, blockchainID, messageID).
 *
 * ═══ VÌ SAO CẦN THỨ NÀY Ở PHÍA JS ═══
 * API Warp nhận messageID dưới dạng `ids.ID`, mà `ids.ID` đọc/ghi JSON bằng **cb58**
 * (`ids/id.go:165` → `cb58.Encode`). Trong khi đó messageID mà EVM đưa cho ta lại là
 * **topic của log**, tức 32 byte hex. Không có cầu nối giữa hai cách viết thì không
 * hỏi được chữ ký tổng hợp — và lỗi trả về sẽ là "failed to parse", đọc như lỗi cú
 * pháp chứ không như "sai bảng mã".
 *
 * cb58 = base58(payload ‖ 4 byte cuối của sha256(payload)).
 * Nguồn: `utils/formatting/encoding.go:19,108-110` + `utils/hashing/hashing.go:76`.
 *
 * Zero-dep (chỉ `node:crypto`) — cùng lý do với eip55.mjs: thư mục gốc trên server
 * KHÔNG có node_modules, thêm một import lạ là console chết lúc khởi động.
 */
import { createHash } from "node:crypto";

// Bảng của Bitcoin (bỏ 0 O I l). Gõ nhầm một ký tự ở đây là mọi ID lệch một cách
// im lặng, nên bảng này được nghiệm thu bằng ID THẬT của mạng — xem selfTest().
const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function base58Encode(bytes) {
  // Chuyển cả mảng byte thành MỘT số nguyên lớn rồi chia liên tiếp. BigInt là bắt
  // buộc: 36 byte vượt xa Number.MAX_SAFE_INTEGER, làm bằng Number thì kết quả sai
  // mà không có lỗi nào báo.
  let n = 0n;
  for (const b of bytes) n = (n << 8n) | BigInt(b);
  let out = "";
  while (n > 0n) {
    out = ALPHABET[Number(n % 58n)] + out;
    n /= 58n;
  }
  // Byte 0 ở ĐẦU biến mất khi coi mảng là một số — mỗi byte 0 dẫn đầu phải được
  // viết lại thành một ký tự '1'. Bỏ bước này thì ID bắt đầu bằng 0x00 bị cụt.
  for (const b of bytes) { if (b !== 0) break; out = "1" + out; }
  return out;
}

function base58Decode(str) {
  let n = 0n;
  for (const ch of str) {
    const i = ALPHABET.indexOf(ch);
    if (i < 0) throw new Error(`ký tự không thuộc base58: ${JSON.stringify(ch)}`);
    n = n * 58n + BigInt(i);
  }
  const out = [];
  while (n > 0n) { out.unshift(Number(n & 0xffn)); n >>= 8n; }
  for (const ch of str) { if (ch !== "1") break; out.unshift(0); }
  return Uint8Array.from(out);
}

function checksum(bytes) {
  return createHash("sha256").update(bytes).digest().subarray(-4);
}

/** Uint8Array/Buffer → chuỗi cb58. */
export function cb58Encode(bytes) {
  const b = Uint8Array.from(bytes);
  const checked = new Uint8Array(b.length + 4);
  checked.set(b, 0);
  checked.set(checksum(b), b.length);
  return base58Encode(checked);
}

/** Chuỗi cb58 → Uint8Array. Ném lỗi nếu checksum không khớp. */
export function cb58Decode(str) {
  const raw = base58Decode(String(str));
  if (raw.length < 4) throw new Error("cb58 quá ngắn để chứa checksum");
  const payload = raw.subarray(0, raw.length - 4);
  const got = raw.subarray(raw.length - 4);
  const want = checksum(payload);
  for (let i = 0; i < 4; i++) {
    if (got[i] !== want[i]) throw new Error(`cb58 sai checksum: ${str}`);
  }
  return payload;
}

/** Hex 32 byte (`0x…`, dạng topic của log EVM) → cb58 mà API Warp nhận. */
export function hex32ToCb58(hex) {
  const s = String(hex).replace(/^0x/i, "");
  if (!/^[0-9a-fA-F]{64}$/.test(s)) throw new Error(`cần đúng 32 byte hex, nhận: ${hex}`);
  return cb58Encode(Uint8Array.from(s.match(/../g).map(h => parseInt(h, 16))));
}

/** cb58 → hex `0x…` (dùng để so blockchainID với `sourceChainID` trong hợp đồng). */
export function cb58ToHex(str) {
  return "0x" + [...cb58Decode(str)].map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Tự kiểm.
 *
 * Bài 2 mới là bài có giá trị: round-trip chỉ chứng minh code **tự nhất quán** —
 * bảng chữ cái sai hay quy tắc checksum sai vẫn qua sạch vì cả hai chiều cùng sai
 * một kiểu. Nên phải giải một ID THẬT do avalanchego sinh ra và bắt checksum của
 * nó khớp: chỉ cần lệch một ký tự trong bảng hoặc dùng sha256 hai lần (kiểu
 * Bitcoin base58check) là bài này đỏ.
 */
function selfTest() {
  const bai = [];
  const ok = (ten, dieuKien, chiTiet = "") => bai.push({ ten, dat: !!dieuKien, chiTiet });

  // 1) round-trip
  for (const n of [1, 20, 32, 33]) {
    const b = Uint8Array.from({ length: n }, (_, i) => (i * 37 + 11) & 0xff);
    ok(`round-trip ${n} byte`, cb58ToHex(cb58Encode(b)) === "0x" + [...b].map(x => x.toString(16).padStart(2, "0")).join(""));
  }
  // 2) byte 0 dẫn đầu không được nuốt
  const zero = new Uint8Array(32);
  ok("32 byte 0 giữ đủ độ dài", cb58Decode(cb58Encode(zero)).length === 32);

  // 3) ID THẬT do avalanchego sinh — đối chứng độc lập
  //
  // 🔴 NEO NÀY TỪNG LÀ C-CHAIN, VÀ ĐÓ LÀ MỘT CA XANH GIẢ ĐÃ SỐNG NHIỀU NGÀY.
  //
  // Bản trước cắm cứng `2s5pikvmRzazmG22kBDvvVsz9HtB8pt3DfsvUvAW6LsyQT2mTt` kèm chú thích
  // *"cố định vĩnh viễn"*. Cả hai vế đều sai:
  //   · Số đó **đã chết** ở lượt re-genesis `26/08`. Đo `27/08` trên mạng công khai:
  //     `info.getBlockchainID{alias:"C"}` → `JPWKwpGCwSQpXNy8HUb1TFcGh57MY7B6vC7K6mzLGLpBCX4Zx`.
  //   · Bài `--self-test` vẫn **8/8 ĐẠT** suốt thời gian đó, vì ca này chỉ kiểm **checksum
  //     của chính chuỗi được cắm vào**, không đối chiếu mạng nào. Một hằng số sai vẫn có
  //     checksum đúng — nên bài xanh mãi mãi.
  //
  // **Vì sao mô hình "cố định vĩnh viễn" sai từ gốc:** C-Chain ID = `tx.ID()` của
  // `CreateChainTx` trong genesis, mà tx đó không có input/credential ⇒ ID là hàm của
  // `networkID` **+ toàn văn byte `cChainGenesis`**. netgen dựng `cChainGenesis` từ địa chỉ
  // 5 quỹ **sinh khoá mới mỗi lượt** ⇒ **mỗi lần re-genesis là một C-Chain ID mới.**
  // ⇒ Đừng cắm cứng C-Chain ID ở bất kỳ đâu. URL bền là `/ext/bc/C/rpc` (alias), không phải cb58.
  //
  // Neo mới: **P-Chain**. Nó là `ids.Empty` — hằng số của **MỌI** mạng Avalanche
  // (`utils/constants/network_ids.go`), nên nó không chết theo re-genesis, không chết theo
  // đổi `networkID`, không chết theo bất cứ thứ gì ta còn đổi được.
  //
  // ⚠️ Và nó là ca **MẠNH HƠN**, không chỉ bền hơn: `ids.Empty` = **32 byte 0**, nên nó
  // kiểm thẳng đúng cái bẫy kinh điển của base58 — *nuốt byte 0 dẫn đầu*. Ca (2) ở trên
  // kiểm điều đó bằng dữ liệu ta tự sinh; ca này kiểm bằng **chuỗi thật avalanchego in ra**.
  const P_CHAIN_ID = "11111111111111111111111111111111LpoYY"; // ids.Empty, mọi mạng Avalanche
  let hex = "";
  try { hex = cb58ToHex(P_CHAIN_ID); } catch (e) { hex = "LỖI: " + e.message; }
  ok("giải được blockchainID thật của P-Chain (checksum khớp)", /^0x[0-9a-f]{64}$/.test(hex), hex);
  ok("mã hoá ngược ra đúng chuỗi ban đầu", (() => {
    try { return cb58Encode(cb58Decode(P_CHAIN_ID)) === P_CHAIN_ID; } catch { return false; }
  })());
  // 🔴 Ô mạnh nhất: P-Chain ID PHẢI giải ra đúng 32 byte 0. Một bộ giải nuốt byte 0 dẫn đầu
  // vẫn qua được hai ô trên (round-trip tự nhất quán), nhưng chết ở đây.
  ok("P-Chain ID giải ra ĐÚNG 32 byte 0 (bẫy nuốt byte 0 dẫn đầu)", (() => {
    try {
      const b = cb58Decode(P_CHAIN_ID);
      return b.length === 32 && b.every(x => x === 0);
    } catch { return false; }
  })(), hex);

  // 4) hỏng một ký tự thì PHẢI ném lỗi — nếu không, mọi ID gõ sai sẽ đi tiếp âm thầm
  const hong = P_CHAIN_ID.slice(0, -1) + (P_CHAIN_ID.at(-1) === "Y" ? "Z" : "Y");
  let daNem = false;
  try { cb58Decode(hong); } catch { daNem = true; }
  ok("ID sai một ký tự bị từ chối", daNem);

  const dat = bai.filter(b => b.dat).length;
  for (const b of bai) console.log(`  ${b.dat ? "✓" : "✗"} ${b.ten}${b.chiTiet ? "  — " + b.chiTiet : ""}`);
  console.log(`\n════ ${dat}/${bai.length} ${dat === bai.length ? "ĐẠT" : "KHÔNG ĐẠT"} ════`);
  return dat === bai.length;
}

if (process.argv[2] === "--self-test") process.exit(selfTest() ? 0 : 1);
