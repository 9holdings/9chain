# HANDOFF — 9Chain Testnet A1 (Avalanche)

Cập nhật: 2026-08-26 (phiên thứ năm — **M6 đóng** (tài sản đi được giữa 2 L1) ·
**M10 gần đóng**: web/ · faucet · 3 biến thể trang chủ · màn đẻ chain có tiến trình
theo bước · chain của tôi + thu hồi · bảng A1↔C1. Backlog phần mềm đã cạn.)

## ▶ Phiên sau bắt đầu từ đâu

🔴 **ĐỌC `PROGRESS.md` TRƯỚC** — backlog nằm ở đó, không phải file này.
Kèm `DECISIONS.md` (vì sao làm vậy) và `BLOCKERS.md` (đang chờ David cái gì).

### Việc đầu tiên của phiên sau — theo đúng thứ tự này

**1. 🔴 `keys.txt` — CHỖ HỎNG DUY NHẤT CÒN LẠI CỦA DỮ LIỆU.** `[human]`.
`local-net/net-public/keys.txt` (5 khoá quỹ testnet công khai) vẫn chỉ có **một nơi
thật**: ổ C: máy dev. Thư mục backup nằm **cùng ổ** nên không tính là bản thứ hai.
Quy tắc cứng cấm đưa file này lên server ⇒ bản thứ hai buộc phải là **phương tiện
offline (USB/ổ ngoài)**. Mọi thứ khác đã có bản thứ hai (backup 652 MB, 29/29 sha256,
+ git ở `139.99.145.13:~/9chain-a1/backup/20260825-064053/`).

**2. 🔴 VIỆC ĐỘ BỀN LỚN NHẤT CÒN LẠI — validator thứ sáu ở nhà cung cấp KHÁC.**
`[human]`, tốn tiền hạ tầng. Cả 5 validator đang ở **một máy, một nhà cung cấp, một
datacenter**: "testnet 5 validator" mà cả 5 chết cùng lúc thì nó là một máy chủ đội lốt
một mạng. Backup cứu được **dữ liệu**, không cứu được **tính sẵn sàng**.
Đây cũng là điều kiện tiên quyết cho M3 (cộng đồng chạy node).

**3. 🔴 M10 — giao diện. Kế hoạch xong, chờ David chọn biến thể trang chủ.**
`docs/UI-PLAN.md`. Đối tượng đã chốt (người muốn chain riêng), stack đã chốt (Next
xuất tĩnh). Ba biến thể khác nhau ở **cách dẫn**, không ở nhắm ai.

**4. 🔴 H-7 — M3 chờ một quyết định về ĐỐI TƯỢNG, không phải về kỹ thuật.**
`[human]`. Phần code đã xong (netgen sinh được P2P IPv6, mặc định không đổi gì).
Nhưng `--public-ip` của avalanchego nhận **một** địa chỉ, nên **IPv6-only sẽ loại mọi
peer chỉ có IPv4** — với một testnet mời cộng đồng chạy node thì đó là loại phần lớn
người muốn tham gia. Đo được: máy chủ có **/56 định tuyến**, Docker 29.7.2 (bật IPv6
theo từng network, KHÔNG phải restart daemon). Khuyến nghị: IPv4 đa cổng cho node
beacon. **Kéo theo H-4 có thể là bản ghi `A` chứ không phải `AAAA`.** Chi tiết: BLOCKERS H-7.

**5. 🔴 M10 GẦN ĐÓNG — backlog phần mềm đã cạn, việc còn lại đều `[human]`/`[blocked]`.**
M10.1–M10.3, M10.5, M10.6 xong; M10.4 xong phần mềm (còn bấm thử bằng MetaMask
thật); M10.7 xong phần đo được, còn một mục chờ 9Scan.

🔴 **GỐC `/` NAY LÀ TRANG CHỦ THẬT (bản C, David chọn 2026-08-26), KHÔNG còn là
Blockscout.** Caddy khớp **đúng `/`** chứ không phải `/*` — Blockscout vẫn phục vụ
`/tx/…`, `/address/…`, `/blocks`, `/api/…` như cũ (đã đối chứng sau khi đổi).
**Gỡ nhanh:** xoá khối `@trangchu` trong Caddyfile rồi `caddy reload`.

**Trang công khai:** `/` (trang chủ) · `/faucet/` · `/de-chain/` · `/chain-cua-toi/`
· `/bang/` · `/chains/` · `/console/` (console cũ, không còn trong thanh điều hướng).
URL cũ: `/lite/` → `/` và `/dashboard/` → `/bang/`, đều 301.

