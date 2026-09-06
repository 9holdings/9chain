#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, renameSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CreationJournal } from './creation-journal.mjs';

const work = fileURLToPath(new URL('../../work/', import.meta.url));
mkdirSync(work, { recursive: true });
const root = mkdtempSync(path.join(work, 'creation-journal-test-'));
const plan = { name: 'Journal Test', chainId: 9001000999, tpl: { config: { chainId: 9001000999 }, alloc: {} } };
const journal = new CreationJournal(root);
assert.equal(journal.read(), null);
const job = journal.begin(plan, 999999998);
assert.equal(journal.read().phase, 'prepared');
assert.throws(() => new CreationJournal(root).begin(plan, 999999998), /chain creation is pending/i);
assert.throws(() => journal.update({ id: 'not-the-owner' }, { phase: 'submitting' }), /ownership/);
assert.throws(() => journal.complete(job), /phase transition/);
assert.throws(() => journal.update(job, { phase: 'created', subnetID: 's', blockchainID: 'b' }), /phase transition/);
journal.update(job, { phase: 'submitting' });
assert.throws(() => journal.update(job, { phase: 'prepared' }), /phase transition/);
assert.throws(() => journal.update(job, { phase: 'created' }), /both P-chain identifiers/);
journal.update(job, { phase: 'created', subnetID: 'subnet1', blockchainID: 'blockchain1', plan: { name: 'wrong' } });
assert.equal(journal.read().plan.name, plan.name, 'phase updates cannot replace the reserved plan');
assert.throws(() => new CreationJournal(root).assertClear(), /chain creation is pending/i);
journal.complete(job);
assert.equal(journal.read(), null);
const history = path.join(journal.directory, 'history');
assert.equal(readdirSync(history).length, 1);
assert.equal(JSON.parse(readFileSync(path.join(history, `${job.id}.json`), 'utf8')).phase, 'complete');
const second = journal.begin(plan, 999999998);
assert.notEqual(second.id, job.id, 'completed history does not block a subsequent reservation');

const original = readFileSync(journal.pendingFile, 'utf8');
for (const invalid of ['{broken', '{}', 'null']) {
  writeFileSync(journal.pendingFile, invalid);
  assert.throws(() => new CreationJournal(root).assertClear(), /journal.*invalid/);
  assert.equal(readFileSync(journal.pendingFile, 'utf8'), invalid, 'refusal preserves corrupt bytes');
}
const altered = JSON.parse(original);
altered.plan.tpl.alloc.other = { balance: '0x1' };
writeFileSync(journal.pendingFile, JSON.stringify(altered));
assert.throws(() => journal.read(), /invalid structure/, 'genesis content must agree with its recorded hash');
writeFileSync(journal.pendingFile, original);
renameSync(journal.pendingFile, journal.pendingFile + '.tmp');
assert.throws(() => journal.assertClear(), /cannot be read/, 'a stranded update is not a fresh journal');
assert.equal(readFileSync(journal.pendingFile + '.tmp', 'utf8'), original);
console.log('PASS: exclusive reservation, phase ordering, ownership, archive, restart reads, corruption and genesis hash controls');
