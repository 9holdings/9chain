/**
 * import-graph.mjs — what a file reaches, by reading its imports.
 *
 * ═══ WHY IT MOVED OUT OF A GATE (D-249) ═══
 *
 * These three functions lived inside `scripts/check-deploy-imports.mjs`, exported, and nothing
 * could use them: that file ends with `process.exit(main())` at module scope, so importing it to
 * borrow one function runs the whole gate and kills the importer. `local-net/lib/l1-allowlist.mjs`
 * has that exact lesson written at the top of it, from 2026-09-03 — a second gate that needed a
 * helper had to COPY it, which is how a rule gets a second declaration (CLAUDE.md section 6).
 *
 * The caller that needed them is `local-net/console/readiness-e2e-test.mjs`, and the reason is
 * worth stating because it is a trap with no warning:
 *
 * 🔴 **THAT TEST READS `server.mjs` AS TEXT.** It scans the source for every `process.env.X` and
 * asserts each one is declared in `CONSOLE_CONFIGURATION_KEYS`, which is what the console's
 * configuration fingerprint is computed from. A source scan of ONE file does not follow the code
 * when the code moves: the moment an environment read is lifted into a helper module, the test
 * stops seeing it, the fingerprint silently stops covering it — **and the test stays green**.
 * Splitting `server.mjs` (2 927 lines) without closing this first would have quietly narrowed a
 * safety property while every gate reported success. Exactly CLAUDE.md section 2.
 *
 * ⇒ The scan now walks the import graph from `server.mjs` and reads every file it reaches.
 *
 * It lives in `local-net/lib/` rather than `scripts/lib/` because its caller is a console file
 * that gets SHIPPED, and a shipped module must not import out of the gate tooling — the mistake
 * made earlier the same day with `cli.mjs`, caught by `check-deploy-imports` (D-245).
 */
import path from "node:path";

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
 * Walk entry files and return every repo-relative file they reach.
 *
 * `readFile` is injected so a self-test can drive it over a fake tree: a check about missing
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
