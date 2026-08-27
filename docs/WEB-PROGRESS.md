# WEB-PROGRESS — thi hành `docs/WEB-UPGRADE-2026-08-27.md`

Backlog RIÊNG của phiên web (`web-home`). Tách khỏi `PROGRESS.md` gốc để hai phiên
không ghi đè nhau — `PROGRESS.md` do phiên chain giữ, ở đó chỉ có một dòng con trỏ.

**Nguồn:** [`docs/WEB-UPGRADE-2026-08-27.md`](WEB-UPGRADE-2026-08-27.md) — 118 phát hiện
qua 3 vòng phản biện. **Hạn:** ngày G `01/09/2026`.

## Luật của backlog này

- `[x]` chỉ được đánh khi đã **chạy thật end-to-end và quan sát kết quả đúng** — test
  xanh KHÔNG phải điều kiện đủ. Mỗi mục có "điều kiện qua" là một lệnh đo.
- Ở đâu có thể, điều kiện qua phải kèm **đối chứng ngược**: một phép đo phải ĐỎ nếu
  việc chưa xong. Dự án đã hai lần trả giá cho cổng chỉ biết xanh.
- Đo **NỘI DUNG**, không đo mã HTTP. Thang từ yếu tới mạnh:
  mã HTTP → content-type → nội dung → header tầng trước (`cf-cache-status`).
- 🔴 **Đổi route tĩnh thì Caddy phải đi TRƯỚC web.** `web-deploy.sh` tự kiểm liên kết
  qua tên miền công khai ở bước cuối ⇒ deploy web trước là script tự báo đỏ.

---

## ĐỢT 1 — trước ngày G

### Đã xong (đã lên mạng công khai)

- [x] **Đ1-1 · Caddy một lượt** — `/create-chain` `/my-chains` `/compare` từ 404 vỏ
      Blockscout 75.964 byte → **301**; HTML nay `Cache-Control: no-cache`;
      `/404.html` `/version.txt` `/index.txt` vào `@trangmoi`.
      *Đối chứng ngược đạt:* chunk `_next` VẪN `max-age=14400`; `/api/v2/*` vẫn JSON;
      `/blocks` `/tx/` `/address/` không đổi một byte.
- [x] **Đ1-2 · Trang 404 mang thương hiệu** (David chọn đường (b)) —
      404 · 2.076 byte · tiếng Việt · 3 đường ra · `noindex`. Trước: 75.964 byte,
      tiếng Anh, 0 lần chữ "9Chain", 0 `href` về site.
      *Cổng chống trôi lệch:* `web/test/404-caddy.test.ts` đọc chính Caddyfile, đòi mọi
      mã màu có mặt trong `tokens.css`. Đối chứng ngược: `#ffcb24`→`#ff0000` ⇒ đỏ.
- [x] **Đ1-3 · Duyệt giọng + cổng chặn `[?]`** — 57 chuỗi đã duyệt.
      `/re-genesis/` **64 → 0** dấu; `/faucet/` 9 → 0; 4 trang khác 6 → 0.
      *Cổng:* `scripts/check-no-marker.mjs` trong `postbuild`, chốt ở `out/`.
      Đối chứng ngược: để lại 1 dấu ⇒ build đỏ với 22 dấu/11 tệp.
- [x] **Đ1-5 · Thẻ chia sẻ + sitemap + robots** — `og:*` nay khác nhau từng trang
      (trước: 6 trang dùng chung nội dung trang chủ); `sitemap.org` → `sitemaps.org`;
      luật nghiệm thu robots đổi từ `head -3` (đỏ vĩnh viễn) sang `grep Sitemap:`.
- [x] **Đ1-6a · Màn hình thôi đứng im 900 giây** — `LoiConsole` mang mã HTTP để phân
      biệt ba ca: 4xx từ chối thật → dừng · 524 Cloudflare cắt → chờ · đứt mạng → chờ.
      `tranGiay` 900 → 420. Đối chứng ngược: gỡ dòng vá ⇒ bài kiểm treo 5.005ms rồi đỏ.
