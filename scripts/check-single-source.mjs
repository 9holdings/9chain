#!/usr/bin/env node
/**
 * check-single-source.mjs — gate: **one constant, ONE place it is declared.**
 *
 * ═══ 🔴 WHY IT EXISTS ═══
 *
 * This failure class has burned the project **three times**, in three different places, with
 * exactly one shape: *a value copied by hand into several files, with no gate joining them.*
 *
 *   D-093  `A1Gen` (Go) ↔ `A1_GEN` (JS) — bump one side and the other silently hands out a
 *          chainId from a different generation, into a user's wallet, through an IMMUTABLE
 *          genesis.
 *   D-111  `--network-id=9001` hardcoded in 4 compose files, agreeing with a `genesis.json`
 *          that was also 9001 ⇒ the node booted cleanly, every gate went green, and the dev
 *          network was running a DEAD generation.
 *   D-113  One concept, "the server", carried **six** environment-variable names. It had not
 *          burned yet — but the path was already named: **O4**, moving a node to a second
 *          provider. Set one variable, watch a few commands point at the new box, and
 *          `h6b-backup.sh` **quietly backs up the old one**.
 *
 * ⚠️ **Backing up the wrong machine raises no error.** It finishes, prints a green line, and
 * is wrong only on the day you finally need it. That is why this is a gate and not a note.
 *
 * ═══ WHAT THIS GATE MEASURES ═══
 *
 * How many files **contain the constant**, compared against an allow-list. It does NOT
 * understand meaning — a string sitting in a comment that explains history still counts.
 * That is **deliberate**: better to make someone write down a reason than to let the gate
 * guess intent.
 *
 * ⚠️ SCOPE IS **EXECUTABLE CODE**, and only that. Documentation contains these constants ON
 * PURPOSE — `README.md` printing an ssh command with the literal address exists so a human
 * can paste it, and forcing it to say `$A1_SSH_HOST` would make the runbook useless. The
 * quantity worth watching is *"does the CODE hold a second copy"*, not *"how often does this
 * string appear"*.
 *
 * ═══ EXIT CODES ═══
 *   0  PASS — each constant appears only where it was declared
 *   1  FAIL — a copy exists outside the allow-list
 *
 * Usage:
 *   node scripts/check-single-source.mjs
 *   node scripts/check-single-source.mjs --self-test
 */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SELF_TEST = process.argv.includes("--self-test");

/**
 * Each entry: a constant plus an allow-list **with reasons**.
 *
 * 🔴 Adding a path to `allowedIn` is a DECISION, not a way to make the gate green. Every
 * entry must state honestly why that copy is permitted to exist.
 */
export const CONSTRAINTS = [
  {
    name: "public server ssh destination",
    literal: "139.99.145.13",
    allowedIn: [
      { file: "local-net/lib/server.mjs", why: "SOURCE — the .mjs side" },
      { file: "local-net/deploy/server-env.sh", why: "SOURCE — the bash side" },
      { file: "local-net/deploy/Caddyfile", why: "belongs to the web-home worktree (hard rule #4); appears only inside example curl/ssh COMMENTS" },
    ],
  },
  {
    name: "ssh key path",
    literal: ".ssh/9chain-a1",
    allowedIn: [
      { file: "local-net/lib/server.mjs", why: "SOURCE — the .mjs side" },
      { file: "local-net/deploy/server-env.sh", why: "SOURCE — the bash side" },
      { file: "local-net/deploy/Caddyfile", why: "different worktree; comments only" },
    ],
  },
  {
    name: "networkID of the running network",
    literal: "999_999_999",
    allowedIn: [
      { file: "local-net/lib/chainid.mjs", why: "SOURCE on the JS side — `A1_ID_GOC`; everything else is derived from it" },
      { file: "scripts/check-consistency.mjs", why: "the Go-to-JS gate: knowing the number in order to compare IS its job (D-093)" },
      { file: "local-net/console/chainid-test.mjs", why: "🔴 DELIBERATE — a test must state its EXPECTED value literally. If it imported the same source as the thing under test, it would prove nothing." },
    ],
  },
];

/**
 * Scope: executable code. `--cached --others` so files that are NEW and not yet `git add`ed
 * are seen too; without that, a source file just created reads as "no longer contains the
 * string" and the gate goes green for the wrong reason.
 *
 * `patches/` and `docs/` are RECORDS — editing them to satisfy a gate is rewriting history.
 */
const CODE_FILES = /\.(mjs|js|ts|tsx|sh|yml|yaml|json)$/i;
const listFiles = () =>
  execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: ROOT, encoding: "utf8" })
    .split("\n").filter(Boolean)
    .filter((f) => !f.startsWith("patches/") && !f.startsWith("docs/"))
    .filter((f) => CODE_FILES.test(f) || f.endsWith("Caddyfile"))
    .filter((f) => !f.includes("node_modules") && !/(package|pnpm)-lock/.test(f))
    // Exclude THIS file: the place that declares the constraints obviously contains the
    // constants it watches. Without this the gate flags itself and can never be green — and
    // a gate that is always red gets switched off, becoming useless exactly when it matters.
    .filter((f) => f !== "scripts/check-single-source.mjs");

