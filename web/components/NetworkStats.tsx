'use client';

import { useNetworkStats } from '@/lib/stats';
import { Skeleton, Badge } from './ui';
import { cx } from '@/lib/cx';
import { usePageT, useLanguage } from '@/lib/i18n';
import { EN_HOME } from '@/lib/i18n/en/home';
import { formatNumber } from '@/lib/numbers';

/**
 * The live-numbers strip — what makes the page read as "a running product" rather
 * than a mockup.
 *
 * 🔴 Three states, and the FAILED state has to say that **the page still works**. An
 * empty number on the home page reads as a dead network; so does a big red error
 * block. This is decoration around the truth, not a path the user is walking — when
 * it fails, fall back to one line of muted text, do not build an error screen.
 */
export function NetworkStats({ on = 'light' }: { on?: 'light' | 'dark' }) {
  const t = usePageT(EN_HOME);
  const { code } = useLanguage();
  const { state, reload } = useNetworkStats();
  const dark = on === 'dark';

  const labelClass = cx('text-xs font-semibold uppercase tracking-wide', dark ? 'text-on-dark-3' : 'text-muted');
  const valueClass = cx('font-display text-2xl font-extrabold md:text-3xl', dark ? 'text-on-dark' : 'text-ink');

  if (state.phase === 'failed') {
    return (
      <div className={cx('mt-8 text-sm', dark ? 'text-on-dark-3' : 'text-muted')}>
        <button type="button" onClick={reload} className="underline">
          {t.stats.cannotMeasure}
        </button>
        <span className="ms-2">{t.stats.cannotMeasureDesc}</span>
      </div>
    );
  }

  /**
   * Three states PER CELL, not three states for the whole strip (Đ1-8):
   *   `undefined` — measuring    ⇒ skeleton
   *   `string`    — measured     ⇒ the number
   *   `null`      — cell absent  ⇒ a dash plus a statement for screen readers
   *
   * 🔴 A dash, NOT `0`. `0` is a number, and here it would be a WRONG one: "0
   * validators" reads as a dead network, when the truth is that we could not ask.
   * That is exactly what this file's older rule forbade — and the rule still stands.
   */
  const n = state.phase === 'done' ? state.numbers : null;
  const cells: { label: string; value: string | null | undefined }[] = !n
    ? [{ label: t.stats.validators }, { label: t.stats.l1Count }, { label: t.stats.blockHeight }].map((x) => ({
        ...x,
        value: undefined, // not measured yet ⇒ all three cells are skeletons
      }))
    : [
        {
          label: t.stats.validators,
          value: n.validatorsTotal === null ? null : `${n.validatorsConnected}/${n.validatorsTotal}`,
        },
        { label: t.stats.l1Count, value: n.l1Count === null ? null : String(n.l1Count) },
        {
          label: t.stats.blockHeight,
          value: n.blockHeight === null ? null : formatNumber(n.blockHeight, code),
        },
      ];

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2">
        <Badge tone="good">{t.stats.title}</Badge>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-4 sm:max-w-lg">
        {cells.map((x) => (
          <div key={x.label}>
            <dt className={labelClass}>{x.label}</dt>
            <dd className={valueClass}>
              {x.value !== undefined && x.value !== null ? (
                x.value
              ) : x.value === null ? (
                /* This cell is absent: a visible dash plus an audible statement. A
                   screen reader user must be able to HEAR the difference between "—"
                   and a number, otherwise an absent cell and a zero are the same
                   thing to them. */
                <>
                  <span aria-hidden="true">—</span>
                  <span className="sr-only">{t.stats.cannotMeasure}</span>
                </>
              ) : (
                <>
                  {/* The skeleton carries a label for screen readers — without it the
                      user hears an empty list and cannot tell what is being waited
                      for. */}
                  <span className="sr-only">{t.stats.measuring}</span>
                  <Skeleton className="h-8 w-16" />
                </>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
