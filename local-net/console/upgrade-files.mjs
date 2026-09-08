/**
 * upgrade-files.mjs — the `upgrade.json` of a user L1, on disk.
 *
 * Lifted out of `console/server.mjs` on 2026-09-08 (D-250, P-106 step 2). The rules are
 * unchanged; what is new is that they can be exercised against a real directory without starting
 * a console, which is why every one of them now has a counter-check.
 *
 * The DECISIONS about upgrades live in `lib/l1-upgrade.mjs`. This module is only the side
 * effects: what is on disk, what the node would read, and how a file is replaced without ever
 * leaving the directory in a state that stops a node.
 *
 * ═══ 🔴 WHY A CHAIN DIRECTORY IS SO EASY TO BREAK ═══
 *
 * avalanchego reads a chain's config directory with `Glob("upgrade.*")`
 * (`config/config.go:1144` → `storage_common.go:28`). One match is loaded whatever it is called;
 * TWO matches stop the whole node at boot. Both halves were measured on the drill network on
 * 2026-09-05: a node loaded a file that had been "removed" by renaming it to
 * `upgrade.json.failed-…`, and a node with an `upgrade.json.prev-…` sitting beside its
 * `upgrade.json` never started at all.
 *
 * ⇒ Nothing but `upgrade.json` is ever created inside a chain directory. Previous versions go to
 *   `upgrade-history/` OUTSIDE it, and the temporary file used for the atomic replace is named
 *   `.upgrade.json.tmp` — the leading dot keeps it outside the node's glob for the instant it
 *   exists.
 *
 * A directory is created via a factory rather than read from module scope so the counter-checks
 * can point it at a temporary tree. The console passes its real `CHAIN_CFG_DIR` and `CFG_DIR`.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chainDirVerdict } from "../lib/l1-upgrade.mjs";

export function createUpgradeFiles({ chainConfigDir, configDir }) {
  if (!chainConfigDir || !configDir) throw new Error("createUpgradeFiles needs chainConfigDir and configDir");

  const upgradeFilePath = (blockchainID) => path.join(chainConfigDir, blockchainID, "upgrade.json");

  /** Where previous versions and failed files go — OUTSIDE `chains/`, see the header. */
  const upgradeHistoryDir = (blockchainID) => path.join(configDir, "upgrade-history", blockchainID);

  /** The entries of a chain's config directory, `[]` when it does not exist yet. */
  const chainDirEntries = (blockchainID) => {
    const dir = path.join(chainConfigDir, blockchainID);
    return existsSync(dir) ? readdirSync(dir) : [];
  };

  /**
   * Refuse to touch a chain directory that is not in the one state the node reads the way the
   * console assumes: `upgrade.json` alone, or no upgrade file at all.
   */
  const assertChainDirReadable = (blockchainID) => {
    const verdict = chainDirVerdict(chainDirEntries(blockchainID));
    if (verdict) throw new Error(`upgrade directory for ${blockchainID}: ${verdict}`);
  };

  /** The upgrade list on disk — `[]` when there is no file, an ERROR when there is a broken one. */
  const readUpgradeFile = (blockchainID) => {
    // 🔴 Ask what the NODE would read, not whether upgrade.json exists: a directory holding only
    // `upgrade.json.failed-…` has no upgrade.json and still upgrades every node that restarts.
    assertChainDirReadable(blockchainID);
    const p = upgradeFilePath(blockchainID);
    if (!existsSync(p)) return { list: [], exists: false };
    let j;
    try { j = JSON.parse(readFileSync(p, "utf8")); }
    catch (e) {
      // 🔴 Not "treat as empty": a file that does not parse stops this chain's VM on every node
      // that reads it (plugin/evm/vm.go:544). Extending it would hide that under a fresh timestamp.
      throw new Error(`upgrade.json for ${blockchainID} on disk is not valid JSON (${e.message}) — every node would refuse to start this chain; fix the file by hand before scheduling anything`);
    }
    if (!Array.isArray(j?.precompileUpgrades)) {
      throw new Error(`upgrade.json for ${blockchainID} has no precompileUpgrades list — this console did not write it; refusing to extend a file it does not understand`);
    }
    return { list: j.precompileUpgrades, exists: true };
  };

  /**
   * Write the file atomically, keeping the previous version in `upgrade-history/` so a failed
   * rollout can undo.
   */
  const writeUpgradeFile = (blockchainID, upgradeConfig) => {
    assertChainDirReadable(blockchainID);
    const p = upgradeFilePath(blockchainID);
    mkdirSync(path.dirname(p), { recursive: true });
    let prev = null;
    if (existsSync(p)) {
      mkdirSync(upgradeHistoryDir(blockchainID), { recursive: true });
      prev = path.join(upgradeHistoryDir(blockchainID), `upgrade.json.prev-${new Date().toISOString().replace(/[:.]/g, "-")}`);
      writeFileSync(prev, readFileSync(p));
    }
    // `.upgrade.json.tmp`: a leading dot keeps it outside `upgrade.*` for the instant it exists.
    const tmp = path.join(path.dirname(p), ".upgrade.json.tmp");
    writeFileSync(tmp, JSON.stringify(upgradeConfig, null, 2) + "\n");
    renameSync(tmp, p);
    return { path: p, prev };
  };

  return { upgradeFilePath, upgradeHistoryDir, chainDirEntries, assertChainDirReadable, readUpgradeFile, writeUpgradeFile };
}
