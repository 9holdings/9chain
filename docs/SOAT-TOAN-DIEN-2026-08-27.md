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
| 6 | **B-9** `#e84142` — nếu chốt sửa thì sinh lại bộ patch **một lần nữa** | **David** duyệt | — |
| 7 | Chạy **O2** một lượt trên mạng công khai để biết thời gian thật | A1 | không chặn |
| 9 | **GO/NO-GO `29/08`** theo `NGAY-G-A1-CON-LAI` §7 | — | — |
| 10 | Vá `(secheaders)`: thêm `frame-ancestors` + quyết ai cầm CORS của RPC | A1 | nhỏ |

🔴 **Runbook ngày G thêm một dòng đối chứng:** sau `up -d`, chạy
`docker inspect $(docker ps -q --filter name=9chain-a1-node-) --format '{{.HostConfig.RestartPolicy.Name}}'`
— phải ra **`unless-stopped` × 9**. Nếu ra `no` thì image/compose ngày G **không phải bản có
patch 0017**, và không có gì khác báo cho ta biết điều đó.

### Ngay sau ngày G

| # | Việc |
|---|---|
| 11 | 🔴 **Đo lại hạn 9 validator** (`platform.getCurrentValidators` → `endTime`) rồi **dựng lịch nhắc + người chịu trách nhiệm** — B-12 |
| 12 | 🔴 **Đo lệch đồng hồ 9 node** → chọn `--bu-ms` — B-13(b), đã hạ mức nhưng chưa đóng |
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
