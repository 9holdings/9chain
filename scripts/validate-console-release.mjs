#!/usr/bin/env node
// Bind local acceptance to a clean source revision and exact frozen release bytes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { verifyConsoleReleaseSource } from './prepare-console-release.mjs';

const defaultRoot = fileURLToPath(new URL('../', import.meta.url));
const artifactCheck = `const {CONTRACTS}=await import('./local-net/lib/l1-contracts.mjs');
if(Object.keys(CONTRACTS).length!==3 || Object.values(CONTRACTS).some(c=>!/^0x[0-9a-f]{200,}$/i.test(c.code||''))) {
  throw new Error('Console contract artifact must contain all three usable bytecodes');
}
console.log('PASS: three nonempty contract artifacts; execution is a separate gate');`;
export const CONSOLE_RELEASE_CHECKS = [
  ['scripts/check-local.mjs', '--console'],
  ['scripts/check-console-deployment.mjs'],
  ['local-net/deploy/check-html.mjs', 'local-net/console/index.html'],
  ['local-net/console/generation-test.mjs'],
  ['local-net/console/symbol-test.mjs'],
  ['local-net/lib/l1-options.mjs', '--self-test'],
  ['local-net/lib/l1-upgrade.mjs', '--self-test'],
  ['scripts/gen-chainid-issued.mjs', '--check'],
  ['--input-type=module', '-e', artifactCheck],
];
const sha = value => createHash('sha256').update(value).digest('hex');

export function validateConsoleRelease({ directory, expectedHash, root = defaultRoot, timeoutMs = 600_000 }) {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 600_000) {
    throw new Error('Validation timeout must be an integer from 1 to 600000 milliseconds');
  }
  const startedAt = new Date().toISOString();
  const deadline = performance.now() + timeoutMs;
  root = path.resolve(root);
  directory = path.resolve(directory);
  // No local acceptance process starts until source/package identity is established.
  const verified = verifyConsoleReleaseSource(directory, expectedHash, root);
  if (performance.now() > deadline) throw new Error('Console release validation exceeded its deadline before checks');
  const work = path.join(root, 'work/console-validations'); fs.mkdirSync(work, { recursive: true });
  const output = fs.mkdtempSync(path.join(work, verified.source.commit.slice(0, 12) + '-'));
  const report = { schema: 1, kind: '9chain-console-validation', releaseSha256: verified.sha256,
    source: verified.source, startedAt, platform: process.platform,
    nodeVersion: process.version, timeoutMs, outcome: 'running', checks: [],
    scope: 'Exact-source local acceptance with current local dependencies. Fresh dependency installation, fork build, consensus, live deployment and approval are separate evidence.' };
  try {
    const release = JSON.parse(fs.readFileSync(path.join(directory, 'release.json'), 'utf8'));
    const syntax = release.files.filter(file => file.path.endsWith('.mjs')).map(file => ({
      command: process.execPath, args: ['--check', path.join(directory, 'payload', file.path)] }));
    // Shell bytes will execute on Linux: forbid hidden CRLF translation after review.
    for (const file of release.files.filter(file => file.path.endsWith('.sh'))) {
      if (fs.readFileSync(path.join(directory, 'payload', file.path), 'utf8').includes('\r')) {
        throw new Error(`Release shell source must use LF line endings: ${file.path}`);
      }
      syntax.push({ command: process.platform === 'win32' ? 'C:/Program Files/Git/bin/bash.exe' : 'bash',
        args: ['-n', path.join(directory, 'payload', file.path)] });
    }
    const commands = [...syntax, ...CONSOLE_RELEASE_CHECKS.map(args => ({ command: process.execPath, args }))];
    for (const { command, args } of commands) {
      const remaining = Math.floor(deadline - performance.now());
      if (remaining <= 0) throw new Error('Console release validation exceeded its deadline');
      const started = performance.now();
      const commandLimit = args[0] === 'scripts/check-console-deployment.mjs' ? 360_000 : 120_000;
      const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', windowsHide: true,
        timeout: Math.min(commandLimit, remaining), maxBuffer: 4 << 20 });
      const logName = String(report.checks.length + 1).padStart(2, '0') + '.log';
      const log = (result.stdout ?? '') + (result.stderr ?? '');
      fs.writeFileSync(path.join(output, logName), log, { flag: 'wx' });
      report.checks.push({ command, args, exitCode: result.status, signal: result.signal,
        elapsedMs: Math.round(performance.now() - started), log: logName, logSha256: sha(log),
        ...(result.error ? { failure: result.error.code || result.error.name } : {}) });
      if (result.status !== 0 || result.signal || result.error) {
        throw new Error(`Local release check failed: ${args[0]} (${result.error?.code || result.signal || result.status})`);
      }
    }
    // Tests may have changed tracked source or a frozen file. Such a run never passes.
    verifyConsoleReleaseSource(directory, expectedHash, root);
    if (performance.now() > deadline) throw new Error('Console release validation exceeded its deadline');
    report.outcome = 'pass';
  } catch (error) { report.outcome = 'fail'; report.failure = error.message; }
  report.finishedAt = new Date().toISOString();
  const bytes = JSON.stringify(report, null, 2) + '\n';
  fs.writeFileSync(path.join(output, 'validation.json'), bytes, { flag: 'wx' });
  fs.writeFileSync(path.join(output, 'validation.sha256'), sha(bytes) + '\n', { flag: 'wx' });
  return { ...report, directory: output, sha256: sha(bytes) };
}

function main(args) {
  const options = {};
  for (let index = 0; index < args.length; index++) {
    const key = { '--release': 'directory', '--expected-sha256': 'expectedHash', '--repo': 'root', '--timeout-ms': 'timeoutMs' }[args[index]];
    if (!key || options[key] !== undefined || args[index + 1] === undefined) throw new Error('Unknown, repeated or incomplete validation argument');
    options[key] = key === 'timeoutMs' ? Number(args[++index]) : args[++index];
  }
  if (!options.directory || !options.expectedHash) throw new Error('Usage: node scripts/validate-console-release.mjs --release DIRECTORY --expected-sha256 HASH [--repo ROOT] [--timeout-ms N]');
  return validateConsoleRelease(options);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = main(process.argv.slice(2)); console.log(JSON.stringify(result, null, 2));
    if (result.outcome !== 'pass') process.exitCode = 1;
  } catch (error) { console.error(`FAIL: ${error.message}`); process.exitCode = 1; }
}
