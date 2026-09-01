#!/usr/bin/env node
/**
 * check-chain-ledger.mjs — gate: **the chain directory the PUBLIC is served — does every chain
 * it advertises belong to the running generation, and does the RPC it publishes answer with the
 * chainId it claims?**
 *
 * ═══ 🔴 WHY IT EXISTS ═══
 *
 * Measured 2026-09-01 15:2xZ, by hand, while answering a status question — no gate found it:
 *
 *   https://a1.9chain.org/chains/data/console-chains.json  ->  chains: 2 · retired: 0
 *      Eric1 #9000000010   ·   eric1 #9000000011          <- the g0 block
 *      their advertised RPC, asked for real               ->  "404 page not found"
 *
 * Both chains died with g0 at 09:26Z. The correct, compacted ledger already existed in the repo
 * (`docs/archive/console-chains-closed-g0-2026-09-01.json`, `chains: 0 · retired: 2`, stamped at
 * G-hour) — it simply never reached the server. So the first person to open `/chains/` sees two
 * blockchains that do not exist, clicks an RPC that 404s, and only then reaches the page where
 * they would create their own.
 *
 * 🔴 **WHY NOTHING CAUGHT IT — two gates, each correct about its own quantity, and a gap between:**
 *   - `check-deploy-drift` lists `9chain-a1-config/console-chains.json` among its 14 files
 *     OUT OF SCOPE, deliberately: the console WRITES that file, so a mismatch against the repo is
 *     normal and comparing hashes would cry wolf on every chain creation.
 *   - `check-doc-drift` (D-150) reads PROSE on the product path. This is JSON. It never looks.
 *
 * ⇒ Same failure class as D-150 — a public surface stating a dead generation as current — one
 * step further on: in **DATA** rather than in sentences. D-150's lesson was that documents are a
 * publication surface; this is the other half, and it stayed open because "the console owns this
 * file" was read as "somebody is therefore watching it". Nobody was.
 *
 * ## WHAT THIS GATE MEASURES, AND WHERE (three questions, CLAUDE.md §2)
 *
 * | Question | Measured by | Where |
 * |---|---|---|
 * | Which generation is RUNNING? | `info.getNetworkID` | CHAIN |
 * | What does the public actually receive? | GET of the published ledger URL | PUBLIC SURFACE |
 * | Does an advertised chain exist? | `eth_chainId` on the RPC THE LEDGER PUBLISHES | CHAIN |
 *
 * 🔴 **Not the repo's copy and not the server's file — the URL a user's browser hits.** The repo
 * copy is a dev fixture (it still names `DeltaChain` on `localhost:9650`); the server file is one
 * hop closer but still not what Cloudflare hands out. A gate for a public surface must be
 * measured ON the public surface, or it measures a thing nobody is looking at.
 *
 * 🔴 **BOTH DIRECTIONS.** Asking only *"is the chainId inside this generation's block?"* passes a
 * chain that is in-band but dead; asking only *"does the RPC answer?"* passes a live chain
 * advertised under the wrong id. The pair is the check — the `/version.txt` lesson, where a gate
 * measured one direction of a relationship and stayed green for days.
 *
 * ## 🔴 THE SAME NUMBER IS A DEFECT IN ONE LIST AND A RECORD IN THE OTHER
 *
 * `9000000010` under `chains` is a public claim that a dead chain is live. The identical number
 * under `retired` is exactly what retirement means: it MUST carry ids from earlier generations,
 * and demanding it match the current block would be demanding the record be falsified. So the
 * band rule applies to `chains` and never to `retired` — and a retired entry is never asked to
 * answer, because a retired chain not answering is the point.
 *
 * ## WHERE THE JUDGEMENT LIVES
 *
 * In `local-net/lib/chain-ledger.mjs`, not here. `scripts/reopen-chain-creation.mjs` needs the
 * same verdict as one step of its four-step order, and importing THIS file to get it would run
 * `main()` and `process.exit` inside the importer. This file is the gate: it prints, and it
 * carries the counter-checks. See the library's header for why a second copy was refused.
 *
 * ## EXIT CODES (shared convention across the tool set)
 *
 *   0  PASS          — every advertised chain is of the running generation and answers as claimed
 *                      (an empty ledger passes: it claims nothing)
 *   1  FAIL          — the public directory advertises a chain that is dead, foreign, or lying
 *                      about its id
 *   2  INCONCLUSIVE  — the ledger could not be fetched or parsed, the running network could not be
 *                      measured, or the repo and the chain disagree about which generation is live
 *                      (⚠️ this is NOT "clean")
 *
 * Usage:
 *   node scripts/check-chain-ledger.mjs
 *   node scripts/check-chain-ledger.mjs --url https://a1.9chain.org/chains/data/console-chains.json
 *   node scripts/check-chain-ledger.mjs --file 9chain-a1-config/console-chains.json
 *   node scripts/check-chain-ledger.mjs --self-test
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assessPublicLedger, judgeLedgerShape, probeChainId, measureLiveNetworkId, sameHostAsRpc,
  publicLedgerUrl,
} from "../local-net/lib/chain-ledger.mjs";
import { RPC_URL } from "../local-net/lib/server.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};
const LEDGER_URL = flag("--url", publicLedgerUrl());
const LEDGER_FILE = flag("--file", null);
const RPC = flag("--rpc", RPC_URL);
const SELF_TEST = argv.includes("--self-test");

/** One printed line per advertised chain. Entries refused before any request are not printed. */
const MARKS = { unreachable: "⁇", refused: "🔴", "wrong-id": "🔴", ok: "✓" };

