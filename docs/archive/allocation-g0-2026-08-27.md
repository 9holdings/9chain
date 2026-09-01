<!-- BẢN CHÉP của `~/9chain-a1/net/allocation.md` trên máy chủ công khai (netgen sinh).
     Chỉ chứa ĐỊA CHỈ — công khai được. Sinh lại mạng thì chép lại. -->

> ⚫ **BẢNG NÀY ĐÃ CHẾT — LƯU TRỮ, ĐỪNG DÙNG.** Thế hệ **g0** (`networkID 999999999`), sinh
> `2026-08-27`, **chấm dứt `2026-09-01 09:26Z`** khi mạng `g1` ra đời.
>
> 🔴 **Sáu địa chỉ dưới đây nay có số dư 0** — đo trên chain đang chạy `2026-09-01`. Gửi tiền tới
> chúng là mất. Bảng đang dùng: [`docs/ALLOCATION-PUBLIC.md`](../ALLOCATION-PUBLIC.md).
>
> *(Nguyên văn lúc còn sống:)* ✅ **ĐÂY LÀ BẢNG CỦA MẠNG CÔNG KHAI**, thế hệ **g0** — sinh lại `2026-08-27`.
>
> 🔴 **Mọi địa chỉ dưới đây LÀ MỚI.** Bảng của mạng trước (`networkID 9001`, sinh `26/08`)
> lưu ở [`docs/archive/allocation-pre-g0-2026-08-27.md`](archive/allocation-pre-g0-2026-08-27.md).
> Địa chỉ của thế hệ trước **có số dư 0** trên chuỗi này — đã đo.
>
> ⚠️ **Đừng đọc `local-net/net/allocation.md`** — đó là bộ **dev local**, một mạng khác, khoá
> khác, số khác. Nhầm hai bộ **không gây lỗi và không có dấu hiệu nào**; 9Scan-A1 đã dính đúng
> thế `26/08`.
>
> Vật chứng của mạng thế hệ trước, xuất **trước khi xoá**:
> `docs/evidence/o2-before-delete-2026-08-27/` — `GỐC` công bố ở `DECISIONS.md` D-080.

# 9Chain-A1 — Phân bổ genesis (networkID 999999999, 9 node)

Tổng phát hành genesis: **5,400,000,000 LOVE9** · Tổng cung: **9,000,000,000 LOVE9** (trần cung P/X **7,900,000,001** + phát hành thẳng trên C-Chain **1,099,999,999**)

File này CÔNG KHAI được — chỉ chứa địa chỉ, không chứa khoá bí mật.

| Hạng mục | Quỹ | % | Tổng (LOVE9) | X/P thanh khoản | X/P khoá | Mở khoá | C-Chain | Địa chỉ X | Địa chỉ EVM |
|---|---|--:|--:|--:|--:|---|--:|---|---|
| Foundation | Self-bond validator genesis | 12% | 8,999,991 | 0 | 8,999,991 | 1 nam | 0 | `X-love91370pefthjkwwfdqlzxtnp77k2ngvx4lta20s9j` | `0x9bE66b94a4B0bBa29aEBd7212c449218534b7658` |
| Foundation | Foundation | 12% | 1,071,000,009 | 71,000,009 | 0 | — | 1,000,000,000 | `X-love918a4zwddz9nqjmzyzd86nt2czjkgpfxl8s3wx4g` | `0xf408235C570d8e213F94FbdAE4a90df66C27216d` |
| Community | Community (khoá) | 30% | 2,600,000,001 | 0 | 2,600,000,001 | 2 nam | 0 | `X-love91p6d539kerj4zhw69z2ktfj0fxh2gmg94sup9y8` | `0xd15e1A06aAadb67512763b1816A49e5ACa8Ed0A6` |
| Community | Faucet (ví NÓNG) | 30% | 99,999,999 | 0 | 0 | — | 99,999,999 | `X-love91l778hux3c9uhtecnmmz5vz70mzp4g8nh00xlrm` | `0x38f4548D9F32db8f7848dc63e3621BD19cd38C44` |
| Private Sale | Private Sale | 9% | 810,000,000 | 0 | 810,000,000 | 2 nam | 0 | `X-love917x25wdqv26elj39y2fh2qewz6qgk6wgpnmja8n` | `0xE173E4Fec44531aD38D0BC7e467CC14384a40e55` |
| Team | Team | 9% | 810,000,000 | 0 | 810,000,000 | 4 nam | 0 | `X-love915vz84wsm2ueldg4rfwacjkkfuv67a46vuhmksz` | `0x153c4375b3a05d573DAABd1ABeEb3A8f7A01F988` |

## Ghi chú
- Quỹ **Staking** không có địa chỉ chi tiêu thường: toàn bộ 8,999,991 LOVE9 được avalanchego chia đều thành stake của 9 validator genesis (999,999 LOVE9/node).
- Thưởng staking của các node genesis chảy về quỹ **Foundation**.
- Quỹ **Faucet** là ví nóng, cố tình tách riêng — lộ khoá chỉ mất phần faucet, không ảnh hưởng các quỹ khác.
- C-Chain không có cơ chế khoá native: phần C-Chain của mọi quỹ đều thanh khoản ngay.
- Khoá bí mật nằm trong `keys.txt` (chmod 600, KHÔNG commit, KHÔNG đưa lên server).
