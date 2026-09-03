'use client';

import { useEffect, useState } from 'react';
import { fetchJson, READ_TIMEOUT_MS } from './net';

/**
 * Status of the disclosed synthetic load test, published by `heartbeat-pump.mjs`.
 *
 * ═══ WHY THE SITE READS THIS FROM A FILE AND NOT FROM THE CHAIN ═══
 * The interesting number is "how much of this traffic is ours", and the chain cannot
 * answer that — an RPC endpoint will happily report nine transactions per second
 * without ever saying who made them or why. Only the process generating them knows,
 * so that process publishes what it knows and the page repeats it.
 *
 * That also fixes where the truth lives: if the pump stops, the file stops saying
 * `running: true`, and every banner on the site disappears with it. The site cannot
 * advertise a load test that is not happening, because it has nothing else to read.
 *
 * ═══ THE ADDRESSES ARE PART OF THE PAYLOAD, NOT DECORATION ═══
 * `senderAddresses` is what makes the claim checkable by a stranger: they can filter
 * those addresses out in any explorer and see what is left. A future change that
 * keeps the numbers but drops the addresses would remove the only part a reader can
 * verify without trusting us.
 */
export type LoadTestStatus = {
  synthetic: boolean;
  label: string;
  senderAddresses: string[];
  running: boolean;
  stopReason: string | null;
  startedAt: string;
  updatedAt: string;
  uptimeSeconds: number;
  targetTps: number;
  measured: {
    blockHeight: number | null;
    committedTps: number | null;
    secondsPerBlock: number | null;
    committedTxSinceStart: number | null;
  };
};

export type LoadTestState =
  | { pha: 'dangTai' }
  | { pha: 'xong'; tt: LoadTestStatus }
  | { pha: 'hong'; viSao: string };

const DUONG = '/chains/data/heartbeat.json';

/**
 * How stale a reading may be before the page stops calling it live.
 *
 * The pump rewrites the file every five seconds. If it is killed, the file simply
 * stops changing — nothing marks it dead. Without this check the page would keep
 * showing yesterday's nine transactions per second under the word "now", which is
 * the exact failure this project has hit before with a cached green status: a
 * gauge that cannot go red is not a gauge.
 */
const CU_QUA_MS = 60_000;

function docDuoc(j: unknown): LoadTestStatus | null {
  if (!j || typeof j !== 'object') return null;
  const d = j as Record<string, unknown>;
  if (d.synthetic !== true) return null; // never render an undeclared feed as ours
  const m = (d.measured ?? {}) as Record<string, unknown>;
  const so = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  return {
    synthetic: true,
    label: String(d.label ?? ''),
    senderAddresses: Array.isArray(d.senderAddresses) ? d.senderAddresses.map(String) : [],
    running: d.running === true,
    stopReason: typeof d.stopReason === 'string' ? d.stopReason : null,
    startedAt: String(d.startedAt ?? ''),
    updatedAt: String(d.updatedAt ?? ''),
    uptimeSeconds: so(d.uptimeSeconds) ?? 0,
    targetTps: so(d.targetTps) ?? 0,
    measured: {
      blockHeight: so(m.blockHeight),
      committedTps: so(m.committedTps),
      secondsPerBlock: so(m.secondsPerBlock),
      committedTxSinceStart: so(m.committedTxSinceStart),
    },
  };
}

/** A reading counts as live only if the pump says so AND the file is recent. */
export function isRunning(tt: LoadTestStatus, bayGio = Date.now()): boolean {
  if (!tt.running) return false;
  const luc = Date.parse(tt.updatedAt);
  if (Number.isNaN(luc)) return false;
  return bayGio - luc <= CU_QUA_MS;
}

/**
 * @param nhipMs poll interval; `0` reads once.
 *
 * The home page banner reads once — it is a banner, and a page nobody stays on for
 * more than a few seconds does not need a request every five. `/live` is a status
 * page whose whole purpose is a number that moves, so it polls.
 */
export function useLoadTest(nhipMs = 0): LoadTestState {
  const [tt, datTt] = useState<LoadTestState>({ pha: 'dangTai' });

  useEffect(() => {
    let huy = false;
    let hen: ReturnType<typeof setTimeout> | undefined;

    async function doc() {
      try {
        const j = await fetchJson<unknown>(DUONG, {}, READ_TIMEOUT_MS / 1000);
        if (huy) return;
        const d = docDuoc(j);
        datTt(d ? { pha: 'xong', tt: d } : { pha: 'hong', viSao: 'unexpected status format' });
      } catch (e) {
        if (huy) return;
        datTt({ pha: 'hong', viSao: e instanceof Error ? e.message : 'could not read status' });
      } finally {
        // Chain the next read from the end of this one rather than on an interval:
        // an interval on a slow network stacks requests on top of each other, and a
        // hidden tab throttles them into a burst when it comes back.
        if (!huy && nhipMs > 0) hen = setTimeout(doc, nhipMs);
      }
    }

    doc();
    return () => {
      huy = true;
      if (hen) clearTimeout(hen);
    };
  }, [nhipMs]);

  return tt;
}
