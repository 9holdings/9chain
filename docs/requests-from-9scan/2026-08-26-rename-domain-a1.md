# Yêu cầu gửi repo `9Chain-A1` — đổi tên miền explorer sang `a1.9scan.org`

**Từ:** `9Scan-A1` · **Ngày:** 2026-08-26 · **Người quyết:** David
**Trạng thái: ✅ ĐÃ LÀM XONG VÀ ĐÃ LÊN PRODUCTION** (David uỷ quyền sửa trực tiếp repo
chain). Giữ file này làm hồ sơ — ba phát hiện dưới đây đáng đọc lại.

| nghiệm thu trên production | |
|---|---|
| `a1.9scan.org` 11 đường + sitemap 10/10 | **200** |
| `testnet-a1.9scan.org/blocks/` | **308** → `https://a1.9scan.org/blocks/` |
| `…/detail/?validator=NodeID-abc` | **308**, giữ nguyên **cả query** |
| canonical · og:url · robots · sitemap | đều đã là `a1.9scan.org` |
| điều hướng client-side `/` → `/network/` | PEERS 4 · VALIDATORS 5 · GAS PRICE 1, không "could not reach" |
| `caddy-deploy.sh` tự kiểm 6 tên miền | ✓ tất cả |

---

## 🔴 BA THỨ KHÁC VỚI BẢN NHÁP CỦA YÊU CẦU NÀY — đọc trước khi làm việc tương tự

**1. 308, KHÔNG PHẢI 301.** Bản nháp xin 301. Sai. Repo chain đã có khuôn nhà từ đợt
`a1.9chain.org` cùng ngày: **308 cho redirect chéo tên miền, 301 chỉ cho redirect nội
bộ vốn chỉ dính GET**. Với explorer nó không phải chuyện hình thức — trang proxy
**POST** ở `/rpc/`, nên một tab cũ còn mở sẽ POST tới
`testnet-a1.9scan.org/rpc/ext/bc/C/rpc`; **301 cho phép client đổi POST thành GET** ⇒
node trả 405/400 và mọi ô số liệu về `—` mà không có lỗi mạng nào để lần theo.

**2. DNS không phải thứ chặn.** Zone `9scan.org` có **wildcard proxied**, nên
`a1.9scan.org` phân giải sẵn và trả 525 (Caddy chưa có cert cho host đó). Đối chứng:
tên bịa `khong-ton-tai-xyz123.9scan.org` trả **cùng IP, cùng 525**. ⇒ **ở zone này một
tên miền gõ sai trông y hệt một tên miền hỏng**, không có `NXDOMAIN` để bám.

**3. 🔴 REPO CHAIN ĐI TRƯỚC SERVER — SUÝT DEPLOY HỘ VIỆC CHƯA XONG CỦA HỌ.**
`local-net/deploy/Caddyfile` trong repo có 3 dòng chưa lên server (đổi đường tiếng Việt
sang tiếng Anh: `/de-chain/`→`/create-chain/`, `/chain-cua-toi/`→`/my-chains/`,
`/bang/`→`/compare/`). Đo thật: `/de-chain/` **200**, `/create-chain/` **308** ⇒ bản
tiếng Anh CHƯA phục vụ. Áp thẳng Caddyfile của repo là **làm chết ba trang đang sống**
của repo bên kia.
⇒ Bản áp lên server được dựng từ **bản ĐANG CHẠY + đúng hai sửa đổi của explorer**,
xác nhận bằng `diff` chỉ ra đúng hai hunk. Repo vẫn giữ cả ba thay đổi, nên lượt
`caddy-deploy.sh` kế tiếp của họ sẽ mang phần của họ lên — đúng chiều an toàn.
⚠️ **Luật rút ra: trước khi áp một file cấu hình dùng chung, `diff` bản trong repo với
bản ĐANG CHẠY.** "Repo là nguồn sự thật" chỉ đúng khi repo và server cùng nhịp; ở một
file hai đội cùng sửa thì mặc định là chúng KHÔNG cùng nhịp.
⚠️ File trên server dùng **CRLF** — giữ nguyên khi sinh bản mới.

