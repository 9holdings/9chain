# SOÁT CHUẨN HOÁ THƯƠNG HIỆU — A1, `2026-08-27`

> **Câu hỏi được giao:** *nhìn từ bên ngoài, hoặc đọc code, có thấy đây là thứ được đầu tư
> tinh chỉnh không?*
>
> Soát toàn bộ **157 tệp theo dõi** trong repo. Mọi mục dưới đây đều **đo được** — có tệp,
> có dòng. Chỗ nào tôi kiểm ra sạch thì ghi là sạch, không gộp vào cho dài danh sách.

---

---

## ✅ TRẠNG THÁI THI HÀNH — `2026-08-27`, David duyệt làm 7 việc trước ngày G

**Cả 7 đã xong và đã lên mạng công khai.**

| # | Việc | Trạng thái |
|---|---|---|
| 1 | Logo vào `SiteHeader` + `SiteFooter` | ✅ **dùng bộ kit chuẩn của David**, xem ghi chú dưới |
| 2 | `og-image` + `manifest` + `robots.txt` + `sitemap.xml` | ✅ 3/4 chạy · 🔴 **robots bị Cloudflare che** |
| 3 | `LICENSE` + `NOTICE` | ✅ |
| 4 | Viết lại `README.md` | ✅ mọi liên kết đã đối chứng còn sống |
| 5 | 4 chú thích trỏ tệp chết | ✅ |
| 6 | Giải thích 9 vs 18 chữ số | ✅ `TOKENOMICS.md §0` + trang faucet |
| 7 | Áp token + tiêu đề cho `/chains/` | ✅ **kèm gỡ màu đỏ Avalanche** |

**Bộ logo chuẩn (David đưa `27/08`):** 14 tệp trong `web/public/brand/` — icon
gold/navy, lockup dark/light, stacked. Đối chiếu: `9chain-icon-gold.svg` **trùng từng
byte** với `icon-9chain.svg` của `9chain.org`, và `9chain-lockup-dark@2x.png` **chính là**
og-image của trang chính ⇒ kit và trang chính là một nguồn.

Yêu cầu của David — *"giữ nguyên màu sắc, kích thước, font logo, không chế lại; nền tuỳ
chỉnh sáng tối theo nền web"* — thi hành ở `web/components/BrandLockup.tsx`:
dấu `#F5C542` mọi nền · chữ `#FFFFFF` trên nền tối / `#0D1733` trên nền sáng (đúng hai
bản kit) · font **Outfit 700** · `viewBox 0 0 360 128`, `stroke-width 6.5`, `font-size 57`
giữ nguyên. Header luôn `bg-navy` ⇒ luôn bản tối; chân trang đổi theo `html[data-theme]`.

🔴 **Và lượt này đẻ ra ĐỐI CHỨNG QUYẾT ĐỊNH cho mục B.** Đo trên bản build thật:

| Họ chữ | `@font-face` khai | Tải được | Đường nạp |
|---|--:|--:|---|
| Sora | 6 | **0** | qua `--font-display` ở `:root` |
| Instrument Sans | 6 | **0** | qua `--font-sans` ở `:root` |
| JetBrains Mono | 12 | **0** | qua `--font-mono` ở `:root` |
| **Outfit** (logo) | 2 | **1** ✅ | **thẳng vào `style` của phần tử** |

**Cùng một trang, cùng `next/font`, cùng một lượt build.** Font đi qua biến CSS ở `:root`
thì chết; font đặt thẳng vào `style` thì sống. Đây không còn là suy luận về cơ chế CSS —
nó là phép đo có nhóm đối chứng, và nó chốt chẩn đoán B.
(`--font-sans` đọc ra **chuỗi rỗng** ở cả `:root` lẫn `<body>` — đúng dấu hiệu của
guaranteed-invalid.)

### 🔴 Việc còn lại của David — một dòng, ngoài tầm mã nguồn

`robots.txt` **đã có tệp, đã có route Caddy, đã deploy** — nhưng Cloudflare không cho nó
tới origin:

| | `cf-cache-status` | Nội dung trả về |
|---|---|---|
| `/sitemap.xml` | `DYNAMIC` → tới origin | sitemap thật của ta ✅ |
| `/robots.txt` | **`MISS` + `max-age=14400`** → Cloudflare tự sinh | *"As a condition of accessing this website…"* 🔴 |

Zone `9chain.org` đang bật **Managed robots.txt / Content Signals Policy**. Tắt nó trong
dashboard Cloudflare thì tệp của ta ăn ngay; không sửa được từ mã hay từ Caddy.

⚠️ Đây là **ca xanh giả sách giáo khoa**: `curl -o /dev/null -w '%{http_code}'` trả **200**
và `content-type` cũng đúng **text/plain**. Chỉ đọc **nội dung** mới thấy. Đã ghi cảnh báo
này vào chính `web/public/robots.txt` và vào Caddyfile.

---

## 0. Trả lời thẳng

