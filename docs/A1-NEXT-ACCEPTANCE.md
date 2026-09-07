# A1: next acceptance stages after the autonomous development window

Prepared 2026-09-07 from the local implementation and measured evidence. This is
a proposed engineering sequence, not a public release approval or a capacity forecast.
The owner authorized local work until 2026-09-07 02:23:12 UTC; later implementation
needs a new work instruction. Public deployment/publication, public transactions,
operational validator/genesis changes and deletion retain their separate review gates.

## What the baseline supports

The unchanged 27-patch fork can be reproduced by two cold builds in the same pinned
Linux environment. A manually driven, isolated five-node experiment created three
real EVM L1s, compared 55 signed transfers, continued with one node absent and caught
that node up afterwards. The experiment does not establish WAN resilience, capacity,
Byzantine security, independent operators or a supported network installer.

Local console changes preserve creation reservations, reject damaged ledgers, bound
RPC waits and verify the requested L1 on every managed node. Maintenance tracks
admitted work. Routine upgrades now use verified packages, an exclusive invocation
lock, persistent drain, bounded backups, targeted paused restart and separate resume.
These fixes have local acceptance evidence. Public A1 still runs an older console;
its maintenance endpoint returned 404 during the 01:02 UTC read-only observation.

Read BUILD-VERIFICATION-2026-09-06.md, PRIVATE-NETWORK-VERIFICATION-2026-09-07.md,
CONSOLE-FIRST-ADOPTION.md and CONSOLE-DEPLOYMENT.md for the exact evidence boundaries.

## First two weeks: make one upgrade and one recovery repeatable

Priorities are sequential where one produces the evidence needed by the next.
Time ranges below are planning targets; failed acceptance moves the schedule.

| Priority | Deliverable | Acceptance before advancing |
|---|---|---|
|P0: first public adoption preparation|A separately tested legacy-to-new transition and recovery procedure, based on the actual old source/configuration.|Real old/new consoles with synthetic material; held bodies, preflight and queued work; uncertain submitted transactions; source/dependency/startup failures and lost replies. A routine maintenance-capable upgrade drill is insufficient.|
|P0: public source provenance|An exact ownership/retention decision for the observed heartbeat deployment helper.|Bind the observed file name, byte hash and source origin. Explain whether it stays outside the proposed release and how drift is detected. No broad ignore or execution to make audit pass. Preserve the independent traffic-pump authorization window.|
|P0: quiescence and reconciliation|A reviewed procedure covering public ingress, direct/local callers, detached CLI work and already-submitted transactions.|Verify the running route with its web-home owner. Reconcile subnet-only/validator/chain transaction stages; a stable chain list or progress.running=false cannot prove drain. Preserve unresolved cases instead of retrying.|
|P0: recovery rehearsal|Recovery from each interrupted installation phase without losing later legitimate state.|Retain and verify old code/dependencies and selected runtime artifacts. Demonstrate what is restored, what remains paused and how current ledger state is reconciled. Never assume a console backup is a full blockchain database backup.|
|P1: owner review packet|Exact source/tree, package/validation hashes, target/configuration identity, tested transition/recovery steps and stop conditions.|Only request public approval when prerequisites are complete. Review reopening separately after the replacement is observed paused and healthy.|

The undeclared helper currently observed is local-net/deploy/heartbeat-deploy.sh,
8973 bytes, SHA256 31fe596208459f714976591be7fff60d27609ff3a466ec2fb41e20a14b3e7ae6.
Its web-home copy matched the earlier server observation. The existing helper can
stop/remove/recreate the separate traffic-pump container and loads its environment;
it is not the new console release controller. This provenance does not authorize
importing, exempting, running, replacing or deleting it. Current main leaves the
undeclared-file refusal intact. The pump's separate authorized deadline remains
2026-09-09 05:39:09 UTC.

## Weeks two to six: reproducible private network and measured cost

Turn the retained experiment into a new supported runner; do not promote the evolving
scratch scripts unchanged. The runner should have these explicit properties:

- An exclusive run directory and ID; distinguish read-only inputs, synthetic secret
  material, immutable network genesis, transaction checkpoints and report outputs.
  Reserve output names up front and refuse aliases/collisions before network creation.
- Fresh synthetic keys and an explicit private network/chain-ID range; verify the
  original binary/genesis hashes inside each node. Never silently adopt an existing
  operational network, volume or partially completed run.
- Retain intent and available transaction identity before post-submit checks. After
  an uncertain response, inspect transaction/UTXO/registration evidence. Re-running
  the command must not submit the same intended operation a second time.
