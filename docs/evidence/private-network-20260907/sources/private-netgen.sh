#!/usr/bin/env bash
set -euo pipefail
test "$PWD" = /cold/source
test ! -e /fixture/material
test ! -e /fixture/netgen
mkdir -m 700 /fixture/material /fixture/cache /fixture/tmp
export GOMODCACHE=/cold/modcache GOCACHE=/fixture/cache GOTMPDIR=/fixture/tmp TMPDIR=/fixture/tmp
export GOTOOLCHAIN=local GOPROXY=off GOSUMDB=off GOMAXPROCS=4
go build -mod=readonly -p=4 -o /fixture/netgen ./9chain-a1-tools/netgen
N=5 OUT=/fixture/material NETWORK_ID=899999998 A1_CHAIN_ID=9000000909 \
  A1_P2P_MODE=docker SUBNET_PREFIX=172.29.207 BASE_OCTET=11 \
  A1_CONFIG_DIR=/fixture/config A1_API_BIND=127.0.0.1 \
  A1_HTTP_ALLOWED_HOSTS=localhost,127.0.0.1 /fixture/netgen
sha256sum /fixture/netgen /fixture/material/genesis.json
