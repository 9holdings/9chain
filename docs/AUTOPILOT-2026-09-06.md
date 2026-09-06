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
repetition. Last user-facing progress update: **2026-09-06 18:57:23 UTC** (D-208 milestone).
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

Next priority after D-208: validate the managed-node read-only transport/health
observations against real local containers or an explicitly read-only server probe,
and prepare a concrete public rollout/recovery acceptance plan. Inspect existing
helpers and credentials handling before SSH; never print secret values. Do not
change public services or existing validator/genesis/data. New-chain bootstrap
still needs a real integration acceptance; synthetic Docker tests do not prove it.
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
