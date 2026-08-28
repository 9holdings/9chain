# Worktree `web-home` — chỉ làm website a1.9chain.org

---

## HANDOFF — cập nhật 2026-08-28 (đợt autopilot)

**TL;DR.** **Đa ngôn ngữ 30/30 XONG.** Thêm 5 mục nữa đóng trong đợt này, đều sinh ra
từ một lượt **đối chiếu site ↔ mạng g0** (đo mạng thật trước, rồi mới đọc mã).
Test **139/140** — nay chỉ còn **MỘT** bài đỏ có chủ ý (vân tay token, chờ 9Scan);
bài "còn thiếu từ điển" đã xanh.

✅ **ĐÃ DEPLOY `2026-08-28`** — David duyệt, đã báo phiên chain `9chain-a1-20` trước.
Chỉ chép `web/out`; **KHÔNG đụng Caddyfile** (không đổi trong đợt này) nên không có
nguy cơ ghi đè lẫn nhau như lần `27/08`.
Mỏ neo đang chạy: **`commit=f38b99fd7ff8` · `con-sua-chua-commit=khong` · 40 chunk**.

**Nghiệm thu SAU deploy — đo nội dung trên mạng, không tin dòng "✓ xong" của script:**

| Đo | Trước | Sau |
|---|---|---|
| `/version.txt` | **404 thật** (nginx, `text/html`) | **200**, `text/plain`, **khớp từng byte** với `web/out/version.txt` |
| Câu "đã sinh lại 27/08" | chỉ `/re-genesis/` | **6/6 trang** |
| Ngôn ngữ "chưa có" | 19 | **0** (29 nhãn máy dịch + `vi` có người soát = 30) |
| `vi-VN` trong chunk đang phục vụ | có | **0/10 chunk** |
| host ↔ container | — | **107 = 107 tệp** (không dính bẫy inode) |
| Liên kết nội bộ | — | **7/7 sống**, đo bằng nội dung |

**Chrome thật, qua Cloudflare, trên `https://a1.9chain.org`:**
dải hiện `Already rebuilt once on 2026-08-27 → A1 is being rebuilt on 2026-09-01 →
Details` · số liệu **9/9 · 0 · 1** (ô `0` ở đây là **số 0 đo được thật**, khác hẳn ô
`—` nghĩa là chưa đo được — đúng thứ Đ1-8 dựng ra để phân biệt) · bấm **Gujarati** ⇒
`lang=gu`, dải lật, và **đúng MỘT chunk mới** tải ở `t=28190ms`.

| Đợt này đóng | |
|---|---|
| **D-web-1** | Dải cảnh báo nay nói **cả mốc ĐÃ QUA** (`27/08`), không chỉ `01/09` |
| **D-web-2** | Bỏ `toLocaleString('vi-VN')` cắm cứng — số theo ngôn ngữ, giữ chữ số Latin |
| **Đ1-11b p1** | `version.txt` + `check-routes.mjs` nay đo **CẢ HAI CHIỀU** |
| **i18n** | **30/30** từ điển, ngân sách chỉ +1,0 KB (nạp lười chạy thật) |
| **B2** | Cổng danh tính canh **thế hệ**; kèm sửa mã thoát `127 → 1` |
| **Đ1-8** | Lưới an toàn mạng — một nguồn chết thôi kéo cả dải số liệu biến mất |

### 🔴 Phiên sau bắt đầu từ đâu

1. `git -C C:\PROJECTS\9Chain-A1 log --oneline -5` — phiên chain commit liên tục.
2. Backlog: [`docs/WEB-PROGRESS.md`](docs/WEB-PROGRESS.md) — mục
   **"ĐỐI CHIẾU SITE ↔ MẠNG g0"** là phần còn mở.
3. **Autopilot làm được ngay, không cần hỏi ai:** **Đ1-9** (a11y ngoài tầm axe) ·
   **Đ1-7** (đường ra khỏi phiên ví) · **Đ1-11b phần 2–3** (so DANH SÁCH chunk thay
   vì chỉ số đếm, `web-rollback.sh`).

