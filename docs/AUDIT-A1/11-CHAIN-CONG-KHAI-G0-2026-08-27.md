# SOÁT **CHUỖI CÔNG KHAI THẾ HỆ g0** — đo `2026-08-27 ~15:30Z`

**Đối tượng:** mạng công khai vừa sinh lại (D-081) · `rpc-a1.9chain.org` · `a1.9chain.org` · `a1.9scan.org`
**Nguồn:** `SERVER` (đo trực tiếp, **chỉ đọc**) + `REPO` (`main @ 86b4389`, 18 patch)
**Lệnh đổi trạng thái đã dùng:** **không có.** Không drip faucet, không đẻ chain, không docker.

> Bản này **không** chép lại `DECISIONS D-079/080/081`. Nó **kiểm chứng độc lập** những
> gì D-081 khai, và tìm cái D-081 chưa nhìn tới. Ba phát hiện nặng nhất dưới đây đều
> **không có trong bảng nghiệm thu của D-081**.

---

## 0. Kết luận trước

**Chuỗi khoẻ. Cái nói về chuỗi thì sai.**

Lớp giao thức của g0 đúng ở mọi chỗ tôi đo được — kể cả con số mà D-079 suýt để lọt.
Nhưng ba thứ mà người ngoài thực sự nhìn thấy đều đang nói về **mạng đã bị xoá sáng nay**:

| Người ngoài nhìn thấy | Đang nói gì | Sự thật |
|---|---|---|
| Chân trang **cả 6 trang** `a1.9chain.org` | `networkID 9001` | **999999999** |
| Tiêu đề + `<meta>` của `a1.9scan.org` | `· 9001` | **999999999** |
| Toàn bộ số liệu trên `a1.9scan.org` | `—` · *"connecting…"* | chuỗi đang chạy, RPC trả lời đúng |

D-081 ghi *"6 trang công khai **200** hết"*. Đúng — và đó chính là bậc thang mà
`CLAUDE.md` cấm dừng lại: **mã HTTP → content-type → nội dung thật**. Ở bậc *nội dung
thật*, 6/6 trang đang khai một `networkID` mà nếu ai đó dùng thì **bị mạng cắt kết nối** —
đúng hành vi D-079 vừa chứng minh bằng bài xâm nhập.

---

## 1. Lớp giao thức — đo được, và đúng

```
$ curl -s -d '{"jsonrpc":"2.0","id":1,"method":"info.getNetworkName"}' https://rpc-a1.9chain.org/ext/info
{"result":{"networkName":"9chain-a1-g0"}}
$ ... info.getNetworkID  → {"networkID":"999999999"}
$ ... info.getNodeVersion → 9chaingo/1.14.2 · gitCommit 9chain-a1-poc
```

| | Đo được `27/08 15:30Z` | Ghi chú |
|---|---|---|
| `networkID` | **999999999** | vừa `uint32` (trần 4.294.967.295) ✓ |
| `networkName` | **`9chain-a1-g0`** | thế hệ đã vào tên ⇒ patch 0018 sống |
| `eth_chainId` | `0x218711a09` = **9000000009** | D-076 ✓ |
| Validator | **9/9 connected**, uptime **100,0000%** | |
| Self-bond mỗi node | `999999000000000` = **999.999 LOVE9** | khớp `check-consistency` ✓ |
| HRP | `P-love918a4zwddz9nqjmzyzd86nt2czjkgpfxl8s3wx4g` | **`love9` sống trên 999999999** ✓ |
| P-Chain height · X · C | **0** · **0** · **1** | chuỗi mới tinh |
| Sổ blockchain | **chỉ C-Chain + X-Chain** | 6 chuỗi rác của bộ kiểm **đã biến mất** ✓ |
| Khoá `ewoq` công khai | `0x0` | ✓ |
| `/ext/admin` `/ext/keystore` `/ext/metrics` | **404** | ✓ |
| 6 phương thức RPC nguy hiểm | **−32601 cả 6** | ✓ |
| Chống nhúng | `frame-ancestors 'self'` trên mọi trang | D-073 sống qua re-genesis ✓ |
| Console API không token | **401** đúng câu | ✓ |

