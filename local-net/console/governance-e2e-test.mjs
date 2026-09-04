#!/usr/bin/env node
/**
 * governance-e2e-test.mjs — governing an EXISTING L1 on the product path: `/api/governance`,
 * `/api/upgrade-preview`, `/api/upgrade` (including its UNDO), `/api/transfer-owner`.
 *
 * `lib/l1-upgrade.mjs --self-test` proves the rules; this proves the wiring, the way
 * options-e2e-test does for creation: a real console process in a scratch directory, a fake
 * node that answers `eth_getChainConfig`, `eth_call` (readAllowList) and the generation check,
 * HTTP in, JSON out, and assertions on the sentences a browser would show.
 *
 * ═══ HOW THE ROLLOUT IS EXERCISED WITHOUT A NETWORK ═══
 * The compose file points at a path that does not exist, so `/api/upgrade` gets exactly as far
 * as writing `upgrade.json` and then fails at the first docker call. That is the interesting
 * path: the file must be put back (here: removed, since there was none), the error must say so,
 * and the ledger must not record anything. A rollout that succeeds is measured on the real
 * network by a person (HANDOFF), not here.
 *
 * Run:  node local-net/console/governance-e2e-test.mjs
 */
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdirSync, mkdtempSync, copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NETWORK_ID, TEN_MANG } from "../lib/chainid.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", "..");
const PORT = 8501;
const PORT_FAKE_NODE = 8502;
const BASE = `http://127.0.0.1:${PORT}`;
const TOKEN = "operator-token-that-lives-only-in-this-test";
const OWNER = "0x1212b2445e74f788B30BfA9C42aa46f252345a0B";
const NEW_OWNER = "0x5eE9233D2452fdf85f62edbb80035339F1e93a39";
const OTHER = "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC";
const BC = "bcGovChainTest1111111111111111111111111111111111";
const SUB = "subGovChainTest111111111111111111111111111111111";
const FEE_MANAGER = "0x0200000000000000000000000000000000000003";
const DEPLOYER_ALLOWLIST = "0x0200000000000000000000000000000000000000";
const NATIVE_MINTER = "0x0200000000000000000000000000000000000001";

let pass = 0, fail = 0;
const ok = (label, cond, detail = "") => { if (cond) { pass++; console.log(`  ✓ ${label}`); } else { fail++; console.log(`  ✗ ${label}${detail ? `  — ${detail}` : ""}`); } };

// ═══ scratch root: one live chain owned by OWNER, nativeMinter on since genesis ═══
const SCRATCH = mkdtempSync(path.join(process.env.CLAUDE_SCRATCHPAD || tmpdir(), "a1-gov-e2e-"));
const CFG = path.join(SCRATCH, "9chain-a1-config");
mkdirSync(path.join(CFG, "console-tmp"), { recursive: true });
mkdirSync(path.join(CFG, "chains"), { recursive: true });
copyFileSync(path.join(REPO, "9chain-a1-config", "l1-evm-genesis.json"), path.join(CFG, "l1-evm-genesis.json"));
mkdirSync(path.join(SCRATCH, "local-net", "console"), { recursive: true });
copyFileSync(path.join(HERE, "index.html"), path.join(SCRATCH, "local-net", "console", "index.html"));
const LEDGER = path.join(CFG, "console-chains.json");
const CHAIN = { name: "Gov Chain", subnetID: SUB, blockchainID: BC, chainId: 9001000099, admin: OWNER, preset: "mintable", presetName: "Mintable supply", rpc: `http://x/ext/bc/${BC}/rpc`, createdAt: 1 };
writeFileSync(LEDGER, JSON.stringify({ chains: [CHAIN], retired: [] }, null, 2));
const UPGRADE_FILE = path.join(CFG, "chains", BC, "upgrade.json");
const readLedger = () => JSON.parse(readFileSync(LEDGER, "utf8"));

