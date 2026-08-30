# NGÀY G `2026-09-01` — BẢY THỨ KHÔNG NẰM TRONG RUNBOOK NÀO

> 🔴 **ĐÍNH CHÍNH `2026-08-30` — lượt diễn tập đề xuất ở §2 ĐÃ CHẠY, và nó bác hai điều trong
> chính tệp này.** Đọc `DECISIONS.md` **D-123→D-128**. Ba thay đổi:
> - **`N=9`, không phải `N=10`** — Hetzner **THAY** một node OVH (D-126 khôi phục D-046).
> - **Giữ `A1_STAKING_PORT_BASE` mặc định `9651`** — bẫy `9660` ở §2.1 **không tồn tại**, đã đo
>   (D-125). §2.1 tự khai nó *"chưa ai thấy xảy ra"* — và đó hoá ra là câu đúng nhất trong mục.
> - **Chỗ hở thứ TÁM, tệp này không có:** `A1Gen` nằm trong **patch 0018**, nên bump thế hệ là
>   **sửa `patches/`** ⇒ sinh lại cả bộ + đổi hai hằng số tree (D-123).
>
> Phần vẫn đúng: G-1…G-7, và lập luận *"tập ở `A1Gen 1` an toàn theo kiến trúc"* (§2.2) — lượt
> tập xác nhận, kể cả điều **image lượt tập dùng lại được ngày G**.

> **Đo `2026-08-29`, phiên sau khi D-122 chốt node10 vào genesis.**
> Tệp này **không** thay `docs/GDAY-A1-REMAINING.md` (thẩm định tổng) hay
> `docs/GDAY-NODE10-HETZNER.md` (quy trình node10). Nó là **danh sách chỗ HỞ**: thứ ngày G
> cần mà `gday-preflight.mjs` không in ra, không cổng nào canh, và không tài liệu nào nhận.
>
> 🔴 Luật vẫn là [`CLAUDE.md`](../CLAUDE.md). Mâu thuẫn về **số đo** thì `HANDOFF.md` thắng.

## 0. Số đo nền — chạy lúc soạn tệp này

```
node scripts/gday-preflight.mjs        # 2026-08-29T13:20:28Z
15 đạt · 3 đỏ · 0 không chạy được · 0 bỏ qua · 17 việc tay
```

Ba đỏ **đỏ đúng lý do**, đã ghi sổ, **không vá cho xanh**: `watch-network` (validator 10 ·
B-12 14 ngày — hệ quả D-119) · `drift` (3 mồ côi `heartbeat-*`) · `net*` (B-19).
Fork tree **25 patch → `f2b9486b`** ✓, đối chứng **24/25 → `074aaa93`** ✓, G4 ✓.

⇒ **17 việc tay trong preflight là đúng và xếp đúng thứ tự.** Không có mục nào sai. Vấn đề
nằm ở thứ **không có trong đó**.

---

## 1. Bảy chỗ hở

Cột *"đo bằng gì"* nói rõ mục nào là **phép đo của phiên này** và mục nào là **trích lại**.

### 🔴 G-1 · Không ai sao lưu danh tính 10 validator của `g1` (B-20)

| | |
|---|---|
| đo bằng gì | đọc `BLOCKERS.md` B-20 + đếm `MANUAL_TASKS` trong `gday-preflight.mjs` |
| sự thật | B-20 **tự khai** *"sinh mạng mới ⇒ danh tính mới ⇒ việc này phải làm LẠI"* — nhưng **không có một việc tay nào** nhắc tới nó |
| vì sao đắt | Đúng tình trạng hôm nay lặp lại nguyên vẹn ở thế hệ mới: hai gói lưu mới nhất chứa **0 tệp** `staker.key`/`signer.key` ⇒ server hỏng là **không dựng lại được mạng**, trong khi `h6b-backup.sh --check` vẫn xanh. H-6b đo bằng **số patch**; số patch đúng mà nội dung trống thì bản lưu vô dụng |
| ai | A1 gom + David cất |

⇒ **Đã thêm việc tay** (`AFTER the network is up`). Nghiệm thu là **ĐẾM tệp trong gói**, không
đọc dòng `--check`. Và **đừng cất cạnh khoá quỹ**: `check-key-leaks.mjs` canh khoá quỹ,
**không** canh danh tính validator.

### 🔴 G-2 · `docs/RUN-A-VALIDATOR.md` chưa tồn tại

