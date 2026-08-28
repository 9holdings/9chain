#!/usr/bin/env node
/**
 * check-evidence.mjs — gate: **can each evidence bundle still verify itself?**
 *
 * ═══ 🔴 WHY IT EXISTS — it came out of a real mistake, on 2026-08-28 ═══
 *
 * The O2 procedure ("export before deleting") packages the chain's state together with a
 * `MANIFEST.txt` holding the `sha256` **of every file in the bundle**. The bundle's value
 * IS that the hashes match: a bundle that cannot verify itself is no longer evidence, it is
 * just some old files.
 *
 * That day, a sweep renamed CLI flags "across every text file". It rewrote a flag name
 * **inside `00-DOC-TRUOC.md` of the evidence bundles** — both O2 bundles dropped from 9/9
 * to 7/9, and **nothing said a word**. It only surfaced because someone happened to run
 * `sha256sum -c` while doing something else. The same sweep also touched one line in
 * `patches/0006`, and THAT was caught within seconds — because hard rule #3 has a gate.
 * Evidence had none.
 *
 * ⇒ The lesson, broader than either case: **anything that must be frozen byte-for-byte needs
 * a gate that watches bytes.** A convention living in the head of whoever writes the next
 * script stops nothing.
 *
 * ═══ WHAT THIS GATE MEASURES ═══
 *
 * The `sha256` **actually on disk** against the `sha256` **the bundle claims**. It does not
 * read git: an evidence bundle must stand on its own, even lifted out of the repo — that is
 * its entire reason to exist.
 *
 * ⚠️ It does NOT say the bundle described the truth at the time. It says only that the bundle
 * **has not been modified since it was sealed**. Two different questions; reading one as the
 * other is the "measuring the wrong quantity" failure this project keeps paying for.
 *
 * ═══ EXIT CODES ═══
 *   0  PASS          — every bundle matches byte for byte
 *   1  FAIL          — a file's hash differs, or a file named in the manifest is gone
 *   2  INCONCLUSIVE  — a manifest could not be read (⚠️ NOT the same as "clean")
 *
 * Usage:
 *   node scripts/check-evidence.mjs
 *   node scripts/check-evidence.mjs --self-test
 */
import { readFileSync, readdirSync, statSync, existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SELF_TEST = process.argv.includes("--self-test");
const MANIFEST_NAMES = new Set(["MANIFEST.txt", "SHA256SUMS.txt"]);

const sha256 = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

/** Find every manifest file beneath a root. */
export function findManifests(root) {
  const out = [];
  const walk = (dir) => {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (MANIFEST_NAMES.has(e.name)) out.push(full);
    }
  };
  walk(root);
  return out.sort();
}

/**
 * Parse a `sha256sum`-style manifest. Accepts BOTH line shapes:
 *   `<hash>  <path>`   (text mode)
 *   `<hash> *<path>`   (binary mode — `sha256sum -b`, which `SHA256SUMS.txt` uses)
 * Missing the second shape makes the gate read ZERO entries and then report GREEN — silently,
 * and wrongly.
 */
export function parseManifest(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    const m = /^([0-9a-fA-F]{64})\s+\*?(.+?)\s*$/.exec(line);
    if (m) rows.push({ hash: m[1].toLowerCase(), file: m[2].replace(/\\/g, "/") });
  }
  return rows;
}

/** Verify one bundle. Returns {ok, missing, mismatch, total}. */
export function verifyBundle(manifestPath) {
  const dir = path.dirname(manifestPath);
  const rows = parseManifest(readFileSync(manifestPath, "utf8"));
  const missing = [], mismatch = [];
  for (const r of rows) {
    const f = path.join(dir, r.file);
    if (!existsSync(f) || !statSync(f).isFile()) { missing.push(r.file); continue; }
    if (sha256(f) !== r.hash) mismatch.push(r.file);
  }
  return { ok: rows.length - missing.length - mismatch.length, missing, mismatch, total: rows.length };
}

