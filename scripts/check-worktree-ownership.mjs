#!/usr/bin/env node
/**
 * check-worktree-ownership.mjs — gate: **a branch only touches the paths it owns, and only
 * deploys the surfaces it owns.**
 *
 * ═══ 🔴 WHY IT EXISTS (D-194, 2026-09-05) ═══
 *
 * Hard rule #4 — "only ONE session deploys; the running Caddyfile comes from `web-home`, not
 * `main`" — was a sentence. Nothing measured it. Measured on 2026-09-05: `main` and `web-home`
 * forked on 2026-08-27, and nine files had since been edited on BOTH branches, five of them
 * deploy scripts (`Caddyfile` 1,733 lines apart). On 2026-09-04 two sessions deployed Caddy
 * fifteen minutes apart and were saved by byte-identical output, i.e. by luck.
 *
 * The table is `scripts/worktree-ownership.json`. This gate reads it and answers two questions:
 *
 *   1. Given the CURRENT branch and the paths that are about to be committed (staged, unstaged
 *      and untracked — the working tree as it is), is every path one this branch may touch?
 *   2. `--deploy <surface>`: may this branch push that surface to the server at all?
 *
 * A path is allowed when it matches one of the branch's `owns` globs, or a `shared` glob, or —
 * for the `defaultOwner` only — when NO branch owns it. A path owned by ANOTHER branch is a
 * violation whatever else it matches: that is the whole point.
 *
 * ═══ WHAT IT DOES NOT MEASURE ═══
 *
 * It reads the working tree, not history: a violation already committed on the wrong branch is
 * found with `--range <A..B>` (e.g. `--range main..web-home --branch web-home`), not by default.
 * It cannot see the server — `deploy-lock.sh` (D-194) is the half that runs there.
 *
 * ═══ EXIT CODES (G-day toolkit convention) ═══
 *   0  PASS — every path is allowed on this branch (or the surface is this branch's to deploy)
 *   1  FAIL — a path belongs to another branch, or the surface does not
 *   2  UNKNOWN — detached HEAD, a branch the table cannot place, no git, malformed table.
 *      Unknown is never a pass: a temporary `claude/*` worktree is exactly the place work got
 *      lost in (three orphaned commits, D-193), and it must be given a name the table knows.
 *
 * Usage:
 *   node scripts/check-worktree-ownership.mjs                    # this worktree, as it is
 *   node scripts/check-worktree-ownership.mjs --range main..web-home --branch web-home
 *   node scripts/check-worktree-ownership.mjs --deploy console   # may this branch deploy it?
 *   node scripts/check-worktree-ownership.mjs --self-test        # 14 cases, incl. one bad table
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TABLE_PATH = path.join(HERE, "worktree-ownership.json");
// 🔴 The worktree under test is the one the command is RUN IN, never the one this file lives in.
// First draft derived ROOT from the script's own location, so `node ../../../scripts/check-…`
// from a detached worktree measured `main` and said "✓" about a worktree it never looked at —
// the exact worktree kind this gate exists to flag. Seen red on 2026-09-05; hence `--show-toplevel`.
const ROOT = (() => {
  try { return execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: process.cwd(), encoding: "utf8" }).trim(); }
  catch { return null; }
})();

const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(name);
  return i === -1 ? null : (argv[i + 1] ?? "");
};
const SELF_TEST = argv.includes("--self-test");
const RANGE = flag("--range");
const BRANCH_OVERRIDE = flag("--branch");
const DEPLOY = flag("--deploy");

// ── glob → regex ───────────────────────────────────────────────────────────────────────────
// `**` crosses directories, `*`/`?` do not. A pattern with no `/` matches a basename anywhere,
// which is how `*.md` means "every markdown file" and `LICENSE` means "any file so named".
export function globToRegExp(glob) {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*") {
      if (glob[i + 1] === "*") {
        // `**/` matches zero or more directories; a trailing `**` matches the rest.
        if (glob[i + 2] === "/") { re += "(?:.*/)?"; i += 2; } else { re += ".*"; i += 1; }
      } else re += "[^/]*";
    } else if (c === "?") re += "[^/]";
    else re += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(glob.includes("/") ? `^${re}$` : `(^|/)${re}$`);
}

// ── the table ──────────────────────────────────────────────────────────────────────────────
export function loadTable(json) {
  const t = typeof json === "string" ? JSON.parse(json) : json;
  const errors = [];
  if (!t.branches || typeof t.branches !== "object") errors.push("no `branches`");
  if (!t.branches?.[t.defaultOwner]) errors.push(`defaultOwner \`${t.defaultOwner}\` is not a branch entry`);
  // Two branches claiming the same LITERAL path is an ambiguous table — nobody can be red
  // against it, so the table itself is rejected rather than resolved by iteration order.
  const literal = new Map();
  for (const [name, b] of Object.entries(t.branches ?? {})) {
    for (const g of b.owns ?? []) {
      if (/[*?]/.test(g)) continue;
      if (literal.has(g) && literal.get(g) !== name) errors.push(`\`${g}\` is owned by both \`${literal.get(g)}\` and \`${name}\``);
      literal.set(g, name);
    }
  }
  if (errors.length) throw new Error("malformed ownership table: " + errors.join("; "));
  return t;
}

