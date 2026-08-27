# DIỄN TẬP GIAO DỊCH NGHI LỄ "BLOCK ADAM" — `2026-08-27`

> Mốc A-1 của đợt autopilot 14. Điều kiện qua (HANDOFF): *"trên mạng tập, hẹn giờ chạy đúng
> giây đã định, block sinh ra, đọc lại được `blockNumber`+`timestamp`. Kèm 1 ca đối chứng
> ngược (hẹn sai giờ ⇒ không có block)."* — **đạt, và kèm 2 ca đối chứng ngược thay vì 1.**
>
> 🔴 **Nhưng thứ đáng giá nhất của lượt này không phải ô ✓.** Lượt chạy đầu tiên — bắn **đúng**
> mốc, y như kế hoạch đang viết — **hỏng**, và hỏng đúng kiểu chỉ lộ ra vào `09/09`.

---

## 1. Kết quả một dòng

**Bắn đúng mốc thì luật khắc và hành động nghi lễ trỏ vào HAI BLOCK KHÁC NHAU.**
Phải bắn **sau** mốc một khoảng, và khoảng đó phải suy từ độ lệch đồng hồ của 9 node.

---

## 2. Dựng bài

| | |
|---|---|
| Mạng tập | 1 node, `local-net/docker-compose.drill.yml`, project `a1-drill`, cổng **9750** |
| Binary | `9chain-a1/node:boottest` — bản đã vá patch 0013/0014. Đối chứng: `"supplyCap":7900000001000000000` trong dòng log đầu |
| Chuỗi đo | **C-Chain** (`eth_chainId` = `0x218711a09` = 9.000.000.009) — theo khuyến nghị §4 `NGAY-G-A1-CON-LAI` |
| Ví nghi lễ | ví faucet của bộ `local-net/net/` (mạng **dev**, không phải mạng công khai) |
| Bài | [`local-net/faucet/block-adam-drill.mjs`](../local-net/faucet/block-adam-drill.mjs) |

**Vì sao cổng 9750 chứ không 9650:** Blockscout local trỏ vào 9650. Cho mạng tập lên đó là
để explorer index một chuỗi rồi chuỗi đó biến mất lúc `down -v`. Sơ đồ này lấy từ §9.6 bản
soát core `27/08`; nay đã codify thành tệp compose để lần sau không phải nhớ.

---

## 3. Bốn lượt chạy

| # | Chế độ | Bù so với mốc | Kết quả | Ý nghĩa |
|---|---|--:|---|---|
| **0** | diễn tập thật | **0 ms** | 🔴 **7 đạt · 1 hỏng** | **kế hoạch như đang viết — HỎNG** |
| **1** | diễn tập thật | **+3.000 ms** | ✅ **9 đạt · 0 hỏng** | đường vá |
| **2** | đối chứng ngược A — không gửi gì | — | ✅ 3 đạt · 0 hỏng (**không có Block Adam**, đúng) | phép đo phân biệt được |
| **3** | đối chứng ngược B — **hẹn sai giờ**, bắn sớm 12s | −12.000 ms | ✅ 5 đạt · 0 hỏng (**không có Block Adam**, đúng) | bẫy xanh giả |

Vật chứng JSON của từng lượt sinh bằng cờ `--json`.

### 3.1 🔴 Lượt 0 — bắn đúng mốc, và nó hỏng

Mốc `2026-08-27T09:14:32Z` (epoch giây `1787822072`). Bắn lệch **0 ms**.

```
block #1  ts = 1787822072   ← chứa giao dịch ADAM.  ĐÚNG BẰNG MỐC, không vượt mốc
block #2  ts = 1787822074   ← chứa giao dịch EVA.   vượt mốc +2s
```

Luật định khắc là *"block **đầu tiên vượt** `2026-09-09T06:09:09Z`"*. Theo đúng chữ đó,
**Block Adam sẽ là block của Eva.**

Nguyên nhân: `block.timestamp` rơi vào **đúng giây ta bấm gửi**. Bắn tại giây `T` ⇒ block
mang `ts = T`, mà `T > T` là sai. Toàn bộ khoảng cách giữa "trúng" và "trượt" ở đây là
**một phép so sánh chặt hay không chặt** — thứ không ai nhìn thấy khi đọc kế hoạch.

⚠️ Kèm một quan sát nhỏ nhưng đủ làm hỏng kịch bản nếu ai đó dựa vào: **Adam và Eva KHÔNG
vào cùng một block**, dù được phát đi cách nhau vài mili-giây. Chúng rơi vào hai block cách
nhau 2 giây. Đừng viết kịch bản nghi lễ dựa trên giả định "hai giao dịch một block".

### 3.2 Lượt 1 — bù +3s, 9/9

```
mốc          1787822275
block #3     ts = 1787822278  (+3s)   ← chứa Adam, VÀ là block đầu tiên vượt mốc  ✓
```

Chín ô đạt, gồm hai ô mạnh nhất:
- **block CHỨA giao dịch Adam tự nó vượt mốc** — `#3 ts=1787822278, cách +3s`
- **block đầu tiên vượt mốc CHÍNH LÀ block của Adam** — `#3 vs #3`

### 3.3 Lượt 2 — đối chứng ngược A: không gửi gì

Nhìn mốc trôi qua, không phát giao dịch nào. Sau **50 giây**: chiều cao **#4 → #4**, không
một block nào.

