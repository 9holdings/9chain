#!/usr/bin/env bash
# Phase 0.6 — how much the P-Chain database grows per CreateChainTx, by genesis size.
#
# writeTXs (state.go:3130–3149) stores every accepted tx forever, GenesisData included, in every
# node. This measures the P-Chain DB directory before/after a batch so the "genesis must be small"
# rule becomes a number. Run once before `apply`, once after; subtract.
# Usage: scripts/13-txdb-size.sh [container] [networkID]
set -euo pipefail
C="${1:-9chain-a1-tap-node-1}"
NET="${2:-899999998}"
docker exec "$C" sh -c "
  base=/root/.avalanchego/db/network-$NET; [ -d \$base ] || base=\$(ls -d /root/.avalanchego/db/*/ 2>/dev/null | head -1)
  echo \"db root: \$base\"
  du -sk \$base 2>/dev/null | awk '{printf \"total  %10d KiB\n\", \$1}'
  find \$base -maxdepth 3 -type d | while read d; do du -sk \"\$d\" 2>/dev/null | awk -v n=\"\${d#\$base}\" '{printf \"%-52s %10d KiB\n\", n, \$1}'; done"
