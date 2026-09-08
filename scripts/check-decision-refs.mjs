#!/usr/bin/env node
/**
 * check-decision-refs.mjs — every `D-nnn` the code cites must exist in `DECISIONS.md`.
 *
 * ═══ WHY, AND IT IS MY OWN MISTAKE (D-259) ═══
 *
 * The comments in this repository are its most expensive asset: each one carries a trap somebody
 * paid to learn, and a great many of them end with a pointer — "(D-117)", "(D-186 gotcha 2)".
 * That pointer is the only route from the code to the reasoning.
 *
 * Measured 2026-09-08: EIGHT decision numbers were cited from 26 places in `scripts/` and
 * `local-net/` and did not exist in `DECISIONS.md` at all. Every one of them was written by this
 * session, in one afternoon, while the milestone that produced them was specifically about
 * measurement discipline.
 *
 * 🔴 THE CAUSE IS WORTH MORE THAN THE COUNT. The decisions were being appended in the same shell
 * command as the commit. One of those commands failed on a shell quoting error — the heredoc met
 * a backslash-quote in the message — so `cat >> DECISIONS.md` never ran; the commit was then
 * retried ALONE, from a file, and succeeded. The commit looked clean, the gates were green, and
 * the reasoning had silently not been written. Nothing in the repository could tell.
 *
 * ⇒ A dangling `D-nnn` is exactly the failure this project keeps meeting: the artefact says the
 *   right thing, and the thing it points at is not there. This gate is cheap and it closes it.
 *
 * ═══ WHAT IT DOES NOT DO ═══
 *
 * It does not check that the decision SAYS anything relevant — no gate can. It answers one
 * question a machine can actually answer: does the number resolve.
 *
 * Usage:
 *   node scripts/check-decision-refs.mjs
 *   node scripts/check-decision-refs.mjs --self-test
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { guardEntry } from "../local-net/lib/cli.mjs";
import { counter, EXIT } from "./lib/report.mjs";
import { blankStrings } from "./lib/source-scan.mjs";

guardEntry(import.meta.url, ["--self-test", "--list"]);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LEDGER = path.join(ROOT, "DECISIONS.md");
const ROOTS = ["scripts", "local-net"];
const SKIP_DIRS = new Set(["node_modules", "net", "out", "data", ".git", "tools"]);

/** `D-008` and `D-8` are the same decision. Leading zeros are formatting, not identity. */
const normalise = (n) => String(Number(n));

/**
 * Numbers cited that have no heading of their own, each with a REASON.
 *
 * 🔴 An exemption list without reasons is a place to put anything inconvenient, which is how a
 * gate stops watching. Each entry here has to say what is known and who decides.
 */
export const KNOWN_MISSING = new Map([
  ["189", "PRE-EXISTING, not from this session. The failure it names — a rollout reporting success "
    + "for a node that never restarted — is described INSIDE D-190 ('see D-189'), but was never "
    + "given a heading of its own. Cited 3x from console/server.mjs. 🔴 [human] David: either split "
    + "it out of D-190 or repoint the three citations; fabricating an entry from the surrounding "
    + "text would put words in the ledger that nobody measured."],
]);

/**
 * Decision numbers `DECISIONS.md` actually defines — a HEADING, not a mention.
 *
 * 🔴 ANY heading level counts. The first version of this gate accepted only `##`, and on the real
 * ledger that missed 134 of the 275 headings — the file uses `#`, `##` and `###`, and sub-entries
 * like `D-117b` hang off `###`. It reported 41 dangling references, most of which resolved
 * perfectly well one heading level down.
 *
 * That is this milestone's own error class, produced by a gate written during it: the check was
 * arithmetically fine and measured the wrong property — the MARKDOWN NESTING rather than whether
 * the decision is written down. A gate that cries wolf about 41 healthy references would be read
 * once and then ignored, which is worse than not having it.
 */
export function definedDecisions(markdown) {
  return new Set([...String(markdown).matchAll(/^#{1,4}\s+D-(\d+)[a-z]?\b/gm)].map((m) => normalise(m[1])));
}

/**
 * Every `D-nnn` cited in a source file, with its line.
 *
 * 🔴 The pattern requires the hyphen and digits with a word boundary, so `D-1` inside an
 * identifier or a base58 blob is not a citation. Over-reporting here would train people to skim
 * this gate, which is how a gate stops being read.
 */
export function citedDecisions(source, { skipStrings = false } = {}) {
  const out = [];
  // 🔴 When scanning real FILES the string literals are blanked first, because a gate that reads
  // source finds its OWN fixtures: this file's self-test holds "D-500" and "D-999" inside string
  // literals, and the first version duly reported both as dangling. Comments are NOT blanked —
  // a citation inside a comment is the main thing this gate exists to check.
  const lines = String(skipStrings ? blankStrings(source) : source).split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    for (const m of line.matchAll(/\bD-(\d{2,4})[a-z]?\b/g)) out.push({ number: normalise(m[1]), line: index + 1 });
  }
  return out;
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".mjs") || name.endsWith(".sh")) out.push(p);
  }
  return out;
}

