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
repetition. Last user-facing progress update: **2026-09-07 01:28 UTC** (D-22547-command exact-source acceptance verified; D-22634 deployment scenarios pass including real bounded directory enumeration; preparing final freeze and owner handoff).
Keep this timestamp current across scheduled runs; the work deadline is unchanged.

Final candidate checkpoint D-226: required fresh source-bound validation and its
independent log/hash check use work/run-d226-validation.mjs and
work/verify-d226-evidence.mjs. Receipts are work/d226-release-real.json,
work/d226-validation-result.json, work/d226-evidence-verification.json and
work/d226-deployment-plan.json. These receipts, if successful and still bound to the
clean HEAD, supersede earlier source acceptance. Preserve failed historical runs.
After acceptance, focus on the owner handoff and read-only checks; do not advance
HEAD merely to copy receipt hashes into tracked documentation. Final user-facing
deliverables belong in the configured outputs directory. At02:23:12 UTC stop code/
build work, report measured completion/limits and pause the existing heartbeat via
the automation tool. Do not disturb the separately authorized public traffic pump.

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

D-216: exact-source release validator now requires expected package SHA, clean main
at the same commit/tree and actual runtime source hashes before/after acceptance.
Packager and validator reject assume-unchanged/skip-worktree flags, including on
tests; main has zero such flags. Checks Node/Bash syntax on actual payload, requires
LF shell bytes, runs the 23-check console profile and preserved HTML/generation/
symbol/options/upgrade/issued-ledger/artifact gates. The generation fixture now
keeps its state in scratch (13/13), though its fixed ports remain. No public calls.

Twenty-two actual validation CLI cases use synthetic repositories/programs and
prove wiring, not product behavior: precise source identity, expected hash,
ordered checks and hashed logs, hidden inputs, altered self-consistent package,
failure, a real hung child, source/package edits during checks, syntax/CRLF/bad
artifact and CLI refusal. `work/validation-cli.log`, scratch
`work/release-validation-test-obYH34`. Package regression26/26; local profile23/23:
`work/validation-packager-regression.log`, `work/validation-full-profile.log`.
Overall budget starts before source checks and is checked after final integrity;
direct children have <=120s within <=600s overall. A shorter CLI timeout is allowed
but cannot skip checks. Nested tests own their service teardown; no arbitrary
process-tree cancellation claim. Reports/log hashes retained under work/console-validations.

Commit this implementation before real-root packaging/validation, which requires
clean main. Record the actual package/report hashes afterwards; it is still a
preliminary tooling candidate until deployment-controller integration is complete.
Next: consume frozen validated inputs, pause/drain, preserve code/state outside
live directories, verify copy, targeted paused restart and controlled resume.
Use D-214 lock backend; do not run legacy console-deploy.sh or bypass live API404.

Real-root acceptance after implementation commit cef4e43 succeeded at
21:08:07–21:09:14 UTC. Source commit cef4e4356ff5d04b7adb0c9a094fb1ebbdcf47dd,
tree fdc3b03afdcefef7c6e7e265457192d3ea242ade. Package39 files/564557 bytes:
`work/console-releases/cef4e4356ff5-nvpHVp`, metadata SHA
8b4b5c1faaf5a36f808c4b4aae152107cf8a13092f4c12259dd50f5b9490a79e.
Validation39 commands =30 Node syntax +1 Bash syntax +8 acceptance commands
(including the 23-group console profile), all pass; source still matched afterwards.
`work/console-validations/cef4e4356ff5-EGloFf`, validation SHA
4f93de11f59b74e024323fa7b7320ec042fc362de92e731017e12b9e7d530f93.
An independent read verified that SHA and all39 log hashes/zero exits at21:10 UTC.
Receipts: `work/validated-release-real.json`, `work/validation-real-result.json`;
runner `work/run-real-validation.mjs`. No checks are still running.

