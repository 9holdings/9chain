# KẾ HOẠCH — 9Chain Testnet A1 sinh lại mạng `2026-09-01`

> 🔴 **A1 ĐÃ THẨM ĐỊNH BẢN NÀY `2026-08-26` — ĐỌC [`docs/GDAY-A1-REMAINING.md`](docs/GDAY-A1-REMAINING.md) TRƯỚC.**
> File này là **bối cảnh + quyết định**; file kia là thứ A1 **thi hành**. Mâu thuẫn thì file kia
> thắng, vì nó đo trên máy. Ba chỗ bản này sai đã ghi rõ ở đó: **O6** (A1 đã có cổng nhất quán) ·
> **điều kiện GO/NO-GO số 1** (đòi 90 tỷ — con số không tồn tại trong `uint64`) · **G1** (có **ba**
> bảng phân bổ, không phải hai, và bảng đang chạy thật không khớp bảng nào).
> Nhóm **I** thì **đã xong hết** từ lượt re-genesis `26/08` — bản này viết trước lượt đó.

> **Bản nháp `2026-08-26` do 9Chain-BOD dựng theo chỉ đạo chủ dự án.** Đối chiếu bản C1:
> `C:\PROJECTS\9Chain-C1\internal\PLAN-REGENESIS-2026-09-01.md`.
> Quyết định gốc: `C:\PROJECTS\9Chain-BOD\DECISIONS.md` (Đ5 · Đ6 · Đ7 · Đ9 · Đ10 · Đ11).
>
> 🔴 **Bản này CHƯA được xác minh trên máy.** Mọi ô "Điều kiện qua" là đề xuất; phiên A1 phải
> kiểm lại từng đường dẫn/tên hàm trước khi coi nó là runbook. Chỗ nào tôi không đo được thì
> đánh **`[cần verify]`** thay vì đoán.

## Vì sao sinh lại mạng

Không phải vì A1 hỏng. Vì **`A1-vs-C1-SCORECARD.md` đặt cuộc thi là *"khác nhau ở engine"*** —
mà tokenomics hai bên đang khác nhau gần như mọi chiều. Để nguyên thì cộng đồng chấm bảng phân
bổ chứ không chấm engine, và cuộc thi hỏng trước khi bắt đầu. Xem
`9Chain-BOD/docs/DONG-NHAT-A1-C1-2026-08-26.md`.

## ⏱️ Ngân sách thời gian — đọc trước khi hứa gì

| | |
|---|---|
| Hôm nay | `2026-08-26` |
| **Ngày làm việc thật trước GO/NO-GO** | **3** (26 · 27 · 28/08) — *C1 có 5, A1 có 3* |
| `29/08` | GO/NO-GO |
| `30–31/08` | Diễn tập trên đúng topology nhiều máy |
| **G** | `2026-09-01` |

🔴 **ĐÍNH CHÍNH `26/08` — bản nháp đầu của tài liệu này viết:** *"A1 không khắc Block Adam… nên
`01/09` là mong muốn, không phải ràng buộc… duyệt sàn trượt rộng tới `08/09` hoặc xa hơn."*
**Sai kể từ khi chủ dự án chốt A1 khắc block 1 / Adam / Eva y như C1.**

**Block Adam = block đầu tiên vượt `2026-09-09T06:09:09Z`.** Một chain sinh SAU mốc đó thì
**không thể có Block Adam** — nó đã trôi qua trước khi chain tồn tại. Nên:

| | |
|---|---|
| **Sàn trượt cứng của A1** | **`2026-09-06`** — cần biên vài ngày để block 1 sống trước mốc Adam |
| Trượt quá đó | **mất Block Adam vĩnh viễn**, hoặc phải quyết lại mốc Adam cho A1 (lệch C1) |

⇒ A1 nay bị trói **ngang C1**. Không còn "trượt thoải mái". Bù lại, chủ dự án đã chốt
**cài lại mạng vài lần trước `01/09`** — tức phần diễn tập tự có, xem §Luật nhiều lần cài.

---

## 🚦 Luật phân loại — mọi việc phải rơi vào đúng một nhóm

Nhóm của A1 **khác C1** vì tham số kinh tế của A1 nằm trong **binary**, không nằm trong genesis file.

| Nhóm | Ở đâu | Lỡ ngày G thì sao |
|---|---|---|
| **G** | `netgen/allocation.go` → alloc · `netgen/engrave.go` → chữ khắc *(bản gốc ghi `9chain-a1-config/genesis.json`; **sai, tệp đó đã xoá `27/08`** — xem đính chính ở G5a)* | **mất tới lần sinh mạng sau** |
| **I** | biên dịch vào binary (`genesis/genesis_9chain_a1.go` `A1Params`, `patches/`) | dựng lại image + khởi động lại đồng loạt — **làm lại được**, nhưng đổi param kinh tế trên mạng đang chạy là **vỡ đồng thuận** ⇒ thực tế phải đi cùng ngày G |
| **D** | web · explorer · docs · Caddy | deploy sau ngày G, không mất gì |
| **O** | runbook · backup · custody · giám sát · diễn tập | không có thì **ngày G không chạy được** |

⚠️ **Cổng cân sổ:** tổng mục của 4 nhóm phải bằng tổng bản kê. Một mục rơi ngoài mọi nhóm là một
mục sẽ đi qua ngày G mà không ai chạm.

---

## 🔴 NHÓM G — chỉ vào được lúc sinh mạng

