# HANDOFF — 9Chain Testnet A1 (Avalanche)

Cập nhật: **2026-08-28** (phiên `27–28/08`: nạp ví · 6 patch mới · **phát hiện server lạc hậu 2 ngày**).

## TL;DR

Mạng công khai đang chạy **thế hệ `g0`** — `networkID 999999999`, `9chain-a1-g0`,
`supplyCap 7.900.000.001`, 9/9 node. Sinh lại `2026-08-27` (D-081).

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

⚠️ **Ngày G `2026-09-01` VẪN phải sinh lại lần nữa** (chữ khắc vào genesis) ⇒ **thế hệ 1**:
`A1Gen 1` · `networkID 999999998` · `9chain-a1-g1` · khối chainId L1 `9001000000–9001999999`.
David chốt `28/08`: **bỏ C1 khỏi tầm ngắm**, chỉ tập trung A1.

---

## ▶ Việc tiếp — theo thứ tự

| # | Việc | Ai | Ghi chú |
|---|---|---|---|
| **1** | ✅ ~~Nạp `chain-factory`~~ **XONG `27/08`** — 89,99999173 LOVE9 trên P. 🔴 **Còn nợ phép kiểm:** đẻ **một** L1 rồi thu hồi để chứng minh đường đẻ chain thông (cần David ký SIWE, và nó tạo chain THẬT trên mạng công khai) | A1 + **David** | D-082. Khoá Foundation lấy từ `net/keys.txt` **trên server** — không phải "khoá máy dev" như dự tính, xem O1 |
| **2** | 🟡 **O1 custody** — bước 1 XONG `27/08` (D-085). 🔴 **`28/08` phát hiện `kiem-khoa` chấm `6/6 ✓ exit 0` cho bộ khoá THẾ HỆ ĐÃ CHẾT** ⇒ thêm cổng thứ hai nối vào chain (D-090). Nay **6/6 quỹ đã chứng minh giữ tiền thật trên g0**. ⇒ Còn lại đúng một việc của David: **bản thứ hai** — quy trình 15 phút ở [`docs/O1-CUSTODY-PHEP-KIEM.md`](docs/O1-CUSTODY-PHEP-KIEM.md) | **David** | 🔴 Khoá g0 vẫn ở **đúng một ổ đĩa**. 🔴 **Phải chạy CẢ HAI lệnh** — `kiem-khoa` một mình không phân biệt được bản sống với bản chết |
| **2b** | ✅ ~~B-15 bí danh tài sản~~ **CHỐT `27/08` — `LOVE9`, DỨT KHOÁT** (D-084). 🔴 Giá đã biết trước và chấp nhận: **công cụ dựng trên SDK avalanchego gốc KHÔNG nói chuyện được với A1**. Patch 0022 bắt nó hỏng ra tiếng | — | D-084 |
| **3** | ✅ ~~netgen sinh `.env`~~ **XONG `27/08`** — patch 0020, kèm **cổng chặn mạng THẬT sinh ra ở tư thế phơi trần** và `NETWORK_ID` nay bắt buộc | A1 | D-083. Đo đầu-cuối bằng `docker compose config`: có `.env` → `localhost,127.0.0.1`, giấu đi → `*` |
| **4** | ✅ ~~**B-9** `#e84142`~~ **XONG `27/08`** — patch 0021, vàng 9Chain trên navy | A1 | 🔴 Còn một chỗ NGOÀI phạm vi B-9: `local-net/console/index.html` **trên server** vẫn có 3 lần `#e84142` và lệch 12 byte so với git — thuộc worktree web, phiên này không đụng |
| **5** | **O4** — dời 1 node sang nhà cung cấp thứ hai, **hoặc** khai thật + đổi tên `01/09` | **David** | §12.3: cách rẻ nhất không phải tiền mà là chữ *"chính thức"* |
| **6** | **B-10** tắt Managed robots.txt ở dashboard Cloudflare | **David** | 1 phút, đo lại bằng NỘI DUNG |
| **7** | ✅ ~~H-7~~ **CHỐT + LÀM XONG** — IPv4 đa cổng (D-089, patch 0024). 🔴 Còn lại của **O4 là TIỀN**: đã chứng minh beacon tới được từ Internet và mesh cùng máy còn nguyên, **chưa** chứng minh node ở máy khác bắt tay được — việc đó cần máy thứ hai | **David** (O4) | D-089 |
| **8** | **Gộp `web-home` → `main`** | **David** | `DECISIONS.md` đang tồn tại ở hai bản — xem §12.1 |
| **9** | GO/NO-GO `2026-08-29` · Ngày G `2026-09-01` | — | `docs/NGAY-G-A1-CON-LAI.md` §7 |
| **10** | ✅ ~~**M11.10**~~ **XONG `28/08`** (D-091) — ví ký từ máy dev qua hầm SSH **trong cùng container**; đã **ký thật** lên mạng công khai, khoá không chạm server. `node scripts/vi-qua-ham.mjs --kiem` | A1 | ✅ `--quy` cũng XONG (D-091b): 6/6 quỹ chọn đúng, `--kiem` kiểm được việc chọn quỹ **mà không khởi động ví**. ✅ `9chain-a1-xpwallet` trên server **ĐÃ XOÁ HẲN `28/08`** (D-092) — đừng dựng lại |

🔴 **Phép kiểm đẻ chain đầu-cuối cần HAI thứ của David:** ký SIWE, **và** biết rằng cổng nay
mặc định ĐÓNG — muốn chạy thì khởi động console với `A1_DE_CHAIN_MO=1` rồi tắt lại.

🔴 **Đường găng lớn nhất vẫn ngoài tầm A1:** chữ khắc chờ **C1 đóng băng byte**. Cơ chế xong
100%, nội dung 0%.

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
14. 🔴 **`check-deploy-drift.mjs` KHÔNG thấy tệp THỪA trên server.** Nó canh 18 tệp trong
    phạm vi: *"tệp trong danh sách có khớp không"*. Một tệp bị **XOÁ khỏi repo** mà vẫn nằm
    trên server thì **không nhóm nào thấy**. Đo `28/08`: `src/9chain-a1-config/genesis.json` —
    **genesis LOCAL của Avalanche** (`networkID 9001`, 3 địa chỉ `X-local1…`, khoá **công khai
    trong repo avalanchego**) — repo đã xoá `27/08`, **server vẫn còn**. ⚠️ Mạng công khai boot
    bằng `net/genesis.json` do netgen sinh nên nó là **bẫy nằm im**, không phải lỗ đang chảy.
    ✅ **Cả hai đã `shred -u` `28/08`** (D-092b) — kèm `~/9chain-a1/vi-thu.json`, khoá riêng
    trần số dư 0. **Lỗ trong CỔNG thì vẫn còn:** drift không thấy tệp thừa.
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

## Lịch sử các đợt trước (giữ để đối chiếu — không cần đọc nếu chỉ tiếp việc)

## ✅ ĐỢT AUTOPILOT 14 (`2026-08-27`) — **5/5 MỐC ĐẠT**

🔴 **ĐỌC [`docs/NGAY-G-A1-CON-LAI.md`](docs/NGAY-G-A1-CON-LAI.md) TRƯỚC.** Đó là bản A1 thẩm
định kế hoạch ngày G `01/09` và là **danh sách còn-lại thật**. `PLAN-REGENESIS-2026-09-01.md`
là bối cảnh của BOD, mâu thuẫn thì file kia thắng.
`DECISIONS.md` (vì sao) · `BLOCKERS.md` (chờ David) · `PROGRESS.md` (backlog).

| # | Mốc | Kết quả |
|---|---|---|
| **A-1** | Diễn tập nghi lễ **Block Adam** | ✅ 4 lượt · [`DIEN-TAP-BLOCK-ADAM-2026-08-27.md`](docs/DIEN-TAP-BLOCK-ADAM-2026-08-27.md) |
| **A-2** | **Quy trình O2** — xuất + `sha256` trước khi xoá | ✅ 3 ĐCN · [`QUY-TRINH-O2-XUAT-TRUOC-KHI-XOA.md`](docs/QUY-TRINH-O2-XUAT-TRUOC-KHI-XOA.md) |
| **A-3** | **G4** — tra `chainid.network` | ✅ 3 ĐCN · [`G4-TRA-CHAINID-2026-08-27.md`](docs/G4-TRA-CHAINID-2026-08-27.md) |
| **A-4** | **C-4** — cổng chainId (đóng nốt **B-11**) | ✅ 7 ca/3 ĐCN · [`CONG-CHAINID-2026-08-27.md`](docs/CONG-CHAINID-2026-08-27.md) |
| **A-5** | **I1b** — cung có nguồn | ✅ 2 ĐCN · [`I1B-CUNG-CO-NGUON-2026-08-27.md`](docs/I1B-CUNG-CO-NGUON-2026-08-27.md) |

**Cây fork: tree `f4615e73` · 18 patch trên `1cf1fc3`** *(patch 0018 = bộ định danh theo thế hệ, D-079)*. Trước đó: `f8458b33` / 17 patch *(patch 0017 = `restart:` của D-071,
thêm `27/08` sau bản soát vận hành)*. Trước đó: `c9226d9c` / 16 patch (patch 0015 cổng chainId · 0016
`cung.json`), tái lập khớp từng byte, đối chứng ngược 14/15 patch ⇒ tree khác.
⚠️ **Không cần build lại image node** — cả hai patch chỉ đụng `netgen`, chạy bằng `go run` lúc
sinh mạng. Ràng buộc `down -v` của D-050 (patch 0013) **không đổi**.

### 🔴 Ba phát hiện đắt nhất của đợt này

**1. Bắn ĐÚNG mốc thì Block Adam là block của EVA, không phải của Adam.**
`block.timestamp` rơi vào **đúng giây bấm gửi**, mà luật khắc đòi **vượt** mốc (`> T`). Lượt đầu:
block #1 (chứa Adam) `ts = mốc + 0` — **không vượt**; block #2 (Eva) `ts = mốc + 2` — vượt.
⇒ **luật khắc và hành động nghi lễ trỏ vào hai block khác nhau**, và toàn bộ khoảng cách là một
phép so sánh chặt hay không chặt. Bù **+3s** thì 9/9.
🔴 Nhưng +3s đo trên **1 node dùng chung đồng hồ với máy bắn**; trên bộ 9 node `block.timestamp`
là đồng hồ của **node đề xuất block**. ⇒ **B-13**.
🔴 Và sâu hơn: luật *"block ĐẦU TIÊN vượt mốc"* nói về **toàn chuỗi** — nghi lễ chỉ điều khiển
được **giao dịch của mình**. **Không tự bảo đảm được.**

**2. `9000000009` trống ✓ — nhưng `9100` là **Genesis Coin**, một chuỗi có thật.**
`9100` là số **đầu tiên** console cấp cho L1 người dùng, và nó **đã được cấp hai lần** rồi
(`OwnerTest`). Kế hoạch G4 chỉ nêu `9000000009` — chainId **của A1** — bỏ sót chainId **A1 phát
cho người khác**, nhóm đông hơn và chạm người thật nhiều hơn. ⇒ **B-14**.
*(Đã vá phần không cần quyết: console có danh sách chặn 51 số, tự cấp nay ra `9101`.)*

**3. Ba lần đối chứng ngược bắt lỗi trong CHÍNH công cụ vừa viết.**
Bộ xuất O2 khai *"kèm 1 L1"* trong khi L1 đó gọi hỏng và không có một byte nào — **công cụ chống
nói dối suýt nói dối**. Nay khai `xin N · XUẤT ĐƯỢC M`.
*(Cùng họ với lỗi `Fprintf` thiếu tham số mà đợt 13 bắt được.)*

### Việc sinh ra — xem `BLOCKERS.md`

| | Việc | Ai |
|---|---|---|
| ~~**B-13 (a)**~~ | ✅ **ĐÓNG `27/08`** — David chốt **neo vào hash giao dịch nghi lễ** (D-070). Bài diễn tập đã đổi cách chấm + chạy lại thật, kèm ca `--bu-ms 0` mà bản cũ chấm ✗ | — |
| **B-13 (b)** | Đo **lệch đồng hồ 9 node** rồi chọn `--bu-ms`. Chỉ làm được **sau khi mạng ngày G lên**. 🔴 **D-070 HẠ MỨC, không đóng**: bù thôi quyết định "neo đúng/sai", nhưng nếu bản khắc có **câu chữ** "vượt mốc" thì câu đó vẫn phải đúng | A1 |
| ~~**B-14**~~ | ✅ **ĐÓNG `27/08`** — David chốt gốc dải **`9000000010`**, đường thứ tư ngoài ba đường A1 đưa (D-069) | — |
| — | `cung.json` phải lên server **cùng `faucet.env`** (quên ⇒ `/api/supply` 503) | vận hành |
| — | Câu khai nguồn cung trên trang — `web/` thuộc worktree `9Chain-A1-web`, **câu chữ đã soạn sẵn** | phiên web |
| — | Chạy O2 **một lượt trên mạng công khai** để biết thời gian thật | A1 |

### Backlog cũ (giữ để đối chiếu điều kiện qua)

<details>
<summary>5 mốc và điều kiện qua như đã giao</summary>

| # | Mốc | Điều kiện qua |
|---|---|---|
| **A-1** | **Diễn tập giao dịch nghi lễ Block Adam** (§4 `NGAY-G-A1-CON-LAI`). Đo `26/08`: P-Chain đứng ở 330, C-Chain `0x73` — **Avalanche không đẻ block rỗng**, nên "block đầu tiên vượt mốc" có thể **không có block nào**. Hẹn sẵn 2 giao dịch chạy đúng `2026-09-09T06:09:09Z` | Trên mạng tập: hẹn giờ chạy đúng giây đã định, block sinh ra, đọc lại được `blockNumber`+`timestamp`. **Kèm 1 ca đối chứng ngược** (hẹn sai giờ ⇒ không có block) |
| **A-2** | **Quy trình O2** — export + `sha256` mạng sắp chết, công bố **trước** khi xoá. 🔴 Đã **BỎ LỠ** ở lượt `26/08`: chain data + DB Blockscout xoá không có bản công bố nào | Chạy thử được **một lệnh**, ra tệp + `sha256`; đối chứng ngược: sửa 1 byte ⇒ hash đổi |
| **A-3** | **G4 — tra `chainid.network`** xem `9000000009` có bị chiếm không | Có ảnh chụp/JSON của `chains.json` kèm ngày tra. 🔴 Phải tra **LẠI ngay trước bước sinh genesis** ngày G, đừng tin lần tra này |
| **A-4** | **C-4 — cổng "bản tập ≠ bản thật" cho chainId** (B-11). A1 có cổng rất kỹ cho **chữ khắc** mà **không có cổng nào cho chainId** — thứ ví người dùng thật sự đọc. Không chạm binary | netgen từ chối/cảnh báo khi sinh mạng tập mang chainId của mạng thật; **có đối chứng ngược** |
| **A-5** | **I1b** — phơi trần cung ra endpoint đọc được, **hoặc** ghi rõ trên trang rằng nguồn là *tham số genesis*. Luật cứng của 9Scan-A1: *"số công bố phải đọc từ chain thật"*; in trần mà không có endpoint là **gõ hằng số vào giao diện** | Số trên trang truy được về một lệnh RPC, hoặc trang tự khai nguồn là tham số genesis |

</details>

⚠️ **Luật cứng cho autopilot ở repo này** *(đã trả giá để học)*:
1. **Không tin mã HTTP.** Thang đo từ yếu tới mạnh: mã HTTP → `content-type` → **nội dung** →
   header tầng trước (`cf-cache-status`). Cổng chỉ biết xanh **không chứng minh gì**.
2. **Mọi cổng mới phải được nhìn thấy lúc nó ĐỎ.** Chưa có đối chứng ngược = mới kiểm một nửa.
3. **Đụng `patches/` là đụng đường tái lập fork** — sinh bằng `--no-signature`, nghiệm thu bằng
   `git am --keep-cr` + so tree. Tree hiện tại: **`f4615e73`** / **18 patch** / gốc `1cf1fc3`.
   ✅ **D-065 ĐÃ HẾT `27/08`:** bộ patch sinh lại cả lượt ⇒ tiêu đề nay là `01/17`…`17/17`,
   không còn `[PATCH nn/12]` lạc. Sinh lại **cả bộ**, đừng bao giờ thêm lẻ.
   🔴 **Nghiệm thu phải có ĐỐI CHỨNG NGƯỢC, và có một ca rẻ mà mạnh:** áp **16/17** patch phải
   ra **đúng tree cũ `c9226d9c`**. Nó chứng minh hai thứ cùng lúc — phép so tree *phân biệt
   được* bản đủ với bản thiếu, **và** lượt sinh lại không âm thầm đổi gì ở các patch cũ.
4. **Chỉ MỘT phiên được deploy.** Worktree web ở `C:\PROJECTS\9Chain-A1-web` (nhánh `web-home`)
   — báo trước khi merge/deploy, xem `WORKTREE-WEB.md` bên đó.

### 🔴 Chờ David — autopilot KHÔNG tự làm được, đừng đoán thay

`BLOCKERS.md`: **B-12** lịch gia hạn validator (làm ngay sau ngày G) · **B-9** `#e84142` trong
`patches/0003` · **B-10** tắt Managed robots.txt ở dashboard Cloudflare.
*(**B-11** đóng hẳn `27/08` · **B-13(a)** và **B-14** đóng `27/08` — David chốt trong phiên.
**B-13(b)** còn mở nhưng chỉ làm được sau khi mạng ngày G lên.)*
`NGAY-G-A1-CON-LAI.md` §6: **O1 custody khoá quỹ** (hạn `28/08`, cơ hội một lần) · **Block Adam
nằm trên chain nào** · **O3** chính sách L1 người dùng · **có khôi phục sổ `retired` cũ không**
(chain `David Do` 9141 nằm trong vùng đang hở) · **O4** validator nhà cung cấp thứ hai (tiền) ·
**O5/H-7** IPv4 đa cổng hay IPv6.

🔴 **Và đường găng lớn nhất không nằm ở đây:** chữ khắc chờ **C1 đóng băng byte**. Cơ chế A1 đã
xong (patch 0010/0011); **nội dung 0%**. C1 trễ thì đường găng gãy ở chỗ A1 không tự cứu được.

---

### Phiên 2026-08-27 (đợt 13 — SOÁT CORE) — tóm tắt để khỏi mở file

**Bản soát đầy đủ: [`docs/CORE-AUDIT-2026-08-27.md`](docs/CORE-AUDIT-2026-08-27.md).**
Đợt 12 soát **lớp da**; đợt này soát **lớp xương**. Đã vá bằng **patch 0013**, nghiệm thu
bằng tree hash + đối chứng ngược.

#### 🔴 Phát hiện P0 — trần cung THẬT là 10.099.999.999, không phải 9 tỷ

`InitialSupply()` (`genesis/config.go:146`) cộng **duy nhất** `Allocations` (X/P);
`CChainGenesis` là trường string riêng, **nằm ngoài vòng lặp** ⇒ **1.099.999.999 LOVE9** phát
hành thẳng trên C-Chain **tồn tại thật mà `currentSupply` không bao giờ đếm tới**.

| | LOVE9 |
|---|--:|
| dư địa mint với `SupplyCap` 9 tỷ | **4.699.999.999** |
| D-042 định mint | 3.600.000.000 |
| **thừa** | **1.099.999.999** — *đúng bằng phần C-Chain* |
| ⇒ tổng LOVE9 tối đa từng tồn tại | **10.099.999.999** (vượt lời hứa **12,2%**) |

**Sửa:** `SupplyCap = 7_900_000_001 * units.Avax`. Rồi 7.900.000.001 + 1.099.999.999 =
**9.000.000.000** ✓, và dư địa mint = **3.600.000.000** = đúng ô Staking Rewards. Con số sửa
rơi trúng ý định D-042 tới từng đơn vị.

**Ba đường xác nhận:** đọc mã · `getCurrentSupply` đo `26/08` = 4.301.076.227 (phần C-Chain
vắng mặt) · Mainnet **và** Fuji đều có **đúng một** mục `balance` trong `cChainGenesis` và giá
trị là **`0x0`** ⇒ upstream không phát hành gì ở C-Chain genesis, **A1 phá một bất biến upstream
không canh**.

🔴 **Quan sát này đã ghi BA LẦN** (`HANDOFF:240` cũ · `HANDOFF:932` · `TOKENOMICS`) và cả ba
dừng ở *"đừng so hai số đó với nhau"*. **Một chú thích giải thích tại sao hai con số khác
nhau, mà không nói con số nào mới đúng, là chú thích chưa hoàn thành.**

#### Năm mục còn lại của patch 0013

| | |
|---|---|
| **P1** | `mustFitSupplyCap` đọc thẳng `A1Params`, **bỏ qua `networkID`** ⇒ `NETWORK_ID=9002` (env!) đối chiếu với trần 9 tỷ trong khi node dùng `LocalParams` 720 triệu ⇒ tràn ngược. **Cổng chống tràn cho qua đúng cái nó sinh ra để chặn.** Nay đọc qua `GetStakingConfig(networkID)` + netgen từ chối mọi ID ≠ 9001 |
| **P1** | `upgrade.GetConfig` chỉ tách Mainnet/Fuji ⇒ 9001 dùng `Default` của Ava Labs. Khi họ lên lịch Helicon, **lượt rebase kế tiếp nuốt một hard fork không qua quyết định nào**. Thêm `upgrade.A1` (D-049) |
| **P1** | HRP `love9` sống bằng **`FallbackHRP`**, không bằng khai báo — rebase sót là đổi tiền tố **mọi địa chỉ P/X đã phát ra ngoài**. Và `NetworkName(9001)` = `"network-9001"`. Khai `A1ID`/`A1Name`/`A1HRP` (D-050) |
| **P2** | `verifyAgainstC1` chỉ `strings.Contains` cả tệp ⇒ chứng minh *"byte thuộc bộ của C1"*, **không** *"đúng tài liệu nào"*. Manifest trỏ `doc-hebrew` sang tệp tiếng Anh **vẫn qua sạch**. Nay khớp theo từng tài liệu |
| **P2** | Thiếu `A1_ENGRAVE_CHECKSUMS` chỉ **cảnh báo** rồi khắc tiếp · không cổng nào canh mặt `p` ⇒ manifest thiếu mặt gốc thì khắc **bó rỗng** vào P-Chain, im lặng. Cả hai nay CHẶN |

#### Nghiệm thu

| | |
|---|---|
| Tái lập | 13 patch lên `1cf1fc3` → tree **`0f497b37`** = cây fork, **khớp từng byte** |
| Biên dịch | `go vet` + `go build` sạch (container `golang:1.25.10`) |
| netgen N=9 | X/P 4.300.000.001 ≤ trần 7.900.000.001 · trần + C-Chain = 9 tỷ · dư địa mint 3,6 tỷ |
| genesis sinh ra | phân tích lại **độc lập** bằng Python: 6 alloc · 9 staker · offset 604800 · X/P + C-Chain = 5.400.000.000 ✓ |
| Đối chứng ngược | **5/5 đỏ đúng chỗ** (xem §9.3 bản soát) |
| `check-consistency` | **21 đạt · 9/9 đối chứng ngược** |

