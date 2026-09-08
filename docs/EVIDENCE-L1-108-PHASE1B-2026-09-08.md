# Phase 1b of L1-108 — is the RAM growth a leak, or a warm-up to a ceiling?

Bằng chứng pha 1b (P-90 → P-94, mốc `L1-108`, D-243). Mọi số đo trên băng tập `899999998`
(`local-net/net-tap-g1`, 9 node trên máy dev, Docker Desktop), **không** đụng g1 công khai, server, `patches/` hay `web/`.

## 0. Câu hỏi

Pha 1 (P-89, D-242) đóng với 4/5 điều kiện qua. Điều kiện trượt: *"RAM phẳng sau ~6 h"* — đội 9 node đi từ 2.448 lên
15.621 MiB trong 6 giờ, và dốc **giảm dần nhưng chưa dừng**. Kết luận lúc đó ghi là *"RAM là bức tường pha 1 tìm thấy"*.

Nhưng đoạn đo ấy bắt đầu ngay sau lượt restart `21:18Z` — tức từ **tiến trình nguội**. Một đường cong đi lên rồi thoải
dần có hai lời giải hoàn toàn khác nhau:

| lời giải | dự đoán khi NGHỈ tải | dự đoán khi BƠM LẠI từ trạng thái ấm |
|---|---|---|
| **A. Hâm nóng tới mức bão hoà** — RAM là bộ đệm/trạng thái ổn định của N chain | phẳng | **phẳng** |
| **B. Tăng theo lượng giao dịch, chưa có trần** | phẳng | **leo tiếp** |

Cả hai đều dự đoán *phẳng khi nghỉ*, nên **phép đo nghỉ một mình không phân biệt được**. Đó là lý do pha 1b có P-92a: bơm
lại mà không đổi gì, trước khi thử bất cứ liều thuốc nào. Áp `GOMEMLIMIT` trước rồi thấy phẳng sẽ **ghi công cho sai
nguyên nhân** — đúng lớp lỗi §2 của `CLAUDE.md`.

## 1. Dụng cụ

Dùng **đúng** dụng cụ của pha 1, để số mới so được với số cũ (`p89-rss.sh`, chép sang scratchpad phiên này thành `rss.sh`).

| đo gì | lệnh |
|---|---|
| RSS theo tiến trình + cgroup, 10 phút/mẫu | `bash <scratchpad>/rss.sh <scratchpad>/ram.jsonl <giây>` |
| đọc chuỗi đo, dốc theo giờ | `node <scratchpad>/ram-report.mjs <scratchpad>/ram.jsonl [--since ISO] [--until ISO]` |
| `GOMEMLIMIT` trong từng tiến trình | `node scripts/check-plugin-memlimit.mjs --compose local-net/net-tap-g1/docker-compose.multinode.yml` |
| ngân sách RAM theo số chain đã track | `node scripts/check-node-memory.mjs --compose … --base 800 --per-chain 220 [--series … --max-slope …]` |
| mọi chain có đẻ block không | `node scripts/check-chains-producing.mjs --file <ledger> --rpc http://127.0.0.1:8545 --window 20 --target-rate 1` |
| sinh vỏ bọc plugin | `bash local-net/tools/k1/scripts/15-plugin-memlimit.sh --out <dir> --limit <giá trị>` |
| bơm | `docker start k1-drill-pump` (container của pha 1, giữ nguyên lệnh và khoá — không chép khoá ra tệp nào) |

🔴 **Một đại lượng, đo ở đúng chỗ.** `GOMEMLIMIT` đặt ở `environment:` của compose **không tới plugin**: avalanchego dựng
env của tiến trình plugin **từ rỗng** và chỉ chuyển tiếp `GRPC_*` với `GODEBUG`
(`vms/rpcchainvm/runtime/subprocess/runtime.go:76-82`). Tiến trình plugin mang **đúng một biến**,
`AVALANCHE_VM_RUNTIME_ENGINE_ADDR`. Vì vậy cổng đọc `/proc/<pid>/environ` **của từng tiến trình**, không đọc container.

## 2. P-90 — dốc khi KHÔNG có tải (`2026-09-08` 04:39Z–05:10Z, băng tập nghỉ bơm từ `01:39Z`)

4 mẫu × 9 node, 10 phút một mẫu. 15 L1 vẫn được track (75 tiến trình plugin: 3 node × 9 + 6 node × 8 = 15 × V5).

