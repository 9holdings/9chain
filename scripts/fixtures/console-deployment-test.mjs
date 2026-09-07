// Container-only CLI orchestration with real consoles, file writes and npm ci.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFile, spawnSync } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash, randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { prepareConsoleRelease } from './src/scripts/prepare-console-release.mjs';
import { controlMaintenance } from './src/local-net/deploy/console-maintenance.mjs';
import { operateDeployLock } from './src/local-net/deploy/deploy-lock.mjs';

assert.equal(process.env.A1_ISOLATED_FIXTURE, 'console-deployment'); assert.equal(process.platform, 'linux');
const execute = promisify(execFile), delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const sha = value => createHash('sha256').update(value).digest('hex');
const lab = '/tmp/console-deployment-lab', repo = lab + '/repo', bin = lab + '/bin';
const token = 'synthetic-deployment-operator-token', secret = 'synthetic-excluded-deployment-secret';
fs.mkdirSync(bin, { recursive: true }); fs.cpSync('/inputs/src', repo, { recursive: true });
fs.writeFileSync(repo + '/.gitignore', '/work/\n**/node_modules/\n'); fs.writeFileSync(repo + '/.gitattributes', '* -text\n');
function put(name, value, mode = 0o600) { fs.mkdirSync(path.dirname(name), { recursive: true }); fs.writeFileSync(name, value, { mode }); }
// Acceptance placeholders exercise ordering; full product tests run independently.
for (const name of ['scripts/check-local.mjs', 'scripts/check-console-deployment.mjs', 'scripts/gen-chainid-issued.mjs', 'local-net/console/generation-test.mjs']) {
  put(repo + '/' + name, "import fs from 'node:fs'; fs.mkdirSync('work',{recursive:true}); fs.appendFileSync('work/local-acceptance.log',process.argv[1]+'\\n'); if(process.env.A1_FIXTURE_LOCAL_FAIL==='1') process.exit(7); console.log('Synthetic local acceptance placeholder');\n");
}
for (const name of ['scripts/check-deploy-drift.mjs', 'scripts/check-chain-ledger.mjs']) {
  put(repo + '/' + name, "import fs from 'node:fs'; fs.appendFileSync(process.env.A1_FIXTURE_LOG,JSON.stringify({phase:'public-gate',args:process.argv.slice(1)})+'\\n'); if(process.env.A1_FIXTURE_GATE_FAIL==='1') process.exit(8); console.log('Synthetic public acceptance placeholder');\n");
}
function git(...args) {
  const result = spawnSync('git', ['-c', 'core.hooksPath=' + lab + '/no-hooks', '-c', 'commit.gpgsign=false', '-C', repo, ...args], { encoding: 'utf8', timeout: 10000 });
  assert.equal(result.status, 0, result.stderr); return result.stdout.trim();
}
git('init', '-b', 'main'); git('config', 'user.name', 'Synthetic Deployment'); git('config', 'user.email', 'deployment@example.invalid');
git('add', '--', '.gitignore', '.gitattributes', 'local-net', 'scripts', '9chain-a1-config'); git('commit', '-m', 'Prepare isolated deployment fixture');
const bundle = prepareConsoleRelease(repo);
fs.cpSync('/root/.npm/_cacache', lab + '/npm-cache/_cacache', { recursive: true });
put(bin + '/audit-prelude.txt', String.raw`import auditFs from 'node:fs';
const auditCounts = { entries: 0, opened: 0, closed: 0 };
const auditRead = auditFs.readdirSync.bind(auditFs), auditOpen = auditFs.opendirSync.bind(auditFs);
auditFs.readdirSync = (...args) => { const entries = auditRead(...args); auditCounts.entries += entries.length; return entries; };
auditFs.opendirSync = (...args) => {
  const dir = auditOpen(...args), read = dir.readSync.bind(dir), close = dir.closeSync.bind(dir);
  auditCounts.opened++;
  dir.readSync = () => { const entry = read(); if (entry) auditCounts.entries++; return entry; };
  dir.closeSync = () => { try { return close(); } finally { auditCounts.closed++; } };
  return dir;
};
process.on('exit', () => auditFs.appendFileSync(process.env.A1_FIXTURE_LOG, JSON.stringify({ phase: 'audit-enumeration-counts', ...auditCounts }) + '\n'));
`);
// The stubs have no network fallback and only execute inside this isolated /tmp lab.
put(bin + '/ssh', `#!/usr/bin/env node
import fs from 'node:fs'; import {spawnSync} from 'node:child_process';
const args=process.argv.slice(2), host=args.at(-2), command=args.at(-1); let input=fs.readFileSync(0,'utf8');
if(process.env.A1_ISOLATED_FIXTURE!=='console-deployment'||host!=='fixture.invalid') process.exit(97);
const match=input.match(/const request=JSON.parse\\(Buffer.from\\('([^']+)'/);
let request=match?JSON.parse(Buffer.from(match[1],'base64')):null;
let phase=request?.action==='phase'?request.phase.action:request?.action;
if(!phase) phase=command.includes('--pause-and-wait')?'pause':command.includes('--request')?'lock':'status';
fs.appendFileSync(process.env.A1_FIXTURE_LOG,JSON.stringify({phase,command:phase==='status'?'maintenance':undefined})+'\\n');
const fault=process.env.A1_FIXTURE_FAULT;
if(fault==='audit-enumeration'&&phase==='audit') {
  input = fs.readFileSync('${bin}/audit-prelude.txt', 'utf8') + input;
}
if(fault==='ssh-hang'&&phase==='status') {setInterval(()=>{},1000); await new Promise(()=>{});}
if(fault==='backup-failure'&&phase==='backup') fs.writeFileSync(process.env.A1_FIXTURE_SOURCE+'/9chain-a1-config/creation-journal/unexpected-file','synthetic');
if(fault==='source-drift'&&phase==='install') fs.appendFileSync(process.env.A1_FIXTURE_SOURCE+'/local-net/console/server.mjs','// source drift after backup');
if(fault==='dependency-drift'&&phase==='install') fs.appendFileSync(process.env.A1_FIXTURE_SOURCE+'/../console-deployments/'+request.actor.runId+'/dependencies/node_modules/ethers/package.json',' ');
if(fault==='configuration-drift'&&phase==='dependencies') fs.appendFileSync(process.env.A1_FIXTURE_SOURCE+'/../console.env','\\nA1_MAX_L1=14\\n');
if(fault==='frozen-client-drift'&&phase==='audit') fs.appendFileSync(process.env.A1_FIXTURE_PACKAGE+'/payload/local-net/deploy/console-maintenance.mjs','// source drift before SSH execution');
if(fault==='copy-failure'&&phase==='install') fs.chmodSync(process.env.A1_FIXTURE_SOURCE+'/local-net/lib',0o500);
const result=spawnSync('/bin/bash',['-c',command],{input,encoding:'utf8',env:process.env,timeout:160000,maxBuffer:2<<20});
if(fault==='configuration-after-restart'&&phase==='restart'&&result.status===0) fs.appendFileSync(process.env.A1_FIXTURE_SOURCE+'/../console.env','\\nA1_MAX_L1=14\\n');
if(result.status!==0) fs.appendFileSync(process.env.A1_FIXTURE_LOG,JSON.stringify({phase:'remote-failure',during:phase,status:result.status,stderr:result.stderr,error:result.error?.code})+'\\n');
if(fault==='lost-resume'&&phase==='resume') process.exit(74);
process.stdout.write(result.stdout||''); process.stderr.write(result.stderr||''); process.exit(result.status??96);
`, 0o755);
put(bin + '/scp', `#!/usr/bin/env node
import fs from 'node:fs';
const args=process.argv.slice(2),source=args.at(-2),destination=args.at(-1),prefix='fixture.invalid:';
if(process.env.A1_ISOLATED_FIXTURE!=='console-deployment'||!destination.startsWith(prefix)) process.exit(97);
const target=destination.slice(prefix.length); if(!source.startsWith('${lab}/')||!target.startsWith('${lab}/')) process.exit(98);
fs.appendFileSync(process.env.A1_FIXTURE_LOG,JSON.stringify({phase:'upload',target})+'\\n');
if(['upload-failure','legacy-copy'].includes(process.env.A1_FIXTURE_FAULT)) process.exit(17);
fs.cpSync(source,target,{recursive:true,errorOnExist:true,force:false});
if(process.env.A1_FIXTURE_FAULT==='tampered-upload') fs.appendFileSync(target+'/payload/local-net/lib/console-release.mjs','// changed in transit');
`, 0o755);
put(bin + '/npm', `#!/usr/bin/env node
import fs from 'node:fs'; import {spawnSync} from 'node:child_process';
const args=process.argv.slice(2); fs.appendFileSync(process.env.A1_FIXTURE_LOG,JSON.stringify({phase:'npm',args})+'\\n');
if(process.env.A1_FIXTURE_FAULT==='npm-failure') process.exit(19);
const r=spawnSync('/usr/local/bin/npm',args,{stdio:'inherit',env:process.env}); process.exit(r.status??96);
`, 0o755);
put(bin + '/ss', `#!/bin/sh\nif [ "\$A1_FIXTURE_FAULT" = 'restart-failure' ]; then exit 21; fi\nexec /sbin/ss "\$@"\n`, 0o755);
put(bin + '/setsid', `#!/bin/sh\nif [ "\$A1_FIXTURE_FAULT" = 'wrong-startup' ]; then export A1_MAX_L1=14; fi\nexec /usr/bin/setsid "\$@"\n`, 0o755);
const envBase = { ...process.env, PATH: bin + ':' + process.env.PATH,
  npm_config_cache: lab + '/npm-cache', npm_config_offline: 'true', npm_config_update_notifier: 'false' };
