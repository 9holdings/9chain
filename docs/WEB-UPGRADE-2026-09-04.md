# LỘ TRÌNH NÂNG CẤP a1.9chain.org — bản `2026-09-04` (sau ngày G)

**Ngày lập: 2026-09-04 (đêm) · Mạng: g1 (`networkID 999999998`, `9chain-a1-g1`) ·
Nghi lễ Block Adam: `2026-09-09` — còn 5 ngày · Nguồn: đọc `HANDOFF.md` + `WORKTREE-WEB.md`
rồi ĐO LẠI TỪ NGOÀI, không tin repo.**

> Bản trước: [`WEB-UPGRADE-2026-08-27.md`](WEB-UPGRADE-2026-08-27.md) (118 phát hiện, lập
> **trước** ngày G). Bản này thay nó ở phần "việc tiếp"; phần đã đóng vẫn tra ở đó và ở
> [`WEB-PROGRESS.md`](WEB-PROGRESS.md).

---

## 0. NỀN ĐO — mọi con số dưới đây đo lúc `2026-09-04 19:30–19:45Z`

Ký hiệu mức tin cậy giữ nguyên quy ước cũ: **do** = đã đo bằng lệnh · **suy** = đọc mã ra ·
**giả định** = chưa đo.

| Đại lượng | Đo được | Cách đo |
|---|---|---|
| 8 trang sản phẩm + `/404.html` `/version.txt` `/robots.txt` `/sitemap.xml` | **200 hết** | `curl -w %{http_code}` |
| Đường lạ `/khong-co-trang/` | **404 · 2.076 byte** (trang tối giản trong Caddyfile) | `curl` |
| `version.txt` công khai | `commit=8822f8b46106 · uncommitted=no · js-chunks=42` | `curl` |
| Danh tính mạng | `networkID 999999998` · `9chain-a1-g1` · `eth_chainId 0x218711a09` (=9000000009) · block `0x10987` | `info.*` + `eth_*` |
| Validator | **11 · 10 connected**; 2 khách ngoài (một 2,39% uptime offline, một 100%) | `platform.getCurrentValidators` |
| Danh bạ L1 | **11 sống · 0 thu hồi** ⇒ **còn 4 chỗ trong 15, vĩnh viễn** | `/chains/data/console-chains.json` |
| Faucet | `/api/info` 200 (9 LOVE9, 300/300) · **`/api/supply` NAY 200** | `curl` |
| Font thương hiệu | **30 mặt chữ khai · ĐÚNG 1 mặt được nạp (`Outfit 700`, chữ logo)**; `--font-sans` và `--font-display` ở `:root` giải ra **chuỗi rỗng**; `<h1>` và `<body>` chạy `ui-sans-serif` hệ thống | `document.fonts` + `getComputedStyle` trên site sống |
| Tài nguyên tĩnh ở biên | `immutable` · `cf-cache-status: HIT` (3/3 lượt) | `curl -I` |
| HTML | `no-cache` · `cf-cache-status: DYNAMIC` · **1,0–1,7 s** mỗi lượt từ Hồng Kông | `curl -w %{time_total}` |
| `robots.txt` | Cloudflare chèn 61 dòng **lên trước**, tệp của mình vẫn có hiệu lực bên dưới (`Sitemap:` có mặt) | `curl` |
| Header an ninh | HSTS · `nosniff` · `X-Frame-Options` · `referrer-policy` · CSP **chỉ có `frame-ancestors`** | `curl -I` |

**Ba thứ đo được mà repo chưa ghi ở đâu:**

1. **`/faucet/api/supply` đã sống** — mục **C1** trong `WEB-PROGRESS.md` ghi nó **404** và
   dùng chính nó để **chặn** việc "câu khai nguồn cung trên trang". Chặn đó **hết hiệu lực**
   (**do**). Nội dung trả về đầy đủ hơn dự kiến: tách `xpCurrentSupply` (đo bằng
   `platform.getCurrentSupply`) và `cChainGenesis` (đo bằng `eth_getBalance` tại block 0),
   kèm `note` giải thích vì sao hai số không cộng được trong một lời gọi.
2. **`/chains/` trong HTML tĩnh chỉ có đúng một chữ: `Loading…`** (**do**). Toàn bộ danh bạ
   dựng ở client. Bộ máy tìm kiếm, bộ đọc AI, và người mạng chậm thấy một trang trắng.