⇒ **Đo lại độc lập và khẳng định lại quan sát `26/08`:** Avalanche không đẻ block rỗng, kể cả
khi một mốc thời gian đi qua. Không có nghi lễ thì **không có Block Adam**, chấm hết.

### 3.4 🔴 Lượt 3 — đối chứng ngược B: hẹn sai giờ. Đây là ca đắt nhất.

Bắn **sớm 12 giây**. Kết quả:

```
✓ giao dịch vẫn chốt bình thường   block #5 status 1
✓ chuỗi vẫn đẻ ra block            +2 block
✓ KHÔNG có block nào vượt mốc  ⇒  KHÔNG CÓ BLOCK ADAM
```

**Mọi dấu hiệu thành công đều xanh** — hai giao dịch `status 1`, chuỗi đẻ block, không lỗi
nào ở đâu — **mà nghi lễ vẫn trượt.** Một bài kiểm chỉ hỏi *"giao dịch có chốt không"* sẽ
báo ĐẠT ở đúng ca này. Đây là lý do ô chấm phải là **"quét chuỗi tìm block đầu tiên vượt
mốc"**, không phải **"giao dịch của tôi có receipt"**.

---

## 4. 🔴 Kết luận cho ngày `09/09` — ba mục, xếp theo mức mất mát

### (1) Bù dương là BẮT BUỘC, và con số phải suy từ đo, không từ cảm tính

Bắn tại `mốc + 0` là đánh cược vào việc làm tròn giây. Lượt 1 dùng **+3s** và đạt.

🔴 **Nhưng +3s đo trên MỘT node, và node đó dùng chung đồng hồ với máy bắn.** Trên bộ 9 node,
`block.timestamp` là đồng hồ của **node đề xuất block**, không phải của máy bắn. Node đó chạy
chậm 5 giây thì bù +3s **vẫn trượt**.

⇒ **Việc phải làm trước ngày G:** đo độ lệch đồng hồ của **cả 9 node** (so `block.timestamp`
của block do từng node đề xuất với giờ chuẩn), rồi chọn bù **lớn hơn độ lệch âm lớn nhất**.
Không đo thì không có cơ sở chọn số.

### (2) 🔴 Luật *"block ĐẦU TIÊN vượt mốc"* là thứ nghi lễ KHÔNG tự bảo đảm được

Bù dương chỉ vá được phần ta điều khiển: **giao dịch của ta**. Nhưng mệnh đề *"đầu tiên"* nói
về **toàn chuỗi**. Bất kỳ ai gửi một giao dịch vào khoảng giữa mốc và lúc ta bắn đều **chiếm
mất ô đó**, và không có cách nào giành lại.

Đo `26/08` cho thấy mạng công khai đứng yên lúc rảnh — nhưng *"đo thấy đứng yên"* **không phải**
*"được bảo đảm đứng yên"*, và ngày G là ngày đông người nhất từ trước tới nay.

⇒ Luật khắc chắc chắn đúng phải neo vào thứ ta cầm được: **hash của giao dịch nghi lễ**, hoặc
**số block chốt sau khi nó đã sinh ra**. 🔴 **Đây là việc của David** — `NGAY-G-A1-CON-LAI.md`
§6 mục 3 đang hỏi *"Block Adam nằm trên chain nào"*; lượt diễn tập này thêm một câu nữa vào
cùng mục đó: **neo vào cái gì**.

### (3) Bài này chỉ chứng minh cho **C-Chain**

Khuyến nghị hiện tại là C-Chain và bài đo đúng C-Chain. **Nếu David chọn P-Chain thì lượt
diễn tập này không phủ được** — giao dịch nghi lễ trên P-Chain là cơ chế khác hẳn (export/
import hoặc thao tác staking), không phải một `eth_sendRawTransaction`. Chọn P-Chain ⇒ **phải
diễn tập lại**, và phải tính thời gian cho việc đó trước `09/09`.

---

## 5. Giới hạn của phép đo — đừng trích mạnh hơn

| | |
|---|---|
| Số node | **1**, `--sybil-protection-enabled=false`. **Không chứng minh được đồng thuận.** Kết luận về đồng hồ node đề xuất ở §4(1) là **suy từ cơ chế**, chưa đo trên bộ nhiều node |
| Mạng | mạng **tập** cục bộ, không tải, không peer. Mạng công khai ngày G có 9 node và có người thật |
| Chuỗi | **chỉ C-Chain**. X-Chain và P-Chain chưa đo |
| Độ chính xác bắn | lệch **0 ms** ở cả 3 lượt có hẹn giờ — nhưng đó là đồng hồ máy dev, chưa đồng bộ NTP có kiểm chứng |

---

## 6. Chạy lại

```bash
docker compose -p a1-drill -f local-net/docker-compose.drill.yml up -d
cd local-net/faucet
export A1_DRILL_PK=<khoá có tiền trên C-Chain của mạng tập>
node block-adam-drill.mjs --moc 2026-09-09T06:09:09Z --bu-ms 3000 --json /tmp/adam.json
# đối chứng ngược — BẮT BUỘC chạy kèm, xem lượt 2 và 3 ở trên
node block-adam-drill.mjs --moc <mốc khác> --khong-gui
node block-adam-drill.mjs --moc <mốc khác> --bu-ms -12000 --doi-chung-nguoc
docker compose -p a1-drill -f local-net/docker-compose.drill.yml down -v
```
