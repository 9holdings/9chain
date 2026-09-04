import { describe, expect, it } from 'vitest';
import {
  ATTENTION,
  DEFAULT_STATE,
  applyFilters,
  groupEntries,
  isDefaultState,
  keyOf,
  matchesQuery,
  parseHash,
  runPool,
  serializeHash,
  sortEntries,
  sweepOrder,
  verdictOf,
  type Entry,
  type Probe,
} from '../lib/directoryModel';
import { symbolFromName, symbolOf } from '../lib/l1-symbol';
import type { ChainRecord } from '../lib/directory';

/**
 * The directory's logic, measured without React or a network.
 *
 * ═══ WHY THESE CASES ═══
 * The verdict rule is the one thing on `/chains/` that must never regress: "RPC answered" is
 * NOT "the chain is alive", and 0 validators is NOT "loading". Every branch is pinned here, in
 * BOTH directions — the case that must be RUNNING and the case that must not.
 * The rest (filters, sort, grouping, the URL hash, the pool) is what makes 108 rows a
 * directory instead of a scroll, and each has a way to be quietly wrong.
 */

const rec = (p: Partial<ChainRecord> & { name: string; chainId: number }): ChainRecord => ({
  blockchainID: `bc-${p.chainId}`,
  subnetID: `sn-${p.chainId}`,
  ...p,
});
const probe = (p: Partial<Probe>): Probe => ({ rpcOk: true, measuredAt: 0, ...p });
const entry = (record: ChainRecord, p?: Probe, o: { revoked?: boolean; isMain?: boolean } = {}): Entry => {
  const isMain = o.isMain ?? false;
  const revoked = o.revoked ?? false;
  return { key: keyOf(record), record, isMain, revoked, probe: p, verdict: verdictOf(record, p, { isMain, revoked }) };
};

describe('verdictOf — the point of the page', () => {
  const r = rec({ name: 'Adam Chain', chainId: 9001000000 });
  const o = { isMain: false, revoked: false };

  it('RPC up + validators > 0 ⇒ running', () => {
    expect(verdictOf(r, probe({ chainId: 9001000000, validators: 5 }), o)).toBe('running');
  });

  it('🔴 RPC up + 0 validators ⇒ noValidators, never running', () => {
    // A subnet with an empty validator set still answers eth_chainId and still serves balances.
    expect(verdictOf(r, probe({ chainId: 9001000000, validators: 0 }), o)).toBe('noValidators');
  });

  it('RPC down ⇒ notAnswering, whatever the P-Chain said', () => {
    expect(verdictOf(r, probe({ rpcOk: false, validators: 5 }), o)).toBe('notAnswering');
  });

  it('RPC answers with ANOTHER chainId ⇒ mismatch (a routing fault, not this chain)', () => {
    expect(verdictOf(r, probe({ chainId: 9000000009, validators: 5 }), o)).toBe('mismatch');
  });

  it('P-Chain call failed (null) ⇒ unclear; never asked (undefined) ⇒ unclear', () => {
    expect(verdictOf(r, probe({ chainId: 9001000000, validators: null }), o)).toBe('unclear');
    expect(verdictOf(r, probe({ chainId: 9001000000, validators: undefined }), o)).toBe('unclear');
  });

  it('no blockchainID ⇒ unknown ⇒ unclear, NOT notAnswering (nothing was asked)', () => {
    expect(verdictOf(r, probe({ rpcOk: false, unknown: true }), o)).toBe('unclear');
  });

  it('not measured yet ⇒ measuring', () => {
    expect(verdictOf(r, undefined, o)).toBe('measuring');
  });

  it('revoked ⇒ revoked, even with a probe that says alive (the P-Chain lies about revoked subnets)', () => {
    expect(verdictOf(r, probe({ chainId: 9001000000, validators: 9 }), { isMain: false, revoked: true })).toBe('revoked');
  });

  it('the main network is "main" unless its RPC is down', () => {
    expect(verdictOf(r, undefined, { isMain: true, revoked: false })).toBe('main');
    expect(verdictOf(r, probe({ chainId: 9000000009 }), { isMain: true, revoked: false })).toBe('main');
    expect(verdictOf(r, probe({ rpcOk: false }), { isMain: true, revoked: false })).toBe('notAnswering');
  });

  it('the attention set is exactly the three verdicts a reader should act on', () => {
    expect([...ATTENTION].sort()).toEqual(['mismatch', 'noValidators', 'notAnswering']);
  });
});

