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
/**
 * 🔴 ONE PLACE. The self-test used to carry its own copy of this literal, and a hand-copied
 * constant beside the real one is two sources of truth waiting to drift — the 9Scan team found
 * exactly this shape in their own display an hour after warning me about the general case: their
 * date labels were a hand-copy of their mark, so arming the page printed a found block next to
 * the wrong date, and nothing tied the two together.
 */
const CEREMONY_MARK_ISO = "2026-09-09T06:09:09Z";
const MARK_ISO = opt("--at", CEREMONY_MARK_ISO);
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
/** One CANON row: `<id>  <sha256>  <N> bytes  …`. Returns null when the id is not declared. */
export function frozenFromCanon(id, canonText) {
  const m = String(canonText ?? "").match(new RegExp(`^${id}\\s+([0-9a-f]{64})\\s+(\\d+)\\s+bytes`, "m"));
  return m ? { digest: m[1], size: Number(m[2]) } : null;
}

/**
 * Bytes that are going ON CHAIN FOREVER, checked against the digest frozen in CANON.
 *
 * 🔴 ONE function for every such file, because there used to be two and only one of them checked.
 * `loadMessage` compared the 9S Union bytes against CANON — digest AND length — and refused on any
 * mismatch. `loadPayload`, the path Adam and Eva travel, was three lines: read the file, hex it,
 * send it. No digest, no length, no CANON. A comma added to `adam.txt` at the last minute would
 * have gone on chain permanently with nothing raising a word.
 *
 * The rule was right and it was applied to the half somebody had thought about — the 9S Union
 * message was known to carry text, while Adam and Eva were still undecided when this was written.
 * "Undecided" is exactly when a file needs the guard, not when it stops needing one.
 * (Found 2026-09-03, the same shape as four other defects the same week.)
 */
export function loadFrozen(file, id, canonFile = CANON_FILE, fs = { existsSync, readFileSync }) {
  if (!fs.existsSync(file)) return { error: `missing ${file}` };
  const bytes = fs.readFileSync(file);
  const digest = sha256(bytes);
  const frozen = fs.existsSync(canonFile) ? frozenFromCanon(id, fs.readFileSync(canonFile, "utf8")) : null;
  if (!frozen) return { error: `CANON carries no \`${id}\` line (${canonFile}) — freeze the bytes before the day`, bytes, digest };
  if (frozen.digest !== digest) return { error: `${file} does NOT match the digest CANON froze for \`${id}\` — refusing`, bytes, digest, frozen };
  if (frozen.size !== bytes.length) return { error: `${file} is ${bytes.length} bytes, CANON froze ${frozen.size} for \`${id}\``, bytes, digest, frozen };
  return { bytes, digest, frozen };
}

function loadMessage(messageFile = MESSAGE_FILE, canonFile = CANON_FILE) {
  return loadFrozen(messageFile, "9s_union_message", canonFile);
}

/**
 * Adam's or Eva's payload.
 *
 * No file ⇒ `0x`, and that stays a legitimate choice: sending them empty is a decision, not an
 * omission. But a file that IS given must be frozen in CANON like everything else that lands on
 * this chain permanently — supplying bytes is precisely the moment the guard starts to matter.
 */
