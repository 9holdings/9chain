#!/usr/bin/env node
/**
 * check-chains-producing.mjs — gate: **does EVERY live chain in a ledger produce blocks at the
 * target cadence, with the transactions it was sent actually included?** (P-87, D-240)
 *
 * ═══ WHY IT EXISTS ═══
 *
 * A pump reports what IT sent; a node reports that it is healthy; neither says whether a chain
 * is finalising blocks. On the per-node model (P-83/P-84) a chain has V validators, and the
 * question "does a 5-validator chain still produce blocks when one of them is down" (P-89) can
 * only be answered by reading the chain's own blocks over a window. This gate does that, per
 * chain, and names the chain that fails — never the fleet.
 *
 * ═══ WHAT IT MEASURES, AND WHERE ═══
 *
 *   quantity                              where
 *   the chain's head block, twice         the RPC that serves the chain (router or node)
 *   every block between the two heads     same — number, timestamp, transaction count
 *   eth_chainId                           same — the chain must be the one the ledger claims
 *
 * A chain is RED when, within the window, it produced no block, or two consecutive blocks are
 * further apart than `--max-gap` seconds, or the included transactions fall under 90 % of
 * `--target-rate` × window, or it answers with another chainId. "Could not be asked" is 2, never
 * 0 (hard rule #1).
 *
 * 🔴 The target rate is the OPERATOR's expectation (`--target-rate`), never the pump's own
 * heartbeat: a pump that stopped would report running:false and excuse the very chain this gate
 * exists to catch. Stopping the pump on one chain must turn exactly that chain red.
 *
 * Exit codes: 0 every live chain ok · 1 at least one red · 2 none red, at least one unreachable.
 *
 * Usage:
 *   node scripts/check-chains-producing.mjs --file 9chain-a1-config/console-chains.json --rpc http://127.0.0.1:8545 [--window 30] [--target-rate 1] [--max-gap 2.5]
 *   node scripts/check-chains-producing.mjs --self-test
 */
import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { request, probeChainId } from "../local-net/lib/chain-ledger.mjs";
import { parseLedger } from "../local-net/lib/ledger-read.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] !== undefined && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};
const SELF_TEST = argv.includes("--self-test");
const LEDGER_FILE = flag("--file", process.env.A1_CHAINS_LEDGER || "9chain-a1-config/console-chains.json");
const RPC = flag("--rpc", process.env.A1_CHAINS_RPC || "");
const WINDOW = Number(flag("--window", 30));
const TARGET_RATE = Number(flag("--target-rate", 1));
const MAX_GAP = Number(flag("--max-gap", 2.5));
// `--only a,b`: judge only these chain names (a partial pump run); every other live chain is
// still listed, as "skipped", so a reader sees what was NOT measured.
const ONLY = flag("--only", null) ? new Set(flag("--only").split(",").map((s) => s.trim()).filter(Boolean)) : null;

const hexNum = (h) => Number(BigInt(h));

/**
 * The verdict for ONE chain, from data. Pure, so the counter-check drives it directly.
 *
 * @param {object} p
 * @param {number} p.chainId          what the ledger claims
 * @param {number|null} p.answeredId  what eth_chainId answered (null = unreachable)
 * @param {{number:number,timestamp:number,txs:number}|null} p.headBefore
 * @param {Array<{number:number,timestamp:number,txs:number}>} p.blocks  every block after headBefore, ascending
 * @param {number} p.window           seconds between the two head reads
 * @param {number} p.targetRate       tx/s the operator expects to see INCLUDED
 * @param {number} p.maxGap           seconds allowed between consecutive blocks
 */
