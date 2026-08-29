# TESTNET-1 CÔNG KHAI — `2026-09-01`

**David chốt `2026-08-29`: mở testnet công khai ĐÚNG ngày 01/09.** Tệp này là đường tới đích,
có điều kiện qua cho từng bước. Luật vẫn là [`CLAUDE.md`](../CLAUDE.md).

Ba lựa chọn David đã chốt cùng ngày:
- **O4 = máy tính thứ hai ở nhà** (cùng máy dùng cho B-16).
- **Mã nguồn công khai: GitHub, tài khoản cá nhân.**
- **Nợ ngôn ngữ: dịch đường NGƯỜI NGOÀI ĐỌC trước**, phần còn lại trả dần bằng bánh cóc.

---

## 0. "Công khai" nghĩa là gì — ba tầng, và tầng 3 là tầng khó

| tầng | nội dung | trạng thái `29/08` |
|---|---|---|
| **1 · Dùng được** | RPC · faucet · explorer · ví kết nối được | ✅ đang chạy |
| **2 · Đọc được** | mã nguồn công khai · genesis + bootstrap công bố · chạy được full node | 🟡 repo sạch secret, chưa push |
| **3 · Tham gia được** | người ngoài chạy **validator** | 🔴 chưa chứng minh |

Tầng 3 là thứ biến *"một mạng có RPC công khai"* thành *"một testnet"*.

---

## 1. 🟢 Tin tốt: kiến trúc cho tầng 3 ĐÃ CÓ, chỉ chưa bật

`netgen` đã có chế độ **`A1_P2P_MODE=ipv4port`** (H-7 · D-089 · patch 0024):

- **beacon (node-1)** khai `--public-ip=<IPv4 công khai>` + `--staking-port` riêng, và compose
  publish cổng đó ra **`0.0.0.0`** — điểm chạm cho người ngoài.
- **8 node cùng máy** giữ địa chỉ **nội bộ**, cố ý: bản đầu cho mọi node khai IP công khai đã bị
  **chính diễn tập của nó bác bỏ** — node2 và node3 không nối được nhau vì Docker **không NAT
  vòng lại**, mesh teo thành hình sao quanh node1.
- **Node ở máy khác** chạy **cùng chế độ**, khai `A1_PUBLIC_IP` **của chính nó** ⇒ nó gọi vào
  beacon được, và các node cùng máy chủ **gọi RA** nó được (outbound từ container luôn chạy).

⇒ Mạng `g0` đang chạy chỉ đơn giản được sinh ở chế độ mặc định **`docker`**. Đo `29/08` xác nhận:
mọi cổng P2P **đóng** từ Internet (đối chứng `22/443/80` mở), host chỉ có listener
`127.0.0.1:9650`, node-1 chạy `--public-ip=172.28.0.11`.

⚠️ **`ufw` ĐÃ mở `9651/tcp` với chú thích *"P2P beacon (node1)"*** — tức H-7 mới làm **nửa
đường**: firewall mở, compose chưa publish, node vẫn khai IP nội bộ. **Một cổng mở dẫn tới hư
không.** Nhìn `ufw status` mà tưởng xong là đúng cái bẫy repo này liên tục trả giá.

---

## 2. Đường tới hạn — thứ tự theo cái gì chặn cái gì

### 🔴 P0 — làm NGAY `29/08`, vì chúng chờ NGƯỜI KHÁC

| # | việc | ai | vì sao gấp |
|---|---|---|---|
| P0-1 | **PR đăng ký chainId `9000000009`** vào `ethereum-lists/chains` | **David** bấm, A1 soạn | Duyệt mất **vài ngày**. Gửi 01/09 là chắc chắn không kịp. Tra `29/08`: số **chưa ai chiếm** |
| P0-2 | **Máy nhà: IP công khai + port-forward** một cổng staking | **David** | Mọi phép đo tầng 3 chặn ở đây. ⚠️ IP nhà thường **động** ⇒ cần DDNS hoặc IP tĩnh |
| P0-3 | **Tạo GitHub repo rỗng** + cấp quyền | **David** | A1 chuẩn bị nhánh, nhưng `git push` là **việc có người bấm** |

