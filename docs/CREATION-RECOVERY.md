# Recovering an interrupted chain creation

Local implementation: D-203 through D-208. No public deployment or recovery mutation yet.

The console reserves one creation in `9chain-a1-config/creation-journal/pending.json`
before writing genesis or calling the CLI. It records the complete public plan,
network identity, SHA-256 of the exact genesis bytes, timestamps and the last
confirmed stage. It never records the CLI signing key. The file remains after
failure or process restart. Successful creation moves it into `history/<jobId>.json`
only after writing the normal public chain ledger.

While pending, new creation/preview, revocation, upgrade execution and owner
transfer are refused. Read-only chain/governance views remain available. Authenticated
`GET /api/status` adds `pendingCreation`, either null or a summary containing jobId,
name, chainId, phase, createdAt and any known subnetID/blockchainID. It does not
expose the genesis plan. A pending job may still be running; consult progress
before treating it as interrupted.

| Persisted phase | What is known | What must be established before recovery |
|---|---|---|
| prepared | Intent and genesis bytes recorded; the new launch code has not entered submission | Verify the deployed code and inspect any artifacts before abandoning the reservation |
| submitting | CLI was about to run; its result may have been lost | Determine whether P-chain accepted a subnet, a blockchain, both or neither; never replay based on a timeout |
| created | CLI returned both identifiers; rollout or RPC verification may still have failed | Verify the identifiers, genesis, per-node tracking and RPC against the recorded plan |
| complete | Ledger write and file flush returned; archive may have failed | Verify the ledger record and existing chain before archiving the reservation |

Operator preparation, before any public mutation:

1. Preserve the journal, existing ledger, recovery files and relevant non-secret
   artifacts. Confirm network identity and job identity.
2. Read P-chain state and compare identifiers and creation data with the exact
   saved plan. A missing HTTP response is not evidence that nothing was created.
3. Inspect each validator's actual tracking and chain state. Matching `eth_chainId`
   alone does not prove block production or agreement across validators.
4. Prepare the specific reconciliation: which existing chain record to restore,
   which tracking configuration needs adjustment, or why an unsubmitted reservation
   can be archived. Keep all evidence; do not overwrite history or reuse identifiers.
5. Obtain owner approval for public writes, restarts, transactions or removal of
   recovery state. No automatic retry, reset, resume or discard endpoint is provided.

Do not manually remove the pending file just to reopen the API. Do not treat an
empty live ledger as proof that the pending transaction was never accepted.
Backup coverage must explicitly include the journal and history as operational
data; Git intentionally ignores them. Restore and reconcile them with the ledger.

D-205 flushes the previous ledger into an atomic backup before replacing the primary
ledger, then flushes the new primary before acknowledging persistence. POSIX also
flushes the containing directory after each rename. Backup/flush/rename failures
stop creation before its journal is archived. Failure after a rename can leave the
new primary visible; an error does not promise rollback. Compare the primary,
`.bak`, `.tmp` and `.bak.tmp` with the journal and chain evidence before recovery.
Do not remove or overwrite unfinished writes just to retry. Their presence blocks
new creation planning and chain mutations. An intact primary remains readable;
if it is absent and recovery files exist, status/ledger views report a recovery
error instead of an empty directory. The journal remains available on disk.

Validation so far: real isolated console processes, synthetic RPC and intercepted
Docker; repeated requests and fresh-process retries after RPC/CLI failure do not
submit again. D-204 also forcibly kills the actual console process while its CLI
submission is unresolved: the client loses its socket, the `submitting` journal
survives, and a fresh process refuses duplicate creation, revocation and upgrade.
Removing the fixture's CLI pause makes this test fail at the required crash
boundary, rather than silently testing an already completed HTTP request.
File writes are flushed, with directory fsync on POSIX. The isolated real console
also refuses an injected ledger flush failure and retains the creation journal
across restart. Removing the durable writer reproduces a false HTTP 200 success.
Separate real-file fault probes run on Windows and a network-isolated Linux Node
container, including failures after backup/primary directory rename on Linux.
Linux test files use tmpfs; this validates syscall/error behavior, not disk hardware
or full power-loss recovery. Windows directory fsync is unavailable here.
Multi-host orchestration and public recovery remain separate work.

