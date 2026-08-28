# SỔ PHÁT HIỆN — SOÁT TOÀN DIỆN A1

**Gốc:** `main @ 40bcc6c` · **Core:** 24 patch, `upstream/avalanchego @ 03ccd70`
**Mở sổ:** 2026-08-27 · **Soát lại toàn diện lượt 2:** 2026-08-28

> 🔴 **Bản ghim `15c940e` (17 patch) đã hết hiệu lực làm chuẩn soát.** Mạng công khai
> sinh lại `27/08` (D-081); `main` nay ở **24 patch**. Mọi kết luận từ đây trở đi ghi rõ
> nó đúng với cây nào. Đợt đo `27/08 15:30Z` ở
> `docs/AUDIT-A1/11-CHAIN-CONG-KHAI-G0-2026-08-27.md`; đợt đo lại `28/08` ở mục
> **"Soát lại lượt 2"** cuối tệp này.
Luật ghi: `CLAUDE.md` · Phạm vi: `docs/AUDIT-A1/00-CHARTER.md`

Mức: `P0` mất tài sản / mạng dừng / không sửa được sau ngày G · `P1` chặn ngày G
hoặc bác được công khai · `P2` hở nhưng có điều kiện · `P3` tối ưu, nợ kỹ thuật.

Mức tin cậy: `ĐO ĐƯỢC` · `SUY RA TỪ MÃ` · `PHỎNG ĐOÁN`.
Nguồn: `REPO` (mã trong worktree) · `SERVER` (đo trên máy thật) — **hai thứ đã
từng lệch nhau**, luôn ghi rõ.

---

## Bảng tổng

| ID | Mức | Mặt | Điều khẳng định | Tin cậy | Nguồn | Trạng thái |
|---|---|---|---|---|---|---|
| A-001 | 🔴 **P0** | cấu trúc | Bản sao lưu ngoài máy duy nhất chứa **12 patch** = mạng ĐÃ BỊ XOÁ; các patch định nghĩa mạng đang chạy không có bản nào ngoài ổ dev | ĐO ĐƯỢC | REPO + máy dev | 🟡 **TRẠNG THÁI ĐÃ SỬA `28/08`** — H-6b chạy lại, bản `20260828-024659` có **24/24 patch**, `rev-list = 0`. **Cơ chế vẫn chưa có** ⇒ xem A-014 |
| **A-014** | **P1** | cấu trúc | Không phép đo nào phát hiện bản sao lưu **cũ đi**. Lần trước nó cũ sau **đúng 1 ngày** mà mọi cổng vẫn xanh | ĐO ĐƯỢC | REPO | 🔴 **mới `28/08`** — phần chưa đóng của A-001 |
| A-002 | **P1** | công nghệ | `rebase-drill.sh` không canh `upgrade.A1`; nó canh `FallbackHRP` — thứ mã nguồn đã hạ xuống làm dây dự phòng | ĐO ĐƯỢC | REPO | 🔴 mở · **thực tế đã chứng minh** (D-079) |
| A-003 | P2 | cấu trúc | `multinode.compose.yml` tự khai "NGUỒN CHÍNH THỨC" nhưng lệch **ba thứ**: 5 node · 0 dòng `restart:` · `--network-id=9001` | ĐO ĐƯỢC | REPO (vs SERVER `27/08`) | 🔴 mở · xem A-010 |
| A-004 | P2 | bảo mật | Faucet giữ khoá có tiền nhưng dùng `ethers: ^6.13.0` không lockfile; console cùng repo ghim `6.17.0` | ĐO ĐƯỢC | REPO | 🔴 mở |
| A-005 | P2 | bảo mật/tối ưu | Explorer chạy 6 image `:latest` bên thứ ba + `git clone --depth 1` không ghim | ĐO ĐƯỢC | REPO + máy dev | 🟠 chưa đo lại trên máy chủ sau g0 |
| A-006 | P2 | công nghệ | Lớp chủ quyền không có cổng nào đi **đường mà node đi** — `go test` xanh trong khi node log `supplyCap 720 triệu` | ĐO ĐƯỢC | REPO + D-079 | 🟠 hạ một nửa: đã có `go test`, nhưng nó đo sai đường |
| **A-007** | **P1** | mã nguồn | **6/6 trang công khai** của A1 khai `networkID 9001` — mạng đã bị xoá sáng nay | ĐO ĐƯỢC | SERVER + REPO | ✅ **ĐÃ ĐÓNG `28/08 01:30Z`** — đo lại: `networkID 999999999` |
| **A-008** | **P1** | mã nguồn | Explorer công khai `a1.9scan.org` **không vẽ một số liệu nào** trên chuỗi mới, trong khi RPC proxy của chính nó trả dữ liệu đúng | ĐO ĐƯỢC (trình duyệt thật) | SERVER | 🔴 mở · đội 9Scan-A1 |
| **A-009** | **P1** | mã nguồn | Nút chính trang chủ dẫn tới thao tác **không thể thành công**; console không kiểm số dư trước, mà hạn mức bị tiêu ngay lúc kiểm | ĐO ĐƯỢC (trang) + SUY RA TỪ MÃ (console) | SERVER + REPO | 🔴 mở |
| **A-010** | P2 | cấu trúc | `--network-id=9001` cắm cứng trong 4 tệp compose đang ở git ⇒ dựng lại từ repo thì node **từ chối khởi động** | ĐO ĐƯỢC | REPO | 🔴 mở |
| **A-011** | 🔴 **P1** | cấu trúc | **Console — bề mặt GHI công khai duy nhất — là tiến trình `node` trần trên host, PPID 1, không systemd, không crontab, `Linger=no`.** Cả 30 thành phần còn lại đều có người canh | ĐO ĐƯỢC | SERVER | 🔴 **mới `28/08`** |
| **A-012** | **P1** | cấu trúc | Cổng `check-deploy-drift` **cố ý loại `^web/`**, và `main` ↔ `web-home` đã lệch **40/26 commit · 151 tệp**: `main` vẫn giữ `networkId: 9001` — tức A-007 **sống lại nếu build từ `main`** | ĐO ĐƯỢC | REPO + SERVER | 🔴 **mới `28/08`** |
| **A-013** | P2 | tối ưu | Trên **máy chủ thật**: `stats` đã restart **773 lần**, `user-ops-indexer` **298 lần** — vòng lặp chết của explorer vứt đi, chạy liên tục | ĐO ĐƯỢC | SERVER | 🔴 **mới `28/08`** (nâng từ Q-3) |

---

## Chi tiết

### A-001 — Bản sao lưu ngoài máy duy nhất mô tả một mạng ĐÃ BỊ XOÁ

**Mức:** 🔴 **P0** *(nâng từ P1 lúc `27/08 15:30Z` — xem "Nâng mức" cuối mục)* · **Mặt:** cấu trúc
**Tin cậy:** ĐO ĐƯỢC · **Nguồn:** REPO + bản sao lưu trên máy dev

**Bằng chứng:**

```
$ git remote -v
(rỗng — repo 9Chain-A1 KHÔNG có remote nào)

$ git -C upstream/avalanchego remote -v
origin  https://github.com/ava-labs/avalanchego.git (fetch)
origin  https://github.com/ava-labs/avalanchego.git (push)
   ⇒ nhánh chủ quyền `9chain-a1` không có nơi nào để push

$ head -12 C:/PROJECTS/9Chain-backups/9chain-a1-backup-20260827-051507/MANIFEST.txt
  HEAD          15f9076  HANDOFF: chot phien dot 12
  commit        167
  patch          12

$ git rev-list --count 15f9076..main
26

$ diff <(ls .../avalanchego-patches/) <(ls patches/)
> 0013-9chain-a1-soat-core-ke-toan-tong-cung-cong-theo-netw.patch
> 0014-9chain-a1-khai-B-11-thanh-chu-trong-ma-D-051-uptime-.patch
> 0015-netgen-cong-ban-tap-ban-that-cho-chainId-C-4-B-11.patch
> 0016-netgen-sinh-cung.json-ban-khai-cung-MAY-DOC-DUOC-I1b.patch
> 0017-netgen-compose-khai-restart-unless-stopped-cho-moi-n.patch
```

**Kịch bản hỏng** — ổ `C:` của máy dev hỏng tối nay. Phục hồi từ bản trên máy chủ
(`139.99.145.13:~/9chain-a1/backup/20260827-051507/`) cho ra một cây mã **không có
patch 0013**: `SupplyCap` quay lại 9 tỷ (đúng cái P0 mà lần soát core vừa đóng),
`upgrade.A1` biến mất nên 9001 lại dùng bảng `Default` của Ava Labs, `A1HRP` lại
sống bằng `FallbackHRP`. Cộng thêm 26 commit mất trắng: **D-071 → D-078**, toàn bộ
bản soát vận hành, bản `HIEN-TRANG` hôm nay, ba bản vá Caddy, và cổng D-075.
Không dấu hiệu nào báo — bản sao lưu **vẫn nghiệm thu xanh**, vì nó lành; nó chỉ cũ.

**Đối chứng ngược** — quy trình H-6b **đã có** đối chứng ngược cho tính *lành*
(bundle cắt cụt bị từ chối đúng). Thứ chưa có cổng nào là tính *mới*: không phép
đo nào so `HEAD` của bản sao lưu với `HEAD` hiện tại. Để chứng minh cổng mới biết
đỏ: đặt một commit rồi chạy phép so — phải ra đỏ ngay ở commit thứ nhất.

**Điều kiện qua:**
```
git rev-list --count <HEAD-trong-MANIFEST>..main   →  0
ls <backup>/avalanchego-patches/ | wc -l           →  17   (bằng `ls patches/ | wc -l`)
```
Và: chạy lại H-6b **sau mỗi phiên có commit**, không phải theo lịch tuỳ hứng.

**Liên quan:** H-6 / H-6b (`BLOCKERS.md:405`), D-044, rủi ro #1 của `HIEN-TRANG` §6.
Ghi chú: đây **không phải** phát hiện mới về *khoá* — khoá vẫn nằm ngoài mọi bản
sao lưu, cố ý. Đây là phát hiện rằng **mã** nay có đúng tính chất mà người ta
tưởng chỉ khoá mới có.

#### 🔴 NÂNG MỨC P1 → P0 — đo lại `27/08 15:30Z`, sau khi mạng công khai sinh lại

```
$ git ls-tree --name-only 15f9076 patches/ | wc -l     ← HEAD của bản sao lưu
12
$ git ls-tree --name-only main patches/ | wc -l
18
$ git rev-list --count 15f9076..main
31
```

**Patch 0013–0018 không có mặt trong bản sao lưu dưới bất kỳ dạng nào** — không trong
`avalanchego-patches/`, và không trong bundle (tại `15f9076`, thư mục `patches/` của
repo cũng chỉ có 12 tệp). Sáu patch đó **chính là định nghĩa của mạng đang chạy**:
`A1Gen` · `A1ID 999999999` · `A1Name 9chain-a1-g0` · `A1HRP` tường minh · `upgrade.A1` ·
`SupplyCap 7.900.000.001` · `LaMangA1` · `restart: unless-stopped`.

