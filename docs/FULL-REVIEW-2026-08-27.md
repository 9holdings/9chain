# SOÁT TOÀN DIỆN QUY TRÌNH TESTNET A1 — `2026-08-27`

> David hỏi: *"còn làm những gì để hoàn thiện toàn bộ quy trình testnet A1 — cấu hình chuẩn,
> tối ưu, bảo mật"*. Bản này **đo**, không đọc lại tài liệu cũ rồi chép ra. Mọi con số dưới đây
> lấy từ máy chủ công khai `139.99.145.13` và RPC `rpc-a1.9chain.org` lúc `2026-08-27 ~11:40Z`.
>
> Bản soát trước: `CORE-AUDIT-2026-08-27.md` (lớp xương) · `BRAND-AUDIT-2026-08-27.md` (lớp da).
> Bản này soát **lớp vận hành** — thứ chưa đợt nào soát.

---

## 0. Kết luận một dòng

**Lớp giao thức và lớp bảo mật biên đã tốt hơn mức mong đợi. Lớp GIỮ CHO NÓ SỐNG thì gần như
chưa tồn tại.** A1 có ~20 bộ kiểm chất lượng cao mà **không cái nào tự chạy**, có 9 validator
mà **không cái nào tự dậy sau khi máy chủ khởi động lại**, và có một explorer tốn **gấp 2,2 lần
cả blockchain** để index một chuỗi **4 block**.

🔴 Và một câu phải nói thẳng trước ngày G: **tuyên bố "9 node" hôm nay là thứ bất kỳ ai cũng
bác được bằng MỘT lệnh curl.**

---

## 1. 🔴 P0-1 — 9 VALIDATOR KHÔNG TỰ DẬY, EXPLORER THÌ CÓ

**Đo được, không suy:**

```
docker inspect $(docker ps -q) --format "{{.HostConfig.RestartPolicy.Name}} {{.Name}}"

always          backend, db, frontend, stats, stats-db, user-ops-indexer, sig-provider, visualizer
unless-stopped  9chain-a1-caddy, 9chain-a1-web, 9chain-a1-faucet, 9chain-a1-chains,
                9chain-a1-xpwallet, 9scan-a1-index, 9scan-a1-web
no              9chain-a1-node-1 … 9chain-a1-node-9      ← 🔴 CẢ CHÍN
```

```
systemctl list-unit-files | grep -iE "9chain|avalanche"   →  KHÔNG CÓ unit nào
```

**Nghĩa là gì:** máy chủ khởi động lại (OVH bảo trì, kernel panic, mất điện) ⇒ Caddy dậy, trang
web dậy, faucet dậy, **Blockscout dậy** — và **9 validator nằm im**.

🔴 **Đây là dạng hỏng tệ nhất có thể có: mọi thứ TRÔNG như đang chạy.** Trang chủ 200, explorer
mở được, faucet trả `{"ok":true}` — chỉ RPC chết. Người vào thấy một testnet "đang sống" mà
chuỗi không tồn tại. Cùng họ với *"đường lui alias = xanh giả"* và *"phép kiểm đo sai đại
lượng"* đã ghi trong HANDOFF, chỉ khác là lần này nó ở tầng hạ tầng.

⚠️ **Đừng trích mạnh hơn phép đo:** máy đang `up 3 days`, chưa reboot lần nào kể từ re-genesis.
Đây là **cửa đang mở**, không phải vết thương đang chảy. Nhưng nó là cửa mà A1 **không hề biết
là mình đã để mở** — và chi phí đóng nó là một dòng lệnh.

**Gốc:** `netgen/main.go:414-445` sinh `docker-compose.multinode.yml` mà **không bao giờ ghi
khoá `restart:`** ⇒ Docker mặc định `no`. Không phải ai đó chọn `no`; **không ai chọn gì cả**.

| Vá | Cách | Đụng patch series? |
|---|---|---|
| **Ngay, không downtime** | `docker update --restart=unless-stopped 9chain-a1-node-{1..9}` | không |
| **Vĩnh viễn (ngày G)** | netgen ghi `restart: unless-stopped` cho mọi node | 🔴 **CÓ** — đổi tree hash, phải sinh lại cả bộ patch |

⚠️ Chọn `unless-stopped` chứ không `always`: nó khớp quy ước Caddy/faucet đang dùng, và nó
**không cãi lại** cơ chế rolling-restart của M2 (`docker stop` tường minh vẫn giữ nguyên trạng
thái dừng).

### ✅ ĐÃ ÁP `2026-08-27` — David duyệt trong phiên

`9/9` đổi từ `no` → `unless-stopped`. Container **không bị restart** (`Up 20 hours` giữ nguyên
sau lệnh). Docker daemon đã `enabled` lúc boot (`systemctl is-enabled docker` → `enabled`), nên
bản vá có đường tác dụng thật.

#### 🔴 Phép kiểm ĐẦU TIÊN của tôi ĐO SAI ĐẠI LƯỢNG — ghi lại vì nó tốn một node

`docker kill 9chain-a1-node-9` ⇒ node **không dậy lại**, `numPeers` tụt 8 → 7. Suýt kết luận
*"bản vá không ăn"*.