export function resolveBranch(table, branch) {
  if (!branch || branch === "HEAD") return null;
  if (table.branches[branch]) return branch;
  for (const [re, target] of Object.entries(table.branchAliases ?? {})) {
    if (new RegExp(re).test(branch)) return table.branches[target] ? target : null;
  }
  return null;
}

/**
 * Who owns one path: a branch name, `"shared"`, or null when nobody names it.
 *
 * The MOST SPECIFIC pattern wins, not the first branch in the table: a literal path beats any
 * glob, and a longer glob beats a shorter one. Without this, `main`'s `scripts/**` shadowed
 * `web-home`'s literal `scripts/serve-out.mjs` purely because `main` is listed first — the
 * table said one thing and the gate another (seen on the first `--range` run, 2026-09-05).
 */
export function ownerOf(table, file) {
  const f = file.replace(/\\/g, "/");
  for (const g of table.shared?.globs ?? []) if (globToRegExp(g).test(f)) return "shared";
  let best = null;
  for (const [name, b] of Object.entries(table.branches)) {
    for (const g of b.owns ?? []) {
      if (!globToRegExp(g).test(f)) continue;
      const score = (/[*?]/.test(g) ? 0 : 1_000_000) + g.length;
      if (!best || score > best.score) best = { name, score };
    }
  }
  return best?.name ?? null;
}

/** Judge a list of paths on a branch. Returns `{ ok, violations: [{file, owner}] }`. */
export function judge(table, branch, files) {
  const violations = [];
  for (const file of files) {
    const owner = ownerOf(table, file);
    if (owner === "shared" || owner === branch) continue;
    if (owner === null && branch === table.defaultOwner) continue;
    violations.push({ file, owner: owner ?? `nobody (default owner is \`${table.defaultOwner}\`)` });
  }
  return { ok: violations.length === 0, violations };
}

export function mayDeploy(table, branch, surface) {
  return (table.branches[branch]?.deploys ?? []).includes(surface);
}

// ── git ────────────────────────────────────────────────────────────────────────────────────
function git(...args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
}

function currentBranch() {
  try { return git("rev-parse", "--abbrev-ref", "HEAD"); } catch { return null; }
}

/** Paths as the working tree stands: staged, unstaged, untracked. Renames report the new name. */
function workingTreePaths() {
  const out = git("status", "--porcelain=v1", "-uall", "--no-renames");
  return out.split("\n").filter(Boolean).map((l) => l.slice(3).trim().replace(/^"|"$/g, ""));
}

function rangePaths(range) {
  const [a, b] = range.split(/\.\.\.?/);
  if (!a || !b) throw new Error(`--range wants A..B, got \`${range}\``);
  // Three-dot on purpose: "what B changed since it forked from A". Two-dot `git diff A B` also
  // lists every file A changed and B did not, and blames B for them.
  return git("diff", "--name-only", `${a}...${b}`).split("\n").filter(Boolean);
}