⇒ Kịch bản hỏng nay **nặng hơn hẳn**: ổ `C:` hỏng ⇒ thứ dựng lại được là **mạng `9001`
với trần cung 9 tỷ** — đúng cái mạng vừa bị xoá sáng nay **vì nó sai**. Mạng công khai
đang chạy **không dựng lại được từ bất kỳ bản nào ngoài ổ đĩa dev**.

🔴 Đối xứng đáng ghi: D-080 đã cẩn thận **xuất `GỐC` của chuỗi cũ trước khi xoá**. Cùng
ngày đó, **mã sinh ra chuỗi mới không có một bản nào ngoài ổ đĩa dev.** Dữ liệu của cái
đã chết được bảo quản kỹ hơn mã của cái đang sống.

**Điều kiện qua (thay cho bản trên):**
```
ls <backup>/avalanchego-patches/ | wc -l     →  18   (bằng `ls patches/ | wc -l`)
git rev-list --count <HEAD-MANIFEST>..main   →  0
```

---

### A-002 — Cổng canh rebase khẳng định nhánh dự phòng, không khẳng định đường sống

**Mức:** P1 · **Mặt:** công nghệ
**Tin cậy:** ĐO ĐƯỢC · **Nguồn:** REPO

**Bằng chứng:**

```
$ git log -1 --format='%ad' -- scripts/rebase-drill.sh
Tue Aug 25 05:07:07 2026 +0400

$ grep -m1 "^Date:" patches/0013-*.patch
Date: Thu, 27 Aug 2026 10:14:11 +0400        ← cổng cũ hơn patch 2 ngày

$ grep -c "upgrade" scripts/rebase-drill.sh
0                                             ← không đọc upgrade/upgrade.go một lần nào

$ grep -n "doi \"" scripts/rebase-drill.sh
  config.go giữ 2 điều kiện A1NetworkID
  params.go giữ 2 nhánh case A1NetworkID
  client = 9chaingo
  HRP = love9              →  'FallbackHRP = "love9"'      ← canh ĐÚNG dây dự phòng
  token symbol = LOVE9
  VMID = love9evm
  (+ kiểm genesis_9chain_a1.go có mặt)
```

Và chính mã nguồn nói `FallbackHRP` không còn là đường sống
(`utils/constants/network_ids.go:77`):

> *"FallbackHRP giữ nguyên `"love9"` — CỐ Ý, và nay **chỉ là dây bảo hiểm thứ hai
> chứ không phải đường sống**: mọi đường dùng thật đều đi qua `NetworkIDToHRP[A1ID]`."*

**Kịch bản hỏng** — lượt rebase kế tiếp lên một bản upstream có tái cấu trúc
`upgrade/upgrade.go` (Ava Labs lên lịch Helicon là đủ). Patch 0013 xung đột ở
`GetConfig`, người rebase gỡ xung đột bằng cách **bỏ nhánh `case constants.A1ID`**.
Chạy `rebase-drill.sh` ⇒ **7/7 ĐẠT**, vì không mục nào hỏi tới `upgrade.go`.
Kết quả: 9001 rơi lại vào `Default`, tức 9Chain **nuốt trọn lịch hard fork của Ava
Labs mà không qua một quyết định nào** — đúng cái mà patch 0013 được viết ra để
chặn. Không log khác thường, không cổng đỏ; dấu hiệu duy nhất là một hard fork tự
kích hoạt vào ngày Ava Labs chọn.

Biến thể tệ hơn, cũng không cổng nào bắt: `Config` mọc thêm một trường mới sau
rebase. Go **không báo lỗi** cho struct literal thiếu trường — trường mới nhận
`time.Time{}` = **năm 1** = *"đã kích hoạt từ lâu"*. (Chính patch 0013 cảnh báo
điều này thành chữ, rồi không ai làm cổng cho nó.)

**Đối chứng ngược** — sửa `upgrade/upgrade.go` trong worktree diễn tập, xoá dòng
`case constants.A1ID:` ⇒ cổng mới **phải thoát mã 1**. Tương tự: thêm một trường
giả vào `Config` mà không thêm vào `A1` ⇒ phải đỏ.

**Điều kiện qua** — thêm vào `scripts/rebase-drill.sh`:
```
doi "upgrade.go có bảng A1"        upgrade/upgrade.go  "A1 = Config{"            1
doi "GetConfig định tuyến 9001"    upgrade/upgrade.go  "case constants.A1ID:"    1
doi "HRP đi qua map, không fallback" utils/constants/network_ids.go "A1ID:       A1HRP" 1
doi "A1 khai đủ trường Config"     — so số trường của `A1 = Config{...}` với số trường
                                      của `type Config struct` (nay 18/18)
doi "SupplyCap chủ quyền"          genesis/genesis_9chain_a1.go "7_900_000_001"  1
```
Chạy `bash scripts/rebase-drill.sh <ref>` ⇒ **12/12 đạt** (7 cũ + 5 mới).

**Liên quan:** patch 0013, D-048/049/050, `docs/CORE-AUDIT-2026-08-27.md` §4, A-006.

---

### A-003 — Tệp tự khai "NGUỒN CHÍNH THỨC" đã trôi lệch khỏi mạng nó mô tả

**Mức:** P2 · **Mặt:** cấu trúc
**Tin cậy:** ĐO ĐƯỢC · **Nguồn:** REPO (đối chiếu phép đo SERVER `27/08`)

**Bằng chứng:**

```
$ head -1 local-net/deploy/multinode.compose.yml
# 9Chain-A1 — mạng 5 validator SẢN XUẤT. NGUỒN CHÍNH THỨC LÀ TỆP NÀY.

$ grep -cE "^  9chain-a1-node-[0-9]+:" local-net/deploy/multinode.compose.yml
5                                      ← mạng thật: 9

$ grep -c "restart:" local-net/deploy/multinode.compose.yml
0                                      ← mạng thật: `unless-stopped` × 9 (D-071, `27/08`)

$ git log -1 --format='%ad %s' -- local-net/deploy/multinode.compose.yml
Wed Aug 26 13:32:01 2026 +0400  P1-1: dua compose san xuat vao git
```

Bản vá `restart:` **đã vào nguồn** — nhưng vào `netgen` (patch 0017), tức vào
*bộ sinh*, không vào *bản đã sinh* đang nằm trong git.

**Kịch bản hỏng** — máy chủ hỏng, dựng lại từ repo. Người dựng lấy
`local-net/deploy/multinode.compose.yml` (tệp tự nhận là nguồn chính thức) và
được một mạng **5 validator không có `restart:`** — tức đúng trạng thái mà D-071
vừa sửa: máy reboot ⇒ web dậy, faucet dậy, explorer dậy, **9 validator nằm im**,
mọi dấu hiệu bên ngoài vẫn xanh. Đây là lần **thứ tư** của cùng một lớp lỗi (B-5,
B-6, vụ `:9660` ghi ngay trong đầu tệp này).

**Đối chứng ngược** — cổng phải so **tệp trong git** với `docker compose config`
của bản đang chạy trên máy chủ và ra đỏ khi lệch. Đặt thử một node giả vào bản
repo ⇒ phải đỏ.

**Điều kiện qua:** một trong hai —
(a) tái sinh tệp bằng `netgen` N=9 rồi commit, `grep -c "restart: unless-stopped"` → **9**; hoặc
(b) nếu tệp này **không** còn là nguồn chính thức thì **sửa dòng đầu**, và nói rõ nguồn thật ở đâu.
Không được để nguyên câu "NGUỒN CHÍNH THỨC" trên một tệp không còn đúng.

**Liên quan:** D-071, D-071b, patch 0017, P1-1 (`SOAT-TOAN-DIEN` §deploy), B-5, B-6.

---

### A-004 — Faucet giữ khoá có tiền nhưng không ghim thư viện ký

**Mức:** P2 · **Mặt:** bảo mật
**Tin cậy:** ĐO ĐƯỢC · **Nguồn:** REPO

**Bằng chứng:**

```
$ cat local-net/faucet/package.json
{ "name": "9chain-a1-faucet", ..., "dependencies": { "ethers": "^6.13.0" } }

$ ls local-net/faucet/ | grep -i lock
(không có)

$ cat local-net/console/package.json | grep -A2 dependencies
  "dependencies": { "ethers": "6.17.0" }        ← ghim CHÍNH XÁC, có package-lock.json

# và lý do ghim, chính console viết ra:
"Phiên bản GHIM CHÍNH XÁC, không dùng ^: đây là đường xác thực, và bản vá bất ngờ
 của thư viện không được phép tự vào máy chủ điều phối docker."
```

Faucet ký giao dịch thật: `new ethers.NonceManager(new ethers.Wallet(PK, provider))`
với `FAUCET_PK` — ví `0xC15822D4…`, số dư đo được `99.999.977` LOVE9.

**Kịch bản hỏng** — một bản `ethers` 6.x bị chiếm (hoặc chỉ đơn giản là hồi quy)
phát hành lúc 03:00. Lần dựng lại container faucet kế tiếp `npm install` kéo nó
về, vì `^6.13.0` cho phép và **không có lockfile để cản**. Thư viện đó nằm đúng
trên đường ký của một ví có tiền và có `NonceManager` tự cấp nonce. Console —
cùng repo, cùng máy — **miễn nhiễm theo cấu trúc**. Chênh lệch này không có lý do
kỹ thuật nào; nó là chỗ chưa ai đi tới.

**Đối chứng ngược** — sinh lockfile, đổi `ethers` sang một bản khác trong
`package.json` mà không cập nhật lockfile ⇒ `npm ci` **phải** thất bại.

**Điều kiện qua:**
```
grep '"ethers"' local-net/faucet/package.json   →  "ethers": "6.17.0"   (không có ^)
ls local-net/faucet/package-lock.json            →  tồn tại
npm ci --prefix local-net/faucet                 →  exit 0
```
Cùng lượt: `local-net/deploy-test/package.json` (`^6.13.0`, `solc: ^0.8.26`).

**Liên quan:** D-020 (lý do console ghim), Q-4.

---

### A-005 — Explorer chạy hoàn toàn không ghim, trong khi console ghim tới từng gói

**Mức:** P2 · **Mặt:** bảo mật + tối ưu
**Tin cậy:** ĐO ĐƯỢC · **Nguồn:** REPO + máy dev

**Bằng chứng:**

```
$ grep -n "image:" explorer-full/9chain-a1-server.override.yml
(không ghim image nào — thừa kế compose của Blockscout)

$ grep -n "git clone" explorer-full/setup.sh
git clone --depth 1 --filter=blob:none --sparse https://github.com/blockscout/blockscout.git
   ⇒ không --branch, không tag, không commit: lấy `main` tại thời điểm chạy

$ docker ps --format '{{.Names}}\t{{.Image}}'          # máy dev
frontend           ghcr.io/blockscout/frontend:latest
backend            ghcr.io/blockscout/blockscout:latest
stats              ghcr.io/blockscout/stats:latest
user-ops-indexer   ghcr.io/blockscout/user-ops-indexer:latest
visualizer         ghcr.io/blockscout/visualizer:latest
sig-provider       ghcr.io/blockscout/sig-provider:latest
```

**Kịch bản hỏng** — hai đường, cả hai không cần ai tấn công A1:

