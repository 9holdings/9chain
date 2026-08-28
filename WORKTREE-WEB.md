# Worktree `web-home` — chỉ làm website a1.9chain.org

---

## HANDOFF — cập nhật 2026-08-28 (đợt autopilot)

**TL;DR.** **Đa ngôn ngữ 30/30 XONG.** Thêm 5 mục nữa đóng trong đợt này, đều sinh ra
từ một lượt **đối chiếu site ↔ mạng g0** (đo mạng thật trước, rồi mới đọc mã).
Test **139/140** — nay chỉ còn **MỘT** bài đỏ có chủ ý (vân tay token, chờ 9Scan);
bài "còn thiếu từ điển" đã xanh.

🔴 **MỌI THỨ DƯỚI ĐÂY ĐÃ COMMIT NHƯNG CHƯA DEPLOY.** Trang công khai vẫn là bản cũ —
`/version.txt` vẫn 404 thật, dải cảnh báo vẫn chưa nói mốc `27/08`. Deploy cần David
gật và cần báo phiên chain (luật "chỉ MỘT phiên được deploy").

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
3. **Ba quyết định đang chặn:**
   - **Deploy hay chưa?** (mọi việc trên chưa lên mạng)
   - **C1** — deploy faucet để `/faucet/api/supply` sống, **hay** viết câu nguồn cung
     theo đường "tham số genesis"?
   - **A2** — cần **đo lại** thời gian đẻ chain trên g0 trước khi sửa câu "ba phút"
     (số mới nhất trong repo là **305,5s**, không phải 170s).

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

### Đa ngôn ngữ — 11/30

`en` (mặc định, trong bundle) · `zh hi es ar fr pt vi ru de ja` (chunk lười).
Còn **19**: `bn ur id mr te tr ta ko it th gu fa pl uk ms nl tl sw ha`.

- Bộ chọn ở header: **VI ở đúng vị trí 9** (David chốt), 3 RTL, ngôn ngữ chưa có từ
  điển **bị vô hiệu hoá** và ghi "chưa có" — không im lặng rơi về tiếng Anh.
- Chi phí cả bộ máy: **130,0 → 134,2 KB gz** (trần 160).
- ✅ **Đã đo bằng Chrome:** đổi ngôn ngữ lật cả cây; chunk `vi` (19,4 KB) tải ở
  `t=30342ms` tức **đúng lúc bấm**, mọi chunk khác ở `t=47ms` ⇒ nạp lười chạy thật.
- ✅ RTL đúng ngay lần đầu (`dir=rtl`, `text-align: start`) vì bộ component vốn dùng
  **thuộc tính logic** (`ms-`, `end-`, `text-start`). Giữ nếp đó.

### Mạng sinh lại thế hệ g0 (D-081, ngày 2026-08-27)

`networkID` **9001 → 999999999** · `networkName` → **`9chain-a1-g0`** ·
`eth_chainId` **KHÔNG đổi** (D-047 giữ `9000000009`) · block C-Chain `0x1` · danh bạ 0/0.

- Đã sửa `web/lib/chain.ts` và thêm cảnh báo "đã sinh lại 27/08" vào **11 từ điển**.
- **Cảnh báo 01/09 GIỮ NGUYÊN** — còn một lượt sinh lại nữa, câu đó vẫn đúng.
- Câu "tổng cung 9.000.000.000" **vẫn đúng**, đã kiểm: 7.900.000.001 (P/X) +
  1.099.999.999 (C-Chain).

---

## Việc tiếp — cụ thể, làm được ngay

### 1. Cày nốt 19 từ điển *(David đã chốt: làm hết)*

**Cách viết một từ điển** (khuôn đã chứng minh qua 10 bản):

```
web/lib/i18n/dicts/<ma>.ts   ← chép hình dạng từ en.ts, dịch từ EN (KHÔNG dịch từ vi.ts)
web/lib/i18n/index.tsx       ← thêm một dòng vào BO_NAP: <ma>: () => import('./dicts/<ma>'),
```

🔴 **Ba luật khi dịch:**
- Dịch **từ `en.ts`**, không từ `vi.ts` — dịch qua hai tầng là nhân đôi chỗ nghĩa trôi.
- **Không làm nhẹ** `reGenesis.*` · `deChain.soatMoTa` · `chainCuaToi.thuHoiY*`.
  Chúng nói "vĩnh viễn"/"không sửa được" để chặn người dùng mất tài sản.
- Mở đầu tệp bằng chú thích khai **máy dịch, chưa có người soát, nguồn là tiếng Anh**.

Sau mỗi lô: `pnpm typecheck && pnpm vitest run test/i18n-shape.test.ts`.

### 2. Đợt 1 còn tồn

- **Đ1-8** lưới an toàn mạng — hạn giờ GET, `r.ok`, `allSettled`.
  🔴 **KHÔNG** đặt `AbortSignal.timeout` cho `/api/create` và `/api/revoke` (CF cắt
  ~100s, thao tác ~170s).
- **Đ1-9** a11y ngoài tầm axe — bàn phím, `aria-live`, phóng 200%, `prefers-reduced-motion`.
- **Đ1-11b** mỏ neo phiên bản (`version.txt`), kiểm **TẤT CẢ** chunk lấy từ bản VỪA
  DỰNG, `pnpm test` trong script, `web-rollback.sh`.
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

### Kẹt `[blocked]`

- **Vân tay token đỏ có chủ ý** — 9Scan đổi `--font-display`→Manrope,
  `--font-sans`→Inter (**không token màu nào đổi**). Chờ họ xác nhận đã chốt / đã khai
  `next/font` với subset `vietnamese` / đã deploy. Đồng bộ bản còn dở tệ hơn để đỏ.
- **B1+B2 (cụm font)** — B1 không cần 9Scan gật, nhưng **B1 không được LÊN TRƯỚC B2**;
  ràng buộc là THỨ TỰ, không phải quyền quyết. B1 lên là phải chỉnh trần
  `check-budget.mjs` (134,2 + font ~144 KB **vượt** 160).

---

## Gotchas của phiên này

### Bảy cổng đang canh, và cái mỗi cổng KHÔNG bắt được

| Cổng | Bắt | Mù với |
|---|---|---|
| `check-routes.mjs` | trang mới thiếu route Caddy | nội dung |
| `check-chain-id.mjs` | hằng số mạng lệch mạng thật | câu chữ |
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
