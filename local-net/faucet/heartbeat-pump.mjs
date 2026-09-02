#!/usr/bin/env node
/**
 * heartbeat-pump.mjs — sustained, PUBLICLY DISCLOSED synthetic traffic on the A1
 * public C-Chain, so the network shows a steady pulse instead of standing still.
 *
 * Run on the server:
 *   set -a; . ~/9chain-a1/heartbeat.env; set +a
 *   node local-net/faucet/heartbeat-pump.mjs
 *
 * ═══ THIS IS NOT load-test.mjs, AND MUST NOT BECOME IT ═══
 * `load-test.mjs` answers "how much can this chain take?" — it runs for a bounded
 * time, pushes as hard as it can, and exits. This one answers a different question:
 * "can the chain hold a modest, honest, indefinite pulse?" Different question,
 * different failure modes, different code. Do not merge them.
 *
 * ═══ WHY IT IS SYNTHETIC AND SAYS SO ═══
 * Traffic manufactured to make a network look busy is a lie unless it is labelled.
 * Two things make it honest here, and neither is optional:
 *   1. `synthetic: true` and a human-readable label in the published JSON.
 *   2. The sending addresses are PUBLISHED. Anyone can filter them out of the
 *      explorer and see the real number, which on a quiet testnet is near zero.
 * Removing either one turns this tool into a way to inflate usage metrics. If a
 * future change makes the addresses stop being published, that change is wrong.
 *
 * ═══ THE BUG THIS FILE EXISTS TO NOT REPEAT (measured 2026-08-29) ═══
 * A 9 tx/s run through `load-test.mjs --c-chain` worked perfectly for 56 seconds —
 * 28 consecutive blocks, exactly 2.000s apart, exactly 18 tx each, exactly 9.0 TPS —
 * and then the chain went totally silent for 260 seconds. The chain was healthy the
 * whole time: a single hand-sent transaction was mined 4.1s later. What died was the
 * SENDERS, and this is how:
 *
 *   1. One brief RPC hiccup made ~150 in-flight sends fail at once.
 *   2. The recovery path re-read the nonce with `getTransactionCount(addr,"latest")`.
 *      `latest` is the MINED nonce. It ignores everything already sitting in the
 *      mempool.
 *   3. So each wallet rewound its counter far below what it had already submitted,
 *      and coreth's per-account pool limits evicted the middle of the range.
 *   4. That leaves a NONCE GAP. Every later transaction is accepted by the node
 *      (the log happily says "Submitted transaction ... nonce=181") and is then
 *      unminable forever, because nonce 181 cannot execute while 120 is missing.
 *
 * The tool reported `sent 1044` the whole time. Zero of them were committed. That is
 * this project's oldest failure mode wearing a new hat: a green number measuring the
 * wrong quantity. Hence three rules below, each traceable to one of those steps.
 */

const RPC = process.env.HEARTBEAT_RPC || "http://127.0.0.1:9650/ext/bc/C/rpc";
const SEED = process.env.HEARTBEAT_SEED || "";
const OUT = process.env.HEARTBEAT_OUT || "/srv/a1-config/heartbeat.json";
const STOP_FILE = process.env.HEARTBEAT_STOP_FILE || "/srv/a1-config/heartbeat.stop";
const ETHERS_PATH = process.env.ETHERS_PATH || "ethers";

const TARGET_TPS = Number(process.env.HEARTBEAT_TPS || 9);
const WALLETS = Number(process.env.HEARTBEAT_WALLETS || 9);
/**
 * RULE 1 (against step 3/4 above): never let a wallet hold more unconfirmed
 * transactions than coreth will keep for one account.
 *
 * coreth's transaction pool keeps a limited number of executable transactions per
 * account and drops the overflow. Dropping the middle of a nonce range is what
 * creates the permanent gap. We simply never build a range long enough to be
 * trimmed: at 1 tx/s per wallet and a 2s block, a healthy wallet has ~2 in flight,
 * so a ceiling of 6 is generous headroom and still far under the pool limit.
 * If a wallet reaches the ceiling it STOPS SENDING and waits to be mined. Falling
 * behind the target rate is an acceptable outcome. A nonce gap is not.
 */
