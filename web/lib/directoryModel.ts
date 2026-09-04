import type { ChainRecord } from './directory';
import { symbolOf } from './l1-symbol';

/**
 * The L1 directory's logic, with no React and no network in it — so `test/directory-model.test.ts`
 * can measure it directly.
 *
 * ═══ WHY THE PAGE WAS SPLIT LIKE THIS (2026-09-04) ═══
 * The directory was designed for a dozen chains: every chain a full card, every card probed
 * every ten seconds, no search, no order but the file's. The next milestone is a directory of
 * **108+ L1s** (`docs/PLAN-108-L1-LOAD-TEST.md`), and at that size three things break at once:
 *   • a wall of 108 cards is not a directory, it is a scroll — readers need search, filters,
 *     grouping (by owner, type, state) and a page size;
 *   • probing 108 chains at once every 10 s is ~220 RPC calls per beat from EVERY open tab —
 *     against the same two nodes that serve every wallet. The sweep below runs a bounded pool
 *     and pauses between sweeps;
 *   • the verdict rule, the filter rule and the URL-state rule each become a place for a quiet
 *     bug, and none of them can be unit-tested while they live inside a component.
 * Everything here is a pure function over plain data. The component in
 * `app/chains/DirectoryContent.tsx` only wires it to React, the network and the dictionary.
 *
 * 🔴 THE VERDICT RULE IS THE POINT OF THE PAGE — DO NOT SIMPLIFY IT (see `verdictOf`).
 */

/* ────────────────────────────────────────────────────────────── measurements */

export type Probe = {
  /** The chain's RPC answered `eth_chainId` + `eth_blockNumber`. */
  rpcOk: boolean;
  chainIdHex?: string;
  chainId?: number;
  blocks?: number;
  /**
   * The subnet's validator count from the P-Chain.
   *   `number`    = measured
   *   `null`      = asked, and the P-Chain call failed
   *   `undefined` = never asked (the record has no `subnetID`)
   * 🔴 0 is a REAL and dangerous value — a subnet with no validators still answers RPC. Never
   * use 0 as "loading".
   */
  validators?: number | null;
  /** `true` = the record has no `blockchainID`, so NOTHING was asked. Not the same as "asked and failed". */
  unknown?: boolean;
  measuredAt: number;
};

export type Verdict =
  | 'main'
  | 'measuring'
  | 'running'
  | 'noValidators'
  | 'notAnswering'
  | 'mismatch'
  | 'unclear'
  | 'revoked';

/** The verdicts a reader should act on. `unclear` is not here: it says WE could not measure, not that the chain is wrong. */
export const ATTENTION: ReadonlySet<Verdict> = new Set<Verdict>(['noValidators', 'notAnswering', 'mismatch']);

export type Entry = {
  key: string;
  record: ChainRecord;
  isMain: boolean;
  revoked: boolean;
  probe?: Probe;
  verdict: Verdict;
};

/** A stable identity for a record across directory reloads. `blockchainID` is unique per chain; the fallbacks are for records that lack it. */
export function keyOf(r: { blockchainID?: string; chainId?: number; name?: string }): string {
  if (r.blockchainID) return `bc:${r.blockchainID}`;
  if (r.chainId != null) return `id:${r.chainId}`;
  return `name:${r.name ?? ''}`;
}

/**
 * The verdict for one chain.
 *
 * 🔴 A chain with NO validators still answers RPC, still serves balances, and wallets still
 * connect — but every transaction hangs forever. Judging liveness by block height or by
 * "RPC replied" reports a dead chain as healthy. The measurement that separates them is the
 * subnet's validator count read from the P-Chain, and that is what decides here.
 *
 * 🔴 `mismatch` is new (2026-09-04): the RPC answered, but with a DIFFERENT Chain ID than the
 * directory records. That is almost always a routing fault (the request fell through to another
 * chain or to the C-Chain), and the previous page would have printed the wrong number next to
 * the right name and called it RUNNING. Once the RPC router of the 108-L1 plan exists
 * (`blockchainID → node`), this is exactly the failure it can produce.
 *
 * 🔴 Revoked chains are NOT probed, and that is not a shortcut. Revoking only removes the subnet
 * from what nodes track; it does NOT remove those nodes from the subnet's validator set on the
 * P-Chain. So `getCurrentValidators` still returns a full set for a chain that is completely
 * dead — the exact measurement the rest of this rule relies on. Their state comes from the
 * directory file, never from a measurement.
 */
