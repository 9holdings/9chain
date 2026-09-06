#!/usr/bin/env node
// Freeze explicitly listed console/operator source bytes locally. Never deploys.
import * as fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const defaultRoot = fileURLToPath(new URL('../', import.meta.url));
const manifestPath = 'local-net/deploy/manifest-deploy.json';
const groups = ['console', 'vantoc'];
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
function permitted(name) {
  // This is a scope guard, not a second file inventory. Operational directories,
  // credentials, validator genesis, .env and node_modules cannot enter a release.
  return typeof name === 'string' && !name.includes('..') && (
    /^local-net\/(?:console|lib)\/[A-Za-z0-9_.-]+\.(?:mjs|html|json)$/.test(name) ||
    /^local-net\/deploy\/[A-Za-z0-9_.-]+\.(?:mjs|sh)$/.test(name) ||
    /^scripts\/[A-Za-z0-9_.-]+\.mjs$/.test(name) ||
    name === manifestPath || name === '9chain-a1-config/l1-evm-genesis.json');
}
export function consoleReleaseFiles(manifest) {
  const selected = new Set([manifestPath]);
  for (const group of groups) {
    const files = manifest?.groups?.[group]?.files;
    if (!Array.isArray(files) || !files.length) throw new Error(`Release manifest group ${group} is missing or empty`);
    for (const name of files) {
      if (!permitted(name)) throw new Error(`Release path is outside the console source scope: ${String(name)}`);
      if ((manifest.ignore ?? []).some(rule => new RegExp(rule.pattern).test(name))) {
        throw new Error(`Release path is excluded by the manifest: ${name}`);
      }
      selected.add(name);
    }
  }
  if (!selected.has(manifest.groups.console.restart)) throw new Error('The console restart helper must be included in the console manifest');
  if (!selected.has('local-net/console/package-lock.json')) throw new Error('The console dependency lock must be included in the console manifest');
  return [...selected].sort();
}
function git(root, ...args) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', timeout: 10_000,
    windowsHide: true, maxBuffer: 8 << 20 }).trim();
}
function cleanHead(root) {
  const actual = fs.realpathSync(git(root, 'rev-parse', '--show-toplevel'));
  if (actual !== fs.realpathSync(root)) throw new Error('Release source must be the Git repository root');
  if (git(root, 'branch', '--show-current') !== 'main') throw new Error('Console release preparation requires the main branch');
  if (git(root, 'status', '--porcelain=v1', '--untracked-files=all')) throw new Error('Console release preparation requires a clean committed working tree');
  return { commit: git(root, 'rev-parse', 'HEAD'), tree: git(root, 'rev-parse', 'HEAD^{tree}'), branch: 'main' };
}
function sourceBytes(root, name) {
  const file = path.join(root, name);
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 64 * 1024 * 1024) throw new Error(`Release input must be a regular source file under 64 MiB: ${name}`);
  const parent = fs.realpathSync(root) + path.sep;
  if (!fs.realpathSync(file).startsWith(parent)) throw new Error(`Release input resolves outside its source root: ${name}`);
  return fs.readFileSync(file);
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
export function verifyConsoleRelease(directory, expectedHash) {
  directory = path.resolve(directory);
  if (expectedHash !== undefined && !validHash(expectedHash)) throw new Error('Expected release SHA-256 must be 64 lowercase hexadecimal characters');
  const metadata = sourceBytes(directory, 'release.json');
  if (metadata.length > 2 * 1024 * 1024) throw new Error('Release metadata exceeds 2 MiB');
  const recorded = sourceBytes(directory, 'release.sha256').toString('utf8').trim();
  const digest = sha(metadata);
  if (!validHash(recorded) || digest !== recorded || (expectedHash && digest !== expectedHash)) throw new Error('Release metadata hash does not match the recorded or expected SHA-256');
  const release = JSON.parse(metadata);
  if (release.schema !== 1 || release.kind !== '9chain-console-release' ||
      JSON.stringify(release.groups) !== JSON.stringify(groups) ||
      !/^[a-f0-9]{40}$/.test(release.source?.commit ?? '') || !/^[a-f0-9]{40}$/.test(release.source?.tree ?? '') ||
      release.source?.branch !== 'main' || !Array.isArray(release.files) || !release.files.length || release.files.length > 1000) {
    throw new Error('Invalid console release metadata');
  }
  const names = release.files.map(record => record.path);
  if (new Set(names).size !== names.length || names.some(name => !permitted(name))) throw new Error('Release metadata contains duplicate or out-of-scope paths');
  const payload = path.join(directory, 'payload');
  const payloadStat = fs.lstatSync(payload);
  if (!payloadStat.isDirectory() || payloadStat.isSymbolicLink()) throw new Error('Release payload must be a real directory');
  const selected = consoleReleaseFiles(JSON.parse(sourceBytes(payload, manifestPath)));
  if (JSON.stringify([...names].sort()) !== JSON.stringify(selected)) throw new Error('Release file inventory does not match its console/operator manifest');
  let bytes = 0;
  for (const record of release.files) {
    const content = sourceBytes(payload, record.path);
    if (!Number.isSafeInteger(record.bytes) || record.bytes < 0 || content.length !== record.bytes ||
        !validHash(record.sha256) || sha(content) !== record.sha256) throw new Error(`Release file hash or size mismatch: ${record.path}`);
    bytes += content.length;
  }
  const expectedFiles = new Set(['release.json', 'release.sha256', ...names.map(name => `payload/${name}`)]);
  const expectedDirectories = new Set(['payload']);
  for (const name of expectedFiles) {
    let dir = path.posix.dirname(name);
    while (dir !== '.') { expectedDirectories.add(dir); dir = path.posix.dirname(dir); }
  }
  function inspect(relative = '') {
    for (const entry of fs.readdirSync(path.join(directory, relative), { withFileTypes: true })) {
      const name = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isSymbolicLink()) throw new Error(`Release contains a symbolic link: ${name}`);
      if (entry.isDirectory()) {
        if (!expectedDirectories.has(name)) throw new Error(`Release contains an unlisted directory: ${name}`);
        inspect(name);
      } else if (!entry.isFile() || !expectedFiles.has(name)) throw new Error(`Release contains an unlisted file: ${name}`);
    }
  }
  inspect();
  return { directory, sha256: digest, source: release.source, groups, files: names.length, bytes,
    expectedHashVerified: expectedHash !== undefined,
    scope: 'Local source package integrity; not test acceptance, a signature or deployment authorization.' };
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