**Đọc code: có, rõ ràng có đầu tư — trên mức trung bình khá xa.**
**Nhìn từ ngoài: chưa, và khoảng cách giữa hai vế đó chính là vấn đề.**

Nền móng đã tốt hơn vẻ ngoài của nó. Cái hỏng gần như toàn bộ nằm ở **lớp da**, và phần
lớn rẻ. Ba thứ dưới đây là ba thứ **duy nhất** người ngoài thật sự nhìn thấy — và cả ba
đều đang sai:

| | Người ngoài thấy gì | Thực tế bên dưới |
|---|---|---|
| 1 | Header trang chủ là một hình thoi `◆` | Bộ logo LOVE9 đầy đủ **đã có sẵn** trong repo, không được dùng |
| 2 | **Không một font thương hiệu nào chạy** — trang dùng font mặc định trình duyệt | 3 font khai đúng, tải đúng, nhưng một lỗi nối biến CSS giết cả hệ |
| 3 | `/chains/` trông như một dự án khác hẳn | Trang HTML tự viết, **0 token thương hiệu**, Times New Roman |

⇒ Sửa xong ba mục đó thì bề ngoài bắt kịp bên trong. Không mục nào cần đổi kiến trúc.

---

## 1. Chỗ ĐÃ đầu tư thật — đo được, và phải ghi cho công bằng

Không phải lời khen xã giao: đây là những thứ **hầu hết dự án không có**, và chúng là lý do
mục 0 nói "nền móng tốt hơn vẻ ngoài".

| Cái gì | Bằng chứng |
|---|---|
| **`web/` không cắm cứng một chuỗi thương hiệu nào** | grep `"…9Chain…"` / `"…LOVE9…"` trong `web/app` + `web/components` → **0 kết quả**. Tất cả đi qua `web/lib/i18n/vi.ts` |
| **Khuôn tiêu đề nhất quán tuyệt đối trong `web/`** | 5/5 trang dùng `` `${trang} — ${vi.chung.tenSanPham}` `` |
| **Hệ token chống trôi lệch BẰNG MÁY** | `web/app/tokens.css` 200 dòng chép từ 9Scan-A1, mang **vân tay `535cbf6329efb6d0`**, và `web/test/token.test.ts` so vân tay để bắt lệch. Rất hiếm dự án làm tới mức này |
| **Màu đã sửa cho đạt tương phản, có ghi lý do** | `--color-muted`: design gốc `#8A94AC` chỉ đạt 2.8:1 → đẩy tối tới `#626c88` ≥4.8:1, chú thích ngay tại chỗ |
| **Lớp identity node codify được, idempotent** | `scripts/rebrand.sh` — chỉ đổi *giá trị chuỗi*, không đổi định danh Go ⇒ merge upstream sạch |
| **Cổng nhất quán số học có đối chứng ngược** | `scripts/check-consistency.mjs --tu-kiem` |
| **Tên container/image nhất quán** | `9chain-a1-node-1…9`, `9chain-a1-caddy`, `9chain-a1/node:dev` |
| **Tiền tố env nhất quán** | `A1_*` — 16 `A1_TRUST_PROXY`, 8 `A1_TRACK_SUBNETS`, … |
| **Chú thích code mang theo PHÉP ĐO** | `chain.ts` giải thích vì sao `iconUrls` không ăn (đã đo, đừng thử lại) · `layout.tsx` giải thích dải Unicode nào bị hụt |

🔴 **Về CHUỖI thì lớp rebrand sạch:** mọi lần nhắc `Avalanche` / `AVAX` / `avalanchego`
trong mã (9 chỗ) đều là **khai báo engine có chủ ý** hoặc **cảnh báo an toàn**
(`FATAL: FAUCET_PK đang là khoá ewoq CÔNG KHAI của Avalanche`), không phải sót rebrand.
README còn khai rõ *không dùng nhãn hiệu "Avalanche" cho branding*.

⚠️ **Nhưng về MÀU thì không — xem mục M.** Câu *"lớp rebrand sạch"* ở bản đầu của tôi
đúng một nửa, và nửa còn lại là phát hiện nặng nhất về mặt pháp lý trong cả đợt.

---

## 2. 🔴 A — Logo chính thức không xuất hiện ở bất kỳ đâu người dùng nhìn thấy

**Rẻ nhất, lộ nhất, sửa được trong một buổi.**

Bộ logo David đưa nằm đủ trong `web/public/brand/`: SVG + PNG 24/32/48/64/128/256/512px.
Nó được dùng đúng **hai** chỗ:

| Dùng ở | Kết quả thật |
|---|---|
| favicon | ✅ ăn |
| `iconUrls` của `wallet_addEthereumChain` | ❌ **đã đo `26/08`: MetaMask không vẽ icon cho token GỐC** |

Còn header — thứ mọi người nhìn đầu tiên, ở mọi trang — dùng ký tự `◆` (U+25C6):

