# BÁO cho repo `9Scan-A1` — mạng A1 công khai ĐÃ SINH LẠI GENESIS hôm nay

**Từ:** `9Chain-A1` · **Ngày:** 2026-08-26 · **Người quyết:** David (D-036 → D-044)
**Chiều:** đây là **thông báo đi ra**, không phải yêu cầu gửi vào — đặt cùng thư mục
cho khỏi lạc hồ sơ hai bên.

> **TL;DR** — Chuỗi các bạn đang index **không còn tồn tại**. Cấu hình của các bạn
> **không có gì hỏng**: cùng `chainId`, cùng `networkID`, cùng URL RPC. Đó chính là chỗ
> nguy hiểm — không có lỗi nào để bám, chỉ có dữ liệu sai. Phải **xoá index và index
> lại từ block 0**.

---

## 🔴 VÌ SAO CẦN ĐỌC KỸ: KHÔNG CÓ TÍN HIỆU HỎNG NÀO

Ba thứ nhận diện mạng đều **giữ nguyên**:

| | |
|---|---|
| EVM chainId | `9000000009` — **không đổi** |
| networkID | `9001` — **không đổi** |
| RPC | `https://rpc-a1.9chain.org/ext/bc/C/rpc` — **không đổi** |

Nên mọi phép kiểm kiểu "gọi được không / chainId đúng không / HTTP 200 không" đều
**vẫn xanh**, trong khi lịch sử chuỗi đã là một chuỗi khác hoàn toàn. Chiều cao block
tụt về gần 0, mọi hash cũ không tra được, mọi số dư cũ sai.

Đây cùng họ với bài học `caddy-deploy.sh` từng in "✓ 200" trong khi phục vụ nhầm
site: **nghiệm thu phải chạm NỘI DUNG, không chỉ mã trạng thái**.

Chúng tôi đã tự dẫm đúng bẫy này hôm nay: sau khi sinh lại mạng, Blockscout vẫn phục
vụ **115 block / 9.008 giao dịch của chuỗi đã chết**, API trả 200, trang hiển thị bình
thường. Nguyên nhân: `docker compose down -v` **không xoá** DB của nó vì đó là **bind
mount** chứ không phải volume khai trong compose. Nếu 9Scan cũng để dữ liệu ở bind
mount thì `down -v` của các bạn cũng sẽ không xoá gì.

---

## Cái gì đã đổi

| | Trước | Sau |
|---|---|---|
| số validator | **5** | **9** |
| NodeID | 5 ID cũ | **9 ID MỚI, khác hoàn toàn** (bảng dưới) |
| tổng cung (trần) | 720.000.000 LOVE9 | **9.000.000.000 LOVE9** |
| phát hành genesis | 400.000.000 | **5.400.000.000** |
| self-bond mỗi node | 32.000.000 | **999.999** |
| hạn validator | cả 5 cùng `2027-08-24` | **so le 7 ngày**, 2027-07-01 → 2027-08-26 |
| địa chỉ 5 quỹ | — | **đổi hết** (khoá mới) |
| L1 trong danh bạ | 3 sống + 43 đã thu hồi | **0 và 0** |
| chiều cao block C-Chain | ~9.000+ tx | về **0**, đang bắt đầu lại |

### NodeID mới (sắp theo ngày hết hạn)

| NodeID | hết hạn |
|---|---|
| `NodeID-3gB1CPu5ymtwS6fwngNSsfdvaWoD5avxv` | 2027-07-01 |
| `NodeID-D6VXvdfB3gaGPp4G5CySWmToYaeiee1Rm` | 2027-07-08 |
| `NodeID-2wF33ZubCiSi7jpnA4a9BuTaymUL41ZBi` | 2027-07-15 |
| `NodeID-FKE8aTFXVkMUQwhtXhsHHnPor18di3rbr` | 2027-07-22 |
| `NodeID-Mw3p9USZhtigSftsA46131XEtLYKizajc` | 2027-07-29 |
| `NodeID-KQHHsKDDoLT1BEuoDHFiMe3hJq5rUp3Ta` | 2027-08-05 |
| `NodeID-7Beuy95qnN15D14hfQcKHz2cuCua76CJR` | 2027-08-12 |
| `NodeID-KXfRHgP4TrFTCxvk3pChu8uBc5PzQuV9i` | 2027-08-19 |
| `NodeID-Jg64MCeZu6taUh15JZe1KexNKN7ursQw8` | 2027-08-26 |

