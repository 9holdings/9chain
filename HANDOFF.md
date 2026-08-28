# HANDOFF — 9Chain Testnet A1 (Avalanche)

Cập nhật: **2026-08-28** (phiên khuya `28/08` — quét toàn diện + **diễn tập build 24 patch ĐẠT**
· B-17 đóng · B-10 đính chính. Trước đó cùng ngày: đợt autopilot 15 **8/8 mốc** (`A15-0`…`A15-7`)
· O1 + M11.10 · nạp ví · 6 patch).

> 🔴 **ĐỌC [`CLAUDE.md`](CLAUDE.md) TRƯỚC — đó là LUẬT.** Tệp này là **bàn giao**: dài, có lịch
> sử, và phần lớn là số đo của các phiên trước. Mâu thuẫn thì `CLAUDE.md` thắng về **luật**,
> `HANDOFF.md` thắng về **số đo**. Backlog: [`PROGRESS.md`](PROGRESS.md) — phiên quét lại + đợt 15.

## 🔵 PHIÊN SAU BẮT ĐẦU TỪ ĐÂY

```bash
node scripts/ngay-g-preflight.mjs      # trạng thái toàn cục trong 1 lệnh (~90s)
```

**Trạng thái `2026-08-28` cuối phiên khuya:**

| | |
|---|---|
| preflight | **11 đạt · 1 đỏ** — cái đỏ là ĐÚNG, xem ngay dưới |
| mạng g0 | sống · `999999999` · **9 validator** · 8 peer · B-12 còn **308 ngày** (`2027-07-02`) · factory **89,899 LOVE9** |
| drift server | **18 khớp · 1 lệch · 0 thiếu · 0 mồ côi chưa khai** (mồ côi 7 → **1**, tệp lành) |
| sao lưu H-6b | `20260828-043739` · 24 = 24 patch · **chậm 1 commit, chỉ tài liệu** |
| cây fork | 24 patch → tree `074aaa93` ✓ tái lập được |

🟡 **Cái ĐỎ duy nhất, và nó đỏ đúng:** `local-net/console/chainid-da-cap.json` lệch — repo sinh
lại nó (D-107, thêm nguồn sổ thứ tư) còn server chưa. **Hành vi console KHÔNG đổi**: danh sách
chặn vẫn **47 chainId · 53 tên**, chỉ thêm một dòng khai nguồn. Hết đỏ khi console được deploy
— lượt đó đã nằm trong runbook ngày G. **Deploy là việc có người bấm.**

### 🔴 Còn chặn GO/NO-GO `2026-08-29` — đúng MỘT việc, và nó chặn ở PHẦN CỨNG

```bash
node scripts/o1-kiem.mjs <thư-mục-bản-sao>    # B-16 · exit 0 ĐẠT · 1 SAI · 2 CHƯA KẾT LUẬN
```

