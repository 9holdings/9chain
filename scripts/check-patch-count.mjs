#!/usr/bin/env node
/**
 * check-patch-count.mjs — gate: **does every document that states how many patches the fork has
 * agree with how many patch files are actually in `patches/`?**
 *
 * ═══ 🔴 WHY IT EXISTS ═══
 *
 * Reported 2026-09-01 by an outside tester who rebuilt the fork on a clean machine (finding G-1).
 * `README.md` still said 26 patches, main tree `60a61707`, counter-check `25 of the 26 ->
 * f2b9486b`. All three were one generation behind. `CLAUDE.md` had been corrected in be91398 and
 * README had not — and README is the file a stranger reads first.
 *
 * The cost is specific: an outsider follows README, replays the patches, gets `38723877`, and
 * concludes THE FORK DOES NOT REPRODUCE. That is the one claim this project most needs to be able
 * to make, and it was being refuted by our own documentation.
 *
 * 🔴 **WHY NOTHING CAUGHT IT.** `gday-preflight` has a fork-tree gate, and it is a good one — it
 * replays the patches and checks two anchors. But it compares `patches/` against constants inside
 * ITSELF. Nothing ever compared `patches/` against the numbers printed in the documents people
 * actually read. Same shape as D-113 one level up: the count had a second declaration, in prose.
 *
 * 🔴 **AND THE HARD PART: `60a61707` NEVER STOPPED BEING CORRECT.** It was DEMOTED — it used to be
 * the main tree and it is now the counter-check anchor. A gate that only asked "does this hash
 * appear somewhere in the docs?" would have stayed green through the whole drift. So this gate
 * checks each hash IN ITS ROLE, not merely its presence.
 *
 * ## WHAT IT MEASURES, AND WHERE (CLAUDE.md section 2)
 *
 * | Question | Measured by | Where |
 * |---|---|---|
 * | How many patches are there? | counting `patches/*.patch` | THE REPO, on disk |
 * | What do we tell people? | reading the published documents | THE DOCUMENTS |
 *
 * ⚠️ It does NOT replay the patches — `gday-preflight`'s fork-tree gate does that, and doing it
 * twice would be slow without adding a reading. This gate measures agreement between the tree and
 * the prose, which is the quantity that drifted.
 *
 * ## EXIT CODES (shared convention across the tool set)
 *
 *   0  PASS          — every stated count and anchor matches the patch set
 *   1  FAIL          — a document states a number that is not true any more
 *   2  INCONCLUSIVE  — `patches/` could not be read, or a scanned document is missing
 *
 * Usage:
 *   node scripts/check-patch-count.mjs
 *   node scripts/check-patch-count.mjs --self-test
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SELF_TEST = process.argv.slice(2).includes("--self-test");

/**
 * The documents a stranger reads, and what each is allowed to say.
 *
 * Deliberately NOT every file that mentions a number. The journals (HANDOFF, DECISIONS, PROGRESS)
 * recount measurements taken on days when the count really was 25 or 26; those are sentences about
 * the past and rewriting them to look tidy is what section 2 warns against. This gate reads the
 * files that give INSTRUCTIONS to someone acting today.
 */
const SCANNED = ["README.md", "CLAUDE.md", "docs/RUN-A-VALIDATOR.md"];

/** Anchors, BY ROLE. A hash in the wrong role is the exact failure this gate was built for. */
export const ANCHORS = {
  full: "387238778dda96d58cabe6f9ddd7097e208b69e9",
  minusOne: "60a61707f7974a0f1853b8bf78df7d0fdc1ef863",
};

/** Anchors that have been RETIRED. Seeing one in an instruction is a defect, not nostalgia. */
export const RETIRED_ANCHORS = {
  f2b9486b71ad53b584a86f77d6017c34d74e6fa6: "the 25-of-26 counter-check, retired when patch 0027 landed",
  "074aaa93cb0d1ff89d21c7ba33cd7b0c9dd0e0f5": "the tree of the g0 image, retired at re-genesis",
};

const NL = /\r?\n/;
const COUNT_RE = /\*{0,2}(\d{1,3})\*{0,2}\s+patch(?:es)?\b/gi;
const OF_RE = /\*{0,2}(\d{1,3})\*{0,2}\s+of\s+(?:the\s+)?\*{0,2}(\d{1,3})\*{0,2}/gi;
const COUNTER_MARK = /counter-check|\b\d{1,3}\s+of\s+(?:the\s+)?\d{1,3}\b/i;
const FULL_REPLAY_MARK = /rev-parse|HEAD\^\{tree\}|main tree/i;

