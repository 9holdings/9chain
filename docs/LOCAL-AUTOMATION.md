# A1 local automation

## Standing authorization (2026-09-06)

The owner authorized autonomous edits, builds, tests, isolated local test networks,
documentation updates, and local commits within this project. Public deployment,
public GitHub publication, validator/genesis changes, and data deletion require
the owner's review of a concrete prepared result. Existing worktree ownership and
single-deployer rules remain in force. This authorization does not grant tool-level
filesystem or network permissions automatically.

## Repository checks

Run from the repository:

```powershell
node scripts/check-local.mjs --self-test
node scripts/check-local.mjs
node scripts/check-local.mjs --console
```

With Docker running, `node scripts/check-node-build-context.mjs` verifies the
node Dockerfile's source-only context using synthetic fixtures and a deliberately
unrestricted negative control. It retains evidence under ignored `work/`.

The runner stops on the first failed, inconclusive, timed-out, or unlaunchable
check. It checks worktree ownership, patch documentation consistency, deployment
import coverage, and chain ID allocation. Patch/import gates include their own
negative controls. It uses the current Node executable and resolves the repository
from the script path, so it does not depend on the caller's working directory.
The default profile also tests frozen console release preparation/verification
through actual Git repositories and CLI processes. Packaging is local only and
does not imply test acceptance or deployment approval; see `CONSOLE-RELEASE.md`.

The optional `--console` profile adds RPC transport tests plus four real local HTTP console suites:
paused creation, RPC identity at creation, deep options and governance. Their nodes/credentials are fake
and their operational state is isolated; they do not create public chains.
The RPC suite intercepts Docker in a test-only preload and never calls the actual
Docker executable. It exercises success/refusal after simulated CLI creation and
restart; it does not prove live blockchain behavior.
The profile also verifies persistent creation journals and ledger flush/backup
failure handling, including a console process killed during unresolved submission.
These use real local files/processes with synthetic external effects. Pending-job operation and
recovery boundaries are documented in `CREATION-RECOVERY.md`.
The profile also runs the read-only creation inspector through actual CLI subprocesses,
including conflicting identities and unchanged-artifact checks. Public RPC access
is optional in the operator tool and is never used by this local test profile.
It also verifies maintenance admission/persistence with real local files and HTTP
processes: queued, preflight and disconnected requests; restart persistence; stale
resume refusal. See `CONSOLE-MAINTENANCE.md` for the scope and deployment integration
still required. The synthetic tests never pause the public console.
The standalone maintenance client is also exercised via real CLI and stdin against
synthetic loopback HTTP, including contradictory readiness, identities, bounded
responses/timeouts and a lost resume response that must not be retried.
The profile checks post-rollout L1 readiness on managed nodes, including response
identity, concurrent probes, fresh observation rounds and cancellation. For the
longer actual-console timeout probe, run separately:

```powershell
node local-net/console/create-rpc-e2e-test.mjs --slow-readiness
```

This takes roughly 90 seconds with a synthetic node/Docker fixture. It verifies
timeout and retained reservation; it does not run an actual validator network.

To exercise the production managed-node transport through actual Docker Compose
and the node image's curl, run the optional integration check:

```powershell
node scripts/check-managed-node-rpc.mjs --runtime-image 9chain-a1/node:autopilot-20260906
```

It requires the selected node runtime image and the pinned Go 1.25.10 builder image
already present locally. It builds a standard-library-only synthetic RPC server
with networking disabled, then starts three isolated containers with no exposed
ports, no validator data and no keys. The runtime containers have read-only roots,
128 MiB each and 0.5 CPU each; the build has 2 GiB/2 CPUs and a three-minute deadline.
It verifies correct/wrong node identities, JSON/protocol errors, real process stderr
separation, Docker client timeout, cancellation after the request reached the server,
and termination of curl inside the container after the client is gone. Containers
are stopped on completion/failure and retained with evidence in ignored `work/`.
The explicit test-only environment variable `A1_TEST_REMOVE_CURL_TIMEOUT=1` removes
curl's bound in the test executor; the same check must fail because the in-container
request remains alive. This does not change production code or prove validator boot.

This is a local baseline, not a full release gate. It does not build the fork,
replay patches, run a blockchain, prove recovery, inspect live server state, or
authorize deployment. Keep using the existing release and deployment gates for
those purposes. Review scripts before adding them: some existing preflight checks
contact public services or require SSH.

## Optional Linux restart integration

```powershell
node scripts/check-console-restart.mjs
node scripts/check-console-restart.mjs --negative-legacy
```

The positive run must pass; the explicit legacy negative must exit nonzero because
the old name-based helper signals the unrelated console. The runner copies only
the console/operator release inventory and synthetic fixture. It builds a small
Node Alpine test image from the actual npm lock (registry access during image
build), then runs two real console processes with networking disabled, no host
ports or Docker socket, read-only root and temporary state, 512 MiB/1 CPU and a
120-second in-container deadline. Containers stop and evidence remains under work.
This is separate from the default local checks because it requires Docker and
image build dependencies; it never uses real console.env or operational data.

## Environment observed on 2026-09-06

- Node.js 24.16.0; Go 1.26.4 windows/amd64; Git 2.54.0.windows.1.
- Docker client/engine 29.6.2; Docker Desktop Linux engine reachable after tool approval.
- Git Bash exists at `C:/Program Files/Git/bin/bash.exe`; the default `bash` command
  resolves to the Windows system executable, so shell scripts must select Bash explicitly.
- SSH authentication verified at 19:05 UTC using existing configuration. Read-only
  health/chain-ID observations succeeded on all nine nodes for an existing L1 at
  19:08 UTC; no public service changes were performed.
- Git emits a sandbox permission warning reading the user's global ignore file.

## Next integration stages

1. Verify fork build dependencies and existing local test network inventory.
2. Prepare a bounded local integration run with explicit network identity and resource limits.
   Obtain review before genesis/validator changes or deleting any existing data.
3. Run existing recovery drills only after verifying their target and side effects.
4. Prepare public deployment with ownership checks, deploy lock, artifact identity,
   backup/recovery procedure, and live acceptance criteria; request owner approval.

Use existing SSH/Git credential mechanisms. Never put private keys or tokens into
this document, command output, or committed configuration. No scheduled task,
Git push, server write, or background service is installed by this local runner.