3. **Danh bạ đã ăn 11/15 chỗ.** Trang web **không nói điều đó ở bất kỳ đâu trước khi
   người ta ký ví** (**do**: HTML tĩnh của `/`, `/chains/`, `/create-chain/` không chứa
   chuỗi nào về số chỗ).

---

## 1. ĐỢT A — SỰ THẬT ĐANG SAI TRÊN MẠNG CÔNG KHAI (làm trước, rẻ)

> Luật chọn việc của đợt này giống Đợt 1 bản cũ: chỉ nhận việc **đang nói sai ra ngoài**
> hoặc **làm người thật mất một thứ không lấy lại được**.

### A-1 · 🔴 Màn duyệt cuối của `/create-chain/` cảnh báo bằng một ngày ĐÃ QUA

**Vì sao.** `CreateChainScreen.tsx:312` in `t.launch.reviewRebuild` với `t.rebuild.date` =
`2026-09-01` (**do**, đọc mã + đối chiếu `en.ts:129`). Câu đó nói: *"A1 rebuilds the whole
network on 2026-09-01. The chain you launch today will be erased."* Hôm nay là `04/09`;
lượt sinh lại **đã xảy ra** và `/re-genesis/` **đã** chuyển sang thì quá khứ (**do**: trang
sống in *"A1 was rebuilt on 2026-09-01"*).

⇒ Hai trang của cùng một site nói ngược nhau về cùng một sự kiện, và bản sai nằm ở **đúng
màn hình cuối cùng trước một cánh cửa một chiều** — nơi người ta đọc kỹ nhất và nơi lời
cảnh báo phải đáng tin nhất. Người đọc kỹ sẽ kết luận "chain tôi sắp tạo sẽ bị xoá trong
quá khứ", tức là kết luận rằng **trang này không biết mình đang nói gì**.

**Làm gì.** Bỏ nhánh `reviewRebuild` khi mốc đã qua, thay bằng câu về lượt sinh lại **kế
tiếp** nếu có, hoặc bỏ hẳn dòng đó. Cùng lượt, rà toàn bộ chỗ dùng `t.rebuild.*` (khối
"tương lai") xem còn ai gọi: nếu chỉ còn `/create-chain/`, khối đó thành **35 khoá × 30
ngôn ngữ chết** đang chờ ai đó vô tình bật lại.

**Chi phí.** S (một điều kiện + có thể xoá một khối từ điển).

**Điều kiện qua.** Trên site sống: màn duyệt không còn chuỗi `2026-09-01` ở thì tương lai;
**đối chứng ngược:** đặt lại `rebuild.date` thành một ngày tương lai ⇒ câu phải hiện lại
(chứng minh ta xoá **điều kiện**, không xoá **khả năng cảnh báo**).

### A-2 · 🔴 "Takes about three minutes" — số đo là 305 s, mã chờ 420 s

**Vì sao.** Câu này ở **3 chỗ** trong `en.ts` và một trong ba là **`og:description`**
(**do**: `curl` head trang chủ ⇒ `meta name="description"` và `og:description` đều mang
nguyên văn *"Takes about three minutes."*). `lib/wallet.ts` chờ **420 giây**. Phép đo gần
nhất trên mạng 9 node: **305,5 s** (`HANDOFF.md`). Mục **A2** của `WEB-PROGRESS.md` mở từ
`28/08` và chưa ai đóng.

🔴 **Điều kiện qua CŨ nay đã quá đắt và phải đổi.** Bản cũ ghi: *"đẻ một chain thật trên
mạng công khai, ghi giây"*. Lúc viết câu đó danh bạ còn 0/15. Hôm nay còn **4 chỗ**, và một
chỗ là **vĩnh viễn** (thu hồi trả lại chỗ nhưng không trả lại tên và chainId). **Đo bằng
cách đẻ một chain nay tốn 25% số chỗ còn lại của cả mạng** — cái giá đó không tương xứng
với việc sửa một câu chữ.

**Làm gì.** Lấy số từ **11 lượt đã chạy**: console giữ tiến trình từng lượt
(`/api/progress`), phiên A1 có `smoke-l1.mjs` và log. Viết câu theo **khoảng** đo được
(*"khoảng 5 phút"* + *"đã đo 305 s trên mạng 9 node"*), không viết một con số tròn không ai
kiểm được. Sửa cả `og:description`.

**Chi phí.** S (chữ) + phải xin số của phiên chain.

**Điều kiện qua.** `curl … | grep 'og:description'` không còn "three minutes"; câu mới có
nguồn ghi trong `vi.ts`; `wallet.ts:tranGiay` và câu chữ **cùng bậc độ lớn**.

