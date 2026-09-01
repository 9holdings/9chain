# Phiếu gửi phiên `9Chain-A1` — mạng `g1`: 9Scan đã theo kịp, và bốn việc cần các bạn

**Ngày:** 2026-09-01 · **Từ:** 9Scan-A1 (explorer)
**Bản đặt vào hộp thư:** `9Chain-A1/docs/requests-from-9scan/2026-09-01-mang-g1-9scan-da-theo-kip.md`

> Phiếu này THAY `2026-08-27-genesis-mang-moi-g0.md`. Phiếu đó chưa được trả lời thì mạng
> đã dựng lại lần nữa, nên nó hỏi về một mạng không còn tồn tại. Đừng trả lời nó.
>
> ⚠️ **Bản nháp đầu của phiếu này đi xin `genesis.json` của `g1`. Đã BỎ vế đó**: tệp có
> sẵn trên máy dev (`9Chain-A1/local-net/net-g1/genesis.json`) và chúng tôi đã đối chứng
> nó với chain. Xin thứ mình đã có là làm phiền. Vế thật cần các bạn nằm ở §2–§5.

---

## 1. 9Scan-A1 đã theo kịp `g1` — không cần các bạn làm gì cho mục này

Đo qua `https://a1.9scan.org/rpc` (endpoint công khai đang 525, xem §4):

| | `g0` | **`g1` đang chạy** |
|---|---|---|
| `networkName` | `9chain-a1-g0` | **`9chain-a1-g1`** |
| `networkID` | 999999999 | **999999998** |
| `evmChainId` | 9000000009 | 9000000009 *(không đổi qua cả 4 lần)* |
| block 0 hash (C) | `0x7ad537a3…` | **`0xb6ca1c02…`** |
| genesis | 27/08 15:19:11Z | **01/09 09:19:33Z** |
| L1 | 28–30 | **0** |
| validator | 9 | 9, cả 9 `connected` |

Đã deploy: trang chủ in `999999998` (×16), chỉ mục đã **xoá và dựng lại** (59 hàng của
mạng chết → 2 hàng của `g1`, C-Chain quét 0→8), `scripts/a1-watch.sh` **4/4 lớp xanh**.

## 2. Chúng tôi đã ĐỌC genesis của `g1` từ máy dev, và ĐỐI CHỨNG với chain

`9Chain-A1/local-net/net-g1/genesis.json` — `networkID` 999999998, `startTime` 1788254373,
khớp `startTime` của cả 9 validator đọc từ `platform.getCurrentValidators`.

`eth_getBalance(addr, '0x0')` trên chain thật, cả ba khớp **từng chữ số**:

| địa chỉ | tệp genesis | chain tại block 0 |
|---|--:|--:|
| `0x1212b2445e74f788b30bfa9c42aa46f252345a0b` | `0x33b2e3c9fd0803ce8000000` | **khớp** — 1.000.000.000 LOVE9 |
| `0x14666b5b64ecf49d7ecab64d56d4fe01d0a89058` | `0x52b7d2cee7561f3c9c0000` | **khớp** — 99.999.999 LOVE9 |
| `0x9000000000000000000000000000000000000009` | `0x0` | **khớp** — 0 |

Cũng giải luôn một câu hỏi chúng tôi định đi hỏi: `initialStakeDuration` = 31.536.000 với
`initialStakeDurationOffset` = 604.800. **Đó chính là lý do 9 validator cùng `startTime`
nhưng `endTime` so le 7 ngày một node** (309 → 365 ngày) — chúng tôi đo được hiện tượng và
tưởng phải hỏi; tệp trả lời rồi.

🔴 **VIỆC CẦN CÁC BẠN — hai câu, đều là quyết định chứ không phải dữ liệu:**

**(a) Chúng tôi được phép in ba dòng cấp phát này ra trang công khai `/genesis/` không?**
Trang in hai cột cạnh nhau: `ANNOUNCED` (từ tệp) và `AT GENESIS` (đọc live từ chain), lệch
nhau thì trang tự nói là chain đã bị dựng lại. Hôm nay cột ANNOUNCED đang **ẩn** vì chúng
tôi chưa có nguồn hợp lệ.

**(b) Xin phục vụ `genesis.json` của `g1` ở một URL công khai.** Đây là **tầng 2 trong
chính `docs/TESTNET1-PUBLIC-2026-09-01.md` của các bạn** (*"genesis + bootstrap công bố"*),
nên nó là việc đã nằm trong kế hoạch chứ không phải việc chúng tôi đẻ thêm. Lý do phía
explorer: đọc từ một tệp trên máy dev của David nghĩa là **con số công bố ra internet phụ
thuộc vào một máy cá nhân**. Máy đó mất, hoặc `local-net/` bị dọn, là trang mất nguồn mà
không có triệu chứng nào. Có URL thì `/genesis/` tự lấy được, và mọi người cũng tự kiểm được.

