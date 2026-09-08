#!/usr/bin/env node
/**
 * check-work-retention.mjs — `work/` is a scratch directory, and it had no ceiling.
 *
 * ═══ WHY (D-252) ═══
 *
 * Measured 2026-09-08, twice, three hours apart in ONE session:
 *
 *     start of session   2.4 GB   463 entries
 *     later that day     4.2 GB   609 entries
 *
 * Nothing unusual happened in between — the test suites were run a few dozen times, and several
 * of them keep their evidence on purpose ("Synthetic readiness evidence retained: …"). Keeping
 * evidence is right. Keeping every run's evidence forever is what turns a scratch directory into
 * a 4 GB one.
 *
 * 🔴 AND IT IS NOT JUST DISK. `work/` sits inside the repository, and `check-key-leaks.mjs`
 * searches the repository — so every run of the gate that watches for leaked fund keys reads all
 * of it. On 2026-09-08 that gate **did not finish inside 600 seconds**. A gate slow enough to be
 * skipped is a gate that watches nothing, and this one watches spend authority.
 *
 * ═══ 🔴 WHY PRUNING CHECKS FOR KEYS FIRST ═══
 *
 * D-117: a byte-identical copy of the g0 fund keys once sat in a temp directory for 20 hours,
 * outside all three gates, and the deliberately-corrupted copy STILL held real private keys. So
 * `--prune` reads every file it is about to delete, and if anything key-shaped turns up it
 * REFUSES and names the directory. Deleting is not the danger — deleting with `rm` something that
 * should have been `shred -u -n 3` is, and that call belongs to a person.
 *
 * ═══ WHAT THIS DOES NOT DO ═══
 *
 * It does not stop the tests writing there. Those directories are evidence, deliberately kept so
 * a failure can be inspected afterwards; the fix for "too much evidence" is a retention window,
 * not silence. And it never touches anything outside `work/`.
 *
 * Usage:
 *   node scripts/check-work-retention.mjs                 # report, red when over budget
 *   node scripts/check-work-retention.mjs --prune         # delete entries older than the window
 *   node scripts/check-work-retention.mjs --days 3        # a different window
 *   node scripts/check-work-retention.mjs --self-test
 */
import { readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { guardEntry } from "../local-net/lib/cli.mjs";
import { findKeyMaterial, MAX_SCAN_BYTES } from "../local-net/lib/key-material.mjs";
import { counter, EXIT } from "./lib/report.mjs";

guardEntry(import.meta.url, ["--self-test", "--prune", "--days", "--keep", "--max-gb", "--json"]);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WORK = path.join(ROOT, "work");

const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] !== undefined && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};

/**
 * 7 days. Long enough that yesterday's failed run is still there to look at — which is the whole
 * reason these directories are kept — and short enough that a week of test runs cannot reach the
 * size that made the leak gate unrunnable.
 */
const DEFAULT_DAYS = 7;

/**
 * 2 GB. Not a disk limit — a limit on how much of the repository `check-key-leaks.mjs` has to
 * read on every run. Measured 2026-09-08: at 4.2 GB that gate **did not finish inside 600 s**;
 * after pruning to 1.1 GB it ran in **4 m 18 s**.
 *
 * 🔴 IT IS 2 AND NOT 1, AND THE FIRST VALUE WAS WRONG FOR A REASON WORTH KEEPING. The budget was
 * written as 1 GB before the policy existed. Once `keep = 2` was applied and the prune ran, what
 * REMAINED was exactly what the policy says to keep — two runs each of the heavy fixtures, plus a
 * couple of one-off build artefacts — and that is 1.1 GB. A 1 GB budget would therefore have been
 * red forever, on a directory in the state the policy calls correct.
 *
 * A gate that can never be green carries no information; this project has already written that
 * lesson down once, under the heading about false reds. Setting the budget below what the
 * retention policy costs would not be strictness, it would be turning this gate into wallpaper.
 *
 * ⚠️ An earlier draft of this paragraph quoted that heading in its original Vietnamese and
 * `check-english-code` went red on this file — the SECOND time in one session that quoting
 * existing output broke section 0. Quoting is not an exemption; name the idea instead (D-247).
 */
