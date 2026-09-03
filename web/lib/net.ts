'use client';

import { interpolate } from '@/lib/i18n';

/**
 * The safety net for every SHORT network call on the site. (Đ1-8)
 *
 * ═══ 🔴 CONSTRAINT NUMBER ONE, READ BEFORE USING THIS ANYWHERE ELSE ═══
 * **Do NOT set a timeout on `/api/create` or `/api/revoke`.**
 * Those two operations genuinely take ~170–300 seconds (the nodes restart ONE AT A TIME so the
 * network never loses quorum). An `AbortSignal.timeout` there **cancels the browser's request
 * while the server is still launching the chain** — the user sees an "error", the chain is
 * created anyway, and they go and press the button again. That is the most expensive failure
 * this screen can have.
 * ⇒ So `fetchJson` has **NO timeout by default**. A timeout is something you must **switch on**,
 *   not something you must remember to switch off. That direction is deliberate: forgetting to
 *   switch it on costs at worst the slowness we have today; forgetting to switch it off breaks
 *   a path that cannot be repaired.
 *
 * ═══ WHY THIS IS NOT JUST `try/catch` ═══
 * These three failures look identical if all you do is `catch`:
 *   • **timeout**        — slow or hung network. Retrying usually works.
 *   • **HTTP 4xx/5xx**   — the server ANSWERED, and the answer was "no". Retrying is pointless.
 *   • **not JSON**       — usually **misrouting**: the request fell through to Blockscout at the
 *     root `/` and we got HTML back. This is an infrastructure fault, not a data fault, and if
 *     we do not say so, whoever fixes it goes looking in a place where nothing is wrong.
 * Collapsing all three into one "could not load" throws away the most valuable information the
 * failure just produced.
 *
 * ⚠️ `r.ok` MUST be checked. `fetch` does **not** throw on HTTP 404/500 — it only throws when
 * the network drops. Skipping `r.ok` lets an error page travel on into `JSON.parse` and fail
 * somewhere entirely unrelated.
 */

/** The default limit for a short READ (stats, directory, faucet quota). */
export const READ_TIMEOUT_MS = 12_000;

export type FailureKind = 'timeout' | 'http' | 'notJson' | 'offline';

export class NetworkError extends Error {
  readonly kind: FailureKind;
  readonly status: number;
  /** Seconds already waited; only meaningful when `kind === 'timeout'` — the render site needs it to build the sentence. */
  readonly timeoutSeconds: number;
  /**
   * ⚠️ `message` is text FOR DEVELOPERS (console, logs). It must **not** be put straight on the
   * screen: this file holds pure functions and cannot call `useT()`, so every sentence it builds
   * itself is frozen in one language. The previous version kept three Vietnamese sentences here
   * and two render sites spliced them into `{detail}` — meaning readers in all thirty languages
   * got Vietnamese exactly when the network was slow. Use `describeFailure()` at the end of this file.
   */
  constructor(kind: FailureKind, message: string, status = 0, timeoutSeconds = 0) {
    super(message);
    this.name = 'NetworkError';
    this.kind = kind;
    this.status = status;
    this.timeoutSeconds = timeoutSeconds;
  }
  /** The server answered and the answer was "no" ⇒ retrying is pointless. */
  get retryPointless(): boolean {
    return this.kind === 'http' && this.status >= 400 && this.status < 500;
  }
}

/**
 * Read JSON from a URL, with the failure classified.
 *
 * @param hanGiay  Timeout in **seconds**. Omitted = **NO timeout** (see constraint number one
 *                 at the top of this file). Pass `READ_TIMEOUT_MS / 1000` for short reads.
 */
export async function fetchJson<T = unknown>(
  url: string,
  init: RequestInit = {},
  hanGiay?: number,
): Promise<T> {
  let r: Response;
  try {
    r = await fetch(url, {
      cache: 'no-store',
      ...init,
      // `AbortSignal.timeout` ONLY when explicitly asked for.
      ...(hanGiay ? { signal: AbortSignal.timeout(hanGiay * 1000) } : {}),
    });
  } catch (e) {
    // `AbortSignal.timeout` throws `TimeoutError`; a dropped network throws `TypeError`.
    const ten = (e as Error)?.name;
    if (ten === 'TimeoutError' || ten === 'AbortError') {
      throw new NetworkError('timeout', `no answer after ${hanGiay}s`, 0, hanGiay);
    }
    throw new NetworkError('offline', (e as Error)?.message ?? 'request failed');
  }

  const t = await r.text();
  let j: unknown;
  try {
    j = JSON.parse(t);
  } catch {
    // Say plainly that this is a ROUTING suspicion, with the HTTP status so it can be told apart from a real error.
    throw new NetworkError(
      'notJson',
      `answer was not JSON (HTTP ${r.status}) — most likely the path resolved wrongly`,
      r.status,
    );
  }
  if (!r.ok) {
    const failure = (j as { error?: string })?.error;
    throw new NetworkError('http', failure || `HTTP ${r.status}`, r.status);
  }
  return j as T;
}

/**
 * Turn a failure into a sentence THE READER understands, in the language they chose.
 *
 * The three failure kinds at the top of this file are only useful if the reader can tell them
 * apart — so anywhere a network error is shown to a user, call this instead of splicing in
 * `e.message`. Kinds without their own sentence (`http`, `offline`) fall back to the technical
 * message: it is not pretty, but it is something they can paste to the team, and silence is worse.
 */
export function describeFailure(e: unknown, t: { timeout: string; notJson: string }): string {
  // Match on SHAPE, not on class: `ConsoleError` in `lib/wallet.ts` carries exactly these three
  // fields and needs translating too. Binding to `instanceof NetworkError` would let half the
  // paths reach the screen untranslated.
  const x = e as Partial<NetworkError>;
  if (typeof x?.kind === 'string') {
    if (x.kind === 'timeout') return interpolate(t.timeout, { seconds: String(x.timeoutSeconds ?? 0) });
    if (x.kind === 'notJson') return interpolate(t.notJson, { status: String(x.status ?? 0) });
  }
  return e instanceof Error ? e.message : String(e);
}
