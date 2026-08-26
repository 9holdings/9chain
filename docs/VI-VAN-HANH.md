# Ví vận hành — không thuộc genesis

🔴 **Vì sao có file này.** Nội dung dưới đây trước kia nằm cuối
`local-net/net-public/allocation.md`. File đó **do netgen sinh ra** — mỗi lượt
`gen-network.sh` ghi đè toàn bộ, nên phần viết tay bị xoá sạch **không dấu hiệu nào**.
Đã suýt mất đúng thế ở lượt re-genesis 2026-08-26. Quy tắc: **đừng viết tay vào file
do công cụ sinh ra**; `allocation.md` chỉ là bảng địa chỉ, mọi thứ khác để ở đây.

Bản `allocation.md` của mạng trước re-genesis lưu ở
`docs/archive/allocation-pre-regenesis-2026-08-26.md`.

> 🔴 **HAI BỘ MẠNG, HAI `allocation.md` KHÁC NHAU — đọc nhầm là ra số của một mạng khác.**
> `local-net/net/` = bộ **dev local** · `local-net/net-public/` = **mạng công khai**.
> Số của mạng công khai **chỉ** nằm ở `net-public/`; bản chép công khai được là
> `docs/ALLOCATION-PUBLIC.md`. Nhầm hai bộ **không gây lỗi, không có dấu hiệu nào** —
> 9Scan-A1 đã dính đúng thế 2026-08-26 và đăng một kết luận sai.

---

## Ví chain-factory

Ví trả phí đẻ L1 và đăng ký subnet validator. **Khoá nằm TRÊN SERVER** (`console.env`)
— nên nó cố tình là một ví riêng, không phải quỹ genesis.

| | |
|---|---|
| Mục đích | trả phí `createSubnet` / `createChain` / `addSubnetValidator` |
| Số dư nhắm tới | **9 LOVE9** trên P-Chain |
| Khoá gốc | `local-net/net-public/chain-factory-key.txt` — gitignored, **chỉ máy dev** |
| Chi phí thật | **0,000141468 LOVE9/lượt đẻ chain** ⇒ 9 LOVE9 ≈ **63.600 lượt** |

**Vì sao tách riêng:** cùng lý do với faucet — lộ khoá trên server chỉ mất 9 LOVE9,
không đụng quỹ genesis. Đây là ví **nóng, chấp nhận mất, nạp lại được**.

🔴 **`A1_L1_ADMIN` KHÔNG được dùng địa chỉ của ví chain-factory.** Nó phải là địa chỉ
EVM của quỹ **Foundation**, để khoá điều khiển mọi L1 đẻ ra vẫn nằm **offline**. Dùng
chung địa chỉ là biến một ví nóng trên server thành chủ sở hữu của mọi L1 khách đẻ ra.

### Nạp lại sau khi re-genesis

Sinh lại mạng ⇒ ví chain-factory **vẫn còn khoá cũ nhưng số dư về 0** (khoá này không
thuộc genesis nên không bị đổi; chỉ số dư mất theo mạng cũ). Phải nạp lại:

1. Nguồn: quỹ **Foundation** (phần X/P thanh khoản — D-042 cho Foundation
   71.000.009 LOVE9 thanh khoản trên X-Chain).
   ⚠️ Mạng cũ nạp từ quỹ *Ecosystem*; **quỹ đó không còn tồn tại** trong bảng D-042.
2. Gửi trên **X-Chain** từ địa chỉ Foundation sang địa chỉ X của chain-factory
   (dư một chút cho phí, mạng cũ gửi 9,01 LOVE9).
3. Chuyển **X → P** 9 LOVE9 — phí đẻ chain trả bằng P-Chain.
4. Đối chứng:
   ```bash
   curl -s -X POST -H 'content-type:application/json' \
     --data '{"jsonrpc":"2.0","id":1,"method":"platform.getBalance","params":{"addresses":["P-<dia-chi>"]}}' \
     https://rpc-a1.9chain.org/ext/bc/P
   ```

Công cụ: `upstream/avalanchego/9chain-a1-tools/xp-wallet` (ví X/P, chạy loopback
`:8090` trên server — **không có auth, tuyệt đối không public**).

## Ví faucet

Khoá ở `faucet.env` — **file duy nhất trong bộ genesis được phép lên server**.
Sinh ra bởi netgen cùng lượt với `keys.txt`. D-042 cấp **99.999.999 LOVE9, 100% trên
C-Chain** (faucet dùng ethers, chỉ tiêu trên C-Chain; phần X/P của bảng cũ chưa bao
giờ được dùng tới).
