/**
 * operation-journal.mjs — what the console is doing right now, for `/api/progress`.
 *
 * Lifted out of `console/server.mjs` on 2026-09-08 (D-250, P-106). Everything below except the
 * naming is the behaviour that file already had, including the two failures it was shaped by.
 *
 * ═══ WHY ONE GLOBAL IS ENOUGH, AND CORRECT ═══
 *
 * The console is ONE process, and create/revoke share a serial queue by design: two overlapping
 * rollouts would restart each other mid-flight and break both. So at any moment there is AT MOST
 * ONE operation running. Building a job table with ids for something that never has two is extra
 * state to keep in sync, bought for nothing.
 *
 * The finished operation is KEPT rather than cleared, so someone reloading the page a few seconds
 * later still sees the result instead of a blank screen.
 *
 * ═══ 🔴 WHY EVERY MUTATOR IGNORES A CLOSED JOURNAL ═══
 *
 * Without that guard, a REVOKE — which calls the same node-rollout code — writes over the
 * progress of the CREATE that just finished. Measured 2026-08-25: right after a create closed at
 * 8/8, a revoke pulled step `node-2` from "done" back to "running", and the person who had just
 * created a chain watched the progress bar run BACKWARDS. The bad kind of broken: two different
 * operations sharing one status table with nobody declaring it.
 *
 * ═══ THE TRANSLATION BOUNDARY, NOW IN ONE PLACE ═══
 *
 * David decided 2026-08-26 that URLs, filenames and JSON KEYS are English. When this lived in
 * server.mjs the state carried Vietnamese field names and the HTTP route translated them on the
 * way out — the comment there said renaming the identifiers was "a different operation, riskier,
 * and David has not asked for it". He asked on 2026-08-28 (CLAUDE.md section 0), so the state is
 * English now and there is nothing left to translate.
 *
 * 🔴 What did NOT get renamed, and must not be: `thuHoi` and `thuHoiLuc` in `console-chains.json`.
 * Those are keys ALREADY WRITTEN TO DISK on the live server, and renaming a stored key is a
 * different question from renaming a variable (CLAUDE.md section 5, trap 12). This journal's kind
 * values are in memory only and never persisted, which is why they could be changed.
 *
 * The wire shape of `/api/progress` is unchanged, field for field:
 *   { running, maintenance, kind, name, secondsElapsed, steps: [{ code, label, status, ms }],
 *     error, etaSeconds }
 * with `kind` ∈ create | revoke | upgrade and `status` ∈ pending | running | done | failed.
 */

/** Seconds of remaining work attributed to each unfinished step. Unchanged from server.mjs. */
export const SECONDS_PER_STEP = 33;

export class OperationJournal {
  #running = false;
  #kind = null;
  #name = null;
  #startedAt = 0;
  #steps = [];
  #error = null;
  #now;

  /** `now` is injectable so the counter-checks can assert on elapsed time without sleeping. */
  constructor({ now = () => Date.now() } = {}) { this.#now = now; }

  get running() { return this.#running; }

  /**
   * Begin an operation. `kind` is "create" | "revoke" | "upgrade"; `steps` is
   * `[{ code, label }]` in the order they will run.
   */
  open(kind, name, steps = []) {
    this.#running = true;
    this.#kind = kind;
    this.#name = name;
    this.#startedAt = this.#now();
    this.#error = null;
    this.#steps = steps.map((step) => ({ ...step, status: "pending", ms: 0 }));
  }

  /**
   * Add a step discovered while running.
   *
   * The node count is only known after reading the compose file, so those steps appear at run
   * time — that is what lets the page show "node 2/5" instead of a spinner of unknown length.
   */
  addStep(code, label) {
    if (!this.#running) return;
    if (!this.#steps.some((step) => step.code === code)) {
      this.#steps.push({ code, label, status: "pending", ms: 0 });
    }
  }

  /** Mark a step as started. */
  stepRunning(code, label) {
    if (!this.#running) return;
    const step = this.#steps.find((s) => s.code === code);
    if (step) { step.status = "running"; step.startedAt = this.#now(); if (label) step.label = label; }
  }

  /** Mark a step finished, timing it from `stepRunning` when no duration is given. */
  stepDone(code, ms) {
    if (!this.#running) return;
    const step = this.#steps.find((s) => s.code === code);
    if (step) { step.status = "done"; step.ms = ms ?? (step.startedAt ? this.#now() - step.startedAt : 0); }
  }

  /** End the operation. A truthy `error` also marks whichever step was running as failed. */
  close(error) {
    this.#running = false;
    this.#error = error ? String(error.message || error) : null;
    if (error) {
      const step = this.#steps.find((s) => s.status === "running");
      if (step) step.status = "failed";
    }
  }

  /**
   * The `/api/progress` body, minus `maintenance` — that comes from a different object and the
   * route adds it, so this module does not need to know about maintenance at all.
   */
  snapshot() {
    const unfinished = this.#steps.filter((s) => s.status === "pending" || s.status === "running").length;
    return {
      running: this.#running,
      kind: this.#kind,
      name: this.#name,
      secondsElapsed: this.#startedAt ? Math.round((this.#now() - this.#startedAt) / 1000) : 0,
      steps: this.#steps.map(({ code, label, status, ms }) => ({ code, label, status, ms })),
      error: this.#error,
      etaSeconds: this.#running ? unfinished * SECONDS_PER_STEP : 0,
    };
  }
}
