# HANDOFF — worktree `audit` · Cập nhật: `2026-08-28` (lượt soát lại thứ 2)

> ⚠️ Đây là HANDOFF **của riêng worktree soát**, cố ý **không** ghi vào `HANDOFF.md` ở
> gốc repo: tệp đó thuộc `main`, và luật 3 trong `CLAUDE.md` cấm worktree này đụng vào
> `main`. Mọi thứ worktree soát sinh ra nằm trong `docs/AUDIT-A1/`.

## TL;DR

Đã soát **hai mặt** (mã nguồn/công nghệ, chuỗi công khai g0), rồi **đo lại toàn bộ một
lượt nữa ngày `28/08`**. Nay **13 phát hiện**: 1 P0 · 5 P1 · 7 P2.

- **P0 A-001** vẫn mở và **xấu thêm**: bản sao lưu ngoài máy thiếu **12 patch / 45 commit**.
- **3 phát hiện mới** từ lượt đo lại: **A-011** console không có người canh (P1) ·
  **A-012** cổng drift loại trắng `web/` trong khi `main` còn giữ `networkID 9001` (P1) ·
  **A-013** explorer loop chết 773 lần trên máy chủ (P2).
- **A-007 chỉ đóng một nửa**: xanh trên máy chủ, đỏ trong nguồn `main` ⇒ phát lại được.

Không lệnh nào đổi trạng thái máy chủ trong cả hai phiên.

## Đã xong

| Sản phẩm | Nội dung |
|---|---|
| `docs/AUDIT-A1/10-MA-NGUON-VA-CONG-NGHE.md` | kiểm kê cây mã (fork chạm **7/2.930** file Go, xoá **7/660.132** dòng), soát console công khai, 6 phát hiện A-001…A-006 |
| `docs/AUDIT-A1/11-CHAIN-CONG-KHAI-G0-2026-08-27.md` | đo chuỗi g0 `27/08 15:30Z` + **mục CẬP NHẬT `28/08 01:30Z`**; A-007…A-010 |
| `docs/AUDIT-A1/SO-PHAT-HIEN.md` | sổ 10 phát hiện đủ 6 trường + 5 quan sát + 8 mục "chưa đo được" |

**Phép đo tự chạy trong phiên (đều chỉ-đọc, đã có đối chứng ngược):**
- `node scripts/check-consistency.mjs` → 21 đạt · `--tu-kiem` 9/9 ca sai ra đỏ
- `node scripts/check-deploy-drift.mjs` → **18 khớp · 0 lệch · 0 thiếu** (chạy từ worktree `main`)
- ssh chỉ-đọc: `A1_HTTP_ALLOWED_HOSTS=localhost,127.0.0.1` ✓ · `restart: unless-stopped` ×9 ✓
- Trình duyệt thật trên `a1.9chain.org` (6 trang) và `a1.9scan.org`
- **Xác minh độc lập `supplyCap` mạng công khai = 7.900.000.001** bằng cách nghịch đảo
  công thức thưởng — khớp **từng đơn vị**, ca tràn 720 triệu lệch 4,13 lần

## Trạng thái phát hiện — **soát lại toàn diện lượt 2, `2026-08-28`**

Gốc đo: `main @ 40bcc6c` · core `03ccd70` (24 patch) · mạng g0 đang chạy.

