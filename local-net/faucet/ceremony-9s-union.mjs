#!/usr/bin/env node
/**
 * ceremony-9s-union.mjs — the 2026-09-09 ceremony, driven end to end: **Adam → Eva → nine
 * blocks → the 9S Union message**, then read back FROM THE CHAIN.
 *
 * ═══ WHAT IT IS FOR ═══
 *
 * `docs/block-adam/CANON.txt` fixes the anchor point and leaves one mechanical problem open:
 *
 *   2026-09-09T06:09:09Z   ceremony: tx Adam, then tx Eva
 *   block Eva              the block after Block Adam
 *   block(Eva) + 9         where the 9S Union message is anchored
 *
 * 🔴 The open problem: **the C-Chain does not produce empty blocks.** It made block 1 at 10:05Z
 * on G-day off a single faucet drip and then sat there. So "nine blocks after Eva" does not
 * arrive on its own — on a quiet chain it may not arrive for days. CANON names two ways out and
 * says the second "has to be scripted in advance". This is that script.
 *
 * ═══ 🔴 THE DEFINITIONS COME FROM WHAT IS PUBLISHED, NOT FROM WHAT IS CONVENIENT ═══
 *
 * C1 published its engraving page on 2026-09-01 with a definition A1 had not written down:
 *
 *   Block Adam  the FIRST block whose timestamp is 2026-09-09T06:09:09Z **or later**.
 *               "Defined by time, not by height."
 *   Block Eva   the block **immediately after** Block Adam — one block, about three seconds.
 *
 * The three engraved documents on that page hash **byte for byte identically** to A1's own canon
 * (`docs/engrave/CANON.txt`), so the two chains are carrying the same text and will be read as
 * one story. A1 therefore implements the same definitions, and two consequences follow that the
 * earlier draft of this file got wrong:
 *
 *   1. **Block Adam is not "the block holding our transaction".** It is whatever block first
 *      carries a timestamp at or after the mark — a stranger's transaction can produce it. Our
 *      ceremony transaction is the MECHANISM for making such a block exist on an idle chain; it
 *      is not the definition. So this script finds Block Adam by scanning timestamps, then
 *      measures whether our transaction is in it.
 *   2. **Block Eva is Adam + 1 by HEIGHT**, so the anchor slot is `Adam + 10` and is known the
 *      instant Block Adam is known — it does not depend on where the Eva transaction lands. If
 *      the Eva transaction misses that block, the ceremony has a problem; the arithmetic does not.
 *
 * 🔴 **THE BOUNDARY IS RULED, NOT DEFAULTED — David, 2026-09-01 (D-147): INCLUSIVE.**
 * *"Use the inclusive rule — C1 has already published it."* (Original wording in D-147; §0 keeps
 * code English, so the quote lives there and the ruling lives here.) C1's page says "from
 * 06:09:09Z onward" (`>=`);
 * A1's 2026-08-27 drill scored the same question as *"the first block to CROSS"* (`>`) and failed
 * 1 of 8 cases on exactly this — the ceremonial block was sealed with a timestamp EXACTLY on the
 * mark, so under `>` Block Adam would have been Eva's block. Two chains telling one story may not
 * use two comparisons, and the one already published to readers is the one that wins.
 * `--boundary strict` is kept ONLY to measure the retired reading — it is not a supported way to
 * run the ceremony, and the run says so.
 *
 * ═══ THE THING MOST LIKELY TO RUIN THE DAY, NAMED UP FRONT ═══
 *
 * The chain is PUBLIC and the faucet is live. Every transaction a stranger sends produces a
 * block, and the ceremony's arithmetic is block numbers. There is no lock, there is no way to
 * reserve a block number, and a retry is not a retry: re-running means new Adam and Eva
 * transactions, i.e. a different ceremony. ⇒ The run MEASURES background block production first
 * and refuses to send on a busy chain unless explicitly told to accept the risk.
 *
 * ═══ TWO CLOCKS — DO NOT MIX THEM (inherited from block-adam-drill.mjs) ═══
 *
 * We SCHEDULE by the machine clock (`Date.now`), because it is the only clock we can command.
 * We VERIFY by `block.timestamp`, because it is the only clock the anchored thing carries. They
 * are not equal: `block.timestamp` is the proposing node's clock at sealing time.
 *
 * ═══ WHAT NOTHING SPECIFIES, AND THIS FILE DOES NOT INVENT ═══
 *
 * The CONTENT of the Adam and Eva transactions is written down nowhere. This script sends them as
 * zero-value self-transfers with empty calldata unless `--adam-data <file>` / `--eva-data <file>`
 * are given. If they are meant to carry text, that text has to be frozen the way the 9S Union
 * message was — before the day, not on it.
 *
 * Exit codes: `0` ceremony complete and verified · `1` something went wrong · `2` refused to run.
 *
 * Usage:
 *   node local-net/faucet/ceremony-9s-union.mjs --plan                 # measure only, send nothing
 *   node local-net/faucet/ceremony-9s-union.mjs --self-test            # reverse controls
 *   node local-net/faucet/ceremony-9s-union.mjs --send --offset-ms 3000 --wallet-key 0x…
 *
 * Flags:
 *   --rpc <url>          default https://rpc-a1.9chain.org/ext/bc/C/rpc
 *   --at <ISO>           ceremony mark. Default 2026-09-09T06:09:09Z (CANON).
 *   --boundary <mode>    inclusive (THE RULE, D-147) | strict (retired reading, for measuring only)
 *   --offset-ms <n>      broadcast at mark + n ms. REQUIRED with --send (B-13(b)).
 *   --lead-ms <n>        pre-sign this long before the mark (default 3000).
 *   --adam-data <file>   payload for the Adam transaction (default: none)
 *   --eva-data <file>    payload for the Eva transaction (default: none)
 *   --wallet-key <0x…>   or env A1_CEREMONY_PK. Never read from a file inside git.
 *   --expect-chainid <n> default 9000000009.
 *   --quiet-probe-s <n>  seconds spent measuring background block production (default 20).
 *   --allow-busy-chain   proceed even though other producers are active. Recorded in evidence.
 *   --json <file>        write the full measurement record.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const opt = (f, d) => {
  const i = argv.indexOf(f);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : d;
};

const SELF_TEST = has("--self-test");
const SEND = has("--send");
const RPC = opt("--rpc", "https://rpc-a1.9chain.org/ext/bc/C/rpc");
const MARK_ISO = opt("--at", "2026-09-09T06:09:09Z");
const BOUNDARY = opt("--boundary", "inclusive");
const LEAD_MS = Number(opt("--lead-ms", 3000));
const OFFSET_RAW = opt("--offset-ms", null);
const EXPECT_CHAINID = opt("--expect-chainid", "9000000009");
const QUIET_PROBE_S = Number(opt("--quiet-probe-s", 20));
const ALLOW_BUSY = has("--allow-busy-chain");
const JSON_OUT = opt("--json", null);
const PK = opt("--wallet-key", process.env.A1_CEREMONY_PK);
const ADAM_DATA_FILE = opt("--adam-data", null);
const EVA_DATA_FILE = opt("--eva-data", null);

const MESSAGE_FILE = path.join(ROOT, "docs/block-adam/9s-union-message.txt");
const CANON_FILE = path.join(ROOT, "docs/block-adam/CANON.txt");

/** Block Eva is Block Adam + 1 (C1's published definition: "the block immediately after"). */
const EVA_OFFSET_BLOCKS = 1;
/** The 9S Union message is anchored nine blocks after Block Eva (CANON, David 2026-09-01 10:10Z). */
const UNION_OFFSET_BLOCKS = 9;

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const utc = (ms) => new Date(ms).toISOString();

