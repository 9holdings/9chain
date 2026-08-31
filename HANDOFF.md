# HANDOFF — 9Chain Testnet A1 (Avalanche)

Cập nhật: **2026-08-31** (phiên **ĐÊM**: 🔴 **GIỜ G CHỐT `01/09 13:09:09` Jerusalem** ·
**image g1 ĐÃ TRÊN SERVER** — chỗ chặn số 1 đã đóng · **cổng đẻ chain ĐÃ ĐÓNG** · O2 + H-6b xong ·
**hai lượt tổng duyệt, một ở mỗi băng**, và bản băng THẬT chứng minh thứ băng tập không kiểm được).
Trước đó cùng ngày, phiên **CHIỀU**: ba lượt quét · **D-132: A1 dẫn dắt** · bộ khắc chữ sẵn sàng.
Cùng ngày, phiên sáng: **MẶT NGƯỜI DÙNG** — sửa 3 lỗi đường sản phẩm (D-129→D-131). Trước đó
`2026-08-30`: diễn tập g1 (D-123→D-128, fork **26 patch / tree `60a61707`**). `2026-08-29`: mở
testnet công khai (D-116→D-122) và soát chỗ hở ngày G (`docs/GDAY-G1-GAPS.md`).

> 🔴 **ĐỌC [`CLAUDE.md`](CLAUDE.md) TRƯỚC — đó là LUẬT.** Tệp này là **bàn giao**: dài, có lịch
> sử, và phần lớn là số đo của các phiên trước. Mâu thuẫn thì `CLAUDE.md` thắng về **luật**,
> `HANDOFF.md` thắng về **số đo**. Backlog: [`PROGRESS.md`](PROGRESS.md).

## 🔵 PHIÊN SAU BẮT ĐẦU TỪ ĐÂY

```bash
node scripts/gday-preflight.mjs      # 24 cổng + 36 VIỆC TAY, một lệnh (~3 phút)
# ⚠️ Nó VẪN in 36 việc tay, nhưng 5 cái đã xong (#10 #11 #14 #15 #17) — preflight không biết.
# Thực còn: 31. Xem D-137/D-142.
```

### 🆕🆕 Phiên `2026-08-31` (ĐÊM) — GIỜ G CHỐT · IMAGE ĐÃ LÊN SERVER · HAI LƯỢT TỔNG DUYỆT

**TL;DR:** Chỗ chặn cứng số 1 (image `:g1` không có trên server) **đã đóng, sớm hơn hạn 13 giờ**.
Giờ G chốt **`2026-09-01 13:09:09` Jerusalem**. Cổng đẻ chain **đã đóng** trên sản phẩm. Toàn bộ
đường sinh mạng đã chạy trót lọt **hai lần** — một ở băng TẬP, một ở băng THẬT. 19 commit,
`d9f636a` → `7595848`.

#### 🔴 GIỜ G — ba mặt đồng hồ (D-136d)

| Jerusalem (IDT, UTC+3) | UTC | Việt Nam |
|---|---|---|
| **`2026-09-01` 13:09:09** | **`2026-09-01` 10:09:09Z** | `2026-09-01` **17:09:09** |

Chọn mốc này vì nó nằm giữa **cửa sổ phủ nhiều người nhất**: quét từng phút suốt 50 giờ mà ngày
01/09 tồn tại, cân theo dân số 51 múi giờ ⇒ đỉnh là `10:00–11:00Z`, **phủ 99,999%**, bỏ lại
**~55.000 người**. Mốc `09:09:09 Jerusalem` từng chốt trước đó bỏ lại **59,2 triệu** (cả bờ Tây Mỹ).
🔴 **Không tồn tại khoảnh khắc nào cả thế giới cùng một ngày** — múi giờ trải 26 giờ, ngày có 24.

🔴 **GO/NO-GO ở `01/09 06:09Z` (VN 13:09):** image chưa trên server và chưa tự khai đúng `commit=`
⇒ **đừng bấm `down -v`**. Cổng đẻ chain đang ĐÓNG nên hoãn **không tốn gì cho người dùng**.

#### ✅ Ba chỗ chặn cứng của phiên trước — nay còn mấy?

| | |
|---|---|
| **1. Image `:g1` không có trên server** | ✅ **ĐÓNG** (D-137). `docker save\|ssh\|docker load` **30 giây**. Nghiệm thu **hai mỏ neo độc lập**: binary tự khai `commit=9chain-a1-g1-26patch-60a61707`, **và** grep nhị phân — `9chain-a1-g1` **4 lần**, **`9chain-a1-g0` 0 lần**, `LOVE9` 2 lần. Đo lại **trên chính máy chủ**, trùng khít bản dev. `:g0` vẫn còn ⇒ đường lui nguyên |
| **2. `open-p2p-all-nodes.py` 0 lần trong runbook** | ⏳ vẫn là việc tay #26 |
| **3. Nạp `chain-factory` X→P 0 dòng** | ✅ **ĐÓNG** (D-140) — xem GOTCHAS mới |

#### 🔴 Việc tay đã XONG mà preflight vẫn in ra (đừng làm lại)

- **#10 + #11 — bump `A1Gen`:** ĐÃ XONG TỪ TRƯỚC, **đo được chứ không tin**. Go `A1Gen=1` ·
  `A1Name="9chain-a1-g1"` · `A1NameTap="9chain-a1-tap-g1"`; JS `A1_GEN=1`; **patch `0026` CHÍNH LÀ
  lượt bump** và nằm trong bộ 26 đã công bố. Bằng chứng khép kín: cây fork
  `git rev-parse HEAD^{tree}` = **`60a61707…`** = `TREE_FORK`, **0 thay đổi chưa commit**.
- **#14 · #15 · #17 — build + ship + `--build-arg`:** ĐÃ XONG (D-137). **KHÔNG build lại** (D-128).

#### Đã làm trên SẢN PHẨM (máy chủ)

| | |
|---|---|
| **Cổng đẻ chain: ĐÓNG** (D-135) | `A1_DE_CHAIN_MO=1→0`, restart bằng `~/9chain-a1/console-restart.sh`, **PID đổi**. Nghiệm thu qua Cloudflare: `POST /console/api/create` ⇒ **400 kèm văn bản của chính cổng** (không phải 401/lỗi tên/hạn mức) |
| **Sổ chặn xuyên thế hệ** (D-135b) | `chainid-issued.json` **49 · 54** đã lên server, trùng byte. Kiểm **CHỨA TRỌN trước khi đẩy**, không phải "mới hơn thì thắng" |
| **Console** (D-136b) | 4 tệp lên server; 🔴 **cố ý GIỮ LẠI `lib/chainid.mjs`** (`A1_GEN 0→1`) — đẩy hôm nay là đặt console vào **lệch thế hệ vĩnh viễn**. Nó đi **cùng lượt bump ở giờ G** |
| Drift | `12 khớp · 7 lệch` → **`16 khớp · 3 lệch`** |

#### Đã làm trước `down -v` (KHÔNG phải làm lại ngày G)

- **O2** — xuất mạng g0 cuối cùng: P 29 · X 5 · **C 96.173** · 2 L1 · **14 tệp · 1,32 GB**, nằm ở
  `~/9chain-a1/o2-export-g0-20260831/`. Nghiệm thu **hai đường** (công cụ dự án 14/14 · `sha256sum -c`).
  🔴 **Neo đã công bố NGOÀI server** (git+GitHub): `4432d62a…7b63`, xem `docs/o2-g0-final/`.
- **H-6b** — **ĐẠT · 26 patch**, hai nơi, clone ngược khớp tree ở **cả dev lẫn máy chủ**.
- **Sổ chain** — `--pull` (không mất gì) → `--write` (49·54, không đổi) → `--compact` ra
  `docs/archive/console-chains-closed-g0-2026-09-01.json`, đóng dấu **đúng giờ G** (cờ `--at` mới).

#### Hai lượt tổng duyệt — một ở mỗi băng

| | Băng TẬP `899999998` (D-139) | Băng THẬT `999999998` (D-142) |
|---|---|---|
| `engrave-verify` | **17 đạt · 0 hỏng**, mục `[5] Mạng đang chạy` **có chạy** | vân tay + `extraData` y hệt |
| validator | 9/9 | 9/9, node1 thấy 8 peer |
| L1 đẻ thử | ✅ `chainId 9001000000` — **trong khối g1**, không phải g0 | — |
| 🔴 **Đường dẫn DB** | `9chain-a1-tap-g1` | **`9chain-a1-g1`** ⇦ **chỉ băng THẬT kiểm được** |

🔴 **Vì sao dòng cuối là phép đo quan trọng nhất:** đường dẫn DB **LÀ** tên mạng. Nó ra
`9chain-a1-g1` chứ **không** ra `network-999999998` ⇒ `A1Name` **có trong bản đồ binary**, tức
nhánh `FallbackHRP` (thứ patch 0013 sinh ra để diệt, và là triệu chứng của **binary thế hệ chết**)
**không bị đi vào**. Băng tập **không kiểm được điều này** vì ở đó tên khác.

Cả hai bộ đã **shred `-u -n 3`** (**38 tệp khoá**) và **xoá thư mục**, đối chứng 0 còn lại.

### 🆕 Phiên `2026-08-31` (chiều→tối) — BA LƯỢT QUÉT · DIỄN TẬP g1 · BỘ KHẮC CHỮ SẴN SÀNG

**TL;DR:** David yêu cầu quét kỹ trước testnet 1, ba lượt. Kết quả: **cổng 14 → 20** (một bộ đối
chứng **đã ĐỎ suốt một ngày** mà preflight không chạy), **việc tay 25 → 36**, và **byte chữ khắc
TÌM ĐƯỢC** — điều kiện qua số 2 hết chặn. Mười commit: `a8e3e93` → `f6f768c`.

🔴 **Thứ quan trọng nhất phiên sau phải biết: ba chỗ chặn cứng ngày G, không cái nào từng được ghi
ở đâu.** Chúng không lộ ra từ đọc mã — chúng lộ ra từ **chạy thật** và **đo server**.

#### 🔴 BA CHỖ CHẶN CỨNG NGÀY G

**1. Image `:g1` KHÔNG có trên server, và server KHÔNG dựng lại đúng được.**
Đo `31/08`: server có `:g0` · `:dev` · `:regen9` · `:next` + 2 bản cũ — **không có `:g1`**. Tệ hơn:
`~/9chain-a1/src/upstream/avalanchego` trên server là **ảnh chụp KHÔNG phải git repo, vẫn ở
`A1Gen 0` / `A1Name "9chain-a1-g0"`**, không `.git`, không `patches/`. Build ở đó ⇒ **binary thế hệ
chết mang nhãn `:g1`**. Node boot với `--network-id=999999998` trên binary chỉ biết `999999999`:
`NetworkName()` rơi xuống `network-999999998` (**sai đường dẫn DB**), `GetHRP()` sống bằng
`FallbackHRP` — đúng nhánh patch 0013 sinh ra để xoá. Nó **có** bị bắt (`watch-network`, cổng thế hệ
console) — nhưng **sau khi `down -v` đã xoá g0**.
⇒ `docker save` trên dev → `docker load` trên server → **đo `--version` TRÊN SERVER**, đòi
`commit=9chain-a1-g1-26patch-60a61707`. Đó mới là *"binary đã diễn tập = binary đang chạy"* (D-128).

**2. `open-p2p-all-nodes.py` xuất hiện 0 lần trong runbook ⇒ KHÔNG người ngoài nào validate được.**
netgen `ipv4port` chỉ cho **beacon** khai địa chỉ công khai (patch 0024/D-089). D-118b **đã đo cái
giá**: node ngoài học địa chỉ 8 node kia qua gossip, chúng khai `172.28.0.x` ⇒ với tới **1/9
validator (~11%)**; bootstrap đòi **80%**; stake đòi bootstrap ⇒ **vòng khép, không có đường ra bằng
cấu hình**. Ngày G: beacon + node9 Hetzner công khai, bảy node nội bộ ⇒ **~22%**, vẫn xa 80%.
⚠️ **Thứ tự quyết định:** lên mạng bằng mặc định netgen TRƯỚC (mesh hình thành qua địa chỉ nội bộ),
**rồi mới** mở cổng, recreate **từng node một**. D-089 đo mesh teo thành hình sao khi mọi node khai
IP công khai lúc **SINH** mạng; D-118c đo **không** teo khi làm với mesh đã có.

**3. Nạp ví `chain-factory` X→P — runbook có 0 dòng (`grep` = 0).**
Trên genesis mới, tiền thanh khoản mọi quỹ nằm trên **X-Chain**, CLI trả phí trên **P-Chain**. Đo
trên mạng tập: Foundation `71.000.009` trên X, **`0` trên P**. Quên ⇒ console lên xanh và **người
đầu tiên bấm nút nhận `insufficient funds`**.

Ba việc tay nhỏ hơn cùng loại: **`A1_CONFIG_DIR` khai tường minh** (mặc định `../../9chain-a1-config`
sai với bố cục server ⇒ **mọi lượt đẻ chain chết**, node vẫn 9/9 xanh) · **`--build-arg A1_COMMIT=`**
(tiêu chí nghiệm thu image trước đó **không thoả được từ runbook** — `A1_COMMIT` chỉ tồn tại ở
`Dockerfile:24`) · **`gen-chainid-issued --write`** chèn giữa `--pull` và `--compact`.

#### ✅ BỘ KHẮC CHỮ — SẴN SÀNG, VÂN TAY ĐÃ ĐÓNG BĂNG