async function main() {
  if (SELF_TEST) return selfTest();

  console.log(`\n══ PUBLIC CHAIN LEDGER — ${LEDGER_FILE ? `file ${LEDGER_FILE}` : LEDGER_URL} ══`);

  const v = await assessPublicLedger({
    ledgerUrl: LEDGER_URL,
    ledgerFile: LEDGER_FILE ? path.resolve(ROOT, LEDGER_FILE) : null,
    rpcBase: RPC,
  });

  if (v.stage === "network") {
    console.log(`   🔴 could not measure the running network on ${RPC}: ${v.error}`);
    console.log(`   ⁇ INCONCLUSIVE — without it, "which block is current" is only the repo's opinion.`);
    return 2;
  }
  console.log(`   running network: networkID ${v.liveId}   ⇦ MEASURED on ${RPC}`);

  if (v.stage === "generation") {
    console.log(`   🔴 the repo describes networkID ${v.repoNetworkId} (${v.repoNetworkName}) — the chain says ${v.liveId}`);
    console.log(`   ⁇ INCONCLUSIVE — refusing to judge chainIds against a block from a different generation.`);
    return 2;
  }
  console.log(`   generation block: [${v.band.floor}–${v.band.ceiling}]   (repo, confirmed against the chain)\n`);

  if (v.stage === "fetch") {
    console.log(`   🔴 could not read the ledger: ${v.error}`);
    console.log(`   ⁇ INCONCLUSIVE — "could not read" is not "nothing is advertised".`);
    return 2;
  }
  if (v.stage === "shape") {
    console.log(`   🔴 ${v.fatal}`);
    console.log(`   ⁇ INCONCLUSIVE — the ledger's shape is not the shape this gate knows how to judge.`);
    return 2;
  }

  console.log(`   advertised: ${v.live.length} live · ${v.retired.length} retired`);
  console.log(`   (the band rule applies to LIVE entries only — a retired entry is SUPPOSED to carry`);
  console.log(`    an id from an earlier generation, and is never asked to answer.)\n`);

  for (const e of v.entries) {
    if (MARKS[e.verdict]) console.log(`  ${MARKS[e.verdict]} ${e.label} — ${e.detail}`);
  }

  console.log();
  if (v.reds.length) {
    console.log(`🔴 FAIL — ${v.reds.length} problem(s) in the directory the PUBLIC is served:`);
    for (const p of v.reds) console.log(`   ${p.label} — ${p.reason}`);
    console.log(`\n   This is what a visitor to /chains/ sees. Fixing it means putting the correct ledger`);
    console.log(`   on the SERVER — the repo copy is a dev fixture and does not reach anyone.`);
    return 1;
  }
  if (v.unknowns.length) {
    console.log(`⁇ INCONCLUSIVE — ${v.unknowns.length} advertised chain(s) could not be asked.`);
    for (const u of v.unknowns) console.log(`   ${u.label} — ${u.reason}`);
    console.log(`   "could not ask" is NOT "answered correctly". Re-run when the RPC responds.`);
    return 2;
  }
  console.log(`✅ PASS — every advertised chain belongs to the running generation and answers with the id it claims.`);
  if (v.live.length === 0) console.log(`   (the directory advertises nothing — it therefore claims nothing that could be wrong.)`);
  return 0;
}

