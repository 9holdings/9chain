#!/usr/bin/env node
/**
 * check-flag-guards.mjs — every gate must REFUSE a flag it does not know.
 *
 * ═══ WHY THIS GATE EXISTS ═══
 *
 * Measured 2026-09-08 (D-244), on the live tree, before any of this was written:
 *
 *     node scripts/check-chain-ledger.mjs --dril      ->  "✅ PASS", exit 0
 *     node scripts/check-net-dirs.mjs   --self-tset   ->  "✅ PASS", exit 0
 *
 * Both printed a green verdict while measuring something other than what was asked. That is
 * CLAUDE.md section 2's error class, arriving as a checkmark. `local-net/lib/cli.mjs` closes it;
 * this gate is what keeps it closed when the next gate is written.
 *
 * ═══ WHY IT RUNS THE GATES INSTEAD OF READING THEM ═══
 *
 * A static check — "does this file contain the string guardEntry" — proves the call was typed,
 * not that it runs. It would stay green if the call sat after the network work, inside a branch
 * that never executes, or below an early `process.exit`. This project has been burned by exactly
 * that shape before: `console-deploy.sh` was broken from the very commit that fixed it, because
 * nobody had watched the thing run (see memory "a gate nobody watched run").
 *
 * So this gate hands each script a flag that cannot exist and reads what comes back. It is
 * slower and it is the only version that means anything.
 *
 * ═══ 🔴 TWO THINGS THIS GATE GOT WRONG ON ITS FIRST RUN, KEPT BECAUSE THEY REPEAT ═══
 *
 * (1) **Exit 2 alone is not proof.** The first version passed a gate if it exited 2. Two gates
 *     went green that way while ignoring the flag completely: `check-genesis-contracts` and
 *     `check-genesis-verify` exit 2 whenever the fork working tree is dirty — with or without a
 *     flag. The gate was reading "exit 2" and calling it "refused the flag", which is the same
 *     error class it was written to catch, one level up. It now requires exit 2 AND a message
 *     that NAMES the flag: a verdict has to be about the thing you asked about.
 *
 * (2) **Probing an unguarded gate RUNS it.** That is the whole point — an unguarded gate ignores
 *     the flag and proceeds — but it means this gate does real work on the way to its verdict.
 *     On the first run it started `check-genesis-contracts`, which COPIES a file into
 *     `upstream/avalanchego`; the 30 s timeout killed it with SIGTERM before its `process.on
 *     ("exit")` cleanup ran, and the fork tree was left dirty. Nothing was damaged — the leftover
 *     was a byte-identical copy of `local-net/tools/genesis-exec/main.go` — but the fork tree is
 *     the thing every other measurement is anchored to, and a CHECK is not supposed to move it.
 *     ⇒ Once every gate is guarded, no gate body ever runs here. Until then, a red line from this
 *     gate may have left a side effect: check `git -C upstream/avalanchego status` after a red.
 *
 * Usage:
 *   node scripts/check-flag-guards.mjs
 *   node scripts/check-flag-guards.mjs --self-test
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { guardEntry } from "../local-net/lib/cli.mjs";

// 🔴 A flag this gate does not know is exit 2 — "could not run", never a verdict (D-244).
guardEntry(import.meta.url, ["--self-test", "--list"]);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** The flag handed to every gate. Long and absurd on purpose: nothing may ever accept it. */
const BOGUS = "--zzz-this-flag-does-not-exist";

/**
 * Gates outside `scripts/check-*.mjs` that are still gates — named in CLAUDE.md section 3, in
 * gday-preflight's GATES table, or in check-local's lists.
 */
const EXTRA_GATES = [
  "scripts/gday-preflight.mjs",
  "scripts/gen-chainid-issued.mjs",
  "scripts/make-l1-genesis.mjs",
  "scripts/reopen-chain-creation.mjs",
  "scripts/drill-upgrade-rollback.mjs",
  "scripts/o1-check.mjs",
  "scripts/wallet-over-tunnel.mjs",
  "scripts/watch-network.mjs",
  "scripts/close-ledger-before-regenesis.mjs",
  "scripts/backup-validator-identity.mjs",
  "scripts/export-chain.mjs",
  "local-net/lib/cb58.mjs",
  "local-net/lib/eip55.mjs",
  "local-net/lib/l1-allowlist.mjs",
  "local-net/lib/l1-options.mjs",
  "local-net/lib/l1-upgrade.mjs",
  "local-net/faucet/ceremony-9s-union.mjs",
  "local-net/faucet/block-adam-drill.mjs",
  "local-net/deploy/check-heartbeat-stopped.mjs",
];

