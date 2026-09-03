#!/usr/bin/env bash
#
# measure-node-load.sh — CPU and RAM of the nine validator containers, measured from cgroup v2
# counters on the server, over a fixed window. Prints one table and one JSON line.
#
# ═══ WHY THIS SCRIPT EXISTS ═══
#
# `docker stats --no-stream` printed the SAME figure (`563,2%`) on two consecutive runs
# (2026-09-03) and, earlier, three wildly different figures for one idle container
# (50,65% · 4,20% · 39,46%, 2026-08-25). It samples a ~1s window and reports whatever fell in it.
# The load baselines recorded in HANDOFF (2 L1 · CPU 0.952 core · RAM 5270 MiB) were taken with
# an ad-hoc cgroup command that was never written down — so the next sample could not be
# compared with confidence. This file IS that command, so the next number is comparable.
#
# What it measures — and where:
#   CPU  : delta of `cpu.stat usage_usec` over the window ⇒ average cores consumed. Counters are
#          cumulative since container start, kept by the kernel, not sampled by a client.
#   RAM  : `memory.current` at the END of the window (instantaneous, includes page cache the
#          kernel charges to the cgroup — the same quantity the earlier baselines used).
#   Where: ON THE SERVER, under /sys/fs/cgroup/system.slice/docker-<id>.scope/. Not the RPC, not
#          the repo — the running processes.
#
# 🔴 Comparability rules (learned 2026-09-03):
#   - A node younger than ~30 minutes is NOT comparable: it is still bootstrapping and has not
#     grown its steady-state heap (5-minute sample: CPU 1.224 · RAM 1412 MiB, both misleading).
#     The script prints node age; you decide whether the sample is worth keeping.
#   - Load depends on how many L1s the nodes track and whether the heartbeat pump is running.
#     Both are printed alongside so a number never travels without its context.
#
# Exit codes (shared convention of the toolset): 0 measured · 1 measurement invalid (fewer nodes
# than expected, or a cgroup file missing) · 2 could not measure (ssh failed).
#
# Usage:
#   bash scripts/measure-node-load.sh                    # 60s window, expects 9 nodes
#   bash scripts/measure-node-load.sh --seconds 20       # shorter window (less precise)
#   bash scripts/measure-node-load.sh --expect 9         # how many node containers must exist
#   bash scripts/measure-node-load.sh --name-filter X    # docker name filter (default 9chain-a1-node-)
#                                                        #   a filter matching nothing ⇒ exit 1 — the
#                                                        #   reverse control for this gate

set -u

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../local-net/deploy/server-env.sh
source "$here/../local-net/deploy/server-env.sh"

SECONDS_WINDOW=60
EXPECT=9
NAME_FILTER="9chain-a1-node-"
LEDGER_URL="https://a1.9chain.org/chains/data/console-chains.json"

while [ $# -gt 0 ]; do
  case "$1" in
    --seconds) SECONDS_WINDOW="$2"; shift 2 ;;
    --expect) EXPECT="$2"; shift 2 ;;
    --name-filter) NAME_FILTER="$2"; shift 2 ;;
    --ledger-url) LEDGER_URL="$2"; shift 2 ;;
    -h|--help) sed -n '2,45p' "$0"; exit 0 ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
done

# Context that lives OUTSIDE the server: how many L1s the public ledger lists right now.
# Fetched locally so the measurement does not depend on the server being able to reach its own
# public hostname through Cloudflare.
L1_COUNT="$(curl -sL --max-time 20 "$LEDGER_URL" 2>/dev/null \
  | tr -d '\r\n ' | grep -o '"chainId":' | wc -l | tr -d ' ')"
[ -n "$L1_COUNT" ] || L1_COUNT="?"

# Everything below runs on the server. Arguments are passed positionally to `bash -s`.
remote_script='
set -u
WINDOW="$1"; EXPECT="$2"; FILTER="$3"
CG=/sys/fs/cgroup/system.slice

