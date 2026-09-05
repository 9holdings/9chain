'use client';

import { useEffect, useState } from 'react';
import { Card, Copyable, Note, Badge } from '@/components/ui';
import { useLanguage, usePageT } from '@/lib/i18n';
import { EN_CEREMONY } from '@/lib/i18n/en/ceremony';
import { formatNumber } from '@/lib/numbers';
import { rpcCChain } from '@/lib/chain';
import {
  BLOCKS,
  EVIDENCE,
  MESSAGES,
  MOMENT_ISO,
  ZONES,
  momentIn,
  phaseAt,
  remainingAt,
  type Phase,
  type Remaining,
} from '@/lib/ceremony';

/**
 * Body of `/ceremony/`. Split from `page.tsx` for the same reason as every other page here:
 * the page file stays a server component so it can carry `metadata`.
 *
 * ═══ WHY THE CLOCK STARTS AS `null` ═══
 * With `output: 'export'` the HTML is generated at build time, so any countdown rendered on
 * the server is a number of seconds remaining AT BUILD TIME — wrong by however long the
 * build has been deployed, and it would be baked into the page for every reader. Worse, it
 * would differ from what the client computes one tick later, which is a hydration mismatch.
 * So the first render deliberately shows nothing, and the clock appears in an effect.
 */
