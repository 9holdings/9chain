#!/usr/bin/env node
// Repository-only checks. No deployment, network generation, or public RPC calls.
import { spawn, spawnSync } from 'node:child_process';
import { cpus } from 'node:os';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { guardEntry } from '../local-net/lib/cli.mjs';

// 🔴 A flag this gate does not know is exit 2 — "could not run", never a verdict (D-244).
guardEntry(import.meta.url, ['--console', '--self-test']);


const root = fileURLToPath(new URL('../', import.meta.url));
const checks = [
  ['local-net/lib/cli-test.mjs'],
  ['scripts/lib/report-test.mjs'],
  ['local-net/lib/http-test.mjs'],
  ['scripts/check-fetch-timeouts.mjs', '--self-test'],
  ['scripts/check-fetch-timeouts.mjs'],
  ['scripts/check-fixed-ports.mjs', '--self-test'],
  ['scripts/check-fixed-ports.mjs'],
  ['scripts/check-work-retention.mjs', '--self-test'],
  ['scripts/check-work-retention.mjs'],
  ['scripts/measure-block-cache.mjs', '--self-test'],
  ['scripts/check-flag-guards.mjs', '--self-test'],
  ['scripts/check-flag-guards.mjs'],
  ['scripts/check-worktree-ownership.mjs'],
  ['scripts/check-patch-count.mjs', '--self-test'],
  ['scripts/check-patch-count.mjs'],
  ['scripts/check-deploy-imports.mjs', '--self-test'],
  ['scripts/check-deploy-imports.mjs'],
  ['scripts/prepare-console-release-test.mjs'],
  ['scripts/validate-console-release-test.mjs'],
  ['local-net/console/chainid-test.mjs'],
  ['local-net/lib/validator-assignment-test.mjs'],
];
const consoleChecks = [
  ['local-net/console/operation-journal-test.mjs'],
  ['local-net/console/upgrade-files-test.mjs'],
  ['local-net/console/track-files-test.mjs'],
  ['local-net/console/http-plumbing-test.mjs'],
  ['local-net/console/assignment-e2e-test.mjs'],
  ['local-net/console/siwe-test.mjs'],
  ['local-net/console/auth-e2e-test.mjs'],
  ['local-net/deploy/deploy-lock-test.mjs'],
  ['local-net/deploy/console-backup-test.mjs'],
  ['local-net/deploy/console-maintenance-test.mjs'],
  ['local-net/lib/maintenance-test.mjs'],
  ['local-net/console/maintenance-e2e-test.mjs'],
  ['local-net/lib/console-readiness-test.mjs'],
  ['local-net/console/readiness-e2e-test.mjs'],
  ['local-net/lib/chain-readiness-test.mjs'],
  ['scripts/inspect-creation-test.mjs'],
  ['scripts/inspect-chain-inventory-test.mjs'],
  ['scripts/inspect-legacy-artifacts-test.mjs'],
  ['local-net/lib/ledger-write-test.mjs'],
  ['local-net/lib/creation-journal-test.mjs'],
  ['local-net/lib/rpc-client-test.mjs'],
  ['local-net/console/paused-e2e-test.mjs'],
  ['local-net/console/create-rpc-e2e-test.mjs'],
  ['local-net/console/options-e2e-test.mjs'],
  ['local-net/console/governance-e2e-test.mjs'],
];

export function runChecks(entries, execute) {
  for (const args of entries) {
    const result = execute(args);
    if (result.error || result.signal || result.status !== 0) {
      return { ok: false, failed: args[0], status: result.status, reason:
        result.error?.message || result.signal || `exit ${result.status}` };
    }
  }
  return { ok: true };
}