### ⏰ Hẹn giờ đã biết
**Cả 5 validator hết hạn `2027-08-24`** (đo 2026-08-25, còn 364 ngày). Đúng ngày đó
mạng DỪNG nếu không gia hạn. Uptime hiện 99,96–100%.

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

### Phiên 2026-08-26 (đợt 3) — David chọn bản C, trang chủ lên gốc

**M10.3 đóng.** Bản C thay `web/app/page.tsx`; bản A, bản B và `ThanhChon.tsx` đã gỡ.
**Gốc `/` đổi chủ**: Caddy khớp đúng `/` (không phải `/*`), nên Blockscout giữ nguyên
mọi đường dẫn sâu. Đối chứng sau khi đổi: `/blocks` vẫn là HTML Blockscout 76 KB.
**M10.7 mở khoá thêm một mục**: `/lite/` → `/`, `/dashboard/` → `/bang/`, cả hai 301.

⚠️ Hai container cũ (`:8082` explorer nhẹ, `:8092` dashboard) nay **không còn đường
vào** nhưng vẫn chạy. Dừng chúng là dọn tài nguyên — chưa làm vì nó đụng thứ đang
chạy mà không ai yêu cầu.

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
`web/scripts/dong-bo-token.mjs`, kèm test bắt trôi lệch (vân tay `535cbf6329efb6d0`).

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
`warp-test.mjs` **21/21** (message được xác minh ở đầu kia) và `cau-test.mjs`
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
   `local-net/faucet/node_modules`) mà vẫn dẫm. Đã chuyển sang `faucet/warp-chung.mjs`.
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

🔴 **CONSOLE ĐÃ CÔNG KHAI: https://testnet-a1.9chain.org/console/** (David duyệt).
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

**B-8 gỡ** — `tai-test.mjs` từng treo 3 tiếng giữ một slot L1; nay có trần thời gian
tổng bao cả pha nạp ví, hạn giờ mỗi lượt gửi, nạp theo lô, và vòng chờ chính đua với
hạn chốt để **đường thu hồi luôn chạy tới**.

