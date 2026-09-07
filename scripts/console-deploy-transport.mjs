// Bounded SSH transport. Credentials stay in the existing server environment.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { consoleReleaseSha as sha, verifyConsoleRelease, readConsoleSourceBytes } from '../local-net/lib/console-release.mjs';

const encode = value => Buffer.from(JSON.stringify(value)).toString('base64');
const quote = value => "'" + value.replaceAll("'", "'\\''") + "'";
function safeCoordinates({ host, key, sourceDirectory }) {
  if (typeof host !== 'string' || !/^(?:[A-Za-z0-9_.-]+@)?[A-Za-z0-9][A-Za-z0-9.-]*$/.test(host) || host.length > 253) throw new Error('Invalid SSH host');
  if (typeof key !== 'string' || !path.isAbsolute(key) || /[\r\n\0]/.test(key)) throw new Error('SSH key must be an absolute path');
  if (typeof sourceDirectory !== 'string' || !/^(?:~\/|\/)[A-Za-z0-9_./-]+\/src$/.test(sourceDirectory) ||
      sourceDirectory.includes('//') || sourceDirectory.split('/').some(part => ['.', '..'].includes(part))) throw new Error('Remote source must be an explicit safe absolute or ~/ path ending in /src');
}

// This function is serialized with a fixed built-in-only prelude, not evaluated
// from remote output. It reads file names/hashes, never unknown file contents.
async function remoteBootstrap(request) {
  const source = request.sourceDirectory.startsWith('~/') ? path.join(os.homedir(), request.sourceDirectory.slice(2)) : request.sourceDirectory;
  const plain = name => {
    const stat = fs.lstatSync(name);
    if (!stat.isDirectory() || stat.isSymbolicLink() || fs.realpathSync(name) !== path.resolve(name)) throw new Error('Remote source/staging paths must be real directories');
  };
  const flush = name => { const fd = fs.openSync(name, 'r'); try { fs.fsyncSync(fd); } finally { fs.closeSync(fd); } };
  const stat = name => { try { return fs.lstatSync(name); } catch (error) { if (error.code === 'ENOENT') return null; throw error; } };
  plain(source); const parent = path.dirname(source); plain(parent);
  if (request.action === 'audit') {
    const selected = new Set(request.selected), tracked = new Set(request.tracked);
    const declared = new Set(request.files.map(file => file.path));
    const ignored = name => request.ignore.some(rule => new RegExp(rule.pattern).test(name));
    const blocked = [], observations = [], knownExtra = [], outsideScope = [];
    for (const entry of request.files) {
      const target = path.join(source, entry.path), info = stat(target);
      let hash = null;
      if (info) {
        if (!info.isFile() || info.isSymbolicLink() || info.size > 64 * 1024 * 1024 || fs.realpathSync(target) !== path.resolve(target)) throw new Error('Remote manifest source is linked, oversized or not regular');
        hash = createHash('sha256').update(fs.readFileSync(target)).digest('hex');
      }
      observations.push({ path: entry.path, sha256: hash, bytes: info?.size ?? null });
      if (hash !== entry.sha256 && (request.exact || !selected.has(entry.path))) blocked.push({ path: entry.path, reason: hash ? 'source differs' : 'source missing' });
    }
    const directories = [...new Set(request.files.map(entry => path.posix.dirname(entry.path)))];
    let scannedEntries = 0;
    for (const relative of directories) {
      const target = path.join(source, relative); if (!stat(target)) continue; plain(target);
      const directory = fs.opendirSync(target, { bufferSize: 1 });
      try {
        let entry;
        while ((entry = directory.readSync()) !== null) {
          if (++scannedEntries > 20000) throw new Error('Remote source directory scan exceeds 20000 entries');
          const name = relative + '/' + entry.name;
          if (ignored(name) || declared.has(name)) continue;
          if (entry.isSymbolicLink()) { blocked.push({ path: name, reason: 'unexpected link' }); continue; }
          if (entry.isDirectory()) continue;
          if (!entry.isFile()) { blocked.push({ path: name, reason: 'unexpected file type' }); continue; }
          if (tracked.has(name)) { outsideScope.push(name); continue; }
          const rule = request.knownExtra.find(rule => new RegExp(rule.pattern).test(name));
          if (rule && typeof rule.reason === 'string' && rule.reason.trim()) knownExtra.push(name);
          else blocked.push({ path: name, reason: 'undeclared orphan' });
        }
      } finally { directory.closeSync(); }
    }
    return { sourceDirectory: source, observations, blocked, knownExtra, outsideScope, scannedEntries,
      scope: 'Direct files in manifest-derived directories, with declared exclusions; not a whole-server audit.' };
  }
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(request.actor?.runId ?? '')) throw new Error('A staging invocation UUID is required');
  const stages = path.join(parent, 'console-deployments'), stage = path.join(stages, request.actor.runId);
  if (request.action === 'stage') {
    if (!stat(stages)) { fs.mkdirSync(stages, { mode: 0o700 }); flush(parent); }
    plain(stages); fs.mkdirSync(stage, { mode: 0o700 }); flush(stage); flush(stages);
    return { stage, sourceDirectory: source };
  }
  plain(stages); plain(stage);
  const release = path.join(stage, 'release'); plain(release);
  const library = path.join(release, 'payload/local-net/lib/console-release.mjs');
  const info = fs.lstatSync(library);
  if (!info.isFile() || info.isSymbolicLink() || info.size > 64 * 1024 * 1024 || fs.realpathSync(library) !== path.resolve(library)) throw new Error('Staged release verifier must be a regular file without linked parents');
  if (createHash('sha256').update(fs.readFileSync(library)).digest('hex') !== request.verifierSha256) throw new Error('Staged verifier differs from its independently supplied hash');
  const { verifyConsoleRelease } = await import(pathToFileURL(library).href);
  const verified = verifyConsoleRelease(release, request.releaseSha256);
  if (request.action === 'verify-package') return verified;
  if (request.action !== 'phase') throw new Error('Unknown remote release operation');
  const result = spawnSync(process.execPath, [path.join(release, 'payload/local-net/deploy/console-install.mjs'), '--request', Buffer.from(JSON.stringify({ ...request.phase, actor: request.actor, sourceDirectory: source, releaseSha256: request.releaseSha256 })).toString('base64')],
    { cwd: source, env: process.env, encoding: 'utf8', timeout: 150000, maxBuffer: 1024 * 1024 });
  if (result.status !== 0 || result.signal || result.error) {
    // Only our bounded helper's fixed diagnostic is eligible for propagation.
    const detail = (result.stderr || '').split('\n').find(line => line.startsWith('FAIL: '));
    throw new Error(detail?.slice(6, 506) || 'Remote installation phase did not complete');
  }
  return JSON.parse(result.stdout);
}

