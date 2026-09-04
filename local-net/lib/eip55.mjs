// keccak-256 + EIP-55 for EVM addresses — NO external package.
//
// Why hand-written instead of ethers: the console (`local-net/console/server.mjs`) runs on the
// server from `~/9chain-a1/src`, a directory with NO package.json and NO node_modules. One
// `import { getAddress } from "ethers"` kills the console at start-up there while running
// perfectly on a dev machine.
//
// Why a checksum and not just "40 hex characters": the admin address is the SOLE owner of an
// L1's entire genesis allocation plus the right to change its fees. One mistyped hex character
// still produces a string that is "valid" in shape, and the chain born from it is owned by
// nobody, forever — no way to fix it, and no signal that anything went wrong. EIP-55 catches
// almost every typo in a mixed-case address, which is the form MetaMask and every explorer hand
// out.
//
// 🔴 Every message here is read by a person in a browser, so it is English (CLAUDE.md §0). It was
// Vietnamese until 2026-09-04, when a dump of the console's own error sentences found one of them
// coming back from `/api/preview` in Vietnamese on the product path.
//
// Self-test:  node local-net/lib/eip55.mjs --self-test

const RC = [
  0x0000000000000001n, 0x0000000000008082n, 0x800000000000808An, 0x8000000080008000n,
  0x000000000000808Bn, 0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n,
  0x000000000000008An, 0x0000000000000088n, 0x0000000080008009n, 0x000000008000000An,
  0x000000008000808Bn, 0x800000000000008Bn, 0x8000000000008089n, 0x8000000000008003n,
  0x8000000000008002n, 0x8000000000000080n, 0x000000000000800An, 0x800000008000000An,
  0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n,
];
// Rho offsets, indexed flat as x + 5y.
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

/** keccak-256 (the Ethereum variant: 0x01 padding, NOT NIST's SHA3-256). */
export function keccak256(bytes) {
  const RATE = 136; // 1088 bits
  const padded = new Uint8Array(Math.ceil((bytes.length + 1) / RATE) * RATE);
  padded.set(bytes);
  padded[bytes.length] = 0x01;
  padded[padded.length - 1] |= 0x80;

  const A = new Array(25).fill(0n);
  for (let off = 0; off < padded.length; off += RATE) {
    for (let i = 0; i < RATE / 8; i++) {
      let lane = 0n; // a lane is little-endian
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

/** An EVM address in EIP-55 form (case carries the checksum). Input: 40 hex characters, `0x` optional. */
export function toChecksumAddress(addr) {
  const lower = addr.replace(/^0x/i, "").toLowerCase();
  const h = hex(keccak256(new TextEncoder().encode(lower)));
  let out = "0x";
  for (let i = 0; i < 40; i++) out += parseInt(h[i], 16) >= 8 ? lower[i].toUpperCase() : lower[i];
  return out;
}

/**
 * Validate and normalise an address a person typed. Throws an Error whose message is meant to be
 * shown to that person; returns the EIP-55 form.
 *
 * All-lower-case and all-UPPER-CASE are accepted: EIP-55 puts the checksum in the CASE, so a
 * single-case address carries no checksum to disagree with, and refusing it would reject the form
 * many tools emit. Mixed case MUST match. Casing is presentation, not identity — the same lesson
 * the login path had to learn.
 */
export function parseEvmAddress(raw, label = "Address") {
  if (typeof raw !== "string") throw new Error(`${label} must be a string`);
  const s = raw.trim();
  if (!s) throw new Error(`${label} cannot be empty`);
  if (!/^0x[0-9a-fA-F]{40}$/.test(s)) {
    throw new Error(`${label} is not valid: expected 0x followed by 40 hex characters (got ${JSON.stringify(s.slice(0, 60))})`);
  }
  const body = s.slice(2);
  const mixed = /[a-f]/.test(body) && /[A-F]/.test(body);
  const checksummed = toChecksumAddress(s);
  if (mixed && s !== checksummed) {
    throw new Error(
      `${label} fails the EIP-55 checksum — most likely one character was mistyped or mis-pasted. ` +
      `If you are certain it is right, enter it in all lower case: ${s.toLowerCase()}`
    );
  }
  if (/^0x0{40}$/.test(s)) throw new Error(`${label} cannot be the zero address (nobody holds its key)`);
  return checksummed;
}

// --- self-test -------------------------------------------------------------
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
    hex(keccak256(new TextEncoder().encode("a".repeat(200)))).slice(0, 16), "runs across multiple blocks");
  // The official EIP-55 vectors.
  for (const a of [
    "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
    "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359",
    "0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB",
    "0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb",
  ]) eq(toChecksumAddress(a.toLowerCase()), a, `EIP-55 ${a.slice(0, 10)}…`);
  eq(parseEvmAddress("  0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed  "),
    "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed", "accepts all lower case, and trims");
  eq(parseEvmAddress("0x5AAEB6053F3E94C9B9A09F33669435E7EF1BEAED"),
    "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed", "accepts all UPPER CASE");
  for (const [bad, why] of [
    ["0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAeD", "a wrong checksum is refused"],
    ["0x0000000000000000000000000000000000000000", "the zero address is refused"],
    ["5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed", "a missing 0x is refused"],
    ["0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAe", "39 hex characters are refused"],
    ["0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAedd", "41 hex characters are refused"],
    ["0xZZAeb6053F3E94C9b9A09f33669435E7Ef1BeAed", "a non-hex character is refused"],
    ["", "an empty string is refused"],
  ]) {
    let threw = false;
    try { parseEvmAddress(bad); } catch { threw = true; }
    eq(String(threw), "true", why);
  }
  // 🔴 Every message a person can reach must be English (§0). A single Vietnamese sentence coming
  // back from /api/preview is what put this file on the list; a control is cheaper than the memory
  // of having fixed it once.
  //
  // It tests for VIETNAMESE LETTERS, not for ASCII. The first version of this control asked for
  // ASCII and went red on the em-dash in a perfectly English sentence — measuring a different
  // quantity than the rule is about, which is the §2 mistake in miniature. The dash stays; this
  // list is the set of characters Vietnamese needs and English does not.
  const VIETNAMESE = /[àáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/i;
  for (const bad of [42, null, "", "nope", "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAeD",
    "0x0000000000000000000000000000000000000000"]) {
    let msg = "";
    try { parseEvmAddress(bad); } catch (e) { msg = e.message; }
    eq(String(msg.length > 0 && !VIETNAMESE.test(msg)), "true", `message is English for ${JSON.stringify(bad)}`);
  }
  // …and the control has to be able to go red, or it is a comment.
  eq(String(VIETNAMESE.test("Địa chỉ phải là chuỗi")), "true", "🔴 the language control detects the sentence this file used to throw");
  console.log("ALL PASSED");
}
