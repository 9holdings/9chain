# Bài toán 108 L1 hoạt động thử nghiệm — cần hạ tầng cỡ nào?

Viết `2026-09-03` đêm, theo yêu cầu của David: *"lên bài toán cho 108 layer 1 hoạt động thử nghiệm xem
cần quy mô hạ tầng thế nào với mỗi chain đều có hoạt động."* Mọi con số **đã đo** ghi nguồn; con số
**ước** ghi rõ là ước và có pha đo để thay nó. Tài liệu này là **đầu vào cho quyết định**, không phải
quyết định.

---

## 0. Câu trả lời ngắn

**108 L1 không chạy được trên hạ tầng hôm nay, và lý do đầu tiên không phải máy — là giao thức.** Mỗi node
chỉ được khai tối đa **16 subnet** lúc bắt tay P2P (`network/peer/peer.go:39`, vượt là mọi peer cắt kết
nối). Mô hình hiện tại *"mọi validator track mọi L1"* nên trần mạng = trần node = **15** (chừa 1).

Muốn 108 chain thì phải **chia validator**: mỗi chain chỉ một nhóm `V` node track, và
`108 × V ≤ N × 15` ⇒ `N ≥ 7,2 × V` node. Đó là **việc phần mềm ở console** (mục 4) trước khi là việc mua
máy.

| Phương án | `V` validator / chain | Node validator tối thiểu | Máy (vật lý 8 nhân / 64 GB, ~4 node/máy) hoặc VM 4 vCPU | Chi phí thử nghiệm / tháng (ước) |
|---|---|---|---|---|
| **C — demo** | 2 | 15 | 4 máy · hoặc 15 VM | ~€250–350 |
| **A — có nghĩa** ⭐ | 5 | 36 | 9 máy · hoặc 36 VM | ~€700–900 |
| **B — như mạng chính** | 9 | 65 | 16 máy · hoặc 65 VM | ~€1.200–1.500 |

Cộng thêm cho **mọi** phương án: tầng RPC riêng (≈ 8 node, mỗi node phục vụ ≤ 15 chain) + 2–3 máy sinh tải
+ router chainId → node. ⭐ **Đề xuất A**: 5 validator/chain là mức thấp nhất mà một chain còn "chịu được
một node chết"; C chỉ để kiểm phần mềm, B là chi phí gấp đôi cho câu hỏi thử nghiệm không cần tới.

🔴 **Chạy trên băng TẬP, không chạy trên g1 công khai.** 108 tên và chainId sẽ nằm **vĩnh viễn** trong
`chainid-issued.json` (sổ chỉ phình — D-069), và g1 chỉ còn **9 chỗ**. Thế hệ tập `A1IDTap = 899999999 −
A1Gen` sinh ra đúng cho việc này.

---

## 1. Ba bức tường cứng, theo thứ tự đụng

| # | Tường | Số | Nguồn | Vượt bằng |
|---|---|---|---|---|
| 1 | **Track subnet / node** | 16, cưỡng chế lúc handshake, vượt ⇒ `p.StartClose()` | `upstream/avalanchego/network/peer/peer.go:39`, D-009, H-2 | chia validator (console) — **không có nút vặn** |
| 2 | **CPU đồng thuận / L1 track** | ~0,05 luồng/node/L1 **dù chain im** + 53 MiB RAM cho plugin subnet-evm | D-178, đo bằng `scripts/measure-node-load.sh` (cgroup), hai mẫu cách 2 h trùng ±3,5 % | ít L1 hơn mỗi node, nhiều node hơn |
| 3 | **Ý nghĩa bảo mật** | 108 L1 trên 9 node ⇒ 1,33 validator/L1 = cơ sở dữ liệu một người ghi | D-174 | `V ≥ 5` ⇒ `N ≥ 36` |

Tường mềm (đụng muộn hơn nhưng có thật): RAM **lớn theo tuổi node** chưa thấy trần (D-178: +1,7 GB/9 node
trong 2 h) · đĩa · băng thông gossip khi mỗi chain có `V` node ở nhiều máy · **thời gian đẻ chain** ~170 s
mỗi lượt kèm rolling restart (D-174) ⇒ 108 lượt ≈ 5 giờ nối tiếp.

