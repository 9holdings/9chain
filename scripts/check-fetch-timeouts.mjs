#!/usr/bin/env node
/**
 * check-fetch-timeouts.mjs — no outbound request may be made without a deadline.
 *
 * ═══ WHY ═══
 *
 * A `fetch` with no `signal` does not make a gate go red. It makes the gate never answer, and a
 * run that never answers is read as "the machine is slow" rather than "this was not measured".
 * Node's `fetch` bounds the response HEADERS and nothing else: a server that accepts the socket
 * and then goes quiet holds the caller until a person notices.
 *
 * ═══ 🔴 HOW THE FIRST COUNT WAS WRONG, AND WHY THE SCANNER LOOKS LIKE THIS ═══
 *
 * The first measurement of this (2026-09-08) grepped three lines after each `await fetch(` and
 * reported 28 offenders. Two of them — `local-net/deploy/console-maintenance.mjs` and
 * `local-net/faucet/smoke-l1.mjs` — already had a deadline; their `signal:` simply sat on the
 * FOURTH line, because the option objects are long. A window measured the formatting, not the
 * property. This scanner reads the whole call by balancing parentheses, so line breaks and
 * option order cannot change the answer.
 *
 * That is the same lesson as the `check-budget` history in the web tree: a regex over source
 * answers a question about the source's SHAPE, and the question here is about its MEANING.
 *
 * ═══ WHAT COUNTS AS COMPLIANT ═══
 *
 *   fetchWithDeadline() / fetchJson()   local-net/lib/http.mjs — deadline built in
 *   requestRpc()                        local-net/lib/rpc-client.mjs — deadline AND body bound
 *   inspectionRpc()                     local-net/lib/inspection-rpc.mjs
 *   a bare fetch(...) whose call text carries `signal`
 *
 * Usage:
 *   node scripts/check-fetch-timeouts.mjs
 *   node scripts/check-fetch-timeouts.mjs --self-test
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { guardEntry } from "../local-net/lib/cli.mjs";

// 🔴 A flag this gate does not know is exit 2 — "could not run", never a verdict (D-244).
guardEntry(import.meta.url, ["--self-test", "--list"]);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOTS = ["scripts", "local-net"];
const SKIP_DIRS = new Set(["node_modules", "net", "out", "data", ".git"]);

/**
 * Call sites that are bare on purpose. Each needs a REASON, not just a path: an exemption list
 * without reasons becomes a place to put anything inconvenient.
 */
export const EXEMPT = new Map([
  ["local-net/lib/rpc-client-test.mjs", "the control case: it proves a BARE fetch against the same fixture behaves differently from requestRpc. Giving it a deadline would delete the comparison."],
  ["local-net/lib/http-test.mjs", "same shape — one case is a bare fetch held open on purpose, to prove the fixture still reproduces the hang."],
  ["scripts/check-fetch-timeouts.mjs", "this file's self-test fixtures are SOURCE SNIPPETS in string literals, so it finds itself. It makes no outbound request at all — asserted in its own self-test, which checks the import list."],
]);

/**
 * Blanks out comments, keeping every byte position and every newline.
 *
 * 🔴 Two real misreads on this gate's first run made this necessary, and both are the same
 * mistake: reading source as if it were only code.
 *   - `local-net/lib/http.mjs:6` was reported as an offender. The "call" was a sentence in this
 *     file's own header explaining the bug — a gate finding itself in its own documentation.
 *   - `local-net/deploy/console-maintenance.mjs:53` came back "unbalanced parentheses". Inside
 *     the call sits the comment `// Do not reuse an old listener's pooled connection`. The
 *     apostrophe in "listener's" opened a string, in the scanner's eyes, that never closed — so
 *     the rest of the file was one quoted blob and the call never ended.
 *
 * Positions are preserved rather than removed so line numbers still point at real lines.
 */
export function blankComments(src) {
  let out = "";
  let i = 0;
  let quote = null;
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    if (quote) {
      if (c === "\\") { out += src.slice(i, i + 2); i += 2; continue; }
      if (c === quote) quote = null;
      out += c; i += 1; continue;
    }
    if (c === '"' || c === "'" || c === "`") { quote = c; out += c; i += 1; continue; }
    if (c === "/" && next === "/") {
      while (i < src.length && src[i] !== "\n") { out += " "; i += 1; }
      continue;
    }
    if (c === "/" && next === "*") {
      const end = src.indexOf("*/", i + 2);
      const stop = end === -1 ? src.length : end + 2;
      for (; i < stop; i += 1) out += src[i] === "\n" ? "\n" : " ";
      continue;
    }
    out += c; i += 1;
  }
  return out;
}