| # | Mục | Trạng thái `26/08` | Điều kiện qua |
|---|---|---|---|
| **G1** | ✅ **PHÂN XỬ XONG `27/08` — GIỮ BẢNG ĐANG CHẠY 40/30/12/9/9** (D-045) | Chủ dự án chốt trực tiếp với A1 | Bảng **5 hạng mục**: Staking Rewards 40 (không cấp ở genesis) · Community 30 · Foundation 12 · Private Sale 9 · Team 9. Tổng **9.000.000.000**, phát hành genesis **5.400.000.000**. **Không phải sửa dòng mã nào** — `netgen/allocation.go` đã codify đúng nó. Khối xung đột dưới giữ để đối chiếu, **đã hết hiệu lực** |

> ~~🔴 **XUNG ĐỘT G1 — hai bảng, cùng ngày, cùng người chốt**~~ ✅ **ĐÃ PHÂN XỬ `27/08`, xem G1 ngay trên.**
> *(giữ nguyên khối dưới để đối chiếu — nhưng A1 thẩm định lại thì có **BA** bảng, không phải hai:
> bảng ĐANG CHẠY quy về 4 nhóm là **40/30/21/9**, không khớp bảng nào ở đây. Chi tiết: D-045.)*
>
>
> | Ô | **BOD Đ14** (`CANON.md` §1) | **A1 D-039** |
> |---|---:|---:|
> | Staking + validator | **30%** | **40%** |
> | Con người | **40%** | **30%** |
> | Hệ sinh thái | 20% | 20% |
> | Team | 10% | 10% |
>
> Hai ô đầu **đảo nhau**. Lý lẽ A1: bảng của họ **đổi ít nhất** so với mạng đang chạy
> (Staking vốn đã 40%, Hệ sinh thái vốn đã 20%).
>
> 🔴 **Hệ quả BOD đo được, để chủ dự án cân:**
> · Tỷ lệ đầu người validator : con người **xấu đi 1,8×** — `135 triệu : 1` so với `76 triệu : 1`
>   *(81 validator; dân số 8,2 tỷ)*
> · Câu nền móng **Đ25** *"1 LOVE9 cho mỗi con người"*: ở 40% mỗi người **0,44**; ở 30% chỉ **0,33**
>
> ⚠️ Theo `PROTOCOL.md` §Ranh giới thẩm quyền, **BOD không tự hoà giải** — có thể chủ dự án đã đổi
> ý khi nói trực tiếp với A1. ~~**Đang chờ anh phân xử.**~~ ✅ **Đã phân xử `27/08`: giữ bảng đang chạy.**
| **G2** | ✅ **XONG `27/08` — dẫn xuất từ G1: self-bond 8.999.991, nằm trong Foundation 12%** (KHÔNG trích từ ô staking như bản nháp ghi) | Ở 9 node = **999.999/node**. Đã đo: ≤ `maxValidatorStake` 625.000.000, còn ~624 triệu dư địa nhận uỷ quyền. 🔴 **8.999.991 = 9 × 999.999 chỉ chia hết ở N=9** — đổi số node là sinh số lẻ, xem D-045 | Mỗi validator genesis có self-bond **≤ `maxValidatorStake` mới** (xem I3). Đây đúng là lỗi đã xảy ra một lần — bảng cũ ghi trần 3M trong khi node genesis nhận 32M |
| **G3** | ~~Số dư genesis ≈ 64 tỷ, phần để mint ≈ 26 tỷ~~ ✅ **CHỐT `27/08` (D-045): phát hành genesis 5.400.000.000 · phần để mint 3.600.000.000** | Dẫn xuất từ G1 đã phân xử | 🔴 Số cũ SAI, và **không phải chia 10**: 64/26 suy từ bảng BOD Đ14 (staking 30%) ở thang 90 tỷ. Bảng được chốt cho staking **40%** ⇒ tỷ lệ đổi chứ không chỉ thang đổi. Phần mint = ô Staking Rewards 40%, **không cấp ở genesis** |
| **G4** | **Kiểm lại `networkID 9001` + EVM chainId `9000000009` không trùng** | `9000000009` đã dùng ở mạng hiện tại; **chưa tra lại `chainid.network`** `[cần verify]` | Tra `chains.json` **ngay trước bước sinh genesis**, không tin lần tra hôm nay. C1 có tiền lệ: `9chain-c1/scripts/check-chain-id.py`, số cũ `999999999` bị Zora chiếm |
| **G5** | ✅ **CHỐT: A1 khắc y như C1** — block 1 · Block Adam · Block Eva | **Đo `26/08`: khắc ĐƯỢC, có sẵn ba chỗ.** Không còn là điểm trừ engine | Xem `G5a–G5e` ngay dưới |

### G5 — ba chỗ khắc chữ trong genesis A1 (đã đo, không suy)

