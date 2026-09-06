# A1 autonomous development window

- Start: 2026-09-06 16:23:12 UTC (20:23:12 Dubai).
- Hard work deadline: 2026-09-07 02:23:12 UTC (06:23:12 Dubai).
- Heartbeat: `n-ng-c-p-a1-trong-10-gi`, current task, every 15 minutes.
  A final scheduled wake after the work deadline is for reporting/pausing only.
- Local development/build/test/commit authorized. Public deployment/publication,
  validator/genesis changes, public transactions and data deletion still require review.
- Worktree scope: main. Leave web-home, audit and other running services alone.
- Do not promise ten hours of uninterrupted runtime: local scheduling depends on
  the machine/app staying available and account capacity.

## Priorities

Reporting preference updated by the owner: send a brief Vietnamese progress report
roughly hourly (completed/current work, test results, blockers/approvals), plus
significant milestones or actionable failures. Combine nearby updates to avoid
repetition. Last user-facing progress update: **2026-09-06 20:48:14 UTC** (D-215 milestone).
Keep this timestamp current across scheduled runs; the work deadline is unchanged.

1. Verify build inputs and reproducible local validation before new features.
2. Review console creation/recovery for lost state, duplicate operations and stale RPC readiness.
3. Implement bounded fixes with HTTP/local integration tests and negative controls.
4. Prepare resource measurements and public deployment acceptance/rollback steps.
5. At deadline, stop starting changes, record final commit/test/limitations summary.

## Evidence and next action

- Baseline commit: `8192778`; fork tree `387238778dda96d58cabe6f9ddd7097e208b69e9`, clean.
- Docker engine is reachable. Many unrelated containers run on this machine;
  do not stop them or assume default ports/resources are free.
- Console HTTP tests (real process, fake node): options 56/56; governance 55/55.
  These verify API wiring and failure paths, not consensus or a live rollout.
- Found root Docker ignore policy does not exclude local operational config,
  network key directories or node_modules from the supplied context. Added a
  Dockerfile-specific source allowlist. Real Docker synthetic probe passes:
  3 required paths included, 11 unrelated paths excluded. Removing the policy
  exposes synthetic operational files as expected. Evidence in ignored
  `work/node-context-MMRsDJ`; no real keys used.
- Context policy committed as `ef47b96`.
- Full Dockerfile build completed using cached compilation layers. New local tag:
  `9chain-a1/node:autopilot-20260906`, digest
  `sha256:aec9636e4d1d6ed45bbab0a1338b2d3aab08d07ae139958015a7512c746e267f`.
  Context transfer: 53.80 MB. This is not a fresh uncached compiler run.
- Isolated version container (`a1-autopilot-version-20260906`, exited, network none,
  read-only, 1 CPU/256 MB): `9chaingo/1.14.2`, rpcchainvm 45,
  commit `9chain-a1-g1-27patch-38723877`, Go 1.25.10. No node network started.
- D-199 local console fix: pause response no longer promises the retired 01/09
  rebuild/erasure. Real HTTP regression was red on the old text and passes now.
  `node scripts/check-local.mjs --console`: all nine checks pass. Public deployment pending.

## Next work item

D-200 completed locally: corrupt/unreadable ledger now blocks operations; missing
ledger with backup or pending write also requires recovery. Legacy `retired`
omission still works. Options HTTP suite 94/94; governance 55/55; nine local checks
pass. Negative control on the original implementation: 25 failures. Not deployed.

Review `launchChain` in `local-net/console/server.mjs`: it submits P-chain creation,
then restarts nodes and waits for RPC, and only afterwards calls `saveState`.
Investigate durable recovery/reservation before irreversible operations; do not
blindly retry CLI transactions on uncertain outcomes.

D-201 now verifies the returned hexadecimal chain ID matches the plan. Nine
actual-console HTTP fixture cases pass (synthetic node, intercepted Docker):
matching IDs, transient error recovery and six invalid/mismatched responses.
The six bad responses were false successes before the fix. All ten local checks
pass; log `work/check-local-console-20260906.log`. Not deployed.

