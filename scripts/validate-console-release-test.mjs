#!/usr/bin/env node
// CLI orchestration in synthetic Git repositories; does not claim product acceptance.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { prepareConsoleRelease } from './prepare-console-release.mjs';
import { CONSOLE_RELEASE_CHECKS } from './validate-console-release.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const script = path.join(root, 'scripts/validate-console-release.mjs');
fs.mkdirSync(path.join(root, 'work'), { recursive: true });
const scratch = fs.mkdtempSync(path.join(root, 'work/release-validation-test-'));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
let checks = 0;
function git(repo, ...args) {
  const result = spawnSync('git', ['-c', 'core.hooksPath=' + path.join(scratch, 'no-hooks'),
    '-c', 'commit.gpgsign=false', '-C', repo, ...args], { encoding: 'utf8', timeout: 10_000, windowsHide: true });
  assert.equal(result.status, 0, result.stderr); return result.stdout.trim();
}
function fixture(name, edits = {}) {
  const repo = path.join(scratch, name); fs.mkdirSync(repo);
  const manifest = { groups: { console: { restart: 'local-net/deploy/console-restart.sh', files: [
    'local-net/console/server.mjs', 'local-net/console/package.json', 'local-net/console/package-lock.json',
    'local-net/lib/l1-contracts.mjs', 'local-net/deploy/console-restart.sh'] },
  vantoc: { files: ['scripts/inspect.mjs'] } }, ignore: [] };
  const files = { '.gitignore': '/work/\n', '.gitattributes': '* -text\n',
    'local-net/deploy/manifest-deploy.json': JSON.stringify(manifest),
    'local-net/console/server.mjs': 'export const fixture = true;\n',
    'local-net/console/package.json': '{"type":"module"}\n',
    'local-net/console/package-lock.json': '{}\n',
    'local-net/lib/l1-contracts.mjs': `export const CONTRACTS = ${JSON.stringify(Object.fromEntries(['one', 'two', 'three'].map(name => [name, { code: '0x' + 'ab'.repeat(101) }])))};\n`,
    'local-net/deploy/console-restart.sh': '#!/usr/bin/env bash\nexit 0\n',
    'scripts/inspect.mjs': 'export const fixture = true;\n',
  };
  for (const [entry] of CONSOLE_RELEASE_CHECKS.filter(args => !args[0].startsWith('--'))) {
    files[entry] = `import fs from 'node:fs'; fs.mkdirSync('work',{recursive:true}); fs.appendFileSync('work/order.log',${JSON.stringify(entry + '\n')}); console.log('Synthetic orchestration check');\n`;
  }
  Object.assign(files, edits);
  for (const [name, bytes] of Object.entries(files)) {
    const destination = path.join(repo, name); fs.mkdirSync(path.dirname(destination), { recursive: true }); fs.writeFileSync(destination, bytes);
  }
  git(repo, 'init', '-b', 'main'); git(repo, 'config', 'user.name', 'Synthetic Validation Test');
  git(repo, 'config', 'user.email', 'validation@example.invalid');
  git(repo, 'add', '--', ...Object.keys(files)); git(repo, 'commit', '-m', 'Prepare synthetic validation inputs');
  return { repo, bundle: prepareConsoleRelease(repo) };
}
function cli({ repo, bundle }, expected = 0, { pattern, extra = [], env, relative = false } = {}) {
  const directory = relative ? path.relative(root, bundle.directory) : bundle.directory;
  const result = spawnSync(process.execPath, [script, '--release', directory, '--expected-sha256', bundle.sha256,
    '--repo', repo, ...extra], { cwd: root, encoding: 'utf8', timeout: 20_000, windowsHide: true,
    env: { ...process.env, ...env } });
  assert.equal(result.status, expected, result.error?.message || result.stderr || result.stdout);
  const report = result.stdout ? JSON.parse(result.stdout) : null;
  if (pattern) assert.match(report?.failure || result.stderr, pattern);
  if (report) {
    assert.equal(report.outcome, expected === 0 ? 'pass' : 'fail');
    assert.equal(report.releaseSha256, bundle.sha256);
    const receipt = fs.readFileSync(path.join(report.directory, 'validation.json'));
    assert.equal(sha(receipt), report.sha256);
    assert.equal(fs.readFileSync(path.join(report.directory, 'validation.sha256'), 'utf8').trim(), report.sha256);
    for (const check of report.checks) assert.equal(sha(fs.readFileSync(path.join(report.directory, check.log))), check.logSha256);
  }
  checks++; return report;
}
try {
  const good = fixture('good');
  const accepted = cli(good, 0, { relative: true });
  assert.equal(accepted.source.commit, good.bundle.source.commit);
  const expectedOrder = CONSOLE_RELEASE_CHECKS.filter(args => !args[0].startsWith('--')).map(args => args[0]);
  const orderFile = path.join(good.repo, 'work/order.log');
  assert.deepEqual(fs.readFileSync(orderFile, 'utf8').trim().split('\n'), expectedOrder);
  assert.equal(accepted.checks.some(check => check.args[0] === '-n'), true, 'Actual Bash syntax check must run');
  const before = fs.readFileSync(orderFile);
  fs.writeFileSync(path.join(good.repo, 'note.md'), 'uncommitted fixture');
  cli(good, 1, { pattern: /clean committed working tree/ });
  assert.deepEqual(fs.readFileSync(orderFile), before, 'Dirty source must fail before any acceptance process starts');
  git(good.repo, 'add', '--', 'note.md'); git(good.repo, 'commit', '-m', 'Change source revision');
  cli(good, 1, { pattern: /revision does not match/ });
  assert.deepEqual(fs.readFileSync(orderFile), before);
  good.bundle = prepareConsoleRelease(good.repo);
  const entry = 'local-net/console/server.mjs';
  git(good.repo, 'update-index', '--assume-unchanged', entry);
  fs.appendFileSync(path.join(good.repo, entry), '// Hidden from Git status\n');
  assert.equal(git(good.repo, 'status', '--porcelain'), '');
  cli(good, 1, { pattern: /index hides tracked files/ });
  fs.copyFileSync(path.join(good.bundle.directory, 'payload', entry), path.join(good.repo, entry));
  git(good.repo, 'update-index', '--no-assume-unchanged', entry);
  git(good.repo, 'update-index', '--skip-worktree', 'scripts/check-local.mjs');
  cli(good, 1, { pattern: /index hides tracked files/ });
  git(good.repo, 'update-index', '--no-skip-worktree', 'scripts/check-local.mjs');
  // A self-consistent reviewed package still cannot claim unrelated working bytes.
  const altered = path.join(scratch, 'altered-package'); fs.cpSync(good.bundle.directory, altered, { recursive: true });
  const payloadEntry = path.join(altered, 'payload', entry); fs.appendFileSync(payloadEntry, '// Different reviewed bytes\n');
  const metadata = JSON.parse(fs.readFileSync(path.join(altered, 'release.json')));
  const record = metadata.files.find(file => file.path === entry); const changedBytes = fs.readFileSync(payloadEntry);
  record.bytes = changedBytes.length; record.sha256 = sha(changedBytes);
  const metadataBytes = JSON.stringify(metadata, null, 2) + '\n';
  fs.writeFileSync(path.join(altered, 'release.json'), metadataBytes); fs.writeFileSync(path.join(altered, 'release.sha256'), sha(metadataBytes) + '\n');
  cli({ ...good, bundle: { ...good.bundle, directory: altered, sha256: sha(metadataBytes) } }, 1, { pattern: /source bytes do not match/ });
  git(good.repo, 'checkout', '-b', 'different'); cli(good, 1, { pattern: /main branch/ });
  git(good.repo, 'checkout', 'main'); git(good.repo, 'checkout', '--detach');
  cli(good, 1, { pattern: /main branch/ }); git(good.repo, 'checkout', 'main');
  cli({ ...good, bundle: { ...good.bundle, sha256: 'f'.repeat(64) } }, 1, { pattern: /metadata hash/ });
  console.log('PASS: exact committed source and ordered checks, relative package path, hashed evidence, dirty/different/detached/hidden source and wrong anchor refusal');

  const failed = fixture('check-fails', { 'scripts/check-local.mjs': 'console.error("Synthetic check failure"); process.exit(7);\n' });
  const failReport = cli(failed, 1, { pattern: /scripts\/check-local.mjs \(7\)/ });
  assert.equal(failReport.checks.at(-1).exitCode, 7);
  assert.equal(fs.existsSync(path.join(failed.repo, 'work/order.log')), false, 'Later checks must not run after failure');
  const changed = fixture('check-changes-source', { 'scripts/check-local.mjs': "import fs from 'node:fs'; fs.appendFileSync('local-net/console/server.mjs','// changed by synthetic check');\n" });
  cli(changed, 1, { pattern: /clean committed working tree/ });
  const tampered = fixture('check-changes-package', { 'scripts/check-local.mjs': "import fs from 'node:fs'; import path from 'node:path'; fs.appendFileSync(path.join(process.env.FIXTURE_RELEASE,'payload/local-net/console/server.mjs'),'// changed package');\n" });
  cli(tampered, 1, { pattern: /hash or size mismatch/, env: { FIXTURE_RELEASE: tampered.bundle.directory } });
  const badJs = fixture('bad-js', { 'local-net/console/server.mjs': 'export const = ;\n' });
  cli(badJs, 1, { pattern: /Local release check failed: --check/ });
  const badSh = fixture('bad-shell', { 'local-net/deploy/console-restart.sh': '#!/usr/bin/env bash\nif then\n' });
  cli(badSh, 1, { pattern: /Local release check failed: -n/ });
  const crlf = fixture('crlf-shell', { 'local-net/deploy/console-restart.sh': '#!/usr/bin/env bash\r\nexit 0\r\n' });
  cli(crlf, 1, { pattern: /must use LF line endings/ });
  const contract = fixture('empty-contract', { 'local-net/lib/l1-contracts.mjs': 'export const CONTRACTS = {one:{code:"0x"}};\n' });
  cli(contract, 1, { pattern: /Local release check failed: --input-type=module/ });
  const hung = fixture('hung-check', { 'scripts/check-local.mjs': 'setInterval(()=>{},1000);\n' });
  const began = Date.now(); const hungReport = cli(hung, 1, { extra: ['--timeout-ms', '3000'], pattern: /ETIMEDOUT/ });
  assert.equal(hungReport.checks.at(-1).args[0], 'scripts/check-local.mjs');
  assert.ok(Date.now() - began < 7000, 'The actual hung child must respect the shorter overall budget');
  for (const value of ['0', '600001', 'invalid']) cli(good, 1, { extra: ['--timeout-ms', value], pattern: /Validation timeout/ });
  cli(good, 1, { extra: ['--skip-tests'], pattern: /Unknown/ });
  cli(good, 1, { extra: ['--repo', good.repo], pattern: /repeated/ });
  console.log('PASS: failed and timed-out checks, source/package changes, JS/Bash syntax, line endings, contract shape and invalid CLI all prevent acceptance');
  console.log(`PASS: ${checks} actual validation CLI scenarios; synthetic checks test orchestration, not the product`);
} catch (error) { console.error(`FAIL: ${error.message}`); process.exitCode = 1; }
finally { console.log(`Synthetic validation evidence retained: ${scratch}`); }
