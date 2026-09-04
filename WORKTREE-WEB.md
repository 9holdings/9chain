# Worktree `web-home` — chỉ làm website a1.9chain.org

---

## HANDOFF — cập nhật 2026-09-04 (tối) — BA LỚP LỖI "KHÁCH THẤY KHÁC MÌNH THẤY"

**TL;DR.** Deploy cuối `6fae9bd`, cây sạch, `version.txt` công khai khớp. Ba việc trong phiên,
đều là *cái David thấy ổn còn khách thì không*: (1) khách **không bấm được nút nào** 28 giờ vì
Cloudflare giữ một **404 `immutable`** cho chunk khởi động React; (2) khách **dùng điện thoại**
không nối được ví; (3) khách xem **tiếng Việt** vẫn thấy tên/mô tả kiểu chain bằng tiếng Anh.

### Đã xong (đều đo trên site sống, không phải chỉ trong repo)

| Commit | Việc | Đo |
|---|---|---|
| `7d56529` | **404 `immutable`**: `next.config` `deploymentId` ⇒ mọi URL mang `?dpl=<sha>` · Caddy `/_next/*` chỉ `immutable` cho 2xx, 4xx/5xx `no-store` · `web-deploy.sh` chép `_next/` trước, cổng gọi **MỌI** tài nguyên + chunk bịa phải 404 không `immutable` | cổng đã **ĐỎ** trên site sống trước khi vá; sau vá: 12/12 tài nguyên 200, chunk bịa `no-store` |
| `142a1c3` | **Điện thoại**: `components/OpenInWallet.tsx` — deep link `metamask.app.link/dapp/<host><path>` mở trang trong app MetaMask; nối vào faucet · launch · my-chains; desktop giữ câu cũ | Browser pane preset mobile: link đúng, câu desktop ẩn; desktop 0 link |
| `8f66214` | **Chữ máy chủ gửi ra**: `lib/serverText.ts` dịch **theo MÃ** (`preset` id, step `code`), mã lạ ⇒ giữ tiếng Anh của server. `presets` (6) + `steps` (3) × 30 ngôn ngữ. Danh bạ nay khoá theo id ⇒ `#type=standard` không đổi theo ngôn ngữ | trên site: VI ra *Thông lượng cao · Phí gần bằng 0 · Tiêu chuẩn*, **0 chuỗi Anh sót**; EN vẫn đúng |
| `6fae9bd` | **Cổng đếm tệp**: lượt xoá rác cũ lọc danh sách **với chính nó** ⇒ chưa bao giờ xoá gì; server ôm 199 tệp cho bản dựng 116 | cổng mới `bản dựng 116 · server 116`, đã thấy ĐỎ ở 199≠116 |

Cổng mới thường trực trong `web-deploy.sh`: mọi tài nguyên HTML tham chiếu · chunk bịa ·
`?dpl=` phải có · **`check-server-text.mjs`** đo dữ liệu danh bạ SỐNG (console ở `main` deploy
riêng, `web/` không thấy nó đổi) · số tệp khớp. Test **176, đỏ 1** — vẫn là vân tay token cũ.

### ✅ David chốt ba mục `2026-09-04` (tối muộn) — `7d26920`

| Mục | Kết quả |
|---|---|
| **1 · Duyệt giọng** | ✅ **ĐÃ DUYỆT** cả hai lô VI: danh bạ (`directory.*` 68 khoá · `home.moreChains` · `home.disclosure`) và lô `04/09` (`common.noWalletMobile` · `.openInMetaMask` · `presets.*` 6 · `steps.*` 3). Lời khai ở đầu `dicts/vi.ts` + cạnh `vi` trong `languages.ts`; 28 bản máy dịch **không đụng tới** |
| **2 · Lên `official`** | ✅ **ĐÃ LÊN** — `71048bc` (fast-forward `663a3e7`), 3 cổng của script xanh. Đo lại độc lập bằng `git ls-tree` trên `FETCH_HEAD`: **0 tệp** `local-net/deploy/` · **0** `DEPLOY-KSGAME` · lời khai duyệt có mặt. `origin` giữ `7d26920` |
| **3 · Deep link** | Đo hết phần máy đo được (xem dưới). 🔴 **Còn đúng một nửa là việc của tay người** |

**Đối chứng lúc duyệt** — không duyệt bằng cách đọc lại chính bảng tài liệu: chữ trong bảng
khớp `vi.ts`; sổ giá trị **11.340 chuỗi/30 ngôn ngữ**, 0 khoá treo; và `home.disclosure` được
duyệt **kèm phép đo cùng ngày** (`check-decentralisation-claim`: 11 validator, 10 connected).
🔴 Lời duyệt đó **không theo mạng**: khách thứ ba stake là câu sai dù chữ không ai đụng.

