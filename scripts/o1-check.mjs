#!/usr/bin/env node
/**
 * o1-check.mjs — **ONE command for O1**: can this copy of the fund key set still recover the
 * network that is actually running?
 *
 * ═══ WHY TWO COMMANDS WERE MERGED INTO ONE ═══
 *
 * D-090 built both measurements, and the docs said *"you must run BOTH"*. But **a reminder is
 * not a gate** — it only works on a reader who opens the right document, on the right day, and
 * still remembers the second command after the first one has just printed a very convincing
 * green line:
 *
 *     ✓ 6/6 quỹ khôi phục đúng — mọi địa chỉ suy lại từ khoá đều khớp thứ tệp tự khai.
 *
 * That line is what `check-keys` prints for the **DEAD generation-9001 key set**, whose money
 * does not exist anywhere. The dangerous O1 failure is not "corrupt file", it is **keeping
 * exactly one copy, of the previous generation** — and on that exact path, the missing
 * measurement is the one people forget.
 *
 * ⇒ This file turns *"remember to run both"* from a **procedure** into a **gate**.
 *
 * ═══ THREE EXIT CODES — AND WHY IT MUST BE THREE ═══
 *
 * | code | meaning | when |
 * |---:|---|---|
 * | `0` | **PASS** | both halves ran **and** both are green |
 * | `1` | **FAIL** | a half ran and **reported red** — this copy is not usable |
 * | `2` | 🔴 **INCONCLUSIVE** | a half **could not run** (missing file / no docker / chain unreachable) |
 *
 * Folding `2` into `1` lets "broken" swallow "don't know", and people go fix the wrong thing.
 * Folding `2` into `0` is far worse: **an unverified copy gets scored as verified.** That is
 * exactly the failure class both D-090 and this file exist to block.
 *
 * ═══ 🔴 2026-08-28 — THIS GATE WAS DEAD, AND IT FAILED TOWARD "FAIL" ═══
 *
 * The 2026-08-28 rename moved the Go tool from `9chain-a1-tools/kiem-khoa` to
 * `9chain-a1-tools/check-keys` (patch 0025). This file kept calling the old path. `go run` on a
 * missing package exits **1**, and half 1 scored that as **red**, so the gate printed:
 *
 *     🔴 FAIL — this copy is NOT usable for the running network. Do not keep it as the O1 copy.
 *
 * ...for the **primary, provably correct** key set. Read literally, that verdict tells David to
 * throw away a good backup. Both directions of this mistake cost money; this one just costs it
 * more quietly.
 *
 * Nothing caught it because `o1-check` is a MANUAL TASK in the preflight, not one of its gates,
 * and because the self-test's most expensive case — *"dead generation ⇒ 1"* — **stayed green for
 * the wrong reason**: it did exit 1, but from the broken tool path, never from the key set. A
 * reverse-control case that passes for the wrong reason is not a control (hard rule #2, part 3).
 *
 * ⇒ Fix: half 1 may only return **FAIL** when the tool **proves it actually ran** (see
 * `toolActuallyRan`). No proof of execution ⇒ **INCONCLUSIVE**, never FAIL, never PASS.
 *
 * ⚠️ **Reads, prints and transmits no private key.** Half 1 runs in a container and prints only
 * **addresses**; half 2 reads only `allocation.md` (a file that is self-declared public). The key
 * directory is mounted **`:ro`**.
 *
 * Usage:
 *   node scripts/o1-check.mjs C:/Users/abc/9chain-a1-keys/g0
 *   node scripts/o1-check.mjs <dir> --rpc https://rpc-a1.9chain.org
 *   node scripts/o1-check.mjs --self-test     # reverse controls — includes cases that MUST be 1 and 2
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, copyFileSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const opt = (flag, fallback) => {
  const i = argv.indexOf(flag);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
const RPC = opt("--rpc", "https://rpc-a1.9chain.org");
const DOCKER = opt("--docker", "docker");
const IMAGE = opt("--image", "golang:1.25.10");
// The Go tool's package path inside the fork. Overridable so the self-test can point it at a
// package that does not exist and prove the "tool never ran" branch is live — the branch that
// was missing on 2026-08-28. Renaming the tool again only needs this default changed.
const TOOL = opt("--tool", "check-keys");
const SELF_TEST = argv.includes("--self-test");
const FLAGS_WITH_VALUE = new Set(["--rpc", "--docker", "--image", "--tool", "--live-set"]);
const targetDir = argv.find((a, i) => !a.startsWith("--") && !FLAGS_WITH_VALUE.has(argv[i - 1]));

const FORK = path.join(ROOT, "upstream", "avalanchego");
// Docker on Windows accepts both `C:\...` and `C:/...`; normalise to forward slashes so the
// mount string never carries an escape character.
const mount = (p) => path.resolve(p).replace(/\\/g, "/");

/** Result of one half: could it run at all, and if so is it green or red. */
const HALF_PASS = "pass", HALF_FAIL = "fail", HALF_DID_NOT_RUN = "did-not-run";

