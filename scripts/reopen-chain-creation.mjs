#!/usr/bin/env node
/**
 * reopen-chain-creation.mjs — is it safe to reopen L1 chain creation, and did it actually open?
 *
 * ═══ WHY THIS EXISTS ═══
 *
 * Reopening is four human actions, and THE ORDER IS THE PRODUCT. Done out of order the failure
 * is not an error message, it is a chainId issued from the wrong generation into a stranger's
 * immutable genesis — the one mistake in this project that cannot be taken back.
 *
 *   1. SHIP THE LEDGERS AND THE CONSOLE CODE FIRST.  `local-net/lib/chainid.mjs` is where the
 *      generation is declared; `chainid-issued.json` / `chainid-released.json` are what stop a
 *      number or a name being handed out twice. Opening the door before these land means the
 *      console issues from the block of a generation that no longer exists.
 *   2. PUT THE COMPACTED CHAIN DIRECTORY ON THE SERVER (D-154).  `/chains/` is the page a visitor
 *      passes THROUGH on the way to creating one, and it was still advertising two chains of a
 *      dead generation whose RPCs answer `404 page not found`.
 *   3. FUND `chain-factory`.  An unfunded factory does not refuse politely, it dies partway
 *      through (D-140).
 *   4. ONLY THEN set the flag and restart.
 *
 * 🔴 STEP 2 WAS NOT IN THIS FILE UNTIL 2026-09-01 (D-155). It was found by running `--probe`,
 * not by this tool: the tool was written for D-152's three steps and D-154 added a fourth the
 * next hour, so a green run here would have said "ready" while the directory in front of the
 * create-chain page still listed two dead chains. A readiness check that does not know about one
 * of the things it is gating is not conservative — it is confidently wrong.
 *
 * ⚠️ This tool does NOT perform any of the four. Shipping code, moving money and flipping a
 * production switch are things a person presses (CLAUDE.md §4). It measures, and it refuses to
 * say "ready" while an earlier step is unmet, so the order cannot be lost.
 *
 * ═══ THE PROBE, AND WHY IT CANNOT CREATE A CHAIN ═══
 *
 * The open/closed switch lives INSIDE `createChain()`, after authentication, so an
 * unauthenticated request answers 401 whether the door is open or shut — it measures nothing.
 * An authenticated request reaches three checks in this order, and every one of them REFUSES:
 *
 *   gate closed        → the door's own pause sentence
 *   wrong generation   → the generation mismatch message
 *   name invalid       → the name-format message
 *
 * So the probe sends the name `!`, which the console's own `/^[A-Za-z0-9 ]{2,32}$/` can never
 * accept. Whatever the state of the door, the request is refused before anything is built,
 * nothing is spent, and no identifier is consumed.
 *
 * 🔴 All three answers come back as HTTP **400**. The status code carries no information here;
 * only the text does — hard rule #1 in its purest form, and the reason this file reads the body
 * instead of the status. And of those three texts only ONE is matched: the door's own sentence,
 * which the door writes in English because a stranger's browser displays it. The other two are
 * Vietnamese today and §0 says they should not stay that way, so keying on their wording would
 * build a check that breaks the day somebody obeys the language rule.
 *
 * The probe is opt-in (`--probe`). Without it this tool sends the product nothing at all.
 *
 * Exit codes: `0` every measured item ready · `1` something is not ready · `2` could not measure.
 *
 * Usage:
 *   node scripts/reopen-chain-creation.mjs                 # read-only: ledgers + directory + wallet
 *   node scripts/reopen-chain-creation.mjs --probe         # also ask the live console its state
 *   node scripts/reopen-chain-creation.mjs --self-test
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import https from "node:https";
import http from "node:http";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SSH_HOST, SSH_KEY, SRC_DIR, RPC_URL } from "../local-net/lib/server.mjs";
import { A1_GEN, NETWORK_ID } from "../local-net/lib/chainid.mjs";
import { VI_FACTORY_THEO_THE_HE } from "../local-net/lib/factory-wallets.mjs";
import { assessPublicLedger, publicLedgerUrl, summariseLedger } from "../local-net/lib/chain-ledger.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const SELF_TEST = argv.includes("--self-test");
const PROBE = argv.includes("--probe");
const TOKEN_FILE = path.join(homedir(), "9chain-a1-keys", "console-token.txt");
const CONSOLE_URL = process.env.A1_CONSOLE_URL || "https://a1.9chain.org/console/api/create";

/**
 * The files that MUST be on the server before the door opens.
 *
 * A subset of the console group in `manifest-deploy.json` — the ones whose absence or staleness
 * changes what identifier a stranger receives. The rest of the console can lag without anybody
 * getting a wrong number; these cannot.
 */