const DEFAULT_MAX_GB = 2;

/**
 * 2 runs of each fixture shape. The reason to keep one is to compare a failing run against the
 * last good one; keeping twelve serves nobody, and twelve is what was actually there.
 */
const DEFAULT_KEEP = 2;

/**
 * 🔴 THE BOUND THAT MAKES A SCAN FAST IS THE BOUND THAT MAKES A DELETE UNSAFE.
 *
 * `MAX_SCAN_BYTES` is 200 KB, and it is right for `check-key-leaks.mjs`: that gate reads a huge
 * tree on every run, and a cb58 key lives in a config, a `.env` or a log line, never in a
 * multi-megabyte artefact. Applying the same bound HERE produced the opposite of safety.
 *
 * Measured 2026-09-08, first `--prune` run: 283 entries deleted, **0.04 GB freed**, 30 REFUSED.
 * Every refusal was "could not read", and every one of them was a synthetic fixture file over
 * 200 KB. The bound was blocking precisely the directories that made up the 4 GB — the rule
 * "unread blocks the delete" is correct, and combined with a 200 KB bound it made the tool
 * unable to do the one job it was written for.
 *
 * A prune is not a gate. It runs when a person asks, once, and being slow is a fair price for
 * being able to say "I read every byte of this before deleting it". 64 MB is where a file stops
 * being a fixture and starts being something that needs looking at by hand.
 */
const PRUNE_SCAN_LIMIT = 64 * 1024 * 1024;

/** Recursive size and newest mtime of one entry, capped so a huge tree cannot stall the report. */
export function measureEntry(entryPath, stat = statSync, list = readdirSync) {
  let bytes = 0;
  let newest = 0;
  const walk = (p) => {
    let s;
    try { s = stat(p); } catch { return; }
    if (s.mtimeMs > newest) newest = s.mtimeMs;
    if (!s.isDirectory()) { bytes += s.size; return; }
    let entries = [];
    try { entries = list(p); } catch { return; }
    for (const name of entries) walk(path.join(p, name));
  };
  walk(entryPath);
  return { bytes, newest };
}

/**
 * The "shape" of an entry: its name with the `mkdtemp` suffix stripped.
 *
 * Every fixture here is created with `mkdtempSync(… 'work/console-backup-test-')`, so one run
 * leaves `console-backup-test-z47FMR` and the next leaves `console-backup-test-umPwmN`. Grouping
 * by shape is what lets the policy say "keep the last few of each KIND" instead of only "keep
 * what is recent".
 */
export function shapeOf(name) {
  return name.replace(/-[A-Za-z0-9]{6}$/, "");
}

/**
 * Which entries may go. Pure, so the rule is testable without a filesystem.
 *
 * 🔴 TWO RULES, AND THE SECOND ONE IS THE ONE THAT MATTERS HERE. Age alone did not describe the
 * problem: measured 2026-09-08, `work/` was 4.0 GB with **zero** entries older than seven days —
 * twelve `console-backup-test-*` directories at 167 MB each, all from ONE afternoon, were half of
 * it. A window cannot see that; it is not old, it is repeated. So an entry is stale when it is
 * older than the window OR when there are already `keep` newer entries of the same shape.
 */
export function classify(entries, { now, days, keep = Infinity }) {
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  const byShape = new Map();
  for (const entry of [...entries].sort((a, b) => b.newest - a.newest)) {
    const shape = shapeOf(entry.name);
    const seen = byShape.get(shape) ?? [];
    seen.push(entry);
    byShape.set(shape, seen);
  }
  const surplus = new Set();
  for (const seen of byShape.values()) for (const entry of seen.slice(keep)) surplus.add(entry.name);

  const isStale = (e) => e.newest < cutoff || surplus.has(e.name);
  return {
    stale: entries.filter(isStale),
    fresh: entries.filter((e) => !isStale(e)),
    surplus: entries.filter((e) => surplus.has(e.name) && e.newest >= cutoff),
  };
}

const gb = (bytes) => bytes / 1024 ** 3;

