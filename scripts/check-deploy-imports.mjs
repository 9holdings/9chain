#!/usr/bin/env node
/**
 * check-deploy-imports.mjs — gate: **does the deploy manifest ship everything the code IMPORTS?**
 *
 * ═══ 🔴 WHY IT EXISTS — a two-minute outage on 2026-09-03 ═══
 *
 * `console/server.mjs` gained one line, `import … from "../lib/l1-allowlist.mjs"`. The deploy
 * manifest lists each dependency BY HAND (`eip55.mjs`, `guard.mjs`, `presets.mjs`, …) and nobody
 * added the new one. `console-deploy.sh` shipped `server.mjs` and not the file it imports, the
 * console could not start, and `localhost:8091` answered nothing for about two minutes.
 *
 * 🔴 **AND THE DRIFT GATE SAID EVERYTHING WAS FINE.** `check-deploy-drift` reported every file in
 * its scope as matching byte for byte while the console was dead — correctly, on its own terms:
 * it compares the files it was TOLD about, and a dependency nobody listed is not one of them.
 * Same lesson as D-158, arriving a third time: **no gate measures an absence.** A file that was
 * never declared cannot be missing from anything.
 *
 * ⚠️ The static page kept answering 200 the whole time, because Caddy serves `/create-chain/`
 * from `web/`. Only `/console/*` was gone. A green front page proved nothing about the console —
 * which is why this gate reads the IMPORT GRAPH rather than a page.
 *
 * ## WHAT IT MEASURES, AND WHERE (CLAUDE.md section 2)
 *
 * | Question | Measured by | Where |
 * |---|---|---|
 * | What does the code actually need? | parsing `import`/`from` in each entry, transitively | THE REPO |
 * | What will the deploy send? | `manifest-deploy.json` group file lists | THE MANIFEST |
 *
 * It compares two things in the repo, so it needs no network and no server, and it can run before
 * a deploy rather than after one. The failure it prevents is only visible AFTER a deploy, which is
 * the worst possible moment to learn about it.
 *
 * ⚠️ **What it does NOT do:** it follows only RELATIVE imports (`./x.mjs`, `../lib/y.mjs`), because
 * those are the files a deploy must carry. Bare specifiers (`ethers`, `node:fs`) are packages or
 * built-ins and are installed on the server by other means — claiming to check those would be
 * claiming more than it measures. Dynamic `import(expr)` with a computed path is invisible to it
 * and is reported as a warning rather than silently ignored.
 *
 * ## EXIT CODES (shared convention across the tool set)
 *
 *   0  PASS          — every relative import of every entry file is in that group's file list
 *   1  FAIL          — the deploy would ship code whose dependencies are missing
 *   2  INCONCLUSIVE  — the manifest or a file could not be read
 *
 * Usage:
 *   node scripts/check-deploy-imports.mjs
 *   node scripts/check-deploy-imports.mjs --self-test
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = path.join(ROOT, "local-net/deploy/manifest-deploy.json");
const SELF_TEST = process.argv.slice(2).includes("--self-test");

/**
 * Every relative specifier a source file imports.
 *
 * 🔴 Deliberately simple and deliberately NOISY-SAFE: it over-reports rather than under-reports.
 * A specifier found inside a comment costs a false red that a human resolves in seconds; a
 * specifier missed costs a dead service. Where those two are the options, over-report.
 */
export function relativeImports(source) {
  const out = new Set();
  // `import x from "./y"` · `import "./y"` · `export … from "./y"` · `await import("./y")`
  for (const m of source.matchAll(/(?:^|[^A-Za-z0-9_$])(?:import|export)\s*(?:[\s\S]{0,200}?\sfrom\s*|\s*)["'](\.[^"']+)["']/g)) out.add(m[1]);
  for (const m of source.matchAll(/\bimport\s*\(\s*["'](\.[^"']+)["']\s*\)/g)) out.add(m[1]);
  return [...out];
}

