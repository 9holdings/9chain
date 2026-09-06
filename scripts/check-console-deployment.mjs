#!/usr/bin/env node
// Actual deployment CLI and Linux processes, with SSH/SCP confined to one container.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const root = fileURLToPath(new URL('../', import.meta.url));
if (process.argv.length !== 2) { console.error('Usage: node scripts/check-console-deployment.mjs'); process.exit(2); }
fs.mkdirSync(path.join(root, 'work'), { recursive: true });
const scratch = fs.mkdtempSync(path.join(root, 'work/console-deployment-'));
const inputs = path.join(scratch, 'inputs'), build = path.join(scratch, 'build');
fs.mkdirSync(inputs); fs.mkdirSync(build);
const evidence = path.join(scratch, 'evidence'); fs.mkdirSync(evidence);
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'local-net/deploy/manifest-deploy.json')));
const files = new Set(Object.values(manifest.groups).flatMap(group => group.files));
for (const name of ['local-net/deploy/manifest-deploy.json', 'local-net/deploy/console-deploy.sh', 'local-net/deploy/deploy-lock.sh', 'local-net/deploy/server-env.sh',
  'scripts/deploy-console-release.mjs', 'scripts/console-deploy-transport.mjs', 'scripts/prepare-console-release.mjs', 'scripts/validate-console-release.mjs',
  'scripts/check-worktree-ownership.mjs', 'scripts/worktree-ownership.json', 'local-net/lib/server.mjs', 'local-net/deploy/check-html.mjs']) files.add(name);
for (const name of files) {
  const source = path.join(root, name), target = path.join(inputs, 'src', name);
  if (!fs.lstatSync(source).isFile() || fs.realpathSync(source) !== path.resolve(source)) throw new Error('Fixture inputs must be regular source files');
  fs.mkdirSync(path.dirname(target), { recursive: true }); fs.copyFileSync(source, target);
}
fs.copyFileSync(path.join(root, 'scripts/fixtures/console-deployment-test.mjs'), path.join(inputs, 'test.mjs'));
for (const name of ['package.json', 'package-lock.json']) fs.copyFileSync(path.join(root, 'local-net/console', name), path.join(build, name));
fs.writeFileSync(path.join(build, 'Dockerfile'), 'FROM node:24-alpine\nRUN timeout 90 apk add --no-cache bash iproute2 util-linux coreutils procps git\nWORKDIR /opt/deployment-fixture\nCOPY package.json package-lock.json ./\nRUN timeout 90 npm ci --ignore-scripts --no-audit --no-fund\n');
const run = promisify(execFile), transcript = [];
async function command(program, args, timeout = 30000) {
  try {
    const result = await run(program, args, { cwd: root, timeout, encoding: 'utf8', maxBuffer: 8 << 20, windowsHide: true });
    transcript.push({ program, args, ...result }); return result.stdout;
  } catch (error) { transcript.push({ program, args, code: error.code, stdout: error.stdout, stderr: error.stderr }); throw error; }
}
const name = 'a1-deployment-' + path.basename(scratch).toLowerCase(); let created = false;
try {
  await command('docker', ['build', '-t', '9chain-a1/console-deployment-fixture:node24', build], 120000);
  await command('docker', ['create', '--name', name, '--network', 'none', '--read-only', '--cap-drop=ALL', '--security-opt', 'no-new-privileges:true',
    '--memory', '2g', '--cpus', '2', '--pids-limit', '150', '--tmpfs', '/tmp:rw,exec,nosuid,size=1g',
    '--mount', `type=bind,source=${inputs},target=/inputs,readonly`, '-e', 'A1_ISOLATED_FIXTURE=console-deployment',
    '--mount', `type=bind,source=${evidence},target=/evidence`,
    '9chain-a1/console-deployment-fixture:node24', 'timeout', '180', 'node', '/inputs/test.mjs']);
  created = true; console.log('Running actual isolated deployment CLI in ' + name);
  console.log((await command('docker', ['start', '-a', name], 195000)).trim());
  const state = JSON.parse(await command('docker', ['inspect', '--format', '{{json .State}}', name]));
  if (state.ExitCode !== 0 || state.OOMKilled) throw new Error('Deployment fixture did not exit cleanly');
} catch (error) {
  if (error.stdout) console.error(error.stdout.trim()); if (error.stderr) console.error(error.stderr.trim());
  console.error('FAIL: ' + error.message); process.exitCode = 1;
} finally {
  if (created) try { await command('docker', ['stop', '--time', '2', name], 10000); } catch { console.error('FAIL: fixture stop was not confirmed'); process.exitCode = 1; }
  fs.writeFileSync(path.join(scratch, 'commands.json'), JSON.stringify(transcript, null, 2));
  console.log('Fixture evidence retained: ' + scratch);
}
