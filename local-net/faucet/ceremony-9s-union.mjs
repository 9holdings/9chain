#!/usr/bin/env node
/**
 * ceremony-9s-union.mjs — the 2026-09-09 ceremony, driven end to end: **Adam → Eva → nine
 * blocks → the 9S Union message**, then read back FROM THE CHAIN.
 *
 * ═══ WHAT IT IS FOR ═══
 *
 * `docs/block-adam/CANON.txt` fixes three things and leaves one mechanical problem open:
 *
 *   2026-09-09T06:09:09Z   ceremony: tx Adam, then tx Eva
 *   block Eva              = the block carrying the Eva transaction
 *   block(Eva) + 9         = where the 9S Union message is anchored
 *
 * 🔴 The open problem: **the C-Chain does not produce empty blocks.** It made block 1 at 10:05Z
 * on G-day off a single faucet drip and then sat there. So "nine blocks after Eva" does not
 * arrive on its own — on a quiet chain it may not arrive for days. CANON names two ways out and
 * says the second "has to be scripted in advance". This is that script.
 *
 * ⚠️ It is written for a day that happens ONCE. Everything about it is therefore biased towards
 * refusing rather than improvising:
 *
 *   - **Dry run is the default.** Nothing is signed or broadcast without `--send`. Broadcasting
 *     is a person's act, and this file never makes it accidentally.
 *   - **It refuses to start with an unmeasured offset.** B-13(b) is not paperwork: the 2026-08-27
 *     drill at `--offset-ms 0` scored 7 pass / 1 FAIL because the ceremonial block landed with a
 *     timestamp EXACTLY on the mark, and "the first block to CROSS" is a strict comparison. The
 *     whole distance between hitting and missing was one `>` versus `>=`. `+3000 ms` scored 9/0.
 *   - **It refuses to guess the chain.** A ceremony broadcast against the wrong chainId cannot be
 *     undone, so the expected chainId is checked before anything else moves.
 *   - **It stops instead of anchoring in the wrong block.** If the slot at `block(Eva)+9` is
 *     taken by someone else's traffic before the message can be sent, the run goes RED and sends
 *     NOTHING further. What happens then is David's decision (re-run the ceremony, or publish the
 *     deviation) — not a decision this file may make at 06:09 in the morning.
 *
 * ═══ THE THING MOST LIKELY TO RUIN THE DAY, NAMED UP FRONT ═══
 *
 * The chain is PUBLIC and the faucet is live. Every transaction a stranger sends produces a
 * block, and the ceremony's arithmetic is block numbers. If the heartbeat pump is running, or a
 * handful of users are dripping, `block(Eva)+9` can be produced by someone else while the script
 * is still walking towards it. There is no lock, there is no way to reserve a block number, and
 * a retry is not a retry: re-running means new Adam and Eva transactions, i.e. a different
 * ceremony. ⇒ The run therefore MEASURES background block production first and refuses to send
 * on a busy chain unless explicitly told to accept the risk.
 *
 * ═══ TWO CLOCKS — DO NOT MIX THEM (inherited from block-adam-drill.mjs) ═══
 *
 * We SCHEDULE by the machine clock (`Date.now`), because it is the only clock we can command.
 * We VERIFY by `block.timestamp`, because it is the only clock the anchored thing carries. They
 * are not equal: `block.timestamp` is the proposing node's clock at sealing time.
 *
 * ═══ WHAT CANON DOES NOT SAY, AND THIS FILE DOES NOT INVENT ═══
 *
 * The CONTENT of the Adam and Eva transactions is not specified anywhere. This script sends them
 * as zero-value self-transfers with empty calldata unless `--adam-data <file>` / `--eva-data
 * <file>` are given. If they are meant to carry text, that text has to be frozen the way the 9S
 * Union message was — before the day, not on it.
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
 *   --offset-ms <n>      broadcast at mark + n ms. REQUIRED with --send (B-13(b)).
 *   --lead-ms <n>        pre-sign this long before the mark (default 3000).
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
const LEAD_MS = Number(opt("--lead-ms", 3000));
const OFFSET_RAW = opt("--offset-ms", null);
const EXPECT_CHAINID = opt("--expect-chainid", "9000000009");
const QUIET_PROBE_S = Number(opt("--quiet-probe-s", 20));
const ALLOW_BUSY = has("--allow-busy-chain");
const JSON_OUT = opt("--json", null);
const PK = opt("--wallet-key", process.env.A1_CEREMONY_PK);

const MESSAGE_FILE = path.join(ROOT, "docs/block-adam/9s-union-message.txt");
const CANON_FILE = path.join(ROOT, "docs/block-adam/CANON.txt");

/** How many blocks after Eva's block the message is anchored in. CANON, David 2026-09-01 10:10Z. */
const UNION_OFFSET_BLOCKS = 9;

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const utc = (ms) => new Date(ms).toISOString();