> 🔴 **ĐÍNH CHÍNH `2026-08-27` — con trỏ trong bảng dưới đây từng SAI.** Bản gốc trỏ chỗ khắc
> vào `9chain-a1-config/genesis.json:95` `"{{ fun_quote }}"`. **Tệp đó không có vai trò nhân quả
> nào** — `netgen` dựng `genesis.UnparsedConfig` thẳng trong Go, không đọc tệp cấu hình nào —
> và nó là `genesis_local.json` gốc của Avalanche (khoá **ewoq** công khai giữ 50 triệu, địa chỉ
> `X-local1…`, stake hết hạn `2025-07-15`) còn sót trong đường boot của node dev. **Đã xoá
> `27/08`.** Chỗ khắc thật nằm ở `netgen/engrave.go` + `netgen/main.go`.
>
> ⚠️ Ai đi theo con trỏ cũ sẽ sửa một tệp không ai đọc, **và không có gì báo lỗi** — lượt sinh
> mạng vẫn chạy, genesis vẫn hợp lệ, chữ khắc vẫn là chuỗi mặc định. Cùng họ với "đường lui
> alias = xanh giả". Xem [`docs/CORE-AUDIT-2026-08-27.md`](docs/CORE-AUDIT-2026-08-27.md) §7b.
>
> ✅ **Cơ chế nay đã XONG** (patch 0010 khắc, 0011 đọc ngược) — bảng dưới giữ lại làm bối cảnh
> quyết định. Cách dùng thật: [`docs/GDAY-ENGRAVING.md`](docs/GDAY-ENGRAVING.md).

| # | Chỗ | Hiện tại | Dùng cho | Điều kiện qua |
|---|---|---|---|---|
| **G5a** | `message` → **P-CHAIN genesis** (đo: `genesis/genesis.go:449-458`, `config.Message` truyền vào `pChainGenesis`, **không phải X-Chain**). Sinh ở `netgen/main.go` → `pChainMessage()`, nội dung từ `netgen/engrave.go` → `canonicalBundle(docs, "p")` | mặc định `"9Chain-A1 sovereign genesis"` (không bật khắc) | **Sáng Thế Ký 1:1 nguyên ngữ Hebrew** | Đọc lại từ P-Chain genesis ra đúng byte, khớp `sha256` bản C1 — một lệnh: `9chain-a1-tools/engrave-verify` |
| **G5b** | `cChainGenesis.extraData` | `"0x00"` | Chỗ khắc kinh điển (Bitcoin coinbase / Ethereum genesis). Đề xuất: dòng đề tặng ngắn | ⚠️ **Phải thử giới hạn độ dài trước** — coreth có thể chặn > 32 byte. `[cần verify]` |
| **G5c** | `cChainGenesis.alloc` — account có `code`/`storage` | chỉ 1 account có `balance` | **TOÀN VĂN LOVE Paper (bản EN)** dưới dạng **hợp đồng dữ liệu** ở địa chỉ cố định | `eth_getCode` trả đúng toàn văn; **`sha256` khớp `PAPER/CHECKSUMS-FREEZE-LOVEPAPER.txt` của C1** |
| **G5d** | Block Adam / Eva | chưa có | Văn bản đề tặng vào genesis; **block được CHỈ ĐỊNH bằng luật thời gian**, không ghi gì vào chính block đó — đúng cách C1 làm | Luật khai rõ: *"block đầu tiên vượt `2026-09-09T06:09:09Z`"*. 🔴 **Phải chốt: Block Adam nằm trên CHAIN NÀO?** A1 có P/X/C + L1 người dùng, không như C1 chỉ một chuỗi block. **Khuyến nghị: C-Chain** — đó là thứ explorer hiện và người dùng trích dẫn |
| **G5e** | 🔑 **Đối chiếu chéo hai chain** | — | Cùng một LOVE Paper, cùng một `sha256`, khắc trên cả A1 lẫn C1 | Đây là **vật chứng đồng nhất kiểm được bằng một lệnh** — mạnh hơn mọi lời tuyên bố về "cùng một sản phẩm". Nên đưa vào scorecard như một ô ✓/✗ |

### G5f — ✅ **CHỐT `26/08`: chỉ khắc P-CHAIN**

Chủ dự án: *"vậy chỉ cần 1 chain P Chain thôi là được"*. Đo lại thì lựa chọn này **chạy được trọn
vẹn**, không phải thoả hiệp:

| Phép đo | Kết quả |
|---|---|
| `platformvm/block/codec.go:44` · `txs/codec.go:56` | `GenesisCodec = codec.NewManager(math.MaxInt32)` — **không phải codec mặc định**; genesis cố ý không giới hạn thực tế |
| `platformvm/genesis/genesis.go:51` | `Message string` — một trường, kiểu chuỗi |

⇒ **Một trường `Message` chứa được cả 9 tài liệu của C1**: Sáng Thế Ký 1:1 Hebrew · toàn văn
LOVE Paper (EN) · đề tặng Adam · đề tặng Eva. Không cần `extraData`, không cần hợp đồng dữ liệu,
không cần đụng X-Chain.

**Và P-Chain là chỗ ĐÚNG về mặt ý nghĩa, không chỉ tiện:** `genesis.go:441-446` cho thấy X-Chain
và C-Chain nằm trong mảng `chains` được truyền **vào** `pChainGenesis` — P-Chain genesis là thứ
**khai sinh ra hai chain kia**. Khắc ở gốc, không khắc ở nhánh.

⇒ **`G5b` (extraData) và `G5c` (hợp đồng dữ liệu C-Chain) HUỶ.** Đường găng ngắn lại.

### 🔴 Ba hệ quả của "chỉ P-Chain" — phải xử, không được bỏ qua

**1. Chữ có đó nhưng gần như không ai đọc được.**
P-Chain genesis không phải thứ ví hay người dùng thường chạm; C-Chain thì `eth_getCode` là ai
cũng đọc. Đổi lấy sự gọn gàng thì mất tính hiển thị.
⇒ **Việc bù, rẻ:** gửi yêu cầu qua `docs/requests-from-9scan/` để **9Scan-A1 phơi nội dung
`Message` của P-Chain genesis ra một trang công khai**, kèm `sha256`. Không có bước này thì chữ
khắc chỉ tồn tại trên lý thuyết.

