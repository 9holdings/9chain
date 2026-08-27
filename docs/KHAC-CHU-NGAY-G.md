# KHẮC CHỮ VÀO GENESIS — cách dùng

> Cơ chế: `9chain-a1-tools/netgen/engrave.go`. Quyết định gốc: `PLAN-REGENESIS-2026-09-01.md`
> §G5f/§G5h. Còn lại gì cho ngày G: [`NGAY-G-A1-CON-LAI.md`](NGAY-G-A1-CON-LAI.md).

## Mặc định là KHÔNG khắc

Không đặt `A1_ENGRAVE` thì netgen sinh mạng y như cũ: `Message` giữ chuỗi
`"9Chain-A1 sovereign genesis"`, `extraData` giữ `"0x00"`. **Mọi lượt tập đi đường này.**

🔴 **Đây là cổng "bản tập ≠ bản thật" của A1.** C1 phân biệt bằng `genesisTime` mang mốc
thiêng — **A1 không dùng được cách đó**, vì `netgen/main.go` đặt `StartTime: now-60`, luôn
động. Nên dấu phân biệt của A1 là **chính việc có khắc hay không**, cộng một cờ xác nhận
phải khớp vân tay nội dung. netgen **luôn in ra** mình có khắc hay không, kể cả khi không —
im lặng ở đó là cách một lượt thật đi qua mà không ai nhận ra nó thiếu chữ khắc.

## Hai mặt khắc

| Mặt | Ở đâu | Mang gì | Ai đọc |
|---|---|---|---|
| **P-Chain** | trường `Message` của P-Chain genesis | **trọn bộ** tài liệu, gồm bản Hebrew nguyên ngữ | `platform.getGenesis`; 9Scan-A1 phơi ra trang công khai |
| **C-Chain** | hợp đồng dữ liệu ở địa chỉ cố định + `extraData` | các tài liệu khai mặt `"c"` (bản tiếng Anh) | `eth_getCode` — ai cũng đọc |

P-Chain là **gốc**, không phải "một trong ba chỗ": `genesis/genesis.go:441-446` cho thấy
X-Chain và C-Chain nằm trong mảng `chains` được truyền **vào** `pChainGenesis`.
X-Chain **không khắc** — trường `Message` cấp UTXO ở đó đã bị dùng để mang địa chỉ ETH.

## Manifest

```json
{
  "version": 1,
  "source": "9Chain-C1 PAPER/ freeze <ngày>",
  "cChainAddress": "0x0000000000000000000000000000000000000909",
  "docs": [
    {"id":"genesis-1-1-he", "lang":"he", "file":"docs/gen11-he.txt",      "on":["p"]},
    {"id":"genesis-1-1-en", "lang":"en", "file":"docs/gen11-en.txt",      "on":["p","c"]},
    {"id":"love-paper-en",  "lang":"en", "file":"docs/love-paper-en.txt", "on":["p","c"]},
    {"id":"dedication-adam","lang":"en", "file":"docs/adam.txt",          "on":["p","c"]}
  ]
}
```

- `file` là đường dẫn **tương đối so với chính tệp manifest**.
- **Thứ tự trong `docs` là thứ tự khắc**, và nó đi vào vân tay ⇒ đảo thứ tự là đổi vân tay.
- `id` phải duy nhất — trùng id là người kiểm không biết hash nào ứng với tài liệu nào.
- Khoá lạ trong manifest ⇒ **lỗi**, không bỏ qua im lặng (một khoá đánh máy sai bị bỏ qua
  nghĩa là một tài liệu không được khắc mà không ai biết).

### Chọn `cChainAddress`

Khắc **vĩnh viễn** ⇒ phải là lựa chọn có ý thức của David, netgen cố ý **không có mặc định**.
netgen từ chối hai vùng:

| Vùng | Vì sao |
|---|---|
| `0x0000…0000` | nhiều công cụ coi là "chưa đặt"; cũng là giá trị một trường bỏ trống vô tình sẽ mang |
| `< 0x100` | precompile kinh điển của EVM. EVM ưu tiên precompile ⇒ bản văn **không đọc ra được** |

⚠️ **Vùng riêng của Avalanche (`0x0200…` trở lên) netgen KHÔNG chặn** — đó là precompile có
trạng thái của coreth/subnet-evm và danh sách của nó đổi theo phiên bản; chặn cứng một danh
sách sẽ trôi lệch. **Người chọn địa chỉ phải tự tránh.**

## Chạy

```bash
A1_NET_DIR=local-net/net-public \
A1_ENGRAVE=/duong/dan/manifest.json \
A1_ENGRAVE_CHECKSUMS=/duong/dan/CHECKSUMS-FREEZE-cua-C1.txt \
bash local-net/gen-network.sh 9
```

Lượt đầu **luôn bị từ chối** — netgen in bảng hash từng tài liệu + vân tay bộ, rồi dừng.
Đối chiếu từng dòng với bản đóng băng của C1, **rồi mới** chạy lại kèm:

