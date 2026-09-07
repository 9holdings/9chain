#!/usr/bin/env bash
# The hard gate of every phase: no node may ever be dropped for tracking too many subnets.
# peer.go:882 — a handshake advertising > 16 tracked subnets ends in StartClose(). Zero, always.
# Also counts "too many" and generic "StartClose" lines so a red is attributable.
# Usage: scripts/14-startclose.sh [container ...]
set -uo pipefail
CONTAINERS=("$@")
[ ${#CONTAINERS[@]} -eq 0 ] && CONTAINERS=(9chain-a1-tap-node-1 9chain-a1-tap-node-2 9chain-a1-tap-node-3)
rc=0
for c in "${CONTAINERS[@]}"; do
  logs=$(docker logs "$c" 2>&1 || true)
  many=$(printf '%s\n' "$logs" | grep -ci "too many tracked subnets\|maxNumTrackedSubnets" || true)
  sc=$(printf '%s\n' "$logs" | grep -c "StartClose" || true)
  peers=$(curl -sS -X POST -H 'content-type:application/json' --data '{"jsonrpc":"2.0","id":1,"method":"info.peers","params":{}}' \
          "http://127.0.0.1:$(docker port "$c" 9650/tcp 2>/dev/null | head -1 | sed 's/.*://')/ext/info" 2>/dev/null | grep -o '"numPeers":"[0-9]*"' | grep -o '[0-9]*')
  status="✓"; [ "$many" != "0" ] && { status="✗"; rc=1; }
  printf "%s %-24s too-many-tracked=%s StartClose=%s peers=%s\n" "$status" "$c" "$many" "$sc" "${peers:--}"
done
exit $rc
