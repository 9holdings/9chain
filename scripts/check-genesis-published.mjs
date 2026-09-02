#!/usr/bin/env node
/**
 * check-genesis-published.mjs — gate: **can a stranger actually GET the genesis bytes, and are
 * the bytes they get the ones this network is running on?**
 *
 * ═══ 🔴 WHY IT EXISTS ═══
 *
 * Measured 2026-09-02. `docs/RUN-A-VALIDATOR.md` had printed the genesis `sha256` since launch
 * and never named a place to download the file. `a1.9chain.org/genesis.json` answered 404.
 * HANDOFF called this "not published yet", which read like an upload nobody had got around to.
 *
 * The real reason was narrower and worse: `local-net/net-g1/genesis.json` was **not tracked by
 * git**. `.gitignore` excludes the `local-net/net-<name>` directories because that is where netgen
 * writes `keys.txt`,
 * `staker.key` and `signer.key` — a correct rule that happened to sweep up the one file in that
 * directory meant to be public. So the bytes the entire outside world needs to join existed in
 * exactly two operational places (one dev machine, one server) and in **no repository, no backup
 * and no release**. Losing either machine would have lost the ability to onboard anyone, and
 * nothing anywhere would have said so.
 *
 * 🔴 **WHY NOTHING CAUGHT IT — the hole sat between three gates, each correct about its own
 * quantity.** `check-deploy-drift` compares repo↔server for files it has been told about, and an
 * untracked file has no repo side to compare. `check-doc-drift` reads PROSE for dead generation
 * numbers; the number here was right, it was the *absence of a URL* that was wrong, and no gate
 * measures an absence. `check-live-page` reads pages that exist. A 404 on a URL no document ever
 * promised is not a defect any of them is shaped to see.
 *
 * ⇒ Same family as D-150/D-154: **documents and data are publication surfaces.** This adds the
 *   third member — an ARTEFACT is a publication surface too, and "we published it" is a claim to
 *   be measured on the public surface, not a sentence in a handoff.
 *
 * ## WHAT IT MEASURES, AND WHERE (CLAUDE.md section 2)
 *
 * | Question | Measured by | Where |
 * |---|---|---|
 * | Do we still have the bytes, versioned? | `git ls-files` | THE REPO |
 * | Do the documents state the right hash? | reading the published documents | THE DOCUMENTS |
 * | Do the bytes describe the LIVE network? | `info.getNetworkID` | THE RUNNING NODE |
 * | Is the beacon we advertise really in it? | `platform.getCurrentValidators` | THE RUNNING CHAIN |
 * | Can a stranger download it? | the URL the guide tells them to use | THE PUBLIC SURFACE |
 *
 * 🔴 **BOTH DIRECTIONS, the D-154 lesson.** Checking only "the file's networkID matches the live
 * one" would pass a genesis that describes the right network but lists stakers nobody runs.
 * Checking only "the beacon is a live validator" would pass a beacon that is live on a DIFFERENT
 * network. The pair is what says the advertised entry point belongs to the advertised chain.
 *
 * 🔴 **CONTENT, NOT STATUS (hard rule #1).** A download is judged by hashing the bytes that came
 * back. GitHub serves a 404 page as `text/html` with a body; a CDN can serve a stale or
 * intercepted object with a perfectly good 200. Only the hash settles it.
 *
 * ⚠️ **This gate is RED on purpose until the publishing push happens**, and that red is the whole
 * point of it: the file and the URL that names it land in the same commit, so before the push
 * neither is public and after it both are. A green here is the acceptance for "genesis published".
 *
 * ## EXIT CODES (shared convention across the tool set)
 *
 *   0  PASS          — the bytes are tracked, correct, live, and downloadable
 *   1  FAIL          — a stranger cannot get them, or what they get is wrong
 *   2  INCONCLUSIVE  — the repo could not be read, or the network could not be reached
 *
 * Usage:
 *   node scripts/check-genesis-published.mjs
 *   node scripts/check-genesis-published.mjs --self-test
 *   node scripts/check-genesis-published.mjs --rpc https://rpc-a1.9chain.org
 */
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { request, measureLiveNetworkId } from "../local-net/lib/chain-ledger.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ARGV = process.argv.slice(2);
const SELF_TEST = ARGV.includes("--self-test");
const RPC = argOf("--rpc") || process.env.A1_RPC_BASE || "https://rpc-a1.9chain.org";