**Sai ở phép kiểm, không ở bản vá.** `docker stop` **và** `docker kill` đều là *người dùng chủ
động dừng*, và `unless-stopped` **cố ý không** dậy lại sau đó — đó chính là điều phân biệt nó
với `always`. Phép kiểm đó đo một trường hợp mà chính sách **được thiết kế để loại trừ**.
*(Đã `docker start` lại ngay; chờ tới khi `numPeers` = 8 mới đi tiếp.)*

⚠️ **Bài học vận hành, không phải bài học Docker:** muốn dừng hẳn một node thì `docker stop` —
`unless-stopped` sẽ tôn trọng. Muốn thử chính sách thì phải để tiến trình **tự chết**.

#### Phép kiểm ĐÚNG — hai ca, kèm đối chứng ngược

Chạy trên container nháp, **không đụng validator nào**:

| Ca | Lệnh | Kết quả |
|---|---|---|
| **A** | `--restart=unless-stopped`, tiến trình `exit 1` tự chết | **1 → 3 lần restart · `running`** ✓ |
| **B** 🔴 đối chứng ngược | `--restart=no`, cùng tiến trình đó | **0 lần restart · `exited`** ✓ |

Ca B đắt hơn ca A: nó **tái hiện đúng trạng thái 9 validator trước bản vá** và cho thấy chúng
nằm im. Phép đo phân biệt được hai trạng thái, không chỉ biết in ✓.

#### ⚠️ Nửa "reboot máy chủ" thì CHƯA chứng minh được trên máy này

Định đối chiếu giờ boot với giờ container khởi động, nhưng:

```
boot của máy    2026-08-24 11:23:57
container       2026-08-26 15:05 (Blockscout) · 2026-08-26 16:17-16:20 (9 node)
```

**Mọi container đều dựng ngày 26/08, sau re-genesis** — không lượt nào đi qua một lần boot, nên
lịch sử máy **không làm chứng được**. Vế đó vẫn đứng ở mức *"hành vi Docker đã biết + daemon
`enabled`"*, và phép kiểm kết luận duy nhất là **reboot thật** — không làm trên mạng công khai
đang phục vụ người ngoài.

---

## 2. 🔴 P0-2 — KHÔNG CÓ GIÁM SÁT, CẢNH BÁO, HAY BACKUP TỰ ĐỘNG CHO A1

```
crontab -l   →   17 3 * * *  /home/ubuntu/9chain-a1/9scan-a1/backup-index.sh
                 (chú thích trong chính dòng đó: "9index backup — 9Scan-A1")
```

**Cron duy nhất trên máy chủ thuộc về explorer của người khác.** A1 không có:

| | Trạng thái | Hệ quả khi hỏng |
|---|---|---|
| Backup repo/khoá tự động | ❌ — H-6b chạy **tay**, đúng 2 lần (`25/08`, `27/08`) | bản sao cũ dần, không ai biết cũ bao nhiêu |
| Giám sát 9 node còn sống | ❌ | node rụng ⇒ biết khi có người tình cờ mở trang |
| Cảnh báo hạn validator | ❌ (B-12) | xem §4 |
| Giám sát số dư chain-factory | ❌ | đẻ chain chết câm khi hết tiền |
| Giám sát đĩa/RAM | ❌ | 9% đĩa hôm nay, nhưng Blockscout đang lớn dần |

`git ls-files | grep -iE "monitor|alert|cron|watch|uptime"` → **0 tệp**.

🔴 **Cái đắt không phải "chưa có công cụ" — mà là mọi cổng A1 đã dựng đều CHỜ NGƯỜI NHỚ.**
Repo có `check-consistency` · `check-chainid` · `check-ports.sh` · `smoke-l1` · `warp-test` ·
`bridge-test` · `chainid-test` · `siwe-test` · `auth-e2e-test` · `preset-test` · `load-test` ·
`block-adam-drill` · `engrave-verify` · `rebase-drill.sh` — **và không có CI** (`.github/workflows`
không tồn tại). Đó là hệ quả dây chuyền của **H-6: repo chưa có remote nào** ⇒ không có chỗ
chạy CI ⇒ chất lượng của 20 bộ kiểm phụ thuộc vào trí nhớ.

---

## 3. 🔴 P0-3 — O1 CUSTODY KHOÁ 5 QUỸ (chưa đổi, nhắc lại vì hạn là NGÀY MAI)

`local-net/net-public/keys.txt` trên **một ổ đĩa của máy dev**. Backup H-6b **cố ý không chứa
nó**. Bản thứ hai *"David tự cất"* — **chưa ai xác nhận là có**.

Mất máy dev = mất khoá cả 5 quỹ, **không có đường khôi phục**. Sinh lại mạng ngày G là **cơ hội
một lần** để đổi sơ đồ; sau đó lại kẹt y cũ trong một năm.

---

## 4. 🔴 P1-1 — "9 NODE" LÀ THỨ BẤT KỲ AI CŨNG BÁC ĐƯỢC BẰNG MỘT LỆNH curl

```
curl -s -X POST -d '{"jsonrpc":"2.0","id":1,"method":"info.peers","params":{}}' \
     https://rpc-a1.9chain.org/ext/info

→ "numPeers":"8", và MỌI peer có  "publicIP":"172.28.0.19:9651"  …  172.28.0.x
```

`172.28.0.0/16` là **dải bridge nội bộ của Docker**. Ai đọc phản hồi này cũng thấy ngay: 9 node
là **9 container trên một host**. Không cần suy đoán, không cần truy IP — nó nằm trong API công
khai.