const MAX_IN_FLIGHT = Number(process.env.HEARTBEAT_MAX_IN_FLIGHT || 6);
/** How often the main loop runs. See the note where it sleeps. */
const CYCLE_MS = Number(process.env.HEARTBEAT_CYCLE_MS || 250);
/** A wallet whose mined nonce has not moved for this long is treated as stuck. */
const STUCK_AFTER_MS = Number(process.env.HEARTBEAT_STUCK_AFTER_MS || 45_000);
/** Stop if the filesystem holding chain data drops below this percent free. */
const MIN_DISK_FREE_PCT = Number(process.env.HEARTBEAT_MIN_DISK_FREE_PCT || 20);
/**
 * Which filesystem the disk check looks at.
 *
 * 🔴 SET THIS WHEN RUNNING IN A CONTAINER. Inside one, `/` is the container's own
 * overlay filesystem, which stays near-empty forever no matter how full the host
 * gets. The check would then pass every single time — a safety cutoff that has been
 * quietly disconnected is worse than none, because the run log keeps printing a
 * reassuring percentage that describes the wrong disk.
 * The deploy script mounts the host root read-only and points this at it.
 */
const DISK_PATH = process.env.HEARTBEAT_DISK_PATH || "/";
/** Stop if the node fails this many consecutive health probes. */
const MAX_RPC_FAILURES = Number(process.env.HEARTBEAT_MAX_RPC_FAILURES || 5);
/**
 * Hard deadline, ISO date or timestamp. The pump refuses to start after it and stops
 * itself on reaching it.
 *
 * Exists because of re-genesis. When the network is rebuilt from block 0, every
 * balance goes to zero and the generation changes; a pump still running through that
 * moment is spending against a chain that no longer exists and publishing a live
 * heartbeat for it. Setting this to the rebuild date makes "stop before G-day" a
 * property of the process instead of a line on somebody's checklist.
 *
 * The reverse direction is already covered without a date: the startup balance check
 * refuses to run when a wallet holds nothing, and after a rebuild they all do. So the
 * deadline guards the approach to G-day, and the balance check guards the far side.
 */
const STOP_AFTER = process.env.HEARTBEAT_STOP_AFTER || "";

const { ethers } = await import(ETHERS_PATH);
const { writeFile, rename, access, statfs } = await import("node:fs/promises");

if (!SEED) {
  console.error("FATAL: HEARTBEAT_SEED is required (a BIP-39 mnemonic).");
  console.error("  The sending wallets are derived from it, so the same seed always");
  console.error("  yields the same addresses — a restart reuses funded wallets");
  console.error("  instead of stranding money in abandoned ones.");
  process.exit(1);
}

const stamp = () => new Date().toISOString().slice(11, 19);
const log = (s) => console.log(`[${stamp()}] ${s}`);

const provider = new ethers.JsonRpcProvider(RPC, undefined, { staticNetwork: true });

/**
 * Deterministic wallets. Derived, never random.
 *
 * `load-test.mjs` creates throwaway wallets on every run because it funds them from
 * a treasury and sweeps them at the end. A process meant to run forever cannot do
 * that: every restart would abandon whatever dust was left, and every restart would
 * need the treasury key on hand. Deriving from a seed means this process only ever
 * needs the seed, and the addresses are stable enough to publish — which is the
 * whole basis of the disclosure.
 */
const root = ethers.HDNodeWallet.fromPhrase(SEED);
const wallets = Array.from({ length: WALLETS }, (_, i) =>
  new ethers.Wallet(root.deriveChild(i).privateKey, provider),
);

/** Ring: wallet i pays wallet i+1. Value never leaves the set, so only gas is spent. */
const payee = (i) => wallets[(i + 1) % wallets.length].address;

