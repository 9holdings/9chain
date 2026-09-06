#!/usr/bin/env node
// Repository-only checks. No deployment, network generation, or public RPC calls.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const checks = [
  ['scripts/check-worktree-ownership.mjs'],
  ['scripts/check-patch-count.mjs', '--self-test'],
  ['scripts/check-patch-count.mjs'],
  ['scripts/check-deploy-imports.mjs', '--self-test'],
  ['scripts/check-deploy-imports.mjs'],
  ['local-net/console/chainid-test.mjs'],
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
  console.log('PASS: success, fail-fast, inconclusive, signal, spawn error, real child failure');
} else if (args.length) {
  console.error('Usage: node scripts/check-local.mjs [--self-test]');
  process.exitCode = 2;
} else {
  const result = runChecks(checks, childArgs => {
    console.log(`\nRUN node ${childArgs.join(' ')}`);
    return spawnSync(process.execPath, childArgs, {
      cwd: root, stdio: 'inherit', timeout: 120_000, shell: false,
    });
  });
  if (!result.ok) {
    console.error(`FAIL: ${result.failed}: ${result.reason}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${checks.length} repository checks. Live deployment and fork build are NOT verified.`);
  }
}