**2. C1 khắc 9 tài liệu RIÊNG, mỗi cái một `sha256`; A1 sẽ chỉ có MỘT chuỗi.**
Muốn giữ được `G5e` (đối chiếu chéo hai chain) thì nội dung `Message` phải là **JSON chính tắc
của đúng 9 tài liệu đó**, thứ tự cố định, để `sha256` **từng tài liệu** vẫn tính ra và **khớp
`PAPER/CHECKSUMS-FREEZE-LOVEPAPER.txt` của C1**. Nhét thành một khối văn bản trộn là mất vật
chứng đồng nhất mạnh nhất đang có.

**3. 🔴 Block Adam trên P-Chain có thể KHÔNG TỒN TẠI đúng lúc — và đây là bẫy dễ mất nhất.**
C1 chạy CometBFT nên sinh block **liên tục mỗi vài giây** ⇒ *"block đầu tiên vượt
`2026-09-09T06:09:09Z`"* rơi trong vòng vài giây, chắc chắn có.
Avalanche **không sinh block rỗng**. ✅ **ĐÃ ĐO — `9chain-a1-26`, `26/08`, 10 lượt lấy mẫu trong
5 phút trên mạng công khai lúc rảnh: P-Chain đứng nguyên ở `330`, C-Chain ở `0x73`.** Và điều đó
đúng cho **cả P-Chain** — dự án trước đây mới chỉ ghi gotcha này cho C-Chain.
⚠️ **Giới hạn của phép đo, đừng trích mạnh hơn nó cho phép:** nó chứng minh block **không sinh
theo nhịp thời gian**; nó **không** chứng minh P-Chain đứng yên tuyệt đối — sự kiện
staking/validator vẫn đẻ block. Nên *"không có block đúng mốc"* là **rủi ro thật, không phải điều
chắc chắn**. `9scan-a1-ec` xác nhận độc lập: explorer cố ý **không** có cảnh báo "chain đứng" dựa
trên chiều cao block, đúng vì lý do này.

⇒ **Đối sách, và nó lại hợp nghi thức:** **hẹn sẵn hai giao dịch nền tảng nghi lễ** chạy đúng
`2026-09-09T06:09:09Z` và ngay sau đó — để Block Adam và Block Eva **được sinh ra bởi một hành
động có chủ đích**, không phó mặc may rủi. Phải diễn tập trước trên bản tập.
🔴 Nếu không làm gì, thứ xảy ra ngày `09/09` là: không ai biết Block Adam là block nào, hoặc nó
là một block tình cờ cách mốc nhiều giờ.

### ✅ `G5g` — CHỐT `26/08`: **L1 người dùng KHÔNG khắc. Gốc là đủ.**

Chủ dự án: *"L1 người dùng cũng không cần khắc, gốc là đủ."* Khuôn `l1-evm-genesis.json` giữ
nguyên `extraData: "0x00"`. Hệ quả tốt kèm theo: **vướng mắc thương mại với chain permissioned
B2B (`QĐ #10`) biến mất** — doanh nghiệp tạo chain trên 9Chain không mang theo văn bản tôn giáo nào.

### ✅ `G5h` — CHỐT `26/08`: **C-Chain khắc thêm, bằng TIẾNG ANH**

Chủ dự án: *"tôi muốn làm thêm cho C Chain nhưng bằng tiếng Anh thay vì Hebrew, ngụ ý là gốc và
hiện tại phổ biến."*

**Thiết kế:**

| | Ngôn ngữ | Ý nghĩa | Ai đọc |
|---|---|---|---|
| **P-Chain** `Message` | **Hebrew nguyên ngữ** + 9 tài liệu | **GỐC** — nơi khai sinh cả X lẫn C | công cụ chuyên, 9Scan-A1 phơi ra |
| **C-Chain** hợp đồng dữ liệu | **TIẾNG ANH** | **HIỆN TẠI PHỔ BIẾN** — nơi thế giới đứng | `eth_getCode`, ai cũng đọc |

⇒ **`G5c` được BẬT LẠI** (đã huỷ ở `G5f`), nhưng đổi nội dung sang tiếng Anh.
✅ Và nó **giải luôn hệ quả #1 của `G5f`** — chữ khắc không còn chỉ tồn tại trên lý thuyết.

**Khuyến nghị nội dung C-Chain: trọn bộ tiếng Anh, không chỉ một câu.**
LOVE Paper vốn đã **chỉ có bản tiếng Anh** (`SPEC` mục 5, chủ dự án chốt 08/08) và hai dòng đề
tặng Adam/Eva cũng đã là tiếng Anh. Nên thứ duy nhất phải *dịch* là Sáng Thế Ký 1:1.
⇒ C-Chain mang: **Genesis 1:1 (EN) · LOVE Paper (EN) · Adam · Eva**.
Lợi ích cộng thêm: LOVE Paper khi đó có **cùng byte trên ba mặt** — P-Chain A1, C-Chain A1, và
genesis C1 ⇒ `G5e` mạnh hơn, kiểm được ở ba chỗ thay vì hai.

## 🔴 `G5h-1` — BẪY BẢN QUYỀN, phải chặn trước khi khắc

