#!/usr/bin/env node
/**
 * check-fixed-ports.mjs — no two files may claim the same fixed localhost port.
 *
 * ═══ WHY ═══
 *
 * Most tests here bind `listen(0)` and let the kernel pick, which cannot collide. A handful
 * bind a NUMBER, because the process under test is started separately and has to be told where
 * to connect. Those numbers are a shared namespace that nothing was watching.
 *
 * Measured 2026-09-08 (D-246): `local-net/console/governance-e2e-test.mjs` and
 * `scripts/check-genesis-verify.mjs` BOTH claimed 8501 and 8502. The second is visibly a copy of
 * the first — same two ports, same OWNER address, same shape — and the copy kept the numbers.
 *
 * It had never collided, for one reason only: they sit in different runners, so nothing had ever
 * started them at the same time. That is not a property of the code, it is a property of the
 * schedule, and this repo has already been bitten by two sessions sharing one worktree. The
 * failure would arrive as `EADDRINUSE` inside a gate — which reads as "the gate is broken", not
 * as "two gates wanted the same port".
 *
 * It also silently blocks any attempt to run the checks concurrently, which is the reason this
 * gate was written today rather than later.
 *
 * ═══ WHAT IT DOES NOT CLAIM ═══
 *
 * It does not know whether a port is free on your machine, and it does not look for ports held
 * by other software. It answers one question — do two files in this repo claim the same number —
 * because that is the one a static reading can actually answer. A port that some unrelated
 * program is holding is a different problem with a different fix.
 *
 * Usage:
 *   node scripts/check-fixed-ports.mjs
 *   node scripts/check-fixed-ports.mjs --self-test
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { guardEntry } from "../local-net/lib/cli.mjs";
import { blankComments, blankStrings, lineAt } from "./lib/source-scan.mjs";
import { counter } from "./lib/report.mjs";

// 🔴 A flag this gate does not know is exit 2 — "could not run", never a verdict (D-244).
guardEntry(import.meta.url, ["--self-test", "--list"]);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOTS = ["scripts", "local-net"];
const SKIP_DIRS = new Set(["node_modules", "net", "out", "data", ".git"]);

/**
 * Ports below this are the real network's, not a fixture's: 9650/9651 are avalanchego's, 8545 is
 * the EVM RPC convention, 443/80 are the public site. Claiming one of those twice in source is
 * not a conflict — those files are naming the SAME external service on purpose.
 */
const FIXTURE_PORT_MIN = 8000;
const FIXTURE_PORT_MAX = 65_535;

/** Ports that name a real service and are expected to appear in many files. */
const SHARED_SERVICE_PORTS = new Set([8545, 9650, 9651, 9750, 9850]);

/**
 * Finds `const NAME = <port>` declarations whose name says it is a port.
 *
 * Reading declarations rather than every four-digit number is deliberate: a bare number in
 * source is usually a timeout, a chainId or a byte count, and a scanner that flagged those would
 * produce noise until someone stopped reading it.
 */