### A-3 · 🔴 Số chỗ còn lại — sự thật quyết định nhất của site, hôm nay ẩn sau ví

**Vì sao.** Còn **4/15 chỗ** (**do**). Người vào `/create-chain/` chỉ thấy con số này **sau
khi** nối ví và ký SIWE (`CreateChainScreen.tsx:217–235` nằm sau nhánh "chưa đăng nhập").
Trang chủ mời *"Launch your own chain on A1"*, danh bạ khoe 11 chain — không dòng nào nói
rằng cánh cửa gần khép. Người bỏ công nối ví, ký, nghĩ tên, rồi mới biết còn 4 chỗ là
người đã bị lấy mất thời gian một cách tránh được.

**Và có một lỗi thứ hai nằm ngay đó:** `const tran = state?.tran ?? 15` +
`soChain = state?.chains?.length ?? 0` (**do**, đọc mã) ⇒ khi `/api/status` hỏng sau lúc
đăng nhập, huy hiệu in **"15/15 slots left"** — một con số **sai theo chiều nguy hiểm**,
đúng lúc người ta chuẩn bị tiêu một chỗ. Đ1-8 đã chốt luật cho chính lớp lỗi này: *ô hỏng
hiện **gạch ngang**, không hiện `0`* — ở đây luật đó chưa được áp.

**Làm gì.**
1. Tính số chỗ từ **dữ liệu công khai** (`/chains/data/console-chains.json`, không cần
   xác thực) và hiện ở: trang chủ (cạnh nút chính), `/chains/` (ô tổng kết thứ 5),
   `/create-chain/` **trước** nút "Connect wallet".
2. Đổi `?? 15` thành trạng thái **không biết** (gạch ngang + lời khai), không đoán.
3. Khi hết chỗ: nút chính đổi thành "Xem danh bạ" thay vì mời làm một việc không làm được.

**Chi phí.** M (một nguồn dữ liệu đã có, ba chỗ hiện, 2 khoá chữ × 30).

**Điều kiện qua.** HTML tĩnh của cả ba trang chứa số chỗ; **đối chứng ngược:** fixture 15
chain ⇒ cả ba chỗ đổi sang "hết chỗ" và nút chính đổi vai.

### A-4 · Việc đã viết xong đang nằm trong cây, chưa commit, chưa lên sóng

**Vì sao.** `git status` (**do**): `local-net/deploy/Caddyfile` +44 · `caddy-deploy.sh` +45 ·
`web/test/404-caddy.test.ts` +81 — trọn vẹn khối **chuyển hướng liên kết explorer cũ**
(`/tx/<64hex>` · `/address/<40hex>` · `/block/<số>` → `a1.9scan.org`, **302**, kèm cổng đo
tới tận 200 ở đầu bên kia và đối chứng ngược cho hash cụt). Đó chính là câu hỏi **số 1**
mà `WORKTREE-WEB.md` ghi là *"David chưa trả lời"* — nhưng chú thích trong mã lại ghi
*"(David chốt 2026-09-04)"*.

Đo trên site sống: `/tx/0x…01` ra **404** (**do**) ⇒ **chưa deploy**.

⇒ Hai khả năng, và chúng đòi hai hành động ngược nhau: hoặc David đã chốt và lượt deploy bị
bỏ dở giữa chừng, hoặc chú thích đó viết trước khi có câu trả lời. **Phải hỏi trước khi
deploy** — đây là chuyển hướng sang một dự án khác.

**Chi phí.** S nếu chỉ deploy (script đã có cổng), 0 nếu bỏ.

**Điều kiện qua.** `caddy-deploy.sh` chạy hết 5 phép đo mới (3 thuận + 2 nghịch) và xanh.

### A-5 · `[human]` Bản lưu ngày G — hai ô trống làm mất một mục cả trang

`rebuildDone.archiveUrl` + `archiveSha256` vẫn rỗng ⇒ mục "Archive of the old network" tự
ẩn trên `/re-genesis/` (**do**, đọc `en.ts:91–92` + trang sống không có mục đó). Phiên A1 đã
chạy O2 (`docs/o2-g0-final/`). Chỉ cần dán 2 chuỗi vào 30 tệp — **không phải viết chữ nào**.

---

## 2. ĐỢT B — BỀ MẶT CÒN THIẾU: dự án đã có nội dung, site không mang

> Đây là phần **"đầy đủ nhất"** trong câu hỏi. Không phải viết mới từ đầu — phần lớn là
> đưa lên web thứ repo đã có, đã soát, đã có người đọc.