D-202 adds the shared RPC helper with a 10-second deadline for headers/body and
HTTP/JSON-RPC envelope checks; creation RPC wait uses a 150-second wall deadline
with at most five seconds per probe. Seventeen local transport cases pass; real
console hung-node queue times out near 10s and recovers. Options 105/105, RPC
creation 9/9, governance 55/55; eleven local checks pass. New runtime dependency
is in the deploy manifest. Read-only live network/version calls succeed too;
public console remains unchanged. Full 150-second exhaustion not yet timed.

D-203 implements a single persisted pending creation before CLI submission.
Keeps plan, exact genesis-byte hash, phase and IDs; blocks retries and other chain
mutations after failure/restart. Successful ledger writes are followed by journal
archival. Ten actual-console synthetic RPC/Docker scenarios and journal file tests
pass; twelve local checks pass. Read `docs/CREATION-RECOVERY.md` before further work.
No real public submission, restart or recovery was performed.

Next priority after D-212: integrate the maintenance protocol into the deployment
path and prepare owner-reviewed bootstrap/rollback for the current legacy server.
Read `docs/CONSOLE-MAINTENANCE.md`: the new API is local, deployment script is still
unchanged and unsafe to assume updated. It copies before checking busy state, fails
open on unreadable progress, and ships console only before checking all groups
(operator inspector is missing on server). Move local tests before network writes,
require pause/drain before release copy, retain pause through restart and read-only
validation, and fail closed on legacy/unreadable state. Prepare and test locally;
do not run public mutations. SSH works with existing credentials, never print them.
New-chain bootstrap still needs real integration acceptance.
The standalone client now exists at local-net/deploy/console-maintenance.mjs and
runs over SSH stdin, so no helper copy is required before pause. Default --status
is read-only; pause-and-wait validates and drains, assert-paused checks identity,
resume requires current UUIDs and never retries uncertain POST. Use this shared
client instead of shell grep/JSON fragments. Actual SSH status returned HTTP 404
at 19:39 UTC: the public process is legacy and automatic bootstrap must refuse.
The release packager is now scripts/prepare-console-release.mjs. It freezes the
console/operator manifest union (including lock, restart helper and manifest) from
clean committed main, verifies hashes and exact inventory, and accepts an external
expected SHA for review. See docs/CONSOLE-RELEASE.md. It does not run acceptance
tests or deploy; a package is not automatically approved. Use frozen bytes for the
next deployment script, not changing working-tree files. Legacy script still uses
npm install and the old root-level restart helper; both need integration work.
Do not add blind resume/retry/discard endpoints. Recovery must establish
what P-chain already accepted and preserve all artifacts before mutation.
Preserve the public ledger/API contract. Matching chain ID does not prove block
production or all-validator readiness. Cold build and patch replay are now measured
in D-207; live multi-node consensus remains unverified in this window. No public
create/upgrade in tests.

D-204 now tests a hard process crash during unresolved CLI submission. All eleven
creation HTTP scenarios pass. Disabling the fixture pause gives exactly one failure:
the client request had already settled, so it is not the required crash boundary.
The killed process leaves a `submitting` reservation; fresh processes block a second
submission and other chain mutations. Evidence: `work/create-hard-crash-negative.log`.
This proves the local process-crash case, not actual CLI acceptance on P-chain or
power-loss recovery. No runtime behavior changed in this test-only follow-up.

D-205 flushes both backup and replacement ledger, with POSIX directory sync, before
creation intent can be archived. Unfinished writes block new mutations and remain
untouched. Actual-console injection proves a failed ledger flush leaves the journal
and blocks retry across restart; buffered-write negative control falsely returns
HTTP 200. Thirteen local checks pass (creation 12/12, options 116/116, governance
55/55). Linux `node:24-alpine` container `a1-autopilot-ledger-linux-20260906` exited
successfully after real-file fault tests including directory sync failures. It has
network disabled and synthetic scratch inputs; test data is tmpfs, not a hardware
power-loss test. No public operations. Read D-205 and recovery documentation for
the visibility-after-rename limitation. Ledger schema remains unchanged.

