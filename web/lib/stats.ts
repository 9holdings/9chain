'use client';

import { useEffect, useState } from 'react';
import { rpcOrigin, rpcCChain } from './chain';
import { fetchJson, READ_TIMEOUT_MS, NetworkError } from './net';
import { readDirectory } from './directory';

/**
 * Live network numbers, for the home page.
 *
 * ═══ READ ONCE ON MOUNT, DO NOT POLL ═══
 * The home page is not a dashboard. Polling every few seconds on a page people stay
 * on for twenty means carrying a steady stream of requests from every visitor in
 * exchange for one number ticking over. If a number has to move continuously, that is
 * the explorer's job.
 *
 * (Plus a practical reason: every flavour of `refetchInterval` **does not run** while
 * `document.visibilityState === 'hidden'` — which is exactly the state of every
 * automated viewport. Verifying polling with tooling invites false negatives;
 * read-once is verified by reloading the page, which is unambiguous.)
 *
 * ═══ THREE STATES, NOT TWO ═══
 * `loading` · `done` · `failed`. An EMPTY number on the home page reads as **the
 * network is dead** — the worst thing a testnet page can say about itself, and it says
 * it by saying nothing.
 */
/**
 * 🔴 EACH CELL CAN BE ABSENT ON ITS OWN — `null` means "this cell could not be
 * measured", not 0. (Đ1-8)
 *
 * Before 2026-08-28 the three sources were fetched with `Promise.all`, so **one dead
 * source lost all three numbers**. The case actually observed: `console-chains.json`
 * is a static file the console writes, and it was missing during exactly the window
 * right after a network rebuild — that is, **precisely when the page most needed to
 * say "9/9 validators are alive"** it could say nothing at all.
 *
 * ⚠️ The old comment here defended `Promise.all` on the grounds that *"showing 2 of 3
 * numbers correctly and 1 number MISLEADINGLY is harder to read"*. That reasoning
 * still holds — and this version **does not violate it**: a failed cell shows no stale
 * number and no zero, it says outright "could not measure". What is forbidden is **a
 * wrong number**, not **a cell declaring itself absent**.
 */
export type NetworkNumbers = {
  validatorsTotal: number | null;
  validatorsConnected: number | null;
  l1Count: number | null;
  blockHeight: number | null;
};

export type StatsState =
  | { phase: 'loading' }
  | { phase: 'done'; numbers: NetworkNumbers }
  | { phase: 'failed'; why: string };

async function jsonRpc(url: string, method: string, params: unknown[] = [], timeoutS = READ_TIMEOUT_MS / 1000) {
  // The timeout here is SAFE and required: these are the home page's short READS.
  // (The "no timeout" constraint applies only to `/api/create` and `/api/revoke` —
  // see `lib/net.ts`. No path in this file touches them.)
  const j = await fetchJson<{ result?: unknown; error?: { message?: string } }>(
    url,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    },
    timeoutS,
  );
  if (j.error) throw new NetworkError('http', j.error.message ?? 'RPC error', 200);
  return j.result;
}

export function useNetworkStats(): { state: StatsState; reload: () => void } {
  const [state, setState] = useState<StatsState>({ phase: 'loading' });
  const [round, setRound] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setState({ phase: 'loading' });
      // 🔴 `allSettled`, NOT `all` (Đ1-8). The three sources are independent as facts —
      // the validator count does not depend on whether the L1 directory can be read —
      // so forcing them to live and die together invents a shared point of failure
      // that does not exist. See the comment on `NetworkNumbers` for why this does NOT
      // contradict the older rule "never show a misleading number".
      const [rValidators, rHeight, rDirectory] = await Promise.allSettled([
        jsonRpc(`${rpcOrigin()}/ext/bc/P`, 'platform.getCurrentValidators') as Promise<{
          validators?: { connected?: boolean }[];
        }>,
        jsonRpc(rpcCChain(), 'eth_blockNumber') as Promise<string>,
        // Shared with `ChainTable`, which reads the same file on this same page —
        // see `lib/directory.ts`. Two identical requests left here at the same
        // millisecond until 2026-09-03.
        readDirectory(),
      ]);
      if (cancelled) return;

      const list = rValidators.status === 'fulfilled' ? rValidators.value?.validators ?? [] : null;
      const height = rHeight.status === 'fulfilled' ? Number(rHeight.value) : null;
      const l1Count =
        rDirectory.status === 'fulfilled' && Array.isArray(rDirectory.value?.chains)
          ? rDirectory.value.chains.length
          : null;

      // All three failed ⇒ this is "the network is unreachable", not "one cell is
      // absent". Telling those two cases apart is the interface's job: one line of
      // muted text versus three dashes. Merging them tells the reader the network is
      // dead when it may only be a static file that has not been written yet.
      if (list === null && height === null && l1Count === null) {
        const first = [rValidators, rHeight, rDirectory].find((r) => r.status === 'rejected');
        const err = first && first.status === 'rejected' ? (first.reason as NetworkError | Error) : null;
        setState({ phase: 'failed', why: err?.message ?? 'could not reach the network' });
        return;
      }

      setState({
        phase: 'done',
        numbers: {
          validatorsTotal: list === null ? null : list.length,
          validatorsConnected: list === null ? null : list.filter((v) => v.connected).length,
          l1Count,
          blockHeight: height,
        },
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [round]);

  return { state, reload: () => setRound((n) => n + 1) };
}
