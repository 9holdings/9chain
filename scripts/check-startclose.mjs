#!/usr/bin/env node
/**
 * check-startclose.mjs — gate: **no node was ever cut by a peer for tracking too many subnets,
 * and every node still has its peers** — measured on every node, on every machine (P-88, D-241).
 *
 * ═══ WHY IT EXISTS ═══
 *
 * The 16-subnet handshake limit (network/peer/peer.go, D-009) does not fail loudly: a node that
 * announces 17 subnets keeps running with a clean log of its own while every peer closes the
 * connection (`StartClose`). The only places it shows are the PEERS' logs ("too many tracked
 * subnets") and the node's peer count. PLAN-108 §5 makes "0 StartClose" the hard pass condition
 * of every phase; the K1 kit measured it with `14-startclose.sh` on one machine. This is that
 * measurement as a gate, for a fleet: local containers, or machines named in a nodes.json /
 * inventory over ssh, one verdict per node, the failing node NAMED.
 *
 * What it reads, where:
 *   `docker logs <svc>`             — on the machine that runs the container
 *   `info.peers` inside <svc>       — numPeers, asked on the node's own API
 *
 * Exit: 0 every node clean and connected · 1 a node was cut or is short of peers · 2 a node could
 * not be measured (never 0 — silence is not a clean log).
 *
 * Usage:
 *   node scripts/check-startclose.mjs --compose local-net/net-tap-g1/docker-compose.multinode.yml [--expect-peers 8]
 *   node scripts/check-startclose.mjs --nodes out/deploy/nodes.json --ssh-user root [--ssh-key ~/.ssh/k1]
 *   node scripts/check-startclose.mjs --self-test
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
// The node's API as seen INSIDE its container — declared once (check-single-source).
import { MANAGED_NODE_API } from "../local-net/lib/managed-node-rpc.mjs";
import { guardEntry } from '../local-net/lib/cli.mjs';

// 🔴 A flag this gate does not know is exit 2 — "could not run", never a verdict (D-244).
guardEntry(import.meta.url, ['--compose', '--data', '--expect-peers', '--no-stream', '--nodes', '--self-test', '--services', '--ssh-key', '--ssh-user', '--tail', '--with-load']);

const argv = process.argv.slice(2);
const flag = (name, fallback) => { const i = argv.indexOf(name); return i >= 0 && argv[i + 1] !== undefined && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback; };
const SELF_TEST = argv.includes("--self-test");
const COMPOSE = flag("--compose", null);
const NODES = flag("--nodes", null);
const SSH_USER = flag("--ssh-user", "root");
const SSH_KEY = flag("--ssh-key", null);
const EXPECT_PEERS = flag("--expect-peers", null);
const WITH_LOAD = argv.includes("--with-load");

const CUT_RE = /too many tracked subnets|maxNumTrackedSubnets/i;

/**
 * One node's verdict, from data. Pure.
 * @param {{ svc: string, logText: string|null, numPeers: number|null, expectPeers: number|null }} p
 */
export function judgeNode({ svc, logText, numPeers, expectPeers }) {
  if (logText === null) return { svc, verdict: "unreachable", detail: "docker logs could not be read" };
  const cuts = logText.split("\n").filter((l) => CUT_RE.test(l)).length;
  const startClose = logText.split("\n").filter((l) => /StartClose/.test(l)).length;
  if (cuts > 0) return { svc, verdict: "cut", detail: `${cuts} "too many tracked subnets" line(s) in its log — a peer announced > 16 subnets and was dropped`, cuts, startClose, numPeers };
  if (numPeers === null) return { svc, verdict: "unreachable", detail: "info.peers could not be asked", cuts, startClose };
  if (expectPeers !== null && numPeers < expectPeers) return { svc, verdict: "isolated", detail: `${numPeers} peer(s), expected ≥ ${expectPeers}`, cuts, startClose, numPeers };
  return { svc, verdict: "ok", detail: `0 cuts · ${startClose} StartClose line(s) · ${numPeers} peer(s)`, cuts, startClose, numPeers };
}