export function consoleDeployTransport({ root, bundle, host, key, sourceDirectory }) {
  safeCoordinates({ host, key, sourceDirectory });
  verifyConsoleRelease(bundle.directory, bundle.sha256);
  const metadata = JSON.parse(fs.readFileSync(path.join(bundle.directory, 'release.json')));
  function frozen(name) {
    const expected = metadata.files.find(file => file.path === name);
    if (!expected) throw new Error('Remote executable is absent from the frozen inventory');
    const bytes = readConsoleSourceBytes(path.join(bundle.directory, 'payload'), name);
    if (bytes.length !== expected.bytes || sha(bytes) !== expected.sha256) throw new Error('Frozen remote executable changed after validation');
    return bytes;
  }
  const verifier = metadata.files.find(file => file.path === 'local-net/lib/console-release.mjs');
  if (!verifier || !metadata.files.some(file => file.path === 'local-net/deploy/console-install.mjs')) throw new Error('Release must include the shared verifier and installation helper');
  const manifest = JSON.parse(fs.readFileSync(path.join(bundle.directory, 'payload/local-net/deploy/manifest-deploy.json')));
  const shellEnvironment = sourceDirectory.startsWith('~/') ? '"$HOME"/' + quote(sourceDirectory.slice(2) + '/../console.env') : quote(sourceDirectory + '/../console.env');
  function run(label, remoteCommand, input, timeout = 30000) {
    const result = spawnSync('ssh', ['-T', '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=10', '-o', 'ServerAliveInterval=5', '-o', 'ServerAliveCountMax=2', '-i', key, host, remoteCommand],
      { input, encoding: 'utf8', timeout, maxBuffer: 2 * 1024 * 1024, windowsHide: true });
    if (result.status !== 0 || result.signal || result.error) {
      const safeDetail = (result.stderr || '').match(/HTTP [0-9]{3}/)?.[0];
      throw new Error(`Remote ${label} failed (${result.error?.code || result.signal || result.status}${safeDetail ? ', ' + safeDetail : ''}); preserve state and do not retry mutations automatically`);
    }
    try { return JSON.parse(result.stdout); } catch { throw new Error(`Remote ${label} returned invalid JSON; preserve state`); }
  }
  function bootstrap(request, needsEnvironment = false) {
    const input = "import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import {createHash} from 'node:crypto'; import {pathToFileURL} from 'node:url'; import {spawnSync} from 'node:child_process';\n" +
      `const request=JSON.parse(Buffer.from('${encode({ ...request, sourceDirectory })}','base64').toString('utf8'));\n` +
      `try { console.log(JSON.stringify(await (${remoteBootstrap.toString()})(request))); } catch(error) { console.error('FAIL: '+error.message); process.exitCode=1; }\n`;
    const command = needsEnvironment ? `bash -c ${quote('set -e; set -a; . ' + shellEnvironment + ' >/dev/null 2>&1; set +a; exec node --input-type=module -')}` : 'node --input-type=module -';
    return run(request.action, command, input, needsEnvironment ? 165000 : 30000);
  }
  return {
    audit(exact = false) {
      const files = new Map();
      for (const group of Object.values(manifest.groups)) for (const name of group.files) {
        if (manifest.ignore?.some(rule => new RegExp(rule.pattern).test(name))) continue;
        files.set(name, { path: name, sha256: sha(fs.readFileSync(path.join(root, name))) });
      }
      // The manifest itself is also replaced and verified by this release.
      for (const file of metadata.files) files.set(file.path, { path: file.path, sha256: file.sha256 });
      const tracked = execFileSync('git', ['-C', root, 'ls-files', '-z'], { encoding: 'utf8', timeout: 10000, maxBuffer: 4 << 20, windowsHide: true }).split('\0').filter(Boolean);
      const result = bootstrap({ action: 'audit', files: [...files.values()], selected: metadata.files.map(file => file.path),
        tracked, knownExtra: manifest.knownExtra ?? [], ignore: manifest.ignore ?? [], exact });
      if (!Array.isArray(result.blocked) || !Array.isArray(result.observations) || result.observations.length !== files.size) throw new Error('Remote source audit is incomplete');
      if (result.blocked.length) throw new Error('Remote source audit blocks deployment: ' + result.blocked.map(item => item.path + ' (' + item.reason + ')').join(', '));
      return result;
    },
    maintenance(action, state = {}) {
      const flags = { status: [], 'pause-and-wait': ['--pause-and-wait'], 'assert-paused': ['--assert-paused'] }[action];
      if (!flags) throw new Error('Unknown transport maintenance action');
      for (const [key, flag] of [['instanceId', '--instance-id'], ['maintenanceId', '--maintenance-id']]) if (state[key]) flags.push(flag, state[key]);
      flags.push('--timeout-ms', action === 'pause-and-wait' ? '600000' : '5000');
      const command = 'set -e; set -a; . ' + shellEnvironment + ' >/dev/null 2>&1; set +a; exec node --input-type=module - ' + flags.map(quote).join(' ');
      return run('maintenance ' + action, 'bash -c ' + quote(command), frozen('local-net/deploy/console-maintenance.mjs'),
        action === 'pause-and-wait' ? 615000 : 15000);
    },
    lock(action, actor) {
      return run('lock ' + action, 'node --input-type=module - --request ' + quote(encode({ action, actor, sourceDirectory, surface: 'console' })),
        frozen('local-net/deploy/deploy-lock.mjs'));
    },
    stage(actor) { return bootstrap({ action: 'stage', actor }); },
    upload(stage) {
      verifyConsoleRelease(bundle.directory, bundle.sha256);
      if (!/^\/[A-Za-z0-9_./-]+$/.test(stage) || stage.split('/').some(part => part === '..')) throw new Error('Remote staging path is unsafe for SCP');
      const result = spawnSync('scp', ['-q', '-r', '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=10', '-i', key, bundle.directory, host + ':' + stage + '/release'],
        { encoding: 'utf8', timeout: 120000, maxBuffer: 1024 * 1024, windowsHide: true });
      if (result.status !== 0 || result.signal || result.error) throw new Error('Frozen package upload failed; retain the lock and partial stage');
      return { uploaded: true };
    },
    verifyPackage(actor) { return bootstrap({ action: 'verify-package', actor, releaseSha256: bundle.sha256, verifierSha256: verifier.sha256 }); },
    phase(actor, phase) { return bootstrap({ action: 'phase', actor, releaseSha256: bundle.sha256, verifierSha256: verifier.sha256, phase }, true); },
  };
}
