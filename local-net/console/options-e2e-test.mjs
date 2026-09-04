#!/usr/bin/env node
/**
 * options-e2e-test.mjs — the deep chain options (L1-CUSTOM P-56/57/58/62) measured on the
 * PRODUCT PATH: a real console process, a fake node, HTTP in, JSON out.
 *
 * `lib/l1-options.mjs --self-test` proves the RULES. This file proves the WIRING — the thing
 * that failed on 2026-09-03 (D-171): 17 green unit controls while the call site passed one
 * argument and every wallet was refused. So every case here goes through `/api/preview` or
 * `/api/create` exactly as a browser would, and asserts on the sentence the browser would show.
 *
 * ═══ WHY THE CONSOLE RUNS IN A SCRATCH DIRECTORY ═══
 * `server.mjs` resolves its config directory from `cwd` (`ROOT = process.cwd()`), so pointing
 * cwd at an empty directory that holds only a copy of the genesis template gives an EMPTY
 * ledger and a temp dir this test owns. Two things are then measurable that the repo's own
 * ledger would hide: that a preview writes NOTHING (no genesis file, no ledger), and that a
 * refused create writes nothing either. The chainId ledgers (`chainid-*.json`) resolve relative
 * to the module file, so the real cross-generation blocklists still apply.
 *
 * Every `/api/create` here is DESIGNED to be refused before it reaches a node, and the compose
 * file points at a path that does not exist so a logic hole dies of a missing file rather than
 * restarting a validator (same belt as generation-test.mjs).
 *
 * Run:  node local-net/console/options-e2e-test.mjs
 */
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdirSync, mkdtempSync, copyFileSync, existsSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NETWORK_ID, TEN_MANG, GOC_DAI_CHAINID } from "../lib/chainid.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", "..");
const PORT = 8499;
const PORT_FAKE_NODE = 8500;
const BASE = `http://127.0.0.1:${PORT}`;
const TOKEN = "operator-token-that-lives-only-in-this-test";
const OWNER = "0x1212b2445e74f788B30BfA9C42aa46f252345a0B";   // published foundation address
const OTHER = "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC";   // ewoq, published

let pass = 0, fail = 0;
const ok = (label, cond, detail = "") => {
  if (cond) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; console.log(`  ✗ ${label}${detail ? `  — ${detail}` : ""}`); }
};

// ═══ scratch root: an empty ledger, the real template ═══
const SCRATCH = mkdtempSync(path.join(process.env.CLAUDE_SCRATCHPAD || tmpdir(), "a1-options-e2e-"));
const CFG = path.join(SCRATCH, "9chain-a1-config");
mkdirSync(path.join(CFG, "console-tmp"), { recursive: true });
copyFileSync(path.join(REPO, "9chain-a1-config", "l1-evm-genesis.json"), path.join(CFG, "l1-evm-genesis.json"));
// The console also serves its page from `<cwd>/local-net/console/index.html` — the only other
// path it resolves from cwd (grep `path.join(ROOT` in server.mjs before adding more here).
mkdirSync(path.join(SCRATCH, "local-net", "console"), { recursive: true });
copyFileSync(path.join(HERE, "index.html"), path.join(SCRATCH, "local-net", "console", "index.html"));
const LEDGER = path.join(CFG, "console-chains.json");
const TMP = path.join(CFG, "console-tmp");