export function loadPayload(file, id, canonFile = CANON_FILE) {
  if (!file) return { hex: "0x", declared: false };
  const r = loadFrozen(file, id, canonFile);
  if (r.error) return { error: r.error };
  return { hex: "0x" + r.bytes.toString("hex"), declared: true, digest: r.digest, size: r.bytes.length };
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
async function findBlockAdam(chain, { fromTop, markSec, inclusive, maxSteps = 10_000, probeBelow = 20 }) {
  const crosses = (b) => (inclusive ? b.timestamp >= markSec : b.timestamp > markSec);
  let best = null;
  let stoppedAt = null;
  for (let n = fromTop, steps = 0; n >= 0 && steps < maxSteps; n--, steps++) {
    const b = await chain.block(n);
    if (!b) break;
    if (!crosses(b)) { stoppedAt = n; break; }
    best = b;
  }

  // 🔴 THE WALK RESTS ON AN ASSUMPTION, SO IT CHECKS THE ASSUMPTION.
  //
  // "Timestamps are non-decreasing, therefore the blocks past the mark form a suffix, therefore
  // walking down until the rule first fails lands on the first block past the mark." Every step
  // of that is true on a healthy C-Chain — and if a single timestamp were ever out of order, the
  // walk would stop at the dip and return a LATER block with total confidence. A wrong block,
  // stated firmly, on the one number the ceremony is built on.
  //
  // The 9Scan team hit this exact shape in their own search an hour before this was written: a
  // conflicting sample was silently filtered out instead of being recognised as a conflict, and
  // the result looked perfectly normal. ⇒ Look a little further down. If anything below the
  // stopping point ALSO crosses the mark, the assumption is false here and the caller must be
  // told, not handed an answer.
  const contradictions = [];
  if (stoppedAt !== null) {
    for (let n = stoppedAt - 1, k = 0; n >= 0 && k < probeBelow; n--, k++) {
      const b = await chain.block(n);
      if (!b) break;
      if (crosses(b)) contradictions.push(b.number);
    }
  }
  return { block: best, contradictions };
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
  const scan = await findBlockAdam(chain, { fromTop: adamTx.blockNumber, markSec, inclusive });
  if (scan.contradictions.length) {
    score.ok(false, "block timestamps are ordered, so 'the first block past the mark' is well defined",
      `blocks ${scan.contradictions.join(", ")} are at or past the mark but sit BELOW a block that is not — the chain's timestamps are out of order here, and no walk can name Block Adam from them`);
    rec.abort = "timestamps-not-ordered";
    return rec;
  }
  const blockAdam = scan.block;
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
 * 🔴 HOW FAR AWAY IS THE NODE, IN BLOCKS?
 *
 * 🔴 AND THE FIRST ANSWER TO THIS QUESTION WAS WRONG BY A FACTOR OF SEVEN, MEASURED THE SAME HOUR.
 *
 * Five `curl` calls from the dev machine through Cloudflare read **0.76 – 2.94 s** each, which
 * says one round trip costs an entire block (~2s floor) and that racing for a slot is hopeless
 * from here. Then this function — same machine, same hostname, same minute — measured a median of
 * **309 ms** (292–312).
 *
 * The difference is not the network. `curl` opens a NEW TLS connection every invocation and pays
 * ~0.5s of handshake plus a cold path; ethers keeps the connection alive, so only the first call
 * pays that. The 2.9s figure measured **the tool**, not the link — this project's most expensive
 * failure class, *measuring the wrong quantity*, in the hands of the person warning about it.
 *
 * The 9Scan team re-measured the same hour after reading this and found the same defect in their
 * own figure, so the two now reconcile instead of contradicting each other:
 *
 *   from inside the server      9–10 ms          (their indexer's actual path)
 *   from the dev machine, warm  ~0.44–0.5 s curl · ~0.31 s ethers   ← round trip via the CF edge
 *   from the dev machine, cold  1.3–2.9 s        ← plus a fresh TLS handshake, every call
 *
 * So the honest ratio dev-to-server is about **50x**, not the 200x either side first said, and
 * the part that is genuinely distance is ~0.44 s for a **40-byte** response — no payload left to
 * blame it on.
 *
 * ⇒ What actually holds, at ~310 ms per call against a ~2s block floor (one call ≈ 0.15 blocks):
 *   · Deterministic mode on a quiet chain: comfortable. Each filler is ~3 round trips ≈ 1s, so
 *     eleven transactions land in roughly a minute, dominated by block time rather than by us.
 *   · Racing an exact slot on a chain that produces its own blocks: possible but not safe —
 *     detect + send is ~0.6s of a ~2s window, with no second attempt if it slips.
 *   · The offset (B-13(b)): still measure it over the connection the ceremony will actually use,
 *     and keep it warm. A cold first call would put half a second of handshake inside the number.
 *
 * A direct tunnel to the node (`--rpc http://127.0.0.1:<port>/ext/bc/C/rpc`, the M11.10 pattern —
 * key stays on the dev machine, traffic bypasses Cloudflare) is still the better link, and the
 * 9–77 ms 9Scan measured from inside the server is what it would buy. This function measures the
 * link and the traffic and says which mode they support, rather than leaving it to the day.
 */
async function probeBackground(chain, seconds, log = console.log) {
  const rtts = [];
  for (let i = 0; i < 5; i++) {
    const t0 = Date.now();
    await chain.blockNumber();
    rtts.push(Date.now() - t0);
  }
  rtts.sort((a, b) => a - b);
  const rttMedian = rtts[Math.floor(rtts.length / 2)];
  const start = await chain.blockNumber();
  log(`  round trip to the node: median ${rttMedian} ms (${rtts[0]}–${rtts[rtts.length - 1]} ms)`);
  log(`  measuring background block production for ${seconds}s (head ${start})…`);
  await sleep(seconds * 1000);
  const end = await chain.blockNumber();
  return { start, end, blocks: end - start, seconds, rttMedian, rtts };
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
    setBlockTs: (n, v) => blocks.set(n, v),
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

// Derived from the SAME constant the run uses, not typed again. (The first version of this line
// was a hand-typed epoch, off by 42,000 seconds, with a comment claiming it was the mark.)
const MARK = Math.floor(Date.parse(CEREMONY_MARK_ISO) / 1000);

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
    // 3b — 🔴 A TIMESTAMP OUT OF ORDER. The downward walk is only correct because timestamps are
    //      non-decreasing; if one dips below the mark with a crossing block underneath it, the
    //      walk stops at the dip and would name a LATER block with complete confidence. It must
    //      say the assumption failed instead of answering. (Found by 9Scan in their own search
    //      an hour before this case existed: a conflicting sample filtered out rather than
    //      recognised, and the wrong result looked perfectly normal.)
    {
      const c = fakeChain({ nextTs: MARK + 2 });
      c.setBlockTs(100, MARK + 1);   // crosses …
      c.mine();
      c.setBlockTs(101, MARK - 1);   // … but the block ABOVE it does not
      const { rec, score } = await run(c);
      cases.push(["a timestamp out of order aborts instead of naming a block",
        rec.abort === "timestamps-not-ordered" && !rec.union &&
        score.fail.some((f) => /well defined/.test(f))]);
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
    // 9b — 🔴 THE HOLE FOUND 2026-09-03: Adam/Eva went on chain with NO digest check at all.
    // These pin the fix in both directions, on a fake CANON so no real bytes are involved.
    {
      const fakeCanon = "adam_message  " + "a".repeat(64) + "  7 bytes  en\n";
      const mem = (files) => ({
        existsSync: (p) => p in files,
        readFileSync: (p) => files[p],
      });
      const seven = Buffer.from("ABCDEFG");
      const rightDigest = sha256(seven);
      const goodCanon = `adam_message  ${rightDigest}  7 bytes  en\n`;

      cases.push(["no --adam-data ⇒ empty payload, and that stays a legitimate choice",
        loadPayload(null, "adam_message").hex === "0x"]);
      cases.push(["🔴 a payload file with NO CANON line REFUSES — this is the hole that existed",
        !!loadPayload("/f", "adam_message", "/c", mem({ "/f": seven })).error]);
      cases.push(["🔴 a payload whose bytes do not match the frozen digest REFUSES",
        !!loadFrozen("/f", "adam_message", "/c", mem({ "/f": seven, "/c": fakeCanon })).error]);
      cases.push(["🔴 right digest but wrong LENGTH still refuses — both halves are checked",
        !!loadFrozen("/f", "adam_message", "/c",
          mem({ "/f": seven, "/c": `adam_message  ${rightDigest}  9 bytes  en\n` })).error]);
      cases.push(["a payload matching CANON exactly is accepted",
        !loadFrozen("/f", "adam_message", "/c", mem({ "/f": seven, "/c": goodCanon })).error]);
      cases.push(["🔴 the id is anchored — an `eva_message` row does not satisfy `adam_message`",
        !!loadFrozen("/f", "adam_message", "/c",
          mem({ "/f": seven, "/c": goodCanon.replace("adam_", "eva_") })).error]);
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
  // ~2s is the C-Chain block floor. A round trip of that order means one call costs one block.
  if (bg.rttMedian >= 500) {
    console.log(`  🟡 the node is ${bg.rttMedian} ms away — about ${(bg.rttMedian / 2000).toFixed(2)} block(s) per call.`);
    console.log("     Deterministic mode still holds (every step waits for its receipt), it is just");
    console.log("     slower. Hitting an exact slot on a chain that produces its own blocks needs a");
    console.log("     direct tunnel to the node (M11.10), not the public hostname through Cloudflare.");
    if (bg.blocks > 0) {
      console.log("  🔴 SLOW LINK **AND** A BUSY CHAIN. This combination cannot hit an exact block.");
    }
  }
  if (bg.blocks > 0) {
    console.log("  🔴 ANOTHER PRODUCER IS ACTIVE. Block numbers are the ceremony's arithmetic and");
    console.log("     nothing can reserve one: a stranger's transaction can take Block Adam itself or");
    console.log("     the anchor slot, and a retry means a NEW Adam and a NEW Eva.");
    if (SEND && !ALLOW_BUSY) {
      console.log("     ⇒ Refusing. --allow-busy-chain accepts the risk deliberately — but note that");
      console.log("       David ruled a QUIET WINDOW for this ceremony (D-149), so a busy chain here");
      console.log("       means something that was supposed to be stopped is still running. Find it");
      console.log("       before overriding: the flag does not make the chain quiet, only this gate.");
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

  const adamP = loadPayload(ADAM_DATA_FILE, "adam_message");
  const evaP = loadPayload(EVA_DATA_FILE, "eva_message");
  // 🔴 REFUSE, do not warn. These bytes are permanent, and a payload that does not match the
  // frozen digest is the one case where continuing is worse than stopping: the ceremony happens
  // once, and the wrong text cannot be taken back off the chain afterwards.
  for (const [ten, p] of [["Adam", adamP], ["Eva", evaP]]) {
    if (p.error) {
      console.error(`\n🔴 REFUSING: ${ten} payload — ${p.error}`);
      console.error("   Freeze the bytes in docs/block-adam/CANON.txt first (same shape as");
      console.error("   `9s_union_message`), then run again. Bytes decided on the day cannot be frozen.");
      return 2;
    }
  }
  const adamData = adamP.hex, evaData = evaP.hex;
  if (!adamP.declared || !evaP.declared) {
    console.log("\n  ⚠️ Adam/Eva carry NO payload. Nothing anywhere specifies what they should contain;");
    console.log("     if they are meant to carry text, freeze the bytes first and pass --adam-data /");
    console.log("     --eva-data. Bytes decided on the day cannot be frozen beforehand.");
  } else {
    console.log(`\n  ✓ Adam ${adamP.size}B ${adamP.digest.slice(0, 12)}…  ·  Eva ${evaP.size}B ${evaP.digest.slice(0, 12)}…  (both match CANON)`);
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
