'use client';

import { fetchJson, READ_TIMEOUT_MS } from './net';

/**
 * One read of the L1 directory (`console-chains.json`) shared by every caller.
 *
 * ═══ WHY THIS EXISTS ═══
 * The home page needs the same file twice: `useNetworkStats` counts the chains for the
 * "L1s running" tile, and `ChainTable` lists them. Both fetched it independently, so
 * every home page load sent the request twice, at the same moment, to the same URL.
 * Measured on the live site 2026-09-03: two `console-chains.json` requests starting
 * 1 ms apart and both taking ~625 ms. The browser's HTTP cache does not collapse them
 * — they are in flight together, so neither has an entry to hit yet.
 *
 * 🔴 THIS DEDUPES, IT DOES NOT CACHE ACROSS TIME.
 * `inFlight` holds the promise only while a request is actually open, and it is cleared
 * the moment that request settles. A directory that is one page-load old is a directory
 * that can be wrong — a chain launched in the meantime would be missing, and `ChainTable`
 * has an explicit "try again" path whose whole point is to go ask again. A cache with a
 * lifetime would silently break that button, which is the more expensive failure.
 */
export type ChainRecord = {
  name: string;
  chainId: number;
  admin?: string;
  presetName?: string;
  presetTen?: string;
  /**
   * Fields the directory page needs and `ChainTable` does not. Optional because a
   * record written before the console emitted them simply lacks the key — a MISSING
   * key here is a valid state, not an error, and the reading code must never let
   * `undefined` reach the screen. Same rule the `admin`/`presetName` keys already
   * follow; see the comment in `app/ChainTable.tsx`.
   */
  subnetID?: string | null;
  blockchainID?: string;
  createdAt?: string;
  /** Written by the console when a chain is revoked. `thuHoiLuc` is the pre-2026-08-26 name. */
  revokedAt?: string;
  thuHoiLuc?: string;
};

let inFlight: Promise<{ chains?: ChainRecord[] }> | null = null;

export function readDirectory(): Promise<{ chains?: ChainRecord[] }> {
  if (inFlight) return inFlight;
  // Timeout is deliberate and matches what both callers passed before: this is a short
  // read of a static file, and without a limit a hung connection leaves the table on
  // skeletons forever with nothing for the reader to press.
  const p = fetchJson<{ chains?: ChainRecord[] }>('/chains/data/console-chains.json', {}, READ_TIMEOUT_MS / 1000);
  inFlight = p;
  // 🔴 Clear on BOTH outcomes, and clear via a detached `finally` so the rejection
  // still reaches every caller. Clearing only on success would pin a failed promise
  // forever, and every later "try again" would re-deliver the same old error without
  // touching the network — a retry button that cannot retry.
  p.finally(() => {
    if (inFlight === p) inFlight = null;
  }).catch(() => {});
  return p;
}