// ═══ fake node: answers only the generation check ═══
const fakeNode = createServer((req, res) => {
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

const con = spawn(process.execPath, [path.join(REPO, "local-net", "console", "server.mjs")], {
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
    A1_COMPOSE_FILE: "/does-not-exist/safe-for-this-test.yml",
    A1_LIMIT_CREATE: "99",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let conLog = "";
con.stdout.on("data", (d) => { conLog += d; });
con.stderr.on("data", (d) => { conLog += d; });
process.on("exit", () => { try { con.kill(); } catch { /* already gone */ } });

async function call(route, { method = "GET", body } = {}) {
  const r = await fetch(BASE + route, {
    method,
    headers: { "content-type": "application/json", authorization: `Bearer ${TOKEN}` },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20000),
  });
  let j = null;
  try { j = await r.json(); } catch { /* some routes answer empty */ }
  return { status: r.status, j };
}
const preview = (body) => call("/api/preview", { method: "POST", body });
const create = (body) => call("/api/create", { method: "POST", body });

let up = false;
for (let i = 0; i < 50; i++) {
  try { await call("/whoami"); up = true; break; } catch { await new Promise((r) => setTimeout(r, 200)); }
}
if (!up) { console.log("✗ the console did not start. Log:\n" + conLog); process.exit(1); }

const nothingWritten = () => !existsSync(LEDGER) && readdirSync(TMP).length === 0;

console.log("\n══ DEEP OPTIONS ON THE PRODUCT PATH — /api/preview and /api/create ══");

console.log("\n── 1. a plain preview: what every chain got before L1-CUSTOM ──");
{
  const { status, j } = await preview({ name: "Preview Plain" });
  ok("200 and marked as a preview", status === 200 && j.preview === true, JSON.stringify(j).slice(0, 120));
  ok("chainId comes from the auto range", Number.isInteger(j.chainId) && j.chainId >= GOC_DAI_CHAINID, String(j.chainId));
  ok("admin is the configured default (A1_L1_ADMIN)", j.admin === OWNER, j.admin);
  ok("symbol falls back from the name and SAYS so", j.symbol === "PREVIE" && j.symbolIsFallback === true, `${j.symbol} / ${j.symbolIsFallback}`);
  const bal = j.genesis?.alloc?.[OWNER.slice(2).toLowerCase()]?.balance;
  ok("🔴 the owner's balance is BYTE-IDENTICAL to the pre-P-56 constant", bal === "0x295BE96E64066972000000", String(bal));
  ok("genesis feeConfig is the template's, targetGas = 5 × gasLimit",
    j.genesis.config.feeConfig.gasLimit === 12000000 && j.genesis.config.feeConfig.targetGas === 60000000);
  ok("top-level gasLimit derived from feeConfig (subnet-evm compares them)", BigInt(j.genesis.gasLimit) === 12000000n);
  ok("feeManager admin is the owner; no selectable precompile enabled",
    j.genesis.config.feeManagerConfig.adminAddresses[0] === OWNER && j.options.precompiles.length === 0);
  ok("description: fixed supply is in CANNOT", j.description.cannot.some((s) => s.includes("fixed at 50,000,000 forever")));
  ok("description: fees burned is in CANNOT (no RewardManager)", j.description.cannot.some((s) => s.includes("fees are burned")));
  ok("🔴 the preview wrote NOTHING — no genesis file, no ledger", nothingWritten());
  const p = await call("/api/progress");
  ok("no progress was opened", p.j?.running === false, JSON.stringify(p.j).slice(0, 80));
}

console.log("\n── 2. a fully customised preview ──");
{
  const body = {
    name: "Preview Custom", symbol: "PCUS",
    allocations: [{ address: OWNER, tokens: "1000000" }, { address: OTHER, tokens: 9000000 }],
    fees: { gasLimit: 60000000, targetBlockRate: 1, minBaseFee: 1, baseFeeChangeDenominator: 48 },
    precompiles: { nativeMinter: true, deployerAllowList: true, rewardManager: { mode: "rewardAddress", rewardAddress: OTHER } },
  };
  const { status, j } = await preview(body);
  ok("200", status === 200, JSON.stringify(j).slice(0, 160));
  ok("symbol recorded, not a fallback", j.symbol === "PCUS" && j.symbolIsFallback === false);
  const fc = j.genesis.config.feeConfig;
  ok("fees applied inside the rails, targetGas re-derived to 300M",
    fc.gasLimit === 60000000 && fc.targetGas === 300000000 && fc.targetBlockRate === 1 && fc.minBaseFee === 1 && fc.baseFeeChangeDenominator === 48);
  ok("top-level gasLimit follows", BigInt(j.genesis.gasLimit) === 60000000n);
  ok("🔴 precompile keys are the exact subnet-evm ConfigKeys",
    "contractNativeMinterConfig" in j.genesis.config && "contractDeployerAllowListConfig" in j.genesis.config && "rewardManagerConfig" in j.genesis.config);
  ok("🔴 the owner is admin of every enabled precompile",
    ["contractNativeMinterConfig", "contractDeployerAllowListConfig", "rewardManagerConfig"].every((k) => j.genesis.config[k].adminAddresses[0] === OWNER));
  ok("reward address stored as given", j.genesis.config.rewardManagerConfig.initialRewardConfig.rewardAddress === OTHER);
  ok("two genesis recipients, total 10,000,000",
    Object.keys(j.genesis.alloc).length === 2 && j.options.totalTokens === "10000000" &&
    j.genesis.alloc[OTHER.slice(2).toLowerCase()].balance === "0x" + (9000000n * 10n ** 18n).toString(16).toUpperCase());
  ok("options record lists the enabled precompiles + reward mode",
    j.options.precompiles.join(",") === "nativeMinter,deployerAllowList,rewardManager" && j.options.rewardManager.mode === "rewardAddress");
  ok("description: mint is announced as NOT fixed; the fee recipient is named",
    j.description.can.some((s) => s.includes("supply is NOT fixed")) && j.description.can.some((s) => s.includes(OTHER)));
  ok("description: strangers cannot deploy", j.description.cannot.some((s) => s.includes("cannot deploy contracts")));
  ok("throughput sentence is computed from the FINAL config", j.description.facts.some((s) => s.includes("2,857 per second")));
  ok("still nothing written", nothingWritten());
}

console.log("\n── 3. refusals, in the words the browser shows ──");
{
  const cases = [
    ["minBaseFee 0 (D-028)", { name: "Bad One", fees: { minBaseFee: 0 } }, "dead at birth"],
    ["gasLimit above the rail", { name: "Bad Two", fees: { gasLimit: 60000001 } }, "between 12,000,000 and 60,000,000"],
    ["a mistyped fee key names the right one", { name: "Bad Three", fees: { gaslimit: 12000000 } }, 'did you mean "gasLimit"'],
    ["targetGas is not an input", { name: "Bad Four", fees: { targetGas: 1 } }, 'unknown key "targetGas"'],
    ["a preset combined with explicit fees", { name: "Bad Five", preset: "zero-fee", fees: { minBaseFee: 5 } }, "cannot be combined"],
    ["a preset combined with explicit precompiles", { name: "Bad Six", preset: "mintable", precompiles: { txAllowList: true } }, "precompiles: { nativeMinter: true }"],
    ["the owner receiving nothing", { name: "Bad Seven", allocations: [{ address: OTHER, tokens: 5 }] }, "receives nothing"],
    ["a duplicate recipient", { name: "Bad Eight", allocations: [{ address: OWNER, tokens: 1 }, { address: OWNER, tokens: 1 }] }, "appears twice"],
    ["total above the ceiling", { name: "Bad Nine", allocations: [{ address: OWNER, tokens: "9000000001" }] }, "exceeds the ceiling"],
    ["an unknown precompile", { name: "Bad Ten", precompiles: { warp: true } }, 'unknown key "warp"'],
    ["both reward modes at once", { name: "Bad Eleven", precompiles: { rewardManager: { mode: "allowFeeRecipients", rewardAddress: OTHER } } }, "cannot both be set"],
    ["a bad checksum in an allocation", { name: "Bad Twelve", allocations: [{ address: OWNER, tokens: 1 }, { address: OTHER.toLowerCase().replace(/c$/, "C"), tokens: 1 }] }, "allocations[1].address"],
    ["a reserved symbol still refused with options present", { name: "Bad Thirteen", symbol: "LOVE9", fees: { gasLimit: 12000000 } }, "reserved"],
    ["a bad name is still the FIRST refusal", { name: "!", fees: { minBaseFee: 0 } }, "Character 1 is U+0021"],
  ];
  for (const [label, body, fragment] of cases) {
    const { status, j } = await preview(body);
    ok(`🔴 ${label}`, status === 400 && String(j?.error || "").includes(fragment), `${status} ${String(j?.error || "").slice(0, 110)}`);
  }
  ok("nothing written after fourteen refusals", nothingWritten());
}

console.log("\n── 4. /api/create runs the SAME plan — same refusal, same words, nothing spent ──");
{
  const body = { name: "Same Words", fees: { minBaseFee: 0 } };
  const a = await preview(body);
  const b = await create(body);
  ok("create is refused 400 too", b.status === 400, String(b.status));
  ok("🔴 identical sentence from both routes (one code path, not two)", a.j?.error === b.j?.error, `${a.j?.error}\n      vs ${b.j?.error}`);
  ok("nothing written by the refused create", nothingWritten());
  const p = await call("/api/progress");
  ok("no progress left open by the refused create", p.j?.running === false);
}

console.log("\n── 5. /api/status publishes the rails the create path enforces ──");
{
  const { j } = await call("/api/status");
  ok("limits present, with the same numbers", j.limits?.gasLimit?.min === 12000000 && j.limits?.gasLimit?.max === 60000000 && j.limits?.minBaseFee?.min === "1" && j.limits?.totalTokens === "9000000000");
  ok("selectable precompiles + reward modes listed",
    Array.isArray(j.selectablePrecompiles) && j.selectablePrecompiles.includes("rewardManager") && j.rewardModes?.includes("allowFeeRecipients"));
  ok("the contract library's addresses and cost are published, so a page need not hard-code them",
    !!j.contractLibrary?.tokenFactory?.address && j.contractLibrary?.multicall3?.bytes > 0);
}

console.log("\n── 6. P-59 the contract library reaches `alloc` through the PRODUCT path ──");
{
  const { CONTRACTS } = await import("../lib/l1-contracts.mjs");
  const addrs = Object.values(CONTRACTS).map((c) => c.address.slice(2).toLowerCase());

  const off = await preview({ name: "Library Off" });
  ok("default: no library in alloc", off.status === 200 && addrs.every((a) => !(a in off.j.genesis.alloc)));
  // 🔴 The rule the rest of this file lives by: absent options reproduce the old bytes. Eleven
  // chains are already alive with a genesis built the old way, and a default that quietly changed
  // would make every one of them different from the next one created.
  ok("🔴 default: `options` carries no `contracts` key at all", off.status === 200 && !("contracts" in (off.j.options ?? {})));

  const on = await preview({ name: "Library On", contracts: true });
  ok("contracts:true ⇒ all three addresses are in alloc", on.status === 200 && addrs.every((a) => a in on.j.genesis.alloc), String(on.j?.error));
  ok("…each with real code, not an empty account",
    on.status === 200 && addrs.every((a) => typeof on.j.genesis.alloc[a]?.code === "string" && on.j.genesis.alloc[a].code.length > 100));
  ok("…and `options.contracts` records it for the public ledger", on.j?.options?.contracts === true);
  ok("…and the signing text admits the Multicall3 is not the canonical one",
    (on.j?.description?.cannot ?? []).some((s) => s.includes("NOT the canonical deployment")));
  ok("the owner's own allocation is still there beside the library",
    on.status === 200 && OWNER.slice(2).toLowerCase() in on.j.genesis.alloc);

  const bad = await preview({ name: "Library Bad", contracts: ["erc20"] });
  ok("🔴 a list is refused on the product path, with the sentence the library throws",
    bad.status === 400 && String(bad.j?.error || "").includes("whole or not at all"), `${bad.status} ${String(bad.j?.error || "").slice(0, 110)}`);
  ok("nothing written by any of it", nothingWritten());
}

console.log(`\n${fail ? "✗" : "✅"} ${pass} passed · ${fail} failed`);
process.exitCode = fail ? 1 : 0;
con.kill();
fakeNode.close();
try { rmSync(SCRATCH, { recursive: true, force: true }); } catch { /* the OS will */ }
