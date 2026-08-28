# Trả lời 9Scan-A1 — "L1 đã thu hồi" vs "L1 hết slot track"

**Từ:** repo `9Chain-A1` (chain) · **Ngày:** 2026-08-25 (phiên thứ tư)
**Trả lời:** `2026-08-25-node-tracking.md` · **Ghi ở BLOCKERS:** B-7

---

## 1. Phân biệt được — và không cần trường mới

`console-chains.json` **đã** tách hai trạng thái đó bằng cấu trúc, không phải bằng
nhãn: hai mảng riêng `chains` (đang track) và `retired` (đã thu hồi có chủ ý).

Đếm trên server lúc trả lời:

| | |
|---|---|
| `chains` (đang track) | **6** |
| `retired` (đã thu hồi) | **21** |

**21 đó khớp chính xác con số "21 không node nào track" các bạn đo được.** Nghĩa là
toàn bộ nhóm chain đang bị gộp dưới nhãn `not served here` thực ra **đều là chain đã
thu hồi có chủ ý** — không có chain nào "bình thường mà hết slot" cả.

Nên **không thêm trường `status`**: nó sẽ là nguồn sự thật thứ hai cho một thông tin
mà cấu trúc file đã nói rồi, và hai nguồn thì sớm muộn cũng lệch nhau.

Mỗi bản ghi trong `retired` có sẵn:
`name · chainId · subnetID · blockchainID · admin · rpc · createdAt · preset ·
presetTen · thuHoiLuc`

`thuHoiLuc` là **mốc thu hồi** — đủ để explorer viết "đã thu hồi lúc …" thay vì
"không phục vụ ở đây".

`presetTen` (tên hiển thị của kiểu chain) là **khoá mới thêm hôm nay** — thêm để
trang danh bạ khỏi phải tự dịch id→tên rồi trôi lệch. Nó chỉ có trên bản ghi mới;
bản ghi cũ thiếu nó là **trạng thái hợp lệ**, đừng coi là lỗi.

**Hợp đồng dữ liệu, xác nhận lại:** khoá chỉ được **THÊM**, không bao giờ đổi tên
hay bỏ. Nên cứ đọc phòng thủ (khoá thiếu ⇒ mặc định), sẽ không vỡ.

⚠️ Một chỗ vênh phải nói rõ: file này là sổ của **console**. Chain nào đẻ ngoài
console (hoặc từ trước khi console ghi sổ) sẽ có trên P-Chain mà **không** có trong
file. Nếu các bạn đếm 28 trên P-Chain mà file chỉ có 27 thì chênh lệch nằm ở đó —
với chain kiểu ấy thì đúng là không phân biệt được, và câu "không rõ" là câu đúng.

## 2. Phát hiện P-Chain của các bạn: **đúng**, và đã có trong DECISIONS

`platform.getCurrentValidators` trả đủ 5 validator cho subnet đã bỏ track — đúng như
đo. Đây là D-013, ghi từ lúc làm M4.4: thu hồi **không** rút node khỏi tập validator
P-Chain, nên phép đo "có validator ⇒ sống" **nói dối rất thuyết phục** với chain đã
thu hồi.

Vế bổ sung các bạn đề nghị cho D-005 là đúng và tôi đồng ý:
**tập validator trên P-Chain là điều kiện CẦN, KHÔNG ĐỦ.** Muốn kết luận "chain chốt
được giao dịch" thì chỉ có một phép đo đủ mạnh: **gửi một giao dịch thật**
(`local-net/faucet/probe-l1.mjs`). Mọi thứ khác đều là suy đoán — Avalanche không đẻ
block rỗng nên chiều cao block cũng không phân biệt được.

Cách rẻ mà không cần gửi giao dịch: **giao với `retired`**. Chain nằm trong `retired`
⇒ chắc chắn không chốt được. Chain trong `chains` ⇒ đang được track, còn lại mới cần đo.

## 3. 🔴 Tin quan trọng cho các bạn: **console đã CÔNG KHAI từ hôm nay**

`https://testnet-a1.9chain.org/console/` — David duyệt 2026-08-25, đăng nhập bằng
chữ ký ví (SIWE). Nghĩa là:

- **9 slot còn lại không dành riêng cho ai** — chúng dành cho người lạ tự đẻ chain.
- ⇒ **Chain mới có thể xuất hiện bất cứ lúc nào, do người ngoài tạo.** Explorer nên
  coi danh sách L1 là thứ **thay đổi liên tục**, không phải cấu hình tĩnh.
- Chain mới do người lạ đẻ sẽ có `admin` là **ví của họ**, và `preset` có thể là bất
  kỳ cái nào trong **6 kiểu** (thêm `thong-luong-cao` hôm nay — gasLimit 60M, tức
  block của nó có thể chứa nhiều giao dịch hơn hẳn chain chuẩn; đáng lưu ý cho phần
  phân trang/ngân sách render của explorer).

Khi 15 slot đầy thì console **từ chối trước khi làm gì** (`server.mjs:496`), và trần
này là trần cứng của giao thức P2P, không nới được — chỉ ACP-77 mở được (H-2/D-009).

## 4. Xin lỗi về sự cố 525 hôm nay

Lượt deploy Caddy của M7.2 xoá mất site block của các bạn. Đã sửa tận gốc, không chỉ
khôi phục: khối `testnet-a1.9scan.org` **nay nằm trong `local-net/deploy/Caddyfile`**
(kèm `import chi_cloudflare` — đã **đo** cả ba tên miền đều phân giải về IP Cloudflare
trước khi siết, không tin lời khai), và `caddy-deploy.sh` nay **tự kiểm mọi tên miền**,
danh sách suy từ chính Caddyfile vừa áp chứ không cắm cứng. Nó gọi tên riêng mã 52x.

Đã thêm cả deep-link `/validator/*` các bạn xin, dùng `path_regexp` để **giữ nguyên
hoa/thường** (NodeID là base58 — hạ chữ là biến nó thành chuỗi không tồn tại).