export function verdictOf(
  record: { chainId?: number },
  probe: Probe | undefined,
  o: { isMain: boolean; revoked: boolean },
): Verdict {
  if (o.revoked) return 'revoked';
  if (o.isMain) return probe && !probe.rpcOk ? 'notAnswering' : 'main';
  if (!probe) return 'measuring';
  if (probe.unknown) return 'unclear';
  if (!probe.rpcOk) return 'notAnswering';
  if (probe.chainId != null && record.chainId != null && probe.chainId !== record.chainId) return 'mismatch';
  if (probe.validators === 0) return 'noValidators';
  if (probe.validators === null || probe.validators === undefined) return 'unclear';
  return 'running';
}

/* ─────────────────────────────────────────────────────────────── list state */

export type StatusFilter = 'all' | 'running' | 'attention' | 'revoked';
export type GroupBy = 'none' | 'owner' | 'type' | 'status';
export type SortKey = 'newest' | 'oldest' | 'name' | 'chainId' | 'blocks';

export type ListState = {
  q: string;
  status: StatusFilter;
  /** A preset name, or '' for all. */
  type: string;
  group: GroupBy;
  sort: SortKey;
};

export const DEFAULT_STATE: ListState = { q: '', status: 'all', type: '', group: 'none', sort: 'newest' };

const STATUSES: readonly StatusFilter[] = ['all', 'running', 'attention', 'revoked'];
const GROUPS: readonly GroupBy[] = ['none', 'owner', 'type', 'status'];
const SORTS: readonly SortKey[] = ['newest', 'oldest', 'name', 'chainId', 'blocks'];

function pick<T extends string>(v: string | null, allowed: readonly T[], fallback: T): T {
  return v && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
}

/**
 * The list state lives in the URL hash (`/chains/#q=adam&status=attention`) so a filtered view
 * can be pasted into a chat. The hash, not the query: with `output: 'export'` the query string
 * is invisible to Caddy's static route anyway, and a hash never reaches the server at all.
 * Unknown values fall back to the default rather than throwing — a stale link must still open.
 */