const MUST_SHIP = [
  { file: "local-net/lib/chainid.mjs", why: "declares the GENERATION — a stale copy issues from a dead block" },
  { file: "local-net/console/chainid-issued.json", why: "the block-list: what may never be handed out twice" },
  { file: "local-net/console/chainid-released.json", why: "the only thing that lets the block-list shrink, and it names who decided" },
  { file: "local-net/console/server.mjs", why: "the door itself, plus the generation check behind it" },
  { file: "local-net/console/chainid-test.mjs", why: "the issuance test that runs ON the server" },
];

/** Minimum LOVE9 on the factory wallet. Creating one L1 is several transactions across P. */
const FACTORY_MIN = 10;

// ───────────────────────────── measurement ─────────────────────────────

const sh = (cmd, args) => execFileSync(cmd, args, { cwd: ROOT, encoding: "utf8", timeout: 120_000 }).trim();

function localDigest(rel) {
  return sh("node", ["-e", `const c=require("node:crypto"),f=require("node:fs");`
    + `process.stdout.write(c.createHash("md5").update(f.readFileSync(${JSON.stringify(rel)})).digest("hex"))`]);
}

/**
 * 🔴 `cd` first, then use RELATIVE paths — do not strip a prefix off what the shell prints.
 *
 * The first version asked for `~/9chain-a1/src/<file>` and stripped `~/9chain-a1/src/` back off
 * the answer. The remote shell expands the tilde, so every line came back as
 * `/home/ubuntu/9chain-a1/src/<file>`, the strip matched nothing, every lookup missed, and all
 * five files were reported MISSING — while `check-deploy-drift` could see four of them fine.
 * Red, loudly, for entirely the wrong reason: it would have sent someone to re-ship files that
 * were already there. Measured and fixed 2026-09-01.
 */
function remoteDigests(files) {
  const out = sh("ssh", ["-i", SSH_KEY, "-o", "ConnectTimeout=20", SSH_HOST,
    `cd ${SRC_DIR} && for f in ${files.join(" ")}; do `
    + `if [ -f "$f" ]; then md5sum "$f"; else echo "MISSING $f"; fi; done`]);
  const map = new Map();
  for (const line of out.split(/\r?\n/).filter(Boolean)) {
    const [a, b] = line.split(/\s+/);
    if (b) map.set(b.replace(/^\*/, ""), a === "MISSING" ? null : a);
  }
  return map;
}

/**
 * Raw https, not `fetch`. Undici keeps sockets alive, and `process.exit()` with one still open
 * aborts the process on Windows with `UV_HANDLE_CLOSING` and exit code 127 — a gate that crashes
 * on the way out reads as a failure no matter what it measured. Seen here 2026-09-01.
 */
