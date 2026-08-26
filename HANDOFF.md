# HANDOFF — 9Chain Testnet A1 (Avalanche)

Cập nhật: **2026-08-26** (chốt phiên) — 🟢 **RE-GENESIS 9 TỶ LOVE9 ĐÃ CHẠY XONG TRÊN MẠNG CÔNG KHAI.**
Mạng nay **9 node**, `supplyCap` **9.000.000.000**, phát hành genesis 5.400.000.000.
Đây là **lượt diễn tập** — 01/09 vẫn sinh lại lần nữa (khắc chữ + Block Adam chưa sẵn).
Tên miền `a1.9chain.org` / `rpc-a1.9chain.org` (tên cũ vẫn sống). M6 + M10 đóng.

## ▶ Phiên sau bắt đầu từ đâu

🔴 **ĐỌC `PROGRESS.md` TRƯỚC** — backlog nằm ở đó, không phải file này.
Kèm `DECISIONS.md` (vì sao làm vậy) và `BLOCKERS.md` (đang chờ David cái gì).

### Việc đầu tiên của phiên sau — ĐỌC MỤC NÀY TRƯỚC MỌI THỨ

## 🟢 1. RE-GENESIS 9 TỶ — ĐÃ CHẠY XONG 2026-08-26 (David duyệt chạy thẳng 1→6)

**Quyết định:** `DECISIONS.md` D-036 → D-044. Mạng công khai **đã sinh lại**.

### Nghiệm thu sau cutover (đo trên mạng công khai)

| Đo | Kết quả |
|---|---|
| tham số binary đang chạy | `supplyCap` **9000000000000000000** (cũ: 720000000000000000) |
| node | **9/9** chạy · **9/9 connected** qua Cloudflare |
| self-bond | **999.999 LOVE9/node**, cả 9 bằng nhau (đúng 1 mức giá trị) |
| `currentSupply ≤ supplyCap` | 4.301.076.227 ≤ 9.000.000.000 ✓ |
| giao dịch thật C-Chain | chốt **1,7s** rồi **2,2s**, status 1 |
| `smoke-l1.mjs` | **12/12 đạt** |
| faucet | ví mới, **99.999.999 LOVE9**, API sống, hạn mức 300/300 |
| chain-factory | nạp lại **8,99999173 LOVE9** trên P-Chain |
| 6 trang công khai | 200 hết |
| Blockscout | DB xoá sạch, index lại từ block 0 của chuỗi MỚI |

### Cái gì đã thay đổi trên server

- Image: `9chain-a1/node:dev` nay là bản 9 tỷ (`a850a016…`). Bản cũ giữ tag
  **`9chain-a1/node:pre-regen9-720m`** (`40d5e8f6…`, bản M8).
- `~/9chain-a1/net` = bộ 9 node mới · `~/9chain-a1/net-old-720m` = bộ 5 node cũ (giữ).
- `~/9chain-a1/net/.env`: **`A1_TRACK_SUBNETS` để RỖNG** (3 subnet cũ chết theo).
- `console.env`: `A1_L1_ADMIN` → `0xcD0D354A1DD2C105c85B45Dd2D7F38f1465Bd84C`
  (Foundation MỚI). Bản cũ ở `console.env.bak-720m`.
- Danh bạ L1 reset về `{"chains":[],"retired":[]}`; bản cũ ở
  `console-chains.json.bak-pre-regenesis` và trong repo tại `docs/archive/`.
- `9chain-a1-config/chains/`: xoá 16 thư mục config của chain đã chết.

### Trên máy dev

- `local-net/net-public` = **bộ đang chạy** (9 node, khoá mới, có `chain-factory-key.txt`).
- `local-net/net-public-dead-720m` = bộ mạng cũ, **giữ lại**, khoá đã vô dụng.
- Bảng địa chỉ công khai: `docs/ALLOCATION-PUBLIC.md`.
- 🔴 **`keys.txt` mới là điểm hỏng duy nhất** — D-044 chốt giữ sơ đồ cũ, **bản thứ hai
  do David tự cất**. Mất máy dev = mất khoá của cả 5 quỹ, không có đường khôi phục.

### ✅ Đã nghiệm thu lại TOÀN BỘ đường sản phẩm trên mạng mới (2026-08-26)