Kho có sẵn (đo bằng `ls C:\PROJECTS\9Chain-A1\docs`, **do**), **không có một liên kết nào
từ site trỏ tới**:

| Có sẵn trong repo | Site hôm nay |
|---|---|
| `9CHAIN-NINE-YEARS-MANIFESTO.md` + `.en.md` + **2 PDF (VI/EN)** | không có |
| `CREATE-A-CHAIN.md` / `.vi.md` + 2 PDF — hướng dẫn người dùng | không có |
| `RUN-A-VALIDATOR.md` — và **người ngoài đã validate thật** (2 khách đang stake) | không có |
| `WALLET-OPERATIONS.md` · `API-CONSOLE-L1.md` · `TOKENOMICS.md` · `ROADMAP-2026-2029.md` | không có |
| `CEREMONY-2026-09-09.md` — **còn 5 ngày** | không có |

### B-1 · `/docs/` — một trung tâm tài liệu, không phải một liên kết ra GitHub

**Vì sao.** Chân trang có 8 liên kết, mục "About" chỉ trỏ ra `9chain.org` và
`/re-genesis/`. Đ1-13 đã đo: `https://9chain.org/docs/` **404 ở cả ba dạng** (**do**, ghi
trong `WEB-PROGRESS.md`) — nghĩa là **không có nơi nào trên Internet là "tài liệu 9Chain"**.
Một testnet mời người lạ đẻ chain mà không có tài liệu là mời người ta đoán.

**Làm gì.** Trang tĩnh `/docs/` liệt kê 4–6 tài liệu, mỗi tài liệu một trang con dựng từ
Markdown lúc build (không thêm phụ thuộc runtime), kèm tệp PDF gốc để tải. Bắt đầu bằng:
**tạo chain** · **chạy validator** · **thao tác ví** · **tokenomics**.
Ngôn ngữ: **EN + VI trước** (VI là bản duy nhất có người duyệt); 28 bản còn lại **không
dịch máy tài liệu dài** — khai rõ thay vì dịch bừa.

**Chi phí.** L (bộ dựng Markdown → trang tĩnh, ~4 trang đầu).

**Điều kiện qua.** Mỗi trang docs có ≥ 1.500 ký tự chữ thật **trong HTML tĩnh** (không phải
sau hydrate); mọi liên kết trong đó 200; `check-no-marker` sạch.

### B-2 · `/validators/` — biến câu tự-tố thành lời mời

**Vì sao.** Câu tự-tố trên trang chủ nói: *"9 trong 11 validator chạy trên cùng một máy,
cùng nhà cung cấp… phi tập trung ở tầng giao thức, chưa ở tầng hạ tầng"* (**do**, có trên
site). Đó là câu trung thực nhất của site — và nó **kết thúc ở đó**. Người đọc muốn giúp
không có đường nào: không hướng dẫn, không yêu cầu phần cứng, không cách xin stake.

Trong khi đó dự án **đã chứng minh người ngoài làm được** (khép trọn vòng
clone→build→join→stake→validate `29/08`; hai khách đang stake thật). Đây là bề mặt có tỷ lệ
**giá trị/công sức** cao nhất còn lại: nó tấn công thẳng điểm yếu mà site tự khai.

**Làm gì.** Trang `/validators/`: số validator đang chạy (đã có `stats.ts`) · yêu cầu máy ·
6 bước từ `RUN-A-VALIDATOR.md` · cách xin LOVE9 để stake · **và một bảng thành thật về cái
người ta nhận lại** (không hứa phần thưởng nếu chưa có).

**Chi phí.** M.

**Điều kiện qua.** Một người lạ đi hết trang, không phải mở repo lần nào, dựng được node —
kiểm bằng cách đưa cho phiên A1 đọc và hỏi "còn thiếu bước nào".

### B-3 · `/nine-years/` — sứ mệnh không có mặt trên site của chính nó

**Vì sao.** Tầm nhìn đã chốt `04/09`: **9 năm · 9 tỷ chain**, tuyên ngôn VI/EN đã viết,
PDF đã có. Site hiện mô tả sản phẩm ở tầng *"một L1 của bạn trong ba phút"* và dừng ở đó.
Người đọc không có cách nào biết đây là bước 1 của một kế hoạch 9 năm — thứ duy nhất phân
biệt dự án này với một faucet testnet bất kỳ.

