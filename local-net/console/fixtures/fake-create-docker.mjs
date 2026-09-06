// Test-only preload. No command is ever forwarded to the real Docker executable.
import childProcess from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';
import { promisify } from 'node:util';
import { appendFileSync, readFileSync } from 'node:fs';
import path from 'node:path';

if (!path.basename(process.cwd()).startsWith('create-rpc-')) {
  throw new Error('The Docker fixture requires an isolated create-rpc scratch directory');
}
const record = action => appendFileSync('fake-docker.log', action + '\n');
function output(file, args) {
  if (file !== 'docker') throw new Error('Unexpected executable in the Docker fixture');
  if (args.includes('l1') && args.includes('create')) {
    if (process.env.A1_TEST_REQUIRE_JOURNAL === '1') {
      const pending = JSON.parse(readFileSync('9chain-a1-config/creation-journal/pending.json', 'utf8'));
      if (pending.phase !== 'submitting') throw new Error('Journal must record intent before CLI submission');
    }
    record('create');
    if (process.env.A1_TEST_CREATE_FAILURE === '1') throw new Error('Synthetic lost CLI response after submission');
    return 'SUBNET_ID=TestSubnet111\nBLOCKCHAIN_ID=TestBlockchain111\n';
  }
  if (args.includes('config') && args.includes('--services')) {
    record('services');
    return 'test-node\n';
  }
  if (args.includes('up')) { record('restart'); return ''; }
  if (args.includes('curl')) {
    const request = JSON.parse(args[args.indexOf('--data') + 1]);
    if (request.method === 'health.health') {
      record('health');
      return JSON.stringify({ jsonrpc: '2.0', id: 1, result: { checks: { P: {}, X: {}, C: {} } } });
    }
  }
  throw new Error('Unexpected Docker command: the test must model it explicitly');
}
function fakeExecFile(file, args, options, callback) {
  try { callback(null, output(file, args), ''); } catch (error) { callback(error); }
}
fakeExecFile[promisify.custom] = async (file, args) => {
  const stdout = output(file, args);
  if (args.includes('l1') && args.includes('create') && process.env.A1_TEST_CREATE_PAUSE === '1') {
    // Intent and the synthetic submission are recorded, but the CLI never returns.
    await new Promise(() => {});
  }
  return { stdout, stderr: '' };
};
childProcess.execFile = fakeExecFile;
syncBuiltinESMExports();