| bài | kết quả |
|---|---|
| `smoke-l1.mjs --create-chain` | **25/25 ĐẠT** — đẻ chain thật 305,5s · giao dịch chốt 4,2s · tự thu hồi 293,4s |
| `warp-test.mjs` | **21/21 ĐẠT** — 2 L1 (9102↔9103), Warp precompile sống, API Warp bật |
| `bridge-test.mjs` | **27/27 ĐẠT** — **7 LOVE9 rời chain 9104, xuất hiện ở ví trắng trên 9105** |
| danh bạ sau cùng | **0 sống · 6 đã thu hồi** — mọi bài tự dọn, không chain mồ côi |
| gián đoạn C-Chain | đẻ: 611 lượt/hỏng 1/**dài nhất 0,5s** · thu hồi: 587 lượt/hỏng 1/**0,5s** |

Ba đòn tấn công của `bridge-test` vẫn bị chặn đúng trên mạng mới: phát lại message
⇒ revert · bỏ predicate ⇒ revert · **đòn rút sạch của bản cũ** ⇒ revert
`sai hop dong nguon`, và **không một đồng nào rời thanh khoản**.

✅ **9Scan-A1 ĐÃ ĐƯỢC BÁO THẬT** (David uỷ quyền ghi thẳng vào repo họ): commit
`5be74f7` trong `C:\PROJECTS\9Scan-A1` — toàn văn ở `docs/requests/2026-08-26-A1-da-re-genesis.md`
của họ, kèm con trỏ ở **đầu `HANDOFF.md`** của họ. Bản bên mình giữ ở
`docs/requests-from-9scan/2026-08-26-A1-da-re-genesis-BAO-CHO-9SCAN.md`.

🔴 **Trong lúc báo, phát hiện một kết luận SAI của 9Scan đang chặn họ — đã đính chính.**
`HANDOFF.md` của họ khẳng định *"108 triệu mà tài liệu khai không tồn tại trên chain"*
và tự đặt luật *"explorer TUYỆT ĐỐI không in con số nào từ `TOKENOMICS.md`"*. Ba địa chỉ
họ đo lấy từ **`local-net/net/allocation.md` = bộ DEV LOCAL**, không phải mạng công khai
(`net-public/`). Bằng chứng: họ tìm thấy 18.000.000 ở `0x574849d4…` và ghi *"không phải
địa chỉ faucet"* — đó **chính là ví faucet mạng công khai cũ**, đúng cả địa chỉ lẫn số tiền
(đối chiếu `docs/archive/allocation-pre-regenesis-2026-08-26.md`).
⚠️ **Lỗi ở cách bày file BÊN MÌNH:** luật "đừng lẫn hai bộ" có trong HANDOFF này nhưng nằm
ở mục *Bí mật*, nên người đi tìm bảng phân bổ mở nhầm file gần như chắc chắn.
✅ **ĐÃ SỬA 2026-08-26:** cảnh báo nay đứng cạnh **mọi** chỗ nhắc `allocation.md`
(`docs/ALLOCATION-PUBLIC.md` · `docs/TOKENOMICS.md` · `docs/VI-VAN-HANH.md` ·
`local-net/gen-network.sh` in ra lúc sinh mạng), và `docs/TOKENOMICS.md` nay mở đầu bằng
banner "file này đã cũ" trỏ sang nguồn sự thật.
⚠️ Phần **số dư 20M/70M có thật hay không thì KHÔNG còn kiểm lại được** — chuỗi cũ và DB
Blockscout đều đã xoá. Đã ghi rõ mức tin cậy đó cho họ.

🔴 **Nhớ: đây mới là DIỄN TẬP.** 01/09 sinh lại lần nữa. Khoá hiện tại sống tới ngày G.

**Bảng phân bổ (D-042), tổng 9.000.000.000 LOVE9:**
| Hạng mục | % | LOVE9 |
|---|--:|--:|
| Staking Rewards | 40 | 3.600.000.000 — **KHÔNG cấp ở genesis**, mint dần |
| Community | 30 | 2.700.000.000 — faucet nóng 99.999.999 (100% C-Chain) + 2.600.000.001 khoá 2 năm |
| Foundation | 12 | 1.080.000.000 — self-bond 8.999.991 (**địa chỉ riêng**) + 1.071.000.009 |
| Private Sale | 9 | 810.000.000 — khoá 2 năm |
| Team | 9 | 810.000.000 — khoá 4 năm |

Phát hành genesis **5.400.000.000** (60%) · **9 node** × self-bond **999.999** ·
nhiệm kỳ 365 ngày, so le 7 ngày/node.

### ✅ DIỄN TẬP CỤC BỘ ĐÃ CHẠY THẬT 2026-08-26 (David duyệt) — ĐẠT

Dựng **9 node trên máy dev**, mạng riêng `net-drill9`, không đụng server. Kết quả:

| Đo | Kết quả |
|---|---|
| binary có tham số mới | `supplyCap` **9e18** · `maxValidatorStake` 625e15 · `minValidatorStake` 25e12 · `minDelegatorStake` 312,5 |
| validator | **9/9 connected** ngay lượt đo đầu |
| self-bond | **999.999 LOVE9 × 9 = 8.999.991**, chín node bằng nhau tuyệt đối |
| nhiệm kỳ so le | 2027-07-01 → 2027-08-26, **đúng 7,0 ngày/bậc**, trải 56 ngày |
| khoá genesis cưỡng chế | quỹ Team 810.000.000 → `unlocked: 0`, `lockedStakeable: 810.000.000` |
| C-Chain | chainId 9000000009 · Foundation 1.000.000.000 · faucet 99.999.999 |
| giao dịch thật | `probe-l1.mjs` → **chốt 0,1s, block 1, status 1** |
| log 9 node | **0 ERROR · 0 WARN**, `/ext/health` healthy=true |

🔴 **`platform.getCurrentSupply` = 4.301.076.227 LOVE9, KHÔNG phải 4.300.000.001** —
lệch **+1.076.226**. Đừng tưởng sai: đó là **tổng thưởng dự kiến của 9 validator
genesis**, avalanchego cộng thẳng vào supply lúc thêm validator. Đã đối chiếu từng
node bằng trường `potentialReward` → khớp **tuyệt đối tới đơn vị cuối**
(1.076.226.149.636.784 nLOVE9). `InitialSupply()` (`genesis/config.go:146`) chỉ cộng
X/P, **không** cộng C-Chain — nên đừng so nó với tổng phát hành 5,4 tỷ.

⚠️ **D-042 ước "mỗi năm chỉ đúc cỡ 700 nghìn LOVE9" — đo thật cao hơn ~50%.**
Thưởng dự kiến năm đầu là **1.076.226 LOVE9** cho 9 node (nhiệm kỳ trung bình ~330
ngày; quy về 365 ngày là ~1,19 triệu). Cùng bậc độ lớn, kết luận của D-042 (cung
thật sẽ nằm quanh 5,4 tỷ chứ không phải 9 tỷ) **không đổi** — chỉ con số minh hoạ sai.

**Chưa chứng minh được ở diễn tập cục bộ** (phải chờ mạng công khai): đẻ L1 qua
console · Warp/ICM · faucet HTTP · Blockscout index lại từ đầu.

**Đã kiểm được (không phải "trông có vẻ đúng"):**
- `node scripts/check-consistency.mjs --tu-kiem` → **17 đạt · 6/6 đối chứng ngược bắt được**
  🔴 nhưng xem cảnh báo ngay dưới: cổng này **không đọc một dòng Go nào**.
- Patch series tái lập đúng cây nguồn: tree **`ac260a38`** (**12 patch** tính tới
  2026-08-26; nhớ **`git am --keep-cr`**). Đã nghiệm thu lại sau patch 0009: áp đủ
  12 patch lên `1cf1fc3` trong worktree tách rời → tree ra **khớp tuyệt đối**.
  *(Patch 0010 = cơ chế khắc chữ · 0011 = `engrave-verify` đọc ngược. Xem `docs/KHAC-CHU-NGAY-G.md`.)*

🔴 **CỔNG `check-consistency.mjs` KHÔNG BAO TRÙM MÃ — nó giữ bảng số riêng bằng JS.**
"17 đạt" chứng minh các CON SỐ David chốt nhất quán với nhau, **không** chứng minh
gì về mã sẽ sinh ra genesis. Bằng chứng: bản tokenomics 9 tỷ đi qua cổng này sạch
trong khi **netgen không biên dịch được** (`bk.Percent undefined` — cf5a54b đổi tên
trường mà bỏ sót hai nơi dùng). Đã vá; nay netgen đọc `SupplyCap` thẳng từ
`genesis.A1Params` và có cổng `mustFitSupplyCap()` riêng.

## 🔴 1b. KẾ HOẠCH CŨ THIẾU MỘT BƯỚC — PHẢI BUILD LẠI IMAGE NODE

Bản HANDOFF trước ghi bước còn lại chỉ có netgen + `down -v`. **Thiếu.** `SupplyCap`
là hằng số **biên dịch vào binary**, không đọc từ `genesis.json` (fork cố ý xếp 9001
cùng nhóm Mainnet/Fuji ở `config/config.go:807` để cờ `--stake-supply-cap` vô hiệu).
Server hiện chạy binary cũ — đo được: `"supplyCap":720000000000000000`.

Nạp genesis 5,4 tỷ lên binary đó thì `reward/calculator.go:56`
`remainingSupply := c.supplyCap - currentSupply` trừ `uint64` **thô**, tràn ngược
thành **13.766.744.073 LOVE9** (lớn hơn cả trần 9 tỷ), và
`SetCurrentSupply(currentSupply + reward)` vượt luôn `uint64`. Lập luận của D-039
*"cộng `uint64` thô không thể tràn"* chỉ đúng **khi `currentSupply ≤ supplyCap`**.
**Không tầng nào bắt được**: avalanchego không kiểm `initialSupply ≤ supplyCap` ở
bất kỳ đâu — node khởi động sạch, RPC xanh, smoke xanh, sai lệch chỉ lộ ở phần
thưởng staking nhiều ngày sau.

**Bước còn lại — CHƯA CHẠY TRÊN SERVER, cần David gật:**
```bash
# 0) BẮT BUỘC TRƯỚC TIÊN — build lại image node có SupplyCap 9 tỷ, rồi deploy
docker build -f local-net/Dockerfile -t 9chain-a1/node:dev .
# 1) sinh mạng 9 node + keys.txt MỚI
A1_NET_DIR=local-net/net-public bash local-net/gen-network.sh 9
# 2) rồi: docker compose ... down -v && up -d + nạp lại faucet.env, ví chain-factory
# 3) đối chứng NGAY sau khi node lên, trước khi mở cho ai dùng:
#    docker logs 9chain-a1-node-1 | head -1 | grep -o '"supplyCap":[0-9]*'
#    -> PHẢI ra 9000000000000000000, không phải 720000000000000000
```
🔴 **Nó xoá:** chain data 9 node · **DB Blockscout** · 3 L1 hiện có (David đã duyệt
D-037) · và sinh **bộ khoá quỹ MỚI** ⇒ `keys.txt` cũ vô dụng. Mạng công khai đứng rồi
quay lại là **một mạng khác**: cùng `chainId 9000000009` nhưng số dư/nonce mọi ví reset.

⚠️ **Lượt này là DIỄN TẬP.** 01/09 vẫn phải sinh lại lần nữa (khắc chữ + Block Adam
chưa sẵn). Nên khoá sinh ra lần này chỉ sống tới ngày G — nhưng **vẫn là khoá của mạng
công khai trong 6 ngày**. D-036: sinh lại mạng là **cơ hội một lần** chốt sơ đồ custody.

## 🔴 2. BLOCK ADAM CÓ THỂ KHÔNG TỒN TẠI — đã đo, chưa có đối sách

A1 khắc Block Adam = block đầu tiên vượt `2026-09-09T06:09:09Z`. **Đo 10 mẫu/5 phút
trên mạng công khai lúc rảnh: P-Chain đứng yên ở 330, C-Chain 0x73 — không một block
nào.** Avalanche không đẻ block rỗng, và điều đó đúng **cả với P-Chain**.
⇒ Luật "block đầu tiên vượt mốc" có thể **không có block nào để trỏ vào** hàng giờ.
**Phải diễn tập giao dịch nghi lễ trước 09/09**, nếu không sai lầm chỉ lộ đúng ngày đó.
Xem `BLOCKERS.md` H-8.

## 3. Việc `[human]` cũ vẫn còn nguyên
- **validator thứ sáu ở nhà cung cấp KHÁC** — 9 node vẫn trên **một máy, một nhà cung
  cấp**. Câu "một máy chủ đội lốt một mạng" áp y nguyên cho 9 node như cho 5.
- **H-7 IPv6 hay IPv4 đa cổng** cho node beacon (M3).
- `keys.txt` bản thứ hai offline — **sẽ đổi bản chất sau re-genesis**: khoá cũ thành
  vô dụng, nên đây là bài toán **thiết kế custody** chứ không phải sao lưu (D-036).

**5. Backlog phần mềm ĐÃ CẠN.** M10.1–M10.6 xong, M10.7 xong phần đo được (còn
một mục chờ 9Scan đưa `/chains/` của họ lên). Không còn task nào chạy được mà không
cần người. Muốn nạp việc mới thì dùng skill `feed-autopilot`.

🔴 **GỐC `/` NAY LÀ TRANG CHỦ THẬT (bản C, David chọn 2026-08-26), KHÔNG còn là
Blockscout.** Caddy khớp **đúng `/`** chứ không phải `/*` — Blockscout vẫn phục vụ
`/tx/…`, `/address/…`, `/blocks`, `/api/…` như cũ (đã đối chứng sau khi đổi).
**Gỡ nhanh:** xoá khối `@trangchu` trong Caddyfile rồi `caddy reload`.

**Trang công khai:** `/` (trang chủ) · `/faucet/` · `/create-chain/` · `/my-chains/`
· `/compare/` · `/chains/` · `/console/` (console cũ, không còn trong thanh điều hướng).
URL cũ, tất cả 301: `/lite/` → `/` · `/dashboard/` → `/compare/` · `/de-chain/` →
`/create-chain/` · `/chain-cua-toi/` → `/my-chains/` · `/bang/` → `/compare/`.
Đã TẮT (không xoá): `9chain-a1-explorer` :8082 · `9chain-a1-dashboard` :8092.

### ⏰ Hẹn giờ đã biết
**Cả 5 validator hết hạn `2027-08-24`** (đo 2026-08-25, còn 364 ngày). Đúng ngày đó
mạng DỪNG nếu không gia hạn. Uptime hiện 99,96–100%.

### ✅ Soak 3 giờ — ĐÃ XONG 2026-08-25 08:22 UTC, đạt
| | |
|---|---|
| chốt vào block | **2.272.500 giao dịch** — **210,4 TPS** liên tục 180 phút |
| lỗi gửi | **0** / 2.273.640 |
| block sinh ra | 5.400 (420,8 tx/block) |
| RPC C-Chain công khai trong suốt đợt tải | p50 **19ms** · p95 222ms · **hỏng 0/1830 lượt** |
| đĩa | còn trống 91% |

🔴 **Sửa một con số sai trong HANDOFF cũ:** "đĩa ~2,2 GB/giờ ở 252 TPS" là **ước lượng
sai từ mẫu quá ngắn**. Đo thật cả 3 giờ: chain data một node đi từ **1,6 GB → 1,8 GB**,
tức ~**70 MB/giờ** ở 210 TPS — nhỏ hơn 30 lần. Dung lượng đĩa **không** phải ràng buộc.

⚠️ **Đợt tải này KHÔNG tự thu hồi chain** (nó chạy trên chain có sẵn nên cố ý giữ lại):
log ghi `giữ lại chain "(chain có sẵn)"`. L1 đó vẫn chiếm một slot.

### Phiên 2026-08-26 (đợt 4) — ĐỔI TÊN MIỀN + icon LOVE9

🔴 **TÊN MIỀN NAY LÀ `a1.9chain.org` / `rpc-a1.9chain.org`** (David chốt: ngắn cho
người dùng đỡ gõ). Tên cũ **KHÔNG chết**:
- `testnet-a1.9chain.org` → **308** sang tên mới, giữ nguyên đường dẫn.
- `rpc-testnet-a1.9chain.org` → **phục vụ y hệt** tên mới, cùng một site block.

🔴 **RPC cũ PHỤC VỤ chứ không REDIRECT — có chủ ý.** Ví gọi RPC bằng POST, mà
redirect trên POST thì mỗi client xử lý một kiểu và MetaMask chỉ báo "Unable to
connect", không nói vì sao. Một tên RPC đã phát ra ngoài thì phải phục vụ thật, hoặc
chết hẳn. Tên miền TRANG thì ngược lại, **phải** redirect — xem gotcha SIWE bên dưới.

**Tên miền nay VIẾT THẲNG trong Caddyfile, bỏ `{$DOMAIN}`/`{$RPC_DOMAIN}`.** Caddy chỉ
đọc env lúc container khởi động ⇒ đổi tên miền bằng env là buộc `--force-recreate`
(Caddy chết vài giây, MetaMask hiện "Unable to connect" và **giữ nguyên banner**).
Viết thẳng thì `caddy reload` là đủ. Hai biến đó trong `caddy.env` nay **vô tác dụng**.

**Icon LOVE9 đã có** (David đưa bộ logo kit): `web/public/brand/` — SVG + PNG
24→512px, đồng navy/gold với hệ token. Dùng ở hai chỗ: `iconUrls` của
`wallet_addEthereumChain`, và favicon (trước đó trang **không có favicon nào**).
🔴 **ĐÃ ĐO XONG 2026-08-26 — `iconUrls` KHÔNG ĂN VỚI TOKEN GỐC. ĐỪNG THỬ LẠI.**
Tham số này có trong chuẩn EIP-3085 **và** trong ví dụ của chính tài liệu MetaMask,
nên đọc tài liệu thì tưởng làm được. Đo thật: thêm mạng thành công (màn xác nhận
"Update 9Chain Testnet A1" hiện đúng Network + RPC, **không hiện icon nào**), mở tab
Tokens — LOVE9 **vẫn là vòng tròn xám chữ "L9"**. MetaMask không cho đặt icon cho
token **GỐC**. Dòng `iconUrls` GIỮ LẠI (đúng chuẩn, không tốn gì, ăn ngay nếu ví nào
chịu vẽ) — cái đắt là phép đo, đã ghi ở `web/lib/chain.ts`.
Đường còn lại, cả hai đều tệ hơn cái được: ERC-20 thì `wallet_watchAsset` nhận `image`
thật, nhưng LOVE9 là coin gốc nên phải đẻ bản wrap (WLOVE9) — đổi kiến trúc token chỉ
để lấy một icon; còn registry của MetaMask thực tế chỉ dành cho mainnet.
⇒ Chỗ ta THẬT SỰ kiểm soát nhận diện là trang của mình + explorer 9Scan-A1.

**Đã đổi theo:** console (domain SIWE) · Blockscout (`NEXT_PUBLIC_*` + nút "Add
network to MetaMask" nay trỏ `rpc-a1`) · 12 file nguồn · HANDOFF + memory.

**Nghiệm thu:** 5/5 tên miền đúng vai · smoke-l1 **14/14** · web-deploy **6/6 liên kết
sống** · ảnh thương hiệu trả đúng `image/png`+`image/svg+xml` · Blockscout `/blocks`
76 KB + `/api/v2/stats` JSON · SIWE khai `a1.9chain.org`.

🔴 **MỘT KẾT LUẬN SAI CỦA TÔI, ĐÃ TỰ SỬA — đáng nhớ vì nó đọc rất xuôi tai.** Thêm
site block xong: `a1.9chain.org` lên ngay (525→200) nhưng `rpc-a1.9chain.org` **vẫn
525**, ổn định qua nhiều lượt đo. Cộng thêm: log Caddy đếm được **0** request mang
host đó trong khi tên cũ vẫn tới. Tôi kết luận "Cloudflare trỏ tên đó đi chỗ khác,
David phải sửa DNS" — **và đã lùi cả lượt deploy về**. Sai. Vài phút sau nó tự lên 200
mà không ai đụng gì. Xem gotcha ngay dưới.

### Phiên 2026-08-26 (đợt 5) — CHUẨN HOÁ TIẾNG ANH

🔴 **David chốt: URL, tên tệp và KHOÁ JSON phải bằng tiếng Anh.** Định danh mã nguồn
(hàm, component, prop, khoá i18n) **vẫn tiếng Việt** — đó là nếp nhà, và đổi hết là
một cuộc mổ khác hẳn mà David không yêu cầu.

**Bảng đổi tên — tra khi đọc mục cũ trong file này hay trong `PROGRESS.md`:**

| Cũ | Mới |
|---|---|
| `/de-chain/` · `/chain-cua-toi/` · `/bang/` | `/create-chain/` · `/my-chains/` · `/compare/` (301) |
| `/thuong-hieu/` | `/brand/` |
| `GET /api/tien-trinh` | `GET /api/progress` |
| `GET /faucet/api/thongtin` | `GET /faucet/api/info` |
| `kiem-cong.sh` · `kiem-lien-ket.mjs` · `kiem-a11y.mjs` · `kiem-ngan-sach.mjs` · `kiem-xuat-tinh.mjs` | `check-ports.sh` · `check-links.mjs` · `check-a11y.mjs` · `check-budget.mjs` · `check-static-export.mjs` |
| `tai-test.mjs` · `cau-test.mjs` · `warp-chung.mjs` | `load-test.mjs` · `bridge-test.mjs` · `warp-common.mjs` |
| `cau-tai-san.mjs` · `CauTaiSan.sol` · `bien-dich.mjs` | `asset-bridge.mjs` · `AssetBridge.sol` · `compile.mjs` |
| `ket-noi-vi.ts` · `soLieu.ts` · `dong-bo-token.mjs` | `wallet.ts` · `stats.ts` · `sync-tokens.mjs` |
| `ManDeChain` · `ManChainCuaToi` · `BangSoSanh` · `BangChain` · `SoLieuMang` | `CreateChainScreen` · `MyChainsScreen` · `ComparisonTable` · `ChainTable` · `NetworkStats` |
| khoá JSON `dangChay` `loai` `ten` `buoc` `ma` `nhan` `trangThai` `loi` `giayDaChay` `uocConLaiGiay` `luuY` `presetTen` | `running` `kind` `name` `steps` `code` `label` `status` `error` `secondsElapsed` `etaSeconds` `notes` `presetName` |
| giá trị enum `"tao"/"thuHoi"` · `"cho"/"chay"/"xong"/"hong"` | `"create"/"revoke"` · `"pending"/"running"/"done"/"failed"` |

🔴 **Contract Solidity đổi CẢ tên tệp lẫn tên contract, và artifact đã sinh lại.**
Vân tay nguồn đi từ `62971b14e79720e0` → **`51b44e1f3f29f762`**. Trong Solidity tên tệp
và tên contract gắn với nhau (`compile.mjs` tra `contracts["<tệp>.sol"]["<Contract>"]`),
nên đổi một nửa là để lại một cái bẫy. Tên export trong artifact (`CAU_TAI_SAN_*`) giữ
nguyên — đó là định danh mã nguồn, không phải tên tệp.

🔴 **DI TRÚ DỮ LIỆU ĐÃ CHẠY, đừng làm lại:** `console-chains.json` trên server có
**17 bản ghi** mang khoá cũ `presetTen`; đã đổi sang `presetName` (có `.bak-<epoch>`
cạnh file). Bản ghi ĐÃ ĐẺ không bao giờ được console viết lại, nên đổi khoá bên sinh
mà không di trú là **nhãn preset biến mất khỏi danh bạ** — không lỗi, chỉ mất chữ.
Hai nơi đọc vẫn giữ nhánh `presetName ?? presetTen` làm bảo hiểm cho trường hợp phục
hồi từ backup cũ hơn mốc này.

**Nghiệm thu:** typecheck sạch · web 12/12 · SIWE 21/21 · auth-e2e 38/38 ·
build a11y 6/6 · web-deploy 6/6 liên kết sống · smoke-l1 **14/14** · `check-ports.sh`
sạch · 3 route cũ đều 301 · `/api/tien-trinh` nay **404** đúng như mong đợi.

⚠️ **9Scan-A1 cũng đổi tên miền trong cùng đợt** (yêu cầu của họ ở
`docs/requests-from-9scan/2026-08-26-doi-ten-mien-a1.md`): `testnet-a1.9scan.org` →
**`a1.9scan.org`**, tên cũ 308. Khối site của họ nằm trong Caddyfile của repo NÀY, nên
lượt `caddy-deploy.sh` của A1 áp luôn cả phần đó — đã đối chứng bằng `<title>` là trang
9Scan thật, không phải trang A1 (đúng chỗ B-6 từng gãy). `explorerGoc()` bên A1 nay
trỏ thẳng tên mới thay vì đi qua redirect.

### Phiên 2026-08-26 (đợt 3) — David chọn bản C, trang chủ lên gốc

**M10.3 đóng.** Bản C thay `web/app/page.tsx`; bản A, bản B và `ThanhChon.tsx` đã gỡ.
**Gốc `/` đổi chủ**: Caddy khớp đúng `/` (không phải `/*`), nên Blockscout giữ nguyên
mọi đường dẫn sâu. Đối chứng sau khi đổi: `/blocks` vẫn là HTML Blockscout 76 KB.
**M10.7 mở khoá thêm một mục**: `/lite/` → `/`, `/dashboard/` → `/bang/`, cả hai 301.

**Đã TẮT hai container cũ** `9chain-a1-explorer` (:8082) và `9chain-a1-dashboard`
(:8092) — không còn đường vào nào sau khi `/lite/`, `/dashboard/` thành redirect.
`docker stop`, KHÔNG `rm`; bật lại bằng `docker start <tên>`.
🔴 Kiểm trước khi tắt: Caddyfile có đường lui `A1_ROOT_UPSTREAM` cho gốc và chú thích
cũ ghi mẫu là `:8082` — đúng container sắp tắt. `caddy.env` thật đang là `:8100`
(Blockscout) nên an toàn. Đã sửa chú thích, vì một đường lui trỏ vào thứ đã chết chỉ
lộ ra đúng lúc có sự cố cần dùng tới nó.

### Phiên 2026-08-26 (autopilot — M10.3 → M10.7) làm xong

**M10.3** ba biến thể trang chủ (`/tc-a|b|c/`, trang chọn ở `/moi/`) — mô tả mỗi bản
nói cả **điểm yếu**. Số liệu sống thật: 5/5 validator · 2 L1 · block C-Chain.
**M10.4** màn đẻ chain: console có `GET /api/tien-trinh`; nghiệm thu bằng chain THẬT
→ 8/8 bước, **5 node lần lượt** đúng thứ tự, mỗi node 31–33s.
**M10.5** "Chain của tôi" + thu hồi: **đã thu hồi THẬT một chain từ giao diện** bằng
đường thật (chữ ký ví thật, mọi API thật).
**M10.6** bảng A1↔C1: C1 vắng hiện ra như **vắng**, không như hỏng; có câu tự tố
*"điểm là đội tự chấm"*.
**M10.7** phần đo được: **10/10 liên kết sống**, kiểm tự động cuối `web-deploy.sh`.

🔴 **PHÁT HIỆN ĐẮT NHẤT CỦA ĐỢT NÀY — Cloudflare cắt POST ở ~100 giây (HTTP 524),
mà đẻ/thu hồi chain mất ~170 giây.** Qua tên miền công khai, lượt POST **LUÔN hỏng**
trong khi server vẫn chạy tới cùng và **thành công**. Đo thật: thu hồi từ giao diện
→ nhận 524 → màn hình báo *"Không thu hồi được"*, trong khi danh bạ **đã ghi chain
vào `retired`**. Với đẻ chain thì tệ hơn: người dùng bấm lại một việc đã xong, chain
thừa ăn mất một slot trong trần 15 **và giữ vĩnh viễn tên + chainId**.
⇒ Cả hai màn nay coi kết quả POST là **không kết luận được**: đọc `/api/tien-trinh`
tới khi lượt chạy kết thúc, rồi hỏi **danh bạ** xem sự thật là gì.

🔴 **Bốn lỗi tôi tự gây rồi tự sửa trong đợt này** (chi tiết ở PROGRESS + Gotchas):
1. **Deploy console giữa lúc đang thu hồi** ⇒ rollout xong nhưng console chết trước
   khi ghi danh bạ ⇒ **danh bạ nói dối**. `console-deploy.sh` nay từ chối restart khi
   có lượt đang chạy.
2. **`rm -rf` chính thư mục đang bind-mount** ⇒ container thấy thư mục **rỗng vĩnh
   viễn** trong khi host đủ file.
3. **Bài kiểm liên kết chỉ đo mã HTTP** ⇒ **xanh giả**, vì Blockscout là SPA trả 200
   kèm khung rỗng cho mọi đường lạ.
4. **Đặt route `/faucet/*` trước `@faucet_api`** ⇒ API faucet 404 trong khi trang vẫn
   hiện bình thường.

### Phiên 2026-08-25 (thứ NĂM, đợt 2 — giao diện) làm xong

🔴 **M10.1 + M10.2 XONG.** Có `web/` (Next 15 xuất tĩnh · Tailwind v4 · TS · bộ
component TỰ VIẾT, không shadcn/MUI/Radix). `pnpm build` sạch · **axe-core 3/3
trang** · `pnpm test` **12/12** · typecheck sạch · JS **149,7 KB gzip/trần 160**.

🔴 **Không thiết kế mới — token CHÉP từ 9Scan-A1** bằng
`web/scripts/sync-tokens.mjs`, kèm test bắt trôi lệch (vân tay `535cbf6329efb6d0`).

🔴 **Faucet đã ra khỏi chuỗi JS.** `faucet/server.mjs` nay chỉ còn API. Nghiệm thu
**bằng trình duyệt thật, khổ 375×812, qua Cloudflare**: xin được **10 LOVE9 thật**,
đối chứng `eth_getBalance` = 10,0. Hạn mức trên màn đi 5/5 → 4/5.
Mới: `GET /faucet/api/thongtin` hiện hạn mức **TRƯỚC khi bấm** (trước đó người dùng
chỉ biết khi ăn lỗi 429), dùng `rateLimit().peek()` để **không tiêu suất khi đọc**.

🔴 **SỰ CỐ TÔI GÂY RA (đã sửa trong ~2 phút): tên miền 9scan trỏ nhầm sang trang
A1.** Một lệnh thay-hàng-loạt `8094→8095` (đổi cổng cho container mới của A1) kéo
theo cả dòng `reverse_proxy` của khối `testnet-a1.9scan.org` — cổng 8094 là của
`9scan-a1-web`, **dự án khác trên cùng máy chủ**. Tệ hơn: `caddy-deploy.sh` vẫn in
**"✓ testnet-a1.9scan.org → 200"**, vì nó chỉ đo **MÃ HTTP**, không đo **AI đang
phục vụ**. Cùng họ với B-6 và cùng bài học: nghiệm thu phải chạm vào NỘI DUNG.

🔴 **Hai lần tôi tự bắt mình sai trong đợt này:**
1. **`rm -rf` chính thư mục đang bind-mount** ⇒ Docker giữ inode cũ ⇒ container
   thấy **thư mục rỗng vĩnh viễn** trong khi host đủ file. Bẫy inode đã ghi trong
   file này, nhưng ghi cho **file đơn lẻ**; ở dạng **thư mục** thì không ai ngờ.
   `web-deploy.sh` nay xoá NỘI DUNG (giữ thư mục) và **đếm số tệp hai bên** để bắt.
2. **Đọc DOM ngay sau `.click()`** rồi tưởng ngăn kéo mobile hỏng — React cập nhật
   state bất đồng bộ, nên phép đo đọc trạng thái TRƯỚC render. Gọi thẳng handler
   của React mới tách bạch được "lỗi ở sản phẩm" với "lỗi ở phép đo". Sản phẩm đúng.

**Cổng trên máy chủ này là tài nguyên DÙNG CHUNG với 9Scan-A1** và không có bảng
nào ghi ai giữ cổng nào. Trước khi thêm dịch vụ: `sudo ss -tlnp | grep 127.0.0.1`.

### Phiên 2026-08-25 (thứ NĂM) làm xong — tóm tắt để khỏi mở file

🔴 **M6.2 XONG — TÀI SẢN ĐI ĐƯỢC GIỮA HAI L1.** Hai bài trên mạng công khai:
`warp-test.mjs` **21/21** (message được xác minh ở đầu kia) và `bridge-test.mjs`
**20/20** (7 LOVE9 rời chain 9135, xuất hiện ở ví trắng trên chain 9136). Cả hai
**tự thu hồi cả hai chain** ⇒ chạy lại được vô hạn. Xem D-034.

🔴 **Việc chặn thật của M6.2 nằm ở CẤU HÌNH, không ở hợp đồng: API Warp TẮT MẶC
ĐỊNH.** Đã đo: chain đẻ trước thay đổi này trả `-32601 the method warp_getMessage
does not exist/is not available`. Đường đã làm: netgen + compose khai
`--chain-config-dir=/9chain-a1/config/chains`, console ghi
`chains/<blockchainID>/config.json` **NGAY TRƯỚC** đợt rolling restart (node đọc file
đó đúng lúc dựng chain, tức trong chính đợt restart ấy).

**Dọn 4 chain rác, lấy lại 4 slot.** `Smoke7M7Q3D/MLSCV/NJW7T` (smoke test đẻ trước
khi M4.4 có tự-thu-hồi) + `Tai7OQB7` (soak bỏ lại). Đo trong lúc dọn: **4 lượt thu
hồi → 3 lần gián đoạn, dài nhất 1s, tổng 2,4s, hỏng 4/2002 lượt (0,2%)**.
Danh bạ nay **2 L1** (OmegaChain, OwnerTest) — còn **13 suất**.

🔴 **Ba lần tôi tự bắt mình sai trong phiên này:**
1. **Đặt module cần `ethers` vào `local-net/lib/`** ⇒ `ERR_MODULE_NOT_FOUND` trên
   server. Đúng cái gotcha đã ghi sẵn trong file này (ethers chỉ có trong
   `local-net/faucet/node_modules`) mà vẫn dẫm. Đã chuyển sang `faucet/warp-common.mjs`.
2. **`ContractFactory.deploy()` tự quản nonce** ⇒ đi vòng qua `guiVoiNonce` ⇒
   `nonce too low: next nonce 1, tx nonce 0`. Bọc nonce cho "mọi lượt gửi" chỉ đúng
   khi thật sự là mọi lượt. Và vì bài kiểm ghi tên chain vào sổ dọn **sau** bước đó,
   lượt chạy hỏng để lại một **chain mồ côi** ăn một slot (đã dọn).
3. **`pgrep -f "[t]ai-test"` vẫn tự khớp** — vì dòng lệnh của tôi có `echo "... tai-test ..."`
   ở ngay cạnh. Mẹo ngoặc vuông chỉ che chuỗi TRONG mẫu, không che chuỗi ở chỗ khác
   trên cùng dòng lệnh.

**Cần David biết (không chặn gì):** API Warp nay **gọi được từ Internet** — Caddy
lọc theo **path** chứ không theo **method**, mà `/ext/bc/*/rpc` đã cho phép. Gom chữ
ký là một vòng P2P tới 5 validator ⇒ điểm khuếch đại tải. Và chú thích đầu Caddyfile
ghi *"LỌC PATH + hạn mức"* trong khi **không có directive hạn mức nào** cho tên miền
RPC — chữ và thực tế đã lệch từ trước phiên này.

### Phiên 2026-08-25 (thứ tư) làm xong — tóm tắt để khỏi mở file

🔴 **CONSOLE ĐÃ CÔNG KHAI: https://a1.9chain.org/console/** (David duyệt).
Đăng nhập bằng chữ ký ví. **H-3 đóng, M4.5 xong.** Ba việc phải làm CÙNG LÚC và thứ
tự đó bắt buộc: route Caddy · `A1_TRUST_PROXY=1` · siết 443 về Cloudflare. Thiếu cái
thứ ba thì cái thứ hai **là lỗ hổng chứ không phải bản vá**.

🔴 **M7.2 — siết 443 về dải Cloudflare. Nó vá một lỗ ĐANG MỞ, không phải dọn dẹp.**
Đo trước khi vá: nối thẳng vào IP máy chủ kèm `CF-Connecting-IP: 1.2.3.4` thì
`/faucet/whoami` trả `{"ip":"1.2.3.4"}` — **faucet tin IP bịa**, hạn mức vượt qua được
bằng cách xoay IP giả. Nay mọi kết nối không từ Cloudflare ăn 403. Xem D-032.

🔴 **SỰ CỐ TÔI GÂY RA: explorer chết 31 phút.** Lượt deploy Caddy của M7.2 xoá mất
site block `testnet-a1.9scan.org` (nó **chưa bao giờ vào nguồn**, chỉ áp thẳng lên
server hồi M6 của bên explorer) ⇒ hết cert zone `9scan.org` ⇒ 525. Đã sửa gốc: khối
vào nguồn, và `caddy-deploy.sh` nay tự kiểm **mọi tên miền**, danh sách suy từ chính
Caddyfile vừa áp. B-6. **Lỗi của tôi là nghiệm thu thứ mình BIẾT có trong file, chứ
không nghiệm thu thứ file THẬT SỰ phục vụ.**

**M5 đóng — 40/40** trên mạng công khai, 4 chain thật, mỗi chain tự thu hồi.
**B-3 gỡ:** `minBaseFee: 0` qua được `Verify()` nhưng làm chain **không dựng nổi
block nào** (D-028 — đọc cả phần tự đính chính trong đó). **B-4 gỡ** (D-029).
**M5.4:** console trả `luuY`; **loại** hướng "server tự gửi giao dịch mồi" vì nó đòi
một tài khoản Foundation nằm vĩnh viễn trong genesis bất biến (D-030).

**M6.1** — Warp vào khuôn genesis mọi chain (D-031). Bẫy: `blockTimestamp` phải
**≥ 1607144400**, không được là 0 như mọi precompile khác.

**M9.4 đo xong, và nó ĐÍNH CHÍNH M9.3.** Nâng `gasLimit` 12M→60M (trần lý thuyết
285→1.428 TPS) mà thông lượng **không tăng**: 207–230 TPS, block chỉ đầy **16%**.
Nút thắt là **đường nạp giao dịch của node ~230 tx/s**, không phải genesis. Đã loại
trừ Cloudflare và gộp-lô-ethers bằng đối chứng — cả hai đều là giả thuyết của tôi và
cả hai đều sai. Xem D-033.

**B-8 gỡ** — `load-test.mjs` từng treo 3 tiếng giữ một slot L1; nay có trần thời gian
tổng bao cả pha nạp ví, hạn giờ mỗi lượt gửi, nạp theo lô, và vòng chờ chính đua với
hạn chốt để **đường thu hồi luôn chạy tới**.

**`check-ports.sh`** — bài kiểm cổng hở, đo TỪ NGOÀI, 5 tầng (gồm: origin có đúng 403
khi nối thẳng không, và dải IP Cloudflare có bị bỏ sót không).

**Kế hoạch giao diện: `docs/UI-PLAN.md` + backlog M10.** Phát hiện nền: **không cần
thiết kế mới** — 9Chain đã có hệ token (navy/gold, tương phản sửa đạt AA, dark mode
wire thật) sống trong `9Scan-A1/app/globals.css`. David chốt: **Next xuất tĩnh**, và
**trang chủ nhắm "người muốn có chain riêng"**.

🔴 **Bốn lần tôi tự bắt mình sai trong phiên này** — ghi ra vì cả bốn đều "đọc xuôi
tai": (1) D-028 bản đầu quy công cho `blockGasCost`, trong khi Granite bật sẵn nên nó
vốn đã bằng 0; (2) gotcha *"L1 chưa bật Durango"* trong chính file này là **sai**, đã
đo PUSH0 và sửa; (3) phép đo Warp báo "TẮT" trong khi cấu hình đúng — vì đọc ở block 0
lúc precompile chưa kích hoạt; (4) hai giả thuyết về nút thắt TPS (Cloudflare, ethers)
đều bị đối chứng bác bỏ.

### Phiên 2026-08-25 (thứ hai) làm xong — tóm tắt để khỏi mở file

**M4.4 — thu hồi chain.** Trần 16 L1 hết là bánh cóc một chiều. `POST /api/revoke`
gỡ subnet khỏi `--track-subnets` mọi node rồi gỡ khỏi danh bạ. Nghiệm thu **29/29**
trên mạng công khai: thu hồi 162.8s, gián đoạn C-Chain **0.5s** (bằng lúc đẻ chain),
danh bạ **5 → 5**. `smoke-l1.mjs --de-chain` nay **tự dọn chain nó đẻ ra**.

**M8 — "fork tự đứng được", xong 4/4.** Ba lỗ hổng nêu ra đầu phiên đã bịt:
- **Build lại được** — và binary **trùng từng byte** với bản đang chạy công khai
  (`40d5e8f6…`), plugin cũng vậy. Reproducible build, xem D-017.
- **Test có nền** — 220 xanh / 7 đỏ; fork chịu trách nhiệm **đúng 2 gói**, cả hai chỉ
  vì đổi tên. 2 gói khác là nền upstream (đã chứng minh bằng thí nghiệm), 3 gói cần
  mạng thật. Xem D-018/D-019.
- **Rebase đã diễn tập** — `scripts/rebase-drill.sh`, 7/7 điểm chủ quyền còn nguyên.

**M5 — kiểu chain (preset).** 5 preset, tên khoá + địa chỉ precompile **lấy từ source
subnet-evm** (subnet-evm bỏ qua khoá lạ trong im lặng). M5.3 nghiệm thu bằng chain
thật: 3/4 preset chứng minh được precompile bật đúng; `khong-phi` **chưa qua** (B-3).

**M9 — đo năng lực bằng tải thật** (David yêu cầu). `local-net/faucet/load-test.mjs`.
- L1 riêng: **260 TPS** chốt, 0 lỗi. Trần là **tham số genesis** chứ không phải phần
  cứng: `gasLimit 12M ÷ 21.000 gas ÷ 2s = 285 TPS lý thuyết`, đo được 90% trần, trong
  khi máy mới ở load 2,92/8 luồng.
- Đợt ngắn trên C-Chain (3 phút, 50 TPS): explorer từ **9 block/~0 tx → 113 block/9.004 tx**.
  RPC công khai p50 **19ms**, hỏng 0/35. **Blockscout bám kịp, chậm 0,3 block.**
  Chi phí ròng ~0,0000000004 LOVE9 (nạp 10 LOVE9 rồi **quét trả lại 9,9999999996**).
- Đĩa khi tải: ~**2,2 GB/giờ** ở 252 TPS (số 0,86 GB/giờ đo lúc đầu là mẫu quá ngắn).

**M4.1 + M4.2 — đăng nhập bằng ví.** `GET /api/siwe/nonce` → `POST /api/siwe/login`
→ token phiên. Đăng nhập bằng ví thì **`admin` bị ÉP = địa chỉ đã ký**, gỡ hẳn lớp lỗi
tệ nhất của dự án (gõ nhầm 1 ký tự ⇒ genesis bất biến ⇒ chain vô chủ vĩnh viễn).
Thu hồi bằng ví chỉ đụng được chain của mình. Hạn mức đếm theo **ví**, hai tầng
(cửa ngoài trước xác thực / ngân sách thật sau xác thực — D-022).
Nghiệm thu: **21/21** + **33/33→37/37**, đạt ở cả máy dev lẫn server; smoke **16/16**.
`console-deploy.sh` nay **chặn deploy nếu test xác thực trượt**.
🔴 `A1_TRUST_PROXY` **cố ý CHƯA bật** — bật khi chưa có proxy là đi lùi, xem M4.2.

**B-1 đã gỡ** (David mở lại Docker Desktop). Một thao tác của người thật mở được 4 task.

🔴 **H-6 nay là việc chặn đắt nhất: repo KHÔNG CÓ REMOTE NÀO.** Đã kiểm lúc định push.
Toàn bộ phiên này (10 commit) chỉ nằm trên một ổ đĩa. `BLOCKERS.md` có sẵn stopgap
H-6b chỉ cần David gật một chữ.

**Sức khoẻ lúc chốt (đo thật):** 5/5 validator connected · **5 L1** trong danh bạ ·
smoke test **20/20 đạt** · đẻ chain đầy đủ có gửi giao dịch thật, chốt sau 0.1s.

**Phiên autopilot 2026-08-25 làm xong 3 mốc:**
- **M0** — dự án nay **có git**. Trước đó toàn bộ lớp chủ quyền (6 file identity đã sửa
  + 1079 dòng Go công cụ) là uncommitted/untracked, một lệnh `git checkout .` là mất sạch.
- **M1** — có **bộ đo + smoke test E2E** (trước đây không có test tự động nào).
- **M2** — đẻ 1 chain làm RPC công khai chết **6.0s → 0.5s** (đo thật, 12 lần tốt hơn).

**Hai phát hiện đổi cách nghĩ về sản phẩm** — xem `DECISIONS.md` D-009 và `BLOCKERS.md` H-2:
- 🔴 **Trần cứng 16 L1**: node track quá 16 subnet bị **mọi peer cắt kết nối** lúc bắt
  tay P2P (`network/peer/peer.go:882`). Mạng vỡ, không phải chậm đi. Hiện **5/15**.
  Console đã chặn. ⇒ **ACP-77 từ "việc tương lai" thành thứ duy nhất mở được trần.**
- 🔴 **Repo chưa có remote** — code vẫn chỉ nằm trên một ổ đĩa (H-6, cần David chọn
  nơi đặt + private/public).

**Explorer là dự án KHÁC: `C:\PROJECTS\9Scan-A1`** — có backlog riêng đang chạy dở
(M2 `/chains/`). Muốn làm explorer thì mở phiên ở thư mục đó và đọc `PROGRESS.md`,
đừng làm từ repo này.

## TL;DR
**Testnet công khai ĐÃ LIVE**: https://a1.9chain.org · RPC https://rpc-a1.9chain.org
5 validator chạy trên server nhà cung cấp `139.99.145.13`, Blockscout index đầy đủ, faucet + nút "Thêm vào MetaMask" hoạt động. **P0 #1/#2/#3 đều PASS.**

🔴 **CONSOLE ĐẺ CHAIN ĐÃ CÔNG KHAI (2026-08-25): https://a1.9chain.org/console/** — đăng nhập bằng chữ ký ví, `admin` bị ép = địa chỉ đã ký. Người lạ đẻ được chain của chính họ. Còn **13 suất** (danh bạ 2 L1; trần mềm console 15, trần cứng giao thức 16).
🔴 **Origin CHỈ phục vụ qua Cloudflare.** Nối thẳng vào `139.99.145.13:443` → **403** cho cả ba tên miền. Kiểm: `bash local-net/deploy/check-ports.sh`.

**Nút "đẻ chain" CHẠY THẬT trên mạng công khai**, hiện **2 L1** trong danh bạ
(OmegaChain, OwnerTest — 4 chain rác của bộ kiểm thử đã dọn ở phiên thứ năm).
**6 kiểu chain (preset)** chọn được, cả 6 đã chứng minh bằng chain thật — xem M5.3.
🔴 **Hai L1 giữa các L1 nói chuyện được với nhau (Warp/ICM) — M6.2 xong, 21/21 + 20/20.**
Ví chain-factory: **9 LOVE9** trên P-Chain ≈ **63,600 lượt đẻ chain** (0.000141468 LOVE9/lượt).

⏱️ **Đẻ 1 chain nay mất ~170 giây, không phải 12s như trước — đây là CHỦ Ý, không phải lỗi.**
Node restart lần lượt (mỗi node ~30s) thay vì đồng loạt, để mạng không mất quorum giữa chừng.
Đổi lại RPC công khai chỉ gián đoạn **0.5s** thay vì 6.0s. Xem `DECISIONS.md` D-008.
Với self-serve (M4) thì 170s là tệ cho người bấm nút — chưa tối ưu, biết và chấp nhận.

A1 = 1 trong 2 testnet song song (A1=Avalanche, C1=Cosmos) để cộng đồng chọn hướng mainnet 9Chain (David chốt: **hướng public đại chúng**).
Thư mục: A1 `C:\PROJECTS\9Chain-A1` · C1 `C:\PROJECTS\9Chain-C1` (đội khác vận hành, KHÔNG đụng).

🔴 **Explorer đã tách ra dự án riêng: `C:\PROJECTS\9Scan-A1`** (2026-08-24). Repo này lo **chain** (node, console, faucet, ví, Caddy, deploy); explorer lo **giao diện + đọc dữ liệu**. Hai bên chạy song song — **đừng lấn sân**. Explorer cần endpoint mới trên node thì họ ghi yêu cầu vào `KICKOFF.md` của họ rồi báo sang, không tự sửa ở đây.
Mục tiêu của 9Scan-A1 là **thay Blockscout**: đo trên server, Blockscout ngốn 10 container / 32–75% CPU / ~750MB chỉ để index **1 chain có 8 block** — trong khi cả 5 node avalanchego chỉ 18,5% CPU. Với sản phẩm multi-L1 thì một-instance-một-chain chết từ chain thứ ba.

---

## Hạ tầng đang chạy

| | |
|---|---|
| Trang testnet | https://a1.9chain.org — Blockscout ở gốc · `/faucet/` · `/chains/` · `/dashboard/` · `/lite/` |
| Danh bạ L1 | `/chains/` — mọi chain do console đẻ ra + tình trạng thật. Container `9chain-a1-chains` (nginx, `127.0.0.1:8093`), đọc `console-chains.json` qua alias — URL thật là **`/chains/data/console-chains.json`**
(trang fetch bằng đường dẫn TƯƠNG ĐỐI `data/…`; gõ `/data/…` ra 404, đã dính).
Mỗi bản ghi nay có thêm `presetTen` (tên kiểu chain do console ghi lúc đẻ, để trang
khỏi phải tự dịch id → tên và trôi lệch — bản chép tay cũ đã trôi một lần). **Dấu hiệu sống là SỐ VALIDATOR của subnet**, không phải chiều cao block. Mỗi L1 hiện thêm **Chủ sở hữu (admin)**; chain đẻ trước khi có ô này (OmegaChain) hiện "mặc định của hệ thống", không được để lọt `undefined`. |
| RPC công khai | https://rpc-a1.9chain.org/ext/bc/C/rpc |
| MetaMask | Chain ID `9000000009` · Symbol `LOVE9` (có nút 1 cú bấm ở `/faucet/` và `/lite/`) |
| Server | `139.99.145.13` (`(không công bố)`), Ubuntu LTS, 8 luồng / 62GB / RAID1 410GB |
| SSH | `ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST"` (key không passphrase, mật khẩu đã tắt) |
| DNS | 2 A record → `139.99.145.13`, Cloudflare **Proxied**, SSL/TLS mode **Full** |