**B-16 — bản sao thứ hai của khoá quỹ.** Đo `28/08`: máy dev có **đúng một ổ đĩa**
(`C:`, 1.862 GB) — không USB, không ổ ngoài. *"Hai nơi khác nhau về vật lý"* **không tạo ra
được từ phần mềm**; `C:\PROJECTS\9Chain-backups\` cũng trên `C:` nên **không tính**.
⇒ David cắm một ổ vào rồi cho ký tự ổ, **hoặc** chỉ ra nơi bản thứ hai đang nằm.

Phần A1 làm được đã xong: `o1-kiem.mjs` trên bộ **chính** ⇒ **exit 0** — bộ ở
`C:\Users\abc\9chain-a1-keys\g0\` **đúng là bộ của mạng đang chạy**, 6/6 quỹ giữ tiền thật.
Dấu vân tay để đối chiếu bản sao: `keys.txt` **3.531 B** `e350727a…` · `allocation.md`
**2.221 B** `654fb72e…` · `genesis.json` **7.753 B** `e1024eab…`.
⏳ Bộ khoá này **bị vứt bỏ `2026-09-01`** ⇒ đây là cửa sổ diễn tập **rủi ro bằng không**.

**Việc khác của David** (không chặn GO/NO-GO): O4 nhà cung cấp thứ hai (tiền) · ký SIWE cho
phép kiểm đẻ chain đầu-cuối · gộp `web-home` → `main` · **byte chữ khắc** (D-104).

⚠️ **Đừng cày tiếp trong phiên cũ.** Mọi thứ cần biết: `CLAUDE.md` (luật) · `PROGRESS.md`
(trạng thái) · `DECISIONS.md` **D-093→D-107b** (vì sao).

---

## TL;DR

Mạng công khai đang chạy **thế hệ `g0`** — `networkID 999999999`, `9chain-a1-g0`,
`supplyCap 7.900.000.001`, 9/9 node. Sinh lại `2026-08-27` (D-081). Đo lại `28/08` chiều: sống.

### 🔴 ĐỢT 15 (`28/08` tối) — 7/7 mốc đạt · 9 quyết định · 2 việc mới cho David

**Ngày G nay có MỘT lệnh:**

```bash
node scripts/ngay-g-preflight.mjs      # 12 cổng + 12 VIỆC TAY in thành ô trống
```

| công cụ mới | làm gì | đối chứng |
|---|---|---|
| `ngay-g-preflight.mjs` | runbook ngày G chạy được (D-101) | 12/12 xanh · `A1_GEN=1` ⇒ đỏ |
| `o1-kiem.mjs` | **O1 một lệnh** — gộp cả hai phép đo khoá (D-097) | 6/6, gồm bộ khoá **đã chết ⇒ exit 1** |
| `canh-mang.mjs` | 9 mục · **B-12 còn 308 ngày** · số dư factory (D-100) | 13/13 · RPC chết ⇒ **2**, không phải 0 |
| `dong-so-truoc-regenesis.mjs` | O3b: kéo sổ sống → dồn `chains`→`retired` (D-099) | 9/9 · không mất bản ghi ở n=43 |
| `do-lech-dong-ho.mjs` | B-13(b): chọn `--bu-ms` (D-102) | 7/7 · đo thật **557ms ±811** ⇒ giữ `3000` |
| `thehe-test.mjs` | cổng THẾ HỆ của console (D-093) | 13/13 · gỡ cổng ⇒ 7 hỏng |

**Cổng cũ được vá:** `check-consistency` nay nối `A1Gen` (Go) ↔ `A1_GEN` (JS) — **hai hằng số
chép tay ở hai ngôn ngữ, trước đó không cổng nào nối** · `check-deploy-drift` nay thấy **tệp
mồ côi** (hướng ngược) · `console-deploy.sh` chép 15 **và đối chiếu 15** (trước: chép 15 đối
chiếu 9).

🔴 **Ba phát hiện đắt nhất của đợt:**
1. **`console-deploy.sh` hỏng từ CHÍNH commit vá nó** (`a16c81c` = D-088) — một ký tự xuống
   dòng trong chuỗi JS ⇒ bản vá đóng gốc rễ B-14 **chưa từng chạy trót lọt lần nào**;
   `chainid.mjs` lên server bằng đường **chép tay**. ⇒ *Luật cứng #2 cần vế thứ hai: **một cổng
   chưa ai thấy nó CHẠY XANH THẬT thì cũng chưa phải cổng.***
2. **Hai bản `.bak` của console trên server đo được 0 lần `A1_DE_CHAIN_MO`** (một bản còn 0 lần
   `siwe`) ⇒ khôi phục là **mở lại đẻ chain** mà D-087 đóng, và gỡ xác thực ví của M4.1. ⇒ **B-17**.
3. **Bán kính ảnh hưởng của `A1Gen`:** đổi **một** hằng số làm **bốn** cổng đỏ. Bump ngày G
   **không phải "sửa hai dòng rồi đi tiếp"**.

✅ **Console ĐÃ DEPLOY `28/08`** (David yêu cầu): drift **19 khớp · 0 lệch · 0 thiếu**; console
sống tự khai `thế hệ : ✅ khớp node đang chạy — g0 · networkID 999999999`.

⚠️ **Tên miền sống là `a1.9chain.org`** — `testnet-a1.9chain.org` là tên **cũ**, Cloudflare trả
**525** cho nó. Đo bằng tên cũ ra "trang chết" trong khi trang vẫn sống (D-096).

---

### 🔴 Bốn điều của phiên chiều `28/08` — đọc trước khi làm gì đụng khoá

1. **`kiem-khoa` chấm `6/6 ✓ exit 0` cho một bộ khoá ĐÃ CHẾT** (D-090). Nó so `keys.txt` với
   `allocation.md` — hai tệp **cùng thư mục, chép cùng lượt**. ⇒ luôn chạy kèm
   `scripts/kiem-khoa-tren-chain.mjs`.
2. **Dòng `P-addr` trong `keys.txt` là CHỮ NGƯỜI VIẾT, không phải phép đo** (D-091b). Khối
   `[team]` dán địa chỉ `[foundation]` thì dòng in ra vẫn trông đúng và ví vẫn ký.
3. ✅ **M11.10 XONG và ĐÃ KÝ THẬT** (D-091): ví chạy ở máy dev, hầm SSH **trong cùng container**,
   khoá không chạm server. `9chain-a1-xpwallet` trên server **đã xoá hẳn** (D-092).
4. 🔴 **O1 vẫn CHƯA ĐẠT** — còn đúng một việc, và chỉ David làm được: **bản sao thứ hai**.
   Xem [`docs/O1-CUSTODY-PHEP-KIEM.md`](docs/O1-CUSTODY-PHEP-KIEM.md) · **B-16**.

🔴 **PHÁT HIỆN ĐẮT NHẤT `28/08`: mã trên server lạc hậu 2 ngày, mà mọi cổng vẫn xanh.**
Console công khai đứng ở commit `69c80ce` (26/08) ⇒ **B-14 ghi "ĐÃ ĐÓNG" trong repo nhưng
console vẫn cấp chainId từ `9100`** (trùng Genesis Coin); faucet thiếu `/api/supply` của I1b;
`export-chain.mjs` — công cụ **O2 gọi ở ngày G** — không có trên server. Gốc rễ: `console-deploy.sh`
liệt kê tệp thẳng trong script, nên việc tách `lib/chainid.mjs` ra *cho dễ kiểm* đã khiến nó
**không được deploy**. Đã vá + có cổng canh: **`node scripts/check-deploy-drift.mjs`** (D-087/D-088).
⇒ **Chạy cổng đó TRƯỚC khi tin bất kỳ dòng "ĐÃ ĐÓNG" nào.**

✅ Ví `chain-factory`: **89,99999173 LOVE9 unlocked** trên P (D-082). 🔴 **Chưa chứng minh đẻ
chain chạy được** — ví có tiền ≠ đường đẻ chain thông; và đẻ chain nay **TẠM ĐÓNG** tới sau
ngày G (D-087).

**Cây fork: tree `074aaa93` · 24 patch trên `1cf1fc3`.**
⚠️ **Image `9chain-a1/node:g0` đang chạy vẫn là bản 18 patch.** Patch 0019–0024 chỉ đụng **công
cụ** (SDK ví, netgen, `kiem-khoa`), không đụng node — chúng vào image ở lượt build ngày G.
Đừng đọc `074aaa93` thành "mạng đang chạy có 24 patch".

✅ **Lượt build 24 patch ĐÃ ĐƯỢC DIỄN TẬP `28/08` và ĐẠT** (D-105) — trước đó **chưa image nào
từng dựng từ cây 24 patch**, và lượt đầu tiên bị xếp vào đúng ngày G, sau `down -v`. Đo trên
node chạy bằng image mới: `supplyCap 7900000001000000000` · `eth_chainId 0x218711a09`
(= 9000000009) · **alias `LOVE9` ra tài sản**, **`AVAX` ĐỎ có lý do**.
🔴 **Hai lỗi công cụ lộ ra trong lượt tập, cả hai đều im lặng:**
1. `gen-network.sh` **không chuyển tiếp `NETWORK_ID`** ⇒ đường sinh mạng trong tài liệu chết ở
   mọi lượt gọi kể từ patch 0020. **Đã vá** (mảng `A1_NETGEN_ENV`, 17 biến).
2. netgen ghi **`image: 9chain-a1/node:dev` cắm cứng** vào compose, không biến nào đổi được.
   Build image mới rồi `up -d` mà quên sửa dòng đó ⇒ mạng lên bằng binary **18 patch**, 9/9
   node xanh, mọi cổng xanh. **CHƯA vá** (sửa netgen = đụng `patches/`) ⇒ thành **việc tay** ở
   preflight. `grep image: <net>/docker-compose.multinode.yml` trước khi `up`.
⚠️ Diễn tập dựng ở `A1Gen 0` ⇒ **không thay được lượt build ngày G** (bump lên 1 là đổi binary).
⚠️ Còn `local-net/net-dryrun/` trên máy dev — bộ khoá **vứt đi** của mạng tập `899999999`.
Gitignore rồi, nhưng **xoá tay đi**: đừng để nó nằm cạnh thư mục thật (gotcha 13).

⚠️ **Ngày G `2026-09-01` VẪN phải sinh lại lần nữa** (chữ khắc vào genesis) ⇒ **thế hệ 1**:
`A1Gen 1` · `networkID 999999998` · `9chain-a1-g1` · khối chainId L1 `9001000000–9001999999`.
David chốt `28/08`: **bỏ C1 khỏi tầm ngắm**, chỉ tập trung A1.

---

## ▶ Việc tiếp — theo thứ tự

| # | Việc | Ai | Ghi chú |
|---|---|---|---|
| **1** | ✅ ~~Nạp `chain-factory`~~ **XONG `27/08`** — 89,99999173 LOVE9 trên P. 🔴 **Còn nợ phép kiểm:** đẻ **một** L1 rồi thu hồi để chứng minh đường đẻ chain thông (cần David ký SIWE, và nó tạo chain THẬT trên mạng công khai) | A1 + **David** | D-082. Khoá Foundation lấy từ `net/keys.txt` **trên server** — không phải "khoá máy dev" như dự tính, xem O1 |
| **2** | 🟡 **O1 custody** — ✅ **NAY CHỈ MỘT LỆNH: `node scripts/o1-kiem.mjs <thư-mục>`** (D-097; exit 0 ĐẠT · 1 SAI · 2 CHƯA KẾT LUẬN). — bước 1 XONG `27/08` (D-085). 🔴 **`28/08` phát hiện `kiem-khoa` chấm `6/6 ✓ exit 0` cho bộ khoá THẾ HỆ ĐÃ CHẾT** ⇒ thêm cổng thứ hai nối vào chain (D-090). Nay **6/6 quỹ đã chứng minh giữ tiền thật trên g0**. ⇒ Còn lại đúng một việc của David: **bản thứ hai** — quy trình 15 phút ở [`docs/O1-CUSTODY-PHEP-KIEM.md`](docs/O1-CUSTODY-PHEP-KIEM.md) | **David** | 🔴 Khoá g0 vẫn ở **đúng một ổ đĩa**. 🔴 **Phải chạy CẢ HAI lệnh** — `kiem-khoa` một mình không phân biệt được bản sống với bản chết |
| **2b** | ✅ ~~B-15 bí danh tài sản~~ **CHỐT `27/08` — `LOVE9`, DỨT KHOÁT** (D-084). 🔴 Giá đã biết trước và chấp nhận: **công cụ dựng trên SDK avalanchego gốc KHÔNG nói chuyện được với A1**. Patch 0022 bắt nó hỏng ra tiếng | — | D-084 |
| **3** | ✅ ~~netgen sinh `.env`~~ **XONG `27/08`** — patch 0020, kèm **cổng chặn mạng THẬT sinh ra ở tư thế phơi trần** và `NETWORK_ID` nay bắt buộc | A1 | D-083. Đo đầu-cuối bằng `docker compose config`: có `.env` → `localhost,127.0.0.1`, giấu đi → `*` |
| **4** | ✅ ~~**B-9** `#e84142`~~ **XONG `27/08`** — patch 0021, vàng 9Chain trên navy | A1 | 🔴 Còn một chỗ NGOÀI phạm vi B-9: `local-net/console/index.html` **trên server** vẫn có 3 lần `#e84142` và lệch 12 byte so với git — thuộc worktree web, phiên này không đụng |
| **5** | **O4** — dời 1 node sang nhà cung cấp thứ hai, **hoặc** khai thật + đổi tên `01/09` | **David** | §12.3: cách rẻ nhất không phải tiền mà là chữ *"chính thức"* |
| **6** | ✅ ~~**B-10** robots.txt bị Cloudflare che~~ **CHẨN ĐOÁN SAI TỪ ĐẦU — ĐÓNG `28/08`** (D-106b). Cloudflare **CHÈN THÊM**, không **THAY**; tệp A1 luôn tới được người đọc. Cổng `node scripts/kiem-robots.mjs` ⇒ **exit 0**, 7/7 đối chứng | — | 🟡 Còn lại là **quyết định chính sách**: khối Cloudflare cấm hẳn 9 bot AI + khai điều khoản **nhân danh A1**. Muốn tắt: Overview → Control AI Crawlers → bỏ *Display Content Signals Policy* |
| **6b** | 🔴 **B-17 (MỚI)** — xoá 6 tệp `.bak` trên server: đường lui trỏ vào quyết định ĐÃ ĐÓNG (mở lại đẻ chain + gỡ xác thực ví). Lệnh soạn sẵn trong `BLOCKERS.md` | **David** | D-098 · autopilot không ghi lên server |
| **7** | ✅ ~~H-7~~ **CHỐT + LÀM XONG** — IPv4 đa cổng (D-089, patch 0024). 🔴 Còn lại của **O4 là TIỀN**: đã chứng minh beacon tới được từ Internet và mesh cùng máy còn nguyên, **chưa** chứng minh node ở máy khác bắt tay được — việc đó cần máy thứ hai | **David** (O4) | D-089 |
| **8** | **Gộp `web-home` → `main`** | **David** | `DECISIONS.md` đang tồn tại ở hai bản — xem §12.1 |
| **9** | GO/NO-GO `2026-08-29` · Ngày G `2026-09-01` | — | `docs/NGAY-G-A1-CON-LAI.md` §7 |
| **10** | ✅ ~~**M11.10**~~ **XONG `28/08`** (D-091) — ví ký từ máy dev qua hầm SSH **trong cùng container**; đã **ký thật** lên mạng công khai, khoá không chạm server. `node scripts/vi-qua-ham.mjs --kiem` | A1 | ✅ `--quy` cũng XONG (D-091b): 6/6 quỹ chọn đúng, `--kiem` kiểm được việc chọn quỹ **mà không khởi động ví**. ✅ `9chain-a1-xpwallet` trên server **ĐÃ XOÁ HẲN `28/08`** (D-092) — đừng dựng lại |

