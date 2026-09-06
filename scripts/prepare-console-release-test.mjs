#!/usr/bin/env node
// Actual CLI/Git/file checks in synthetic repositories; no network or deployment.
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const script = path.join(root, 'scripts/prepare-console-release.mjs');
fs.mkdirSync(path.join(root, 'work'), { recursive: true });
const scratch = fs.mkdtempSync(path.join(root, 'work/console-release-test-'));
const repo = path.join(scratch, 'source'); fs.mkdirSync(repo);
const put = (name, bytes) => {
  const file = path.join(repo, name); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, bytes);
};
const manifestPath = 'local-net/deploy/manifest-deploy.json';
const originalManifest = { groups: {
  console: { restart: 'local-net/deploy/console-restart.sh', files: [
    'local-net/console/server.mjs', 'local-net/console/package.json', 'local-net/console/package-lock.json',
    'local-net/lib/shared.mjs', 'local-net/deploy/console-restart.sh'] },
  vantoc: { files: ['scripts/inspect.mjs', 'local-net/lib/shared.mjs'] },
  faucet: { files: ['local-net/faucet/server.mjs'] },
}, ignore: [] };
put('.gitignore', '/work/\n');
put(manifestPath, JSON.stringify(originalManifest, null, 2));
for (const file of new Set(Object.values(originalManifest.groups).flatMap(group => group.files))) {
  put(file, `Synthetic source: ${file}\n`);
}
function git(...args) {
  const result = spawnSync('git', ['-c', 'core.hooksPath=' + path.join(scratch, 'no-hooks'),
    '-c', 'commit.gpgsign=false', '-C', repo, ...args], { encoding: 'utf8', timeout: 10000, windowsHide: true });
  assert.equal(result.status, 0, result.stderr); return result.stdout.trim();
}
git('init', '-b', 'main'); git('config', 'user.name', 'Synthetic Release Test');
git('config', 'user.email', 'release-test@example.invalid');
const commit = message => { git('add', '--', '.'); git('commit', '-m', message); };
commit('Create synthetic release inputs');
let checks = 0;
function cli(args, expected, pattern) {
  const result = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', timeout: 15000, windowsHide: true });
  assert.equal(result.status, expected, result.stderr);
  if (pattern) assert.match(result.stderr, pattern);
  if (expected !== 0) assert.equal(result.stdout, '', 'A failed release must not print a success receipt');
  checks++; return expected === 0 ? JSON.parse(result.stdout) : null;
}
let variantCount = 0;
function variant(bundle) {
  const directory = path.join(scratch, `variant-${++variantCount}`);
  fs.cpSync(bundle.directory, directory, { recursive: true, errorOnExist: true }); return directory;
}
function rewriteMetadata(directory, edit) {
  const file = path.join(directory, 'release.json');
  const value = JSON.parse(fs.readFileSync(file, 'utf8')); edit(value);
  const bytes = Buffer.from(JSON.stringify(value, null, 2) + '\n'); fs.writeFileSync(file, bytes);
  fs.writeFileSync(path.join(directory, 'release.sha256'), createHash('sha256').update(bytes).digest('hex') + '\n');
}
const bundle = cli(['--repo', repo], 0);
assert.equal(bundle.files, 7, 'Union must include operator, lock, restart and manifest exactly once');
assert.equal(bundle.expectedHashVerified, true);
assert.equal(fs.existsSync(path.join(bundle.directory, 'payload/local-net/faucet')), false);
cli(['--verify', bundle.directory, '--expected-sha256', bundle.sha256], 0);
const sourceHead = git('rev-parse', 'HEAD'); assert.equal(bundle.source.commit, sourceHead);
console.log('PASS: clean committed main, exact console/operator union, excluded faucet, frozen bytes and expected hash');

