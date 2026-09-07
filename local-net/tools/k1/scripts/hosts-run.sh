#!/usr/bin/env bash
# Run one of the kit's measurement scripts on EVERY machine in an inventory over SSH, and print the
# lines prefixed with the machine name. This is how 10-measure-plugins.sh and 14-startclose.sh become
# cluster-wide gates (PROCUREMENT-K1 §5 items 4–5): the scripts already take container names, and on a
# K1 machine the containers are whatever `docker ps` lists with the k1- prefix.
#
# Usage: scripts/hosts-run.sh <inventory.json> <script-in-scripts/> [args…]
#   scripts/hosts-run.sh hosts/inventory.json 14-startclose.sh        # exit 1 if ANY machine is red
#   scripts/hosts-run.sh hosts/inventory.json 10-measure-plugins.sh   # RSS per container, all machines
# Local mode for testing the fan-out without machines: K1_HOSTS_LOCAL=1 runs the script here instead.
set -uo pipefail
cd "$(dirname "$0")/.."
INV="${1:?inventory.json}"; SCRIPT="${2:?script name in scripts/}"; shift 2
[ -f "scripts/$SCRIPT" ] || { echo "✗ scripts/$SCRIPT not found" >&2; exit 1; }
rc=0
if [ "${K1_HOSTS_LOCAL:-}" = "1" ]; then
  containers=$(docker ps --format '{{.Names}}' | grep '^k1-' || true)
  bash "scripts/$SCRIPT" $containers "$@" | sed "s/^/local  /" || rc=1
  exit $rc
fi
while read -r name ip; do
  out=$(ssh -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10 "root@$ip" \
        'bash -s -- $(docker ps --format "{{.Names}}" | grep "^k1-" | tr "\n" " ")' < "scripts/$SCRIPT" 2>&1) || rc=1
  printf '%s\n' "$out" | sed "s/^/$name  /"
done < <(jq -r '.machines[] | "\(.name) \(.ip)"' "$INV")
exit $rc
