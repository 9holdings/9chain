#!/usr/bin/env node
/**
 * check-doc-drift.mjs — does any document still tell a reader a number from a DEAD generation?
 *
 * ═══ WHY THIS EXISTS ═══
 *
 * Found 2026-09-01, hours after the repository went public: `docs/ALLOCATION-PUBLIC.md` published
 * six fund addresses under the heading `networkID 999999999`. Every address in it belonged to
 * **g0**, which died at 09:26Z that morning. The addresses do not error when used — they sit at
 * zero balance and say nothing — so a reader following that table would have sent value into
 * addresses nobody controls on a network nobody runs.
 *
 * Every gate in this repo was green. None of them reads documentation.
 *
 * 🔴 **The failure mode is specific to re-genesis, and it will happen again**: every re-genesis
 * mints a completely new set of addresses, a new networkID, new blockchainIDs, a new genesis
 * hash. Documents keep the old ones, and old ones fail *silently*.
 *
 * ═══ WHY IT IS NOT A FIND-AND-REPLACE ═══
 *
 * Most mentions of a dead number in this repo are **statements about the past** and are correct
 * as they stand: `DECISIONS.md` recording what was decided on 27/08, an evidence bundle, an
 * archived allocation table. Rewriting those is rewriting history to tidy the view — the thing
 * `CLAUDE.md` §2 forbids in as many words. `patches/` and `docs/evidence/**` are frozen by byte
 * and a sweep across them has already broken this repo twice in one session.
 *
 * ⇒ So the question is never "does this number appear", it is **"is this document telling a
 * reader what is true NOW"**. Three groups, and the difference is the whole design:
 *
 *   PRODUCT PATH   someone follows it to DO something — join the network, create a chain,
 *                  check an address. A dead number here is a defect. Scanned.
 *   RECORD         a dated entry about what happened. A dead number here is the POINT.
 *                  Not scanned, but required to carry a banner saying what it is.
 *   FROZEN         evidence bundles, patches, archives. Never touched, never scanned.
 *
 * ═══ HOW IT DECIDES SOMETHING IS DEAD ═══
 *
 * By MEASURING the live chain, not by comparing against a constant copied into this file. The
 * live networkID is asked of the running node; anything else in the identity band that appears
 * next to the word `networkID` is a previous generation. That is the same reason
 * `check-net-dirs.mjs` had to stop inferring the running network from a repo constant (D-110).
 *
 * ⚠️ `A1IDGoc = 999999999` is the BAND BASE — a constant of the design, not a generation. It is
 * only a dead networkID when a document says `networkID 999999999`. The pattern requires the word.
 *
 * An individual line may carry a dead value if it declares itself: put `stale-ok` on the line,
 * normally inside an HTML comment so a reader never sees it. Use it for sentences in the past
 * tense that name their date — not to silence something you have not read.
 *
 * Exit codes: `0` no drift · `1` drift found · `2` could not measure.
 *
 * Usage:
 *   node scripts/check-doc-drift.mjs
 *   node scripts/check-doc-drift.mjs --rpc <url>
 *   node scripts/check-doc-drift.mjs --self-test
 */
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import https from "node:https";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const SELF_TEST = argv.includes("--self-test");
const opt = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const RPC = opt("--rpc", "https://rpc-a1.9chain.org");

/**
 * Directories and files that are RECORDS or FROZEN. Everything else that is a `.md` gets scanned.
 *
 * Written as an exclusion list rather than an inclusion list on purpose: a new document added
 * tomorrow is scanned by default. An inclusion list would quietly leave it unmeasured, which is
 * exactly how `docs/ALLOCATION-PUBLIC.md` stayed wrong through a re-genesis.
 */