```bash
A1_ENGRAVE_CONFIRM=<vân tay netgen vừa in>
```

| Biến | Bắt buộc | Vai trò |
|---|---|---|
| `A1_ENGRAVE` | — | đường dẫn manifest. Không đặt = không khắc |
| `A1_ENGRAVE_CONFIRM` | **có**, khi đã bật khắc | vân tay bộ tài liệu. Lệch ⇒ từ chối sinh mạng |
| `A1_ENGRAVE_CHECKSUMS` | nên có ở lượt thật | bản đóng băng của C1. Thiếu ⇒ chỉ cảnh báo |

Kết quả kèm theo: **`engraving.md`** trong thư mục ra — bảng công khai (không có bí mật) để
đối chiếu chéo với C1 và để 9Scan-A1 phơi ra.

## 🔴 Ba luật cứng — vi phạm cái nào cũng hỏng VĨNH VIỄN

**1. Byte lấy từ C1, KHÔNG gõ lại.** Thứ tự thi hành bắt buộc:

```
C1 sinh bản chính tắc + đóng băng CHECKSUMS  ──►  A1 lấy ĐÚNG BYTE  ──►  A1 khắc
```

Dấu chấm cuối câu, kiểu nháy, BOM, CRLF, niqqud có hay không — mỗi thứ đổi một byte là đổi
cả `sha256`, và số đó nằm trong genesis không sửa được. netgen đọc **byte thô**: không trim,
không đổi xuống dòng, không thêm newline cuối. Có BOM thì nó **cảnh báo chứ không tự gỡ** —
gỡ hộ là làm lệch hash so với bản C1.

**2. `sha256` băm BYTE CỦA TỆP**, không băm chuỗi đã escape trong JSON. Đó là cùng một đại
lượng C1 đóng băng, nên đối chiếu chéo hai chain mới có nghĩa.

**3. KHÔNG sửa tay genesis đã sinh** (`local-net/net*/genesis.json`). C-Chain genesis nằm trong
đó dưới dạng **chuỗi JSON đã escape** trên một dòng. Thêm `alloc` mang toàn văn tài liệu là một
dòng escape rất dài — sửa tay là hỏng escape, và không ai thấy cho tới lúc node boot.

> ⚠️ **Bản trước của mục này ghi `9chain-a1-config/genesis.json`. Sai, và tệp đó đã xoá `27/08`.**
> `netgen` **không đọc tệp cấu hình nào** — nó dựng `genesis.UnparsedConfig` thẳng trong Go. Tệp
> kia là `genesis_local.json` gốc của Avalanche còn sót trong đường boot của node dev.
> Xem [`CORE-AUDIT-2026-08-27.md`](CORE-AUDIT-2026-08-27.md) §7b.

## Đọc ngược — `engrave-verify`

`engraving.md` là thứ netgen **tự nói về mình**. `9chain-a1-tools/engrave-verify` đi đường
ngược lại — từ tệp genesis và từ **chain thật** — rồi đối chiếu. Hai đường gặp nhau mới là
bằng chứng.

```bash
docker run --rm --network host -v /c/PROJECTS/9Chain-A1/upstream/avalanchego:/src:ro -w /src \
  -e GOWORK=off golang:1.25.10-bookworm \
  go run ./9chain-a1-tools/engrave-verify \
    --genesis <genesis.json> --rpc https://rpc-a1.9chain.org --checksums <CHECKSUMS cua C1>
```

Không khai `--rpc` thì nó **nói rõ là chưa chạm vào mạng nào**. Chưa khắc chữ **không phải
lỗi** (đó là trạng thái của mọi bản tập) — mục [2][3][4] báo "bỏ qua", mục [5] vẫn chạy.

### 🔴 Mỏ neo: vì sao đọc được chữ khắc P-Chain từ node đang chạy

**Trường `Message` là trường CHỈ GHI.** Đã soi cả cây nguồn: nó được serialize vào genesis
blob nhưng **không chỗ nào đọc lại**, và `platformvm` **không có API `getGenesis`**. Nên
*"đọc `Message` từ chain"* theo nghĩa đen là **không làm được** — ai hứa điều đó là chưa đo.

> ⚠️ Hệ quả cho **9Scan-A1**: `PLAN-REGENESIS` đề xuất họ *"phơi nội dung `Message` của
> P-Chain genesis ra một trang công khai"*. Họ **không đọc được từ chain** — phải đọc từ tệp
> genesis, và nói rõ nguồn là tệp. Việc này cần báo sang cho họ.

Nhưng `state.go:2382` cho một đường vòng **chặt hơn cả đọc thẳng**:

```go
genesisID := hashing.ComputeHash256Array(genesisBytes)
genesisBlock, _ := block.NewApricotCommitBlock(genesisID, 0 /*height*/)
```

