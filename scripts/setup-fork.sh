#!/usr/bin/env bash
#
# setup-fork.sh — Biến bản clone thành fork 9Chain-A1 đúng chuẩn "sovereign fork":
#   - remote `upstream` = ava-labs/avalanchego  (để kéo update về sau)
#   - remote `origin`   = repo 9Chain-A1 của bạn (bạn tự tạo trên GitHub/GitLab)
#   - nhánh `9chain-a1` = nơi commit lớp rebrand
#
# Dùng:
#   ./scripts/setup-fork.sh [ORIGIN_URL]
# Ví dụ:
#   ./scripts/setup-fork.sh git@github.com:openkingdom/9chaingo.git
#
set -euo pipefail

REPO="upstream/avalanchego"
ORIGIN_URL="${1:-}"

cd "$(dirname "$0")/../$REPO"

echo "==> Cấu hình remote cho fork 9Chain-A1 trong $REPO"

# upstream = ava-labs (nguồn để rebase/merge update)
if git remote | grep -qx upstream; then
  git remote set-url upstream https://github.com/ava-labs/avalanchego.git
else
  git remote add upstream https://github.com/ava-labs/avalanchego.git
fi
echo "  ✓ upstream -> https://github.com/ava-labs/avalanchego.git"

# origin = repo của bạn
if [[ -n "$ORIGIN_URL" ]]; then
  if git remote | grep -qx origin; then
    git remote set-url origin "$ORIGIN_URL"
  else
    git remote add origin "$ORIGIN_URL"
  fi
  echo "  ✓ origin   -> $ORIGIN_URL"
else
  echo "  ! chưa đặt origin (truyền URL repo của bạn làm tham số để set)"
fi

# nhánh làm việc cho rebrand
git checkout -B 9chain-a1
echo "  ✓ nhánh làm việc: 9chain-a1"

cat <<'EOF'

==> Quy trình merge upstream về sau (giữ core mới nhất + rebrand sạch):
    git fetch upstream
    git checkout 9chain-a1
    git merge upstream/master          # hoặc tag phiên bản, vd v1.14.3
    bash ../../scripts/rebrand.sh .    # chạy lại rebrand (idempotent)
    # -> vì rebrand chỉ đổi VALUE, merge gần như không conflict.
EOF