const state = wallets.map(() => ({
  nextNonce: 0,
  minedNonce: 0,
  minedNonceSince: Date.now(),
  inFlight: 0,
  sent: 0,
  failed: 0,
  resyncs: 0,
}));

let running = true;
let stopReason = null;
let rpcFailures = 0;
const startedAt = Date.now();

/**
 * RULE 2 (against step 2 above): resync from "pending", never "latest".
 *
 * "pending" counts what the node has already accepted but not yet mined, so the
 * next nonce we hand out is genuinely the next unused one. "latest" is the mined
 * count, and using it after a burst of in-flight sends is exactly how the original
 * run rewound into the pool and blew a hole in its own nonce sequence.
 */
async function resync(i, why) {
  const w = wallets[i];
  const s = state[i];
  const [pending, mined] = await Promise.all([
    provider.getTransactionCount(w.address, "pending"),
    provider.getTransactionCount(w.address, "latest"),
  ]);
  s.nextNonce = pending;
  if (mined !== s.minedNonce) {
    s.minedNonce = mined;
    s.minedNonceSince = Date.now();
  }
  // in-flight is a derived fact, not a counter we hope stayed correct.
  s.inFlight = pending - mined;
  s.resyncs++;
  log(`wallet ${i} resync (${why}): mined=${mined} pending=${pending} inFlight=${s.inFlight}`);
}

/**
 * A stuck wallet is one whose mined nonce has frozen while it still has work queued.
 * The cure is a replacement transaction at the MINED nonce with a higher fee, which
 * either fills the gap or displaces whatever is jammed at the front of its queue.
 */
async function unstick(i) {
  const w = wallets[i];
  const s = state[i];
  const fee = await provider.getFeeData();
  const bump = (v, mul) => (v == null ? null : (v * BigInt(mul)) / 10n);
  log(`wallet ${i} looks stuck at nonce ${s.minedNonce} — sending replacement`);
  try {
    await w.sendTransaction({
      to: payee(i),
      value: 1n,
      gasLimit: 21000n,
      nonce: s.minedNonce,
      maxFeePerGas: bump(fee.maxFeePerGas ?? 25n, 40) ?? undefined,
      maxPriorityFeePerGas: bump(fee.maxPriorityFeePerGas ?? 1n, 40) ?? undefined,
    });
  } catch (e) {
    log(`wallet ${i} replacement rejected: ${e.shortMessage || e.message}`);
  }
  await resync(i, "after unstick");
}

async function sendOne(i) {
  const w = wallets[i];
  const s = state[i];
  if (s.inFlight >= MAX_IN_FLIGHT) return false; // RULE 1: hold, do not queue deeper
  const nonce = s.nextNonce++;
  s.inFlight++;
  try {
    await w.sendTransaction({ to: payee(i), value: 1n, gasLimit: 21000n, nonce });
    s.sent++;
    return true;
  } catch (e) {
    s.failed++;
    s.inFlight--;
    s.nextNonce = nonce; // give the nonce back rather than skipping it
    if (!/already known|replacement/i.test(e.shortMessage || e.message || "")) {
      await resync(i, "send failed").catch(() => {});
    }
    return false;
  }
}

/**
 * RULE 3 (against the "sent 1044" illusion): the published throughput is counted
 * from BLOCKS, never from send calls. A send that the node accepted and will never
 * mine is not throughput; it is the exact thing that made the last run look alive
 * while it was dead.
 */
const samples = []; // { at, height, txSincePrevious }
let lastScanned = null;
let committedTotal = 0;

async function scanBlocks() {
  const height = await provider.getBlockNumber();
  if (lastScanned == null) lastScanned = height;
  let txCount = 0;
  for (let n = lastScanned + 1; n <= height; n++) {
    const b = await provider.getBlock(n);
    txCount += b?.transactions?.length || 0;
  }
  lastScanned = height;
  committedTotal += txCount;
  samples.push({ at: Date.now(), height, txSincePrevious: txCount });
  while (samples.length > 2 && Date.now() - samples[0].at > 60_000) samples.shift();
  return height;
}

