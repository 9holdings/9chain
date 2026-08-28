# HIẾN CHƯƠNG SOÁT TOÀN DIỆN 9CHAIN-A1

**Worktree:** `C:/PROJECTS/9Chain-A1-audit` · **nhánh:** `audit`
**Gốc:** `main @ 0c701fa` · **Core ghim:** `upstream/avalanchego @ 15c940e` (detached)
**Lập:** 2026-08-27 · **Mốc chặn:** ngày G `2026-09-01` (re-genesis + khắc chữ)

---

## 0. Vì sao tách ra

Các session khác đang **sửa** `main` và đang chạm server thật. Soát mà dùng chung
cây làm việc thì hai thứ hỏng cùng lúc: người soát đọc mã đang đổi dưới chân
mình, và người làm bị chặn bởi lượt kiểm của người soát. Worktree này cắt cả hai.

Nó cũng cắt một sai lầm đã xảy ra thật: **bản compose trong tay người đọc mã khác
bản đang chạy trên server**, nên người soát suy ra một kết luận sai từ một nguồn
hợp lý. Vì thế hiến chương này bắt buộc phân biệt hai nguồn — *mã trong repo* và
*trạng thái trên server* — và ghi rõ mỗi phát hiện dựa vào cái nào.

## 1. Phạm vi — năm mặt, và mặt nào đã có người soát

| Mặt | Đã có gì | Còn hở — việc của worktree này |
|---|---|---|
| **Công nghệ / core** | `docs/CORE-AUDIT-2026-08-27.md` — trần cung, lịch nâng cấp, HRP, patch 0013 | Nghiệm thu lại 17 patch trong `patches/` trên bản ghim `15c940e`; đường đi tài sản P/C/X; VM config theo từng chain |
| **Mã nguồn** | Chưa có bản soát mã diện rộng | `web/` (70 file), `local-net/console/` (API đã mở ra Internet), `scripts/`, `explorer-full/` |
| **Cấu trúc** | Rải rác trong `docs/ARCHITECTURE.md` | Cái gì **không** vào git mà lại là sản xuất (compose thật, khoá, cấu hình Caddy); ranh giới repo ↔ server |
| **Bảo mật** | `FULL-REVIEW-2026-08-27.md` §7–8 — biên đã đo, 3 chỗ hở P2 | Bề mặt `/console/api/*` (đã công khai từ 25/08), phụ thuộc npm/Go, custody khoá 5 quỹ, quyền trên server |
| **Tối ưu** | `FULL-REVIEW-2026-08-27.md` §9 — explorer tốn gấp 2,2 lần cả blockchain | Chi phí thật/1 chain con, đường tăng trưởng khi có người dùng thật, kích thước bundle web |

**Ngoài phạm vi:** thương hiệu/nhận diện (`BRAND-AUDIT-2026-08-27.md` đã soát và
đang thi hành), nội dung khắc chữ ngày G (chờ C1 đóng băng byte).

## 2. Không soát lại từ đầu — soát *trạng thái* của cái đã biết

Bốn tài liệu dưới đây là **đầu vào**, không phải đối tượng để chép lại:

- `docs/PLAN-AUDIT-2026-08-26.md` — 24 phát hiện, **P0-2 (cầu tài sản) còn mở**
- `docs/FULL-REVIEW-2026-08-27.md` — P0-1/P0-2/P0-3, P1-1→P1-3
- `docs/CORE-AUDIT-2026-08-27.md` — P0 trần cung `10.099.999.999`, P1 lịch nâng cấp
- `docs/STATUS-A1-2026-08-27.md` — A1 tồn tại ở **hai bản**, bản phục vụ người
  ngoài là bản **cũ**

Việc đầu tiên của worktree này là **đo lại xem những mục đánh ✅ có thật sự còn
xanh không**. Một mục đã đóng trên giấy mà nay đỏ lại là phát hiện nặng hơn một
mục mới, vì nó nghĩa là sổ sách đang nói dối.

## 3. Thứ tự làm — rẻ trước, và tránh giẫm chân

1. **Xác minh trạng thái** các ✅ cũ (chỉ đọc, rẻ, không đụng ai).
2. **Soát mã nguồn tĩnh** trong worktree này (hoàn toàn ngoại tuyến, an toàn tuyệt đối).
3. **Soát core** trên `upstream/avalanchego @ 15c940e` (đã ghim, không đổi dưới chân).
4. **Đo server** — chỉ đọc, và **hỏi David trước** nếu phép đo có thể bị nhầm là
   tải bất thường hoặc trùng giờ một lượt deploy.

## 4. Sản phẩm

- `docs/AUDIT-A1/FINDINGS.md` — sổ phát hiện, định dạng 6 trường trong `CLAUDE.md`
- `docs/AUDIT-A1/1x-*.md` — báo cáo theo từng mặt, mỗi mặt một file
- Cuối cùng: một trang xếp theo **"mất gì nếu nó xảy ra"**, không theo xác suất

Không sinh bản vá trong worktree này. Phát hiện thì mô tả cách sửa và **điều kiện
qua**; việc sửa thuộc về worktree `main`.

## 5. Ranh giới với các worktree khác

| Worktree | Nhánh | Vai |
|---|---|---|
| `C:/PROJECTS/9Chain-A1` | `main` | Làm thật, deploy, chạm server |
| `C:/PROJECTS/9Chain-A1-web` | `web-home` | Trang chủ |
| `C:/PROJECTS/9Chain-A1-audit` | `audit` | **Soát — chỉ đọc, chỉ viết báo cáo** |

Xung đột duy nhất có thể xảy ra là ở `docs/`. Vì thế mọi file sinh ra ở đây nằm
trong `docs/AUDIT-A1/` — thư mục này không tồn tại trên `main`.
