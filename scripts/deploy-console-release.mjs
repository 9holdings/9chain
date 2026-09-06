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
function readPausedReceipt(file, expected, options, bundle) {
  if (!validHash(expected)) throw new Error('Resume requires the expected paused-receipt SHA-256');
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 2 * 1024 * 1024) throw new Error('Paused receipt must be a bounded regular file');
  const bytes = fs.readFileSync(file);
  if (sha(bytes) !== expected) throw new Error('Paused receipt differs from the expected SHA-256');
  const result = JSON.parse(bytes);
  if (result.schema !== 1 || result.kind !== '9chain-console-deployment' || result.outcome !== 'paused' ||
      !uuid(result.actor?.runId) || result.actor.commit !== bundle.source.commit || result.releaseSha256 !== bundle.sha256 ||
      result.host !== options.host || result.sourceDirectory !== options.sourceDirectory ||
      !['backupSha256', 'dependenciesSha256', 'installSha256', 'restartSha256', 'configurationSha256'].every(key => validHash(result[key]))) throw new Error('Paused receipt is incomplete or belongs to another release/target');
  paused(result.state); return result;
}

export async function deployConsoleRelease(options) {
  const root = path.resolve(options.root ?? rootDefault);
  if (fs.realpathSync(root) !== fs.realpathSync(rootDefault)) throw new Error('Deployment must validate the repository containing its controller');
  const { directory, expectedHash, action = 'plan', host = SSH_HOST, key = SSH_KEY, sourceDirectory = SRC_DIR } = options;
  if (!['plan', 'apply', 'resume'].includes(action) || !directory || !validHash(expectedHash)) throw new Error('Provide a release directory and expected SHA-256 with one deployment action');
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
    constraints: ['Public apply/resume require owner approval.', 'Legacy HTTP 404 stops before source copy; no bootstrap bypass.',
      'Failures preserve pause, lock, stage, backup and receipts. No automatic retry, rollback, cleanup, genesis or validator change.'] };
  if (action === 'plan') return plan;
  const previous = action === 'resume' ? readPausedReceipt(options.receiptFile, options.receiptHash, { host, sourceDirectory }, bundle) : null;
  const actor = previous?.actor ?? { runId: randomUUID(), host: os.hostname(), user: os.userInfo().username, branch: 'main', commit: bundle.source.commit };
  const work = path.join(root, 'work/console-deployments'); fs.mkdirSync(work, { recursive: true });
  const evidence = fs.mkdtempSync(path.join(work, actor.runId + '-'));
  const report = { schema: 1, kind: '9chain-console-deployment', action, actor, releaseSha256: bundle.sha256,
    host, sourceDirectory, startedAt: new Date().toISOString(), outcome: 'running', events: [],
    ...(previous ? Object.fromEntries(['state', 'backupSha256', 'dependenciesSha256', 'installSha256', 'restartSha256', 'configurationSha256'].map(key => [key, previous[key]])) : {}) };
  function event(phase, value) {
    const record = { phase, observedAt: new Date().toISOString(), value };
    const receipt = writeReceipt(evidence, String(report.events.length + 1).padStart(2, '0') + '-' + phase + '.json', record);
    report.events.push({ phase, ...receipt });
    process.stderr.write(`PASS: ${phase}\n`); return value;
  }
  const phaseRequest = action => ({ action, state: report.state, backupSha256: report.backupSha256,
    dependenciesSha256: report.dependenciesSha256, installSha256: report.installSha256, restartSha256: report.restartSha256, configurationSha256: report.configurationSha256 });
  let phase = 'local-validation';
  try {
    const validation = validateConsoleRelease({ directory: bundle.directory, expectedHash: bundle.sha256, root });
    if (validation.outcome !== 'pass') throw new Error('Exact-source local validation failed; no remote mutation is permitted');
    event(phase, { directory: validation.directory, sha256: validation.sha256, checks: validation.checks.length });
    verifyConsoleReleaseSource(bundle.directory, bundle.sha256, root);
    if (action === 'apply') {
      phase = 'source-audit'; event(phase, transport.audit());
      phase = 'maintenance-status'; const initial = maintenanceState(event(phase, transport.maintenance('status')));
      if (initial.paused) throw new Error('Console is already paused; do not adopt another maintenance session automatically');
      phase = 'lock-acquire'; event(phase, transport.lock('acquire', actor));
      phase = 'maintenance-recheck'; const current = maintenanceState(event(phase, transport.maintenance('status', { instanceId: initial.instanceId })));
      if (current.paused || current.instanceId !== initial.instanceId) throw new Error('Console process or maintenance changed before deployment pause');
      phase = 'pause-and-drain'; report.state = paused(event(phase, transport.maintenance('pause-and-wait', { instanceId: current.instanceId })));
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
    if (['--apply', '--resume'].includes(args[index])) {
      if (selected) throw new Error('Choose one deployment action'); selected = true;
      options.action = args[index].slice(2); continue;
    }
    const key = { '--release': 'directory', '--expected-sha256': 'expectedHash', '--repo': 'root',
      '--host': 'host', '--ssh-key': 'key', '--src': 'sourceDirectory', '--receipt': 'receiptFile', '--expected-receipt-sha256': 'receiptHash' }[args[index]];
    if (!key || options[key] !== undefined || args[index + 1] === undefined) throw new Error('Unknown, repeated or incomplete deployment argument');
    options[key] = args[++index];
  }
  if (options.action === 'resume' ? !options.receiptFile || !options.receiptHash : options.receiptFile || options.receiptHash) throw new Error('Only --resume requires --receipt and --expected-receipt-sha256');
  return deployConsoleRelease(options);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { const result = await main(process.argv.slice(2)); console.log(JSON.stringify(result, null, 2)); if (result.outcome === 'fail') process.exitCode = 1; }
  catch (error) { console.error(`FAIL: ${error.message}`); process.exitCode = 1; }
}