**Ví chain-factory** (khoá trên server, `console.env`): P-Chain `P-love91vgh2whn746dzzvg0dj4w9rsqvlalcldvpueuvj` · **9 LOVE9** · khoá gốc ở `local-net/net-public/chain-factory-key.txt` (chỉ máy dev). Hết tiền thì nạp lại từ quỹ Foundation theo cách ghi ở `docs/VI-VAN-HANH.md`.
🔴 **`net-public/allocation.md` (mạng công khai) ≠ `net/allocation.md` (dev local)** — hai
mạng khác nhau, khoá khác, số khác; đọc nhầm không có dấu hiệu gì. Bản chép công khai của
mạng thật: `docs/ALLOCATION-PUBLIC.md`.

**Loopback-only (SSH tunnel, KHÔNG public):**
```bash
ssh -i "$A1_SSH_KEY" -L 8091:127.0.0.1:8091 -L 8090:127.0.0.1:8090 "$A1_SSH_HOST"
```
- Console đẻ chain `:8091` — token ở `~/9chain-a1/console.env` **trên server**.
- Ví X/P `:8090` — **khoá server giữ, KHÔNG có auth**; public là mất sạch ví đó.

**Bố cục trên server:** `~/9chain-a1/{src,net,caddy.env,console.env}` · Blockscout ở `src/explorer-full/blockscout/docker-compose` (UI `127.0.0.1:8100`).

