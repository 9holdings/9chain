#!/usr/bin/env node
/**
 * measure-block-cache.mjs — the price nobody has measured yet for the P-95 decision.
 *
 * ═══ THE DECISION THIS SERVES (D-243/P-95, and it is NOT mine to make) ═══
 *
 * P-95 found what holds the RAM: the parsed-block caches of `chain.State`, on BOTH sides of the
 * gRPC boundary. The sizes are hard-coded, and the two sides disagree by an order of magnitude:
 *
 *   avalanchego  vms/rpcchainvm/vm_client.go:61-64     64 + 64 + 64 MiB per chain
 *   plugin       graft/subnet-evm/plugin/evm/vm.go:107  10 +  5 +  5 MiB per chain
 *
 * ⇒ ceiling per node = chains × 212 MiB. At 15 chains that is ~3.1 GB. Bringing the avalanchego
 *   side down to the plugin's numbers would make it chains × 40 MiB — 15 chains: 3.1 GB → 0.6 GB.
 *
 * 🔴 That file is inside `patches/`, so changing it is hard rule 3 (regenerate the WHOLE set) and
 * it is David's call, not mine. David decided on 2026-09-08: do not touch it, build the
 * measurement. What is unmeasured is the COST — what a smaller cache does to the hit ratio when
 * blocks are evicted sooner. This tool answers that, and only that.
 *
 * ═══ 🔴 WHY IT TAKES TWO SAMPLES AND NOT ONE ═══
 *
 * `<cache>_get_count{result="hit"|"miss"}` is CUMULATIVE SINCE BOOT. A single reading answers
 * "what has the hit ratio been since this node started", and that number is dominated by
 * bootstrap — thousands of sequential block fetches that hit nothing and would hit nothing at any
 * cache size. The question P-95 asks is about the STEADY STATE: with the chain running normally,
 * how often does a lookup find its block. That is the DELTA between two readings.
 *
 * This is the same shape as the mistake D-246 records in `check-clock-skew`: a number that is
 * arithmetically fine and answers a different question than the one being asked.
 *
 * ═══ 🔴 WHY A COUNTER THAT GOES BACKWARDS IS REFUSED ═══
 *
 * Prometheus counters only rise. If the second reading is lower, the process restarted between
 * samples — and the interval no longer describes one continuous run. Interpolating across that
 * produces a ratio computed from two different lifetimes, printed with the same confidence as a
 * real one. It is refused, with exit 2: nothing was measured.
 *
 * ═══ AND WHY `portion_filled` IS PRINTED BESIDE EVERY RATIO ═══
 *
 * A hit ratio from a cache that is 3 % full says nothing about a smaller cache: nothing was
 * being evicted, so shrinking it changes nothing that this measurement can see. The ratio only
 * becomes evidence once the cache is actually under pressure. Reading a high hit ratio off an
 * empty cache and concluding "the cache is working" is how a measurement flatters a decision.
 *
 * Usage:
 *   node scripts/measure-block-cache.mjs --url <node>/ext/metrics --seconds 60
 *   node scripts/measure-block-cache.mjs --compose <file> --service node-1 --seconds 300
 *   node scripts/measure-block-cache.mjs --self-test
 */
import { spawnSync } from "node:child_process";
import { guardEntry } from "../local-net/lib/cli.mjs";
import { fetchWithDeadline } from "../local-net/lib/http.mjs";
import { MANAGED_NODE_API } from "../local-net/lib/managed-node-rpc.mjs";
import { counter, EXIT } from "./lib/report.mjs";

guardEntry(import.meta.url, ["--self-test", "--url", "--compose", "--service", "--seconds", "--json"]);

const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] !== undefined && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};

/** The four caches `chain.State` registers, named in `vms/components/chain/state.go:102`. */
export const BLOCK_CACHES = Object.freeze(["decided_cache", "unverified_cache", "bytes_to_id_cache", "missing_cache"]);