1. **Đứt gãy im lặng.** Blockscout đẩy một `:latest` đổi schema DB. Lần `docker
   compose up` kế tiếp (kể cả một lượt restart bình thường) kéo bản mới, migration
   chạy nửa chừng, explorer công khai của A1 hỏng — mà **không một dòng nào trong
   repo A1 thay đổi**, nên không ai truy được nguyên nhân từ git.
2. **Chuỗi cung ứng.** `backend` giữ **một bản sao đầy đủ dữ liệu chuỗi** trong
   Postgres và nói chuyện trực tiếp với RPC của node. Một image `:latest` bị chiếm
   là một tiến trình lạ có đường tới RPC nội bộ. Không chữ ký, không digest, không
   ghim — không có cách nào phát hiện ngoài việc tự nhìn.

⚠️ Không trích mạnh hơn phép đo: **chưa xác nhận trên máy chủ**, mới đo trên máy
dev. Nhưng máy chủ dựng bằng đúng `setup.sh` này, và `setup.sh` không có đường nào
sinh ra tag ghim.

**Đối chứng ngược** — sau khi ghim bằng digest, đổi một chữ trong digest ⇒
`docker compose pull` **phải** từ chối.

**Điều kiện qua:**
```
grep -c "image:.*@sha256:" explorer-full/9chain-a1-server.override.yml   →  ≥ 6
grep -n "git clone" explorer-full/setup.sh                              →  có --branch <tag> hoặc checkout <commit>
```
Nếu David quyết **không** ghim (explorer là thứ vứt đi được, thay bằng 9Scan-A1
sau), thì ghi thành quyết định — chứ đừng để nó là chỗ chưa ai điền.

**Liên quan:** memory *9Scan-A1 explorer* (mục tiêu thay Blockscout), `SOAT-TOAN-DIEN`
§9 (backend 57,5% CPU vs 9 node 26,1%), Q-3.

---

### A-006 — Lớp chủ quyền core không có một test Go nào

**Mức:** P2 · **Mặt:** công nghệ
**Tin cậy:** ĐO ĐƯỢC · **Nguồn:** REPO

**Bằng chứng:**

```
$ cd upstream/avalanchego
$ grep -rln "A1ID\|A1Name\|A1HRP\|upgrade\.A1" --include=*_test.go .
(rỗng)

$ grep -rn "A1ID\|A1Name\|A1HRP\|upgrade\.A1" --include=*.go . | grep -v _test
genesis/genesis_9chain_a1.go:36   const A1NetworkID = constants.A1ID
upgrade/upgrade.go:257            case constants.A1ID:
utils/constants/network_ids.go:32 A1ID uint32 = 9001
utils/constants/network_ids.go:56 A1Name = "9chain-a1"
utils/constants/network_ids.go:75 A1HRP = "love9"
utils/constants/network_ids.go:98  A1ID: A1Name     ← đổi đường dẫn DB
utils/constants/network_ids.go:120 A1ID: A1HRP      ← tiền tố mọi địa chỉ P/X
```

Bảy chỗ định nghĩa danh tính mạng — trong đó hai chỗ đổi thứ **bất biến sau khi
phát ra ngoài** (đường dẫn DB, tiền tố địa chỉ) — và **không dòng test nào**.
Cổng duy nhất chạm được lớp này là `check-consistency.mjs`, và nó chỉ đọc
`SupplyCap`; nó không biết `A1HRP` hay `upgrade.A1` tồn tại.

**Kịch bản hỏng** — một lượt rebase (hoặc một lượt dọn dẹp) làm rơi
`A1ID: A1HRP` khỏi `NetworkIDToHRP`. `go test ./...` **xanh sạch**. Hôm nay hành
vi không đổi vì `FallbackHRP` vẫn là `"love9"` — nên **không ai phát hiện**. Lượt
rebase sau đó, upstream đặt lại `FallbackHRP = "custom"` (giá trị của họ); lần này
cũng không test nào đỏ, nhưng **mọi địa chỉ P/X đổi tiền tố** từ `P-love9…` sang
`P-custom…`. Địa chỉ đã công bố ra ngoài trở thành không đọc được, và nếu điều đó
đi qua ngày G thì nó nằm trong genesis bất biến.

**Đối chứng ngược** — test mới phải đỏ khi xoá dòng `A1ID: A1HRP`, và phải **vẫn
đỏ** kể cả khi `FallbackHRP` còn là `"love9"` (nếu nó xanh nhờ fallback thì nó
đang đo sai đại lượng — đúng bẫy `a1-phep-kiem-do-sai-dai-luong`).

**Điều kiện qua** — thêm `utils/constants/network_ids_a1_test.go`:
```go
require.Equal(t, "love9",     NetworkIDToHRP[A1ID])       // đọc MAP, không gọi GetHRP()
require.Equal(t, "9chain-a1", NetworkIDToNetworkName[A1ID])
require.Equal(t, A1ID,        NetworkNameToNetworkID[A1Name])
```
và `upgrade/upgrade_a1_test.go`:
```go
require.Equal(t, A1, GetConfig(constants.A1ID))            // 9001 KHÔNG rơi vào Default
require.Equal(t, reflect.TypeOf(Config{}).NumField(),
               soTruongDaKhai(A1))                          // thiếu trường = năm 1 = đã kích hoạt
```
Chạy `go test ./utils/constants/... ./upgrade/...` ⇒ đạt.

**Liên quan:** A-002 (cùng chỗ hở, khác lớp), patch 0013, D-050.

---

### A-007 — Sáu trang công khai của A1 khai một `networkID` đã chết

**Mức:** P1 · **Mặt:** mã nguồn
**Tin cậy:** ĐO ĐƯỢC · **Nguồn:** SERVER (`27/08 15:30Z`) + REPO

**Bằng chứng:**

```
$ for u in / /compare/ /re-genesis/ /faucet/ /create-chain/ /my-chains/; do
    curl -s https://a1.9chain.org$u | grep -c 9001; done
1 1 1 1 1 1                       ← 6/6 trang, mỗi trang một lần

$ curl -s https://a1.9chain.org/ | grep -o '.\{40\}9001'
Chain ID 9000000009 · LOVE9 · networkID 9001        ← chân trang

$ curl -s -d '{"jsonrpc":"2.0","id":1,"method":"info.getNetworkID"}' \
       https://rpc-a1.9chain.org/ext/info
{"result":{"networkID":"999999999"}}                ← sự thật

$ grep -n networkId web/lib/chain.ts
23:  networkId: 9001,                                ← một nguồn, một dòng
```

**Kịch bản hỏng** — một người muốn chạy node cộng đồng (đúng thứ A1 đang mời gọi) đọc
chân trang, đặt `--network-id=9001`. D-079 đã **đo** hậu quả của lệch băng mạng bằng
bài xâm nhập có đối chứng dương: `numPeers 0`, bị cắt, log
`peer.go:826 {"field":"networkID","peerNetworkID":…,"ourNetworkID":…}`. Người đó thấy
node chạy, không lỗi rõ ràng, không peer nào — và kết luận **mạng A1 hỏng**. Con số sai
nằm ngay cạnh hai con số đúng (`9000000009`, `LOVE9`) nên nó đọc như đã được kiểm.

**Đối chứng ngược** — cổng phải so `web/lib/chain.ts` với `info.getNetworkID` của mạng
thật và ra **đỏ** khi lệch. Chứng minh nó biết đỏ: đặt tạm `networkId: 9002` ⇒ phải đỏ.
Cổng chỉ so "trang trả 200" **không phân biệt được hai trạng thái** — chính nó vừa để
lọt ca này (D-081 ghi *"6 trang công khai 200 hết"*).

**Điều kiện qua:**
```
grep -n networkId web/lib/chain.ts                       →  networkId: 999999999
curl -s https://a1.9chain.org/ | grep -c 9001            →  0
```
Và mỗi thế hệ sau đổi đúng một dòng này — hoặc tốt hơn: trang **đọc `info.getNetworkID`
từ RPC** như nó đã làm với validator/block, thay vì cắm cứng.

**Liên quan:** D-076, D-079, D-081, A-008, memory `a1-phep-kiem-do-sai-dai-luong`.

---

### A-008 — Explorer công khai nhận đúng dữ liệu rồi không vẽ gì cả

**Mức:** P1 · **Mặt:** mã nguồn (sản phẩm của 9Scan-A1, phục vụ chuỗi của A1)
**Tin cậy:** ĐO ĐƯỢC — **trình duyệt thật**, không phải `curl` · **Nguồn:** SERVER

**Bằng chứng:**

```
trình duyệt → https://a1.9scan.org/   (tải lại sạch, chờ 5s, lặp 2 lần)
  title:  "9Scan A1 — 9Chain block explorer · 9001"
  màn hình: "connecting…" ×2
            LATEST BLOCK —   TOTAL SUPPLY —   VALIDATORS —   GAS PRICE —
            Latest blocks: rỗng     Latest transactions: rỗng
            Network information → CHAIN ID  9001 · EVM 9000000009
  console: KHÔNG một lỗi nào
  mạng:    19 tệp tĩnh → 200
           ĐÚNG MỘT lượt POST /rpc/ext/bc/C/rpc → 200, thân trả về:
             block number 0x1 · chainId 0x218711a09 · (kết quả thứ ba)

# hạ tầng của chính nó thì lành:
$ curl -d '{"method":"info.getNetworkID"}' https://a1.9scan.org/rpc/ext/info
{"result":{"networkID":"999999999"}}
```

**Kịch bản hỏng** — trang faucet của A1 ghi `EXPLORER → 9Scan-A1 ↗`. Người vừa nhận
token bấm sang để xem giao dịch của mình, thấy một explorer trống trơn khai `9001`, và
kết luận **giao dịch không tồn tại** hoặc **mạng chết**. Giao dịch có thật: block 1,
hash `0x635f2183…`, đọc lại được bằng RPC bất cứ lúc nào.

**Đối chứng ngược** — phép đo này **phân biệt được**: cùng lượt đo, `a1.9chain.org`
render **9/9 validators · L1s 0 · C-Chain block 1** từ đúng chuỗi đó. Nên "trống" ở
`a1.9scan.org` là *trống thật*, không phải trình duyệt hỏng hay mạng chặn.

**Điều kiện qua:**
```
trình duyệt → https://a1.9scan.org/   →  LATEST BLOCK ≥ 1 · VALIDATORS 9 · CHAIN ID 999999999
```
Không nhận `HTTP 200` làm điều kiện qua — đó chính là bậc thang đã để lọt ca này.

**Liên quan:** A-007, `docs/requests-from-9scan/` (đường báo cho đội 9Scan đã có sẵn).

---

### A-009 — Nút chính của trang chủ dẫn tới việc không thể thành công, và tiêu suất của người dùng

**Mức:** P1 · **Mặt:** mã nguồn
**Tin cậy:** ĐO ĐƯỢC (trang) + SUY RA TỪ MÃ (console) · **Nguồn:** SERVER + REPO

**Bằng chứng:**

