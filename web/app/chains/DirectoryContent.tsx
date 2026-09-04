'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, Badge, Copyable, Button, ErrorState, EmptyState, Skeleton, Select, Chip } from '@/components/ui';
import { useT, useLanguage } from '@/lib/i18n';
import { interpolate } from '@/lib/i18n/interpolate';
import type { Dict } from '@/lib/i18n/en';
import { formatNumber } from '@/lib/numbers';
import { shortenAddress } from '@/lib/eip55';
import { CHAIN, rpcOrigin } from '@/lib/chain';
import { fetchJson, READ_TIMEOUT_MS } from '@/lib/net';
import { addL1ToWallet, readWalletError } from '@/lib/wallet';
import { readDirectory, type ChainRecord } from '@/lib/directory';
import { symbolOf } from '@/lib/l1-symbol';
import {
  ATTENTION,
  DEFAULT_STATE,
  PAGE_SIZE,
  applyFilters,
  groupEntries,
  isDefaultState,
  keyOf,
  ownerOf,
  parseHash,
  presetOf,
} from '@/lib/directoryModel';
import { presetText, presetLabelOf } from '@/lib/serverText';
import {
  runPool,
  serializeHash,
  sortEntries,
  sweepOrder,
  verdictOf,
  type Entry,
  type ListState,
  type Probe,
  type Verdict,
} from '@/lib/directoryModel';

/**
 * The L1 directory — redesigned 2026-09-04 for a network of **108+ L1s**.
 *
 * ═══ WHAT CHANGED, AND WHY ═══
 * The first Next version (2026-09-03) drew one full card per chain and probed every chain
 * every ten seconds. Fine for eight chains; at the size the next milestone plans
 * (`docs/PLAN-108-L1-LOAD-TEST.md`) it is a wall of cards and ~220 RPC calls per beat from
 * every open tab. This version is a DIRECTORY: summary tiles, a toolbar (search · status ·
 * type · grouping · sort) whose state lives in the URL hash, a dense table paged 24 at a time,
 * and a **sweep** — a bounded pool that measures the chains on screen first, then the rest,
 * then pauses before going round again.
 *
 * Every rule is in `lib/directoryModel.ts`, which has no React in it and is measured by
 * `test/directory-model.test.ts`. This file only wires it to the network and the dictionary.
 *
 * ⚠️ WHAT DID NOT MOVE: `/chains/data/*.json` is still written by the console process into
 * its own container's directory, and Caddy still routes the data path to it (see `page.tsx`).
 *
 * 🔴 THE VERDICT LOGIC IS THE POINT OF THIS PAGE — DO NOT SIMPLIFY IT. A chain with no
 * validators still answers RPC, still serves balances, and wallets still connect. Judging
 * liveness by block height or by "RPC replied" reports a dead chain as healthy. See `verdictOf`.
 */

const CONCURRENCY = 4;
const SWEEP_PAUSE_MS = 30_000;
const MAIN_KEY = 'bc:C';

/** The C-Chain pseudo-record. `subnetID: null` so it is never asked for validators; its display name comes from the dictionary at render time. */
const MAIN_RECORD: ChainRecord = { name: '', chainId: CHAIN.chainId, blockchainID: 'C', subnetID: null };

/* ─────────────────────────────────────────────────────────────── network */

type RpcCall = { method: string; params?: unknown };

/**
 * ONE HTTP request for several JSON-RPC calls. Measured 2026-09-04 against a live L1 on the
 * public RPC: a batch of `eth_chainId` + `eth_blockNumber` answers as an array. Halving the
 * request count matters at 108 chains, where it is the difference between ~220 and ~110
 * requests per sweep. Answers are matched by `id`, not by position — the spec does not
 * promise order.
 */
async function rpcBatch(path: string, calls: RpcCall[]): Promise<unknown[]> {
  const body = calls.map((c, i) => ({ jsonrpc: '2.0', id: i + 1, method: c.method, params: c.params ?? [] }));
  const j = await fetchJson<unknown>(
    `${rpcOrigin()}${path}`,
    { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) },
    READ_TIMEOUT_MS / 1000,
  );
  if (!Array.isArray(j)) throw new Error('batch answer was not an array');
  const byId = new Map<number, { result?: unknown; error?: { message?: string } }>();
  for (const r of j as { id?: number; result?: unknown; error?: { message?: string } }[]) {
    if (typeof r?.id === 'number') byId.set(r.id, r);
  }
  return calls.map((_, i) => {
    const r = byId.get(i + 1);
    if (!r) throw new Error('missing answer in batch');
    if (r.error) throw new Error(r.error.message ?? 'RPC error');
    return r.result;
  });
}