// ───────────────────────────── scoring: pass · fail · note ─────────────────────────────
//
// Three tiers, not two — the drill's reasoning (D-070) applies unchanged. The anchor is a
// TRANSACTION HASH, something we hold, so a measurement about the whole chain ("was our block the
// first to cross the mark") can no longer decide right from wrong. Deleting it would throw away
// the clock-skew measurement B-13(b) needs; leaving it as a failure would make the run report red
// on a day where nothing went wrong. A gate that cries wolf is a gate that gets ignored on the
// one morning it is right.
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
  if (frozen.digest !== digest) return { error: `message file does NOT match the frozen digest — refusing`, bytes, digest, frozen };
  if (frozen.size !== bytes.length) return { error: `message file is ${bytes.length} bytes, CANON froze ${frozen.size}`, bytes, digest, frozen };
  return { bytes, digest, frozen };
}

// ───────────────────────────── chain adapter ─────────────────────────────
//
// Everything below the sequencer talks through this shape, so the whole ceremony can be driven
// against a simulated chain in --self-test. A sequence that has only ever been exercised against
// a live network is a sequence whose failure branches have never run.
//
//   blockNumber()            -> number
//   block(n)                 -> {number, timestamp, txCount} | null
//   send({data, label})      -> {hash}                (signs and broadcasts)
//   wait(hash)               -> {blockNumber, status}
//   getTx(hash)              -> {data, from, to, blockNumber}
//   chainId()                -> string

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
  // while the tool cheerfully printed "1044 sent". Here the run is nine-plus transactions long
  // and the last one has to land in one specific block.
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

// ───────────────────────────── the sequencer ─────────────────────────────

/**
 * 🔴 THE WHOLE CEREMONY, AND EVERY WAY IT IS ALLOWED TO STOP.
 *
 * Steps, in order, each one measured before the next begins:
 *   1. Adam  — broadcast at mark+offset. Its block is Block Adam; the engraving anchors on its
 *              HASH (D-070), not on the block number, so a stranger's transaction sharing the
 *              block cannot take anything away.
 *   2. Eva   — broadcast immediately after. Its block E is the ONLY number the rest depends on.
 *   3. Filler×N — one transaction at a time, each awaited, walking the head from E to E+8. One
 *              transaction usually means one block, but nothing guarantees it, so the loop is
 *              driven by MEASURED block numbers and never by a count of sends.
 *   4. Union — sent only when the head is exactly E+8, and required to land in exactly E+9.
 *   5. Readback — ask the chain for the transaction by hash and compare the bytes it returns
 *              against the file. Reading our own variable back would be asking ourselves.
 */
async function runCeremony(chain, { message, dry, score, log = console.log, adamData = "0x", evaData = "0x" }) {
  const rec = { steps: [], dry };
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
    for (let i = 1; i <= UNION_OFFSET_BLOCKS - 1; i++) await send(`filler ${i}`, "0x");
    await send(`9S Union message (${message.bytes.length} bytes)`, "0x" + message.bytes.toString("hex"));
    return rec;
  }

  // ── 1 · Adam ──
  const adam = await send("Adam", adamData);
  score.ok(adam.status === 1, "Adam transaction succeeded", `block ${adam.blockNumber}`);
  rec.adam = { hash: adam.hash, block: adam.blockNumber };

  // ── 2 · Eva ──
  const eva = await send("Eva", evaData);
  score.ok(eva.status === 1, "Eva transaction succeeded", `block ${eva.blockNumber}`);
  rec.eva = { hash: eva.hash, block: eva.blockNumber };

  // The drill measured Adam and Eva two seconds and one block apart. That was a measurement, not
  // a rule, so this run measures it again instead of assuming: if they share a block, the anchor
  // slot is still well defined (E == A), and the run says so rather than quietly proceeding.
  score.note(eva.blockNumber > adam.blockNumber, "Adam and Eva landed in different blocks",
    eva.blockNumber === adam.blockNumber ? `BOTH in block ${eva.blockNumber} — anchor slot becomes ${eva.blockNumber + UNION_OFFSET_BLOCKS}` : `${adam.blockNumber} → ${eva.blockNumber}`);

  const target = eva.blockNumber + UNION_OFFSET_BLOCKS;
  rec.targetBlock = target;
  log(`\n  anchor slot: block(Eva) + ${UNION_OFFSET_BLOCKS} = ${target}`);

  // ── 3 · fillers, one at a time, driven by measured head ──
  let head = await chain.blockNumber();
  let fillers = 0;
  while (head < target - 1) {
    const f = await send(`filler ${fillers + 1}`, "0x");
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
    score.ok(false, `head is exactly block(Eva)+${UNION_OFFSET_BLOCKS - 1} before the message is sent`,
      `head ${head}, needed ${target - 1} — the slot at ${target} is gone; NOTHING further was sent`);
    rec.abort = "slot-lost";
    return rec;
  }

  // ── 4 · the message ──
  const union = await send("9S Union message", "0x" + message.bytes.toString("hex"));
  rec.union = { hash: union.hash, block: union.blockNumber };
  score.ok(union.status === 1, "9S Union transaction succeeded", `block ${union.blockNumber}`);
  score.ok(union.blockNumber === target, `9S Union landed in block(Eva)+${UNION_OFFSET_BLOCKS}`,
    `block ${union.blockNumber}, target ${target}`);

  // ── 5 · readback, in the reverse direction ──
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
 * can take the anchor slot mid-run, and there is no lock anywhere in the system that can stop it.
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
 * A chain we can make misbehave on purpose. Every hook exists because the corresponding failure
 * is one this ceremony can actually meet on 2026-09-09.
 */