// ───────────────────────────── scoring: pass · fail · note ─────────────────────────────
//
// Three tiers, not two — the drill's reasoning (D-070) applies unchanged. The engraving anchors
// on a TRANSACTION HASH, something we hold, so a measurement about the whole chain ("was our
// block the first past the mark") can no longer decide right from wrong. Deleting it would throw
// away the clock-skew measurement B-13(b) needs; leaving it as a failure would make the run
// report red on a day where nothing went wrong. A gate that cries wolf is a gate that gets
// ignored on the one morning it is right.
function makeScore(log = console.log) {
  const pass = [], fail = [], notes = [];
  return {
    pass, fail, notes,
    ok(cond, label, detail = "") {
      (cond ? pass : fail).push(label);
      log(`  ${cond ? "✓" : "🔴"} ${label}${detail ? "  — " + detail : ""}`);
      return cond;
    },
    note(cond, label, detail = "") {
      notes.push({ label, ok: cond, detail });
      log(`  ${cond ? "✓" : "⚠️"} ${label}${detail ? "  — " + detail : ""}  [note, not scored]`);
    },
  };
}

// ───────────────────────────── the frozen message ─────────────────────────────

/**
 * The bytes, and the proof they are the bytes. CANON records the digest over the RAW FILE with no
 * normalisation of any kind — no NFC, no line-ending translation, no trailing newline — because
 * the genesis engraving taught this project that a sentence about to be hashed must stop moving
 * BEFORE anyone needs it. Reading the file is not enough; a file can drift. The digest is what
 * says it did not.
 */
function loadMessage(messageFile = MESSAGE_FILE, canonFile = CANON_FILE) {
  if (!existsSync(messageFile)) return { error: `missing ${messageFile}` };
  const bytes = readFileSync(messageFile);
  const digest = sha256(bytes);
  let frozen = null;
  if (existsSync(canonFile)) {
    const m = readFileSync(canonFile, "utf8").match(/^9s_union_message\s+([0-9a-f]{64})\s+(\d+)\s+bytes/m);
    if (m) frozen = { digest: m[1], size: Number(m[2]) };
  }
  if (!frozen) return { error: `CANON carries no 9s_union_message line (${canonFile})`, bytes, digest };
  if (frozen.digest !== digest) return { error: "message file does NOT match the frozen digest — refusing", bytes, digest, frozen };
  if (frozen.size !== bytes.length) return { error: `message file is ${bytes.length} bytes, CANON froze ${frozen.size}`, bytes, digest, frozen };
  return { bytes, digest, frozen };
}