**Deep link — đo `04/09 16:02Z` trên site SỐNG (trước đây chỉ đo bản dựng cục bộ):**

| Đo | Kết quả |
|---|---|
| 3 trang, UA Android, không ví | `faucet/` · `create-chain/` · `my-chains/` đều ra đúng `metamask.app.link/dapp/a1.9chain.org<path>` |
| đối chứng ngược desktop | **0 link**, giữ câu cũ |
| `metamask.app.link` với UA Android | **307** → `Location: intent://open?…;scheme=metamask;package=io.metamask;end` ⇒ Branch còn sống và đang giao intent mở app |
| với UA iPhone | **307** → App Store `id1438144202`; `apple-app-site-association` **200 JSON** ⇒ máy đã cài app thì iOS bắt universal link trước, không đi tới App Store |

🔴 **Thứ vẫn CHƯA ai đo, và curl không đo được:** intent chỉ mang `link_click_id`, **đường dẫn
`/faucet/` nằm trong dữ liệu Branch chứ không nằm trong intent** ⇒ "app mở lên" đã chắc, còn
"app mở lên **đúng trang** và ví nối được" thì phải **bấm thật trên một chiếc điện thoại có
MetaMask**. Nếu app mở ra trang chủ MetaMask thay vì trang faucet, lỗi nằm ở chặng đó, không
phải ở trang.

### 🔴 Phiên sau / `[human]`

1. **`[human]` bấm thử trên điện thoại thật** — mở `https://a1.9chain.org/faucet/` bằng
   Chrome/Safari trên máy có app MetaMask rồi bấm *"Mở trong app MetaMask"*. Cần biết: app có
   mở đúng `/faucet/` không, và trong app có nối ví được không.
2. Console thêm preset mới ⇒ thêm vào `en.ts` `presets` + 29 dicts, nếu quên thì
   `check-server-text.mjs` chặn lượt deploy.
3. Chuỗi VI viết sau lượt duyệt `04/09` lại là chuỗi **chưa duyệt** — luật `[?]` không bị bãi.

### Gotchas (trả giá thật trong phiên)

- 🔴 **`immutable` là lời khai về NỘI DUNG, không phải về URL.** Gắn theo path là gắn cả lên
  404. Một 404 cache một năm **không tự lành** — chỉ chết khi URL đổi (nên mới cần `?dpl=`).
- 🔴 **"Máy tôi được, máy khách không" = cache.** Đo bằng máy lạ, đọc `Age` + `cf-cache-status`,
  rồi lách cache bằng `?x=` để tách "origin hỏng" khỏi "biên giữ bản hỏng".
- 🔴 **Cổng gọi "một chunk đại diện" không đại diện cho gì** — chunk hỏng là chunk bất kỳ.
- 🔴 **`grep -f /dev/stdin` cuối một ống đọc ỐNG, không đọc stdin của ssh** ⇒ danh sách tự lọc
  chính nó, khớp hết, **xoá 0 tệp, không lỗi nào**. Danh sách phải vào tệp trước.
- 🔴 **Biên dịch có hai nửa: ENUM và CHỮ TỰ DO.** Console dịch `status` (enum) rồi thả `label`
  (chữ) đi thẳng — nửa sau lộ ra người dùng. Chữ máy chủ gửi phải dịch **theo mã**, ở client.
- `?dpl=` làm `check-budget.mjs` tra tệp trượt ⇒ in `js = 0.0` cho mọi trang mà vẫn **xanh**.
  Nay "tệp không có" là ĐỎ. Cùng họ: cổng đếm 0 rồi tuyên bố đạt.
- Ảnh chụp Browser pane hay timeout sau `resize_window`; đo bằng DOM/JS chắc hơn.

### Lệnh hữu ích

```bash
cd web && pnpm build && cd .. && bash local-net/deploy/web-deploy.sh
```

```bash
node web/scripts/check-server-text.mjs https://a1.9chain.org
```

---

## HANDOFF — cập nhật 2026-09-04 (tối) — KHÁCH KHÔNG BẤM ĐƯỢC NÚT NÀO suốt 28 giờ