export function parseHash(hash: string): ListState {
  const p = new URLSearchParams(hash.replace(/^#/, ''));
  return {
    q: (p.get('q') ?? '').trim(),
    status: pick(p.get('status'), STATUSES, DEFAULT_STATE.status),
    type: (p.get('type') ?? '').trim(),
    group: pick(p.get('group'), GROUPS, DEFAULT_STATE.group),
    sort: pick(p.get('sort'), SORTS, DEFAULT_STATE.sort),
  };
}

/** The inverse of `parseHash`. Only non-default fields are written; the default state is `''` (no hash). */
export function serializeHash(s: ListState): string {
  const p = new URLSearchParams();
  if (s.q) p.set('q', s.q);
  if (s.status !== DEFAULT_STATE.status) p.set('status', s.status);
  if (s.type) p.set('type', s.type);
  if (s.group !== DEFAULT_STATE.group) p.set('group', s.group);
  if (s.sort !== DEFAULT_STATE.sort) p.set('sort', s.sort);
  const out = p.toString();
  return out ? `#${out}` : '';
}

export function isDefaultState(s: ListState): boolean {
  return serializeHash(s) === '';
}

/* ──────────────────────────────────────────────────────────── filter · sort */

/**
 * The type KEY of a record — the preset id when the record has one, the English name for
 * records older than 2026-08-26. A key, not a label (labels live in `lib/serverText.ts`):
 * it is what `#type=` carries and what grouping compares, so it must not depend on language.
 */
export function presetOf(r: { preset?: string; presetName?: string; presetTen?: string }): string {
  return (r.preset ?? r.presetName ?? r.presetTen ?? '').trim();
}

export function ownerOf(r: { admin?: string }): string {
  return typeof r.admin === 'string' ? r.admin.trim() : '';
}

/**
 * Free-text match over the fields a person might have in their clipboard: the name, the
 * decimal Chain ID, the owner address, the blockchain/subnet IDs, and the ticker. Case-
 * insensitive substring — a reader pasting `0x1E8C` must find `0x1e8c…`.
 */
export function matchesQuery(r: ChainRecord, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const hay = [r.name, String(r.chainId ?? ''), ownerOf(r), r.blockchainID ?? '', r.subnetID ?? '', symbolOf(r)]
    .join('\n')
    .toLowerCase();
  return hay.includes(needle);
}

export function matchesStatus(e: Entry, status: StatusFilter): boolean {
  switch (status) {
    case 'all':
      return true;
    case 'running':
      return e.verdict === 'running';
    case 'attention':
      return ATTENTION.has(e.verdict);
    case 'revoked':
      return e.revoked;
  }
}

export function applyFilters(entries: readonly Entry[], s: ListState): Entry[] {
  return entries.filter(
    (e) => !e.isMain && matchesStatus(e, s.status) && (!s.type || presetOf(e.record) === s.type) && matchesQuery(e.record, s.q),
  );
}

function createdMs(r: ChainRecord): number {
  const v = r.createdAt;
  if (v === undefined || v === null) return 0;
  const n = typeof v === 'number' ? v : Date.parse(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Live chains always come before revoked ones, whatever the sort — a revoked chain at the top
 * of "most blocks" would read as the most active chain on the network.
 */
export function sortEntries(entries: readonly Entry[], sort: SortKey): Entry[] {
  const cmp = (a: Entry, b: Entry): number => {
    if (a.revoked !== b.revoked) return a.revoked ? 1 : -1;
    switch (sort) {
      case 'newest':
        return createdMs(b.record) - createdMs(a.record) || (b.record.chainId ?? 0) - (a.record.chainId ?? 0);
      case 'oldest':
        return createdMs(a.record) - createdMs(b.record) || (a.record.chainId ?? 0) - (b.record.chainId ?? 0);
      case 'name':
        return a.record.name.localeCompare(b.record.name, undefined, { sensitivity: 'base' });
      case 'chainId':
        return (a.record.chainId ?? 0) - (b.record.chainId ?? 0);
      case 'blocks':
        return (b.probe?.blocks ?? -1) - (a.probe?.blocks ?? -1) || createdMs(b.record) - createdMs(a.record);
    }
  };
  return [...entries].sort(cmp);
}

/* ───────────────────────────────────────────────────────────────── grouping */

export type Group = { key: string; items: Entry[] };

/** The raw group key. The component turns it into a label (owner `''` = system default, type `''` = none recorded). */
export function groupKeyOf(e: Entry, by: GroupBy): string {
  switch (by) {
    case 'none':
      return '';
    case 'owner':
      return ownerOf(e.record).toLowerCase();
    case 'type':
      return presetOf(e.record);
    case 'status':
      return e.verdict;
  }
}

/** Groups keep the incoming order: the first entry of each group decides where the group sits. */
export function groupEntries(entries: readonly Entry[], by: GroupBy): Group[] {
  if (by === 'none') return [{ key: '', items: [...entries] }];
  const map = new Map<string, Entry[]>();
  for (const e of entries) {
    const k = groupKeyOf(e, by);
    const arr = map.get(k);
    if (arr) arr.push(e);
    else map.set(k, [e]);
  }
  return [...map.entries()].map(([key, items]) => ({ key, items }));
}

/* ─────────────────────────────────────────────────────────────── the sweep */

/**
 * Run `worker` over `items` with at most `concurrency` in flight.
 *
 * 🔴 WHY NOT `Promise.all(items.map(probe))`: that is what the old page did, and with 108
 * chains it fires ~220 requests in the same millisecond from every open tab. Browsers cap
 * connections per host at 6, so the rest queue on the client anyway — but only after the
 * server has been asked to accept them all. A pool makes the ceiling explicit and lets the
 * caller put the chains the reader is LOOKING AT first.
 *
 * A worker's own error is swallowed: it is the worker's job to record its failure as a
 * measurement ("not answering"), and one failed chain must never stop the sweep.
 * `cancelled()` is checked before every pick, so an unmounted page stops within one item.
 */
export async function runPool<T>(
  items: readonly T[],
  worker: (item: T) => Promise<void>,
  concurrency: number,
  cancelled: () => boolean = () => false,
): Promise<void> {
  let next = 0;
  const lanes = Math.max(1, Math.min(concurrency, items.length));
  await Promise.all(
    Array.from({ length: lanes }, async () => {
      while (!cancelled()) {
        const i = next++;
        if (i >= items.length) return;
        try {
          await worker(items[i]);
        } catch {
          /* recorded by the worker itself — see above */
        }
      }
    }),
  );
}

/**
 * The order of one sweep: the main network first (every reader needs it), then the chains
 * currently ON SCREEN in their displayed order, then everything else. Revoked chains are
 * never in a sweep (see `verdictOf`).
 */
export function sweepOrder<T extends { key: string; isMain?: boolean; revoked?: boolean }>(
  records: readonly T[],
  visible: ReadonlySet<string>,
): T[] {
  const live = records.filter((r) => !r.revoked);
  const main = live.filter((r) => r.isMain);
  const seen = live.filter((r) => !r.isMain && visible.has(r.key));
  const rest = live.filter((r) => !r.isMain && !visible.has(r.key));
  return [...main, ...seen, ...rest];
}

/** How many entries the "show more" button reveals at a time. */
export const PAGE_SIZE = 24;