/** Run a docker command locally or on a remote machine. Returns stdout+stderr, or null on failure. */
function runDocker(host, args) {
  try {
    if (!host) return execFileSync("docker", args, { encoding: "utf8", maxBuffer: 1 << 26, stdio: ["ignore", "pipe", "pipe"] });
    const ssh = ["-o", "BatchMode=yes", "-o", "ConnectTimeout=15", ...(SSH_KEY ? ["-i", SSH_KEY] : []), `${SSH_USER}@${host}`, "docker", ...args];
    return execFileSync("ssh", ssh, { encoding: "utf8", maxBuffer: 1 << 26, stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) { return e.stdout && /^Error|No such/.test(String(e.stderr ?? "")) ? null : (e.stdout ? String(e.stdout) + String(e.stderr ?? "") : null); }
}

function measureNode({ host, svc }) {
  const logText = (() => { try { return runDocker(host, ["logs", "--tail", "20000", svc]); } catch { return null; } })();
  let numPeers = null;
  const out = runDocker(host, ["exec", svc, "curl", "-sf", "-m", "5", "-X", "POST", "-H", "content-type:application/json",
    "--data", '{"jsonrpc":"2.0","id":1,"method":"info.peers","params":{}}', `${MANAGED_NODE_API}/ext/info`]);
  try { const n = Number(JSON.parse(out.slice(out.indexOf("{"))).result?.numPeers); if (Number.isSafeInteger(n)) numPeers = n; } catch { /* unreachable */ }
  let mem = null;
  if (WITH_LOAD) { const s = runDocker(host, ["stats", "--no-stream", "--format", "{{.MemUsage}}", svc]); mem = s ? s.trim().split("/")[0].trim() : null; }
  return { logText, numPeers, mem };
}

function targets() {
  if (COMPOSE) {
    const raw = execFileSync("docker", ["compose", "-f", COMPOSE, "config", "--services"], { encoding: "utf8" });
    return raw.split("\n").map((s) => s.trim()).filter((s) => /^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(s)).sort().map((svc) => ({ host: null, svc, label: svc }));
  }
  if (NODES) {
    const placed = JSON.parse(readFileSync(NODES, "utf8"));
    return placed.map((n) => ({ host: n.Machine?.IP ?? n.machineIp ?? null, svc: n.Service ?? n.service, label: `${n.Machine?.Name ?? n.machine ?? "?"}/${n.Service ?? n.service}` }));
  }
  return null;
}

async function main() {
  if (SELF_TEST) return selfTest();
  const list = targets();
  if (!list) { console.log("🔴 --compose <file> (local containers) or --nodes <nodes.json> (fleet over ssh) is required"); return 2; }
  const expectPeers = EXPECT_PEERS !== null ? Number(EXPECT_PEERS) : list.length - 1;
  console.log(`\n══ STARTCLOSE / PEERS — ${list.length} node(s), expecting ≥ ${expectPeers} peer(s) each ══\n`);
  const results = [];
  for (const t of list) {
    const m = measureNode(t);
    const v = judgeNode({ svc: t.label, logText: m.logText, numPeers: m.numPeers, expectPeers });
    results.push(v);
    const mark = v.verdict === "ok" ? "✓" : v.verdict === "unreachable" ? "⁇" : "🔴";
    console.log(`  ${mark} ${t.label.padEnd(28)} ${v.detail}${m.mem ? ` · RAM ${m.mem}` : ""}`);
  }
  const reds = results.filter((r) => r.verdict === "cut" || r.verdict === "isolated");
  const unknown = results.filter((r) => r.verdict === "unreachable");
  console.log();
  if (reds.length) { console.log(`🔴 FAIL — ${reds.map((r) => `${r.svc} (${r.verdict})`).join(", ")}`); return 1; }
  if (unknown.length) { console.log(`⁇ INCONCLUSIVE — could not measure ${unknown.map((r) => r.svc).join(", ")}`); return 2; }
  console.log(`✅ PASS — ${results.length}/${results.length} node(s): no peer was ever dropped for tracking too many subnets, every node has its peers`);
  return 0;
}

function selfTest() {
  let pass = 0, fail = 0;
  const ok = (name, cond, seen) => { if (cond) { pass++; console.log(`  ✓ ${name}`); } else { fail++; console.log(`  ✗ ${name}  — got: ${seen}`); } };
  console.log("\n══ COUNTER-CHECK — check-startclose ══\n");
  const clean = "INFO node started\nINFO connected to peer\n";
  const cut = clean + 'WARN [network/peer] too many tracked subnets: 17 > 16 nodeID=NodeID-abc\nINFO StartClose()\n';
  ok("a clean log with peers ⇒ ok", judgeNode({ svc: "n1", logText: clean, numPeers: 8, expectPeers: 8 }).verdict === "ok", "red");
  const c = judgeNode({ svc: "n2", logText: cut, numPeers: 8, expectPeers: 8 });
  ok("🔴 a 'too many tracked subnets' line ⇒ cut, naming the node", c.verdict === "cut" && c.svc === "n2" && c.cuts === 1, JSON.stringify(c));
  ok("🔴 …judged before the peer count (a cut node may still show peers)", judgeNode({ svc: "n2", logText: cut, numPeers: null, expectPeers: 8 }).verdict === "cut", "unreachable");
  ok("🔴 too few peers ⇒ isolated", judgeNode({ svc: "n3", logText: clean, numPeers: 2, expectPeers: 8 }).verdict === "isolated", "ok");
  ok("CONTROL — exactly the expected peer count passes", judgeNode({ svc: "n3", logText: clean, numPeers: 8, expectPeers: 8 }).verdict === "ok", "isolated");
  ok("🔴 an unreadable log is unreachable, never ok (silence is not a clean log)", judgeNode({ svc: "n4", logText: null, numPeers: 8, expectPeers: 8 }).verdict === "unreachable", "ok");
  ok("🔴 no peer count is unreachable", judgeNode({ svc: "n5", logText: clean, numPeers: null, expectPeers: 8 }).verdict === "unreachable", "ok");
  ok("a generic StartClose line alone (not the subnet reason) is counted but not red", judgeNode({ svc: "n6", logText: clean + "INFO StartClose() reason=timeout\n", numPeers: 8, expectPeers: 8 }).verdict === "ok", "red");
  ok("the constant name in the log (maxNumTrackedSubnets) is the same signal", judgeNode({ svc: "n7", logText: clean + "error: maxNumTrackedSubnets exceeded\n", numPeers: 8, expectPeers: 8 }).verdict === "cut", "ok");
  console.log(`\n${fail === 0 ? "✅" : "🔴"} ${pass} passed · ${fail} failed`);
  return fail === 0 ? 0 : 1;
}

main().then((code) => process.exit(code)).catch((e) => { console.error(`\n🔴 ${e.stack ?? e.message}`); process.exit(2); });
