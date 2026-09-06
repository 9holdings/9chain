// Single-console admission control. The empty marker directory survives restart.
import * as fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const failure = (message, status = 503) => Object.assign(new Error(message), { status });

export class MaintenanceGate {
  constructor(configDirectory, { io = fs, platform = process.platform } = {}) {
    this.directory = path.join(configDirectory, 'console-maintenance');
    this.io = io; this.platform = platform;
    this.instanceId = randomUUID();
    this.maintenanceId = null;
    this.paused = false;
    this.activeOperations = 0;
    this.persistenceConfirmed = true;
    this.refresh();
  }

  markerExists() {
    try {
      const stat = this.io.lstatSync(this.directory);
      if (!stat.isDirectory() || stat.isSymbolicLink() || this.io.readdirSync(this.directory).length) {
        throw failure('Console maintenance marker is not an empty directory; operator inspection is required');
      }
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') return false;
      throw failure('Console maintenance state cannot be verified; operator inspection is required');
    }
  }

  refresh() {
    const exists = this.markerExists();
    if (exists && !this.paused) {
      this.paused = true; this.maintenanceId = randomUUID();
    }
    // Removing a marker outside the API must not reopen this running process.
    return exists;
  }

  snapshot() {
    const exists = this.refresh();
    const persistent = this.paused && exists && this.persistenceConfirmed;
    return { instanceId: this.instanceId, maintenanceId: this.maintenanceId,
      paused: this.paused, activeOperations: this.activeOperations, persistent,
      readyForRestart: persistent && this.activeOperations === 0 };
  }

  enter() {
    this.refresh();
    if (this.paused) throw failure('Console maintenance is in progress; try again after the operator reopens it');
    this.activeOperations++;
    let released = false;
    return () => { if (!released) { released = true; this.activeOperations--; } };
  }

  syncDirectory(directory) {
    if (this.platform === 'win32') return;
    const fd = this.io.openSync(directory, 'r');
    try { this.io.fsyncSync(fd); } finally { this.io.closeSync(fd); }
  }

  pause() {
    // Stop admissions synchronously, before any persistence attempt can fail.
    if (!this.paused) { this.paused = true; this.maintenanceId = randomUUID(); }
    this.persistenceConfirmed = false;
    try {
      try { this.io.mkdirSync(this.directory, { mode: 0o700 }); }
      catch (error) { if (error.code !== 'EEXIST') throw error; }
      if (!this.markerExists()) throw new Error('Maintenance marker disappeared');
      this.syncDirectory(this.directory);
      this.syncDirectory(path.dirname(this.directory));
      this.persistenceConfirmed = true;
      return this.snapshot();
    } catch { throw failure('Console maintenance persistence failed; admissions remain paused and restart is not confirmed safe'); }
  }

  resume(observation) {
    const { instanceId, maintenanceId } = observation ?? {};
    const state = this.snapshot();
    if (!state.paused || instanceId !== this.instanceId || maintenanceId !== this.maintenanceId) {
      throw failure('Console maintenance observation is stale; read the current maintenance state before resuming', 409);
    }
    if (this.activeOperations) throw failure('Console maintenance still has active operations; wait before resuming', 409);
    if (!state.persistent) throw failure('Console maintenance persistence is unconfirmed; reassert pause before resuming');
    // rmdir refuses a non-empty marker. Never recursively remove operator data.
    try {
      this.io.rmdirSync(this.directory);
      this.syncDirectory(path.dirname(this.directory));
    } catch {
      this.persistenceConfirmed = false;
      throw failure('Console maintenance release failed; inspect current state before retrying');
    }
    this.paused = false;
    return this.snapshot();
  }
}
