# Worktree `web-home` — chỉ làm website a1.9chain.org

---

## HANDOFF — cập nhật 2026-08-27 (đợt 3)

**TL;DR.** Worktree này **đã kéo `main` về và chạy lại bộ nghiệm thu — xanh cả ba cổng**.
🔴 **Lệnh cấm sửa `web/` NAY ĐÃ HẾT HIỆU LỰC**: phiên chain làm xong 4 việc chạm `web/`
(và 3 việc nữa) trong đợt 12, đã lên công khai. Phiếu font + hai sắc vàng **đã gửi
9Scan-A1**, rồi **tự đính chính sau khi đo thật** (xem gotcha font). `web-home` = `main`
= **`b835b76`**, working tree sạch, **không còn gì để merge**. Site sống tại
https://a1.9chain.org.

⚠️ **Chưa deploy, và ĐÚNG như vậy** — từ `15f9076` tới đây chỉ có tài liệu, không một
byte nào của `web/out` đổi. Deploy lúc này là chạy một script xoá-rồi-chép mà không có
gì để chép khác đi.

### 🔴 Phiên sau bắt đầu từ đâu

Worktree **đang rảnh, và nay được sửa `web/` bình thường**. Nhưng trước khi làm gì:

1. `git -C C:\PROJECTS\9Chain-A1 log --oneline -5` — phiên chain commit liên tục,
   đừng tin bản chụp trong file này.
2. Đọc [`docs/NGAY-G-A1-CON-LAI.md`](docs/NGAY-G-A1-CON-LAI.md) — đó là **danh sách
   còn-lại thật** cho ngày G `01/09`, không phải `PLAN-REGENESIS-2026-09-01.md`.
3. Bản soát thương hiệu đầy đủ: [`docs/BRAND-AUDIT-2026-08-27.md`](docs/BRAND-AUDIT-2026-08-27.md)
   (157 tệp, 13 phát hiện) — phần web còn tồn nằm ở đó.

Còn tồn thuộc worktree này: **cụm B1+B2 (font)** và **25 chuỗi `[?]`**, cả hai chờ David.

### ✅ Phiên chain đã trả `web/` — 2026-08-27, đợt 12

Bốn việc bàn giao hồi đợt 2 đã xong, làm thẳng trên `main`:

| commit | |
|---|---|
| `28f795c` | bộ logo kit chuẩn vào header + chân trang (thay ký tự `◆`) — `BrandLockup.tsx` |
| `abeb71a` | og-image (PNG thật, sinh bằng `web/scripts/gen-og.mjs`) · manifest · sitemap · robots |
| `0262fb5` | một dòng 9-vs-18 chữ số ở trang faucet |
| — | `tokens.css:6` (`dong-bo-token.mjs` → `sync-tokens.mjs`) |

**Cả ba cái bẫy bàn giao kèm đều đã bị dẫm rồi vá — đọc lại chúng ở "Gotchas" bên dưới**,
vì cả ba đều là **lớp lỗi** chứ không phải sự cố lẻ.

### ✅ Nghiệm thu sau khi kéo `main` về (2026-08-27, đợt 3)

Fast-forward `78aea33` → `15f9076`, 25 commit, không xung đột. `package.json`/lockfile
**không đổi** ⇒ không cần `pnpm install` lại.

| Cổng | Kết quả |
|---|---|
| `pnpm typecheck` | ✓ sạch |
| `pnpm test` | ✓ **12/12** (token 3 · i18n 3 · eip55 6) |
| `pnpm build` | ✓ compile 2,8s · xuất tĩnh 9 trang |
| check-static-export | ✓ không biên `<Suspense>` treo · mọi đường edge đi bằng thẻ `<a>` |
| check-a11y | ✓ axe-core sạch **7 trang** (trước là 6 — `/re-genesis/` đã vào danh sách) |
| check-budget | ✓ nặng nhất `create-chain/` = **128,1 / 160 KB gz** |

⚠️ **Lượt này không sinh thay đổi nào** — nó chỉ chứng minh cây web còn xanh sau đợt 12.
Đợt 12 làm trang nặng thêm **2,1 KB** (126,0 → 128,1), còn cách trần 31,9 KB.