start_iso="$(date -u +%FT%TZ)"
mapfile -t rows < <(docker ps --filter "name=$FILTER" --format "{{.ID}} {{.Names}}" | sort -k2)
n=${#rows[@]}
if [ "$n" -lt "$EXPECT" ]; then
  echo "INVALID: expected $EXPECT node containers matching \"$FILTER\", found $n" >&2
  exit 1
fi

declare -a ids names cpu0 started
for i in "${!rows[@]}"; do
  short="${rows[$i]%% *}"; names[$i]="${rows[$i]#* }"
  ids[$i]="$(docker inspect -f "{{.Id}}" "$short")"
  started[$i]="$(docker inspect -f "{{.State.StartedAt}}" "$short")"
  f="$CG/docker-${ids[$i]}.scope/cpu.stat"
  if [ ! -r "$f" ]; then echo "INVALID: $f not readable (cgroup layout changed?)" >&2; exit 1; fi
  cpu0[$i]="$(awk "/^usage_usec/ {print \$2}" "$f")"
done
t0=$(date +%s%N)
sleep "$WINDOW"
t1=$(date +%s%N)
elapsed_us=$(( (t1 - t0) / 1000 ))

now_s=$(date +%s)
total_cores=0; total_mib=0
printf "%-18s %8s %9s %10s\n" "container" "cores" "RAM MiB" "age"
for i in "${!rows[@]}"; do
  d="$CG/docker-${ids[$i]}.scope"
  cpu1="$(awk "/^usage_usec/ {print \$2}" "$d/cpu.stat")"
  mem="$(cat "$d/memory.current")"
  cores=$(awk -v a="${cpu0[$i]}" -v b="$cpu1" -v e="$elapsed_us" "BEGIN {printf \"%.3f\", (b-a)/e}")
  mib=$(( mem / 1048576 ))
  st_s=$(date -u -d "${started[$i]}" +%s)
  age_s=$(( now_s - st_s ))
  printf "%-18s %8s %9s %7dm%02ds\n" "${names[$i]}" "$cores" "$mib" $(( age_s / 60 )) $(( age_s % 60 ))
  total_cores=$(awk -v t="$total_cores" -v c="$cores" "BEGIN {printf \"%.3f\", t + c}")
  total_mib=$(( total_mib + mib ))
done
min_age_s=""
for i in "${!rows[@]}"; do
  st_s=$(date -u -d "${started[$i]}" +%s); a=$(( now_s - st_s ))
  if [ -z "$min_age_s" ] || [ "$a" -lt "$min_age_s" ]; then min_age_s=$a; fi
done
hb="$(docker inspect -f "{{.State.Status}}" 9chain-a1-heartbeat 2>/dev/null || echo absent)"
load="$(cut -d" " -f1-3 /proc/loadavg)"
ncpu="$(nproc)"
end_iso="$(date -u +%FT%TZ)"
printf "%-18s %8s %9s\n" "TOTAL ($n nodes)" "$total_cores" "$total_mib"
echo "window ${start_iso}..${end_iso} (${elapsed_us}us) · host loadavg $load on $ncpu cpus · heartbeat $hb · youngest node ${min_age_s}s"
echo "JSON {\"measuredAt\":\"$end_iso\",\"windowSec\":$WINDOW,\"nodes\":$n,\"cpuCores\":$total_cores,\"ramMiB\":$total_mib,\"youngestNodeAgeSec\":$min_age_s,\"hostLoadavg\":\"$load\",\"hostCpus\":$ncpu,\"heartbeat\":\"$hb\"}"
'

out="$(ssh -i "$A1_SSH_KEY" -o ConnectTimeout=20 -o BatchMode=yes "$A1_SSH_HOST" \
  bash -s -- "$SECONDS_WINDOW" "$EXPECT" "$NAME_FILTER" <<<"$remote_script" 2>&1)"
rc=$?

if [ $rc -eq 255 ]; then
  echo "CANNOT MEASURE: ssh to $A1_SSH_HOST failed" >&2
  echo "$out" >&2
  exit 2
fi
if [ $rc -ne 0 ]; then
  echo "$out" >&2
  exit 1
fi

echo "$out" | sed '/^JSON /d'
# Append the L1 count (measured from the public ledger, not from the server) to the JSON line.
echo "$out" | sed -n 's/^JSON \(.*\)}$/\1,"l1Count":'"$L1_COUNT"'}/p'
exit 0
