# BLOCKERS — 9Chain-A1 (phần chain)

Việc kẹt / cần người thật. Ghi vào đây rồi **đi làm việc khác**, không dừng chờ.

---

## Đang mở

### 🔴 B-20 — KHÔNG BẢN LƯU NÀO CHỨA DANH TÍNH VALIDATOR CỦA MẠNG ĐANG CHẠY (2026-08-28)

**Lộ ra khi đo gói lưu `20260825` trước lúc xoá nó** (D-117c). Không phải suy đoán — đếm tệp:

| | `20260825` (đã xoá) | `20260827` | `20260828` |
|---|---|---|---|
| `staker.key` / `signer.key` | 20 tệp | **0** | **0** |
| chain data | 651 MB | **0** | **0** |
| khoá + genesis + compose | có | **0** | **0** |
| git bundle + patches | có | có | có |

🔴 **Danh tính 9 node của `g0` chỉ tồn tại ở hai nơi: máy dev và server.** Cả hai gói lưu mới
nhất chứa **0 tệp** danh tính/khoá/archive — chúng là bản lưu **mã nguồn**, không phải bản lưu
**mạng**. Server hỏng hôm nay ⇒ **không dựng lại được mạng**, dù `h6b-backup.sh --check` xanh.

⚠️ **Đây là H-6b nhìn từ một đại lượng khác.** Lâu nay H-6b đo bằng **số patch** (memory:
*"đo bằng SỐ PATCH, đừng đọc BLOCKERS"*). Số patch đúng mà **nội dung trống** thì bản lưu vẫn
vô dụng — cùng lớp lỗi *đo sai đại lượng*, chỉ là ở tầng khác.

⏳ **Ngày G `01/09` sinh mạng mới ⇒ danh tính mới ⇒ việc này phải làm LẠI dù hôm nay có làm.**
Nhưng làm hôm nay là **diễn tập rủi ro bằng không**, đúng lý do B-16 tồn tại.

**Việc của David** (A1 không tự lấy tệp từ server về):
```bash
# LIỆT KÊ trước — danh tính 9 node của mạng ĐANG CHẠY nằm ở đâu trên server
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'find ~/9chain-a1/net -name "staker.key" | wc -l'
# rồi đưa chúng vào bản lưu, và ĐỐI CHỨNG bằng cách đếm lại trong gói
```
🔴 **Đừng cất chúng cạnh khoá quỹ** — `check-key-leaks.mjs` canh khoá quỹ, không canh danh tính.

---

### 🔴 B-19 — KHOÁ ĐANG GIỮ TIỀN NẰM TRONG HAI THƯ MỤC TỰ KHAI LÀ "ĐỒ CHẾT" (2026-08-28)

**Không kẹt kỹ thuật — kẹt vì xoá là việc có người bấm, và ở đây xoá nhầm là mất tiền thật.**

`node scripts/check-net-dirs.mjs` ⇒ **exit 1**. Đo trên máy dev + RPC mạng đang chạy
(cả P-Chain lẫn X-Chain):

| Thư mục | `genesis.json` khai | Sự thật |
|---|--:|---|
| `local-net/net-public/` | `9001` ⚫ chết | 🔴 `chain-factory-key.txt` giữ **~90 LOVE9 THẬT** (đo `28/08`: P 89,89998130 + X) |
| `local-net/net-public-dead-720m/` | `9001` ⚫ chết | 🔴 **bản trùng byte** của đúng khoá đó |
| `local-net/net-that-g0/` | `999999999` ✅ | 🔴 **MỒI NHỬ** — 6 ví đều **0đ**, `allocation.md` khai *"1 node"* trong khi mạng thật **9 node** |

`sha256` khoá = `1dc334145c8a1abc`, **khớp bản ghi D-092** ⇒ đúng là ví `chain-factory`
`P-love91vgh2wh…` mà đường đẻ chain tiêu tiền từ đó.

🔴 **Hai cái bẫy ngược chiều nhau, và cùng bắn vào lượt dọn dẹp ngày G:**
1. *"Xoá mấy thư mục 9001 đi"* ⇒ **shred mất khoá đang giữ tiền**.
2. *"Cất `net-that-g0` làm bản sao lưu khoá quỹ"* (đúng việc B-16 đang cần!) ⇒ cất một bộ
   **0 đồng**. Bộ này nguy hiểm hơn bộ `9001`: ở kia `networkID` lệch nên `check-keys`
   còn cảnh báo được; ở đây **networkID KHỚP** nên `check-keys` chấm **6/6 ✓** và không
   cổng nào kêu. Bộ quỹ THẬT nằm ở `C:\Users\abc\9chain-a1-keys\g0\`.

**Việc của David** — theo đúng kỷ luật D-107 (LIỆT KÊ → XOÁ → ĐỐI CHỨNG), *không* xoá theo
thư mục:
```bash
node scripts/check-net-dirs.mjs            # liệt kê: thư mục nào giữ tiền
# 1. chép chain-factory-key.txt về nơi khoá g0 thật sự sống, đối chứng sha256 HAI ĐẦU
# 2. chạy lại cổng: phải hết "BẪY"
# 3. chỉ khi đó mới dọn các thư mục 9001 — và đối chứng TỪNG TỆP, không kiểm "nhóm tệp"
```

---

### ✅ B-18 — **ĐÃ ĐÓNG `2026-08-29`** — 3 tệp đã `shred -u -n 3`, sau khi CHỨNG MINH không mất dữ liệu

**David duyệt deploy console, A1 chạy.** Bước LIỆT KÊ của D-107 suýt biến việc này thành B-17
lần thứ ba: **cả ba tệp đều KHÁC hash** với bản đã đổi tên — đúng ca *"khác ⇒ DỪNG, đó là tin"*.

Dừng rồi đo tiếp, thay vì suy đoán: khác biệt là **đổi tên khoá JSON** (`tep`→`file`,
`dais`→`ranges`, `daBiChiem`→`taken`…) cộng danh sách **nguồn** khác nhau. So **tập dữ liệu
thật**: `chainIds` **47/47** · `names` **53/53** · `taken` **56/56** ⇒ **mất 0**.
`thehe-test.mjs` còn nguyên trong git (2 commit). Chỉ khi đó mới xoá.

| nghiệm thu | đo trên |
|---|---|
| 3 tệp cũ biến mất · 3 bản đã đổi tên còn đủ | server |
| drift **19 khớp · 0 lệch · 0 thiếu** (trước: 10 · 6 · 3) | server |
| console khởi động `12:24:16` **sau** mtime `12:22:03` ⇒ chạy bản mới | server |

⚠️ **Phép so đầu tiên của A1 lọc số `> 100000` nên mù cả sổ** — `chainIds` bắt đầu từ **9100**.
Nó in *"LOST 0"* vì **không thấy gì**, không phải vì không mất gì. **Kết quả rỗng ≠ kết quả sạch**
(cùng lớp D-116).

---

### 🔴 B-18 — BA TÊN TỆP CŨ CÒN NẰM TRÊN SERVER SAU LƯỢT ĐỔI TÊN (2026-08-28)

Lượt chuẩn hoá `28/08` đổi tên 3 tệp **có trong `manifest-deploy.json`**. `console-deploy.sh`
chép tên **mới** lên nhưng **không xoá tên cũ** ⇒ server sẽ giữ **cả hai bộ**, và một bản mã
cũ nằm cạnh mã đang chạy chính là kịch bản B-17 sinh ra để chặn.

Đo `28/08` (`node scripts/check-deploy-drift.mjs`): **3 mồ côi**
```
local-net/console/thehe-test.mjs
local-net/console/chainid-da-cap.json
local-net/console/chainid-da-chiem.json
```

🔴 **KHÔNG khai chúng vào `knownExtra` cho cổng xanh** — `manifest-deploy.json` `_extraDeleted`
đã ghi rõ vì sao: khai một tệp đã phải chết là đẻ ra một dòng khai không còn đúng, **và**
khiến cổng im lặng bỏ qua tệp cùng tên nếu nó quay lại.

**Việc của David**, làm **cùng lượt deploy console** (autopilot không ghi lên server):
```bash
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" \
  'cd ~/9chain-a1/src/local-net/console && ls -l thehe-test.mjs chainid-da-cap.json chainid-da-chiem.json'