/**
 * 🔴 Proof that `check-keys` actually executed, rather than `go run` failing before reaching it.
 *
 * Both markers are printed by the tool itself and by nothing else on the path:
 *   - `check-keys — <path>` is its header line, printed once parsing succeeds (main.go).
 *   - `FATAL ` prefixes every one of its own red exits.
 * A missing package, a compile error or a broken image produce neither, and those must be
 * INCONCLUSIVE — we measured nothing.
 *
 * ⚠️ If the tool's output strings ever change, this returns false and the whole gate goes to
 * exit 2 (never to a false green). The self-test case *"live g0 set ⇒ 0"* fails loudly the
 * moment that happens, which is exactly how it should be found.
 */
function toolActuallyRan(output) {
  return /^check-keys — /m.test(output) || /^FATAL /m.test(output);
}

/**
 * HALF 1 — do the private keys derive EXACTLY the addresses the file claims (`check-keys`,
 * patch 0023, renamed by patch 0025).
 *
 * 🔴 Spawned via `spawnSync` rather than a shell: on Git Bash (Windows) MSYS rewrites every
 * argument starting with `/` into a Windows path, so `-w /src` becomes
 * `C:/Program Files/Git/src` and docker refuses. Hit on 2026-08-28. `spawnSync` does not go
 * through MSYS, so that failure cannot occur here.
 */
function halfKeysToAddresses(keyDir) {
  if (!existsSync(FORK)) {
    return { state: HALF_DID_NOT_RUN, why: `fork tree not found at ${FORK}` };
  }
  const args = [
    "run", "--rm",
    "-v", `${mount(FORK)}:/src`,
    "-v", `${mount(keyDir)}:/keys:ro`,
    "-v", "9chain-gomod:/go/pkg/mod",
    "-w", "/src", IMAGE,
    "sh", "-c", `go run ./9chain-a1-tools/${TOOL} -allocation /keys/allocation.md /keys/keys.txt`,
  ];
  const r = spawnSync(DOCKER, args, { encoding: "utf8", timeout: 180_000 });
  const output = `${r.stdout || ""}${r.stderr || ""}`.trim();
  if (r.error || r.status === null) {
    return { state: HALF_DID_NOT_RUN, why: `could not run ${DOCKER}: ${r.error?.message || "timed out"}`, output };
  }
  // `check-keys` uses exit 2 for USAGE errors (missing argument, flag in the wrong position) —
  // that is "did not measure", not "measured and it is wrong". Keep the distinction.
  if (r.status === 2) return { state: HALF_DID_NOT_RUN, why: `${TOOL} refused to run (usage error)`, output };
  // 🔴 The 2026-08-28 hole: any non-zero exit was read as a verdict about the KEYS. It is only a
  // verdict if the tool got far enough to print one.
  if (!toolActuallyRan(output)) {
    return {
      state: HALF_DID_NOT_RUN,
      why: `${TOOL} never ran (exit ${r.status}, no output of its own) — this says nothing about the keys`,
      output,
    };
  }
  if (r.status !== 0) return { state: HALF_FAIL, why: `${TOOL} reported RED (exit ${r.status})`, output };
  return { state: HALF_PASS, why: "private keys derive every address the file claims", output };
}