describe('symbol fallback — must match the console rule to the letter', () => {
  it('worked examples from local-net/lib/l1-symbol.mjs', () => {
    expect(symbolFromName('BBWay Chain')).toBe('BBWAY');
    expect(symbolFromName('9S Union')).toBe('9SUNIO');
    expect(symbolFromName('Adam Chain')).toBe('ADAM');
  });
  it('an explicit symbol wins; a blank one falls back', () => {
    expect(symbolOf({ name: 'Adam Chain', symbol: 'ADM' })).toBe('ADM');
    expect(symbolOf({ name: 'Adam Chain', symbol: '  ' })).toBe('ADAM');
  });
  it('🔴 never LOVE9 for a user chain with no symbol', () => {
    expect(symbolOf({ name: 'Anything Chain' })).not.toBe('LOVE9');
  });
});

describe('search', () => {
  const r = rec({ name: 'Eva Chain', chainId: 9001000001, admin: '0x1e8c889B6b3b32017680E72549583EA1b1d3292C', blockchainID: '23BxEFszT4gr' });
  it('matches name, chainId, owner (any case), blockchainID and the ticker', () => {
    expect(matchesQuery(r, 'eva')).toBe(true);
    expect(matchesQuery(r, '9001000001')).toBe(true);
    expect(matchesQuery(r, '0X1E8C889B')).toBe(true);
    expect(matchesQuery(r, '23BxEF')).toBe(true);
    expect(matchesQuery(r, 'EVA')).toBe(true);
  });
  it('the reverse: a term found nowhere does not match', () => {
    expect(matchesQuery(r, 'adam')).toBe(false);
  });
  it('an empty query matches everything', () => {
    expect(matchesQuery(r, '   ')).toBe(true);
  });
});

describe('filters, sort, grouping', () => {
  const a = entry(rec({ name: 'Adam Chain', chainId: 1, presetName: 'Standard', admin: '0xAAA', createdAt: 1000 }), probe({ chainId: 1, validators: 5, blocks: 10 }));
  const b = entry(rec({ name: 'Bob Chain', chainId: 2, presetName: 'Gaming', admin: '0xaaa', createdAt: 3000 }), probe({ chainId: 2, validators: 0, blocks: 99 }));
  const c = entry(rec({ name: 'Cara Chain', chainId: 3, presetName: 'Standard', createdAt: 2000 }), undefined);
  const z = entry(rec({ name: 'Zed Chain', chainId: 4, presetName: 'Standard', createdAt: 9000 }), probe({ chainId: 4, validators: 3, blocks: 500 }), { revoked: true });
  const main = entry(rec({ name: '', chainId: 9000000009, blockchainID: 'C' }), undefined, { isMain: true });
  const all = [main, a, b, c, z];

  it('the main network is never a list row', () => {
    expect(applyFilters(all, DEFAULT_STATE).map((e) => e.record.name)).toEqual(['Adam Chain', 'Bob Chain', 'Cara Chain', 'Zed Chain']);
  });

  it('status filters', () => {
    expect(applyFilters(all, { ...DEFAULT_STATE, status: 'running' }).map((e) => e.record.name)).toEqual(['Adam Chain']);
    expect(applyFilters(all, { ...DEFAULT_STATE, status: 'attention' }).map((e) => e.record.name)).toEqual(['Bob Chain']);
    expect(applyFilters(all, { ...DEFAULT_STATE, status: 'revoked' }).map((e) => e.record.name)).toEqual(['Zed Chain']);
  });

  it('type filter + query combine (AND)', () => {
    expect(applyFilters(all, { ...DEFAULT_STATE, type: 'Standard', q: 'ca' }).map((e) => e.record.name)).toEqual(['Cara Chain']);
  });

  it('newest first is the default, and revoked chains always sink to the bottom', () => {
    const names = (s: Parameters<typeof sortEntries>[1]) => sortEntries(applyFilters(all, DEFAULT_STATE), s).map((e) => e.record.name);
    // Zed is the NEWEST and has the MOST blocks — yet it is revoked, so it is last in both.
    expect(names('newest')).toEqual(['Bob Chain', 'Cara Chain', 'Adam Chain', 'Zed Chain']);
    expect(names('oldest')).toEqual(['Adam Chain', 'Cara Chain', 'Bob Chain', 'Zed Chain']);
    expect(names('name')).toEqual(['Adam Chain', 'Bob Chain', 'Cara Chain', 'Zed Chain']);
    expect(names('chainId')).toEqual(['Adam Chain', 'Bob Chain', 'Cara Chain', 'Zed Chain']);
    // Unmeasured (no blocks) sorts after measured.
    expect(names('blocks')).toEqual(['Bob Chain', 'Adam Chain', 'Cara Chain', 'Zed Chain']);
  });

  it('owner grouping is case-insensitive on the address, and "no owner" is its own group', () => {
    const g = groupEntries([a, b, c], 'owner');
    expect(g.map((x) => [x.key, x.items.length])).toEqual([
      ['0xaaa', 2],
      ['', 1],
    ]);
  });

  it('status grouping uses the verdict; type grouping uses the preset name', () => {
    expect(groupEntries([a, b, c], 'status').map((x) => x.key)).toEqual(['running', 'noValidators', 'measuring']);
    expect(groupEntries([a, b, c], 'type').map((x) => x.key)).toEqual(['Standard', 'Gaming']);
    expect(groupEntries([a, b, c], 'none')).toEqual([{ key: '', items: [a, b, c] }]);
  });
});

