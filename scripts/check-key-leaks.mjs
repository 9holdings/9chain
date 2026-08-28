#!/usr/bin/env node
/**
 * check-key-leaks.mjs — find fund private keys sitting OUTSIDE the places allowed to hold them.
 *
 * ═══ WHY THIS EXISTS ═══
 *
 * On 2026-08-28, while working B-16, a **byte-identical copy of the live g0 fund key set** was
 * found in an OS temp directory: `…\Temp\claude\…\<session>\scratchpad\kk\`. Four files —
 * `keys.txt` and `allocation.md` matching the primary set hash for hash, plus two deliberately
 * corrupted variants built as reverse-control cases the night before. They had been sitting
 * there for 20 hours, holding spend authority over ~9 billion LOVE9.
 *
 * 🔴 **No gate could see them, and each one was blind for its own reason:**
 *   - `check-net-dirs.mjs` only walks `local-net/` — this was under `%LOCALAPPDATA%\Temp`.
 *   - `o1-check.mjs` answers *"is THIS directory a good copy"*; it is never told where to look.
 *   - `check-deploy-drift.mjs` compares repo against server; this file was on neither.
 *
 * That is the shape of the whole failure class this repo keeps paying for: every gate was green
 * because **no gate was measuring this quantity at all**.
 *
 * ⚠️ It also caught out the first scan written that day, which searched by **filename + byte
 * size**. That found `keys.txt` but would have missed `keys-hong.txt` — a corrupted variant that
 * still carried every real private key. **Search by CONTENT, not by name.** A leaked key does
 * not care what it is called.
 *
 * ═══ WHAT IT MEASURES — AND THE VERSION OF IT THAT WAS WRONG ═══
 *
 * The first draft of this file, an hour later the same day, matched the literal `PrivateKey-`
 * and went red on **32 files**. Two of them were `PROGRESS.md` — tracked in git — and the match
 * there was the sentence *"scanned for secrets: no `PrivateKey-*` present"*. The gate was
 * measuring **the presence of a word**, not **the presence of a key**, and a gate that shouts
 * 32 lines of mostly-noise teaches people to stop reading it. That is this repo's most expensive
 * failure class landing on the very tool written to stop it.
 *
 * So it measures two things, in order:
 *   1. **Is it actually a key?** `PrivateKey-` followed by 40+ base58 characters. A doc
 *      mentioning `PrivateKey-*` is not a key and must not be reported as one.
 *   2. **Is it a key that holds money?** Every key found is hashed and compared against the keys
 *      in the live fund set. A match is 🔴 RED — spend authority sitting where nothing watches.
 *      Anything else is 🟡 reported but not blocking: drill-network keys litter the temp tree,
 *      and being red about them every single run is how a gate becomes wallpaper.
 *
 * 🔴 **Key material is never printed** — comparison is by SHA-256 of the key string only.
 *
 * ⚠️ **Scope is honest, not total.** It searches the roots below, not the whole disk: a full
 * `C:` content scan takes many minutes and a gate nobody runs is not a gate. Anything outside
 * these roots is **unmeasured, which is not the same as clean** — hence exit 2 when a root
 * cannot be read, and exit 2 when the fund set itself cannot be read (with no baseline, "no
 * match" would mean nothing at all).
 *
 * Exit codes: `0` no fund key leaked · `1` fund key leaked · `2` could not measure.
 *
 * Usage:
 *   node scripts/check-key-leaks.mjs
 *   node scripts/check-key-leaks.mjs --root <dir>          # add a root (repeatable)
 *   node scripts/check-key-leaks.mjs --fund-set <keys.txt> # compare against a different set
 *   node scripts/check-key-leaks.mjs --self-test           # reverse controls
 */
import { readdirSync, readFileSync, statSync, existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir, homedir } from "node:os";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const SELF_TEST = argv.includes("--self-test");
const EXTRA_ROOTS = argv.reduce((acc, a, i) => (a === "--root" && argv[i + 1] ? [...acc, argv[i + 1]] : acc), []);
const opt = (flag, fallback) => {
  const i = argv.indexOf(flag);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};

const HOME = homedir();
/**
 * 🔴 A KEY, not the word "key". avalanchego serialises private keys as `PrivateKey-` + cb58,
 * which is base58 (no `0OIl`) and runs to about 51 characters. Requiring 40+ of them is what
 * separates a real key from `PrivateKey-*` written in a sentence — the false positive that made
 * the first version of this gate report two git-tracked documents as leaks.
 */
const KEY_RE = /PrivateKey-[1-9A-HJ-NP-Za-km-z]{40,}/g;
const MARKER = "PrivateKey-";
const FUND_SET = opt("--fund-set", path.join(HOME, "9chain-a1-keys", "g0", "keys.txt"));
const MAX_BYTES = 200_000;
const TEXT_EXT = new Set([".txt", ".md", ".json", ".env", ".key", ".bak", ".csv", ".log", ".yml", ".yaml", ""]);