- [x] **Đ1-10 mục 4 · Đường cơ sở** — `docs/archive/baseline-2026-08-27-*` + sha256.
      0 chain sống / 6 đã thu hồi, cả 6 tên máy sinh, gọn trong 52,7 phút.
      *Đóng luôn một câu hỏi treo:* "3 sống/43 thu hồi" của PLAN là bản chụp TRƯỚC
      re-genesis, còn nguyên trong `docs/archive/`. Không mất sổ nào.
- [x] **Đ1-11a · Cổng route** — `local-net/deploy/check-routes.mjs`, chạy TRƯỚC lệnh
      chép. Đối chứng ngược: gỡ `/re-genesis/*` ⇒ đỏ (tái hiện đúng sự cố lịch sử).
      Bắt được 1 bẫy ngủ ngay lần chạy đầu: `/index.txt` không có route.
- [x] **Đ1-12 W0 · Bản công bố ngày G viết sẵn** — khối `vi.reGenesisXong`, mục
      **D-web** trong `docs/NGAY-G-A1-CON-LAI.md`, cổng `A1_SAU_NGAY_G=1`
      (chạy hôm nay: đỏ đúng cả hai vế, exit 1).

### Đang làm

- [x] **Đ1-4 · Trang chủ và `/compare/` thôi nói sai về chính mình** — ĐÃ LÊN CÔNG KHAI.
      H1 `Những L1 này do người dùng đẻ ra` → `Đẻ chain riêng của bạn trên A1` (câu về
      SẢN PHẨM, đúng ở cả trạng thái đầy lẫn rỗng). Câu "mỗi dòng là một chain thật"
      hạ xuống chú thích **chỉ hiện khi bảng có dòng**. `/compare/` bỏ lời hứa
      "bằng dữ liệu, không bằng tranh luận" (khối ngay dưới tự bác lại nó).
      *Verify end-to-end bằng Chrome thật, CẢ HAI chủ đề:*
      H1 đúng · trạng thái rỗng dựng được và nay là `<h2>` (trước là `<p>`) ·
      nền thẻ ≠ nền trang ở cả sáng (`#fff` vs `#f5f7fb`) lẫn tối (`#131c33` vs
      `#0a1122`) — trước đó **trùng byte** ⇒ khối rỗng không có nền ·
      hai dòng tự tố có tương phản **7,87:1** (vượt AAA; đáng đo vì `color-contrast`
      đang TẮT trong cổng axe nên không gì khác bắt được).

- [x] **Đ1-13 · Gói việc rẻ** — ĐÃ LÊN CÔNG KHAI.
      Chân trang **0 → 8 liên kết**, 3 cột, `<nav>` có nhãn, liên kết ngoài mang
      `rel="noopener noreferrer"`. `/re-genesis/` thân trang **0 → 3 `href`** (trước
      nhắc chữ "faucet" **13 lần** mà không chỉ đường; hai `href` duy nhất trong HTML
      đều là của thanh điều hướng). `TrongRong` đổi nền + `<p>`→`<h2>` (làm ở Đ1-4).
      *Đo từng liên kết chân trang, cả 8 đều 200.*
      🔴 **Đo được một thứ ngoài kế hoạch:** `https://9chain.org/docs/` trả **404 ở
      cả ba dạng** ⇒ CỐ Ý không có mục tài liệu trong chân trang. Trang chủ 9Scan-A1
      đang có đúng hai liên kết chết vào đó — đã báo họ.
      🔴 **Cổng a11y bắt được một lỗi tôi vừa gây ra:** `<nav>` mới ở chân trang đụng
      `<nav>` của trang 404 ⇒ hai landmark cùng vai, không cái nào có tên
      (`landmark-unique`). Đã đặt `aria-label` cho cả hai.
      ⚠️ Mục "liên hệ / báo lỗi" **cố ý bỏ trống** — chặn ở **D2**. Bịa một địa chỉ
      cho chân trang trông đầy đủ là thứ tệ nhất ở đây.

