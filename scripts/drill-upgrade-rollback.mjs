#!/usr/bin/env node
/**
 * drill-upgrade-rollback.mjs — make an L1 upgrade rollout FAIL at node k > 1 on a drill network,
 * and measure what the console's undo path really leaves behind on every node.
 *
 * ═══ WHY THIS DRILL EXISTS ═══
 *
 * The first real upgrade rollout (SBull Chain, 2026-09-04, D-190) went through all nine nodes
 * cleanly, so the undo path — `hoanTacNangCap` in `local-net/console/server.mjs` — had been run
 * exactly once: in `governance-e2e-test.mjs`, where the rollout dies on the FIRST docker call and
 * nothing has restarted yet. The case that matters is the other one: k − 1 nodes already carry the
 * new `upgrade.json` in memory when node k fails. Every one of them will activate the new rule set
 * at the scheduled timestamp unless it is restarted on the old file, and that is a consensus split
 * with a countdown. "Undo" means those nodes run the OLD file again — not that a file was renamed.
 *
 * ═══ WHAT IS MEASURED, AND WHERE ═══
 *
 * The quantity is what each node LOADED: `eth_getChainConfig` on the chain's RPC, asked inside
 * every container with `docker exec … curl`, reduced to `upgradeShape` (the same reduction
 * `check-l1-upgrades.mjs` uses). Not the file on disk (that is the intent), not `.State.StartedAt`
 * alone (a node can restart and still fail to load the chain), not the console's own report (the
 * thing under test). A node that cannot answer for the chain is a finding, never a skip — nine
 * silent nodes agree perfectly (CLAUDE.md §2).
 *
 * ═══ HOW THE FAULT IS INJECTED ═══
 *
 * Node k gets a second bind mount layered over the chain's config directory, holding a copy of
 * `config.json` plus an `upgrade.json` that is not JSON. Every other node keeps the shared
 * directory. When the rollout recreates node k, its primary network comes back healthy while the
 * L1's VM refuses to initialise (`plugin/evm/vm.go:544`) — the exact failure the rollout's
 * `requireChain` check exists for, and the kind that leaves the node "healthy" by every check
 * that does not ask about the chain. The injection is a text edit of the drill compose file,
 * backed up first and put back by `--heal`.
 *
 * ═══ THIS NEVER RUNS AGAINST THE LIVE NETWORK ═══
 *
 * It refuses any node whose `info.getNetworkID` is outside the drill band (899999000–899999999).
 * The console under test must be a local process pointed at the drill compose file; the script
 * talks to it over HTTP the way a browser would.
 *
 * Usage:
 *   node scripts/drill-upgrade-rollback.mjs --self-test
 *   node scripts/drill-upgrade-rollback.mjs --measure   --compose <file> --chain <name> [--console URL --token T]
 *   node scripts/drill-upgrade-rollback.mjs --run       --compose <file> --chain <name> --fail-at <service>
 *                                           --console URL --token T --config-dir <dir> [--precompile txAllowList] [--action enable]
 *   node scripts/drill-upgrade-rollback.mjs --heal      --compose <file> --chain <name> --fail-at <service> [--console URL --token T]
 *
 * Exit codes (project convention): 0 pass · 1 fail · 2 cannot run.
 */
import { spawnSync } from "node:child_process";
import { request } from "node:http";
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { upgradeShape } from "../local-net/lib/l1-upgrade.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ARGS = process.argv.slice(2);
const flag = (name, def) => { const i = ARGS.indexOf(name); return i >= 0 && ARGS[i + 1] !== undefined ? ARGS[i + 1] : def; };
const has = (name) => ARGS.includes(name);
const DRILL_BAND = { lo: 899999000, hi: 899999999 };

// ═══════════════════════════════════════════════════════════════════════════
// THE VERDICT — pure, so the self-test can drive it without docker.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Decide whether an undo left the network where it must be.
 *
 * @param {object} input
 *   `before`   — { [service]: { ok, shape, startedAt } } measured before the rollout began
 *   `after`    — the same, measured after the console returned
 *   `failAt`   — the service the fault was injected into
 *   `disk`     — { before: string|null, after: string|null } the upgrade file's shape on disk (null = absent)
 *   `ledger`   — { before: number, after: number } count of `upgrades[]` entries on the chain's record
 *   `response` — { status, error } the console's HTTP answer
 * @returns { ok, findings: string[], facts: string[] }
 */
