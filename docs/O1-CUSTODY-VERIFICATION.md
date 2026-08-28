# O1 — PHÉP KIỂM CUSTODY KHOÁ QUỸ

**Cho David. Mười lăm phút. Không phải một quyết định — là một phép kiểm chưa ai chạy.**

Cập nhật `2026-08-28` (D-090). Bối cảnh: D-044 (sơ đồ) · D-085 (bước 1) · `SOAT-TOAN-DIEN-2026-08-27` §12.2.

---

## 0. Câu hỏi thật của O1

Không phải *"anh chọn sơ đồ custody nào"* — **anh đã chốt ở D-044 rồi.** Câu còn lại là:

> **Bản sao thứ hai có thật không, và khôi phục được không?**

Hôm nay câu trả lời là **chưa ai biết**. Khoá 5 quỹ của mạng đang chạy nằm ở **đúng một ổ đĩa**:
`C:\Users\abc\9chain-a1-keys\g0\`. Ổ đó hỏng đêm nay là mất quyền chi của cả 6 quỹ.

🔴 **Và có một dịp diễn tập rủi ro bằng KHÔNG đang trôi qua.** Bộ khoá này **bị vứt bỏ ngày
`01/09`** — mạng sinh lại, khoá mới thay hết. Tập trên chính nó thì hỏng cũng không mất gì.
Đây là cửa sổ duy nhất trong năm để thử một quy trình custody mà không đánh cược.

---

## 1. 🔴 Đọc trước khi chạy — cái bẫy của chính phép kiểm này

Công cụ `kiem-khoa` **KHÔNG phân biệt được bộ khoá còn sống với bộ khoá đã chết.**

Đo `28/08` trên bộ khoá thế hệ `9001` (bộ `26/08`, mạng đã chết, **tiền của nó không tồn tại ở
đâu cả** — bộ đó vẫn còn nằm trên máy dev ở `local-net/net-public/`):

```
✓ 6/6 quỹ khôi phục đúng — mọi địa chỉ suy lại từ khoá đều khớp thứ tệp tự khai.
EXIT=0
```

Vì `kiem-khoa` so `keys.txt` với `allocation.md` — **hai tệp cùng một thư mục, chép cùng một
lượt**. Nó chứng minh bản sao **tự nhất quán**, không chứng minh bản sao **còn giá trị**.

⚠️ **Đây không phải lo xa.** Bộ `26/08` là bộ đang tồn tại đúng vào lúc anh được nhắc phải sao
lưu. Nếu bản anh cất là bộ đó, `kiem-khoa` in `6/6 ✓`, O1 được chấm ĐẠT — **và khoá thật vẫn
chỉ có một bản.**

🔴 **Và thư mục đó là một thư mục TRỘN, nên "cất cả thư mục cho chắc" cũng không cứu.** Đo
`28/08`: `local-net/net-public/keys.txt` là bộ **9001 đã chết** (6 quỹ đọc ra **0** trên chain),
nhưng `chain-factory-key.txt` **cùng thư mục** lại là khoá **g0 đang sống** và đang giữ tiền.
⇒ Không có câu trả lời đúng cho *"thư mục này còn dùng được không"* — **phải hỏi từng tệp**, và
đó chính là việc hai lệnh dưới đây làm.

⇒ **Phải chạy CẢ HAI lệnh.** Một mình không lệnh nào đủ:

| | Lệnh | Chứng minh |
|---|---|---|
| **1** | `check-keys` | khoá riêng suy ra **đúng những địa chỉ** tệp tự khai |
| **2** | `check-keys-on-chain.mjs` | những địa chỉ đó **giữ tiền thật trên mạng đang chạy** |

Nối lại: **khoá riêng trong tay anh chi được tiền của mạng đang chạy.** Đó mới là thứ O1 hỏi.

### 🔴 NAY CHỈ CẦN MỘT LỆNH — và đó không phải chuyện tiện tay

```bash
node scripts/o1-check.mjs D:/tam-o1
```

Một **lời dặn** *"nhớ chạy cả hai"* không phải một **cổng**: nó chỉ có hiệu lực với người đọc
đúng tài liệu, đúng hôm ấy, và nhớ tới lệnh thứ hai **sau khi lệnh thứ nhất vừa in một dòng
xanh rất thuyết phục**. `scripts/o1-check.mjs` chạy cả hai vế và **chỉ thoát `0` khi cả hai
xanh** (D-097).

| mã thoát | nghĩa | phải làm gì |
|---:|---|---|
| `0` | ✅ **ĐẠT** | bản sao dùng được — O1 khép vòng |
| `1` | 🔴 **SAI** | bản sao **không** cứu được mạng đang chạy. Đừng cất nó |
| `2` | 🟡 **CHƯA KẾT LUẬN** | một vế **không chạy được** ⇒ *không biết*. **Không biết KHÔNG phải đạt** — sửa nguyên nhân rồi chạy lại |

Ba mã, không phải hai: gộp `2` vào `0` là để **một bản sao chưa được kiểm được chấm là đã
kiểm** — đúng lớp lỗi cả D-090 lẫn lệnh này sinh ra để chặn.

*(Hai lệnh rời ở Bước 2 và Bước 3 vẫn đúng và vẫn giữ — dùng khi cần đọc kỹ từng vế, hoặc khi
muốn tự tay đối chiếu. Nhưng đường mặc định là lệnh trên.)*

---

## 2. Chạy — bốn bước

### Bước 1 — lấy bản thứ hai ra, **KHÔNG chép đè lên máy dev**

Khôi phục bản anh tự cất vào **một thư mục tạm**, ví dụ `D:\tam-o1\`. Ba tệp cần có:
`keys.txt` · `allocation.md` · `genesis.json`.

🔴 **Không chép vào `C:\Users\abc\9chain-a1-keys\`.** Chép đè là biến hai bản thành một bản, và
xoá mất đúng thứ đang cần đo.

> **Nếu bước này không làm được** — không tìm thấy, không mở được, không nhớ để đâu — thì
> **dừng ở đây và nói ra**. Đó chính là câu trả lời cần biết **trước** ngày G, và biết hôm nay
> thì còn 4 ngày để dựng bản thứ hai cho tử tế.

### Bước 2 — khoá có suy ra đúng địa chỉ không

```bash
docker run --rm -v "C:/PROJECTS/9Chain-A1/upstream/avalanchego:/src" -v "D:/tam-o1:/keys:ro" -v 9chain-gomod:/go/pkg/mod -w /src golang:1.25.10 sh -c "go run ./9chain-a1-tools/check-keys -allocation /keys/allocation.md /keys/keys.txt"
```

**Đạt** = `✓ 6/6 quỹ khôi phục đúng` **và** `✓ đối chiếu chéo: 6 địa chỉ … đều có khoá`.

⚠️ **Chạy trong Git Bash thì phải thêm `MSYS_NO_PATHCONV=1` ở đầu dòng** — nếu không, Git Bash
dịch `/src` thành `C:/Program Files/Git/src` và docker từ chối với *"working directory … is
invalid"*. PowerShell và cmd không dính. *(Đã mất một lượt vì cái này.)*
⚠️ Lượt đầu tải phụ thuộc Go mất vài phút; volume `9chain-gomod` giữ lại cho lượt sau.

⚠️ Nếu nó in `⚠️ networkID … KHÔNG thuộc băng 9Chain-A1` thì **đọc kỹ dòng đó** — gần như chắc
chắn anh đang cầm bộ của thế hệ khác, dù câu cuối vẫn xanh. Bước 3 sẽ chặn.

### Bước 3 — những địa chỉ đó có giữ tiền thật không

```bash
node scripts/check-keys-on-chain.mjs D:/tam-o1/allocation.md
```

**Đạt** = `✓ 6/6 quỹ khớp CHAIN ĐANG CHẠY`, mã thoát `0`.

**Đỏ** = bất kỳ dòng `🔴` nào. Ý nghĩa từng loại:

| Dòng đỏ | Nghĩa |
|---|---|
| `networkID lệch` | 🔴 **bộ khoá của THẾ HỆ KHÁC** — bản thứ hai này vô giá trị, khoá thật vẫn một bản |
| `C-Chain@block0 … đo 0` | địa chỉ đó không có trong genesis đang chạy — sai bộ, hoặc tệp bị sửa |
| `khoá khai X · đo Y` | số khoá không khớp — sai bộ, hoặc `allocation.md` bị sửa |
| `ô Tổng tự mâu thuẫn` | `allocation.md` tự mâu thuẫn — tệp bị sửa tay |

### Bước 4 — cất lại, và xoá bản tạm

```bash
# Windows: xoá thư mục tạm sau khi kiểm xong
Remove-Item -Recurse -Force D:\tam-o1
```

---

## 3. Ngày G `01/09` — chạy lại **trong ngày**, lúc còn nhớ

Ngày G sinh khoá mới ⇒ **bộ khoá vừa kiểm hôm nay trở thành rác**, và bản thứ hai phải làm lại
từ đầu cho bộ `g1`. Đây là chỗ dễ trượt nhất: quy trình đã tập, đã đạt, rồi không ai chạy lại.

**Ba việc, cùng ngày:**

1. Chép bộ khoá `g1` ra **hai nơi khác nhau về vật lý** — không phải hai thư mục cùng một ổ.
2. Chạy **bước 2 + bước 3** trên **bản thứ hai** (không phải bản gốc — bản gốc chắc chắn đúng,
   kiểm nó không nói gì về bản sao).
3. Xoá khoá khỏi server bằng `shred -u -n 3`, rồi đối chứng `find ~/9chain-a1 -name keys.txt`
   ⇒ phải ra **0** (đúng quy trình D-085 đã chạy cho g0).

⚠️ **Bước 3 đọc `networkID` từ chain đang chạy** — sau ngày G nó là `999999998` (thế hệ `g1`).
Bộ `g0` cầm sang mà chạy sẽ **đỏ đúng**, không phải lỗi.

---

## 4. Điều kiện qua của GO/NO-GO (§7 điều 6)

> *"O1 — custody đã chốt **và đã diễn tập trọn ít nhất một lượt bằng phương tiện thật**"*

| | Trạng thái `2026-08-28` |
|---|---|
| Sơ đồ đã chốt | ✅ D-044 |
| Khoá đã rời server | ✅ D-085, `shred -u`, đối chứng `find` ra 0 |
| Có công cụ kiểm, **và công cụ đó phân biệt được bản chết** | ✅ D-090 — 5/5 đối chứng ngược đỏ |
| Bộ khoá trên máy dev **giữ tiền thật trên chain** | ✅ 6/6, đo `28/08` |
| 🔴 **Bản sao thứ hai tồn tại và khôi phục được** | 🔴 **CHƯA — chỉ David làm được, §2 bước 1** |

⇒ **O1 chưa ĐẠT.** Còn đúng một việc, và nó không phải việc mã.