**TL;DR.** David hướng dẫn khách nhận LOVE9: máy David bấm "Thêm mạng vào ví" được, đổi
Tiếng Việt được; máy khách thì **không có phản ứng gì**. Đo từ ngoài như một khách lạ:
`/_next/static/chunks/main-app-<hash>.js` → **404 text/html · `cf-cache-status: HIT` ·
`Age: 102440`** trong khi origin có tệp (200 khi lách cache). Đó là chunk khởi động React,
nên trang hiện ra đủ chữ mà **không một nút nào có handler**. Máy David chạy vì trình
duyệt của David còn giữ bản tốt (`immutable` một năm); khách thì ăn đúng bản 404 ở biên.

**Vì sao có cái 404 đó:** `web-deploy.sh` xoá sạch `out/` rồi chép — HTML lên trước
`_next/`; một lượt tải rơi vào cửa sổ ấy. **Vì sao nó sống 28 giờ:** Caddy gắn
`Cache-Control: immutable` lên `/_next/static/*` **cho MỌI mã trạng thái** (commit
`b6ac435`, 03/09 07:36Z — cái 404 được cache lúc 03/09 ~08:47Z, đúng lượt deploy đầu tiên
sau đó). **Vì sao cổng deploy xanh:** nó chỉ gọi chunk **ĐẦU TIÊN** trong HTML, chunk đó
có sẵn ở biên. Purge Cloudflare một mình **không cứu được** khách đã mở trang: trình duyệt
của họ cũng đã cache cái 404 đó một năm.

✅ **ĐÃ VÁ + DEPLOY `2026-09-04 13:26Z` — commit `7d56529`**, ba lớp, mỗi lớp có đối chứng:

| Lớp | Gì | Đối chứng |
|---|---|---|
| Next | `next.config.ts` `deploymentId` = SHA 12 ký tự (khớp `version.txt`; cây bẩn thêm dấu thời gian) ⇒ mọi URL tài nguyên mang **`?dpl=<sha>`**, kể cả trong `index.txt` (RSC) và app-router ⇒ **mỗi lượt deploy là khoá cache mới**, bản độc cũ không bao giờ được hỏi lại | `main-app-…js?dpl=7d56529ad9b8` → 200 JS từ máy lạ |
| Caddy | khối `/_next/*`: `immutable` chỉ gắn cho **2xx** qua `handle_response`; **4xx/5xx mang `no-store`**. Đo trước trên Caddy 2.11 + nginx thật bằng Docker (4 ca) rồi mới lên server | chunk bịa: trước `immutable` → sau `no-store · BYPASS` |
| Deploy | `web-deploy.sh`: chép `_next/` **TRƯỚC**, HTML sau, xoá thừa **SAU CÙNG**; cổng gọi **MỌI** tài nguyên HTML tham chiếu (đúng URL, cả `?dpl=`), đòi 200 + content-type; đòi HTML có `dpl=`; đòi chunk bịa **404 KHÔNG `immutable`** | cổng đã được nhìn thấy **ĐỎ trên site sống** vì đúng hai lý do đó trước khi vá |

Kèm: `check-budget.mjs` in `js = 0.0` cho mọi trang ngay lượt build đầu có `?dpl=` (không
tìm thấy tệp ⇒ đếm 0 ⇒ **xanh giả**). Nay bỏ query khi tra tệp và **tệp không có = đỏ**.

Nghiệm thu trên trình duyệt sạch (Browser pane, không cache): React gắn `onClick` vào nút,
bấm "Thêm mạng vào ví" ra *"Không thấy ví trong trình duyệt…"* (pane không có MetaMask —
đúng), mở menu ngôn ngữ chọn English ⇒ `lang=en`, tiêu đề + h1 đổi. `caddy-deploy.sh` báo
✗ cho `testnet-a1.*` 525 — tên cũ đã chết từ trước, không do lượt này.

**Khách cũ chỉ cần tải lại trang** (HTML `no-cache` ⇒ lấy HTML mới ⇒ URL mới). Không cần
purge Cloudflare. Chưa lên `official` — vẫn là quyết định của David (`publish-official.sh`).

### Kèm theo cùng buổi — KHÁCH DÙNG ĐIỆN THOẠI (`142a1c3`, deploy 13:4xZ)

David báo: trình duyệt điện thoại không nối được app MetaMask. Đúng — Safari/Chrome trên
điện thoại **không có `window.ethereum`**, và câu "Cài MetaMask rồi tải lại trang" là ngõ
cụt ở đó. Đường chạy được là ngược lại: mở trang **bên trong app MetaMask** (trình duyệt
trong app có ví). `components/OpenInWallet.tsx`: trên điện thoại không ví ⇒ ghi chú + thẻ
`<a>` thật tới deep link `https://metamask.app.link/dapp/<host><path>` (dựng từ
`window.location`, tính trong effect vì HTML là bản tĩnh). Nối vào faucet · launch · My
chains; desktop giữ câu cũ. Hai khoá mới `common.noWalletMobile` / `common.openInMetaMask`
× 30 (VI chờ duyệt ở cuối `docs/WEB-PROGRESS.md`). Đo trên Browser pane preset mobile
(UA Android, không ví): link = `…/dapp/a1.9chain.org/faucet/`, câu desktop ẩn; desktop: 0 link.
⚠️ Chưa bấm thật trên một chiếc điện thoại có app MetaMask — David thử là biết ngay.

