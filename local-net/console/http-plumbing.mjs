/**
 * http-plumbing.mjs — the five things every console route does before it does anything.
 *
 * Lifted out of `console/server.mjs` on 2026-09-08 (D-254, P-106 step 4). Behaviour unchanged;
 * what is new is that each of these can be exercised without starting a console, so the reasons
 * written into them are now held shut by cases instead of by comments alone.
 *
 * ═══ 🔴 WHAT WAS DELIBERATELY NOT RENAMED ═══
 *
 * The identity object still uses `{ kieu, diaChi }` with the values `"vanHanh"` and `"vi"`.
 * Those are NOT internal to this file: `local-net/lib/l1-allowlist.mjs` reads them
 * (`ai.kieu === "vanHanh"`, `ai.diaChi`) and so do its counter-checks, the auth suite and the
 * governance suite. That makes them a CONTRACT BETWEEN MODULES, and renaming a contract is a
 * different operation from renaming a local variable — it has to move every reader in one step,
 * with its own red case, or it silently splits the check that decides who may spend a permanent
 * chain slot.
 *
 * It is section 0 debt and it is written down as such (P-107), not quietly left behind. Everything
 * this module owns outright is English.
 */

/**
 * Reply with JSON, unless the socket is already gone.
 *
 * 🔴 The guard is not defensive noise. A body over the limit calls `req.destroy()`, and writing
 * to that socket afterwards throws from a layer that has no idea what happened — turning a junk
 * request into an unexplained stack trace.
 */
export function sendJson(res, code, body) {
  if (res.writableEnded || res.destroyed) return;
  res.writeHead(code, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

/**
 * Read a JSON body, refusing an enormous one BEFORE parsing it.
 *
 * 🔴 The limit is enforced while the bytes arrive, not after. Buffering an unbounded body and
 * then deciding it was too large is how a public endpoint runs a machine out of memory: by then
 * the memory has already been spent. The socket is destroyed at the moment the limit is passed.
 */
export function readJsonBody(req, limit = 256 * 1024) {
  return new Promise((resolve, reject) => {
    let body = "";
    let over = false;
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > limit && !over) {
        over = true;
        req.destroy();
        reject(new Error(`body exceeds ${limit} bytes`));
      }
    });
    req.on("end", () => { if (!over) resolve(body); });
    req.on("error", (error) => { if (!over) reject(error); });
  });
}

/**
 * The three request-scoped helpers, bound to this console's identity sources.
 *
 * `checkToken` and `walletSession` are injected rather than imported so the whole set can be
 * driven with fakes: the operator token and the wallet store are exactly the two things a test
 * must not need to be real.
 */
export function createHttpPlumbing({ trustProxy, clientIp, checkToken, walletSession }) {
  if (typeof clientIp !== "function" || typeof checkToken !== "function" || !walletSession) {
    throw new Error("createHttpPlumbing needs clientIp, checkToken and walletSession");
  }

  /**
   * Refuse when over the rate limit. Returns true when it has ALREADY answered — the caller stops.
   *
   * `key` allows counting by something other than IP, and for a signed-in wallet that matters:
   * the WALLET ADDRESS is the real identity, while an IP is simultaneously too broad and too
   * narrow. Too broad because a whole office or mobile carrier shares one, so strangers throttle
   * each other; too narrow because changing IP is cheap, so anyone deliberately working around
   * the limit simply does.
   */
  const blockedByRate = (req, res, limiter, key = null) => {
    const verdict = limiter(key || clientIp(req, trustProxy));
    if (verdict.ok) return false;
    res.writeHead(429, { "content-type": "application/json", "retry-after": String(verdict.retryAfter) });
    res.end(JSON.stringify({ error: `rate limit exceeded (${verdict.name}), try again in ${verdict.retryAfter}s` }));
    return true;
  };

  /**
   * Who is calling? `{ kieu: "vanHanh" }` · `{ kieu: "vi", diaChi }` · or `null`.
   *
   * Both paths arrive through the SAME `Authorization: Bearer` header. The operator token is
   * tried first because it is a single comparison; a wallet session has to walk a store and costs
   * more. (See the header for why these field names are still Vietnamese.)
   */
  const identify = (req) => {
    if (checkToken(req)) return { kieu: "vanHanh" };
    const address = walletSession.diaChiCuaPhien(req);
    return address ? { kieu: "vi", diaChi: address } : null;
  };

  /** Refuse when unauthenticated. Returns `null` when it has ALREADY answered — the caller stops. */
  const blockedByAuth = (req, res) => {
    const who = identify(req);
    if (who) return who;
    // 401 with WWW-Authenticate, so a client is told HOW to send credentials rather than just
    // that it failed.
    res.writeHead(401, { "content-type": "application/json", "www-authenticate": "Bearer" });
    res.end(JSON.stringify({
      error: "not authenticated — use the operator token (Authorization: Bearer <A1_CONSOLE_TOKEN>) "
        + "or sign in with a wallet via /api/siwe/nonce then /api/siwe/login",
    }));
    return null;
  };

  return { blockedByRate, identify, blockedByAuth };
}
