# Web A1 trước tầm nhìn 9 tỷ chain — phân tích để phát triển tiếp

Viết `2026-09-05` trong worktree `web-home`, theo yêu cầu của David: *"phân tích để phát triển tiếp cho tầm nhìn
9 tỷ chain."* Đứng trên `docs/MASTER-9CHAIN-9-YEARS.md` (bản thắng về kế hoạch) và các bản nguồn của nó; hiện trạng
site chỉ dùng để định cỡ. Mọi con số về site và mạng **đo cùng ngày** (bản dựng `5cf5698`, site sống, RPC công khai).
Mỗi khẳng định gắn một nhãn theo luật David chốt `04/09`: **[lõi]** giới hạn của `avalanchego 1.14.2` ·
**[phải xây]** chưa có ở đâu · **[vận hành]** hiện trạng testnet, không phải trần của tầm nhìn.

---

## 0. Câu trả lời ngắn — bảy điều

1. **Site hôm nay là bề mặt của bậc 0 và bậc 2** (mạng gốc + chain cộng đồng qua console). Tầm nhìn 9 tỷ sống ở
   **bậc 3 — sổ cá nhân**, và site chưa có một pixel nào của bậc đó. MASTER §2 đã nói thẳng: *"0 sổ cá nhân, 0 agent."*
2. **Trục sản phẩm của site đang là thứ MASTER §9 xếp vào "không làm như sản phẩm chính"**: nút chính trang chủ là
   *"Launch your chain"*, ba trang xoay quanh faucet LOVE9 và 15 chỗ vĩnh viễn. Đúng cho testnet 2026; sai nếu giữ
   nguyên qua 2027.
3. **Khoảng cách không nằm ở tối ưu bundle.** Bản soát sáng nay: 154,4/160 KB, cổng xanh, mã sạch. Phần dự án chỉ
   ~22 KB trong 123,5 KB nền. Tối ưu thêm ở đây mua được ít; đổi trục mua được nhiều.
4. **Bốn thứ trong mã sẽ vỡ trước khi tới 10⁴ chain** (mốc 2028): một tệp danh bạ tải cả, quét RPC từ trình duyệt,
   trần cứng `L1_SLOTS = 15`, và một URL cho 30 ngôn ngữ nhân với số chain. Con số ở §3.
5. **Tài sản sống sót sang tầm nhìn nhiều hơn tưởng**: 30 ngôn ngữ, kỷ luật "site không nói điều mạng không chứng
   minh", `directoryModel` không React, dịch theo mã, prerender có sàn, trang validator trung thực, trang nghi lễ.
   Chúng là hạ tầng của *"chuẩn, không thương hiệu"*.
