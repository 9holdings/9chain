# A1 private multi-chain verification — 2026-09-07

D-223 is a completed local experiment, not public deployment acceptance or a capacity
claim. Five real nodes ran the frozen27-patch fork with default Sybil protection and
consensus parameters. Three permissioned L1 subnets were created with the existing
CLI.55 signed EVM transfers were compared across the participating nodes, including
one-validator outages and subsequent catch-up. All five nodes stopped cleanly at
00:44 UTC; synthetic material, databases, containers and evidence were retained.

No public transaction, public deployment, operational key reuse or change to an
existing network's genesis/validators occurred. The experiment used freshly generated
synthetic identities. Setup mistakes and their limited repairs are recorded below.

## Environment and identities

- One Docker Desktop Linux engine on the existing shared Windows host,24 logical
  CPUs and about31GiB available to Docker. Other workloads were present.
- Fixture `a1-private-c3bb2102`, network `a1-private-c3bb2102-net`, internal bridge
  `172.29.207.0/24`, no published ports, no public peers or Docker socket in containers.
- Five nodes, each capped at2GiB/1CPU, GOMAXPROCS2, read-only root, per-node synthetic
  staking-material subpath and separate retained state volume. No Sybil/consensus
  shortcut was enabled. Current primary and subnet validator sets were queried.
- Network899999998, `9chain-a1-tap-g1`; parent C-Chain9000000909, deliberately distinct
  from public A1. L1 EVM IDs8999900001/2/3; names PrivateL11/12/13.
- First node started00:18:10 UTC. All-five identity/bootstrap/health observations
  completed00:20:01. Final three-L1 catch-up completed00:43:24 and inventory00:43:44.
- Parent genesis SHA256:
  `8b2bbbe4fa9c3aaa24a8ddc6779628b261386c43ecbd3b2a66a5f11828e0f845`.
- Runtime shell image is the earlier A1 image, but its binaries were overridden by
  a read-only mount of the independently cold-built artifacts. Final hashing inside
  every node matched all five recorded binary hashes and exact parent genesis.
  Node version reports `9chain-a1-g1-27patch-38723877` and9chaingo1.14.2/rpc45.
  See BUILD-VERIFICATION-2026-09-06.md for the independent build evidence.

Netgen was built offline from the unchanged cold-build source/module cache with a
fresh compiler cache and explicit network/chain ID. Keys stayed in a new labeled
Docker volume; only synthetic public metadata and hashes enter this report/archive.

## What ran and what was observed

| Actual operation | Observed result |
|---|---|
|Bootstrap and identity|All5 nodes agree on network/name, their individual NodeIDs, expected version, primary validator set and C-Chain ID; P/X/C bootstrap and health pass.|
|C-Chain transfers|10 transfers produce matching receipts, block hashes and recipient balances onall5.|
|First node5 outage|Normal five-node readiness refuses the unavailable node.10 further C transfers are confirmed by4 active nodes; after restart, node5 has all10 receipts and the correct balance.|
|Create first L1|Existing CLI creates a subnet, adds all5 primary validators with weight100 each, then creates the chain.|
|Untracked L1 negative|All5 primary networks are healthy, but the new L1 RPC returns404 onall5. The dedicated L1 readiness probe refuses within its short negative-test budget.|
|Track and execute first L1|Graceful replacement containers retain exact synthetic identities/genesis/state; all5 serve the correct L1 and agree on5 transfer receipts and balances.|
|Create/track3 L1s|Two further CLI creations and a second retained-state rollout bring all3 L1s online.5 transfers per chain,15 total, agree onall5 nodes.|
|Three-L1 node5 outage|Normal five-node readiness refuses.5 transfers per L1,15 total, agree on4 active nodes. After restart, all5 agree on every outage receipt and destination balance across all3 L1s.|
|Final inventory|Every node reports5 blockchain registrations (C/X plus3 L1s). Exact registered L1 genesis bytes match each selected file hash onall5 nodes.|
|Shutdown|All5 nodes exit0/noOOM; stopped predecessors and state volumes remain. Synthetic wallet helpers are stopped; one reaches its watchdog124, the other receives SIGTERM143. Neither is a node-validation failure.|

The55 EVM transfers comprise20 on C,5 on the first-L1 stage,15 with3 L1s/five nodes,
and15 with3 L1s/four nodes. Funding and P-chain registration transactions are separate.
Successful receipt comparisons do not constitute an independent proof of consensus
correctness or protection against Byzantine validators.

## Resource and latency observations

Six samples per phase, roughly12s apart, over about60s. Values below are medians of
the total across all five node cgroups. Docker memory includes their VM children,
but excludes host overhead, image/storage costs and separate wallet/client helpers.

| Configuration | Memory MiB median [min,max] | CPU, percent of one core | Docker PIDs median |
|---|---:|---:|---:|
|Primary network,0 user L1s|244.32 [242.16,247.22]|13.135|42.5|
|Primary +1 L1|342.605 [338.01,348.59]|17.415|82|
|Primary +3 L1s|528.40 [519.90,534.30]|27.02|163.5|