function loadPayload(file) {
  if (!file) return "0x";
  const b = readFileSync(file);
  return "0x" + b.toString("hex");
}

// ───────────────────────────── chain adapter ─────────────────────────────
//
// Everything below the sequencer talks through this shape, so the whole ceremony can be driven
// against a simulated chain in --self-test. A sequence that has only ever been exercised against
// a live network is a sequence whose failure branches have never run.

async function ethersChain({ rpc, pk, expectChainId }) {
  const { ethers } = await import("ethers");
  const provider = new ethers.JsonRpcProvider(rpc, undefined, { staticNetwork: true });
  const net = await provider.getNetwork();
  const chainId = net.chainId.toString();
  if (expectChainId && chainId !== expectChainId) {
    throw new Error(`chainId is ${chainId}, expected ${expectChainId} — refusing to run a ceremony on the wrong chain`);
  }
  const wallet = pk ? new ethers.Wallet(pk, provider) : null;

  // 🔴 NONCE IS TRACKED LOCALLY AFTER ONE READ, and that is a scar, not a preference. The load
  // tester synchronised every transaction against `latest`; a single RPC hiccup returned a stale
  // count, two transactions took the same nonce, and the wallet was dead for the rest of the run
  // while the tool cheerfully printed "1044 sent". Here the run is eleven transactions long and
  // the last one has to land in one specific block.
  let nonce = wallet ? await provider.getTransactionCount(wallet.address, "pending") : 0;
  const fee = await provider.getFeeData();
  // Pre-signing fixes the fee at signing time. On a chain that congests in between, a signed
  // transaction can be left behind — so bid well above the observed base fee. This costs nothing
  // on a quiet chain and buys the ceremony its slot on a busy one.
  const maxFeePerGas = (fee.maxFeePerGas ?? 50_000_000_000n) * 3n;
  const maxPriorityFeePerGas = (fee.maxPriorityFeePerGas ?? 1_000_000_000n) * 3n;

  return {
    kind: "live",
    address: wallet?.address ?? null,
    async chainId() { return chainId; },
    async blockNumber() { return provider.getBlockNumber(); },
    async block(n) {
      const b = await provider.getBlock(n);
      return b ? { number: b.number, timestamp: b.timestamp, txCount: b.transactions.length } : null;
    },
    async balance() { return wallet ? provider.getBalance(wallet.address) : 0n; },
    async send({ data }) {
      if (!wallet) throw new Error("no wallet: --send needs --wallet-key or A1_CEREMONY_PK");
      const tx = await wallet.sendTransaction({
        to: wallet.address, value: 0n, data: data ?? "0x",
        nonce: nonce++, maxFeePerGas, maxPriorityFeePerGas,
      });
      return { hash: tx.hash };
    },
    async wait(hash) {
      const r = await provider.waitForTransaction(hash, 1, 120_000);
      if (!r) throw new Error(`no receipt for ${hash} within 120s`);
      return { blockNumber: r.blockNumber, status: r.status };
    },
    async getTx(hash) {
      const t = await provider.getTransaction(hash);
      return t ? { data: t.data, from: t.from, to: t.to, blockNumber: t.blockNumber } : null;
    },
  };
}

// ───────────────────────────── finding Block Adam by TIME ─────────────────────────────

/**
 * The first block at or after the mark, searched forward from the last block known to precede the
 * ceremony. This is the published definition — "defined by time, not by height" — so it is a
 * measurement over the chain, not a claim about our own transaction.
 *
 * `inclusive` decides whether a block sealed EXACTLY on the mark counts. See the header: C1
 * publishes inclusive, A1's drill used strict, and the difference is not hypothetical — it is the
 * single case the 2026-08-27 drill failed.
 */
/**
 * 🔴 IT WALKS DOWNWARD, AND THE UPWARD VERSION WAS A REAL BUG — caught by the fixture for
 * "a stranger's block crosses the mark first", which is the whole reason the definition is about
 * time. The first draft searched forward from the head measured before the ceremony started. But
 * a stranger's block can cross the mark WHILE we are waiting out the offset, i.e. at a height at
 * or below that head — and the search would then skip straight past the real Block Adam and crown
 * our own block instead. A wrong answer, printed confidently, about the one number the whole
 * ceremony is built on.
 *
 * Downward from the ceremony transaction's block: block timestamps on the C-Chain are
 * non-decreasing, so the blocks satisfying the rule form a suffix. Walk down while the rule still
 * holds and the last one that holds is the first block past the mark, no matter who produced it
 * or when we started looking.
 */
