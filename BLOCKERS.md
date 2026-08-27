# BLOCKERS — 9Chain-A1 (phần chain)

Việc kẹt / cần người thật. Ghi vào đây rồi **đi làm việc khác**, không dừng chờ.

---

## Đang mở

### 🟡 B-11 — BA MỤC CHẠM BINARY **ĐÃ ĐÓNG** `27/08`, CÒN C-4 (2026-08-27)

Từ bản soát core [`docs/CORE-AUDIT-2026-08-27.md`](docs/CORE-AUDIT-2026-08-27.md) §7.

✅ **David chốt `27/08` (D-051, patch 0014, tree `4c5d5b1e`):** cả ba mục chạm binary đều
**GIỮ NGUYÊN GIÁ TRỊ** — patch chỉ đổi **chữ**, không đổi số. ⇒ **Không còn gì chặn lượt
`docker build` của ngày G.**

| | Việc | Chốt |
|---|---|---|
| ~~**C-1**~~ | `UptimeRequirement` | ✅ **GIỮ `.8`**. Mốc xét lại là **MAINNET**, không phải ngày G — A1 vẫn là testnet mời cộng đồng chạy node trên hạ tầng không chuyên. Chú thích cũ *"⬅️ CHỐT LẠI THÀNH 0.9"* nằm trong comment nên **không ai canh**; nay có ngày tháng |
| ~~**C-2**~~ | `MaxStakeDuration` | ✅ **GIỮ 365 ngày**, bằng Avalanche mainnet. Trần dài hơn = khoá staking giam lâu hơn, tức đánh đổi chứ không phải cải thiện ⇒ **sinh ra B-12** (quy trình gia hạn) |
| ~~**C-3**~~ | Phí C-Chain | ✅ **GIỮ đường cong Avalanche, KHAI RA LÀ CỐ Ý** trong `genesis_9chain_a1.go`, kèm lý do + điều kiện xét lại + con trỏ tới chỗ đổi thật (không phải file đó) |
| 🟡 **C-4** | **chainId `9000000009` cắm cứng** trong `cChainGenesis` (`netgen/main.go:351`) trong khi `networkID` là tham số ⇒ **mạng tập và mạng thật cùng chainId**. MetaMask không phân biệt được; EIP-155 buộc chữ ký vào chainId chứ không vào networkID | 🔴 **CHƯA** — nhưng **không chạm binary**, nên **không chặn ngày G** |

⚠️ **C-4 hôm nay rủi ro thấp**: netgen sinh khoá mới mỗi lượt nên địa chỉ hai mạng khác nhau;
cửa duy nhất là người tự import cùng một khoá vào cả hai. Đừng trích nó mạnh hơn thế. Cái đắt
là **bất đối xứng thiết kế**: A1 dựng cổng *"bản tập ≠ bản thật"* rất kỹ cho **chữ khắc**, mà
không có cổng nào cho **chainId** — thứ ví người dùng thật sự đọc.

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
HTML tự viết + **`patches/0003-9chain-a1-bo-cong-cu-chu-quyen-netgen-cli-create-l1-.patch`**.

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

⚠️ **Ca xanh giả sách giáo khoa:** `curl -o /dev/null -w '%{http_code}'` trả **200** và
`content-type` cũng đúng **text/plain**. Chỉ đọc **nội dung** — hoặc đọc **header
`cf-cache-status`** — mới thấy. Cảnh báo đã ghi vào chính `web/public/robots.txt` và
Caddyfile để người sau không tưởng nó đang chạy.

### ✅ B-7 — ĐÃ TRẢ LỜI (2026-08-25) — phân biệt được sẵn, không cần trường mới
**Trả lời đầy đủ:** `docs/requests-from-9scan/2026-08-25-node-tracking-TRA-LOI.md`.
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

### Ghi chú H-6 — 🔴 ĐẮT HƠN HẲN sau phiên 2026-08-25

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
5 quỹ. Xem D-044 và `NGAY-G-A1-CON-LAI.md` O1 — bản thứ hai do David tự cất, **chưa ai
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
Triệu chứng: `--phut 8 --vi 300` treo **2 giờ 59 phút**, CPU 0,1%, chain đứng ở block 2,
**giữ một slot L1** suốt thời gian đó. Với `--vi 60` thì chạy trọn vẹn.

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
