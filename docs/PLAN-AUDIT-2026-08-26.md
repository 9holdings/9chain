# Kế hoạch xử lý báo cáo soát nguồn 2026-08-26

**Nguồn:** session audit `9chain-a1-c6`, 18 phát hiện.
**Trạng thái file này:** kế hoạch, chưa thực thi (trừ mục đã đánh ✅).

Nguyên tắc xếp thứ tự ở đây **không phải theo mức nghiêm trọng**, mà theo *chi phí
một lượt deploy*: mỗi `caddy reload` là một nhịp rủi ro cho toàn site, mỗi
`console-deploy.sh` là một lần restart **và nó từ chối chạy khi đang có lượt đẻ/thu
hồi** (~170s mỗi lượt). Gom việc theo dịch vụ rẻ hơn nhiều so với gom theo mức độ.

---

## ✅ Đã xong trong phiên này

### P0-1 — SyntaxError giết `<script>` của `/chains/` — ĐÃ SỬA, ĐÃ DEPLOY
Lỗi do chính lượt đổi `presetTen` → `presetName`: hai `const p` cùng scope.
Có **tầng thứ hai** mà đổi tên biến không chữa được: `TEN_PRESET[p] || p` tra bảng
đường lui bằng **id**, gộp id với tên hiển thị làm bảng đó mất tác dụng trong im
lặng. Nay giữ hai biến riêng (`p` = id, `tenHienThi` = tên).

**Điều kiện qua — đã đạt, đo bằng trình duyệt thật chứ không bằng `curl`:**
trang render 3 chain, cột "Kiểu chain" ra `Chuẩn / Chuẩn / Phí gần như bằng 0`,
không còn "Đang tải". (`curl` chỉ thấy khung — trang render bằng JS sau khi fetch.)

**Cổng chặn đã dựng:** `local-net/deploy/check-html.mjs` parse-check mọi khối
`<script>` nội tuyến, gọi từ **cả** `console-deploy.sh` lẫn `web-deploy.sh`.
Có đối chứng ngược (chèn lỗi thật ⇒ thoát mã 1).
```bash
node local-net/deploy/check-html.mjs
```

### P1-2 — upstream RPC dự phòng `:9660` — KHÔNG PHẢI LỖI, đã đo
Bản audit chỉ đọc được compose ở máy dev. Đo trên server:
```
9chain-a1-node-1   127.0.0.1:9650->9650/tcp
9chain-a1-node-2   127.0.0.1:9660->9650/tcp
ss -tln → cả 9650 và 9660 đều LISTEN
Caddy /reverse_proxy/upstreams → cả hai, fails 0
```
⇒ Khối hai-upstream là thật. **Nhưng nó lại là bằng chứng mạnh cho P1-1**: bản
compose trong tay người đọc mã khác bản đang chạy, nên người soát đã suy ra một kết
luận sai từ một nguồn hợp lý. Đó chính xác là cái giá của việc compose sản xuất không
vào git.

---

## ✅ P1-3 — ĐÃ CHỐT (David: hướng B) VÀ ĐÃ LÀM

Gỡ giao diện console cũ khỏi Internet. Ba lỗi của nó nằm trọn trong
`console/index.html` và biến mất cùng nó: **P2-1** (vòng lặp `prompt()` 5 giây),
**P2-5** (hai chỗ `innerHTML` không `esc()`), và chính P1-3 (kết luận từ `r.ok` của
một POST mà Cloudflare luôn cắt ở ~100s).

🔴 **NHƯNG "bỏ route `/console/*`" theo đúng nghĩa đen sẽ giết tính năng chủ lực.**
`/create-chain/` và `/my-chains/` gọi console **qua chính đường đó** (`consoleGoc()`
trong `web/lib/wallet.ts` trả `<origin>/console`). Xoá cả khối là giết đăng nhập ví,
đẻ chain và thu hồi — mà trang vẫn tải bình thường, chỉ hỏng lúc người dùng bấm nút.

⇒ Thực thi đúng là **API đi tiếp, giao diện thì không**:
- `@console_api path /console/api/*` → `uri strip_prefix /console` → `:8091`
- `@console_cu path /console /console/*` → **301** sang `/create-chain/`
- Thứ tự hai khối là **bắt buộc** (`handle` loại trừ lẫn nhau, xét theo thứ tự
  viết). Đảo lại thì `/console/api/*` bị nuốt, và triệu chứng là ví đăng nhập xong
  thì mọi lượt gọi API biến thành 301 sang một trang HTML — cùng họ với lỗi
  `@faucet_api` đã dính 2026-08-25.

