# CHỮ KHẮC TRONG GENESIS — đọc được cái gì, KHÔNG đọc được cái gì

**Ghi bởi phiên của repo `9Chain-A1`, David uỷ quyền đặt thẳng vào đây — `2026-08-27`.**
Bản gốc bên chúng tôi: `9Chain-A1/docs/requests-from-9scan/2026-08-27-engraving-NOTIFY-9SCAN.md`.

> **Không phải báo lỗi, không chặn việc gì của các bạn hôm nay.** Đây là một ràng buộc kỹ
> thuật các bạn sẽ đâm vào ở ngày G nếu không biết trước — và nó nằm ở phía chúng tôi, không
> phải phía các bạn.

---

## 1. 🔴 Việc kế hoạch giao cho các bạn KHÔNG làm được theo cách nó viết

`9Chain-A1/PLAN-REGENESIS-2026-09-01.md` (§G5f, hệ quả #1) giao:

> *"gửi yêu cầu qua `docs/requests-from-9scan/` để **9Scan-A1 phơi nội dung `Message` của
> P-Chain genesis ra một trang công khai**, kèm `sha256`."*

**Các bạn không đọc được `Message` từ chain.** Chúng tôi đã soi cả cây nguồn avalanchego:

| Đo | Kết quả |
|---|---|
| `Message` được ĐỌC ở đâu trong avalanchego | **không chỗ nào** — chỉ có 4 chỗ GHI (`genesis/config.go:115`, `genesis/genesis.go:457`, `genesis/unparsed_config.go:110`, `vms/platformvm/genesis/genesis.go:207`) |
| `platformvm` có API `getGenesis` không | **không có** |
| `Message` có vào P-Chain state không | **không** |

⇒ Nó là **trường CHỈ GHI**: serialize vào genesis blob, không bao giờ đọc lại. Đi tìm một
endpoint trả `Message` là đi tìm thứ không tồn tại.

## 2. Nhưng có một mỏ neo CHẶT HƠN cả đọc thẳng

`vms/platformvm/state/state.go:2382`:

```go
genesisID := hashing.ComputeHash256Array(genesisBytes)
genesisBlock, _ := block.NewApricotCommitBlock(genesisID, 0 /*height*/)
```

⇒ **`parentID` của block 0 trên P-Chain chính là `sha256` của TOÀN BỘ genesis blob**, mà blob
đó chứa `Message`. Đổi một byte của bất kỳ tài liệu nào ⇒ `parentID` đổi.

```bash
curl -s -X POST -H 'content-type:application/json' \
  --data '{"jsonrpc":"2.0","id":1,"method":"platform.getBlockByHeight","params":{"height":0,"encoding":"json"}}' \
  https://rpc-a1.9chain.org/ext/bc/P
```

Đo trên **mạng công khai hiện tại**, `2026-08-27`:

```json
{"block":{"parentID":"Xdexi2dQEREf2CAP2BtxCE4YC9kLuQNzpVSmbHb5U9cmSuigR","height":0,
          "id":"z4tHhrargURjDKBMDXeRogbk5wF7sWY5bjdmNkVWycLh37Vrn"}}
```

Chúng tôi đã đối chứng: `sha256` của genesis blob dựng từ `local-net/net-public/genesis.json`
ra **đúng chuỗi đó**. Và ba ca đối chứng ngược (genesis bộ dev-local, genesis mạng thử) đều
**lệch** — nên phép đo phân biệt được, không phải khớp với mọi thứ.

## 3. ⇒ Thiết kế đúng cho trang của các bạn

**Bản văn lấy từ TỆP genesis; ràng buộc tệp↔chain thì chứng minh TRÊN CHAIN.**

Điều này **không vi phạm luật cứng #2 của các bạn** (*"số công bố phải đọc từ chain thật"*) —
miễn là nói thẳng:

> Bản văn đọc từ tệp genesis công khai. Tệp đó đúng là tệp đã sinh ra mạng này:
> `sha256(genesisBytes)` = `parentID` của block 0 trên P-Chain — bấm để tự kiểm.

Cái **sai** là để người đọc tưởng bản văn được đọc ra từ chain. Cái **đúng** là hiển thị
thêm một ô ✓/✗ so `parentID`. Ô đó mạnh hơn "đọc thẳng": nó chứng minh **mạng đang chạy được
sinh ra từ đúng tệp kia**, chứ không chỉ "tệp có chữ".

## 4. C-Chain thì ĐỌC THẲNG ĐƯỢC — và đó là mặt dành cho người dùng

David chốt `26/08`: **P-Chain mang bản Hebrew nguyên ngữ (gốc), C-Chain mang bản tiếng Anh
(hiện tại phổ biến)**. Mặt C-Chain đọc bằng RPC thường:

| Đọc gì | Bằng lệnh |
|---|---|
| bản văn tiếng Anh | `eth_getCode(<địa chỉ hợp đồng dữ liệu>, "latest")` |
| con dấu | `eth_getBlockByNumber("0x0", false)` → `extraData` = `sha256(payload)`, **đúng 32 byte** |

Mã hợp đồng mở đầu bằng opcode `STOP` (`0x00`) rồi tới byte thô ⇒ **không chạy được, chỉ để
đọc**. Bỏ 1 byte đầu là ra payload.

🔴 **ĐỪNG CẮM CỨNG ĐỊA CHỈ.** Nó chưa được chọn — David phải chốt, và nó khắc vĩnh viễn.
Cách tìm không cần biết trước: **quét `alloc` của C-Chain genesis, lấy mục duy nhất có khoá
`code`**. Công cụ của chúng tôi làm đúng vậy, chính vì một tham số phải gõ tay là một chỗ gõ sai.

## 5. Khuôn dữ liệu để các bạn phân tích

Cả hai mặt dùng **cùng một JSON chính tắc**:

```json
{"v":1,"chain":"9Chain-A1","surface":"p","docs":[{"id":"…","lang":"he","text":"…"}]}
```

- `surface` là `"p"` (P-Chain, trọn bộ) hoặc `"c"` (C-Chain, các tài liệu bản tiếng Anh).
- Thứ tự `docs` **cố định**, đi vào vân tay bộ ⇒ đừng sắp xếp lại khi hiển thị.
- **`sha256` của một tài liệu = `sha256` của byte UTF-8 của `text`** — và nó bằng `sha256` của
  **tệp gốc**, tức cùng đại lượng với bản đóng băng của C1. Đó là điều làm cho việc đối chiếu
  chéo A1↔C1 có nghĩa.
- 🔴 **Chúng tôi CỐ Ý không nhét `sha256` vào JSON.** Nó dẫn xuất được từ `text`; giữ một giá
  trị dẫn xuất cạnh nguồn của nó là đẻ ra nguồn sự thật thứ hai. **Các bạn tự băm lại** — và
  đó cũng là phép kiểm của các bạn với chúng tôi.
- Cùng một `id` xuất hiện ở cả hai mặt thì **phải cùng byte**. Lệch = có lỗi ở phía chúng tôi,
  báo ngay.

## 6. Hôm nay chưa có gì để hiển thị — và đó là trạng thái ĐÚNG

Mạng công khai hiện tại **chưa khắc chữ**:

| | |
|---|---|
| `Message` | `"9Chain-A1 sovereign genesis"` (chuỗi thường, không phải JSON) |
| `extraData` của block 0 C-Chain | `0x00` |
| alloc có `code` | không có |

Chữ khắc **đến ở ngày G `2026-09-01`**. ⇒ Trang của các bạn phải coi *"chưa khắc"* là **trạng
thái hợp lệ**, không phải lỗi — y như bài học `admin` thiếu ở danh bạ L1. Công cụ của chúng
tôi làm đúng thế: chưa khắc thì nó nói *"CHƯA KHẮC CHỮ"* và **vẫn chạy phép đo mỏ neo**.

⚠️ Và nhớ: `01/09` mạng **sinh lại lần nữa** ⇒ `parentID` block 0 sẽ đổi. Đừng đóng băng
chuỗi `Xdexi2dQ…` vào mã; đọc tươi mỗi lần.

## 7. Công cụ đối chứng, dùng chung được

`9Chain-A1/9chain-a1-tools/engrave-verify` — một lệnh, đi từ tệp genesis **và** từ chain thật
rồi đối chiếu. Nghiệm thu `27/08` trên một mạng tập 3 node dựng thật: **17 đạt / 0 hỏng**;
ba ca đối chứng ngược đều đỏ đúng chỗ.

```bash
go run ./9chain-a1-tools/engrave-verify \
  --genesis <genesis.json> --rpc https://rpc-a1.9chain.org [--checksums <bản đóng băng C1>]
```

Cách dùng đầy đủ: `9Chain-A1/docs/GDAY-ENGRAVING.md`.

⚠️ **Mức tin cậy, nói rõ để các bạn không trích mạnh hơn:** cơ chế đã nghiệm thu bằng một bộ
tài liệu **THỬ**, không phải byte thật. Nội dung thật còn chờ C1 đóng băng byte trước (thứ tự
bắt buộc: C1 sinh bản chính tắc → A1 lấy đúng byte → A1 khắc; không gõ lại hai lần).

## 8. Chúng tôi xin gì ở các bạn

1. **Xác nhận đã đọc**, và nói giúp: thiết kế ở §3 có đủ cho luật cứng #2 của các bạn không,
   hay các bạn cần thứ khác từ phía node.
2. Nếu cần **endpoint mới trên node** để trang chạy đẹp — ghi vào `KICKOFF.md` của các bạn rồi
   báo sang, đúng quy trình cũ. Chúng tôi làm được, nhưng phải biết trước ngày G.
3. **Đừng cắm cứng** địa chỉ hợp đồng dữ liệu và `parentID` (§4, §6).
