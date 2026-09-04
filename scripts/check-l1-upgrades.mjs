#!/usr/bin/env node
/**
 * check-l1-upgrades.mjs — for EVERY L1 in the ledger: does the `upgrade.json` on disk match what
 * each of the nine nodes actually loaded, and do the nine nodes agree with each other?
 *
 * ═══ THE HOLE THIS CLOSES ═══
 *
 * `POST /api/upgrade` compares disk against the node — but only for the chain being upgraded, and
 * only while someone is upgrading it. Nothing watches the other chains, and nothing watches any
 * chain afterwards. That is the same gap that let the public chain directory serve two dead g0
 * chains for two days (D-154): the file is written by the console, so `check-deploy-drift` puts it
 * out of scope on purpose, and no other gate knew it existed.
 *
 * The failure it prevents is quiet and expensive. A node reads `upgrade.json` ONCE, at start-up
 * (`plugin/evm/vm.go`), so:
 *
 *   · a file written but not rolled out leaves nodes on the old rules until they happen to restart
 *     — and then they change behaviour at a moment nobody chose;
 *   · a rollout that stopped at node k leaves k nodes on one rule set and 9-k on another, which is
 *     a consensus split waiting for the activation timestamp to arrive;
 *   · a file DELETED after activation leaves every running node correct and every future restart
 *     wrong.
 *
 * None of the three is visible from `/ext/health`, from the ledger, or from the console's own UI.
 *
 * ═══ 🔴 WHAT IT REFUSES TO CALL AGREEMENT ═══
 *
 * Nine nodes that all fail to answer agree perfectly. So a chain is only compared after every node
 * has been shown to SERVE it; a node that cannot answer for a chain is a finding, never a silent
 * pass. This is the §2 trap in its purest form — agreement among silence measures nothing.
 *
 * And the comparison is by SHAPE, not bytes (`upgradeShape` in `lib/l1-upgrade.mjs`): a node
 * echoes `adminAddresses` in lower case while the file carries EIP-55 checksum casing, so a byte
 * comparison would be red on every chain forever, which is a gate carrying no information (D-153).
 *
 * ═══ WHERE IT MEASURES ═══
 *
 * On the SERVER, over ssh, because that is where both quantities live: the shared config directory
 * mounted read-only into all nine nodes, and the nodes themselves. Reading the repo would answer a
 * different question — the one that has been green while the product was wrong (CLAUDE.md §2).
 * It only ever READS: `cat`, `ls`, and `docker exec … curl`.
 *
 * Exit codes (project convention): 0 pass · 1 fail · 2 cannot run.
 *
 * Run:
 *   node scripts/check-l1-upgrades.mjs              # measure the live network
 *   node scripts/check-l1-upgrades.mjs --self-test  # the comparison rules, offline, with fixtures
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { upgradeShape } from "../local-net/lib/l1-upgrade.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..");
const SELF_TEST = process.argv.includes("--self-test");
const NODES = Array.from({ length: 9 }, (_, i) => `9chain-a1-node-${i + 1}`);

let pass = 0, fail = 0;
const ok = (label, cond, detail = "") => {
  if (cond) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; console.log(`  ✗ ${label}${detail ? `  — ${detail}` : ""}`); }
};
const cannotRun = (why, how) => {
  console.log(`\n⚠️  CANNOT RUN — ${why}`);
  console.log(`   ${how}`);
  process.exit(2);
};

// ═══════════════════════════════════════════════════════════════════════════
// THE RULES — pure, so the self-test can drive them without a network.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compare one chain's disk file against what each node reports.
 *
 * @param {object} input
 *   `disk`  — null when no upgrade.json exists, else the parsed file
 *   `nodes` — [{ node, ok, upgrades }] one per node; `ok:false` means it did not answer FOR THIS
 *             CHAIN, which is a finding in its own right and never a reason to skip the comparison
 *   `ledger` — the ledger's own `upgrades` array, or undefined
 * @returns {{findings: string[], shape: string|null}}
 */
/**
 * One node's answer for one chain, turned into the shape `compareChain` reads.
 *
 * 🔴 `upgrades` is ALWAYS present in `eth_getChainConfig` and `precompileUpgrades` is NOT: with no
 * file the key is there holding `{}` (measured on node-1, 2026-09-04). Reading it as `undefined`
 * and reading it as "no upgrades" are the same value here and different bugs elsewhere, so the
 * fallback is explicit.
 */
