#!/usr/bin/env node
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeLedger } from './ledger-write.mjs';

const work = fileURLToPath(new URL('../../work/', import.meta.url));
fs.mkdirSync(work, { recursive: true });
const root = fs.mkdtempSync(path.join(work, 'ledger-write-test-'));
const previous = { chains: [{ name: 'Existing Chain' }], retired: [] };
const next = { chains: [...previous.chains, { name: 'New Chain' }], retired: [] };
function fixture(label, existing = true) {
  const directory = path.join(root, label);
  fs.mkdirSync(directory);
  const file = path.join(directory, 'console-chains.json');
  if (existing) fs.writeFileSync(file, JSON.stringify(previous));
  return file;
}
const fresh = fixture('first-write', false);
writeLedger(fresh, previous);
assert.deepEqual(JSON.parse(fs.readFileSync(fresh)), previous);
assert.equal(fs.existsSync(fresh + '.bak'), false);
const file = fixture('replacement');
const originalBytes = fs.readFileSync(file);
writeLedger(file, next);
assert.deepEqual(JSON.parse(fs.readFileSync(file)), next);
assert.deepEqual(fs.readFileSync(file + '.bak'), originalBytes, 'backup must preserve exact previous bytes');
assert.equal(fs.existsSync(file + '.tmp'), false);
assert.equal(fs.existsSync(file + '.bak.tmp'), false);

// Real files and real flushes except the one injected failure. A failed flush
// must not replace the live file or erase the evidence needed for recovery.
for (const stage of ['backup-flush', 'primary-flush', 'backup-rename', 'primary-rename']) {
  const target = fixture(stage);
  const descriptors = new Map();
  const isTarget = name => name === target + (stage.startsWith('backup') ? '.bak.tmp' : '.tmp');
  const io = { ...fs,
    openSync(name, ...args) { const fd = fs.openSync(name, ...args); descriptors.set(fd, name); return fd; },
    closeSync(fd) { descriptors.delete(fd); fs.closeSync(fd); },
    fsyncSync(fd) {
      if (stage.endsWith('flush') && isTarget(descriptors.get(fd))) throw new Error('Synthetic flush failure');
      fs.fsyncSync(fd);
    },
    renameSync(from, to) {
      if (stage.endsWith('rename') && isTarget(from)) throw new Error('Synthetic rename failure');
      fs.renameSync(from, to);
    },
  };
  assert.throws(() => writeLedger(target, next, { io }), /persistence could not be confirmed/, stage);
  assert.deepEqual(JSON.parse(fs.readFileSync(target)), previous, `${stage}: original ledger survives`);
  const artifact = target + (stage.startsWith('backup') ? '.bak.tmp' : '.tmp');
  const evidence = fs.readFileSync(artifact);
  assert.throws(() => writeLedger(target, next), /unfinished write/, 'a retry must preserve stranded bytes');
  assert.deepEqual(fs.readFileSync(artifact), evidence);
  assert.equal(descriptors.size, 0, 'failure must close its descriptor');
  console.log(`PASS: ${stage} preserves the ledger and recovery evidence`);
}
const stranded = fixture('missing-with-backup', false);
fs.writeFileSync(stranded + '.bak', JSON.stringify(previous));
assert.throws(() => writeLedger(stranded, next), /missing but a backup exists/);
assert.equal(fs.existsSync(stranded), false);
if (process.platform !== 'win32') {
  for (const failAt of [1, 2]) {
    const target = fixture(`directory-flush-${failAt}`);
    const descriptors = new Map();
    let directoriesFlushed = 0;
    const io = { ...fs,
      openSync(name, ...args) { const fd = fs.openSync(name, ...args); descriptors.set(fd, name); return fd; },
      closeSync(fd) { descriptors.delete(fd); fs.closeSync(fd); },
      fsyncSync(fd) {
        if (descriptors.get(fd) === path.dirname(target) && ++directoriesFlushed === failAt) {
          throw new Error('Synthetic directory flush failure');
        }
        fs.fsyncSync(fd);
      },
    };
    assert.throws(() => writeLedger(target, next, { io }), /persistence could not be confirmed/);
    assert.deepEqual(JSON.parse(fs.readFileSync(target)), failAt === 1 ? previous : next,
      'failure after primary rename may leave the new ledger visible, but must not acknowledge persistence');
    assert.deepEqual(JSON.parse(fs.readFileSync(target + '.bak')), previous);
    assert.equal(descriptors.size, 0);
    console.log(`PASS: directory flush ${failAt} failure refuses acknowledgment after rename`);
  }
}
console.log('PASS: first write, exact backup, replacement, failure controls and missing primary');