```
D-081 §"Còn lại, KHÔNG được quên" #1:
  "chain-factory chưa nạp tiền P-Chain ⇒ đẻ chain CHƯA DÙNG ĐƯỢC"

trình duyệt → https://a1.9chain.org/
  "Launch your own chain on A1 … Takes about three minutes."  [Launch your chain]
trình duyệt → https://a1.9chain.org/create-chain/
  "Connect wallet … the network builds the chain in about three minutes."
  ⇒ KHÔNG một dòng nào nói dịch vụ đang không dùng được

$ grep -n "getBalance\|so du" local-net/console/server.mjs
(không có phép kiểm số dư nào trong createChain)

$ sed -n 68,78p local-net/lib/guard.mjs
    arr.push(now);            ← check() TIÊU một suất ngay lúc kiểm,
    hits.set(key, arr);          trước khi thao tác chạy
```

**Kịch bản hỏng** — người dùng thật nối ví, ký SIWE, bấm tạo. Mọi phép kiểm rẻ đi qua
(tên hợp lệ, chưa trùng, chưa đụng trần, chainId cấp được). `moTienTrinh` mở, thanh tiến
trình chạy. Bước `subnet` gọi `9chain-a1-cli l1 create` và **ví trả phí rỗng** ⇒ hỏng,
trả lỗi thô. Người dùng đã **mất 1 trong 3 lượt/giờ** và ~3 phút chờ. Thử lại: mất
tiếp. Ba lần là **khoá suất một giờ** cho một dịch vụ chưa từng có khả năng chạy.

**Đối chứng ngược** — phép kiểm số dư phải **đỏ khi ví rỗng** và **xanh khi đủ tiền**.
Bộ `smoke-l1` đã chứng minh vế xanh trên thế hệ trước (25/25, đẻ chain thật 305,5s).

**Điều kiện qua** — thêm vào đầu `createChain`, **trước `moTienTrinh`**:
```
platform.getBalance{addresses:["P-<chain-factory>"]}  →  ≥ phí một lượt (0,000141468 LOVE9)
```
rỗng ⇒ ném lỗi **tức thì**, câu chữ nói rõ *"dịch vụ đang tạm dừng, không phải lỗi của bạn"*,
và **không tiêu suất** (kiểm trước khi gọi `check()`, hoặc hoàn suất khi hỏng vì lý do hệ thống).
Cùng lượt: trang `/create-chain/` đọc trạng thái đó và **nói ra**, thay vì mời bấm.

**Liên quan:** D-081, D-030, `VI-VAN-HANH.md` §Ví chain-factory.

---

### A-010 — `--network-id=9001` còn cắm cứng trong compose đang ở git

**Mức:** P2 · **Mặt:** cấu trúc
**Tin cậy:** ĐO ĐƯỢC · **Nguồn:** REPO

**Bằng chứng:**

```
$ grep -rn "network-id=9001" local-net --include=*.yml | cut -d: -f1 | sort -u
local-net/deploy/multinode.compose.yml     ← "NGUỒN CHÍNH THỨC LÀ TỆP NÀY" (dòng 1)
local-net/deploy/node.compose.yml
local-net/docker-compose.yml
local-net/docker-compose.drill.yml
```

D-079 đã gặp **đúng lỗi này** ở compose do netgen sinh, và vá **trong netgen**:
> *"`--network-id=9001` cắm cứng ⇒ node từ chối khởi động: conflicting networkIDs …
> nó phơi ra rằng netgen từng có hai nguồn sự thật cho cùng một con số."*

Bản **đã sinh, đang nằm trong git** thì chưa ai đụng.

**Kịch bản hỏng** — máy chủ hỏng, dựng lại từ repo. Node báo
`conflicting networkIDs: expected 9001 but config contains 999999999` và không lên.
Lỗi này **hiền** (nổ to, đúng chỗ) — nguy hiểm nằm ở bước sau: người đang cuống dễ
"sửa" bằng cách hạ genesis về 9001, tức dựng lại **đúng mạng vừa bị xoá vì nó sai**.

**Đối chứng ngược** — sinh lại compose bằng netgen ở thế hệ hiện tại rồi so với bản
trong git; đặt tạm một số sai vào bản sinh ra ⇒ phép so phải đỏ.

**Điều kiện qua:**
```
grep -rc "network-id=9001" local-net --include=*.yml   →  0
grep -c "restart: unless-stopped" local-net/deploy/multinode.compose.yml  →  9
grep -cE "^  9chain-a1-node-[0-9]+:" local-net/deploy/multinode.compose.yml →  9
```
Hoặc: **sửa dòng 1** nếu tệp này không còn là nguồn chính thức — nhưng đừng để nguyên
câu "NGUỒN CHÍNH THỨC" trên một tệp không dựng lại được mạng.

**Liên quan:** A-003, D-079, P1-1.

---

## Quan sát — chưa đủ thành phát hiện

| # | Quan sát | Cần gì để kết luận |
|---|---|---|
| Q-1 | `A1_CLI_KEY` đi vào **argv** của `docker compose exec -e` (`local-net/console/server.mjs:783`). `scrub()` chặn rò qua log và qua phản hồi HTTP, nhưng không chặn ai đọc `/proc/*/cmdline` của host trong ~170s mỗi lượt đẻ chain. Máy chủ có khối lượng việc của đội khác (9Scan) chạy cùng. | Chứng minh có tiến trình **không phải của A1** đọc được `/proc` của host. Nếu chỉ root đọc được thì đây là nợ kỹ thuật (chuyển sang `--env-file` hoặc stdin), không phải lỗ hổng |
| Q-2 | `BLOCKERS.md:487` ghi bản sao lưu `27/08` là HEAD `dd053d8` / 165 commit; `MANIFEST.txt` trên đĩa ghi HEAD `15f9076` / 167 commit | Sổ sách lệch vật chứng. Vô hại hôm nay — nhưng lúc phục hồi thì người ta đọc sổ, không mở manifest |
| Q-3 | Máy dev đang chạy 10 container Blockscout trong khi `9chain-a1-node` đã `Exited (0) 3 ngày`; `user-ops-indexer` **Restarting** liên tục | Là máy dev, chưa đo tác động. Nhưng lặp lại đúng tỷ lệ chi phí đã đo trên máy chủ |
| Q-4 | `local-net/deploy-test/package.json` cũng `^6.13.0` + `solc: ^0.8.26` | Nếu David chốt "ghim mọi nơi" thì đây là 3 tệp, không phải 1 (xem A-004) |
| Q-5 | Con số "27 bộ kiểm" trong `HIEN-TRANG` §5 — đo lại trong worktree này ra **20** tệp mang tên `*test*`/`check-*`/`*drill*` | Có thể bản cũ đếm cả cổng shell trong `deploy/` và mục nghiệm thu. Không hại, nhưng một con số công bố nên tra được |

---

## Chưa đo được — và vì sao

| # | Muốn đo gì | Bị chặn bởi | Ai/khi nào đo được |
|---|---|---|---|
| C-1 | **Build lại core trên bản ghim `15c940e`** | avalanchego cần CGO (blst, zstd, libevm) + syscall Unix. Đo thật: `GOOS=linux CGO_ENABLED=0 go vet ./9chain-a1-tools/...` thoát **1** với 3 lỗi đúng của việc tắt CGO (`blst: undefined: Message` · `libevm/crypto: assignment mismatch` · `zstd: build constraints exclude all Go files`) — **không phải lỗi mã A1**. Windows không có toolchain cross-compile CGO | worktree `main` (Docker Linux), hoặc `docker build` ở đây nếu David duyệt tốn CPU |
| C-2 | **Chạy `rebase-drill.sh` để thấy A-002 đỏ** | Cần `git worktree add` trên repo fork; worktree này bị cấm đổi HEAD của `upstream/` (`CLAUDE.md` luật 5) | worktree `main` |
| C-3 | **`npm audit` cho `ethers` của faucet** | Không có lockfile để audit — đó chính là A-004 | bất kỳ ai, ngay sau khi sinh lockfile |
| C-4 | **Bundle web thật (`check-budget.mjs`)** | Cần `pnpm install` + `next build`; worktree soát không cài phụ thuộc | worktree `main` |
| C-5 | **A-005 trên MÁY CHỦ** (mới đo trên máy dev) | Luật "chỉ đọc" cho phép `docker ps`, nhưng phiên này chưa chạm máy chủ | phiên sau, `docker ps --format '{{.Image}}'` là đủ và hoàn toàn chỉ-đọc |
| C-6 | **`A1_HTTP_ALLOWED_HOSTS` trên node công khai** — D-081 §3 hỏng #2 ghi *"netgen KHÔNG sinh `.env`"*, thiếu nó thì node lấy `--http-allowed-hosts=*` | Node chỉ với tới được qua Caddy, mà Caddy **viết lại** `Host` (`header_up Host {upstream_hostport}`). Từ Internet **không có đường nào** đo bộ lọc Host của node | trên máy chủ: `grep A1_HTTP_ALLOWED_HOSTS ~/9chain-a1/net/.env` — một dòng, chỉ đọc |
| C-7 | **Số dư P-Chain của `chain-factory`** (A-009) | Địa chỉ nằm trong `console.env` **trên máy chủ**; không tệp nào trong repo có nó | trên máy chủ, hoặc David dán địa chỉ `P-…` vào đây rồi đo bằng `platform.getBalance` công khai |
| C-8 | **Blockscout còn giữ block của thế hệ trước không** | Không thấy đường công khai nào tới Blockscout — `a1.9scan.org` là explorer **tĩnh** của 9Scan, không phải Blockscout | trên máy chủ: `docker exec … psql -c 'select max(number) from blocks'` |

---

## Phép đo mới, nên thành cổng — `supplyCap` đo được TỪ NGOÀI

D-079 tìm ra lỗi `supplyCap = 720.000.000` bằng cách **boot node và đọc log**. Phép đo
dưới đây cho cùng kết luận **chỉ bằng RPC công khai**, không shell, không log, không
container — tức dùng được cho **mạng công khai**, không chỉ mạng tập.

Nghịch đảo `vms/platformvm/reward/calculator.go` (`reward ∝ SupplyCap − currentSupply`)
với `A1Params` thật, rồi so với `potentialReward` mà `platform.getCurrentValidators` trả về:

| Giả thuyết | `potentialReward` node[0] |
|---|--:|
| `SupplyCap = 7.900.000.001` | **82.876.379.811.608** |
| `SupplyCap = 720.000.000` (tràn ngược `uint64`) | 342.250.535.647.739 |
| **ĐO THẬT `27/08 15:30Z`** | **82.876.379.811.608** ✓ |

⇒ Khớp **từng đơn vị**; ca tràn lệch **4,13 lần** ⇒ phép đo **phân biệt được**, tức nó
biết báo đỏ. Chi tiết: `docs/AUDIT-A1/11-CHAIN-CONG-KHAI-G0-2026-08-27.md` §2.

---

# SOÁT LẠI LƯỢT 2 — `2026-08-28`

Đo lại **toàn bộ** 10 phát hiện cũ trên `main @ 40bcc6c` · core `03ccd70` (24 patch) ·
mạng công khai g0 đang chạy. Không lệnh nào đổi trạng thái máy chủ.

## 1. Bảng trạng thái sau khi đo lại