**Đối chứng ngược cho hai bảng trên:** cùng một đường truyền, `eth_chainId` và
`platform.getCurrentValidators` **trả kết quả thật**. Nên `404`/`−32601` là *từ chối
thật*, không phải đường ống hỏng.

**Sáu chuỗi rác đã biến mất** là lãi thật của lượt sinh lại: chúng từng đăng ký
**vĩnh viễn** trên P-Chain cũ (D-013, không thu hồi được). Genesis mới xoá sổ đăng ký.

---

## 2. 🔴 Xác minh ĐỘC LẬP `supplyCap` — không đọc log node, đọc chính chuỗi

D-079 tìm ra lỗi `supplyCap = 720.000.000` bằng cách **boot một node và đọc log**, trên
**mạng tập**. D-081 khẳng định mạng công khai chạy `7.900.000.001` — nhưng bằng chứng ở
đó là **bảng kế toán suy ra từ `currentSupply`**, tức vẫn là cùng một con số nhìn từ một
phía. Dưới đây là phép đo **thứ hai, độc lập**, chỉ dùng RPC công khai.

Nghịch đảo công thức thưởng (`vms/platformvm/reward/calculator.go` — `reward ∝ SupplyCap − currentSupply`),
chạy với `A1Params` thật (`Min/MaxConsumptionRate` 10%/12%, `MintingPeriod` 365 ngày,
stake `999.999`, `startTime 2026-08-27T15:19:11Z`, nhiệm kỳ so le 309…365 ngày):

| Giả thuyết | `potentialReward` node[0] tính ra |
|---|--:|
| `SupplyCap = 7.900.000.001` (đúng) | **82.876.379.811.608** |
| `SupplyCap = 720.000.000` (tràn ngược `uint64`) | 342.250.535.647.739 |
| **ĐO THẬT trên chuỗi** | **82.876.379.811.608** |

⇒ **Khớp TỪNG ĐƠN VỊ.** Giả thuyết tràn cho số lệch **4,13 lần** — hai ca phân biệt được
rõ ràng, nên phép đo này **biết báo đỏ**.

```
currentSupply đo    4.300.824.365,880040837 LOVE9   (= 23,315% trần uint64)
                  − genesis X/P 4.300.000.001
                  = 824.364,88  ← tổng potentialReward của 9 validator
tổng cung tối đa    7.900.000.001 + 1.099.999.999 (C-Chain) = 9.000.000.000 ✓
```

> **Đây nên thành một cổng.** Nó đo `supplyCap` của một mạng đang chạy **từ bên ngoài,
> chỉ đọc, không cần shell, không cần log** — thứ mà D-079 vừa trả giá vì không có.
> Nghịch đảo công thức, so với hằng số trong Go, `--tu-kiem` bằng ca tràn 720 triệu.

---

## 3. 🔴 Ba thứ người ngoài nhìn thấy, và cả ba đang nói về mạng đã chết

### 3a. Sáu trang của A1 khai `networkID 9001` — A-007

```
$ for u in / /compare/ /re-genesis/ /faucet/ /create-chain/ /my-chains/; do
    curl -s https://a1.9chain.org$u | grep -c 9001 ; done
1 1 1 1 1 1        ← 6/6 trang
$ curl -s https://a1.9chain.org/ | grep -o '.\{40\}9001'
Chain ID 9000000009 · LOVE9 · networkID 9001      ← chân trang
$ grep -n networkId web/lib/chain.ts
23:  networkId: 9001,
```

Một dòng, một nguồn, sáu trang. Và nó nằm ngay cạnh hai con số **đúng**
(`9000000009`, `LOVE9`) — nên nó đọc như một sự thật đã kiểm.

### 3b. Explorer công khai chết trên chuỗi mới — A-008

