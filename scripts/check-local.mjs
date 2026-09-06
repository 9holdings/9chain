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
  ['scripts/prepare-console-release-test.mjs'],
  ['scripts/validate-console-release-test.mjs'],
  ['local-net/console/chainid-test.mjs'],
];
const consoleChecks = [
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
} else if (args.length && !(args.length === 1 && args[0] === '--console')) {
  console.error('Usage: node scripts/check-local.mjs [--self-test | --console]');
  process.exitCode = 2;
} else {
  const selected = args[0] === '--console' ? [...checks, ...consoleChecks] : checks;
  const result = runChecks(selected, childArgs => {
    console.log(`\nRUN node ${childArgs.join(' ')}`);
    return spawnSync(process.execPath, childArgs, {
      cwd: root, stdio: 'inherit', timeout: 120_000, shell: false,
    });
  });
  if (!result.ok) {
    console.error(`FAIL: ${result.failed}: ${result.reason}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${selected.length} local checks. Live deployment and fork build are NOT verified.`);
  }
}