**Làm gì.** Một trang tuyên ngôn (EN+VI, đọc được trong 3 phút, có PDF tải về) + một trang
`/roadmap/` rút từ `ROADMAP-2026-2029.md` với mốc **đã đạt** đánh dấu bằng **phép đo**, không
bằng dấu tích tự phong.

**Chi phí.** M.

### B-4 · `/ceremony/` — `2026-09-09`, còn 5 ngày, site im lặng

**Vì sao.** Nghi lễ Block Adam có tài liệu, có diễn tập 4 lượt, có cơ chế khắc chữ và bộ
đọc ngược. Đây là **sự kiện công khai duy nhất có ngày giờ chính xác** của dự án. Sau khi
nó xảy ra, thứ khiến nó có ý nghĩa là **người ngoài kiểm lại được** — mà muốn kiểm thì phải
biết trước nó là gì.

**Làm gì.** Trang có: đồng hồ đếm ngược (giờ UTC + giờ địa phương người xem) · đúng những
gì sẽ được khắc · **cách tự kiểm sau đó** (một lệnh, hoặc một liên kết explorer). Sau sự
kiện trang tự chuyển sang thì quá khứ + kết quả — cùng khuôn `rebuild`/`rebuildDone` đã có.

**Chi phí.** M. 🔴 **Có hạn: 5 ngày.** Làm sau sự kiện thì mất phần "đếm ngược" vĩnh viễn.

### B-5 · `/supply/` (hoặc mục trong `/compare/`) — nay đã có nguồn thật

**Vì sao.** Chặn C1 đã hết (**do**: `/faucet/api/supply` 200). Luật cứng của họ nhà 9Scan:
*"số công bố phải đọc từ chain thật"*. Endpoint này làm được đúng điều đó và còn giải thích
được **nghịch lý 7.900.000.001 vs 9.000.000.000** — thứ đã ghi ba lần trong repo mà chưa
lần nào lên trang.

**Làm gì.** Một mục đọc endpoint, in 3 số (X/P đo được · C-Chain genesis đo được · tổng), và
in **cách đo** cạnh mỗi số. Ô hỏng ⇒ gạch ngang (Đ1-8).

**Chi phí.** S–M.

### B-6 · `/status/` — sức khoẻ thật, không phải nhịp bơm

**Vì sao.** `/live` nói về **traffic tổng hợp** và tự tắt khi bơm dừng (thiết kế đúng, đã
tắt — **do**: trang chủ không còn dải băng). Nhưng không trang nào trả lời câu người dùng
thật hỏi khi có sự cố: *RPC còn sống không · faucet còn tiền không · console còn nhận
lệnh không · lần deploy gần nhất là bao giờ*. Hôm nay câu trả lời nằm rải rác ở 4 endpoint.

**Chi phí.** M. **Điều kiện qua:** tắt faucet ⇒ trang phải chuyển sang đỏ **và nói đúng cái
gì hỏng**, không phải "có lỗi".

### B-7 · Việc rẻ gộp một lượt

- `/brand/` — bộ kit 14 tệp đã có trong `web/public/brand/`, chưa có trang nào cho người
  ngoài lấy đúng logo, đúng hai sắc vàng, đúng vùng an toàn.
- **FAQ** — 8–10 câu rút thẳng từ những gì David đã phải trả lời tay cho khách (số dư 0 sau
  re-genesis · ví điện thoại · L1 hiện `LOVE9` · vì sao block đứng yên).
- `[human]` **liên hệ / báo lỗi** (D2) và **chính sách log/riêng tư** (D4) — vẫn chặn, và
  **vẫn không được bịa**.

---

## 3. ĐỢT C — TÍNH NĂNG SẢN PHẨM ĐANG NỢ THEO HỢP ĐỒNG API

Phiên A1 đã bàn giao hợp đồng đo thật: [`API-CONSOLE-L1.md`](../../9Chain-A1/docs/API-CONSOLE-L1.md)
(ở worktree `main`). Thứ tự họ đề nghị: **P-55 → P-62 → P-60**. P-55 **xong**.

### C-1 · P-62 · Màn xem trước + câu ký (chặn cuối trước một chỗ vĩnh viễn)

`GET /api/preview` trả `facts` / `can` / `cannot` do **server** tính. Hôm nay màn duyệt của
site tự viết câu từ từ điển ⇒ khi console đổi luật, site vẫn nói câu cũ một cách tự tin.
Kèm ba nhóm tuỳ chọn (`allocations` · `fees` · `precompiles`) với rào đọc từ
`/api/status.limits` — **đừng chép rào vào mã web**.