/** Dynamic imports whose path is computed — invisible to static reading, so they are reported. */
export function opaqueImports(source) {
  return [...source.matchAll(/\bimport\s*\(\s*(?!["'])/g)].length;
}

/**
 * Walk one group's entry files and return every repo-relative file they reach.
 *
 * `readFile` is injected so `--self-test` can drive it over a fake tree: a gate about missing
 * files whose own tests need the real filesystem can only be tested by breaking the real thing.
 */
export function resolveGraph(entries, readFile, seen = new Set()) {
  const missing = [];
  const opaque = [];
  const walk = (rel) => {
    if (seen.has(rel)) return;
    seen.add(rel);
    const src = readFile(rel);
    if (src === null) { missing.push(rel); return; }
    if (opaqueImports(src)) opaque.push(rel);
    for (const spec of relativeImports(src)) {
      // Resolve relative to the importing file, then normalise to repo-relative POSIX form.
      const abs = path.posix.normalize(path.posix.join(path.posix.dirname(rel), spec));
      walk(abs);
    }
  };
  for (const e of entries) walk(e);
  return { reached: seen, missing, opaque };
}

/** The comparison this gate exists for: what the code reaches vs what the manifest ships. */
export function assessGroup(name, files, graph) {
  const shipped = new Set(files);
  const notShipped = [...graph.reached].filter((f) => !shipped.has(f));
  if (graph.missing.length) {
    return { verdict: "fail", why: `imports a file that does not exist in the repo: ${graph.missing.join(", ")}` };
  }
  if (notShipped.length) {
    return {
      verdict: "fail",
      why: `the code reaches ${notShipped.length} file(s) the manifest does NOT ship — the deploy would send code that cannot start:\n         ${notShipped.join("\n         ")}`,
    };
  }
  return { verdict: "ok", why: `${graph.reached.size} file(s) reached, all of them shipped` };
}

/* ══════════════════════════════════════════════════════════════════════════
   The run
   ══════════════════════════════════════════════════════════════════════════ */
function main() {
  if (SELF_TEST) return selfTest();

  if (!existsSync(MANIFEST)) {
    console.log(`⚪ INCONCLUSIVE — cannot read ${MANIFEST}`);
    return 2;
  }
  const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
  const readFile = (rel) => {
    const abs = path.join(ROOT, rel);
    return existsSync(abs) ? readFileSync(abs, "utf8") : null;
  };

  console.log("\n══ DEPLOY IMPORTS — does the manifest ship what the code needs? ══\n");
  let worst = 0;
  for (const [name, group] of Object.entries(manifest.groups ?? {})) {
    const files = group.files ?? [];
    // Entries are the JS the server actually runs; JSON and HTML in the list are data, not code.
    const entries = files.filter((f) => /\.mjs$/.test(f));
    const graph = resolveGraph(entries, readFile);
    const a = assessGroup(name, files, graph);
    console.log(`  ${a.verdict === "ok" ? "✓" : "🔴"} ${name}\n       ${a.why}`);
    if (graph.opaque.length) {
      console.log(`       ⚠️ computed import() in: ${graph.opaque.join(", ")} — static reading cannot follow those`);
    }
    worst = Math.max(worst, a.verdict === "ok" ? 0 : 1);
  }
  console.log(`\n${worst === 0 ? "✅ PASS — every relative import is shipped" : "🔴 FAIL — a deploy would ship code that cannot start"}\n`);
  return worst;
}

/* ══════════════════════════════════════════════════════════════════════════
   Reverse controls
   ══════════════════════════════════════════════════════════════════════════ */
function selfTest() {
  let pass = 0, fail = 0;
  const ok = (label, got, want) => {
    if (got === want) { pass++; console.log(`  ✓ ${label}`); }
    else { fail++; console.log(`  ✗ ${label} — wanted ${want}, got ${got}`); }
  };
  console.log("══ REVERSE CONTROLS — check-deploy-imports ══\n");

  console.log("── reading imports out of source ──");
  ok("plain import", relativeImports('import x from "./a.mjs";')[0], "./a.mjs");
  ok("named import across lines",
    relativeImports('import {\n a,\n b\n} from "../lib/c.mjs";')[0], "../lib/c.mjs");
  ok("side-effect import", relativeImports('import "./d.mjs";')[0], "./d.mjs");
  ok("re-export", relativeImports('export { z } from "./e.mjs";')[0], "./e.mjs");
  ok("dynamic import with a literal path", relativeImports('await import("./f.mjs")')[0], "./f.mjs");
  ok("🔴 bare specifiers are NOT deploy files — packages are installed, not shipped",
    relativeImports('import { ethers } from "ethers";\nimport fs from "node:fs";').length, 0);
  ok("🔴 a computed import is COUNTED, not ignored — static reading cannot see where it goes",
    opaqueImports('const m = await import(somePath);'), 1);

  console.log("\n── the outage this gate exists for, replayed ──");
  const tree = {
    "a/server.mjs": 'import { g } from "../b/dep.mjs";\nimport { ethers } from "ethers";',
    "b/dep.mjs": "export const g = 1;",
  };
  const read = (rel) => (rel in tree ? tree[rel] : null);

  ok("🔴 THE REAL CASE — server shipped, its dependency NOT in the manifest ⇒ FAIL",
    assessGroup("x", ["a/server.mjs"], resolveGraph(["a/server.mjs"], read)).verdict, "fail");
  ok("…and listing the dependency makes it pass",
    assessGroup("x", ["a/server.mjs", "b/dep.mjs"], resolveGraph(["a/server.mjs"], read)).verdict, "ok");
  ok("🔴 an import of a file that does not exist in the repo at all ⇒ FAIL",
    assessGroup("x", ["a/only.mjs"], resolveGraph(["a/only.mjs"],
      (r) => (r === "a/only.mjs" ? 'import "./gone.mjs";' : null))).verdict, "fail");
  ok("🔴 transitive: A imports B imports C, and C unlisted ⇒ FAIL",
    assessGroup("x", ["a/1.mjs", "a/2.mjs"], resolveGraph(["a/1.mjs"], (r) => ({
      "a/1.mjs": 'import "./2.mjs";', "a/2.mjs": 'import "./3.mjs";', "a/3.mjs": "export const c=1;",
    }[r] ?? null))).verdict, "fail");
  ok("a file importing nothing is fine",
    assessGroup("x", ["a/solo.mjs"], resolveGraph(["a/solo.mjs"], () => "export const x=1;")).verdict, "ok");
  ok("🔴 shipping MORE than is reached is not an error — data files belong in the list too",
    assessGroup("x", ["a/server.mjs", "b/dep.mjs", "c/data.json"],
      resolveGraph(["a/server.mjs"], read)).verdict, "ok");

  console.log(`\n${fail === 0 ? "✅" : "🔴"} ${pass} passed · ${fail} failed`);
  return fail === 0 ? 0 : 1;
}

process.exit(main());