---

## 2. Số đo đang có — và một đính chính

### 2a. Máy đang chạy 9 node (đọc `2026-09-03 20:32Z` qua ssh, chỉ đọc)

```
CPU    Intel (model không công bố)  — 4 NHÂN vật lý / 8 LUỒNG  (D-178 gọi là "8 lõi": đó là 8 luồng)
RAM    64 GB  (dùng 6,7 GB, cache 47 GB)
Đĩa   410 GB, còn 343 GB
load   2,66 (1 phút) với 9 node · 6 L1 im · bơm 9 tx/s trên C-Chain
```

🔴 **Đính chính:** ngoại suy *"trần 15 ≈ 6–7 core trên máy 8 lõi"* (D-178) là **6–7 luồng trên 8 luồng**
của **4 nhân**. Sát hơn đã nghĩ: hyper-threading cho ~1,3× nhân, không phải 2×. Máy này đầy 15 L1 là
**đầy thật**, chưa tính giao dịch trên L1 nào.

### 2b. Chi phí đã đo

| Đại lượng | Số | Điều kiện | Nguồn |
|---|---|---|---|
| CPU mỗi L1 track, chain **im** | **~0,05 luồng / node** | 3 → 6 L1, node 75–204 phút tuổi | D-178 |
| RAM plugin subnet-evm mỗi L1 | **53 MiB / node** cố định | chain im | D-178 |
| RAM `avalanchego` | ~308 MiB / node ở 3,4 h, **tăng theo tuổi** | 6 L1 | D-178 |
| Tổng 9 node, 6 L1 im + bơm 9 tx/s C-Chain | **2,2 luồng · 5,8 GB** | node 3,4 h | D-178 |
| Bơm 9 tx/s trên C-Chain | 9,16 tx/s vào khối, block **1,95 s**, 474.106 tx / 14,7 h | `heartbeat.json` `20:33Z` | đo tối nay |
| Sàn nhịp block | **2,0 s** (coreth; subnet-evm mặc định cũng 2 s) | | memory bơm tải |
| Đĩa mỗi giao dịch | ~4.500 B **tổng** (9 node + Postgres Blockscout, g0) ⇒ ước **~0,3–0,5 KB / tx / node** (volume 9 node ≈ 2 GB sau ~500 k tx g1) | bậc độ lớn | memory bơm tải · `docker system df` tối nay |
| Giá đẻ một chain | 0,00023 LOVE9 | phí động P-Chain | D-174 |
| Phí duy trì ACP-77 (nếu chuyển) | 1 nLOVE9/s/validator = 0,0000864 LOVE9/ngày/validator | giá sàn | `docs/PROGRESS.md` |

### 2c. Số CHƯA đo — đúng thứ pha 0 phải đo

| Ẩn số | Vì sao cần | Giá trị tạm dùng để lập kế hoạch |
|---|---|---|
| **`c_tx`** — CPU mỗi (tx/s) trên một L1 **có giao dịch** | toàn bộ bài toán "mỗi chain đều hoạt động" xoay quanh nó | ≤ 0,006 luồng/(tx/s)/node suy từ C-Chain (bơm 9 tx/s lọt trong nhiễu của 6 L1 im). Dùng **0,02** (biên ×3) vì subnet-evm là tiến trình riêng, IPC qua gRPC |
| RAM subnet-evm **dưới tải** và theo tuổi | 53 MiB là lúc im | **150 MiB / L1 / node** |
| Đĩa / tx / node trên subnet-evm | số trên là C-Chain + Postgres | **0,5 KB** |
| Băng thông gossip liên máy | hôm nay 9 node cùng máy, 0 byte ra Internet | đo ở pha 2 |
| Thời gian bootstrap một node vào 15 chain | rolling restart hôm nay là 9 node cùng máy | đo ở pha 1 |

### 2d. 🔴 RAM — đo thật ở pha 1 và 1b (`2026-09-07/08`, băng tập, D-242 · D-243)