### Gotchas của phiên này

- 🔴 **`immutable` là lời khai về NỘI DUNG, không phải về URL** — gắn theo path là gắn cả
  lên 404. Một 404 được cache một năm không tự lành; nó chỉ chết khi URL đổi.
- 🔴 **"Máy tôi được, máy khách không" = cache.** Đo bằng máy lạ (`curl -A guest`) và đọc
  **`Age` + `cf-cache-status`** chứ không chỉ mã HTTP; rồi lách cache bằng `?x=` để tách
  "origin hỏng" khỏi "biên giữ bản hỏng".
- **Cổng gọi "một chunk đại diện" không đại diện cho gì** — chunk hỏng là chunk bất kỳ.
- `copy_response` của Caddy **tự chép header** upstream; thêm `copy_response_headers` là
  mỗi header lặp đôi. `header … defer` bên trong `handle_response` đè được header nginx.
- Browser pane: ảnh chụp bị phóng to sau `resize_window`; đo tương tác bằng DOM/JS chắc hơn.

---

## HANDOFF — cập nhật 2026-09-04 (chiều) — `/chains/` thiết kế lại cho 108+ L1

**TL;DR.** Trang danh bạ L1 không còn là "mỗi chain một thẻ, đo hết mỗi 10 giây". Nay là
một **danh bạ**: 4 ô tổng kết · thanh công cụ (tìm · trạng thái · loại · gom · sắp) có
trạng thái nằm trong **hash URL** (dán được vào chat) · bảng đặc 24 hàng một trang,
mỗi hàng mở được chi tiết · và một **lượt quét** (pool 4 luồng, đo cái đang trên màn
hình trước, nghỉ 30 s giữa hai lượt). Mọi luật nằm ở `web/lib/directoryModel.ts`
(không React) và được `test/directory-model.test.ts` đo.

✅ **ĐÃ DEPLOY `2026-09-04 12:37Z`** — `2567fb9` (danh bạ) + `30d8c40` (câu tự-tố). Đo lại
độc lập sau deploy: `version.txt` công khai = `30d8c406f4b0 · uncommitted=no` · chunk trang
có `dir-search`/`aria-expanded` · chunk dùng chung `5430-…` có chuỗi mới · mở
`https://a1.9chain.org/chains/` bằng Chrome: 8/8 chain `ĐANG CHẠY`, ô tổng kết 8·8·0·0.
Đã `git push origin web-home` (sao lưu riêng tư). **Chưa lên `official`** — đường duy nhất
là `publish-official.sh`, và đó là quyết định của David.

🔴 **Cổng `check-decentralisation-claim` CHẶN lượt deploy đầu — đúng việc của nó.** Mạng có
**11 validator (10 connected)**: 9 sáng lập một máy OVH + **hai** khách ngoài mỗi khách 81
LOVE9 — khách 03/09 (`DZJum…`) uptime **3%**, offline; khách **mới 04/09** (`NVvk1…`,
`207.148.127.9`) uptime **100%**, đang nối. `home.disclosure` nay *"9 trong 11 … hai còn lại
từ nơi khác, chỉ một đang trực tuyến"* × 30 ngôn ngữ. Cổng chỉ đo SỐ; vế "nhà cung cấp"
vẫn là người kiểm. `info.peers` còn thấy `5.192.123.212` là peer không stake.

### Đã đo trên bản dựng tĩnh với **fixture 108 chain + 12 thu hồi**

| | |
|---|---|
| 10 cổng `postbuild` | xanh · trang nặng nhất `/chains/` **143,9 KB gz** (trần 160, trước 128,1) |
| test | **170/171** — đỏ duy nhất vẫn là vân tay token · thêm 24 ca cho model |
| tìm `adam` | hash `#q=adam` · đúng 1 hàng, `RUNNING · 9 validators` (đo RPC thật) |
| lọc + gom | `#q=adam&status=attention&group=owner` ⇒ "No chain matches" + nút xoá bộ lọc |
| gom theo chủ | 5 nhóm, tiêu đề khai `5 of 20` khi nhóm bị trang cắt |
| di động 375 px | sáng + tối, `scrollWidth == innerWidth` (không tràn ngang), bảng cuộn trong thẻ |
| RTL (ar) | bố cục lật đúng, không sửa dòng nào |
| trang chủ | bảng **9 hàng mới nhất** + "See all 108 chains in the directory" |