export function scanPorts(source) {
  // 🔴 Comments AND string contents are blanked first. A gate that reads source must not count
  // its own fixtures: this file's self-test holds `const PORT = 8501;` inside a string, and the
  // first version duly reported ITSELF. The fix for that must never be "exempt the gate" — a
  // gate exempted from its own rule has stopped watching the thing it was written for.
  const src = blankStrings(blankComments(source));
  const found = [];
  const keep = (port) => port >= FIXTURE_PORT_MIN && port <= FIXTURE_PORT_MAX && !SHARED_SERVICE_PORTS.has(port);

  const declared = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(\d{2,5})\b/g;
  let m;
  while ((m = declared.exec(src)) !== null) {
    // 🔴 The NAME is tested separately rather than embedded in the pattern. The first version
    // wrote `[A-Za-z_$][\w$]*PORT[\w$]*`, which needs at least one character BEFORE "PORT" and
    // therefore missed every constant literally called `PORT` — the most common spelling in this
    // repo, and the exact one in both files this gate was written to catch. It reported 4 ports
    // and none of the duplicates.
    if (!/port/i.test(m[1])) continue;
    // A BOUND on the port range is not a claim on a port. `FIXTURE_PORT_MIN = 8000` in this very
    // file was reported as claiming 8000 — general rule, not a self-exemption: any name ending
    // MIN/MAX/RANGE/COUNT describes the space of ports, it does not ask to listen on one.
    if (/_(MIN|MAX|RANGE|COUNT)$/i.test(m[1])) continue;
    const port = Number(m[2]);
    if (keep(port)) found.push({ name: m[1], port, line: lineAt(src, m.index) });
  }

  // A literal `listen(<port>` counts too: some fixtures skip the named constant.
  const listen = /\.listen\(\s*(\d{4,5})\b/g;
  while ((m = listen.exec(src)) !== null) {
    const port = Number(m[1]);
    if (keep(port)) found.push({ name: "listen()", port, line: lineAt(src, m.index) });
  }
  return found;
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

/** port -> [{ rel, name, line }] for every fixture port claimed anywhere in the repo. */
export function claims(root = ROOT) {
  const byPort = new Map();
  for (const file of ROOTS.flatMap((r) => walk(path.join(root, r)))) {
    const rel = path.relative(root, file).replace(/\\/g, "/");
    for (const hit of scanPorts(readFileSync(file, "utf8"))) {
      if (!byPort.has(hit.port)) byPort.set(hit.port, []);
      byPort.get(hit.port).push({ rel, ...hit });
    }
  }
  return byPort;
}

/** Two files claiming one port. Same file twice is fine — one process, one listener. */
export function conflicts(byPort) {
  const out = [];
  for (const [port, users] of byPort) {
    const files = [...new Set(users.map((u) => u.rel))];
    if (files.length > 1) out.push({ port, users });
  }
  return out.sort((a, b) => a.port - b.port);
}

function main() {
  const byPort = claims();
  if (process.argv.includes("--list")) {
    for (const [port, users] of [...byPort].sort((a, b) => a[0] - b[0])) {
      console.log(`${port}  ${[...new Set(users.map((u) => u.rel))].join(" · ")}`);
    }
    return 0;
  }

  const bad = conflicts(byPort);
  console.log("══ FIXED PORTS — one number, one file ══\n");
  console.log(`  ${byPort.size} fixture port(s) claimed across ${ROOTS.join(" · ")}\n`);

  if (bad.length) {
    for (const { port, users } of bad) {
      console.log(`  🔴 port ${port} is claimed by ${new Set(users.map((u) => u.rel)).size} files:`);
      for (const u of users) console.log(`       ${u.rel}:${u.line}  (${u.name})`);
    }
    console.log(`\n🔴 ${bad.length} port(s) claimed twice.`);
    console.log("   These have not collided yet only because their runners never start them at");
    console.log("   the same time. That is a property of the SCHEDULE, not of the code, and it");
    console.log("   ends the moment two sessions run or the checks go parallel. The failure");
    console.log("   arrives as EADDRINUSE inside a gate, which reads as 'the gate is broken'.");
    return 1;
  }

  console.log(`✅ PASS — every fixture port belongs to exactly one file.`);
  return 0;
}

/* ─────────────────────────── counter-check (--self-test) ─────────────────────────── */

function selfTest() {
  // The shared tally (D-247). Same lines, same codes — it exists because this exact five-line
  // helper was typed out four times on 2026-09-08, in the four gates written that day.
  const { ok, finish } = counter("COUNTER-CHECK — what counts as a claim, and what counts as a clash");

  ok("a named port constant is a claim", scanPorts("const PORT = 8501;")[0].port === 8501);
  ok("a suffixed name counts too", scanPorts("const PORT_FAKE_NODE = 8502;")[0].port === 8502);
  ok("a bare .listen(number) counts", scanPorts("rpc.listen(18999, '127.0.0.1');")[0].port === 18999);
  ok("listen(0) is not a claim — the kernel picks and cannot collide", scanPorts("rpc.listen(0);").length === 0);

  ok("🔴 a TIMEOUT is not a port, even though it is a four-digit number",
    scanPorts("const TIMEOUT_MS = 8000;").length === 0,
    "a scanner that flagged every number would produce noise until someone stopped reading it");
  ok("a chainId is not a port either", scanPorts("const CHAIN_ID = 9001;").length === 0);

  ok("the real network's ports are shared on purpose, not conflicts",
    scanPorts("const RPC_PORT = 9650;").length === 0 && scanPorts("const EVM_PORT = 8545;").length === 0);

  const two = new Map([[8501, [{ rel: "a.mjs", line: 1, name: "PORT" }, { rel: "b.mjs", line: 2, name: "PORT" }]]]);
  ok("🔴 two files, one port ⇒ a conflict", conflicts(two).length === 1);

  const same = new Map([[8501, [{ rel: "a.mjs", line: 1, name: "PORT" }, { rel: "a.mjs", line: 9, name: "BASE_PORT" }]]]);
  ok("the SAME file naming one port twice is not a conflict — one process, one listener",
    conflicts(same).length === 0);

  // The real repository is the last case: this gate exists because of a real duplicate.
  const real = conflicts(claims());
  ok(`the repository itself is clean (${real.length} conflict(s))`, real.length === 0,
    real.map((c) => `port ${c.port}: ${[...new Set(c.users.map((u) => u.rel))].join(" · ")}`).join("\n      "));

  return finish("a claim is a claim, a timeout is not, and one file may repeat itself");
}

process.exitCode = process.argv.includes("--self-test") ? selfTest() : main();