4. **Hai quyết định đang chặn — `[human]`:**
   - **A2 · câu "khoảng ba phút" ĐANG SAI trên mạng.** Nó ở 3 chỗ trong `en.ts`
     (`:198` `cPhu` → cũng là **`og:description`**, `:225`, `:335`). Số đo mới nhất
     trong repo là **305,5s ≈ 5 phút** trên mạng 9 node ([`HANDOFF.md:489`](HANDOFF.md));
     con số ~170s là thời mạng **5 node**. Mâu thuẫn nội bộ xác nhận:
     `web/lib/wallet.ts` đặt `tranGiay = 420` — **mã chờ 7 phút trong khi chữ hứa 3**.
     🔴 Sửa được nhưng **phải đo lại trên g0 trước**, và phép đo đó là **đẻ một chain
     thật trên mạng công khai** ⇒ cần David gật.
   - **C1 · `/faucet/api/supply` đang 404 thật** — việc của phiên chain, xem dưới.

---

## Đã xong trong phiên này (đều đã lên mạng công khai và đã đo)

### Đợt 1 — 7/11 mục

| | Đo được |
|---|---|
| **Đ1-1** Caddy một lượt | `/create-chain` `/my-chains` `/compare` từ **404 vỏ Blockscout 75.964 byte** → **301**; HTML nay `Cache-Control: no-cache`; `/404.html` `/version.txt` `/index.txt` vào `@trangmoi` |
| **Đ1-2** Trang 404 | **404 · 2.076 byte · tiếng Việt · 3 đường ra · noindex** (trước: 75.964 byte tiếng Anh, 0 lần chữ "9Chain", 0 `href` về site) |
| **Đ1-3** Duyệt giọng + cổng `[?]` | `/re-genesis/` **64 → 0** dấu; 5 trang khác 6→0, 9→0 |
| **Đ1-4** Trang chủ thôi nói sai | H1 chỉ-trỏ → câu về sản phẩm; thêm 2 dòng tự tố (9 node một máy · block đứng yên là bình thường) |
| **Đ1-5** Thẻ chia sẻ | `og:title` nay **khác nhau từng trang**; `sitemap.org` → `sitemaps.org` |
| **Đ1-6a** Màn hình thôi đứng im | 900s → 420s + `LoiConsole` mang mã HTTP |
| **Đ1-13** Chân trang | **0 → 8 liên kết**; `/re-genesis/` thân trang **0 → 3 href** |

### Đa ngôn ngữ — **30/30 XONG** (`2026-08-28`)

`en` trong bundle + **29 chunk lười**. 3 bản RTL (`ar ur fa`) — bộ component vốn dùng
**thuộc tính logic** (`ms-`, `end-`, `text-start`) nên **không phải sửa một dòng nào**
cho hướng viết. Giữ nếp đó.

- Ngân sách: **134,3 → 135,3 KB gz** cho **19 bộ thêm** (trần 160). +1,0 KB là bằng
  chứng nạp lười chạy thật — trần chỉ đếm thứ tải **vô điều kiện**.
  ⇒ **i18n KHÔNG phải rủi ro ngân sách. Font (B1+B2) mới là.**
- Bài `i18n-shape` **đổi vai**: từ bộ đếm tiến độ (đỏ có chủ ý) thành **cổng thật** —
  thêm ngôn ngữ vào `ngonNgu.ts` mà quên từ điển sẽ đỏ. **Đừng gỡ nó vì "đã xong rồi".**
- ⚠️ Việc còn lại của i18n là việc của **người**: 29/30 bản chưa ai đọc được để soát.
  `soat: 'may'` là một **lời khai**, không phải tinh chỉnh.

### Mạng sinh lại thế hệ g0 (D-081, ngày 2026-08-27)

`networkID` **9001 → 999999999** · `networkName` → **`9chain-a1-g0`** ·
`eth_chainId` **KHÔNG đổi** (D-047 giữ `9000000009`) · block C-Chain `0x1` · danh bạ 0/0.

- Đã sửa `web/lib/chain.ts` và thêm cảnh báo "đã sinh lại 27/08" vào **11 từ điển**.
- **Cảnh báo 01/09 GIỮ NGUYÊN** — còn một lượt sinh lại nữa, câu đó vẫn đúng.
- Câu "tổng cung 9.000.000.000" **vẫn đúng**, đã kiểm: 7.900.000.001 (P/X) +
  1.099.999.999 (C-Chain).

---

## Việc tiếp — cụ thể, làm được ngay

### Đợt 1 còn tồn