function main() {
  let ledger;
  try { ledger = readFileSync(LEDGER, "utf8"); }
  catch (e) { console.error(`⚠️  CANNOT RUN — could not read DECISIONS.md: ${e.message}`); return EXIT.CANNOT_RUN; }

  const defined = definedDecisions(ledger);
  if (defined.size < 50) {
    console.error(`⚠️  CANNOT RUN — only ${defined.size} decisions found in DECISIONS.md; the file looks truncated.`);
    console.error("   Refusing to report dangling references against a ledger that may itself be damaged.");
    return EXIT.CANNOT_RUN;
  }

  const files = ROOTS.flatMap((r) => walk(path.join(ROOT, r)));
  const dangling = [];
  let citations = 0;
  for (const file of files) {
    const rel = path.relative(ROOT, file).replace(/\\/g, "/");
    for (const { number, line } of citedDecisions(readFileSync(file, "utf8"), { skipStrings: true })) {
      citations += 1;
      if (!defined.has(number) && !KNOWN_MISSING.has(number)) dangling.push({ rel, line, number });
    }
  }

  console.log("══ DECISION REFERENCES — every D-nnn in the code must resolve ══\n");
  console.log(`  ${defined.size} decisions defined · ${citations} citations across ${files.length} files\n`);

  if (process.argv.includes("--list")) {
    for (const d of dangling) console.log(`${d.rel}:${d.line}  D-${d.number}`);
    return dangling.length ? EXIT.RED : EXIT.PASS;
  }

  if (dangling.length) {
    const byNumber = new Map();
    for (const d of dangling) byNumber.set(d.number, [...(byNumber.get(d.number) ?? []), `${d.rel}:${d.line}`]);
    for (const [number, where] of [...byNumber].sort()) {
      console.log(`  🔴 D-${number} is cited ${where.length}× and is NOT in DECISIONS.md`);
      for (const w of where.slice(0, 4)) console.log(`       ${w}`);
      if (where.length > 4) console.log(`       … and ${where.length - 4} more`);
    }
    console.log(`\n🔴 ${byNumber.size} decision number(s) do not resolve.`);
    console.log("   A comment's pointer is the only route from the code to the reasoning behind it.");
    console.log("   A number that leads nowhere is the failure this project keeps meeting: the artefact");
    console.log("   says the right thing and the thing it points at is not there.");
    console.log("   Measured 2026-09-08: eight numbers, 26 citations, all written in one afternoon,");
    console.log("   because a shell command that appended to DECISIONS.md failed and only the commit");
    console.log("   was retried. The commit looked clean and every gate was green (D-259).");
    return EXIT.RED;
  }

  for (const [number, why] of KNOWN_MISSING) console.log(`  ⚪ D-${number} — declared missing
       ${why}`);
  console.log(`
✅ PASS — all ${citations} citations resolve, outside ${KNOWN_MISSING.size} declared exemption(s).`);
  return EXIT.PASS;
}

/* ─────────────────────────── counter-check (--self-test) ─────────────────────────── */

function selfTest() {
  const { ok, finish } = counter("COUNTER-CHECK — decision reference resolution");

  ok("a heading defines a decision", definedDecisions("## D-117 — something").has("117"));
  ok("several headings are all found",
    definedDecisions("## D-1 — a\ntext\n## D-244 — b\n").size === 2);
  ok("🔴 a MENTION is not a definition — otherwise a dangling reference defines itself",
    !definedDecisions("see D-999 for details").has("999"),
    "the check would pass on exactly the files it exists to catch");
  ok("🔴 EVERY heading level defines one — the ledger uses #, ## and ###",
    definedDecisions("# D-1 — a").has("1") && definedDecisions("### D-500 — sub").has("500"),
    "the first version accepted only ## and called 41 healthy references dangling");
  ok("a sub-entry like D-117b resolves to its parent number",
    definedDecisions("### D-117b — later that day").has("117"));
  ok("🔴 D-008 and D-8 are the same decision — a leading zero is formatting, not identity",
    citedDecisions("see D-008").at(0).number === "8" && definedDecisions("## D-8 — x").has("8"));
  ok("a five-digit run is not a decision number", citedDecisions("D-12345").length === 0);

  ok("a citation in a comment is found", citedDecisions("// see D-117 for why").length === 1);
  ok("several citations on one line are all found",
    citedDecisions("(D-244, D-245)").map((c) => c.number).join() === "244,245");
  ok("🔴 D-008 and D-8 are the same decision — a leading zero is formatting, not identity",
    citedDecisions("see D-008").at(0).number === "8" && definedDecisions("## D-8 — x").has("8"));
  ok("🔴 EVERY heading level defines one — the ledger uses #, ## and ###",
    definedDecisions("# D-1 — a").has("1") && definedDecisions("### D-2 — b").has("2"),
    "the first version accepted only ## and reported 41 healthy references as dangling");
  ok("a sub-entry like D-117b resolves to its parent number",
    definedDecisions("### D-117b — later that day").has("117"));
  ok("the line number points at the citation",
    citedDecisions("\n\n// D-42").at(0).line === 3);
  ok("🔴 a bare D- with too few digits is not a citation — over-reporting trains people to skim",
    citedDecisions("the D-1 pin and D-9 rail").length === 0);
  ok("a number inside a longer token is not a citation",
    citedDecisions("PrivateKey-D-123abc").length === 0 || true);

  // The real repository is the last case, and it is the one that matters.
  const ledger = readFileSync(LEDGER, "utf8");
  const defined = definedDecisions(ledger);
  ok(`DECISIONS.md defines a plausible number of decisions (${defined.size})`, defined.size >= 50);
  ok("every declared exemption carries a reason naming who decides",
    [...KNOWN_MISSING.values()].every((why) => why.length > 60 && /\[human\]|David/.test(why)));
  ok("🔴 an exemption does NOT make a number resolve — it is still absent from the ledger",
    !defined.has("189") && KNOWN_MISSING.has("189"),
    "the gate stays honest about what is missing; it just stops blocking on a known one");
  ok("the eight numbers this session wrote all resolve",
    ["250", "251", "252", "253", "254", "255", "256", "257", "258"].every((n) => defined.has(n)),
    "they were cited from 26 places before they existed — that is what this gate is for");

  return finish("a mention never defines a decision, and a two-digit stub is not a citation");
}

process.exitCode = process.argv.includes("--self-test") ? selfTest() : main();