🔴 **Phép kiểm đẻ chain đầu-cuối cần HAI thứ của David:** ký SIWE, **và** biết rằng cổng nay
mặc định ĐÓNG — muốn chạy thì khởi động console với `A1_DE_CHAIN_MO=1` rồi tắt lại.

🔴 **Chữ khắc: cơ chế 100%, nội dung 0% — nhưng nội dung KHÔNG còn là việc A1 phải theo dõi.**
David chốt `28/08` (**D-104**): hai chuỗi chạy **song song**, C1 do **David điều phối riêng**.
⇒ A1 nhận **byte đã đóng băng** như một **đầu vào David cấp**, không chờ, không hỏi, không
xếp C1 vào bảng rủi ro của mình. Việc của A1 là: giữ cơ chế khắc chạy được, và **nói rõ hạn
chót mà đầu vào phải tới** để lượt sinh mạng ngày G không phải chờ.

---

## ✅ Đã xong phiên `2026-08-27 → 28` — đều đã chạy thật

| | Việc | Nghiệm thu |
|---|---|---|
| **D-082** | Bí danh tài sản X-Chain: SDK ví của fork hỏi `"AVAX"` trong khi g0 đăng ký `"LOVE9"` ⇒ **mọi ví X/C chết câm** | patch 0019 · `sha256` genesis g0 **khớp từng bit** trước/sau, mainnet/fuji **đổi** (phép so phân biệt được) · nạp ví thật, đọc lại bằng RPC công khai |
| **D-083** | netgen sinh `.env` + **chặn mạng THẬT sinh ra ở tư thế phơi trần**; `NETWORK_ID` nay bắt buộc | patch 0020 · 6 ca (3 đỏ) · đo đầu-cuối `docker compose config`: có `.env` → `localhost,127.0.0.1`, giấu đi → `*` |
| **D-084** | **David chốt: bí danh `LOVE9` DỨT KHOÁT**, không đăng ký thêm `AVAX`. Giá đã biết: công cụ SDK upstream không nói chuyện được với A1 ⇒ patch 0022 bắt nó **hỏng ra tiếng** | patch 0021 (B-9) + 0022 · 6 ca, **3 đối chứng** · toàn bộ `vms/avm` xanh |
| **D-085** | **O1 bước 1**: khoá g0 rời server (`shred -u`), + công cụ `kiem-khoa` | patch 0023 · `sha256` 3/3 · **khôi phục 6/6** · 4 ca đỏ |
| **D-086** | Sổ **"A1 đã từng cấp"** — 47 chainId + 53 tên, nhớ **xuyên thế hệ** | `chainid-test` **35 đạt/0 hỏng** (5 đối chứng) · **verify trên API thật** |
| **D-087** | Đẻ chain **TẠM ĐÓNG** tới sau ngày G (`A1_DE_CHAIN_MO`) | 3 ca · **đã deploy**, console công khai từ chối đúng câu |
| **D-088** | **Cổng canh khoảng cách repo ↔ server** + manifest deploy (một danh sách, hai nơi đọc) | bắt **5 lệch thật** ngay lần đầu · đối chứng ngược đạt · `/faucet/api/supply` nay **200, số đo từ chain** |
| **D-089** | **H-7 = IPv4 đa cổng** (David chốt). Bản đầu **sai**, diễn tập 3 node bác nó | patch 0024 · mesh `1 → 2` peer sau khi sửa · beacon bắt tay TCP được **từ ngoài Internet** |
| **D-090** | 🔴 **`kiem-khoa` chấm `6/6 ✓ exit 0` cho bộ khoá đã chết** ⇒ cổng thứ hai nối bộ khoá vào **chain đang chạy** | bộ g0 **6/6 khớp chain** · bộ 9001 đã chết **8 lệch, exit 1** · **5/5 đối chứng ngược** · O1 lần đầu nối được khoá ↔ **tiền** |
| **D-091** | **M11.10** — ví ký ở máy dev, **hầm SSH trong cùng container**; khoá không chạm server | 3/3 nghiệm thu đường đi (chạy mỗi lượt) · 🔴 **KÝ THẬT**: `p-to-x 0.1` trên mạng công khai, đọc lại bằng RPC công khai P `89,99999173 → 89,8999813` · X `0,009 → 0,108` · `Accepted` |
| **D-092** | **Gỡ `9chain-a1-xpwallet` khỏi server** (ví HTTP không auth, giữ khoá trong env). 🔴 Quét sau đó lộ **2 thứ khác**, xem dòng dưới | khoá trong env **trùng hash** bản trên máy dev · 0 tuyến/0 kết nối · dừng trước, đo sản phẩm, rồi mới xoá · sau khi xoá: **0 container còn `WALLET_KEY`**, `find keys.txt` ⇒ **0** |
| **D-091b** | `--quy` chọn 1 trong 6 khoá `keys.txt`. 🔴 **Dòng `P-addr` trong tệp là CHỮ NGƯỜI VIẾT** — khối `[team]` dán địa chỉ `[foundation]` thì dòng in ra vẫn trông đúng ⇒ gọi `kiem-khoa` trên đúng khối vừa chọn | 6/6 quỹ, **sáu địa chỉ khác nhau** khớp `ALLOCATION-PUBLIC.md` · khối thứ 3 và thứ 6 phân biệt được với "lấy khối đầu" · ví lên thật với `--quy faucet` · **6/6 đối chứng ngược** |