- **Đ1-9** a11y ngoài tầm axe — bàn phím, `aria-live`, phóng 200%, `prefers-reduced-motion`.
- **Đ1-11b phần 2–3** — phần 1 (`version.txt` + cổng route hai chiều) **XONG 28/08**.
  Còn: so **DANH SÁCH** chunk lấy từ bản VỪA DỰNG (`so-chunk-js` hiện chỉ là số
  **đếm** — hai bộ tệp khác nhau vẫn có thể cùng số đếm) · `pnpm test` trong script ·
  `web-rollback.sh`.
  🔴 **TUYỆT ĐỐI không `mv out.new out`** — bẫy inode bind-mount, đã cắn 25/08.
- **Đ1-7** đường ra khỏi phiên ví.

### Chờ người `[human]`

- **D1 mở rộng** — 30+ chuỗi mới sinh trong phiên này chưa qua duyệt giọng; nguyên văn
  ở bảng cuối `docs/WEB-PROGRESS.md` (quyết định tự chủ **A-1**).
- **D2 kênh liên hệ thật** — chặn mục "liên hệ/báo lỗi" ở chân trang.
  🔴 Không có câu trả lời thì **KHÔNG LÀM**, tuyệt đối không bịa địa chỉ.
- **D4 chính sách log/riêng tư** — chặn Đ1-10 mục 2–3.
- **D14 Cloudflare Analytics** — 5 phút, 0 dòng mã, có thể trả lời "đã có người thật
  vào chưa" **cho cả những ngày đã qua**.
- **Đ1-2 nâng cấp** — trang 404 hiện là bản tối giản viết thẳng trong Caddyfile
  (David chọn đường (b)). Bản đẹp `out/404.html` cần `replace_status`, mà **bản Caddy
  này không có module đó**.

### Việc của PHIÊN CHAIN (đã báo `9chain-a1-20` ngày `28/08`)

- **C1 · `/faucet/api/supply` đang 404 THẬT.** Đo:
  `curl https://a1.9chain.org/faucet/api/supply` → **404** `{"error":"not found"}`.
  Đó là 404 của **chính faucet** (vì `/faucet/api/info` sống ⇒ Caddy cắt tiền tố
  đúng), trong khi repo **CÓ** route ở `local-net/faucet/server.mjs:241` ⇒ **bản
  faucet đang chạy cũ hơn đợt 14**. Cần deploy lại faucet **kèm `cung.json` +
  `faucet.env`**.
  🔴 **Bẫy khi kiểm:** `/api/supply` ở **gốc** (không có `/faucet`) do **Blockscout**
  trả lời — HTTP 400 + JSON của họ. Kiểm nhầm đường đó sẽ kết luận sai hoàn toàn.
  ⇒ Việc HANDOFF giao phiên web ("câu khai nguồn cung trên trang") **chờ cái này**,
  hoặc chuyển sang đường (b) của A-5: khai nguồn là *tham số genesis*.

- **C2 · Explorer site trỏ sang vẫn công bố `networkID 9001`.** Đo `28/08` trên
  `a1.9scan.org`: `<title>… block explorer · 9001`, **12 lần** chuỗi `9001` trong
  HTML. Repo của họ **ĐÃ CÓ** commit `2a84d95` sửa `9001 → 999999999` ⇒ **độ trễ
  deploy, không phải họ chưa biết.**
  Ảnh hưởng thật: site đưa `blockExplorerUrls: ['https://a1.9scan.org']` vào ví qua
  EIP-3085 ⇒ người dùng thêm mạng xong bấm sang explorer thì gặp con số **mâu thuẫn
  với chân trang A1**.
  🔴 Câu hỏi kiến trúc chưa quyết: `check-chain-id.mjs` chỉ chứng minh hằng số **CỦA
  A1**, nó **không đo thứ A1 trỏ người dùng tới**. Có dựng cổng đo cả explorer không?

### Kẹt `[blocked]`

- **Vân tay token đỏ có chủ ý** — 9Scan đổi `--font-display`→Manrope,
  `--font-sans`→Inter (**không token màu nào đổi**). Chờ họ xác nhận đã chốt / đã khai
  `next/font` với subset `vietnamese` / đã deploy. Đồng bộ bản còn dở tệ hơn để đỏ.
- **B1+B2 (cụm font)** — B1 không cần 9Scan gật, nhưng **B1 không được LÊN TRƯỚC B2**;
  ràng buộc là THỨ TỰ, không phải quyền quyết. B1 lên là phải chỉnh trần
  `check-budget.mjs` (134,2 + font ~144 KB **vượt** 160).