```tsx
// web/components/SiteHeader.tsx:66-74
<a href="/" className="flex items-center gap-2 font-display …">
  <span aria-hidden="true" className="text-gold">◆</span>   {/* ← đây */}
  9Chain
  <span className="rounded-chip …">A1</span>
</a>
```

`SiteFooter.tsx` cũng **không** có logo nào.

⇒ Nói cách khác: chỗ **duy nhất** logo hiển thị được là ô favicon 16px, còn chỗ ta
**thật sự kiểm soát nhận diện** — chính trang của mình — thì đang bỏ trống. Chú thích
trong `chain.ts` đã tự kết luận đúng điều đó (*"chỗ ta THẬT SỰ kiểm soát nhận diện là
trang của mình"*) nhưng việc thì chưa làm.

**Việc:** đặt logo vào `SiteHeader` + `SiteFooter`.
⚠️ Kèm một ràng buộc: `web/public/brand/` hiện chỉ có **một** biến thể — `love9-navy-inverse`
(dấu sáng trên nền navy). Header nền navy thì hợp; nhưng site **có `ThemeToggle`**, nên cần
xin David biến thể còn lại, hoặc chốt rằng header luôn navy ở cả hai theme.

---

## 3. 🔴 B — Không một font thương hiệu nào đang chạy trên trang công khai

> ⚠️ **Mục này đã được VIẾT LẠI sau khi phiên `9chain-a1-web-70` đo ngược bằng Chrome
> thật.** Bản đầu tôi ghi *"chữ lẫn font ngay giữa một từ"* — **sai ở kết luận**, vì tôi
> suy từ việc đọc `unicode-range` trong CSS đã xuất, không từ trang đã render. Đã kiểm
> độc lập lại bằng mã tĩnh và xác nhận bản dưới đây.

**Đây là phát hiện lớn nhất của cả bản soát.**

### Đo được

Phiên web đo bằng Chrome qua Cloudflare, `27/08`, trên 4 bề mặt:

| Trang | `document.fonts` | Đã tải | Request `.woff2` | `getComputedStyle` mọi phần tử |
|---|--:|--:|--:|---|
| `/` | 27 mặt chữ khai | **0** | **0** | đúng **một** họ chữ |
| `/faucet/` | 27 | **0** | **0** | nt |
| `/create-chain/` | 27 | **0** | **0** | nt |
| `/chains/` | **0** khai | — | — | Times New Roman |

⇒ **Sora, Instrument Sans và JetBrains Mono chưa từng hiển thị một lần nào.** Họ chữ duy
nhất đang chạy là stack mặc định của Tailwind.

### Nguyên nhân — lỗi nối biến CSS, không phải lỗi bộ chữ

```
tokens.css:13    @theme { … }          → Tailwind v4 phát biến ra :root  = <html>
tokens.css:77    --font-sans: var(--font-instrument), ui-sans-serif, system-ui, sans-serif
layout.tsx:63    <body className={`${sora.variable} ${instrument.variable} …`}>   ← biến ở <body>
globals.css:17   font-family: var(--font-sans)
```

🔴 **Cái bẫy nằm ở chỗ dễ đọc nhầm nhất:** dấu phẩy trong
`var(--font-instrument), ui-sans-serif, …` **không phải fallback của `var()`** — nó phân
tách các họ chữ trong danh sách `font-family`. `var()` ở đây có **đúng một tham số, không
có giá trị lui**.

⇒ Ở `:root`, `--font-instrument` **chưa tồn tại** ⇒ cả `--font-sans` thành
**guaranteed-invalid** ⇒ `font-family: var(--font-sans)` **invalid at computed-value time**
⇒ `font-family` là thuộc tính kế thừa ⇒ rơi về font mặc định trình duyệt.

### 🔴 Đối chứng sạch nhất — cùng một khối khai báo, màu sống, chữ chết

Phiên web đọc thẳng `:root` của `/create-chain/` trên trang đang chạy:

| Biến | Giá trị thật |
|---|---|
| `--color-navy` | `#0d1733` ✅ giải được |
| `--color-gold` | `#ffcb24` ✅ giải được |
| `--font-sans` | **(rỗng)** ❌ |
| `--font-display` | **(rỗng)** ❌ |
| `--font-mono` | **(rỗng)** ❌ |

**Cùng một khối `@theme`, cùng một `:root`.** Màu sống vì màu là **giá trị thật**; chữ chết
vì font là **`var()` trỏ sang một biến chỉ tồn tại ở `<body>`**.

⇒ Một câu cho David: ***hệ token MÀU chạy, hệ token CHỮ chết câm, cùng một khối khai báo.***

⚠️ **Và `tokens.css:116` đã cảnh báo NỬA cái bẫy này:** *"KHỐI NÀY PHẢI NẰM NGOÀI MỌI
`@layer`. `@theme` của Tailwind phát biến ra…"*. Người viết dòng đó **biết** `@theme` phát
ra `:root` — chỉ chưa nối tiếp sang vế *"vậy thì biến của `next/font` phải ở đâu"*.

### Vì sao nó là phát hiện lớn nhất

Ba font đồng bộ với 9Scan-A1 là **một trong những dấu hiệu đầu tư rõ nhất** của dự án —
và nó không tới được **một người dùng nào**. Hệ token **màu** chạy (màu là giá trị trực
tiếp), hệ token **chữ** chết câm.

🔴 **Và không một cổng nào bắt được:** `pnpm build` sạch · typecheck sạch · axe-core 3/3 ·
`pnpm test` 12/12 · `check-budget` xanh · `web-deploy.sh` 6/6 liên kết sống.
Cùng họ với bài học *"phép kiểm đo sai đại lượng"* — bộ đo xanh trong lúc thứ được đo đã chết.

### 🔴 B1 không được LÊN TRƯỚC B2 — ràng buộc là THỨ TỰ, không phải quyền quyết

> **ĐÍNH CHÍNH `2026-08-27`.** Mục này ban đầu viết *"hai việc BUỘC đi cùng một lượt"* và lý
> do chính là *"chuẩn chung sai, phải quyết bộ chữ chung với 9Scan-A1"*. **Lý do đó đã đổ** —
> xem đính chính (a) ngay dưới. Ràng buộc thứ tự thì vẫn nguyên.

| | Việc | Ghi chú |
|---|---|---|
| **B1** | Vá nối biến: đưa `.variable` lên `<html>` — **chép sơ đồ của 9Scan** | ~15′, **không cần ai gật** |
| **B2** | Đổi sang bộ chữ phủ **mọi ký tự riêng của tiếng Việt** | Cần David; **2 họ chữ**, không phải 3 |

**Vá B1 một mình là làm site XẤU ĐI.** Hôm nay font thương hiệu không chạy, nên lỗi thiếu
tiếng Việt **chưa gây thiệt hại nào**. Bật nó lên trước khi chốt bộ chữ là đúng lúc đó
`Sora` + `Instrument Sans` mới thật sự hiển thị — và **lúc đó** chữ có dấu mới thật sự rơi.

⚠️ **B1 kéo theo một lượt chỉnh trần `check-budget.mjs`**: trang nặng nhất 128,1 KB, cộng font
là vượt trần 160.

#### 🔴 Ba đính chính `27/08` — phiên web đo bằng Chrome trên site 9Scan

**(a) "9Scan-A1 dính y hệt" là SAI, và đó là lỗi của bản soát này.** Họ gắn `__variable_*` ở
**`<html>`** (`app/layout.tsx:168`) — **đúng**; A1 gắn ở `<body>` — **sai**. Đo: site họ
**9/29 mặt chữ loaded**, `--font-sans` ở `:root` giải ra `"Instrument Sans", …`; A1 **0/24**,
biến rỗng. ⇒ **Lỗi nối biến là của RIÊNG A1.** Bản soát suy từ *"cùng bộ chữ ⇒ cùng lỗi"* mà
không mở `layout.tsx` của họ — cùng họ với mọi lỗi khác trong tệp này: **kết luận từ tiền đề
chung thay vì đo tại chỗ.**

**(b) Phạm vi rộng hơn `1ea0–1ef1`.** Trên site 9Scan (nơi font chạy thật), **mọi ký tự riêng
của tiếng Việt** rơi khỏi Instrument Sans — 14/14 mẫu, **gồm cả `ă đ ơ ư` nằm NGOÀI dải đó**.
Chỉ `á à â é` (Latin-1) trụ lại. ⇒ Viết **"mọi ký tự riêng của tiếng Việt"**.

**(c) Chỉ 2 họ chữ phải thay.** **JetBrains Mono đã có `vietnamese`** — chỉ đang không được
yêu cầu ⇒ **một dòng config**. `Sora` và `Instrument Sans` thì đúng là chỉ có
`latin`/`latin-ext`. ⚠️ **Outfit (font logo kit) cũng không có `vietnamese`** — chữ logo toàn
ASCII nên không sao, nhưng **đừng dùng Outfit cho chữ chạy**.

⚠️ **Mức tin cậy — đừng trích mạnh hơn:** ký tự rơi về `Instrument Sans Fallback`, font lui do
next/font tự sinh **đã khớp thước**, nên chênh bề rộng chỉ ~0,7–1,4%. **Có rơi font: chắc
chắn.** **Người dùng có nhận ra: CHƯA ĐO** (không chụp được màn hình). ⇒ Việc phải làm không
đổi; **mức khẩn hạ xuống**: nợ chất lượng chữ, không phải sự cố đang chảy máu.

**Ứng viên đủ phủ:** `Be Vietnam Pro` · `Nunito Sans` · `Lexend`.
Vẫn nên đổi **cùng lượt với 9Scan-A1** rồi chạy lại `sync-tokens.mjs` — `tokens.css` mang vân
tay chống trôi lệch, đổi một bên là làm hai bề mặt của cùng một sản phẩm lệch nhau. Nhưng nay
đó là lý do **đồng bộ thương hiệu**, không còn là lý do **kỹ thuật bắt buộc**.

---

## 4. 🔴 C — `/chains/` nằm hoàn toàn ngoài hệ nhận diện

> ⚠️ **Đã thu hẹp so với bản đầu.** Tôi viết *"2 trong 7 trang công khai"* dựa vào danh sách
> trang trong `HANDOFF`. Phiên web đo lại bằng curl, tôi xác minh lại:
> `/console/` **đã là 308 → `/create-chain/`** — nó không còn là một trang nữa.
> Chỗ đó trong `HANDOFF` đã cũ. **Còn đúng một trang lạc hệ.**

| Bề mặt | Stack | Token | Font thật (đo trên trang render) |
|---|---|--:|---|
| `web/` — `/`, `/faucet/`, `/create-chain/`, `/my-chains/`, `/compare/` | Next 15 + Tailwind v4 + 200 token | màu: đầy đủ | 🔴 stack mặc định Tailwind — xem **B** |
| `local-net/chains/index.html` → **`/chains/` CÔNG KHAI** | HTML tự viết, 18 KB | **0** | Times New Roman ×6 · `system-ui` ×23 |
| `local-net/console/index.html` | ⚠️ **không còn phục vụ** — `/console/` 308 → `/create-chain/` | 0 | — |
| `local-net/explorer/`, `local-net/dashboard/` (đã `docker stop`) | HTML tự viết | 0 | — |

🔴 **`Times New Roman` ×6 phần tử trên `/chains/` không phải một lựa chọn — nó là
KHÔNG KHAI GÌ CẢ.** Gần như chắc chắn là `<h1>` và `<table>` không được đặt font, nên rơi
về mặc định trình duyệt. Trên trang danh bạ L1 công khai của một dự án blockchain.

⇒ Người đi từ `/` sang `/chains/` thấy phông chữ đổi, màu đổi, bố cục đổi.

⚠️ **Bốn tệp HTML tự viết vẫn nằm trong repo** dù ba trong số đó không còn phục vụ. Ai đọc
code sẽ thấy bốn bề mặt lạc hệ, không phải một — nên dọn hoặc ghi rõ "đã ngừng" cũng là
việc của mục này.

**Và tiêu đề tab khai bốn cái tên khác nhau:**

| Trang | `<title>` |
|---|---|
| `web/` (5 trang) | `{trang} — 9Chain Testnet A1` |
| console | `9Chain-A1 Console` |
| chains | `9Chain-A1 — Danh bạ L1` |
| explorer | `9Chain-A1 Explorer` |
| dashboard | `9Chain — Bảng điểm A1 vs C1` |

**Việc — hai đường, chọn theo ngân sách:**
- **Rẻ (nửa buổi):** nhét `tokens.css` + 3 font + khuôn tiêu đề vào 2 trang công khai còn
  lại. Không viết lại, chỉ thay lớp da. Đủ để không còn trông như dự án khác.
- **Đúng (đắt hơn):** đưa `/console/` và `/chains/` vào `web/`. Nhưng `/console/` gắn với
  SIWE + luồng đẻ chain — **không nên đụng trước ngày G**.

⇒ Khuyến nghị: làm đường rẻ bây giờ, đường đúng sau `01/09`.

---

## 5. 🔴 D — Có nguồn sự thật cho SỐ và cho MÀU, nhưng KHÔNG có cho TÊN

Đây là lỗ **kiến trúc**, và nó là nguyên nhân sinh ra mục C — nên sửa nó là chặn tái phát,
không phải dọn dẹp.

| Đại lượng | Nguồn sự thật | Cổng chặn |
|---|---|---|
| **Số** (tokenomics) | `scripts/check-consistency.mjs` | ✅ có, **kèm đối chứng ngược** |
| **Màu / khoảng cách / bo góc** | `web/app/tokens.css` + vân tay | ✅ có, `token.test.ts` |
| **Tên, nhãn, khuôn tiêu đề, mô tả** | 🔴 **không có** | 🔴 **không có** |

Hệ quả đo được: chuỗi `"9Chain Testnet A1"` cắm cứng **độc lập ở 8 tệp** —
`local-net/chains/index.html` · `local-net/console/index.html` ·
`local-net/explorer/index.html` · `local-net/faucet/server.mjs` · `local-net/up-all.sh` ·
`scripts/rebrand.sh` · `web/lib/chain.ts` · `web/lib/i18n/vi.ts`.

Đổi tên sản phẩm hôm nay = sửa tay 8 chỗ và **không có gì báo nếu bỏ sót một chỗ**.
Dự án này đã trả giá đúng kiểu lỗi đó rồi: đổi tên miền `26/08` phải rà **12 tệp nguồn** bằng tay.

🔴 **Và chuẩn đặt tên duy nhất đang bị chôn.** Nó nằm ở `HANDOFF.md:694-697` — **4 dòng, giữa
một tệp 1.399 dòng**:

```
## Chuẩn đặt tên (chốt 2026-08-24)
Mọi thứ dùng `9chain-a1`, bỏ hẳn "MetaChain/META".
Identity: client `9chaingo` · token LOVE9 · HRP `love9` · VM `love9evm` · networkID 9001 · EVM chainId 9000000009.
Env dùng tiền tố `A1_*`.
```

⚠️ Đây **đúng cùng một họ lỗi** với vụ 9Scan đọc nhầm bảng phân bổ ngày `26/08`: luật có
thật, nhưng nằm ở chỗ người đi tìm nó sẽ không mở. Bài học đã ghi lúc đó — *"lỗi ở cách bày
tệp bên mình"* — áp y nguyên vào đây.

**Việc:** tách ra `docs/BRAND.md` (một tệp, là nguồn sự thật cho tên/nhãn/khuôn tiêu đề/logo/
bộ chữ), và cho `check-consistency.mjs` thêm một mục canh: mọi bề mặt khai cùng một tên sản phẩm.

---

## 5b. 🔴🔴 M — TRANG CÔNG KHAI ĐANG TÔ ĐÚNG MÀU ĐỎ THƯƠNG HIỆU CỦA AVALANCHE

> **Phát hiện muộn, trong lúc thi hành việc 7.** Nó không có trong bản soát đầu vì tôi
> chỉ grep CHUỖI, không grep MÀU. Đây là chỗ đắt nhất về mặt pháp lý/nhận diện trong cả
> đợt, và nó **không phải việc dọn dẹp**.

`#e84142` là **đúng đỏ thương hiệu của Avalanche**. Đo trong repo:

| Tệp | Số lần | Dùng làm gì | Còn phục vụ? |
|---|--:|---|---|
| `local-net/chains/index.html` | 4 | dấu brand (gradient `#e84142→#ff8a3d`), nút chính, viền thẻ | 🟢 **CÔNG KHAI** → ✅ **đã sửa `27/08`** |
| `local-net/console/index.html` | 3 | nt | ⚫ 308 sang `/create-chain/` |
| `local-net/dashboard/index.html` | 4 | nt | ⚫ đã `docker stop` |
| `local-net/explorer/index.html` | 2 | nt | ⚫ đã `docker stop` |
| **`patches/0003-*.patch`** | — | 🔴 **đi vào công cụ chủ quyền** | 🔴 **còn sống trong cây fork** |

⇒ Một sovereign fork tự khai *"không dùng nhãn hiệu Avalanche cho branding"* mà **dấu
thương hiệu trên trang danh bạ L1 công khai là một gradient đỏ-cam Avalanche**, và nút
hành động chính cũng vậy.

**Đã sửa `/chains/`** (việc 7): dấu → logo 9Chain nguyên bản, nút chính → vàng thương hiệu
trên navy, thẻ "mạng chính" → vàng thay vì đỏ *(đỏ ở bảng đó đã mang nghĩa "chết", nên
dùng nó cho mạng chính còn sai thêm một tầng ngữ nghĩa)*.

🔴 **Ba tệp kia + patch thì CHƯA.** Ba tệp HTML không còn phục vụ nên không gấp — nhưng
`patches/0003` thì khác: nó là một trong 12 patch tái lập lớp chủ quyền, tức màu đó
**đi vào công cụ mà mọi lần dựng lại fork đều áp**. Đó không phải rác để dọn.

⚠️ **Và nó đúng khuôn của cả đợt hôm nay:** bộ đo xanh trong lúc thứ được đo đã sai.
`check-consistency.mjs` canh SỐ, `token.test.ts` canh MÀU CỦA HỆ TOKEN — **không cổng nào
canh màu nằm cứng trong HTML tự viết**.

---

## 6. 🔴 E — README là mặt tiền repo, và nó mô tả dự án của ba ngày trước

Ai đọc code lần đầu bắt đầu từ đây. Đo trên `README.md` hiện tại:

| Dòng | Khai | Thực tế |
|---|---|---|
| 11–42 mục **Cấu trúc** | **không có `web/`** | `web/` đang phục vụ **trang chủ công khai** |
| 35–36 | liệt kê `explorer/`, `dashboard/` như đang chạy | **cả hai đã `docker stop` từ `26/08`** |
| 9 | *"Testnet **local** (giai đoạn 1)"* | đã có testnet **công khai** `a1.9chain.org` từ nhiều ngày |
| toàn tệp | **0 liên kết** tới trang công khai / faucet / explorer | cả ba đều sống |
| 39, 139 | trỏ `docs/PROGRESS.md` = *"mốc & việc còn lại"* | tệp đó **đóng băng `24/08`**; bản sống là `PROGRESS.md` ở gốc |
| 26, 103 | *"L1 EVM chainId 9100"* | console **tự cấp** `9100++`; và dải đó đang là chỗ hở của §5c |

⇒ Một người kỹ thuật đọc README rồi mở repo sẽ thấy hai bức tranh khác nhau, và điều đó
**làm hỏng đúng ấn tượng mà công sức thật ở mục 1 đáng được nhận**.

**Việc:** viết lại README — đặt liên kết trang công khai lên đầu, cập nhật cây thư mục, sửa
vai `PROGRESS.md`, bỏ chữ "local".

---

## 7. Còn lại — rẻ, nhưng đúng chỗ người ta soi

### F. Thiếu `LICENSE` hoàn toàn 🔴
Dòng cuối README khai tuân thủ **BSD-3-Clause** (Ava Labs) và **LGPL** (go-ethereum trong
`graft/coreth`, `graft/subnet-evm`). Repo **không có một tệp `LICENSE` nào** — cũng không có
`.github/`, `CONTRIBUTING.md`, `SECURITY.md`.
Đang phân phối binary qua Docker image trên máy chủ công khai, nên đây không thuần hình thức.
**Rẻ, và là thứ đầu tiên người ngoài kiểm ở một fork.**

### G. Thiếu bề mặt chia sẻ
Không `og-image`, không `manifest.webmanifest`, không `robots.txt`.
⇒ Dán `a1.9chain.org` vào Telegram / X / Zalo ra **một ô trắng không ảnh, không mô tả**.
Với một dự án sắp mời cộng đồng vào ngày G, đây là chỗ rẻ nhất đổi lấy vẻ chỉn chu nhất.

### H. Bốn tài liệu vi phạm chính luật đặt tên của nhà
Luật chốt `26/08`: **tên tệp phải bằng tiếng Anh**. Vi phạm: `KHAC-CHU-NGAY-G.md` ·
`NGAY-G-A1-CON-LAI.md` · `RUI-RO-THANG-1E7.md` · `VI-VAN-HANH.md`.
⚠️ **Đừng đổi ngay:** `NGAY-G-A1-CON-LAI.md` là tệp `HANDOFF` trỏ vào đầu tiên và
`KHAC-CHU-NGAY-G.md` là runbook ngày G. Đổi tên hai tệp đó tuần này là chạm đường găng để
lấy một thứ không ai ngoài dự án nhìn thấy. **Hoãn tới sau `01/09`.**

### I. Bốn chú thích trỏ vào tệp không còn tồn tại (sót của đợt đổi tên `26/08`)

| Tệp | Trỏ vào | Tệp thật |
|---|---|---|
| `web/app/tokens.css:6` | `web/scripts/dong-bo-token.mjs` | `sync-tokens.mjs` |
| `local-net/deploy/Caddyfile:114` | `kiem-cong.sh` | `check-ports.sh` |
| `local-net/deploy/Caddyfile:484` | `web/lib/ket-noi-vi.ts` | `web/lib/wallet.ts` |
| `local-net/contracts/AssetBridge.sol:7` | chú thích đầu tệp vẫn ghi `CauTaiSan` | `contract AssetBridge` |

Riêng `tokens.css:6` **đắt hơn ba cái kia**: nó là dòng chỉ dẫn *"Dựng lại: node …"* — người
làm theo sẽ chạy một tệp không tồn tại, ngay trong tệp tự khai *"ĐỪNG SỬA TAY"*.
Bốn chỗ này rẻ tới mức không có lý do để tồn tại, và chúng là đúng loại chi tiết người đọc
code dùng để đoán mức cẩn thận của cả dự án.

### J. LOVE9 khai **9** chữ số ở tài liệu, **18** ở mọi bề mặt ví
- `docs/TOKENOMICS.md:116` — *"LOVE9 có 9 chữ số thập phân"*
- `web/lib/chain.ts:21`, `local-net/chains/index.html:147`,
  `explorer-full/9chain-a1-overrides.frontend.env:9` — `decimals: 18`

🔴 **Cả hai đều ĐÚNG** — P/X-Chain đếm nano (9 chữ số), C-Chain là EVM (18 chữ số). Nhưng
**không nơi nào giải thích điều đó**. Người ngoài đọc tokenomics rồi mở MetaMask sẽ kết luận
tài liệu sai — và họ không có cách nào tự biết là không.
Đây là **câu chữ, không phải mã**: thêm một dòng ở `TOKENOMICS.md` và một dòng ở trang faucet.

### K. Container Blockscout mang tên trần trên máy chủ dùng chung
`backend` · `db` · `frontend` · `stats` · `stats-db` · `proxy` · `redis-db` — không tiền tố,
trên **cùng máy chủ với 9Scan-A1**. Phần của mình thì nhất quán (`9chain-a1-*`).
HANDOFF đã ghi *"cổng là tài nguyên DÙNG CHUNG và không có bảng nào ghi ai giữ cổng nào"* —
**tên container y hệt vậy**, và đây vừa là thương hiệu vừa là rủi ro va chạm thật.
⚠️ Đổi tên container Blockscout là chạm stack công khai đang phục vụ ⇒ **không làm trước ngày G**.

### L. Tiền tố env: `FAUCET_*` nằm ngoài chuẩn `A1_*`
`FAUCET_PK` (8) · `FAUCET_ADDR` (4) · `FAUCET_RPC` (2), cộng `DOMAIN` / `RPC_HOST` trần trụi.
Chuẩn nhà nói `A1_*`. ⚠️ `FAUCET_PK` là khoá ví thật đang chạy — đổi tên biến là chạm
faucet công khai. **Rẻ nhưng không gấp; gộp vào lượt bảo trì sau ngày G.**

---

## 8. Đề xuất thứ tự — xét theo ngày G `01/09`

Nguyên tắc: **mọi thứ chạm mạng, console, faucet hay tên tệp đường găng đều hoãn sau `01/09`.**
Cái làm bây giờ phải là thứ chỉ chạm lớp trình bày.

### Làm trước ngày G — lộ ra ngoài, và không chạm đường găng

| # | Việc | Mục | Công |
|---|---|---|--:|
| 1 | Logo LOVE9 vào `SiteHeader` + `SiteFooter` | A | ~2h ⚠️ cần David chốt biến thể theme tối |
| 2 | `og-image` + `manifest.webmanifest` + `robots.txt` | G | ~2h |
| 3 | Thêm `LICENSE` (BSD-3-Clause + ghi chú LGPL) | F | ~30′ |
| 4 | Viết lại `README.md` | E | ~2h |
| 5 | Sửa 4 chú thích trỏ tệp chết | I | ~15′ |
| 6 | Một dòng giải thích 9 vs 18 chữ số | J | ~15′ |
| 7 | Áp `tokens.css` + khuôn tiêu đề cho **`/chains/`** — **màu và tiêu đề thôi, CHƯA font** | C | ~2h |

🔴 **Mục 7 đã hạ phạm vi HAI LẦN so với bản đầu:**
1. `/console/` **rụng khỏi phạm vi** — nó đã là 308 sang `/create-chain/`, không còn là trang.
2. **Chưa đụng font.** Chép sơ đồ nối biến hiện tại sang `/chains/` là **chép luôn cái lỗi ở B**.
   Phần font của trang đó phải chờ B1+B2 xong.

### Cần David quyết trước khi làm được

| # | Việc | Vì sao không tự quyết |
|---|---|---|
| **8** 🔴 | **B1 vá nối biến + B2 đổi bộ chữ — MỘT LƯỢT** | B1 rẻ (~15′) nhưng **không được chạy một mình**: bật font lên trước khi chốt bộ chữ là làm site xấu đi. B2 là quyết định thương hiệu **hai dự án** |
| 9 | Biến thể logo cho nền sáng | Chỉ có `navy-inverse`; site có `ThemeToggle` |

### Hoãn tới sau `01/09` — đúng nhưng chạm đường găng

| # | Việc | Vì sao hoãn |
|---|---|---|
| 10 | `docs/BRAND.md` + cổng canh tên trong `check-consistency.mjs` | Đúng cách chặn tái phát, nhưng không lộ ra ngoài tuần này |
| 11 | Đổi tên 4 tài liệu sang tiếng Anh | `NGAY-G-*` và `KHAC-CHU-*` là runbook ngày G |
| 12 | Đưa `/console/`, `/chains/` vào `web/` | Console gắn SIWE + luồng đẻ chain |
| 13 | Tiền tố `A1_*` cho `FAUCET_*` | Chạm faucet công khai |
| 14 | Đặt tiền tố cho container Blockscout | Chạm stack công khai đang phục vụ |

---

## 9. Một câu tóm

Dự án này **đã** có những thứ chứng minh đầu tư mà người ngoài không nhìn thấy — vân tay
chống trôi lệch token, cổng số học có đối chứng ngược, chú thích mang theo phép đo,
lớp rebrand idempotent. Cái thiếu là **lớp da**: logo không lên trang, hệ chữ thương hiệu
không chạy một dòng nào, hai trang công khai lạc hệ, README kể chuyện cũ, không có tệp giấy phép.

Bảy việc đầu bảng ở §8 cộng lại **dưới hai ngày công**, không việc nào chạm mạng — và chúng
đóng gần hết khoảng cách giữa "bên trong tốt" và "bên ngoài trông thường".

🔴 **Nhưng mục B là thứ đáng nhớ hơn cả danh sách việc.** Ba font thương hiệu được khai
đúng, ghi chú kỹ, đồng bộ với dự án anh em, có test chống trôi lệch — **và không tới được
một người dùng nào**, trong khi sáu cổng nghiệm thu đều xanh. Bản soát này bắt được nó
**không phải nhờ đọc code cẩn thận hơn** — chính tôi đọc rồi vẫn kết luận sai — mà nhờ
phiên web **mở trình duyệt thật ra đo**. Đó đúng là luật đối chứng ngược của nhà: *"làm sao
tôi biết mày vừa chạy?"*