---

## Việc tiếp

🔴 **Backlog nằm ở `PROGRESS.md`, không phải ở đây.** Đừng chép việc vào file này —
hai danh sách sẽ trôi lệch nhau. `BLOCKERS.md` liệt kê thứ đang chờ David.

Tóm tắt để khỏi mở file (cập nhật hết phiên thứ tư):
**Xong:** M0 git · M1 bộ đo + smoke E2E · M2 gián đoạn 6.0s→0.5s · M4.1–M4.5 (SIWE,
hạn mức theo ví, thu hồi chain, console công khai) · **M5 kiểu chain, 40/40** ·
**M6 đóng — Warp/ICM chuyển được tài sản giữa 2 L1 (21/21 + 20/20)** ·
M8 fork tự đứng được · M9.1–M9.4 + M9.6 đo tải.
**Làm một phần:** M3 (netgen xong, chờ H-7) · M7.2 (bài kiểm cổng xong, ufw chưa).
**Chưa bắt đầu:** M10 giao diện (M10.1/M10.2 làm được ngay, không chờ ai).
**Chờ David:** `keys.txt` bản thứ hai offline · validator thứ sáu khác nhà cung cấp ·
**H-7 IPv6 hay IPv4** · trần 16 L1 ⇒ quy mô bán multi-L1 (H-2) · git remote (H-6) ·
tokenomics (H-1) · bản ghi DNS bootstrap (H-4) · hạn mức cho RPC công khai (mới:
API Warp gọi được từ Internet, xem PROGRESS M6.2) ·
tắt 2 service Blockscout (B-2) · có đưa số liệu đo tải lên trang công khai không (M9.5).

### Đã kiểm chứng trên mạng công khai (đừng làm lại)
- **Đẻ chain chạy thật** — 6 lỗi chồng nhau đã gỡ (chi tiết: `docs/PROGRESS.md`).
  Tiền là mắt xích cuối và rẻ nhất: 0.000141468 LOVE9/lượt.
- **Chain thuộc về người bấm nút** — `POST /api/create` nhận `admin`, dùng cho **cả**
  `alloc` genesis **lẫn** `feeManagerConfig.adminAddresses`. Chứng minh bằng ví lạ trên
  `OwnerTest`: ví đó 50M token + FeeManager **Admin**, quỹ Foundation **0** + **None**.
- **Danh bạ `/chains/` hiện chủ sở hữu**, chain thiếu khoá `admin` hiện "mặc định của
  hệ thống" — thiếu khoá là trạng thái **hợp lệ**, không phải lỗi.

**Địa chỉ admin validate bằng EIP-55** (`local-net/lib/eip55.mjs`, keccak-256 viết tay vì
thư mục gốc trên server không có node_modules). Khắt khe vì genesis đã đẻ là **bất biến**:
sai một ký tự hex là chain **vĩnh viễn vô chủ**, không lỗi, không dấu hiệu.
Tự kiểm: `node local-net/lib/eip55.mjs --self-test`.

---

## Bí mật — quy tắc cứng
- `local-net/net-public/keys.txt` = **khoá thật của 5 quỹ testnet công khai**. Giữ offline, `.gitignore` sẵn, **KHÔNG BAO GIỜ** lên server.
- File duy nhất được phép lên server: `faucet.env`.
- 🔴 `local-net/net/` = bộ **dev local** (genesis khác `net-public/`). **Đừng lẫn hai bộ.**
  Luật này trước đây **chỉ** nằm ở đây, trong mục *Bí mật* — nên người đi tìm bảng phân bổ
  không bao giờ đọc tới, và 9Scan-A1 đã mở nhầm `net/allocation.md` rồi đăng một kết luận
  sai (2026-08-26). Nay cảnh báo đã đứng cạnh **mọi** chỗ nhắc `allocation.md`:
  `docs/ALLOCATION-PUBLIC.md` · `docs/TOKENOMICS.md` · `docs/VI-VAN-HANH.md` ·
  `local-net/gen-network.sh` (in ra lúc sinh mạng). **Thêm chỗ nhắc mới thì thêm cảnh báo.**

---

## Chuẩn đặt tên (chốt 2026-08-24)
Mọi thứ dùng `9chain-a1`, bỏ hẳn "MetaChain/META".
Identity: client `9chaingo` · token **LOVE9** · HRP `love9` · VM `love9evm` (VMID `pkqXszJe86D3xLomib9bLpXPfW7gr7FPhDAbg46p5iNjrn4mf`) · networkID **9001** (uint32) · EVM chainId **9000000009**.
Env dùng tiền tố `A1_*` (tên biến không được bắt đầu bằng số).

---

## Gotchas

### Thêm từ phiên 2026-08-27 (đợt 11 — cơ chế khắc chữ)

- 🔴 **SỐ CHÉP SANG THANG KHÁC PHẢI KIỂM LẠI TỶ LỆ, KHÔNG CHỈ KIỂM THANG.** Phiên web bắt
  được: `PLAN` ghi *"số dư genesis ≈64 tỷ, phần để mint ≈26 tỷ"* — số của thang 90 tỷ. Phản
  xạ là chia 10 ra 6,4/2,6, và nó **đọc rất hợp lý**. Sai: 64/26 suy từ bảng BOD Đ14 (staking
  **30%**), còn bảng được chốt là staking **40%** ⇒ số đúng là **5,4 / 3,6**. Đổi thang và đổi
  tỷ lệ là **hai** thay đổi; sửa một cái là giữ nguyên cái sai còn lại. Cùng họ với
  [[a1-tran-uint64]] — mọi đại lượng chép từ nơi khác phải hỏi **cả** "kiểu dữ liệu chứa nổi
  không" **lẫn** "tỷ lệ có còn đúng không".
- 🔴 **SỔ CHỐNG PHÁT LẠI ĐÃ HỞ THẬT, KHÔNG CÒN LÀ RỦI RO.** Lượt `26/08` reset
  `console-chains.json` về rỗng ⇒ chainId cũ dùng lại được. Đo `27/08`: **6 số đã bị cấp lại
  ngay trong 24 giờ** (9100–9105, trong đó 9100/9101 là chain **đang sống** lúc re-genesis).
  Chỗ đắt: **9106–9145 còn trống**, mà console tự cấp bằng `chainId=9100; while(taken)
  chainId++` — trong dải đó có **9141 = chain `David Do`**. Chi tiết + cách xử:
  `docs/NGAY-G-A1-CON-LAI.md` §5c.
- **SIWE của console KHÔNG dính đòn phát lại khi re-genesis, và nó chặn ĐỘC LẬP với chainId.**
  `siwe.mjs:113`: `xacThuc` **không bao giờ nhận `message` từ client**, server tra message từ
  kho của chính nó theo nonce ⇒ chữ ký của mạng cũ không có đường trình lên. Thêm hai lớp:
  `khoNonce` là `Map` **trong bộ nhớ** (mất khi restart), và nonce **dùng một lần**, xoá ngay
  cả khi xác minh hỏng bên dưới. ⇒ Đừng dùng "phát lại SIWE" làm lý do đổi chainId.

- 🔴 **TRÊN MÁY DEV, TAG `9chain-a1/node:dev` LÀ BINARY CŨ 720 TRIỆU.** Đo lúc dựng mạng
  tập: `"supplyCap":720000000000000000`. Bản 9 tỷ trên máy dev nằm ở tag
  **`9chain-a1/node:drill9`**; `:dev` của **server** mới là bản 9 tỷ. **Cùng một tag, hai
  máy, hai binary khác nhau.** Ai làm theo runbook trên máy dev mà tin `:dev` là bản hiện
  hành sẽ nạp genesis 5,4 tỷ lên binary trần 720 triệu — đúng cái bẫy tràn ngược `uint64`
  ở mục 1b, và **node vẫn khởi động sạch**. Luôn đối chứng:
  `docker logs <node> 2>&1 | head -1 | grep -o '"supplyCap":[0-9]*'`.
- 🔴 **TRƯỜNG `Message` CỦA P-CHAIN GENESIS LÀ TRƯỜNG CHỈ GHI.** Nó được serialize vào
  genesis blob nhưng **không chỗ nào trong avalanchego đọc lại**, và `platformvm` **không
  có API `getGenesis`**. ⇒ *"đọc chữ khắc từ chain"* theo nghĩa đen **không làm được**.
  Đường vòng chặt hơn: `state.go:2382` đặt `genesisID = sha256(genesisBytes)` và block 0
  lấy nó làm **`parentID`** ⇒ mạng đang chạy mang sẵn **cam kết mật mã cho toàn bộ genesis
  blob**, đọc bằng `platform.getBlockByHeight(0)`. Nó chứng minh được thứ mạnh hơn: **mạng
  này sinh ra từ đúng tệp genesis kia**. `9chain-a1-tools/engrave-verify` dùng đúng mỏ neo đó.
- **Mount đè lên `/dev` của container là giết container.** `-v <host>:/dev:ro` ⇒
  `can't mask paths: open /dev/null: no such file or directory`. Đặt tên điểm mount khác
  (`/devnet`). Lỗi đọc như hỏng Docker chứ không như đặt tên sai.
- **Compose do netgen sinh dùng bind-mount TƯƠNG ĐỐI** (`../../9chain-a1-config`). Chạy
  `docker compose` từ thư mục khác ⇒ node chết với
  `couldn't read chain configs: cannot read directory`. Có sẵn đường ra: đặt
  **`A1_CONFIG_DIR`** trỏ đường tuyệt đối.

### Thêm từ phiên 2026-08-26 (đợt 10 — vá tài liệu lệch)

- 🔴 **HASH CỦA `.a` KHÔNG PHẢI HASH CỦA BINARY — đừng kết luận tái lập từ nó.**
  Sửa **chỉ chú thích** trong `genesis_9chain_a1.go` rồi đo: `go build -o x.a ./genesis/`
  ra hash **KHÁC**, đọc y như "build không còn tái lập". Sai. Build ID của Go có hai
  nửa `actionID/contentID`: **actionID băm cả văn bản nguồn** (chú thích tính vào),
  **contentID băm kết quả biên dịch**. Đo thật: actionID lệch, **contentID trùng tuyệt
  đối** — và binary cuối `go build ./main` ra **sha256 trùng, buildid trùng, `cmp -l`
  đếm 0 byte khác**. ⇒ Đo tái lập thì đo **binary**, không đo artifact trung gian.
  Đây là lần thứ tư dự án dính họ "đo sai đại lượng" (trước đó: mã HTTP thay vì nội
  dung · `docker stats` thay vì CPU tích luỹ · cổng JS không đọc mã Go).
- **Thay file để đối chứng thì dùng `go build -overlay`, đừng sửa nguồn rồi khôi phục.**
  Ghi bản cũ ra chỗ khác + `{"Replace":{"<đường dẫn trong container>":"<bản cũ>"}}`, mount
  nguồn `:ro`. Nguồn không bị đụng một byte, và không có cửa nào để quên khôi phục.
  (Cùng bài học với bẫy `sed -i` trong container đã ghi ở đợt 8.)
- **Chú thích nói ngược giá trị ngay cạnh nó là lỗi thật, không phải lỗi hình thức.**
  `cf5a54b` đổi giá trị sang bản 9 tỷ nhưng bỏ sót chú thích, để lại ba chỗ mô tả số cũ
  (2,000 / 50,000,000 / 25) đúng ở file mà người ta đọc **ngay trước khi đổi một số
  consensus-critical**. Đã vá ở patch 0009. Đổi hằng số thì đọc lại cả khối chú thích bao
  quanh — trình biên dịch không bao giờ bắt được loại lệch này.

### Thêm từ phiên 2026-08-26 (đợt 9 — re-genesis mạng công khai)
- 🔴 **`fetch` CỦA NODE CÓ HẠN GIỜ ẨN 300 GIÂY, VÀ `AbortSignal.timeout()` KHÔNG NỚI
  ĐƯỢC NÓ.** undici đặt `headersTimeout` mặc định đúng 300.000ms; muốn khác phải đổi
  dispatcher. Mã nguồn **không ghi một con số nào** nên đọc code không thấy. Với 9 node,
  đẻ chain mất ~305s ⇒ vượt ngưỡng. Đo thật: `warp-test` in
  *"POST không kết luận được (fetch failed), sự thật lấy từ danh bạ"* ở giây **305,8**.