**Fixture:** `web/test/fixtures/directory-108.json` = 8 chain thật g1 + 100 chain bịa
(blockchainID giả ⇒ `NOT ANSWERING`, 6 bản thiếu blockchainID ⇒ `UNCLEAR`) + 12 thu hồi.
Xem bằng cấu hình mới **`web-out-108`** trong `.claude/launch.json` — `serve-out.mjs`
nhận `--fixture=<tệp>` (hoặc `A1_DIRECTORY_FIXTURE`) và CHỈ máy chủ đo đọc nó; bản
xuất tĩnh không biết gì.

### Kèm theo, vì cùng chạm một chỗ

- **P-55 XONG** (ký hiệu token của chain con): `web/lib/l1-symbol.ts` chép đúng luật
  fallback của console (`BBWay Chain → BBWAY`, `9S Union → 9SUNIO`, có test ghim), và
  **cả ba** chỗ `addL1ToWallet` (danh bạ · `/my-chains/` · màn "xong" của `/create-chain/`)
  đưa ký hiệu đó thay vì `LOVE9`.
- Phán quyết mới **`mismatch`** (`WRONG CHAIN`): RPC trả lời nhưng `eth_chainId` ≠ sổ.
  Bản cũ in số sai cạnh tên đúng và gọi là RUNNING. Router RPC của kế hoạch 108 L1
  sinh ra đúng lỗi này.
- Hợp đồng dữ liệu `console-chains.json` **mở về phía trước**: mọi khoá đều tuỳ chọn,
  khoá lạ bị bỏ qua — chỗ để console thêm phân công node / trạng thái ngủ đông sau.
- Hai primitive mới trong bộ kit: `Select` (native, có nhãn) và `Chip` (`aria-pressed`).

### 🔴 Phiên sau / `[human]`

1. **`[human]` 46 chuỗi tiếng Việt mới chưa duyệt giọng** (45 danh bạ + câu tự-tố mới) —
   bảng ở cuối `docs/WEB-PROGRESS.md`. 29 bản kia là máy dịch (đã khai). Đang **lên sóng**.
2. **`[human]` có đưa lên `official` không** — `bash local-net/deploy/publish-official.sh web-home`.
3. Khi console ghi thêm khoá (node phục vụ RPC, trạng thái ngủ đông), chỉ cần thêm cột
   ở `ChainRow` + một phán quyết ở `verdictOf`; đừng làm lại bảng.

### Gotchas của phiên này

- **Ảnh chụp Browser pane TRẮNG khi trang đã cuộn** — không phải trang chết (`rows=48`,
  `scrollY=1883` đo bằng JS). Cách đo: `resize_window` cao (1200×2600) để cả trang lọt
  một ảnh, hoặc đọc DOM bằng JS.
- **Khoá gom ≠ nhãn gom.** Khoá chủ sở hữu hạ chữ thường để một ví là một nhóm; nhãn
  phải lấy checksum-case từ bản ghi đầu, nếu không người đọc dán địa chỉ thường vào ví.
- `button[aria-expanded]` đầu tiên trên trang là nút menu của header — hỏi `tbody
  button[aria-expanded]` mới trúng hàng.
- JSON-RPC **batch** (một POST, mảng 2 lời gọi) chạy được trên RPC L1 công khai — đo
  `04/09` trên Adam Chain. Giảm một nửa số request mỗi lượt quét.

---

## HANDOFF — cập nhật 2026-09-04 (site nói đúng thì · repo công khai hết runbook · web/ hết tiếng Việt)

**TL;DR.** Site đã deploy `674a93f`, nói đúng sự thật về validator và đã chuyển
`/re-genesis/` sang **thì quá khứ** (nó nói thì tương lai suốt 3 ngày sau ngày G).
Repo công khai `9holdings/9chain` **không còn mang runbook vận hành** — cả `main` lẫn
`web-home` đã viết lại lịch sử, và có hook chặn push thẳng. `web/` nay **hết tiếng
Việt** (chú thích + chuỗi). Test **142/143** (đỏ duy nhất vẫn là vân tay token).

### Đã xong — đều đo trên mạng thật hoặc clone lại từ Internet