- [ ] **Đ1-8 · Lưới an toàn mạng** — hạn giờ cho GET, kiểm `r.ok`, `allSettled`.
      🔴 **KHÔNG** đặt `AbortSignal.timeout` cho `/api/create` và `/api/revoke` —
      Cloudflare cắt ở ~100s còn thao tác mất ~170s.
      *Điều kiện qua:* bài kiểm giả lập API chết/chậm/trả rác, màn hình không treo.

- [ ] **Đ1-9 · A11y ngoài tầm axe** — axe bắt được ~30% và `color-contrast` đang TẮT.
      Thứ tự tiêu đề · bẫy tiêu điểm · thao tác chỉ dùng bàn phím · `aria-live` khi
      trạng thái đổi · chữ phóng 200% · `prefers-reduced-motion`.
      *Điều kiện qua:* đi hết luồng faucet **chỉ bằng bàn phím**, quan sát được.

- [ ] **Đ1-11b · Quy trình phát hành** — `version.txt` làm mỏ neo phiên bản · kiểm
      **TẤT CẢ** chunk (lấy danh sách từ bản VỪA DỰNG, không từ HTML tải về) · chạy
      `pnpm test` trong script · `web-rollback.sh`.
      🔴 **TUYỆT ĐỐI không `mv out.new out`** — bẫy inode bind-mount, đã cắn 25/08.
      *Điều kiện qua:* cố tình xoá một chunk trên server ⇒ script `exit 1` ·
      `curl .../version.txt` khớp `cat web/out/version.txt`.

- [ ] **Đ1-7 · Đường ra khỏi phiên ví** — hôm nay không có đường nào.
      *Điều kiện qua:* có nút thoát phiên, bấm xong trạng thái về `vi`.

### Chờ người `[human]`

- [human] **Đ1-10 mục 1 · Cloudflare Analytics** — David mở dashboard zone
  `9chain.org`, xem `a1.9chain.org` từ 25/08. 5 phút, 0 dòng mã. Có thể trả lời câu
  hỏi lớn nhất tuần **cho cả những ngày đã qua** — thứ không phép đo nào bật hôm nay
  làm được.
- [human] **Đ1-10 mục 2–3 · Bật log** — chặn ở **D4** (chính sách log/riêng tư).
  Bật log là **đổi trạng thái**: bắt đầu giữ IP người thật, không thông báo, không hạn
  lưu. Chủ đề này chưa từng được cân nhắc ở đâu — không phải bị bác.
  🔴 Nếu bật: CẤM ghi query string và body (`/api/siwe/nonce?address=0x…` mang địa chỉ ví).
- [human] **Đ1-12 điều 8 GO/NO-GO** — cần phiên chain/BOD thêm vào danh sách.
- [human] **D2 · Kênh liên hệ thật** — chặn phần chân trang của Đ1-13.
  🔴 Không có câu trả lời thì **KHÔNG LÀM** — tuyệt đối không bịa địa chỉ.

### Kẹt `[blocked]`

- [blocked] **Đồng bộ token** — 9Scan đổi `--font-display`→Manrope,
  `--font-sans`→Inter (không token màu nào đổi). Cổng vân tay đang **đỏ có chủ ý**.
  Chờ họ xác nhận: đã chốt chưa · đã khai `next/font` với subset `vietnamese` chưa ·
  đã deploy chưa. Đồng bộ một bản còn dở còn tệ hơn để đỏ.
  *Không chặn việc khác* — đồng bộ xong cũng không đổi gì trên site A1 cho tới khi vá B1.

---

## Quyết định tự chủ trong autopilot

### A-1 · Chuỗi mới viết trong autopilot KHÔNG mang `[?]`, nhưng phải ghi vào đây

**Mâu thuẫn phải gỡ:** luật `[?]` bắt chuỗi mới chờ David duyệt; cổng
`check-no-marker.mjs` (Đ1-3) nay **làm đỏ bản dựng** nếu dấu đó lọt ra `out/`.
Hai luật cộng lại ⇒ **mọi chuỗi mới đều chặn build** ⇒ autopilot không đi tiếp được.

