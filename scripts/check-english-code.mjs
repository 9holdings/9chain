#!/usr/bin/env node
/**
 * check-english-code.mjs — gate: SOURCE CODE IS ENGLISH ONLY.
 *
 * ═══ WHY THIS EXISTS ═══
 *
 * David, 2026-08-28: *"Do not name files, functions, or write any information into the code
 * in Vietnamese — this is for international use, many global communities will come in to
 * develop it further."* See CLAUDE.md §0.
 *
 * This is a rule about FUTURE READERS, not about taste. A Vietnamese comment explaining a
 * trap this project paid to learn simply DOES NOT EXIST for a contributor in another
 * country — and they will walk into that same trap. The comments in this repo are its most
 * expensive asset; leaving them in a language a reader cannot parse throws that asset away
 * silently.
 *
 * ═══ WHY A RATCHET AND NOT A BIG-BANG TRANSLATION ═══
 *
 * Measured 2026-08-28: 109 files / 6,485 lines in this repo, plus 54 Go files in the fork.
 * Rewriting all of that four days before G-day would be the single largest, least verifiable
 * change in the project's history — at the exact moment an immutable genesis gets minted.
 *
 * So this gate is a RATCHET, not a wall:
 *   - a file NOT in the debt list must be 100% English  -> new code is clean immediately
 *   - a file IN the debt list may not get WORSE          -> old code is paid down, never grown
 * The gate goes RED when the debt GROWS. It stays green while the debt shrinks.
 *
 * ═══ WHAT THIS GATE ACTUALLY MEASURES — AND WHAT IT DOES NOT ═══
 *
 * It detects Vietnamese by (a) diacritics, which is near-exact, and (b) a small list of
 * unaccented Vietnamese words that never occur in English code.
 *
 * 🔴 It CANNOT reliably catch Vietnamese written entirely without diacritics, which is how
 * this codebase writes shell scripts and commit messages. That is a real blind spot, stated
 * here on purpose: a gate whose limits are not written down gets read as proof of something
 * it never measured. Read a green result as *"no accented Vietnamese, and none of the known
 * marker words"* — NOT as *"this file is English"*. Only a human reading it can say that.
 *
 * ═══ EXIT CODES ═══
 *   0  PASS  — no new offenders, and no listed file got worse
 *   1  FAIL  — a clean file regressed, or debt grew
 *
 * Usage:
 *   node scripts/check-english-code.mjs
 *   node scripts/check-english-code.mjs --self-test
 *   node scripts/check-english-code.mjs --update-baseline   # records reductions only
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASELINE = path.join(ROOT, "scripts", "english-debt.json");
const argv = process.argv.slice(2);
const SELF_TEST = argv.includes("--self-test");
const UPDATE = argv.includes("--update-baseline");

const DIACRITICS =
  /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;

/**
 * Unaccented Vietnamese markers. Every entry must be a word that does NOT occur in English
 * source code, or the gate produces false positives and gets switched off.
 * Deliberately excluded because they collide: `la`, `va`, `thi`, `ba`, `co`, `do`, `may`.
 */
const MARKERS =
  /\b(khong|duoc|nguoi|nhung|truoc|chung|nghiem|mang|tep|khoa|dung|luat|doi chung|phep do)\b/i;

/**
 * Paths exempt from the rule. Each entry states WHY. Adding one is a DECISION, not a way to
 * make the gate green.
 */
export const EXEMPT = [
  { prefix: "web/lib/i18n/", why: "Vietnamese UI copy for Vietnamese users. Translating it destroys its entire purpose." },
  { prefix: "docs/", why: "David's working notes, not source code. CLAUDE.md §0 exempts them." },
  { prefix: "patches/", why: "Historical record + byte-frozen fork reproduction path (hard rule #3)." },
  { prefix: "upstream/", why: "Separate fork repository; carried by patches/, changed only via a full regeneration." },
  { prefix: "node_modules", why: "Third-party dependencies." },
];

const CODE = /\.(mjs|js|ts|tsx|sh|yml|yaml|json|html|sol|go)$/i;

export function isExempt(file) {
  return EXEMPT.some((e) => file.startsWith(e.prefix));
}

/**
 * Inline code spans are PROPER NOUNS, not prose: `00-DOC-TRUOC.md` is the real name of a file
 * inside a sealed evidence bundle, and a comment must be able to cite it accurately. Stripping
 * backticked spans before matching removes that whole class of false positive.
 *
 * ⚠️ It also means Vietnamese hidden inside backticks is not seen. Accepted: this gate exists
 * to catch accidents, not to defeat someone deliberately evading it.
 */
