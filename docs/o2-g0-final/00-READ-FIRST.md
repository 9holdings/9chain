# Bộ xuất mạng trước khi xoá — quy trình O2

Mạng: **9chain-a1-g0** (networkID 999999999) ·
node `9chaingo/1.14.2` · C-Chain chainId **9000000009**
L1 người dùng: **xin 2 · XUẤT ĐƯỢC 2**

## Kiểm lại bộ này

```bash
node scripts/export-chain.mjs --check <thư mục này>
# hoặc, KHÔNG cần tin bài trên, bằng công cụ chuẩn:
cd <thư mục này> && sha256sum -c MANIFEST.txt && sha256sum MANIFEST.txt
```

Con số phải công bố là **`ROOT.txt`** — `sha256` của `MANIFEST.txt`. Nó neo toàn bộ phần
còn lại, nên công bố một dòng đó là đủ.

## 🔴 Bộ này KHÔNG chứa

- **Không khôi phục lại được mạng.** Đây là **vật chứng**, không phải bản sao lưu.
  Không có LevelDB, không có staker key, không dựng lại node từ đây được.
- **Không có khoá bí mật nào** — cố ý.
- **Không có DB Blockscout** (chỉ số phái sinh; nguồn gốc là block, đã có ở đây).
- **Không có trạng thái ví ở từng thời điểm** — chỉ có block. Số dư suy lại được từ block,
  nhưng phải tự dựng lại, bộ này không tính hộ.

## 🔴 `GỐC` neo một THỜI ĐIỂM, không neo một chuỗi

**Hai lượt xuất cùng một mạng KHÔNG bao giờ ra cùng `GỐC`** — kể cả khi mạng không đẻ thêm
block nào. Đo được: hai lượt cách nhau vài phút trên mạng công khai `2026-08-27` ra hai
`GỐC` khác nhau, khác nhau **duy nhất** ở `p-chain/tip.json`, và trong đó **duy nhất** ở
trường `uptime` của validator (`99.8756` → `99.8758`).

`uptime` là số đo **trôi liên tục**, và sâu hơn: **nó không phải thuộc tính của chuỗi** — nó
là *ý kiến của node đang được hỏi* về các peer của nó, nên hỏi node khác sẽ ra số khác.

**Nghĩa là gì, đọc cho đúng:**
- `GỐC` chứng minh *"đây đúng là bộ byte tôi lấy lúc T"* — nó **có** chống được sửa đổi sau
  khi xuất (đã đối chứng ngược: sửa 1 byte ⇒ đỏ; sửa cả MANIFEST để che ⇒ `GỐC` vẫn đỏ).
- Nó **không** chứng minh *"chuỗi lúc đó là như thế này và ai xuất cũng ra thế"*. Hai người
  xuất cùng lúc sẽ ra hai `GỐC` khác nhau, và **cả hai đều đúng**.
- ⇒ Thấy hai `GỐC` lệch thì **đừng kết luận có người sửa**. So từng tệp trước; nếu chỉ lệch
  ở `tip.json` thì đó là chuyện bình thường.