| ID | Trạng thái `28/08` | Thay đổi so với lượt 1 |
|---|---|---|
| A-001 | 🔴 **P0 · xấu thêm** | backup 12 patch vs repo **24** · **45 commit** sau (trước: 31) |
| A-002 | 🔴 mở, y nguyên | `rebase-drill.sh` không đổi từ `25/08`; `grep -c upgrade` = **0** |
| A-003 | 🔴 mở, y nguyên | 5 node · 0 `restart:` · dòng 1 vẫn "NGUỒN CHÍNH THỨC" |
| A-004 | 🔴 mở, y nguyên | `^6.13.0`, không lockfile |
| A-005 | 🔴 mở — **nay ĐO ĐƯỢC TRÊN MÁY CHỦ** | C-5 đã đóng: 6 image `:latest` + `nginx`/`redis:alpine`/`caddy:2-alpine` trôi nổi |
| A-006 | 🟠 **nhích một phần** | Có test cho **băng bí danh tài sản** (patch 0022). `A1HRP`/`A1Name`: **0 test**. `upgrade/`: **0 test A1** |
| A-007 | ✅ đóng phía sản phẩm · 🔴 **hở lại phía nguồn** | 6/6 trang trả `999999999`, nhưng `main` vẫn `networkId: 9001` ⇒ **A-012** |
| A-008 | 🔴 **mở, sau ~34 giờ** | Đo lại bằng trình duyệt thật: y hệt |
| A-009 | 🟡 nửa đóng — **nửa console nay ĐO ĐƯỢC trên máy chủ** | Cổng D-087 có trong tệp đang chạy, `A1_DE_CHAIN_MO` **vắng** ⇒ đóng thật. Trang **vẫn mời**. Và **suất vẫn bị tiêu** |
| A-010 | 🔴 mở, y nguyên | 4 tệp `.yml` **đang được git theo dõi** vẫn `--network-id=9001` |

**Bằng chứng đo lại — mạng công khai còn lành:**

```
$ curl -s -H 'content-type:application/json' -d '{"method":"info.getNetworkID"}' \
       https://rpc-a1.9chain.org/ext/info
{"result":{"networkID":"999999999"}}

$ ... info.getNetworkName  ->  {"networkName":"9chain-a1-g0"}
$ ... eth_chainId (C)      ->  0x218711a09      (= 9.000.000.009)
$ ... platform.getCurrentValidators -> 9 validator
   potentialReward[0] = 82.876.379.811.608
```

⇒ Phép đo `supplyCap` **từ ngoài** (mục cuối lượt 1) cho **đúng con số cũ, từng đơn vị**.
Giả thuyết tràn `720.000.000` sẽ ra `342.250.535.647.739` — lệch **4,13 lần**. Cổng vẫn
**phân biệt được**, và mạng đang chạy vẫn đúng `SupplyCap = 7.900.000.001`.

## 2. A-001 — đo lại, và sổ sách vẫn nói ngược

```
$ head -12 C:/PROJECTS/9Chain-backups/9chain-a1-backup-20260827-051507/MANIFEST.txt
  HEAD     15f9076   ·   commit 167   ·   patch 12

$ ls <backup>/avalanchego-patches/ | wc -l      ->  12
$ ls C:/PROJECTS/9Chain-A1/patches/ | wc -l     ->  24
$ git -C C:/PROJECTS/9Chain-A1 rev-list --count 15f9076..main
45

$ diff <(ls <backup>/avalanchego-patches/) <(ls patches/)
> 0013 ... 0024        <- THIẾU MƯỜI HAI PATCH
```

Mười hai patch vắng mặt gồm cả những thứ **định nghĩa mạng đang chạy và các quyết
định David đích thân chốt**: `A1Gen` (0018) · bí danh tài sản X-Chain (0019) ·
`netgen` sinh `.env` + **chặn mạng THẬT sinh nhầm** (0020) · gỡ thương hiệu Avalanche
khỏi ví X/P (0021) · `LOVE9` dứt khoát, từ chối `AVAX` (0022) · `kiem-khoa` (0023) ·
P2P `ipv4port` H-7 (0024).

🔴 **Và sổ vẫn ghi xanh.** `BLOCKERS.md:493`:

> *"H-6 🟡 Repo vẫn chưa có remote — nhưng **H-6b đã chạy, không còn là "một ổ đĩa"**"*

Câu đó đúng lúc viết (`27/08`) và **sai từ commit kế tiếp trở đi**. Nó không có ngày
hết hạn, không cổng nào canh, và nó là câu người ta sẽ đọc lúc cuống. Đây đúng điều
hiến chương §2 gọi là *"một mục đã đóng trên giấy mà nay đỏ lại"*.

Ghi thêm — **Q-2 vẫn lệch**: `BLOCKERS.md` ghi bản `27/08` là HEAD `dd053d8` / 165
commit; `MANIFEST.txt` trên đĩa ghi `15f9076` / 167 commit. Hai con số, cùng một bản sao.

**Điều kiện qua — không đổi:**
```
ls <backup>/avalanchego-patches/ | wc -l     ->  24   (bằng `ls patches/ | wc -l`)
git rev-list --count <HEAD-MANIFEST>..main   ->  0
```
Và `BLOCKERS.md:493` phải bỏ câu *"không còn là một ổ đĩa"* chừng nào hai dòng trên chưa đạt.

---

### A-011 — Console: bề mặt ghi công khai duy nhất là thứ duy nhất không có người canh

**Mức:** 🔴 **P1** · **Mặt:** cấu trúc / vận hành
**Tin cậy:** ĐO ĐƯỢC (tiến trình) + SUY RA TỪ MÃ (hậu quả reboot) · **Nguồn:** SERVER

**Bằng chứng** — `139.99.145.13`, `28/08`, toàn lệnh chỉ-đọc:

```
$ ps -o pid,ppid,user,lstart,args -p 3456928
  PID     PPID  USER    STARTED                    COMMAND
  3456928 1     ubuntu  Thu Aug 27 20:29:33 2026   node local-net/console/server.mjs
                 ^ PPID = 1: mồ côi về init, KHÔNG ai giám sát

$ ss -tlnp | grep 8091
  LISTEN 127.0.0.1:8091   users:(("node",pid=3456928,fd=21))

$ systemctl list-unit-files | grep -iE "console|faucet|9chain|a1-"
  (không một unit nào của dự án)
$ loginctl show-user ubuntu -p Linger      ->  Linger=no
$ crontab -l | grep -i reboot              ->  (không có crontab)
```

Đối chiếu **toàn bộ 30 thành phần còn lại** trên cùng máy — mọi thứ đều có người canh:

```
$ for c in $(docker ps -a --format '{{.Names}}'); do
    echo "$c  $(docker inspect -f '{{.HostConfig.RestartPolicy.Name}}' $c)"; done
  9chain-a1-node-1..9    unless-stopped     <- D-071 đã sửa, đúng
  9chain-a1-caddy        unless-stopped
  9chain-a1-web          unless-stopped
  9chain-a1-faucet       unless-stopped     <- faucet CÓ container, CÓ policy
  9chain-a1-chains       unless-stopped
  9chain-a1-dashboard    unless-stopped
  9chain-a1-explorer     unless-stopped
  9scan-a1-web / -index  unless-stopped
```

⇒ **Console là ngoại lệ duy nhất, và nó là thành phần đắt nhất**: nó giữ `A1_CLI_KEY`,
nó là thứ đẻ ra L1 thật, nó là bề mặt **GHI** duy nhất mở ra Internet từ `25/08`.

**Kịch bản hỏng** — máy chủ reboot (nâng cấp nhân, OVH bảo trì, hoặc chỉ là hết điện).
Docker tự dậy: Caddy dậy, trang chủ dậy, faucet dậy, **9 validator dậy**, explorer dậy.
`a1.9chain.org` xanh hoàn toàn — 9/9 validator, block đang chạy, mọi trang `200`.
Chỉ một thứ không dậy: tiến trình `node` ở cổng `8091`. Caddy proxy tới đó và trả
**502 cho mọi lời gọi `/console/api/*`** — tức đăng nhập ví, đẻ chain, thu hồi, danh
sách chain của tôi. Trang `/create-chain/` **vẫn tải bình thường** và chỉ hỏng đúng lúc
người dùng bấm nút, y như `Caddyfile:578` đã tự cảnh báo về một lỗi khác cùng hình dạng.

Không cổng nào bắt: `check-consistency` đọc số; `check-deploy-drift` so `sha256` **tệp
nguồn** (tệp vẫn nằm đó, khớp từng byte, dù chẳng có tiến trình nào chạy nó); bộ đo
trang chỉ chạm HTML tĩnh. Đây đúng lớp lỗi B-5 / B-6 / D-071 — **lần thứ năm** — và lần
này nó nằm ngoài tầm mắt của chính lượt quét đã sửa bốn lần trước, **vì lượt quét đó
duyệt `docker compose`, mà console không có trong compose**.

Dấu hiệu nó **đã xảy ra rồi**: console khởi động `27/08 20:29`, trong khi caddy lên
`3 ngày` và 9 node lên `11 giờ`. Console trẻ hơn cả hai — tức đã có ít nhất một lượt
ai đó dựng lại nó **bằng tay**.

**Đối chứng ngược** — cổng mới phải **đỏ khi tiến trình chết**, không chỉ khi tệp lệch.
Chứng minh nó biết đỏ: dừng console rồi chạy cổng ⇒ phải thoát mã 1. Cổng chỉ so
`sha256` tệp nguồn **không phân biệt được** hai trạng thái này — nó chính là cổng đang có.

**Điều kiện qua** — một trong hai, không nhận thứ ba:
```
(a)  systemctl is-enabled 9chain-a1-console   ->  enabled
     systemctl is-active  9chain-a1-console   ->  active
(b)  đưa console vào compose với  restart: unless-stopped
     docker inspect -f '{{.HostConfig.RestartPolicy.Name}}' 9chain-a1-console -> unless-stopped
```
Và thêm vào bộ đo một phép **chạm tiến trình thật**, không chạm tệp:
```
curl -s -o /dev/null -w '%{http_code}' https://a1.9chain.org/console/api/health   ->  200
```

**Liên quan:** D-071 (cùng lớp lỗi, đã sửa cho node), B-5, B-6, H-3 (console mở `25/08`),
Q-1 (`A1_CLI_KEY`), memory `a1-cong-chi-chung-minh-duong-cua-no`.

---

### A-012 — Cổng canh repo↔server tự loại đúng bề mặt công khai lớn nhất, và hai nhánh đã lệch thật

**Mức:** **P1** · **Mặt:** cấu trúc
**Tin cậy:** ĐO ĐƯỢC · **Nguồn:** REPO + SERVER

**Bằng chứng:**

```
$ node scripts/check-deploy-drift.mjs
  phạm vi: 18 tệp · 3 nhóm (console · faucet · vantoc)
  18 khớp · 0 lệch · 0 thiếu

$ node -e "...manifest-deploy.json..."
  console => 14 tep · faucet => 3 tep · vantoc => 1 tep
  boQua: [ ... {"mau":"^web/",
              "ly":"thuộc worktree 9Chain-A1-web (nhánh web-home); so với main sẽ báo lệch GIẢ"} ... ]

$ grep -c '"web/' local-net/deploy/manifest-deploy.json      ->  0
```

Lý do viết trong manifest **thành thật và đúng sự thật** — nhưng kết luận rút ra từ nó
là *tắt cổng*, chứ không phải *đổi mốc so sánh*. Và hai nhánh **đã lệch thật, rất xa**:

