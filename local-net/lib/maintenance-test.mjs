#!/usr/bin/env node
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MaintenanceGate } from './maintenance.mjs';

const work = fileURLToPath(new URL('../../work/', import.meta.url));
fs.mkdirSync(work, { recursive: true });
const scratch = fs.mkdtempSync(path.join(work, 'maintenance-files-'));
const fixture = label => { const dir = path.join(scratch, label); fs.mkdirSync(dir); return dir; };
const dir = fixture('normal'), gate = new MaintenanceGate(dir);
assert.deepEqual(fs.readdirSync(dir), [], 'Construction must not create a maintenance marker');
const a = gate.enter(), b = gate.enter();
let state = gate.pause();
assert.equal(state.activeOperations, 2); assert.equal(state.readyForRestart, false);
assert.equal(gate.pause().maintenanceId, state.maintenanceId, 'Repeated pause must be idempotent');
assert.throws(() => gate.enter(), /maintenance is in progress/);
assert.throws(() => gate.resume(state), error => error.status === 409 && /active operations/.test(error.message));
a(); a(); assert.equal(gate.snapshot().activeOperations, 1, 'Release must be idempotent');
b(); assert.equal(gate.snapshot().readyForRestart, true);
const restarted = new MaintenanceGate(dir);
assert.equal(restarted.snapshot().paused, true);
assert.throws(() => restarted.resume(state), error => error.status === 409 && /stale/.test(error.message));
assert.throws(() => restarted.resume(null), error => error.status === 409);
assert.equal(restarted.resume(restarted.snapshot()).paused, false);
assert.deepEqual(fs.readdirSync(dir), []);
assert.equal(gate.snapshot().paused, true, 'External marker removal must not reopen an existing process');
assert.equal(gate.snapshot().persistent, false);
assert.throws(() => gate.resume(state), /persistence is unconfirmed/);
state = gate.pause(); gate.resume(state);
const newer = gate.pause();
assert.notEqual(newer.maintenanceId, state.maintenanceId);
assert.throws(() => gate.resume(state), /stale/);
console.log('PASS: counted admissions, idempotent release/pause, persistence, external removal and stale observations');

const mkdirDir = fixture('mkdir-fails');
let mkdirFails = true;
const mkdirGate = new MaintenanceGate(mkdirDir, { io: { ...fs, mkdirSync(...args) {
  if (mkdirFails) throw Object.assign(new Error('synthetic full disk'), { code: 'ENOSPC' });
  return fs.mkdirSync(...args);
} } });
assert.throws(() => mkdirGate.pause(), /persistence failed/);
assert.equal(mkdirGate.snapshot().paused, true);
assert.equal(mkdirGate.snapshot().readyForRestart, false);
assert.throws(() => mkdirGate.enter(), /maintenance is in progress/);
mkdirFails = false; assert.equal(mkdirGate.pause().readyForRestart, true);

const unreadableDir = fixture('unreadable');
let unreadable = false;
const unreadableGate = new MaintenanceGate(unreadableDir, { io: { ...fs, lstatSync(...args) {
  if (unreadable) throw Object.assign(new Error('synthetic denied'), { code: 'EACCES' });
  return fs.lstatSync(...args);
} } });
unreadable = true;
assert.throws(() => unreadableGate.enter(), /state cannot be verified/);
assert.throws(() => unreadableGate.snapshot(), /state cannot be verified/);
assert.equal(unreadableGate.activeOperations, 0);
console.log('PASS: failed marker creation or unreadable state never admits new operations');

for (const kind of ['file', 'nonempty']) {
  const badDir = fixture(`bad-${kind}`), marker = path.join(badDir, 'console-maintenance');
  if (kind === 'file') fs.writeFileSync(marker, 'synthetic evidence');
  else { fs.mkdirSync(marker); fs.writeFileSync(path.join(marker, 'evidence.txt'), 'synthetic evidence'); }
  assert.throws(() => new MaintenanceGate(badDir), /state cannot be verified/);
  assert.equal(fs.readFileSync(kind === 'file' ? marker : path.join(marker, 'evidence.txt'), 'utf8'), 'synthetic evidence');
}
const nonemptyGate = new MaintenanceGate(fixture('changed-marker'));
const emptyState = nonemptyGate.pause();
fs.writeFileSync(path.join(nonemptyGate.directory, 'evidence.txt'), 'synthetic evidence');
assert.throws(() => nonemptyGate.resume(emptyState), /state cannot be verified/);
assert.equal(fs.readFileSync(path.join(nonemptyGate.directory, 'evidence.txt'), 'utf8'), 'synthetic evidence');

const removeGate = new MaintenanceGate(fixture('remove-fails'), { io: { ...fs, rmdirSync() {
  throw Object.assign(new Error('synthetic denied'), { code: 'EACCES' });
} } });
const removeState = removeGate.pause();
assert.throws(() => removeGate.resume(removeState), /release failed/);
assert.equal(removeGate.snapshot().paused, true);
assert.equal(removeGate.snapshot().readyForRestart, false);
assert.equal(fs.statSync(removeGate.directory).isDirectory(), true);
console.log('PASS: malformed/nonempty markers and failed release retain evidence and refuse reopening');

if (process.platform !== 'win32') {
  for (const failureAt of [1, 2]) {
    let syncs = 0, broken = true;
    const syncGate = new MaintenanceGate(fixture(`sync-${failureAt}`), { io: { ...fs, fsyncSync(fd) {
      if (++syncs === failureAt && broken) throw new Error('synthetic directory sync failure');
      fs.fsyncSync(fd);
    } } });
    assert.throws(() => syncGate.pause(), /persistence failed/);
    assert.equal(syncGate.snapshot().paused, true);
    assert.equal(syncGate.snapshot().persistent, false);
    assert.equal(syncGate.snapshot().readyForRestart, false);
    broken = false; assert.equal(syncGate.pause().readyForRestart, true);
  }
  let failReleaseSync = false;
  const releaseSyncGate = new MaintenanceGate(fixture('release-sync-fails'), { io: { ...fs, fsyncSync(fd) {
    if (failReleaseSync) throw new Error('synthetic release sync failure');
    fs.fsyncSync(fd);
  } } });
  const releaseState = releaseSyncGate.pause(); failReleaseSync = true;
  assert.throws(() => releaseSyncGate.resume(releaseState), /release failed/);
  assert.equal(releaseSyncGate.snapshot().paused, true);
  assert.equal(releaseSyncGate.snapshot().persistent, false);
  assert.equal(fs.existsSync(releaseSyncGate.directory), false,
    'A failure after removal must not falsely promise the marker is still present');
  console.log('PASS: actual POSIX directory sync failures, including visibility after removal');
}
console.log(`Synthetic file evidence retained: ${scratch}`);