describe('URL hash state', () => {
  it('round-trips, and the default state is an EMPTY hash', () => {
    expect(serializeHash(DEFAULT_STATE)).toBe('');
    expect(isDefaultState(DEFAULT_STATE)).toBe(true);
    const s = { q: 'adam chain', status: 'attention' as const, type: 'Standard', group: 'owner' as const, sort: 'blocks' as const };
    expect(parseHash(serializeHash(s))).toEqual(s);
    expect(isDefaultState(s)).toBe(false);
  });
  it('a stale or hostile link falls back to defaults instead of throwing', () => {
    expect(parseHash('#status=nonsense&group=<script>&sort=')).toEqual(DEFAULT_STATE);
    expect(parseHash('')).toEqual(DEFAULT_STATE);
  });
});

describe('the sweep', () => {
  it('runPool never has more than `concurrency` workers in flight, and visits every item once', async () => {
    let inFlight = 0;
    let peak = 0;
    const seen: number[] = [];
    await runPool(
      Array.from({ length: 23 }, (_, i) => i),
      async (i) => {
        inFlight++;
        peak = Math.max(peak, inFlight);
        await new Promise((r) => setTimeout(r, 2));
        seen.push(i);
        inFlight--;
      },
      4,
    );
    expect(peak).toBe(4);
    expect([...seen].sort((x, y) => x - y)).toEqual(Array.from({ length: 23 }, (_, i) => i));
  });

  it('a failing worker does not stop the sweep', async () => {
    const done: number[] = [];
    await runPool([1, 2, 3], async (i) => {
      if (i === 2) throw new Error('boom');
      done.push(i);
    }, 2);
    expect(done.sort()).toEqual([1, 3]);
  });

  it('🔴 the reverse: cancellation stops picking new items', async () => {
    let cancelled = false;
    const done: number[] = [];
    await runPool(
      [1, 2, 3, 4, 5, 6],
      async (i) => {
        done.push(i);
        if (i === 2) cancelled = true;
      },
      1,
      () => cancelled,
    );
    expect(done).toEqual([1, 2]);
  });

  it('sweepOrder: main first, then what is on screen, then the rest; revoked never', () => {
    const items = [
      { key: 'x', revoked: false },
      { key: 'main', isMain: true, revoked: false },
      { key: 'y', revoked: false },
      { key: 'gone', revoked: true },
      { key: 'z', revoked: false },
    ];
    expect(sweepOrder(items, new Set(['z'])).map((i) => i.key)).toEqual(['main', 'z', 'x', 'y']);
  });
});
