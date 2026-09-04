#!/usr/bin/env node
/**
 * check-genesis-contracts.mjs — does the contract library frozen into a genesis actually WORK from
 * block zero?
 *
 * ═══ WHY NOTHING CHEAPER WILL DO ═══
 *
 * P-59 puts contract CODE into genesis `alloc`. Every way that can go wrong is invisible to a
 * document check, a hash, or a byte count:
 *
 *   · creation bytecode installed instead of runtime bytecode — the account holds a deployment
 *     script nobody can ever run;
 *   · `TokenFactory`'s inlined implementation address pointing somewhere the genesis does not
 *     place the implementation — every clone is a proxy in front of nothing, and the transaction
 *     SUCCEEDS;
 *   · an unlinked library placeholder sitting in the code as ASCII;
 *   · a contract that is simply wrong.
 *
 * 🔴 And the EVM makes it worse: a call to an address with NO CODE AT ALL succeeds and returns
 * empty. So "the call did not revert" proves nothing here. Every assertion below reads the RETURN
 * VALUE, and control R0 removes the library from the genesis to prove the greens are not free.
 *
 * A genesis is immutable and each chain born from it holds one of fifteen permanent slots, so the
 * answer has to arrive before anything is paid for. `local-net/tools/genesis-exec/main.go` builds
 * the genesis state and runs the calls in subnet-evm's own EVM — no network, no slot spent.
 *
 * ═══ WHAT THIS DOES NOT CLAIM ═══
 *
 * Not a live-network measurement. No consensus, no block production, no nine validators. It
 * answers "does the library work against a state built from this alloc", which is exactly the
 * question that must be settled before a chain is created, and not one question more.
 *
 * Exit codes (project convention): 0 pass · 1 fail · 2 cannot run.
 *
 * Run:  node scripts/check-genesis-contracts.mjs
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { keccak256, toChecksumAddress } from "../local-net/lib/eip55.mjs";
import { CONTRACTS, SOLC_VERSION, libraryAlloc } from "../local-net/lib/l1-contracts.mjs";
import { NETWORK_ID } from "../local-net/lib/chainid.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..");
const FORK = path.join(REPO, "upstream", "avalanchego");
const MODULE_DIR = path.join(FORK, "graft", "subnet-evm");
const CMD_REL = "cmd/a1-genesis-exec";
const CMD_DIR = path.join(MODULE_DIR, "cmd", "a1-genesis-exec");
const SOURCE = path.join(REPO, "local-net", "tools", "genesis-exec", "main.go");
const GO_IMAGE = "golang:1.25.10-bookworm";
const TEMPLATE = path.join(REPO, "9chain-a1-config", "l1-evm-genesis.json");

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
// A minimal ABI codec. Only the types this library uses, on purpose: a general
// encoder would be a second thing to get wrong, and every call below is typed
// by hand right next to its assertion.
// ═══════════════════════════════════════════════════════════════════════════
const hexOf = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
const selector = (signature) => hexOf(keccak256(new TextEncoder().encode(signature))).slice(0, 8);
const word = (v) => BigInt(v).toString(16).padStart(64, "0");
const addrWord = (a) => a.replace(/^0x/, "").toLowerCase().padStart(64, "0");
const strTail = (s) => {
  const b = new TextEncoder().encode(s);
  const padded = hexOf(b).padEnd(Math.ceil(b.length / 32) * 64 || 64, "0");
  return word(b.length) + padded;
};

/**
 * Encode a call. `args` is a list of [type, value]; dynamic values go in the tail with their
 * offset in the head, which is the whole of ABI encoding that matters here.
 */
function encode(signature, args = []) {
  const head = [];
  const tails = [];
  const dyn = args.map(([t]) => t === "string");
  let tailOffset = args.length * 32;
  for (const [i, [type, value]] of args.entries()) {
    if (dyn[i]) {
      head.push(word(tailOffset));
      const tail = strTail(value);
      tails.push(tail);
      tailOffset += tail.length / 2;
    } else if (type === "address") head.push(addrWord(value));
    else head.push(word(value));
  }
  return "0x" + selector(signature) + head.join("") + tails.join("");
}

