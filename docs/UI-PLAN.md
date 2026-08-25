# Kế hoạch giao diện 9Chain-A1 — bản để phiên sau triển khai

Lập 2026-08-25 (phiên thứ tư). Backlog thi công nằm ở `PROGRESS.md` mục **M10**.
Đọc kèm: `HANDOFF.md` (ranh giới với 9Scan-A1), `DECISIONS.md` D-030/D-031.

---

## 1. Điểm xuất phát — đo, không đoán

Bốn trang HTML viết tay, tổng 963 dòng, không có bước build, không có hệ token.
Đếm thật trên chính các file:

| trang | `@media` | `prefers-color-scheme` | `:focus` | `aria-*`/`<label>` |
|---|---|---|---|---|
| `/chains/` | **0** | **0** | **0** | **0** |
| console | **0** | **0** | **0** | 4 |
| `/dashboard/` | **0** | **0** | **0** | 2 |
| `/explorer/` | **0** | **0** | **0** | **0** |

Đọc đúng bảng này: **không có một điểm ngắt responsive nào trong toàn bộ dự án** —
"chạy được trên điện thoại" hiện chỉ là nhờ luồng mặc định của trình duyệt, không phải
nhờ thiết kế. **Không có vòng focus ở đâu cả** ⇒ đi bằng bàn phím là đi trong bóng tối.
**Không có dark mode**, trong khi 9Scan-A1 — trang người dùng bấm sang ngay sau đó —
có dark mode đầy đủ. Hai bề mặt của cùng một sản phẩm lệch nhau ở thứ nhìn thấy đầu tiên.

Thêm hai chi tiết ảnh hưởng tới cách thi công:
- **Trang faucet không tồn tại dưới dạng file.** Nó là một template literal trong
  `local-net/faucet/server.mjs:54`. HTML nằm trong chuỗi JS thì không lint được, không
  format được, không tách được component.
- Console thì khá hơn: `server.mjs:723` đọc `local-net/console/index.html` từ đĩa.

---

## 2. Nền của kế hoạch: **KHÔNG thiết kế mới**

Phát hiện quan trọng nhất khi khảo sát: **9Chain đã có hệ thiết kế**, đang chạy thật
trong `C:\PROJECTS\9Scan-A1\app\globals.css`, tự nhận là *"nguồn sự thật duy nhất cho
màu/chữ/shape"* và dẫn nguồn từ một design handoff.

Nó không sơ sài — nó đã đi qua đúng những chỗ mà một hệ token tự chế hay chết:

- **Thương hiệu navy + gold**: `--color-navy #0d1733`, `--color-gold #ffcb24`, kèm
  thang phụ (hover, panel, tint, line) chứ không phải hai mã màu trơ.
- **Tương phản đã sửa cho đạt AA, và ghi rõ lý do sửa.** Ví dụ nguyên văn trong file:
  *design gốc dùng `#8A94AC` nhưng chỉ đạt 2.8:1 nên chữ nhãn cỡ nhỏ không đọc được* →
  đẩy thành `--color-muted #626c88` (≥4.8:1). Gold chia làm hai: `--color-gold-ink`
  **chỉ cho chữ lớn ≥24px bold**, `--color-gold-ink-strong` mới đạt AA cho chữ nhỏ.
- **Dark mode wire thật**, phạm vi có chủ đích: chỉ áp khi `html[data-theme='dark']`,
  **cố ý không dùng `@media (prefers-color-scheme: dark)` trần**, và có `ThemeToggle.tsx`.
- Font (`--font-display/sans/mono`), radius, shadow đều là token.

⇒ **Việc của A1 không phải nghĩ ra một giao diện. Việc của A1 là dọn 4 trang viết tay
về đúng hệ đã có.** Tự vẽ một hệ thứ hai là chủ động tạo ra sự thiếu nhất quán mà cả
kế hoạch này sinh ra để xoá.

