#!/usr/bin/env node
/**
 * check-remotes.mjs — can the places we push to still do the job we think they do?
 *
 * ═══ WHY THIS EXISTS ═══
 *
 * 2026-09-01, D-151: `git push origin main` returned 403 — the backup repository had been
 * ARCHIVED at 12:19Z and nobody knew. It had stopped accepting work seven hours earlier, with
 * 49 commits of G-day itself outside it.
 *
 * 🔴 The reason nothing noticed is the whole point of this gate. An archived repository keeps its
 * URL, keeps read access, answers `git fetch`, answers `git ls-remote`, and refuses exactly one
 * operation: WRITE. And write is the operation you perform only when you already have something
 * you want to save. A backup route that is broken looks identical to a backup route that is fine
 * right up to the moment you need it.
 *
 * ═══ THE TWO FAILURES, AND THEY POINT OPPOSITE WAYS ═══
 *
 *   BACKUP GOES READ-ONLY   work stops being copied off this machine. Silent. Already happened.
 *   PRIVATE GOES PUBLIC     work gets published by a push nobody thought twice about.
 *                           Not reversible. Never happened here, and this gate exists so the
 *                           first time is not discovered by a stranger reading it.
 *
 * The second is why the expected visibility is checked in BOTH directions rather than only
 * "is the backup reachable". After 2026-09-01 the publication remote and the backup remote are
 * one word apart in a command line, and one of them is the whole internet.
 *
 * ═══ WHAT IS A CONSTANT HERE AND WHAT IS MEASURED ═══
 *
 * `ROLES` below is INTENT — what a human decided each remote is for. It is a constant on purpose,
 * and it is not the D-112 failure (a gate comparing a file against a number copied from that same
 * file), because the other side of every comparison comes from GitHub's API, which has no idea
 * what this repository intends. Intent vs measurement is exactly the pair that says something.
 *
 * 🔴 The remote LIST is discovered from `git remote`, never from ROLES. A remote nobody declared
 * is a finding, not a silence: adding a push target is adding a place work can go, and the person
 * adding it is the person who knows what it is for.
 *
 * Exit codes: `0` fine (warnings allowed) · `1` a remote cannot do its job · `2` could not measure.
 *
 * Usage:
 *   node scripts/check-remotes.mjs
 *   node scripts/check-remotes.mjs --self-test
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SELF_TEST = process.argv.includes("--self-test");

/**
 * What each remote is FOR. Declared by a human; measured against GitHub.
 *
 * `write: true` means "work is supposed to be able to reach this place". That is the property
 * that broke, and it is not the same as "reachable" — the archived repository stayed reachable.
 */
export const ROLES = {
  official: {
    visibility: "PUBLIC",
    write: true,
    why: "the published repository — pushing here puts bytes on the internet and cannot be undone",
  },
  origin: {
    visibility: "PRIVATE",
    write: true,
    why: "the backup route — it exists so work survives losing this machine",
  },
  "archived-31aug": {
    visibility: "PRIVATE",
    write: false,
    archived: true,
    why: "kept as a RECORD of the backup route up to 2026-08-31; read-only by design (D-151)",
  },
};

/**
 * 🔴 Permission is NOT the signal for "can work reach this place", and measuring proved it.
 *
 * Counter-check on real data 2026-09-01: the archived repository reports `viewerPermission: ADMIN`.
 * The account still administers it; GitHub simply refuses writes because the repo is archived. So
 * a gate that asked only "do I have write permission" would have been GREEN through the entire
 * outage. `isArchived` is the discriminator; permission is the second question, not the first.
 */
const PERMS_THAT_CAN_WRITE = new Set(["WRITE", "MAINTAIN", "ADMIN"]);