**Bản dịch tiếng Anh của Kinh Thánh KHÔNG phải đều thuộc phạm vi công cộng.**
`ESV` · `NIV` · `NASB` · `NLT` đều **đang có bản quyền**, và `NIV` có giới hạn trích dẫn nghiêm.
Khắc một bản dịch có bản quyền **vĩnh viễn, bất biến, vào một chain công khai** là thứ **không
gỡ lại được** nếu bên giữ quyền phản đối.

**Chọn bản thuộc phạm vi công cộng. Hai ứng viên:**

| Bản | Nguyên văn Genesis 1:1 | Ghi chú |
|---|---|---|
| **KJV (1611)** | *"In the beginning God created the heaven and the earth."* | Phạm vi công cộng. Văn phong cổ, hợp một văn bản nền móng. **"heaven" số ít** |
| **ASV (1901)** ⭐ | *"In the beginning God created the heavens and the earth."* | Phạm vi công cộng. **"heavens" số nhiều — sát tiếng Hebrew `שָׁמַיִם` hơn**, và tiếng Anh hiện đại hơn KJV |

✅ **CHỐT `26/08`: `ASV 1901`.** Phạm vi công cộng, `"heavens"` số nhiều sát nguyên ngữ.

🔴 **Và bản đó phải khớp TỪNG BYTE với tài liệu thứ 10 của C1.** Chủ dự án đã chốt C1 cũng thêm
bản EN (9 → **10 tài liệu**) ⇒ *"gốc và hiện tại phổ biến"* nay là **nguyên tắc chung của cả hệ**,
không còn là đặc trưng riêng của A1. Yêu cầu đã gửi:
`C:\PROJECTS\9Chain-C1\request\2026-08-26-tai-lieu-thu-10-genesis-EN.md`.

⇒ **Một câu, hai chain, một `sha256`.** Lấy byte từ bản C1 sinh ra, **đừng gõ lại** — dấu chấm
cuối câu, kiểu nháy, ký tự xuống dòng, BOM: mỗi thứ đổi một byte là đổi cả hash, và số đó rồi sẽ
nằm trong genesis không sửa được. Đóng băng vào `PAPER/CHECKSUMS-FREEZE-*` giống mọi văn bản khác.

## `G5h-2` — chi tiết thi hành

| # | Việc | Ghi chú |
|---|---|---|
| a | `extraData` = **`sha256` của bản EN, đúng 32 byte** | 32 byte là trần kinh điển của EVM ⇒ chắc chắn vừa, không phụ thuộc coreth có nới hay không. Nó là **con dấu** |
| b | `alloc` = **hợp đồng dữ liệu** chứa toàn văn EN | Không giới hạn độ dài. Mã hợp đồng mở đầu bằng opcode `STOP` (`0x00`) rồi tới byte thô ⇒ không chạy được, chỉ để đọc bằng `eth_getCode` |
| c | **Chốt địa chỉ cố định** cho hợp đồng đó | Khắc vĩnh viễn. Gợi ý theo tiền lệ C1 (precompile emission ở `0x…0901`): chọn một địa chỉ có ý nghĩa và ghi vào tài liệu công bố |
| d | 🔴 **KHÔNG sửa tay genesis đã sinh** (`local-net/net*/genesis.json`) | C-Chain genesis nằm trong đó dưới dạng **chuỗi JSON đã escape trên một dòng**. Thêm một `alloc` mang toàn văn tài liệu nghĩa là một dòng escape rất dài — **phải để `netgen` sinh**, sửa tay là hỏng escape và không ai thấy cho tới lúc boot. *(Bản gốc mục này ghi `9chain-a1-config/genesis.json` — sai, xem đính chính ở đầu §G5.)* |

## ✅ Đã giải: C1 CŨNG khắc bản tiếng Anh (9 → 10 tài liệu)

Chủ dự án chốt `26/08`. Bất đối xứng biến mất — cả hai testnet mang Sáng Thế Ký 1:1 ở **hai
ngôn ngữ**, cùng `sha256` cho mỗi bản. Đây là vật chứng đồng nhất thứ hai, cạnh LOVE Paper (`G5e`).

**Thứ tự thi hành bắt buộc:** C1 sinh bản EN chính tắc **trước** → A1 lấy đúng byte đó nhét vào
hợp đồng dữ liệu C-Chain. **Không làm song song, không gõ lại hai lần.** Hai bản gõ độc lập gần
như chắc chắn lệch nhau ở một chỗ vô hình, và tới lúc đối chiếu thì genesis đã khắc.

### ~~G5f cũ — khắc trên cả ba chain P/X/C?~~ *(giữ để đối chiếu)*

Ba chain **không đối xứng**. Đo được, không suy:

| Chain | Chỗ khắc | Kết luận |
|---|---|---|
| **P-Chain** | `config.Message` (`genesis.go:457`) | ✅ **Được.** Và đây **không phải "một trong ba"** — `genesis.go:441-446` cho thấy P-Chain genesis là nơi **khai sinh ra X-Chain và C-Chain** (cả hai nằm trong mảng `chains` truyền vào `pChainGenesis`). Khắc ở P-Chain = khắc ở **gốc của cả mạng** |
| **C-Chain** | `extraData` + `alloc` (hợp đồng dữ liệu) | ✅ **Được, hai chỗ.** Đây cũng là nơi explorer và người dùng thật sự đọc |
| **X-Chain** | 🔴 **không có ô trống** | Trường `Message` cấp UTXO **đã bị dùng** để mang địa chỉ ETH (`genesis.go:372` và `:404`). Không có trường message cấp chain |