**Cách dùng chung token giữa hai repo:** chép `globals.css` phần `@theme` sang A1
thành `web/app/tokens.css`, **có dòng ghi nguồn + hash bản gốc ở đầu file**, kèm một
bài kiểm nhỏ trong `pnpm test` so hash với bản 9Scan để phát hiện trôi lệch. Không
chia sẻ bằng package nội bộ — hai repo độc lập, một package chung sẽ kéo theo ràng
buộc phiên bản mà lợi ích không bù nổi. Bản chép + phép đo trôi lệch là đủ và trung thực.

---

## 3. Ranh giới với 9Scan-A1 — chốt trước khi vẽ

Luật đã có trong `HANDOFF.md`: *repo này lo **chain** (node, console, faucet, ví,
Caddy, deploy); explorer lo **giao diện + đọc dữ liệu**.* Áp luật đó:

| bề mặt | ai làm | ghi chú |
|---|---|---|
| Khối/giao dịch/validator/network/genesis/fees | **9Scan-A1** | đã có 11 route |
| **Danh bạ L1 `/chains/`** | **9Scan-A1** | 🔴 họ đang làm `app/chains/page.tsx` (M2 của họ). Trang `local-net/chains/index.html` của A1 sẽ **bị thay**, không nâng cấp |
| **Console đẻ/thu hồi chain** | **A1** | bề mặt GHI, là sản phẩm |
| **Faucet** | **A1** | bề mặt GHI (phát token) |
| **Trang chủ / onboarding** | **A1** | cửa vào, dẫn sang cả hai |
| `/dashboard/` A1-vs-C1 | **A1** | so sánh hai testnet, không phải dữ liệu một chain |
| `/lite/` | **A1** | gộp vào trang chủ, xem §5 |
| Ví X/P `:8090` | **A1**, và **KHÔNG làm UI công khai** | xem cảnh báo dưới |

🔴 **Ví X/P ở `:8090` KHÔNG được có giao diện công khai, trong mọi phương án.**
Nó giữ khoá trên server và **không có xác thực** — HANDOFF nói thẳng: public là mất
sạch ví đó. Nó là công cụ vận hành sau SSH tunnel. Nếu sau này cần, phải là một sản
phẩm khác có auth, không phải "mở trang cũ ra ngoài".

**Cần thống nhất liên dự án (không chặn):** khi 9Scan `/chains/` lên, ai giữ URL
`testnet-a1.9chain.org/chains/`, và A1 gỡ trang cũ lúc nào. Ghi vào `KICKOFF.md` của
9Scan theo đúng cách hai bên đã quy ước.

---

## 4. Quyết định kiến trúc: Next.js App Router, **xuất tĩnh**

**Chọn:** một app duy nhất `web/` trong repo A1 — Next.js 15 App Router · React 19 ·
Tailwind v4 · TypeScript · vitest · **bộ component tự viết** (`components/ui/`),
**không** shadcn/MUI/Radix/Ant. Tức đúng chuẩn của David **và** đúng thứ 9Scan-A1
đang chạy (Next 15.5 · React 19.1 · Tailwind 4.1 · vitest 2 · không component library).

**Điểm khác 9Scan: bật `output: 'export'`.** Lý do là ba ràng buộc thật của dự án này:

1. **Không thêm tiến trình chạy trên server.** Blockscout đã ngốn ~50% CPU — nhiều
   hơn cả 5 validator cộng lại (B-2). Xuất tĩnh cho ra HTML/CSS/JS thuần, Caddy phục
   vụ, **không tốn thêm một tiến trình nào**.
2. **Không mất đường deploy rẻ.** Hôm nay sửa trang là `scp` một file, có hiệu lực
   ngay nhờ bind-mount. Xuất tĩnh giữ nguyên tính chất đó (chép thư mục `out/`).
3. **Mọi trang hiện tại vốn đã render phía client.** Chúng fetch RPC/API rồi tự vẽ —
   không có gì cần server render. SSR ở đây sẽ là chi phí không đổi lấy gì.

Console thì thay `PAGE` (một chuỗi HTML) bằng việc phục vụ thư mục đã build — sửa nhỏ
trong `server.mjs`, giữ nguyên toàn bộ đường xác thực.

