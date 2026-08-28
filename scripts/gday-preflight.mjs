#!/usr/bin/env node
/**
 * gday-preflight.mjs — **the G-day runbook, in runnable form.**
 *
 * ═══ WHY IT EXISTS ═══
 *
 * As of 2026-08-28 the G-day runbook lived scattered across FIVE documents
 * (`GDAY-A1-REMAINING.md`, `PLAN-REGENESIS-2026-09-01.md`, `GDAY-ENGRAVING.md`,
 * `O2-EXPORT-BEFORE-DELETE.md`, `HANDOFF.md`) and **none of it could be executed**.
 * A procedure that exists only as prose is a procedure carried out from memory, on the one
 * day the operator is busiest and has slept least.
 *
 * G-day is a **one-shot**: genesis is immutable, and the hard slip floor is 2026-09-06
 * (after that, Block Adam at 2026-09-09T06:09:09Z passes before the chain is even alive).
 *
 * ═══ 🔴 THE MOST IMPORTANT RULE IN THIS FILE ═══
 *
 * **Anything not yet automated is printed as a MANUAL TASK — never faked green.**
 * A preflight that prints "all clear" while the three most consequential steps are untouched
 * is not a gate, it is a **forged certificate**. The MANUAL TASKS block below is always
 * shown, always an empty checkbox, and is **never** counted as passing.
 *
 * ═══ EXIT CODES ═══
 *   0  every REQUIRED gate is green   (MANUAL TASKS still stand — read them)
 *   1  a required gate is RED
 *   2  a gate **could not run** — *unknown* is NOT *passed*
 *
 * Usage:
 *   node scripts/gday-preflight.mjs
 *   node scripts/gday-preflight.mjs --no-network    # skip every gate needing network/ssh
 */