Bảng §2b đo **chain im**. Dưới tải thì đại lượng đổi hẳn, và bảng dưới là số đo trên **15 L1 · V=5 · 1 tx/s mỗi chain**, 9 node
một máy. Đại lượng chấm là **`anon`** (cgroup `anon`, bằng đúng tổng `RssAnon`) — **không phải tổng RSS**: cả 9 plugin cùng ánh
xạ MỘT binary 65 MB, nên cộng RSS đếm chỗ đó chín lần (~390 MiB không có thật trên một node vừa khởi động).

| Đại lượng | Số | Điều kiện |
|---|---|---|
| RAM lên mỗi node | **296 MiB/giờ** ở tuổi tiến trình 1–3 h · **138–210** ở tuổi 8–9 h | 8,3 chain/node (15 × V5 ÷ 9) |
| Quy về giao dịch | **52,8 · 53,5 · 54,7 KiB/tx** toàn đội (3 cửa sổ, 2 phiên, lệch < 2 %) | ⇒ ~10,7 KiB/tx/node lúc trẻ, **4,7 lúc già** |
| Khi **KHÔNG có tải** | dốc **âm nhẹ**; tổng đội đứng yên qua 3 h 48 | RAM đi theo **giao dịch**, không theo đồng hồ |
| Một lượt **restart** trả lại | **87 %** (`anon`/node 1.939 → 242 MiB) | bộ nhớ gắn với **vòng đời tiến trình** |
| Mức đạt sau 6,3 h | **1.736 MiB/node** | pha 1, 8,3 chain/node |

🔴 **Tải này KHÔNG sinh trạng thái** — bơm gửi chuyển tiền cho chính mình (`pump_ledger.go:166`), mỗi tx chạm đúng một tài khoản.
Thứ lớn lên là **lịch sử**, không phải trạng thái. ⇒ mọi con số trên là **SÀN**; mạng thật cộng thêm phần trạng thái.

**`GOMEMLIMIT` KHÔNG phải câu trả lời — đã thử và đo (P-92):** trần 250 MiB trên `avalanchego` hạ dốc **296 → 179 MiB/node/giờ**
(**−40 %**), nhưng CPU 9 node đi **2,1 → 20,4 lõi** và loadavg **3,8 → 87,8** trên 24 cpu, vì heap **sống** vượt trần trong chưa
đầy 3 giờ (`heap_sys` 288 > trần 250, 46.946 lượt GC). **Dừng tải không cứu được**: 90 s sau khi tắt bơm vẫn 20,57 lõi với 0 giao
dịch. Heap sống lớn không có trần ⇒ **mọi** trần cố định rồi cũng bị vượt, và từ đó node đốt CPU thay vì đốt RAM.

**⇒ Kết luận cho §3 và cho đơn mua (P-94):**

1. **Cỡ máy KHÔNG phải chỗ nghẽn.** Suy sang pha 3 (**15 chain/node**, tức ×1,8 tải mỗi node): ~3,1 GB/node sau 6 h, **4 node/máy
   ⇒ ~12,5 GB** trên máy 64 GB. `AX42` **đủ, không cần đổi**. Mô hình §3 (`RAM/node ≈ 0,4 + 0,15·L` GB) khớp mức **lúc chain im**;
   dưới tải phải cộng thêm phần theo giao dịch ở bảng trên.
2. **Chỗ nghẽn là bộ nhớ KHÔNG BAO GIỜ TRẢ LẠI khi tiến trình còn sống.** Vận hành 9 tỷ chain trên nền này cần **lịch khởi động
   lại**, không cần máy to hơn — và cơ chế đã có sẵn từ P-83: rollout theo node, chỉ restart node cần restart, có chứng minh
   `StartedAt`. Khởi động lại mỗi ngày là **quá đủ** so với dốc đo được.
3. **Đừng đặt `GOMEMLIMIT` cố định** trên node mạng thật. Nếu vẫn muốn dùng, nó là **van an toàn** đặt CAO (trên mức đỉnh giữa hai
   lượt restart), không phải công cụ tiết kiệm RAM.
