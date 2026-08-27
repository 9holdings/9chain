# LỘ TRÌNH NÂNG CẤP a1.9chain.org
**Ngày lập: 2026-08-27 · Ngày G: 01/09/2026 (còn 5 ngày) · Nguồn: 118 phát hiện qua ba vòng phản biện**

---

## 0. CÁCH ĐỌC TÀI LIỆU NÀY

**Ba đợt, xếp theo THỜI ĐIỂM chứ không theo mức độ:**

| Đợt | Khung thời gian | Nguyên tắc chọn việc |
|---|---|---|
| **Đợt 1 — Trước ngày G** | 27/08 → 31/08 | Chỉ nhận việc thoả MỘT trong ba: (a) đang nói sai sự thật ra mạng công khai, (b) làm mất/nhân đôi tài sản người dùng, (c) sau 01/09 không làm lại được (đường cơ sở quan trắc) |
| **Đợt 2 — Ngay sau ngày G** | 01/09 → ~15/09 | Việc phụ thuộc mạng mới, phụ thuộc 9Scan, hoặc cần một trang mới |
| **Đợt 3 — Nền dài hạn** | sau đó | Việc làm cho lần sau rẻ hơn, không ai đang chảy máu vì nó |

**Quy ước mức tin cậy** (giữ nguyên từ đợt soát, KHÔNG nâng cấp khi gộp):
- **do** — đã đo bằng lệnh, có kết quả
- **suy** — đọc mã ra, hợp lý nhưng chưa quan sát hành vi thật
- **gia dinh** — phỏng đoán, phải đo trước khi làm

**Luật nghiệm thu chung của cả lộ trình:** mọi "điều kiện qua" đều là một lệnh đo NỘI DUNG, không phải mã HTTP; và ở đâu có thể thì kèm **đối chứng ngược** (một phép đo phải ĐỎ nếu việc chưa xong). Dự án đã hai lần trả giá cho cổng chỉ biết xanh (`/moi/` alias; bộ đo a11y xanh trong lúc tương phản dưới chuẩn).

**Cập nhật số liệu ngay đầu tài liệu (đo lại 27/08 khi lập lộ trình):**
- `grep -c '\[?\]' web/lib/i18n/vi.ts` → **41** (không phải 25 như tài liệu theo dõi đang ghi, cũng không phải 40 như bản soát) — **do**
- `web/public/sitemap.xml` vẫn mang `sitemap.org` (thiếu chữ "s") — **do**
- `web/test/` vẫn đúng 3 tệp thuần hàm — **do**

---

## 1. ĐỢT 1 — TRƯỚC NGÀY G (còn 5 ngày)

### Đ1-1 · Một lượt Caddy duy nhất (gộp 7 thay đổi)
**Vì sao.** Ba route không gạch chéo (`/create-chain`, `/my-chains`, `/compare`) trả **404 vỏ Blockscout 75.964 byte** — trong khi `/faucet`, `/re-genesis`, `/chains` thì 301 đúng (**do**). Nút vàng chính của trang chủ trỏ vào `/create-chain/`; ai gõ tay hoặc bị trình rút gọn cắt gạch chéo rơi thẳng vào trang lỗi tiếng Anh của sản phẩm khác. Mọi thay đổi Caddy khác trong lộ trình cũng nên đi cùng lượt này: mỗi lần `caddy reload` là một lần rủi ro, và sai cú pháp là Caddy từ chối CẢ file.

**Làm gì.** Sửa `local-net/deploy/Caddyfile`, `caddy validate` trước, rồi `caddy reload` (KHÔNG `--force-recreate`):
1. `redir` 301 cho `/create-chain`, `/my-chains`, `/compare` → bản có gạch chéo.
2. Thêm `/404.html` vào `@trangmoi` + khối `handle_errors` trả file đó, **đặt TRƯỚC** fallback Blockscout.
3. Thêm `/index.txt` vào `@trangmoi` (bẫy chờ người đầu tiên dùng `next/link` — hôm nay 404 Blockscout).
4. Thêm `/version.txt` vào `@trangmoi` (phục vụ Đ1-11).
5. `header @trangHTML { Cache-Control "no-cache"; defer }` cho các đường HTML — 🔴 **`defer` BẮT BUỘC**, không có nó thì phản hồi nginx ghi đè và phép đo ra y như cũ.
6. `header { X-Frame-Options DENY }` (hoặc `frame-ancestors 'none'`) cho `@trangmoi` + `@trangchu` — **đừng** áp cho gốc `/*`, Blockscout dùng chung máy chủ đó và chưa ai đo nó có phụ thuộc iframe không.
7. `log { output stdout · format json }` cho khối `a1.9chain.org`, kèm `log_skip` trong khối `handle {}` bắt-tất-cả để không nuốt lưu lượng explorer.
8. Giữ query khi 308 `/console/` → `/create-chain/` (mã ở `CreateChainScreen.tsx:64-67` vẫn đang đọc `?ten=`), hoặc gỡ hẳn đoạn đọc đó. Đừng để nguyên cả hai.

**Chi phí.** M (một tệp, nhiều khối, một lượt validate/reload)
**Ràng buộc chạm.** #2 — có **hai** đường mới vào `@trangmoi`: `/404.html`, `/version.txt`. Ngoài `web/` ⇒ cần David đồng ý phạm vi.
**Điều kiện qua.**
```
# 12 phép đo, 6 route × 2 dạng
for p in faucet create-chain my-chains compare re-genesis chains; do
  for u in "/$p" "/$p/"; do curl -o /dev/null -sw "%{http_code} %{size_download} $u\n" https://a1.9chain.org$u; done
done
# bản đúng: <30 KB VÀ chứa chuỗi 9Chain
curl -s https://a1.9chain.org/xyz-khong-ton-tai | grep -c 9Chain   # phải ≥1
curl -sI https://a1.9chain.org/faucet/ | grep -i cache-control      # phải: no-cache
curl -sI https://a1.9chain.org/_next/static/chunks/webpack-*.js | grep -i cache-control  # phải VẪN max-age=14400
curl -s "https://a1.9chain.org/create-chain/?probe=XYZ123" && docker logs 9chain-a1-caddy | grep XYZ123   # phải THẤY
curl -s https://a1.9chain.org/tx/0xdead && docker logs 9chain-a1-caddy | grep 0xdead     # phải KHÔNG thấy
```
**Trước khi reload:** `docker inspect 9chain-a1-caddy --format '{{json .HostConfig.LogConfig}}'` — xác nhận có `max-size`/`max-file` thật. Khẳng định "50MB×5" trong chú thích Caddyfile:163 KHÔNG có gì trong repo chống lưng (**do**: `caddy.compose.yml` không có khối `logging:`). Bật log cả site trên máy đang chạy 9 validator, 5 ngày trước ngày G, mà không giới hạn đĩa là rủi ro không cần thiết.

---

### Đ1-2 · Trang 404 mang thương hiệu 9Chain
**Vì sao.** Mọi URL sai (kể cả `/create-chain` ở Đ1-1) rơi vào vỏ 404 tiếng Anh của Blockscout: `<title>` rỗng, `grep -ci 9chain` = 0, không một `href` nào về site (**do**). Cái đắt nhất đã trả rồi — `web/out/404.html` tồn tại, 20.994 byte, có đủ header/banner/footer; chỉ phần thân còn là chữ mặc định tiếng Anh của Next.

**Làm gì.** Thêm `web/app/not-found.tsx`: thân trang tiếng Việt qua `vi.ts` (khoá mới mang `[?]`), ba lối ra `/`, `/faucet/`, `/create-chain/`. Trang tĩnh thuần, không fetch.
**Chi phí.** S (phần Caddy đã tính ở Đ1-1)
**Ràng buộc chạm.** #8 (chuỗi mới) · phụ thuộc Đ1-1 mục 2
**Điều kiện qua.** `curl -s https://a1.9chain.org/khong-co-gi | grep -c 9Chain` ≥ 1 — đo bằng NỘI DUNG, vì mã HTTP là 404 ở cả hai kịch bản.

---

### Đ1-3 · Duyệt giọng 41 dấu `[?]` + dựng cổng chặn 🔴 CHẶN NHIỀU HẠNG MỤC KHÁC
**Vì sao.** 32 dấu `[?]` đang **hiện ra cho người đọc** trên `/re-genesis/` — gồm H1, mọi H2 ("Cái gì sẽ mất [?]", "Ví của bạn sẽ không báo gì cả [?]") và mọi gạch đầu dòng; dải banner trên mọi trang cũng mang dấu (**do**). Đây là trang bảo người ta "mọi thứ bạn có sẽ biến mất ngày 01/09". Dấu `[?]` sau mỗi câu cảnh báo đọc đúng nghĩa của nó: đội chưa chắc về chính lời mình nói. Mã còn chứng minh đội biết dấu này không được lộ — `re-genesis/page.tsx:27-28` gọi `.replace(' [?]','')` cho metadata mà quên thân trang.

**41 dấu KHÔNG phải 41 việc, mà là 3 quyết định giọng:**
- **Lô (a) — 32 dấu:** toàn bộ `/re-genesis/` + dải banner. **BẮT BUỘC xong trước 01/09.**
- **Lô (b) — ~6 dấu:** một họ duy nhất, câu lỗi ví sinh sau lượt vá `catch {}`. Gộp `deChain.viTuChoi` và `chainCuaToi.themViTuChoi` (**trùng nguyên văn**) thành `chung.viTuChoi`.
- **Lô (c) — ~2 dấu:** giải thích 9 vs 18 chữ số thập phân ở faucet.
- Cộng các chuỗi mới sinh từ chính lộ trình này (404, cảnh báo ví công khai, faucet, landmark…) — duyệt cùng lô (a) nếu thuộc đường ngày G.

**Kèm luôn trong lô (a):** `vi.reGenesis.nhan` đang là **tên landmark** — đo thật cây khả truy cập cho `ASIDE{Sắp sinh lại [?]}`, trình đọc màn hình đọc luôn dấu ngoặc-hỏi.

**Làm gì (phần kỹ thuật, agent làm được).** Thêm chốt CỨNG để không tái diễn: một bước trong `postbuild` grep thư mục `out/` tìm `[?]` và **fail build**. Chốt ở `out/` mạnh hơn test trên `vi.ts` vì nó đo THỨ ĐÃ XUẤT. 🔴 **TUYỆT ĐỐI không cắt dấu lúc render** — làm thế là giấu khỏi mắt David, tức phá đúng cơ chế mà chú thích đầu tệp dựng ra.

**Chi phí.** S (kỹ thuật) + thời gian David (nội dung)
**Ràng buộc chạm.** #8 — đề xuất này KHÔNG bỏ quy ước `[?]`, nó chỉ chặn dấu đi ra sản phẩm
**Điều kiện qua.** `curl -s https://a1.9chain.org/re-genesis/ | grep -c '\[?\]'` → **0**; và `pnpm build` phải ĐỎ nếu cố tình để lại một dấu (đối chứng ngược).
**Cập nhật tài liệu theo dõi:** 25 → 41. Mọi kế hoạch dựa trên con số 25 đang thiếu 60% khối lượng.

---

### Đ1-4 · Trang chủ và /compare/ thôi nói sai về chính mình
**Vì sao.** Đây là ấn tượng đầu tiên, ngay trước ngày G, và hôm nay nó tự bác bỏ mình (**do**, đo 27/08):
- `console-chains.json` → `chains: []`, cả 6 bản ghi đều nằm trong `retired` và đều là chain smoke-test do máy sinh. Trong khi H1 sống trên mạng là "Những L1 này do người dùng đẻ ra" và câu phụ "Mỗi dòng là một chain thật đang chạy trên A1" — hai câu CHỈ TRỎ vào những dòng không tồn tại.
- Nhãn XANH "Mạng đang chạy thật" đứng ngay trên `soL1 = 0` và `Block C-Chain = 4`.
- 9 validator, 9/9 connected — **tất cả trên một máy, một nhà cung cấp** (`139.99.145.13`, cùng máy chạy Caddy + faucet + console). Site không nói dối bằng câu chữ, nhưng để một chỉ số kỹ thuật đúng đứng ở vị trí gợi ra kết luận sai.
- `/compare/` mở đầu bằng "chọn hướng mainnet bằng dữ liệu, không bằng tranh luận" rồi tự đính chính ngay khối dưới; 8/10 tiêu chí là `kienTruc`, và **cả 2 tiêu chí `song` cũng không có số C1**. Dòng "Phi tập trung" chấm A1 5/5 với trọng số cao nhất — mục DUY NHẤT trong bảng mà thực tế triển khai ngược hẳn với điểm.