function fakeChain({ startBlock = 100, extraBlocksPerSend = 0, sameBlockForEva = false, unionLandsAt = null } = {}) {
  let head = startBlock;
  const txs = new Map();
  let sends = 0;
  let lastEvaBlock = null;
  return {
    kind: "fake",
    sends: () => sends,
    async chainId() { return "9000000009"; },
    async blockNumber() { return head; },
    async block(n) { return n <= head ? { number: n, timestamp: 1757397549 + n, txCount: 1 } : null; },
    async send({ data }) {
      sends++;
      const hash = "0x" + sha256(Buffer.from(`${sends}:${data ?? ""}`)).slice(0, 64);
      const isEva = sends === 2;
      let landed;
      if (isEva && sameBlockForEva) landed = head;                 // Eva shares Adam's block
      else { head += 1 + extraBlocksPerSend; landed = head; }
      if (isEva) lastEvaBlock = landed;
      // The union transaction is the one carrying a payload longer than a filler.
      if (unionLandsAt !== null && data && data.length > 10) {
        head = Math.max(head, lastEvaBlock + unionLandsAt);
        landed = head;
      }
      txs.set(hash, { data: data ?? "0x", from: "0xself", to: "0xself", blockNumber: landed });
      return { hash };
    },
    async wait(hash) { const t = txs.get(hash); return { blockNumber: t.blockNumber, status: 1 }; },
    async getTx(hash) { return txs.get(hash) ?? null; },
    async balance() { return 10n ** 20n; },
  };
}

