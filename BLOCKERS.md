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
| H-2 | ACP-77 (`ConvertSubnetToL1Tx`) — quyết định kinh tế, chờ H-1 | — |
| H-3 | Có mở console đẻ chain ra Internet không | M4.5 |
| H-4 | AAAA record `bootstrap-a1.9chain.org` (**DNS-only**, không mây cam) | M3.3 |
| H-5 | URL Cosmos REST của C1 (`:1317`) | M7.3 (dashboard live) |

---

## Đã gỡ

*(chưa có)*