**Làm gì.**
1. Đổi `trangChu.cTieuDe` từ câu chỉ trỏ sang câu tuyên bố về sản phẩm (đúng ở cả trạng thái đầy và rỗng); hạ câu "Mỗi dòng là một chain thật…" xuống làm chú thích NGAY TRÊN bảng. Hai chuỗi này cũng là `description`/`og:description` của cả site ⇒ sửa một chỗ được cả hai.
2. Chèn `vi.chung.moTaNgan` ("Testnet công khai của 9Chain, chạy trên Avalanche") làm dòng dẫn nhỏ trên `<h1>` — chuỗi ĐÃ DUYỆT, không sinh `[?]` mới — để chữ "A1" có nghĩa trước khi được dùng.
3. Sửa `trangChu.cTrong`: câu hiện tại khẳng định có một chain hệ thống mà bảng không hề hiện.
4. Thêm một dòng dưới `NetworkStats` giải thích block đứng yên: Avalanche không đẻ block rỗng nên "4" là bình thường; phép đo sống/chết là số validator ở ô bên cạnh. Lời giải này **đã tồn tại** ở `MyChainsScreen.tsx:19-21` nhưng chỉ nằm trong chú thích mã.
5. Thêm một dòng tự tố ngay dưới `NetworkStats` (ăn cả trang chủ lẫn `/compare/`): 9 validator chạy trên cùng một máy chủ, cùng một nhà cung cấp — phân tán về giao thức, chưa phân tán về hạ tầng.
6. `ComparisonTable.tsx:29` — đổi `note` dòng "Phi tập trung" thành câu tự tố (`trần giao thức … · A1 HÔM NAY: 9 node, một máy, một nhà cung cấp`). **Không đổi điểm** — đổi điểm là quyết định sản phẩm, phải qua tài liệu.
7. Sửa `bang.moTa` cho khớp khối đính chính bên dưới; bỏ vế "không bằng tranh luận"; ghi thẳng rằng phần C1 hiện chưa có số sống.
8. `TrongRong` (`ui/index.tsx:184-192`): nền khối rỗng **trùng byte** với nền trang ở cả hai chủ đề (rgb 245,247,251 / rgb 10,17,34 — **do**). Đổi `bg-surface-alt` → `bg-surface` + `shadow-card`, giữ `border-dashed`; đổi `<p>` tiêu đề thành `<h2>`; truyền nút "Đẻ chain của bạn" vào prop `hanhDong` thay vì để CTA rời bên dưới.

**Chi phí.** M
**Ràng buộc chạm.** #8 (chuỗi mới `[?]`) — **bị chặn bởi Đ1-3**
**Điều kiện qua.** `curl -s https://a1.9chain.org/ | grep -c "Testnet công khai"` ≥ 1; `grep -c "một máy"` ≥ 1; ảnh chụp trạng thái rỗng đọc như lời mời chứ không như ô trống.

---

### Đ1-5 · Thẻ chia sẻ + sitemap + robots nói đúng
**Vì sao.**
- `og:title`/`og:description`/`twitter:*` **giống hệt nhau trên cả 6 trang** — nội dung của trang chủ (**do**). Dán `/re-genesis/` vào nhóm chat thì thứ hiện lên là lời mời "đẻ chain của bạn mất khoảng ba phút" — NGƯỢC HẲN với điều trang muốn nói, đúng tuần cần nó nhất. Ca "xanh giả" kinh điển: mọi cổng đo `<title>` đều xanh vì title ĐÃ riêng.
- `sitemap.xml:12` khai namespace `www.sitemap.org` (thiếu "s") ⇒ nhiều khả năng Google bỏ qua **cả tệp** (**do**, xác nhận lại hôm nay).
- `robots.txt:4-5` khẳng định "TỆP NÀY HIỆN KHÔNG ĐƯỢC PHỤC VỤ. CLOUDFLARE ĐANG CHE NÓ" — **SAI**: CF **chèn thêm** khối managed rồi **nối** nội dung của ta ở dòng 62-91, đủ cả `Sitemap:`. Luật nghiệm thu tự ghi trong tệp (`head -3` phải thấy "9Chain") **không bao giờ đạt được** ⇒ cổng đỏ vĩnh viễn, sẽ bị bỏ qua, mất luôn khả năng bắt lỗi thật.

**Làm gì.**
1. Mỗi `page.tsx` đã có `metadata`: thêm `openGraph: {title, description, url}` + `twitter: {…}` **dùng lại đúng biến** đã tính cho `title`/`description` (đừng gõ lại chuỗi). Ưu tiên `/re-genesis/`.
2. Test bắt trôi lệch: đọc từng `out/**/index.html`, khẳng định `og:title` KHÁC nhau giữa các trang và `og:url` chứa đúng đường dẫn. Cổng này đáng tin vì **hôm nay nó sẽ ĐỎ**.
3. Sửa một ký tự trong `sitemap.xml` + test `toContain('http://www.sitemaps.org/schemas/sitemap/0.9')`. Làm **một lượt duy nhất** với việc bổ sung `<lastmod>` và thêm URL trang mới nếu có.
4. Viết lại chú thích `robots.txt:4-28` theo phép đo hôm nay; đổi luật nghiệm thu ở cả `robots.txt` và `Caddyfile:356` sang phép đo đúng đại lượng, không phụ thuộc vị trí:
   `curl -sS https://a1.9chain.org/robots.txt | grep -q 'Sitemap: https://a1.9chain.org/sitemap.xml'`

**Chi phí.** S · **Ràng buộc chạm.** khong (metadata tĩnh, ~250 byte/trang)
**Điều kiện qua.** Test og khác nhau xanh; `curl -s .../sitemap.xml | grep -c 'www.sitemaps.org'` = 1; lệnh grep robots mới xanh; sau deploy nộp lại sitemap trong GSC và **chỉ tin khi GSC báo Success**, không tin mã HTTP 200.

---

### Đ1-6 · Luồng đẻ chain thôi nói dối (5 lỗi, gộp một vé)
**Vì sao.** Mỗi lỗi ở đây đều dẫn tới cùng một hậu quả: người dùng bấm lại, và mỗi lần bấm lại là một chain thừa **ăn vĩnh viễn một slot trong trần 15**, giữ luôn tên và chainId.

| # | Lỗi | Bằng chứng | Tin cậy |
|---|---|---|---|
| a | POST bị từ chối trong 0,83 s nhưng màn hình đứng im tới **900 giây** — `choTienTrinhXong` chỉ thoát khi `daThayChay && !running`, mà từ chối sớm thì `daThayChay` mãi false | `wallet.ts:215-237`; đo `POST /console/api/create` với token rác → **401 trong 0,831 s** | **do** |
| b | Nút "Kích hoạt chain" báo thành công lúc **GỬI**, không lúc block 1 mở — `kichHoatChain` trả thẳng mã băm, không có một lượt `eth_getTransactionReceipt` nào trong cả `web/` | `wallet.ts:303-314`; grep `getTransactionReceipt` → 0 | **suy** |
| c | F5 trong 170 giây → về form trống, không dấu hiệu máy chủ vẫn đang đẻ, và form đó **mời đẻ lần nữa** | `CreateChainScreen.tsx:75-94` không đọc `/api/progress`; `server.mjs:1008-1026` cho thấy sự thật vẫn còn trên server | **suy** |
| d | `/api/progress` là bảng **DÙNG CHUNG toàn máy chủ** — hai người cùng lúc là báo hỏng cho một lượt đang thành công | `server.mjs:356-363` một đối tượng `tienTrinh`; `wallet.ts:222-235` không so `kind`/`name` | **suy** |
| e | Bấm nhầm thứ tự hai nút cạnh nhau → câu lỗi tiếng Anh thô `4902 · Unrecognized chain ID…` trên một trang chỉ có tiếng Việt | `wallet.ts:303-313` không bắt 4902; `docLoiVi` xử 4001 và -32601, không xử 4902 | **suy** |

