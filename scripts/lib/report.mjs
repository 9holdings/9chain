/**
 * report.mjs — the exit-code convention, and the counter-check helper every gate writes anyway.
 *
 * ═══ WHAT THIS IS NOT ═══
 *
 * It is NOT a rewrite of how the existing gates print. That was the original shape of P-102 and
 * it was dropped on measurement, twice over:
 *
 * 1. **The exit codes were already right.** Every site in the repo that says "CANNOT RUN" already
 *    calls `process.exit(2)` — 7 for 7, measured 2026-09-08. There was no drift to fix. The
 *    valuable half of P-102 had already been done by the people who wrote these gates.
 *
 * 2. **The verdict lines are quoted.** `HANDOFF.md`, `PROGRESS.md` and the runbooks quote gate
 *    output verbatim — "✅ PASS — no new Vietnamese; debt did not grow", "59 passed · 3 red · 0
 *    could not run". A shared printer that made those uniform would either change strings a
 *    person is using to recognise a run, or be so parameterised that it saved nothing. Different
 *    gates answer different questions and their summary lines say different things ON PURPOSE.
 *
 *    ⚠️ An earlier draft of this very comment quoted the preflight summary in its ORIGINAL
 *    Vietnamese, and `check-english-code` went red on this file within a minute of it being
 *    written. Section 0 covers comments, and quoting output is not an exemption from it.
 *
 * ⇒ CLAUDE.md section 6 is about a RULE or a CONSTANT getting a second declaration, where the
 *   second copy silently disagrees with the first. A five-line `ok(label, condition)` is neither.
 *   Extracting it is a convenience, and it is offered as one — nothing is forced onto a gate that
 *   already prints the way its readers expect.
 *
 * ═══ WHAT IT IS FOR ═══
 *
 * The evidence is from the session that wrote it: four new gates were written on 2026-09-08 —
 * cli-test, check-flag-guards, check-fetch-timeouts, check-fixed-ports — and the same
 * `ok(what, condition)` counter, with the same tally line, was typed out four times. The fifth
 * time is what this file is for.
 *
 *   import { EXIT, counter } from './lib/report.mjs';
 *   const check = counter('COUNTER-CHECK — what the scanner sees');
 *   check.ok('a bare fetch is found', scan('fetch(u)').length === 1);
 *   process.exitCode = check.finish('the scanner reads calls, not line windows');
 */

/**
 * The three exit codes, and the distinction that matters most is 1 vs 2.
 *
 * 🔴 2 is NOT "a worse 1". It means the gate never reached a verdict at all — the tool was
 * broken, an input was missing, the world could not be read. Reporting that as 1 puts a NO into
 * a runbook that nobody measured, the same way exit 0 would put in a YES (D-116, D-244).
 */
export const EXIT = Object.freeze({
  PASS: 0,
  RED: 1,
  CANNOT_RUN: 2,
});

/**
 * A counter-check tally: cases in, one verdict out.
 *
 * `ok(what, condition, detail)` prints ✓ or 🔴 and counts. `finish(summary)` prints the tally and
 * returns the exit code — it does NOT exit, so the caller keeps control of the process and can
 * use `process.exitCode` (which is what a file using `fetch` must do on Windows: calling
 * `process.exit()` with undici handles open aborts with UV_HANDLE_CLOSING and exit 127, after
 * every case has already printed ✓; see local-net/lib/chain-ledger.mjs:36).
 */
export function counter(title, { log = console.log } = {}) {
  let failures = 0;
  let total = 0;
  if (title) log(`══ ${title} ══\n`);
  return {
    ok(what, condition, detail = "") {
      total += 1;
      if (condition) log(`  ✓ ${what}`);
      else { failures += 1; log(`  🔴 ${what}${detail ? `\n      ${detail}` : ""}`); }
      return Boolean(condition);
    },
    /** Same, for a case whose body may throw: a throw is a failure, not a crash. */
    check(what, fn, detail = "") {
      let passed = false;
      let thrown = "";
      try { passed = fn() !== false; } catch (error) { thrown = error.message; }
      return this.ok(what, passed, thrown || detail);
    },
    get failures() { return failures; },
    get total() { return total; },
    finish(summary = "") {
      log(failures === 0
        ? `\n✅ PASS — ${total} case(s)${summary ? `; ${summary}` : ""}.`
        : `\n🔴 FAIL — ${failures} of ${total} case(s).`);
      return failures === 0 ? EXIT.PASS : EXIT.RED;
    },
  };
}

/**
 * Print why the gate could not run, and hand back exit 2.
 *
 * Deliberately returns rather than exits, for the same reason as `finish`: a caller with open
 * handles must be able to set `process.exitCode` and let the loop drain.
 */
export function cannotRun(why, how = "", { log = console.error } = {}) {
  log(`\n⚠️  CANNOT RUN — ${why}${how ? `\n   ${how}` : ""}`);
  log("   🔴 Exit 2 = nothing was measured. This is not a verdict; do not read it as one.");
  return EXIT.CANNOT_RUN;
}
