# BLOCKERS — 9Chain-A1 (phần chain)

Việc kẹt / cần người thật. Ghi vào đây rồi **đi làm việc khác**, không dừng chờ.

---

## Đang mở

### B-1 — Docker Desktop không khởi động trên máy dev (chặn M0.6)
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

### Ghi chú H-6 — git đã có, nhưng chưa có bản thứ hai

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
