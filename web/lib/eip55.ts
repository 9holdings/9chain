/**
 * EIP-55 in the browser — the TypeScript twin of `local-net/lib/eip55.mjs`.
 *
 * ═══ WHY THE ADDRESS IS CHECKED STRICTLY RIGHT AT THE INPUT ═══
 * A launched L1's genesis is **immutable**. One mistyped hex character in the chain owner's
 * address is still "well formed" (still 40 hex) and the chain is born **permanently ownerless**
 * — no error, no sign, nobody can recover it. This is the worst class of failure in the whole
 * project. The EIP-55 checksum catches exactly that kind of mistake, so it has to run **while
 * the person is typing**, not when the server refuses.
 *
 * ═══ WHY THIS IS A COPY RATHER THAN AN IMPORT OF THE .mjs ═══
 * `local-net/lib/eip55.mjs` lives OUTSIDE the `web/` directory. Dragging it across the bundler
 * boundary adds a dependency path that `next build` would have to keep working forever, in
 * exchange for not copying ~40 lines. Instead: copy, then **measure the drift with a test** —
 * `web/test/eip55.test.ts` runs BOTH versions over the same vectors (including random ones) and
 * requires identical results. The same approach used for the tokens.
 *
 * keccak-256 written out by hand (not WebCrypto's sha3-256 — they DIFFER in the padding;
 * confusing the two produces a wrong checksum that still "works").
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
  input[bytes.length] = 0x01; // 🔴 0x01, NOT 0x06 — 0x06 is the NIST-standard SHA3-256
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

/** An EVM address in EIP-55 form (upper/lower case following the checksum). */
export function toChecksumAddress(addr: string): string {
  const lower = addr.replace(/^0x/i, '').toLowerCase();
  const h = hex(keccak256(new TextEncoder().encode(lower)));
  let out = '0x';
  for (let i = 0; i < 40; i++) out += parseInt(h[i], 16) >= 8 ? lower[i].toUpperCase() : lower[i];
  return out;
}

/**
 * 🔴 RETURNS A CODE, NOT A SENTENCE (changed 2026-09-03).
 * This file holds pure functions — it cannot call `useT()`, so every sentence it builds itself
 * is frozen in ONE language. The previous version held four hard-coded Vietnamese messages and
 * `FaucetForm` printed them straight out, meaning readers in all 30 languages got Vietnamese
 * exactly while mistyping an address. The render site now looks up `t.errors[…]` by `code`.
 */
export type AddressCheck =
  | { ok: true; address: string }
  | { ok: false; code: 'empty' | 'format' | 'checksum' | 'zero'; hint?: string };

/**
 * Validate + normalise a user-entered address. **Returns a result, does not throw** — in a UI, a
 * half-typed field is a normal state rather than an incident; a try/catch around every keystroke
 * is using exceptions as control flow.
 *
 * All-upper or all-lower addresses are accepted (they carry no checksum information); mixed case
 * MUST match EIP-55.
 */
export function checkAddress(raw: string): AddressCheck {
  const s = (raw ?? '').trim();
  if (!s) return { ok: false, code: 'empty' };
  if (!/^0x[0-9a-fA-F]{40}$/.test(s)) return { ok: false, code: 'format' };
  const body = s.slice(2);
  const mixedCase = /[a-f]/.test(body) && /[A-F]/.test(body);
  const canonical = toChecksumAddress(s);
  if (mixedCase && s !== canonical) {
    // `hint` is the way out: an all-lowercase address carries NO checksum information and is
    // therefore always accepted, and that is exactly what someone who mispasted one character needs.
    return { ok: false, code: 'checksum', hint: s.toLowerCase() };
  }
  if (/^0x0{40}$/.test(s)) return { ok: false, code: 'zero' };
  return { ok: true, address: canonical };
}

/** Shorten for display in a narrow UI. Keep enough of both ends that a person can compare. */
export function shortenAddress(addr: string, head = 6, tail = 4): string {
  if (!addr || addr.length <= head + tail + 2) return addr;
  return `${addr.slice(0, head + 2)}…${addr.slice(-tail)}`;
}