const rpc = createServer(async (req, res) => {
  let body = ''; for await (const part of req) body += part;
  const { id, method } = JSON.parse(body);
  const result = method === 'info.getNetworkID' ? { networkID: req.url.includes('/wrong-network/') ? '999999997' : '999999998' } :
    method === 'info.getNetworkName' ? { networkName: '9chain-a1-g1' } : method === 'info.getNodeVersion' ? { version: '9chaingo/1.14.2' } :
    req.url.includes('/wrong-chain/') ? '0x1' : '0x218711a09';
  res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ jsonrpc: '2.0', id, result }));
});
rpc.listen(18999, '127.0.0.1'); await once(rpc, 'listening');
const legacyApi = createServer((req, res) => { res.writeHead(404, { 'content-type': 'application/json' }); res.end('{"error":"synthetic legacy endpoint"}'); });
legacyApi.listen(19000, '127.0.0.1'); await once(legacyApi, 'listening');
let serial = 0, checks = 0; const fixtures = [];
async function state(item) { return controlMaintenance({ url: 'http://127.0.0.1:' + item.port, token, timeoutMs: 1500 }); }
async function fixture(name, fault = '') {
  const root = lab + '/' + name, source = root + '/src', port = 18100 + serial++;
  fs.cpSync('/inputs/src', source, { recursive: true });
  fs.cpSync('/opt/deployment-fixture/node_modules', source + '/local-net/console/node_modules', { recursive: true });
  fs.appendFileSync(source + '/local-net/console/server.mjs', '\n// Synthetic previous release byte.\n');
  fs.mkdirSync(source + '/9chain-a1-config/creation-journal', { recursive: true });
  const log = root + '/transport.ndjson'; put(log, '');
  const env = { ...envBase, A1_FIXTURE_SOURCE: source, A1_FIXTURE_LOG: log, A1_FIXTURE_FAULT: fault,
    A1_FIXTURE_PACKAGE: bundle.directory,
    PORT: String(port), A1_CONSOLE_TOKEN: token, A1_CONSOLE_HOST: '127.0.0.1', A1_CONSOLE_START_PAUSED: '0',
    NODE_URI: 'http://127.0.0.1:18999' + (['wrong-network', 'wrong-chain'].includes(fault) ? '/' + fault : ''), A1_CLI_KEY: 'PrivateKey-invalid-synthetic-only',
    A1_DE_CHAIN_MO: '1', A1_COMPOSE_FILE: root + '/absent-compose.yml' };
  const names = ['PORT', 'A1_CONSOLE_TOKEN', 'A1_CONSOLE_HOST', 'A1_CONSOLE_START_PAUSED', 'NODE_URI', 'A1_CLI_KEY', 'A1_DE_CHAIN_MO', 'A1_COMPOSE_FILE'];
  put(root + '/console.env', names.map(key => key + "='" + env[key] + "'").join('\n') + '\n# ' + secret + '\n');
  const descriptor = fs.openSync(root + '/console.log', 'a', 0o600);
  const child = spawn(process.execPath, ['local-net/console/server.mjs'], { cwd: source, env, stdio: ['ignore', descriptor, descriptor] }); fs.closeSync(descriptor);
  const item = { name, root, source, port, env, child, log }; fixtures.push(item);
  for (let count = 0; count < 100; count++) {
    try { item.initial = await state(item); return item; } catch { if (child.exitCode !== null) throw new Error('Fixture console exited: ' + fs.readFileSync(root + '/console.log')); await delay(30); }
  }
  throw new Error('Fixture console failed to listen');
}
function phases(item) { return fs.readFileSync(item.log, 'utf8').trim().split('\n').filter(Boolean).map(line => JSON.parse(line)); }
async function cli(item, args = [], expected = 0, env = {}) {
  let result;
  try {
    result = await execute('bash', [repo + '/local-net/deploy/console-deploy.sh', '--release', bundle.directory, '--expected-sha256', bundle.sha256,
      '--host', 'fixture.invalid', '--ssh-key', lab + '/synthetic-unused-key', '--src', item.source, ...args],
    { cwd: repo, env: { ...item.env, ...env }, encoding: 'utf8', timeout: 100000, maxBuffer: 4 << 20 }); result.code = 0;
  } catch (error) { result = error; }
  fs.appendFileSync('/evidence/cli.ndjson', JSON.stringify({ fixture: item.name, args, code: result.code, stdout: result.stdout, stderr: result.stderr }) + '\n');
  assert.equal(Number(result.code), expected, (result.stderr || '') + '\n' + (result.stdout || result.message || ''));
  const report = result.stdout ? JSON.parse(result.stdout) : null;
  if (report?.receipt) assert.equal(sha(fs.readFileSync(report.receipt.path)), report.receipt.sha256);
  assert.equal((result.stdout + result.stderr).includes(token), false); assert.equal((result.stdout + result.stderr).includes(secret), false);
  checks++; return { report, stderr: result.stderr };
}
async function stop(item) {
  const result = spawnSync('/sbin/ss', ['-H', '-ltnp', 'sport = :' + item.port], { encoding: 'utf8' });
  const ids = [...new Set([...result.stdout.matchAll(/pid=([0-9]+)/g)].map(match => Number(match[1])))];
  for (const id of ids) {
    assert.equal(fs.realpathSync('/proc/' + id + '/cwd'), item.source, 'Only this synthetic source listener may stop');
    try { process.kill(id, 'SIGTERM'); } catch (error) { if (error.code !== 'ESRCH') throw error; }
  }
  if (item.child.exitCode === null) item.child.kill('SIGTERM');
  await delay(80);
}
function unchangedCode(item) { assert.equal(fs.readFileSync(item.source + '/local-net/console/server.mjs', 'utf8').endsWith('// Synthetic previous release byte.\n'), true); }
function noPhase(item, phase) { assert.equal(phases(item).some(entry => entry.phase === phase), false, 'Unexpected phase: ' + phase); }
let other;
try {
  other = await fixture('unrelated');
  const plan = await fixture('plan');
  const planned = await cli(plan); assert.equal(planned.report.defaultAction, 'plan'); assert.equal(phases(plan).length, 0); unchangedCode(plan);
  await cli(plan, ['--repo', plan.source], 1); assert.equal(phases(plan).length, 0);
  await cli(plan, ['--apply'], 1, { A1_FIXTURE_LOCAL_FAIL: '1' }); assert.equal(phases(plan).length, 0); await stop(plan);
  console.log('PASS: actual Bash wrapper defaults to a local plan; failed local acceptance starts no SSH or mutation');

  const good = await fixture('good');
  const applied = (await cli(good, ['--apply'])).report;
  assert.equal(applied.outcome, 'paused'); assert.equal((await state(good)).paused, true);
  assert.match(applied.configurationSha256, /^[a-f0-9]{64}$/);
  assert.notEqual(applied.state.instanceId, good.initial.instanceId); assert.equal((await state(other)).instanceId, other.initial.instanceId);
  const order = phases(good).map(entry => entry.phase);
  for (const [first, second] of [['audit', 'lock'], ['pause', 'upload'], ['backup', 'npm'], ['npm', 'install'], ['install', 'restart'], ['restart', 'verify']]) assert.ok(order.indexOf(first) < order.indexOf(second), first + ' must precede ' + second);
  const stage = good.root + '/console-deployments/' + applied.actor.runId;
  assert.equal(fs.existsSync(stage + '/previous-node_modules/ethers/package.json'), true);
  assert.equal(fs.existsSync(good.root + '/deploy-locks/console.lock/holder.json'), true);
  assert.equal(fs.existsSync(good.source + '/9chain-a1-config/console-chains.json'), false, 'No ledger writes');
  assert.equal(fs.existsSync(good.source + '/9chain-a1-config/creation-journal/pending.json'), false, 'No chain creation');
  noPhase(good, 'public-gate'); noPhase(good, 'resume');
  const resumeArgs = ['--resume', '--receipt', applied.receipt.path, '--expected-receipt-sha256', applied.receipt.sha256];
  const rejectedHash = [...resumeArgs]; rejectedHash[rejectedHash.length - 1] = 'f'.repeat(64);
  const before = phases(good).length; await cli(good, rejectedHash, 1); assert.equal(phases(good).length, before);
  const gateFailure = (await cli(good, resumeArgs, 1, { A1_FIXTURE_GATE_FAIL: '1' })).report;
  assert.equal(gateFailure.failedPhase, 'public-drift'); assert.equal((await state(good)).paused, true); noPhase(good, 'resume');
  const installedServer = fs.readFileSync(good.source + '/local-net/console/server.mjs');
  fs.appendFileSync(good.source + '/local-net/console/server.mjs', '// unexpected installed change');
  const changed = (await cli(good, resumeArgs, 1)).report;
  assert.equal(changed.failedPhase, 'verify-installed'); noPhase(good, 'resume');
  fs.writeFileSync(good.source + '/local-net/console/server.mjs', installedServer);
  const resumed = (await cli(good, resumeArgs)).report;
  assert.equal(resumed.outcome, 'resumed'); assert.equal((await state(good)).paused, false);
  assert.equal(fs.existsSync(good.root + '/deploy-locks/console.lock'), false);
  assert.equal(phases(good).filter(entry => entry.phase === 'resume').length, 1);
  const gateArgs = phases(good).filter(entry => entry.phase === 'public-gate').map(entry => entry.args);
  assert.equal(gateArgs.some(args => args.includes('--ssh-key') && !args.includes('--key')), true);
  assert.equal((await state(other)).instanceId, other.initial.instanceId);
  await stop(good);
  console.log('PASS: real frozen upload, backup, offline npm ci, source/dependency replacement and targeted paused restart; separate gated resume releases only its lock');

  for (const [name, fault, expectedPhase] of [
    ['orphan', '', 'source-audit'], ['audit-enumeration', 'audit-enumeration', 'source-audit'],
    ['nonselected-drift', '', 'source-audit'], ['linked-source', '', 'source-audit'],
    ['unauthorized', '', 'maintenance-status'], ['legacy-api', '', 'maintenance-status'], ['already-paused', '', 'maintenance-status'],
    ['lock-held', '', 'lock-acquire'], ['upload-failure', 'upload-failure', 'upload'],
    ['tampered-upload', 'tampered-upload', 'verify-package'], ['backup-failure', 'backup-failure', 'backup'],
    ['npm-failure', 'npm-failure', 'dependencies'], ['source-drift', 'source-drift', 'install'], ['dependency-drift', 'dependency-drift', 'install'],
    ['copy-failure', 'copy-failure', 'install'], ['restart-failure', 'restart-failure', 'restart'],
    ['configuration-drift', 'configuration-drift', 'dependencies'], ['configuration-after-restart', 'configuration-after-restart', 'verify-installed'],
    ['wrong-startup', 'wrong-startup', 'restart'], ['wrong-network', 'wrong-network', 'restart'], ['wrong-chain', 'wrong-chain', 'restart'],
    ['ssh-hang', 'ssh-hang', 'maintenance-status'],
  ]) {
    const item = await fixture(name, fault);
    if (name === 'orphan') put(item.source + '/local-net/deploy/unexpected-helper.sh', '# synthetic orphan\n');
    if (name === 'audit-enumeration') {
      for (let index = 0; index < 20020; index++) put(item.source + '/local-net/deploy/audit-entry-' + index + '.txt', 'synthetic');
    }
    if (name === 'nonselected-drift') fs.appendFileSync(item.source + '/local-net/faucet/server.mjs', '// different service version');
    if (name === 'linked-source') { fs.renameSync(item.source + '/local-net/faucet/server.mjs', item.root + '/linked-target.mjs'); fs.symlinkSync(item.root + '/linked-target.mjs', item.source + '/local-net/faucet/server.mjs'); }
    if (name === 'unauthorized') fs.writeFileSync(item.root + '/console.env', fs.readFileSync(item.root + '/console.env', 'utf8').replace(token, 'synthetic-wrong-operator-token'));
    if (name === 'legacy-api') fs.writeFileSync(item.root + '/console.env', fs.readFileSync(item.root + '/console.env', 'utf8').replace("PORT='" + item.port + "'", "PORT='19000'"));
    if (name === 'already-paused') await controlMaintenance({ action: 'pause-and-wait', url: 'http://127.0.0.1:' + item.port, token, timeoutMs: 1500 });
    if (name === 'lock-held') operateDeployLock({ action: 'acquire', surface: 'console', sourceDirectory: item.source,
      actor: { runId: randomUUID(), host: 'synthetic-other-host', user: 'fixture', branch: 'main', commit: bundle.source.commit } });
    const result = (await cli(item, ['--apply'], 1)).report;
    assert.equal(result.failedPhase, expectedPhase, result.failure); noPhase(item, 'resume');
    if (name === 'audit-enumeration') {
      const counts = phases(item).filter(entry => entry.phase === 'audit-enumeration-counts');
      assert.equal(counts.length, 1);
      const refused = phases(item).find(entry => entry.phase === 'remote-failure' && entry.during === 'audit');
      assert.match(refused?.stderr ?? '', /Remote source directory scan exceeds 20000 entries/);
      assert.equal(counts[0].entries, 20001, 'Audit must stop reading at its global entry limit');
      assert.ok(counts[0].opened > 0, 'Audit must enumerate through bounded directory readers');
      assert.equal(counts[0].closed, counts[0].opened, 'All audit directory readers close on refusal');
      assert.equal(fs.readdirSync(item.source + '/local-net/deploy').filter(name => name.startsWith('audit-entry-')).length, 20020);
      assert.equal(phases(item).some(entry => ['lock', 'pause', 'stage', 'upload', 'backup', 'install', 'restart', 'resume'].includes(entry.phase)), false);
    }
    if (['source-audit', 'maintenance-status'].includes(expectedPhase)) { noPhase(item, 'lock'); noPhase(item, 'upload'); assert.equal((await state(item)).paused, name === 'already-paused'); }
    else if (expectedPhase === 'lock-acquire') { noPhase(item, 'pause'); noPhase(item, 'upload'); assert.equal((await state(item)).paused, false); }
    else { assert.equal((await state(item)).paused, true); assert.equal(fs.existsSync(item.root + '/deploy-locks/console.lock/holder.json'), true); }
    if (!['install', 'restart', 'verify-installed'].includes(expectedPhase)) unchangedCode(item);
    if (!['restart', 'verify-installed'].includes(expectedPhase)) noPhase(item, 'restart');
    const failure = phases(item).find(entry => entry.phase === 'remote-failure');
    if (name.startsWith('configuration-')) assert.match(failure.stderr, /configuration changed since backup/);
    if (name === 'wrong-startup') assert.match(failure.stderr, /different startup configuration/);
    if (['wrong-network', 'wrong-chain'].includes(name)) assert.match(failure.stderr, /readiness returned HTTP 503/);
    assert.equal((await state(other)).instanceId, other.initial.instanceId);
    await stop(item); console.log('PASS: ' + name + ' stops at ' + expectedPhase + ' with no automatic resume');
  }
  const frozen = await fixture('frozen-client-drift', 'frozen-client-drift');
  const frozenPath = bundle.directory + '/payload/local-net/deploy/console-maintenance.mjs';
  const frozenBytes = fs.readFileSync(frozenPath);
  const freezeFailure = (await cli(frozen, ['--apply'], 1)).report;
  assert.equal(freezeFailure.failedPhase, 'maintenance-status'); assert.match(freezeFailure.failure, /Frozen remote executable changed/);
  noPhase(frozen, 'status'); noPhase(frozen, 'lock'); unchangedCode(frozen);
  fs.writeFileSync(frozenPath, frozenBytes); await stop(frozen);
  console.log('PASS: altered local frozen client is rejected before its bytes can execute over SSH');
  const lost = await fixture('lost-resume', 'lost-resume');
  const pending = (await cli(lost, ['--apply'])).report;
  const resume = ['--resume', '--receipt', pending.receipt.path, '--expected-receipt-sha256', pending.receipt.sha256];
  const uncertain = (await cli(lost, resume, 1)).report;
  assert.equal(uncertain.failedPhase, 'resume'); assert.equal((await state(lost)).paused, false);
  await cli(lost, resume, 1);
  assert.equal(phases(lost).filter(entry => entry.phase === 'resume').length, 1, 'An uncertain resume must not be repeated');
  await stop(lost);
  console.log('PASS: actual resume followed by a lost SSH response is reported uncertain and never replayed');
  console.log('PASS: ' + checks + ' actual deployment CLI scenarios; product acceptance placeholders and public gates are synthetic, consoles/files/npm/restart are real');
} catch (error) { console.error('FAIL: ' + error.stack); process.exitCode = 1; }
finally {
  for (const item of fixtures) fs.copyFileSync(item.log, '/evidence/' + item.name + '-transport.ndjson');
  for (const item of fixtures) fs.copyFileSync(item.root + '/console.log', '/evidence/' + item.name + '-console.log');
  for (const item of fixtures) if (fs.existsSync(item.root + '/console-chay.log')) fs.copyFileSync(item.root + '/console-chay.log', '/evidence/' + item.name + '-replacement.log');
  if (fs.existsSync(repo + '/work/console-deployments')) fs.cpSync(repo + '/work/console-deployments', '/evidence/deployments', { recursive: true });
  for (const item of fixtures) try { await stop(item); } catch (error) { console.error('FAIL: fixture teardown: ' + error.message); process.exitCode = 1; }
  rpc.closeAllConnections(); await new Promise(resolve => rpc.close(resolve));
  legacyApi.closeAllConnections(); await new Promise(resolve => legacyApi.close(resolve));
  console.log('Synthetic deployment evidence retained inside container: ' + lab);
}
