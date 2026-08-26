#!/usr/bin/env bash
#
# Áp cấu hình Blockscout dành riêng cho SERVER công khai.
# Chạy SAU `setup.sh` (setup.sh áp bản local), TRƯỚC khi `docker compose up`.
#
#   A1_PUBLIC_HOST=a1.9chain.org bash 9chain-a1-server.env.sh
#
# Vì sao cần bản riêng: bản local trỏ RPC qua `host.docker.internal` và giả định
# frontend chạy ở http://localhost. Trên server thì:
#   - node bind loopback -> phải gọi qua mạng docker `net_a1net` (172.28.0.11)
#   - frontend đứng sau Caddy + Cloudflare ở https://<host> -> phải khai đúng
#     host/protocol, nếu không mọi lời gọi API của frontend sẽ trỏ về localhost
#     của NGƯỜI XEM (đúng bẫy explorer đã dính 2026-08-24).
set -euo pipefail
cd "$(dirname "$0")"

HOST="${A1_PUBLIC_HOST:?dat A1_PUBLIC_HOST=a1.9chain.org}"
RPC_HOST="${A1_RPC_HOST:-rpc-$HOST}"
NODE="${A1_NODE_ADDR:-172.28.0.11:9650}"
BS="blockscout/docker-compose"
MARK="# === 9CHAIN-A1 SERVER ==="

[ -d "$BS" ] || { echo "khong thay $BS - chay setup.sh truoc" >&2; exit 1; }

# Cắt block server cũ rồi ghi lại -> idempotent thật (bài học từ setup.sh bản đầu,
# dùng `grep -q || cat >>` với chuỗi kiểm tra sai nên append trùng mỗi lần chạy).
apply() {
  local target="$1"
  perl -0pi -e "s/\n*\Q$MARK\E.*\z//s" "$target"
  printf '\n%s\n' "$MARK" >> "$target"
  cat >> "$target"
  echo "  ✓ $(basename "$target")"
}

echo "==> backend: tro RPC vao node qua mang docker"
apply "$BS/envs/common-blockscout.env" <<EOF
ETHEREUM_JSONRPC_HTTP_URL=http://$NODE/ext/bc/C/rpc
ETHEREUM_JSONRPC_TRACE_URL=http://$NODE/ext/bc/C/rpc
ETHEREUM_JSONRPC_WS_URL=ws://$NODE/ext/bc/C/ws
EOF

echo "==> frontend: khai dung host cong khai"
apply "$BS/envs/common-frontend.env" <<EOF
NEXT_PUBLIC_APP_HOST=$HOST
NEXT_PUBLIC_APP_PROTOCOL=https
NEXT_PUBLIC_API_HOST=$HOST
NEXT_PUBLIC_API_PROTOCOL=https
NEXT_PUBLIC_API_BASE_PATH=/
NEXT_PUBLIC_API_WEBSOCKET_PROTOCOL=wss
NEXT_PUBLIC_STATS_API_HOST=https://$HOST
NEXT_PUBLIC_VISUALIZE_API_HOST=https://$HOST

# Nút "Add network to MetaMask" gắn sẵn của Blockscout CHỈ hiện khi có RPC URL.
# Thiếu biến này thì nút biến mất và người dùng phải tự gõ tay chainId/RPC/symbol
# — rào cản lớn nhất với người dùng phổ thông.
NEXT_PUBLIC_NETWORK_RPC_URL=https://$RPC_HOST/ext/bc/C/rpc
EOF

echo "==> quyen thu muc dets/logs cho backend"
# BẪY: `services/backend.yml` khai `./dets/` và `./logs/`. Docker Compose giải
# đường dẫn tương đối theo THƯ MỤC CHỨA FILE KHAI, tức `services/dets` —
# KHÔNG phải `docker-compose/dets`. Tạo nhầm chỗ thì backend vẫn crash.
#
# Compose tự tạo thư mục thiếu với chủ sở hữu root; process trong image chạy
# bằng user `blockscout` UID **10001** (không phải 1000) nên không ghi được
# -> `{:file_error, "./dets/queue_storage", :eacces}` -> backend crash-loop vô hạn.
# Thông báo lỗi chôn sâu trong stack trace Erlang, rất khó lần ra.
mkdir -p "$BS/services/dets" "$BS/services/logs"
# chmod cũng phải qua sudo: sau lần chạy đầu thư mục đã thuộc uid 10001 nên
# user thường không đổi quyền được nữa (script phải chạy lại được nhiều lần).
sudo chown -R 10001:10001 "$BS/services/dets" "$BS/services/logs"
sudo chmod 775 "$BS/services/dets" "$BS/services/logs"
echo "  ✓ services/dets, services/logs -> uid 10001"

cat <<EOF

==> Xong. Chay Blockscout:
    cd $BS
    docker compose -f geth.yml -f ../../9chain-a1-server.override.yml up -d

    UI  -> 127.0.0.1:8100  (Caddy proxy toi day)
    API -> 127.0.0.1:8101
EOF
