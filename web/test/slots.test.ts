import { describe, expect, it } from 'vitest';
import { L1_SLOTS, slotsLeft } from '../lib/chain';

/**
 * The L1 slot ceiling, and the one rule that decides what a visitor is told about it.
 *
 * `L1_SLOTS` is a hand-copied constant, which is the shape that has produced this project's
 * two most expensive silent falsehoods (the footer printed a dead networkID twice). It is
 * pinned here so a change is deliberate, and measured against the live directory by
 * `scripts/check-slots.mjs` before every deploy so a change in the WORLD is caught too.
 */
describe('L1 slots', () => {
  it('is 15 — the protocol ceiling, not a policy', () => {
    // A node dropped for declaring more than 16 subnets is a network failure, not a quota:
    // raising this number does not buy a slot, it breaks the network. If this ever changes
    // it is because the protocol changed.
    expect(L1_SLOTS).toBe(15);
  });

  it('keeps "unknown" distinct from "there is room"', () => {
    // The dangerous fallback is a number: "15/15 slots left" is the most inviting thing the
    // badge can say, and a `?? 0` on the used count produces exactly that at the moment we
    // know nothing. `null` in, `null` out — all the way to the dash on screen.
    expect(slotsLeft(null)).toBe(null);
    expect(slotsLeft(Number.NaN)).toBe(null);
    expect(slotsLeft(0)).toBe(15);
  });

  it('counts down and never goes negative', () => {
    expect(slotsLeft(11)).toBe(4); // the state measured on 2026-09-05
    expect(slotsLeft(15)).toBe(0);
    // A directory holding more than the ceiling means the constant is wrong, but a NEGATIVE
    // number of slots on screen would just read as a bug in the page. The deploy gate is
    // what reports the real problem.
    expect(slotsLeft(17)).toBe(0);
  });
});