---

## ✅ Đã xong `2026-08-27` (đợt trước trong cùng phiên) — không phải "đã viết"

| | Việc | Nghiệm thu |
|---|---|---|
| **D-069** | Gốc dải chainId L1 `9100` → `9000000010` | `chainid-test` 22 đạt · 4 ca đối chứng ngược |
| **D-070** | Block Adam neo vào **hash giao dịch nghi lễ** | Diễn tập lại: `--bu-ms 0` (ca bản cũ chấm ✗) nay 10 đạt/0 hỏng |
| **D-071** | 9 validator `restart=no` → `unless-stopped` | Ca A/B trên container nháp; **chưa reboot thật** |
| **D-072** | O2 chạy thật trên mạng công khai | 37–54s · 4 ca, 2 đối chứng ngược |
| **D-073/074/075** | Chống nhúng iframe · CORS · cổng chặn deploy làm teo cấu hình | Đã deploy · cổng đã thấy **ĐỎ** (chặn 68 dòng) |
| **D-077** | `cb58.mjs` neo C-Chain → P-Chain | Neo cũ **đã chết từ 26/08 mà bài vẫn 8/8 xanh** |
| **D-079** | Bộ định danh theo thế hệ, 18 patch, tree `f4615e73` | Mạng tập 3 node + **bài cắt-kết-nối có đối chứng dương** |
| **D-080** | `GỐC` mạng thế hệ trước, công bố **trước khi xoá** | `c92ad73cf6cdcf44ef32bf4bb6475d282fb76878c553f690533bfa6c476ce066` |
| **D-081** | **Re-genesis mạng công khai → g0** | 9/9 node · drip `0x635f2183…` đọc lại từ chain = 10 LOVE9 |

