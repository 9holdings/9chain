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

## Cần David quyết (không phải kẹt kỹ thuật — xem PROGRESS mục `[human]`)

| # | Việc | Chặn mốc nào |
|---|---|---|
| H-1 | Tokenomics: supply cap 720M LOVE9 · tỉ lệ 40/20/20/5/15 + vesting · uptime 80%→90% | chốt genesis mainnet, ACP-77 |
| H-2 | 🔴 **ACP-77 — đã đổi bản chất, không còn chờ được**. Xem ghi chú dưới bảng | trần 16 L1 |
| H-3 | Có mở console đẻ chain ra Internet không | M4.5 |
| H-4 | AAAA record `bootstrap-a1.9chain.org` (**DNS-only**, không mây cam) | M3.3 |
| H-5 | URL Cosmos REST của C1 (`:1317`) | M7.3 (dashboard live) |
| H-6 | 🟡 **Repo vẫn chưa có remote** — nhưng H-6b đã chạy, không còn là "một ổ đĩa" | nơi đặt repo lâu dài |
| H-7 | 🔴 **P2P ra Internet: IPv6-only hay IPv4 đa cổng?** Quyết định về ĐỐI TƯỢNG, xem dưới | M3.2, M3.3, M3.5 |

### Ghi chú H-7 — M3 chạm trần "chọn ai được vào", không phải trần kỹ thuật

**Đo thật trên `139.99.145.13`, 2026-08-25 (phiên thứ tư):**

| | |
|---|---|
| khối IPv6 của máy | `(không công bố)/**56**` — **256 khối /64**, dư sức mỗi node một địa chỉ |
| đường ra IPv6 | có default route, **ra Internet được** (đã curl thật qua v6) |
| IPv6 của Docker | **TẮT** (`bridge.EnableIPv6 = false`) |
| cổng P2P 9651 | **KHÔNG node nào publish** — đúng tiền đề của M3 |
| Docker Engine | **29.7.2** ⇒ bật IPv6 được **theo từng network**, KHÔNG phải restart daemon |

Dòng cuối là tin tốt nhất: restart Docker daemon là restart **mọi** container, tức
hạ cả testnet công khai lẫn Blockscout. Bản 29.7.2 tránh được việc đó.

**Nhưng có một cái bẫy về sản phẩm, không phải về kỹ thuật.** `--public-ip` của
avalanchego là **MỘT** địa chỉ, không phải danh sách (`config/config.go` →
`ips.ParseAddrPort`). Nên hai đường loại trừ nhau:

| | IPv6, mỗi node một GUA (kế hoạch M3.1 hiện tại) | IPv4, mỗi node một `--staking-port` |
|---|---|---|
| ai gọi VÀO được | **chỉ peer có IPv6** | **100% Internet** |
| cổng | 9651 tiêu chuẩn cho mọi node | 9651…9655, phải publish từng cái |
| NAT | không có | 5 node cùng máy phải vòng lại qua IP công khai |
| DNS David cần tạo | **AAAA** `bootstrap-a1` (H-4) | **A** `bootstrap-a1`, DNS-only |

Kế hoạch cũ chọn IPv6 và điều đó **sạch hơn về kỹ thuật**. Nhưng mục tiêu M3 là
*"cộng đồng tự chạy node"* — và một người muốn tham gia mà nhà mạng của họ chỉ có
IPv4 thì **không vào được**, trong khi họ chẳng làm gì sai. Ở Việt Nam tỉ lệ đó
không nhỏ. Đây là chọn tập người dùng, nên không tự quyết.

**Khuyến nghị:** IPv4 đa cổng cho **node beacon** (thứ cộng đồng cần chạm tới),
IPv6 cho phần còn lại nếu muốn. Nhưng David chốt.

