#!/usr/bin/env node
// Exercise Docker's ignore implementation with synthetic files, never real keys.
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const work = path.join(root, 'work');
mkdirSync(work, { recursive: true });
const scratch = mkdtempSync(path.join(work, 'node-context-'));
const context = path.join(scratch, 'context');
const put = (name, content) => {
  const dest = path.join(context, name);
  mkdirSync(path.dirname(dest), { recursive: true });
  writeFileSync(dest, content);
};
const required = ['scripts/rebrand.sh', 'upstream/avalanchego/go.mod',
  'upstream/avalanchego/graft/subnet-evm/plugin/main.go'];
const forbidden = ['.env', 'local-net/net-synthetic/keys.txt',
  'local-net/deploy/console.env', '9chain-a1-config/console-chains.json',
  'web/synthetic.txt', 'node_modules/synthetic.txt', 'scripts/unrelated.sh',
  'scripts/nested/unrelated.sh', 'upstream/unrelated/go.mod',
  'upstream/avalanchego/.git/config', 'upstream/avalanchego/build/avalanchego'];
for (const name of [...required, ...forbidden]) put(name, 'synthetic non-secret fixture\n');
put('local-net/Dockerfile', 'FROM scratch\nCOPY . /\n');
const policy = readFileSync(path.join(root, 'local-net/Dockerfile.dockerignore'), 'utf8');

function probe(label, ignore) {
  put('local-net/Dockerfile.dockerignore', ignore);
  const output = path.join(scratch, label);
  const result = spawnSync('docker', ['build', '--progress=plain', '-f',
    path.join(context, 'local-net/Dockerfile'), '--output', `type=local,dest=${output}`, context],
  { cwd: root, encoding: 'utf8', timeout: 120_000, windowsHide: true, shell: false });
  if (result.error || result.status !== 0) {
    throw new Error(`Docker probe did not complete: ${result.error?.message || result.stderr}`);
  }
  const files = readdirSync(output, { recursive: true }).map(name => name.replaceAll('\\', '/'));
  return { missing: required.filter(name => !files.includes(name)),
    leaked: forbidden.filter(name => files.includes(name)) };
}

try {
  const actual = probe('restricted', policy);
  assert.deepEqual(actual.missing, [], 'The real policy must include all source inputs');
  assert.deepEqual(actual.leaked, [], 'The real policy must exclude operational and unrelated files');
  console.log(`PASS: ${required.length} source fixtures included; ${forbidden.length} unrelated fixtures excluded`);
  const control = probe('negative-control', '# Deliberately unrestricted synthetic context\n');
  assert.deepEqual(control.missing, []);
  assert.ok(control.leaked.includes('local-net/net-synthetic/keys.txt'),
    'The unrestricted context must expose the synthetic key fixture');
  assert.ok(control.leaked.includes('local-net/deploy/console.env'));
  console.log('PASS: negative control exposes synthetic operational files when the policy is removed');
  console.log(`Synthetic evidence retained at ${scratch}`);
} catch (error) {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
}
