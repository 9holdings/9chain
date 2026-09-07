# Console source and state backup

D-217/D-222 are local tooling, not a public backup or deployment. The helper preserves
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
- D-222 adds the required console-tmp root observation and direct ASCII filenames
  matching `[A-Za-z0-9_-]{1,80}.json`. Preserve every selected file byte-for-byte,
  including outside-current-band and corrupt genesis; do not parse/filter by chain ID.
  Unknown names, nested directories and linked entries require review before copying.
- Original file modes, sizes, SHA-256, directory and required absence observations.
  Corrupt ledger/journal bytes are preserved without interpretation or repair.
- No blanket scan of the operational config root. Credentials, `console.env`,
  validator keys and primary-network genesis, node_modules, logs and other services
  are outside scope. The declared L1 template and selected temporary L1 genesis are included.
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
Restoring operational state needs a separate reviewed recovery plan. The D-218
controller in CONSOLE-DEPLOYMENT.md consumes this backup; public rollout and any
operational-state restore still require separate review.

New backups use schema2. Verification explicitly refuses legacy schema1, which did
not require temporary genesis observations. Retain old bytes and use their original
frozen verifier for historical integrity only; do not migrate or overwrite them.
There is no automatic fallback in the installer. Schema2 does not prove legacy drain
or authorize making a maintenance marker on a legacy server to bypass missing APIs.

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

## Expanded-scope evidence, 2026-09-07

D-222:43 actual CLI cases pass on Windows/Linux, with8 Windows/9 Linux real-file
fault controls. Current, outside-band and corrupt temporary genesis bytes and hashes
match the originals, which remain unchanged. Missing root is explicitly recorded;
unknown/nested/linked input refuses before destination creation. Independently
rehashed metadata still fails for missing required observations/topology, unlisted
payload and legacy schema. Missing/changed copied genesis fails verification.
Actual source drift, corrupt copy, ENOSPC and fsync failures during genesis copying
retain incomplete evidence without a verified backup. Existing bounds still pass.

Removing only console-tmp from the copied implementation omits actual genesis bytes
and fails the expected-copy assertion. Negative fixture work/backup-negative-scope-UcrjbT.
Windows fixture work/console-backup-test-GoQPxQ; Linux/negative log
work/d222-backup-checks.log, inputs work/d222-backup-linux-btVSZM. Linux container
a1-autopilot-d222-backup-linux-20260907 exited0/noOOM with network none, read-only root,
512MiB/1CPU and256MiB tmpfs. Uses the existing self-contained deployment fixture image.
No public backup, mutation, restore, power-loss experiment or first-adoption rehearsal.

## Bounded directory enumeration, D-224

An entry-count limit applied after readdirSync still allocates the whole directory
listing first. Both source snapshot traversal and independent backup-tree verification
now use a synchronous directory iterator with bufferSize1 and close the handle in
finally. Snapshot collection stops at the remaining4096-record budget; verification
stops at the first unlisted entry. Successful records retain their existing final
sorted order and schema2; no backup scope, byte limit or restoration policy changed.

Actual Windows history with4096 files reproduced the old full-listing behavior:
work/d224-backup-before.log, work/console-backup-test-elNJ79. The new reader stops
before consuming the entire history and closes its handle. A separate real backup
with4096 extra root files is refused after at most5 returned entries (four legitimate
root entries plus the first extra), also closing the handle. Restoring only the old
verification walk in copied source fails that assertion; fixture
work/backup-negative-verification-enumeration-IP5ruo.

43 CLI cases and8 Windows/9 Linux real-file fault controls still pass, plus the two
new enumeration controls. Windows log work/d224-backup-final.log, fixture
work/console-backup-test-JjRBrI. Linux/negative log work/d224-backup-checks.log,
inputs work/d224-backup-linux-AatSz3; network-none/read-only-root512MiB/1CPU container
a1-autopilot-d224-backup-linux-20260907 exited0/noOOM. These controls count entries
returned by the actual filesystem iterator, not kernel cache behavior or wall-clock
limits for a stalled filesystem. Public installation remains pending.