⚠️ **Đây KHÔNG phải lỗ hổng bảo mật** — `info.peers` là API tiêu chuẩn của avalanchego và không
lộ gì bí mật. Nó là **rủi ro về lời tuyên bố**: memory dự án đã ghi *"A1 thiếu độ bền, không
thiếu tính năng"*, và đây là bằng chứng công khai cho điều đó.

**Ba đường, không loại trừ nhau:**
1. **O4 — dời một node sang nhà cung cấp thứ hai** (D-046 đã đổi O4 từ "thêm node thứ 10" thành
   "dời 1 trong 9"). Đây là đường duy nhất làm cho lời tuyên bố **đúng**.
2. **Khai thật trên trang** — *"9 validator, hiện chạy trên một hạ tầng; phi tập trung hoá là
   mốc M3"*. Rẻ, và nó biến một điểm yếu bị phát hiện thành một điểm trung thực được ghi nhận.
3. Không làm gì ⇒ chấp nhận việc người đầu tiên soi kỹ sẽ tìm ra và công bố hộ.

🔴 **Nếu O4 không đạt thì `01/09` không nên gọi là "chạy chính thức"** — đó là đánh giá đã có
trong `NGAY-G-A1-CON-LAI` §7 và phép đo này **củng cố** nó, không lật nó.

---

## 5. 🔴 P1-2 — CỘNG ĐỒNG KHÔNG THỂ CHẠY NODE (M3 chưa đóng)

Quét cổng từ ngoài Internet vào `139.99.145.13`:

```
22   MỞ      80   MỞ      443  MỞ
9651 đóng   9652-9659 đóng    (P2P staking)
```

Không cổng P2P nào mở ⇒ **không ai bên ngoài tham gia được**, kể cả khi họ muốn. Và:

| | |
|---|---|
| **H-7** IPv4 đa cổng hay IPv6 | 🔴 chờ David — **chọn tập người dùng**, không phải chọn kỹ thuật |
| **H-4** AAAA record `bootstrap-a1` | chờ, phụ thuộc H-7 |
| **M3.4** `docs/RUN-A-NODE.md` + compose mẫu | ❌ chưa viết |
| **M3.5** kiểm chứng từ VPS ngoài | ❌ chưa chạy |

⇒ Mục tiêu *"cộng đồng tự chạy node"* hôm nay ở mức **0%**, và nó không nằm trong đường găng
ngày G — nhưng nó là thứ phân biệt "testnet" với "demo nhiều node".

---

## 6. 🔴 P1-3 — B-12: LỊCH GIA HẠN VALIDATOR — NAY CÓ SỐ THẬT

Đo `platform.getCurrentValidators` trên mạng công khai:

| Node | Hết hạn | Còn | Uptime |
|---|---|--:|--:|
| `3gB1CPu5ymtwS6f…` | **2027-07-01** | 308 ngày | 99,9855% |
| `D6VXvdfB3gaGPp4…` | 2027-07-08 | 315 | 99,9908% |
| `2wF33ZubCiSi7jp…` | 2027-07-15 | 322 | 99,9895% |
| `FKE8aTFXVkMUQwh…` | 2027-07-22 | 329 | 99,9869% |
| `Mw3p9USZhtigSft…` | 2027-07-29 | 336 | 99,9908% |
| `KQHHsKDDoLT1BEu…` | 2027-08-05 | 343 | 99,9869% |
| `7Beuy95qnN15D14…` | 2027-08-12 | 350 | 99,9895% |
| `KXfRHgP4TrFTCxv…` | 2027-08-19 | 357 | 99,9842% |
| `Jg64MCeZu6taUh1…` | **2027-08-26** | 364 | 100% |

**9/9 connected · so le đúng 7 ngày · cửa sổ rụng 56 ngày · MẠNG DỪNG `2027-08-26`.**

✅ Sơ đồ so le hoạt động **đúng như thiết kế** — node đầu rụng sớm hơn node cuối 56 ngày, tức có
56 ngày để phản ứng. **Đừng dọn `InitialStakeDurationOffset` về 0.**

🔴 **`HANDOFF.md` mục "⏰ Hẹn giờ đã biết" ghi `2027-08-24` cho 5 validator — SAI hai lần**: sai
số node (5, của mạng trước re-genesis) và sai ngày. Con số đúng phải đo, không tính tay.

⚠️ Và các mốc trên là của **mạng diễn tập**. Ngày G sinh lại ⇒ dịch thêm ~6 ngày. **Phải đo lại
NGAY SAU ngày G, lúc số còn tươi.**

---

## 7. ✅ BẢO MẬT BIÊN — ĐO XONG, TỐT HƠN MONG ĐỢI

Không phải lời khen suông; đây là danh sách đã thử phá:

| Phép thử | Kết quả |
|---|---|
| Quét 35 cổng từ Internet | **chỉ 22 · 80 · 443 mở**. 7432/7433 (Postgres, B-5) **vẫn đóng** ✓ |
| SSH mật khẩu | **`Permission denied (publickey)`** — chỉ nhận khoá ✓ |
| `/ext/admin` · `/ext/keystore` · `/ext/metrics` | **404** ✓ |
| `personal_*` · `admin_*` · `debug_trace*` · `txpool_*` · `eth_accounts` · `miner_start` | **`does not exist/is not available`** — 6/6 tắt ✓ |
| Khoá **ewoq** công khai còn tiền không | `eth_getBalance` = **`0x0`** ✓ *(genesis cũ đã gỡ thật, không chỉ gỡ trên giấy)* |
| Console `/console/api/chains` không token | **từ chối**, kèm câu hướng dẫn đúng ✓ |
| Xoay log | `json-file` **50 MB × 5** mỗi container ✓ (tổng `/var/lib/docker/containers` = 432 MB) |
| Console: ai làm chủ chain đẻ ra | `admin` bị **ép** bằng địa chỉ đã ký SIWE; thu hồi kiểm chủ sở hữu ✓ |
| Hạn mức | flood 60/giờ · create 3/giờ/ví · revoke 3/giờ/ví · nonce 30/10ph · read 120/ph ✓ |
| Cạn ví chain-factory | **0,000141468 LOVE9/lượt ⇒ 9 LOVE9 ≈ 63.600 lượt** — đã lượng hoá, không phải rủi ro thật ✓ |

---

## 8. 🟡 P2 — BẢO MẬT: BA CHỖ CÒN HỞ, MỨC THẤP–TRUNG

### 8.1 Thiếu chống clickjacking, mà site này có ví ký giao dịch

`(secheaders)` trong Caddyfile khai đúng 3 header:

```
Strict-Transport-Security · X-Content-Type-Options · Referrer-Policy
```

**Không có `X-Frame-Options`, không có CSP `frame-ancestors`.** Đo thật trên
`https://a1.9chain.org/` — xác nhận cả hai đều vắng.

🔴 **Vì sao nó đắt hơn vẻ ngoài ở ĐÚNG site này:** `/console/` đăng nhập bằng **chữ ký ví**
(SIWE) và đẻ ra L1 thật. Một trang của kẻ khác nhúng `a1.9chain.org/console` trong iframe trong
suốt, phủ lên một nút mồi ⇒ người dùng bấm "ký" mà tưởng mình bấm thứ khác. Vá bằng **một dòng**
trong `(secheaders)`.

### 8.2 Khối RPC không import `secheaders`, và CORS thật không do Caddy cầm

Đo, so hai đường trên cùng một URL:

| | `access-control-*` trả về |
|---|---|
| **OPTIONS** (Caddy tự trả `respond 204`) | `allow-origin: *` · `allow-methods` · `allow-headers` |
| **POST** (đi qua `reverse_proxy` tới node) | 3 cái trên **+ `allow-credentials: true` + `vary: Origin`** |

`allow-credentials` và `vary` **không có ở đâu trong Caddyfile**. Chúng đến từ **chính
avalanchego**. Tức khối `header {…}` của Caddy ở đường POST **không phải thứ đang cầm lái** —
đúng bẫy `defer` mà repo đã trả giá một lần với `.webmanifest` (gotcha đợt 12).

Hai hệ quả:
- `Allow-Origin: *` **cộng** `Allow-Credentials: true` là tổ hợp **trình duyệt từ chối** theo
  đúng đặc tả. Không tạo ra lỗ, nhưng nó nghĩa là dapp nào gửi kèm credential sẽ hỏng, và
  không ai hiểu vì sao.
- A1 đang tưởng mình kiểm soát header của RPC công khai. **Không.**

⇒ Việc phải làm không phải "sửa cho đẹp" mà là **biết ai đang cầm lái**: hoặc `defer` cho Caddy
thắng, hoặc bỏ khối header đó đi và khai rõ *"CORS do node đặt"*. **Một cấu hình trông như đang
áp mà thật ra không áp còn tệ hơn không có cấu hình.**

### 8.3 B-10 — Cloudflare vẫn che `robots.txt`, đo lại hôm nay