const NOT_SCANNED = [
  { match: /^docs\/archive\//, why: "FROZEN — archived copies exist to preserve what was true then" },
  { match: /^docs\/evidence\//, why: "FROZEN by byte — a sweep across these broke 9/9 → 7/9 silently once" },
  { match: /^patches\//, why: "FROZEN by byte — touching one is touching the fork replay path" },
  { match: /^upstream\//, why: "not ours — Ava Labs' documentation inside the vendored fork" },
  { match: /^node_modules\//, why: "dependencies" },
  { match: /^docs\/AUDIT-A1\//, why: "RECORD — audit findings, dated" },
  { match: /^docs\/requests-from-9scan\//, why: "RECORD — correspondence, dated" },
  { match: /^docs\/o2-g0-final\//, why: "RECORD — the final export of the g0 generation" },
  { match: /^docs\/chainid-registry\//, why: "RECORD — what was submitted to the public registry, when" },
  { match: /^(DECISIONS|HANDOFF|BLOCKERS|PROGRESS)\.md$/, why: "RECORD — the working notebook, dated entries" },
  { match: /^docs\/PROGRESS\.md$/, why: "RECORD — dated entries" },
  { match: /-2026-\d\d-\d\d\.md$/, why: "RECORD — the date in the filename says what it is" },
];

/** A line saying this is deliberate. Normally written inside an HTML comment so readers never see it. */
const EXEMPT = /stale-ok/;

/**
 * A marker on its OWN line exempts that line and the ONE line after it.
 *
 * Prose cannot always carry a trailing marker: a sentence that wraps over four lines has nowhere
 * to put one where a reader will not see it, and `docs/RUN-A-VALIDATOR.md` — the document a
 * stranger reads to join the network — is exactly that shape. Written the natural markdown way,
 * on the line above, the first version of this gate ignored it and reported the paragraph anyway.
 *
 * 🔴 ONE line, never a block. A marker meaning "everything below is fine" is a silencer, and a
 * silencer is how `ALLOCATION-PUBLIC.md` stayed wrong through a re-genesis with every gate green.
 * An inline marker covers only its own line — it must not leak onto the next one.
 */
const STANDALONE_EXEMPT = /^\s*<!--[^>]*stale-ok[^>]*-->\s*$/;

/** Is line `i` (0-based) exempt — by its own marker, or by a standalone marker directly above it? */
const isExempt = (lines, i) => EXEMPT.test(lines[i]) || STANDALONE_EXEMPT.test(lines[i - 1] ?? "");

/**
 * A whole file declaring itself a RECORD — a plan, a proposal, a runbook for a day that has
 * passed. Written in the file rather than listed in this script on purpose: a list here has to
 * be edited by whoever adds a document, i.e. by the person least likely to remember it, and a
 * document is the only thing that reliably knows what it is.
 *
 * The marker is not a silencer. A record must ALSO tell a human reader, in its first lines, what
 * it is and when it was written — the marker only stops this gate; the banner stops the confusion.
 */
const RECORD_MARKER = /doc-drift:\s*record/;

const post = (url, payload, timeoutMs = 20_000) => {
  const u = new URL(url);
  const lib = u.protocol === "http:" ? http : https;
  const data = JSON.stringify(payload);
  return new Promise((resolve, reject) => {
    const req = lib.request(u, {
      method: "POST",
      headers: { "content-type": "application/json", "content-length": Buffer.byteLength(data), connection: "close" },
      agent: new lib.Agent({ keepAlive: false }),
      timeout: timeoutMs,
    }, (res) => {
      let out = ""; res.setEncoding("utf8");
      res.on("data", (c) => { out += c; });
      res.on("end", () => resolve(out));
    });
    req.on("timeout", () => req.destroy(new Error(`timed out after ${timeoutMs} ms`)));
    req.on("error", reject);
    req.end(data);
  });
};

/** The live identity, asked of the running node. Never inferred from a constant in this repo. */
async function measureLive(rpcBase) {
  const info = async (method) => JSON.parse(await post(`${rpcBase}/ext/info`, { jsonrpc: "2.0", id: 1, method, params: {} })).result;
  const id = await info("info.getNetworkID");
  const name = await info("info.getNetworkName");
  return { networkID: Number(id.networkID), networkName: name.networkName };
}

/**
 * The checks. Each one is a pattern plus the reason a match is a defect — the reason is printed,
 * because a gate that says only "line 41" teaches people to delete the line rather than fix it.
 */
function buildChecks(live) {
  return [
    {
      id: "dead-networkid",
      // The WORD, then the number: `A1IDGoc = 999999999` is the band base and must not match.
      re: /network\s*id[^0-9]{0,4}(\d{4,10})|networkID[^0-9]{0,4}(\d{4,10})/gi,
      test: (m) => {
        const n = Number(m[1] ?? m[2]);
        return Number.isFinite(n) && n !== live.networkID;
      },
      why: (m) => `networkID ${m[1] ?? m[2]} is not the running network (${live.networkID})`,
    },
    {
      id: "dead-network-name",
      re: /9chain-a1-g(\d+)/g,
      test: (m) => `9chain-a1-g${m[1]}` !== live.networkName,
      why: (m) => `network name 9chain-a1-g${m[1]} is not the running network (${live.networkName})`,
    },
    {
      id: "retired-hostname",
      re: /\b(rpc-)?testnet-a1\.9chain\.org\b/g,
      test: () => true,
      why: (m) => `${m[0]} was retired 2026-08-28 and answers 525 — the live names are a1.9chain.org and rpc-a1.9chain.org`,
    },
    {
      id: "old-validator-barrier",
      re: /\b25[,.]?000\s*LOVE9/g,
      test: () => true,
      why: () => "MinValidatorStake has been 81 LOVE9 since patch 0027 (2026-09-01)",
    },
  ];
}

/**
 * 🔴 THE SCAN SET IS WHAT GIT TRACKS, and that is the whole question restated correctly.
 *
 * The first version walked the filesystem and reported nine `local-net/net<N>/allocation.md` files
 * as drift. They are netgen output for dead and drill networks, they are gitignored, and no
 * publication can ever expose them — `check-net-dirs.mjs` is the gate that owns them, and it
 * grades them by asking the chain who holds money.
 *
 * This gate exists because documents MISLEAD READERS. A file a reader cannot reach cannot
 * mislead them. So the right question is not "does this file exist on my disk" but "does
 * publishing hand it to someone", and git is the thing that answers that.
 */
function listDocs(root) {
  const tracked = execFileSync("git", ["ls-files", "-z", "*.md"], { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
    .split(" ").filter(Boolean);
  return tracked
    .filter((rel) => !NOT_SCANNED.some((r) => r.match.test(rel)))
    .map((rel) => ({ rel, abs: path.join(root, rel) }))
    .filter((d) => existsSync(d.abs));
}

/** Does this file declare itself a dated record? Read separately so the run can COUNT them. */
function isRecord(abs) {
  return readFileSync(abs, "utf8").split(/\r?\n/, 20).some((l) => RECORD_MARKER.test(l));
}

function scanFile({ rel, abs }, checks) {
  const findings = [];
  const lines = readFileSync(abs, "utf8").split(/\r?\n/);
  if (lines.slice(0, 20).some((l) => RECORD_MARKER.test(l))) return findings;
  lines.forEach((line, i) => {
    if (isExempt(lines, i)) return;
    for (const c of checks) {
      c.re.lastIndex = 0;
      for (const m of line.matchAll(c.re)) {
        if (!c.test(m)) continue;
        findings.push({ rel, line: i + 1, id: c.id, why: c.why(m), text: line.trim().slice(0, 110) });
      }
    }
  });
  return findings;
}

// ───────────────────────────── self-test ─────────────────────────────

function selfTest() {
  const live = { networkID: 999999998, networkName: "9chain-a1-g1" };
  const checks = buildChecks(live);
  const scan = (text) => {
    const findings = [];
    const lines = text.split("\n");
    lines.forEach((line, i) => {
      if (isExempt(lines, i)) return;
      for (const c of checks) {
        c.re.lastIndex = 0;
        for (const m of line.matchAll(c.re)) if (c.test(m)) findings.push({ line: i + 1, id: c.id });
      }
    });
    return findings;
  };
  const cases = [
    // The shape of the heading that actually shipped in `docs/ALLOCATION-PUBLIC.md`, translated:
    // the document is Vietnamese, this file is code, and code is English only (CLAUDE.md §0).
    // What is under test is the NUMBER next to the word, which is language-independent.
    ["a dead networkID in prose is caught",
      scan("# Genesis allocation (networkID 999999999, 9 nodes)").some((f) => f.id === "dead-networkid")],
    ["the LIVE networkID is not a finding",
      scan("networkID 999999998 is the running network").length === 0],
    ["🔴 the band base A1IDGoc = 999999999 is NOT a networkID and must not be flagged",
      scan("networkID   = A1IDGoc − A1Gen        (A1IDGoc = 999999999)").length === 0],
    ["a dead generation NAME is caught",
      scan("the network answers 9chain-a1-g0").some((f) => f.id === "dead-network-name")],
    ["the live generation name is not a finding",
      scan("the network answers 9chain-a1-g1").length === 0],
    ["a retired hostname is caught",
      scan("point your wallet at rpc-testnet-a1.9chain.org").some((f) => f.id === "retired-hostname")],
    ["the live hostname is not a finding",
      scan("point your wallet at rpc-a1.9chain.org").length === 0],
    ["the old validator barrier is caught",
      scan("you need 25,000 LOVE9 to self-bond").some((f) => f.id === "old-validator-barrier")],
    ["the current barrier is not a finding",
      scan("you need 81 LOVE9 to self-bond").length === 0],
    ["🔴 a line declaring itself past-tense is exempt",
      scan("Until 2026-09-01 this was 25,000 LOVE9 <!-- stale-ok -->").length === 0],
    ["🔴 a marker on its OWN line exempts the line below it (the RUN-A-VALIDATOR shape)",
      scan("<!-- stale-ok: past tense, and it names its date -->\nUntil 2026-09-01 this barrier was 25,000 LOVE9.").length === 0],
    ["…and ONLY that one line — the line after it is still scanned",
      scan("<!-- stale-ok -->\nUntil 2026-09-01 this was 25,000 LOVE9.\nyou need 25,000 LOVE9 today")
        .some((f) => f.line === 3)],
    ["🔴 an INLINE marker does not leak onto the next line",
      scan("the old rule was 25,000 LOVE9 <!-- stale-ok -->\nyou need 25,000 LOVE9 today")
        .some((f) => f.line === 2)],
    ["records and frozen material are not scanned",
      NOT_SCANNED.some((r) => r.match.test("docs/evidence/o2-before-delete-2026-08-27/x.md")) &&
      NOT_SCANNED.some((r) => r.match.test("DECISIONS.md")) &&
      !NOT_SCANNED.some((r) => r.match.test("docs/RUN-A-VALIDATOR.md"))],
    ["a file declaring itself a record is skipped",
      ["<!-- doc-drift: record -->", "networkID 9001"].some((l) => RECORD_MARKER.test(l))],
    ["…and a file WITHOUT the marker is still scanned",
      !["# Normal doc", "networkID 9001"].some((l) => RECORD_MARKER.test(l))],
    ["a NEW document is scanned by default (exclusion list, not inclusion list)",
      !NOT_SCANNED.some((r) => r.match.test("docs/SOMETHING-NEW.md"))],
  ];
  let bad = 0;
  for (const [name, ok] of cases) { console.log(`  ${ok ? "✓" : "🔴"} ${name}`); if (!ok) bad++; }
  console.log(`\n  ${cases.length - bad}/${cases.length} reverse controls passed`);
  return bad ? 1 : 0;
}

// ───────────────────────────── main ─────────────────────────────

async function main() {
  if (SELF_TEST) return selfTest();

  let live;
  try {
    live = await measureLive(RPC);
  } catch (e) {
    console.log(`⁇ could not measure the running network (${RPC}): ${e.message}`);
    console.log("   Without it every \"dead\" verdict would be a guess against a constant copied");
    console.log("   into this file — the failure D-110 documents. COULD NOT MEASURE.");
    return 2;
  }
  console.log(`check-doc-drift — live: networkID ${live.networkID} · ${live.networkName}  (measured on ${RPC})`);

  const checks = buildChecks(live);
  const docs = listDocs(ROOT);
  const findings = docs.flatMap((d) => scanFile(d, checks));
  // 🔴 Count what was ACTUALLY read, not what was listed. A run that prints "scanned 23" while
  // four of the 23 excused themselves is the same error this gate exists to catch, one level up.
  const records = docs.filter((d) => isRecord(d.abs));
  console.log(`  read ${docs.length - records.length} document(s) on the product path`
    + (records.length ? ` · ${records.length} declared themselves dated records and were NOT read`
      + `\n    (${records.map((r) => r.rel).join(", ")})` : ""));

  if (!findings.length) {
    console.log("\n✓ No document names a dead generation as if it were current.");
    console.log("  Records and frozen material are deliberately not scanned — they are supposed to");
    console.log("  carry old numbers, and rewriting them would be rewriting history.");
    return 0;
  }
  const byFile = new Map();
  for (const f of findings) {
    if (!byFile.has(f.rel)) byFile.set(f.rel, []);
    byFile.get(f.rel).push(f);
  }
  for (const [rel, fs] of byFile) {
    console.log(`\n  🔴 ${rel}`);
    for (const f of fs) {
      console.log(`     line ${f.line} · ${f.why}`);
      console.log(`       ${f.text}`);
    }
  }
  console.log(`\n🔴 ${findings.length} line(s) in ${byFile.size} document(s) state a dead value as current.`);
  console.log("   Fix the sentence, or mark it `stale-ok` if it is genuinely about the past and says so —");
  console.log("   inline in an HTML comment, or on its own line directly ABOVE (covers that one line).");
  console.log("   A whole document that is a dated record instead carries `<!-- doc-drift: record -->`");
  console.log("   in its first 20 lines, plus a banner telling a HUMAN reader what it is.");
  return 1;
}

process.exit(await main());
