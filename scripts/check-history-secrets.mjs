#!/usr/bin/env node
/**
 * check-history-secrets.mjs — is there key material anywhere in the GIT HISTORY that would be
 * published the moment this repository is flipped to public?
 *
 * ═══ WHY THIS EXISTS ═══
 *
 * The one thing still blocking pass-conditions 4 and 5 on 2026-09-01 is *"make the GitHub repo
 * PUBLIC"*. Flipping that switch publishes **every commit**, not the working tree: a key that was
 * committed in July and deleted in August is still handed to everyone who clones. Deleting a file
 * removes it from the tree, never from the objects.
 *
 * 🔴 **Nothing in this project measured that quantity.** Two gates look like they do:
 *   - `scripts/h6b-backup.sh` scans for secrets with `grep -r … --exclude-dir=.git` — it excludes
 *     the object database **by construction**, and looks only for PEM blocks, so a cb58
 *     `PrivateKey-…` or a bare `0x` hex key would not match even in the working tree.
 *   - `scripts/check-key-leaks.mjs` searches **filesystem roots**: files that exist right now.
 *     A blob that no tree points at any more exists in no directory it can walk.
 *
 * Both are green, both are correct about what they measure, and neither has ever read a single
 * historical object. That is this repo's most expensive failure class — *measuring the wrong
 * quantity* — sitting on the last irreversible action of the launch. Publishing cannot be undone:
 * once cloned, a key is gone, and rotating it means re-genesis.
 *
 * ═══ WHAT IT MEASURES ═══
 *
 * Every blob reachable from every ref, plus every commit message and tag message — the exact set
 * of bytes a `git push` hands to the remote — read as raw text and searched for:
 *
 *   1. **cb58 key shape** — `PrivateKey-` followed by 40+ base58 characters. 🔴 RED by shape
 *      alone: nothing but a key looks like that. Prose saying `PrivateKey-*` does not match, and
 *      that distinction is not theoretical — the first version of `check-key-leaks.mjs` matched
 *      the bare word and reported two tracked documents as leaks (D-117).
 *   2. **PEM private-key blocks** — a `BEGIN … PRIVATE KEY` header **followed by a real body**
 *      (100+ base64 characters). 🔴 RED by shape. The body requirement is not decoration; see
 *      `hasPemKey` for the run where the header alone reported this very file.
 *   3. **32-byte hex** — `0x`-prefixed or bare, exactly 64 hex characters. This shape is
 *      **ambiguous on purpose**: a sha256, a tx hash and an EVM private key are the same 64
 *      characters, and this repo's history is full of the first two. So shape alone is NOT a
 *      verdict here. Each one is hashed and compared against the **live key store**
 *      (`~/9chain-a1-keys/g<N>/`): a match is 🔴 RED — a key we know holds spend authority.
 *      Everything else is counted and reported as 🟡, never as green silence.
 *
 * 🔴 **Key material is never printed.** Comparison is by SHA-256 of the normalised key string;
 * findings name the object, the path and the commit, and stop there. A gate that solves a leak by
 * printing the leak to a terminal, a log file and a session transcript has moved it, not closed
 * it — the exact mechanism that put g1's keys in `%TEMP%` for sixteen hours (B-21).
 *
 * ⚠️ **Scope, stated rather than implied.** Default scope is what publishing exposes: objects
 * reachable from refs. Objects in the database that no ref reaches (an amended commit, an
 * abandoned rebase) are NOT sent by `git push` and are NOT scanned — but they are counted and
 * reported and can be scanned with `--all-objects`, because they DO travel in a filesystem copy
 * of `.git` — a backup that tars the directory, a drive image, a machine handed on. ⚠️ Said
 * precisely, since the imprecise version was written here first: no `git push` sends them,
 * `--mirror` included. Push transfers what refs reach.
 *
 * Exit codes: `0` no key material in history · `1` key material found · `2` could not measure.
 *
 * Usage:
 *   node scripts/check-history-secrets.mjs
 *   node scripts/check-history-secrets.mjs --all-objects        # include unreachable objects
 *   node scripts/check-history-secrets.mjs --repo <dir>         # scan another clone/bundle tree
 *   node scripts/check-history-secrets.mjs --fund-set <file>    # extra baseline (repeatable)
 *   node scripts/check-history-secrets.mjs --self-test          # reverse controls
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createHash, randomBytes } from "node:crypto";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const SELF_TEST = argv.includes("--self-test");
const ALL_OBJECTS = argv.includes("--all-objects");
const opt = (flag, fallback) => {
  const i = argv.indexOf(flag);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
const REPO = path.resolve(opt("--repo", ROOT));
const EXTRA_SETS = argv.reduce((acc, a, i) => (a === "--fund-set" && argv[i + 1] ? [...acc, argv[i + 1]] : acc), []);

/**
 * 🔴 A KEY, NOT THE WORD "KEY" — the same rule `check-key-leaks.mjs` had to learn the hard way.
 * avalanchego serialises private keys as `PrivateKey-` + cb58 (base58, no `0OIl`), about 51
 * characters. Requiring 40+ is what separates a key from a sentence mentioning one.
 */
