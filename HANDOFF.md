# HANDOFF — 9Chain Testnet A1 (Avalanche)

Cập nhật: **2026-09-04** — 🟢 **PREFLIGHT `50 đạt · 0 đỏ`** · hai cổng nay đo **bộ sáng lập** (D-180) · hướng dẫn validator
**tự xoá danh tính** người đọc, đã sửa + đối chứng trên image (D-181) · bài toán **108 L1** + phân tích **"một chain
cho mỗi người"** hai bản (đối chiếu thế giới 2026) · **`main` ĐÃ CÔNG BỐ** `official/main 4e0438e` qua script (D-182).
🔴 Hướng phiên sau (David): **tiếp tục nghiên cứu hướng phát triển công nghệ** — đọc mục **CHỐT PHIÊN `2026-09-04`** ngay dưới.
Trước đó: **2026-09-03 tối** — Blockscout nghỉ hẳn · 6 L1 · ký hiệu token (P-54) · 10 validator, cái thứ 10 là người ngoài.
*(Bản `03/09`:)* 🟢 **BLOCKSCOUT ĐÃ NGHỈ HẲN · 6 L1 · console nhận KÝ HIỆU TOKEN (P-54) ·
10 validator, cái thứ 10 là người ngoài.** Node-1 từ `435 → 9,8` gọi/s. Còn **9/15 chỗ**. 🔴 **14 commit
CHƯA ĐẨY**. 🔴 Cho `web-home`: trang 404 công khai đang **502** (P-52) và MetaMask vẫn in **LOVE9** cho
L1 (P-55). Đọc mục **CHỐT PHIÊN `2026-09-03` CHIỀU→TỐI** ngay dưới; mục **BA L1 SỐNG** (sáng cùng ngày)
giữ nguyên bên dưới nó.
🔴 **`2026-09-04`: `official/main` ĐÃ ĐƯỢC LỌC LẠI LỊCH SỬ (`fbfb3ff → 7f25b34`, 436 → 428 commit) — `git push official`
TỪ NAY HỎNG non-fast-forward, và ĐỪNG force-push** (force là đưa cả runbook vận hành trở lại Internet). David chốt:
repo công khai không mang `local-net/deploy/**`, `docs/DEPLOY-KSGAME.md`, `"$A1_SSH_HOST"`, `"$A1_SSH_KEY"`.
Đường công bố duy nhất: `bash local-net/deploy/publish-official.sh <nhánh đích> [ref nguồn]` — **nay có trên `main`**
(bản Anh, bảng thay thế ở `publish-official.replace.txt`). ✅ **Đã công bố `04/09`: `7f25b34..4e0438e`, 21 commit, fast-forward** (D-182). `main` không có tổ tiên chung với `official/main`:
**đừng `git pull official`**. `origin` (riêng tư) giữ nguyên; ref công khai cũ ở `origin/backup/official-*-20260904`.
Đối chứng `04/09` từ phiên này: `official/main` 0 commit đụng `local-net/deploy`, 0 blob có chuỗi ssh; `main` còn 12 tệp.
Trước đó **2026-09-02** chiều — 🟢🟢 **CHẶN SỐ 1 HẾT CHẶN: `genesis.json` NAY TẢI ĐƯỢC TỪ NGOÀI**
(D-158). Đã đẩy `official` + `origin`, nghiệm thu **bằng tay** trên đúng đường người lạ đi.
🔴 Hoá ra không phải *"chưa ai tải lên"*: tệp **không được git theo dõi** — byte cả thế giới cần
nằm ở **hai chỗ vận hành, không repo/sao lưu/release nào**, và **không cổng nào đo một sự vắng
mặt**. Kèm: mồ côi trên server **đã xoá** (B-17 trọn ba bước). Preflight **40 đạt · 2 đỏ**
(40→42 mục). **Hai đỏ còn lại**: ví factory 0 đồng — thứ **duy nhất** còn chặn việc mở lại cổng
đẻ chain L1 — và footer `web-home` (luật cứng #4). Chi tiết ở mục ngay dưới.
*(Số đo cũ giữ nguyên bên dưới làm bản ghi.)* <!-- stale-ok -->

Trước đó cùng ngày — 🟢 **VIỆC 1 + 2 XONG TRÊN SẢN PHẨM · D-088 ĐÓNG · 4 cổng mới từ báo cáo
người ngoài** (D-155 · D-156 · D-157). Preflight **37 đạt · 3 đỏ** (34→40 mục).

Trước đó `2026-09-01 15:2xZ` — 🔴 **SỔ CHAIN CÔNG KHAI CÒN KHAI 2 CHAIN CỦA g0** (D-154):
`/chains/data/console-chains.json` phát `#9000000010` · `#9000000011`, RPC của chúng trả `404`.
Bản nén đúng đã có trong repo từ giờ G, **chưa lên server**. Không cổng nào bắt vì lỗ nằm **giữa
hai đại lượng** — drift để tệp đó ngoài tầm canh (console tự ghi), doc-drift chỉ đọc văn xuôi mà
đây là **JSON**. ⇒ Cổng mới `check-chain-ledger.mjs`, đo trên **bề mặt công khai**, **cả hai
chiều**, **24 đối chứng** + đối chứng **dương** (bản nén đúng ⇒ PASS). Preflight **32 → 34 cổng**:
`31 đạt · 3 đỏ · 0 không chạy được`. 🟢 Kèm: `A1_CONFIG_DIR` đo trên node — **KHÔNG dính bẫy**.
Trước đó cùng ngày: 🟢 **PREFLIGHT `30 đạt · 2 đỏ · 0 không chạy được · 40 việc
tay`** (số cũ `29 · 2 · 1`), **đo hai lượt cách nhau 14 phút, trùng khít cả con số lẫn nội dung**.
Hai đỏ **đều là việc David** và không đổi: ví `chain-factory` **0 LOVE9** · console trên server còn
bản g0 — 🔴 **NĂM tệp, không phải sáu**: `faucet/server.mjs` **đã KHỚP**. 🟢 **B-19 thôi là "tiền
thật"** — `90,007 LOVE9` chết cùng g0, hai mục TRAP tự biến mất vì **đại lượng chúng canh đã đổi**.
Kèm **D-153**: một cổng **không bao giờ xanh được**, vì một lý do **không phải lý do của nó**
(`net-tap-g1/` rỗng ⇒ mã 2 vĩnh viễn, mà remedy in ra lại là *"chạy lại khi chain tới được"* —
chain vừa được đo thành công ở dòng trên). Đối chứng **27 → 40 ca**, ba bản hỏng có chủ ý.
Trước đó cùng ngày — 🔴 **BẢNG PHÂN BỔ CÔNG KHAI LÀ BẢNG CỦA MẠNG ĐÃ XOÁ**, và
phát hiện **đến từ 9Chain-BOD** chứ không từ cổng nào của A1 (D-150): `docs/ALLOCATION-PUBLIC.md`
khai `networkID 999999999` (g0, chết `09:26Z` sáng đó) **sau khi repo đã công khai** — Foundation
khai **1 tỷ**, đo trên chain sống ra **0**. Đã chép bảng `g1` về (`o1-check --rpc` **cả hai nửa
xanh**), bản g0 sang `archive/` kèm bia mộ, và dựng cổng **`check-doc-drift.mjs`** — thứ lẽ ra
phải có từ lần re-genesis đầu. Preflight nay **32 cổng**. Kèm: **D-149 viết bù** (cửa sổ yên tĩnh
`09/09` — đã bị ba nơi trích dẫn mà chưa ai viết ra).
🔴 **Kèm D-151 — tuyến sao lưu đã ĐỨT 7 tiếng mà không gì báo:** repo sao lưu bị **archive
`12:19Z`**, phát hiện bằng một lượt `push` thật (403), không bằng cổng nào. Repo archive vẫn giữ
URL, vẫn cho đọc, vẫn trả `fetch` — **chỉ từ chối GHI**. Nay: remote riêng tư mới
`daviddokrao/9chain-a1-backup` (375 commit, PRIVATE, kiểm **trước** khi đẩy) · remote chết giữ lại
đổi tên `archived-31aug` · cổng `check-remotes.mjs` **16/16**, đã thấy đỏ trên **dữ liệu thật**.
⚠️ **Ba remote — đọc TÊN trước khi đẩy, một trong ba là cả Internet.**
🟢 **Mở lại đẻ chain L1 (D-152): ba việc, cả ba là việc có người bấm, và nay có MỘT lệnh đo cả ba**
— `node scripts/reopen-chain-creation.mjs --probe`. Thứ tự **là** phép kiểm: sổ + mã console lên
server → nạp ví factory (**X→P**, không phải X sang X) → bật cờ. Đo `01/09`: cả ba đỏ, đúng thứ tự.
Phép đo cửa **không tạo được chain** (gửi tên `!`, regex tên của console không đời nào nhận).
Nghi lễ `09/09` **không** chặn việc này (P-Chain ≠ C-Chain).
Trước đó cùng ngày — phiên **HẬU PHÓNG**: ① cổng mới canh **lịch sử git** trước lượt
bật repo công khai (D-145) — **0 vật liệu khoá trong 2.349 object** ② **kịch bản nghi lễ `09/09`**
(D-146, 11 đối chứng, chạy khô mặc định) ③ **D-147: ranh giới Block Adam = BAO GỒM** (`ts >= mốc`),
lấy theo cái C1 đã công bố. Hai đỏ còn lại đều là việc David (ví `chain-factory` 0 đồng · console
server vẫn bản g0). **Ba câu chờ David cho `09/09`:** cửa sổ yên tĩnh hay để bơm chạy · nội dung
giao dịch Adam/Eva (chưa ai khai) · đo B-13(b). Trước đó cùng ngày:
🟢 **MẠNG g1 ĐÃ SINH RA VÀ ĐANG SỐNG**: `down -v` `09:26Z` ·
9/9 node · `watch-network` **5 đỏ → 0 đỏ** · chữ khắc `engrave-verify` **17/0** đọc ngược từ chain
sống · **9/9 cổng P2P mở, đo từ ngoài Internet** · `minValidatorStake` **81 LOVE9** trên P-Chain.
Cùng ngày, phiên
**SOÁT 3 VÒNG + VÁ**: image g1 nay ở **CẢ HAI** máy · sổ chặn
đã xoá có chữ ký · 7 commit `8ebae9e`→`cb3813f`. Trước đó `2026-08-31` phiên **ĐÊM**:
🔴 **GIỜ G CHỐT `01/09 13:09:09` Jerusalem** ·
**image g1 ĐÃ TRÊN SERVER** — chỗ chặn số 1 đã đóng · **cổng đẻ chain ĐÃ ĐÓNG** · O2 + H-6b xong ·
**hai lượt tổng duyệt, một ở mỗi băng**, và bản băng THẬT chứng minh thứ băng tập không kiểm được).
Trước đó cùng ngày, phiên **CHIỀU**: ba lượt quét · **D-132: A1 dẫn dắt** · bộ khắc chữ sẵn sàng.
Cùng ngày, phiên sáng: **MẶT NGƯỜI DÙNG** — sửa 3 lỗi đường sản phẩm (D-129→D-131). Trước đó
`2026-08-30`: diễn tập g1 (D-123→D-128, fork **26 patch / tree `60a61707`**). `2026-08-29`: mở
testnet công khai (D-116→D-122) và soát chỗ hở ngày G (`docs/GDAY-G1-GAPS.md`).

> 🔴 **ĐỌC [`CLAUDE.md`](CLAUDE.md) TRƯỚC — đó là LUẬT.** Tệp này là **bàn giao**: dài, có lịch
> sử, và phần lớn là số đo của các phiên trước. Mâu thuẫn thì `CLAUDE.md` thắng về **luật**,
> `HANDOFF.md` thắng về **số đo**. Backlog: [`PROGRESS.md`](PROGRESS.md).

## 🔵 PHIÊN SAU BẮT ĐẦU TỪ ĐÂY

### 🆕 CHỐT PHIÊN `2026-09-04` — CỔNG ĐO BỘ SÁNG LẬP · P-64 · 108 L1 · SỨ MỆNH BA TẦNG · CÔNG BỐ QUA SCRIPT

**TL;DR:** Preflight **50 đạt · 0 đỏ** (đo `03/09 20:2xZ`). `main` = `221fa0f`, **công khai** `official/main 4e0438e`
(21 commit, fast-forward, qua `publish-official.sh`), sao lưu `origin` đủ. Mạng g1 bình thường: 9 sáng lập uptime
99,99 %, 1 khách (`NodeID-DZJum…`) uptime ~14 % vì mất danh tính — kẹt tới `2026-09-17`.
🔴 **Phiên sau: nghiên cứu hướng phát triển công nghệ** theo hai tài liệu phân tích (mục "Việc tiếp").

```
git      : main 221fa0f · official/main 4e0438e (lịch sử ĐÃ LỌC, không tổ tiên chung) · origin/main 221fa0f
server   : không đổi trong phiên (chỉ đọc qua ssh: (model không công bố) 4 nhân/8 luồng · 64 GB · đĩa còn 343 GB)
```

#### Đã xong (D-180 → D-182, mỗi mục có nghiệm thu thật)
- **D-180** `watch-network` + `check-outsider-bootstrap` đo **bộ sáng lập** (`initialStakers` genesis, thư viện
  `local-net/lib/genesis-stakers.mjs`), khách được kể, vàng khi uptime < 80 %. +11 / 26→34 đối chứng. Preflight 47·3 → 50·0.
- **D-181 (P-64)** `RUN-A-VALIDATOR.md` mount `./staking` vào đường node không đọc + "Starting over" xoá volume ⇒ đổi
  NodeID. Sửa mount về `/root/.avalanchego/staking`, mục "Your identity is three files", "Behind NAT", 2 dòng bảng.
  **Đối chứng thật trên image g1** (Docker cục bộ, 0 peer): mount mới giữ NodeID qua `volume rm`; mount cũ đổi.
- **Bài toán 108 L1**: `docs/PLAN-108-L1-LOAD-TEST.md` — trần là giao thức (16 subnet/node) trước khi là máy; `108×V ≤ N×15`;
  đề xuất V=5 → 36 node, ~€750–850/tháng, băng tập; cái vỡ đầu tiên là console track-all.
- **Sứ mệnh "một chain cho mỗi người"**: `docs/PROPOSAL-FREE-L1-DISTRIBUTED-VALIDATORS.md` (ba mô hình, ACP-77 xương sống,
  **mô hình ba tầng**) + `docs/ANALYSIS-WORLD-EVIDENCE-FREE-L1.md` (đối chiếu Avalanche/L2/Saga/Cosmos/Polkadot/DVT/DePIN/
  ATProto/AP2/ZK, bốn kết luận đổi). Artifact cả ba.
- **D-182** script công bố sang `main` (Anh, bảng thay thế `publish-official.replace.txt` = đầu vào SHA), `check-remotes`
  nói "no common ancestor" thay vì "behind N". Công bố xong, nghiệm thu từ phía công khai: 0 `local-net/deploy`, 0 SSH, 0 IP khách.

#### ⚠️ Việc tiếp — ai làm
- **[nghiên cứu, phiên sau]** theo thứ tự đã đề xuất ở hai tài liệu:
  1. Thử **`ConvertSubnetToL1Tx` + PoA Validator Manager (ACP-99)** trên **băng tập** (`A1IDTap`): chain sống với validator
     **không cọc mạng mẹ**, node `--partial-sync-primary-network` — ra số "node nhẹ tốn bao nhiêu". Đây là số quyết định cả hướng.
  2. **DVT cho validator chain con**: `signer.key` BLS12-381 của avalanchego chia ngưỡng được không (Obol/SSV-style)?
     Điều kiện qua: 1 validator tập = 4 máy, tắt 1, uptime không đổi.
  3. **Tầng 2 nguyên mẫu**: kho ký Merkle theo mẫu ATProto cho một người + hợp đồng hiến pháp (allowlist/hạn mức/thu hồi)
     trên một chain tầng 1 + neo gộp; sửa lịch sử kho ⇒ neo lệch ⇒ phát hiện từ ngoài.
  4. **Ánh xạ chuẩn**: AP2 mandate (VC) · ERC-8004 · ERC-7715/7710 · x402 → nguyên thuỷ nào đã có trong subnet-evm/L1-CUSTOM.
  5. Console: **phân công validator ≤ 15/node** (dùng chung cho 108 L1 và ACP-77) · luật **ngủ đông có đường rút**.
- **[human]** `CLAUDE.md` §4 ghi luật đẩy mới (chỉ qua script; force = runbook lên Internet) · chốt **V** và **mục tiêu validator
  L1** (⇒ số chain cộng đồng công bố) · cho phép **pha 0** đo `c_tx` bằng ví admin L1 · P-55 (`web-home`) · 09/09 · xoá bind
  data Blockscout · khách `DZJum…` kẹt tới 17/09 (kênh duy nhất: issue tracker công khai).
- **[nợ, A1]** `check-key-leaks` **PASS** nhưng mất ~20 phút (quét 9 gốc kể cả `%TEMP%`) và liệt kê rác khoá mạng tập ở
  `9Chain-A1-audit/upstream` + scratchpad MetaChain cũ — dọn rác hoặc thu phạm vi, không thì cổng thành giấy dán tường.

#### 🔴 GOTCHAS phiên này
1. **Cổng đo "mọi validator" khi nghĩa là "node A1 chạy"**: khách đầu tiên vào là preflight đỏ hai lần. Dân số của phép đo
   phải là `initialStakers` genesis, đọc từ tệp, vắng tệp ⇒ THROW.
2. **Hướng dẫn có cổng canh SỐ nó trích, không cổng nào canh LỆNH nó bảo gõ.** Một dòng `-v` trỏ sai đường trông y hệt dòng
   đúng. Đối chứng cho lệnh trong tài liệu = chạy lệnh đó trên image thật, cả hai chiều.
3. **Đặt cờ `--staking-tls-*` mà tệp chưa có ⇒ node từ chối chạy** (`config.go:733`); muốn khoá ra host thì mount vào đúng
   đường mặc định `/root/.avalanchego/staking`.
4. **"8 lõi" của máy OVH là 8 LUỒNG / 4 nhân** ((model không công bố)) — D-178 ngoại suy sát hơn đã nghĩ.
5. **`filter-repo` cắt commit rỗng "empty tip"**, và commit chỉ chạm `local-net/deploy` biến mất ⇒ ngọn bản công bố phải
   là commit chạm mã NGOÀI thư mục lọc, không thì hook `pre-push` chặn vì `[skip ci]`.
6. **Bảng thay thế của script là đầu vào SHA**: sửa một dòng cũ = viết lại lịch sử công khai; thêm dòng chỉ an toàn khi
   literal không có trong blob cũ (đã làm với IP khách, fast-forward giữ được).
7. **Git Bash đổi `/9chain-a1/...` thành `C:/Program Files/Git/...`** khi truyền vào docker: `MSYS_NO_PATHCONV=1` +
   `cygpath -m` cho phía host; và khi đặt biến đó thì `/c/...` không còn được git hiểu — dùng `C:/...`.
8. **Trình duyệt trong app không mở artifact riêng tư** (chưa đăng nhập) và không render tệp ngoài thư mục dự án; kiểm máy
   tính JS bằng stub DOM trong node thay vì screenshot.
9. **`check-remotes` "behind 456" trên hai lịch sử không liên quan** là số vô nghĩa đọc như lời mời push — đã sửa thành
   câu nêu tên lịch sử viết lại.

#### Lệnh hữu ích
```bash
node scripts/gday-preflight.mjs                                  # 50 dat · 0 do (03/09 20:2xZ)
node scripts/watch-network.mjs                                    # founders 9/9 · guests + uptime
node scripts/check-outsider-bootstrap.mjs                         # founders 100% open; guests reported
bash local-net/deploy/publish-official.sh main                    # CONG BO — ngon phai la commit MA, khong [skip ci]
node scripts/check-remotes.mjs                                    # official: "no common ancestor" la binh thuong
bash "$SCRATCH/p64-check.sh"                                      # (mau) doi chung danh tinh node tren image g1
```


### 🆕 CHỐT PHIÊN `2026-09-03` CHIỀU→TỐI — BLOCKSCOUT NGHỈ, 6 L1, KÝ HIỆU TOKEN, ĐO TẢI

**TL;DR:** Blockscout **đã `down`** (David chốt) — node-1 từ `435 → 9,8` gọi/s. Sổ chain nay **6 L1**
(BBWay · 9Mall · 9Cashback đẻ chiều `03/09`), còn **9/15 chỗ**. Console **đã deploy** bản nhận ký hiệu
token (P-54, PID `2657315`), nhưng người dùng **vẫn thấy "50.00M LOVE9"** cho tới khi `web-home` làm
P-55. P-Chain có **10 validator** — cái thứ 10 là **người ngoài**, cọc sàn 81, vào `15:45Z`. **14 commit
chưa đẩy** (`e915823..d6db85f`), ngọn là commit rỗng cho CI. Mốc mới `L1-CUSTOM` P-54→P-62 ở đầu PROGRESS.

```
server : console PID 2657315 (16:5xZ) · drift 23/0/0 · A1_DE_CHAIN_MO=1 · allowlist 0x1e8c…3292C
         Blockscout: 0 container; bind data CÒN trên đĩa (db 3,1 G · logs 2,0 G) — David xoá sau (B-17)
git    : 14 commit chưa đẩy — kiểm §4 (check-history-secrets --all-objects · check-remotes) rồi đẩy
```

#### Đã xong (mỗi mục có nghiệm thu thật — D-176 → D-179)
- **D-176** node-1 ăn ×10 vì Blockscout đuổi DB **hai thế hệ chết** (block 0 ba hash, công khai khai
  107.850 block). Cờ tắt fetcher **làm explorer đứng** → hoàn nguyên trong 28 phút.
- **D-177** Blockscout nghỉ hẳn: B-17 đủ bốn bước · 9 node/faucet/console/9scan không đổi · A1 200.
- **D-178** đo tải bằng `scripts/measure-node-load.sh` (cgroup): mỗi L1 track thêm ≈ **0,05 core/node
  + 53 MiB**, dù chain im; CPU **không đổi theo tuổi**, RAM **lớn theo tuổi**. Trần 15 ≈ 6–7 core
  trên máy 8 lõi — **đưa vào ACP-77**.
- **D-179** `lib/l1-symbol.mjs`: ký hiệu 2–8 `A-Z0-9` hoa · cấm `LOVE9/AVAX/ETH/BTC/USDT/USDC` · duy
  nhất kể cả chain thu hồi · nêu code point ký tự lạ · 30 đối chứng · đo trên sản phẩm với chốt
  `chainId -1` (không tạo chain).

#### ⚠️ Việc tiếp — ai làm
- **[human] đẩy 14 commit** — `git push origin main`, rồi `official` CHỈ qua `publish-official.sh` (xem cảnh báo đầu tệp), kiểm §4 trước.
- **[web-home] P-52** 🔴 trang 404 công khai và `/blocks` `/tx/*` `/api/*` đang **502**: Caddy còn
  bắt-tất-cả vào `127.0.0.1:8100` trống. Gốc → trang 404 tĩnh · đường explorer → `308 a1.9scan.org` ·
  bỏ `handle /api/*` `/socket/*` · `check-routes.mjs` có ca "Blockscout trả 404".
- **[web-home] P-55** ô ký hiệu trên trang launch + `addChain` dùng `symbol ?? symbolFromName(name)`
  (`CreateChainScreen.tsx:401`, `wallet.ts:433`) + câu "50M là xăng chain riêng" ở trang Done.
- **[web-home]** `/` khai 9 validator, chain có **10** (`check-live-page` đỏ).
- **[human]** xoá bind data Blockscout: `explorer-full/blockscout/docker-compose/services/{blockscout-db-data,stats-db-data,logs}`
  — liệt kê → xoá → đối chứng. `explorer-full/` trong repo giữ làm bản ghi.
- **[human] ACP-77** với số D-178 trong tay: 108 L1 trên một máy là bất khả thi theo cả hai trục.
- **[human] 09/09** như mục dưới (bơm tự dừng, `check-clock-skew`, CANON).
- **[autopilot] P-56** số cấp ban đầu + nhiều địa chỉ nhận genesis (mốc `L1-CUSTOM`, sau P-55).

#### 🔴 GOTCHAS phiên này
1. **Một giới hạn "ổn định" có thể là cái PHANH.** `435/s` = `28.231 cổng / 60 s TIME-WAIT`. Bật
   `tcp_tw_reuse` "sửa" `eaddrnotavail` và vòng lặp xấu chạy ×5. Hỏi giới hạn đang kìm cái gì trước.
2. **Tắt một fetcher có thể tắt thứ đường chính phụ thuộc** (Blockscout v9.0.2 `INDEXER_DISABLE_ADDRESS_
   COIN_BALANCE_FETCHER` giết `CoinBalance.Realtime` mà import block gọi thẳng). Đo **đầu ra đường chính**
   (block mới nhất đã index), không chỉ đếm lỗi.
3. **nginx phân giải upstream MỘT LẦN lúc khởi động** — restart `proxy` khi `stats` đã chết 6 ngày ⇒
   không lên ⇒ 502 công khai 3 phút. Liệt kê upstream cần sống TRƯỚC khi restart.
4. **Explorer là bề mặt công bố, và DB của nó không tự xoá khi re-genesis** (D-150 lần ba). Không cổng
   nào so `total_blocks` explorer ↔ `eth_blockNumber` — nợ.
5. **Node chỉ giữ state ở bội số 4096** (`eth_getBalance` block `0x1000` có, `0x1001` không). Mọi thứ
   cần số dư lịch sử trên A1 sẽ lặp lỗi vô hạn — Blockscout, và bất cứ indexer nào sau nó.
6. **`generation-test.mjs` đỏ giả ở lần chạy lạnh** (console khởi động chậm hơn thời gian chờ); chạy lại
   là xanh. Đừng kết luận từ lần đầu.
7. **Console rollout 9 node theo mỗi lượt đẻ/thu hồi** — thấy `compose up --no-deps node-5` lạ thì tra
   `~/9chain-a1/console.log` trước khi nghĩ có kẻ lạ; và mọi mẫu đo tải phải **đọc tuổi node**.
8. **`docker stats` đã bị bác, nay lệnh cgroup là TỆP** — dùng `measure-node-load.sh`, đừng gõ lại.

#### Lệnh hữu ích
```bash
bash scripts/measure-node-load.sh --seconds 60      # 9 node, cgroup, in tuoi node + so L1
node local-net/console/symbol-test.mjs               # 30 doi chung ky hieu token
node scripts/check-deploy-imports.mjs && bash local-net/deploy/console-deploy.sh   # THU TU NAY
node scripts/check-live-page.mjs                     # dang do: / khai 9 validator, chain co 10
```

### 🆕 CHỐT PHIÊN `2026-09-03` — BA L1 SỐNG, CỔNG MỜI CHẠY, CÒN 12 CHỖ

**TL;DR:** `Adam Chain #9001000000` · `Eva Chain #9001000001` · `9S Union #9001000002` — ba L1
đầu tiên trên g1, tạo qua **giao diện công khai** bằng ví `0x1e8c…3292C`. Cửa đẻ chain **MỞ** với
**allowlist một ví** (chính ví đó). Bơm chạy, tự dừng `09/09 05:39:09Z`. Preflight `47 đạt · 1 đỏ`
(đỏ = `web-home`, không phải A1). **Còn 12/15 chỗ, vĩnh viễn.**

```
git      : 3 tệp ĐÃ deploy lên server nhưng commit CUỐI PHIÊN — CHƯA ĐẨY (chờ David)
server   : console PID 2527217 (12:20Z), sha256 khớp repo · A1_DE_CHAIN_MO=1 · A1_L1_ALLOWLIST=0x1e8c…3292C
```