```
$ git rev-list --count main..web-home     ->  40
$ git rev-list --count web-home..main     ->  26
$ git diff --stat main web-home | tail -1
  151 files changed, 24355 insertions(+), 12883 deletions(-)

$ grep -n networkId  C:/PROJECTS/9Chain-A1/web/lib/chain.ts        # nhánh main
  23:  networkId: 9001,                       <- SỐ CỦA MẠNG ĐÃ BỊ XOÁ
$ grep -n networkId  C:/PROJECTS/9Chain-A1-web/web/lib/chain.ts    # nhánh web-home
  38:  networkId: 999999999,                  <- số đúng, và là bản đang phục vụ
```

**Kịch bản hỏng** — A-007 được đóng ở `web-home` và **đo trên máy chủ** thì xanh; sổ
này đã ghi *"✅ ĐÃ ĐÓNG"* dựa đúng vào phép đo đó. Nhưng nguồn thì chưa đóng. Bất kỳ
lượt nào build site từ `main` — gộp nhánh sai chiều, dựng lại máy chủ từ `main` (đúng
kịch bản A-001 và A-010), hay một phiên tưởng `main` là nguồn của mọi thứ — **phát lại
nguyên vẹn A-007**: sáu trang công khai lại khai `networkID 9001`, mời người lạ đặt
`--network-id=9001`, và D-079 đã đo hậu quả: `numPeers 0`, không lỗi rõ ràng.

Nguy hiểm hơn cả bản thân con số: **nó đã từng được tuyên bố là đóng.** Một mục đóng
rồi mở lại không ai đi kiểm lần hai.

Đối xứng đáng ghi: `check-deploy-drift.mjs` ra đời **chính vì** console lạc hậu 2 ngày
mà mọi cổng vẫn xanh. Nó canh đúng chỗ đã cháy, rồi để trống chỗ chưa cháy — mà chỗ
chưa cháy là **151 tệp** và là toàn bộ thứ người ngoài nhìn thấy.

**Đối chứng ngược** — cổng phải so `web/` **với `web-home`** (mốc đúng), không với
`main`, và ra đỏ khi lệch. Chứng minh nó biết đỏ: đặt tạm `networkId: 9002` vào
`web-home` ⇒ phải đỏ. Cổng so với `main` hôm nay sẽ đỏ **151 tệp** — đỏ giả, đúng như
manifest lo; nên mốc phải đổi, chứ không phải phạm vi bị cắt.

**Điều kiện qua:**
```
grep -n networkId C:/PROJECTS/9Chain-A1/web/lib/chain.ts    ->  networkId: 999999999
# và một trong hai:
(a) manifest có nhóm "web" so với nhánh web-home  ->  0 lệch
(b) main và web-home gộp về một, `git rev-list --count main..web-home` -> 0
```
Nếu David chốt **hai nhánh cứ tách lâu dài**, thì phải ghi thành quyết định, và
manifest phải nói rõ *"web được canh ở nơi khác, tên cổng là ..."* — chứ không để lý do
*"so với main sẽ báo lệch giả"* làm câu kết thúc.

**Liên quan:** A-007, A-001, A-010, D-081, memory `a1-repo-khac-server`.

---

### A-013 — Explorer vứt đi đang chạy vòng lặp chết trên máy chủ sản xuất

**Mức:** P2 · **Mặt:** tối ưu · *(nâng từ Q-3 — nay đã đo trên MÁY CHỦ, không phải máy dev)*
**Tin cậy:** ĐO ĐƯỢC · **Nguồn:** SERVER

**Bằng chứng:**

```
$ docker inspect -f '{{.RestartCount}}' <mỗi container>          # 139.99.145.13, 28/08
  stats               773      policy=always
  user-ops-indexer    298      policy=always
  (mọi container khác: 0)

$ docker ps --format '{{.Names}}\t{{.Status}}'
  stats               Up 7 seconds        <- vừa chết lại
  user-ops-indexer    Up 7 seconds        <- vừa chết lại

$ docker ps --format '{{.Image}}' | grep blockscout
  ghcr.io/blockscout/blockscout:latest · frontend:latest · stats:latest
  user-ops-indexer:latest · visualizer:latest · sig-provider:latest    <- A-005, nay đo được trên MÁY CHỦ
```

**Kịch bản hỏng** — không phải một sự cố, mà một khoản thuế chạy liên tục. `always` +
chết ngay = vòng lặp khởi động không có trần, trên đúng cái máy chứa **9 validator
của mạng công khai**. `SOAT-TOAN-DIEN` §9 đã đo Blockscout tốn **gấp 2,2 lần cả
blockchain**; con số đó đo lúc nó *chạy được*. Ngày G `01/09` là lúc tải đạt đỉnh và
là lúc không sửa lại được — một hàng xóm ồn ào ngốn CPU/IO không giới hạn ngay cạnh
node đồng thuận là rủi ro không cần ai tấn công.

Thêm: cùng máy chủ, `proxy` và `redis-db` của Blockscout để `policy=no` — tức nửa bộ
này không dậy sau reboot còn nửa kia loop vô hạn. Không cấu hình nào ở đây là có chủ ý.

**Đối chứng ngược** — phép đo phân biệt được: 28 container khác trên **cùng** máy đều
`RestartCount = 0`. Nên `773` không phải nhiễu của môi trường.

**Điều kiện qua** — một trong ba, và **phải là một quyết định được ghi ra**:
```
(a) docker compose stop stats user-ops-indexer     -> RestartCount đứng yên
(b) sửa nguyên nhân -> RestartCount không tăng trong 24h
(c) gỡ hẳn Blockscout (memory `9scan-a1-explorer`: mục tiêu vốn là thay nó)
```
Không nhận *"để đấy, nó không hỏng gì"* — nó đang tiêu tài nguyên của mạng công khai
trong bốn ngày cuối trước ngày G.

**Liên quan:** A-005, Q-3, `SOAT-TOAN-DIEN` §9, memory `9scan-a1-explorer`.

#### ✅ QUYẾT ĐỊNH `2026-08-28` — David chốt **(c) gỡ hẳn Blockscout**

Điều kiện qua nói *"phải là một quyết định được ghi ra"* — đây là chỗ ghi.

🔴 **NHƯNG PHÉP ĐO NGAY SAU ĐÓ CHO THẤY (c) KHÔNG PHẢI MỘT LỆNH.** Blockscout **đang
phục vụ công khai**, không phải đang nằm không:

```
$ grep A1_ROOT_UPSTREAM ~/9chain-a1/caddy.env
A1_ROOT_UPSTREAM=127.0.0.1:8100

$ docker port proxy
80/tcp -> 127.0.0.1:8100        ← 8100 CHÍNH LÀ container `proxy` của Blockscout

$ grep -n 'A1_ROOT_UPSTREAM' ~/9chain-a1/Caddyfile
616:  handle /api/*    { reverse_proxy {$A1_ROOT_UPSTREAM:127.0.0.1:80} }
619:  handle /socket/* { reverse_proxy {$A1_ROOT_UPSTREAM:127.0.0.1:80} }
671:  handle           { reverse_proxy {$A1_ROOT_UPSTREAM:127.0.0.1:80} { … } }   ← BẮT-TẤT-CẢ

# BASELINE công khai, đo `28/08` TRƯỚC khi gỡ — dùng để so sau:
/khong-co-trang-nay  →  404  <title>Không có trang này — 9Chain Testnet A1</title>
/tx/0xabc            →  200  text/html
/api/v2/stats        →  200  application/json          ← MÁY ĐỌC
/socket/websocket    →  426  (websocket sống)
```

⇒ **`docker compose down` biến cả bốn dòng trên thành `502`** — kể cả **trang 404 mang
thương hiệu**, thứ David đích thân chọn `27/08` (đường (b)). Trang đó không phải tệp
tĩnh: nó được dựng bằng cách **chặn đúng mã 404 của Blockscout** (`handle_response
@loi404`). Mất upstream ⇒ không còn 404 để chặn ⇒ không còn trang.

Đường lui ghi sẵn trong Caddyfile (`9chain-a1-explorer:8082`, `9chain-a1-dashboard:8092`)
**đã chết từ `26/08`** — chính Caddyfile khai điều đó. Và `web/test/404-caddy.test.ts`
**không bắt được ca này**: nó đọc mã màu trong Caddyfile, không đo upstream còn sống không.

🔴 **Ràng buộc thứ hai, nặng hơn:** explorer thay thế — `a1.9scan.org` — **đang trắng
(A-008 chưa đóng)**. Gỡ Blockscout lúc này = A1 **không còn explorer nào chạy được**,
bốn ngày trước ngày G.

**Quy trình gỡ — hai nửa, KHÔNG làm ngược thứ tự:**

*Nửa đầu — làm được ngay, rủi ro công khai bằng 0:*
```
docker compose stop stats user-ops-indexer
```
Hai thứ này là toàn bộ vòng loop (773 / 298 lần) và **chứng minh được là không nằm trên
đường phục vụ**: chúng chết gần như liên tục mà `/api/v2/stats` vẫn trả `200`.

*Nửa sau — CHỈ sau khi A-008 đóng. Sửa Caddy TRƯỚC, gỡ container SAU:*
```
1. A1_ROOT_UPSTREAM -> 127.0.0.1:8095   (9chain-a1-web; nginx trả 404 ⇒ handle_response
                                          vẫn dựng đúng trang 404 thương hiệu)
2. /api/* và /socket/*: thay reverse_proxy bằng `respond` JSON + mã 410
   (Đ1-2 cấm trả HTML cho máy đọc — rơi xuống catch-all là trả đúng HTML)
3. docker compose down  ở explorer-full/blockscout/docker-compose   (~5,9 GB image)
```

**Điều kiện qua (thay cho bản trên):**
```
docker inspect -f '{{.RestartCount}}' stats user-ops-indexer   →  đứng yên
# và chạy lại ĐÚNG 4 dòng baseline — KHÔNG dòng nào được là 502:
/khong-co-trang-nay  →  404 + <title> mang thương hiệu
/tx/0xabc            →  404 (chấp nhận: explorer đã gỡ)  — KHÔNG phải 502
/api/v2/stats        →  410 application/json             — KHÔNG phải HTML
/socket/websocket    →  410                              — KHÔNG phải 502
```

#### ✅ NỬA ĐẦU ĐÃ CHẠY `2026-08-28` — **David cho phép ngoại lệ luật 1/4**

🔴 **Ghi thẳng để hồ sơ không nói dối: lệnh dưới đây ĐỔI TRẠNG THÁI MÁY CHỦ, và nó chạy
TỪ worktree soát.** Luật 1 và luật 4 (`CLAUDE.md`) cấm việc đó. David chốt bằng lời sau
khi worktree soát đã nêu lo ngại và đã từ chối một lượt. Đây là **ngoại lệ có người cho
phép**, không phải luật mới, và không tạo tiền lệ cho lượt sau.

```
$ docker stop stats user-ops-indexer
stats
user-ops-indexer
```

Chọn `docker stop` chứ **không** `docker compose stop`: nó gọi đích danh hai container,
không đọc tệp compose, nên không có đường nào chạm dịch vụ khác. Chính sách `always`
**không** khởi động lại container bị dừng tường minh.