🔴 **Đối chứng ngược bắt được một lỗi trong CHÍNH bản vá này:** thông báo của cổng kế toán
thiếu tham số `networkID` trong `Fprintf` ⇒ `%!d(string=…)` và mọi cột lệch một chỗ. Cổng vẫn
**chặn đúng**, nhưng người đọc nó — người đang đứng trước một lượt sinh mạng — sẽ bị dẫn sai.
`go vet` cũng bắt được. ⇒ **Một cổng chưa được nhìn thấy lúc nó ĐỎ thì mới kiểm được một nửa:
nửa "có chặn không", chưa kiểm nửa "chặn xong nó nói gì".**

🔴 **`check-consistency.mjs` NAY ĐỌC Go, KHÔNG CHÉP Go.** Nó vẫn khẳng định `SupplyCap = 9 tỷ`
sau khi binary đã đổi — bản chép tay bằng JS **đã trôi lệch thật**, đúng điều HANDOFF từng
cảnh báo về chính cổng này. Nay `readFileSync` thẳng `genesis_9chain_a1.go`.

#### 🔴 Việc sinh ra từ đợt này

- ✅ **B-11 ĐÃ ĐÓNG BA MỤC CHẠM BINARY — David chốt `27/08` (D-051, patch 0014, tree
  `4c5d5b1e`).** `UptimeRequirement` **giữ .8** (mốc xét lại là **mainnet**, không phải ngày G)
  · `MaxStakeDuration` **giữ 365** · phí C-Chain **giữ, khai ra là CỐ Ý**.
  🔴 **Không đổi một giá trị nào — chỉ đổi CHỮ**, vì trong mã một tham số *chưa ai quyết*
  trông y hệt một tham số *đã quyết*. ⇒ **không còn gì chặn lượt `docker build` ngày G.**
  🟡 Còn **C-4** (chainId mạng tập ≡ mạng thật) — không chạm binary, không chặn ngày G.
  🔴 Sinh ra **B-12**: quy trình gia hạn validator — xem mục ⏰ bên dưới.
- **Không cần quyết nhưng phải nhớ:** `A1Name` đổi **đường dẫn DB** (`config.go:1008`) ⇒
  binary patch 0013 **chỉ được lên cùng lượt `down -v`**. Ngày G thoả. Đường lui: xoá một
  dòng, xem D-050.
- **Runbook ngày G thêm một dòng đối chứng:** `grep -o '"supplyCap":[0-9]*'` phải ra
  **`7900000001000000000`**.
#### ✅ XONG `27/08` — gỡ genesis cũ khỏi đường boot + sửa con trỏ khắc chữ

🔴 **`9chain-a1-config/genesis.json` ĐÃ XOÁ.** Nó là `genesis_local.json` **gốc của
Avalanche**, đổi đúng một trường `networkID`: khoá **ewoq** công khai giữ **50.000.000** trên
C-Chain · 3 địa chỉ `X-local1…` khoá riêng nằm trong repo avalanchego ·
`NodeID-7Xhw2mDxuDS44j42TCB6U5579esbSt3Lg` · HRP `local` trong khi binary phục vụ `love9` ·
stake **hết hạn `2025-07-15`**.

Mạng công khai **chưa bao giờ** dùng nó (netgen dựng genesis trong Go). Nhưng **node dev thì
có** — và tệ hơn: `up-all.sh` lấy khoá faucet từ `local-net/net/faucet.env` do netgen sinh,
tức **node dev và ví faucet dev thuộc hai mạng khác nhau, ví luôn rỗng**. Mâu thuẫn đó nay hết.

| Đường boot | Trước | Sau |
|---|---|---|
| `local-net/docker-compose.yml` | `/9chain-a1/config/genesis.json` | **`/9chain-a1/net/genesis.json`** (netgen sinh) |
| `up-all.sh` · `create-l1.sh` · `9chain-a1 up` | boot thẳng | **dừng + chỉ chạy `gen-network.sh`** nếu thiếu `net/genesis.json` |

⚠️ `9chain-a1-config/` **vẫn còn và vẫn mount** — nó giữ `l1-evm-genesis.json` (khuôn genesis
cho L1 EVM, `create-l1` đọc). Chỉ `genesis.json` của **mạng** là biến mất.

**Con trỏ khắc chữ đã sửa ở 5 chỗ** — `NGAY-G-A1-CON-LAI.md` §3 · `PLAN-REGENESIS` §G5 +
G5a + mục (d) · `KHAC-CHU-NGAY-G.md` luật 3 · `README.md` bảng identity ·
`netgen/main.go` (chú thích trong mã). Cả năm từng trỏ vào `:95 "{{ fun_quote }}"` của tệp đã
xoá, trong khi **netgen không đọc tệp cấu hình nào** — nó dựng `UnparsedConfig` thẳng trong Go.
🔴 **Ai đi theo con trỏ cũ sẽ sửa một tệp không ai đọc, và KHÔNG có gì báo lỗi**: lượt sinh
mạng vẫn chạy, genesis vẫn hợp lệ, chữ khắc vẫn là chuỗi mặc định. Cùng họ với *"đường lui
alias = xanh giả"*.

*(Chú thích trong `netgen/main.go` nằm trong patch 0013 ⇒ tree đổi sang **`0f497b37`**, đã
nghiệm thu lại bằng `git am --keep-cr` 13 patch.)*

#### ✅ ĐÃ BOOT THẬT `27/08` — node chạy từ nguồn đã vá (§9.6 bản soát)

Build qua `local-net/Dockerfile` thật ⇒ `rebrand.sh` chạy trên `network_ids.go` **đã vá**
(bước dễ gãy nhất, chưa từng kiểm): **idempotent, không lệch**.

| | |
|---|---|
| `"supplyCap"` dòng log đầu | **`7900000001000000000`** ✓ |
| `info.getNetworkName` | **`9chain-a1`** ✓ *(trước D-050: `network-9001`)* |
| HRP | `P-love91ytgll0…` ✓ · đối chứng ngược `P-avax1…` bị từ chối *"invalid checksum"* ✓ |
| `eth_chainId` · Foundation C-Chain | `9000000009` · **1.000.000.000 LOVE9** đúng từng đơn vị |
| log | **0 ERROR** · 9 WARN đều của mạng 1 node |

🔴 **Bằng chứng SỐNG của P0** — đo trên node đang chạy:

```
currentSupply    4,300,863,905    X/P genesis 4,300,000,001 + thưởng 863,904
C-Chain genesis  1,099,999,999    ← KHÔNG có trong currentSupply
dư địa mint      3,599,136,096    (mục tiêu 3,600,000,000)
nếu cap 9 tỷ     4,699,136,095    ← thừa ~1,1 tỷ
```

⚠️ **Đã dựng lại `local-net/net/` bằng netgen mới** (bản cũ là 720M-era, tổng 400 triệu — không
khớp binary nào còn tồn tại). Bản cũ giữ ở **`local-net/net-bak-20260827/`**. Container
`9chain-a1-faucet` đang chạy vẫn giữ khoá faucet CŨ trong env ⇒ chạy lại `up-all.sh` để nó
lấy khoá mới.
⚠️ Image `9chain-a1/node:boottest` giữ lại trên máy dev (bản build đầu của patch 0013). Xoá:
`docker rmi 9chain-a1/node:boottest`. Tag `:dev` **không đụng tới**.
⚠️ Chưa đo: đẻ L1 · Warp/ICM · faucet HTTP · giao dịch thật. Mạng 1 node
`--sybil-protection-enabled=false` **không** chứng minh được đồng thuận.

---

### Phiên 2026-08-27 (đợt 12 — CHUẨN HOÁ THƯƠNG HIỆU) — tóm tắt để khỏi mở file

**Bản soát đầy đủ: [`docs/BRAND-AUDIT-2026-08-27.md`](docs/BRAND-AUDIT-2026-08-27.md)** (157 tệp,
13 phát hiện). David duyệt làm **7 việc trước ngày G** — xong hết, đã lên công khai.

**Kết luận của bản soát:** đọc code thì có đầu tư rõ (vân tay chống trôi lệch token, cổng số
học có đối chứng ngược, chú thích mang theo phép đo); nhìn từ ngoài thì chưa — cái hỏng gần
như toàn bộ ở **lớp da**, và phần lớn rẻ.

| Đã làm | |
|---|---|
| **Logo** | Bộ kit chuẩn David đưa (14 tệp, `web/public/brand/`) lên header + chân trang, thay ký tự `◆`. `BrandLockup.tsx` |
| **Chia sẻ** | og-image (PNG thật, sinh bằng `web/scripts/gen-og.mjs`) · manifest · sitemap |
| **Giấy phép** | `LICENSE` (BSD-3) + `NOTICE` — repo trước đó **không có tệp giấy phép nào** |
| **README** | viết lại; bản cũ không có `web/`, còn liệt kê 2 container đã tắt, khai "testnet local" |
| **9 vs 18** | `TOKENOMICS.md §0` + trang faucet |
| **`/chains/`** | áp token thương hiệu, đổi tiêu đề, **gỡ màu đỏ Avalanche** |
| **Caddy** | vá `/re-genesis/` đang **404 thật** + route robots/sitemap + content-type manifest |

**Sao lưu:** H-6b chạy lại — `139.99.145.13:~/9chain-a1/backup/20260827-051507/`,
HEAD `94e150b` · 166 commit · 182 tệp · 14/14 sha256. Nghiệm thu bằng **clone ngược trên
server** + áp 12 patch → tree `ac260a38` khớp từng byte, **kèm đối chứng ngược** (bundle cắt
cụt bị từ chối đúng). 🔴 **Không chứa khoá 5 quỹ** — O1 vẫn là mục quyết số 1.

### 🔴 Hai phát hiện đắt nhất của đợt này

**1. KHÔNG MỘT FONT THƯƠNG HIỆU NÀO ĐANG CHẠY** — và giờ có **nhóm đối sánh**, không còn là
lập luận. Đo trên cùng một bản build:

| | `@font-face` khai | tải được | đường nạp |
|---|--:|--:|---|
| Sora · Instrument · JetBrains | 24 | **0** | qua `--font-*` ở `:root` |
| **Outfit** (font logo, nạp đợt này) | 2 | **1 ✓** | **thẳng vào `style` phần tử** |

`@theme` đổ `--font-sans: var(--font-instrument)` vào `:root` (`<html>`) trong khi lớp
`__variable_*` của `next/font` nằm ở `<body>` ⇒ `var()` không giải được (dấu phẩy trong
`var(--font-instrument), ui-sans-serif…` **không phải fallback của `var()`** — nó phân tách họ
chữ) ⇒ guaranteed-invalid ⇒ rơi về font hệ thống. `--font-sans` đọc ra **chuỗi rỗng**.

🔴 **B1 không được LÊN TRƯỚC B2 — ràng buộc là THỨ TỰ, không phải QUYỀN QUYẾT.** Vá B1 một
mình là làm site **xấu đi**: hôm nay font thương hiệu không chạy nên lỗi thiếu tiếng Việt chưa
hại ai; bật lên trước khi chốt bộ chữ là đúng lúc đó chữ có dấu mới thật sự rơi.
⚠️ Outfit sống **không** nghĩa là bẫy đã hết — nó chỉ **né** được bẫy.
⚠️ B1 lên là phải **chỉnh lại trần `check-budget.mjs`**: 128,1 KB + font sẽ vượt trần 160.

🔴 **ĐÍNH CHÍNH `27/08` (phiên web đo, tôi ghi sai) — hai chỗ:**

**(a) "9Scan-A1 dính y hệt lỗi nối biến" là SAI.** Họ gắn lớp `__variable_*` ở **`<html>`**
(`app/layout.tsx:168`) — **đúng**; A1 gắn ở `<body>` — **sai**. Đo trên site họ bằng Chrome:
**9/29 mặt chữ loaded**, `--font-sans` ở `:root` giải ra `"Instrument Sans", …`. Bên A1: 0/24,
biến rỗng. ⇒ **Lỗi nối biến là của RIÊNG A1.** Tôi suy từ "cùng bộ chữ ⇒ cùng lỗi" mà không mở
`layout.tsx` của họ ra xem — đúng lớp lỗi file này cấm. **Khi vá B1, chép sơ đồ `<html>` của họ.**
⇒ Hệ quả: lập luận *"chuẩn chung sai nên phải quyết bộ chữ chung với 9Scan"* **đã đổ**. B1
không cần ai gật; chỉ không được lên trước B2.

**(b) Phạm vi ký tự rộng hơn `1ea0–1ef1`.** Đo trên site 9Scan (nơi font CHẠY thật): **mọi ký
tự riêng của tiếng Việt** rơi khỏi Instrument Sans — 14/14 mẫu, **gồm cả `ă đ ơ ư` nằm NGOÀI
dải đó** (họ khai `subsets:['latin']`). Chỉ `á à â é` (Latin-1) trụ lại. ⇒ Viết **"mọi ký tự
riêng của tiếng Việt"**, đừng viết "dải `1ea0–1ef1`" — hẹp hơn thật.

**(c) B2 chỉ còn 2 họ chữ, không phải 3.** **JetBrains Mono ĐÃ CÓ `vietnamese`** (đo bằng
`font-data.json` của next/font, không đọc tài liệu) — chỉ đang không được yêu cầu ⇒ **một dòng
config**, không phải quyết định thương hiệu. Sora và Instrument Sans thì đúng là chỉ có
`latin`/`latin-ext`. ⚠️ **Outfit cũng không có `vietnamese`** — chữ logo toàn ASCII nên không
sao, nhưng **đừng dùng Outfit cho chữ chạy**.

⚠️ **Mức tin cậy, đừng trích mạnh hơn:** ký tự rơi về `Instrument Sans Fallback` — font lui do
next/font tự sinh, **đã khớp thước** (`size-adjust`, `ascent-override`) — nên chênh bề rộng chỉ
~0,7–1,4%, không phải cú nhảy nhìn ra ngay. **Có rơi font: chắc chắn** (vân tay bề rộng).
**Người dùng có nhận ra hay không: CHƯA ĐO** — không ai chụp được màn hình. Đừng viết "đang
chịu lỗi hàng ngày". ⇒ Việc phải làm không đổi (vẫn phải đổi bộ chữ), **mức khẩn thì hạ**: nợ
chất lượng chữ, không phải sự cố đang chảy máu.

**2. `#e84142` = ĐỎ THƯƠNG HIỆU AVALANCHE trong 4 tệp HTML + `patches/0003`.** Bản soát đầu
kết luận *"lớp rebrand sạch"* — đúng cho **CHUỖI**, sai cho **MÀU** (tôi chỉ grep chuỗi). Đã sửa
`/chains/`; ba tệp kia không còn phục vụ. 🔴 **`patches/0003` mới là chỗ đắt** — nó đi vào công
cụ mà mọi lần dựng lại fork đều áp. `BLOCKERS.md` **B-9**.

### 🔴 Việc của David sinh ra từ đợt này

| | | Ở đâu |
|---|---|---|
| **B-10** | Tắt **Managed robots.txt / Content Signals** cho zone `9chain.org` trong dashboard Cloudflare | không sửa được từ mã |
| **B-9** | Quyết có sửa `#e84142` trong `patches/0003` không | đổi patch = đổi tree hash |
| **B1+B2** | Chốt cụm vá nối biến + đổi bộ chữ, **cùng lượt với 9Scan-A1** | `tokens.css` có vân tay |

**David chốt trong phiên:** giữ **`#F5C542`** của trang chính cho dấu logo, **không** hoà về
token `#ffcb24` ⇒ A1 nay có **hai sắc vàng cùng tồn tại, có chủ ý** (`--color-brand-gold` vs
`--color-gold`). Chú thích "đừng dọn dẹp bằng cách hoà chúng về một" đã dán tại chỗ ở cả 3 nơi.

### Gotchas mới (đợt 14) — thứ sẽ tốn giờ nếu không biết trước

- 🔴 **`block.timestamp` ≠ giờ bạn bấm gửi, và cũng ≠ đồng hồ máy bạn.** Nó là đồng hồ của
  **node đề xuất block**. Mọi phép tính *"đã qua mốc chưa"* phải nằm **trọn trong một đồng hồ**;
  hẹn giờ thì bằng `Date.now`, nghiệm thu thì bằng `block.timestamp`, và **phải đo độ lệch**
  chứ không giả định chúng khớp.
- 🔴 **Avalanche C-Chain: hai giao dịch phát cách nhau vài mili-giây vẫn vào HAI block**, cách
  nhau tới 2 giây. Đừng viết kịch bản dựa trên *"hai giao dịch một block"*.
- 🔴 **Mạng tập phải lên cổng KHÁC 9650.** Blockscout local trỏ vào 9650; cho mạng tập lên đó là
  để explorer index một chuỗi rồi chuỗi đó biến mất lúc `down -v`, **không có gì báo lỗi**. Nay
  đã codify: `local-net/docker-compose.drill.yml`, project `a1-drill`, cổng 9750.
- **`sha256sum -c` đòi LF và khuôn `<hash><2 khoảng trắng><đường dẫn>`.** Repo chạy trên Windows
  ⇒ CRLF vừa đổi hash vừa làm hỏng `-c`. Ghi LF tường minh.
- **`git format-patch` phải sinh LẠI CẢ BỘ.** 0013/0014 vẫn mang `[PATCH nn/12]` vì được thêm
  lẻ — bộ tái lập **tự đếm sai chính mình**. (Kèm `--no-signature`, nghiệm thu `git am --keep-cr`.)
- ⚠️ **Cẩn thận cwd của shell sau `cd upstream/avalanchego`.** Một lệnh `cat >> DECISIONS.md`
  trong phiên này đã tạo tệp lạc **trong repo fork** và làm đổi tree — phát hiện vì tree không
  còn khớp. Dùng đường dẫn tuyệt đối khi làm việc bắc cầu hai repo.
- **Console đọc `9chain-a1-config/` và `local-net/console/index.html` theo `process.cwd()`**, còn
  `../lib/*.mjs` theo đường dẫn module. Muốn chạy thử trên sổ rỗng thì phải dựng cả hai thứ đầu
  trong thư mục gốc giả.

### Gotchas mới (đợt 12)

- 🔴 **`cf-cache-status` phân biệt được AI đang trả lời.** `robots.txt` có tệp, có route, đã
  deploy — vẫn trả bản của Cloudflare. `DYNAMIC` = tới origin; **`MISS` + `max-age` ở đường mà
  origin CÓ tệp thật = CF tự sinh, không hỏi origin**. Mạnh hơn "đo bằng nội dung" vì nó không
  đòi biết trước nội dung đúng. Thang đo từ yếu tới mạnh: **mã HTTP → content-type → nội dung
  → header tầng trước**.
- 🔴 **`.webmanifest` → nginx mặc định trả `application/octet-stream`** (200, đủ byte, JSON hợp
  lệ, trình duyệt vẫn từ chối). Vá bằng `header … { defer }` trong Caddy — **`defer` bắt buộc**,
  không có nó thì `header` ghi trước `reverse_proxy` rồi bị nginx đè lại.
- 🔴 **Thêm trang vào `web/` thì PHẢI thêm route vào `@trangmoi`.** `/re-genesis/` sinh ở
  `0d65eca` mà không ai thêm ⇒ **404 thật nhiều ngày**, trong khi dải `ReGenesisBanner` trên
  **mọi** trang trỏ thẳng vào đó.
- **Tệp lockup trong kit KHÔNG phải logo trần** — nó là một *thẻ*: nền `#0D1733`, viền 2px
  `#1C2A4D`, bo góc. Dán lên canvas navy thì viền nổi thành khung mờ. `.trim()` một mình không
  đủ (nó lấy màu tham chiếu từ pixel góc trên-trái, mà góc đó **trong suốt**) — phải `extract`
  cắt lề trước, rồi `trim` với nền khai tường minh.
- **Logo có `<text>` mà không nạp font là logo sai font, im lặng.** Kit khai
  `font-family="Outfit, Arial, sans-serif"`; Outfit không có trên máy đa số người dùng ⇒ rơi về
  Arial, trông vẫn "ổn". `<img src="....svg">` **không** với tới được font của trang.
- **`git format-patch` mặc định thêm chữ ký git** (`-- \n2.54.0.windows.1`). Bộ `patches/` trong
  repo sinh bằng `--no-signature` — thiếu cờ đó thì 12/12 patch báo "khác" dù nội dung y hệt.
- **`Times New Roman ×N` khi đo `getComputedStyle` thường là `HTML/HEAD/META/TITLE/STYLE`** —
  phần tử không hiển thị, kế thừa từ `<html>` chưa được đặt font. **Không phải lỗi sản phẩm.**
  Lọc theo phần tử trong `<body>` trước khi kết luận.

### Phiên 2026-08-27 làm xong — tóm tắt để khỏi mở file

**Cơ chế ngày G, cả hai chiều, đã nghiệm thu trên chain sống:**
- **Khắc chữ** — `netgen/engrave.go` (patch 0010). P-Chain `Message` (trọn bộ, gốc) +
  C-Chain hợp đồng dữ liệu `eth_getCode` + `extraData` = `sha256` 32 byte. **Mặc định KHÔNG
  khắc** — đó là cổng "bản tập ≠ bản thật" của A1. Cách dùng: `docs/KHAC-CHU-NGAY-G.md`.
- **Đọc ngược** — `9chain-a1-tools/engrave-verify` (patch 0011), một lệnh. Dựng mạng tập
  3 node thật: **17 đạt/0 hỏng**; 3 ca đối chứng ngược đều đỏ đúng chỗ.
- 🔴 **Nội dung thật CHƯA CÓ** — chờ **C1 đóng băng byte trước**, A1 lấy đúng byte. Manifest
  hiện chưa trỏ vào tài liệu nào.

**Bốn mục David chốt `27/08`:** D-045 bảng phân bổ **giữ bảng đang chạy 40/30/12/9/9** (⇒ G1+G2+G3
mở khoá, **không phải sửa mã**) · D-046 **giữ N = 9** · D-047 **giữ chainId 9000000009**.

**Đã báo 9Scan-A1** (commit `7e3b579` bên họ): `Message` là **trường chỉ ghi**, không API nào
đọc được — họ phải đọc bản văn từ **tệp** genesis, còn thứ đọc **từ chain** là `parentID` block 0.

### 🔴 Ba việc còn chặn ngày G — đều cần David (hạn 28–29/08)

| | |
|---|---|
| **O1 custody** khoá quỹ mới | Cơ hội **một lần**; sau ngày G lại kẹt y cũ |
| **Có khôi phục sổ `retired` cũ không** | Lỗ **đã hở thật**, xem `NGAY-G-A1-CON-LAI.md` §5c |
| **O4** — nay là **DỜI một node**, không phải thêm (D-046) | Không đạt thì `01/09` không nên gọi là "chạy chính thức" |