/**
 * Parse the Prometheus text exposition format into `{ name, labels, value }` rows.
 *
 * Deliberately small: only what these four caches emit. Comment lines are skipped, and a line
 * that does not parse is DROPPED rather than guessed at — a malformed line is not a zero.
 */
export function parsePrometheus(text) {
  const rows = [];
  for (const line of String(text).split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const m = /^([a-zA-Z_:][a-zA-Z0-9_:]*)(\{[^}]*\})?\s+([-+0-9.eE]+|NaN|[+-]?Inf)$/.exec(trimmed);
    if (!m) continue;
    const value = Number(m[3]);
    if (!Number.isFinite(value)) continue;
    const labels = {};
    if (m[2]) {
      for (const pair of m[2].slice(1, -1).split(",")) {
        const kv = /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*"((?:[^"\\]|\\.)*)"\s*$/.exec(pair);
        if (kv) labels[kv[1]] = kv[2].replace(/\\(.)/g, "$1");
      }
    }
    rows.push({ name: m[1], labels, value });
  }
  return rows;
}

/** Hits, misses and fill level per cache, keyed by whatever chain label the node attaches. */
export function readCaches(rows) {
  const out = new Map();
  const keyOf = (labels) => labels.chain ?? labels.chain_id ?? labels.blockchain_id ?? "(unlabelled)";
  for (const row of rows) {
    for (const cache of BLOCK_CACHES) {
      const chain = keyOf(row.labels);
      const id = `${chain}::${cache}`;
      if (row.name.endsWith(`${cache}_get_count`)) {
        const entry = out.get(id) ?? { chain, cache, hit: 0, miss: 0, portionFilled: null };
        if (row.labels.result === "hit") entry.hit += row.value;
        else if (row.labels.result === "miss") entry.miss += row.value;
        out.set(id, entry);
      } else if (row.name.endsWith(`${cache}_portion_filled`)) {
        const entry = out.get(id) ?? { chain, cache, hit: 0, miss: 0, portionFilled: null };
        entry.portionFilled = row.value;
        out.set(id, entry);
      }
    }
  }
  return out;
}

/**
 * The steady-state hit ratio between two readings.
 *
 * Returns `{ rows, refused }`. `refused` is non-empty when a counter went backwards — the caller
 * must exit 2 rather than print a ratio.
 */
export function delta(before, after) {
  const rows = [];
  const refused = [];
  for (const [id, later] of after) {
    const earlier = before.get(id);
    if (!earlier) continue;                       // a chain that appeared between samples
    const hits = later.hit - earlier.hit;
    const misses = later.miss - earlier.miss;
    if (hits < 0 || misses < 0) {
      refused.push({ id, why: "counter went BACKWARDS — the process restarted between samples" });
      continue;
    }
    const lookups = hits + misses;
    rows.push({
      chain: later.chain, cache: later.cache, hits, misses, lookups,
      // 🔴 null, not 0 and not 1. Zero lookups is "this cache was not used in this window", and
      // printing 0 % would read as "it missed everything".
      ratio: lookups === 0 ? null : hits / lookups,
      portionFilled: later.portionFilled,
    });
  }
  return { rows, refused };
}

/**
 * What a row is worth as evidence for the P-95 decision.
 *
 * 🔴 A ratio from a cache that is barely filled cannot say anything about a SMALLER cache: with
 * no eviction happening, shrinking it changes nothing this measurement can see.
 */
export function evidenceOf(row, { pressureThreshold = 0.5, minLookups = 100 } = {}) {
  if (row.ratio === null) return { useful: false, why: "no lookups in this window" };
  if (row.lookups < minLookups) return { useful: false, why: `only ${row.lookups} lookups — too few to read a ratio from` };
  if (row.portionFilled !== null && row.portionFilled < pressureThreshold) {
    return { useful: false, why: `cache only ${(row.portionFilled * 100).toFixed(1)} % full — nothing is being evicted, so a smaller cache is not being tested` };
  }
  return { useful: true, why: "under pressure and busy — this ratio is evidence" };
}