Byte **tìm được**, nằm inline trong CR của C1
(`9Chain-C1/9chain-operator/config/samples/chain_love9.yaml` dòng 611–617), rút ra `docs/engrave/`
dạng **`body as-is`** — không NFC/NFD, không thêm bớt xuống dòng. Tái lập **đúng cả 4 hash đóng băng
`07/08`**, kiểm hai lần bằng hai công cụ.

| tài liệu | byte | mặt |
|---|--:|---|
| `genesis_inscription` (Hebrew) | 108 | `p` |
| `dedication` (Adam) | 25 | `p+c` |
| `dedication_eva` (Eva) | 45 | `p+c` |
| `love_paper_en` | 964 | `p+c` |

**Tổng 1.142 byte — NHỎ HƠN bản tập `1.328 B`** ⇒ đường ống đã kiểm ở đúng cỡ. *(LOVE Paper là
**964 byte**, một trang; nó bị rút từ `5.854 B` xuống lõi bất biến ngày `2026-08-13`.)*

```
A1_ENGRAVE_CONFIRM=f04e939b58e58db46714047978b989cb167cf5f8875bcb4e4ad2563ebd366b18
cChainAddress     =0x9000000000000000000000000000000000000009   (David chốt)
```

🔴 **Vân tay dùng được cho ngày G**: `loadEngraving()` **không nhận networkID**, `engraveRoot` chỉ
băm `version + địa chỉ + (id, lang, mặt, sha256)`. Lượt băng TẬP ra đúng con số lượt băng THẬT.

**David chốt: BỎ `ASV 1901`** — nó chưa có hash trong freeze của C1, nên netgen sẽ **chặn** nếu đưa
vào. Và A1 tự đóng băng nó là để cổng so A1 với chính A1 (**D-112**).

⚠️ **Địa chỉ khắc chữ KHÔNG phải ví của ai — đó là TÍNH CHẤT.** Đã kiểm: coreth có `ErrSenderNoEOA`
(EIP-3607) ⇒ không gì gửi được giao dịch **từ** tài khoản có `code`; địa chỉ có **0 ký tự `a-f`** ⇒
EIP-55 là phép rỗng, không chép sai kiểu chữ được; ngoài vùng precompile và ngoài `0x0200…`; netgen
từ chối sinh mạng nếu trùng địa chỉ quỹ. 🔴 **Nhưng tiền gửi vào đó CHÁY vĩnh viễn** — phải công bố
kèm câu đó ở mọi nơi địa chỉ xuất hiện.

#### Cổng: 14 → 20, và một bộ đối chứng đã ĐỎ suốt một ngày

🔴 **`check-net-dirs --self-test` ĐỎ từ lượt bump `A1Gen 0→1` (`30/08`)** — một ca cắm cứng
`999_999_998` làm *"thế hệ SAU"*, mà số đó **thành networkID SỐNG** ở lượt bump. Đúng lớp **D-124**,
một tệp xa hơn. Ẩn được vì preflight chỉ chạy **7/15** bộ tự kiểm. Nay nối thêm **6**.

Sáu thứ khác, mỗi cái là *"đo sai đại lượng"*:

| | |
|---|---|
| `check-clock-skew` | đo **đồng hồ của Cloudflare**, không phải của node (`server: cloudflare`, `cf-ray …-CDG`). Nay đọc `block.timestamp` — giá trị **do node sinh**. Số đầu: node **−1569ms** vs CF **−952ms**, node ở **chiều nguy hiểm**; bù `3000 → 3025` |
| `h6b-backup --check` | **mù hoàn toàn với cây fork** — `.gitignore` có `upstream/` ⇒ `git ls-files upstream` = **0**. `manifest.env` đã ghi sẵn `FORK_TREE` mà `doc_manifest()` vứt đi. Nay so thật |
| `console/index.html:302` | in **id preset** thay vì tên (`.ten`, khoá chết từ D-108) — cùng tàn dư D-129, không sang tới trang của chính console |
| `guard.mjs` `requireInt` | `Number(env hoặc mặc định)` biến typo thành `NaN`, mọi phép so với `NaN` là false ⇒ `A1_MAX_L1=fifteen` **xoá sạch trần 15 L1** |
| faucet | cooldown địa chỉ nay kiểm **trước** khi tiêu suất IP; `lastDrip` có bộ quét |
| `export-chain` | đứt giữa chừng nay tính là **CẮT**; `tip.json` ghi `blocksExported`/`complete` |

#### Diễn tập g1 — và thứ KHÔNG diễn tập được

Băng TẬP `899999998`, 3 node, image `:g1`. **Đường khắc chữ trong tài liệu chạy được lần đầu tiên
trong repo** (`/repo` mount; trước đó `A1_ENGRAVE` là đường dẫn host, **không tồn tại trong
container**, và không thư mục `net*` nào có `engraving.md`). `engrave-verify` trên chain SỐNG:
**15 đạt · 0 hỏng**, có mục `[5] Mạng đang chạy`, `parentID` block 0 P-Chain `==`
`sha256(genesisBytes)`. Block Adam ở thế hệ 1: **10 đạt · 0 hỏng**, gồm phép **neo ngược**.
Gotcha 16 tái hiện đúng D-105 (`image: :dev` ×3).

⛔ **Console đẻ L1 KHÔNG diễn tập được trước ngày G** — cổng thế hệ so node với
`NETWORK_ID = A1_ID_GOC − A1_GEN` (băng THẬT), **không có biến thể băng TẬP**, nên trước mạng tập
nó **từ chối theo kiến trúc** (đã kiểm ở tầng API, không chỉ banner). Cổng làm **đúng việc** (D-093)
⇒ đường đẻ chain chỉ kiểm được **trên g1 thật**. Đẻ **một** L1 rồi thu hồi, **trước khi công bố**.

🔴 **Diễn tập tìm ra: cổng đối chiếu C1 của netgen KHÔNG bắt được manifest gán nhầm tài liệu** —
đúng ca câu lỗi của chính nó mô tả. Nó neo bằng `Contains(dòng, tên_tệp)` **hoặc** `Contains(dòng,
id)`, mà `file` là trường một lượt gán nhầm sẽ đổi. **Freeze của C1 (dạng `title  hash`, không có
tên tệp) vá lỗ này** — chỉ `id` neo được. ⇒ Đặt `id` manifest **trùng `title` C1**, tệp `<id>.txt`,
**đừng đặt trần `<id>`** (`dedication` là chuỗi con của `dedication_eva`).

#### Hai ví số đẹp — `local-net/tools/vanity-keygen/`

| ví | địa chỉ | tìm trong |
|---|---|---|
| `chain-factory` (P-Chain — nơi nó tiêu tiền) | `P-love91999h0q4ucfnex9q0qxefuu0ke0xtyvl6739999` | 52m36s · 1,19 tỷ |
| `faucet` (EVM — nơi người dùng nhìn) | `0x90001e27808F4aAa9FF672f5714476EB8E3f0009` | 1h14m45s · 1,34 tỷ |

