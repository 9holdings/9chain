'use client';

import { useEffect, useState } from 'react';
import { Card, Note, Skeleton } from '@/components/ui';
import { useLanguage, useT } from '@/lib/i18n';
import { formatNumber } from '@/lib/numbers';
import { fetchJson, READ_TIMEOUT_MS } from '@/lib/net';
import { faucetOrigin, CHAIN } from '@/lib/chain';
import { faucetRequestsNeeded, nanoToLove9, useValidatorSet } from '@/lib/validators';

/**
 * Body of `/validators/`.
 *
 * ═══ WHY THIS PAGE EXISTS ═══
 * The home page has carried, for a week, a sentence saying nine of the validators run on one
 * machine at one provider — and then it stopped. It was the most honest sentence on the site
 * and the only one with no next step: a reader who wanted to help had no guide, no cost, no
 * idea whether outsiders were even allowed. Two of them worked it out anyway. This page is
 * that sentence with a door attached.
 *
 * 🔴 EVERY NUMBER IS READ, NONE ARE WRITTEN. The bond comes from `platform.getMinStake`, the
 * set from `platform.getCurrentValidators`, the faucet's rate from its own `/api/info`. The
 * bond in particular was 25,000 until the hours before this network was created — quoting it
 * from a document would be telling a stranger how much money to send, from memory.
 */
type FaucetInfo = {
  amount: string;
  symbol: string;
  perIp: { max: number; windowHours: number };
};