async function readOnce() {
  const url = flag("--url", null);
  if (url) {
    const response = await fetchWithDeadline(url, {}, 20_000);
    if (!response.ok) throw new Error(`${url} answered HTTP ${response.status}`);
    return await response.text();
  }
  const compose = flag("--compose", null);
  const service = flag("--service", "node-1");
  if (!compose) throw new Error("give --url, or --compose <file> [--service <name>]");
  // Only node-1 publishes its API to the host in this project, so the general path asks INSIDE.
  //
  // 🔴 `MANAGED_NODE_API` is IMPORTED, not spelled out. The first version wrote the address
  // literally and `check-single-source` went red on it the same run — that constant has one
  // declaration (local-net/lib/managed-node-rpc.mjs) precisely so a second copy cannot drift
  // from it silently. A measurement tool pointing at a stale address would produce numbers about
  // nothing, which is worse than producing none.
  const r = spawnSync("docker", ["compose", "-f", compose, "exec", "-T", service,
    "curl", "-sf", "-m", "15", `${MANAGED_NODE_API}/ext/metrics`], { encoding: "utf8", timeout: 60_000 });
  if (r.status !== 0) throw new Error(`docker compose exec ${service}: ${(r.stderr || "").trim().split("\n")[0]}`);
  return r.stdout;
}

async function main() {
  const seconds = Number(flag("--seconds", 60));
  if (!Number.isFinite(seconds) || seconds < 5) { console.error("--seconds must be at least 5"); return EXIT.CANNOT_RUN; }

  console.log("══ BLOCK CACHE — the steady-state hit ratio, for the P-95 decision ══\n");
  let before, after;
  try {
    before = readCaches(parsePrometheus(await readOnce()));
    if (before.size === 0) {
      console.error("⚠️  CANNOT RUN — no block-cache metrics found.");
      console.error("   The caches are only metered when the VM is built with NewMeteredState");
      console.error("   (vms/components/chain/state.go:102). Nothing was measured.");
      return EXIT.CANNOT_RUN;
    }
    console.log(`  first reading: ${before.size} cache(s). Waiting ${seconds}s for the second…\n`);
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
    after = readCaches(parsePrometheus(await readOnce()));
  } catch (error) {
    console.error(`⚠️  CANNOT RUN — ${error.message}`);
    return EXIT.CANNOT_RUN;
  }

  const { rows, refused } = delta(before, after);
  if (refused.length) {
    for (const r of refused) console.error(`  🔴 ${r.id}: ${r.why}`);
    console.error("\n⚠️  CANNOT RUN — a ratio across a restart is computed from two different");
    console.error("   lifetimes and would be printed with the same confidence as a real one.");
    return EXIT.CANNOT_RUN;
  }

  if (argv.includes("--json")) { console.log(JSON.stringify(rows, null, 2)); return EXIT.PASS; }

  let usable = 0;
  for (const row of rows.sort((a, b) => (a.chain + a.cache < b.chain + b.cache ? -1 : 1))) {
    const verdict = evidenceOf(row);
    if (verdict.useful) usable += 1;
    const ratio = row.ratio === null ? "     —" : `${(row.ratio * 100).toFixed(1)} %`.padStart(6);
    const filled = row.portionFilled === null ? "  ?" : `${(row.portionFilled * 100).toFixed(0)} %`.padStart(5);
    console.log(`  ${verdict.useful ? "✓" : "·"} ${row.chain.slice(0, 12).padEnd(12)} ${row.cache.padEnd(18)}`
      + ` hit ${ratio}   filled ${filled}   lookups ${String(row.lookups).padStart(7)}`);
    if (!verdict.useful) console.log(`      ${verdict.why}`);
  }

  console.log(`\n  ${usable} of ${rows.length} row(s) are usable evidence over this ${seconds}s window.`);
  console.log("  🔴 Only rows marked ✓ say anything about shrinking the cache. A high hit ratio on a");
  console.log("     cache that is not full is a measurement flattering the decision, not supporting it.");
  console.log("\n  Next: run this at both sizes on the drill band and compare the ✓ rows. The sizes are");
  console.log("  in patches/ (hard rule 3) — regenerating that set is David's call, not this tool's.");
  return EXIT.PASS;
}