// ── main ───────────────────────────────────────────────────────────────────────────────────
function main() {
  let table;
  try { table = loadTable(readFileSync(TABLE_PATH, "utf8")); }
  catch (e) { console.log(`?  ${e.message}`); return 2; }
  if (!ROOT) { console.log("?  not inside a git worktree — nothing to judge"); return 2; }
  console.log(`   worktree: ${ROOT}`);

  const raw = BRANCH_OVERRIDE ?? (RANGE ? RANGE.split("..")[1] : currentBranch());
  const branch = resolveBranch(table, raw);
  if (!branch) {
    console.log(`?  branch \`${raw ?? "(no git)"}\` is not in the ownership table and matches no alias.`);
    console.log("   Detached HEAD and `claude/*` worktrees land here on purpose: three commits were lost");
    console.log("   in exactly such worktrees (D-193). Give the branch a name the table knows — `web-…`");
    console.log("   for site work, `audit-…` for review, or work on `main` — or pass --branch <owner>.");
    return 2;
  }

  if (DEPLOY !== null) {
    if (mayDeploy(table, branch, DEPLOY)) { console.log(`✓  \`${branch}\` may deploy \`${DEPLOY}\``); return 0; }
    const owner = Object.entries(table.branches).find(([, b]) => (b.deploys ?? []).includes(DEPLOY))?.[0];
    console.log(`✗  \`${branch}\` may NOT deploy \`${DEPLOY}\`${owner ? ` — that surface belongs to \`${owner}\`` : " — no branch owns that surface"}.`);
    console.log("   Hard rule #4: one session per surface. Deploy from the owning worktree, or record a");
    console.log("   DECISION in DECISIONS.md and change scripts/worktree-ownership.json.");
    return 1;
  }

  let files;
  try { files = RANGE ? rangePaths(RANGE) : workingTreePaths(); }
  catch (e) { console.log(`?  ${e.message}`); return 2; }

  const scope = RANGE ? `commits ${RANGE}` : "the working tree (staged + unstaged + untracked)";
  console.log(`check-worktree-ownership — branch \`${raw}\` → \`${branch}\` · ${files.length} path(s) in ${scope}`);
  const { ok, violations } = judge(table, branch, files);
  if (ok) { console.log(`✓  every path is one \`${branch}\` may touch`); return 0; }
  for (const v of violations) console.log(`✗  ${v.file}  — owned by ${v.owner}`);
  console.log(`\n✗ ${violations.length} path(s) belong to another branch. Move the change to the owning worktree,`);
  console.log("  or record a DECISION and change scripts/worktree-ownership.json — never both silently.");
  return 1;
}

