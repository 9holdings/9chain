# Console maintenance and restart admission

Implemented locally in D-210 on 2026-09-06. **Not deployed.** The legacy
`console-deploy.sh` does not yet use this protocol; do not treat the API addition
alone as a completed public deployment procedure.

## Why rollout progress is insufficient

An actual local HTTP test held one create request in its generation RPC and queued
a second. `/api/progress.running` was false: neither had reached rollout progress.
Restarting then would interrupt admitted work. Owner transfer also does not use
that progress object. Deployment needs an admission barrier and a count of all
accepted mutations, not merely the currently displayed rollout step.

The new gate counts authenticated requests to create, revoke, upgrade and transfer
owner before reading their bodies. It retains that admission through preflight,
queue waiting and execution until the handler finishes. Disconnecting the client
does not release work still executing. Completing, rejecting or aborting an
incomplete body releases admission exactly once.

## Operator API

These endpoints accept the existing operator bearer token. Missing authentication
returns 401; an authenticated SIWE wallet returns 403. Never put the operator token
in a browser, documentation, command output or committed configuration.

| Endpoint | Effect |
|---|---|
| `GET /api/maintenance` | Read this process's admission state |
| `POST /api/maintenance/pause` | Persist a pause and reject new chain mutations; existing work continues |
| `POST /api/maintenance/resume` | Explicitly reopen after validating the current process and pause identifiers |

Successful responses contain:

```json
{
  "instanceId": "current-process-uuid",
  "maintenanceId": "current-pause-uuid",
  "paused": true,
  "activeOperations": 0,
  "persistent": true,
  "readyForRestart": true
}
```

`maintenanceId` is null before the first pause. Repeated pause calls retain its ID.
A later new pause or a restarted process changes the corresponding identifier.
Resume accepts a JSON object containing the freshly read `instanceId` and
`maintenanceId`. Stale/missing identifiers or active work return 409. Malformed JSON
returns 400. Persistence/inspection failures return 503 and require investigation.

`readyForRestart` means **this single console process** has persisted its pause and
has zero admitted mutation handlers. It does not verify other processes, validators,
Docker operations started elsewhere, absence of a pending creation journal, release
integrity or owner approval. It is false while open even when no operations run.
The existing authenticated status/progress responses add this same object under
`maintenance`; their other fields retain their existing meanings.

While paused, new requests to `/api/create`, `/api/revoke`, `/api/upgrade` and
`/api/transfer-owner` receive 503. Read-only views and previews remain available,
subject to their existing authentication, rate limits and journal/ledger checks.

## Persistent marker and failure semantics

The marker is the empty directory `9chain-a1-config/console-maintenance/`, ignored
by Git and excluded from deployment code. It is distinct from the creation journal
and contains no transaction, token or key. Startup with this directory stays paused.
Symlinks, files, nonempty directories and unreadable state are refused; the tool
does not recursively remove or clean any such material.

Pause closes admissions synchronously before attempting persistence. On POSIX it
flushes the marker directory and its parent. A failed write/flush leaves the process
paused but does not claim `readyForRestart`; retrying pause can reestablish the
marker after inspection. Windows lacks this directory-flush path: local tests there
verify process behavior, not power-loss durability.

Resume removes only the verified empty marker and flushes its parent on POSIX.
Failure after removal can leave the marker absent while this process stays paused.
An error is **not** a promise of rollback: read current state and reassert pause if
needed before restarting. A fresh process cannot recover a removed marker from
memory. External marker removal also never reopens an already paused process.

## Required deployment integration

The next deployment script must perform local checks before touching the server,
acquire the existing deployment lock, pause admissions, and wait for a stable
process/pause identity with `persistent=true`, `activeOperations=0` and
`readyForRestart=true` **before copying code or restarting**. An unreadable state,
timeout, protocol mismatch or old server without these endpoints must stop the
automated path. No fail-open fallback based on `progress.running=false` is valid.

Preserve release bytes and relevant operational artifacts outside running-code
directories before replacement. Restart must keep the marker, verify the new
process identity, release hashes/imports and read-only network/ledger checks, then
require an explicit resume step. Failure keeps the service paused and preserves
artifacts for review. Recovery of a pending creation remains governed by
`CREATION-RECOVERY.md`; maintenance resume neither reconciles nor clears it.

The first deployment onto the current legacy server needs a separately reviewed
bootstrap procedure because its process cannot execute this new pause endpoint.
Public deployment/restart and any public transaction remain owner-approved actions.

## Measurements

- Before implementation: the actual console reports rollout `running=false` while
  a preflight RPC is held and another mutation is queued; admission assertion fails
  for that reason (`work/maintenance-before.log`).
- Actual HTTP/process test: operator versus wallet authorization; all four mutation
  routes blocked; active/disconnected/queued requests counted; partial and dropped
  request bodies; persisted pause across restart; stale/malformed resume refused;
  no ledger or genesis output (`maintenance-e2e-test.mjs`).
- Real-file tests: marker creation/read/removal faults, malformed/nonempty markers,
  idempotent release, external marker removal and stale process/pause identifiers.
- Isolated Linux test `a1-autopilot-maintenance-linux-20260906`: network disabled,
  read-only source, 256 MiB/1 CPU, synthetic tmpfs. Also exercises actual POSIX
  directory sync failures and visibility after removal. Passed, container exited.
  This is fault injection on local files, not a hardware power-loss experiment.

Tests are included in `node scripts/check-local.mjs --console`. Evidence logs:
`work/maintenance-full-profile.log` and `work/maintenance-linux.log`.