**Ba lối cho X-Chain, phải chọn:**
- **(a)** Thêm một UTXO genesis đánh dấu (giá trị 0 hoặc bụi, tới địa chỉ đốt) mang chữ Hebrew
  trong trường `Message` của nó. Chạy được về nguyên tắc — **`[cần verify]`** giới hạn độ dài và
  việc AVM có chấp nhận UTXO giá trị 0 không.
- **(b)** ⭐ **Không khắc trên X-Chain, và nói thẳng lý do:** P-Chain là gốc sinh ra X, nên chữ đã
  ở trên cao hơn X một bậc. X-Chain là chuỗi tài sản UTXO gần như không ai soi. **Khuyến nghị** —
  đơn giản, trung thực, không phải hack.
- **(c)** Ép ba chỗ cho bằng được ⇒ nhận thêm một `[cần verify]` vào đường găng, đổi lấy một
  dòng chữ trên chain ít người đọc nhất.

### G5g — MỌI L1 người dùng tạo trên A1 đều khắc Sáng Thế Ký 1:1? (chủ dự án hỏi `26/08`)

✅ **Được.** Khuôn `9chain-a1-config/l1-evm-genesis.json` đã có **cả hai ô**: `alloc` (dòng 33) và
`extraData` (dòng 40, nay là `"0x00"`).

📌 **Có tiền lệ đúng ngay trong repo:** `D-031` chốt *"Warp bật cho MỌI chain (khuôn genesis),
**không làm preset**"*, lý do: *"để nó thành một lựa chọn trong danh sách preset là đẻ ra một lớp
chain vĩnh viễn thiếu"*. Cùng lập luận áp được ở đây — vào **khuôn**, không vào **preset**.

**Thiết kế đề xuất — giải luôn bài toán giới hạn độ dài:**

| Ô | Nội dung | Vì sao |
|---|---|---|
| `extraData` | **`sha256` của bản Hebrew = đúng 32 byte** | 32 byte là đúng trần kinh điển của EVM (`MaximumExtraDataSize`) ⇒ **không bao giờ vượt**, không phụ thuộc subnet-evm có nới hay không. Nó là **con dấu** |
| `alloc` | **hợp đồng dữ liệu** chứa toàn văn Hebrew ở địa chỉ cố định | Không giới hạn độ dài. Nó là **bản văn**. Đọc bằng `eth_getCode` |

Chữ Hebrew UTF-8 dài ~60 byte (không niqqud) tới ~130 byte (có niqqud) ⇒ **nhét thẳng vào
`extraData` là canh bạc**; nhét hash thì chắc chắn vừa. Và hash phải khớp `sha256` đóng băng của
C1 (`PAPER/CHECKSUMS-FREEZE-LOVEPAPER.txt`) — cùng một dòng chữ, cùng một con dấu, trên mọi chain
của cả hai testnet.

🔴 **Phải chốt kèm: bản Hebrew CÓ hay KHÔNG có niqqud.** Hai bản cho ra hai `sha256` khác nhau, và
số đó rồi sẽ nằm trong hàng trăm genesis không sửa lại được. C1 khai *"7 từ"* — phải lấy **đúng
byte của C1**, không gõ lại.

⚠️ **Một hệ quả thương mại phải quyết có ý thức, không để nó tự xảy ra:** vào khuôn nghĩa là
**mọi** chain sinh trên A1 mang câu Kinh Thánh vĩnh viễn — kể cả chain permissioned của doanh
nghiệp, mà `QĐ #10` xếp **SaaS B2B chain con** là một nguồn doanh thu chính. Ở một số thị trường
đó là phản đối thật. Ba lựa chọn: bắt buộc tuyệt đối · bắt buộc con dấu (`extraData`) nhưng cho
gỡ bản văn ở chain permissioned · chỉ khắc trên ba chain chính. **Không có lựa chọn "không nghĩ tới".**

---

## 🟠 NHÓM I — phải vào binary trước ngày G

| # | Mục | Trạng thái | Điều kiện qua |
|---|---|---|---|
| **I1** | `SupplyCap` **720.000.000 → 9.000.000.000** | 🔄 **SỬA `26/08`: 9 tỷ, KHÔNG phải 90 tỷ** (Đ24). `genesis/genesis_9chain_a1.go` (`A1Params`) | ✅ 9 tỷ @ thang `1e9` hiện tại = `9e18`, **vừa** (48,8% `uint64`, dư 2,05×) ⇒ **KHÔNG phải đổi thang đơn vị**, `x2cRate` không phải đụng, `docs/RISK-SCALE-1E7.md` R1–R6 **tan hết** |
| **I1b** | 🔴 **Phơi TRẦN CUNG ra một endpoint đọc được** | Chưa có. **P-Chain không có `getMaxSupply`**, chỉ `getCurrentSupply` (đo production `26/08`: **318.456.024,405**) | Luật cứng #2 của 9Scan-A1: *"số công bố phải đọc từ chain thật"* ⇒ in trần mà không có endpoint là **gõ hằng số vào giao diện**. **(a)** node phơi trần ra RPC ⭐ · **(b)** trang ghi rõ nguồn là *tham số genesis*. ⚠️ Bất đối xứng thật với C1 (`bank/supply` bên đó trả số đo), nên (a) **không** giải luôn cho C1 |
| **I2** | **Rescale mọi tham số ghi bằng LOVE9 tuyệt đối** | 🔄 **SỬA: hệ số là ×12,5, KHÔNG phải ×125** (720 triệu → 9 tỷ) | min validator `2.000 → 25.000` · max `50.000.000 → 625.000.000` · min delegator `25 → ~270` · phí P/X `0,001 → ~0,0125`. *Gợi ý — chủ dự án chốt số cuối.* 🔑 **Uỷ quyền tính vào `MaxValidatorStake`** (A1 nêu `26/08`) ⇒ self-bond lớn thì validator genesis gần hết chỗ nhận uỷ quyền. Phải kiểm dư địa, không chỉ kiểm trần |
| **I3** | **Tính lại `maxValidatorStake` theo self-bond genesis THẬT** | Chưa làm | Trần phải chứa nổi self-bond của node genesis **và** vẫn chặn tập trung. Đây là ô dễ lặp lại lỗi cũ nhất |
| **I4** | **Consumption rate: GIỮ NGUYÊN 10–12%** | ✅ Không phải làm gì (Đ11 lối b) | A1 giữ đường cong riêng ⇒ **không bước ra ngoài vùng upstream đã kiểm chứng**; bỏ luôn rủi ro nhánh Helicon/ACP-285 |
| **I5** | Build tái lập được sau khi đổi số | M0.6 đã chứng minh build byte-identical | `apply-sovereign.sh` từ clone sạch → hash khớp |