Đo bằng **trình duyệt thật** (curl chỉ thấy khung — `CLAUDE.md`):

```
https://a1.9scan.org/   → 200, title "9Scan A1 — 9Chain block explorer · 9001"
màn hình:  "connecting…" ×2
           LATEST BLOCK —   TOTAL SUPPLY —   VALIDATORS —   GAS PRICE —
           Latest blocks: (rỗng)   Latest transactions: (rỗng)
           Network information → CHAIN ID  9001 · EVM 9000000009
tải lại + chờ 5s → y hệt.  console: KHÔNG một lỗi nào.
```

**Và hạ tầng của chính nó thì lành:**

```
$ curl -d '{"method":"eth_blockNumber"}' https://a1.9scan.org/rpc/ext/bc/C/rpc  → 0x1
$ curl -d '{"method":"info.getNetworkID"}' https://a1.9scan.org/rpc/ext/info    → 999999999
mạng của trang: 19 tệp tĩnh 200 · ĐÚNG MỘT lượt POST /rpc/… → 200, trả về
                block 0x1 + chainId 0x218711a09 + kết quả thứ ba  ⇒ dữ liệu ĐÃ VỀ
```

⇒ Hỏng **phía client**: dữ liệu đúng đã tới nơi rồi giao diện vẫn không vẽ, và không
ném lỗi nào. Đây là 9Scan-A1 (đội khác) — nhưng nó là **explorer mà chính trang faucet
của A1 trỏ người dùng sang** (`EXPLORER → 9Scan-A1 ↗`).

### 3c. Nút chính của trang chủ dẫn tới việc không thể thành công — A-009

D-081 §"Còn lại, KHÔNG được quên" #1: *"`chain-factory` chưa nạp tiền P-Chain ⇒ **đẻ
chain chưa dùng được**"*. Trang chủ vẫn quảng cáo, đo bằng trình duyệt:

```
Trang chủ:      "Launch your own chain on A1 … Takes about three minutes."  [Launch your chain]
/create-chain/: "Connect wallet … the network builds the chain in about three minutes."
                KHÔNG một dòng nào nói dịch vụ đang không dùng được.
```

Và đường mã **không có phanh**:

```
$ grep -n "getBalance\|so du" local-net/console/server.mjs   → (không có phép kiểm số dư nào)
$ sed -n 68,78p local-net/lib/guard.mjs                      → check() ĐẨY dấu thời gian
                                                                NGAY LÚC KIỂM (arr.push(now))
```

⇒ Người dùng: nối ví → ký SIWE → **tiêu 1 trong 3 lượt/giờ** → nhìn thanh tiến trình
~170 giây → nhận lỗi thô. Lặp 3 lần là hết suất giờ đó. Không phép kiểm rẻ nào chặn
trước, dù cái cần kiểm chỉ là một lần `platform.getBalance`.

---

## 4. Repo ↔ mạng đang chạy — chỗ đã trôi lệch

### 4a. `--network-id=9001` còn cắm cứng trong 6 tệp compose — A-010

```
$ grep -rn "network-id=9001" local-net --include=*.yml | cut -d: -f1 | sort -u
local-net/deploy/multinode.compose.yml     ← tệp tự khai "NGUỒN CHÍNH THỨC LÀ TỆP NÀY"
local-net/deploy/node.compose.yml
local-net/docker-compose.yml
local-net/docker-compose.drill.yml
(+ local-net/net*/… — bản sinh ra của thế hệ cũ, gitignored)
```

D-079 đã gặp đúng lỗi này ở compose **do netgen sinh** và vá **trong netgen**. Bản
**đã sinh, đang nằm trong git** thì chưa ai đụng. Dựng lại từ nó ⇒
`conflicting networkIDs: expected 9001 but config contains 999999999` ⇒ node **không lên**.