🔴 Đây là màn hình cuối trước khi tiêu một trong **4 chỗ còn lại**. Nếu chỉ làm được một
mục của cả đợt C, làm mục này.

### C-2 · P-60 · "Quản trị chain của tôi"

`GET /api/governance` (vai trò đo được + precompile đang bật/chờ) · hai màn xem trước
(`/api/upgrade-preview`, `/api/preview`) · gọi precompile qua MetaMask · `transfer-owner`
**đúng thứ tự** (đổi admin trên precompile **trước**, ghi sổ **sau**).
🔴 Hợp đồng ghi rõ hai điều giao diện phải tôn trọng: hiện **BA** trạng thái chứ không hai
(§5.1), và in **chainId + RPC của chain đang xem** ngay trên màn — vì "đúng nhưng ở nhầm
chain" là lớp lỗi đã xảy ra thật.

### C-3 · Trang chi tiết cho mỗi L1

Danh bạ mới rất tốt cho việc **quét**, nhưng một chain không có URL riêng: không dán được
vào chat, không index được, không có thẻ chia sẻ. `/chains/<slug>/` tĩnh dựng từ snapshot
lúc build + làm tươi bằng RPC ⇒ đây cũng là **nội dung có thật** cho SEO (xem D-2).

### C-4 · Ô bật thư viện hợp đồng (nửa P-59)

Đọc `/api/status.contractLibrary`, hiện địa chỉ + **số byte nó thêm vào genesis**. Nhỏ,
nhưng nó là thứ duy nhất hôm nay khiến người dùng phải đọc tài liệu mới biết mình có gì.

---

## 4. ĐỢT D — TỐI ƯU (hiệu năng · tìm kiếm · chữ · a11y)

### D-1 · 🔴 Chữ thương hiệu: 30 mặt khai, 1 mặt chạy

**Đo trên site sống hôm nay** (**do**): `document.fonts.size = 30`, số mặt `loaded` = **1**
(`Outfit 700`, chữ trong logo). `getComputedStyle(:root)['--font-sans']` = **chuỗi rỗng**;
`<h1>` và `<body>` đều ra `ui-sans-serif, system-ui…`. Chữ đơn cách cũng là stack hệ thống.

⇒ Toàn bộ hệ chữ thương hiệu **chưa từng chạy một ngày nào trên site công khai**. Đây
không phải phát hiện mới (B1+B2 đã ghi) nhưng nay có **phép đo trên sản phẩm sống ngày
`04/09`**, không còn là suy luận từ mã.

**Ràng buộc vẫn giữ nguyên và phải nhắc lại:** B1 (vá nối biến) **không được lên trước** B2
(đổi bộ chữ có `vietnamese`). Vá B1 một mình = bật font thiếu dấu tiếng Việt lên cho 30
ngôn ngữ. Và B1 lên thì phải nâng trần `check-budget` (hiện 160 KB; trang nặng nhất
143,9 KB).

**Đề xuất cụ thể để gỡ thế kẹt** — thế kẹt hôm nay là *"chờ 9Scan chốt bộ chữ"*, nhưng
`27/08` đã đính chính rằng **lỗi nối biến là của riêng A1** và B1 **không cần ai gật**.
Vậy đường ra là chốt B2 độc lập: chọn bộ chữ có subset `vietnamese` (JetBrains Mono **đã
có** — chỉ là một dòng config), rồi B1+B2 lên **cùng một lượt**. Vân tay token vẫn để đỏ
có chủ ý cho tới khi 9Scan chốt — hai việc đó **không phải một việc**.

### D-2 · Trang render theo dữ liệu phải có nội dung trong HTML tĩnh

`/chains/` HTML tĩnh = `Loading…` (**do**). Trang chủ có 2.072 ký tự chữ; các trang khác
mỏng tương tự. Hệ quả: bộ máy tìm kiếm và bộ đọc AI thấy một site gần như trống, đúng lúc
dự án muốn được tìm thấy.

**Làm gì.** Lúc build, đọc snapshot danh bạ (đã là JSON tĩnh) và **kết xuất bảng vào HTML**;
client hydrate rồi làm tươi bằng RPC như hiện nay. Cùng cách cho ô tổng kết trang chủ (in
số **kèm mốc đo**, không giả vờ là số thời gian thực).

**Điều kiện qua + đối chứng ngược.** Cổng mới: mỗi trang trong `out/` phải có ≥ N ký tự chữ
thật trong HTML; **đối chứng ngược:** trả `/chains/` về bản chỉ có `Loading…` ⇒ đỏ.