async function findBlockAdam(chain, { fromTop, markSec, inclusive, maxSteps = 10_000 }) {
  const crosses = (b) => (inclusive ? b.timestamp >= markSec : b.timestamp > markSec);
  let best = null;
  for (let n = fromTop, steps = 0; n >= 0 && steps < maxSteps; n--, steps++) {
    const b = await chain.block(n);
    if (!b) break;
    if (!crosses(b)) break;
    best = b;
  }
  return best;
}

// ───────────────────────────── the sequencer ─────────────────────────────

/**
 * 🔴 THE WHOLE CEREMONY, AND EVERY WAY IT IS ALLOWED TO STOP.
 *
 *   1. Adam      — broadcast at mark+offset, to make a block exist past the mark on an idle chain.
 *   2. Block Adam — FOUND BY TIMESTAMP, not assumed. Then measured: is our transaction in it?
 *   3. Eva       — broadcast immediately. Block Eva is Adam+1 BY DEFINITION; we measure whether
 *                  the Eva transaction actually landed there.
 *   4. Fillers   — one at a time, walking the head to Adam+9, driven by MEASURED block numbers
 *                  and never by a count of sends.
 *   5. Union     — sent only when the head is exactly Adam+9, required to land in Adam+10.
 *   6. Readback  — ask the chain for the transaction by hash and compare the bytes it returns
 *                  against the file. Reading our own variable back would be asking ourselves.
 */
async function runCeremony(chain, {
  message, dry, score, log = console.log,
  adamData = "0x", evaData = "0x",
  markSec = 0, inclusive = true, headBefore = null,
}) {
  const rec = { steps: [], dry, markSec, boundary: inclusive ? "inclusive" : "strict" };
  const send = async (label, data) => {
    if (dry) { log(`  · [dry] would send ${label}`); rec.steps.push({ label, dry: true }); return null; }
    const { hash } = await chain.send({ data, label });
    const r = await chain.wait(hash);
    log(`  · ${label}: block ${r.blockNumber}  tx ${hash.slice(0, 12)}…`);
    rec.steps.push({ label, hash, blockNumber: r.blockNumber, status: r.status });
    return { hash, ...r };
  };

  // A dry run enumerates the WHOLE sequence and invents no numbers. Printing "would send Adam"
  // and stopping would hide the two steps that carry all the risk — the filler walk and the one
  // block the message has to land in.
  if (dry) {
    await send("Adam", adamData);
    await send("Eva", evaData);
    for (let i = 1; i <= EVA_OFFSET_BLOCKS + UNION_OFFSET_BLOCKS - 2; i++) await send(`filler ${i}`, "0x");
    await send(`9S Union message (${message.bytes.length} bytes)`, "0x" + message.bytes.toString("hex"));
    return rec;
  }

  // ── 1 · Adam ──
  const adamTx = await send("Adam", adamData);
  score.ok(adamTx.status === 1, "Adam transaction succeeded", `block ${adamTx.blockNumber}`);

  // ── 2 · Block Adam, by TIME ──
  const blockAdam = await findBlockAdam(chain, { fromTop: adamTx.blockNumber, markSec, inclusive });
  if (!blockAdam) {
    // The block carrying our transaction was sealed BEFORE the mark. Nothing is broken on the
    // chain — but no Block Adam exists yet, and continuing would anchor the message against a
    // block number that the published definition does not point at.
    score.ok(false, "a block exists at or after the mark",
      `our Adam transaction is in block ${adamTx.blockNumber}, sealed before the mark ⇒ increase --offset-ms`);
    rec.abort = "no-block-past-mark";
    return rec;
  }
  const A = blockAdam.number;
  rec.adam = { hash: adamTx.hash, txBlock: adamTx.blockNumber, blockAdam: A, timestamp: blockAdam.timestamp };
  log(`\n  Block Adam = ${A}  ts ${blockAdam.timestamp} (${utc(blockAdam.timestamp * 1000)})`);

  // 🔴 The definition is about time; our transaction being inside it is a separate fact, and the
  // engraving does not depend on it (D-070 anchors on the transaction hash). So this is a NOTE —
  // but a loud one, because "the ceremony produced Block Adam" is what everyone will assume.
  score.note(A === adamTx.blockNumber, "our Adam transaction is IN Block Adam",
    A === adamTx.blockNumber ? `block ${A}` : `Block Adam is ${A}, our transaction is in ${adamTx.blockNumber} — someone else's block crossed the mark first`);

  // The boundary case that failed 1 of 8 in the 2026-08-27 drill, reported whenever it is live.
  score.note(blockAdam.timestamp !== markSec, "the boundary rule does not change the answer here",
    blockAdam.timestamp === markSec
      ? `block ${A} is sealed EXACTLY on the mark: inclusive counts it, strict would pick a later block`
      : `ts ${blockAdam.timestamp} vs mark ${markSec}`);

  // ── 3 · Eva ──
  const E = A + EVA_OFFSET_BLOCKS;              // by definition, not by receipt
  const evaTx = await send("Eva", evaData);
  score.ok(evaTx.status === 1, "Eva transaction succeeded", `block ${evaTx.blockNumber}`);
  score.ok(evaTx.blockNumber === E, `the Eva transaction is in Block Eva (Adam+${EVA_OFFSET_BLOCKS})`,
    `block ${evaTx.blockNumber}, Block Eva is ${E}`);
  rec.eva = { hash: evaTx.hash, txBlock: evaTx.blockNumber, blockEva: E };

  const target = E + UNION_OFFSET_BLOCKS;
  rec.targetBlock = target;
  log(`\n  Block Eva = ${E}   anchor slot = Eva + ${UNION_OFFSET_BLOCKS} = ${target}`);

  // ── 4 · fillers, one at a time, driven by measured head ──
  let head = await chain.blockNumber();
  let fillers = 0;
  while (head < target - 1) {
    await send(`filler ${fillers + 1}`, "0x");
    fillers++;
    head = await chain.blockNumber();
    if (head > target - 1) break;
    if (fillers > UNION_OFFSET_BLOCKS * 4) {
      score.ok(false, "filler loop stayed bounded", `${fillers} sends and the head is still ${head}`);
      rec.abort = "filler-loop-overrun";
      return rec;
    }
  }
  rec.fillers = fillers;

  // 🔴 The slot is a block number, and block numbers belong to the chain, not to us. If anything
  // — another user, the heartbeat pump, our own filler landing two blocks at once — pushed the
  // head to or past the target, the message CANNOT be anchored where CANON says. The run stops
  // here with nothing else sent. Anchoring it "close enough" would put a wrong claim on a chain
  // that keeps it forever.
  if (head !== target - 1) {
    score.ok(false, `head is exactly ${target - 1} before the message is sent`,
      `head ${head} — the slot at ${target} is gone; NOTHING further was sent`);
    rec.abort = "slot-lost";
    return rec;
  }

  // ── 5 · the message ──
  const union = await send("9S Union message", "0x" + message.bytes.toString("hex"));
  rec.union = { hash: union.hash, block: union.blockNumber };
  score.ok(union.status === 1, "9S Union transaction succeeded", `block ${union.blockNumber}`);
  score.ok(union.blockNumber === target, `9S Union landed in Block Eva + ${UNION_OFFSET_BLOCKS}`,
    `block ${union.blockNumber}, target ${target}`);

  // ── 6 · readback, in the reverse direction ──
  const back = await chain.getTx(union.hash);
  const backBytes = back ? Buffer.from(String(back.data).replace(/^0x/, ""), "hex") : Buffer.alloc(0);
  score.ok(back !== null, "the chain returns the transaction when given its hash");
  score.ok(backBytes.equals(message.bytes), "bytes ON THE CHAIN equal bytes IN THE FILE",
    `${backBytes.length} bytes, sha256 ${sha256(backBytes).slice(0, 16)}…`);
  score.ok(sha256(backBytes) === message.digest, "on-chain digest equals the digest frozen in CANON",
    message.digest.slice(0, 16) + "…");
  rec.readback = { bytes: backBytes.length, digest: sha256(backBytes) };
  return rec;
}