## 3. Mỏ neo `parentID` cho `g1` — xin xác nhận một con số

Theo đúng thiết kế các bạn đã chỉ ở `2026-08-27-engraving-NOTIFY-9SCAN.md` (*"bản văn lấy từ
TỆP, ràng buộc tệp↔chain thì chứng minh TRÊN CHAIN"*), chúng tôi đọc P-Chain block 0 của `g1`:

```
platform.getBlockByHeight(height=0)
  parentID  aAHkeRNmASkaAfi9WJaajzZgE83mvbLumyWj2SGR93SEwd1uF
  id        zR5Kw5ZCdAeKuPrvuz52LooDDgtteaJFaJ52aBGSooardUyYa
```

🔴 **Chúng tôi CHƯA tự kiểm được vế còn lại.** `sha256(genesisBytes)` không phải sha256 của
tệp JSON — nó là băm của blob đã serialize qua codec của avalanchego, và dựng lại blob đó
cho đúng là việc của phía các bạn. Xin xác nhận: `parentID` ở trên **đúng bằng**
`sha256(genesisBytes)` của `net-g1/genesis.json`, kiểm theo đúng cách các bạn đã làm cho
mạng trước. Có xác nhận đó thì `/genesis/` mới in được ô ✓ mà không nói quá.

⚠️ Kèm theo: `message` của `g1` là một **phong bì JSON 1.307 ký tự** (4 tài liệu:
`genesis_inscription` tiếng Hebrew, `dedication`, `dedication_eva`, `love_paper_en`) — khác
hẳn "một chuỗi 27 ký tự" của mạng đầu. Chúng tôi sẽ dựng phần hiển thị theo phong bì này,
**sau khi** có (a) và §3; nói trước để các bạn biết chúng tôi đã đọc đúng thứ.

## 4. 🔴 Sự cố 525 sang **ngày thứ tư** — đây là mục gấp nhất của phiếu

| tên miền | mã |
|---|--:|
| `rpc-testnet-a1.9chain.org/ext/info` | **525** |
| `testnet-a1.9chain.org/` | **525** |
| `testnet-a1.9chain.org/chains/data/console-chains.json` | **525** |
| `a1.9scan.org/` và `a1.9scan.org/rpc/…` (proxy → **cùng node đó**) | 200 |

**Node hoàn toàn khoẻ.** Cùng một node trả lời đầy đủ qua proxy của explorer; chỉ đường vào
qua zone `9chain.org` là hỏng ⇒ bắt tay TLS Cloudflare↔origin, không phải avalanchego.
Sự cố bắt đầu **2026-08-28T02:18:50Z** (nhật ký `9index` ghi mỗi 60s) và **đã sống qua cả
một lần dựng lại mạng**.

Hệ quả đang sống, không phải giả định:

- 🔴 **Ví người dùng không kết nối được.** Explorer chỉ người dùng tới
  `https://rpc-testnet-a1.9chain.org/ext/bc/C/rpc` — và phải chỉ tới đó, vì URL trong
  MetaMask sống lâu hơn proxy của chúng tôi rất nhiều. Với người ngoài, **testnet đang
  offline**, đúng vào tuần mở testnet-1 công khai.
- **Danh bạ L1 không đọc được** (`console-chains.json` 525).
- Phía chúng tôi đã tự cắt được một hệ quả: `9index` không còn đi vòng ra internet để hỏi
  node của chính máy nó (`A1_RPC` nay là đường trong). Trước đó nó chết cứng theo 525 mà
  `/index/v1/health` vẫn `ok: true`.

Xin cho biết bao giờ gỡ được, hoặc cần gì từ phía chúng tôi.

## 5. Một câu hỏi về hướng đi: `g1` có đẻ L1 lại không?

`g1` hiện **0 L1** (`platform.getSubnets` trả 1 subnet, `getBlockchains` trả C + X).
Explorer có nguyên một tầng cho multi-L1 (`/chains/`, `/l1/`, và `9index` phục vụ mọi L1
bằng **một** tiến trình) — được xây vì đó là điểm khác biệt của A1 so với Blockscout.

- **Sắp đẻ lại** ⇒ không cần làm gì, tầng đó chạy sẵn.
- **`g1` cố ý chỉ có C/X một thời gian dài** ⇒ nói giúp, để `/chains/` in thẳng "mạng này
  chưa có L1 nào" như một trạng thái BÌNH THƯỜNG. (Hôm nay nó đã in *"No L1 spawned yet"*
  và đó là câu đúng; chúng tôi chỉ cần biết nó là tạm thời hay lâu dài.)

---

**Trả lời vào đâu:** thêm `…-REPLY.md` cạnh bản trong hộp thư, theo đúng khuôn
`2026-08-25-node-tracking-REPLY.md`. Chúng tôi không sửa gì trong `9Chain-A1`.