function main() {
  const manifests = findManifests(path.join(ROOT, "docs"));
  if (manifests.length === 0) {
    console.log("⁇ INCONCLUSIVE — no manifest found under docs/.");
    console.log("   'Found nothing' is NOT 'nothing to watch': check the path.");
    return 2;
  }
  console.log(`\n══ EVIDENCE — ${manifests.length} bundle(s) ══\n`);
  let bad = 0, unresolved = 0;
  for (const m of manifests) {
    const rel = path.relative(ROOT, m).replace(/\\/g, "/");
    let r;
    try { r = verifyBundle(m); } catch (e) {
      unresolved++; console.log(`  ⁇ ${rel}\n     INCONCLUSIVE — ${e.message}`); continue;
    }
    if (r.total === 0) {
      unresolved++;
      console.log(`  ⁇ ${rel}\n     INCONCLUSIVE — the manifest has no readable hash line`);
      continue;
    }
    const mark = r.missing.length + r.mismatch.length === 0 ? "✓" : "🔴";
    console.log(`  ${mark} ${rel}   ${r.ok}/${r.total} match`);
    for (const f of r.mismatch) console.log(`       🔴 HASH DIFFERS  ${f}  — modified since it was sealed`);
    for (const f of r.missing) console.log(`       🔴 FILE GONE     ${f}  — the manifest lists it, the disk does not have it`);
    if (r.missing.length + r.mismatch.length) bad++;
  }
  console.log();
  if (bad) {
    console.log(`🔴 FAIL — ${bad}/${manifests.length} bundle(s) no longer verify themselves.`);
    console.log(`   A bundle whose hashes differ is no longer evidence. DO NOT regenerate the`);
    console.log(`   manifest to make it green — that erases the very thing that gave it value.`);
    console.log(`   Restore the original bytes instead:`);
    console.log(`     git show <commit-before-the-break>:<path> > <file>`);
    return 1;
  }
  if (unresolved) { console.log(`⁇ INCONCLUSIVE — ${unresolved} bundle(s) unreadable.`); return 2; }
  console.log(`✅ PASS — all ${manifests.length} evidence bundles match byte for byte.`);
  return 0;
}

/** Counter-check: the gate must go red when it should, and red FOR THE RIGHT REASON. */
function selfTest() {
  let pass = 0, fail = 0;
  const ok = (n, c, seen) => (c ? (pass++, console.log(`  ✓ ${n}`)) : (fail++, console.log(`  ✗ ${n} — got: ${seen}`)));
  console.log("\n══ COUNTER-CHECK — check-evidence ══\n");

  console.log("── 1. Both sha256sum line shapes are read ──");
  const rows = parseManifest("aa" + "0".repeat(62) + "  a.txt\n" + "bb" + "1".repeat(62) + " *b.txt\ngarbage\n");
  ok("text shape (two spaces)", rows[0]?.file === "a.txt", JSON.stringify(rows[0]));
  ok("🔴 binary shape (asterisk) — missing it means reading 0 entries and reporting GREEN",
    rows[1]?.file === "b.txt", JSON.stringify(rows[1]));
  ok("garbage lines are dropped, not turned into fake entries", rows.length === 2, String(rows.length));

  console.log("\n── 2. A hand-built bundle ──");
  const tmp = mkdtempSync(path.join(os.tmpdir(), "a1-evi-"));
  try {
    const d = path.join(tmp, "bundle");
    mkdirSync(path.join(d, "sub"), { recursive: true });
    writeFileSync(path.join(d, "a.txt"), "content A\n");
    writeFileSync(path.join(d, "sub", "b.txt"), "content B\n");
    const h = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
    const man = path.join(d, "MANIFEST.txt");
    writeFileSync(man, `${h(path.join(d, "a.txt"))}  a.txt\n${h(path.join(d, "sub", "b.txt"))}  sub/b.txt\n`);

    ok("an intact bundle matches everywhere",
      (() => { const r = verifyBundle(man); return r.ok === 2 && !r.mismatch.length && !r.missing.length; })(), "");

    writeFileSync(path.join(d, "a.txt"), "content A, modified\n");
    const r2 = verifyBundle(man);
    ok("🔴 MODIFY ONE FILE ⇒ reports HASH DIFFERS (the case that actually burned on 2026-08-28)",
      r2.mismatch.includes("a.txt") && r2.ok === 1, JSON.stringify(r2));
    ok("🔴 and does NOT report it as 'file gone' — two different faults, do not merge them",
      r2.missing.length === 0, JSON.stringify(r2.missing));

    rmSync(path.join(d, "sub", "b.txt"));
    const r3 = verifyBundle(man);
    ok("🔴 DELETE ONE FILE ⇒ reports FILE GONE", r3.missing.includes("sub/b.txt"), JSON.stringify(r3.missing));

    ok("manifests in subdirectories are found", findManifests(tmp).length === 1, String(findManifests(tmp).length));
  } finally { rmSync(tmp, { recursive: true, force: true }); }

  console.log(`\n${fail === 0 ? "✅" : "🔴"} ${pass} passed · ${fail} failed`);
  return fail === 0 ? 0 : 1;
}

process.exit(SELF_TEST ? selfTest() : main());
