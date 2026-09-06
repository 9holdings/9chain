# Reviewed console release deployment

D-218 replaces the old copy-first script with a local controller and verified
Linux installation phases. This is tested local tooling. No public deployment was
performed during the autonomous window. Genesis, validators and chain transactions
are outside this controller's scope.

## Plan, apply, then review resume

Finish and commit tracked changes, freeze a release with
`scripts/prepare-console-release.mjs`, and retain its SHA-256. The Bash entry point
now delegates to `scripts/deploy-console-release.mjs`. Its default is a local plan:

```sh
bash local-net/deploy/console-deploy.sh \
  --release /absolute/frozen-package --expected-sha256 REVIEWED_RELEASE_SHA
```

This verifies exact clean main source and deployment ownership, but makes no SSH
request and creates no deployment state. The printed plan is not approval. Public
application requires the owner's approval of that exact release and target:

```sh
bash local-net/deploy/console-deploy.sh \
  --release /absolute/frozen-package --expected-sha256 REVIEWED_RELEASE_SHA --apply
```

Coordinates come from `local-net/lib/server.mjs`. The CLI accepts `--host`,
`--ssh-key` and `--src` for an explicitly reviewed target. The existing public
ledger gate still measures A1's configured public surface, not an arbitrary SSH
target; do not confuse these two sources of acceptance evidence.

Application proceeds in this order:

1. Exact-source local validation, including the isolated deployment drill.
2. Read-only server audit of manifest files and direct entries in manifest-derived
   directories. Selected-file differences are planned. Other manifest-group
   differences, undeclared orphans, links or incomplete scans block. Exclusions
   and tracked files outside the manifest remain visible; this is not a whole-server audit.
3. Compatible open maintenance API, exclusive invocation lock, another process/
   maintenance observation, then persistent pause and admission drain. A pre-existing
   pause is never adopted. HTTP401/404, timeout and contradictory/changed state stop.
4. Exclusive `console-deployments/<run UUID>` beside live src. Upload the whole
   frozen package into `release`. Hash its shared verifier against the independent
   local anchor before importing it, then verify the exact package. Rehash locally
   streamed lock/maintenance executables immediately before SSH execution too.
5. D-217 bounded backup of old code and selected console state outside live src.
6. Separate dependency directory with frozen package.json/lock and bounded
   `npm ci --omit=dev --ignore-scripts --no-audit --no-fund`. Check an ethers
   signing/recovery round trip, unchanged lock inputs and a file/hash/mode inventory.
   No lifecycle scripts or raw server output are forwarded. Registry retrieval
   occurs only during an approved real apply.
7. Recheck backup/source/runtime, lock and drained identity. Replace selected source
   files atomically one at a time through flushed exclusive temporaries, mode0644.
   Preserve old node_modules as stage/previous-node_modules, then move prepared
   dependencies into place. No recursive deletion or dependency cleanup.
8. Verify installed bytes and unchanged runtime, then invoke targeted restart.
   A different verified listener starts persistently paused. Verify source,
   dependencies, runtime and process identity again. D-219 also requires fresh
   readiness from the replacement: exact A1 network, readable ledger, no unresolved
   creation, drained maintenance and the intended captured startup configuration.
9. Return hashed local deployment.json with outcome paused. Maintenance and the
   invocation lock remain held; success here does not reopen admissions.

After reviewing the paused result, separately approve resume:

```sh
bash local-net/deploy/console-deploy.sh \
  --release /absolute/frozen-package --expected-sha256 REVIEWED_RELEASE_SHA \
  --resume --receipt /absolute/deployment.json \
  --expected-receipt-sha256 REVIEWED_PAUSED_RECEIPT_SHA
```

Resume binds receipt/release/target/invocation, repeats local validation, verifies
the lock, backup, phase receipts, installed bytes, runtime and replacement process,
and runs exact remote audit plus existing public drift and chain-ledger gates.
The intended configuration digest from backup must remain stable through every
phase; actual process readiness is repeated before resume (CONSOLE-READINESS.md).
Only then does it send one resume operation and release its lock with a receipt.
It uses `--ssh-key` for drift, fixing the old `--key` typo. A public-gate failure
keeps the original paused receipt usable for a later reviewed attempt. An uncertain
resume is never retried.

## Failure and evidence