---

## Đổi gì, và vì sao

`testnet-a1.9scan.org` → **`a1.9scan.org`**. 23 ký tự xuống 12.

Lý do là thứ đo được: explorer là địa chỉ người ta **gõ tay** và **đọc qua điện thoại**
nhiều hơn là bấm link. Chữ `testnet` trong tên miền phải trả giá đó ở mọi lần gõ, mà
đổi lại nó chỉ nói được đúng một chữ.

🟢 **Lời cảnh báo "đây là mạng thử" KHÔNG bị bỏ, nó chuyển vào trong trang** — và ở
trong trang nó nói được nhiều hơn hẳn một tên miền:

| | |
|---|---|
| huy hiệu `TESTNET` cạnh logo | mọi trang, kể cả 404 và trang chi tiết |
| câu ở chân trang, dịch đủ 30 ngôn ngữ | *"This is a public test network. LOVE9 on this chain has no real value, and the chain can be rebuilt from genesis at any time."* |

Một tên miền không nói được rằng LOVE9 vô giá trị. Câu kia thì có.

## Xin làm — hai việc, và việc thứ hai KHÔNG được bỏ

### 1. Đổi tên khối site hiện có

Trong `local-net/deploy/Caddyfile`, khối `testnet-a1.9scan.org { … }` đổi **đúng một
dòng** — dòng tên miền:

```caddyfile
a1.9scan.org {
	import chi_cloudflare
	import origintls
	import secheaders
	encode zstd gzip
	… (giữ NGUYÊN toàn bộ phần còn lại: 4 redirect deep-link + reverse_proxy 127.0.0.1:8094)
}
```

🔴 **`reverse_proxy 127.0.0.1:8094` giữ nguyên số cổng.** Chú thích sẵn trong Caddyfile
đã ghi vì sao (2026-08-25 một lệnh thay-hàng-loạt 8094→8095 kéo cả dòng này theo và
tên miền 9scan trỏ nhầm sang trang khác trong ~2 phút, mà phép kiểm vẫn báo "✓ 200" vì
nó chỉ đo MÃ HTTP, không đo AI đang phục vụ). Đợt này cũng là một lệnh thay-hàng-loạt.

### 2. THÊM khối redirect 308 cho tên miền cũ

```caddyfile
# Tên miền cũ của explorer (M6 → 2026-08-26). Giữ redirect để link đã phát ra ngoài
# không chết và Google chuyển tín hiệu sang tên mới. Không phục vụ nội dung ở
# đây — một site, một canonical. **308 chứ không 301** — xem mục "BA THỨ KHÁC" đầu file.
testnet-a1.9scan.org {
	import chi_cloudflare
	import origintls
	redir https://a1.9scan.org{uri} 308
}
```

⚠️ **`{uri}` chứ không phải `/`.** Redirect gộp mọi đường về trang chủ là mất đúng cái
giá trị của redirect: người bấm một link tới `/detail/?tx=0x…` phải tới đúng giao dịch đó.

## Phía Cloudflare — zone `9scan.org`

🟢 **ĐO 2026-08-26: DNS KHÔNG PHẢI THỨ CHẶN.** Zone này đã có **bản ghi wildcard
proxied**, nên `a1.9scan.org` phân giải sẵn:

```
a1.9scan.org                    → 2606:4700:3032::ac43:b97a (Cloudflare) · HTTP 525
khong-ton-tai-xyz123.9scan.org  → CÙNG IP đó                · HTTP 525
testnet-a1.9scan.org            → 172.67.185.122 (bản ghi riêng) · HTTP 200
```

525 = Cloudflare tới được CF nhưng **Caddy không có cert cho host đó** ⇒ thứ còn
thiếu là **khối Caddy**, không phải bản ghi DNS. Làm xong mục "Xin làm" ở trên là
tên miền mới sống ngay.