// ═══ fake node ═══
const GENESIS_CFG = {
  chainId: 9001000099, feeConfig: { gasLimit: 12000000, targetBlockRate: 2, minBaseFee: 25000000000, targetGas: 60000000, baseFeeChangeDenominator: 36, minBlockGasCost: 0, maxBlockGasCost: 1000000, blockGasCostStep: 200000 },
  feeManagerConfig: { adminAddresses: [OWNER.toLowerCase()], blockTimestamp: 0 },
  warpConfig: { blockTimestamp: 1607144400, quorumNumerator: 67, requirePrimaryNetworkSigners: false },
  contractNativeMinterConfig: { adminAddresses: [OWNER.toLowerCase()], blockTimestamp: 0 },
};
let nodeUpgrades = [];                                   // what the node claims to run
const roles = new Map([                                 // `${precompile}|${address}` -> role code
  [`${FEE_MANAGER}|${OWNER.toLowerCase()}`, 2], [`${NATIVE_MINTER}|${OWNER.toLowerCase()}`, 2],
  [`${FEE_MANAGER}|${NEW_OWNER.toLowerCase()}`, 2], [`${NATIVE_MINTER}|${NEW_OWNER.toLowerCase()}`, 0],
]);
// The chain head this fake node reports, and which precompiles answer with NOTHING because they are
// not live at that head. Both are mutated by the cases below; both model states a real idle L1 sits
// in for hours at a time.
let headTime = Math.floor(Date.now() / 1000);
const notLiveAtHead = new Set();

const fakeNode = createServer((req, res) => {
  let b = "";
  req.on("data", (d) => { b += d; });
  req.on("end", () => {
    let m = {};
    try { m = JSON.parse(b); } catch { /* malformed */ }
    const reply = (result) => { res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify({ jsonrpc: "2.0", id: 1, result })); };
    const err = (message) => { res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify({ jsonrpc: "2.0", id: 1, error: { message } })); };
    if (m.method === "info.getNetworkID") return reply({ networkID: String(NETWORK_ID) });
    if (m.method === "info.getNetworkName") return reply({ networkName: TEN_MANG });
    if (!req.url.includes(`/ext/bc/${BC}/rpc`)) return err(`unknown chain path ${req.url}`);
    if (m.method === "eth_getChainConfig") return reply({ ...GENESIS_CFG, upgrades: nodeUpgrades.length ? { precompileUpgrades: nodeUpgrades } : {} });
    // 🔴 The chain's HEAD, which is the clock that decides whether a precompile is live. `headTime`
    // is deliberately controllable per case: on a real idle L1 it sits hours behind the wall clock,
    // and that gap is what took `/api/governance` down on 2026-09-04 (SBull Chain, 400).
    if (m.method === "eth_getBlockByNumber") {
      return reply({ number: "0x1", timestamp: "0x" + headTime.toString(16) });
    }
    if (m.method === "eth_call") {
      const { to, data } = m.params[0];
      if (!String(data).startsWith("0xeb54dae1")) return err("unexpected selector");
      const addr = "0x" + String(data).slice(10 + 24).toLowerCase();
      // A precompile that is not live at the head answers with NOTHING — that is the EVM's real
      // behaviour for an account with no code, and reproducing it here is the whole point of this
      // case. Anything else would let the console pass a test it fails on the network.
      const key = `${to.toLowerCase()}|${addr}`;
      if (notLiveAtHead.has(to.toLowerCase())) return reply("0x");
      const code = roles.get(key) ?? 0;
      return reply("0x" + code.toString(16).padStart(64, "0"));
    }
    return err(`not simulated: ${m.method}`);
  });
});
await new Promise((r) => fakeNode.listen(PORT_FAKE_NODE, "127.0.0.1", r));

