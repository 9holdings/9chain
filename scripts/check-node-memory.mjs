#!/usr/bin/env node
/**
 * check-node-memory.mjs — gate: **no node is over its memory budget, and the budget is expressed
 * per tracked chain** (P-93, D-243).
 *
 * ═══ WHY IT EXISTS ═══
 *
 * Phase 1 of L1-108 found the wall: with 15 L1s at V = 5 the fleet went 2,448 -> 15,621 MiB in
 * 6 h, and the growth follows transactions rather than the clock (idle for 3 h afterwards: flat).
 * A flat "must stay under N MiB" threshold cannot say anything useful across the phases, because
 * a node carries 8.3 chains in phase 1 and 60 in phase 3. So the budget here is
 *
 *     base + perChain x (number of plugin processes)
 *
 * and the number of plugins is MEASURED on the node, not assumed from a ledger. That is the whole
 * point: it is the same question the procurement asks — does a machine of this size hold this many
 * chains — asked in the one place that can answer it.
 *
 * With a series (--series, the jsonl the RAM sampler writes) it also judges the SLOPE, because a
 * node inside its budget while climbing 123 MiB/hour is not a node that passes; it is a node that
 * has not failed yet.
 *
 * What it reads, where:
 *   /proc/<pid>/status inside <svc>  — RSS of avalanchego and of every plugin process
 *   /proc/<pid>/exe    inside <svc>  — to tell a plugin from the node
 *
 * Exit: 0 every node inside budget (and, when a series is given, not climbing past the allowance)
 * · 1 a node is over — NAMED, with which half is heavy · 2 a node could not be measured. Never 0
 * for silence: a node that does not answer has not been shown to be inside anything.
 *
 * Usage:
 *   node scripts/check-node-memory.mjs --compose local-net/net-tap-g1/docker-compose.multinode.yml \
 *        --base 800 --per-chain 220
 *   node scripts/check-node-memory.mjs --services a,b --base 800 --per-chain 220 \
 *        --series <ram.jsonl> --max-slope 20
 *   node scripts/check-node-memory.mjs --self-test
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { guardEntry } from '../local-net/lib/cli.mjs';

// 🔴 A flag this gate does not know is exit 2 — "could not run", never a verdict (D-244).
guardEntry(import.meta.url, ['--base', '--compose', '--json', '--max-slope', '--per-chain', '--self-test', '--series', '--services']);

const argv = process.argv.slice(2);
const flag = (name, fallback) => { const i = argv.indexOf(name); return i >= 0 && argv[i + 1] !== undefined && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback; };
const num = (name, fallback) => { const v = flag(name, null); return v === null ? fallback : Number(v); };
const SELF_TEST = argv.includes("--self-test");
const COMPOSE = flag("--compose", null);
const SERVICES = flag("--services", null);
const BASE = num("--base", 800);          // MiB for avalanchego itself, chains aside
const PER_CHAIN = num("--per-chain", 220); // MiB per tracked chain (one plugin process each)
const SERIES = flag("--series", null);
const MAX_SLOPE = num("--max-slope", null); // MiB per chain per hour, when a series is given
const JSON_OUT = argv.includes("--json");

/**
 * One node's verdict, from data. Pure — the self-test drives this and nothing else.
 * @param {{ svc: string, nodeRssMiB: number|null, pluginRssMiB: number|null, plugins: number|null,
 *           base: number, perChain: number, slopeMiBPerChainHour: number|null, maxSlope: number|null }} p
 */
export function judgeNode({ svc, nodeRssMiB, pluginRssMiB, plugins, base, perChain, slopeMiBPerChainHour = null, maxSlope = null }) {
  if (nodeRssMiB === null || pluginRssMiB === null || plugins === null) {
    return { svc, verdict: "unreachable", detail: "memory could not be read inside the container" };
  }
  if (plugins === 0) {
    // A node tracking nothing is not evidence about a budget for tracked chains.
    return { svc, verdict: "unreachable", detail: "no plugin process — a node tracking no chain says nothing about a per-chain budget" };
  }
  const used = nodeRssMiB + pluginRssMiB;
  const budget = base + perChain * plugins;
  const headroom = budget - used;
  const shape = `${used} MiB used of ${budget} (${nodeRssMiB} node + ${pluginRssMiB} across ${plugins} plugin(s))`;

  if (used > budget) {
    const heavier = pluginRssMiB / plugins > perChain ? `the plugins average ${Math.round(pluginRssMiB / plugins)} MiB against ${perChain} allowed` : `avalanchego alone is ${nodeRssMiB} MiB against ${base} allowed`;
    return { svc, verdict: "over-budget", used, budget, plugins, detail: `${shape} — ${heavier}` };
  }
  if (maxSlope !== null && slopeMiBPerChainHour !== null && slopeMiBPerChainHour > maxSlope) {
    return { svc, verdict: "climbing", used, budget, plugins, slope: slopeMiBPerChainHour, detail: `${shape}, inside budget but growing ${slopeMiBPerChainHour.toFixed(1)} MiB per chain per hour (allowed ${maxSlope}) — ${(headroom / plugins / slopeMiBPerChainHour).toFixed(1)} h of headroom left` };
  }
  return { svc, verdict: "ok", used, budget, plugins, slope: slopeMiBPerChainHour, detail: `${shape}${slopeMiBPerChainHour === null ? "" : `, ${slopeMiBPerChainHour >= 0 ? "+" : ""}${slopeMiBPerChainHour.toFixed(1)} MiB per chain per hour`}` };
}