function post(url, body, headers = {}) {
  const u = new URL(url);
  const lib = u.protocol === "http:" ? http : https;
  const data = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const req = lib.request(u, {
      method: "POST",
      headers: { "content-type": "application/json", "content-length": Buffer.byteLength(data), connection: "close", ...headers },
      agent: new lib.Agent({ keepAlive: false }),
      timeout: 30_000,
    }, (res) => {
      let out = ""; res.setEncoding("utf8");
      res.on("data", (c) => { out += c; });
      res.on("end", () => resolve({ status: res.statusCode, body: out }));
    });
    req.on("timeout", () => req.destroy(new Error("timed out")));
    req.on("error", reject);
    req.end(data);
  });
}

/**
 * Pull the token out of the token FILE, which is a note with a secret in it, not a secret.
 *
 * Measured 2026-09-01: `console-token.txt` is five lines — three lines of prose (the first in
 * Vietnamese) and one 32-character line that is the token. Reading the whole file and trimming
 * produced a 280-character "token" and Node refused it as an invalid header value. The error was
 * about header encoding, which points nowhere near the real cause.
 *
 * 🔴 Refuses to guess. Zero candidate lines, or more than one, is exit 2 — a probe that picked
 * the wrong line would send a wrong token, get 401, and 401 is indistinguishable from "the door
 * is behind auth", i.e. it would report UNKNOWN and look like a network problem.
 *
 * Never printed, never logged, never included in an error message.
 */
export function pickToken(fileText) {
  const cands = fileText.split(/\r?\n/).map((l) => l.trim())
    .filter((l) => l.length >= 16 && !/\s/.test(l) && /^[A-Za-z0-9+/=_-]+$/.test(l));
  if (cands.length === 1) return { token: cands[0] };
  return { error: cands.length === 0
    ? "no line in the token file looks like a token (>=16 chars, no whitespace)"
    : `${cands.length} lines look like a token — refusing to guess which one is live` };
}

/** POST the probe. A 4xx is not an error here — the refusal IS the measurement. */
async function probeConsole(token) {
  const r = await post(CONSOLE_URL, { name: "!" }, { authorization: `Bearer ${token}` });
  return { status: r.status, body: r.body.slice(0, 400) };
}

// ───────────────────────────── judgement (pure) ─────────────────────────────

/**
 * Classify the console's answer.
 *
 * 🔴 ONLY the door's own sentence is matched, and that sentence is English because the door
 * writes it (it is shown to a stranger's browser). Nothing here matches the console's other
 * error messages: those are Vietnamese today and CLAUDE.md §0 says they should not stay that
 * way, so a gate keyed to their wording would break on the day somebody obeys the language rule.
 * A check that fails when the codebase improves is a check nobody will keep.
 *
 * Everything else is decided by ELIMINATION, and the elimination is sound because the handler's
 * order is known and each earlier stop has its OWN status code: flood limit answers 429,
 * authentication answers 401, and only past both does `createChain` run — where the door is the
 * FIRST statement. So a 400 that is not the pause sentence means the door let us through and
 * something behind it refused instead. The refusing text is printed, never interpreted: a human
 * reads what actually answered.
 */
export function readProbe({ status, body }) {
  const t = String(body);
  if (/creation is paused/i.test(t)) return { state: "CLOSED", why: "the door itself answered — its own pause sentence" };
  if (status === 401) return { state: "UNKNOWN", why: "401 — the door sits behind authentication, so this says nothing about it" };
  if (status === 429) return { state: "UNKNOWN", why: "429 — stopped by the flood limit before reaching the door" };
  if (status === 400) {
    return { state: "OPEN", why: `the door did not answer; something behind it refused instead — ${t.slice(0, 120)}` };
  }
  return { state: "UNKNOWN", why: `unrecognised answer (${status}) — read it, do not guess` };
}

/**
 * @param ships [{file, why, local, remote}]
 * @param ledger {ok: boolean|null, detail: string} | null — the D-154 verdict, injected
 * @param factory {address, balance} | null
 */
