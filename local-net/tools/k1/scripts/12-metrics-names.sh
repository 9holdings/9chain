#!/usr/bin/env bash
# Phase 0.5 — discover the metric names the K1 gates will read, instead of guessing them.
#
# validators.Manager records validator-set builds (manager.go:188–191: created, duration,
# height diff). The exact Prometheus names are whatever /ext/metrics says — this prints them.
# Usage: scripts/12-metrics-names.sh [uri]
set -euo pipefail
URI="${1:-http://127.0.0.1:9750}"
curl -sS "$URI/ext/metrics" > /tmp/k1-metrics.txt
echo "== validator set / warp related metric names"
grep -iE "validator_set|validators_|warp" /tmp/k1-metrics.txt | grep -v '^#' | sed -E 's/\{.*//; s/ .*//' | sort -u | head -40
echo "== tracked subnets / peers"
grep -iE "^avalanche_network_peers |tracked_subnets|^avalanche_network_node_uptime" /tmp/k1-metrics.txt | head -10
echo "(full dump: /tmp/k1-metrics.txt, $(wc -l < /tmp/k1-metrics.txt) lines)"
