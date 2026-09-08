#!/usr/bin/env node
/**
 * 17-memory-report.mjs — read a series written by `16-memory-series.sh` and answer the three
 * questions the L1-108 sizing depends on (P-92, D-243).
 *
 *   1. How fast does anonymous memory grow, per node per hour?
 *   2. How much of that could ANY Go memory limit reclaim? (heap_sys − live, and nothing else)
 *   3. Does the slope flatten, and when would a machine fill?
 *
 * 🔴 Two ways this reader could lie, both seen for real on 2026-09-08 and both guarded here:
 *   - A container that vanished leaves a row with ok:false, or in an older series no row at all.
 *     Either way the sample covers fewer nodes and the total falls — which reads as memory being
 *     released. Slopes are computed only across samples that cover the fullest node count.
 *   - Summing VmRSS instead of RssAnon counts the shared plugin binary once per plugin. The series
 *     records RssAnon for that reason; the cgroup `anon` column is the independent check on it.
 *
 * Usage:
 *   node 17-memory-report.mjs <series.jsonl> [--since ISO] [--until ISO] [--label text]
 *                             [--budget-mib 14336] [--nodes-per-machine 4]
 */
import { readFileSync } from "node:fs";

const argv = process.argv.slice(2);
const flag = (n, d = null) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const since = flag("--since"), until = flag("--until");
const LABEL = flag("--label", "series");
const BUDGET = Number(flag("--budget-mib", "14336"));      // 56 GB usable of a 64 GB machine
const PER_MACHINE = Number(flag("--nodes-per-machine", "4")); // PLAN-108 section 0, option A

const rows = readFileSync(argv[0], "utf8").trim().split("\n")
  .map((s) => { try { return JSON.parse(s); } catch { return null; } })
  .filter((r) => r && r.at && r.node && (!since || r.at >= since) && (!until || r.at <= until));

const times = [...new Set(rows.map((r) => r.at))].sort();
const sum = (g, k) => g.reduce((a, r) => a + (r[k] ?? 0), 0);
const table = times.map((t) => {
  const g = rows.filter((r) => r.at === t);
  const bad = g.filter((r) => !r.ok).map((r) => r.node);
  return {
    at: t, nodes: g.length, ok: g.length - bad.length, bad,
    anon: sum(g, "anonNode") + sum(g, "anonPlugins"),
    cgroup: sum(g, "anonCgroup"),
    heapSys: sum(g, "heapSysNode") + sum(g, "heapSysPlugins"),
    live: (sum(g, "nextGcNode") + sum(g, "nextGcPlugins")) / 2,
    plugins: sum(g, "plugins"),
    // 🔴 next_gc/2 approximates the live heap only while NO limit is in force. Once a GOMEMLIMIT
    // binds, Go lowers the heap goal to respect it and the number stops meaning what the column
    // header says. Measured 2026-09-08: node-1 reported next_gc 199 MiB under a 250 MiB limit.
    limited: g.some((r) => r.limitNode !== null && r.limitNode !== undefined),
  };
});
if (!table.length) { console.log("no samples in that window"); process.exit(0); }

const full = Math.max(...table.map((r) => r.ok));
const usable = table.filter((r) => r.ok === full && r.bad.length === 0);
const dropped = table.length - usable.length;

console.log(`${LABEL} — ${full} node(s)\n`);
console.log("age (h)   anon/node   cgroup/node   Go heap/node   live/node   marginal MiB/node/h");
const t0 = usable.length ? Date.parse(usable[0].at) : Date.parse(table[0].at);
let prev = null;
const marginals = [];
for (const r of usable) {
  const age = (Date.parse(r.at) - t0) / 3_600_000;
  let marg = "";
  if (prev) {
    const dh = (Date.parse(r.at) - Date.parse(prev.at)) / 3_600_000;
    if (dh > 0) { const m = (r.anon - prev.anon) / full / dh; marginals.push(m); marg = m.toFixed(0); }
  }
  console.log(`${age.toFixed(2).padStart(6)}${(r.anon / full).toFixed(0).padStart(12)}${(r.cgroup / full).toFixed(0).padStart(14)}${(r.heapSys / full).toFixed(0).padStart(15)}${(r.live / full).toFixed(0).padStart(12)}${String(marg).padStart(22)}`);
  prev = r;
}
if (dropped) console.log(`\n${dropped} sample(s) did not cover ${full} node(s) and are left out — a short sample reads as memory falling.`);

if (usable.length >= 2) {
  const a = usable[0], b = usable[usable.length - 1];
  const h = (Date.parse(b.at) - Date.parse(a.at)) / 3_600_000;
  const per = (x, y) => (y - x) / h / full;
  const anon = per(a.anon, b.anon), sys = per(a.heapSys, b.heapSys), live = per(a.live, b.live);
  console.log(`\nover ${h.toFixed(2)} h, MiB per node per hour:`);
  console.log(`  anon ${anon.toFixed(0)} · Go heap ${sys.toFixed(0)} · live ${live.toFixed(0)} · outside Go ${(anon - sys).toFixed(0)}`);
  if (usable.some((r) => r.limited)) {
    console.log("  ⚠️  a GOMEMLIMIT is in force in this window, so the `live` column is NOT the live");
    console.log("     heap: Go lowers next_gc to respect the limit. Read `anon` and `Go heap` only.");
  } else {
    const reclaimable = sys - live;
    console.log(`  a Go memory limit reaches at most ${reclaimable.toFixed(0)} of ${anon.toFixed(0)} MiB/node/h` +
      (anon > 0 ? ` — ${((reclaimable / anon) * 100).toFixed(0)}%` : "") + "; the rest is live or outside Go.");
  }

  if (marginals.length >= 4) {
    const mean = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
    const firstThird = mean(marginals.slice(0, Math.max(2, Math.floor(marginals.length / 3))));
    const lastThird = mean(marginals.slice(-Math.max(2, Math.floor(marginals.length / 3))));
    const held = (b.anon / full) * PER_MACHINE;
    const left = BUDGET - held;
    console.log(`\n  slope ${firstThird.toFixed(0)} → ${lastThird.toFixed(0)} MiB/node/h across the window`);
    console.log(`  a ${PER_MACHINE}-node machine holds ${held.toFixed(0)} MiB, ${left.toFixed(0)} of a ${BUDGET} MiB budget left`);
    for (const [name, m] of [["last", lastThird], ["first", firstThird]]) {
      if (m > 0) console.log(`    at the ${name} slope (${(m * PER_MACHINE).toFixed(0)} MiB/machine/h) it fills in ${(left / (m * PER_MACHINE)).toFixed(1)} h`);
      else console.log(`    at the ${name} slope it does not fill`);
    }
    console.log("  The distance between those two lines is the sizing question. Do not quote one of");
    console.log("  them on its own.");
  }
}