Ba bản soát mới: `docs/SOAT-TOAN-DIEN-2026-08-27.md` (lớp vận hành) ·
`docs/HIEN-TRANG-A1-2026-08-27.md` · `docs/DE-XUAT-BO-DINH-DANH-THE-HE.md`.

---

## 🔴 GOTCHAS — thứ sẽ tốn giờ nếu không biết trước

16. 🔴 **netgen ghi `image: 9chain-a1/node:dev` CẮM CỨNG vào compose nó sinh** — không biến
    môi trường nào đổi được (đã đối chiếu cả 18 biến `env()` của netgen). Ngày G build image
    mới rồi `up -d` mà quên sửa dòng đó ⇒ mạng lên bằng binary **18 patch**, **9/9 node xanh,
    mọi cổng xanh**, và bí danh `LOVE9` không có trong binary ⇒ mọi ví X/C chết câm. Chưa vá
    (sửa netgen = đụng `patches/`). ⇒ `grep image: <net>/docker-compose.multinode.yml` trước
    khi `up`, và sau đó **đo BINARY** (`docker exec … --version`), đừng đo mạng. (D-105)
17. 🔴 **"Đã có bản lưu rồi nên xoá được" là một PHÉP ĐO, không phải câu trấn an.** B-17 sai
    **hai lần trong một phiên**: một sổ danh bạ 20 KB và **hai tệp mã** không trùng bất kỳ
    phiên bản git nào — trong khi mục đó khẳng định xoá không mất gì. ⇒ Trước khi xoá bất cứ
    thứ gì trên server: đối chiếu `sha256` **từng tệp một**, không kiểm *"nhóm tệp"*.
    **Phạm vi của một lời trấn an hẹp hơn phạm vi của lệnh nó đi kèm.** (D-107 · D-107b)