Cộng với A-003 (bản trước): tệp này nay lệch **ba thứ** — **5 node** (thật: 9),
**0 dòng `restart:`** (thật: `unless-stopped` ×9), **`--network-id=9001`** (thật: 999999999).

### 4b. Bản sao lưu ngoài máy nay mô tả một mạng ĐÃ BỊ XOÁ — A-001 nâng lên **P0**

```
$ git ls-tree --name-only 15f9076 patches/ | wc -l      ← HEAD của bản sao lưu 27/08
12
$ git ls-tree --name-only main patches/ | wc -l
18
$ git rev-list --count 15f9076..main
31
```

**Patch 0013–0018 không có mặt trong bản sao lưu dưới bất kỳ dạng nào** — không trong
`avalanchego-patches/`, không trong bundle. Sáu patch đó **chính là định nghĩa của mạng
đang chạy**: `A1Gen`, `A1ID 999999999`, `A1Name 9chain-a1-g0`, `A1HRP` tường minh,
`upgrade.A1`, `SupplyCap 7.900.000.001`, `LaMangA1`, `restart: unless-stopped`.

⇒ Ổ `C:` hỏng tối nay ⇒ thứ dựng lại được là **mạng `9001` với trần cung 9 tỷ** — đúng
cái mạng vừa bị xoá sáng nay vì nó sai. **Mạng công khai đang chạy sẽ không dựng lại được.**

🔴 Đối xứng đáng ghi: D-080 đã cẩn thận **xuất GỐC của chuỗi cũ trước khi xoá**. Cùng
ngày đó, **mã sinh ra chuỗi mới không có một bản nào ngoài ổ đĩa dev.** Dữ liệu của cái
đã chết được bảo quản kỹ hơn mã của cái đang sống.

---

## 5. Trạng thái các phát hiện của bản soát trước

| ID | Trước | Nay | Ghi chú |
|---|---|---|---|
| **A-001** | P1 · 26 commit / 12-vs-17 | 🔴 **P0** · 31 commit / **12-vs-18** | bản sao lưu nay mô tả mạng đã bị xoá |
| **A-002** | P1 | 🔴 **còn nguyên, và đã được thực tế chứng minh** | D-079: cổng netgen XANH mà node vẫn sai 720 triệu — đúng lớp lỗi A-002 mô tả, ở một cổng khác |
| **A-003** | P2 · lệch 2 thứ | 🔴 **lệch 3 thứ** | thêm `--network-id=9001` (A-010) |
| **A-004** | P2 | 🔴 còn nguyên | `faucet: ^6.13.0`, không lockfile |
| **A-005** | P2 | 🟠 chưa đo lại trên máy chủ | Blockscout đang index lại từ block 0 |
| **A-006** | P2 | 🟠 **đã có `go test` cho `GetStakingConfig`** (D-079) — nhưng test đó **XANH trong khi node SAI** | đúng bài học D-079: cổng chỉ chứng minh đường mà nó đi |
| **B-10** | mở | 🔴 **đo lại hôm nay, vẫn nguyên** | `robots.txt` trả về **5.367 byte** boilerplate content-signals của Cloudflare (11 lượt nhắc bot AI), không phải bản **2.656 byte** trong `web/public/` |

---

## 6. Đồng hồ đếm ngược — đo trên chuỗi, không đọc tài liệu

```
$ platform.getCurrentValidators → 9 mốc hết hạn, so le đúng 7 ngày:
  2027-07-02 · 07-09 · 07-16 · 07-23 · 07-30 · 08-06 · 08-13 · 08-20 · 2027-08-27
```

| | |
|---|--:|
| Node đầu rụng | **sau 309 ngày** (`2027-07-02`) |
| **Mạng DỪNG** | **sau 365 ngày** (`2027-08-27`) |

Offset 7 ngày (D-045) hoạt động đúng — nó biến một cú chết đồng loạt thành **8 lần cảnh
báo**. Nhưng **B-12 vẫn mở**: chưa ai chịu trách nhiệm lịch gia hạn, và không có gì nhắc.

