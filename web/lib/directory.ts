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
  /** The preset id (`standard`…). Written since 2026-08-26; display uses `presetName`. */
  preset?: string;
  /**
   * The owner's ticker for the L1's native token (P-54). Only present when the owner chose
   * one — readers apply the fallback in `lib/l1-symbol.ts` for records without it.
   */
  symbol?: string;
  /** The public RPC URL the console recorded. Newer records only. */
  rpc?: string;
  /**
   * Fields the directory page needs and `ChainTable` does not. Optional because a
   * record written before the console emitted them simply lacks the key — a MISSING
   * key here is a valid state, not an error, and the reading code must never let
   * `undefined` reach the screen. Same rule the `admin`/`presetName` keys already
   * follow; see the comment in `app/ChainTable.tsx`.
   */
  subnetID?: string | null;
  blockchainID?: string;
  /** ISO string OR epoch milliseconds — the console has written both shapes. `new Date()` reads either. */
  createdAt?: string | number;
  /** Written by the console when a chain is revoked. `thuHoiLuc` is the pre-2026-08-26 name. */
  revokedAt?: string | number;
  thuHoiLuc?: string | number;
};

/**
 * The file's shape. `retired` is an ADDED key — files written before it existed do not
 * have it, and its absence is a valid state ("nothing revoked yet"), not an error.
 *
 * ⚠️ FORWARD-COMPATIBLE BY CONSTRUCTION. The 108-L1 plan (`docs/PLAN-108-L1-LOAD-TEST.md`
 * §4) has the console assigning each chain to a subset of nodes and recording which
 * node serves its RPC; the sovereign-L1 proposal adds nursery/dormant states. Those
 * keys will land in THIS file first. Readers must therefore tolerate keys they do not
 * know, and treat every key they do know as optional — which is what this type says.
 */
export type DirectoryFile = { chains?: ChainRecord[]; retired?: ChainRecord[] };

let inFlight: Promise<DirectoryFile> | null = null;

export function readDirectory(): Promise<DirectoryFile> {
  if (inFlight) return inFlight;
  // Timeout is deliberate and matches what both callers passed before: this is a short
  // read of a static file, and without a limit a hung connection leaves the table on
  // skeletons forever with nothing for the reader to press.
  const p = fetchJson<DirectoryFile>('/chains/data/console-chains.json', {}, READ_TIMEOUT_MS / 1000);
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