### 🔴 FONT — nay đã có NHÓM ĐỐI SÁNH, không còn là lập luận

Đo trên cùng một bản build:

| | `@font-face` khai | tải được | đường nạp |
|---|--:|--:|---|
| Sora · Instrument · JetBrains | 24 | **0** | qua `--font-*` ở `:root` |
| **Outfit** (font logo, nạp đợt 12) | 2 | **1 ✓** | **thẳng vào `style` phần tử** |

**Cơ chế:** `@theme` đổ `--font-sans: var(--font-instrument)` vào `:root` (`<html>`),
trong khi lớp `__variable_*` của `next/font` nằm ở `<body>`
([layout.tsx:99](web/app/layout.tsx:99) — khai ở dòng 26–28) ⇒ `var()` không giải được
⇒ *guaranteed-invalid*
⇒ rơi hết về font hệ thống. `--font-sans` đọc ra **chuỗi rỗng**.
🔴 Dấu phẩy trong `var(--font-instrument), ui-sans-serif…` **không phải fallback của
`var()`** — nó phân tách họ chữ. Đây là chỗ đọc xuôi tai nhất của cả vụ.

**Đối chứng sạch nhất** — đọc `:root`: `--color-navy` = `#0d1733` ✓ · `--color-gold` =
`#ffcb24` ✓ · `--font-*` = **rỗng** ✗. Cùng một khối `@theme`, cùng một `:root`. Màu là
giá trị thật nên sống; font là `var()` trỏ sang biến chỉ có ở `<body>` nên chết.
⇒ **Hệ token MÀU chạy, hệ token CHỮ chết câm.** ⚠️ Outfit sống **không** nghĩa là bẫy đã
hết — nó chỉ **né** được bẫy.

🔴 **B1 (vá nối biến) và B2 (đổi bộ chữ) BUỘC đi cùng một lượt.** Vá B1 một mình là làm
site **xấu đi**: hôm nay font thương hiệu không chạy nên lỗi thiếu tiếng Việt chưa hại ai;
bật lên trước khi chốt bộ chữ là đúng lúc đó dải `1ea0–1ef1` mới thật sự rơi về font hệ
thống. Phải chốt **cùng lượt với 9Scan-A1** ⇒ [human] David quyết.

⚠️ **Vá xong PHẢI chỉnh trần `check-budget.mjs`.** Dòng `[font ≤ 144.3 KB / 9 tệp]` hôm
nay là **trần trên, không chặn**, vì gần như không ai tải mấy tệp đó. Nối biến xong là
144,3 KB thành **thật**, và `128,1 + font` **vượt trần 160**.

### Đang chờ David [human]

- **Duyệt giọng 25 chuỗi mang `[?]`** trong `web/lib/i18n/vi.ts` — 20 chuỗi ĐANG CHẠY
  THẬT trên site.
- ~~Gật cho phiếu gửi sang repo 9Scan-A1~~ ✅ **ĐÃ GỬI 2026-08-27** (David bảo gửi):
  commit **`5ce359e`** bên họ + con trỏ đầu `HANDOFF.md` của họ. Bản sao bên mình:
  `docs/requests-from-9scan/2026-08-27-font-tieng-viet-BAO-CHO-9SCAN.md` (`6958665`).
  ⚠️ Repo họ lúc gửi đang có **39 tệp WIP chưa commit**; commit chỉ `git add` đúng 2
  đường dẫn nên không đụng vào. Nay **chờ họ chốt bộ chữ**, không chờ David nữa.
- **B1+B2** (font, ở trên) · **B-9** (đỏ Avalanche trong `patches/0003`) · **B-10** (tắt
  Managed robots.txt cho zone `9chain.org` trong dashboard Cloudflare). B-9 và B-10 xem
  `BLOCKERS.md`; cả hai **không sửa được từ worktree này**.

**David đã chốt (đừng mở lại):** giữ **`#F5C542`** của kit cho dấu logo, **không** hoà về
token `#ffcb24` ⇒ A1 có **hai sắc vàng cùng tồn tại, có chủ ý**
(`--color-brand-gold` vs `--color-gold`). Chú thích "đừng dọn dẹp bằng cách hoà chúng về
một" đã dán tại chỗ ở cả 3 nơi.

