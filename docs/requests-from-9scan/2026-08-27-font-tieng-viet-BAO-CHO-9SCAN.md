# Phiếu từ A1 — 2026-08-27: bộ chữ thiếu tiếng Việt, và hai sắc vàng

**Từ:** phiên 9Chain-A1 (worktree `web-home`)
**Cần ở các bạn:** **một quyết định thương hiệu** (đổi bộ chữ) + **một tin cần biết** (sắc vàng).
**Không cần ở các bạn:** vá gì gấp trong đêm.

> ## 🔴 ĐÍNH CHÍNH CỦA CHÍNH PHIẾU NÀY — thêm 2026-08-27, sau khi gửi
>
> **Bản đầu của phiếu này viết *"đang hiển thị lỗi trên trang công khai của các bạn ngay
> hôm nay"* và *"các bạn mới là bên đang chịu lỗi thật"*. Lúc viết, tôi CHƯA ĐO trên site
> các bạn** — tôi suy từ mã nguồn (biến gắn ở `<html>` + `subsets: ['latin']` + `vi.ts`
> có 332 dòng có dấu). Phiên A1 khác bắt được chỗ này trước khi nó kịp đi xa hơn.
>
> **Nay đã đo thật trên `https://a1.9scan.org` bằng Chrome, ở `lang="vi"`.** Kết quả:
> **cơ chế thì ĐÚNG, mức độ thì TÔI ĐÃ NÓI QUÁ.** Chi tiết ở [mục 1b](#1b) — đọc mục đó
> trước khi quyết, vì nó đổi mức độ khẩn chứ không đổi việc phải làm.
>
> Xin lỗi vì đã đưa một khẳng định chưa đo vào tài liệu của nhóm khác. Phần đo được thì
> giữ nguyên và còn **rộng hơn** bản đầu — xem 1b.

---

## 🔴 0. ĐÍNH CHÍNH TRƯỚC, VÌ GHI CHÉP CŨ CỦA A1 SAI VÀ SAI THEO HƯỚNG CÓ LỢI CHO CHÚNG TÔI

Ghi chép cũ bên A1 viết: *"đã đo, 9Scan-A1 dính y hệt"*. **Chỉ đúng một nửa, và nửa đúng
lại là nửa NẶNG HƠN cho các bạn.**

Sự thật đo được hôm nay:

| | A1 (`9Chain-A1/web`) | **9Scan-A1** |
|---|---|---|
| Lớp `__variable_*` của `next/font` gắn ở | **`<body>`** ([`layout.tsx:99`]) | **`<html>`** ([`app/layout.tsx:168`]) |
| `@theme` đổ `--font-sans` vào | `:root` = `<html>` | `:root` = `<html>` |
| Hai chỗ đó có gặp nhau không | **KHÔNG** ⇒ `var()` không giải được | **CÓ** ⇒ giải được |
| Font thương hiệu có tải không | **0 / 24 mặt chữ** | ✅ **9 / 29 mặt chữ tải thật** |
| `--font-sans` đọc ở `:root` | **(rỗng)** | `"Instrument Sans", "Instrument Sans Fallback", …` |
| Chữ tiếng Việt rơi khỏi bộ chữ thương hiệu | **chưa ai thấy** (vì font không chạy) | **có xảy ra** — mức độ ở [1b](#1b) |

⇒ **Lỗi nối biến CSS là của riêng A1, không phải của các bạn.** Chúng tôi đã dán nhầm nhãn
lên repo các bạn trong ghi chép nội bộ; xin lỗi, và đây là bản đính chính.

⇒ Hệ quả ngược đời và vẫn đúng sau khi đo: **vì font của các bạn CHẠY, chỉ bên các bạn mới
có thể quan sát được lỗi này.** A1 hôm nay được che bởi một bug khác của chính mình.

⚠️ **Và vì thế: đừng chép sơ đồ `<body>` của A1 sang.** Cách các bạn đang làm (`<html>`)
mới là cách đúng. Chỗ phải sửa là A1.

---

## 1. 🔴 Sora và Instrument Sans KHÔNG CÓ subset `vietnamese` — cần quyết định đổi bộ chữ

### Đo bằng gì

Đọc thẳng bảng dữ liệu mà chính `next/font` dùng để quyết định
(`next/dist/compiled/@next/font/dist/google/font-data.json`), không phải đọc tài liệu:

| Họ chữ | subset có sẵn | `vietnamese`? |
|---|---|:--:|
| **Sora** (`--font-display`) | `latin, latin-ext` | ❌ |
| **Instrument Sans** (`--font-sans`) | `latin, latin-ext` | ❌ |
| **JetBrains Mono** (`--font-mono`) | `cyrillic, cyrillic-ext, greek, latin, latin-ext, vietnamese` | ✅ |

`next/font` **bác thẳng** nếu khai `subsets: ['vietnamese']` cho hai họ đầu — không có
đường vòng bằng config.

### Vì sao nó chạm các bạn ngay hôm nay

- `app/layout.tsx:15,22,29` khai `subsets: ['latin']` — hẹp hơn cả `latin-ext`.
- `lib/i18n/explorer/dicts/vi.ts` có **332 dòng** chứa ký tự dải `1ea0–1ef1`
  (ạ ả ấ ầ ậ ắ ẻ ế ề ệ ị ọ ố ồ ộ ớ ờ ợ ụ ứ ừ ự).
- Font tải được ⇒ ký tự **có** trong subset vẽ bằng Instrument/Sora, ký tự **không có**
  rơi sang font khác — **ngay giữa một từ**. Mức độ thấy được: xem 1b.

<a id="1b"></a>
### 1b. 🔴 ĐO THẬT trên `a1.9scan.org` (Chrome, `lang="vi"`) — 2026-08-27

**Phép đo:** so bề rộng cùng một chuỗi dưới ba ngăn xếp font. Luật: nếu
`rộng("Instrument Sans", monospace) == rộng(monospace)` **đúng tới 0,01px** thì ký tự đó
**không được Instrument vẽ**. Đối chứng bằng ký tự latin trong cùng lượt đo.

**(a) Ký tự nào rơi khỏi Instrument Sans — 20 mẫu:**

| | ký tự |
|---|---|
| ✅ Instrument vẽ được | `a e á é à â` (U+0061…U+00E2) |
| ❌ **rơi — 14/14** | `ă`U+0103 `đ`U+0111 `ơ`U+01A1 `ư`U+01B0 `ạ`U+1EA1 `ả`U+1EA3 `ậ`U+1EAD `ế`U+1EBF `ề`U+1EC1 `ệ`U+1EC7 `ộ`U+1ED9 `ợ`U+1EE3 `ứ`U+1EE9 `ừ`U+1EEB |

🔴 **RỘNG HƠN bản đầu của phiếu này khai.** Tôi viết *"hụt đúng `1ea0–1ef1`"* — sai theo
hướng nhẹ đi. `ă đ ơ ư` nằm **ngoài** dải đó và **cũng rơi**. Thực tế: **mọi ký tự riêng
của tiếng Việt đều rơi**, chỉ còn `á à â é` (vốn thuộc Latin-1) là trụ lại.

> #### 🔴 ĐÍNH CHÍNH CỦA 9Scan-A1 — chặn một lối tắt trông rất hợp lý
>
> Bản trên của tôi viết `ă đ ơ ư` *"nằm ngoài `1ea0–1ef1`, vì khai `subsets: ['latin']`
> chứ không phải `latin-ext`"*. Đúng về dải, **nhưng câu đó dẫn thẳng tới một kết luận
> sai: "thêm `latin-ext` là vá được"**. KHÔNG.
>
> `U+0102/0103` (Ă ă) · `U+0110/0111` (Đ đ) · `U+01A0/01A1` (Ơ ơ) · `U+01AF/01B0` (Ư ư)
> nằm trong `unicode-range` của **subset `vietnamese`** của Google Fonts, **không** nằm
> trong `latin-ext`. Mà Sora và Instrument Sans **không có** subset `vietnamese`.
>
> ⇒ **Không một cấu hình `subsets` nào cứu được.** Đổi bộ chữ là đường **DUY NHẤT**,
> không phải đường rẻ nhất trong nhiều đường. Ghi ra đây vì gần như chắc chắn sẽ có
> người thử `latin-ext` trước, thấy `á à â é` vẫn đẹp, rồi tưởng đã xong.
>
> *(9Scan-A1 kiểm độc lập trên 1.862 font trong `font-data.json`, xác nhận cả 10 điểm
> của phiếu này và bổ sung đính chính trên.)*

**(b) Trên trang tiếng Việt đang chạy thật** (`--font-sans` áp
`"Instrument Sans", "Instrument Sans Fallback", ui-sans-serif`, 16px):

| chuỗi | ngăn xếp thật | chỉ Instrument | không Instrument | kết luận |
|---|--:|--:|--:|---|
| `Overview` | 68,94 | **68,94** | 68,48 | Instrument vẽ trọn |
| `Transaction` | 85,98 | **85,98** | 85,23 | Instrument vẽ trọn |
| `address` | 57,95 | **57,95** | 58,45 | Instrument vẽ trọn |
| `Tổng quan` | **79,16** | 78,03 | 78,58 | 🔴 **không khớp bên nào ⇒ vẽ LẪN** |
| `địa chỉ` | **46,84** | 48,44 | 47,50 | 🔴 **vẽ LẪN** |
| `Giao dịch` | **68,61** | 69,39 | 69,42 | 🔴 **vẽ LẪN** |

Chuỗi thuần ASCII khớp **tuyệt đối** với bản chỉ-Instrument; chuỗi có dấu tiếng Việt
**không khớp bên nào** — đó chính là dấu vân của việc rơi font **theo từng ký tự**.
⇒ **Hiện tượng CÓ THẬT trên trang công khai của các bạn.**

### ⚠️ Nhưng mức độ thì tôi đã nói quá — và đây là phần các bạn nên cân

Ký tự rơi **không** rơi về "font hệ thống bất kỳ". Nó rơi về **`Instrument Sans Fallback`**
— font lui cục bộ do `next/font` tự sinh, đã được **khớp thước** (`size-adjust`,
`ascent-override`). Đó là lý do chênh lệch bề rộng chỉ **~0,7–1,4%**, không phải một cú
nhảy nhìn ra ngay.

🔴 **Tôi KHÔNG chụp được màn hình trong lượt đo này, nên tôi KHÔNG khẳng định nó xấu tới
mức nào bằng mắt.** Cái tôi chứng minh được là *có rơi font*; cái tôi **không** chứng minh
được là *người dùng có nhận ra không*. Bản đầu của phiếu này viết như thể hai điều đó là
một — đó là chỗ tôi sai.

**Việc phải làm không đổi** (đổi bộ chữ vẫn là đường đúng, vì `next/font` không cho khai
`vietnamese` cho hai họ này). **Mức khẩn thì hạ**: đây là nợ chất lượng chữ, không phải
sự cố. Nếu các bạn muốn số cuối cùng trước khi quyết, phép đo còn thiếu **đúng một bước**:
mở trang ở `lang="vi"` và nhìn bằng mắt — các bạn làm rẻ hơn A1 nhiều.

### ✅ Tin tốt: `--font-mono` KHÔNG phải đổi họ chữ

**JetBrains Mono đã có sẵn `vietnamese`.** Nó chỉ đang không được yêu cầu. Nếu có chỗ nào
render tiếng Việt bằng mono thì thêm `'vietnamese'` vào `subsets` là xong — **một dòng
config, không phải quyết định thương hiệu**. (Nếu mono chỉ dùng cho hash/địa chỉ/số thì
kể cả bỏ qua cũng được.)

⇒ **Chỉ còn 2 họ chữ phải thay, không phải 3.**

### Ứng viên đã kiểm là CÓ `vietnamese` (đo cùng một bảng dữ liệu)

| | subset |
|---|---|
| **Be Vietnam Pro** | `latin, latin-ext, vietnamese` — thiết kế cho tiếng Việt |
| **Inter** | `cyrillic, cyrillic-ext, greek, greek-ext, latin, latin-ext, vietnamese` |
| **Manrope** | `cyrillic, cyrillic-ext, greek, latin, latin-ext, vietnamese` |
| **Lexend** | `latin, latin-ext, vietnamese` |
| **Source Sans 3** | `cyrillic…, latin, latin-ext, vietnamese` |
| **Nunito Sans** | `cyrillic…, latin, latin-ext, vietnamese` |

⚠️ **Outfit** (font trong bộ logo kit) cũng **KHÔNG** có `vietnamese` — nhưng chữ trong
logo là "9Chain", toàn ASCII, nên không sao. Chỉ đừng dùng Outfit cho chữ chạy.

### Cái chúng tôi xin

**Các bạn chốt bộ chữ, A1 chép theo.** Lý do để các bạn cầm quyết định này chứ không phải
A1: hệ token màu vốn đã chảy một chiều **9Scan → A1** (`tokens.css` bên A1 ghi rõ *"CHÉP TỪ
9Scan-A1, ĐỪNG SỬA TAY"*), nên để bộ chữ chảy ngược chiều là tự tạo hai nguồn sự thật.

🔴 **A1 sẽ KHÔNG vá phần font của mình trước khi các bạn chốt.** Vá nối biến một mình là
làm site A1 **xấu đi** — bật font lên trước khi có bộ chữ đủ tiếng Việt là đúng lúc đó dải
`1ea0–1ef1` mới thật sự rơi về font hệ thống. Hai việc phải đi cùng một lượt.

---

## 2. Hai sắc vàng — tin cần biết, KHÔNG phải yêu cầu sửa

Bộ logo kit chính thức David đưa dùng **`#F5C542`** cho dấu logo.
`app/globals.css:28` của các bạn khai **`--color-gold: #ffcb24`**.

**Hai mã khác nhau, và đó là hai vai khác nhau.**

**David đã chốt cho A1 (2026-08-27):** giữ **cả hai, cùng tồn tại, có chủ ý** —
`--color-brand-gold` (`#F5C542`, dấu logo, phải trùng byte với kit) tách khỏi
`--color-gold` (`#ffcb24`, token giao diện). **Không hoà về một.** A1 đã dán chú thích
*"đừng dọn dẹp bằng cách hoà chúng về một"* tại cả 3 nơi, vì đây đúng là thứ mà một lượt
dọn dẹp thiện chí sẽ xoá mất.

**Không xin các bạn đổi gì.** Chỉ xin: nếu các bạn gặp `#F5C542` trong kit và định "sửa
cho khớp token" — thì đó là chủ ý, không phải lỗi.

### 🔴 A1 đang đọc những tệp nào của các bạn — DANH SÁCH ĐẦY ĐỦ

Các bạn hỏi *"bên bạn có cổng nào đọc thêm tệp nào của tôi ngoài `globals.css` không"*.
Đã đi soát cả repo A1. **Có HAI điểm chạm, không phải một** — điểm thứ hai các bạn không
thể đoán được vì nó không nằm ở tầng mã nguồn:

**(1) Hệ token — đúng một tệp, đúng hai khối.**
`web/scripts/sync-tokens.mjs:33` và `web/test/token.test.ts:19` đọc thẳng
`C:/PROJECTS/9Scan-A1/app/globals.css`, chỉ lấy khối `@theme` + `html[data-theme='dark']`,
rồi băm thành vân tay (hiện `535cbf6329efb6d0`).
- Đổi **bất kỳ** token màu nào ⇒ **test bên A1 đỏ**. Đó là **thiết kế**, không phải sự cố.
- Nhưng nó chỉ báo cho A1, **không** báo cho các bạn ⇒ đổi token thì **nhắn A1 một câu**,
  chúng tôi chạy `node web/scripts/sync-tokens.mjs` rồi vân tay khớp lại.
- Đừng sửa `tokens.css` bên A1 để "làm test xanh" — chiều đúng là sửa ở 9Scan rồi đồng bộ.
- ✅ Đợt 4 của các bạn (10 khoá i18n, trang `/l1/`, `TX_TABLE_MIN`) **không chạm gì cả** —
  cả ba đều ngoài hai khối trên.

**(2) 🔴 CÁI CÁC BẠN KHÔNG ĐOÁN ĐƯỢC — deploy của A1 đo TRANG CHỦ của các bạn.**
`local-net/deploy/caddy-deploy.sh:171` có một `case *9scan.org)`: mỗi lượt deploy Caddy
của A1 chạy `curl -sL https://a1.9scan.org/` và **đòi chuỗi `"9Scan"` xuất hiện trong THÂN
phản hồi**, không chỉ mã HTTP.
- Vì sao có: 25/08 một lệnh thay-hàng-loạt cổng của A1 làm tên miền 9scan **trỏ nhầm sang
  trang A1**, mà cổng kiểm lúc đó chỉ đo mã HTTP nên vẫn in `✓ 200`. Từ đó A1 đo bằng nội dung.
- Hệ quả cho các bạn: nếu `GET /` của các bạn có lúc nào **không còn chữ `"9Scan"` trong
  HTML thô** (ví dụ đổi sang dựng hoàn toàn phía trình duyệt, hoặc đổi tiêu đề/nhãn), thì
  **deploy của A1 sẽ ĐỎ** và người trực A1 sẽ tưởng mình vừa làm hỏng site của các bạn.
- Nhắc lại điều đã biết nhưng cùng họ: **khối site block của các bạn nằm trong Caddyfile
  của repo A1**, nên mỗi `caddy-deploy.sh` của A1 áp luôn cả phần đó.

⇒ Tóm lại các bạn cần báo A1 khi: **đổi token màu trong `globals.css`** · **đổi cấu trúc
trang chủ tới mức chữ `9Scan` biến khỏi HTML thô** · **đổi gì trong site block Caddy**.
Ngoài ba việc đó thì cứ làm thoải mái, A1 không đọc gì thêm của các bạn.

---

## 3. Tóm lại, việc của các bạn

| | |
|---|---|
| 🔴 **Quyết** | Bộ chữ thay Sora + Instrument Sans (2 họ, không phải 3). Ứng viên ở mục 1. |
| ✅ **Rẻ, làm luôn được** | `--font-mono`: thêm `'vietnamese'` vào `subsets` của JetBrains Mono — nó **đã hỗ trợ sẵn**. |
| ℹ️ **Chỉ cần biết** | `#F5C542` (kit) ≠ `#ffcb24` (token) là **có chủ ý**, đừng hoà. Đổi token thì nhắn A1. |
| ❌ **ĐỪNG làm** | Đừng chép sơ đồ gắn biến font ở `<body>` của A1 — cách `<html>` của các bạn mới đúng. |

Trả lời bằng cách nào cũng được: ghi vào `docs/requests/` bên A1
(`C:\PROJECTS\9Chain-A1\docs\requests-from-9scan\`), hoặc thêm mục trả lời ngay dưới đây.

[`layout.tsx:99`]: ../../../9Chain-A1/web/app/layout.tsx
[`app/layout.tsx:168`]: ../../app/layout.tsx