Kèm **H-7 IPv4 hay IPv6** (O5), và **O2** export+`sha256` mạng sắp chết (đã **bỏ lỡ** ở `26/08`).

### Việc đầu tiên của phiên sau — ĐỌC MỤC NÀY TRƯỚC MỌI THỨ

## 🟢 1. RE-GENESIS 9 TỶ — ĐÃ CHẠY XONG 2026-08-26 (David duyệt chạy thẳng 1→6)

**Quyết định:** `DECISIONS.md` D-036 → D-044. Mạng công khai **đã sinh lại**.

### Nghiệm thu sau cutover (đo trên mạng công khai)

| Đo | Kết quả |
|---|---|
| tham số binary đang chạy | `supplyCap` **9000000000000000000** (cũ: 720000000000000000) |
| node | **9/9** chạy · **9/9 connected** qua Cloudflare |
| self-bond | **999.999 LOVE9/node**, cả 9 bằng nhau (đúng 1 mức giá trị) |
| `currentSupply ≤ supplyCap` | 4.301.076.227 ≤ 9.000.000.000 ✓ |
| giao dịch thật C-Chain | chốt **1,7s** rồi **2,2s**, status 1 |
| `smoke-l1.mjs` | **12/12 đạt** |
| faucet | ví mới, **99.999.999 LOVE9**, API sống, hạn mức 300/300 |
| chain-factory | nạp lại **8,99999173 LOVE9** trên P-Chain |
| 6 trang công khai | 200 hết |
| Blockscout | DB xoá sạch, index lại từ block 0 của chuỗi MỚI |

### Cái gì đã thay đổi trên server

- Image: `9chain-a1/node:dev` nay là bản 9 tỷ (`a850a016…`). Bản cũ giữ tag
  **`9chain-a1/node:pre-regen9-720m`** (`40d5e8f6…`, bản M8).
- `~/9chain-a1/net` = bộ 9 node mới · `~/9chain-a1/net-old-720m` = bộ 5 node cũ (giữ).
- `~/9chain-a1/net/.env`: **`A1_TRACK_SUBNETS` để RỖNG** (3 subnet cũ chết theo).
- `console.env`: `A1_L1_ADMIN` → `0xcD0D354A1DD2C105c85B45Dd2D7F38f1465Bd84C`
  (Foundation MỚI). Bản cũ ở `console.env.bak-720m`.
- Danh bạ L1 reset về `{"chains":[],"retired":[]}`; bản cũ ở
  `console-chains.json.bak-pre-regenesis` và trong repo tại `docs/archive/`.
- `9chain-a1-config/chains/`: xoá 16 thư mục config của chain đã chết.

### Trên máy dev

- `local-net/net-public` = **bộ đang chạy** (9 node, khoá mới, có `chain-factory-key.txt`).
- `local-net/net-public-dead-720m` = bộ mạng cũ, **giữ lại**, khoá đã vô dụng.
- Bảng địa chỉ công khai: `docs/ALLOCATION-PUBLIC.md`.
- 🔴 **`keys.txt` mới là điểm hỏng duy nhất** — D-044 chốt giữ sơ đồ cũ, **bản thứ hai
  do David tự cất**. Mất máy dev = mất khoá của cả 5 quỹ, không có đường khôi phục.

### ✅ Đã nghiệm thu lại TOÀN BỘ đường sản phẩm trên mạng mới (2026-08-26)