/** Directory names never worth walking: huge, and none of them is where a key gets forgotten. */
const SKIP_DIRS = new Set([
  "node_modules", ".git", ".next", "dist", "build", "vendor", "__pycache__",
  ".cache", ".gradle", ".conda", "miniconda3", "go", "npm-cache", "AppData\\Roaming",
]);

const ROOTS = [
  process.env.TEMP,
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Temp") : null,
  path.join(HOME, "Downloads"),
  path.join(HOME, "Documents"),
  path.join(HOME, "Desktop"),
  path.join(HOME, "OneDrive"),
  ROOT,
  ...EXTRA_ROOTS,
].filter(Boolean);

/**
 * 🔴 Places ALLOWED to hold fund keys — and every entry needs a reason, because a careless
 * addition here is how a gate blinds itself. `check-net-dirs.mjs` already interrogates
 * `local-net/net*` file by file (that is where B-19's traps live); duplicating it here would
 * only produce noise that trains people to ignore this gate.
 */
const ALLOWED = [
  { at: path.join(HOME, "9chain-a1-keys"), why: "the official fund key store (D-085)" },
  { at: path.join(ROOT, "local-net"), why: "covered file-by-file by check-net-dirs.mjs" },
  { at: path.join(ROOT, "upstream", "avalanchego"), why: "upstream test keys, public in the avalanchego repo" },
  { at: path.join(ROOT, "docs", "evidence"), why: "byte-frozen evidence bundles — never edited" },
  { at: path.join(ROOT, "patches"), why: "byte-frozen fork patch set" },
];

const isAllowed = (file) => ALLOWED.find((a) => !path.relative(a.at, file).startsWith(".."));

function walk(dir, out, unreadable, depth = 0) {
  if (depth > 12) return;
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); }
  catch (e) { if (e.code !== "ENOENT" && e.code !== "EACCES" && e.code !== "EPERM") unreadable.push(`${dir}: ${e.code}`); return; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(full, out, unreadable, depth + 1);
    } else if (e.isFile()) {
      if (!TEXT_EXT.has(path.extname(e.name).toLowerCase())) continue;
      let st;
      try { st = statSync(full); } catch { continue; }
      if (st.size > MAX_BYTES || st.size === 0) continue;
      let body;
      try { body = readFileSync(full, "latin1"); } catch { continue; }
      if (!body.includes(MARKER)) continue;
      const keys = body.match(KEY_RE);
      // The word without a key behind it is a mention, not a leak. Silently skipping these is
      // the whole difference between a gate people read and a gate people mute.
      if (!keys) continue;
      out.push({ file: full, digests: new Set(keys.map(keyDigest)) });
    }
  }
}

/** SHA-256 of the key string. Key material itself is never held beyond this call, never printed. */
const keyDigest = (k) => createHash("sha256").update(k).digest("hex");

/** Digests of every key in the live fund set — the baseline that turns "a key" into "money". */
function fundSetDigests(file) {
  if (!existsSync(file)) return null;
  let body;
  try { body = readFileSync(file, "latin1"); } catch { return null; }
  const keys = body.match(KEY_RE);
  if (!keys || !keys.length) return null;
  return new Set(keys.map(keyDigest));
}

function scan(roots) {
  const found = [];
  const unreadable = [];
  const seen = new Set();
  for (const r of roots) {
    if (!existsSync(r)) continue;
    const hits = [];
    walk(path.resolve(r), hits, unreadable);
    for (const h of hits) if (!seen.has(h.file)) { seen.add(h.file); found.push(h); }
  }
  return { found, unreadable };
}

function run({ roots = ROOTS, fundSet = FUND_SET, quiet = false } = {}) {
  const say = (...a) => { if (!quiet) console.log(...a); };
  say("\n══ FUND KEY LEAKS — spend authority sitting where nothing watches ══");
  say(`   roots searched: ${roots.length}`);

  // 🔴 No baseline ⇒ every "no match" below would be meaningless. That is *don't know*, and
  // *don't know* must never leave through the green door.
  const fund = fundSetDigests(fundSet);
  if (!fund) {
    say(`\n🟡 INCONCLUSIVE — cannot read the fund key set at ${fundSet}`);
    say("   Without it, 'this key is not a fund key' is an assumption, not a measurement.");
    return { code: 2, critical: [], other: [] };
  }
  say(`   fund keys in the baseline: ${fund.size}  (${path.basename(fundSet)})`);

  const { found, unreadable } = scan(roots);
  const outside = found.filter((f) => !isAllowed(f.file));
  const inside = found.filter((f) => isAllowed(f.file));

  const critical = outside.filter((f) => [...f.digests].some((d) => fund.has(d)));
  const other = outside.filter((f) => ![...f.digests].some((d) => fund.has(d)));

  say(`   files holding a real key: ${found.length}  (in allowed places ${inside.length} · outside ${outside.length})`);

  if (!quiet && inside.length) {
    const byPlace = new Map();
    for (const f of inside) {
      const a = isAllowed(f.file);
      byPlace.set(a.why, (byPlace.get(a.why) || 0) + 1);
    }
    say("");
    for (const [why, n] of byPlace) say(`   ok  ${String(n).padStart(3)} file(s) — ${why}`);
  }

  if (unreadable.length) {
    say(`\n🟡 ${unreadable.length} location(s) could not be read — UNMEASURED, not clean:`);
    for (const u of unreadable.slice(0, 10)) say(`     ${u}`);
    return { code: 2, critical, other };
  }

  if (other.length) {
    say(`\n🟡 ${other.length} file(s) hold a key that is NOT in the fund set — reported, not blocking:`);
    for (const f of other.slice(0, 12)) say(`     ${f.file}`);
    if (other.length > 12) say(`     … and ${other.length - 12} more`);
    say("   Mostly drill-network key sets. Being red about these every run is how a gate");
    say("   becomes wallpaper — but they are still litter, and litter is where mistakes start.");
  }

  if (critical.length) {
    say(`\n🔴 FAIL — ${critical.length} file(s) hold a key from the LIVE FUND SET:`);
    for (const f of critical) say(`     ${f.file}`);
    say("\n   This is spend authority over the running network, outside every watched place.");
    say("   Do NOT delete by directory. Verify sha256 FILE BY FILE against the primary set in");
    say(`   ${path.dirname(fundSet)}, confirm it is a duplicate and not the only copy,`);
    say("   and only then overwrite and remove. (gotcha 17 · D-107 · D-117)");
    return { code: 1, critical, other };
  }

  say("\n✅ PASS — no key from the live fund set sits outside a place allowed to hold one.");
  return { code: 0, critical, other };
}

