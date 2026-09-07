#!/usr/bin/env node
// Plan by default. Applying and resuming are separate, explicitly reviewed actions.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { verifyConsoleReleaseSource } from './prepare-console-release.mjs';
import { validateConsoleRelease } from './validate-console-release.mjs';
import { consoleDeployTransport } from './console-deploy-transport.mjs';
import { maintenanceState } from '../local-net/deploy/console-maintenance.mjs';
import { consoleReleaseSha as sha, isConsoleReleaseHash as validHash } from '../local-net/lib/console-release.mjs';
import { SSH_HOST, SSH_KEY, SRC_DIR } from '../local-net/lib/server.mjs';

const rootDefault = fileURLToPath(new URL('../', import.meta.url));
const uuid = value => typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);
function writeReceipt(directory, name, value) {
  const bytes = Buffer.from(JSON.stringify(value, null, 2) + '\n');
  const target = path.join(directory, name), fd = fs.openSync(target, 'wx', 0o600);
  try { fs.writeFileSync(fd, bytes); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
  if (process.platform !== 'win32') { const descriptor = fs.openSync(directory, 'r'); try { fs.fsyncSync(descriptor); } finally { fs.closeSync(descriptor); } }
  return { path: target, sha256: sha(bytes) };
}
function localCommand(root, args) {
  const result = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', timeout: 120000, maxBuffer: 4 << 20, windowsHide: true });
  if (result.status !== 0 || result.signal || result.error) throw new Error(`Required acceptance failed: ${args[0]} (${result.error?.code || result.signal || result.status})`);
  return { command: args[0], exitCode: 0, outputSha256: sha((result.stdout || '') + (result.stderr || '')) };
}
function paused(value) {
  const state = maintenanceState(value);
  if (!state.readyForRestart) throw new Error('Deployment requires drained persistent maintenance');
  return state;
}
function readReceipt(file, expected, options, bundle, label) {
  if (!validHash(expected)) throw new Error(`${label} requires the expected receipt SHA-256`);
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 2 * 1024 * 1024) throw new Error('Deployment receipt must be a bounded regular file');
  const bytes = fs.readFileSync(file);
  if (sha(bytes) !== expected) throw new Error('Deployment receipt differs from the expected SHA-256');
  const result = JSON.parse(bytes);
  if (result.schema !== 1 || result.kind !== '9chain-console-deployment' ||
      !uuid(result.actor?.runId) || result.actor.commit !== bundle.source.commit || result.releaseSha256 !== bundle.sha256 ||
      result.host !== options.host || result.sourceDirectory !== options.sourceDirectory) throw new Error('Deployment receipt belongs to another release/target');
  return result;
}
function readPausedReceipt(file, expected, options, bundle) {
  const result = readReceipt(file, expected, options, bundle, 'Resume');
  if (result.outcome !== 'paused' ||
      !['backupSha256', 'dependenciesSha256', 'installSha256', 'restartSha256', 'configurationSha256'].every(key => validHash(result[key]))) throw new Error('Paused receipt is incomplete or belongs to another release/target');
  paused(result.state); return result;
}
// Phases after which the server holds our lock (and maybe our pause) but NOT our code: an
// unwind is a pure return to the pre-deployment state. From `install` onward the source has
// changed, and going back is a reviewed restore from the backup, never an automatic step.
const UNWINDABLE_PHASES = ['maintenance-recheck', 'pause-and-drain', 'lock-before-stage', 'stage', 'upload', 'verify-package', 'backup', 'dependencies', 'legacy-idle-recheck'];
function readFailedReceipt(file, expected, options, bundle) {
  const result = readReceipt(file, expected, options, bundle, 'Unwind');
  if (result.outcome !== 'fail' || result.action !== 'apply') throw new Error('Unwind requires the receipt of a FAILED apply');
  if (!UNWINDABLE_PHASES.includes(result.failedPhase)) {
    throw new Error(`Unwind covers failures before the source changed (${UNWINDABLE_PHASES.join(', ')}); this apply failed at ${result.failedPhase}. ` +
      'Restore from the backup under review, then --resume after verify-installed passes.');
  }
  return result;
}