| bài | kết quả |
|---|---|
| `smoke-l1.mjs --create-chain` | **25/25 ĐẠT** — đẻ chain thật 305,5s · giao dịch chốt 4,2s · tự thu hồi 293,4s |
| `warp-test.mjs` | **21/21 ĐẠT** — 2 L1 (9102↔9103), Warp precompile sống, API Warp bật |
| `bridge-test.mjs` | **27/27 ĐẠT** — **7 LOVE9 rời chain 9104, xuất hiện ở ví trắng trên 9105** |
| danh bạ sau cùng | **0 sống · 6 đã thu hồi** — mọi bài tự dọn, không chain mồ côi |
| gián đoạn C-Chain | đẻ: 611 lượt/hỏng 1/**dài nhất 0,5s** · thu hồi: 587 lượt/hỏng 1/**0,5s** |

Ba đòn tấn công của `bridge-test` vẫn bị chặn đúng trên mạng mới: phát lại message
⇒ revert · bỏ predicate ⇒ revert · **đòn rút sạch của bản cũ** ⇒ revert
`sai hop dong nguon`, và **không một đồng nào rời thanh khoản**.

✅ **9Scan-A1 ĐÃ ĐƯỢC BÁO THẬT** (David uỷ quyền ghi thẳng vào repo họ): commit
`5be74f7` trong `C:\PROJECTS\9Scan-A1` — toàn văn ở `docs/requests/2026-08-26-A1-da-re-genesis.md`
của họ, kèm con trỏ ở **đầu `HANDOFF.md`** của họ. Bản bên mình giữ ở
`docs/requests-from-9scan/2026-08-26-A1-da-re-genesis-BAO-CHO-9SCAN.md`.

🔴 **Trong lúc báo, phát hiện một kết luận SAI của 9Scan đang chặn họ — đã đính chính.**
`HANDOFF.md` của họ khẳng định *"108 triệu mà tài liệu khai không tồn tại trên chain"*
và tự đặt luật *"explorer TUYỆT ĐỐI không in con số nào từ `TOKENOMICS.md`"*. Ba địa chỉ
họ đo lấy từ **`local-net/net/allocation.md` = bộ DEV LOCAL**, không phải mạng công khai
(`net-public/`). Bằng chứng: họ tìm thấy 18.000.000 ở `0x574849d4…` và ghi *"không phải
địa chỉ faucet"* — đó **chính là ví faucet mạng công khai cũ**, đúng cả địa chỉ lẫn số tiền
(đối chiếu `docs/archive/allocation-pre-regenesis-2026-08-26.md`).
⚠️ **Lỗi ở cách bày file BÊN MÌNH:** luật "đừng lẫn hai bộ" có trong HANDOFF này nhưng nằm
ở mục *Bí mật*, nên người đi tìm bảng phân bổ mở nhầm file gần như chắc chắn.
✅ **ĐÃ SỬA 2026-08-26:** cảnh báo nay đứng cạnh **mọi** chỗ nhắc `allocation.md`
(`docs/ALLOCATION-PUBLIC.md` · `docs/TOKENOMICS.md` · `docs/VI-VAN-HANH.md` ·
`local-net/gen-network.sh` in ra lúc sinh mạng), và `docs/TOKENOMICS.md` nay mở đầu bằng
banner "file này đã cũ" trỏ sang nguồn sự thật.
⚠️ Phần **số dư 20M/70M có thật hay không thì KHÔNG còn kiểm lại được** — chuỗi cũ và DB
Blockscout đều đã xoá. Đã ghi rõ mức tin cậy đó cho họ.

🔴 **Nhớ: đây mới là DIỄN TẬP.** 01/09 sinh lại lần nữa. Khoá hiện tại sống tới ngày G.

**Bảng phân bổ (D-042), tổng 9.000.000.000 LOVE9:**
| Hạng mục | % | LOVE9 |
|---|--:|--:|
| Staking Rewards | 40 | 3.600.000.000 — **KHÔNG cấp ở genesis**, mint dần |
| Community | 30 | 2.700.000.000 — faucet nóng 99.999.999 (100% C-Chain) + 2.600.000.001 khoá 2 năm |
| Foundation | 12 | 1.080.000.000 — self-bond 8.999.991 (**địa chỉ riêng**) + 1.071.000.009 |
| Private Sale | 9 | 810.000.000 — khoá 2 năm |
| Team | 9 | 810.000.000 — khoá 4 năm |

Phát hành genesis **5.400.000.000** (60%) · **9 node** × self-bond **999.999** ·
nhiệm kỳ 365 ngày, so le 7 ngày/node.

### ✅ DIỄN TẬP CỤC BỘ ĐÃ CHẠY THẬT 2026-08-26 (David duyệt) — ĐẠT

Dựng **9 node trên máy dev**, mạng riêng `net-drill9`, không đụng server. Kết quả:

| Đo | Kết quả |
|---|---|
| binary có tham số mới | `supplyCap` **9e18** · `maxValidatorStake` 625e15 · `minValidatorStake` 25e12 · `minDelegatorStake` 312,5 |
| validator | **9/9 connected** ngay lượt đo đầu |
| self-bond | **999.999 LOVE9 × 9 = 8.999.991**, chín node bằng nhau tuyệt đối |
| nhiệm kỳ so le | 2027-07-01 → 2027-08-26, **đúng 7,0 ngày/bậc**, trải 56 ngày |
| khoá genesis cưỡng chế | quỹ Team 810.000.000 → `unlocked: 0`, `lockedStakeable: 810.000.000` |
| C-Chain | chainId 9000000009 · Foundation 1.000.000.000 · faucet 99.999.999 |
| giao dịch thật | `probe-l1.mjs` → **chốt 0,1s, block 1, status 1** |
| log 9 node | **0 ERROR · 0 WARN**, `/ext/health` healthy=true |

🔴 **`platform.getCurrentSupply` = 4.301.076.227 LOVE9, KHÔNG phải 4.300.000.001** —
lệch **+1.076.226**. Đừng tưởng sai: đó là **tổng thưởng dự kiến của 9 validator
genesis**, avalanchego cộng thẳng vào supply lúc thêm validator. Đã đối chiếu từng
node bằng trường `potentialReward` → khớp **tuyệt đối tới đơn vị cuối**
(1.076.226.149.636.784 nLOVE9). `InitialSupply()` (`genesis/config.go:146`) chỉ cộng
X/P, **không** cộng C-Chain — nên đừng so nó với tổng phát hành 5,4 tỷ.

⚠️ **D-042 ước "mỗi năm chỉ đúc cỡ 700 nghìn LOVE9" — đo thật cao hơn ~50%.**
Thưởng dự kiến năm đầu là **1.076.226 LOVE9** cho 9 node (nhiệm kỳ trung bình ~330
ngày; quy về 365 ngày là ~1,19 triệu). Cùng bậc độ lớn, kết luận của D-042 (cung
thật sẽ nằm quanh 5,4 tỷ chứ không phải 9 tỷ) **không đổi** — chỉ con số minh hoạ sai.

**Chưa chứng minh được ở diễn tập cục bộ** (phải chờ mạng công khai): đẻ L1 qua
console · Warp/ICM · faucet HTTP · Blockscout index lại từ đầu.

**Đã kiểm được (không phải "trông có vẻ đúng"):**
- `node scripts/check-consistency.mjs --tu-kiem` → **17 đạt · 6/6 đối chứng ngược bắt được**
  🔴 nhưng xem cảnh báo ngay dưới: cổng này **không đọc một dòng Go nào**.
- Patch series tái lập đúng cây nguồn: tree **`ac260a38`** (**12 patch** tính tới
  2026-08-26; nhớ **`git am --keep-cr`**). Đã nghiệm thu lại sau patch 0009: áp đủ
  12 patch lên `1cf1fc3` trong worktree tách rời → tree ra **khớp tuyệt đối**.
  *(Patch 0010 = cơ chế khắc chữ · 0011 = `engrave-verify` đọc ngược. Xem `docs/KHAC-CHU-NGAY-G.md`.)*

🔴 **CỔNG `check-consistency.mjs` KHÔNG BAO TRÙM MÃ — nó giữ bảng số riêng bằng JS.**
"17 đạt" chứng minh các CON SỐ David chốt nhất quán với nhau, **không** chứng minh
gì về mã sẽ sinh ra genesis. Bằng chứng: bản tokenomics 9 tỷ đi qua cổng này sạch
trong khi **netgen không biên dịch được** (`bk.Percent undefined` — cf5a54b đổi tên
trường mà bỏ sót hai nơi dùng). Đã vá; nay netgen đọc `SupplyCap` thẳng từ
`genesis.A1Params` và có cổng `mustFitSupplyCap()` riêng.

## 🔴 1b. KẾ HOẠCH CŨ THIẾU MỘT BƯỚC — PHẢI BUILD LẠI IMAGE NODE

Bản HANDOFF trước ghi bước còn lại chỉ có netgen + `down -v`. **Thiếu.** `SupplyCap`
là hằng số **biên dịch vào binary**, không đọc từ `genesis.json` (fork cố ý xếp 9001
cùng nhóm Mainnet/Fuji ở `config/config.go:807` để cờ `--stake-supply-cap` vô hiệu).
Server hiện chạy binary cũ — đo được: `"supplyCap":720000000000000000`.

Nạp genesis 5,4 tỷ lên binary đó thì `reward/calculator.go:56`
`remainingSupply := c.supplyCap - currentSupply` trừ `uint64` **thô**, tràn ngược
thành **13.766.744.073 LOVE9** (lớn hơn cả trần 9 tỷ), và
`SetCurrentSupply(currentSupply + reward)` vượt luôn `uint64`. Lập luận của D-039
*"cộng `uint64` thô không thể tràn"* chỉ đúng **khi `currentSupply ≤ supplyCap`**.
**Không tầng nào bắt được**: avalanchego không kiểm `initialSupply ≤ supplyCap` ở
bất kỳ đâu — node khởi động sạch, RPC xanh, smoke xanh, sai lệch chỉ lộ ở phần
thưởng staking nhiều ngày sau.

**Bước còn lại — CHƯA CHẠY TRÊN SERVER, cần David gật:**
```bash
# 0) BẮT BUỘC TRƯỚC TIÊN — build lại image node có SupplyCap 9 tỷ, rồi deploy
docker build -f local-net/Dockerfile -t 9chain-a1/node:dev .
# 1) sinh mạng 9 node + keys.txt MỚI
A1_NET_DIR=local-net/net-public bash local-net/gen-network.sh 9
# 2) rồi: docker compose ... down -v && up -d + nạp lại faucet.env, ví chain-factory
# 3) đối chứng NGAY sau khi node lên, trước khi mở cho ai dùng:
#    docker logs 9chain-a1-node-1 | head -1 | grep -o '"supplyCap":[0-9]*'
#    -> PHẢI ra 9000000000000000000, không phải 720000000000000000
```
🔴 **Nó xoá:** chain data 9 node · **DB Blockscout** · 3 L1 hiện có (David đã duyệt
D-037) · và sinh **bộ khoá quỹ MỚI** ⇒ `keys.txt` cũ vô dụng. Mạng công khai đứng rồi
quay lại là **một mạng khác**: cùng `chainId 9000000009` nhưng số dư/nonce mọi ví reset.

⚠️ **Lượt này là DIỄN TẬP.** 01/09 vẫn phải sinh lại lần nữa (khắc chữ + Block Adam
chưa sẵn). Nên khoá sinh ra lần này chỉ sống tới ngày G — nhưng **vẫn là khoá của mạng
công khai trong 6 ngày**. D-036: sinh lại mạng là **cơ hội một lần** chốt sơ đồ custody.

## 🔴 2. BLOCK ADAM CÓ THỂ KHÔNG TỒN TẠI — đã đo, chưa có đối sách

A1 khắc Block Adam = block đầu tiên vượt `2026-09-09T06:09:09Z`. **Đo 10 mẫu/5 phút
trên mạng công khai lúc rảnh: P-Chain đứng yên ở 330, C-Chain 0x73 — không một block
nào.** Avalanche không đẻ block rỗng, và điều đó đúng **cả với P-Chain**.
⇒ Luật "block đầu tiên vượt mốc" có thể **không có block nào để trỏ vào** hàng giờ.
**Phải diễn tập giao dịch nghi lễ trước 09/09**, nếu không sai lầm chỉ lộ đúng ngày đó.
Xem `BLOCKERS.md` H-8.

## 3. Việc `[human]` cũ vẫn còn nguyên
- **validator thứ sáu ở nhà cung cấp KHÁC** — 9 node vẫn trên **một máy, một nhà cung
  cấp**. Câu "một máy chủ đội lốt một mạng" áp y nguyên cho 9 node như cho 5.
- **H-7 IPv6 hay IPv4 đa cổng** cho node beacon (M3).
- `keys.txt` bản thứ hai offline — **sẽ đổi bản chất sau re-genesis**: khoá cũ thành
  vô dụng, nên đây là bài toán **thiết kế custody** chứ không phải sao lưu (D-036).

**5.** ~~Backlog phần mềm ĐÃ CẠN.~~ ⚠️ **HẾT ĐÚNG từ `27/08`** — backlog ngày G đã nạp lại,
xem `docs/NGAY-G-A1-CON-LAI.md` §9. Phần dưới là bối cảnh M10.
M10.1–M10.6 xong, M10.7 xong phần đo được (còn
một mục chờ 9Scan đưa `/chains/` của họ lên). Không còn task nào chạy được mà không
cần người. Muốn nạp việc mới thì dùng skill `feed-autopilot`.

🔴 **GỐC `/` NAY LÀ TRANG CHỦ THẬT (bản C, David chọn 2026-08-26), KHÔNG còn là
Blockscout.** Caddy khớp **đúng `/`** chứ không phải `/*` — Blockscout vẫn phục vụ
`/tx/…`, `/address/…`, `/blocks`, `/api/…` như cũ (đã đối chứng sau khi đổi).
**Gỡ nhanh:** xoá khối `@trangchu` trong Caddyfile rồi `caddy reload`.

**Trang công khai:** `/` (trang chủ) · `/faucet/` · `/create-chain/` · `/my-chains/`
· `/compare/` · `/chains/` · `/console/` (console cũ, không còn trong thanh điều hướng).
URL cũ, tất cả 301: `/lite/` → `/` · `/dashboard/` → `/compare/` · `/de-chain/` →
`/create-chain/` · `/chain-cua-toi/` → `/my-chains/` · `/bang/` → `/compare/`.
Đã TẮT (không xoá): `9chain-a1-explorer` :8082 · `9chain-a1-dashboard` :8092.

### ⏰ Hẹn giờ đã biết — **B-12**, và con số dưới đây ĐÃ CŨ HAI LẦN

🔴 **`2027-08-24` / "5 validator" là của mạng TRƯỚC re-genesis `26/08`. Đừng trích.**
Mạng đó đã chết; ngày G `01/09` còn sinh lại lần nữa. Bản gốc giữ lại để thấy con số cũ:
~~Cả 5 validator hết hạn `2027-08-24` (đo 2026-08-25, còn 364 ngày)~~.

**Luật thì không đổi, và D-051b vừa chốt giữ nguyên nó:** `MaxStakeDuration` 365 ngày +
`InitialStakeDuration` 365 + `InitialStakeDurationOffset` 7 ngày ⇒ **9 validator genesis hết
hạn lần lượt trong một cửa sổ 56 ngày, bắt đầu ~365 ngày sau ngày G. Node cuối rụng là mạng
DỪNG.** avalanchego **không có cơ chế tự gia hạn**, và không cổng nào cảnh báo.

⚠️ **So le 7 ngày là CỐ Ý và chính nó là hệ thống cảnh báo** — node đầu rụng ở ~ngày 309 của
nhiệm kỳ, lúc đó 8 node còn chạy ⇒ có ~56 ngày để phản ứng, thay vì cả mạng tắt cùng lúc.
**Đừng "dọn dẹp" offset về 0 cho đều.**

🔴 **Ngày hết hạn THẬT chỉ biết sau khi sinh genesis ngày G.** Đọc bằng
`platform.getCurrentValidators` → `endTime`, **đừng tính tay**. Việc đầu tiên sau ngày G:
ghi 9 mốc đó vào **B-12** lúc số còn tươi.

### ✅ Soak 3 giờ — ĐÃ XONG 2026-08-25 08:22 UTC, đạt
| | |
|---|---|
| chốt vào block | **2.272.500 giao dịch** — **210,4 TPS** liên tục 180 phút |
| lỗi gửi | **0** / 2.273.640 |
| block sinh ra | 5.400 (420,8 tx/block) |
| RPC C-Chain công khai trong suốt đợt tải | p50 **19ms** · p95 222ms · **hỏng 0/1830 lượt** |
| đĩa | còn trống 91% |

🔴 **Sửa một con số sai trong HANDOFF cũ:** "đĩa ~2,2 GB/giờ ở 252 TPS" là **ước lượng
sai từ mẫu quá ngắn**. Đo thật cả 3 giờ: chain data một node đi từ **1,6 GB → 1,8 GB**,
tức ~**70 MB/giờ** ở 210 TPS — nhỏ hơn 30 lần. Dung lượng đĩa **không** phải ràng buộc.

⚠️ **Đợt tải này KHÔNG tự thu hồi chain** (nó chạy trên chain có sẵn nên cố ý giữ lại):
log ghi `giữ lại chain "(chain có sẵn)"`. L1 đó vẫn chiếm một slot.

### Phiên 2026-08-26 (đợt 4) — ĐỔI TÊN MIỀN + icon LOVE9

🔴 **TÊN MIỀN NAY LÀ `a1.9chain.org` / `rpc-a1.9chain.org`** (David chốt: ngắn cho
người dùng đỡ gõ). Tên cũ **KHÔNG chết**:
- `testnet-a1.9chain.org` → **308** sang tên mới, giữ nguyên đường dẫn.
- `rpc-testnet-a1.9chain.org` → **phục vụ y hệt** tên mới, cùng một site block.

🔴 **RPC cũ PHỤC VỤ chứ không REDIRECT — có chủ ý.** Ví gọi RPC bằng POST, mà
redirect trên POST thì mỗi client xử lý một kiểu và MetaMask chỉ báo "Unable to
connect", không nói vì sao. Một tên RPC đã phát ra ngoài thì phải phục vụ thật, hoặc
chết hẳn. Tên miền TRANG thì ngược lại, **phải** redirect — xem gotcha SIWE bên dưới.

**Tên miền nay VIẾT THẲNG trong Caddyfile, bỏ `{$DOMAIN}`/`{$RPC_DOMAIN}`.** Caddy chỉ
đọc env lúc container khởi động ⇒ đổi tên miền bằng env là buộc `--force-recreate`
(Caddy chết vài giây, MetaMask hiện "Unable to connect" và **giữ nguyên banner**).
Viết thẳng thì `caddy reload` là đủ. Hai biến đó trong `caddy.env` nay **vô tác dụng**.

**Icon LOVE9 đã có** (David đưa bộ logo kit): `web/public/brand/` — SVG + PNG
24→512px, đồng navy/gold với hệ token. Dùng ở hai chỗ: `iconUrls` của
`wallet_addEthereumChain`, và favicon (trước đó trang **không có favicon nào**).
🔴 **ĐÃ ĐO XONG 2026-08-26 — `iconUrls` KHÔNG ĂN VỚI TOKEN GỐC. ĐỪNG THỬ LẠI.**
Tham số này có trong chuẩn EIP-3085 **và** trong ví dụ của chính tài liệu MetaMask,
nên đọc tài liệu thì tưởng làm được. Đo thật: thêm mạng thành công (màn xác nhận
"Update 9Chain Testnet A1" hiện đúng Network + RPC, **không hiện icon nào**), mở tab
Tokens — LOVE9 **vẫn là vòng tròn xám chữ "L9"**. MetaMask không cho đặt icon cho
token **GỐC**. Dòng `iconUrls` GIỮ LẠI (đúng chuẩn, không tốn gì, ăn ngay nếu ví nào
chịu vẽ) — cái đắt là phép đo, đã ghi ở `web/lib/chain.ts`.
Đường còn lại, cả hai đều tệ hơn cái được: ERC-20 thì `wallet_watchAsset` nhận `image`
thật, nhưng LOVE9 là coin gốc nên phải đẻ bản wrap (WLOVE9) — đổi kiến trúc token chỉ
để lấy một icon; còn registry của MetaMask thực tế chỉ dành cho mainnet.
⇒ Chỗ ta THẬT SỰ kiểm soát nhận diện là trang của mình + explorer 9Scan-A1.

**Đã đổi theo:** console (domain SIWE) · Blockscout (`NEXT_PUBLIC_*` + nút "Add
network to MetaMask" nay trỏ `rpc-a1`) · 12 file nguồn · HANDOFF + memory.

**Nghiệm thu:** 5/5 tên miền đúng vai · smoke-l1 **14/14** · web-deploy **6/6 liên kết
sống** · ảnh thương hiệu trả đúng `image/png`+`image/svg+xml` · Blockscout `/blocks`
76 KB + `/api/v2/stats` JSON · SIWE khai `a1.9chain.org`.

🔴 **MỘT KẾT LUẬN SAI CỦA TÔI, ĐÃ TỰ SỬA — đáng nhớ vì nó đọc rất xuôi tai.** Thêm
site block xong: `a1.9chain.org` lên ngay (525→200) nhưng `rpc-a1.9chain.org` **vẫn
525**, ổn định qua nhiều lượt đo. Cộng thêm: log Caddy đếm được **0** request mang
host đó trong khi tên cũ vẫn tới. Tôi kết luận "Cloudflare trỏ tên đó đi chỗ khác,
David phải sửa DNS" — **và đã lùi cả lượt deploy về**. Sai. Vài phút sau nó tự lên 200
mà không ai đụng gì. Xem gotcha ngay dưới.

### Phiên 2026-08-26 (đợt 5) — CHUẨN HOÁ TIẾNG ANH

🔴 **David chốt: URL, tên tệp và KHOÁ JSON phải bằng tiếng Anh.** Định danh mã nguồn
(hàm, component, prop, khoá i18n) **vẫn tiếng Việt** — đó là nếp nhà, và đổi hết là
một cuộc mổ khác hẳn mà David không yêu cầu.

**Bảng đổi tên — tra khi đọc mục cũ trong file này hay trong `PROGRESS.md`:**

| Cũ | Mới |
|---|---|
| `/de-chain/` · `/chain-cua-toi/` · `/bang/` | `/create-chain/` · `/my-chains/` · `/compare/` (301) |
| `/thuong-hieu/` | `/brand/` |
| `GET /api/tien-trinh` | `GET /api/progress` |
| `GET /faucet/api/thongtin` | `GET /faucet/api/info` |
| `kiem-cong.sh` · `kiem-lien-ket.mjs` · `kiem-a11y.mjs` · `kiem-ngan-sach.mjs` · `kiem-xuat-tinh.mjs` | `check-ports.sh` · `check-links.mjs` · `check-a11y.mjs` · `check-budget.mjs` · `check-static-export.mjs` |
| `tai-test.mjs` · `cau-test.mjs` · `warp-chung.mjs` | `load-test.mjs` · `bridge-test.mjs` · `warp-common.mjs` |
| `cau-tai-san.mjs` · `CauTaiSan.sol` · `bien-dich.mjs` | `asset-bridge.mjs` · `AssetBridge.sol` · `compile.mjs` |
| `ket-noi-vi.ts` · `soLieu.ts` · `dong-bo-token.mjs` | `wallet.ts` · `stats.ts` · `sync-tokens.mjs` |
| `ManDeChain` · `ManChainCuaToi` · `BangSoSanh` · `BangChain` · `SoLieuMang` | `CreateChainScreen` · `MyChainsScreen` · `ComparisonTable` · `ChainTable` · `NetworkStats` |
| khoá JSON `dangChay` `loai` `ten` `buoc` `ma` `nhan` `trangThai` `loi` `giayDaChay` `uocConLaiGiay` `luuY` `presetTen` | `running` `kind` `name` `steps` `code` `label` `status` `error` `secondsElapsed` `etaSeconds` `notes` `presetName` |
| giá trị enum `"tao"/"thuHoi"` · `"cho"/"chay"/"xong"/"hong"` | `"create"/"revoke"` · `"pending"/"running"/"done"/"failed"` |

🔴 **Contract Solidity đổi CẢ tên tệp lẫn tên contract, và artifact đã sinh lại.**
Vân tay nguồn đi từ `62971b14e79720e0` → **`51b44e1f3f29f762`**. Trong Solidity tên tệp
và tên contract gắn với nhau (`compile.mjs` tra `contracts["<tệp>.sol"]["<Contract>"]`),
nên đổi một nửa là để lại một cái bẫy. Tên export trong artifact (`CAU_TAI_SAN_*`) giữ
nguyên — đó là định danh mã nguồn, không phải tên tệp.

🔴 **DI TRÚ DỮ LIỆU ĐÃ CHẠY, đừng làm lại:** `console-chains.json` trên server có
**17 bản ghi** mang khoá cũ `presetTen`; đã đổi sang `presetName` (có `.bak-<epoch>`
cạnh file). Bản ghi ĐÃ ĐẺ không bao giờ được console viết lại, nên đổi khoá bên sinh
mà không di trú là **nhãn preset biến mất khỏi danh bạ** — không lỗi, chỉ mất chữ.
Hai nơi đọc vẫn giữ nhánh `presetName ?? presetTen` làm bảo hiểm cho trường hợp phục
hồi từ backup cũ hơn mốc này.

**Nghiệm thu:** typecheck sạch · web 12/12 · SIWE 21/21 · auth-e2e 38/38 ·
build a11y 6/6 · web-deploy 6/6 liên kết sống · smoke-l1 **14/14** · `check-ports.sh`
sạch · 3 route cũ đều 301 · `/api/tien-trinh` nay **404** đúng như mong đợi.

⚠️ **9Scan-A1 cũng đổi tên miền trong cùng đợt** (yêu cầu của họ ở
`docs/requests-from-9scan/2026-08-26-doi-ten-mien-a1.md`): `testnet-a1.9scan.org` →
**`a1.9scan.org`**, tên cũ 308. Khối site của họ nằm trong Caddyfile của repo NÀY, nên
lượt `caddy-deploy.sh` của A1 áp luôn cả phần đó — đã đối chứng bằng `<title>` là trang
9Scan thật, không phải trang A1 (đúng chỗ B-6 từng gãy). `explorerGoc()` bên A1 nay
trỏ thẳng tên mới thay vì đi qua redirect.

### Phiên 2026-08-26 (đợt 3) — David chọn bản C, trang chủ lên gốc

**M10.3 đóng.** Bản C thay `web/app/page.tsx`; bản A, bản B và `ThanhChon.tsx` đã gỡ.
**Gốc `/` đổi chủ**: Caddy khớp đúng `/` (không phải `/*`), nên Blockscout giữ nguyên
mọi đường dẫn sâu. Đối chứng sau khi đổi: `/blocks` vẫn là HTML Blockscout 76 KB.
**M10.7 mở khoá thêm một mục**: `/lite/` → `/`, `/dashboard/` → `/bang/`, cả hai 301.

**Đã TẮT hai container cũ** `9chain-a1-explorer` (:8082) và `9chain-a1-dashboard`
(:8092) — không còn đường vào nào sau khi `/lite/`, `/dashboard/` thành redirect.
`docker stop`, KHÔNG `rm`; bật lại bằng `docker start <tên>`.
🔴 Kiểm trước khi tắt: Caddyfile có đường lui `A1_ROOT_UPSTREAM` cho gốc và chú thích
cũ ghi mẫu là `:8082` — đúng container sắp tắt. `caddy.env` thật đang là `:8100`
(Blockscout) nên an toàn. Đã sửa chú thích, vì một đường lui trỏ vào thứ đã chết chỉ
lộ ra đúng lúc có sự cố cần dùng tới nó.

### Phiên 2026-08-26 (autopilot — M10.3 → M10.7) làm xong

**M10.3** ba biến thể trang chủ (`/tc-a|b|c/`, trang chọn ở `/moi/`) — mô tả mỗi bản
nói cả **điểm yếu**. Số liệu sống thật: 5/5 validator · 2 L1 · block C-Chain.
**M10.4** màn đẻ chain: console có `GET /api/tien-trinh`; nghiệm thu bằng chain THẬT
→ 8/8 bước, **5 node lần lượt** đúng thứ tự, mỗi node 31–33s.
**M10.5** "Chain của tôi" + thu hồi: **đã thu hồi THẬT một chain từ giao diện** bằng
đường thật (chữ ký ví thật, mọi API thật).
**M10.6** bảng A1↔C1: C1 vắng hiện ra như **vắng**, không như hỏng; có câu tự tố
*"điểm là đội tự chấm"*.
**M10.7** phần đo được: **10/10 liên kết sống**, kiểm tự động cuối `web-deploy.sh`.

🔴 **PHÁT HIỆN ĐẮT NHẤT CỦA ĐỢT NÀY — Cloudflare cắt POST ở ~100 giây (HTTP 524),
mà đẻ/thu hồi chain mất ~170 giây.** Qua tên miền công khai, lượt POST **LUÔN hỏng**
trong khi server vẫn chạy tới cùng và **thành công**. Đo thật: thu hồi từ giao diện
→ nhận 524 → màn hình báo *"Không thu hồi được"*, trong khi danh bạ **đã ghi chain
vào `retired`**. Với đẻ chain thì tệ hơn: người dùng bấm lại một việc đã xong, chain
thừa ăn mất một slot trong trần 15 **và giữ vĩnh viễn tên + chainId**.
⇒ Cả hai màn nay coi kết quả POST là **không kết luận được**: đọc `/api/tien-trinh`
tới khi lượt chạy kết thúc, rồi hỏi **danh bạ** xem sự thật là gì.

🔴 **Bốn lỗi tôi tự gây rồi tự sửa trong đợt này** (chi tiết ở PROGRESS + Gotchas):
1. **Deploy console giữa lúc đang thu hồi** ⇒ rollout xong nhưng console chết trước
   khi ghi danh bạ ⇒ **danh bạ nói dối**. `console-deploy.sh` nay từ chối restart khi
   có lượt đang chạy.
2. **`rm -rf` chính thư mục đang bind-mount** ⇒ container thấy thư mục **rỗng vĩnh
   viễn** trong khi host đủ file.
3. **Bài kiểm liên kết chỉ đo mã HTTP** ⇒ **xanh giả**, vì Blockscout là SPA trả 200
   kèm khung rỗng cho mọi đường lạ.
4. **Đặt route `/faucet/*` trước `@faucet_api`** ⇒ API faucet 404 trong khi trang vẫn
   hiện bình thường.

### Phiên 2026-08-25 (thứ NĂM, đợt 2 — giao diện) làm xong

🔴 **M10.1 + M10.2 XONG.** Có `web/` (Next 15 xuất tĩnh · Tailwind v4 · TS · bộ
component TỰ VIẾT, không shadcn/MUI/Radix). `pnpm build` sạch · **axe-core 3/3
trang** · `pnpm test` **12/12** · typecheck sạch · JS **149,7 KB gzip/trần 160**.

🔴 **Không thiết kế mới — token CHÉP từ 9Scan-A1** bằng
`web/scripts/sync-tokens.mjs`, kèm test bắt trôi lệch (vân tay `535cbf6329efb6d0`).

🔴 **Faucet đã ra khỏi chuỗi JS.** `faucet/server.mjs` nay chỉ còn API. Nghiệm thu
**bằng trình duyệt thật, khổ 375×812, qua Cloudflare**: xin được **10 LOVE9 thật**,
đối chứng `eth_getBalance` = 10,0. Hạn mức trên màn đi 5/5 → 4/5.
Mới: `GET /faucet/api/thongtin` hiện hạn mức **TRƯỚC khi bấm** (trước đó người dùng
chỉ biết khi ăn lỗi 429), dùng `rateLimit().peek()` để **không tiêu suất khi đọc**.

🔴 **SỰ CỐ TÔI GÂY RA (đã sửa trong ~2 phút): tên miền 9scan trỏ nhầm sang trang
A1.** Một lệnh thay-hàng-loạt `8094→8095` (đổi cổng cho container mới của A1) kéo
theo cả dòng `reverse_proxy` của khối `testnet-a1.9scan.org` — cổng 8094 là của
`9scan-a1-web`, **dự án khác trên cùng máy chủ**. Tệ hơn: `caddy-deploy.sh` vẫn in
**"✓ testnet-a1.9scan.org → 200"**, vì nó chỉ đo **MÃ HTTP**, không đo **AI đang
phục vụ**. Cùng họ với B-6 và cùng bài học: nghiệm thu phải chạm vào NỘI DUNG.

🔴 **Hai lần tôi tự bắt mình sai trong đợt này:**
1. **`rm -rf` chính thư mục đang bind-mount** ⇒ Docker giữ inode cũ ⇒ container
   thấy **thư mục rỗng vĩnh viễn** trong khi host đủ file. Bẫy inode đã ghi trong
   file này, nhưng ghi cho **file đơn lẻ**; ở dạng **thư mục** thì không ai ngờ.
   `web-deploy.sh` nay xoá NỘI DUNG (giữ thư mục) và **đếm số tệp hai bên** để bắt.
2. **Đọc DOM ngay sau `.click()`** rồi tưởng ngăn kéo mobile hỏng — React cập nhật
   state bất đồng bộ, nên phép đo đọc trạng thái TRƯỚC render. Gọi thẳng handler
   của React mới tách bạch được "lỗi ở sản phẩm" với "lỗi ở phép đo". Sản phẩm đúng.

**Cổng trên máy chủ này là tài nguyên DÙNG CHUNG với 9Scan-A1** và không có bảng
nào ghi ai giữ cổng nào. Trước khi thêm dịch vụ: `sudo ss -tlnp | grep 127.0.0.1`.

### Phiên 2026-08-25 (thứ NĂM) làm xong — tóm tắt để khỏi mở file

🔴 **M6.2 XONG — TÀI SẢN ĐI ĐƯỢC GIỮA HAI L1.** Hai bài trên mạng công khai:
`warp-test.mjs` **21/21** (message được xác minh ở đầu kia) và `bridge-test.mjs`
**20/20** (7 LOVE9 rời chain 9135, xuất hiện ở ví trắng trên chain 9136). Cả hai
**tự thu hồi cả hai chain** ⇒ chạy lại được vô hạn. Xem D-034.

🔴 **Việc chặn thật của M6.2 nằm ở CẤU HÌNH, không ở hợp đồng: API Warp TẮT MẶC
ĐỊNH.** Đã đo: chain đẻ trước thay đổi này trả `-32601 the method warp_getMessage
does not exist/is not available`. Đường đã làm: netgen + compose khai
`--chain-config-dir=/9chain-a1/config/chains`, console ghi
`chains/<blockchainID>/config.json` **NGAY TRƯỚC** đợt rolling restart (node đọc file
đó đúng lúc dựng chain, tức trong chính đợt restart ấy).

**Dọn 4 chain rác, lấy lại 4 slot.** `Smoke7M7Q3D/MLSCV/NJW7T` (smoke test đẻ trước
khi M4.4 có tự-thu-hồi) + `Tai7OQB7` (soak bỏ lại). Đo trong lúc dọn: **4 lượt thu
hồi → 3 lần gián đoạn, dài nhất 1s, tổng 2,4s, hỏng 4/2002 lượt (0,2%)**.
Danh bạ nay **2 L1** (OmegaChain, OwnerTest) — còn **13 suất**.

🔴 **Ba lần tôi tự bắt mình sai trong phiên này:**
1. **Đặt module cần `ethers` vào `local-net/lib/`** ⇒ `ERR_MODULE_NOT_FOUND` trên
   server. Đúng cái gotcha đã ghi sẵn trong file này (ethers chỉ có trong
   `local-net/faucet/node_modules`) mà vẫn dẫm. Đã chuyển sang `faucet/warp-common.mjs`.
2. **`ContractFactory.deploy()` tự quản nonce** ⇒ đi vòng qua `guiVoiNonce` ⇒
   `nonce too low: next nonce 1, tx nonce 0`. Bọc nonce cho "mọi lượt gửi" chỉ đúng
   khi thật sự là mọi lượt. Và vì bài kiểm ghi tên chain vào sổ dọn **sau** bước đó,
   lượt chạy hỏng để lại một **chain mồ côi** ăn một slot (đã dọn).
3. **`pgrep -f "[t]ai-test"` vẫn tự khớp** — vì dòng lệnh của tôi có `echo "... tai-test ..."`
   ở ngay cạnh. Mẹo ngoặc vuông chỉ che chuỗi TRONG mẫu, không che chuỗi ở chỗ khác
   trên cùng dòng lệnh.

**Cần David biết (không chặn gì):** API Warp nay **gọi được từ Internet** — Caddy
lọc theo **path** chứ không theo **method**, mà `/ext/bc/*/rpc` đã cho phép. Gom chữ
ký là một vòng P2P tới 5 validator ⇒ điểm khuếch đại tải. Và chú thích đầu Caddyfile
ghi *"LỌC PATH + hạn mức"* trong khi **không có directive hạn mức nào** cho tên miền
RPC — chữ và thực tế đã lệch từ trước phiên này.

### Phiên 2026-08-25 (thứ tư) làm xong — tóm tắt để khỏi mở file

🔴 **CONSOLE ĐÃ CÔNG KHAI: https://a1.9chain.org/console/** (David duyệt).
Đăng nhập bằng chữ ký ví. **H-3 đóng, M4.5 xong.** Ba việc phải làm CÙNG LÚC và thứ
tự đó bắt buộc: route Caddy · `A1_TRUST_PROXY=1` · siết 443 về Cloudflare. Thiếu cái
thứ ba thì cái thứ hai **là lỗ hổng chứ không phải bản vá**.

🔴 **M7.2 — siết 443 về dải Cloudflare. Nó vá một lỗ ĐANG MỞ, không phải dọn dẹp.**
Đo trước khi vá: nối thẳng vào IP máy chủ kèm `CF-Connecting-IP: 1.2.3.4` thì
`/faucet/whoami` trả `{"ip":"1.2.3.4"}` — **faucet tin IP bịa**, hạn mức vượt qua được
bằng cách xoay IP giả. Nay mọi kết nối không từ Cloudflare ăn 403. Xem D-032.

🔴 **SỰ CỐ TÔI GÂY RA: explorer chết 31 phút.** Lượt deploy Caddy của M7.2 xoá mất
site block `testnet-a1.9scan.org` (nó **chưa bao giờ vào nguồn**, chỉ áp thẳng lên
server hồi M6 của bên explorer) ⇒ hết cert zone `9scan.org` ⇒ 525. Đã sửa gốc: khối
vào nguồn, và `caddy-deploy.sh` nay tự kiểm **mọi tên miền**, danh sách suy từ chính
Caddyfile vừa áp. B-6. **Lỗi của tôi là nghiệm thu thứ mình BIẾT có trong file, chứ
không nghiệm thu thứ file THẬT SỰ phục vụ.**

**M5 đóng — 40/40** trên mạng công khai, 4 chain thật, mỗi chain tự thu hồi.
**B-3 gỡ:** `minBaseFee: 0` qua được `Verify()` nhưng làm chain **không dựng nổi
block nào** (D-028 — đọc cả phần tự đính chính trong đó). **B-4 gỡ** (D-029).
**M5.4:** console trả `luuY`; **loại** hướng "server tự gửi giao dịch mồi" vì nó đòi
một tài khoản Foundation nằm vĩnh viễn trong genesis bất biến (D-030).

**M6.1** — Warp vào khuôn genesis mọi chain (D-031). Bẫy: `blockTimestamp` phải
**≥ 1607144400**, không được là 0 như mọi precompile khác.

**M9.4 đo xong, và nó ĐÍNH CHÍNH M9.3.** Nâng `gasLimit` 12M→60M (trần lý thuyết
285→1.428 TPS) mà thông lượng **không tăng**: 207–230 TPS, block chỉ đầy **16%**.
Nút thắt là **đường nạp giao dịch của node ~230 tx/s**, không phải genesis. Đã loại
trừ Cloudflare và gộp-lô-ethers bằng đối chứng — cả hai đều là giả thuyết của tôi và
cả hai đều sai. Xem D-033.

**B-8 gỡ** — `load-test.mjs` từng treo 3 tiếng giữ một slot L1; nay có trần thời gian
tổng bao cả pha nạp ví, hạn giờ mỗi lượt gửi, nạp theo lô, và vòng chờ chính đua với
hạn chốt để **đường thu hồi luôn chạy tới**.

**`check-ports.sh`** — bài kiểm cổng hở, đo TỪ NGOÀI, 5 tầng (gồm: origin có đúng 403
khi nối thẳng không, và dải IP Cloudflare có bị bỏ sót không).

**Kế hoạch giao diện: `docs/UI-PLAN.md` + backlog M10.** Phát hiện nền: **không cần
thiết kế mới** — 9Chain đã có hệ token (navy/gold, tương phản sửa đạt AA, dark mode
wire thật) sống trong `9Scan-A1/app/globals.css`. David chốt: **Next xuất tĩnh**, và
**trang chủ nhắm "người muốn có chain riêng"**.

🔴 **Bốn lần tôi tự bắt mình sai trong phiên này** — ghi ra vì cả bốn đều "đọc xuôi
tai": (1) D-028 bản đầu quy công cho `blockGasCost`, trong khi Granite bật sẵn nên nó
vốn đã bằng 0; (2) gotcha *"L1 chưa bật Durango"* trong chính file này là **sai**, đã
đo PUSH0 và sửa; (3) phép đo Warp báo "TẮT" trong khi cấu hình đúng — vì đọc ở block 0
lúc precompile chưa kích hoạt; (4) hai giả thuyết về nút thắt TPS (Cloudflare, ethers)
đều bị đối chứng bác bỏ.

### Phiên 2026-08-25 (thứ hai) làm xong — tóm tắt để khỏi mở file

**M4.4 — thu hồi chain.** Trần 16 L1 hết là bánh cóc một chiều. `POST /api/revoke`
gỡ subnet khỏi `--track-subnets` mọi node rồi gỡ khỏi danh bạ. Nghiệm thu **29/29**
trên mạng công khai: thu hồi 162.8s, gián đoạn C-Chain **0.5s** (bằng lúc đẻ chain),
danh bạ **5 → 5**. `smoke-l1.mjs --de-chain` nay **tự dọn chain nó đẻ ra**.

**M8 — "fork tự đứng được", xong 4/4.** Ba lỗ hổng nêu ra đầu phiên đã bịt:
- **Build lại được** — và binary **trùng từng byte** với bản đang chạy công khai
  (`40d5e8f6…`), plugin cũng vậy. Reproducible build, xem D-017.
- **Test có nền** — 220 xanh / 7 đỏ; fork chịu trách nhiệm **đúng 2 gói**, cả hai chỉ
  vì đổi tên. 2 gói khác là nền upstream (đã chứng minh bằng thí nghiệm), 3 gói cần
  mạng thật. Xem D-018/D-019.
- **Rebase đã diễn tập** — `scripts/rebase-drill.sh`, 7/7 điểm chủ quyền còn nguyên.

**M5 — kiểu chain (preset).** 5 preset, tên khoá + địa chỉ precompile **lấy từ source
subnet-evm** (subnet-evm bỏ qua khoá lạ trong im lặng). M5.3 nghiệm thu bằng chain
thật: 3/4 preset chứng minh được precompile bật đúng; `khong-phi` **chưa qua** (B-3).

**M9 — đo năng lực bằng tải thật** (David yêu cầu). `local-net/faucet/load-test.mjs`.
- L1 riêng: **260 TPS** chốt, 0 lỗi. Trần là **tham số genesis** chứ không phải phần
  cứng: `gasLimit 12M ÷ 21.000 gas ÷ 2s = 285 TPS lý thuyết`, đo được 90% trần, trong
  khi máy mới ở load 2,92/8 luồng.
- Đợt ngắn trên C-Chain (3 phút, 50 TPS): explorer từ **9 block/~0 tx → 113 block/9.004 tx**.
  RPC công khai p50 **19ms**, hỏng 0/35. **Blockscout bám kịp, chậm 0,3 block.**
  Chi phí ròng ~0,0000000004 LOVE9 (nạp 10 LOVE9 rồi **quét trả lại 9,9999999996**).
- Đĩa khi tải: ~**2,2 GB/giờ** ở 252 TPS (số 0,86 GB/giờ đo lúc đầu là mẫu quá ngắn).

**M4.1 + M4.2 — đăng nhập bằng ví.** `GET /api/siwe/nonce` → `POST /api/siwe/login`
→ token phiên. Đăng nhập bằng ví thì **`admin` bị ÉP = địa chỉ đã ký**, gỡ hẳn lớp lỗi
tệ nhất của dự án (gõ nhầm 1 ký tự ⇒ genesis bất biến ⇒ chain vô chủ vĩnh viễn).
Thu hồi bằng ví chỉ đụng được chain của mình. Hạn mức đếm theo **ví**, hai tầng
(cửa ngoài trước xác thực / ngân sách thật sau xác thực — D-022).
Nghiệm thu: **21/21** + **33/33→37/37**, đạt ở cả máy dev lẫn server; smoke **16/16**.
`console-deploy.sh` nay **chặn deploy nếu test xác thực trượt**.
🔴 `A1_TRUST_PROXY` **cố ý CHƯA bật** — bật khi chưa có proxy là đi lùi, xem M4.2.

**B-1 đã gỡ** (David mở lại Docker Desktop). Một thao tác của người thật mở được 4 task.

🔴 **H-6 nay là việc chặn đắt nhất: repo KHÔNG CÓ REMOTE NÀO.** Đã kiểm lúc định push.
Toàn bộ phiên này (10 commit) chỉ nằm trên một ổ đĩa. `BLOCKERS.md` có sẵn stopgap
H-6b chỉ cần David gật một chữ.

**Sức khoẻ lúc chốt (đo thật):** 5/5 validator connected · **5 L1** trong danh bạ ·
smoke test **20/20 đạt** · đẻ chain đầy đủ có gửi giao dịch thật, chốt sau 0.1s.

**Phiên autopilot 2026-08-25 làm xong 3 mốc:**
- **M0** — dự án nay **có git**. Trước đó toàn bộ lớp chủ quyền (6 file identity đã sửa
  + 1079 dòng Go công cụ) là uncommitted/untracked, một lệnh `git checkout .` là mất sạch.
- **M1** — có **bộ đo + smoke test E2E** (trước đây không có test tự động nào).
- **M2** — đẻ 1 chain làm RPC công khai chết **6.0s → 0.5s** (đo thật, 12 lần tốt hơn).

**Hai phát hiện đổi cách nghĩ về sản phẩm** — xem `DECISIONS.md` D-009 và `BLOCKERS.md` H-2:
- 🔴 **Trần cứng 16 L1**: node track quá 16 subnet bị **mọi peer cắt kết nối** lúc bắt
  tay P2P (`network/peer/peer.go:882`). Mạng vỡ, không phải chậm đi. Hiện **5/15**.
  Console đã chặn. ⇒ **ACP-77 từ "việc tương lai" thành thứ duy nhất mở được trần.**
- 🔴 **Repo chưa có remote** — code vẫn chỉ nằm trên một ổ đĩa (H-6, cần David chọn
  nơi đặt + private/public).

**Explorer là dự án KHÁC: `C:\PROJECTS\9Scan-A1`** — có backlog riêng đang chạy dở
(M2 `/chains/`). Muốn làm explorer thì mở phiên ở thư mục đó và đọc `PROGRESS.md`,
đừng làm từ repo này.

## TL;DR
**Testnet công khai ĐÃ LIVE**: https://a1.9chain.org · RPC https://rpc-a1.9chain.org
5 validator chạy trên server nhà cung cấp `139.99.145.13`, Blockscout index đầy đủ, faucet + nút "Thêm vào MetaMask" hoạt động. **P0 #1/#2/#3 đều PASS.**

🔴 **CONSOLE ĐẺ CHAIN ĐÃ CÔNG KHAI (2026-08-25): https://a1.9chain.org/console/** — đăng nhập bằng chữ ký ví, `admin` bị ép = địa chỉ đã ký. Người lạ đẻ được chain của chính họ. Còn **13 suất** (danh bạ 2 L1; trần mềm console 15, trần cứng giao thức 16).
🔴 **Origin CHỈ phục vụ qua Cloudflare.** Nối thẳng vào `139.99.145.13:443` → **403** cho cả ba tên miền. Kiểm: `bash local-net/deploy/check-ports.sh`.

**Nút "đẻ chain" CHẠY THẬT trên mạng công khai**, hiện **2 L1** trong danh bạ
(OmegaChain, OwnerTest — 4 chain rác của bộ kiểm thử đã dọn ở phiên thứ năm).
**6 kiểu chain (preset)** chọn được, cả 6 đã chứng minh bằng chain thật — xem M5.3.
🔴 **Hai L1 giữa các L1 nói chuyện được với nhau (Warp/ICM) — M6.2 xong, 21/21 + 20/20.**
Ví chain-factory: **9 LOVE9** trên P-Chain ≈ **63,600 lượt đẻ chain** (0.000141468 LOVE9/lượt).

⏱️ **Đẻ 1 chain nay mất ~170 giây, không phải 12s như trước — đây là CHỦ Ý, không phải lỗi.**
Node restart lần lượt (mỗi node ~30s) thay vì đồng loạt, để mạng không mất quorum giữa chừng.
Đổi lại RPC công khai chỉ gián đoạn **0.5s** thay vì 6.0s. Xem `DECISIONS.md` D-008.
Với self-serve (M4) thì 170s là tệ cho người bấm nút — chưa tối ưu, biết và chấp nhận.

A1 = 1 trong 2 testnet song song (A1=Avalanche, C1=Cosmos) để cộng đồng chọn hướng mainnet 9Chain (David chốt: **hướng public đại chúng**).
Thư mục: A1 `C:\PROJECTS\9Chain-A1` · C1 `C:\PROJECTS\9Chain-C1` (đội khác vận hành, KHÔNG đụng).

🔴 **Explorer đã tách ra dự án riêng: `C:\PROJECTS\9Scan-A1`** (2026-08-24). Repo này lo **chain** (node, console, faucet, ví, Caddy, deploy); explorer lo **giao diện + đọc dữ liệu**. Hai bên chạy song song — **đừng lấn sân**. Explorer cần endpoint mới trên node thì họ ghi yêu cầu vào `KICKOFF.md` của họ rồi báo sang, không tự sửa ở đây.
Mục tiêu của 9Scan-A1 là **thay Blockscout**: đo trên server, Blockscout ngốn 10 container / 32–75% CPU / ~750MB chỉ để index **1 chain có 8 block** — trong khi cả 5 node avalanchego chỉ 18,5% CPU. Với sản phẩm multi-L1 thì một-instance-một-chain chết từ chain thứ ba.

---

## Hạ tầng đang chạy

| | |
|---|---|
| Trang testnet | https://a1.9chain.org — Blockscout ở gốc · `/faucet/` · `/chains/` · `/dashboard/` · `/lite/` |
| Danh bạ L1 | `/chains/` — mọi chain do console đẻ ra + tình trạng thật. Container `9chain-a1-chains` (nginx, `127.0.0.1:8093`), đọc `console-chains.json` qua alias — URL thật là **`/chains/data/console-chains.json`**
(trang fetch bằng đường dẫn TƯƠNG ĐỐI `data/…`; gõ `/data/…` ra 404, đã dính).
Mỗi bản ghi nay có thêm `presetTen` (tên kiểu chain do console ghi lúc đẻ, để trang
khỏi phải tự dịch id → tên và trôi lệch — bản chép tay cũ đã trôi một lần). **Dấu hiệu sống là SỐ VALIDATOR của subnet**, không phải chiều cao block. Mỗi L1 hiện thêm **Chủ sở hữu (admin)**; chain đẻ trước khi có ô này (OmegaChain) hiện "mặc định của hệ thống", không được để lọt `undefined`. |
| RPC công khai | https://rpc-a1.9chain.org/ext/bc/C/rpc |
| MetaMask | Chain ID `9000000009` · Symbol `LOVE9` (có nút 1 cú bấm ở `/faucet/` và `/lite/`) |
| Server | `139.99.145.13` (`(không công bố)`), Ubuntu LTS, 8 luồng / 62GB / RAID1 410GB |
| SSH | `ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST"` (key không passphrase, mật khẩu đã tắt) |
| DNS | 2 A record → `139.99.145.13`, Cloudflare **Proxied**, SSL/TLS mode **Full** |