/**
 * Reads a call's full argument text by balancing parentheses from the opening one.
 *
 * Quotes and template literals are tracked so a `)` inside a string cannot end the call early;
 * that is not hypothetical here, several call sites build URLs with template literals.
 * Returns null when the parentheses never balance (a truncated file), which is reported rather
 * than treated as "no signal found" — not being able to read the call is not a verdict about it.
 */
export function callText(src, openParenIndex) {
  let depth = 0;
  let quote = null;
  for (let i = openParenIndex; i < src.length; i += 1) {
    const c = src[i];
    if (quote) {
      if (c === "\\") { i += 1; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { quote = c; continue; }
    if (c === "(") depth += 1;
    else if (c === ")") {
      depth -= 1;
      if (depth === 0) return src.slice(openParenIndex, i + 1);
    }
  }
  return null;
}

/**
 * Every bare `fetch(` in one file that has no deadline.
 *
 * The identifier before the paren is checked so `fetchWithDeadline(`, `fetchJson(` and a method
 * named `.fetch(` on some object are not mistaken for the global.
 */
export function scan(source, rel = "") {
  // Comments first: a fetch named in prose is not a call, and an apostrophe in one is not a string.
  const src = blankComments(source);
  const findings = [];
  const re = /(^|[^.\w$])fetch\s*\(/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const open = src.indexOf("(", m.index + m[0].length - 1);
    const text = callText(src, open);
    const line = src.slice(0, m.index).split(/\r?\n/).length;
    if (text === null) { findings.push({ line, rel, reason: "unbalanced parentheses — could not read the call" }); continue; }
    if (/\bsignal\s*:/.test(text) || /\bsignal\b\s*[,})]/.test(text)) continue;
    findings.push({ line, rel, reason: "no signal — this request has no deadline", snippet: text.replace(/\s+/g, " ").slice(0, 90) });
  }
  return findings;
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".mjs")) out.push(p);
  }
  return out;
}

export function scanRepo(root = ROOT) {
  const files = ROOTS.flatMap((r) => walk(path.join(root, r)));
  const findings = [];
  for (const file of files) {
    const rel = path.relative(root, file).replace(/\\/g, "/");
    if (EXEMPT.has(rel)) continue;
    findings.push(...scan(readFileSync(file, "utf8"), rel));
  }
  return { files: files.length, findings };
}

function main() {
  const { files, findings } = scanRepo();
  console.log("══ REQUEST DEADLINES — every outbound call must be able to give up ══\n");
  console.log(`  ${files} file(s) read under ${ROOTS.join(" · ")}\n`);

  if (findings.length) {
    for (const f of findings) console.log(`  🔴 ${f.rel}:${f.line}  ${f.reason}\n       ${f.snippet ?? ""}`);
    console.log(`\n🔴 ${findings.length} request(s) with no deadline.`);
    console.log("   A request with no deadline does not fail — it never returns, and the run is");
    console.log("   read as a slow machine instead of as a measurement that never happened.");
    console.log("   Fix: import { fetchWithDeadline } from '<...>/local-net/lib/http.mjs', or");
    console.log("   requestRpc() from rpc-client.mjs when the call speaks JSON-RPC.");
    return 1;
  }

  for (const [rel, why] of EXEMPT) console.log(`  ⚪ exempt  ${rel}\n       ${why}`);
  console.log(`\n✅ PASS — every request outside the ${EXEMPT.size} declared exemption(s) carries a deadline.`);
  return 0;
}

/* ─────────────────────────── counter-check (--self-test) ─────────────────────────── */