/**
 * Rate over the sampling window, measured between two endpoints rather than by
 * summing buckets.
 *
 * The obvious version — sum every sample's tx count and divide by the span from
 * first to last sample — is wrong, and wrong in the flattering direction: the first
 * sample's transactions were mined BEFORE that first timestamp, so they get counted
 * while the seconds they took do not. It reported 1.81s per block on a chain that
 * was measurably producing one every 2.00s. Small, but it is a published number
 * about how alive the network is, and it erred toward "more alive".
 *
 * So: endpoints only. Blocks are the height difference, transactions exclude the
 * first sample, and the denominator is the real elapsed time between them.
 */
function windowRate() {
  if (samples.length < 2) return { seconds: 0, tx: 0, blocks: 0 };
  const first = samples[0];
  const last = samples[samples.length - 1];
  return {
    seconds: (last.at - first.at) / 1000,
    tx: samples.slice(1).reduce((a, s) => a + s.txSincePrevious, 0),
    blocks: last.height - first.height,
  };
}

/**
 * Free space, via `statfs` rather than by shelling out to `df`.
 *
 * 🔴 THIS USED TO CALL `df --output=pcent` AND IT NEVER WORKED IN THE CONTAINER.
 * `--output` is GNU coreutils; the image is `node:24-alpine`, whose `df` is busybox
 * and rejects the flag. Every call threw, every call returned null, and null is
 * treated as "cannot measure, do not stop" — so the disk cutoff was silently
 * disconnected from the moment it was containerised. It was caught only because
 * startup logs the measured percentage instead of just the configured path: the line
 * said COULD NOT MEASURE while the host sat at a perfectly readable 11% used.
 *
 * `statfs` is a syscall. No subprocess, no flag dialects, no PATH, and it fails
 * loudly rather than by returning a comforting number.
 */
async function diskFreePct() {
  try {
    const s = await statfs(DISK_PATH);
    // Mirror how df computes the percentage: the reserved-for-root blocks counted in
    // `bfree` but not in `bavail` are not space this process can ever use, so they
    // belong on the "used" side. Dividing by total blocks instead would report a few
    // percent more headroom than really exists — in the optimistic direction, which
    // is the wrong way for a safety cutoff to be wrong.
    const used = Number(s.blocks) - Number(s.bfree);
    const usable = used + Number(s.bavail);
    if (!Number.isFinite(usable) || usable <= 0) return null;
    return Math.round(100 - (used * 100) / usable);
  } catch {
    return null; // cannot measure is not the same as low — do not stop on it
  }
}

async function stopRequested() {
  try {
    await access(STOP_FILE);
    return true;
  } catch {
    return false;
  }
}

async function publish(height) {
  const w = windowRate();
  const doc = {
    schema: 1,
    // ── disclosure, and the reason this file is allowed to exist ──
    synthetic: true,
    label: "9Chain A1 public load test",
    note: "Every transaction from the addresses listed here is machine-generated test traffic, not real user activity.",
    senderAddresses: wallets.map((w) => w.address),
    // ── liveness ──
    running,
    stopReason,
    startedAt: new Date(startedAt).toISOString(),
    updatedAt: new Date().toISOString(),
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    targetTps: TARGET_TPS,
    // ── measured from blocks, never from send calls ──
    measured: {
      blockHeight: height,
      windowSeconds: Number(w.seconds.toFixed(1)),
      committedTxInWindow: w.tx,
      committedTps: w.seconds > 0 ? Number((w.tx / w.seconds).toFixed(2)) : null,
      blocksInWindow: w.blocks,
      secondsPerBlock: w.blocks > 0 ? Number((w.seconds / w.blocks).toFixed(2)) : null,
      committedTxSinceStart: committedTotal,
    },
    // ── kept separate on purpose: submitted is NOT throughput ──
    submitted: {
      txSinceStart: state.reduce((a, s) => a + s.sent, 0),
      failures: state.reduce((a, s) => a + s.failed, 0),
      resyncs: state.reduce((a, s) => a + s.resyncs, 0),
      inFlight: state.reduce((a, s) => a + s.inFlight, 0),
    },
  };
  // Write then rename: a reader must never catch a half-written file.
  const tmp = `${OUT}.tmp`;
  await writeFile(tmp, JSON.stringify(doc, null, 2));
  await rename(tmp, OUT);
}

