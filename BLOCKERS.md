# BLOCKERS — 9Chain-A1 (phần chain)

Việc kẹt / cần người thật. Ghi vào đây rồi **đi làm việc khác**, không dừng chờ.

---

## Đang mở

### B-2 — Blockscout: `stats` crash-loop 807 lần, `backend` ngốn hơn cả 5 validator
**2026-08-25, đo trên server lúc mạng tĩnh.**

| container | CPU | vai trò |
|---|---|---|
| `backend` (Blockscout) | **50.65%** | index chain |
| 5 node avalanchego **cộng lại** | ~37% | chạy cả testnet |
| `stats` | 0.05% | biểu đồ, **807 restart** |
| `user-ops-indexer` | 0.00% | ERC-4337, **315 restart** |

**Đọc đúng số này — nó lật ngược phán đoán ban đầu của tôi.** Thấy 807 restart thì
dễ kết luận "đang đốt CPU", nhưng đo ra 0.05%: crash-loop ở đây **không phải vấn đề
tài nguyên**. Nó là vấn đề **nhiễu** — 807 lần restart chôn mất mọi sự cố thật trong
`docker ps`, và một container flap mãi mãi thì không ai còn phân biệt được lần flap
nào đáng quan tâm.

Cái thật sự đắt là `backend`: **một mình nó nhiều hơn cả 5 validator cộng lại**, chỉ
để index một mạng gần như không có giao dịch. Đây là số liệu cứng cho quyết định
thay Blockscout bằng 9Scan-A1 (dự án `C:\PROJECTS\9Scan-A1`).

**Nguyên nhân crash-loop** (đọc log): `user-ops-indexer` không kết nối được RPC rồi
thoát code 0 → docker restart; `stats` chờ trạng thái index của user-ops, không hỏi
được → thoát. Cả hai đều là **dịch vụ tuỳ chọn** mà 9Chain-A1 không dùng:
`user-ops-indexer` là ERC-4337 (account abstraction — A1 không có), `stats` chỉ vẽ
biểu đồ (`273 charts waiting_for_starting_condition`, tức chưa vẽ được gì).

**Cần David quyết, không tự làm:** tắt hai dịch vụ này là **đổi cấu hình stack công
khai đang phục vụ người ngoài**. Rẻ và gần như chắc chắn vô hại, nhưng vẫn là quyết
định vận hành chứ không phải mặc định kỹ thuật — và explorer thuộc phạm vi 9Scan-A1.
Gỡ khi được duyệt: bỏ 2 service khỏi compose Blockscout, `docker compose up -d --remove-orphans`.

---

### ~~B-1~~ — ĐÃ GỠ 2026-08-25: Docker Desktop không khởi động trên máy dev
**2026-08-24.** `docker version` treo vô hạn; `Start-Process "Docker Desktop.exe"` chạy
nhưng daemon không lên sau 5 phút (`npipe:////./pipe/dockerDesktopLinuxEngine` không tồn tại).
Nghi WSL2 backend chưa sẵn sàng.

**Ảnh hưởng:** không build lại được image node trên máy dev → M0.6 treo, và **mọi việc
cần build lại node sau này (M3 IPv6 sửa netgen) sẽ vướng cùng chỗ**.

**KHÔNG tự gỡ bằng cách build trên server `139.99.145.13`**: build Go của avalanchego +
subnet-evm là tải CPU nặng, mà server đang chạy 5 validator của testnet công khai có
người ngoài dùng. Đổi 18.5% CPU thành 100% để tiện cho mình là sai đánh đổi.

**Không chặn M0 cốt lõi**: đường khôi phục đã được chứng minh bằng tree hash trùng khớp
từng byte — mạnh hơn "build xanh", vì cây phục hồi CHÍNH LÀ cây đã build ra image đang chạy.

**Cách gỡ khi David rảnh tay:** mở Docker Desktop bằng tay xem nó báo gì (thường là
WSL update / cần đăng nhập lại), hoặc `wsl --update && wsl --shutdown`.

---

## Cần David quyết (không phải kẹt kỹ thuật — xem PROGRESS mục `[human]`)

| # | Việc | Chặn mốc nào |
|---|---|---|
| H-1 | Tokenomics: supply cap 720M LOVE9 · tỉ lệ 40/20/20/5/15 + vesting · uptime 80%→90% | chốt genesis mainnet, ACP-77 |
| H-2 | 🔴 **ACP-77 — đã đổi bản chất, không còn chờ được**. Xem ghi chú dưới bảng | trần 16 L1 |
| H-3 | Có mở console đẻ chain ra Internet không | M4.5 |
| H-4 | AAAA record `bootstrap-a1.9chain.org` (**DNS-only**, không mây cam) | M3.3 |
| H-5 | URL Cosmos REST của C1 (`:1317`) | M7.3 (dashboard live) |
| H-6 | 🔴 **Repo chưa có remote — code vẫn chỉ nằm trên MỘT ổ đĩa** | độ bền của mọi thứ |

### Ghi chú H-6 — 🔴 ĐẮT HƠN HẲN sau phiên 2026-08-25

