# QUY TRÌNH O2 — XUẤT + BĂM MẠNG SẮP CHẾT, **CÔNG BỐ TRƯỚC KHI XOÁ**

> Mốc A-2 của đợt autopilot 14. Chạy thử `2026-08-27` trên mạng tập — **đạt, 3 ca đối chứng
> ngược đỏ đúng chỗ.** Bài: [`scripts/export-chain.mjs`](../scripts/export-chain.mjs).

---

## 0. Vì sao — đây là việc đã BỎ LỠ một lần

Lượt re-genesis `2026-08-26` xoá chain data 9 node **và** DB Blockscout, **không có bản công
bố nào**. Hậu quả cụ thể, không phải giả thuyết: khi 9Scan-A1 hỏi *"20M/70M có thật trên chuỗi
cũ không"*, câu trả lời đúng là **không còn kiểm lại được** — và sẽ mãi mãi như thế.

Ngày G `01/09` xoá một mạng nữa. Lần này phải có vật chứng.

---

## 1. 🔴 Nó KHÔNG phải bản sao lưu

**Bộ xuất này không khôi phục lại được mạng.** Không LevelDB, không staker key, không dựng
lại node từ nó. Nó là **vật chứng**: một bộ byte + một con số để sau này bất kỳ ai cũng chứng
minh được *"chuỗi cũ đúng là như thế này"*.

Đừng khai mạnh hơn thế. H-6b đã trả giá một lần cho việc một bản "backup" tự khai *"is okay"*
trong khi clone ngược chết ngay — và bài học ở đó là **phép đo đúng, chứ không phải lời khai**.

---

## 2. Ba bước — đúng thứ tự này, không đảo

```
1) XUẤT   (mạng còn sống, node còn trả lời RPC)
2) CÔNG BỐ con số ra chỗ NGOÀI bộ xuất
3) rồi mới XOÁ
```

🔴 **Thứ tự là toàn bộ giá trị của quy trình.** Công bố sau khi xoá thì con số chỉ chứng minh
"tôi có một thư mục" — không ai phân biệt được nó với một thư mục dựng lại sau đó.

### Bước 1 — xuất

```bash
node scripts/export-chain.mjs \
  --rpc http://127.0.0.1:9650 \
  --ra  ~/9chain-a1/xuat-truoc-ngay-G-20260901 \
  --tep local-net/net-public/genesis.json \
  --tep docs/ALLOCATION-PUBLIC.md \
  --tep <đường dẫn>/console-chains.json \
  --them-evm <tên L1>=<blockchainID>          # lặp lại cho TỪNG L1 còn sống
```

| Cờ | Vì sao có mặt |
|---|---|
| `--tep …/genesis.json` | tệp **định nghĩa** chuỗi. Thiếu nó thì mọi block trong bộ xuất không neo vào đâu |
| `--tep …/console-chains.json` | **sổ chống phát lại** (§5c `NGAY-G-A1-CON-LAI`). 46 bản ghi cũ đã mất một lần rồi vì không ai xuất nó |
| `--them-evm` | 🔴 **KHÔNG có cờ này thì bộ xuất chỉ có P/X/C của mạng chính — mọi L1 người dùng biến mất không dấu vết.** Lấy danh sách từ `console-chains.json` hoặc `platform.getBlockchains` |

### Bước 2 — công bố

Bài in ra một dòng:

```
sha256(MANIFEST.txt) = <64 hex>
```

**Công bố = đưa con số đó ra chỗ NGOÀI thư mục nó bảo vệ.** Ít nhất một trong:
- commit vào git repo này (rẻ nhất, có dấu thời gian, có bản thứ hai trên server qua H-6b);
- đăng lên trang công khai;
- nhắn cho một người khác.

🔴 **Để nó nằm cạnh dữ liệu nó bảo vệ thì nó không bảo vệ gì cả** — ai sửa được dữ liệu thì
cũng sửa được nó. Đây chính là ca đối chứng ngược số 2 dưới đây.

### Bước 2b — 🔴 LƯU SỔ CONSOLE VÀO REPO (D-086)

```bash
cp <net>/../9chain-a1-config/console-chains.json \
   docs/archive/console-chains-pre-<the-he>-<ngay>.json
node scripts/sinh-chainid-da-cap.mjs --ghi     # gộp lại danh sách chặn
node local-net/console/chainid-test.mjs         # phải vẫn xanh
```