Khoá ở `C:\Users\abc\9chain-a1-keys\g1\` (chmod 600) — **chưa ví nào có tiền**. Log tạm trong
`%TEMP%` đã `shred -u -n 3` ngay trong phiên tạo ra chúng. `check-key-leaks` mốc so **7 khoá/2 nguồn
→ 9 khoá/4 nguồn**: nay **mọi `*-key.txt` trong thư mục thế hệ tự vào mốc**, thôi khai tay.

⚠️ **Sáu ví quỹ genesis KHÔNG làm số đẹp được** — netgen đúc chúng trong `newFund()` ⇒ sửa
`patches/`. Ví faucet làm được vì **`FAUCET_PK` là biến môi trường, không phải sự thật genesis**.

#### GOTCHAS mới

23. 🔴 **Công cụ ghi kết quả vào `%TEMP%\*.log` là hình dạng D-117.** Lượt tìm khoá ghi khoá riêng
    vào đúng thư mục `check-key-leaks` sinh ra để canh. Dời vào kho khoá + `shred` **trong chính
    phiên tạo ra nó**, đừng để sang phiên sau.
24. 🔴 **`latest` trên một chain chưa có block nào là GENESIS với `timestamp 0`.** `check-clock-skew`
    trả *"không đo được"* thay vì khai lệch 55 năm — đúng, nhưng nghĩa là **phải mở block 1 trước**
    (một giao dịch chuyển tiền thường, 21000 gas cố định — luật M5.4).
25. 🔴 **Trên chain nhàn rỗi, TUỔI BLOCK áp đảo phép đo lệch đồng hồ.** Block ~10s tuổi cho
    `−10136ms ± 501ms`, gần như toàn bộ là tuổi block. ⇒ B-13(b) phải đo **lúc chain đang đẻ block**.
26. **Repo A1 sạch trên trục blockchainID** — không ID sống nào cắm cứng, và `cb58.mjs` nay neo vào
    P-Chain ID (`ids.Empty`, giống nhau ở mọi mạng Avalanche) ⇒ **sống sót qua re-genesis**. Rủi ro
    còn lại nằm **ngoài repo**: 9Scan-A1 và worktree `web`.

#### Số đo cuối phiên

```
preflight --no-network   20 đạt · 0 đỏ · 0 không chạy được · 4 bỏ qua · 36 việc tay
h6b --check              ✓ xanh (fork tree 60a61707f797 khớp — phép so MỚI)
check-key-leaks          exit 0 · mốc so 9 khoá / 4 nguồn
nợ ngôn ngữ              5.753 → 5.750
sổ console trên server   🔴 2 SỐNG — `Eric1` #9000000010 · `eric1` #9000000011 (đo lại 13:40 UTC)
mạng g0                  10 validator · 9 peer · factory 89,899 LOVE9 · B-12 còn 12 ngày
```

#### Việc tiếp — theo thứ tự chặn

1. 🔴 **David:** `docker save`/`load` image sang server · **B-16** (hôm nay là cửa sổ **rủi ro bằng
   không** — bộ g0 bị vứt ngày mai) · **B-19** · **B-20** (gói `h6b` **vừa dựng**, qua cả bốn phép
   nghiệm thu của chính nó, chứa **0 `staker.key` · 0 `signer.key` · 0 `genesis.json`** — **đếm tệp**
   mới là phép đo, đọc dòng `--check` thì không)
2. 🔴 **David:** GitHub repo rỗng (5 phút, mở khoá điều kiện **4 + 5**) · báo **D-132** cho C1 + BOD
   (họ có thể đang chờ giao ASV theo chiều cũ)
3. **A1:** ✅ ~~dịch `CREATE-A-CHAIN`~~ **XONG** — bản **EN** giữ tên gốc và là **nguồn dịch** cho
   29 thứ tiếng; VI dời sang `.vi.md`/`.vi.pdf`. Cả hai nay có cảnh báo *"chain tạo trước `01/09`
   sẽ bị XOÁ"* — tài liệu cũ hứa *"một blockchain của riêng bạn"* mà không nói mạng sắp dựng lại.
   ✅ **PDF tiếng Anh đã sinh** — 5 trang A4, và đường sinh nay là **một lệnh tái lập được**:
   `node scripts/build-doc-pdf.mjs <file.md> [--counter-check]` (lượt trước dựng tay và **không
   giữ lại HTML**, nên chỉ tái lập được từ một ghi chú trong `HANDOFF`). · còn nợ: cấp số quyết
   định cho các phát hiện phiên này (mới có **D-132**)
4. **Sau ngày G:** tổng quát hoá `verifyAgainstC1` → *"đối chiếu với CANON"* (D-132 §4) · điền **11
   chỗ `FILL-ON-G-DAY`** trong `docs/RUN-A-VALIDATOR.md` (cổng xuất bản: `grep -c` phải `= 0`)

🔴 **Khuyến nghị còn nguyên: TÁCH ngày G thành hai sự kiện.** `01/09` sinh lại g1 + khắc chữ — phần
**mã** đã sẵn sàng. **Mở công khai** khi xong điều kiện 4 & 5, vài ngày sau, vẫn trong hạn `06/09`
của Block Adam. Mở cửa mà người lạ không clone được, không có `RUN-A-VALIDATOR.md` điền xong, không
có genesis + bootstrap công bố thì đó là **một RPC công khai**, không phải một testnet công khai.

### 🆕 Phiên `2026-08-31` — MẶT NGƯỜI DÙNG: sửa 3 lỗi trên đường sản phẩm, và soát tổng trước ngày G

**TL;DR:** David đi thử **đúng đường một user thật** (`/create-chain/`) và đường đó gãy ở ba
chỗ, cả ba đã sửa + nghiệm thu trên sản phẩm. Soát tổng cuối phiên: theo **điều kiện qua của
chính dự án** (`TESTNET1-PUBLIC` §4), ngày `01/09` đang đạt **1/5** — và thứ chặn phần lớn
**không phải mã**. Bản đầy đủ: artifact *"Hiện trạng trước giờ G"*.

#### Ba lỗi trên đường sản phẩm — đã sửa

| lỗi | gốc rễ | nghiệm thu |
|---|---|---|
| **Ô chọn loại chain hiện 6 dòng TRỐNG** | web đọc `p.ten`/`moTa`, console trả `{id,name,desc}` — tàn dư lượt đổi id preset sang tiếng Anh (D-108) **không nối sang web** | bundle công khai nay `children: e.name` · `"chuan"` **0 lần** |
| **Cổng đẻ chain ĐÓNG** | D-087, đúng thiết kế | David chốt **mở hẳn tới ngày G**; console tự khai `đẻ chain: 🔓 MỞ` |
| 🔴 **`A1_PUBLIC_RPC_BASE` trỏ tên miền CHẾT** | biến trên server khai `rpc-testnet-a1.9chain.org` (**525**) | sửa → `rpc-a1.9chain.org` (**200**) |

🔴 **Lỗi thứ ba là thứ suýt làm hỏng đúng việc David sắp làm:** console dùng biến đó dựng URL
RPC **trả cho người vừa tạo chain**. Chain sẽ chạy thật, nhưng người dùng nhận một địa chỉ RPC
chết — dán vào MetaMask không bao giờ nối được. Nó nằm trong **biến môi trường trên server**,
không phải mã trong repo, nên **không cổng nào canh**. `server.mjs` có sẵn dòng dặn đặt đúng
tên; biến *có* được đặt, chỉ là đặt tên cũ.

⚠️ **Đã đụng worktree web** (vượt luật cứng #4) theo yêu cầu David, sau khi đo worktree sạch.
Commit `7ac2ada` trên `web-home`, đã `web-deploy.sh` (7/7 liên kết sống). Console restart bằng
`~/9chain-a1/console-restart.sh` (PID mới 751090 ≠ cũ 145971).

#### 🔴 Khoá `A1_CLI_KEY` đã LỘ trong transcript — việc bắt buộc cho ngày G

Lệnh đo env tiến trình console của A1 lọc thiếu: che `TOKEN=`/`PK=` nhưng **không** che
`A1_CLI_KEY`. Khoá ví `chain-factory` (giữ ~90 LOVE9 **testnet**) in ra dạng rõ. Thiệt hại kinh
tế **bằng 0**, nhưng: **ngày G PHẢI sinh khoá factory mới** — trước đây là *nên* (D-117b), nay
là *bắt buộc*. ⇒ Đừng in `/proc/<pid>/environ` của console nữa; nếu cần, lọc theo **danh sách
trắng tên biến**, không lọc theo mẫu.

#### Số đo cuối phiên `2026-08-31`

```
preflight đầy đủ    15 đạt · 3 đỏ · 0 không chạy được · 24 việc tay
drift               17 khớp · 2 lệch (chainid*, do repo ở g1) · 3 mồ côi heartbeat-*
check-net-dirs      🔴 2 tệp giữ TIỀN THẬT ngoài thư mục thế hệ sống (B-19)
h6b-backup --check  🔴 "bản sao lưu không còn tả được mạng đang chạy"
mạng g0             10/10 validator · sống
```

#### 🔴 Điều kiện qua `01/09`: **1/5** — và rủi ro số 1 tránh được bằng MỘT quyết định

| # | điều kiện | trạng thái |
|---|---|---|
| 1 | preflight exit 0 | 🔴 3 đỏ + **24 việc tay chưa tick** |
| 2 | g1 sống, chữ khắc đọc ngược được | 🔴 **cơ chế 13/13 xong, BYTE CHƯA TỒN TẠI** |
| 3 | node NGOÀI máy chủ là peer | ✅ đạt |
| 4 | repo công khai, người lạ dựng lại được fork | 🔴 cây fork sẵn sàng, **chưa có GitHub** |
| 5 | genesis+bootstrap công bố + tài liệu validator | 🔴 `RUN-A-VALIDATOR.md` **chưa tồn tại** |

🔴 **Rủi ro cao nhất: ngày G có thể mất lý do tồn tại.** Khắc chữ là lý do chính để bỏ `g0`
đang chạy tốt. Không có byte ⇒ trả **toàn bộ** chi phí re-genesis (mọi blockchainID đổi, mọi ví
về 0, mọi L1 biến mất) để nhận về một mạng **giống hệt cái vừa xoá**. Ba đường: đóng băng byte ·
chấp nhận g1 không chữ khắc · **dời ngày G**. `g0` không có gì buộc phải chết ngày 01/09.

#### Việc A1 làm được ngay — phiên sau bắt đầu từ đây

1. `docs/RUN-A-VALIDATOR.md` (**G-2**, điều kiện qua số 5) — chưa ai nhận từ `29/08`.
2. `bash scripts/h6b-backup.sh` — cổng đang **đỏ**.
3. Ghi `DECISIONS.md` cho 3 thay đổi phiên này (D-129…): web preset · mở cổng · RPC base.
4. Soạn gói công bố **genesis + bootstrap** (chờ GitHub repo của David mới push được).
5. Dịch `docs/CREATE-A-CHAIN.md` sang tiếng Anh (bản gốc để dịch 29 thứ tiếng còn lại).

#### Việc CHỈ David làm được — xếp theo độ trễ

1. 🔴 **Quyết về byte chữ khắc** — mọi thứ khác phụ thuộc.
2. **Tạo GitHub repo rỗng** + cấp quyền — 5 phút, mở khoá **hai** điều kiện qua.
3. 🔴 **B-16** bản sao khoá quỹ sang **máy tính thứ hai** — chặn GO/NO-GO, cần phần cứng.
   Bộ khoá g0 bị bỏ ngày G ⇒ hôm nay là cửa sổ tập **rủi ro bằng không**.
4. 🔴 **`heartbeat-*` là của ai** — sau `down -v` mất manh mối.
5. **B-19** dời khoá giữ tiền khỏi thư mục "đồ chết" TRƯỚC mọi lượt dọn.
6. B-17 (6 tệp `.bak`) · PR chainId · báo 9Scan-A1 + worktree web sửa số thế hệ chết.

#### GOTCHAS mới của phiên này

1. 🔴 **Cấu hình sản phẩm nằm ở BIẾN MÔI TRƯỜNG TRÊN SERVER là điểm mù của mọi cổng.**
   `A1_PUBLIC_RPC_BASE` trỏ tên miền chết nhiều ngày: repo đúng, `check-deploy-drift` xanh cho
   nó (drift so **tệp**, không so **env**), và triệu chứng chỉ lộ ra ở tay người dùng cuối.
   ⇒ Thêm phép đo env server vào runbook, đừng chỉ so tệp.
2. 🔴 **`heartbeat.json` KHÔNG phải rác — trang chủ đọc số đo từ nó** (`/chains/data/heartbeat.json`).
   Suy đoán trước đó (*"bộ bơm giao dịch"*) mới đúng một nửa. Sau `down -v` mà không dựng lại
   thì **trang chủ in số của mạng đã chết**, 200 và không cổng nào bắt.
3. 🔴 **Explorer công khai `a1.9scan.org` khai endpoint bằng tên miền CŨ** ⇒ mọi số rỗng
   (`LATEST BLOCK —`). NetworkID nó in thì **đúng**, nên lỗi không lộ ở chỗ dễ thấy. Người lạ mở
   explorer sẽ kết luận mạng chết trong khi mạng chạy 10/10.
4. **Lọc bí mật phải theo DANH SÁCH TRẮNG tên biến**, không theo mẫu chuỗi — xem mục khoá lộ.
5. **In PDF từ HTML: khối `<details>` đóng thì KHÔNG được in ra.** Bảng thông số mạng suýt biến
   mất khỏi bản PDF phát cho người dùng — mất đúng hai giá trị tài liệu sinh ra để trao.
   Kèm: `break-inside: avoid` trên mỗi bước đẻ ra trang trắng (9 trang → 7 sau khi nới).

#### Lệnh hữu ích (phiên này thêm)

```bash
# Mặt web (worktree C:\PROJECTS\9Chain-A1-web, nhánh web-home)
cd C:/PROJECTS/9Chain-A1-web && npx --prefix web tsc --noEmit
cd C:/PROJECTS/9Chain-A1-web/web && npm run build
cd C:/PROJECTS/9Chain-A1-web && bash local-net/deploy/web-deploy.sh   # tự nghiệm thu 7 liên kết

# Console trên server — KHỞI ĐỘNG LẠI ĐÚNG CÁCH (tự chứng minh PID mới ≠ PID cũ)
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" '~/9chain-a1/console-restart.sh'

# Console tự khai trạng thái cổng đẻ chain (đừng đoán từ mã)
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'grep "đẻ chain" ~/9chain-a1/console.log | tail -1'

# Đo bundle CÔNG KHAI thay vì tin bước deploy
curl -s https://a1.9chain.org/create-chain/ | grep -oE '/_next/static/chunks/app/create-chain/[^"]*\.js'

# Xuất PDF từ một trang HTML (giữ nguyên thiết kế)
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu \
  --virtual-time-budget=20000 --no-pdf-header-footer --print-to-pdf=out.pdf "file:///duong/dan.html"