/** Every gate this file is responsible for. */
export function gateList(root = ROOT) {
  const checks = readdirSync(path.join(root, "scripts"))
    .filter((f) => f.startsWith("check-") && f.endsWith(".mjs"))
    .map((f) => `scripts/${f}`)
    .filter((f) => !f.endsWith("check-flag-guards.mjs"));
  return [...new Set([...checks, ...EXTRA_GATES])]
    .filter((f) => existsSync(path.join(root, f)))
    .sort();
}

/**
 * Runs one gate with the bogus flag and judges what came back.
 *
 * Verdicts:
 *   ok        exit 2 AND the message names the flag — refused, nothing measured
 *   UNNAMED   exit 2 but the message never mentions the flag — 🔴 see note (1) in the header:
 *             these two gates exit 2 on a dirty fork tree too, so the code alone proves nothing
 *   SILENT    exit 0 — 🔴 the bug: it ran anyway and called the result good
 *   VERDICT   exit 1 — 🔴 wrong code: it reported a NO it never measured (D-116)
 *   TIMEOUT   it started doing real work before deciding it could not run
 */
export function judge({ status, signal, stdout = "", stderr = "" }) {
  if (signal || status === null) return { verdict: "TIMEOUT", ok: false, named: false };
  const named = new RegExp(`unknown flag ${BOGUS}`, "i").test(stderr + stdout);
  if (status === 2) return { verdict: named ? "ok" : "UNNAMED", ok: named, named };
  if (status === 0) return { verdict: "SILENT", ok: false, named };
  if (status === 1) return { verdict: "VERDICT", ok: false, named };
  return { verdict: `exit ${status}`, ok: false, named };
}

function runGate(file, root = ROOT) {
  const result = spawnSync(process.execPath, [path.join(root, file), BOGUS], {
    cwd: root, encoding: "utf8", timeout: 30_000,
    // A gate must decide it cannot run BEFORE it touches anything. Nothing here should reach
    // the network, but if one does, this keeps the run bounded rather than hanging the gate.
    env: { ...process.env, A1_FLAG_GUARD_PROBE: "1" },
  });
  return { file, ...judge(result), status: result.status, stderr: (result.stderr || "").trim().split("\n")[0] };
}

function main() {
  const gates = gateList();
  if (process.argv.includes("--list")) { console.log(gates.join("\n")); return 0; }

  console.log(`══ FLAG GUARDS — every gate must refuse ${BOGUS} ══\n`);
  console.log(`  ${gates.length} gate(s). A gate that accepts an unknown flag is measuring`);
  console.log("  something other than what it was asked, and saying PASS while it does.\n");

  const rows = gates.map((f) => runGate(f));
  const bad = rows.filter((r) => !r.ok);

  for (const r of rows) {
    if (r.ok) console.log(`  ✓ ${r.file}`);
    else console.log(`  🔴 ${r.file} — ${r.verdict}${r.stderr ? `  |  ${r.stderr.slice(0, 90)}` : ""}`);
  }

  if (rows.some((r) => r.verdict === "UNNAMED")) {
    console.log("\n🟡 UNNAMED means the gate exited 2 but never mentioned the flag — so this run");
    console.log("   cannot tell 'refused the flag' from 'could not run for some other reason'.");
    console.log("   Two gates exit 2 whenever upstream/avalanchego is dirty; check that first.");
  }

  if (bad.length) {
    console.log(`\n🔴 ${bad.length} of ${rows.length} gate(s) do NOT refuse an unknown flag.`);
    console.log("   Measured on 2026-09-08, this is what that looks like in practice:");
    console.log("     node scripts/check-chain-ledger.mjs --dril  ->  \"PASS\", exit 0, NOT in drill mode.");
    console.log("   Fix: import { guardEntry } from '../local-net/lib/cli.mjs' and call it above everything else,");
    console.log("   listing the flags the gate actually accepts. See local-net/lib/cli.mjs.");
    return 1;
  }

  console.log(`\n✅ PASS — all ${rows.length} gates refuse a flag they do not know, with exit 2.`);
  return 0;
}

/* ─────────────────────────── counter-check (--self-test) ─────────────────────────── */