| giờ (UTC) | node | `avalanchego` | plugin (số) | cgroup | anon |
|---|---|---|---|---|---|
| 04:39:35 | 9 | 6.768 MiB | 9.502 (75) | 15.382 | 14.084 |
| 04:49:45 | 9 | 6.768 MiB | 9.503 (75) | 15.423 | 14.086 |
| 04:59:56 | 9 | 6.759 MiB | 9.452 (75) | 15.113 | 14.086 |
| 05:10:08 | 9 | 6.750 MiB | 9.405 (75) | 14.974 | 14.083 |

| dốc | NGHỈ (đo ở đây) | CÓ TẢI (pha 1, `22:19Z→01:22Z`) |
|---|---|---|
| `avalanchego` | **−3,9 MiB/node/giờ** | +123 MiB/node/giờ |
| plugin | **−2,5 MiB/plugin/giờ** | +15,6 MiB/plugin/giờ |
| cgroup | **−89 MiB/node/giờ** | — |

Mỏ neo xuyên phiên: tổng `avalanchego + plugin` là **16.253 MiB lúc 01:22Z** (mẫu cuối pha 1) và **16.155 MiB lúc 05:10Z** —
đứng yên qua **3 h 48** nghỉ tải.

⇒ **Dốc RAM đi theo GIAO DỊCH, không theo đồng hồ.** Không có rò rỉ theo thời gian.
⚠️ Và một mình phép đo này **không** phân biệt được hai lời giải ở §0: cả A lẫn B đều dự đoán phẳng khi nghỉ. Đó là việc của P-92a.

### 2b. Ca đỏ — và nó tìm ra lỗ trong DỤNG CỤ, không phải trong node

Điều kiện qua đòi *"trỏ chuỗi đo vào một container đã dừng ⇒ ra `null`/INVALID, không ra 0"*. Đo hai chế độ hỏng, cả hai đều thật:

| chế độ hỏng | chuyện gì xảy ra | ai bắt |
|---|---|---|
| container **không còn tồn tại** | `docker inspect` hỏng ⇒ `continue` ⇒ **không sinh dòng nào**; mẫu chỉ có 8 node, tổng tụt | **không ai** — cho tới lượt vá này |
| container không có `bash` | `rss` rỗng ⇒ `set -- $rss $cg` **trượt trường**, số cgroup rơi vào ô RSS, số plugin thành 111 | `plugins > 100` ⇒ INVALID |

Chế độ thứ nhất nguy hơn vì nó **không để lại dấu**: bỏ node-3 khỏi mẫu cuối trên dữ liệu thật, bản chưa vá cho dốc
**−4.382 MiB/node/giờ** — một con số bịa hoàn toàn và có dấu đúng chiều người đọc đang mong. Bản đã vá **loại mẫu đó và nêu tên
nó**: *"1 sample(s) covered fewer than 9 node(s)"*. Bài học cùng lớp với §2 `CLAUDE.md`: một phép đo thiếu mẫu không kêu, nó chỉ
trả lời sai.

### 2c. Đọc lại số pha 1 theo GIAO DỊCH thay vì theo giờ

Nếu dốc đi theo giao dịch (§2), thì *"MiB mỗi giờ"* là đơn vị sai — nó chỉ đúng với đúng một mức tải. Tính lại từ **chuỗi thô**
của pha 1 (`p89-rss.jsonl`, chỉ mẫu đủ 9 node, dùng cgroup `anon`) ghép với số tx của bảng theo giờ:

| cửa sổ | tx thêm | anon thêm | **KiB / tx (cả đội)** | KiB / tx / node validate |
|---|---|---|---|---|
| 22:15→23:24 | 61.875 | 3.231 MiB | **53,5** | 10,7 |
| 23:24→00:26 | 55.650 | 2.974 MiB | **54,7** | 10,9 |
| 00:26→01:28 | 55.725 | 1.962 MiB | **36,1** | 7,2 |

Mỗi tx đi vào **5 node** (V = 5), nên cột cuối là chi phí thật trên một node.

