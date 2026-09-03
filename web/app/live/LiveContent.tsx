'use client';

import { Copyable, Note, Badge, Skeleton } from '@/components/ui';
import { interpolate, useLanguage, useT } from '@/lib/i18n';
import { isRunning, useLoadTest } from '@/lib/loadTest';
import { formatNumber } from '@/lib/numbers';

/**
 * Body of `/live`. Split from `page.tsx` so the page file stays a server component
 * and keeps its `metadata` — same reason as `components/PageHeader.tsx`.
 *
 * Polls, unlike the home page stat strip. `lib/stats.ts` argues at length that the
 * home page should read once and not poll, and that argument is right for a page
 * people leave after twenty seconds. It does not apply here: this page exists so a
 * number moves in front of you, and it is the one place on the site where a request
 * every few seconds buys something.
 */
const NHIP_MS = 5_000;

function Field({ label, value, note }: { label: string; value: string | null | undefined; note?: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-extrabold text-ink md:text-3xl">
        {value === undefined ? (
          <Skeleton className="h-8 w-20" />
        ) : value === null ? (
          /* An absent reading is a dash, never a zero. "0 transactions per second"
             is a measurement; "we could not read it" is not, and printing the first
             when we mean the second is how this project has misled itself before. */
          <span aria-hidden="true">—</span>
        ) : (
          value
        )}
      </dd>
      {note ? <p className="mt-1 text-xs text-muted">{note}</p> : null}
    </div>
  );
}

function thoiLuong(giay: number, code: string): string {
  const g = Math.floor(giay / 3600);
  const p = Math.floor((giay % 3600) / 60);
  if (g > 0) return `${formatNumber(g, code)}h ${formatNumber(p, code)}m`;
  return `${formatNumber(p, code)}m`;
}

export function LiveContent() {
  const t = useT();
  const { code } = useLanguage();
  const state = useLoadTest(NHIP_MS);

  const song = state.phase === 'xong' && isRunning(state.state);
  const d = state.phase === 'xong' ? state.state : null;
  const m = d?.measured;
  // `undefined` = still loading, `null` = read but absent. Three states, not two.
  const so = (v: number | null | undefined) =>
    state.phase === 'dangTai' ? undefined : v == null ? null : formatNumber(v, code);

  return (
    <div className="khung max-w-3xl py-10 md:py-14">
      <header>
        <div className="flex items-center gap-2">
          <Badge tone={song ? 'good' : 'neutral'}>
            {song ? t.loadTest.running : t.loadTest.stopped}
          </Badge>
        </div>
        <h1 className="mt-3 font-display text-2xl font-extrabold text-ink md:text-3xl">
          {t.loadTest.title}
        </h1>
        <p className="mt-3 text-base text-body">{t.loadTest.intro}</p>
      </header>

      {state.phase === 'hong' ? (
        <div className="mt-6 text-sm text-muted">
          <span className="font-semibold">{t.loadTest.notMeasured}</span>{' '}
          <span>{t.loadTest.notMeasuredMore}</span>
        </div>
      ) : null}

      {d && !song && d.stopReason ? (
        <div className="mt-6">
          <Note>
            <p>{interpolate(t.loadTest.stoppedWhy, { reason: d.stopReason })}</p>
          </Note>
        </div>
      ) : null}

      <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Field
          label={t.loadTest.labelTps}
          value={state.phase === 'dangTai' ? undefined : song ? so(m?.committedTps) : null}
        />
        <Field label={t.loadTest.labelBlockHeight} value={so(m?.blockHeight)} />
        <Field label={t.loadTest.labelSecondsPerBlock} value={so(m?.secondsPerBlock)} />
        <Field
          label={t.loadTest.labelUptime}
          value={
            state.phase === 'dangTai'
              ? undefined
              : d && song
                ? thoiLuong(d.uptimeSeconds, code)
                : null
          }
        />
      </dl>

      <div className="mt-6">
        <dl>
          <Field label={t.loadTest.labelTotal} value={so(m?.committedTxSinceStart)} />
        </dl>
        {/* The distinction this paragraph draws is the whole reason the numbers
            above can be trusted: they come from blocks, not from send calls. A run
            that reported a thousand sends while committing none is what taught us
            to say so on the page rather than only in the code. */}
        <p className="mt-3 text-sm text-muted">{t.loadTest.committedNote}</p>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl font-extrabold text-ink md:text-2xl">
          {t.loadTest.addressesTitle}
        </h2>
        <p className="mt-3 text-base text-body">{t.loadTest.addressesNote}</p>
        {d && d.senderAddresses.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-2">
            {d.senderAddresses.map((a) => (
              <li key={a}>
                <Copyable value={a} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">
            {state.phase === 'dangTai' ? t.loadTest.measuring : t.loadTest.notMeasured}
          </p>
        )}
      </section>
    </div>
  );
}