export function judgeChain({ chainId, answeredId, headBefore, blocks, window, targetRate, maxGap }) {
  if (answeredId === null || headBefore === null) return { verdict: "unreachable", detail: "the chain could not be asked" };
  if (answeredId !== chainId) return { verdict: "wrong-id", detail: `the ledger says ${chainId}, the chain answers ${answeredId}` };
  if (targetRate > 0 && blocks.length === 0) return { verdict: "no-blocks", detail: `no block in ${window}s (head still ${headBefore.number})` };
  let maxSeen = 0;
  let prev = headBefore.timestamp;
  for (const b of blocks) { maxSeen = Math.max(maxSeen, b.timestamp - prev); prev = b.timestamp; }
  // 🔴 Block timestamps are WHOLE SECONDS. Two blocks 2.02 s apart can read 10 and 13 (a "3 s
  // gap"), so a gap is judged against maxGap PLUS one second of rounding — measured 2026-09-07
  // h1: "Phase One A — 3s between consecutive blocks" while its last 30 blocks were 2 s apart.
  if (blocks.length && maxSeen > maxGap + 1) return { verdict: "gap", detail: `${maxSeen}s between consecutive blocks (max ${maxGap}s + 1 s clock rounding)`, maxGap: maxSeen };
  const txs = blocks.reduce((a, b) => a + b.txs, 0);
  const rate = txs / window;
  if (targetRate > 0 && rate < 0.9 * targetRate) {
    return { verdict: "under-rate", detail: `${txs} tx included in ${window}s = ${rate.toFixed(2)} tx/s, target ${targetRate} (need ≥ ${(0.9 * targetRate).toFixed(2)})`, rate };
  }
  return { verdict: "ok", detail: `${blocks.length} block(s), ${txs} tx in ${window}s = ${rate.toFixed(2)} tx/s, max gap ${maxSeen}s`, rate, blocks: blocks.length };
}

async function readHead(rpcUrl, ask) {
  const res = await ask(rpcUrl, { method: "POST", payload: { jsonrpc: "2.0", id: 1, method: "eth_getBlockByNumber", params: ["latest", false] } });
  const b = JSON.parse(res.body)?.result;
  if (!b?.number) throw new Error("eth_getBlockByNumber answered without a block");
  return { number: hexNum(b.number), timestamp: hexNum(b.timestamp), txs: (b.transactions ?? []).length };
}

async function readBlock(rpcUrl, n, ask) {
  const res = await ask(rpcUrl, { method: "POST", payload: { jsonrpc: "2.0", id: 1, method: "eth_getBlockByNumber", params: ["0x" + n.toString(16), false] } });
  const b = JSON.parse(res.body)?.result;
  if (!b?.number) throw new Error(`block ${n} not answered`);
  return { number: hexNum(b.number), timestamp: hexNum(b.timestamp), txs: (b.transactions ?? []).length };
}

/** Measure every live chain of a ledger over one window, all chains in parallel. */
export async function measureLedger({ chains, rpcBase, window, targetRate, maxGap, ask = request, sleep = (ms) => new Promise((r) => setTimeout(r, ms)) }) {
  const before = await Promise.all(chains.map(async (c) => {
    const url = `${rpcBase}/ext/bc/${c.blockchainID}/rpc`;
    try {
      const id = await probeChainId(url, ask);
      const head = await readHead(url, ask);
      return { url, answeredId: id.kind === "id" ? id.chainId : null, head };
    } catch (e) { return { url, answeredId: null, head: null, error: e.message }; }
  }));
  await sleep(window * 1000);
  const out = [];
  for (const [i, c] of chains.entries()) {
    const b = before[i];
    const label = `${c.name} #${c.chainId}`;
    if (b.answeredId === null || b.head === null) { out.push({ label, ...judgeChain({ chainId: c.chainId, answeredId: null, headBefore: null, blocks: [], window, targetRate, maxGap }), error: b.error }); continue; }
    let blocks = [];
    try {
      const after = await readHead(b.url, ask);
      for (let n = b.head.number + 1; n <= after.number; n++) blocks.push(n === after.number ? after : await readBlock(b.url, n, ask));
    } catch (e) { out.push({ label, verdict: "unreachable", detail: `second read failed: ${e.message}` }); continue; }
    out.push({ label, ...judgeChain({ chainId: Number(c.chainId), answeredId: b.answeredId, headBefore: b.head, blocks, window, targetRate, maxGap }) });
  }
  return out;
}

const MARKS = { ok: "✓", "no-blocks": "🔴", gap: "🔴", "under-rate": "🔴", "wrong-id": "🔴", unreachable: "⁇" };

