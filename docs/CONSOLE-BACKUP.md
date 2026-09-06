# Console source and state backup

D-217 is local tooling, not a public backup or deployment. The helper preserves
the old files named by a verified proposed release and selected console runtime
state before a reviewed upgrade. It never restores, deletes, restarts or calls a
network. A backup hash is an integrity anchor, not deployment approval.

## Commands and preconditions

Run from a verified release payload on the target Linux host. The helper imports
`local-net/lib/console-release.mjs`; it is not a standalone SSH-stdin script.

```sh
node local-net/deploy/console-backup.mjs \
  --source /absolute/operator/src --release /absolute/package \
  --expected-release-sha256 REVIEWED_RELEASE_SHA
```

The default only inspects. Add `--create` and optionally `--backup-id UUID_V4`
after holding the D-214 invocation lock and proving D-211 stable, drained,
persistent maintenance. Reassert both before and after the backup. The helper
requires an empty maintenance directory, but a directory alone cannot prove that
the process has stopped accepting work or has drained. No pause/lock bypass exists
inside this helper; those are obligations of the deployment controller.

Creation makes an exclusive sibling `console-backups/<UUID>` outside live `src`.
Existing IDs are refused. Failure retains partial evidence and does not authorize
retry, recovery or removal. A completed backup has `backup.json`, `backup.sha256`,
`proposed-release.json` and exact `files/code` / `files/state` trees.

```sh
node local-net/deploy/console-backup.mjs \
  --verify /absolute/operator/console-backups/UUID \
  --expected-sha256 RECORDED_BACKUP_SHA
```

## Scope and guarantees

- Old source bytes or explicit absence for every file in the proposed release.
- Console chain ledger and its backup/temp files; creation pending/history files;
  per-chain config/upgrade files and upgrade history; empty maintenance marker.
- Original file modes, sizes, SHA-256, directory and required absence observations.
  Corrupt ledger/journal bytes are preserved without interpretation or repair.
- No blanket scan of the operational config root. Credentials, `console.env`,
  validator/genesis data, node_modules, logs and other services are outside scope.
  This filename policy is not a scanner that detects secrets embedded in allowed
  files. Do not publish backup artifacts.
- Source/destination parents and files must be real paths without links/junctions.
  Unknown entries inside selected runtime subtrees stop backup before copying.
- Limits: 16 MiB per file, 128 MiB total, 4096 entries. These bounds suit the current
  A1 console and are not a billion-chain storage design.
- Exclusive writes, copy verification, file fsync and POSIX directory fsync;
  Windows cannot establish the latter. Copied files use 0600, directories 0700.
- Source/state observations must match before and after copying. This is not an
  atomic filesystem snapshot, protection from a malicious same-host writer, or
  a power-loss experiment. Lock and drained maintenance remain necessary.
- Independent verification binds proposed metadata, exact inventory, runtime
  topology, required absences, total bytes and all file hashes. Links, extras,
  missing empty directories and self-consistent invalid metadata are rejected.

This is not a full-node backup, dependency rollback or tested restore procedure.
Restoring operational state needs a separate reviewed recovery plan. The old
deployment script remains unsafe until its orchestration is replaced.

## Evidence, 2026-09-06

Actual CLI tests use synthetic Git/source/state in scratch, with no real keys or
network: 33 checks on both Windows and Linux. Four Windows real-file fault controls
and five Linux controls cover source changing after copy, corrupted destination,
ENOSPC, file fsync and POSIX directory fsync. Incomplete backups remain and cannot
verify. Tampered metadata tests recalculate hashes to exercise structural rules.
Actual large files and 4096 histories exercise pre-copy resource bounds.

Windows: `work/console-backup-test.log`, `work/console-backup-test-wyVgOn`.
Linux: `work/console-backup-linux.log`, inputs `work/backup-linux-GklNBk`, container
`a1-autopilot-console-backup-linux-20260906` (network none, read-only root, 512 MiB,
one CPU, no published ports or Docker socket). Image adds Git to the existing
Node fixture using a Dockerfile-only context. Shared release verification was
extracted without changing the packager API; its 26 CLI regression cases pass.
