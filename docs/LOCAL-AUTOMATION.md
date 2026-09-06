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
```

The runner stops on the first failed, inconclusive, timed-out, or unlaunchable
check. It checks worktree ownership, patch documentation consistency, deployment
import coverage, and chain ID allocation. Patch/import gates include their own
negative controls. It uses the current Node executable and resolves the repository
from the script path, so it does not depend on the caller's working directory.

This is a local baseline, not a full release gate. It does not build the fork,
replay patches, run a blockchain, prove recovery, inspect live server state, or
authorize deployment. Keep using the existing release and deployment gates for
those purposes. Review scripts before adding them: some existing preflight checks
contact public services or require SSH.

## Environment observed on 2026-09-06

- Node.js 24.16.0; Go 1.26.4 windows/amd64; Git 2.54.0.windows.1.
- Docker client/engine 29.6.2; Docker Desktop Linux engine reachable after tool approval.
- Git Bash exists at `C:/Program Files/Git/bin/bash.exe`; the default `bash` command
  resolves to the Windows system executable, so shell scripts must select Bash explicitly.
- SSH executable exists; server authentication has not been verified by this setup.
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