**`kiem-cong.sh`** — bài kiểm cổng hở, đo TỪ NGOÀI, 5 tầng (gồm: origin có đúng 403
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

**M9 — đo năng lực bằng tải thật** (David yêu cầu). `local-net/faucet/tai-test.mjs`.
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
**Testnet công khai ĐÃ LIVE**: https://testnet-a1.9chain.org · RPC https://rpc-testnet-a1.9chain.org
5 validator chạy trên server nhà cung cấp `139.99.145.13`, Blockscout index đầy đủ, faucet + nút "Thêm vào MetaMask" hoạt động. **P0 #1/#2/#3 đều PASS.**

🔴 **CONSOLE ĐẺ CHAIN ĐÃ CÔNG KHAI (2026-08-25): https://testnet-a1.9chain.org/console/** — đăng nhập bằng chữ ký ví, `admin` bị ép = địa chỉ đã ký. Người lạ đẻ được chain của chính họ. Còn **13 suất** (danh bạ 2 L1; trần mềm console 15, trần cứng giao thức 16).
🔴 **Origin CHỈ phục vụ qua Cloudflare.** Nối thẳng vào `139.99.145.13:443` → **403** cho cả ba tên miền. Kiểm: `bash local-net/deploy/kiem-cong.sh`.

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
| Trang testnet | https://testnet-a1.9chain.org — Blockscout ở gốc · `/faucet/` · `/chains/` · `/dashboard/` · `/lite/` |
| Danh bạ L1 | `/chains/` — mọi chain do console đẻ ra + tình trạng thật. Container `9chain-a1-chains` (nginx, `127.0.0.1:8093`), đọc `console-chains.json` qua alias — URL thật là **`/chains/data/console-chains.json`**
(trang fetch bằng đường dẫn TƯƠNG ĐỐI `data/…`; gõ `/data/…` ra 404, đã dính).
Mỗi bản ghi nay có thêm `presetTen` (tên kiểu chain do console ghi lúc đẻ, để trang
khỏi phải tự dịch id → tên và trôi lệch — bản chép tay cũ đã trôi một lần). **Dấu hiệu sống là SỐ VALIDATOR của subnet**, không phải chiều cao block. Mỗi L1 hiện thêm **Chủ sở hữu (admin)**; chain đẻ trước khi có ô này (OmegaChain) hiện "mặc định của hệ thống", không được để lọt `undefined`. |
| RPC công khai | https://rpc-testnet-a1.9chain.org/ext/bc/C/rpc |
| MetaMask | Chain ID `9000000009` · Symbol `LOVE9` (có nút 1 cú bấm ở `/faucet/` và `/lite/`) |
| Server | `139.99.145.13` (`(không công bố)`), Ubuntu LTS, 8 luồng / 62GB / RAID1 410GB |
| SSH | `ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST"` (key không passphrase, mật khẩu đã tắt) |
| DNS | 2 A record → `139.99.145.13`, Cloudflare **Proxied**, SSL/TLS mode **Full** |

**Ví chain-factory** (khoá trên server, `console.env`): P-Chain `P-love91vgh2whn746dzzvg0dj4w9rsqvlalcldvpueuvj` · **9 LOVE9** · khoá gốc ở `local-net/net-public/chain-factory-key.txt` (chỉ máy dev). Hết tiền thì nạp lại từ quỹ Ecosystem theo cách ghi ở `local-net/net-public/allocation.md`.

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
- `local-net/net/` = bộ **dev local** (genesis khác `net-public/`). Đừng lẫn hai bộ.

---

## Chuẩn đặt tên (chốt 2026-08-24)
Mọi thứ dùng `9chain-a1`, bỏ hẳn "MetaChain/META".
Identity: client `9chaingo` · token **LOVE9** · HRP `love9` · VM `love9evm` (VMID `pkqXszJe86D3xLomib9bLpXPfW7gr7FPhDAbg46p5iNjrn4mf`) · networkID **9001** (uint32) · EVM chainId **9000000009**.
Env dùng tiền tố `A1_*` (tên biến không được bắt đầu bằng số).

---

## Gotchas

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
  `phaiRevert()` trong `faucet/warp-chung.mjs`.
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
  `while pgrep -f "tai-test.mjs"; do sleep 60; done` có chuỗi `tai-test.mjs` **trong
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
  ⇒ Sao lưu fork bằng **patch series**: `git format-patch 1cf1fc3..9chain-a1` (4 patch)
  + ghi commit upstream gốc. Nghiệm thu bằng cách áp lên base rồi so **tree hash**
  (`05c37aa4…`), **không so commit hash** — `git am` ghi lại committer nên commit hash
  đổi trong khi cây mã nguồn vẫn đúng từng byte.
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
curl -s -X POST -H 'content-type:application/json' --data '{"jsonrpc":"2.0","id":1,"method":"platform.getCurrentValidators"}' https://rpc-testnet-a1.9chain.org/ext/bc/P | python -c "import json,sys; v=json.load(sys.stdin)['result']['validators']; print(len(v),'validators,',sum(1 for x in v if x.get('connected')),'connected')"
```

```bash
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'docker exec 9chain-a1-caddy caddy reload --config /etc/caddy/Caddyfile'
```

Nghiệm thu tự động — **dùng cái này thay cho mở trang nhìn bằng mắt**:
```bash
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'cd ~/9chain-a1/src && node local-net/faucet/smoke-l1.mjs'
```
Chế độ nhẹ chỉ đọc, không tốn tiền, chạy bao nhiêu lần cũng được. Thêm `--de-chain`
để nghiệm thu đường đẻ chain đầy đủ (đẻ chain thật + giao dịch thật + đo gián đoạn
+ **tự thu hồi chain vừa đẻ**) — mất ~6 phút, **chạy lại được vô hạn** từ M4.4.
Thêm `--giu` nếu muốn giữ chain lại soi bằng tay (khi đó nó ăn một slot vĩnh viễn).

Kiểm có cổng nào hở ra Internet không — **đo TỪ NGOÀI**, không tin `ufw status`
(Docker publish đi vòng qua ufw; đây là cách B-5 lọt). Có đối chứng ngược:
```bash
bash local-net/deploy/kiem-cong.sh
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
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'cd ~/9chain-a1/src && set -a; . ~/9chain-a1/console.env; set +a; node local-net/faucet/cau-test.mjs'
```
Cần **2 slot L1 cùng lúc**. Thêm `--giu` để giữ chain lại soi tay.

Dựng lại artifact hợp đồng cầu sau khi sửa `local-net/contracts/CauTaiSan.sol`
(solc KHÔNG nằm trong repo — cài tạm ở đâu cũng được):
```bash
npm install solc@0.8.28 && node local-net/contracts/bien-dich.mjs --solc ./node_modules/solc
```

Diễn tập rebase lớp chủ quyền lên upstream mới (worktree tách rời, không đụng nhánh thật):
```bash
bash scripts/rebase-drill.sh              # thử lên origin/master
```

Đo gián đoạn RPC trong lúc làm thao tác nặng:
```bash
node local-net/faucet/probe-net.mjs https://rpc-testnet-a1.9chain.org/ext/bc/C/rpc --giay 120
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