**Đánh đổi phải nói rõ:** đây là thêm một bước build vào một dự án đang có **zero
dependency ở tầng trang**. Đổi lại: hệ token, dark mode, i18n, bộ component, a11y test
— những thứ 4 file HTML viết tay sẽ không bao giờ có một cách nhất quán.
**Đường lui** nếu David muốn giữ zero-build: chép `tokens.css` + viết một bộ
component bằng web component thuần. Rẻ hơn nhiều, nhưng lệch chuẩn và lệch 9Scan.

---

## 5. Xương sống trải nghiệm — chỗ hiện đang thiếu hẳn

Hôm nay A1 không có **trang chủ**. Người lạ mở `testnet-a1.9chain.org` gặp thẳng
Blockscout — một trình xem block. Nó trả lời *"trên chain vừa xảy ra gì"*, nhưng câu
hỏi của người mới là *"đây là cái gì và tôi làm gì tiếp"*. Các trang còn lại là một
đống URL rời (`/faucet/`, `/chains/`, `/dashboard/`, `/lite/`) không có gì nối lại,
còn thứ đáng giá nhất — **nút đẻ chain** — thì nằm sau SSH tunnel, người ngoài không
biết là nó tồn tại.

Xương sống đề xuất bám theo hành trình người dùng, mỗi bước một câu hỏi:

| bước | câu hỏi của người dùng | màn |
|---|---|---|
| 1 | đây là cái gì? | **Trang chủ** |
| 2 | cho tôi thử ngay | **Thêm mạng vào ví** (1 cú bấm) → **Faucet** |
| 3 | cho tôi cái của riêng tôi | **Đẻ chain** (console) |
| 4 | chain của tôi ra sao? | **Chain của tôi** |
| 5 | cả mạng ra sao? | **9Scan-A1** (bàn giao sang) |

`/lite/` gộp vào trang chủ — nó tồn tại vì trang cũ nặng, mà một trang tĩnh có ngân
sách bundle thì không cần bản "nhẹ" riêng. Giữ URL cũ **redirect**, đừng xoá: nó có
thể đã nằm trong tài liệu/tin nhắn của ai đó.

---

## 6. Từng màn — mục tiêu, trạng thái bắt buộc, chỗ khó thật

Mỗi màn **bắt buộc** đủ *loading (skeleton) · empty có nghĩa · error có retry*, đúng
luật `ui-standard`. Dưới đây chỉ ghi phần **riêng của màn đó**.

### 6.1 Trang chủ — làm **2–3 biến thể để David chọn**
Nói được trong một màn: A1 là gì, khác C1 chỗ nào, và **ba lối vào** (thử ví · đẻ
chain · xem explorer). Có số liệu sống thật (chiều cao block, số validator, số L1) —
số thật làm nó "trông như sản phẩm đang chạy", đúng đích cảm giác của chuẩn.
⚠️ Số sống phải có trạng thái *đang tải* và *không lấy được*; một con số trống ở
trang chủ đọc như mạng chết.

### 6.2 Faucet
Kéo ra khỏi chuỗi JS trong `server.mjs` thành trang thật. Cần: nút **thêm mạng vào
MetaMask** (chainId phải dạng hex `0x218711a09` — số thập phân sẽ lỗi), ô địa chỉ có
**validate EIP-55 ngay khi gõ**, và **hạn mức còn lại hiển thị TRƯỚC khi bấm** thay vì
để người ta ăn lỗi 429. Trang hiện đã lấy đúng IP thật qua `CF-Connecting-IP`.

### 6.3 Đẻ chain — **màn quan trọng nhất, và khó nhất**

Ba sự thật của sản phẩm ép hình dạng màn này, không phải thẩm mỹ:

1. 🔴 **Một lượt đẻ mất ~170 giây.** Đây là **chủ ý** (restart 5 node lần lượt để
   mạng không mất quorum; đổi lại RPC công khai chỉ gián đoạn 0,5s thay vì 6,0s —
   D-008). Một vòng xoay 170 giây thì người dùng đọc là "hỏng rồi".
   ⇒ **Tiến trình theo BƯỚC**, không phải spinner: *tạo subnet → ghi genesis → node
   1..5 track lần lượt → chờ RPC trả lời*. Dữ liệu để vẽ đã có sẵn: `/api/create`
   trả về `restart` — nhật ký từng node. Cần thêm một endpoint đọc tiến trình đang
   chạy, hoặc stream; ghi vào backlog M10.
2. 🔴 **Genesis là BẤT BIẾN.** Sai một ký tự trong địa chỉ admin ⇒ chain **vĩnh viễn
   vô chủ**, không lỗi, không dấu hiệu. Nên form này là **cửa một chiều** và phải có
   **bước soát lại trước khi gửi** (tên · chainId · chủ sở hữu · kiểu chain · câu
   "không sửa lại được"). Có tiền lệ trong chính dự án: thu hồi bắt gõ lại tên chain.
3. **Đăng nhập bằng ví thì `admin` bị ÉP = địa chỉ đã ký** (M4.1). Đây là lớp bảo vệ
   mạnh nhất đã có ⇒ giao diện phải **hiện địa chỉ đó như một sự thật, không phải một
   ô nhập**. Ô nhập tay chỉ xuất hiện ở đường token vận hành.

Kèm theo:
- **Ô chọn kiểu chain**: danh sách **do server cấp** (`/api/state` → `presets`), không
  cắm cứng ở client. Mô tả hiện ngay dưới ô — genesis bất biến nên người dùng chỉ có
  đúng một lần đọc. 6 preset, trong đó `khong-phi` phải gọi đúng tên **"Phí gần như
  bằng 0"** (đã sửa một lần vì trang danh bạ hứa sai "Không phí gas").
- **Trần 16 L1 phải hiện TRƯỚC khi người ta bỏ công** (hiện `x/15`), không phải hiện
  lúc bị từ chối. Đây là trần cứng của giao thức, không nới được (D-009).
- **Kết quả sau khi đẻ**: thông số thêm vào MetaMask + `luuY` (bẫy ước lượng gas ở
  giao dịch đầu, D-030). `luuY` nên là **một việc bấm được** — nút *"Kích hoạt chain"*
  gửi một giao dịch chuyển tiền thường bằng ví đang kết nối (21.000 gas, hằng số,
  không cần ước lượng) — chứ không phải một đoạn văn cảnh báo.

### 6.4 Chain của tôi
Danh sách chain của **ví đang đăng nhập**, và với mỗi chain: sống/chết đo bằng **số
validator của subnet** (không phải chiều cao block — Avalanche không đẻ block rỗng),
thông số MetaMask, kiểu chain, và **thu hồi**.
🔴 Thu hồi phải nói rõ hai điều mà người dùng không đoán được: nó **không xoá** subnet
trên P-Chain, và **tên + chainId bị giữ chỗ vĩnh viễn** (cấp lại chainId là để ví của
người từng dùng chain cũ lặng lẽ trỏ vào chain người khác — D-014). Giữ luật gõ lại
tên để xác nhận.

### 6.5 Dashboard A1 ↔ C1
Giữ mục đích so sánh hai testnet. Tự chấm điểm thì phải **ghi rõ là tự chấm**.
Số C1 còn chờ URL Cosmos REST của C1 (H-5) ⇒ màn phải chịu được **một nửa dữ liệu
vắng mặt** mà không trông như hỏng.

---

## 7. Hệ dùng chung — làm một lần, mọi màn hưởng

- **Khung**: `SiteHeader` (điều hướng + chuyển ngôn ngữ + chuyển sáng/tối) ·
  `SiteFooter` · `NavDrawer` cho mobile. Đặt tên **trùng với 9Scan-A1** để hai repo
  đọc như một; người sang lại giữa hai bên không thấy đứt gãy.