🔴 **Vì sao con số này quan trọng hơn "MiB/giờ":** nó đổi câu hỏi mua máy từ *"node sống được bao lâu"* sang *"node nuốt được bao
nhiêu giao dịch"*. Lấy thẳng: ngân sách 4 GB/node ÷ 10 KiB/tx ≈ **400.000 tx** trước khi đầy. Ở 15 chain × 1 tx/s (mỗi node
15 tx/s) đó là **~7,4 giờ** — khớp đúng thứ pha 1 đã thấy. Nếu quan hệ này thật sự tuyến tính và không có trần thì **không cỡ máy
nào cứu được**, chỉ có khởi động lại theo lịch; nếu nó thoải dần (cửa sổ cuối đã tụt 54,7 → 36,1) thì có trần và trần đó là số
P-94 cần. §3 là phép đo phân biệt hai khả năng đó.

## 3. P-92a — đối chứng: bơm lại mà KHÔNG đổi gì

Bơm khởi động lại `05:10:28Z` bằng **đúng container của pha 1** (`docker start k1-drill-pump`, cùng lệnh, cùng khoá — không chép
khoá ra tệp nào). Không restart node, không cờ mới, không đổi cache. Tải xác nhận là thật lúc `05:1xZ`:
`check-chains-producing --window 30 --target-rate 1` ⇒ **15/15 chain**, 1,07 tx/s, gap tối đa **2 s**.

### 3a. Kết quả — 16,2 GB KHÔNG phải trần

| giờ (UTC) | node | `avalanchego` | plugin (số) | cgroup | anon |
|---|---|---|---|---|---|
| 05:20:18 | 9 | 6.768 MiB | 10.554 (75) | 15.818 | 14.982 |
| 05:30:29 | 9 | 6.844 MiB | 10.729 (75) | 16.125 | 15.227 |
| 05:40:40 | 9 | 7.038 MiB | 11.688 (75) | 17.700 | 16.362 |
| 05:50:50 | 9 | 7.202 MiB | 11.557 (75) | 17.903 | 16.400 |

| dốc | NGHỈ (§2) | **ĐỐI CHỨNG (ấm, không đổi gì)** | pha 1 (nguội, có tải) |
|---|---|---|---|
| `avalanchego` | −3,9 MiB/node/giờ | **+94,8** | +123 |
| plugin | −2,5 MiB/plugin/giờ | **+26,3** | +15,6 |
| `anon` toàn đội | ≈ 0 | **+2,8 GB/giờ** | +2,0…+2,7 GB/giờ |

⇒ **Lời giải B ở §0 đúng: dốc đi theo giao dịch, và 16,2 GB không phải mức bão hoà.** Phẳng khi nghỉ chỉ có nghĩa là *"không có
giao dịch"*. Nếu áp `GOMEMLIMIT` trước rồi thấy phẳng, ta đã ghi công cho sai nguyên nhân — đây là lý do P-92a tồn tại.

**Và con số quy về giao dịch tái lập được:** 27.480 tx trong cửa sổ này, `anon` +1.418 MiB ⇒ **52,8 KiB/tx toàn đội · 10,6 KiB
mỗi node validate**. Pha 1 cho **53,5** và **54,7** ở hai cửa sổ đầu. Ba phép đo, hai phiên, một bên nguội một bên ấm, cách nhau
3,6 giờ nghỉ — lệch dưới 2 %. Cửa sổ **36,1** của pha 1 nay trông như ngoại lệ, không phải xu hướng, nên **hy vọng "sắp thoải ra"
chưa có gì đỡ**.

### 3b. 🔴 Không phải trạng thái chain lớn lên — tải này không sinh trạng thái

Bơm gửi **chuyển tiền cho chính mình**: `types.LegacyTx{… Gas: 21000, To: &from, Value: 1}`
(`local-net/tools/k1/l1-batch/pump_ledger.go:166`). Mỗi giao dịch chạm **đúng một tài khoản** và **không tạo tài khoản mới** ⇒
trie trạng thái của mỗi chain gần như đứng yên; thứ lớn lên là **lịch sử** (block, receipt, sổ sách đồng thuận), không phải trạng
thái.

Cộng với một quan sát của §2: trong 3,6 giờ nghỉ, `anon` **không nhả một MiB nào** (14.084 → 14.083). Go ép một lượt thu gom mỗi
2 phút, nên thứ này **đang được tham chiếu**, không phải rác chờ dọn.

⇒ Hai điều theo sau, và chúng đổi hình dạng câu hỏi:

