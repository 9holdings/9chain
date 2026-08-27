#!/usr/bin/env bash
#
# up-all.sh — Bật & GIỮ MỞ toàn bộ dịch vụ 9Chain-A1 (container restart:unless-stopped).
# Cổng: node 9650 | Blockscout 80 | faucet 8088 | explorer nhẹ 8082 | ví X/P 8090
#
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
NODE_RPC_HOST="http://host.docker.internal:9650"

# Docker publish cong DI VONG QUA ufw (DNAT trong bang nat, ufw loc chuoi INPUT).
# Publish ra 0.0.0.0 tren server la ho thang ra Internet du ufw bao chan.
# Mac dinh CHI nghe loopback; truy cap public phai qua Caddy (reverse proxy).
# Local dev van vao duoc binh thuong bang http://localhost:<port>.
BIND="${A1_SERVICE_BIND:-127.0.0.1}"

echo "==> [1/6] Node 9Chain-A1 (9650)"
# 🔴 Node dev nay boot bằng genesis do NETGEN sinh, không còn bằng
# `9chain-a1-config/genesis.json` (đó là genesis gốc của Avalanche — khoá ewoq công
# khai giữ 50 triệu). Dừng ở đây thay vì để avalanchego báo "no such file" giữa một
# lượt `up -d --build` dài, và thay vì boot nhầm một mạng lạ.
# Cùng lúc gỡ một mâu thuẫn cũ: bước [2/6] lấy khoá faucet từ `net/faucet.env`, nên
# node và ví faucet phải thuộc CÙNG bộ `net/` thì ví mới có tiền.
if [ ! -f "$ROOT/local-net/net/genesis.json" ]; then
  echo "    LOI: thieu local-net/net/genesis.json" >&2
  echo "    -> chay 'bash local-net/gen-network.sh 5' truoc (sinh genesis + khoa 5 quy + faucet.env)" >&2
  echo "    Xem docs/CORE-AUDIT-2026-08-27.md §7b." >&2
  exit 1
fi
docker compose -f local-net/docker-compose.yml up -d --build >/dev/null
echo "    chờ node healthy..."
for _ in $(seq 1 24); do
  curl -s -m3 -X POST --data '{"jsonrpc":"2.0","id":1,"method":"health.health"}' \
    -H 'content-type:application/json' http://localhost:9650/ext/health 2>/dev/null | grep -q '"healthy":true' && break
  sleep 5
done
echo "    node OK"

echo "==> [2/6] Faucet (8088)"
# Khoá faucet lấy từ faucet.env do netgen sinh — KHÔNG còn khoá ewoq mặc định.
FAUCET_ENV="$ROOT/local-net/net/faucet.env"
if [ ! -f "$FAUCET_ENV" ]; then
  echo "    BO QUA faucet: thieu $FAUCET_ENV"
  echo "    -> chay 'bash local-net/gen-network.sh 5' de sinh vi faucet rieng"
else
  FAUCET_PK="$(grep '^FAUCET_PK=' "$FAUCET_ENV" | cut -d= -f2)"
  docker rm -f 9chain-a1-faucet >/dev/null 2>&1 || true
  # Mount CẢ local-net (không chỉ faucet/) vì server.mjs import ../lib/guard.mjs.
  MSYS_NO_PATHCONV=1 docker run -d --name 9chain-a1-faucet --restart unless-stopped -p "$BIND":8088:8080 \
    -v "/$ROOT/local-net":/app -w /app/faucet \
    -e FAUCET_RPC="$NODE_RPC_HOST/ext/bc/C/rpc" -e FAUCET_PK="$FAUCET_PK" -e PORT=8080 \
    -e A1_TRUST_PROXY="${A1_TRUST_PROXY:-0}" \
    node:24-alpine node server.mjs >/dev/null
  echo "    faucet OK"
fi

echo "==> [3/6] Explorer nhẹ (8082)"
docker rm -f 9chain-a1-explorer >/dev/null 2>&1 || true
MSYS_NO_PATHCONV=1 docker run -d --name 9chain-a1-explorer --restart unless-stopped -p "$BIND":8082:80 \
  -v "/$ROOT/local-net/explorer":/usr/share/nginx/html:ro \
  nginx:alpine >/dev/null
echo "    explorer OK"