**Điều kiện qua — đã đạt:**
| | |
|---|---|
| `/console`, `/console/`, `/console/index.html` | **301** → `/create-chain/` |
| `/console/api/siwe/nonce?address=…` | **200**, trả message SIWE thật |
| `/console/api/progress`, `/console/api/status` | **401** (sống, đòi xác thực) |

Đường vận hành **không đổi**: `ssh -L 8091:127.0.0.1:8091`.

⚠️ Còn lại từ nhóm này: **P2-6** (`frame-ancestors`, HSTS cho tên miền RPC) vẫn phải
làm — nó áp cho trang MỚI, không phải cho console cũ. Nằm ở Đợt 4.

## Các đợt còn lại

### Đợt 1 — chỉ repo, KHÔNG đụng production (rủi ro 0, làm được ngay)

| Mã | Việc | Điều kiện qua |
|---|---|---|
| P0-2 | Cầu tài sản rút sạch được: `chainNguon`/`hopDongNguon` là tham số người gọi truyền vào rồi `require` so với chính message ⇒ không chốt gì. Sửa: `immutable` ghim trong constructor. | `node local-net/contracts/compile.mjs --solc <đường dẫn>` sinh lại artifact; `bridge-test.mjs` **20/20** (đẻ 2 chain thật, ~13 phút, cần 2 slot L1) |
| P1-1 | Compose sản xuất không vào git. Tách sang `local-net/deploy/multinode.compose.yml`, đường dẫn khoá qua biến. | `docker compose -f <mới> config` trên server ra **cùng** kết quả với bản đang chạy; `git ls-files` thấy nó |
| P3-1/P3-2 | Cổng chặn tự động | Xem "Về CI" bên dưới |

🔴 **P0-2 chưa mất gì hôm nay** (PoC testnet, không có thanh khoản thật — D-034 nói
cầu thật dùng ICTT), **nhưng phải sửa TRƯỚC bất kỳ buổi demo nào**, vì demo là đúng
lúc có tiền nằm trong đó.

⚠️ Báo cáo audit gọi tệp là `CauTaiSan.sol`; nó **đã đổi tên** thành
`local-net/contracts/AssetBridge.sol` (contract `AssetBridge`) trong đợt chuẩn hoá
tiếng Anh, artifact đã sinh lại — vân tay nguồn `62971b14e79720e0` → `51b44e1f3f29f762`.

### Đợt 2 — console, MỘT lần restart

Gom hết vào một lượt vì `console-deploy.sh` từ chối restart khi có lượt đang chạy —
mỗi lần thử là một lần phải canh cửa sổ ~170 giây.

| Mã | Việc | Điều kiện qua |
|---|---|---|
| P3-3 | `createChain` chỉ `saveState` ở dòng cuối ⇒ hỏng giữa chừng để lại **subnet mồ côi vĩnh viễn** trên P-Chain. Ghi `{name, subnetID, dangDe:true}` ngay sau khi `l1 create` trả ID (cùng khuôn `thuHoi.batDau` đã làm đúng). | Bài kiểm giết tiến trình giữa chừng rồi khởi động lại: danh bạ phải có bản ghi `dangDe` |
| P2-2 | `tienTrinh` toàn cục nhưng hàng đợi nhận 5 lượt ⇒ ví B đọc tiến trình của ví A rồi **báo lỗi cho lượt còn chưa chạy**. Sửa rẻ: client bỏ qua tiến trình có `name` ≠ tên mình (`/api/progress` đã trả `name`). | Hai lượt chồng nhau: lượt sau không kết luận từ lượt trước |
| P2-3 | Server trả `notes:{title,body,how,command}`, client đọc `luuY:{tieuDe,cachLam}` ⇒ cảnh báo D-025 **không bao giờ hiện** trên nhánh POST thành công. | Đọc `/api/create` thật, thấy khối cảnh báo hiện ra |
| ~~P2-1, P2-5~~ | ✅ ĐÓNG — David chọn hướng B, bề mặt chứa chúng đã gỡ khỏi Internet | — |
| P2-7 | `/api/progress` lộ `name` chain của người khác. Nhỏ, và nó là thứ P2-2 cần — giới hạn lại khi thêm `jobId` | — |

