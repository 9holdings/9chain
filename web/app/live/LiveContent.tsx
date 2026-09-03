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

function Field({ nhan, gt, phu }: { nhan: string; gt: string | null | undefined; phu?: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{nhan}</dt>
      <dd className="mt-1 font-display text-2xl font-extrabold text-ink md:text-3xl">
        {gt === undefined ? (
          <Skeleton className="h-8 w-20" />
        ) : gt === null ? (
          /* An absent reading is a dash, never a zero. "0 transactions per second"
             is a measurement; "we could not read it" is not, and printing the first
             when we mean the second is how this project has misled itself before. */
          <span aria-hidden="true">—</span>
        ) : (
          gt
        )}
      </dd>
      {phu ? <p className="mt-1 text-xs text-muted">{phu}</p> : null}
    </div>
  );
}

function thoiLuong(giay: number, ma: string): string {
  const g = Math.floor(giay / 3600);
  const p = Math.floor((giay % 3600) / 60);
  if (g > 0) return `${formatNumber(g, ma)}h ${formatNumber(p, ma)}m`;
  return `${formatNumber(p, ma)}m`;
}

export function LiveContent() {
  const t = useT();
  const { ma } = useLanguage();
  const tt = useLoadTest(NHIP_MS);

  const song = tt.pha === 'xong' && isRunning(tt.tt);
  const d = tt.pha === 'xong' ? tt.tt : null;
  const m = d?.measured;
  // `undefined` = still loading, `null` = read but absent. Three states, not two.
  const so = (v: number | null | undefined) =>
    tt.pha === 'dangTai' ? undefined : v == null ? null : formatNumber(v, ma);

  return (
    <div className="khung max-w-3xl py-10 md:py-14">
      <header>
        <div className="flex items-center gap-2">
          <Badge kieu={song ? 'tot' : 'trungTinh'}>
            {song ? t.loadTest.running : t.loadTest.stopped}
          </Badge>
        </div>
        <h1 className="mt-3 font-display text-2xl font-extrabold text-ink md:text-3xl">
          {t.loadTest.title}
        </h1>
        <p className="mt-3 text-base text-body">{t.loadTest.intro}</p>
      </header>

      {tt.pha === 'hong' ? (
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
          nhan={t.loadTest.labelTps}
          gt={tt.pha === 'dangTai' ? undefined : song ? so(m?.committedTps) : null}
        />
        <Field nhan={t.loadTest.labelBlockHeight} gt={so(m?.blockHeight)} />
        <Field nhan={t.loadTest.labelSecondsPerBlock} gt={so(m?.secondsPerBlock)} />
        <Field
          nhan={t.loadTest.labelUptime}
          gt={
            tt.pha === 'dangTai'
              ? undefined
              : d && song
                ? thoiLuong(d.uptimeSeconds, ma)
                : null
          }
        />
      </dl>

      <div className="mt-6">
        <dl>
          <Field nhan={t.loadTest.labelTotal} gt={so(m?.committedTxSinceStart)} />
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
                <Copyable giaTri={a} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">
            {tt.pha === 'dangTai' ? t.loadTest.measuring : t.loadTest.notMeasured}
          </p>
        )}
      </section>
    </div>
  );
}