function selfTest() {
  const silent = () => {};
  const cases = [];
  const msg = { bytes: Buffer.from("nine s union message fixture"), digest: null };
  msg.digest = sha256(msg.bytes);

  const run = async (chain, extra = {}) => {
    const score = makeScore(silent);
    const rec = await runCeremony(chain, { message: msg, dry: false, score, log: silent, ...extra });
    return { rec, score };
  };

  return (async () => {
    // 1 — the happy path: nine blocks after Eva, byte-identical on readback.
    {
      const { rec, score } = await run(fakeChain());
      cases.push(["happy path anchors at block(Eva)+9 and reads back identical",
        score.fail.length === 0 && rec.union.block === rec.eva.block + 9]);
    }
    // 2 — 🔴 the public-chain risk: someone else's traffic runs the head past the slot.
    {
      // 4 extra blocks per send, not 3: with 3 the walk lands exactly on E+8 and the run would
      // proceed correctly — a fixture that tests nothing while looking like it does. The number
      // has to make the head STEP OVER the slot, which is what a busy chain does.
      const { rec, score } = await run(fakeChain({ extraBlocksPerSend: 4 }));
      cases.push(["slot overrun stops the run and sends no message",
        rec.abort === "slot-lost" && !rec.union && score.fail.length === 1]);
    }
    // 3 — the union transaction lands one block late: RED, and said out loud.
    {
      const { rec, score } = await run(fakeChain({ unionLandsAt: 10 }));
      cases.push(["a message landing at +10 instead of +9 is RED",
        !!rec.union && score.fail.some((f) => f.includes("block(Eva)+9"))]);
    }
    // 4 — Adam and Eva sharing a block is a NOTE, not a failure: the slot is still defined.
    {
      const { rec, score } = await run(fakeChain({ sameBlockForEva: true }));
      cases.push(["Adam and Eva in one block is a note, and the target shifts with Eva",
        score.fail.length === 0 && rec.targetBlock === rec.eva.block + 9 &&
        score.notes.some((n) => !n.ok && /different blocks/.test(n.label))]);
    }
    // 5 — 🔴 dry run must not touch the chain. Not "sends nothing important": sends NOTHING.
    {
      const c = fakeChain();
      const score = makeScore(silent);
      await runCeremony(c, { message: msg, dry: true, score, log: silent });
      cases.push(["dry run broadcasts zero transactions", c.sends() === 0]);
    }
    // 6 — readback comparison must be able to fail, or it proves nothing.
    {
      const c = fakeChain();
      const orig = c.getTx.bind(c);
      c.getTx = async (h) => { const t = await orig(h); return t && { ...t, data: "0xdeadbeef" }; };
      const { score } = await run(c);
      cases.push(["a chain returning different bytes is caught",
        score.fail.some((f) => /bytes ON THE CHAIN/.test(f))]);
    }
    // 7 — the frozen digest is the gate on the payload, and it must reject drift.
    {
      const bad = loadMessage(path.join(ROOT, "docs/block-adam/9s-union-message.txt"),
        path.join(HERE, "does-not-exist.txt"));
      cases.push(["a missing CANON line refuses the run", !!bad.error]);
    }
    // 8 — and it must ACCEPT the real, unmodified pair (the mirror of case 7).
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

  console.log("═══ CEREMONY 2026-09-09 — Adam · Eva · nine blocks · the 9S Union message ═══");
  console.log(`mode      : ${SEND ? "🔴 LIVE — transactions WILL be broadcast" : "dry run (nothing is sent)"}`);
  console.log(`rpc       : ${RPC}`);
  console.log(`mark      : ${utc(markMs)}`);

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
    console.log("   mark, and \"the first block to CROSS\" is a strict comparison. +3000 ms scored 9/0.");
    console.log("   Measure the skew on a chain that is PRODUCING BLOCKS, then pass the number.");
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
    console.log("     nothing can reserve one: a stranger's transaction can take block(Eva)+9 while");
    console.log("     this script walks towards it, and a retry means a NEW Adam and a NEW Eva.");
    if (SEND && !ALLOW_BUSY) {
      console.log("     ⇒ Refusing. Re-run with --allow-busy-chain to accept the risk deliberately.");
      return 2;
    }
  }

  const head = await chain.blockNumber();
  const b = await chain.block(head);
  const skewS = b ? b.timestamp - Math.floor(Date.now() / 1000) : null;
  console.log(`\n  head      : block ${head}  ts ${b?.timestamp} (${b ? utc(b.timestamp * 1000) : "?"})`);
  console.log(`  skew hint : ${skewS >= 0 ? "+" : ""}${skewS}s  ⚠️ this is the AGE of the last block plus the`);
  console.log("              node's skew, and on an idle chain age dominates: a 10s-old block reads");
  console.log("              as -10s of \"skew\". Only a chain producing blocks gives B-13(b) a number.");

  if (!SEND) {
    console.log("\n── plan (nothing will be sent) ──");
    console.log(`  at ${utc(markMs + offsetMs)}  Adam`);
    console.log("  then                       Eva                → block E");
    console.log(`  then                       8 fillers          → head walks to E+${UNION_OFFSET_BLOCKS - 1}`);
    console.log(`  then                       9S Union message   → must land in E+${UNION_OFFSET_BLOCKS}`);
    console.log(`  then                       read it back by hash and compare ${message.bytes.length} bytes`);
    await runCeremony(chain, { message, dry: true, score });
    console.log("\n✓ plan only. Add --send --offset-ms <n> --wallet-key <0x…> to perform it.");
    return 0;
  }

  // ── live: pre-sign window, then the mark ──
  const fireAt = markMs + offsetMs;
  if (fireAt < Date.now()) {
    console.log(`\n🔴 REFUSING: the mark (${utc(fireAt)}) is already in the past.`);
    return 2;
  }
  console.log(`\n  waiting until ${utc(fireAt)} (mark ${offsetMs >= 0 ? "+" : ""}${offsetMs} ms, pre-signed ${LEAD_MS} ms ahead)…`);
  await waitUntil(fireAt - LEAD_MS);
  await waitUntil(fireAt);

  console.log("\n── ceremony ──");
  const rec = await runCeremony(chain, { message, dry: false, score });

  console.log(`\n  ${score.pass.length} pass · ${score.fail.length} fail · ${score.notes.length} note(s)`);
  if (JSON_OUT) {
    writeFileSync(JSON_OUT, JSON.stringify({ mark: MARK_ISO, offsetMs, rpc: RPC, background: bg, record: rec, pass: score.pass, fail: score.fail, notes: score.notes }, null, 2));
    console.log(`  evidence written: ${JSON_OUT}`);
  }
  if (score.fail.length) {
    console.log("\n🔴 The ceremony did not complete as CANON describes. What happens next is a decision,");
    console.log("   not a retry: re-running means a new Adam and a new Eva. Record what happened first.");
    return 1;
  }
  console.log("\n✓ Anchored and verified from the chain.");
  return 0;
}

process.exit(await main());