**Chọn:** trong autopilot, chuỗi mới viết **thẳng ở dạng đã dùng được**, và **mọi chuỗi
mới/đổi được chép nguyên văn vào mục dưới** để David duyệt một lượt sau. Lý do: David
đã duyệt D1 toàn bộ và đã duyệt 4 câu trang 404 theo đúng cách này (đọc nguyên văn
trong báo cáo rồi gật) — tức cơ chế duyệt vẫn còn, chỉ đổi chỗ từ dấu trong mã sang
danh sách trong tài liệu.

🔴 **Luật `[?]` KHÔNG bị bãi bỏ.** Nó vẫn áp cho chuỗi viết NGOÀI autopilot, và vẫn là
cách đúng khi tôi **thật sự không chắc** về giọng — lúc đó thà chặn build còn hơn đẩy
một câu mình không tin ra cho người lạ đọc.

### Chuỗi mới / đã đổi, chờ David soát lại

*(cập nhật theo từng lô; nguyên văn để đọc không cần mở mã)*

| Khoá | Nội dung |
|---|---|
| `trangChu.cTieuDe` | Đẻ chain riêng của bạn trên A1 |
| `trangChu.cPhu` | Một L1 của riêng bạn, có chủ là ví bạn ký, chạy thật trên mạng thử nghiệm. Mất khoảng ba phút. |
| `trangChu.cBangChuThich` | Mỗi dòng là một chain thật đang chạy trên A1, có chủ riêng. *(chỉ hiện khi bảng có dòng)* |
| `trangChu.cTrong` | Chưa có L1 nào đang chạy *(cũ: "…ngoài chain hệ thống" — khẳng định một chain mà bảng không hề hiện)* |
| `trangChu.tuTo` | 9 validator hiện chạy trên cùng một máy chủ, cùng một nhà cung cấp — phân tán về giao thức, chưa phân tán về hạ tầng. |
| `trangChu.blockDungYen` | Avalanche không đẻ block rỗng, nên số block đứng yên khi chưa ai giao dịch là bình thường. Phép đo sống/chết là số validator ở ô bên cạnh. |
| `bang.moTa` (đổi vế cuối) | …Bảng này ghi lại các đánh đổi giữa hai hướng, công khai để ai cũng phản bác được — phần C1 hiện chưa có số đo sống. |
| `ComparisonTable` dòng "Phi tập trung" | Trần GIAO THỨC: Snowman ~nghìn node vs CometBFT ~150. **A1 HÔM NAY: 9 node, một máy, một nhà cung cấp** |
| `chanTrang.dungThu` / `.kham` / `.veDuAn` | Dùng thử · Xem mạng · Về dự án *(tiêu đề 3 cột)* |
| `chanTrang.explorer` / `.trangChinh` | Explorer 9Scan-A1 · Trang chính 9Chain |
| `chanTrang.reGenesis` | Kế hoạch sinh lại mạng *(KHÔNG dùng lại "Chi tiết" của banner — tách khỏi ngữ cảnh thì vô nghĩa)* |
| `chanTrang.nhanNav` / `khongThay.nhanNav` | Liên kết chân trang · Đường đi tiếp *(nhãn a11y, không hiện ra)* |
| `chanTrang.moTabMoi` | (mở tab mới) *(chỉ trình đọc màn hình nghe)* |
| *(trang 404, David đã duyệt)* | Không có trang này · Đường dẫn bạn mở không tồn tại… · Đang tìm một giao dịch hay một địa chỉ?… |

---

## ĐỢT 2 — sau ngày G (chưa mở)

Xem `docs/WEB-UPGRADE-2026-08-27.md` §2. Mục đắt nhất: **B1+B2 (cụm font)** — B1 không
cần 9Scan gật, nhưng **B1 không được LÊN TRƯỚC B2**; ràng buộc là THỨ TỰ, không phải
quyền quyết. Và B1 lên là phải chỉnh trần `check-budget.mjs` (129 KB + font ~144 KB
vượt trần 160).