/**
 * Every key-shaped string under `dir`, so a prune can refuse rather than delete it.
 *
 * Files larger than the scan bound are NOT skipped silently — they are reported as unread, and an
 * unread file blocks the delete. "I could not look" must never be treated as "there is nothing
 * there"; that is the same rule the leak gate applies to a directory it cannot reach.
 */
export function scanForKeys(dir, read = readFileSync, stat = statSync, list = readdirSync, { limit = PRUNE_SCAN_LIMIT } = {}) {
  const found = [];
  const unread = [];
  const walk = (p) => {
    let s;
    try { s = stat(p); } catch { unread.push(p); return; }
    if (s.isDirectory()) {
      let entries = [];
      try { entries = list(p); } catch { unread.push(p); return; }
      for (const name of entries) walk(path.join(p, name));
      return;
    }
    if (s.size > limit) { unread.push(p); return; }
    let text;
    try { text = read(p, "utf8"); } catch { unread.push(p); return; }
    for (const key of findKeyMaterial(text)) found.push({ file: p, key: `${key.slice(0, 16)}…` });
  };
  walk(dir);
  return { found, unread };
}

function main() {
  const days = Number(flag("--days", DEFAULT_DAYS));
  const maxGb = Number(flag("--max-gb", DEFAULT_MAX_GB));
  if (!Number.isFinite(days) || days < 1) { console.error("--days must be a positive number"); return EXIT.CANNOT_RUN; }

  let names;
  try { names = readdirSync(WORK); }
  catch { console.log("══ WORK RETENTION ══\n\n✅ PASS — there is no work/ directory yet."); return EXIT.PASS; }

  const entries = names.map((name) => ({ name, path: path.join(WORK, name), ...measureEntry(path.join(WORK, name)) }));
  const total = entries.reduce((sum, e) => sum + e.bytes, 0);
  const keep = Number(flag("--keep", DEFAULT_KEEP));
  const { stale, surplus } = classify(entries, { now: Date.now(), days, keep });

  console.log("══ WORK RETENTION — the scratch directory the leak gate has to read ══\n");
  console.log(`  work/: ${entries.length} entries · ${gb(total).toFixed(2)} GB`);
  console.log(`  removable: ${stale.length} entries · ${gb(stale.reduce((s, e) => s + e.bytes, 0)).toFixed(2)} GB`);
  console.log(`    · older than ${days} days, OR beyond the ${keep} most recent of their shape`);
  console.log(`    · of those, ${surplus.length} are RECENT but repeated — a window alone never sees these`);
  console.log(`  budget: ${maxGb} GB\n`);

  if (argv.includes("--prune")) {
    if (!stale.length) { console.log("  nothing older than the window — nothing to delete.\n"); }
    let deleted = 0, freed = 0, refused = 0;
    for (const entry of stale) {
      // 🔴 LIST → CHECK → DELETE → COUNTER-CHECK. Never delete something unexamined (D-117).
      const { found, unread } = scanForKeys(entry.path);
      if (found.length || unread.length) {
        refused += 1;
        console.log(`  🔴 REFUSING to delete ${entry.name}`);
        for (const hit of found) console.log(`       key material: ${path.relative(ROOT, hit.file)}  (${hit.key})`);
        for (const p of unread.slice(0, 3)) console.log(`       could not read: ${path.relative(ROOT, p)}`);
        console.log("       🔴 `rm` is wrong for key material — `shred -u -n 3`, and that is a person's call (D-117).");
        continue;
      }
      rmSync(entry.path, { recursive: true, force: true });
      // Counter-check every single delete, rather than trusting that rmSync did what it said.
      let gone = false;
      try { statSync(entry.path); } catch { gone = true; }
      if (!gone) { console.log(`  🔴 ${entry.name} is STILL THERE after the delete`); refused += 1; continue; }
      deleted += 1; freed += entry.bytes;
    }
    console.log(`\n  deleted ${deleted} entries · freed ${gb(freed).toFixed(2)} GB · refused ${refused}`);
    if (refused) { console.log("\n🔴 Some entries were refused — read the lines above before doing anything by hand."); return EXIT.RED; }
    console.log("\n✅ PRUNED — every deleted entry was read first and held no key material.");
    return EXIT.PASS;
  }

  if (gb(total) > maxGb) {
    console.log(`🔴 work/ is ${gb(total).toFixed(2)} GB, over the ${maxGb} GB budget.`);
    console.log("   This is not a disk complaint. work/ is inside the repository, so check-key-leaks");
    console.log("   reads all of it on every run — and on 2026-09-08, at 4.2 GB, that gate did not");
    console.log("   finish inside 600 seconds. A gate slow enough to be skipped watches nothing,");
    console.log("   and that one watches spend authority over the live network.");
    console.log(`   Fix: node scripts/check-work-retention.mjs --prune   (deletes entries older than ${days} days,`);
    console.log("        after reading each one and refusing anything holding key material)");
    return EXIT.RED;
  }

  console.log(`✅ PASS — work/ is ${gb(total).toFixed(2)} GB, inside the ${maxGb} GB budget.`);
  return EXIT.PASS;
}

