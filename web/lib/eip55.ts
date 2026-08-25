/**
 * EIP-55 phía trình duyệt — bản TypeScript của `local-net/lib/eip55.mjs`.
 *
 * ═══ VÌ SAO ĐỊA CHỈ PHẢI KIỂM KHẮT KHE Ở NGAY Ô NHẬP ═══
 * Genesis của một L1 đã đẻ là **bất biến**. Gõ sai một ký tự hex trong địa chỉ chủ
 * chain vẫn "đúng hình thức" (vẫn là 40 hex) và chain ra đời **vĩnh viễn vô chủ** —
 * không lỗi, không dấu hiệu, không ai lấy lại được. Đây là lớp lỗi tệ nhất của cả
 * dự án. Checksum EIP-55 bắt được đúng loại sai đó, nên nó phải chạy **lúc người ta
 * đang gõ**, không phải lúc server từ chối.
 *
 * ═══ VÌ SAO CHÉP CHỨ KHÔNG IMPORT FILE .mjs ═══
 * `local-net/lib/eip55.mjs` nằm NGOÀI thư mục `web/`. Kéo nó qua biên bundler là
 * thêm một đường phụ thuộc mà `next build` phải giữ đúng mãi mãi, đổi lấy việc
 * khỏi chép ~40 dòng. Thay vào đó: chép, rồi **đo trôi lệch bằng test** —
 * `web/test/eip55.test.ts` chạy CẢ HAI bản trên cùng một bộ vector (gồm vector
 * ngẫu nhiên) và bắt chúng phải trả về y hệt nhau. Cùng cách đã dùng cho tokens.
 *
 * keccak-256 viết tay (không phải sha3-256 của WebCrypto — chúng KHÁC nhau ở phần
 * đệm; nhầm hai thứ này cho ra checksum sai mà vẫn "chạy").
 */

const RC: bigint[] = [
  0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an, 0x8000000080008000n,
  0x000000000000808bn, 0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n,
  0x000000000000008an, 0x0000000000000088n, 0x0000000080008009n, 0x000000008000000an,
  0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n, 0x8000000000008003n,
  0x8000000000008002n, 0x8000000000000080n, 0x000000000000800an, 0x800000008000000an,
  0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n,
];
const R = [0, 1, 62, 28, 27, 36, 44, 6, 55, 20, 3, 10, 43, 25, 39, 41, 45, 15, 21, 8, 18, 2, 61, 56, 14];
const M64 = 0xffffffffffffffffn;
const rotl = (v: bigint, n: number): bigint =>
  n === 0 ? v : ((v << BigInt(n)) | (v >> BigInt(64 - n))) & M64;

function keccakF(A: bigint[]): void {
  for (let round = 0; round < 24; round++) {
    const C = new Array<bigint>(5);
    for (let x = 0; x < 5; x++) C[x] = A[x] ^ A[x + 5] ^ A[x + 10] ^ A[x + 15] ^ A[x + 20];
    for (let x = 0; x < 5; x++) {
      const D = C[(x + 4) % 5] ^ rotl(C[(x + 1) % 5], 1);
      for (let y = 0; y < 5; y++) A[x + 5 * y] ^= D;
    }
    const B = new Array<bigint>(25);
    for (let x = 0; x < 5; x++)
      for (let y = 0; y < 5; y++)
        B[y + 5 * ((2 * x + 3 * y) % 5)] = rotl(A[x + 5 * y], R[x + 5 * y]);
    for (let x = 0; x < 5; x++)
      for (let y = 0; y < 5; y++)
        A[x + 5 * y] = B[x + 5 * y] ^ (~B[((x + 1) % 5) + 5 * y] & M64 & B[((x + 2) % 5) + 5 * y]);
    A[0] ^= RC[round];
  }
}

export function keccak256(bytes: Uint8Array): Uint8Array {
  const rate = 136;
  const pad = rate - (bytes.length % rate);
  const input = new Uint8Array(bytes.length + pad);
  input.set(bytes);
  input[bytes.length] = 0x01; // 🔴 0x01, KHÔNG phải 0x06 — 0x06 là SHA3-256 chuẩn NIST
  input[input.length - 1] |= 0x80;

  const A = new Array<bigint>(25).fill(0n);
  for (let off = 0; off < input.length; off += rate) {
    for (let i = 0; i < rate / 8; i++) {
      let lane = 0n;
      for (let b = 7; b >= 0; b--) lane = (lane << 8n) | BigInt(input[off + i * 8 + b]);
      A[i] ^= lane;
    }
    keccakF(A);
  }
  const out = new Uint8Array(32);
  for (let i = 0; i < 4; i++) {
    let lane = A[i];
    for (let b = 0; b < 8; b++) {
      out[i * 8 + b] = Number(lane & 0xffn);
      lane >>= 8n;
    }
  }
  return out;
}

const hex = (bytes: Uint8Array): string =>
  [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');

/** Địa chỉ EVM dạng EIP-55 (viết hoa/thường theo checksum). */
export function toChecksumAddress(addr: string): string {
  const lower = addr.replace(/^0x/i, '').toLowerCase();
  const h = hex(keccak256(new TextEncoder().encode(lower)));
  let out = '0x';
  for (let i = 0; i < 40; i++) out += parseInt(h[i], 16) >= 8 ? lower[i].toUpperCase() : lower[i];
  return out;
}

export type KetQuaDiaChi =
  | { ok: true; diaChi: string }
  | { ok: false; loi: string; goiY?: string };

/**
 * Kiểm + chuẩn hoá địa chỉ người dùng nhập. **Trả kết quả, không ném lỗi** — ở giao
 * diện, một ô đang gõ dở là trạng thái bình thường chứ không phải sự cố; try/catch
 * quanh mỗi phím gõ là dùng ngoại lệ làm luồng điều khiển.
 *
 * Địa chỉ toàn hoa hoặc toàn thường được chấp nhận (không mang thông tin checksum);
 * hoa/thường lẫn lộn thì BẮT BUỘC khớp EIP-55.
 */
export function kiemDiaChi(raw: string, nhan = 'Địa chỉ'): KetQuaDiaChi {
  const s = (raw ?? '').trim();
  if (!s) return { ok: false, loi: `${nhan} không được để trống` };
  if (!/^0x[0-9a-fA-F]{40}$/.test(s)) {
    return { ok: false, loi: `${nhan} phải là 0x + 40 ký tự hex` };
  }
  const body = s.slice(2);
  const lanLon = /[a-f]/.test(body) && /[A-F]/.test(body);
  const chuan = toChecksumAddress(s);
  if (lanLon && s !== chuan) {
    return {
      ok: false,
      loi: `${nhan} sai checksum EIP-55 — nhiều khả năng gõ/dán nhầm một ký tự`,
      goiY: s.toLowerCase(),
    };
  }
  if (/^0x0{40}$/.test(s)) {
    return { ok: false, loi: `${nhan} không được là địa chỉ 0 (không ai giữ khoá)` };
  }
  return { ok: true, diaChi: chuan };
}

/** Rút gọn để hiện trên giao diện hẹp. Giữ đủ hai đầu để người ta đối chiếu được. */
export function rutGon(addr: string, dau = 6, cuoi = 4): string {
  if (!addr || addr.length <= dau + cuoi + 2) return addr;
  return `${addr.slice(0, dau + 2)}…${addr.slice(-cuoi)}`;
}