⚠️ **Hệ quả đáng nhớ của wildcard, đã suýt làm hỏng một cổng giám sát:** ở zone này
**một tên miền gõ sai trông y hệt một tên miền hỏng** — cả hai đều phân giải và đều
525. Không có `NXDOMAIN` để bám vào. `scripts/a1-watch.sh` vì thế phân biệt bằng hai
vế (tên mới hỏng + tên cũ còn 200 = đang chuyển; cả hai hỏng = nghi B-6 lặp lại), chứ
không bằng DNS.

**Vẫn nên làm, nhưng không gấp:** thêm bản ghi **`a1`** tường minh → `139.99.145.13`,
**Proxied (mây cam)**. Để địa chỉ của explorer là một quyết định, không phải một hệ quả
tình cờ của catch-all — ai đó thu hẹp wildcard là site chết mà không ai nối được nguyên
nhân.

Ba luật cũ vẫn nguyên giá trị:
- 🔴 Phải **Proxied**. Mây xám ⇒ trình duyệt nối thẳng origin, gặp cert tự ký của
  `tls internal` ⇒ **mọi người vào đều thấy cảnh báo bảo mật**. Đã đo đúng ca này 2026-08-25.
- **Giữ nguyên** bản ghi `testnet-a1` — nó là đầu vào của khối 308.
- SSL/TLS mode của zone giữ **Full** (`Flexible` ⇒ vòng lặp chuyển hướng ·
  `Full (strict)` ⇒ 526 vì cert tự ký), và **KHÔNG dùng ACME/Let's Encrypt** — CF mây
  cam lấy nội dung qua :443 còn bộ trả lời HTTP-01 của Caddy chỉ nghe :80.

## Thứ tự chạy — sai thứ tự là site chết một khoảng

```
1. Caddyfile: đổi khối site + thêm khối 308
2. caddy validate && caddy reload              ← reload graceful, RPC công khai không gián đoạn
3. curl -sI https://a1.9scan.org/              → 200
   curl -sI https://testnet-a1.9scan.org/blocks/ → 308, Location: https://a1.9scan.org/blocks/
4. RỒI MỚI: bên explorer chạy `deploy/deploy-a1.sh`
5. tuỳ chọn, sau đó: thêm bản ghi `a1` tường minh ở Cloudflare (Proxied)
6. dọn: xoá khối tạm "CỬA SỔ ĐỔI TÊN MIỀN" trong `scripts/a1-watch.sh`   ✅ đã xoá
```

🔴 **Bước 4 phải sau bước 2.** Bản dựng mới khai canonical/og/sitemap là `a1.9scan.org`;
deploy nó lên trong khi Caddy chưa biết tên miền đó là để mọi trang tự khai một địa chỉ
chưa phục vụ được.

✅ **Cửa sổ chờ đã đóng.** Trong lúc chờ, `a1-watch.sh` có một khối tạm in dòng vàng
"CHỜ" rồi đo tiếp trên tên miền cũ — để nó KHÔNG khẳng định production chết trong khi
production đang chạy. Khối đó **đã xoá** ngay khi tên miền mới trả 200, đúng điều kiện
nó tự ghi: mã chết trong một cổng giám sát là thứ sẽ mục.

## Liên quan tới B-6 — đọc trước khi chạm Caddyfile

Khối site của explorer **đã từng bị xoá khỏi Caddyfile và làm site chết 31 phút**
(2026-08-25, B-6, `docs/requests/2026-08-25-caddy-site-block.md`). Đợt này chạm đúng
vùng đó và thêm một khối nữa, nên rủi ro cùng loại:

- lần này hỏng sẽ **CÂM hơn**: `a1.9scan.org` vẫn 200 bình thường, chỉ mọi link cũ đã
  phát ra ngoài là chết, và không có triệu chứng nào cho tới khi có người báo;
- vì thế `deploy/deploy-a1.sh` bên explorer nay **đo cả mã VÀ `Location` của 308** mỗi
  lần deploy (cảnh báo, không chặn — redirect là chuyện lịch sự với link cũ, không phải
  điều kiện để bản mới sống);
- và `caddy-deploy.sh` nếu đã có khối tự kiểm mọi tên miền (bản sửa dở lúc chốt phiên
  2026-08-25) thì **phải thêm cả hai tên miền vào danh sách kiểm**, không chỉ tên mới.