function argOf(flag) {
  const i = ARGV.indexOf(flag);
  return i >= 0 ? ARGV[i + 1] : null;
}

/**
 * The published artefact, and the documents that make claims about it.
 *
 * Deliberately NOT every file that contains a hash. HANDOFF and DECISIONS recount measurements
 * from days when other files were current; those are sentences about the past, and section 2 of
 * CLAUDE.md says rewriting them to tidy the view is the error, not the fix.
 */
const ARTEFACT = "docs/genesis/genesis-g1.json";
const CLAIMANTS = ["docs/RUN-A-VALIDATOR.md", "docs/TOKENOMICS.md", "docs/genesis/README.md"];

export const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

/* ══════════════════════════════════════════════════════════════════════════
   Pure assessments — every one of these is exercised by --self-test.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Pull the hashes a document states FOR THE GENESIS, in the two shapes the docs use:
 * a full 64-hex digest, and an elided `prefix…suffix` written for human eyes.
 *
 * ⚠️ Line-scoped on purpose, and that is a real limit worth naming: `check-patch-count` learned
 * the hard way that context can span a whole BLOCK. Here every claimant states the hash on the
 * same line as the word `genesis`, so line scope is sufficient AND it keeps the gate from
 * hoovering up the fork tree hashes that live two paragraphs away. The gate prints the lines it
 * read so a human can see whether it saw everything — an unread claim is the failure mode.
 */
export function statedGenesisHashes(text) {
  const out = [];
  for (const [i, line] of text.split(/\r?\n/).entries()) {
    if (!/genesis/i.test(line)) continue;
    for (const m of line.matchAll(/\b([0-9a-f]{64})\b/g)) out.push({ line: i + 1, kind: "full", value: m[1], text: line.trim() });
    for (const m of line.matchAll(/\b([0-9a-f]{6,})[…]([0-9a-f]{4,})\b/g)) out.push({ line: i + 1, kind: "elided", prefix: m[1], suffix: m[2], text: line.trim() });
  }
  return out;
}

/** Does one stated hash agree with the artefact's real digest? */
export function hashAgrees(stated, actual) {
  if (stated.kind === "full") return stated.value === actual;
  return actual.startsWith(stated.prefix) && actual.endsWith(stated.suffix);
}

/**
 * The download instruction a stranger will follow.
 *
 * 🔴 A placeholder is NOT a URL. `docs/RUN-A-VALIDATOR.md` carried `FILL-ON-G-DAY` markers for
 * days, and preflight's own task list warns that "a guide with a placeholder reads exactly like a
 * guide without one". Refuse anything still carrying one rather than trying to fetch it.
 */