function selfTest() {
  let failures = 0;
  const ok = (what, cond, detail = "") => {
    if (cond) console.log(`  ✓ ${what}`);
    else { failures += 1; console.log(`  🔴 ${what}${detail ? `\n      ${detail}` : ""}`); }
  };

  console.log("══ COUNTER-CHECK — the verdict rules, then a real unguarded script ══\n");

  ok("exit 2 that NAMES the flag is the only pass",
    judge({ status: 2, stderr: `unknown flag ${BOGUS}` }).ok === true);
  ok("🔴 exit 2 that says nothing about the flag is UNNAMED, not a pass — see header note (1)",
    judge({ status: 2, stderr: "CANNOT RUN — the fork working tree is DIRTY" }).ok === false
    && judge({ status: 2 }).verdict === "UNNAMED");
  ok("🔴 exit 0 on an unknown flag is SILENT — the bug this gate exists for",
    judge({ status: 0 }).verdict === "SILENT" && judge({ status: 0 }).ok === false);
  ok("🔴 exit 1 is WRONG too — a refused flag is not a NO (D-116)",
    judge({ status: 1 }).verdict === "VERDICT" && judge({ status: 1 }).ok === false);
  ok("🔴 a killed run is TIMEOUT, never a pass",
    judge({ status: null, signal: "SIGTERM" }).verdict === "TIMEOUT");
  ok("exit 2 that names the flag is distinguished from exit 2 that says nothing",
    judge({ status: 2, stderr: `unknown flag ${BOGUS}` }).named === true
    && judge({ status: 2, stderr: "usage: ..." }).named === false);

  // ── The part that matters: run two REAL scripts, one guarded and one not. ──
  const dir = mkdtempSync(path.join(tmpdir(), "flag-guard-"));
  try {
    const cliPath = path.join(ROOT, "local-net", "lib", "cli.mjs").replace(/\\/g, "/");
    const unguarded = path.join(dir, "unguarded.mjs");
    writeFileSync(unguarded, [
      "const argv = process.argv.slice(2);",
      "if (argv.includes('--drill')) console.log('drill');",
      "console.log('PASS');",
      "process.exit(0);",
    ].join("\n"));

    const guarded = path.join(dir, "guarded.mjs");
    writeFileSync(guarded, [
      `import { guardEntry } from ${JSON.stringify(`file:///${cliPath}`)};`,
      "guardEntry(import.meta.url, ['--drill']);",
      "console.log('PASS');",
    ].join("\n"));

    const run = (file) => {
      const r = spawnSync(process.execPath, [file, BOGUS], { encoding: "utf8", timeout: 30_000 });
      return { ...judge(r), status: r.status };
    };

    const before = run(unguarded);
    ok("🔴 a script written the OLD way prints PASS and exits 0 on a flag it never heard of",
      before.status === 0 && before.verdict === "SILENT",
      `got exit ${before.status} (${before.verdict}) — if this stops being true, the fixture stopped reproducing the bug`);

    const after = run(guarded);
    ok("the same script with guardEntry exits 2 instead",
      after.status === 2 && after.ok === true, `got exit ${after.status} (${after.verdict})`);

    // The guard must not fire on a flag the script DID declare.
    const good = spawnSync(process.execPath, [guarded, "--drill"], { encoding: "utf8", timeout: 30_000 });
    ok("and a declared flag still runs through — the guard is not just refusing everything",
      good.status === 0 && good.stdout.includes("PASS"), `got exit ${good.status}`);

    // Imported rather than run: the guard must stay silent, or every library-shaped gate breaks.
    const importer = path.join(dir, "importer.mjs");
    writeFileSync(importer, [
      `await import(${JSON.stringify(`file:///${guarded.replace(/\\/g, "/")}`)});`,
      "console.log('IMPORTED');",
    ].join("\n"));
    const imported = spawnSync(process.execPath, [importer, BOGUS], { encoding: "utf8", timeout: 30_000 });
    ok("🔴 importing a guarded gate does NOT kill the importer over the importer's own flags",
      imported.status === 0 && imported.stdout.includes("IMPORTED"),
      `got exit ${imported.status} — a guard that fires on import would take gday-preflight down with it`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }

  // ── The gate list must not quietly shrink. ──
  const gates = gateList();
  ok(`the gate list is populated (${gates.length} gates)`, gates.length >= 40, `only ${gates.length}`);
  ok("check-flag-guards does not audit itself into the list", !gates.some((g) => g.endsWith("check-flag-guards.mjs")));
  ok("the two gates that measured green on 2026-09-08 are both covered",
    gates.includes("scripts/check-chain-ledger.mjs") && gates.includes("scripts/check-net-dirs.mjs"));

  console.log(failures === 0
    ? "\n✅ PASS — the rules are right, and an unguarded script really does go green."
    : `\n🔴 FAIL — ${failures} case(s).`);
  return failures === 0 ? 0 : 1;
}

process.exitCode = process.argv.includes("--self-test") ? selfTest() : main();