---

## Gotchas của phiên này

### Mười cổng đang canh, và cái mỗi cổng KHÔNG bắt được

| Cổng | Bắt | Mù với |
|---|---|---|
| `check-routes.mjs` | **hai chiều**: tệp thiếu route **và** route trỏ vào hư không | nội dung |
| `check-chain-id.mjs` | chainId · networkID · **thế hệ** lệch mạng thật | câu chữ |
| `so.test` — locale | ai đó cắm cứng lại `toLocaleString('xx')` | định dạng có đẹp không |
| `mang.test` — 4 kiểu hỏng | hết giờ / http / trả rác / đứt mạng | — |
| `mang.test` — **hạn giờ create/revoke** | ai đó thêm tham số thứ tư vào 2 đường dài | — |
| `check-no-marker.mjs` | dấu `[?]` lọt ra `out/` | chuỗi tiếng Anh viết thẳng |
| `i18n-shape` | khoá lệch · `{chỗ}` mất · chuỗi rỗng | **câu dịch sai nghĩa** |
| nhiễm hệ chữ | chữ ngôn ngữ khác lọt vào | như trên |
| `seo.test` | `og:*` dùng chung | — |
| `404-caddy.test` | màu trang 404 trôi khỏi `tokens.css` | — |

### 🔴 Lỗi đắt nhất: mọi cổng xanh vì **cùng đo sai đại lượng**

Xảy ra **ba lần** trong ngày, và mỗi lần đều "không cổng nào bắt được":
- `og:*` dùng chung 6 trang — mọi cổng đo `<title>`, mà `<title>` **đã** riêng từ lâu.
- `networkID 9001` sau khi mạng sinh lại — `tsc`/test/`check-links` đều đo **TRANG**,
  không cái nào đo **QUAN HỆ giữa trang và mạng**.
- `/moi/` alias che một trang 404 **thật** nhiều ngày.

⇒ Thang đo từ yếu tới mạnh: **mã HTTP → content-type → nội dung → header tầng trước**
(`cf-cache-status`).

### 🔴 Gotchas MỚI của đợt `2026-08-28` — thứ sẽ tốn giờ nếu không biết trước

**1. Cổng kiểm một QUAN HỆ mà chỉ đo MỘT CHIỀU.**
`check-routes.mjs` hỏi *"mọi tệp trong `out/` đã có route chưa?"* và xanh suốt, trong
khi `/version.txt` **đã nằm trong `@trangmoi` từ Đ1-1** mà không có gì sinh ra tệp ⇒
**404 thật trên mạng công khai nhiều ngày**. Chiều kia không ai hỏi.
⇒ Dấu hiệu nhận biết: cổng nào có dạng *"mọi X đều có Y"* thì **luôn hỏi tiếp
"còn mọi Y có X không?"**.

**2. `process.exit()` sau nhiều `fetch` trên Windows ⇒ mã thoát 127, không phải 1.**
Đo trên Node 24: sau ~3 lượt `fetch`, `process.exit(1)` làm libuv ném
`Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), src\win\async.c:94` và tiến
trình thoát **127**. Tái lập 3/3. Sửa: `process.exitCode = 1` rồi để vòng lặp tự cạn.
⚠️ Đáng sửa dù 127 vẫn khác 0 nên `&&` vẫn chặn: dòng "Assertion failed" **đọc như
chính cổng bị hỏng**, nên người đang vội trước một lượt deploy rất dễ kết luận "cổng
lỗi" rồi bỏ qua nó — lỗi này biến một cổng **đang chặn đúng** thành một cổng **bị nghi
ngờ**.
⇒ Kiểm một cổng phải kiểm **ba** nửa: *có chặn không* · *chặn xong nói gì* ·
**thoát ra mã gì**.

**3. Cổng đếm tham số bằng regex sẽ BÁO OAN.**
Cổng canh `/api/create` đỏ ngay lần chạy đầu vì `{ name, xacNhan }` có dấu phẩy bên
trong — regex tưởng có tham số thứ tư. **Một cổng báo oan còn nguy hơn cổng không có,
vì người ta học cách bỏ qua nó.** Phải cân ngoặc thật.