### Gotchas

**Về xanh giả — cùng một họ, ba lần dẫm:**

- 🔴 **Thang đo từ yếu tới mạnh: mã HTTP → content-type → nội dung → header tầng trước.**
  `cf-cache-status` phân biệt được AI đang trả lời: `DYNAMIC` = tới origin;
  **`MISS` + `max-age` ở đường mà origin CÓ tệp thật = Cloudflare tự sinh, không hỏi
  origin**. Mạnh hơn "đo bằng nội dung" vì nó không đòi biết trước nội dung đúng.
  Đây chính là cách bắt được `robots.txt`: có tệp, có route, đã deploy — **vẫn** trả bản
  của Cloudflare.
- 🔴 **Thêm trang vào `web/` thì PHẢI thêm route vào `@trangmoi`** (`Caddyfile`). Gốc `/`
  chỉ phục vụ **những trang có tên trong `@trangmoi`**; `/moi/*` mới phục vụ **toàn bộ**
  site tĩnh — hai chỗ đó **không** tương đương. Cái giá: `/re-genesis/` sinh ở `0d65eca`,
  **404 thật nhiều ngày** trong khi dải `ReGenesisBanner` trên **mọi** trang trỏ vào đó,
  mà mọi lượt deploy vẫn in `✓ 200` (bài kiểm thử alias rồi in ra đường dẫn gốc).
  ✅ Đã đóng: route đã thêm, bài kiểm đã vá (`78aea33`) — canonical là thứ được chấm,
  alias chỉ để chẩn đoán.
  🔴 **Bài học giữ lại: một cổng chỉ biết xanh thì không chứng minh được gì.** Cổng này
  đáng tin vì nó đã **ĐỎ** một lần, rồi xanh lại sau một lần sửa thật.
- 🔴 **`.webmanifest` → nginx mặc định trả `application/octet-stream`** (200, đủ byte,
  JSON hợp lệ, trình duyệt **vẫn từ chối**). Vá bằng `header … { defer }` trong Caddy —
  **`defer` bắt buộc**, không có nó thì `header` ghi trước `reverse_proxy` rồi bị nginx
  đè lại.

**Về thương hiệu / hiển thị:**

- 🔴 **Sora và Instrument Sans KHÔNG CÓ subset `vietnamese`** — `next/font` bác thẳng,
  không sửa được bằng config. `latin-ext` phủ 1e00–1e9f và 1ef2–1eff nhưng **hụt đúng
  1ea0–1ef1**. Đo bằng bảng dữ liệu của chính `next/font`, không đọc tài liệu:
  ```
  node -e "const d=require('next/dist/compiled/@next/font/dist/google/font-data.json');
           console.log(d['Sora'].subsets)"
  ```
  ✅ **`--font-mono` KHÔNG phải đổi họ chữ — JetBrains Mono ĐÃ CÓ `vietnamese`**, chỉ là
  đang không được yêu cầu. ⇒ B2 chỉ còn **2 họ chữ**, không phải 3. Ứng viên đã kiểm có
  `vietnamese`: Be Vietnam Pro · Inter · Manrope · Lexend · Source Sans 3 · Nunito Sans.
  ⚠️ **Outfit (font logo kit) cũng KHÔNG có `vietnamese`** — không sao vì chữ logo là
  "9Chain" toàn ASCII, nhưng **đừng dùng Outfit cho chữ chạy**.
