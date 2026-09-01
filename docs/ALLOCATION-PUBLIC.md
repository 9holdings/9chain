<!-- BẢN CHÉP của `local-net/net-g1/allocation.md` (netgen sinh lúc tạo mạng g1).
     Chỉ chứa ĐỊA CHỈ — công khai được. Sinh lại mạng thì chép lại VÀ lưu bản cũ vào docs/archive/. -->

> ✅ **BẢNG CỦA MẠNG ĐANG CHẠY** — thế hệ **g1**, `networkID 999999998`, sinh `2026-09-01 09:26Z`.
>
> **Sáu địa chỉ dưới đây đã được ĐO TRÊN CHAIN ĐANG CHẠY**, không phải chỉ chép từ tệp
> (`2026-09-01`, `scripts/o1-check.mjs --rpc`, cả hai nửa xanh): mỗi khoá suy ra đúng địa chỉ nó
> tự khai, **và** mỗi địa chỉ giữ đúng số tiền ghi trong bảng, khớp từng đơn vị.
>
> ⚫ **Thế hệ trước (`g0`, `networkID 999999999`) ĐÃ CHẾT** <!-- stale-ok: đang chỉ vào bản lưu trữ --> — bảng của nó lưu ở
> [`docs/archive/allocation-g0-2026-08-27.md`](archive/allocation-g0-2026-08-27.md), và **sáu địa
> chỉ ở đó nay có số dư 0**. Bảng của thế hệ trước nữa (`networkID 9001`) ở <!-- stale-ok -->
> [`docs/archive/allocation-pre-g0-2026-08-27.md`](archive/allocation-pre-g0-2026-08-27.md).
>
> 🔴 **Mỗi lượt sinh lại mạng là một bộ địa chỉ HOÀN TOÀN MỚI.** Địa chỉ của thế hệ cũ không
> báo lỗi khi bị dùng nhầm — chúng chỉ im lặng có số dư 0. Trước khi tin bất kỳ bảng nào, đối
> chiếu `networkID` ở dòng tiêu đề với mạng đang chạy:
> `curl -s -X POST -H 'content-type:application/json' --data '{"jsonrpc":"2.0","id":1,"method":"info.getNetworkID","params":{}}' https://rpc-a1.9chain.org/ext/info`
>
> ⚠️ **Đừng đọc `local-net/net/allocation.md`** — đó là bộ **dev local**, một mạng khác, khoá
> khác, số khác. Nhầm hai bộ **không gây lỗi và không có dấu hiệu nào**; 9Scan-A1 đã dính đúng
> thế `26/08`.

# 9Chain-A1 — Phân bổ genesis (networkID 999999998, 9 node)

Tổng phát hành genesis: **5,400,000,000 LOVE9** · Tổng cung: **9,000,000,000 LOVE9** (trần cung P/X **7,900,000,001** + phát hành thẳng trên C-Chain **1,099,999,999**)

File này CÔNG KHAI được — chỉ chứa địa chỉ, không chứa khoá bí mật.

| Hạng mục | Quỹ | % | Tổng (LOVE9) | X/P thanh khoản | X/P khoá | Mở khoá | C-Chain | Địa chỉ X | Địa chỉ EVM |
|---|---|--:|--:|--:|--:|---|--:|---|---|
| Foundation | Self-bond validator genesis | 12% | 8,999,991 | 0 | 8,999,991 | 1 nam | 0 | `X-love91a6ln7664uegrwf9cauzum040g24s4tv0qmdfra` | `0x8a96cB5882DB425236f767a9683bED3b775eACdf` |
| Foundation | Foundation | 12% | 1,071,000,009 | 71,000,009 | 0 | — | 1,000,000,000 | `X-love91d3xm0w6yctuwdtgz4wchhf65jh0z7ttsfe8zjp` | `0x1212b2445e74f788B30BfA9C42aa46f252345a0B` |
| Community | Community (khoá) | 30% | 2,600,000,001 | 0 | 2,600,000,001 | 2 nam | 0 | `X-love91jthl2n2h3jv45hnp8g2e2tr5c0w4fuazacd48q` | `0x1e738Cdf9b8B2Ced036Ad3BE382D141a7B0ee6C5` |
| Community | Faucet (ví NÓNG) | 30% | 99,999,999 | 0 | 0 | — | 99,999,999 | `X-love91sx8wwlvexajzqtru6k4uy68f56jrkr99fy70qm` | `0x14666b5b64ecF49D7ECAB64D56D4FE01d0A89058` |
| Private Sale | Private Sale | 9% | 810,000,000 | 0 | 810,000,000 | 2 nam | 0 | `X-love91ghwahzdc4m899jknjkag3sqvfzpcxm4sxd5mt4` | `0x3823D9cA784B719D058f16E512E41b154A05b814` |
| Team | Team | 9% | 810,000,000 | 0 | 810,000,000 | 4 nam | 0 | `X-love91susl5nmwnvfcdxg34jlpfxl47cypw8qu5hecn0` | `0x1e6c530FD49731e43EcbFE417c304756B93498c3` |

## Ghi chú
- Quỹ **Staking** không có địa chỉ chi tiêu thường: toàn bộ 8,999,991 LOVE9 được avalanchego chia đều thành stake của 9 validator genesis (999,999 LOVE9/node).
- Thưởng staking của các node genesis chảy về quỹ **Foundation**.
- Quỹ **Faucet** là ví nóng, cố tình tách riêng — lộ khoá chỉ mất phần faucet, không ảnh hưởng các quỹ khác.
- C-Chain không có cơ chế khoá native: phần C-Chain của mọi quỹ đều thanh khoản ngay.
- Khoá bí mật nằm trong `keys.txt` (chmod 600, KHÔNG commit, KHÔNG đưa lên server).
