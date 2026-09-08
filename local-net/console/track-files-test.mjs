#!/usr/bin/env node
/**
 * track-files-test.mjs — counter-checks for the two files that say what each node tracks
 * (D-251, P-106 step 3).
 *
 * 🔴 The case worth having is the fallback one. A service missing from the override does NOT
 * track nothing — compose falls back to the base file's shared variable, i.e. to the every-node
 * model, and that difference is invisible from the outside. So "idle nodes are written with an
 * empty list" is a property, not a detail, and it is asserted here.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { guardEntry } from '../lib/cli.mjs';
import { counter } from '../../scripts/lib/report.mjs';
import { createTrackFiles } from './track-files.mjs';

guardEntry(import.meta.url, ['--self-test']);

const { ok, finish } = counter('COUNTER-CHECK — the track lists on disk');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'track-files-'));
const composeFile = path.join(root, 'docker-compose.yml');
const overrideFile = path.join(root, 'track.override.json');
fs.writeFileSync(composeFile, 'services: {}\n');
const files = createTrackFiles({ overrideFile, composeFile });
const SERVICES = ['node-1', 'node-2', 'node-3'];
const reset = () => { fs.rmSync(overrideFile, { force: true }); fs.rmSync(files.envPath(), { force: true }); };

try {
  ok('🔴 a factory with no paths throws rather than writing somewhere surprising',
    (() => { try { createTrackFiles({}); return false; } catch { return true; } })());

  // ── The override ──
  reset();
  files.writeTrackOverride(new Map([['node-2', ['sub-a']], ['node-1', ['sub-a', 'sub-b']], ['node-3', []]]));
  const written = JSON.parse(fs.readFileSync(overrideFile, 'utf8'));
  ok('🔴 an IDLE node is written with an EMPTY list, not left out',
    written.services['node-3'].environment[0] === 'AVAGO_TRACK_SUBNETS=',
    'a missing service falls back to the base file shared variable — the every-node model, silently');
  ok('every managed service is present', Object.keys(written.services).length === 3);
  ok('services are written in sorted order, so the file does not churn between runs',
    JSON.stringify(Object.keys(written.services)) === JSON.stringify(['node-1', 'node-2', 'node-3']));
  ok('the subnet list is comma-joined into the variable compose reads',
    written.services['node-1'].environment[0] === 'AVAGO_TRACK_SUBNETS=sub-a,sub-b');
  ok('the temporary file does not survive the write',
    !fs.existsSync(`${overrideFile}.tmp`));

  ok('what was written reads back per node', (() => {
    const lists = files.readTrackLists(SERVICES);
    return lists.get('node-1').join() === 'sub-a,sub-b' && lists.get('node-2').join() === 'sub-a'
      && lists.get('node-3').length === 0;
  })());

  ok('a service in the override but not managed any more is still reported, not dropped silently',
    files.readTrackLists(['node-1']).has('node-2'));

  // ── The .env fallback: the every-node model ──
  reset();
  fs.writeFileSync(files.envPath(), 'SOMETHING=else\nA1_TRACK_SUBNETS=sub-a,sub-b\nOTHER=1\n');
  ok('🔴 with NO override, every node reads the shared .env list — that IS the every-node model',
    (() => {
      const lists = files.readTrackLists(SERVICES);
      return SERVICES.every((s) => lists.get(s).join() === 'sub-a,sub-b');
    })());
  ok('each node gets its OWN array — mutating one must not change the others',
    (() => {
      const lists = files.readTrackLists(SERVICES);
      lists.get('node-1').push('leaked');
      return lists.get('node-2').join() === 'sub-a,sub-b';
    })());

  reset();
  ok('no override and no .env is an empty list per node, not a crash',
    files.readTrackLists(SERVICES).get('node-1').length === 0);

  reset();
  fs.writeFileSync(files.envPath(), 'A1_TRACK_SUBNETS=\n');
  ok('an empty .env value is an empty list, not a list holding one empty string',
    files.readTrackLists(SERVICES).get('node-1').length === 0);

  // ── Pinning into .env ──
  reset();
  fs.writeFileSync(files.envPath(), 'KEEP_ME=yes\nA1_TRACK_SUBNETS=old-value\nALSO_KEEP=1\n\n\n');
  files.pinTrackListToEnv('sub-a,sub-b');
  const env = fs.readFileSync(files.envPath(), 'utf8');
  ok('the new value is pinned', env.includes('A1_TRACK_SUBNETS=sub-a,sub-b'));
  ok('🔴 the OLD value is gone — two lines would leave compose reading whichever it likes',
    !env.includes('old-value'));
  ok('unrelated variables survive', env.includes('KEEP_ME=yes') && env.includes('ALSO_KEEP=1'));
  ok('trailing blank lines do not accumulate on every write',
    !/\n\n\n/.test(env) && env.endsWith('\n'));
  ok('the temporary file does not survive', !fs.existsSync(`${files.envPath()}.tmp`));

  reset();
  files.pinTrackListToEnv('only-one');
  ok('pinning into a directory with no .env creates one',
    fs.readFileSync(files.envPath(), 'utf8').includes('A1_TRACK_SUBNETS=only-one'));

  ok('.env sits beside the compose file, wherever that is',
    files.envPath() === path.join(root, '.env'));

  // ── The round trip ──
  reset();
  const before = new Map([['node-1', ['s1']], ['node-2', []], ['node-3', ['s1', 's2']]]);
  files.writeTrackOverride(before);
  const after = files.readTrackLists(SERVICES);
  ok('write then read returns exactly what went in',
    [...before.entries()].every(([svc, list]) => after.get(svc).join() === list.join()));
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

process.exitCode = finish('an idle node is written empty, never left out');