echo "==> [4/6] Ví X/P (8090)"
docker rm -f 9chain-a1-xpwallet >/dev/null 2>&1 || true
MSYS_NO_PATHCONV=1 docker run -d --name 9chain-a1-xpwallet --restart unless-stopped -p "$BIND":8090:8090 \
  -v "/$ROOT/upstream/avalanchego":/src -w /src -v 9chain-a1-gomod:/go/pkg/mod \
  -e GOWORK=off -e WALLET_URI="$NODE_RPC_HOST" \
  golang:1.25.10-bookworm sh -c "go run ./9chain-a1-tools/xp-wallet" >/dev/null
echo "    ví X/P đang biên dịch & khởi động (~40s)"

echo "==> [4b] Console đẻ chain (8091) — host node process"
# `pkill` KHÔNG giết được node.exe trên Windows -> tìm PID qua netstat rồi taskkill.
# Bỏ qua bước này là console CŨ (bind 0.0.0.0, chưa auth) vẫn sống và tranh cổng
# với bản mới bind 127.0.0.1 -> request rơi ngẫu nhiên vào bản cũ không auth.
pkill -f "console/server.mjs" 2>/dev/null || true
for PID in $(netstat -ano 2>/dev/null | grep ':8091 .*LISTENING' | awk '{print $NF}' | sort -u); do
  taskkill //F //PID "$PID" >/dev/null 2>&1 || true
done

if [ -z "${A1_CONSOLE_TOKEN:-}" ]; then
  echo "    BO QUA console: chua dat A1_CONSOLE_TOKEN"
  echo "    -> console tao duoc L1 + restart node nen BAT BUOC co token."
  echo "       Vi du: A1_CONSOLE_TOKEN=\$(openssl rand -base64 24) bash local-net/up-all.sh"
else
  # LƯU Ý: console chạy TRÊN HOST -> phải dùng localhost.
  # host.docker.internal chỉ phân giải được TỪ TRONG container.
  ( cd "$ROOT" && PORT=8091 NODE_URI="http://localhost:9650" \
      A1_CONSOLE_TOKEN="$A1_CONSOLE_TOKEN" \
      A1_CONSOLE_HOST="${A1_CONSOLE_HOST:-127.0.0.1}" \
      A1_TRUST_PROXY="${A1_TRUST_PROXY:-0}" \
      nohup node local-net/console/server.mjs > /tmp/9chain-a1-console.log 2>&1 & ) || true
  echo "    console OK (127.0.0.1 only, can token)"
fi

docker rm -f 9chain-a1-dashboard >/dev/null 2>&1 || true
( MSYS_NO_PATHCONV=1 docker run -d --name 9chain-a1-dashboard --restart unless-stopped -p "$BIND":8092:80 -v "/$ROOT/local-net/dashboard":/usr/share/nginx/html:ro nginx:alpine >/dev/null ) || true
echo "    dashboard OK (8092)"

echo "==> [5/6] Blockscout (80)"
bash "$ROOT/explorer-full/setup.sh" >/dev/null 2>&1 || true
( cd "$ROOT/explorer-full/blockscout/docker-compose" && MSYS_NO_PATHCONV=1 docker compose -f geth.yml up -d >/dev/null 2>&1 ) || true
echo "    Blockscout đang khởi động (backend migrate ~1-2 phút lần đầu)"

echo "==> [6/6] Sinh ít giao dịch C-Chain cho explorer có dữ liệu"
# Dùng ví faucet (ví nóng testnet), KHÔNG dùng khoá ewoq công khai như trước.
if [ -f "$FAUCET_ENV" ]; then
  ( cd "$ROOT/local-net/deploy-test" && SEED_PK="$(grep '^FAUCET_PK=' "$FAUCET_ENV" | cut -d= -f2)" node -e '
import("ethers").then(async ({ethers})=>{
  const p=new ethers.JsonRpcProvider("http://localhost:9650/ext/bc/C/rpc");
  const w=new ethers.NonceManager(new ethers.Wallet(process.env.SEED_PK,p));
  for(let i=1;i<=3;i++){const t=await w.sendTransaction({to:"0x000000000000000000000000000000000000dEaD",value:ethers.parseEther("1")});await t.wait();}
  console.log("block",await p.getBlockNumber());
});' ) 2>/dev/null || true
fi

cat <<EOF

============================================================
  9Chain Testnet A1 (Avalanche) — CÁC LINK (đang mở, tự sống lại):
    Node API      : http://localhost:9650
    Blockscout    : http://localhost
    Faucet        : http://localhost:8088
    Explorer nhẹ  : http://localhost:8082
    Ví X/P        : http://localhost:8090
    Console đẻ chain: http://localhost:8091
    Bảng điểm A1/C1 : http://localhost:8092
============================================================
  Dừng tất cả:  bash local-net/down-all.sh
EOF
