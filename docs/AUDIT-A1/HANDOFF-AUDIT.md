# HANDOFF — worktree `audit` · Cập nhật: `2026-08-28` (soát lượt 2 + thi hành)

> 🔴 **THƯ MỤC NÀY SỐNG Ở HAI NHÁNH.** Nhánh `audit` là nơi ghi tiếp; bản trên `main` là
> **ảnh chụp** (nhặt sang sau khi David chốt). Kiểm lệch — **0 dòng là khớp**:
> ```
> git diff audit main -- docs/AUDIT-A1/ | wc -l
> ```
> Nhặt lại sau mỗi phiên soát:
> ```
> cd /c/PROJECTS/9Chain-A1 && git checkout audit -- docs/AUDIT-A1/ && git commit docs/AUDIT-A1 -m "..."
> ```
> ⚠️ Commit theo **pathspec**, đừng commit cả index: worktree `main` gần như luôn có việc dở
> của session khác. Đây đúng hình dạng A-012 — khác biệt duy nhất: ở đây ta **biết trước**.

## TL;DR

Soát lại toàn diện lượt 2 → **14 phát hiện** (từ 10). **P0 A-001 đã hạ** — H-6b chạy lại,
nay là script có cổng canh. Ba việc David chốt trong phiên đã **thi hành xong**. Còn **4 mục
mở**, không mục nào là P0.

## Trạng thái — `2026-08-28`

| ID | Mức | Trạng thái |
|---|---|---|
| A-001 bản sao lưu không dựng lại được mạng | ~~P0~~ | 🟡 **trạng thái đã sửa** — bản `20260828-030536`, 24/24 patch, 6 phép nghiệm thu |
| A-014 không ai phát hiện backup **cũ đi** | P1 | ✅ **ĐÓNG** — `scripts/h6b-backup.sh` + hook `Stop` |
| A-013 explorer loop chết trên máy chủ | P2 | 🟡 **nửa đầu xong** — `stats`/`user-ops-indexer` đã dừng (800/308, `exited`) |
| **A-011** console không có người canh | 🔴 **P1** | 🔴 **mở** — việc rẻ nhất còn lại |
| **A-012** `main` còn `networkId: 9001` | **P1** | 🔴 **mở** — A-007 phát lại được |
| **A-008** `a1.9scan.org` trắng | **P1** | 🔴 **mở** — đội 9Scan-A1 |
| **A-009** trang vẫn mời + tiêu suất | **P1** | 🟡 console đóng thật; **trang vẫn mời**, suất vẫn bị tiêu |
| A-002 · A-003 · A-004 · A-005 · A-006 · A-010 | P2 | 🔴 mở, y nguyên (chi tiết ở `SO-PHAT-HIEN.md`) |

Mạng công khai lành: `networkID 999999999` · `9chain-a1-g0` · chainId `0x218711a09` ·
9 validator · `potentialReward[0] = 82.876.379.811.608` ⇒ `SupplyCap 7.900.000.001` xác nhận
lại **từng đơn vị** từ ngoài.

## Đã xong trong phiên

- **Soát lại 10 phát hiện cũ** + **4 mới** (A-011…A-014) — `SO-PHAT-HIEN.md` §"Soát lại lượt 2"
- **Nhặt `docs/AUDIT-A1/` sang `main`** (David chốt) — `ab3f22b`, 5 tệp, không một dòng mã
- **A-013 nửa đầu**: `docker stop stats user-ops-indexer` — baseline công khai 4 dòng **không
  đổi một ký tự**, 9 node nguyên
- **H-6b chạy lại** rồi **thành script**: `scripts/h6b-backup.sh`, 4 chế độ, `--self-test` 4/4
- **Cổng cuối phiên**: hook `Stop` ở `main/.claude/settings.json` (`70f1345`) — im khi xanh,
  in lý do thật khi đỏ, 0,37s

**Ba ngoại lệ David cho phép** (đã ghi thẳng vào sổ, không phải luật mới):
luật 4 × 2 (dừng container · H-6b ghi lên máy chủ) · charter §4 × 1 (sinh script).

## Việc tiếp — ai làm gì

1. **[main]** 🔴 **A-011 — cho console một người canh.** systemd unit `enabled`+`active`,
   hoặc đưa vào compose `restart: unless-stopped`. Rẻ nhất, chặn ca "mọi thứ xanh, tính năng
   chủ lực chết" sau reboot.
2. **[main]** 🔴 **A-012 — `web/lib/chain.ts` trên `main` về `999999999`**, và cho `web/` một
   mốc canh (so với `web-home`, **không** phải `main`).
3. **[main]** A-009: (a) chuyển cổng D-087 lên **trước** `blockedByRate` (`server.mjs:1237`);
   (b) trang chủ + `/create-chain/` **nói ra** dịch vụ đóng tới sau ngày G.
