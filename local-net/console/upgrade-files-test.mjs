#!/usr/bin/env node
/**
 * upgrade-files-test.mjs — counter-checks for the on-disk `upgrade.json` rules (D-250, P-106).
 *
 * 🔴 These run against a REAL temporary directory, not a mocked filesystem. The rules here are
 * all about what avalanchego's `Glob("upgrade.*")` finds in a directory, and a fake filesystem
 * would be asserting my model of a directory rather than a directory. Both failures they exist
 * to prevent were measured on the drill network on 2026-09-05 and both stop a node.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { guardEntry } from '../lib/cli.mjs';
import { counter } from '../../scripts/lib/report.mjs';
import { createUpgradeFiles } from './upgrade-files.mjs';

guardEntry(import.meta.url, ['--self-test']);

const { ok, finish } = counter('COUNTER-CHECK — upgrade.json on disk');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'upgrade-files-'));
const chainConfigDir = path.join(root, 'chains');
const configDir = path.join(root, 'config');
const files = createUpgradeFiles({ chainConfigDir, configDir });
const CHAIN = 'SyntheticBlockchainID';
const chainDir = path.join(chainConfigDir, CHAIN);
const reset = () => { fs.rmSync(chainConfigDir, { recursive: true, force: true }); fs.mkdirSync(chainDir, { recursive: true }); };
const config = (n = 1) => ({ precompileUpgrades: Array.from({ length: n }, (_, i) => ({ txAllowListConfig: { blockTimestamp: 1000 + i } })) });

try {
  ok('🔴 a factory with no directories throws rather than writing somewhere surprising',
    (() => { try { createUpgradeFiles({}); return false; } catch { return true; } })());

  // ── Nothing on disk yet ──
  reset();
  ok('no file yet reads as an empty list, and says so',
    files.readUpgradeFile(CHAIN).exists === false && files.readUpgradeFile(CHAIN).list.length === 0);
  ok('a directory that does not exist has no entries',
    files.chainDirEntries('NeverCreated').length === 0);

  // ── Writing ──
  reset();
  const first = files.writeUpgradeFile(CHAIN, config(1));
  ok('the first write leaves no previous version behind', first.prev === null);
  ok('🔴 the directory holds EXACTLY upgrade.json — nothing else the node could glob',
    JSON.stringify(files.chainDirEntries(CHAIN)) === JSON.stringify(['upgrade.json']),
    `found ${JSON.stringify(files.chainDirEntries(CHAIN))}`);
  ok('the temporary file is gone, not merely renamed away',
    !files.chainDirEntries(CHAIN).includes('.upgrade.json.tmp'));
  ok('what was written reads back', files.readUpgradeFile(CHAIN).list.length === 1);
  ok('the file ends with a newline', fs.readFileSync(first.path, 'utf8').endsWith('\n'));

  const second = files.writeUpgradeFile(CHAIN, config(2));
  ok('the second write keeps the previous version', second.prev !== null && fs.existsSync(second.prev));
  ok('🔴 the previous version lands OUTSIDE the chain directory — beside it stops a node at boot',
    !second.prev.startsWith(chainDir + path.sep),
    'measured 2026-09-05: a node with upgrade.json.prev-… next to upgrade.json never started');
  ok('and the chain directory STILL holds only upgrade.json',
    JSON.stringify(files.chainDirEntries(CHAIN)) === JSON.stringify(['upgrade.json']));
  ok('the kept copy is the OLD content, byte for byte',
    fs.readFileSync(second.prev, 'utf8') === JSON.stringify(config(1), null, 2) + '\n');
  ok('the new content replaced the old', files.readUpgradeFile(CHAIN).list.length === 2);

  // ── A directory the node would read differently than the console assumes ──
  reset();
  fs.writeFileSync(path.join(chainDir, 'upgrade.json.failed-2026-09-05'), '{}');
  ok('🔴 a leftover upgrade.json.failed-… is REFUSED, not read as "no upgrades"',
    (() => { try { files.readUpgradeFile(CHAIN); return false; } catch { return true; } })(),
    'the node globs upgrade.* and loads that file whatever it is called');
  ok('…and a write into that directory is refused too',
    (() => { try { files.writeUpgradeFile(CHAIN, config()); return false; } catch { return true; } })());
  ok('the refusal names the chain, so the message is actionable',
    (() => { try { files.readUpgradeFile(CHAIN); return false; } catch (e) { return e.message.includes(CHAIN); } })());

  reset();
  fs.writeFileSync(path.join(chainDir, 'upgrade.json'), JSON.stringify(config()));
  fs.writeFileSync(path.join(chainDir, 'upgrade.json.prev-old'), '{}');
  ok('🔴 two glob matches are refused — that is the state that stops a node at boot',
    (() => { try { files.readUpgradeFile(CHAIN); return false; } catch { return true; } })());

  // ── A file this console did not write ──
  reset();
  fs.writeFileSync(path.join(chainDir, 'upgrade.json'), '{ not json');
  ok('🔴 unparsable JSON THROWS — it is not "treat as empty"',
    (() => { try { files.readUpgradeFile(CHAIN); return false; } catch { return true; } })(),
    'a file that does not parse stops this chain VM on every node that reads it');
  ok('the error says what would happen, not just that parsing failed',
    (() => { try { files.readUpgradeFile(CHAIN); return false; } catch (e) { return /refuse to start/.test(e.message); } })());

  reset();
  fs.writeFileSync(path.join(chainDir, 'upgrade.json'), JSON.stringify({ somethingElse: [] }));
  ok('🔴 valid JSON without precompileUpgrades is refused rather than extended',
    (() => { try { files.readUpgradeFile(CHAIN); return false; } catch (e) { return /did not write it/.test(e.message); } })());

  reset();
  fs.writeFileSync(path.join(chainDir, 'upgrade.json'), JSON.stringify({ precompileUpgrades: 'not-a-list' }));
  ok('precompileUpgrades that is not a list is refused too',
    (() => { try { files.readUpgradeFile(CHAIN); return false; } catch { return true; } })());

  // ── Paths ──
  ok('the upgrade file sits under the chain config directory, keyed by blockchainID',
    files.upgradeFilePath(CHAIN) === path.join(chainConfigDir, CHAIN, 'upgrade.json'));
  ok('history sits under the CONFIG directory, never under chains/',
    files.upgradeHistoryDir(CHAIN) === path.join(configDir, 'upgrade-history', CHAIN));
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

process.exitCode = finish('nothing but upgrade.json ever lands in a chain directory');
