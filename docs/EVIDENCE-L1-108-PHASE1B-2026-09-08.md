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

## 3. P-92a — đối chứng: bơm lại mà KHÔNG đổi gì

Bơm khởi động lại `05:10:28Z` bằng **đúng container của pha 1** (`docker start k1-drill-pump`, cùng lệnh, cùng khoá — không chép
khoá ra tệp nào). Không restart node, không cờ mới, không đổi cache. Tải xác nhận là thật lúc `05:1xZ`:
`check-chains-producing --window 30 --target-rate 1` ⇒ **15/15 chain**, 1,07 tx/s, gap tối đa **2 s**.

(số đo điền khi cửa sổ khép)
