# O1 / B-16 — BẢN SAO THỨ HAI TRÊN **MÁY TÍNH THỨ HAI**

**Cho David. Phương tiện David chốt `2026-08-28`: máy tính thứ hai.**
Quy trình gốc: [`O1-CUSTODY-VERIFICATION.md`](O1-CUSTODY-VERIFICATION.md) · Mục chặn: `BLOCKERS.md` B-16.

---

## 0. Vì sao tệp này tồn tại tách khỏi tệp kia

Tệp kia trả lời *"kiểm bản sao thế nào"*. Tệp này trả lời *"làm sao có bản sao, khi bản sao
nằm trên một cái máy khác"* — và **chỗ đó có ba cái bẫy mà phép kiểm không nhìn thấy**:

1. **Chép được ≠ chép đúng.** Đối chứng `sha256` **trên máy đích**, không phải trên máy nguồn.
2. **Đúng byte ≠ dùng được.** Byte đúng mà máy đích không có công cụ đọc thì tới lúc cần vẫn
   kẹt. Bước 4 nói rõ mức nghiệm thu nào chứng minh điều gì.
3. **Đường chuyển là chỗ khoá rò.** Xem §2 — có một danh sách **cấm**.

---

## 1. Vân tay bộ khoá — bảng đối chứng

