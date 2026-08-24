#!/usr/bin/env bash
# down-all.sh — Dừng toàn bộ dịch vụ 9Chain-A1 đang mở.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
docker rm -f 9chain-a1-faucet 9chain-a1-explorer 9chain-a1-xpwallet 2>/dev/null || true
( cd "$ROOT/explorer-full/blockscout/docker-compose" && MSYS_NO_PATHCONV=1 docker compose -f geth.yml down 2>/dev/null ) || true
docker compose -f local-net/docker-compose.yml down 2>/dev/null || true
echo "Đã dừng tất cả. (giữ volume dữ liệu; thêm -v để xoá)"