let bad = variant(bundle);
fs.appendFileSync(path.join(bad, 'payload/local-net/console/server.mjs'), 'synthetic corruption');
cli(['--verify', bad], 1, /hash or size mismatch/);
bad = variant(bundle); fs.writeFileSync(path.join(bad, 'payload/extra.env'), 'synthetic-not-a-key');
cli(['--verify', bad], 1, /unlisted file/);
bad = variant(bundle); fs.mkdirSync(path.join(bad, 'payload/extra-directory'));
cli(['--verify', bad], 1, /unlisted directory/);
bad = variant(bundle); fs.writeFileSync(path.join(bad, 'extra.txt'), 'synthetic');
cli(['--verify', bad], 1, /unlisted file/);
bad = variant(bundle); fs.appendFileSync(path.join(bad, 'release.json'), ' ');
cli(['--verify', bad], 1, /metadata hash/);
bad = variant(bundle); rewriteMetadata(bad, value => { value.createdAt = 'modified-with-recomputed-hash'; });
cli(['--verify', bad, '--expected-sha256', bundle.sha256], 1, /metadata hash/);
bad = variant(bundle); rewriteMetadata(bad, value => { value.files.push(value.files[0]); });
cli(['--verify', bad], 1, /duplicate or out-of-scope/);
bad = variant(bundle); rewriteMetadata(bad, value => { value.files[0].path = '../../escape'; });
cli(['--verify', bad], 1, /duplicate or out-of-scope/);
bad = variant(bundle); rewriteMetadata(bad, value => { value.files = value.files.filter(file => file.path !== 'scripts/inspect.mjs'); });
cli(['--verify', bad], 1, /inventory does not match/);
cli(['--verify', bundle.directory, '--expected-sha256', 'not-a-hash'], 1, /Expected release SHA/);
const linked = path.join(scratch, 'linked-payload'); fs.mkdirSync(linked);
for (const name of ['release.json', 'release.sha256']) fs.copyFileSync(path.join(bundle.directory, name), path.join(linked, name));
fs.symlinkSync(path.join(bundle.directory, 'payload'), path.join(linked, 'payload'), process.platform === 'win32' ? 'junction' : 'dir');
cli(['--verify', linked], 1, /payload must be a real directory/);
console.log('PASS: changed bytes, extra files/directories, metadata tampering, expected-hash mismatch, duplicate/traversal/missing inventory');

put('local-net/console/server.mjs', 'uncommitted synthetic change');
cli(['--repo', repo], 1, /clean committed working tree/);
cli(['--verify', bundle.directory, '--expected-sha256', bundle.sha256], 0);
commit('Change source after freezing');
cli(['--verify', bundle.directory, '--expected-sha256', bundle.sha256], 0);
assert.notEqual(git('rev-parse', 'HEAD'), bundle.source.commit, 'Frozen release verification must not follow later source edits');
git('checkout', '-b', 'not-console-owner'); cli(['--repo', repo], 1, /main branch/);
git('checkout', '--detach'); cli(['--repo', repo], 1, /main branch/); git('checkout', 'main');
console.log('PASS: dirty/other/detached source refused while previously frozen release stays verifiable');

for (const [label, edit, pattern] of [
  ['runtime ledger', value => value.groups.console.files.push('9chain-a1-config/console-chains.json'), /outside the console source scope/],
  ['validator genesis', value => value.groups.console.files.push('9chain-a1-config/genesis.json'), /outside the console source scope/],
  ['credential file', value => value.groups.console.files.push('local-net/console/.env'), /outside the console source scope/],
  ['path traversal', value => value.groups.console.files.push('local-net/console/../../outside.mjs'), /outside the console source scope/],
  ['no operator group', value => { delete value.groups.vantoc; }, /vantoc is missing or empty/],
  ['no restart helper', value => { value.groups.console.files = value.groups.console.files.filter(file => !file.endsWith('console-restart.sh')); }, /restart helper/],
  ['no dependency lock', value => { value.groups.console.files = value.groups.console.files.filter(file => !file.endsWith('package-lock.json')); }, /dependency lock/],
  ['ignored source', value => { value.ignore.push({ pattern: '^local-net/lib/shared' }); }, /excluded by the manifest/],
]) {
  const value = structuredClone(originalManifest); edit(value); put(manifestPath, JSON.stringify(value)); commit(`Test ${label}`);
  cli(['--repo', repo], 1, pattern);
}
console.log('PASS: runtime/credential scope, manifest group coverage, restart helper and dependency lock required');
console.log(`PASS: ${checks} actual release CLI checks; synthetic evidence retained: ${scratch}`);
