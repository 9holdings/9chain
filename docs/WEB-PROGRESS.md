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

- [x] **Đ1-8 · Lưới an toàn mạng** — XONG `2026-08-28`.
      `lib/mang.ts` mới: `docJson()` phân biệt **4 kiểu hỏng** (`hetGio` ·`http` ·
      `khongPhaiJson` · `dutMang`) thay vì gộp thành "không tải được".
      `stats.ts`: `Promise.all` → **`allSettled`**, mỗi ô vắng riêng được.
      `NetworkStats` + `ComparisonTable`: **3 trạng thái MỖI Ô** (đang đo · có số ·
      ô vắng). Ô vắng là **gạch ngang, không phải `0`** — "0 validator" đọc như mạng
      chết trong khi sự thật là ta chưa hỏi được; kèm `sr-only` để trình đọc màn hình
      **nghe được** sự khác nhau giữa "—" và một con số.
      Hạn giờ cho mọi lượt ĐỌC ngắn: `ChainTable` · faucet `/api/info` · RPC đếm
      validator của `/my-chains/` · console `/api/status` + `/api/progress`.

      🔴 **Ràng buộc số một, và chiều an toàn đã chọn:** `goiConsole()` **mặc định
      KHÔNG hạn giờ**; hạn giờ phải **bật ra**. Quên bật thì cùng lắm chậm như hôm
      nay; **quên tắt thì gãy một đường không sửa lại được** (huỷ giữa chừng ⇒ server
      vẫn đẻ chain xong, người dùng tưởng hỏng rồi bấm lại — mà tên đã dùng thì mạng
      này KHÔNG BAO GIỜ cấp lại).
      Kèm: hết giờ ném `LoiConsole` với `status 0` ⇒ `laTuChoiThat = false` ⇒ màn hình
      **chờ tiếp** thay vì kết luận "bị từ chối". Nhầm chiều đó là bỏ cuộc giữa một
      việc đang chạy đúng.

      *Điều kiện qua — đạt:* `test/mang.test.ts` giả lập **chết / chậm / trả rác /
      đứt mạng**, màn hình không treo.
      *Cổng đọc MÃ NGUỒN canh `/api/create` + `/api/revoke` không có tham số thứ tư* —
      bắt buộc vì lớp lỗi này **không tái hiện được bằng bài kiểm chạy được**: muốn
      tái hiện phải có một thao tác 170 giây thật.
      🔴 **Cổng đó BÁO OAN ngay lần chạy đầu** (regex đếm dấu phẩy, mà
      `{ name, xacNhan }` có dấu phẩy bên trong). Đã đổi sang **cân ngoặc thật** —
      *một cổng báo oan còn nguy hơn cổng không có, vì người ta học cách bỏ qua nó.*
      *Đối chứng ngược:* cố tình đặt hạn giờ 30s vào `/api/create` ⇒ **ĐỎ**, đúng tệp
      đúng đường; khôi phục ⇒ xanh.
      *Verify Chrome thật:* localhost không có `console-chains.json` — đúng kịch bản
      "một nguồn chết". Kết quả: **validator 9/9** (thật, từ P-Chain công khai) ·
      **L1 "—"** kèm lời khai · **block 1**. Trước lượt vá, cả ba ô cùng biến mất.

- [ ] **Đ1-9 · A11y ngoài tầm axe** — axe bắt được ~30% và `color-contrast` đang TẮT.
      Thứ tự tiêu đề · bẫy tiêu điểm · thao tác chỉ dùng bàn phím · `aria-live` khi
      trạng thái đổi · chữ phóng 200% · `prefers-reduced-motion`.
      *Điều kiện qua:* đi hết luồng faucet **chỉ bằng bàn phím**, quan sát được.