/**
 * MiB per chain per hour between the first and last sample of one node. Null when the series
 * cannot support the question: fewer than two usable samples, or no time between them.
 * @param {{at: string, avalanchegoRssMiB: number|null, pluginRssMiB: number|null, plugins: number|null}[]} rows
 */
export function slopeOf(rows) {
  const usable = rows.filter((r) => r && r.at && r.avalanchegoRssMiB !== null && r.pluginRssMiB !== null && r.plugins);
  if (usable.length < 2) return null;
  usable.sort((a, b) => a.at.localeCompare(b.at));
  const a = usable[0], b = usable[usable.length - 1];
  const hours = (Date.parse(b.at) - Date.parse(a.at)) / 3_600_000;
  if (!(hours > 0)) return null;
  const per = (r) => (r.avalanchegoRssMiB + r.pluginRssMiB) / r.plugins;
  return (per(b) - per(a)) / hours;
}

// Written line by line: a template literal would swallow the shell's own ${...} expansions.
const PROBE = [
  "n=0; p=0; c=0",
  "for d in /proc/[0-9]*; do",
  '  e=$(readlink "$d/exe" 2>/dev/null) || continue',
  '  r=$(sed -n "s/^VmRSS:[[:space:]]*\\([0-9]*\\) kB/\\1/p" "$d/status" 2>/dev/null)',
  '  [ -n "$r" ] || continue',
  '  r=$((r / 1024))',
  '  case "$e" in */plugins/*) p=$((p + r)); c=$((c + 1)); continue;; esac',
  '  case "$(cat "$d/comm" 2>/dev/null)" in avalanchego) n=$((n + r));; esac',
  "done",
  'echo "$n $p $c"',
].join("\n");

function probe(svc) {
  try {
    const out = execFileSync("docker", ["exec", svc, "sh", "-c", PROBE], { encoding: "utf8", timeout: 60_000, env: { ...process.env, MSYS_NO_PATHCONV: "1" } });
    const [n, p, c] = out.trim().split(/\s+/).map(Number);
    if ([n, p, c].some((v) => !Number.isFinite(v))) return { nodeRssMiB: null, pluginRssMiB: null, plugins: null };
    return { nodeRssMiB: n, pluginRssMiB: p, plugins: c };
  } catch { return { nodeRssMiB: null, pluginRssMiB: null, plugins: null }; }
}

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
  return names.map((name) => {
    const re = new RegExp(`^ {2}${name}:\\s*$([\\s\\S]*?)(?=^ {2}\\S|\\Z)`, "m");
    return /^\s{4}container_name:\s*(\S+)\s*$/m.exec(re.exec(text)?.[1] ?? "")?.[1] ?? name;
  });
}

function seriesBySvc(path) {
  const by = new Map();
  for (const line of readFileSync(path, "utf8").split("\n")) {
    let r; try { r = JSON.parse(line); } catch { continue; }
    if (!r || !r.node) continue;
    if (!by.has(r.node)) by.set(r.node, []);
    by.get(r.node).push(r);
  }
  return by;
}