- 🔴 **HẠN GIỜ CẮM CỨNG LÀ MỘT GIẢ ĐỊNH VỀ QUY MÔ MẠNG.** `smoke-l1` cắm 300s — vừa đủ
  cho 5 node, hỏng ngay ở 9 node. Bất cứ hạn giờ nào bao một thao tác *tỉ lệ với số node*
  đều phải **suy từ số node**, không được là hằng số. Nay: `60s + 60s/node`.
- 🔴 **BÀI KIỂM PHẢI THEO ĐÚNG LUẬT MÀ SẢN PHẨM ĐÃ THEO.** Giao diện coi kết quả POST dài
  là *không kết luận được* từ M10.4/M10.5, nhưng bộ kiểm thử thì chưa — nên nó **báo đỏ
  cho một sản phẩm hoạt động đúng** và bỏ lại **chain mồ côi ăn một slot**. Nay cả ba bài
  đi qua `thaoTacDai()` trong `warp-common.mjs`: bắn POST → đọc `/api/progress` tới khi
  **lượt của chính mình** kết thúc (khớp `name`+`kind`) → hỏi **danh bạ** xem sự thật.
- **Dấu nháy đơn trong đoạn `python3 -c '...'` nhúng trong chuỗi ssh sẽ ĐÓNG chuỗi ssh.**
  Lỗi hiện ra là `thu: command not found` — đọc như lỗi trên server, thực ra là shell
  máy dev. Script dài thì `scp` lên rồi chạy, đừng nhồi vào một dòng ssh.
- 🔴 **BẪY `pgrep`/`ps|awk` — LẦN THỨ NĂM, cửa mới: MẪU QUÁ HẸP.** Bốn lần trước là
  mẫu **tự khớp chính nó**; lần này ngược lại — mẫu
  `/faucet\/(smoke|warp|bridge)-?[a-z]*\.mjs/` **không khớp `smoke-l1.mjs`** vì tên tệp
  có **chữ số**. Vòng canh kết luận "không còn tiến trình" trong khi bài kiểm đang chạy
  bình thường (đo lại: sống 86s). Nếu tin nó mà chạy bài tiếp theo thì hai lượt đẻ chain
  chồng nhau trên cùng một console.
  ⇒ Vòng canh phải có **cả hai chiều đối chứng**: mẫu rộng (`grep -c "[f]aucet/"`) và
  một dấu hiệu độc lập (kích thước log tăng). Một dấu hiệu duy nhất về sự sống là không đủ.
- 🔴 **`docker compose down -v` KHÔNG xoá DB Blockscout — nó là BIND MOUNT.** Volume
  khai trong compose thì `-v` xoá; Blockscout để dữ liệu ở
  `docker-compose/services/{blockscout,stats}-db-data` trên đĩa host. Hậu quả đo được:
  sau re-genesis explorer vẫn phục vụ **115 block / 9.008 tx của chuỗi đã chết**, API
  trả 200, trang vẫn đẹp — không dấu hiệu nào. Phải xoá **NỘI DUNG** hai thư mục đó
  (`sudo find <dir> -mindepth 1 -delete`), **đừng `rm -rf` chính thư mục** (bẫy inode).
- 🔴 **`explorer-full/9chain-a1-server.env.sh` là SCRIPT ÁP CẤU HÌNH, không phải file
  env.** `. file.sh` trong script khác là tự sát: nó có `set -euo pipefail` và
  `${A1_PUBLIC_HOST:?}` nên shell gọi nó **thoát ngay tại dòng đó**, các lệnh sau
  không chạy. Tên đuôi `.env.sh` đọc như file env — đó là cái bẫy.
- 🔴 **Faucet nướng `FAUCET_PK` vào ENV LÚC TẠO CONTAINER, và container đó không có
  định nghĩa nào trong repo** (dựng bằng `docker run` tay). Đổi `faucet.env` trên đĩa
  **không có tác dụng** — phải `docker rm` rồi `docker run` lại. Cấu hình thật moi ra
  bằng `docker inspect`; đã ghi lại trong `docs/VI-VAN-HANH.md`.
  Điểm sáng: faucet **tự chẩn đoán đúng** — *"VÍ FAUCET RỖNG trên chain này. Sai khoá,
  hay genesis khác?"*. Thông báo lỗi nói ra giả thuyết đáng giá hơn một dòng stack trace.
- 🔴 **RPC công khai KHÔNG phục vụ `/ext/bc/C/avax`** (Caddy lọc path, chỉ mở
  `/ext/bc/*/rpc`). Ví X/P của avalanchego cần endpoint đó ⇒ **mọi thao tác X↔P↔C phải
  đi qua SSH tunnel tới `127.0.0.1:9650`**, không qua tên miền. Đừng mở thêm path công
  khai chỉ để tiện — đó là quyết định bảo mật.
- 🔴 **Tunnel xong vẫn 403 nếu Host header sai.** Node khai
  `--http-allowed-hosts=localhost,127.0.0.1`; container gọi qua
  `host.docker.internal:19650` bị **403**. Cách chạy được: đặt **ssh tunnel NẰM TRONG
  chính container** rồi trỏ `WALLET_URI=http://127.0.0.1:9650`. Lợi ích kèm theo: khoá
  quỹ không bao giờ rời máy dev.
- 🔴 **Lệnh rsync trong `docs/DEPLOY-KSGAME.md` sẽ ĐẨY `keys.txt` LÊN SERVER.** Nó chỉ
  loại trừ `local-net/net`, trong khi khoá quỹ nằm ở `local-net/net-public/`. Phải là
  `--exclude 'local-net/net-*'`. Máy dev này **không có rsync** nên tôi dùng
  `tar -czf - --exclude=.git | ssh 'tar -xzf -'` — cũng an toàn hơn vì liệt kê rõ.
- **`down -v` không xoá được network nếu còn container lạ bám vào.** `9chain-a1-faucet`
  bám `net_a1net` nên network sống sót; may là thư mục mới cũng tên `net` ⇒ cùng tên
  project ⇒ 9 node mới vào đúng network cũ và IP `172.28.0.11` giữ nguyên, faucet không
  phải đổi `FAUCET_RPC`. **Đây là may, không phải thiết kế** — đổi tên thư mục là gãy.

### Thêm từ phiên 2026-08-26 (đợt 8 — diễn tập re-genesis cục bộ)
- 🔴 **Tham số kinh tế nằm trong BINARY, không trong `genesis.json`.** Đổi
  `SupplyCap`/`MaxValidatorStake`/… trong `genesis_9chain_a1.go` là **phải build lại
  image node và deploy**, không chỉ sinh lại genesis. Chi tiết + hậu quả tràn ngược:
  mục 1b đầu file. Đối chứng rẻ nhất sau mỗi lần deploy:
  `docker logs <node> 2>&1 | head -1 | grep -o '"supplyCap":[0-9]*'`.
- 🔴 **Cổng chặn viết bằng ngôn ngữ khác với thứ nó canh thì nó canh cái khác.**
  `check-consistency.mjs` (JS) không đọc mã Go, nên bản tokenomics **không biên dịch
  được** vẫn qua cổng 17/17 + 6/6 đối chứng ngược. Lần thứ ba dự án dính họ này
  (trước đó: đo mã HTTP thay vì nội dung; đo `docker stats` thay vì CPU tích luỹ).
  ⇒ Cổng phải chạm **chính artifact** sẽ chạy thật. netgen nay đọc `SupplyCap` thẳng
  từ `genesis.A1Params` — hết bản chép tay, hết đường trôi lệch.
- 🔴 **`sed -i` TRONG CONTAINER SỬA CHÍNH FILE NGUỒN ĐANG BIND-MOUNT.** Tôi chạy một
  ca đối chứng ngược "hạ trần về 720 triệu" bằng `sed -i` trên `/src` và nó **ghi
  thẳng vào repo** — `git checkout` mới lấy lại được. Cách đúng: mount `:ro` và thay
  file bằng `go build -overlay <json>` (Go nhận bản đồ thay tệp, nguồn không đụng).
- 🔴 **`platform.getCurrentSupply` > tổng allocation X/P là BÌNH THƯỜNG.** Nó đã cộng
  sẵn `potentialReward` của mọi validator genesis. Và `InitialSupply()` **không** tính
  C-Chain. Muốn đối chiếu tổng phát hành thì cộng tay X/P + C-Chain từ `genesis.json`,
  đừng hỏi P-Chain.
- **Subnet docker `172.28.0.0/16` đã bị bộ dev-local chiếm** (`net_a1net`, còn sống vì
  `9chain-a1-faucet` bám vào). Dựng bộ thứ hai song song phải đổi dải — `sed` trên
  compose là đủ, `genesis.json` **không chứa IP** nên không phải sinh lại khoá.
- **`container_name` do netgen sinh ra là cố định `9chain-a1-node-N`**, không mang tên
  project ⇒ hai bộ mạng không chạy song song được. Volume thì CÓ mang tên project
  (`net_…` vs `net-drill9_…`), nên `docker rm` container cũ **không mất dữ liệu** bộ cũ.

### Thêm từ phiên 2026-08-26 (đợt 7 — tokenomics 9 tỷ)
- 🔴 **`SupplyCap` là `uint64`, và LOVE9 có 9 chữ số ⇒ TRẦN THẬT LÀ 18,447 TỶ LOVE9.**
  90 tỷ (số trong kế hoạch BOD) = `9e19` = **4,88 lần** `uint64` max. Đã thử biên dịch
  thật, có đối chứng ngược: `90_000 * MegaAvax` → *"constant … overflows uint64"*;
  `18_000 * MegaAvax` → build sạch. **Con số đó đến từ C1, nơi Cosmos SDK đếm bằng
  `big.Int` nên 90 tỷ hoàn toàn bình thường.** Bài học tổng quát: **mọi đại lượng chép
  từ C1 sang A1 phải hỏi "kiểu dữ liệu bên kia chứa nổi không" TRƯỚC khi chép.**
- 🔴 **Số chữ số thập phân KHÔNG phải bản sắc — tôi từng nói sai và suýt lái quyết định
  đi đường đắt.** Danh sách bản sắc (client/token/HRP/VM/networkID/chainId) **không có**
  nó, và **người dùng đã luôn thấy 18 chữ số** (`web/lib/chain.ts` `thapPhan: 18`; C1
  cũng 18). `1e9` chỉ là đơn vị kế toán nội bộ của P/X-Chain.
- 🔴 **48,79% `uint64` KHÔNG phải rủi ro.** `reward/calculator.go:69` kết thúc bằng
  `return min(remainingSupply, finalReward)` ⇒ phép cộng `uint64` thô ở
  `standard_tx_executor.go:1533` **không thể tràn**, bất kể `supplyCap` chiếm bao nhiêu
  phần dải. Đó là dư địa để NÂNG trần sau này, không phải biên an toàn số học.
- 🔴 **Nếu có ngày phải đổi thang đơn vị: `1e9` nằm ở BA chỗ độc lập** —
  `netgen/allocation.go` `unitLOVE9` · `netgen/main.go:273` (P/X→wei trong
  `cChainGenesis`) · `coreth/plugin/evm/atomic/tx.go:33` `X2CRateUint64`. Lệch nhau
  **không gây lỗi nào**: đổi (1) quên (2) ⇒ số dư C-Chain genesis sai 100 lần, mạng vẫn
  khởi động. Chi tiết + 6 rủi ro: `docs/RUI-RO-THANG-1E7.md`.
  (Quyết định cuối là **KHÔNG đổi thang** — xem D-039, nên bảng rủi ro đó hiện là dự phòng.)
- 🔴 **Chú thích trong `allocation.go` SAI và đã sửa:** nó ghi *"đặt LiquidXP > 0 cho quỹ
  staking là sai — tiền sẽ bị bỏ qua"*. Mã thật: vòng dựng UTXO **X-Chain**
  (`genesis.go:305-320`) lấy **mọi** allocation có `InitialAmount > 0`, **không** bỏ qua
  địa chỉ staked; chỉ vòng **P-Chain** mới bỏ qua.
- 🔴 **`patches/` KHÔNG tự cập nhật, và nó ĐÃ lệch.** Nhánh có 5 commit chủ quyền,
  `patches/` chỉ có 4 — commit mở đường bật API Warp chưa bao giờ được xuất. Nay 6.
  **Commit vào cây fork xong PHẢI chạy lại** `git format-patch 1cf1fc3..9chain-a1 -o patches/`.
- 🔴 **`git am` PHẢI có `--keep-cr`** khi kiểm chứng patch series. Thiếu nó thì mọi tệp
  CRLF (`netgen/main.go`) đổi hết xuống dòng ⇒ tree lệch ⇒ **kết luận nhầm là series
  hỏng**. `apply-sovereign.sh:72` và `rebase-drill.sh:57` đã có cờ; cái bẫy nằm ở người
  gõ tay để kiểm. Đã dính đúng thế 2026-08-26.
- **Uỷ quyền tính vào `MaxValidatorStake`** (`proposal_tx_executor.go:801`). Self-bond
  lớn ⇒ validator genesis gần hết chỗ nhận uỷ quyền. Ở 999.999/node thì dư địa còn 624
  triệu — thoải mái.
- **`InitialStakeDurationOffset` là cách so le nhiệm kỳ, có sẵn trong avalanchego.**
  Ràng buộc: `offset × (số node − 1) < InitialStakeDuration`. `MaxStakeDuration` = 365
  ngày là **trần**, nên nhiệm kỳ 1 năm không phải lựa chọn.

### Thêm từ phiên 2026-08-26 (đợt 6 — vá cổng chặn + Đợt 1 audit)
- 🔴 **BÀI KIỂM DÀI PHẢI CHẠY BẰNG `nohup` + LOG TRÊN SERVER, KHÔNG QUA SSH TIỀN CẢNH.**
  Công cụ cắt lệnh tiền cảnh ở **600 giây** rồi đẩy sang nền — ssh đứt, tiến trình
  `node` ở đầu kia nhận SIGHUP và **chết giữa chừng**. `bridge-test.mjs` mất ~13
  phút nên nó *luôn* dính. Hậu quả không phải "mất kết quả": bài này tự thu hồi hai
  chain nó đẻ ra, chết trước bước đó là để lại **2 chain mồ côi ăn 2 slot** trong
  trần 15. Sổ dọn của bài kiểm không cứu được, vì cả tiến trình bị giết.
  ⇒ Cách đúng:
  ```
  ssh … 'nohup bash -c "cd ~/9chain-a1/src && node local-net/faucet/bridge-test.mjs" > ~/bt.log 2>&1 &'
  ```
  rồi đọc `~/bt.log`. Áp cho **mọi** bài đụng mạng thật: `bridge-test`, `warp-test`,
  `load-test`, `smoke-l1 --create-chain`.
- 🔴 **TỆP LOG 0 BYTE KHÔNG PHẢI "ĐANG CHẠY, CHƯA XẢ ĐỆM".** Tôi coi nó là vậy trong
  ~15 phút. 0 byte sau vài phút của một bài in ra liên tục nghĩa là **chưa bao giờ
  có gì** — đi hỏi tiến trình, đừng chờ thêm.
- 🔴 **BẪY `pgrep` NGOẶC VUÔNG — LẦN THỨ TƯ.** `pgrep -af "[b]ridge-test"` báo "còn
  sống" trong khi tiến trình đã chết, vì dòng lệnh của tôi có `echo "… bridge-test …"`
  ngay cạnh và pgrep khớp **chính nó**. Mẹo ngoặc vuông chỉ che chuỗi TRONG MẪU.
  Phép đo không tự khớp được: `ps -eo pid,etimes,cmd | awk '/faucet\/bridge/ && !/awk/'`.
- **`POST /api/revoke` đòi `xacNhan` khớp đúng tên chain.** Thiếu nó thì trả JSON
  `error` chứ không thu hồi gì — và nếu chỉ nhìn "có phản hồi" thì tưởng đã dọn xong.
  Cửa này là cố ý (cùng vai với ô "gõ lại tên chain" trên giao diện).

### Thêm từ phiên 2026-08-26 (đợt 5 — chuẩn hoá tiếng Anh)
- 🔴 **ĐỔI TÊN HÀNG LOẠT BẰNG `sed` LÀ SAI CÁCH Ở REPO NÀY — mã nguồn tiếng Việt làm
  tên khoá JSON TRÙNG với thứ khác.** Đã bắt được bốn lần trong một phiên:
  `dangChay` vừa là khoá API vừa là **prop của `<Nut>`**; `kyHieu` vừa là khoá API vừa
  là hằng `CHAIN.kyHieu`; `'xong'`/`'chay'` vừa là trạng thái bước vừa là state UI
  (`Pha`, `kichHoat`); và `ten:` trong `dien(vi.X, { ten })` là **khoá nội suy i18n** —
  đổi nó thì **không có lỗi biên dịch nào**, chỉ là chữ hiện ra sai.
  ⇒ Đổi có ngữ cảnh (`tienTrinh.dangChay`, `dangChay: boolean`), đừng đổi theo từ.
