'use client';

import { useEffect, useState } from 'react';
import { useLanguage, usePageT } from '@/lib/i18n';
import { EN_CEREMONY } from '@/lib/i18n/en/ceremony';
import { formatNumber } from '@/lib/numbers';
import { MOMENT_ISO, phaseAt, remainingAt } from '@/lib/ceremony';

/**
 * The home-page pointer at `/ceremony/`, with the clock running.
 *
 * ═══ WHY IT DISAPPEARS BY ITSELF, AND WHY THAT IS THE WHOLE DESIGN ═══
 * This site has twice carried a sentence that stopped being true while nobody noticed:
 * the rebuild banner spoke in the future tense for three days after the rebuild, and the
 * launch screen still warns about a date that has passed. Both were text that needed a
 * human to remember to change it.
 *
 * So this component takes no decision from a human: it reads the clock, and once the
 * moment's record is published it removes itself. `LoadTestBanner` earned the same shape
 * for the same reason — the site cannot advertise a load test that is not running,
 * because it has nothing else to read.
 *
 * ⚠️ Renders nothing until the first effect. With `output: 'export'` the HTML is built
 * once, so a countdown rendered at build time would be baked in — wrong for every reader,
 * and a hydration mismatch on top.
 */
export function CeremonyCallout() {
  // Reads four `ceremony.*` keys, so the home page carries the ceremony group until the
  // callout removes itself after the moment. Same trade as `SlotsLeft`.
  const t = usePageT(EN_CEREMONY);
  const { code } = useLanguage();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return null;
  // Once the evidence is published the page becomes a record rather than an invitation,
  // and the footer link is the right amount of prominence for a record.
  if (phaseAt(now) === 'after') return null;

  const left = remainingAt(now);
  const soon = phaseAt(now) === 'reached';

  return (
    <a
      href="/ceremony/"
      className="mt-6 flex max-w-2xl flex-wrap items-center gap-x-4 gap-y-2 rounded-card border border-gold-line bg-gold-tint px-4 py-3 text-ink hover:border-gold"
    >
      <span className="font-display text-sm font-bold">{t.ceremony.title}</span>
      {/* 🔴 The unit words are printed WHOLE, never abbreviated to their first letter.
          Cutting `ngày` to `n` or `дней` to `д` produces a label that means nothing in
          that language — and this component exists in all 30. Seconds are left to the
          page itself: a ticking seconds digit on the home page draws the eye away from
          the product for no information a reader of this strip needs. */}
      {soon ? (
        <span className="font-mono text-xs">{MOMENT_ISO}</span>
      ) : (
        <span className="text-sm tabular-nums">
          {formatNumber(left.days, code)} {t.ceremony.days} · {formatNumber(left.hours, code)}{' '}
          {t.ceremony.hours} · {formatNumber(left.minutes, code)} {t.ceremony.minutes}
        </span>
      )}
      <span className="font-mono text-xs text-muted">{MOMENT_ISO}</span>
    </a>
  );
}
