/**
 * http.mjs — every outbound request in this repo carries a deadline, declared in one place.
 *
 * ═══ WHY ═══
 *
 * Measured 2026-09-08 (D-244): 28 of the 64 `await fetch(...)` sites in `scripts/` and
 * `local-net/` had no `signal`. A fetch with no deadline does NOT make a gate go red — it makes
 * the gate never answer, and a gate that never answers is read as "the machine is slow", not as
 * "this was not measured". CLAUDE.md section 2's whole subject is verdicts about the wrong thing;
 * a missing verdict is the version of that with no line to re-read at all.
 *
 * Node's own behaviour is the trap. `fetch` inherits undici's defaults: a headers timeout, and
 * NOTHING bounding a body that trickles or a connection that is accepted and then goes quiet.
 * A server that accepts the socket and never writes holds the caller until someone notices.
 *
 * ═══ WHAT TO USE ═══
 *
 *   requestRpc()        `local-net/lib/rpc-client.mjs` — JSON-RPC with a deadline AND a body
 *                       bound. 🔴 PREFER IT for anything speaking JSON-RPC: it also validates the
 *                       envelope, and duplicating that here would be a second declaration of one
 *                       rule (CLAUDE.md section 6).
 *   inspectionRpc()     `local-net/lib/inspection-rpc.mjs` — the read-only operator path.
 *   fetchWithDeadline() this file — everything else: plain GETs, console REST routes, and the
 *                       POSTs whose error handling is bespoke enough that moving them onto
 *                       requestRpc would change what their callers see.
 *
 * ═══ WHY IT THROWS A NAMED ERROR ═══
 *
 * `AbortSignal.timeout` rejects with a bare `TimeoutError` that names nothing. Handed to a
 * caller whose catch prints `error.message`, that reads as an unexplained failure. The error
 * raised here names the URL and the budget, so the line in the log answers "which call, and how
 * long did we actually wait" without anyone opening the source.
 */

/**
 * 15 s. Chosen against measured numbers, not picked round:
 *   - `check-robots.mjs` already used 15 s for the same kind of call through Cloudflare.
 *   - `requestRpc` uses 10 s for a local node; anything crossing Cloudflare needs more headroom,
 *     and 2026-08-27 measurements had the CDN adding a few hundred ms, not seconds.
 *   - Long operations do NOT belong under this default: creating a chain takes ~170 s and
 *     Cloudflare cuts a POST at ~100 s anyway (see the memory "long operations through
 *     Cloudflare"). Those callers pass their own budget, deliberately.
 */
export const DEFAULT_TIMEOUT_MS = 15_000;

/** Raised when the deadline fires. Distinct class so a caller can tell it from a real HTTP error. */
export class RequestTimeoutError extends Error {
  constructor(url, timeoutMs) {
    super(`request to ${url} did not answer within ${timeoutMs}ms — nothing was measured`);
    this.name = "RequestTimeoutError";
    this.url = String(url);
    this.timeoutMs = timeoutMs;
    /** Callers that retry should look at this rather than string-matching the message. */
    this.retryable = true;
  }
}

/**
 * `fetch` with a deadline covering connect, headers AND body.
 *
 * `timeoutMs` may be passed inside `init` or as the third argument; the third argument wins, so
 * a call site can add a budget without unpacking someone else's options object.
 *
 * ═══ 🔴 THE DEFAULT DOES NOT APPLY WHEN THE CALLER BROUGHT ITS OWN SIGNAL ═══
 *
 * A caller that passes `signal` has already declared its cancellation policy, and in this repo
 * those policies are deliberately LONG: `create-rpc-e2e-test.mjs:342` waits 110 000 ms because
 * a rolling restart of nine nodes takes ~355 s, and `warp-common.mjs` waits 20 000. Layering a
 * 15 s default on top of those would abort them early — and it would do it by *timing out*,
 * which reads as "the console is slow" rather than "the caller's budget was overridden by a
 * helper". Adding a deadline must never SHORTEN one that was already chosen on purpose.
 *
 * So: caller signal and no explicit `timeoutMs` ⇒ the caller's signal alone. Pass `timeoutMs`
 * explicitly to combine the two, and then the shorter one wins, as asked for.
 */
export async function fetchWithDeadline(url, init = {}, timeoutMs) {
  const { timeoutMs: fromInit, signal: callerSignal, ...rest } = init;
  const asked = timeoutMs ?? fromInit;

  if (callerSignal && asked === undefined) {
    // The caller's own policy, untouched. Nothing here to relabel, so errors pass through as-is.
    return fetch(url, { ...rest, signal: callerSignal });
  }

  const budget = asked ?? DEFAULT_TIMEOUT_MS;
  if (!Number.isSafeInteger(budget) || budget < 1) {
    throw new RangeError(`timeout must be a positive whole number of milliseconds (got ${budget})`);
  }

  const deadline = AbortSignal.timeout(budget);
  const signal = callerSignal ? AbortSignal.any([callerSignal, deadline]) : deadline;

  try {
    return await fetch(url, { ...rest, signal });
  } catch (error) {
    // Only the deadline turns into RequestTimeoutError. A caller's own abort stays the caller's
    // abort: relabelling it "timed out" would report a wait that never happened.
    if (deadline.aborted && !callerSignal?.aborted) throw new RequestTimeoutError(url, budget);
    throw error;
  }
}

/**
 * `fetchWithDeadline` plus "the body has to actually be JSON".
 *
 * 🔴 Returns the parsed body AND the response, because CLAUDE.md's first hard rule is that an
 * HTTP code proves nothing: callers here routinely need the status, the content type and the
 * body to decide anything. Handing back only the parsed object would push every caller into
 * trusting the code again.
 *
 * A body that does not parse raises an error carrying the first 200 characters. That matters
 * more than it looks: the failure this repo keeps meeting is a CDN error page or a bot wall
 * arriving with HTTP 200, and a bare "invalid JSON" sends the reader looking in the wrong place.
 */
export async function fetchJson(url, init = {}, timeoutMs) {
  const response = await fetchWithDeadline(url, init, timeoutMs);
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); }
  catch {
    const snippet = text.slice(0, 200).replace(/\s+/g, " ").trim();
    const error = new Error(
      `${url} answered HTTP ${response.status} with something that is not JSON: ${JSON.stringify(snippet)}`);
    error.name = "NotJsonError";
    error.status = response.status;
    error.contentType = response.headers.get("content-type");
    throw error;
  }
  return { response, body, text };
}