**Đã làm sẵn, không chờ:** `netgen` nay sinh được cả hai hình dạng —
`A1_P2P_MODE=ipv6` + `A1_IPV6_SUBNET` + `A1_IPV6_BASE`. **Mặc định giữ nguyên hành
vi cũ** (đã kiểm bằng cách sinh lại và so: 0 dòng ipv6, `--public-ip` vẫn IPv4).
Đường IPv4-đa-cổng chưa viết vì viết cả hai rồi bỏ một là phí.

⚠️ **Áp lên mạng ĐANG CHẠY là việc riêng, không phải hệ quả tự động của M3.1/M3.2.**
`netgen` sinh **khoá mới** ⇒ chạy nó trên mạng công khai là đổi danh tính cả 5
validator = giết mạng. Mạng đang chạy phải **vá tại chỗ** compose (y như M2.3 đã
làm với cổng 9660), và cần một cửa sổ bảo trì vì container phải recreate.

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

### ✅ H-6b — ĐÃ CHẠY 2026-08-25 (David duyệt trong phiên thứ ba)

Bản thứ hai đã tồn tại thật, ở **139.99.145.13:~/9chain-a1/backup/20260825-064053/**:
`9chain-a1.bundle` (42 commit, đã clone ngược thử → HEAD khớp) + `avalanchego-patches/`
(4 patch, đã áp thử → tree khớp từng byte). 6/6 sha256 khớp hai đầu.
Bundle **không chứa bí mật nào** — đã kiểm `git ls-files`: chỉ 2 file `.env` là cấu
hình Blockscout công khai, không có khoá.

Kèm backup đầy đủ ở máy dev: `C:\PROJECTS\9Chain-backups\9chain-a1-backup-20260825-064053\`
(28 file, `sha256sum -c` 28/28 OK) — có MANIFEST.txt + RESTORE.md.

🔴 **Bẫy đã dính, ghi lại để không mất giờ lần sau:** `git bundle` cho repo fork
avalanchego **sinh ra backup GIẢ**. `git bundle verify` in "is okay" + "records a
complete history", nhưng clone ngược chết ngay: `remote did not send all necessary
objects`. Lý do: repo fork là **shallow clone** (ranh giới `1cf1fc3`), và bundle từ
repo shallow luôn hỏng — kể cả khi chỉ bundle đúng một nhánh.
⇒ **`git bundle verify` KHÔNG đủ để tin. Phép đo đúng là CLONE NGƯỢC.**
⇒ Với fork: dùng **patch series** (`git format-patch <base>..9chain-a1`) + ghi lại
commit upstream gốc. Lớp chủ quyền chỉ có 4 commit trên `1cf1fc3`, upstream lấy lại
được từ ava-labs. Nghiệm thu bằng cách áp patch lên base rồi so **tree hash**
(`05c37aa4636ec64a39f5e06a0a90926e57a3d7e3`), không so commit hash — `git am` ghi lại
committer nên commit hash đổi mà cây mã nguồn vẫn đúng từng byte.

**H-6 gốc vẫn mở** (nơi đặt repo lâu dài + private/public) nhưng đã hạ mức: code không
còn nằm trên một ổ đĩa duy nhất.

### Ghi chú H-6b (nguyên văn lúc còn chờ duyệt)

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

### ✅ B-4 — ĐÃ GỠ (2026-08-25, phiên thứ tư) — ba lỗi của BÀI KIỂM, không phải của sản phẩm
Chạy lại trọn bộ trên mạng công khai: **40/40 ĐẠT**. Xem D-029.
1. **`tu-in-tien`**: mint **thành công** (`status 1`, block 1) nhưng bài đọc số dư ra
   `0.0`. Thử tay trên cùng chain trước đó ra đúng **777.0** ⇒ bài đọc số dư quá sớm.
   Vá: `doiSoDu()` đọc lại tối đa 10 nhịp và in ra thấy sau bao nhiêu nhịp.
2. **`chi-chu-deploy`** và **`kin`**: `nonce has already been used`. Hai kiểu chặn để
   lại nonce ở hai trạng thái khác nhau (`txAllowList` chặn lúc nộp ⇒ nonce không
   tiêu; `deployerAllowList` revert trong block ⇒ nonce đã tiêu). Vá: `guiVoiNonce()`
   đọc nonce tươi mỗi lượt, chỉ thử lại khi lỗi đúng là lỗi nonce.

### B-5 — Hai CSDL Postgres của Blockscout mở ra Internet (2026-08-25 → gỡ cùng ngày)
David duyệt, gỡ trong phiên thứ ba. **Đo trước/sau từ máy dev qua Internet:**

| cổng | trước | sau |
|---|---|---|
| 7432 (`db`) | **MỞ** | **ĐÓNG** |
| 7433 (`stats-db`) | **MỞ** | **ĐÓNG** |
| 443 (đối chứng) | mở | mở (đúng) |

Trên server: `0.0.0.0:7432` + `[::]:7432` → còn đúng `127.0.0.1:7432`. Blockscout hồi
lại sau vài giây (`/api/v2/stats` HTTP 200), trang công khai 200, **5/5 validator vẫn
connected**, đợt bơm tải 3 giờ chạy xuyên suốt không sứt mẻ (`lỗi 0`, 252 TPS).

🔴 **Bài học quan trọng hơn cả bản vá: vá ở `blockscout/` là vá TẠM.** Thư mục đó bị
`.gitignore` (bản clone upstream) — `setup.sh` clone lại là mất vá, không dấu hiệu.
Bản vá thật nằm ở `explorer-full/9chain-a1-server.override.yml` (**có trong git**),
mục 3, dùng `ports: !override`. Đã chứng minh bằng cách **hoàn nguyên
`services/db.yml` + `services/stats.yml` về nguyên gốc** rồi chạy lại
`docker compose config`: vẫn ra `host_ip: 127.0.0.1`. Tức override một mình đủ sức.

Đáng ghi thêm: hai Postgres này mang **mật khẩu mặc định của repo Blockscout công
khai** (nằm nguyên văn trong `services/db.yml` trên GitHub), nên "mở cổng" ở đây gần
như tương đương "mở cửa". Không có cách nào biết chắc đã có ai kết nối hay chưa.

### B-1 — Docker Desktop không khởi động trên máy dev (2026-08-24 → gỡ 2026-08-25)
`docker version` treo vô hạn, daemon không lên. **David mở lại Docker Desktop bằng tay
là xong** — không cần can thiệp gì thêm; bản chạy sau đó là 4.84.0 (engine 29.6.2).

Đã chặn M0.6 suốt một phiên. Gỡ xong thì M0.6 không những đạt mà còn cho kết quả mạnh
hơn kỳ vọng: binary build lại **trùng từng byte** với bản đang chạy công khai (D-017).
Nhân đó làm luôn cả M8.2/M8.3/M8.4 — **một việc của người thật mở được bốn task**.

Ghi lại vì nó là bài học về xếp ưu tiên: một blocker "chỉ cần bấm một nút" mà nằm chặn
bốn task thì nó đắt hơn vẻ ngoài rất nhiều, đáng escalate sớm thay vì đi vòng.

### B-0 — Console chết im lặng sau khi đồng bộ code (2026-08-24)
`pkill` giết được console nhưng lệnh khởi động lại trong cùng dòng ssh không chạy
(exit 255), console nằm im. Nguy hiểm nhất: `tail console.log` sau đó trông **y hệt**
một lần khởi động thành công vì đó là **banner cũ** còn nằm lại.
**Gỡ bằng:** `local-net/deploy/console-restart.sh` — chờ cổng nhả hẳn, khởi động,
rồi **tự kiểm chứng bằng `ss -tln`** và exit khác 0 nếu không lên. Không còn phải
nhớ mẹo ngoặc vuông bằng tay.