**Vì sao đứng ở đây, giữa "công bố" và "`down -v`":** `console-chains.json` **bị xoá sạch** ở
lượt sinh lại, và cùng với nó là mọi `chainId`/**tên** A1 đã phát cho người dùng. Đo `27/08`
sau lượt g0: sổ đang chạy đúng **27 byte**. Không lưu trước khi xoá là **mất vĩnh viễn**, và
hệ quả không lộ ra ngay — nó lộ ra lúc một người lạ nhận đúng `chainId` của người cũ, tức là
lúc ví người cũ coi chain mới là cùng một mạng.

⚠️ **Sổ này khác với `GỐC` của bước 2.** Bước 2 công bố *trạng thái chuỗi*; bước này giữ *lời
hứa đã phát ra ngoài*. Làm bước 2 mà quên bước này thì chuỗi cũ được ghi nhận đầy đủ, còn
**người dùng cũ thì không**.

### Bước 3 — rồi mới `down -v`

---

## 3. Kiểm lại — **hai đường, cố ý**

```bash
node scripts/export-chain.mjs --kiem <thư mục>          # đường 1
cd <thư mục> && sha256sum -c MANIFEST.txt              # đường 2 — công cụ chuẩn
                sha256sum MANIFEST.txt                  #          so với GOC.txt
```

`MANIFEST.txt` giữ **đúng khuôn `sha256sum`**, nên kiểm lại được **mà không cần tin bài này**.
Một bộ vật chứng chỉ kiểm được bằng chính công cụ sinh ra nó thì yếu — nó đòi người kiểm tin
đúng thứ đang cần chứng minh.

---

## 4. Nghiệm thu `2026-08-27` (mạng tập, cổng 9750)

| | Kết quả |
|---|---|
| Xuất | **10 tệp · 33.973 byte** — P/X block thô (hex), C-Chain 7 block đã diễn giải kèm giao dịch, `info.json`, genesis + bảng phân bổ kèm theo |
| Gốc | `081d2550a78c706c4f1ad483603ca0476962036c392d7c4cf85f552c55c0271a` |
| Kiểm bằng bài | ✅ 10 tệp khớp · 0 lệch · gốc khớp |
| Kiểm bằng `sha256sum -c` | ✅ **10/10 OK**, và `sha256sum MANIFEST.txt` ra đúng `GOC.txt` |

### Ba ca đối chứng ngược — đều ĐỎ đúng chỗ

| # | Phá thế nào | Bắt được ở đâu |
|---|---|---|
| **1** | sửa **1 byte** giữa `c-chain/blocks.jsonl` | `✗ LỆCH BYTE c-chain/blocks.jsonl`, in cả hai hash |
| **2** | 🔴 sửa 1 byte **VÀ sửa luôn MANIFEST cho khớp** | `10 tệp khớp · 0 lệch byte` — **rồi `✗ GỐC LỆCH`**. Đây là ca chứng minh vì sao bước 2 (công bố ra ngoài) là bắt buộc: kẻ sửa được cả hai vẫn không sửa được con số đã nằm ở chỗ khác |
| **3** | xoá hẳn một tệp | `✗ THIẾU TỆP p-chain/tip.json` |

### 🔴 Và đối chứng ngược bắt một lỗi trong CHÍNH công cụ này

Bản đầu đếm số L1 kèm theo bằng **số L1 được XIN** (`--them-evm`), không phải số **XUẤT ĐƯỢC**.
Chạy với một `blockchainID` không tồn tại: chuỗi đó gọi hỏng, không có một byte nào trong bộ —
mà tờ đầu vẫn khai **"L1 người dùng kèm theo: 1"**.

Tức **công cụ chống nói dối suýt nói dối, ở đúng chỗ nó không được phép.** Nay tờ đầu khai
`xin N · XUẤT ĐƯỢC M` và dán cờ đỏ khi hai số lệch.

---

## 5. Giới hạn — đừng trích mạnh hơn

| | |
|---|---|
| Quy mô | Thử trên **7 block C-Chain**. Bài lấy block **từng cái một** ⇒ chuỗi hàng chục nghìn block sẽ chậm; đo trước, đừng chạy lần đầu vào đúng cửa sổ bảo trì |
| Không có | LevelDB · DB Blockscout · khoá bí mật (cố ý) · trạng thái ví theo thời điểm (suy lại được từ block, bộ này **không** tính hộ) |
| L1 | chỉ vào bộ xuất khi được nêu tên bằng `--them-evm`, **và** node đang track subnet đó. Node không track ⇒ ghi cảnh báo, **không** im lặng bỏ qua |
| Chưa chạy trên mạng công khai | Lượt `27/08` chạy trên mạng tập 1 node. Trước ngày G nên chạy thử **một lượt trên mạng công khai** để biết thời gian thật |