D-206 adds `scripts/inspect-creation.mjs` (offline unless `--rpc` supplied), with
read-only CLI fault tests and shared console parsers. It never authorizes recovery;
all matching pending jobs still return exit 1. Wrong network gates chain reads;
transaction/genesis/EVM evidence and artifact changes are checked. Read-only live
compatibility succeeded on a synthetic reservation for Adam Chain, not a real server
pending job. Logs: `work/inspect-creation-profile.log`, `work/inspect-creation-negative.log`,
`work/inspect-creation-live-profile.log`. Read D-206 and recovery docs for limitations.
Final verification: 29 CLI scenarios plus unsafe-argument controls pass; fourteen
local checks pass (creation 12/12, options 116/116, governance 55/55). Console imports
22 files; operator tool group imports 6, all present in their manifest groups.
Resource inventory at approximately 18:15 UTC: Docker has 24 CPUs and ~31.2 GiB
memory; Windows reports ~23.3 GiB free. No A1 validator node containers appeared in
the running name-filtered inventory; faucet/dashboard/explorer and other projects
remain active. Verify disk space and source/build scripts before a bounded cold build.

D-207 completed local source/build baseline: full and minus-one patch replay match.
Two independent fresh-cache Linux builds pass and all five binaries compare
byte-identical. The node starts for version reporting in isolated Debian. Selected
Go core tests pass in a network-disabled container: 16 packages, 195 top-level tests,
218 subtest pass events, 0 failures; eight packages have no tests. All build/test
containers have exited successfully; none needs ongoing polling. No original fork,
patch, validator/genesis or public state changed. Read the detailed build report
for paths, hashes, limits and the distinction between a binary build and network
acceptance. Artifact directories, build volumes and scratch replay clone are retained.

D-208 now checks every managed node's L1 health and chain ID after the full rollout
and public RPC check. One fresh round must pass for all; stale successes are not
combined. Shared 90-second deadline, concurrency three, bounded/abortable node probes.
Original code returned false HTTP 200 on a wrong non-RPC node; regression now passes.
Sixteen actual-console fixture scenarios and fifteen local checks pass. A separate
real 90-second missing-L1 fixture preserves the journal and blocks retry after
restart; it also passes. Logs: `work/node-readiness-full-profile.log` and
`work/node-readiness-slow.log`. No checks are still running. Public deployment and
real managed-validator rollout acceptance remain pending. Read D-208 and API/recovery
docs before further work. Do not move the new-L1 check into the per-node restart loop.

D-209 validates the extracted production Docker RPC transport using real isolated
Compose/curl containers and synthetic RPC. Correct/wrong identities, protocol errors,
stderr, client deadline (~1.52s), explicit abort after server entry and no stranded
curl pass. Removing curl's independent timeout fails on the still-active request.
Evidence: `work/managed-rpc-QGfRSp` positive, `work/managed-rpc-yMQIED` negative,
`work/managed-rpc-full-profile.log` (15 local checks). Containers are stopped and
retained. SSH-only reads found existing Adam Chain healthy with the right ID on 9/9
nodes at 19:08 UTC; `work/managed-nodes-live-20260906.json`. Public drift is expected:
26 matching, 2 changed, 7 missing files. No public changes. See D-209; next priority
above is the deployment path, especially fail-open busy checks and group coverage.

D-210 adds persistent maintenance admission, counting authenticated mutation
handlers from before body reading through preflight/queue/execution/finally. Pause
persists across restart, stale observations cannot reopen, file/sync errors fail
closed. Actual HTTP negative proved rollout progress false while two mutations
were already admitted. HTTP and real-file tests pass, also POSIX sync faults in
isolated Linux. Seventeen local checks pass (`work/maintenance-full-profile.log`),
Linux log `work/maintenance-linux.log`; container exited, no ongoing jobs. Console
manifest reaches 25 dependencies. Legacy deploy integration still outstanding;
new API alone does not make that script safe. No public mutations.

