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

# 🔴 DANH SÁCH BIẾN PHẢI ĐI QUA `docker run` — đây là chỗ đã cháy thật.
#
# Diễn tập build 24 patch `28/08` phát hiện: script này chuyển tiếp đúng 3 biến
# (`A1_P2P_MODE`, `A1_IPV6_*`), trong khi patch 0020 (D-083) đã làm `NETWORK_ID`
# **BẮT BUỘC**. Nên mọi lượt gọi đường-được-ghi-trong-tài-liệu đều chết ở
# `FATAL NETWORK_ID chưa đặt` — kể cả khi người dùng ĐÃ khai biến đó ở shell.
# Cùng lớp lỗi với D-095 (`console-deploy.sh` hỏng từ chính commit vá nó):
# công cụ liệt kê thẳng trong script thì mọi thứ thêm sau đó lặng lẽ rơi ra ngoài.
#
# ⇒ Khai MỘT danh sách, dùng nó để dựng cờ `-e`. Thêm biến ở netgen thì thêm ở đây.
# Đối chứng rẻ: `grep -rhoE 'env\("[A-Z0-9_]+"' 9chain-a1-tools/netgen/` phải là tập
# con của danh sách này (trừ `N`/`OUT` do script tự đặt).
A1_NETGEN_ENV=(
  NETWORK_ID SUBNET_PREFIX BASE_OCTET A1_CONFIG_DIR
  A1_P2P_MODE A1_IPV6_SUBNET A1_IPV6_BASE A1_PUBLIC_IP A1_STAKING_PORT_BASE
  A1_HTTP_ALLOWED_HOSTS A1_API_BIND
  A1_CHAIN_ID A1_CHAIN_ID_KHAI_NHAN
  A1_ENGRAVE A1_ENGRAVE_CHECKSUMS A1_ENGRAVE_CONFIRM A1_ENGRAVE_NO_CHECKSUMS
)
CHUYEN_TIEP=()
for v in "${A1_NETGEN_ENV[@]}"; do CHUYEN_TIEP+=(-e "$v"); done

echo "==> Sinh mạng $N node vào $NET_DIR/ (khoá mới)"
echo "    NETWORK_ID=${NETWORK_ID:-<CHƯA ĐẶT — netgen sẽ dừng, và đó là ĐÚNG>}"
# State the engraving inputs on screen, ALWAYS — including when they are absent. Silence here
# is how a "real" run goes past without anyone noticing it carried no engraving (netgen prints
# the same fact at the end; two independent statements are cheap and this one comes first).
if [ -n "${A1_ENGRAVE:-}" ]; then
  echo "    A1_ENGRAVE=$A1_ENGRAVE   <-- must be a path INSIDE the container (/repo/... or /out/...)"
  case "$A1_ENGRAVE" in
    /repo/*|/out/*|/src/*) ;;
    *) echo "    🔴 REFUSING: A1_ENGRAVE is not under /repo, /out or /src, so netgen cannot open it." >&2
       echo "       The repo root is mounted read-only at /repo. Put the manifest under the repo" >&2
       echo "       and pass it as /repo/<path>. See docs/GDAY-ENGRAVING.md." >&2
       exit 1 ;;
  esac
fi
if [ -n "${A1_ENGRAVE_CHECKSUMS:-}" ]; then
  case "$A1_ENGRAVE_CHECKSUMS" in
    /repo/*|/out/*|/src/*) ;;
    *) echo "    🔴 REFUSING: A1_ENGRAVE_CHECKSUMS is not reachable inside the container." >&2
       exit 1 ;;
  esac
fi

# 🔴 THE REPO ROOT IS MOUNTED AT `/repo` — AND THE ENGRAVING PATH IS WHY.
#
# netgen runs INSIDE a container. Until 2026-08-31 this command mounted exactly two things:
# the fork (`/src`) and the output directory (`/out`). But `A1_ENGRAVE` and
# `A1_ENGRAVE_CHECKSUMS` are HOST paths to files that live in neither — and netgen opens them
# with `os.ReadFile`, then resolves every document in the manifest relative to the manifest's
# own directory (`engrave.go`: `base := filepath.Dir(path)`).
#
# The variables were forwarded correctly; the FILES were unreachable. So the command written
# in `docs/GDAY-ENGRAVING.md` (`A1_ENGRAVE=/duong/dan/manifest.json`) could never have run as
# written, and no generated `net*/` directory in this repo contains the `engraving.md` netgen
# emits whenever engraving is on — i.e. that documented path has never once completed here.
#
# It fails loudly (`FATAL doc manifest khac chu ...`, before a single key is generated), so it
# costs time rather than correctness. But the time it costs is G-day time, on the one step
# that has no second attempt.
#
# ⇒ The repo root is now visible at `/repo`, read-only. Put the engraving manifest and its
#   documents under the repo and address them as `/repo/<path>`; `docs/GDAY-ENGRAVING.md`
#   carries the convention. Read-only on purpose: netgen must never write outside `/out`.
MSYS_NO_PATHCONV=1 docker run --rm \
  -v "/$SRC":/src -w /src \
  -v "/$OUT":/out \
  -v "/$(pwd)":/repo:ro \
  -v 9chain-a1-gomod:/go/pkg/mod \
  -e GOWORK=off -e N="$N" -e OUT=/out \
  "${CHUYEN_TIEP[@]}" \
  golang:1.25.10-bookworm sh -c "go run ./9chain-a1-tools/netgen"

cat <<EOF

==> Xong. Khởi động mạng:
    docker compose -f $NET_DIR/docker-compose.multinode.yml up -d --build
    # node1 mở API ở http://localhost:9650

==> Kiểm chứng validator set:
    curl -s -X POST --data '{"jsonrpc":"2.0","id":1,"method":"platform.getCurrentValidators"}' \\
      -H 'content-type:application/json' http://localhost:9650/ext/bc/P

==> Phân bổ genesis (công khai được): $NET_DIR/allocation.md
    🔴 Bảng này là CỦA RIÊNG bộ "$NET_DIR", không phải của mạng nào khác.
       local-net/net = dev local · local-net/net-public = MẠNG CÔNG KHAI.
       Số của mạng công khai chỉ ở net-public/ (bản chép: docs/ALLOCATION-PUBLIC.md).

⚠️  $NET_DIR/keys.txt chứa KHOÁ CỦA CẢ 5 QUỸ — giữ OFFLINE, KHÔNG commit,
    KHÔNG BAO GIỜ đưa lên server. File duy nhất được phép lên server: faucet.env
EOF
