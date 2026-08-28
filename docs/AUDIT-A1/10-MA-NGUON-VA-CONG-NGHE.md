# SOÁT MẶT **MÃ NGUỒN + CÔNG NGHỆ** — `2026-08-27`

**Worktree:** `9Chain-A1-audit` · **nhánh:** `audit` · **gốc:** `main @ d7f4975`
**Core ghim:** `upstream/avalanchego @ 15c940e` (detached) · base upstream `1cf1fc3` (`22/08`)
**Phạm vi:** `docs/AUDIT-A1/00-CHARTER.md` §1 dòng *Công nghệ / Mã nguồn / Cấu trúc*

> Bản này **không** chép lại `HIEN-TRANG-A1-2026-08-27.md` (mạng đang là gì) hay
> `SOAT-TOAN-DIEN-2026-08-27.md` (lớp vận hành). Nó trả lời một câu khác:
> **cây mã hôm nay là cái gì, chỗ nào đã cứng, chỗ nào còn mềm.**
>
> Mọi con số dưới đây đo **ngoại tuyến trong worktree này**, trừ hai chỗ ghi rõ
> `máy dev`. **Không lệnh nào chạm máy chủ công khai.**

---

## 0. Kết luận trước

Lớp **kỹ thuật** của A1 khoẻ hơn lớp **canh giữ** của nó. Cụ thể, đo được:

- Fork chạm **7 file** trong 2.930 file Go của avalanchego, xoá đúng **7 dòng**
  trên 660.132 dòng. Đây là một fork *cộng thêm*, gần như không *sửa* — đúng
  nguyên tắc "đổi VALUE, không đổi IDENTIFIER" mà `ARCHITECTURE.md` §3 khai.
- Nhưng **cổng canh chính lớp đó — `scripts/rebase-drill.sh` — được viết `25/08`
  và chưa hề biết tới patch 0013 (`27/08`)**. Nó vẫn khẳng định `FallbackHRP`,
  đúng thứ mà chính mã nguồn mới đã hạ xuống làm *dây bảo hiểm thứ hai*.
- Và **bản sao lưu ngoài máy duy nhất trễ 26 commit / 5 patch** — thiếu đúng bộ
  0013–0017, tức thiếu toàn bộ bản vá của lần soát core.

⇒ Ba phát hiện nặng nhất của bản này đều **không phải lỗi trong mã**. Chúng là
chỗ **cái canh mã đã tụt lại sau mã**. Đó là đúng lớp lỗi mà `CLAUDE.md` gọi tên:
*"cổng chỉ từng xanh thì không chứng minh gì"*.

---

## 1. Kiểm kê — A1 hôm nay là bao nhiêu mã, ở đâu

### 1a. Lớp chủ quyền trên core (Go)

```
$ git -C upstream/avalanchego diff --stat 1cf1fc3 HEAD | tail -1
 18 files changed, 3074 insertions(+), 7 deletions(-)
```

| | |
|---|--:|
| File Go trong core upstream | **2.930** |
| Dòng Go trong core upstream | **660.132** |
| File upstream **bị sửa** | **7** |
| Dòng thêm vào file upstream | **110** |
| Dòng **xoá** khỏi upstream | **7** |
| File **mới** của A1 | **11** (10 Go + `.gitattributes`) |
| Dòng mã chủ quyền mới | **2.953** (2.715 công cụ + 238 `genesis_9chain_a1.go`) |

Bảy file upstream bị chạm, và mỗi file chạm bao nhiêu:

```
$ git diff --numstat 1cf1fc3 HEAD   # đã lọc file mới
11+  2-  config/config.go
 2+  2-  genesis/genesis.go
 4+  0-  genesis/params.go
 1+  1-  graft/subnet-evm/scripts/constants.sh
49+  0-  upgrade/upgrade.go
42+  1-  utils/constants/network_ids.go
 1+  1-  version/constants.go
```