🔴 **P2-3 đang bị P1-3 che.** POST luôn 524 nên client luôn rơi vào nhánh dự phòng
tự dựng `luuY` từ i18n — sửa P1-3 mà quên P2-3 là **làm lộ ra một lỗi thứ hai** đúng
lúc tưởng vừa sửa xong. Hai mục này phải đi **cùng một đợt**.

### Đợt 3 — faucet, MỘT lần restart (rẻ, độc lập)

| Mã | Việc | Điều kiện qua |
|---|---|---|
| P2-4 | `limitIp(ip)` **tiêu một suất** rồi mới kiểm cooldown 60s và trả 429 ⇒ người dùng mất suất cho một lượt bị từ chối. Đảo thứ tự (cooldown rẻ hơn: tra Map, không ghi). | Gọi 2 lượt trong 60s: `/faucet/api/info` phải còn `perIp.remaining` không đổi sau lượt bị cooldown chặn |
| P3-4 | `lastDrip` Map không bao giờ dọn | Dọn mục quá `COOLDOWN`; kiểm bằng bài kiểm đơn vị |

### Đợt 4 — Caddy, MỘT lần reload

| Mã | Việc | Điều kiện qua |
|---|---|---|
| P2-6 | `(secheaders)` thiếu `Content-Security-Policy "frame-ancestors 'none'"` ⇒ `/console/` (trang ký ví) iframe được. Và `rpc-a1.9chain.org` **không import `secheaders`** — không cả HSTS. | `curl -I` thấy header ở cả hai tên miền; **KHÔNG** áp `script-src` lên gốc Blockscout khi chưa đo |
| P3-5 | Caddyfile ghi "gỡ nhanh: xoá hai dòng `import chi_cloudflare`" — ai làm đúng câu đó lúc gỡ sự cố sẽ **vô hiệu hoá toàn bộ hạn mức** console + faucet, không dấu hiệu. Cần cảnh báo chéo ở cả hai tệp. | `check-ports.sh` chạy **sau mỗi** `caddy-deploy.sh` |
| ~~P1-3~~ | ✅ ĐÓNG — đã làm ở lượt reload 2026-08-26. **Không phải 404 và không xoá cả khối**: `/console/api/*` giữ nguyên (trang mới sống nhờ nó), giao diện cũ 301 sang `/create-chain/`. Xem mục P1-3 ở đầu file. | — |

### Không làm — có chủ ý

- **P3-6** RPC công khai không có hạn mức riêng. Lọc path đã chặt. Ghi ra để nó là
  **quyết định**, không phải chỗ bỏ sót. Xem lại khi có người dùng thật.
- **`/brand/` trả 403** (quan sát từ 9Scan-A1, `docs/requests-from-9scan/`): đúng hành
  vi nginx `autoindex off`. Sửa được nhưng phải đẻ ra một `nginx.conf` phải deploy
  đúng nhịp — đổi một mẩu thông tin 0 người dùng thấy lấy một bề mặt bảo trì mới.

---

## Về CI (P3-1) — nó đang bị chặn bởi H-6

**Repo chưa có remote.** Không có remote thì không có CI chạy được — GitHub Actions
cần một nơi để push. Nên P3-1 **không phải việc kỹ thuật, nó là H-6 đội lốt**.

Trong lúc chờ, cổng chặn rẻ nhất là một lệnh gom mọi phép kiểm sẵn có để người ta
chạy được bằng một dòng thay vì phải nhớ sáu dòng:

```bash
node local-net/deploy/check-html.mjs \
  && (cd web && npx tsc --noEmit && pnpm test && pnpm build) \
  && node local-net/console/siwe-test.mjs \
  && node local-net/console/auth-e2e-test.mjs
```

🔴 Và phải nói thẳng giới hạn của nó: **mọi phép kiểm trên đều ĐÃ XANH trong lúc
trang `/chains/` đang chết.** Cổng chặn chống được lỗi *lặp lại*, không chống được
lớp lỗi *chưa từng gặp*. Thứ duy nhất bắt được P0-1 là một người đọc mã. Đừng để
bảng xanh thay cho việc đó.
