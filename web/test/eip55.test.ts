import { describe, expect, it } from 'vitest';
import { toChecksumAddress, checkAddress, shortenAddress } from '../lib/eip55';
// `allowJs` lets TS infer types straight from the .mjs file — no separate declaration needed.
import { toChecksumAddress as chuanGoc } from '../../local-net/lib/eip55.mjs';

/**
 * The TS version in `web/lib/eip55.ts` is a COPY of `local-net/lib/eip55.mjs` (the reasoning is at
 * the top of that file). This suite is the drift measurement: both versions must produce
 * **identical** results.
 *
 * 🔴 Why it is expensive: the chain owner's address goes into an IMMUTABLE genesis. If the browser
 * version accepts an address the server version rejects (or the reverse), the user hits an
 * inexplicable error at exactly the operation that cannot be redone.
 */
describe('EIP-55', () => {
  const VECTOR = [
    '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
    '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
    '0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB',
    '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb',
  ];

  it('matches the EIP-55 reference vectors', () => {
    for (const v of VECTOR) expect(toChecksumAddress(v.toLowerCase())).toBe(v);
  });

  it('matches the .mjs running on the server character for character', () => {
    // Deterministic random vectors: a fixed set only proves the two agree on a handful of cases,
    // while 200 evenly spread addresses catch a divergence in a rare branch.
    let x = 123456789n;
    for (let i = 0; i < 200; i++) {
      x = (x * 6364136223846793005n + 1442695040888963407n) & ((1n << 64n) - 1n);
      const hex = x.toString(16).padStart(16, '0').repeat(3).slice(0, 40);
      const a = '0x' + hex;
      expect(toChecksumAddress(a)).toBe(chuanGoc(a));
    }
  });

  it('rejects a bad checksum, and offers a way forward', () => {
    const hong = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAeD'; // last character changed
    const check = checkAddress(hong);
    expect(check.ok).toBe(false);
    if (!check.ok) {
      // 🔴 Compare the CODE, not the wording (changed 2026-09-03). `checkAddress` now returns a code
      // and the render site looks the sentence up in the dictionary, so a string-comparing test would
      // both pin one language and go red whenever someone edits the wording.
      expect(check.code).toBe('checksum');
      // The hint has to be a way FORWARD, not a reproach.
      expect(check.hint).toBe(hong.toLowerCase());
    }
  });

  it('accepts all-lower and all-upper (they carry no checksum information)', () => {
    expect(checkAddress(VECTOR[0].toLowerCase()).ok).toBe(true);
    expect(checkAddress('0x' + VECTOR[0].slice(2).toUpperCase()).ok).toBe(true);
  });

  it('rejects the zero address and malformed strings', () => {
    expect(checkAddress('0x' + '0'.repeat(40)).ok).toBe(false);
    expect(checkAddress('0x123').ok).toBe(false);
    expect(checkAddress('').ok).toBe(false);
  });

  it('shortening keeps enough of both ends to compare', () => {
    const r = shortenAddress(VECTOR[0]);
    expect(r.startsWith('0x5aAeb6')).toBe(true);
    expect(r.endsWith('eAed')).toBe(true);
  });
});
