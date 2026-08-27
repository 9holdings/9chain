# G4 — TRA SỔ `chainId` CÔNG KHAI, `2026-08-27`

> Mốc A-3 của đợt autopilot 14. Điều kiện qua: *"có ảnh chụp/JSON của `chains.json` kèm ngày
> tra"* — **đạt**, vật chứng ở [`vat-chung/g4-2026-08-27/`](vat-chung/g4-2026-08-27/).
> Bài chạy lại: [`scripts/check-chainid.mjs`](../scripts/check-chainid.mjs).

---

## 1. Hai câu trả lời, và câu thứ hai không ai hỏi

| | |
|---|--:|
| Nguồn | `https://chainid.network/chains.json` |
| Ngày tra | **`2026-08-27T09:32:38Z`** |
| `sha256` | `583b67a2d79db56e83d9889b9b694241df512495a0820db00b2910c51f3a028c` |
| Kích cỡ · số mục | 1.161.063 byte · **2.723 chuỗi** |

### ✅ `9000000009` — **TRỐNG**

Không ai giữ. Và **không có một chuỗi nào** trong bán kính 1 triệu quanh nó. ⇒ D-047 (giữ
`9000000009`) không va vào ai.

### 🔴 Nhưng dải console tự cấp cho L1 người dùng thì **CÓ BỐN SỐ BỊ CHIẾM**

| chainId | Bị chiếm bởi | Vai trò bên A1 |
|--:|---|---|
| **9100** | **Genesis Coin** (`GENEC`) | 🔴 **số ĐẦU TIÊN console cấp** |
| 9108 | Destra Dubai Testnet | dải cấp tiếp |
| 9134 | GIWA (`giwa`) | dải cấp tiếp |
| 9170 | Rinia Testnet Old | dải cấp tiếp |

Console cấp chainId cho L1 người dùng bằng `chainId = 9100; while (taken) chainId++`
(`local-net/console/server.mjs:659`), trong đó `taken` chỉ tra **sổ của chính mình**
(`console-chains.json`), **không tra sổ công khai**.

⇒ **Người đầu tiên bấm "đẻ chain" nhận `9100`** — trùng **Genesis Coin**, một chuỗi có thật
trong sổ mà MetaMask tra vào.

🔴 **Và chuyện này KHÔNG phải rủi ro tương lai — nó đã xảy ra rồi.** Sổ cũ (trước `26/08`) có
L1 ở dải `9100–9145`; sổ hiện tại có `9100–9105`. `9100` đã được A1 cấp **hai lần** (chain
`OwnerTest`).

