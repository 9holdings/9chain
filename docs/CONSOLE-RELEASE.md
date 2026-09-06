# Frozen console release package

D-212 adds a local packager. **Packaging does not deploy, run tests or authorize a
release.** D-218 now consumes the frozen package through reviewed staged deployment
(CONSOLE-DEPLOYMENT.md); D-219 adds actual process readiness. Public deployment and
first adoption of the legacy server remain owner-reviewed.

D-216 adds separate exact-source local validation, described below. Packaging
alone remains an integrity check and never substitutes for acceptance.

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

D-218/D-219 now consume this package: exact-source acceptance, invocation lock,
pause/drain, verified staging, selected backup and dependency preservation, targeted
paused restart, actual process/configuration readiness and separately reviewed
resume. Failures keep maintenance and evidence. See CONSOLE-DEPLOYMENT.md. Current
legacy bootstrap still needs a separately reviewed transition;
CONSOLE-MAINTENANCE.md documents the confirmed HTTP404.

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

D-215 strengthens the local acceptance suite before deployment wiring. The old
authentication test read its caller's real ledger and skipped ownership cases when
empty. It now creates two isolated consoles with synthetic ledgers, allocated
loopback ports, fake RPC and blocked subprocess execution. Sixty HTTP checks pass
on Windows and Linux; copied-source owner bypass and wrong cwd both fail for the
intended reason. SIWE 21/21 and the full 22-check console profile pass in
`work/auth-full-profile.log`. These checks still need to be bound to the exact
prepared release's clean source revision before a deployment can claim validation.

## Validate the exact source (D-216)

After preparation, while main is still at the package's source commit/tree:

```powershell
node scripts/validate-console-release.mjs --release C:\path\to\release --expected-sha256 REVIEWED_SHA256
```

The expected metadata SHA is mandatory. The validator requires a clean main,
matching commit/tree and actual source bytes matching every payload hash, before
any acceptance process starts and again after all checks. Both preparation and
validation refuse assume-unchanged/skip-worktree index flags, including flags on
test files. Git status alone cannot reveal such hidden inputs. A self-consistent
package that claims the current commit but contains different source bytes also
fails. These checks use the current local checkout and installed dependencies;
they are not an attestation against a compromised compiler or developer machine.

Each packaged module receives Node syntax checking; each packaged shell receives
actual Bash syntax checking and must already use LF endings. The tool then runs
the console profile, console-only HTML syntax, generation, symbol, option/upgrade
rules, issued-chain ledger consistency and the existing three-contract bytecode
presence check. Contract execution, fresh dependency installation, fork builds,
live service/consensus and public approval remain separate acceptance evidence.
The generation HTTP test now uses its own scratch state rather than the caller's
operational ledger. Its existing fixed ports must be available.

The overall default ceiling is ten minutes, with at most two minutes for ordinary
direct checks. D-218 adds the required isolated deployment drill, allowed up to six
minutes including image preparation; its container has a three-minute watchdog.
`--timeout-ms N` may shorten the overall bound (1–600000).
The tool stops after a failed child, signal, spawn/output error or timeout and
never records a pass when source/package integrity changed during testing. Child
tests retain responsibility for their own spawned-service teardown; the short
timeout control measures a hung direct child, not arbitrary descendant processes.

Evidence is retained under `work/console-validations/`: per-check stdout/stderr
logs and hashes, `validation.json` and its SHA-256. The report binds the release
hash, initial source, platform/Node, deadlines, exit/signal status and outcome.
Precondition failure exits 1 without running acceptance; later failure exits 1
with a failed evidence record. Successful CLI exit is 0 with outcome pass. The
receipt/hash is not a signature, deployment authorization or a live network claim.

Twenty-two actual CLI scenarios in synthetic Git repositories verify the wiring:
clean source/order/log hashes, relative package paths, wrong revisions/branches,
hidden index entries, differing package/source bytes, failed/hung checks, changes
during tests, JS/Bash syntax, CRLF, missing bytecode and invalid/repeated arguments.
The synthetic suite intentionally replaces product checks with small programs;
it proves orchestration, while real-root validation runs the actual product suite.
Evidence: `work/validation-cli.log`, `work/release-validation-test-obYH34`.
The package regression suite remains 26/26 in `work/validation-packager-regression.log`.
The complete local profile passes 23 groups in `work/validation-full-profile.log`.
Real-root packaging/validation must follow the implementation commit; its result
will be recorded separately and does not approve public deployment.

Real-root acceptance on `cef4e4356ff5d04b7adb0c9a094fb1ebbdcf47dd` completed
2026-09-06 21:08:07–21:09:14 UTC. Package: 39 files/564557 bytes in
`work/console-releases/cef4e4356ff5-nvpHVp`, metadata SHA
`8b4b5c1faaf5a36f808c4b4aae152107cf8a13092f4c12259dd50f5b9490a79e`.
All 39 commands passed: 30 Node syntax, one Bash syntax and eight acceptance
commands, including the full 23-group console profile. Source integrity still
matched after tests. Report: `work/console-validations/cef4e4356ff5-EGloFf`, SHA
`4f93de11f59b74e024323fa7b7320ec042fc362de92e731017e12b9e7d530f93`.
Independent verification checked that report hash, all 39 log hashes and zero exits.

This is a preliminary tooling candidate. Later code or even documentation commits
advance HEAD, so a final candidate must be prepared after all tracked changes finish.
Keep final result receipts in ignored work/user outputs rather than changing the
tracked source again merely to record the result. No deployment approval is implied.

D-218 requires scripts/check-console-deployment.mjs as a ninth acceptance command.
It exercises actual deployment CLI against real isolated consoles; inner product,
recursive and public gates are placeholders solely for ordering. See
CONSOLE-DEPLOYMENT.md for plan/apply/resume and current public blockers. Historical
cef4e43 measurements above remain historical; the acceptance inventory has changed.