D-211: standalone maintenance client passed 32 actual local CLI/HTTP scenarios
including stdin. A copied negative client without readiness/count consistency
failed on contradictory success. Read-only SSH confirms HTTP 404 refusal on legacy
server, no changes. Logs `work/maintenance-client-full-profile.log`,
`work/maintenance-client-negative.log`, `work/maintenance-live-read.json`.
Client is included in the operator manifest. Eighteen local checks; deployment
script integration and exact reviewed release/rollback still next. Do not call
pause/resume publicly until the complete proposed deployment is approved.
The production client also passes the actual isolated console API integration
(`work/maintenance-client-console.log`). Before wiring the legacy deploy script,
prepare frozen release bytes and hashes from the console/operator manifest groups;
the existing deploy script currently checks drift across all groups while shipping
console only. Keep source/state backups outside running code, include the real
restart helper, and prove ordering with actual Bash plus stubbed SSH/SCP effects.

D-212: local frozen release tool, 26 actual Git/CLI/file controls; nineteen local
checks pass (`work/console-release-full-profile.log`). Manifest gained tracked npm
lock and restart helper. Fresh npm ci in isolated Node Alpine loaded ethers 6.17.0
and passed synthetic signing/recovery; container a1-autopilot-console-lock-20260906
exited 0/no OOM (`work/console-lock-check.log`). No public changes. The package tool
must be committed before real-root preparation because it requires a clean main;
such a preliminary package is tooling evidence, not a final approved deployment.

Real-root packaging after commit 0ae39f1 succeeded: 38 files, 560601 bytes,
`work/console-releases/0ae39f1929eb-CRIO7B`, metadata SHA-256
`542d5bfc737383a3a023234f303981f22b52b2de29408fed4f580362d3b8ba7b`.
Independent CLI verification with that expected hash also passes. Receipt:
`work/console-release-real.json`. This is a preliminary tooling package, not the
final deployment candidate; later controller changes require a newly prepared one.

Expanded read-only drift at about 20:00 UTC now covers 39 files: 27 matching, 2
changed, 10 missing, **1 undeclared orphan** (plus 4 declared /19 outside coverage).
Log `work/deploy-drift-release-20260906.log`. The orphan is
`local-net/deploy/heartbeat-deploy.sh`: 8973 bytes, SHA-256
`31fe596208459f714976591be7fff60d27609ff3a466ec2fb41e20a14b3e7ae6`, exactly matching
the existing file in web-home. D-193 intentionally imported only the pump STOP gate
from orphan commit 6793fb4, not its four pump files; main's pump is newer. D-194
assigns this helper to main, but it is still absent here. Do not delete/run/restore
it blindly or exempt a whole directory just to get green. Resolve its intended
retention/ownership with a precise reviewed decision before public deployment.
All server actions so far remain read-only; no source or secret contents were
copied for this investigation, only hashes/size and existing Git history compared.

D-213: console-restart.sh now requires exact paused process/pause UUIDs, identifies
one listener with ss, validates Node executable/cwd/entry argument, rechecks before
SIGTERM to that PID only. Waits for exit and free port; no force kill. Replacement
starts with A1_CONSOLE_START_PAUSED=1, persists its own gate before listening, must
have a different instance/PID in the expected tree and remain ready/paused.
No automatic resume. Malformed startup policy refuses boot.

Two actual consoles tested in bounded network-none Linux container with synthetic
credentials and source-only inputs. Positive scratch `work/console-restart-so0QC8`:
open/busy/stale IDs/foreign cwd refused, target replaced, unrelated process survives,
no ledger/genesis writes. Legacy helper from 34da214 actually sends SIGTERM to the
unrelated process; same survival assertion fails for that reason in
`work/console-restart-yR7MR3`. Logs: `work/console-restart-linux.log`,
`work/console-restart-negative.log`, `work/console-restart-full-profile.log` (19 pass).
Both containers exited, no OOM or jobs to poll. New optional reusable check:
`node scripts/check-console-restart.mjs [--negative-legacy]`. Fixture image builds
with registry access; runtime has no networking/ports/socket/operational data.