| | |
|---|---|
| **Câu tự-tố** | `home.disclosure` × 30 — **validator thứ 10 là của NGƯỜI NGOÀI** (81 LOVE9, uptime 14,8%, offline). Cả hai bản đã duyệt đều hết đúng: bản cũ nói thiếu, bản trước đó nói quá |
| **`/re-genesis/`** | Chuyển sang khối `rebuildDone` (35 khoá → 17, chung 9 ⇒ **dựng lại thân trang**). Mục bản lưu tự ẩn vì `archiveUrl`/`archiveSha256` còn rỗng |
| **Cổng ngày G** | Hỏng **cả hai chiều**: tìm chuỗi tiếng Việt trên site mặc định tiếng Anh ⇒ vế "phải CÓ" đỏ vĩnh viễn, vế "phải KHÔNG có" **xanh giả**. Nay đọc chuỗi từ `en.ts` |
| **Lát 1d** | **1.731 dòng chú thích / 55 tệp** sang tiếng Anh. Còn 4 dòng cố ý (ví dụ tiếng Việt làm bằng chứng) |
| **Chuỗi `web/`** | **234 chuỗi** chương trình in ra: tên bài kiểm, đầu ra cổng, khoá `version.txt` (`nhanh`→`branch`…). Còn 1 chuỗi cố ý |
| **Repo công khai** | `local-net/deploy/**` + `docs/DEPLOY-KSGAME.md` + mẫu SSH + bảng cấu hình máy **đã gỡ khỏi CẢ `main` và `web-home`**, kể cả lịch sử |
| **Công cụ + hook** | `local-net/deploy/publish-official.sh` (3 cổng tự đối chứng) · mục 4 của `pre-push` dùng chung chặn push thẳng |

### 🔴 Phiên sau bắt đầu từ đâu

1. **`[human]` CHỐT PHẠM VI DỊCH.** Tôi dịch 155 chuỗi trong `local-net/` rồi phát hiện
   **`main` đi trước worktree này 2.973+/8.232− trên 64 tệp `local-net/`** — phiên
   `9chain-a1-c0` đã dịch xong `console/server.mjs` và đổi cả cấu trúc `presets.mjs`
   (`ten:`→`name:`). **Đã hoàn nguyên toàn bộ.** Chọn một:
   - chia phạm vi: họ giữ `local-net/` + tài liệu, worktree này chỉ `web/`; **hoặc**
   - hoà `main` vào `web-home` trước rồi mới làm tiếp.
2. **`[human]` `archiveUrl` + `archiveSha256`** của bản lưu ngày G → dán vào
   `rebuildDone` (30 tệp), mục bản lưu tự hiện. Không phải viết chữ nào.
3. **`[human]` `test/token.test.ts` đỏ** vì 9Scan-A1 đổi bộ chữ (Sora→Manrope,
   Instrument Sans→Inter). Chạy `sync-tokens.mjs` là **đổi bộ chữ của cả site** —
   quyết định thương hiệu, không phải việc dọn dẹp.
4. Deploy gần nhất là `674a93f`; các commit sau đó chỉ đụng công cụ/tài liệu nên
   `web/out` không đổi ngoài `version.txt`.

### 🔴 GOTCHAS — bẫy đã trả giá trong phiên này

- **`set -o pipefail` + lệnh thoát sớm ở cuối ống = cổng nói dối.** Cắn **hai lần**
  trong `publish-official.sh`: `git grep` thoát 1 khi **không tìm thấy gì** (kết quả
  sạch thành lỗi ⇒ cổng chỉ có thể ĐỎ), và `git show … | grep -q` thoát sớm khi
  **KHỚP** ⇒ SIGPIPE ⇒ lượt khớp thành lỗi (cổng tố oan một tệp bình thường).
  ⇒ Ghi ra tệp rồi grep tệp, hoặc `|| true`.
- **Đọc repo tưởng là sự thật.** `local-net/` ở worktree này lạc hậu 8.232 dòng so với
  `main`; chỉ lượt **hỏi console đang chạy** mới lộ ra (nó trả tiếng Anh tôi không viết).
- **Đổi tên đường dẫn phải neo bằng `/` cuối.** `local-net/deploy` khớp luôn
  `local-net/deploy-test/` — 5 báo động giả.
- **`sorted(os.walk(...))` vét hết cây trước** khi `d[:]` kịp cắt ⇒ bộ đếm bò vào
  `node_modules`, báo 40 nghìn địa danh Na Uy là "chuỗi chưa dịch".
- **Cổng đối chứng "mọi blob trùng byte" sai** khi có `--replace-text`: nó *cố ý* đổi
  nội dung. Bất biến đúng: bộ đường dẫn khớp + blob nào khác thì bản gốc phải chứa
  literal đã khai.