4. 🔴 **P-95 (cùng ngày) đã tìm ra CƠ CHẾ, nên trần không còn là ngoại suy.** Thứ giữ bộ nhớ là **bộ đệm block đã phân tích** của
   `vms/components/chain.State`, và nó **có trần đặt cho MỖI CHAIN**: `avalanchego` 64+64+64 = **192 MiB/chain**
   (`vms/rpcchainvm/vm_client.go:61-64`), plugin subnet-evm 10+5+5 = **20 MiB/chain**
   (`graft/subnet-evm/plugin/evm/vm.go:107-110`). Một `chain.State` cho **mỗi VMClient**, mỗi chain một VMClient, và plugin có
   `chain.State` riêng ⇒ **mỗi block được đệm hai lần**, phía `avalanchego` rộng gấp 10.

   ⇒ **Trần mỗi node = `số chain × 212 MiB` + phần nền.** Với 15 chain/node: **~3,1 GB** — trùng con số bảng trên ngoại suy từ
   đường cong 6 giờ, nay có cơ chế chứ không phải khớp đường. Thời gian đầy ở tải 1 tx/s: phía plugin **~1,1 h**, phía
   `avalanchego` **~24 h** (đo 8,0 MB/chain/giờ) — đó là lý do 9 giờ chạy không nhìn thấy trần nào.

   ⏳ **Nút bấm có thật nhưng nằm trong `patches/`** (luật cứng 3 — **không tự làm**): hạ ba hằng số phía `avalanchego` xuống mức
   của plugin kéo trần từ `chain × 212 MiB` xuống `chain × 40 MiB`, tức **3,1 GB → 0,6 GB** ở 15 chain. Cái giá chưa đo là tỉ lệ
   trúng bộ đệm khi block bị đuổi sớm hơn — **phép đo của pha 2**, không phải suy đoán. Bằng chứng đầy đủ:
   `docs/EVIDENCE-L1-108-PHASE1B-2026-09-08.md` §5.

### 2e. 🔴 DỤNG CỤ ĐO CÁI GIÁ ĐÓ ĐÃ SẴN SÀNG — `measure-block-cache.mjs` (D-253, `2026-09-08`)

David chốt `08/09`: **không đụng `patches/`, chỉ dựng phép đo.** Dụng cụ đã có, tự kiểm **16 ca**, chạy được
ngay khi có máy pha 2 — nó **không** sửa gì và **không** cần băng tập để tự kiểm.

```bash
node scripts/measure-block-cache.mjs --self-test                    # 16 ca, không cần mạng
node scripts/measure-block-cache.mjs --url http://127.0.0.1:9650/ext/metrics --seconds 300
node scripts/measure-block-cache.mjs --compose <compose> --service node-1 --seconds 300
```

Số đo lấy từ bốn bộ đệm `chain.State` khai ở `vms/components/chain/state.go:102` —
`decided_cache` · `unverified_cache` · `bytes_to_id_cache` · `missing_cache` — qua
`<cache>_get_count{result="hit"|"miss"}` và `<cache>_portion_filled`.

**Ba điều dụng cụ này TỪ CHỐI làm, và đó là phần đáng đọc:**

1. 🔴 **Nó lấy HAI mẫu, không phải một.** Bộ đếm là **luỹ kế từ lúc boot**, nên một lượt đọc trả lời câu
   *"tỉ lệ trúng kể từ khi node khởi động"* — con số đó bị **bootstrap** thống trị (hàng nghìn lượt lấy block
   tuần tự, trượt hết, và sẽ trượt hết ở **mọi** cỡ bộ đệm). Câu P-95 hỏi là câu về **trạng thái dừng**, tức
   **hiệu số** giữa hai lượt đọc. Cùng hình dạng sai với D-246: một con số đúng số học, trả lời câu khác.
2. 🔴 **Bộ đếm ĐI LÙI ⇒ từ chối, mã thoát 2.** Counter chỉ tăng; thấp hơn nghĩa là tiến trình **restart giữa hai
   mẫu**, và khoảng đó không còn mô tả một lượt chạy liền mạch. Nội suy qua đó cho ra một tỉ lệ tính từ **hai
   vòng đời khác nhau**, in ra với đúng vẻ tự tin như một tỉ lệ thật.
