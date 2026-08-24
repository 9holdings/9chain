#!/usr/bin/env bash
#
# setup.sh — Dựng Blockscout (explorer đầy đủ) rebrand 9Chain-A1 cho C-Chain.
#   1) clone sparse docker-compose của Blockscout
#   2) append override 9Chain-A1 (RPC + branding + SSL fix)
#   3) in lệnh chạy
#
# Yêu cầu: node 9Chain-A1 đang chạy với --http-allowed-hosts=* (compose dev đã bật).
set -euo pipefail
cd "$(dirname "$0")"
BS=blockscout/docker-compose

if [ ! -d blockscout ]; then
  echo "==> clone Blockscout (sparse: chỉ docker-compose)"
  git clone --depth 1 --filter=blob:none --sparse https://github.com/blockscout/blockscout.git blockscout
  ( cd blockscout && git sparse-checkout set docker-compose )
fi

echo "==> áp override 9Chain-A1 (idempotent thật: gỡ block cũ rồi append lại)"
# LƯU Ý: bản trước dùng `grep -q ... || cat >>` nhưng chuỗi kiểm tra không khớp
# nội dung file override => append TRÙNG mỗi lần chạy. Nay cắt từ marker tới EOF.
apply_override() {
  local target="$1" src="$2"
  if [ ! -f "$target" ]; then echo "  ! không thấy $target" >&2; return 1; fi
  perl -0pi -e 's/\n*# === 9CHAIN-A1 OVERRIDES ===.*\z//s' "$target"
  printf '\n' >> "$target"
  cat "$src" >> "$target"
  echo "  ✓ $(basename "$target")"
}
apply_override "$BS/envs/common-blockscout.env" 9chain-a1-overrides.blockscout.env
apply_override "$BS/envs/common-frontend.env"   9chain-a1-overrides.frontend.env

cat <<EOF

==> Chạy Blockscout:
    cd $BS
    docker compose -f geth.yml up -d          # pull ~GB lần đầu
    # UI:  http://localhost        (rebrand 9Chain-A1, coin LOVE9)
    # API: http://localhost:8080

LƯU Ý:
  - Node phải chạy với --http-allowed-hosts=* (để Blockscout gọi RPC qua host.docker.internal).
  - Cổng 80/8080/8081 phải rảnh (dừng faucet/explorer nhẹ nếu trùng 8080/8081).
  - Realtime index block MỚI ngay; sinh giao dịch để thấy dữ liệu (block rỗng không đẻ).
EOF