/* ─────────────────────────── counter-check (--self-test) ─────────────────────────── */

function selfTest() {
  const { ok, finish } = counter("COUNTER-CHECK — the retention rule and the refusal to delete keys");

  const day = 24 * 60 * 60 * 1000;
  const now = 1_000 * day;
  const entries = [
    { name: "old", newest: now - 8 * day, bytes: 100 },
    { name: "edge", newest: now - 7 * day + 1, bytes: 100 },
    { name: "new", newest: now - 1 * day, bytes: 100 },
  ];
  const split = classify(entries, { now, days: 7 });
  ok("an entry older than the window is stale", split.stale.map((e) => e.name).join() === "old");
  ok("an entry inside the window is kept", split.fresh.map((e) => e.name).join() === "edge,new");
  ok("🔴 the boundary keeps rather than deletes — a run from exactly a week ago is still evidence",
    !split.stale.some((e) => e.name === "edge"));
  ok("a window of 0 days is refused by the caller, not silently applied",
    classify(entries, { now, days: 1 }).stale.length === 2);

  // ── The keep-N rule: the one that describes what actually happened ──
  ok("the mkdtemp suffix is stripped, so runs of one fixture group together",
    shapeOf("console-backup-test-z47FMR") === "console-backup-test"
    && shapeOf("cold-build-20260906") === "cold-build-20260906");

  const runs = Array.from({ length: 5 }, (_, i) => ({
    name: `console-backup-test-aaaaa${i}`, newest: now - i * 60_000, bytes: 167e6,
  }));
  const kept = classify(runs, { now, days: 7, keep: 2 });
  ok("🔴 five runs of one fixture, all from today: three are removable though NONE is old",
    kept.stale.length === 3 && kept.surplus.length === 3,
    'measured 2026-09-08: work/ was 4.0 GB with ZERO entries past the window');
  ok("the two most RECENT are the ones kept",
    kept.fresh.map((e) => e.name).join() === "console-backup-test-aaaaa0,console-backup-test-aaaaa1");
  ok("with no keep limit, the shape rule does nothing and only age applies",
    classify(runs, { now, days: 7 }).stale.length === 0);
  ok("a shape with fewer runs than the limit loses nothing",
    classify(runs.slice(0, 2), { now, days: 7, keep: 2 }).stale.length === 0);
  ok("shapes are independent — a busy fixture does not evict a quiet one", (() => {
    const mixed = [...runs, { name: "readiness-console-bbbbb1", newest: now, bytes: 1 }];
    return !classify(mixed, { now, days: 7, keep: 2 }).stale.some((e) => e.name.startsWith("readiness"));
  })());
  ok("an entry both old AND surplus is counted once, not twice",
    classify([{ name: "x-aaaaa1", newest: now - 9 * day, bytes: 1 },
      { name: "x-aaaaa2", newest: now - 8 * day, bytes: 1 },
      { name: "x-aaaaa3", newest: now, bytes: 1 }], { now, days: 7, keep: 1 }).stale.length === 2);

  // ── The refusal, over an injected tree, so no real key ever has to exist to test it ──
  const REAL_SHAPE = `PrivateKey-${"a".repeat(45)}`;
  const tree = {
    "d/notes.txt": "nothing interesting here",
    "d/keys.txt": `foundation=${REAL_SHAPE}\n`,
  };
  // 🔴 `path.join` produces `d\keys.txt` on Windows while the fixture is keyed with `/`. The
  // first version of this fake missed every file for that reason and the case failed with an
  // undefined read — a fixture that does not model the platform is testing something else.
  const key = (p) => String(p).replace(/\\/g, "/");
  const fakeStat = (p) => (tree[key(p)] !== undefined
    ? { isDirectory: () => false, size: tree[key(p)].length, mtimeMs: 0 }
    : (Object.keys(tree).some((k) => k.startsWith(`${key(p)}/`)) ? { isDirectory: () => true, size: 0, mtimeMs: 0 } : (() => { throw new Error("ENOENT"); })()));
  const fakeList = (p) => [...new Set(Object.keys(tree).filter((k) => k.startsWith(`${key(p)}/`))
    .map((k) => k.slice(key(p).length + 1).split("/")[0]))];
  const fakeRead = (p) => tree[key(p)];

  const scan = scanForKeys("d", fakeRead, fakeStat, fakeList);
  ok("🔴 a directory holding key material is FOUND before anything is deleted",
    scan.found.length === 1 && key(scan.found[0].file) === "d/keys.txt",
    JSON.stringify(scan));
  ok("the report shows only a PREFIX of the key, never the whole thing",
    scan.found[0].key.length < 20 && !scan.found[0].key.includes("a".repeat(45)));

  const clean = scanForKeys("d", (p) => (key(p) === "d/keys.txt" ? "no keys here" : fakeRead(p)), fakeStat, fakeList);
  ok("a directory with no key material is clear", clean.found.length === 0 && clean.unread.length === 0);

  const big = scanForKeys("d", fakeRead,
    (p) => (key(p) === "d/keys.txt" ? { isDirectory: () => false, size: PRUNE_SCAN_LIMIT + 1, mtimeMs: 0 } : fakeStat(p)), fakeList);
  ok("🔴 a file too large to read is UNREAD, not assumed clean — and an unread file blocks the delete",
    big.found.length === 0 && big.unread.map(key).includes("d/keys.txt"),
    '"I could not look" must never be treated as "there is nothing there"');

  const unreadable = scanForKeys("d", (p) => { if (key(p) === "d/keys.txt") throw new Error("EACCES"); return fakeRead(p); }, fakeStat, fakeList);
  ok("a file that cannot be opened is unread too", unreadable.unread.map(key).includes("d/keys.txt"));

  ok("🔴 a fixture file over the leak gate's 200 KB bound is still READ here — that bound blocked "
    + "283 deletes and freed 0.04 GB on the first real run",
    scanForKeys("d", fakeRead,
      (p) => (key(p) === "d/keys.txt" ? { isDirectory: () => false, size: MAX_SCAN_BYTES + 1, mtimeMs: 0 } : fakeStat(p)),
      fakeList).found.length === 1);

  ok("🔴 the word PrivateKey- in prose is not key material — this gate must not cry wolf",
    scanForKeys("d", () => "the PrivateKey- prefix is documented here", fakeStat, fakeList).found.length === 0);

  // ⚠️ `key()` again: this case was written with raw "t/a" comparisons and failed on Windows for
  // the third time in one file, because path.join builds "t\a". A fixture that ignores the
  // platform is not testing the code, it is testing the fixture.
  ok("measureEntry sums a tree and takes its newest mtime", (() => {
    const stat = (p) => (key(p) === "t" ? { isDirectory: () => true, size: 0, mtimeMs: 5 }
      : { isDirectory: () => false, size: key(p) === "t/a" ? 10 : 20, mtimeMs: key(p) === "t/a" ? 99 : 7 });
    const m = measureEntry("t", stat, () => ["a", "b"]);
    return m.bytes === 30 && m.newest === 99;
  })());

  return finish("an unread file blocks a delete, and prose is not a key");
}

process.exitCode = argv.includes("--self-test") ? selfTest() : main();