- 🔴 **TypeScript là trọng tài, nhưng nó KHÔNG bắt được khoá i18n.** `tsc --noEmit`
  bắt sạch mọi chỗ lệch giữa type và cách dùng — đổi type trước rồi để nó chỉ chỗ là
  cách rẻ nhất. Nhưng `dien(chuoi, {ten})` chỉ là `Record<string,...>`, nên chỗ đó
  phải soi bằng `git diff`, không tin trình biên dịch được.
- 🔴 **Dịch ở RANH GIỚI, đừng dịch cả tầng.** State nội bộ (`tienTrinh`) giữ tên tiếng
  Việt; chỗ `send(res, 200, {...})` mới map sang tiếng Anh. Một chỗ sửa thay vì hai
  chục, và mã nguồn không bị nửa Việt nửa Anh.
- 🔴 **Đổi khoá JSON là ĐỔI HỢP ĐỒNG DỮ LIỆU — hỏi ai đang đọc TRƯỚC.** `9Scan-A1`
  đọc `console-chains.json` thật (`components/explorer/chains.tsx`). May là họ chỉ
  dùng khoá vốn đã tiếng Anh (`chains`, `name`, `chainId`, `blockchainID`, `subnetID`,
  `rpc`, `retired`) nên không gãy. Lần sau vẫn phải kiểm trước, không phải đoán.
- 🔴 **Bản ghi đã ghi thì không bao giờ được viết lại — đổi khoá bên sinh là phải DI
  TRÚ.** 17 bản ghi mang `presetTen` sẽ lặng lẽ mất nhãn preset. Không lỗi, không dấu
  hiệu, chỉ là một cột trống mà không ai nhớ là nó từng có chữ.
- **Solidity: tên tệp và tên contract là một cặp.** `compile.mjs` tra
  `contracts["<tệp>.sol"]["<Contract>"]`. Đổi tệp mà không đổi contract (hay ngược
  lại) thì lượt biên dịch sau ném lỗi `undefined`, và nó ném ở chỗ trông như lỗi solc.
- **Đổi route tĩnh thì Caddy phải đi TRƯỚC web.** `web-deploy.sh` tự kiểm liên kết qua
  tên miền công khai ở bước cuối, nên deploy web trước là script tự báo đỏ vì Caddy
  chưa định tuyến đường mới. Thứ tự đúng: Caddy → faucet → console → danh bạ → web.

### Thêm từ phiên 2026-08-26 (đợt 4 — đổi tên miền)
- 🔴 **HTTP 525 CÓ THỂ LÀ TIẾNG VỌNG CỦA LẦN THỬ TRƯỚC, KHÔNG PHẢI TRẠNG THÁI HIỆN
  TẠI.** Cloudflare giữ trạng thái "origin không bắt tay TLS được" **theo từng
  hostname** một lúc. Thử một tên miền TRƯỚC khi Caddy có site block cho nó ⇒ CF ghi
  nhớ hỏng ⇒ sau khi thêm site block, CF **vẫn trả 525 và không thèm gọi tới origin**.
  Triệu chứng đọc y hệt "DNS trỏ sai chỗ", kể cả phép đo tưởng là dứt điểm: log origin
  đếm được **0 request** mang host đó. Nó tự hết sau vài phút.
  ⇒ **Đừng đo một tên miền trước khi cấu hình cho nó tồn tại** — lượt đo đó không vô
  hại, nó **tạo ra** cái trạng thái mình sẽ chẩn đoán nhầm sau đó.
  ⇒ Phép tách bạch đúng: thử TỪ CHÍNH SERVER qua loopback
  (`curl -k --resolve <ten>:443:127.0.0.1`). TLS bắt tay được + trả 403 nghĩa là
  **origin lành**, mọi thứ còn lại là chuyện của Cloudflare và phần lớn là chuyện tự hết.
- 🔴 **Caddy chỉ đọc biến môi trường lúc container KHỞI ĐỘNG.** Để tên miền trong
  `{$DOMAIN}` là mỗi lần đổi tên phải `--force-recreate` (Caddy chết vài giây, và ví
  đang mở sẽ **giữ nguyên banner "Unable to connect"** cho tới khi người dùng tự đổi
  mạng qua lại). Viết thẳng tên miền vào Caddyfile thì `caddy reload` là đủ.
- 🔴 **Trộn biến với literal trên cùng một dòng địa chỉ site đẻ ra "duplicate site
  address"** khi biến tình cờ bằng literal — và Caddy từ chối **CẢ file**, tức sập
  toàn bộ web chứ không hỏng riêng một tên.
- 🔴 **`caddy-deploy.sh` từng MÙ với site có nhiều tên.** Regex cũ khớp cả dòng nên
  `rpc-a1.9chain.org, rpc-testnet-a1.9chain.org {` **không khớp gì cả** ⇒ mất phép
  kiểm cho **cả hai** tên, mà script vẫn in "✓ xong". Đã sửa: cắt `{` → tách dấu phẩy
  → lọc. Và nó nay **thất bại** nếu không rút được tên miền nào, thay vì bỏ qua.
- 🔴 **Probe phải hợp với thứ đang đo.** Tên miền RPC cố ý lọc path nên `GET /` trả
  **404 đúng thiết kế**; đo nó bằng `GET /` là báo động giả, mà nới 404 thành "đạt"
  cho mọi tên miền là mất khả năng bắt lỗi định tuyến. Tên `rpc-*` nay đo bằng một
  lượt `eth_chainId` thật.
- 🔴 **Đổi tên miền TRANG mà giữ cả hai tên cùng phục vụ là làm hỏng bảo đảm của
  SIWE — im lặng, không lỗi nào.** Thông điệp SIWE do **server** dựng nên nó luôn ghi
  một domain duy nhất, trong khi trang gọi console theo `location.hostname`. Người vào
  bằng tên cũ sẽ ký thông điệp nói "a1.9chain.org wants you to sign in" trong khi đang
  đứng ở tên khác. Server vẫn nhận (nó đối chiếu với chính nó), nên **không có dấu
  hiệu hỏng** — nhưng ô `domain` của EIP-4361 tồn tại đúng để người ký thấy mình đang
  ký cho site nào. Vì thế tên miền trang **phải** redirect, không được phục vụ song song.
- **Ảnh/asset tĩnh cần route Caddy RIÊNG, và phải nghiệm thu bằng `content-type`.**
  Gốc `/` là Blockscout — SPA trả **200 kèm HTML rỗng** cho mọi đường lạ, nên quên
  route thì ảnh "200" mà ví hiện ô trống. Đo `content-type` phải là `image/*`.
- **`A1_HTTP_ALLOWED_HOSTS` KHÔNG liên quan tới tên miền công khai** (chú thích cũ
  trong `caddy.compose.yml` bảo đặt nó bằng tên miền RPC — sai từ lúc Caddyfile có
  `header_up Host {upstream_hostport}`, và sai theo kiểu vô hại nên không ai phát
  hiện). Node chỉ thấy `127.0.0.1:9650`. Đổi tên miền **không** phải restart validator.

### Thêm từ phiên 2026-08-26 (autopilot — M10.3→M10.7)
- 🔴 **Cloudflare cắt kết nối ở ~100 giây (HTTP 524).** Mọi thao tác dài (đẻ/thu hồi
  chain: ~170s) đi qua tên miền công khai đều **hỏng ở phía trình duyệt** trong khi
  server làm xong. Đừng kết luận từ mã HTTP của POST dài: bắn POST rồi đọc một
  endpoint tiến trình rẻ, và khi nó kết thúc thì hỏi **trạng thái/danh bạ** xem sự
  thật là gì. Và chỉ kết luận "xong" **sau khi đã thấy `dangChay=true` ít nhất một
  lần** — gọi sớm quá là đọc trúng kết quả của lượt TRƯỚC.
- 🔴 **`handle` của Caddy loại trừ lẫn nhau và xét THEO THỨ TỰ VIẾT.** Đặt
  `@trangmoi` (có `/faucet/*`) trước `@faucet_api` là API faucet trả 404 **trong khi
  trang faucet vẫn hiện ra bình thường** — nhìn bằng mắt không thấy gì.
- 🔴 **Blockscout ở gốc là SPA: mọi đường dẫn lạ trả HTTP 200 kèm khung rỗng**, không
  phải 404. Mọi bài kiểm URL vì thế phải đo **NỘI DUNG** (ví dụ `<title>` không
  rỗng). Đo bằng mã trạng thái cho ra **xanh giả** — đã dính với `/tc-a/`.
- 🔴 **Bản xuất tĩnh của Next dùng đường dẫn TUYỆT ĐỐI cho liên kết nội bộ**, nên
  phục vụ cả site dưới một tiền tố (`/moi/`) là **mỗi cú bấm nhảy ra khỏi tiền tố**.
  Mỗi trang phải có route thật.
- 🔴 **Deploy console giữa lúc một lượt đẻ/thu hồi đang chạy làm DANH BẠ NÓI DỐI**:
  rolling restart do docker làm nên nó chạy tới cùng, còn console chết trước khi ghi
  trạng thái. Cửa sổ này rộng ~170 giây. `console-deploy.sh` nay đọc
  `/api/tien-trinh` và từ chối restart khi `dangChay=true`.
- 🔴 **`0 validator` là một TRẠNG THÁI THẬT, đừng dùng 0 làm sentinel "đang tải".**
  Subnet track mà chưa có validator thì chain vẫn trả lời `eth_chainId`, ví vẫn kết
  nối, **chỉ là giao dịch không bao giờ chốt** — và không có dấu hiệu nào khác.
- **Server dùng chung cổng loopback với 9Scan-A1.** A1 đang giữ: 8082 · 8088 · 8090 ·
  8091 · 8092 · 8093 · **8095** · 8100 · 8101 · 9650 · 9660. 8094 là của họ.

### Thêm từ phiên 2026-08-25 (thứ NĂM, đợt 2 — giao diện)
- 🔴 **Bẫy inode của Docker CŨNG áp cho THƯ MỤC.** `rm -rf <thư-mục-đang-mount>` rồi
  tạo lại ở cùng đường dẫn sinh inode MỚI; container vẫn nhìn inode cũ (đã xoá) và
  thấy **rỗng vĩnh viễn**, trong khi `ls` trên host ra đủ file. Xoá **nội dung**
  (`find dir -mindepth 1 -delete`), đừng xoá thư mục. Phép bắt rẻ nhất: đếm số tệp
  ở host và trong container rồi so.
- 🔴 **"HTTP 200" KHÔNG chứng minh đúng site đang phục vụ.** Đổi nhầm một dòng
  `reverse_proxy` làm tên miền 9scan trỏ sang trang A1, mà `caddy-deploy.sh` vẫn báo
  xanh vì nó chỉ đo mã HTTP. Phép kiểm tên miền phải chạm **nội dung** (ví dụ
  `<title>`), không chỉ mã trạng thái.
- 🔴 **Next xuất tĩnh tham chiếu chunk bằng đường TUYỆT ĐỐI `/_next/...`**, không
  theo tiền tố trang. Đặt trang ở `/faucet/` mà quên route `/_next/*` thì HTML vẫn
  **200** còn CSS/JS **404** — trang hiện ra không style, không tương tác, và mọi
  phép kiểm bằng `curl` vẫn xanh. `web-deploy.sh` nay bốc một đường JS **ra khỏi
  chính HTML vừa tải** rồi gọi thử.
- 🔴 **Cổng loopback trên máy chủ này DÙNG CHUNG với 9Scan-A1.** 8094 là của họ
  (`9scan-a1-web`). Không có bảng cổng nào — xem `sudo ss -tlnp | grep 127.0.0.1`
  trước khi chọn. A1 đang giữ: 8082 · 8088 · 8090 · 8091 · 8092 · 8093 · **8095** ·
  8100 · 8101 · 9650 · 9660.
- **Đọc DOM ngay sau `.click()` là đọc trạng thái TRƯỚC render** — React cập nhật
  state bất đồng bộ. Chờ một nhịp, hoặc gọi thẳng handler qua `__reactProps` để tách
  bạch lỗi sản phẩm với lỗi phép đo.
- **axe-core trong jsdom phải khai `runScripts: 'outside-only'`**, nếu không
  `window.eval(axe.source)` im lặng không làm gì và lỗi hiện ra ở tận dòng
  `.run()` — đọc như axe hỏng chứ không như thiếu cờ. Và **tắt `color-contrast`**:
  jsdom không có layout engine nên nó cho cả dương tính giả lẫn âm tính giả.

### Thêm từ phiên 2026-08-25 (thứ NĂM — Warp/ICM)
- 🔴 **API Warp TẮT MẶC ĐỊNH, và nó hỏng ở ĐẦU KIA.** `sendWarpMessage` vẫn là giao
  dịch thật, vẫn chốt, vẫn sinh log — mọi dấu hiệu ở đầu gửi đều xanh. Chỉ tới lúc
  gom chữ ký mới lộ, và lỗi khi đó là `-32601 method does not exist`, **đọc như gọi
  sai tên hàm chứ không như thiếu cấu hình**. Bật Warp precompile trong genesis mới
  là một nửa; nửa kia là `{"warp-api-enabled": true}` trong chain config.
- 🔴 **Chain config phải ghi TRƯỚC đợt rolling restart.** Node đọc nó đúng lúc *dựng
  chain*, mà chain chỉ được dựng sau khi node track subnet — tức trong chính đợt
  restart ấy. Ghi muộn một nhịp là cả 5 node dựng chain với cấu hình mặc định và
  phải restart lần nữa mới sửa được.
- 🔴 **`tx.wait()` của ethers v6 NÉM LỖI khi receipt có `status: 0`** — nó không trả
  receipt về. Nên bài kiểm viết `const r = await tx.wait(1); kiem(..., r.status === 0)`
  là **tự làm sập chính mình đúng lúc sản phẩm hoạt động ĐÚNG**. Cả ba bài "phải đỏ"
  của warp-test bị nuốt thành một dòng "transaction execution reverted". Dùng
  `phaiRevert()` trong `faucet/warp-common.mjs`.
- 🔴 **`ContractFactory.deploy()` tự quản nonce** ⇒ đi vòng qua mọi lớp bảo vệ nonce
  của bài kiểm. Nạp hợp đồng phải qua `napHopDong()` (dựng tx bằng
  `getDeployTransaction()` rồi gửi qua `guiVoiNonce`).
- 🔴 **Bài kiểm phải ghi tên chain vào sổ dọn NGAY sau khi `/api/create` trả về**,
  không phải sau khi mọi bước sau đó xong. Chain tồn tại từ giây đó; ghi muộn là một
  lượt chạy hỏng để lại **chain mồ côi ăn một slot vĩnh viễn** trong trần 15.
- 🔴 **Đừng đặt module cần `ethers` vào `local-net/lib/`.** Node phân giải
  node_modules từ thư mục chứa FILE đi lên, mà trên server ethers **chỉ có** trong
  `local-net/faucet/node_modules`. `lib/` là chỗ của module **zero-dep** (console
  import từ đó, và gốc dự án trên server không có node_modules).
- **Mẹo ngoặc vuông `pgrep -f "[t]ai-test"` chỉ che chuỗi TRONG MẪU.** Nếu cùng dòng
  lệnh còn chỗ khác chứa chuỗi thật (ví dụ `echo "... tai-test ..."` ngay cạnh) thì
  nó vẫn tự khớp. Đây là lần thứ ba dự án dính họ bẫy này, mỗi lần một cửa khác.
- **Predicate ≠ calldata.** Chữ ký Warp đi vào giao dịch qua **access list**
  (`{address: 0x02…05, storageKeys: <các khối 32 byte>}`), không phải calldata. Đặt
  nhầm chỗ thì `getVerifiedWarpMessage` trả `valid=false` **mà giao dịch vẫn chốt
  bình thường** — không có tín hiệu hỏng nào.
- **API Warp nhận `ids.ID` dạng cb58, còn EVM đưa messageID dạng topic 32 byte hex.**
  Cầu nối: `local-net/lib/cb58.mjs` (zero-dep, `--self-test` 8/8).

### Thêm từ phiên 2026-08-25 (thứ tư, đợt 2 — mở console + siết Cloudflare)
- 🔴 **`A1_TRUST_PROXY=1` mà origin còn nhận kết nối thẳng = LỖ HỔNG, không phải bản
  vá.** Cloudflare ghi đè `CF-Connecting-IP` ở biên nên **đi qua** Cloudflare thì
  không giả được — nhưng **không đi qua thì không ai ghi đè cả**. Đo thật:
  `curl -k --resolve <domain>:443:139.99.145.13 -H 'CF-Connecting-IP: 1.2.3.4' .../faucet/whoami`
  → `{"ip":"1.2.3.4"}`. Hai thứ này phải bật **cùng lúc**, không bao giờ tách.
- 🔴 **`caddy-deploy.sh` ghi đè TOÀN BỘ Caddyfile từ nguồn.** Bất kỳ site block nào
  chỉ tồn tại trên server sẽ **biến mất không dấu hiệu**. Đã làm explorer chết 31
  phút (B-6). Và nhìn từ phía chain thì mọi thứ vẫn xanh — RPC + `testnet-a1` cùng
  file, vẫn sinh bình thường. Script nay tự kiểm mọi tên miền, **suy từ chính
  Caddyfile vừa áp** chứ không cắm cứng danh sách.