async function main() {
  if (SELF_TEST) return selfTest();
  if (!RPC) { console.log("🔴 --rpc <base serving every chain> is required (or A1_CHAINS_RPC)"); return 2; }
  const ledger = parseLedger(readFileSync(path.resolve(ROOT, LEDGER_FILE), "utf8"));
  console.log(`\n══ CHAINS PRODUCING — ${ledger.chains.length} live chain(s) in ${LEDGER_FILE}, via ${RPC}, window ${WINDOW}s, target ${TARGET_RATE} tx/s, max gap ${MAX_GAP}s ══\n`);
  if (ledger.chains.length === 0) { console.log("✅ PASS — the ledger advertises no live chain (nothing to produce)"); return 0; }
  const chains = ONLY ? ledger.chains.filter((c) => ONLY.has(c.name)) : ledger.chains;
  if (ONLY) for (const c of ledger.chains.filter((c) => !ONLY.has(c.name))) console.log(`  · ${c.name} #${c.chainId} — skipped (not in --only)`);
  if (chains.length === 0) { console.log("🔴 --only names no live chain of this ledger"); return 2; }
  const results = await measureLedger({ chains, rpcBase: RPC, window: WINDOW, targetRate: TARGET_RATE, maxGap: MAX_GAP });
  for (const r of results) console.log(`  ${MARKS[r.verdict]} ${r.label} — ${r.detail}`);
  const reds = results.filter((r) => MARKS[r.verdict] === "🔴");
  const unknown = results.filter((r) => r.verdict === "unreachable");
  console.log();
  if (reds.length) { console.log(`🔴 FAIL — ${reds.length} of ${results.length} chain(s) not producing as expected: ${reds.map((r) => r.label).join(", ")}`); return 1; }
  if (unknown.length) { console.log(`⁇ INCONCLUSIVE — ${unknown.length} chain(s) could not be asked: ${unknown.map((r) => r.label).join(", ")}`); return 2; }
  console.log(`✅ PASS — ${results.length}/${results.length} chain(s) produce blocks at the target cadence with their transactions included`);
  return 0;
}