This remains tooling evidence, not the final approved deployment candidate. The
documentation commit recording this evidence advances HEAD; exact-source validation
deliberately refuses to reuse the old package at a different HEAD. For the FINAL
candidate, finish tracked code/docs first, commit, then freeze/validate and write
its review receipts only into ignored work or user outputs. Do not create an endless
repackage cycle by committing result receipts after every successful validation.
Next bounded implementation is deployment orchestration/backup; prerequisites
D-210 through D-216 are now tested. No public mutation has occurred.

D-217: selected old source/state backup is implemented, with shared release
inventory/verification extracted into local-net/lib/console-release.mjs. CLI defaults
to inspection; creation requires a verified proposed release and empty marker,
plus external invocation lock and drained process proof. Bounded copies outside
live src preserve absences, raw corrupt state and original modes. Exact independent
tree/hash/topology verification rejects incomplete or tampered evidence. No restore,
delete, restart or network. See docs/CONSOLE-BACKUP.md for scope and limitations.

Windows33 CLI +4 real-file fault controls and Linux33+5 pass. Logs
work/console-backup-test.log and work/console-backup-linux.log; Windows scratch
work/console-backup-test-wyVgOn, Linux inputs work/backup-linux-GklNBk. Container
a1-autopilot-console-backup-linux-20260906 exited0/noOOM, isolated512MiB/1CPU.
Packager26 regression passed after shared-library extraction; full24-group profile
passes in work/console-backup-full-profile.log. Operator import closure now10,
console25/faucet3 unchanged. Next replace legacy deploy orchestration. Do not run
the old deployment script publicly or bypass the known live maintenance API404.

D-218: legacy console-deploy.sh is now a six-line English wrapper for
scripts/deploy-console-release.mjs. Default plan is local/read-only. Explicit apply
requires exact-source acceptance before SSH, audits source/orphans, requires open
compatible maintenance, locks, pauses/drains, stages/independently verifies a frozen
package, backs up, installs frozen lockfile dependencies separately, verifies/replaces
selected source/deps and performs targeted paused restart. Remote console-install.mjs
requires lock/identity and hash-bound phase records; exclusive attempt markers refuse
retries. Resume is separately reviewed and repeats acceptance, exact remote audit,
public drift/ledger gates, then one resume and lock release. No public action taken.

28 actual Linux controller CLI cases pass with real consoles, files, offline npm ci
and restart. Inner product/public acceptance programs are explicit placeholders for
ordering, not live acceptance. Other console survives. Matrix includes401/404,
orphan/nonselected drift/links/pre-existing pause/held lock, upload tampering/failure,
backup/npm/copy/restart failures, source/dependency drift, hanging SSH, frozen client
tampering before streaming, failed resume gates and actual lost resume response.
Logs work/console-deployment-linux.log; latest accepted evidence
work/console-deployment-2A3qzZ/evidence, exited0/noOOM, isolated2GiB/2CPU/no network,
ports or socket. Runner now builds from node:24-alpine with only Dockerfile/package
inputs; no dependency on a manually prepared local image. Container watchdog180s.

Repeated tests exposed an old HTTP pooled connection reused after restart. The
maintenance client now requests Connection: close;33 CLI cases pass. A deterministic
peer drops a reused connection; removing only the header fails that case with the
connection error. work/maintenance-connection-negative.log and
work/maintenance-connection-negative-DFMNic. Initial fixture noexec-tmpfs issue fixed;
two pre-fix restart failures were not counted as acceptance. Full24 groups pass in
work/console-deployment-full-profile.log. Operator closure11; English debt5411/104.

Release validation now includes the Docker deployment drill as a ninth acceptance
command, <=360s for that command within600s overall; other direct checks remain120s.
Run real-root freeze/validation after committing implementation/docs. Current public
legacy API404 still blocks normal apply; undeclared heartbeat-deploy.sh still needs
exact review. Next useful work: bind startup/environment and actual console/network
readiness before reviewed resume, then prepare final public adoption/recovery packet.