**Ví chain-factory** (khoá trên server, `console.env`): P-Chain `P-love91vgh2whn746dzzvg0dj4w9rsqvlalcldvpueuvj` · **9 LOVE9** · khoá gốc ở `local-net/net-public/chain-factory-key.txt` (chỉ máy dev). Hết tiền thì nạp lại từ quỹ Foundation theo cách ghi ở `docs/VI-VAN-HANH.md`.
🔴 **`net-public/allocation.md` (mạng công khai) ≠ `net/allocation.md` (dev local)** — hai
mạng khác nhau, khoá khác, số khác; đọc nhầm không có dấu hiệu gì. Bản chép công khai của
mạng thật: `docs/ALLOCATION-PUBLIC.md`.

**Loopback-only (SSH tunnel, KHÔNG public):**
```bash
ssh -i "$A1_SSH_KEY" -L 8091:127.0.0.1:8091 -L 8090:127.0.0.1:8090 "$A1_SSH_HOST"
```
- Console đẻ chain `:8091` — token ở `~/9chain-a1/console.env` **trên server**.
- Ví X/P `:8090` — **khoá server giữ, KHÔNG có auth**; public là mất sạch ví đó.

**Bố cục trên server:** `~/9chain-a1/{src,net,caddy.env,console.env}` · Blockscout ở `src/explorer-full/blockscout/docker-compose` (UI `127.0.0.1:8100`).

---

## Việc tiếp

🔴 **Backlog nằm ở `PROGRESS.md`, không phải ở đây.** Đừng chép việc vào file này —
hai danh sách sẽ trôi lệch nhau. `BLOCKERS.md` liệt kê thứ đang chờ David.

Tóm tắt để khỏi mở file (cập nhật hết phiên thứ tư):
**Xong:** M0 git · M1 bộ đo + smoke E2E · M2 gián đoạn 6.0s→0.5s · M4.1–M4.5 (SIWE,
hạn mức theo ví, thu hồi chain, console công khai) · **M5 kiểu chain, 40/40** ·
**M6 đóng — Warp/ICM chuyển được tài sản giữa 2 L1 (21/21 + 20/20)** ·
M8 fork tự đứng được · M9.1–M9.4 + M9.6 đo tải.
**Làm một phần:** M3 (netgen xong, chờ H-7) · M7.2 (bài kiểm cổng xong, ufw chưa).
**Chưa bắt đầu:** M10 giao diện (M10.1/M10.2 làm được ngay, không chờ ai).
**Chờ David:** `keys.txt` bản thứ hai offline · validator thứ sáu khác nhà cung cấp ·
**H-7 IPv6 hay IPv4** · trần 16 L1 ⇒ quy mô bán multi-L1 (H-2) · git remote (H-6) ·
tokenomics (H-1) · bản ghi DNS bootstrap (H-4) · hạn mức cho RPC công khai (mới:
API Warp gọi được từ Internet, xem PROGRESS M6.2) ·
tắt 2 service Blockscout (B-2) · có đưa số liệu đo tải lên trang công khai không (M9.5).

### Đã kiểm chứng trên mạng công khai (đừng làm lại)
- **Đẻ chain chạy thật** — 6 lỗi chồng nhau đã gỡ (chi tiết: `docs/PROGRESS.md`).
  Tiền là mắt xích cuối và rẻ nhất: 0.000141468 LOVE9/lượt.
- **Chain thuộc về người bấm nút** — `POST /api/create` nhận `admin`, dùng cho **cả**
  `alloc` genesis **lẫn** `feeManagerConfig.adminAddresses`. Chứng minh bằng ví lạ trên
  `OwnerTest`: ví đó 50M token + FeeManager **Admin**, quỹ Foundation **0** + **None**.
- **Danh bạ `/chains/` hiện chủ sở hữu**, chain thiếu khoá `admin` hiện "mặc định của
  hệ thống" — thiếu khoá là trạng thái **hợp lệ**, không phải lỗi.

**Địa chỉ admin validate bằng EIP-55** (`local-net/lib/eip55.mjs`, keccak-256 viết tay vì
thư mục gốc trên server không có node_modules). Khắt khe vì genesis đã đẻ là **bất biến**:
sai một ký tự hex là chain **vĩnh viễn vô chủ**, không lỗi, không dấu hiệu.
Tự kiểm: `node local-net/lib/eip55.mjs --self-test`.

---

## Bí mật — quy tắc cứng
- `local-net/net-public/keys.txt` = **khoá thật của 5 quỹ testnet công khai**. Giữ offline, `.gitignore` sẵn, **KHÔNG BAO GIỜ** lên server.
- File duy nhất được phép lên server: `faucet.env`.
- 🔴 `local-net/net/` = bộ **dev local** (genesis khác `net-public/`). **Đừng lẫn hai bộ.**
  Luật này trước đây **chỉ** nằm ở đây, trong mục *Bí mật* — nên người đi tìm bảng phân bổ
  không bao giờ đọc tới, và 9Scan-A1 đã mở nhầm `net/allocation.md` rồi đăng một kết luận
  sai (2026-08-26). Nay cảnh báo đã đứng cạnh **mọi** chỗ nhắc `allocation.md`:
  `docs/ALLOCATION-PUBLIC.md` · `docs/TOKENOMICS.md` · `docs/VI-VAN-HANH.md` ·
  `local-net/gen-network.sh` (in ra lúc sinh mạng). **Thêm chỗ nhắc mới thì thêm cảnh báo.**

---

## Chuẩn đặt tên (chốt 2026-08-24)
Mọi thứ dùng `9chain-a1`, bỏ hẳn "MetaChain/META".
Identity: client `9chaingo` · token **LOVE9** · HRP `love9` · VM `love9evm` (VMID `pkqXszJe86D3xLomib9bLpXPfW7gr7FPhDAbg46p5iNjrn4mf`) · networkID **9001** (uint32) · EVM chainId **9000000009**.
Env dùng tiền tố `A1_*` (tên biến không được bắt đầu bằng số).

---

## Gotchas

### Thêm từ phiên 2026-08-27 (đợt 11 — cơ chế khắc chữ)

- 🔴 **SỐ CHÉP SANG THANG KHÁC PHẢI KIỂM LẠI TỶ LỆ, KHÔNG CHỈ KIỂM THANG.** Phiên web bắt
  được: `PLAN` ghi *"số dư genesis ≈64 tỷ, phần để mint ≈26 tỷ"* — số của thang 90 tỷ. Phản
  xạ là chia 10 ra 6,4/2,6, và nó **đọc rất hợp lý**. Sai: 64/26 suy từ bảng BOD Đ14 (staking
  **30%**), còn bảng được chốt là staking **40%** ⇒ số đúng là **5,4 / 3,6**. Đổi thang và đổi
  tỷ lệ là **hai** thay đổi; sửa một cái là giữ nguyên cái sai còn lại. Cùng họ với
  [[a1-tran-uint64]] — mọi đại lượng chép từ nơi khác phải hỏi **cả** "kiểu dữ liệu chứa nổi
  không" **lẫn** "tỷ lệ có còn đúng không".
- 🔴 **SỔ CHỐNG PHÁT LẠI ĐÃ HỞ THẬT, KHÔNG CÒN LÀ RỦI RO.** Lượt `26/08` reset
  `console-chains.json` về rỗng ⇒ chainId cũ dùng lại được. Đo `27/08`: **6 số đã bị cấp lại
  ngay trong 24 giờ** (9100–9105, trong đó 9100/9101 là chain **đang sống** lúc re-genesis).
  Chỗ đắt: **9106–9145 còn trống**, mà console tự cấp bằng `chainId=9100; while(taken)
  chainId++` — trong dải đó có **9141 = chain `David Do`**. Chi tiết + cách xử:
  `docs/NGAY-G-A1-CON-LAI.md` §5c.
- **SIWE của console KHÔNG dính đòn phát lại khi re-genesis, và nó chặn ĐỘC LẬP với chainId.**
  `siwe.mjs:113`: `xacThuc` **không bao giờ nhận `message` từ client**, server tra message từ
  kho của chính nó theo nonce ⇒ chữ ký của mạng cũ không có đường trình lên. Thêm hai lớp:
  `khoNonce` là `Map` **trong bộ nhớ** (mất khi restart), và nonce **dùng một lần**, xoá ngay
  cả khi xác minh hỏng bên dưới. ⇒ Đừng dùng "phát lại SIWE" làm lý do đổi chainId.

- 🔴 **TRÊN MÁY DEV, TAG `9chain-a1/node:dev` LÀ BINARY CŨ 720 TRIỆU.** Đo lúc dựng mạng
  tập: `"supplyCap":720000000000000000`. Bản 9 tỷ trên máy dev nằm ở tag
  **`9chain-a1/node:drill9`**; `:dev` của **server** mới là bản 9 tỷ. **Cùng một tag, hai
  máy, hai binary khác nhau.** Ai làm theo runbook trên máy dev mà tin `:dev` là bản hiện
  hành sẽ nạp genesis 5,4 tỷ lên binary trần 720 triệu — đúng cái bẫy tràn ngược `uint64`
  ở mục 1b, và **node vẫn khởi động sạch**. Luôn đối chứng:
  `docker logs <node> 2>&1 | head -1 | grep -o '"supplyCap":[0-9]*'`.
- 🔴 **TRƯỜNG `Message` CỦA P-CHAIN GENESIS LÀ TRƯỜNG CHỈ GHI.** Nó được serialize vào
  genesis blob nhưng **không chỗ nào trong avalanchego đọc lại**, và `platformvm` **không
  có API `getGenesis`**. ⇒ *"đọc chữ khắc từ chain"* theo nghĩa đen **không làm được**.
  Đường vòng chặt hơn: `state.go:2382` đặt `genesisID = sha256(genesisBytes)` và block 0
  lấy nó làm **`parentID`** ⇒ mạng đang chạy mang sẵn **cam kết mật mã cho toàn bộ genesis
  blob**, đọc bằng `platform.getBlockByHeight(0)`. Nó chứng minh được thứ mạnh hơn: **mạng
  này sinh ra từ đúng tệp genesis kia**. `9chain-a1-tools/engrave-verify` dùng đúng mỏ neo đó.
- **Mount đè lên `/dev` của container là giết container.** `-v <host>:/dev:ro` ⇒
  `can't mask paths: open /dev/null: no such file or directory`. Đặt tên điểm mount khác
  (`/devnet`). Lỗi đọc như hỏng Docker chứ không như đặt tên sai.
- **Compose do netgen sinh dùng bind-mount TƯƠNG ĐỐI** (`../../9chain-a1-config`). Chạy
  `docker compose` từ thư mục khác ⇒ node chết với
  `couldn't read chain configs: cannot read directory`. Có sẵn đường ra: đặt
  **`A1_CONFIG_DIR`** trỏ đường tuyệt đối.

### Thêm từ phiên 2026-08-26 (đợt 10 — vá tài liệu lệch)

- 🔴 **HASH CỦA `.a` KHÔNG PHẢI HASH CỦA BINARY — đừng kết luận tái lập từ nó.**
  Sửa **chỉ chú thích** trong `genesis_9chain_a1.go` rồi đo: `go build -o x.a ./genesis/`
  ra hash **KHÁC**, đọc y như "build không còn tái lập". Sai. Build ID của Go có hai
  nửa `actionID/contentID`: **actionID băm cả văn bản nguồn** (chú thích tính vào),
  **contentID băm kết quả biên dịch**. Đo thật: actionID lệch, **contentID trùng tuyệt
  đối** — và binary cuối `go build ./main` ra **sha256 trùng, buildid trùng, `cmp -l`
  đếm 0 byte khác**. ⇒ Đo tái lập thì đo **binary**, không đo artifact trung gian.
  Đây là lần thứ tư dự án dính họ "đo sai đại lượng" (trước đó: mã HTTP thay vì nội
  dung · `docker stats` thay vì CPU tích luỹ · cổng JS không đọc mã Go).
- **Thay file để đối chứng thì dùng `go build -overlay`, đừng sửa nguồn rồi khôi phục.**
  Ghi bản cũ ra chỗ khác + `{"Replace":{"<đường dẫn trong container>":"<bản cũ>"}}`, mount
  nguồn `:ro`. Nguồn không bị đụng một byte, và không có cửa nào để quên khôi phục.
  (Cùng bài học với bẫy `sed -i` trong container đã ghi ở đợt 8.)
- **Chú thích nói ngược giá trị ngay cạnh nó là lỗi thật, không phải lỗi hình thức.**
  `cf5a54b` đổi giá trị sang bản 9 tỷ nhưng bỏ sót chú thích, để lại ba chỗ mô tả số cũ
  (2,000 / 50,000,000 / 25) đúng ở file mà người ta đọc **ngay trước khi đổi một số
  consensus-critical**. Đã vá ở patch 0009. Đổi hằng số thì đọc lại cả khối chú thích bao
  quanh — trình biên dịch không bao giờ bắt được loại lệch này.

