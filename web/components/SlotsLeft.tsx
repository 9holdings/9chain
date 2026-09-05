'use client';

import { Badge } from '@/components/ui';
import { interpolate, useT } from '@/lib/i18n';
import { useNetworkStats } from '@/lib/stats';
import { L1_SLOTS } from '@/lib/chain';

/**
 * "4/15 slots left" — the one number that decides whether launching a chain is even
 * possible, shown BEFORE anyone spends effort.
 *
 * ═══ WHY THIS IS ON PUBLIC PAGES AND NOT ONLY BEHIND THE WALLET ═══
 * Until 2026-09-05 the ceiling appeared on exactly one screen: after connecting a wallet and
 * signing in. Everything before that — the home page inviting you to launch a chain, the
 * directory showing eleven of them — was silent about it. A visitor could connect a wallet,
 * sign, think of a name, and only then learn that four permanent slots remain. The count is
 * public data (`console-chains.json`); there was never a reason to make people pay for it.
 *
 * 🔴 UNKNOWN IS A DASH, NEVER A GUESS. If the directory cannot be read, this renders "—".
 * The tempting fallback is to show the full ceiling, and it is wrong in the dangerous
 * direction: "15/15 slots left" is the most inviting thing this component can say and it
 * would be said precisely when we know nothing. Same rule as the stat tiles (Đ1-8).
 */
export function SlotsLeft({ className }: { className?: string }) {
  const t = useT();
  const { state } = useNetworkStats();

  const used = state.phase === 'done' ? state.numbers.l1Count : null;
  if (used === null) {
    // Loading and unreadable render the same way on purpose: both mean "we do not know",
    // and a spinner on a badge that is one word long is noise.
    return (
      <Badge tone="neutral">
        <span aria-hidden="true">—</span>
        <span className="sr-only">{t.common.loading}</span>
      </Badge>
    );
  }

  const left = Math.max(0, L1_SLOTS - used);
  return (
    <span className={className}>
      <Badge tone={left === 0 ? 'warn' : left <= 3 ? 'warn' : 'good'}>
        {left === 0 ? t.launch.slotsFull : interpolate(t.launch.slotsLeft, { left, total: L1_SLOTS })}
      </Badge>
    </span>
  );
}