| ID | Mức | Trạng thái |
|---|---|---|
| **A-001** bản sao lưu **không dựng lại được mạng đang chạy** | 🔴 **P0** | **mở, xấu thêm**: backup có **12 patch**; repo **24 patch**, **45 commit** sau. `BLOCKERS.md:493` vẫn ghi *"không còn là một ổ đĩa"* |
| **A-011** 🆕 **console là tiến trình `node` trần, PPID 1, không ai canh** | 🔴 **P1** | **mới** — 30/31 thành phần có `restart:`/unit; console là ngoại lệ duy nhất |
| **A-012** 🆕 cổng drift **loại `^web/`**; `main` ↔ `web-home` lệch **40/26 commit · 151 tệp**, `main` vẫn `networkId: 9001` | **P1** | **mới** — A-007 **phát lại được** |
| A-008 `a1.9scan.org` chết trên chuỗi mới | P1 | 🔴 mở sau **~34 giờ** — đo lại bằng trình duyệt: y nguyên |
| A-009 trang mời dùng dịch vụ đang **đóng** | P1 | 🟡 nửa đóng — console đóng **đã đo trên máy chủ**; trang **vẫn mời**; **suất vẫn bị tiêu trước khi cổng từ chối** |
| A-002 `rebase-drill.sh` không canh `upgrade.A1` | P1 | 🔴 mở, tệp không đổi từ `25/08` |
| A-005 explorer 6 image `:latest` | P2 | 🔴 mở — **nay đã đo trên MÁY CHỦ** (C-5 đóng) |
| **A-013** 🆕 `stats` restart **773 lần**, `user-ops-indexer` **298 lần** trên máy chủ | P2 | **mới** (nâng từ Q-3) |
| A-003 + A-010 compose trong git lệch 3 thứ | P2 | 🔴 mở, y nguyên |
| A-004 faucet `ethers: ^6.13.0`, không lockfile | P2 | 🔴 mở, y nguyên |
| A-006 lớp chủ quyền thiếu test | P2 | 🟠 **nhích**: có test băng bí danh (0022); `A1HRP`/`A1Name`/`upgrade.A1` vẫn **0 test** |
| A-007 6 trang khai `networkID 9001` | P1 | ✅ đóng **phía sản phẩm** (6/6 = `999999999`) · 🔴 hở **phía nguồn** ⇒ A-012 |

Mạng công khai còn lành: `networkID 999999999` · `9chain-a1-g0` · chainId `0x218711a09` ·
**9 validator** · `potentialReward[0] = 82.876.379.811.608` ⇒ `SupplyCap 7.900.000.001`
xác nhận lại **từng đơn vị** từ ngoài.

## Việc tiếp — ai làm gì

1. **[human — David]** 🔴 **Chạy lại H-6b.** P0 duy nhất, và nó là một lệnh.
   Điều kiện qua: `ls <backup>/avalanchego-patches/ | wc -l → 24` và
   `git rev-list --count <HEAD-MANIFEST>..main → 0`. Chừng nào chưa đạt,
   `BLOCKERS.md:493` phải bỏ câu *"không còn là một ổ đĩa"*.
2. **[main]** 🔴 **A-011 — cho console một người canh.** systemd unit `enabled` + `active`,
   hoặc đưa vào compose với `restart: unless-stopped`. Rẻ, và nó chặn một ca "mọi thứ
   xanh, tính năng chủ lực chết" sau reboot.
3. **[main]** 🔴 **A-012 — sửa `web/lib/chain.ts` trên `main` về `999999999`**, và cho
   `web/` một mốc canh (so với `web-home`, không phải `main`). Không để cổng drift
   loại trắng bề mặt công khai lớn nhất.
4. **[main]** A-009 hai vế: (a) chuyển cổng D-087 lên **trước** `blockedByRate`
   (`server.mjs:1237`) để lượt bị từ chối không tiêu suất; (b) trang chủ +
   `/create-chain/` **nói ra** dịch vụ đóng tới sau ngày G.
5. **[9Scan-A1]** A-008: gửi phiếu qua `docs/requests-from-9scan/` — kèm bằng chứng
   "một POST `/rpc/ext/bc/C/rpc` trả **đúng** block 2 + chainId, không lỗi console,
   rồi không vẽ gì ⇒ hỏng phía client".
6. **[main]** A-002: thêm 5 dòng `doi` vào `scripts/rebase-drill.sh` (đã viết sẵn ở
   `SO-PHAT-HIEN.md` §A-002 — copy được).
7. **[main]** A-004: ghim `ethers` + sinh lockfile cho `faucet` và `deploy-test`.
8. **[human — David]** A-013: quyết **dừng hay gỡ** Blockscout trước ngày G — và ghi
   thành quyết định, đừng để nó loop tiếp.
