# P0-1 — Đăng ký chainId `9000000009` vào sổ công khai

**Việc của David, làm NGAY `29/08`.** Duyệt mất **vài ngày** — gửi ngày 01/09 là chắc chắn không
kịp. Đây là thứ làm ví (MetaMask, Rabby…) tự nhận diện mạng thay vì bắt người dùng gõ tay.

## Từng bước

1. Fork `github.com/ethereum-lists/chains`.
2. Thêm tệp **`_data/chains/eip155-9000000009.json`** — nội dung lấy nguyên văn từ
   [`eip155-9000000009.json`](eip155-9000000009.json) cạnh tệp này.
3. Mở PR. Tiêu đề gợi ý: `Add 9Chain A1 Testnet (eip155-9000000009)`.

## Mọi con số trong đó đều đã ĐO, không chép từ tài liệu (`2026-08-29`)

| trường | giá trị | đo bằng |
|---|---|---|
| `chainId` / `networkId` | `9000000009` | `eth_chainId` trên RPC công khai ⇒ `0x218711a09` |
| `decimals` | **18** | `eth_getBalance` của quỹ Foundation ⇒ `1e27` wei, chia `1e18` ra đúng **1.000.000.000** LOVE9 như `allocation.md` khai |
| `symbol` | `LOVE9` | `constants.A1AssetAlias` — nguồn sự thật của lớp bí danh (D-082/D-084) |
| `rpc` | `https://rpc-a1.9chain.org/ext/bc/C/rpc` | trả `eth_chainId` đúng |
| `faucets` | `https://a1.9chain.org/faucet` | HTTP **200** |
| `explorers` | `https://a1.9scan.org` | `/block/1` ⇒ **200** (dạng EIP3091) |
| `shortName` `a1love9` | **còn trống** | tra 2.731 mục trong `chains.json` |
| `chainId` đã bị chiếm chưa | **chưa** | `node scripts/check-chainid.mjs` ⇒ exit 0 |

## 🔴 Ba điều phải biết trước khi bấm gửi

1. **Sổ đổi hàng ngày.** Lượt tra trên chỉ nói về **hôm nay**. Chạy lại
   `node scripts/check-chainid.mjs` ngay trước khi gửi PR.
2. **Ngày G `01/09` sinh lại mạng** (`g1`), nhưng **EVM chainId `9000000009` KHÔNG đổi** — nó cố
   định xuyên mọi thế hệ (D-076). Cái đổi là `networkID` của Avalanche (`999999999` → `999999998`),
   thứ **không xuất hiện** trong sổ này. ⇒ PR duyệt trước hay sau ngày G đều đúng.
3. ⚠️ **Chain sẽ RESET ngày G.** Ai thêm mạng vào ví trước 01/09 sẽ thấy lịch sử biến mất hôm ấy.
   Đó là chuyện bình thường của một testnet, nhưng nếu PR duyệt sớm thì **đừng quảng bá** đường
   này trước ngày G.