export function CeremonyContent() {
  const t = usePageT(EN_CEREMONY);
  const { code } = useLanguage();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const phase: Phase | null = now === null ? null : phaseAt(now);
  const left: Remaining | null = now === null ? null : remainingAt(now);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone="good">{t.ceremony.badge}</Badge>
        <span className="font-mono text-xs text-muted">{MOMENT_ISO}</span>
      </div>
      <h1 className="mt-3 font-display text-3xl font-extrabold text-ink md:text-4xl">{t.ceremony.title}</h1>
      <p className="mt-3 text-base text-muted">{t.ceremony.desc}</p>

      {/* ── The moment, and the clock ─────────────────────────────────────────── */}
      <Card className="mt-8 p-5 md:p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
          {phase === 'before' ? t.ceremony.countdownLabel : t.ceremony.momentLabel}
        </h2>

        {phase === 'before' && left ? (
          <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
            {[
              [left.days, t.ceremony.days],
              [left.hours, t.ceremony.hours],
              [left.minutes, t.ceremony.minutes],
              [left.seconds, t.ceremony.seconds],
            ].map(([n, nhan]) => (
              <div key={String(nhan)}>
                <dd className="font-display text-3xl font-extrabold tabular-nums text-ink md:text-4xl">
                  {formatNumber(Number(n), code)}
                </dd>
                <dt className="text-xs uppercase tracking-wide text-muted">{String(nhan)}</dt>
              </div>
            ))}
          </dl>
        ) : null}

        {phase === 'reached' ? (
          <div className="mt-3">
            <Note tone="info">{t.ceremony.reachedNote}</Note>
          </div>
        ) : null}

        <dl className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
          {ZONES.map((z) => (
            <div key={z.id}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{z.label}</dt>
              <dd className="mt-0.5 font-mono text-sm text-ink">{momentIn(z.tz, code)}</dd>
            </div>
          ))}
          {/* The reader's own zone, resolved in the browser. Absent on the first paint for
              the same reason the countdown is: the build has no reader. */}
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{t.ceremony.yourZone}</dt>
            <dd className="mt-0.5 font-mono text-sm text-ink">
              {now === null ? (
                <span aria-hidden="true">—</span>
              ) : (
                momentIn(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', code)
              )}
            </dd>
          </div>
        </dl>
      </Card>

      {/* ── The three blocks ──────────────────────────────────────────────────── */}
      <h2 className="mt-10 font-display text-xl font-bold text-ink">{t.ceremony.blocksTitle}</h2>
      {/* 🔴 `grid-cols-[minmax(0,1fr)]`, not a bare `grid` — measured at 375 px on the live
          page: a grid item's default `min-width: auto` lets it grow to fit unbreakable
          content, so one 64-character sha256 made the card 533 px wide and the whole
          document scrolled sideways. `max-w-full` on the button inside cannot help, because
          the container it is "full" of had already grown. */}
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3">
        {BLOCKS.map((b) => (
          <Card key={b.id} className="p-4 md:p-5">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="font-display text-lg font-bold text-ink">{b.name}</h3>
              <span className="font-mono text-xs text-muted">
                {b.offset === null ? `timestamp ≥ ${MOMENT_ISO}` : `Block Adam + ${b.offset}`}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">
              {b.id === 'adam' ? t.ceremony.adamDesc : b.id === 'eva' ? t.ceremony.evaDesc : t.ceremony.unionDesc}
            </p>
          </Card>
        ))}
      </div>

      {/* ── The bytes ─────────────────────────────────────────────────────────── */}
      <h2 className="mt-10 font-display text-xl font-bold text-ink">{t.ceremony.messagesTitle}</h2>
      <p className="mt-2 text-sm text-muted">{t.ceremony.messagesDesc}</p>
      {/* 🔴 `grid-cols-[minmax(0,1fr)]`, not a bare `grid` — measured at 375 px on the live
          page: a grid item's default `min-width: auto` lets it grow to fit unbreakable
          content, so one 64-character sha256 made the card 533 px wide and the whole
          document scrolled sideways. `max-w-full` on the button inside cannot help, because
          the container it is "full" of had already grown. */}
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3">
        {MESSAGES.map((m) => (
          <Card key={m.id} className="p-4 md:p-5">
            <p className="text-sm text-ink">“{m.text}”</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="font-mono text-xs text-muted">{formatNumber(m.bytes, code)} bytes</span>
              <Copyable value={m.sha256} label="sha256" className="min-w-0" />
            </div>
          </Card>
        ))}
      </div>

      {/* ── The two sentences that keep the page honest ───────────────────────── */}
      <h2 className="mt-10 font-display text-xl font-bold text-ink">{t.ceremony.quietTitle}</h2>
      <p className="mt-2 text-sm text-muted">{t.ceremony.quietDesc}</p>

      <h2 className="mt-8 font-display text-xl font-bold text-ink">{t.ceremony.strangerTitle}</h2>
      <p className="mt-2 text-sm text-muted">{t.ceremony.strangerDesc}</p>

      {/* ── Check it yourself ─────────────────────────────────────────────────── */}
      <h2 className="mt-10 font-display text-xl font-bold text-ink">{t.ceremony.checkTitle}</h2>
      <p className="mt-2 text-sm text-muted">{t.ceremony.checkDesc}</p>
      <div className="mt-3 overflow-x-auto rounded-lg border border-line bg-surface-alt p-3">
        <pre className="font-mono text-xs leading-relaxed text-ink">
          {`curl -s -X POST -H 'content-type: application/json' \\
  --data '{"jsonrpc":"2.0","id":1,"method":"eth_getBlockByNumber","params":["latest",false]}' \\
  ${rpcCChain()}`}
        </pre>
      </div>

      {/* ── What was recorded ─────────────────────────────────────────────────── */}
      <h2 className="mt-10 font-display text-xl font-bold text-ink">{t.ceremony.resultTitle}</h2>
      {phase === 'after' ? (
        <dl className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{t.ceremony.resultBlock}</dt>
            <dd className="mt-1 font-mono text-sm text-ink">
              {EVIDENCE.adamBlock === null ? '—' : formatNumber(EVIDENCE.adamBlock, code)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{t.ceremony.resultTimestamp}</dt>
            <dd className="mt-1 font-mono text-sm text-ink">{EVIDENCE.adamTimestamp || '—'}</dd>
          </div>
          {MESSAGES.map((m, i) => {
            const tx = [EVIDENCE.adamTx, EVIDENCE.evaTx, EVIDENCE.unionTx][i];
            return tx ? (
              <div key={m.id} className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{BLOCKS[i].name}</dt>
                <dd className="mt-1">
                  <Copyable value={tx} label={BLOCKS[i].name} />
                </dd>
              </div>
            ) : null;
          })}
          {EVIDENCE.bundleUrl ? (
            <div className="sm:col-span-2">
              <a className="text-sm font-semibold text-gold underline" href={EVIDENCE.bundleUrl}>
                {t.ceremony.resultBundle}
              </a>
            </div>
          ) : null}
        </dl>
      ) : (
        <div className="mt-3">
          <Note tone="info">{t.ceremony.resultPending}</Note>
        </div>
      )}
    </div>
  );
}
