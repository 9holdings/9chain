# O2 — bộ xuất CUỐI CÙNG của mạng `g0`, trước khi ngày G xoá nó

> Chạy `2026-08-31 17:38Z`, trên **node đang chạy** (`http://127.0.0.1:9650`, không qua Cloudflare).
> Mạng: `9chain-a1-g0` · networkID `999999999` · node `9chaingo/1.14.2`.
> Giờ G xoá mạng này: `2026-09-01 10:09:09Z` (D-136d).

## 🔴 CON SỐ PHẢI CÔNG BỐ

```
sha256(MANIFEST.txt) = 4432d62a2634141a81cf79868db2436e139ea2c72b78e6c26a1db25c5f7e7b63
```

Đó là **một con số neo cả bộ**. `MANIFEST.txt` liệt kê `sha256` từng tệp theo đúng khuôn
`sha256sum`, nên ai cũng kiểm lại được **bằng công cụ chuẩn, không cần tin mã của chúng tôi**:

```bash
cd <bộ-xuất> && sha256sum -c MANIFEST.txt      # từng tệp
sha256sum MANIFEST.txt                          # phải ra đúng con số trên
```

🔴 **Vì sao tệp này nằm ở đây chứ không nằm cạnh dữ liệu:** một con số neo đặt cạnh chính dữ liệu
nó bảo vệ thì **không bảo vệ gì cả** — ai sửa được dữ liệu thì cũng sửa được nó. Bộ byte 1,3 GB
nằm trên máy chủ; con số neo nằm **trong git, đã đẩy lên GitHub**. Đó là toàn bộ giá trị của O2, và
lượt `2026-08-26` mất đúng chỗ này: xoá chain data 9 node **và** DB Blockscout **không có bản công
bố nào**, nên câu hỏi *"20M/70M có thật trên chain cũ không"* nay **vĩnh viễn không trả lời được**.

## Bộ xuất có gì

| Chuỗi | Block | Đủ? | chainId |
|---|--:|---|--:|
| P-Chain | 29 | ✓ | — |
| X-Chain | 5 | ✓ | — |
| C-Chain | **96.173** | ✓ | `9000000009` |
| L1 `Eric1` | 1 | ✓ | `9000000010` |
| L1 `eric1` | 1 | ✓ | `9000000011` |

Kèm theo: `console-chains.json` (sổ danh bạ sống) và `chainid-issued.json` (sổ chặn xuyên thế hệ,
`d1e20037…` — **trùng khít** bản đang chạy trên server và bản trong repo).

**14 tệp · 1.318.041.580 byte.** Bộ đầy đủ: `"$A1_SSH_HOST":~/9chain-a1/o2-export-g0-20260831/`

Thư mục này giữ **phần nhỏ, kiểm lại được**: `MANIFEST.txt`, `ROOT.txt`, `info.json`,
`00-READ-FIRST.md`, và `tip.json` của cả năm chuỗi.

## Nghiệm thu — hai đường độc lập, cả hai đã chạy

| Đường | Kết quả |
|---|---|
| công cụ của dự án (`--check`) | **14/14 tệp khớp · 0 lệch byte · 0 thiếu · gốc khớp**, exit 0 |
| `sha256sum -c MANIFEST.txt` (công cụ chuẩn, **không** tin mã của chúng tôi) | `OK` từng tệp |

## 🔴 CẢNH BÁO: bộ này KHÔNG kiểm lại được trên Windows/macOS mặc định

Bộ xuất chứa **hai thư mục chỉ khác nhau ở HOA–THƯỜNG**: `l1-Eric1/` và `l1-eric1/`. Trên hệ tệp
**không phân biệt hoa thường** (Windows, macOS mặc định) hai cái đó là **một** — chép bộ này về là
**mất lặng một trong hai chuỗi**, và `sha256sum -c` sẽ so nhầm tệp.

⚠️ Đã dính thật khi chuẩn bị chính tệp này: lượt lấy đầu tiên kéo cả hai `tip.json` về máy Windows
và cái thứ hai **đè lên** cái thứ nhất, khiến bảng trông như *"cả hai L1 cùng một `blockchainID`"*.
Đó **không** phải lỗi của bộ xuất — đo lại trên máy chủ thì `l1-Eric1` mang `2vwXkbjs…` và
`l1-eric1` mang `aNqEioiL…`, đúng như phải thế. Lỗi nằm ở **phép lấy về**.

⇒ **Kiểm bộ này trên Linux**, hoặc trên một hệ tệp phân biệt hoa thường. Các tệp trong thư mục này
được đặt tên kèm `chainId` chính vì lý do đó.

> Hai cái tên chỉ khác hoa–thường tồn tại vì một người dùng thật đẻ `Eric1` rồi `eric1` cách nhau
> chín phút trên console công khai ngày `31/08`. Console **nay từ chối** cặp đó (`server.mjs` so
> tên không phân biệt hoa thường), nhưng hai chain đã sinh ra rồi, và **vật chứng thì không viết
> lại được**.

## Bộ này KHÔNG phải cái gì

🔴 **Không phải bản sao lưu khôi phục được.** Nó **không dựng lại được** mạng `g0`. Nó là **vật
chứng**: một bộ byte + một con số để sau này ai cũng chứng minh được *"chuỗi cũ đúng là như thế
này"*. Bản dựng lại được mạng là **H-6b** (`scripts/h6b-backup.sh`), và nó là một thứ khác hẳn.

⚠️ `GỐC` **neo một THỜI ĐIỂM, không neo một CHUỖI**: hai lượt xuất cùng một mạng cách nhau vài
phút, không đẻ thêm block nào, vẫn ra hai `GỐC` khác nhau — vì `uptime` của validator trong
`p-chain/tip.json` trôi liên tục và **không phải thuộc tính của chuỗi**. Thấy hai `GỐC` lệch thì
**đừng kết luận có người sửa**; so từng tệp trước.
