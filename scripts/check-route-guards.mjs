#!/usr/bin/env node
/**
 * check-route-guards.mjs — every public console route must be rate-limited, and authenticated
 * unless it IS the login.
 *
 * ═══ WHY ═══
 *
 * The console is reachable from the internet and its routes spend permanent resources: one of
 * fifteen chain slots, a chainId that can never be reissued, a rolling restart of nine nodes. A
 * route that forgot its rate limit is not a slow console, it is a stranger able to consume those
 * by repetition. A route that forgot its auth check is worse.
 *
 * Both guards are one line each and both are easy to leave out of a NEW route — which is exactly
 * when nobody is looking, because the new route is the thing being thought about.
 *
 * ═══ 🔴 WHY IT READS BLOCKS AND NOT LINES, AND HOW I LEARNED THAT ═══
 *
 * The first version of this measurement scanned twelve lines after each route and reported
 * `/api/create` as having NEITHER guard. That would have been an alarming security finding, and
 * it was false: `/api/create` calls both, with a long comment block in between explaining why the
 * per-wallet limit is keyed on the wallet rather than the IP. The window was too small, so the
 * measurement described the COMMENT DENSITY of the handler rather than its guards.
 *
 * It was caught by reading the code before reporting it. That is not a method — it is luck. So
 * the gate reads each handler by balancing braces from its `if (req.url === …) {` to the matching
 * `}`, and the whole handler is examined however long it is.
 *
 * Measured 2026-09-08, once it read blocks and whole conditions: 17 routes, every one of them
 * guarded or declared. This gate exists for the eighteenth (D-261).
 *
 * Usage:
 *   node scripts/check-route-guards.mjs
 *   node scripts/check-route-guards.mjs --self-test
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { guardEntry } from "../local-net/lib/cli.mjs";
import { blankComments, lineAt } from "./lib/source-scan.mjs";
import { counter, EXIT } from "./lib/report.mjs";

guardEntry(import.meta.url, ["--self-test", "--list"]);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SERVER = path.join(ROOT, "local-net/console/server.mjs");

/**
 * Routes that legitimately have no authentication, each with the reason.
 *
 * 🔴 The reason is the point. "No auth" is the single most dangerous thing to allow by habit, so
 * each entry has to say why the route cannot require what it is issuing.
 */
export const NO_AUTH = new Map([
  ["/", "the HTML page. It performs no action; every action goes through /api/* and is guarded there."],
  ["/whoami", "a diagnostic that answers with the caller's own IP — it is how an operator confirms the console sees real client IPs rather than Caddy's, which is what makes the rate limits mean anything."],
  ["/api/siwe/nonce", "this IS the login: it hands out the nonce a wallet signs. Requiring auth to start authenticating cannot work."],
  ["/api/siwe/login", "this IS the login: it verifies the signature. Same reason."],
]);

/** Routes that legitimately have no rate limit. */
export const NO_RATE = new Map([
  ["/", "a static page served from memory; it neither spends a resource nor touches the node."],
  ["/whoami", "it reads no state, touches no node and allocates nothing — it answers with the "
    + "caller's OWN IP, which the caller already knows. And it exists to be hit repeatedly: an "
    + "operator compares readings to confirm the console sees real client IPs rather than Caddy's, "
    + "which is the thing that makes every OTHER rate limit meaningful. Rate-limiting the "
    + "diagnostic would get in the way of the diagnosis. 🔴 [human] David: if this is ever wanted "
    + "behind a limit, that is a behaviour change on the deployed console and therefore your call, "
    + "not this session's."],
]);

/**
 * Each `if (… req.url … "/route") { … }` handler, read by balancing braces.
 *
 * Comments are blanked first so a route named in prose is not mistaken for a handler, and so a
 * brace inside a comment cannot end a block early.
 */