### D-3 · Đa ngôn ngữ mới xong một nửa: 30 bản dịch, 1 URL

Kiến trúc hiện tại (metadata ở server tiếng Anh, chữ ở client) đã ghi rõ hệ quả: người đọc
tiếng Việt dán liên kết vào nhóm chat vẫn ra thẻ tiếng Anh. Thêm vào đó (**do**): **không
có `hreflang`**, không `og:locale:alternate`, một `canonical` duy nhất cho 30 ngôn ngữ.
⇒ 29 bản dịch **không tồn tại đối với công cụ tìm kiếm**. Đó là một khối công việc rất lớn
đang không thu về gì ở kênh phân phối lớn nhất.

**Ba mức, chọn theo giá:**

| Mức | Làm gì | Giá | Thu được |
|---|---|--:|---|
| 1 | `hreflang` + `og:locale:alternate` trỏ `?lang=xx` | S | báo với công cụ tìm kiếm rằng bản dịch tồn tại |
| 2 | Xuất tĩnh `/{lang}/…` cho **9 trang × 30** = 270 trang, mỗi trang `<title>`/`meta`/`og` đúng ngôn ngữ | L | thẻ chia sẻ đúng ngôn ngữ · index được · không đổi kiến trúc client |
| 3 | Mức 2 + chuyển hướng theo `Accept-Language` (giữ được lựa chọn tay) | L+ | trải nghiệm lần đầu |

**Khuyến nghị: mức 2**, sau đợt A/B. Xuất tĩnh nên 270 trang chỉ là dung lượng đĩa, không
phải chi phí runtime; và nó **không** buộc phải bỏ cơ chế đổi ngôn ngữ ở client.

### D-4 · Dữ liệu có cấu trúc (JSON-LD) — 0 khối hôm nay (**do**)

`Organization` + `WebSite` + `SoftwareApplication` + `FAQPage`. Rẻ, và là cách duy nhất
để một cỗ máy hiểu "LOVE9 là gì", "chainId nào", "RPC ở đâu" mà không phải đoán từ văn xuôi.

### D-5 · `[human]` Chính sách bò thu thập AI — một mâu thuẫn chiến lược

`robots.txt` đang phục vụ (**do**) chặn **`GPTBot` · `ClaudeBot` · `Google-Extended` ·
`Applebot-Extended` · `CCBot` · `Bytespider` · `meta-externalagent`** — 17 khối
`Disallow: /`, do **Cloudflare Managed robots.txt** chèn, không do ai ở dự án viết (B-10 đã
ghi việc tắt nó là "thẩm mỹ", chưa ai đọc nó theo hướng này).

🔴 Xương sống của tầm nhìn là *"từ năm 5, ai dùng AI cũng cần một L1 riêng"*. Site đang
**cấm chính những cỗ máy đó đọc mình**. Khi có người hỏi trợ lý AI "9Chain A1 là gì", câu
trả lời sẽ dựng từ nguồn khác, hoặc không có.

Đây là **quyết định của David**, không phải việc dọn dẹp: có lý do chính đáng để chặn (nội
dung bị lấy không ghi nguồn). Nhưng nó phải là một **lựa chọn**, không phải mặc định của bên
thứ ba mà không ai đọc.

### D-6 · HTML ở biên

HTML là `no-cache` ⇒ `DYNAMIC` ⇒ mỗi lượt xem đi tới OVH: **1,0–1,7 s** đo từ Hồng Kông
(**do**). Với `?dpl=<sha>` đã có (mỗi deploy là khoá cache mới), có thể cho biên giữ HTML
(`s-maxage` + purge lúc deploy) mà **không** quay lại lớp lỗi `immutable` — vì lớp lỗi đó
là *lời khai vĩnh viễn gắn lên một URL không đổi*, còn đây là *lời khai ngắn hạn có đường
huỷ*. ⚠️ Chỉ làm **sau** khi `web-deploy.sh` có bước purge và cổng đo `Age` sau deploy.

### D-7 · A11y — Đ1-9 vẫn mở, và cổng đang tắt đúng luật quan trọng nhất

`check-a11y.mjs:72` tắt `color-contrast` (có lý do: jsdom không tính được nền kế thừa).
⇒ Cổng a11y hiện **không** đo thứ hay hỏng nhất. Đề xuất: chạy axe **trong Browser pane**
(nơi có layout thật) cho 9 trang × 2 chủ đề, bật `color-contrast`, rồi mới đóng Đ1-9 (bàn
phím · `aria-live` · phóng 200% · `prefers-reduced-motion`).