const retWords = (ret) => {
  const h = String(ret ?? "").replace(/^0x/, "");
  return Array.from({ length: Math.floor(h.length / 64) }, (_, i) => h.slice(i * 64, i * 64 + 64));
};
const asUint = (ret, i = 0) => { const w = retWords(ret)[i]; return w === undefined ? null : BigInt("0x" + w); };
const asAddress = (ret, i = 0) => { const w = retWords(ret)[i]; return w === undefined ? null : toChecksumAddress("0x" + w.slice(24)); };
const asString = (ret) => {
  const ws = retWords(ret);
  if (ws.length < 3) return null;
  const len = Number(BigInt("0x" + ws[1]));
  const bytes = ws.slice(2).join("").slice(0, len * 2);
  return new TextDecoder().decode(Uint8Array.from(bytes.match(/../g)?.map((b) => parseInt(b, 16)) ?? []));
};

// ═══════════════════════════════════════════════════════════════════════════
// Preconditions
// ═══════════════════════════════════════════════════════════════════════════
if (!existsSync(MODULE_DIR)) cannotRun(`the fork tree is not on disk (${MODULE_DIR})`, "bash scripts/setup-fork.sh, then run this again.");
if (!existsSync(SOURCE)) cannotRun(`the harness source is missing (${SOURCE})`, "It is tracked in this repo; restore it from git.");
if (spawnSync("docker", ["version", "--format", "{{.Server.Version}}"], { encoding: "utf8" }).status !== 0) {
  cannotRun("docker is not answering", "This gate compiles Go against the fork tree; Windows has no cgo toolchain for it.");
}
const gitFork = (...a) => spawnSync("git", ["-C", FORK, ...a], { encoding: "utf8" });
const statusBefore = (gitFork("status", "--porcelain").stdout ?? "").trim();
if (statusBefore !== "") {
  cannotRun("the fork working tree is DIRTY — this gate writes into it and must be able to prove it put it back",
    `Commit or clean ${FORK} first.\n${statusBefore.split("\n").slice(0, 5).join("\n")}`);
}
const treeBefore = (gitFork("write-tree").stdout ?? "").trim();

const SCRATCH = mkdtempSync(path.join(process.env.CLAUDE_SCRATCHPAD || tmpdir(), "a1-genesis-contracts-"));
const cleanup = () => {
  try { rmSync(CMD_DIR, { recursive: true, force: true }); } catch { /* nothing to remove */ }
};
process.on("exit", cleanup);

