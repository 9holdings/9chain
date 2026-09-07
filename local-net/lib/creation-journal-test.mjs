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
assert.deepEqual(journal.pendingSubnetIDs(), [], 'before the P-chain answered there is no subnet to keep tracked');
journal.update(job, { phase: 'created', subnetID: 'subnet1', blockchainID: 'blockchain1', plan: { name: 'wrong' } });
assert.equal(journal.read().plan.name, plan.name, 'phase updates cannot replace the reserved plan');
assert.throws(() => new CreationJournal(root).assertClear(), /chain creation is pending/i);
// Only the pending chain itself is off limits; other chains keep their doors (D-227).
assert.throws(() => journal.assertNotPendingFor('Journal Test'), /pending for "Journal Test"/);
assert.throws(() => journal.assertNotPendingFor('  journal test '), /pending for "Journal Test"/, 'name match is case- and whitespace-insensitive, like the ledger');
journal.assertNotPendingFor('Another Chain');
journal.assertNotPendingFor(undefined);
assert.deepEqual(journal.pendingSubnetIDs(), ['subnet1'], 'a created subnet must stay on every rollout track list');
assert.throws(() => journal.resolve(job, 'adopted'), /Unknown creation resolution/, 'adoption completes the journal instead');
assert.throws(() => journal.resolve({ id: 'not-the-owner' }, 'retired'), /ownership/);
assert.equal(journal.read().phase, 'created', 'refused resolutions leave the reservation untouched');
journal.complete(job);
assert.equal(journal.read(), null);
const history = path.join(journal.directory, 'history');
assert.equal(readdirSync(history).length, 1);
assert.equal(JSON.parse(readFileSync(path.join(history, `${job.id}.json`), 'utf8')).phase, 'complete');
const second = journal.begin(plan, 999999998);
assert.notEqual(second.id, job.id, 'completed history does not block a subsequent reservation');

// Resolution without completion: the record moves to history carrying the decision, the
// reservation disappears, and a resolved record can never be mistaken for a pending one.
const discarded = journal.resolve(second, 'discarded', { by: 'console', reason: 'synthetic spawn failure' });
assert.equal(discarded.resolution, 'discarded');
assert.equal(journal.read(), null, 'a discarded reservation no longer blocks');
assert.equal(readdirSync(history).length, 2);
const archived = JSON.parse(readFileSync(path.join(history, `${second.id}.json`), 'utf8'));
assert.equal(archived.phase, 'prepared', 'the phase reached is kept as evidence');
assert.equal(archived.resolutionDetails.reason, 'synthetic spawn failure');
const third = journal.begin(plan, 999999998);
journal.update(third, { phase: 'submitting' });
journal.update(third, { phase: 'created', subnetID: 'subnet3', blockchainID: 'blockchain3' });
const retired = journal.resolve(third, 'retired', { by: 'operator', subnetID: 'subnet3', blockchainID: 'blockchain3' });
assert.equal(retired.resolution, 'retired');
assert.equal(journal.read(), null);
assert.equal(readdirSync(history).length, 3);
writeFileSync(journal.pendingFile, JSON.stringify(retired));
assert.throws(() => journal.read(), /invalid structure/, 'a resolved record must never pass as a live reservation');
renameSync(journal.pendingFile, path.join(root, 'resolved-record-copy.json'));
const fourth = journal.begin(plan, 999999998);
writeFileSync(path.join(history, `${fourth.id}.json`), '{"synthetic":"collision"}\n');
assert.throws(() => journal.resolve(fourth, 'discarded'), /history already exists/, 'a history file is never overwritten');
assert.equal(journal.read().id, fourth.id, 'a refused resolution keeps the reservation');
assert.equal(readFileSync(path.join(history, `${fourth.id}.json`), 'utf8'), '{"synthetic":"collision"}\n');
renameSync(path.join(history, `${fourth.id}.json`), path.join(root, 'collision-copy.json'));

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