/** Counter-check: the verdict must go red for the right chain and the right reason. */
async function selfTest() {
  let pass = 0, fail = 0;
  const ok = (name, cond, seen) => { if (cond) { pass++; console.log(`  ✓ ${name}`); } else { fail++; console.log(`  ✗ ${name}  — got: ${seen}`); } };
  const blk = (n, t, txs) => ({ number: n, timestamp: t, txs });
  const base = { chainId: 8001000001, answeredId: 8001000001, headBefore: blk(10, 1000, 1), window: 30, targetRate: 1, maxGap: 2.5 };
  const steady = Array.from({ length: 15 }, (_, i) => blk(11 + i, 1002 + 2 * i, 2)); // 2 tx every 2 s = 1 tx/s
  console.log("\n══ COUNTER-CHECK — check-chains-producing ══\n");
  console.log("── 1. a chain at cadence with its transactions included is ok ──");
  const fine = judgeChain({ ...base, blocks: steady });
  ok("15 blocks, 30 tx in 30 s at 2 s spacing ⇒ ok", fine.verdict === "ok", JSON.stringify(fine));
  console.log("\n── 2. the four ways a chain is RED, each named ──");
  const stalled = judgeChain({ ...base, blocks: [] });
  ok("🔴 no block in the window ⇒ no-blocks (the pump stopped, or the chain did)", stalled.verdict === "no-blocks", stalled.verdict);
  const gap = judgeChain({ ...base, blocks: [blk(11, 1002, 2), blk(12, 1012, 2), ...Array.from({ length: 13 }, (_, i) => blk(13 + i, 1014 + 2 * i, 2))] });
  ok("🔴 a 10 s hole between two blocks ⇒ gap, with the size", gap.verdict === "gap" && /10s/.test(gap.detail), JSON.stringify(gap));
  const thin = judgeChain({ ...base, blocks: steady.map((b) => ({ ...b, txs: 1 })) });
  ok("🔴 0.5 tx/s included against a 1 tx/s target ⇒ under-rate", thin.verdict === "under-rate", JSON.stringify(thin));
  const wrong = judgeChain({ ...base, answeredId: 8001000002, blocks: steady });
  ok("🔴 another chainId behind the RPC ⇒ wrong-id (judged before cadence)", wrong.verdict === "wrong-id", wrong.verdict);
  console.log("\n── 3. controls: the rule is 90 % and the gap is strict ──");
  ok("CONTROL — exactly 90 % of the target passes", judgeChain({ ...base, blocks: steady.map((b, i) => ({ ...b, txs: i < 12 ? 2 : 1 })) }).verdict === "ok", "under-rate");
  ok("CONTROL — a 2.5 s spacing is not a gap", judgeChain({ ...base, headBefore: blk(10, 1000, 1), blocks: Array.from({ length: 12 }, (_, i) => blk(11 + i, 1002.5 + 2.5 * i, 3)) }).verdict === "ok", "gap");
  // Whole-second timestamps: a 2 s cadence reads as 1/2/3 s. One reading of 3 is rounding, not a hole.
  ok("CONTROL — a single 3 s reading on whole-second timestamps is rounding, not a gap", judgeChain({ ...base, blocks: [blk(11, 1003, 2), ...Array.from({ length: 14 }, (_, i) => blk(12 + i, 1005 + 2 * i, 2))] }).verdict === "ok", "gap");
  ok("🔴 a 4 s reading is a gap (rounding cannot explain it)", judgeChain({ ...base, blocks: [blk(11, 1004, 2), ...Array.from({ length: 14 }, (_, i) => blk(12 + i, 1006 + 2 * i, 2))] }).verdict === "gap", "ok");
  ok("CONTROL — with target 0 an idle chain is ok (nothing was expected)", judgeChain({ ...base, targetRate: 0, blocks: [] }).verdict === "ok", "red");
  ok("🔴 unreachable is 2-shaped, never ok", judgeChain({ ...base, answeredId: null, headBefore: null, blocks: [] }).verdict === "unreachable", "ok");
  console.log("\n── 4. the fleet verdict names ONLY the failing chain (measured through a fake RPC) ──");
  const chains = [{ name: "Alpha", chainId: 8001000001, blockchainID: "A" }, { name: "Beta", chainId: 8001000002, blockchainID: "B" }];
  let phase = 0;
  const heads = { A: [blk(10, 1000, 1), blk(25, 1030, 2)], B: [blk(5, 1000, 1), blk(5, 1000, 1)] };
  const fake = async (url, { payload }) => {
    const bc = url.match(/\/ext\/bc\/([^/]+)\/rpc$/)[1];
    if (payload.method === "eth_chainId") return { status: 200, body: JSON.stringify({ result: "0x" + (bc === "A" ? 8001000001 : 8001000002).toString(16) }) };
    const p = payload.params[0];
    const b = p === "latest" ? heads[bc][phase] : blk(hexNum(p), 1000 + 2 * (hexNum(p) - 10), 2);
    return { status: 200, body: JSON.stringify({ result: { number: "0x" + b.number.toString(16), timestamp: "0x" + b.timestamp.toString(16), transactions: new Array(b.txs).fill("0x") } }) };
  };
  const fleet = await measureLedger({ chains, rpcBase: "http://x", window: 30, targetRate: 1, maxGap: 2.5, ask: fake, sleep: async () => { phase = 1; } });
  ok("Alpha (advancing head, 2 tx/block) ⇒ ok", fleet[0].verdict === "ok", JSON.stringify(fleet[0]));
  ok("🔴 Beta (head did not move) ⇒ no-blocks — and Alpha stays green", fleet[1].verdict === "no-blocks" && fleet[0].verdict === "ok", JSON.stringify(fleet[1]));
  console.log(`\n${fail === 0 ? "✅" : "🔴"} ${pass} passed · ${fail} failed`);
  return fail === 0 ? 0 : 1;
}

main().then((code) => process.exit(code)).catch((e) => { console.error(`\n🔴 ${e.stack ?? e.message}`); process.exit(2); });