**Làm gì.**
- (a) Thêm `dungSom?: () => boolean`, kiểm ở đầu mỗi nhịp: `if (!daThayChay && dungSom?.()) return cuoi;`. 🔴 **Chỉ dừng khi server TỪ CHỐI DỨT KHOÁT** — tức phản hồi có mã 4xx thật. Muốn vậy `goiConsole` phải phân biệt "server trả lỗi" với "không tới được server" (ném lỗi mang trường `status`). Lỗi mạng/timeout/5xx và MỌI lỗi **sau khi đã thấy `running`** giữ nguyên hành vi: KHÔNG KẾT LUẬN, tiếp tục poll rồi hỏi danh bạ (ràng buộc #10). Hạ `tranGiay` mặc định 900 → **~420** (170 s × 2,5).
- (b) Sau khi có mã băm, poll `eth_getTransactionReceipt` mỗi 2 s, trần ~60 s, phân **ba** trạng thái: `status 0x1` → "Đã kích hoạt — block {n}"; `status 0x0` → lỗi thật; hết giờ không receipt → "Đã gửi giao dịch nhưng chain chưa chốt được block" + trỏ thẳng sang lời giải thích 0-validator đã có ở `vi.ts:271-273`.
- (c) Trong `vao()`, sau `napTrangThai`, đọc một nhịp `/api/progress`. `running && kind==='create'` → `datPha('chay')` và nối lại nhánh kết luận.
- (d) `choTienTrinhXong` nhận thêm `{kind, ten}`, chỉ kết luận khi `t.kind===kind && t.name===ten && !t.running`; đang chạy `name` khác thì coi như "chưa tới lượt". Ở pha `chay` chỉ vẽ `CacBuoc` khi `tienTrinh.name === tenSach`, khác thì hiện "đang xếp hàng sau lượt «{ten}»".
- (e) Bọc lượt switch: `code === 4902` → `themL1VaoVi(...)` rồi thử lại một lần. Thêm nhánh 4902 vào `docLoiVi`.

**Chi phí.** L (nhưng là hạng mục đắt nhất đáng làm nhất trong Đợt 1)
**Ràng buộc chạm.** #10 giữ nguyên (không đổi cách đọc kết quả POST) · #8 (chuỗi mới)
**Điều kiện qua.** Kịch bản tay, ghi lại: (a) sửa token thành rác → màn hình báo lỗi trong <5 s, không phải 900 s; (b) kích hoạt trên một subnet 0 validator → hiện trạng thái thứ ba, không hiện "Đã kích hoạt"; (c) F5 giữa lượt đẻ → quay lại pha `chay` đúng tên chain; (e) bấm "Kích hoạt" trước "Thêm chain" → không thấy chữ `4902` trên màn.

---

### Đ1-7 · Đường ra khỏi phiên ví (hôm nay không có đường nào)
**Vì sao.** Ba ngõ cụt cùng một họ:
- Token SIWE hết hạn → `goiConsole` ném `HTTP 401` → nút "Thử lại" thử lại bằng **chính cái token đã chết, mãi mãi**; `phien` vẫn khác null nên màn đăng nhập không bao giờ vẽ lại. `grep '401|logout|dangXuat'` → **rỗng** (**do** cho grep, **suy** cho hậu quả).
- Không nghe `accountsChanged` (grep `\.on(` toàn `web/` → **rỗng**): ký bằng ví A, đổi sang ví B, màn hình vẫn hiện A như "chủ chain", bấm đồng ý, console ép `admin = A`. Genesis bất biến ⇒ chain vô chủ vĩnh viễn — đúng lớp lỗi mà cả cơ chế SIWE sinh ra để diệt.
- Chuỗi `deChain.doiVi` = "Dùng ví khác" **đã viết sẵn** nhưng không nút nào gọi; `chonVi()`/`dsVi()`/`tenViDangDung()` xuất khẩu ở `wallet.ts` mà **không màn hình nào dùng** (**do**). Câu lỗi `-32601` còn liệt kê "ví khác đang cài: X, Y" rồi để người dùng đứng đó.
- `KHONG_CHON_VI` — mã lỗi nội bộ — **lọt nguyên văn ra màn hình** ở bước ĐẦU TIÊN của cả hành trình.

**Làm gì.** Một đường về chung là `datPhien(null)`:
1. `wallet.ts:181`: `if (r.status === 401) throw new Error('PHIEN_HET_HAN')`. Hai màn bắt tên đó → `datPhien(null)` + dòng `chung.phienHetHan`.
2. Nới `ViTrinhDuyet` thêm `on?()`/`removeListener?()`; effect sau khi có `phien`: `accountsChanged` mà địa chỉ lệch → `datPhien(null)`.
3. Ở **bước soát cuối** (giây cuối trước cửa một chiều), đọc lại `eth_accounts` ngay trước khi bấm `de()` và chặn nếu lệch — đáng một lượt gọi ví.
4. Thêm nút "Dùng ví khác" ở cả hai màn đã đăng nhập — chữ đã có, hàm đã có, chỉ thiếu nút.
5. Chuyển việc đọc lỗi ví về `docLoiVi()` (đã là "MỘT khuôn cho cả site") thay hai bản regex chép tay; thêm nhánh `KHONG_CHON_VI`.
6. Nếu chưa kịp làm ô chọn ví: sửa câu ở `wallet.ts:275` để nói việc người dùng **LÀM ĐƯỢC** ("tắt tạm các extension ví khác rồi tải lại trang") thay vì chỉ liệt kê tên. Một dòng, nên làm trước ngày G.
7. Sửa `chainCuaToi.trongMoTa` nêu khả năng thứ hai: "nếu bạn nghĩ mình có chain, kiểm lại ví đang ký".
8. Xoá 4 khoá `cot*` và `loi.trongRong` không dùng.

**Chi phí.** M · **Ràng buộc chạm.** #8
**Điều kiện qua.** Đổi tài khoản trong MetaMask giữa phiên → màn rơi về "Kết nối ví"; đóng bảng chọn tài khoản → không thấy chuỗi `KHONG_CHON_VI` trên màn.

---

### Đ1-8 · Lưới an toàn mạng: hạn giờ, `r.ok`, log, `allSettled`
**Vì sao.** `grep 'AbortController|AbortSignal|signal:'` → **0 kết quả toàn `web/`** (**do**). Upstream nhận kết nối rồi im (đúng triệu chứng node đang bootstrap) ⇒ trang chủ đập khung xương **mãi mãi**, nút faucet quay vòng xoay vô tận. Dự án đã đặt luật "ba trạng thái, không phải hai" vì "một con số TRỐNG đọc như mạng chết" — nhưng trạng thái thứ ba chỉ tới được khi fetch CHỊU trả lời.
Cộng thêm: `r.ok` không được kiểm trước `r.json()` ở **3 trong 4** chỗ fetch, mà gốc `/` là Blockscout — một SPA trả **200 kèm khung rỗng**; lỗi thật hiện ra là `Unexpected token '<'`, chẩn đoán sai hướng hoàn toàn. Và `console.error` trên toàn `web/` = **0 kết quả**: trường `viSao` được tính ra rồi vứt đi.

**Làm gì (một lượt, cùng bốn dòng `fetch`).**
1. `AbortSignal.timeout()` (API gốc trình duyệt, 0 KB): `stats.ts` 8 s, `ChainTable` 8 s, `FaucetForm` 10 s/30 s, `goiConsole` 15 s. 🔴 **TRỪ `/api/create` và `/api/revoke`** — hai đường đó CỐ Ý để Cloudflare cắt (ràng buộc #10); cho `goiConsole` tham số `hanMs?: number|null` và truyền `null` ở đó.
2. Trích khuôn đọc JSON đã viết rất kỹ ở `goiConsole` (`wallet.ts:170-181`) thành `docJson(r, ten)` dùng chung, gọi từ cả bốn chỗ.
3. `console.error('[9chain] …', e)` trong các catch câm (`stats.ts:80`, `ChainTable.tsx:44`, `FaucetForm.tsx:46`). Không hiện cho người dùng; ai mở DevTools thì thấy — kể cả David kiểm từ xa.
4. `Promise.all` → `Promise.allSettled` ở `stats.ts:60-67`: ba nguồn ở ba dịch vụ khác nhau; container console sập là chuyện độc lập với sức khoẻ mạng. `pha:'hong'` chỉ khi **cả ba** hỏng; ô nào null vẽ `—` kèm `title` nói vì sao (đừng vẽ khung xương — khung xương hứa rằng số sắp tới). Giao diện gần như không phải sửa.
5. Bỏ `moTa=""` ở **bốn** chỗ gọi `<CoLoi>` (`FaucetForm:185`, `CreateChainScreen:178` và `:264` — chỗ 264 còn không truyền `thuLai` nên khối lỗi không có nút thử lại, `MyChainsScreen:180`); mỗi màn một câu "làm gì tiếp"; đẩy `{chiTiet}` xuống dòng phụ có nhãn "chi tiết kỹ thuật". Chuyển câu "kiểm tra đường dẫn console" (`wallet.ts:179`) sang `console.error`.

**Chi phí.** M · **Ràng buộc chạm.** khong (0 thư viện, 0 KB)
**Điều kiện qua.** Chặn `rpc-a1.9chain.org` bằng hosts rồi mở trang chủ → trong ≤10 s thấy trạng thái hỏng có nút thử lại, KHÔNG thấy khung xương đập mãi. Tắt container console → trang chủ vẫn hiện validator + block, chỉ ô L1 là `—`.

---

### Đ1-9 · A11y: những thứ chặn người dùng thật (axe không bắt được)
**Vì sao.** `check-a11y.mjs` chạy axe trên HTML **tĩnh** bằng jsdom và **tắt `color-contrast`** ⇒ về cấu trúc nó không thể thấy: tương phản, trạng thái sau hydrate, vùng chạm, zoom/reflow, thứ tự tiêu điểm, vùng live có thường trú không, `aria-current`. Mọi phát hiện P0/P1 dưới đây nằm ngoài tầm nó — không phải vì viết dở mà vì nó đo một đại lượng khác.

**Làm gì (trước ngày G — phần không phụ thuộc 9Scan):**
1. 🔴 **Menu di động khoá cuộn nền (P0).** Ở viewport 640×400 (= zoom 200% trên 1280×800, đúng cấu hình WCAG 1.4.4 bắt buộc), `body.overflow='hidden'` trong khi ngăn kéo nằm TRONG LUỒNG và không có `max-height` ⇒ **"Danh bạ L1" và "Explorer ↗" nằm ngoài màn, không cuộn tới được** (**do**). Thêm `max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain` vào `#ngan-dieu-huong`; cân nhắc bỏ luôn `useEffect` khoá `body.overflow` — ngăn kéo này đẩy nội dung xuống, không phải modal phủ lên.
2. **Tiêu điểm khi đổi pha.** Mỗi pha đặt `ref` lên `<h2>`, `tabIndex={-1}`, `.focus()` trong `useEffect([pha])`. Áp cho 4 `<h2>` của `CreateChainScreen` và `MyChainsScreen`. ~15 dòng.
3. **Bảng xác nhận "Thu hồi" mọc ở CUỐI trang**, cách nút vừa bấm vài màn hình. Vẽ nó NGAY TRONG `<li>` của chain đang bị thu hồi. Đây là bước dẫn vào thao tác không hoàn tác duy nhất người dùng cuối tự làm được.
4. **`aria-current`: 0 kết quả toàn dự án.** `SiteHeader` đã `'use client'`: đọc `window.location.pathname` trong `useEffect` (không dùng `usePathname` — hợp xuất tĩnh, tránh lệch hydrate), gắn `aria-current="page"` + class trạng thái. ~8 dòng, ~0,2 KB.
5. **Lối tắt bỏ qua điều hướng** trỏ vào `<main>` không nhận tiêu điểm — thêm `tabIndex={-1}` + `focus:outline-none`. Safari/VoiceOver là cặp phổ biến nhất trên di động và ở đó lối tắt hiện không có tác dụng (**suy**, chưa đo trên Safari thật).
6. **Vùng live sinh ra CÙNG nội dung ở 3 chỗ** — và cả ba đều là lời báo **THÀNH CÔNG** (nhận token, chain đẻ xong, thu hồi xong). Luật đúng đã viết ngay trong repo (`CreateChainScreen.tsx:433-436`) và đã áp đúng hai lần; chỉ chưa áp hết. Trích `VungBao` (`role=status aria-live=polite class="empty:hidden"`), gắn **thường trú**, đổ nội dung sau. Thêm một câu khi `pha==='xong'`.
7. **Vùng cuộn ngang** (`ComparisonTable`, `ChainTable`) không nhận tiêu điểm bàn phím: `tabIndex={0} role="region" aria-label`. Bảng trang chủ **không có phần tử focus được nào bên trong** ⇒ người chỉ dùng bàn phím không xem được cột "Chủ chain". Lỗi ngủ: nó sẽ lộ đúng ngày có người đẻ chain đầu tiên.
8. **Lỗi ô nhập dùng `role="alert"`** (ngắt lời) và bật từ ký tự đầu tiên — với lỗi checksum EIP-55 thì ngắt lời nhiều lần liên tiếp. Đổi sang `aria-live="polite"` (lỗi đã nối qua `aria-describedby`) và chỉ kiểm sau `onBlur`.
9. **Ô "gõ lại tên chain" dùng chính tên chain làm placeholder** — biến mất ngay khi gõ ký tự đầu, tức giá trị cần chép mất đúng lúc bắt đầu chép. Đây là rào cản cố ý duy nhất trước thao tác không hoàn tác. Đưa tên vào `moTa` (nối qua `aria-describedby`, không biến mất) + `<ChepDuoc>` cạnh đó.
10. **Hai `<nav>` mang tên khả truy cập SAI** — đo thật: `NAV{Trang chủ}`, `NAV{Mở menu}`. Thêm `dieuHuong.nhanChinh`, `dieuHuong.nhanNgan`.
11. **Tên link logo bị lặp "9Chain Testnet A1 A1"** — `aria-hidden="true"` cho chip `<span>A1</span>`.
12. **Vùng chạm liên kết "Chi tiết" trong dải banner** = 65×20 px, nằm trên MỌI trang và là đường vào DUY NHẤT tới `/re-genesis/`: `py-3` cho khối bọc + `inline-block py-1` cho `<a>`.
13. **Sửa dòng tổng kết `check-a11y.mjs`** từ "✓ axe-core sạch" thành câu nêu rõ đại lượng và liệt kê sáu khoảng mù — để không ai đọc "axe sạch" thành "a11y xong".

**Chi phí.** M · **Ràng buộc chạm.** #8 (vài chuỗi mới) · #7 (component tự viết)
**Điều kiện qua.** Ở viewport 640×400 mở menu, cuộn bằng bánh xe tới được cả 7 mục; Tab từ lối tắt vào thẳng `<main>`; đọc cây khả truy cập thấy `current` trên mục đang mở và hai landmark có tên đúng.

---

### Đ1-10 · Quan trắc & đường cơ sở 🔴 HẠN CỨNG 01/09, KHÔNG VÁ LẠI ĐƯỢC
**Vì sao.** Câu hỏi lớn nhất của tuần — *"đã có người thật nào vào chưa"* — hôm nay **không trả lời được bằng dữ liệu**. Trí nhớ dự án ghi "tới 27/08 chỉ David tự test" như một sự thật, nhưng đó là **gia dinh** không có gì chống lưng. Hai dấu vết bền duy nhất đều **chết vào ngày G**: giao dịch on-chain (reset) và `console-chains.json` (số phận còn treo ở O3b). Faucet không có dấu vết thứ ba — trạng thái duy nhất là `new Map()` trong bộ nhớ. **Bật đo ngày 02/09 thì mãi mãi không biết đường cơ sở là bao nhiêu.**

Điều đo được hôm nay và đáng nâng cấp trong trí nhớ dự án từ *gia dinh* lên **do**: cả 6 bản ghi trong danh bạ đều mang tên máy tự sinh (`SmokeA8ER40`, `WarpNguonD46U`…), `createdAt` gói gọn trong một phiên 53 phút ngày 26/08 của chính David, không một địa chỉ admin lạ nào.

**Làm gì, theo thứ tự rẻ dần:**
1. **5 phút, 0 dòng mã:** David mở dashboard Cloudflare → zone `9chain.org` → Analytics, xem `a1.9chain.org` từ 25/08. Nếu có, câu hỏi lớn nhất tuần được trả lời **cho cả những ngày ĐÃ QUA** — thứ không phép đo nào bật hôm nay làm được (**gia dinh**: chưa ai mở ra xem, tôi không thấy dashboard). 🔴 Dù kết quả thế nào cũng KHÔNG thay thế mục 2: CF chỉ đếm lượt yêu cầu, không nói ai dừng ở bước nào.
2. **Log Caddy** — đã gộp vào Đ1-1. `cf-cache-status: DYNAMIC` cho mọi HTML ⇒ mọi lượt tải đều tới origin, log đếm đủ.
3. **Một dòng ở đầu handler `console/server.mjs:948`** ghi `{ts, method, url-đã-cắt-query, status, ms}`. Console có **một cửa vào duy nhất** và các mốc phễu nằm ngay dưới nó thành từng dòng riêng ⇒ dựng lại được nonce → login → create → chuỗi progress → **điểm rơi**. 🔴 **CẤM ghi query string và body** — `/api/siwe/nonce?address=0x…` mang địa chỉ ví; cắt ở dấu `?` rồi mới ghi. Nằm ngoài `web/` ⇒ cần David mở phạm vi.
4. **Đường cơ sở, chi phí gần bằng 0, làm ngay hôm nay:**
   `curl -s .../console-chains.json > docs/archive/baseline-2026-08-27.json && sha256sum` — cất cạnh mục O2 của kế hoạch ngày G.
5. **Một phép đo phải hỏi vận hành:** `PLAN-REGENESIS:307` chép "3 L1 SỐNG · 43 ĐÃ THU HỒI" ngày 26/08; hôm nay đo ra **0/6**. Hai con số mâu thuẫn. 43 bản ghi `retired` chính là **sổ chống phát lại** mà O3b dựa vào. O3b lo mất sổ SAU ngày G; phép đo này nói sổ **có thể đã mất TRƯỚC ngày G rồi**. Hỏi: `console-chains.json` trên máy chủ (`CFG_DIR`, kèm bản `.bak` mà `server.mjs:173` tự ghi) còn 43 bản ghi không? (**gia dinh** về nguyên nhân — chưa xác định.)

**Chi phí.** S · **Ràng buộc chạm.** ngoài `web/` (mục 2, 3) · **cần D-0xx về riêng tư trước khi bật** (xem §4)
**Điều kiện qua.** Probe ngẫu nhiên xuất hiện trong `docker logs`; probe vào `/tx/` KHÔNG xuất hiện; tệp baseline + sha256 nằm trong repo.
**Khi đọc số:** luôn tách theo `user_agent` và báo **hai** con số bot / không-bot. `robots.txt` đang phục vụ `Allow: /` cho `*`; ở một site mới toanh, bot rất có thể đông hơn người. Báo "40 lượt hôm nay!" mà 38 là Googlebot là dựng lại đúng cái bẫy cũ, chỉ đổi chiều.

---

### Đ1-11 · Quy trình phát hành: hết xoá-trước-chép-sau, có mỏ neo phiên bản
**Vì sao.** Ba lỗ, cùng một họ:
- 🔴 **HTML không mang một chỉ thị cache nào** (không `Cache-Control`, không `ETag`, chỉ `last-modified`) ⇒ trình duyệt áp cache **phỏng đoán** (~10% của Date−Last-Modified), cửa sổ **phình theo tuổi bản deploy**. Ghép với việc máy chủ chỉ giữ **một thế hệ chunk**: HTML cũ trong đĩa → gọi chunk đã bị xoá → 404 → **React không hydrate** → trang hiện ra đầy đủ (vì SSG) nhưng form faucet, nút ví, nút đẻ chain **chết câm**. Và `curl` vẫn 200 vì curl không có cache. (**do** cho header, **suy** cho cơ chế RFC 9111 §4.2.2.) → đã gộp vào Đ1-1.
- **Phép đo "đáng giá nhất" của `web-deploy.sh:99` chọn đúng cái chunk không bao giờ đổi hash.** `head -1` luôn rơi vào `webpack-*.js` — chunk hạ tầng, trùng byte qua các lần dựng. Probe 8 chunk của bản cục bộ: 5 trả 200, **3 trả 404** — và 3 cái 404 chính là `main-app`/`layout`/`page`, tức nhóm đổi theo mã nguồn (**do**). Script được viết ra để bắt "HTML 200 mà chunk 404" đang lấy mẫu ở chỗ lỗi đó không bao giờ xuất hiện.
- **Xoá trước — chép sau, trên đường 360 ms KHÔNG có `rsync`** (`command -v rsync` → không có ⇒ rẽ xuống `scp -r`, không `--delete`, không `--delay-updates`). `web/out` không nằm trong git (`.gitignore:4`). Rớt mạng giữa chừng ⇒ site rỗng **vô thời hạn**, và đường lùi duy nhất là checkout + build + deploy lại — trong khi site đang trả 404 nginx.
- **Không có dấu phiên bản ở đâu cả** ⇒ khối nghiệm thu cuối chỉ chứng minh rằng MỘT bản tự nhất quán nào đó đang chạy: nó tải HTML về rồi rút chunk từ chính HTML đó, nên bản cũ qua bài y hệt bản mới.

**Làm gì (`local-net/deploy/web-deploy.sh`, ngoài `web/`):**
1. Đảo thứ tự: chép vào `out.new` → đếm tệp so với cục bộ → **đổi CỤC BỘ trên server** bằng `rsync -a --delete --filter='P /_next/static/**' out.new/ out/`. 🔴 **TUYỆT ĐỐI không `mv out.new out`** — bẫy inode bind-mount đã cắn 25/08. Lợi ích lớn nhất không phải tốc độ mà là: upload hỏng ⇒ đường lùi trở thành "không làm gì cả". Kiểm trước `command -v rsync` trên **server** (chưa đo).
2. `--filter='P /_next/static/**'` giữ một thế hệ chunk làm ân hạn cho khách đang cầm HTML cũ; dọn `-mtime +3` ở cuối script. Chi phí đĩa thật: 8 chunk, tổng bản dựng 1,8 MB/75 tệp.
3. Kiểm **TẤT CẢ** chunk, lấy danh sách từ `web/out/faucet/index.html` (**bản VỪA DỰNG**, không phải HTML tải về — HTML tải về luôn tự nhất quán với chính nó). Đây là phần quan trọng nhất: nó biến phép đo "có bản nào đó đang chạy" thành "**BẢN TÔI VỪA DỰNG** đang chạy".
4. `out/version.txt` = `<git-sha-ngắn> <ISO-8601>` sinh trong `postbuild`, + `<meta name="a1-build">` (~60 byte/trang). Deploy so chuỗi cục bộ với chuỗi trên mạng, lệch thì `exit 1`. 🔴 Route đã gộp ở Đ1-1; nghiệm thu phải **so chuỗi**, không đọc mã HTTP (Blockscout trả 200 cho mọi đường lạ).
5. Thêm `(cd web && pnpm test)` vào script; cổng chống bản dựng ôi (`out/` cũ hơn mã nguồn thì từ chối); từ chối deploy khi cây làm việc bẩn (hoặc gắn hậu tố `-dirty`). Hôm nay `web-deploy.sh` **không dựng lại, không chạy phép kiểm nào** — ba cổng `postbuild` chỉ chạy khi ai đó gọi `pnpm build`.
6. **`local-net/deploy/check-routes.mjs`** — đọc thư mục cấp một trong `web/out/` + các tệp gốc, đọc `@trangmoi` trong Caddyfile, khẳng định mọi route xuất bản đều có mặt. Gọi NGAY TRƯỚC lệnh chép, cạnh `check-html.mjs`. Đây là bài kiểm rẻ nhất bắt được **sự cố tốn kém nhất từng xảy ra** (`/re-genesis/` 404 THẬT nhiều ngày), và nó bắt TRƯỚC khi phá. Đặt ở `local-net/deploy/` chứ không `web/test/` để giữ ranh giới phạm vi sạch.
7. Thêm `local-net/deploy/web-rollback.sh` = đúng lệnh rsync ở bước 1 chạy ngược từ `out.prev`.

**Chi phí.** M · **Ràng buộc chạm.** ngoài `web/` (David mở phạm vi) · #2 (route `/version.txt`, đã gộp Đ1-1) · #6 (~60 byte/trang, không đáng kể)
**Điều kiện qua.** Cố tình xoá một chunk trên server → script `exit 1` (đối chứng ngược); `curl -s .../version.txt` khớp `cat web/out/version.txt`; `check-routes.mjs` ĐỎ khi tạm bỏ `/re-genesis/*` khỏi Caddyfile.

---

### Đ1-12 · D-web: đưa website vào runbook ngày G 🔴 P0 QUY TRÌNH
**Vì sao.** `PLAN-REGENESIS:60` xếp `web/` vào nhóm **D — "deploy sau ngày G, không mất gì"**. Đúng cho docs và Caddy, **sai cho web**: đo 27/08, **6/6 trang công khai** đang mang dải "Mạng A1 sinh lại ngày 01/09/2026 — mọi chain, số dư và lịch sử… sẽ bị xoá" (**do**). Từ block 1 của mạng mới trở đi, mỗi phút chưa deploy là cổng vào chính thức hứa với người lạ rằng một việc **ĐÃ xảy ra** thì **sắp xảy ra** — trên cả trang faucet lẫn trang đẻ chain. Phân loại sai làm mất quyền được ưu tiên: nhóm D không có giờ, không có thứ tự, không có ai đứng tên.

Nặng hơn: dòng duy nhất nói về trang là `PLAN:325` `9chain-web` — **tên không tồn tại ở đâu** (`grep` toàn repo → đúng một lần, chính dòng đó). Ba tên thật: thư mục `web/`, container `9chain-a1-web`, repo marketing riêng `Web9Chain`. Và `web-deploy.sh` xuất hiện **0 lần** trong PLAN. Cả hai lối đọc `9chain-web` đều dẫn tới cùng chỗ: **không ai được giao chạy `web-deploy.sh` vào 01/09**.

Thêm: `re-genesis/page.tsx:12` nói *"Bản nháp công bố đã viết sẵn — đừng viết lại từ đầu"* — `grep` toàn repo: **không tồn tại**. Người tiếp nhận sẽ đi tìm một tệp không có, rồi phải viết mới hơn chục đoạn văn về mất mát tài sản trong lúc vội, trong khi ràng buộc #8 còn bắt duyệt giọng — mà không ai duyệt giọng được vào lúc đang sinh mạng.

**Làm gì.**
1. **W0 — làm 28/08, không chặn ai:** viết khối **`reGenesisXong`** trong `vi.ts` (khối RIÊNG, không sửa đè `reGenesis` — để bản tương lai còn nguyên tới phút cuối), mọi chuỗi mang `[?]`, đưa David duyệt **trước GO/NO-GO 29/08**. Chừa sẵn `luuUrl` và `luuSha256` mặc định rỗng, trang tự ẩn mục đó khi rỗng — ngày G chỉ phải **dán 2 giá trị**, không phải viết văn. Sửa `re-genesis/page.tsx:12-13` trỏ đúng chỗ thay cho câu đang trỏ vào hư không.
2. **Tách `web/` khỏi nhóm D** thành mục **D-web** có chủ và có mốc, chép vào `docs/NGAY-G-A1-CON-LAI.md` (file A1 thi hành, thắng khi mâu thuẫn):
```
D-web — chủ: David (phiên web-home). Mốc: NGAY SAU khi block 1 mạng mới sống.
  W0  (trước 01/09) reGenesisXong đã commit trên web-home, pnpm test + check-budget xanh
  W1  điều kiện vào: mở https://a1.9chain.org/ tải lại, thấy ĐỦ 3 số ⇒ RPC đã sống
      → cd web && pnpm build
  W2  bash local-net/deploy/web-deploy.sh
  W3  nghiệm thu — ĐỌC NỘI DUNG, KHÔNG ĐỌC MÃ HTTP:
      curl -s .../re-genesis/ | grep -q 'đã sinh lại'   || FAIL
      curl -s .../faucet/     | grep -q 'sẽ bị xoá'     && FAIL   ← đối chứng ngược
  W4  báo 9Scan-A1 qua docs/requests-from-9scan/
```
   Đo ở **hai trang khác nhau** là cố ý: dải banner nằm trong layout gốc, nên một trang đúng mà trang kia còn bản cũ là dấu hiệu `web/out` chép thiếu — đúng bẫy inode mà `web-deploy.sh:78-86` đã phải đi bắt riêng.
3. **Sửa `PLAN:325`** thành tên đo được, tách rõ hai repo (`web/` của 9Chain-A1 ≠ repo `Web9Chain` đội khác).
4. **Thêm điều 8 vào GO/NO-GO:** *"D-web sẵn sàng — `reGenesisXong` đã có và David đã duyệt giọng; `pnpm typecheck && pnpm test` xanh trên `web-home`; O3b đã chốt và đã phản chiếu vào `MyChainsScreen.tsx`."* Bảy điều hiện có không điều nào nhắc `a1.9chain.org`; điều 7 duy nhất chạm web lại trỏ sang repo khác.
5. **Cổng `A1_SAU_NGAY_G=1`** trong `check-links.mjs` (bật bằng biến môi trường để không hỏng các lượt deploy trước ngày G) thi hành đúng hai vế W3. Hôm nay `check-links.mjs` chỉ đo `<title>` khác rỗng — title `A1 sinh lại ngày 01/09/2026` vẫn khác rỗng vào ngày 02/09 ⇒ **xanh trên một trang thì-tương-lai**.
6. **Ghi chú W1 (không sửa mã):** trước khi cả P-Chain lẫn C-Chain nhận RPC, trang chủ vào trạng thái `hong` — **CÓ CHỦ Ý** (`stats.ts:58`); chiều cao block về ~0 cũng đúng. Đừng nhầm là site hỏng. (**suy** — không đo được hành vi sau re-genesis vì mạng mới chưa tồn tại.)
7. **Ghi vào kế hoạch:** danh sách ĐỦ các chỗ phải gỡ banner trong một lượt, kèm `curl -s https://a1.9chain.org/ | grep -c "sinh lại ngày"` phải ra 0. Quyết định "không tự tắt theo đồng hồ máy khách" là ĐÚNG; rủi ro nằm ở chỗ nó chưa thành một mục việc có người và có ngày.
8. **Đưa Multicall3 + CREATE2 deployer vào checklist re-genesis** (xem Đ2-6) — nạp cùng mạng mới thay vì làm hai lần.

**Chi phí.** M · **Ràng buộc chạm.** #8 (khối chuỗi mới — **bị chặn bởi Đ1-3**) · `/re-genesis/*` đã có route ⇒ không cần `@trangmoi` mới
**Điều kiện qua.** Điều 8 có mặt trong GO/NO-GO; khối `reGenesisXong` sạch `[?]` trước 29/08; chạy thử `A1_SAU_NGAY_G=1 node check-links.mjs` hôm nay phải **ĐỎ** (đối chứng ngược).

---

### Đ1-13 · Gói việc rẻ, đúng chỗ đau (mỗi việc ≤ 30 phút)
Gộp làm một vé để không phải mở 15 vé. Tất cả đều **do**, đều S, đều không thêm KB đáng kể.

| Việc | Bằng chứng | Ghi chú |
|---|---|---|
| Trang `/re-genesis/` nhắc "sang trang faucet" **3 lần** mà có **0 `href`** | kiểm kê href = 0 | Chỉ thêm `<a>`, **KHÔNG** chép nút gọi ví sang (luật cũ ở `vi.ts:103-105` đúng, giữ) |
| Chân trang **0 liên kết** — không docs, không hỗ trợ, không explorer | `SiteFooter.tsx` 20 dòng | Dựng 3 cột từ liên kết **ĐÃ CÓ THẬT**; chỗ chưa có trang thì **để trống**, đừng đặt liên kết chết |
| Pha "xong" của đẻ chain là **ngõ cụt**: 3 nút, 0 `<a>`; `chainId`/`rpc` chỉ sống trong state React | grep href = 0 | Thêm liên kết `/my-chains/` + một câu "Thông số này luôn xem lại được ở Chain của tôi" — một câu chữ giải quyết 90% cái giá |
| Bảng L1 trang chủ **không dòng nào bấm được** | href = 0 | "Xem toàn bộ danh bạ →" trỏ `/chains/` |
| Trình thuật 5 pha **không có chỉ báo bước** | `type Pha` 5 giá trị, 1 URL | Chữ thuần "Bước 2/4", 0 KB JS |
| "Năm node restart" — đo thật **9 validator** | `platform.getCurrentValidators` → 9 | Đây là câu DUY NHẤT giải thích vì sao chờ 170 s ⇒ phải đúng. An toàn nhất: **bỏ con số** khỏi câu. Sửa luôn 3 chú thích mã còn ghi "5" |
| Faucet **không nói luật chơi** trước khi bấm; `moTa` hứa "gửi ngay" | `/api/info` trả `amount 10, cooldown 60, perIp 5/1h, global 300` — đã gọi sẵn, **không thêm request** | Hiện "Mỗi lượt {amount} {symbol} · cách nhau {cooldown} giây · tối đa {max} lượt/{windowHours} giờ". **Không cắm cứng số 10** — server là nguồn sự thật |
| Faucet chặn nút chỉ theo `perIp`, **giấu `global`** | `FaucetForm.tsx:103` | `hetSuat = perIp.remaining===0 \|\| global.remaining===0`, và khi cạn vì `global` thì nói đúng nguyên nhân |
| "Bạn đã dùng hết hạn mức" — hạn mức tính theo **IP**, không theo người | `perIp` trong kiểu dữ liệu, 0 chuỗi nêu chữ IP | Người dùng 4G/quán cà phê/VPN thấy 0/5 dù chưa từng xin. Đổi sang "Đường mạng này đã dùng hết…" |
| Nút phụ trang chủ "Nhận token thử **trước đã**" dạy một thứ tự **không có thật** | luồng đẻ chain không đọc số dư ở đâu cả | Bỏ "trước đã". **HOÃN** mọi mệnh đề về chi phí tới khi console xác nhận genesis alloc |
| Địa chỉ ví chủ chain **công bố vĩnh viễn** mà lúc đẻ không ai được báo | 4 địa chỉ đang phơi trong `retired`; sitemap `Allow: /` | Một dòng ở **bước SOÁT LẠI** (cửa một chiều): "Địa chỉ này sẽ hiện công khai trong danh bạ L1 và ở lại đó kể cả sau khi bạn thu hồi chain" |
| Lời khuyên hậu ngày G quan trọng nhất chỉ là **gợi ý**, không phải quy trình | `reGenesis.imLang1` không nói xoá ở ĐÂU | Viết đường đi cụ thể MetaMask (Cài đặt → Nâng cao → Xoá dữ liệu tab hoạt động) + một câu rằng ví khác có chỗ tương đương tên khác (site cố ý không độc quyền MetaMask). **suy** |
| Hai trần **15 và 16** đứng cạnh nhau không giải thích; "15" **chép cứng** vào từ điển | `vi.ts:201`, `vi.ts:291` vs `tt?.tran` | Bỏ số khỏi `thuHoiY4` hoặc nội suy `{tong}`; thêm nửa câu: một trong 16 chỗ là của chain hệ thống |
| Giá trị **RPC không nằm trong HTML tĩnh** — thông số quan trọng nhất với dev là thứ duy nhất không xem-nguồn được | ô RPC là skeleton trong `curl` | `useState(rpcCChain())`: khi render tĩnh `window` undefined ⇒ trả `https://rpc-a1.9chain.org/...`, **không** localhost ⇒ luật cấm ở `chain.ts:4-12` không bị vi phạm. Giữ `useEffect` ghi đè cho dev |
| `blockchainID` API trả về nhưng **bị bỏ** ở cả hai màn Next (trang `/chains/` cũ thì có) | `KetQua` khai nó, màn xong không render | `<ChepDuoc>` ở màn xong + thẻ chain. Bản Next đang **thụt lùi** so với thứ nó sẽ thay thế |
| Không đường nào tới **xác minh hợp đồng** — dù Blockscout v9.0.2 + `/contract-verification` đang chạy **cùng tên miền, miễn phí** | đo 200 | Một dòng vào khối "Thông số mạng" sẵn có. Không cần trang mới, không cần route |
| Không `preconnect` tới `rpc-a1.9chain.org` — 3 số trang chủ hiện sau ~1,3 s, trong đó ~270 ms chỉ là bắt tay | tcp 135 + tls 134 ms | Một dòng `<link rel="preconnect">` trong `layout.tsx` |
| `⧉` (U+29C9) làm nút **sao chép** — ký hiệu toán học, độ phủ ngoài Windows chưa đo | đo Windows: 16,07 px, không notdef | SVG nội tuyến ~150 byte, `aria-hidden`, `fill=currentColor`. **suy** cho phần đa nền |
| `role="alert"`, log lỗi, `moTa=""` | — | đã gộp Đ1-8 |
| Chuỗi bị **nối với biến ngay trong JSX** | `ComparisonTable.tsx:143` | `dien(vi.bang.dangDan, {ben})` — hàm `dien()` đã có và đã có test |
| Mục "Nhật ký mạng" trong `/re-genesis/` | trang hứa "sẽ đổi ngày trên TRANG NÀY thay vì im lặng" | Danh sách ngày + một dòng; mục đầu "27/08: ngày G vẫn là 01/09". Biến lời hứa thành chỗ có dấu vết kiểm được. Không cần route mới |
| Hộp ký MetaMask hiện `URI: .../console` trong khi người dùng đứng ở `/create-chain/` | `console/server.mjs:66` | Nếu đã đặt cược vào việc người dùng ĐỌC hộp ký thì dòng URI trỏ vào đường đã 308 là làm hỏng chính vụ cược đó. **Ngoài `web/`**, đi thành thay đổi riêng |

**Chi phí gói.** M tổng cộng · **Điều kiện qua.** Từng dòng có phép đo riêng; tối thiểu: `curl -s .../faucet/ | grep -c 'rpc-a1'` ≥ 1, chân trang có ≥ 4 `href`, `/re-genesis/` có ≥ 2 `href`.

---

## 2. ĐỢT 2 — NGAY SAU NGÀY G

### Đ2-1 · Thi hành D-web + O3b
Chạy W1→W4. Song song, thi hành nhánh O3b đã chốt. **Khuyến nghị: nhánh (a) CÓ SỬA**, không phải (a) nguyên xi — vì cả hai nhánh nguyên bản đều làm giao diện nói sai:

| Nhánh | Hệ quả đo được từ mã |
|---|---|
| (a) giữ nguyên tệp | `stats.ts:73` in `soL1 = N` cho N chain không tồn tại; `ChainTable` liệt kê chúng kèm `rpc` trỏ vào blockchainID đã bốc hơi; `/my-chains/` cho người cũ thấy chain của họ ở cột **đang sống** |
| (b) bỏ sổ | `/my-chains/` rỗng trơn không một chữ giải thích, VÀ mất chống phát lại |
| "dọn" sang `retired` | `MyChainsScreen.tsx:324` dán nhãn **"đã thu hồi"** — người dùng không thu hồi gì cả |

**Đề xuất (a)-có-sửa:** chuyển `chains` → `retired`, gắn khoá **MỚI** `xoaBoiReGenesis: <epoch ms>` (đừng dùng `thuHoiLuc` — nghĩa khác). Chống phát lại giữ nguyên, `chains = []` ⇒ trang chủ in 0 và `ChainTable` ra `TrongRong` đúng. Phía `web/`: phần tử có `xoaBoiReGenesis` thì thay nhãn bằng nhãn riêng ("mất khi mạng sinh lại 01/09 — không phải bạn thu hồi") + liên kết `/re-genesis/`.
Nếu David chốt (b): phải kèm bước web KHÁC — `ChainTable.tsx:41` hiện đối xử `chains` **thiếu** và `chains: []` **y như nhau**, cần phân biệt "danh bạ rỗng" với "danh bạ mất".
**Chi phí.** M · **Chặn bởi:** quyết định O3b (§4) và Đ1-12 W0

### Đ2-2 · Cụm font B1+B2 🔴 CHỜ 9SCAN CHỐT BỘ CHỮ
**Vì sao đây là quyết định ~130 KB, không phải "ăn gần hết phần dư".** `check-budget` in `[font ≤ 144,3 KB / 9 tệp]` cho mọi trang; hôm nay **1 trong 9** tệp thật sự được tải. Bảy tệp còn lại bật lên ngay khi B1 nối được biến. Và một chi tiết làm hẹp đường lui: ba weight của Sora trỏ **CÙNG hai URL**, ba weight của Instrument Sans cũng vậy — font variable, nên **giảm số weight không giảm một byte nào**. Chiều giảm duy nhất là đổi bộ chữ hoặc **bớt hẳn một họ**.

**Gửi 9Scan một ràng buộc bằng SỐ, không bằng tên:**
1. Bộ chữ **phải có subset `vietnamese` thật** — khi đó tải `latin` + `vietnamese` (tệp vietnamese nhỏ; JetBrains Mono chỉ 5.872 B) thay vì `latin` + `latin-ext` mà vẫn thiếu dấu.
2. **Trần cho toàn bộ font ≤ 45 KB/trang** ⇒ thực tế là **hai** họ chữ, không phải ba. Cân nhắc dùng cùng bộ cho tiêu đề và thân, đổi bằng weight.
3. Sau khi vá: xác minh `<link rel=preload as=font crossorigin>` có sinh ra không — HTML đã xuất hiện có **0 thẻ** (`grep 'as="font"'` trên 8 tệp = 0), nên font chỉ được phát hiện sau khi CSS tải+parse xong.
4. **Chốt bộ biểu tượng TRONG CÙNG LƯỢT**: hiện ☾ ☀ ☰ ○ ◐ giải qua ngăn dự phòng vì ba font thương hiệu đang chết; sau B1 trình duyệt sẽ tra chúng trong webfont mới TRƯỚC, không thấy, rồi rơi từng ký tự sang font ký hiệu hệ thống ⇒ **diện mạo đổi thêm một lần nữa**. Thay bằng SVG nội tuyến. (Riêng ☾ vs ☀ lệch **2,4 lần** bề rộng ở cùng một nút 40×40 — 9,13 px vs 21,97 px, **do**.)

**Chặn bởi:** 9Scan chốt bộ chữ · Đ3-2 (sửa `check-budget`) phải xong TRƯỚC, nếu không quyết định KB dựa trên con số sai.
**Điều kiện qua.** `node scripts/check-budget.mjs` xanh **sau** khi đã sửa hệ số CF; và đo lại bằng Resource Timing trên site thật, không tin riêng script.

### Đ2-3 · Token tương phản (qua 9Scan → sync) + cổng kiểm tương phản độc lập
Hai vi phạm AA đo được, **chỉ ở bản sáng** (bản tối ổn):
- `--color-danger #e5484d` trên trắng = **3,91:1** (ngưỡng 4,5). Nơi dùng: **thông báo lỗi dưới mọi ô nhập**, gồm ô địa chỉ faucet và ô "gõ lại tên chain" ở màn thu hồi. Chữ khó đọc nhất trên site lại đúng là chữ nói cho người dùng biết họ vừa làm sai.
- `--color-line-strong #c9d2e4` trên trắng = **1,52:1**, ngưỡng SC 1.4.11 là **3:1**. Và ô nhập **cùng màu nền** với thẻ chứa nó ⇒ viền là dấu hiệu DUY NHẤT của ô. Trên màn thu hồi, ô đó là thứ duy nhất đứng giữa một cú bấm và việc giết một chain.

**Làm gì.** Một lượt đổi ở 9Scan-A1, một lượt `sync-tokens.mjs`: thêm `--color-danger-ink` (#cf2f36 → 5,11:1 / 4,76:1) và `--color-line-control` (#767f96 → 4,00:1 / 3,73:1; bản tối #5a6a9c → 3,20:1 / 3,56:1). **Không đụng `--color-line-strong`** (nó còn dựng nhiều viền trang trí — đổi hết là quyết định thẩm mỹ). Đổi class ở đúng 4+3 chỗ. 🔴 **TUYỆT ĐỐI không sửa tay `app/tokens.css`** (có vân tay `535cbf6329efb6d0`).
**Kèm:** thêm phép kiểm tương phản **độc lập, không cần layout** vào `check-a11y.mjs` — đọc `tokens.css`, tính tỉ lệ cho một bảng cặp (chữ, nền) khai tường minh, ĐỎ khi dưới ngưỡng. **Cổng đó sẽ ĐỎ NGAY HÔM NAY** với cả hai token trên — tức một cổng đã từng đỏ, thứ duy nhất đáng tin. 0 phụ thuộc mới.
**Chi phí.** M · **Chặn bởi:** lịch của 9Scan (ràng buộc #3)

### Đ2-4 · Một trang `/builders/` duy nhất 🔴 CẦN THÊM ROUTE `@trangmoi`
Site hôm nay **không có trang nào cho nhà phát triển**; `grep hardhat|foundry|solidity|viem|verify|abi` toàn `web/` → **0**. Nhãn dẫn tới nơi duy nhất có RPC là "Nhận token thử" — không có từ nào gợi ý thông số kỹ thuật nằm sau nhãn đó. Đối tượng David nhắm gần như chắc chắn cũng là người viết hợp đồng: họ đẻ chain xong rồi mới cần deploy lên nó.

**Gom TRỌN cụm dev vào MỘT trang, MỘT dòng route** (đừng mở `/builders/`, `/docs/`, `/minh-bach/` thành ba trang):
- Bảng thông số chép-được: RPC HTTP + WSS, Chain ID thập phân + hex, ký hiệu, thập phân, gas + block gas limit **kèm NGÀY ĐO**
- `networkID 9001` giải thích: `net_version` trên C-Chain trả **`9000000009`**, KHÔNG phải 9001 — dev EVM thấy hai số cạnh nhau trong một dòng mono sẽ hợp lý mà cấu hình sai. Cân nhắc **bỏ hẳn** `networkID` khỏi chân trang (chân trang không phải chỗ dạy học) và giải thích ở đây
- Ba khối mã (hardhat, foundry, viem `defineChain`) qua component `<Ma>` tự viết
- **Hợp đồng hệ thống**: Multicall3 (`0xcA11…`), CREATE2 deployer (`0x4e59…`), Permit2 — cả ba `eth_getCode` → **`"0x"`**, tức KHÔNG tồn tại (**do**). `viem`/`wagmi` gọi multicall vào đúng địa chỉ đó; `forge --create2` gửi vào địa chỉ trống → giao dịch **không làm gì cả, không revert — hỏng câm**. Nói THẲNG là chưa có, kèm ngày đo. Nói thẳng khi thiếu vẫn rẻ hơn để dev tự đâm vào
- Bảng "RPC hỗ trợ gì / KHÔNG hỗ trợ" (`debug_*` tắt)
- Xác minh hợp đồng + snippet `hardhat-verify` / `forge verify-contract --verifier blockscout`, và làm rõ site có **hai explorer với hai vai** (9Scan để xem, Blockscout để xác minh + API)
- **Bốn mục minh bạch** (thay cho một trang `/minh-bach/` riêng): ai vận hành + liên hệ; dữ liệu thu thập (faucet ghi **IP**, địa chỉ ví lên danh bạ **vĩnh viễn**, `localStorage` cho theme, không analytics bên thứ ba do dự án cài — 🔴 đối chiếu tình trạng beacon Cloudflare trước khi viết câu đó, kẻo thành một câu sai); điều khoản ngắn (token không giá trị, mạng có thể sinh lại); kênh báo lỗi/bảo mật
- Thêm mục vào nav + sitemap

**Chi phí.** L · **Ràng buộc chạm.** 🔴 #2 (route) · #6 (đo lại budget SAU khi Đ3-2 sửa hệ số) · #8
**Chặn bởi:** kênh liên hệ thật, pháp nhân (§4); mục "ai vận hành" và "báo lỗi" **chỉ viết khi David cung cấp thật** — ba mục còn lại viết được ngay.

### Đ2-5 · Khối "Chain của bạn — điều cần biết" ở màn xong
Dùng `LuuY` sẵn có, nói **hai điều ĐÃ BIẾT CHẮC**: L1 này chưa có block explorer (dùng RPC/`cast`), và không có faucet riêng cho nó. 🔴 **TUYỆT ĐỐI không viết gì về số dư/gas ban đầu** cho tới khi console xác nhận genesis alloc — genesis bất biến, một câu sai ở đây không rút lại được. Nếu genesis KHÔNG cấp sẵn tiền cho admin thì nút "Kích hoạt chain" sẽ hỏng, và câu lỗi lúc đó không đủ để người ta hiểu vì sao.

### Đ2-6 · Multicall3 + CREATE2 deployer (ngoài `web/`)
🔴 **Đừng deploy trước 01/09** — sẽ bị xoá. Trước ngày G chỉ ghi vào **checklist re-genesis** để chúng sinh lại cùng mạng mới (gas ở đây 1-2 wei ⇒ chi phí ~0). Sau ngày G: deploy, rồi cập nhật mục "Hợp đồng hệ thống" ở Đ2-4.

### Đ2-7 · Hợp nhất explorer (chờ quyết định)
Trên `a1.9chain.org`: `/tx/0x0` → **200**, `/blocks` → **200** (Blockscout, tiếng Anh, không liên kết nào về 9Chain), không có trong điều hướng nên chính thức "không tồn tại" — nhưng liên kết cũ và thói quen `/tx/<hash>` dẫn tới. Nếu chốt 9Scan là explorer chính thức: Caddy 301 `/tx/*` `/address/*` giữ nguyên đuôi. 🔴 **Phải ĐO trước** rằng 9Scan phủ được hai đường đó bằng dữ liệu thật — đừng chuyển hướng vào chỗ trống — và **giữ Blockscout cho xác minh hợp đồng**.

### Đ2-8 · Đăng ký `ethereum-lists/chains` (ngoài `web/`)
chainId `9000000009` **không có** trong `chains_mini.json` (2.723 chain, **do**) ⇒ chainlist.org, `viem/chains` và nhiều ví không tự nhận ra A1. D-047 giữ chainId qua ngày G ⇒ **bản đăng ký làm hôm nay vẫn đúng sau 01/09**. Nhưng registry đòi RPC công khai ổn định ⇒ **chuẩn bị nội dung PR từ giờ, gửi sau khi mạng mới đứng vững**.

### Đ2-9 · Điều kiện trước khi gỡ `/chains/`
🔴 **GHI VÀO `DECISIONS.md` như một điều kiện, không phải một vé làm.** Trang `/chains/` "lạc hệ nhận diện" hiện là **bề mặt dev TỐT NHẤT của site**: có `chainId` hex, `blockchainID`, RPC, nút thêm ví, tự gọi `eth_chainId` kiểm RPC sống, tự đếm validator để phân biệt "KHÔNG PHẢN HỒI" với "KHÔNG CHỐT ĐƯỢC BLOCK". Bảng trang chủ chỉ có 3 cột. **Không được gỡ** cho tới khi bản Next có đủ ba thứ đó. Trước khi công bố thông số ví cho L1 người dùng: hỏi đội xác nhận **ký hiệu token gas của từng preset** — cả `/chains/` lẫn `wallet.ts:295` đều cắm cứng LOVE9/18 cho MỌI L1.

### Đ2-10 · Cloudflare: brotli + `immutable`
- Trình duyệt nhận **gzip** cho 120 KB JS trong khi CF **thừa sức trả brotli** (`Accept-Encoding: br` một mình → `br`; hễ danh sách có gzip là nó chọn gzip). Đo: 126,2 KB gzip vs **107,3 KB brotli-11** (−14,9%); so với gzip CF thật (yếu hơn gzip Node) thì tiết kiệm ~18%, riêng `607-*.js` −10 KB. **~20 KB trên MỖI lượt tải đầu, cho mọi người dùng, không đổi lấy rủi ro nào** — bằng đúng khoảng dư dưới trần.
- `/_next/static/*` mang **băm nội dung** nhưng chỉ `max-age=14400` (do **Cloudflare** đặt — chứng minh được: container là `nginx:alpine` nguyên bản không mount conf, và `/robots.txt` do CF tự sinh cũng mang đúng 14400). Người quay lại sau 4 giờ phải revalidate 9 tệp trước khi trang vẽ được. Thêm Cache Rule cho `/_next/static/`: Edge + Browser TTL 1 năm. **KHÔNG áp cho `/brand/*`** (tên cố định, ảnh có thể thay).
**Nghiệm thu.** `curl -H 'Accept-Encoding: gzip, deflate, br, zstd' … | grep -i content-encoding` phải ra `br`; header chunk phải có `immutable` và `max-age=31536000`.
*(Có thể kéo lên Đợt 1 nếu David vào dashboard sớm — rủi ro thấp, lợi ích rơi đúng lượt xem dồn ngày G.)*

---

## 3. ĐỢT 3 — NỀN DÀI HẠN

| # | Hạng mục | Vì sao | Chi phí |
|---|---|---|---|
| Đ3-1 | **`useDanhBa()` gộp fetch trùng** — danh bạ tải **2 lần** mỗi lượt mở trang chủ (đo: cặp request cùng mốc thời gian, không phải StrictMode); `/api/progress` bị **hai vòng đọc song song** (~170 request thay vì ~85 mỗi lượt). Hai bản chép là chỗ hai bên bắt đầu trôi lệch — `ChainTable` đọc `j.chains`, `useSoLieu` đọc `danhBa.chains.length`, hai ảnh chụp hai thời điểm | M |
| Đ3-2 | **Sửa `check-budget.mjs`** 🔴 nên làm SỚM (chặn Đ2-2): script báo **128,1 KB**, dây thật **147,2 KB** (+14,9%) — do (a) 13,7 KB font Outfit script cố ý không đếm, (b) gzip CF yếu hơn gzip Node ~4%. Chú thích dòng 41-52 khẳng định "con số thật là 0 KB" và "ba bộ chữ không chạy ở đâu cả" — **KHÔNG còn đúng**: commit BrandLockup nạp font thứ TƯ (Outfit) qua `.style.fontFamily`, không qua `:root` nên không dính bẫy, và nó tải trên MỌI trang. Phần dư thật là **12,8 KB**, không phải 31,9. Sửa chú thích, đưa font ĐÃ ÁP vào phần bị chặn, cộng hệ số 4% hoặc hạ trần nội bộ xuống 150 KB. Ghi thêm mục **"sàn khung"**: react-dom 53,1 + router 45,4 + 7,7 + webpack 1,7 ≈ **108 KB không thương lượng được**, mã dự án chỉ **4,6%** | M |
| Đ3-3 | **Đa ngữ** — 🔴 ĐÍNH CHÍNH: đo 27/08, `a1.9scan.org` trả `<html lang="en">`, `og:locale=en_US`, `/en/` và `/vi/` đều **404**. **KHÔNG quan sát được 30 ngôn ngữ** trên bản đang chạy. Điều đo được: hai site cùng hệ **lệch ngôn ngữ mặc định**. Việc duy nhất bây giờ: hỏi 9Scan dạng đường dẫn locale (`/en/` hay `?lang=`) để A1 khai `hreflang` trỏ chéo đúng, và ghi vào `DECISIONS.md` rằng A1 cố ý một ngữ, xem lại sau 01/09 | S |
| Đ3-4 | **Đo lại validator** — số validator của chain đo **một lần rồi đóng băng cả phiên**; chain vừa đẻ có tập rỗng ⇒ nhãn cảnh báo vĩnh viễn dù validator được thêm vài phút sau. Thêm nút "Đo lại" (xoá khoá subnet khỏi `vld` là effect tự chạy) hoặc mốc "đo lúc HH:MM". **Đừng poll tự động** | S |
| Đ3-5 | `prefers-reduced-motion` biến `VongXoay` thành vòng cung đứng im — trông như biểu tượng hỏng. `motion-reduce:animate-none` + border đặc, hoặc `motion-reduce:hidden` để chữ nút gánh | S |
| Đ3-6 | `rel="noreferrer"` → `noopener` cho 4 liên kết sang 9Scan — hai site là một hệ và cùng cần biết lưu lượng chảy hướng nào; đây là dữ liệu để quyết A1 hay C1 lên mainnet. Ghi chú ngay đó vì sao khác, để lần sau không ai "dọn dẹp" cho đồng bộ (**suy**) | S |
| Đ3-7 | Mốc phễu phía client (`sendBeacon` tự viết, <0,5 KB) cho hai mốc không tầng máy chủ nào thấy: "nối ví", "bấm Kích hoạt". 🔴 **CẦN ROUTE** `handle /e/* { respond 204 }` đặt TRƯỚC `handle {}` — thiếu nó thì rơi xuống Blockscout, mà Blockscout trả **200 kèm khung rỗng** ⇒ beacon "thành công" trong khi không gì được ghi. 🔴 Đường dẫn CHỈ mang tên mốc: cấm ví, tên chain, chainId | M |

---

## 4. VIỆC CẦN DAVID QUYẾT

Agent không tự quyết được. **Xếp theo mức độ CHẶN**, không theo độ khó.

| # | Câu hỏi | Chặn cái gì | Hạn nên có |
|---|---|---|---|
| **D1** | **Duyệt giọng 41 chuỗi `[?]`** — ba lô: (a) 32 dấu reGenesis+banner, (b) ~6 dấu họ lỗi ví, (c) ~2 dấu thập phân, cộng chuỗi mới sinh từ lộ trình này | 🔴 Đ1-2, Đ1-4, Đ1-12 W0, và mọi việc sinh chuỗi. **Lô (a) là điều kiện của ngày G** | **28/08** |
| **D2** | **Kênh liên hệ THẬT là gì** — email dự án / GitHub issues / Telegram? | Đ1-13 (chân trang, `faucet.themMangLoi`), Đ2-4. **Không có câu trả lời thì KHÔNG LÀM — tuyệt đối không bịa địa chỉ** | 28/08 |
| **D3** | **Cho phép sửa ngoài `web/` không?** `local-net/deploy/Caddyfile`, `web-deploy.sh`, `console/server.mjs` | 🔴 Đ1-1, Đ1-2, Đ1-10, Đ1-11 — tức phần lớn Đợt 1 | **27/08** |
| **D4** | **Chính sách log/riêng tư (D-0xx)** — ghi gì (đường dẫn + UA + **IP thật**, vì `trusted_proxies` khai 22 dải CF), giữ bao lâu, KHÔNG ghi gì (ví, query, body). Chủ đề này chưa từng được cân nhắc ở bất kỳ đâu — không phải bị bác | Đ1-10 (bật log là **đổi trạng thái**: bắt đầu giữ IP người thật, không thông báo, không hạn lưu) | 28/08 |
| **D5** | **O3b: `console-chains.json` qua ngày G** — nguyên xi / chuyển sang `retired` có khoá `xoaBoiReGenesis` / bỏ? Hiện O3b có cờ 🔴 và ghi "chưa đo" nhưng **không có hạn và không có tên ai** | Đ2-1, GO/NO-GO điều 8 | **28/08** |
| **D6** | **Genesis alloc của preset** — ví chủ có được cấp sẵn số dư trên L1 mới không? (hỏi đội console) | Đ2-5, và mọi câu chữ về chi phí/gas. Đây là thông tin **duy nhất** quyết định nút "Kích hoạt chain" bấm được hay không | trước Đ2-5 |
| **D7** | **Lượt đẻ chain thật sự restart mấy node trong 9?** (hỏi vận hành) | Đ1-13 (câu "Năm node"). Nếu không có câu trả lời: **bỏ con số khỏi câu** — số node là thứ sẽ đổi tiếp mà không ai nhớ đi sửa | 29/08 |
| **D8** | **Ngoại lệ hẹp cho `--font-mono`?** JetBrains Mono CÓ subset `vietnamese` (đo: hai khối `@font-face` mang `u+1ea0-1ef9`, weight 400/500) nên lập luận "B1 bật lỗi thiếu dấu" **không áp cho mono**. Nhưng chi phí THẬT phải khai trước: mỗi tệp JetBrains 5.872–11.596 B ⇒ ước **+15–25 KB/trang** trên phần dư **12,8 KB** (không phải 31,9). Cần David chuẩn y **bằng văn bản** trước khi ai gõ | Không chặn gì; nhưng đây là phần duy nhất của cụm font giao được mà không chờ 9Scan, và nó chạm dữ liệu người dùng phải đọc bằng mắt để xác minh (địa chỉ ví, tx hash) | sau Đ3-2 |
| **D9** | **Trần KB: giữ 160 hay hạ 150?** Dây thật đang 147,2 KB | Đ2-2, Đ2-4, D8 | sau Đ3-2 |
| **D10** | **Explorer chính thức: 9Scan-A1 hay Blockscout?** | Đ2-7, Đ2-9. Trước khi chốt, **KHÔNG đụng `/tx/` và `/address/`** | sau ngày G |
| **D11** | **Bot AI Cloudflare: chặn hay mở?** Zone đang `Disallow: /` cho GPTBot, ClaudeBot, Google-Extended, meta-externalagent… và `ai-train=no`; `search=yes` nên Google Search KHÔNG bị chặn. Đối tượng David nhắm năm 2026 rất hay bắt đầu bằng câu hỏi cho trợ lý AI. Đây là **mặc định của Cloudflare, nhiều khả năng chưa ai chọn có ý thức** — David đang trả cái giá đó mà có thể chưa biết | Không chặn gì. Chọn giữ nguyên thì **ghi vào `DECISIONS.md`** để lần sau không ai đi tìm "vì sao ChatGPT không biết A1" | sau ngày G |
| **D12** | **Pháp nhân / đội vận hành** cho mục minh bạch | Đ2-4 (hai trong bốn mục) | sau ngày G |
| **D13** | **Ký hiệu token gas của từng preset** — có preset nào khác LOVE9/18 không? | Đ2-9 | trước Đ2-9 |
| **D14** | **Mở Cloudflare Analytics xem 25/08→nay** (5 phút, 0 dòng mã) | Đ1-10 mục 1. Có thể trả lời câu hỏi lớn nhất tuần **cho cả những ngày đã qua** | **27/08** |

---

## 5. AI CHẶN AI

```
D3 (phạm vi ngoài web/)
  └─► Đ1-1 (Caddy một lượt)
        ├─► Đ1-2 (404 thương hiệu)        ← cũng cần D1
        └─► Đ1-11 (version.txt nghiệm thu)

D1 (duyệt 41 [?])
  ├─► Đ1-2   ├─► Đ1-4   ├─► Đ1-13 (phần sinh chuỗi)
  └─► Đ1-12 W0 (reGenesisXong) ─► GO/NO-GO điều 8 ─► Đ2-1 (thi hành D-web)

D2 (kênh liên hệ)  ──► Đ1-13 chân trang · faucet.themMangLoi
                   ──► Đ2-4 mục "báo lỗi"

D4 (D-0xx riêng tư) ─► Đ1-10 (log Caddy + log console)
D14 (CF Analytics)  ─► định hướng Đ1-10, nhưng KHÔNG thay thế nó

D5 (O3b) ─► Đ2-1 phần nhãn xoaBoiReGenesis + phần MyChainsScreen

Đ3-2 (sửa check-budget) ─► D8, D9 ─► Đ2-2 (B1+B2) ─► bộ biểu tượng SVG (☾/☀)
9Scan chốt bộ chữ       ─► Đ2-2
9Scan sync tokens       ─► Đ2-3 (danger-ink, line-control)
9Scan dạng URL locale   ─► Đ3-3 (hreflang)

D6 (genesis alloc) ─► Đ2-5 + mọi câu chữ về gas
D10 (explorer)     ─► Đ2-7, Đ2-9
D13 (token gas)    ─► Đ2-9

Đ1-11 (check-routes.mjs) ─► bảo vệ MỌI hạng mục thêm trang về sau (Đ2-4)
Đ1-10 ── HẠN CỨNG 01/09, không hạng mục nào chặn nó, và nó không vá lại được
```

**Ba đường tới hạn (critical path) của Đợt 1:**
1. `D3 → Đ1-1 → Đ1-2` (cổng vào công khai)
2. `D1 → Đ1-12 W0 → GO/NO-GO điều 8` (website có mặt trong ngày G)
3. `D4/D14 → Đ1-10` (đường cơ sở, không có đường lùi sau 01/09)

---

## 6. ĐÃ CÂN NHẮC VÀ CỐ Ý KHÔNG LÀM

> Mục này quan trọng ngang danh sách việc. Nó tồn tại để phiên sau không đề xuất lại, và để không ai "dọn dẹp" một quyết định có chủ ý.

### Về font, màu, hệ thiết kế
1. **Vá B1 riêng cho `--font-sans` / `--font-display`.** Sora và Instrument Sans **không có subset `vietnamese`**. Vá nối biến một mình là **bật đúng lỗi thiếu dấu lên** — làm xấu đi, không phải tốt lên. B1+B2 đi cùng một lượt. (Ngoại lệ hẹp duy nhất đang chờ David chuẩn y: `--font-mono`, vì JetBrains Mono có dải Việt — xem D8.)
2. **Hoà `#F5C542` và `#ffcb24` về một.** Hai sắc vàng là CÓ CHỦ Ý: `#F5C542` khớp byte với logo kit, `#ffcb24` là token giao diện. David đã chốt. Đây không phải "lỗi nhất quán".
3. **Sửa tay `web/app/tokens.css`.** Chép từ 9Scan-A1, có vân tay `535cbf6329efb6d0` và test bắt trôi lệch. Đổi màu phải đổi ở 9Scan rồi `sync-tokens.mjs`.
4. **SVG-hoá ☾/☀ ngay bây giờ.** Chúng sẽ đổi diện mạo **thêm một lần nữa** khi B1+B2 hạ cánh; làm bây giờ là làm hai lần. (Riêng `⧉` thì làm ngay — nó là nút **chức năng**, không phải trang trí.)
5. **Kéo `--color-line-strong` lên 3:1 cho tất cả.** Nó còn dựng nhiều viền trang trí; đổi hết là quyết định thẩm mỹ, không phải sửa lỗi a11y. Thêm token riêng cho **điều khiển**.

### Về thư viện và khung
6. **shadcn / MUI / Radix / bất kỳ UI lib nào.** Component tự viết (ràng buộc #7).
7. **Plausible / Umami / PostHog / Matomo / bất kỳ analytics bên thứ ba nào.** Tất cả tải script từ host ngoài — thêm bên thứ ba, thêm điểm hỏng, thêm chuyện riêng tư, ngược tinh thần #7. Tự viết `sendBeacon` rẻ hơn chúng **một bậc độ lớn** (<0,5 KB).
8. **Đi tìm chỗ cắt JS trong `app/`.** Không có: mã dự án chỉ **5,8 KB / 4,6%**; 108 KB còn lại là sàn khung.
9. **Bỏ App Router cho các trang tĩnh.** Đúng về mặt kỹ thuật (chunk của `/compare/` là 3,0 KB, `/re-genesis/` là 0,1 KB) nhưng **5 ngày trước ngày G không phải lúc đổi khung**. Ghi ra đây rồi **xoá khỏi lộ trình**, để người sau không nhặt lại như một ý hay.

### Về ví và chain
10. **`iconUrls` / `wallet_watchAsset` cho LOVE9.** MetaMask KHÔNG cho đặt icon cho token GỐC — đã đo thật.
11. **Kết luận từ mã HTTP của POST `/api/create` và `/api/revoke`.** Cloudflare cắt ở ~100 s, thao tác mất ~170 s ⇒ **KHÔNG KẾT LUẬN ĐƯỢC**. Đã cài đặt đúng rồi. Hệ quả: **không đặt `AbortSignal.timeout` cho hai endpoint đó** (Đ1-8), và trong Đ1-6a chỉ dừng sớm khi có **mã 4xx thật**, không dừng vì lỗi mạng, không dừng sau khi đã thấy `running`.
12. **Lưu token SIWE vào `localStorage`.** Origin này ở **cùng nhà với Blockscout** (một ứng dụng bên thứ ba lớn đội mình không kiểm soát mã), và token đó mở được cửa **thu hồi chain** — cửa một chiều. Nếu về sau vẫn phải cất: `sessionStorage`, kèm `hetHanLuc` mà server đã trả sẵn, coi token đọc từ kho là KHÔNG ĐÁNG TIN, và **không bao giờ** cho token vào query string. Quyết định này vào `DECISIONS.md`, không nằm trong một commit giao diện. **Đường ưu tiên là không cất token**: `/api/status` mà `/create-chain/` đã gọi CHÍNH LÀ payload `/my-chains/` dùng ⇒ gộp màn, vẽ danh sách chain của người này ngay dưới khối kết quả.
13. **Hiện con số trần (15) trước khi đăng nhập, đọc từ hằng số client.** Trần là của server; hằng 15 ở `CreateChainScreen.tsx:191` chỉ là giá trị rơi về. Ở pha `vi` chỉ thêm **đúng một dòng**: "bạn sẽ ký một chữ ký để đăng nhập, không tốn phí". Bỏ phần đọc `console-chains.json` để đếm chỗ — chi phí đổi luồng không xứng lợi ích.
14. **Deploy Multicall3 / CREATE2 trước ngày G.** Sẽ bị xoá 01/09. Ghi vào checklist re-genesis thay vì làm hai lần.

### Về nội dung và đo lường
15. **Cắt dấu `[?]` lúc render.** Là giấu khỏi mắt David ⇒ phá đúng cơ chế mà chú thích đầu `vi.ts` dựng ra. Cổng phải chặn ở `out/`, không phải ở màn hình.
16. **Tự tắt dải banner theo đồng hồ máy khách.** Đồng hồ máy khách sai thì tắt sai. Quyết định "gỡ thủ công" là ĐÚNG; rủi ro nằm ở chỗ nó chưa thành mục việc có người và có ngày → Đ1-12.
17. **Poll tự động số liệu trang chủ.** Luật ở `stats.ts:9-17` lập ra vì lý do tốt. Áp cho cả ca "đo lại validator" ở Đ3-4 — dùng nút bấm, không dùng hẹn giờ.
18. **Nới thanh trượt `/compare/` lên 24 px.** Chính phép đo nói nó **ĐẠT** SC 2.5.8 nhờ ngoại lệ khoảng cách (vòng 24 px cách nhau 71 px, không giao). Ghi đúng: 16 px vẫn xa mức 44 px khuyến nghị, nhưng đây không phải vi phạm và không đáng một vé. (Liên kết "Chi tiết" trong banner thì **có** làm — nó ở trên MỌI trang và là đường vào duy nhất tới `/re-genesis/`.)
19. **Thêm tiếng Anh trước ngày G.** Và **không lặp lại tiền đề "9Scan-A1 có 30 ngôn ngữ"** — đo 27/08 không quan sát được điều đó trên bản đang chạy.
20. **Mở nhiều trang mới.** `/builders/`, `/docs/`, `/minh-bach/`, `/status/` → gom thành **MỘT** trang, **MỘT** dòng route. Mỗi route mới là một cơ hội lặp lại vụ `/re-genesis/` chết nhiều ngày.
21. **301 `/tx/` `/address/` sang 9Scan trước khi đo.** Đừng chuyển hướng vào chỗ trống, và giữ Blockscout cho xác minh hợp đồng.
22. **Dùng "cửa sổ thư mục rỗng vài chục giây" làm lý do sửa `web-deploy.sh`.** Con số thiệt hại hôm nay gần bằng 0. Lý do THẬT là rớt mạng giữa chừng để lại site rỗng **vô thời hạn** và **không có bản nào để lùi về**. Nói quá mức tin cậy về cửa sổ đua là đúng cái lỗi dự án vừa mất công sửa.

### Hai cái bẫy phải ghi to
23. 🔴 **`mv out.new out`** — bẫy inode bind-mount, đã cắn 25/08. Luôn ghi **vào bên trong** `out/`.
24. 🔴 **Thêm `header` ở Caddy mà quên `defer`** — `header` ghi TRƯỚC khi `reverse_proxy` chạy, phản hồi nginx ghi đè lại, và phép đo ra y như cũ. Đúng bẫy đã chép ở `Caddyfile:341`.

---

## 7. NẾU CHỈ CÒN MỘT NGÀY

Thứ tự làm, dừng ở đâu cũng có giá trị:

1. **D14** — mở Cloudflare Analytics (5 phút, có thể đổi cả cách hiểu tình hình)
2. **D3 + Đ1-1 + Đ1-2** — cổng vào công khai thôi 404 vào sản phẩm của người khác
3. **D1 lô (a) + Đ1-3** — trang cảnh báo ngày G thôi mang dấu ngoặc-hỏi
4. **Đ1-5 mục 1** — `/re-genesis/` thôi chia sẻ ra lời mời đẻ chain
5. **Đ1-12 W0 + điều 8 GO/NO-GO** — website chính thức có mặt trong ngày G
6. **Đ1-10 mục 4** — `curl … > baseline-2026-08-27.json && sha256sum` (một dòng, và sau 01/09 nó là thứ **duy nhất** nói được "trước ngày G đã có ai dùng chưa")
7. **Đ1-6a** — hạ `tranGiay` 900 → 420 và dừng sớm khi 401 (một hàm, chặn được lớp tai nạn đắt nhất)
8. **Đ1-9 mục 1** — menu di động ở zoom 200%