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
repetition. Last user-facing progress update: **2026-09-06 17:18:23 UTC** (D-202 milestone).
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

Next priority: durable launch reservation/journaling (P-chain creation is
irreversible and currently precedes successful ledger write).
Preserve the public ledger/API contract. Matching chain ID does not prove block
production or all-validator readiness. Full cold build, patch replay and live
consensus remain separate unverified items. No public create/upgrade in tests.
