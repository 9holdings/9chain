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
| Số dư nhắm tới | **90 LOVE9** trên P-Chain *(David nâng từ 9 lên 90 ở lượt g0, D-082)* |
| Đang có (g0, đo `27/08`) | **89,99999173 LOVE9** `unlocked` |
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

### 🔴 TỪ `28/08` CÓ ĐƯỜNG THỨ HAI, VÀ NGÀY G PHẢI DÙNG ĐƯỜNG ĐÓ (M11.10, D-091)

Cách ở trên đưa **khoá lên server**. Nay có đường ví chạy **ở máy dev**, hầm SSH nằm **trong
cùng container với ví**, khoá **không chạm server một byte nào**:

```bash
node scripts/vi-qua-ham.mjs --kiem                          # nghiệm thu đường đi, chưa cần khoá
node scripts/vi-qua-ham.mjs --khoa <tệp> --quy foundation   # rồi mới nạp khoá
docker rm -f 9chain-a1-vi-ham                               # 🔴 xong việc là dừng NGAY
```

Đã ký thật `28/08` (`p-to-x 0.1`, `Accepted`, đọc lại bằng RPC công khai). ⚠️ Mới chứng minh
trên ví **một khoá**; đường `--quy` chọn 1 trong 6 khoá của `keys.txt` **chưa chạy thật** —
thử **trước** khi bắn quỹ đầu tiên ngày G.
⚠️ Container `9chain-a1-xpwallet` trên server **vẫn còn và vẫn giữ khoá trong env** — D-091 mở
đường mới, **chưa gỡ đường cũ**.

### 🔴 Ba cái bẫy đã trả giá ở lượt nạp g0 (`27/08`)

**1. `xp-wallet` chết sau mỗi lượt re-genesis nếu bí danh tài sản đổi.** Lượt g0 đổi bí danh
X-Chain sang `LOVE9` mà SDK ví vẫn hỏi `"AVAX"` ⇒ `asset 'AVAX' not found`, ví **không khởi
động nổi**. Đã vá bằng patch 0019 (D-082). Nguồn trên server ở `~/9chain-a1/src` là **bản chép,
không phải git repo** — vá ở máy dev rồi phải `scp` sang, và **so `sha256` hai đầu**.

**2. Container `9chain-a1-xpwallet` giữ khoá trong env ⇒ `docker restart` KHÔNG nạp lại.**
Phải `docker rm -f` rồi `docker run`. Cùng bẫy với faucet ở D-081.

**3. Khoá Foundation KHÔNG được để nằm lâu trong một ví HTTP không auth.** Lượt này chạy một
container **tạm** (`a1-fund-tmp`, không publish cổng ra host, gọi bằng `docker exec`), gửi xong
`docker rm -f` ngay. Container `9chain-a1-xpwallet` thường trực chỉ giữ khoá **chain-factory** —
ví nóng, chấp nhận mất.

### Đường nạp đã chạy thật (g0, `27/08`) — hai giao dịch

| | |
|---|---|
| TX1 | khoá **Foundation**, X-Chain gửi `90,01` → `X-love91vgh2whn746dzzvg0dj4w9rsqvlalcldvpueuvj` |
| TX2 | khoá **chain-factory**, `X→P` `90` (export + import) |
| Phí | X txFee `0,001` LOVE9/tx · phí import P lấy thẳng từ phần chuyển sang |
| Đối chứng | Foundation X giảm **đúng** `90,011`; số dư P đọc lại bằng **RPC công khai**, không qua chính cái ví vừa vá |

## Ví faucet

Khoá ở `faucet.env` — **file duy nhất trong bộ genesis được phép lên server**.
Sinh ra bởi netgen cùng lượt với `keys.txt`. D-042 cấp **99.999.999 LOVE9, 100% trên
C-Chain** (faucet dùng ethers, chỉ tiêu trên C-Chain; phần X/P của bảng cũ chưa bao
giờ được dùng tới).