export function rollbackVerdict({ before, after, failAt, disk, ledger, response }) {
  const findings = [], facts = [];
  const services = Object.keys(before);
  if (!services.length) return { ok: false, findings: ["no services were measured before the rollout — nothing to compare against"], facts };

  // 1. The console must have REFUSED to record the upgrade, in words that say it was undone —
  //    or that say honestly which node it could NOT undo, provided that node is the one carrying
  //    the injected fault. An "UNDO INCOMPLETE" naming any other node is a failure of the undo.
  const errText = String(response?.error ?? "");
  if (response?.status === 200) findings.push("the console answered 200 — it recorded an upgrade that did not reach every node");
  else if (/UNDO INCOMPLETE/.test(errText)) {
    const named = services.filter((s) => new RegExp(`🔴[^.]*\\b${s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(errText));
    const others = named.filter((s) => s !== failAt);
    if (others.length) findings.push(`the console says UNDO INCOMPLETE for ${others.join(", ")} — nodes without the injected fault were not brought back`);
    else facts.push(`the console refused and said UNDO INCOMPLETE naming only ${failAt} (the injected fault)`);
  }
  else if (!/UNDONE/.test(errText)) findings.push(`the console's error does not say the rollout was undone: ${errText.slice(0, 160)}`);
  else facts.push("the console refused and said UNDONE");

  // 2. Disk: the file must be what it was.
  if ((disk.before ?? null) !== (disk.after ?? null)) findings.push(`upgrade.json on disk is "${disk.after ?? "absent"}", before the rollout it was "${disk.before ?? "absent"}"`);
  else facts.push(`disk file back to ${disk.before === null ? "absent" : `"${disk.before}"`}`);

  // 3. Ledger: nothing recorded.
  if (ledger.after !== ledger.before) findings.push(`the ledger gained ${ledger.after - ledger.before} upgrade record(s) for a rollout that failed`);
  else facts.push("ledger unchanged");

  // 4. Every node: LOADED shape equals the shape before the rollout, and the chain answers.
  //    The injected node is allowed to be broken (its fault is still mounted), but it must be
  //    NAMED, never counted as agreement.
  for (const svc of services) {
    const b = before[svc], a = after[svc];
    if (!b?.ok) { findings.push(`${svc} did not serve the chain BEFORE the rollout — the drill started from a broken network`); continue; }
    if (!a) { findings.push(`${svc} was not measured after the rollout`); continue; }
    if (svc === failAt) {
      if (a.ok && a.shape === b.shape) facts.push(`${svc} (fault injected) answers with the old shape — the undo restarted it and the fault did not bite; check the injection`);
      else facts.push(`${svc} (fault injected) does not serve the chain after the undo — expected while the fault is still mounted; --heal removes it and must bring it back`);
      continue;
    }
    if (!a.ok) { findings.push(`${svc} does not serve the chain after the undo (${a.why ?? "no answer"}) — silence is not agreement`); continue; }
    if (a.shape !== b.shape) findings.push(`${svc} still runs "${a.shape || "empty"}" — it was restarted with the new file and NOT restarted again on the old one; it will activate the upgrade alone`);
  }
  const healthy = services.filter((s) => s !== failAt && after[s]?.ok && after[s].shape === before[s]?.shape);
  facts.push(`${healthy.length}/${services.length - 1} untouched-or-undone nodes run the old shape`);
  return { ok: findings.length === 0, findings, facts };
}

/** After `--heal`: every node must serve the chain with ONE shape, and it must be the reference. */
export function healVerdict({ nodes, expectedShape }) {
  const findings = [];
  for (const [svc, n] of Object.entries(nodes)) {
    if (!n.ok) findings.push(`${svc} does not serve the chain (${n.why ?? "no answer"})`);
    else if (n.shape !== expectedShape) findings.push(`${svc} runs "${n.shape || "empty"}", expected "${expectedShape || "empty"}"`);
  }
  return { ok: findings.length === 0, findings };
}

// ═══════════════════════════════════════════════════════════════════════════
// SELF-TEST
// ═══════════════════════════════════════════════════════════════════════════
if (has("--self-test")) {
  let pass = 0, fail = 0;
  const ok = (label, cond, detail = "") => { if (cond) { pass++; console.log(`  ✓ ${label}`); } else { fail++; console.log(`  ✗ ${label}${detail ? `  — ${detail}` : ""}`); } };
  const N = ["n-2", "n-3", "n-4", "n-5", "n-1"];
  const NEW = "txAllowListConfig@1800000900";
  const mk = (shapes) => Object.fromEntries(N.map((s) => [s, { ok: shapes[s] !== undefined ? true : false, shape: shapes[s] ?? "", startedAt: "t" }]));
  const clean = Object.fromEntries(N.map((s) => [s, ""]));
  const base = { failAt: "n-4", disk: { before: null, after: null }, ledger: { before: 0, after: 0 }, response: { status: 400, error: "n-4 is NOT healthy — UNDONE: …" } };

  console.log("══ REVERSE CONTROLS — drill-upgrade-rollback ══\n");
  {
    const after = mk({ ...clean }); after["n-4"] = { ok: false, why: "no health check" };
    const v = rollbackVerdict({ ...base, before: mk(clean), after });
    ok("a correct undo passes: every other node back on the old shape, the injected node named", v.ok, v.findings.join(" | "));
    ok("…and the injected node is a FACT, not a finding", v.facts.some((f) => f.startsWith("n-4 (fault injected)")));
  }
  {
    // 🔴 The case this drill was written for: nodes before k keep the new file in memory.
    const after = mk({ ...clean, "n-2": NEW, "n-3": NEW }); after["n-4"] = { ok: false };
    const v = rollbackVerdict({ ...base, before: mk(clean), after });
    ok("🔴 nodes restarted with the new file but not restarted back ⇒ FAIL, naming each", !v.ok && v.findings.filter((f) => /NOT restarted again/.test(f)).length === 2, v.findings.join(" | "));
  }
  {
    const after = mk(clean); after["n-4"] = { ok: false }; after["n-3"] = { ok: false, why: "API not answering" };
    const v = rollbackVerdict({ ...base, before: mk(clean), after });
    ok("🔴 a node that does not answer is a finding, never agreement", !v.ok && v.findings.some((f) => /n-3 does not serve the chain/.test(f)));
  }
  {
    const after = mk(clean); after["n-4"] = { ok: false };
    const v = rollbackVerdict({ ...base, before: mk(clean), after, disk: { before: null, after: NEW } });
    ok("🔴 disk file not restored ⇒ FAIL", !v.ok && v.findings.some((f) => /upgrade.json on disk/.test(f)));
    const w = rollbackVerdict({ ...base, before: mk(clean), after, ledger: { before: 0, after: 1 } });
    ok("🔴 ledger recorded the failed upgrade ⇒ FAIL", !w.ok && w.findings.some((f) => /ledger gained 1/.test(f)));
    const x = rollbackVerdict({ ...base, before: mk(clean), after, response: { status: 200 } });
    ok("🔴 console answered 200 ⇒ FAIL", !x.ok && x.findings.some((f) => /answered 200/.test(f)));
    const y = rollbackVerdict({ ...base, before: mk(clean), after, response: { status: 400, error: "something else" } });
    ok("🔴 an error that does not say UNDONE ⇒ FAIL", !y.ok && y.findings.some((f) => /does not say the rollout was undone/.test(f)));
    // The honest answer when the injected node cannot come back: UNDO INCOMPLETE naming ONLY it.
    const z = rollbackVerdict({ ...base, before: mk(clean), after, response: { status: 400, error: "… — UNDO INCOMPLETE: … 🔴 n-4 do not serve this chain at all after the restart — a person must read their logs. Nothing was recorded." } });
    ok("UNDO INCOMPLETE naming only the injected node ⇒ pass (that is the truthful report)", z.ok, z.findings.join(" | "));
    const w2 = rollbackVerdict({ ...base, before: mk(clean), after, response: { status: 400, error: "… — UNDO INCOMPLETE: … 🔴 n-2, n-4 still carry the NEW rules and will activate them alone at T. Nothing was recorded." } });
    ok("🔴 UNDO INCOMPLETE naming a node WITHOUT the fault ⇒ FAIL", !w2.ok && w2.findings.some((f) => /n-2/.test(f) && /UNDO INCOMPLETE/.test(f)), w2.findings.join(" | "));
  }
  {
    const before = mk(clean); before["n-5"] = { ok: false };
    const v = rollbackVerdict({ ...base, before, after: mk(clean) });
    ok("🔴 a network broken BEFORE the drill is refused as a baseline", !v.ok && v.findings.some((f) => /BEFORE the rollout/.test(f)));
    ok("no services ⇒ FAIL", rollbackVerdict({ ...base, before: {}, after: {} }).ok === false);
  }
  {
    ok("heal: all nodes on the reference shape ⇒ pass", healVerdict({ nodes: mk(clean), expectedShape: "" }).ok);
    const nodes = mk(clean); nodes["n-4"] = { ok: false, why: "no health check" };
    ok("🔴 heal: the injected node still dead ⇒ FAIL naming it", !healVerdict({ nodes, expectedShape: "" }).ok);
    const drift = mk({ ...clean, "n-1": NEW });
    ok("🔴 heal: one node on another shape ⇒ FAIL", !healVerdict({ nodes: drift, expectedShape: "" }).ok);
  }
  console.log(`\n${fail === 0 ? "✅" : "🔴"} ${pass} passed · ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

// ═══════════════════════════════════════════════════════════════════════════
// MEASUREMENT — docker exec on every service of the drill compose file
// ═══════════════════════════════════════════════════════════════════════════
const COMPOSE_FILE = flag("--compose");
const CHAIN_NAME = flag("--chain");
const CONSOLE = flag("--console", "http://127.0.0.1:8511");
const TOKEN = flag("--token", process.env.A1_CONSOLE_TOKEN || "");
const FAIL_AT = flag("--fail-at");
const CONFIG_DIR = flag("--config-dir");
const PRECOMPILE = flag("--precompile", "txAllowList");
const ACTION = flag("--action", "enable");
const cannotRun = (why, how = "") => { console.log(`\n⚠️  CANNOT RUN — ${why}${how ? `\n   ${how}` : ""}`); process.exit(2); };
if (!COMPOSE_FILE || !CHAIN_NAME) cannotRun("--compose and --chain are required");
if (!existsSync(COMPOSE_FILE)) cannotRun(`compose file not found: ${COMPOSE_FILE}`);

const docker = (args, opts = {}) => {
  const r = spawnSync("docker", args, { encoding: "utf8", env: { ...process.env, MSYS_NO_PATHCONV: "1" }, maxBuffer: 1 << 24, ...opts });
  return { status: r.status, out: (r.stdout || "") + (r.stderr || "") };
};
const compose = (args) => docker(["compose", "-f", COMPOSE_FILE, ...args]);
const rpcInside = (svc, urlPath, method, params = []) => {
  const r = docker(["exec", svc, "curl", "-sf", "-m", "8", "-X", "POST", "-H", "content-type:application/json",
    "--data", JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }), `http://127.0.0.1:9650${urlPath}`]);
  if (r.status !== 0) return { ok: false, why: `curl exit ${r.status}` };
  try {
    const j = JSON.parse(r.out.slice(r.out.indexOf("{")));
    if (j.error) return { ok: false, why: j.error.message || JSON.stringify(j.error) };
    return { ok: true, result: j.result };
  } catch { return { ok: false, why: "not JSON" }; }
};
const startedAt = (svc) => { const r = docker(["inspect", "--format", "{{.State.StartedAt}}", svc]); return r.status === 0 ? r.out.trim() : null; };

function services() {
  const r = compose(["config", "--services"]);
  const list = r.out.split("\n").map((s) => s.trim()).filter((s) => /^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(s)).sort();
  if (!list.length) cannotRun("compose reported no services", r.out.slice(0, 300));
  return list;
}

function refuseOutsideDrillBand(svc) {
  const r = rpcInside(svc, "/ext/info", "info.getNetworkID");
  const id = Number(r.result?.networkID);
  if (!r.ok || !Number.isSafeInteger(id)) cannotRun(`could not read networkID from ${svc}`, r.why);
  if (id < DRILL_BAND.lo || id > DRILL_BAND.hi) cannotRun(`${svc} reports networkID ${id}, which is NOT in the drill band ${DRILL_BAND.lo}–${DRILL_BAND.hi}`, "This drill injects faults. It refuses to run against anything that could be the live network.");
  return id;
}

/** What every node LOADED for this chain, plus whether it serves it at all. */
function measureNodes(list, blockchainID) {
  const out = {};
  for (const svc of list) {
    const r = rpcInside(svc, `/ext/bc/${blockchainID}/rpc`, "eth_getChainConfig");
    out[svc] = r.ok
      ? { ok: true, shape: upgradeShape(r.result?.upgrades?.precompileUpgrades ?? []), startedAt: startedAt(svc) }
      : { ok: false, why: r.why, startedAt: startedAt(svc) };
  }
  return out;
}
const printNodes = (nodes) => { for (const [svc, n] of Object.entries(nodes)) console.log(`    ${n.ok ? "·" : "✗"} ${svc.padEnd(22)} ${n.ok ? `"${n.shape || "empty"}"` : `NOT SERVING (${n.why})`}   started ${n.startedAt ?? "?"}`); };

/**
 * HTTP to the console through `node:http`, not `fetch`: a rollout plus its undo runs longer than
 * the five minutes undici allows before the first response header (`UND_ERR_HEADERS_TIMEOUT`),
 * and that timeout is not the one `AbortSignal.timeout` controls — measured on the second drill
 * run, which lost its "after" section to it.
 */
function consoleCall(route, { method = "GET", body } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(CONSOLE + route);
    const payload = body ? JSON.stringify(body) : null;
    const req = request({
      hostname: url.hostname, port: url.port, path: url.pathname + url.search, method,
      headers: { "content-type": "application/json", authorization: `Bearer ${TOKEN}`, ...(payload ? { "content-length": Buffer.byteLength(payload) } : {}) },
      timeout: 30 * 60 * 1000,
    }, (res) => {
      let data = "";
      res.on("data", (d) => { data += d; });
      res.on("end", () => { let j = null; try { j = JSON.parse(data); } catch { /* empty */ } resolve({ status: res.statusCode, j }); });
    });
    req.on("timeout", () => { req.destroy(new Error("console did not answer within 30 minutes")); });
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}
/**
 * The chain's record: `/api/governance` carries the upgrade history but not the IDs, and `/api/chains`
 * carries the IDs. Both are read through the console (operator token) so the drill sees the same
 * ledger the console acts on.
 */
async function chainRecord() {
  const g = await consoleCall("/api/governance?name=" + encodeURIComponent(CHAIN_NAME));
  if (g.status !== 200) cannotRun(`console did not answer /api/governance for "${CHAIN_NAME}": ${g.status} ${g.j?.error ?? ""}`);
  const c = await consoleCall("/api/chains");
  const rec = (c.j?.chains ?? []).find((x) => x.name === CHAIN_NAME);
  if (!rec?.blockchainID || !rec?.subnetID) cannotRun(`"${CHAIN_NAME}" has no blockchainID in /api/chains (${c.status})`);
  return { ...g.j, blockchainID: rec.blockchainID, subnetID: rec.subnetID };
}
const diskShape = (blockchainID) => {
  if (!CONFIG_DIR) return undefined;
  const p = path.join(CONFIG_DIR, "chains", blockchainID, "upgrade.json");
  if (!existsSync(p)) return null;
  try { return upgradeShape(JSON.parse(readFileSync(p, "utf8")).precompileUpgrades); } catch { return "<unparsable>"; }
};

// ─── fault injection: a nested bind mount for ONE service ───────────────────
const MARK = "# drill-upgrade-rollback: injected fault";
function injectFault(svc, blockchainID) {
  const brokenDir = path.join(path.dirname(COMPOSE_FILE), `drill-broken-${blockchainID}`);
  mkdirSync(brokenDir, { recursive: true });
  const src = path.join(CONFIG_DIR, "chains", blockchainID, "config.json");
  if (existsSync(src)) copyFileSync(src, path.join(brokenDir, "config.json"));
  writeFileSync(path.join(brokenDir, "upgrade.json"), "{ this is not json\n");
  const text = readFileSync(COMPOSE_FILE, "utf8");
  if (text.includes(MARK)) cannotRun("the compose file already carries an injected fault — run --heal first");
  const lines = text.split("\n");
  const at = lines.findIndex((l) => l.trim() === `container_name: ${svc}`);
  if (at < 0) cannotRun(`service ${svc} not found in ${COMPOSE_FILE}`);
  const mountLine = lines.findIndex((l, i) => i > at && /:\/9chain-a1\/config:ro\s*$/.test(l));
  if (mountLine < 0) cannotRun(`no /9chain-a1/config mount under ${svc}`);
  const indent = lines[mountLine].match(/^\s*/)[0];
  const hostPath = brokenDir.replace(/\\/g, "/").replace(/^([A-Za-z]):/, (_, d) => `/${d.toLowerCase()}`);
  lines.splice(mountLine + 1, 0, `${indent}- ${hostPath}:/9chain-a1/config/chains/${blockchainID}:ro ${MARK}`);
  copyFileSync(COMPOSE_FILE, COMPOSE_FILE + ".pre-drill");
  writeFileSync(COMPOSE_FILE, lines.join("\n"));
  return { brokenDir, hostPath };
}
function removeFault() {
  const text = readFileSync(COMPOSE_FILE, "utf8");
  if (!text.includes(MARK)) return false;
  writeFileSync(COMPOSE_FILE, text.split("\n").filter((l) => !l.includes(MARK)).join("\n"));
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// MODES
// ═══════════════════════════════════════════════════════════════════════════
const list = services();
refuseOutsideDrillBand(list[0]);

if (has("--measure")) {
  const rec = await chainRecord();
  console.log(`\n══ ${CHAIN_NAME} (${rec.blockchainID}) — what each node loaded ══`);
  const nodes = measureNodes(list, rec.blockchainID);
  printNodes(nodes);
  const shapes = new Set(Object.values(nodes).filter((n) => n.ok).map((n) => n.shape));
  const dead = Object.entries(nodes).filter(([, n]) => !n.ok).map(([s]) => s);
  console.log(`\n  disk: ${diskShape(rec.blockchainID) === undefined ? "(no --config-dir)" : `"${diskShape(rec.blockchainID) ?? "absent"}"`} · shapes on nodes: ${shapes.size} · not serving: ${dead.length ? dead.join(", ") : "none"}`);
  process.exit(shapes.size === 1 && dead.length === 0 ? 0 : 1);
}

if (has("--heal")) {
  // Heal = remove the fault, then recreate every node that is not on the reference shape — the
  // injected node, and (after a run that exposed the bug) the nodes the undo left on the new file.
  // The reference is the file on disk when `--config-dir` is given (disk is the intent), otherwise
  // the shape the majority of serving nodes report.
  if (!FAIL_AT) cannotRun("--fail-at is required for --heal");
  const rec = await chainRecord();
  const bc = rec.blockchainID;
  const removed = removeFault();
  console.log(`\n══ heal — ${removed ? "injected mount removed from the compose file" : "no injected mount found"} ══`);
  let all = measureNodes(list, bc);
  let ref = diskShape(bc);
  if (ref === undefined || ref === "<unparsable>") {
    const counts = new Map();
    for (const n of Object.values(all)) if (n.ok) counts.set(n.shape, (counts.get(n.shape) ?? 0) + 1);
    ref = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
  }
  ref = ref ?? "";
  const drifted = list.filter((s) => s === FAIL_AT || !all[s].ok || all[s].shape !== ref);
  console.log(`  reference shape "${ref || "empty"}" · recreating: ${drifted.join(", ") || "nothing"}`);
  for (const svc of drifted) {
    const t0 = startedAt(svc);
    const r = compose(["up", "-d", "--no-deps", "--force-recreate", svc]);
    if (r.status !== 0) cannotRun(`compose up failed for ${svc}`, r.out.slice(0, 400));
    let n;
    for (let i = 0; i < 60; i++) {
      n = measureNodes([svc], bc)[svc];
      if (n.ok && n.shape === ref) break;
      await new Promise((res) => setTimeout(res, 3000));
    }
    console.log(`  ${svc.padEnd(22)} ${t0} → ${startedAt(svc)}  ${n.ok ? `"${n.shape || "empty"}"` : `NOT SERVING (${n.why})`}`);
  }
  all = measureNodes(list, bc);
  printNodes(all);
  const v = healVerdict({ nodes: all, expectedShape: ref });
  console.log(v.ok ? `\n✅ healed: ${list.length}/${list.length} nodes serve "${CHAIN_NAME}" with "${ref || "empty"}"` : `\n🔴 NOT healed:\n  - ${v.findings.join("\n  - ")}`);
  process.exit(v.ok ? 0 : 1);
}

if (has("--run")) {
  if (!FAIL_AT || !CONFIG_DIR || !TOKEN) cannotRun("--run needs --fail-at, --config-dir and --token");
  if (!list.includes(FAIL_AT)) cannotRun(`${FAIL_AT} is not a service of ${COMPOSE_FILE} (${list.join(", ")})`);
  const rec = await chainRecord();
  const bc = rec.blockchainID;
  console.log(`\n══ DRILL: upgrade "${CHAIN_NAME}" (${bc}), fault injected into ${FAIL_AT} ══`);
  console.log(`  precompile ${PRECOMPILE} · action ${ACTION} · ${list.length} services`);

  console.log("\n── before ──");
  const before = measureNodes(list, bc);
  printNodes(before);
  const diskBefore = diskShape(bc);
  const ledgerBefore = (rec.upgrades ?? []).length;
  if (Object.values(before).some((n) => !n.ok)) cannotRun("not every node serves the chain before the drill — heal the network first (`--heal`, or `--measure` to see who)");

  const { hostPath } = injectFault(FAIL_AT, bc);
  console.log(`\n── fault: ${FAIL_AT} will mount ${hostPath} over chains/${bc} (upgrade.json there is not JSON) ──`);

  console.log("\n── POST /api/upgrade ──");
  const t0 = Date.now();
  const stepsSeen = new Map();
  const poll = setInterval(async () => {
    try {
      const p = await consoleCall("/api/progress");
      for (const b of p.j?.steps ?? []) {
        const key = `${b.code}:${b.status}`;
        if (!stepsSeen.has(key)) { stepsSeen.set(key, Date.now()); console.log(`    +${((Date.now() - t0) / 1000).toFixed(0).padStart(4)}s  ${b.code} → ${b.status}`); }
      }
    } catch { /* console busy */ }
  }, 1000);
  const resp = await consoleCall("/api/upgrade", { method: "POST", body: { name: CHAIN_NAME, precompile: PRECOMPILE, action: ACTION, confirm: CHAIN_NAME } });
  clearInterval(poll);
  console.log(`  console answered ${resp.status} after ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  console.log(`  ${String(resp.j?.error ?? JSON.stringify(resp.j)).slice(0, 900)}`);

  console.log("\n── after ──");
  const after = measureNodes(list, bc);
  printNodes(after);
  const rec2 = await chainRecord();
  const disk = { before: diskBefore, after: diskShape(bc) };
  const ledger = { before: ledgerBefore, after: (rec2.upgrades ?? []).length };
  console.log(`  disk: "${disk.before ?? "absent"}" → "${disk.after ?? "absent"}" · ledger upgrades: ${ledger.before} → ${ledger.after}`);
  const leftovers = readdirSync(path.join(CONFIG_DIR, "chains", bc)).filter((f) => f.startsWith("upgrade.json."));
  if (leftovers.length) console.log(`  files left beside upgrade.json: ${leftovers.join(", ")}`);

  const v = rollbackVerdict({ before, after, failAt: FAIL_AT, disk, ledger, response: { status: resp.status, error: resp.j?.error } });
  console.log("\n── verdict ──");
  for (const f of v.facts) console.log(`  · ${f}`);
  for (const f of v.findings) console.log(`  🔴 ${f}`);
  console.log(v.ok ? "\n✅ the undo left every node it touched on the old file" : `\n🔴 the undo did NOT restore the network — ${v.findings.length} finding(s)`);
  console.log(`\nNext: node scripts/drill-upgrade-rollback.mjs --heal --compose ${COMPOSE_FILE} --chain "${CHAIN_NAME}" --fail-at ${FAIL_AT} --console ${CONSOLE} --token …`);
  process.exit(v.ok ? 0 : 1);
}

cannotRun("choose one of --self-test · --measure · --run · --heal");