---

## 7. Chưa đo được — và vì sao

| Muốn đo | Bị chặn bởi | Ai đo được |
|---|---|---|
| `A1_HTTP_ALLOWED_HOSTS` trên node công khai (D-081 §3 hỏng #2 — *"netgen KHÔNG sinh `.env`"*) | Node chỉ với tới được qua Caddy, mà Caddy **viết lại** `Host` (`header_up Host {upstream_hostport}`). Từ Internet không có đường đo bộ lọc Host của node | trên máy chủ: `grep A1_HTTP_ALLOWED_HOSTS ~/9chain-a1/net/.env` — một dòng, chỉ đọc |
| Số dư P-Chain của `chain-factory` (A-009) | Địa chỉ nằm trong `console.env` **trên máy chủ**; không tệp nào trong repo có nó | trên máy chủ, hoặc David dán địa chỉ P vào đây — rồi đo bằng `platform.getBalance` công khai |
| Blockscout còn giữ block của thế hệ trước không (A-005) | Không thấy đường công khai nào tới Blockscout; `a1.9scan.org` là explorer tĩnh của 9Scan, không phải Blockscout | trên máy chủ: `docker exec … psql -c 'select max(number) from blocks'` |
| Bản vá cho A-007/A-008 đã lên chưa | Worktree soát **không deploy** (luật 1) | worktree `main` |

---

## 8. Một câu về g0

**Lượt sinh lại đã mua được đúng thứ đắt nhất — sáu patch chủ quyền nay chạy thật thay
vì nằm trên đĩa — và để lộ ra rằng thứ chưa bao giờ được sinh lại là *những gì nói về
mạng*.** Chuỗi đúng ở mọi chỗ tôi đo được, kể cả con số 720 triệu suýt lọt. Nhưng chân
trang của cả sáu trang, tiêu đề explorer, và toàn bộ số liệu explorer vẫn thuộc về mạng
`9001` đã bị xoá sáng nay — trong khi bảng nghiệm thu ghi *"200 hết"*.

⇒ Ba việc nhỏ nhất mà đổi được nhiều nhất, không cái nào cần đụng chuỗi:
**`web/lib/chain.ts:23` một dòng** (A-007) · **chạy lại H-6b** (A-001, nay P0) ·
**một lần `platform.getBalance` trước khi mở thanh tiến trình** (A-009).

---

# CẬP NHẬT — đo lại `2026-08-28 01:30Z` (sau ~10 giờ)

**Repo:** `main @ 067bfc4` · **23 patch** (lượt trước 18) · D-082 → D-088
**Chuỗi:** vẫn `9chain-a1-g0`, **9/9 connected, uptime 100,0000%**, P-Chain height **1**,
C-Chain block **2**, vẫn **chỉ C + X** (chưa L1 nào), supply không đổi.

## Đã đóng — đo được

| | Trạng thái mới | Bằng chứng |
|---|---|---|
| **A-007** chân trang khai `9001` | ✅ **ĐÃ SỬA** | `curl a1.9chain.org \| grep -o "networkID <!-- -->[0-9]*"` → `networkID <!-- -->999999999` |
| **C-6** `A1_HTTP_ALLOWED_HOSTS` (ẩn số bảo mật lớn nhất) | ✅ **ĐÚNG trên mạng thật** | ssh chỉ-đọc: `A1_HTTP_ALLOWED_HOSTS=localhost,127.0.0.1` · `A1_API_BIND=127.0.0.1`. Patch 0020 nay bắt netgen sinh `.env` |
| **Repo ↔ server lệch** | ✅ **0 lệch** | `node scripts/check-deploy-drift.mjs` → `18 khớp · 0 lệch · 0 thiếu`, `EXIT=0`. Cổng này là D-088, sinh ra sau khi phát hiện **B-14 chưa bao giờ tới server** — console công khai đã cấp chainId từ `9100` suốt hai ngày |
| **`restart: unless-stopped`** trên mạng thật | ✅ **9/9** | `docker inspect -f '{{.HostConfig.RestartPolicy.Name}}'` → `unless-stopped` ×9 |
| **A-009** đốt 170s + tiêu suất | 🟡 **nửa đóng** | D-087: `A1_DE_CHAIN_MO` mặc định **ĐÓNG** tới sau ngày G ⇒ từ chối **tức thì**, không còn chờ 170 giây. Nhưng xem dưới |
| **Faucet** | ✅ sống | drip thật `01:21Z` (C-Chain block 2, 10 LOVE9, nonce 1) · số dư `99.999.978` |

### 🔴 Đính chính của chính bản này — B-10

Lượt đo trước tôi kết luận *"`robots.txt` vẫn là boilerplate của Cloudflare, không phải
bản của dự án"*. **Sai — tôi đọc mỗi phần đầu.** Đo lại đầy đủ: Cloudflare **chèn thêm**
khối content-signals *phía trước*, còn bản của dự án nằm **từ dòng 62 tới hết** —
`Disallow: /console/api/`, `/tx/`, `/address/`… và `Sitemap:` đều đang được phục vụ.

⇒ **B-10 về thực chất đã hết là blocker.** Cái còn hỏng là **cổng canh nó**: luật cũ ghi
trong chính tệp đó là `curl … | head -3` phải thấy `"9Chain Testnet A1"` — phép kiểm ấy
nay **đỏ trong khi sản phẩm đúng**. Cổng đo sai vị trí, không phải sản phẩm hỏng.

## Còn nguyên — và một mục nặng hơn

| | Mức | Trạng thái |
|---|---|---|
| **A-001** bản sao lưu | 🔴 **P0, xấu đi** | Bản mới nhất vẫn là `20260827-051507`: **12 patch**, HEAD `15f9076`. Repo nay **23 patch / 41 commit** sau đó ⇒ **thiếu 0013–0023, tức 11 patch**. `BLOCKERS.md:465` vẫn ghi H-6 *"không còn là một ổ đĩa"* — **câu đó nay không còn đúng** |
| **A-008** explorer | 🔴 còn nguyên | `a1.9scan.org` sau 10 giờ vẫn: tiêu đề `· 9001` · `connecting…` · LATEST BLOCK/SUPPLY/VALIDATORS/GAS đều `—` |
| **A-009** phần sản phẩm | 🔴 còn nguyên | Trang chủ vẫn quảng cáo *"Launch your own chain"* và **"Takes about three minutes" ×7**; `/create-chain/` vẫn mời **Connect wallet**, không một dòng nào nói dịch vụ **đang đóng tới sau ngày G**. (`disabled` tìm thấy trong HTML chỉ là lớp Tailwind `disabled:opacity-55`, không phải thông báo) |
| **A-002 · A-004 · A-010** | 🔴 còn nguyên | chưa ai đụng |

## Quan sát mới — Q-6

Trên máy chủ đang chạy thêm **mạng tập 3 node** (`9chain-a1-tap-node-1..3`, `Up 2 phút`)
song song với 9 node công khai. Ba container đó **bind `0.0.0.0:9751-9753`**:

```
$ ss -tlnH | awk '{print $4}' | grep -v '^127\.'
*:443   *:80   0.0.0.0:22   0.0.0.0:9751   0.0.0.0:9752   0.0.0.0:9753
```

**Nhưng KHÔNG với tới được từ Internet** — đo có đối chứng dương:

```
9751 · 9752 · 9753 · 9651 · 9650  →  đóng/lọc
443 · 22                          →  MỞ        ← đối chứng: phép đo phân biệt được
```

⇒ Không phải lỗ hổng hôm nay. Nhưng thứ duy nhất chắn giữa ba node tập và Internet là
**một luật tường lửa không được khai ở đâu trong repo và không cổng nào canh**. Đổi luật
đó là ba node lên mạng mà **không một dòng mã nào thay đổi**.