#### Đã xong hôm nay (mỗi mục có nghiệm thu thật — xem D-160→D-175)
- B-12 số thật · bánh cóc §0 chốt (`5709`) · 2 cổng đường validator ngoài · tỉa 40→8 việc tay
- B-13(b) `--offset-ms 3000` đo bằng `block.timestamp` · lệch 9 node = 0 **đo**, liên máy **~µs** (NTP)
- nạp ví factory (D-169) · bơm chạy lại + `network`/`networkID` đo từ node (D-168)
- nội dung Adam/Eva = **đúng hai câu đã khắc**, đóng băng trong `docs/block-adam/CANON.txt` (D-173)
- cổng `check-validator-onboarding` · `check-outsider-bootstrap` · `check-deploy-imports` (D-175)
- allowlist (D-171) — **và nó hỏng lúc ship, đã vá**: chỗ gọi truyền 1 tham số, thư viện nay THROW

#### ⚠️ Việc tiếp — ai làm
- **[human] 09/09** — bơm tự dừng; trước cửa sổ chạy `node scripts/check-clock-skew.mjs` (chain
  đang đẻ block ⇒ nguồn [1]). Lệnh nghi lễ: `docs/CEREMONY-2026-09-09.md`. Adam/Eva payload:
  `--adam-data docs/engrave/dedication.txt --eva-data docs/engrave/dedication_eva.txt`.
- **[human] đẩy** commit cuối (`git push origin main`, rồi `official` CHỈ qua `publish-official.sh` (xem cảnh báo đầu tệp)) — kiểm §4 trước.
- **[autopilot] đo tải 3 L1 lúc node ~4h tuổi** (≈`17:20Z` 03/09): mẫu nền 2 L1 lúc `11:43:42Z` =
  CPU `0.952` core · RAM 9 node `5270 MiB`. Mẫu sớm (node 5 phút): CPU `1.224` · RAM `1412` —
  **KHÔNG so được** (node trẻ, mất heap). Dùng lệnh cgroup trong D-175/P-48 (60s, `cpu.stat` +
  `memory.current`), KHÔNG dùng `docker stats`.
- **[human] thêm ví mời**: sửa `A1_L1_ALLOWLIST` trong `console.env` (phẩy) + `console-restart.sh`.
- **[human]** ACP-77 quyết định kinh tế (trần 15 vs 108) · node Hetzner stake (đường đã dọn, D-166).
- **[nợ, cho web-home]** server nên phát **mã lỗi** bên cạnh câu chữ; `web/` đã có từ điển 30
  ngôn ngữ (`tenXau`) nhưng đang in chuỗi thô của server. Luật cứng #4 — A1 không đụng `web/`.

#### 🔴 GOTCHAS phiên này — đọc trước khi dựng cổng/deploy
1. **Thêm `import` vào console = phải thêm tệp vào `manifest-deploy.json`**, nếu không deploy chở
   thiếu và console CHẾT (đã xảy ra 2 phút, `11:28Z`). `check-deploy-imports` nay chặn — chạy nó
   TRƯỚC `console-deploy.sh`.
2. **Reverse control có thể mã hoá đúng cái bug nó phải ngăn** (`undefined` ≡ empty). Kiểm CHỖ NỐI,
   không chỉ kiểm hàm; `undefined` phải THROW.
3. **`docker stats --no-stream` không đáng tin** (in y hệt `563,2%` hai lần). Đo bằng cgroup
   `cpu.stat usage_usec` delta/60s.
4. **`ssh 'date'` để đo lệch đồng hồ liên máy là SAI ba bậc** (RTT khác nhau ⇒ thiên lệch không
   triệt tiêu). Hỏi `chronyc tracking` / `timedatectl show-timesync`.
5. **Ký tự vô hình trong tên chain**: U+00A0/202F/2009/200B trượt `/^[A-Za-z0-9 ]/` mà trông như
   dấu cách. Thông báo nay nêu đích danh `Character N is U+XXXX`.
6. **Test bám vào văn xuôi thông báo** (`generation-test.mjs`) — đổi chữ là đỏ vì lý do không liên
   quan. Grep phụ thuộc trước khi đổi chuỗi, và grep CẢ tệp test.
7. **`Edit` chuẩn hoá xuống dòng tệp trộn CRLF/LF** (`DECISIONS.md`): xem `git diff --stat` ngay;
   khôi phục bằng `git checkout HEAD -- <tệp>` rồi append nhị phân.
8. **Bấm `Ctrl+J` trong nano = justify (gộp dòng)** — `Ctrl+X` → `N` để thoát không lưu.

#### Lệnh hữu ích
```bash
node scripts/gday-preflight.mjs                    # 48 muc; 47 dat · 1 do (web-home)
node scripts/reopen-chain-creation.mjs --probe     # 4 buoc, cua mo/dong do THAT
node scripts/check-deploy-imports.mjs && bash local-net/deploy/console-deploy.sh   # THU TU NAY
node scripts/check-clock-skew.mjs                  # B-13(b); chon nguon [1] khi chain de block
```

### 🆕🆕🆕🆕🆕 `2026-09-02` tối — **B-13(b) ĐÓNG NỬA A1: `--offset-ms 3000`** (D-164)

David: *"làm B-13(b) đi."* Hạn `09/09`, còn **7 ngày**.

```
preflight  44 dat · 2 do  (46 muc)   ->   46 dat · 2 do  (48 muc)
```

#### Số chốt cho nghi lễ Block Adam

```
lech may ban <-> node : +201ms ± 649ms   (do 15:4xZ)
                        +29ms  ± 726ms   (do 15:5xZ, ~15 phut sau)
bien xau nhat         : node cham 697ms
=> --offset-ms 3000     san chinh sach, phu ~4 lan
```

`lệch > 0` = node **nhanh hơn** máy bắn ⇒ `block.timestamp` lớn hơn ⇒ **dễ vượt mốc hơn**: chiều
an toàn. Hai lượt cách nhau 15 phút cho hai giá trị khác nhau nhưng **cùng kết luận** — đáng tin
hơn một con số đẹp.

#### 🔴 Công cụ đang in ra một con số nguy hiểm, và exit 0

Chain **rảnh tuyệt đối**: cao **22** block, block cuối **7.062 giây tuổi**, 0 block mới trong 20
giây. `check-clock-skew` in ra **`--offset-ms 7197020`** — **hai tiếng** — mà **toàn bộ là TUỔI
BLOCK**. Ai tin dòng đó bắn Block Adam muộn hai tiếng.
🔴 **Tiêu đề của chính tệp đó đã cảnh báo đúng điều này** rồi vẫn đem đi tính bù. **Một lời cảnh
báo bằng văn xuôi không phải một cái chặn** — cùng bài học với bánh cóc §0 sáng nay.

⇒ Nguồn mới: **`info.peers[].lastReceived`** — mốc **do chính đồng hồ node đóng dấu**, nằm trong
**thân JSON** nên Cloudflare không sửa (khác header `Date`, vốn là đồng hồ Cloudflare), và
**nhúc nhích khi không có giao dịch nào** (đo: tiến 14s qua 12s trong lúc chain đẻ **0** block).
Thiên lệch chỉ về phía **an toàn**, và bị chặn bởi **giây** — còn tuổi block **không bị chặn bởi gì**.
Cổng nay **TỪ CHỐI** block cũ thay vì định dạng nó thành một con số tự tin.

#### ✅ Nửa "câu chữ" HẾT ĐÚNG — và đó là phép ĐO

B-13(b) lo *"nếu bản khắc còn câu chữ khẳng định block vượt mốc"*. Đọc **bốn tài liệu đã khắc
thật** (1.142 byte, đóng băng ngày G): `genesis_inscription` · `dedication` · `dedication_eva` ·
`love_paper_en` — **không tài liệu nào khai một mốc thời gian nào**. Câu lo đó viết `27/08` lúc
chữ còn mở; chữ đóng băng ngày G và **tình cờ không chứa lời khẳng định đó**. **Giả định hết đúng
mà không ai đánh dấu.**

#### 🔴 NHƯNG có một ràng buộc `09/09` KHÁC, và nó không phải chuyện đồng hồ

`docs/block-adam/CANON.txt` đã ghi: **C-Chain KHÔNG đẻ block rỗng.** Thông điệp `9S Union` neo ở
`block(Eva) + 9` ⇒ **trên chain im lặng, chín block đó có thể không bao giờ tới.** Hôm nay chain
đứng ở block **22**, im hơn hai tiếng — **không phải rủi ro lý thuyết, là trạng thái hiện tại.**
Hai đường, chọn **TRƯỚC** ngày:
**(a)** bật lại bơm nhịp — ⚠️ nó **từ chối khởi động** cho tới khi `HEARTBEAT_STOP_AFTER`
(`2026-09-01T00:00:00Z`, **đã ở quá khứ**) được dời · **(b)** **chín giao dịch chèn** có chủ ý.

#### 🟢 Cổng mới, và vì sao nó phải là CỔNG

`SAN_BU_MS = 3000` nằm trong `BLOCKERS`, trong runbook, và trong **lệnh một con người sẽ gõ ngày
`09/09`** — mà **không gì kiểm rằng nó còn đủ lớn**. Nay `check-clock-skew` **exit 1** khi số đo
vượt sàn. **Đỏ ở đây nghĩa là con số đã công bố phải đổi**, không phải mạng hỏng. Đối chứng trên
dữ liệu thật hai hướng: hạ sàn còn `100ms` ⇒ `EXIT 1` in đúng yêu cầu thật `1889ms`; sàn thật ⇒
`EXIT 0`.

🟢 **Bánh cóc §0 bắt chính tôi, hai lần** trong lượt sửa này (`5.719 → 5.723`, rồi còn `+1`).
Truy ra là hai dòng cũ tôi vừa chạm; đã dịch luôn ⇒ nợ về đúng `5.719`. **Chốt bánh cóc buổi sáng
thu lãi ngay trong ngày, và nó bắt đúng người viết ra nó.**

```bash
node scripts/check-clock-skew.mjs              # nguon [1] block · [2] gossip, tu chon
node scripts/check-clock-skew.mjs --self-test  # doi chung, gom ca ca loi that
```


### 🆕🆕🆕🆕 `2026-09-02` tối — **ĐƯỜNG NGƯỜI NGOÀI TỰ DỰNG VALIDATOR** (D-160 · D-161 · D-162)

David chốt hướng: *"focus vào việc mọi người có thể tạo Validator bên ngoài chủ động."*

```
preflight   40 dat · 2 do  (42 muc)   ->   44 dat · 2 do  (46 muc)
viec tay    40 HO                     ->    8 phai lam  (32 rut, giu nguyen byte)
```