### Thêm từ phiên 2026-08-26 (đợt 9 — re-genesis mạng công khai)
- 🔴 **`fetch` CỦA NODE CÓ HẠN GIỜ ẨN 300 GIÂY, VÀ `AbortSignal.timeout()` KHÔNG NỚI
  ĐƯỢC NÓ.** undici đặt `headersTimeout` mặc định đúng 300.000ms; muốn khác phải đổi
  dispatcher. Mã nguồn **không ghi một con số nào** nên đọc code không thấy. Với 9 node,
  đẻ chain mất ~305s ⇒ vượt ngưỡng. Đo thật: `warp-test` in
  *"POST không kết luận được (fetch failed), sự thật lấy từ danh bạ"* ở giây **305,8**.
- 🔴 **HẠN GIỜ CẮM CỨNG LÀ MỘT GIẢ ĐỊNH VỀ QUY MÔ MẠNG.** `smoke-l1` cắm 300s — vừa đủ
  cho 5 node, hỏng ngay ở 9 node. Bất cứ hạn giờ nào bao một thao tác *tỉ lệ với số node*
  đều phải **suy từ số node**, không được là hằng số. Nay: `60s + 60s/node`.
- 🔴 **BÀI KIỂM PHẢI THEO ĐÚNG LUẬT MÀ SẢN PHẨM ĐÃ THEO.** Giao diện coi kết quả POST dài
  là *không kết luận được* từ M10.4/M10.5, nhưng bộ kiểm thử thì chưa — nên nó **báo đỏ
  cho một sản phẩm hoạt động đúng** và bỏ lại **chain mồ côi ăn một slot**. Nay cả ba bài
  đi qua `thaoTacDai()` trong `warp-common.mjs`: bắn POST → đọc `/api/progress` tới khi
  **lượt của chính mình** kết thúc (khớp `name`+`kind`) → hỏi **danh bạ** xem sự thật.
- **Dấu nháy đơn trong đoạn `python3 -c '...'` nhúng trong chuỗi ssh sẽ ĐÓNG chuỗi ssh.**
  Lỗi hiện ra là `thu: command not found` — đọc như lỗi trên server, thực ra là shell
  máy dev. Script dài thì `scp` lên rồi chạy, đừng nhồi vào một dòng ssh.
- 🔴 **BẪY `pgrep`/`ps|awk` — LẦN THỨ NĂM, cửa mới: MẪU QUÁ HẸP.** Bốn lần trước là
  mẫu **tự khớp chính nó**; lần này ngược lại — mẫu
  `/faucet\/(smoke|warp|bridge)-?[a-z]*\.mjs/` **không khớp `smoke-l1.mjs`** vì tên tệp
  có **chữ số**. Vòng canh kết luận "không còn tiến trình" trong khi bài kiểm đang chạy
  bình thường (đo lại: sống 86s). Nếu tin nó mà chạy bài tiếp theo thì hai lượt đẻ chain
  chồng nhau trên cùng một console.
  ⇒ Vòng canh phải có **cả hai chiều đối chứng**: mẫu rộng (`grep -c "[f]aucet/"`) và
  một dấu hiệu độc lập (kích thước log tăng). Một dấu hiệu duy nhất về sự sống là không đủ.
- 🔴 **`docker compose down -v` KHÔNG xoá DB Blockscout — nó là BIND MOUNT.** Volume
  khai trong compose thì `-v` xoá; Blockscout để dữ liệu ở
  `docker-compose/services/{blockscout,stats}-db-data` trên đĩa host. Hậu quả đo được:
  sau re-genesis explorer vẫn phục vụ **115 block / 9.008 tx của chuỗi đã chết**, API
  trả 200, trang vẫn đẹp — không dấu hiệu nào. Phải xoá **NỘI DUNG** hai thư mục đó
  (`sudo find <dir> -mindepth 1 -delete`), **đừng `rm -rf` chính thư mục** (bẫy inode).
- 🔴 **`explorer-full/9chain-a1-server.env.sh` là SCRIPT ÁP CẤU HÌNH, không phải file
  env.** `. file.sh` trong script khác là tự sát: nó có `set -euo pipefail` và
  `${A1_PUBLIC_HOST:?}` nên shell gọi nó **thoát ngay tại dòng đó**, các lệnh sau
  không chạy. Tên đuôi `.env.sh` đọc như file env — đó là cái bẫy.
- 🔴 **Faucet nướng `FAUCET_PK` vào ENV LÚC TẠO CONTAINER, và container đó không có
  định nghĩa nào trong repo** (dựng bằng `docker run` tay). Đổi `faucet.env` trên đĩa
  **không có tác dụng** — phải `docker rm` rồi `docker run` lại. Cấu hình thật moi ra
  bằng `docker inspect`; đã ghi lại trong `docs/VI-VAN-HANH.md`.
  Điểm sáng: faucet **tự chẩn đoán đúng** — *"VÍ FAUCET RỖNG trên chain này. Sai khoá,
  hay genesis khác?"*. Thông báo lỗi nói ra giả thuyết đáng giá hơn một dòng stack trace.
- 🔴 **RPC công khai KHÔNG phục vụ `/ext/bc/C/avax`** (Caddy lọc path, chỉ mở
  `/ext/bc/*/rpc`). Ví X/P của avalanchego cần endpoint đó ⇒ **mọi thao tác X↔P↔C phải
  đi qua SSH tunnel tới `127.0.0.1:9650`**, không qua tên miền. Đừng mở thêm path công
  khai chỉ để tiện — đó là quyết định bảo mật.
- 🔴 **Tunnel xong vẫn 403 nếu Host header sai.** Node khai
  `--http-allowed-hosts=localhost,127.0.0.1`; container gọi qua
  `host.docker.internal:19650` bị **403**. Cách chạy được: đặt **ssh tunnel NẰM TRONG
  chính container** rồi trỏ `WALLET_URI=http://127.0.0.1:9650`. Lợi ích kèm theo: khoá
  quỹ không bao giờ rời máy dev.
- 🔴 **Lệnh rsync trong `docs/DEPLOY-KSGAME.md` sẽ ĐẨY `keys.txt` LÊN SERVER.** Nó chỉ
  loại trừ `local-net/net`, trong khi khoá quỹ nằm ở `local-net/net-public/`. Phải là
  `--exclude 'local-net/net-*'`. Máy dev này **không có rsync** nên tôi dùng
  `tar -czf - --exclude=.git | ssh 'tar -xzf -'` — cũng an toàn hơn vì liệt kê rõ.
- **`down -v` không xoá được network nếu còn container lạ bám vào.** `9chain-a1-faucet`
  bám `net_a1net` nên network sống sót; may là thư mục mới cũng tên `net` ⇒ cùng tên
  project ⇒ 9 node mới vào đúng network cũ và IP `172.28.0.11` giữ nguyên, faucet không
  phải đổi `FAUCET_RPC`. **Đây là may, không phải thiết kế** — đổi tên thư mục là gãy.

### Thêm từ phiên 2026-08-26 (đợt 8 — diễn tập re-genesis cục bộ)
- 🔴 **Tham số kinh tế nằm trong BINARY, không trong `genesis.json`.** Đổi
  `SupplyCap`/`MaxValidatorStake`/… trong `genesis_9chain_a1.go` là **phải build lại
  image node và deploy**, không chỉ sinh lại genesis. Chi tiết + hậu quả tràn ngược:
  mục 1b đầu file. Đối chứng rẻ nhất sau mỗi lần deploy:
  `docker logs <node> 2>&1 | head -1 | grep -o '"supplyCap":[0-9]*'`.
- 🔴 **Cổng chặn viết bằng ngôn ngữ khác với thứ nó canh thì nó canh cái khác.**
  `check-consistency.mjs` (JS) không đọc mã Go, nên bản tokenomics **không biên dịch
  được** vẫn qua cổng 17/17 + 6/6 đối chứng ngược. Lần thứ ba dự án dính họ này
  (trước đó: đo mã HTTP thay vì nội dung; đo `docker stats` thay vì CPU tích luỹ).
  ⇒ Cổng phải chạm **chính artifact** sẽ chạy thật. netgen nay đọc `SupplyCap` thẳng
  từ `genesis.A1Params` — hết bản chép tay, hết đường trôi lệch.
- 🔴 **`sed -i` TRONG CONTAINER SỬA CHÍNH FILE NGUỒN ĐANG BIND-MOUNT.** Tôi chạy một
  ca đối chứng ngược "hạ trần về 720 triệu" bằng `sed -i` trên `/src` và nó **ghi
  thẳng vào repo** — `git checkout` mới lấy lại được. Cách đúng: mount `:ro` và thay
  file bằng `go build -overlay <json>` (Go nhận bản đồ thay tệp, nguồn không đụng).
- 🔴 **`platform.getCurrentSupply` > tổng allocation X/P là BÌNH THƯỜNG.** Nó đã cộng
  sẵn `potentialReward` của mọi validator genesis. Và `InitialSupply()` **không** tính
  C-Chain. Muốn đối chiếu tổng phát hành thì cộng tay X/P + C-Chain từ `genesis.json`,
  đừng hỏi P-Chain.
- **Subnet docker `172.28.0.0/16` đã bị bộ dev-local chiếm** (`net_a1net`, còn sống vì
  `9chain-a1-faucet` bám vào). Dựng bộ thứ hai song song phải đổi dải — `sed` trên
  compose là đủ, `genesis.json` **không chứa IP** nên không phải sinh lại khoá.
- **`container_name` do netgen sinh ra là cố định `9chain-a1-node-N`**, không mang tên
  project ⇒ hai bộ mạng không chạy song song được. Volume thì CÓ mang tên project
  (`net_…` vs `net-drill9_…`), nên `docker rm` container cũ **không mất dữ liệu** bộ cũ.

### Thêm từ phiên 2026-08-26 (đợt 7 — tokenomics 9 tỷ)
- 🔴 **`SupplyCap` là `uint64`, và LOVE9 có 9 chữ số ⇒ TRẦN THẬT LÀ 18,447 TỶ LOVE9.**
  90 tỷ (số trong kế hoạch BOD) = `9e19` = **4,88 lần** `uint64` max. Đã thử biên dịch
  thật, có đối chứng ngược: `90_000 * MegaAvax` → *"constant … overflows uint64"*;
  `18_000 * MegaAvax` → build sạch. **Con số đó đến từ C1, nơi Cosmos SDK đếm bằng
  `big.Int` nên 90 tỷ hoàn toàn bình thường.** Bài học tổng quát: **mọi đại lượng chép
  từ C1 sang A1 phải hỏi "kiểu dữ liệu bên kia chứa nổi không" TRƯỚC khi chép.**
- 🔴 **Số chữ số thập phân KHÔNG phải bản sắc — tôi từng nói sai và suýt lái quyết định
  đi đường đắt.** Danh sách bản sắc (client/token/HRP/VM/networkID/chainId) **không có**
  nó, và **người dùng đã luôn thấy 18 chữ số** (`web/lib/chain.ts` `thapPhan: 18`; C1
  cũng 18). `1e9` chỉ là đơn vị kế toán nội bộ của P/X-Chain.
- 🔴 **48,79% `uint64` KHÔNG phải rủi ro.** `reward/calculator.go:69` kết thúc bằng
  `return min(remainingSupply, finalReward)` ⇒ phép cộng `uint64` thô ở
  `standard_tx_executor.go:1533` **không thể tràn**, bất kể `supplyCap` chiếm bao nhiêu
  phần dải. Đó là dư địa để NÂNG trần sau này, không phải biên an toàn số học.
- 🔴 **Nếu có ngày phải đổi thang đơn vị: `1e9` nằm ở BA chỗ độc lập** —
  `netgen/allocation.go` `unitLOVE9` · `netgen/main.go:273` (P/X→wei trong
  `cChainGenesis`) · `coreth/plugin/evm/atomic/tx.go:33` `X2CRateUint64`. Lệch nhau
  **không gây lỗi nào**: đổi (1) quên (2) ⇒ số dư C-Chain genesis sai 100 lần, mạng vẫn
  khởi động. Chi tiết + 6 rủi ro: `docs/RUI-RO-THANG-1E7.md`.
  (Quyết định cuối là **KHÔNG đổi thang** — xem D-039, nên bảng rủi ro đó hiện là dự phòng.)
- 🔴 **Chú thích trong `allocation.go` SAI và đã sửa:** nó ghi *"đặt LiquidXP > 0 cho quỹ
  staking là sai — tiền sẽ bị bỏ qua"*. Mã thật: vòng dựng UTXO **X-Chain**
  (`genesis.go:305-320`) lấy **mọi** allocation có `InitialAmount > 0`, **không** bỏ qua
  địa chỉ staked; chỉ vòng **P-Chain** mới bỏ qua.
- 🔴 **`patches/` KHÔNG tự cập nhật, và nó ĐÃ lệch.** Nhánh có 5 commit chủ quyền,
  `patches/` chỉ có 4 — commit mở đường bật API Warp chưa bao giờ được xuất. Nay 6.
  **Commit vào cây fork xong PHẢI chạy lại** `git format-patch 1cf1fc3..9chain-a1 -o patches/`.
- 🔴 **`git am` PHẢI có `--keep-cr`** khi kiểm chứng patch series. Thiếu nó thì mọi tệp
  CRLF (`netgen/main.go`) đổi hết xuống dòng ⇒ tree lệch ⇒ **kết luận nhầm là series
  hỏng**. `apply-sovereign.sh:72` và `rebase-drill.sh:57` đã có cờ; cái bẫy nằm ở người
  gõ tay để kiểm. Đã dính đúng thế 2026-08-26.
- **Uỷ quyền tính vào `MaxValidatorStake`** (`proposal_tx_executor.go:801`). Self-bond
  lớn ⇒ validator genesis gần hết chỗ nhận uỷ quyền. Ở 999.999/node thì dư địa còn 624
  triệu — thoải mái.
- **`InitialStakeDurationOffset` là cách so le nhiệm kỳ, có sẵn trong avalanchego.**
  Ràng buộc: `offset × (số node − 1) < InitialStakeDuration`. `MaxStakeDuration` = 365
  ngày là **trần**, nên nhiệm kỳ 1 năm không phải lựa chọn.

### Thêm từ phiên 2026-08-26 (đợt 6 — vá cổng chặn + Đợt 1 audit)
- 🔴 **BÀI KIỂM DÀI PHẢI CHẠY BẰNG `nohup` + LOG TRÊN SERVER, KHÔNG QUA SSH TIỀN CẢNH.**
  Công cụ cắt lệnh tiền cảnh ở **600 giây** rồi đẩy sang nền — ssh đứt, tiến trình
  `node` ở đầu kia nhận SIGHUP và **chết giữa chừng**. `bridge-test.mjs` mất ~13
  phút nên nó *luôn* dính. Hậu quả không phải "mất kết quả": bài này tự thu hồi hai
  chain nó đẻ ra, chết trước bước đó là để lại **2 chain mồ côi ăn 2 slot** trong
  trần 15. Sổ dọn của bài kiểm không cứu được, vì cả tiến trình bị giết.
  ⇒ Cách đúng:
  ```
  ssh … 'nohup bash -c "cd ~/9chain-a1/src && node local-net/faucet/bridge-test.mjs" > ~/bt.log 2>&1 &'
  ```
  rồi đọc `~/bt.log`. Áp cho **mọi** bài đụng mạng thật: `bridge-test`, `warp-test`,
  `load-test`, `smoke-l1 --create-chain`.
- 🔴 **TỆP LOG 0 BYTE KHÔNG PHẢI "ĐANG CHẠY, CHƯA XẢ ĐỆM".** Tôi coi nó là vậy trong
  ~15 phút. 0 byte sau vài phút của một bài in ra liên tục nghĩa là **chưa bao giờ
  có gì** — đi hỏi tiến trình, đừng chờ thêm.
- 🔴 **BẪY `pgrep` NGOẶC VUÔNG — LẦN THỨ TƯ.** `pgrep -af "[b]ridge-test"` báo "còn
  sống" trong khi tiến trình đã chết, vì dòng lệnh của tôi có `echo "… bridge-test …"`
  ngay cạnh và pgrep khớp **chính nó**. Mẹo ngoặc vuông chỉ che chuỗi TRONG MẪU.
  Phép đo không tự khớp được: `ps -eo pid,etimes,cmd | awk '/faucet\/bridge/ && !/awk/'`.
- **`POST /api/revoke` đòi `xacNhan` khớp đúng tên chain.** Thiếu nó thì trả JSON
  `error` chứ không thu hồi gì — và nếu chỉ nhìn "có phản hồi" thì tưởng đã dọn xong.
  Cửa này là cố ý (cùng vai với ô "gõ lại tên chain" trên giao diện).

### Thêm từ phiên 2026-08-26 (đợt 5 — chuẩn hoá tiếng Anh)
- 🔴 **ĐỔI TÊN HÀNG LOẠT BẰNG `sed` LÀ SAI CÁCH Ở REPO NÀY — mã nguồn tiếng Việt làm
  tên khoá JSON TRÙNG với thứ khác.** Đã bắt được bốn lần trong một phiên:
  `dangChay` vừa là khoá API vừa là **prop của `<Nut>`**; `kyHieu` vừa là khoá API vừa
  là hằng `CHAIN.kyHieu`; `'xong'`/`'chay'` vừa là trạng thái bước vừa là state UI
  (`Pha`, `kichHoat`); và `ten:` trong `dien(vi.X, { ten })` là **khoá nội suy i18n** —
  đổi nó thì **không có lỗi biên dịch nào**, chỉ là chữ hiện ra sai.
  ⇒ Đổi có ngữ cảnh (`tienTrinh.dangChay`, `dangChay: boolean`), đừng đổi theo từ.
- 🔴 **TypeScript là trọng tài, nhưng nó KHÔNG bắt được khoá i18n.** `tsc --noEmit`
  bắt sạch mọi chỗ lệch giữa type và cách dùng — đổi type trước rồi để nó chỉ chỗ là
  cách rẻ nhất. Nhưng `dien(chuoi, {ten})` chỉ là `Record<string,...>`, nên chỗ đó
  phải soi bằng `git diff`, không tin trình biên dịch được.
- 🔴 **Dịch ở RANH GIỚI, đừng dịch cả tầng.** State nội bộ (`tienTrinh`) giữ tên tiếng
  Việt; chỗ `send(res, 200, {...})` mới map sang tiếng Anh. Một chỗ sửa thay vì hai
  chục, và mã nguồn không bị nửa Việt nửa Anh.
- 🔴 **Đổi khoá JSON là ĐỔI HỢP ĐỒNG DỮ LIỆU — hỏi ai đang đọc TRƯỚC.** `9Scan-A1`
  đọc `console-chains.json` thật (`components/explorer/chains.tsx`). May là họ chỉ
  dùng khoá vốn đã tiếng Anh (`chains`, `name`, `chainId`, `blockchainID`, `subnetID`,
  `rpc`, `retired`) nên không gãy. Lần sau vẫn phải kiểm trước, không phải đoán.
- 🔴 **Bản ghi đã ghi thì không bao giờ được viết lại — đổi khoá bên sinh là phải DI
  TRÚ.** 17 bản ghi mang `presetTen` sẽ lặng lẽ mất nhãn preset. Không lỗi, không dấu
  hiệu, chỉ là một cột trống mà không ai nhớ là nó từng có chữ.
- **Solidity: tên tệp và tên contract là một cặp.** `compile.mjs` tra
  `contracts["<tệp>.sol"]["<Contract>"]`. Đổi tệp mà không đổi contract (hay ngược
  lại) thì lượt biên dịch sau ném lỗi `undefined`, và nó ném ở chỗ trông như lỗi solc.
- **Đổi route tĩnh thì Caddy phải đi TRƯỚC web.** `web-deploy.sh` tự kiểm liên kết qua
  tên miền công khai ở bước cuối, nên deploy web trước là script tự báo đỏ vì Caddy
  chưa định tuyến đường mới. Thứ tự đúng: Caddy → faucet → console → danh bạ → web.

### Thêm từ phiên 2026-08-26 (đợt 4 — đổi tên miền)
- 🔴 **HTTP 525 CÓ THỂ LÀ TIẾNG VỌNG CỦA LẦN THỬ TRƯỚC, KHÔNG PHẢI TRẠNG THÁI HIỆN
  TẠI.** Cloudflare giữ trạng thái "origin không bắt tay TLS được" **theo từng
  hostname** một lúc. Thử một tên miền TRƯỚC khi Caddy có site block cho nó ⇒ CF ghi
  nhớ hỏng ⇒ sau khi thêm site block, CF **vẫn trả 525 và không thèm gọi tới origin**.
  Triệu chứng đọc y hệt "DNS trỏ sai chỗ", kể cả phép đo tưởng là dứt điểm: log origin
  đếm được **0 request** mang host đó. Nó tự hết sau vài phút.
  ⇒ **Đừng đo một tên miền trước khi cấu hình cho nó tồn tại** — lượt đo đó không vô
  hại, nó **tạo ra** cái trạng thái mình sẽ chẩn đoán nhầm sau đó.
  ⇒ Phép tách bạch đúng: thử TỪ CHÍNH SERVER qua loopback
  (`curl -k --resolve <ten>:443:127.0.0.1`). TLS bắt tay được + trả 403 nghĩa là
  **origin lành**, mọi thứ còn lại là chuyện của Cloudflare và phần lớn là chuyện tự hết.
- 🔴 **Caddy chỉ đọc biến môi trường lúc container KHỞI ĐỘNG.** Để tên miền trong
  `{$DOMAIN}` là mỗi lần đổi tên phải `--force-recreate` (Caddy chết vài giây, và ví
  đang mở sẽ **giữ nguyên banner "Unable to connect"** cho tới khi người dùng tự đổi
  mạng qua lại). Viết thẳng tên miền vào Caddyfile thì `caddy reload` là đủ.
- 🔴 **Trộn biến với literal trên cùng một dòng địa chỉ site đẻ ra "duplicate site
  address"** khi biến tình cờ bằng literal — và Caddy từ chối **CẢ file**, tức sập
  toàn bộ web chứ không hỏng riêng một tên.
- 🔴 **`caddy-deploy.sh` từng MÙ với site có nhiều tên.** Regex cũ khớp cả dòng nên
  `rpc-a1.9chain.org, rpc-testnet-a1.9chain.org {` **không khớp gì cả** ⇒ mất phép
  kiểm cho **cả hai** tên, mà script vẫn in "✓ xong". Đã sửa: cắt `{` → tách dấu phẩy
  → lọc. Và nó nay **thất bại** nếu không rút được tên miền nào, thay vì bỏ qua.
- 🔴 **Probe phải hợp với thứ đang đo.** Tên miền RPC cố ý lọc path nên `GET /` trả
  **404 đúng thiết kế**; đo nó bằng `GET /` là báo động giả, mà nới 404 thành "đạt"
  cho mọi tên miền là mất khả năng bắt lỗi định tuyến. Tên `rpc-*` nay đo bằng một
  lượt `eth_chainId` thật.
