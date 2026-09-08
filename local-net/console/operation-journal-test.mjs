#!/usr/bin/env node
/**
 * operation-journal-test.mjs — counter-checks for the console's progress journal (D-250, P-106).
 *
 * 🔴 The case that matters most is the one this module was SHAPED by and which no test covered
 * while it lived inside a 2 927-line file: a second operation must not be able to drag a finished
 * step backwards. That is the bug measured on 2026-08-25, where a revoke pulled a create's
 * `node-2` from done back to running and the progress bar ran backwards for the person watching.
 */
import assert from 'node:assert/strict';
import { guardEntry } from '../lib/cli.mjs';
import { counter } from '../../scripts/lib/report.mjs';
import { OperationJournal, SECONDS_PER_STEP } from './operation-journal.mjs';

guardEntry(import.meta.url, ['--self-test']);

const { ok, finish } = counter('COUNTER-CHECK — the console progress journal');

/** A journal on a clock we control, so elapsed time is asserted rather than slept through. */
function withClock() {
  let t = 1_000_000;
  const journal = new OperationJournal({ now: () => t });
  return { journal, tick: (ms) => { t += ms; } };
}

// ── The closed-journal guard: the reason every mutator starts with a return ────────────────
{
  const { journal } = withClock();
  journal.open('create', 'ChainOne', [{ code: 'genesis', label: 'Building genesis' }]);
  journal.stepRunning('genesis');
  journal.stepDone('genesis', 120);
  journal.close(null);

  const finished = journal.snapshot();
  // Now a SECOND operation touches the same journal without opening it — a revoke calling the
  // shared node-rollout code, which is exactly what happened on 2026-08-25.
  journal.stepRunning('genesis');
  journal.addStep('node:node-2', 'node-2');
  journal.stepDone('genesis', 999);

  ok('🔴 a closed journal ignores stepRunning — a finished step cannot run BACKWARDS',
    journal.snapshot().steps[0].status === 'done');
  ok('🔴 a closed journal ignores addStep — the second operation cannot inject its own steps',
    journal.snapshot().steps.length === 1);
  ok('🔴 a closed journal ignores stepDone — it cannot rewrite a recorded duration',
    journal.snapshot().steps[0].ms === 120);
  ok('nothing else moved either', JSON.stringify(journal.snapshot()) === JSON.stringify(finished));
}

// ── The wire contract ─────────────────────────────────────────────────────────────────────
{
  const { journal, tick } = withClock();
  ok('before anything, running is false and elapsed is 0',
    journal.snapshot().running === false && journal.snapshot().secondsElapsed === 0);

  journal.open('create', 'MyChain', [
    { code: 'genesis', label: 'Building genesis' },
    { code: 'subnet', label: 'Creating subnet + blockchain on P-Chain' },
  ]);
  const opened = journal.snapshot();
  ok('the body carries exactly the eight fields the page reads, minus maintenance',
    JSON.stringify(Object.keys(opened))
      === JSON.stringify(['running', 'kind', 'name', 'secondsElapsed', 'steps', 'error', 'etaSeconds']));
  ok('a step is { code, label, status, ms } and nothing else',
    JSON.stringify(Object.keys(opened.steps[0])) === JSON.stringify(['code', 'label', 'status', 'ms']));
  ok('every step starts pending', opened.steps.every((s) => s.status === 'pending' && s.ms === 0));
  ok('kind and name reach the wire unchanged', opened.kind === 'create' && opened.name === 'MyChain');

  ok('🔴 kind is ALREADY English — there is no translation table left to drift',
    opened.kind === 'create',
    'when this lived in server.mjs the state said "tao" and the route translated it on the way out');

  ok(`eta is unfinished steps x ${SECONDS_PER_STEP}s`, opened.etaSeconds === 2 * SECONDS_PER_STEP);

  tick(4_400);
  journal.stepRunning('genesis');
  tick(600);
  journal.stepDone('genesis');
  const mid = journal.snapshot();
  ok('a step timed from stepRunning gets its real duration', mid.steps[0].ms === 600);
  ok('secondsElapsed is rounded seconds since open', mid.secondsElapsed === 5);
  ok('eta drops as steps finish', mid.etaSeconds === 1 * SECONDS_PER_STEP);

  journal.stepDone('subnet', 250);
  ok('an explicit duration wins over the clock', journal.snapshot().steps[1].ms === 250);
  ok('a step that was never marked running can still be marked done',
    journal.snapshot().steps[1].status === 'done');
}

// ── Steps discovered at run time ──────────────────────────────────────────────────────────
{
  const { journal } = withClock();
  journal.open('revoke', 'Gone', []);
  journal.addStep('node:node-1', 'node-1');
  journal.addStep('node:node-2', 'node-2');
  journal.addStep('node:node-1', 'node-1');
  ok('a step added twice appears once — the rollout loop may retry a node',
    journal.snapshot().steps.length === 2);
  ok('run-time steps keep the order they were discovered in',
    journal.snapshot().steps.map((s) => s.code).join() === 'node:node-1,node:node-2');
  ok('a revoke opens with no steps and still reports its kind',
    journal.snapshot().kind === 'revoke');
}

// ── Failure ───────────────────────────────────────────────────────────────────────────────
{
  const { journal } = withClock();
  journal.open('upgrade', 'SBull', [{ code: 'file', label: 'Writing upgrade.json' }]);
  journal.stepRunning('file');
  journal.close(new Error('disk full'));
  const failed = journal.snapshot();
  ok('🔴 closing with an error marks the RUNNING step failed, not every step',
    failed.steps[0].status === 'failed');
  ok('the error message reaches the wire', failed.error === 'disk full');
  ok('running goes false and eta goes to 0 on failure',
    failed.running === false && failed.etaSeconds === 0);

  const { journal: j2 } = withClock();
  j2.open('create', 'X', [{ code: 'a', label: 'A' }]);
  j2.close(null);
  ok('closing cleanly leaves error null and leaves a pending step pending',
    j2.snapshot().error === null && j2.snapshot().steps[0].status === 'pending');

  const { journal: j3 } = withClock();
  j3.open('create', 'X', []);
  j3.close('a bare string, not an Error');
  ok('a non-Error is still reported as text', j3.snapshot().error === 'a bare string, not an Error');
}

// ── The finished run is KEPT ──────────────────────────────────────────────────────────────
{
  const { journal } = withClock();
  journal.open('create', 'Kept', [{ code: 'a', label: 'A' }]);
  journal.stepDone('a', 10);
  journal.close(null);
  const after = journal.snapshot();
  ok('a finished operation is still readable — a late page reload sees the result, not a blank',
    after.name === 'Kept' && after.steps[0].status === 'done' && after.running === false);
}

// ── Isolation ─────────────────────────────────────────────────────────────────────────────
{
  const a = new OperationJournal();
  const b = new OperationJournal();
  a.open('create', 'A', [{ code: 'x', label: 'X' }]);
  ok('two journals do not share state — the module exports a class, not a singleton',
    b.snapshot().running === false && b.snapshot().steps.length === 0);
  ok('the snapshot is a copy: mutating it does not reach back into the journal',
    (() => { const s = a.snapshot(); s.steps[0].status = 'tampered'; return a.snapshot().steps[0].status === 'pending'; })());
}

process.exitCode = finish('a closed journal cannot be dragged backwards, and kind is English at the source');