export function scan(constraint, files) {
  // A NUMERIC constant must match on boundaries: `999_999_999` is a substring of
  // `9_999_999_999` (the L1 range ceiling) ⇒ a plain substring match raises a false alarm in
  // `check-chainid.mjs`. This was hit while building the gate.
  const isNumeric = /^[\d_]+$/.test(constraint.literal);
  const rx = isNumeric ? new RegExp(`(?<![\\d_])${constraint.literal}(?![\\d_])`) : null;
  const found = [];
  for (const f of files) {
    let s;
    try { s = readFileSync(path.join(ROOT, f), "utf8"); } catch { continue; }
    if (rx ? rx.test(s) : s.includes(constraint.literal)) found.push(f);
  }
  const allowed = new Set(constraint.allowedIn.map((a) => a.file));
  return {
    found,
    extra: found.filter((f) => !allowed.has(f)),
    stale: [...allowed].filter((a) => !found.includes(a)),
  };
}

function main() {
  const files = listFiles();
  console.log(`\n══ ONE CONSTANT, ONE DECLARATION — ${files.length} code files in scope ══\n`);
  let broken = 0;
  for (const c of CONSTRAINTS) {
    const r = scan(c, files);
    const mark = r.extra.length === 0 ? "✓" : "🔴";
    console.log(`  ${mark} ${c.name}  (\`${c.literal}\`)  — in ${r.found.length} file(s)`);
    for (const a of c.allowedIn) console.log(`       · ${a.file}  — ${a.why}`);
    for (const f of r.extra) { console.log(`       🔴 COPY OUTSIDE THE ALLOW-LIST  ${f}`); broken++; }
    // An allow-list entry that no longer contains the string means the list has gone stale.
    // Report it, do not block: it is clutter in the documentation, not a leak.
    for (const a of r.stale) console.log(`       ℹ️  stale entry (no longer contains it): ${a}`);
  }
  console.log();
  if (broken) {
    console.log(`🔴 FAIL — ${broken} copy/copies outside the allow-list.`);
    console.log(`   Import from the source (\`local-net/lib/server.mjs\` or \`deploy/server-env.sh\`),`);
    console.log(`   or declare an exception WITH A REASON in CONSTRAINTS. Declaring it blindly`);
    console.log(`   is just blindfolding yourself.`);
    return 1;
  }
  console.log(`✅ PASS — ${CONSTRAINTS.length} constants, each only where it was declared.`);
  return 0;
}

function selfTest() {
  let pass = 0, fail = 0;
  const ok = (n, c, seen) => (c ? (pass++, console.log(`  ✓ ${n}`)) : (fail++, console.log(`  ✗ ${n} — ${seen}`)));
  console.log("\n══ COUNTER-CHECK — check-single-source ══\n");

  const c = { name: "probe", literal: "TEST_LITERAL_XYZ", allowedIn: [{ file: "a.mjs", why: "source" }] };
  const fake = new Map([
    ["a.mjs", "export const X = 'TEST_LITERAL_XYZ';"],
    ["b.mjs", "const X = 'TEST_LITERAL_XYZ';"],
    ["c.mjs", "nothing here"],
  ]);
  const scanFake = (c) => {
    const found = [...fake].filter(([, v]) => v.includes(c.literal)).map(([k]) => k);
    const allowed = new Set(c.allowedIn.map((a) => a.file));
    return { found, extra: found.filter((f) => !allowed.has(f)), stale: [...allowed].filter((a) => !found.includes(a)) };
  };
  const r = scanFake(c);
  ok("🔴 a second copy is caught", r.extra.length === 1 && r.extra[0] === "b.mjs", JSON.stringify(r.extra));
  ok("the legitimate source is NOT reported", !r.extra.includes("a.mjs"), JSON.stringify(r.extra));
  ok("a file without the string is untouched", !r.found.includes("c.mjs"), JSON.stringify(r.found));

  const c2 = { ...c, allowedIn: [...c.allowedIn, { file: "does-not-exist.mjs", why: "x" }] };
  ok("🔴 a stale allow-list entry is REPORTED (but does not block)",
    scanFake(c2).stale.includes("does-not-exist.mjs"), JSON.stringify(scanFake(c2).stale));

  // The real case, and the most expensive one: someone re-copying the IP into a backup script.
  const files = listFiles();
  const ipRule = CONSTRAINTS.find((x) => x.literal === "139.99.145.13");
  ok("REAL constant: the server IP currently has no copy outside the allow-list",
    scan(ipRule, files).extra.length === 0, JSON.stringify(scan(ipRule, files).extra));
  ok("🔴 and it IS still present in both sources (the gate is not green because the string vanished)",
    scan(ipRule, files).found.includes("local-net/lib/server.mjs") &&
    scan(ipRule, files).found.includes("local-net/deploy/server-env.sh"),
    JSON.stringify(scan(ipRule, files).found));

  console.log(`\n${fail === 0 ? "✅" : "🔴"} ${pass} passed · ${fail} failed`);
  return fail === 0 ? 0 : 1;
}

process.exit(SELF_TEST ? selfTest() : main());
