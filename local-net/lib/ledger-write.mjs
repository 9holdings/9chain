// Flush the previous ledger and its replacement before acknowledging persistence.
// Recovery artifacts are retained after failure; never silently overwrite them.
import * as fs from 'node:fs';
import path from 'node:path';

export function assertNoPendingLedgerWrite(file, io = fs) {
  if (io.existsSync(file + '.tmp') || io.existsSync(file + '.bak.tmp')) {
    throw new Error('Chain ledger has an unfinished write. Operator recovery is required before saving.');
  }
}

export function writeLedger(file, state, { io = fs, platform = process.platform } = {}) {
  const text = JSON.stringify(state, null, 2);
  const directory = path.dirname(file);
  function syncDirectory() {
    // Node cannot fsync directories on Windows. Do not claim power-loss durability there.
    if (platform === 'win32') return;
    const fd = io.openSync(directory, 'r');
    try { io.fsyncSync(fd); } finally { io.closeSync(fd); }
  }
  function replace(destination, bytes) {
    const temporary = destination + '.tmp';
    const fd = io.openSync(temporary, 'wx', 0o644);
    try { io.writeFileSync(fd, bytes); io.fsyncSync(fd); }
    finally { io.closeSync(fd); }
    io.renameSync(temporary, destination);
    syncDirectory();
  }
  // Check both before changing either: a stranded write requires reconciliation.
  assertNoPendingLedgerWrite(file, io);
  let previous;
  try { previous = io.readFileSync(file); } catch (error) {
    if (error.code !== 'ENOENT') throw new Error('Chain ledger cannot be read before backup.', { cause: error });
    if (io.existsSync(file + '.bak')) {
      throw new Error('Chain ledger is missing but a backup exists. Operator recovery is required before saving.');
    }
  }
  try {
    if (previous !== undefined) replace(file + '.bak', previous);
    replace(file, text);
  } catch (error) {
    // Failure after rename can mean the new ledger is already visible. Never claim
    // rollback or remove recovery intent; the caller must not archive its journal.
    throw new Error('Chain ledger persistence could not be confirmed. Preserve recovery files and contact the operator.', { cause: error });
  }
}