- [ ] **Đ1-11b · Quy trình phát hành** — **PHẦN 1 XONG, phần 2–3 còn treo.**

  - [x] **Phần 1 · mỏ neo `version.txt` + cổng hai chiều** *(2026-08-27)*
        🔴 **Đóng một lỗi ĐANG SỐNG trên mạng công khai**, không phải việc dự phòng:
        `curl https://a1.9chain.org/version.txt` → **404, nginx, `content-type:
        text/html`**. Route vào `@trangmoi` từ **Đ1-1**, nhưng thứ sinh ra tệp thì nằm
        ở đây — **route lên trước sản phẩm**.
        `web/scripts/gen-version.mjs` (đầu `postbuild`): `commit` · `nhanh` ·
        **`con-sua-chua-commit`** · `dung-luc` · `so-chunk-js`, ghi LF tường minh.
        *Vì sao có trường `dirty`:* mỏ neo chỉ mang SHA sẽ nói dối rất tự tin khi ai
        đó dựng từ cây còn sửa dở — SHA trỏ vào một commit KHÔNG chứa thứ đang lên
        sóng. **Đã chứng minh sống:** lượt dựng trong phiên này khai `co`, đúng.
        `check-routes.mjs` nay đo **CHIỀU NGƯỢC LẠI**: mọi mẫu trong `@trangmoi` phải
        trỏ vào thứ có thật. Cổng cũ xanh suốt vì nó chỉ hỏi *"mọi tệp đã có route
        chưa?"* — một chiều của quan hệ hai chiều.
        *Đối chứng ngược, cả hai chiều, đều đã nhìn thấy lúc ĐỎ:*
        thiếu `out/version.txt` ⇒ đỏ **(tái hiện đúng lỗi vừa đo bằng `curl`)** ·
        gỡ `/re-genesis/*` khỏi Caddyfile ⇒ đỏ (tái hiện sự cố lịch sử) · khôi phục
        cả hai ⇒ xanh. Dòng báo xanh đã viết lại cho khai đúng **hai** chiều.

  - [ ] **Phần 2 · kiểm TẤT CẢ chunk** — lấy danh sách từ bản VỪA DỰNG, không từ HTML
        tải về. *(`so-chunk-js` hiện chỉ là số ĐẾM — hai bộ tệp khác nhau vẫn có thể
        cùng số đếm. Phải so DANH SÁCH.)*
  - [ ] **Phần 3 · `pnpm test` trong script deploy + `web-rollback.sh`**
        🔴 **TUYỆT ĐỐI không `mv out.new out`** — bẫy inode bind-mount, đã cắn 25/08.

  *Điều kiện qua còn lại:* cố tình xoá một chunk trên server ⇒ script `exit 1` ·
  `curl .../version.txt` khớp `cat web/out/version.txt` **(chỉ kiểm được sau lượt
  deploy kế tiếp — hôm nay đường đó còn 404 trên mạng)**.

- [ ] **Đ1-7 · Đường ra khỏi phiên ví** — hôm nay không có đường nào.
      *Điều kiện qua:* có nút thoát phiên, bấm xong trạng thái về `vi`.

---

## ĐỐI CHIẾU SITE ↔ MẠNG g0 (`2026-08-28`) — phát hiện còn mở

Sinh ra từ một lượt **đo mạng công khai trước, rồi mới đọc mã** (không đọc hằng số rồi
tin nó). Ba mục A đã đóng trong phiên; phần dưới là phần còn lại.

**Phép đo nền (mạng thật, `28/08`):** `networkID 999999999` ✓ khớp site ·
`networkName 9chain-a1-g0` · `eth_chainId 0x218711a09` ✓ khớp · C-Chain block `0x1` ·
**9/9 validator connected** · danh bạ 0 sống/0 thu hồi · `currentSupply` (X/P)
4.300.824.365 LOVE9 · CORS `*` trên cả C và P ✓ · HTML `no-cache` ✓.
⇒ **Hằng số danh tính KHÔNG phải vấn đề** — `check-chain-id.mjs` xanh thật.

- [x] **A1 · Dải cảnh báo nói cả mốc ĐÃ QUA** — xong, xem **D-web-1**.
- [x] **A3 · Bỏ `toLocaleString('vi-VN')` cắm cứng** — xong, xem **D-web-2**.
- [x] **B1 · Cổng route đo hai chiều + `version.txt`** — xong, xem **Đ1-11b phần 1**.