**Hai đỏ không đổi và không phải việc A1:** ví `chain-factory` 0 đồng (David) · `check-live-page`
thuộc worktree `web-home` (luật cứng #4).

#### 🔴 Lời hứa tự phục vụ sai đúng MỘT lượt faucet (D-161)

`81 = 9 × 9`, faucet cấp `9 LOVE9` ⇒ *"nine requests"* — câu **đầu tiên** người ngoài đọc. Đo trên
bề mặt công khai: **chín lượt cho đúng 81, mà đặt cọc LÀ 81**, phí `C→X→P` + phí nộp stake **trừ vào
chính số dư đó**. Số thật là **mười**, trần faucet **chín/IP/giờ** ⇒ có một **lượt chờ tới một giờ**.
Phép số học sai là `>=` thay vì `>`.

🟢 **Không phải lỗi cấu hình** — faucet đã đặt đúng `9`/`9` (việc tay preflight cảnh báo mặc định
`10`/`5`; lời cảnh báo **đã được nghe**). Sai nằm ở **quan hệ giữa ba số đúng**, mà quan hệ **không
là trường của ai**: một trong binary Go, một trong env container, một trong markdown.

Tài liệu trước đó **tự mâu thuẫn**: hứa ở dòng 29, đính chính ở dòng **325** — cách 300 dòng thì
bằng không đính chính. Nay nói thật **ở màn hình đầu**.

#### 🔴 Cổng mới sai HAI LẦN trước khi đúng — đọc trước khi dựng cổng tiếp theo

| lần | hình dạng |
|---|---|
| **đỏ giả** | ĐỎ vì **chính câu tôi vừa viết để đính chính** trích lại lời hứa cũ. Vá bằng `stale-ok` **đã có sẵn**, phạm vi ĐOẠN; cổng **in ra** số dòng được miễn |
| 🔴 **XANH GIẢ** | bản cũ viết `so **nine requests** cover` — dấu `**` chen giữa nên mẫu **đi thẳng qua**. **Cổng dựng ra để bắt đúng câu đó, đọc đúng câu đó, và cho qua.** Bắt được **chỉ vì** chạy vào bản tài liệu đã nghỉ, không vào fixture ⇒ thêm cờ `--guide` |
| 🔴 **self-test xanh vì SAI LÝ DO** | ca khẳng định `verdict === "fail"` và đúng là `fail` — nhưng vì fixture **thiếu cảnh báo chờ**, không vì bắt lời hứa sai. **Luôn xanh về lời hứa** suốt thời gian đó |

⇒ **Luật: cổng có HAI nghĩa vụ thì ca đối chứng phải nói nó kiểm nghĩa vụ NÀO** — không thì nghĩa
vụ dễ vỡ nấp sau nghĩa vụ dễ thoả, và bộ đối chứng **đếm đủ ca** mà không kiểm gì (Q-5b lặp lại).

#### 🔴 Và tôi SUÝT khai một sự cố không có thật (D-162)

`info.peers` trả **8/8 peer mang `172.28.0.x`** ⇒ đọc mặt chữ là D-118b tái phát trên mạng công
khai. Tra thẳng `upstream/avalanchego/network/peer/`: **HAI trường** — `ip` là **socket node được
hỏi đang nối**, `PublicIP` là **lời khai đã KÝ**, và **chỉ cái sau được gossip**. Trên mạng Docker
hai trường **luôn khác nhau**.

```
do dung truong :  8/8 khai dia chi cong khai  ·  9/9 cong TCP mo tu may nay  ·  100,00% stake
```

**Mạng hoàn toàn khoẻ.** Khai theo lượt đọc đầu là đẩy David đi **dựng lại chín node đang chạy
đúng**. ⚠️ **Luật: hai trường tên gần giống nhau trong một API là bẫy đo sai đại lượng — tra ĐỊNH
NGHĨA trước khi tin cái TÊN.**

#### 🟢 Ba việc tay của preflight nay ĐÃ ĐƯỢC ĐO, đừng làm lại

| việc tay còn đang hô | phép đo nói gì |
|---|---|
| *"OPEN THE STAKING PORT ON EVERY NODE"* | ✅ `check-outsider-bootstrap` — 9/9 khai + quay số được, **100% stake** |
| *"Publish `genesis.json` + bootstrap"* | ✅ D-158, `check-genesis-published` 6/6 |
| cảnh báo faucet mặc định `10`/`5` | ✅ đã ship `9`/`9`; `check-validator-onboarding` canh |

🔴 **Danh sách 40 việc tay là danh sách của NGÀY G, và ngày G đã qua.** Mục nào đã xong mà vẫn hô
thì dạy người đọc bỏ qua cả danh sách (lý lẽ D-070). **Tỉa nó là việc David quyết** — A1 không tự
xoá một danh sách an toàn 40 mục.

#### 🟢 ĐÃ TỈA DANH SÁCH VIỆC TAY — `40 hô` → `8 phải làm`, **không mất byte nào** (D-163)

David: *"tỉa danh sách 40 việc tay đi."*

🔴 **Đây là vế thứ hai của luật cứng #2.** Preflight tự khai luật đúng — *"chưa tự động hoá thì in
ra như VIỆC TAY, không giả vờ xanh"* — nhưng luật đó chỉ chặn **một** hướng. Hướng ngược lại cũng
thật: **một danh sách cứ hô công việc ĐÃ XONG thì dạy người đọc LƯỚT, và mục bị lướt qua không bao
giờ là mục đã xong.**

| giai đoạn | số | |
|---|---|---|
| còn sống | **8** | in ☐ như cũ |
| `✔ RETIRED` | **12** | mỗi mục mang **PHÉP ĐO** đã rút nó |
| `📦 RE-GENESIS RUNBOOK` | **18** | đã chạy cho g1; **quy trình cho thế hệ SAU** |
| `SUPERSEDED` | **2** | đã gạch từ trước |

**Đối chứng: `40 = 8 + 12 + 18 + 2`**, và `node scripts/gday-preflight.mjs --all-manual` in **đủ
40** kèm lý do. Ba mục vô lý nhất mà mỗi lượt vẫn đòi: mở cổng staking (**đo được đã mở**) · phát
hành genesis (**đã tải về qua Internet**) · sửa payout faucet (**đã ship `9`/`9`**).

⚠️ **Rút chỉ AN TOÀN ở chỗ có thứ khác canh.** *"Mở cổng staking mọi node"* là **thuộc tính của
tiến trình đang chạy**, không phải việc xong một lần — rút nó **trước khi** `check-outsider-bootstrap`
tồn tại là liều lĩnh. **Dựng phép đo trước, rút lời nhắc sau.**
🔴 **Không xoá 18 mục runbook**: xoá là ném đi đường tái lập mạng để đổi lấy một màn hình sạch, mà
dự án đã trả giá **hai lần** cho một lượt xoá trông an toàn (B-17).

#### ⚠️ Bẫy công cụ mới, ghi trước khi quên

🔴 **Công cụ `Edit` CHUẨN HOÁ xuống dòng trên tệp có xuống dòng TRỘN.** `DECISIONS.md` là
`6.754 CRLF + 551 LF`; một lượt `Edit` sửa **một câu** biến 551 dòng LF thành CRLF ⇒
`git diff --stat` nhảy lên **1.170 dòng đổi**. `.gitattributes` khai `* -text` nên git **giữ
nguyên byte, không chuẩn hoá** ⇒ không gì cứu ngoài khôi phục. Đây là gotcha 3 của phiên trước
(Python text-mode) **lặp lại qua một công cụ khác**.
⇒ **Với tệp trộn: `git checkout HEAD -- <tệp>` rồi ghi lại bằng đường nhị phân.** Và **luôn xem
`git diff --stat` NGAY sau mỗi lượt sửa tệp bằng công cụ, không chỉ bằng script.**

#### Còn treo, và ai gỡ

- **[human] P-17** — muốn bỏ hẳn lượt chờ một giờ: `FAUCET_MAX_PER_IP_HOUR` **9 → 10** trên server.
  ⚠️ `docker rm -f` rồi `docker run` — `docker restart` **KHÔNG** nạp lại env (bẫy 2). Cách khác
  (`FAUCET_AMOUNT` → 10) **phá đẳng thức `81 = 9 × 9`** mà cả trang đang dựa vào.
- **[human] P-13** — lịch nhắc B-12 + tên người chịu trách nhiệm. Số đã có (dưới đây).
- 🟡 **Nợ khai ra:** `stale-ok` nay có **BA bản cài đặt**; hai bản kia nằm trong module gọi
  `process.exit(main())` ở cấp cao nhất nên **import vào là chạy cổng khác rồi thoát**. Gom vào thư
  viện chung phải sửa hai cổng đang chạy tốt — đáng làm, **chưa làm**. Hình dạng §6.
- ⚠️ Nhánh **FAIL** của `check-outsider-bootstrap` mới chỉ có fixture: dựng ca đỏ thật phải sửa cấu
  hình mạng đang chạy, việc có người bấm (§4).

#### 🟡 B-12 có SỐ THẬT, hạ 🔴 → 🟡 (D-160)

Đo `02/09` trên chain sống, `9/9` validator `connected`, so le **đúng 7 ngày**, cửa sổ **56,00**:

```
node dau rung  2027-07-07T09:19:33Z   (con 307 ngay)
node cuoi rung 2027-09-01T09:19:33Z   (con 363 ngay)  <- MANG DUNG
watch-network  vang ~2027-03-09 (120)  ·  do ~2027-05-23 (45)
```

Bảng đủ 9 dòng ở `BLOCKERS.md` B-12. 🔴 Hỏi câu §2 về **chính cổng đang canh nó**: nó chấm bằng
`min(endTime)`, mà cổng đo *"sớm nhất"* có lối **tự xanh lại** khi cái sớm nhất rơi khỏi danh sách.
Ở đây không xảy ra — nhưng vì **số học** (so le 7 < ngưỡng đỏ 45), không vì may. **Đổi `N` hoặc đổi
so le là lối đó mở ra.**

Kèm: chốt bánh cóc §0 (`5.856 → 5.719`) — 137 dòng đã trả nằm ngoài mốc thì nợ **phình lại vẫn
xanh**. Đã thấy đỏ đúng lý do cả hai chiều.

```bash
node scripts/check-validator-onboarding.mjs            # faucet ↔ đặt cọc ↔ tài liệu
node scripts/check-validator-onboarding.mjs --self-test # 36 đối chứng
node scripts/check-outsider-bootstrap.mjs              # 🔴 CHỈ có nghĩa khi chạy NGOÀI server
node scripts/check-outsider-bootstrap.mjs --self-test   # 26 đối chứng
```

### 🆕🆕🆕 `2026-09-02` chiều — **CHẶN SỐ 1 ĐÃ SẴN SÀNG, CHỜ ĐÚNG MỘT LƯỢT ĐẨY** (D-158)

David hỏi *"giờ cần tôi làm gì"* rồi *"bạn làm được hết mà"*, rồi *"đẩy đi"*. Làm xong và đã
xuất bản.

```
preflight  37 đạt · 3 đỏ  (40 mục)   ->   40 đạt · 2 đỏ  (42 mục)
official   behind 31  ->  behind 0        origin  behind 7  ->  behind 0
```

#### 🔴 Chặn số 1 KHÔNG phải "chưa ai tải lên" — tệp không được git theo dõi

`local-net/net-g1/genesis.json` bị `.gitignore` dòng 3 loại (`local-net/net-*`). Luật đó **đúng**
— đấy là chỗ netgen ghi `keys.txt`/`staker.key`/`signer.key` — nhưng nó quét luôn **đúng một tệp
trong đó vốn để công khai**. ⇒ Byte mà **mọi người ngoài** cần để tồn tại trên mạng này nằm ở
**hai chỗ đang vận hành** (máy dev + máy chủ) và ở **không repo, không bản sao lưu, không release
nào**. Mất một trong hai máy là mất khả năng đón người mới, **và không gì nói ra điều đó**.

🔴 **Ba cổng đều mù, mỗi cổng ĐÚNG với đại lượng của mình:** `check-deploy-drift` so repo↔server,
tệp không theo dõi thì **không có vế repo** · `check-doc-drift` đọc văn xuôi tìm số của thế hệ
chết, ở đây **số đúng**, cái sai là **VẮNG một URL** · `check-live-page` đọc trang đang tồn tại.
**Không cổng nào đo một sự vắng mặt.** ⇒ D-150 → D-154 → **D-158: vật chứng cũng là bề mặt công bố.**

| đã làm | nghiệm thu |
|---|---|
| `docs/genesis/genesis-g1.json` — chép sang đường theo dõi, **không** gỡ ignore thư mục | **bốn mỏ neo độc lập** cùng `4de8caa5…0f6ee6`: bản theo dõi · bản làm việc · hằng số in trong `RUN-A-VALIDATOR.md` · **genesis 9 node đang boot bằng**, đọc thẳng từ máy chủ |
| `RUN-A-VALIDATOR.md` khai **nguồn tải** — trước nay chỉ in hash, **chưa bao giờ nói tải ở đâu** | tệp và URL **cùng một commit** ⇒ không có cửa sổ tài liệu hứa thứ chưa có |
| cổng `check-genesis-published.mjs` | **27 đối chứng ngược** · chạy thật **đỏ đúng MỘT bước** · **đối chứng DƯƠNG trên byte thật** |
| `docs/archive/heartbeat-g0-final-2026-09-01.*` | trùng byte `a16a354d…`, hai đầu |

#### 🔴 Bản ghi suýt bị xoá để làm vừa lòng một cổng

Mồ côi `heartbeat.json.g0-20260901` được xếp *"hình dạng B-17"* = chờ xoá. B-17 nói câu *"đã có
bản lưu rồi nên xoá được"* là một **PHÉP ĐO**. Đo `02/09`: **repo không có bản nào**. Đó là bản ghi
**duy nhất** của lượt bơm g0 — **59 giờ · 1.910.316 tx vào khối · 9,01 TPS · tự dừng đúng hạn** —
và *"nhịp sống 9 tx/s"* **đã công bố ra ngoài**. ⇒ Chép về `docs/archive/` (FROZEN) **trước**;
giờ bản trên server mới được xoá.

#### ⚠️ Ba bẫy của phiên này

1. 🔴 **Regex không neo đọc ĐẦU của một giá trị dài hơn.** `grep -oE '0x[0-9a-fA-F]{64}'` trên
   `genesis.json` in ra **mười "khoá riêng"** — thật ra là **64 ký tự đầu của khoá BLS 96 ký tự**.
   Neo `(?![0-9a-fA-F])` rồi **gộp theo độ dài**: `9×48B` publicKey · `9×96B` PoP · `7×20B` địa chỉ
   · `extraData` 32B · `mixHash`/`parentHash`=0 ⇒ **0 bí mật**. Suýt tự chặn bằng **đỏ giả**, lần
   này đỏ giả đến từ **công cụ đo**, không từ cổng.
2. 🔴 **`local-net/net-*/` viết trong chú thích khối JS thì `*/` ĐÓNG COMMENT** — `SyntaxError` trỏ
   vào `keys.txt` ở giữa một câu văn.
3. 🔴 **Chèn một khối vào tệp CRLF bằng Python text-mode = đổi xuống dòng CẢ TỆP.** `PROGRESS.md`
   ra **4.178 dòng đổi** cho một lượt chèn 46 dòng. `.gitattributes` khai `* -text` nên git **giữ
   nguyên byte, không chuẩn hoá** ⇒ không gì cứu. Mở `'rb'`/`'wb'` và tự nối `\r\n`. **Xem
   `git diff --stat` NGAY sau mỗi lượt sửa tệp bằng script.**

#### 🟢 ĐÃ ĐẨY — **`genesis.json` NAY TẢI ĐƯỢC TỪ NGOÀI, chặn số 1 HẾT CHẶN**

David duyệt, đẩy `02/09`: `7b56add..30894f9` lên **`official`** (`9holdings/9chain`, CÔNG KHAI) và
`da4acac..30894f9` lên **`origin`** — tuyến sao lưu riêng tư **thiếu 7 commit**, đúng cái lỗ D-151
sinh ra để canh. Kiểm **TRƯỚC** theo §4: lịch sử **0 vật liệu khoá** (quét lại lần hai để phủ cả
hai commit cuối) · `official` **PUBLIC · WRITE · chưa archive** · liệt kê **32 tệp sẽ thành công
khai**, không tệp khoá / `.env` / `net-*`. Nay `official` **behind 0**.

🔴 **Nghiệm thu bằng TAY, không tin cổng của chính mình** — cổng mới do tôi viết thì nó xanh không
chứng minh được gì về chính nó:

```
curl URL trong tai lieu  ->  sha256 4de8caa5…0f6ee6   = KHOP hang so cong bo
networkID trong tep 999999998  =  info.getNetworkID cua mang song
check-genesis-published  6/6  ✅ PASS
```

#### 🟢 MỒ CÔI ĐÃ XOÁ — B-17 làm trọn cả ba bước, lần này không bỏ bước nào

David bấm `02/09`. **LIỆT KÊ** trước: hai tệp cùng thư mục, hash khác nhau — mồ côi `a16a354d…`
(1252 B, `ubuntu`) và tệp **đang sống** `heartbeat.json` `805ed518…` (847 B, `root`). Lệnh dùng
**đường dẫn tường minh, không glob**; một dấu `*` sai chỗ là nuốt luôn cái đang sống.
🔴 *"Đã có bản lưu"* được **ĐO**: kéo tệp về từ **ba nơi độc lập ngoài server** — repo tại chỗ ·
remote **công khai** (tải thật qua Internet) · remote **sao lưu riêng tư** (đọc blob của ref) —
cả ba trùng byte. **`rm`, không `shred`**: bản ghi đã công bố, không phải vật liệu khoá.
**ĐỐI CHỨNG:** mồ côi hết · tệp sống nguyên vẹn · `check-deploy-drift` **20 khớp · 0 lệch ·
0 thiếu · 0 MỒ CÔI**, exit 0.

#### 🔴 HAI đỏ còn lại — `40 đạt · 2 đỏ`

| đỏ | việc |
|---|---|
| `watch-network` | ví `chain-factory` **0 LOVE9** — HAI chặng; David chọn **quỹ nào** + **bao nhiêu**. Đây là thứ duy nhất còn chặn việc mở lại cổng đẻ chain L1 |
| `check-live-page` | `/` `/faucet/` `/create-chain/` in networkID chết — worktree `web-home`, luật cứng #4, **không phải việc A1** |

```bash
node scripts/check-genesis-published.mjs              # 6 phép đo, đỏ ở đúng bước còn lại
node scripts/check-genesis-published.mjs --self-test  # 27 đối chứng ngược
# xoá mồ côi — CHỈ chạy sau khi P-4 đã cứu bản ghi và ĐO được bản lưu ở nơi khác.
# 🔴 `rm`, KHÔNG phải `shred`: đây là bản ghi ĐÃ CÔNG BỐ, không phải vật liệu khoá. Dùng `shred`
#    cho một tệp công khai là khai sai mức nhạy cảm của nó — và làm loãng ý nghĩa của `shred`
#    ở những chỗ nó thật sự cần (D-117).
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'rm -v ~/9chain-a1/src/9chain-a1-config/heartbeat.json.g0-20260901'
# ĐỐI CHỨNG bắt buộc ngay sau (B-17 sai 2 lần vì bỏ bước này):
node scripts/check-deploy-drift.mjs
```

### 🆕🆕 CHỐT PHIÊN `2026-09-01` tối → `2026-09-02` — **22 commit, đã đẩy `origin`**

**TL;DR:** Hai trong bốn việc dọn **đã làm xong trên sản phẩm** (console + sổ chain). Team David
soát từ máy ngoài và gửi 11 phát hiện — **6 đúng, 1 sai ở kết luận, 4 chỗ trống đã dựng cổng**.
Còn **một thứ duy nhất chặn cả team: `genesis.json` chưa phát hành (404)** — chỉ David làm được.

```
preflight  37 đạt · 3 đỏ · 0 không chạy được       (34 → 40 mục)
origin     behind 0        official  behind 23  ⇦ David chốt "để sau"
```

#### ✅ Đã xong, có nghiệm thu thật

| việc | bằng chứng |
|---|---|
| **D-155** vá `reopen-chain-creation` — 3 lỗi (thiếu bước sổ chain · lời khuyên ví bất khả thi · luật thứ tự quá rộng) | 21 → **33** đối chứng · 6 bản hỏng có chủ ý |
| **Việc 1 — deploy console 5 tệp** | 🟢 **D-088 ĐÓNG**: `console-deploy.sh` chạy trọn vẹn **lần đầu tiên**. `21/21 + 38/38` trên server · PID `1148847→1724747→1734495` · drift **0 lệch · 0 thiếu** |
| **Việc 2 — sổ chain công khai** | `check-chain-ledger` ✅ PASS trên bề mặt công khai |
| **Ẩn 2 chain g0 khỏi `/chains/`** (David yêu cầu) | trang chỉ còn *"Chưa có L1 nào được tạo"*, ảnh chụp đã gửi |
| **Xoá dữ liệu trước giờ G** (David chốt phương án **(a)**) | 5 sổ archive + 2 genesis tạm; **giữ** `docs/o2-g0-final/` (gói vật chứng có merkle ROOT) và `chainid-taken.json` (sổ toàn cầu) |
| **S-1 README** khai 26 patch / tree sai | sửa 3 dòng + dựng cổng `check-patch-count` (G-1) |
| **S-4 tổng cung lệch 824.364,88** | **trả lời xong** — phần thưởng staking đúc trước. `TOKENOMICS.md §5` + cổng `check-supply` (G-2) |
| **G-3** cổng đọc trang đang chạy qua HTTP | `check-live-page`, 20 đối chứng |
| **B-2 · B-3** hai chỗ người ngoài không qua được | sửa `RUN-A-VALIDATOR.md` |
| **`c-to-x`** — chặng faucet(C) → X | `local-net/tools/c-to-x/`, **ngoài cây fork** |

#### 🔴 Ba đỏ còn lại, và ai gỡ

| đỏ | ai |
|---|---|
| ví `chain-factory` **0 LOVE9** — nạp **HAI chặng** (runbook việc 3) | **David** |
| `check-deploy-drift` — nay **CHỈ còn 1 mồ côi** `heartbeat.json.g0-20260901` (hình dạng B-17) | **David** |
| `check-live-page` — `/` `/faucet/` `/create-chain/` in `networkID 999999999`; `/` khai **10 validator** (đo được 9) | **worktree `web-home`** — luật cứng #4, A1 không đụng |

#### 🔴 VIỆC KẾ TIẾP, theo thứ tự

1. 🔴 **Phát hành `genesis.json`** — `a1.9chain.org/genesis.json` **404**. Tệp có sẵn ở
   `local-net/net-g1/genesis.json`, `sha256 = 4de8caa5…` **đã khớp** số công bố. **Chặn toàn bộ
   team**: không có tệp thì `--genesis-file=` không điền được. GitHub Release asset hoặc URL cố định.
2. Bốn việc dọn — `docs/RUNBOOK-REOPEN-CHAIN-CREATION.md`, đo lại bằng
   `node scripts/reopen-chain-creation.mjs --probe`
3. `web-home` sửa footer + câu "10 validators"
4. G-4: gỡ DNS hoặc 301 hai tên miền trả **525** (`testnet-a1`, `rpc-testnet-a1`)
5. Quyết định đẩy `official` (23 commit)

#### ⚠️ GOTCHAS phiên này — đọc trước khi dựng cổng mới

1. 🔴 **Cổng MỚI phải bị nghi ngờ đúng như cổng cũ.** Ba lần đỏ đầu tiên của ba cổng mới **đều
   SAI**, và cả ba sẽ khiến người đọc **phá thứ đang đúng**: `check-patch-count` chấm
   `RUN-A-VALIDATOR.md` hỏng (khối lệnh nằm dưới câu *"26 of the 27"* nên nó **đúng** — ngữ cảnh
   trải cả KHỐI, không phải từng DÒNG) · `check-live-page` chấm `/chains/` khai "5 validators"
   (số nằm trong **chú thích mã trong bundle JS**) · và báo một URL **hai lần** (`testnet-a1…` là
   **chuỗi con** của `rpc-testnet-a1…`). ⇒ **Xanh sai khiến người ta ngồi yên; đỏ sai khiến người
   ta hành động.** Vế đắt hơn của D-106b.
2. 🔴 **Đường lui đặt TRONG repo trở thành một phần của repo** (D-156). Chép 4 tệp server về
   `./rollback-…/` làm đỏ `check-single-source` (bản khai thứ hai của `A1_GEN`) và
   `check-english-code` (nợ phình). Mặt ngược của D-117. ⇒ **Đường lui để ở scratchpad của phiên.**
3. 🔴 **Gotcha #7 vẫn cắn:** heredoc bash + Python nuốt `\\r?\\n` thành ký tự xuống dòng thật, vỡ
   regex, hỏng cả tệp. **Sửa mã có `\n` thì dùng công cụ sửa tệp, đừng dùng `python - <<EOF`.**
4. 🔴 **Máy dev Windows KHÔNG biên dịch được công cụ Go** (`CGO_ENABLED=0`: blst · libevm · zstd)
   — `stake-validator` **cũng hỏng y hệt**, đã chạy làm đối chứng. Build trong container:
   `MSYS_NO_PATHCONV=1 docker run --rm -v "C:/PROJECTS/9Chain-A1:/src" -w /src/local-net/tools/<tool> -e CGO_ENABLED=1 golang:1.25.10-bookworm go build ./...`
   (`MSYS_NO_PATHCONV=1` bắt buộc, không thì Git Bash đổi `/src` thành `C:/Program Files/Git/src`).
5. 🔴 **Hook pre-push chặn khi ngọn cụm là commit tài liệu**: nó mang dấu bỏ-CI, **GitHub chỉ xét
   HEAD** ⇒ cả cụm có mã sẽ qua mà **không cổng nào chạy**. Sửa: `git commit --allow-empty` làm ngọn.
6. ⚠️ **`xp-wallet` nằm TRONG bộ patch (0003·0019·0021)** — thêm route vào đó là sinh lại cả 27
   patch + đổi `TREE_FORK` + ship lại image hai máy. Công cụ mới ⇒ `local-net/tools/`.
7. ⚠️ `c-to-x` **đường tiền CHƯA AI CHẠY**. Build + vet + cửa từ chối đã kiểm thật; `--issue` thì chưa.

#### Lệnh hữu ích

```bash
node scripts/gday-preflight.mjs                    # 40 mục (~4 phút)
node scripts/reopen-chain-creation.mjs --probe     # bốn việc dọn còn đỏ ở đâu
node scripts/check-live-page.mjs                   # trang công khai vs mạng thật
node scripts/check-supply.mjs                      # bảng phân bổ vs tổng cung
node scripts/check-patch-count.mjs                 # số patch trong tài liệu
```


### 🟢🟢 `2026-09-01` `19:2xZ`–`19:5xZ` — **VIỆC 1 VÀ 2 ĐÃ LÀM XONG TRÊN SẢN PHẨM** (D-156)

David bảo *"làm luôn đi, từng việc một"*. Làm được **hai**, dừng đúng chỗ phải dừng.

```
preflight  31 đạt · 3 đỏ   ->   32 đạt · 2 đỏ
```

**✅ Việc 1 — console 5 tệp.** `console-deploy.sh` **chạy trọn vẹn LẦN ĐẦU TIÊN ⇒ D-088 ĐÓNG**:
tự kiểm trước khi chép · 16 tệp theo manifest · **21/21 + 38/38 ĐẠT trên chính server** · md5 từng
tệp · hỏi console *"có lượt đẻ/thu hồi đang chạy không"* (200, không có) · restart **kiểm PID ĐỔI**
`1148847 → 1724747`. `check-deploy-drift`: **0 lệch · 0 thiếu**.

**✅ Việc 2 — sổ chain.** `advertised: 0 live · 2 retired`, nghiệm thu **trên bề mặt công khai qua
Cloudflare**, không nghiệm thu tệp trên server. `check-chain-ledger` **✅ PASS**, mã 0.

🔴 **Suýt ghi đè một sổ chặn 49 chainId / 54 tên.** Server có `chainIdCount 49 · nameCount 54`,
repo có **0/0**. Dừng lại đọc trước khi chép: bản thả là **có chủ ý, có chữ ký** —
`chainid-released.json`, `decided_by: David`, đóng dấu **đúng giờ G** `10:09:09Z`, và lý do an toàn
là **kiến trúc**: g1 chỉ cấp trong `[9001000000–9001999999]` nên **không đời nào** phát lại
`9100–9145` · `9201` · `9000000010/11`. Tôi **tự nghiệm lại vế đó trên khối đo được**, không tin
lời khai. ⚠️ Còn một chỗ **vênh giữa hai tài liệu**: bản thả nói *"None was ever handed to an
outside user"*, mà HANDOFF/preflight lại kể `Eric1`/`eric1` do **"a real user"** tạo `31/08` —
**David là người biết Eric là ai.**

🔴 **D-156 — đường lui tôi dựng làm ĐỎ hai cổng repo.** Kéo 4 tệp server về `./rollback-…/` **trong
cây repo** ⇒ `chainid.mjs` thành **bản khai thứ hai** của `A1_GEN`/`NETWORK_ID` (D-113) và
`server.mjs` làm **nợ tiếng Việt phình** (§0). *Mặt ngược của D-117*: ở kia bản chép nằm **ngoài**
tầm cổng và sống 20 giờ; ở đây nằm **trong** tầm và chết trong vài phút. ⇒ **Đường lui phải ở
NGOÀI biên cổng quét, TRONG tầm tay người vận hành** — scratchpad của phiên, không phải repo.
🔴 Và bẫy #6 **theo chiều ngược**: tổng đi từ `31·3` xuống `30·4` trong lúc tôi vừa **đóng** một đỏ
và vừa **đẻ** hai đỏ — đọc tổng thì mất cả hai chiều.

**Hai đỏ còn lại — cả hai chờ David:**

| đỏ | việc |
|---|---|
| `watch-network` | ví `chain-factory` **0 LOVE9** — việc 3, **HAI chặng**, cần David chọn **quỹ nào** và **bao nhiêu** |
| `check-deploy-drift` | **CHỈ còn 1 mồ côi** `9chain-a1-config/heartbeat.json.g0-20260901` (hình dạng B-17) — xoá trên server là việc David; `a1-xoa-tren-server`: *"đã có bản lưu"* là PHÉP ĐO |


### 🆕🆕🆕 `2026-09-01` `18:3xZ`–`19:0xZ` — **CỔNG "SẴN SÀNG" BIẾT BA TRONG BỐN THỨ NÓ CANH** (D-155)

David bảo đo lại `--probe`. Ba đỏ đúng như sổ. Nhưng **đọc mã cổng** thì ra ba lỗi trong chính nó:

| | lỗi | cái giá |
|---|---|---|
| **A** | Sổ chain công khai **không phải một bước** — cổng viết cho ba việc D-152, D-154 đẻ việc thứ tư một giờ sau, không gì nối lại | làm xong ba việc nó biết ⇒ nó in **`✓ All three … ready`** trong khi `/chains/` vẫn quảng cáo 2 chain chết |
| **B** | Lời khuyên ví: *"move X→P"* — **việc không làm được** (ví 0 trên **cả X lẫn P**) | D-153 lần hai; và câu sai **đã đóng đinh vào ca đối chứng** `:281`, tự bảo vệ chính nó |
| **C** | Luật `outOfOrder` **rộng hơn câu nó in** (mọi đảo ngược, thay vì riêng **cửa mở**) | vá A làm nó **nổ**: việc 2 là hai lệnh `scp`, làm trước là đúng — cổng đáp bằng cảnh báo nặng nhất |

🔴 **Một cổng sẵn sàng không biết một trong những thứ nó đang canh thì không phải dè dặt — nó SAI
MỘT CÁCH TỰ TIN.** Bài tổng quát: **một quyết định đẻ ra việc mới phải đi hỏi mọi cổng đang khai
là nó canh cái danh sách đó**; không ai nối thì mỗi phát hiện mới lại âm thầm làm sai một cổng cũ.

**Kiến trúc:** tách `local-net/lib/chain-ledger.mjs` (không tác dụng phụ) — theo án lệ
`factory-wallets.mjs`: `import` một SCRIPT là chạy nó rồi `process.exit`. Bản sao ở đây đắt đặc
biệt vì **nội dung D-154 chính là "đo CẢ HAI CHIỀU"**, nên bản sao thứ hai là thứ có thể trôi lệch
im lặng một thế hệ sau — đúng lỗi D-154 vừa đóng, đẻ lại **bởi hành động tái dùng nó**.

```
check-chain-ledger --self-test   24/24 (đúng 24 ca cũ)  ·  chạy thật TRÙNG BYTE lượt trước khi dời
reopen --self-test               21 → 33 ca             ·  reopen --probe  BỐN bước, chặn ở bước 1
preflight 18:5xZ                 31 đạt · 3 đỏ · 0 không chạy được   ← diff với 18:30Z: CHỈ khác
                                 tên thư mục worktree tạm theo PID. Nội dung trùng khít.
```

**SÁU bản hỏng có chủ ý**, mỗi bản đỏ đúng ở ca mang tên nó (thư viện 2/1/3 đỏ · reopen 5/3/2 đỏ).
🔴 **Bản hỏng đầu của `reopen` KHÔNG đỏ — nó giết cả bộ đo**: `blocked` thành `undefined`, mảng ca
dựng eager nên một `TypeError` cuốn theo 32 ca còn lại. Sửa bằng `blocked?.n`. *(Bài này đến từ
kho tri thức, mục `5roi-v2`: sau refactor, ca đối chứng **vẫn xanh** chưa đủ — phải chứng minh nó
**vẫn CẮN**.)*

⚠️ **Bốn việc dọn KHÔNG đổi và vẫn là việc David bấm.** Cổng nay chỉ **đo đủ bốn**.
✅ **Đã đẩy lên `origin`** (sao lưu RIÊNG TƯ) lúc `19:1xZ`, David duyệt — `check-remotes` trước khi
đẩy: `PRIVATE · ADMIN`, chưa archive; `check-history-secrets --all-objects`: **2.489 object, 0 vật
liệu khoá**; sau khi đẩy: **`behind 0`**. 🔴 **`official` (CÔNG KHAI) CỐ Ý ĐỂ SAU — còn 10 commit.**

⚠️ **Hook pre-push bắt được một thứ thật, đáng nhớ:** cụm này có **thay đổi mã**, nhưng commit trên
cùng chỉ chạm tài liệu nên hook commit tự gắn dấu bỏ-CI — **GitHub chỉ xét HEAD** ⇒ cả cụm sẽ qua
mà **không cổng nào chạy, và không gì nói ra điều đó**. Đường sửa đã thành nếp trong repo: một
commit **rỗng** đặt lên làm ngọn cho CI nhìn (`0a34218`, `de8d88d`, nay `382b608`).


### Sáu bẫy của phiên `2026-09-01` chiều muộn — đọc trước khi đụng vào bất cứ thứ gì

1. 🔴 **BA remote, một trong ba là cả Internet.** `official` = **CÔNG KHAI** · `origin` = bản sao
   lưu riêng tư **MỚI** (`daviddokrao/9chain-a1-backup`) · `archived-31aug` = chỉ đọc, đẩy vào là
   403. **Đọc TÊN trước khi đẩy.** Cổng: `node scripts/check-remotes.mjs`.
2. 🔴 **Đừng viết chuỗi `[skip` + `ci]` nguyên văn trong THÂN commit message.** Hook pre-push grep
   cả thân, **và GitHub cũng vậy** — một câu *giải thích* dấu đó hoạt động y hệt dấu đó. Đã bị từ
   chối hai lượt trước khi nhận ra. Muốn nói tới nó thì viết `skip-ci`.
3. 🔴 **Tệp `console-token.txt` là một GHI CHÚ có chứa bí mật, không phải một bí mật** — 5 dòng,
   token là dòng 32 ký tự không khoảng trắng. Đọc cả tệp rồi `trim()` ra "token" 280 ký tự, và
   Node báo *"Invalid character in header content"* — thông báo trỏ đi rất xa nguyên nhân.
4. 🔴 **`import` một SCRIPT để mượn hằng số sẽ CHẠY cả kịch bản đó** rồi `process.exit`, giết
   tiến trình đang mượn. Đã dính với `watch-network.mjs`. Hằng số dùng chung phải nằm trong
   module không tác dụng phụ (`local-net/lib/factory-wallets.mjs`).
5. 🔴 **`fetch` + `process.exit()` trên Windows = `UV_HANDLE_CLOSING`, thoát mã 127.** Một cổng
   sập trên đường ra bị đọc thành thất bại. Dùng `http/https` thô với `connection: close`.
6. 🔴 **`X đạt · Y đỏ` TRÙNG KHÍT không có nghĩa là không có gì đổi.** Tổng của preflight giữ
   nguyên `29 · 2 · 1` qua nhiều phiên trong khi **bên trong** `check-net-dirs` đổi từ *2 TRAP +
   1 DECOY* sang *0 TRAP* (tiền chết cùng g0). ⇒ **Đọc nội dung từng đỏ, đừng so tổng.** Và khi
   nói *"ổn định"* thì phải chạy **hai lượt rồi so NỘI DUNG**, không so con số. (D-153)

```bash
node scripts/gday-preflight.mjs      # 34 cổng + 40 VIỆC TAY, một lệnh (~4 phút)
# ⚠️ Nó VẪN in 38 việc tay, nhưng 7 cái ĐÃ XONG — preflight không biết. Đừng làm lại:
#   #10 #11 (bump A1Gen) · #14 #15 #17 (build + ship + --build-arg, OVH)
#   + CHỞ IMAGE SANG HETZNER  (xong 2026-09-01, nghiệm thu 3 mỏ neo trên chính máy đó)
#   + heartbeat "của ai"      (David xác nhận: bộ bơm của anh; đã khai knownExtra)
# Thực còn: 31. Xem D-137/D-142 + mục phiên 2026-09-01 ngay dưới.
```

### 🔵 CHỐT PHIÊN `2026-09-01` `18:25Z` — bốn commit **CHƯA ĐẨY**

```
preflight 18:22Z   31 đạt · 3 đỏ · 0 không chạy được · 0 bỏ qua · 40 việc tay   (34 cổng)
```

Ba lượt preflight trong phiên (`14:49Z` · `15:03Z` · `18:22Z`) — **trùng khít cả con số lẫn nội
dung**. Ba đỏ **đều là việc David**, không cái nào là lỗi mã:

| đỏ | việc |
|---|---|
| `watch-network` | ví `chain-factory` **0 LOVE9** — nạp **hai chặng**, xem runbook |
| `check-deploy-drift` | console trên server còn bản g0 — **5 tệp** |
| `check-chain-ledger` | sổ chain **công khai** còn khai 2 chain của g0 |

🔴 **Bốn commit chưa đẩy** (`1e4c1f3` `e3a67cc` `60f9034` `5d807fc`). Đẩy là việc **hỏi David**,
và §4: **ba remote, đọc TÊN trước** — `official` là cả Internet.

**Phiên sau bắt đầu từ:** `docs/RUNBOOK-REOPEN-CHAIN-CREATION.md` nếu David đã dọn xong, hoặc
`node scripts/reopen-chain-creation.mjs --probe` để đo lại còn đỏ ở đâu.

### 🆕🆕 `2026-09-01` `15:2xZ` — 🔴 **SỔ CHAIN CÔNG KHAI LÀ SỔ CỦA MẠNG ĐÃ CHẾT** (D-154)

Hỏi *"sắp chạy được phần user tạo chain chưa"*. Câu trả lời: **chưa**, ba việc, cả ba đỏ, đúng
thứ tự — `node scripts/reopen-chain-creation.mjs --probe`. Nhưng lượt đo lòi ra **việc thứ TƯ**
không nằm trong ba, và nó nằm **trước** trang tạo chain trên đúng đường người dùng đi:

```
a1.9chain.org/chains/data/console-chains.json  ->  chains: 2 · retired: 0
   Eric1 #9000000010 · eric1 #9000000011       <- khoi chainId cua g0
   RPC chung tu cong bo, hoi that              ->  "404 page not found"
```

Bản **đúng** đã nằm trong repo từ giờ G — `docs/archive/console-chains-closed-g0-2026-09-01.json`
(`chains: 0 · retired: 2`, đóng dấu `10:09:09Z`). Lượt `--compact` **đã chạy**; vế *"và bản nén
phải tới server"* thì **chưa**. ⇒ Việc dọn còn thiếu, không phải lỗi mới.

🔴 **Vì sao không cổng nào bắt — hai cổng, mỗi cổng ĐÚNG với đại lượng của mình:**
`check-deploy-drift` để tệp đó **ngoài tầm canh** (console **tự ghi** ⇒ so hash sẽ kêu sai ở mọi
lượt đẻ chain) · `check-doc-drift` (D-150) đọc **VĂN XUÔI**, đây là **JSON**. Lỗ nằm **giữa hai
đại lượng**, sống được vì *"console sở hữu tệp này"* bị đọc thành *"vậy là có người canh"*.
⇒ **D-150 ở nửa còn lại: tài liệu là bề mặt công bố — DỮ LIỆU cũng vậy.**

**Cổng mới `scripts/check-chain-ledger.mjs`** — đo trên **URL người dùng gõ**, không phải repo
(fixture dev, còn khai `DeltaChain` trên `localhost`) và không phải tệp server. **Cả hai chiều**:
trong khối thế hệ **và** RPC tự khai đúng id — một chiều thôi thì cho qua *chain đúng khối nhưng
đã chết*, hoặc *chain sống nhưng khai sai id*.

🔴 **Cùng một số, DEFECT ở danh sách này và BẢN GHI ở danh sách kia:** `9000000010` dưới `chains`
là khai một chain chết đang sống; dưới `retired` **chính là định nghĩa thu hồi**. Luật khối áp cho
`chains`, **không bao giờ** cho `retired`, và mục retired **không bị hỏi** có trả lời không.

Ba thứ khác đã ghi vào cổng: chain chết trả lời bằng **THÂN** (`404 page not found`) chứ không
bằng mã HTTP · **`refused` khác `unreachable`** (từ chối = lỗi, không với tới = *không biết*) ·
🔴 **cổng KHÔNG gửi yêu cầu tới host mà tệp nó vừa tải về chỉ định** — vừa vì sổ trỏ sang host lạ
tự nó đã là lỗi (đúng thứ 9Scan phát ra 4 ngày), vừa vì biến **tài liệu tải về** thành **yêu cầu
gửi đi** là hình dạng phải từ chối theo nguyên tắc.

**Nghiệm thu: 24 ca đối chứng ngược + hai lượt trên dữ liệu THẬT, hai chiều.**
```
do that (cong khai)      -> 🔴 4 loi / 2 chain, hai chieu bat DOC LAP
doi chung DUONG (--file) -> ✅ PASS tren chinh ban nen dung
```
🔴 **Đối chứng dương là bắt buộc** — D-153 vừa dạy đúng bài đó cùng ngày: cổng **không bao giờ
xanh được** thì đỏ của nó không mang tin. Bản nén đúng làm nó xanh ⇒ cái đỏ kia **sửa được**, và
nó chỉ thẳng vào việc phải làm.

Preflight: **32 → 34 cổng**, `31 đạt · 3 đỏ · 0 không chạy được`.

#### 📋 Lệnh cho **bốn việc dọn** đã soạn sẵn — `docs/RUNBOOK-REOPEN-CHAIN-CREATION.md`

Console (5 tệp) → **sổ chain đã nén** → nạp ví → bật cửa. Mỗi việc kèm lệnh, phép nghiệm thu, và
cái bẫy của riêng nó. Hai thứ tìm ra lúc soạn, **không sổ nào ghi**:

- 🔴 **"Nạp ví factory X→P" là CHƯA ĐỦ.** Đo: ví factory **0 trên X và 0 trên P** — nó là ví số
  đẹp sinh riêng, không phải quỹ genesis ⇒ **không có gì để chuyển X→P**. Phải **hai chặng, hai
  khoá**: quỹ →(`/api/send-x`)→ factory trên X, rồi factory →(`/api/x-to-p`)→ P của chính nó.
  `x-to-p` xuất cho `owner()`, tức **chỉ gửi được cho chính mình** — đọc thẳng từ `xp-wallet`.
- 🟡 **`console-deploy.sh` nay `bash -n` sạch và đoạn đọc manifest in đủ 16 dòng** — nhưng D-088
  vẫn đứng: **chưa ai thấy nó chạy trọn vẹn**. Đường lui chép tay 5 tệp có trong runbook.
- ✅ Thay sổ chain **không cần restart console**: `loadState()` đọc đĩa **mỗi lượt gọi**
  (`server.mjs:275`), không giữ bản trong bộ nhớ. Nhưng **đừng thay lúc có lượt đẻ/thu hồi chạy
  dở** — `saveState()` sẽ ghi đè.

⚠️ Lúc soạn tôi gắn nhãn `doc-drift: record` lên chính runbook đó rồi **tự gỡ**: nó là **câu ra
lệnh**, không phải bản ghi, và §2 nói nhãn miễn trừ **chỉ hợp lệ cho câu kể về quá khứ**. Kèm một
điều đáng biết về `check-doc-drift`: nó đọc `git ls-files` ⇒ **tệp chưa `git add` thì chưa bị
chấm**, vì thứ chưa xuất bản thì chưa đánh lừa được ai. Phải stage rồi mới đo thật (21 tệp, xanh).

#### 🟢 Một bẫy đã kiểm là KHÔNG dính

`A1_CONFIG_DIR` — thứ HANDOFF cảnh báo *"mọi lượt đẻ chain chết ở bước 2 trong khi node vẫn 9/9
xanh"*. Đo trên node đang chạy: `node-1` **nhìn thấy thư mục config thật** (`chains/` ·
`console-chains.json` · `console-tmp/`), không phải thư mục rỗng Docker tự tạo. Mạng g1 sinh trên
máy dev rồi chở sang mà mount vẫn đúng.