- **Bộ component tự viết** `components/ui/`: `Button` · `Field` · `Card` · `Badge` ·
  `Table` · `Skeleton` · `EmptyState` · `ErrorState` · `Modal` · `Steps` (cho màn 170
  giây) · `AddressChip` (rút gọn + copy + EIP-55) · `Copyable` · `Toast`.
- **i18n tiếng Việt trước**, mọi chuỗi qua `vi.ts`, khoá mới đánh dấu để David duyệt
  giọng. Tiếng Anh làm sau — nhưng **tách chuỗi ngay từ đầu**, gom lại sau thì đắt gấp
  nhiều lần.
- **Dark mode**: dùng đúng cơ chế của 9Scan — `html[data-theme='dark']`, **không**
  `@media (prefers-color-scheme: dark)` trần. Lệch cơ chế là hai trang đá nhau khi
  người dùng đổi cài đặt.
- **A11y — làm chủ động, đây là chỗ đang bằng 0**: vòng focus thấy được ở mọi thứ bấm
  được, nhãn cho mọi nút biểu tượng, chữ lớn 1.25× không vỡ ở bề ngang 380px, AA cả
  hai chế độ. Có bài **axe-core** trong `pnpm test`, không chỉ soi bằng mắt.
- **Animation** tinh tế và **tôn trọng `prefers-reduced-motion`**.
- **Ngân sách bundle** như 9Scan (`check-bundle-budget.mjs`) — trang testnet phải mở
  được ở đường truyền yếu.

---

## 8. Thứ tự làm + điều kiện qua (đề xuất backlog M10)

| # | việc | điều kiện qua |
|---|---|---|
| M10.1 | Dựng `web/` + token + khung + bộ `ui/` + i18n + dark | `pnpm build` xuất tĩnh chạy được; **axe-core sạch**; token khớp hash bản 9Scan |
| M10.2 | Faucet (kéo khỏi chuỗi JS trong `server.mjs`) | xin token thật trên mạng công khai từ **điện thoại**, không chỉ desktop |
| M10.3 | Trang chủ, **2–3 biến thể**, backup bản cũ | David chọn một |
| M10.4 | Đẻ chain: form + **soát lại** + **tiến trình theo bước** | đẻ một chain thật, xem đủ 5 bước node chạy, không hiện spinner trơ |
| M10.5 | Chain của tôi + thu hồi | thu hồi thật một chain từ giao diện |
| M10.6 | Dashboard | chịu được C1 vắng mặt mà không trông như hỏng |
| M10.7 | Dọn: `/lite/` redirect, gỡ trang cũ khi 9Scan `/chains/` lên | không URL nào chết |

**Cách nghiệm thu, giống mọi mốc khác của dự án này: chạy thật rồi quan sát.** Test
xanh không đủ — "đã chép ≠ đang chạy" đã cắn ở đây nhiều lần. Mỗi màn phải mở trên
**trang công khai qua Cloudflare** (không phải `curl 127.0.0.1`: trang render bằng JS
nên `curl` chỉ thấy khung rỗng), ở **cả điện thoại lẫn desktop**, cả sáng lẫn tối.

---

## 9. Chờ David

| # | việc | ảnh hưởng |
|---|---|---|
| U-1 | Duyệt **thêm bước build** (Next + Tailwind) vào repo đang zero-dependency ở tầng trang | §4 — có đường lui zero-build nếu không duyệt |
| U-2 | **H-3/M4.5: có mở console ra công khai không** | Nếu không, §6.3 chỉ phục vụ người vận hành và trang chủ mất lối vào thứ ba — vẫn đáng làm, nhưng đổi thứ tự ưu tiên |
| U-3 | Chọn 1 trong 2–3 biến thể trang chủ (M10.3) | — |
| U-4 | Có design handoff gốc (file/Figma) mà `globals.css` dẫn nguồn không? | Có thì bám bản gốc; không thì `globals.css` **là** nguồn sự thật |
| U-5 | Thống nhất với 9Scan-A1 ai giữ URL `/chains/` | §3 — không chặn M10.1–M10.6 |