export function routeHandlers(source) {
  const src = blankComments(source);
  const out = [];
  // 🔴 ONE HANDLER CAN SERVE SEVERAL ROUTES, and the first version of this could not see that.
  // `/api/create` and `/api/revoke` share a body: `if (… && (req.url === "/api/create" ||
  // req.url === "/api/revoke")) {`. The old pattern anchored on a single `req.url === "…"` with a
  // greedy `[^)]*` in front, so the greed skipped PAST the first route and reported only
  // `/api/revoke`. The guards were read correctly — it is the same body — but `/api/create`, the
  // route that spends a permanent chain slot, was simply absent from the list. A gate that
  // silently omits a route it was written to watch is worse than one that reports it wrong.
  //
  // So: find the condition, then take EVERY route literal inside it.
  const re = /if\s*\(/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const open = src.indexOf("{", m.index);
    if (open === -1) continue;
    const condition = src.slice(m.index, open);
    if (!/req\.url/.test(condition)) continue;
    // 🔴 Only a comparison AGAINST `req.url` names a route. `endsWith` does not: inside the
    // already-guarded `/api/maintenance` handler there is `if (req.url.endsWith("/pause"))`, and
    // taking every quoted path out of the condition reported `/pause` as an unguarded top-level
    // route. It is a sub-dispatch within a guarded block — a false red, and a false red on a
    // SECURITY gate is how the gate stops being believed.
    const routes = [...condition.matchAll(
      /req\.url(?:\.split\("\?"\)\[0\])?\s*(?:===\s*|\.startsWith\(\s*)"(\/[^"]*)"/g)].map((r) => r[1]);
    if (!routes.length) continue;
    let depth = 0;
    let quote = null;
    let end = -1;
    for (let i = open; i < src.length; i += 1) {
      const c = src[i];
      if (quote) {
        if (c === "\\") { i += 1; continue; }
        if (c === quote) quote = null;
        continue;
      }
      if (c === '"' || c === "'" || c === "`") { quote = c; continue; }
      if (c === "{") depth += 1;
      else if (c === "}") { depth -= 1; if (depth === 0) { end = i; break; } }
    }
    if (end === -1) continue;
    const line = lineAt(src, m.index);
    const body = src.slice(open, end + 1);
    for (const route of routes) out.push({ route, line, body });
  }
  return out;
}

/** What guards a handler body actually calls. */
export function guardsOf(body) {
  return {
    rate: /\bblockedByRate\s*\(/.test(body),
    auth: /\bblockedByAuth\s*\(|\bidentify\s*\(|\bcheckToken\s*\(/.test(body),
  };
}

function main() {
  const handlers = routeHandlers(readFileSync(SERVER, "utf8"));
  // A prefix route can appear twice (GET and POST); judge each occurrence, report by route.
  const byRoute = new Map();
  for (const h of handlers) {
    const g = guardsOf(h.body);
    const prev = byRoute.get(h.route);
    // If ANY occurrence lacks a guard, that occurrence is the finding — do not let a guarded
    // sibling cover for it.
    byRoute.set(h.route, prev
      ? { ...prev, rate: prev.rate && g.rate, auth: prev.auth && g.auth }
      : { line: h.line, ...g });
  }

  console.log("══ ROUTE GUARDS — rate limit and authentication on every public route ══\n");
  if (process.argv.includes("--list")) {
    for (const [route, g] of byRoute) console.log(`${g.rate ? "rate" : "----"} ${g.auth ? "auth" : "----"}  ${route}`);
    return EXIT.PASS;
  }

  const findings = [];
  for (const [route, g] of byRoute) {
    if (!g.rate && !NO_RATE.has(route)) findings.push({ route, line: g.line, missing: "rate limit" });
    if (!g.auth && !NO_AUTH.has(route)) findings.push({ route, line: g.line, missing: "authentication" });
  }

  console.log(`  ${byRoute.size} route(s) served\n`);
  if (findings.length) {
    for (const f of findings) {
      console.log(`  🔴 ${f.route} (server.mjs:${f.line}) has no ${f.missing}`);
    }
    console.log(`\n🔴 ${findings.length} missing guard(s).`);
    console.log("   These routes spend permanent resources: one of the chain slots, a chainId that");
    console.log("   can never be reissued, a rolling restart of nine nodes. A route without a rate");
    console.log("   limit is not a slow console — it is a stranger consuming those by repetition.");
    console.log("   If a route genuinely needs no guard, declare it in NO_RATE / NO_AUTH WITH A");
    console.log("   REASON; an undeclared gap and a deliberate one must not look the same (D-261).");
    return EXIT.RED;
  }

  for (const [route, why] of NO_AUTH) console.log(`  ⚪ ${route} — no auth by design\n       ${why}`);
  console.log(`\n✅ PASS — every route is rate-limited and authenticated, outside ${NO_AUTH.size} declared exemption(s).`);
  return EXIT.PASS;
}

/* ─────────────────────────── counter-check (--self-test) ─────────────────────────── */

function selfTest() {
  const { ok, finish } = counter("COUNTER-CHECK — route guards");

  const handler = (route, body) => `if (req.method === "POST" && req.url === "${route}") {\n${body}\n}`;

  ok("a handler is found with its route and line",
    routeHandlers(`\n\n${handler("/api/x", "  doThing();")}`).at(0).route === "/api/x");
  ok("a startsWith route is found too",
    routeHandlers('if (req.url.startsWith("/api/chains/")) { x(); }').at(0).route === "/api/chains/");

  ok("🔴 the WHOLE handler is read, however long — this is the bug the first version had", (() => {
    // 40 lines of comment between the route and its guard: the line-window version reported
    // /api/create as having NO guards at all, which would have been a false security finding.
    const filler = Array.from({ length: 40 }, (_, i) => `  // explanation line ${i}`).join("\n");
    const found = routeHandlers(handler("/api/create", `${filler}\n  if (blockedByRate(req, res, l)) return;\n  const ai = blockedByAuth(req, res);`));
    const g = guardsOf(found[0].body);
    return g.rate === true && g.auth === true;
  })(), "a twelve-line window measured the COMMENT DENSITY of a handler, not its guards");

  ok("a nested block does not end the handler early", (() => {
    const found = routeHandlers(handler("/api/y", "  if (a) { b(); }\n  blockedByRate(req, res, l);"));
    return guardsOf(found[0].body).rate === true;
  })());
  ok("a brace inside a string does not end it either", (() => {
    const found = routeHandlers(handler("/api/z", '  send(res, 200, "{ not a block }");\n  blockedByAuth(req, res);'));
    return guardsOf(found[0].body).auth === true;
  })());
  ok("🔴 an endsWith sub-dispatch is NOT a top-level route", (() => {
    const src = [
      'if (req.url === "/api/maintenance") {',
      "  blockedByRate(req, res, l); blockedByAuth(req, res);",
      '  if (req.url.endsWith("/pause")) return pause();',
      "}",
    ].join("\n");
    return routeHandlers(src).map((h) => h.route).join() === "/api/maintenance";
  })(), "it lives inside an already-guarded block; reporting it was a false red on a SECURITY gate");
  ok("a split-on-query route is still a route",
    routeHandlers('if (req.url.split("?")[0] === "/api/q") { blockedByRate(req, res, l); }').at(0).route === "/api/q");

  ok("🔴 a route mentioned only in a COMMENT is not a handler",
    routeHandlers('// see the handler for "/api/ghost" further down\nconst x = 1;').length === 0);

  ok("a handler with neither guard is seen as having neither",
    JSON.stringify(guardsOf("  doThing();")) === JSON.stringify({ rate: false, auth: false }));
  ok("checkToken counts as authentication — some routes check the operator token directly",
    guardsOf("if (!checkToken(req)) return;").auth === true);

  ok("every declared exemption carries a reason",
    [...NO_AUTH.values(), ...NO_RATE.values()].every((why) => why.length > 40));
  ok("🔴 the login routes are exempt from AUTH but NOT from rate limiting",
    NO_AUTH.has("/api/siwe/login") && !NO_RATE.has("/api/siwe/login"),
    "an unlimited login endpoint is how a signature check becomes a way to spend the CPU of the box");

  // The real file is the last case.
  const real = routeHandlers(readFileSync(SERVER, "utf8"));
  ok(`the real console is read (${new Set(real.map((h) => h.route)).size} routes)`,
    new Set(real.map((h) => h.route)).size >= 15);
  ok("and /api/create is seen as guarded — the case that started this file", (() => {
    const create = real.find((h) => h.route === "/api/create");
    const g = create ? guardsOf(create.body) : { rate: false, auth: false };
    return g.rate && g.auth;
  })());

  return finish("a handler is a block, not twelve lines, and an exemption always says why");
}

process.exitCode = process.argv.includes("--self-test") ? selfTest() : main();