D-218 implementation committed as dcd3f758cbc493ad776a44c58fdcd8716cfb4e47,
tree f9ea9bb67c371d16e0bbe6b652f737afe64925c5. Actual-root acceptance completed
22:21:27–22:24:07 UTC:42 files/604082 bytes,33 Node syntax +1 Bash syntax +9
acceptance commands =43 passed, including the full24-group console profile and
actual28-case Docker deployment drill. Container a1-deployment-console-deployment-pqclen
exited0/noOOM. Source still matched after tests. Package
work/console-releases/dcd3f758cbc4-WjWEKX, SHA
4e516f8b847c2ea0d915bcfcd29fd8ce4ffb8dee61c771f33d6bd4b34a37f478.
Validation work/console-validations/dcd3f758cbc4-VArsyz, SHA
3efccdf1afcaebb0efd9bd778c5aa40b8e4b93113d38dd6ecce7c39584094c0b.
Independent verification checked the report and all43 log hashes/zero exits at
22:26:11 UTC, then ran the real controller's local default plan successfully.
Receipts work/d218-release-real.json, work/d218-validation-result.json,
work/d218-evidence-verification.json, work/d218-deployment-plan.json;
runner work/run-d218-validation.mjs. No processes from this acceptance remain running.

This is a preliminary integration candidate, not the final approved public release.
Recording its evidence advances HEAD and therefore intentionally makes the old
package ineligible for current-source application. Do not repackage documentation
alone repeatedly. Finish further code/docs before the final freeze. Next bounded
work is D-219 readiness/environment binding; notes in work/d219-design.md. Current
controller proves source/deps/process/selected-state integrity, not independently
that the restarted process loaded the intended configuration or is connected to
the expected node. Public first adoption remains separately review-gated.

D-219 completed locally: operator readiness captures immutable startup identity for
24 explicit environment settings, checks four fresh RPC identities/format within
3s/64KiB each, reads strict ledger/journal and reports maintenance state. The client
requires nonce/expected configuration/exact drained process IDs,200JSON and5s/64KiB,
no redirects/retries. Deployment binds intended on-server configuration from backup
through every phase and requires actual replacement readiness before success/resume.
Old maintenance-capable versions can upgrade; old public API404 is still a blocker.

40 client and31 actual-console tests pass on Windows/Linux,22 RPC cases pass,33
actual Docker deployment CLI cases pass including configuration drift after backup/
restart, wrong loaded setting and wrong network/parent. Full26-group profile passes.
Two copied-source negative controls fail at the intended configuration/startup
assertions. See docs/CONSOLE-READINESS.md for logs, scratch paths and limitations.
Containers a1-autopilot-readiness-linux-20260906 and
a1-deployment-console-deployment-qokggt both exited0/noOOM, verified22:57 UTC.

Next: commit D-219, freeze and validate that actual commit once; then prepare the
public first-adoption/recovery review packet. Do not claim live readiness, binary
attestation, consensus or capacity from this local work. No public mutation.

D-219 implementation commit72837200eb8956379283f0e5d98e89059a799fda,
tree831ff679d8bce82b9d7350603f87785d7c9e7cb3. Actual-root acceptance completed
23:00:55–23:04:23 UTC:43 files/615481 bytes,34 Node syntax +1 Bash syntax +9
acceptance commands =44 passed, including26 local groups and33 actual Docker
deployment scenarios. Source still matched after tests. Package
work/console-releases/72837200eb89-1oO0Ur, SHA
50aea5bea19d35c0df3bf23d64fb45caa15f9528410b350e1179679bb61281b6.
Validation work/console-validations/72837200eb89-0rGh3k, SHA
aa13c918a42bad5887b6ae802a9ab7b48467c565c66b120ca29b1148e56eab1c.
Independent verification checked report/all44 log hashes/zero exits23:04:36 UTC,
then the actual controller default local plan passed with no SSH or deployment state.
Container a1-deployment-console-deployment-x1hrum exited0/noOOM. Receipts
work/d219-release-real.json, work/d219-validation-result.json,
work/d219-evidence-verification.json, work/d219-deployment-plan.json;
runners work/run-d219-validation.mjs, work/verify-d219-evidence.mjs.