6. **Chỗ web chạm dòng A sớm nhất mà không chờ ai**: **P-60**. API quản trị đã có (`/api/governance`, precompile đo
   trên chain). Bảy precompile chính là các điều khoản hiến pháp — đặt tên trang theo nghĩa hiến pháp (*"AI nào được
   ký · ai đổi luật · ai in tiền"*), không theo tên precompile, là bước đầu của "bảng điều khiển agent".
7. **App sổ cá nhân không nên là một trang trong site này.** Site = site của gốc (tài liệu, validator, danh bạ, nghi
   lễ, trạng thái). Sổ = app một màn, passkey, không gas, tên thay địa chỉ — một khuôn khác, một kho mã khác.

---

## 1. Site nói gì · tầm nhìn cần gì

| Bề mặt hôm nay (đo `05/09`) | Tầm nhìn (MASTER / VISION §5) | Nhãn | Lệch |
|---|---|---|---|
| Nút chính: *"Launch your chain"*; 11 trong 15 chỗ đã dùng, 4 còn lại hiện công khai | Sản phẩm = sổ cá nhân + hiến pháp agent; "bán L1 rẻ" không phải sản phẩm chính | vận hành | **Trục** |
| Người dùng = ví MetaMask, địa chỉ `0x…`, faucet LOVE9, gas | Passkey, tên `lan.9s-union.love9`, không thấy gas, một app | phải xây | **Trục** |
| Ô tổng kết: L1 đang chạy · validator · chỗ còn lại | Thước đo: sổ hoạt động hàng tuần × hành động bị hiến pháp chặn đúng — *"số chain, validator, token: không"* | — | **Thước đo** |
| Mọi khoá là số: `chainId`, `#type=`, `?chain=` | Tên đệ quy, chainId cục bộ trong mạng vùng, không có sổ toàn cục cho 10¹⁰ | lõi (dải chainId ~10⁹) | **Danh tính** |
| 30 ngôn ngữ, VI ở vị trí 9, 29 bản máy dịch có khai | Bất biến 8 (mã mở, tiếng Anh, đặc tả trước mã) · *"tiếng Việt trước, người dịch"* | — | Khớp |
| `/validators/` nói thật giá và không trả gì; `/ceremony/` đếm tới Block Adam `09/09` | 2027 "người đầu tiên"; ngày 0 của chín năm | — | Khớp |
| Cổng: prerender có sàn, `check-slots` đo danh bạ sống, `check-decentralisation-claim` | Bất biến 5: kiểm bằng bằng chứng, không chạy lại | — | Khớp, cần nâng |

Ba lệch đầu là **quyết định**, không phải lỗi. Site được xây đúng cho câu hỏi của 2026 (*"testnet này có thật
không, tôi thử được không"*). Câu hỏi của 2027 khác: *"sổ của tôi ở đâu, AI của tôi được phép gì."*

---

## 2. Tài sản sống sót — giữ và nâng

| Tài sản | Vì sao sống sót | Nâng thành |
|---|---|---|
| Hệ i18n 30 ngôn ngữ, từ điển tải động, dịch theo **mã** (`serverText.ts`) | Chuẩn muốn phổ cập 9 tỷ người thì ngôn ngữ là kênh phân phối rẻ nhất | Tách gói từ điển dùng chung cho app sổ; D-3 mức 2 (URL theo ngôn ngữ) |
| `directoryModel.ts` không React, 24 ca test; phán quyết `0 validator ≠ đang tải`, `WRONG CHAIN` | Cùng bài toán ở bậc 2: sổ sống / ngủ đông / sai chain | Thêm trạng thái ngủ đông (bất biến 6) khi console ghi |
| Ảnh chụp danh bạ + `check-prerender` có sàn theo trang | Mẫu "HTML có nội dung thật" cho mọi trang dữ liệu | Ảnh chụp **một trang + tổng số**, đúng lời dặn trong `gen-directory-snapshot.mjs` |
| Kỷ luật cổng: đỏ vì đúng lý do, đo mạng trước đọc mã | Bất biến 5 và 8 | Cổng `check-copy-truth` (số trong chữ khớp phép đo cùng ngày) — chưa có |
| Xuất tĩnh + Caddy, không tiến trình server | *"Mạng gốc nhỏ và nhàm chán"* — site của gốc cũng phải vậy | Giữ cho site gốc; **không** dùng cho app sổ |
| `/validators/`, `/ceremony/`, `/re-genesis/` | Lời mời trung thực + ngày 0 + trí nhớ | `/nine-years/` (B-3): tuyên ngôn chưa có mặt trên site của chính nó |
| Hợp đồng API console (P-62 preview, P-60 governance, upgrade) | Precompile = điều khoản hiến pháp | §4 |

---

## 3. Cái không chịu quy mô — con số và ngưỡng vỡ

Mốc MASTER: 10² sổ (2027) · 10⁴ (2028) · 10⁵ (2029). Bậc 2 (chain cộng đồng) là thứ site này liệt kê; bậc 3 không.

| Điểm | Đo hôm nay | Ngưỡng vỡ | Đường ra | Nhãn |
|---|---|---|---|---|
| **Một tệp danh bạ tải cả** — `lib/directory.ts` đọc trọn `console-chains.json`, `no-cache`, `DYNAMIC` | 11 chain · **6.473 B · 588 B/record** · 1,7 KB gz | 10³ ⇒ ~590 KB (≈160 KB gz, bằng cả ngân sách một trang) mỗi lượt mở trang chủ; 10⁴ ⇒ ~5,9 MB | Chỉ mục phía server (console hoặc 9Scan): trang, tìm, lọc trả JSON; web chỉ giữ ảnh chụp một trang | phải xây |
| **Quét RPC từ trình duyệt** — pool 4, nghỉ 30 s, batch 2 lời gọi | ~1 s/chain qua Cloudflare | 10³ chain ≈ **4 phút/lượt/tab**; 10⁴ = không quét nổi | Trạng thái đo ở một nơi (console hoặc 9Scan xuất `verdict`), trình duyệt chỉ đọc | phải xây |
| **Ảnh chụp trong bundle** | 3.254 B · trần 24 KB (~80 record rút gọn) | ~80 chain | Ảnh chụp trang đầu + tổng số thật (đã ghi trong script) | vận hành |
| **Trần cứng `L1_SLOTS = 15`** (`lib/chain.ts:73`, `check-slots.mjs`) | đúng khi mọi node track mọi L1 | Ngày console chia validator (PLAN-108 §4.1) trần = `⌊N×15 / V⌋`, không còn là hằng | Đọc trần từ `/api/status.tran` ở mọi chỗ; hằng số chỉ để prerender, có cổng so lệch | lõi 16 subnet/node + phải xây |
| **Một URL, 30 ngôn ngữ, mỗi chain một trang** | 11 route × 1 HTML | Trang chi tiết (C-3) cho 10⁴ chain × 30 ngôn ngữ = 3×10⁵ tệp tĩnh | Trang chi tiết render client từ API + JSON-LD; xuất tĩnh chỉ cho trang gốc | vận hành |
| **Nền 123,5 KB gz mọi trang** (React 53 · Next 45,6 · dự án ~22) | 154,4/160 KB trang nặng nhất | App sổ trên điện thoại yếu mở đầu đã 125 KB; người 60 tuổi không chờ | App sổ dùng khuôn khác (PWA nhẹ hoặc app gốc), không thừa kế stack site | vận hành |
| **Danh tính bằng số** | `chainId` khắp nơi, `symbolOf()` suy từ tên | Tên đệ quy chưa có chỗ ghi trong `console-chains.json` | Thêm khoá `path`/`parent` tuỳ chọn ngay (hợp đồng dữ liệu đã mở về phía trước) | phải xây |

Điều đáng nói: **không mục nào trong bảng là lỗi của mã hôm nay.** Mọi thứ đều đúng cho 15 chain và đúng cho 108.
Chúng vỡ ở bậc mà chỉ tầm nhìn mới đòi tới, và đường ra của mọi mục đều là **dời phép đo ra khỏi trình duyệt**.

---

## 4. Đổi trục: web chạm dòng A ở đâu sớm nhất

MASTER chốt *A trước B khi phải chọn*. Dòng A đối với web không phải "viết app sổ ngay" (đó là mùa 2027, cần genesis
sổ và máy chủ sổ chưa có). Ba việc web làm được **ngay, bằng API đang có**:

1. **P-60 thành "bảng hiến pháp".** `/api/governance?name=` trả vai trò + precompile đo trên chain. Trang hiện bảy
   điều khoản bằng lời người dùng, không bằng tên precompile:
   `txallowlist` → *"AI nào được ký thay bạn"* · `deployerallowlist` → *"ai được đổi luật"* · `nativeminter` → *"ai
   in tiền"* · `feemanager` → *"phí bao nhiêu"* · `warp` → *"chain nói được với ai"*. Nút gọi qua MetaMask (mục 5.2
   hợp đồng API). Đây là bản sơ khai của *"bảng điều khiển agent"* trong VISION §5, dựng trên chain cộng đồng trước
   khi có sổ cá nhân. **Điều kiện qua:** một chủ chain thu hồi quyền ký của một khoá và thấy giao dịch từ khoá đó bị
   từ chối — *"hiến pháp chặn đúng một lần"*, đo được hôm nay.
2. **P-62 trước khi mở cửa lại.** Chỗ vĩnh viễn còn 4; mọi lượt tạo thiếu màn xem trước là một vết bẩn không xoá.
   Câu ký đặt dưới `cannot`, đúng hợp đồng API §3.1.
3. **Đổi lời mời trang chủ.** Giữ *"Launch a chain"* cho người xây chain cộng đồng, nhưng lời mời đầu tiên phải là
   câu của xương sống: *"AI của bạn phải xin phép, và có một nơi ghi lại nó đã xin — nơi đó là của bạn."* Kèm
   `/nine-years/` mang tuyên ngôn. Chưa có sổ thì **không hứa sổ**; nói rõ *"đang xây, đây là bậc 2 để bậc 3 có chỗ
   neo"*. Rủi ro số 1 năm 2027 là *"không ai cần"* — site là nơi rẻ nhất để nghe câu trả lời sớm, qua kênh công khai
   đã có (issue tracker), **không thêm kho dữ liệu người dùng** (bất biến 7).

---

## 5. Lộ trình web theo mùa — điều kiện qua và ca đỏ

| Mùa | Việc | Điều kiện qua | Ca đỏ phải thấy |
|---|---|---|---|
| **0 · nay → cuối 2026** | `/docs/` (đang) · P-62 · `/nine-years/` · D-3 mức 1 (`hreflang`) · đổi lời mời trang chủ · JSON-LD | 4 chỗ còn lại không mất chỗ nào vì thiếu xem trước; tuyên ngôn có URL | Bỏ màn xem trước ⇒ cổng chặn deploy |
| **1 · Q1–Q2 2027** | P-60 "bảng hiến pháp" · C-3 trang chi tiết render từ API · bỏ hằng `L1_SLOTS`, đọc `tran` · khoá `path` trong danh bạ | Một chủ chain thu hồi quyền một khoá, giao dịch bị từ chối, trang hiện đúng | Trả về hằng 15 khi API nói khác ⇒ đỏ |
| **2 · H2 2027** | Chỉ mục danh bạ phía server (cùng console/9Scan) · quét RPC rời trình duyệt · ảnh chụp một trang + tổng | Trang chủ ở 10³ chain giả tải < 200 KB, không quét | Fixture 10³ chain ⇒ cổng ngân sách và cổng "không quét ở client" đỏ |
| **3 · 2028** | Tách app sổ (khuôn riêng) · site gốc đổi ô tổng kết sang thước đo MASTER §6 khi máy chủ sổ xuất số | Ô "sổ hoạt động hàng tuần" đọc từ nguồn thật, gạch ngang khi chưa đo | In số khi nguồn vắng ⇒ đỏ (luật ảnh chụp không mang trạng thái) |

Thứ tự trong mỗi mùa theo giá: rẻ và không chờ ai trước. Mùa 2 phụ thuộc console chia validator (PLAN-108 §4) —
đó là mốc của `main`, không của `web-home`.

---

## 6. Web không làm

| Không làm | Vì sao |
|---|---|
| Dựng app sổ cá nhân bên trong site Next tĩnh này | Nền 123 KB, ví MetaMask, xuất tĩnh — ba thứ VISION §5 nói phải biến mất |
| Thêm kho dữ liệu người dùng (form, email, analytics ngoài CF RUM đã chốt) | Bất biến 7; luật 91/2025 |
| "Chợ chain", xếp hạng theo số chain/validator | Thước đo sai (MASTER §6); cổ vũ đẻ chain rác vào sổ chỉ phình |
| Hứa "tạo sổ một chạm" trước khi có máy chủ sổ | Câu chữ trôi khỏi mạng — lớp lỗi đã trả giá 4 lần |
| Tối ưu bundle thêm như mục tiêu tự thân | Dư địa ~22 KB; giá cơ hội cao hơn giá thu về |

---

## 7. Quyết định cần David

1. **Site này là site của gốc, app sổ là kho mã khác?** Đề xuất: có. Nó quyết định mọi dòng ở §3 và §5.
2. **Đổi lời mời trang chủ khi nào, thành gì** — trước hay sau `09/09`; giữ *"Launch a chain"* ở vị trí thứ hai?
3. **Tên đệ quy hiện trên site từ bao giờ** — thêm khoá `path` vào sổ chain ngay (rẻ, mở về phía trước) hay chờ đặc tả v0?
4. **Ô tổng kết trang chủ** — giữ L1/validator tới khi có thước đo thật, hay gạch ngang từ mùa 1 để không dạy người đọc đếm sai thứ?
5. **Hoà `web-home` ↔ `main`** (141 / 303 commit) trước mùa 1 — hợp đồng API và console nằm ở `main`, P-60 không thể đi hai đường.

---

## Nguồn

`docs/MASTER-9CHAIN-9-YEARS.md` §2 §4 §6 §9 · `VISION-PERSONAL-L1-REAL-LIFE.md` §3 §5 §6 · `PROJECTION-BILLIONS-OF-L1.md` §3 §6 ·
`PLAN-108-L1-LOAD-TEST.md` §0 §4 · `API-CONSOLE-L1.md` §5 §6 §7 · `docs/WEB-UPGRADE-2026-09-04.md` §7 · bản soát mã
`05/09` (bundle 154,4/160, nền 123,5 KB) · đo sống `05/09`: `console-chains.json` 6.473 B / 11 record, `no-cache`,
`DYNAMIC`; `lib/directory.ts` · `lib/chain.ts:73` · `directoryModel.ts` · `gen-directory-snapshot.mjs` (trần 24 KB) ·
`network/peer/peer.go:39` (16 subnet/node) · memory `console-cong-khai` (15 chỗ là danh sách mời).
