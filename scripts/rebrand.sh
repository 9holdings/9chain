#!/usr/bin/env bash
#
# rebrand.sh — Áp lớp identity 9Chain-A1 lên bản fork avalanchego.
#
# TRIẾT LÝ: chỉ đổi GIÁ TRỊ (chuỗi hiển thị), KHÔNG đổi tên biến / định danh Go.
#   => giữ core 100%, và `git merge upstream` gần như không conflict.
#   => script idempotent: chạy lại nhiều lần vẫn an toàn (kể cả sau khi rebase upstream).
#
# Phạm vi chạm vào (toàn bộ là lớp "identity", không phải logic):
#   1. version/constants.go        : Client name   "avalanchego" -> "9chaingo"
#   2. genesis/genesis.go          : token Name    "Avalanche"   -> "LOVE9 Coin"
#                                    token Symbol  "AVAX"        -> "LOVE9"
#   3. utils/constants/network_ids.go : FallbackHRP "custom"     -> "love9"
#
# TUYỆT ĐỐI KHÔNG chạm: snow/ (consensus), vms/ (VM), chains/ — đó là core.
#
set -euo pipefail

# --- Cấu hình thương hiệu 9Chain Testnet A1 (Avalanche) ----------------------
BRAND_CLIENT="9chaingo"      # tên node/client (song song Cosmos: love9d)
TOKEN_NAME="LOVE9 Coin"      # tên native token
TOKEN_SYMBOL="LOVE9"         # ký hiệu native token
HRP="love9"                  # tiền tố bech32 -> X-love91..., P-love91..., C-love91...
# VMID cho L1 EVM của 9Chain-A1: mã hoá từ chuỗi "love9evm" (thay cho "subnetevm").
#   subnetevm -> srEXiWaHuhNyGwPUi444Tu47ZEDwxTWrbQiuD7FmgSAQ6X7Dy
#   love9evm  -> pkqXszJe86D3xLomib9bLpXPfW7gr7FPhDAbg46p5iNjrn4mf
SUBNETEVM_VMID="srEXiWaHuhNyGwPUi444Tu47ZEDwxTWrbQiuD7FmgSAQ6X7Dy"
LOVE9EVM_VMID="pkqXszJe86D3xLomib9bLpXPfW7gr7FPhDAbg46p5iNjrn4mf"
# ----------------------------------------------------------------------------

REPO="${1:-upstream/avalanchego}"

if [[ ! -d "$REPO" ]]; then
  echo "ERROR: không thấy repo avalanchego tại '$REPO'" >&2
  echo "Dùng: ./scripts/rebrand.sh <đường-dẫn-avalanchego>" >&2
  exit 1
fi

echo "==> Rebrand '$REPO' thành 9Chain-A1 (client=$BRAND_CLIENT token=$TOKEN_SYMBOL hrp=$HRP)"

# Hàm thay thế idempotent: chỉ đổi khi còn thấy chuỗi gốc.
patch() {
  local file="$1" from="$2" to="$3" label="$4"
  if [[ ! -f "$file" ]]; then
    echo "  ! bỏ qua (không thấy file): $file" >&2
    return 0
  fi
  if grep -qF "$to" "$file" && ! grep -qF "$from" "$file"; then
    echo "  = đã rebrand sẵn: $label"
    return 0
  fi
  perl -0pi -e "s/\Q$from\E/$to/g" "$file"
  if grep -qF "$to" "$file"; then
    echo "  ✓ $label"
  else
    echo "  ! KHÔNG áp được: $label (kiểm tra lại chuỗi gốc trong $file)" >&2
    return 1
  fi
}

# 1) Client name
patch "$REPO/version/constants.go" \
  'Client = "avalanchego"' \
  "Client = \"$BRAND_CLIENT\"" \
  "version/constants.go: Client -> $BRAND_CLIENT"

# 2) Token name + symbol (chỉ đổi VALUE, giữ biến 'avax' để merge sạch)
patch "$REPO/genesis/genesis.go" \
  'Name:         "Avalanche",' \
  "Name:         \"$TOKEN_NAME\"," \
  "genesis/genesis.go: token Name -> $TOKEN_NAME"

patch "$REPO/genesis/genesis.go" \
  'Symbol:       "AVAX",' \
  "Symbol:       \"$TOKEN_SYMBOL\"," \
  "genesis/genesis.go: token Symbol -> $TOKEN_SYMBOL"

# 3) HRP cho mọi custom network (mạng 9Chain-A1 dùng network-id riêng -> fallback)
patch "$REPO/utils/constants/network_ids.go" \
  'FallbackHRP = "custom"' \
  "FallbackHRP = \"$HRP\"" \
  "utils/constants/network_ids.go: FallbackHRP -> $HRP"

# 4) VMID subnet-evm -> love9evm (L1 EVM mang định danh 9Chain-A1)
patch "$REPO/graft/subnet-evm/scripts/constants.sh" \
  "DEFAULT_VM_ID=\"$SUBNETEVM_VMID\"" \
  "DEFAULT_VM_ID=\"$LOVE9EVM_VMID\"" \
  "graft/subnet-evm: DEFAULT_VM_ID -> love9evm ($LOVE9EVM_VMID)"

echo "==> Xong. Xác minh nhanh:"
grep -n "Client = " "$REPO/version/constants.go" | head -1
grep -n "FallbackHRP" "$REPO/utils/constants/network_ids.go" | head -1
grep -nE 'Symbol:|Name:         "' "$REPO/genesis/genesis.go" | head -2