3. 🔴 **Tỉ lệ trúng của một bộ đệm CHƯA ĐẦY không phải bằng chứng về một bộ đệm NHỎ HƠN.** Chưa có gì bị đuổi thì
   thu nhỏ nó không đổi điều gì phép đo này thấy được. Nên `portion_filled` in **cạnh mọi tỉ lệ**, và chỉ dòng
   đánh dấu `✓` mới được dùng để lập luận. *Đọc một tỉ lệ trúng cao trên một bộ đệm rỗng rồi kết luận "bộ đệm
   đang làm việc tốt" là để phép đo tâng bốc quyết định, không phải để nó chống đỡ quyết định.*

**Cách dùng ở pha 2:** chạy trên băng tập ở **cỡ hiện tại**, ghi lại các dòng `✓`; rồi (nếu David quyết sinh lại
`patches/`) chạy lại ở cỡ plugin và so **đúng những dòng đó**. Chênh lệch tỉ lệ trúng trên các dòng có `✓` chính
là **cái giá**, và nó là con số duy nhất còn thiếu để quyết `3,1 GB → 0,6 GB`.

---

## 3. Mô hình tính — thay số là ra

Ký hiệu: `L` = số L1 một node track (≤ 15) · `r` = tx/s mỗi chain · `V` = validator mỗi chain · `N` = số
node validator · `D` = số ngày chạy.

```
Số node        N  ≥  108 × V / 15                       (tường 1)
CPU / node     ≈  0,1 + 0,05·L + c_tx·r·L    [luồng]      (tường 2; c_tx ước 0,02)
RAM / node     ≈  0,4 + 0,15·L                [GB]        (chưa tính lớn theo tuổi)
Đĩa / node     ≈  0,5 KB × r × 86.400 × L × D             (ước)
Gossip         ≈  mỗi block của mỗi chain tới V node ở máy khác — đo pha 2
```

**Bảng sức chịu của MỘT node track đủ 15 L1**, ba mức hoạt động mỗi chain:

| `r` mỗi chain | Ý nghĩa | CPU / node (luồng) | RAM / node | Đĩa / node / 30 ngày | Tổng tx/s cả 108 chain |
|---|---|---|---|---|---|
| 0,5 tx/s | 1 tx mỗi block | ~1,0 | ~2,7 GB | ~10 GB | 54 |
| 3 tx/s | "có người dùng" | **~1,8** | ~2,7 GB | **~58 GB** | 324 |
| 9 tx/s | như bơm C-Chain hôm nay | ~3,6 | ~3 GB+ | ~175 GB | 972 |

⇒ **Cỡ node hợp lý cho A: 4 vCPU · 8 GB · ≥ 160 GB NVMe**, chạy 15 L1 ở 3 tx/s với dư ~50 %. Ở 9 tx/s mỗi
chain thì 4 vCPU không còn dư và đĩa hết sau ~30 ngày: chọn 3 tx/s làm mức chuẩn, 9 tx/s cho một nhóm nhỏ
chain "nóng" để xem cái gì vỡ trước.

**Máy vật lý:** một máy 8 nhân/16 luồng · 64 GB (cỡ Hetzner AX52) chứa **4 node** kiểu trên (≈ 7 luồng, 11 GB,
230 GB) còn dư cho OS + Docker. Máy hôm nay (4 nhân) chứa **2**.

**Tầng RPC** (bắt buộc, thường bị quên): node chỉ trả RPC cho chain **nó track**. Hôm nay Caddy trỏ mọi
`/ext/bc/<id>/rpc` vào node-1/node-2 — ở 108 chain, hai node đó cũng đụng trần 16. ⇒ **8 node RPC không
stake**, mỗi node track 15 chain, và Caddy/router **tra bảng blockchainID → node**. Đó là mã, không phải
cấu hình.

