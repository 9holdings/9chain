#!/usr/bin/env node
/**
 * check-genesis-verify.mjs — does every genesis the console is WILLING TO BUILD survive
 * subnet-evm's own `Genesis.Verify()`?
 *
 * ═══ THE HOLE THIS CLOSES ═══
 *
 * `lib/l1-options.mjs` runs `verifyFeeConfig` before a chain is paid for. That function is a
 * hand-written PORT of `commontype.FeeConfig.Verify()` — and it says so in its own header. What
 * nothing measured was whether the port still agreed with the law. So the console's dry step was
 * green about ITS COPY, which is CLAUDE.md §2 exactly: every gate green because they all measure
 * the same wrong quantity.
 *
 * The failure this prevents is not theoretical and not cheap. A genesis the port accepts and the
 * node refuses is discovered AFTER the P-Chain transaction is paid, on a chain that cannot start,
 * holding one of the network's 15 permanent slots for good.
 *
 * ═══ WHAT IT MEASURES, AND WHERE ═══
 *
 * Not the rules in isolation — the DOCUMENTS. It starts a real console in a scratch directory
 * (empty ledger, real template — the pattern from `options-e2e-test.mjs`), asks `/api/preview` for
 * a genesis for each corpus entry, and hands each answer to the real Go `Verify()`, compiled
 * against the fork tree on disk and run through the same `golang:1.25.10-bookworm` image
 * `local-net/Dockerfile` uses. Windows has no cgo toolchain and half this dependency tree is cgo,
 * so "in Docker" is not a preference.
 *
 * ═══ 🔴 WHAT IT FOUND ON ITS FIRST RUN (control R3) ═══
 *
 * The port did not implement `checkByteLens()` (fee_config.go:151-178), the last statement of the
 * real `Verify()`. A `minBaseFee` wider than 32 bytes passed the port and was refused by the node.
 * The API's own `LIMITS` cap that field far below the boundary, so the gap was not reachable from
 * outside — but "unreachable through today's front door" is not "closed", it was true by accident,
 * and one widened cap would have turned it into a paid transaction for a chain that cannot start.
 * `verifyFeeConfig` now carries the check; R3 stayed, turned from a divergence probe into an
 * agreement control, and grew a boundary case so it cannot pass by rejecting everything large.
 *
 * The first attempt at R3 used a HEX value and went green while proving nothing: hex is refused by
 * both sides for reasons that have nothing to do with width. Red for the wrong reason wearing the
 * costume of a green (D-106b). The control is a bare decimal number for that reason.
 *
 * ═══ WHY IT TOUCHES THE FORK TREE, AND HOW IT PUTS IT BACK ═══
 *
 * The harness must build INSIDE the fork module to inherit its go.mod/go.sum unchanged, so the
 * source is copied to `graft/subnet-evm/cmd/a1-genesis-verify/` for the run. Hard rule 3 says
 * touching the fork tree is touching the path that reproduces the fork, so: the gate REFUSES TO
 * START if that tree is dirty, removes the copy in a finally, and asserts the tree hash is
 * unchanged before it reports anything. A gate that leaves the fork tree different from how it
 * found it has broken something more expensive than the thing it was checking.
 *
 * Exit codes (project convention): 0 pass · 1 fail · 2 cannot run.
 *
 * Run:  node scripts/check-genesis-verify.mjs
 */
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { mkdirSync, mkdtempSync, copyFileSync, writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NETWORK_ID, TEN_MANG } from "../local-net/lib/chainid.mjs";
import { verifyFeeConfig } from "../local-net/lib/l1-options.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..");
const FORK = path.join(REPO, "upstream", "avalanchego");
const MODULE_DIR = path.join(FORK, "graft", "subnet-evm");
const CMD_REL = path.join("cmd", "a1-genesis-verify");
const CMD_DIR = path.join(MODULE_DIR, CMD_REL);
const SOURCE = path.join(REPO, "local-net", "tools", "genesis-verify", "main.go");
const GO_IMAGE = "golang:1.25.10-bookworm";
const MOD_CACHE_VOLUME = "a1-gomodcache";