// ── self-test: the gate must be seen red before it is trusted ──────────────────────────────
function selfTest() {
  const table = loadTable(readFileSync(TABLE_PATH, "utf8"));
  const cases = [
    // [branch as typed, files, expected ok, why]
    ["web-home", ["local-net/console/server.mjs"], false, "web-home touching the console"],
    ["web-home", ["local-net/deploy/publish-official.sh"], false, "web-home touching the publication script"],
    ["web-home", ["web/app/page.tsx", "local-net/deploy/Caddyfile"], true, "web-home on its own surface"],
    ["web-home", ["HANDOFF.md", "docs/WEB-PROGRESS.md"], true, "shared notebooks from web-home"],
    ["web-home", ["brand-new-dir/thing.txt"], false, "an unowned path is the default owner's, not web-home's"],
    ["web-rescue-orphans-20260905", ["web/test/net.test.ts"], true, "a `web-…` branch resolves to web-home"],
    ["web-home", ["scripts/serve-out.mjs"], true, "a literal beats main's `scripts/**` glob (specificity, not table order)"],
    ["main", ["scripts/serve-out.mjs"], false, "…and the same literal is a violation on main"],
    ["main", ["web/lib/chain.ts"], false, "main touching the site"],
    ["main", ["local-net/deploy/Caddyfile"], false, "main touching the running Caddyfile (hard rule #4)"],
    ["main", ["scripts/gday-preflight.mjs", "patches/0001-x.patch", "brand-new-dir/thing.txt"], true, "main on its surface, plus an unowned path"],
    ["main", ["local-net/deploy/check-html.mjs"], true, "the one deliberately shared deploy file"],
    ["audit", ["docs/AUDIT-A1/00-CHARTER.md"], true, "audit writing its reports"],
    ["audit", ["scripts/anything.mjs"], false, "audit touching code"],
  ];
  let failed = 0;
  for (const [branch, files, expectOk, why] of cases) {
    const resolved = resolveBranch(table, branch);
    const r = resolved ? judge(table, resolved, files) : { ok: null };
    const pass = r.ok === expectOk;
    console.log(`${pass ? "✓" : "✗"}  ${why} → ${r.ok ? "allowed" : "violation"}${pass ? "" : ` (expected ${expectOk ? "allowed" : "violation"})`}`);
    if (!pass) failed++;
  }
  // Unknown branches must be 2, never 0 — a `claude/*` worktree is where work was lost.
  for (const b of ["claude/objective-cori-f15780", "HEAD", "feature-x"]) {
    const pass = resolveBranch(table, b) === null;
    console.log(`${pass ? "✓" : "✗"}  \`${b}\` is not placed by the table (must be UNKNOWN, code 2)`);
    if (!pass) failed++;
  }
  // Deploy surfaces.
  for (const [b, s, expect] of [["main", "console", true], ["web-home", "console", false], ["web-home", "caddy", true], ["main", "caddy", false], ["audit", "web", false]]) {
    const pass = mayDeploy(table, b, s) === expect;
    console.log(`${pass ? "✓" : "✗"}  \`${b}\` --deploy ${s} → ${expect ? "allowed" : "refused"}`);
    if (!pass) failed++;
  }
  // A table that is ambiguous must be REJECTED, not resolved by iteration order.
  try {
    loadTable({ defaultOwner: "a", branches: { a: { owns: ["x/y.txt"] }, b: { owns: ["x/y.txt"] } } });
    console.log("✗  an ambiguous table (two owners for one literal path) was accepted"); failed++;
  } catch (e) {
    console.log(`✓  an ambiguous table is refused: ${e.message}`);
  }
  // Every path the real repo tracks must have exactly one answer — and the answer must be
  // consistent: nothing tracked on `main` today may be owned by `web-home` (else main is red
  // the moment someone edits it, and the table — not the edit — is what is wrong).
  if (!ROOT) { console.log("?  not inside a git worktree — the tracked-paths case cannot run"); return 2; }
  const tracked = git("ls-files").split("\n").filter(Boolean);
  const foreign = tracked.filter((f) => { const o = ownerOf(table, f); return o !== null && o !== "shared" && o !== "main"; });
  // Files main carries but web-home owns are expected: main holds stale copies of the site and
  // of Caddy (the running ones come from web-home). List them so the number is visible, and
  // fail only if something OUTSIDE the known web surface shows up there.
  const unexpected = foreign.filter((f) => !/^(web\/|local-net\/chains|local-net\/chains-nginx|local-net\/deploy\/(Caddyfile|caddy-deploy\.sh|caddy\.compose\.yml|web-deploy\.sh|check-routes\.mjs|check-chain-id\.mjs|check-decentralisation-claim\.mjs)|scripts\/serve-out\.mjs)/.test(f));
  console.log(`${unexpected.length ? "✗" : "✓"}  ${tracked.length} tracked paths on this branch; ${foreign.length} are web-home's (stale copies main carries)${unexpected.length ? `; UNEXPECTED: ${unexpected.join(", ")}` : ""}`);
  if (unexpected.length) failed++;

  console.log(failed ? `\n✗ self-test: ${failed} case(s) failed` : `\n✓ self-test: ${cases.length + 3 + 5 + 2} cases, all as expected`);
  return failed ? 1 : 0;
}

process.exitCode = SELF_TEST ? selfTest() : main();