export async function deployConsoleRelease(options) {
  const root = path.resolve(options.root ?? rootDefault);
  if (fs.realpathSync(root) !== fs.realpathSync(rootDefault)) throw new Error('Deployment must validate the repository containing its controller');
  const { directory, expectedHash, action = 'plan', host = SSH_HOST, key = SSH_KEY, sourceDirectory = SRC_DIR, bootstrapLegacy = false } = options;
  if (!['plan', 'apply', 'resume', 'unwind'].includes(action) || !directory || !validHash(expectedHash)) throw new Error('Provide a release directory and expected SHA-256 with one deployment action');
  if (bootstrapLegacy && action !== 'apply') throw new Error('--bootstrap-legacy applies only to --apply');
  const bundle = verifyConsoleReleaseSource(path.resolve(directory), expectedHash, root);
  localCommand(root, ['scripts/check-worktree-ownership.mjs', '--deploy', 'console']);
  const transport = consoleDeployTransport({ root, bundle, host, key, sourceDirectory });
  const plan = { schema: 1, kind: '9chain-console-deployment-plan', source: bundle.source,
    releaseSha256: bundle.sha256, releaseDirectory: bundle.directory, host, sourceDirectory,
    files: bundle.files, defaultAction: 'plan',
    steps: ['Exact-source local acceptance', 'Read-only source/orphan audit and compatible open maintenance API',
      'Exclusive invocation lock', 'Persistent pause and admission drain', 'Exclusive stage and frozen package verification',
      'Bounded old source/state backup', 'Separate lockfile dependency installation', 'Verified source and dependency replacement',
      'Targeted restart into persistent maintenance', 'Installed-file, dependency and runtime verification; retain pause and lock',
      'Separate reviewed resume: repeat local acceptance, exact remote audit and public drift/ledger gates, then release maintenance and lock'],
    constraints: ['Public apply/resume require owner approval.',
      'Legacy HTTP 404 stops before source copy unless --bootstrap-legacy is given; the bootstrap requires an idle legacy console, checked twice, and ends paused like every apply.',
      'Failures preserve pause, lock, stage, backup and receipts. No automatic retry, rollback, cleanup, genesis or validator change.',
      '--unwind returns a failed apply that never changed the source (before install) to the pre-deployment state: resume the pause it set, abandon its lock, no deployed receipt.'] };
  if (action === 'plan') return plan;
  const previous = action === 'resume' ? readPausedReceipt(options.receiptFile, options.receiptHash, { host, sourceDirectory }, bundle)
    : action === 'unwind' ? readFailedReceipt(options.receiptFile, options.receiptHash, { host, sourceDirectory }, bundle) : null;
  const actor = previous?.actor ?? { runId: randomUUID(), host: os.hostname(), user: os.userInfo().username, branch: 'main', commit: bundle.source.commit };
  const work = path.join(root, 'work/console-deployments'); fs.mkdirSync(work, { recursive: true });
  const evidence = fs.mkdtempSync(path.join(work, actor.runId + '-'));
  const report = { schema: 1, kind: '9chain-console-deployment', action, actor, releaseSha256: bundle.sha256,
    host, sourceDirectory, startedAt: new Date().toISOString(), outcome: 'running', events: [],
    ...(bootstrapLegacy ? { legacy: true } : {}),
    ...(previous ? Object.fromEntries(['state', 'backupSha256', 'dependenciesSha256', 'installSha256', 'restartSha256', 'configurationSha256'].map(key => [key, previous[key]])) : {}) };
  function event(phase, value) {
    const record = { phase, observedAt: new Date().toISOString(), value };
    const receipt = writeReceipt(evidence, String(report.events.length + 1).padStart(2, '0') + '-' + phase + '.json', record);
    report.events.push({ phase, ...receipt });
    process.stderr.write(`PASS: ${phase}\n`); return value;
  }
  const phaseRequest = action => ({ action, state: report.state, backupSha256: report.backupSha256,
    dependenciesSha256: report.dependenciesSha256, installSha256: report.installSha256, restartSha256: report.restartSha256, configurationSha256: report.configurationSha256,
    ...(report.legacy ? { legacy: true } : {}) });
  let phase = 'local-validation';
  try {
    const validation = validateConsoleRelease({ directory: bundle.directory, expectedHash: bundle.sha256, root });
    if (validation.outcome !== 'pass') throw new Error('Exact-source local validation failed; no remote mutation is permitted');
    event(phase, { directory: validation.directory, sha256: validation.sha256, checks: validation.checks.length });
    verifyConsoleReleaseSource(bundle.directory, bundle.sha256, root);
    if (action === 'unwind') {
      phase = 'lock-before-unwind'; event(phase, transport.lock('assert', actor));
      // The pause this apply set (or tried to set) is released with the ids the console reports NOW:
      // our lock is the proof nobody else is deploying, so a pause on this console is ours.
      phase = 'maintenance-status'; const current = maintenanceState(event(phase, transport.maintenance('status')));
      if (current.paused) {
        if (!current.readyForRestart) throw new Error('Console still has admitted operations; wait, then unwind again');
        phase = 'maintenance-resume'; const reopened = maintenanceState(event(phase, transport.maintenance('resume', { instanceId: current.instanceId, maintenanceId: current.maintenanceId })));
        if (reopened.paused) throw new Error('Console did not confirm maintenance release; inspect before retrying');
        report.state = reopened;
      } else report.state = current;
      phase = 'lock-abandon'; const freed = event(phase, transport.lock('abandon', actor));
      if (freed.ok !== true) throw new Error('Lock abandon was not confirmed');
      report.outcome = 'unwound';
    } else if (action === 'apply') {
      phase = 'source-audit'; event(phase, transport.audit());
      phase = 'maintenance-status';
      let initial = null;
      try { initial = maintenanceState(event(phase, transport.maintenance('status'))); }
      catch (error) {
        // The console built before D-210 answers 404 here. Only the explicit bootstrap flag
        // turns that into a path, and that path has its own gate (the idle probe, twice).
        if (!bootstrapLegacy || !/HTTP 404/.test(error.message)) throw error;
        event(phase, { legacy: true, http: 404 });
      }
      if (bootstrapLegacy && initial) throw new Error('Console has the maintenance API; drop --bootstrap-legacy and use the standard paused path');
      if (initial?.paused) throw new Error('Console is already paused; do not adopt another maintenance session automatically');
      if (initial) {
        phase = 'lock-acquire'; event(phase, transport.lock('acquire', actor));
        phase = 'maintenance-recheck'; const current = maintenanceState(event(phase, transport.maintenance('status', { instanceId: initial.instanceId })));
        if (current.paused || current.instanceId !== initial.instanceId) throw new Error('Console process or maintenance changed before deployment pause');
        phase = 'pause-and-drain'; report.state = paused(event(phase, transport.maintenance('pause-and-wait', { instanceId: current.instanceId })));
      } else {
        phase = 'legacy-idle'; event(phase, transport.maintenance('legacy-idle'));
        phase = 'lock-acquire'; event(phase, transport.lock('acquire', actor));
        phase = 'legacy-idle-recheck'; event(phase, transport.maintenance('legacy-idle'));
      }
      verifyConsoleReleaseSource(bundle.directory, bundle.sha256, root);
      phase = 'lock-before-stage'; event(phase, transport.lock('assert', actor));
      phase = 'stage'; const stage = event(phase, transport.stage(actor));
      phase = 'upload'; event(phase, transport.upload(stage.stage));
      phase = 'verify-package'; event(phase, transport.verifyPackage(actor));
      phase = 'backup'; const backup = event(phase, transport.phase(actor, phaseRequest(phase)));
      if (!validHash(backup.backup?.sha256) || !validHash(backup.configurationSha256)) throw new Error('Backup did not return its verified hash and intended configuration identity');
      report.backupSha256 = backup.backup.sha256;
      report.configurationSha256 = backup.configurationSha256;
      for (const name of ['dependencies', 'install', 'restart']) {
        phase = name; const result = event(name, transport.phase(actor, phaseRequest(name)));
        if (!validHash(result.sha256)) throw new Error('Installation phase did not return its receipt hash');
        report[name + 'Sha256'] = result.sha256;
        if (name === 'restart') report.state = paused(result.state);
      }
      phase = 'verify-installed'; event(phase, transport.phase(actor, phaseRequest('verify')));
      report.outcome = 'paused'; report.requiresReviewedResume = true;
    } else {
      phase = 'lock-before-resume'; event(phase, transport.lock('assert', actor));
      phase = 'verify-installed'; event(phase, transport.phase(actor, phaseRequest('verify')));
      phase = 'exact-source-audit'; const audit = event(phase, transport.audit(true));
      phase = 'public-drift'; event(phase, localCommand(root, ['scripts/check-deploy-drift.mjs', '--host', host, '--ssh-key', key, '--src', audit.sourceDirectory]));
      phase = 'public-ledger'; event(phase, localCommand(root, ['scripts/check-chain-ledger.mjs']));
      // Fresh source acceptance and server evidence precede the one resume request.
      verifyConsoleReleaseSource(bundle.directory, bundle.sha256, root);
      phase = 'resume'; const result = event(phase, transport.phase(actor, phaseRequest('resume')));
      if (maintenanceState(result.state).paused || result.lockReleased !== true) throw new Error('Resume or lock release was not confirmed');
      report.state = result.state; report.outcome = 'resumed';
    }
  } catch (error) {
    report.outcome = 'fail'; report.failedPhase = phase; report.failure = error.message;
    report.remoteStateMayBeUncertain = true;
    report.nextAction = 'Preserve all evidence and inspect the last confirmed phase. Do not retry mutations, release locks, resume, restore or clean up automatically.';
  }
  report.finishedAt = new Date().toISOString();
  const receipt = writeReceipt(evidence, 'deployment.json', report);
  return { ...report, receipt };
}