---

## 🔵 NHÓM O — vận hành, phải sẵn TRƯỚC ngày G

| # | Mục | Ghi chú |
|---|---|---|
| **O1** ⭐ | 🔑 **Custody cho bộ khoá quỹ MỚI — cơ hội chỉ đến một lần** | Sinh lại mạng ⇒ **sinh bộ khoá quỹ mới**. Nghĩa là bài toán `keys.txt` (*"chỗ hỏng duy nhất còn lại của dữ liệu"*, `HANDOFF.md:18`) **không phải đi sao lưu — mà đi thiết kế lại từ đầu**. Chốt sơ đồ custody (multisig? phân mảnh? phương tiện offline nào?) **TRƯỚC** khi bấm sinh khoá. Sau ngày G thì lại về đúng thế kẹt cũ |
| **O2** | Bản export + `sha256` của mạng đang chết, công bố trước khi xoá | Tiền lệ C1: *"trước mỗi lần như vậy, bản export trọn chain + sha256 được công bố để dấu vết còn truy được"* |
| **O3** | ~~28 L1 người dùng sẽ mất (6 track, 21 thu hồi)~~ 🔴 **SỐ SAI — `9chain-a1-26` đo lại `26/08`: 3 L1 SỐNG · 43 ĐÃ THU HỒI.** Cả hai vế lệch, ngược chiều — bản chụp của BOD đã cũ | **Và khung của mục này cũng sai.** Trong 3 chain sống, **chỉ MỘT thuộc người dùng thật, và đó là chain của chính David** (`OwnerTest` là chain kiểm thử M4; `OmegaChain` không có admin). ⇒ Hôm nay đây **KHÔNG** phải bài toán "báo tin xấu cho người lạ". Việc quyết vẫn thật, nhưng lý do là **kế hoạch mời thêm người TRƯỚC `01/09`** — rủi ro nằm ở người sắp mời, không ở người đã có |
| **O3b** 🔴 🆕 | **Re-genesis XOÁ SỔ CHỐNG PHÁT LẠI** — `9chain-a1-26` nêu, BOD bỏ sót hoàn toàn | 43 bản ghi `retired` giữ `name` + `chainId` **vĩnh viễn**; đó là lý do `createChain` kiểm trùng trên `chains ∪ retired`. Sinh lại mạng ⇒ sổ trống ⇒ tên và chainId **dùng lại được** ⇒ ví của người từng dùng chain cũ **lặng lẽ trỏ vào chain của người khác**, chữ ký phát lại được. Hố sụt này đã có trong `HANDOFF.md` của A1 |

**Lối xử `O3b` — BOD đề xuất, cần A1 thẩm định:** theo `B-7`, sổ `retired` nằm trong
`console-chains.json` (trạng thái phía **operator**, không phải trạng thái **chain**). Nếu đúng vậy
thì nó **sống sót qua re-genesis chỉ bằng cách giữ nguyên file** — `createChain` tiếp tục từ chối
tên/chainId cũ, và lỗ hổng đóng lại với chi phí gần bằng không.
⇒ **(a)** giữ nguyên `console-chains.json` qua ngày G ⭐ · **(b)** chấp nhận và công bố.
🔴 BOD suy từ `B-7`, **chưa đo** — A1 xác nhận hoặc bác trước khi đưa vào runbook.
| **O4** 🔴 | **Validator ở nhà cung cấp thứ hai** — `[human]`, tốn tiền | 5 node đang ở *"một máy, một nhà cung cấp, một datacenter"* (`HANDOFF.md:25`). **Chưa đạt thì không được gọi `01/09` là "chạy chính thức"** |
| **O5** 🔴 | **Gỡ `H-7`** — IPv4 đa cổng cho node beacon | Chặn `M3` (cộng đồng chạy node). Không gỡ thì mời cộng đồng vào một mạng họ không join được |
| **O6** | **Cổng nhất quán cho A1** | A1 **chưa có** thứ tương đương `9chain-c1/scripts/check-consistency.py`. ~~Đổi `720.000.000 → 90.000.000.000`~~ **→ `9.000.000.000`** (Đ24/D-039; 90 tỷ không tồn tại trong `uint64`) mà không có cổng thì không ai biết sót chỗ nào. ✅ **BẢN NHÁP SAI: A1 ĐÃ CÓ** `scripts/check-consistency.mjs` từ `26/08` — nhưng nó **không đọc một dòng Go nào**, nên là cổng **một phần** |
| **O7** | Diễn tập trọn kịch bản trên topology nhiều máy | `30–31/08` |