Each mutating remote phase first creates an exclusive started record. Reusing a
run/phase, taking over an old lock or overwriting a backup is refused. Partial
replacement can leave mixed source files; pause, old dependencies, backup, stage,
attempt markers and local phase receipts remain for inspection. No automatic
rollback, state restore, journal clearing, lock stealing or cleanup.

Local evidence: work/console-deployments, with hashed per-phase JSON and a final
receipt. Failure identifies its phase and last confirmed observations; remote state
may be uncertain after disconnect. Private keys/tokens are never arguments or report
values. Existing console.env is loaded silently on-server. Hashes are not signatures
or approval. Dependency inventory accepts regular files/real directories only,
<=10000files/256MiB; links require a reviewed policy. Backup limits/exclusions are
in CONSOLE-BACKUP.md. Retained dependencies are not a portable full-node backup.
D-219 binds24 explicit environment inputs and probes application/network readiness;
see CONSOLE-READINESS.md for its scope. Referenced configuration-file contents, binary
attestation, consensus liveness and recovery beyond selected files remain separate.

SSH/SCP, package-manager and helper children have finite deadlines. Local validation
still has a ten-minute ceiling. Ordinary checks get <=120s; the deployment drill
gets <=360s for image preparation and its bounded run. Its container has an independent
180s watchdog even if the parent is interrupted; no general process-tree cancellation claim.

## Current public blockers

The last read-only maintenance probe returned HTTP404 on the legacy public console.
The new routine refuses that starting point. First adoption needs a separate reviewed
plan to close ingress, establish old work has drained and install maintenance-capable
code. Old running:false does not prove zero admitted/queued work. Caddy/web changes
belong to web-home; this controller does not edit them.

The last drift inventory also found undeclared local-net/deploy/heartbeat-deploy.sh.
Resolve it with an exact ownership/retention decision, not a broad exemption,
execution, deletion or silent restoration. Existing authorized heartbeat traffic must
not be stopped for this upgrade. The new audit has not yet been run against the live
server with this final package.

## Local evidence, 2026-09-06

`node scripts/check-console-deployment.mjs` exercises the actual Bash/controller CLI,
SSH/SCP adapters that reject any non-fixture destination, real consoles, real source/
dependency files, actual offline npm ci and the targeted restart helper. A second
console keeps its process. Docker has no network, ports or socket, read-only root,
2GiB/2CPU and bounded executable tmpfs. Only selected source/synthetic fixtures enter.
Image preparation uses a Dockerfile/package-lock-only context and package registries.

33 CLI scenarios pass: local plan/noSSH, foreign-controller-root refusal, local-check failure, full paused install,
bad receipt, failed public gate, installed drift, resume, orphan/nonselected drift/
link/401/404/pre-existing pause/held lock, failed/altered upload, backup/npm failure,
source/dependency changes after backup, partial copy, refused restart, hanging SSH,
changed frozen client before SSH, and real resume with its response deliberately
lost, configuration drift after backup/restart, wrong loaded configuration, wrong
network and wrong parent chain. No automatic resume/replay or unrelated-console restart. Inner product and
public gates are explicit placeholders for ordering, not public acceptance evidence.
The real repository's product suite remains separately required.

Repeated integration exposed intermittent HTTP pool reuse of the old listener.
Operator requests now send Connection: close. The 33-case actual client suite
includes a peer that drops reused connections; removing only the header fails that
case for the intended reason. This is narrower than a universal explanation for
every connection failure. Evidence: work/maintenance-connection-negative.log,
work/maintenance-connection-negative-DFMNic.

Deployment: work/console-deployment-linux.log,
work/console-deployment-2A3qzZ/evidence (28 cases, exited0/noOOM).
Earlier failing runs exposed the connection race and a fixture-only executable-tmpfs
requirement; both were corrected before acceptance. The drill is now required by
release validation. Full24-group profile passes in work/console-deployment-full-profile.log.

D-219 expands the profile to26 groups and deployment drill to33 cases. Current
logs: work/console-readiness-full-profile.log, work/console-readiness-deployment.log;
deployment evidence work/console-deployment-qOKgGt/evidence, exited0/noOOM. Separate
actual-console and readiness-client tests pass on Windows and Linux; see
CONSOLE-READINESS.md for negative controls and limits.
