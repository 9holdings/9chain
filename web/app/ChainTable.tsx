'use client';

import { useEffect, useState } from 'react';
import { Card, Skeleton, ErrorState, EmptyState, Badge } from '@/components/ui';
import { shortenAddress } from '@/lib/eip55';
import { useT, useLanguage } from '@/lib/i18n';
import { interpolate } from '@/lib/i18n/interpolate';
import { formatNumber } from '@/lib/numbers';
import { readDirectory, type ChainRecord } from '@/lib/directory';
import { presetLabelOf } from '@/lib/serverText';
import { sortEntries, type Entry } from '@/lib/directoryModel';
import { symbolOf } from '@/lib/l1-symbol';

/**
 * The list of existing L1s on the HOME page, read from the `console-chains.json` data contract.
 *
 * 🔴 A MISSING KEY IS A VALID STATE, NOT AN ERROR. Chains launched before the console had an
 * `admin`/`presetName` field simply do not have those two keys (OmegaChain is one). The old
 * hand-written directory page used to let `undefined` reach the user's screen. Here: no owner ⇒
 * "system default"; no type ⇒ leave it blank, do not invent one.
 *
 * ⚠️ This page is READ-ONLY and shows only the NEWEST few (2026-09-04). With 108+ L1s the home
 * page cannot carry the whole list — that is what `/chains/` is for: live state per chain,
 * search, filters, grouping and paging. The home table is the invitation; the directory is
 * the directory. The link under the table always says how many chains there are in total,
 * so the number here never reads as "that is all of them".
 */
/**
 * `presetTen` is the OLD key, written by the console before the English naming pass (2026-08-26).
 * Records created before that date still carry it, and records ALREADY WRITTEN are not rewritten
 * — so read both. The old branch can go once no pre-cutoff record remains, but remember that
 * restoring an old backup brings them back.
 */
type TT = { phase: 'tai' } | { phase: 'xong'; list: ChainRecord[]; total: number } | { phase: 'hong' };

/** How many rows the home page shows. Nine, in keeping with the project's number. */
const HOME_ROWS = 9;

export function ChainTable() {
  const t = useT();
  const { code } = useLanguage();
  const [state, setState] = useState<TT>({ phase: 'tai' });
  const [round, setRound] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ phase: 'tai' });
    // The timeout (Đ1-8) is still there, now inside `lib/directory.ts` alongside the read: this is
    // a READ of a static file, and without a limit one hung connection leaves the table as a
    // skeleton forever — the page looks like it is loading indefinitely and the user has nothing
    // to click. That read is SHARED with `useNetworkStats` on this same page.
    readDirectory()
      .then((j) => {
        if (cancelled) return;
        const all = Array.isArray(j?.chains) ? j.chains : [];
        // Newest first, same rule as the directory's default sort — one ordering for both surfaces.
        const entries: Entry[] = all.map((r) => ({ key: String(r.chainId), record: r, isMain: false, revoked: false, verdict: 'measuring' }));
        const list = sortEntries(entries, 'newest')
          .slice(0, HOME_ROWS)
          .map((e) => e.record);
        setState({ phase: 'xong', list, total: all.length });
      })
      .catch(() => {
        if (!cancelled) setState({ phase: 'hong' });
      });
    return () => {
      cancelled = true;
    };
  }, [round]);

  if (state.phase === 'tai') {
    return (
      <Card className="p-5">
        <span className="sr-only">{t.common.loading}</span>
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (state.phase === 'hong') return <ErrorState onRetry={() => setRound((n) => n + 1)} />;

  if (!state.list.length) {
    return (
      <EmptyState
        title={t.home.emptyTitle}
        desc={t.home.emptyDesc}
        action={
          <a
            href="/create-chain/"
            className="inline-flex h-11 items-center justify-center rounded-btn-lg bg-gold px-5 text-sm font-semibold text-navy shadow-cta hover:bg-gold-hover"
          >
            {t.home.primaryCta}
          </a>
        }
      />
    );
  }

  return (
    <>
      {/* 🔴 THIS NOTE ONLY APPEARS WHEN THE TABLE HAS ROWS (Đ1-4).
          Before 2026-08-27 the sentence "Each row is a real chain that is running" sat in a `<p>`
          under the `<h1>` — meaning it appeared EVEN WHEN the table was empty, at which point it
          pointed at rows that did not exist. Placed here, the sentence only exists at the same
          time as the thing it describes. */}
      <p className="mb-3 text-sm text-body">{t.home.tableCaption}</p>
      <Card className="overflow-hidden">
      {/* A wide table must scroll INSIDE its own frame — letting the whole page scroll
          horizontally breaks the layout on a phone, and that is the most common fault with tables. */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <caption className="sr-only">{t.home.tableCaption}</caption>
          {/* 🔴 `text-start` MUST BE ON EVERY `<th>`, NOT ONLY ON THE `<tr>`.
              Measured on the deployed site 2026-09-03: with `text-left` on the `<tr>`
              the column headers picked it up, but switching to `text-start` moved them
              to `center` — so the inheritance path from `<tr>` down to `<th>` is NOT
              equivalent between those two utilities, and the RTL fix had silently
              re-aligned the table in English too. Putting it on the `<th>` itself
              depends on no inheritance at all, so it is right in both writing
              directions. `text-start` stays on the `<tr>` for the `<td>`s below. */}
          <thead>
            <tr className="border-b border-line bg-surface-alt text-start">
              <th scope="col" className="px-4 py-3 text-start font-semibold text-ink">
                {t.home.colChain}
              </th>
              <th scope="col" className="px-4 py-3 text-start font-semibold text-ink">
                {t.home.colType}
              </th>
              <th scope="col" className="px-4 py-3 text-start font-semibold text-ink">
                {t.home.colOwner}
              </th>
            </tr>
          </thead>
          <tbody>
            {state.list.map((c) => (
              <tr key={c.chainId} className="border-b border-line-soft last:border-0">
                <th scope="row" className="px-4 py-3 text-start font-semibold text-ink">
                  {c.name}
                  <span className="ms-2 rounded-chip border border-line px-1.5 font-mono text-[11px] font-semibold text-body-2">{symbolOf(c)}</span>
                  <span className="ms-2 font-mono text-xs font-normal text-muted">#{c.chainId}</span>
                </th>
                <td className="px-4 py-3 text-body-2">
                  {presetLabelOf(t, c) ? <Badge>{presetLabelOf(t, c)}</Badge> : <span className="text-muted">—</span>}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-body-2">
                  {typeof c.admin === 'string' && c.admin.trim() ? (
                    shortenAddress(c.admin)
                  ) : (
                    <span className="font-sans text-muted">{t.home.systemDefault}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </Card>
      <p className="mt-3 text-sm">
        <a href="/chains/" className="font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-gold">
          {interpolate(t.home.moreChains, { count: formatNumber(state.total, code) })}
        </a>
      </p>
    </>
  );
}