- **"Cổng 443 mở" ≠ "origin phục vụ cho bất kỳ ai".** Sau khi siết, TCP vẫn bắt tay
  được (đúng), nhưng HTTP phải 403. Không tách hai tầng này thì bản vá trông như vô hiệu.
- 🔴 **Đo tải qua URL công khai làm chậm NGƯỜI DÙNG THẬT.** p50 C-Chain công khai đi
  22ms → 236ms → 1.720ms → **3.852ms** theo mức tải. Và ngưỡng chốt an toàn cũ
  (4.000ms) cao tới mức **không bao giờ bắt được** điều đó; đã hạ về 1.500ms.
- **Trần TPS KHÔNG phải tham số genesis** (đính chính M9.3). Nâng gasLimit 5 lần
  không đổi thông lượng; block chỉ đầy 16%; nút thắt ở đường nạp giao dịch của node
  ~230 tx/s. Xem D-033.

### Thêm từ phiên 2026-08-25 (thứ tư, đợt 1)
- 🔴 **`Verify()` của config subnet-evm KHÔNG phải hợp đồng về tính chạy được.** Nó
  kiểm **hình dạng**, không kiểm **hệ quả**. `minBaseFee: 0` qua sạch
  (`commontype/fee_config.go` chỉ từ chối số âm) rồi làm chain **không đẻ nổi block
  nào** vì `customheader/block_gas_cost.go:94` từ chối `baseFee.Sign() <= 0`, và chỗ
  gọi nó là `FinalizeAndAssemble` — đường **dựng** block, không phải đường kiểm block
  của người khác. Với genesis (bất biến), khoảng cách giữa "cấu hình hợp lệ" và
  "chain sống được" là chỗ lọt những chain chết vĩnh viễn ngay lúc sinh ra.
- 🔴 **Precompile khai `blockTimestamp > 0` thì ở BLOCK 0 nó CHƯA hoạt động, và
  `eth_call` lúc đó trả `0x` RỖNG — không phân biệt được với "khoá cấu hình bị bỏ
  qua".** Dính đúng thế với Warp: bài kiểm báo "Warp TẮT" trên chain mà `warpConfig`
  nằm đúng chỗ trong genesis (đã đối chiếu md5 với server, và đọc lại file console
  đưa cho CLI). Genesis khai `"timestamp": "0x0"` nên block 0 có thời gian 0, trong
  khi Warp buộc phải bật ở ≥ mốc Durango. **Phải đẩy chain qua block 0 rồi mới đọc**,
  và báo cáo cả hai lần đọc — chênh lệch giữa chúng mới là bằng chứng.
- 🔴 **Bẫy nonce không nằm ở "giao dịch bị từ chối" — nó nằm ở MỌI giao dịch thứ hai
  của cùng một ví.** `tx.wait(1)` đã trả về mà lượt `getTransactionCount("pending")`
  kế tiếp vẫn đọc ra số cũ ⇒ `nonce too low`. Chỉ cắn khi hai lượt gần nhau đủ, nên
  nó biểu hiện thành **đỏ ngẫu nhiên** — thứ làm người ta mất niềm tin vào bài kiểm.
  Cách chữa: mọi lượt gửi đi qua một hàm đọc nonce tươi + thử lại **chỉ với lỗi nonce**.
- **Trần TPS chuyển nút thắt sang BỘ BƠM khi nâng gasLimit.** Mỗi ví gửi tuần tự
  (`await` một vòng RPC mỗi giao dịch, ~290ms) ⇒ **~3,45 tx/s mỗi ví**. Nên "đo trần
  chain" mà giữ nguyên số ví là đang đo cái script. Xem M9.4.
- **`docker compose config` không đủ để tin là file đã lên server.** `console-deploy.sh`
  bản đầu chỉ đối chiếu md5 của `server.mjs`, nên một thay đổi nằm trọn trong
  `presets.mjs` hay `9chain-a1-config/l1-evm-genesis.json` có thể **không lên** mà
  script vẫn in "✓ khớp" rồi restart. Nay nó đối chiếu **mọi** file đã chép.

### Thêm từ phiên 2026-08-25 (thứ ba)
- 🔴 **`pgrep -f "<chuỗi>"` trong vòng lặp canh chừng TỰ THẤY CHÍNH NÓ** — cùng họ với
  bẫy `pkill -f` đã ghi bên dưới, nhưng dính ở chỗ khác nên vẫn vấp. Lệnh
  `while pgrep -f "load-test.mjs"; do sleep 60; done` có chuỗi `load-test.mjs` **trong
  chính dòng lệnh của nó** ⇒ điều kiện luôn đúng ⇒ canh mãi không bao giờ kết thúc,
  dù tiến trình thật đã xong từ lâu. Nó **không báo lỗi**, chỉ im lặng chờ.
  Dùng mẹo ngoặc vuông: `pgrep -f "[t]ai-test.mjs"`. Áp dụng cho `pgrep`, `pkill`,
  `ps | grep` — bất cứ thứ gì so khớp trên toàn bộ dòng lệnh.
- 🔴 **Chụp chain data phải DỪNG node trước khi `tar`.** leveldb đang ghi thì bản chép
  không nhất quán và hỏng **im lặng** — file có đủ, mở ra mới biết. Quy trình đã chạy
  thật: `docker stop node-5` → `tar` → **`docker start` ngay** → kiểm `5/5 connected`
  → mới kéo file về. Chỉ cần chụp **một** node (5 validator giữ cùng lịch sử).
- **Đo dung lượng chain phải đo dài.** Xem mục soak ở đầu file: ước lượng từ mẫu ngắn
  lệch **30 lần**. Với thứ tăng theo bậc thang (compaction định kỳ), mẫu vài phút nói dối.

### Thêm từ phiên 2026-08-25 (thứ hai)
- 🔴 **`docker stats --no-stream` KHÔNG dùng để kết luận được.** Cùng container
  `backend` đo ba lần ra 50,65% · 4,20% · 39,46% — tôi đã kết luận rồi tự phản bác rồi
  lại kết luận. Phép đo đúng là **CPU tích luỹ từ lúc container khởi động**:
  `cat /sys/fs/cgroup/system.slice/docker-<id-đầy-đủ>.scope/cpu.stat` → `usage_usec`,
  chia cho thời gian sống. Ra `backend` = **48,76% trung bình liên tục**, không mơ hồ.
- 🔴 **`eth_estimateGas` ước lượng THIẾU cho giao dịch ĐẦU TIÊN của chain vừa đẻ.**
  Đo có đối chứng trên cùng chain: block 1 → 52037 (hết gas, `status 0`); block 2 trở
  đi → 54183 (chốt được). Nó **giả dạng "tính năng không tồn tại"** vì receipt chỉ có
  `status: 0`, không lý do. Tín hiệu tách bạch: **`eth_call` cùng lời gọi đó THÀNH
  CÔNG** (eth_call chạy trần gas rất lớn) ⇒ vấn đề GAS, không phải cấu hình. Xem D-025.
- 🔴 **Phí gas KHÔNG bao giờ đúng bằng 0 trên subnet-evm.** `legacypool.go:158`
  `PriceLimit` mặc định 1 wei và **dòng 195 tự ép về 1 nếu cấu hình thấp hơn**. Giao
  dịch giá gas 0 bị node NHẬN rồi không bao giờ vào block — hỏng im lặng. Xem D-026.
- **Precompile: phân biệt ba trạng thái bằng `readAllowList`** — trả `0x` RỖNG =
  precompile TẮT · trả `0` = bật nhưng không quyền · trả `2` = Admin. Nhầm "0x rỗng"
  với "0" là chẩn đoán sai hoàn toàn nguyên nhân.
- **Bài nghiệm thu chạy console THẬT phải bị chặn cứng khỏi mạng thật**:
  `A1_COMPOSE_FILE=/khong-ton-tai/...` để lệnh docker nào lọt qua cũng chết vì thiếu
  file thay vì restart 5 validator của mạng công khai. Xem D-023.
- **Bài nghiệm thu không được cắm cứng dữ liệu của một máy** — bản đầu cắm tên chain
  chỉ có ở máy dev, chạy trên server thì báo đỏ ở chỗ code hoàn toàn đúng. Xem D-024.
- **`cat >> BLOCKERS.md` đẩy mục mới xuống dưới "Đã gỡ".** Dính hai lần trong một
  phiên. Dùng Edit chèn đúng chỗ, đừng append.
- 🔴 **`ethers` CÓ trên server, nhưng chỉ ở `local-net/faucet/`.** Ghi chú cũ "thư mục
  gốc không có node_modules" đúng mà thiếu vế này, và vế thiếu suýt đẩy M4.1 sang
  hướng tự viết secp256k1. Đo: `~/9chain-a1/src` → `ERR_MODULE_NOT_FOUND`;
  `~/9chain-a1/src/local-net/faucet` → **OK 6.17.0**. Node phân giải từ thư mục chứa
  FILE đi lên, nên `smoke-l1.mjs` (ở trong `faucet/`) import được còn console thì không.
  Cần thư viện cho console ⇒ cấp `package.json` riêng theo đúng khuôn `faucet/`.
- 🔴 **Thu hồi chain KHÔNG rút node khỏi tập validator P-Chain.** Nên
  `platform.getCurrentValidators({subnetID})` **vẫn trả đủ 5 validator cho chain đã
  chết hẳn** — đúng phép đo mà trang `/chains/` dùng để phân biệt sống/chết. Chain đã
  thu hồi PHẢI vẽ từ mảng `retired` với nhãn riêng, tuyệt đối không đem đo bằng
  heuristic chain sống: nó sẽ nói dối rất thuyết phục.
- 🔴 **Chain đã thu hồi giữ chỗ `name` + `chainId` VĨNH VIỄN.** Thu hồi không xoá được
  mạng khỏi ví người dùng; cấp lại chainId là để ví của người từng dùng chain cũ lặng
  lẽ trỏ vào chain của người khác, chữ ký phát lại được. `createChain` kiểm trùng trên
  `chains ∪ retired`.
- **`COPY --from=builder … CACHED` KHÔNG có nghĩa là build giả.** Suýt kết luận M0.6
  chưa đạt vì thấy dòng đó. Thực tế các bước build Go chạy tươi 68s/89s/65s; `COPY`
  được cache CHÍNH VÌ output trùng digest. Ba thứ khác nhau, phải đo thứ cuối: **bước
  build có chạy không ≠ layer có cache không ≠ binary có giống không.** Phép đo đúng
  là `sha256sum` chính binary trong image, so với binary đang chạy thật.
- 🔴 **`git bundle` cho repo fork avalanchego sinh ra BACKUP GIẢ.** `git bundle verify`
  in "is okay" **và** "The bundle records a complete history", nhưng clone ngược chết:
  `remote did not send all necessary objects`. Repo fork là **shallow clone** (ranh giới
  `1cf1fc3`); bundle từ repo shallow luôn hỏng, kể cả khi chỉ bundle một nhánh.
  ⇒ **`git bundle verify` KHÔNG đủ để tin — phép đo đúng là CLONE NGƯỢC.**
- 🔴 **`git am` PHẢI có `--keep-cr` khi áp patch series của cây fork.** Thiếu nó thì mọi
  tệp CRLF (ví dụ `netgen/main.go`) bị đổi hết xuống dòng ⇒ tree hash LỆCH ⇒ "sao lưu"
  khôi phục ra một cây khác. `apply-sovereign.sh` và `rebase-drill.sh` **đã** có cờ này;
  cái bẫy nằm ở chỗ ai đó gõ tay `git am` để kiểm chứng rồi kết luận series hỏng.
  Đã dính đúng thế 2026-08-26 và suýt báo động nhầm là dự án có lỗi.
- 🔴 **`patches/` KHÔNG tự cập nhật.** Đo 2026-08-26: nhánh `9chain-a1` có **5** commit
  chủ quyền nhưng `patches/` chỉ có **4** — commit `netgen: khai --chain-config-dir`
  (thứ mở đường bật API Warp, M6.2) **chưa bao giờ được xuất ra**. Nó sẽ bốc hơi ở lượt
  `apply-sovereign.sh` kế tiếp, im lặng. **Commit vào cây fork xong PHẢI chạy lại**
  `git format-patch 1cf1fc3..9chain-a1 -o patches/ --no-signature` và commit `patches/`.
  ⇒ Sao lưu fork bằng **patch series**: `git format-patch 1cf1fc3..9chain-a1` (**12 patch**
  tính tới 2026-08-26; con số này TĂNG theo mỗi commit chủ quyền — xem `patches/`)
  + ghi commit upstream gốc. Nghiệm thu bằng cách áp lên base rồi so **tree hash**
  (**`ac260a38`** tính tới 2026-08-27), **không so commit hash** — `git am` ghi lại committer nên commit hash
  đổi trong khi cây mã nguồn vẫn đúng từng byte.
  ⚠️ **Hai con số này đã trôi lệch một lần** (chỗ này còn ghi "6 patch / `04c59acf`" trong
  khi đầu file ghi 8 — sửa 2026-08-26). Đổi patch series thì phải sửa **cả hai chỗ**.
- **Đừng dùng `apply-sovereign.sh` để diễn tập rebase** — nó kết thúc bằng
  `git branch -f 9chain-a1 HEAD`, tức là **ghi đè nhánh thật**. Dùng `rebase-drill.sh`
  (worktree tách rời + chốt chặn xác nhận nhánh thật không đổi hash).
- **`vms/saevm/sae` vốn đã đỏ và KHÔNG ổn định** ở upstream: đỏ sau 45.5s khi chạy cả
  suite, treo tới hết timeout 600s khi chạy riêng. Không phải do fork. Đừng đuổi theo.

### Thêm từ phiên 2026-08-25 (đầu tiên) — đều đo được, không suy đoán
- 🔴 **Trần cứng 16 subnet/node.** Peer khai >16 subnet lúc bắt tay P2P thì node nhận
  gọi `p.StartClose()` — **cắt kết nối** (`network/peer/peer.go:882`), và bên gửi
  KHÔNG cắt bớt danh sách (`message/outbound_msg_builder.go:266`). Track quá 16 L1 là
  bị mọi peer ngắt: **mạng vỡ**, và vỡ kiểu khó đoán nhất — node vẫn chạy, log phía nó
  vẫn sạch. Console đã chặn ở hai chỗ. Trần này là của **mô hình "mọi validator track
  mọi L1"**, vượt qua phải đổi kiến trúc (ACP-77), không phải nới số.
- 🔴 **Bind-mount MỘT FILE + `mv` = container thấy file CŨ vĩnh viễn.** Docker gắn theo
  **inode**; `mv` tạo inode mới ở cùng đường dẫn. Ác ở chỗ mọi dấu hiệu đều báo thành
  công: `grep` trên host thấy bản mới, `caddy validate` in "Valid configuration",
  `caddy reload` không lỗi — **cả hai đều đọc file cũ**. Đo được: host inode `25045995`
  vs container `25043225`. Phải `cp` (giữ inode) rồi **so md5sum host với trong
  container**. Lỡ `mv` rồi thì chỉ còn recreate (đo được: Caddy recreate tốn **1.2s**).
  Trong dự án này: `Caddyfile` và `chains-nginx/default.conf` là mount file đơn lẻ;
  `9chain-a1-config/` và `local-net/chains/` là mount thư mục (an toàn).
- 🔴 **KHÔNG chờ `health.health` trả `healthy:true` giữa đợt rollout subnet mới** — đó
  là **deadlock theo thiết kế**. Node đầu tiên track subnet mới là node duy nhất trên
  subnet đó → `connected to 20%; required at least 80%`; nó chỉ khoẻ khi các node khác
  cũng restart, mà chúng chờ nó khoẻ. Và **không lọc bằng `?tag=` được**: check
  `bootstrapped` đăng ký `ApplicationTag` (toàn cục) nên luôn có mặt. Điều kiện đúng:
  đọc riêng `P`/`X`/`C`, đòi không có `error`.
- **`/ext/health/liveness` là tín hiệu YẾU** — trả 200 ngay khi HTTP server lên, TRƯỚC
  khi C-Chain sẵn sàng. Dùng nó cho health check của Caddy thì Caddy quay lại node
  chưa sẵn sàng quá sớm. Cách chữa: để **passive thắng** (`fail_duration 30s`,
  `max_fails 1`) — Caddy đòi cả hai điều kiện đạt nên liveness xanh sớm không kéo node về sớm.
- **"Đã chép ≠ đang chạy".** Upload console rồi quên restart là bản cũ vẫn phục vụ, không
  dấu hiệu nào. Dùng `console-deploy.sh` (gộp chép + restart + đối chiếu md5sum).
- **`docker compose config --services` KHÔNG giữ thứ tự trong file** (trả node-4 trước
  node-1). Thứ tự ngẫu nhiên làm sự cố không tái hiện được — phải tự sắp xếp.