18. 🔴 **ĐỎ GIẢ — vế thứ ba của luật cứng #2.** Thấy cổng đỏ **chưa đủ**; phải kiểm nó đỏ
    **VÌ ĐÚNG LÝ DO**. `kiem-robots` bản đầu đỏ ngay lần chạy đầu và cái đỏ đó bị đọc thành
    *"cổng nhạy"* — thật ra nó chấm bằng **dòng đầu** `robots.txt` trong khi tưởng đang chấm
    bằng **nội dung**. Cloudflare **chèn thêm**, không **thay** ⇒ B-10 chưa bao giờ là một lỗ.
    Kèm: **đọc HẾT tệp trước khi dựng cổng cho nó** — chính `web/public/robots.txt` đã viết
    sẵn phép đo đúng trong chú thích. (D-106b)

1. **`net/` do container netgen sinh ⇒ thuộc `root`.** `sed` sửa `docker-compose.multinode.yml`
   **thất bại lặng lẽ** ⇒ mạng lên bằng image CŨ. `sudo chown -R ubuntu:ubuntu ~/9chain-a1/net`
   trước khi sửa.
2. ✅ ~~**netgen KHÔNG sinh `.env`**~~ — **ĐÃ VÁ `27/08`** (patch 0020, D-083). Nay netgen tự
   sinh, **và từ chối sinh mạng THẬT** với `A1_HTTP_ALLOWED_HOSTS=*` hoặc `A1_API_BIND=0.0.0.0`.
   ⚠️ **Vẫn phải chép `.env` khi chép mạng sang máy khác**, và **vẫn phải `--env-file` khi chạy
   compose từ thư mục khác** — cổng chỉ canh lúc SINH, không canh lúc CHẠY.
   ⚠️ `A1_CONFIG_DIR` netgen **không kiểm được** (nó giải trên máy chủ). Bố cục server hiện tại:
   `/home/ubuntu/9chain-a1/src/9chain-a1-config` — khai bằng biến cùng tên lúc chạy netgen.
2b. 🔴 **`NETWORK_ID` của netgen NAY BẮT BUỘC.** Trước đó mặc định `9001` — số của thế hệ đã
   chết. Lệnh cũ không khai `NETWORK_ID` sẽ dừng, và đó là chủ ý: chọn băng là một quyết định.
3. **`docker restart` KHÔNG nạp lại env.** Faucet giữ khoá thế hệ cũ ⇒ `insufficient funds`.
   Phải **`docker rm -f` rồi `docker run`** lại (lệnh đầy đủ trong D-081).
4. 🔴 **Cổng chỉ chứng minh được đường mà CHÍNH NÓ đi.** Cổng netgen xanh + `go test` xanh, mà
   node vẫn log `supplyCap 720 triệu` — vì `config/config.go` lắp cấu hình bằng đường khác. Thứ
   đi vào genesis phải nghiệm thu **trên node đang chạy**.
5. **`docker stop` VÀ `docker kill` đều KHÔNG kích hoạt `restart: unless-stopped`** (cả hai là
   "người dùng chủ động dừng"). Muốn thử chính sách thì để tiến trình **tự chết**.
6. **`git add -A` trong repo này nguy hiểm** — có phiên khác đang làm việc. Commit bằng đường
   dẫn tường minh. *(Đã nuốt nhầm việc của phiên `eb` một lần.)*
7. **Hai phiên đánh số quyết định độc lập ⇒ va chạm.** Bộ định danh được phiên `eb` gọi `D-072`
   nhưng trong repo nó là **`D-076`**. `DECISIONS.md` là nguồn sự thật.
8. **`SUBNET_PREFIX` của netgen PHẢI kết thúc bằng `.0`** — nhận `172.31.9` im lặng rồi sinh
   compose Docker từ chối.
9. **Heredoc bash + Python nuốt dấu gạch chéo** — sửa mã Go có `\n` trong chuỗi thì dùng công cụ
   sửa tệp, đừng `python <<'PY'` với `str.replace`.
10b. 🔴 **"ĐÃ ĐÓNG" trong `BLOCKERS.md` chỉ nói về REPO.** `28/08` phát hiện console công khai
    đứng ở `69c80ce` (26/08): **B-14 đóng trên giấy, hở ngoài đời suốt hai ngày**, và faucet
    thiếu `/api/supply` của I1b. Gốc rễ: `console-deploy.sh` liệt kê tệp **thẳng trong script**,
    nên việc tách `lib/chainid.mjs` ra *cho dễ kiểm* đã làm nó **không được deploy**. Nay danh
    sách nằm ở `manifest-deploy.json`, hai nơi đọc chung. **Chạy `check-deploy-drift.mjs` trước
    khi tin một mục đã đóng.**