export function readNodeAnswer(node, body) {
  if (body === "UNREACHABLE" || body === "") return { node, ok: false, why: "no answer on /ext/bc/<id>/rpc", upgrades: [] };
  let j;
  try { j = JSON.parse(body); } catch { return { node, ok: false, why: "answer was not JSON", upgrades: [] }; }
  if (j.error) return { node, ok: false, why: String(j.error.message ?? j.error), upgrades: [] };
  if (!j.result) return { node, ok: false, why: "answer carried neither result nor error", upgrades: [] };
  return { node, ok: true, upgrades: j.result?.upgrades?.precompileUpgrades ?? [] };
}

export function compareChain({ name, disk, nodes, ledger }) {
  const findings = [];

  // 1 · Silence is not agreement. Every node must be serving this chain before anything else here
  //     means anything at all.
  const mute = nodes.filter((n) => !n.ok);
  for (const n of mute) findings.push(`${n.node} does not answer for "${name}" (${n.why ?? "no reason given"}) — a chain its VM never initialised looks identical to a chain with no upgrades`);
  const answering = nodes.filter((n) => n.ok);
  if (answering.length === 0) {
    findings.push(`no node answers for "${name}" — nothing below could be measured`);
    return { findings, shape: null };
  }

  // 2 · The nine must agree with each other. A rollout that stopped part-way shows up here and
  //     nowhere else, and it is a consensus split with a timer on it.
  const shapes = new Map();
  for (const n of answering) {
    const s = upgradeShape(n.upgrades);
    if (!shapes.has(s)) shapes.set(s, []);
    shapes.get(s).push(n.node);
  }
  if (shapes.size > 1) {
    const groups = [...shapes.entries()].map(([s, ns]) => `[${ns.join(",")}] => "${s || "(none)"}"`).join("  ·  ");
    findings.push(`nodes DISAGREE on "${name}": ${groups} — a partial rollout splits consensus at the activation timestamp`);
  }
  const shape = [...shapes.keys()][0];

  // 3 · Disk against node.
  const diskShape = upgradeShape(disk?.precompileUpgrades);
  if (disk === null) {
    // No file. Every node must therefore report nothing. A node carrying upgrades with no file
    // behind it is a chain that changes rules the next time that node restarts.
    for (const [s, ns] of shapes) {
      if (s !== "") findings.push(`no upgrade.json on disk for "${name}" but [${ns.join(",")}] report "${s}" — the file was removed after it was loaded; the next restart reverts those nodes`);
    }
  } else if (shapes.size === 1 && diskShape !== shape) {
    findings.push(`disk and nodes differ for "${name}": disk "${diskShape || "(none)"}" vs nodes "${shape || "(none)"}" — the file on disk is not the file the nodes read; a restart applies it`);
  } else if (shapes.size > 1) {
    for (const [s, ns] of shapes) {
      if (s !== diskShape) findings.push(`disk "${diskShape || "(none)"}" also differs from [${ns.join(",")}] "${s || "(none)"}"`);
    }
  }

  // 4 · The ledger describes what the console believes it did. It is the weakest of the three and
  //     is checked last, because a ledger that disagrees with BOTH is a bookkeeping bug, while a
  //     ledger that agrees with disk and not with the nodes is the rollout finding above.
  if (ledger !== undefined) {
    const ledgerShape = upgradeShape(ledger?.flatMap?.((u) => u.entry ? [u.entry] : []) ?? []);
    if (ledger && ledger.length > 0 && diskShape === "" ) {
      findings.push(`the ledger records ${ledger.length} upgrade(s) for "${name}" but there is no upgrade.json on disk`);
    } else if (ledgerShape && ledgerShape !== diskShape) {
      findings.push(`ledger "${ledgerShape}" differs from disk "${diskShape || "(none)"}" for "${name}"`);
    }
  }

  return { findings, shape };
}