### Bảo mật / hạ tầng
- 🔴 **Vá cấu hình trong `explorer-full/blockscout/` là VÁ TẠM — thư mục đó bị
  `.gitignore`.** Nó là bản clone upstream; `setup.sh` clone lại là bản vá biến mất
  không dấu hiệu. Mọi thay đổi compose Blockscout phải đặt ở
  `explorer-full/9chain-a1-server.override.yml` (dùng `ports: !override`, `!override`
  cần thiết vì upstream khai `ports` dạng dài và compose sẽ MERGE chứ không thay).
  Kiểm chứng đúng cách: **hoàn nguyên file upstream về nguyên gốc** rồi chạy
  `docker compose -f geth.yml -f ../../9chain-a1-server.override.yml config` — nếu vẫn
  ra giá trị mình muốn thì override tự đứng được. Dính ở B-5.
- 🔴 **Docker publish cổng ĐI VÒNG QUA ufw.** `ports: "9650:9650"` = hở thẳng ra Internet dù `ufw status` báo chặn (ufw lọc `INPUT`, Docker dùng DNAT bảng `nat`). Kiểm tra thật bằng `sudo ss -tlnp | grep 9650`, **đừng tin `ufw status`**.
- 🔴 **Ubuntu cloud image: sửa `PasswordAuthentication` trong `/etc/ssh/sshd_config` KHÔNG có tác dụng.** `Include sshd_config.d/*.conf` ở dòng 12 mà sshd lấy **giá trị gặp ĐẦU TIÊN** → `50-cloud-init.conf` thắng. Phải sửa đúng file đó + `/etc/cloud/cloud.cfg.d/99-disable-ssh-pwauth.cfg`. **Kiểm chứng bằng `sudo sshd -T | grep passwordauth`.**
- 🔴 **A1 và C1 dùng chung zone Cloudflare `9chain.org`.** SSL/TLS mode là thiết lập **cấp zone** — đổi sang `Full (strict)` là C1 chết ngay (lỗi 526, C1 dùng cert tự ký). **Trước khi đổi bất kỳ thiết lập cấp zone/tài khoản nào, kiểm tra ai khác đang dùng chung.**
- **Cloudflare Proxied**: ACME không xin được cert (C1 đã thử, thất bại 2026-07-19) → dùng `tls internal`. IP thật ở header **`CF-Connecting-IP`** — không xử lý thì rate-limit gom cả thế giới vào 1 khoá. Đặt `A1_TRUST_PROXY=1`, kiểm chứng bằng `/faucet/whoami`.
- **Đổi cấu hình Caddy phải `caddy reload`, KHÔNG `--force-recreate`** — recreate làm Caddy chết vài giây, ví poll RPC mỗi ~4s nên MetaMask hiện "Unable to connect" và **giữ nguyên banner** tới khi người dùng đổi mạng qua lại.
- **`pkill` không giết `node.exe` trên Windows** → `netstat -ano | grep :PORT` rồi `taskkill //F //PID`. Từng để console CŨ (bind `0.0.0.0`, chưa auth) sống song song bản mới; `localhost` phân giải `::1` nên request rơi vào bản cũ. **Siết bảo mật xong phải kiểm tra tiến trình cũ đã chết hẳn.**
- 🔴 **`ssh host 'pkill -f "console/server.mjs"; ... khởi động lại'` TỰ GIẾT CHÍNH NÓ.** `pkill -f` khớp trên **toàn bộ dòng lệnh**, mà dòng lệnh `bash -c` của phiên ssh có chứa đúng chuỗi đó → shell chết trước khi kịp bật lại, console nằm im mà không báo lỗi gì. Dùng mẹo ngoặc vuông: `pkill -f "[c]onsole/server.mjs"`. Sau khi bật lại **luôn kiểm chứng bằng `ss -tlnp | grep 8091` từ một phiên ssh KHÁC**, đừng tin dòng banner trong log (log cũ trông y hệt).

### Web / giao diện
- 🔴 **Trang public KHÔNG được cắm cứng `localhost` làm endpoint.** Trình duyệt người xem phân giải `localhost` thành MÁY HỌ → trang tải từ server nhưng số liệu lấy từ máy khách. Explorer + dashboard đều đã dính. Suy từ `location.hostname` (quy ước: trang ở `<host>`, RPC ở `rpc-<host>`).
- **Avalanche KHÔNG đẻ block rỗng** — chain chỉ sinh block khi có giao dịch. Số block đứng yên là BÌNH THƯỜNG, không phải chain chết. Đã ghi giải thích ngay trên trang explorer.
- MetaMask **chỉ nhận chainId dạng hex** (`0x218711a09`), truyền số thập phân sẽ lỗi.

### Đẻ chain / subnet
- 🔴 **Track ≠ validate.** Subnet mới đẻ có tập validator RỖNG. Chain đó vẫn trả lời `eth_chainId`, vẫn đọc được số dư, MetaMask vẫn kết nối — chỉ là **giao dịch không bao giờ chốt**. Cộng với việc Avalanche không đẻ block rỗng, không có dấu hiệu bề ngoài nào phân biệt được. Nghiệm thu một L1 **bắt buộc** gửi giao dịch thật: `node local-net/faucet/probe-l1.mjs <RPC_URL> [PRIVKEY]`.
- Validator subnet (hậu Durango) **phải** đang là validator primary; thời hạn ≥ 24h và **không vượt hạn primary** — CLI trừ hao 60s vì P-Chain tiến timestamp lúc đang ký.
- **`docker compose exec` KHÔNG mang env của tiến trình gọi nó vào container** — phải `-e VAR=...` tường minh.
- **`execFile` nhét nguyên dòng lệnh vào `err.message`** → truyền khoá bằng `-e` rồi trả `e.message` cho client là ném khoá ra ngoài. Console đã bọc `docker()` để xoá khoá.
- Hậu Etna, P-Chain dùng **phí động**; các số của `info.getTxFee` (`createSubnetTxFee: 0.1 LOVE9`) **không còn được dùng**. Phí thật đo được: **0.000141468 LOVE9/lượt đẻ chain**.
- Luồng hiện tại là **subnet cổ điển** (`AddSubnetValidatorTx`), CHƯA phải L1 chuẩn ACP-77 (`ConvertSubnetToL1Tx`) — nên chưa có phí duy trì liên tục.
- 🔴 **Tự cấp chainId KHÔNG được dùng `9100 + số chain`.** Chỉ cần một lượt trước đó tự chọn chainId là công thức đếm đâm trúng số đã dùng (OmegaChain chọn 9101, chain thứ hai tự cấp cũng ra 9101). Hai L1 trùng chainId là hố sụt: MetaMask coi chúng là **một mạng**, và chữ ký của chain này **phát lại được** trên chain kia. Console nay quét số còn trống và chặn chainId trùng.
- **Địa chỉ admin phải validate bằng EIP-55, không chỉ regex 40 hex.** Genesis đã đẻ là bất biến; gõ sai 1 ký tự vẫn "đúng hình thức" và chain ra đời **vô chủ vĩnh viễn** — không lỗi, không dấu hiệu. `local-net/lib/eip55.mjs` tự viết keccak-256 vì `~/9chain-a1/src` trên server **không có package.json/node_modules**: thêm `import ... from "ethers"` là console chết lúc khởi động dù máy dev chạy ngon.
- **`console-chains.json` là hợp đồng dữ liệu với trang `/chains/`** — nay có thêm khoá `admin`. Thêm khoá thì an toàn, **đổi/bỏ khoá cũ là làm hỏng trang danh bạ**. Khoá mới **chỉ có trên bản ghi mới**: OmegaChain (đẻ trước) không có `admin`. Mọi trang đọc file này phải coi khoá thiếu là trạng thái hợp lệ ("mặc định"), không phải lỗi — và tuyệt đối không để `undefined` lọt ra mặt người dùng.
- **Container `9chain-a1-chains` bind-mount thẳng `~/9chain-a1/src/local-net/chains` (ro)** → `scp` xong là trang đổi ngay, **không cần restart/rebuild**. Nhưng kiểm chứng phải xem **trang thật qua Cloudflare**, không chỉ `curl 127.0.0.1:8093`: trang này render toàn bộ bằng JS sau khi fetch RPC, `curl` chỉ thấy khung HTML rỗng.

### avalanchego / fork
- **Tham số kinh tế mạng tuỳ chỉnh KHÔNG đọc từ `genesis.GetStakingConfig`** — `config/config.go` chỉ khoá cứng cho Mainnet/Fuji; mọi networkID khác lấy từ **cờ CLI viper** mặc định `LocalParams`. Thêm `case A1NetworkID` vào `params.go` là **chưa đủ**, phải vá cả `getStakingConfig` và `getTxFeeConfig`. Kiểm tra: `docker logs 9chain-a1-node-1 2>&1 | head -1 | grep -o '"maxValidatorStake":[0-9]*'` → phải ra `50000000000000000`.
- **KHÔNG build native trên Windows** (`utils/ulimit`) → luôn qua Docker.
- **Re-rebrand**: `rebrand.sh` tìm chuỗi GỐC upstream; đã rebrand rồi phải `git checkout --` 4 file identity trước.
- **Đổi EVM chainId / phân bổ genesis = re-genesis** → `docker compose ... down -v` rồi up; wipe cả Blockscout DB.
- `--http-allowed-hosts` mặc định `["localhost"]` → dịch vụ gọi node qua tên khác bị chặn với lỗi khó đoán (`JsonRpcProvider failed to detect network`). netgen nay luôn set cờ này.
- **Bind loopback làm container mất đường tới node**: `host.docker.internal` trỏ IP bridge, không phải loopback host. Cách đúng: `--network net_a1net` + `http://172.28.0.11:9650`.
- netgen `--public-ip` = IP nội bộ docker → node NGOÀI không join P2P được.
- networkID Avalanche là **uint32** — không thể là 9000000009; chỉ EVM chainId mới là số 9 tỷ.
- 🔴 **"L1 EVM chưa bật Durango → compile `evmVersion:'paris'`" là SAI — đã đo, đã bỏ.**
  Durango **ĐANG BẬT** trên mọi L1 của ta. Phép đo: deploy `0x5f5ff3` (PUSH0 PUSH0
  RETURN) trên chain 9122 → **status 1**, block 2. Nếu PUSH0 không tồn tại thì đó là
  opcode lạ và deploy phải revert.
  Lý do ở source: networkID 9001 không phải Mainnet/Fuji ⇒ `upgrade.GetConfig` trả
  `Default`, ở đó `DurangoTime = InitiallyActiveTime` (2020-12-05) — cùng lý do
  Etna/Granite cũng bật sẵn. ⇒ **Compile contract bằng EVM version mặc định, đừng hạ
  xuống `paris`.** Ghi chú cũ khiến người ta tự trói vào một EVM cũ hơn cần thiết.

### Blockscout
- 🔴 **`dets`/`logs` sai đường dẫn VÀ sai UID** → backend crash-loop `{:file_error, "./dets/queue_storage", :eacces}` chôn trong stack trace Erlang. Compose giải `./dets/` tương đối theo **thư mục chứa file khai** (`services/backend.yml`) → là `services/dets`. Process chạy UID **10001**, không phải 1000. Đã đóng gói vào `explorer-full/9chain-a1-server.env.sh`.
- **nginx cache DNS lúc khởi động** — proxy lên khi backend còn crash sẽ giữ mãi 502; `docker restart proxy frontend` sau khi backend ổn.
- API v2 ở **cổng UI** (`/api/v2/...` trên 8100), không phải 8101.
- Nút "Add network to MetaMask" chỉ hiện khi có `NEXT_PUBLIC_NETWORK_RPC_URL`.
- `explorer-full/setup.sh` cắt block cũ theo marker rồi append lại (bản đầu dùng `grep -q || cat >>` sai chuỗi → append trùng mỗi lần).

---

## Lệnh hữu ích

```bash
cd /c/PROJECTS/9Chain-A1
bash local-net/gen-network.sh 5                        # sinh mạng dev local
A1_NET_DIR=local-net/net-public bash local-net/gen-network.sh 5   # sinh bộ public (khoá mới)
bash local-net/up-all.sh                               # bật stack local (cần A1_CONSOLE_TOKEN)
docker compose -f local-net/net/docker-compose.multinode.yml up -d
```

```bash
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'docker ps --format "{{.Names}}\t{{.Status}}"; uptime; df -h /'
```

```bash
curl -s -X POST -H 'content-type:application/json' --data '{"jsonrpc":"2.0","id":1,"method":"platform.getCurrentValidators"}' https://rpc-a1.9chain.org/ext/bc/P | python -c "import json,sys; v=json.load(sys.stdin)['result']['validators']; print(len(v),'validators,',sum(1 for x in v if x.get('connected')),'connected')"
```

```bash
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'docker exec 9chain-a1-caddy caddy reload --config /etc/caddy/Caddyfile'
```

Nghiệm thu tự động — **dùng cái này thay cho mở trang nhìn bằng mắt**:
```bash
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'cd ~/9chain-a1/src && node local-net/faucet/smoke-l1.mjs'
```
Chế độ nhẹ chỉ đọc, không tốn tiền, chạy bao nhiêu lần cũng được. Thêm `--create-chain`
để nghiệm thu đường đẻ chain đầy đủ (đẻ chain thật + giao dịch thật + đo gián đoạn
+ **tự thu hồi chain vừa đẻ**) — mất ~6 phút, **chạy lại được vô hạn** từ M4.4.
Thêm `--giu` nếu muốn giữ chain lại soi bằng tay (khi đó nó ăn một slot vĩnh viễn).

Kiểm có cổng nào hở ra Internet không — **đo TỪ NGOÀI**, không tin `ufw status`
(Docker publish đi vòng qua ufw; đây là cách B-5 lọt). Có đối chứng ngược:
```bash
bash local-net/deploy/check-ports.sh
```

Dựng + deploy giao diện (M10) — `web-deploy.sh` tự nghiệm chứng **chunk JS thật, API
faucet, và mọi liên kết nội bộ (đo NỘI DUNG, không chỉ mã HTTP)**:
```bash
cd web && pnpm build && cd .. && bash local-net/deploy/web-deploy.sh
```

Nghiệm thu Warp/ICM (M6.2) — **đẻ 2 chain thật, mỗi bài ~13 phút, tự thu hồi cả hai**:
```bash
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'cd ~/9chain-a1/src && set -a; . ~/9chain-a1/console.env; set +a; node local-net/faucet/warp-test.mjs'
```
```bash
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'cd ~/9chain-a1/src && set -a; . ~/9chain-a1/console.env; set +a; node local-net/faucet/bridge-test.mjs'
```
Cần **2 slot L1 cùng lúc**. Thêm `--giu` để giữ chain lại soi tay.

Dựng lại artifact hợp đồng cầu sau khi sửa `local-net/contracts/AssetBridge.sol`
(solc KHÔNG nằm trong repo — cài tạm ở đâu cũng được):
```bash
npm install solc@0.8.28 && node local-net/contracts/compile.mjs --solc ./node_modules/solc
```

Diễn tập rebase lớp chủ quyền lên upstream mới (worktree tách rời, không đụng nhánh thật):
```bash
bash scripts/rebase-drill.sh              # thử lên origin/master
```

Đo gián đoạn RPC trong lúc làm thao tác nặng:
```bash
node local-net/faucet/probe-net.mjs https://rpc-a1.9chain.org/ext/bc/C/rpc --giay 120
```

Đồng bộ console lên server (chép + khởi động lại + **tự kiểm chứng**, một lệnh):
```bash
bash local-net/deploy/console-deploy.sh
```

Đổi cấu hình Caddy (`cp` giữ inode + so md5sum + validate + reload, **không** recreate):
```bash
scp -i "$A1_SSH_KEY" local-net/deploy/Caddyfile "$A1_SSH_HOST":'~/9chain-a1/Caddyfile.new' && ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" '~/9chain-a1/caddy-deploy.sh'
```

Đồng bộ trang danh bạ L1 (bind-mount → có hiệu lực ngay, không restart):
```bash
scp -i "$A1_SSH_KEY" local-net/chains/index.html "$A1_SSH_HOST":'~/9chain-a1/src/local-net/chains/'
```

Đẻ thử một chain có chủ riêng (chạy TRÊN server; đổi `<0xADMIN>` thành ví của bạn):
```bash
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'set -a; . ~/9chain-a1/console.env; set +a; curl -sS -X POST http://127.0.0.1:8091/api/create -H "content-type: application/json" -H "authorization: Bearer $A1_CONSOLE_TOKEN" -d "{\"name\":\"TenChain\",\"admin\":\"<0xADMIN>\"}"'
```

Backup + phục hồi (đọc `RESTORE.md` trong đó, có quy trình từng mục đã chạy thử):
```bash
ls /c/PROJECTS/9Chain-backups/9chain-a1-backup-20260825-064053/
```
Kiểm toàn vẹn bản backup bất cứ lúc nào:
```bash
cd /c/PROJECTS/9Chain-backups/9chain-a1-backup-20260825-064053 && sha256sum -c <(grep -E '^[0-9a-f]{64} ' MANIFEST.txt)
```

Tài liệu: `docs/PROGRESS.md` (nhật ký chi tiết) · `docs/DEPLOY-KSGAME.md` (runbook server) · `docs/TOKENOMICS.md` · `docs/DEPLOY-TESTNET.md` (đa VPS, đường lên mainnet) · `docs/ARCHITECTURE.md`.