Fresh read-only transport23:01:43 UTC against this release still blocks on
undeclared local-net/deploy/heartbeat-deploy.sh and maintenance HTTP404.
work/d219-live-read.json records both refusals; no mutation was attempted. The
audit throws on blockers, so this receipt does not contain a complete source count.
Do not reuse earlier counts as current. The current first-adoption analysis is in
work/first-adoption-review-notes.md. Key gap: old process has no complete admission
or durable creation journal; closing ingress or seeing running:false cannot prove
drain, and D-217's selected backup excludes old console-tmp creation artifacts.
Prepare exact artifact inventory/reconciliation and a rehearsed transition before
presenting executable public adoption. Do not bypass normal deployment with a
synthetic maintenance receipt or claim the33-case routine drill covers bootstrap.

Recording acceptance advances HEAD; this package is historical evidence for the
implementation commit, not the final approved/current-source release. Finish next
code/docs before freezing another candidate. About3h18m remained at23:04:36 UTC.

D-220 implemented local/read-only bidirectional ledger/P-chain inventory. Explicit
file and RPC origin, strict bounded file/HTTP/RPC identities, actual C/X aliases,
two matching normalized inventories, repeated network identity and unchanged input
file. At most10 fixed read calls/30s RPC budget,4MiB/10000 entries. Exposes unlisted,
mismatched and duplicate identities; retired registrations remain accounted for.
Never contacts ledger-provided URLs, writes state, imports chains or authorizes recovery.

74 actual CLI/file/HTTP cases pass Windows/Linux. Two copied-source negatives fail
the actual unlisted/unstable CLI assertions. Docs/CHAIN-INVENTORY.md lists exact logs
and limits. Linux a1-autopilot-inventory-linux-20260906 exited0/noOOM, verified23:16.
Actual public read23:16:05–23:16:11 UTC aligned13 registered=2 primary+11 active,
0 retired/unlisted. Public ledger before/after was DYNAMIC and byte-identical. Receipt
work/chain-inventory-live-evidence.json/report work/chain-inventory-live.json; runner
work/inventory-live.mjs. Initial scratch probe used RPC origin for the ledger route
and was refused; corrected to the existing publicLedgerUrl() site source before the
accepted measurement. No secrets/public mutation. Operator import closure14, console26,
faucet3; local profile now27 groups. Commit and exact-source acceptance next.

This fills registration comparison only: subnet-only creation, mempool/pending work,
unrecorded legacy genesis artifacts and actual old process drain are still unproven.
Next useful work: bounded read-only inventory of legacy console-tmp artifacts and
concrete first-adoption/recovery packet; do not infer that aligned means safe to
restart/resume. Existing API404/orphan blockers remain. No automatic bootstrap bypass.

D-220 implementationadb64e3c45727f2077b52ecd13386d9eecd00a70,
tree476e77c54be49edd60c97991c447bac9f2171f42. Actual-root acceptance completed
23:19:30–23:23:23 UTC:44 files/626859 bytes,35 Node syntax+1 Bash+9 acceptance=45
commands passed, including27 local groups and33 Docker deployment scenarios.
Package work/console-releases/adb64e3c4572-Wa9mjy, SHA
6bfd98ed8f4a5de454eab5eabe1839d8eed98b957e68a70bf34959a995832397.
Validation work/console-validations/adb64e3c4572-aIQ3BG, SHA
9b6360552b4f355597a3324ddf40a3709364d9477792343f6e499402570cd560.
Independent verification of report/all45 log hashes/zero exits and local default
plan passed23:23:50 UTC. Container a1-deployment-console-deployment-gevg7e exited0/noOOM.
Receipts work/d220-release-real.json, work/d220-validation-result.json,
work/d220-evidence-verification.json, work/d220-deployment-plan.json;
runners work/run-d220-validation.mjs and work/verify-d220-evidence.mjs. As before,
recording docs advances HEAD; this is historical implementation acceptance, not
the final approved/current-source public package. Do not repackage docs alone.