**Vì sao nó đắt:** `chainId` là thứ **ví đọc**, và EIP-155 buộc chữ ký vào nó. Người dùng thêm
L1 của mình vào MetaMask dưới số `9100`; công cụ "thêm mạng" tra sổ công khai và hiện tên
**Genesis Coin**. Đây đúng lớp lỗi §5d đã ghi cho `9000000009` (*"ví còn cấu hình cũ nối vào
mạng mới không cảnh báo gì"*), chỉ khác là lần này **đã có người thật đi qua**.

⚠️ **Đừng trích mạnh hơn phép đo:** hôm nay 0 L1 đang sống, và 6 L1 dải `9100–9105` đều đã thu
hồi ⇒ **thiệt hại thực tế hiện tại ~0**. Cái đang mở là **cửa**, không phải vết thương.

---

## 2. Vì sao bản kế hoạch không bắt được

`NGAY-G-A1-CON-LAI` §7 điều 3 và `HANDOFF` A-3 đều viết G4 là *"tra `9000000009`"*. Đúng —
nhưng thiếu. `9000000009` là chainId **của A1**; `9100+` là chainId **A1 phát cho người khác**.
Cái thứ hai đông hơn, chạm người thật nhiều hơn, và không ai canh.

Bài `check-chainid.mjs` nay tra **101 số**: `9000000009` + trọn dải `9100–9199`.

---

## 3. ✅ ĐÃ ĐÓNG CÙNG NGÀY — David chốt gốc dải **`9000000010`** (D-069)

Lượt tra này để ngỏ việc vá vì nó vướng §5c (*"có khôi phục sổ `retired` cũ không"* — khôi
phục thì gốc dải **9146**, không thì **9100**). **David chọn đường thứ tư:** gốc dải =
chainId của A1 (`9000000009`) **+ 1**.

| | |
|---|---|
| Vùng trống | **không một chuỗi nào trong bán kính 10 triệu** quanh 9000000009 (đo lại trên chính ảnh chụp này) |
| So với dải cũ | dải cũ có **4/100** số đầu đã có chủ |
| Trần EIP-2294 | còn **9.007.190.254.740.981** số trống trên gốc dải |

🔴 **Cái được nằm ngoài câu hỏi ban đầu:** dải cũ `9100–9145` từ nay **không bao giờ được tự
cấp lại** ⇒ nửa `chainId` của lỗ phát lại §5c đóng **bằng kiến trúc**, không cần khôi phục sổ.
⚠️ Chỉ **nửa `chainId`, và chỉ đường tự cấp** — người dùng vẫn tự nhập được số cũ, và trùng
**TÊN** không đụng tới. Đừng đọc thành "§5c đã đóng".

**Đã vá + nghiệm thu cùng ngày:** `local-net/lib/chainid.mjs` · `chainid-test.mjs` **13 đạt/0
hỏng** · `check-chainid.mjs` nay tra dải MỚI (`CAN_TRA` bỏ dải cũ — D-069c, để mã thoát lấy
lại nghĩa) · danh sách chặn giữ **cả hai dải** (D-069b: một danh sách rỗng không phân biệt
được với một bộ sinh hỏng).

**Phần KHÔNG cần quyết đã làm ở A-4:** console có **danh sách chặn tĩnh** — đúng dù gốc dải là
số nào.

🔴 **Lỗi bắt được trong CHÍNH bộ sinh, lúc vá:** khối ghi danh sách chặn khai
`nguon: NGUON` (hằng số URL) **kể cả khi chạy với `--tep`** — tệp tự khai vừa hỏi Internet
trong khi nó đọc một ảnh chụp trên đĩa, có thể là ảnh chụp từ năm ngoái. (Khối ghi vật chứng
ngay bên trên thì khai đúng.) **Cùng lớp lỗi với bộ xuất O2 khai *"kèm 1 L1"* khi không có
byte nào — D-057.** Đã sửa; bài kiểm nay có ô canh trường `nguon`.

---

## 4. Nghiệm thu phép đo — ba ca đối chứng ngược

🔴 Luật cứng #1 của repo: *"không tin mã HTTP"*. Một trang chặn bot, một bản tải cắt cụt, một
lỗi CDN — **tất cả đều trả 200**, và khi đó *"9000000009 không thấy trong sổ"* đúng y hệt lúc
sổ rỗng. Nên bài phải kiểm **sổ** trước khi tin **kết luận**.

| # | Ca | Kết quả |
|---|---|---|
| 1 | hỏi thêm `--them 1` (Ethereum Mainnet — chắc chắn bị chiếm) | `🔴 1 BỊ CHIẾM — Ethereum Mainnet` · **exit 1** ⇒ phép tra tìm được thật |
| 2 | sổ **cắt cụt** (5.000 byte đầu) | `🔴 KHÔNG PHẢI JSON hợp lệ … đừng kết luận gì` · **exit 2** |
| 3 | 🔴 sổ là **JSON hợp lệ nhưng rỗng** `[]` — bẫy nguy hiểm nhất | `✗ sổ đọc được và có thật: 0 mục · KHÔNG có chainId 1` → **từ chối kết luận**, exit 2 |

Ca 3 là ca đáng giá: một sổ rỗng **cú pháp hoàn hảo** sẽ làm mọi số ta hỏi ra "trống". Bài neo
vào một mục **phải có** (chainId 1 = Ethereum Mainnet) + ngưỡng số mục, nên nó phân biệt được
*"trống"* với *"không tra được"*.

**Mã thoát cũng phân biệt hai thứ đó:** `1` = có số bị chiếm · `2` = **sổ không đáng tin, đừng
kết luận**. Gộp chúng làm một là mất đúng thông tin cần cho ngày G.

---

## 5. 🔴 Lượt tra này chỉ nói về HÔM NAY

Sổ `chainid.network` đổi hàng ngày (nó là repo `ethereum-lists/chains`, ai cũng gửi PR được).
`27/08` trống **không** chứng minh `01/09` trống.

⇒ **Phải tra LẠI ngay trước bước sinh genesis ngày G** — `NGAY-G-A1-CON-LAI` §7 điều 3. Một
lệnh:

```bash
node scripts/check-chainid.mjs --luu docs/vat-chung/g4-<ngày>
```
