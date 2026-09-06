# Deployment invocation lock

D-214 replaces the earlier host/user/branch/commit identity with a unique UUID for
each invocation of the Bash wrapper. Two shells on the same checkout are distinct
deployments. Repeating acquire, even with the same UUID, is refused. Age alone never
authorizes takeover: a stalled SSH client does not prove its remote work has ended.

## Protocol and transport

Source `local-net/deploy/deploy-lock.sh` on the development machine. It preserves
`deploy_lock_acquire SURFACE` and `deploy_lock_release SURFACE` and adds
`deploy_lock_assert SURFACE` for checks between phases. Ownership is checked before
acquire can contact the server or create lock state. The actor captures its initial
Git branch/commit and a random invocation UUID.

The standalone Node backend is sent over SSH stdin, with a bounded base64 JSON
request; coordinates and actor labels are data, not interpolated shell paths.
Existing SSH authentication is used. The remote machine needs Node, but does not
need a preinstalled backend. The operator manifest includes the backend so a release
can freeze the exact code to transmit.

Locks live beside A1_SRC_DIR in `deploy-locks/SURFACE.lock/`. The source must be a
real existing directory named src; source/parent and lock directories must not
resolve through symlinks/junctions. Atomic mkdir decides acquisition. The new
directory contains only `holder.json`, schema 2, with surface, actor and time.
Files and relevant directories are flushed on POSIX; Windows does not claim
directory fsync. A crash before completion may leave an incomplete lock, which
is refused and retained.

There is deliberately no legacy `holder` file. The actual old TTL client refuses
a directory without that file and cannot acquire or release it. The new backend
also refuses legacy, corrupt, incomplete or contaminated locks. Neither their age
nor an apparent same-host retry authorizes takeover or a holder rewrite.

Assert and release require all actor fields, including invocation UUID, to match.
Release writes and flushes an atomic `deployed/SURFACE.json` receipt first;
optional A1_DEPLOY_RELEASE_SHA256 adds the release metadata hash. It then rechecks
ownership, removes only holder.json and its empty directory, and flushes the lock
parent. There is no recursive removal. Unexpected material or filesystem failure
is nonzero and may leave incomplete state for review. A receipt records what the
caller declared complete; it does not independently run acceptance checks.

Exit 0 means the requested phase completed, 1 means a known holder conflict, and
2 means invalid input or inconclusive filesystem/protocol state. Errors never
contain credentials or source file contents. A concurrent loser may receive 2 if
it observes the winner before holder creation finishes; either nonzero result
must stop deployment.

## Recovery and limits

There is no automatic expiry, breaking or retry bypass. If a deployment dies,
identify its invocation and phase evidence, inspect maintenance and remote work,
and prepare a concrete recovery action for owner review. Do not remove an old
lock merely because its timestamp is old. A partially completed release may
already have a receipt while lock cleanup failed; inspect both.

This excludes cooperating deployers for one surface on one filesystem. It cannot
stop manual SSH writes, coordinate scripts that never acquire the lock, prove
process liveness or replace console maintenance/drain. The legacy console-deploy.sh
still needs replacement and remains unsuitable for public use. Nothing here
authorizes a public deployment, maintenance change or lock removal.

## Measurements

- Actual old wrapper, two independent Bash processes on the same main commit:
  the second acquire incorrectly succeeds. The new assertion fails for that reason
  in `work/deploy-lock-negative.log` / `work/deploy-lock-P9ErMw`.
- New backend/wrapper: 38 CLI/process checks pass, including eight concurrent
  contenders with one winner, reentry and age refusal, actor-bound assert/release,
  exact receipt, stdin transport, invalid inputs, legacy/incomplete/corrupt/extra
  state, failed receipt writes, linked source refusal and ownership before changes.
  Actual old clients cannot acquire or release a new lock.
- The real Bash `--self-test` entry point passes: `work/deploy-lock-bash-self-test.log`,
  `work/deploy-lock-07vugT`.
- Thirty-two backend checks, including filesystem flushes and concurrent processes,
  pass on Linux: network none, read-only source/root, synthetic tmpfs, 512 MiB/1 CPU,
  90-second inner deadline. `a1-autopilot-deploy-lock-linux-20260906` exited 0/no OOM;
  `work/deploy-lock-linux.log`. This is not hardware power-loss testing.
- Twenty local checks pass in `work/deploy-lock-full-profile.log`. No public lock
  or service was changed.