/** Counter-check — the gate must go red when it should, and red FOR THE RIGHT REASON. */
async function selfTest() {
  let pass = 0;
  let fail = 0;
  const ok = (name, cond, seen) => {
    if (cond) { pass++; console.log(`  ✓ ${name}`); }
    else { fail++; console.log(`  ✗ ${name}  — got: ${seen}`); }
  };
  const band = { floor: 9_001_000_000, ceiling: 9_001_999_999 };   // a g1-shaped block
  const deadId = 9_000_000_010;                                    // the g0 block — the real case
  const reasons = (r) => r.problems.map((p) => p.reason).join(" | ");

  console.log("\n══ COUNTER-CHECK — check-chain-ledger ══\n");

  console.log("── 1. The band rule applies to LIVE entries, and NEVER to retired ones ──");
  const deadLive = judgeLedgerShape({ chains: [{ name: "Eric1", chainId: deadId }], retired: [] }, band);
  ok("🔴 a dead-generation chainId under `chains` => RED",
    deadLive.problems.length === 1 && /OUTSIDE the running generation/.test(reasons(deadLive)), reasons(deadLive));
  // 🔴 THE CASE THAT KEEPS THIS GATE HONEST. The same number, one list over, is the record of a
  // correct retirement. A gate that reddened here would be demanding the record be falsified.
  const deadRetired = judgeLedgerShape({ chains: [], retired: [{ name: "Eric1", chainId: deadId }] }, band);
  ok("🔴 the SAME id under `retired` => NOT red (that is what retirement means)",
    deadRetired.problems.length === 0, reasons(deadRetired));
  const inBand = judgeLedgerShape({ chains: [{ name: "New", chainId: 9_001_000_000 }], retired: [] }, band);
  ok("CONTROL — an in-band chainId is clean", inBand.problems.length === 0, reasons(inBand));
  const bothEnds = judgeLedgerShape({ chains: [{ name: "Lo", chainId: band.floor }, { name: "Hi", chainId: band.ceiling }], retired: [] }, band);
  ok("CONTROL — both ends of the block are INSIDE it (no off-by-one)", bothEnds.problems.length === 0, reasons(bothEnds));
  const justOut = judgeLedgerShape({ chains: [{ name: "Over", chainId: band.ceiling + 1 }], retired: [] }, band);
  ok("🔴 one past the ceiling => RED", justOut.problems.length === 1, reasons(justOut));

  console.log("\n── 2. A retired id back in circulation ──");
  const both = judgeLedgerShape({ chains: [{ name: "Zombie", chainId: 9_001_000_005 }], retired: [{ name: "Zombie", chainId: 9_001_000_005 }] }, band);
  ok("🔴 the same id listed LIVE and RETIRED => RED",
    /RETIRED and as LIVE/.test(reasons(both)), reasons(both));

  console.log("\n── 3. A shape this gate cannot judge is INCONCLUSIVE, not clean ──");
  ok("🔴 no `chains` array => fatal, not 'zero chains'", judgeLedgerShape({ retired: [] }, band).fatal !== null, String(judgeLedgerShape({ retired: [] }, band).fatal));
  ok("🔴 an array instead of an object => fatal", judgeLedgerShape([], band).fatal !== null, String(judgeLedgerShape([], band).fatal));
  ok("🔴 null => fatal", judgeLedgerShape(null, band).fatal !== null, String(judgeLedgerShape(null, band).fatal));
  ok("an EMPTY directory is clean — it claims nothing", judgeLedgerShape({ chains: [], retired: [] }, band).problems.length === 0, "n/a");
  ok("   …and a missing `retired` is not itself a defect", judgeLedgerShape({ chains: [] }, band).fatal === null, String(judgeLedgerShape({ chains: [] }, band).fatal));

  console.log("\n── 4. Asking a chain what it is — the answer is CONTENT, not a status code ──");
  // The real body a dead L1 returns on this network, measured 2026-09-01.
  const dead404 = async () => ({ status: 404, body: "404 page not found" });
  const okHex = async () => ({ status: 200, body: JSON.stringify({ jsonrpc: "2.0", id: 1, result: "0x218711a09" }) });
  const rpcErr = async () => ({ status: 200, body: JSON.stringify({ jsonrpc: "2.0", id: 1, error: { message: "no such chain" } }) });
  const dead = await probeChainId("https://x/rpc", dead404);
  ok("🔴 `404 page not found` => refused, and the body is carried VERBATIM",
    dead.kind === "refused" && dead.detail.includes("404 page not found"), JSON.stringify(dead));
  const hex = await probeChainId("https://x/rpc", okHex);
  ok("a hex chainId is parsed (eth_chainId never answers in decimal)",
    hex.kind === "id" && hex.chainId === 9_000_000_009, JSON.stringify(hex));
  const err = await probeChainId("https://x/rpc", rpcErr);
  ok("🔴 a JSON-RPC error => refused, with its message", err.kind === "refused" && /no such chain/.test(err.detail), JSON.stringify(err));
  // 🔴 The distinction the whole verdict hangs on: a chain that REFUSES is a defect, a chain that
  // could not be REACHED is unknown. Collapsing them either publishes "this chain is dead" from
  // one flaky moment, or — far worse — waves a genuinely dead chain through as fine.
  const down = await probeChainId("https://x/rpc", async () => { throw new Error("socket hang up"); });
  ok("🔴 a transport failure => unreachable (unknown), NOT refused (defect)",
    down.kind === "unreachable" && /socket hang up/.test(down.detail), JSON.stringify(down));
  const nonsense = await probeChainId("https://x/rpc", async () => ({ status: 200, body: JSON.stringify({ result: "0x0" }) }));
  ok("🔴 a zero chainId is refused, not read as the number 0", nonsense.kind === "refused", JSON.stringify(nonsense));

  console.log("\n── 5. The gate never sends a request to a host the ledger names ──");
  ok("CONTROL — the network's own RPC host is allowed",
    sameHostAsRpc("https://rpc-a1.9chain.org/ext/bc/abc/rpc", "https://rpc-a1.9chain.org"), "false");
  ok("🔴 a foreign host is refused BEFORE any request goes out",
    !sameHostAsRpc("https://evil.example/rpc", "https://rpc-a1.9chain.org"), "true");
  // The exact shape 9Scan shipped for four days: a real-looking, wrong host — a network that
  // could not sign transactions, handed to every user who clicked "add to MetaMask".
  ok("🔴 the retired domain is a FOREIGN host, not a near-enough one",
    !sameHostAsRpc("https://rpc-testnet-a1.9chain.org/rpc", "https://rpc-a1.9chain.org"), "true");
  ok("🔴 garbage in the `rpc` field is refused, not thrown on", !sameHostAsRpc("not a url", "https://rpc-a1.9chain.org"), "true");

  console.log("\n── 6. The measurement that decides the block is never guessed ──");
  const okId = await measureLiveNetworkId(async () => ({ status: 200, body: JSON.stringify({ result: { networkID: "999999998" } }) }));
  ok("the STRING form of networkID is parsed to a number", okId === 999_999_998, String(okId));
  for (const [label, body] of [
    ["an absent networkID", JSON.stringify({ result: {} })],
    ["a non-numeric networkID", JSON.stringify({ result: { networkID: "nope" } })],
    ["a zero networkID", JSON.stringify({ result: { networkID: "0" } })],
  ]) {
    let threw = false;
    await measureLiveNetworkId(async () => ({ status: 200, body })).then(() => {}, () => { threw = true; });
    ok(`🔴 ${label} THROWS — it must never fall back to the repo's number`, threw, "returned");
  }

  console.log(`\n${fail === 0 ? "✅" : "🔴"} ${pass} passed · ${fail} failed`);
  return fail === 0 ? 0 : 1;
}

main().then((code) => process.exit(code)).catch((e) => {
  console.error(`\n🔴 ${e.stack ?? e.message}`);
  process.exit(2);
});