**Đo trước / sau — cùng phiên, cùng lệnh:**

| | trước | sau |
|---|--:|--:|
| `stats` RestartCount · status | 800 · `running` | **800** · `exited` |
| `user-ops-indexer` RestartCount · status | 308 · `running` | **308** · `exited` |
| container khác đang chạy | 24 | **24 − 2 = 22, đúng hai cái đó** |
| `9chain-a1-node-*` | 9 | **9** |

*(Lượt đo đầu `28/08` sớm hơn ghi 773 / 298; ~40 phút sau đã là 800 / 308 — tức vòng
loop chạy thật, thêm **27** lượt `stats` trong 40 phút.)*

**Không tác động công khai — baseline 4 dòng KHÔNG đổi một ký tự:**
```
/khong-co-trang-nay  →  404  text/html   <title>Không có trang này — 9Chain Testnet A1</title>
/tx/0xabc            →  200  text/html
/api/v2/stats        →  200  application/json      ← VẪN 200
/socket/websocket    →  426
/                    →  200
info.getNetworkID    →  999999999
```

⇒ Xác nhận đúng dự đoán: hai container đó **không nằm trên đường phục vụ**. `/api/v2/stats`
do `backend` trả, không do dịch vụ `stats`.

⚠️ **Không trích mạnh hơn phép đo:** phiên này **không** đo tải CPU *trước* khi dừng, nên
**không kết luận được đã tiết kiệm bao nhiêu**. Thứ chứng minh được chỉ là: vòng loop đã
dừng, và không có tác động công khai. Muốn con số tiết kiệm thì phải đo `docker stats`
hai đầu — chưa ai làm.

**Còn lại để đóng hẳn A-013:** đo lại `RestartCount` sau 24 giờ (phải vẫn là 800 / 308),
và nửa sau — gỡ hẳn — **chỉ sau khi A-008 đóng**.

⚠️ Worktree soát **không chạy nửa sau** (sửa Caddy + `compose down`): việc đó thuộc
worktree `main`.

---

## 3. A-008 — đo lại bằng trình duyệt thật, sau ~34 giờ: y nguyên

```
trình duyệt -> https://a1.9scan.org/     (tải sạch, chờ 5s)
  title:   "9Scan A1 — 9Chain block explorer · 9001"
  màn hình: connecting... x2
            LATEST BLOCK —   TOTAL SUPPLY —   VALIDATORS —   GAS PRICE —
            Network information -> CHAIN ID  9001 · EVM 9000000009
  console: KHÔNG một lỗi nào
  mạng:    ĐÚNG MỘT POST /rpc/ext/bc/C/rpc -> 200, thân trả về ĐÚNG:
             [{..."number":"0x2","hash":"0x67992754..."},
              {..."result":"0x218711a09"},        <- chainId đúng
              {..."result":"0x2"}]                 <- block đúng
```

⇒ Dữ liệu **về tới trình duyệt, đúng, đủ, không lỗi** — rồi không được vẽ. Hỏng nằm
hoàn toàn phía client của 9Scan-A1, sau khi `fetch` đã thành công.

**Đối chứng ngược trong cùng lượt đo** — `a1.9chain.org` render từ **cùng chuỗi đó**:

```
trình duyệt -> https://a1.9chain.org/
  VALIDATORS CONNECTED 9/9  ·  L1S RUNNING 0  ·  C-CHAIN BLOCK 2
```

⇒ "Trống" ở `a1.9scan.org` là **trống thật**, không phải trình duyệt hay mạng.

## 4. A-009 — nửa console nay ĐO ĐƯỢC là đóng thật; nửa trang vẫn mời; và suất vẫn bị tiêu

**Đóng thật, đo trên máy chủ (mới):**
```
$ grep -c "D-087" ~/9chain-a1/src/local-net/console/server.mjs      ->  3   (cổng CÓ mặt)
$ tr '\0' '\n' < /proc/3456928/environ | grep -c '^A1_DE_CHAIN_MO=' ->  0   (biến VẮNG => đóng)
```

**Vẫn mời, đo bằng trình duyệt thật (`28/08`):**
```
a1.9chain.org/               "Launch your own chain on A1 ... Takes about three minutes."
                             [Launch your chain]  x2
a1.9chain.org/create-chain/  "...the network builds the chain in about three minutes."
                             [Connect wallet]
  => KHÔNG một chữ nào nói dịch vụ đang ĐÓNG tới sau ngày G
```

🔴 **Và phần "tiêu suất" nay không còn là suy đoán** — đọc được thứ tự gọi trong mã:

```
local-net/console/server.mjs:1237
    if (ai.kieu === "vi" && blockedByRate(req, res, limitCreate, `vi:${ai.diaChi}`)) return;
                            ^ TIÊU một suất ở ĐÂY
    ...
local-net/console/server.mjs:1271
    kq = await queue.run(() => createChain(tham));
                               ^ cổng D-087 ném lỗi ở dòng ĐẦU TIÊN của hàm này

local-net/lib/guard.mjs:76      arr.push(now);   <- check() tiêu suất ngay lúc kiểm
local-net/console/server.mjs:50 limitCreate: max 3 / giờ
```

**Kịch bản hỏng — nay chắc chắn, không còn "nếu"**: người dùng nối ví, ký SIWE, bấm tạo.
Suất bị tiêu **trước**, rồi cổng D-087 từ chối **trăm phần trăm**. Ba lần bấm = **khoá
một giờ** cho một dịch vụ mà hệ thống *biết chắc* không phục vụ được lượt nào. Trước
lượt soát này còn có thể lập luận "hỏng vì ví rỗng, hiếm"; nay xác suất hỏng là **1,0**.

**Điều kiện qua** — hai vế, cả hai:
```
(1) chuyển phép kiểm D-087 lên TRƯỚC blockedByRate (hoặc hoàn suất khi từ chối vì cổng đóng)
    => bấm 5 lần khi cổng đóng, lượt thứ 6 vẫn nhận câu trả lời "đang đóng", KHÔNG phải 429
(2) trang / và /create-chain/ NÓI RA trạng thái đóng, thay vì mời bấm
    curl -s https://a1.9chain.org/create-chain/ | grep -ci "closed|after G|tạm dừng"  ->  >= 1
```

## 5. A-006 — nhích được một phần, hai nửa nguy hiểm nhất vẫn trống

Trên cây **hiện tại** (`03ccd70`, 24 patch — **không** phải bản ghim `15c940e`):

```
$ grep -rln "A1ID|A1Name|A1HRP|A1Gen|upgrade\.A1" --include=*_test.go .
  ./utils/constants/network_ids_test.go        <- băng bí danh tài sản (patch 0022) MỚI
  ./vms/avm/vm_a1_alias_test.go                <- MỚI

$ grep -rn "A1HRP|A1Name" --include=*_test.go .          ->  (KHÔNG CÓ GÌ)
$ grep -rn "NetworkIDToHRP" --include=*_test.go .         ->  (KHÔNG CÓ GÌ)
$ grep -rn "A1" upgrade/*_test.go                         ->  (KHÔNG CÓ GÌ)

$ sed -n '12,42p' utils/constants/network_ids_test.go
  func TestGetHRP — bảng: MainnetID · TestnetID · FujiID · LocalID · 4294967295->FallbackHRP
      => KHÔNG có ca A1ID, và nó gọi GetHRP() chứ không đọc MAP
```

⇒ Hai thứ **bất biến sau khi phát ra ngoài** vẫn không có cổng nào: `NetworkIDToHRP[A1ID]`
(tiền tố mọi địa chỉ P/X) và `upgrade.A1` (lịch hard fork chủ quyền). Kịch bản hỏng và
điều kiện qua ở §A-006 lượt 1 **giữ nguyên, không sửa một chữ**.

## 6. Quan sát — sửa lại sau khi đo

| # | Trạng thái `28/08` |
|---|---|
| Q-1 | 🟢 **hạ mức, không đóng.** Đo lại: `/proc` **không** gắn `hidepid` (`cmdline` perm `444`), nhưng máy chỉ có **một** người dùng `ubuntu`, và **không container nào chạy `PidMode=host`**. Cửa sổ ~170s cũng đang bằng **0** vì cổng D-087 đóng. ⇒ nợ kỹ thuật (`--env-file`/stdin), không phải lỗ hổng — **cho tới lúc cổng đẻ chain mở lại sau ngày G**, lúc đó phải đo lại |
| Q-2 | 🔴 **vẫn lệch** — `BLOCKERS.md` `dd053d8`/165 vs `MANIFEST.txt` `15f9076`/167 |
| Q-3 | ⬆️ **nâng thành A-013** — nay đã đo trên máy chủ: 773 / 298 lượt restart |
| Q-4 | 🔴 vẫn vậy (`deploy-test` `^6.13.0` + `solc: ^0.8.26`) |
| Q-5 | không đo lại — không ảnh hưởng ngày G |
| **Q-6 mới** | `9chain-a1-xpwallet` chạy `sh -c go run ./9chain-a1-tools/xp-wallet` trong `golang:1.25.10-bookworm`, `RestartPolicy=no`. Biên dịch-lúc-khởi-động làm dịch vụ thường trú. **Không** thấy đường Caddy nào công khai nó (cổng `8100/8101` chỉ `127.0.0.1`) ⇒ chưa đủ thành phát hiện. Cần: xác nhận nó có phải thứ trang chủ gọi không; nếu có thì nó cùng lớp với A-011 |

## 7. Chưa đo được — cập nhật

| # | Trạng thái |
|---|---|
| C-1 | vẫn chặn (Windows/CGO) — worktree `main` |
| C-2 | vẫn chặn (luật 5) — worktree `main` |
| C-3 | vẫn chặn (chưa có lockfile — chính là A-004) |
| C-4 | vẫn chặn (cần `pnpm install` + `next build`) |
| **C-5** | ✅ **ĐÃ ĐO** — A-005 xác nhận trên máy chủ, xem A-013 |
| **C-6** | ✅ **ĐÃ ĐO** — `A1_HTTP_ALLOWED_HOSTS=localhost,127.0.0.1` có trong `~/9chain-a1/net/.env` |
| C-7 | vẫn chặn — `console.env` có `A1_L1_ADMIN` nhưng **không** có địa chỉ `P-` của ví trả phí; cần David dán địa chỉ vào |
| C-8 | vẫn chặn — cần `docker exec` vào Postgres, tức đổi trạng thái (mở tiến trình trong container). **Không đo.** |

## 8. Cái không đo, và vì sao

- **Không** gọi thử `POST /console/api/create` để xác nhận A-009 từ ngoài: nó **tiêu một
  suất thật** trong hạn mức 3/giờ của một ví, tức đổi trạng thái. Đã đọc mã và đo môi
  trường tiến trình thay cho việc gọi.
- **Không** `docker exec`, **không** restart, **không** `caddy reload`, **không** đụng
  `upstream/avalanchego` của worktree này (vẫn detached ở `15c940e`). Mọi lệnh trên máy
  chủ là `ps` / `ss` / `docker ps|inspect` / `grep` / `df` — chỉ đọc.

---

## 9. A-001 — H-6b ĐÃ CHẠY LẠI `2026-08-28`, và cái gì vẫn còn hở