/**
 * The same verdict, from results that arrived in any order.
 *
 * ═══ WHY THIS IS SEPARATE FROM THE RUNNER ═══
 *
 * Running the checks concurrently changes two things that matter more than the wall clock:
 *
 * 1. **Which failure gets reported.** Sequentially, the first failure is also the first in the
 *    list, and the run stops there. Concurrently, the first failure to COME BACK is whichever
 *    check happened to be quickest — so the same broken repository would name a different script
 *    on different runs. This picks the first failure in LIST order, always, so the line a person
 *    reads is reproducible. (Measured: `validate-console-release-test` takes 19.2 s of the 34.8 s
 *    total, so it is nearly always the last to return, and would nearly always be hidden.)
 *
 * 2. **Nothing is skipped.** Sequentially, a failure means the rest never ran, and their state is
 *    unknown. Concurrently they all ran, so the summary can say how many others also failed —
 *    information the sequential runner never had.
 *
 * Kept pure and separate so both properties are pinned by `--self-test` without spawning
 * anything: a concurrency bug that only shows up under load is not something a self-test finds.
 */
export function verdictOf(entries, results) {
  const failures = [];
  for (const [index, args] of entries.entries()) {
    const result = results[index];
    if (!result || result.error || result.signal || result.status !== 0) {
      failures.push({
        failed: args[0], status: result?.status ?? null,
        reason: result?.error?.message || result?.signal
          || (result ? `exit ${result.status}` : 'never ran'),
      });
    }
  }
  if (!failures.length) return { ok: true, failures: [] };
  // List order, not arrival order.
  return { ok: false, ...failures[0], failures };
}

/**
 * Runs `entries` with at most `concurrency` at a time, keeping each child's output and printing
 * it in LIST order as soon as its turn comes.
 *
 * 🔴 Output is captured, not inherited. Nine children writing to one terminal at once produces
 * interleaved lines that look like corruption, and this repo reads gate output closely enough
 * that HANDOFF quotes it. Buffering costs memory and keeps the log readable.
 */
export async function runChecksConcurrently(entries, spawnOne, { concurrency = 4, onBlock } = {}) {
  const results = new Array(entries.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(concurrency, entries.length) }, async () => {
    for (;;) {
      const index = next; next += 1;
      if (index >= entries.length) return;
      results[index] = await spawnOne(entries[index], index);
    }
  });
  await Promise.all(workers);
  if (onBlock) for (const [index, args] of entries.entries()) onBlock(args, results[index]);
  return { results, verdict: verdictOf(entries, results) };
}