Exploratory read-only legacy artifact probe23:21:39 UTC:66 regular candidate genesis
JSON files in server console-tmp,85617bytes, repeated directory/file hashes stable.
Only names/metadata/digests/declared chain IDs/allocation counts returned; no raw
genesis/allocations/credentials copied.11 files in current user ID band;55 outside.
RPC comparison23:23:07 UTC matched all11 to exact committed genesis bytes, public
ledger chain/subnet/name and embedded EVM ID. This is stronger candidate evidence,
not proof of legacy drain, mempool emptiness or subnet-only transactions. Source CLI
creates subnet, then validators, then blockchain; both final IDs print only at end.
Scripts work/legacy-artifact-probe.mjs and work/legacy-genesis-match.mjs; receipts
work/legacy-artifact-live.json and work/legacy-genesis-match.json. Prototype evidence,
not reusable tested recovery tooling; all66 files retained on-server. No mutation.

First-adoption preparation now in docs/CONSOLE-FIRST-ADOPTION.md. Next bounded work:
turn artifact inventory/genesis comparison into tested read-only operator tooling
and refine the exact controlled-transition/recovery rehearsal. Current backup omits
console-tmp, and routine33-case deployment rehearsal is not a legacy bootstrap.
Never add synthetic maintenance receipts or a force fallback. About3h remained.

D-221 ready for commit: inspect-legacy-artifacts.mjs provides explicit-directory
selected-state/genesis metadata, strict bounded reads and exact optional P-chain
genesis matching. Shared inspection-rpc.mjs extracts D-220 strict HTTP reader,
adds a six-read-method allowlist and permits bounded8MiB replies for4MiB decoded
genesis. D-220 retains4MiB and all74 cases pass. No generic console RPC policy change.
93 Windows/94 Linux controls pass, including the actual30s total RPC deadline;
Linux adds FIFO refusal. Three copied-source negative controls fail on exact genesis,
snapshot stability and extended total deadline. Latest logs/fixtures are listed in
docs/LEGACY-ARTIFACTS.md. Profile28 groups; operator import closure16, console26/faucet3.

Tested module/dependency bytes streamed in memory over SSH23:41:46 UTC, with no file
installation or raw artifact transfer. Selected real server ledger/artifact snapshot
unchanged;11 current-band genesis candidates all match committed P-chain genesis,
55 outside-band files retained,0 retired, no conflict/unknown checks. Receipt
work/legacy-artifacts-live-evidence.json, report work/legacy-artifacts-live.json,
source hashes work/legacy-artifacts-remote-source.json; runner
work/legacy-artifacts-remote.mjs. Recovery authorization remains false. Commit then
run exact-source acceptance. Next bounded task: include console-tmp bytes in the
reviewed bounded backup scope, with real copy/verification and negative controls.
This is local tooling work; do not back up, mutate or deploy on public server yet.

D-220's real aggregate profile measured107233ms. D-221 adds a real30s budget drill
and other controls, so validator allowance for aggregate check-local is now240s;
individual leaf checks remain120s, deployment360s, overall600s. Re-run the existing
22-case validation CLI regression (including actual hung child and shorter overall
deadline) and real-root acceptance. This is a scoped aggregate allowance, not a
disabled timeout or a test skip.
The22 actual validator CLI controls now pass after this adjustment:
work/legacy-artifacts-validation-regression.log, work/release-validation-test-fHiEOI.

D-221 implementationc00dde288ed2d94c61216d3f7e607fe68b82cb23,
treefc949a700009246b3adf87c025f736d1421960d0. Actual-root acceptance completed
23:52:04–23:56:12 UTC:46 files/642113bytes,37 Node syntax+1 Bash+9 acceptance=47
commands passed, including28 local groups and33 Docker deployment scenarios.
Aggregate profile took125432ms, deployment119525ms; the profile exceeded the old120s
aggregate limit, while all current bounded checks passed. Package
work/console-releases/c00dde288ed2-MnrYMH, SHA
f73a7139004b49ccbf9d3d1b4160557276762d139959cfcb1e159d1804fe26d9.
Validation work/console-validations/c00dde288ed2-yty9Qy, SHA
aa01ccfe2650a81a9fb481f73607b950df8ba3b41192212a5b5702ce40a338cd.
Independent report/all47 log hash/zero-exit verification and actual default local
plan passed23:56:42 UTC. Container a1-deployment-console-deployment-icrapd exited0/noOOM.
Receipts work/d221-release-real.json, work/d221-validation-result.json,
work/d221-evidence-verification.json, work/d221-deployment-plan.json;
runners work/run-d221-validation.mjs, work/verify-d221-evidence.mjs. Recording docs
advances HEAD as before; historical acceptance, not the final frozen public candidate.