**Máy sinh tải:** 108 chain × 3 tx/s = 324 tx/s tổng; bộ bơm hiện tại giữ 9 tx/s với 9 ví trên một tiến trình
Node. Ước 3 máy 4 vCPU, mỗi máy ~36 chain, mỗi chain 3–5 ví, nonce quản lý cục bộ (bẫy `a1-bay-lech-nonce`:
đồng bộ bằng `latest` là chết ví sau một cú nấc RPC).

---

## 4. 🔴 Phần mềm phải làm TRƯỚC khi mua máy — cái vỡ đầu tiên là console

1. **Chia validator (D-009 chưa làm).** Console hôm nay: `createChain` ghi `--track-subnets` cho **cả 9 node**
   và rolling-restart cả 9 (`server.mjs:661-670`, `TRAN_SUBNET_GIAO_THUC`). Cần: sổ **phân công**
   `chain → [V node]`, mỗi node có bộ đếm riêng ≤ 15, chọn node theo *ít chain nhất*, chỉ restart `V` node
   được giao, `AddSubnetValidatorTx` cho đúng `V` node. Đây là việc lớn nhất và là điều kiện của mọi pha sau
   pha 1.
2. **Router RPC** theo blockchainID (mục 3). Sổ chain công khai (`console-chains.json`) phải mang **node/URL
   phục vụ** cho từng chain; `check-chain-ledger` đo cả hai chiều như hôm nay.
3. **Sinh tải theo chain**: `load-test.mjs` hiện nhắm C-Chain; cần bản nhắm L1 theo danh sách, ví nạp từ
   `alloc` genesis (P-56 *"nhiều địa chỉ nhận genesis"* làm việc này rẻ: nạp sẵn ví bơm lúc sinh chain,
   không cần giao dịch phân phối), tự dừng theo hạn, xuất `heartbeat` **mỗi chain**.
4. **Cổng đo**: `measure-node-load.sh` chạy được **liên máy** (hôm nay giả định 9 container cùng host) ·
   một cổng *"mọi chain đang đẻ block ở nhịp mục tiêu"* · cảnh báo `StartClose`/peer drop = **0** là điều
   kiện qua cứng · RAM theo tuổi.
5. **Sinh mạng tập ở băng tập** với `N` node **trên nhiều máy** — netgen hôm nay sinh compose một máy
   (`SUBNET_PREFIX`, bẫy 1–6 trong `CLAUDE.md` §5); cần biến thể đa máy hoặc chạy netgen rồi tách compose.
6. **Tốc độ đẻ chain**: 108 × 170 s ≈ 5 h nối tiếp. Chấp nhận được cho thử nghiệm; song song hoá không
   đáng làm trước khi (1) xong.

Chưa cần cho thử nghiệm nhưng là câu hỏi thật của sản phẩm: **ACP-77** (`ConvertSubnetToL1Tx`) — mỗi L1 tập
validator riêng do **chủ chain** lo, A1 chỉ giữ mạng chính. Với thử nghiệm ta tự chạy mọi node nên bài toán
máy giống hệt phương án A/B; khác biệt là **ai trả tiền** node về sau (H-2).

---

## 5. Kế hoạch theo pha — mỗi pha có điều kiện qua và có ca đỏ

| Pha | Ở đâu | Làm gì | Đo gì | Điều kiện qua |
|---|---|---|---|---|
| **0 · đo `c_tx`** (1–2 ngày, **không đẻ chain**) | g1 công khai, một L1 đã có (ví dụ `Adam Chain`, ví admin `0x1e8c…` có 50 M token của chain) | bơm 1 → 3 → 9 tx/s, mỗi mức 30 phút, từ máy ngoài | `measure-node-load.sh --seconds 60` trước/giữa/sau, cùng tuổi node; `du` volume trước/sau | ra được `c_tx`, RAM/L1 dưới tải, KB/tx/node — thay vào mục 3 |
| **1 · một máy đầy** (3 ngày) | băng tập, 9 node, máy dev hoặc máy thuê 8 nhân | 15 L1, **mọi chain 3 tx/s**, chạy 24 h | như trên + RAM theo giờ | CPU host < 70 %, block mọi chain ≤ 2,5 s, 0 peer drop, RAM phẳng sau ~6 h |
| **2 · chia validator** (1 tuần, sau mục 4.1–4.2) | băng tập, **3 máy**, ~12 node, `V = 5` | 36 L1 | + băng thông liên máy, bootstrap node mới vào 15 chain, RPC qua router | mỗi chain đúng 5 validator, `check-chain-ledger` xanh với URL theo node, node chết một cái ⇒ chain vẫn đẻ block |
| **3 · 108** (2 tuần chạy + 1 tuần dựng) | băng tập, cụm phương án A | 108 L1, 96 chain ở 3 tx/s + 12 chain "nóng" 9 tx/s, 7 ngày liên tục | toàn bộ | 108/108 chain đẻ block ở nhịp, tx vào khối ≥ 90 % mục tiêu, 0 `StartClose`, đĩa còn ≥ 30 ngày theo ngoại suy, một máy rút điện ⇒ không chain nào dừng |