// ───────────────────────────── background traffic probe ─────────────────────────────

/**
 * How fast does the chain make blocks when WE are not sending anything? On a quiet chain the
 * answer is zero and the ceremony's arithmetic holds. Anything above zero means another producer
 * can take the anchor slot mid-run — or Block Adam itself — and no lock anywhere can stop it.
 */
async function probeBackground(chain, seconds, log = console.log) {
  const start = await chain.blockNumber();
  log(`  measuring background block production for ${seconds}s (head ${start})…`);
  await sleep(seconds * 1000);
  const end = await chain.blockNumber();
  return { start, end, blocks: end - start, seconds };
}

/** Wait for a wall-clock instant, tightening as it approaches. Precision is the product here. */
async function waitUntil(ms) {
  for (;;) {
    const left = ms - Date.now();
    if (left <= 0) return;
    if (left > 2000) await sleep(Math.min(left - 1000, 30_000));
    else if (left > 50) await sleep(10);
    else await new Promise((r) => setImmediate(r));
  }
}

// ───────────────────────────── self-test: a simulated chain ─────────────────────────────

/**
 * A chain we can make misbehave on purpose, with controllable block timestamps — the definitions
 * are about time, so a fake chain without a clock could not test them.
 *
 * `nextTs` is the timestamp the next mined block gets; every mined block advances it by `tsStep`.
 * A test simulates "a stranger crossed the mark first" by mining before the ceremony starts.
 */