export function downloadUrlFrom(text) {
  const m = text.match(/https?:\/\/[^\s`'")<>]+genesis[^\s`'")<>]*\.json/i);
  if (!m) return { ok: false, why: "no download URL for genesis appears anywhere in the guide" };
  if (/FILL-ON-G-DAY|<[A-Z-]+>|EXAMPLE|TODO/.test(m[0])) return { ok: false, why: `the URL is still a placeholder: ${m[0]}` };
  return { ok: true, url: m[0] };
}

/** Does the artefact describe the network that is actually running? */
export function assessGeneration(genesisNetworkId, liveNetworkId) {
  if (liveNetworkId === null) return { verdict: "inconclusive", why: "the live networkID could not be measured" };
  if (genesisNetworkId === liveNetworkId) return { verdict: "ok", why: `both say ${liveNetworkId}` };
  return { verdict: "fail", why: `the published genesis says ${genesisNetworkId}, the running network says ${liveNetworkId} — this file is for a dead generation` };
}

/**
 * The other direction: is the beacon we tell strangers to dial actually in this genesis, and
 * actually validating right now?
 *
 * 🔴 `unreachable` is not `absent`. If the validator list could not be read, that is *unknown*,
 * never a defect — the D-154 distinction. A gate that reports a network hiccup as "our beacon is
 * not a validator" sends someone to re-key nine nodes.
 */
export function assessBeacon(docNodeId, stakerNodeIds, liveValidatorIds) {
  if (!docNodeId) return { verdict: "fail", why: "the guide names no beacon nodeID, so nobody can dial in" };
  if (!stakerNodeIds.includes(docNodeId)) {
    return { verdict: "fail", why: `${docNodeId} is advertised as the beacon but is not among the ${stakerNodeIds.length} stakers in this genesis` };
  }
  if (liveValidatorIds === null) return { verdict: "inconclusive", why: "the validator set could not be read — unknown, not absent" };
  if (!liveValidatorIds.includes(docNodeId)) {
    return { verdict: "fail", why: `${docNodeId} is in the genesis but is NOT validating on the running chain` };
  }
  return { verdict: "ok", why: "in this genesis, and validating right now" };
}

/**
 * Did the public surface hand back the same bytes?
 *
 * Judged by hashing the body. `served` is whatever came back; `transportFailed` separates "the
 * request did not complete" (unknown) from "it completed and the answer was wrong" (defect).
 */
export function assessDownload({ transportFailed = false, status = 0, body = "" } = {}, expectedHash) {
  if (transportFailed) return { verdict: "inconclusive", why: "the download did not complete — unknown, not a defect" };
  const got = sha256(Buffer.from(body));
  if (got === expectedHash) return { verdict: "ok", why: `served bytes hash to ${expectedHash.slice(0, 8)}… (HTTP ${status})` };
  if (status >= 400) return { verdict: "fail", why: `HTTP ${status} — a stranger following the guide gets an error page, not genesis` };
  return { verdict: "fail", why: `HTTP ${status} but the bytes hash to ${got.slice(0, 8)}…, not ${expectedHash.slice(0, 8)}… — something is serving a different file` };
}

/* ══════════════════════════════════════════════════════════════════════════
   The run
   ══════════════════════════════════════════════════════════════════════════ */

function trackedFiles() {
  try {
    return execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).split(/\r?\n/).filter(Boolean);
  } catch {
    return null;
  }
}

async function main() {
  if (SELF_TEST) return selfTest();

  let worst = 0;
  const bump = (code) => { worst = Math.max(worst, code); };
  const say = (verdict, label, why) => {
    const mark = verdict === "ok" ? "  ✓" : verdict === "inconclusive" ? "  ⚪" : "  🔴";
    console.log(`${mark} ${label}\n       ${why}`);
    bump(verdict === "ok" ? 0 : verdict === "inconclusive" ? 2 : 1);
  };

  console.log(`check-genesis-published — artefact ${ARTEFACT} · rpc ${RPC}\n`);

  // ── 1. Do we still have the bytes, under version control? ──────────────
  const abs = path.join(ROOT, ARTEFACT);
  if (!existsSync(abs)) {
    say("fail", "the published genesis exists", `${ARTEFACT} is not on disk — nothing to publish`);
    return worst;
  }
  const bytes = readFileSync(abs);
  const actual = sha256(bytes);
  const tracked = trackedFiles();
  if (tracked === null) {
    say("inconclusive", "the bytes are under version control", "`git ls-files` could not be run");
  } else if (!tracked.includes(ARTEFACT)) {
    say("fail", "the bytes are under version control",
      `${ARTEFACT} is on disk but NOT tracked — this is exactly the state that hid the problem: a file that is present on one machine and in no repository`);
  } else {
    say("ok", "the bytes are under version control", `tracked · sha256 ${actual}`);
  }

  // ── 2. Do the documents state that hash? ───────────────────────────────
  let claimsRead = 0;
  for (const rel of CLAIMANTS) {
    const p = path.join(ROOT, rel);
    if (!existsSync(p)) { say("inconclusive", `${rel} states the genesis hash`, "the document is missing"); continue; }
    const stated = statedGenesisHashes(readFileSync(p, "utf8"));
    if (stated.length === 0) { say("fail", `${rel} states the genesis hash`, "it makes claims about genesis but states no hash a reader could check against"); continue; }
    const wrong = stated.filter((s) => !hashAgrees(s, actual));
    claimsRead += stated.length;
    if (wrong.length) {
      say("fail", `${rel} states the genesis hash`,
        wrong.map((w) => `line ${w.line}: ${w.kind === "full" ? w.value : `${w.prefix}…${w.suffix}`} does not match ${actual}`).join("\n       "));
    } else {
      say("ok", `${rel} states the genesis hash`, `${stated.length} claim(s), all matching · ` + stated.map((s) => `line ${s.line}`).join(", "));
    }
  }
  console.log(`       (${claimsRead} hash claim(s) read in total — if that looks low, a claim is being missed)\n`);

  // ── 3. Do the bytes describe the LIVE network? ─────────────────────────
  const genesis = JSON.parse(bytes.toString("utf8"));
  let live = null;
  try { live = await measureLiveNetworkId(request, RPC); } catch { live = null; }
  const gen = assessGeneration(Number(genesis.networkID), live);
  say(gen.verdict, "the published genesis is for the RUNNING generation", gen.why);

  // ── 4. The other direction: is the advertised beacon really in it? ─────
  const guide = existsSync(path.join(ROOT, "docs/RUN-A-VALIDATOR.md")) ? readFileSync(path.join(ROOT, "docs/RUN-A-VALIDATOR.md"), "utf8") : "";
  const docNodeId = (guide.match(/NodeID-[1-9A-HJ-NP-Za-km-z]+/) || [null])[0];
  const stakerIds = (genesis.initialStakers || []).map((s) => s.nodeID);
  let liveValidators = null;
  try {
    const res = await request(`${RPC}/ext/bc/P`, { method: "POST", payload: { jsonrpc: "2.0", id: 1, method: "platform.getCurrentValidators", params: {} } });
    const parsed = JSON.parse(res.body);
    const list = parsed?.result?.validators;
    if (Array.isArray(list)) liveValidators = list.map((v) => v.nodeID);
  } catch { liveValidators = null; }
  const beacon = assessBeacon(docNodeId, stakerIds, liveValidators);
  say(beacon.verdict, "the advertised beacon is in this genesis AND validating",
    `${beacon.why}${liveValidators ? ` · ${liveValidators.length} validator(s) live` : ""}`);

  // ── 5. Can a stranger actually download it? ────────────────────────────
  // `--url` exists for ONE reason: the POSITIVE counter-case (D-154). Until the publishing push
  // happens this check can only ever be red, and a gate that has never been seen green carries no
  // information when it is red — that is D-153. Pointing it at a host serving the real bytes
  // proves the red is a fixable state and not a permanent one. It is NOT for silencing the run.
  const override = argOf("--url");
  const link = override ? { ok: true, url: override } : downloadUrlFrom(guide);
  if (override) console.log(`  ⚠️ --url given: measuring ${override}, NOT the URL the guide hands strangers`);
  if (!link.ok) {
    say("fail", "the guide names a working download URL", link.why);
  } else {
    let got;
    try {
      const res = await request(link.url, { timeoutMs: 30_000 });
      got = assessDownload({ status: res.status, body: res.body }, actual);
    } catch (e) {
      got = assessDownload({ transportFailed: true }, actual);
      got.why += ` (${e.message})`;
    }
    say(got.verdict, `a stranger can download it — ${link.url}`, got.why);
  }

  console.log();
  if (worst === 0) console.log("✅ PASS — the genesis bytes are versioned, correct for the live generation, and downloadable.");
  else if (worst === 1) console.log("🔴 FAIL — an outsider following the guide cannot join, or would join the wrong chain.");
  else console.log("⚪ INCONCLUSIVE — something could not be measured. Unknown is not the same as clean.");
  return worst;
}

/* ══════════════════════════════════════════════════════════════════════════
   Counter-cases. Hard rule #2: a gate nobody has seen RED is half-checked.
   ══════════════════════════════════════════════════════════════════════════ */

function selfTest() {
  let pass = 0, fail = 0;
  const ok = (label, got, want) => {
    const good = String(got) === String(want);
    console.log(`  ${good ? "✓" : "🔴"} ${label}${good ? "" : `   got ${got}, wanted ${want}`}`);
    good ? pass++ : fail++;
  };

  const H = "4de8caa59ef92e9212c27e569103bb757fa3e2a3876f3ab0c6981328bb0f6ee6";
  const OTHER = "0000000000000000000000000000000000000000000000000000000000000000";

  console.log("── stated hashes: what a document is read to be claiming ──");
  ok("a full digest on a genesis line is read", statedGenesisHashes(`genesis.json sha256 ${H}`).length, 1);
  ok("an elided digest is read too", statedGenesisHashes("`sha256(genesis.json)` | `4de8caa5…0f6ee6`")[0].kind, "elided");
  ok("🔴 a hash on a line with no `genesis` is NOT claimed as one", statedGenesisHashes(`fork tree ${H}`).length, 0);
  ok("🔴 a doc that talks about genesis but states nothing is caught as zero claims", statedGenesisHashes("get genesis from the repo").length, 0);
  ok("two claims on one line are both read", statedGenesisHashes(`genesis ${H} was ${OTHER}`).length, 2);

  console.log("\n── agreement ──");
  ok("a matching full digest agrees", hashAgrees({ kind: "full", value: H }, H), true);
  ok("🔴 a stale full digest does NOT agree", hashAgrees({ kind: "full", value: OTHER }, H), false);
  ok("a matching elided digest agrees", hashAgrees({ kind: "elided", prefix: "4de8caa5", suffix: "0f6ee6" }, H), true);
  ok("🔴 right prefix, WRONG suffix does not agree — the elision must not become a wildcard",
    hashAgrees({ kind: "elided", prefix: "4de8caa5", suffix: "ffffff" }, H), false);
  ok("🔴 wrong prefix, right suffix does not agree",
    hashAgrees({ kind: "elided", prefix: "deadbeef", suffix: "0f6ee6" }, H), false);

  console.log("\n── the download instruction ──");
  ok("a real URL is found", downloadUrlFrom("curl -O https://raw.githubusercontent.com/x/y/main/docs/genesis/genesis-g1.json").ok, true);
  ok("🔴 a guide with no URL fails", downloadUrlFrom("the sha256 is printed above").ok, false);
  ok("🔴 a placeholder is refused, not fetched", downloadUrlFrom("https://FILL-ON-G-DAY/genesis.json").ok, false);
  ok("🔴 an example URL is refused", downloadUrlFrom("https://EXAMPLE.org/genesis-g1.json").ok, false);

  console.log("\n── generation, and the other direction ──");
  ok("same generation passes", assessGeneration(999999998, 999999998).verdict, "ok");
  ok("🔴 a dead-generation genesis fails", assessGeneration(999999999, 999999998).verdict, "fail");
  ok("🔴 an unmeasurable network is INCONCLUSIVE, never a pass", assessGeneration(999999998, null).verdict, "inconclusive");
  const NID = "NodeID-MrgP69AZRSeJ3DQRSBWQzqeqovNcTAsEb", OTHERID = "NodeID-Zzz";
  ok("beacon in genesis and validating passes", assessBeacon(NID, [NID, OTHERID], [NID]).verdict, "ok");
  ok("🔴 beacon absent from genesis fails", assessBeacon(NID, [OTHERID], [NID]).verdict, "fail");
  ok("🔴 beacon in genesis but not validating fails", assessBeacon(NID, [NID], [OTHERID]).verdict, "fail");
  ok("🔴 no beacon named in the guide fails", assessBeacon(null, [NID], [NID]).verdict, "fail");
  ok("🔴 unreadable validator set is INCONCLUSIVE, not `not a validator`", assessBeacon(NID, [NID], null).verdict, "inconclusive");

  console.log("\n── the public surface: judged by CONTENT, not status (hard rule #1) ──");
  const body = "hello";
  ok("matching bytes pass", assessDownload({ status: 200, body }, sha256(Buffer.from(body))).verdict, "ok");
  ok("🔴 a 404 fails", assessDownload({ status: 404, body: "<html>Not Found</html>" }, H).verdict, "fail");
  ok("🔴 HTTP 200 carrying the WRONG bytes still fails — a green status proves nothing",
    assessDownload({ status: 200, body: "<html>404: Not Found</html>" }, H).verdict, "fail");
  ok("🔴 a transport failure is INCONCLUSIVE, not a defect",
    assessDownload({ transportFailed: true }, H).verdict, "inconclusive");
  ok("🔴 an EMPTY 200 fails rather than hashing to something accidental",
    assessDownload({ status: 200, body: "" }, H).verdict, "fail");

  console.log(`\n${fail === 0 ? "✅" : "🔴"} ${pass} passed · ${fail} failed`);
  return fail === 0 ? 0 : 1;
}

main().then((code) => process.exit(code)).catch((e) => {
  console.error(`⚪ INCONCLUSIVE — the gate itself could not run: ${e.stack || e.message}`);
  process.exit(2);
});