/**
 * Pacing by DEFICIT against a fixed schedule, not by "send nine then sleep a second".
 *
 * The sleep-the-remainder version drifts, and it drifts one way only: every cycle
 * where the supervisor pass or a slow RPC call overran its slot silently shortened
 * the next second's budget, and the loss was never made up. Measured result was a
 * steady 8.6 tx/s against a target of 9 — close enough to look right, wrong enough
 * to be a lie once it is printed on the home page.
 *
 * Against a schedule (`elapsed x target - already sent`) any slow cycle is repaid by
 * the next one, so the long-run rate is the target rather than the target minus
 * whatever overhead happened to cost.
 *
 * The catch-up is capped: after a long stall the deficit could be thousands, and
 * dumping thousands of transactions at once is exactly how the pool eviction in the
 * header comment happens. One second of extra work is as much as it may repay at a
 * time, and MAX_IN_FLIGHT still governs the rest.
 */
let scheduleStart = Date.now();
let scheduledSent = 0;

async function tick() {
  const due = Math.floor(((Date.now() - scheduleStart) / 1000) * TARGET_TPS);
  // Forgive debt older than a few seconds. Without this, a wallet sitting at
  // MAX_IN_FLIGHT (or a node pause) accrues an unbounded backlog, and the moment it
  // clears, the pump repays it at the cap for as long as it takes — publishing
  // "9 tx/s" while actually running at double that. An honest rate has to be honest
  // in both directions.
  if (due - scheduledSent > TARGET_TPS * 5) scheduledSent = due - TARGET_TPS * 5;
  const deficit = Math.min(due - scheduledSent, TARGET_TPS * 2);
  if (deficit <= 0) return;

  // Spread across wallets so no single account carries the whole burst, and fire
  // them together: nine sequential round trips would themselves eat into the second.
  const plan = [];
  for (let n = 0; n < deficit; n++) plan.push(n % wallets.length);
  const results = await Promise.allSettled(plan.map((i) => sendOne(i)));
  scheduledSent += results.filter((r) => r.status === "fulfilled" && r.value).length;
}

async function supervise() {
  const height = await scanBlocks().catch(() => null);
  if (height == null) {
    rpcFailures++;
    if (rpcFailures >= MAX_RPC_FAILURES) {
      running = false;
      stopReason = `node unreachable for ${rpcFailures} consecutive probes`;
    }
    return null;
  }
  rpcFailures = 0;

  for (let i = 0; i < wallets.length; i++) {
    const s = state[i];
    const mined = await provider.getTransactionCount(wallets[i].address, "latest").catch(() => null);
    if (mined == null) continue;
    if (mined > s.minedNonce) {
      s.minedNonce = mined;
      s.minedNonceSince = Date.now();
      s.inFlight = Math.max(0, s.nextNonce - mined);
    } else if (s.inFlight > 0 && Date.now() - s.minedNonceSince > STUCK_AFTER_MS) {
      await unstick(i).catch((e) => log(`wallet ${i} unstick failed: ${e.message}`));
    }
  }

  const free = await diskFreePct();
  if (free != null && free < MIN_DISK_FREE_PCT) {
    running = false;
    stopReason = `disk only ${free}% free (floor ${MIN_DISK_FREE_PCT}%)`;
  }
  if (await stopRequested()) {
    running = false;
    stopReason = `stop file present: ${STOP_FILE}`;
  }
  if (deadlineMs && Date.now() >= deadlineMs) {
    running = false;
    stopReason = `reached the configured deadline ${STOP_AFTER} (HEARTBEAT_STOP_AFTER)`;
  }
  return height;
}