**Đọc con số này thế nào:** `1+ 1-` ở `version/constants.go` là đổi đúng một chuỗi
(`avalanchego` → `9chaingo`). `49+ 0-` ở `upgrade/upgrade.go` là **thêm nguyên một
bảng lịch nâng cấp mới, không sửa bảng cũ**. ⇒ Bề mặt xung đột khi rebase là rất
hẹp, và đó là một tính chất **đã thiết kế**, không phải may.

Mười công cụ chủ quyền (`upstream/avalanchego/9chain-a1-tools/`):

| Công cụ | Dòng | Vai |
|---|--:|---|
| `netgen/main.go` + `allocation.go` + `engrave.go` + `chainid.go` | **1.584** | sinh toàn bộ một mạng chủ quyền: khoá, cert, BLS, genesis, compose |
| `engrave-verify/main.go` | 358 | đọc **ngược** chữ khắc từ genesis và từ mạng sống |
| `9chain-a1-cli/main.go` | 330 | đẻ subnet + chain (console gọi qua đây) |
| `xp-wallet/main.go` | 292 | ví X/P |
| `create-l1/main.go` | 96 | |
| `keygen/main.go` | 55 | |
| **tổng** | **2.715** | |

### 1b. Lớp điều phối + dịch vụ (Node.js, ESM thuần)

```
$ find local-net scripts -name "*.mjs" | xargs wc -l | tail -1
   7207 total
```

| Tệp | Dòng | Ghi chú |
|---|--:|---|
| `local-net/console/server.mjs` | **1.236** | **bề mặt công khai** — `/console/api/*` |
| `local-net/faucet/*.mjs` (11 tệp) | 2.312 | faucet + 6 bộ nghiệm thu nặng |
| `local-net/lib/*.mjs` (7 tệp) | 1.096 | `guard` `cb58` `chainid` `eip55` `presets` `asset-bridge` |
| `scripts/*.mjs` | 880 | cổng nhất quán, tra chainId, xuất chain (O2) |
| còn lại | 1.683 | |

Đáng ghi: **không một framework HTTP nào** — console và faucet dựng thẳng trên
`node:http`. Toàn dự án Node có **đúng một** phụ thuộc thời gian chạy: `ethers`.

### 1c. Lớp giao diện (TypeScript)

```
$ find web -name "*.ts" -o -name "*.tsx" -o -name "*.mjs" | xargs wc -l | tail -1
   4624 total
```

Next 15.5.23 · React 19.1 · Tailwind 4.1 · **xuất tĩnh** (`output: 'export'`) —
không thêm một tiến trình Node nào lên máy chủ, Caddy phục vụ thẳng `out/`.
Lý do đã ghi thành chữ trong `web/next.config.ts`: Blockscout đã ngốn ~50% CPU máy chủ.

### 1d. Cổng và bộ kiểm

**20 tệp** mang tên `*test*` / `check-*` / `*drill*` (bản soát trước ghi 27 — con
số đó gộp cả các cổng shell và mục nghiệm thu trong `deploy/`). Trong đó:

| Chạy được ngoại tuyến | Cần mạng/máy chủ |
|---|---|
| `scripts/check-consistency.mjs` ✅ | `scripts/check-chainid.mjs` (gọi `chainid.network`) |
| `web/test/*.test.ts` (vitest) | `local-net/faucet/*-test.mjs` (cần node chạy) |
| `web/scripts/check-*.mjs` (cần `out/`) | `local-net/console/auth-e2e-test.mjs` |
| `scripts/rebase-drill.sh` (cần git + patch) | `block-adam-drill.mjs` |

**Không có `.github/workflows/`.** Không cổng nào tự chạy — hệ quả của H-6 (repo
chưa có nhà), đã ghi trong `HIEN-TRANG` §4.

---

## 2. Cái đã CỨNG — đo được, không phải khen suông

### 2a. Cổng tokenomics biết báo ĐỎ (đối chứng ngược đầy đủ)

Chạy thật trong worktree này, `2026-08-27`:

```
$ node scripts/check-consistency.mjs
  ✓ SupplyCap đọc TỪ GO: 7,900,000,001 LOVE9 (`7_900_000_001 * units.Avax`) — không chép tay
  ✓ SupplyCap 7,900,000,001 + C-Chain 1,099,999,999 = 9,000,000,000
  ✓ SupplyCap = 7,900,000,001,000,000,000 đơn vị (42.820% uint64)
  21 đạt · 0 lỗi
EXIT=0

$ node scripts/check-consistency.mjs --self-test
  ✓ "tổng cung 90 tỷ (tràn uint64)" → bắt được (5 lỗi)
  ✓ "SupplyCap = tổng cung (bỏ quên phần C-Chain)" → bắt được (2 lỗi)
  ✓ "không đọc được SupplyCap từ Go" → bắt được (1 lỗi)
  ... 9/9 ca sai đều ra đỏ
EXIT=0
```

Đây là **cổng duy nhất trong dự án đạt đủ chuẩn `CLAUDE.md`**: nó đọc hằng số
thẳng từ Go (không giữ bản chép tay), nó kiểm **tỷ lệ so với trần uint64** chứ
không chỉ kiểm số, và nó có `--self-test` chứng minh mình phân biệt được xanh/đỏ.

### 2b. Console — bề mặt công khai, và nó được viết như thứ biết mình công khai

`local-net/console/server.mjs` là thứ duy nhất của A1 mở ra Internet có tác dụng
phụ. Soát đường vào:

| Lớp | Đo được |
|---|---|
| Chạy lệnh | `execFile("docker", [mảng])` — **không qua shell**, không nội suy chuỗi |
| Tên chain | `/^[A-Za-z0-9 ]{2,32}$/` — chặn trước khi chạm docker |
| So token | `timingSafeEqual`, có nhánh đệm khi lệch độ dài (`lib/guard.mjs:111`) |
| SIWE | **không nhận `message` từ client** — server dựng lại từ kho nonce của mình |
| Quyền admin | đăng nhập bằng ví ⇒ `admin` bị **ghi đè** bằng địa chỉ đã ký, không phải kiểm-rồi-báo-lỗi |
| Thu hồi | ví lạ đụng chain người khác ⇒ `403`, đối chiếu `chain.admin` |
| Hạn mức | 5 tầng (`flood` 60/giờ · `create`/`revoke` 3/giờ/ví · `read` 120/phút · `nonce` 30/10phút) |
| Rò khoá | `scrub()` lọc `A1_CLI_KEY` khỏi **mọi** message lỗi trước khi log **và** trước khi trả về client |
| Đồng thời | `serialQueue({maxPending: 5})` — hai lượt rollout không đá nhau |
| Trần | `MAX_L1 = min(15, 16)` — **trần giao thức**, có ghi rõ vượt trần là đổi kiến trúc chứ không nới số |

**Không tìm thấy đường tiêm lệnh.** Ba chỗ dữ liệu người dùng chạm hệ thống —
`name` (regex), `chainId` (`Number.isSafeInteger` + hai sổ chiếm chỗ), `admin`
(`parseEvmAddress` EIP-55) — đều lọc trước khi vào tệp genesis hay đối số docker.

### 2c. Lớp chủ quyền core đã tự đứng, không còn dựa nhánh dự phòng

Patch 0013 chuyển ba thứ từ *"tình cờ đúng"* sang *"khai tường minh"*:

| | Trước 0013 | Sau 0013 |
|---|---|---|
| HRP `love9` | rơi vào `FallbackHRP` | `NetworkIDToHRP[A1ID]` |
| Lịch hard fork | dùng `Default` của Ava Labs | `upgrade.A1` riêng |
| Tên mạng | `network-9001` (nhánh mặc định) | `A1Name = "9chain-a1"` |

Đã đo: `upgrade.A1` khai **18/18 trường** của `Config` — không thiếu trường nào,
và **trùng đúng tập trường với `Default`**:

```
$ (so tập tên trường giữa struct Config, Default và A1)
Config fields: 18 | A1: 18 | Default: 18
--- Config có mà A1 KHÔNG đặt ---   (rỗng)
--- Default đặt mà A1 không ---     (rỗng)
```

⇒ Hôm nay bảng lịch nâng cấp **đầy đủ**. Rủi ro nằm ở *ngày mai* — xem A-002.

---

## 3. Cái còn MỀM — sáu phát hiện

Chi tiết đủ 6 trường ở `docs/AUDIT-A1/SO-PHAT-HIEN.md`. Tóm ở đây theo *"mất gì
nếu nó xảy ra"*:

| ID | Mức | Một câu |
|---|---|---|
| **A-001** | **P1** | Bản sao lưu ngoài máy duy nhất **trễ 26 commit / 5 patch** — thiếu đúng bộ 0013–0017 |
| **A-002** | **P1** | `rebase-drill.sh` **không canh** `upgrade.A1`; nó canh `FallbackHRP`, thứ mã nguồn đã hạ cấp |
| **A-003** | P2 | `multinode.compose.yml` tự khai *"NGUỒN CHÍNH THỨC"* nhưng vẫn là **5 node, 0 dòng `restart:`** |
| **A-004** | P2 | Faucet — nơi **giữ khoá có tiền** — dùng `ethers: ^6.13.0` **không lockfile**; console cùng repo ghim `6.17.0` |
| **A-005** | P2 | Explorer chạy **6 image `:latest`** của bên thứ ba + `git clone --depth 1` không ghim |
| **A-006** | P2 | **0 test Go** nào chạm `A1ID` / `A1Name` / `A1HRP` / `upgrade.A1` |

**Điểm chung của A-001, A-002, A-006:** lớp chủ quyền core được viết rất kỹ và
**không có gì canh nó ngoài trí nhớ người viết**. Ba phát hiện này là ba mặt của
cùng một chỗ hở.

**Điểm chung của A-004 và A-005:** kỷ luật chuỗi cung ứng **chặt nhất** của dự án
đang áp cho cây phụ thuộc **9 gói** của console, và **không áp gì** cho 6 image
đang phục vụ dữ liệu chuỗi ra công chúng và giữ một bản sao chain trong Postgres.

---

## 4. Cấu trúc — ranh giới repo ↔ máy chủ

Charter §1 hỏi *"cái gì không vào git mà lại là sản xuất"*. Đo `.gitignore`:

| Không vào git | Là sản xuất? | Có bản thứ hai? |
|---|---|---|
| `local-net/net*/` (khoá 5 quỹ, `faucet.env`, `staker.key`) | **CÓ** | 🔴 chỉ lời David, chưa ai xác nhận (O1, D-044) |
| `upstream/` (toàn bộ fork) | **CÓ** | ✅ qua `patches/` — nhưng xem A-001 |
| `9chain-a1-config/console-chains.json` | **CÓ** (sổ chain của người dùng) | 🔴 không |
| `9chain-a1-config/chains/` (VM config từng chain) | **CÓ** | 🔴 không |
| `explorer-full/blockscout/` | CÓ | tái dựng bằng `setup.sh` — nhưng xem A-005 |

Và một điều đã sửa đúng, đáng ghi lại: `local-net/deploy/multinode.compose.yml`
được **đưa vào git ngày `26/08`** chính vì một phiên soát trước đã đọc bản ở máy
dev rồi kết luận sai về upstream RPC dự phòng `:9660`. Cách sửa đúng, chỉ là nó
đã trôi lại — A-003.

Ba cái bẫy ghi trong đầu tệp đó vẫn **đang đúng và vẫn cần**: `name: net` ghim
tường minh (đổi thư mục ⇒ volume mới rỗng ⇒ **re-genesis cả mạng, không cảnh báo**),
và `--env-file` bắt buộc khi chạy từ chỗ khác (thiếu ⇒ `A1_TRACK_SUBNETS` rỗng ⇒
**mọi L1 tối đen trong khi C-Chain vẫn xanh**).