1. **10,6 KiB/tx/node là SÀN, không phải trần.** Một mạng thật còn cộng thêm phần trạng thái mà tải này cố tình không sinh ra.
2. **Nếu bộ nhớ đó thật sự sống thì `GOMEMLIMIT` sẽ KHÔNG hạ được nó** — nó chỉ làm GC quay liên tục rồi tiến trình chết. Chính vì
   vậy P-92 là phép đo có ích **theo cả hai chiều**: trần giữ được ⇒ đó là bộ đệm thu hồi được; trần không giữ được ⇒ phải chặn ở
   chỗ khác (giới hạn cache theo BYTE, cắt lịch sử, hoặc khởi động lại theo lịch), và biết điều đó **trước khi mua máy** rẻ hơn
   nhiều so với biết sau.

### 3c. 🔴 Bộ nhớ đó nằm ở đâu — và vì sao `GOMEMLIMIT` chỉ với tới được một góc

`/ext/metrics` của node phát **số liệu Go runtime của TỪNG tiến trình**: chuỗi không nhãn là `avalanchego`, chuỗi có nhãn
`chain="…"` là từng plugin. Đó là dụng cụ mạnh hơn `/proc/<pid>/environ` — nó đọc giá trị runtime **thật sự áp**, kể cả
`gomemlimit_bytes` (đang là `math.MaxInt64`, tức chưa đặt, đúng như cổng P-91 khai).

Với `GOGC = 100`, `next_gc ≈ 2 × heap sống`, nên `next_gc` là proxy rẻ nhất cho *"bao nhiêu bộ nhớ còn đang được tham chiếu"*.
Đo trên cùng cửa sổ đối chứng (heap 06:03→06:18, RSS 05:20→06:21):

🔴 **Bản đầu của mục này dùng SAI đại lượng, và lỗi ấy đáng ghi hơn con số nó tạo ra.** Tôi so **tổng RSS các tiến trình** với
`heap_sys` rồi kết luận *"56 % phần phình nằm ngoài heap Go"*. Sai hai lần: RSS đếm **trang tệp**, và **cả 9 plugin cùng ánh xạ
MỘT binary 65 MB**, nên tổng RSS cộng chỗ đó **chín lần** — trên node mới toanh đó là ~390 MiB bộ nhớ **không có thật**. Đo thẳng
`2026-09-08`: `RssAnon` của `avalanchego` 79 MiB + `RssFile` 67; mỗi plugin 18 + 36. Và **cgroup `anon` = 253 MiB = đúng tổng
`RssAnon` = 253**, trong khi cgroup `file` = **0**. ⇒ đại lượng đúng cho mỗi node là **`anon`**, không phải tổng RSS.

Đo lại bằng `anon`, **cùng cửa sổ, cùng node** (06:03 → 06:41):

| đại lượng, **mỗi node mỗi giờ** | mức |
|---|---|
| cgroup `anon` | **+138 MiB** |
| Go `heap_sys` (Go xin của HĐH) | +106 MiB |
| **heap SỐNG** (`next_gc` / 2) | **+79 MiB** |
| ngoài bộ cấp phát Go | +31 MiB |
| ⇒ rác thu hồi được **trong** heap Go | **+27 MiB** |

Và trên **node mới khởi động**: `anon` 253 MiB · Go `heap_sys` 243 ⇒ heap Go là **96 %** bộ nhớ ẩn danh. Nói cách khác **bộ nhớ
NẰM trong heap Go** — lý do trần không cứu được không phải *"nó ở ngoài tầm"* mà là **nó đang SỐNG**.

⇒ Kết luận thật, và nó sắc hơn bản sai: **heap sống lên ~79 MiB/node/giờ**. Có thứ gì đó trong `avalanchego`/subnet-evm **giữ lại**
chừng ấy bộ nhớ mỗi giờ ở mức tải này, và **không GC nào, không trần nào giải phóng được thứ đang được tham chiếu**. Phần trần Go
với tới chỉ là 27 trên 138 MiB/node/giờ, **20 %**.

**Dự đoán định lượng cho P-92, bác bỏ được:** so ở **cùng tuổi tiến trình** với cơ sở pha 1 (`anon` **+296 MiB/node/giờ**, §4a),
lượt áp trần được phép hạ tối đa 20 % ⇒ **≥ ~237 MiB/node/giờ**. Rơi sâu hơn nhiều (dưới ~200) thì mô hình này sai và phải viết
lại lần nữa.

Đo bằng: `node scripts/measure-memory-split.mjs --compose <compose> --seconds 900` (dụng cụ này sinh ra từ đúng lượt sai ở trên,
nên nó tách sẵn `avalanchego` với plugin và không bao giờ cộng RSS thay cho `anon`).

