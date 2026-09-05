#!/usr/bin/env bash
# Run l1-batch INSIDE a container on the drill compose network.
#
# Why not natively: avalanchego's wallet pulls in blst (cgo) and a Linux-only storage helper, so
# `go build` fails on Windows. The fork is built in golang:1.25.10-bookworm everywhere else in this
# project (netgen, the node image); this does the same, once, into out/l1-batch. The binary then
# runs on the compose network, where the nodes are reachable at 172.31.0.11–13:9650 — so the
# -nodes URIs passed to `plan` are those internal addresses, not the 127.0.0.1:97x0 host ports.
#
# Usage: scripts/l1.sh build
#        scripts/l1.sh plan  -nodes http://172.31.0.11:9650,http://172.31.0.12:9650,http://172.31.0.13:9650 -count 30
#        scripts/l1.sh apply -key "$(scripts/fund-key.sh)" -limit 5
#        scripts/l1.sh render
#        scripts/l1.sh status
#        scripts/l1.sh pump -rate 1 -seconds 120
set -euo pipefail
cd "$(dirname "$0")/.."
KIT="$(pwd -W 2>/dev/null || pwd)"; KIT="/${KIT#/}"; KIT="${KIT/C:/c}"; KIT="${KIT/c\//c/}"
FORK="/c/PROJECTS/9Chain-A1/upstream/avalanchego"
# Mount both trees at paths that keep go.work's relative `use` directives valid.
MNT_KIT=/w/PROJECTS/9Chain-A1-web/docs/k1-phase0
MNT_FORK=/w/PROJECTS/9Chain-A1/upstream/avalanchego
NET="${K1_NET:-k1p0_a1net}"
case "${1:-}" in
  build)
    MSYS_NO_PATHCONV=1 docker run --rm -v "/$FORK":$MNT_FORK -v "$KIT":$MNT_KIT -w $MNT_KIT \
      -v 9chain-a1-gomod:/go/pkg/mod golang:1.25.10-bookworm \
      sh -c "go build -o out/l1-batch ./l1-batch && ls -la out/l1-batch"
    ;;
  "" | -h | --help)
    sed -n '2,20p' "$0"; exit 0 ;;
  *)
    # -f, not -x: the binary is a Linux ELF built by root inside a container; Git Bash on Windows
    # does not report its execute bit reliably, and it only ever runs inside the container anyway.
    [ -f out/l1-batch ] || { echo "✗ out/l1-batch missing — run: scripts/l1.sh build" >&2; exit 1; }
    MSYS_NO_PATHCONV=1 docker run --rm --network "$NET" -v "$KIT":$MNT_KIT -w $MNT_KIT \
      -e K1_FUND_KEY="${K1_FUND_KEY:-}" debian:bookworm-slim ./out/l1-batch "$@"
    ;;
esac
