/**
 * The 9S Union ceremony — `2026-09-09T06:09:09Z`.
 *
 * Every constant here is COPIED FROM A FROZEN SOURCE in the chain repo, and the source is
 * named next to each one. Nothing on this page may be a number someone typed from memory:
 * the whole point of the ceremony is that a stranger can check it afterwards, and a page
 * that misquotes the moment by one second breaks exactly that.
 *
 *   moment + boundary   docs/CEREMONY-2026-09-09.md  (D-147: the boundary INCLUDES the moment)
 *   message digests     docs/block-adam/CANON.txt    (frozen 2026-09-03)
 *   block naming        docs/block-adam/CANON.txt
 *
 * 🔴 BLOCK ADAM IS DEFINED BY TIME, NOT BY HEIGHT. It is the first block whose timestamp
 * reaches the moment — whoever produces it. That is not a detail to smooth over in the
 * copy: A1 is a public network, a stranger's transaction can produce that block, and the
 * record still holds because the engraving is anchored to the ceremony's TRANSACTION HASH
 * (D-070), never to a height. A page that promises "our block will be number N" would be
 * making a promise the network does not let anyone make.
 */

/** ISO-8601, UTC. `09:09:09` in Jerusalem, `13:09:09` in Vietnam. */
export const MOMENT_ISO = '2026-09-09T06:09:09Z';

export const MOMENT_MS = Date.parse(MOMENT_ISO);

/**
 * The three named blocks. `offset` is measured FROM Block Adam, in blocks.
 *
 * Adam has no offset of its own because it is not defined by arithmetic — see the header.
 * Eva and 9S Union are: Eva is Adam + 1 by height, and the 9S Union message is anchored at
 * Eva + 9, i.e. Adam + 10.
 */
export const BLOCKS = [
  { id: 'adam', name: 'Block Adam', offset: null },
  { id: 'eva', name: 'Block Eva', offset: 1 },
  { id: 'union', name: '9S Union', offset: 10 },
] as const;

/**
 * The bytes each block carries, with the digest frozen on 2026-09-03.
 *
 * Adam and Eva carry the two sentences ALREADY WRITTEN INTO BLOCK 0 — the ceremony scripts
 * point at the same files that were engraved at genesis rather than at a copy, so the two
 * cannot drift apart. The text is reproduced here because it is already public on-chain;
 * the digest is what makes this copy checkable rather than merely quoted.
 */
export const MESSAGES = [
  {
    id: 'adam',
    text: 'Adam — the first human.',
    bytes: 25,
    sha256: '19f90a317851933e88fb288949a44b18f87103b2d7947b80d557f05d425a236c',
  },
  {
    id: 'eva',
    text: 'Eva — the second human, and the first "we".',
    bytes: 45,
    sha256: '747ebe59ab6a152e962a2c3f215f46a8a30a82265210cb4fd6ee4bd31ffc97df',
  },
  {
    id: 'union',
    text:
      'Hello! We are 9S Union, and we want to create this project as a gift to the world! ' +
      'With 9Chain, we hope that the whole world will enjoy peace and prosperity for at ' +
      'least 1,000 years!',
    bytes: 182,
    sha256: '84846f452db83644231895a65f75706d3a435df827b88a1b18852ec4670d5b78',
  },
] as const;

/**
 * What was actually recorded. EMPTY UNTIL THE EVIDENCE BUNDLE EXISTS, and the page shows
 * "not published yet" rather than guessing — the same shape as `rebuildDone.archiveUrl`.
 *
 * ⚠️ Fill these from `docs/evidence/ceremony-2026-09-09.json` AFTER the run, not from a
 * screenshot and not from what the plan said would happen. The bundle is the artefact;
 * this is a copy of it, and a copy that says something the bundle does not is worse than
 * an empty section.
 */
export type CeremonyEvidence = {
  adamTx: string;
  evaTx: string;
  unionTx: string;
  adamBlock: number | null;
  adamTimestamp: string;
  bundleUrl: string;
};

export const EVIDENCE: CeremonyEvidence = {
  adamTx: '',
  evaTx: '',
  unionTx: '',
  adamBlock: null,
  adamTimestamp: '',
  bundleUrl: '',
};

export function hasEvidence(e: CeremonyEvidence = EVIDENCE): boolean {
  return e.adamTx.length > 0 && e.adamBlock !== null;
}

/**
 * Which of the three states the page is in.
 *
 * 🔴 `'reached'` is a state of its own, and it is the honest one: between the moment and
 * the moment the evidence is published, the truthful thing to say is "the moment has
 * passed, the record is not published yet". Collapsing this into `'after'` would have the
 * page display an empty results table as though the ceremony produced nothing, and
 * collapsing it into `'before'` would have it count down to a time that has gone.
 */
export type Phase = 'before' | 'reached' | 'after';

export function phaseAt(nowMs: number, e: CeremonyEvidence = EVIDENCE): Phase {
  // The boundary INCLUDES the moment (D-147) — at exactly the moment, it has been reached.
  if (nowMs < MOMENT_MS) return 'before';
  return hasEvidence(e) ? 'after' : 'reached';
}

export type Remaining = { days: number; hours: number; minutes: number; seconds: number; total: number };

/**
 * Time left until the moment. Clamps at zero rather than going negative: a countdown that
 * runs backwards past its own event reads as a broken clock, and the phase above is what
 * decides whether a countdown is shown at all.
 */
export function remainingAt(nowMs: number): Remaining {
  const total = Math.max(0, MOMENT_MS - nowMs);
  const s = Math.floor(total / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    total,
  };
}

/**
 * The same instant written for three audiences, plus the reader's own zone.
 *
 * Jerusalem and Vietnam are named explicitly because those two are the zones the ceremony
 * was planned in, and a reader in either should not have to do the arithmetic to see that
 * the page and the runbook mean the same second.
 */
export const ZONES = [
  { id: 'utc', label: 'UTC', tz: 'UTC' },
  { id: 'jerusalem', label: 'Jerusalem', tz: 'Asia/Jerusalem' },
  { id: 'vietnam', label: 'Vietnam', tz: 'Asia/Ho_Chi_Minh' },
] as const;

/**
 * Format the moment in a named zone. Falls back to the ISO string if the runtime has no
 * time-zone data — a wrong local time would be worse than an obviously-UTC one.
 */
export function momentIn(tz: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'medium',
      timeZone: tz,
      // 🔴 24-hour in every locale, including the ones that would default to 12-hour.
      // Caught by `test/ceremony.test.ts`: `en` rendered the moment as "9:09:09 AM" in
      // Jerusalem and "1:09:09 PM" in Vietnam, so the two zone rows no longer visibly
      // described one instant, and neither matched the `06:09:09Z` printed beside them or
      // the hour the runbook is written in. A page about one exact second should not make
      // the reader convert anything.
      hourCycle: 'h23',
      // Latin digits, for the same reason the block heights use them: this is a value a
      // reader compares against a wallet, an explorer and an RPC reply, and all three
      // print Latin digits. See `lib/numbers.ts`.
      numberingSystem: 'latn',
    }).format(MOMENT_MS);
  } catch {
    return MOMENT_ISO;
  }
}
