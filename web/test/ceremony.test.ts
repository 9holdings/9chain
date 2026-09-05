import { describe, expect, it } from 'vitest';
import {
  BLOCKS,
  MESSAGES,
  MOMENT_ISO,
  MOMENT_MS,
  hasEvidence,
  momentIn,
  phaseAt,
  remainingAt,
  type CeremonyEvidence,
} from '../lib/ceremony';

/**
 * The ceremony page's arithmetic, measured directly rather than through the page.
 *
 * ═══ WHY THESE CASES AND NOT OTHERS ═══
 * Every assertion below stands in for a way this page could tell a reader something false
 * about an event that happens ONCE, at a second nobody can repeat:
 *
 *   • the boundary — D-147 decided it INCLUDES the moment (`ts >= moment`). A page that
 *     renders "before" at exactly the moment contradicts the rule the ceremony is run by.
 *   • the empty results table — between the moment and the publication of the evidence
 *     the honest state is its own state. Two states would force this page to either count
 *     down to a time that has gone, or show an empty record as if nothing was written.
 *   • a countdown that goes negative — reads as a broken clock on the one page whose job
 *     is to be trustworthy about time.
 *   • the frozen digests — these are copies of `docs/block-adam/CANON.txt`. A typo here is
 *     invisible on screen and destroys the only thing that makes the quoted text checkable.
 */

const SEC = 1000;

describe('the ceremony clock', () => {
  it('pins the moment that the whole runbook is written around', () => {
    expect(MOMENT_ISO).toBe('2026-09-09T06:09:09Z');
    // Not a second earlier or later than what `docs/CEREMONY-2026-09-09.md` freezes.
    expect(MOMENT_MS).toBe(Date.parse('2026-09-09T06:09:09.000Z'));
  });

  it('treats the moment itself as REACHED, not as still to come (D-147)', () => {
    expect(phaseAt(MOMENT_MS - 1)).toBe('before');
    expect(phaseAt(MOMENT_MS)).toBe('reached');
    expect(phaseAt(MOMENT_MS + 1)).toBe('reached');
  });

  it('keeps "the moment has passed" and "the record is published" as separate states', () => {
    const co: CeremonyEvidence = {
      adamTx: '0xaa',
      evaTx: '0xbb',
      unionTx: '0xcc',
      adamBlock: 12345,
      adamTimestamp: '2026-09-09T06:09:11Z',
      bundleUrl: '',
    };
    expect(phaseAt(MOMENT_MS + 60 * SEC, co)).toBe('after');
    // REVERSE: the same instant with no bundle must NOT claim a record exists.
    expect(phaseAt(MOMENT_MS + 60 * SEC)).toBe('reached');
    // A half-filled bundle is not a bundle — a tx hash with no block number would render
    // a results table with a dash where the block should be.
    expect(hasEvidence({ ...co, adamBlock: null })).toBe(false);
    expect(hasEvidence({ ...co, adamTx: '' })).toBe(false);
    expect(hasEvidence(co)).toBe(true);
  });

  it('counts down correctly and then stops at zero instead of going negative', () => {
    const t = remainingAt(MOMENT_MS - (((2 * 24 + 3) * 60 + 4) * 60 + 5) * SEC);
    expect([t.days, t.hours, t.minutes, t.seconds]).toEqual([2, 3, 4, 5]);
    const sau = remainingAt(MOMENT_MS + 10 * SEC);
    expect(sau.total).toBe(0);
    expect([sau.days, sau.hours, sau.minutes, sau.seconds]).toEqual([0, 0, 0, 0]);
  });

  it('writes the same instant in every zone the runbook names', () => {
    // The runbook says 09:09:09 Jerusalem and 13:09:09 Vietnam. If a page ever disagrees
    // with the runbook about the hour, the people running the ceremony and the people
    // watching it are looking at two different seconds.
    expect(momentIn('Asia/Jerusalem', 'en')).toContain('09:09:09');
    expect(momentIn('Asia/Ho_Chi_Minh', 'en')).toContain('13:09:09');
    expect(momentIn('UTC', 'en')).toContain('06:09:09');
  });
});

describe('what the ceremony writes', () => {
  it('carries the digests frozen in CANON on 2026-09-03', () => {
    const byId = Object.fromEntries(MESSAGES.map((m) => [m.id, m]));
    expect(byId.adam.sha256).toBe('19f90a317851933e88fb288949a44b18f87103b2d7947b80d557f05d425a236c');
    expect(byId.adam.bytes).toBe(25);
    expect(byId.eva.sha256).toBe('747ebe59ab6a152e962a2c3f215f46a8a30a82265210cb4fd6ee4bd31ffc97df');
    expect(byId.eva.bytes).toBe(45);
    expect(byId.union.sha256).toBe('84846f452db83644231895a65f75706d3a435df827b88a1b18852ec4670d5b78');
    expect(byId.union.bytes).toBe(182);
  });

  it('quotes text whose byte length matches what the digest was taken over', () => {
    // Not the digest itself — that would need the file — but the one property a typo in
    // the quoted sentence would break. The engraved files are UTF-8, and these three
    // sentences are ASCII, so bytes and code units coincide; a smart quote sneaking in
    // during translation of the page would break this immediately.
    for (const m of MESSAGES) {
      expect(new TextEncoder().encode(m.text).length, `"${m.text.slice(0, 24)}…"`).toBe(m.bytes);
    }
  });

  it('defines Adam by TIME and the other two by height', () => {
    const byId = Object.fromEntries(BLOCKS.map((b) => [b.id, b]));
    // `null` is the assertion: Adam has no arithmetic relationship to anything, because
    // the ceremony does not get to choose which block reaches the moment first.
    expect(byId.adam.offset).toBe(null);
    expect(byId.eva.offset).toBe(1);
    expect(byId.union.offset).toBe(10);
  });
});