- [ ] **A2 · "Takes about three minutes" — số đo mới nhất là 305,5s (~5 phút)**
      Câu này ở **3 chỗ** trong `en.ts` (`:198` `cPhu` → cũng là **`og:description`**,
      `:225`, `:335`), tức nó nằm trong câu được đọc nhiều nhất khi ai đó dán liên kết.
      [`HANDOFF.md:489`](../HANDOFF.md) đo trên mạng **9 node** (`26/08`): đẻ chain
      **305,5s**, thu hồi 293,4s. Con số ~170s ([`HANDOFF.md:1021`](../HANDOFF.md)) là
      thời mạng **5 node** — lượt lên 9 node gần như **gấp đôi** thời gian, và câu chữ
      không ai sửa.
      🔴 **Mâu thuẫn nội bộ xác nhận:** `web/lib/wallet.ts:251` đặt `tranGiay = 420`
      — **mã chờ 7 phút trong khi chữ hứa 3**.
      ⚠️ **Mức tin cậy:** 305,5s đo trên mạng `26/08`, **chưa đo lại trên g0**. Cùng 9
      node nên kỳ vọng giữ, nhưng phải đo.
      *Điều kiện qua:* đẻ một chain thật trên mạng công khai, ghi giây, rồi sửa câu
      theo số đo — **không đoán**. (Trùng mục #2 của `HANDOFF.md`.)

- [ ] **B2 · Cổng danh tính không canh THẾ HỆ** — `check-chain-id.mjs` chặn theo
      `eth_chainId` + `networkID`; `networkName` chỉ in dòng `ℹ`.
      Đã tra `network_ids.go`: ngày G `A1Gen 0→1` ⇒ `A1ID = 999999999 − 1 =`
      **`999999998`** và `A1Name = 9chain-a1-g1`. ⇒ **cổng SẼ bắt được** — nhưng nhờ
      *kiến trúc của chain* (thế hệ nằm trong ID), **không nhờ cổng có ý canh thế hệ**.
      Ai sau này đổi sang sơ đồ thế-hệ-chỉ-trong-tên thì cổng im lặng.
      *Điều kiện qua:* nâng dòng `ℹ` thành phép so thật + đối chứng ngược.

### Chờ phiên khác / chờ David

- [human] **C1 · I1b `/faucet/api/supply` đang 404 trên mạng** — đo `28/08`:
      `a1.9chain.org/faucet/api/supply` → **404** `{"error":"not found"}`. Đó là 404 của
      **chính faucet** (vì `/faucet/api/info` sống ⇒ Caddy cắt tiền tố đúng), trong khi
      repo **có** route ở `local-net/faucet/server.mjs:241` ⇒ **bản faucet đang chạy cũ
      hơn đợt 14.**
      🔴 **Chặn thẳng việc HANDOFF giao cho phiên này** ("câu khai nguồn cung trên
      trang"): câu đó trỏ vào `/faucet/api/supply` là trỏ vào đường chết.
      ⇒ **Quyết:** deploy faucet trước, **hay** viết theo đường (b) của A-5 (khai nguồn
      là *tham số genesis*)?
      ⚠️ **Bẫy khi kiểm:** `/api/supply` ở **gốc** (không có `/faucet`) do **Blockscout**
      trả lời — HTTP 400 + JSON của họ. Ai kiểm nhầm đường đó sẽ kết luận sai hoàn toàn.

- [human] **C2 · Explorer site trỏ sang vẫn công bố `networkID 9001`** — đo `28/08`
      trên `a1.9scan.org`: `<title>9Scan A1 — 9Chain block explorer · **9001**</title>`,
      **12 lần** chuỗi `9001` trong HTML, gồm meta description.
      Repo của họ **ĐÃ CÓ** commit `2a84d95` sửa `9001 → 999999999` ⇒ **đây là độ trễ
      deploy, không phải họ chưa biết.**
      Ảnh hưởng thật: site đưa `blockExplorerUrls: ['https://a1.9scan.org']` vào ví qua
      EIP-3085, và trang faucet in "Explorer" trong bảng thông số ⇒ người dùng thêm mạng
      xong bấm sang explorer thì gặp con số **mâu thuẫn với chân trang A1**.
      🔴 **Bài học kiến trúc:** `check-chain-id.mjs` chỉ chứng minh hằng số **CỦA A1**;
      nó **không đo thứ A1 trỏ người dùng tới**. Lại đúng lớp *"cổng chỉ chứng minh
      đường của nó"*. ⇒ Có dựng cổng đo cả explorer không?

- [ ] **D · Nợ nhỏ hơn** (không chặn ai)
      - `stats.ts` ghép 3 nguồn bằng `Promise.all`: `console-chains.json` chết ⇒ **mất
        luôn ô validator**, đúng lúc site cần nhất để nói "9/9 còn sống". Và không fetch
        nào có hạn giờ ⇒ RPC treo thì trang chủ ở khung xương vĩnh viễn. **Cả hai nằm
        trong Đ1-8.**
      - `trangChu.cTrongMoTa` — *"You would be the first."* đúng cho thế hệ g0, nhưng
        đọc như *"chưa ai từng thử"* trong khi sự thật là *"mọi thứ vừa bị xoá có chủ
        ý"*. Lệch giọng so với chuẩn tự-tố của phần còn lại.
      - `/faucet/health` trả `{ok:true}` **cứng** (`server.mjs:191`) — không kiểm số dư
        ví, không kiểm RPC. Ngay sau một lượt re-genesis (ví faucet sinh khoá mới) đó
        đúng là lúc "health" cần có nghĩa. *Không khẳng định faucet hỏng — khẳng định
        cổng này không chứng minh được nó không hỏng.*

### Chờ người `[human]`

- [x] **Đ1-10 mục 1 · Cloudflare Analytics** — David mở `05/09`. Hai phát hiện:
  **(a)** *DNS → Analytics* KHÔNG đếm người: 990 lượt hỏi tên/24h, cột nhọn 220 lúc
  ~13:00Z `04/09` trùng lượt deploy + cổng gọi mọi tài nguyên — tức là chính mình.
  **(b)** *Analytics → Web analytics* CÓ số vì Cloudflare **đang chèn beacon** (xem D4
  dưới): 24h qua **60 lượt ghé · 287 lượt xem**, thứ tự trang `/` · `/create-chain/` ·
  `/faucet/` · `/chains/` · `/live/`. Số này gồm cả máy David và các lượt đo site sống
  bằng Browser pane. 🔴 **Còn chưa đọc:** khoảng `25/08 → nay` + tab Country/Browser
  để tách người ngoài khỏi mình.
- [human] **Đ1-10 mục 2–3 · Bật log** — chặn ở **D4** (chính sách log/riêng tư).
  Bật log là **đổi trạng thái**: bắt đầu giữ IP người thật, không thông báo, không hạn
  lưu. Chủ đề này chưa từng được cân nhắc ở đâu — không phải bị bác.
  🔴 Nếu bật: CẤM ghi query string và body (`/api/siwe/nonce?address=0x…` mang địa chỉ ví).
  ⚠️ **Đo `05/09`: site ĐÃ có một đường dữ liệu người thật đi ra ngoài** — Cloudflare
  chèn `static.cloudflareinsights.com/beacon.min.js` (Web Analytics, RUM) vào mọi trang
  HTML **chỉ khi UA là trình duyệt**; UA `guest`/`curl` không thấy ⇒ **mọi cổng trong cây
  này mù với nó**, và nó không nằm trong repo. Beacon gửi URL, thời gian tải, Core Web
  Vitals; Cloudflare khai không cookie, không lưu IP. **David chốt `05/09`: GIỮ** — đó là
  phép đo duy nhất về người thật. Hệ quả cho D4: khi có trang riêng tư thì phải khai nó.
  Phát hiện lại bằng: `curl -s -A "Mozilla/5.0 Chrome/128" https://a1.9chain.org/ | grep -c cloudflareinsights`
  (phải ra `1`; với `-A guest` phải ra `0`).
- [human] **Đ1-12 điều 8 GO/NO-GO** — cần phiên chain/BOD thêm vào danh sách.
- [human] **D2 · Kênh liên hệ thật** — chặn phần chân trang của Đ1-13.
  🔴 Không có câu trả lời thì **KHÔNG LÀM** — tuyệt đối không bịa địa chỉ.

### Kẹt `[blocked]`

- [x] ~~**Đồng bộ token**~~ — **HẾT KẸT `05/09`**: B1 (lớp biến lên `<html>`) + B2
  (Manrope + Inter + JetBrains Mono, tiếng Việt vẽ bằng font thương hiệu) lên cùng một
  commit `2f11ae8`, deploy `3c67172`. Vân tay token **xanh vì hết lệch**, không phải sửa
  kỳ vọng. Test 181/181. Trần ngân sách không đổi (146,0/160 KB gz).

---

## Quyết định tự chủ trong autopilot

### D-web-1 · Dải cảnh báo mang HAI mốc, mốc ĐÃ QUA đứng trước *(2026-08-27)*

Dải trên mọi trang chỉ nói về `01/09` (tương lai). Nhưng mạng **đã sinh lại hôm nay**
(D-081, thế hệ g0) ⇒ người mở ví thấy số dư 0 **không có lời giải nào trên trang họ
đang đứng**; câu giải thích nằm ở `/re-genesis/`, sau một cú bấm.

**Chọn:** đưa `reGenesis.daXayRaTieuDe` lên đầu dải, câu về `01/09` lùi xuống sau.
**Không sinh chuỗi mới** — khoá đó đã có sẵn trong cả 11 từ điển ⇒ không chạm luật
`[?]`, không đẻ nợ dịch thuật.

*Vì sao đây là quyết định chứ không phải sửa lặt vặt:* nó đảo thứ tự nhấn mạnh của
phần tử được nhìn nhiều nhất site. Căn cứ: đúng bài học **Đ1-4** đã ghi trong
`NoiDungTrangChu.tsx` — đặt lời giải ở trang riêng là để nó vắng mặt ở chỗ người ta
thật sự đọc. Bài học đó đã áp cho "block đứng yên", chưa ai áp cho "đã sinh lại".

🔴 **Ngày G phải sửa lại:** `daXayRaTieuDe` khi đó nói về một lượt sinh lại đã cũ hai
đời. Đổi ngày sang `01/09` hoặc gỡ cùng lúc gỡ dải.

### D-web-2 · Số theo ngôn ngữ người đọc, nhưng GIỮ chữ số Latin *(2026-08-27)*

`toLocaleString('vi-VN')` cắm cứng ở `NetworkStats.tsx` và `ComparisonTable.tsx` —
viết từ thời site chỉ có tiếng Việt. Sau khi lên 30 ngôn ngữ, chiều cao block hiện
kiểu Việt (`1.234.567`) cho **mọi** người đọc; với người đọc tiếng Anh dấu chấm đó
đọc ra thành số thập phân.

**Chọn:** `lib/so.ts` → `dinhDangSo(n, ma)`, lấy dấu phân cách theo ngôn ngữ nhưng ép
`-u-nu-latn` để **giữ chữ số Latin**. Lý do không để `ar` ra `٤٬٣٠٠`: chiều cao block
là thứ để **đối chiếu** với explorer, ví và phản hồi RPC — cả ba in chữ số Latin. Một
con số không đối chiếu được thì không còn là số liệu. Lấy cái giúp ĐỌC, giữ cái giúp
ĐỐI CHIẾU.

🔴 **Vì sao không cổng nào bắt được, và vì sao nó sẽ còn ẩn tiếp:** mạng vừa sinh lại
nên `eth_blockNumber` = **1** — một chữ số thì không có dấu phân cách, mọi ngôn ngữ in
ra y hệt nhau, **triệu chứng bằng 0**. `01/09` mạng lại về 1, cửa sổ ẩn mở thêm lượt
nữa. Đây là lớp lỗi mà **chính phép reset mạng làm triệu chứng biến mất trong khi
khuyết tật ở nguyên đó**. ⇒ `test/so.test.ts` đo **thẳng hàm** với số đủ lớn, KHÔNG đo
qua mạng; kèm cổng quét mã chặn tái phát.

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

### Chuỗi lô `2026-08-27` — ✅ đã duyệt, và nay là **BẢNG LỊCH SỬ**

*(nguyên văn để đọc không cần mở mã)*

⚠️ Bảng này khoá theo tên cũ (`trangChu.*`, `chanTrang.*`) — **0 khoá trong đó còn tồn
tại**; lượt đổi tên Việt→Anh `03/09` đã chuyển hết sang `home.*` / `footer.*`. Giữ lại
làm hồ sơ lượt duyệt `27/08`, đừng đọc nó như danh sách việc đang chờ.

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
| `chung.moTaNgan` 🔴 | Testnet công khai của 9Chain, **mạng riêng chạy engine Avalanche** *(cũ: "chạy trên Avalanche" — SAI)* |
| `chung.tagTitle` | mạng riêng chạy engine Avalanche *(bản ngắn cho `<title>`)* |
| `bang.moTa` | …A1 **engine** Avalanche, C1 **engine** Cosmos… *(cũ: "A1 trên Avalanche")* |
| *(trang 404, David đã duyệt)* | Không có trang này · Đường dẫn bạn mở không tồn tại… · Đang tìm một giao dịch hay một địa chỉ?… |

---

## ✅ Đa ngôn ngữ — **30/30 XONG** (`2026-08-28`)

**Tất cả:** `en` (mặc định, trong bundle) + **29 chunk lười**.
Lô 5–11 của phiên này thêm 19 bản: `bn ur id · mr tr it · ko pl nl · th uk ms ·
fa tl · sw ha · te ta gu`.

3 bản RTL (`ar ur fa`) — bộ component vốn dùng **thuộc tính logic** nên **không phải
sửa một dòng nào** cho hướng viết.

**Điều kiện qua — đã đo end-to-end, không chỉ test xanh:**

| | |
|---|---|
| Bài "mọi ngôn ngữ trong sổ đều có từ điển" | **NAY ĐẠT** — bộ đếm 19 → 0 |
| Toàn bộ test | **131/132** *(bài đỏ duy nhất còn lại: vân tay token, chờ 9Scan)* |
| `tsc` · cổng nhiễm hệ chữ · axe 7 trang | sạch |
| **Ngân sách** | **134,3 → 135,3 KB gz** cho **19 bộ từ điển thêm** (trần 160) |
| Chrome thật | bộ chọn có **30 nút, 0 nút bị vô hiệu hoá** (trước: 19 nút "chưa có") |
| Nạp lười | bấm Tamil ⇒ `lang=ta`, dải lật, và **đúng MỘT chunk mới** tải ở `t=14735ms` — tức đúng lúc bấm |

🔴 **+1,0 KB cho 19 bộ từ điển là bằng chứng nạp lười chạy thật**, không phải may:
trần chỉ đếm thứ tải **vô điều kiện**, mà chunk từ điển không nằm trong đó.
⇒ **i18n KHÔNG phải rủi ro ngân sách. Font (B1+B2) mới là.**

⚠️ **Bài `i18n-shape` đổi vai:** trước đây nó là **bộ đếm tiến độ** (đỏ có chủ ý);
nay nó là **cổng thật** — thêm ngôn ngữ vào `ngonNgu.ts` mà quên từ điển sẽ đỏ.
Đừng gỡ nó vì "đã xong rồi".

Khuôn cho bản tương lai (nếu sổ ngôn ngữ mở rộng):
1. `web/lib/i18n/dicts/<ma>.ts` — chép hình dạng từ `en.ts`, **dịch từ EN** (không từ `vi.ts`).
2. Thêm một dòng vào `BO_NAP` trong `web/lib/i18n/index.tsx` — **viết tay, không dùng biến**.
3. `pnpm typecheck && pnpm vitest run test/i18n-shape.test.ts`.

🔴 Không làm nhẹ `reGenesis.*` · `deChain.soatMoTa` · `chainCuaToi.thuHoiY*`.
🔴 Mở đầu tệp phải khai: máy dịch · chưa có người soát · nguồn là tiếng Anh.

⚠️ **Việc còn lại của i18n, và nó là việc của NGƯỜI:** 29/30 bản chưa ai đọc được để
soát. Trường `soat: 'may'` trong `ngonNgu.ts` là **lời khai**, không phải tinh chỉnh —
nâng lên `'nguoi'` chỉ khi có người đọc được thứ tiếng đó soát xong.

---

## ĐỢT 2 — sau ngày G (chưa mở)

Xem `docs/WEB-UPGRADE-2026-08-27.md` §2. Mục đắt nhất: **B1+B2 (cụm font)** — B1 không
cần 9Scan gật, nhưng **B1 không được LÊN TRƯỚC B2**; ràng buộc là THỨ TỰ, không phải
quyền quyết. Và B1 lên là phải chỉnh trần `check-budget.mjs` (129 KB + font ~144 KB
vượt trần 160).

---

## ✅ Chuỗi tiếng Việt `2026-09-04` (lô sau) — **DAVID ĐÃ DUYỆT `2026-09-04`**

Sinh ra từ lượt "ô địa chỉ tự điền từ ví" (David báo từ điện thoại, xem `WORKTREE-WEB.md`).
29 bản kia là máy dịch từ tiếng Anh, đã khai `review: 'machine'` — lượt duyệt không chạm tới.

| Khoá | Tiếng Việt đang chạy |
|---|---|
| `faucet.addressFromWallet` | Điền sẵn từ ví bạn đã nối. Sửa lại nếu muốn token vào một địa chỉ khác. |
| `faucet.useWalletAddress` | Dùng địa chỉ ví của tôi |

⚠️ `faucet.addressHelp` (*"Dán địa chỉ ví bạn muốn nhận token…"*) **giữ nguyên**, dù nay ô
thường đã có sẵn chữ. Nó vẫn đúng cho người không có ví, và đổi nó là đụng 30 bản dịch đã
duyệt để lấy một sắc thái — nếu David thấy chướng thì nói, sửa sau cũng được.

---

## ✅ Chuỗi tiếng Việt `2026-09-04` — **DAVID ĐÃ DUYỆT GIỌNG `2026-09-04`**

Bản Anh ở `web/lib/i18n/en.ts` (`directory.*`, `home.moreChains`). 29 bản khác là máy
dịch từ tiếng Anh, đã khai `review: 'machine'` — **lượt duyệt này không chạm tới chúng**.
Bản Việt dưới đây là bản đã duyệt; nó cũng là bản **đang chạy** trên `a1.9chain.org`
(deploy `6fae9bd`), tức duyệt ở đây là **bắt kịp lời khai**, không phải mở cổng.

Đối chứng lúc duyệt — không duyệt bằng cách đọc chính bảng này:

| Đo | Kết quả |
|---|---|
| chữ trong bảng ↔ chữ trong `vi.ts` | khớp (`presets` · `steps` · `common.*` · `directory.*` 68 khoá) |
| sổ giá trị `check-dict-values.mjs` | **11.340 chuỗi/30 ngôn ngữ khớp**, 0 khoá treo ngoài sổ |
| `home.disclosure` ↔ mạng thật | `check-decentralisation-claim.mjs`: **11 validator, 10 connected** ✓ |

🔴 **`home.disclosure` được duyệt KÈM phép đo, nên lời duyệt hết hạn khi mạng đổi.**
Khách thứ ba stake, hay khách cũ lên lại, là câu đó **sai** dù không ai đụng vào chữ.
Đừng viện "David đã duyệt" để giữ nó — cổng phải đỏ và câu phải viết lại.

Sửa chữ sau lượt duyệt này thì phải chạy `node scripts/check-dict-values.mjs --accept`
(sổ chống trôi lệch — nó **không** phải lời khai duyệt giọng; lời khai nằm ở đầu
`web/lib/i18n/dicts/vi.ts` và ở `languages.ts` cạnh `vi`).

| Khoá | Tiếng Việt đang chạy |
|---|---|
| `home.moreChains` | Xem đủ {count} chain trong danh bạ |
| `directory.tileTotal` / `.tileRunning` / `.tileAttention` / `.tileRevoked` | L1 trong danh bạ · Đo được đang chạy · Cần để ý · Đã thu hồi |
| `directory.sweepProgress` | Đã đo {done}/{total} |
| `directory.measuringDesc` | Đang xếp hàng chờ đo. |
| `directory.howToToggle` | Đọc danh sách này thế nào |
| `directory.searchLabel` / `.searchPlaceholder` | Tìm · Tên, Chain ID, chủ sở hữu hoặc blockchain ID |
| `directory.filterStatus` / `.filterAll` / `.filterRunning` / `.filterAttention` / `.filterRevoked` | Trạng thái · Tất cả · Đang chạy · Cần để ý · Đã thu hồi |
| `directory.filterType` / `.filterTypeAll` | Loại · Mọi loại |
| `directory.groupBy` / `.groupNone` / `.groupOwner` / `.groupType` / `.groupStatus` | Gom theo · Không gom · Chủ sở hữu · Loại · Trạng thái |
| `directory.groupNoType` / `.groupCount` | Chưa ghi loại · {shown}/{total} |
| `directory.sortBy` / `.sortNewest` / `.sortOldest` / `.sortName` / `.sortChainId` / `.sortBlocks` | Sắp xếp · Mới nhất trước · Cũ nhất trước · Tên · Chain ID · Nhiều block nhất |
| `directory.refresh` | Đo lại |
| `directory.listCaption` | Các chain trên A1, kèm trạng thái đo được của từng chain *(chỉ trình đọc màn hình nghe)* |
| `directory.showing` / `.showMore` | Hiện {shown}/{total} · Hiện thêm {count} |
| `directory.noMatchTitle` / `.noMatchDesc` / `.clearFilters` | Không chain nào khớp · Thử từ khoá khác, hoặc xoá bộ lọc. · Xoá bộ lọc |
| `directory.showDetails` / `.hideDetails` / `.detailsOf` | Chi tiết · Thu gọn · Chi tiết của {name} *(nhãn a11y)* |
| `directory.nativeToken` | Token gốc |
| `directory.mismatch` 🔴 | SAI CHAIN |
| `directory.mismatchDesc` 🔴 | RPC trả lời với Chain ID {got} thay vì {expected} — nhiều khả năng là lỗi định tuyến, không phải chain này. |
| `home.disclosure` 🔴 *(đổi `04/09` — mạng 11 validator, khách thứ hai vào)* | 9 trong số 11 validator chạy trên cùng một máy chủ, cùng một nhà cung cấp; hai validator còn lại tham gia từ nơi khác, và chỉ một trong hai đang trực tuyến — phân tán về giao thức, chưa phân tán về hạ tầng. |
| `common.noWalletMobile` *(thêm `04/09` — khách dùng điện thoại không thể "cài MetaMask rồi tải lại")* | Trình duyệt trên điện thoại không cài được tiện ích ví. Hãy mở trang này bên trong app MetaMask — trình duyệt có sẵn trong app đã có ví. |
| `common.openInMetaMask` | Mở trong app MetaMask |
| `presets.standard` *(thêm `04/09` — chữ console gửi ra, nay dịch theo MÃ)* | Tiêu chuẩn · Một chain EVM thường. Chủ chain nhận toàn bộ token genesis và quyền chỉnh phí. |
| `presets.zero-fee` | Phí gần bằng 0 · baseFee = 1 wei, giao dịch trả đúng mức sàn đó (một lượt chuyển tốn 0,000000000000021 LOVE9). Hợp cho game, thử nghiệm và chain nội bộ. Đổi lại: gần như không có gì cản spam. |
| `presets.high-throughput` | Thông lượng cao · Mỗi block chứa gấp năm lần số giao dịch (gasLimit 60 triệu thay vì 12 triệu). Hợp cho game, sàn giao dịch, mọi thứ có dòng giao dịch nhỏ đều đặn. Đổi lại: block nặng hơn, và ai chạy node cho chain này cần máy mạnh hơn. |
| `presets.mintable` | Cung có thể in thêm · Chủ chain có thể in thêm token gốc bất cứ lúc nào qua precompile 0x02…01. Tổng cung KHÔNG cố định — ai dùng chain này cần biết điều đó. |
| `presets.owner-deploy-only` | Chỉ chủ chain được triển khai hợp đồng · Mọi người khác vẫn gửi được giao dịch và dùng hợp đồng có sẵn, nhưng không triển khai hợp đồng riêng được. Chủ chain cấp quyền đó cho bất kỳ ai qua precompile 0x02…00. |
| `presets.permissioned` | Có kiểm soát (chỉ ví được duyệt mới gửi) · Chỉ địa chỉ trong danh sách mới GỬI được giao dịch. Hợp cho chain nội bộ của công ty. ⚠️ Đây là kiểu chặt nhất: một ví lạ vào đây không làm được gì cả. |
| `steps.genesis` / `.subnet` / `.rpc` | Đang dựng genesis · Đang tạo subnet + blockchain trên P-Chain · Đang chờ RPC của L1 trả lời |

---

## Lô chuỗi VI mới `2026-09-05` — CHỜ DAVID DUYỆT GIỌNG

Sinh trong lượt autopilot `05/09` (David chốt ba mốc: chuyển hướng `/tx/`, trang nghi lễ,
bộ chữ). 29 bản còn lại là **máy dịch, đã khai** — chỉ bản VI dưới đây cần người đọc.

**28 khoá mới của `ceremony.*`** (trang `/ceremony/`) — nguyên văn đang chạy:

| Khoá | Tiếng Việt đang chạy |
|---|---|
| `nav.ceremony` · `ceremony.badge` | Nghi lễ |
| `ceremony.title` | Nghi lễ 9S Union |
| `ceremony.desc` | Vào đúng một giây đã định, mạng ghi ba block có tên. Trang này nói trước điều gì sẽ xảy ra, ba block ấy mang gì, và sau đó bạn tự kiểm lại bằng cách nào mà không phải hỏi ai. |
| `ceremony.momentLabel` / `.countdownLabel` | Mốc · Còn lại |
| `ceremony.days` / `.hours` / `.minutes` / `.seconds` / `.yourZone` | ngày · giờ · phút · giây · Múi giờ của bạn |
| `ceremony.blocksTitle` | Ba block |
| `ceremony.adamDesc` 🔴 | Block ĐẦU TIÊN có dấu thời gian chạm tới mốc — định nghĩa bằng THỜI GIAN, không phải bằng chiều cao. Ai đẻ ra block đó cũng được. |
| `ceremony.evaDesc` / `.unionDesc` | Block ngay sau Adam, tính theo chiều cao. · Mười block sau Adam. Thông điệp 9S Union neo ở đây. |
| `ceremony.messagesTitle` / `.messagesDesc` | Ba block mang gì · Adam và Eva mang đúng hai câu đã được khắc vào block 0 lúc sinh mạng — nghi lễ trỏ thẳng vào chính những tệp đó, nên hai bên không thể trôi lệch khỏi nhau. Mỗi vân tay dưới đây được đóng băng ngày 2026-09-03, trước nghi lễ, và ai cũng dựng lại được bằng sha256 trên byte gốc. |
| `ceremony.quietTitle` / `.quietDesc` | Một phút yên tĩnh · C-Chain không đẻ block rỗng, nên luồng giao dịch tổng hợp mà chúng tôi công bố ở trang trực tiếp sẽ dừng trước mốc một quãng. Không dừng thì nghi lễ phải đua với một bộ gửi tự động trong cửa sổ chỉ hai giây. Cái giá là một phút yên tĩnh; thứ mua được là ba block này thuộc về nghi lễ chứ không thuộc về một con bot. |
| `ceremony.strangerTitle` 🔴 | Người lạ có thể lấy mất block đó, và bản ghi vẫn đứng vững |
| `ceremony.strangerDesc` 🔴 **đừng làm nhẹ đi** | A1 là mạng thử nghiệm công khai, giây đó ai cũng có quyền gửi giao dịch. Bản ghi neo vào HASH GIAO DỊCH của nghi lễ, không bao giờ neo vào chiều cao block — nên nếu block của người khác chạm mốc trước, thứ đã ghi vẫn đúng; chỉ là nghi lễ không đẻ ra block ấy. |
| `ceremony.checkTitle` / `.checkDesc` | Tự kiểm lấy · Hỏi bất kỳ node A1 nào về block tại mốc rồi đọc dấu thời gian của nó. Không có dòng nào ở trang này buộc bạn phải tin suông. |
| `ceremony.resultTitle` / `.resultPending` | Đã ghi được gì · Chưa công bố. Gói vật chứng — mốc, lượng bù đã dùng, lưu lượng nền, ba hash giao dịch, số block, và kết quả đọc ngược byte từ chain — sẽ đăng ở đây sau nghi lễ. |
| `ceremony.resultBlock` / `.resultTimestamp` / `.resultBundle` | Block Adam · Dấu thời gian của nó · Gói vật chứng |
| `ceremony.reachedNote` | Mốc đã qua. Bản ghi chưa công bố ở đây — việc đó chỉ làm sau khi byte đã được đọc ngược từ chain và đối chiếu với vân tay đã đóng băng. |

**3 chuỗi CŨ đã sửa** — *"ba phút" → "năm phút"* (`home.subtitle`, `launch.desc`,
`myChains.revoking`). Căn cứ: phép đo gần nhất **305,5 s đẻ · 293,4 s thu hồi** trên mạng
9 node (`26/08`). Số cũ "~170 s" là thời mạng **5 node**. 🔴 **Không đo lại bằng cách đẻ một
chain thật**: danh bạ còn **4/15 chỗ vĩnh viễn**, đo kiểu đó tiêu 25% số chỗ còn lại để sửa
một câu chữ.

