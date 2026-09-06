// Test-only preload. No command is ever forwarded to the real Docker executable.
import childProcess from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';
import { promisify } from 'node:util';
import { appendFileSync } from 'node:fs';
import path from 'node:path';

if (!path.basename(process.cwd()).startsWith('create-rpc-')) {
  throw new Error('The Docker fixture requires an isolated create-rpc scratch directory');
}
const record = action => appendFileSync('fake-docker.log', action + '\n');
function output(file, args) {
  if (file !== 'docker') throw new Error('Unexpected executable in the Docker fixture');
  if (args.includes('l1') && args.includes('create')) {
    record('create');
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
fakeExecFile[promisify.custom] = async (file, args) => ({ stdout: output(file, args), stderr: '' });
childProcess.execFile = fakeExecFile;
syncBuiltinESMExports();