⇒ **`parentID` của block 0 trên P-Chain chính là `sha256` của toàn bộ genesis blob**, mà blob
chứa `Message`. Đổi một byte của bất kỳ tài liệu nào ⇒ `parentID` đổi. Đọc bằng
`platform.getBlockByHeight(0)`.

Nó **mạnh hơn** đọc thẳng: đọc thẳng chỉ chứng minh *"tệp có chữ"*; cái này chứng minh
**mạng đang chạy được sinh ra từ đúng tệp đó**.

### Nghiệm thu `2026-08-26/27`

Mạng tập 3 node dựng thật (image `:drill9`, dải `172.31.0.0/16` để không đâm vào `net_a1net`
của faucet), genesis có khắc chữ:

| | |
|---|---|
| **17 đạt · 0 hỏng trên CHAIN SỐNG** | |
| block 0 P-Chain: `parentID == sha256(genesisBytes)` | khớp |
| `eth_getCode` trả về hợp đồng dữ liệu | 332 byte |
| bản văn **trên MẠNG** == bản văn **trong TỆP** | khớp |
| `extraData` trên mạng == trong tệp | khớp |
| P-Chain và C-Chain cùng byte cho cùng tài liệu | 3/3 |
| đối chiếu bản đóng băng của C1 | 4/4 |

**Đối chứng ngược — phép đo có phân biệt được không:**

| Ca | Kết quả |
|---|---|
| genesis bộ **dev local** đo vào mạng **công khai** | **ĐỎ** đúng chỗ |
| genesis mạng thử đo vào mạng công khai | **ĐỎ** đúng chỗ |
| mạng công khai thật (chưa khắc) | nói rõ *"CHƯA KHẮC CHỮ"*, mỏ neo vẫn khớp — 2 đạt/0 hỏng |

Ca đầu tiện thể bắt luôn cái bẫy **"hai bộ mạng"** đã làm 9Scan kết luận sai — nay nó là một
**phép đo cơ học**, không còn là một luật phải nhớ.

## Kiểm bằng tay — đừng tin `engraving.md`

Mã hợp đồng mở đầu bằng opcode `STOP` (`0x00`) rồi tới byte thô ⇒ không chạy được, chỉ để đọc.
Bỏ 1 byte đầu là ra JSON; giải escape `text` rồi băm lại phải ra đúng cột `sha256`:

```bash
cast code <cChainAddress> --rpc-url https://rpc-a1.9chain.org/ext/bc/C/rpc | cut -c5- | xxd -r -p | sha256sum
```

## Đã nghiệm thu `2026-08-26` (bộ tài liệu THỬ, không phải byte thật của C1)

| Bài | Kết quả |
|---|---|
| 4 hash netgen báo vs `sha256sum` tính độc lập trên host | **khớp 4/4** |
| đọc ngược `Message` từ `genesis.json`, băm lại từng tài liệu | **khớp 4/4** |
| `eth_getCode` payload: bỏ byte `STOP`, băm lại từng tài liệu | **khớp 3/3** |
| `extraData` = `sha256(payload)`, độ dài | **khớp · đúng 32 byte** |
| Hebrew qua vòng JSON → hex → giải mã | **trùng từng byte** (108 byte) |
| genesis nạp bằng **chính `genesis.FromFile` của node** + `A1Params` | **CHẤP NHẬN**, cả bản khắc lẫn bản không khắc |
| ĐỎ: vân tay lệch sau khi duyệt | **bắt được** |
| ĐỎ: tài liệu gõ lại (C1 không công nhận) | **bắt được** |
| ĐỎ: địa chỉ `0x…0000` · `0x…0001` · `0x…00ff` | **bắt được cả ba** |
| XANH: địa chỉ `0x…0100` · `0x…0909` | **đi qua cổng địa chỉ** |
| không bật khắc | **sinh bình thường**, in rõ `Chu khac: KHONG (ban tap)` |

⚠️ **Một cổng CHƯA nghiệm thu được:** chặn địa chỉ hợp đồng đâm vào địa chỉ một quỹ. Địa chỉ
quỹ sinh **ngẫu nhiên mỗi lượt** ⇒ không dựng được ca đâm từ ngoài (xác suất ~2⁻¹⁶⁰). Cổng vẫn
giữ vì hậu quả là **quỹ mất sạch tiền không dấu hiệu** (trùng khoá JSON, giá trị sau đè giá trị
trước), nhưng phải ghi rõ: **nó chưa từng chạy thật**.

🔴 **Và lượt đo đầu tiên của cổng đó là một CA XANH GIẢ:** nó thoát mã 1 nên trông như "bắt
được", thực ra dừng ở **cổng xác nhận** — vì đổi địa chỉ trong manifest cũng đổi vân tay. Tin
mã thoát mà không đọc *lý do* thoát là ghi nhận một cổng đã chứng minh trong khi nó chưa chạy.
