#!/usr/bin/env node
/**
 * check-plugin-memlimit.mjs — gate: **the Go memory limit is live INSIDE every VM plugin process**,
 * not merely present in the container's environment (P-91, D-243).
 *
 * ═══ WHY IT EXISTS ═══
 *
 * A node runs one `avalanchego` process plus one subnet-evm plugin process per tracked chain. On the
 * drill band those plugins hold the LARGER half of the memory: 923 MiB across 8 plugins against
 * 628 MiB for avalanchego (node-9, 2026-09-08). Go does not read the cgroup limit, so without
 * GOMEMLIMIT the runtime sizes the heap from GOGC alone and an OOM is a certainty rather than a
 * risk (measured on 9Chain C1, 2026-07-22: RSS 1,069 -> 191 MB once it was set).
 *
 * 🔴 The trap this gate exists to catch: setting GOMEMLIMIT in `environment:` of the compose file
 * does NOT reach the plugins. `vms/rpcchainvm/runtime/subprocess/runtime.go:76-82` builds the
 * plugin's environment FROM EMPTY and forwards only variables prefixed `GRPC_` or `GODEBUG`. A
 * plugin process carries exactly one variable: AVALANCHE_VM_RUNTIME_ENGINE_ADDR. So a gate that
 * asks "is the variable set in the container?" is green while the larger half of the memory runs
 * unlimited — the project's most expensive error class: measuring a different quantity.
 *
 * What it reads, where:
 *   /proc/<pid>/environ  of EVERY process inside <svc>   — the limit as the process actually has it
 *   /proc/<pid>/exe      to tell a plugin from the node  — a plugin's binary lives in a plugins dir
 *
 * Exit: 0 node and every plugin carry the limit · 1 someone is missing it (the node NAMED, and
 * whether it is the node half or the plugin half) · 2 a node could not be measured — never 0,
 * because a container that answers nothing has not been shown to be correct.
 *
 * Usage:
 *   node scripts/check-plugin-memlimit.mjs --compose local-net/net-tap-g1/docker-compose.multinode.yml
 *   node scripts/check-plugin-memlimit.mjs --services 9chain-a1-tap-node-1,9chain-a1-tap-node-2 --expect 700MiB
 *   node scripts/check-plugin-memlimit.mjs --self-test
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { guardEntry } from '../local-net/lib/cli.mjs';

// 🔴 A flag this gate does not know is exit 2 — "could not run", never a verdict (D-244).
guardEntry(import.meta.url, ['--compose', '--expect', '--expect-plugin', '--json', '--self-test', '--services']);

const argv = process.argv.slice(2);
const flag = (name, fallback) => { const i = argv.indexOf(name); return i >= 0 && argv[i + 1] !== undefined && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback; };
const SELF_TEST = argv.includes("--self-test");
const COMPOSE = flag("--compose", null);
const SERVICES = flag("--services", null);
const EXPECT = flag("--expect", null);
const EXPECT_PLUGIN = flag("--expect-plugin", null);
const JSON_OUT = argv.includes("--json");

/** Bytes for a Go memory-limit string (`600MiB`, `1GiB`, `734003200`), or null if unreadable. */
export function limitBytes(raw) {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim();
  if (s === "" || s === "math.MaxInt64") return null;
  const m = /^(\d+(?:\.\d+)?)\s*(B|KiB|MiB|GiB|TiB)?$/.exec(s);
  if (!m) return null;
  const unit = { undefined: 1, B: 1, KiB: 1024, MiB: 1024 ** 2, GiB: 1024 ** 3, TiB: 1024 ** 4 }[m[2]];
  return Math.round(Number(m[1]) * unit);
}

/**
 * One node's verdict, from data. Pure — this is what the self-test drives.
 * @param {{ svc: string, procs: {kind: "node"|"plugin", pid: string, comm: string, limit: string|null}[]|null,
 *           expect: string|null, expectPlugin: string|null }} p
 */
