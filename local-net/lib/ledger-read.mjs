// Shared console and operator reader. Recovery evidence never becomes empty state.
import { readFileSync, existsSync } from 'node:fs';

export function parseLedger(text) {
  let state;
  try { state = JSON.parse(text); } catch {
    throw new Error('Chain ledger contains invalid JSON. Restore the ledger before continuing.');
  }
  const entriesValid = entries => Array.isArray(entries) && entries.every(entry =>
    entry && typeof entry === 'object' && !Array.isArray(entry) &&
    typeof entry.name === 'string' && entry.name.trim().length > 0);
  if (!state || typeof state !== 'object' || Array.isArray(state) || !entriesValid(state.chains) ||
      (state.retired !== undefined && !entriesValid(state.retired))) {
    throw new Error('Chain ledger has invalid structure. Restore the ledger before continuing.');
  }
  return { ...state, retired: state.retired ?? [] };
}

export function readLedger(file) {
  let text;
  try { text = readFileSync(file, 'utf8'); } catch (error) {
    if (error.code === 'ENOENT') {
      if (['.bak', '.tmp', '.bak.tmp'].some(suffix => existsSync(file + suffix))) {
        throw new Error('Chain ledger is missing but recovery files exist. Restore the ledger before continuing.');
      }
      return { chains: [], retired: [] };
    }
    throw new Error('Chain ledger cannot be read. Restore access before continuing.');
  }
  return parseLedger(text);
}