const CB58_RE = /PrivateKey-[1-9A-HJ-NP-Za-km-z]{40,}/g;
/**
 * 🔴 A HEADER IS NOT A KEY — the same rule as `PrivateKey-*` one line up, learned the same way.
 *
 * The first commit of this file matched the header alone, and the next run reported **this file**
 * as a leak: its own self-test fixture had become a blob in the history it scans. The tempting
 * repair is an exception for the gate's own path. That is a hole with a comment next to it, and
 * it would have been inherited by every later copy of the fixture.
 *
 * The honest repair is to measure the thing that makes a PEM block dangerous: the **body**. A
 * header with nine characters after it carries no key. A header followed by a hundred-plus
 * base64 characters does. So the gate asks for both — which also means a redacted or truncated
 * PEM in a document is correctly *not* a finding.
 */
const PEM_HEADER_RE = /-----BEGIN (?:RSA |EC |DSA |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/g;
const PEM_BODY_MIN = 100;
function hasPemKey(text) {
  for (const m of text.matchAll(PEM_HEADER_RE)) {
    const after = text.slice(m.index + m[0].length, m.index + m[0].length + 4000);
    const body = after.match(/[A-Za-z0-9+/=\r\n]+/);
    if (body && body[0].replace(/\s/g, "").length >= PEM_BODY_MIN) return true;
  }
  return false;
}
/**
 * Exactly 64 hex characters, not 63 and not the middle of a longer run — a 128-character hex blob
 * is not two keys. The lookarounds are what make that true; `\b` alone accepts a substring of a
 * longer hex string and would turn every binary-looking blob into dozens of phantom candidates.
 */
const HEX_RE = /(?<![0-9a-fA-F])(?:0x)?([0-9a-fA-F]{64})(?![0-9a-fA-F])/g;

/**
 * Objects larger than this are not read, and a skip is reported as UNMEASURED — never quietly
 * folded into a green run.
 *
 * ⚠️ Measured 2026-09-01: at 8 MB this repo's own database produced exactly one skip — a 9.18 MB
 * blob of base64-embedded wasm — and one skip is enough to turn the whole publishing gate into
 * exit 2. A cap that makes the honest answer "could not measure" on a normal repository is a cap
 * set wrong, because the pressure is then to re-run without it. 64 MB reads every object here in
 * well under a second.
 */
const MAX_BYTES = 64 * 1024 * 1024;

const sha256 = (s) => createHash("sha256").update(s, "utf8").digest("hex");

// ───────────────────────────── git plumbing ─────────────────────────────

function git(args, { cwd = REPO, input = undefined, encoding = "utf8" } = {}) {
  // `input` must be a Buffer when the output encoding is "buffer": spawnSync encodes stdin with
  // the same `encoding`, and "buffer" is not a string encoding.
  const stdin = typeof input === "string" && encoding === "buffer" ? Buffer.from(input, "utf8") : input;
  const r = spawnSync("git", args, { cwd, input: stdin, encoding, maxBuffer: 512 * 1024 * 1024 });
  return r;
}

function gitText(args, cwd = REPO) {
  const r = git(args, { cwd });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${(r.stderr || "").trim()}`);
  return r.stdout;
}

/**
 * The full object list, with the path each blob was last seen under. `rev-list --objects --all`
 * walks refs only — deliberately, because that is what a push transfers. `--all-objects` widens
 * it to the whole database.
 */
function listObjects(cwd) {
  const reachable = new Map(); // sha -> path label
  for (const line of gitText(["rev-list", "--objects", "--all"], cwd).split("\n")) {
    if (!line) continue;
    const sp = line.indexOf(" ");
    const sha = sp === -1 ? line : line.slice(0, sp);
    const label = sp === -1 ? "" : line.slice(sp + 1);
    if (/^[0-9a-f]{40,64}$/.test(sha)) reachable.set(sha, label);
  }
  const everything = new Set();
  for (const line of gitText(["cat-file", "--batch-check=%(objectname) %(objecttype)", "--batch-all-objects"], cwd).split("\n")) {
    const [sha, type] = line.split(" ");
    if (type === "blob" || type === "commit" || type === "tag") everything.add(sha);
  }
  return { reachable, everything };
}

/**
 * Read a set of objects in one `cat-file --batch` stream. Reading them one process at a time is
 * correct and roughly a hundred times slower; on a repo this size that difference is what decides
 * whether the gate gets run before publishing or skipped "just this once".
 */
function readObjects(cwd, shas) {
  const out = [];
  const skipped = [];
  if (!shas.length) return { out, skipped };
  const r = git(["cat-file", "--batch"], { cwd, input: shas.join("\n") + "\n", encoding: "buffer" });
  if (r.status !== 0) throw new Error(`git cat-file --batch failed: ${String(r.stderr || "").trim()}`);
  const buf = r.stdout;
  let i = 0;
  while (i < buf.length) {
    const nl = buf.indexOf(0x0a, i);
    if (nl === -1) break;
    const header = buf.slice(i, nl).toString("latin1");
    i = nl + 1;
    const [sha, type, sizeStr] = header.split(" ");
    if (type === undefined || sizeStr === undefined) break; // "<sha> missing"
    const size = Number(sizeStr);
    const body = buf.slice(i, i + size);
    i += size + 1; // trailing newline
    if (size > MAX_BYTES) { skipped.push({ sha, type, size }); continue; }
    // 🔴 Read EVERYTHING as text. Nothing that decides *whether to look* may depend on a file
    // name or an extension — a key does not care what it is called, or what it is stored in.
    out.push({ sha, type, text: body.toString("latin1") });
  }
  return { out, skipped };
}

// ───────────────────────────── baseline: keys we know hold money ─────────────────────────────

/**
 * Every key in the live store, hashed. Discovered by walking `~/9chain-a1-keys/g<N>/`, not by a
 * hand-kept list of filenames: the yardstick has to grow a new generation the moment its
 * directory exists, or on the day after re-genesis it grades the only keys still worth anything
 * as harmless (the inversion `check-key-leaks.mjs` documents at length).
 */
function loadBaseline(extra = [], storeDir = path.join(homedir(), "9chain-a1-keys")) {
  const files = [];
  const store = storeDir;
  try {
    for (const d of readdirSync(store, { withFileTypes: true })) {
      if (!d.isDirectory() || !/^g\d+$/.test(d.name)) continue;
      for (const f of readdirSync(path.join(store, d.name))) {
        if (BASELINE_FILE_RE.test(f)) files.push(path.join(store, d.name, f));
      }
    }
  } catch { /* store unreadable: the caller turns an empty baseline into exit 2 */ }
  for (const f of extra) if (existsSync(f)) files.push(f);

  const hashes = new Map(); // sha256(normalised key) -> label of the file it came from
  const perFile = [];
  for (const f of files) {
    let body;
    try { body = readFileSync(f, "latin1"); } catch { continue; }
    const label = path.join(path.basename(path.dirname(f)), path.basename(f));
    const before = hashes.size;
    for (const tok of extractBaselineKeys(body)) hashes.set(tok.hash, label);
    perFile.push({ label, added: hashes.size - before });
  }
  return { hashes, files, perFile };
}

/**
 * 🔴 WHICH FILES IN THE STORE HOLD KEYS — AND WHY "ERR WIDE" IS THE WRONG INSTINCT HERE.
 *
 * The first version of this loader read every `.txt .env .key .json` in the store, on the
 * reasoning `check-key-leaks.mjs` states for the SEARCH side: erring wide costs nothing.
 *
 * That is true when deciding **where to look for a leak** and false when building the
 * **yardstick you grade by**. `g0/genesis.json` sits in that store, and a genesis file is
 * hundreds of 32-byte hex values — none of them keys. The first real run against this repo
 * therefore reported **68 red findings**, every one of them a genesis hash legitimately
 * reprinted in an evidence bundle. A gate that cries leak over `docs/evidence/**` is not a
 * gate, and the blast radius is specific: it would have been read as "history is dirty, do not
 * publish", i.e. it would have blocked a correct action for a wrong reason.
 *
 * So the baseline is deliberately NARROW: files that hold keys by this project's own convention
 * (`keys.txt`, `*-key.txt`, `*.env`), never genesis or allocation files.
 *
 * ⚠️ The cost of narrowness, stated: a key stored somewhere new is missing from the yardstick,
 * so a leak of it would grade 🟡 instead of 🔴. That is survivable ONLY because every wallet in
 * this store is written in both encodings — the cb58 half is RED by shape with no yardstick at
 * all — and because the run prints what it loaded, per file, so an empty count is visible rather
 * than assumed.
 */
const BASELINE_FILE_RE = /^(keys\.txt|.*-key\.txt|.*\.env)$/i;
/** A line that DECLARES a key… */
const KEY_LINE_RE = /(priv|secret|\bpk\b|_pk\b|key)/i;
/** …and one that merely carries some other 32-byte value. Address lines are the common case. */
const NOT_KEY_LINE_RE = /(addr|address|sha256|hash|tree|commit|txid|nodeid|fingerprint|checksum|blockid)/i;

/**
 * Key material in a store file, normalised so the same key hashes the same way wherever it is
 * found: cb58 without its `PrivateKey-` prefix, hex lowercased without `0x`.
 *
 * cb58 is taken unconditionally — nothing else has that shape. Hex is taken only from a line that
 * declares a key, because 64 hex characters on an unrelated line is a hash, and this project
 * writes a great many hashes.
 */
function extractBaselineKeys(text) {
  const toks = [];
  for (const m of text.matchAll(CB58_RE)) {
    toks.push({ kind: "cb58", hash: sha256(m[0].slice("PrivateKey-".length)) });
  }
  for (const line of text.split(/\r?\n/)) {
    if (!KEY_LINE_RE.test(line) || NOT_KEY_LINE_RE.test(line)) continue;
    for (const m of line.matchAll(HEX_RE)) toks.push({ kind: "hex", hash: sha256(m[1].toLowerCase()) });
  }
  return toks;
}

// ───────────────────────────── the scan ─────────────────────────────

function scan(cwd, baseline, { allObjects = false } = {}) {
  const { reachable, everything } = listObjects(cwd);
  const wanted = allObjects ? [...everything] : [...reachable.keys()].filter((s) => everything.has(s));
  const unreachable = [...everything].filter((s) => !reachable.has(s));
  const { out, skipped } = readObjects(cwd, wanted);

  const red = [];
  const hexUnknown = [];
  for (const o of out) {
    const where = reachable.get(o.sha) || "(no path — commit, tag, or unreachable object)";
    for (const m of o.text.matchAll(CB58_RE)) {
      void m;
      red.push({ why: "cb58 private key", sha: o.sha, type: o.type, where });
      break; // one finding per object is enough to block; counting them adds nothing but noise
    }
    if (hasPemKey(o.text)) red.push({ why: "PEM private key block", sha: o.sha, type: o.type, where });
    for (const m of o.text.matchAll(HEX_RE)) {
      const h = sha256(m[1].toLowerCase());
      if (baseline.hashes.has(h)) red.push({ why: `32-byte key matching the live store (${baseline.hashes.get(h)})`, sha: o.sha, type: o.type, where });
      else hexUnknown.push(o.sha);
    }
  }
  return { red, hexUnknown: hexUnknown.length, scanned: out.length, skipped, unreachable: unreachable.length };
}

/**
 * The verdict, separated from the printing so the self-test can exercise it directly.
 *
 * 🔴 ORDER MATTERS, AND THE OBVIOUS ORDER IS WRONG. "Could not measure" outranks "clean" — but it
 * does NOT outrank a finding: key material found by SHAPE is a certainty that needs no yardstick,
 * so a missing key store must never downgrade a red to an amber. Written the other way round (the
 * order these checks were first drafted in), a machine with no `9chain-a1-keys` directory would
 * report exit 2 while holding a cb58 key in its history — and exit 2 is the code the runner is
 * most likely to read as "environment problem, not my repo".
 */
function verdict(result, baseline) {
  if (result.red.length) return 1;
  if (baseline.hashes.size === 0) return 2;
  if (result.skipped.length) return 2;
  return 0;
}

// ───────────────────────────── self-test: reverse controls ─────────────────────────────

/**
 * Synthetic material only. This file must never write a real key anywhere, least of all into a
 * temporary git repository that outlives the session — that is D-117 with extra steps.
 */
function fakeCb58() {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let s = "";
  for (const b of randomBytes(51)) s += alphabet[b % alphabet.length];
  return `PrivateKey-${s}`;
}
const fakeHex = () => randomBytes(32).toString("hex");

function initRepo(dir) {
  mkdirSync(dir, { recursive: true });
  for (const args of [
    ["init", "-q", "-b", "main"],
    ["config", "user.email", "self-test@9chain.invalid"],
    ["config", "user.name", "self-test"],
    ["config", "commit.gpgsign", "false"],
    // The machine has a global pre-commit hook that refuses secret-shaped files. It is a good
    // hook and it is why these fixtures need it switched off: the self-test's whole job is to
    // put key-shaped material INTO a history and prove the scanner finds it afterwards.
    ["config", "core.hooksPath", path.join(dir, ".no-hooks")],
  ]) {
    const r = git(args, { cwd: dir });
    if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${(r.stderr || "").trim()}`);
  }
}
function commit(dir, file, body, msg) {
  writeFileSync(path.join(dir, file), body);
  git(["add", file], { cwd: dir });
  const r = git(["commit", "-q", "-m", msg], { cwd: dir });
  if (r.status !== 0) throw new Error(`commit: ${(r.stderr || "").trim()}`);
}

function selfTest() {
  const tmp = mkdtempSync(path.join(tmpdir(), "a1-histsec-"));
  const cases = [];
  const emptyBaseline = { hashes: new Map(), files: [] };
  try {
    // 1 — the whole reason this file exists: added, then DELETED, and still published.
    const r1 = path.join(tmp, "deleted-later");
    initRepo(r1);
    commit(r1, "keys.txt", `${fakeCb58()}\n`, "add");
    rmSync(path.join(r1, "keys.txt"));
    git(["add", "-A"], { cwd: r1 });
    git(["commit", "-q", "-m", "remove the key"], { cwd: r1 });
    const s1 = scan(r1, emptyBaseline);
    cases.push(["key deleted in a later commit is STILL found", s1.red.length === 1]);

    // 2 — the false positive that made the first leak gate unreadable.
    const r2 = path.join(tmp, "prose");
    initRepo(r2);
    commit(r2, "NOTES.md", "scanned for secrets: no `PrivateKey-*` present\n", "prose");
    const s2 = scan(r2, emptyBaseline);
    cases.push(["prose mentioning PrivateKey-* is NOT a finding", s2.red.length === 0]);

    // 3 — this repo's history is full of sha256 values; they must not be verdicts.
    const r3 = path.join(tmp, "hashes");
    initRepo(r3);
    commit(r3, "CANON.txt", `genesis sha256 ${fakeHex()}\ntree ${fakeHex()}\n`, "hashes");
    const s3 = scan(r3, emptyBaseline);
    cases.push(["32-byte hex with no baseline match is amber, not red", s3.red.length === 0 && s3.hexUnknown === 2]);

    // 4 — and the same shape IS a verdict when it matches a key we know holds money.
    const r4 = path.join(tmp, "live-key");
    const live = fakeHex();
    const baselineFile = path.join(tmp, "chain-factory-key.txt");
    writeFileSync(baselineFile, `[chain-factory] wallet\n  EVM addr    : 0x${"a".repeat(40)}\n  EVM privkey : 0x${live}\n`);
    const baseline4 = loadBaseline([baselineFile], path.join(tmp, "no-store"));
    initRepo(r4);
    commit(r4, "deploy.md", `run with PK=0x${live}\n`, "oops");
    const s4 = scan(r4, baseline4);
    cases.push(["hex matching the live store is RED", s4.red.length === 1 && /live store/.test(s4.red[0].why)]);

    // 4b — 🔴 THE FALSE POSITIVE THE FIRST REAL RUN PRODUCED. A genesis file in the key store is
    // hundreds of 32-byte hashes; if the yardstick swallows those, every evidence bundle that
    // legitimately reprints them is reported as a leak (68 findings, all wrong).
    const genesisish = path.join(tmp, "genesis.json");
    writeFileSync(genesisish, JSON.stringify({ parentHash: `0x${fakeHex()}`, stateRoot: `0x${fakeHex()}` }, null, 2));
    cases.push(["a genesis file contributes NO baseline keys", loadBaseline([genesisish], path.join(tmp, "no-store")).hashes.size === 0]);

    // 5 — the shape h6b-backup.sh looks for, in the place it cannot look.
    const r5 = path.join(tmp, "pem");
    initRepo(r5);
    // 🔴 ASSEMBLED, NEVER WRITTEN OUT — and this is not fastidiousness, it is a measurement.
    // The first commit of this file spelled the header literally, and the very next run scored
    // `scripts/check-history-secrets.mjs` itself as a leak: the fixture had become a blob in the
    // history it scans. A gate that trips on its own source teaches exactly one behaviour —
    // adding an exception for itself — and an exception is a hole with a comment next to it.
    const pemHeader = ["-----BEGIN OPENSSH PRIVATE", "KEY-----"].join(" ");
    commit(r5, "id_rsa", `${pemHeader}\n${randomBytes(240).toString("base64")}\n`, "pem");
    const s5 = scan(r5, emptyBaseline);
    cases.push(["PEM block in history is RED", s5.red.length === 1]);

    // 5b — the blob this gate's own first commit left behind: a header with a nine-character
    // stub after it. No body, no key, no finding — measured, not exempted.
    const r5b = path.join(tmp, "pem-header-only");
    initRepo(r5b);
    commit(r5b, "doc.md", `example:\n${pemHeader}\nb3BlbnNza\n`, "header only");
    cases.push(["a PEM header with no body is NOT a finding", scan(r5b, emptyBaseline).red.length === 0]);

    // 6 — a key in a COMMIT MESSAGE is published too, and lives in no tree at all.
    const r6 = path.join(tmp, "commit-msg");
    initRepo(r6);
    commit(r6, "a.txt", "nothing here\n", `paste for the record: ${fakeCb58()}`);
    const s6 = scan(r6, emptyBaseline);
    cases.push(["key in a commit message is found", s6.red.length === 1]);

    // 7 — the mirror of hard rule #2: prove it can be GREEN, or a red gate proves nothing.
    const r7 = path.join(tmp, "clean");
    initRepo(r7);
    commit(r7, "README.md", "# clean repo\n", "clean");
    const s7 = scan(r7, emptyBaseline);
    cases.push(["a clean repo is GREEN", s7.red.length === 0]);

    // 8 — a clean scan with NO yardstick is "could not measure", never "clean".
    cases.push(["clean scan + empty baseline => exit 2", verdict(s7, emptyBaseline) === 2]);

    // 9 — and the yardstick being missing must NOT soften a finding into an environment problem.
    cases.push(["finding + empty baseline => exit 1, not 2", verdict(s1, emptyBaseline) === 1]);

    // 10 — an object too large to read is unmeasured, and unmeasured is not clean.
    cases.push([
      "skipped (oversize) object => exit 2",
      verdict({ red: [], skipped: [{ sha: "0".repeat(40), type: "blob", size: MAX_BYTES + 1 }] }, baseline4) === 2,
    ]);
  } finally {
    // 🔴 Clean up in the session that created it. Windows keeps pack files read-only, hence force.
    try { rmSync(tmp, { recursive: true, force: true, maxRetries: 3 }); } catch { /* reported below */ }
  }

  let bad = 0;
  for (const [name, ok] of cases) {
    console.log(`  ${ok ? "✓" : "🔴"} ${name}`);
    if (!ok) bad++;
  }
  console.log(`\n  ${cases.length - bad}/${cases.length} reverse controls passed`);
  return bad === 0 ? 0 : 1;
}

// ───────────────────────────── main ─────────────────────────────

function main() {
  if (SELF_TEST) return selfTest();

  console.log(`check-history-secrets — ${REPO}`);
  if (!existsSync(path.join(REPO, ".git"))) {
    console.log("  ⁇ not a git repository (no .git) — COULD NOT MEASURE");
    return 2;
  }

  const baseline = loadBaseline(EXTRA_SETS);
  let result;
  try {
    result = scan(REPO, baseline, { allObjects: ALL_OBJECTS });
  } catch (e) {
    console.log(`  ⁇ ${e.message}`);
    console.log("     COULD NOT MEASURE — that is not the same as clean.");
    return 2;
  }

  console.log(`  scope: ${result.scanned} objects read (${ALL_OBJECTS ? "whole object database" : "reachable from refs — what a push sends"})`);
  console.log(`  baseline: ${baseline.hashes.size} key(s) from ${baseline.files.length} file(s) in the live store`);

  for (const f of result.red) {
    console.log(`  🔴 ${f.why}`);
    console.log(`       object ${f.sha.slice(0, 12)} · ${f.type} · ${f.where}`);
  }
  if (result.hexUnknown) {
    console.log(`  🟡 ${result.hexUnknown} 32-byte hex token(s) matching no key in the live store`);
    console.log("       Same shape as a sha256, a tx hash and an EVM key. Shape cannot separate them;");
    console.log("       only the live store can, so these are reported, not judged.");
  }
  if (!ALL_OBJECTS && result.unreachable) {
    console.log(`  ℹ️  ${result.unreachable} object(s) in the database that no ref reaches — NOT sent by`);
    console.log("       any `git push` (mirror included) — but they DO travel in a filesystem copy of");
    console.log("       `.git`. Re-run with --all-objects to include them.");
  }
  for (const s of result.skipped) {
    console.log(`  ⁇ object ${s.sha.slice(0, 12)} skipped: ${s.size} bytes exceeds the ${MAX_BYTES}-byte cap — UNMEASURED`);
  }

  const code = verdict(result, baseline);
  if (code === 1) {
    console.log("\n🔴 KEY MATERIAL IS IN THE HISTORY. Do NOT make this repository public.");
    console.log("   Deleting the file does not help — the object is what gets published. The two real");
    console.log("   answers are: rewrite history and force-push before publishing, or rotate the key.");
    return 1;
  }
  if (code === 2) {
    if (baseline.hashes.size === 0) {
      console.log("\n  ⁇ THE LIVE KEY STORE COULD NOT BE READ.");
      console.log("     No shape-based finding either — but 32-byte hex could not be graded at all:");
      console.log("     with no yardstick, \"no match\" means nothing. COULD NOT MEASURE.");
    } else {
      console.log("\n  ⁇ Some objects were not read. \"Could not measure\" is not \"clean\".");
    }
    return 2;
  }
  console.log("\n✓ No key material in the published history.");
  console.log("  Scope is exactly what it says: objects, commit messages and tag messages. It says");
  console.log("  nothing about the working tree (`check-key-leaks.mjs`) or the server (`check-deploy-drift.mjs`).");
  return 0;
}

process.exit(main());