/** Paragraphs: runs of consecutive non-blank lines. Line numbers are 1-based. */
function paragraphs(text) {
  const lines = text.split(NL);
  const out = [];
  let start = 0;
  for (let i = 0; i <= lines.length; i++) {
    if (i === lines.length || lines[i].trim() === "") {
      if (i > start) out.push({ from: start + 1, to: i, lines: lines.slice(start, i) });
      start = i + 1;
    }
  }
  return out;
}

export function countPatches(dir) {
  return readdirSync(dir).filter((f) => /\.patch$/.test(f)).length;
}

/**
 * Which lines are exempt because their sentence declares itself to be about the past?
 *
 * The same `stale-ok` convention `check-doc-drift` established — but scoped to the PARAGRAPH. A
 * patch count is usually written inside a wrapped parenthetical ("the old anchor f2b9486b belonged
 * to the 26-patch era"), so the marker lands at the end of the sentence, a line below the number.
 * Judging line by line reddens a correctly-marked record, and section 2 is explicit that the
 * exemption is valid for exactly this: sentences about the past.
 *
 * 🔴 It does NOT leak past a blank line. One marker anywhere would otherwise silence a whole file.
 */
export function exemptLines(text) {
  const out = new Set();
  for (const p of paragraphs(text)) {
    if (p.lines.some((l) => /stale-ok/.test(l))) for (let i = p.from; i <= p.to; i++) out.add(i);
  }
  return out;
}

/**
 * 🔴 CONTEXT SPANS A BLOCK, NOT A LINE — and getting this wrong nearly broke a correct document.
 *
 * A counter-check in these docs is a sentence followed by a fenced command:
 *
 *     Applying **26 of the 27** patches must yield a different, also-known tree:
 *     ```bash
 *     git checkout 1cf1fc3 && git am --keep-cr <first 26 patches>
 *     git rev-parse HEAD^{tree}     # 60a61707...
 *     ```
 *
 * Judged line by line, those command lines look like a full replay stating the wrong count and the
 * wrong anchor. Both are CORRECT there — and the first run of this gate reported them as defects
 * in `docs/RUN-A-VALIDATOR.md`. Acting on that would have replaced right numbers with wrong ones,
 * which is worse than the drift the gate was built for (D-106b: red for the wrong reason).
 *
 * So a line inherits the context of its own paragraph AND the one before it, which is where the
 * sentence introducing a command block lives.
 */
export function counterCheckLines(text) {
  const ps = paragraphs(text);
  const out = new Set();
  ps.forEach((p, i) => {
    const own = p.lines.some((l) => COUNTER_MARK.test(l));
    const prev = i > 0 && ps[i - 1].lines.some((l) => COUNTER_MARK.test(l));
    if (own || prev) for (let j = p.from; j <= p.to; j++) out.add(j);
  });
  return out;
}

/**
 * Every patch count a document states, with the line it is on.
 *
 * It reads a RANGE of numbers rather than looking for one expected value: a gate that searches for
 * the right answer cannot see a document stating a different one.
 */
export function statedCounts(text) {
  const out = [];
  const exempt = exemptLines(text);
  const cc = counterCheckLines(text);
  text.split(NL).forEach((line, i) => {
    if (exempt.has(i + 1)) return;
    for (const m of line.matchAll(COUNT_RE)) {
      out.push({ line: i + 1, n: Number(m[1]), kind: "count", counterCheck: cc.has(i + 1), text: line.trim() });
    }
    for (const m of line.matchAll(OF_RE)) {
      out.push({ line: i + 1, n: Number(m[2]), sub: Number(m[1]), kind: "counter-check", text: line.trim() });
    }
  });
  return out;
}

/** Which retired anchors does this text still carry, and on which lines? */
export function retiredAnchorsIn(text) {
  const hits = [];
  const exempt = exemptLines(text);
  text.split(NL).forEach((line, i) => {
    if (exempt.has(i + 1)) return;
    for (const [hash, why] of Object.entries(RETIRED_ANCHORS)) {
      if (line.includes(hash)) hits.push({ line: i + 1, hash, why, text: line.trim() });
    }
  });
  return hits;
}

/**
 * 🔴 Role, not presence. `60a61707` is still a correct hash — it is the 26-of-27 anchor — so a
 * check for "does this hash appear?" passes on a document that has it in the WRONG PLACE, which is
 * precisely how README drifted.
 */
export function anchorRoleProblems(text, anchors = ANCHORS) {
  const problems = [];
  const exempt = exemptLines(text);
  const cc = counterCheckLines(text);
  text.split(NL).forEach((line, i) => {
    if (exempt.has(i + 1)) return;
    const hasFull = line.includes(anchors.full);
    const hasMinusOne = line.includes(anchors.minusOne);
    if (!hasFull && !hasMinusOne) return;
    if (cc.has(i + 1) && hasFull) {
      problems.push({ line: i + 1, reason: "the counter-check block names the FULL-replay tree", text: line.trim() });
    }
    if (!cc.has(i + 1) && hasMinusOne && FULL_REPLAY_MARK.test(line)) {
      problems.push({ line: i + 1, reason: "the full-replay line names the COUNTER-CHECK tree", text: line.trim() });
    }
  });
  return problems;
}