try {
  // ═══════════════════════════════════════════════════════════════════════
  // Two genesis documents: one WITH the library, one WITHOUT. The second is
  // control R0 — the EVM answers a call to an empty account with success and
  // empty data, so without it every green below could be free.
  // ═══════════════════════════════════════════════════════════════════════
  const base = JSON.parse(spawnSync("node", ["-e", `process.stdout.write(require("fs").readFileSync(${JSON.stringify(TEMPLATE)}, "utf8"))`], { encoding: "utf8" }).stdout);
  base.config.chainId = 9001000123;
  const withLib = JSON.parse(JSON.stringify(base));
  withLib.alloc = { ...(withLib.alloc ?? {}), ...libraryAlloc() };
  const withoutLib = JSON.parse(JSON.stringify(base));

  const F = CONTRACTS.tokenFactory.address;
  const M = CONTRACTS.multicall3.address;
  const IMPL = CONTRACTS.erc20Implementation.address;
  const SALT = "0x" + "11".repeat(32);

  // The token address is not known until `predict` answers, so the run happens in two passes: ask,
  // then use. Asking and assuming would be the same mistake as trusting a name over a measurement.
  const pass1 = [
    { label: "multicall.getChainId", to: M, data: encode("getChainId()") },
    { label: "factory.implementation", to: F, data: encode("implementation()") },
    { label: "factory.predict", to: F, data: encode("predict(bytes32)", [["bytes32", BigInt(SALT)]]) },
  ];

  const run = (genesis, calls) => {
    const file = path.join(SCRATCH, `in-${Math.random().toString(36).slice(2)}.json`);
    writeFileSync(file, JSON.stringify({ genesis, calls }));
    const r = spawnSync("docker", [
      "run", "--rm", "--entrypoint", "sh",
      "-v", `${FORK.split(path.sep).join("/")}:/fork`,
      "-v", `${SCRATCH.split(path.sep).join("/")}:/work:ro`,
      "-v", "a1-gomodcache:/go/pkg/mod",
      GO_IMAGE, "-c",
      `set -e; cd /fork/graft/subnet-evm; go build -o /tmp/ge ./${CMD_REL}; /tmp/ge -network-id ${NETWORK_ID} < /work/${path.basename(file)}`,
    ], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, env: { ...process.env, MSYS_NO_PATHCONV: "1" } });
    if (r.status !== 0) cannotRun("the harness did not build or run", `docker exited ${r.status}\n${(r.stderr || r.stdout || "").slice(-2500)}`);
    const out = new Map();
    let done = false;
    for (const line of (r.stdout || "").split("\n")) {
      const t = line.trim();
      if (!t.startsWith("{")) continue;
      try {
        const v = JSON.parse(t);
        if (v.done) { done = true; continue; }
        out.set(v.label, v);
      } catch { /* not a verdict */ }
    }
    if (!done) cannotRun("the harness produced no final verdict", (r.stdout || "").slice(-1500));
    return out;
  };

  mkdirSync(CMD_DIR, { recursive: true });
  copyFileSync(SOURCE, path.join(CMD_DIR, "main.go"));

  console.log(`══ GENESIS CONTRACT LIBRARY — run in subnet-evm's own EVM (solc ${SOLC_VERSION}) ══\n`);

  const r1 = run(withLib, pass1);

  ok("Multicall3 answers getChainId() with THIS genesis' chain id",
    asUint(r1.get("multicall.getChainId")?.ret) === 9001000123n,
    `got ${asUint(r1.get("multicall.getChainId")?.ret)} · ${r1.get("multicall.getChainId")?.error ?? ""}`);

  // 🔴 The binding check. `TokenFactory` inlines this address as a `constant`; the genesis places
  // the implementation somewhere. If the two ever part, the factory mints proxies in front of
  // nothing and the transaction succeeds. The compile step compares the SOURCE; this compares what
  // the compiled code actually returns, which is the only version that cannot be fooled.
  ok("🔴 TokenFactory.implementation() is where the genesis actually puts the implementation",
    asAddress(r1.get("factory.implementation")?.ret)?.toLowerCase() === IMPL.toLowerCase(),
    `code says ${asAddress(r1.get("factory.implementation")?.ret)}, genesis places it at ${IMPL}`);

  const predicted = asAddress(r1.get("factory.predict")?.ret);
  const ZERO = "0x0000000000000000000000000000000000000000";
  ok("TokenFactory.predict() answers with an address", !!predicted && predicted !== ZERO, `got ${predicted}`);
  // 🔴 Without this, the run continues with `predicted === null`, every later `to` is empty, and the
  // "lands where predict said" check compares null to null and goes GREEN. Caught while building
  // this gate: it reported 7 passed while nothing at all had executed.
  if (!predicted || predicted === ZERO) {
    console.log(`\n🔴 predict() gave nothing, so nothing below could be measured — stopping rather than`);
    console.log(`   reporting greens that compare one absence with another.`);
    fail++;
    throw new Error("stop: predict() returned no address");
  }

  const pass2 = [
    { label: "createToken", from: OWNER, to: F, data: encode(
      "createToken(bytes32,string,string,uint8,uint256,address)",
      [["bytes32", BigInt(SALT)], ["string", "Doc Token"], ["string", "DOCT"], ["uint8", 18], ["uint256", 1000n], ["address", OWNER]],
    ) },
    { label: "token.name", to: predicted, data: encode("name()") },
    { label: "token.symbol", to: predicted, data: encode("symbol()") },
    { label: "token.decimals", to: predicted, data: encode("decimals()") },
    { label: "token.totalSupply", to: predicted, data: encode("totalSupply()") },
    { label: "token.balanceOf.owner", to: predicted, data: encode("balanceOf(address)", [["address", OWNER]]) },
    { label: "token.transfer", from: OWNER, to: predicted, data: encode("transfer(address,uint256)", [["address", OTHER], ["uint256", 250n]]) },
    { label: "token.balanceOf.owner.after", to: predicted, data: encode("balanceOf(address)", [["address", OWNER]]) },
    { label: "token.balanceOf.other.after", to: predicted, data: encode("balanceOf(address)", [["address", OTHER]]) },
    // ── reverse controls, on the SAME state, so they cannot be dismissed as setup problems ──
    { label: "R1.initialize.twice", from: OTHER, to: predicted, data: encode(
      "initialize(string,string,uint8,uint256,address)",
      [["string", "Stolen"], ["string", "STL"], ["uint8", 18], ["uint256", 1n], ["address", OTHER]],
    ) },
    { label: "R2.transfer.beyond.balance", from: OTHER, to: predicted, data: encode("transfer(address,uint256)", [["address", OWNER], ["uint256", 10n ** 30n]]) },
    { label: "R3.createToken.same.salt", from: OWNER, to: F, data: encode(
      "createToken(bytes32,string,string,uint8,uint256,address)",
      [["bytes32", BigInt(SALT)], ["string", "Again"], ["string", "AGN"], ["uint8", 18], ["uint256", 1n], ["address", OWNER]],
    ) },
  ];
  const r2 = run(withLib, [...pass1, ...pass2]);

  console.log("");
  ok("createToken succeeds", r2.get("createToken")?.ok === true, r2.get("createToken")?.error ?? "");
  ok("…and it lands at exactly the address predict() named",
    asAddress(r2.get("createToken")?.ret)?.toLowerCase() === predicted?.toLowerCase(),
    `created ${asAddress(r2.get("createToken")?.ret)} vs predicted ${predicted}`);
  ok("token name() survives the clone", asString(r2.get("token.name")?.ret) === "Doc Token", `got ${JSON.stringify(asString(r2.get("token.name")?.ret))}`);
  ok("token symbol() survives the clone", asString(r2.get("token.symbol")?.ret) === "DOCT", `got ${JSON.stringify(asString(r2.get("token.symbol")?.ret))}`);
  ok("token decimals() is 18", asUint(r2.get("token.decimals")?.ret) === 18n, `got ${asUint(r2.get("token.decimals")?.ret)}`);
  ok("token totalSupply() is what createToken asked for", asUint(r2.get("token.totalSupply")?.ret) === 1000n, `got ${asUint(r2.get("token.totalSupply")?.ret)}`);
  ok("the holder starts with the whole supply", asUint(r2.get("token.balanceOf.owner")?.ret) === 1000n, `got ${asUint(r2.get("token.balanceOf.owner")?.ret)}`);
  ok("transfer moves the balance", r2.get("token.transfer")?.ok === true, r2.get("token.transfer")?.error ?? "");
  ok("…and both sides add up afterwards",
    asUint(r2.get("token.balanceOf.owner.after")?.ret) === 750n && asUint(r2.get("token.balanceOf.other.after")?.ret) === 250n,
    `owner ${asUint(r2.get("token.balanceOf.owner.after")?.ret)} · other ${asUint(r2.get("token.balanceOf.other.after")?.ret)}`);

  console.log("\n── 🔴 reverse controls ──");
  ok("🔴 R1 a stranger cannot re-initialize a live token", r2.get("R1.initialize.twice")?.ok === false, `it SUCCEEDED — anyone can rewrite a token's name, symbol and supply`);
  ok("🔴 R2 transfer beyond balance reverts", r2.get("R2.transfer.beyond.balance")?.ok === false, "it SUCCEEDED — balances are not enforced");
  ok("🔴 R3 the same salt cannot be used twice", r2.get("R3.createToken.same.salt")?.ok === false, "it SUCCEEDED — a second createToken would silently return the first token");

  // ── R0: the same calls against a genesis with NO library ──
  console.log("\n── 🔴 R0: without the library in `alloc`, none of this can work ──");
  const r0 = run(withoutLib, pass1);
  const chainIdEmpty = asUint(r0.get("multicall.getChainId")?.ret);
  const implEmpty = asUint(r0.get("factory.implementation")?.ret);
  ok("🔴 R0 with no code at those addresses the calls return NOTHING",
    chainIdEmpty === null && implEmpty === null,
    `getChainId returned ${chainIdEmpty}, implementation returned ${implEmpty} — the greens above did not come from the library`);
  ok("🔴 R0 …and note they did NOT revert, which is exactly why every check above reads the RETURN VALUE",
    r0.get("multicall.getChainId")?.ok === true,
    "a call to an empty account reverted here; the EVM's behaviour changed and this gate's reasoning needs re-reading");

} catch (e) {
  // A deliberate stop (see `predict()` above) is already counted as a failure and has printed why.
  // Anything else is a real crash and must not be swallowed into a tidy summary line.
  if (!String(e?.message ?? "").startsWith("stop:")) throw e;
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