🔴 **Ngoại lệ luật 4 lần thứ hai trong phiên, David chốt bằng lời.** H-6b **ghi lên máy
chủ** (bản thứ hai đặt ở `~/9chain-a1/backup/`), tức worktree soát đã đổi trạng thái máy
chủ. Ghi ra để hồ sơ không nói dối. Không phải luật mới, không tạo tiền lệ.

**Bản mới:** `20260828-024659` — 3,0 MB, hai nơi:
- `C:\PROJECTS\9Chain-backups\9chain-a1-backup-20260828-024659\` (máy dev)
- `139.99.145.13:~/9chain-a1/backup/20260828-024659/` (**bản thứ hai thật**)

```
repo   HEAD 0afc664 · 218 commit · 256 tệp · tree 735cd81812f6a0751171fcfd2ea420dde80d64fd
       4 nhánh: main · audit · web-home · brand-standardize
fork   base 1cf1fc3 (SHALLOW) · 24 patch · tree sau khi áp 074aaa9327be70103b25d5a3873d41cacd431652
       áp bằng: git am --keep-cr
```

**Nghiệm thu — bốn phép, chạy thật:**

```
[ĐẠT] CLONE NGƯỢC bundle (máy dev)   → tree 735cd818… · 218 commit · đủ 4 nhánh
[ĐẠT] CLONE NGƯỢC bundle (MÁY CHỦ)   → tree 735cd818… · 218 commit · đủ 4 nhánh
[ĐẠT] áp 24 patch lên 1cf1fc3 sạch trong bản clone tách rời
        → tree 074aaa93…  khớp cây fork TỪNG BYTE   (git am exit=0)
[ĐẠT] sha256 hai đầu: 27/27 mục OK trên máy chủ
```

**Đối chứng ngược — chứng minh phép đo biết ĐỎ, không chỉ biết in ✓:**
```
$ head -c 2000000 9chain-a1.bundle > hong.bundle    # cắt cụt cố ý
$ git clone --branch main hong.bundle …
fatal: early EOF
error: index-pack died                               ← BỊ TỪ CHỐI, đúng như phải thế
```
Đây là phép **bắt buộc**: `git bundle verify` từng khen một bundle hỏng là *"okay"* và
*"records a complete history"* trong khi clone ngược chết ngay (bẫy repo shallow,
`BLOCKERS.md`). Cổng chỉ chạy `verify` là cổng chưa bao giờ biết đỏ.

**Quét bí mật trước khi đẩy ra ngoài** — bản `27/08` có làm, repo từ đó thêm 74 tệp nên
làm lại:
```
khối "PRIVATE KEY"                    → không có
tệp .env / .env.sh trong bundle       → 3, đều là cấu hình Blockscout công khai
                                        (0 dòng khớp secret|password|key|token)
chuỗi 64-hex trong docs               → đều được CHÍNH tài liệu ghi rõ là `sha256`
                                        của bản xuất công bố, không phải khoá
```

**Điều kiện qua của A-001 — cả hai ĐẠT:**
```
ls <backup>/avalanchego-patches/ | wc -l   →  24   (ls patches/ = 24)      ĐẠT
git rev-list --count 0afc664..main         →  0                            ĐẠT
```

**Ba thế hệ bản sao lưu, để thấy vấn đề là gì:**

| bản | patch | ghi chú |
|---|--:|---|
| `20260825-064053` | 0 | chỉ bundle, chưa có lớp chủ quyền |
| `20260827-051507` | 12 | **cũ 12 patch / 45 commit** sau đúng **1 ngày** |
| `20260828-024659` | **24** | hôm nay khớp |

⚠️ **`BLOCKERS.md:493` nay đúng trở lại** — câu *"H-6b đã chạy, không còn là một ổ đĩa"*
hôm qua là sai, hôm nay là thật. Nó sẽ **tự sai lại** ở commit kế tiếp. Xem A-014.

🔴 **KHÔNG ĐƯỢC ĐỌC MỤC NÀY THÀNH "ĐÃ AN TOÀN".** Bản sao lưu **không chứa khoá 5 quỹ**
(`local-net/net-*/keys.txt` bị `.gitignore` — cố ý). H-6b chưa bao giờ cứu khoá và không
được thiết kế để cứu khoá. Mất máy dev vẫn = **mất khoá cả 5 quỹ**. Đó là D-044 / O1,
một mục khác, vẫn mở, và vẫn là mục quyết số 1 trước ngày G.

---

### A-014 — Không gì phát hiện bản sao lưu cũ đi; lần trước nó cũ sau đúng một ngày

**Mức:** **P1** · **Mặt:** cấu trúc · *(phần chưa đóng của A-001)*
**Tin cậy:** ĐO ĐƯỢC · **Nguồn:** REPO

**Bằng chứng:**

```
$ ls /c/PROJECTS/9Chain-A1/scripts/ | grep -iE "backup|sao-luu|h6"
(rỗng — KHÔNG có script nào cho H-6b; nó là quy trình viết tay trong BLOCKERS.md)

$ ls <backup 27/08>/avalanchego-patches/ | wc -l      →  12
$ ls patches/ | wc -l                                  →  24
$ git rev-list --count 15f9076..main                   →  45
    ⇒ cũ đi 12 patch / 45 commit trong ĐÚNG MỘT NGÀY, và không cổng nào đỏ

$ node scripts/check-consistency.mjs   →  21 đạt      ← không biết bản sao lưu tồn tại
$ node scripts/check-deploy-drift.mjs  →  18 khớp     ← so repo↔server, không so repo↔backup
```

Điều kiện qua của A-001 **đã ghi sẵn vế này từ lượt 1** — *"chạy lại H-6b **sau mỗi phiên
có commit**, không phải theo lịch tuỳ hứng"* — và vế đó vẫn chưa có gì thực thi.

**Kịch bản hỏng** — chính kịch bản vừa xảy ra, lặp lại. Hôm nay bản sao lưu khớp; ngày mai
`main` đi thêm vài commit và một patch 0025 ra đời; `BLOCKERS.md` vẫn ghi *"không còn là
một ổ đĩa"*; mọi cổng vẫn xanh. Tới lúc ổ `C:` hỏng thì thứ dựng lại được là mạng của
**hôm nay**, không phải mạng đang chạy. Lần trước khoảng lệch tích được trong **một ngày**
là 12 patch — trong đó có `A1Gen`, bí danh tài sản X-Chain, và cổng chặn sinh nhầm mạng thật.

**Đối chứng ngược** — cổng mới phải **đỏ ngay ở commit thứ nhất** sau lượt sao lưu. Chứng
minh nó biết đỏ: đặt một commit rỗng ⇒ phải thoát mã 1. Cổng chỉ kiểm *bản sao lưu có
lành không* **không phân biệt được** — bản `27/08` lành hoàn toàn, nó chỉ **cũ**.

**Điều kiện qua** — thêm `scripts/check-backup-fresh.mjs` (hoặc một mục trong cổng có sẵn):
```
đọc <backup mới nhất>/MANIFEST.txt  →  HEAD, patch
đòi:  git rev-list --count <HEAD>..main   ==  0
      ls <backup>/avalanchego-patches/ | wc -l  ==  ls patches/ | wc -l
lệch  ⇒  exit 1, in ra ĐÚNG lệnh chạy lại H-6b
```
Và: H-6b nên thành **script** (`scripts/h6b-sao-luu.sh`), không để là quy trình viết tay —
một quy trình 8 bước trong tài liệu là một quy trình sẽ bị làm tắt lúc vội. Bốn phép nghiệm
thu ở §9 (kể cả đối chứng ngược bundle cắt cụt) phải nằm **trong** script, không nằm cạnh nó.

**Liên quan:** A-001, A-012 (cùng lớp: hai bản của một thứ, không ai canh chỗ lệch),
H-6/H-6b (`BLOCKERS.md:493`), D-044, memory `a1-ban-sao-luu-khong-dung-lai-duoc`.

#### 🔴 A-014 TỰ CHỨNG MINH SAU ~10 PHÚT — và nó lộ ra điều kiện qua đang SAI HÌNH DẠNG

Đo lại đúng điều kiện qua của A-001, khoảng mười phút sau khi H-6b chạy xong:

```
$ git rev-list --count 0afc664..main
2                                     ← ĐÃ VỠ. Điều kiện đòi 0.
$ git log --oneline 0afc664..main
d80ae12 Dong bo docs/AUDIT-A1/ … (chính lượt ghi sổ này)
ecf0570 D-092: go 9chain-a1-xpwallet khoi server …   ← của SESSION KHÁC, không phải tôi

$ ls <backup>/avalanchego-patches/ | wc -l  →  24     (= ls patches/)   ← VẪN ĐẠT
```

**Hai kết luận, đừng trộn:**

1. **Mạng đang chạy vẫn dựng lại được.** Lớp chủ quyền — 24 patch — **không đổi**. Thứ
   thêm vào là 2 commit chạm `docs/` và 3 tệp mã ngoài `docs/AUDIT-A1/`. Đây **không**
   phải cảnh A-001 quay lại.

2. 🔴 **Nhưng `rev-list … == 0` là một điều kiện SAI HÌNH DẠNG, và lượt này chứng minh nó.**
   Nó đòi bản sao lưu **luôn luôn bằng `HEAD`** — bất khả thi với một quy trình chạy tay
   trong một repo có **hai session làm việc song song**. Đo ở bất kỳ thời điểm nào không
   phải "ngay sau khi sao lưu" thì nó đỏ, kể cả khi chỉ có một commit sửa chính tả.

   Repo này **đã học đúng bài đó một lần**: bản đầu của `check-deploy-drift.mjs` tự đoán
   phạm vi bằng glob và báo **27/58 lệch — phần lớn là đỏ giả**, rồi chính nó viết ra
   *"một cổng đỏ ở chỗ không cần đỏ sẽ bị người ta học cách bỏ qua, và nó sẽ bị bỏ qua
   đúng vào lần nó đỏ thật."* Điều kiện `rev-list == 0` đang đi vào đúng cái bẫy ấy.

**Điều kiện qua — sửa lại cho đúng đại lượng cần đo.** Cái cần bảo vệ không phải "backup
bằng HEAD", mà **"backup có đủ thứ định nghĩa mạng đang chạy"**:
```
BẮT BUỘC (đỏ là đỏ thật):
  ls <backup>/avalanchego-patches/ | wc -l  ==  ls patches/ | wc -l
  git diff --quiet <HEAD-MANIFEST>..main -- patches/ local-net/ upstream/ scripts/
                                                 ⇒ 0 tệp mã lệch
CẢNH BÁO (vàng, không đỏ):
  git rev-list --count <HEAD-MANIFEST>..main  >  0  và chỉ chạm docs/
                                                 ⇒ "backup cũ N commit, toàn docs"
```
Tức: **lệch mã ⇒ đỏ · lệch chỉ tài liệu ⇒ vàng.** Có thế thì lượt đỏ đầu tiên mới đáng
tin, và mới không ai học cách bỏ qua nó.

*(Ghi thêm: `ecf0570` của session `main` đã **gỡ `9chain-a1-xpwallet` khỏi máy chủ** —
đóng luôn Q-6 của lượt soát này, và họ tìm ra thêm hai thứ khác trong lượt quét đó.)*
