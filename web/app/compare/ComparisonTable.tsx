'use client';

import { useState } from 'react';
import { Card, Badge, Skeleton, Note, cx } from '@/components/ui';
import { useNetworkStats } from '@/lib/stats';
import { useT, useLanguage } from '@/lib/i18n';
import { formatNumber } from '@/lib/numbers';

/**
 * The A1 ↔ C1 comparison table.
 *
 * 🔴 TWO RULES FOR THIS SCREEN, both about HONESTY rather than about the interface:
 *
 * 1. **If we score ourselves, we say so.** The A1/C1 scores below are set by the team, not
 *    independently measured. A scorecard that does not declare that is not evidence, it is
 *    advertising in a table — and A1 is the party doing the presenting.
 *
 * 2. **C1 being absent must look like ABSENT, not like BROKEN.** C1's numbers need a Cosmos
 *    REST URL the project does not have (H-5). Drawing a red error block there misrepresents
 *    C1; so does leaving it blank. Say plainly "not connected yet" and why, and let the rest of
 *    the page keep working normally.
 */

/**
 * One criterion: the SCORES stay in the code, the WORDS live in the dictionary.
 *
 * 🔴 That boundary is deliberate and it was paid for. Before `2026-09-03` both the criterion
 * names and the notes were hard-coded Vietnamese strings in the array below — meaning the whole
 * BODY of the comparison table, the longest and most argued-over part of this screen, rendered
 * in Vietnamese for readers in all 30 languages. The old string audit was blind to it because it
 * only read JSX text and attributes, while this is text held in DATA.
 *
 * `id` is the lookup key inside `t.compare` (`crit<Id>` and `note<Id>`) — built by concatenation
 * rather than looked up dynamically at the call site, so `check-dict-values` and `tsc` can still
 * see the relationship.
 */
type Criterion = { id: string; kind: 'kienTruc' | 'song'; a: number; c: number; w: number };

// Keeping the criteria and scores of the old dashboard (`local-net/dashboard/index.html`)
// and of `docs/A1-vs-C1-SCORECARD.md`. Do NOT re-score here: changing a score is a product
// decision, it goes through the documents, and it does not get mixed into a UI pass.
const GOC: Criterion[] = [
  { id: 'Decentralisation', kind: 'kienTruc', a: 5, c: 2, w: 4 },
  { id: 'Finality', kind: 'kienTruc', a: 5, c: 3, w: 3 },
  { id: 'EvmMaturity', kind: 'kienTruc', a: 5, c: 2, w: 4 },
  { id: 'WalletCompat', kind: 'kienTruc', a: 5, c: 3, w: 4 },
  { id: 'LaunchUx', kind: 'song', a: 4, c: 4, w: 3 },
  { id: 'Interop', kind: 'song', a: 3, c: 5, w: 4 },
  { id: 'OpCost', kind: 'kienTruc', a: 4, c: 3, w: 2 },
  { id: 'Bootstrap', kind: 'kienTruc', a: 2, c: 4, w: 3 },
  { id: 'EconSecurity', kind: 'kienTruc', a: 4, c: 3, w: 3 },
  { id: 'SwitchCost', kind: 'kienTruc', a: 2, c: 5, w: 2 },
];

