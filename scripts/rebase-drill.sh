#!/usr/bin/env bash
#
# rebase-drill.sh — diễn tập rebase lớp chủ quyền lên upstream mới.
#
#   bash scripts/rebase-drill.sh              # thử lên origin/master
#   bash scripts/rebase-drill.sh <ref>        # thử lên một ref cụ thể
#
# ═══ VÌ SAO CẦN MỘT SCRIPT, KHÔNG PHẢI LÀM TAY MỘT LẦN ═══
# Lớp chủ quyền của 9Chain-A1 chỉ ~139 dòng sửa avalanchego. Patch mỏng là thứ
# giữ cho fork sống được qua các bản upstream — nhưng "mỏng nên chắc rebase được"
# là NIỀM TIN cho tới khi có ai chạy thử. Câu hỏi thật không phải "patch có áp
# được không" mà "sau khi áp, mấy chỗ TINH VI có còn nguyên không":
#   • nhánh `case A1NetworkID` trong genesis/params.go
#   • hai điều kiện `!= genesis.A1NetworkID` trong config/config.go
# Hai chỗ đó nằm giữa code upstream sửa thường xuyên. `git am` báo thành công
# vẫn có thể để lại chúng ở chỗ sai nếu upstream tái cấu trúc quanh đó.
#
# ═══ AN TOÀN ═══
# Chạy trong git worktree TÁCH RỜI, không đụng nhánh `9chain-a1` và không đụng
# cây làm việc. KHÔNG dùng apply-sovereign.sh cho việc này — script đó kết thúc
# bằng `git branch -f 9chain-a1 HEAD`, tức là nó GHI ĐÈ nhánh thật.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO="$ROOT/upstream/avalanchego"
PATCHES="$ROOT/patches"
REF="${1:-origin/master}"
NHANH_THAT="9chain-a1"

[ -d "$REPO/.git" ] || { echo "✗ không thấy $REPO"; exit 1; }
[ -d "$PATCHES" ]   || { echo "✗ không thấy $PATCHES"; exit 1; }

cd "$REPO"

GOC_TRUOC="$(git rev-parse "$NHANH_THAT")"
DRILL="$(mktemp -d -t a1-rebase-XXXXXX)/cay"

don_dep() {
  git worktree remove --force "$DRILL" 2>/dev/null || true
  git worktree prune 2>/dev/null || true
  # Chốt chặn cuối: nhánh thật phải y nguyên. Nếu lệch thì hét lên — im lặng ở
  # đây nghĩa là một lần diễn tập vừa nuốt mất lớp chủ quyền.
  local sau; sau="$(git rev-parse "$NHANH_THAT" 2>/dev/null || echo "MAT")"
  if [ "$sau" != "$GOC_TRUOC" ]; then
    echo "🔴 CẢNH BÁO: nhánh $NHANH_THAT đã ĐỔI ($GOC_TRUOC -> $sau) — diễn tập không được phép làm điều này."
    exit 1
  fi
}
trap don_dep EXIT

echo "==> upstream đích : $REF ($(git rev-parse --short "$REF"))"
echo "==> nền đang dùng : $(git merge-base "$NHANH_THAT" "$REF" | cut -c1-9)"
echo "==> upstream mới kể từ điểm fork: $(git rev-list --count "$(git merge-base "$NHANH_THAT" "$REF")".."$REF") commit"

git worktree add --detach "$DRILL" "$REF" >/dev/null 2>&1
echo "==> áp $(ls -1 "$PATCHES"/*.patch | wc -l) patch lên cây tạm"
if ! git -C "$DRILL" am --keep-cr "$PATCHES"/*.patch; then
  git -C "$DRILL" am --abort 2>/dev/null || true
  echo ""
  echo "✗ REBASE SẼ GÃY. Patch không áp được lên $REF."
  echo "  Mọi file cùng báo 'patch does not apply' ⇒ gần như chắc chắn là lệch"
  echo "  xuống dòng (CRLF), không phải patch sai — kiểm .gitattributes có '* -text'."
  exit 1
fi

# ── Kiểm chỗ TINH VI, không chỉ kiểm "am chạy xong" ────────────────────────────
loi=0
doi() {   # doi <mo ta> <file> <chuoi> <so lan mong doi>
  local mo_ta="$1" file="$2" chuoi="$3" mong="$4"
  local dem; dem="$(grep -cF "$chuoi" "$DRILL/$file" 2>/dev/null || echo 0)"
  if [ "$dem" = "$mong" ]; then
    echo "  ✓ $mo_ta ($dem)"
  else
    echo "  ✗ $mo_ta — mong $mong, thấy $dem  [$file]"
    loi=$((loi + 1))
  fi
}

echo "==> kiểm lớp chủ quyền sau khi áp"
doi "config.go giữ 2 điều kiện A1NetworkID" config/config.go        "genesis.A1NetworkID" 2
doi "params.go giữ 2 nhánh case A1NetworkID" genesis/params.go      "case A1NetworkID"    2
doi "client = 9chaingo"                      version/constants.go   'Client = "9chaingo"' 1
doi "HRP = love9"                            utils/constants/network_ids.go 'FallbackHRP = "love9"' 1
doi "token symbol = LOVE9"                   genesis/genesis.go     'Symbol:       "LOVE9",' 1
doi "VMID = love9evm"                        graft/subnet-evm/scripts/constants.sh \
    'DEFAULT_VM_ID="pkqXszJe86D3xLomib9bLpXPfW7gr7FPhDAbg46p5iNjrn4mf"' 1
[ -f "$DRILL/genesis/genesis_9chain_a1.go" ] \
  && echo "  ✓ genesis_9chain_a1.go có mặt" \
  || { echo "  ✗ THIẾU genesis/genesis_9chain_a1.go"; loi=$((loi + 1)); }

echo "==> cây sau rebase lệch gì so với nhánh $NHANH_THAT (phải ĐÚNG BẰNG upstream mới):"
git -C "$DRILL" diff --stat "$NHANH_THAT" HEAD | tail -12

echo ""
if [ "$loi" -gt 0 ]; then
  echo "✗ DIỄN TẬP HỎNG: $loi điểm chủ quyền không đúng sau khi rebase."
  echo "  Đừng rebase thật cho tới khi sửa patch."
  exit 1
fi
echo "✓ diễn tập ĐẠT — rebase lên $REF an toàn."
echo ""
echo "⚠️  Lưu ý đọc kết quả: 'đạt' chỉ chứng minh cho ĐÚNG ref vừa thử."
echo "    Upstream chưa đụng vào vùng ta có sửa thì patch nào cũng áp sạch."
echo "    Tín hiệu thật nằm ở lần upstream tái cấu trúc config/config.go hoặc"
echo "    genesis/ — chạy lại script này TRƯỚC mỗi lần rebase thật, đừng tin lần trước."