/* ─────────────────────────── counter-check (--self-test) ─────────────────────────── */

function selfTest() {
  const { ok, finish } = counter("COUNTER-CHECK — the block-cache measurement");

  const sample = (hit, miss, filled) => [
    `# HELP x`,
    `avalanche_Chain1_decided_cache_get_count{chain="Chain1",result="hit"} ${hit}`,
    `avalanche_Chain1_decided_cache_get_count{chain="Chain1",result="miss"} ${miss}`,
    `avalanche_Chain1_decided_cache_portion_filled{chain="Chain1"} ${filled}`,
  ].join("\n");

  ok("a metric line with labels parses into name, labels and value", (() => {
    const rows = parsePrometheus('a_b_get_count{chain="C1",result="hit"} 42');
    return rows.length === 1 && rows[0].labels.chain === "C1" && rows[0].value === 42;
  })());
  ok("comments and blank lines are skipped", parsePrometheus("# HELP x\n\n").length === 0);
  ok("🔴 a malformed line is DROPPED, not read as zero",
    parsePrometheus("garbage line here\na_b 7").length === 1);
  ok("NaN and Inf are not values", parsePrometheus("a_b NaN\na_c +Inf").length === 0);

  const before = readCaches(parsePrometheus(sample(100, 100, 0.9)));
  const after = readCaches(parsePrometheus(sample(190, 110, 0.9)));
  ok("hits and misses are read per cache", before.size === 1);

  const d = delta(before, after);
  ok("the ratio is the DELTA, not the total since boot",
    d.rows[0].hits === 90 && d.rows[0].misses === 10 && Math.abs(d.rows[0].ratio - 0.9) < 1e-9,
    "cumulative since boot is dominated by bootstrap and answers a different question");

  // 🔴 The case the milestone asked for by name.
  const backwards = delta(after, before);
  ok("🔴 a counter that goes BACKWARDS is REFUSED, not interpolated into a ratio",
    backwards.refused.length === 1 && backwards.rows.length === 0);
  ok("the refusal says WHY — a restart, not a bad cache",
    /restarted between samples/.test(backwards.refused[0].why));

  const idle = delta(readCaches(parsePrometheus(sample(5, 5, 0.9))), readCaches(parsePrometheus(sample(5, 5, 0.9))));
  ok("🔴 zero lookups is null, never 0 % — 'unused' is not 'missed everything'",
    idle.rows[0].ratio === null);

  ok("🔴 a barely-filled cache is NOT evidence about a smaller cache",
    evidenceOf({ ratio: 0.99, lookups: 10_000, portionFilled: 0.03 }).useful === false,
    "nothing is being evicted, so shrinking it changes nothing this measurement can see");
  ok("…and the reason names the fill level, so the reader can judge it",
    /3.0 % full/.test(evidenceOf({ ratio: 0.99, lookups: 10_000, portionFilled: 0.03 }).why));
  ok("a full, busy cache IS evidence",
    evidenceOf({ ratio: 0.8, lookups: 10_000, portionFilled: 0.98 }).useful === true);
  ok("too few lookups is not evidence either",
    evidenceOf({ ratio: 1, lookups: 3, portionFilled: 0.99 }).useful === false);
  ok("a row with no lookups is not evidence", evidenceOf({ ratio: null, lookups: 0, portionFilled: 1 }).useful === false);

  ok("a chain that appears only in the second sample is skipped, not counted from zero", (() => {
    const later = readCaches(parsePrometheus(sample(50, 50, 0.5)));
    return delta(new Map(), later).rows.length === 0;
  })());

  ok("all four caches chain.State registers are looked for",
    BLOCK_CACHES.length === 4 && BLOCK_CACHES.includes("bytes_to_id_cache"));

  return finish("a restart is refused, an idle cache is null, and an empty cache is not evidence");
}

process.exitCode = argv.includes("--self-test") ? selfTest() : await main();