Đo `2026-08-28` trên bản gốc `C:\Users\abc\9chain-a1-keys\g0\`:

| tệp | byte | `sha256` |
|---|---:|---|
| `keys.txt` | 3.531 | `e350727a9b36974775f9bf9ff569785bd3ca0c598f5ffc74ef92380a136a280a` |
| `allocation.md` | 2.221 | `654fb72e2bc6659295e2c9c194d682b5d8a484060ede77a55691c3295cd52b08` |
| `genesis.json` | 7.753 | `e1024eabc37205b30a999fae0b06f548510687ace62f98b3b8d88a73cc1eaa29` |

🔴 **Cả ba, không phải một.** `keys.txt` một mình không dựng lại được mạng: `genesis.json` là
thứ mạng boot lên, `allocation.md` là thứ nói mỗi khoá **đáng ra** giữ bao nhiêu — mất nó thì
không còn gì để đối chiếu khi nghi ngờ.

---

## 2. Đường chuyển sang máy thứ hai

**Được** — cáp mạng nội bộ / SMB trong LAN nhà · `scp` qua SSH trong LAN · ổ USB nếu David
có (chép xong **rút ra**, đừng để cắm thường trực: một ổ cắm thường trực là **cùng một máy**,
không phải nơi thứ hai).

🔴 **CẤM, không có ngoại lệ** — mỗi cái ở đây là *"khoá quỹ rời khỏi tầm kiểm soát vĩnh viễn"*:

| Cấm | Vì sao |
|---|---|
| OneDrive / Google Drive / Dropbox / iCloud | Bản sao nằm trên máy người khác, **và** đồng bộ ngược về mọi thiết bị đã đăng nhập. Máy dev **có OneDrive** — đừng chép vào bất kỳ đường nào dưới `C:\Users\abc\OneDrive\` |
| Email / Zalo / Telegram / Messenger | Đi qua máy chủ trung gian và **nằm lại đó**, kể cả sau khi xoá tin |
| Ảnh chụp màn hình trên điện thoại | Điện thoại gần như chắc chắn đang tự sao lưu ảnh lên cloud |
| Dán vào một trợ lý AI (kể cả tôi) | Cùng lý do — nội dung rời khỏi máy |

⚠️ **Tôi (A1) không chép hộ bước này và không được đưa nội dung khoá đi đâu.** Việc của tôi là
đo trước và đo sau.

---

## 3. Chép — **KHÔNG đụng bản gốc**

Trên **máy nguồn**, chép thẳng từ thư mục gốc sang đích (thay `<ĐÍCH>`):

```powershell
Copy-Item 'C:\Users\abc\9chain-a1-keys\g0\*' -Destination '<ĐÍCH>' -Force
```

🔴 **Đừng tạo thêm một thư mục trung chuyển trên `C:` rồi quên xoá.** Mỗi bản sao không ai
nhớ tới là một bản sao không ai canh — đúng thứ B-19 vừa dạy: một thư mục tự khai là *"đồ
chết"* lại đang giữ tiền thật.

🔴 **Đừng chép ngược vào `C:\Users\abc\9chain-a1-keys\`.** Chép đè là biến hai bản thành một
bản, và xoá mất đúng thứ đang cần đo.

---

## 4. Nghiệm thu — ba mức, và mỗi mức chứng minh một thứ KHÁC nhau

### Mức 1 (BẮT BUỘC) — byte tới nơi nguyên vẹn · chạy **trên máy đích**

```powershell
Get-ChildItem '<ĐÍCH>' | ForEach-Object { "{0,-16} {1,6} B  {2}" -f $_.Name, $_.Length, (Get-FileHash $_.FullName -Algorithm SHA256).Hash.ToLower() }
```

Linux/macOS:

```bash
cd <ĐÍCH> && sha256sum keys.txt allocation.md genesis.json && wc -c keys.txt allocation.md genesis.json
```

**Đạt** = cả **ba** dòng khớp bảng §1, cả hash **lẫn** byte.
**Chứng minh:** đường chuyển không làm hỏng gì. **KHÔNG chứng minh** khoá còn giá trị.

### Mức 2 (ĐỦ ĐỂ KHÉP B-16) — khoá chi được tiền của mạng đang chạy

```bash
node scripts/o1-check.mjs <ĐÍCH>
```

`0` ĐẠT · `1` SAI · `2` **CHƯA KẾT LUẬN** (*không biết* **không phải** *đạt*).

Chạy được ở **một trong hai chỗ**, và cả hai đều hợp lệ vì cả hai đo **đúng những byte đang
nằm ở máy đích**:

- **Trên máy đích** — mạnh nhất: chứng minh luôn rằng ở đó có đủ công cụ để dùng bản sao.
  Cần **Docker + Node + Internet**, và cần cây fork (`upstream/avalanchego`, **69 MB**) vì vế 1
  biên dịch `9chain-a1-tools/check-keys` từ đó.
- **Trên máy dev, trỏ vào máy đích qua LAN** — nếu máy đích không có Docker:
  ```bash
  node scripts/o1-check.mjs \\<TÊN-MÁY>\<chia-sẻ>\g0
  ```
  Vẫn đúng: nó đọc byte **ở máy kia**. Chỉ yếu hơn ở chỗ **chưa chứng minh máy kia tự dùng
  được bản sao** — nếu dừng ở đây thì ghi thẳng hạn chế đó ra, đừng chấm là đã kiểm đủ.

### Mức 3 (chỉ khi mức 2 ra `2`) — đọc từng vế

```bash
node scripts/check-keys-on-chain.mjs <ĐÍCH>/allocation.md
```

🔴 **Mã `2` gần như luôn là thiếu công cụ, không phải hỏng khoá.** Đúng ca đã cháy `28/08`:
`o1-check` trỏ vào một gói Go **không còn tồn tại** sau lượt đổi tên, `go run` thoát `1`, và
cổng khai bộ khoá **hoàn toàn đúng** thành *"🔴 SAI — đừng cất nó"*. Nay công cụ phải **tự khai
đã chạy** thì lời phán của nó mới được tin (D-116). Nhưng bài học thì giữ:
**đọc kỹ dòng lý do trước khi tin một chữ SAI về khoá quỹ.**

---

## 5. Sau khi đạt

0. 🔴 **Quét vệt còn sót — trên MÁY NGUỒN:**
   ```bash
   node scripts/check-key-leaks.mjs
   ```
   Phải **exit 0**. Lượt chép nào cũng có thể để lại một bản trung chuyển mà chính người chép
   quên mất: `28/08` tìm ra một bản **trùng byte** nằm trong `%TEMP%` **20 giờ**, ngoài tầm cả
   ba cổng đang có (D-117). Cổng này đỏ **chỉ khi** khoá tìm được **trùng bộ quỹ đang sống**.
1. **Giữ NGUYÊN bản gốc** ở `C:\Users\abc\9chain-a1-keys\g0\`. B-16 hỏi *"có HAI bản không"* —
   di dời không phải sao lưu.
2. Ghi ra giấy/sổ: **máy nào · thư mục nào · ngày nào**. Một bản sao không ai nhớ chỗ là
   không có.
3. Báo lại để tôi đóng B-16 trong `BLOCKERS.md` kèm **số đo thật** — không đóng bằng lời kể.

---

## 6. 🔴 Ngày G `2026-09-01` — phải làm lại TOÀN BỘ

Bộ `g0` này **bị vứt bỏ** ngày G: mạng sinh lại, khoá mới thay hết. Bản sao vừa dựng thành
**rác** cùng ngày.

⇒ Lượt hôm nay là **diễn tập rủi ro bằng không** — hỏng cũng không mất gì. Giá trị của nó
không nằm ở bộ khoá, mà ở chỗ **quy trình đã chạy trót lọt một lần bằng phương tiện thật**,
đúng điều kiện qua của GO/NO-GO §7 điều 6.

Ngày G, ba việc **trong ngày, lúc còn nhớ**:
1. Chép bộ `g1` sang máy thứ hai — **bảng vân tay §1 đổi hết**, sinh lại bảng mới.
2. Chạy lại mức 1 + mức 2 trên **bản sao**, không phải bản gốc.
3. `shred -u -n 3` khoá khỏi server, đối chứng `find ~/9chain-a1 -name keys.txt` ⇒ **0**.

⚠️ Sau ngày G, `networkID` là `999999998`. Bộ `g0` cầm sang chạy sẽ **đỏ đúng**, không phải lỗi.