function useFaucetInfo() {
  const [info, setInfo] = useState<FaucetInfo | null | 'loading'>('loading');
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const j = await fetchJson<FaucetInfo>(`${faucetOrigin()}/api/info`, {}, READ_TIMEOUT_MS / 1000);
        if (!cancelled) setInfo(j);
      } catch {
        // A dash, not a guess. The faucet's rate is the input to the arithmetic below, and an
        // invented number here would send someone to a wallet with the wrong plan.
        if (!cancelled) setInfo(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return info;
}

function Stat({ label, value, note }: { label: string; value: string | null | undefined; note?: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-extrabold tabular-nums text-ink">
        {value === undefined ? (
          <Skeleton className="h-7 w-16" />
        ) : value === null ? (
          <span aria-hidden="true">—</span>
        ) : (
          value
        )}
      </dd>
      {note ? <p className="mt-1 text-xs text-muted">{note}</p> : null}
    </div>
  );
}

export function ValidatorsContent() {
  const t = useT();
  const { code } = useLanguage();
  const set = useValidatorSet();
  const faucet = useFaucetInfo();

  const s = set.phase === 'done' ? set.set : null;
  const dangTai = set.phase === 'loading';
  const so = (v: number | null) => (dangTai ? undefined : v === null ? null : formatNumber(v, code));

  const bond = s ? nanoToLove9(s.minValidatorStakeNano) : null;
  const bondText = bond === null ? null : `${formatNumber(bond, code)} ${CHAIN.kyHieu}`;

  // The faucet arithmetic, computed from two live readings rather than stated. If either is
  // unreadable the sentence still stands on its own — it is about the SHAPE of the trap, not
  // about the two numbers — so the paragraph is never hidden, only its figures are.
  const perRequest = faucet && faucet !== 'loading' ? Number(faucet.amount) : null;
  const soLuot = faucetRequestsNeeded(bond, perRequest);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
      <h1 className="font-display text-3xl font-extrabold text-ink md:text-4xl">{t.validators.title}</h1>
      <p className="mt-3 text-base text-muted">{t.validators.desc}</p>

      {/* The same sentence the home page carries, quoted where the reader can act on it.
          Reused key, not a second copy: two wordings of one measured claim drift apart. */}
      <div className="mt-6 border-s-2 border-line ps-4 text-sm text-body">{t.home.disclosure}</div>

      {/* ── The set, measured ─────────────────────────────────────────────── */}
      <Card className="mt-8 p-5 md:p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">{t.validators.liveTitle}</h2>
        <dl className="mt-4 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-4 sm:grid-cols-[repeat(4,minmax(0,1fr))]">
          <Stat label={t.validators.liveTotal} value={so(s?.total ?? null)} />
          <Stat label={t.validators.liveConnected} value={so(s?.connected ?? null)} />
          <Stat label={t.validators.liveMinBond} value={dangTai ? undefined : bondText} />
          <Stat label={t.validators.liveAtMinimum} value={so(s?.atMinimumBond ?? null)} />
        </dl>
        <p className="mt-4 text-xs text-muted">{t.validators.measuredNote}</p>
      </Card>

      {/* ── Cost ──────────────────────────────────────────────────────────── */}
      <h2 className="mt-10 font-display text-xl font-bold text-ink">{t.validators.costTitle}</h2>
      <ul className="mt-3 flex flex-col gap-3 text-sm text-body">
        <li>{t.validators.costMachine}</li>
        <li>
          {t.validators.costBond}
          {bondText ? <span className="ms-1 font-mono text-ink">({bondText})</span> : null}
        </li>
      </ul>

      <h2 className="mt-8 font-display text-xl font-bold text-ink">{t.validators.faucetTitle}</h2>
      <p className="mt-2 text-sm text-body">{t.validators.faucetDesc}</p>
      {perRequest !== null && bond !== null && soLuot !== null ? (
        <p className="mt-3 font-mono text-sm text-ink">
          {/* 🔴 `>`, NOT `≥`. The strict sign is the sentence above rendered in symbols: you
              need MORE than the bond, because the fees come out of the same balance. With
              `≥` and nine requests this line said the opposite of the paragraph over it. */}
          {formatNumber(perRequest, code)} {CHAIN.kyHieu} × {formatNumber(soLuot, code)} ={' '}
          {formatNumber(perRequest * soLuot, code)} {CHAIN.kyHieu} &gt; {bondText}
        </p>
      ) : null}

      {/* ── What you get ──────────────────────────────────────────────────── */}
      <h2 className="mt-10 font-display text-xl font-bold text-ink">{t.validators.getTitle}</h2>
      <ul className="mt-3 flex flex-col gap-3 text-sm text-body">
        <li>{t.validators.getRewards}</li>
        <li>{t.validators.getEnd}</li>
        <li>{t.validators.getPrivacy}</li>
      </ul>

      {/* ── What it does not pay ──────────────────────────────────────────── */}
      <h2 className="mt-10 font-display text-xl font-bold text-ink">{t.validators.honestTitle}</h2>
      <div className="mt-3 flex flex-col gap-3">
        <Note tone="warn">{t.validators.honest1}</Note>
        <Note tone="warn">{t.validators.honest2}</Note>
        <Note tone="warn">{t.validators.honest3}</Note>
      </div>

      {/* ── The path ──────────────────────────────────────────────────────── */}
      <h2 className="mt-10 font-display text-xl font-bold text-ink">{t.validators.stepsTitle}</h2>
      <ol className="mt-4 flex flex-col gap-3">
        {[
          t.validators.step1,
          t.validators.step2,
          t.validators.step3,
          t.validators.step4,
          t.validators.step5,
          t.validators.step6,
        ].map((buoc, i) => (
          <li key={i} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 text-sm text-body">
            <span className="font-mono text-xs font-semibold text-gold">{formatNumber(i + 1, code)}</span>
            <span>{buoc}</span>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex flex-wrap gap-3">
        {/* 🔴 Both links leave the site, and both were checked with a real request before being
            written here. This project has published a dead `/docs/` link before, and the first
            thing a dead link costs is the reader's belief that the rest of the page was checked. */}
        <a
          className="inline-flex h-13 items-center justify-center rounded-btn-lg bg-gold px-6 text-base font-semibold text-navy shadow-cta hover:bg-gold-hover"
          href="https://github.com/9holdings/9chain/blob/main/docs/RUN-A-VALIDATOR.md"
          rel="noopener noreferrer"
          target="_blank"
        >
          {t.validators.guideCta}
        </a>
        <a
          className="inline-flex h-13 items-center justify-center rounded-btn-lg border border-line-strong px-6 text-base font-semibold text-ink hover:bg-surface-alt"
          href="https://github.com/9holdings/9chain/issues"
          rel="noopener noreferrer"
          target="_blank"
        >
          {t.validators.issuesCta}
        </a>
      </div>
      <p className="mt-3 text-xs text-muted">{t.validators.issuesNote}</p>
    </div>
  );
}
