import { describe, expect, it } from 'vitest';
import { faucetRequestsNeeded, nanoToLove9 } from '../lib/validators';

/**
 * The two conversions on `/validators/` that decide what a stranger sends to a chain.
 *
 * Both are here because both have a wrong answer that LOOKS right on screen, which is the
 * only kind of error this page can make that costs a reader real time:
 *
 *   · `81` and `81,000,000,000` are both plausible-looking numbers on a page about staking.
 *     P-Chain reports nano (9 decimals), a wallet shows wei (18) — a billion apart.
 *   · `bond / perRequest` is the obvious arithmetic and it is off by exactly one request,
 *     which is the difference between staking today and waiting an hour for the per-IP
 *     limit to clear. The live page rendered `9 × 9 = 81 ≥ 81` under a paragraph that said
 *     ten — measured 2026-09-05, fixed here.
 */
describe('the faucet arithmetic', () => {
  it('adds a request on top of the bond, because fees come out of the same balance', () => {
    // The live values on 2026-09-05: bond 81, faucet 9 per request.
    expect(faucetRequestsNeeded(81, 9)).toBe(10);
    // REVERSE: the obvious formula would say nine, and nine is the claim the page retracts.
    expect(Math.ceil(81 / 9)).toBe(9);
  });

  it('still rounds up when the bond is not a multiple of the request', () => {
    expect(faucetRequestsNeeded(80, 9)).toBe(10); // ceil(80/9) = 9, plus one for fees
    expect(faucetRequestsNeeded(1, 9)).toBe(2);
  });

  it('returns nothing rather than a number when either reading is missing', () => {
    // A page that invents this number sends someone to a wallet with the wrong plan.
    expect(faucetRequestsNeeded(null, 9)).toBe(null);
    expect(faucetRequestsNeeded(81, null)).toBe(null);
    expect(faucetRequestsNeeded(81, 0)).toBe(null);
  });
});

describe('nano → LOVE9', () => {
  it('converts what P-Chain actually returned on 2026-09-05', () => {
    expect(nanoToLove9('81000000000')).toBe(81);
    expect(nanoToLove9('9000000000')).toBe(9);
  });

  it('refuses to turn an unreadable value into a number', () => {
    expect(nanoToLove9(null)).toBe(null);
    expect(nanoToLove9('not-a-number')).toBe(null);
  });
});