export function judge(ships, ledger, factory, probe) {
  const steps = [];
  const stale = ships.filter((s) => s.remote !== s.local);
  steps.push({
    n: 1,
    name: "ledgers + console code on the server",
    ok: stale.length === 0,
    detail: stale.length === 0
      ? `all ${ships.length} match`
      : stale.map((s) => `${s.remote === null ? "MISSING" : "STALE  "} ${s.file} — ${s.why}`).join("\n       "),
  });
  steps.push({
    n: 2,
    name: "the public chain directory",
    ok: ledger ? ledger.ok : null,
    detail: ledger ? ledger.detail : "not measured",
  });
  steps.push({
    n: 3,
    name: "chain-factory wallet funded",
    ok: factory ? factory.balance >= FACTORY_MIN : null,
    detail: !factory ? "not measured"
      : factory.balance >= FACTORY_MIN ? `${factory.balance} LOVE9 on ${factory.address}`
        // 🔴 "Move X→P" is what the older books said, and it is not a thing that can be done.
        // Measured 2026-09-01: this wallet held 0 on X as well — it is a vanity key generated on
        // its own, not one of the genesis funds, so there is nothing sitting on X to move. Two
        // legs, two DIFFERENT keys, because `/api/x-to-p` exports to `owner()` and can therefore
        // only ever pay the wallet that is running it. A remedy that cannot be carried out is the
        // D-153 failure: the red is right, the instruction points at another quantity, and the
        // reader burns the attempt before finding out.
        : `${factory.balance} LOVE9 on ${factory.address} — below ${FACTORY_MIN}. `
          + `TWO legs, two different keys: a genesis fund -> the factory ON X (/api/send-x), `
          + `then the factory's own X -> its own P (/api/x-to-p, which pays out to owner() only). `
          + `This wallet measured 0 on X too, so a single X->P hop has nothing to move (D-140; `
          + `see docs/RUNBOOK-REOPEN-CHAIN-CREATION.md)`,
  });
  steps.push({
    n: 4,
    name: "the door",
    ok: probe ? probe.state === "OPEN" : null,
    detail: probe ? `${probe.state} — ${probe.why}` : "not measured (add --probe)",
  });

  const blocked = steps.find((s) => s.ok === false);
  const door = steps[steps.length - 1];

  // 🔴 THE DANGEROUS INVERSION IS THE DOOR, AND ONLY THE DOOR (D-155).
  //
  // This used to read "any later step ready while an earlier one is not", which is a different and
  // much larger claim than the sentence it prints. Funding the wallet before the console ships is
  // harmless — the door is shut, nothing can be issued. Putting the compacted directory up early
  // is harmless for the same reason. Only an OPEN door can hand a stranger an identifier out of a
  // dead generation's block, and only that is worth the alarm.
  //
  // Left broad it would have gone off on the most likely order of work: step 2 is two `scp` lines,
  // by far the cheapest of the four, so doing it first is what a careful person does — and the
  // tool would have answered with its gravest warning. An alarm that fires on correct behaviour is
  // an alarm that gets read past, and then it is not there for the case it was built for.
  const unmetBeforeDoor = steps.filter((s) => s.n < door.n && s.ok === false);
  const outOfOrder = door.ok === true && unmetBeforeDoor.length > 0;
  return { steps, blocked, outOfOrder, unmetBeforeDoor };
}

// ───────────────────────────── self-test ─────────────────────────────