10. 🔴 **`rebrand.sh` KHÔNG phủ hết lớp bản sắc — và chỗ nó bỏ sót là chỗ MÁY đọc.** Phạm vi nó
    đúng 4 chuỗi (`Client`, token `Name`, token `Symbol`, `FallbackHRP`). Bí danh tài sản X-Chain
    — thứ **mọi công cụ hỏi X-Chain phải gọi đúng** — nằm ngoài. Đổi nó ở `genesis.go` mà không
    đổi `wallet/chain/{x,c}` là giết mọi ví X/C **mà đường đẻ chain vẫn xanh** (nó đi P-Chain).
    Nay một hằng `constants.GetAssetAlias`, hai nơi đọc — xem D-082 trước khi đụng lại lớp này.
15. 🔴 **`A1_CONSOLE_TOKEN` ĐÃ ĐỔI `28/08`** (D-092c) — token cũ nay trả **401**. Giá trị mới ở
    `C:\Users\abc\9chain-a1-keys\console-token.txt` (ngoài repo, ngoài git). ⚠️ **`console-deploy.sh`,
    `bridge-test.mjs`, `auth-e2e-test.mjs` đọc token từ env** — nạp `console.env` hoặc lấy từ tệp
    đó, đừng dùng giá trị nhớ trong đầu. 🔴 Và bài học của lượt đó: token cũ **chưa từng được đổi
    qua HAI lượt re-genesis** — nó nằm trong cả `console.env.bak-720m` lẫn `bak-pre-g0`; **đưa
    vào việc ngày G**: sinh mạng mới thì sinh luôn token mới.
14. ✅ **`check-deploy-drift.mjs` NAY THẤY tệp thừa — lỗ này đã đóng cùng ngày (D-098/A15-3).**
    Đo lại `28/08` cuối phiên: cổng bắt **7 mồ côi**, tách **🔴 MỒ CÔI** (không có trong repo)
    khỏi **ℹ️ ngoài tầm canh**, và `null ≠ []` (không quét được là *không biết*, không phải
    *sạch*). ⚠️ Vẫn phải khai từng tệp mồ côi trong `manifest-deploy.json` — mục đã khai thì
    cổng chỉ nhắc, **không đỏ**; khai bừa là tự bịt mắt mình.
    <br>*(Nguyên văn lúc còn hở, giữ lại vì phép đo vẫn nguyên giá trị:)* nó canh 18 tệp trong
    phạm vi: *"tệp trong danh sách có khớp không"*. Một tệp bị **XOÁ khỏi repo** mà vẫn nằm
    trên server thì **không nhóm nào thấy**. Đo `28/08`: `src/9chain-a1-config/genesis.json` —
    **genesis LOCAL của Avalanche** (`networkID 9001`, 3 địa chỉ `X-local1…`, khoá **công khai
    trong repo avalanchego**) — repo đã xoá `27/08`, **server vẫn còn**. ⚠️ Mạng công khai boot
    bằng `net/genesis.json` do netgen sinh nên nó là **bẫy nằm im**, không phải lỗ đang chảy.
    ✅ **Cả hai đã `shred -u` `28/08`** (D-092b) — kèm `~/9chain-a1/vi-thu.json`, khoá riêng
    trần số dư 0. ~~**Lỗ trong CỔNG thì vẫn còn:** drift không thấy tệp thừa.~~ **⇒ ĐÃ ĐÓNG
    cùng ngày bởi D-098** — xem đầu mục.
    ✅ Kèm kết quả mạnh hơn: quét hash **toàn máy** đối chiếu **cả 6 khoá quỹ** ⇒ **server
    không còn khoá quỹ nào**. Còn đúng hai khoá, **đều có chủ ý**: `FAUCET_PK` và
    `console.env → A1_CLI_KEY` (= `chain-factory`). `A1_L1_ADMIN` là **địa chỉ** Foundation,
    không phải khoá.
13. 🔴 **`local-net/net-public/` là một thư mục TRỘN — nửa chết, nửa sống.** Đo `28/08`:
    `keys.txt` là bộ **thế hệ 9001 đã chết** (kiem-khoa khai `networkID 9001`, cả 6 quỹ đọc ra
    **0 trên chain**), nhưng `chain-factory-key.txt` **cùng thư mục** lại là khoá **g0 đang
    sống** — `P-love91vgh2wh…`, ví thật đang giữ tiền và vừa ký được giao dịch. Ngày giờ tệp
    cũng lệch (`18:39` vs `19:03`). ⇒ **Không có câu trả lời đúng cho "thư mục này còn dùng
    được không"** — phải hỏi từng tệp. Đây đúng là thứ khiến người ta cất nhầm bản sao lưu.
12. 🔴 **`kiem-khoa` KHÔNG phân biệt được bộ khoá còn sống với bộ khoá đã chết.** Nó so
    `keys.txt` với `allocation.md` — **hai tệp cùng một thư mục, chép cùng một lượt**. Bộ khoá
    thế hệ `9001` (tiền không tồn tại ở đâu cả) qua nó sạch **6/6 ✓, exit 0**. Nó *có* cảnh báo
    `networkID`, nhưng câu phán cuối vẫn xanh — mà đó là câu người ta đọc. **Luôn chạy kèm
    `scripts/kiem-khoa-tren-chain.mjs`** (D-090). ⚠️ Bộ `9001` đã chết vẫn nằm trên máy dev ở
    `local-net/net-public/` — đúng thứ dễ bị chép nhầm thành "bản sao lưu".