### 🆕 `2026-09-01` `14:49Z`–`15:05Z` — SỐ ĐO TƯƠI, và một cổng KHÔNG BAO GIỜ xanh được (D-153)

Phiên đo. Không đụng mạng, không đụng server, không gửi giao dịch. Một cổng được vá, một commit
tại chỗ (`1e4c1f3`), **chưa đẩy đi đâu**.

```
preflight  14:49Z   29 đạt · 2 đỏ · 1 không chạy được · 0 bỏ qua · 40 việc tay
      vá cổng ⇒
preflight  15:03Z   30 đạt · 2 đỏ · 0 không chạy được · 0 bỏ qua · 40 việc tay
```

**Chạy HAI lượt cách nhau 14 phút, trùng khít cả con số LẪN nội dung** — và lượt thứ hai là cần
thiết chứ không phải cẩn thận thừa: *đếm ổn định* **không** suy ra *nội dung ổn định*, đúng thứ đã
giấu `check-net-dirs` bên dưới. Fork tree tái lập được cả hai lượt (`27 patch → 38723877`, đối
chứng `26/27 → 60a61707` chạy trong cùng cổng, dựng worktree mới mỗi lượt chứ không đọc cache).

#### Hai đỏ — **cả hai là việc David**, và nội dung không đổi giữa hai lượt

```
watch-network       8 muc ✓  ·  do CHI o  chain-factory = 0 LOVE9
                    9 validator · peer 8 · B-12 309 ngay · supplyCap DO TREN NODE · console 200
check-deploy-drift  15 khop · 4 lech · 1 thieu · 1 mo coi · 4 mo coi DA KHAI
```

🔴 **Danh sách tệp phải lên server nay là NĂM, không phải sáu:** `faucet/server.mjs` **ĐÃ KHỚP**.
Còn lại đều là console: `chainid-released.json` (**thiếu hẳn**) · `server.mjs` · `chainid-test.mjs`
· `chainid-issued.json` · `lib/chainid.mjs`. Mồ côi mới: `9chain-a1-config/heartbeat.json.g0-20260901`
— đúng hình dạng B-17.

#### 🟢 B-19 thôi là "tiền thật" — và không phải vì ai dọn

`net-public/` và `net-public-dead-720m/` nay đo ra **mọi ví 0đ** trên `999999998`: `90,007 LOVE9`
**chết cùng g0**. Hai mục TRAP biến mất vì **đại lượng chúng canh đã đổi**, không vì có người dời
tệp. ⇒ B-19 còn lại **giá trị GIỮ BẢN GHI**, thôi chặn GO/NO-GO. Mồi nhử `net-that-g0` vẫn bị chấm
đúng `🟡 real band, different generation`.

#### 🔴 D-153 — cổng đỏ ĐÚNG, nhưng lời khuyên trỏ vào ĐẠI LƯỢNG KHÁC

`local-net/net-tap-g1/` **rỗng** (còn lại sau lượt shred `31/08`) ⇒ `no genesis.json` ⇒ mã 2
**vĩnh viễn** — không gì sẽ đặt genesis vào đó. Và câu kết khuyên *"chạy lại khi chain tới được"*
trong khi chính cổng đó **vừa đo `info.getNetworkID` thành công** ở dòng banner ngay trên.

**Đây là mặt sau của D-106b.** Ở kia: đỏ vì sai lý do. Ở đây: đỏ **đúng**, remedy **sai đại lượng**.
Cái giá không phải một dòng chữ sai — người đọc **làm theo**, chạy lại, không đổi gì, và sau vài
lượt thì mục đó thành **nhiễu nền** nằm cạnh hai đỏ thật. Trên đúng cổng canh *"thư mục nào giữ
TIỀN"*, đúng cửa sổ dọn thư mục trước re-genesis.

Vá: thư mục rỗng là **verdict riêng** · rỗng phải **ĐẾM** chứ không suy từ thiếu genesis (thư mục
có `keys.txt` mà không genesis **vẫn ở mã 2** — đó mới là hình dạng nguy hiểm) · phép đếm **ĐỆ QUY**
· mã 2 nay khai **NỬA NÀO** hỏng (ĐĨA hay CHAIN) và chỉ in remedy của nửa đó.

🔴 **Chỗ bản vá suýt thành lỗi NẶNG HƠN lỗi nó đóng:** `net*` giữ danh tính validator ở tầng dưới
(`node1/staker.key`). Đếm mỗi tầng đầu sẽ gọi một thư mục **đầy khoá riêng** là *"rỗng"* rồi cho
qua. Ca đối chứng đó là ca đáng giá nhất lượt này.

Đối chứng ngược **27 → 40 ca**, cộng **ba bản hỏng có chủ ý**, mỗi bản đỏ **đúng ở ca mang tên nó**:
bỏ đệ quy → 2 đỏ · coi thiếu genesis là rỗng → 2 đỏ · in cả hai remedy → 2 đỏ. `--offline` **vẫn
mã 2** (hợp đồng cũ nguyên vẹn). ⚠️ **Thư mục KHÔNG bị xoá** — David chốt: sửa cổng, đừng xoá.

