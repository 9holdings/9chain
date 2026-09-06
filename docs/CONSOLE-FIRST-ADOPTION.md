# First adoption of maintenance-capable console releases

Status2026-09-06: preparation and evidence, not an executable public transition.
The owner authorized local development/tests/commits for the ten-hour window.
No public deploy, restart, transaction, validator/genesis change or deletion occurred.

## Why routine deployment cannot start yet

At23:01:43 UTC the D-219 frozen-release transport performed only a source audit and
maintenance status read. The audit refused undeclared
`local-net/deploy/heartbeat-deploy.sh`; maintenance returned HTTP404. Receipt:
work/d219-live-read.json. Neither failure permits a fallback to old progress status.
The new apply path has not been executed publicly and no live lock/pause was acquired.

The main/worktree ownership rules assign the undeclared helper to main. Its earlier
measured8973-byte hash matches the web-home copy; this is provenance evidence, not
permission to execute, delete, restore or exempt it. Prepare an exact retention/
ownership decision. Keep the existing authorized heartbeat traffic running through
its own2026-09-09 05:39:09 UTC deadline; console adoption does not shorten that window.

The locally inspected web-home Caddyfile routes /console/api/* to loopback8091 after
stripping /console. Main's copy is older and must not replace it. Local config is
not evidence of running ingress configuration. Coordinate any reviewed ingress
change with the web owner and independently verify the actual running route and
other local/automated callers before relying on closure.

## Evidence already obtained

- D-219 exact-source implementation7283720 passed44 commands with26 local groups
  and33 isolated deployment scenarios. It adds actual loaded-config/network readiness.
- D-220 implementationadb64e3 adds the read-only bidirectional inventory.74 actual
  CLI/file/HTTP cases pass on Windows/Linux; missing unlisted/stability checks fail
  their copied-source negative controls. See CHAIN-INVENTORY.md.
- Public read23:16:05–23:16:11 UTC:13 registered chains =2 C/X primary +11 active
  public ledger entries,0 retired/unlisted, stable public ledger bytes/DYNAMIC cache
  status. This measures the public surface, not the authoritative server ledger.
- Exploratory on-server read23:21:39 UTC found66 regular genesis JSON candidates
  in console-tmp,85617 total bytes; repeated directory/file observations matched.
  Only metadata, digests, declared chain IDs and allocation counts left the server;
  no raw genesis, allocations or credentials were copied. No artifact was modified.
- Public transaction/genesis comparison completed23:23:07 UTC:11 artifacts in the
  current user chain-ID band matched exact RPC-observed committed genesis bytes and
  the public ledger's chain/subnet/name/EVM IDs.55 candidates fall outside that band
  and remain unclassified historical evidence. They were not deleted or rewritten.

The exploratory scripts are retained in work/legacy-artifact-probe.mjs and
work/legacy-genesis-match.mjs; receipts work/legacy-artifact-live.json and
work/legacy-genesis-match.json. They are observations for planning, not yet the
tested reusable artifact-preservation/legacy transition tooling. They do not prove
atomicity across those timestamps, absence of pending transactions or complete drain.

## What the first transition still has to establish

The old console lacks durable creation reservations and complete admission counting.
Closing public ingress does not dispose of already accepted bodies, preflight work,
queued mutations, local callers or detached container processes. progress.running=false
is already known to miss these cases. Do not manufacture new maintenance receipts,
add a force/legacy bypass or pretend a timeout proves the old process is idle.

The CLI sequence in upstream/avalanchego/9chain-a1-tools/9chain-a1-cli/main.go creates
a subnet, adds its validators, then creates a blockchain, and prints both final IDs
only at the end. A failure before the last step can leave a subnet/validator operation
without a blockchain registration. The inventory therefore cannot rule out partial
CLI work, pending transactions or acceptance after an interrupted HTTP/CLI response.

D-217 selected backup excludes console-tmp. Legacy files there may be the only link
to a submitted genesis. Before an actual first-adoption mutation, prepare bounded
preservation of those exact artifacts on-server, plus the relevant request/transaction/
rollout records, without a blanket copy of credentials or validator data. Treat a
filename or declared EVM ID only as a candidate; exact bytes and immutable transaction
identities are stronger evidence. New journals cannot reconstruct old operations.

Rehearse the exact legacy-to-new transition with synthetic credentials and real old/
new consoles, including held request bodies/preflight/queue work, uncertain submitted
transactions, backup/copy/dependency/startup failures and loss of the final response.
The current33-scenario deployment drill begins with a maintenance-capable process;
it proves routine upgrade behavior, not this first transition. A controlled outage
and explicit reconciliation may be required if old quiescence cannot be established.
Stopping a process does not undo its submitted transactions.

## Recovery decisions to prepare before approval

| Point of failure | Required retained evidence and next decision |
|---|---|
|Before any mutation|Keep original source/state; resolve audit/API compatibility rather than bypassing it.|
|Paused, before source replacement|Keep lock, process/pause identities and backup receipts; any reopening remains reviewed.|
|Partial source/dependency replacement|Keep outage/maintenance, exact old source/dependencies and partial phase records; prove current runtime state before preparing restoration.|
|Replacement starts but readiness fails|Keep it paused; diagnose the specific source/config/network/state failure.|
|Resume response is lost|Read actual process state; do not replay the recorded resume attempt.|
|Legacy transaction is uncertain|Preserve genesis/transaction/ledger/rollout evidence and reconcile identities; no retry, ledger overwrite or journal fabrication.|

There is currently no automatic or rehearsed general restore runner. A proposed
restoration must identify exact source/dependency bytes and must not rewind chain
state or erase a later legitimate ledger entry. Selected backups do not authorize
restoration. Validator/genesis changes and operational deletion remain separate.

The final approval packet must identify the exact clean source/tree, frozen package
and validation hashes, target/configuration identity, resolved helper ownership,
ingress change from its owner, rehearsed first-transition/reconciliation/recovery
steps and explicit stop conditions. Reopening requires its own reviewed evidence.
The present document records what remains; it does not ask for approval prematurely.