function selfTest() {
  const ship = (f, l, r) => ({ file: f, why: "", local: l, remote: r });
  // Fixtures for the three injected verdicts. The directory verdict is DATA here, never a live
  // measurement: a counter-check that needed the network could not run when the network is the
  // thing being changed, which is exactly when it is worth the most.
  const CLEAN = { ok: true, detail: "0 live · 2 retired" };
  const DIRTY = { ok: false, detail: "2 problem(s) in the directory the PUBLIC is served" };
  const UNKNOWN_LEDGER = { ok: null, detail: "could not read the public ledger" };
  const FUNDED = { address: "P-x", balance: 90 };
  const OPEN = { state: "OPEN", why: "" };
  const CLOSED = { state: "CLOSED", why: "" };
  const cases = [
    ["the pause sentence is read as CLOSED",
      readProbe({ status: 400, body: '{"error":"Chain creation is paused. The public network…"}' }).state === "CLOSED"],
    ["🔴 a 400 that is NOT the pause sentence means the door let us through",
      readProbe({ status: 400, body: '{"error":"<some later validation error>"}' }).state === "OPEN"],
    ["🔴 open/closed share status 400 — only the text separates them, never the code",
      new Set([
        readProbe({ status: 400, body: "Chain creation is paused" }).state,
        readProbe({ status: 400, body: "anything else at all" }).state,
      ]).size === 2],
    ["…and the OPEN verdict quotes what actually refused, rather than interpreting it",
      /<some later validation error>/.test(
        readProbe({ status: 400, body: '{"error":"<some later validation error>"}' }).why)],
    ["🔴 401 says NOTHING about the door — the door sits behind auth",
      readProbe({ status: 401, body: "" }).state === "UNKNOWN"],
    ["🔴 429 says nothing either — the flood limit stops the request before the door",
      readProbe({ status: 429, body: "" }).state === "UNKNOWN"],
    ["an answer nobody planned for is UNKNOWN, never a pass",
      readProbe({ status: 502, body: "<html>bad gateway" }).state === "UNKNOWN"],
    ["🔴 the classifier does not depend on any Vietnamese wording, so §0 translation cannot break it",
      readProbe({ status: 400, body: '{"error":"Name must be 2-32 chars"}' }).state === "OPEN"],

    ["🔴 the token is the one token-SHAPED line, not the whole file (the file is a note)",
      pickToken("a note line with spaces\nsecond line of prose\nAbC123xyz789AbC123xyz789\n").token === "AbC123xyz789AbC123xyz789"],
    ["…and a file with no token line refuses rather than sending an empty one",
      /no line/.test(pickToken("just prose here\nand more prose\n").error)],
    ["…and two candidates refuse rather than guessing (a wrong token reads as UNKNOWN, not as failure)",
      /refusing to guess/.test(pickToken("AbC123xyz789AbC123xyz789\nZZZ999zzz999ZZZ999zzz999\n").error)],
    ["a short line is not mistaken for a token",
      /no line/.test(pickToken("prose line\nshort123\n").error)],

    ["a stale ledger file blocks step 1",
      judge([ship("lib/chainid.mjs", "aaa", "bbb")], null, null, null).blocked?.n === 1],
    ["a missing ledger file blocks step 1 and says MISSING",
      /MISSING/.test(judge([ship("x.json", "aaa", null)], null, null, null).steps[0].detail)],
    ["everything matching passes step 1",
      judge([ship("x.json", "aaa", "aaa")], null, null, null).steps[0].ok === true],

    // ─── step 2 · the public chain directory (D-154, wired in by D-155) ───
    ["🔴 a dirty public directory blocks step 2 — NOT step 3",
      judge([ship("x", "a", "a")], DIRTY, FUNDED, null).blocked?.n === 2],
    // 🔴 The positive control. D-153, the same day: a gate that can never go green carries no
    // information when it is red. If a clean directory did not pass here, the red above would be
    // saying nothing about the directory and everything about this file.
    ["🔴 POSITIVE CONTROL — a clean public directory PASSES step 2",
      judge([ship("x", "a", "a")], CLEAN, FUNDED, null).steps[1].ok === true],
    ["🔴 'could not measure' the directory is null — neither a pass nor a defect",
      (() => { const r = judge([ship("x", "a", "a")], UNKNOWN_LEDGER, FUNDED, null);
        return r.steps[1].ok === null && r.blocked === undefined; })()],
    ["the directory step is not measured at all when nothing was passed",
      judge([ship("x", "a", "a")], null, null, null).steps[1].ok === null],

    // ─── step 3 · the wallet, and the remedy that has to be POSSIBLE ───
    ["an empty factory wallet blocks step 3",
      judge([ship("x", "a", "a")], CLEAN, { address: "P-x", balance: 0 }, null).blocked?.n === 3],
    // Anchored on the two API routes rather than on wording: the shape of the remedy is that it
    // takes two hops through two different endpoints, and that survives an edit to the sentence.
    ["🔴 the remedy names BOTH legs — /api/send-x AND /api/x-to-p",
      (() => { const d = judge([ship("x", "a", "a")], CLEAN, { address: "P-x", balance: 0 }, null).steps[2].detail;
        return /\/api\/send-x/.test(d) && /\/api\/x-to-p/.test(d); })()],
    ["🔴 …and it says the wallet is empty on X TOO, which is WHY one hop cannot work",
      /0 on X/.test(judge([ship("x", "a", "a")], CLEAN, { address: "P-x", balance: 0 }, null).steps[2].detail)],
    ["a funded factory passes step 3",
      judge([ship("x", "a", "a")], CLEAN, FUNDED, null).steps[2].ok === true],

    // ─── the order · only the DOOR makes an inversion dangerous (D-155) ───
    ["🔴 an OPEN door while the console code is stale is OUT OF ORDER",
      judge([ship("x", "a", "b")], CLEAN, FUNDED, OPEN).outOfOrder === true],
    ["🔴 an OPEN door while the public directory is dirty is OUT OF ORDER",
      judge([ship("x", "a", "a")], DIRTY, FUNDED, OPEN).outOfOrder === true],
    ["…and it NAMES which step is unmet, rather than only saying that one is",
      judge([ship("x", "a", "a")], DIRTY, FUNDED, OPEN).unmetBeforeDoor.map((s) => s.n).join() === "2"],
    ["…and the same open door with everything ready is not out of order",
      judge([ship("x", "a", "a")], CLEAN, FUNDED, OPEN).outOfOrder === false],
    // 🔴 THE FALSE ALARM THIS FILE USED TO RAISE. Doing the two cheapest steps first is what a
    // careful person does; the old rule answered that with its gravest warning.
    ["🔴 a FUNDED wallet while the console is stale is NOT out of order — the door is shut",
      judge([ship("x", "a", "b")], null, FUNDED, CLOSED).outOfOrder === false],
    ["🔴 a CLEAN directory while the console is stale is NOT out of order — the door is shut",
      judge([ship("x", "a", "b")], CLEAN, null, CLOSED).outOfOrder === false],
    ["🔴 both later steps ready, console stale, door shut => still NOT out of order",
      judge([ship("x", "a", "b")], CLEAN, FUNDED, CLOSED).outOfOrder === false],
    ["…and that case still reports NOT READY, blocked at step 1",
      judge([ship("x", "a", "b")], CLEAN, FUNDED, CLOSED).blocked?.n === 1],
    ["a closed door with everything ready is 'not ready' but NOT out of order",
      (() => { const r = judge([ship("x", "a", "a")], CLEAN, FUNDED, CLOSED);
        return r.blocked?.n === 4 && r.outOfOrder === false; })()],
    ["not measured is neither pass nor fail — it stays null",
      judge([ship("x", "a", "a")], null, null, null).steps[2].ok === null],
  ];
  let bad = 0;
  for (const [name, pass] of cases) { console.log(`  ${pass ? "✓" : "🔴"} ${name}`); if (!pass) bad++; }
  console.log(`\n  ${cases.length - bad}/${cases.length} reverse controls passed`);
  return bad ? 1 : 0;
}