function selfTest() {
  let failures = 0;
  const ok = (what, cond, detail = "") => {
    if (cond) console.log(`  ✓ ${what}`);
    else { failures += 1; console.log(`  🔴 ${what}${detail ? `\n      ${detail}` : ""}`); }
  };

  console.log("══ COUNTER-CHECK — what the scanner does and does not see ══\n");

  ok("🔴 a bare fetch is found", scan('const r = await fetch(url);').length === 1);
  ok("a fetch with an inline signal is not", scan('await fetch(url, { signal: s });').length === 0);

  // 🔴 The case the first measurement got wrong: `signal` four lines down.
  const longOptions = [
    "const r = await fetch(`${CONSOLE}/api/create`, {",
    '  method: "POST",',
    '  headers: { "content-type": "application/json" },',
    "  body: JSON.stringify({ name }),",
    "  signal: AbortSignal.timeout(HAN_THAO_TAC),",
    "});",
  ].join("\n");
  ok("🔴 a signal on the FIFTH line still counts — the first count of 28 was wrong about two files",
    scan(longOptions).length === 0,
    "a three-line window measured the formatting, not the property");

  ok("a `)` inside a template literal does not end the call early",
    scan('await fetch(`${a})b`, { signal: s });').length === 0);
  ok("🔴 …and the same shape WITHOUT a signal is still caught",
    scan('await fetch(`${a})b`, { headers });').length === 1);

  ok("fetchWithDeadline is not mistaken for the global fetch",
    scan('await fetchWithDeadline(url, { headers });').length === 0);
  ok("fetchJson is not either", scan('await fetchJson(url);').length === 0);
  ok("a method called .fetch() on some object is not the global",
    scan('await cache.fetch(url);').length === 0);

  ok("a shorthand `signal` (not `signal:`) counts", scan('await fetch(url, { signal });').length === 0);

  ok("🔴 an unreadable call is REPORTED, not silently passed",
    scan('await fetch(url, { headers: [').some((f) => /unbalanced/.test(f.reason)),
    "not being able to read a call is not a verdict about it");

  ok("nested calls in the arguments do not confuse the balancer",
    scan('await fetch(new URL(route, origin), { headers: h(x, y) });').length === 1);

  ok("the line number points at the fetch, not at the file start", scan("\n\n\nawait fetch(u);")[0].line === 4);

  // ── The two misreads of this gate's own first run ──
  ok("🔴 a fetch NAMED IN A COMMENT is not a call — this gate found itself in its own header",
    scan("// explains why await fetch(url) with no signal is bad\nconst x = 1;").length === 0);
  ok("🔴 an apostrophe inside a comment does not swallow the rest of the file",
    scan([
      "await fetch(new URL(route, origin), {",
      "  // Do not reuse an old listener's pooled connection for its replacement.",
      "  method, signal,",
      "});",
      "await fetch(other);",
    ].join("\n")).length === 1,
    "console-maintenance.mjs:53 came back 'unbalanced parentheses' for exactly this reason");
  ok("a block comment mentioning fetch( is ignored too",
    scan("/**\n * await fetch(u) — bad\n */\nawait fetch(u, { signal });").length === 0);
  ok("blanking a comment keeps the line numbers", blankComments("//a\n//b\nawait fetch(u);").split("\n").length === 3);
  ok("a string that CONTAINS // is not treated as a comment",
    scan('await fetch("http://x/y");').length === 1);

  ok("every exemption carries a reason", [...EXEMPT.values()].every((v) => typeof v === "string" && v.length > 30));

  // 🔴 This file exempts ITSELF, which is the one exemption that could hide a real bug. The
  // exemption is only honest while the file makes no outbound request, so that is asserted here
  // against the source rather than trusted: its imports must stay filesystem-only.
  ok("the self-exemption stays honest — this gate imports nothing that can reach the network",
    (() => {
      const self = readFileSync(fileURLToPath(import.meta.url), "utf8");
      const imports = [...self.matchAll(/^import .* from "([^"]+)";$/gm)].map((m) => m[1]);
      const allowed = new Set(["node:fs", "node:path", "node:url", "../local-net/lib/cli.mjs"]);
      return imports.every((i) => allowed.has(i));
    })(),
    "if this gate ever needs to make a request, remove its exemption first");

  console.log(failures === 0
    ? "\n✅ PASS — the scanner reads calls, not line windows."
    : `\n🔴 FAIL — ${failures} case(s).`);
  return failures === 0 ? 0 : 1;
}

process.exitCode = process.argv.includes("--self-test") ? selfTest() : main();