/** HALF 2 — do those addresses hold real money on the RUNNING network (D-090). */
function halfAddressesToMoney(allocFile) {
  const script = path.join(ROOT, "scripts", "check-keys-on-chain.mjs");
  if (!existsSync(script)) {
    return { state: HALF_DID_NOT_RUN, why: `missing ${script} — this half must NOT be counted as checked` };
  }
  const r = spawnSync(process.execPath, [script, allocFile, "--rpc", RPC], {
    encoding: "utf8", timeout: 180_000,
  });
  const output = `${r.stdout || ""}${r.stderr || ""}`.trim();
  if (r.error || r.status === null) {
    return { state: HALF_DID_NOT_RUN, why: `could not run the on-chain measurement: ${r.error?.message || "timed out"}`, output };
  }
  // That script uses exit 2 for "chain unreachable / ledger unreadable" — also *don't know*,
  // not *wrong*.
  if (r.status === 2) return { state: HALF_DID_NOT_RUN, why: "could not measure on chain (RPC/file)", output };
  if (r.status !== 0) return { state: HALF_FAIL, why: `addresses do NOT match the running chain (exit ${r.status})`, output };
  return { state: HALF_PASS, why: "those addresses hold real money on the running chain", output };
}

function run(dir, { quiet = false } = {}) {
  const say = (...a) => { if (!quiet) console.log(...a); };
  const keys = path.join(dir, "keys.txt");
  const alloc = path.join(dir, "allocation.md");

  say(`\n══ O1 — fund key copy: ${dir} ══`);
  if (!existsSync(dir)) return { code: 2, why: `directory does not exist: ${dir}` };
  // Missing ONE of the two files is "inconclusive", not "wrong": nothing has been measured yet.
  for (const [name, p] of [["keys.txt", keys], ["allocation.md", alloc]]) {
    if (!existsSync(p)) return { code: 2, why: `${name} missing from ${dir} — nothing measured yet` };
  }

  say(`\n── half 1/2 · private key → address  (${TOOL}, in a container) ──`);
  const h1 = halfKeysToAddresses(dir);
  say(`  ${h1.state === HALF_PASS ? "✓" : "✗"} ${h1.why}`);
  if (!quiet && h1.output) say(h1.output.split("\n").map((l) => `    │ ${l}`).join("\n"));

  say("\n── half 2/2 · address → REAL MONEY on the running chain ──");
  const h2 = halfAddressesToMoney(alloc);
  say(`  ${h2.state === HALF_PASS ? "✓" : "✗"} ${h2.why}`);
  if (!quiet && h2.output) say(h2.output.split("\n").map((l) => `    │ ${l}`).join("\n"));

  // 🔴 ORDER OF JUDGEMENT: "could not run" comes BEFORE "wrong". A half that could not measure
  // cannot make the overall verdict "pass" even if the other half is green — and it cannot make
  // it "fail" either, because we do not know. Getting this order wrong folds *don't know* into
  // *know*.
  if (h1.state === HALF_DID_NOT_RUN || h2.state === HALF_DID_NOT_RUN) {
    const which = h1.state === HALF_DID_NOT_RUN ? h1.why : h2.why;
    return { code: 2, why: `inconclusive — ${which}` };
  }
  if (h1.state === HALF_FAIL || h2.state === HALF_FAIL) {
    return { code: 1, why: h1.state === HALF_FAIL ? h1.why : h2.why };
  }
  return { code: 0, why: "both halves green — this copy can recover the running network" };
}

function printVerdict({ code, why }) {
  const table = {
    0: ["✅ PASS", "This key set derives the right addresses, AND those addresses hold real money\n   on the running network. The loop is closed."],
    1: ["🔴 FAIL", "This copy is NOT usable for the running network. Do not keep it as the O1 copy."],
    2: ["🟡 INCONCLUSIVE", "A half could not run ⇒ **don't know**, and *don't know* is NOT *pass*.\n   Fix the cause and run again; do not score O1 from this run."],
  };
  const [label, explanation] = table[code];
  console.log(`\n${label} — ${why}\n   ${explanation}`);
}

