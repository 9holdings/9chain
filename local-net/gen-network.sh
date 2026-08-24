#!/usr/bin/env bash
#
# gen-network.sh — Sinh 1 mạng 9Chain-A1 nhiều node THẬT (khoá mới, KHÔNG ewoq).
#   Chạy tool netgen trong golang container -> xuất ra local-net/net/:
#     genesis.json, docker-compose.multinode.yml, node1..N/{staker.crt,staker.key,signer.key},
#     keys.txt (TUYỆT MẬT — khoá 5 quỹ), faucet.env (chỉ khoá faucet), allocation.md (công khai)
#
# Dùng:  bash local-net/gen-network.sh [N]     (mặc định 5 node)
#
set -euo pipefail
cd "$(dirname "$0")/.."   # project root
N="${1:-5}"
SRC="$(pwd)/upstream/avalanchego"
# A1_NET_DIR cho phép sinh nhiều bộ vật liệu song song mà không đè lên nhau —
# vd bộ dev local (`net`) và bộ testnet công khai (`net-public`) là HAI mạng
# khác nhau, khoá khác nhau, KHÔNG được dùng lẫn.
NET_DIR="${A1_NET_DIR:-local-net/net}"
OUT="$(pwd)/$NET_DIR"
mkdir -p "$OUT"

echo "==> Sinh mạng $N node vào $NET_DIR/ (khoá mới)"
MSYS_NO_PATHCONV=1 docker run --rm \
  -v "/$SRC":/src -w /src \
  -v "/$OUT":/out \
  -v 9chain-a1-gomod:/go/pkg/mod \
  -e GOWORK=off -e N="$N" -e OUT=/out \
  golang:1.25.10-bookworm sh -c "go run ./9chain-a1-tools/netgen"

cat <<EOF

==> Xong. Khởi động mạng:
    docker compose -f $NET_DIR/docker-compose.multinode.yml up -d --build
    # node1 mở API ở http://localhost:9650

==> Kiểm chứng validator set:
    curl -s -X POST --data '{"jsonrpc":"2.0","id":1,"method":"platform.getCurrentValidators"}' \\
      -H 'content-type:application/json' http://localhost:9650/ext/bc/P

==> Phân bổ genesis (công khai được): $NET_DIR/allocation.md

⚠️  $NET_DIR/keys.txt chứa KHOÁ CỦA CẢ 5 QUỸ — giữ OFFLINE, KHÔNG commit,
    KHÔNG BAO GIỜ đưa lên server. File duy nhất được phép lên server: faucet.env
EOF
