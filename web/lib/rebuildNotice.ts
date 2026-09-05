/**
 * Is the "the network will be rebuilt on {date}" warning still about the future?
 *
 * ═══ WHY THIS EXISTS ═══
 * The rebuild ran on 2026-09-01. For four days afterwards the review screen of
 * `/create-chain/` — the last thing a person reads before a one-way door — still told them
 * their chain would be erased on 2026-09-01, while `/re-genesis/` on the same site said the
 * rebuild HAD happened. Nobody noticed, because nothing measures the relationship between a
 * date in a dictionary and the clock.
 *
 * The cost is not the wrong tense. It is that the sentence directly above it — "revoking will
 * not give the name and chain ID back" — is TRUE and has to be believed. A warning that is
 * visibly about a past event teaches a reader that the warnings here are decoration.
 *
 * ⚠️ FAILS TOWARDS SHOWING IT. An unparseable date means we do not know whether a rebuild is
 * coming, and hiding a possibly-true warning before an irreversible action is the worse of
 * the two mistakes. A malformed date is also visible when shown, since the warning prints it.
 */

/** Milliseconds in a day — the warning stays valid through the whole of the named day. */
const NGAY_MS = 24 * 60 * 60 * 1000;

export function conCanhBaoDungLai(date: string, nowMs: number = Date.now()): boolean {
  // `YYYY-MM-DD` parses as UTC midnight, which is the START of that day. A rebuild announced
  // for the 1st is still ahead of a reader at 06:00 on the 1st, so the warning has to survive
  // until the day is over — hence the extra day. Anything else would switch the sentence off
  // while the event it describes is still hours away.
  const t = Date.parse(date);
  if (Number.isNaN(t)) return true;
  return nowMs < t + NGAY_MS;
}
