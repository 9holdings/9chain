#!/usr/bin/env bash
# Phase 0.1 — RAM of the node process and of EVERY subnet-evm plugin process inside each container.
#
# Why per-process and not just `docker stats`: the question K1 asks is "how much does ONE MORE
# ledger cost this node", and the answer is the RSS of one more plugin process. `docker stats`
# gives the cgroup total (also printed, as the cross-check), not the per-chain marginal cost.
#
# Usage: scripts/10-measure-plugins.sh [container ...]   (default: the three drill nodes)
# Output: one line per container: total RSS, avalanchego RSS, plugin count, plugin RSS sum/min/max (MiB).
set -uo pipefail
CONTAINERS=("$@")
[ ${#CONTAINERS[@]} -eq 0 ] && CONTAINERS=(9chain-a1-tap-node-1 9chain-a1-tap-node-2 9chain-a1-tap-node-3)
printf "%-24s %8s %8s %4s %9s %8s %8s   %s\n" container totalMiB avagoMiB n plugSum plugMin plugMax cgroupMiB
for c in "${CONTAINERS[@]}"; do
  # `ps` is not in the image; /proc is. RSS field 24 of /proc/<pid>/stat is in pages (4 KiB).
  docker exec "$c" sh -c '
    total=0; avago=0; n=0; sum=0; min=0; max=0
    for s in /proc/[0-9]*/stat; do
      pid=${s#/proc/}; pid=${pid%/stat}
      comm=$(cut -d" " -f2 "$s" 2>/dev/null); rss=$(cut -d" " -f24 "$s" 2>/dev/null)
      [ -z "$rss" ] && continue
      mib=$((rss*4/1024)); total=$((total+mib))
      case "$comm" in
        "(avalanchego)") avago=$((avago+mib));;
        *) if grep -qa "plugins/" /proc/$pid/cmdline 2>/dev/null; then
             n=$((n+1)); sum=$((sum+mib)); [ $min -eq 0 -o $mib -lt $min ] && min=$mib; [ $mib -gt $max ] && max=$mib; fi;;
      esac
    done
    echo "$total $avago $n $sum $min $max"' 2>/dev/null | {
      read -r total avago n sum min max || { echo "$c: exec failed"; continue; }
      cg=$(docker stats --no-stream --format '{{.MemUsage}}' "$c" 2>/dev/null | awk '{print $1}')
      printf "%-24s %8s %8s %4s %9s %8s %8s   %s\n" "$c" "$total" "$avago" "$n" "$sum" "$min" "$max" "$cg"
    }
done