- **`info.peers`: đọc `publicIP`, KHÔNG đọc `ip`.** Một nút của ta khai `172.28.0.1`
  (gateway Docker); đếm theo `ip` ra "3 máy", thật ra 9 nút trên **một** máy.
- **Đừng viết ngày tháng vào `home.disclosure`.** Cổng bóc mọi số nguyên rồi lấy
  `Math.max` làm "số validator được khai" ⇒ "3 September" thành lời khai "3 validator".
  Nay cổng từ chối đo nếu gặp tên tháng / năm 4 chữ số.
- **Chuỗi tiếng Việt trong `test/i18n.test.ts` PHẢI giữ** — nó là đầu ra của chính từ
  điển tiếng Việt đang được kiểm, không phải dữ liệu tuỳ ý.

### Lệnh hữu ích

```bash
cd web && npx next build && npm run postbuild     # 10 cổng
bash local-net/deploy/web-deploy.sh               # deploy (4 cổng chặn trước khi chép)
cd web && A1_SAU_NGAY_G=1 node scripts/check-links.mjs   # cổng ngày G, đo site thật
bash local-net/deploy/publish-official.sh <nhánh đích> [ref nguồn]   # ĐƯỜNG DUY NHẤT lên repo công khai
git push origin web-home                          # sao lưu riêng tư (không bị hook chặn)
```

⚠️ `git push official …` **hỏng non-fast-forward** — đó là lưới an toàn, không phải sự cố.

---

## HANDOFF — cập nhật 2026-08-29 (bơm nhịp sống + dọn hai câu nói sai)

**TL;DR.** A1 công khai đang chạy **9 tx/s traffic tổng hợp, có công bố rõ**, dưới
Docker, tự dừng `2026-09-01T00:00:00Z`. Trang chủ có dải băng + trang `/live` (30/30
ngôn ngữ). Câu tự-tố về phi tập trung đã **sai trên mạng** (10 validator, 2 nhà cung
cấp) — đã sửa và đã dựng cổng canh. Test **139/140** (đỏ duy nhất vẫn là vân tay token).

✅ **ĐÃ DEPLOY `2026-08-29`** — David duyệt. `version.txt` = `55d705b8210e` ·
`uncommitted=no` · 40 chunk.

### Đã xong (đều đo trên mạng thật, qua Cloudflare)

| | |
|---|---|
| **Bơm 9 tx/s** | `local-net/faucet/heartbeat-pump.mjs` — mới. Đo: **8,97 tx/s suốt 14,6 phút, 7.841 tx chốt, 0 lỗi**. Chạy dưới container `9chain-a1-heartbeat` (`restart: unless-stopped`) |
| **Công bố** | Dải băng toàn site + [`/live`](web/app/live/page.tsx), **30/30 ngôn ngữ**. `synthetic: true` + **9 địa chỉ gửi công khai** để người ngoài lọc ra được |
| **Câu phi tập trung** | `trangChu.tuTo` — 30 tệp, nội dung mới nói đúng 10 validator / 2 nhà cung cấp |
| **Cổng mới** | `check-decentralisation-claim.mjs` (nối vào `web-deploy.sh`) · `check-heartbeat-stopped.mjs` (nối vào `gday-preflight`, **trên nhánh chờ merge**) |

### 🔴 Ba con số đã đo — đừng đo lại

- **Nhịp block sàn 2,000 giây**, 0 sai lệch qua 28 block liên tiếp. **"Block mỗi giây"
  KHÔNG làm được** trên C-Chain hiện tại (`feeConfig` = null trong genesis ⇒ đây là
  hành vi coreth, không phải nút vặn).
- **~4.500 byte/giao dịch** (9 node + Postgres Blockscout) = **3,5 GB/ngày**.
- Đĩa còn 371 GB ⇒ **đầy sau ~106 ngày**. "Chạy vô thời hạn" **có đồng hồ 3,5 tháng**.
  Không nguy hiểm: bơm tự dừng ở mức đĩa còn 20% trống.

### 🔴 Phiên sau bắt đầu từ đâu

1. **`[human]` MERGE NHÁNH `gday-heartbeat-gate`** (worktree `C:\PROJECTS\9Chain-A1-gday`).
   Chưa merge được vì worktree `main` **đang có việc chưa commit** ở đúng
   `scripts/gday-preflight.mjs` (node10 Hetzner vào genesis, `A1_STAKING_PORT_BASE=9700`)
   \+ `docs/GDAY-NODE10-HETZNER.md` chưa theo dõi. Merge đã đo là **sạch** và nay là
   **fast-forward**. Khi cây đó sạch:
   `git -C C:/PROJECTS/9Chain-A1 merge --ff-only gday-heartbeat-gate`
