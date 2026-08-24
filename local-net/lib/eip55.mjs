// keccak-256 + EIP-55 cho địa chỉ EVM — KHÔNG phụ thuộc gói ngoài.
//
// Vì sao viết tay thay vì dùng ethers: console (`local-net/console/server.mjs`)
// chạy trên server ở `~/9chain-a1/src` — chỗ đó KHÔNG có package.json cũng
// KHÔNG có node_modules. Thêm một `import { getAddress } from "ethers"` là console
// chết ngay lúc khởi động trên server dù chạy ngon trên máy dev.
//
// Vì sao cần checksum chứ không chỉ kiểm tra 40 ký tự hex: địa chỉ admin là chủ
// sở hữu DUY NHẤT của toàn bộ phân bổ genesis + quyền chỉnh phí của một L1. Gõ
// sai một ký tự hex vẫn ra chuỗi "hợp lệ" về hình thức, và chain đẻ ra sẽ vĩnh
// viễn không ai sở hữu — không có cách nào sửa, không có dấu hiệu báo lỗi.
// EIP-55 bắt gần như mọi lỗi gõ nhầm với địa chỉ có hoa/thường lẫn lộn (dạng mà
// MetaMask và mọi explorer đưa ra).
//
// Tự kiểm chứng:  node local-net/lib/eip55.mjs --self-test

const RC = [
  0x0000000000000001n, 0x0000000000008082n, 0x800000000000808An, 0x8000000080008000n,
  0x000000000000808Bn, 0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n,
  0x000000000000008An, 0x0000000000000088n, 0x0000000080008009n, 0x000000008000000An,
  0x000000008000808Bn, 0x800000000000008Bn, 0x8000000000008089n, 0x8000000000008003n,
  0x8000000000008002n, 0x8000000000000080n, 0x000000000000800An, 0x800000008000000An,
  0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n,
];
// Độ dịch rho theo chỉ số phẳng x + 5y.
const R = [0, 1, 62, 28, 27, 36, 44, 6, 55, 20, 3, 10, 43, 25, 39, 41, 45, 15, 21, 8, 18, 2, 61, 56, 14];
const M64 = 0xFFFFFFFFFFFFFFFFn;
const rotl = (v, n) => n === 0 ? v : ((v << BigInt(n)) | (v >> BigInt(64 - n))) & M64;

function keccakF(A) {
  const B = new Array(25), C = new Array(5), D = new Array(5);
  for (let round = 0; round < 24; round++) {
    for (let x = 0; x < 5; x++) C[x] = A[x] ^ A[x + 5] ^ A[x + 10] ^ A[x + 15] ^ A[x + 20];
    for (let x = 0; x < 5; x++) D[x] = C[(x + 4) % 5] ^ rotl(C[(x + 1) % 5], 1);
    for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) A[x + 5 * y] ^= D[x];
    for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) {
      B[y + 5 * ((2 * x + 3 * y) % 5)] = rotl(A[x + 5 * y], R[x + 5 * y]);
    }
    for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) {
      A[x + 5 * y] = B[x + 5 * y] ^ ((~B[(x + 1) % 5 + 5 * y] & M64) & B[(x + 2) % 5 + 5 * y]);
    }
    A[0] ^= RC[round];
  }
  return A;
}

/** keccak-256 (bản Ethereum: đệm 0x01, KHÔNG phải SHA3-256 của NIST). */
export function keccak256(bytes) {
  const RATE = 136; // 1088 bit
  const padded = new Uint8Array(Math.ceil((bytes.length + 1) / RATE) * RATE);
  padded.set(bytes);
  padded[bytes.length] = 0x01;
  padded[padded.length - 1] |= 0x80;

  const A = new Array(25).fill(0n);
  for (let off = 0; off < padded.length; off += RATE) {
    for (let i = 0; i < RATE / 8; i++) {
      let lane = 0n; // lane là little-endian
      for (let b = 7; b >= 0; b--) lane = (lane << 8n) | BigInt(padded[off + i * 8 + b]);
      A[i] ^= lane;
    }
    keccakF(A);
  }
  const out = new Uint8Array(32);
  for (let i = 0; i < 4; i++) {
    let lane = A[i];
    for (let b = 0; b < 8; b++) { out[i * 8 + b] = Number(lane & 0xFFn); lane >>= 8n; }
  }
  return out;
}