async function main(args) {
  const options = {}; let selected = false;
  for (let index = 0; index < args.length; index++) {
    if (['--apply', '--resume', '--unwind'].includes(args[index])) {
      if (selected) throw new Error('Choose one deployment action'); selected = true;
      options.action = args[index].slice(2); continue;
    }
    if (args[index] === '--bootstrap-legacy') { if (options.bootstrapLegacy) throw new Error('Repeated deployment argument'); options.bootstrapLegacy = true; continue; }
    const key = { '--release': 'directory', '--expected-sha256': 'expectedHash', '--repo': 'root',
      '--host': 'host', '--ssh-key': 'key', '--src': 'sourceDirectory', '--receipt': 'receiptFile', '--expected-receipt-sha256': 'receiptHash' }[args[index]];
    if (!key || options[key] !== undefined || args[index + 1] === undefined) throw new Error('Unknown, repeated or incomplete deployment argument');
    options[key] = args[++index];
  }
  if (['resume', 'unwind'].includes(options.action) ? !options.receiptFile || !options.receiptHash : options.receiptFile || options.receiptHash) throw new Error('Only --resume and --unwind require --receipt and --expected-receipt-sha256');
  return deployConsoleRelease(options);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { const result = await main(process.argv.slice(2)); console.log(JSON.stringify(result, null, 2)); if (result.outcome === 'fail') process.exitCode = 1; }
  catch (error) { console.error(`FAIL: ${error.message}`); process.exitCode = 1; }
}