⚠️ **Lỗi của chính lượt này, cổng bắt được:** hai chú thích tiếng Việt lọt vào
`scripts/check-net-dirs.mjs`, `check-english-code` đỏ ngay (*"1 file(s) that were clean now contain
Vietnamese"*). §0 hoạt động đúng thiết kế, kể cả với phiên vừa đọc nó. Nợ: **5.721 → 5.719**.

⚠️ `G4 · sổ chainId công khai` xanh cả hai lượt — **đừng dùng lại con số này**, chính nó tự khai
phải đo lại ngay trước genesis.

### 🆕 `2026-09-01` chiều — **NGHI LỄ `09/09` ĐÃ CÓ KỊCH BẢN**, và ranh giới Block Adam đã được chốt

Ba thứ ra đời trong nửa sau phiên hậu phóng. Không đụng mạng, không đụng server, không gửi giao dịch.

#### 1 · `local-net/faucet/ceremony-9s-union.mjs` — D-146

Adam → Eva → 8 giao dịch chèn → thông điệp vào **đúng `block(Eva)+9`** → **đọc ngược 182 byte từ
chain**. Vì sao phải có: C-Chain **không đẻ block rỗng** (chain đứng ở block 8 từ `10:05Z`), nên
*"chín block sau Eva"* **không tự tới**. Mặc định **chạy khô**; `--send` là việc có người bấm.
**Sáu cửa từ chối** đều đã chạy thật (mã 2): thiếu `--offset-ms` · mốc quá khứ · không khoá ·
thông điệp lệch vân tay đóng băng · sai `chainId` · chain đang bận. **11 ca đối chứng ngược.**

🔴 **Thứ nó KHÔNG chữa được, nên nó khai:** không ai đặt chỗ được một số block. Ô neo bị chiếm ⇒
**dừng, không gửi thêm gì**. *Chạy lại không phải chạy lại* — nó là một Adam mới, một Eva mới.

#### 2 · 🔴 D-147 — ranh giới **BAO GỒM** (`ts >= mốc`), David chốt

Ảnh trang khắc chữ của **C1** lộ ra hai định nghĩa A1 **chưa từng viết ra**: *Block Adam = block
đầu tiên có ts **từ mốc trở đi**, định nghĩa bằng THỜI GIAN không phải chiều cao* · *Block Eva =
block **ngay sau** Adam*. Ba tài liệu trên trang đó **trùng byte tuyệt đối** với `docs/engrave/`.

⇒ Hai giả định của bản kịch bản đầu **sai**: Block Adam **không** phải "block chứa giao dịch của
ta" (người lạ đẻ ra nó cũng được), và ô neo là **Adam+10** biết ngay khi biết Adam. Ca đối chứng
dựng cho điều đó **bắt một lỗi thật trong đường sống**: quét **xuôi** từ đầu chain đo trước lượt
chạy sẽ **bỏ sót** block người lạ vượt mốc trong lúc chờ offset ⇒ nay quét **ngược xuống**.

Đổi ở **ba nơi**: kịch bản · `block-adam-drill.mjs` (`>` → `>=`) · CANON. ⚠️ Bản chấm **7/1** của
vật chứng `27/08` **giữ nguyên** — chấm dưới luật cũ, là câu kể về quá khứ. **C1 không phải đổi gì.**

#### 3 · Độ trễ: **hai phiên dính cùng một lỗi trong cùng một giờ**

Tôi đo bằng `curl` ⇒ `0,76–2,94s`/lời gọi, kết luận *"đua ô neo là vô vọng"*. Kịch bản tự đo,
**cùng máy cùng phút** ⇒ **median 309 ms**. `curl` bắt tay TLS **lại mỗi lần gọi**; ethers giữ kết
nối. **Số đo CÔNG CỤ, không đo LIÊN KẾT.** 9Scan đo lại và dính y hệt (họ khai `1,4–2,3s`, thật ra
`~0,44s` nóng). Ba chế độ đã ghi vào chính tệp sẽ đọc ngày `09/09`:

```
trong máy chủ   9–10 ms   ·   dev NÓNG ~0,31–0,5s   ·   dev NGUỘI 1,3–2,9s (thêm bắt tay mỗi lần)
```

⇒ `~0,15 block` một lời gọi: **đi bộ tất định thoải mái (~1 phút)**; đua ô chính xác **làm được
nhưng không an toàn** ⇒ đó là chỗ **hầm M11.10** đáng giá. Kịch bản nay **tự in độ trễ median mỗi
lượt chạy** thay vì cắm hằng số — vì bài học thật là *biết luật không ngăn được lớp lỗi này*.

#### Kèm: ba ràng buộc đã ghi vào `docs/block-adam/CANON.txt`

- **Danh sách năm bên đẻ được block** trong cửa sổ nghi lễ: 9Scan ✅ không thể (đo được) ·
  **bơm nhịp** 🔴 · **faucet** 🔴 không khoá được · đẻ chain ✅ đóng · người lạ 🔴.
  ⚠️ *"Một bên đo được im lặng"* **không** suy ra *"chain sẽ yên"*.
- **Phương án (a) bật bơm và (b) chèn có kịch bản LOẠI TRỪ NHAU.** (b) đã có ⇒ (a) bị loại cho
  cửa sổ. Bẫy chiều ngược: **B-13(b) cần bơm chạy để đo**, nên bật để đo thì **phải tắt lại**, và
  tắt **không phải** `touch heartbeat.stop`.
- 🔴 **Nhãn khi công bố Block Adam:** *"mốc"* và *"block đầu tiên đạt mốc"* — **không** *"công bố"*
  / *"đo được"*, và **không tính hiệu** rồi trình bày như độ trôi (nó sẽ lệch **vĩnh viễn** trên
  một thứ đúng). Chiều khẳng định: **hiệu = 0 mới là lúc đáng nhìn kỹ** — đó là ranh giới D-147.

#### 9Scan-A1 — đã khép, và họ tự sửa một lỗ nặng

Mục *"gấp nhất"* của họ (**testnet offline 4 ngày**) là **đo nhầm tên miền đã nghỉ**. Nhưng khi
đào tiếp họ tìm ra thứ nặng thật: **`CHAIN.rpc` — URL người dùng dán vào MetaMask — trỏ
`rpc-testnet-a1` từ `28/08`** ⇒ bốn ngày ai thêm mạng từ trang 9Scan đều nhận **một mạng không ký
nổi giao dịch**. Đã sửa + deploy phía họ. `parentID` block 0 P-Chain: **A1 đo lại độc lập, trùng
từng ký tự**. Vế `sha256(genesisBytes)` **không tái lập được hôm nay** (engrave-verify hỏng biên
dịch trên Windows vì cgo, **không có trong image `:g1`**) ⇒ là **bản ghi lúc phóng**, không phải
phép đo hôm nay. Trao đổi đầy đủ: `docs/requests-from-9scan/2026-09-01-…-REPLY.md`.

### 🆕 `2026-09-01` `11:0xZ` — PHIÊN **HẬU PHÓNG**: cổng canh **LỊCH SỬ GIT**, và hai đỏ đều là việc David

Không đụng mạng, không đụng server, không gửi giao dịch. Một cổng mới + một lượt đo lại.

#### 🔴 Lỗ hổng nằm ngay trước việc kế tiếp của David — `scripts/check-history-secrets.mjs` (D-145)

Bật repo **CÔNG KHAI** là xuất bản **mọi commit**, không phải cây làm việc. Xoá tệp là xoá khỏi
*cây*, không xoá khỏi *object*. Mà **không cổng nào từng đọc một object lịch sử nào**:
`h6b-backup.sh` quét bí mật với `--exclude-dir=.git` (loại kho object **theo cấu tạo**) và chỉ
tìm khối PEM; `check-key-leaks.mjs` đi theo **thư mục**, nên một blob không cây nào trỏ tới thì
không nằm ở đâu để nó gặp. Hai cổng xanh, cả hai đúng với đại lượng của mình, và lớp này **chưa
từng được đo** — nằm trên **hành động không lùi được** cuối cùng của lượt phóng.

```
phạm vi refs (đúng thứ `git push` gửi)   2.228 object  →  0 phát hiện · 969 hex 🟡
toàn kho object (--all-objects)          2.349 object  →  0 phát hiện · 978 hex 🟡
thước đo 18 khoá / 4 tệp trong kho sống  ·  121 object không ref nào với tới
```

⇒ **Lịch sử sạch vật liệu khoá. Việc "bật công khai" không bị chặn bởi đại lượng này.**

🔴 **Lần chạy thật đầu tiên ĐỎ 68 mục, và nó đỏ VÌ SAI LÝ DO** — thước đo nuốt cả `g0/genesis.json`
(một tệp genesis là hàng trăm giá trị 32 byte **không phải khoá**), nên mọi gói vật chứng in lại
đúng những hash đó bị chấm là rò rỉ. *"Sai rộng thì không mất gì"* đúng cho phía **ĐI TÌM**, **sai
cho THƯỚC ĐO**: thước rộng không làm cổng nhạy hơn, nó làm cổng **chặn một việc đúng vì lý do sai**.

Đối chứng ngược: **11 ca tổng hợp** (khoá xoá ở commit sau vẫn tìm ra · khoá trong **lời nhắn
commit** · PEM · tệp genesis đóng góp **0** khoá vào thước · thước rỗng + có phát hiện ⇒ **1 chứ
không 2**) **+ một ca ĐỎ trên dữ liệu THẬT**. Đã nối vào preflight cả hai vế (**22 → 24 đạt**).

#### Hai đỏ còn lại — **cả hai là việc David**, và không cái nào là lỗi mới

- 🔴 **ví `chain-factory` = 0 LOVE9.** Mọi mục khác của `watch-network` xanh (9 validator ·
  8 peer · `supplyCap` đo trên node đang chạy · B-12 **309 ngày**). Nạp X→P **trước** khi mở cổng
  đẻ chain, nếu không người đầu tiên bấm nút nhận `insufficient funds`.
- 🔴 **console trên server vẫn là bản g0** — 5 tệp lệch/thiếu (`chainid-released.json` **thiếu** ·
  `server.mjs` · `chainid-test.mjs` · `chainid-issued.json` · `lib/chainid.mjs`). `A1_GEN` ở đó
  **= 0** ⇒ nó sẽ cấp chainId từ khối của **thế hệ đã chết**. Vô hại **chỉ vì** cổng đẻ chain
  đang ĐÓNG ⇒ **deploy console TRƯỚC khi mở cổng**, không sau. ✅ `faucet/server.mjs` nay **KHỚP**.
- 🟡 Mồ côi mới trên server: `9chain-a1-config/heartbeat.json.g0-20260901` — đúng hình dạng B-17.
- 🟡 `check-net-dirs` còn **1 mục không kết luận được**: `local-net/net-tap-g1/` **rỗng**, không có
  `genesis.json`. Mười thư mục kia đo sạch, `net-g1` là thế hệ đang chạy (4 ví có tiền thật).

### 🟢🟢🟢 `2026-09-01` — **MẠNG g1 ĐÃ SINH RA VÀ ĐANG SỐNG**

`down -v` lúc `09:26Z` · mạng lên `09:31Z` · P2P mở `09:44Z`. Sinh mạng **trên MÁY DEV**, không
phải trên server — xem chỗ chặn dưới đây, nó suýt hỏng cả lượt.

```
RPC cong khai    https://rpc-a1.9chain.org  ->  "9chain-a1-g1"
networkID        999999998        validator 9        peer 8/8       healthy true
binary           commit=9chain-a1-g1-27patch-38723877   <- ban DA DIEN TAP
duong dan DB     9chain-a1-g1                          <- FallbackHRP KHONG bi di vao
supplyCap        7900000001000000000 (do TREN NODE)
eth_chainId      0x218711a09 = 9000000009
LOVE9            "LOVE9 Coin" denom 9   ·   AVAX DO kem nguyen van ly do
minValidatorStake 81 LOVE9   ·   minDelegatorStake 9 LOVE9   (do tren P-Chain)
B-12             309 ngay (2027-07-07)
genesis sha256   4de8caa59ef92e9212c27e569103bb757fa3e2a3876f3ab0c6981328bb0f6ee6
beacon           NodeID-MrgP69AZRSeJ3DQRSBWQzqeqovNcTAsEb  @ 139.99.145.13:9651
watch-network    5 do  ->  0 do
```

#### 🔴 CHỖ CHẶN KHÔNG TÀI LIỆU NÀO GHI — tìm được 20 phút TRƯỚC `down -v`

`gen-network.sh:93` chạy `go run ./9chain-a1-tools/netgen` từ `$(pwd)/upstream/avalanchego`.
**netgen KHÔNG chạy từ image — nó biên dịch tại chỗ từ cây nguồn.** Trên server cây đó là ảnh
chụp `27/08`: `A1Gen = 0` · `A1Name "9chain-a1-g0"` · `MinValidatorStake 25 * KiloAvax` · không
`.git` · **0 patch**.

Việc tay preflight **có** cảnh báo cây nguồn server ở `A1Gen 0` — nhưng nó nói về **build IMAGE**.
Không dòng nào nối sang chuyện **netgen cũng biên dịch từ đúng cây đó**. Ship image chỉ giải
quyết một nửa, và nửa còn lại nằm **sau `down -v`**.

Nó **kêu to** chứ không hỏng lặng (`NETWORK_ID` bắt buộc ⇒ `999999998` không khớp `A1ID` suy từ
`A1Gen 0` ⇒ FATAL). 🔴 **Nhưng cái bẫy là cách sửa hiển nhiên:** đang đứng sau `down -v`, g0 đã
xoá, đồng hồ chạy — hạ `NETWORK_ID` xuống `999999999` cho khớp là **sinh lại g0**.

⇒ **Sinh mạng trên MÁY DEV** (cây 27 patch), chở `net/` sang. Và nó **tốt hơn về khoá**: lượt g0
lấy `keys.txt` **trên server** — điều O1 ghi là ngoài dự tính. Lần này netgen tự dặn
*"`keys.txt` … KHÔNG BAO GIỜ đưa lên server; file duy nhất được phép: `faucet.env`"*, và bộ khoá
5 quỹ **ở lại máy dev**.

#### Ba cái bẫy bắt được TRONG lúc chạy

1. 🔴 **`image: 9chain-a1/node:dev` × 9 dòng** trong compose netgen vừa sinh (gotcha 16 / D-105).
   Không sửa thì mạng lên **9/9 xanh bằng binary 18 patch**, không `LOVE9`, rào cản vẫn 25.000,
   **mọi cổng xanh**. Sửa cả 9, `docker compose config` xác nhận vẫn hợp lệ.
2. 🔴 **`heartbeat.json` công khai in `blockHeight 107.874 · 9,01 tps` của mạng ĐÃ CHẾT.** Trang
   chủ đọc tệp đó. Đã ghi lại bằng số thật của g1 (`running:false · blockHeight 0 · 0 ví`) —
   ví bơm cũ thuộc thế hệ chết nên **gỡ khỏi danh sách công khai**. Tệp thuộc `root`, phải `sudo`.
3. 🔴 **faucet đọc `cung.json` của g0** (`networkID 999999999`) ⇒ `/faucet/api/supply` sắp công bố
   số của mạng chết. Chép bản g1 vào, restart, dòng khởi động tự khai `networkID 999999998`.

#### 🟢 Vòng khép D-118b ĐÃ MỞ — đo TỪ NGOÀI Internet

```
9651 ✓  9652 ✓  9653 ✓  9654 ✓  9655 ✓  9656 ✓  9657 ✓  9658 ✓  9659 ✓
ca doi chung am 9999 -> dong   (phep do phan biet duoc)
```

Chín node recreate **từng cái một**, mesh **không bao giờ tụt dưới 8 peer**. Cộng
`minValidatorStake 81` ⇒ người ngoài với tới **100% stake** (bootstrap đòi 80%) và cần **9 lượt
faucet**. Câu *"ai cũng chạy validator được"* lần đầu tiên **đúng và đo được**.

#### Chữ khắc — điều kiện qua số 2 ĐẠT

`engrave-verify --rpc` ⇒ **17 đạt · 0 hỏng**, **có mục `[5] Mạng đang chạy`**:
`block 0 P-Chain parentID == sha256(genesisBytes)` · `eth_getCode` trả 1273 byte ·
**bản văn trên MẠNG == bản văn trong TỆP** · `extraData` trùng.

Bảy từ Hebrew (Sáng Thế 1:1, đếm bằng công cụ hiểu UTF-8 — `wc -w` in ra `0`, đó là **phép đo
hỏng**), Adam, Eva, LOVE Paper. Vân tay netgen in ra **trùng bản đóng băng `31/08`** ⇒ mỏ neo
tính **trước**, không phải tiếng vọng.

#### 🔴 CÒN LẠI — ba việc chỉ David làm được

| # | việc | chặn gì |
|---|---|---|
| 1 | **Repo GitHub → CÔNG KHAI** | 🔴 điều kiện qua **4 + 5**. Không có nó thì hôm nay là **một RPC công khai**, không phải testnet công khai — và phải gọi đúng tên như thế |
| 2 | **Kênh liên hệ** — chỗ `FILL-ON-G-DAY` **cuối cùng** (`RUN-A-VALIDATOR.md:321`) | cổng xuất bản đang đếm **1** |
| 3 | 🔴 **Nạp ví `chain-factory` X→P TRƯỚC khi mở cổng đẻ chain** | số dư **0** ⇒ người đầu tiên bấm nút nhận `insufficient funds` (D-140 gotcha C) |

⚠️ **Khuyến nghị: ĐỪNG mở cổng đẻ chain trong lượt công bố này.** Công bố mạng + đường validator
trước; mở đẻ chain sau khi nạp ví và **đẻ thử một L1 rồi thu hồi**.

#### Việc tiếp của A1

- **B-19 nửa 2** — g1 đã xanh ⇒ **được phép** `shred` hai bản `chain-factory-key.txt` trong thư
  mục thế hệ chết. Bản ghi đã cứu vào `9chain-a1-keys/g0/`.
- **B-16** — bộ đáng làm nay **đã tồn tại** (`local-net/net-g1/keys.txt` trên dev). Cửa sổ mở.
- **B-20** — sao lưu **9 danh tính validator** của g1 (`staker.key`/`staker.crt`/`signer.key`),
  đếm TỆP trong gói chứ không đọc dòng `--check`.
- **B-13(b) / Block Adam** — chưa làm được: C-Chain `blockNumber = 0`, phải **mở block 1** bằng
  một giao dịch thường rồi đo lúc chain **đang đẻ block** (gotcha 24 + 25).

### 🆕🆕🆕🆕 `2026-09-01` `06:25Z` (VN 13:25) — SỐ ĐO NGÀY G, lấy TRƯỚC khối `07:09Z`

Không sửa một dòng mã. Chạy đúng hai việc HANDOFF xếp cho A1, rồi đo lại toàn bộ. **Cả hai số
đo dưới đây là số TƯƠI**, cách `down -v` (`07:39Z`) khoảng **75 phút**.

#### ✅ H-6b — ĐẠT, hai nơi. Cổng này ĐANG ĐỎ lúc phiên bắt đầu

Thấy **ĐỎ trước**, và đỏ **vì đúng lý do**: fork tree `60a61707` + **26 patch** vẫn khớp, chỉ
**3 tệp MÃ** đổi sau bản `20260831-201321` — `local-net/deploy/manifest-deploy.json` ·
`scripts/check-deploy-drift.mjs` · `scripts/gday-preflight.mjs`. Đúng ba tệp mà 7 commit hôm
qua đụng, tức cổng đo đúng đại lượng nó khai. Dựng lại ⇒ **`20260901-061904`**:

```
repo main f69a216 · 333 commit · tree 569bc7d1 · fork 26 patch · tree 60a61707
✓ clone ngược (máy dev): tree khớp tuyệt đối · 333 commit
✓ áp 26 patch lên 1cf1fc3 (máy dev): tree khớp cây fork TỪNG BYTE
✓ ĐỐI CHỨNG NGƯỢC: bundle cắt cụt bị TỪ CHỐI ⇒ phép đo biết báo ĐỎ
✓ QUÉT BÍ MẬT: 0 khối PRIVATE KEY (4 tệp .env/.key — xem lại nếu con số này tăng)
✓ sha256 hai đầu: 30/30 khớp        (máy chủ)
✓ clone ngược TRÊN MÁY CHỦ: tree khớp tuyệt đối

C:\PROJECTS\9Chain-backups\9chain-a1-backup-20260901-061904
"$A1_SSH_HOST":~/9chain-a1/backup/20260901-061904
```

🔴 **Đừng đọc thành "đã an toàn".** Chính script in ra câu đó: nó **chưa bao giờ** cứu khoá 5
quỹ (D-044 / O1) và **không** chứa danh tính validator (B-20). Lượt này không dời B-16 hay
B-20 một milimet nào.

#### Preflight ĐẦY ĐỦ (có mạng) — `22 đạt · 3 đỏ · 0 không chạy được · 0 bỏ qua · 38 việc tay`

**Trùng khít số đo phiên trước ⇒ 7 commit hôm qua không làm hỏng gì.** Cả **21 cổng repo**
xanh, gồm bánh cóc sổ chặn, cổng ngôn ngữ, và 12 bộ đối chứng ngược. `G4 · sổ chainId công
khai` xanh — nhưng nó tự khai phải **đo lại ngay trước genesis**, đừng dùng lại con số này.

Ba đỏ **đã kiểm từng cái đỏ VÌ ĐÚNG LÝ DO**, khớp bảng "ba đỏ dự kiến" bên dưới:

```
watch-network       tên mạng 9chain-a1-g0 · networkID 999999999 · validator 10
                    B-12 còn 11 ngày (2026-09-12)
                    🟡 số dư chain-factory KHÔNG ĐO ĐƯỢC — ĐÚNG THIẾT KẾ (việc tay #99a:
                       chưa khai ví factory cho g1). Vàng, không phải đỏ.
                    ✓ supplyCap ĐO TRÊN NODE = 7900000001000000000 khớp repo
                    ✓ node-1 thấy 9 peer · faucet /api/supply có số · console /whoami 200
check-deploy-drift  14 khớp · 5 lệch · 1 thiếu · 0 mồ côi · 4 mồ côi ĐÃ KHAI · 14 ngoài tầm
check-net-dirs      2 TRAP (B-19) + 1 DECOY (net-that-g0) — không đổi, việc David
```

🔴 **SÁU tệp phải lên server ở giờ G — danh sách đã ĐO, đừng dựng lại từ trí nhớ:**

```
THIẾU   local-net/console/chainid-released.json
LỆCH    local-net/console/server.mjs
LỆCH    local-net/console/chainid-test.mjs
LỆCH    local-net/console/chainid-issued.json
LỆCH    local-net/lib/chainid.mjs        ⇦ CỐ Ý giữ lại tới nay; đi CÙNG lượt bump
LỆCH    local-net/faucet/server.mjs      ⇦ faucet ship MÃ; KHÔNG script nào sở hữu tệp này
```

> 🔴 **ĐÍNH CHÍNH `2026-09-01 14:52Z` — NAY LÀ NĂM, không phải sáu.** `local-net/faucet/server.mjs`
> **đã KHỚP** repo↔server (đo hai lượt, `14:52Z` và `15:05Z`). Năm tệp còn lại đúng nguyên văn
> trên, **toàn bộ là console**. Đính chính chứ không sửa khối trên: đó là số đo `06:25Z` và nó
> đúng ở thời điểm nó. 🔴 Nhưng khối này là **câu RA LỆNH cho một việc sắp làm**, không phải câu
> kể về quá khứ — mà `stale-ok` chỉ hợp lệ cho loại thứ hai (§2). Đi ship lại một tệp đã khớp thì
> vô hại; đọc *"sáu"* rồi **kết luận nhầm rằng faucet vẫn còn nợ ba bản vá đêm `31/08`** thì không.

🔴 **B-19 nay có số, không còn là chữ:** `net-public/chain-factory-key.txt` và
`net-public-dead-720m/allocation.md+chain-factory-key.txt` — **cùng giữ `90.007476864 LOVE9`**,
cả hai nằm ngoài mọi băng thế hệ sống. Dời **rồi so `sha256` từng tệp một**, đừng xoá theo thư mục.

⚠️ **Ghi chú sổ sách:** phiên SOÁT 3 VÒNG (`8ebae9e`→`cb3813f`) **không cập nhật `PROGRESS.md`** —
7 phát hiện của nó chỉ sống trong `HANDOFF.md` + `DECISIONS.md`. Phiên này không backfill hộ;
mục đó vẫn nợ.

#### 🔴🔴 `07:25Z`–`08:20Z` — **D-143: RÀO CẢN VALIDATOR 25.000 → 81 LOVE9**, hai máy ship lại

**David hỏi hơn hai tiếng trước genesis, và câu trả lời phải là HÔM NAY.** Phép đo quyết định là
**con số nằm ở đâu**: `MinValidatorStake` ở `genesis/genesis_9chain_a1.go:129`, **netgen KHÔNG ghi
nó vào `genesis.json`** (0 hit trên mọi `net*/genesis.json`) ⇒ **biên dịch vào binary** ⇒ **bất
biến suốt đời mạng** kể từ lúc netgen chạy. Cửa sổ sửa rẻ đóng lại ở đúng ngày G.

25.000 LOVE9 với faucet cấp 10/lượt, hạn 5/IP/giờ = **~500 giờ xin liên tục**, không đường nào
khác. `PROGRESS.md` đã tự khai bằng chính chữ của nó: *"không phải đường chậm, mà là không có
đường"*. **81 = 9 × 9**, chín lượt xin từ faucet cấp 9. Fuji của Avalanche dùng `1 * units.Avax`
⇒ 81 vẫn cao **gấp 81 lần**. An toàn không đổi: 81 / 8.999.991 ≈ **0,0009%** stake.

🔴 **`MinDelegatorStake` đi cùng, 312,5 → 9** — giữ nguyên là **uỷ quyền đắt gấp 3,9 lần tự chạy
validator**, đóng băng vĩnh viễn. Ai đổi một trong hai số phải đổi cả hai.

**Nghiệm thu — vì "build thành công" không nói gì về GIÁ TRỊ.** Tìm chính con số (uint64 LE) trong
**cả hai** binary:

```
                                    binary MOI   binary CU
  81e9   (81 LOVE9)                      1           0
  9e9    (9 LOVE9)                       1           0
  25e12  (25.000 LOVE9)                  0           1
  625e15 (max — KHONG dung toi)          1           1   ⇦ ca doi chung trong cung phep do
```

Biên dịch **chạy thật** (`55,5s` + `25,0s` + `33,3s`; chỉ `WORKDIR` CACHED). Hai máy ship lại,
**ba mỏ neo đo trên chính từng máy, trùng khít**:

```
commit=9chain-a1-g1-27patch-38723877
sha256 2f733249037b90c6f6532f9159faed5071b17ded81a8d99fa760cb6192b57480
g1=4 · LOVE9=2 · g0=0     (ca duong 4/2 · ca am 0 · command -v grep tu khai)
duong lui: 9chain-a1/node:g1-26patch-60a61707 con tren CA HAI may
```

**Luật cứng #3: 26 → 27 patch · tree `60a61707` → `38723877`.** 26 patch cũ đổi đúng **26 dòng, toàn
bộ là dòng đếm, 0 dòng nội dung**. 🔴 **`TREE_BEFORE_LAST` nay là `60a61707`** — tree fork đứng suốt
hai ngày **VÀ** tree dựng ra image đã ship + nghiệm thu ba mỏ neo, tức con số lượt này **không thể
tự đẻ ra**. Mỏ neo đối chứng mạnh nhất từ trước tới nay.

🔴 **DÂY PHỤ THUỘC MỚI, đừng để đứt: 81 chỉ đúng nếu faucet cấp 9.** `FAUCET_AMOUNT` mặc định **10**,
`FAUCET_MAX_PER_IP_HOUR` mặc định **5** ⇒ để nguyên thì chín lượt ra **90** và mất **hai giờ**.
Không cái nào là lỗi sập, **không cổng nào canh env** ⇒ đúng hình dạng `A1_PUBLIC_RPC_BASE`. Đã
thành điều kiện bắt buộc trong việc tay faucet; nghiệm thu bằng **đọc dòng khởi động** của faucet.

`docs/RUN-A-VALIDATOR.md` đã theo: bảng tham số **81/9** · dựng lại fork **27 patch → `38723877`**,
đối chứng **26/27 → `60a61707`** · và **một `FILL-ON-G-DAY` bị XOÁ chứ không điền** (11 → 10) — nó
hỏi *"người ngoài lấy 25.000 LOVE9 ở đâu"*, câu hỏi đó **không còn tồn tại**.

#### Chuỗi sổ chain + heartbeat — chạy `06:41Z`–`07:04Z`

**Sổ chain, 3 lệnh, `0` thay đổi** — và con số 0 đó là phép đo có giá trị nhất trong lượt:
`--pull` thấy sổ sống vẫn đúng **2 bản ghi** (Eric1 · eric1 của `31/08`), repo biết cả **55**;
`--write` ra `0 chainId · 0 tên` và **tự dẫn chiếu** `chainid-released.json` ⇒ bánh cóc phân biệt
được *"mất vì có người quyết"* với *"mất vì mất sổ nguồn"*, quyết định xoá sổ **đứng nguyên**.
🔴 **`--compact` KHÔNG chạy lại, có chủ ý:** sổ nén đã đóng dấu `thuHoiLuc = 2026-09-01T10:09:09Z`
— **giờ G**, tức lúc hai chain đó thật sự thôi tồn tại. Chạy lại là đóng dấu một khoảnh khắc mà
chúng **vẫn đang chạy**, tức phá đúng thứ cờ `--at` sinh ra để giữ.
⇒ Không ai đẻ chain mới trong ~19 giờ ⇒ **xác nhận độc lập, đo trên sản phẩm**, rằng cổng đẻ chain
thật sự đóng (D-135), chứ không chỉ *"đã bấm đóng"*.

**heartbeat: bơm đã tự dừng, và lệnh trong runbook là lệnh SAI.** Xem mục việc tay đã sửa; tóm tắt:
bơm dừng sạch lúc `00:00:03Z` theo hạn của chính nó (ghi `running:false` + `stopReason` rồi mới
thoát). Thứ còn chạy là **container**, lặp restart ~1 lần/phút từ `00:00Z`, `restartCount 430`.
`docker stop` lúc `07:03:37Z` ⇒ `state=exited`, đối chứng: số đứng yên, không tiến trình bơm nào khác.

#### 🔴 Lượt quét toàn diện `07:05Z`–`07:18Z` — hai lỗ, cả hai nổ SAU `down -v`

**Sạch (đo, không đọc):** hằng số thế hệ **suy ra** ở cả Go lẫn JS (`A1Gen=1` · `9chain-a1-g1` ·
`A1ID 999999998` · dải `9001000000–9001999999`) · chữ khắc **4 tệp · 1.142 B · 4 sha256 khớp CANON
từng byte**, `manifest.json` khớp `id`/`lang`/mặt, **4 hash khác nhau đôi một** (không có triệu chứng
gán nhầm tài liệu) · ba giá trị đã bị lật trong tài liệu ngày G (`N=10` · `9700` · `25 patch`) đều
nằm **sau rào đính chính đặt NGAY TRÊN** danh sách lệnh · **image `:g1` trên CẢ HAI máy**, ba mỏ neo
trùng khít, đo kèm **ca đối chứng dương (4/2) và âm (0)** + `command -v grep` ⇒ số `g0 = 0` nghĩa là
*không có*, không phải *không đo được*.

🔴 **Lỗ 1 — node9 ở Hetzner là TIẾN TRÌNH TRẦN, và nó đang giữ cổng `9651`** (`a229a99`).
`PID 34489`, chạy từ `29/08`, `--network-id=999999999`, `LISTEN *:9651`. **Tiến trình trần thứ BA**
của dự án sau console và bơm heartbeat — không lệnh docker nào thấy hay dừng được nó. Cả hai bước
ngày G cho máy đó viết như thể nó là container:
(a) `docker run --network host --staking-port=9651` **không kiểm cổng trước** ⇒ container lên, bind
hỏng, tiến trình chết, `docker run -d` **vẫn trả thành công**, `--restart unless-stopped` đưa vào
vòng lặp restart. `docker ps` in `Restarting`, không dòng nào nói vì sao — **đúng hình dạng
`9chain-a1-heartbeat` sáng nay, 430 lượt, không ai biết**.
(b) `rm -rf /opt/9chain-a1/data` khi tiến trình còn sống **"thành công" mà không xoá được gì có
nghĩa** — Linux chỉ gỡ liên kết, tiến trình giữ fd và ghi tiếp, có thể tạo lại tệp. Danh tính cũ
sống sót qua một lượt xoá **trông sạch**, trong khi cả điểm của bước đó là danh tính **phải đến từ
genesis**.
⇒ Đã thêm **bước 0** (kill + **hai** ca đối chứng phải rỗng: `pgrep -af '[a]valanchego'` và
`ss -lntp | grep ':9651'`) vào `GDAY-NODE10-HETZNER.md` **và** vào việc tay preflight.

🔴 **Lỗ 2 — `HEARTBEAT_STOP_AFTER` nằm trong QUÁ KHỨ** (`6652f43`). Env vẫn khai
`2026-09-01T00:00:00Z`. Dựng lại bơm cho g1 với giá trị đó ⇒ FATAL ở `heartbeat-pump.mjs:445` mỗi
lần boot ⇒ vòng lặp restart ⇒ **bước gieo lại `heartbeat.json` KHÔNG BAO GIỜ CHẠY** ⇒ trang chủ
tiếp tục phục vụ số của mạng **đã chết**, HTTP 200, không cổng nào đỏ. Cần `docker rm -f` +
`docker run` (gotcha 3). ⇒ Việc tay heartbeat nay có **4 bước**, bước (1) bị **lật ngược**:
`touch heartbeat.stop` **không dừng được gì** (thoát ở `:447` trước khi đọc `STOP_FILE` ở `:50`)
và một tệp stop bỏ quên là **mìn** cho bước (3).

#### 🔴 GOTCHA mới — và nó là lỗi của chính lượt quét này

**`cd` trong Bash CÒN DÍNH sang lệnh sau, và một `grep` trên 0 tệp in ra RỖNG — đọc thành "sạch".**
Một bước `cd docs/engrave` làm ba lệnh grep kế tiếp chạy sai thư mục; `docs/GDAY-*.md` không tồn tại
từ đó nên grep im lặng, và tôi suýt khai *"tài liệu ngày G sạch"* từ một phép đo gãy. Cùng lớp với
GOTCHA 1 của phiên sáng nay (`strings` không có ⇒ `grep -c` trên rỗng in `0`).
⇒ **Mọi lượt grep dùng để KẾT LUẬN phải bắt đầu vào TỰ KHAI** (liệt kê tệp + kích thước) **và chạy
một ca đối chứng dương** trước khi tin một kết quả rỗng. Đường dẫn tuyệt đối, đừng dựa vào cwd.

### 🆕🆕🆕 Phiên `2026-09-01` — SOÁT 3 VÒNG · CHỖ CHẶN SỐ 2 ĐÓNG · SỔ CHẶN XOÁ CÓ CHỮ KÝ

**TL;DR:** David yêu cầu quét kỹ thêm 3 vòng. Ra **7 phát hiện**, trong đó **hai cổng đang ĐỎ mà
HANDOFF ghi là xanh**, và một cổng an toàn **đã tắt lặng lẽ 2 ngày**. Đã vá hết + chở image g1
sang Hetzner. 7 commit `8ebae9e` → `cb3813f`.

#### 🔴 Số đo cuối phiên — đọc trước

```
preflight --no-network   21 đạt · 0 đỏ · 4 bỏ qua · 38 việc tay
preflight ĐẦY ĐỦ         22 đạt · 3 đỏ  (ba đỏ DỰ KIẾN, tự hết ở giờ G — bảng dưới)
drift                    14 khớp · 5 lệch · 1 thiếu · 0 mồ côi · 4 mồ côi ĐÃ KHAI
h6b --check              🔴 CŨ (mã đổi sau lượt lưu) ⇒ chạy LẠI ở khối 07:09Z
                         [stale-ok — số của phiên đó. ĐÃ CHẠY LẠI 06:19Z, ✅ ĐẠT: xem mục trên]
sổ chặn chainId          49 · 54  →  0 · 0  (thả có chữ ký, xem dưới)
```

#### ✅ Chỗ chặn cứng số 2 ĐÃ ĐÓNG — image g1 nay ở **CẢ HAI** máy

`docker save|ssh|docker load` sang Hetzner. Nghiệm thu **trên chính máy đó**, ba mỏ neo, trùng
khít bản OVH của D-137: `commit=9chain-a1-g1-26patch-60a61707` · `sha256 7ad4e2ac…6ea4`
(plugin `33d0bd00…422c`) · `g1=4 · g0=0 · LOVE9=2`. Node9 g0 **vẫn chạy**, đĩa 84G→83G.
⇒ **Ngày G không còn lượt build Go nào sau `down -v`.** Chi tiết + lệnh: `GDAY-NODE10-HETZNER.md` §1d.

🔴 **Máy Hetzner là máy DÙNG CHUNG** — 178 image · 228 container của `oneboard`/`9mall`/`msc`/…
Mọi thao tác phải **cộng thêm**; `docker system prune` ở đó là xoá việc người khác. Khoá SSH là
`~/.ssh/id_ed25519` (**không** phải khoá `9chain-a1` của OVH). Ubuntu noble 24.04 ⇒ bẫy glibc
đã ghi hôm qua **không áp** cho máy này.

#### Bảy phát hiện của lượt soát

| # | phát hiện |
|---|---|
| 1 | **Hai cổng ĐỎ mà HANDOFF ghi xanh** — `gen-chainid-issued --check` và `h6b --check`. Cả hai vì cùng lý do: số đo lấy GIỮA phiên rồi phiên làm tiếp và làm chúng sai |
| 2 | **Sổ chặn chainId không có bánh cóc** — mất một sổ nguồn ⇒ danh sách CO LẠI, `--check` xanh lại, tên đã phát quay về lưu thông. Và `--check` in đúng câu *"chạy --write"* cho mọi kiểu lệch ⇒ **dạy người ta bấm đúng thao tác nguy hiểm** |
| 3 | 🔴 **`check-net-dirs` khai "running network" bằng HẰNG SỐ REPO** trong khi đang mở sẵn RPC. Từ lượt bump `30/08`, mồi nhử `net-that-g0` (D-110) bị chấm *"thế hệ khác"* ⇒ nhánh **DECOY không bao giờ chạy**, đúng cửa sổ dọn thư mục trước re-genesis |
| 4 | 🔴 **node9 Hetzner**: runbook ghi `git am` **25 patch** (phải 26 — patch 0026 LÀ lượt bump) · bảng nghiệm thu đo **MẠNG** chứ không đo binary · việc tay preflight dùng `docker exec` nên **không phủ** máy chạy trần |
| 5 | Hai tài liệu ngày G còn **ra lệnh** bằng giá trị đã bị lật (`N=10`, `PORT_BASE=9700`) |
| 6 | ~~2 user thật mất chain~~ — **David: đó là test của team**, bỏ |
| 7 | `faucet/server.mjs` lệch repo↔server: ba bản vá đêm `31/08` **chỉ sửa trong repo** |

#### Đã vá — và mỗi bản vá đều thấy ĐỎ trước

- **`check-net-dirs` nay ĐO** `info.getNetworkID`; repo là ý kiến thứ hai; lệch thì nói to.
  Counter-check **27/27**. Hai lỗi trong chính bản vá bị self-test bắt (`dirs.map` truyền INDEX
  vào tham số `live`; `readNetDir` nhận `live` mà không chuyển tiếp) — **vô hình ở lượt chạy thật**.
- **Bánh cóc sổ chặn**: `--write` từ chối mọi mục biến mất, **trừ** mục khai trong
  `local-net/console/chainid-released.json` (có tên người quyết + lý do). Thấy đỏ end-to-end
  bằng một sổ dò thật. `--self-test` 8/8, đã nối vào preflight.
- **Xoá sổ chặn** (David chốt): 49 chainId · 54 tên → **0**. An toàn vì replay chainId bị chặn
  **bằng kiến trúc** (g1 chỉ cấp `9001000000–9001999999`), lượt thả chỉ đụng nửa TÊN.
- **`chainid-test` mục 8** tách: cơ chế chạy trên **fixture**, tệp sống chỉ bị chấm **mạch lạc**.
- **`heartbeat-*` đã khai `knownExtra`** (David xác nhận là bộ bơm của anh) ⇒ mồ côi 4→0.
- **`console-chains.json.bak`** — console tự ghi ở `server.mjs:299` ⇒ khai là vật liệu chạy,
  **neo đúng tên đó**; mọi biến thể `.bak-*` vẫn phải ĐỎ, và độ hẹp đó **được đo**.

#### 🔴 GOTCHAS mới — thứ sẽ tốn giờ nếu không biết

1. 🔴 **Lệnh viết vào runbook mà chưa chạy thì chưa phải lệnh.** Tôi ghi `strings … | grep -c`
   vào phép nghiệm thu image; image **không có `strings`** ⇒ `grep -c` trên đầu vào rỗng in
   **`0`** ⇒ tiêu chí *"`g0` phải = 0"* **ĐẠT bằng ống gãy**. Nay dùng `grep -a` thẳng trên
   binary, **công cụ phải tự khai** (`command -v grep`) và chạy **hai ca đối chứng TRƯỚC** để số
   0 nghĩa là *không có* chứ không phải *không đo được*.
2. 🔴 **Bài đối chứng dùng hình dạng dữ liệu mà đường thật không bao giờ sinh ra thì vô giá trị.**
   `check-deploy-drift` đọc `khai.ly`, manifest khai `reason` ⇒ **mọi lời khai in `undefined`**
   từ ngày tính năng ra đời; self-test không bắt được vì nó **tự bịa** `{ ly: … }`.
3. 🔴 **`Array.map(fn)` truyền `(value, INDEX, array)`** — thêm tham số thứ hai vào một hàm đang
   được `map` trực tiếp là nhét index vào đó.
4. **Git Bash bẻ đường dẫn tuyệt đối** trong `docker run`: `/9chain-a1/build/…` →
   `C:/Program Files/Git/…`. Dùng `MSYS_NO_PATHCONV=1`, hoặc gửi qua `ssh` trong nháy đơn.
5. **`gen-chainid-issued --write` KHÔNG còn ghi mù** — nếu nó từ chối, gần như chắc chắn một sổ
   trong `docs/archive/` đã mất. **Khôi phục sổ, đừng ghi đè.**

#### Ba đỏ của lượt đầy đủ — đã kiểm ĐỎ VÌ ĐÚNG LÝ DO, đừng vá cho xanh

| cổng | đỏ ở đâu | hết đỏ khi nào |
|---|---|---|
| `watch-network` | tên mạng `g0` · networkID `999999999` · validator **10** · B-12 **12 ngày** | g1 lên |
| `check-deploy-drift` | 5 lệch · 1 thiếu — **tất cả** là console + faucet chờ deploy | deploy ở giờ G |
| `check-net-dirs` | 2 TRAP (**B-19**) + 1 **DECOY** `net-that-g0` | B-19 là việc David |

#### Việc tiếp — theo thứ tự chặn

1. 🔴 **David:** **B-16** · **B-19** — hai thứ duy nhất còn chặn GO/NO-GO mà không ai làm thay được.
2. ✅ ~~**Khối `07:09Z`:** chạy lại `bash scripts/h6b-backup.sh`~~ **XONG `06:19Z`** —
   bản `20260901-061904`, hai nơi, sáu phép nghiệm thu. 🔴 **Hết hạn lại nếu còn commit nào
   chạm `patches/ local-net/ upstream/ scripts/ web/ genesis/ 9chain-a1-config/` trước `down -v`**
   — `bash scripts/h6b-backup.sh --check` trả lời trong 3 giây, hỏi lại nó thay vì nhớ.
3. **Deploy console + faucet ở giờ G** — nhớ faucet phải ship **MÃ**, không chỉ `FAUCET_PK`
   (việc tay riêng, mới thêm). Console mang `chainid-released.json` + sổ rỗng.
4. **heartbeat:** dừng bơm trước `down -v` · gieo lại `heartbeat.json` cho g1 · thu hẹp mount
   `/→/hostfs` lúc dựng lại.

### 🆕🆕 Phiên `2026-08-31` (ĐÊM) — GIỜ G CHỐT · IMAGE ĐÃ LÊN SERVER · HAI LƯỢT TỔNG DUYỆT

**TL;DR:** Chỗ chặn cứng số 1 (image `:g1` không có trên server) **đã đóng, sớm hơn hạn 13 giờ**.
Giờ G chốt **`2026-09-01 13:09:09` Jerusalem**. Cổng đẻ chain **đã đóng** trên sản phẩm. Toàn bộ
đường sinh mạng đã chạy trót lọt **hai lần** — một ở băng TẬP, một ở băng THẬT. 19 commit,
`d9f636a` → `7595848`.

#### 🔴 GIỜ G — ba mặt đồng hồ (D-136d)

| Jerusalem (IDT, UTC+3) | UTC | Việt Nam |
|---|---|---|
| **`2026-09-01` 13:09:09** | **`2026-09-01` 10:09:09Z** | `2026-09-01` **17:09:09** |

Chọn mốc này vì nó nằm giữa **cửa sổ phủ nhiều người nhất**: quét từng phút suốt 50 giờ mà ngày
01/09 tồn tại, cân theo dân số 51 múi giờ ⇒ đỉnh là `10:00–11:00Z`, **phủ 99,999%**, bỏ lại
**~55.000 người**. Mốc `09:09:09 Jerusalem` từng chốt trước đó bỏ lại **59,2 triệu** (cả bờ Tây Mỹ).
🔴 **Không tồn tại khoảnh khắc nào cả thế giới cùng một ngày** — múi giờ trải 26 giờ, ngày có 24.

🔴 **GO/NO-GO ở `01/09 06:09Z` (VN 13:09):** image chưa trên server và chưa tự khai đúng `commit=`
⇒ **đừng bấm `down -v`**. Cổng đẻ chain đang ĐÓNG nên hoãn **không tốn gì cho người dùng**.

#### ✅ Ba chỗ chặn cứng của phiên trước — nay còn mấy?

| | |
|---|---|
| **1. Image `:g1` không có trên server** | ✅ **ĐÓNG** (D-137). `docker save\|ssh\|docker load` **30 giây**. Nghiệm thu **hai mỏ neo độc lập**: binary tự khai `commit=9chain-a1-g1-26patch-60a61707`, **và** grep nhị phân — `9chain-a1-g1` **4 lần**, **`9chain-a1-g0` 0 lần**, `LOVE9` 2 lần. Đo lại **trên chính máy chủ**, trùng khít bản dev. `:g0` vẫn còn ⇒ đường lui nguyên |
| **2. `open-p2p-all-nodes.py` 0 lần trong runbook** | ⏳ vẫn là việc tay #26 |
| **3. Nạp `chain-factory` X→P 0 dòng** | ✅ **ĐÓNG** (D-140) — xem GOTCHAS mới |

#### 🔴 Việc tay đã XONG mà preflight vẫn in ra (đừng làm lại)

- **#10 + #11 — bump `A1Gen`:** ĐÃ XONG TỪ TRƯỚC, **đo được chứ không tin**. Go `A1Gen=1` ·
  `A1Name="9chain-a1-g1"` · `A1NameTap="9chain-a1-tap-g1"`; JS `A1_GEN=1`; **patch `0026` CHÍNH LÀ
  lượt bump** và nằm trong bộ 26 đã công bố. Bằng chứng khép kín: cây fork
  `git rev-parse HEAD^{tree}` = **`60a61707…`** = `TREE_FORK`, **0 thay đổi chưa commit**.
- **#14 · #15 · #17 — build + ship + `--build-arg`:** ĐÃ XONG (D-137). **KHÔNG build lại** (D-128).

#### Đã làm trên SẢN PHẨM (máy chủ)

| | |
|---|---|
| **Cổng đẻ chain: ĐÓNG** (D-135) | `A1_DE_CHAIN_MO=1→0`, restart bằng `~/9chain-a1/console-restart.sh`, **PID đổi**. Nghiệm thu qua Cloudflare: `POST /console/api/create` ⇒ **400 kèm văn bản của chính cổng** (không phải 401/lỗi tên/hạn mức) |
| **Sổ chặn xuyên thế hệ** (D-135b) | `chainid-issued.json` **49 · 54** đã lên server, trùng byte. Kiểm **CHỨA TRỌN trước khi đẩy**, không phải "mới hơn thì thắng" |
| **Console** (D-136b) | 4 tệp lên server; 🔴 **cố ý GIỮ LẠI `lib/chainid.mjs`** (`A1_GEN 0→1`) — đẩy hôm nay là đặt console vào **lệch thế hệ vĩnh viễn**. Nó đi **cùng lượt bump ở giờ G** |
| Drift | `12 khớp · 7 lệch` → **`16 khớp · 3 lệch`** |

#### Đã làm trước `down -v` (KHÔNG phải làm lại ngày G)

- **O2** — xuất mạng g0 cuối cùng: P 29 · X 5 · **C 96.173** · 2 L1 · **14 tệp · 1,32 GB**, nằm ở
  `~/9chain-a1/o2-export-g0-20260831/`. Nghiệm thu **hai đường** (công cụ dự án 14/14 · `sha256sum -c`).
  🔴 **Neo đã công bố NGOÀI server** (git+GitHub): `4432d62a…7b63`, xem `docs/o2-g0-final/`.
- **H-6b** — **ĐẠT · 26 patch**, hai nơi, clone ngược khớp tree ở **cả dev lẫn máy chủ**.
- **Sổ chain** — `--pull` (không mất gì) → `--write` (49·54, không đổi) → `--compact` ra
  `docs/archive/console-chains-closed-g0-2026-09-01.json`, đóng dấu **đúng giờ G** (cờ `--at` mới).

#### Hai lượt tổng duyệt — một ở mỗi băng

| | Băng TẬP `899999998` (D-139) | Băng THẬT `999999998` (D-142) |
|---|---|---|
| `engrave-verify` | **17 đạt · 0 hỏng**, mục `[5] Mạng đang chạy` **có chạy** | vân tay + `extraData` y hệt |
| validator | 9/9 | 9/9, node1 thấy 8 peer |
| L1 đẻ thử | ✅ `chainId 9001000000` — **trong khối g1**, không phải g0 | — |
| 🔴 **Đường dẫn DB** | `9chain-a1-tap-g1` | **`9chain-a1-g1`** ⇦ **chỉ băng THẬT kiểm được** |

🔴 **Vì sao dòng cuối là phép đo quan trọng nhất:** đường dẫn DB **LÀ** tên mạng. Nó ra
`9chain-a1-g1` chứ **không** ra `network-999999998` ⇒ `A1Name` **có trong bản đồ binary**, tức
nhánh `FallbackHRP` (thứ patch 0013 sinh ra để diệt, và là triệu chứng của **binary thế hệ chết**)
**không bị đi vào**. Băng tập **không kiểm được điều này** vì ở đó tên khác.

Cả hai bộ đã **shred `-u -n 3`** (**38 tệp khoá**) và **xoá thư mục**, đối chứng 0 còn lại.

### 🆕 Phiên `2026-08-31` (chiều→tối) — BA LƯỢT QUÉT · DIỄN TẬP g1 · BỘ KHẮC CHỮ SẴN SÀNG

**TL;DR:** David yêu cầu quét kỹ trước testnet 1, ba lượt. Kết quả: **cổng 14 → 20** (một bộ đối
chứng **đã ĐỎ suốt một ngày** mà preflight không chạy), **việc tay 25 → 36**, và **byte chữ khắc
TÌM ĐƯỢC** — điều kiện qua số 2 hết chặn. Mười commit: `a8e3e93` → `f6f768c`.

🔴 **Thứ quan trọng nhất phiên sau phải biết: ba chỗ chặn cứng ngày G, không cái nào từng được ghi
ở đâu.** Chúng không lộ ra từ đọc mã — chúng lộ ra từ **chạy thật** và **đo server**.

#### 🔴 BA CHỖ CHẶN CỨNG NGÀY G

**1. Image `:g1` KHÔNG có trên server, và server KHÔNG dựng lại đúng được.**
Đo `31/08`: server có `:g0` · `:dev` · `:regen9` · `:next` + 2 bản cũ — **không có `:g1`**. Tệ hơn:
`~/9chain-a1/src/upstream/avalanchego` trên server là **ảnh chụp KHÔNG phải git repo, vẫn ở
`A1Gen 0` / `A1Name "9chain-a1-g0"`**, không `.git`, không `patches/`. Build ở đó ⇒ **binary thế hệ
chết mang nhãn `:g1`**. Node boot với `--network-id=999999998` trên binary chỉ biết `999999999`:
`NetworkName()` rơi xuống `network-999999998` (**sai đường dẫn DB**), `GetHRP()` sống bằng
`FallbackHRP` — đúng nhánh patch 0013 sinh ra để xoá. Nó **có** bị bắt (`watch-network`, cổng thế hệ
console) — nhưng **sau khi `down -v` đã xoá g0**.
⇒ `docker save` trên dev → `docker load` trên server → **đo `--version` TRÊN SERVER**, đòi
`commit=9chain-a1-g1-26patch-60a61707`. Đó mới là *"binary đã diễn tập = binary đang chạy"* (D-128).

**2. `open-p2p-all-nodes.py` xuất hiện 0 lần trong runbook ⇒ KHÔNG người ngoài nào validate được.**
netgen `ipv4port` chỉ cho **beacon** khai địa chỉ công khai (patch 0024/D-089). D-118b **đã đo cái
giá**: node ngoài học địa chỉ 8 node kia qua gossip, chúng khai `172.28.0.x` ⇒ với tới **1/9
validator (~11%)**; bootstrap đòi **80%**; stake đòi bootstrap ⇒ **vòng khép, không có đường ra bằng
cấu hình**. Ngày G: beacon + node9 Hetzner công khai, bảy node nội bộ ⇒ **~22%**, vẫn xa 80%.
⚠️ **Thứ tự quyết định:** lên mạng bằng mặc định netgen TRƯỚC (mesh hình thành qua địa chỉ nội bộ),
**rồi mới** mở cổng, recreate **từng node một**. D-089 đo mesh teo thành hình sao khi mọi node khai
IP công khai lúc **SINH** mạng; D-118c đo **không** teo khi làm với mesh đã có.

**3. Nạp ví `chain-factory` X→P — runbook có 0 dòng (`grep` = 0).**
Trên genesis mới, tiền thanh khoản mọi quỹ nằm trên **X-Chain**, CLI trả phí trên **P-Chain**. Đo
trên mạng tập: Foundation `71.000.009` trên X, **`0` trên P**. Quên ⇒ console lên xanh và **người
đầu tiên bấm nút nhận `insufficient funds`**.

Ba việc tay nhỏ hơn cùng loại: **`A1_CONFIG_DIR` khai tường minh** (mặc định `../../9chain-a1-config`
sai với bố cục server ⇒ **mọi lượt đẻ chain chết**, node vẫn 9/9 xanh) · **`--build-arg A1_COMMIT=`**
(tiêu chí nghiệm thu image trước đó **không thoả được từ runbook** — `A1_COMMIT` chỉ tồn tại ở
`Dockerfile:24`) · **`gen-chainid-issued --write`** chèn giữa `--pull` và `--compact`.

#### ✅ BỘ KHẮC CHỮ — SẴN SÀNG, VÂN TAY ĐÃ ĐÓNG BĂNG

Byte **tìm được**, nằm inline trong CR của C1
(`9Chain-C1/9chain-operator/config/samples/chain_love9.yaml` dòng 611–617), rút ra `docs/engrave/`
dạng **`body as-is`** — không NFC/NFD, không thêm bớt xuống dòng. Tái lập **đúng cả 4 hash đóng băng
`07/08`**, kiểm hai lần bằng hai công cụ.

| tài liệu | byte | mặt |
|---|--:|---|
| `genesis_inscription` (Hebrew) | 108 | `p` |
| `dedication` (Adam) | 25 | `p+c` |
| `dedication_eva` (Eva) | 45 | `p+c` |
| `love_paper_en` | 964 | `p+c` |

**Tổng 1.142 byte — NHỎ HƠN bản tập `1.328 B`** ⇒ đường ống đã kiểm ở đúng cỡ. *(LOVE Paper là
**964 byte**, một trang; nó bị rút từ `5.854 B` xuống lõi bất biến ngày `2026-08-13`.)*

```
A1_ENGRAVE_CONFIRM=f04e939b58e58db46714047978b989cb167cf5f8875bcb4e4ad2563ebd366b18
cChainAddress     =0x9000000000000000000000000000000000000009   (David chốt)
```

🔴 **Vân tay dùng được cho ngày G**: `loadEngraving()` **không nhận networkID**, `engraveRoot` chỉ
băm `version + địa chỉ + (id, lang, mặt, sha256)`. Lượt băng TẬP ra đúng con số lượt băng THẬT.

**David chốt: BỎ `ASV 1901`** — nó chưa có hash trong freeze của C1, nên netgen sẽ **chặn** nếu đưa
vào. Và A1 tự đóng băng nó là để cổng so A1 với chính A1 (**D-112**).

⚠️ **Địa chỉ khắc chữ KHÔNG phải ví của ai — đó là TÍNH CHẤT.** Đã kiểm: coreth có `ErrSenderNoEOA`
(EIP-3607) ⇒ không gì gửi được giao dịch **từ** tài khoản có `code`; địa chỉ có **0 ký tự `a-f`** ⇒
EIP-55 là phép rỗng, không chép sai kiểu chữ được; ngoài vùng precompile và ngoài `0x0200…`; netgen
từ chối sinh mạng nếu trùng địa chỉ quỹ. 🔴 **Nhưng tiền gửi vào đó CHÁY vĩnh viễn** — phải công bố
kèm câu đó ở mọi nơi địa chỉ xuất hiện.

#### Cổng: 14 → 20, và một bộ đối chứng đã ĐỎ suốt một ngày

🔴 **`check-net-dirs --self-test` ĐỎ từ lượt bump `A1Gen 0→1` (`30/08`)** — một ca cắm cứng
`999_999_998` làm *"thế hệ SAU"*, mà số đó **thành networkID SỐNG** ở lượt bump. Đúng lớp **D-124**,
một tệp xa hơn. Ẩn được vì preflight chỉ chạy **7/15** bộ tự kiểm. Nay nối thêm **6**.

Sáu thứ khác, mỗi cái là *"đo sai đại lượng"*:

| | |
|---|---|
| `check-clock-skew` | đo **đồng hồ của Cloudflare**, không phải của node (`server: cloudflare`, `cf-ray …-CDG`). Nay đọc `block.timestamp` — giá trị **do node sinh**. Số đầu: node **−1569ms** vs CF **−952ms**, node ở **chiều nguy hiểm**; bù `3000 → 3025` |
| `h6b-backup --check` | **mù hoàn toàn với cây fork** — `.gitignore` có `upstream/` ⇒ `git ls-files upstream` = **0**. `manifest.env` đã ghi sẵn `FORK_TREE` mà `doc_manifest()` vứt đi. Nay so thật |
| `console/index.html:302` | in **id preset** thay vì tên (`.ten`, khoá chết từ D-108) — cùng tàn dư D-129, không sang tới trang của chính console |
| `guard.mjs` `requireInt` | `Number(env hoặc mặc định)` biến typo thành `NaN`, mọi phép so với `NaN` là false ⇒ `A1_MAX_L1=fifteen` **xoá sạch trần 15 L1** |
| faucet | cooldown địa chỉ nay kiểm **trước** khi tiêu suất IP; `lastDrip` có bộ quét |
| `export-chain` | đứt giữa chừng nay tính là **CẮT**; `tip.json` ghi `blocksExported`/`complete` |

#### Diễn tập g1 — và thứ KHÔNG diễn tập được

Băng TẬP `899999998`, 3 node, image `:g1`. **Đường khắc chữ trong tài liệu chạy được lần đầu tiên
trong repo** (`/repo` mount; trước đó `A1_ENGRAVE` là đường dẫn host, **không tồn tại trong
container**, và không thư mục `net*` nào có `engraving.md`). `engrave-verify` trên chain SỐNG:
**15 đạt · 0 hỏng**, có mục `[5] Mạng đang chạy`, `parentID` block 0 P-Chain `==`
`sha256(genesisBytes)`. Block Adam ở thế hệ 1: **10 đạt · 0 hỏng**, gồm phép **neo ngược**.
Gotcha 16 tái hiện đúng D-105 (`image: :dev` ×3).

⛔ **Console đẻ L1 KHÔNG diễn tập được trước ngày G** — cổng thế hệ so node với
`NETWORK_ID = A1_ID_GOC − A1_GEN` (băng THẬT), **không có biến thể băng TẬP**, nên trước mạng tập
nó **từ chối theo kiến trúc** (đã kiểm ở tầng API, không chỉ banner). Cổng làm **đúng việc** (D-093)
⇒ đường đẻ chain chỉ kiểm được **trên g1 thật**. Đẻ **một** L1 rồi thu hồi, **trước khi công bố**.

🔴 **Diễn tập tìm ra: cổng đối chiếu C1 của netgen KHÔNG bắt được manifest gán nhầm tài liệu** —
đúng ca câu lỗi của chính nó mô tả. Nó neo bằng `Contains(dòng, tên_tệp)` **hoặc** `Contains(dòng,
id)`, mà `file` là trường một lượt gán nhầm sẽ đổi. **Freeze của C1 (dạng `title  hash`, không có
tên tệp) vá lỗ này** — chỉ `id` neo được. ⇒ Đặt `id` manifest **trùng `title` C1**, tệp `<id>.txt`,
**đừng đặt trần `<id>`** (`dedication` là chuỗi con của `dedication_eva`).

#### Hai ví số đẹp — `local-net/tools/vanity-keygen/`

| ví | địa chỉ | tìm trong |
|---|---|---|
| `chain-factory` (P-Chain — nơi nó tiêu tiền) | `P-love91999h0q4ucfnex9q0qxefuu0ke0xtyvl6739999` <!-- stale-ok: ví này ĐÃ NGHỈ 02/09 (D-159); dòng kể lượt mài 31/08 --> | 52m36s · 1,19 tỷ |
| `faucet` (EVM — nơi người dùng nhìn) | `0x90001e27808F4aAa9FF672f5714476EB8E3f0009` | 1h14m45s · 1,34 tỷ |

Khoá ở `C:\Users\abc\9chain-a1-keys\g1\` (chmod 600) — **chưa ví nào có tiền**.
<!-- 🔴 ĐÍNH CHÍNH 2026-09-01 08:00Z: "(chmod 600)" SAI — `chmod` là lệnh RỖNG trên NTFS qua Git
     Bash. Đo: mọi tệp khoá ở CẢ `g0` lẫn `g1` đều `-rw-r--r--`, và `chmod 600` chạy exit 0 mà
     không đổi gì. ACL thật (`icacls`) chỉ cấp SYSTEM · Administrators · DAVIDDO\abc ⇒ KHÔNG
     phải lỗ hổng trên máy này, nhưng câu trên khai một lớp bảo vệ KHÔNG TỒN TẠI. Muốn quyền
     thật trên Windows phải dùng `icacls`, không phải `chmod`. Cùng họ với lỗi ống gãy: lệnh
     chạy, exit 0, và không làm gì. -->
Log tạm trong
`%TEMP%` đã `shred -u -n 3` ngay trong phiên tạo ra chúng. `check-key-leaks` mốc so **7 khoá/2 nguồn
→ 9 khoá/4 nguồn**: nay **mọi `*-key.txt` trong thư mục thế hệ tự vào mốc**, thôi khai tay.

⚠️ **Sáu ví quỹ genesis KHÔNG làm số đẹp được** — netgen đúc chúng trong `newFund()` ⇒ sửa
`patches/`. Ví faucet làm được vì **`FAUCET_PK` là biến môi trường, không phải sự thật genesis**.

#### GOTCHAS mới

23. 🔴 **Công cụ ghi kết quả vào `%TEMP%\*.log` là hình dạng D-117.** Lượt tìm khoá ghi khoá riêng
    vào đúng thư mục `check-key-leaks` sinh ra để canh. Dời vào kho khoá + `shred` **trong chính
    phiên tạo ra nó**, đừng để sang phiên sau.
24. 🔴 **`latest` trên một chain chưa có block nào là GENESIS với `timestamp 0`.** `check-clock-skew`
    trả *"không đo được"* thay vì khai lệch 55 năm — đúng, nhưng nghĩa là **phải mở block 1 trước**
    (một giao dịch chuyển tiền thường, 21000 gas cố định — luật M5.4).
25. 🔴 **Trên chain nhàn rỗi, TUỔI BLOCK áp đảo phép đo lệch đồng hồ.** Block ~10s tuổi cho
    `−10136ms ± 501ms`, gần như toàn bộ là tuổi block. ⇒ B-13(b) phải đo **lúc chain đang đẻ block**.
26. **Repo A1 sạch trên trục blockchainID** — không ID sống nào cắm cứng, và `cb58.mjs` nay neo vào
    P-Chain ID (`ids.Empty`, giống nhau ở mọi mạng Avalanche) ⇒ **sống sót qua re-genesis**. Rủi ro
    còn lại nằm **ngoài repo**: 9Scan-A1 và worktree `web`.

#### Số đo cuối phiên

```
preflight --no-network   20 đạt · 0 đỏ · 0 không chạy được · 4 bỏ qua · 36 việc tay
h6b --check              ✓ xanh (fork tree 60a61707f797 khớp — phép so MỚI)
check-key-leaks          exit 0 · mốc so 9 khoá / 4 nguồn
nợ ngôn ngữ              5.753 → 5.750
sổ console trên server   🔴 2 SỐNG — `Eric1` #9000000010 · `eric1` #9000000011 (đo lại 13:40 UTC)
mạng g0                  10 validator · 9 peer · factory 89,899 LOVE9 · B-12 còn 12 ngày
```

#### Việc tiếp — theo thứ tự chặn

1. 🔴 **David:** `docker save`/`load` image sang server · **B-16** (hôm nay là cửa sổ **rủi ro bằng
   không** — bộ g0 bị vứt ngày mai) · **B-19** · **B-20** (gói `h6b` **vừa dựng**, qua cả bốn phép
   nghiệm thu của chính nó, chứa **0 `staker.key` · 0 `signer.key` · 0 `genesis.json`** — **đếm tệp**
   mới là phép đo, đọc dòng `--check` thì không)
2. 🔴 **David:** GitHub repo rỗng (5 phút, mở khoá điều kiện **4 + 5**) · báo **D-132** cho C1 + BOD
   (họ có thể đang chờ giao ASV theo chiều cũ)
3. **A1:** ✅ ~~dịch `CREATE-A-CHAIN`~~ **XONG** — bản **EN** giữ tên gốc và là **nguồn dịch** cho
   29 thứ tiếng; VI dời sang `.vi.md`/`.vi.pdf`. Cả hai nay có cảnh báo *"chain tạo trước `01/09`
   sẽ bị XOÁ"* — tài liệu cũ hứa *"một blockchain của riêng bạn"* mà không nói mạng sắp dựng lại.
   ✅ **PDF tiếng Anh đã sinh** — 5 trang A4, và đường sinh nay là **một lệnh tái lập được**:
   `node scripts/build-doc-pdf.mjs <file.md> [--counter-check]` (lượt trước dựng tay và **không
   giữ lại HTML**, nên chỉ tái lập được từ một ghi chú trong `HANDOFF`). · còn nợ: cấp số quyết
   định cho các phát hiện phiên này (mới có **D-132**)
4. **Sau ngày G:** tổng quát hoá `verifyAgainstC1` → *"đối chiếu với CANON"* (D-132 §4) · điền **11
   chỗ `FILL-ON-G-DAY`** trong `docs/RUN-A-VALIDATOR.md` (cổng xuất bản: `grep -c` phải `= 0`)

🔴 **Khuyến nghị còn nguyên: TÁCH ngày G thành hai sự kiện.** `01/09` sinh lại g1 + khắc chữ — phần
**mã** đã sẵn sàng. **Mở công khai** khi xong điều kiện 4 & 5, vài ngày sau, vẫn trong hạn `06/09`
của Block Adam. Mở cửa mà người lạ không clone được, không có `RUN-A-VALIDATOR.md` điền xong, không
có genesis + bootstrap công bố thì đó là **một RPC công khai**, không phải một testnet công khai.

### 🆕 Phiên `2026-08-31` — MẶT NGƯỜI DÙNG: sửa 3 lỗi trên đường sản phẩm, và soát tổng trước ngày G

**TL;DR:** David đi thử **đúng đường một user thật** (`/create-chain/`) và đường đó gãy ở ba
chỗ, cả ba đã sửa + nghiệm thu trên sản phẩm. Soát tổng cuối phiên: theo **điều kiện qua của
chính dự án** (`TESTNET1-PUBLIC` §4), ngày `01/09` đang đạt **1/5** — và thứ chặn phần lớn
**không phải mã**. Bản đầy đủ: artifact *"Hiện trạng trước giờ G"*.

#### Ba lỗi trên đường sản phẩm — đã sửa

| lỗi | gốc rễ | nghiệm thu |
|---|---|---|
| **Ô chọn loại chain hiện 6 dòng TRỐNG** | web đọc `p.ten`/`moTa`, console trả `{id,name,desc}` — tàn dư lượt đổi id preset sang tiếng Anh (D-108) **không nối sang web** | bundle công khai nay `children: e.name` · `"chuan"` **0 lần** |
| **Cổng đẻ chain ĐÓNG** | D-087, đúng thiết kế | David chốt **mở hẳn tới ngày G**; console tự khai `đẻ chain: 🔓 MỞ` |
| 🔴 **`A1_PUBLIC_RPC_BASE` trỏ tên miền CHẾT** | biến trên server khai `rpc-testnet-a1.9chain.org` (**525**) | sửa → `rpc-a1.9chain.org` (**200**) |

🔴 **Lỗi thứ ba là thứ suýt làm hỏng đúng việc David sắp làm:** console dùng biến đó dựng URL
RPC **trả cho người vừa tạo chain**. Chain sẽ chạy thật, nhưng người dùng nhận một địa chỉ RPC
chết — dán vào MetaMask không bao giờ nối được. Nó nằm trong **biến môi trường trên server**,
không phải mã trong repo, nên **không cổng nào canh**. `server.mjs` có sẵn dòng dặn đặt đúng
tên; biến *có* được đặt, chỉ là đặt tên cũ.

⚠️ **Đã đụng worktree web** (vượt luật cứng #4) theo yêu cầu David, sau khi đo worktree sạch.
Commit `7ac2ada` trên `web-home`, đã `web-deploy.sh` (7/7 liên kết sống). Console restart bằng
`~/9chain-a1/console-restart.sh` (PID mới 751090 ≠ cũ 145971).

#### 🔴 Khoá `A1_CLI_KEY` đã LỘ trong transcript — việc bắt buộc cho ngày G

Lệnh đo env tiến trình console của A1 lọc thiếu: che `TOKEN=`/`PK=` nhưng **không** che
`A1_CLI_KEY`. Khoá ví `chain-factory` (giữ ~90 LOVE9 **testnet**) in ra dạng rõ. Thiệt hại kinh
tế **bằng 0**, nhưng: **ngày G PHẢI sinh khoá factory mới** — trước đây là *nên* (D-117b), nay
là *bắt buộc*. ⇒ Đừng in `/proc/<pid>/environ` của console nữa; nếu cần, lọc theo **danh sách
trắng tên biến**, không lọc theo mẫu.

#### Số đo cuối phiên `2026-08-31`

```
preflight đầy đủ    15 đạt · 3 đỏ · 0 không chạy được · 24 việc tay
drift               17 khớp · 2 lệch (chainid*, do repo ở g1) · 3 mồ côi heartbeat-*
check-net-dirs      🔴 2 tệp giữ TIỀN THẬT ngoài thư mục thế hệ sống (B-19)
h6b-backup --check  🔴 "bản sao lưu không còn tả được mạng đang chạy"
mạng g0             10/10 validator · sống
```

#### 🔴 Điều kiện qua `01/09`: **1/5** — và rủi ro số 1 tránh được bằng MỘT quyết định

| # | điều kiện | trạng thái |
|---|---|---|
| 1 | preflight exit 0 | 🔴 3 đỏ + **24 việc tay chưa tick** |
| 2 | g1 sống, chữ khắc đọc ngược được | 🔴 **cơ chế 13/13 xong, BYTE CHƯA TỒN TẠI** |
| 3 | node NGOÀI máy chủ là peer | ✅ đạt |
| 4 | repo công khai, người lạ dựng lại được fork | 🔴 cây fork sẵn sàng, **chưa có GitHub** |
| 5 | genesis+bootstrap công bố + tài liệu validator | 🔴 `RUN-A-VALIDATOR.md` **chưa tồn tại** |

🔴 **Rủi ro cao nhất: ngày G có thể mất lý do tồn tại.** Khắc chữ là lý do chính để bỏ `g0`
đang chạy tốt. Không có byte ⇒ trả **toàn bộ** chi phí re-genesis (mọi blockchainID đổi, mọi ví
về 0, mọi L1 biến mất) để nhận về một mạng **giống hệt cái vừa xoá**. Ba đường: đóng băng byte ·
chấp nhận g1 không chữ khắc · **dời ngày G**. `g0` không có gì buộc phải chết ngày 01/09.

#### Việc A1 làm được ngay — phiên sau bắt đầu từ đây

1. `docs/RUN-A-VALIDATOR.md` (**G-2**, điều kiện qua số 5) — chưa ai nhận từ `29/08`.
2. `bash scripts/h6b-backup.sh` — cổng đang **đỏ**.
3. Ghi `DECISIONS.md` cho 3 thay đổi phiên này (D-129…): web preset · mở cổng · RPC base.
4. Soạn gói công bố **genesis + bootstrap** (chờ GitHub repo của David mới push được).
5. Dịch `docs/CREATE-A-CHAIN.md` sang tiếng Anh (bản gốc để dịch 29 thứ tiếng còn lại).

#### Việc CHỈ David làm được — xếp theo độ trễ

1. 🔴 **Quyết về byte chữ khắc** — mọi thứ khác phụ thuộc.
2. **Tạo GitHub repo rỗng** + cấp quyền — 5 phút, mở khoá **hai** điều kiện qua.
3. 🔴 **B-16** bản sao khoá quỹ sang **máy tính thứ hai** — chặn GO/NO-GO, cần phần cứng.
   Bộ khoá g0 bị bỏ ngày G ⇒ hôm nay là cửa sổ tập **rủi ro bằng không**.
4. 🔴 **`heartbeat-*` là của ai** — sau `down -v` mất manh mối.
5. **B-19** dời khoá giữ tiền khỏi thư mục "đồ chết" TRƯỚC mọi lượt dọn.
6. B-17 (6 tệp `.bak`) · PR chainId · báo 9Scan-A1 + worktree web sửa số thế hệ chết.

#### GOTCHAS mới của phiên này

1. 🔴 **Cấu hình sản phẩm nằm ở BIẾN MÔI TRƯỜNG TRÊN SERVER là điểm mù của mọi cổng.**
   `A1_PUBLIC_RPC_BASE` trỏ tên miền chết nhiều ngày: repo đúng, `check-deploy-drift` xanh cho
   nó (drift so **tệp**, không so **env**), và triệu chứng chỉ lộ ra ở tay người dùng cuối.
   ⇒ Thêm phép đo env server vào runbook, đừng chỉ so tệp.
2. 🔴 **`heartbeat.json` KHÔNG phải rác — trang chủ đọc số đo từ nó** (`/chains/data/heartbeat.json`).
   Suy đoán trước đó (*"bộ bơm giao dịch"*) mới đúng một nửa. Sau `down -v` mà không dựng lại
   thì **trang chủ in số của mạng đã chết**, 200 và không cổng nào bắt.
3. 🔴 **Explorer công khai `a1.9scan.org` khai endpoint bằng tên miền CŨ** ⇒ mọi số rỗng
   (`LATEST BLOCK —`). NetworkID nó in thì **đúng**, nên lỗi không lộ ở chỗ dễ thấy. Người lạ mở
   explorer sẽ kết luận mạng chết trong khi mạng chạy 10/10.
4. **Lọc bí mật phải theo DANH SÁCH TRẮNG tên biến**, không theo mẫu chuỗi — xem mục khoá lộ.
5. **In PDF từ HTML: khối `<details>` đóng thì KHÔNG được in ra.** Bảng thông số mạng suýt biến
   mất khỏi bản PDF phát cho người dùng — mất đúng hai giá trị tài liệu sinh ra để trao.
   Kèm: `break-inside: avoid` trên mỗi bước đẻ ra trang trắng (9 trang → 7 sau khi nới).

#### Lệnh hữu ích (phiên này thêm)

```bash
# Mặt web (worktree C:\PROJECTS\9Chain-A1-web, nhánh web-home)
cd C:/PROJECTS/9Chain-A1-web && npx --prefix web tsc --noEmit
cd C:/PROJECTS/9Chain-A1-web/web && npm run build
cd C:/PROJECTS/9Chain-A1-web && bash local-net/deploy/web-deploy.sh   # tự nghiệm thu 7 liên kết

# Console trên server — KHỞI ĐỘNG LẠI ĐÚNG CÁCH (tự chứng minh PID mới ≠ PID cũ)
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" '~/9chain-a1/console-restart.sh'

# Console tự khai trạng thái cổng đẻ chain (đừng đoán từ mã)
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'grep "đẻ chain" ~/9chain-a1/console.log | tail -1'

# Đo bundle CÔNG KHAI thay vì tin bước deploy
curl -s https://a1.9chain.org/create-chain/ | grep -oE '/_next/static/chunks/app/create-chain/[^"]*\.js'

# Xuất PDF từ một trang HTML (giữ nguyên thiết kế)
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu \
  --virtual-time-budget=20000 --no-pdf-header-footer --print-to-pdf=out.pdf "file:///duong/dan.html"
```

#### Tài liệu phiên này tạo

- [`docs/CREATE-A-CHAIN.vi.md`](docs/CREATE-A-CHAIN.vi.md) + [`docs/CREATE-A-CHAIN.vi.pdf`](docs/CREATE-A-CHAIN.vi.pdf) *(đổi tên `31/08`: bản **tiếng Anh** nay giữ tên gốc `CREATE-A-CHAIN.md` và là **nguồn dịch**)*
  — hướng dẫn cho user mới hoàn toàn, 7 trang A4, phát được cho người ngoài.
- Artifact *"Chain đầu tiên của bạn"* (bản web của tài liệu trên) và *"Hiện trạng trước giờ G"*
  (bản soát tổng 5 điều kiện qua + kế hoạch). Link trong lịch sử phiên `31/08`.

### 🆕 Phiên `2026-08-30` — DIỄN TẬP g1 (máy dev, băng TẬP `899999998`)

**David chốt hôm nay:** diễn tập hôm nay, có thể thêm một lượt `31/08` trước ngày G. Và **hai
quyết định đổi hướng ngày G** — cả hai từ số đo, không từ ý muốn:

| | David chốt `30/08` | vì sao |
|---|---|---|
| **`N=9`**, Hetzner **THAY** một node OVH | **D-126** | D-122 lật D-046 mà không mục nào ghi là đang lật. Chỉ `N=9` cho self-bond **`999.999`** LOVE9/node (`8.999.991 = 9 × 999.999`), và số đó vào genesis **bất biến**. netgen cảnh báo ở **mọi** lượt `N=10` — cảnh báo đó bị đọc lướt suốt |
| **giữ `A1_STAKING_PORT_BASE` mặc định `9651`** | **D-125** | bẫy `9660` **không tồn tại** (đo, xem dưới). `ufw 9651` đã mở, tài liệu công khai đã nói `9651` |

🔴 **`A1Gen` NẰM TRONG bộ patch (0018) ⇒ bump thế hệ LÀ sửa `patches/`** (**D-123**). Bump ở cây
làm việc mà quên sinh lại bộ patch thì image ngày G **đúng**, còn bộ patch **công bố** vẫn khai
`A1Gen 0`: người ngoài build ra binary của **thế hệ đã chết**, không join được — mà cổng
fork-tree **xanh suốt** và điều kiện qua số 4 của `01/09` cũng xanh. Không tài liệu nào từng nối
hai thứ này. ⇒ Đã sinh lại: **26 patch · tree `f2b9486b` → `60a61707`**, đối chứng **25/26 →
`f2b9486b`**. Bộ 25 patch cũ chỉ đổi dòng đếm `[PATCH nn/25→26]` (**50 dòng, 0 dòng nội dung**).

🔴 **Hai cổng cắm cứng thế hệ 0 ⇒ mù đúng vào ngày bump** (**D-124**). `check-consistency`
**5/14** ca đối chứng ngược ngừng bắt được — và đó đúng là năm cách hỏng của ngày G (*bump JS
quên Go* · *bump Go quên JS* · *quên `A1Name`* · *khối chainId giữ nguyên* · *console mang
networkID thế hệ trước*). `chainid-test` thì **ĐỎ GIẢ**. Đã sửa cả hai sang **lệch tương đối**;
14/14 và 36/36 xanh lại, có đối chứng ngược cho chính bản vá.

🔴 **Phép nghiệm thu trong `GDAY-NODE10-HETZNER.md` SAI** (**D-127**): nó đòi
`grep -c -- "--public-ip=<IP>"` **= 10**; đo thật là **1**, và **1 mới đúng** (chỉ beacon khai IP
công khai — patch 0024/D-089). Dòng cũ báo "hỏng" cho một mạng **đúng**, và cách sửa hiển nhiên
là tái lập chính thiết kế mà diễn tập của nó đã bác. Đã sửa tài liệu + thành việc tay riêng.

**Số đo (D-128 có bảng đầy đủ):** image `9chain-a1/node:g1` build **exit 0**, binary tự khai
`commit=9chain-a1-g1-26patch-60a61707` · `supplyCap 7900000001000000000` · `eth_chainId
0x218711a09` · `LOVE9` giải được, **`AVAX` đỏ có lý do** · chữ khắc `engrave-verify` **13 đạt ·
0 hỏng** (đọc ngược từ chain sống, cả hai lượt) · hình dạng ngày G `N=9`: node9 chạy **ngoài
compose**, bootstrapped P/X/C, nodeID **khớp genesis**, `getCurrentValidators` = **9**, node
**không phải beacon** thấy nó, cửa sổ hạn **56 ngày** offset **7 ngày**.

🔴 **Image `9chain-a1/node:g1` DÙNG LẠI ĐƯỢC NGÀY G** — binary không phụ thuộc byte chữ khắc.
Bước dài nhất của ngày G đã đẩy ra khỏi ngày G. **Đừng xoá image này.**

⏱️ **Con số đáng nhớ nhất:** node ngoài bootstrap ở **~50s**, nhưng node **không phải beacon**
chỉ thấy nó ở **~70s**. Chấm điểm ở mốc 30s là khai một sự cố không có thật.

⚠️ **Giới hạn phải khai:** node ngoài chạy trên **cùng máy dev**, nên rào cản mạng giữa **hai máy
vật lý** không được mô phỏng. Lượt này **không thay thế** phép đo với Hetzner —
`ingressConnectionCount` (D-121) vẫn phải đo ở đó.

⚠️ **Bẫy phép đo mới:** `engrave-verify --rpc` qua `host.docker.internal` ⇒ **403 "invalid host
specified"**. Đó là bộ lọc `Host` của M11.10 **làm đúng việc**, không phải chữ khắc hỏng.

**Đã dọn ngay trong phiên (D-107):** `a1tap-node-1/2/3` + 3 volume · `net-probe-portbase`
(22 tệp khoá) · `net-tap-g1` (20 tệp khoá) — `shred -u -n 3`, đối chứng `find` ⇒ 0 tệp.
`check-key-leaks.mjs` ⇒ **exit 0**. 49 container của dự án khác **không đụng tới**.

**Số đo cuối phiên — lượt ĐẦY ĐỦ có mạng:** **15 đạt · 3 đỏ · 0 không chạy được · 24 việc tay**.

🔴 **BA ĐỎ NÀY LÀ ĐỎ DỰ KIẾN TỚI NGÀY G — đã kiểm từng cái đỏ VÌ ĐÚNG LÝ DO. Đừng vá cho xanh.**

| cổng | đỏ ở mục nào | vì sao đó là ĐÚNG |
|---|---|---|
| `watch-network` | tên mạng `9chain-a1-g0` (repo mong `g1`) · networkID `999999999` (mong `999999998`) | **hệ quả trực tiếp của bump.** Repo tả `g1`, mạng sống là `g0`. Hết đỏ **đúng lúc** mạng g1 lên |
| | số validator **10** (mong 9) | hệ quả lượt stake D-119 + D-126 nay chốt `N=9`. Hết đỏ ở ngày G |
| | B-12 · hạn sớm nhất **13 ngày** (`2026-09-12`) | validator thứ 10 stake-sau, hạn 14 ngày. **Nó chết cùng mạng g0 ngày G** ⇒ không phải rủi ro thật, **trừ khi ngày G trượt**. Mạng g1 đo được cửa sổ **56 ngày** |
| `check-deploy-drift` | **2 lệch**: `local-net/lib/chainid.mjs` · `local-net/console/chainid-test.mjs` | đúng **hai tệp vừa bump**. Hết đỏ khi console g1 được deploy (đã là việc tay) |
| | **3 mồ côi** `heartbeat-*` | **G-6, việc của David** — xem dưới |
| `check-net-dirs` | **B-19** | không đổi, việc của David |

🔴 **G-6 có thêm manh mối, chưa phải câu trả lời.** Ba tệp mồ côi nay đọc được tên đầy đủ:
`9chain-a1-config/heartbeat.json` · `local-net/faucet/heartbeat-pump.mjs` ·
`local-net/faucet/fund-heartbeat-wallets.mjs`. Tên tự khai đây là **bộ bơm nhịp sống 9 tx/s**,
và **nguồn của nó không nằm trong repo này**. ⇒ Sau `down -v` nó sẽ bơm vào một chain **đã chết**
bằng ví **thế hệ cũ**. Vẫn cần David nói nó đến từ đâu — **đừng khai vào `knownExtra` cho xanh**.

### 🆕 Phiên `2026-08-29` (chiều) — SOÁT CHỖ HỞ NGÀY G

**Câu David hỏi:** *"còn cần làm gì cho ngày G1, có cần diễn tập chạy lại chain nữa không?"*

**Kết quả: 17 việc tay của preflight đều ĐÚNG và xếp đúng thứ tự — vấn đề nằm ở thứ KHÔNG có
trong đó.** Soát ra **7 chỗ hở**; **5** đã đưa **thẳng vào `MANUAL_TASKS`** (17 → **22**), vì
danh sách việc tay là thứ **duy nhất chặn được** ngày G — tài liệu là nơi người ta *định* đọc.
Bản đầy đủ: [`docs/GDAY-G1-GAPS.md`](docs/GDAY-G1-GAPS.md).

| | chỗ hở | ai |
|---|---|---|
| G-1 | **B-20** sao lưu danh tính 10 validator của g1 — B-20 tự khai *"phải làm LẠI"* mà không việc tay nào nhắc | A1 + David |
| G-2 | 🔴 **`docs/RUN-A-VALIDATOR.md` KHÔNG TỒN TẠI** (đo `ls docs/`) — mà nó là **điều kiện qua số 5** của `01/09` | **A1, chưa làm** |
| G-3 | công bố `genesis.json` + bootstrap của g1 **qua repo GitHub**, không qua `web/` | A1 + David |
| G-4 | việc tay cũ dừng ở chữ *"sinh"* token mới — chưa ai nói **đưa lên server**; faucet dính gotcha 3 | David |
| G-5 | `main:web/lib/chain.ts` còn `networkId: 9001` (**lệch 2 thế hệ**) · blockchainID C/X chết theo re-genesis | worktree khác |
| G-6 | `heartbeat-*` **không có nguồn trong repo** (grep toàn repo chỉ trúng bản ghi về chính nó) | **David** |
| G-7 | 🟡 `check-chainid.mjs:54` chép cứng gốc dải — **hôm nay KHÔNG sai** (quét cả không gian, phủ trọn khối g1). **Đừng sửa trước ngày G** | sau |

🔴 **DIỄN TẬP: CÓ, và đề xuất `31/08` (không phải 30/08).** Năm thứ **chưa từng chạy** đang được
xếp vào đúng ngày G, **sau `down -v`**: `A1Gen 1` ở bất cứ đâu · netgen `N=10` (xung đột cổng
`9660` mới chỉ **đọc ra từ mã**, chưa ai thấy xảy ra) · `ipv4port` + `STAKING_PORT_BASE=9700` ·
node10 vào **từ genesis** (D-119 chứng minh đường **stake sau**, cơ chế khác hẳn) · khắc chữ
**BẬT** trong một lượt sinh mạng đầy đủ.

✅ **Và nó rẻ hơn tưởng:** `network_ids.go` đã có **băng mạng TẬP theo thế hệ** —
`A1IDGocTap 899_999_999` ⇒ gen 1 = `899999998`, tên `9chain-a1-tap-g1`. Hai băng **không bao
giờ bắt tay được**, và `netgen/identity.go` chặn **FATAL** nếu tên không suy đúng từ `A1Gen`.
⇒ Tập ở `A1Gen 1` **không** là canh bạc *"bản tập thành bản thật"*. Hơn nữa **binary không phụ
thuộc byte chữ khắc** ⇒ **image lượt tập chính là image ngày G dùng lại**.
⚠️ Giá phải trả: bump `A1Gen` ⇒ repo mô tả g1 trong khi mạng sống là g0 ⇒ vài cổng đỏ tới ngày G.
**Đỏ nhiều ngày là cách nhanh nhất dạy người ta lướt qua danh sách** ⇒ tập sát ngày, khai trước
đỏ nào là đỏ dự kiến.

⚠️ **Bump thế hệ là BA dòng bên Go** (`A1Gen`, `A1Name`, `A1NameTap`) + **một** dòng JS
(`A1_GEN`). Việc tay ghi *"cả hai ngôn ngữ"* — đúng nhưng chưa đủ chi tiết. Quên vế Go thì
netgen chặn FATAL; **quên vế JS thì không gì báo lỗi** (D-093).

**Nếu chỉ tập được một nửa:** ưu tiên **`N=10` + `STAKING_PORT_BASE=9700` + node10 từ genesis** —
phần duy nhất hỏng thì hỏng **giữa ngày G, sau khi mạng cũ đã bị xoá**, và đường lui của nó
(D-119) tốn **25.000 LOVE9** + đưa B-12 về 14 ngày.

**Số đo cuối phiên:** preflight đầy đủ **15 đạt · 3 đỏ · 17 việc tay** (đo `13:20Z`, trước khi
sửa) ⇒ sau khi sửa: `--no-network` **14 đạt · 0 đỏ · 4 bỏ qua · 22 việc tay** ·
`check-single-source` ✓ · `check-english-code` ✓ (nợ **5.754**, không phình).
⚠️ **Chưa chạy lại lượt đầy đủ có mạng** — ba cổng đỏ không nằm trong thứ đã sửa.
⚠️ **Chưa commit · chưa ghi `DECISIONS.md`/`PROGRESS.md`** — chưa quyết định nào được chốt và
chưa mục nào đánh `[x]`; ngày diễn tập đang chờ David.

### 🆕 Phiên `2026-08-29` — TL;DR

**David chốt: mở testnet công khai ĐÚNG `2026-09-01`.** Trong ngày đã khép trọn vòng người ngoài
phải đi — `git clone` GitHub công khai → `git am` 25 patch (ra đúng tree `f2b9486b`) → build →
join → **stake → validate**. Node thứ 10 chạy ở **Hetzner 🇩🇪 `95.217.60.140`**, khác nhà cung cấp
với server A1 (OVH 🇫🇷) ⇒ **O4 đạt**. Kế hoạch: [`docs/TESTNET1-PUBLIC-2026-09-01.md`](docs/TESTNET1-PUBLIC-2026-09-01.md).

**Bốn quyết định của David:** ngày mở `01/09` · O4 = máy Hetzner đó · mã nguồn lên **GitHub tài
khoản cá nhân** · dịch **đường người ngoài đọc** trước, nợ còn lại trả dần.
**Chốt cuối phiên:** node10 vào **THẲNG GENESIS** ngày G, **không** stake sau
([`docs/GDAY-NODE10-HETZNER.md`](docs/GDAY-NODE10-HETZNER.md), D-122).

**Số đo cuối phiên:** preflight **15 đạt · 3 đỏ · 17 việc tay** · mạng g0 **10 validator**,
mọi node 9 peer · drift **19 khớp · 0 lệch · 0 thiếu** · `check-key-leaks` **exit 0 lần đầu** ·
nợ tiếng Anh **5.856 → 5.754**.

**Ba đỏ còn lại, tất cả ĐỎ ĐÚNG LÝ DO** — đừng vá cho xanh:
`watch-network` (validator **10** mong 9 · B-12 **14 ngày** — hệ quả lượt stake) ·
`drift` (3 mồ côi `heartbeat-*` **không thuộc repo**, chưa rõ nguồn) · `net*` (**B-19**).

### 🔴 Việc của David — theo thứ tự gấp

| # | việc | vì sao gấp |
|---|---|---|
| 1 | **PR đăng ký chainId** — [`docs/chainid-registry/`](docs/chainid-registry/README-PR.md), soạn sẵn, mọi trường đã ĐO | duyệt mất **vài ngày**; gửi 01/09 là không kịp |
| 2 | ✅ ~~**Tạo GitHub repo rỗng**~~ **XONG `31/08`** — `daviddokrao/9chain-a1`, **RIÊNG TƯ**, chỉ `main` (299 commit). Nghiệm thu **từ phía GitHub**: `visibility PRIVATE` · đúng **một** nhánh · `patches/` **26 tệp** · `upstream/` **404 đúng thiết kế**. Clone ngược về: 26 patch **trùng byte** bản cục bộ, **0 khoá** trong cây. 🔴 Còn lại: **đổi sang CÔNG KHAI** mới mở khoá điều kiện qua **4 + 5** | **David** |
| 3 | **B-16** bản sao khoá thứ hai · **B-19** khoá trong thư mục chết | chặn GO/NO-GO |
| 4 | 3 tệp `heartbeat-*` mồ côi trên server — của ai? | drift đỏ vì chúng; và sau `down -v` là **mất manh mối** |
| 5 | **Chốt có diễn tập `31/08` không** (A1 đề xuất: CÓ) | 5 thứ chưa từng chạy đang xếp vào sau `down -v` — xem phiên chiều `29/08` |

### 🆕 Phiên `2026-08-28` (chuẩn hoá) — SÁU dòng phải đọc trước khi gõ bất cứ lệnh nào

1. 🔴 **LUẬT MỚI, David chốt: mã nguồn CHỈ CÓ TIẾNG ANH** (`CLAUDE.md` **§0**, trên cả 4 luật
   cứng) — tên tệp · tên hàm · biến · khoá JSON · cờ · **chú thích** · log · tiêu đề commit.
   Ngoại lệ: `web/lib/i18n/vi.ts` · `docs/**` + `*.md` gốc · `docs/evidence/**` + `patches/**`.
   Thi hành bằng **bánh cóc**: `node scripts/check-english-code.mjs` — mã MỚI phải sạch ngay,
   nợ cũ chỉ được **CO LẠI**. Nợ hiện tại **107 tệp · 5.856 dòng** + 54 tệp Go trong fork.
2. **Mọi tên tệp / cờ / khoá JSON đã đổi sang tiếng Anh — KHÔNG có bí danh.** Lệnh cũ trong
   đầu anh **sẽ không chạy**: `ngay-g-preflight`→`gday-preflight` · `canh-mang`→`watch-network` ·
   `o1-kiem`→`o1-check` · `kiem-khoa-tren-chain`→`check-keys-on-chain` ·
   `vi-qua-ham`→`wallet-over-tunnel` · `--tu-kiem`→`--self-test` · `--kiem`→`--check`.
3. **Cây fork: 25 patch · tree `f2b9486b`** (không còn 24/`074aaa93`). Đối chứng **24/25 →
   `074aaa93`** nay **chạy tự động** trong preflight, không còn là nghi thức chép tay.
4. 🔴 **B-19 — dính thẳng vào B-16 đang chặn GO/NO-GO.** `local-net/net-that-g0/` là **MỒI NHỬ**:
   networkID **khớp** mạng sống nhưng **6 ví đều 0đ** (`allocation.md` của nó khai *"1 node"*,
   mạng thật 9). **Đừng cất nó làm bản sao lưu quỹ** — bộ thật ở `C:\Users\abc\9chain-a1-keys\g0\`.
   Chiều ngược lại: khoá giữ **~90 LOVE9 thật** nằm trong **hai** thư mục tự khai là *đồ chết*
   ⇒ dọn theo thư mục là **mất tiền**. `node scripts/check-net-dirs.mjs`.
5. 🔴 **B-18 — 3 tên tệp CŨ còn trên server** sau lượt đổi tên ⇒ dọn **cùng lượt deploy console**.
6. **`up-all.sh` / mọi compose nay ĐÒI `NETWORK_ID`** và suy nó **từ genesis sắp mount**. Bộ
   `local-net/net/` hiện tại là **9001 đã chết** ⇒ nó sẽ kêu, và đó là **đúng**.

⚠️ **Ba lỗi của phiên này, đã sửa hết, ghi lại vì bài học còn giá trị** (D-108, D-113):
một lượt quét-và-thay sửa nhầm `patches/0006` (**cổng bắt được**) · sửa nhầm nội dung **gói vật
chứng** làm nó tụt 9/9→7/9 (**KHÔNG cổng nào bắt** — nay có `check-evidence.mjs`) · và tôi khai
sai số dư ví factory **lệch 1000 lần** vì đọc `90,008` kiểu `vi-VN` thành *chín mươi nghìn*
(thật: **~90 LOVE9**). Cách in số đã sửa để không lặp lại.

**Trạng thái `2026-08-28` cuối phiên:**

| | |
|---|---|
| preflight | **16 đạt · 2 đỏ · 0 không chạy được · 15 việc tay** — hai cái đỏ ĐÚNG, xem dưới |
| mạng g0 | sống · `999999999` · **9 validator** · B-12 còn **308 ngày** (`2027-07-02`) · factory **~90 LOVE9** |
| cây fork | **25 patch → tree `f2b9486b`** ✓ · đối chứng 24/25 → `074aaa93` ✓ |
| vật chứng | 3 gói · **20/20 dòng hash khớp** |
| nợ ngôn ngữ | **5.856 dòng / 107 tệp** (đã trả 945 dòng trong phiên) |
| sao lưu H-6b | 🔴 **ĐỎ — `20260828-043739` có 24 patch, repo nay 25, 68 tệp mã đã đổi** ⇒ chạy lại |

🔴 **Hai cái ĐỎ của preflight, cả hai là VIỆC CỦA DAVID:**
- `repo ↔ server drift` — **3 thiếu · 5 lệch** (tên mới sau đổi tên + sửa nội dung console).
  Hết đỏ khi console được deploy. **Deploy là việc có người bấm.** ⇒ **B-18**
- `net* directories` — 1 mồi nhử + 2 tệp giữ tiền trong thư mục chết. ⇒ **B-19**

### 🔴 Còn chặn GO/NO-GO `2026-08-29` — đúng MỘT việc, và nó chặn ở PHẦN CỨNG

```bash
node scripts/o1-check.mjs <thư-mục-bản-sao>    # B-16 · exit 0 ĐẠT · 1 SAI · 2 CHƯA KẾT LUẬN
```

🔴 **CỔNG NÀY ĐÃ CHẾT SUỐT NGÀY `28/08`, VÀ NÓ ĐỎ NGƯỢC** (D-116). Lượt đổi tên
`kiem-khoa`→`check-keys` không được nối vào `o1-check.mjs` ⇒ `go run` gói không tồn tại ⇒
exit 1 ⇒ cổng in **`🔴 SAI — đừng cất nó làm bản O1`** cho bộ khoá **chính, hoàn toàn đúng**.
Cùng lỗi nằm luôn trên **đường ký ví tiền thật** (`wallet-tunnel/enter.sh`), khai thành *"khoá
không suy ra địa chỉ"*. **Cả hai đã vá + 7/7 đối chứng ngược.** Bài học: một **công cụ hỏng**
không được phép thành một **phán quyết về khoá** — nay công cụ phải **tự khai đã chạy**.

🔴 **VÀ MỘT BẢN SAO KHOÁ QUỸ ĐÃ NẰM TRẦN TRONG `%TEMP%` SUỐT 20 GIỜ** (D-117). Tìm ra khi quét
*"đã có bản thứ hai nào chưa"*: `…\Temp\claude\…\scratchpad\kk\` giữ **bản trùng byte** của bộ
g0, cộng hai bản *"làm hỏng"* dựng làm ca đối chứng — mà **bản làm hỏng vẫn chứa đủ khoá riêng
thật**. Ba cổng cùng mù vì ba lý do khác nhau. ✅ Đã `shred -u -n 3` theo kỷ luật D-107, và có
cổng canh mới: **`node scripts/check-key-leaks.mjs`** (6/6 đối chứng, nay **exit 0**).
⚠️ Bản nháp đầu của cổng đó đỏ **32 tệp** gồm hai `PROGRESS.md` trong git — nó đo *sự có mặt của
một CHỮ*, không phải *của một KHOÁ*. Đã sửa: đo `PrivateKey-` + **40+ base58**, rồi **so với bộ
quỹ sống** để tách 🔴 tiền thật khỏi 🟡 khoá mạng tập.
⚠️ **Rồi nó sai thêm hai lần nữa, và một lượt quét ĐỘC LẬP mới bắt được** (D-117b): phạm vi dừng
ở repo nên **mù với `9Chain-backups\`**, và mốc so chỉ có 6 quỹ nên **`chain-factory-key.txt` —
ví thứ BẢY giữ ~90 LOVE9 thật — bị chấm 🟡**. Mốc so nay nhiều nguồn, self-test **8/8**.
🔴 **Và phát hiện lớn hơn cả hai lỗi: KHOÁ FACTORY ĐƯỢC TÁI DÙNG XUYÊN THẾ HỆ** — bản trong gói
lưu của mạng `9001` **đã chết** trùng byte với khoá giữ tiền trên `g0` **hôm nay**. Cùng hình
dạng gotcha 15. ⇒ **Ngày G sinh mạng mới thì sinh luôn khoá factory mới**, cùng lượt với token.

🔴 **B-20 MỚI — KHÔNG BẢN LƯU NÀO CHỨA DANH TÍNH VALIDATOR CỦA MẠNG ĐANG CHẠY** (D-117c). Lộ ra
khi đo gói `20260825` trước lúc xoá: hai gói lưu mới nhất có **0 tệp** danh tính/khoá/archive —
chúng là bản lưu **mã nguồn**, không phải bản lưu **mạng**. H-6b lâu nay đo bằng **số patch**;
số patch đúng mà **nội dung trống** thì bản lưu vẫn vô dụng.

**B-16 — bản sao thứ hai của khoá quỹ.** Đo `28/08`: máy dev có **đúng một ổ đĩa**
(`C:`, 1.862 GB) — không USB, không ổ ngoài. *"Hai nơi khác nhau về vật lý"* **không tạo ra
được từ phần mềm**; `C:\PROJECTS\9Chain-backups\` cũng trên `C:` nên **không tính**.
✅ **Phương tiện David chốt `28/08`: MÁY TÍNH THỨ HAI.** Quy trình đầy đủ (đường chuyển được
phép / bị cấm · ba mức nghiệm thu · đường lui khi máy đích không có Docker):
[`docs/O1-SECOND-COPY-RUNBOOK.md`](docs/O1-SECOND-COPY-RUNBOOK.md).
⇒ Còn lại: David chỉ **máy đích + thư mục**, rồi chạy nghiệm thu mức 1 + mức 2.
Bản gốc đo lại cuối ngày **còn nguyên vẹn**, và `o1-check` trên nó ⇒ **exit 0**.

Phần A1 làm được đã xong: `o1-check.mjs` trên bộ **chính** ⇒ **exit 0** — bộ ở
`C:\Users\abc\9chain-a1-keys\g0\` **đúng là bộ của mạng đang chạy**, 6/6 quỹ giữ tiền thật.
Dấu vân tay để đối chiếu bản sao: `keys.txt` **3.531 B** `e350727a…` · `allocation.md`
**2.221 B** `654fb72e…` · `genesis.json` **7.753 B** `e1024eab…`.
⏳ Bộ khoá này **bị vứt bỏ `2026-09-01`** ⇒ đây là cửa sổ diễn tập **rủi ro bằng không**.

**Việc khác của David** (không chặn GO/NO-GO): O4 nhà cung cấp thứ hai (tiền) · ký SIWE cho
phép kiểm đẻ chain đầu-cuối · gộp `web-home` → `main` · **byte chữ khắc** (D-104).

⚠️ **Đừng cày tiếp trong phiên cũ.** Mọi thứ cần biết: `CLAUDE.md` (luật) · `PROGRESS.md`
(trạng thái) · `DECISIONS.md` **D-093→D-115** (vì sao).

---

## TL;DR

Mạng công khai đang chạy **thế hệ `g0`** — `networkID 999999999`, `9chain-a1-g0`,
`supplyCap 7.900.000.001`, 9/9 node. Sinh lại `2026-08-27` (D-081). Đo lại `28/08` chiều: sống.

### 🔴 ĐỢT 15 (`28/08` tối) — 8/8 mốc đạt (`A15-0`…`A15-7`) · 9 quyết định · 2 việc mới cho David

**Ngày G nay có MỘT lệnh:**

```bash
node scripts/gday-preflight.mjs      # 12 cổng + 12 VIỆC TAY in thành ô trống
```

| công cụ mới | làm gì | đối chứng |
|---|---|---|
| `gday-preflight.mjs` | runbook ngày G chạy được (D-101) | 12/12 xanh · `A1_GEN=1` ⇒ đỏ |
| `o1-check.mjs` | **O1 một lệnh** — gộp cả hai phép đo khoá (D-097) | 6/6, gồm bộ khoá **đã chết ⇒ exit 1** |
| `watch-network.mjs` | 9 mục · **B-12 còn 308 ngày** · số dư factory (D-100) | 13/13 · RPC chết ⇒ **2**, không phải 0 |
| `close-ledger-before-regenesis.mjs` | O3b: kéo sổ sống → dồn `chains`→`retired` (D-099) | 9/9 · không mất bản ghi ở n=43 |
| `check-clock-skew.mjs` | B-13(b): chọn `--offset-ms` (D-102) | 7/7 · đo thật **557ms ±811** ⇒ giữ `3000` |
| `generation-test.mjs` | cổng THẾ HỆ của console (D-093) | 13/13 · gỡ cổng ⇒ 7 hỏng |

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
   `scripts/check-keys-on-chain.mjs`.
2. **Dòng `P-addr` trong `keys.txt` là CHỮ NGƯỜI VIẾT, không phải phép đo** (D-091b). Khối
   `[team]` dán địa chỉ `[foundation]` thì dòng in ra vẫn trông đúng và ví vẫn ký.
3. ✅ **M11.10 XONG và ĐÃ KÝ THẬT** (D-091): ví chạy ở máy dev, hầm SSH **trong cùng container**,
   khoá không chạm server. `9chain-a1-xpwallet` trên server **đã xoá hẳn** (D-092).
4. 🔴 **O1 vẫn CHƯA ĐẠT** — còn đúng một việc, và chỉ David làm được: **bản sao thứ hai**.
   Xem [`docs/O1-CUSTODY-VERIFICATION.md`](docs/O1-CUSTODY-VERIFICATION.md) · **B-16**.

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

**Cây fork: tree `f2b9486b` · 25 patch trên `1cf1fc3`** (đổi `28/08`: patch 0025 đổi tên
công cụ `kiem-khoa`→`check-keys`; áp 24/25 vẫn ra `074aaa93`).
🔴 **`stale-ok` — SỐ CỦA `28/08`, GIỮ ĐỂ ĐỐI CHIẾU.** Hôm nay (`01/09` chiều) là **27 patch /
`38723877`**, đối chứng **26/27 → `60a61707`** (bump `A1Gen` nằm trong patch 0018, D-123; patch
0027 hạ `MinValidatorStake` về 81 LOVE9). Đoạn dưới đây kể chuyện
`28/08`; đừng đọc nó thành trạng thái hiện tại. Số hiện tại ở mục phiên đầu tệp và ở `CLAUDE.md`.
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

### 🔴 NGÀY G `2026-09-01` — lịch bấm (giờ UTC · giờ VN)

| Xong việc gì | UTC | VN | Ai |
|---|---|---|---|
| **KHỐI 0** — image trên server, tự khai đúng `commit=` | `06:09Z` | **13:09** | ✅ **XONG SỚM `31/08`** |
| **KHỐI 1** — B-16 · B-19 · O2 · sổ chain · H-6b | `07:09Z` | 14:09 | O2/sổ/H-6b ✅ xong · **B-16, B-19 = David** |
| 🟥 **`down -v` — điểm không quay lại** | `07:39Z` | **14:39** | **David** |
| Mạng lên 9/9, **đo BINARY** | `08:29Z` | 15:29 | David |
| `engrave-verify` **kèm `--rpc`** trên chain thật | `08:59Z` | 15:59 | David |
| Công bố + **mở lại cổng đẻ chain bằng TAY** | **`10:09Z`** | **17:09** | David |

🔴 **GO/NO-GO:** tới `06:09Z` mà image chưa tự khai đúng `commit=` ⇒ **đừng bấm `down -v`**.
Hoãn rẻ; `down -v` thiếu binary đúng là **mất g0 mà không dựng được g1**. Cổng đẻ chain **đang
ĐÓNG** nên hoãn **không tốn gì cho người dùng**.

### 🔴 Hai việc của David, làm SAU KHI g1 xanh — không phải trước

| | |
|---|---|
| **B-16** — bản sao thứ hai bộ khoá quỹ, `o1-check.mjs` exit 0 | 🔴 Bộ đáng làm là **g1**, mà nó **chưa tồn tại** (netgen sinh ở giờ G). Làm trên g0 hôm nay là bảo vệ thứ ngày mai vô giá trị |
| **B-19** — dời `chain-factory-key.txt` (**90,007 LOVE9**) khỏi thư mục thế hệ chết | Số tiền đó **chết cùng g0**; giá trị còn lại là **giữ bản ghi** |

🔴 **Điều kiện phải giữ: ĐỪNG SHRED GÌ CỦA g0 CHO TỚI KHI g1 XANH.** Hỏng lượt sinh lại phải hoãn
thì g0 là thứ duy nhất còn lại, và lúc đó tiền + khoá g0 **lại có giá trị trở lại**.

### 🟡 Ba quyết định đang chờ David (không chặn ngày G)

1. **`HEARTBEAT_STOP_AFTER=2026-09-01T00:00:00Z`** — bơm tự dừng **sớm hơn giờ G 10h09m** ⇒ mạng
   công khai **im lặng hơn 10 tiếng** ngay trước lượt sinh lại. Để nguyên, hay dời cho khớp?
   (`docker rm -f` + `run`, vì `restart` **không** nạp env.)
2. **`main:web/lib/chain.ts` khai `networkId: 9001`** — hai thế hệ chết. `main` không phải bản đang
   chạy (bản sống ở `web-home`), nhưng repo công khai sẽ **xuất bản** nó. Luật cứng #4 cấm phiên
   này sửa ⇒ merge `web-home`, hay gỡ `web/` khỏi bản công bố?
3. **Công khai repo = công bố cả sổ nội bộ** (`DECISIONS` · `HANDOFF` · `BLOCKERS` · `docs/AUDIT-A1/`).
   Quét khoá **sạch** (`PrivateKey-` = 0) ⇒ đây là **lựa chọn**, không phải sự cố.


| # | Việc | Ai | Ghi chú |
|---|---|---|---|
| **1** | ✅ ~~Nạp `chain-factory`~~ **XONG `27/08`** — 89,99999173 LOVE9 trên P. 🔴 **Còn nợ phép kiểm:** đẻ **một** L1 rồi thu hồi để chứng minh đường đẻ chain thông (cần David ký SIWE, và nó tạo chain THẬT trên mạng công khai) | A1 + **David** | D-082. Khoá Foundation lấy từ `net/keys.txt` **trên server** — không phải "khoá máy dev" như dự tính, xem O1 |
| **2** | 🟡 **O1 custody** — ✅ **NAY CHỈ MỘT LỆNH: `node scripts/o1-check.mjs <thư-mục>`** (D-097; exit 0 ĐẠT · 1 SAI · 2 CHƯA KẾT LUẬN). — bước 1 XONG `27/08` (D-085). 🔴 **`28/08` phát hiện `kiem-khoa` chấm `6/6 ✓ exit 0` cho bộ khoá THẾ HỆ ĐÃ CHẾT** ⇒ thêm cổng thứ hai nối vào chain (D-090). Nay **6/6 quỹ đã chứng minh giữ tiền thật trên g0**. ⇒ Còn lại đúng một việc của David: **bản thứ hai** — quy trình 15 phút ở [`docs/O1-CUSTODY-VERIFICATION.md`](docs/O1-CUSTODY-VERIFICATION.md) | **David** | 🔴 Khoá g0 vẫn ở **đúng một ổ đĩa**. 🔴 **Phải chạy CẢ HAI lệnh** — `kiem-khoa` một mình không phân biệt được bản sống với bản chết |
| **2b** | ✅ ~~B-15 bí danh tài sản~~ **CHỐT `27/08` — `LOVE9`, DỨT KHOÁT** (D-084). 🔴 Giá đã biết trước và chấp nhận: **công cụ dựng trên SDK avalanchego gốc KHÔNG nói chuyện được với A1**. Patch 0022 bắt nó hỏng ra tiếng | — | D-084 |
| **3** | ✅ ~~netgen sinh `.env`~~ **XONG `27/08`** — patch 0020, kèm **cổng chặn mạng THẬT sinh ra ở tư thế phơi trần** và `NETWORK_ID` nay bắt buộc | A1 | D-083. Đo đầu-cuối bằng `docker compose config`: có `.env` → `localhost,127.0.0.1`, giấu đi → `*` |
| **4** | ✅ ~~**B-9** `#e84142`~~ **XONG `27/08`** — patch 0021, vàng 9Chain trên navy | A1 | 🔴 Còn một chỗ NGOÀI phạm vi B-9: `local-net/console/index.html` **trên server** vẫn có 3 lần `#e84142` và lệch 12 byte so với git — thuộc worktree web, phiên này không đụng |
| **5** | **O4** — dời 1 node sang nhà cung cấp thứ hai, **hoặc** khai thật + đổi tên `01/09` | **David** | §12.3: cách rẻ nhất không phải tiền mà là chữ *"chính thức"* |
| **6** | ✅ ~~**B-10** robots.txt bị Cloudflare che~~ **CHẨN ĐOÁN SAI TỪ ĐẦU — ĐÓNG `28/08`** (D-106b). Cloudflare **CHÈN THÊM**, không **THAY**; tệp A1 luôn tới được người đọc. Cổng `node scripts/check-robots.mjs` ⇒ **exit 0**, 7/7 đối chứng | — | 🟡 Còn lại là **quyết định chính sách**: khối Cloudflare cấm hẳn 9 bot AI + khai điều khoản **nhân danh A1**. Muốn tắt: Overview → Control AI Crawlers → bỏ *Display Content Signals Policy* |
| **6b** | 🔴 **B-17 (MỚI)** — xoá 6 tệp `.bak` trên server: đường lui trỏ vào quyết định ĐÃ ĐÓNG (mở lại đẻ chain + gỡ xác thực ví). Lệnh soạn sẵn trong `BLOCKERS.md` | **David** | D-098 · autopilot không ghi lên server |
| **7** | ✅ ~~H-7~~ **CHỐT + LÀM XONG** — IPv4 đa cổng (D-089, patch 0024). 🔴 Còn lại của **O4 là TIỀN**: đã chứng minh beacon tới được từ Internet và mesh cùng máy còn nguyên, **chưa** chứng minh node ở máy khác bắt tay được — việc đó cần máy thứ hai | **David** (O4) | D-089 |
| **8** | **Gộp `web-home` → `main`** | **David** | `DECISIONS.md` đang tồn tại ở hai bản — xem §12.1 |
| **9** | GO/NO-GO `2026-08-29` · Ngày G `2026-09-01` | — | `docs/GDAY-A1-REMAINING.md` §7 |
| **10** | ✅ ~~**M11.10**~~ **XONG `28/08`** (D-091) — ví ký từ máy dev qua hầm SSH **trong cùng container**; đã **ký thật** lên mạng công khai, khoá không chạm server. `node scripts/wallet-over-tunnel.mjs --check` | A1 | ✅ `--fund` cũng XONG (D-091b): 6/6 quỹ chọn đúng, `--check` kiểm được việc chọn quỹ **mà không khởi động ví**. ✅ `9chain-a1-xpwallet` trên server **ĐÃ XOÁ HẲN `28/08`** (D-092) — đừng dựng lại |

🔴 **Phép kiểm đẻ chain đầu-cuối cần HAI thứ của David:** ký SIWE, **và** biết rằng cổng nay
mặc định ĐÓNG — muốn chạy thì khởi động console với `A1_DE_CHAIN_MO=1` rồi tắt lại.

🔴 **Chữ khắc: cơ chế 100%, nội dung 0% — nhưng nội dung KHÔNG còn là việc A1 phải theo dõi.**
David chốt `28/08` (**D-104**): hai chuỗi chạy **song song**, C1 do **David điều phối riêng**.
⇒ A1 nhận **byte đã đóng băng** như một **đầu vào David cấp**, không chờ, không hỏi, không
xếp C1 vào bảng rủi ro của mình. Việc của A1 là: giữ cơ chế khắc chạy được, và **nói rõ hạn
chót mà đầu vào phải tới** để lượt sinh mạng ngày G không phải chờ.

---

## 🔴 GOTCHAS — thứ sẽ tốn giờ nếu không biết trước

### 🆕 Từ phiên ĐÊM `2026-08-31` (chín cái, đều lộ ra từ CHẠY THẬT)

**A. Một hằng số nghĩa là "thế hệ nào đó khác" LUÔN đi vào ô mạng sống ở lượt bump kế** (D-134).
Cùng literal `999999998`/`999999999` chép cứng ở **ba tệp cổng**. Nặng nhất: `wallet-over-tunnel.mjs`
— công cụ **ký bằng khoá quỹ** — mặc định là g0 **đã chết**, và ca đối chứng của nó đang **đòi mạng
SỐNG bị từ chối**. networkID sai **không** làm ví từ chối dựng giao dịch; nó làm **mạng từ chối chữ
ký**, đọc ra như lỗi hầm/lỗi node. ⇒ **Đừng chép — SUY RA** từ `A1_GEN`/`A1_ID_GOC`.

**B. `create-l1` cắm cứng khoá `ewoq` ⇒ CHẾT trên mọi mạng netgen** (D-140). Đo: `ewoq` xuất hiện
**0 lần** trong `allocation.md`/`genesis.json` của mạng netgen sinh. `local-net/create-l1.sh` gọi nó
⇒ **đường đó chỉ chạy trên mạng dev thế hệ `9001` cũ**. Đường dùng được: `9chain-a1-cli l1 create`
với `A1_CLI_KEY`.

**C. 🔴 Thanh khoản genesis nằm trên X-Chain, CLI trả phí trên P-Chain** (D-140). Không chuyển
trước thì **mọi lượt đẻ chain chết ở giao dịch đầu**, và lỗi nói về *"UTXO"* chứ không nói *"tiền
của anh ở chain khác"*:
```
LỖI CreateSubnetTx: insufficient funds: needed 2196 more nAVAX      # P=0, X=71.000.009
docker exec -d -e WALLET_KEY="$KEY" -e WALLET_URI=http://127.0.0.1:9650 -e PORT=8091 <node> /9chain-a1/build/xp-wallet
curl -X POST -H 'content-type: application/json' --data '{"amount":"1000"}' http://127.0.0.1:8091/api/x-to-p
# rồi ĐO TRÊN NODE (platform.getBalance), không tin ví, MỚI l1 create
```
⚠️ Ví phải chạy **TRONG container node** — header `Host` là `127.0.0.1`. Đi vòng ngoài là **403**,
và cái 403 đó là **cổng M11.10**, không phải thứ để nới.

**D. Một ví chạy SAI KHOÁ vẫn trả `200`** (D-140). Một tiến trình ví cũ giữ cổng, tiến trình mới
bind hỏng rồi **chết lặng**, `/api/info` vẫn trả lời — của ví cũ, số dư 0. **Dấu hiệu duy nhất là
địa chỉ in ra khác địa chỉ mình mong.** ⇒ **Đọc `xAddr` trước khi tin số dư.**

**E. `make-l1-genesis.mjs` CHỌN chứ không GIỮ CHỖ** (D-141) — nó tra hai sổ đúng luật nhưng
**không ghi lại**, nên hai L1 đẻ qua CLI cách nhau vài phút **cùng nhận `9001000000`**. Console an
toàn vì **chính nó** ghi vào `console-chains.json`. Đã vá bằng **cảnh báo lớn**; sửa tận gốc hoãn
sau ngày G. ⇒ Đẻ chain người dùng **qua console**, hoặc khai `--chain-id` tường minh.

**F. Container `9chain-a1-heartbeat` — hai điều** (D-138). (a) **Không thuộc compose nào** ⇒ mọi
cổng duyệt `docker compose` **mù với nó** (container thứ hai như thế, sau console). Dừng êm:
`touch ~/9chain-a1/src/9chain-a1-config/heartbeat.stop`. (b) 🔴 Nó mount **`/ → /hostfs`**, chạy
**root**, userns **OFF** ⇒ **đọc được `console.env`** (đã đo: 800 byte) tức token + khoá. Ngày G
dựng lại nó (seed g1) ⇒ **thu hẹp mount ngay lúc đó**.

**G. Danh tính validator LÀ khoá riêng, và `check-key-leaks.mjs` KHÔNG canh chúng** (D-142) —
**18 tệp `staker.key`/`signer.key` mỗi mạng**, ngoài tầm mọi cổng. B-20 nói bằng chữ; đây là số.

**H. Hai bẫy công cụ nhỏ mà tốn giờ.** `SUBNET_PREFIX` — netgen **tự nối `.0`**, đưa dư một octet
ra `172.30.0.0.0/16` và compose chết. Image node **không có `ps`/`pkill`** ⇒ không dừng được tiến
trình bên trong bằng cách thường, dùng cổng khác hoặc restart container.
⚠️ `docker exec -e` **khác** `docker run -e`: env của `exec` là **tạm thời cho tiến trình đó**,
**không** nằm trong `docker inspect` — đó là lý do nạp khoá qua `exec` an toàn hơn.

**I. 🔴 Cái bẫy "giao dịch đầu tiên" trong `CREATE-A-CHAIN.md` KHÔNG tái hiện** (D-141). Trên L1
mới toanh, block 0: `eth_estimateGas` = **56.070** vs thực dùng **55.270** ⇒ **ước lượng đúng, dư
1,4%**; cả 4 ca **thành công**, kể cả ca tài liệu nói sẽ hỏng. ⚠️ Một preset, hợp đồng rất nhỏ,
băng TẬP ⇒ **chưa đủ để xoá cảnh báo khỏi tài liệu công khai**. **Đo lại trên L1 THẬT đầu tiên sau
giờ G rồi David quyết.**


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
    **VÌ ĐÚNG LÝ DO**. `check-robots` bản đầu đỏ ngay lần chạy đầu và cái đỏ đó bị đọc thành
    *"cổng nhạy"* — thật ra nó chấm bằng **dòng đầu** `robots.txt` trong khi tưởng đang chấm
    bằng **nội dung**. Cloudflare **chèn thêm**, không **thay** ⇒ B-10 chưa bao giờ là một lỗ.
    Kèm: **đọc HẾT tệp trước khi dựng cổng cho nó** — chính `web/public/robots.txt` đã viết
    sẵn phép đo đúng trong chú thích. (D-106b)

22. 🔴 **`${BIẾN}` trong chuỗi NHÁY KÉP của JS in ra nguyên văn — và cổng hằng số KHÔNG bắt được.**
    Sửa `gday-preflight.mjs` để thôi chép cứng IP, dùng `${SERVER_IP}` trong `"..."` ⇒ runbook in
    ra chữ `${SERVER_IP}`. `check-single-source` **xanh** vì chuỗi IP đã biến mất — nó tìm IP,
    không tìm nghĩa. Chỉ lộ vì **chạy thật và đọc dòng in ra**. Dùng nối chuỗi hoặc backtick,
    rồi **đọc output**. (D-122)
21. 🔴 **Grep HTML tải về của `/create-chain/` là phép đo MÙ.** Trang là Next.js xuất tĩnh và
    **form chỉ render sau khi kết nối ví**; không có MetaMask thì `querySelector("select")` là
    `null`. Grep ra 0 cho **cả** tiếng Việt lẫn tiếng Anh, đọc thành *"deploy không ăn"*. Phép đo
    đúng nằm **trên server**: `import` `presets.mjs` rồi in. (D-120)
20. 🔴 **Ngày G `N=10` đụng cổng `9660`.** netgen publish API **node2** ở `127.0.0.1:9660`; ở
    `ipv4port`, staking port node *N* = `A1_STAKING_PORT_BASE + N - 1` ⇒ node10 lấy đúng **9660**.
    Với `N=9` lỗi **không tồn tại** ⇒ nó xuất hiện lần đầu **đúng ngày thêm node thứ mười**.
    Dùng `A1_STAKING_PORT_BASE=9700`. (D-122)
19. 🔴 **`find -size -1M` KHỚP 0 TỆP — và không báo lỗi.** `find` làm tròn kích thước **LÊN**
    đơn vị, nên một tệp 495 B **không** *"nhỏ hơn 1M"*. Một lượt `find … -size -1M -exec shred`
    chạy trót lọt, **exit 0**, và xoá **0 tệp** — đúng hình dạng B-17: tưởng đã dọn mà chưa.
    Dùng đơn vị **byte**: `-size -1048576c`. Đã dính `28/08` lúc xoá gói lưu `20260825`.
    Kèm bài học rộng hơn của cùng lượt đó: dòng đối chứng cuối in *"remaining bundles:"* **rỗng**
    vì lỗi glob **của chính nó** — đọc theo mặt chữ là khai một sự cố không có thật.
    ⇒ **Một dòng đối chứng cũng phải được đối chứng** (D-117c).

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
    `scripts/check-keys-on-chain.mjs`** (D-090). ⚠️ Bộ `9001` đã chết vẫn nằm trên máy dev ở
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
node scripts/wallet-over-tunnel.mjs --check      # nghiệm thu đường đi, KHÔNG cần khoá, KHÔNG chạy ví
node scripts/wallet-over-tunnel.mjs --self-test   # 3 ca đối chứng ngược
node scripts/wallet-over-tunnel.mjs --wallet-key <tệp> [--fund foundation] [--port 8090]
docker rm -f 9chain-a1-vi-ham           # 🔴 xong việc là dừng NGAY — container này giữ khoá

# 🔴 O1 — bộ khoá quỹ có phải của MẠNG ĐANG CHẠY không (D-090). Chạy CẢ HAI, cùng thư mục:
node scripts/check-keys-on-chain.mjs <thư-mục-khoá>/allocation.md
node scripts/check-keys-on-chain.mjs --self-test     # 5 ca đối chứng ngược
# kèm: check-keys -allocation allocation.md keys.txt  (xem docs/O1-CUSTODY-VERIFICATION.md)

# 🔴 Cổng canh khoảng cách REPO ↔ SERVER (D-088) — chạy TRƯỚC khi tin bất kỳ mục "ĐÃ ĐÓNG" nào
node scripts/check-deploy-drift.mjs

# Cổng repo
node scripts/check-consistency.mjs --self-test
node scripts/gen-chainid-issued.mjs --check
node local-net/console/chainid-test.mjs
node local-net/lib/cb58.mjs --self-test
node scripts/check-chainid.mjs

# Tái lập cây fork (27 patch → tree 38723877; đối chứng 26/27 → 60a61707)
# 🔴 Preflight đã chạy CẢ HAI vế tự động — chạy tay chỉ để soi khi nó đỏ.
cd upstream/avalanchego && git worktree add --detach /tmp/tl 1cf1fc3
cd /tmp/tl && git am --keep-cr ../../patches/*.patch && git rev-parse HEAD^{tree}

# Số dư ví chain-factory (đẻ chain chết câm khi cạn)
# 🔴 ĐỊA CHỈ ĐỔI THEO THẾ HỆ **VÀ** THEO LƯỢT ĐỔI KHOÁ. Ví g0 (`P-love91vgh2wh…`) giữ 0 và
#    KHÔNG báo lỗi — hỏi nhầm nó ra "0 đồng", đúng về địa chỉ được hỏi, vô nghĩa về mạng.
#    🔴 Ví g1 ĐẦU TIÊN (`P-love91999h0q…6739999`) cũng đã NGHỈ — thu hồi `2026-09-02` sau khi
#    khoá của nó bị lộ, trước khi nạp một đồng nào (D-159). Nó cũng trả "0" mà không báo lỗi.
#    ⇒ **ĐỪNG chép địa chỉ từ đây.** Suy ra từ nguồn duy nhất, để không có bản chép nào trôi:
#      node --input-type=module -e 'import {VI_FACTORY_THEO_THE_HE} from "./local-net/lib/factory-wallets.mjs"; import {A1_GEN} from "./local-net/lib/chainid.mjs"; console.log(VI_FACTORY_THEO_THE_HE[A1_GEN]);'
#    Đường đúng để ĐO: `node scripts/watch-network.mjs` (nó tra bảng ví theo A1Gen, D-117b).
curl -sS -X POST -H 'content-type:application/json' \
  --data '{"jsonrpc":"2.0","id":1,"method":"platform.getBalance","params":{"addresses":["P-love9199au4t8uj8s6875ztwvvgctnkcxddtwv549999"]}}' \
  https://rpc-a1.9chain.org/ext/bc/P

# 🔴 Tài liệu có khai số của thế hệ đã chết không (D-150) — cổng DUY NHẤT đọc văn xuôi
node scripts/check-doc-drift.mjs

# 🔴 Nơi ĐẨY còn làm được việc của nó không (D-151) — sao lưu còn GHI được, riêng tư còn RIÊNG TƯ.
#    Repo bị archive vẫn trả fetch/ls-remote và vẫn khai `ADMIN`; chỉ `isArchived` phân biệt được.
node scripts/check-remotes.mjs
```

⚠️ **Luật cứng của repo** *(đã trả giá để học)*:
1. **Không tin mã HTTP.** Thang đo: mã HTTP → `content-type` → **nội dung** → header tầng trước.
2. **Mọi cổng mới phải được nhìn thấy lúc nó ĐỎ.** Chưa có đối chứng ngược = mới kiểm một nửa.
3. **Đụng `patches/` là đụng đường tái lập fork** — sinh `--no-signature`, nghiệm thu
   `git am --keep-cr` + so tree. **Sinh lại CẢ BỘ.** Tree hiện tại: **`38723877`** / **27 patch**
   / gốc `1cf1fc3`. Đối chứng ngược rẻ mà mạnh: áp **26/27** phải ra đúng **`60a61707`**.
   *(Mốc cũ `f2b9486b`/25–26 và `074aaa93`/24 còn nằm trong các mục phiên `28–30/08` bên trên —
   đó là **câu kể về quá khứ**, đúng ở thời điểm của chúng, đừng sửa hàng loạt.)*
   ✅ **Image `9chain-a1/node:g1` ĐANG CHẠY trên cả hai máy**, binary tự khai
   `gitCommit 9chain-a1-g1-27patch-38723877` — tức repo tree, patch count và **binary đang phục
   vụ người dùng** là **ba phép đo độc lập cùng khớp**. Đây là trạng thái hiếm: giữ nó bằng cách
   sinh lại CẢ BỘ patch mỗi lần đụng, không bao giờ nối thêm một patch.
4. **Chỉ MỘT phiên được deploy.** Worktree web ở `C:\PROJECTS\9Chain-A1-web` (nhánh `web-home`)
   — 🔴 **Caddyfile ĐANG CHẠY đến từ nhánh đó**, không phải `main`. Deploy từ `main` sẽ xoá công
   việc của phiên web (cổng D-075 nay chặn, nhưng đừng dựa vào nó).

---
## Lịch sử các đợt trước

Đã tách sang [`docs/archive/HANDOFF-history-2026-08.md`](docs/archive/HANDOFF-history-2026-08.md)
(`2026-08-28`, A15-7) — **không mất một chữ nào**, chỉ thôi nằm trên đường đi hằng ngày.
Ở đó: đợt autopilot 14 · soát CORE `27/08` · chuẩn hoá thương hiệu `27/08` · các phiên trước.
