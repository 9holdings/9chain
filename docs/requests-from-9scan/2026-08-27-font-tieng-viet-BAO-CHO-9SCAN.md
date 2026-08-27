# Phiếu từ A1 — 2026-08-27: bộ chữ thiếu tiếng Việt, và hai sắc vàng

**Từ:** phiên 9Chain-A1 (worktree `web-home`)
**Cần ở các bạn:** **một quyết định thương hiệu** (đổi bộ chữ) + **một tin cần biết** (sắc vàng).
**Không cần ở các bạn:** vá gì gấp trong đêm. Nhưng mục 1 **đang hiển thị lỗi trên trang
công khai của các bạn ngay hôm nay**, còn bên A1 thì chưa — nên phiếu này đi từ A1 sang.

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
| Font thương hiệu có tải không | **0 / 24 mặt chữ** | **có tải** |
| Chữ tiếng Việt hụt dải `1ea0–1ef1` | **chưa ai thấy** (vì font không chạy) | 🔴 **đang thấy, hàng ngày** |

⇒ **Lỗi nối biến CSS là của riêng A1, không phải của các bạn.** Chúng tôi đã dán nhầm nhãn
lên repo các bạn trong ghi chép nội bộ; xin lỗi, và đây là bản đính chính.

⇒ Nhưng hệ quả thì ngược đời: **vì font của các bạn CHẠY, các bạn mới là bên đang chịu
lỗi thật.** A1 hôm nay được che lỗi bởi một bug khác của chính mình.

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
- Font tải được ⇒ mọi ký tự **có** trong subset vẽ bằng Sora/Instrument, mọi ký tự
  **không có** rơi về font hệ thống ⇒ **lẫn font ngay giữa một từ**, khác nét và khác
  cả chiều cao chữ. Đây là kiểu lỗi người Việt thấy ngay còn người không đọc tiếng Việt
  duyệt qua mười lần cũng không thấy.

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

### 🔴 Một cảnh báo có thật về cơ chế

`web/test/token.test.ts` bên A1 **đọc thẳng `C:/PROJECTS/9Scan-A1/app/globals.css`** và so
vân tay (hiện `535cbf6329efb6d0`). Nghĩa là:

- Các bạn đổi **bất kỳ** token màu nào ⇒ **test bên A1 đỏ**. Đó là **thiết kế**, không
  phải sự cố — nó sinh ra để bắt trôi lệch.
- Nhưng nó chỉ báo cho A1, **không** báo cho các bạn. Nên: đổi token thì **nhắn A1 một
  câu**, chúng tôi chạy `node web/scripts/sync-tokens.mjs` rồi vân tay khớp lại.
- Đừng sửa `tokens.css` bên A1 để "làm test xanh" — chiều đúng là sửa ở 9Scan rồi đồng bộ.

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
