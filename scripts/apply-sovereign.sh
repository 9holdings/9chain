#!/usr/bin/env bash
#
# apply-sovereign.sh — dựng lại lớp chủ quyền 9Chain-A1 lên cây avalanchego sạch.
#
# ĐÂY LÀ ĐƯỜNG CỨU HỘ, KHÔNG PHẢI ĐƯỜNG BUILD THƯỜNG NGÀY.
# Bình thường `upstream/avalanchego` đã ở nhánh `9chain-a1` và Dockerfile copy
# thẳng cây đó. Script này dùng khi: mất `upstream/`, dựng máy dev mới, hoặc
# muốn kiểm chứng rằng lớp chủ quyền THẬT SỰ tái lập được từ repo này.
#
#   bash scripts/apply-sovereign.sh            # vào upstream/avalanchego
#   bash scripts/apply-sovereign.sh <thư mục>  # vào chỗ khác (dùng để kiểm chứng)
#
set -euo pipefail

# Commit upstream mà lớp chủ quyền được viết trên nền. Ghim cứng: patch chạm
# config/config.go và genesis/*.go — hai file upstream sửa thường xuyên, thả nổi
# theo master là patch chết vào một ngày không ai biết trước.
BASE="1cf1fc3d1711a09fde7319d2b48609c8cba93680"
UPSTREAM_URL="https://github.com/ava-labs/avalanchego.git"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:-$ROOT/upstream/avalanchego}"
PATCHES="$ROOT/patches"

[ -d "$PATCHES" ] || { echo "✗ không thấy $PATCHES"; exit 1; }

echo "==> đích  : $DEST"
echo "==> nền   : $BASE"

if [ ! -d "$DEST/.git" ]; then
  echo "==> chưa có cây avalanchego, clone (--no-checkout để khỏi kéo master thừa)"
  mkdir -p "$(dirname "$DEST")"
  git clone --no-checkout "$UPSTREAM_URL" "$DEST"
fi

cd "$DEST"

# Commit nền phải có mặt. Cây shallow / clone cũ có thể thiếu.
if ! git cat-file -e "${BASE}^{commit}" 2>/dev/null; then
  echo "==> thiếu commit nền, fetch"
  git fetch --no-tags origin "$BASE"
fi

# ──────────────────────────────────────────────────────────────────────────────
# Cây phải SẠCH TUYỆT ĐỐI trước khi áp patch.
#
# `git reset --hard` KHÔNG đủ: nó gỡ index + file tracked, còn file UNTRACKED
# sống sót. Mà patch chủ quyền TẠO file mới (9chain-a1-tools/, genesis_9chain_a1.go)
# nên lần áp trước để lại đúng loại file đó → `git am` chết với
# "already exists in working directory", và người chạy dễ tưởng là lỗi patch.
# Đã trả giá đúng lỗi này ở dự án 9chain (19/08/2026).
#
# Thước đo đúng: `git status --porcelain` ra 0 DÒNG. Dòng `??` cũng tính.
# KHÔNG dùng `git clean -fd` — ở các fork nó đòi xoá cả thư mục data/.
# ──────────────────────────────────────────────────────────────────────────────
git checkout --detach "$BASE"
git reset --hard "$BASE"

DIRTY="$(git status --porcelain)"
if [ -n "$DIRTY" ]; then
  echo "✗ cây KHÔNG sạch sau reset — còn $(printf '%s\n' "$DIRTY" | wc -l) mục:"
  printf '%s\n' "$DIRTY"
  echo ""
  echo "  Gỡ ĐÍCH DANH những file trên rồi chạy lại. Đừng dùng 'git clean -fd'."
  exit 1
fi
echo "✓ cây sạch tại nền"

# `git am` thay vì `git apply`: giữ nguyên thông điệp commit (trong đó có các bẫy
# đã ghi lại), và dừng đúng patch hỏng thay vì áp nửa vời.
echo "==> áp $(ls -1 "$PATCHES"/*.patch | wc -l) patch"
if ! git am --keep-cr "$PATCHES"/*.patch; then
  echo ""
  echo "✗ áp patch THẤT BẠI. Nếu MỌI file cùng báo 'patch does not apply' thì gần"
  echo "  như chắc chắn là lệch xuống dòng (CRLF), không phải patch sai — kiểm tra"
  echo "  'git config core.autocrlf' phải là false và .gitattributes có '* -text'."
  echo "  Gỡ: git am --abort"
  exit 1
fi

git branch -f 9chain-a1 HEAD && git checkout 9chain-a1

echo ""
echo "✓ xong. Lớp chủ quyền đã ở nhánh '9chain-a1':"
git log --oneline "$BASE"..HEAD
echo ""
echo "Kiểm chứng thật (không phải 'trông có vẻ đúng'):"
echo "  cd $ROOT && docker build -f local-net/Dockerfile -t 9chain-a1/node:verify ."
echo "  docker run --rm 9chain-a1/node:verify ./avalanchego --version   # phải in 9chaingo"