```

#### Tài liệu phiên này tạo

- [`docs/CREATE-A-CHAIN.vi.md`](docs/CREATE-A-CHAIN.vi.md) + [`docs/CREATE-A-CHAIN.vi.pdf`](docs/CREATE-A-CHAIN.vi.pdf) *(đổi tên `31/08`: bản **tiếng Anh** nay giữ tên gốc `CREATE-A-CHAIN.md` và là **nguồn dịch**)*
  — hướng dẫn cho user mới hoàn toàn, 7 trang A4, phát được cho người ngoài.
- Artifact *"Chain đầu tiên của bạn"* (bản web của tài liệu trên) và *"Hiện trạng trước giờ G"*
  (bản soát tổng 5 điều kiện qua + kế hoạch). Link trong lịch sử phiên `31/08`.

### 🆕 Phiên `2026-08-30` — DIỄN TẬP g1 (máy dev, băng TẬP `899999998`)

**David chốt hôm nay:** diễn tập hôm nay, có thể thêm một lượt `31/08` trước ngày G. Và **hai
quyết định đổi hướng ngày G** — cả hai từ số đo, không từ ý muốn:

| | David chốt `30/08` | vì sao |
|---|---|---|
| **`N=9`**, Hetzner **THAY** một node OVH | **D-126** | D-122 lật D-046 mà không mục nào ghi là đang lật. Chỉ `N=9` cho self-bond **`999.999`** LOVE9/node (`8.999.991 = 9 × 999.999`), và số đó vào genesis **bất biến**. netgen cảnh báo ở **mọi** lượt `N=10` — cảnh báo đó bị đọc lướt suốt |
| **giữ `A1_STAKING_PORT_BASE` mặc định `9651`** | **D-125** | bẫy `9660` **không tồn tại** (đo, xem dưới). `ufw 9651` đã mở, tài liệu công khai đã nói `9651` |

🔴 **`A1Gen` NẰM TRONG bộ patch (0018) ⇒ bump thế hệ LÀ sửa `patches/`** (**D-123**). Bump ở cây
làm việc mà quên sinh lại bộ patch thì image ngày G **đúng**, còn bộ patch **công bố** vẫn khai
`A1Gen 0`: người ngoài build ra binary của **thế hệ đã chết**, không join được — mà cổng
fork-tree **xanh suốt** và điều kiện qua số 4 của `01/09` cũng xanh. Không tài liệu nào từng nối
hai thứ này. ⇒ Đã sinh lại: **26 patch · tree `f2b9486b` → `60a61707`**, đối chứng **25/26 →
`f2b9486b`**. Bộ 25 patch cũ chỉ đổi dòng đếm `[PATCH nn/25→26]` (**50 dòng, 0 dòng nội dung**).

🔴 **Hai cổng cắm cứng thế hệ 0 ⇒ mù đúng vào ngày bump** (**D-124**). `check-consistency`
**5/14** ca đối chứng ngược ngừng bắt được — và đó đúng là năm cách hỏng của ngày G (*bump JS
quên Go* · *bump Go quên JS* · *quên `A1Name`* · *khối chainId giữ nguyên* · *console mang
networkID thế hệ trước*). `chainid-test` thì **ĐỎ GIẢ**. Đã sửa cả hai sang **lệch tương đối**;
14/14 và 36/36 xanh lại, có đối chứng ngược cho chính bản vá.

🔴 **Phép nghiệm thu trong `GDAY-NODE10-HETZNER.md` SAI** (**D-127**): nó đòi
`grep -c -- "--public-ip=<IP>"` **= 10**; đo thật là **1**, và **1 mới đúng** (chỉ beacon khai IP
công khai — patch 0024/D-089). Dòng cũ báo "hỏng" cho một mạng **đúng**, và cách sửa hiển nhiên
là tái lập chính thiết kế mà diễn tập của nó đã bác. Đã sửa tài liệu + thành việc tay riêng.

**Số đo (D-128 có bảng đầy đủ):** image `9chain-a1/node:g1` build **exit 0**, binary tự khai
`commit=9chain-a1-g1-26patch-60a61707` · `supplyCap 7900000001000000000` · `eth_chainId
0x218711a09` · `LOVE9` giải được, **`AVAX` đỏ có lý do** · chữ khắc `engrave-verify` **13 đạt ·
0 hỏng** (đọc ngược từ chain sống, cả hai lượt) · hình dạng ngày G `N=9`: node9 chạy **ngoài
compose**, bootstrapped P/X/C, nodeID **khớp genesis**, `getCurrentValidators` = **9**, node
**không phải beacon** thấy nó, cửa sổ hạn **56 ngày** offset **7 ngày**.

🔴 **Image `9chain-a1/node:g1` DÙNG LẠI ĐƯỢC NGÀY G** — binary không phụ thuộc byte chữ khắc.
Bước dài nhất của ngày G đã đẩy ra khỏi ngày G. **Đừng xoá image này.**

⏱️ **Con số đáng nhớ nhất:** node ngoài bootstrap ở **~50s**, nhưng node **không phải beacon**
chỉ thấy nó ở **~70s**. Chấm điểm ở mốc 30s là khai một sự cố không có thật.

⚠️ **Giới hạn phải khai:** node ngoài chạy trên **cùng máy dev**, nên rào cản mạng giữa **hai máy
vật lý** không được mô phỏng. Lượt này **không thay thế** phép đo với Hetzner —
`ingressConnectionCount` (D-121) vẫn phải đo ở đó.

⚠️ **Bẫy phép đo mới:** `engrave-verify --rpc` qua `host.docker.internal` ⇒ **403 "invalid host
specified"**. Đó là bộ lọc `Host` của M11.10 **làm đúng việc**, không phải chữ khắc hỏng.

**Đã dọn ngay trong phiên (D-107):** `a1tap-node-1/2/3` + 3 volume · `net-probe-portbase`
(22 tệp khoá) · `net-tap-g1` (20 tệp khoá) — `shred -u -n 3`, đối chứng `find` ⇒ 0 tệp.
`check-key-leaks.mjs` ⇒ **exit 0**. 49 container của dự án khác **không đụng tới**.

**Số đo cuối phiên — lượt ĐẦY ĐỦ có mạng:** **15 đạt · 3 đỏ · 0 không chạy được · 24 việc tay**.

🔴 **BA ĐỎ NÀY LÀ ĐỎ DỰ KIẾN TỚI NGÀY G — đã kiểm từng cái đỏ VÌ ĐÚNG LÝ DO. Đừng vá cho xanh.**

| cổng | đỏ ở mục nào | vì sao đó là ĐÚNG |
|---|---|---|
| `watch-network` | tên mạng `9chain-a1-g0` (repo mong `g1`) · networkID `999999999` (mong `999999998`) | **hệ quả trực tiếp của bump.** Repo tả `g1`, mạng sống là `g0`. Hết đỏ **đúng lúc** mạng g1 lên |
| | số validator **10** (mong 9) | hệ quả lượt stake D-119 + D-126 nay chốt `N=9`. Hết đỏ ở ngày G |
| | B-12 · hạn sớm nhất **13 ngày** (`2026-09-12`) | validator thứ 10 stake-sau, hạn 14 ngày. **Nó chết cùng mạng g0 ngày G** ⇒ không phải rủi ro thật, **trừ khi ngày G trượt**. Mạng g1 đo được cửa sổ **56 ngày** |
| `check-deploy-drift` | **2 lệch**: `local-net/lib/chainid.mjs` · `local-net/console/chainid-test.mjs` | đúng **hai tệp vừa bump**. Hết đỏ khi console g1 được deploy (đã là việc tay) |
| | **3 mồ côi** `heartbeat-*` | **G-6, việc của David** — xem dưới |
| `check-net-dirs` | **B-19** | không đổi, việc của David |

🔴 **G-6 có thêm manh mối, chưa phải câu trả lời.** Ba tệp mồ côi nay đọc được tên đầy đủ:
`9chain-a1-config/heartbeat.json` · `local-net/faucet/heartbeat-pump.mjs` ·
`local-net/faucet/fund-heartbeat-wallets.mjs`. Tên tự khai đây là **bộ bơm nhịp sống 9 tx/s**,
và **nguồn của nó không nằm trong repo này**. ⇒ Sau `down -v` nó sẽ bơm vào một chain **đã chết**
bằng ví **thế hệ cũ**. Vẫn cần David nói nó đến từ đâu — **đừng khai vào `knownExtra` cho xanh**.

### 🆕 Phiên `2026-08-29` (chiều) — SOÁT CHỖ HỞ NGÀY G

**Câu David hỏi:** *"còn cần làm gì cho ngày G1, có cần diễn tập chạy lại chain nữa không?"*

**Kết quả: 17 việc tay của preflight đều ĐÚNG và xếp đúng thứ tự — vấn đề nằm ở thứ KHÔNG có
trong đó.** Soát ra **7 chỗ hở**; **5** đã đưa **thẳng vào `MANUAL_TASKS`** (17 → **22**), vì
danh sách việc tay là thứ **duy nhất chặn được** ngày G — tài liệu là nơi người ta *định* đọc.
Bản đầy đủ: [`docs/GDAY-G1-GAPS.md`](docs/GDAY-G1-GAPS.md).

| | chỗ hở | ai |
|---|---|---|
| G-1 | **B-20** sao lưu danh tính 10 validator của g1 — B-20 tự khai *"phải làm LẠI"* mà không việc tay nào nhắc | A1 + David |
| G-2 | 🔴 **`docs/RUN-A-VALIDATOR.md` KHÔNG TỒN TẠI** (đo `ls docs/`) — mà nó là **điều kiện qua số 5** của `01/09` | **A1, chưa làm** |
| G-3 | công bố `genesis.json` + bootstrap của g1 **qua repo GitHub**, không qua `web/` | A1 + David |
| G-4 | việc tay cũ dừng ở chữ *"sinh"* token mới — chưa ai nói **đưa lên server**; faucet dính gotcha 3 | David |
| G-5 | `main:web/lib/chain.ts` còn `networkId: 9001` (**lệch 2 thế hệ**) · blockchainID C/X chết theo re-genesis | worktree khác |
| G-6 | `heartbeat-*` **không có nguồn trong repo** (grep toàn repo chỉ trúng bản ghi về chính nó) | **David** |
| G-7 | 🟡 `check-chainid.mjs:54` chép cứng gốc dải — **hôm nay KHÔNG sai** (quét cả không gian, phủ trọn khối g1). **Đừng sửa trước ngày G** | sau |

🔴 **DIỄN TẬP: CÓ, và đề xuất `31/08` (không phải 30/08).** Năm thứ **chưa từng chạy** đang được
xếp vào đúng ngày G, **sau `down -v`**: `A1Gen 1` ở bất cứ đâu · netgen `N=10` (xung đột cổng
`9660` mới chỉ **đọc ra từ mã**, chưa ai thấy xảy ra) · `ipv4port` + `STAKING_PORT_BASE=9700` ·
node10 vào **từ genesis** (D-119 chứng minh đường **stake sau**, cơ chế khác hẳn) · khắc chữ
**BẬT** trong một lượt sinh mạng đầy đủ.

✅ **Và nó rẻ hơn tưởng:** `network_ids.go` đã có **băng mạng TẬP theo thế hệ** —
`A1IDGocTap 899_999_999` ⇒ gen 1 = `899999998`, tên `9chain-a1-tap-g1`. Hai băng **không bao
giờ bắt tay được**, và `netgen/identity.go` chặn **FATAL** nếu tên không suy đúng từ `A1Gen`.
⇒ Tập ở `A1Gen 1` **không** là canh bạc *"bản tập thành bản thật"*. Hơn nữa **binary không phụ
thuộc byte chữ khắc** ⇒ **image lượt tập chính là image ngày G dùng lại**.
⚠️ Giá phải trả: bump `A1Gen` ⇒ repo mô tả g1 trong khi mạng sống là g0 ⇒ vài cổng đỏ tới ngày G.
**Đỏ nhiều ngày là cách nhanh nhất dạy người ta lướt qua danh sách** ⇒ tập sát ngày, khai trước
đỏ nào là đỏ dự kiến.

⚠️ **Bump thế hệ là BA dòng bên Go** (`A1Gen`, `A1Name`, `A1NameTap`) + **một** dòng JS
(`A1_GEN`). Việc tay ghi *"cả hai ngôn ngữ"* — đúng nhưng chưa đủ chi tiết. Quên vế Go thì
netgen chặn FATAL; **quên vế JS thì không gì báo lỗi** (D-093).

**Nếu chỉ tập được một nửa:** ưu tiên **`N=10` + `STAKING_PORT_BASE=9700` + node10 từ genesis** —
phần duy nhất hỏng thì hỏng **giữa ngày G, sau khi mạng cũ đã bị xoá**, và đường lui của nó
(D-119) tốn **25.000 LOVE9** + đưa B-12 về 14 ngày.

**Số đo cuối phiên:** preflight đầy đủ **15 đạt · 3 đỏ · 17 việc tay** (đo `13:20Z`, trước khi
sửa) ⇒ sau khi sửa: `--no-network` **14 đạt · 0 đỏ · 4 bỏ qua · 22 việc tay** ·
`check-single-source` ✓ · `check-english-code` ✓ (nợ **5.754**, không phình).
⚠️ **Chưa chạy lại lượt đầy đủ có mạng** — ba cổng đỏ không nằm trong thứ đã sửa.
⚠️ **Chưa commit · chưa ghi `DECISIONS.md`/`PROGRESS.md`** — chưa quyết định nào được chốt và
chưa mục nào đánh `[x]`; ngày diễn tập đang chờ David.

### 🆕 Phiên `2026-08-29` — TL;DR

**David chốt: mở testnet công khai ĐÚNG `2026-09-01`.** Trong ngày đã khép trọn vòng người ngoài
phải đi — `git clone` GitHub công khai → `git am` 25 patch (ra đúng tree `f2b9486b`) → build →
join → **stake → validate**. Node thứ 10 chạy ở **Hetzner 🇩🇪 `95.217.60.140`**, khác nhà cung cấp
với server A1 (OVH 🇫🇷) ⇒ **O4 đạt**. Kế hoạch: [`docs/TESTNET1-PUBLIC-2026-09-01.md`](docs/TESTNET1-PUBLIC-2026-09-01.md).

**Bốn quyết định của David:** ngày mở `01/09` · O4 = máy Hetzner đó · mã nguồn lên **GitHub tài
khoản cá nhân** · dịch **đường người ngoài đọc** trước, nợ còn lại trả dần.
**Chốt cuối phiên:** node10 vào **THẲNG GENESIS** ngày G, **không** stake sau
([`docs/GDAY-NODE10-HETZNER.md`](docs/GDAY-NODE10-HETZNER.md), D-122).

**Số đo cuối phiên:** preflight **15 đạt · 3 đỏ · 17 việc tay** · mạng g0 **10 validator**,
mọi node 9 peer · drift **19 khớp · 0 lệch · 0 thiếu** · `check-key-leaks` **exit 0 lần đầu** ·
nợ tiếng Anh **5.856 → 5.754**.

**Ba đỏ còn lại, tất cả ĐỎ ĐÚNG LÝ DO** — đừng vá cho xanh:
`watch-network` (validator **10** mong 9 · B-12 **14 ngày** — hệ quả lượt stake) ·
`drift` (3 mồ côi `heartbeat-*` **không thuộc repo**, chưa rõ nguồn) · `net*` (**B-19**).

### 🔴 Việc của David — theo thứ tự gấp

| # | việc | vì sao gấp |
|---|---|---|
| 1 | **PR đăng ký chainId** — [`docs/chainid-registry/`](docs/chainid-registry/README-PR.md), soạn sẵn, mọi trường đã ĐO | duyệt mất **vài ngày**; gửi 01/09 là không kịp |
| 2 | ✅ ~~**Tạo GitHub repo rỗng**~~ **XONG `31/08`** — `daviddokrao/9chain-a1`, **RIÊNG TƯ**, chỉ `main` (299 commit). Nghiệm thu **từ phía GitHub**: `visibility PRIVATE` · đúng **một** nhánh · `patches/` **26 tệp** · `upstream/` **404 đúng thiết kế**. Clone ngược về: 26 patch **trùng byte** bản cục bộ, **0 khoá** trong cây. 🔴 Còn lại: **đổi sang CÔNG KHAI** mới mở khoá điều kiện qua **4 + 5** | **David** |
| 3 | **B-16** bản sao khoá thứ hai · **B-19** khoá trong thư mục chết | chặn GO/NO-GO |
| 4 | 3 tệp `heartbeat-*` mồ côi trên server — của ai? | drift đỏ vì chúng; và sau `down -v` là **mất manh mối** |
| 5 | **Chốt có diễn tập `31/08` không** (A1 đề xuất: CÓ) | 5 thứ chưa từng chạy đang xếp vào sau `down -v` — xem phiên chiều `29/08` |

### 🆕 Phiên `2026-08-28` (chuẩn hoá) — SÁU dòng phải đọc trước khi gõ bất cứ lệnh nào

1. 🔴 **LUẬT MỚI, David chốt: mã nguồn CHỈ CÓ TIẾNG ANH** (`CLAUDE.md` **§0**, trên cả 4 luật
   cứng) — tên tệp · tên hàm · biến · khoá JSON · cờ · **chú thích** · log · tiêu đề commit.
   Ngoại lệ: `web/lib/i18n/vi.ts` · `docs/**` + `*.md` gốc · `docs/evidence/**` + `patches/**`.
   Thi hành bằng **bánh cóc**: `node scripts/check-english-code.mjs` — mã MỚI phải sạch ngay,
   nợ cũ chỉ được **CO LẠI**. Nợ hiện tại **107 tệp · 5.856 dòng** + 54 tệp Go trong fork.
2. **Mọi tên tệp / cờ / khoá JSON đã đổi sang tiếng Anh — KHÔNG có bí danh.** Lệnh cũ trong
   đầu anh **sẽ không chạy**: `ngay-g-preflight`→`gday-preflight` · `canh-mang`→`watch-network` ·
   `o1-kiem`→`o1-check` · `kiem-khoa-tren-chain`→`check-keys-on-chain` ·
   `vi-qua-ham`→`wallet-over-tunnel` · `--tu-kiem`→`--self-test` · `--kiem`→`--check`.
3. **Cây fork: 25 patch · tree `f2b9486b`** (không còn 24/`074aaa93`). Đối chứng **24/25 →
   `074aaa93`** nay **chạy tự động** trong preflight, không còn là nghi thức chép tay.
4. 🔴 **B-19 — dính thẳng vào B-16 đang chặn GO/NO-GO.** `local-net/net-that-g0/` là **MỒI NHỬ**:
   networkID **khớp** mạng sống nhưng **6 ví đều 0đ** (`allocation.md` của nó khai *"1 node"*,
   mạng thật 9). **Đừng cất nó làm bản sao lưu quỹ** — bộ thật ở `C:\Users\abc\9chain-a1-keys\g0\`.
   Chiều ngược lại: khoá giữ **~90 LOVE9 thật** nằm trong **hai** thư mục tự khai là *đồ chết*
   ⇒ dọn theo thư mục là **mất tiền**. `node scripts/check-net-dirs.mjs`.
5. 🔴 **B-18 — 3 tên tệp CŨ còn trên server** sau lượt đổi tên ⇒ dọn **cùng lượt deploy console**.
6. **`up-all.sh` / mọi compose nay ĐÒI `NETWORK_ID`** và suy nó **từ genesis sắp mount**. Bộ
   `local-net/net/` hiện tại là **9001 đã chết** ⇒ nó sẽ kêu, và đó là **đúng**.

⚠️ **Ba lỗi của phiên này, đã sửa hết, ghi lại vì bài học còn giá trị** (D-108, D-113):
một lượt quét-và-thay sửa nhầm `patches/0006` (**cổng bắt được**) · sửa nhầm nội dung **gói vật
chứng** làm nó tụt 9/9→7/9 (**KHÔNG cổng nào bắt** — nay có `check-evidence.mjs`) · và tôi khai
sai số dư ví factory **lệch 1000 lần** vì đọc `90,008` kiểu `vi-VN` thành *chín mươi nghìn*
(thật: **~90 LOVE9**). Cách in số đã sửa để không lặp lại.

**Trạng thái `2026-08-28` cuối phiên:**

| | |
|---|---|
| preflight | **16 đạt · 2 đỏ · 0 không chạy được · 15 việc tay** — hai cái đỏ ĐÚNG, xem dưới |
| mạng g0 | sống · `999999999` · **9 validator** · B-12 còn **308 ngày** (`2027-07-02`) · factory **~90 LOVE9** |
| cây fork | **25 patch → tree `f2b9486b`** ✓ · đối chứng 24/25 → `074aaa93` ✓ |
| vật chứng | 3 gói · **20/20 dòng hash khớp** |
| nợ ngôn ngữ | **5.856 dòng / 107 tệp** (đã trả 945 dòng trong phiên) |
| sao lưu H-6b | 🔴 **ĐỎ — `20260828-043739` có 24 patch, repo nay 25, 68 tệp mã đã đổi** ⇒ chạy lại |

🔴 **Hai cái ĐỎ của preflight, cả hai là VIỆC CỦA DAVID:**
- `repo ↔ server drift` — **3 thiếu · 5 lệch** (tên mới sau đổi tên + sửa nội dung console).
  Hết đỏ khi console được deploy. **Deploy là việc có người bấm.** ⇒ **B-18**
- `net* directories` — 1 mồi nhử + 2 tệp giữ tiền trong thư mục chết. ⇒ **B-19**

### 🔴 Còn chặn GO/NO-GO `2026-08-29` — đúng MỘT việc, và nó chặn ở PHẦN CỨNG

```bash
node scripts/o1-check.mjs <thư-mục-bản-sao>    # B-16 · exit 0 ĐẠT · 1 SAI · 2 CHƯA KẾT LUẬN
```

🔴 **CỔNG NÀY ĐÃ CHẾT SUỐT NGÀY `28/08`, VÀ NÓ ĐỎ NGƯỢC** (D-116). Lượt đổi tên
`kiem-khoa`→`check-keys` không được nối vào `o1-check.mjs` ⇒ `go run` gói không tồn tại ⇒
exit 1 ⇒ cổng in **`🔴 SAI — đừng cất nó làm bản O1`** cho bộ khoá **chính, hoàn toàn đúng**.
Cùng lỗi nằm luôn trên **đường ký ví tiền thật** (`wallet-tunnel/enter.sh`), khai thành *"khoá
không suy ra địa chỉ"*. **Cả hai đã vá + 7/7 đối chứng ngược.** Bài học: một **công cụ hỏng**
không được phép thành một **phán quyết về khoá** — nay công cụ phải **tự khai đã chạy**.

🔴 **VÀ MỘT BẢN SAO KHOÁ QUỸ ĐÃ NẰM TRẦN TRONG `%TEMP%` SUỐT 20 GIỜ** (D-117). Tìm ra khi quét
*"đã có bản thứ hai nào chưa"*: `…\Temp\claude\…\scratchpad\kk\` giữ **bản trùng byte** của bộ
g0, cộng hai bản *"làm hỏng"* dựng làm ca đối chứng — mà **bản làm hỏng vẫn chứa đủ khoá riêng
thật**. Ba cổng cùng mù vì ba lý do khác nhau. ✅ Đã `shred -u -n 3` theo kỷ luật D-107, và có
cổng canh mới: **`node scripts/check-key-leaks.mjs`** (6/6 đối chứng, nay **exit 0**).
⚠️ Bản nháp đầu của cổng đó đỏ **32 tệp** gồm hai `PROGRESS.md` trong git — nó đo *sự có mặt của
một CHỮ*, không phải *của một KHOÁ*. Đã sửa: đo `PrivateKey-` + **40+ base58**, rồi **so với bộ
quỹ sống** để tách 🔴 tiền thật khỏi 🟡 khoá mạng tập.
⚠️ **Rồi nó sai thêm hai lần nữa, và một lượt quét ĐỘC LẬP mới bắt được** (D-117b): phạm vi dừng
ở repo nên **mù với `9Chain-backups\`**, và mốc so chỉ có 6 quỹ nên **`chain-factory-key.txt` —
ví thứ BẢY giữ ~90 LOVE9 thật — bị chấm 🟡**. Mốc so nay nhiều nguồn, self-test **8/8**.
🔴 **Và phát hiện lớn hơn cả hai lỗi: KHOÁ FACTORY ĐƯỢC TÁI DÙNG XUYÊN THẾ HỆ** — bản trong gói
lưu của mạng `9001` **đã chết** trùng byte với khoá giữ tiền trên `g0` **hôm nay**. Cùng hình
dạng gotcha 15. ⇒ **Ngày G sinh mạng mới thì sinh luôn khoá factory mới**, cùng lượt với token.

🔴 **B-20 MỚI — KHÔNG BẢN LƯU NÀO CHỨA DANH TÍNH VALIDATOR CỦA MẠNG ĐANG CHẠY** (D-117c). Lộ ra
khi đo gói `20260825` trước lúc xoá: hai gói lưu mới nhất có **0 tệp** danh tính/khoá/archive —
chúng là bản lưu **mã nguồn**, không phải bản lưu **mạng**. H-6b lâu nay đo bằng **số patch**;
số patch đúng mà **nội dung trống** thì bản lưu vẫn vô dụng.

**B-16 — bản sao thứ hai của khoá quỹ.** Đo `28/08`: máy dev có **đúng một ổ đĩa**
(`C:`, 1.862 GB) — không USB, không ổ ngoài. *"Hai nơi khác nhau về vật lý"* **không tạo ra
được từ phần mềm**; `C:\PROJECTS\9Chain-backups\` cũng trên `C:` nên **không tính**.
✅ **Phương tiện David chốt `28/08`: MÁY TÍNH THỨ HAI.** Quy trình đầy đủ (đường chuyển được
phép / bị cấm · ba mức nghiệm thu · đường lui khi máy đích không có Docker):
[`docs/O1-SECOND-COPY-RUNBOOK.md`](docs/O1-SECOND-COPY-RUNBOOK.md).
⇒ Còn lại: David chỉ **máy đích + thư mục**, rồi chạy nghiệm thu mức 1 + mức 2.
Bản gốc đo lại cuối ngày **còn nguyên vẹn**, và `o1-check` trên nó ⇒ **exit 0**.

Phần A1 làm được đã xong: `o1-check.mjs` trên bộ **chính** ⇒ **exit 0** — bộ ở
`C:\Users\abc\9chain-a1-keys\g0\` **đúng là bộ của mạng đang chạy**, 6/6 quỹ giữ tiền thật.
Dấu vân tay để đối chiếu bản sao: `keys.txt` **3.531 B** `e350727a…` · `allocation.md`
**2.221 B** `654fb72e…` · `genesis.json` **7.753 B** `e1024eab…`.
⏳ Bộ khoá này **bị vứt bỏ `2026-09-01`** ⇒ đây là cửa sổ diễn tập **rủi ro bằng không**.

**Việc khác của David** (không chặn GO/NO-GO): O4 nhà cung cấp thứ hai (tiền) · ký SIWE cho
phép kiểm đẻ chain đầu-cuối · gộp `web-home` → `main` · **byte chữ khắc** (D-104).

⚠️ **Đừng cày tiếp trong phiên cũ.** Mọi thứ cần biết: `CLAUDE.md` (luật) · `PROGRESS.md`
(trạng thái) · `DECISIONS.md` **D-093→D-115** (vì sao).

---

## TL;DR

Mạng công khai đang chạy **thế hệ `g0`** — `networkID 999999999`, `9chain-a1-g0`,
`supplyCap 7.900.000.001`, 9/9 node. Sinh lại `2026-08-27` (D-081). Đo lại `28/08` chiều: sống.

### 🔴 ĐỢT 15 (`28/08` tối) — 8/8 mốc đạt (`A15-0`…`A15-7`) · 9 quyết định · 2 việc mới cho David

**Ngày G nay có MỘT lệnh:**

```bash
node scripts/gday-preflight.mjs      # 12 cổng + 12 VIỆC TAY in thành ô trống
```

| công cụ mới | làm gì | đối chứng |
|---|---|---|
| `gday-preflight.mjs` | runbook ngày G chạy được (D-101) | 12/12 xanh · `A1_GEN=1` ⇒ đỏ |
| `o1-check.mjs` | **O1 một lệnh** — gộp cả hai phép đo khoá (D-097) | 6/6, gồm bộ khoá **đã chết ⇒ exit 1** |
| `watch-network.mjs` | 9 mục · **B-12 còn 308 ngày** · số dư factory (D-100) | 13/13 · RPC chết ⇒ **2**, không phải 0 |
| `close-ledger-before-regenesis.mjs` | O3b: kéo sổ sống → dồn `chains`→`retired` (D-099) | 9/9 · không mất bản ghi ở n=43 |
| `check-clock-skew.mjs` | B-13(b): chọn `--offset-ms` (D-102) | 7/7 · đo thật **557ms ±811** ⇒ giữ `3000` |
| `generation-test.mjs` | cổng THẾ HỆ của console (D-093) | 13/13 · gỡ cổng ⇒ 7 hỏng |

**Cổng cũ được vá:** `check-consistency` nay nối `A1Gen` (Go) ↔ `A1_GEN` (JS) — **hai hằng số
chép tay ở hai ngôn ngữ, trước đó không cổng nào nối** · `check-deploy-drift` nay thấy **tệp
mồ côi** (hướng ngược) · `console-deploy.sh` chép 15 **và đối chiếu 15** (trước: chép 15 đối
chiếu 9).

🔴 **Ba phát hiện đắt nhất của đợt:**
1. **`console-deploy.sh` hỏng từ CHÍNH commit vá nó** (`a16c81c` = D-088) — một ký tự xuống
   dòng trong chuỗi JS ⇒ bản vá đóng gốc rễ B-14 **chưa từng chạy trót lọt lần nào**;
   `chainid.mjs` lên server bằng đường **chép tay**. ⇒ *Luật cứng #2 cần vế thứ hai: **một cổng
   chưa ai thấy nó CHẠY XANH THẬT thì cũng chưa phải cổng.***
2. **Hai bản `.bak` của console trên server đo được 0 lần `A1_DE_CHAIN_MO`** (một bản còn 0 lần
   `siwe`) ⇒ khôi phục là **mở lại đẻ chain** mà D-087 đóng, và gỡ xác thực ví của M4.1. ⇒ **B-17**.
3. **Bán kính ảnh hưởng của `A1Gen`:** đổi **một** hằng số làm **bốn** cổng đỏ. Bump ngày G
   **không phải "sửa hai dòng rồi đi tiếp"**.

✅ **Console ĐÃ DEPLOY `28/08`** (David yêu cầu): drift **19 khớp · 0 lệch · 0 thiếu**; console
sống tự khai `thế hệ : ✅ khớp node đang chạy — g0 · networkID 999999999`.

⚠️ **Tên miền sống là `a1.9chain.org`** — `testnet-a1.9chain.org` là tên **cũ**, Cloudflare trả
**525** cho nó. Đo bằng tên cũ ra "trang chết" trong khi trang vẫn sống (D-096).

---

### 🔴 Bốn điều của phiên chiều `28/08` — đọc trước khi làm gì đụng khoá

1. **`kiem-khoa` chấm `6/6 ✓ exit 0` cho một bộ khoá ĐÃ CHẾT** (D-090). Nó so `keys.txt` với
   `allocation.md` — hai tệp **cùng thư mục, chép cùng lượt**. ⇒ luôn chạy kèm
   `scripts/check-keys-on-chain.mjs`.
2. **Dòng `P-addr` trong `keys.txt` là CHỮ NGƯỜI VIẾT, không phải phép đo** (D-091b). Khối
   `[team]` dán địa chỉ `[foundation]` thì dòng in ra vẫn trông đúng và ví vẫn ký.
3. ✅ **M11.10 XONG và ĐÃ KÝ THẬT** (D-091): ví chạy ở máy dev, hầm SSH **trong cùng container**,
   khoá không chạm server. `9chain-a1-xpwallet` trên server **đã xoá hẳn** (D-092).
4. 🔴 **O1 vẫn CHƯA ĐẠT** — còn đúng một việc, và chỉ David làm được: **bản sao thứ hai**.
   Xem [`docs/O1-CUSTODY-VERIFICATION.md`](docs/O1-CUSTODY-VERIFICATION.md) · **B-16**.

🔴 **PHÁT HIỆN ĐẮT NHẤT `28/08`: mã trên server lạc hậu 2 ngày, mà mọi cổng vẫn xanh.**
Console công khai đứng ở commit `69c80ce` (26/08) ⇒ **B-14 ghi "ĐÃ ĐÓNG" trong repo nhưng
console vẫn cấp chainId từ `9100`** (trùng Genesis Coin); faucet thiếu `/api/supply` của I1b;
`export-chain.mjs` — công cụ **O2 gọi ở ngày G** — không có trên server. Gốc rễ: `console-deploy.sh`
liệt kê tệp thẳng trong script, nên việc tách `lib/chainid.mjs` ra *cho dễ kiểm* đã khiến nó
**không được deploy**. Đã vá + có cổng canh: **`node scripts/check-deploy-drift.mjs`** (D-087/D-088).
⇒ **Chạy cổng đó TRƯỚC khi tin bất kỳ dòng "ĐÃ ĐÓNG" nào.**

✅ Ví `chain-factory`: **89,99999173 LOVE9 unlocked** trên P (D-082). 🔴 **Chưa chứng minh đẻ
chain chạy được** — ví có tiền ≠ đường đẻ chain thông; và đẻ chain nay **TẠM ĐÓNG** tới sau
ngày G (D-087).

**Cây fork: tree `f2b9486b` · 25 patch trên `1cf1fc3`** (đổi `28/08`: patch 0025 đổi tên
công cụ `kiem-khoa`→`check-keys`; áp 24/25 vẫn ra `074aaa93`).
🔴 **`stale-ok` — SỐ CỦA `28/08`, GIỮ ĐỂ ĐỐI CHIẾU.** Hôm nay là **26 patch / `60a61707`**, đối
chứng **25/26 → `f2b9486b`** (bump `A1Gen` nằm trong patch 0018, D-123). Đoạn dưới đây kể chuyện
`28/08`; đừng đọc nó thành trạng thái hiện tại. Số hiện tại ở mục phiên đầu tệp và ở `CLAUDE.md`.
⚠️ **Image `9chain-a1/node:g0` đang chạy vẫn là bản 18 patch.** Patch 0019–0024 chỉ đụng **công
cụ** (SDK ví, netgen, `kiem-khoa`), không đụng node — chúng vào image ở lượt build ngày G.
Đừng đọc `074aaa93` thành "mạng đang chạy có 24 patch".

✅ **Lượt build 24 patch ĐÃ ĐƯỢC DIỄN TẬP `28/08` và ĐẠT** (D-105) — trước đó **chưa image nào
từng dựng từ cây 24 patch**, và lượt đầu tiên bị xếp vào đúng ngày G, sau `down -v`. Đo trên
node chạy bằng image mới: `supplyCap 7900000001000000000` · `eth_chainId 0x218711a09`
(= 9000000009) · **alias `LOVE9` ra tài sản**, **`AVAX` ĐỎ có lý do**.
🔴 **Hai lỗi công cụ lộ ra trong lượt tập, cả hai đều im lặng:**
1. `gen-network.sh` **không chuyển tiếp `NETWORK_ID`** ⇒ đường sinh mạng trong tài liệu chết ở
   mọi lượt gọi kể từ patch 0020. **Đã vá** (mảng `A1_NETGEN_ENV`, 17 biến).
2. netgen ghi **`image: 9chain-a1/node:dev` cắm cứng** vào compose, không biến nào đổi được.
   Build image mới rồi `up -d` mà quên sửa dòng đó ⇒ mạng lên bằng binary **18 patch**, 9/9
   node xanh, mọi cổng xanh. **CHƯA vá** (sửa netgen = đụng `patches/`) ⇒ thành **việc tay** ở
   preflight. `grep image: <net>/docker-compose.multinode.yml` trước khi `up`.
⚠️ Diễn tập dựng ở `A1Gen 0` ⇒ **không thay được lượt build ngày G** (bump lên 1 là đổi binary).
⚠️ Còn `local-net/net-dryrun/` trên máy dev — bộ khoá **vứt đi** của mạng tập `899999999`.
Gitignore rồi, nhưng **xoá tay đi**: đừng để nó nằm cạnh thư mục thật (gotcha 13).

⚠️ **Ngày G `2026-09-01` VẪN phải sinh lại lần nữa** (chữ khắc vào genesis) ⇒ **thế hệ 1**:
`A1Gen 1` · `networkID 999999998` · `9chain-a1-g1` · khối chainId L1 `9001000000–9001999999`.
David chốt `28/08`: **bỏ C1 khỏi tầm ngắm**, chỉ tập trung A1.

---

## ▶ Việc tiếp — theo thứ tự

### 🔴 NGÀY G `2026-09-01` — lịch bấm (giờ UTC · giờ VN)

| Xong việc gì | UTC | VN | Ai |
|---|---|---|---|
| **KHỐI 0** — image trên server, tự khai đúng `commit=` | `06:09Z` | **13:09** | ✅ **XONG SỚM `31/08`** |
| **KHỐI 1** — B-16 · B-19 · O2 · sổ chain · H-6b | `07:09Z` | 14:09 | O2/sổ/H-6b ✅ xong · **B-16, B-19 = David** |
| 🟥 **`down -v` — điểm không quay lại** | `07:39Z` | **14:39** | **David** |
| Mạng lên 9/9, **đo BINARY** | `08:29Z` | 15:29 | David |
| `engrave-verify` **kèm `--rpc`** trên chain thật | `08:59Z` | 15:59 | David |
| Công bố + **mở lại cổng đẻ chain bằng TAY** | **`10:09Z`** | **17:09** | David |

🔴 **GO/NO-GO:** tới `06:09Z` mà image chưa tự khai đúng `commit=` ⇒ **đừng bấm `down -v`**.
Hoãn rẻ; `down -v` thiếu binary đúng là **mất g0 mà không dựng được g1**. Cổng đẻ chain **đang
ĐÓNG** nên hoãn **không tốn gì cho người dùng**.

### 🔴 Hai việc của David, làm SAU KHI g1 xanh — không phải trước

| | |
|---|---|
| **B-16** — bản sao thứ hai bộ khoá quỹ, `o1-check.mjs` exit 0 | 🔴 Bộ đáng làm là **g1**, mà nó **chưa tồn tại** (netgen sinh ở giờ G). Làm trên g0 hôm nay là bảo vệ thứ ngày mai vô giá trị |
| **B-19** — dời `chain-factory-key.txt` (**90,007 LOVE9**) khỏi thư mục thế hệ chết | Số tiền đó **chết cùng g0**; giá trị còn lại là **giữ bản ghi** |

🔴 **Điều kiện phải giữ: ĐỪNG SHRED GÌ CỦA g0 CHO TỚI KHI g1 XANH.** Hỏng lượt sinh lại phải hoãn
thì g0 là thứ duy nhất còn lại, và lúc đó tiền + khoá g0 **lại có giá trị trở lại**.

### 🟡 Ba quyết định đang chờ David (không chặn ngày G)

1. **`HEARTBEAT_STOP_AFTER=2026-09-01T00:00:00Z`** — bơm tự dừng **sớm hơn giờ G 10h09m** ⇒ mạng
   công khai **im lặng hơn 10 tiếng** ngay trước lượt sinh lại. Để nguyên, hay dời cho khớp?
   (`docker rm -f` + `run`, vì `restart` **không** nạp env.)
2. **`main:web/lib/chain.ts` khai `networkId: 9001`** — hai thế hệ chết. `main` không phải bản đang
   chạy (bản sống ở `web-home`), nhưng repo công khai sẽ **xuất bản** nó. Luật cứng #4 cấm phiên
   này sửa ⇒ merge `web-home`, hay gỡ `web/` khỏi bản công bố?
3. **Công khai repo = công bố cả sổ nội bộ** (`DECISIONS` · `HANDOFF` · `BLOCKERS` · `docs/AUDIT-A1/`).
   Quét khoá **sạch** (`PrivateKey-` = 0) ⇒ đây là **lựa chọn**, không phải sự cố.


| # | Việc | Ai | Ghi chú |
|---|---|---|---|
| **1** | ✅ ~~Nạp `chain-factory`~~ **XONG `27/08`** — 89,99999173 LOVE9 trên P. 🔴 **Còn nợ phép kiểm:** đẻ **một** L1 rồi thu hồi để chứng minh đường đẻ chain thông (cần David ký SIWE, và nó tạo chain THẬT trên mạng công khai) | A1 + **David** | D-082. Khoá Foundation lấy từ `net/keys.txt` **trên server** — không phải "khoá máy dev" như dự tính, xem O1 |
| **2** | 🟡 **O1 custody** — ✅ **NAY CHỈ MỘT LỆNH: `node scripts/o1-check.mjs <thư-mục>`** (D-097; exit 0 ĐẠT · 1 SAI · 2 CHƯA KẾT LUẬN). — bước 1 XONG `27/08` (D-085). 🔴 **`28/08` phát hiện `kiem-khoa` chấm `6/6 ✓ exit 0` cho bộ khoá THẾ HỆ ĐÃ CHẾT** ⇒ thêm cổng thứ hai nối vào chain (D-090). Nay **6/6 quỹ đã chứng minh giữ tiền thật trên g0**. ⇒ Còn lại đúng một việc của David: **bản thứ hai** — quy trình 15 phút ở [`docs/O1-CUSTODY-VERIFICATION.md`](docs/O1-CUSTODY-VERIFICATION.md) | **David** | 🔴 Khoá g0 vẫn ở **đúng một ổ đĩa**. 🔴 **Phải chạy CẢ HAI lệnh** — `kiem-khoa` một mình không phân biệt được bản sống với bản chết |
| **2b** | ✅ ~~B-15 bí danh tài sản~~ **CHỐT `27/08` — `LOVE9`, DỨT KHOÁT** (D-084). 🔴 Giá đã biết trước và chấp nhận: **công cụ dựng trên SDK avalanchego gốc KHÔNG nói chuyện được với A1**. Patch 0022 bắt nó hỏng ra tiếng | — | D-084 |
| **3** | ✅ ~~netgen sinh `.env`~~ **XONG `27/08`** — patch 0020, kèm **cổng chặn mạng THẬT sinh ra ở tư thế phơi trần** và `NETWORK_ID` nay bắt buộc | A1 | D-083. Đo đầu-cuối bằng `docker compose config`: có `.env` → `localhost,127.0.0.1`, giấu đi → `*` |
| **4** | ✅ ~~**B-9** `#e84142`~~ **XONG `27/08`** — patch 0021, vàng 9Chain trên navy | A1 | 🔴 Còn một chỗ NGOÀI phạm vi B-9: `local-net/console/index.html` **trên server** vẫn có 3 lần `#e84142` và lệch 12 byte so với git — thuộc worktree web, phiên này không đụng |
| **5** | **O4** — dời 1 node sang nhà cung cấp thứ hai, **hoặc** khai thật + đổi tên `01/09` | **David** | §12.3: cách rẻ nhất không phải tiền mà là chữ *"chính thức"* |
| **6** | ✅ ~~**B-10** robots.txt bị Cloudflare che~~ **CHẨN ĐOÁN SAI TỪ ĐẦU — ĐÓNG `28/08`** (D-106b). Cloudflare **CHÈN THÊM**, không **THAY**; tệp A1 luôn tới được người đọc. Cổng `node scripts/check-robots.mjs` ⇒ **exit 0**, 7/7 đối chứng | — | 🟡 Còn lại là **quyết định chính sách**: khối Cloudflare cấm hẳn 9 bot AI + khai điều khoản **nhân danh A1**. Muốn tắt: Overview → Control AI Crawlers → bỏ *Display Content Signals Policy* |
| **6b** | 🔴 **B-17 (MỚI)** — xoá 6 tệp `.bak` trên server: đường lui trỏ vào quyết định ĐÃ ĐÓNG (mở lại đẻ chain + gỡ xác thực ví). Lệnh soạn sẵn trong `BLOCKERS.md` | **David** | D-098 · autopilot không ghi lên server |
| **7** | ✅ ~~H-7~~ **CHỐT + LÀM XONG** — IPv4 đa cổng (D-089, patch 0024). 🔴 Còn lại của **O4 là TIỀN**: đã chứng minh beacon tới được từ Internet và mesh cùng máy còn nguyên, **chưa** chứng minh node ở máy khác bắt tay được — việc đó cần máy thứ hai | **David** (O4) | D-089 |
| **8** | **Gộp `web-home` → `main`** | **David** | `DECISIONS.md` đang tồn tại ở hai bản — xem §12.1 |
| **9** | GO/NO-GO `2026-08-29` · Ngày G `2026-09-01` | — | `docs/GDAY-A1-REMAINING.md` §7 |
| **10** | ✅ ~~**M11.10**~~ **XONG `28/08`** (D-091) — ví ký từ máy dev qua hầm SSH **trong cùng container**; đã **ký thật** lên mạng công khai, khoá không chạm server. `node scripts/wallet-over-tunnel.mjs --check` | A1 | ✅ `--fund` cũng XONG (D-091b): 6/6 quỹ chọn đúng, `--check` kiểm được việc chọn quỹ **mà không khởi động ví**. ✅ `9chain-a1-xpwallet` trên server **ĐÃ XOÁ HẲN `28/08`** (D-092) — đừng dựng lại |

🔴 **Phép kiểm đẻ chain đầu-cuối cần HAI thứ của David:** ký SIWE, **và** biết rằng cổng nay
mặc định ĐÓNG — muốn chạy thì khởi động console với `A1_DE_CHAIN_MO=1` rồi tắt lại.

🔴 **Chữ khắc: cơ chế 100%, nội dung 0% — nhưng nội dung KHÔNG còn là việc A1 phải theo dõi.**
David chốt `28/08` (**D-104**): hai chuỗi chạy **song song**, C1 do **David điều phối riêng**.
⇒ A1 nhận **byte đã đóng băng** như một **đầu vào David cấp**, không chờ, không hỏi, không
xếp C1 vào bảng rủi ro của mình. Việc của A1 là: giữ cơ chế khắc chạy được, và **nói rõ hạn
chót mà đầu vào phải tới** để lượt sinh mạng ngày G không phải chờ.

---

## 🔴 GOTCHAS — thứ sẽ tốn giờ nếu không biết trước

### 🆕 Từ phiên ĐÊM `2026-08-31` (chín cái, đều lộ ra từ CHẠY THẬT)

**A. Một hằng số nghĩa là "thế hệ nào đó khác" LUÔN đi vào ô mạng sống ở lượt bump kế** (D-134).
Cùng literal `999999998`/`999999999` chép cứng ở **ba tệp cổng**. Nặng nhất: `wallet-over-tunnel.mjs`
— công cụ **ký bằng khoá quỹ** — mặc định là g0 **đã chết**, và ca đối chứng của nó đang **đòi mạng
SỐNG bị từ chối**. networkID sai **không** làm ví từ chối dựng giao dịch; nó làm **mạng từ chối chữ
ký**, đọc ra như lỗi hầm/lỗi node. ⇒ **Đừng chép — SUY RA** từ `A1_GEN`/`A1_ID_GOC`.

**B. `create-l1` cắm cứng khoá `ewoq` ⇒ CHẾT trên mọi mạng netgen** (D-140). Đo: `ewoq` xuất hiện
**0 lần** trong `allocation.md`/`genesis.json` của mạng netgen sinh. `local-net/create-l1.sh` gọi nó
⇒ **đường đó chỉ chạy trên mạng dev thế hệ `9001` cũ**. Đường dùng được: `9chain-a1-cli l1 create`
với `A1_CLI_KEY`.

**C. 🔴 Thanh khoản genesis nằm trên X-Chain, CLI trả phí trên P-Chain** (D-140). Không chuyển
trước thì **mọi lượt đẻ chain chết ở giao dịch đầu**, và lỗi nói về *"UTXO"* chứ không nói *"tiền
của anh ở chain khác"*:
```
LỖI CreateSubnetTx: insufficient funds: needed 2196 more nAVAX      # P=0, X=71.000.009
docker exec -d -e WALLET_KEY="$KEY" -e WALLET_URI=http://127.0.0.1:9650 -e PORT=8091 <node> /9chain-a1/build/xp-wallet
curl -X POST -H 'content-type: application/json' --data '{"amount":"1000"}' http://127.0.0.1:8091/api/x-to-p
# rồi ĐO TRÊN NODE (platform.getBalance), không tin ví, MỚI l1 create
```
⚠️ Ví phải chạy **TRONG container node** — header `Host` là `127.0.0.1`. Đi vòng ngoài là **403**,
và cái 403 đó là **cổng M11.10**, không phải thứ để nới.

**D. Một ví chạy SAI KHOÁ vẫn trả `200`** (D-140). Một tiến trình ví cũ giữ cổng, tiến trình mới
bind hỏng rồi **chết lặng**, `/api/info` vẫn trả lời — của ví cũ, số dư 0. **Dấu hiệu duy nhất là
địa chỉ in ra khác địa chỉ mình mong.** ⇒ **Đọc `xAddr` trước khi tin số dư.**

**E. `make-l1-genesis.mjs` CHỌN chứ không GIỮ CHỖ** (D-141) — nó tra hai sổ đúng luật nhưng
**không ghi lại**, nên hai L1 đẻ qua CLI cách nhau vài phút **cùng nhận `9001000000`**. Console an
toàn vì **chính nó** ghi vào `console-chains.json`. Đã vá bằng **cảnh báo lớn**; sửa tận gốc hoãn
sau ngày G. ⇒ Đẻ chain người dùng **qua console**, hoặc khai `--chain-id` tường minh.

**F. Container `9chain-a1-heartbeat` — hai điều** (D-138). (a) **Không thuộc compose nào** ⇒ mọi
cổng duyệt `docker compose` **mù với nó** (container thứ hai như thế, sau console). Dừng êm:
`touch ~/9chain-a1/src/9chain-a1-config/heartbeat.stop`. (b) 🔴 Nó mount **`/ → /hostfs`**, chạy
**root**, userns **OFF** ⇒ **đọc được `console.env`** (đã đo: 800 byte) tức token + khoá. Ngày G
dựng lại nó (seed g1) ⇒ **thu hẹp mount ngay lúc đó**.

**G. Danh tính validator LÀ khoá riêng, và `check-key-leaks.mjs` KHÔNG canh chúng** (D-142) —
**18 tệp `staker.key`/`signer.key` mỗi mạng**, ngoài tầm mọi cổng. B-20 nói bằng chữ; đây là số.

**H. Hai bẫy công cụ nhỏ mà tốn giờ.** `SUBNET_PREFIX` — netgen **tự nối `.0`**, đưa dư một octet
ra `172.30.0.0.0/16` và compose chết. Image node **không có `ps`/`pkill`** ⇒ không dừng được tiến
trình bên trong bằng cách thường, dùng cổng khác hoặc restart container.
⚠️ `docker exec -e` **khác** `docker run -e`: env của `exec` là **tạm thời cho tiến trình đó**,
**không** nằm trong `docker inspect` — đó là lý do nạp khoá qua `exec` an toàn hơn.

**I. 🔴 Cái bẫy "giao dịch đầu tiên" trong `CREATE-A-CHAIN.md` KHÔNG tái hiện** (D-141). Trên L1
mới toanh, block 0: `eth_estimateGas` = **56.070** vs thực dùng **55.270** ⇒ **ước lượng đúng, dư
1,4%**; cả 4 ca **thành công**, kể cả ca tài liệu nói sẽ hỏng. ⚠️ Một preset, hợp đồng rất nhỏ,
băng TẬP ⇒ **chưa đủ để xoá cảnh báo khỏi tài liệu công khai**. **Đo lại trên L1 THẬT đầu tiên sau
giờ G rồi David quyết.**


16. 🔴 **netgen ghi `image: 9chain-a1/node:dev` CẮM CỨNG vào compose nó sinh** — không biến
    môi trường nào đổi được (đã đối chiếu cả 18 biến `env()` của netgen). Ngày G build image
    mới rồi `up -d` mà quên sửa dòng đó ⇒ mạng lên bằng binary **18 patch**, **9/9 node xanh,
    mọi cổng xanh**, và bí danh `LOVE9` không có trong binary ⇒ mọi ví X/C chết câm. Chưa vá
    (sửa netgen = đụng `patches/`). ⇒ `grep image: <net>/docker-compose.multinode.yml` trước
    khi `up`, và sau đó **đo BINARY** (`docker exec … --version`), đừng đo mạng. (D-105)
17. 🔴 **"Đã có bản lưu rồi nên xoá được" là một PHÉP ĐO, không phải câu trấn an.** B-17 sai
    **hai lần trong một phiên**: một sổ danh bạ 20 KB và **hai tệp mã** không trùng bất kỳ
    phiên bản git nào — trong khi mục đó khẳng định xoá không mất gì. ⇒ Trước khi xoá bất cứ
    thứ gì trên server: đối chiếu `sha256` **từng tệp một**, không kiểm *"nhóm tệp"*.
    **Phạm vi của một lời trấn an hẹp hơn phạm vi của lệnh nó đi kèm.** (D-107 · D-107b)
18. 🔴 **ĐỎ GIẢ — vế thứ ba của luật cứng #2.** Thấy cổng đỏ **chưa đủ**; phải kiểm nó đỏ
    **VÌ ĐÚNG LÝ DO**. `check-robots` bản đầu đỏ ngay lần chạy đầu và cái đỏ đó bị đọc thành
    *"cổng nhạy"* — thật ra nó chấm bằng **dòng đầu** `robots.txt` trong khi tưởng đang chấm
    bằng **nội dung**. Cloudflare **chèn thêm**, không **thay** ⇒ B-10 chưa bao giờ là một lỗ.
    Kèm: **đọc HẾT tệp trước khi dựng cổng cho nó** — chính `web/public/robots.txt` đã viết
    sẵn phép đo đúng trong chú thích. (D-106b)

22. 🔴 **`${BIẾN}` trong chuỗi NHÁY KÉP của JS in ra nguyên văn — và cổng hằng số KHÔNG bắt được.**
    Sửa `gday-preflight.mjs` để thôi chép cứng IP, dùng `${SERVER_IP}` trong `"..."` ⇒ runbook in
    ra chữ `${SERVER_IP}`. `check-single-source` **xanh** vì chuỗi IP đã biến mất — nó tìm IP,
    không tìm nghĩa. Chỉ lộ vì **chạy thật và đọc dòng in ra**. Dùng nối chuỗi hoặc backtick,
    rồi **đọc output**. (D-122)
21. 🔴 **Grep HTML tải về của `/create-chain/` là phép đo MÙ.** Trang là Next.js xuất tĩnh và
    **form chỉ render sau khi kết nối ví**; không có MetaMask thì `querySelector("select")` là
    `null`. Grep ra 0 cho **cả** tiếng Việt lẫn tiếng Anh, đọc thành *"deploy không ăn"*. Phép đo
    đúng nằm **trên server**: `import` `presets.mjs` rồi in. (D-120)
20. 🔴 **Ngày G `N=10` đụng cổng `9660`.** netgen publish API **node2** ở `127.0.0.1:9660`; ở
    `ipv4port`, staking port node *N* = `A1_STAKING_PORT_BASE + N - 1` ⇒ node10 lấy đúng **9660**.
    Với `N=9` lỗi **không tồn tại** ⇒ nó xuất hiện lần đầu **đúng ngày thêm node thứ mười**.
    Dùng `A1_STAKING_PORT_BASE=9700`. (D-122)
19. 🔴 **`find -size -1M` KHỚP 0 TỆP — và không báo lỗi.** `find` làm tròn kích thước **LÊN**
    đơn vị, nên một tệp 495 B **không** *"nhỏ hơn 1M"*. Một lượt `find … -size -1M -exec shred`
    chạy trót lọt, **exit 0**, và xoá **0 tệp** — đúng hình dạng B-17: tưởng đã dọn mà chưa.
    Dùng đơn vị **byte**: `-size -1048576c`. Đã dính `28/08` lúc xoá gói lưu `20260825`.
    Kèm bài học rộng hơn của cùng lượt đó: dòng đối chứng cuối in *"remaining bundles:"* **rỗng**
    vì lỗi glob **của chính nó** — đọc theo mặt chữ là khai một sự cố không có thật.
    ⇒ **Một dòng đối chứng cũng phải được đối chứng** (D-117c).

1. **`net/` do container netgen sinh ⇒ thuộc `root`.** `sed` sửa `docker-compose.multinode.yml`
   **thất bại lặng lẽ** ⇒ mạng lên bằng image CŨ. `sudo chown -R ubuntu:ubuntu ~/9chain-a1/net`
   trước khi sửa.
2. ✅ ~~**netgen KHÔNG sinh `.env`**~~ — **ĐÃ VÁ `27/08`** (patch 0020, D-083). Nay netgen tự
   sinh, **và từ chối sinh mạng THẬT** với `A1_HTTP_ALLOWED_HOSTS=*` hoặc `A1_API_BIND=0.0.0.0`.
   ⚠️ **Vẫn phải chép `.env` khi chép mạng sang máy khác**, và **vẫn phải `--env-file` khi chạy
   compose từ thư mục khác** — cổng chỉ canh lúc SINH, không canh lúc CHẠY.
   ⚠️ `A1_CONFIG_DIR` netgen **không kiểm được** (nó giải trên máy chủ). Bố cục server hiện tại:
   `/home/ubuntu/9chain-a1/src/9chain-a1-config` — khai bằng biến cùng tên lúc chạy netgen.
2b. 🔴 **`NETWORK_ID` của netgen NAY BẮT BUỘC.** Trước đó mặc định `9001` — số của thế hệ đã
   chết. Lệnh cũ không khai `NETWORK_ID` sẽ dừng, và đó là chủ ý: chọn băng là một quyết định.
3. **`docker restart` KHÔNG nạp lại env.** Faucet giữ khoá thế hệ cũ ⇒ `insufficient funds`.
   Phải **`docker rm -f` rồi `docker run`** lại (lệnh đầy đủ trong D-081).
4. 🔴 **Cổng chỉ chứng minh được đường mà CHÍNH NÓ đi.** Cổng netgen xanh + `go test` xanh, mà
   node vẫn log `supplyCap 720 triệu` — vì `config/config.go` lắp cấu hình bằng đường khác. Thứ
   đi vào genesis phải nghiệm thu **trên node đang chạy**.
5. **`docker stop` VÀ `docker kill` đều KHÔNG kích hoạt `restart: unless-stopped`** (cả hai là
   "người dùng chủ động dừng"). Muốn thử chính sách thì để tiến trình **tự chết**.
6. **`git add -A` trong repo này nguy hiểm** — có phiên khác đang làm việc. Commit bằng đường
   dẫn tường minh. *(Đã nuốt nhầm việc của phiên `eb` một lần.)*
7. **Hai phiên đánh số quyết định độc lập ⇒ va chạm.** Bộ định danh được phiên `eb` gọi `D-072`
   nhưng trong repo nó là **`D-076`**. `DECISIONS.md` là nguồn sự thật.
8. **`SUBNET_PREFIX` của netgen PHẢI kết thúc bằng `.0`** — nhận `172.31.9` im lặng rồi sinh
   compose Docker từ chối.
9. **Heredoc bash + Python nuốt dấu gạch chéo** — sửa mã Go có `\n` trong chuỗi thì dùng công cụ
   sửa tệp, đừng `python <<'PY'` với `str.replace`.
10b. 🔴 **"ĐÃ ĐÓNG" trong `BLOCKERS.md` chỉ nói về REPO.** `28/08` phát hiện console công khai
    đứng ở `69c80ce` (26/08): **B-14 đóng trên giấy, hở ngoài đời suốt hai ngày**, và faucet
    thiếu `/api/supply` của I1b. Gốc rễ: `console-deploy.sh` liệt kê tệp **thẳng trong script**,
    nên việc tách `lib/chainid.mjs` ra *cho dễ kiểm* đã làm nó **không được deploy**. Nay danh
    sách nằm ở `manifest-deploy.json`, hai nơi đọc chung. **Chạy `check-deploy-drift.mjs` trước
    khi tin một mục đã đóng.**
10. 🔴 **`rebrand.sh` KHÔNG phủ hết lớp bản sắc — và chỗ nó bỏ sót là chỗ MÁY đọc.** Phạm vi nó
    đúng 4 chuỗi (`Client`, token `Name`, token `Symbol`, `FallbackHRP`). Bí danh tài sản X-Chain
    — thứ **mọi công cụ hỏi X-Chain phải gọi đúng** — nằm ngoài. Đổi nó ở `genesis.go` mà không
    đổi `wallet/chain/{x,c}` là giết mọi ví X/C **mà đường đẻ chain vẫn xanh** (nó đi P-Chain).
    Nay một hằng `constants.GetAssetAlias`, hai nơi đọc — xem D-082 trước khi đụng lại lớp này.
15. 🔴 **`A1_CONSOLE_TOKEN` ĐÃ ĐỔI `28/08`** (D-092c) — token cũ nay trả **401**. Giá trị mới ở
    `C:\Users\abc\9chain-a1-keys\console-token.txt` (ngoài repo, ngoài git). ⚠️ **`console-deploy.sh`,
    `bridge-test.mjs`, `auth-e2e-test.mjs` đọc token từ env** — nạp `console.env` hoặc lấy từ tệp
    đó, đừng dùng giá trị nhớ trong đầu. 🔴 Và bài học của lượt đó: token cũ **chưa từng được đổi
    qua HAI lượt re-genesis** — nó nằm trong cả `console.env.bak-720m` lẫn `bak-pre-g0`; **đưa
    vào việc ngày G**: sinh mạng mới thì sinh luôn token mới.
14. ✅ **`check-deploy-drift.mjs` NAY THẤY tệp thừa — lỗ này đã đóng cùng ngày (D-098/A15-3).**
    Đo lại `28/08` cuối phiên: cổng bắt **7 mồ côi**, tách **🔴 MỒ CÔI** (không có trong repo)
    khỏi **ℹ️ ngoài tầm canh**, và `null ≠ []` (không quét được là *không biết*, không phải
    *sạch*). ⚠️ Vẫn phải khai từng tệp mồ côi trong `manifest-deploy.json` — mục đã khai thì
    cổng chỉ nhắc, **không đỏ**; khai bừa là tự bịt mắt mình.
    <br>*(Nguyên văn lúc còn hở, giữ lại vì phép đo vẫn nguyên giá trị:)* nó canh 18 tệp trong
    phạm vi: *"tệp trong danh sách có khớp không"*. Một tệp bị **XOÁ khỏi repo** mà vẫn nằm
    trên server thì **không nhóm nào thấy**. Đo `28/08`: `src/9chain-a1-config/genesis.json` —
    **genesis LOCAL của Avalanche** (`networkID 9001`, 3 địa chỉ `X-local1…`, khoá **công khai
    trong repo avalanchego**) — repo đã xoá `27/08`, **server vẫn còn**. ⚠️ Mạng công khai boot
    bằng `net/genesis.json` do netgen sinh nên nó là **bẫy nằm im**, không phải lỗ đang chảy.
    ✅ **Cả hai đã `shred -u` `28/08`** (D-092b) — kèm `~/9chain-a1/vi-thu.json`, khoá riêng
    trần số dư 0. ~~**Lỗ trong CỔNG thì vẫn còn:** drift không thấy tệp thừa.~~ **⇒ ĐÃ ĐÓNG
    cùng ngày bởi D-098** — xem đầu mục.
    ✅ Kèm kết quả mạnh hơn: quét hash **toàn máy** đối chiếu **cả 6 khoá quỹ** ⇒ **server
    không còn khoá quỹ nào**. Còn đúng hai khoá, **đều có chủ ý**: `FAUCET_PK` và
    `console.env → A1_CLI_KEY` (= `chain-factory`). `A1_L1_ADMIN` là **địa chỉ** Foundation,
    không phải khoá.
13. 🔴 **`local-net/net-public/` là một thư mục TRỘN — nửa chết, nửa sống.** Đo `28/08`:
    `keys.txt` là bộ **thế hệ 9001 đã chết** (kiem-khoa khai `networkID 9001`, cả 6 quỹ đọc ra
    **0 trên chain**), nhưng `chain-factory-key.txt` **cùng thư mục** lại là khoá **g0 đang
    sống** — `P-love91vgh2wh…`, ví thật đang giữ tiền và vừa ký được giao dịch. Ngày giờ tệp
    cũng lệch (`18:39` vs `19:03`). ⇒ **Không có câu trả lời đúng cho "thư mục này còn dùng
    được không"** — phải hỏi từng tệp. Đây đúng là thứ khiến người ta cất nhầm bản sao lưu.
12. 🔴 **`kiem-khoa` KHÔNG phân biệt được bộ khoá còn sống với bộ khoá đã chết.** Nó so
    `keys.txt` với `allocation.md` — **hai tệp cùng một thư mục, chép cùng một lượt**. Bộ khoá
    thế hệ `9001` (tiền không tồn tại ở đâu cả) qua nó sạch **6/6 ✓, exit 0**. Nó *có* cảnh báo
    `networkID`, nhưng câu phán cuối vẫn xanh — mà đó là câu người ta đọc. **Luôn chạy kèm
    `scripts/check-keys-on-chain.mjs`** (D-090). ⚠️ Bộ `9001` đã chết vẫn nằm trên máy dev ở
    `local-net/net-public/` — đúng thứ dễ bị chép nhầm thành "bản sao lưu".
11. **Cổng C-4 có một ca chưa lường:** *"khắc chữ TẮT ⇒ bản tập"* sai với **mạng THẬT ở thế hệ
    trước lượt khắc chữ**. Nó chỉ cảnh báo, không chặn — nhưng đừng đọc cảnh báo đó thành lỗi.

---

## Lệnh hữu ích

```bash
# Đo bộ định danh mạng công khai
curl -s -X POST -H 'content-type: application/json' \
  --data '{"jsonrpc":"2.0","id":1,"method":"info.getNetworkName","params":{}}' \
  https://rpc-a1.9chain.org/ext/info

# supplyCap ĐANG CHẠY (đừng đọc mã — đọc node)
# 🔴 SỬA `28/08`: bản cũ dùng `docker logs` và nay RA RỖNG — vòng đệm stdout đã trôi qua
#    dòng boot sau ~11 giờ chạy. Nó KHÔNG báo lỗi, chỉ im lặng ra rỗng ⇒ dễ đọc thành
#    "không đo được". Đường còn sống là đọc tệp log TRONG container:
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" \
  'docker exec 9chain-a1-node-1 sh -c "grep -rho \"supplyCap[^,]*\" /root/.avalanchego/logs | head -1"'
# đo 2026-08-28 ⇒ supplyCap":7900000001000000000 ✓

# 🔴 M11.10 — ví ký ở MÁY DEV, khoá không chạm server (D-091)
node scripts/wallet-over-tunnel.mjs --check      # nghiệm thu đường đi, KHÔNG cần khoá, KHÔNG chạy ví
node scripts/wallet-over-tunnel.mjs --self-test   # 3 ca đối chứng ngược
node scripts/wallet-over-tunnel.mjs --wallet-key <tệp> [--fund foundation] [--port 8090]
docker rm -f 9chain-a1-vi-ham           # 🔴 xong việc là dừng NGAY — container này giữ khoá

# 🔴 O1 — bộ khoá quỹ có phải của MẠNG ĐANG CHẠY không (D-090). Chạy CẢ HAI, cùng thư mục:
node scripts/check-keys-on-chain.mjs <thư-mục-khoá>/allocation.md
node scripts/check-keys-on-chain.mjs --self-test     # 5 ca đối chứng ngược
# kèm: check-keys -allocation allocation.md keys.txt  (xem docs/O1-CUSTODY-VERIFICATION.md)

# 🔴 Cổng canh khoảng cách REPO ↔ SERVER (D-088) — chạy TRƯỚC khi tin bất kỳ mục "ĐÃ ĐÓNG" nào
node scripts/check-deploy-drift.mjs

# Cổng repo
node scripts/check-consistency.mjs --self-test
node scripts/gen-chainid-issued.mjs --check
node local-net/console/chainid-test.mjs
node local-net/lib/cb58.mjs --self-test
node scripts/check-chainid.mjs

# Tái lập cây fork (26 patch → tree 60a61707; đối chứng 25/26 → f2b9486b)
# 🔴 Preflight đã chạy CẢ HAI vế tự động — chạy tay chỉ để soi khi nó đỏ.
cd upstream/avalanchego && git worktree add --detach /tmp/tl 1cf1fc3
cd /tmp/tl && git am --keep-cr ../../patches/*.patch && git rev-parse HEAD^{tree}

# Số dư ví chain-factory (đẻ chain chết câm khi cạn) — chưa có giám sát, phải nhớ tự đo
curl -s -X POST -H 'content-type:application/json' \
  --data '{"jsonrpc":"2.0","id":1,"method":"platform.getBalance","params":{"addresses":["P-love91vgh2whn746dzzvg0dj4w9rsqvlalcldvpueuvj"]}}' \
  https://rpc-a1.9chain.org/ext/bc/P
```

⚠️ **Luật cứng của repo** *(đã trả giá để học)*:
1. **Không tin mã HTTP.** Thang đo: mã HTTP → `content-type` → **nội dung** → header tầng trước.
2. **Mọi cổng mới phải được nhìn thấy lúc nó ĐỎ.** Chưa có đối chứng ngược = mới kiểm một nửa.
3. **Đụng `patches/` là đụng đường tái lập fork** — sinh `--no-signature`, nghiệm thu
   `git am --keep-cr` + so tree. **Sinh lại CẢ BỘ.** Tree hiện tại: **`60a61707`** / **26 patch**
   / gốc `1cf1fc3`. Đối chứng ngược rẻ mà mạnh: áp **25/26** phải ra đúng **`f2b9486b`**.
   *(Mốc cũ `f2b9486b`/25 và `074aaa93`/24 còn nằm trong các mục phiên `28–29/08` bên trên —
   đó là **câu kể về quá khứ**, đúng ở thời điểm của chúng, đừng sửa hàng loạt.)*
   ⚠️ **Image `9chain-a1/node:g0` ĐANG CHẠY vẫn là bản 18 patch** — 0019 đụng SDK ví, 0020 đụng
   netgen; cả hai là CÔNG CỤ, không đụng node. Tree của repo ≠ tree trong image cho tới ngày G.
   🔴 **Và image ngày G — `9chain-a1/node:g1`, `commit=9chain-a1-g1-26patch-60a61707` — CHỈ CÓ
   TRÊN MÁY DEV.** Server không có nó, và cây fork trên server là ảnh chụp **không phải git repo,
   vẫn ở `A1Gen 0`** ⇒ build ở đó ra binary thế hệ chết mang nhãn `:g1`. `docker save`/`load`,
   rồi đo `--version` **TRÊN SERVER**. Đo `31/08` — xem mục phiên đầu tệp.
4. **Chỉ MỘT phiên được deploy.** Worktree web ở `C:\PROJECTS\9Chain-A1-web` (nhánh `web-home`)
   — 🔴 **Caddyfile ĐANG CHẠY đến từ nhánh đó**, không phải `main`. Deploy từ `main` sẽ xoá công
   việc của phiên web (cổng D-075 nay chặn, nhưng đừng dựa vào nó).

---
## Lịch sử các đợt trước

Đã tách sang [`docs/archive/HANDOFF-history-2026-08.md`](docs/archive/HANDOFF-history-2026-08.md)
(`2026-08-28`, A15-7) — **không mất một chữ nào**, chỉ thôi nằm trên đường đi hằng ngày.
Ở đó: đợt autopilot 14 · soát CORE `27/08` · chuẩn hoá thương hiệu `27/08` · các phiên trước.
