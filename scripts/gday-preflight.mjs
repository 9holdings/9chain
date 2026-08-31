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
// 🔴 The server's address has ONE declaration. Even a manual-task STRING that spells it out is
// a second copy, and check-single-source is right to say so: the day this host moves, a hand
// note that still names the old machine is worse than no note - people trust the runbook.
import { SSH_HOST } from "../local-net/lib/server.mjs";

const SERVER_IP = SSH_HOST.split("@").pop();

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const NO_NETWORK = argv.includes("--no-network");

// Tree of the current fork. Hard rule #3. Changing this number is a DECISION, not an
// update: it changes only together with a full regeneration of the whole patch set.
const TREE_FORK = "60a61707f7974a0f1853b8bf78df7d0fdc1ef863";
const PATCH_COUNT = 26;
// 🔴 This tree's counter-check: applying **25/26** must yield `f2b9486b`.
//
// Why the anchor moved (2026-08-30, the g1 rehearsal). `A1Gen` lives INSIDE the patch set
// (patch 0018), so bumping the generation is not "editing three lines of Go" — it is editing
// `patches/`, which by hard rule #3 means regenerating the WHOLE set and moving both tree
// constants with it. Bumping only the working tree would build a correct G-day image while
// the published `patches/` still carried `A1Gen 0`: an outsider replaying them gets a binary
// of the DEAD generation and cannot join, and this very gate stays GREEN throughout, because
// it compares the patch set against a constant pasted into this file. That is the
// "measured the wrong quantity" class, one layer up. Recorded as G-8.
//
// The counter-check keeps its independent origin: `f2b9486b` is the tree the fork stood on
// through 2026-08-28/29 — verified repeatedly, and NOT a number produced by this bump. The
// old anchor `074aaa93` (the tree the running g0 image was built on) retires with the g0
// generation; it is kept in DECISIONS.md, not here, because a G-day gate must anchor to the
// generation it is gating.
const TREE_BEFORE_LAST = "f2b9486b71ad53b584a86f77d6017c34d74e6fa6";

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
  // 🔴 THE SIX COUNTER-CHECKS BELOW EXISTED AND WERE NOT WIRED IN — measured 2026-08-31.
  //
  // Until this line the preflight ran 7 of the 15 `--self-test` suites in the repo. That gap is
  // not cosmetic: `check-net-dirs --self-test` was **RED**, and had been red since the `A1Gen`
  // 0 -> 1 bump on 2026-08-30, because one of its controls hard-coded `999999998` as "the NEXT
  // generation" and that literal became the LIVE networkID at the bump. Nobody saw it, because
  // the one command that is supposed to be the whole runbook did not run it.
  //
  // That is the D-124 shape at one more remove: D-124 fixed two gates that were blind at the
  // generation they guard; the gate that proves `check-net-dirs` can tell a live generation
  // from a dead one was blind in the same way, and additionally invisible.
  //
  // Rule going in with them: a `--self-test` that exists and is not wired here is a
  // counter-check nobody will notice breaking. If it is cheap and offline, it belongs here.
  { group: "2 · REPO GATES", name: "net* generation banding (counter-check)", ...node("scripts/check-net-dirs.mjs", "--self-test") },
  { group: "2 · REPO GATES", name: "fund-key leak detection (counter-check)", ...node("scripts/check-key-leaks.mjs", "--self-test") },
  { group: "2 · REPO GATES", name: "keys-hold-real-money (counter-check)", ...node("scripts/check-keys-on-chain.mjs", "--self-test") },
  { group: "2 · REPO GATES", name: "single-source detection (counter-check)", ...node("scripts/check-single-source.mjs", "--self-test") },
  { group: "2 · REPO GATES", name: "Block Adam offset picking (counter-check)", ...node("scripts/check-clock-skew.mjs", "--self-test") },
  // EIP-55 sits on the product path: it is what stops a mistyped admin address from becoming
  // an L1 nobody owns, and genesis is immutable.
  { group: "2 · REPO GATES", name: "EIP-55 address parsing (counter-check)", ...node("local-net/lib/eip55.mjs", "--self-test") },
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
  // B-18 closed 2026-08-29 (D-120): the three stale filenames were shredded after proving the
  // renamed twins hold the same data (chainIds 47/47, names 53/53, taken 56/56). A manual task
  // that stays on the list after it is done trains people to skim the list.
  ["BEFORE touching anything", "🔴 **B-19** — move `chain-factory-key.txt` (real money) out of the dead-generation directories BEFORE any cleanup. `node scripts/check-net-dirs.mjs`."],
  ["BEFORE `down -v`", "🔴 **O2** — run `node scripts/export-chain.mjs`, then **publish the sha256 SOMEWHERE ELSE** before deleting. That ordering IS the entire value of the procedure (the 2026-08-26 run missed it)."],
  // The step between `--pull` and `--compact` was missing, and it is the one that feeds the
  // gate the console actually enforces across generations.
  ["BEFORE `down -v`", "🔴 **Chain directory — THREE commands, in this order.** (1) `node scripts/close-ledger-before-regenesis.mjs --pull` pulls the LIVE ledger off the server and archives any record the repo has never seen. (2) 🔴 `node scripts/gen-chainid-issued.mjs --write` — **without this the pull achieved nothing**: `chainid-issued.json` is the cross-generation block-list the console enforces, and `--pull` only prints a reminder that omits `--write`. (3) `--compact` to fold `chains` into `retired`. Then **re-run this preflight**: its `gen-chainid-issued --check` gate runs BEFORE the pull in the normal order, so it cannot catch a ledger that grew afterwards. Both `console-chains.json` AND `chainid-issued.json` must reach the server. ⚠️ Chain creation has been OPEN since 2026-08-31, so records created by real users in these last days exist ONLY on the server until step (1) runs. Resetting instead hands 43 names + chainIds back into circulation."],
  ["BEFORE `down -v`", "🔴 **H-6b** — `bash scripts/h6b-backup.sh`, and read the patch count it reports carefully."],
  // The three orphan `heartbeat-*` files on the server have NO source anywhere in this repo
  // (grep 2026-08-29: only DECISIONS.md/HANDOFF.md, i.e. the record of the finding itself).
  // Whatever writes them survives `down -v` and would then be writing against a DEAD chain
  // with a dead-generation wallet — and the evidence of what it was disappears with the network.
  ["BEFORE `down -v`", "🔴 **The `heartbeat-*` orphans** — find what writes them and STOP it before the old network is gone; afterwards the trail is gone too. 🔴 Do **not** silence this by declaring them in `knownExtra`: `manifest-deploy.json` `_extraDeleted` says why — declaring a file nobody understands is blindfolding the gate. See `docs/GDAY-G1-GAPS.md` G-6."],
  ["While generating the network", "🔴 **NINE nodes — the Hetzner box REPLACES an OVH node, it is not a tenth.** Generate with `N=9 A1_P2P_MODE=ipv4port A1_PUBLIC_IP=" + SERVER_IP + "` and the DEFAULT staking port base. ⚠️ Both halves reversed a decision on 2026-08-30, each for a measured reason. **N:** self-bond is a fixed total `8,999,991 = 9 × 999,999`, so only N=9 gives every node the nine-nines — D-046 said so on 2026-08-27 and D-122 overrode it without noticing; netgen warns on EVERY N=10 run and the warning was being read past. **Port base:** the `9660` collision that motivated `A1_STAKING_PORT_BASE=9700` **does not exist** — measured 2026-08-30, node10 carried `--staking-port=9660` but netgen publishes a staking port for the BEACON ONLY, so that 9660 lives in the container's own namespace while host 9660 is node2's API; ten nodes came up with a full mesh at the default base. Keeping 9651 also keeps the already-open `ufw` rule and the port the public docs already name."],
  ["While generating the network", "🔴 **Bring up only node1..node8 on OVH**, then carry `node9/{staker.key,staker.crt,signer.key}` to the Hetzner box and run it there with **its own** `--public-ip=95.217.60.140` and `--bootstrap-ips=" + SERVER_IP + ":9651` (the beacon's PUBLIC address — node9 is on another machine, so the internal address netgen writes is wrong for it). Delete that box's old `--data-dir` first: it holds the g0 database and a self-generated identity, and leaving it means the node comes up under the wrong nodeID. 🔴 **Then measure the nodeID it reports against `genesis.json`** — that is what proves the identity took."],
  ["While generating the network", "🔴 **The compose acceptance check — the OLD one was WRONG and would make you break a correct network.** `docs/GDAY-NODE10-HETZNER.md` said `grep -c -- \"--public-ip=<IP>\" … # phải là 10`. Measured 2026-08-30: it is **1**, and **1 is correct** — netgen deliberately lets ONLY the beacon announce the public address (patch 0024 / D-089); the other nodes keep internal addresses because Docker does not hairpin, and its own drill showed a full-mesh design collapsing into a star when every node announced the public IP. ⇒ The right check is: `--public-ip=" + SERVER_IP + "` appears **exactly 1** time, and `--public-ip=` appears **N** times."],
  ["While generating the network", "🔴 **Bump `A1Gen` in BOTH languages** — `utils/constants/network_ids.go` (**three** lines: `A1Gen`, `A1Name`, `A1NameTap`) **and** `local-net/lib/chainid.mjs` (`A1_GEN`), then re-run `check-consistency`. Forget the Go side and netgen stops with a FATAL; forget the JS side and **nothing reports an error** (D-093)."],
  ["While generating the network", "🔴 **The `A1Gen` bump is an edit to `patches/` — REGENERATE THE WHOLE SET.** `A1Gen` is declared inside patch 0018, so bumping it in the working tree alone builds a correct G-day image while the PUBLISHED patch set still says `A1Gen 0`: an outsider replays 26 patches, builds a binary of the dead generation, and cannot join — while this preflight's fork-tree gate stays GREEN the whole time, because it only compares `patches/` against a constant in this file. Condition 4 of 2026-09-01 (*\"a stranger rebuilds the fork tree to the same tree hash\"*) also stays green. ⇒ `git format-patch --no-signature 1cf1fc3..9chain-a1`, then move BOTH `TREE_FORK` and `TREE_BEFORE_LAST` at the top of this file. Rehearsed 2026-08-30: 25 → 26 patches, the 25 older ones changed only their `[PATCH nn/NN]` counter line (50 changed lines, 0 of them content)."],
  // Added 2026-08-31. netgen prints `A1_CONFIG_DIR` and states it CANNOT check it (it resolves
  // on the host, netgen runs in a container). Nothing in this list said to set it, and the
  // default is wrong for the server's layout — which breaks chain creation, not the node.
  ["While generating the network", "🔴 **Set `A1_CONFIG_DIR` and `A1_HTTP_ALLOWED_HOSTS` EXPLICITLY when running netgen.** `A1_CONFIG_DIR` defaults to `../../9chain-a1-config`, resolved from the directory holding the compose file — on the server that is `~/9chain-a1/net/`, so the default points at `/home/ubuntu/9chain-a1-config`, which does not exist. Docker then creates an empty directory and mounts it read-only: the node comes up **9/9 green**, but the console writes each L1 genesis to the host and tells the CLI to read `/9chain-a1/config/console-tmp/<file>` — so **every chain creation dies at step 2**, and `--chain-config-dir` is empty so the Warp API never turns on for any L1. netgen CANNOT verify this value (it resolves on the host) and says so; that makes it a manual task, not a gate. ⇒ `A1_CONFIG_DIR=/home/ubuntu/9chain-a1/src/9chain-a1-config` and `A1_HTTP_ALLOWED_HOSTS=localhost,127.0.0.1` (correct because Caddy rewrites the Host header — `header_up Host {upstream_hostport}`; a public hostname here would be redundant, and `*` is refused for the real band)."],
  // The engraving manifest lives on the HOST; netgen reads it INSIDE a container.
  ["While generating the network", "🔴 **The engraving manifest must be addressed as `/repo/...`** — `gen-network.sh` mounts the repo root read-only at `/repo` and now REFUSES any `A1_ENGRAVE` path outside `/repo`, `/out` or `/src`. Until 2026-08-31 it mounted only the fork and the output directory, so the command written in `docs/GDAY-ENGRAVING.md` (a bare host path) could not open the file — and no generated `net*/` directory in this repo holds the `engraving.md` netgen emits whenever engraving is on, i.e. that documented path had never once completed. It fails before generating a single key, so it costs time, not correctness — but the time is G-day time."],
  ["While generating the network", "🔴 **Rebuild the node image** — the running image is **18 patches**, the repo is **25**. Patches 0019/0022 (the `LOVE9` alias) are not in the image; without them **every X/C wallet goes silent**. The build path was rehearsed 2026-08-28 and PASSED (D-105) — but at `A1Gen 0`; bumping to 1 changes the binary ⇒ **it still must be rebuilt**."],
  ["While generating the network", "🔴 **FIX THE `image:` LINE IN THE COMPOSE NETGEN JUST WROTE** — netgen hardcodes `9chain-a1/node:dev` and **no variable can change it** (D-105). Forgetting means the network comes up on the **18-patch** binary while every gate stays green: `grep image: <net>/docker-compose.multinode.yml` must show **the tag you just built**."],
  // The acceptance below demands a `commit=` string that NOTHING in this repo tells you how to
  // produce. `A1_COMMIT` appears in exactly one place — `local-net/Dockerfile:24` — with the
  // default `9chain-a1-poc`. Measured 2026-08-31: zero docs, zero scripts, zero manual tasks
  // mention `--build-arg`. So the criterion was unsatisfiable from the runbook, and worse:
  // `commit=` is the ONLY thing that tells a g1 image from a g0 one at runtime, because netgen
  // hardcodes `image: 9chain-a1/node:dev` into the compose (gotcha 16).
  ["While generating the network", "🔴 **Build the image WITH `--build-arg A1_COMMIT=`** — otherwise the binary self-declares `9chain-a1-poc` (the Dockerfile default) and the acceptance line below cannot be satisfied. Use the same shape the g1 rehearsal produced: `docker build -f local-net/Dockerfile --build-arg A1_COMMIT=9chain-a1-g1-<N>patch-<treeprefix> -t 9chain-a1/node:g1 .` — the tree prefix is `TREE_FORK` at the top of this file. `commit=` is the only runtime discriminator between the g0 and g1 images, so a wrong or default value makes the next task unable to tell them apart."],
  ["While generating the network", "🔴 **Measure the BINARY, not the network:** `docker exec <node> ./avalanchego --version` must print the `commit=` of the G-day build, and `avm.getAssetDescription` must resolve the `LOVE9` alias while `AVAX` must be **RED for a stated reason**. A green network says nothing about which binary the node is running."],
  ["While generating the network", "🔴 **Generate NEW token + keys** — `A1_CONSOLE_TOKEN`, `FAUCET_PK`, `A1_CLI_KEY`. The old token **was never rotated across two re-genesis runs** (gotcha 15)."],
  // MEASURED IN THE 2026-08-31 DRILL. netgen's C1 comparison does NOT catch the failure its own
  // error message describes. `engrave.go` ties a hash with `Contains(line, base) || Contains(line, id)`
  // where `base = filepath.Base(d.File)` — and `file` is the exact field a mis-tie changes, so the
  // OR is satisfied by the filename alone and `id`/`lang` are never checked against anything.
  // Drill: pointing `drill-charter-he` at the English document still printed
  // `✓ khac chu: 3/3 tai lieu khop ban dong bang cua C1 (hash VA ten tep)`.
  ["While generating the network", "🔴 **READ THE PRINTED DOCUMENT TABLE BEFORE CONFIRMING — the C1 gate does NOT verify which document is which.** netgen prints one row per document (`id · lang · surface · sha256`). Two rows carrying the SAME sha256, or a row whose `lang` does not match the document you expect under that `id`, means the manifest has tied an id to the wrong file — and netgen will still print `✓ khac chu: N/N … (hash VA ten tep)`, because it matches the hash against the FILE NAME in the manifest, which is the very field a mis-tie changes (measured 2026-08-31). The only thing standing between that and a permanent wrong engraving is `A1_ENGRAVE_CONFIRM`, and only if the fingerprint was computed BEFORE the mistake: a mis-tie changes the fingerprint, so **never re-confirm with a freshly printed fingerprint just because the run asked for one**. Hardening this means editing `patches/`; deferred past G-day."],
  ["While generating the network", "🔴 **The engraving** — the mechanism is 100% done. The CONTENT is an **input David supplies** (D-104: C1 is coordinated separately; A1 does not track it). ⚠️ Bytes arriving **after** the genesis step **can never be engraved in that generation** — get David to freeze the bytes BEFORE running netgen, not after."],
  ["AFTER the network is up", "🔴 Measure **on the running node**: `supplyCap` · `networkID` · HRP · `eth_chainId` · 9/9 nodes. `node scripts/watch-network.mjs`."],
  ["AFTER the network is up", "🔴 **The Hetzner node is genuinely IN, measured on the chain** — `platform.getCurrentValidators` must list **9**, a NON-beacon node must see it in `info.peers`, and its `endTime` must sit in the same window as the other eight (it does so by construction when the node is in genesis: the window is 56 days at N=9, one node every 7 days — measured 2026-08-30). ⚠️ **Give the mesh time before concluding**: in that drill the outside node bootstrapped at ~50s but a NON-beacon node only saw it at ~70s. Judging at 30s reads as a failure that is not there. Then watch `ingressConnectionCount` on it for at least an hour: on 2026-08-29 it stayed **0** while the port was provably reachable, and avalanchego cannot tell 'nobody dialled in' from 'unreachable' — but validator uptime is measured over connections, so a lasting 0 is real (D-121)."],
  // Condition 2 of 2026-09-01 is *"g1 is alive AND the engraving reads back"*. Nothing in this
  // list used to name the tool that answers the second half.
  ["AFTER the network is up", "🔴 **`engrave-verify` against the LIVE chain** — `docker run … engrave-verify --genesis <g1>/genesis.json --rpc https://rpc-a1.9chain.org --checksums <C1 freeze>`. This is the only acceptance for **condition 2**. 🔴 It MUST print a `[5] Mang dang chay` section: without `--rpc` the tool exits **0** having touched no chain at all, and a green run that proves only *\"the file has an engraving\"* is not the claim being made. The binding evidence for the C1 comparison is netgen's own line at generation time (`✓ khac chu: N/N tai lieu khop ban dong bang cua C1 (hash VA ten tep)`) — `engrave-verify`'s section [3] is the WEAKER check (`strings.Contains`, hash anywhere in the file, not tied to the document), so do not read a green [3] as an independent second opinion. Hardening it means editing `patches/`; deliberately deferred until after G-day."],
  // The three gates below carry constants that belong to the generation being replaced.
  ["AFTER the network is up", "🔴 **Re-point the generation-anchored constants, or three gates measure the DEAD generation.** (a) `scripts/watch-network.mjs` → add the new `chain-factory` P-address to `VI_FACTORY_THEO_THE_HE` keyed by the new `A1Gen`; until then that item reports **COULD NOT MEASURE (exit 2)** on purpose — it used to default to the g0 address, which answers `unlocked: \"0\"` rather than erroring, i.e. red for the wrong reason while the wallet that pays for every chain creation went unmeasured. (b) `scripts/check-key-leaks.mjs` picks up `9chain-a1-keys/g<N>/keys.txt` automatically once the directory exists, but the NEW `chain-factory` key file must be added to `discoverFundSets()` — it is the seventh fund and lives outside `keys.txt` (D-117b). (c) `scripts/o1-check.mjs --self-test` pins `--live-set` to the g0 store; pass the new one."],
  ["AFTER the network is up", "🔴 **B-13(b)** — measure clock skew across the 9 nodes, then pick `--offset-ms` for Block Adam. Only possible once g1 is up, and **must be done before 2026-09-09**."],
  // B-20: the two most recent backup bundles hold ZERO identity files. H-6b measures the
  // backup by PATCH COUNT, and a correct patch count over empty content is still a useless
  // backup — the same "measured the wrong quantity" class, one layer down.
  ["AFTER the network is up", "🔴 **B-20** — back up the **nine** validator identities of g1 (`staker.key`, `staker.crt`, `signer.key`) together with `genesis.json` and the compose file. Verify by **COUNTING the files inside the bundle**, not by reading a `--check` line. 🔴 Do not store them beside the fund keys: `check-key-leaks.mjs` watches fund keys, it does **not** watch validator identities. Regenerating the network regenerates these, so today's copy does not count."],
  ["AFTER deploying", "🔴 `node scripts/check-deploy-drift.mjs` — **run this before believing any line that says \"CLOSED\"**."],
  ["AFTER deploying", "🔴 **READ THE CONSOLE'S ENVIRONMENT ON THE SERVER — no gate can do it for you.** `check-deploy-drift` compares FILES; the console's behaviour also comes from `~/9chain-a1/console.env`, which no gate reads. Measured 2026-08-31: `A1_PUBLIC_RPC_BASE` had been pointing at `rpc-testnet-a1.9chain.org` — the RETIRED hostname, which answers **525** — and that is the value the console pastes into the RPC URL it hands the person who just created a chain. Their chain runs; the address they are given never connects. Repo correct, files matching, every gate green. ⇒ Check by NAME: `A1_PUBLIC_RPC_BASE` (live hostname), `A1_DE_CHAIN_MO`, `A1_CONSOLE_TOKEN`/`FAUCET_PK`/`A1_CLI_KEY` (all three regenerated for g1). 🔴 Print variable NAMES only, never values — a pattern-based filter missed `A1_CLI_KEY` on 2026-08-31 and leaked a live key (D-130)."],
  // "Generate NEW token + keys" above stops at the word *generate*. Generating them and leaving
  // the server on the old ones is exactly B-14's shape: closed in the repo, open where users are.
  ["AFTER deploying", "🔴 **Ship the new token and keys** — `A1_CONSOLE_TOKEN`, `FAUCET_PK`, `A1_CLI_KEY` must reach the server, and the console there must be the **bumped** build (g1 issues chainIds in `9001000000–9001999999`, a different block from g0). ⚠️ The faucet needs `docker rm -f` then `docker run`: `docker restart` does **NOT** reload env (gotcha 3) and the faucet keeps a dead-generation key while looking healthy."],
  ["AFTER deploying", "🔴 **Publish `genesis.json` + bootstrap** (nodeID and the beacon's PUBLIC `IP:port`) through the **public repo** — not through `web/`, which belongs to another live worktree (hard rule #4). Without both, an outsider cannot join, and 2026-09-01 is a public RPC rather than a public testnet — which is then what it must be called."],
  ["AFTER deploying", "🔴 **The public surfaces still print the dead generation** — `main:web/lib/chain.ts` declared `networkId: 9001` when measured 2026-08-28, two generations stale, and C/X `blockchainID`s are a function of the genesis bytes, so **every one of them dies with this re-genesis**. A1 does not touch `web/` or 9Scan-A1: tell those worktrees, then MEASURE what the public page actually prints."],
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
    // drifted. The N−1 check anchors to a tree with an **independent origin**: `f2b9486b`
    // is the tree the fork stood on through 2026-08-28/29, verified repeatedly and NOT
    // produced by the bump this file now gates. Two independent anchors say something.
    // (Hard rule #2: a gate never seen red for the right reason is not yet a gate.)
    //
    // ⚠️ This paragraph named `074aaa93` until 2026-08-31 — the tree the g0 IMAGE was built
    // on — while the constant twelve lines up had already moved to `f2b9486b`. The header of
    // this file retired `074aaa93` with the g0 generation and this comment did not follow.
    // A stale comment inside a gate is read on the day the gate finally matters.
    git(["am", "--keep-cr", ...patches.slice(0, PATCH_COUNT - 1).map((f) => path.join(ROOT, "patches", f))], w);
    const treeBefore = git(["rev-parse", "HEAD^{tree}"], w).trim();
    if (treeBefore !== TREE_BEFORE_LAST) {
      return {
        code: 1,
        detail: `counter-check ${PATCH_COUNT - 1}/${PATCH_COUNT}: tree ${treeBefore.slice(0, 12)} ≠ ${TREE_BEFORE_LAST.slice(0, 12)} — the patch set drifted IN THE MIDDLE`,
      };
    }
    git(["am", "--keep-cr", path.join(ROOT, "patches", patches[PATCH_COUNT - 1])], w);
    const tree = git(["rev-parse", "HEAD^{tree}"], w).trim();
    if (tree !== TREE_FORK) {
      return { code: 1, detail: `tree ${tree.slice(0, 12)} ≠ ${TREE_FORK.slice(0, 12)} — the fork tree DRIFTED` };
    }
    return { code: 0, detail: `${PATCH_COUNT} patches → tree matches · counter-check ${PATCH_COUNT - 1}/${PATCH_COUNT} → ${TREE_BEFORE_LAST.slice(0, 8)} ✓` };
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