export function judge(actual, docs) {
  const reds = [];
  for (const d of docs) {
    for (const s of statedCounts(d.text)) {
      // Inside a counter-check block, N-1 is the number that BELONGS there.
      if (s.kind === "count" && s.counterCheck && s.n === actual - 1) continue;
      if (s.kind === "count" && s.n !== actual) {
        reds.push({ file: d.file, line: s.line, reason: `states ${s.n} patches — there are ${actual}`, text: s.text });
      }
      if (s.kind === "counter-check") {
        if (s.n !== actual) {
          reds.push({ file: d.file, line: s.line, reason: `counter-check is against ${s.n} patches — there are ${actual}`, text: s.text });
        } else if (s.sub !== actual - 1) {
          reds.push({ file: d.file, line: s.line, reason: `counter-check applies ${s.sub} of ${s.n} — it must be ${actual - 1}`, text: s.text });
        }
      }
    }
    for (const r of retiredAnchorsIn(d.text)) {
      reds.push({ file: d.file, line: r.line, reason: `carries a RETIRED anchor ${r.hash.slice(0, 8)} — ${r.why}`, text: r.text });
    }
    for (const p of anchorRoleProblems(d.text)) {
      reds.push({ file: d.file, line: p.line, reason: p.reason, text: p.text });
    }
  }
  return reds;
}

function main() {
  if (SELF_TEST) return selfTest();

  const dir = path.join(ROOT, "patches");
  if (!existsSync(dir)) {
    console.log(`⁇ INCONCLUSIVE — no patches/ directory at ${dir}`);
    return 2;
  }
  const actual = countPatches(dir);
  console.log(`\n══ PATCH COUNT — patches/ holds ${actual} patch file(s) ══\n`);

  const docs = [];
  for (const f of SCANNED) {
    const p = path.join(ROOT, f);
    if (!existsSync(p)) {
      console.log(`⁇ INCONCLUSIVE — ${f} is missing; "not scanned" is not "agrees".`);
      return 2;
    }
    docs.push({ file: f, text: readFileSync(p, "utf8") });
  }

  const reds = judge(actual, docs);
  for (const d of docs) {
    const n = reds.filter((r) => r.file === d.file).length;
    console.log(`  ${n ? "🔴" : "✓"} ${d.file}${n ? `  — ${n} problem(s)` : ""}`);
  }
  console.log();
  if (reds.length) {
    console.log(`🔴 FAIL — ${reds.length} statement(s) disagree with the patch set:`);
    for (const r of reds) console.log(`   ${r.file}:${r.line} — ${r.reason}\n      ${r.text.slice(0, 110)}`);
    console.log(`\n   An outsider follows these files, replays the patches, gets a different tree, and`);
    console.log(`   concludes the fork does not reproduce. That is the claim this project cannot afford`);
    console.log(`   to have refuted by its own documentation.`);
    return 1;
  }
  console.log(`✅ PASS — every stated count and anchor agrees with the ${actual} patches on disk.`);
  return 0;
}