import { spawnSync, execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const NO_NETWORK = argv.includes("--no-network");

// Tree of the current fork. Hard rule #3. Changing this number is a DECISION, not an
// update: it changes only together with a full regeneration of the whole patch set.
const TREE_FORK = "f2b9486b71ad53b584a86f77d6017c34d74e6fa6";
const PATCH_COUNT = 25;
// 🔴 This tree's counter-check: applying **24/25** must yield `074aaa93` — precisely the
// tree the RUNNING NODE IMAGE was built on. Patch 0025 only renames the legacy key-recovery
// tool to `check-keys` and fixes a comment citing a removed flag; it does NOT touch the node.
// (Its former name is in that patch's own filename and in DECISIONS.md D-108.)
const TREE_BEFORE_0025 = "074aaa9327be70103b25d5a3873d41cacd431652";

const node = (...a) => ({ cmd: process.execPath, args: a });

/**
 * A gate. `needsNetwork` = requires network or ssh (skippable with `--no-network`).
 *
 * 🔴 **EVERY GATE HERE IS REQUIRED — red blocks.** There is no "informational" tier.
 * (An older comment documented a `batBuoc` flag allowing red-but-not-blocking; that flag was
 * **never implemented** — discovered 2026-08-28. Documentation describing behaviour that does
 * not exist is exactly the failure class netgen hit in D-083. The promise was removed rather
 * than implemented: a gate that is "red but fine" gets ignored **at the moment it finally
 * matters** — the same reasoning D-070 used when demoting the Block Adam item to a note.)
 * ⇒ A gate not yet fit to block G-day belongs **outside this file**, listed in `CLAUDE.md` §3
 * — for example `check-robots.mjs` (B-10: web surface, does not touch genesis).
 */
const GATES = [
  // ── 1. The fork tree: what everything else is built on ──
  { group: "1 · FORK TREE", name: `replay ${PATCH_COUNT} patches → tree ${TREE_FORK.slice(0, 8)}`, custom: replayFork },

  // ── 2. Repo gates — cheap, offline, run first so failures surface early ──
  { group: "2 · REPO GATES", name: "tokenomics arithmetic + Go↔JS identifiers", ...node("scripts/check-consistency.mjs", "--self-test") },
  { group: "2 · REPO GATES", name: "chainId issuance (chainid-test)", ...node("local-net/console/chainid-test.mjs") },
  { group: "2 · REPO GATES", name: "cb58 self-test", ...node("local-net/lib/cb58.mjs", "--self-test") },
  { group: "2 · REPO GATES", name: "issued-chainId ledger matches its sources", ...node("scripts/gen-chainid-issued.mjs", "--check") },
  { group: "2 · REPO GATES", name: "console GENERATION gate (generation-test)", ...node("local-net/console/generation-test.mjs") },
  { group: "2 · REPO GATES", name: "orphan-file classification (counter-check)", ...node("scripts/check-deploy-drift.mjs", "--self-test") },
  { group: "2 · REPO GATES", name: "chain-directory compaction (counter-check)", ...node("scripts/close-ledger-before-regenesis.mjs", "--self-test") },
  { group: "2 · REPO GATES", name: "network-watch scoring (counter-check)", ...node("scripts/watch-network.mjs", "--self-test") },
  // O2 evidence bundles must still verify themselves. Placed here because O2 is a MANUAL
  // TASK of G-day itself — discovering a broken bundle while running the runbook is too late.
  { group: "2 · REPO GATES", name: "evidence bundles match byte for byte", ...node("scripts/check-evidence.mjs") },
  { group: "2 · REPO GATES", name: "evidence gate knows how to go red (counter-check)", ...node("scripts/check-evidence.mjs", "--self-test") },
  // One constant, ONE place it is declared (D-113).
  { group: "2 · REPO GATES", name: "no constant has a second copy", ...node("scripts/check-single-source.mjs") },
  // Language rule (CLAUDE.md §0, decided 2026-08-28): new code must be English; existing
  // debt may only shrink. Included in the G-day run because that is the most rushed moment,
  // and rushing is exactly when someone types a non-English comment into a new file.
  { group: "2 · REPO GATES", name: "source code is English only (ratchet)", ...node("scripts/check-english-code.mjs") },
  // The L1 genesis TEMPLATE still carries chainId 9100 and the public ewoq key. Nothing may
  // ship it raw; this gate proves the builder still strips all three (D-114).
  { group: "2 · REPO GATES", name: "L1 genesis builder strips the template defaults", ...node("scripts/make-l1-genesis.mjs", "--self-test") },

  // ── 3. The real world — the running network and the server ──
  { group: "3 · REAL WORLD", needsNetwork: true, name: "the running network (watch-network)", ...node("scripts/watch-network.mjs") },
  { group: "3 · REAL WORLD", needsNetwork: true, name: "repo ↔ server drift + orphan files", ...node("scripts/check-deploy-drift.mjs") },
  // This one measures REAL MONEY on chain, so it belongs to group 3, not to the repo gates:
  // the `--offline` variant answers only half the question and exits 2 (INCONCLUSIVE) — which
  // is honest, but a G-day gate that says "inconclusive" is unusable. Blocks the
  // "just delete the dead directories" trap right before the cleanup step.
  { group: "3 · REAL WORLD", needsNetwork: true, name: "net* directories — generation + REAL MONEY", ...node("scripts/check-net-dirs.mjs") },
  {
    group: "3 · REAL WORLD", needsNetwork: true,
    name: "G4 · public chainId registry (MUST be re-checked right before genesis)",
    ...node("scripts/check-chainid.mjs"),
  },
];

/**
 * 🔴 MANUAL TASKS — cannot be automated, and **never counted as passing**.
 * The order here IS the execution order; several items are only correct before `down -v`.
 */
const MANUAL_TASKS = [
  ["BEFORE touching anything", "🔴 **B-16** — second copy of the fund key set: `node scripts/o1-check.mjs <dir>` must exit **0**. Blocks GO/NO-GO."],
  ["BEFORE touching anything", "🔴 **B-18** — delete the 3 OLD filenames still on the server after the 2026-08-28 rename. Command in `BLOCKERS.md`."],
  ["BEFORE touching anything", "🔴 **B-19** — move `chain-factory-key.txt` (real money) out of the dead-generation directories BEFORE any cleanup. `node scripts/check-net-dirs.mjs`."],
  ["BEFORE `down -v`", "🔴 **O2** — run `node scripts/export-chain.mjs`, then **publish the sha256 SOMEWHERE ELSE** before deleting. That ordering IS the entire value of the procedure (the 2026-08-26 run missed it)."],
  ["BEFORE `down -v`", "🔴 **Chain directory** — `node scripts/close-ledger-before-regenesis.mjs --pull` then `--compact`; the new ledger must reach the server. Resetting it hands 43 names + chainIds back into circulation."],
  ["BEFORE `down -v`", "🔴 **H-6b** — `bash scripts/h6b-backup.sh`, and read the patch count it reports carefully."],
  ["While generating the network", "🔴 **Bump `A1Gen` in BOTH languages** — `utils/constants/network_ids.go` **and** `local-net/lib/chainid.mjs`, then re-run `check-consistency`. Forget one side and nothing reports an error (D-093)."],
  ["While generating the network", "🔴 **Rebuild the node image** — the running image is **18 patches**, the repo is **25**. Patches 0019/0022 (the `LOVE9` alias) are not in the image; without them **every X/C wallet goes silent**. The build path was rehearsed 2026-08-28 and PASSED (D-105) — but at `A1Gen 0`; bumping to 1 changes the binary ⇒ **it still must be rebuilt**."],
  ["While generating the network", "🔴 **FIX THE `image:` LINE IN THE COMPOSE NETGEN JUST WROTE** — netgen hardcodes `9chain-a1/node:dev` and **no variable can change it** (D-105). Forgetting means the network comes up on the **18-patch** binary while every gate stays green: `grep image: <net>/docker-compose.multinode.yml` must show **the tag you just built**."],
  ["While generating the network", "🔴 **Measure the BINARY, not the network:** `docker exec <node> ./avalanchego --version` must print the `commit=` of the G-day build, and `avm.getAssetDescription` must resolve the `LOVE9` alias while `AVAX` must be **RED for a stated reason**. A green network says nothing about which binary the node is running."],
  ["While generating the network", "🔴 **Generate NEW token + keys** — `A1_CONSOLE_TOKEN`, `FAUCET_PK`, `A1_CLI_KEY`. The old token **was never rotated across two re-genesis runs** (gotcha 15)."],
  ["While generating the network", "🔴 **The engraving** — the mechanism is 100% done. The CONTENT is an **input David supplies** (D-104: C1 is coordinated separately; A1 does not track it). ⚠️ Bytes arriving **after** the genesis step **can never be engraved in that generation** — get David to freeze the bytes BEFORE running netgen, not after."],
  ["AFTER the network is up", "🔴 Measure **on the running node**: `supplyCap` · `networkID` · HRP · `eth_chainId` · 9/9 nodes. `node scripts/watch-network.mjs`."],
  ["AFTER the network is up", "🔴 **B-13(b)** — measure clock skew across the 9 nodes, then pick `--offset-ms` for Block Adam. Only possible once g1 is up, and **must be done before 2026-09-09**."],
  ["AFTER deploying", "🔴 `node scripts/check-deploy-drift.mjs` — **run this before believing any line that says \"CLOSED\"**."],
];

/** Replay the fork tree in a detached worktree and compare trees. Cleans up in `finally`. */
function replayFork() {
  const fork = path.join(ROOT, "upstream", "avalanchego");
  if (!existsSync(fork)) return { code: 2, detail: "fork tree not found" };
  const w = path.join(tmpdir(), `a1-preflight-${process.pid}`);
  const git = (args, cwd) => execFileSync("git", args, { cwd, encoding: "utf8", timeout: 120_000 });
  try {
    try { rmSync(w, { recursive: true, force: true }); } catch { /* not there yet */ }
    git(["worktree", "add", "--detach", w, "1cf1fc3"], fork);
    const patches = execFileSync(process.execPath,
      ["-e", `const fs=require('fs');process.stdout.write(fs.readdirSync(${JSON.stringify(path.join(ROOT, "patches"))}).filter(f=>f.endsWith('.patch')).sort().join('\\n'))`],
      { encoding: "utf8" }).split("\n").filter(Boolean);
    if (patches.length !== PATCH_COUNT) {
      return { code: 1, detail: `found ${patches.length} patches, the hard rule says ${PATCH_COUNT} — regenerate the WHOLE SET or change the rule, do not append one` };
    }
    // ── Counter-check, RUN FIRST: applying N−1 patches must yield a known tree ──
    //
    // 🔴 Why this must be CODE and not a line of ritual in a document. A gate that only
    // "applies the whole set and compares to TREE_FORK" merely proves the patch set is
    // **self-consistent with the constant we just pasted into this file**. Anyone who
    // regenerates the set and pastes the new tree makes it green — even if the content
    // drifted. The N−1 check anchors to a tree with an **independent origin**: `074aaa93`
    // is the tree the RUNNING IMAGE was built on. Two independent anchors say something.
    // (Hard rule #2: a gate never seen red for the right reason is not yet a gate.)
    git(["am", "--keep-cr", ...patches.slice(0, PATCH_COUNT - 1).map((f) => path.join(ROOT, "patches", f))], w);
    const treeBefore = git(["rev-parse", "HEAD^{tree}"], w).trim();
    if (treeBefore !== TREE_BEFORE_0025) {
      return {
        code: 1,
        detail: `counter-check ${PATCH_COUNT - 1}/${PATCH_COUNT}: tree ${treeBefore.slice(0, 12)} ≠ ${TREE_BEFORE_0025.slice(0, 12)} — the patch set drifted IN THE MIDDLE`,
      };
    }
    git(["am", "--keep-cr", path.join(ROOT, "patches", patches[PATCH_COUNT - 1])], w);
    const tree = git(["rev-parse", "HEAD^{tree}"], w).trim();
    if (tree !== TREE_FORK) {
      return { code: 1, detail: `tree ${tree.slice(0, 12)} ≠ ${TREE_FORK.slice(0, 12)} — the fork tree DRIFTED` };
    }
    return { code: 0, detail: `${PATCH_COUNT} patches → tree matches · counter-check ${PATCH_COUNT - 1}/${PATCH_COUNT} → ${TREE_BEFORE_0025.slice(0, 8)} ✓` };
  } catch (e) {
    return { code: 2, detail: `could not replay: ${String(e.message).split("\n")[0].slice(0, 120)}` };
  } finally {
    try { git(["worktree", "remove", "--force", w], fork); } catch { /* already gone */ }
    try { rmSync(w, { recursive: true, force: true }); } catch { /* never mind */ }
  }
}

function run(gate) {
  if (gate.custom) return gate.custom();
  const r = spawnSync(gate.cmd, gate.args, { cwd: ROOT, encoding: "utf8", timeout: 240_000 });
  if (r.error || r.status === null) return { code: 2, detail: `could not run: ${r.error?.message || "timed out"}` };
  const out = `${r.stdout || ""}`.trim().split("\n").filter(Boolean);
  return { code: r.status === 0 ? 0 : r.status === 2 ? 2 : 1, detail: out[out.length - 1]?.slice(0, 96) ?? "" };
}

console.log(`\n╔═══ G-DAY PREFLIGHT ═══ ${new Date().toISOString()}`);
console.log(`║ fork tree: ${PATCH_COUNT} patches · tree ${TREE_FORK.slice(0, 8)}`);
if (NO_NETWORK) console.log("║ ⚠️  --no-network: network/ssh gates skipped — THEY DO NOT COUNT AS 'PASSED'");
console.log("╚" + "═".repeat(60));

let currentGroup = "";
let red = 0, cannotRun = 0, passed = 0, skipped = 0;
for (const gate of GATES) {
  if (gate.group !== currentGroup) { currentGroup = gate.group; console.log(`\n── ${currentGroup} ──`); }
  if (gate.needsNetwork && NO_NETWORK) { skipped++; console.log(`  ⏭️  ${gate.name}  — SKIPPED (not "passed")`); continue; }
  const { code, detail } = run(gate);
  if (code === 0) { passed++; console.log(`  ✓ ${gate.name}`); }
  else if (code === 2) { cannotRun++; console.log(`  🟡 ${gate.name}\n       COULD NOT RUN — ${detail}`); }
  else { red++; console.log(`  🔴 ${gate.name}\n       ${detail}`); }
}

console.log(`\n── 4 · 🔴 MANUAL TASKS — cannot be automated, NEVER counted as "passed" ──`);
let phase = "";
for (const [taskPhase, task] of MANUAL_TASKS) {
  if (taskPhase !== phase) { phase = taskPhase; console.log(`\n  【${phase}】`); }
  console.log(`   ☐ ${task}`);
}

console.log(`\n${"═".repeat(62)}`);
console.log(`  ${passed} passed · ${red} red · ${cannotRun} could not run · ${skipped} skipped · ${MANUAL_TASKS.length} manual tasks`);
const code = red ? 1 : cannotRun ? 2 : 0;
// 🔴 Printing "all gates green" after SKIPPING gates is a tidy lie. The skipped count must
// sit inside the verdict sentence itself, not on a line above that the eye has already passed.
const greenLine = skipped
  ? `\n🟡 ${passed} gates ran and are green — BUT ${skipped} were SKIPPED (--no-network).\n   Those measure the REAL WORLD; without them this run says nothing about the\n   running network or the server. Re-run WITHOUT --no-network before G-day.`
  : `\n✅ EVERY AUTOMATED GATE IS GREEN.`;
console.log({
  0: `${greenLine}\n   🔴 And the ${MANUAL_TASKS.length} MANUAL TASKS above are still nobody else's job — a green\n   preflight does NOT mean you are ready to generate the network.`,
  1: `\n🔴 A GATE IS RED — stop. Do not generate genesis while one line is red.`,
  2: `\n🟡 A GATE COULD NOT RUN — "unknown" is NOT "passed". Fix it and re-run.`,
}[code]);
process.exit(code);