## 4. P-92 — áp `GOMEMLIMIT` lên CẢ HAI nửa

### 4a. 🔴 Cơ sở so sánh, chốt TRƯỚC khi chạy

`GOMEMLIMIT` chỉ đọc được lúc tiến trình khởi động, nên lượt áp thuốc **bắt buộc phải restart**. Điều đó tạo một cái bẫy: dốc RAM
**giảm dần theo tuổi tiến trình**, nên một lượt chạy vừa restart luôn có dốc **cao hơn** một băng đã chạy 7 giờ. So dốc "sau khi
áp" (tiến trình 1 giờ tuổi) với dốc đối chứng **135 MiB/node/giờ** (tiến trình 7 giờ tuổi) là **so lệch tuổi** — và nó sẽ che mất
mọi tác dụng của trần.

⇒ So với **cùng tuổi**: pha 1 có sẵn một đoạn sau restart (`21:18Z` restart → mẫu `22:19Z→01:22Z`, tức tuổi 1 h → 4 h), **cùng
cache nhỏ, KHÔNG có `GOMEMLIMIT`**:

Tính lại từ **chuỗi thô** của pha 1 trên đúng khoảng tuổi sẽ dùng cho lượt áp thuốc (restart `21:18Z`; mẫu `22:29Z → 00:21Z`,
tức tuổi **1,2 h → 3,05 h**, 1,87 h — chọn 1–3 h vì chuỗi đo phiên này dừng `10:39Z`):

| cơ sở (pha 1, cùng tuổi, cache nhỏ, **không** trần) | mức |
|---|---|
| cgroup | **+308 MiB/node/giờ** |
| anon | +296 MiB/node/giờ |
| `avalanchego` RSS | +112 MiB/node/giờ |
| plugin RSS | +17,1 MiB/plugin/giờ |

**Điều kiện phán quyết, viết ra trước:** lượt áp thuốc đo ở **cùng tuổi 1–3 h sau restart**.
- Dốc cgroup rơi xuống quanh **~262 MiB/node/giờ** (giảm ~15 %) ⇒ mô hình §3c **đúng**: trần chỉ với tới phần rác trong heap Go.
- Dốc rơi **sâu hơn nhiều** (vd < 220) ⇒ mô hình **sai**, phải viết lại §3c.
- Dốc **không đổi** (~308) ⇒ trần không có tác dụng nào đo được, và câu trả lời nằm hoàn toàn ngoài heap Go.

### 4b. Ngưỡng — và vì sao lượt đầu phải làm lại

Lượt đầu đặt `avalanchego` **450 MiB** · plugin **80 MiB**, chọn theo `heap_sys` **trước** restart (743 và ~102/plugin). Áp xong
mới lộ ra rằng đó là sai đại lượng: **restart trả lại gần hết bộ nhớ**, node-1 từ `heap_sys` 743 xuống **76 MiB**. Từ 76 MiB leo
~88 MiB/giờ thì trần 450 phải hơn **4 giờ** mới chạm — tức **ngoài cửa sổ đo tuổi 1–3 h**. Thí nghiệm sẽ cho *"không khác gì"* vì
trần **chưa từng chặn**, không phải vì trần vô dụng. Đặt lại: **`avalanchego` 250 MiB**.

| tiến trình | `heap_sys` ngay sau restart | trần | chạm trần sau | trần / heap sống lúc đó |
|---|---|---|---|---|
| `avalanchego` | 76 MiB (node-1) | **250 MiB** | ~1,8 h | ~2,0 × |
| mỗi plugin | 18 MiB | **80 MiB** | ~44 h — **cố ý không chạm** | — |

🔴 **Trần của plugin CỐ Ý không chặn, và đó là một phép đo chứ không phải sự lười.** Heap Go của plugin lên **1,2 MiB/giờ** trong
khi RSS của nó lên **15–17 MiB/giờ**: ép trần plugin chặn được thì phải hạ xuống sát heap sống (~6 MiB), vừa nguy hiểm vừa **không
kiểm thêm điều gì** — vì con số trên đã nói phần phình của plugin **không nằm trong heap Go**. Nửa `avalanchego` là nửa duy nhất
mà một trần Go còn có chỗ để chặn, nên nó là nửa được đem ra thử.

### 4c. Số đo

(điền khi cửa sổ tuổi 1–3 h khép)