const args = process.argv.slice(2);
if (args.length === 1 && args[0] === '--self-test') {
  const fixture = [['first'], ['second']];
  assert.equal(runChecks(fixture, () => ({ status: 0 })).ok, true);
  for (const failure of [{ status: 1 }, { status: 2 },
    { status: null, signal: 'SIGTERM' }, { error: new Error('not executable') }]) {
    let calls = 0;
    const result = runChecks(fixture, () => { calls++; return failure; });
    assert.equal(result.ok, false);
    assert.equal(result.failed, 'first');
    assert.equal(calls, 1);
  }
  // Exercise a real failing child process, without changing repository files.
  const negative = runChecks([['-e', 'process.exit(7)']], childArgs =>
    spawnSync(process.execPath, childArgs, { cwd: root }));
  assert.equal(negative.status, 7);
  assert.equal(negative.ok, false);
  // ── The concurrent verdict: same answer, arriving in any order ──
  const three = [['a'], ['b'], ['c']];
  assert.equal(verdictOf(three, [{ status: 0 }, { status: 0 }, { status: 0 }]).ok, true);

  // 🔴 The reason verdictOf exists. If the reported failure were the first to COME BACK, the same
  // broken repository would name a different script on different runs — and the slowest check
  // here takes 19.2 s of 34.8 s, so it would almost never be the one named.
  const twoBad = verdictOf(three, [{ status: 0 }, { status: 1 }, { status: 5 }]);
  assert.equal(twoBad.ok, false);
  assert.equal(twoBad.failed, 'b', 'the failure named must be the first in LIST order');
  assert.equal(twoBad.failures.length, 2, 'concurrency means the others DID run — say so');
  assert.equal(twoBad.failures[1].failed, 'c');

  assert.equal(verdictOf(three, [{ status: 0 }, { status: 2 }, { status: 0 }]).status, 2);
  assert.equal(verdictOf(three, [{ status: 0 }, { signal: 'SIGTERM' }, { status: 0 }]).reason, 'SIGTERM');
  assert.equal(verdictOf(three, [{ status: 0 }, { error: new Error('nope') }, { status: 0 }]).reason, 'nope');
  // 🔴 A slot with no result at all is a FAILURE, not a pass. A check that never ran is exactly
  // the thing this whole milestone is about: "not measured" must never read as "fine".
  assert.equal(verdictOf(three, [{ status: 0 }, undefined, { status: 0 }]).reason, 'never ran');

  // Every entry runs exactly once, whatever the concurrency, and results land in list order.
  const order = [];
  const { results, verdict } = await runChecksConcurrently(
    [['one'], ['two'], ['three'], ['four'], ['five']],
    async (entry) => { order.push(entry[0]); return { status: 0, tag: entry[0] }; },
    { concurrency: 2 });
  assert.equal(order.length, 5);
  assert.deepEqual(results.map(r => r.tag), ['one', 'two', 'three', 'four', 'five']);
  assert.equal(verdict.ok, true);

  // 🔴 And the same thing with REAL processes, because the whole point of the concurrent path is
  // that results come back out of order. The slow child exits 0 LAST; the fast one fails FIRST.
  // A runner that reported the first failure to arrive would name 'slow-ok' here. It must not.
  const slowThenFast = await runChecksConcurrently(
    [['-e', 'setTimeout(() => process.exit(0), 600)'], ['-e', 'process.exit(3)']],
    (childArgs) => new Promise((resolve) => {
      const child = spawn(process.execPath, childArgs, { cwd: root });
      child.on('close', (status, signal) => resolve({ status, signal }));
      child.on('error', (error) => resolve({ error }));
    }), { concurrency: 2 });
  assert.equal(slowThenFast.verdict.ok, false);
  assert.equal(slowThenFast.verdict.status, 3);
  assert.equal(slowThenFast.results[0].status, 0, 'the slow child still finished, and in slot 0');

  console.log('PASS: success, fail-fast, inconclusive, signal, spawn error, real child failure, '
    + 'concurrent verdict in list order, a missing result is a failure, '
    + 'a real out-of-order failure is still named correctly');
} else if (args.length && !(args.length === 1 && args[0] === '--console')) {
  console.error('Usage: node scripts/check-local.mjs [--self-test | --console]');
  process.exitCode = 2;
} else {
  const selected = args[0] === '--console' ? [...checks, ...consoleChecks] : checks;
  const concurrency = Math.max(1, Math.min(4, cpus().length - 1));
  const started = Date.now();

  const { verdict } = await runChecksConcurrently(selected, (childArgs) =>
    new Promise((resolve) => {
      const child = spawn(process.execPath, childArgs, { cwd: root, timeout: 120_000, shell: false });
      let out = '';
      child.stdout.on('data', (d) => { out += d; });
      child.stderr.on('data', (d) => { out += d; });
      child.on('error', (error) => resolve({ error, output: out }));
      child.on('close', (status, signal) => resolve({ status, signal, output: out }));
    }),
  {
    concurrency,
    // Printed in list order once everything is in, so the log reads exactly as it did when this
    // ran sequentially — HANDOFF quotes these lines.
    onBlock: (childArgs, result) => {
      console.log(`\nRUN node ${childArgs.join(' ')}`);
      if (result?.output) process.stdout.write(result.output);
    },
  });

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  if (!verdict.ok) {
    console.error(`\nFAIL: ${verdict.failed}: ${verdict.reason}`
      + (verdict.failures.length > 1 ? `  (and ${verdict.failures.length - 1} more: `
        + `${verdict.failures.slice(1).map(f => f.failed).join(', ')})` : ''));
    process.exitCode = 1;
  } else {
    console.log(`\nPASS: ${selected.length} local checks in ${elapsed}s `
      + `(${concurrency} at a time). Live deployment and fork build are NOT verified.`);
  }
}