---

## 5. Chưa đo được — và vì sao

| Muốn đo | Bị chặn bởi | Ai đo được |
|---|---|---|
| **Build lại core trên bản ghim `15c940e`** | avalanchego cần CGO (blst, zstd, libevm) + syscall Unix. `GOOS=linux CGO_ENABLED=0 go vet ./9chain-a1-tools/...` **thoát 1** với 3 lỗi đúng của việc tắt CGO (`blst: undefined: Message`, `libevm/crypto: assignment mismatch`, `zstd: build constraints exclude all Go files`) — không phải lỗi mã A1. Cross-compile CGO từ Windows không có toolchain. | worktree `main` (Docker Linux), hoặc `docker build` ở đây nếu David duyệt tốn CPU |
| **Chạy `rebase-drill.sh` để xác nhận A-002 đỏ** | Cần `git worktree add` trên repo fork — worktree này bị cấm đổi HEAD của `upstream/` (`CLAUDE.md` luật 5) | worktree `main` |
| **`npm audit` cho `ethers` của faucet** | Không có lockfile để audit (đó chính là A-004) | bất kỳ ai, sau khi sinh lockfile |
| **Bundle web thật (`check-budget.mjs`)** | Cần `pnpm install` + `next build`; worktree soát không cài phụ thuộc | worktree `main` |

---

## 6. Quan sát — chưa đủ thành phát hiện

| # | Quan sát | Cần gì để kết luận |
|---|---|---|
| Q-1 | `A1_CLI_KEY` đi vào **argv** của `docker compose exec -e` (`server.mjs:783`). `scrub()` chặn rò qua log/HTTP, nhưng không chặn ai đọc `/proc/*/cmdline` trên host trong ~170s. Máy chủ có khối lượng việc của đội khác (9Scan) chạy cùng. | Chứng minh có tiến trình **không phải của A1** đọc được `/proc` của host. Nếu chỉ có root thì đây là nợ kỹ thuật, không phải lỗ hổng |
| Q-2 | `BLOCKERS.md:487` ghi bản sao lưu `27/08` là HEAD `dd053d8` / 165 commit; `MANIFEST.txt` **trên đĩa** ghi HEAD `15f9076` / 167 commit | Sổ sách lệch vật chứng. Không hại hôm nay, nhưng khi phục hồi thì người ta đọc sổ |
| Q-3 | Máy dev đang chạy **10 container Blockscout** trong khi `9chain-a1-node` đã `Exited 3 ngày`; `user-ops-indexer` **Restarting** liên tục | Đây là máy dev, không phải máy chủ — chưa đo tác động. Nhưng nó lặp lại đúng tỷ lệ chi phí đã đo trên máy chủ (§9 bản soát toàn diện) |
| Q-4 | Cả `local-net/deploy-test/` lẫn `local-net/faucet/` đều `^6.13.0`; chỉ console ghim | Nếu David chốt "ghim mọi nơi" thì đây là 3 tệp, không phải 1 |

---

## 7. Một câu về mặt này

**Mã của A1 tốt hơn mức cần cho một testnet 2 ngày tuổi — và những gì canh nó thì
không.** Fork chạm 7 file và xoá 7 dòng; console công khai không có đường tiêm
lệnh; cổng tokenomics đọc thẳng hằng số từ Go và chứng minh được mình biết báo đỏ.
Nhưng cổng canh rebase đứng lại ở `25/08`, lớp chủ quyền core không có một test Go
nào, và bản sao lưu ngoài máy duy nhất thiếu đúng bộ patch của lần soát core.

⇒ Ba việc rẻ nhất, làm được **trước ngày G**, không đụng máy chủ: **chạy lại
H-6b** (A-001) · **thêm 4 dòng `doi` vào `rebase-drill.sh`** (A-002) · **ghim
`ethers` cho faucet** (A-004).