Đo bằng **NỘI DUNG**, không tin mã HTTP (luật cứng #1):

```
/robots.txt   HTTP 200 · Cf-Cache-Status: EXPIRED · Cache-Control: max-age=14400
              nội dung: "# As a condition of accessing this website…"   ← của Cloudflare
/sitemap.xml  Cf-Cache-Status: DYNAMIC                                  ← tới origin, của ta
```

**Vẫn nguyên trạng.** Chỉ David tắt được, trong dashboard Cloudflare.

### 8.4 B-9 — `#e84142` (đỏ thương hiệu Avalanche) trong `patches/0003`

Chưa đổi. Đụng patch series ⇒ đổi tree hash ⇒ **nên gộp vào cùng lượt vá `restart:` của
§1**, làm một lần thay vì hai.

---

## 9. 🟠 P3 — TỐI ƯU: EXPLORER TỐN GẤP 2,2 LẦN CẢ BLOCKCHAIN

`docker stats --no-stream`, đo lúc mạng gần như tĩnh:

| Container | CPU | RAM |
|---|--:|--:|
| **`backend` (Blockscout)** | **57,54%** | 343 MB |
| 9 node avalanchego **cộng lại** | **~26,1%** | ~515 MB |
| `db` | 0,83% | 163 MB |

Và chuỗi nó đang index có **`eth_blockNumber` = `0x4`** — **bốn block**.

| Container | Số lần restart | `25/08` (B-2 ghi) | Tăng |
|---|--:|--:|--:|
| `stats` | **1.477** | 807 | +670 trong 2 ngày |
| `user-ops-indexer` | **573** | 315 | +258 |

🔴 **B-2 không đứng yên — nó xấu đi.** Hai dịch vụ này A1 **không dùng**: `user-ops-indexer` là
ERC-4337 (A1 không có), `stats` chỉ vẽ biểu đồ. Chúng đang flap ~14 lần/giờ, chôn mọi sự cố
thật trong `docker ps`.

**Cần David duyệt** (đây là stack công khai đang phục vụ người ngoài, không phải mặc định kỹ
thuật): gỡ 2 service khỏi compose Blockscout. Và con số 57,54% là **số liệu cứng cho quyết định
thay Blockscout bằng 9Scan-A1**.

⚠️ Không giới hạn tài nguyên container nào (`cpus=0 mem=0`). Mức ưu tiên **thấp** — máy 62 GB
RAM dùng 2 GB, đĩa 9% — nhưng `backend` vừa chứng minh một container ăn được bao nhiêu, nên khi
đặt giới hạn thì đặt cho **nó**, không phải cho node.

---

## 10. Việc còn lại — xếp theo thứ tự nên làm

### Trước ngày G (`01/09`)

| # | Việc | Ai | Chi phí |
|---|---|---|---|
| ~~1~~ | ✅ **XONG `27/08`** — `docker update --restart=unless-stopped`, **9/9**, 0 downtime, 2 ca nghiệm thu + đối chứng ngược | — | — |
| ~~8~~ | ✅ **XONG `27/08`** — netgen ghi `restart:`; **17 patch**, tree **`f8458b33`**, đối chứng ngược 16/17 → `c9226d9c` | — | — |
| 2 | 🔴 **O1 custody khoá 5 quỹ** — hạn `28/08`, cơ hội một lần | **David** | quyết định |
| 3 | 🔴 **O4** — dời 1 node sang nhà cung cấp thứ hai, **hoặc** khai thật trên trang | **David** | tiền / câu chữ |
| 4 | **H-7** IPv4 đa cổng hay IPv6 | **David** | quyết định |
| 5 | **B-10** tắt Managed robots.txt ở dashboard Cloudflare | **David** | 1 phút |
| ~~7~~ | ✅ **XONG `27/08`** — O2 chạy thật: **37–54s**, `GỐC` công bố ở D-072, 4 ca nghiệm thu (2 đối chứng ngược) | — | — |
| ~~10~~ | ✅ **ĐÃ DEPLOY `27/08`** — `frame-ancestors 'self'` + `X-Frame-Options` (chỉ site A1); CORS `defer` + gỡ `Allow-Credentials`. Kèm **cổng D-075** | — | — |
| ~~11~~ | ✅ **XONG** — deploy sạch, 6 tên miền còn sống, đo từ ngoài | — | — |
| 6 | **B-9** `#e84142` — nếu chốt sửa thì sinh lại bộ patch **một lần nữa** | **David** duyệt | — |
| 9 | **GO/NO-GO `29/08`** theo `NGAY-G-A1-CON-LAI` §7 | — | — |
| 11 | 🔴 **Deploy Caddyfile** — cần David gật + nên báo 9Scan trước | **David** | 1 lệnh |

### 🔴 Lượt deploy này suýt gây HAI thiệt hại — cả hai bắt được bằng phép đo TRƯỚC khi đẩy

**1. Suýt xoá công việc của phiên web.** Caddyfile **đang chạy** đến từ nhánh `web-home`, đi
trước `main` **168 dòng** ở chính tệp đó: trang **404 thương hiệu**, `Cache-Control: no-cache`
cho HTML, `handle /api/*`, khối robots. Deploy thẳng từ `main` sẽ xoá sạch — đúng lớp lỗi
**B-6** (deploy xoá site block của 9Scan ⇒ explorer 525 trong 31 phút).
⇒ Merge `main` vào `web-home` rồi deploy **từ đó**.

**2. Suýt làm site của 9Scan KÉM AN TOÀN ĐI.** Bản vá đầu đặt header chống nhúng vào
`(secheaders)` — snippet mà **cả bốn** tên miền import. Đo trước khi deploy:

```
a1.9scan.org → content-security-policy: frame-ancestors 'none'; base-uri 'none';
                                        form-action 'self'; object-src 'none'
               x-frame-options: DENY
```

**Chính sách của họ CHẶT HƠN của ta.** Áp thêm ở tầng Caddy thì hoặc nới lỏng nó, hoặc đẻ
header **trùng lặp** — hai `X-Frame-Options` lệch nhau khiến trình duyệt **bỏ qua cả hai**.
⇒ Snippet `(chongnhung)` riêng, chỉ import ở hai tên miền của A1.

### ✅ Nghiệm thu sau deploy — đo từ ngoài, không tin lời kịch bản

| | |
|---|---|
| `a1.9chain.org` | `frame-ancestors 'self'` + `SAMEORIGIN` ✓ mới |
| `a1.9scan.org` | **đúng 1** dòng `x-frame-options`, vẫn `DENY`, CSP nguyên vẹn ✓ |
| RPC POST | `allow-credentials` **biến mất** · `eth_chainId` = `0x218711a09` · preflight 204 |
| Việc của phiên web | 404 thương hiệu trả **đúng mã 404** + `<title>` tiếng Việt · `no-cache` còn |
| 6 trang công khai | **200** hết · faucet `{"ok":true}` · console API từ chối đúng cách |

### 🔴 Và dựng một CỔNG cho đúng lớp lỗi vừa suýt dẫm (D-075)

*"Nhờ nhớ so tay"* không phải một cổng. `caddy-deploy.sh` nay **từ chối** bản mới ít dòng cấu
hình hơn bản đang chạy (≥10 dòng ⇒ chặn; ít hơn ⇒ cảnh báo; `A1_CHO_PHEP_TEO=1` để gỡ thật).

Đo bằng **dòng không-phải-chú-thích**, không bằng `diff`: tệp này 2/3 là chú thích và chú thích
đổi liên tục, nên cổng dựa trên `diff` sẽ kêu mọi lượt và **bị bỏ qua ngay tuần đầu**.

**Đã bắn đúng ca suýt xảy ra vào cổng, trên server thật:** đẩy bản `main` lên ⇒ `253 → 185`,
*"ít hơn 68 dòng — DỪNG"*, exit 1, vân tay bản đang chạy **không đổi**, `Caddyfile.new` **còn
nguyên** (cổng dừng trước khi xoá bằng chứng), site vẫn 200.

⚠️ **Cổng này chặn hậu quả, không chữa nguyên nhân.** Nguyên nhân là Caddyfile sống ở **hai
nhánh** và bản đang chạy đến từ `web-home` — hạ tầng dùng chung **không có một nhà duy nhất**.
Việc đó cần David quyết: gộp `web-home` vào `main`, hay tách Caddyfile ra khỏi cả hai.

🔴 **Runbook ngày G thêm một dòng đối chứng:** sau `up -d`, chạy
`docker inspect $(docker ps -q --filter name=9chain-a1-node-) --format '{{.HostConfig.RestartPolicy.Name}}'`
— phải ra **`unless-stopped` × 9**. Nếu ra `no` thì image/compose ngày G **không phải bản có
patch 0017**, và không có gì khác báo cho ta biết điều đó.

### Ngay sau ngày G

| # | Việc |
|---|---|
| 11 | 🔴 **Đo lại hạn 9 validator** (`platform.getCurrentValidators` → `endTime`) rồi **dựng lịch nhắc + người chịu trách nhiệm** — B-12 |
| 12 | 🔴 **Đo lệch đồng hồ 9 node** → chọn `--offset-ms` — B-13(b), đã hạ mức nhưng chưa đóng |
| 13 | Dựng **cron backup A1** (repo bundle + patch series) song song cron của 9Scan |
| 14 | Dựng **giám sát tối thiểu**: 9 node connected · số dư chain-factory · đĩa · hạn validator |

### Sau đó (không chặn ngày G)

| # | Việc |
|---|---|
| 15 | **H-6** nơi đặt repo lâu dài + private/public ⇒ mở khoá **CI** cho ~20 bộ kiểm đang chạy tay |
| 16 | **M3.4/M3.5** `RUN-A-NODE.md` + kiểm chứng từ VPS ngoài ⇒ cộng đồng mới thật sự vào được |
| 17 | **B-2** gỡ `stats` + `user-ops-indexer` (cần David duyệt) |
| 18 | **M7.3** `/api/metrics` (chờ 9Scan chốt yêu cầu) |
| 19 | **B1+B2** vá nối biến font + đổi bộ chữ — worktree `9Chain-A1-web`, **B1 không được lên trước B2** |
| 20 | ufw như lớp thứ hai sau Caddy (M7.2 còn lại) |

### 🔴 Ngoài tầm A1

**Chữ khắc chờ C1 đóng băng byte.** Cơ chế A1 xong 100% (patch 0010/0011, nghiệm thu 17/0 trên
chain sống); **nội dung 0%**. Trễ quá `28/08` thì đường găng gãy ở chỗ A1 không tự cứu được.

---

## 11. Mức tin cậy — đừng trích mạnh hơn phép đo

| Khẳng định | Mức |
|---|---|
| 9 node `restart=no`, không có systemd unit | **chắc chắn** — `docker inspect` + `systemctl` |
| Reboot ⇒ nodes không dậy | **suy luận từ hành vi Docker đã biết**, **CHƯA thử reboot thật** |
| Chỉ 22/80/443 mở | **chắc chắn** — quét 35 cổng từ máy dev qua Internet |
| CORS do avalanchego cầm, không phải Caddy | **chắc chắn** — so OPTIONS vs POST, hai bộ header khác nhau |
| Blockscout 57,54% CPU | **chắc chắn** — nhưng là **một mẫu tức thời**, không phải trung bình |
| Hạn validator | **chắc chắn** — đọc từ P-Chain, không tính tay |
| Clickjacking khai thác được trên `/console/` | **CHƯA THỬ** — header vắng mặt là chắc chắn; dựng PoC thì chưa |
| "9 node 1 host" nhìn ra từ ngoài | **chắc chắn** — `info.peers` trả `172.28.0.x` cho cả 8 peer |

---

## 12. Đề xuất hướng đi — A1 khuyến nghị, David chốt

> David hỏi *"đề xuất hướng tối ưu"*. Mục này **khuyến nghị**, không liệt kê lựa chọn. Chỗ nào
> A1 không đủ thẩm quyền thì nói rõ đang khuyến nghị cái gì và vì sao.

### 12.1 🔴 Caddyfile hai nhánh → **GỘP `web-home` vào `main`, xoá nhánh dài hạn**

Đo `27/08`: `web-home` đi trước **12 commit**, `main` đi trước **2**. Nhưng con số ấy không phải
vấn đề — **hướng phân kỳ** mới là:

| Tệp dùng chung | Phân kỳ |
|---|---|
| `local-net/deploy/Caddyfile` | web-home **+175 dòng** |
| `local-net/deploy/caddy-deploy.sh` | main **+37 dòng** (cổng D-075) |
| `DECISIONS.md` | main **+83 dòng** (D-073/074/075) |
| `docs/GDAY-A1-REMAINING.md` · `docs/SOAT-TOAN-DIEN` | **cả hai chiều** |

🔴 **Nhánh này không cô lập được gì.** Cả hai phiên đều sửa **cùng một bộ tệp hạ tầng và cùng
một sổ quyết định**. Một nhánh chỉ có ích khi hai bên chạm hai vùng khác nhau — ở đây thì không,
và hệ quả là **`DECISIONS.md` — sổ quyết định của dự án — đang tồn tại ở hai bản khác nhau.**
Đó là thứ đắt hơn Caddyfile nhiều.

**Bằng chứng nó đang gây hại thật, đo trong chính phiên này:**
1. Suýt deploy từ `main` ⇒ xoá **168 dòng** cấu hình của phiên web. Bắt được **bằng tay**.
2. Cổng D-075 **chạy trên server** nhưng trên `web-home` — **nhánh deploy** — nó **chưa được
   commit**. Tôi tự dẫm đúng cái bẫy vừa dựng cổng để chặn, trong vòng hai mươi phút.

⚠️ **Luật *"chỉ MỘT phiên được deploy"* KHÔNG cần nhánh để thi hành.** Nó là giao ước giữa người
với người. Nhánh không ngăn được hai phiên cùng deploy — nó chỉ làm **mờ** việc bản nào là bản
thật.

**Khuyến nghị:**
1. Gộp `web-home` → `main` (12 commit, đã qua cổng riêng của phiên web: typecheck · test · build
   · a11y · budget).
2. Worktree `C:\PROJECTS\9Chain-A1-web` trỏ thẳng vào `main`; nhánh dài hạn **xoá**.
3. Cần tách việc thì dùng nhánh **ngắn hạn** — sống vài giờ, merge rồi xoá.

⏰ **Làm TRƯỚC ngày G.** Mang một nhánh phân kỳ vào lượt re-genesis là mời đúng lớp lỗi này quay
lại vào ngày tệ nhất để nó quay lại.

*(Đường thay thế — tách Caddyfile ra một nhà thứ ba — A1 **không** khuyến nghị: nó đẻ thêm một
nơi phải nhớ, và **không chữa** phân kỳ của `DECISIONS.md`.)*

### 12.2 🔴 O1 custody — **KHÔNG phải quyết định đang chờ. Là một PHÉP KIỂM chưa chạy.**

Đọc kỹ: **David đã chốt O1 ở D-044 (`26/08`)** — giữ sơ đồ cũ, bản thứ hai David tự cất. Thứ
`NGAY-G-A1-CON-LAI` ghi là *"chưa ai **xác nhận** có"*.

⇒ Câu đúng không phải *"anh chọn sơ đồ nào"* mà **"bản thứ hai có thật không, và khôi phục được
không"**. Đó là việc mười lăm phút, không phải một quyết định.

🔴 **Và có một dịp diễn tập HOÀN HẢO đang trôi qua:** bộ khoá hiện tại **sẽ bị vứt bỏ ngày
`01/09`**. Diễn tập khôi phục trên chính nó là **rủi ro bằng không** — hỏng cũng không mất gì, vì
nó sắp chết. Đây là cửa sổ duy nhất trong năm để thử một quy trình custody mà không đánh cược.

**Khuyến nghị — phép kiểm phải CÓ THỂ ĐỎ, không phải "mở ra xem có file không":**

1. David lấy **bản thứ hai** (bản anh tự cất), khôi phục vào một thư mục tạm — **không đụng máy dev**.
2. Suy địa chỉ từ khoá đó, so với `docs/ALLOCATION-PUBLIC.md`.
3. **Đạt** = ra đúng địa chỉ Foundation đã công bố. **Đỏ** = khác, hoặc không mở được, hoặc không
   tìm thấy.
4. Ngày G sinh khoá mới ⇒ **chạy lại đúng quy trình đó ngay trong ngày**, lúc còn nhớ.

A1 viết được bài kiểm bước 2 (đọc khoá → in địa chỉ, **không gửi đi đâu**). **Bước 1 chỉ David
làm được** — và nếu bước 1 không thực hiện được thì đó chính là câu trả lời cần biết trước ngày G.

### 12.3 🔴 O4 — **cách rẻ nhất không phải tiền, mà là chữ "chính thức"**

`NGAY-G-A1-CON-LAI` §7 tự đặt điều kiện: *"O4 không đạt thì `01/09` KHÔNG nên gọi là chạy chính
thức"*. Bản soát này **củng cố** điều đó bằng phép đo: `info.peers` phơi `172.28.0.x` cho cả 8
peer ⇒ ai cũng bác được tuyên bố "9 node" bằng **một lệnh curl**.

Nhưng ba việc đang bị gộp làm một, và tách ra thì rẻ hơn nhiều:

| | Việc | Chi phí | Chặn ngày G? |
|---|---|---|---|
| **a** | **Khai thật trên trang** — *"9 validator, hiện chạy trên một hạ tầng; phi tập trung hoá là mốc M3"* | vài câu | **không** |
| **b** | **Đổi tên `01/09`** — *"sinh lại mạng"* thay vì *"chạy chính thức"* | 0 đồng | **không** |
| **c** | **Dời một node** sang nhà cung cấp thứ hai | tiền + thời gian + O7 phải tập lại | **có**, nếu giữ chữ "chính thức" |

**Khuyến nghị: làm (a) và (b) trước ngày G; đẩy (c) sang tháng 9.**

Lý do không phải tiếc tiền: **(c) làm vội trong năm ngày còn tệ hơn (c) làm tử tế trong tháng 9.**
Dời một validator sang nhà cung cấp khác kéo theo P2P phải ra Internet (H-7 chưa quyết), kéo theo
khoá staking, và kéo theo O7 phải diễn tập lại trên **topology nhiều máy — chưa lượt nào tập**.
Nhồi cả cụm đó vào tuần có re-genesis là cách chắc nhất để hỏng cả hai.

🔴 **Và (a)+(b) làm cho lời tuyên bố thành ĐÚNG ngay hôm nay** — đó mới là thứ `info.peers` đang
đe doạ, chứ không phải kiến trúc. Một testnet khai thật *"một hạ tầng, đang đi tới nhiều"* thì
không còn gì để ai bác.

### 12.4 B-9 `#e84142` — **sửa, và sửa TRONG lượt regen tới**

**Khuyến nghị: sửa.** Ba lý do, xếp theo sức nặng:

1. Một sovereign fork tự khai *"không dùng nhãn hiệu Avalanche cho branding"* (`README`, `NOTICE`)
   mà mang **đúng đỏ thương hiệu của họ** trong công cụ chủ quyền là **rủi ro nhận diện**, không
   phải chuyện thẩm mỹ.
2. Chi phí **nay gần bằng không**: quy trình sinh lại cả bộ patch vừa chạy trong ngày, có đối
   chứng ngược (áp 16/17 → ra đúng tree cũ). Thêm một lượt là một lệnh + một phép so tree.
3. Để sau ngày G thì nó nằm trong `patches/` mà **mọi lần dựng lại fork đều áp**, và **không cổng
   nào canh màu cắm cứng**.

⏰ Làm **trước** lượt `docker build` ngày G — sau đó tree hash đã đi vào image.

### 12.5 B-10 `robots.txt` — **làm luôn, một phút**

Không có gì để cân nhắc. Tệp có, route có, đã deploy; chỉ Cloudflare đang che. Dashboard →
Settings → Content Signals / robots.txt management → tắt. Đo lại bằng **nội dung**, không bằng mã
HTTP.

### 12.6 H-7 IPv4 vs IPv6 — **đừng quyết vội, nó KHÔNG chặn ngày G**

Khuyến nghị cũ giữ nguyên: **IPv4 đa cổng cho node beacon** (thứ cộng đồng cần chạm tới), IPv6 cho
phần còn lại. Lý do: ở Việt Nam tỉ lệ người chỉ có IPv4 không nhỏ, và họ *"chẳng làm gì sai"*.

Nhưng nó **không chặn `01/09`** — cổng P2P hôm nay đóng và mạng vẫn chạy. Gộp vào cùng cụm với
O4(c) sau ngày G, vì hai việc đó **chạm nhau**: dời node sang nhà cung cấp thứ hai buộc P2P phải
ra Internet, tức H-7 phải xong trước.

### 12.7 Thứ tự năm ngày tới

| Ngày | Việc | Ai |
|---|---|---|
| **28/08** | Diễn tập khôi phục custody trên bộ khoá **sắp bị vứt** (§12.2) · tắt robots.txt ở CF · gộp `web-home` → `main` | David + A1 |
| **28/08** | Chốt B-9 ⇒ A1 sinh lại bộ patch **lần cuối** trước ngày G | David → A1 |
| **28/08** | Câu khai thật về hạ tầng + đổi tên `01/09` (§12.3 a+b) | David + phiên web |
| **29/08** | **GO/NO-GO** — mười điều §7 | — |
| **01/09** | Ngày G. Runbook thêm: O2 **trước** khi xoá · tra lại G4 · `restart policy = unless-stopped × 9` sau `up -d` | A1 |
| **ngay sau** | Đo hạn 9 validator → lịch nhắc (B-12) · đo lệch đồng hồ → `--offset-ms` (B-13b) · dựng cron backup + giám sát | A1 |
| **tháng 9** | O4(c) dời node + H-7 + O7 tập trên nhiều máy — **cụm này đi cùng nhau** | David + A1 |

🔴 **Thứ duy nhất A1 không tự cứu được vẫn không đổi:** chữ khắc chờ **C1 đóng băng byte**. Nếu
`28/08` C1 chưa có byte thì đó là câu phải đưa vào **GO/NO-GO `29/08`**, không phải câu để lại tới
`01/09`.