const git = (args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();

/** GitHub `owner/name` from a remote URL, or null when the remote is not GitHub. */
export function githubSlug(url) {
  const m = url.match(/github\.com[:/]+([^/]+)\/([^/]+?)(?:\.git)?\/?$/i);
  return m ? `${m[1]}/${m[2]}` : null;
}

function listRemotes() {
  const out = git(["remote", "-v"]);
  const seen = new Map();
  for (const line of out.split(/\r?\n/).filter(Boolean)) {
    const [name, url, kind] = line.split(/\s+/);
    if (kind !== "(push)") continue;
    seen.set(name, url);
  }
  return [...seen].map(([name, url]) => ({ name, url }));
}

/** Ask GitHub. Never inferred from anything in this repository. */
function measure(slug) {
  const raw = execFileSync("gh", ["repo", "view", slug, "--json", "visibility,isArchived,viewerPermission,defaultBranchRef"], {
    encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
  });
  const j = JSON.parse(raw);
  return {
    visibility: j.visibility,
    archived: j.isArchived,
    permission: j.viewerPermission,
    defaultBranch: j.defaultBranchRef?.name ?? null,
  };
}

/**
 * How far `main` has NOT reached a remote.
 *
 * Returns `null` — never `0` — when it cannot be counted. A backup whose lag is unknown is not a
 * backup that is up to date, and printing `0` for "I could not tell" is the failure this whole
 * repository keeps paying for.
 */
function behindCount(remote, localTip) {
  let sha;
  try {
    const out = execFileSync("git", ["ls-remote", "--heads", remote, "main"], { cwd: ROOT, encoding: "utf8" }).trim();
    sha = out.split(/\s+/)[0];
  } catch { return { sha: null, count: null }; }
  if (!sha) return { sha: null, count: null };
  if (sha === localTip) return { sha, count: 0 };
  try {
    execFileSync("git", ["cat-file", "-e", `${sha}^{commit}`], { cwd: ROOT, stdio: "ignore" });
  } catch { return { sha, count: null }; }
  return { sha, count: Number(git(["rev-list", "--count", `${sha}..main`])) };
}

// ───────────────────────────── judgement (pure — the self-test drives it) ─────────────────────────────

/**
 * @param remotes  [{name, url, slug}]
 * @param facts    { [name]: {visibility, archived, permission, defaultBranch} | {error} }
 * @param lag      { [name]: {sha, count} }
 */
export function judge(remotes, facts, lag, roles = ROLES) {
  const findings = [];
  const warnings = [];
  const red = (name, msg) => findings.push({ name, msg });
  const warn = (name, msg) => warnings.push({ name, msg });

  for (const r of remotes) {
    const role = roles[r.name];
    if (!role) {
      red(r.name, `undeclared remote → ${r.url}. Adding a push target adds a place work can go; `
        + "say what it is for in ROLES, or remove it");
      continue;
    }
    const f = facts[r.name];
    if (!f || f.error) { red(r.name, `could not read its state: ${f?.error ?? "no data"}`); continue; }

    if (f.visibility !== role.visibility) {
      red(r.name, `is ${f.visibility}, declared ${role.visibility}`
        + (f.visibility === "PUBLIC" ? " — 🔴 anything already pushed here is PUBLISHED and cannot be recalled" : ""));
    }
    if (role.write) {
      if (f.archived) {
        red(r.name, "is ARCHIVED — read-only. It answers fetch and ls-remote and refuses only "
          + "writes, so nothing looks wrong until the push you needed (D-151)");
      }
      if (!PERMS_THAT_CAN_WRITE.has(f.permission)) {
        red(r.name, `viewer permission is ${f.permission} — work cannot reach it`);
      }
      const l = lag[r.name] ?? { sha: null, count: null };
      if (!l.sha) red(r.name, "has no `main` branch — nothing has ever reached it");
      else if (l.count === null) warn(r.name, "lag UNKNOWN (its tip is not in the local object database) — not the same as up to date");
      else if (l.count > 0) {
        const stuck = f.archived || !PERMS_THAT_CAN_WRITE.has(f.permission);
        (stuck ? red : warn)(r.name, `${l.count} commit(s) of local main are not there`
          + (stuck ? " — and it cannot accept them, so the gap is permanent" : ""));
      }
    } else {
      if (role.archived && !f.archived) warn(r.name, "declared a read-only record, but it is writable again");
    }
  }
  for (const name of Object.keys(roles)) {
    if (!remotes.some((r) => r.name === name)) {
      red(name, "declared in ROLES but MISSING from `git remote` — a route that was supposed to exist does not");
    }
  }
  return { findings, warnings };
}

// ───────────────────────────── self-test ─────────────────────────────

function selfTest() {
  const R = {
    official: { visibility: "PUBLIC", write: true, why: "" },
    origin: { visibility: "PRIVATE", write: true, why: "" },
    old: { visibility: "PRIVATE", write: false, archived: true, why: "" },
  };
  const rem = (...names) => names.map((n) => ({ name: n, url: `https://github.com/x/${n}.git`, slug: `x/${n}` }));
  const ok = { visibility: "PRIVATE", archived: false, permission: "ADMIN", defaultBranch: "main" };
  /**
   * Each case declares ONLY the roles it is about. Without this every single-remote case also
   * collected a "declared but MISSING" finding for the other two — which made the VANISHED case
   * below pass for the wrong reason. Seen while building this: a green that came from the bug.
   */
  const pick = (names) => Object.fromEntries(names.map((n) => [n, R[n]]));
  const run = (remotes, facts, lag, roles) => judge(remotes, facts, lag, roles ?? pick(remotes.map((r) => r.name)));
  const reds = (r) => r.findings.map((f) => f.msg).join(" | ");

  const cases = [
    ["a healthy private backup is not a finding",
      run(rem("origin"), { origin: ok }, { origin: { sha: "a", count: 0 } }).findings.length === 0],

    ["🔴 an ARCHIVED backup is caught — the failure of 2026-09-01",
      /ARCHIVED/.test(reds(run(rem("origin"), { origin: { ...ok, archived: true } }, { origin: { sha: "a", count: 0 } })))],

    ["🔴 a backup that has gone PUBLIC is caught, and says the bytes are already out",
      /PUBLISHED and cannot be recalled/.test(
        reds(run(rem("origin"), { origin: { ...ok, visibility: "PUBLIC" } }, { origin: { sha: "a", count: 0 } })))],

    ["…and PUBLIC on the publication remote is NOT a finding",
      run(rem("official"), { official: { ...ok, visibility: "PUBLIC" } }, { official: { sha: "a", count: 0 } }).findings.length === 0],

    ["read-only viewer permission on a write target is caught",
      /permission is READ/.test(reds(run(rem("origin"), { origin: { ...ok, permission: "READ" } }, { origin: { sha: "a", count: 0 } })))],

    ["a write target with no main branch is caught",
      /has no `main` branch/.test(reds(run(rem("origin"), { origin: ok }, { origin: { sha: null, count: null } })))],

    ["being behind a WRITABLE remote is a warning, not a failure (unpushed work is normal)",
      (() => { const r = run(rem("origin"), { origin: ok }, { origin: { sha: "a", count: 7 } });
        return r.findings.length === 0 && r.warnings.length === 1; })()],

    ["🔴 being behind an ARCHIVED remote IS a failure — the gap can never close",
      /gap is permanent/.test(reds(run(rem("origin"), { origin: { ...ok, archived: true } }, { origin: { sha: "a", count: 49 } })))],

    ["🔴 lag that could not be counted is reported, never treated as 0",
      (() => { const r = run(rem("origin"), { origin: ok }, { origin: { sha: "a", count: null } });
        return r.findings.length === 0 && /UNKNOWN/.test(r.warnings[0].msg); })()],

    ["an UNDECLARED remote is caught — nobody said what it is for",
      /undeclared remote/.test(reds(run([{ name: "scratch", url: "https://github.com/x/y.git", slug: "x/y" }], {}, {})))],

    ["a declared remote that has VANISHED is caught",
      /MISSING from/.test(reds(run(rem("origin"), { origin: ok }, { origin: { sha: "a", count: 0 } }, R)))],

    ["…and it names the one that vanished, not the one that is present",
      (() => { const r = run(rem("origin"), { origin: ok }, { origin: { sha: "a", count: 0 } }, R);
        const names = r.findings.map((f) => f.name).sort();
        return names.join(",") === "official,old"; })()],

    ["the archived RECORD remote being archived is not a finding",
      run(rem("old"), { old: { ...ok, archived: true, permission: "READ" } }, {}).findings.length === 0],

    ["…and if that record becomes writable again, it is a warning, not silence",
      run(rem("old"), { old: { ...ok, archived: false } }, {}).warnings.length === 1],

    ["a remote whose state could not be read is a finding, not a pass",
      /could not read its state/.test(reds(run(rem("origin"), { origin: { error: "HTTP 404" } }, {})))],

    ["a non-GitHub remote URL yields no slug (so it is reported, not silently skipped)",
      githubSlug("git@gitlab.com:x/y.git") === null && githubSlug("https://github.com/a/b.git") === "a/b"],
  ];

  let bad = 0;
  for (const [name, pass] of cases) { console.log(`  ${pass ? "✓" : "🔴"} ${name}`); if (!pass) bad++; }
  console.log(`\n  ${cases.length - bad}/${cases.length} reverse controls passed`);
  return bad ? 1 : 0;
}

// ───────────────────────────── main ─────────────────────────────

function main() {
  if (SELF_TEST) return selfTest();

  try {
    execFileSync("gh", ["auth", "status"], { stdio: "ignore" });
  } catch {
    console.log("⁇ `gh` is unavailable or not authenticated — COULD NOT MEASURE.");
    console.log("   Every verdict below would otherwise be a guess about a place work is pushed to.");
    return 2;
  }

  const localTip = git(["rev-parse", "main"]);
  const remotes = [];
  const facts = {};
  const lag = {};
  let unmeasurable = 0;

  for (const r of listRemotes()) {
    const slug = githubSlug(r.url);
    remotes.push({ ...r, slug });
    if (!slug) { facts[r.name] = { error: `not a GitHub URL (${r.url}) — this gate cannot judge it` }; unmeasurable++; continue; }
    try { facts[r.name] = measure(slug); } catch (e) { facts[r.name] = { error: String(e.message).split("\n")[0] }; }
    lag[r.name] = behindCount(r.name, localTip);
  }

  console.log(`check-remotes — ${remotes.length} push target(s) · local main ${localTip.slice(0, 7)}`);
  for (const r of remotes) {
    const f = facts[r.name] ?? {};
    const l = lag[r.name];
    const state = f.error ? `⁇ ${f.error}`
      : `${f.visibility}${f.archived ? " · ARCHIVED" : ""} · ${f.permission}`
        + (l ? ` · behind ${l.count === null ? "?" : l.count}` : "");
    console.log(`  ${r.name.padEnd(16)} ${(r.slug ?? r.url).padEnd(30)} ${state}`);
  }

  const { findings, warnings } = judge(remotes, facts, lag);
  for (const w of warnings) console.log(`\n  🟡 ${w.name}: ${w.msg}`);
  if (!findings.length) {
    console.log("\n✓ Every push target can still do the job it was declared for.");
    console.log("  Read the names before pushing: one of them is the internet.");
    return unmeasurable ? 2 : 0;
  }
  for (const f of findings) console.log(`\n  🔴 ${f.name}: ${f.msg}`);
  console.log(`\n🔴 ${findings.length} problem(s) with the places this repository pushes to.`);
  return 1;
}

process.exit(main());