**4. Mỏ neo phiên bản chỉ mang SHA sẽ nói dối rất tự tin.**
Dựng từ cây còn sửa dở thì SHA trỏ vào một commit **không chứa** thứ đang lên sóng.
`version.txt` vì thế khai cả `con-sua-chua-commit`. Đã chứng minh sống: lượt dựng giữa
phiên khai `co`, lượt dựng trước deploy khai `khong`.

**5. Chính phép reset mạng có thể CHE một khuyết tật.**
`toLocaleString('vi-VN')` cắm cứng sai cho 29/30 ngôn ngữ — nhưng mạng vừa sinh lại
nên `eth_blockNumber = 1`, mà **một chữ số thì không có dấu phân cách**, nên mọi ngôn
ngữ in ra y hệt nhau ⇒ triệu chứng bằng 0. `01/09` mạng lại về 1, cửa sổ ẩn mở thêm
lượt nữa. ⇒ Bài kiểm cho lớp lỗi này phải đo **thẳng hàm** với số đủ lớn, **không đo
qua mạng**.

**6. `Promise.all` buộc các nguồn ĐỘC LẬP sống chết cùng nhau.**
Số validator không phụ thuộc việc danh bạ L1 có đọc được hay không, nhưng `all` làm
một nguồn chết là mất cả ba ô — **đúng lúc trang cần nhất để nói "9/9 còn sống"**.
⚠️ Nhưng luật cũ *"đừng hiện một con số sai lệch"* vẫn đúng và vẫn phải giữ: ô hỏng
hiện **gạch ngang**, không hiện `0`. "0 validator" đọc như mạng chết.

### Bẫy kỹ thuật

- **`dien()` trong module `'use client'`** ⇒ server component nhập nó làm build đổ với
  `Failed to collect page data for /re-genesis` — thông báo **không nhắc gì** tới ranh
  giới client/server. Đã tách ra `lib/i18n/dien.ts`.
- **`type Tu = typeof EN` với `as const`** ⇒ kiểu là **chữ nguyên văn tiếng Anh**,
  không bản dịch nào gán vào được. Phải nới bằng `SauChuoi<T>`.
- **Từ điển ở phạm vi module** (mảng nav cũ của `SiteHeader`) ⇒ đóng băng với từ điển
  lúc nạp tệp; đổi ngôn ngữ thì cả trang lật, **riêng nav đứng nguyên**, không lỗi nào báo.
- **`BO_NAP` phải viết tay từng dòng** — `import()` với biến làm bundler gom cả thư mục.
  Phép đo của 9Scan: nhập tĩnh 30 từ điển ⇒ First Load JS **264 → 528 kB**.
- **Không `<Suspense>`** với xuất tĩnh — đẻ HTML khung xương không bao giờ giải.
- **`replace_status` KHÔNG có** trong bản Caddy này (`caddy:2-alpine` v2.11.4).
- **Thêm `header` ở Caddy mà quên `defer`** ⇒ nginx ghi đè lại, phép đo ra y như cũ.
- **`mv out.new out`** ⇒ bẫy inode bind-mount. Luôn ghi **vào bên trong** `out/`.
- **Nhiễm chữ giữa các từ điển** — viết 30 bản liên tiếp thì một chữ Nga lọt vào giữa
  câu tiếng Nhật. `tsc` xanh, hình dạng xanh. Nay có cổng riêng.
- **Đo dồn dập nhiều URL** qua Cloudflare ⇒ trả `000` (giới hạn tần suất), **không phải
  liên kết chết**. Đo lại từng cái có `sleep`.
- **React chèn `<!-- -->`** giữa các nút chữ nội suy ⇒ regex `"networkID [0-9]+"` trượt.

### Ranh giới kiến trúc của cả site

**`metadata` ở SERVER** (tiếng Anh, cố định lúc build — xuất tĩnh chỉ có MỘT bản HTML
mỗi trang) · **chữ hiển thị ở CLIENT** (đổi theo người đọc).
⚠️ Hệ quả đã biết: người đọc tiếng Việt dán liên kết vào nhóm chat vẫn thấy thẻ chia sẻ
tiếng Anh. Muốn khác thì phải có URL riêng cho từng ngôn ngữ — kiến trúc đắt hơn nhiều.

### Phối hợp hai phiên