- Internal networking without public peers or published ports by default; resource
  ceilings and finite phase deadlines. Gracefully stop only run-owned processes;
  preserve evidence and data. Cleanup remains a separately reviewed action.
- Acceptance on a clean fixture and a second fresh run, including invalid network
  input, output collision, one node absent, untracked L1, wrong chain ID, incomplete
  registration and a lost submission reply. Measure actual transactions and node
  state; mock-only checks cannot accept the complete runner.

Then run an explicitly budgeted 10/30/100 active-L1 matrix. Increase scale only after
the previous stage meets a stated memory/CPU/disk/network budget. Measure idle and
sustained execution separately, fixed offered load, receipt success/latency including
tail percentiles, process/thread count, database and history growth, activation time,
catch-up duration, restart behavior and costs of backups/monitoring/RPC serving.
Use repeated comparable phases and retain raw samples. A short single-host series
cannot support linear extrapolation to a million chains.

Before claiming operator resilience, repeat on independent hosts/operators with
documented delay/loss and controlled partitions. Include whole-host/storage loss,
replacement from verified backups, version mismatch and rollback compatibility.
Specify quorum assumptions and the state/data a returning operator must obtain.

## Months two and three: a useful ledger pilot

The product hypothesis is that people and AI agents need an independently verifiable
record of collaboration. Test that need through one narrow workflow: signed task
assignment, acceptance, result reference and acknowledgement, with portable export
and an independent verifier. A centralized website can display the record, but must
not be the only party able to verify it.

Define the trust model before implementing a low-cost tier:

| Offering | Promise to define and test | Cost that remains |
|---|---|---|
|Personal verifiable ledger|Signed append-only history, portable proofs, explicit anchoring and data-availability policy. This is not automatically an independently validating L1.|Storage, replication, anchoring, key recovery and retrieval.|
|Shared execution|A specified operator/committee orders and executes multiple logical ledgers; users can identify its authority and export their data.|Shared compute plus isolation, admission control, proof/verification and operator availability.|
|Dedicated L1|Its own declared validator/security and execution policy, with compatible application tooling.|Always-on validation, replicated state/history, RPC/indexing and operational support.|

A dormant ledger must state who holds its bytes, whether new transactions are accepted,
how it resumes, how long recovery can take and what happens if the sponsor disappears.
Do not call a stored inactive record a continuously available autonomous blockchain.
Do not assume one validator process per permanently active EVM chain can deliver
billions of low-cost ledgers; the existing experiment has not tested shared execution
or dormant-chain scheduling.

For an AI workflow, use a separately scoped capability with explicit actions, spending
limits, expiry, revocation and replay/domain protection. Log the signed intent and
actual execution result separately. Keep private payloads outside public chain data
where appropriate; specify encryption, availability and recovery rather than claiming
that a hash alone preserves the document. Do not give an agent a user's unrestricted
signing key as the default collaboration model.

Pilot success should be judged by repeat use, independently verified exports, task
completion, recovery success and actual infrastructure cost per active user/ledger.
Count a repeat user separately from a newly created wallet or automatically generated
chain. Define a finite subsidy budget and compute/storage quotas for any free tier;
protocol fees near zero do not make server resources or abuse handling free.

## Three-year direction with evidence gates

| Stage | Engineering focus | Evidence that justifies expansion |
|---|---|---|
|Year 1|Reliable A1 operations, repeatable upgrade/recovery, bounded chain creation and one useful personal-ledger pilot. Keep fork changes small and maintain explicit upstream compatibility review.|Independent restoration and operator drills; measured unit cost and recurring pilot usage; a clear difference between a logical ledger and a dedicated L1.|
|Year 2|Investigate shared execution, placement across operator pools, tenant isolation, inactive-data availability and a standardized export/verification interface.|A second implementation/operator can verify and recover exported state; noisy-tenant tests preserve other tenants; measured cost improvement under comparable workloads.|
|Year 3|Expand proven operator pools and interoperability; formalize migration, governance and sustainable subsidies.|Multi-host capacity and failure tests, independent security review of new trust boundaries, observable service objectives and budgeted growth.|

The existing allocator has one million EVM IDs per generation; g1 uses
9001000000 through9001999999. The overall declared range9000000010 through9999999999
is about one billion IDs, not nine billion. This is a namespace policy, not measured
runtime capacity or global reservation of those EVM IDs. Plan a stable logical-ledger
identity separate from EVM chain IDs, retain cross-generation history and specify
collision/migration semantics before any allocator change. Do not change the current
operational identity/genesis as a shortcut to a future namespace.

The next investment decision is whether a useful verifiable ledger can serve the
target workflow cheaply and recoverably. Billions of permanently active independent
L1s remain an unproven hypothesis, not an acceptance target established by this window.