export function judgeNode({ svc, procs, expect = null, expectPlugin = null }) {
  if (procs === null) return { svc, verdict: "unreachable", detail: "the process table could not be read inside the container" };
  const node = procs.filter((p) => p.kind === "node");
  const plugins = procs.filter((p) => p.kind === "plugin");
  if (node.length === 0) return { svc, verdict: "unreachable", detail: "no avalanchego process found — the container is not running the node" };
  if (plugins.length === 0) return { svc, verdict: "unreachable", detail: "no plugin process found — a node tracking no chain cannot show a plugin limit" };

  const want = limitBytes(expect);
  const wantPlugin = limitBytes(expectPlugin) ?? want;
  const missNode = node.filter((p) => limitBytes(p.limit) === null);
  const missPlugin = plugins.filter((p) => limitBytes(p.limit) === null);

  // The trap, named on its own: the container has it, the plugins do not.
  if (missPlugin.length > 0 && missNode.length === 0) {
    return {
      svc, verdict: "plugins-unlimited", plugins: plugins.length,
      detail: `avalanchego has GOMEMLIMIT but ${missPlugin.length}/${plugins.length} plugin(s) do NOT — the compose environment does not reach a plugin (runtime.go forwards only GRPC_*/GODEBUG)`,
    };
  }
  if (missNode.length > 0 && missPlugin.length > 0) return { svc, verdict: "unlimited", plugins: plugins.length, detail: `neither avalanchego nor ${missPlugin.length}/${plugins.length} plugin(s) carry GOMEMLIMIT` };
  if (missNode.length > 0) return { svc, verdict: "node-unlimited", plugins: plugins.length, detail: `the ${plugins.length} plugin(s) carry GOMEMLIMIT but avalanchego does not` };

  const wrongNode = want === null ? [] : node.filter((p) => limitBytes(p.limit) !== want);
  const wrongPlugin = wantPlugin === null ? [] : plugins.filter((p) => limitBytes(p.limit) !== wantPlugin);
  if (wrongNode.length > 0) return { svc, verdict: "wrong-value", plugins: plugins.length, detail: `avalanchego has GOMEMLIMIT=${node[0].limit}, expected ${expect}` };
  if (wrongPlugin.length > 0) return { svc, verdict: "wrong-value", plugins: plugins.length, detail: `${wrongPlugin.length}/${plugins.length} plugin(s) have GOMEMLIMIT=${wrongPlugin[0].limit}, expected ${expectPlugin ?? expect}` };

  return { svc, verdict: "ok", plugins: plugins.length, detail: `avalanchego ${node[0].limit} · ${plugins.length}/${plugins.length} plugin(s) ${plugins[0].limit}` };
}

/** Every process inside the container that is either the node or a plugin, with its GOMEMLIMIT. */
// Written line by line: a template literal would swallow the shell's own ${...} expansions.
const PROBE = [
  "for d in /proc/[0-9]*; do",
  '  e=$(readlink "$d/exe" 2>/dev/null) || continue',
  '  c=$(cat "$d/comm" 2>/dev/null)',
  "  g=$(tr '\\0' '\\n' < \"$d/environ\" 2>/dev/null | sed -n 's/^GOMEMLIMIT=//p' | head -1)",
  '  p=${d#/proc/}',
  '  case "$e" in */plugins/*) echo "plugin|$p|$c|$g"; continue;; esac',
  '  case "$c" in avalanchego) echo "node|$p|$c|$g";; esac',
  "done",
].join("\n");

/** Ask one container. Returns the parsed process list, or null when it could not be measured. */
function probe(svc) {
  let out;
  try {
    out = execFileSync("docker", ["exec", svc, "sh", "-c", PROBE], { encoding: "utf8", timeout: 60_000, env: { ...process.env, MSYS_NO_PATHCONV: "1" } });
  } catch { return null; }
  const procs = [];
  for (const line of out.split("\n")) {
    const parts = line.trim().split("|");
    if (parts.length < 3) continue;
    const [kind, pid, comm, limit = ""] = parts;
    if (kind !== "node" && kind !== "plugin") continue;
    procs.push({ kind, pid, comm, limit: limit === "" ? null : limit });
  }
  return procs;
}

/** Service names of a compose file, without needing docker compose to parse it. */
function servicesOf(composePath) {
  const text = readFileSync(composePath, "utf8");
  const names = [];
  let inServices = false;
  for (const raw of text.split(/\r?\n/)) {
    if (/^services:\s*$/.test(raw)) { inServices = true; continue; }
    if (inServices && /^\S/.test(raw)) break;
    const m = inServices && /^ {2}([A-Za-z0-9._-]+):\s*$/.exec(raw);
    if (m) names.push(m[1]);
  }
  return names;
}

/** Container name a compose service runs under, or the service name when it declares one. */
function containerNames(composePath, names) {
  const text = readFileSync(composePath, "utf8");
  const out = [];
  for (const name of names) {
    const re = new RegExp(`^ {2}${name}:\\s*$([\\s\\S]*?)(?=^ {2}\\S|\\Z)`, "m");
    const block = re.exec(text)?.[1] ?? "";
    const cn = /^\s{4}container_name:\s*(\S+)\s*$/m.exec(block)?.[1];
    out.push(cn ?? name);
  }
  return out;
}