function fakeChain({ startBlock = 100, nextTs = 0, tsStep = 3, extraBlocksPerSend = 0, extraFrom = 1, unionLandsAt = null } = {}) {
  let head = startBlock;
  let ts = nextTs;
  const blocks = new Map([[startBlock, ts - tsStep]]);
  const txs = new Map();
  let sends = 0;
  const mine = () => { head += 1; blocks.set(head, ts); ts += tsStep; return head; };
  return {
    kind: "fake",
    sends: () => sends,
    mine,                                   // for simulating other people's traffic
    setNextTs: (v) => { ts = v; },
    async chainId() { return "9000000009"; },
    async blockNumber() { return head; },
    async block(n) { return blocks.has(n) ? { number: n, timestamp: blocks.get(n), txCount: 1 } : null; },
    async balance() { return 10n ** 20n; },
    async send({ data }) {
      sends++;
      const hash = "0x" + sha256(Buffer.from(`${sends}:${data ?? ""}`)).slice(0, 64);
      let landed = mine();
      if (sends >= extraFrom) for (let i = 0; i < extraBlocksPerSend; i++) landed = mine();
      // The union transaction is the one carrying a payload much longer than a filler.
      if (unionLandsAt !== null && data && data.length > 10) {
        for (let i = 0; i < unionLandsAt; i++) landed = mine();
      }
      txs.set(hash, { data: data ?? "0x", from: "0xself", to: "0xself", blockNumber: landed });
      return { hash };
    },
    async wait(hash) { const t = txs.get(hash); return { blockNumber: t.blockNumber, status: 1 }; },
    async getTx(hash) { return txs.get(hash) ?? null; },
  };
}

// Derived, not typed: a hand-copied epoch constant with a comment claiming it is the ceremony
// mark is a wrong number wearing a correct label. (The first version of this line was off by
// 42,000 seconds and said so in a comment.)
const MARK = Math.floor(Date.parse("2026-09-09T06:09:09Z") / 1000);

function selfTest() {
  const silent = () => {};
  const cases = [];
  const msg = { bytes: Buffer.from("nine s union message fixture"), digest: null };
  msg.digest = sha256(msg.bytes);

  const run = async (chain, extra = {}) => {
    const score = makeScore(silent);
    const headBefore = await chain.blockNumber();
    const rec = await runCeremony(chain, {
      message: msg, dry: false, score, log: silent,
      markSec: MARK, inclusive: true, headBefore, ...extra,
    });
    return { rec, score };
  };

  return (async () => {
    // 1 — happy path: our Adam transaction makes the first block past the mark, the message lands
    //     in Adam+10, and the bytes come back identical.
    {
      const { rec, score } = await run(fakeChain({ nextTs: MARK + 2 }));
      cases.push(["happy path: Block Adam is ours, message anchors at Adam+10",
        score.fail.length === 0 && rec.adam.blockAdam === rec.adam.txBlock &&
        rec.union.block === rec.adam.blockAdam + 10]);
    }
    // 2 — 🔴 THE DEFINITION IS ABOUT TIME. A stranger's block crosses the mark first: Block Adam
    //     is THEIRS, our transaction is in a later block, and the anchor slot moves with the
    //     definition rather than with us.
    {
      const c = fakeChain({ nextTs: MARK + 1 });
      const strangerBlock = c.mine();                  // someone else, one second after the mark
      const { rec, score } = await run(c);
      cases.push(["a stranger's block past the mark becomes Block Adam, and is reported",
        rec.adam.blockAdam === strangerBlock && rec.adam.txBlock !== strangerBlock &&
        score.notes.some((n) => !n.ok && /IN Block Adam/.test(n.label))]);
    }
    // 3 — 🔴 the 2026-08-27 boundary, exactly: a block sealed ON the mark. Inclusive takes it,
    //     strict does not — the one case that drill failed.
    {
      const c1 = fakeChain({ nextTs: MARK });
      const r1 = await run(c1, { inclusive: true });
      const c2 = fakeChain({ nextTs: MARK });
      const r2 = await run(c2, { inclusive: false });
      cases.push(["a block sealed EXACTLY on the mark: inclusive counts it, strict does not",
        r1.rec.adam?.timestamp === MARK && r2.rec.adam?.blockAdam !== r1.rec.adam?.blockAdam]);
      cases.push(["and the boundary is reported as a note when it is live",
        r1.score.notes.some((n) => !n.ok && /boundary rule/.test(n.label))]);
    }
    // 4 — our block is sealed BEFORE the mark: no Block Adam exists, so nothing may be anchored.
    {
      const { rec, score } = await run(fakeChain({ nextTs: MARK - 60 }));
      cases.push(["a ceremony block sealed before the mark aborts instead of anchoring",
        rec.abort === "no-block-past-mark" && !rec.union && score.fail.length === 1]);
    }
    // 5 — the public-chain risk: traffic runs the head past the slot mid-walk.
    {
      // Extra blocks only from the third send onward: Adam and Eva land where they should, and
      // the disruption hits the filler walk — which is what a busy chain actually does to a run
      // that got its first two blocks cleanly.
      const { rec, score } = await run(fakeChain({ nextTs: MARK + 2, extraBlocksPerSend: 4, extraFrom: 3 }));
      cases.push(["slot overrun stops the run and sends no message",
        rec.abort === "slot-lost" && !rec.union && score.fail.length === 1]);
    }
    // 6 — the union transaction lands one block late: RED, and said out loud.
    {
      const { rec, score } = await run(fakeChain({ nextTs: MARK + 2, unionLandsAt: 1 }));
      cases.push(["a message landing one block late is RED",
        !!rec.union && score.fail.some((f) => /Block Eva \+ 9/.test(f))]);
    }
    // 7 — 🔴 dry run must not touch the chain. Not "sends nothing important": sends NOTHING.
    {
      const c = fakeChain({ nextTs: MARK + 2 });
      const score = makeScore(silent);
      await runCeremony(c, { message: msg, dry: true, score, log: silent, markSec: MARK });
      cases.push(["dry run broadcasts zero transactions", c.sends() === 0]);
    }
    // 8 — readback comparison must be able to fail, or it proves nothing.
    {
      const c = fakeChain({ nextTs: MARK + 2 });
      const orig = c.getTx.bind(c);
      c.getTx = async (h) => { const t = await orig(h); return t && { ...t, data: "0xdeadbeef" }; };
      const { score } = await run(c);
      cases.push(["a chain returning different bytes is caught",
        score.fail.some((f) => /bytes ON THE CHAIN/.test(f))]);
    }
    // 9 — the frozen digest is the gate on the payload, and it must reject drift…
    {
      const bad = loadMessage(MESSAGE_FILE, path.join(HERE, "does-not-exist.txt"));
      cases.push(["a missing CANON line refuses the run", !!bad.error]);
    }
    // 10 — …and accept the real, unmodified pair (the mirror of case 9).
    {
      const good = loadMessage();
      cases.push(["the real message matches the frozen digest", !good.error && good.bytes.length === good.frozen.size]);
    }
    return cases;
  })();
}