4. **[9Scan-A1]** A-008 — phiếu qua `docs/requests-from-9scan/`, kèm bằng chứng "một POST trả
   **đúng** block + chainId, không lỗi console, rồi không vẽ gì ⇒ hỏng phía client".
5. **[main]** A-002 (5 dòng `doi` đã viết sẵn ở §A-002) · A-004 (ghim `ethers` + lockfile).
6. **[human — David]** A-013 nửa sau — gỡ hẳn Blockscout, **chỉ sau khi A-008 đóng**
   (quy trình đủ ở §A-013: sửa Caddy **trước**, `compose down` **sau**).
7. **[human — David]** 🔴 **D-044 / O1 — khoá 5 quỹ vẫn không có bản nào ngoài máy dev.**
   H-6b chưa bao giờ cứu khoá. Vẫn là mục quyết số 1 trước ngày G.
8. **[dọn]** `9Chain-backups\...-030321` và `...-030439` là hai lượt dở, lành nhưng chưa từng
   lên máy chủ. Vô hại, nên xoá.

## Gotchas

1. 🔴 **Hook `Stop` chỉ nạp ở phiên mở SAU `70f1345`.** Phiên `main` đang chạy phải khởi động
   lại, hoặc mở `/hooks` một lần.
2. 🔴 **`grep -l A1_CLI_KEY /proc/*/cmdline` TỰ KHỚP CHÍNH NÓ** — ra "4 tiến trình" và suýt
   thành một phát hiện bảo mật. Phải in PID + `exe` rồi loại tiến trình của mình.
3. 🔴 **Hai lớp "cổng chết câm" trong bash, cả hai đã dính thật:**
   `[ -n "$X" ] && ham` là lệnh cuối ⇒ `set -e` giết không in một chữ; và
   `grep … | wc -l` với `pipefail` ⇒ **ca TỐT** (không tìm thấy gì) bị xử như lỗi.
   Đừng "dọn" `|| true` trong `h6b-backup.sh` — lý do đã ghi thành comment tại chỗ.
4. 🔴 **Cổng luôn ĐỎ vô dụng y hệt cổng luôn xanh, và tệ hơn vì người ta sẽ TẮT nó.** Thử
   hook bằng `eval` cho cả hai vế đều đỏ (`eval` nuốt escaping). ⇒ Luôn thử bằng chuỗi
   **lấy ngược ra từ `settings.json`**, không phải bản gốc.
5. **`local-net/net-*/` không ở trong git** (`.gitignore:3`) — `net-public/` trên máy dev còn
   `9001` là **vật liệu cũ**, không phải A-010. A-010 chỉ tính 4 `.yml` **được git theo dõi**.
6. **`net-that-g0/` là bộ sinh mạng công khai** (1 node); compose 9 node thật nằm **trên máy chủ**.
7. **`BLOCKERS.md` ở GỐC repo**, không phải `docs/`.
8. **Console không phải container** — `docker ps` không thấy. Nó là `node server.mjs` trên
   host, `127.0.0.1:8091` (A-011).
9. **`A1_ROOT_UPSTREAM=127.0.0.1:8100` CHÍNH LÀ Blockscout `proxy`**, và là catch-all của
   Caddy. Trang 404 thương hiệu được dựng bằng cách **chặn mã 404 của Blockscout** ⇒ gỡ thẳng
   là 502 hoá nó.
10. **`grep 9001` trên HTML sẽ trượt** — React chèn `<!-- -->`: tìm `networkID <!-- -->[0-9]*`.
11. **`curl` phải kèm `-H 'content-type:application/json'`**, thiếu là node trả `unrecognized
    Content-Type` — dễ tưởng RPC chết.
12. **`go vet`/`go build` core KHÔNG chạy được trên Windows** (CGO). 3 lỗi là **của việc tắt
    CGO**, không phải lỗi mã A1.
13. Bash tool **đổi cwd sau `cd`**; dùng đường dẫn tuyệt đối.

## Lệnh hữu ích

```bash
cd /c/PROJECTS/9Chain-A1 && bash scripts/h6b-backup.sh --check
```

```bash
cd /c/PROJECTS/9Chain-A1 && bash scripts/h6b-backup.sh --self-test
```

```bash
cd /c/PROJECTS/9Chain-A1 && git diff audit main -- docs/AUDIT-A1/ | wc -l
```

```bash
curl -s -H 'content-type:application/json' -d '{"jsonrpc":"2.0","id":1,"method":"info.getNetworkID"}' https://rpc-a1.9chain.org/ext/info
```

```bash
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'pgrep -af server.mjs; ps -o ppid= -p $(pgrep -f "console/server.mjs")'
```
