# Read-only chain registration inventory

D-220 adds `scripts/inspect-chain-inventory.mjs` to inspect both directions of the
relationship between a selected console ledger and P-chain registration state. The
existing public-ledger gate checks advertised chain generation and EVM RPC identity;
it does not find registrations omitted from that ledger. This tool fills that narrow
gap and is not an automatic recovery or deployment gate.

## Use

Provide the exact ledger file and RPC origin to inspect; there are no implicit
operational directories or public calls:

```sh
node scripts/inspect-chain-inventory.mjs \
  --ledger-file /absolute/selected/console-chains.json \
  --rpc https://your-reviewed-rpc.example
```

The JSON report goes to stdout. The tool never writes the selected ledger, creates
directories, signs, imports/relaunches chains, restores state or deletes artifacts.
It never follows URLs from ledger entries. Do not pass a credential-bearing URL.
`--timeout-ms` accepts1..10000ms per request, default5000ms, within a30s RPC budget.

| Exit | Verdict | Meaning |
|---|---|---|
|0|aligned|Observed registrations and the selected ledger agree within this scope.|
|1|review_required|Missing/mismatched active entries, duplicated ledger identities, primary alias conflicts or unlisted registrations require explanation.|
|2|inconclusive|Inputs/identity/RPC cannot be validated, limits are exceeded or observations changed.|

`recoveryAuthorized` is always false, including exit0. Unlisted does not mean
malicious, abandoned or safe to remove: an intentional load-test chain may be absent
from the user console. There is no name-pattern exemption or automatic classification.

## What is measured

The explicit file must be regular, unlinked, reachable through real parents and
within4MiB/10000 combined active+retired entries. Its nearby `.tmp`/`.bak.tmp`
artifacts block inspection; an ordinary backup is not treated as an unfinished write.
The shared ledger parser is followed by strict name, CB58 blockchain/subnet identity,
positive safe-integer declared EVM ID and optional VM ID checks. Incomplete historical
entries return inconclusive instead of being silently discarded. No raw extra ledger
fields, admin values, URLs or RPC errors are included in the report.

Before inventory, four read calls establish exact A1 network ID/name and distinct
C/X blockchain aliases. The expected generation comes from chainid.mjs. Then two
`platform.getBlockchains` observations must have identical sorted identity digests;
ordering alone is ignored, malformed/duplicate IDs are refused. Four final identity
reads must agree with the first. The ledger file is read again before returning and
its exact byte digest must remain unchanged. This is a maximum of10 fixed read RPCs,
with no per-chain requests and no request following a ledger-provided URL.

The HTTP reader requires200JSON, matching JSON-RPC response ID/envelope, no redirects
and a4MiB body bound with a deadline through headers and body. Inventory is capped
at10000 entries. Raw error text/unknown RPC fields are not forwarded. These bounds
make this an A1 operational inspector, not a billion-chain indexing architecture.

Primary entries are recognized by the actual C/X alias IDs and all-zero primary
subnet ID; names alone cannot exempt a registration. Active entries must exist and
match immutable registration name/subnet and an optional declared VM. Retired entries
can match registrations that remain on-chain; absence is reported as not_observed
because an older generation may no longer exist on this network. Duplicate blockchain
or declared EVM IDs across active/retired lists require review. Every remaining
registration is returned as unlisted, even when its name matches a recorded chain.

The response contains the selected file digest, repeated inventory digests, network
identity, whitelisted registration fields, counts and fixed check codes. A declared
EVM ID is clearly labeled as declared; this tool does not call eth_chainId. It does
not prove exact genesis, VM execution, validator tracking, chain liveness, consensus,
node trustworthiness, an atomic snapshot or legacy admission drain. Subnet-only
creation, pending transactions, unrecorded genesis artifacts and later acceptance
of a previously submitted transaction are outside the registration comparison.
Keep the existing public ledger and creation-recovery checks for their own scopes.

The GetBlockchains response/primary handling were checked against the repository's
fork in upstream/avalanchego/vms/platformvm/service.go. That implementation labels
the API deprecated; future compatibility must be measured. Unsupported or changed
responses return inconclusive. Successful live use below is only the measured A1
version, not a promise about future Avalanche releases.

## Evidence, 2026-09-06

74 actual CLI/file/HTTP cases pass on Windows and Linux. Cases include both comparison
directions, same-name distinct registrations, active/retired/primary collisions,
subnet/name/VM mismatches, duplicate IDs, changed inventory/ledger/network/aliases,
missing/malformed/linked/oversized files, invalid origins and flags, strict HTTP/RPC
failures, non-forwarded secret markers and header/body deadlines. Read methods and
paths are allowlisted in the HTTP fixture; all selected input bytes remain unchanged
except deliberate test-server mutations. Link/argument controls start from a separately
accepted clean input so another refusal cannot make them pass accidentally.

Windows: work/chain-inventory-tests.log, work/inventory-test-7TEAPv. Linux:
work/chain-inventory-linux.log, input work/inventory-linux-mRDDKi; isolated512MiB/1CPU,
network-none/read-only-root container a1-autopilot-inventory-linux-20260906 exited0/noOOM.
Two copied-source negatives remove only the unlisted-registration refusal or repeated
inventory comparison. Actual CLI cases then fail for the intended missing behavior:
work/chain-inventory-negative.log, work/inventory-negative-unlisted-KU7apA and
work/inventory-negative-unstable-K8pH5v. No live source was altered for those controls.

Actual public read-only measurement23:16:05–23:16:11 UTC:13 P-chain registrations,
2 C/X primary entries,11 active ledger entries,0 retired and0 unlisted; verdict aligned.
The public ledger returned DYNAMIC cache status and identical bytes before/after,
SHA6998dfd8ca934c6b2ba83e4f41332550ddafeeaed2283c20028aee15df72be0d.
Report work/chain-inventory-live.json, SHA
181b64018e6e99509abe1c4f30668e1f42954de9e757bff545d42e5f315a669d;
receipt work/chain-inventory-live-evidence.json. This compares the public ledger
surface with public RPC, not the authoritative server file or all pending operations.
No public mutation occurred and it does not clear the legacy maintenance API404.
