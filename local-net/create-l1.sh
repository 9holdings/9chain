#!/usr/bin/env bash
#
# create-l1.sh — Đẻ 1 L1 EVM mới trên mạng 9Chain-A1 đang chạy, tự động:
#   1) đảm bảo node up + healthy
#   2) tạo subnet + blockchain EVM (love9evm) bằng tool create-l1
#   3) restart node để track subnet -> nạp VM, mở RPC
#   4) chờ RPC L1 sẵn sàng và in thông tin kết nối (MetaMask + deploy)
#
# Dùng:  bash local-net/create-l1.sh [L1_NAME]
#
set -euo pipefail
cd "$(dirname "$0")/.."   # project root
COMPOSE="docker compose -f local-net/docker-compose.yml"
L1_NAME="${1:-9ChainA1L1}"

echo "==> [1/4] Đảm bảo node 9Chain-A1 đang chạy"
# 🔴 Genesis của node dev nay do netgen sinh (`local-net/net/`), không còn lấy từ
# `9chain-a1-config/genesis.json`. Xem docs/CORE-AUDIT-2026-08-27.md §7b.
# ⚠️ `l1-evm-genesis.json` thì VẪN ở `9chain-a1-config/` — đó là khuôn genesis cho
# L1 EVM, khác hẳn genesis của mạng. Bước [2/4] bên dưới vẫn đọc từ đó.
if [ ! -f "local-net/net/genesis.json" ]; then
  echo "    LOI: thieu local-net/net/genesis.json" >&2
  echo "    -> chay 'NETWORK_ID=899999999 bash local-net/gen-network.sh 5' truoc" >&2
  exit 1
fi
# Compose nay doi NETWORK_ID va KHONG con mac dinh (9001 la the he da chet).
source "local-net/network-id.sh" "local-net/net/genesis.json"
$COMPOSE up -d >/dev/null
for i in $(seq 1 24); do
  curl -s -m 3 -X POST --data '{"jsonrpc":"2.0","id":1,"method":"health.health"}' \
    -H 'content-type:application/json' http://localhost:9650/ext/health 2>/dev/null \
    | grep -q '"healthy":true' && { echo "    node healthy"; break; }
  sleep 5
done

echo "==> [2/4] Tạo subnet + L1 EVM ($L1_NAME)"
OUT=$(MSYS_NO_PATHCONV=1 $COMPOSE exec -T \
  -e A1_URI=http://localhost:9650 \
  -e A1_L1_GENESIS=/9chain-a1/config/l1-evm-genesis.json \
  -e A1_L1_NAME="$L1_NAME" \
  9chain-a1-node /9chain-a1/build/create-l1 2>&1)
echo "$OUT" | grep -E "subnet mới|L1 EVM mới" || { echo "$OUT"; exit 1; }
SUBNET=$(echo "$OUT" | grep -oE 'SUBNET_ID      = [A-Za-z0-9]+' | awk '{print $3}')
BID=$(echo "$OUT"    | grep -oE 'BLOCKCHAIN_ID  = [A-Za-z0-9]+' | awk '{print $3}')
[ -n "$SUBNET" ] && [ -n "$BID" ] || { echo "Không parse được ID"; echo "$OUT"; exit 1; }

echo "==> [3/4] Restart node để track subnet $SUBNET"
A1_TRACK_SUBNETS="$SUBNET" $COMPOSE up -d >/dev/null

echo "==> [4/4] Chờ RPC L1 sẵn sàng"
RPC="http://localhost:9650/ext/bc/$BID/rpc"
for i in $(seq 1 24); do
  cid=$(curl -s -m 3 -X POST --data '{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}' \
    -H 'content-type:application/json' "$RPC" 2>/dev/null)
  echo "$cid" | grep -q '"result"' && { CHAINID_HEX=$(echo "$cid" | grep -oE '0x[0-9a-f]+'); break; }
  sleep 5
done

cat <<EOF

============================ L1 EVM 9Chain-A1 SẴN SÀNG ============================
  Tên           : $L1_NAME
  SUBNET_ID     : $SUBNET
  BLOCKCHAIN_ID : $BID
  RPC URL       : $RPC
  Chain ID      : $((CHAINID_HEX)) ($CHAINID_HEX)
----------------------------------------------------------------------------------
  MetaMask > Add network:
    - Network name : $L1_NAME
    - RPC URL      : $RPC
    - Chain ID     : $((CHAINID_HEX))
    - Symbol       : LOVE9
----------------------------------------------------------------------------------
  Deploy contract kiểm thử:
    cd local-net/deploy-test && node deploy.mjs "$RPC"
==================================================================================
EOF