Next D-222 design: work/d222-backup-design.md. Add exact console-tmp byte preservation
and required root observations; distinguish new backup scope from legacy schema.
Do not treat an old backup lacking this material as current coverage. Preserve
unknown/corrupt/history evidence and test actual copying/failure/verification.
Broader remaining-window plan in work/remaining-window-plan.md: after backup, assess
a bounded fresh isolated private-network/resource drill if time permits; only fresh
synthetic identities, no existing validator/genesis/key modifications. Reserve final
20–30minutes for final clean source/docs, acceptance and review handoff. Record final
freeze receipts in ignored work/outputs without advancing HEAD afterwards. Hard stop
02:23:12 UTC unchanged; roughly2h26 remained. No public mutation in this window.

D-222 now closes the local temporary-genesis backup gap. Schema2 preserves exact
console-tmp candidate bytes, including corrupt and outside-band files, plus required
root presence/absence. New verifier explicitly refuses legacy schema1; no migration
or overwrite. Existing bounded copy/fsync/stability/topology/exclusions remain.
43 CLI checks pass on Windows/Linux with8/9 real-file fault controls. Removed-scope
negative omits actual genesis and fails expected-copy; logs/fixtures in
docs/CONSOLE-BACKUP.md. Linux container a1-autopilot-d222-backup-linux-20260907
exited0/noOOM. Commit and run exact-source acceptance including33 deployment cases.
Then assess fresh private-network drill; no public backup, restore or legacy adoption.

D-222 implementation205def06398217ea1520d3ac8a8f2ea49163b491,
treeafa57007b1e7d20d3d2771c3357030022bf1b740. Exact-source acceptance00:12:35–00:16:47:
46files642424bytes,47commands (37Node+1Bash+9acceptance),28local groups and33Docker
deployment scenarios pass. Package work/console-releases/205def063982-X78uV7, SHA
d3907eed5559670d62f8d04385fa096831b538c45a89a9022200bb1e656dc927. Validation
work/console-validations/205def063982-HHc8ic, SHA
dcd34c84efc3100cc580237ff3f6abef7b539929e944a038ed9a28dc38049046. Independent report,
all47log hashes/zero-exit and default local plan verified00:17:20 UTC. Receipts
work/d222-release-real.json, validation-result.json, evidence-verification.json and
deployment-plan.json (each filename prefixed d222-). Recording later docs advances
HEAD; this is historical accepted source, not final/current-source deployment approval.

D-223 completed real private experiment00:18–00:44 UTC. New synthetic material only,
5capped nodes, internal Docker network/no published ports, frozen cold-build binaries,
default Sybil/consensus and distinct network/C-chain identity. Existing CLI created3
L1s.55signed EVM transfers checked across nodes; actual missing-node and untracked-L1
readiness negatives pass. Four active nodes process C/L1 transactions; returnednode5
catches all receipts/balances. Final inventory and exact L1 genesis match onall5.
Actual binary/genesis hashes match insideall5; all exit0/noOOM and data retained.
Short6-sample memory medians(total5nodes):244.32/342.605/528.40MiB at0/1/3L1s. Not
capacity, independent-operator, WAN/Byzantine or public acceptance. Prototype setup
faults and exact synthetic-genesis restoration/read-only funding reconciliation are
documented without treating failures as passes. No existing operational/public data
was touched. See docs/PRIVATE-NETWORK-VERIFICATION-2026-09-07.md.

Frozen evidence docs/evidence/private-network-20260907 contains41selected source/report
files242980bytes plus manifest/hash, manifest SHA
34c84238fa5c14d7a503d32ffd3582eb6d0371ec4588e239ec5234c0fea52dee. Fuller scratch is
work/private-network-KSW52y; prototype scripts/continuation in work/private-drill-checkpoint.md.
All fixture nodes/wallets are stopped. Labeled network/volumes/old containers remain;
do not delete or re-submit completed operations. Experimental sources are not a
supported installer. Next: verify/archive/commit evidence and prepare final handoff
and bounded remaining work; keep final20–30minutes for clean freeze/validation.
Hard stop02:23:12 UTC unchanged, about1h34 remained at documentation preparation.

