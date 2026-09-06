#!/usr/bin/env node
// Freeze explicitly listed console/operator source bytes locally. Never deploys.
import * as fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { consoleReleaseFiles, verifyConsoleRelease, readConsoleSourceBytes as sourceBytes,
  consoleReleaseSha as sha, isConsoleReleaseHash as validHash, CONSOLE_RELEASE_GROUPS as groups,
  CONSOLE_RELEASE_MANIFEST as manifestPath } from '../local-net/lib/console-release.mjs';
export { consoleReleaseFiles, verifyConsoleRelease };

const defaultRoot = fileURLToPath(new URL('../', import.meta.url));
function git(root, ...args) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', timeout: 10_000,
    windowsHide: true, maxBuffer: 8 << 20 }).trim();
}
function cleanHead(root) {
  const actual = fs.realpathSync(git(root, 'rev-parse', '--show-toplevel'));
  if (actual !== fs.realpathSync(root)) throw new Error('Release source must be the Git repository root');
  if (git(root, 'branch', '--show-current') !== 'main') throw new Error('Console release preparation requires the main branch');
  if (git(root, 'status', '--porcelain=v1', '--untracked-files=all')) throw new Error('Console release preparation requires a clean committed working tree');
  if (git(root, 'ls-files', '-v', '-z').split('\0').some(entry => /^[a-zS] /.test(entry))) {
    throw new Error('Release source index hides tracked files with assume-unchanged or skip-worktree flags');
  }
  return { commit: git(root, 'rev-parse', 'HEAD'), tree: git(root, 'rev-parse', 'HEAD^{tree}'), branch: 'main' };
}
export function prepareConsoleRelease(root = defaultRoot) {
  root = path.resolve(root);
  const source = cleanHead(root);
  const manifest = JSON.parse(sourceBytes(root, manifestPath));
  const files = consoleReleaseFiles(manifest);
  const tracked = new Set(git(root, 'ls-files', '-z').split('\0'));
  for (const file of files) if (!tracked.has(file)) throw new Error(`Release input is not tracked: ${file}`);
  const outputRoot = path.join(root, 'work', 'console-releases');
  fs.mkdirSync(outputRoot, { recursive: true });
  const directory = fs.mkdtempSync(path.join(outputRoot, `${source.commit.slice(0, 12)}-`));
  const payload = path.join(directory, 'payload');
  fs.mkdirSync(payload);
  const records = [];
  for (const name of files) {
    const bytes = sourceBytes(root, name), target = path.join(payload, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, bytes, { flag: 'wx', mode: 0o600 });
    records.push({ path: name, bytes: bytes.length, sha256: sha(bytes) });
  }
  if (JSON.stringify(cleanHead(root)) !== JSON.stringify(source)) throw new Error('Source revision changed while preparing the release');
  for (const record of records) {
    if (sha(sourceBytes(root, record.path)) !== record.sha256) throw new Error(`Source changed while preparing the release: ${record.path}`);
  }
  const metadata = Buffer.from(JSON.stringify({ schema: 1, kind: '9chain-console-release',
    createdAt: new Date().toISOString(), source, groups, files: records,
    validation: 'Packaging and source integrity only; no tests, deployment or network acceptance is implied.',
  }, null, 2) + '\n');
  fs.writeFileSync(path.join(directory, 'release.json'), metadata, { flag: 'wx' });
  fs.writeFileSync(path.join(directory, 'release.sha256'), sha(metadata) + '\n', { flag: 'wx' });
  return verifyConsoleRelease(directory, sha(metadata));
}
export function verifyConsoleReleaseSource(directory, expectedHash, root = defaultRoot) {
  if (!validHash(expectedHash)) throw new Error('Exact-source validation requires an expected release SHA-256');
  const verified = verifyConsoleRelease(directory, expectedHash);
  const current = cleanHead(path.resolve(root));
  if (['commit', 'tree', 'branch'].some(key => current[key] !== verified.source[key])) {
    throw new Error('Validation source revision does not match the frozen release');
  }
  const release = JSON.parse(sourceBytes(path.resolve(directory), 'release.json'));
  for (const record of release.files) {
    if (sha(sourceBytes(path.resolve(root), record.path)) !== record.sha256) {
      throw new Error(`Validation source bytes do not match the frozen release: ${record.path}`);
    }
  }
  return verified;
}

function main(args) {
  if (!args.length || (args.length === 2 && args[0] === '--repo')) {
    return prepareConsoleRelease(args[1] ?? defaultRoot);
  }
  if (args[0] === '--verify' && args[1] && (args.length === 2 || (args.length === 4 && args[2] === '--expected-sha256'))) {
    return verifyConsoleRelease(args[1], args[3]);
  }
  throw new Error('Usage: node scripts/prepare-console-release.mjs [--repo PATH | --verify DIRECTORY [--expected-sha256 HASH]]');
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(main(process.argv.slice(2)), null, 2)); }
  catch (error) { console.error(`FAIL: ${error.message}`); process.exitCode = 1; }
}