Docker PIDs include Linux threads; they are not a count of independent VMs. These are
short, correlated samples on one shared host. The phases had different restart and
transaction histories; subtracting them is not an isolated marginal-cost experiment.
The result supports measuring per-active-chain overhead further, not a linear forecast
for thousands or billions of chains. Tiny early databases say nothing about long-term
history growth, state growth, pruning or backup costs.

| Sequential transfer sample | Count | Receipt observers | Median ms | Maximum ms |
|---|---:|---:|---:|---:|
|C, all nodes active|10|5|2041|2050|
|C, one node absent|10|4|2042.5|10197|
|Three L1s, all nodes active|15|5|2047|2070|
|Three L1s, one node absent|15|4|2049|9217|

This measures time from the client starting one broadcast to observing matching
receipts, with250ms polling. Transactions are sequential. It is neither maximum TPS
nor a network-wide finality bound; the outage samples include roughly9–10s outliers.
No WAN delay, network partition, Byzantine behavior, prolonged load, host failure,
power-loss, storage exhaustion or geographically independent operator was tested.

Synthetic X-to-P funding imported10000 test tokens with an8270nLOVE9 P import fee.
The X export consumed0.001 test token. Subsequent three subnet/validator/chain creation
sequences reduced P balance by425004nLOVE9 in total. These are observed protocol fees
on this private A1 fork, not AVAX prices, server costs or a promise of free hosting.

## Setup faults retained as evidence

This was a manually driven prototype whose sources evolved. It is not an accepted
single-command clean-room installer. Failed setup attempts are not counted as passes.

1. The first netgen compiler invocation could not write CGO's temporary input under
   a read-only /tmp. Setting TMPDIR to the new fixture's writable temp directory
   fixed the environment. The failed container/volume were retained.
2. A caller-supplied four-octet subnet prefix caused netgen to append a fifth octet
   in generated Compose addresses. That material never ran. A new fixture used the
   actual three-octet prefix expected by the generator. The frozen fork was unchanged.
3. An early helper wrote its `genesis` report to the new fixture's `genesis.json`
   after the first C catch-up had passed. The report was retained and the exact
   original synthetic genesis restored from the untouched generator volume, matching
   the recorded SHA. Subsequent node replacements booted that exact original and
   retained state. Results now use a separate directory; each client invocation checks
   parent-genesis hash before and after. No pre-existing operational data was involved.
4. The first X/P helper selected the synthetic faucet, which has only C allocations;
   its X/P balances were zero and funding returned500. A separate synthetic foundation
   wallet supplies liquid X funds. Its one export/import succeeded, but an assertion
   incorrectly expected the pre-fee amount on P. There was no retry: read-only block1,
   transaction status and output inspection reconciled the import onall5 nodes.
5. Early clients produced results but exited late due to remaining DNS/socket work.
   The finite probe now closes connections, flushes its report and exits explicitly.
   A first untracked-L1 assertion also compared the entire Node assertion message;
   the corrected anchored status check observed all five actual404 responses.

The local repairs and negative observations support the limited experiment above.
They do not establish a production restore procedure or justify public legacy adoption.

## Implications and next acceptance targets

A1 can run and recover several real EVM chains on one small validator fixture.
The measured resource increase confirms that lowering transaction fees alone does
not eliminate the operating cost of keeping chains active and replicated.

The current CLI uses CreateSubnetTx, primary-validator membership and CreateChainTx.
This experiment does not demonstrate a different validator-economics model, shared
execution scheduler, dormant-chain activation or billion-chain registry. Those are
separate engineering work, with security and availability semantics to define.

Next proposed acceptance work, not completed targets:

- Make the fresh-network experiment a reproducible bounded runner with exclusive
  fixture/result paths and retained transaction checkpoints before post-submit checks.
- Measure10/30/100 active L1s under explicitly budgeted resources, including steady
  state, sustained workload, disk growth and per-chain activation/recovery time.
- Run separate operators/hosts with measured delay, loss, partitions and reconnects;
  test failure of the host itself, not only one process on the same host.
- Define distinct service promises for a personal verifiable ledger, shared execution
  and a dedicated L1. Any dormant mode must state who preserves data and how execution
  resumes; it cannot silently promise continuous autonomous L1 availability.

Public rollout still depends on CONSOLE-FIRST-ADOPTION.md: legacy maintenance404,
undeclared helper ownership, proven quiescence and an exact transition/recovery rehearsal.
This private drill does not close those blockers or alter the approval boundary.

## Retained evidence

Selected reports and final prototype sources are frozen under
`docs/evidence/private-network-20260907`,41 files/242980bytes plus manifest/hash.
Manifest SHA256:
`34c84238fa5c14d7a503d32ffd3582eb6d0371ec4588e239ec5234c0fea52dee`.
Original working fixture: `work/private-network-KSW52y`; fuller command histories and
the labeled Docker volumes/containers remain locally. Do not interpret copied prototype
sources as a supported installer or rerun completed transaction/repair steps.

The archive includes no keys, environment files, validator material or raw genesis.
Some later invocation receipts bind the client source hash; early observations and
setup versions are described here rather than presented as one immutable code run.
All archived hashes were re-read and independently checked at creation.