const con = spawn(process.execPath, [path.join(REPO, "local-net", "console", "server.mjs")], {
  cwd: SCRATCH,
  env: {
    ...process.env, PORT: String(PORT), A1_CONSOLE_HOST: "127.0.0.1", A1_CONSOLE_TOKEN: TOKEN,
    A1_CLI_KEY: "PrivateKey-fake-only-so-the-console-starts", A1_L1_ADMIN: OTHER,
    NODE_URI: `http://127.0.0.1:${PORT_FAKE_NODE}`, A1_DE_CHAIN_MO: "1",
    A1_COMPOSE_FILE: "/does-not-exist/safe-for-this-test.yml", A1_LIMIT_UPGRADE: "99",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let conLog = "";
con.stdout.on("data", (d) => { conLog += d; });
con.stderr.on("data", (d) => { conLog += d; });
process.on("exit", () => { try { con.kill(); } catch { /* gone */ } });

async function call(route, { method = "GET", body } = {}) {
  const r = await fetch(BASE + route, {
    method, headers: { "content-type": "application/json", authorization: `Bearer ${TOKEN}` },
    body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(30000),
  });
  let j = null; try { j = await r.json(); } catch { /* empty */ }
  return { status: r.status, j };
}
const preview = (body) => call("/api/upgrade-preview", { method: "POST", body });
const upgrade = (body) => call("/api/upgrade", { method: "POST", body });
const transfer = (body) => call("/api/transfer-owner", { method: "POST", body });

let up = false;
for (let i = 0; i < 50; i++) { try { await call("/whoami"); up = true; break; } catch { await new Promise((r) => setTimeout(r, 200)); } }
if (!up) { console.log("✗ the console did not start. Log:\n" + conLog); process.exit(1); }

const NOW = () => Math.floor(Date.now() / 1000);
console.log("\n══ GOVERNING AN EXISTING L1 — product path ══");

console.log("\n── 1. governance view ──");
{
  const { status, j } = await call("/api/governance?name=" + encodeURIComponent("Gov Chain"));
  ok("200", status === 200, JSON.stringify(j).slice(0, 160));
  ok("nativeMinter on since genesis; txAllowList off", j.precompiles?.nativeMinter?.enabled === true && j.precompiles?.nativeMinter?.since === 0 && j.precompiles?.txAllowList?.enabled === false);
  ok("recorded admin's roles are MEASURED (readAllowList) — admin on feeManager and nativeMinter", j.adminRoles?.feeManager === "admin" && j.adminRoles?.nativeMinter === "admin");
  ok("no upgrade file, no history", Array.isArray(j.upgradeFile) && j.upgradeFile.length === 0 && j.upgrades.length === 0);
  ok("precompile addresses + lead window are served", j.addresses?.feeManager === FEE_MANAGER && j.lead?.min === 900);
  const r = await call("/api/governance?name=Nope");
  ok("unknown chain ⇒ 400 in words", r.status === 400 && /No L1 named/.test(r.j?.error));
}

console.log("\n── 2. upgrade preview: enable txAllowList ──");
{
  const t0 = NOW();
  const { status, j } = await preview({ name: "Gov Chain", precompile: "txAllowList", action: "enable" });
  ok("200 and marked preview", status === 200 && j.preview === true, JSON.stringify(j).slice(0, 160));
  ok("activation ≥ now + 15 min, on a whole minute", j.activateAt >= t0 + 900 && j.activateAt % 60 === 0, String(j.activateAt - t0));
  ok("file shape {precompileUpgrades:[{txAllowListConfig:{blockTimestamp, adminAddresses:[owner]}}]}",
    j.upgradeConfig?.precompileUpgrades?.length === 1 && j.upgradeConfig.precompileUpgrades[0].txAllowListConfig?.adminAddresses?.[0] === OWNER);
  ok("description: before/after differ on txAllowList only", j.description?.before?.txAllowList === false && j.description?.after?.txAllowList === true && j.description?.after?.nativeMinter === true);
  ok("description warns today's users", j.description?.wont?.some((s) => s.includes("including today's users")));
  ok("🔴 nothing written by a preview", !existsSync(UPGRADE_FILE));
}

console.log("\n── 3. refusals, in the words the browser shows ──");
{
  const cases = [
    ["enabling what genesis enables", { name: "Gov Chain", precompile: "nativeMinter", action: "enable" }, "already enabled since genesis"],
    ["disabling what is off", { name: "Gov Chain", precompile: "txAllowList", action: "disable" }, "not enabled on this chain"],
    ["feeManager is not upgradable", { name: "Gov Chain", precompile: "feeManager", action: "disable" }, "governs fees"],
    ["a typo names the right precompile", { name: "Gov Chain", precompile: "txallowlist", action: "enable" }, 'did you mean "txAllowList"'],
    ["unknown action", { name: "Gov Chain", precompile: "txAllowList", action: "toggle" }, '"enable" or "disable"'],
    ["a lead below 15 minutes", { name: "Gov Chain", precompile: "txAllowList", action: "enable", leadSeconds: 60 }, "three times a nine-node rollout"],
    ["reward options on the wrong precompile", { name: "Gov Chain", precompile: "txAllowList", action: "enable", rewardManager: "burn" }, "only apply to the rewardManager"],
    ["missing name", { precompile: "txAllowList", action: "enable" }, "Missing the chain name"],
  ];
  for (const [label, body, fragment] of cases) {
    const { status, j } = await preview(body);
    ok(`🔴 ${label}`, status === 400 && String(j?.error || "").includes(fragment), `${status} ${String(j?.error || "").slice(0, 110)}`);
  }
}

console.log("\n── 4. /api/upgrade: confirm gate, then the UNDO path ──");
{
  const a = await upgrade({ name: "Gov Chain", precompile: "txAllowList", action: "enable" });
  ok("🔴 without confirm ⇒ refused, naming the word", a.status === 400 && /"confirm":"Gov Chain"/.test(a.j?.error), a.j?.error);
  ok("nothing written", !existsSync(UPGRADE_FILE));
  const b = await upgrade({ name: "Gov Chain", precompile: "txAllowList", action: "enable", confirm: "Gov Chain" });
  ok("🔴 with confirm the rollout starts and fails on the missing compose (by design) ⇒ 400", b.status === 400, String(b.status));
  ok("🔴 the error says the file was put back", /UNDONE/.test(b.j?.error) && /removed the new upgrade\.json/.test(b.j?.error), String(b.j?.error).slice(0, 200));
  ok("🔴 upgrade.json is gone (renamed .failed-*)", !existsSync(UPGRADE_FILE) && readdirSync(path.join(CFG, "chains", BC)).some((f) => f.startsWith("upgrade.json.failed-")));
  ok("🔴 the ledger recorded nothing", readLedger().chains[0].upgrades === undefined);
  const p = await call("/api/progress");
  ok("progress closed with the error, kind 'upgrade'", p.j?.running === false && p.j?.kind === "upgrade" && /UNDONE/.test(p.j?.error));
  for (const f of readdirSync(path.join(CFG, "chains", BC))) rmSync(path.join(CFG, "chains", BC, f));
}

console.log("\n── 5. disk ↔ node agreement, and a pending entry ──");
{
  const pendingAt = NOW() + 3600;
  writeFileSync(UPGRADE_FILE, JSON.stringify({ precompileUpgrades: [{ txAllowListConfig: { blockTimestamp: pendingAt, adminAddresses: [OWNER] } }] }));
  const a = await preview({ name: "Gov Chain", precompile: "deployerAllowList", action: "enable" });
  ok("🔴 a file on disk the node does not run ⇒ refused", a.status === 400 && /not what the public node runs/.test(a.j?.error), a.j?.error);
  nodeUpgrades = [{ txAllowListConfig: { blockTimestamp: pendingAt, adminAddresses: [OWNER.toLowerCase()] } }];   // node echoes it (lower-cased admin, as real nodes do)
  const b = await preview({ name: "Gov Chain", precompile: "txAllowList", action: "disable" });
  ok("🔴 a second upgrade of a key with one pending ⇒ refused", b.status === 400 && /already has an upgrade scheduled/.test(b.j?.error), b.j?.error);
  const c = await preview({ name: "Gov Chain", precompile: "deployerAllowList", action: "enable" });
  ok("another key is fine, and activation moves to the pending timestamp (monotonic)", c.status === 200 && c.j.activateAt === pendingAt && c.j.upgradeConfig.precompileUpgrades.length === 2, JSON.stringify(c.j).slice(0, 120));
  const g = await call("/api/governance?name=" + encodeURIComponent("Gov Chain"));
  ok("governance view shows the pending enable", g.j?.precompiles?.txAllowList?.pending?.at === pendingAt && g.j?.precompiles?.txAllowList?.enabled === false);
  writeFileSync(UPGRADE_FILE, "{ not json");
  const d = await preview({ name: "Gov Chain", precompile: "deployerAllowList", action: "enable" });
  ok("🔴 a broken file on disk is an ERROR, never 'empty'", d.status === 400 && /not valid JSON/.test(d.j?.error) && /refuse to start/.test(d.j?.error), d.j?.error);
  rmSync(UPGRADE_FILE); nodeUpgrades = [];
}

console.log("\n── 6. owner transfer: chain first, ledger second ──");
{
  const a = await transfer({ name: "Gov Chain", newAdmin: NEW_OWNER });
  ok("🔴 without confirm ⇒ refused", a.status === 400 && /"confirm":"Gov Chain"/.test(a.j?.error), a.j?.error);
  const b = await transfer({ name: "Gov Chain", newAdmin: OWNER, confirm: "Gov Chain" });
  ok("🔴 same owner ⇒ refused", b.status === 400 && /already the recorded owner/.test(b.j?.error), b.j?.error);
  const c = await transfer({ name: "Gov Chain", newAdmin: NEW_OWNER.toLowerCase().replace(/9$/, "9").replace(/^0x5e/, "0x5E"), confirm: "Gov Chain" });
  ok("🔴 a bad checksum ⇒ refused naming the field", c.status === 400 && /newAdmin/.test(c.j?.error), c.j?.error);
  const d = await transfer({ name: "Gov Chain", newAdmin: NEW_OWNER, confirm: "Gov Chain" });
  ok("🔴 Admin on feeManager but NOT on the enabled nativeMinter ⇒ refused, naming it and the fix",
    d.status === 400 && /nativeMinter \(role: none\)/.test(d.j?.error) && d.j.error.includes(`setAdmin(${NEW_OWNER})`), d.j?.error);
  ok("ledger unchanged", readLedger().chains[0].admin === OWNER);
  roles.set(`${NATIVE_MINTER}|${NEW_OWNER.toLowerCase()}`, 2);
  const e = await transfer({ name: "Gov Chain", newAdmin: NEW_OWNER, confirm: "Gov Chain" });
  ok("once the chain says Admin everywhere ⇒ 200", e.status === 200 && e.j?.admin === NEW_OWNER && e.j?.previousAdmin === OWNER, JSON.stringify(e.j).slice(0, 160));
  ok("checked list names feeManager + every ENABLED precompile", e.j?.checked?.join(",") === "feeManager,nativeMinter");
  ok("old owner still Admin on chain is reported, with the setNone hint", e.j?.previousStillAdminOnChain === true && /setNone/.test(e.j?.note));
  const led = readLedger().chains[0];
  ok("ledger: admin replaced, previousAdmins keeps the history", led.admin === NEW_OWNER && led.previousAdmins?.length === 1 && led.previousAdmins[0].address === OWNER);
  const g = await call("/api/governance?name=" + encodeURIComponent("Gov Chain"));
  ok("governance view follows: new admin, measured roles", g.j?.admin === NEW_OWNER && g.j?.adminRoles?.feeManager === "admin");
}

console.log("\n── 🔴 WHICH CLOCK: an upgrade past its moment on the WALL but not yet in a BLOCK ──");
{
  // This is the state that took /api/governance down on the live network (SBull Chain,
  // 2026-09-04 17:08Z, HTTP 400). A precompile activates in the first block whose TIMESTAMP reaches
  // the activation moment, and subnet-evm builds a block only when there is a transaction — so on a
  // chain nobody uses, the wall clock sails past the activation and the chain does not move. The
  // console used to ask its own clock, call the precompile enabled, then ask the chain for a role
  // and get `0x` back. The upgrade was fine; the QUESTION was asked against the wrong clock.
  const now = Math.floor(Date.now() / 1000);
  const activated = now - 600;                 // ten minutes ago by the wall clock
  headTime = now - 4 * 3600;                   // …but the chain's head is four hours old
  nodeUpgrades.length = 0;
  nodeUpgrades.push({ contractDeployerAllowListConfig: { blockTimestamp: activated, adminAddresses: [NEW_OWNER] } });
  notLiveAtHead.add(DEPLOYER_ALLOWLIST.toLowerCase());

  const g = await call("/api/governance?name=" + encodeURIComponent("Gov Chain"));
  ok("🔴 it answers 200 instead of blowing up on an empty readAllowList", g.status === 200, `${g.status} ${String(g.j?.error).slice(0, 140)}`);
  ok("🔴 deployerAllowList is NOT reported as enabled — the chain has not reached the moment",
    g.j?.precompiles?.deployerAllowList?.enabled === false, JSON.stringify(g.j?.precompiles?.deployerAllowList));
  ok("it is still reported as PENDING, so nobody thinks the upgrade was lost",
    g.j?.precompiles?.deployerAllowList?.pending?.at === activated);
  ok("🔴 and the state has a NAME: waitingForABlock lists it",
    Array.isArray(g.j?.waitingForABlock) && g.j.waitingForABlock.includes("deployerAllowList"), JSON.stringify(g.j?.waitingForABlock));
  ok("the chain's head is returned beside the server's clock, so a page need not guess",
    g.j?.chainHead?.timestamp === headTime && typeof g.j?.now === "number");
  ok("no role is claimed for a precompile that is not live", !("deployerAllowList" in (g.j?.adminRoles ?? {})));

  // …and the other direction: once the chain's head passes the moment, it really is enabled.
  headTime = now;
  notLiveAtHead.delete(DEPLOYER_ALLOWLIST.toLowerCase());
  roles.set(`${DEPLOYER_ALLOWLIST.toLowerCase()}|${NEW_OWNER.toLowerCase()}`, 2);
  const h = await call("/api/governance?name=" + encodeURIComponent("Gov Chain"));
  ok("once the chain's HEAD passes the moment ⇒ enabled, and the role is measured",
    h.j?.precompiles?.deployerAllowList?.enabled === true && h.j?.adminRoles?.deployerAllowList === "admin",
    JSON.stringify({ p: h.j?.precompiles?.deployerAllowList, r: h.j?.adminRoles }));
  ok("waitingForABlock is empty again", (h.j?.waitingForABlock ?? []).length === 0);
}

console.log(`\n${fail ? "✗" : "✅"} ${pass} passed · ${fail} failed`);
process.exitCode = fail ? 1 : 0;
con.kill();
fakeNode.close();
try { rmSync(SCRATCH, { recursive: true, force: true }); } catch { /* the OS will */ }