### D-8 · Trang 404 đẹp vẫn nằm trong `out/` mà không ai thấy

`/404.html` là bản Next đầy đủ **31.765 byte** và trả **200**; đường lạ nhận bản tối giản
**2.076 byte** viết thẳng trong Caddyfile (**do**). Bản Caddy này thiếu `replace_status`.
Hai đường ra: dựng image Caddy có module đó, hoặc `file_server` + mã trạng thái tường minh.
Không gấp — nhưng hôm nay site có **hai** trang 404 khác nhau và chỉ một trang được chăm.

---

## 5. ĐỢT E — CỔNG (thứ dự án này thật sự bán)

Mọi đợt trên đều sinh cổng. Ba cổng **chưa có** đáng làm nhất, xếp theo lớp lỗi đã trả giá:

| Cổng | Bắt lớp lỗi | Đối chứng ngược |
|---|---|---|
| **`check-copy-truth.mjs`** — mọi con số trong chữ (phút tạo chain · số validator · số chỗ) phải khớp phép đo cùng ngày | *"chữ và mạng trôi khỏi nhau"* — đã xảy ra 4 lần | sửa một số trong `en.ts` ⇒ đỏ |
| **`check-prerender.mjs`** — mỗi trang ≥ N ký tự chữ trong HTML tĩnh | *"bản dựng cục bộ nói dối về trang có dữ liệu"* | trả `/chains/` về `Loading…` ⇒ đỏ |
| **`check-console-contract.mjs`** — hình dạng `/api/status` (`presets`, `limits`, `tran`) khớp thứ web đang giả định | *"cổng chỉ chứng minh đường của nó"* | thêm một khoá lạ / bỏ `limits` ⇒ đỏ |

Kèm nợ cũ: **Đ1-11b phần 2–3** (so **danh sách** chunk chứ không so số đếm · `pnpm test`
trong script deploy · `web-rollback.sh`).

---

## 6. VIỆC CỦA DAVID — 8 câu, mỗi câu mở khoá một khối

| # | Câu hỏi | Mở khoá |
|---|---|---|
| 1 | **Deploy khối chuyển hướng `/tx/` sang 9Scan không?** (đã viết xong, đang nằm trong cây; chú thích khai "David chốt 04/09" nhưng `WORKTREE-WEB.md` khai "chưa trả lời") | A-4 |
| 2 | **Chốt bộ chữ (B2)** để B1+B2 lên cùng lượt — không cần chờ 9Scan | D-1 |
| 3 | **Bò thu thập AI**: giữ hay bỏ khối chặn của Cloudflare | D-5 |
| 4 | **Kênh liên hệ thật (D2)** + **chính sách log (D4)** | B-7, Đ1-10 |
| 5 | **`archiveUrl` + `archiveSha256`** của bản lưu ngày G | A-5 |
| 6 | **Có làm trang nghi lễ `09/09` không** — quyết trong 1–2 ngày, sau đó mất phần đếm ngược | B-4 |
| 7 | **Thứ tự Đợt B vs Đợt C**: mang tài liệu/tuyên ngôn lên trước, hay làm P-62/P-60 trước | B vs C |
| 8 | **Gộp `web-home` → `main`** — hai nhánh đã lệch **295 / 113 commit** (**do**), `web/` khác nhau 118 tệp | rủi ro vận hành |

---

## 7. NẾU CHỈ LÀM MỘT TUẦN — thứ tự đề nghị

1. **A-1 · A-3 · A-2** — sự thật đang sai, rẻ, không chờ ai (nửa ngày).
2. **B-4 nếu David gật** — có hạn cứng `09/09`.
3. **C-1 (P-62)** — chặn cuối trước 4 chỗ vĩnh viễn còn lại.
4. **B-2 `/validators/`** — bề mặt duy nhất tấn công thẳng điểm yếu site tự khai.
5. **D-2 + cổng `check-prerender`** — mở đường cho D-3 và cho mọi thứ liên quan tìm kiếm.
6. **B-1 `/docs/`** — nền cho tất cả phần còn lại, và là thứ duy nhất không tự cũ đi.

🔴 **Ba việc KHÔNG nên làm sớm:** đo thời gian tạo chain bằng cách đẻ chain thật (tốn 1
trong 4 chỗ vĩnh viễn) · vá B1 một mình · cho biên giữ HTML trước khi có purge + cổng đo.