let deadlineMs = 0;
if (STOP_AFTER) {
  deadlineMs = Date.parse(STOP_AFTER);
  if (Number.isNaN(deadlineMs)) {
    console.error(`FATAL: HEARTBEAT_STOP_AFTER is not a date: ${STOP_AFTER}`);
    // Refuse rather than ignore. A deadline that silently does not parse is worse
    // than no deadline: whoever set it believes the pump will stop on its own.
    process.exit(1);
  }
  if (Date.now() >= deadlineMs) {
    console.error(`FATAL: the deadline ${STOP_AFTER} has already passed — refusing to start.`);
    process.exit(1);
  }
}

log(`heartbeat pump starting — target ${TARGET_TPS} tx/s across ${wallets.length} wallets`);
if (deadlineMs) {
  log(`deadline ${STOP_AFTER} — stops on its own in ${((deadlineMs - Date.now()) / 3600_000).toFixed(1)}h`);
} else {
  log(`no deadline set (HEARTBEAT_STOP_AFTER is empty) — this will run until stopped by hand`);
}
log(`rpc ${RPC}`);
log(`publishing to ${OUT}`);
// Print the disk reading at startup, not just the path. A path proves configuration;
// a percentage proves the check is actually looking at a real filesystem — and the
// way this cutoff fails in a container is by reading a plausible number off the
// wrong one, which only a human comparing it to the host can catch.
{
  const free = await diskFreePct();
  log(`disk check path ${DISK_PATH} — ${free == null ? "COULD NOT MEASURE" : `${free}% free`} (floor ${MIN_DISK_FREE_PCT}%)`);
}
wallets.forEach((w, i) => log(`  wallet ${i}: ${w.address}`));

for (let i = 0; i < wallets.length; i++) {
  await resync(i, "startup");
  const balance = await provider.getBalance(wallets[i].address);
  if (balance === 0n) {
    console.error(`FATAL: wallet ${i} (${wallets[i].address}) has no balance.`);
    console.error("  Fund the wallets once with fund-heartbeat-wallets.mjs, then restart.");
    process.exit(1);
  }
}

process.on("SIGINT", () => { running = false; stopReason = "SIGINT"; });
process.on("SIGTERM", () => { running = false; stopReason = "SIGTERM"; });

let lastSupervise = 0;
let lastPublish = 0;
let height = await provider.getBlockNumber();
// Start the pacing schedule here, not at import time: wallet derivation, the
// startup resync and nine balance reads all happen above, and counting that setup
// as elapsed schedule time would open with a burst to "catch up" on it.
scheduleStart = Date.now();
scheduledSent = 0;
while (running) {
  const tickStart = Date.now();
  await tick();

  if (Date.now() - lastSupervise >= 5_000) {
    lastSupervise = Date.now();
    const h = await supervise();
    if (h != null) height = h;
  }
  if (Date.now() - lastPublish >= 5_000) {
    lastPublish = Date.now();
    await publish(height).catch((e) => log(`publish failed: ${e.message}`));
    const w = windowRate();
    const tps = w.seconds > 0 ? (w.tx / w.seconds).toFixed(2) : "-";
    log(`height ${height} · committed ${tps} tx/s over ${w.seconds.toFixed(0)}s · submitted ${state.reduce((a, s) => a + s.sent, 0)} · inFlight ${state.reduce((a, s) => a + s.inFlight, 0)}`);
  }

  // Short cycle, not one second. The deficit pacer decides HOW MANY to send; the
  // cycle only decides how finely that is spread. A one-second cycle sends nine at
  // once and then idles, which is a spikier shape than the same rate spread out —
  // and spikes are what fill an account's pool slots.
  const rest = CYCLE_MS - (Date.now() - tickStart);
  if (rest > 0) await new Promise((r) => setTimeout(r, rest));
}

log(`stopping: ${stopReason}`);
await publish(height).catch(() => {});
process.exit(0);