- 🔴 **ĐÃ ĐO THẬT trên `a1.9scan.org` (Chrome, `lang="vi"`, 27/08) — số để trích:**
  font họ **chạy** (9/29 mặt chữ loaded, `--font-sans` giải được ở `:root`) · **14/14 ký
  tự riêng của tiếng Việt rơi khỏi Instrument Sans**, gồm cả `ă đ ơ ư` **NGOÀI** dải
  `1ea0–1ef1` (họ khai `subsets:['latin']`, hẹp hơn cả `latin-ext`) ⇒ **ghi "mọi ký tự
  riêng của tiếng Việt", ĐỪNG ghi "dải 1ea0–1ef1"** — hẹp hơn thực tế. Chuỗi ASCII khớp
  **tuyệt đối** bản chỉ-Instrument (`Overview` 68,94 = 68,94), chuỗi có dấu **không khớp
  bên nào** (`Tổng quan` 79,16 vs 78,03 vs 78,58) ⇒ vân tay của rơi font **từng ký tự**.
  ⚠️ **MỨC ĐỘ thì tôi đã NÓI QUÁ, đã tự sửa trong repo họ (`f98f024`):** ký tự rơi về
  `Instrument Sans Fallback` — font lui `next/font` tự sinh, **đã khớp thước** — chênh bề
  rộng chỉ **~0,7–1,4%**. Chụp màn hình không được nên **không** khẳng định mức xấu bằng mắt.
  🔴 **Chứng minh được CÓ RƠI FONT ≠ chứng minh được NGƯỜI DÙNG NHẬN RA.** Bản đầu viết
  như thể hai điều đó là một — đó là lỗi, không phải cách diễn đạt. Câu *"đang chịu lỗi
  hàng ngày"* **CHƯA ĐO, đừng trích lại**.
- 🔴 **CÂU "9Scan-A1 DÍNH Y HỆT" TRONG GHI CHÉP CŨ LÀ SAI — đã đính chính với họ.**
  Họ gắn lớp `__variable_*` ở **`<html>`** (`app/layout.tsx:168`) — **đúng**; A1 gắn ở
  **`<body>`** — **sai**. ⇒ **Lỗi nối biến là của RIÊNG A1.** Hệ quả ngược đời và đáng
  nhớ: **vì font của họ CHẠY, HỌ mới là bên đang chịu lỗi thiếu tiếng Việt hàng ngày**
  (`dicts/vi.ts` có 332 dòng mang dải đó), còn A1 đang được **che bởi chính bug của
  mình**. ⚠️ ⇒ Khi vá B1, **chép sơ đồ `<html>` của họ**, đừng nghĩ cách nào cũng được.
  🔴 Bài học: *"cả hai cùng dính"* là kết luận dễ chịu nên dễ trôi qua mà không ai đo.
  Nó khiến A1 im lặng nhiều ngày trong khi bên kia đang chảy máu.
- **Logo có `<text>` mà không nạp font là logo sai font, im lặng.** Kit khai
  `font-family="Outfit, Arial, sans-serif"`; Outfit không có trên máy đa số người dùng ⇒
  rơi về Arial, trông vẫn "ổn". `<img src="....svg">` **không** với tới được font của trang.
- **Tệp lockup trong kit KHÔNG phải logo trần** — nó là một *thẻ*: nền `#0D1733`, viền
  2px `#1C2A4D`, bo góc. Dán lên canvas navy thì viền nổi thành khung mờ. `.trim()` một
  mình không đủ (nó lấy màu tham chiếu từ pixel góc trên-trái, mà góc đó **trong suốt**)
  — phải `extract` cắt lề trước, rồi `trim` với nền khai tường minh.
- 🔴 **Bản tối lật `--color-gold-tint` thành nâu sẫm `#2b2410`** ⇒ `text-navy` là tối
  trên tối. Dùng `text-ink` (lật theo nền). Lớp lỗi chỉ lộ khi đổi theme.
- **`Times New Roman ×N` khi đo `getComputedStyle` thường là `HTML/HEAD/META/TITLE/STYLE`**
  — phần tử không hiển thị, kế thừa từ `<html>` chưa đặt font. **Không phải lỗi sản phẩm.**
  Lọc theo phần tử trong `<body>` trước khi kết luận.
- **`/console/` KHÔNG còn là một trang** — đo bằng curl: `308` → `/create-chain/`.
  Bề mặt duy nhất còn lạc hệ nhận diện từng là **`/chains/`**; đợt 12 đã áp token và
  **gỡ màu đỏ Avalanche `#e84142`** ở đó.

**Về đo đạc / mã nguồn:**