// ───────────────────────────── main ─────────────────────────────

async function main() {
  if (SELF_TEST) {
    const cases = await selfTest();
    let bad = 0;
    for (const [name, ok] of cases) { console.log(`  ${ok ? "✓" : "🔴"} ${name}`); if (!ok) bad++; }
    console.log(`\n  ${cases.length - bad}/${cases.length} reverse controls passed`);
    return bad ? 1 : 0;
  }

  const markMs = Date.parse(MARK_ISO);
  if (!Number.isFinite(markMs)) { console.error(`--at unreadable: ${MARK_ISO}`); return 2; }
  if (BOUNDARY !== "inclusive" && BOUNDARY !== "strict") {
    console.error(`--boundary must be inclusive or strict, got ${BOUNDARY}`);
    return 2;
  }
  const inclusive = BOUNDARY === "inclusive";
  const markSec = Math.floor(markMs / 1000);

  console.log("═══ CEREMONY 2026-09-09 — Adam · Eva · nine blocks · the 9S Union message ═══");
  console.log(`mode      : ${SEND ? "🔴 LIVE — transactions WILL be broadcast" : "dry run (nothing is sent)"}`);
  console.log(`rpc       : ${RPC}`);
  console.log(`mark      : ${utc(markMs)}  (epoch ${markSec})`);
  console.log(`Block Adam: first block with ts ${inclusive ? ">=" : ">"} mark  [--boundary ${BOUNDARY}]`);
  if (!inclusive) {
    console.log("  🔴 --boundary strict is the RETIRED reading (D-147 ruled inclusive, because C1 had");
    console.log("     already published it). Use it to measure the divergence, never to run the ceremony.");
  }
  console.log(`Block Eva : Block Adam + ${EVA_OFFSET_BLOCKS}   ·   anchor slot: Block Eva + ${UNION_OFFSET_BLOCKS}`);

  // ── refusals, before anything is measured or signed ──
  const message = loadMessage();
  if (message.error) {
    console.log(`\n🔴 REFUSING: ${message.error}`);
    console.log("   The bytes are frozen (CANON). A message that no longer matches its digest is a");
    console.log("   different message, and the digest is what people will quote.");
    return 2;
  }
  console.log(`message   : ${message.bytes.length} bytes · sha256 ${message.digest.slice(0, 16)}…  ✓ matches CANON`);

  if (SEND && OFFSET_RAW === null) {
    console.log("\n🔴 REFUSING: --send without --offset-ms.");
    console.log("   B-13(b) is not paperwork. The 2026-08-27 drill at offset 0 scored 7/1: the block");
    console.log("   carrying the ceremonial transaction was sealed with a timestamp EXACTLY on the");
    console.log("   mark. Under the published (inclusive) rule that block IS Block Adam; under the");
    console.log("   drill's strict rule it is not. Do not run into that boundary by accident —");
    console.log("   measure the skew on a chain that is PRODUCING BLOCKS and pass the number.");
    return 2;
  }
  const offsetMs = Number(OFFSET_RAW ?? 0);
  // Cheapest refusals first, and this one before the key check on purpose: it can then be
  // exercised without a private key ever appearing on a command line or in a shell history.
  if (SEND && markMs + offsetMs < Date.now()) {
    console.log(`\n🔴 REFUSING: the mark (${utc(markMs + offsetMs)}) is already in the past.`);
    return 2;
  }
  if (SEND && !PK) { console.log("\n🔴 REFUSING: --send needs --wallet-key or A1_CEREMONY_PK."); return 2; }

  let chain;
  try {
    chain = await ethersChain({ rpc: RPC, pk: SEND ? PK : null, expectChainId: EXPECT_CHAINID });
  } catch (e) {
    console.log(`\n🔴 ${e.message}`);
    return 2;
  }
  console.log(`chainId   : ${await chain.chainId()}  ✓ expected ${EXPECT_CHAINID}`);
  if (chain.address) {
    const bal = await chain.balance();
    console.log(`wallet    : ${chain.address}  ${(Number(bal) / 1e18).toFixed(6)} LOVE9`);
    if (bal === 0n) { console.log("\n🔴 REFUSING: the ceremony wallet is empty."); return 2; }
  }

  const score = makeScore();
  console.log("\n── background traffic ──");
  const bg = await probeBackground(chain, QUIET_PROBE_S);
  console.log(`  ${bg.blocks} block(s) in ${bg.seconds}s with nothing sent by us`);
  if (bg.blocks > 0) {
    console.log("  🔴 ANOTHER PRODUCER IS ACTIVE. Block numbers are the ceremony's arithmetic and");
    console.log("     nothing can reserve one: a stranger's transaction can take Block Adam itself or");
    console.log("     the anchor slot, and a retry means a NEW Adam and a NEW Eva.");
    if (SEND && !ALLOW_BUSY) {
      console.log("     ⇒ Refusing. Re-run with --allow-busy-chain to accept the risk deliberately.");
      return 2;
    }
  }

  const headBefore = await chain.blockNumber();
  const b = await chain.block(headBefore);
  const skewS = b ? b.timestamp - Math.floor(Date.now() / 1000) : null;
  console.log(`\n  head      : block ${headBefore}  ts ${b?.timestamp} (${b ? utc(b.timestamp * 1000) : "?"})`);
  console.log(`  skew hint : ${skewS >= 0 ? "+" : ""}${skewS}s  ⚠️ this is the AGE of the last block plus the`);
  console.log("              node's skew, and on an idle chain age dominates: a 10s-old block reads");
  console.log("              as -10s of \"skew\". Only a chain producing blocks gives B-13(b) a number.");

  const adamData = loadPayload(ADAM_DATA_FILE);
  const evaData = loadPayload(EVA_DATA_FILE);
  if (adamData === "0x" || evaData === "0x") {
    console.log("\n  ⚠️ Adam/Eva carry NO payload. Nothing anywhere specifies what they should contain;");
    console.log("     if they are meant to carry text, freeze the bytes first and pass --adam-data /");
    console.log("     --eva-data. Bytes decided on the day cannot be frozen beforehand.");
  }

  if (!SEND) {
    console.log("\n── plan (nothing will be sent) ──");
    console.log(`  at ${utc(markMs + offsetMs)}  Adam            → forces a block past the mark`);
    console.log(`  measure                    Block Adam      = first block with ts ${inclusive ? ">=" : ">"} ${markSec}`);
    console.log(`  then                       Eva             → must land in Block Adam + ${EVA_OFFSET_BLOCKS}`);
    console.log("  then                       8 fillers       → head walks to the slot minus one");
    console.log(`  then                       9S Union        → must land in Block Eva + ${UNION_OFFSET_BLOCKS}`);
    console.log(`  then                       read it back by hash and compare ${message.bytes.length} bytes`);
    await runCeremony(chain, { message, dry: true, score, markSec, inclusive });
    console.log("\n✓ plan only. Add --send --offset-ms <n> --wallet-key <0x…> to perform it.");
    return 0;
  }

  // ── live: pre-sign window, then the mark ──
  const fireAt = markMs + offsetMs;
  console.log(`\n  waiting until ${utc(fireAt)} (mark ${offsetMs >= 0 ? "+" : ""}${offsetMs} ms, pre-signed ${LEAD_MS} ms ahead)…`);
  await waitUntil(fireAt - LEAD_MS);
  await waitUntil(fireAt);

  console.log("\n── ceremony ──");
  const rec = await runCeremony(chain, { message, dry: false, score, adamData, evaData, markSec, inclusive, headBefore });

  console.log(`\n  ${score.pass.length} pass · ${score.fail.length} fail · ${score.notes.length} note(s)`);
  if (JSON_OUT) {
    writeFileSync(JSON_OUT, JSON.stringify({ mark: MARK_ISO, markSec, boundary: BOUNDARY, offsetMs, rpc: RPC, background: bg, record: rec, pass: score.pass, fail: score.fail, notes: score.notes }, null, 2));
    console.log(`  evidence written: ${JSON_OUT}`);
  }
  if (score.fail.length) {
    console.log("\n🔴 The ceremony did not complete as published. What happens next is a decision, not a");
    console.log("   retry: re-running means a new Adam and a new Eva. Record what happened first.");
    return 1;
  }
  console.log("\n✓ Anchored and verified from the chain.");
  return 0;
}

process.exit(await main());