const hex = (bytes) => [...bytes].map(b => b.toString(16).padStart(2, "0")).join("");

/** Địa chỉ EVM dạng EIP-55 (viết hoa/thường theo checksum). Đầu vào: 40 ký tự hex, có hoặc không `0x`. */
export function toChecksumAddress(addr) {
  const lower = addr.replace(/^0x/i, "").toLowerCase();
  const h = hex(keccak256(new TextEncoder().encode(lower)));
  let out = "0x";
  for (let i = 0; i < 40; i++) out += parseInt(h[i], 16) >= 8 ? lower[i].toUpperCase() : lower[i];
  return out;
}

/**
 * Kiểm tra + chuẩn hoá một địa chỉ EVM do người dùng nhập.
 *
 * Ném Error với thông báo tiếng Việt nếu không hợp lệ. Trả về dạng EIP-55.
 * Địa chỉ toàn hoa hoặc toàn thường được chấp nhận (không mang thông tin
 * checksum); hoa/thường lẫn lộn thì BẮT BUỘC khớp EIP-55.
 */
export function parseEvmAddress(raw, label = "Địa chỉ") {
  if (typeof raw !== "string") throw new Error(`${label} phải là chuỗi`);
  const s = raw.trim();
  if (!s) throw new Error(`${label} không được để trống`);
  if (!/^0x[0-9a-fA-F]{40}$/.test(s)) {
    throw new Error(`${label} không hợp lệ: phải là 0x + 40 ký tự hex (nhận được ${JSON.stringify(s.slice(0, 60))})`);
  }
  const body = s.slice(2);
  const mixed = /[a-f]/.test(body) && /[A-F]/.test(body);
  const checksummed = toChecksumAddress(s);
  if (mixed && s !== checksummed) {
    throw new Error(
      `${label} sai checksum EIP-55 — nhiều khả năng gõ/dán nhầm một ký tự. ` +
      `Nếu chắc chắn đúng, nhập toàn chữ thường: ${s.toLowerCase()}`
    );
  }
  if (/^0x0{40}$/.test(s)) throw new Error(`${label} không được là địa chỉ 0 (không ai giữ khoá)`);
  return checksummed;
}

// --- tự kiểm chứng ---------------------------------------------------------
if (process.argv[1] && process.argv[1].endsWith("eip55.mjs") && process.argv.includes("--self-test")) {
  const eq = (got, want, what) => {
    if (got !== want) { console.error(`FAIL ${what}\n  got  ${got}\n  want ${want}`); process.exit(1); }
    console.log(`ok   ${what}`);
  };
  eq(hex(keccak256(new TextEncoder().encode(""))),
    "c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470", 'keccak256("")');
  eq(hex(keccak256(new TextEncoder().encode("abc"))),
    "4e03657aea45a94fc7d47ba826c8d667c0d1e6e33a64a036ec44f58fa12d6c45", 'keccak256("abc")');
  eq(hex(keccak256(new TextEncoder().encode("a".repeat(200)))).slice(0, 16),
    hex(keccak256(new TextEncoder().encode("a".repeat(200)))).slice(0, 16), "nhiều block chạy được");
  // Vector chính thức của EIP-55.
  for (const a of [
    "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
    "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359",
    "0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB",
    "0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb",
  ]) eq(toChecksumAddress(a.toLowerCase()), a, `EIP-55 ${a.slice(0, 10)}…`);
  eq(parseEvmAddress("  0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed  "),
    "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed", "chấp nhận toàn chữ thường + trim");
  eq(parseEvmAddress("0x5AAEB6053F3E94C9B9A09F33669435E7EF1BEAED"),
    "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed", "chấp nhận toàn chữ HOA");
  for (const [bad, why] of [
    ["0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAeD", "checksum sai bị chặn"],
    ["0x0000000000000000000000000000000000000000", "địa chỉ 0 bị chặn"],
    ["5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed", "thiếu 0x bị chặn"],
    ["0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAe", "39 hex bị chặn"],
    ["0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAedd", "41 hex bị chặn"],
    ["0xZZAeb6053F3E94C9b9A09f33669435E7Ef1BeAed", "ký tự không phải hex bị chặn"],
    ["", "rỗng bị chặn"],
  ]) {
    let threw = false;
    try { parseEvmAddress(bad); } catch { threw = true; }
    eq(String(threw), "true", why);
  }
  console.log("TẤT CẢ ĐỀU QUA");
}
