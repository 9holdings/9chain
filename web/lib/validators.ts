'use client';

import { useEffect, useState } from 'react';
import { fetchJson, READ_TIMEOUT_MS } from './net';
import { rpcOrigin } from './chain';

/**
 * The validator set, read from P-Chain when the page loads.
 *
 * ═══ WHY THIS PAGE READS THE NETWORK INSTEAD OF QUOTING THE GUIDE ═══
 * `docs/RUN-A-VALIDATOR.md` states the minimum bond as 81 LOVE9. That number is compiled into
 * the node binary, so it is fixed for the life of THIS network — and it was 25,000 until the
 * hours before genesis. A page that hard-codes it is one re-genesis away from telling a
 * stranger to send the wrong amount of money to a chain, which is the most expensive kind of
 * wrong this site can be. `platform.getMinStake` answers it in one call; there is no reason
 * to retype it.
 *
 * The same argument covers the set size: "nine of eleven run on one machine" is a sentence
 * that goes stale the moment somebody acts on this page — which is the entire point of the
 * page existing.
 */
export type ValidatorSet = {
  total: number;
  connected: number;
  /**
   * How many are staked at exactly the minimum bond. NOT "how many are outsiders" — weight
   * measures money, not provenance, and a founder could bond the minimum tomorrow. The page
   * must not turn a measurement of one thing into a claim about another; see the naming
   * disaster in `lib/stats.ts` where a count of validators was read as a count of machines.
   */
  atMinimumBond: number;
  /** Nano-LOVE9, as the chain reports it. Formatting belongs to the caller. */
  minValidatorStakeNano: string | null;
};

export type ValidatorState =
  | { phase: 'loading' }
  | { phase: 'done'; set: ValidatorSet }
  | { phase: 'failed' };

type ValidatorRecord = { connected?: boolean; weight?: string };

export function useValidatorSet(): ValidatorState {
  const [state, setState] = useState<ValidatorState>({ phase: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const p = `${rpcOrigin()}/ext/bc/P`;
      const goi = (method: string) =>
        fetchJson<{ result?: Record<string, unknown> }>(
          p,
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params: {} }),
          },
          READ_TIMEOUT_MS / 1000,
        );

      // 🔴 `allSettled`, not `all` — the same rule the home page learned the hard way. The
      // minimum bond and the size of the set are independent facts, and one unreadable does
      // not make the other unknown.
      const [rSet, rMin] = await Promise.allSettled([
        goi('platform.getCurrentValidators'),
        goi('platform.getMinStake'),
      ]);
      if (cancelled) return;

      const list =
        rSet.status === 'fulfilled' && Array.isArray(rSet.value?.result?.validators)
          ? (rSet.value.result!.validators as ValidatorRecord[])
          : null;
      const minNano =
        rMin.status === 'fulfilled' && typeof rMin.value?.result?.minValidatorStake === 'string'
          ? (rMin.value.result!.minValidatorStake as string)
          : null;

      if (list === null) {
        setState({ phase: 'failed' });
        return;
      }

      setState({
        phase: 'done',
        set: {
          total: list.length,
          connected: list.filter((v) => v.connected === true).length,
          atMinimumBond: minNano === null ? 0 : list.filter((v) => v.weight === minNano).length,
          minValidatorStakeNano: minNano,
        },
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

/**
 * Nano-LOVE9 → LOVE9, for display only.
 *
 * ⚠️ P-Chain reports stake in nano (9 decimals) while the C-Chain balance a wallet shows is in
 * wei (18). Mixing the two is a factor of a billion, and it is the kind of error that reads as
 * plausible: 81 and 81,000,000,000 both look like "a number the page printed".
 */
export function nanoToLove9(nano: string | null): number | null {
  if (nano === null) return null;
  const n = Number(nano);
  if (!Number.isFinite(n)) return null;
  return n / 1e9;
}

/**
 * How many faucet requests actually fund a bond.
 *
 * 🔴 IT IS NOT `bond / perRequest`, AND THAT IS THE WHOLE POINT. Nine requests of 9 LOVE9
 * come to exactly 81, and exactly 81 is not enough: the C→X→P transfers and the stake
 * submission are paid out of the SAME balance. The honest answer is one request more.
 *
 * Caught on the live page 2026-09-05: the paragraph said "budget ten requests" while the
 * line of arithmetic under it rendered `9 × 9 = 81 ≥ 81` — the page retracting a claim in
 * prose and re-making it in symbols, three centimetres apart. Symbols win that argument
 * with a reader who is skimming to find the number.
 */
export function faucetRequestsNeeded(bondLove9: number | null, perRequest: number | null): number | null {
  if (bondLove9 === null || perRequest === null || !(perRequest > 0)) return null;
  return Math.ceil(bondLove9 / perRequest) + 1;
}