const PORT = 8501;
const PORT_FAKE_NODE = 8502;
const BASE = `http://127.0.0.1:${PORT}`;
const TOKEN = "operator-token-that-lives-only-in-this-gate";
const OWNER = "0x1212b2445e74f788B30BfA9C42aa46f252345a0B";   // published foundation address
const OTHER = "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC";   // ewoq, published

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
// Preconditions. Each one is a reason the gate would otherwise be green for
// the wrong reason, so each says so out loud instead of being skipped.
// ═══════════════════════════════════════════════════════════════════════════
if (!existsSync(MODULE_DIR)) {
  cannotRun(`the fork tree is not on disk (${MODULE_DIR})`, "bash scripts/setup-fork.sh, then run this again.");
}
if (!existsSync(SOURCE)) {
  cannotRun(`the harness source is missing (${SOURCE})`, "It is tracked in this repo; restore it from git.");
}
const docker = spawnSync("docker", ["version", "--format", "{{.Server.Version}}"], { encoding: "utf8" });
if (docker.status !== 0) {
  cannotRun("docker is not answering", "This gate compiles Go against the fork tree; Windows has no cgo toolchain for it.");
}

const gitFork = (...args) => spawnSync("git", ["-C", FORK, ...args], { encoding: "utf8" });
const forkStatusBefore = gitFork("status", "--porcelain").stdout ?? "";
if (forkStatusBefore.trim() !== "") {
  cannotRun(
    "the fork working tree is DIRTY — this gate writes into it and must be able to prove it put it back",
    `Commit or clean ${FORK} first. Uncommitted lines:\n${forkStatusBefore.trim().split("\n").slice(0, 5).join("\n")}`,
  );
}
const treeBefore = (gitFork("write-tree").stdout ?? "").trim();
if (!/^[0-9a-f]{40}$/.test(treeBefore)) {
  cannotRun("cannot read the fork tree hash", "git -C upstream/avalanchego write-tree must return a hash.");
}

const SCRATCH = mkdtempSync(path.join(process.env.CLAUDE_SCRATCHPAD || tmpdir(), "a1-genesis-verify-"));
const DOCS = path.join(SCRATCH, "docs");
mkdirSync(DOCS, { recursive: true });

let con = null, fakeNode = null;
const cleanup = () => {
  try { con?.kill(); } catch { /* already gone */ }
  try { fakeNode?.close(); } catch { /* already closed */ }
  try { rmSync(CMD_DIR, { recursive: true, force: true }); } catch { /* nothing to remove */ }
};
process.on("exit", cleanup);