- 🔴 **Đổi tên miền TRANG mà giữ cả hai tên cùng phục vụ là làm hỏng bảo đảm của
  SIWE — im lặng, không lỗi nào.** Thông điệp SIWE do **server** dựng nên nó luôn ghi
  một domain duy nhất, trong khi trang gọi console theo `location.hostname`. Người vào
  bằng tên cũ sẽ ký thông điệp nói "a1.9chain.org wants you to sign in" trong khi đang
  đứng ở tên khác. Server vẫn nhận (nó đối chiếu với chính nó), nên **không có dấu
  hiệu hỏng** — nhưng ô `domain` của EIP-4361 tồn tại đúng để người ký thấy mình đang
  ký cho site nào. Vì thế tên miền trang **phải** redirect, không được phục vụ song song.
- **Ảnh/asset tĩnh cần route Caddy RIÊNG, và phải nghiệm thu bằng `content-type`.**
  Gốc `/` là Blockscout — SPA trả **200 kèm HTML rỗng** cho mọi đường lạ, nên quên
  route thì ảnh "200" mà ví hiện ô trống. Đo `content-type` phải là `image/*`.
- **`A1_HTTP_ALLOWED_HOSTS` KHÔNG liên quan tới tên miền công khai** (chú thích cũ
  trong `caddy.compose.yml` bảo đặt nó bằng tên miền RPC — sai từ lúc Caddyfile có
  `header_up Host {upstream_hostport}`, và sai theo kiểu vô hại nên không ai phát
  hiện). Node chỉ thấy `127.0.0.1:9650`. Đổi tên miền **không** phải restart validator.

### Thêm từ phiên 2026-08-26 (autopilot — M10.3→M10.7)
- 🔴 **Cloudflare cắt kết nối ở ~100 giây (HTTP 524).** Mọi thao tác dài (đẻ/thu hồi
  chain: ~170s) đi qua tên miền công khai đều **hỏng ở phía trình duyệt** trong khi
  server làm xong. Đừng kết luận từ mã HTTP của POST dài: bắn POST rồi đọc một
  endpoint tiến trình rẻ, và khi nó kết thúc thì hỏi **trạng thái/danh bạ** xem sự
  thật là gì. Và chỉ kết luận "xong" **sau khi đã thấy `dangChay=true` ít nhất một
  lần** — gọi sớm quá là đọc trúng kết quả của lượt TRƯỚC.
- 🔴 **`handle` của Caddy loại trừ lẫn nhau và xét THEO THỨ TỰ VIẾT.** Đặt
  `@trangmoi` (có `/faucet/*`) trước `@faucet_api` là API faucet trả 404 **trong khi
  trang faucet vẫn hiện ra bình thường** — nhìn bằng mắt không thấy gì.
- 🔴 **Blockscout ở gốc là SPA: mọi đường dẫn lạ trả HTTP 200 kèm khung rỗng**, không
  phải 404. Mọi bài kiểm URL vì thế phải đo **NỘI DUNG** (ví dụ `<title>` không
  rỗng). Đo bằng mã trạng thái cho ra **xanh giả** — đã dính với `/tc-a/`.
- 🔴 **Bản xuất tĩnh của Next dùng đường dẫn TUYỆT ĐỐI cho liên kết nội bộ**, nên
  phục vụ cả site dưới một tiền tố (`/moi/`) là **mỗi cú bấm nhảy ra khỏi tiền tố**.
  Mỗi trang phải có route thật.
- 🔴 **Deploy console giữa lúc một lượt đẻ/thu hồi đang chạy làm DANH BẠ NÓI DỐI**:
  rolling restart do docker làm nên nó chạy tới cùng, còn console chết trước khi ghi
  trạng thái. Cửa sổ này rộng ~170 giây. `console-deploy.sh` nay đọc
  `/api/tien-trinh` và từ chối restart khi `dangChay=true`.
- 🔴 **`0 validator` là một TRẠNG THÁI THẬT, đừng dùng 0 làm sentinel "đang tải".**
  Subnet track mà chưa có validator thì chain vẫn trả lời `eth_chainId`, ví vẫn kết
  nối, **chỉ là giao dịch không bao giờ chốt** — và không có dấu hiệu nào khác.
- **Server dùng chung cổng loopback với 9Scan-A1.** A1 đang giữ: 8082 · 8088 · 8090 ·
  8091 · 8092 · 8093 · **8095** · 8100 · 8101 · 9650 · 9660. 8094 là của họ.

### Thêm từ phiên 2026-08-25 (thứ NĂM, đợt 2 — giao diện)
- 🔴 **Bẫy inode của Docker CŨNG áp cho THƯ MỤC.** `rm -rf <thư-mục-đang-mount>` rồi
  tạo lại ở cùng đường dẫn sinh inode MỚI; container vẫn nhìn inode cũ (đã xoá) và
  thấy **rỗng vĩnh viễn**, trong khi `ls` trên host ra đủ file. Xoá **nội dung**
  (`find dir -mindepth 1 -delete`), đừng xoá thư mục. Phép bắt rẻ nhất: đếm số tệp
  ở host và trong container rồi so.
- 🔴 **"HTTP 200" KHÔNG chứng minh đúng site đang phục vụ.** Đổi nhầm một dòng
  `reverse_proxy` làm tên miền 9scan trỏ sang trang A1, mà `caddy-deploy.sh` vẫn báo
  xanh vì nó chỉ đo mã HTTP. Phép kiểm tên miền phải chạm **nội dung** (ví dụ
  `<title>`), không chỉ mã trạng thái.
- 🔴 **Next xuất tĩnh tham chiếu chunk bằng đường TUYỆT ĐỐI `/_next/...`**, không
  theo tiền tố trang. Đặt trang ở `/faucet/` mà quên route `/_next/*` thì HTML vẫn
  **200** còn CSS/JS **404** — trang hiện ra không style, không tương tác, và mọi
  phép kiểm bằng `curl` vẫn xanh. `web-deploy.sh` nay bốc một đường JS **ra khỏi
  chính HTML vừa tải** rồi gọi thử.
- 🔴 **Cổng loopback trên máy chủ này DÙNG CHUNG với 9Scan-A1.** 8094 là của họ
  (`9scan-a1-web`). Không có bảng cổng nào — xem `sudo ss -tlnp | grep 127.0.0.1`
  trước khi chọn. A1 đang giữ: 8082 · 8088 · 8090 · 8091 · 8092 · 8093 · **8095** ·
  8100 · 8101 · 9650 · 9660.
- **Đọc DOM ngay sau `.click()` là đọc trạng thái TRƯỚC render** — React cập nhật
  state bất đồng bộ. Chờ một nhịp, hoặc gọi thẳng handler qua `__reactProps` để tách
  bạch lỗi sản phẩm với lỗi phép đo.
- **axe-core trong jsdom phải khai `runScripts: 'outside-only'`**, nếu không
  `window.eval(axe.source)` im lặng không làm gì và lỗi hiện ra ở tận dòng
  `.run()` — đọc như axe hỏng chứ không như thiếu cờ. Và **tắt `color-contrast`**:
  jsdom không có layout engine nên nó cho cả dương tính giả lẫn âm tính giả.

### Thêm từ phiên 2026-08-25 (thứ NĂM — Warp/ICM)
- 🔴 **API Warp TẮT MẶC ĐỊNH, và nó hỏng ở ĐẦU KIA.** `sendWarpMessage` vẫn là giao
  dịch thật, vẫn chốt, vẫn sinh log — mọi dấu hiệu ở đầu gửi đều xanh. Chỉ tới lúc
  gom chữ ký mới lộ, và lỗi khi đó là `-32601 method does not exist`, **đọc như gọi
  sai tên hàm chứ không như thiếu cấu hình**. Bật Warp precompile trong genesis mới
  là một nửa; nửa kia là `{"warp-api-enabled": true}` trong chain config.
- 🔴 **Chain config phải ghi TRƯỚC đợt rolling restart.** Node đọc nó đúng lúc *dựng
  chain*, mà chain chỉ được dựng sau khi node track subnet — tức trong chính đợt
  restart ấy. Ghi muộn một nhịp là cả 5 node dựng chain với cấu hình mặc định và
  phải restart lần nữa mới sửa được.
- 🔴 **`tx.wait()` của ethers v6 NÉM LỖI khi receipt có `status: 0`** — nó không trả
  receipt về. Nên bài kiểm viết `const r = await tx.wait(1); kiem(..., r.status === 0)`
  là **tự làm sập chính mình đúng lúc sản phẩm hoạt động ĐÚNG**. Cả ba bài "phải đỏ"
  của warp-test bị nuốt thành một dòng "transaction execution reverted". Dùng
  `phaiRevert()` trong `faucet/warp-common.mjs`.
- 🔴 **`ContractFactory.deploy()` tự quản nonce** ⇒ đi vòng qua mọi lớp bảo vệ nonce
  của bài kiểm. Nạp hợp đồng phải qua `napHopDong()` (dựng tx bằng
  `getDeployTransaction()` rồi gửi qua `guiVoiNonce`).
- 🔴 **Bài kiểm phải ghi tên chain vào sổ dọn NGAY sau khi `/api/create` trả về**,
  không phải sau khi mọi bước sau đó xong. Chain tồn tại từ giây đó; ghi muộn là một
  lượt chạy hỏng để lại **chain mồ côi ăn một slot vĩnh viễn** trong trần 15.
- 🔴 **Đừng đặt module cần `ethers` vào `local-net/lib/`.** Node phân giải
  node_modules từ thư mục chứa FILE đi lên, mà trên server ethers **chỉ có** trong
  `local-net/faucet/node_modules`. `lib/` là chỗ của module **zero-dep** (console
  import từ đó, và gốc dự án trên server không có node_modules).
- **Mẹo ngoặc vuông `pgrep -f "[t]ai-test"` chỉ che chuỗi TRONG MẪU.** Nếu cùng dòng
  lệnh còn chỗ khác chứa chuỗi thật (ví dụ `echo "... tai-test ..."` ngay cạnh) thì
  nó vẫn tự khớp. Đây là lần thứ ba dự án dính họ bẫy này, mỗi lần một cửa khác.
- **Predicate ≠ calldata.** Chữ ký Warp đi vào giao dịch qua **access list**
  (`{address: 0x02…05, storageKeys: <các khối 32 byte>}`), không phải calldata. Đặt
  nhầm chỗ thì `getVerifiedWarpMessage` trả `valid=false` **mà giao dịch vẫn chốt
  bình thường** — không có tín hiệu hỏng nào.
- **API Warp nhận `ids.ID` dạng cb58, còn EVM đưa messageID dạng topic 32 byte hex.**
  Cầu nối: `local-net/lib/cb58.mjs` (zero-dep, `--self-test` 8/8).

### Thêm từ phiên 2026-08-25 (thứ tư, đợt 2 — mở console + siết Cloudflare)
- 🔴 **`A1_TRUST_PROXY=1` mà origin còn nhận kết nối thẳng = LỖ HỔNG, không phải bản
  vá.** Cloudflare ghi đè `CF-Connecting-IP` ở biên nên **đi qua** Cloudflare thì
  không giả được — nhưng **không đi qua thì không ai ghi đè cả**. Đo thật:
  `curl -k --resolve <domain>:443:139.99.145.13 -H 'CF-Connecting-IP: 1.2.3.4' .../faucet/whoami`
  → `{"ip":"1.2.3.4"}`. Hai thứ này phải bật **cùng lúc**, không bao giờ tách.
- 🔴 **`caddy-deploy.sh` ghi đè TOÀN BỘ Caddyfile từ nguồn.** Bất kỳ site block nào
  chỉ tồn tại trên server sẽ **biến mất không dấu hiệu**. Đã làm explorer chết 31
  phút (B-6). Và nhìn từ phía chain thì mọi thứ vẫn xanh — RPC + `testnet-a1` cùng
  file, vẫn sinh bình thường. Script nay tự kiểm mọi tên miền, **suy từ chính
  Caddyfile vừa áp** chứ không cắm cứng danh sách.
- **"Cổng 443 mở" ≠ "origin phục vụ cho bất kỳ ai".** Sau khi siết, TCP vẫn bắt tay
  được (đúng), nhưng HTTP phải 403. Không tách hai tầng này thì bản vá trông như vô hiệu.
- 🔴 **Đo tải qua URL công khai làm chậm NGƯỜI DÙNG THẬT.** p50 C-Chain công khai đi
  22ms → 236ms → 1.720ms → **3.852ms** theo mức tải. Và ngưỡng chốt an toàn cũ
  (4.000ms) cao tới mức **không bao giờ bắt được** điều đó; đã hạ về 1.500ms.
- **Trần TPS KHÔNG phải tham số genesis** (đính chính M9.3). Nâng gasLimit 5 lần
  không đổi thông lượng; block chỉ đầy 16%; nút thắt ở đường nạp giao dịch của node
  ~230 tx/s. Xem D-033.

### Thêm từ phiên 2026-08-25 (thứ tư, đợt 1)
- 🔴 **`Verify()` của config subnet-evm KHÔNG phải hợp đồng về tính chạy được.** Nó
  kiểm **hình dạng**, không kiểm **hệ quả**. `minBaseFee: 0` qua sạch
  (`commontype/fee_config.go` chỉ từ chối số âm) rồi làm chain **không đẻ nổi block
  nào** vì `customheader/block_gas_cost.go:94` từ chối `baseFee.Sign() <= 0`, và chỗ
  gọi nó là `FinalizeAndAssemble` — đường **dựng** block, không phải đường kiểm block
  của người khác. Với genesis (bất biến), khoảng cách giữa "cấu hình hợp lệ" và
  "chain sống được" là chỗ lọt những chain chết vĩnh viễn ngay lúc sinh ra.
- 🔴 **Precompile khai `blockTimestamp > 0` thì ở BLOCK 0 nó CHƯA hoạt động, và
  `eth_call` lúc đó trả `0x` RỖNG — không phân biệt được với "khoá cấu hình bị bỏ
  qua".** Dính đúng thế với Warp: bài kiểm báo "Warp TẮT" trên chain mà `warpConfig`
  nằm đúng chỗ trong genesis (đã đối chiếu md5 với server, và đọc lại file console
  đưa cho CLI). Genesis khai `"timestamp": "0x0"` nên block 0 có thời gian 0, trong
  khi Warp buộc phải bật ở ≥ mốc Durango. **Phải đẩy chain qua block 0 rồi mới đọc**,
  và báo cáo cả hai lần đọc — chênh lệch giữa chúng mới là bằng chứng.
- 🔴 **Bẫy nonce không nằm ở "giao dịch bị từ chối" — nó nằm ở MỌI giao dịch thứ hai
  của cùng một ví.** `tx.wait(1)` đã trả về mà lượt `getTransactionCount("pending")`
  kế tiếp vẫn đọc ra số cũ ⇒ `nonce too low`. Chỉ cắn khi hai lượt gần nhau đủ, nên
  nó biểu hiện thành **đỏ ngẫu nhiên** — thứ làm người ta mất niềm tin vào bài kiểm.
  Cách chữa: mọi lượt gửi đi qua một hàm đọc nonce tươi + thử lại **chỉ với lỗi nonce**.
- **Trần TPS chuyển nút thắt sang BỘ BƠM khi nâng gasLimit.** Mỗi ví gửi tuần tự
  (`await` một vòng RPC mỗi giao dịch, ~290ms) ⇒ **~3,45 tx/s mỗi ví**. Nên "đo trần
  chain" mà giữ nguyên số ví là đang đo cái script. Xem M9.4.
- **`docker compose config` không đủ để tin là file đã lên server.** `console-deploy.sh`
  bản đầu chỉ đối chiếu md5 của `server.mjs`, nên một thay đổi nằm trọn trong
  `presets.mjs` hay `9chain-a1-config/l1-evm-genesis.json` có thể **không lên** mà
  script vẫn in "✓ khớp" rồi restart. Nay nó đối chiếu **mọi** file đã chép.

### Thêm từ phiên 2026-08-25 (thứ ba)
- 🔴 **`pgrep -f "<chuỗi>"` trong vòng lặp canh chừng TỰ THẤY CHÍNH NÓ** — cùng họ với
  bẫy `pkill -f` đã ghi bên dưới, nhưng dính ở chỗ khác nên vẫn vấp. Lệnh
  `while pgrep -f "load-test.mjs"; do sleep 60; done` có chuỗi `load-test.mjs` **trong
  chính dòng lệnh của nó** ⇒ điều kiện luôn đúng ⇒ canh mãi không bao giờ kết thúc,
  dù tiến trình thật đã xong từ lâu. Nó **không báo lỗi**, chỉ im lặng chờ.
  Dùng mẹo ngoặc vuông: `pgrep -f "[t]ai-test.mjs"`. Áp dụng cho `pgrep`, `pkill`,
  `ps | grep` — bất cứ thứ gì so khớp trên toàn bộ dòng lệnh.
- 🔴 **Chụp chain data phải DỪNG node trước khi `tar`.** leveldb đang ghi thì bản chép
  không nhất quán và hỏng **im lặng** — file có đủ, mở ra mới biết. Quy trình đã chạy
  thật: `docker stop node-5` → `tar` → **`docker start` ngay** → kiểm `5/5 connected`
  → mới kéo file về. Chỉ cần chụp **một** node (5 validator giữ cùng lịch sử).
- **Đo dung lượng chain phải đo dài.** Xem mục soak ở đầu file: ước lượng từ mẫu ngắn
  lệch **30 lần**. Với thứ tăng theo bậc thang (compaction định kỳ), mẫu vài phút nói dối.

### Thêm từ phiên 2026-08-25 (thứ hai)
- 🔴 **`docker stats --no-stream` KHÔNG dùng để kết luận được.** Cùng container
  `backend` đo ba lần ra 50,65% · 4,20% · 39,46% — tôi đã kết luận rồi tự phản bác rồi
  lại kết luận. Phép đo đúng là **CPU tích luỹ từ lúc container khởi động**:
  `cat /sys/fs/cgroup/system.slice/docker-<id-đầy-đủ>.scope/cpu.stat` → `usage_usec`,
  chia cho thời gian sống. Ra `backend` = **48,76% trung bình liên tục**, không mơ hồ.
- 🔴 **`eth_estimateGas` ước lượng THIẾU cho giao dịch ĐẦU TIÊN của chain vừa đẻ.**
  Đo có đối chứng trên cùng chain: block 1 → 52037 (hết gas, `status 0`); block 2 trở
  đi → 54183 (chốt được). Nó **giả dạng "tính năng không tồn tại"** vì receipt chỉ có
  `status: 0`, không lý do. Tín hiệu tách bạch: **`eth_call` cùng lời gọi đó THÀNH
  CÔNG** (eth_call chạy trần gas rất lớn) ⇒ vấn đề GAS, không phải cấu hình. Xem D-025.
- 🔴 **Phí gas KHÔNG bao giờ đúng bằng 0 trên subnet-evm.** `legacypool.go:158`
  `PriceLimit` mặc định 1 wei và **dòng 195 tự ép về 1 nếu cấu hình thấp hơn**. Giao
  dịch giá gas 0 bị node NHẬN rồi không bao giờ vào block — hỏng im lặng. Xem D-026.
- **Precompile: phân biệt ba trạng thái bằng `readAllowList`** — trả `0x` RỖNG =
  precompile TẮT · trả `0` = bật nhưng không quyền · trả `2` = Admin. Nhầm "0x rỗng"
  với "0" là chẩn đoán sai hoàn toàn nguyên nhân.
- **Bài nghiệm thu chạy console THẬT phải bị chặn cứng khỏi mạng thật**:
  `A1_COMPOSE_FILE=/khong-ton-tai/...` để lệnh docker nào lọt qua cũng chết vì thiếu
  file thay vì restart 5 validator của mạng công khai. Xem D-023.
- **Bài nghiệm thu không được cắm cứng dữ liệu của một máy** — bản đầu cắm tên chain
  chỉ có ở máy dev, chạy trên server thì báo đỏ ở chỗ code hoàn toàn đúng. Xem D-024.
- **`cat >> BLOCKERS.md` đẩy mục mới xuống dưới "Đã gỡ".** Dính hai lần trong một
  phiên. Dùng Edit chèn đúng chỗ, đừng append.
- 🔴 **`ethers` CÓ trên server, nhưng chỉ ở `local-net/faucet/`.** Ghi chú cũ "thư mục
  gốc không có node_modules" đúng mà thiếu vế này, và vế thiếu suýt đẩy M4.1 sang
  hướng tự viết secp256k1. Đo: `~/9chain-a1/src` → `ERR_MODULE_NOT_FOUND`;
  `~/9chain-a1/src/local-net/faucet` → **OK 6.17.0**. Node phân giải từ thư mục chứa
  FILE đi lên, nên `smoke-l1.mjs` (ở trong `faucet/`) import được còn console thì không.
  Cần thư viện cho console ⇒ cấp `package.json` riêng theo đúng khuôn `faucet/`.
- 🔴 **Thu hồi chain KHÔNG rút node khỏi tập validator P-Chain.** Nên
  `platform.getCurrentValidators({subnetID})` **vẫn trả đủ 5 validator cho chain đã
  chết hẳn** — đúng phép đo mà trang `/chains/` dùng để phân biệt sống/chết. Chain đã
  thu hồi PHẢI vẽ từ mảng `retired` với nhãn riêng, tuyệt đối không đem đo bằng
  heuristic chain sống: nó sẽ nói dối rất thuyết phục.
- 🔴 **Chain đã thu hồi giữ chỗ `name` + `chainId` VĨNH VIỄN.** Thu hồi không xoá được
  mạng khỏi ví người dùng; cấp lại chainId là để ví của người từng dùng chain cũ lặng
  lẽ trỏ vào chain của người khác, chữ ký phát lại được. `createChain` kiểm trùng trên
  `chains ∪ retired`.
- **`COPY --from=builder … CACHED` KHÔNG có nghĩa là build giả.** Suýt kết luận M0.6
  chưa đạt vì thấy dòng đó. Thực tế các bước build Go chạy tươi 68s/89s/65s; `COPY`
  được cache CHÍNH VÌ output trùng digest. Ba thứ khác nhau, phải đo thứ cuối: **bước
  build có chạy không ≠ layer có cache không ≠ binary có giống không.** Phép đo đúng
  là `sha256sum` chính binary trong image, so với binary đang chạy thật.
- 🔴 **`git bundle` cho repo fork avalanchego sinh ra BACKUP GIẢ.** `git bundle verify`
  in "is okay" **và** "The bundle records a complete history", nhưng clone ngược chết:
  `remote did not send all necessary objects`. Repo fork là **shallow clone** (ranh giới
  `1cf1fc3`); bundle từ repo shallow luôn hỏng, kể cả khi chỉ bundle một nhánh.
  ⇒ **`git bundle verify` KHÔNG đủ để tin — phép đo đúng là CLONE NGƯỢC.**
