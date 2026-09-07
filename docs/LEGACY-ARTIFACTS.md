# Read-only inspection of legacy creation evidence

D-221 turns the exploratory genesis inventory/comparison into reusable operator
tooling: `scripts/inspect-legacy-artifacts.mjs`. The command never writes artifacts,
backs up files, imports a chain, retries a transaction or authorizes recovery.

```sh
node scripts/inspect-legacy-artifacts.mjs --config-dir /absolute/selected/config
node scripts/inspect-legacy-artifacts.mjs --config-dir /absolute/selected/config \
  --rpc https://your-reviewed-rpc.example --timeout-ms 5000
```

Local mode makes no RPC request. RPC mode requires an explicit credential-free
origin; no URL from the ledger or genesis is followed. Output is JSON on stdout.
`recoveryAuthorized` is always false. Exit0 means scoped observations completed;
exit1 means conflicting/unresolved evidence needs review; exit2 means inconclusive.
The verdict distinguishes inventory_only, matched and no_current_candidates so an
empty candidate set is not presented as verified genesis matches.

## Selected inputs and preservation

The explicit directory must be real and unlinked. Inspect only six named state
files: primary ledger, its .bak/.tmp/.bak.tmp, and pending creation journal/.tmp.
Also inspect direct entries of console-tmp. Do not scan unrelated config files,
validator data, keys, environment files, logs, nested trees or journal history.
Backups/journals are metadata observations here, not validated recovery documents;
use the existing creation inspector for its separate journal semantics.

D-222 separately extends bounded backup schema2 to preserve selected console-tmp
bytes, including corrupt and outside-band files. See CONSOLE-BACKUP.md. Inspection
and backup have different bounds and purposes; this command remains read-only and
does not establish quiescence or authorize a public backup/restore.

The inspector opens only regular unlinked files with real parents. File descriptors
must match the observed inode/device; Linux also uses O_NOFOLLOW. Bounded reads and
post-read size/time checks refuse files changed during reading. A second complete
selected snapshot must match exact file/directory identities before returning.
This detects observed changes; it is not an atomic snapshot or protection against
an adversarial writer restoring bytes between observations.

Limits are4MiB per file,128MiB per snapshot read budget,1024 direct temporary entries
and1024 combined ledger entries. A one-byte overflow probe can detect a crossed byte
bound; no later file is opened after exhaustion. The bounded directory iterator
stops at the count limit. Unknown names, nested directories, links, FIFOs, unreadable
files and invalid genesis/ledger identities make the result inconclusive. The report
keeps their presence visible; it does not silently discard them.

Only direct ASCII names ending in .json are candidate genesis files. Candidate
metadata includes exact SHA-256, byte length, declared EVM chain ID and allocation
account count. Raw genesis, allocation addresses/balances, admin values, private
fields and raw RPC errors are not returned. Outside-current-band files remain
unclassified evidence; that category never permits deleting files or reusing IDs.
The current band/network comes from chainid.mjs, without changing genesis/constants.

A pending journal or unfinished state write forces review. Missing/invalid primary
ledger is inconclusive. Duplicate ledger IDs or multiple current-band artifacts with
one declared EVM ID require review. A current-band artifact without one ledger match
is unlisted; an active chain without an artifact is also flagged. Current-band retired
entries can still be compared with registrations that remain on-chain. The tool does
not invent a reservation from any of these files.

## Optional RPC comparison

Validate the exact A1 network ID/name before transaction reads and again afterwards.
For each unambiguous candidate, query only its ledger-selected transaction ID using
platform.getTxStatus and platform.getTx. Status must be Committed; Unknown,
Processing or any other unconfirmed state is inconclusive, never proof of absence.
The transaction must identify the selected blockchain/subnet/name, expected network,
primary P-chain parent and a valid VM ID; compare an explicit ledger VM when present.
Canonical base64 genesis bytes must exactly match the on-disk digest. Equivalent
parsed JSON with different bytes does not pass.

