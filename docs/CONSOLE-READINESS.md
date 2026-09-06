# Console readiness and loaded configuration

D-219 adds an operator-only observation of the actual console before a reviewed
release can finish paused or resume. This is local implementation and test evidence;
the public legacy console has not been upgraded during the autonomous window.

## What the observation proves

`GET /api/maintenance/readiness?probeId=<fresh UUIDv4>` requires the operator token,
returns `Cache-Control: no-store`, and accepts exactly one query parameter. Missing
authentication returns401, wallet authentication403 and malformed queries400 before
RPC work. An authenticated valid request performs four fresh RPC calls through the
console's loaded NODE_URI: network ID, network name, parent C-chain ID and node version.
The expected network values come from chainid.mjs: g1,999999998,9chain-a1-g1 and
9000000009. The parent ID is a shared JavaScript constant; no genesis or validator
configuration changed. Node version is checked for format and reported. It is not
binary, fork-commit or build attestation, and does not replace live core acceptance.

Each RPC has a three-second header/body deadline and64KiB response bound. The shared
RPC transport now has a16MiB default response limit, configurable up to64MiB. It
retains its existing HTTP/JSON-RPC checks; this change does not add strict HTTP200,
content-type or redirect policy to that generic transport.

After RPC, readiness reads the ledger using existing strict loading and unfinished
write checks, and reads the creation journal. It returns only fixed reason codes,
chain/retired counts, network values and maintenance identity/state. Corrupt or
unreadable state, unfinished ledger writes, unresolved creation or wrong/unavailable
RPC produces503. It does not repair state, launch children or create a chain.
Healthy describes these checks; the operator client separately requires persisted,
drained maintenance on the exact process and pause UUIDs.

## Configuration binding

At module startup the console captures an immutable SHA-256 over a versioned ordered
list of24 explicit environment settings. Missing values are distinct from strings.
The list covers direct console settings, credentials, limits, node/compose/VM/RPC
coordinates and Node runtime environment overrides. Raw values never enter the
readiness response or deployment receipt. A1_CONSOLE_START_PAUSED is deliberately
excluded because restart forces it to1; maintenance is independently observed.

This is an identity for those loaded environment inputs, not a backup of console.env,
the contents of referenced config/certificate files, command-line arguments, all
inherited environment variables or effective infrastructure state. The hash is not
encryption, a signature or approval. Deployment evidence remains operator material.
An E2E coverage check detects newly referenced direct process.env/requireSecret/
requireInt keys that are absent from the explicit policy; review indirect settings
when adding them. Readiness never hashes the current file and calls it loaded state.

The Linux install helper captures the intended configuration from the existing
console.env silently sourced on-server during backup. Every later phase and its
receipt must match that digest. After targeted restart, then again during verify
and resume, actual console readiness must match the intended digest and new paused
process. This permits upgrading an older maintenance-capable console that lacks
readiness, but requires the replacement to support it. Legacy maintenance HTTP404
still blocks routine deployment; there is no bootstrap bypass here.

The readiness client accepts only a credential-free loopback HTTP origin. It sends
a fresh nonce, refuses redirects, requires exact200JSON, caps the response at64KiB
and applies one five-second deadline through the body. It validates nonce, network,
ledger counts, empty reasons, no pending creation, configuration and drained process
identity, and returns whitelisted fields. It does not retry or mutate the service.
This is an observation, not a transaction spanning RPC, filesystem and later resume;
the existing lock and repeated maintenance guards bound the deployment workflow.

## Evidence, 2026-09-06

- 40 actual client HTTP/input cases: stale/wrong configuration and identities,
 contradictory health, network/type/count failures, HTTP/auth/redirect/protocol/body
 bounds and deadlines. Unexpected root/network fields are not forwarded.
- 31 actual-console E2E cases: operator/wallet access, fresh RPC, wrong network/chain,
 unreadable ledger/journal, pending creation, admitted partial-body drain and loaded
 configuration identity. A test-only preload changes process.env after startup;
 readiness still reports the original captured input identity. No such header or
 mutation behavior exists in production. Real fixture files are retained/restored,
 child execution is denied, no chain is created.
- 22 shared RPC transport cases include a valid oversized reply rejected at64KiB and
 accepted at128KiB, plus invalid bounds and existing transport/deadline checks.
- 33 actual Linux deployment CLI scenarios now include configuration changes after
 backup/restart, a replacement launched with a wrong setting, wrong network name and
 wrong parent chain. They stop at the intended phase/reason and remain paused.
 Inner product/public gates in this orchestration fixture remain placeholders.

Windows logs: work/console-readiness-client.log, work/console-readiness-e2e.log,
work/console-readiness-full-profile.log (26 local groups). Latest console fixture:
work/readiness-console-t6tcnV. Linux40+31 checks pass in
work/console-readiness-linux.log, inputs work/readiness-linux-G8g4dQ; the isolated
512MiB/1CPU/no-network/read-only-root container exited0/noOOM.

Deployment log: work/console-readiness-deployment.log; evidence
work/console-deployment-qOKgGt/evidence, isolated2GiB/2CPU container exited0/noOOM.
Removing only the client configuration comparison makes the real HTTP mismatch test
fail: work/readiness-configuration-negative.log and
work/readiness-config-negative-gyinYX. Replacing the captured startup digest with
a request-time environment digest makes the actual-console loaded-state assertion
fail: work/readiness-startup-negative.log and work/readiness-startup-negative-Wbg1Zv.
These are deliberate copied-source negative controls, not modifications to live code.

No public rollout, consensus-liveness, workload capacity, power-loss durability or
whole-server configuration claim follows from these checks.