⚠️ **Hạn so le là CỐ Ý** (D-042): 9 node cùng hết hạn một ngày thì mạng chết im lặng;
so le thì node đầu rụng trở thành **cảnh báo sớm** với 8 node vẫn chạy. Nếu trang của
các bạn hiện "ngày hết hạn" thì **đừng vẽ nó như lỗi cấu hình** — 9 giá trị khác nhau
là đúng thiết kế.

---

## Hợp đồng dữ liệu `console-chains.json` — KHÔNG đổi hình dạng

Các bạn đọc file này ở `components/explorer/chains.tsx`. **Mọi khoá giữ nguyên**
(`chains`, `name`, `chainId`, `blockchainID`, `subnetID`, `rpc`, `retired`, `admin`,
`presetName`). Chỉ có **giá trị** nay là hai mảng rỗng:

```json
{"chains":[],"retired":[]}
```

🔴 **Mảng rỗng là trạng thái HỢP LỆ, không phải lỗi tải.** Trang phải hiện "chưa có L1
nào" chứ không phải spinner vĩnh viễn hay "could not reach". Bản ghi cũ của 46 chainId
đã tiêu nằm ở `docs/archive/console-chains-pre-regenesis-2026-08-26.json` trong repo
chain nếu các bạn cần tra lịch sử.

---

## Việc đề nghị 9Scan làm

1. **Xoá sạch index rồi index lại từ block 0.** Kiểm chỗ để dữ liệu là volume hay bind
   mount trước — xem cảnh báo ở trên.
2. **Bỏ mọi chỗ cắm cứng số 5** (số validator) hoặc NodeID cũ, nếu có.
3. **Bỏ mọi chỗ cắm cứng địa chỉ quỹ.** Bảng địa chỉ mới, công khai được, ở
   `docs/ALLOCATION-PUBLIC.md` của repo chain.
4. **Nghiệm thu bằng nội dung, không bằng mã HTTP** — ví dụ đối chiếu
   `platform.getCurrentValidators` ra đúng 9, và block cao nhất của các bạn khớp
   `eth_blockNumber` của node.

---

## 🔴 QUAN TRỌNG NHẤT: CHUYỆN NÀY SẼ LẶP LẠI NGÀY 01/09/2026

Lượt hôm nay là **DIỄN TẬP**. Ngày G (01/09) mạng **sinh lại lần nữa** — lúc đó mới có
khắc chữ và Block Adam. Nghĩa là:

⇒ **Đừng xử lý lần này như một sự cố một lần.** Hãy làm "xoá index + index lại" thành
một **đường chạy được bằng một lệnh**, có ghi trong runbook của các bạn. Sáu ngày nữa
sẽ cần dùng lại, và lần đó mạng có người ngoài nhìn vào.

Khoá quỹ và NodeID trong tài liệu này **chỉ sống tới ngày G**.

---

## Liên hệ / đối chứng nhanh

```bash
# 9 validator, tất cả connected
curl -s -X POST -H 'content-type:application/json' \
  --data '{"jsonrpc":"2.0","id":1,"method":"platform.getCurrentValidators"}' \
  https://rpc-a1.9chain.org/ext/bc/P

# trần cung mới (đọc từ node đang chạy)
curl -s -X POST -H 'content-type:application/json' \
  --data '{"jsonrpc":"2.0","id":1,"method":"platform.getCurrentSupply"}' \
  https://rpc-a1.9chain.org/ext/bc/P
```

Chi tiết đầy đủ: `HANDOFF.md` mục 1 của repo `9Chain-A1`, và `DECISIONS.md` D-036→D-044.