At most128 candidates enter RPC mode, in batches of three candidates/six requests.
There is a30s total RPC budget, with per-request1..10000ms deadlines (default5000)
covering headers and bodies. RPC bodies are bounded to8MiB and decoded genesis to4MiB.
File reads are bounded separately; the RPC budget is not a filesystem wall-clock bound.

`local-net/lib/inspection-rpc.mjs` now supplies shared strict200JSON, response-envelope,
no-redirect, bounded-body reads for this tool and D-220 inventory. Its six-method
allowlist has no transaction write method. D-220 retains its4MiB reply limit and74-case
behavior. This shared module does not change the generic console RPC transport.

Matches are observations from the queried node. They do not independently validate
transaction signatures, the P-chain consensus or VM execution. They do not prove
legacy admission drain, absence of pending/mempool transactions, completion of
subnet-only operations, per-node tracking, liveness or safety of a later restart.
See CONSOLE-FIRST-ADOPTION.md before planning a public transition.

## Evidence, 2026-09-06

93 Windows and94 Linux controls pass: actual CLI/file/HTTP scenarios plus eight
direct shared-RPC controls. Linux adds an actual FIFO refusal. The suite covers exact
genesis bytes, equivalent-JSON mismatch, active/retired/unlisted/duplicate candidates,
network/transaction identity, pending/unfinished artifacts, malformed/missing/linked/
oversized inputs, valid JSON beyond byte/count limits, total-byte and candidate caps,
actual read failure, non-forwarded secret markers, non-followed redirects, allowed
read methods and header/body deadlines. An open spy confirms unknown .env entries
are never opened. Each ordinary case preserves the exact synthetic input tree.

Twenty-one simulated pending candidates exercise the real30s total deadline. The
actual CLI returns within the asserted28..33.5s interval, without starting a new
batch after the deadline. Raising only that deadline to60s in copied source makes
the intended control fail. Two other copied-source negatives remove exact-genesis
or final-snapshot comparison; the corresponding CLI cases then fail for false
acceptance. Earlier malformed negative-fixture replacement was corrected before
these accepted controls; a syntax failure was not counted as evidence.

Windows: work/legacy-artifacts-tests.log, work/legacy-artifacts-test-Ju7bLZ. Linux:
work/legacy-artifacts-linux.log, inputs work/legacy-artifacts-linux-ZO8zKW; isolated
768MiB/1CPU,256MiB tmpfs, network-none/read-only-root container
a1-autopilot-legacy-final-linux-20260906. D-220 74 controls also pass in that container.
Negative log work/legacy-artifacts-negative.log; copied fixtures
work/legacy-negative-genesis-BZO7i9, work/legacy-negative-stability-zg4dLm and
work/legacy-negative-budget-8wptPL. The last three controls preceded test-only
strengthening of byte/count fixtures; production inspector bytes stayed unchanged.

Actual on-server read23:41:46 UTC: the tested module and its explicit dependencies
were streamed in memory over SSH, without installing files. It compared the real
selected server ledger/artifacts and RPC, matching11 current-band candidates with11
active entries,55 outside-band artifacts retained,0 retired and no conflict/unknown
checks. Before/after snapshot SHA
7a05dfaeaba9a2f3d502ddc8441b90e704d60d338eb34ad6f73bad1b8f32cbe7.
Report work/legacy-artifacts-live.json, SHA
bf511e01111bf49a9c9414b0b2c5baa67804fbc9d16c5d314d9ec808f59f2e51;
receipt work/legacy-artifacts-live-evidence.json. Source hashes/stream digest in
work/legacy-artifacts-remote-source.json; runner work/legacy-artifacts-remote.mjs.
No server files, console state or chain transactions were changed. This is read-only
compatibility evidence, not public deployment or first-transition approval.

The real D-220 aggregate console profile took107233ms. Adding this actual30s budget
drill and other controls requires a larger aggregate allowance: release validation
now permits240s for check-local, while its individual child checks keep120s,
deployment keeps360s and the total validation ceiling stays600s. The existing actual
hung-child CLI control still proves a shorter requested overall deadline wins.
The22-case actual validator CLI regression passed after this change:
work/legacy-artifacts-validation-regression.log, work/release-validation-test-fHiEOI.