// ───────────────────────────── main ─────────────────────────────

async function main() {
  if (SELF_TEST) return selfTest();

  let ships;
  try {
    const remote = remoteDigests(MUST_SHIP.map((m) => m.file));
    ships = MUST_SHIP.map((m) => ({ ...m, local: localDigest(m.file), remote: remote.get(m.file) ?? null }));
  } catch (e) {
    console.log(`⁇ could not read the server (${SSH_HOST}): ${String(e.message).split("\n")[0]}`);
    return 2;
  }

  // The D-154 verdict, from the one implementation of it. Read-only: a GET of a public file and
  // `eth_chainId` on the RPCs that file itself advertises. Runs without `--probe` because it sends
  // the product nothing it does not already serve to every visitor.
  let ledger = null;
  try {
    const v = await assessPublicLedger({ ledgerUrl: publicLedgerUrl(), rpcBase: RPC_URL });
    // 🔴 code 2 is "could not measure", which is `null` here and NEVER a pass. Collapsing it into
    // true is how a surface nobody looked at gets reported as a surface that is fine.
    ledger = { ok: v.code === 0 ? true : v.code === 1 ? false : null, detail: summariseLedger(v) };
  } catch (e) {
    ledger = { ok: null, detail: `could not measure the public directory: ${String(e.message).split("\n")[0]}` };
  }

  let factory = null;
  try {
    const addr = VI_FACTORY_THEO_THE_HE[A1_GEN];
    if (addr) {
      const r = await post(`${RPC_URL}/ext/bc/P`,
        { jsonrpc: "2.0", id: 1, method: "platform.getBalance", params: { addresses: [addr] } });
      const j = JSON.parse(r.body);
      factory = { address: addr, balance: Number(j.result?.unlocked ?? 0) / 1e9, networkID: NETWORK_ID };
    }
  } catch { /* left null — "not measured", never a silent zero */ }

  let probe = null;
  if (PROBE) {
    if (!existsSync(TOKEN_FILE)) {
      console.log(`⁇ --probe needs the operator token at ${TOKEN_FILE} (gotcha 8: read it from the file, never from memory)`);
      return 2;
    }
    const picked = pickToken(readFileSync(TOKEN_FILE, "utf8"));
    if (picked.error) { console.log(`⁇ ${TOKEN_FILE}: ${picked.error}`); return 2; }
    try {
      probe = readProbe(await probeConsole(picked.token));
    } catch (e) { console.log(`⁇ probe failed to reach the console: ${e.message}`); return 2; }
  }

  const { steps, blocked, outOfOrder, unmetBeforeDoor } = judge(ships, ledger, factory, probe);
  console.log(`reopen-chain-creation — ${SSH_HOST} · ${RPC_URL}`);
  console.log("  the order below IS the check: a later step ready before an earlier one is the dangerous state\n");
  for (const s of steps) {
    const mark = s.ok === true ? "✓" : s.ok === false ? "🔴" : "🟡";
    console.log(`  ${mark} ${s.n}. ${s.name}`);
    console.log(`       ${s.detail}`);
  }
  if (outOfOrder) {
    console.log("\n🔴 OUT OF ORDER — THE DOOR IS OPEN while something it depends on is not ready:");
    for (const s of unmetBeforeDoor) console.log(`     step ${s.n} — ${s.name}`);
    console.log("   An open door in front of a stale ledger hands out identifiers from a dead");
    console.log("   generation, and a genesis is immutable. Close it, ship, then open again.");
    return 1;
  }
  if (!blocked && steps.every((s) => s.ok === true)) {
    console.log("\n✓ All four measured and ready — chain creation is open on the product.");
    return 0;
  }
  if (blocked) {
    console.log(`\n🔴 Not ready: step ${blocked.n} — ${blocked.name}.`);
    console.log("   Steps after it are not the next thing to do; this one is.");
    return 1;
  }
  console.log("\n🟡 Nothing measured is failing, but not everything was measured.");
  console.log('   "Could not measure" is not "ready" — run with --probe to ask the live console.');
  return 2;
}

process.exit(await main());