| | |
|---|---|
| đo bằng gì | `ls docs/` — **không có tệp nào** tên `RUN-A-*`; `PROGRESS.md:530` M3.4 vẫn `[ ]` |
| sự thật | P2-1 của [`TESTNET1-PUBLIC-2026-09-01.md`](TESTNET1-PUBLIC-2026-09-01.md) chưa ai nhận |
| vì sao đắt | Nó là **điều kiện qua số 5 của chính ngày 01/09** (*"tài liệu validator chạy được"*), và điều kiện qua số 3 (*"một node NGOÀI máy chủ đang là peer"*) không thay được nó: node10 là **máy của ta**, không phải người lạ |
| ai | **A1** — làm được ngay, không chờ ai |

⚠️ **Không** đưa vào việc tay: việc tay là *thứ không tự động hoá được*. Viết tài liệu thì A1
làm được ⇒ nó thuộc backlog, không thuộc runbook.

### 🔴 G-3 · Công bố `genesis.json` + bootstrap của `g1`

| | |
|---|---|
| đo bằng gì | đối chiếu điều kiện qua số 5 (`TESTNET1-PUBLIC` §4) với `MANUAL_TASKS` |
| sự thật | Không việc tay nào nói *"đưa genesis + nodeID + `IP:cổng` ra đường công khai"* |
| vì sao đắt | Người ngoài **không join được** nếu không có hai thứ đó. Thiếu nó thì `01/09` là **RPC công khai**, không phải **testnet công khai** — và phải gọi đúng tên nó |
| ràng buộc | 🔴 Đi qua **repo GitHub**, **không** qua `web/` (luật cứng #4 — worktree khác đang sống) |

⇒ **Đã thêm việc tay** (`AFTER deploying`).

### 🔴 G-4 · Deploy lại console + faucet với token/khoá MỚI

| | |
|---|---|
| đo bằng gì | đọc việc tay hiện có: *"Generate NEW token + keys"* — **dừng ở chữ *generate*** |
| sự thật | Sinh token mới mà không đưa lên server thì console công khai vẫn chạy token cũ, và `check-deploy-drift` chỉ nói được điều đó **sau khi** đã deploy |
| bẫy kèm | **gotcha 3**: `docker restart` **KHÔNG** nạp lại env. Faucet phải `docker rm -f` rồi `docker run`. Đã cháy thật ở lượt `27/08` (`insufficient funds`) |
| thêm | Console `g1` cấp chainId trong khối **`9001000000–9001999999`** (suy từ `A1_GEN`) — khác hẳn khối `g0`. Bản trên server phải là bản đã bump |

⇒ **Đã thêm việc tay** (`AFTER deploying`).

### 🔴 G-5 · Mặt công khai còn in số của thế hệ chết

| | |
|---|---|
| đo bằng gì | trích `PROGRESS.md:1343` (đo `28/08`): `main:web/lib/chain.ts` khai `networkId: 9001` — **lệch hai thế hệ**. Phần 9Scan là **suy ra**, không phải đo hôm nay |
| sự thật | `blockchainID` của C/X là **hàm của genesis bytes** ⇒ **chết theo mỗi lượt re-genesis**. Mọi nơi cắm cứng chúng sẽ trỏ vào hư không sau `g1` |
| vì sao đắt | Đây là thứ người ngoài **nhìn thấy đầu tiên**. Một trang in `networkID` của mạng chết trong ngày mở testnet là hỏng ở đúng bề mặt không cổng nào canh |
| ai | worktree `9Chain-A1-web` + `9Scan-A1` — **A1 không đụng**, chỉ báo |

⇒ **Đã thêm việc tay** (`AFTER deploying`) ở dạng **nhắc + đo**, không phải ở dạng tự sửa.

### 🔴 G-6 · Ba tệp `heartbeat-*` không có nguồn trong repo

| | |
|---|---|
| đo bằng gì | `grep -rl heartbeat` toàn repo ⇒ chỉ trúng `DECISIONS.md`, `HANDOFF.md` (tức **bản ghi về chính phát hiện này**) và `node_modules/ws/README.md`. **Không có mã nào sinh ra chúng** |
| sự thật | Chúng đang là **một trong ba cổng đỏ** (`check-deploy-drift`, hướng mồ côi) |
| vì sao đắt | Nếu đó là bộ bơm nhịp sống thì sau `down -v` nó bơm vào **một chain đã chết** — và ví của nó là ví thế hệ cũ. Kèm bẫy đã biết: `load-test.mjs` đồng bộ nonce bằng `latest`, một cú nấc RPC là ví chết hẳn trong khi log vẫn in *"đã gửi"* |
| 🔴 đừng làm | **Đừng khai vào `knownExtra` cho cổng xanh.** `manifest-deploy.json` `_extraDeleted` đã ghi rõ vì sao: khai một tệp chưa hiểu là **tự bịt mắt mình** |
| ai | **David** — A1 không ghi lên server |

⇒ **Đã thêm việc tay** (`BEFORE down -v`): nhận diện và **dừng** thứ đang ghi chúng, trước khi
mạng cũ biến mất và mất luôn manh mối.

### 🟡 G-7 · `check-chainid.mjs` chép cứng gốc dải — **hôm nay KHÔNG sai**

| | |
|---|---|
| đo bằng gì | `scripts/check-chainid.mjs:54` ⇒ `const GOC_DAI = 9_000_000_010;` · `:55` ⇒ `TRAN_DAI = 9_999_999_999` |
| vì sao **không** phải lỗ | Cổng lọc trên **cả không gian** `9000000010–9999999999`, mà khối `g1` (`9001000000–9001999999`) **nằm trọn bên trong** ⇒ sau khi bump `A1_GEN`, G4 **vẫn tra đúng chỗ** |
| vì sao vẫn ghi | Nó là **bản chép thứ hai** của một hằng số mà `local-net/lib/chainid.mjs` đã **suy ra** từ `A1_GEN`. `check-single-source` không bắt được (hai vế biểu diễn khác nhau, hôm nay bằng nhau ở gen 0) |
| xử lý | **Không sửa trước ngày G.** Sửa một cổng ngay trước lượt chạy thật là đổi thứ ta đang dựa vào. Ghi lại, làm sau |

---

## 2. Có cần diễn tập một lượt nữa không — **CÓ**

### 2.1 Vì sao: năm thứ chưa từng chạy, cả năm đang xếp vào sau `down -v`

| chưa từng chạy | lượt D-105 (`28/08`) phủ tới đâu |
|---|---|
| **`A1Gen = 1`** ở bất cứ đâu | tập ở `A1Gen 0`; D-105 **tự khai** *"không thay được lượt build ngày G"* |
| **netgen với `N=10`** | chưa. Xung đột cổng **`9660`** tìm ra bằng **đọc mã** (D-122), chưa ai thấy nó xảy ra |
| **`A1_P2P_MODE=ipv4port` + `A1_STAKING_PORT_BASE=9700`** | chưa |
| **node10 vào từ GENESIS qua Internet** | `29/08` (D-119) chứng minh đường **stake sau** — cơ chế khác hẳn |
| **khắc chữ BẬT trong một lượt sinh mạng đầy đủ** | cơ chế nghiệm thu trên mạng tập **3 node ở gen 0**, chưa lần nào với byte thật |

Đây đúng lớp lỗi D-105 đã chỉ tên: *"lượt đầu tiên bị xếp vào đúng ngày G"*.
Cộng luật cứng #2: một phát hiện **chưa ai thấy xảy ra** mới được kiểm một nửa — cổng `9660`
hôm nay là **suy luận từ mã**, không phải **số đo**.

### 2.2 Vì sao nó rẻ hơn tưởng — kiến trúc đã chừa sẵn băng tập

Đọc `upstream/avalanchego/utils/constants/network_ids.go`:

```go
A1IDGoc    uint32 = 999_999_999 // mạng THẬT   → gen 1: 999999998
A1IDGocTap uint32 = 899_999_999 // mạng TẬP    → gen 1: 899999998
A1Name    = "9chain-a1-g0"      // gen 1: 9chain-a1-g1
A1NameTap = "9chain-a1-tap-g0"  // gen 1: 9chain-a1-tap-g1
```

Hai băng **không bao giờ bắt tay được với nhau** — đó là lý do chúng tồn tại. Và
`netgen/identity.go` (`kiemBoDinhDanh`, patch 0018) **FATAL** nếu tên / networkID / khối chainId
không suy đúng từ `A1Gen`. ⇒ Diễn tập ở `A1Gen 1` **không** tạo ra rủi ro *"bản tập biến thành
bản thật"* trên trục nhận diện mạng.

🔴 **Điểm mạnh nhất: binary KHÔNG phụ thuộc byte chữ khắc.** Chữ khắc đi vào **genesis**, không
vào binary. Nên image `A1Gen 1` dựng ở lượt tập **chính là image ngày G dùng lại** — lượt tập đẻ
ra vật phẩm thật, không phải một bản vứt đi. Bước dài nhất và rủi ro nhất được đẩy ra khỏi ngày G.

### 2.3 Giá phải trả — nói thẳng

Bump `A1Gen` trong repo ⇒ repo mô tả **`g1`** trong khi mạng sống là **`g0`**. Một số cổng sẽ
đỏ cho tới ngày G. **Ba cổng đỏ sẵn cộng thêm vài cái nữa trong hai ngày là cách nhanh nhất dạy
người ta lướt qua danh sách** — đúng cơ chế biến một cổng thành giấy dán tường (D-121).

⇒ **Tập ngày `31/08`, không phải `30/08`**, và **ghi ra trước** đỏ nào là đỏ dự kiến.

### 2.4 Phạm vi lượt tập — một buổi

1. Bump `A1Gen 0→1`: Go **ba dòng** (`A1Gen`, `A1Name`, `A1NameTap`) + JS **một dòng**
   (`A1_GEN`), rồi `node scripts/check-consistency.mjs`.
   *(Việc tay hiện ghi "bump in BOTH languages" — đúng, nhưng bên Go là **ba** dòng; quên
   `A1Name` thì `netgen/identity.go` chặn FATAL, tức lỗi TO, không im lặng.)*
2. Build image `g1` từ cây **25 patch** — 🔴 **giữ image này cho ngày G**.
3. netgen: `N=10 · NETWORK_ID=899999998` (**băng TẬP**) `· A1_P2P_MODE=ipv4port ·
   A1_PUBLIC_IP=<IP server> · A1_STAKING_PORT_BASE=9700`, khắc chữ **BẬT** với byte giả +
   `A1_ENGRAVE_CONFIRM` khớp vân tay.
4. Nghiệm thu **trước khi `up`**: `grep -c -- "--public-ip=" = 10` · `grep image:` (gotcha 16).
   Sau khi `up`: `docker exec … --version` in `commit=` của lượt build ·
   `avm.getAssetDescription` giải được **`LOVE9`** và **`AVAX` ĐỎ có lý do**.
5. Node10 ở Hetzner: build lại binary `g1`, **xoá `--data-dir` cũ**, join **từ genesis**.
   Điều kiện qua: `platform.getCurrentValidators` ra **10** · một node **KHÔNG phải beacon**
   thấy node10 trong `info.peers` · `endTime` node10 **cùng cửa sổ** 9 node kia ·
   theo dõi `ingressConnectionCount` **ít nhất một giờ** (D-121).
6. `engrave-verify` đọc **ngược** từ chain.
7. 🔴 Dọn mạng tập **trong chính phiên tạo ra nó** (kỷ luật D-107 + gotcha 13). Đừng để
   `net-tap-g1` nằm cạnh thư mục thật — `net-dryrun` của `28/08` đã là một lần cảnh cáo.

### 2.5 Nếu chỉ làm được một nửa

Ưu tiên **`N=10` + `A1_STAKING_PORT_BASE=9700` + node10 vào từ genesis**.
Đó là phần duy nhất mà hỏng thì hỏng **giữa ngày G, sau khi mạng cũ đã bị xoá**. Chữ khắc và
lượt build còn đường lui; cái này không có đường lui rẻ — đường lui của nó (D-119, stake sau)
**tốn 25.000 LOVE9 và đưa B-12 về 14 ngày**.

---

## 3. Việc phiên này ĐÃ làm, và việc CÒN LẠI

| | |
|---|---|
| ✅ | Thêm **5 việc tay** vào `scripts/gday-preflight.mjs` (17 → **22**): G-1 · G-3 · G-4 · G-5 · G-6 |
| ✅ | Tệp này |
| 🔴 còn lại, **A1 làm được ngay** | `docs/RUN-A-VALIDATOR.md` tiếng Anh (G-2) |
| 🔴 còn lại, **David** | nguồn của `heartbeat-*` (G-6) · B-16 · B-19 · byte chữ khắc · repo GitHub · PR chainId |
| 🟡 để sau ngày G | G-7 (`check-chainid.mjs` chép cứng gốc dải) |

⚠️ **Tệp này không phải một cổng.** Nó là danh sách chỗ hở tại một thời điểm. Thứ duy nhất
chặn được ngày G là `gday-preflight.mjs` — đó là lý do năm mục ở trên được **đưa vào đó**,
chứ không dừng lại ở đây.