// ═════ REVERSE CONTROL ═════
// A gate nobody has seen go red is not a gate (hard rule #2). This plants a decoy in a temp
// directory that is inside the searched roots but outside the allow-list, and requires RED.
function selfTest() {
  const dir = mkdtempSync(path.join(tmpdir(), "leak-control-"));
  // Two DIFFERENT well-formed keys, and a stand-in fund set holding only the first. No real key
  // material is written anywhere — the gate compares digests, so fakes exercise it exactly.
  const FUND_KEY = `PrivateKey-${"A".repeat(51)}`;
  const OTHER_KEY = `PrivateKey-${"B".repeat(51)}`;
  const fundSet = path.join(dir, "fund-keys.txt");
  writeFileSync(fundSet, `[foundation]\n  PrivateKey : ${FUND_KEY}\n`);

  const leakedFund = path.join(dir, "leak", "keys.txt");
  const leakedOther = path.join(dir, "drill", "keys.txt");
  const mentionOnly = path.join(dir, "docs", "PROGRESS.md");
  for (const [p, body] of [
    [leakedFund, `[foundation]\n  PrivateKey : ${FUND_KEY}\n`],
    [leakedOther, `[drill]\n  PrivateKey : ${OTHER_KEY}\n`],
    // 🔴 THE CASE THAT BURNED THIS GATE'S FIRST DRAFT: a document that merely names the marker.
    [mentionOnly, "Scanned for secrets: no `PrivateKey-*` / private keys present.\n"],
  ]) {
    mkdirSync(path.dirname(p), { recursive: true });
    writeFileSync(p, body);
  }

  let failures = 0;
  const check = (name, got, want) => {
    if (got === want) console.log(`  ✓ "${name}" → correct, exit ${got}`);
    else { console.log(`  ✗ "${name}" → WRONG: expected ${want}, got ${got}`); failures++; }
  };

  console.log("\n══ REVERSE CONTROLS ══");
  check("LIVE FUND key outside allowed places ⇒ 1 (RED)",
    run({ roots: [path.dirname(leakedFund)], fundSet, quiet: true }).code, 1);
  check("🔴 doc that only MENTIONS `PrivateKey-*` ⇒ 0, must NOT be called a leak",
    run({ roots: [path.dirname(mentionOnly)], fundSet, quiet: true }).code, 0);
  check("key that is NOT in the fund set ⇒ 0 (reported 🟡, not blocking)",
    run({ roots: [path.dirname(leakedOther)], fundSet, quiet: true }).code, 0);
  check("fund set unreadable ⇒ 2, NOT 0 (no baseline = no measurement)",
    run({ roots: [path.dirname(leakedFund)], fundSet: path.join(dir, "absent.txt"), quiet: true }).code, 2);
  // Location, not content: the same fund key inside an allowed place must be green.
  const allowedRoot = ALLOWED[0].at;
  if (existsSync(allowedRoot)) {
    check("real fund set in its official store ⇒ 0 (gate discriminates by PLACE)",
      run({ roots: [allowedRoot], quiet: true }).code, 0);
  }
  rmSync(path.dirname(leakedFund), { recursive: true, force: true });
  check("leak removed ⇒ 0 (the gate stops shouting once it is fixed)",
    run({ roots: [path.dirname(leakedFund)], fundSet, quiet: true }).code, 0);

  rmSync(dir, { recursive: true, force: true });
  return failures;
}

if (SELF_TEST) {
  const failures = selfTest();
  console.log(`\n${failures ? "✗" : "✅"} reverse controls: ${failures} case(s) wrong`);
  process.exit(failures ? 1 : 0);
}

process.exit(run().code);