- 🔴 **Số chép sang thang khác phải kiểm lại TỶ LỆ, không chỉ kiểm THANG.** `PLAN` ghi
  "64 tỷ / 26 tỷ" ở thang 90 tỷ; chia 10 ra 6,4/2,6 trông rất hợp lý **và sai** — bảng đã
  đổi từ staking 30% sang 40%. Số đúng: 5,4 tỷ / 3,6 tỷ.
- **Không mức gzip nào của Node khớp CDN cho cả ba loại tệp** (JS khớp level 4, CSS giữa
  4–5, HTML còn tệ hơn level 1) ⇒ số cục bộ thấp hơn thật vài %. Đừng đuổi cho khớp từng
  byte; giữ level mặc định để so sánh được giữa các lượt build.
- Biến trần đổi tên: `A1_TRAN_JS_KB` → **`A1_TRAN_KB`** (bản cũ nay câm).
  `check-budget.mjs` đếm **HTML + CSS + JS không mang `noModule`**; 38,7 KB polyfills ra
  ngoài trần.
- `i18n.test.ts` **cấm chuỗi tiếng Việt thẳng trong JSX**; chuỗi mới phải mang `[?]`.
- Comment `//` **không hợp lệ** giữa các thuộc tính JSX.
- Deploy: **luôn kiểm `git -C ...\9Chain-A1 status` NGAY TRƯỚC khi merge**, đừng tin bản
  chụp cũ — phiên chain commit liên tục.

### Lệnh hữu ích

```
cd C:\PROJECTS\9Chain-A1-web\web && pnpm typecheck && pnpm test && pnpm build
cd C:\PROJECTS\9Chain-A1-web && bash local-net/deploy/web-deploy.sh
git -C C:\PROJECTS\9Chain-A1 merge web-home --no-edit
```

🔴 **Báo phiên chain TRƯỚC khi merge/deploy** — không có khoá nào chặn hai phiên đè nhau,
script xoá sạch thư mục đích rồi mới chép.

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

1. **Phiên web chỉ sửa `web/`.** Đụng `local-net/`, `patches/`, `upstream/` là
   sinh xung đột với phiên chain — nhánh này sẽ phải merge về `main`.
2. **Phiên chain không sửa `web/`.** Nếu buộc phải (ví dụ đổi endpoint trong
   `web/lib/chain.ts`), báo sang phiên web thay vì tự sửa ở `main`.
   ⚠️ **Luật này đã được MIỄN một lần có chủ ý** (đợt 12, David chốt): phiên chain
   làm cả 4 việc chạm `web/` thẳng trên `main`, và worktree này đứng im trong lúc đó.
   Miễn trừ đó **đã hết** — nay quay lại luật gốc.
3. **Chỉ MỘT phiên được deploy.** `local-net/deploy/web-deploy.sh` xoá sạch
   `~/9chain-a1/src/web/out` trên server rồi chép đè. Hai phiên cùng chạy là
   một bên bôi mất bản của bên kia mà không có cảnh báo nào.
4. **Cổng dev 3901** (`pnpm dev`) chỉ một tiến trình giữ được. Bản này giữ nó.

## Đã dựng sẵn và đã nghiệm thu tại worktree này

```
cd C:\PROJECTS\9Chain-A1-web\web
pnpm install --frozen-lockfile   # ✓ 148 gói, đã chạy
pnpm typecheck                   # ✓ sạch
pnpm test                        # ✓ 12/12
pnpm build                       # ✓ + postbuild: static-export, axe-core 7 trang,
                                 #   budget 128.1/160 KB gz  (đo lại 27/08 tại 15f9076)
```

`node_modules/`, `.next/`, `out/` là store RIÊNG của worktree này (đều nằm trong
`.gitignore`), không dùng chung với bản gốc.

## Nhập lại về `main`

```
cd C:\PROJECTS\9Chain-A1
git merge web-home
```

Chỉ merge khi `pnpm build` ở worktree này còn xanh — postbuild là cổng chặn thật
(a11y + trần dung lượng), đừng bỏ qua bằng `--no-verify` hay build tay.

## Gỡ worktree khi xong

```
git -C C:\PROJECTS\9Chain-A1 worktree remove C:\PROJECTS\9Chain-A1-web
git -C C:\PROJECTS\9Chain-A1 branch -d web-home
```