// ═════ REVERSE CONTROLS ═════
// Without these, "PASS" may only mean the gate cannot tell anything apart.
function selfTest() {
  const tmp = mkdtempSync(path.join(tmpdir(), "o1-"));
  const deadSet = path.join(ROOT, "local-net", "net-public");
  const liveSet = opt("--live-set", "C:/Users/abc/9chain-a1-keys/g0");
  // Empty directory: real, but holds no file ⇒ must be 2, not 0.
  const empty = path.join(tmp, "empty");
  mkdirSync(empty, { recursive: true });

  const cases = [
    ["directory does not exist ⇒ 2", path.join(tmp, "absent"), 2, {}],
    ["EMPTY directory (real, no files) ⇒ 2", empty, 2, {}],
    ["`check-keys-on-chain.mjs` missing ⇒ 2, must NOT be green", liveSet, 2, { breakHalf2: true }],
    ["docker not callable ⇒ 2", liveSet, 2, { docker: "docker-that-does-not-exist" }],
    // 🔴 THE 2026-08-28 REGRESSION, now a permanent control. Before the fix this returned 1:
    // a broken tool path was read as a verdict about the keys, so a GOOD backup was scored
    // "do not keep it". The keys here are the live ones — the only correct answer is 2.
    ["🔴 tool package missing ⇒ 2, NOT 1 (broken tool ≠ bad keys)", liveSet, 2, { tool: "tool-that-does-not-exist" }],
    // 🔴 THE MOST EXPENSIVE CASE — the DEAD generation-9001 key set, still on the dev machine.
    // `check-keys` alone scores it 6/6 ✓ exit 0. The merged gate MUST return 1.
    ["🔴 DEAD-generation key set ⇒ 1 (check-keys alone scores it 6/6 ✓)", deadSet, 1, {}],
    ["live g0 key set ⇒ 0 (control: the gate does not block blindly)", liveSet, 0, {}],
  ];

  let broken = 0;
  console.log("\n══ REVERSE CONTROLS — each case must produce EXACTLY the stated exit code ══");
  for (const [name, dir, expected, options] of cases) {
    if (!existsSync(dir) && expected !== 2) {
      console.log(`  ⚠️  "${name}" → SKIPPED, no ${dir} on this machine`);
      continue;
    }
    let code;
    if (options.breakHalf2) {
      // Hide the on-chain measurement by moving the script aside — this reproduces exactly the
      // "someone only ran check-keys" scenario.
      const src = path.join(ROOT, "scripts", "check-keys-on-chain.mjs");
      const stash = `${src}.control-copy`;
      try {
        copyFileSync(src, stash); rmSync(src);
        code = run(dir, { quiet: true }).code;
      } finally {
        copyFileSync(stash, src); rmSync(stash);
      }
    } else if (options.docker || options.tool) {
      // Overrides that only take effect at startup have to be exercised in a child process.
      const extra = options.docker ? ["--docker", options.docker] : ["--tool", options.tool];
      const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), dir, ...extra],
        { encoding: "utf8", timeout: 180_000 });
      code = r.status;
    } else {
      code = run(dir, { quiet: true }).code;
    }
    if (code === expected) console.log(`  ✓ "${name}" → correct, exit ${code}`);
    else { console.log(`  ✗ "${name}" → WRONG: expected ${expected}, got ${code}`); broken++; }
  }
  try { rmSync(tmp, { recursive: true, force: true }); } catch { /* ignore */ }
  return broken;
}

if (SELF_TEST) {
  const broken = selfTest();
  console.log(`\n${broken ? "✗" : "✅"} reverse controls: ${broken} case(s) wrong`);
  process.exit(broken ? 1 : 0);
}

if (!targetDir) {
  console.error("Usage: node scripts/o1-check.mjs <dir containing keys.txt + allocation.md>");
  console.error("       node scripts/o1-check.mjs --self-test");
  process.exit(2);
}
const result = run(targetDir);
printVerdict(result);
process.exit(result.code);