D-223 committed44a35a8. Independent archive verification00:50:39 checks41file hashes,
15source syntax checks,55signed-transfer observations and all5clean node shutdowns;
receipt work/d223-evidence-verification.json. No full console retest was necessary
for only this documentation/frozen-evidence commit; D-224 below changes backup code.

D-224 closes an observed boundedness gap: readdirSync allocated the entire source/
backup directory before applying entry limits. Use bufferSize1 iterators and finally
closure in source and independent verification walks. The actual4096-file source
was red before/green after; a4096-extra backup rejects on the first extra, and restoring
the old verification walk fails that control.43 CLI cases plus8/9file-fault and2new
enumeration controls pass on Windows/Linux. Evidence in CONSOLE-BACKUP.md; Linux
a1-autopilot-d224-backup-linux-20260907 exited0/noOOM. Scope/schema2 remain unchanged.
Commit then exact-source acceptance using work/run-d224-validation.mjs and
work/verify-d224-evidence.mjs; receipts stay in work. Prepare final owner report and
remaining next-stage work without publishing or deploying. Avoid advancing HEAD after
the final frozen candidate merely to record its own receipt; use work/user outputs.
Automation remains active until the unchanged02:23:12 UTC work cutoff; pause it then.

D-224 committed7c193eb008ea6050e3f0dd8c02e5e7217c7066da, tree
3726e86126cd9d3ce1b7ee6cca03d964bee937e2. Its exact-source validationFAILED01:00:15 UTC
at the synthetic busy-drain maintenance test: request timed out inside the overall
deadline, but the expected regex allowed only pre-request/drain timeout. Backup43CLI
and both enumeration controls had already passed. Failed package
work/console-releases/7c193eb008ea-vYBAec, SHA
15779ea7a8194158d8d89de473cfc09b12a6d6fc4441692b76b4ae21e8f928e3; failedvalidation
work/console-validations/7c193eb008ea-8Yt0Fe, SHA
682d698ee307088501144cc1bd4b5fedc68ceecb308f8ae7dc2671a0f4efd3ba. Do not treat it
as accepted. Records work/d224-release-real.json / d224-validation-result.json.

D-225 leaves production maintenance unchanged and strengthens the assertion around
the actual safety contract. Busy/deferred-response deadlines must exit1, emit no
receipt, issue only one pause and no other mutation, and leave the two simulated
operations active. Added a deterministic1300ms partial-body poll;34CLI cases pass
Windows/Linux with a false-drain negative. Logs and fixture names in
CONSOLE-MAINTENANCE.md. Linux a1-autopilot-d225-maintenance-linux-20260907 exited0/noOOM.
ARCHITECTURE.md also refreshed against current code to remove obsolete factory/key
guidance. Commit then rerun exact-source acceptance. Stop broad code changes after
the validated candidate; prioritize the final owner packet and remaining bounded
analysis. Keep receipts in ignored work/outputs, not a receipt-only HEAD advance.

Fresh public read-only observations01:01:58–01:02:05 UTC:13registrations =2primary+
11active,0unlisted; public ledger unchanged SHA6998dfd8ca934c6b2ba83e4f41332550ddafeeaed2283c20028aee15df72be0d.
Tested artifact inspector streamed in-memory on-server01:02:03 matches11current
artifacts/active chains,55outside-band retained, selected snapshot unchanged
7a05dfaeaba9a2f3d502ddc8441b90e704d60d338eb34ad6f73bad1b8f32cbe7. No raw artifact
transfer, install or operational write. Source audit still blocks undeclared
heartbeat-deploy.sh; maintenance404. Receipts work/final-chain-inventory-live-evidence.json,
work/final-legacy-artifacts-live-evidence.json and work/final-live-read.json.
Original earlier observations were preserved under their prior filenames.