2. **`[human]` `watch-network` đỏ**: kỳ vọng 9 validator, đo 10 — node D-118/D-119.
   Hằng số chép tay mà thực tế đã vượt qua, **không phải lỗi mới**.
3. **`[human]` drift đỏ**: `9chain-a1-config/console-chains.json` mồ côi. Nó ở
   `.gitignore:25` nên không bao giờ có trong repo, và được khai ở `ignore` — mà
   `ignore` **không** được tra khi phân loại mồ côi. Sửa: chuyển sang `knownExtra`.
   Là lời khai về sổ của David nên tôi báo chứ không tự làm.
4. **Autopilot làm được ngay:** `load-test.mjs` **vẫn mang lỗi lệch nonce** (xem
   Gotchas) — chưa vá, ngoài phạm vi phiên này.
5. Backlog cũ: `docs/WEB-PROGRESS.md`, mục **Đ1-9 · Đ1-7 · Đ1-11b phần 2–3**.

### 🔴 Gotchas MỚI `2026-08-29` — thứ sẽ tốn giờ nếu không biết

- **`load-test.mjs` giết chính nó bằng nonce.** Nó resync bằng `getTransactionCount(…,
  "latest")` = nonce **đã đào**, bỏ qua mempool. Một cú nấc RPC ⇒ mọi ví tua lùi ⇒ coreth
  đuổi khúc giữa ⇒ **thủng lỗ nonce ⇒ tx sau đó node vẫn NHẬN nhưng không bao giờ đào**.
  Đo được: chain đứng im **260 giây** trong khi công cụ in `gửi 1044`, **chốt 0**.
  Chain KHOẺ suốt lúc đó (gửi tay 1 tx ⇒ chốt 4,1s). Phân biệt "chain chết" với "bộ gửi
  chết" bằng **một tx tay** là phép thử rẻ nhất.
- **`df --output=pcent` là GNU, `node:24-alpine` là busybox ⇒ cờ bị từ chối.** Chốt an
  toàn đĩa trong container **chưa từng hoạt động**; mọi lời gọi ném lỗi, và `null` được
  hiểu là "không đo được, đừng dừng". Chỉ lộ ra vì log in **giá trị đo** chứ không in
  đường dẫn cấu hình. Nay dùng `statfs`.
- **`pgrep -af <tên>` khớp CHÍNH LỆNH đang chạy nó.** Vừa báo tiến trình lạ (là chính
  nó), vừa nhét mọi mốc `<<<SECTION` vào output làm hỏng bộ tách mục. Dùng
  `heartbeat[-]pump` (regex và literal bất đồng). Cùng bẫy từng làm `pkill -f` giết
  phiên ssh gọi nó — đã dính **2 lần** trong phiên này.
- **`docker --env-file` KHÔNG bóc dấu nháy.** `X="a b c"` vào container thành `"a b c"`
  kèm nháy. File env viết cho `set -a; . file` phải được shell parse rồi **ghi lại bản
  không nháy** cho docker.
- **`process.exit()` ngay sau `fetch` làm libuv nổ assertion trên Windows** ⇒ shell nhận
  **127** thay vì mã cổng đã chọn. Dùng `process.exitCode`. Nhưng nếu chỉ đặt exitCode
  mà **không `return`**, nhánh đỏ sẽ chạy tiếp xuống dòng thành công và **ghi đè đỏ
  thành xanh** — xanh đúng lúc cổng vừa tìm ra thứ nó sinh ra để tìm.
- **`ignore` ≠ `knownExtra` trong `manifest-deploy.json`.** `ignore` không được tra khi
  phân loại **mồ côi**. Khai nhầm danh sách thì cổng vẫn đỏ.
- **Cổng chạy trên máy dev không được đo máy dev.** Bản đầu của
  `check-heartbeat-stopped.mjs` chạy `docker`/`pgrep` cục bộ ⇒ trên laptop nó in **ba
  dấu ✓ và thoát 0** trong khi bơm đang chạy trên server. Và "không có docker" cho danh
  sách container **rỗng**, đọc y hệt "không có bơm" = PASS. Phải bắt docker **và** cây
  nguồn tự khai có mặt.

---

## Lưu trữ — đợt `2026-08-28` (đều đã lên mạng công khai và đã đo)

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
  Còn: so **DANH SÁCH** chunk lấy từ bản VỪA DỰNG (`js-chunks` hiện chỉ là số
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