const stripCodeSpans = (line) => line.replace(/`[^`]*`/g, "``");

/** Count lines containing Vietnamese in one file. */
export function countVietnamese(text) {
  return text.split("\n")
    .map(stripCodeSpans)
    .filter((l) => DIACRITICS.test(l) || MARKERS.test(l)).length;
}

function scan() {
  const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
    cwd: ROOT, encoding: "utf8",
  })
    .split("\n").filter(Boolean)
    .filter((f) => CODE.test(f))
    .filter((f) => !isExempt(f))
    .filter((f) => !/(package|pnpm)-lock/.test(f));

  const found = new Map();
  for (const f of files) {
    let s;
    try { s = readFileSync(path.join(ROOT, f), "utf8"); } catch { continue; }
    const n = countVietnamese(s);
    if (n > 0) found.set(f, n);
  }
  return { files, found };
}

function loadBaseline() {
  if (!existsSync(BASELINE)) return null;
  return JSON.parse(readFileSync(BASELINE, "utf8"));
}

function main() {
  const { files, found } = scan();
  const total = [...found.values()].reduce((a, b) => a + b, 0);
  const base = loadBaseline();

  if (UPDATE || !base) {
    const debt = Object.fromEntries([...found.entries()].sort((a, b) => b[1] - a[1]));
    const prev = base ? base.total : null;
    // A baseline that is allowed to grow is not a ratchet; it is a rubber stamp.
    if (prev !== null && total > prev) {
      console.log(`\n🔴 REFUSING to update: debt grew ${prev} -> ${total} lines.`);
      console.log(`   The baseline may only ever shrink. Fix the new Vietnamese first.`);
      return 1;
    }
    writeFileSync(BASELINE, JSON.stringify({
      _doc: "Known Vietnamese-language debt in source code. See CLAUDE.md §0 and scripts/check-english-code.mjs. This list may only SHRINK: `--update-baseline` refuses to record growth.",
      recordedOn: "2026-08-28",
      total,
      files: debt,
    }, null, 2) + "\n");
    console.log(`\n✅ baseline written: ${found.size} files · ${total} lines${prev !== null ? `  (was ${prev})` : ""}`);
    return 0;
  }

  console.log(`\n══ ENGLISH-ONLY SOURCE — ${files.length} code files in scope ══\n`);

  const regressed = [];
  const grown = [];
  for (const [f, n] of found) {
    const allowed = base.files[f];
    if (allowed === undefined) regressed.push([f, n]);
    else if (n > allowed) grown.push([f, n, allowed]);
  }
  const paid = Object.entries(base.files).filter(([f, n]) => (found.get(f) ?? 0) < n);

  if (regressed.length) {
    console.log(`  🔴 ${regressed.length} file(s) that were clean now contain Vietnamese:`);
    for (const [f, n] of regressed) console.log(`       ${String(n).padStart(4)} lines  ${f}`);
  }
  if (grown.length) {
    console.log(`  🔴 ${grown.length} file(s) got WORSE:`);
    for (const [f, n, a] of grown) console.log(`       ${a} -> ${n} lines  ${f}`);
  }
  if (paid.length) {
    console.log(`  ✓ ${paid.length} file(s) paid down:`);
    for (const [f, n] of paid.slice(0, 8)) console.log(`       ${n} -> ${found.get(f) ?? 0} lines  ${f}`);
    if (paid.length > 8) console.log(`       … and ${paid.length - 8} more`);
  }

  console.log(`\n  debt: ${total} lines in ${found.size} files   (baseline ${base.total})`);
  console.log(`  exempt: ${EXEMPT.map((e) => e.prefix).join(" · ")}`);
  console.log(`  ⚠️  blind spot: fully unaccented Vietnamese is NOT reliably detected.`);

  if (regressed.length || grown.length) {
    console.log(`\n🔴 FAIL — new Vietnamese entered the code.`);
    console.log(`   New files must be English from the start (CLAUDE.md §0).`);
    console.log(`   After translating existing files: node scripts/check-english-code.mjs --update-baseline`);
    return 1;
  }
  console.log(`\n✅ PASS — no new Vietnamese; debt ${total <= base.total ? "did not grow" : "GREW"}.`);
  return 0;
}

function selfTest() {
  let pass = 0, fail = 0;
  const ok = (name, cond, seen) =>
    cond ? (pass++, console.log(`  ✓ ${name}`)) : (fail++, console.log(`  ✗ ${name} — got: ${seen}`));

  console.log("\n══ COUNTER-CHECK — check-english-code ══\n");

  console.log("── 1. Detection ──");
  ok("accented Vietnamese is caught", countVietnamese("// đây là một chú thích") === 1, "0");
  ok("plain English is not flagged", countVietnamese("// this is a comment\nconst x = 1;") === 0, "non-zero");
  ok("🔴 unaccented marker word is caught", countVietnamese("// khong doc duoc") === 1, "0");
  ok("counts LINES, not occurrences", countVietnamese("// một hai ba\n// bốn năm") === 2, "wrong");
  ok("🔴 English words that merely look similar are NOT flagged",
    countVietnamese("const config = { data: 'value' };\nlet cost = 1;") === 0, "false positive");
  ok("🔴 a real filename cited in backticks is a PROPER NOUN, not prose",
    countVietnamese("// the file `00-DOC-TRUOC.md` inside the sealed bundle") === 0, "false positive");
  ok("…but the same words OUTSIDE backticks are still caught",
    countVietnamese("// doc truoc khi xoa") === 1, "missed");

  console.log("\n── 2. Exemptions ──");
  ok("i18n Vietnamese file is exempt", isExempt("web/lib/i18n/vi.ts"), "not exempt");
  ok("docs are exempt", isExempt("docs/TOKENOMICS.md"), "not exempt");
  ok("patches are exempt", isExempt("patches/0001-x.patch"), "not exempt");
  ok("🔴 ordinary source is NOT exempt", !isExempt("scripts/watch-network.mjs"), "exempt");

  console.log("\n── 3. This very file obeys the rule it enforces ──");
  const self = readFileSync(path.join(ROOT, "scripts", "check-english-code.mjs"), "utf8");
  // Strip the two constants that must contain Vietnamese to do their job at all.
  const body = self
    .replace(/const DIACRITICS =[\s\S]*?;\n/, "")
    .replace(/const MARKERS =[\s\S]*?;\n/, "")
    .replace(/countVietnamese\("[^"]*"\)/g, "countVietnamese(_)");
  ok("🔴 no Vietnamese outside the detector constants and its own test data",
    countVietnamese(body) === 0, `${countVietnamese(body)} lines`);

  console.log(`\n${fail === 0 ? "✅" : "🔴"} ${pass} passed · ${fail} failed`);
  return fail === 0 ? 0 : 1;
}

process.exit(SELF_TEST ? selfTest() : main());
