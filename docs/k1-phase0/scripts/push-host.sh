#!/usr/bin/env bash
# Push one machine's deploy directory (from `l1-batch compose`) to /opt/k1 on that machine and
# start it. Idempotent: rsync only changes; `compose up -d` restarts only services whose config
# changed. --track-subnets is a startup flag, so a changed AVAGO_TRACK_SUBNETS DOES restart that node
# — which is the point (l1-batch render → compose → push = "restart once with the full list").
#
# Usage: scripts/push-host.sh <machine-name> [inventory.json] [--no-up]
#   e.g. scripts/push-host.sh k1-m01 hosts/inventory.json
# Needs: ssh root@<ip> with the K1 key (never the g1 key), rsync on both ends.
set -euo pipefail
cd "$(dirname "$0")/.."
M="${1:?machine name, e.g. k1-m01}"
INV="${2:-hosts/inventory.json}"
NOUP="${3:-}"
IP=$(jq -r --arg m "$M" '.machines[] | select(.name==$m) | .ip' "$INV")
[ -n "$IP" ] && [ "$IP" != "null" ] || { echo "✗ $M not in $INV" >&2; exit 1; }
SRC="out/deploy/$M/"
[ -d "$SRC" ] || { echo "✗ $SRC missing — run: scripts/l1.sh compose -inventory $INV …" >&2; exit 1; }
SSH_OPTS="-o StrictHostKeyChecking=accept-new -o ConnectTimeout=10"
echo "→ $M ($IP): rsync $SRC → /opt/k1/"
rsync -az --delete -e "ssh $SSH_OPTS" "$SRC" "root@$IP:/opt/k1/"
# the node image travels as a tarball once (180 MB); skip if the machine already has it
if ! ssh $SSH_OPTS "root@$IP" 'docker image inspect 9chain-a1/node:g1-81 >/dev/null 2>&1'; then
  [ -f out/node-g1-81.tar ] || docker save 9chain-a1/node:g1-81 -o out/node-g1-81.tar
  echo "→ $M: loading node image (first time)"
  ssh $SSH_OPTS "root@$IP" 'docker load' < out/node-g1-81.tar
fi
if [ "$NOUP" != "--no-up" ]; then
  ssh $SSH_OPTS "root@$IP" 'cd /opt/k1 && docker compose up -d --remove-orphans && docker compose ps --format "{{.Name}} {{.Status}}"'
fi
echo "✓ $M pushed"