---

## 🟢 NHÓM D — deploy lúc nào cũng được

- `9chain-web` / trang chủ / faucet: số mới
- **Báo `9Scan-A1`** qua kênh `docs/requests-from-9scan/` — explorer phải đổi `max supply`,
  và theo Đ7 phải công bố **`max supply` + `circulating` cùng định nghĩa với 9Scan bên C1**
- `docs/TOKENOMICS.md`: viết lại mục 1 và 2 theo số mới
- Caddy / tên miền: không đổi

---

---

## 🔁 Luật nhiều lần cài — chủ dự án chốt `26/08`: **cài lại mạng vài lần trước ngày G**

Tin tốt: phần diễn tập tự có, và nhóm G được chạy thật nhiều lượt thay vì một lượt duy nhất.
Ba cái bẫy đi kèm, phải chặn bằng luật chứ không bằng trí nhớ:

**1. 🔴 Bản tập KHÔNG được phép biến thành bản thật.**
Dùng đúng kỷ luật C1 đã có (`DECISIONS` 25/08): bản tập đặt
`genesisTime = bây giờ + 120s`; **chỉ bản thật mới mang mốc thiêng**. Mốc thời gian tự nó là dấu
phân biệt — không cần nhớ, không cần nhãn dán. Thêm một cổng: script từ chối sinh mạng mang mốc
thiêng nếu không có cờ xác nhận tường minh.

**2. 🔴 Sơ đồ custody (`O1`) phải được DIỄN TẬP, không chỉ được chốt.**
Bản tập dùng khoá vứt đi là hợp lý. Nhưng chạy 5 lượt bằng khoá vứt đi rồi lượt cuối mới làm
custody thật, trong lúc vội, là công thức hỏng. ⇒ **ít nhất MỘT lượt tập phải chạy trọn sơ đồ
custody thật**, kể cả phần cất phương tiện offline.

**3. 🔴 Mỗi lần cài lại **xoá sạch L1 người dùng đã tạo** — và `26/08` là ngày mời người mới.**
Đây là mục `O3`, nhưng lặp nhiều lần thì nó đổi tính chất: không còn là "một lần mất" mà là
"mất đi mất lại đúng nhóm người vừa được mời".
⇒ **Đợt mời `26/08` KHÔNG được dẫn người vào tính năng "đẻ chain" của A1 mà không nói trước.**
Câu bắt buộc: *"A1 và C1 đang trong giai đoạn sinh lại; mọi thứ tạo trước `01/09` sẽ bị xoá."*
Việc này thuộc repo `Web9Chain`, không thuộc A1 — nhưng nguyên nhân nằm ở đây nên ghi ở đây.

## ✅ Điều kiện GO/NO-GO `29/08`

Đủ **cả 7** mới GO:

1. ✅ **G1 XONG `27/08` (D-045)** — ~~khai đúng 10–20–30–40, tổng ra 90 tỷ~~ → `allocation.md` khai đúng **40/30/12/9/9, tổng ra 9.000.000.000**, phát hành genesis 5.400.000.000.
   🔴 Điều kiện cũ **không thoả mãn được**: 90 tỷ không tồn tại trong `uint64` (H-9).
2. G2 xong — self-bond genesis ≤ `maxValidatorStake` mới, có phép đo
3. G4 xong — tra lại `chains.json`, không trùng
4. **G5a–G5e xong** — chữ khắc đọc lại được từ chain; `sha256` LOVE Paper **khớp bản C1**; đã chốt
   Block Adam nằm trên chain nào
5. I1 + I2 + I3 xong, build tái lập được, test xanh
6. **O1 xong** — sơ đồ custody đã chốt **và đã diễn tập trọn ít nhất một lượt**
7. **O3 đã có quyết định** về L1 người dùng, và câu cảnh báo đã lên `Web9Chain`

🔴 **NO-GO thì trượt, nhưng sàn cứng là `06/09`** — sau đó Block Adam (`2026-09-09T06:09:09Z`)
trôi qua trước khi chain kịp sống, và **mất vĩnh viễn**. Đây không còn là ngày mềm như bản nháp
đầu ghi nhầm.

---

## Việc chủ dự án phải quyết (không agent nào thay được)

| # | Việc | Hạn |
|---|---|---|
| A1-G2 | Lát self-bond genesis trích bao nhiêu từ ô staking 27 tỷ? | `27/08` |
| A1-I2 | Duyệt cột số rescale ×125, hay tự chốt số khác? | `27/08` |
| A1-G5 | A1 có khắc LOVE Paper / Sáng Thế Ký vào genesis không? | `28/08` |
| A1-O1 | Sơ đồ custody cho bộ khoá quỹ mới | **`28/08`** — sau ngày G là hết cơ hội |
| A1-O3 | 28 L1 người dùng: công bố mất, hay dựng lại? | `28/08` |
| A1-O4 | Chi tiền cho validator ở nhà cung cấp thứ hai? | `29/08` |
| A1-slip | **Duyệt trước sàn trượt rộng cho A1 (tới `08/09`+)?** | **hôm nay** |
