#!/usr/bin/env node
/**
 * measure-memory-split.mjs — where a node's memory growth actually goes, and how much of it any
 * Go memory limit could ever reclaim (P-92, D-243).
 *
 * ═══ WHY IT EXISTS ═══
 *
 * "RAM is growing" is not an actionable measurement. Phase 1b measured the growth on the drill
 * band and then had to answer a second question before it could act: is the memory REACHABLE (no
 * collector frees it), COLLECTABLE (a limit reclaims it), or OUTSIDE the Go allocator altogether
 * (a Go limit cannot see it)? The three have completely different fixes, and the number that
 * separates them is not in `docker stats`.
 *
 *   RSS               /proc/<pid>/VmRSS, summed over avalanchego and every VM plugin
 *   Go heap_sys       what Go took from the OS      — /ext/metrics
 *   live ≈ next_gc/2  reachable at GOGC=100         — /ext/metrics
 *   RSS − heap_sys    outside the Go allocator      — a Go memory limit cannot touch this
 *   heap_sys − live   the only part a limit reclaims
 *
 * 🔴 The plugins report their own Go runtime under a `chain="…"` label and avalanchego reports its
 * own unlabelled, so this reads each process rather than the container — the same reason
 * `check-plugin-memlimit.mjs` reads /proc/<pid>/environ. It also prints the limit the RUNTIME
 * applied (`gomemlimit_bytes`), which is the honest answer to "is the limit on", not the variable.
 *
 * Exit: 0 measured · 2 a node could not be measured. There is no failing verdict here — this is a
 * measurement, not a gate; `check-node-memory.mjs` is the gate.
 *
 * Usage:
 *   node scripts/measure-memory-split.mjs --compose local-net/net-tap-g1/docker-compose.multinode.yml
 *   node scripts/measure-memory-split.mjs --services a,b --seconds 900
 *   node scripts/measure-memory-split.mjs --compose <file> --once      # snapshot, no slope
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const argv = process.argv.slice(2);
const flag = (name, fallback) => { const i = argv.indexOf(name); return i >= 0 && argv[i + 1] !== undefined && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback; };
const COMPOSE = flag("--compose", null);
const SERVICES = flag("--services", null);
const SECONDS = Number(flag("--seconds", "600"));
const ONCE = argv.includes("--once");
const JSON_OUT = argv.includes("--json");
const MiB = (b) => b / 1048576;

const RSS_PROBE = [
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

/** Sum one Go memstat over the plugins, and read avalanchego's own. Pure, so the parsing is testable. */
export function readMetrics(text, stat) {
  let node = null, plugins = 0, n = 0;
  for (const line of text.split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const sp = line.lastIndexOf(" ");
    const key = line.slice(0, sp);
    if (!key.includes(stat)) continue;
    const v = Number(line.slice(sp + 1));
    if (!Number.isFinite(v)) continue;
    // A plugin labels itself with the chain it serves; avalanchego's own series carries no VM-id prefix.
    if (/chain="/.test(key)) { plugins += v; n++; }
    else if (!/^avalanche_[A-Za-z0-9]{40,}_/.test(key)) node = v;
  }
  return { node, plugins, count: n };
}

function docker(args, timeout = 60_000) {
  try { return execFileSync("docker", args, { encoding: "utf8", timeout, maxBuffer: 1 << 26, env: { ...process.env, MSYS_NO_PATHCONV: "1" } }); }
  catch { return null; }
}

/** One node, one moment: RSS from /proc and the Go figures from the node's own metrics endpoint. */
function sample(svc) {
  const rss = docker(["exec", svc, "sh", "-c", RSS_PROBE]);
  const metrics = docker(["exec", svc, "curl", "-sf", "-m", "20", "http://127.0.0.1:9650/ext/metrics"]);
  if (!rss || !metrics) return null;
  const [n, p, c] = rss.trim().split(/\s+/).map(Number);
  if (![n, p, c].every(Number.isFinite) || c === 0) return null;
  const sys = readMetrics(metrics, "go_memstats_heap_sys_bytes");
  const gc = readMetrics(metrics, "go_memstats_next_gc_bytes");
  const lim = readMetrics(metrics, "go_gc_gomemlimit_bytes");
  if (sys.node === null || gc.node === null || sys.count === 0) return null;
  const unset = 9223372036854775807 / 2;
  return {
    svc, rss: n + p, plugins: c,
    // Kept apart on purpose: avalanchego and the plugins carry DIFFERENT limits, so a combined
    // heap figure cannot be compared against either of them.
    heapSysNode: MiB(sys.node), heapSysPlugins: MiB(sys.plugins),
    heapSys: MiB(sys.node + sys.plugins), live: MiB(gc.node + gc.plugins) / 2,
    limitNode: lim.node !== null && lim.node < unset ? MiB(lim.node) : null,
    limitPlugin: lim.count && lim.plugins / lim.count < unset ? MiB(lim.plugins / lim.count) : null,
  };
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

async function main() {
  let names;
  if (SERVICES) names = SERVICES.split(",").map((s) => s.trim()).filter(Boolean);
  else if (COMPOSE) names = servicesOf(COMPOSE);
  else { console.error("give --compose <file> or --services <a,b,c>"); process.exit(2); }

  const first = names.map(sample);
  const unreadable = names.filter((_, i) => first[i] === null);
  if (unreadable.length) console.log(`⚠️  could not measure: ${unreadable.join(", ")}`);

  const shown = first.filter(Boolean);
  const limits = [...new Set(shown.map((s) => `${s.limitNode === null ? "unset" : Math.round(s.limitNode) + " MiB"} · plugin ${s.limitPlugin === null ? "unset" : Math.round(s.limitPlugin) + " MiB"}`))];
  console.log(`\nGOMEMLIMIT the runtime applied: ${limits.join(" | ")}`);
  console.log("\nnow (MiB per node)      RSS   Go heap_sys (avago+plug)   live   outside Go");
  for (const s of shown) console.log(`  ${s.svc.padEnd(22)}${String(Math.round(s.rss)).padStart(5)}${String(Math.round(s.heapSys)).padStart(11)} (${String(Math.round(s.heapSysNode)).padStart(3)}+${String(Math.round(s.heapSysPlugins)).padStart(4)})${String(Math.round(s.live)).padStart(8)}${String(Math.round(s.rss - s.heapSys)).padStart(13)}`);

  if (ONCE) { if (JSON_OUT) console.log(JSON.stringify(shown, null, 2)); process.exit(unreadable.length ? 2 : 0); }

  console.log(`\nwaiting ${SECONDS}s for the second sample…`);
  await sleep(SECONDS * 1000);
  const second = names.map(sample);

  const rows = [];
  for (let i = 0; i < names.length; i++) {
    if (!first[i] || !second[i]) continue;
    const h = SECONDS / 3600;
    rows.push({
      svc: names[i],
      rss: (second[i].rss - first[i].rss) / h,
      heapSys: (second[i].heapSys - first[i].heapSys) / h,
      live: (second[i].live - first[i].live) / h,
    });
  }
  console.log("\ngrowth (MiB per node per hour)   RSS   Go heap   live   outside Go   reclaimable");
  for (const r of rows) console.log(`  ${r.svc.padEnd(22)}${r.rss.toFixed(0).padStart(9)}${r.heapSys.toFixed(0).padStart(10)}${r.live.toFixed(0).padStart(7)}${(r.rss - r.heapSys).toFixed(0).padStart(13)}${(r.heapSys - r.live).toFixed(0).padStart(14)}`);
  if (rows.length) {
    const mean = (k) => rows.reduce((a, r) => a + r[k], 0) / rows.length;
    const rss = mean("rss"), sys = mean("heapSys"), live = mean("live");
    console.log(`\n  mean of ${rows.length} node(s): RSS ${rss.toFixed(0)} · Go heap ${sys.toFixed(0)} · live ${live.toFixed(0)} · outside Go ${(rss - sys).toFixed(0)}`);
    const reclaimable = sys - live;
    console.log(`  A Go memory limit can reclaim at most ${reclaimable.toFixed(0)} of ${rss.toFixed(0)} MiB per node per hour` +
      (rss > 0 ? ` — ${((reclaimable / rss) * 100).toFixed(0)}% of the growth.` : "."));
    console.log("  The rest is reachable (no collector frees it) or outside the Go allocator entirely.");
  }
  if (JSON_OUT) console.log(JSON.stringify(rows, null, 2));
  process.exit(unreadable.length ? 2 : 0);
}

main();
