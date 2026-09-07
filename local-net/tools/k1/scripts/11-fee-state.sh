#!/usr/bin/env bash
# Phase 0.4 — the P-Chain validator fee state, and one L1 validator's record.
#
#   platform.getValidatorFeeState → {excess, price, timestamp}   (service.go:2081–2088)
#   platform.getValidatorFeeConfig → {capacity, target, minPrice, excessConversionConstant}
#   platform.getL1Validator(validationID) → weight, balance, nodeID, …
#
# Pass criteria for K1: price == 1 (nLOVE9/s) and excess == 0 for the whole run.
# Usage: scripts/11-fee-state.sh [uri] [validationID]
set -euo pipefail
URI="${1:-http://127.0.0.1:9750}"
call() { curl -sS -X POST -H 'content-type:application/json' --data "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"$1\",\"params\":${2:-{\}}}" "$URI/ext/bc/P"; echo; }
echo "== platform.getValidatorFeeConfig"; call platform.getValidatorFeeConfig
echo "== platform.getValidatorFeeState";  call platform.getValidatorFeeState
if [ -n "${2:-}" ]; then
  echo "== platform.getL1Validator $2"; call platform.getL1Validator "{\"validationID\":\"$2\"}"
fi