11. **Cổng C-4 có một ca chưa lường:** *"khắc chữ TẮT ⇒ bản tập"* sai với **mạng THẬT ở thế hệ
    trước lượt khắc chữ**. Nó chỉ cảnh báo, không chặn — nhưng đừng đọc cảnh báo đó thành lỗi.

---

## Lệnh hữu ích

```bash
# Đo bộ định danh mạng công khai
curl -s -X POST -H 'content-type: application/json' \
  --data '{"jsonrpc":"2.0","id":1,"method":"info.getNetworkName","params":{}}' \
  https://rpc-a1.9chain.org/ext/info

# supplyCap ĐANG CHẠY (đừng đọc mã — đọc node)
# 🔴 SỬA `28/08`: bản cũ dùng `docker logs` và nay RA RỖNG — vòng đệm stdout đã trôi qua
#    dòng boot sau ~11 giờ chạy. Nó KHÔNG báo lỗi, chỉ im lặng ra rỗng ⇒ dễ đọc thành
#    "không đo được". Đường còn sống là đọc tệp log TRONG container:
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" \
  'docker exec 9chain-a1-node-1 sh -c "grep -rho \"supplyCap[^,]*\" /root/.avalanchego/logs | head -1"'
# đo 2026-08-28 ⇒ supplyCap":7900000001000000000 ✓

# 🔴 M11.10 — ví ký ở MÁY DEV, khoá không chạm server (D-091)
node scripts/vi-qua-ham.mjs --kiem      # nghiệm thu đường đi, KHÔNG cần khoá, KHÔNG chạy ví
node scripts/vi-qua-ham.mjs --tu-kiem   # 3 ca đối chứng ngược
node scripts/vi-qua-ham.mjs --khoa <tệp> [--quy foundation] [--cong 8090]
docker rm -f 9chain-a1-vi-ham           # 🔴 xong việc là dừng NGAY — container này giữ khoá

# 🔴 O1 — bộ khoá quỹ có phải của MẠNG ĐANG CHẠY không (D-090). Chạy CẢ HAI, cùng thư mục:
node scripts/kiem-khoa-tren-chain.mjs <thư-mục-khoá>/allocation.md
node scripts/kiem-khoa-tren-chain.mjs --tu-kiem     # 5 ca đối chứng ngược
# kèm: kiem-khoa -allocation allocation.md keys.txt  (xem docs/O1-CUSTODY-PHEP-KIEM.md)

# 🔴 Cổng canh khoảng cách REPO ↔ SERVER (D-088) — chạy TRƯỚC khi tin bất kỳ mục "ĐÃ ĐÓNG" nào
node scripts/check-deploy-drift.mjs

# Cổng repo
node scripts/check-consistency.mjs --tu-kiem
node scripts/sinh-chainid-da-cap.mjs --kiem
node local-net/console/chainid-test.mjs
node local-net/lib/cb58.mjs --self-test
node scripts/check-chainid.mjs

# Tái lập cây fork (24 patch → tree 074aaa93)
cd upstream/avalanchego && git worktree add --detach /tmp/tl 1cf1fc3
cd /tmp/tl && git am --keep-cr ../../patches/*.patch && git rev-parse HEAD^{tree}

# Số dư ví chain-factory (đẻ chain chết câm khi cạn) — chưa có giám sát, phải nhớ tự đo
curl -s -X POST -H 'content-type:application/json' \
  --data '{"jsonrpc":"2.0","id":1,"method":"platform.getBalance","params":{"addresses":["P-love91vgh2whn746dzzvg0dj4w9rsqvlalcldvpueuvj"]}}' \
  https://rpc-a1.9chain.org/ext/bc/P
```

⚠️ **Luật cứng của repo** *(đã trả giá để học)*:
1. **Không tin mã HTTP.** Thang đo: mã HTTP → `content-type` → **nội dung** → header tầng trước.
2. **Mọi cổng mới phải được nhìn thấy lúc nó ĐỎ.** Chưa có đối chứng ngược = mới kiểm một nửa.
3. **Đụng `patches/` là đụng đường tái lập fork** — sinh `--no-signature`, nghiệm thu
   `git am --keep-cr` + so tree. **Sinh lại CẢ BỘ.** Tree hiện tại: **`074aaa93`** / **24 patch**
   / gốc `1cf1fc3`. Đối chứng ngược rẻ mà mạnh: áp **23/24** phải ra đúng tree cũ `2954b987`.
   ⚠️ **Image node đang chạy vẫn là 18 patch** — 0019 đụng SDK ví, 0020 đụng netgen; cả hai là
   CÔNG CỤ, không đụng node. Tree của repo ≠ tree trong image cho tới lượt build ngày G.
4. **Chỉ MỘT phiên được deploy.** Worktree web ở `C:\PROJECTS\9Chain-A1-web` (nhánh `web-home`)
   — 🔴 **Caddyfile ĐANG CHẠY đến từ nhánh đó**, không phải `main`. Deploy từ `main` sẽ xoá công
   việc của phiên web (cổng D-075 nay chặn, nhưng đừng dựa vào nó).

---
## Lịch sử các đợt trước

Đã tách sang [`docs/archive/HANDOFF-lich-su-2026-08.md`](docs/archive/HANDOFF-lich-su-2026-08.md)
(`2026-08-28`, A15-7) — **không mất một chữ nào**, chỉ thôi nằm trên đường đi hằng ngày.
Ở đó: đợt autopilot 14 · soát CORE `27/08` · chuẩn hoá thương hiệu `27/08` · các phiên trước.
