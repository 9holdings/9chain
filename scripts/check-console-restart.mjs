#!/usr/bin/env node
// Two real consoles in one disposable, network-disabled Linux container.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { consoleReleaseFiles } from './prepare-console-release.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
if (args.length && !(args.length === 1 && args[0] === '--negative-legacy')) {
  console.error('Usage: node scripts/check-console-restart.mjs [--negative-legacy]'); process.exit(2);
}
const negative = args.length === 1;
const run = promisify(execFile);
fs.mkdirSync(path.join(root, 'work'), { recursive: true });
const scratch = fs.mkdtempSync(path.join(root, 'work/console-restart-'));
const inputs = path.join(scratch, 'inputs');
const build = path.join(scratch, 'build');
fs.mkdirSync(build); fs.mkdirSync(inputs);
const name = `a1-restart-${path.basename(scratch).toLowerCase()}`;
const image = '9chain-a1/console-restart-fixture:node24';
const transcript = [];
async function command(program, argv, timeout = 30_000) {
  try {
    const result = await run(program, argv, { cwd: root, encoding: 'utf8', timeout,
      windowsHide: true, maxBuffer: 4 << 20 });
    transcript.push({ program, argv, ...result });
    return result.stdout;
  } catch (error) {
    transcript.push({ program, argv, code: error.code, stdout: error.stdout, stderr: error.stderr });
    throw error;
  }
}
let created = false;
try {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'local-net/deploy/manifest-deploy.json')));
  // Copy only the release inventory, never the repository root or operational state.
  for (const relative of consoleReleaseFiles(manifest)) {
    const source = path.join(root, relative);
    if (!fs.lstatSync(source).isFile() || fs.realpathSync(source) !== path.resolve(source)) {
      throw new Error(`Fixture source must be a regular file: ${relative}`);
    }
    const destination = path.join(inputs, 'src', relative);
    fs.mkdirSync(path.dirname(destination), { recursive: true }); fs.copyFileSync(source, destination);
  }
  fs.copyFileSync(path.join(root, 'scripts/fixtures/console-restart-test.mjs'), path.join(inputs, 'test.mjs'));
  for (const file of ['package.json', 'package-lock.json']) {
    fs.copyFileSync(path.join(root, 'local-net/console', file), path.join(build, file));
  }
  fs.writeFileSync(path.join(build, 'Dockerfile'), [
    'FROM node:24-alpine',
    'RUN timeout 90 apk add --no-cache bash iproute2 util-linux coreutils procps',
    'WORKDIR /opt/fixture',
    'COPY package.json package-lock.json ./',
    'RUN timeout 90 npm ci --ignore-scripts --no-audit --no-fund',
    '',
  ].join('\n'));
  if (negative) {
    const legacy = await command('git', ['show', '34da214:local-net/deploy/console-restart.sh']);
    fs.writeFileSync(path.join(inputs, 'src/local-net/deploy/console-restart.sh'), legacy.replace(/\r\n/g, '\n'));
  } else {
    const script = path.join(inputs, 'src/local-net/deploy/console-restart.sh');
    fs.writeFileSync(script, fs.readFileSync(script, 'utf8').replace(/\r\n/g, '\n'));
  }
  await command('docker', ['image', 'inspect', 'node:24-alpine']);
  await command('docker', ['build', '--network=default', '-t', image, build], 240_000);
  await command('docker', ['create', '--name', name, '--network', 'none', '--read-only',
    '--cap-drop=ALL', '--security-opt', 'no-new-privileges:true', '--memory', '512m', '--cpus', '1',
    '--pids-limit', '100', '--tmpfs', '/tmp:rw,nosuid,size=128m',
    '--mount', `type=bind,source=${inputs},target=/inputs,readonly`,
    '-e', 'A1_ISOLATED_FIXTURE=console-restart', '-e', `A1_NEGATIVE_LEGACY=${negative ? '1' : '0'}`,
    image, 'timeout', '120', 'node', '/inputs/test.mjs']);
  created = true;
  console.log(`Running ${negative ? 'legacy negative control' : 'targeted restart'} in ${name}`);
  const output = await command('docker', ['start', '-a', name], 130_000);
  console.log(output.trim());
  const state = JSON.parse(await command('docker', ['inspect', '--format', '{{json .State}}', name]));
  if (state.ExitCode !== 0 || state.OOMKilled) throw new Error(`Fixture exited ${state.ExitCode}, OOM=${state.OOMKilled}`);
} catch (error) {
  // Only synthetic fixture output is recorded; production keys are never inputs.
  if (error.stdout) console.error(error.stdout.trim());
  if (error.stderr) console.error(error.stderr.trim());
  console.error(`FAIL: ${error.message}`); process.exitCode = 1;
} finally {
  if (created) {
    try { await command('docker', ['stop', '--time', '2', name], 10_000); }
    catch { console.error(`FAIL: inspect fixture container ${name}; stop was not confirmed`); process.exitCode = 1; }
  }
  fs.writeFileSync(path.join(scratch, 'commands.json'), JSON.stringify(transcript, null, 2));
  console.log(`Fixture evidence retained: ${scratch}`);
}