9. **[human — David]** Quyết: **có nhặt `docs/AUDIT-A1/` sang `main` không**, và có
   commit các tệp đang dở trên nhánh `audit` không (xem Gotcha 1).

## Gotchas

1. 🔴 **Ba tệp báo cáo đang CHƯA COMMIT** trên nhánh `audit`
   (`git status`: `M SO-PHAT-HIEN.md`, `?? 10-…`, `?? 11-…`). Chúng chỉ tồn tại trên đĩa.
   Đã hỏi David hai lần, chưa có lệnh commit — **đừng giả định đã an toàn**.
2. **Bản ghim `15c940e` (17 patch) đã hết hiệu lực làm chuẩn soát.** Mạng công khai chạy
   **23 patch**. Mọi kết luận từ đây phải ghi rõ đúng với cây nào. Muốn soát core hiện
   tại thì **đọc** `C:/PROJECTS/9Chain-A1/patches/` (đọc được, không ghi).
3. **`grep 9001` trên HTML của site sẽ trượt.** React chèn `<!-- -->` giữa các text node:
   phải tìm `networkID <!-- -->[0-9]*`, không phải `networkID 9001`.
4. **`disabled` trong HTML `/create-chain/` KHÔNG phải thông báo tạm dừng** — nó là lớp
   Tailwind `disabled:opacity-55`. Suýt kết luận nhầm là A-009 đã đóng.
5. **`robots.txt`: Cloudflare CHÈN THÊM, không thay thế.** Bản của dự án nằm từ dòng 62
   tới hết. Đọc `head -3` rồi kết luận là sai — tôi đã sai đúng như thế một lượt.
6. **`go vet`/`go build` core KHÔNG chạy được trên Windows** (CGO: blst, zstd, libevm).
   `GOOS=linux CGO_ENABLED=0` cho 3 lỗi *của việc tắt CGO*, không phải lỗi mã A1.
   Muốn build thì Docker Linux, và đó là việc của worktree `main`.
7. **`curl` phải kèm `-H 'content-type:application/json'`** — thiếu là node trả
   `unrecognized Content-Type`, dễ tưởng RPC chết.
8. Bash tool **đổi cwd sau `cd`**; dùng đường dẫn tuyệt đối hoặc `cd` lại mỗi lệnh.
9. 🔴 **`grep -l A1_CLI_KEY /proc/*/cmdline` TỰ KHỚP CHÍNH NÓ.** Lượt đầu ra "4 tiến
   trình" và suýt thành một phát hiện bảo mật; cả 4 là cmdline của chính lệnh grep.
   Muốn đo thật thì phải in ra PID + `exe` rồi loại tiến trình của mình.
10. **`local-net/net-*/` không ở trong git** (`.gitignore:3`) — nên `net-public/` trên
   máy dev còn `--network-id=9001` là **vật liệu cũ**, không phải A-010. A-010 chỉ tính
   4 tệp `.yml` **được git theo dõi**. Kiểm bằng `git ls-files --error-unmatch <tệp>`.
11. **`net-that-g0/` mới là bộ sinh mạng công khai** (1 node, `--network-id=999999999`);
   compose 9 node thật nằm **trên máy chủ**, không có trong repo.
12. `docs/BLOCKERS.md` **không tồn tại** — nó ở **gốc repo**: `BLOCKERS.md`.
13. Console **không phải container**: `docker ps` không thấy nó. Nó là
   `node local-net/console/server.mjs` trên host, cổng `127.0.0.1:8091` — xem A-011.

## Lệnh hữu ích

```bash
node scripts/check-consistency.mjs --tu-kiem
```

```bash
cd /c/PROJECTS/9Chain-A1 && node scripts/check-deploy-drift.mjs
```

```bash
curl -s -H 'content-type:application/json' -d '{"jsonrpc":"2.0","id":1,"method":"info.getNetworkName"}' https://rpc-a1.9chain.org/ext/info
```

```bash
diff <(ls /c/PROJECTS/9Chain-backups/9chain-a1-backup-*/avalanchego-patches/ | tail -30) <(ls /c/PROJECTS/9Chain-A1/patches/)
```