Kiểm lại lúc định push cuối phiên: repo `9Chain-A1` **không có remote nào**, còn repo
fork chỉ có `origin` trỏ `github.com/ava-labs/avalanchego` — tức là upstream của người
khác, không phải chỗ đẩy nhánh `9chain-a1` lên được. **Không có đường push nào tồn tại.**

Phiên này đẻ thêm 7 commit gồm: endpoint thu hồi chain (đã nghiệm thu 29/29 trên mạng
công khai), chứng minh build tái lập từng byte, nền test đầy đủ, và `rebase-drill.sh`.
Toàn bộ vẫn nằm trên **một ổ đĩa**. Ổ hỏng đêm nay là mất, và mất kèm cả lý do — vì
DECISIONS/BLOCKERS cũng ở đó.

Đây là việc chặn có thật, không phải hình thức: **mọi mốc làm thêm chỉ làm số tiền
mất đi khi ổ hỏng lớn lên.**

### Ghi chú H-6 (cũ) — git đã có, nhưng chưa có bản thứ hai

M0 đã đưa toàn bộ lớp chủ quyền vào git (2 repo, 5 commit gốc + patch series cứu hộ).
Nhưng cả hai repo **chưa có remote** — chưa `push` được đi đâu. Ổ đĩa hỏng là mất hết,
y như trước, chỉ khác là giờ có lịch sử để mất.

Không tự làm vì đây là quyết định của David, không phải mặc định kỹ thuật: đây là
**fork blockchain chủ quyền đang chạy testnet công khai**. Đưa lên GitHub công khai
là công bố toàn bộ lớp identity, tham số kinh tế mạng và công cụ vận hành.

**Cần David chọn:** nơi đặt (GitHub cá nhân / org / self-host) và **private hay public**.
Xong thì `git remote add origin … && git push -u origin main` cho cả `9Chain-A1` và
nhánh `9chain-a1` trong `upstream/avalanchego`.

### Ghi chú H-2 — vì sao ACP-77 không còn là việc để sau

Khi lập kế hoạch, ACP-77 được xếp "chờ chốt tokenomics" vì nó là quyết định kinh tế
(L1 chuẩn có phí duy trì liên tục). Hôm nay đọc source phát hiện nó còn là **thứ duy
nhất mở được trần kỹ thuật**:

Mô hình hiện tại — **mọi validator track mọi L1** — đụng trần cứng ở **16 L1**.
Quá 16, node bị mọi peer cắt kết nối lúc bắt tay P2P (`network/peer/peer.go:882`,
`p.StartClose()`). Mạng vỡ chứ không phải chậm đi. Chi tiết: DECISIONS D-009.

Hiện đang ở **4/15**. Console đã chặn không cho vượt.

**Nghĩa là:** "multi-L1 as a service" theo kiến trúc hôm nay phục vụ được tối đa 15
khách. Đủ cho demo và cho testnet, **không đủ cho một sản phẩm**. Muốn hơn thì phải
cho mỗi L1 một tập validator riêng — chính là ACP-77.

**Câu hỏi cho David:** A1 định bán "ai cũng đẻ được chain của mình" ở quy mô nào?
- Dưới 15 chain → kiến trúc hôm nay đủ, ACP-77 vẫn chờ tokenomics được.
- Trên 15 → ACP-77 là việc chặn, phải làm trước cả M4 (self-serve), vì mở self-serve
  trên nền trần 15 là mời người dùng vào một cái cửa sẽ đóng sập.

---

## Đã gỡ

### B-0 — Console chết im lặng sau khi đồng bộ code (2026-08-24)
`pkill` giết được console nhưng lệnh khởi động lại trong cùng dòng ssh không chạy
(exit 255), console nằm im. Nguy hiểm nhất: `tail console.log` sau đó trông **y hệt**
một lần khởi động thành công vì đó là **banner cũ** còn nằm lại.
**Gỡ bằng:** `local-net/deploy/console-restart.sh` — chờ cổng nhả hẳn, khởi động,
rồi **tự kiểm chứng bằng `ss -tln`** và exit khác 0 nếu không lên. Không còn phải
nhớ mẹo ngoặc vuông bằng tay.

### H-6b — Stopgap KHÔNG cần David chọn nơi đặt lâu dài (chờ duyệt 1 chữ)

Trong lúc chờ quyết định GitHub cá nhân/org/self-host + private/public, có một bước
rẻ tạo được **bản thứ hai trên một máy khác** mà không công bố gì:

```bash
git bundle create /tmp/9chain-a1.bundle --all   # 1 file, đủ toàn bộ lịch sử
scp -i "$A1_SSH_KEY" /tmp/9chain-a1.bundle "$A1_SSH_HOST":'~/9chain-a1/backup/'
```

Server `139.99.145.13` vốn đã giữ mã nguồn (`~/9chain-a1/src`), nên đây không phải
đưa thứ gì mới ra ngoài — chỉ thêm **lịch sử git** cạnh mã đã có. Không phải publish,
không phải chọn nhà cho repo, gỡ lúc nào cũng được.

**Autopilot KHÔNG tự làm** vì H-6 là việc David đã nêu đích danh là quyết định của
mình; tự đẩy repo sang máy khác dù private vẫn là lấn vào đúng chỗ đó. Cần một chữ
"ừ" là chạy được ngay.