- 🔴 **`git am` PHẢI có `--keep-cr` khi áp patch series của cây fork.** Thiếu nó thì mọi
  tệp CRLF (ví dụ `netgen/main.go`) bị đổi hết xuống dòng ⇒ tree hash LỆCH ⇒ "sao lưu"
  khôi phục ra một cây khác. `apply-sovereign.sh` và `rebase-drill.sh` **đã** có cờ này;
  cái bẫy nằm ở chỗ ai đó gõ tay `git am` để kiểm chứng rồi kết luận series hỏng.
  Đã dính đúng thế 2026-08-26 và suýt báo động nhầm là dự án có lỗi.
- 🔴 **`patches/` KHÔNG tự cập nhật.** Đo 2026-08-26: nhánh `9chain-a1` có **5** commit
  chủ quyền nhưng `patches/` chỉ có **4** — commit `netgen: khai --chain-config-dir`
  (thứ mở đường bật API Warp, M6.2) **chưa bao giờ được xuất ra**. Nó sẽ bốc hơi ở lượt
  `apply-sovereign.sh` kế tiếp, im lặng. **Commit vào cây fork xong PHẢI chạy lại**
  `git format-patch 1cf1fc3..9chain-a1 -o patches/ --no-signature` và commit `patches/`.
  ⇒ Sao lưu fork bằng **patch series**: `git format-patch 1cf1fc3..9chain-a1` (**12 patch**
  tính tới 2026-08-26; con số này TĂNG theo mỗi commit chủ quyền — xem `patches/`)
  + ghi commit upstream gốc. Nghiệm thu bằng cách áp lên base rồi so **tree hash**
  (**`ac260a38`** tính tới 2026-08-27), **không so commit hash** — `git am` ghi lại committer nên commit hash
  đổi trong khi cây mã nguồn vẫn đúng từng byte.
  ⚠️ **Hai con số này đã trôi lệch một lần** (chỗ này còn ghi "6 patch / `04c59acf`" trong
  khi đầu file ghi 8 — sửa 2026-08-26). Đổi patch series thì phải sửa **cả hai chỗ**.
- **Đừng dùng `apply-sovereign.sh` để diễn tập rebase** — nó kết thúc bằng
  `git branch -f 9chain-a1 HEAD`, tức là **ghi đè nhánh thật**. Dùng `rebase-drill.sh`
  (worktree tách rời + chốt chặn xác nhận nhánh thật không đổi hash).
- **`vms/saevm/sae` vốn đã đỏ và KHÔNG ổn định** ở upstream: đỏ sau 45.5s khi chạy cả
  suite, treo tới hết timeout 600s khi chạy riêng. Không phải do fork. Đừng đuổi theo.

### Thêm từ phiên 2026-08-25 (đầu tiên) — đều đo được, không suy đoán
- 🔴 **Trần cứng 16 subnet/node.** Peer khai >16 subnet lúc bắt tay P2P thì node nhận
  gọi `p.StartClose()` — **cắt kết nối** (`network/peer/peer.go:882`), và bên gửi
  KHÔNG cắt bớt danh sách (`message/outbound_msg_builder.go:266`). Track quá 16 L1 là
  bị mọi peer ngắt: **mạng vỡ**, và vỡ kiểu khó đoán nhất — node vẫn chạy, log phía nó
  vẫn sạch. Console đã chặn ở hai chỗ. Trần này là của **mô hình "mọi validator track
  mọi L1"**, vượt qua phải đổi kiến trúc (ACP-77), không phải nới số.
- 🔴 **Bind-mount MỘT FILE + `mv` = container thấy file CŨ vĩnh viễn.** Docker gắn theo
  **inode**; `mv` tạo inode mới ở cùng đường dẫn. Ác ở chỗ mọi dấu hiệu đều báo thành
  công: `grep` trên host thấy bản mới, `caddy validate` in "Valid configuration",
  `caddy reload` không lỗi — **cả hai đều đọc file cũ**. Đo được: host inode `25045995`
  vs container `25043225`. Phải `cp` (giữ inode) rồi **so md5sum host với trong
  container**. Lỡ `mv` rồi thì chỉ còn recreate (đo được: Caddy recreate tốn **1.2s**).
  Trong dự án này: `Caddyfile` và `chains-nginx/default.conf` là mount file đơn lẻ;
  `9chain-a1-config/` và `local-net/chains/` là mount thư mục (an toàn).
- 🔴 **KHÔNG chờ `health.health` trả `healthy:true` giữa đợt rollout subnet mới** — đó
  là **deadlock theo thiết kế**. Node đầu tiên track subnet mới là node duy nhất trên
  subnet đó → `connected to 20%; required at least 80%`; nó chỉ khoẻ khi các node khác
  cũng restart, mà chúng chờ nó khoẻ. Và **không lọc bằng `?tag=` được**: check
  `bootstrapped` đăng ký `ApplicationTag` (toàn cục) nên luôn có mặt. Điều kiện đúng:
  đọc riêng `P`/`X`/`C`, đòi không có `error`.
- **`/ext/health/liveness` là tín hiệu YẾU** — trả 200 ngay khi HTTP server lên, TRƯỚC
  khi C-Chain sẵn sàng. Dùng nó cho health check của Caddy thì Caddy quay lại node
  chưa sẵn sàng quá sớm. Cách chữa: để **passive thắng** (`fail_duration 30s`,
  `max_fails 1`) — Caddy đòi cả hai điều kiện đạt nên liveness xanh sớm không kéo node về sớm.
- **"Đã chép ≠ đang chạy".** Upload console rồi quên restart là bản cũ vẫn phục vụ, không
  dấu hiệu nào. Dùng `console-deploy.sh` (gộp chép + restart + đối chiếu md5sum).
- **`docker compose config --services` KHÔNG giữ thứ tự trong file** (trả node-4 trước
  node-1). Thứ tự ngẫu nhiên làm sự cố không tái hiện được — phải tự sắp xếp.

### Bảo mật / hạ tầng
- 🔴 **Vá cấu hình trong `explorer-full/blockscout/` là VÁ TẠM — thư mục đó bị
  `.gitignore`.** Nó là bản clone upstream; `setup.sh` clone lại là bản vá biến mất
  không dấu hiệu. Mọi thay đổi compose Blockscout phải đặt ở
  `explorer-full/9chain-a1-server.override.yml` (dùng `ports: !override`, `!override`
  cần thiết vì upstream khai `ports` dạng dài và compose sẽ MERGE chứ không thay).
  Kiểm chứng đúng cách: **hoàn nguyên file upstream về nguyên gốc** rồi chạy
  `docker compose -f geth.yml -f ../../9chain-a1-server.override.yml config` — nếu vẫn
  ra giá trị mình muốn thì override tự đứng được. Dính ở B-5.
- 🔴 **Docker publish cổng ĐI VÒNG QUA ufw.** `ports: "9650:9650"` = hở thẳng ra Internet dù `ufw status` báo chặn (ufw lọc `INPUT`, Docker dùng DNAT bảng `nat`). Kiểm tra thật bằng `sudo ss -tlnp | grep 9650`, **đừng tin `ufw status`**.
- 🔴 **Ubuntu cloud image: sửa `PasswordAuthentication` trong `/etc/ssh/sshd_config` KHÔNG có tác dụng.** `Include sshd_config.d/*.conf` ở dòng 12 mà sshd lấy **giá trị gặp ĐẦU TIÊN** → `50-cloud-init.conf` thắng. Phải sửa đúng file đó + `/etc/cloud/cloud.cfg.d/99-disable-ssh-pwauth.cfg`. **Kiểm chứng bằng `sudo sshd -T | grep passwordauth`.**
- 🔴 **A1 và C1 dùng chung zone Cloudflare `9chain.org`.** SSL/TLS mode là thiết lập **cấp zone** — đổi sang `Full (strict)` là C1 chết ngay (lỗi 526, C1 dùng cert tự ký). **Trước khi đổi bất kỳ thiết lập cấp zone/tài khoản nào, kiểm tra ai khác đang dùng chung.**
- **Cloudflare Proxied**: ACME không xin được cert (C1 đã thử, thất bại 2026-07-19) → dùng `tls internal`. IP thật ở header **`CF-Connecting-IP`** — không xử lý thì rate-limit gom cả thế giới vào 1 khoá. Đặt `A1_TRUST_PROXY=1`, kiểm chứng bằng `/faucet/whoami`.
- **Đổi cấu hình Caddy phải `caddy reload`, KHÔNG `--force-recreate`** — recreate làm Caddy chết vài giây, ví poll RPC mỗi ~4s nên MetaMask hiện "Unable to connect" và **giữ nguyên banner** tới khi người dùng đổi mạng qua lại.
- **`pkill` không giết `node.exe` trên Windows** → `netstat -ano | grep :PORT` rồi `taskkill //F //PID`. Từng để console CŨ (bind `0.0.0.0`, chưa auth) sống song song bản mới; `localhost` phân giải `::1` nên request rơi vào bản cũ. **Siết bảo mật xong phải kiểm tra tiến trình cũ đã chết hẳn.**
- 🔴 **`ssh host 'pkill -f "console/server.mjs"; ... khởi động lại'` TỰ GIẾT CHÍNH NÓ.** `pkill -f` khớp trên **toàn bộ dòng lệnh**, mà dòng lệnh `bash -c` của phiên ssh có chứa đúng chuỗi đó → shell chết trước khi kịp bật lại, console nằm im mà không báo lỗi gì. Dùng mẹo ngoặc vuông: `pkill -f "[c]onsole/server.mjs"`. Sau khi bật lại **luôn kiểm chứng bằng `ss -tlnp | grep 8091` từ một phiên ssh KHÁC**, đừng tin dòng banner trong log (log cũ trông y hệt).

### Web / giao diện
- 🔴 **Trang public KHÔNG được cắm cứng `localhost` làm endpoint.** Trình duyệt người xem phân giải `localhost` thành MÁY HỌ → trang tải từ server nhưng số liệu lấy từ máy khách. Explorer + dashboard đều đã dính. Suy từ `location.hostname` (quy ước: trang ở `<host>`, RPC ở `rpc-<host>`).
- **Avalanche KHÔNG đẻ block rỗng** — chain chỉ sinh block khi có giao dịch. Số block đứng yên là BÌNH THƯỜNG, không phải chain chết. Đã ghi giải thích ngay trên trang explorer.
- MetaMask **chỉ nhận chainId dạng hex** (`0x218711a09`), truyền số thập phân sẽ lỗi.

### Đẻ chain / subnet
- 🔴 **Track ≠ validate.** Subnet mới đẻ có tập validator RỖNG. Chain đó vẫn trả lời `eth_chainId`, vẫn đọc được số dư, MetaMask vẫn kết nối — chỉ là **giao dịch không bao giờ chốt**. Cộng với việc Avalanche không đẻ block rỗng, không có dấu hiệu bề ngoài nào phân biệt được. Nghiệm thu một L1 **bắt buộc** gửi giao dịch thật: `node local-net/faucet/probe-l1.mjs <RPC_URL> [PRIVKEY]`.
- Validator subnet (hậu Durango) **phải** đang là validator primary; thời hạn ≥ 24h và **không vượt hạn primary** — CLI trừ hao 60s vì P-Chain tiến timestamp lúc đang ký.
- **`docker compose exec` KHÔNG mang env của tiến trình gọi nó vào container** — phải `-e VAR=...` tường minh.
- **`execFile` nhét nguyên dòng lệnh vào `err.message`** → truyền khoá bằng `-e` rồi trả `e.message` cho client là ném khoá ra ngoài. Console đã bọc `docker()` để xoá khoá.
- Hậu Etna, P-Chain dùng **phí động**; các số của `info.getTxFee` (`createSubnetTxFee: 0.1 LOVE9`) **không còn được dùng**. Phí thật đo được: **0.000141468 LOVE9/lượt đẻ chain**.
- Luồng hiện tại là **subnet cổ điển** (`AddSubnetValidatorTx`), CHƯA phải L1 chuẩn ACP-77 (`ConvertSubnetToL1Tx`) — nên chưa có phí duy trì liên tục.
- 🔴 **Tự cấp chainId KHÔNG được dùng `9100 + số chain`.** Chỉ cần một lượt trước đó tự chọn chainId là công thức đếm đâm trúng số đã dùng (OmegaChain chọn 9101, chain thứ hai tự cấp cũng ra 9101). Hai L1 trùng chainId là hố sụt: MetaMask coi chúng là **một mạng**, và chữ ký của chain này **phát lại được** trên chain kia. Console nay quét số còn trống và chặn chainId trùng.
- **Địa chỉ admin phải validate bằng EIP-55, không chỉ regex 40 hex.** Genesis đã đẻ là bất biến; gõ sai 1 ký tự vẫn "đúng hình thức" và chain ra đời **vô chủ vĩnh viễn** — không lỗi, không dấu hiệu. `local-net/lib/eip55.mjs` tự viết keccak-256 vì `~/9chain-a1/src` trên server **không có package.json/node_modules**: thêm `import ... from "ethers"` là console chết lúc khởi động dù máy dev chạy ngon.
- **`console-chains.json` là hợp đồng dữ liệu với trang `/chains/`** — nay có thêm khoá `admin`. Thêm khoá thì an toàn, **đổi/bỏ khoá cũ là làm hỏng trang danh bạ**. Khoá mới **chỉ có trên bản ghi mới**: OmegaChain (đẻ trước) không có `admin`. Mọi trang đọc file này phải coi khoá thiếu là trạng thái hợp lệ ("mặc định"), không phải lỗi — và tuyệt đối không để `undefined` lọt ra mặt người dùng.
- **Container `9chain-a1-chains` bind-mount thẳng `~/9chain-a1/src/local-net/chains` (ro)** → `scp` xong là trang đổi ngay, **không cần restart/rebuild**. Nhưng kiểm chứng phải xem **trang thật qua Cloudflare**, không chỉ `curl 127.0.0.1:8093`: trang này render toàn bộ bằng JS sau khi fetch RPC, `curl` chỉ thấy khung HTML rỗng.

### avalanchego / fork
- **Tham số kinh tế mạng tuỳ chỉnh KHÔNG đọc từ `genesis.GetStakingConfig`** — `config/config.go` chỉ khoá cứng cho Mainnet/Fuji; mọi networkID khác lấy từ **cờ CLI viper** mặc định `LocalParams`. Thêm `case A1NetworkID` vào `params.go` là **chưa đủ**, phải vá cả `getStakingConfig` và `getTxFeeConfig`. Kiểm tra: `docker logs 9chain-a1-node-1 2>&1 | head -1 | grep -o '"maxValidatorStake":[0-9]*'` → phải ra `50000000000000000`.
- **KHÔNG build native trên Windows** (`utils/ulimit`) → luôn qua Docker.
- **Re-rebrand**: `rebrand.sh` tìm chuỗi GỐC upstream; đã rebrand rồi phải `git checkout --` 4 file identity trước.
- **Đổi EVM chainId / phân bổ genesis = re-genesis** → `docker compose ... down -v` rồi up; wipe cả Blockscout DB.
- `--http-allowed-hosts` mặc định `["localhost"]` → dịch vụ gọi node qua tên khác bị chặn với lỗi khó đoán (`JsonRpcProvider failed to detect network`). netgen nay luôn set cờ này.
- **Bind loopback làm container mất đường tới node**: `host.docker.internal` trỏ IP bridge, không phải loopback host. Cách đúng: `--network net_a1net` + `http://172.28.0.11:9650`.
- netgen `--public-ip` = IP nội bộ docker → node NGOÀI không join P2P được.
- networkID Avalanche là **uint32** — không thể là 9000000009; chỉ EVM chainId mới là số 9 tỷ.
- 🔴 **"L1 EVM chưa bật Durango → compile `evmVersion:'paris'`" là SAI — đã đo, đã bỏ.**
  Durango **ĐANG BẬT** trên mọi L1 của ta. Phép đo: deploy `0x5f5ff3` (PUSH0 PUSH0
  RETURN) trên chain 9122 → **status 1**, block 2. Nếu PUSH0 không tồn tại thì đó là
  opcode lạ và deploy phải revert.
  Lý do ở source: networkID 9001 không phải Mainnet/Fuji ⇒ `upgrade.GetConfig` trả
  `Default`, ở đó `DurangoTime = InitiallyActiveTime` (2020-12-05) — cùng lý do
  Etna/Granite cũng bật sẵn. ⇒ **Compile contract bằng EVM version mặc định, đừng hạ
  xuống `paris`.** Ghi chú cũ khiến người ta tự trói vào một EVM cũ hơn cần thiết.

### Blockscout
- 🔴 **`dets`/`logs` sai đường dẫn VÀ sai UID** → backend crash-loop `{:file_error, "./dets/queue_storage", :eacces}` chôn trong stack trace Erlang. Compose giải `./dets/` tương đối theo **thư mục chứa file khai** (`services/backend.yml`) → là `services/dets`. Process chạy UID **10001**, không phải 1000. Đã đóng gói vào `explorer-full/9chain-a1-server.env.sh`.
- **nginx cache DNS lúc khởi động** — proxy lên khi backend còn crash sẽ giữ mãi 502; `docker restart proxy frontend` sau khi backend ổn.
- API v2 ở **cổng UI** (`/api/v2/...` trên 8100), không phải 8101.
- Nút "Add network to MetaMask" chỉ hiện khi có `NEXT_PUBLIC_NETWORK_RPC_URL`.
- `explorer-full/setup.sh` cắt block cũ theo marker rồi append lại (bản đầu dùng `grep -q || cat >>` sai chuỗi → append trùng mỗi lần).

---

## Lệnh hữu ích

```bash
cd /c/PROJECTS/9Chain-A1
bash local-net/gen-network.sh 5                        # sinh mạng dev local
A1_NET_DIR=local-net/net-public bash local-net/gen-network.sh 5   # sinh bộ public (khoá mới)
bash local-net/up-all.sh                               # bật stack local (cần A1_CONSOLE_TOKEN)
docker compose -f local-net/net/docker-compose.multinode.yml up -d
```

```bash
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'docker ps --format "{{.Names}}\t{{.Status}}"; uptime; df -h /'
```

```bash
curl -s -X POST -H 'content-type:application/json' --data '{"jsonrpc":"2.0","id":1,"method":"platform.getCurrentValidators"}' https://rpc-a1.9chain.org/ext/bc/P | python -c "import json,sys; v=json.load(sys.stdin)['result']['validators']; print(len(v),'validators,',sum(1 for x in v if x.get('connected')),'connected')"
```

```bash
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'docker exec 9chain-a1-caddy caddy reload --config /etc/caddy/Caddyfile'
```

Nghiệm thu tự động — **dùng cái này thay cho mở trang nhìn bằng mắt**:
```bash
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'cd ~/9chain-a1/src && node local-net/faucet/smoke-l1.mjs'
```
Chế độ nhẹ chỉ đọc, không tốn tiền, chạy bao nhiêu lần cũng được. Thêm `--create-chain`
để nghiệm thu đường đẻ chain đầy đủ (đẻ chain thật + giao dịch thật + đo gián đoạn
+ **tự thu hồi chain vừa đẻ**) — mất ~6 phút, **chạy lại được vô hạn** từ M4.4.
Thêm `--giu` nếu muốn giữ chain lại soi bằng tay (khi đó nó ăn một slot vĩnh viễn).

Kiểm có cổng nào hở ra Internet không — **đo TỪ NGOÀI**, không tin `ufw status`
(Docker publish đi vòng qua ufw; đây là cách B-5 lọt). Có đối chứng ngược:
```bash
bash local-net/deploy/check-ports.sh
```

Dựng + deploy giao diện (M10) — `web-deploy.sh` tự nghiệm chứng **chunk JS thật, API
faucet, và mọi liên kết nội bộ (đo NỘI DUNG, không chỉ mã HTTP)**:
```bash
cd web && pnpm build && cd .. && bash local-net/deploy/web-deploy.sh
```

Nghiệm thu Warp/ICM (M6.2) — **đẻ 2 chain thật, mỗi bài ~13 phút, tự thu hồi cả hai**:
```bash
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'cd ~/9chain-a1/src && set -a; . ~/9chain-a1/console.env; set +a; node local-net/faucet/warp-test.mjs'
```
```bash
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'cd ~/9chain-a1/src && set -a; . ~/9chain-a1/console.env; set +a; node local-net/faucet/bridge-test.mjs'
```
Cần **2 slot L1 cùng lúc**. Thêm `--giu` để giữ chain lại soi tay.

Dựng lại artifact hợp đồng cầu sau khi sửa `local-net/contracts/AssetBridge.sol`
(solc KHÔNG nằm trong repo — cài tạm ở đâu cũng được):
```bash
npm install solc@0.8.28 && node local-net/contracts/compile.mjs --solc ./node_modules/solc
```

Diễn tập rebase lớp chủ quyền lên upstream mới (worktree tách rời, không đụng nhánh thật):
```bash
bash scripts/rebase-drill.sh              # thử lên origin/master
```

Đo gián đoạn RPC trong lúc làm thao tác nặng:
```bash
node local-net/faucet/probe-net.mjs https://rpc-a1.9chain.org/ext/bc/C/rpc --giay 120
```

Đồng bộ console lên server (chép + khởi động lại + **tự kiểm chứng**, một lệnh):
```bash
bash local-net/deploy/console-deploy.sh
```

Đổi cấu hình Caddy (`cp` giữ inode + so md5sum + validate + reload, **không** recreate):
```bash
scp -i "$A1_SSH_KEY" local-net/deploy/Caddyfile "$A1_SSH_HOST":'~/9chain-a1/Caddyfile.new' && ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" '~/9chain-a1/caddy-deploy.sh'
```

Đồng bộ trang danh bạ L1 (bind-mount → có hiệu lực ngay, không restart):
```bash
scp -i "$A1_SSH_KEY" local-net/chains/index.html "$A1_SSH_HOST":'~/9chain-a1/src/local-net/chains/'
```

Đẻ thử một chain có chủ riêng (chạy TRÊN server; đổi `<0xADMIN>` thành ví của bạn):
```bash
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'set -a; . ~/9chain-a1/console.env; set +a; curl -sS -X POST http://127.0.0.1:8091/api/create -H "content-type: application/json" -H "authorization: Bearer $A1_CONSOLE_TOKEN" -d "{\"name\":\"TenChain\",\"admin\":\"<0xADMIN>\"}"'
```

Backup + phục hồi (đọc `RESTORE.md` trong đó, có quy trình từng mục đã chạy thử):
```bash
ls /c/PROJECTS/9Chain-backups/9chain-a1-backup-20260825-064053/
```
Kiểm toàn vẹn bản backup bất cứ lúc nào:
```bash
cd /c/PROJECTS/9Chain-backups/9chain-a1-backup-20260825-064053 && sha256sum -c <(grep -E '^[0-9a-f]{64} ' MANIFEST.txt)
```

Tài liệu: `docs/PROGRESS.md` (nhật ký chi tiết) · `docs/DEPLOY-KSGAME.md` (runbook server) · `docs/TOKENOMICS.md` · `docs/DEPLOY-TESTNET.md` (đa VPS, đường lên mainnet) · `docs/ARCHITECTURE.md`.