D-208 also verifies the new L1 on every node returned by the managed rollout before
writing the ledger. It first completes rollout for the whole group and validates the
public RPC identity, then checks subnet-tagged health and `eth_chainId` inside each
container. This order respects bootstrap peer dependencies; do not move the new-L1
gate ahead of rolling out the remaining nodes. At most three probes run concurrently,
each with a five-second budget for both reads and an abortable Docker client; curl
also has its own bound. The group has one 90-second monotonic deadline. Malformed
protocol/identity results stop immediately; missing/unhealthy chains may retry.

All managed nodes must pass in the same observation round. An earlier success is
rechecked when another node needs a later round; successes from disjoint healthy
periods are not combined. A failed readiness phase preserves the `created` journal
and any completed rollout. It does not automatically undo tracking or resubmit.
The response's `nodeReadiness` observations are not added to the public ledger or
persisted as a recovery proof; remeasure actual nodes when preparing reconciliation.
These checks do not establish block production, canonical block agreement, VM binary
integrity or future availability. Local HTTP/fake-Docker tests include a wrong
non-RPC node, wrong response ID and a real 90-second missing-L1 deadline. A real
new-chain rollout on the public validators remains pending owner-reviewed acceptance.

## Read-only inspection (D-206)

Run the operator tool against the intended config directory or a preserved copy of
its specific journal/ledger artifacts. The repository's development ledger is not
evidence of the current server. No token, signing key, Docker access or SSH is needed.

```powershell
node scripts/inspect-creation.mjs --config-dir C:\path\to\preserved-config
node scripts/inspect-creation.mjs --config-dir C:\path\to\preserved-config --rpc http://127.0.0.1:9650
```

The first command is offline. `--rpc` accepts an HTTP(S) origin without credentials,
path, query or fragment. Use the origin for the saved network. Requests have a
five-second timeout by default; `--timeout-ms` accepts 1 through 30000. A wrong or
unreadable network ID stops all subsequent chain lookups.

For a known blockchain ID the tool asks only `platform.getTxStatus`, `platform.getTx`
with JSON encoding, and (after transaction identity/commit checks) `eth_chainId`.
It compares returned transaction ID, network, P-chain parent, chain name, any recorded
subnet ID and SHA-256 of the exact decoded genesis bytes. It reports the VM ID but
does not establish VM binary integrity. These are observations from one RPC source,
not independent cryptographic proofs or evidence that every validator is ready.

An unresolved submission may lack an ID. The tool does not scan by name or replay
creation: names are non-unique in the fork. If operator evidence supplies a candidate,
add `--blockchain-id ID`; it must be CB58, must not disagree with an existing recorded
ID, and still requires the saved plan for comparison. Matching a candidate does not
prove that no second matching chain was created elsewhere.

JSON output includes hashes/sizes for six known artifact paths, the pending job's
identity summary and per-check results. It omits the complete genesis/plan, raw
transactions and credentials. It rechecks artifact hashes at the end; concurrent
changes make the result inconclusive. It writes no files and has no mutation mode.

| Exit | Verdict | Meaning |
|---|---|---|
| 0 | no_pending | No pending job or blocking artifact was found in this selected directory; not a deployment or creation-readiness gate |
| 1 | review_required | A reservation or conflict needs operator review; matching all RPC checks still returns 1 |
| 2 | inconclusive | Required evidence is unreadable, invalid, changing or unavailable; malformed CLI arguments also return 2 |

`recoveryAuthorized` is always false. Do not use a zero exit code or matching checks
to clear files, archive a job or send transactions automatically. Prepare the exact
reconciliation and obtain owner approval using the procedure above.

Validation includes actual CLI subprocesses with synthetic local files/RPC and
negative controls. Read-only public compatibility was also checked on Adam Chain
at 2026-09-06 18:12 UTC: a clearly synthetic local reservation built from its public
creation transaction matched network 999999998, Committed status, genesis and EVM
chain ID 9001000000. This was neither a real interrupted server job nor a recovery
drill. Evidence is retained in ignored `work/inspect-live-reference-z8G9AB`.