function selfTest() {
  const cases = [];
  const check = (title, got, want) => cases.push({ title, ok: JSON.stringify(got) === JSON.stringify(want), got, want });
  const b = { base: 800, perChain: 220 };

  check("inside budget ⇒ ok", judgeNode({ svc: "n", nodeRssMiB: 600, pluginRssMiB: 900, plugins: 8, ...b }).verdict, "ok");
  const over = judgeNode({ svc: "n", nodeRssMiB: 600, pluginRssMiB: 2400, plugins: 8, ...b });
  check("over budget ⇒ over-budget", over.verdict, "over-budget");
  check("…and it says which half is heavy", /plugins average 300 MiB against 220/.test(over.detail), true);
  const heavyNode = judgeNode({ svc: "n", nodeRssMiB: 3000, pluginRssMiB: 100, plugins: 8, ...b });
  check("a heavy node process is named as such", /avalanchego alone is 3000 MiB/.test(heavyNode.detail), true);
  // The budget must move with the chain count, or it says nothing across phases.
  check("same usage, more chains ⇒ ok", judgeNode({ svc: "n", nodeRssMiB: 600, pluginRssMiB: 2400, plugins: 20, ...b }).verdict, "ok");
  // Inside budget but climbing is not a pass.
  const climb = judgeNode({ svc: "n", nodeRssMiB: 600, pluginRssMiB: 900, plugins: 8, ...b, slopeMiBPerChainHour: 40, maxSlope: 20 });
  check("inside budget but climbing ⇒ climbing", climb.verdict, "climbing");
  check("…and it states the headroom in hours", /h of headroom left/.test(climb.detail), true);
  check("slow growth inside budget ⇒ ok", judgeNode({ svc: "n", nodeRssMiB: 600, pluginRssMiB: 900, plugins: 8, ...b, slopeMiBPerChainHour: 2, maxSlope: 20 }).verdict, "ok");
  check("shrinking is never climbing", judgeNode({ svc: "n", nodeRssMiB: 600, pluginRssMiB: 900, plugins: 8, ...b, slopeMiBPerChainHour: -5, maxSlope: 20 }).verdict, "ok");
  // Silence is not a pass.
  check("unreadable ⇒ unreachable", judgeNode({ svc: "n", nodeRssMiB: null, pluginRssMiB: null, plugins: null, ...b }).verdict, "unreachable");
  check("no plugin ⇒ unreachable, not ok", judgeNode({ svc: "n", nodeRssMiB: 600, pluginRssMiB: 0, plugins: 0, ...b }).verdict, "unreachable");

  const t = (at, n, p, c) => ({ at, avalanchegoRssMiB: n, pluginRssMiB: p, plugins: c });
  // (700+1000)/8 - (600+800)/8 = 37.5 MiB per chain over 2 h.
  check("slope over two samples", Math.round(slopeOf([t("2026-09-08T00:00:00Z", 600, 800, 8), t("2026-09-08T02:00:00Z", 700, 1000, 8)])), 19);
  check("one sample gives no slope", slopeOf([t("2026-09-08T00:00:00Z", 600, 800, 8)]), null);
  check("a null sample does not read as zero", slopeOf([t("2026-09-08T00:00:00Z", 600, 800, 8), t("2026-09-08T02:00:00Z", null, null, null)]), null);
  check("no elapsed time gives no slope", slopeOf([t("2026-09-08T00:00:00Z", 600, 800, 8), t("2026-09-08T00:00:00Z", 700, 900, 8)]), null);

  const bad = cases.filter((c) => !c.ok);
  for (const c of cases) console.log(`${c.ok ? "  ✓" : "  ✗"} ${c.title}${c.ok ? "" : ` — got ${JSON.stringify(c.got)}, want ${JSON.stringify(c.want)}`}`);
  console.log(`\n${cases.length - bad.length}/${cases.length} case(s) pass`);
  process.exit(bad.length === 0 ? 0 : 1);
}

function main() {
  if (SELF_TEST) return selfTest();
  let names;
  if (SERVICES) names = SERVICES.split(",").map((s) => s.trim()).filter(Boolean);
  else if (COMPOSE) names = servicesOf(COMPOSE);
  else { console.error("give --compose <file> or --services <a,b,c> (or --self-test)"); process.exit(2); }

  const series = SERIES ? seriesBySvc(SERIES) : null;
  const results = names.map((svc) => judgeNode({
    svc, ...probe(svc), base: BASE, perChain: PER_CHAIN,
    slopeMiBPerChainHour: series ? slopeOf(series.get(svc) ?? []) : null, maxSlope: MAX_SLOPE,
  }));

  if (JSON_OUT) console.log(JSON.stringify(results, null, 2));
  else {
    console.log(`memory budget ${BASE} MiB + ${PER_CHAIN} MiB per tracked chain${MAX_SLOPE === null ? "" : `, growth allowance ${MAX_SLOPE} MiB per chain per hour`}\n`);
    for (const r of results) console.log(`  ${r.verdict === "ok" ? "✓" : r.verdict === "unreachable" ? "?" : "✗"} ${r.svc.padEnd(24)} ${r.detail}`);
  }
  const unreachable = results.filter((r) => r.verdict === "unreachable").length;
  const bad = results.filter((r) => r.verdict !== "ok" && r.verdict !== "unreachable").length;
  console.log(`\n${results.length - bad - unreachable}/${results.length} node(s) inside budget · ${bad} over or climbing · ${unreachable} not measurable`);
  process.exit(unreachable > 0 ? 2 : bad > 0 ? 1 : 0);
}

main();