export function ComparisonTable() {
  const t = useT();
  // Looked up by `id`. The key is CONCATENATED so `tsc` cannot check it, and `i18n-shape` is
  // blind too — it compares the 30 dictionaries WITH EACH OTHER, so "all 30 missing it" is
  // valid to it. What actually guards this is `test/compare-criteria.test.ts`, joining the
  // array below to the dictionary in BOTH DIRECTIONS.
  const ten = (c: Criterion) => (t.compare as Record<string, string>)[`crit${c.id}`];
  const ghiChu = (c: Criterion) => (t.compare as Record<string, string>)[`note${c.id}`];
  const { code } = useLanguage();
  const [ts, datTs] = useState<number[]>(GOC.map((c) => c.w));
  const { state } = useNetworkStats();

  const diemA = GOC.reduce((t, c, i) => t + c.a * ts[i], 0);
  const diemC = GOC.reduce((t, c, i) => t + c.c * ts[i], 0);
  const tong = diemA + diemC || 1;

  return (
    <div className="mt-8 flex flex-col gap-6">
      <Note tone="warn">
        <strong className="block font-semibold">{t.compare.selfScoreTitle}</strong>
        <span className="mt-1 block">{t.compare.selfScoreDesc}</span>
      </Note>

      <Card className="p-5">
        <h2 className="font-display text-base font-bold text-ink">{t.compare.liveDataTitle}</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          {/* Three states PER CELL (Đ1-8): `undefined` measuring · `string` measured ·
              `null` this cell is absent. See `lib/stats.ts` for why one failing source no
              longer drags the other two down with it. */}
          {(() => {
            const s = state.phase === 'done' ? state.numbers : null;
            return [
              {
                n: t.compare.a1Validators,
                v: !s ? undefined : s.validatorsTotal === null ? null : `${s.validatorsConnected}/${s.validatorsTotal}`,
              },
              { n: t.compare.a1Chains, v: !s ? undefined : s.l1Count === null ? null : String(s.l1Count) },
              {
                n: t.compare.a1Blocks,
                v: !s ? undefined : s.blockHeight === null ? null : formatNumber(s.blockHeight, code),
              },
            ];
          })().map((x) => (
            <div key={x.n}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{x.n}</dt>
              <dd className="font-display text-2xl font-extrabold text-ink">
                {x.v !== undefined && x.v !== null ? (
                  x.v
                ) : x.v === null || state.phase === 'failed' ? (
                  <span className="font-sans text-sm font-normal text-muted">{t.compare.cannotMeasure}</span>
                ) : (
                  <><span className="sr-only">{t.compare.measuring}</span><Skeleton className="h-8 w-16" /></>
                )}
              </dd>
            </div>
          ))}
        </dl>
        {/* C1 absent: say plainly it is ABSENT, do not draw an error block. */}
        <div className="mt-5 rounded-card border border-dashed border-line-strong bg-surface-alt px-4 py-3">
          <p className="text-sm font-semibold text-body">{t.compare.c1Unreachable}</p>
          <p className="mt-1 text-sm text-body-2">{t.compare.c1UnreachableDesc}</p>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-sm">
            <caption className="sr-only">{t.compare.title}</caption>
            {/* `text-start` on each `<th>` — same issue as documented in
                `app/ChainTable.tsx`. The two `text-center` cells are DELIBERATE. */}
            <thead>
              <tr className="border-b border-line bg-surface-alt text-start">
                <th scope="col" className="px-3 py-3 text-start font-semibold text-ink">{t.compare.colNo}</th>
                <th scope="col" className="px-3 py-3 text-start font-semibold text-ink">{t.compare.colCriterion}</th>
                <th scope="col" className="px-3 py-3 text-start font-semibold text-ink">{t.compare.colKind}</th>
                <th scope="col" className="px-3 py-3 text-center font-semibold text-ink">{t.compare.colA1}</th>
                <th scope="col" className="px-3 py-3 text-center font-semibold text-ink">{t.compare.colC1}</th>
                <th scope="col" className="px-3 py-3 text-start font-semibold text-ink">{t.compare.colWeight}</th>
              </tr>
            </thead>
            <tbody>
              {GOC.map((c, i) => (
                <tr key={c.id} className="border-b border-line-soft last:border-0">
                  <td className="px-3 py-3 font-mono text-xs text-muted">{i + 1}</td>
                  <th scope="row" className="px-3 py-3 text-start font-semibold text-ink">
                    {ten(c)}
                    <span className="mt-0.5 block text-xs font-normal text-body-2">{ghiChu(c)}</span>
                  </th>
                  <td className="px-3 py-3">
                    <Badge tone={c.kind === 'song' ? 'good' : 'neutral'}>
                      {c.kind === 'song' ? t.compare.kindLiveData : t.compare.kindArchitecture}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-center font-mono font-bold text-ink">{c.a}</td>
                  <td className="px-3 py-3 text-center font-mono font-bold text-ink">{c.c}</td>
                  <td className="px-3 py-3">
                    <label className="flex items-center gap-2">
                      {/* Hidden label: an unlabelled slider is announced by a screen reader as just
                          "slider" — meaningless in a table of 10 rows. */}
                      <span className="sr-only">{`${t.compare.colWeight}: ${ten(c)}`}</span>
                      <input
                        type="range" min={0} max={5} step={1} value={ts[i]}
                        onChange={(e) => datTs((v) => v.map((x, j) => (j === i ? +e.target.value : x)))}
                        className="w-24"
                      />
                      <span className="w-4 font-mono text-sm text-ink">{ts[i]}</span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-display text-base font-bold text-ink">{t.compare.totalScore}</h2>
        <div className="mt-4 flex flex-wrap items-baseline gap-6">
          {[
            { t: 'A1', d: diemA, mau: 'text-gold-ink-strong' },
            { t: 'C1', d: diemC, mau: 'text-vision-ink' },
          ].map((x) => (
            <p key={x.t} className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-muted">{x.t}</span>
              <span className={cx('font-display text-3xl font-extrabold', x.mau)}>{x.d}</span>
            </p>
          ))}
          <p className="text-sm font-semibold text-body">
            {diemA === diemC ? t.compare.tied : `${diemA > diemC ? 'A1' : 'C1'} ${t.compare.leads}`}
          </p>
        </div>
        {/* The ratio bar is only an illustration of two numbers ALREADY shown above — so it is
            aria-hidden, not a second piece of information to read out again. */}
        <div aria-hidden="true" className="mt-4 flex h-5 overflow-hidden rounded-chip">
          <div className="bg-gold" style={{ width: `${(diemA / tong) * 100}%` }} />
          <div className="bg-vision-dot" style={{ width: `${(diemC / tong) * 100}%` }} />
        </div>
      </Card>
    </div>
  );
}