function selfTest() {
  const cases = [];
  const check = (title, got, want) => cases.push({ title, ok: got === want, got, want });
  const node = (limit) => ({ kind: "node", pid: "1", comm: "avalanchego", limit });
  const plug = (limit, n = 8) => Array.from({ length: n }, (_, i) => ({ kind: "plugin", pid: String(100 + i), comm: "pkqXszJe86D3xLo", limit }));

  check("both carry the limit ⇒ ok", judgeNode({ svc: "n1", procs: [node("600MiB"), ...plug("300MiB")] }).verdict, "ok");
  // 🔴 The case this gate exists for: compose sets it, plugins never see it.
  const trap = judgeNode({ svc: "n1", procs: [node("600MiB"), ...plug(null)] });
  check("compose only ⇒ plugins-unlimited", trap.verdict, "plugins-unlimited");
  check("…and it names the plugin half", /8\/8 plugin\(s\) do NOT/.test(trap.detail), true);
  check("nothing set ⇒ unlimited", judgeNode({ svc: "n1", procs: [node(null), ...plug(null)] }).verdict, "unlimited");
  check("plugins only ⇒ node-unlimited", judgeNode({ svc: "n1", procs: [node(null), ...plug("300MiB")] }).verdict, "node-unlimited");
  check("wrong value ⇒ wrong-value", judgeNode({ svc: "n1", procs: [node("600MiB"), ...plug("300MiB")], expect: "700MiB" }).verdict, "wrong-value");
  check("right value ⇒ ok", judgeNode({ svc: "n1", procs: [node("700MiB"), ...plug("700MiB")], expect: "700MiB" }).verdict, "ok");
  check("plugins may differ from the node", judgeNode({ svc: "n1", procs: [node("700MiB"), ...plug("300MiB")], expect: "700MiB", expectPlugin: "300MiB" }).verdict, "ok");
  // Silence is never a pass.
  check("unreadable process table ⇒ unreachable", judgeNode({ svc: "n1", procs: null }).verdict, "unreachable");
  check("no plugin at all ⇒ unreachable, not ok", judgeNode({ svc: "n1", procs: [node("600MiB")] }).verdict, "unreachable");
  check("no node process ⇒ unreachable", judgeNode({ svc: "n1", procs: plug("300MiB") }).verdict, "unreachable");
  // The runtime writes math.MaxInt64 when no limit is set; that must read as "no limit".
  check("math.MaxInt64 reads as no limit", judgeNode({ svc: "n1", procs: [node("600MiB"), ...plug("math.MaxInt64")] }).verdict, "plugins-unlimited");
  check("bytes parse without a unit", limitBytes("734003200"), 734003200);
  check("GiB parses", limitBytes("1GiB"), 1073741824);
  check("garbage does not parse", limitBytes("lots"), null);

  const bad = cases.filter((c) => !c.ok);
  for (const c of cases) console.log(`${c.ok ? "  ✓" : "  ✗"} ${c.title}${c.ok ? "" : ` — got ${JSON.stringify(c.got)}, want ${JSON.stringify(c.want)}`}`);
  console.log(`\n${cases.length - bad.length}/${cases.length} case(s) pass`);
  process.exit(bad.length === 0 ? 0 : 1);
}

function main() {
  if (SELF_TEST) return selfTest();
  let names;
  if (SERVICES) names = SERVICES.split(",").map((s) => s.trim()).filter(Boolean);
  else if (COMPOSE) names = containerNames(COMPOSE, servicesOf(COMPOSE));
  else { console.error("give --compose <file> or --services <a,b,c> (or --self-test)"); process.exit(2); }

  const results = names.map((svc) => judgeNode({ svc, procs: probe(svc), expect: EXPECT, expectPlugin: EXPECT_PLUGIN }));
  if (JSON_OUT) { console.log(JSON.stringify(results, null, 2)); }
  else {
    console.log(`GOMEMLIMIT inside ${names.length} node(s)${EXPECT ? `, expecting ${EXPECT}` : ""}\n`);
    for (const r of results) console.log(`  ${r.verdict === "ok" ? "✓" : r.verdict === "unreachable" ? "?" : "✗"} ${r.svc.padEnd(24)} ${r.detail}`);
  }
  const unreachable = results.filter((r) => r.verdict === "unreachable").length;
  const bad = results.filter((r) => r.verdict !== "ok" && r.verdict !== "unreachable").length;
  console.log(`\n${results.length - bad - unreachable}/${results.length} node(s) fully limited · ${bad} unlimited · ${unreachable} not measurable`);
  process.exit(unreachable > 0 ? 2 : bad > 0 ? 1 : 0);
}

main();