// ═══════════════════════════════════════════════════════════════════════════
// SELF-TEST — the rules, offline. Every case asserts the SENTENCE the finding
// would print, not merely that a finding appeared: a control that only counts
// findings passes just as happily when the wrong rule fired.
// ═══════════════════════════════════════════════════════════════════════════
if (SELF_TEST) {
  console.log("══ check-l1-upgrades — comparison rules, offline ══\n");
  const entry = (key, ts, disable) => ({ [key]: { blockTimestamp: ts, ...(disable ? { disable: true } : {}), adminAddresses: ["0x1212B2445E74F788b30bFa9c42Aa46F252345A0b"] } });
  const nodesAll = (upgrades) => NODES.map((node) => ({ node, ok: true, upgrades }));
  const has = (r, needle) => r.findings.some((f) => f.includes(needle));

  console.log("── clean states ──");
  let r = compareChain({ name: "Clean", disk: null, nodes: nodesAll([]), ledger: undefined });
  ok("no file, no node upgrades ⇒ nothing to report", r.findings.length === 0, r.findings.join(" | "));

  const one = [entry("txAllowListConfig", 1800000000)];
  r = compareChain({ name: "Upgraded", disk: { precompileUpgrades: one }, nodes: nodesAll(one), ledger: undefined });
  ok("file and all nine nodes agree ⇒ nothing to report", r.findings.length === 0, r.findings.join(" | "));

  console.log("\n── 🔴 the three quiet failures ──");
  r = compareChain({ name: "Written", disk: { precompileUpgrades: one }, nodes: nodesAll([]), ledger: undefined });
  ok("🔴 file written, no node loaded it", has(r, "the file on disk is not the file the nodes read"), r.findings.join(" | "));

  const half = NODES.map((node, i) => ({ node, ok: true, upgrades: i < 4 ? one : [] }));
  r = compareChain({ name: "HalfRolled", disk: { precompileUpgrades: one }, nodes: half, ledger: undefined });
  ok("🔴 rollout stopped at node 4 ⇒ named as a consensus split", has(r, "splits consensus"), r.findings.join(" | "));
  ok("🔴 …and it names both groups", has(r, "9chain-a1-node-1") && has(r, "9chain-a1-node-9"), r.findings.join(" | "));

  r = compareChain({ name: "Deleted", disk: null, nodes: nodesAll(one), ledger: undefined });
  ok("🔴 file deleted after load ⇒ names the restart that reverts it", has(r, "the next restart reverts"), r.findings.join(" | "));

  console.log("\n── 🔴 silence is not agreement ──");
  const mute = NODES.map((node, i) => ({ node, ok: i !== 5, why: "VM not initialised", upgrades: [] }));
  r = compareChain({ name: "Mute", disk: null, nodes: mute, ledger: undefined });
  ok("🔴 one node not serving the chain is a finding, not a skip", has(r, "does not answer"), r.findings.join(" | "));
  ok("🔴 …and the reason says why a mute node is dangerous here", has(r, "looks identical to a chain with no upgrades"), r.findings.join(" | "));
  r = compareChain({ name: "AllMute", disk: null, nodes: NODES.map((node) => ({ node, ok: false, upgrades: [] })), ledger: undefined });
  ok("🔴 all nine mute ⇒ says nothing could be measured, does NOT report a clean chain", has(r, "nothing below could be measured"), r.findings.join(" | "));

  console.log("\n── the comparison is SHAPE, not bytes ──");
  const lower = [{ txAllowListConfig: { blockTimestamp: 1800000000, adminAddresses: ["0x1212b2445e74f788b30bfa9c42aa46f252345a0b"] } }];
  r = compareChain({ name: "Casing", disk: { precompileUpgrades: one }, nodes: nodesAll(lower), ledger: undefined });
  ok("checksum casing on disk vs lower case from the node is NOT a difference", r.findings.length === 0, r.findings.join(" | "));
  const laterTs = [entry("txAllowListConfig", 1800000001)];
  r = compareChain({ name: "Timestamp", disk: { precompileUpgrades: one }, nodes: nodesAll(laterTs), ledger: undefined });
  ok("🔴 …but one second of difference in the timestamp IS", has(r, "disk and nodes differ"), r.findings.join(" | "));
  const disabling = [entry("txAllowListConfig", 1800000000, true)];
  r = compareChain({ name: "Disable", disk: { precompileUpgrades: disabling }, nodes: nodesAll(one), ledger: undefined });
  ok("🔴 …and so is enable-vs-disable at the same timestamp", has(r, "disk and nodes differ"), r.findings.join(" | "));

  console.log("\n── reading one node's answer ──");
  ok("a real answer with no upgrade file ⇒ serving, no upgrades", (() => {
    const a = readNodeAnswer("n1", JSON.stringify({ result: { chainId: 9001000000, upgrades: {} } }));
    return a.ok === true && a.upgrades.length === 0;
  })(), "`upgrades: {}` is what a node with no file actually returns — measured on node-1, not assumed");
  ok("🔴 UNREACHABLE ⇒ not serving", readNodeAnswer("n1", "UNREACHABLE").ok === false);
  ok("🔴 a JSON-RPC error ⇒ not serving, carrying the node's own words",
    readNodeAnswer("n1", JSON.stringify({ error: { message: "unknown chain" } })).why === "unknown chain");
  ok("🔴 neither result nor error ⇒ not serving (never a silent empty list)",
    readNodeAnswer("n1", "{}").ok === false);

  console.log("\n── the ledger, checked last ──");
  r = compareChain({ name: "LedgerOnly", disk: null, nodes: nodesAll([]), ledger: [{ entry: entry("txAllowListConfig", 1800000000) }] });
  ok("🔴 ledger records an upgrade that never reached disk", has(r, "no upgrade.json on disk"), r.findings.join(" | "));
  r = compareChain({ name: "LedgerOk", disk: { precompileUpgrades: one }, nodes: nodesAll(one), ledger: [{ entry: one[0] }] });
  ok("ledger agreeing with disk and nodes ⇒ nothing to report", r.findings.length === 0, r.findings.join(" | "));

  console.log(`\n${fail === 0 ? "✅" : "🔴"} ${pass} passed · ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}

// ═══════════════════════════════════════════════════════════════════════════
// MEASURE — on the server, read-only.
// ═══════════════════════════════════════════════════════════════════════════
const env = (() => {
  const r = spawnSync("bash", ["-c", `source "${path.join(REPO, "local-net", "deploy", "server-env.sh").split(path.sep).join("/")}" && echo "$A1_SSH_HOST" && echo "$A1_SSH_KEY" && echo "$A1_SRC_DIR"`], { encoding: "utf8" });
  if (r.status !== 0) cannotRun("cannot read local-net/deploy/server-env.sh", r.stderr?.trim() || "bash could not source it");
  const [host, key, src] = r.stdout.trim().split("\n");
  return { host, key, src };
})();

const ssh = (remote, timeoutMs = 120000) => spawnSync(
  "ssh", ["-i", env.key, "-o", "BatchMode=yes", "-o", "ConnectTimeout=15", env.host, remote],
  { encoding: "utf8", timeout: timeoutMs, maxBuffer: 32 * 1024 * 1024 },
);

const probe = ssh("echo READY", 40000);
if (probe.status !== 0 || !probe.stdout.includes("READY")) {
  cannotRun(`ssh to ${env.host} did not answer`, `This gate measures the SERVER; there is no repo-side substitute.\n   ${(probe.stderr || "").trim().slice(0, 300)}`);
}

// One round trip for everything: the ledger, the config directory, and every node's answer for
// every chain. Nine nodes times a dozen chains is a hundred round trips otherwise, and a gate
// nobody runs because it is slow is a gate that does not exist.
const SRC = env.src.replace(/^~/, "$HOME");

// 🔴 A LIVE counter-check, run every time, on the same wire as the real questions. The offline
// self-test proves the comparison rules; it says nothing about the plumbing that turns a node's
// answer into `ok:false`. If that plumbing ever reads a non-answer as "this chain has no
// upgrades", every chain passes forever and the gate is worse than absent. So the run asks one
// node about a blockchainID that cannot exist and requires the answer to come back as NOT ok.
// The id is a real one with its last two characters replaced, so it is well-formed and refers to
// nothing — a malformed id could be rejected by a parser long before the chain lookup, which
// would make this control green for the wrong reason (D-106b).
const PROBE_ID = "2CgPwQiwwPBnuGZfjnNfAqUvJ2NSVDJTEqCAiYFbTzVwDfMNXX";
const remoteScript = `
set -u
CFG="${SRC}/9chain-a1-config"
echo "@@LEDGER"
cat "$CFG/console-chains.json" 2>/dev/null || echo "null"
echo "@@DISK"
for d in "$CFG"/chains/*/; do
  bc=$(basename "$d")
  if [ -f "$d/upgrade.json" ]; then
    echo "--$bc"
    cat "$d/upgrade.json"
    echo
  fi
done
echo "@@NODES"
for bc in $(python3 -c "import json,sys; d=json.load(open('$CFG/console-chains.json')); print(' '.join(c['blockchainID'] for c in d.get('chains',[])))" 2>/dev/null); do
  for n in ${NODES.join(" ")}; do
    echo "--$bc $n"
    docker exec "$n" curl -sf -m 8 -X POST -H content-type:application/json \
      --data '{"jsonrpc":"2.0","id":1,"method":"eth_getChainConfig","params":[]}' \
      "http://127.0.0.1:9650/ext/bc/$bc/rpc" 2>/dev/null || echo "UNREACHABLE"
    echo
  done
done
echo "@@PROBE"
docker exec ${NODES[0]} curl -sf -m 8 -X POST -H content-type:application/json \
  --data '{"jsonrpc":"2.0","id":1,"method":"eth_getChainConfig","params":[]}' \
  "http://127.0.0.1:9650/ext/bc/${PROBE_ID}/rpc" 2>/dev/null || echo "UNREACHABLE"
echo
echo "@@END"
`;

console.log(`══ L1 UPGRADE STATE — measured on ${env.host}, read-only ══\n`);
const run = ssh(remoteScript, 300000);
if (run.status !== 0 || !run.stdout.includes("@@END")) {
  cannotRun("the remote read did not complete", `ssh exited ${run.status}\n   ${(run.stderr || run.stdout || "").trim().slice(0, 400)}`);
}

// ── parse the three sections ──
const out = run.stdout;
const cut = (a, b) => out.slice(out.indexOf(a) + a.length, out.indexOf(b));
let ledger;
try { ledger = JSON.parse(cut("@@LEDGER", "@@DISK").trim()); } catch { cannotRun("the ledger did not parse", "The console writes it; a corrupt ledger is itself the finding, but this gate cannot proceed."); }
const chains = ledger?.chains ?? [];
if (chains.length === 0) cannotRun("the ledger lists no live chains", "Nothing to compare. If chains exist, the ledger path in this gate is wrong.");

const disks = new Map();
for (const block of cut("@@DISK", "@@NODES").split("\n--").slice(1)) {
  const nl = block.indexOf("\n");
  const bc = block.slice(0, nl).trim();
  try { disks.set(bc, JSON.parse(block.slice(nl).trim())); }
  catch { disks.set(bc, { __unparseable: true }); }
}

const nodeAnswers = new Map();   // blockchainID -> [{node, ok, upgrades, why}]
for (const block of cut("@@NODES", "@@PROBE").split("\n--").slice(1)) {
  const nl = block.indexOf("\n");
  const [bc, node] = block.slice(0, nl).trim().split(/\s+/);
  if (!nodeAnswers.has(bc)) nodeAnswers.set(bc, []);
  nodeAnswers.get(bc).push(readNodeAnswer(node, block.slice(nl).trim()));
}

// The live counter-check, through the SAME parser — a probe that took a different path would
// prove nothing about the path the real questions take.
const probeAnswer = readNodeAnswer(NODES[0], cut("@@PROBE", "@@END").trim());
ok(`🔴 counter-check on the live wire: a blockchainID that cannot exist reads as NOT serving`,
  probeAnswer.ok === false,
  `${NODES[0]} answered for ${PROBE_ID.slice(0, 8)}… as ok=true — a non-answer is being read as "no upgrades", and every chain below passes for free`);

console.log(`  ${chains.length} live chain(s) · ${NODES.length} nodes · ${disks.size} upgrade.json file(s) on disk\n`);

let findingsTotal = 0;
for (const chain of chains) {
  const bc = chain.blockchainID;
  const diskRaw = disks.get(bc) ?? null;
  if (diskRaw?.__unparseable) {
    // Worth its own sentence: an unparseable file is not "no upgrades". Every node that restarts
    // after this point fails to initialise the chain's VM entirely (vm.go:544).
    ok(`${chain.name}: upgrade.json parses`, false, `${bc}/upgrade.json is on disk and is NOT valid JSON — every node that restarts loses this chain`);
    findingsTotal++;
    continue;
  }
  const { findings } = compareChain({
    name: chain.name,
    disk: diskRaw,
    nodes: nodeAnswers.get(bc) ?? NODES.map((node) => ({ node, ok: false, why: "not queried", upgrades: [] })),
    ledger: chain.upgrades,
  });
  ok(`${chain.name} (${bc.slice(0, 8)}…): disk ↔ 9 nodes ↔ ledger agree`, findings.length === 0,
    findings.join("\n      · "));
  findingsTotal += findings.length;
}

console.log(`\n${fail === 0 ? "✅" : "🔴"} ${pass} passed · ${fail} failed · ${findingsTotal} finding(s)`);
if (fail === 0) {
  console.log("   The comparison rules have their own counter-checks in `--self-test`; the line above");
  console.log("   is the counter-check for the WIRE, and it ran on this network, in this run.");
}
process.exit(fail === 0 ? 0 : 1);