Ca đỏ bắt buộc thấy trước khi tin cổng: cố tình giao 16 chain cho một node ⇒ cổng phải đỏ **trước** khi
node bị peer cắt; tắt bơm một chain ⇒ cổng "mọi chain đẻ block" đỏ đúng chain đó.

Dự đoán thứ tự vỡ (để biết đang nhìn vào đâu): console track-all (ngày 1) → RPC 404 cho chain node-1 không
track → bão bootstrap khi rolling restart → CPU host → RAM theo tuổi → đĩa.

---

## 6. Chi phí, tách theo phương án A (ước, giá Hetzner công khai `09/2026`, chưa VAT)

| Thành phần | Số | Loại | ~€/tháng |
|---|---|---|---|
| Validator, 36 node | 9 máy AX52 (8C/16T · 64 GB · 2×1 TB NVMe), 4 node/máy | dedicated | 9 × ~€60 = **~€540** |
| *(hoặc)* 36 VM CPX31 (4 vCPU · 8 GB · 160 GB) | | cloud | 36 × ~€15 = ~€540 |
| RPC, 8 node không stake | 8 VM CPX31 | cloud | ~€120 |
| Sinh tải | 3 VM CPX31 | cloud | ~€45 |
| Băng thông, IP, dự phòng | | | ~€50–100 |
| **Tổng A** | | | **~€750–850 / tháng**, thử nghiệm 1 tháng |

Phương án B nhân đôi dòng đầu (~€1.100 validator) ⇒ ~€1.300–1.500. Phương án C: 4 máy AX52 ⇒ ~€350.
Máy đang thuê (OVH (model không công bố) + Hetzner `95.217.60.140`) tính vào cụm được **2 + ? node**; giữ chúng cho mạng
chính g1, đừng trộn băng tập vào máy sản xuất (bài học `net-public/` trộn bộ khoá, §5.10).

Chi phí trên chain: 108 lượt đẻ × 0,00023 = **0,025 LOVE9**, không đáng kể. Nếu chuyển ACP-77: 540 validator
× 0,0000864/ngày ≈ **0,047 LOVE9/ngày** ở giá sàn.

---

## 7. Điều cần David quyết

1. **`V`** — 5 (A) hay 9 (B)? Đề xuất **5** cho thử nghiệm.
2. **Mức hoạt động chuẩn** — 3 tx/s mỗi chain (đề xuất) hay khác? Nó quyết định cỡ đĩa và số máy sinh tải.
3. **Băng tập** — xác nhận chạy ở thế hệ tập, không ở g1; và có tách máy hẳn không (đề xuất: tách).
4. **Cho phép pha 0 trên g1** — cần ví admin của một L1 đã có (khoá của David) để bơm; A1 không giữ khoá đó.
5. **Thứ tự với mốc `L1-CUSTOM`** — mục 4.1 (chia validator) là mốc mới, lớn hơn P-56; P-56 lại làm rẻ
   việc nạp ví bơm. Đề xuất: P-55 → P-56 → *chia validator* → pha 1.

*Nguồn: D-009 · D-174 · D-178 · H-2 (`BLOCKERS.md`) · memory bơm tải `29/08` · số đọc trực tiếp từ máy chủ
và bề mặt công khai đêm `03/09`.*