/** Counter-check — the gate must go red when it should, and red FOR THE RIGHT REASON. */
function selfTest() {
  let pass = 0, fail = 0;
  const ok = (name, cond, seen) => {
    if (cond) { pass++; console.log(`  ✓ ${name}`); }
    else { fail++; console.log(`  ✗ ${name}  — got: ${seen}`); }
  };
  const doc = (text) => [{ file: "X.md", text }];
  const j = (text) => judge(27, doc(text));
  const A = ANCHORS;

  console.log("\n══ COUNTER-CHECK — check-patch-count ══\n");

  console.log("── 1. The stated count must equal the files on disk ──");
  ok("🔴 a document saying 26 while there are 27 => RED", j("the fork is 26 patches deep").length === 1, JSON.stringify(j("26 patches")));
  ok("CONTROL — the right number is clean", j("27 patches replay the layer").length === 0, "red");
  ok("…and bold markdown around the number does not hide it", j("**26** patches").length === 1, "missed");

  console.log("\n── 2. The counter-check must be N-1 of N ──");
  ok("🔴 '25 of the 26' when there are 27 => RED", j("applying 25 of the 26 patches").length > 0, "green");
  ok("CONTROL — '26 of 27' with 27 patches is clean", j("applying 26 of 27 patches").length === 0, JSON.stringify(j("applying 26 of 27 patches")));
  // 🔴 The off-by-one that still names the right total: a counter-check applying ALL of them proves
  // nothing, and the totals look right to anyone skimming.
  ok("🔴 '27 of 27' => RED even though the total is correct", j("applying 27 of 27 patches").length === 1, "green");

  console.log("\n── 3. A retired anchor in an instruction is a defect ──");
  ok("🔴 f2b9486b => RED, and the message says WHY it retired",
    /retired when patch 0027/.test(j("tree: f2b9486b71ad53b584a86f77d6017c34d74e6fa6")[0]?.reason ?? ""), "no reason");
  ok("🔴 074aaa93 (the g0 image tree) => RED", j("074aaa93cb0d1ff89d21c7ba33cd7b0c9dd0e0f5").length === 1, "green");

  console.log("\n── 4. 🔴 ROLE, not presence — the case README actually failed ──");
  ok("🔴 the full-replay line naming the COUNTER-CHECK tree => RED",
    j(`git rev-parse HEAD^{tree}     # ${A.minusOne}`).length === 1, JSON.stringify(j(`git rev-parse HEAD^{tree} # ${A.minusOne}`)));
  ok("CONTROL — the full-replay line naming the FULL tree is clean",
    j(`git rev-parse HEAD^{tree}     # ${A.full}`).length === 0, "red");
  ok("🔴 a counter-check line naming the FULL tree => RED", j(`applying 26 of 27 must yield ${A.full}`).length === 1, "green");
  ok("CONTROL — a counter-check line naming the MINUS-ONE tree is clean",
    j(`applying 26 of 27 must yield ${A.minusOne}`).length === 0, JSON.stringify(j(`applying 26 of 27 must yield ${A.minusOne}`)));

  console.log("\n── 5. 🔴 CONTEXT IS THE BLOCK — the real shape these docs use ──");
  // The exact passage in docs/RUN-A-VALIDATOR.md. The first run of this gate called it a defect.
  const realCounterCheck = `Applying **26 of the 27** patches must yield a different tree:\n\n\`\`\`bash\ngit checkout 1cf1fc3 && git am --keep-cr <first 26 patches>\ngit rev-parse HEAD^{tree}     # ${A.minusOne}\n\`\`\``;
  ok("🔴 CONTROL — a correct counter-check BLOCK is clean (introduced by the sentence above it)",
    j(realCounterCheck).length === 0, JSON.stringify(j(realCounterCheck)));
  // …and the same block with the anchors swapped must still be caught, or the fix above would have
  // bought quiet by making the gate blind.
  const swapped = `Applying **26 of the 27** patches must yield a different tree:\n\n\`\`\`bash\ngit rev-parse HEAD^{tree}     # ${A.full}\n\`\`\``;
  ok("🔴 …and the SAME block with the full tree in it is still RED", j(swapped).length === 1, JSON.stringify(j(swapped)));
  ok("🔴 a full-replay block NOT introduced by a counter-check sentence is judged as full replay",
    j(`Replay everything:\n\n\`\`\`bash\ngit rev-parse HEAD^{tree}     # ${A.minusOne}\n\`\`\``).length === 1, "green");

  console.log("\n── 6. `stale-ok`, scoped to the paragraph, never a licence for instructions ──");
  ok("a marked sentence about the past is exempt", j("the old anchor belonged to the 26 patch era <!-- stale-ok -->").length === 0, "red");
  // 🔴 The real CLAUDE.md shape: number on one line, marker on the next, one wrapped sentence.
  ok("🔴 …and it still applies when the sentence WRAPS (marker below the number)",
    j("(the old anchor f2b9486b71ad53b584a86f77d6017c34d74e6fa6 was the 26 patch era\nand it has retired.) <!-- stale-ok -->").length === 0,
    JSON.stringify(j("(the old anchor f2b9486b71ad53b584a86f77d6017c34d74e6fa6 was the 26 patch era\nand it has retired.) <!-- stale-ok -->")));
  // 🔴 THE CASE THAT KEEPS THE EXEMPTION HONEST — one marker must not silence a whole file.
  ok("🔴 the exemption does NOT leak into the next paragraph",
    j("the old era was 26 patches <!-- stale-ok -->\n\nrun: git am the 26 patches").length === 1,
    JSON.stringify(j("the old era was 26 patches <!-- stale-ok -->\n\nrun: git am the 26 patches")));

  console.log("\n── 7. Silence is not agreement ──");
  ok("a document that states no count at all is clean (it makes no claim)", j("nothing numeric here").length === 0, "red");

  console.log(`\n${fail === 0 ? "✅" : "🔴"} ${pass} passed · ${fail} failed`);
  return fail === 0 ? 0 : 1;
}

process.exit(main());