### 🔴 P1 — phép đo QUYẾT ĐỊNH, phải xong trước `31/08`

| # | việc | ai |
|---|---|---|
| P1-1 | Dựng **mạng TẬP** trên server ở chế độ `ipv4port`, tên container riêng, cổng `975x` | **David** bấm deploy, A1 soạn lệnh |
| P1-2 | Máy nhà chạy **một node join mạng tập đó qua Internet** | A1 + David |
| P1-3 | 🔴 **Điều kiện qua:** node nhà **bootstrap xong** · beacon thấy nó · **và ít nhất một node KHÔNG-beacon trên server cũng thấy nó** | A1 |

> **P1-3 là cả kế hoạch.** Nếu node ngoài chỉ peer được với beacon mà 8 node kia không thấy nó,
> thì "validator ngoài" là hình sao quanh một điểm — không phải một testnet. Đây là chỗ **phải
> đo**, không phải chỗ để suy luận (nguyên văn D-089).

### P2 — song song, A1 tự làm

| # | việc | điều kiện qua |
|---|---|---|
| P2-1 | `docs/RUN-A-VALIDATOR.md` **tiếng Anh** | một người lạ theo được từ đầu tới cuối, không hỏi ai |
| P2-2 | Công bố **genesis + bootstrap** (nodeID + `IP:cổng`) **trong repo GitHub**, không qua `web/` | 🔴 `web/` thuộc worktree khác — **không đụng** |
| P2-3 | Dịch đường người ngoài đọc: `README.md` · netgen · script dựng mạng · tài liệu validator | `check-english-code.mjs` nợ **CO LẠI**, không phình |
| P2-4 | Đường phân phối binary: build từ `patches/` hoặc image công khai | dựng lại được từ tay trắng, có đối chứng tree hash |
| P2-5 | Diễn tập **trọn** lượt ngày G ở chế độ `ipv4port` | như D-105, nhưng lần này có node ngoài |

### P3 — bền vững, không chặn 01/09 nhưng chặn "đàng hoàng"

- **B-16** bản sao khoá thứ hai — **cùng máy nhà với O4**, một chuyến làm cả hai.
- **B-20** bản lưu danh tính validator — hôm nay **không gói nào có**.
- **B-18** / **B-19** — dọn tên cũ trên server, gỡ khoá khỏi thư mục chết.

---

## 3. Rủi ro đã biết, nói trước còn hơn gặp

| rủi ro | hệ quả | giảm nhẹ |
|---|---|---|
| 🔴 **IP nhà động** | node ngoài đổi địa chỉ ⇒ peer mất dấu | DDNS, hoặc chấp nhận node đó là **bản chứng minh**, không phải validator thường trực |
| 🔴 **Máy nhà tắt/ngủ** | validator ngoài rụng | Nó chứng minh *"người ngoài join được"*, không gánh đồng thuận |
| **O4 chưa gỡ** | 9/10 node vẫn **một máy, một nhà cung cấp** | Khai **thật** trong README, đừng khai là mạng phân tán |
| **Đụng lượt build sát ngày G** | image ngày G phải có patch mới nhất | Diễn tập P2-5 **trước** `31/08`; nhớ gotcha 16: netgen cắm cứng `image: :dev` |
| **chainId chưa duyệt kịp** | ví phải thêm mạng thủ công | Không chặn mở mạng; khai rõ trong tài liệu |

---

## 4. Điều kiện qua của chính ngày `01/09`

Chỉ được gọi là **đã mở testnet công khai** khi cả năm đúng:

1. `node scripts/gday-preflight.mjs` ⇒ **exit 0** (việc tay đã làm hết).
2. Mạng `g1` sống, chữ khắc **đọc ngược được từ genesis** (`engrave-verify`).
3. **Một node NGOÀI máy chủ đang là peer** — đo trên node đang chạy, không đọc tài liệu.
4. Repo công khai, và một người lạ **dựng lại được cây fork** từ `patches/` ra đúng tree hash.
5. `genesis.json` + bootstrap **tải được từ đường công khai**, và tài liệu validator chạy được.

🔴 Thiếu điều 3 thì đó là **RPC công khai**, không phải **testnet công khai** — và phải gọi đúng
tên nó trong mọi thứ ta công bố.
