import { describe, expect, it } from 'vitest';
import { conCanhBaoDungLai } from '../lib/rebuildNotice';
import { EN } from '../lib/i18n/en';

/**
 * The rebuild warning on the launch review screen must describe the FUTURE.
 *
 * This is written as a test rather than left to review because the failure mode has already
 * happened once and was invisible for four days: the rebuild ran on 2026-09-01 and the
 * screen kept promising it. Nothing in the type system, the dictionaries or the build
 * relates a date string to the clock.
 */
const D = (s: string) => Date.parse(s);

describe('the rebuild warning', () => {
  it('shows while the date is ahead, including during the day itself', () => {
    expect(conCanhBaoDungLai('2026-09-01', D('2026-08-25T00:00:00Z'))).toBe(true);
    // 06:00 ON the day: the rebuild is hours away, and switching the warning off at midnight
    // would hide it exactly when it is most true.
    expect(conCanhBaoDungLai('2026-09-01', D('2026-09-01T06:00:00Z'))).toBe(true);
    expect(conCanhBaoDungLai('2026-09-01', D('2026-09-01T23:59:59Z'))).toBe(true);
  });

  it('stops once the day is over', () => {
    expect(conCanhBaoDungLai('2026-09-01', D('2026-09-02T00:00:01Z'))).toBe(false);
    // The state the site was actually in for four days.
    expect(conCanhBaoDungLai('2026-09-01', D('2026-09-05T09:00:00Z'))).toBe(false);
  });

  it('keeps the warning when the date cannot be read', () => {
    // Fails towards showing: hiding a possibly-true warning in front of an irreversible
    // action is the worse mistake, and a malformed date is visible once printed.
    expect(conCanhBaoDungLai('', D('2026-09-05T00:00:00Z'))).toBe(true);
    expect(conCanhBaoDungLai('soon', D('2026-09-05T00:00:00Z'))).toBe(true);
  });

  it('is wired to a date that has in fact passed, so the screen is quiet today', () => {
    // Reads the real dictionary value: if someone schedules another rebuild by moving this
    // date forward, the warning comes back on its own and this expectation flips — which is
    // the moment to look at the screen again, not a reason to edit the test.
    expect(conCanhBaoDungLai(EN.rebuild.date, D('2026-09-05T00:00:00Z'))).toBe(false);
  });
});