try {
  // ═══════════════════════════════════════════════════════════════════════
  // 1 · A console in a scratch directory — the corpus comes from the PRODUCT
  //     path, not from a fixture someone typed. A fixture of the wrong shape
  //     is how a suite of controls ends up asserting on `undefined` (D-172).
  // ═══════════════════════════════════════════════════════════════════════
  const CFG = path.join(SCRATCH, "9chain-a1-config");
  mkdirSync(path.join(CFG, "console-tmp"), { recursive: true });
  copyFileSync(path.join(REPO, "9chain-a1-config", "l1-evm-genesis.json"), path.join(CFG, "l1-evm-genesis.json"));
  mkdirSync(path.join(SCRATCH, "local-net", "console"), { recursive: true });
  copyFileSync(path.join(REPO, "local-net", "console", "index.html"), path.join(SCRATCH, "local-net", "console", "index.html"));

  fakeNode = createServer((req, res) => {
    let b = "";
    req.on("data", (d) => { b += d; });
    req.on("end", () => {
      let method = "";
      try { method = JSON.parse(b).method; } catch { /* malformed body */ }
      const key = method === "info.getNetworkID" ? "networkID" : method === "info.getNetworkName" ? "networkName" : null;
      const answer = { networkID: String(NETWORK_ID), networkName: TEN_MANG };
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(key
        ? { jsonrpc: "2.0", id: 1, result: { [key]: answer[key] } }
        : { jsonrpc: "2.0", id: 1, error: { message: `not simulated: ${method}` } }));
    });
  });
  await new Promise((r) => fakeNode.listen(PORT_FAKE_NODE, "127.0.0.1", r));

  con = spawn(process.execPath, [path.join(REPO, "local-net", "console", "server.mjs")], {
    cwd: SCRATCH,
    env: {
      ...process.env,
      PORT: String(PORT),
      A1_CONSOLE_HOST: "127.0.0.1",
      A1_CONSOLE_TOKEN: TOKEN,
      A1_CLI_KEY: "PrivateKey-fake-only-so-the-console-starts",
      A1_L1_ADMIN: OWNER,
      NODE_URI: `http://127.0.0.1:${PORT_FAKE_NODE}`,
      A1_DE_CHAIN_MO: "1",
      // Nothing here reaches /api/create, but a logic hole must die of a missing file rather
      // than of restarting a validator (the belt options-e2e-test.mjs wears).
      A1_COMPOSE_FILE: "/does-not-exist/safe-for-this-gate.yml",
      A1_LIMIT_CREATE: "99",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let conLog = "";
  con.stdout.on("data", (d) => { conLog += d; });
  con.stderr.on("data", (d) => { conLog += d; });

  const preview = async (body) => {
    const r = await fetch(`${BASE}/api/preview`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${TOKEN}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    });
    return { status: r.status, j: await r.json().catch(() => null) };
  };

  // wait for the console to answer
  let up = false;
  for (let i = 0; i < 80 && !up; i++) {
    try {
      const r = await fetch(`${BASE}/api/status`, { headers: { authorization: `Bearer ${TOKEN}` }, signal: AbortSignal.timeout(1500) });
      up = r.ok;
    } catch { await new Promise((r) => setTimeout(r, 250)); }
  }
  if (!up) cannotRun("the scratch console never answered", `Its log:\n${conLog.slice(-1200)}`);

  // ═══════════════════════════════════════════════════════════════════════
  // 2 · The corpus — the edges of what the API permits, because the middle
  //     is where agreement is cheap and the edges are where it is not.
  // ═══════════════════════════════════════════════════════════════════════
  const CORPUS = [
    { id: "default", body: { name: "Verify Default" } },
    { id: "allocations-many", body: { name: "Verify Alloc", allocations: [{ address: OWNER, tokens: "1000000" }, { address: OTHER, tokens: "2500000" }] } },
    { id: "fees-floor", body: { name: "Verify Floor", fees: { gasLimit: 12_000_000, targetBlockRate: 1, minBaseFee: "1", baseFeeChangeDenominator: 8 } } },
    { id: "fees-ceiling", body: { name: "Verify Ceiling", fees: { gasLimit: 60_000_000, targetBlockRate: 10, minBaseFee: "1000000000000", baseFeeChangeDenominator: 1000 } } },
    { id: "precompiles-all-burn", body: { name: "Verify Burn", precompiles: { nativeMinter: true, deployerAllowList: true, txAllowList: true, rewardManager: "burn" } } },
    { id: "reward-fee-recipients", body: { name: "Verify Recipients", precompiles: { rewardManager: "allowFeeRecipients" } } },
    { id: "reward-address", body: { name: "Verify Reward Addr", precompiles: { rewardManager: { mode: "rewardAddress", rewardAddress: OTHER } } } },
    // P-59: a genesis carrying contract CODE in `alloc`. Whether the contracts WORK is a different
    // question, answered by `check-genesis-contracts.mjs` in a real EVM; what belongs here is that
    // adding ~6.7 KB of code to `alloc` does not make the document itself unacceptable to the node.
    { id: "contract-library", body: { name: "Verify Library", contracts: true } },
  ];

  const cases = [];   // { id, file, expectOk, why }
  for (const entry of CORPUS) {
    const { status, j } = await preview(entry.body);
    if (status !== 200 || !j?.genesis) {
      ok(`corpus ${entry.id}: /api/preview produced a genesis`, false, `status ${status} · ${j?.error ?? "no genesis"}`);
      continue;
    }
    ok(`corpus ${entry.id}: /api/preview produced a genesis`, true);
    const file = path.join(DOCS, `${entry.id}.json`);
    writeFileSync(file, JSON.stringify(j.genesis));
    cases.push({ id: `accepted:${entry.id}`, file, expectOk: true, why: "the console would build it, so the node must accept it" });
  }
  if (cases.length === 0) cannotRun("the console produced no genesis at all", `Its log:\n${conLog.slice(-1200)}`);

  // ═══════════════════════════════════════════════════════════════════════
  // 3 · Reverse controls. A gate that has only ever been green proves half a
  //     thing: whether it BLOCKS. These are the other half (hard rule 2).
  //     Each mutates the FIRST corpus genesis, so a red here cannot be blamed
  //     on a hand-typed document being malformed in some unrelated way.
  // ═══════════════════════════════════════════════════════════════════════
  // Re-read from disk rather than reusing the in-memory object: the bytes the harness will see
  // are the bytes on disk, and a round-trip that quietly changes them is exactly the kind of
  // thing a gate must not paper over.
  const base = JSON.parse(readFileSync(cases[0].file, "utf8"));
  // `rawFix` exists for one reason: a value too wide for a JS number cannot survive
  // JSON.stringify, and writing it as a string would change what BOTH sides parse. R3 needs a
  // bare JSON number of 78 digits, so it is spliced into the text after serialisation.
  const mutate = (id, why, fn, expectSubstring, rawFix = (s) => s) => {
    const doc = JSON.parse(JSON.stringify(base));
    fn(doc);
    const file = path.join(DOCS, `${id}.json`);
    writeFileSync(file, rawFix(JSON.stringify(doc)));
    cases.push({ id: `refused:${id}`, file, expectOk: false, why, expectSubstring });
  };

  // R1 — the first half of Genesis.Verify(): header gas limit vs fee config gas limit.
  mutate("header-gaslimit-mismatch", "header gasLimit no longer matches feeConfig.gasLimit",
    (d) => { d.gasLimit = "0x1c9c380"; }, "gas limit in fee config");

  // R2 — a rule the port DOES carry, proving the two agree on the direction as well.
  mutate("min-above-max-block-gas-cost", "minBlockGasCost above maxBlockGasCost",
    (d) => { d.config.feeConfig.minBlockGasCost = d.config.feeConfig.maxBlockGasCost + 1; },
    "minBlockGasCost");

  // R3 — 🔴 THE DIVERGENCE. `checkByteLens()` is the last statement of the real Verify(); the JS
  // port stops one line earlier. A minBaseFee wider than 32 bytes passes the port and is refused
  // by the node. Asserted on BOTH sides below, so the claim is measured, not narrated.
  //
  // 🔴 It has to be a BARE JSON NUMBER in decimal. Measured while writing this: a hex string is
  // refused by BOTH sides for a reason that has nothing to do with width — the port only takes
  // digits, and Go's decoder caps hex at 256 bits — so a hex probe would have "passed" this
  // control while proving nothing about `checkByteLens`. That is a red for the wrong reason
  // (D-106b) wearing the costume of a green.
  const WIDER_THAN_HASH = (2n ** 256n).toString();   // 78 digits · 33 bytes · one over the limit
  mutate("min-base-fee-wider-than-32-bytes", "minBaseFee wider than common.HashLength",
    (d) => { d.config.feeConfig.minBaseFee = "__WIDE__"; }, "",
    (s) => s.replace('"__WIDE__"', WIDER_THAN_HASH));

  // R4 — Warp before Durango. This one also proves the harness ran `SetDefaults`: without that
  // step EVERY document fails here, including the good ones, and the gate would be red for a
  // reason that has nothing to do with the document (D-106b).
  mutate("warp-before-durango", "warpConfig activated before Durango",
    (d) => { d.config.warpConfig.blockTimestamp = 0; }, "Durango");

  // ═══════════════════════════════════════════════════════════════════════
  // 4 · Build once, run every case, in one container.
  // ═══════════════════════════════════════════════════════════════════════
  mkdirSync(CMD_DIR, { recursive: true });
  copyFileSync(SOURCE, path.join(CMD_DIR, "main.go"));

  const script = [
    "set -e",
    `cd /fork/graft/subnet-evm`,
    `go build -o /tmp/gv ./${CMD_REL.split(path.sep).join("/")}`,
    ...cases.map((c) => `echo "@@ ${c.id}"; /tmp/gv -network-id ${NETWORK_ID} < /docs/${path.basename(c.file)}`),
  ].join("\n");

  const run = spawnSync("docker", [
    "run", "--rm",
    "-v", `${FORK.split(path.sep).join("/")}:/fork`,
    "-v", `${DOCS.split(path.sep).join("/")}:/docs:ro`,
    "-v", `${MOD_CACHE_VOLUME}:/go/pkg/mod`,
    "-e", "MSYS_NO_PATHCONV=1",
    GO_IMAGE, "sh", "-c", script,
  ], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024, env: { ...process.env, MSYS_NO_PATHCONV: "1" } });

  if (run.status !== 0) {
    cannotRun("the harness did not build or run", `docker exited ${run.status}\n${(run.stderr || run.stdout || "").slice(-2000)}`);
  }

  const verdicts = new Map();
  let current = null;
  for (const line of (run.stdout || "").split("\n")) {
    const t = line.trim();
    if (t.startsWith("@@ ")) { current = t.slice(3); continue; }
    if (current && t.startsWith("{")) {
      try { verdicts.set(current, JSON.parse(t)); } catch { /* not a verdict line */ }
      current = null;
    }
  }

  console.log("");
  for (const c of cases) {
    const v = verdicts.get(c.id);
    if (!v) { ok(`${c.id}: the harness returned a verdict`, false, "no JSON on that line"); continue; }
    if (c.expectOk) {
      ok(`${c.id}: Verify() accepts it — ${c.why}`, v.ok === true, `stage ${v.stage} · ${v.error ?? ""}`);
    } else {
      const refused = v.ok === false && v.stage === "verify";
      const named = !c.expectSubstring || String(v.error ?? "").includes(c.expectSubstring);
      ok(`${c.id}: Verify() refuses it — ${c.why}`, refused && named,
        refused ? `refused, but the message did not name "${c.expectSubstring}": ${v.error}` : `stage ${v.stage} · ok=${v.ok}`);
    }
  }

  // R3's other half — AGREEMENT, measured, not assumed. Go refuses the document above; the port
  // has to refuse the same numbers, or the console would still hand a doomed genesis to a paid
  // transaction. This is the line that was RED when the gate was first run, and it is why
  // `verifyFeeConfig` now carries `checkByteLens`.
  const wideFeeConfig = { ...base.config.feeConfig, minBaseFee: WIDER_THAN_HASH };
  let portMessage = "accepted it";
  try { verifyFeeConfig(wideFeeConfig); } catch (e) { portMessage = e.message; }
  ok("R3 both halves: the JS port refuses the >32-byte minBaseFee that Go refuses",
    portMessage.includes("exceeds 32 bytes"), `the port said: ${portMessage}`);

  // …and it must refuse it for WIDTH, not by refusing everything wide-ish. One byte under the
  // boundary is legal to Go and must stay legal here (hard rule 2, the other direction).
  const edgeFeeConfig = { ...base.config.feeConfig, minBaseFee: (2n ** 256n - 1n).toString() };
  let edgeAccepted = false;
  try { edgeAccepted = verifyFeeConfig(edgeFeeConfig) === true; } catch { edgeAccepted = false; }
  ok("R3 boundary: exactly 32 bytes is still accepted by the port (the check is width, not size)", edgeAccepted);

} finally {
  cleanup();
  const statusAfter = (gitFork("status", "--porcelain").stdout ?? "").trim();
  const treeAfter = (gitFork("write-tree").stdout ?? "").trim();
  ok("fork working tree put back exactly as found (hard rule 3)",
    statusAfter === "" && treeAfter === treeBefore,
    `status "${statusAfter.slice(0, 200)}" · tree ${treeAfter.slice(0, 8)} vs ${treeBefore.slice(0, 8)}`);
  try { rmSync(SCRATCH, { recursive: true, force: true }); } catch { /* leave it for inspection */ }
}

console.log(`\n${fail === 0 ? "✅" : "🔴"} ${pass} passed · ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
