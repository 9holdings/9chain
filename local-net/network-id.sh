#!/usr/bin/env bash
#
# network-id.sh — suy `NETWORK_ID` **TỪ CHÍNH genesis sắp được mount**, rồi export.
# Nạp bằng `source`, không chạy thẳng.
#
# ═══ 🔴 VÌ SAO TỆP NÀY TỒN TẠI ═══
#
# Tới `2026-08-28`, bốn tệp compose cắm cứng `--network-id=9001` — **thế hệ đã chết từ
# 27/08**. Và `local-net/net/genesis.json` trên máy dev cũng còn là bộ 9001. Hai bên
# **khớp nhau**, nên node boot sạch, health xanh, mọi cổng xanh — trong khi thứ đang
# chạy là một mạng **không còn tồn tại ở đâu cả**.
#
# Đó là lớp lỗi đắt nhất của dự án ở dạng thuần khiết nhất: **nhất quán nội bộ không
# phải bằng chứng còn sống**. Hai hằng số chép tay ở hai tệp, không cổng nào nối chúng.
#
# ⇒ Nay **không ai chép tay nữa**: `NETWORK_ID` là một **hàm của genesis**. Compose
# không thể lệch khỏi genesis nó mount, vì nó không còn giữ con số nào của riêng mình.
# Cùng kỷ luật đã áp cho netgen (`NETWORK_ID` bắt buộc, D-083) và cho `A1Gen ↔ A1_GEN`
# (`check-consistency.mjs` nối hai ngôn ngữ, D-093).
#
# Dùng:
#   source "$ROOT/local-net/network-id.sh" "$ROOT/local-net/net/genesis.json"

a1_export_network_id() {
  local genesis="$1"
  if [ ! -f "$genesis" ]; then
    echo "    LOI: thieu $genesis" >&2
    echo "    -> chay 'NETWORK_ID=<bang> bash local-net/gen-network.sh <N>' truoc." >&2
    return 1
  fi

  local nid
  nid="$(node -e '
    const g = JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8"));
    if (typeof g.networkID !== "number") { console.error("genesis khong co networkID kieu so"); process.exit(1); }
    console.log(g.networkID);
  ' "$genesis")" || return 1

  export NETWORK_ID="$nid"

  # Khai thẳng thế hệ ra màn hình. Một con số trần không nói được nó còn sống hay không,
  # và im lặng ở đây chính là thứ đã để mạng dev chạy thế hệ chết suốt nhiều ngày.
  # Đường dẫn suy từ VỊ TRÍ CỦA CHÍNH TỆP NÀY, không từ cwd — ba nơi gọi nó đứng ở ba
  # thư mục khác nhau, và một `./` sai chỗ sẽ làm phép đối chiếu im lặng biến mất.
  local here lib live
  here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  lib="$here/lib/chainid.mjs"
  live="$(node -e '
    import("file://" + process.argv[1]).then((m) => console.log(m.A1_ID_GOC - m.A1_GEN));
  ' "$lib" 2>/dev/null)"
  if [ "$nid" = "$live" ]; then
    echo "    NETWORK_ID=$nid  (bang THAT — TRUNG the he dang chay cong khai)"
  elif [ "$nid" -le 899999999 ] && [ "$nid" -ge 899999000 ]; then
    echo "    NETWORK_ID=$nid  (bang TAP — khong bao gio bat tay duoc mang that)"
  elif [ "$nid" -le 999999999 ] && [ "$nid" -ge 999999000 ]; then
    echo "    NETWORK_ID=$nid  (bang THAT, the he KHAC — khong phai mang dang chay)"
  else
    echo "    NETWORK_ID=$nid  🔴 NGOAI MOI BANG 9Chain-A1 — gan nhu chac chan la the he DA CHET." >&2
    echo "       Bo net/ nay sinh truoc 27/08. Sinh lai: NETWORK_ID=899999999 bash local-net/gen-network.sh <N>" >&2
  fi
}

a1_export_network_id "$1"