# LIỆT KÊ trước — phải đúng 3 tệp, và phải đối chiếu chúng với bản git ĐÃ ĐỔI TÊN
# (nội dung giống hệt tệp mới ⇒ xoá không mất gì; khác ⇒ DỪNG, đó là tin)
# rồi mới: shred -u -n 3 thehe-test.mjs chainid-da-cap.json chainid-da-chiem.json
node scripts/check-deploy-drift.mjs        # đối chứng: mồ côi 3 → 0
```

---

### ✅ B-17 — **ĐÃ ĐÓNG `2026-08-28`** — 6 tệp đã `shred -u -n 3`, đo trên SERVER

**David duyệt trong phiên, A1 chạy.** Ba bước: liệt kê (đúng **6**, sổ đang chạy không lọt) →
`shred -u -n 3` → đối chứng.

| nghiệm thu | đo trên |
|---|---|
| `ls local-net/console/*.bak* 9chain-a1-config/*.bak*` ⇒ **0** | server |
| `console-chains.json` (sổ đang chạy) **còn nguyên** 27 byte | server |
| `server.mjs` 82.983 B · `index.html` 20.299 B **còn sống** | server |
| `check-deploy-drift` mồ côi **7 → 1** (chỉ còn `faucet/package-lock.json`, LÀNH) | server |
| `watch-network` 9/9 xanh, console `/whoami` **200** | mạng công khai |

🔴 **Lệnh soạn sẵn bản đầu sẽ XOÁ MẤT NỘI DUNG DUY NHẤT — hai lần, không phải một.**
Xem **D-107** (sổ `console-chains.json.bak-1787728833`) và **D-107b** (hai tệp
`*.bak-truoc-admin` **không trùng bất kỳ phiên bản git nào** trên cả 4 nhánh).
Cả ba đã được lưu trữ + đối chiếu `sha256` hai đầu **trước** khi xoá:
`docs/archive/console-chains-2026-08-26T0720Z.json` ·
`docs/archive/console-pre-admin-2026-08-24/`.

⇒ **Luật rút ra, đắt và lặp lại hai lần trong một phiên:** *"đã có bản lưu rồi nên xoá được"*
là một **PHÉP ĐO**, không phải một câu trấn an. Và **phạm vi của một lời trấn an hẹp hơn phạm
vi của lệnh nó đi kèm** — D-098 kiểm ba sổ rồi viết một lệnh xoá **sáu** tệp.

✅ Đã gỡ 4 mục hết đúng khỏi `thuaDaBiet` trong `manifest-deploy.json`, giữ mục `faucet/package-lock.json`,
và thêm `_thuaDaXoa` dặn **đừng khai lại** — nếu chúng quay lại thì đó là **TIN**, cổng phải ĐỎ.

<details>
<summary>Nguyên văn lúc còn mở</summary>

### 🔴 B-17 — SÁU TỆP `.bak` TRÊN SERVER LÀ ĐƯỜNG LUI TRỎ VÀO QUYẾT ĐỊNH ĐÃ ĐÓNG (2026-08-28)

Tìm thấy khi cổng `check-deploy-drift.mjs` lần đầu nhìn **hướng ngược** (D-098): quét tệp có
trên server mà **không có trong repo**. Cổng cũ mù hoàn toàn với lớp này — nó chỉ hỏi *"tệp
trong danh sách có khớp không"*.

| tệp trên server | đo được | nếu ai đó khôi phục nó |
|---|---|---|
| `local-net/console/server.mjs.bak-pre-D087-…` (27/08) | **0** lần `A1_DE_CHAIN_MO` | **mở lại đẻ chain** mà D-087 đã đóng — hứa với người lạ một thứ sắp bị xoá ngày G |
| `local-net/console/server.mjs.bak-truoc-admin` (24/08) | **0** lần `A1_DE_CHAIN_MO` **và 0** lần `siwe` | mở đẻ chain **và** gỡ xác thực ví (M4.1/D-020): `admin` quay lại kiểu **gõ tay**, gõ nhầm một ký tự ⇒ chain vô chủ **vĩnh viễn** |
| `local-net/console/index.html.bak-truoc-admin` | — | nửa giao diện của cùng đường lui hỏng |
| `9chain-a1-config/console-chains.json.bak{,-1787728833,-pre-regenesis}` | 3 bản | danh bạ khai các chain **đã chết** là còn sống |

⚠️ **Hôm nay chúng không phục vụ đường nào** — không phải lỗ đang chảy, mà là **bẫy nằm im**,
đúng họ với `9chain-a1-config/genesis.json` của D-092b. Nguy hiểm của chúng nằm ở chỗ chúng
được đặt tên như một **đường lui**: người xử lý sự cố lúc 2 giờ sáng sẽ `cp` một trong số đó
lại, và bản họ khôi phục **mở toang thứ vừa được đóng có chủ ý**.

🔴 **Cần David: xoá 6 tệp.** Autopilot không tự làm — ghi lên server là ranh giới cứng của đợt
này, và xoá tệp trên máy chủ công khai là quyết định vận hành.

> 🔴 **ĐÍNH CHÍNH `28/08` — lệnh một dòng bản đầu XOÁ MẤT DỮ LIỆU.** Mục này từng khẳng định
> *"ba sổ danh bạ đã có bản lưu trữ chính thức trong repo nên xoá không mất dữ liệu."*
> **Sai với một trong ba.** Đo sha256 hai đầu:
>
> | tệp trên server | byte | bản lưu trong repo |
> |---|--:|---|
> | `console-chains.json.bak` | 3.116 | ✅ trùng từng byte `console-chains-pre-g0-2026-08-27.json` |
> | `console-chains.json.bak-pre-regenesis` | 22.538 | ✅ trùng từng byte `console-chains-pre-regenesis-2026-08-26.json` |
> | **`console-chains.json.bak-1787728833`** | **20.489** | 🔴 **KHÔNG CÓ** |
>
> ✅ **Đã kéo về `28/08`** → `docs/archive/console-chains-2026-08-26T0720Z.json`
> (`ca24eb59…`, khớp sha256 hai đầu; ảnh chụp `2026-08-26T07:20:33Z`, **3 sống · 39 thu hồi**).
> Cổng `gen-chainid-issued --check` **đỏ ngay** khi có nguồn thứ tư — đúng chức năng — rồi
> `--write` cho **47 chainId · 53 tên, KHÔNG đổi**: sổ đó không thiếu lời hứa nào, nhưng nó là
> **bản duy nhất** của ảnh chụp ấy. ⇒ Nay xoá thật sự không mất gì.
>
> **Bài học:** câu *"đã có bản lưu rồi nên xoá được"* là một **phép đo**, không phải một câu
> trấn an — và nó chưa từng được ai chạy. Trước khi xoá bất cứ thứ gì trên server: **đối chiếu
> sha256 với bản lưu, từng tệp một.**

**Quy trình ba bước — đừng chạy một dòng phá huỷ.** (Cùng kỷ luật D-092: *dừng trước, đo sản
phẩm, rồi mới xoá.*)

```bash
# ── BƯỚC 1 · LIỆT KÊ, KHÔNG XOÁ. Đọc kỹ: phải đúng 6 tệp, KHÔNG có console-chains.json trần.
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'cd ~/9chain-a1/src && ls -l local-net/console/server.mjs.bak-pre-D087-* local-net/console/server.mjs.bak-truoc-admin local-net/console/index.html.bak-truoc-admin 9chain-a1-config/console-chains.json.bak*'
```

```bash
# ── BƯỚC 2 · XOÁ (chỉ chạy khi bước 1 in ĐÚNG 6 dòng)
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'cd ~/9chain-a1/src && shred -u -n 3 local-net/console/server.mjs.bak-pre-D087-* local-net/console/server.mjs.bak-truoc-admin local-net/console/index.html.bak-truoc-admin 9chain-a1-config/console-chains.json.bak*'
```

```bash
# ── BƯỚC 3 · ĐỐI CHỨNG: phải ra 0, và console phải còn sống
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'cd ~/9chain-a1/src && ls local-net/console/*.bak* 9chain-a1-config/*.bak* 2>/dev/null | wc -l; ls -l 9chain-a1-config/console-chains.json'
node scripts/check-deploy-drift.mjs      # mồ côi 7 → 1 (chỉ còn faucet/package-lock.json, LÀNH)
node scripts/watch-network.mjs               # console /whoami phải vẫn 200
```

🔴 **Glob `console-chains.json.bak*` KHÔNG khớp `console-chains.json` trần** (thiếu `.bak`) —
tệp trần là **SỔ ĐANG CHẠY của console**, xoá nó là mất danh bạ chain đang sống. Bước 1 tồn tại
để nhìn thấy điều đó bằng mắt trước khi bước 2 chạy.

**Xoá xong** thì gỡ 4 mục tương ứng khỏi `thuaDaBiet` trong
`local-net/deploy/manifest-deploy.json` — **để lại mục khai cho một tệp đã xoá là đẻ ra một
dòng khai không còn đúng**, và cổng sẽ im lặng bỏ qua tệp cùng tên nếu nó quay lại.
*(Giữ nguyên mục `local-net/faucet/package-lock.json` — tệp đó **lành**, không xoá.)*

</details>

*(Mục thứ 7, `local-net/faucet/package-lock.json`, là **lành** — `npm install` trên server sinh
ra. Giữ nguyên.)*


### 🔴 B-16 — O1: BẢN SAO THỨ HAI CỦA KHOÁ QUỸ — **15 phút, chặn GO/NO-GO `29/08`**

**Phương tiện: MÁY TÍNH THỨ HAI — David chốt `2026-08-28`.**
**Quy trình: [`docs/O1-SECOND-COPY-RUNBOOK.md`](docs/O1-SECOND-COPY-RUNBOOK.md)** (chép + đường
chuyển + ba mức nghiệm thu) · phép kiểm gốc: [`docs/O1-CUSTODY-VERIFICATION.md`](docs/O1-CUSTODY-VERIFICATION.md).

Đây **không phải quyết định** — David đã chốt sơ đồ ở D-044. Là **một phép kiểm chưa ai chạy**:
*bản thứ hai có thật không, và khôi phục được không.*

| Đo `2026-08-28` (lượt 2, sau khi vá cổng) | |
|---|---|
| Khoá g0 nằm ở | **đúng một ổ đĩa** — `C:\Users\abc\9chain-a1-keys\g0\`. Đo lại cuối ngày: máy dev có **một ổ vật lý** (BIWIN M350 2TB → `C:`), **không** USB, **không** ổ ngoài |
| Bộ đó có đúng là bộ của mạng đang chạy không | ✅ **6/6 quỹ giữ tiền thật trên g0** (D-090) — khoá 8.999.991 staked · 2.600.000.001 · 810tr × 2 · C@block0 1 tỷ + 99.999.999 |
| Bản gốc còn nguyên vẹn | ✅ vân tay khớp: `keys.txt` 3.531 B `e350727a…` · `allocation.md` 2.221 B `654fb72e…` · `genesis.json` 7.753 B `e1024eab…` |
| Cổng nghiệm thu `o1-check.mjs` | ✅ **đã vá và chạy lại** — xem cảnh báo 🔴 ngay dưới. Trên bộ gốc ⇒ **exit 0** |
| Bản thứ hai | 🔴 **chưa tồn tại** — chờ David chỉ máy đích |

🔴 **CỔNG NÀY ĐÃ CHẾT TỪ SÁNG `28/08` VÀ NÓ ĐỎ NGƯỢC — đọc trước khi tin bất kỳ lượt chạy cũ
nào** (D-116). Lượt đổi tên `kiem-khoa`→`check-keys` (patch 0025) không được nối vào
`o1-check.mjs`, nên `go run` trỏ vào một gói **không tồn tại**, thoát `1`, và cổng in
**`🔴 SAI — Bản sao này KHÔNG dùng được. Đừng cất nó làm bản O1`** cho **bộ khoá chính, hoàn
toàn đúng**. Ai chạy nó trong khoảng đó và tin mặt chữ thì đã **vứt bỏ một bản sao lưu tốt**.
Cùng lỗi, cùng gốc, nằm luôn trên **đường ký ví tiền thật**: `wallet-tunnel/enter.sh` khai nó
thành *"khoá không suy ra địa chỉ tệp tự khai"*. **Cả hai đã vá**: công cụ phải **tự khai đã
chạy** thì lời phán mới được tin; không có dấu đó ⇒ `2` CHƯA KẾT LUẬN, không phải `1`.

🔴 **Cửa sổ diễn tập rủi ro BẰNG KHÔNG đang trôi qua:** bộ khoá này **bị vứt bỏ `01/09`**. Tập
trên chính nó thì hỏng cũng không mất gì. Sau ngày G lại kẹt y cũ, và lúc đó khoá là thật.

🔴 **Bẫy phải biết trước khi chạy (D-090):** `kiem-khoa` một mình **KHÔNG phân biệt được bộ khoá
còn sống với bộ khoá đã chết** — bộ thế hệ `9001` qua nó sạch **6/6 ✓ exit 0**. Và bộ `9001` đó
là bộ đang tồn tại đúng lúc David được nhắc phải sao lưu, **vẫn nằm trên máy dev** để chép nhầm.
✅ **`28/08` — NAY CHỈ CÒN MỘT LỆNH** (D-097). Bẫy trên không còn phụ thuộc trí nhớ nữa:

```bash
node scripts/o1-check.mjs <thư-mục-bản-sao>
```

Nó chạy **cả hai** vế và **chỉ thoát `0` khi cả hai xanh**. Ba mã thoát: `0` ĐẠT · `1` SAI ·
`2` **CHƯA KẾT LUẬN** (một vế không chạy được — *không biết* **không phải** *đạt*).

Đã nghiệm thu trên **dữ liệu thật**: bộ `g0` đang sống ⇒ `0` · bộ `9001` đã chết ⇒ **`1`**
(trong khi `check-keys` một mình vẫn in `✓ 6/6 quỹ khôi phục đúng`) · giấu phép đo trên chain
đi ⇒ **`2`, không xanh** · **gói công cụ không tồn tại ⇒ `2`, KHÔNG phải `1`** (ca mới của
D-116). **7/7** ca đối chứng ngược đúng mã thoát, đo lại `28/08` cuối ngày.

*(Hai lệnh rời vẫn dùng được khi muốn đọc kỹ từng vế:)*

```bash
node scripts/check-keys-on-chain.mjs <thư-mục-bản-sao>/allocation.md
```

**Nếu bước "lấy bản thứ hai ra" không làm được** — không tìm thấy, không mở được — thì **đó
chính là câu trả lời cần biết trước ngày G**, và biết hôm nay thì còn 4 ngày để dựng lại.

### ✅ B-9 — **ĐÃ ĐÓNG `2026-08-27`** — đỏ Avalanche đã ra khỏi ví X/P (patch 0021)

`#e84142` ở hai chỗ trong `9chain-a1-tools/xp-wallet` (dấu thương hiệu + nút chính) → **vàng
9Chain trên navy**, đúng cặp tương phản của hệ token. Chữ nút đổi từ trắng sang navy: trắng
trên vàng **không đạt AA**. Tree `6879819f` → **`17dd3b3f`**, đối chứng ngược 20/21 đạt.

⚠️ Giữ lại **một** lần xuất hiện của chuỗi `#e84142` trong **chú thích**, cố ý — nó ghi lại
màu cũ để lần sau không ai "dọn dẹp" ngược lại. Không cổng nào grep màu này nên không sinh
báo động giả.

🔴 **NGOÀI phạm vi B-9, nhưng phải ghi:** `local-net/console/index.html` **trên server** còn
**3 lần** `#e84142`, và bản đó **lệch 12 byte** so với cả `main` lẫn `web-home` ⇒ có sửa tay
trên server chưa quay về git. Trang `/console/` **sống** thì sạch (đo: 35.983 byte, 0 lần) —
tức tệp kia đang **không phục vụ đường đó**, nhưng nó vẫn nằm trên máy và vẫn lệch. Thuộc
worktree web.

---

### ✅ B-15 — **ĐÃ ĐÓNG `2026-08-27`** — David chốt **`LOVE9`, dứt khoát** (D-084)

*"Tuyệt đối không được, chỉnh hết về LOVE9."* Kể cả phương án đăng ký **hai** bí danh cùng trỏ
một assetID (khả thi thật, không đụng byte genesis, RPC vẫn hiện `LOVE9`) — **bị loại**: nó mua
tương thích bằng cách để tài sản gốc mang thêm tên của mạng khác.

**Giá đã biết trước và chấp nhận:** mọi công cụ dựng trên SDK avalanchego gốc không nói chuyện
được với A1. Việc còn lại đã làm — patch 0022 bắt nó **hỏng ra tiếng** thay vì hỏng câm.

<details>
<summary>Nguyên văn lúc còn mở</summary>

### 🔴 B-15 — BÍ DANH TÀI SẢN X-CHAIN Ở NGÀY G: `LOVE9` hay `AVAX`? (2026-08-27, sinh từ D-082)

**Cần David quyết TRƯỚC `01/09`.** Bí danh nằm trong **byte genesis của X-Chain** ⇒ chỉ đổi được
ở một lượt sinh lại mạng. Chọn xong là khoá vĩnh viễn trong thế hệ đó.

| | Giữ `LOVE9` (đang chạy ở g0) | Đổi về `AVAX` |
|---|---|---|
| Bản sắc | tài sản gốc mang tên riêng ở **chỗ máy đọc**, không chỉ chỗ người nhìn | chỉ còn `Name`/`Symbol` mang tên riêng |
| Công cụ bên thứ ba | 🔴 **mọi thứ dựng trên SDK avalanchego upstream đều chết** — SDK hỏi cứng `"AVAX"` | chạy được ngay, không cần biết A1 là fork |
| Chi phí đã trả | **chính A1 vừa dính hôm nay** — `xp-wallet` chết câm, phải vá patch 0019 để nạp được ví | — |

🔴 **Đừng đọc "A1 đã vá xong nên không sao".** Patch 0019 chỉ sửa SDK **trong fork của A1**. Ví
của người dùng, explorer bên thứ ba, và bất kỳ ai `go get` avalanchego bản gốc đều **không có
bản vá đó**. Câu hỏi thật là: *A1 muốn người ngoài nói chuyện được với mình bằng công cụ sẵn có,
hay muốn họ phải dùng fork của A1?*

⚠️ Câu hỏi này **không** đối xứng với `A1HRP`/`A1Name`: hai thứ kia upstream đọc bằng tham số,
còn bí danh tài sản upstream **hỏi bằng hằng số cứng**.

</details>

---

### ✅ B-14 — **ĐÃ ĐÓNG `2026-08-27`** — David chốt gốc dải **`9000000010`** (D-069)

> 🔴 **ĐÍNH CHÍNH `2026-08-28`:** dòng "ĐÃ ĐÓNG" ở trên **đúng về quyết định và về mã, sai về
> thế giới** cho tới `28/08`. `console-deploy.sh` không chép `lib/chainid.mjs` lẫn hai sổ chặn,
> nên **console công khai vẫn cấp chainId từ `9100` suốt hai ngày** và giao diện còn gợi ý đúng
> con số đó. Nay đã deploy + có cổng canh (`scripts/check-deploy-drift.mjs`). Xem **D-088**.
> ⇒ **Bài học chung cho mọi mục "ĐÃ ĐÓNG" trong tệp này: đóng ở repo ≠ đóng ở nơi người dùng
> chạm vào.** Mục nào chạm đường sản phẩm thì phải kèm một phép đo **trên sản phẩm**.

David không chọn đường nào trong ba đường A1 đưa (9146 / 9100 / "dải khác") mà đưa ra một
đường thứ tư **tốt hơn cả ba**: gốc dải = chainId của A1 **+1**.

| | |
|---|---|
| Vùng trống | **không một chuỗi nào trong bán kính 10 triệu** quanh 9000000009 (sổ `27/08`, 2.725 mục) |
| Bản sắc | mọi chain thuộc A1 cùng mở đầu `9000000…` |
| 🔴 Ngoài dự tính | dải cũ `9100–9145` **không bao giờ được tự cấp lại** ⇒ lỗ phát lại mà §5c định vá **bằng sổ** nay đóng **bằng kiến trúc** |

⚠️ **§5c CHƯA đóng.** Chỉ đóng nửa `chainId` và chỉ đường **tự cấp**: người dùng vẫn tự nhập
được `9102` (chặn vẫn dựa `state.retired`), và trùng **TÊN** không đụng tới.

**Đã vá + nghiệm thu:** `local-net/lib/chainid.mjs` (tách khỏi `server.mjs` để bài kiểm đọc
được mã thật) · `chainid-test.mjs` **13 đạt/0 hỏng** · `check-chainid.mjs` tra dải MỚI, 4 ca
đối chứng ngược đỏ đúng chỗ · danh sách chặn giữ cả hai dải (D-069b: rỗng ≡ hỏng).

<details>
<summary>Nguyên văn lúc còn mở</summary>

### 🔴 B-14 — GỐC DẢI chainId CHO L1 NGƯỜI DÙNG: `9100` TRÙNG MỘT CHUỖI CÓ THẬT (2026-08-27, sinh từ G4)

Tra sổ công khai `27/08` ([`docs/G4-CHAINID-LOOKUP-2026-08-27.md`](docs/G4-CHAINID-LOOKUP-2026-08-27.md)):
`9000000009` **trống** ✓ — nhưng trong dải console tự cấp cho L1 người dùng có **4 số bị chiếm**,
và một trong đó là số **đầu tiên** console cấp:

| chainId | Bị chiếm bởi |
|--:|---|
| **9100** | **Genesis Coin** (`GENEC`) — 🔴 số console cấp đầu tiên |
| 9108 · 9134 · 9170 | Destra Dubai Testnet · GIWA · Rinia Testnet Old |

`server.mjs:659` cấp bằng `chainId = 9100; while (taken) chainId++`, mà `taken` chỉ tra **sổ
của chính mình**. ⇒ người đầu tiên bấm "đẻ chain" nhận `9100`, và ví của họ trỏ vào một số mà
sổ công khai gọi là Genesis Coin. **Đã xảy ra rồi** — `9100` được A1 cấp hai lần (`OwnerTest`).

⚠️ **Thiệt hại thực tế hôm nay ~0**: 0 L1 đang sống, 6 chain dải `9100–9105` đều đã thu hồi.
Cái đang mở là **cửa**, không phải vết thương. Đừng trích mạnh hơn thế.

🔴 **Cần David — vì nó vướng đúng câu §5c đang chờ:** *"có khôi phục sổ `retired` cũ không"*.
- Khôi phục ⇒ số tự cấp bắt đầu từ **9146**.
- Không khôi phục ⇒ bắt đầu từ **9100**.

Chọn gốc dải trước khi vá, không thì vá hai lần. **Gộp câu này vào cùng mục quyết số 5.**

✅ **Phần KHÔNG cần quyết đã làm (A-4):** console có **danh sách chặn tĩnh** các chainId đã bị
chiếm trong sổ công khai — đúng dù gốc dải là 9100 hay 9146.

</details>

### 🟡 B-13 — **(a) ĐÃ ĐÓNG `2026-08-27`** · (b) còn mở, đã HẠ MỨC

✅ **(a) David chốt: neo vào HASH GIAO DỊCH NGHI LỄ** (D-070). Luật cũ *"block đầu tiên vượt
mốc"* là mệnh đề về toàn chuỗi — nghi lễ không tự bảo đảm được; hash giao dịch là thứ nghi lễ
cầm được.

Bài diễn tập đã đổi cách chấm và **chạy thật lại trên mạng tập `27/08`**:

| lượt | kết quả |
|---|---|
| `--offset-ms 3000` | 10 đạt · 0 hỏng · 2 lưu ý (0 không đạt) |
| 🔴 `--offset-ms 0` — ca bản cũ chấm **✗** | 10 đạt · 0 hỏng · **2 lưu ý KHÔNG đạt**, exit **0**. Block đầu tiên vượt mốc là của **Eva `#4`**; neo vẫn trỏ đúng Adam `#3` |
| `--no-send` | 2 đạt · 0 hỏng |

Ô cũ **xuống hạng "lưu ý"**, không bị xoá: xoá là mất phép đo lệch đồng hồ mà (b) cần; giữ ở
hạng ✗ là để bài **kêu oan**, mà cổng kêu oan sẽ bị bỏ qua đúng lúc nó kêu thật.

🔴 **(b) VẪN MỞ, nhưng đổi tính chất.** D-070 hạ nó từ *"neo sai thì hỏng"* xuống *"câu chữ
sai thì không trung thực"*: nếu bản khắc còn **câu chữ** khẳng định block vượt mốc
`2026-09-09T06:09:09Z` thì câu đó vẫn phải đúng, và nó vẫn phụ thuộc đồng hồ **node đề xuất
block**. ⇒ vẫn phải đo lệch đồng hồ 9 node **sau khi mạng ngày G lên**, rồi chọn `--offset-ms`.
Câu chữ chốt cùng lượt **C1 đóng băng byte**.

<details>
<summary>Nguyên văn lúc còn mở cả hai vế</summary>

### 🔴 B-13 — BLOCK ADAM: NEO VÀO CÁI GÌ, VÀ BÙ BAO NHIÊU (2026-08-27, sinh từ diễn tập A-1)

Diễn tập `27/08` đạt (9/9 + 2 đối chứng ngược) — bản đầy đủ
[`docs/DRILL-BLOCK-ADAM-2026-08-27.md`](docs/DRILL-BLOCK-ADAM-2026-08-27.md). Nhưng nó
đẻ ra hai việc **không đóng được trong cùng lượt**.

| | Việc | Ai | Vì sao không tự quyết/tự làm được |
|---|---|---|---|
| **(a)** | 🔴 **Block Adam NEO VÀO CÁI GÌ** | **David** | Luật đang định khắc — *"block **đầu tiên** vượt `2026-09-09T06:09:09Z`"* — là mệnh đề về **TOÀN CHUỖI**, mà nghi lễ chỉ điều khiển được **giao dịch của mình**. Ai gửi một giao dịch vào khoảng giữa mốc và lúc ta bắn là chiếm mất ô đó, không giành lại được. **Khắc vĩnh viễn** ⇒ không tự quyết. *Khuyến nghị: neo vào **hash giao dịch nghi lễ**, hoặc số block chốt SAU khi nó đã sinh ra.* Hạn `28/08`, gộp vào `GDAY-A1-REMAINING.md` §6 mục 3 |
| **(b)** | **Đo lệch đồng hồ 9 node** rồi chọn `--offset-ms` | A1 | Làm được, nhưng **chỉ sau khi mạng ngày G lên** — số phải đo trên chính bộ node sẽ chạy nghi lễ |

🔴 **Vì sao (b) không phải là "chép +3s vào runbook":** +3s đạt trên mạng tập **1 node dùng
chung đồng hồ với máy bắn**. Trên bộ 9 node, `block.timestamp` là đồng hồ của **node đề xuất
block**; node đó chậm 5 giây thì bù +3s **vẫn trượt**. Chép con số ra khỏi thang đo của nó là
đúng lớp lỗi đã ghi trong `HANDOFF` (*"số chép sang thang khác"*).

⚠️ **Và nếu David chọn P-Chain thay C-Chain thì phải DIỄN TẬP LẠI** — giao dịch nghi lễ trên
P-Chain là cơ chế khác hẳn (export/import hoặc thao tác staking), bài `block-adam-drill.mjs`
không phủ được. Phải tính thời gian cho việc đó **trước `09/09`**, xem D-055.

</details>

### ✅ B-11 — **ĐÃ ĐÓNG HẲN `27/08`** (ba mục chạm binary + C-4)

Từ bản soát core [`docs/CORE-AUDIT-2026-08-27.md`](docs/CORE-AUDIT-2026-08-27.md) §7.

✅ **David chốt `27/08` (D-051, patch 0014, tree `4c5d5b1e`):** cả ba mục chạm binary đều
**GIỮ NGUYÊN GIÁ TRỊ** — patch chỉ đổi **chữ**, không đổi số. ⇒ **Không còn gì chặn lượt
`docker build` của ngày G.**

| | Việc | Chốt |
|---|---|---|
| ~~**C-1**~~ | `UptimeRequirement` | ✅ **GIỮ `.8`**. Mốc xét lại là **MAINNET**, không phải ngày G — A1 vẫn là testnet mời cộng đồng chạy node trên hạ tầng không chuyên. Chú thích cũ *"⬅️ CHỐT LẠI THÀNH 0.9"* nằm trong comment nên **không ai canh**; nay có ngày tháng |
| ~~**C-2**~~ | `MaxStakeDuration` | ✅ **GIỮ 365 ngày**, bằng Avalanche mainnet. Trần dài hơn = khoá staking giam lâu hơn, tức đánh đổi chứ không phải cải thiện ⇒ **sinh ra B-12** (quy trình gia hạn) |
| ~~**C-3**~~ | Phí C-Chain | ✅ **GIỮ đường cong Avalanche, KHAI RA LÀ CỐ Ý** trong `genesis_9chain_a1.go`, kèm lý do + điều kiện xét lại + con trỏ tới chỗ đổi thật (không phải file đó) |
| ~~**C-4**~~ | **chainId `9000000009` cắm cứng** trong `cChainGenesis` ⇒ **mạng tập và mạng thật cùng chainId** | ✅ **ĐÓNG `27/08`** — patch **0015**, tree **`df68a7d7`**, 15 patch. `netgen/chainid.go` |

✅ **C-4 đã đóng `2026-08-27` (A-4).** `chainId` nay đi qua `resolveChainID` (`netgen/chainid.go`),
đọc `A1_CHAIN_ID`, mặc định vẫn là số thật:

| | khắc chữ **BẬT** (lượt THẬT) | khắc chữ **TẮT** (lượt TẬP) |
|---|---|---|
| chainId = `9000000009` | ✓ im lặng — đúng bản sắc | ⚠️ **CẢNH BÁO LỚN** (hoặc `A1_CHAIN_ID_KHAI_NHAN`) |
| chainId ≠ `9000000009` | 🔴 **CHẶN** — lượt thật phải mang bản sắc thật | ✓ in ra, đường đúng cho mạng tập |

Kèm trần **EIP-2294**, và netgen nay **luôn in chainId** ở dòng tổng kết — trước đó nó không in
con số này ở đâu cả, nên không lượt sinh mạng nào để lại dấu vết về bản sắc vừa phát ra.
**7 ca nghiệm thu, 3 ca đỏ đúng chỗ.** Chi tiết: [`docs/CHAINID-GATE-2026-08-27.md`](docs/CHAINID-GATE-2026-08-27.md).

⚠️ **Bất đối xứng "cảnh báo vs chặn" là CỐ Ý**, không phải làm dở: chặn cứng đường dev quen
thuộc `gen-network.sh 5` chỉ tạo ra thói quen đi vòng (đúng lý lẽ đã dùng cho `canhBaoSelfBond`).
Cái sửa được thì cảnh báo; cái **khắc vĩnh viễn không sửa được** thì chặn.

⚠️ **Rủi ro C-4 vốn thấp và vẫn thấp**: netgen sinh khoá mới mỗi lượt nên địa chỉ hai mạng khác
nhau; cửa duy nhất là người tự import cùng một khoá vào cả hai. Cái được vá là **bất đối xứng
thiết kế** — A1 dựng cổng *"bản tập ≠ bản thật"* rất kỹ cho **chữ khắc** mà không có cổng nào
cho **chainId**, thứ ví người dùng thật sự đọc.

### 🔴 B-12 — CHƯA CÓ QUY TRÌNH GIA HẠN VALIDATOR (2026-08-27, sinh từ D-051b)

Hệ quả trực tiếp của quyết định giữ `MaxStakeDuration` 365 ngày. **Không phải việc mã** —
avalanchego không có cơ chế tự gia hạn, và không cổng nào cảnh báo được.

**9 validator genesis hết hạn lần lượt trong một cửa sổ 56 ngày, bắt đầu ~365 ngày sau ngày G.
Node cuối rụng là mạng DỪNG.**

⚠️ **So le 7 ngày là CỐ Ý và chính nó là hệ thống cảnh báo** — node đầu rụng ở ~ngày 309, lúc
đó 8 node còn chạy ⇒ có ~56 ngày để phản ứng. **Đừng "dọn dẹp" `InitialStakeDurationOffset` về
0 cho đều.**

🔴 **Cần David:** dựng lịch nhắc + người chịu trách nhiệm. Ngày hết hạn **thật** chỉ biết sau
khi sinh genesis ngày G — đọc bằng `platform.getCurrentValidators` → `endTime`, **đừng tính
tay**. Việc này nên làm **ngay sau ngày G**, lúc số còn tươi.

*(Mục "⏰ Hẹn giờ đã biết" trong `HANDOFF.md` ghi `2027-08-24` cho 5 validator — đó là của mạng
TRƯỚC re-genesis `26/08`, đã cũ hai lần.)*

🔴 **Kèm theo, KHÔNG cần quyết nhưng phải nhớ khi deploy:** patch 0013 khai
`constants.A1Name`, mà `config/config.go:1008` dựng đường dẫn DB từ tên mạng ⇒ **binary này
CHỈ được lên cùng một lượt sinh lại mạng** (`down -v`). Ngày G thoả. Chi tiết + đường lui một
dòng: D-050.

### 🔴 B-9 — MÀU ĐỎ THƯƠNG HIỆU AVALANCHE CÒN TRONG `patches/0003` (2026-08-27)

`#e84142` là **đúng đỏ thương hiệu của Avalanche**. Soát `27/08` tìm thấy nó ở 4 tệp
HTML tự viết + **`patches/0003-9chain-a1-sovereign-toolchain-netgen-cli-create-l1-x.patch`**.

| Chỗ | Trạng thái |
|---|---|
| `local-net/chains/index.html` (4 lần) — **công khai** | ✅ **đã sửa `27/08`** |
| `console/` (3) · `dashboard/` (4) · `explorer/` (2) | ⚫ không còn phục vụ — chưa sửa, không gấp |
| 🔴 **`patches/0003-*.patch`** | 🔴 **CHƯA — và đây mới là chỗ đắt** |

**Vì sao patch khác ba tệp kia:** nó là một trong **12 patch tái lập lớp chủ quyền**, tức
màu đó **đi vào công cụ mà mọi lần dựng lại fork đều áp**. Không phải rác để dọn.

⚠️ Và một sovereign fork tự khai *"không dùng nhãn hiệu Avalanche cho branding"*
(`README.md`, `NOTICE`) mà mang màu thương hiệu của họ trong công cụ chủ quyền là **rủi
ro nhận diện/pháp lý**, không phải chuyện thẩm mỹ.

🔴 **Cần David quyết:** sửa patch (⇒ đổi tree hash, phải sinh lại patch series và nghiệm
thu lại bằng `git am --keep-cr` + so tree), hay để sau ngày G. **A1 không tự quyết** vì
đụng patch series là đụng đường tái lập fork, mà ngày G phụ thuộc vào nó.

⚠️ Không cổng nào bắt được lớp lỗi này: `check-consistency.mjs` canh SỐ,
`web/test/token.test.ts` canh MÀU CỦA HỆ TOKEN — **không cái nào canh màu cắm cứng trong
HTML tự viết hay trong patch**. Chi tiết: `docs/BRAND-AUDIT-2026-08-27.md` mục M.

### 🟢 B-10 — **CHẨN ĐOÁN SAI TỪ ĐẦU. ĐÓNG `2026-08-28`** (D-106b)

> 🔴 **ĐÍNH CHÍNH — mục này sai suốt từ `27/08`, và sai vì đọc THIẾU.**
> Cloudflare **CHÈN THÊM VÀO ĐẦU**, không **THAY**. Đo đầy đủ `28/08`: tệp `robots.txt`
> của A1 còn **nguyên vẹn bên dưới** khối Cloudflare — `User-agent: *` · `Allow: /` ·
> đủ 7 dòng `Disallow:` · `Sitemap: https://a1.9chain.org/sitemap.xml`.
> **`robots.txt` của A1 VẪN LUÔN tới được người đọc.** Không có gì hỏng, không có gì
> để tắt cho khỏi hỏng.
>
> **Vì sao lỗi này sống được hai ngày:** cả lượt `27/08` lẫn cổng `check-robots.mjs`
> bản đầu đều đọc **vài dòng đầu** rồi phán. Tức chúng **đo VỊ TRÍ trong khi tưởng
> mình đo NỘI DUNG** — thang đo `CLAUDE.md` §1 nói *"đọc nội dung"*, không nói *"đọc
> dòng đầu"*, và khoảng cách giữa hai câu đó vừa tốn hai ngày.
>
> 🔴 **Cay nhất: `web/public/robots.txt` ĐÃ VIẾT SẴN luật đúng trong chú thích của
> chính nó** — *"đo NỘI DUNG mà không phụ thuộc VỊ TRÍ: `grep -q 'Sitemap: …'`. Đây là
> mặt trái của xanh giả: **đỏ giả** cũng phá đúng thứ đó, chỉ chậm hơn."* Người viết
> dòng đó đã đi trước; người dựng cổng không đọc tới đó.
>
> ✅ **Cổng nay chấm đúng:** `node scripts/check-robots.mjs` — **7/7 ca đối chứng**
> (gồm ca *"chỉ có khối Cloudflare, mất dòng Sitemap"* ⇒ **1**, và ca *"route biến mất
> khỏi Caddyfile, trả HTML 404"* ⇒ **2**). Chạy thật `28/08` ⇒ **exit 0**.
> Phép chấm là **một** chuỗi chỉ có thể tới từ tệp của A1; mọi thứ khác là ghi chú.

**🟡 CÒN LẠI MỘT VIỆC, VÀ NÓ LÀ QUYẾT ĐỊNH CHÍNH SÁCH — KHÔNG PHẢI LỖI.**

Khối Cloudflare chèn vào **nhân danh A1**:

| nó khai gì | |
|---|---|
| điều khoản | *"As a condition of accessing this website, you agree to abide by…"* |
| tín hiệu | `Content-Signal: search=yes, ai-train=no, use=reference` |
| **cấm hẳn 9 bot** | `Amazonbot` · `Applebot-Extended` · `Bytespider` · `CCBot` · `ClaudeBot` · `CloudflareBrowserRenderingCrawler` · `Google-Extended` · `GPTBot` · … |
| pháp lý | viện **Điều 4 Chỉ thị EU 2019/790** về bảo lưu quyền |

🔴 **A1 không chọn thứ này — Cloudflare bật mặc định.** Với một testnet công khai mời
cộng đồng, *"ai được đọc nội dung của A1"* là câu David nên tự trả lời, không phải
nhận mặc định của nhà cung cấp CDN.

⚠️ **Lý do kỹ thuật phụ để cân nhắc tắt:** nhóm `User-agent: *` của Cloudflare đứng
**trước** nhóm của A1. RFC 9309 §2.2.1 buộc bot **gộp** hai nhóm cùng tên, nên bot tuân
thủ vẫn thấy `Disallow: /tx/ …` của A1 — nhưng bot chỉ đọc nhóm đầu thì **không**, và
đó đúng là các dòng dựng ra để Blockscout khỏi bị bò hết. Rủi ro thấp, không phải zero.

**Nếu David muốn tắt** (không gấp, không chặn ngày G):
`dash.cloudflare.com` → zone `9chain.org` → **Overview → Control AI Crawlers** → bỏ chọn
**Display Content Signals Policy**. Đường thứ hai: **Security → Settings** → lọc
*Bot traffic* → *Instruct AI bot traffic with robots.txt*.
Xong thì purge `/robots.txt` (`max-age=14400`) rồi chạy lại cổng.

<details>
<summary>Nguyên văn lúc còn bị chẩn đoán sai — giữ lại vì phép đo header vẫn đúng và bài học đắt</summary>

### 🔴 B-10 — CLOUDFLARE ĐANG CHE `robots.txt` CỦA CHÍNH MÌNH (2026-08-27)

`web/public/robots.txt` **đã có tệp, đã có route trong Caddyfile, đã deploy** — và vẫn
không tới được người đọc. Đo `27/08`:

| | `cf-cache-status` | Nội dung trả về |
|---|---|---|
| `/sitemap.xml` | `DYNAMIC` → **tới origin** | sitemap thật của ta ✅ |
| `/robots.txt` | **`MISS` + `Cache-Control: max-age=14400`** | *"As a condition of accessing this website…"* 🔴 |

`DYNAMIC` = yêu cầu đi tới origin. `MISS` + `max-age` **ở một đường mà origin có tệp
thật** = Cloudflare tự sinh phản hồi và **không hỏi origin**. Zone `9chain.org` đang bật
**Managed robots.txt / Content Signals Policy**.

🔴 **Cần David:** tắt tính năng đó trong **dashboard Cloudflare** (Settings → Content
Signals / robots.txt management). **Không sửa được từ mã nguồn hay từ Caddy** — đừng ngồi
thử thêm một vòng route nữa. Tệp + route đã giữ nguyên, nó ăn ngay khi tính năng kia tắt.

⚠️ **Phần header ở trên vẫn ĐÚNG** — Cloudflare thật sự trả `/robots.txt` từ cache của nó
(`HIT` · `max-age=14400`) trong khi `/sitemap.xml` đi tới origin. Cái sai là **kết luận rút
ra từ đó**: "trả từ cache" ≠ "thay tệp của ta". Cloudflare lấy tệp origin, chèn khối của nó
vào đầu, rồi cache kết quả. Header nói về **đường đi**, không nói về **nội dung** — muốn biết
nội dung thì phải đọc **cả tệp**, không phải dòng đầu.

⚠️ **Không đo được origin trực tiếp:** `curl --resolve … 139.99.145.13` trả **403 — "máy chủ
này chỉ phục vụ qua Cloudflare"**. Đó là bộ lọc `Host` của M11.10 và nó **đang làm đúng việc**
— đừng nới nó ra để kiểm cho tiện. Đối chứng dương `sitemap.xml` thay được vai trò đó.

⚠️ **Ca xanh giả sách giáo khoa:** `curl -o /dev/null -w '%{http_code}'` trả **200** và
`content-type` cũng đúng **text/plain**. Chỉ đọc **nội dung** — hoặc đọc **header
`cf-cache-status`** — mới thấy. Cảnh báo đã ghi vào chính `web/public/robots.txt` và
Caddyfile để người sau không tưởng nó đang chạy.

</details>

### ✅ B-7 — ĐÃ TRẢ LỜI (2026-08-25) — phân biệt được sẵn, không cần trường mới
**Trả lời đầy đủ:** `docs/requests-from-9scan/2026-08-25-node-tracking-REPLY.md`.
Tóm tắt: `console-chains.json` đã tách bằng **cấu trúc** — mảng `chains` (6, đang
track) và `retired` (**21**, đã thu hồi có chủ ý). **21 đó khớp chính xác con số "21
không node nào track"** ⇒ toàn bộ nhóm đang bị gộp dưới `not served here` thực ra là
chain đã thu hồi, không có chain nào "bình thường mà hết slot". Không thêm trường
`status`: nó là nguồn sự thật thứ hai cho thứ cấu trúc đã nói. Mỗi bản ghi có
`thuHoiLuc` để explorer viết "đã thu hồi lúc …".
Phát hiện P-Chain của họ **đúng** (= D-013); đã xác nhận vế bổ sung cho D-005:
tập validator là điều kiện **CẦN, không đủ**.

(nguyên văn yêu cầu, giữ lại để đọc bối cảnh)
### B-7 (yêu cầu gốc) — Explorer không phân biệt được "L1 đã thu hồi" với "L1 hết slot track"
**Yêu cầu từ repo `9Scan-A1`, 2026-08-25.** Bản đầy đủ:
`docs/requests-from-9scan/2026-08-25-node-tracking.md`. **Không phải báo lỗi** — trần 16
và hướng ACP-77 đã quyết ở H-2/D-009, đây là hệ quả của D-013 nhìn từ ngoài.

Đo: **28 L1**, node track **7**, **21 không node nào track**, còn **9 slot** trống
(trần 16). Explorer hiện cả 21 chain đó là `not served here` và không dám kết luận
sống/chết — nhưng nhãn đó đang **gộp** "đã thu hồi có chủ ý" với "chain bình thường,
chỉ hết slot". Xin **một trường `status` trong `console-chains.json`**, hoặc một câu xác
nhận rằng không phân biệt được (explorer sẽ viết câu giải thích cho đúng thay vì đoán).

🔴 **Kèm một phát hiện ảnh hưởng mọi client đọc P-Chain, không riêng explorer:**
`platform.getCurrentValidators` cho subnet **đã bỏ track** vẫn trả **đủ 5 validator**
(đo trên `Smoke7XWQ2M`). Đúng cơ chế của D-013 (bỏ track không xoá được đăng ký trên
P-Chain), nhưng nó là bẫy cho ví/dashboard/console: dễ kết luận "có 5 validator ⇒ chốt
được giao dịch". Tức luật D-005 cần một vế nữa: **tập validator trên P-Chain là điều
kiện CẦN, không đủ** — phải cộng "có node thực sự track subnet đó".
Explorer đã sửa phía mình (thẻ CAN SETTLE trước đó khẳng định 30/30 chain chốt được —
một lời nói dối đã lên production).

**Câu hỏi thực tế kèm theo:** 9 slot trống có định dùng cho L1 nào không? Chain được
track là chain đó đọc được đầy đủ trên explorer và được `9index` index tự động.

### B-2 — Blockscout: `stats` crash-loop 807 lần, `backend` ngốn hơn cả 5 validator
**2026-08-25, đo trên server lúc mạng tĩnh.**

| container | CPU | vai trò |
|---|---|---|
| `backend` (Blockscout) | **50.65%** | index chain |
| 5 node avalanchego **cộng lại** | ~37% | chạy cả testnet |
| `stats` | 0.05% | biểu đồ, **807 restart** |
| `user-ops-indexer` | 0.00% | ERC-4337, **315 restart** |

**Đọc đúng số này — nó lật ngược phán đoán ban đầu của tôi.** Thấy 807 restart thì
dễ kết luận "đang đốt CPU", nhưng đo ra 0.05%: crash-loop ở đây **không phải vấn đề
tài nguyên**. Nó là vấn đề **nhiễu** — 807 lần restart chôn mất mọi sự cố thật trong
`docker ps`, và một container flap mãi mãi thì không ai còn phân biệt được lần flap
nào đáng quan tâm.

Cái thật sự đắt là `backend`: **một mình nó nhiều hơn cả 5 validator cộng lại**, chỉ
để index một mạng gần như không có giao dịch. Đây là số liệu cứng cho quyết định
thay Blockscout bằng 9Scan-A1 (dự án `C:\PROJECTS\9Scan-A1`).

**Nguyên nhân crash-loop** (đọc log): `user-ops-indexer` không kết nối được RPC rồi
thoát code 0 → docker restart; `stats` chờ trạng thái index của user-ops, không hỏi
được → thoát. Cả hai đều là **dịch vụ tuỳ chọn** mà 9Chain-A1 không dùng:
`user-ops-indexer` là ERC-4337 (account abstraction — A1 không có), `stats` chỉ vẽ
biểu đồ (`273 charts waiting_for_starting_condition`, tức chưa vẽ được gì).

**Cần David quyết, không tự làm:** tắt hai dịch vụ này là **đổi cấu hình stack công
khai đang phục vụ người ngoài**. Rẻ và gần như chắc chắn vô hại, nhưng vẫn là quyết
định vận hành chứ không phải mặc định kỹ thuật — và explorer thuộc phạm vi 9Scan-A1.
Gỡ khi được duyệt: bỏ 2 service khỏi compose Blockscout, `docker compose up -d --remove-orphans`.

---

## Cần David quyết (không phải kẹt kỹ thuật — xem PROGRESS mục `[human]`)

### ✅ H-9 — ĐÃ CHỐT VÀ ĐÃ CHẠY (2026-08-26) — David chọn đường (a), trần **9 tỷ**

**Không còn chặn gì.** David chốt hệ số **×12,5** (720 triệu → **9.000.000.000 LOVE9**),
tức đường **(a)** trong bảng dưới: hạ trần xuống dưới `uint64`, **giữ nguyên 9 chữ số
thập phân** (đường (b) bị loại — xem D-039: đổi thang đơn vị là đụng ba chỗ độc lập mà
lệch nhau không gây lỗi nào).

- Quyết định: `DECISIONS.md` **D-039** (trần) → **D-042** (bảng phân bổ 40/30/12/9/9).
- Mã: `genesis/genesis_9chain_a1.go:116` `SupplyCap: 9_000 * units.MegaAvax`.
- **Đã chạy thật trên mạng công khai 2026-08-26**, đo trên binary đang chạy:
  `"supplyCap":9000000000000000000`. Genesis phát hành 5.400.000.000 (60%).
- Hệ quả kèm theo mà mục này chưa lường: `SupplyCap` **biên dịch vào binary**, nên đổi nó
  bắt buộc **build lại image node** — không chỉ sinh lại genesis. Xem HANDOFF mục 1b.

⚠️ **Vế "hai nhánh không còn cùng một con số" thì vẫn đúng và vẫn còn đó** — A1 chạy
9 tỷ, con số 90 tỷ của C1 không tồn tại được trong `uint64`. D-041 chốt **A1 làm chuẩn,
C1 sửa theo**; nếu C1 chưa sửa thì đó là việc của ngày G, không phải việc kỹ thuật của A1.

(nguyên văn phần thẩm định, giữ lại vì phép đo và bài học vẫn nguyên giá trị)
### H-9 (nguyên văn) — SUPPLYCAP 90 TỶ KHÔNG BIÊN DỊCH ĐƯỢC

**Đo được 2026-08-26, có đối chứng ngược. Đây không phải ý kiến.**

`SupplyCap` là **`uint64`** (`vms/platformvm/reward/config.go:33`). LOVE9 có **9 chữ số
thập phân**, nên mọi số lượng token trên P/X-Chain được đếm bằng nano.

```
uint64 max          = 18,446,744,073,709,551,615
720 triệu  (hiện tại) =        720,000,000,000,000,000   ← 3,9% của uint64, vừa
 90 tỷ     (kế hoạch) = 90,000,000,000,000,000,000       ← 4,88 LẦN uint64
```

Thử biên dịch thật bằng Go 1.26.4, đúng khuôn hằng số của `units`:
```
90_000 * MegaAvax → LỖI: constant 90000000000000000000 of type uint64 overflows uint64
18_000 * MegaAvax → build sạch          ← đối chứng ngược: phép thử phân biệt được
```

⇒ **Trần lý thuyết với 9 chữ số thập phân là 18,447 tỷ LOVE9.** Con số 90 tỷ không
"khó" — nó **không tồn tại** trong kiểu dữ liệu của avalanchego.

🔴 **VÀ NÓ CHẶN CẢ GENESIS, KHÔNG CHỈ CÁI TRẦN.** Nếu phát hành genesis cũng ×125 thì
400 triệu → 50 tỷ → `5e19` — cũng tràn. Toàn bộ bảng tokenomics phải dẫn lại dưới trần
18,447 tỷ, không chỉ sửa mỗi dòng `SupplyCap`.

**Vì sao con số này đi lọt tới đây:** nó đến từ C1. **Cosmos SDK đếm bằng `big.Int`
nên 90 tỷ ở đó hoàn toàn bình thường.** Avalanche đếm bằng `uint64`. Cùng một con số,
một bên chạy được một bên không — và "đồng nhất tokenomics giữa hai nhánh" chính là
chỗ giả định đó không được phép ngầm.

**Ba đường ra, cần David chọn — A1 không tự chọn hộ:** *(đã chọn **(a)**, xem đầu mục)*
| | Cách | Được | Mất |
|---|---|---|---|
| **(a)** | Hạ trần xuống ≤ 18 tỷ (hệ số ×25 thay vì ×125) | Không đụng gì khác; build được ngay | Hai nhánh **không còn cùng một con số** — đúng thứ ngày G sinh ra để đạt |
| **(b)** | Giảm LOVE9 còn **8 chữ số thập phân** (90 tỷ = `9e18`, vừa uint64) | Giữ đúng 90 tỷ cho cả hai nhánh | Đụng vào **bản sắc**: "9 chữ số" đi cùng LOVE9/love9/9001; đổi là đổi mọi con số, mọi hiển thị ví, mọi tài liệu đã in |
| **(c)** | Giữ 90 tỷ làm con số **công bố** trên C-Chain (18 chữ số, `big.Int`), P-Chain giữ trần thấp hơn | Không đổi bản sắc | **Hai chain khai hai tổng cung khác nhau** — tệ hơn cả hai đường trên |

**Khuyến nghị: (b) nếu 90 tỷ là con số bất di bất dịch; (a) nếu không.** Tránh (c).

~~🔴 **VIỆC NÀY CHẶN ĐƯỜNG GĂNG.**~~ *(đã gỡ — trần chốt ở 9 tỷ, D-039.)* Mọi con số
khác trong kế hoạch (phân bổ, hệ số staking, `maxValidatorStake` theo self-bond) đều
**dẫn xuất từ trần này** — nên chúng được tính **sau** khi trần chốt, và kết quả là
bảng D-042: 40/30/12/9/9, `maxValidatorStake` 625.000.000, self-bond 999.999/node.

### 🔴 H-8 — SINH LẠI GENESIS 01/09/2026: MỐC NÀY CHƯA ĐƯỢC XÁC NHẬN VỚI DAVID

**Nguồn:** phiên `9Chain-BOD` nhắn sang 2026-08-26 và đặt bản nháp
`PLAN-REGENESIS-2026-09-01.md` vào repo này. Tin đầu mở bằng *"chủ dự án uỷ quyền BOD
phát chỉ đạo tổng quát"*; **chính BOD đã tự đính chính** rằng một phiên ngang hàng
không truyền được thẩm quyền, và dặn: *"đừng nhận mốc từ tôi"*.

⇒ **A1 KHÔNG coi 01/09 là mốc ràng buộc, và KHÔNG ghi gì vào `DECISIONS.md` dựa trên
tin nhắn đó.** Cần David nói trực tiếp. Việc này chạm hai thứ mất vĩnh viễn — genesis
bất biến và custody khoá quỹ — nên mức chắc chắn "được nhắn" là không đủ.

**A1 đã thẩm định phần kỹ thuật (làm được mà không cần thẩm quyền):**

🔴 **XÁC NHẬN mối lo Block Adam của BOD — đo được, không suy.** Lấy mẫu 10 lượt
trong 5 phút trên mạng công khai lúc rảnh:
```
t=30s … t=300s   P-Chain = 330 (không đổi)   C-Chain = 0x73 (không đổi)
```
Avalanche **không đẻ block rỗng**, và điều này đúng cho **cả P-Chain** chứ không chỉ
C-Chain như gotcha cũ đã ghi. Nên luật *"block đầu tiên vượt `2026-09-09T06:09:09Z`"*
có thể **không có block nào để trỏ vào** trong hàng giờ sau mốc, cho tới khi có ai đó
bấm một việc gì. Đối sách "hẹn sẵn giao dịch nghi lễ" của BOD là đúng hướng, và
**phải diễn tập** — nếu không, sai lầm chỉ lộ ra đúng ngày 09/09.
⚠️ Giới hạn của phép đo: nó chứng minh block **không sinh theo nhịp thời gian**. Nó
không chứng minh P-Chain đứng yên tuyệt đối (sự kiện staking/validator vẫn đẻ block).

🔴 **MỘT CON SỐ TRONG PLAN SAI, ĐÚNG Ở CHỖ CHẠM NGƯỜI DÙNG THẬT.** Mục `O3` ghi
*"28 L1 người dùng sẽ mất (6 đang track, 21 đã thu hồi, + David Do 9141)"*.
Đo lúc 2026-08-26: **3 L1 sống · 43 đã thu hồi**. Cả hai vế lệch, và lệch ngược chiều.
Quan trọng hơn con số: trong 3 chain sống, **chỉ MỘT thuộc về người dùng thật, và đó
là chain của chính David** (`David Do` 9141) — `OwnerTest` là chain kiểm thử M4,
`OmegaChain` không có admin. O3 hôm nay **không phải** bài toán báo tin xấu cho người
lạ. (Việc quyết vẫn thật vì kế hoạch định mời thêm người trước 01/09.)

🔴 **MỘT HỆ QUẢ CHƯA AI NÊU: re-genesis XOÁ SỔ CHỐNG PHÁT LẠI.** 43 bản ghi `retired`
giữ `name` + `chainId` **vĩnh viễn** — đó là lý do `createChain` kiểm trùng trên
`chains ∪ retired`. Sinh lại mạng là xoá sổ đó ⇒ những tên và chainId đó **dùng lại
được** ⇒ ví của người từng dùng chain cũ sẽ lặng lẽ trỏ vào **chain của người khác**,
và chữ ký phát lại được. Đây đúng là hố sụt đã ghi trong `HANDOFF` khi giải thích vì
sao thu hồi không giải phóng chainId. Kế hoạch phải khai cách xử lý, dù chỉ là "chấp
nhận vì mạng mới không còn ai dùng chain cũ".

**Cần David trả lời hai câu, theo thứ tự:**
1. 01/09 có đúng là anh chốt không? (Nếu không thì cả mục này đóng.)
2. Nếu đúng: chain `David Do` 9141 và 43 chỗ tên/chainId đã giữ — chấp nhận mất, hay
   phải dựng lại?


| # | Việc | Chặn mốc nào |
|---|---|---|
| 🟡 H-1 | ~~supply cap 720M · tỉ lệ 40/20/20/5/15~~ **ĐÃ CHỐT (D-039/D-042): 9 tỷ · 40/30/12/9/9 · đã chạy thật**. Còn lại: **uptime 80%→90%** trước mainnet | chốt genesis mainnet, ACP-77 |
| H-2 | 🔴 **ACP-77 — đã đổi bản chất, không còn chờ được**. Xem ghi chú dưới bảng | trần 16 L1 |
| ✅ H-3 | ~~Có mở console đẻ chain ra Internet không~~ — **DAVID DUYỆT 2026-08-25, ĐÃ MỞ** ở `/console/` | M4.5 xong |
| H-4 | AAAA record `bootstrap-a1.9chain.org` (**DNS-only**, không mây cam) | M3.3 |
| H-5 | URL Cosmos REST của C1 (`:1317`) | M7.3 (dashboard live) |
| H-6 | 🟡 **Repo vẫn chưa có remote** — nhưng H-6b đã chạy, không còn là "một ổ đĩa" | nơi đặt repo lâu dài |
| H-7 | 🔴 **P2P ra Internet: IPv6-only hay IPv4 đa cổng?** Quyết định về ĐỐI TƯỢNG, xem dưới | M3.2, M3.3, M3.5 |

### Ghi chú H-7 — M3 chạm trần "chọn ai được vào", không phải trần kỹ thuật

**Đo thật trên `139.99.145.13`, 2026-08-25 (phiên thứ tư):**

| | |
|---|---|
| khối IPv6 của máy | `(không công bố)/**56**` — **256 khối /64**, dư sức mỗi node một địa chỉ |
| đường ra IPv6 | có default route, **ra Internet được** (đã curl thật qua v6) |
| IPv6 của Docker | **TẮT** (`bridge.EnableIPv6 = false`) |
| cổng P2P 9651 | **KHÔNG node nào publish** — đúng tiền đề của M3 |
| Docker Engine | **29.7.2** ⇒ bật IPv6 được **theo từng network**, KHÔNG phải restart daemon |

Dòng cuối là tin tốt nhất: restart Docker daemon là restart **mọi** container, tức
hạ cả testnet công khai lẫn Blockscout. Bản 29.7.2 tránh được việc đó.

**Nhưng có một cái bẫy về sản phẩm, không phải về kỹ thuật.** `--public-ip` của
avalanchego là **MỘT** địa chỉ, không phải danh sách (`config/config.go` →
`ips.ParseAddrPort`). Nên hai đường loại trừ nhau:

| | IPv6, mỗi node một GUA (kế hoạch M3.1 hiện tại) | IPv4, mỗi node một `--staking-port` |
|---|---|---|
| ai gọi VÀO được | **chỉ peer có IPv6** | **100% Internet** |
| cổng | 9651 tiêu chuẩn cho mọi node | 9651…9655, phải publish từng cái |
| NAT | không có | 5 node cùng máy phải vòng lại qua IP công khai |
| DNS David cần tạo | **AAAA** `bootstrap-a1` (H-4) | **A** `bootstrap-a1`, DNS-only |

Kế hoạch cũ chọn IPv6 và điều đó **sạch hơn về kỹ thuật**. Nhưng mục tiêu M3 là
*"cộng đồng tự chạy node"* — và một người muốn tham gia mà nhà mạng của họ chỉ có
IPv4 thì **không vào được**, trong khi họ chẳng làm gì sai. Ở Việt Nam tỉ lệ đó
không nhỏ. Đây là chọn tập người dùng, nên không tự quyết.

**Khuyến nghị:** IPv4 đa cổng cho **node beacon** (thứ cộng đồng cần chạm tới),
IPv6 cho phần còn lại nếu muốn. Nhưng David chốt.

**Đã làm sẵn, không chờ:** `netgen` nay sinh được cả hai hình dạng —
`A1_P2P_MODE=ipv6` + `A1_IPV6_SUBNET` + `A1_IPV6_BASE`. **Mặc định giữ nguyên hành
vi cũ** (đã kiểm bằng cách sinh lại và so: 0 dòng ipv6, `--public-ip` vẫn IPv4).
Đường IPv4-đa-cổng chưa viết vì viết cả hai rồi bỏ một là phí.

⚠️ **Áp lên mạng ĐANG CHẠY là việc riêng, không phải hệ quả tự động của M3.1/M3.2.**
`netgen` sinh **khoá mới** ⇒ chạy nó trên mạng công khai là đổi danh tính cả 5
validator = giết mạng. Mạng đang chạy phải **vá tại chỗ** compose (y như M2.3 đã
làm với cổng 9660), và cần một cửa sổ bảo trì vì container phải recreate.

### 🟢 H-6 — HẠ MỨC `2026-08-31`: remote đã có, nhưng CÒN RIÊNG TƯ

David chốt *"tạo repo riêng tư trước, chỉ push main"*. Đã làm: **`daviddokrao/9chain-a1`**,
`visibility PRIVATE`, đúng **một** nhánh `main` (299 commit) — `web-home`, `audit`,
`gday-heartbeat-gate` **không** được đẩy, chúng thuộc worktree khác.

**Quét trước khi đẩy — làm được một lần, vì lịch sử đã lên thì lên vĩnh viễn:** toàn bộ 299
commit của mọi nhánh ⇒ **0** chuỗi `PrivateKey-`+base58, **0** khoá EVM (mọi `0x`+64hex là hash
giao dịch trong gói vật chứng, cộng khoá **ewoq công khai** ghi có chủ ý), **0** giá trị mật khẩu
literal; hai tệp `.env` được theo dõi chỉ chứa cấu hình. `.gitignore` chặn đúng `local-net/net*/`
và `upstream/`.

**Nghiệm thu từ phía GitHub, không phải từ máy dev:** clone ngược về ⇒ 26 patch **trùng byte**
bản cục bộ (nên phép replay ra `60a61707` áp đúng cho thứ đã đẻ ra ngoài) · `upstream/` **vắng
mặt đúng thiết kế** · `local-net/net*/` vắng mặt ⇒ khoá quỹ không đi theo.

🔴 **CHƯA đóng.** Riêng tư thì **không** mở khoá điều kiện qua **4** (*người lạ dựng lại được
fork*) hay **5** (*công bố genesis + bootstrap*). Và trước khi công khai còn một quyết định
chưa có câu trả lời: repo này mang **4.958 dòng `DECISIONS` · 1.079 `BLOCKERS` · 1.501
`PROGRESS`**, IP máy chủ **92 lần trong 22 tệp**, đường dẫn khoá ssh **12 tệp** — tức một **bản
đồ chính xác các điểm yếu đang mở**. Ba đường: công khai hết · tách `docs/` nội bộ · hoặc một
repo riêng cho người ngoài (`patches/` + `RUN-A-VALIDATOR.md` + `LICENSE`).

⚠️ Repo riêng tư **vẫn cùng một tài khoản, một nhà cung cấp** — nó gỡ rủi ro *"một ổ đĩa"*
(`C:` đang đầy **97%**), **không** gỡ rủi ro *"một nơi"*. B-16 vẫn mở.

### Ghi chú H-6 (nguyên văn, TRƯỚC `31/08`) — 🔴 ĐẮT HƠN HẲN sau phiên 2026-08-25

Kiểm lại lúc định push cuối phiên: repo `9Chain-A1` **không có remote nào**, còn repo
fork chỉ có `origin` trỏ `github.com/ava-labs/avalanchego` — tức là upstream của người
khác, không phải chỗ đẩy nhánh `9chain-a1` lên được. **Không có đường push nào tồn tại.**

Phiên này đẻ thêm 7 commit gồm: endpoint thu hồi chain (đã nghiệm thu 29/29 trên mạng
công khai), chứng minh build tái lập từng byte, nền test đầy đủ, và `rebase-drill.sh`.
Toàn bộ vẫn nằm trên **một ổ đĩa**. Ổ hỏng đêm nay là mất, và mất kèm cả lý do — vì
DECISIONS/BLOCKERS cũng ở đó.

Đây là việc chặn có thật, không phải hình thức: **mọi mốc làm thêm chỉ làm số tiền
mất đi khi ổ hỏng lớn lên.**

### Ghi chú H-6 (cũ) — git đã có, nhưng chưa có bản thứ hai

M0 đã đưa toàn bộ lớp chủ quyền vào git (2 repo, 5 commit gốc + patch series cứu hộ).
Nhưng cả hai repo **chưa có remote** — chưa `push` được đi đâu. Ổ đĩa hỏng là mất hết,
y như trước, chỉ khác là giờ có lịch sử để mất.

Không tự làm vì đây là quyết định của David, không phải mặc định kỹ thuật: đây là
**fork blockchain chủ quyền đang chạy testnet công khai**. Đưa lên GitHub công khai
là công bố toàn bộ lớp identity, tham số kinh tế mạng và công cụ vận hành.

**Cần David chọn:** nơi đặt (GitHub cá nhân / org / self-host) và **private hay public**.
Xong thì `git remote add origin … && git push -u origin main` cho cả `9Chain-A1` và
nhánh `9chain-a1` trong `upstream/avalanchego`.

### ✅ H-6b — CHẠY LẠI 2026-08-27 (David duyệt), bản `25/08` đã cũ 25 tệp

Bản mới ở **`139.99.145.13:~/9chain-a1/backup/20260827-051507/`** và bản thứ ba ở
`C:\PROJECTS\9Chain-backups\9chain-a1-backup-20260827-051507\`.

| | |
|---|---|
| repo `9Chain-A1` | `9chain-a1.bundle` — HEAD `dd053d8` · **165 commit** · **182 tệp** |
| lớp chủ quyền | `avalanchego-patches/` — **12 patch** trên base `1cf1fc3` |
| tổng | 1,5 MB · 14 tệp · **14/14 sha256 khớp hai đầu** |

**Nghiệm thu — đo đúng đại lượng, không khai suông:**
- ✅ **Clone ngược bundle NGAY TRÊN SERVER** → tree khớp tuyệt đối
  `ae796a156fce14ea95bf182b6b66919a199218cd`, đủ 165 commit / 182 tệp.
- ✅ **Áp 12 patch lên `1cf1fc3` sạch trong worktree tách rời** → tree ra
  **`ac260a385443a2685e5dd0032fae67d636cf267e`**, khớp cây fork **từng byte**.
- ✅ 12 patch **trùng từng byte** với `patches/` trong repo (sinh bằng `--no-signature`).
- ✅ **Đối chứng ngược:** bundle cắt cụt bị từ chối đúng ⇒ phép đo **phân biệt được**
  bản lành với bản hỏng, không chỉ biết in ✓.

🔴 **VÀ BẢN SAO LƯU NÀY KHÔNG CỨU ĐƯỢC THỨ ĐẮT NHẤT.** Nó **không chứa khoá 5 quỹ**
(`local-net/net-public/keys.txt` bị `.gitignore`, cố ý). Mất máy dev vẫn = mất khoá cả
5 quỹ. Xem D-044 và `GDAY-A1-REMAINING.md` O1 — bản thứ hai do David tự cất, **chưa ai
xác nhận là có**. Đây vẫn là mục quyết số 1 trước ngày G.

⚠️ Bản ở `C:\PROJECTS\9Chain-backups\` nằm **cùng ổ đĩa** với repo ⇒ nó không phải bản
thứ hai thật. Bản thứ hai thật là bản trên server.

### ✅ H-6b — bản đầu, ĐÃ CHẠY 2026-08-25 (David duyệt trong phiên thứ ba)

Bản thứ hai đã tồn tại thật, ở **139.99.145.13:~/9chain-a1/backup/20260825-064053/**:
`9chain-a1.bundle` (42 commit, đã clone ngược thử → HEAD khớp) + `avalanchego-patches/`
(4 patch, đã áp thử → tree khớp từng byte). 6/6 sha256 khớp hai đầu.
Bundle **không chứa bí mật nào** — đã kiểm `git ls-files`: chỉ 2 file `.env` là cấu
hình Blockscout công khai, không có khoá.

Kèm backup đầy đủ ở máy dev: `C:\PROJECTS\9Chain-backups\9chain-a1-backup-20260825-064053\`
(28 file, `sha256sum -c` 28/28 OK) — có MANIFEST.txt + RESTORE.md.

🔴 **Bẫy đã dính, ghi lại để không mất giờ lần sau:** `git bundle` cho repo fork
avalanchego **sinh ra backup GIẢ**. `git bundle verify` in "is okay" + "records a
complete history", nhưng clone ngược chết ngay: `remote did not send all necessary
objects`. Lý do: repo fork là **shallow clone** (ranh giới `1cf1fc3`), và bundle từ
repo shallow luôn hỏng — kể cả khi chỉ bundle đúng một nhánh.
⇒ **`git bundle verify` KHÔNG đủ để tin. Phép đo đúng là CLONE NGƯỢC.**
⇒ Với fork: dùng **patch series** (`git format-patch <base>..9chain-a1`) + ghi lại
commit upstream gốc. Lớp chủ quyền chỉ có 4 commit trên `1cf1fc3`, upstream lấy lại
được từ ava-labs. Nghiệm thu bằng cách áp patch lên base rồi so **tree hash**
(`05c37aa4636ec64a39f5e06a0a90926e57a3d7e3`), không so commit hash — `git am` ghi lại
committer nên commit hash đổi mà cây mã nguồn vẫn đúng từng byte.

**H-6 gốc vẫn mở** (nơi đặt repo lâu dài + private/public) nhưng đã hạ mức: code không
còn nằm trên một ổ đĩa duy nhất.

### Ghi chú H-6b (nguyên văn lúc còn chờ duyệt)

Trong lúc chờ quyết định GitHub cá nhân/org/self-host + private/public, có một bước
rẻ tạo được **bản thứ hai trên một máy khác** mà không công bố gì:

```bash
git bundle create /tmp/9chain-a1.bundle --all   # 1 file, đủ toàn bộ lịch sử
scp -i "$A1_SSH_KEY" /tmp/9chain-a1.bundle "$A1_SSH_HOST":'~/9chain-a1/backup/'
```

Server `139.99.145.13` vốn đã giữ mã nguồn (`~/9chain-a1/src`), nên đây không phải
đưa thứ gì mới ra ngoài — chỉ thêm **lịch sử git** cạnh mã đã có. Không phải publish,
không phải chọn nhà cho repo, gỡ lúc nào cũng được.

**Autopilot KHÔNG tự làm** vì H-6 là việc David đã nêu đích danh là quyết định của
mình; tự đẩy repo sang máy khác dù private vẫn là lấn vào đúng chỗ đó. Cần một chữ
"ừ" là chạy được ngay.

### Ghi chú H-2 — vì sao ACP-77 không còn là việc để sau

Khi lập kế hoạch, ACP-77 được xếp "chờ chốt tokenomics" vì nó là quyết định kinh tế
(L1 chuẩn có phí duy trì liên tục). Hôm nay đọc source phát hiện nó còn là **thứ duy
nhất mở được trần kỹ thuật**:

Mô hình hiện tại — **mọi validator track mọi L1** — đụng trần cứng ở **16 L1**.
Quá 16, node bị mọi peer cắt kết nối lúc bắt tay P2P (`network/peer/peer.go:882`,
`p.StartClose()`). Mạng vỡ chứ không phải chậm đi. Chi tiết: DECISIONS D-009.

Hiện đang ở **4/15**. Console đã chặn không cho vượt.

**Nghĩa là:** "multi-L1 as a service" theo kiến trúc hôm nay phục vụ được tối đa 15
khách. Đủ cho demo và cho testnet, **không đủ cho một sản phẩm**. Muốn hơn thì phải
cho mỗi L1 một tập validator riêng — chính là ACP-77.

**Câu hỏi cho David:** A1 định bán "ai cũng đẻ được chain của mình" ở quy mô nào?
- Dưới 15 chain → kiến trúc hôm nay đủ, ACP-77 vẫn chờ tokenomics được.
- Trên 15 → ACP-77 là việc chặn, phải làm trước cả M4 (self-serve), vì mở self-serve
  trên nền trần 15 là mời người dùng vào một cái cửa sẽ đóng sập.

---

## Đã gỡ

### ✅ B-8 — ĐÃ GỠ (2026-08-25) — `load-test.mjs` treo ở 300 ví, không có trần thời gian tổng
Triệu chứng: `--phut 8 --wallet 300` treo **2 giờ 59 phút**, CPU 0,1%, chain đứng ở block 2,
**giữ một slot L1** suốt thời gian đó. Với `--wallet 60` thì chạy trọn vẹn.

🔴 **Lỗi đáng sửa không phải chỗ treo — mà là bài đo tự nhận "có chốt an toàn" trong
khi chốt đó canh C-Chain, canh đĩa, canh độ trễ, và KHÔNG canh chính nó.** Bốn lỗ:

| # | lỗ | vá |
|---|---|---|
| 1 | `setTimeout(THOI_LUONG_MS)` chỉ đặt **sau** pha nạp ví ⇒ đúng chỗ treo thật lại **không có trần nào** | trần tổng tính từ lúc khởi động, bao cả pha nạp (`TRAN_TONG_MS`) |
| 2 | mọi `sendTransaction` là `await` trần | `hanGio()` 30s mỗi lượt |
| 3 | nạp ví bằng một `Promise.all` 300 phần tử | nạp theo lô 40, `allSettled`, chịu được ví hỏng |
| 4 | `dangChay=false` chỉ đọc **giữa** hai vòng lặp ⇒ ví kẹt trong `await` không bao giờ thấy cờ dừng, `Promise.all` chờ mãi ⇒ **đường thu hồi không chạy tới** | vòng chờ chính **đua với hạn chốt** |

Kèm một chỗ sẽ làm hỏng phép đo vì lý do chẳng liên quan: mỗi ví được nạp **100.000
LOVE9** ⇒ 300 ví ăn **30 triệu** trong quỹ genesis 50 triệu, nên một bậc thang ba
lượt cạn quỹ giữa chừng rồi hỏng vì "hết tiền". Hạ về **100** (vẫn dư 60 lần so với
nhu cầu gas thật).

**Nghiệm thu:** bậc thang 20→60→150→300 ví chạy trọn, **lỗi gửi 0** ở mọi bậc, nạp
300 ví xong, đường thu hồi chạy tới (còn 6/15 L1).

### ✅ B-6 — ĐÃ GỠ (2026-08-25) — site block explorer nay nằm TRONG NGUỒN
Deploy Caddy của phiên này (`cd34d43`, M7.2) **xoá mất site block
`testnet-a1.9scan.org`** ⇒ Caddy hết cert cho zone `9scan.org` ⇒ Cloudflare bắt tay
TLS thất bại ⇒ explorer trả **525 trong 31 phút**. Bên 9Scan khôi phục tay lúc 13:18.

🔴 **Bản thân M7.2 không sai.** Gốc là site block đó được áp thẳng lên server hồi M6
của bên explorer và **chưa bao giờ vào nguồn**, nên mọi lượt `caddy-deploy.sh` đều
xoá nó — hôm nay chỉ là lần đầu bị bắt.

**Đã làm:**
1. Khối `testnet-a1.9scan.org` vào `local-net/deploy/Caddyfile` (kèm
   `import chi_cloudflare` — đã **đo** cả ba tên miền đều phân giải về IP Cloudflare
   trước khi siết, không tin lời khai), thêm deep-link `/validator/*` họ xin, dùng
   `path_regexp` để **giữ nguyên hoa/thường** vì NodeID là base58.
2. `caddy-deploy.sh` nay tự kiểm **MỌI tên miền**, danh sách **suy từ chính Caddyfile
   vừa áp** chứ không cắm cứng — cắm cứng là đẻ ra danh sách thứ hai phải nhớ cập
   nhật, mà quên cập nhật danh sách đúng là cách sự cố này xảy ra lần đầu. Nó gọi
   tên riêng mã 52x: *"Cloudflare không bắt tay TLS được — site block còn không?"*
3. Chạy thật: `✓ testnet-a1.9scan.org → 200`, và cả ba zone đều 200 qua Cloudflare,
   403 khi nối thẳng vào origin.

**Bài học, đã trả giá HAI lần trong dự án này** (lần trước là B-5, thư mục
`blockscout/` bị gitignore): **vá thẳng trên server mà không vào nguồn thì không
phải "đã sửa" — nó là quả mìn hẹn giờ tới lượt deploy sau.** Và lần này quả mìn nổ
vào tay người khác, không phải người đặt nó.

### ✅ B-4 — ĐÃ GỠ (2026-08-25, phiên thứ tư) — ba lỗi của BÀI KIỂM, không phải của sản phẩm
Chạy lại trọn bộ trên mạng công khai: **40/40 ĐẠT**. Xem D-029.
1. **`tu-in-tien`**: mint **thành công** (`status 1`, block 1) nhưng bài đọc số dư ra
   `0.0`. Thử tay trên cùng chain trước đó ra đúng **777.0** ⇒ bài đọc số dư quá sớm.
   Vá: `doiSoDu()` đọc lại tối đa 10 nhịp và in ra thấy sau bao nhiêu nhịp.
2. **`chi-chu-deploy`** và **`kin`**: `nonce has already been used`. Hai kiểu chặn để
   lại nonce ở hai trạng thái khác nhau (`txAllowList` chặn lúc nộp ⇒ nonce không
   tiêu; `deployerAllowList` revert trong block ⇒ nonce đã tiêu). Vá: `guiVoiNonce()`
   đọc nonce tươi mỗi lượt, chỉ thử lại khi lỗi đúng là lỗi nonce.

### B-5 — Hai CSDL Postgres của Blockscout mở ra Internet (2026-08-25 → gỡ cùng ngày)
David duyệt, gỡ trong phiên thứ ba. **Đo trước/sau từ máy dev qua Internet:**

| cổng | trước | sau |
|---|---|---|
| 7432 (`db`) | **MỞ** | **ĐÓNG** |
| 7433 (`stats-db`) | **MỞ** | **ĐÓNG** |
| 443 (đối chứng) | mở | mở (đúng) |

Trên server: `0.0.0.0:7432` + `[::]:7432` → còn đúng `127.0.0.1:7432`. Blockscout hồi
lại sau vài giây (`/api/v2/stats` HTTP 200), trang công khai 200, **5/5 validator vẫn
connected**, đợt bơm tải 3 giờ chạy xuyên suốt không sứt mẻ (`lỗi 0`, 252 TPS).

🔴 **Bài học quan trọng hơn cả bản vá: vá ở `blockscout/` là vá TẠM.** Thư mục đó bị
`.gitignore` (bản clone upstream) — `setup.sh` clone lại là mất vá, không dấu hiệu.
Bản vá thật nằm ở `explorer-full/9chain-a1-server.override.yml` (**có trong git**),
mục 3, dùng `ports: !override`. Đã chứng minh bằng cách **hoàn nguyên
`services/db.yml` + `services/stats.yml` về nguyên gốc** rồi chạy lại
`docker compose config`: vẫn ra `host_ip: 127.0.0.1`. Tức override một mình đủ sức.

Đáng ghi thêm: hai Postgres này mang **mật khẩu mặc định của repo Blockscout công
khai** (nằm nguyên văn trong `services/db.yml` trên GitHub), nên "mở cổng" ở đây gần
như tương đương "mở cửa". Không có cách nào biết chắc đã có ai kết nối hay chưa.

### B-1 — Docker Desktop không khởi động trên máy dev (2026-08-24 → gỡ 2026-08-25)
`docker version` treo vô hạn, daemon không lên. **David mở lại Docker Desktop bằng tay
là xong** — không cần can thiệp gì thêm; bản chạy sau đó là 4.84.0 (engine 29.6.2).

Đã chặn M0.6 suốt một phiên. Gỡ xong thì M0.6 không những đạt mà còn cho kết quả mạnh
hơn kỳ vọng: binary build lại **trùng từng byte** với bản đang chạy công khai (D-017).
Nhân đó làm luôn cả M8.2/M8.3/M8.4 — **một việc của người thật mở được bốn task**.

Ghi lại vì nó là bài học về xếp ưu tiên: một blocker "chỉ cần bấm một nút" mà nằm chặn
bốn task thì nó đắt hơn vẻ ngoài rất nhiều, đáng escalate sớm thay vì đi vòng.

### B-0 — Console chết im lặng sau khi đồng bộ code (2026-08-24)
`pkill` giết được console nhưng lệnh khởi động lại trong cùng dòng ssh không chạy
(exit 255), console nằm im. Nguy hiểm nhất: `tail console.log` sau đó trông **y hệt**
một lần khởi động thành công vì đó là **banner cũ** còn nằm lại.
**Gỡ bằng:** `local-net/deploy/console-restart.sh` — chờ cổng nhả hẳn, khởi động,
rồi **tự kiểm chứng bằng `ss -tln`** và exit khác 0 nếu không lên. Không còn phải
nhớ mẹo ngoặc vuông bằng tay.
