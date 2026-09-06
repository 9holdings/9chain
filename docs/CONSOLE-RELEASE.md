# Frozen console release package

D-212 adds a local packager. **It does not deploy, run tests, authorize a release or
make the legacy deployment script safe.** Use it to identify exact bytes for review
and later deployment. Public deployment/bootstrap remains owner-reviewed.

## Prepare and verify

After committing the intended source on a clean `main` working tree:

```powershell
node scripts/prepare-console-release.mjs
node scripts/prepare-console-release.mjs --verify C:\path\to\release --expected-sha256 REVIEWED_SHA256
```

The first command creates a unique ignored directory under
`work/console-releases/<commit-prefix>-<random>/` and prints its location, metadata
SHA-256, source commit/tree, group names, file count and total bytes. The second
checks the complete package against the hash accepted during review. Omitting
`--expected-sha256` checks internal consistency only; a recomputed package and
metadata hash are not an independent trust anchor or digital signature.

Each directory contains exactly:

- `payload/`: source files with their repository-relative paths;
- `release.json`: schema, source identity, timestamp, group list and each file's
  size and SHA-256;
- `release.sha256`: hash of the exact metadata bytes.

The package remains independent of later working-tree edits. It records actual
checkout bytes, including platform line endings; the Git commit alone is not a
substitute for its file hashes. Verification does not need the original source
working tree and never reaches the server or registry.

## Scope and refusal rules

The selected file inventory is the union of the existing manifest's `console` and
`vantoc` operator groups, plus the manifest itself. Shared dependencies appear once.
The console group now explicitly includes its restart helper and tracked dependency
lock. This covers the read-only recovery inspector and maintenance client as well
as the service. Faucet code is not selected by this console release.

A separate path-scope guard permits source files in the console/lib/deploy/script
locations and the public L1 template. It rejects operational config directories,
validator genesis, ledgers, journals, maintenance state, `.env`, key files and
node_modules. It is not a secret-content scanner: continue the repository's existing
secret checks and review manifest changes before publication/deployment.

Preparation requires the repository root, clean committed `main`, tracked source
files and nonempty console/operator groups. It rejects ignored manifest entries,
missing lock/restart files, unsafe paths, nonregular inputs and paths resolving
outside the source root. After copying, it rechecks the source revision/cleanliness
and every selected source hash before writing release metadata. An interrupted or
failed attempt may leave a partial scratch directory; it is retained, not silently
deleted or considered a usable release.

Verification checks metadata format/hash, the exact group inventory derived from
the bundled manifest, every file hash/size and the complete directory tree. Missing,
extra, duplicate or traversal paths, symbolic links/junction payloads, unexpected
directories and inconsistent hashes fail. An expected hash also catches metadata
changed together with a recomputed local `release.sha256`.

## Dependency installation

The manifest now includes `local-net/console/package-lock.json`; a prepared deploy
must use `npm ci` with that lock, rather than letting an install resolve a different
transitive dependency tree. No installation occurs during packaging.

Measured 2026-09-06: an isolated `node:24-alpine` runtime installed the tracked
package/lock pair with `npm ci --ignore-scripts --no-audit --no-fund`. It added nine
packages, loaded ethers 6.17.0 (matching package.json) and passed a synthetic
sign/verify round trip. Container `a1-autopilot-console-lock-20260906`: read-only
inputs/root, temporary app/cache, 512 MiB/1 CPU, 90-second in-container deadline,
registry downloads enabled, no exposed ports or blockchain calls. Exited 0/no OOM.
Log: `work/console-lock-check.log`. This verifies the measured Linux installation,
not all architectures or npm lifecycle scripts (which were intentionally disabled).

## Validation and remaining deployment work

`scripts/prepare-console-release-test.mjs` runs the actual CLI against synthetic Git
repositories and packages. Twenty-six checks cover the clean source contract,
operator/restart/lock coverage, unchanged frozen bytes after source edits, actual
tampering with payload/metadata, extra files/directories, expected-hash mismatch,
symlink/junction refusal, unsafe scope and detached/other/dirty sources. Negative
cases assert a nonzero CLI exit and the specific refusal reason. Included in the
local runner; nineteen checks pass in the console profile. Evidence:
`work/console-release-full-profile.log` and synthetic `work/console-release-test-*`.

Next: consume this reviewed package in the deployment script, run the required
checks against its exact source revision, acquire the existing lock, pause/drain
before any replacement, retain rollback source/state outside running code, verify
remote hashes and the new paused process, then explicitly resume. A failed phase
must keep maintenance and evidence. Current legacy bootstrap needs a separately
reviewed transition; `CONSOLE-MAINTENANCE.md` documents the confirmed HTTP 404.

Post-commit tooling acceptance on real main `0ae39f1`: 38 files /560601 bytes,
metadata SHA `542d5bfc737383a3a023234f303981f22b52b2de29408fed4f580362d3b8ba7b`,
retained in `work/console-releases/0ae39f1929eb-CRIO7B`. A separate CLI verification
with this expected SHA passes. This preliminary package still contains the legacy
restart helper and is not a final approved deployment candidate.

Expanded read-only server drift also revealed the historical
`local-net/deploy/heartbeat-deploy.sh` outside main's inventory. Its 8973 bytes hash
exactly to the existing web-home copy (`31fe596208459f714976591be7fff60d27609ff3a466ec2fb41e20a14b3e7ae6`).
D-193 explains why main imported only its stop gate, and D-194 assigns ownership to
main. It was neither run, deleted, restored nor exempted during this investigation.
Its intended retention needs a precise decision before a clean public release can
be claimed; see `work/deploy-drift-release-20260906.log`.
