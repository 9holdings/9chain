// A single pending creation protects the serial orchestrator across process restarts.
// Never clear an uncertain submission automatically or replay its P-chain transaction.
import { openSync, writeFileSync, fsyncSync, closeSync, readFileSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import { randomUUID, createHash } from 'node:crypto';
import path from 'node:path';

const phases = new Set(['prepared', 'submitting', 'created', 'complete']);
const nextPhase = { prepared: 'submitting', submitting: 'created', created: 'complete' };
export const creationGenesisText = plan => JSON.stringify(plan.tpl, null, 2);
const genesisHash = plan => createHash('sha256').update(creationGenesisText(plan)).digest('hex');
function syncDirectory(directory) {
  // Windows does not expose directory fsync through Node. File contents are flushed
  // on both platforms; power-loss durability on Windows is not asserted here.
  if (process.platform === 'win32') return;
  const fd = openSync(directory, 'r');
  try { fsyncSync(fd); } finally { closeSync(fd); }
}
function writeDurably(file, data, flags) {
  const fd = openSync(file, flags, 0o600);
  try { writeFileSync(fd, JSON.stringify(data, null, 2) + '\n'); fsyncSync(fd); }
  finally { closeSync(fd); }
}

export class CreationJournal {
  constructor(configDirectory) {
    this.directory = path.join(configDirectory, 'creation-journal');
    this.pendingFile = path.join(this.directory, 'pending.json');
  }
  read() {
    let text;
    try { text = readFileSync(this.pendingFile, 'utf8'); } catch (error) {
      if (error.code === 'ENOENT' && !existsSync(this.pendingFile + '.tmp')) return null;
      throw new Error('Pending creation journal cannot be read. Operator recovery is required before chain changes.');
    }
    let job;
    try { job = JSON.parse(text); } catch {
      throw new Error('Pending creation journal contains invalid JSON. Operator recovery is required before chain changes.');
    }
    if (!job || job.version !== 1 || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(job.id ?? '') ||
        !phases.has(job.phase) || typeof job.plan?.name !== 'string' ||
        !Number.isSafeInteger(job.networkID) || !Number.isSafeInteger(job.plan.chainId) ||
        job.plan.chainId <= 0 || job.plan.tpl?.config?.chainId !== job.plan.chainId ||
        !/^[0-9a-f]{64}$/.test(job.genesisSha256 ?? '') || genesisHash(job.plan) !== job.genesisSha256 ||
        (['created', 'complete'].includes(job.phase) &&
          (!/^[A-Za-z0-9]+$/.test(job.subnetID ?? '') || !/^[A-Za-z0-9]+$/.test(job.blockchainID ?? '')))) {
      throw new Error('Pending creation journal has invalid structure. Operator recovery is required before chain changes.');
    }
    return job;
  }
  assertClear() {
    const job = this.read();
    if (job) throw new Error(`A chain creation is pending for "${job.plan.name}" (${job.id}). ` +
      'Wait for completion; if it was interrupted, contact the operator before retrying or changing chains.');
  }
  summary() {
    const job = this.read();
    if (!job) return null;
    return { jobId: job.id, name: job.plan.name, chainId: job.plan.chainId,
      phase: job.phase, createdAt: job.createdAt,
      subnetID: job.subnetID ?? null, blockchainID: job.blockchainID ?? null };
  }
  begin(plan, networkID) {
    this.assertClear();
    mkdirSync(this.directory, { recursive: true });
    const job = { version: 1, id: randomUUID(), phase: 'prepared', networkID,
      createdAt: Date.now(), updatedAt: Date.now(),
      genesisSha256: genesisHash(plan), plan };
    // Exclusive creation prevents two console processes from both submitting.
    // An interrupted initial write remains present and unreadable, hence fail-closed.
    try { writeDurably(this.pendingFile, job, 'wx'); } catch (error) {
      if (error.code === 'EEXIST') throw new Error('A chain creation is pending. Operator recovery is required before retrying.');
      throw error;
    }
    syncDirectory(this.directory);
    syncDirectory(path.dirname(this.directory));
    return job;
  }
  update(job, changes) {
    const current = this.read();
    if (!current || current.id !== job.id) throw new Error('Pending creation journal ownership changed; refusing to overwrite it.');
    if (changes.phase !== nextPhase[current.phase]) throw new Error('Invalid creation journal phase transition');
    const next = { ...current, phase: changes.phase, updatedAt: Date.now(),
      ...(changes.subnetID === undefined ? {} : { subnetID: changes.subnetID }),
      ...(changes.blockchainID === undefined ? {} : { blockchainID: changes.blockchainID }) };
    if (['created', 'complete'].includes(next.phase) &&
        (!/^[A-Za-z0-9]+$/.test(next.subnetID ?? '') || !/^[A-Za-z0-9]+$/.test(next.blockchainID ?? ''))) {
      throw new Error('Created journal entries require both P-chain identifiers');
    }
    writeDurably(this.pendingFile + '.tmp', next, 'w');
    renameSync(this.pendingFile + '.tmp', this.pendingFile);
    syncDirectory(this.directory);
    return next;
  }
  complete(job) {
    const done = this.update(job, { phase: 'complete' });
    const history = path.join(this.directory, 'history');
    mkdirSync(history, { recursive: true });
    const destination = path.join(history, `${done.id}.json`);
    if (existsSync(destination)) throw new Error('Creation journal history already exists; refusing to overwrite it.');
    renameSync(this.pendingFile, destination);
    syncDirectory(history);
    syncDirectory(this.directory);
  }
}