- 🔴 **`caddy-deploy.sh` ghi ĐÈ TOÀN BỘ tệp, không merge.** Hôm nay hai phiên cùng
  deploy Caddy; kết quả đúng nhưng **do may** — tôi không dựng lại được cơ chế.
  Đã đề nghị phiên chain: `git merge` nhánh kia **trước** khi scp.
- **Đổi route tĩnh thì Caddy phải đi TRƯỚC web** (`web-deploy.sh` tự kiểm liên kết qua
  tên miền công khai ở bước cuối).

---

## Lệnh hữu ích

```
cd C:\PROJECTS\9Chain-A1-web\web && pnpm typecheck && pnpm test && pnpm build
```

```
cd C:\PROJECTS\9Chain-A1-web && bash local-net/deploy/web-deploy.sh
```

```
cd C:\PROJECTS\9Chain-A1-web && node local-net/deploy/check-chain-id.mjs
```

Kiểm bản ĐANG PHỤC VỤ có đúng bản vừa dựng không (mỏ neo Đ1-11b):
```
curl -s https://a1.9chain.org/version.txt && cat C:\PROJECTS\9Chain-A1-web\web\out\version.txt
```

Deploy Caddy (chạy TRÊN server, không phải máy dev):
```
scp -i "$A1_SSH_KEY" local-net/deploy/Caddyfile "$A1_SSH_HOST":~/9chain-a1/Caddyfile.new && ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'bash ~/9chain-a1/caddy-deploy.sh'
```

Merge về `main` (**báo phiên chain trước**):
```
git -C C:\PROJECTS\9Chain-A1 merge web-home --no-edit
```

⚠️ Test hiện **139/140** — nay chỉ còn **MỘT** bài đỏ có chủ ý: **vân tay token**
(chờ 9Scan). Đừng "sửa" nó cho xanh.
✅ Bài *"còn thiếu N từ điển"* **đã xanh** và **đổi vai**: từ bộ đếm tiến độ thành
**cổng thật** — thêm ngôn ngữ vào `ngonNgu.ts` mà quên từ điển sẽ đỏ. Đừng gỡ nó.

---


Tệp này KHÔNG được commit (chỉ nằm ở bản làm việc này). Nó ghi luật chia việc
giữa hai phiên chạy song song trên cùng một repo.

## Hai bản làm việc

| Đường dẫn | Nhánh | Ai làm gì |
|---|---|---|
| `C:\PROJECTS\9Chain-A1`     | `main`     | code chain: `upstream/`, `local-net/`, `patches/`, `scripts/`, `explorer-full/` |
| `C:\PROJECTS\9Chain-A1-web` | `web-home` | **chỉ** `web/` — trang chủ + các trang tĩnh |

Cùng một `.git`, hai thư mục làm việc. Git KHÔNG cho hai worktree checkout cùng
một nhánh, nên `main` bị khoá ở bản gốc — đó là điều mong muốn.

## Luật cứng để hai phiên không giẫm nhau

1. **Phiên web chỉ sửa `web/`** — ⚠️ David đã mở phạm vi (D3, 2026-08-27) cho
   `local-net/deploy/` (Caddyfile, script deploy). Vẫn KHÔNG đụng `upstream/`,
   `patches/`.
2. **Phiên chain không sửa `web/`.** Nếu buộc phải, báo sang phiên web.
3. **Chỉ MỘT phiên được deploy.** `web-deploy.sh` xoá sạch thư mục đích rồi chép đè;
   `caddy-deploy.sh` ghi đè toàn bộ Caddyfile.
4. **Cổng dev 3901** (`pnpm dev`) chỉ một tiến trình giữ được. Bản này giữ nó.
   Xem bản dựng tĩnh: `node scripts/serve-out.mjs` (cổng 3902).

## Đã dựng sẵn và đã nghiệm thu tại worktree này

```
cd C:\PROJECTS\9Chain-A1-web\web
pnpm install --frozen-lockfile   # ✓ 148 gói
pnpm typecheck                   # ✓ sạch
pnpm test                        # 67/69 (2 đỏ có chủ ý — xem trên)
pnpm build                       # ✓ + postbuild: static-export, [?]-gate, axe 7 trang,
                                 #   budget 134.2/160 KB gz  (đo 2026-08-27)
```

## Gỡ worktree khi xong

```
git -C C:\PROJECTS\9Chain-A1 worktree remove C:\PROJECTS\9Chain-A1-web
git -C C:\PROJECTS\9Chain-A1 branch -d web-home
```