async function rpcOne(path: string, method: string, params: unknown = []): Promise<unknown> {
  const j = await fetchJson<{ result?: unknown; error?: { message?: string } }>(
    `${rpcOrigin()}${path}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    },
    READ_TIMEOUT_MS / 1000,
  );
  if (j.error) throw new Error(j.error.message ?? 'RPC error');
  return j.result;
}

/** Validator count of one subnet — the measurement that tells a live chain from a dead one. */
async function subnetValidators(subnetID: string): Promise<number> {
  const r = (await rpcOne('/ext/bc/P', 'platform.getCurrentValidators', { subnetID })) as { validators?: unknown[] };
  return (r?.validators ?? []).length;
}

/**
 * 🔴 `blockchainID` CAN BE MISSING, and that case must NOT be reported as "not answering". A
 * record without it has nothing to ask — no RPC call was made at all, and saying "not
 * answering" claims a measurement was made and failed. `unknown: true` puts it in the
 * "unclear" branch, which is what actually happened.
 */
async function probeChain(c: ChainRecord): Promise<Probe> {
  if (!c.blockchainID) return { rpcOk: false, unknown: true, validators: undefined, measuredAt: Date.now() };
  const out: Probe = { rpcOk: false, measuredAt: Date.now() };
  try {
    const [cid, blk] = (await rpcBatch(`/ext/bc/${c.blockchainID}/rpc`, [
      { method: 'eth_chainId' },
      { method: 'eth_blockNumber' },
    ])) as [string, string];
    out.chainIdHex = cid;
    out.chainId = parseInt(cid, 16);
    out.blocks = parseInt(blk, 16);
    out.rpcOk = true;
  } catch {
    out.rpcOk = false;
  }
  if (c.subnetID) {
    try {
      out.validators = await subnetValidators(c.subnetID);
    } catch {
      out.validators = null;
    }
  }
  out.measuredAt = Date.now();
  return out;
}

function rpcUrlOf(r: ChainRecord): string {
  if (r.blockchainID === 'C') return `${rpcOrigin()}/ext/bc/C/rpc`;
  return r.blockchainID ? `${rpcOrigin()}/ext/bc/${r.blockchainID}/rpc` : '';
}

/* ──────────────────────────────────────────────────────────────── labels */

type Tone = 'good' | 'bad' | 'warn' | 'neutral';

/** Badge + one-line reason for a verdict. The verdict decides; this only names it. */
function describeVerdict(t: Dict, e: Entry): [Tone, string, string] {
  const d = t.directory;
  switch (e.verdict) {
    case 'main':
      return ['neutral', d.mainNetwork, d.mainNetworkDesc];
    case 'measuring':
      return ['neutral', t.myChains.measuring, d.measuringDesc];
    case 'running':
      return ['good', d.running, interpolate(t.myChains.validatorCount, { count: e.probe?.validators ?? 0 })];
    case 'noValidators':
      return ['bad', t.myChains.noValidators, t.myChains.noValidatorsDesc];
    case 'notAnswering':
      return ['bad', d.notAnswering, d.notAnsweringDesc];
    case 'mismatch':
      return [
        'bad',
        d.mismatch,
        interpolate(d.mismatchDesc, { got: e.probe?.chainId ?? '?', expected: e.record.chainId ?? '?' }),
      ];
    case 'unclear':
      return ['warn', d.unclear, d.unclearDesc];
    case 'revoked':
      return ['neutral', d.revoked, d.revokedDesc];
  }
}

function toDate(v: string | number | undefined): Date | null {
  if (v === undefined || v === null) return null;
  const dt = new Date(v);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

/* ─────────────────────────────────────────────────────────────── the page */

type Dir = { phase: 'loading' } | { phase: 'done'; chains: ChainRecord[]; retired: ChainRecord[]; error: string | null };

export function DirectoryContent() {
  const t = useT();
  const { code } = useLanguage();

  const [dir, setDir] = useState<Dir>({ phase: 'loading' });
  const [probes, setProbes] = useState<ReadonlyMap<string, Probe>>(new Map());
  const probesRef = useRef<Map<string, Probe>>(new Map());
  const [sweep, setSweep] = useState<{ done: number; total: number; running: boolean }>({ done: 0, total: 0, running: false });
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [round, setRound] = useState(0);

  const [list, setListRaw] = useState<ListState>(DEFAULT_STATE);
  const [shown, setShown] = useState(PAGE_SIZE);
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const visibleRef = useRef<Set<string>>(new Set());

  // The URL hash is read AFTER hydration (the static HTML has no hash to read), and written
  // with `replaceState` so typing in the search box does not pile up history entries.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash) setListRaw(parseHash(window.location.hash));
  }, []);
  const setList = useCallback((patch: Partial<ListState>) => {
    setListRaw((prev) => {
      const next = { ...prev, ...patch };
      if (typeof window !== 'undefined') {
        const h = serializeHash(next);
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${h}`);
      }
      return next;
    });
    setShown(PAGE_SIZE);
  }, []);

  /* ── the sweep ─────────────────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function cycle() {
      // 1. The directory itself — re-read every cycle so a chain launched meanwhile appears.
      let chains: ChainRecord[] = [];
      let retired: ChainRecord[] = [];
      let error: string | null = null;
      try {
        const d = await readDirectory();
        chains = Array.isArray(d?.chains) ? d.chains : [];
        retired = Array.isArray(d?.retired) ? d.retired : [];
      } catch (e) {
        error = e instanceof Error ? e.message : String(e);
      }
      if (cancelled) return;
      setDir({ phase: 'done', chains, retired, error });

      // 2. Measure: main first, then what the reader is looking at, then the rest.
      const order = sweepOrder(
        [{ key: MAIN_KEY, record: MAIN_RECORD, isMain: true }, ...chains.map((r) => ({ key: keyOf(r), record: r, isMain: false }))],
        visibleRef.current,
      );
      let done = 0;
      setSweep({ done, total: order.length, running: true });
      await runPool(
        order,
        async (item) => {
          const p = await probeChain(item.record);
          if (cancelled) return;
          probesRef.current = new Map(probesRef.current).set(item.key, p);
          setProbes(probesRef.current);
          done++;
          setSweep({ done, total: order.length, running: true });
        },
        CONCURRENCY,
        () => cancelled,
      );
      if (cancelled) return;
      setSweep({ done, total: order.length, running: false });
      setUpdatedAt(new Date());
      // 3. Pause, then go round again — chained from the END of the sweep, never on an
      //    interval: an interval on a slow network stacks sweeps on top of each other.
      timer = setTimeout(cycle, SWEEP_PAUSE_MS);
    }

    cycle();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [round]);

  const rerun = useCallback(() => setRound((n) => n + 1), []);

  /* ── derived ───────────────────────────────────────────────────────── */
  const chains = dir.phase === 'done' ? dir.chains : [];
  const retired = dir.phase === 'done' ? dir.retired : [];

  const entries = useMemo<Entry[]>(() => {
    const mk = (record: ChainRecord, isMain: boolean, revoked: boolean): Entry => {
      const key = isMain ? MAIN_KEY : keyOf(record);
      const probe = revoked ? undefined : probes.get(key);
      return { key, record, isMain, revoked, probe, verdict: verdictOf(record, probe, { isMain, revoked }) };
    };
    return [mk(MAIN_RECORD, true, false), ...chains.map((r) => mk(r, false, false)), ...retired.map((r) => mk(r, false, true))];
  }, [chains, retired, probes]);

  const main = entries[0];
  const types = useMemo(() => [...new Set(entries.slice(1).map((e) => presetOf(e.record)).filter(Boolean))].sort(), [entries]);

  const filtered = useMemo(() => applyFilters(entries, list), [entries, list]);
  const sorted = useMemo(() => sortEntries(filtered, list.sort), [filtered, list.sort]);
  const visible = sorted.slice(0, shown);
  const visibleSet = useMemo(() => new Set(visible.map((e) => e.key)), [visible]);
  useEffect(() => {
    visibleRef.current = new Set(visibleSet);
  }, [visibleSet]);

  const counts = useMemo(() => {
    const live = entries.filter((e) => !e.isMain && !e.revoked);
    return {
      total: live.length,
      running: live.filter((e) => e.verdict === 'running').length,
      attention: live.filter((e) => ATTENTION.has(e.verdict)).length,
      revoked: retired.length,
    };
  }, [entries, retired.length]);

  const toggle = useCallback((key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  /* ── render ────────────────────────────────────────────────────────── */
  if (dir.phase === 'loading') {
    return (
      <div className="flex flex-col gap-4">
        <span className="sr-only">{t.common.loading}</span>
        <Skeleton className="h-10 w-2/3" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const d = t.directory;
  const hasAny = chains.length > 0 || retired.length > 0;
  const groups = groupEntries(sorted, list.group);

  const groupLabel = (key: string, first?: Entry): string => {
    switch (list.group) {
      case 'owner':
        // The group KEY is lower-cased so one owner is one group whatever the casing in
        // each record; the LABEL keeps the checksum casing of the first record, which is
        // what a reader pastes into a wallet.
        return key ? (first ? ownerOf(first.record) : key) : t.home.systemDefault;
      case 'type':
        // The key is the preset id; the reader sees its translation (or the record's own
        // English name for an id the dictionary does not know yet).
        return key ? presetText(t, key, { name: first?.record.presetName ?? first?.record.presetTen }).name : d.groupNoType;
      case 'status':
        return describeVerdict(t, { verdict: key as Verdict, record: MAIN_RECORD, key, isMain: false, revoked: key === 'revoked' })[1];
      default:
        return '';
    }
  };

  return (
    <>
      <header className="max-w-2xl">
        <h1 className="font-display text-2xl font-extrabold text-ink md:text-3xl">{t.nav.directory}</h1>
        <p className="mt-3 text-base text-body">{d.lede}</p>
      </header>

      {/* ── summary tiles ── */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile label={d.tileTotal} value={formatNumber(counts.total, code)} />
        <Tile label={d.tileRunning} value={formatNumber(counts.running, code)} tone={counts.running > 0 ? 'good' : undefined} />
        <Tile label={d.tileAttention} value={formatNumber(counts.attention, code)} tone={counts.attention > 0 ? 'bad' : undefined} />
        <Tile label={d.tileRevoked} value={formatNumber(counts.revoked, code)} />
      </div>
      {/* The sweep line is a live region: a screen-reader user hears "measured 40 of 108"
          without having to find it, and the final "updated at" the same way. */}
      <p role="status" aria-live="polite" className="mt-2 font-mono text-xs text-muted">
        {sweep.running
          ? interpolate(d.sweepProgress, { done: sweep.done, total: sweep.total })
          : updatedAt
            ? interpolate(d.footUpdated, { time: updatedAt.toLocaleTimeString(code) })
            : ''}
      </p>

      {/* ── how to read — collapsed, because with 100 rows the explanation must not push the
             list below the fold, but it must still be one click away. ── */}
      <details className="mt-4 rounded-card border border-line bg-surface-alt px-4 py-3 text-sm text-body">
        <summary className="cursor-pointer font-semibold text-ink">{d.howToToggle}</summary>
        <p className="mt-3">
          <strong>{d.howToTitle}</strong> {d.howToBody}
        </p>
        <p className="mt-3">
          <strong>{d.ownerTitle}</strong> {d.ownerBody}
        </p>
      </details>

      {dir.error !== null && (
        <div className="mt-4">
          <ErrorState desc={interpolate(d.listError, { error: dir.error })} onRetry={rerun} />
        </div>
      )}

      {/* ── the main network, pinned ── */}
      <div className="mt-6">
        <MainCard entry={main} code={code} />
      </div>

      {!hasAny && (
        <div className="mt-4">
          <EmptyState title={t.home.emptyTitle} desc={t.home.emptyDesc} />
        </div>
      )}

      {hasAny && (
        <>
          {/* ── toolbar ── */}
          <Card className="mt-6 p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="dir-search" className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {d.searchLabel}
                </label>
                <input
                  id="dir-search"
                  type="search"
                  value={list.q}
                  onChange={(e) => setList({ q: e.target.value })}
                  placeholder={d.searchPlaceholder}
                  autoComplete="off"
                  spellCheck={false}
                  className="h-11 w-full rounded-btn border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-muted"
                />
              </div>

              <div role="group" aria-label={d.filterStatus} className="flex flex-wrap items-center gap-2">
                <span className="me-1 text-xs font-semibold uppercase tracking-wide text-muted">{d.filterStatus}</span>
                <Chip pressed={list.status === 'all'} onClick={() => setList({ status: 'all' })}>
                  {d.filterAll}
                </Chip>
                <Chip pressed={list.status === 'running'} onClick={() => setList({ status: 'running' })}>
                  {d.filterRunning}
                  <Count n={counts.running} code={code} />
                </Chip>
                <Chip pressed={list.status === 'attention'} onClick={() => setList({ status: 'attention' })}>
                  {d.filterAttention}
                  <Count n={counts.attention} code={code} />
                </Chip>
                <Chip pressed={list.status === 'revoked'} onClick={() => setList({ status: 'revoked' })}>
                  {d.filterRevoked}
                  <Count n={counts.revoked} code={code} />
                </Chip>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
                <Select label={d.filterType} value={list.type} onChange={(e) => setList({ type: e.target.value })}>
                  <option value="">{d.filterTypeAll}</option>
                  {types.map((ty) => (
                    <option key={ty} value={ty}>
                      {presetText(t, ty).name}
                    </option>
                  ))}
                </Select>
                <Select label={d.groupBy} value={list.group} onChange={(e) => setList({ group: e.target.value as ListState['group'] })}>
                  <option value="none">{d.groupNone}</option>
                  <option value="owner">{d.groupOwner}</option>
                  <option value="type">{d.groupType}</option>
                  <option value="status">{d.groupStatus}</option>
                </Select>
                <Select label={d.sortBy} value={list.sort} onChange={(e) => setList({ sort: e.target.value as ListState['sort'] })}>
                  <option value="newest">{d.sortNewest}</option>
                  <option value="oldest">{d.sortOldest}</option>
                  <option value="name">{d.sortName}</option>
                  <option value="chainId">{d.sortChainId}</option>
                  <option value="blocks">{d.sortBlocks}</option>
                </Select>
                <Button variant="outline" onClick={rerun} isRunning={sweep.running} className="lg:mb-0">
                  {d.refresh}
                </Button>
              </div>
            </div>
          </Card>

          {/* ── results ── */}
          <p className="mt-4 text-sm text-body">
            {interpolate(d.showing, { shown: formatNumber(Math.min(shown, sorted.length), code), total: formatNumber(sorted.length, code) })}
          </p>

          {sorted.length === 0 ? (
            <div className="mt-3">
              <EmptyState
                title={d.noMatchTitle}
                desc={d.noMatchDesc}
                action={
                  !isDefaultState(list) ? (
                    <Button variant="outline" onClick={() => setList(DEFAULT_STATE)}>
                      {d.clearFilters}
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-6">
              {groups.map((g) => {
                const rows = g.items.filter((e) => visibleSet.has(e.key));
                if (rows.length === 0) return null;
                return (
                  <section key={g.key || '__all'} aria-label={list.group === 'none' ? d.listCaption : groupLabel(g.key, g.items[0])}>
                    {list.group !== 'none' && (
                      <h2 className="mb-2 flex flex-wrap items-baseline gap-2 text-sm font-semibold text-ink">
                        <span className={list.group === 'owner' && g.key ? 'break-all font-mono' : ''}>{groupLabel(g.key, g.items[0])}</span>
                        <span className="font-mono text-xs font-normal text-muted">
                          {rows.length === g.items.length
                            ? formatNumber(g.items.length, code)
                            : interpolate(d.groupCount, { shown: formatNumber(rows.length, code), total: formatNumber(g.items.length, code) })}
                        </span>
                      </h2>
                    )}
                    <ChainRows rows={rows} expanded={expanded} toggle={toggle} code={code} caption={d.listCaption} />
                  </section>
                );
              })}
            </div>
          )}

          {sorted.length > shown && (
            <div className="mt-4">
              <Button variant="outline" onClick={() => setShown((n) => n + PAGE_SIZE)}>
                {interpolate(d.showMore, { count: formatNumber(Math.min(PAGE_SIZE, sorted.length - shown), code) })}
              </Button>
            </div>
          )}
        </>
      )}

      <p className="mt-8 font-mono text-xs text-muted">
        {interpolate(d.footSummary, { count: chains.length })}
        {retired.length > 0 ? ` · ${interpolate(d.footRevoked, { count: retired.length })}` : ''}
        {updatedAt ? ` · ${interpolate(d.footUpdated, { time: updatedAt.toLocaleTimeString(code) })}` : ''}
        {` · ${t.launch.doneRpc}: ${rpcOrigin()}`}
      </p>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────── pieces */

function Tile({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p
        className={
          'mt-1 font-display text-2xl font-extrabold ' +
          (tone === 'good' ? 'text-success-ink' : tone === 'bad' ? 'text-danger' : 'text-ink')
        }
      >
        {value}
      </p>
    </Card>
  );
}

function Count({ n, code }: { n: number; code: string }) {
  return <span className="font-mono text-xs font-normal opacity-80">{formatNumber(n, code)}</span>;
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-line-2 py-1.5 text-sm last:border-0 sm:flex-row sm:justify-between sm:gap-3">
      <span className="whitespace-nowrap text-muted">{k}</span>
      <span className="break-all font-mono font-semibold text-ink sm:text-end">{children}</span>
    </div>
  );
}

/** The C-Chain, pinned above the list. Never part of the filters — it is the network, not a row. */
function MainCard({ entry, code }: { entry: Entry; code: string }) {
  const t = useT();
  const [tone, label, why] = describeVerdict(t, entry);
  const rpc = rpcUrlOf(entry.record);
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <h2 className="text-base font-bold text-ink">{t.common.productName} (C-Chain)</h2>
        <Badge tone={tone}>{label}</Badge>
      </div>
      <p className="mt-1 text-sm text-muted">{why}</p>
      <div className="mt-3 grid gap-x-8 sm:grid-cols-2">
        <Row k={t.launch.doneChainId}>
          {CHAIN.chainId} ({CHAIN.chainIdHex})
        </Row>
        <Row k={t.directory.blocks}>{entry.probe?.blocks != null ? formatNumber(entry.probe.blocks, code) : '—'}</Row>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Copyable value={rpc} label={t.launch.doneRpc} />
      </div>
    </Card>
  );
}

/** The dense table. Wide content scrolls INSIDE the card — the page never scrolls sideways. */
function ChainRows({
  rows,
  expanded,
  toggle,
  code,
  caption,
}: {
  rows: Entry[];
  expanded: ReadonlySet<string>;
  toggle: (key: string) => void;
  code: string;
  caption: string;
}) {
  const t = useT();
  const th = 'px-3 py-2.5 text-start text-xs font-semibold uppercase tracking-wide text-muted';
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          {/* 🔴 `text-start` on EVERY `<th>`, not only the `<tr>` — see `ChainTable.tsx` for the measurement. */}
          <thead>
            <tr className="border-b border-line bg-surface-alt">
              <th scope="col" className={th}>
                {t.home.colChain}
              </th>
              <th scope="col" className={th}>
                {t.home.colType}
              </th>
              <th scope="col" className={th}>
                {t.home.colOwner}
              </th>
              <th scope="col" className={th}>
                {t.myChains.colStatus}
              </th>
              <th scope="col" className={th + ' text-end'}>
                {t.directory.blocks}
              </th>
              <th scope="col" className={th}>
                {t.directory.created}
              </th>
              <th scope="col" className={th}>
                <span className="sr-only">{t.directory.showDetails}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <ChainRow key={e.key} e={e} open={expanded.has(e.key)} toggle={toggle} code={code} />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ChainRow({ e, open, toggle, code }: { e: Entry; open: boolean; toggle: (key: string) => void; code: string }) {
  const t = useT();
  const d = t.directory;
  const [tone, label, why] = describeVerdict(t, e);
  const owner = ownerOf(e.record);
  const preset = presetLabelOf(t, e.record);
  const created = toDate(e.record.createdAt);
  const revokedAt = toDate(e.record.revokedAt ?? e.record.thuHoiLuc);
  const symbol = symbolOf(e.record);
  const rpc = e.record.rpc ?? rpcUrlOf(e.record);
  const detailsId = `dir-details-${e.key.replace(/[^A-Za-z0-9_-]/g, '_')}`;
  const dim = e.revoked ? ' text-muted' : '';

  return (
    <>
      <tr className={'border-b border-line-soft' + (open ? ' bg-surface-alt' : '') + (e.revoked ? ' opacity-75' : '')}>
        <th scope="row" className={'px-3 py-2.5 text-start font-semibold text-ink' + dim}>
          <span className={e.revoked ? 'line-through' : ''}>{e.record.name}</span>
          {symbol && <span className="ms-2 rounded-chip border border-line px-1.5 font-mono text-[11px] font-semibold text-body-2">{symbol}</span>}
          <span className="ms-2 whitespace-nowrap font-mono text-xs font-normal text-muted">#{e.record.chainId}</span>
        </th>
        <td className="px-3 py-2.5 text-body-2">{preset ? <Badge>{preset}</Badge> : <span className="text-muted">—</span>}</td>
        <td className="px-3 py-2.5 font-mono text-xs text-body-2">
          {owner ? <span title={owner}>{shortenAddress(owner)}</span> : <span className="font-sans text-muted">{t.home.systemDefault}</span>}
        </td>
        <td className="px-3 py-2.5">
          <Badge tone={tone}>{label}</Badge>
          {e.verdict === 'running' && e.probe?.validators != null && (
            <span className="ms-2 whitespace-nowrap font-mono text-xs text-muted">{interpolate(t.myChains.validatorCount, { count: e.probe.validators })}</span>
          )}
        </td>
        <td className="px-3 py-2.5 text-end font-mono text-xs text-body-2">{e.probe?.blocks != null ? formatNumber(e.probe.blocks, code) : '—'}</td>
        <td className="whitespace-nowrap px-3 py-2.5 text-xs text-body-2">{created ? created.toLocaleDateString(code) : '—'}</td>
        <td className="px-3 py-2.5 text-end">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={detailsId}
            aria-label={interpolate(d.detailsOf, { name: e.record.name })}
            onClick={() => toggle(e.key)}
            className="inline-flex h-8 items-center gap-1 rounded-chip border border-line-strong bg-surface px-2.5 text-xs font-semibold text-body hover:bg-surface-alt"
          >
            {open ? d.hideDetails : d.showDetails}
            <span aria-hidden="true">{open ? '▴' : '▾'}</span>
          </button>
        </td>
      </tr>
      <tr id={detailsId} hidden={!open} className="border-b border-line-soft bg-surface-alt">
        <td colSpan={7} className="px-3 pb-4 pt-1">
          <p className="mb-3 text-sm text-body">{why}</p>
          <div className="grid gap-x-8 md:grid-cols-2">
            <Row k={d.ownerAdmin}>{owner ? <span className="text-success-ink">{owner}</span> : <span className="font-sans font-normal text-muted">{t.home.systemDefault}</span>}</Row>
            <Row k={d.nativeToken}>{symbol || '—'}</Row>
            <Row k={t.launch.doneChainId}>
              {e.record.chainId}
              {e.probe?.chainIdHex ? ` (${e.probe.chainIdHex})` : ''}
              {e.revoked && <span className="ms-1 font-sans font-normal text-muted">({d.neverReissued})</span>}
            </Row>
            {!e.revoked && <Row k={d.subnetValidators}>{e.probe?.validators ?? '—'}</Row>}
            <Row k="subnetID">{e.record.subnetID || '—'}</Row>
            <Row k="blockchainID">{e.record.blockchainID || '—'}</Row>
            {created && <Row k={d.created}>{created.toLocaleString(code)}</Row>}
            {revokedAt && <Row k={d.revokedAt}>{revokedAt.toLocaleString(code)}</Row>}
            {!e.revoked && <Row k={t.launch.doneRpc}>{rpc || '—'}</Row>}
          </div>
          {!e.revoked && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {e.verdict === 'running' && rpc && <AddToWallet record={e.record} rpc={rpc} symbol={symbol} />}
              {rpc && <Copyable value={rpc} label={t.launch.doneRpc} />}
              {owner && <Copyable value={owner} label={d.copyOwner} />}
            </div>
          )}
        </td>
      </tr>
    </>
  );
}

function AddToWallet({ record, rpc, symbol }: { record: ChainRecord; rpc: string; symbol: string }) {
  const t = useT();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <>
      <Button
        size="md"
        onClick={async () => {
          setMsg(null);
          try {
            // 🔴 MetaMask accepts ONLY a hex chainId; and the ticker is the L1's OWN (P-55),
            // never LOVE9 — see `lib/l1-symbol.ts` for the 50M-LOVE9 measurement.
            await addL1ToWallet({ chainIdHex: '0x' + record.chainId.toString(16), name: record.name, rpc, kyHieu: symbol });
            setMsg(t.myChains.addedToWallet);
          } catch (e) {
            const l = readWalletError(e);
            setMsg(l.rejected ? t.common.walletRejected : l.noWallet ? t.errors.noWallet : interpolate(t.myChains.addWalletError, { detail: l.detail ?? '' }));
          }
        }}
      >
        {t.myChains.addToWallet}
      </Button>
      {/* A permanent live region per card, so the outcome is announced where it happens. */}
      <span role="status" aria-live="polite" className="text-xs text-muted">
        {msg}
      </span>
    </>
  );
}
