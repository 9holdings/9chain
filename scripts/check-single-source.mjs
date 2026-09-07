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
      { file: "local-net/deploy/publish-official.sh", why: "🔴 DELIBERATE — this script is the LEAK DETECTOR for this very string: it must carry the literal in its `git grep` patterns, or it cannot find the leak. Sourcing it from server-env.sh would make the detector depend on the thing it audits, and one rename would turn the gate green while the string stayed at HEAD (D-182)." },
    ],
  },
  {
    name: "ssh key path",
    literal: ".ssh/9chain-a1",
    allowedIn: [
      { file: "local-net/lib/server.mjs", why: "SOURCE — the .mjs side" },
      { file: "local-net/deploy/server-env.sh", why: "SOURCE — the bash side" },
      { file: "local-net/deploy/Caddyfile", why: "different worktree; comments only" },
      { file: "local-net/deploy/publish-official.sh", why: "🔴 DELIBERATE — same reason as the ssh destination above: the detector has to name what it hunts for." },
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
  // ── Two constants added by the 2026-09-06 run without registering them here (D-227) ──
  {
    name: "parent C-Chain EVM chainId",
    literal: "9_000_000_009",
    // Opt-in: this constant is spelled both ways in the tree. The networkID constraint above
    // keeps its original underscore-only scope — widening it would pull thirteen files of the
    // DEAD generation's number under a rule written for the live one, a different decision.
    anySpelling: true,
    allowedIn: [
      { file: "local-net/lib/chainid.mjs", why: "SOURCE — `A1_PARENT_EVM_CHAIN_ID`, stable across generations (D-047)" },
      { file: "local-net/console/server.mjs", why: "COMMENTS ONLY — the D-069 derivation of the L1 range is explained in prose there; the code imports the constant" },
      { file: "local-net/console/chainid-test.mjs", why: "🔴 DELIBERATE — a test states its expected value literally" },
      { file: "local-net/console/siwe-test.mjs", why: "🔴 DELIBERATE — the SIWE fixture states the chainId a wallet would sign, literally" },
      { file: "local-net/console/readiness-e2e-test.mjs", why: "🔴 DELIBERATE — asserts the exported constant IS this number, and feeds it as a wrong-typed RPC answer" },
      { file: "scripts/check-chain-ledger.mjs", why: "🔴 DELIBERATE — self-test states the decimal the hex `0x218711a09` must parse to" },
      { file: "scripts/check-live-page.mjs", why: "🔴 DELIBERATE — self-test fixtures reproduce the footer the public page prints, byte for byte" },
      { file: "scripts/check-chainid.mjs", why: "the public-registry gate (G4): it lists the ids it must look up by name, and explains the neighbourhood it scans" },
      { file: "local-net/faucet/ceremony-9s-union.mjs", why: "an operator INPUT (`--expect-chainid` default) and its self-test stub — the ceremony must not silently follow a repo constant on the night" },
      { file: "local-net/lib/console-readiness-test.mjs", why: "🔴 DELIBERATE — the readiness fixture states the parentChainId the console must report" },
      { file: "scripts/gday-preflight.mjs", why: "MANUAL-TASK prose: names the number a person must read off a page on G-day" },
      { file: "web/app/re-genesis/page.tsx", why: "web-home worktree — not editable from `main` (hard rule #4); `check-live-page` measures the served value against the chain" },
      { file: "web/lib/chain.ts", why: "web-home worktree — same; it is the web's own declared copy, measured by `check-live-page`" },
      { file: "web/lib/i18n/vi.ts", why: "Vietnamese UI text of the web-home worktree; the number appears in a sentence, not as a constant" },
      { file: "web/scripts/gen-og.mjs", why: "web-home worktree — the Open Graph image renders the number as text" },
    ],
  },
  {
    name: "node API inside a managed container",
    literal: "127.0.0.1:9650",
    allowedIn: [
      { file: "local-net/lib/managed-node-rpc.mjs", why: "SOURCE — `MANAGED_NODE_API`; the console's `compose exec … curl` calls import it" },
      { file: "local-net/faucet/heartbeat-pump.mjs", why: "a DIFFERENT quantity that happens to spell the same: the host-side default of one node's mapped port, overridable by env" },
      { file: "local-net/faucet/probe-net.mjs", why: "usage comment only" },
      { file: "scripts/export-chain.mjs", why: "host-side CLI default (`--rpc`), the O2 export runs on the server host" },
      { file: "scripts/check-l1-upgrades.mjs", why: "a bash probe rendered INTO a container over `docker exec`; it cannot import an ESM constant" },
      { file: "scripts/drill-upgrade-rollback.mjs", why: "the training-band drill's in-container curl; kept literal so the drill cannot be redirected by editing one shared constant" },
      { file: "local-net/tools/stake-validator/run-over-tunnel.sh", why: "an ssh -L tunnel spec (local:remote), bash" },
      { file: "scripts/wallet-over-tunnel.mjs", why: "comment describing the tunnel (M11.10)" },
      { file: "local-net/deploy/caddy.compose.yml", why: "belongs to the web-home worktree; comment only" },
      { file: "local-net/deploy/Caddyfile", why: "belongs to the web-home worktree (hard rule #4); the reverse-proxy upstream, which IS the host-side mapped port" },
      { file: "explorer-full/9chain-a1-server.override.yml", why: "comment only, explorer stack" },
    ],
  },
];

/**
 * A NUMERIC literal is matched on digit boundaries. With `anySpelling`, digit-group underscores
 * are optional: `9000000009` and `9_000_000_009` are the same copy of the same constant, and
 * the first version of this gate only saw the spelling it was given (D-227).
 */
export function literalPattern(literal, anySpelling = false) {
  if (!/^[\d_]+$/.test(literal)) return null;
  const digits = literal.replace(/_/g, "");
  const body = anySpelling ? digits.split("").join("_?") : literal;
  return new RegExp(`(?<![\\d_])${body}(?![\\d_])`);
}

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
  const rx = literalPattern(constraint.literal, constraint.anySpelling === true);
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

  console.log("\n── numeric spellings (D-227) ──");
  const nine = literalPattern("9_000_000_009", true);
  ok("🔴 `9000000009` (no underscores) IS the same constant", nine.test("const x = 9000000009;"), "no match");
  ok("`9_000_000_009` still matches", nine.test("chainId: 9_000_000_009"), "no match");
  ok("🔴 `9000000010` (the L1 range floor) is NOT a copy of it", !nine.test("goc = 9000000010"), "matched");
  ok("🔴 `19000000009` is NOT a copy of it (boundary)", !nine.test("x = 19000000009"), "matched");
  ok("without opt-in the original spelling-exact scope is kept (the networkID rule must not widen by accident)",
    !literalPattern("999_999_999").test("id = 999999999") && literalPattern("999_999_999").test("id = 999_999_999"), "widened");
  ok("a non-numeric literal has no pattern (substring match is used)", literalPattern("127.0.0.1:9650") === null, "pattern");

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