Next: replace the legacy console-deploy.sh flow using frozen union release,
local validation before server changes, stable pause before copy, retained backup,
hash/import checks, this source-tree restart helper and controlled resume. Current
public legacy API 404 cannot safely use this path without separate reviewed first
bootstrap. The old deploy script still invokes an unverified root-level helper;
do not run it. No public changes made. Preserve the unexplained-to-manifest helper
drift noted above until a precise ownership/retention decision is reviewable.

D-214: replaced same-host/branch/commit lock reentry and automatic TTL takeover
with a unique invocation UUID, strict atomic acquisition and explicit assert/release.
Standalone Node backend travels over SSH stdin (only tested locally so far),
base64 JSON coordinates prevent shell path interpolation. New holder.json/schema2
deliberately omits legacy holder: actual old clients refuse it and cannot take
over or release it. New client refuses legacy/incomplete/corrupt/extra material,
old age and retries. Release atomically records exact original actor/optional release
SHA before removing only its record and empty directory; errors preserve evidence,
including incomplete states. No automatic lock recovery. Operator manifest includes
backend. Read `docs/DEPLOYMENT-LOCK.md` before wiring the deploy controller.

Evidence: old actual Bash helper from a9167c5 lets a second independent process
acquire; correct negative assertion in `work/deploy-lock-negative.log`, scratch
`work/deploy-lock-P9ErMw`. New: 38 CLI/wrapper checks, eight concurrent contenders
produce exactly one winner; wrapper self-test also passes in
`work/deploy-lock-bash-self-test.log` / `work/deploy-lock-07vugT`. Twenty local checks
pass in `work/deploy-lock-full-profile.log`. Linux backend 32 checks pass with
real POSIX directory flushes, network-none/read-only-source/tmpfs, 512 MiB/1 CPU:
`work/deploy-lock-linux.log`; a1-autopilot-deploy-lock-linux-20260906 exited0/noOOM.
No public lock was acquired/released, no remote files changed. Current code still
needs frozen-source deployment orchestration and a separately reviewed legacy
bootstrap. Do not run legacy console-deploy.sh. Next work should integrate these
components, preserving local validation before server mutations and gate beforecopy.

D-215: rewrote auth-e2e-test.mjs in English because the deploy's old auth test read
the real cwd ledger, used fixed ports and skipped owner checks when empty. It now
uses synthetic owned/system chains in unique scratch roots, dynamic loopback ports,
fake RPC, unique synthetic operator token and an import preload blocking every
child-process launch. Tests exact 401/403/400/429 boundaries, signing/replay/wrong
signer, recovered identity, confirmation, per-wallet quotas and operator bypass;
asserts original ledger bytes/no outputs/no process launches. All 60 HTTP checks
pass with no ownership skips; existing SIWE 21/21 also included in local runner.

Copied-source negatives disable only owner check or switch only cwd to a separate
synthetic sentinel ledger; both fail the intended assertions. No real operational
ledger/keys used. `work/auth-negative-If3xiq`, `work/auth-negative.log`; runner
`work/auth-negative.mjs`. Positive `work/auth-isolated.log`; Linux also 60/60 in
network-none, read-only-root/source, 512 MiB/1 CPU, synthetic tmpfs with 60s deadline;
`work/auth-linux.log`, inputs `work/auth-linux-N9ZV9Z`; container
a1-autopilot-auth-linux-20260906 exited0/noOOM. Initial Windows preload used a path
where Node --import needs a file URL; fixed with pathToFileURL before acceptance.
Full `work/auth-full-profile.log`: 22 checks pass. English debt down 109 lines to
5520/105. No public changes. Next bind local validation to release source identity,
then integrate pause/backup/copy/restart/verification using D-211 through D-214.
