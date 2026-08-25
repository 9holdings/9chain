# PROGRESS — 9Chain-A1 (phần CHAIN)

Backlog autopilot. Explorer là dự án khác (`C:\PROJECTS\9Scan-A1`) — **không làm ở đây**.
Nhật ký chi tiết lịch sử: `docs/PROGRESS.md`. Bàn giao: `HANDOFF.md`.

Trạng thái: `[ ]` chưa làm · `[x]` xong **và đã verify end-to-end thật** · `[~]` làm một
phần, phần còn lại ghi rõ ngay trong mục · `[blocked]` kẹt · `[human]` cần David.

---

## ✅ Đã xong trước autopilot (kiểm kê 2026-08-24)

- [x] Fork avalanchego → identity 9Chain-A1 (LOVE9/love9/9001/love9evm, chainId 9000000009)
- [x] Mạng 5 validator chạy thật trên `139.99.145.13`, 5/5 connected
- [x] Testnet công khai LIVE: `testnet-a1.9chain.org` + `rpc-testnet-a1.9chain.org`
- [x] Blockscout index đầy đủ · faucet · nút "Thêm vào MetaMask"
- [x] Nút "đẻ chain" chạy thật trên mạng công khai (OmegaChain, 12.7s, giao dịch chốt 1.4s)
- [x] Chain về tay người bấm nút — `admin` vào cả genesis alloc lẫn feeManagerConfig (OwnerTest)
- [x] Validate địa chỉ EIP-55 (`local-net/lib/eip55.mjs`, keccak-256 viết tay)
- [x] Danh bạ `/chains/` hiện chủ sở hữu, xử lý đúng chain thiếu khoá `admin`
- [x] Caddy: lọc path RPC, CORS, access log, `tls internal` (Cloudflare Full)
- [x] Chặn chainId trùng (quét số còn trống, không dùng `9100 + đếm`)

---

## M0 — Version control cho lớp chủ quyền  🔴 P0

**Vì sao trước hết:** toàn bộ thứ làm 9Chain-A1 *khác* avalanchego đang là uncommitted
working-tree changes (6 file M) + untracked (`9chain-a1-tools/` 1079 dòng Go,
`genesis/genesis_9chain_a1.go`). Gốc dự án **không phải git repo**. Gotcha re-rebrand
trong HANDOFF lại hướng dẫn chạy `git checkout --` → gõ nhầm là mất sạch.
Và §5 autopilot yêu cầu "git commit nhỏ" — không có git thì không có lưới đỡ nào.

- [x] M0.1 — Commit lớp chủ quyền vào nhánh `9chain-a1` trong `upstream/avalanchego`
      → 3 commit (`e46465c`), `git status --porcelain` = **0 dòng**
- [x] M0.2 — `git init` gốc dự án + commit đầu — 49 file, `c85d396`.
      Đã quét secret: không có `PrivateKey-*`/khoá riêng. Chuỗi `0x…` trong
      `9chain-a1-config/genesis.json` là BLS publicKey + proofOfPossession (công khai).
- [x] M0.3 — `patches/` (3 patch) + `scripts/apply-sovereign.sh`, `2d4af01`
- [x] M0.4 — `.gitattributes` `* -text` ở **cả hai** repo (KB: patch fail toàn bộ file khi git Windows/Linux lệch)
- [x] M0.5 — **Kiểm chứng khôi phục đã CHẠY THẬT**: clone sạch → `apply-sovereign.sh` →
      so tree hash với nhánh gốc: `42d43f32…` == `42d43f32…` → cây phục hồi **giống hệt từng byte**
- [x] M0.6 — **Build lại từ cây đã commit — ĐẠT Ở MỨC MẠNH NHẤT CÓ THỂ** (2026-08-25,
      sau khi B-1 được gỡ). `--version` → `9chaingo/1.14.2 [database=v1.4.5,
      rpcchainvm=45, commit=9chain-a1-poc, go=1.25.10]`.

      Và hơn thế: binary build ra **trùng từng byte với binary đang chạy testnet công khai**.
      ```
      avalanchego : 40d5e8f69dcbc786143b1833e34a7f5aeb191fe37844eb15394d17b022a7823f
      love9evm    : f829711b6cc3049a870eefa550e17c1af8b2c3130141c4b26eb279122aae5e27
      ```
      Ba chỗ cùng một hash: image dựng hôm nay · image `:dev` cũ · **node-1 trên
      `139.99.145.13` đang phục vụ RPC công khai**. Xem D-017.

**Điều kiện qua M0:** ✅ đạt phần cốt lõi — lớp chủ quyền không còn tồn tại dưới dạng
uncommitted/untracked ở bất kỳ đâu, và đường khôi phục đã chứng minh bằng tree hash
trùng khớp, không phải "trông có vẻ đúng". Còn treo M0.6 (build lại), không chặn mốc sau.

---

## M1 — Bộ đo + smoke test E2E

**Vì sao sớm:** hiện **không có test tự động nào**; mọi nghiệm thu là thủ công.
Mọi mốc sau đều cần đo, nên xây thước trước khi cưa.

- [x] M1.1 — `probe-net.mjs` — zero-dep, chạy được cả trên server. Đã chạy thật 20s
      qua Cloudflare: 37 lượt, 0% hỏng, p50 458ms.
- [x] M1.2 — `smoke-l1.mjs` hai chế độ (nhẹ chỉ-đọc / `--de-chain` đầy đủ).
      Chạy thật: **18/18 ĐẠT** trên testnet công khai.
- [x] M1.3 — **ĐO XONG trên mạng công khai** (2026-08-24, chain `Smoke7M7Q3D`, chainId 9102):
      > đẻ 1 chain → **C-Chain RPC chết 6.0 giây · 12/25 lượt gọi hỏng (48%)** · 1 khoảng chết
      Bằng chứng phụ: ngay sau đó cả 5 container đều `Up 25 seconds` — **cùng một con số**,
      tức là chúng bị recreate đồng loạt, không phải lần lượt.
      Giao dịch thật chốt sau **0.1s**, block 1, `0xd695ddcc…32b9be`.
- [x] M1.4 — Ghi số đo vào DECISIONS (D-006). **Kết luận: M2 PHẢI LÀM.**

**Điều kiện qua M1:** ✅ đạt — có con số thật, không phải suy đoán.

---

## M2 — Rolling restart khi track subnet mới

**Vì sao:** `console/server.mjs:181` gọi `docker compose up -d` → recreate **cả 5 node
gần như cùng lúc** mỗi lần đẻ chain. Nội bộ 2 chain không ai thấy; công khai thì mỗi lượt
người lạ bấm nút = cả mạng mất quorum. Đây là mắt xích gãy đầu tiên khi mở self-serve.
**Chỉ làm nếu M1.3 cho thấy gián đoạn thật.**

- [x] M2.1 — Restart tuần tự từng node, node phục vụ RPC công khai đi **cuối cùng**,
      hỏng thì **dừng ngay** không đụng node kế. Đã chạy thật: 19/19 đạt.
- [x] M2.2 — Đo lại. **KẾT QUẢ: KHÔNG ĐẠT ĐIỀU KIỆN QUA.**

| | đồng loạt (M1.3) | lần lượt (M2.2) |
|---|---|---|
| C-Chain chết | 6.0s | **6.5s** |
| lượt gọi hỏng (tuyệt đối) | 12 | **13** |
| tỉ lệ hỏng | 48% | 3.8% ← *chỉ vì cửa sổ đo dài gấp 13 lần* |
| thời gian đẻ 1 chain | 12.3s | **168.8s** |

**Đọc đúng số này:** tỉ lệ % giảm là ảo — **số lượt hỏng tuyệt đối gần như y hệt
(12 vs 13)**. Gián đoạn công khai do **riêng node-1 restart** gây ra, mà node-1 thì
buộc phải restart để track subnet mới. Restart lần lượt chỉ dời nó về cuối hàng chứ
không xoá nó. Đổi lại, đẻ chain chậm gấp 13 lần.

**Được gì thật:** 4 node giữ mạng sống suốt quá trình → consensus không đứt, và cơ chế
"hỏng thì dừng" đã chứng minh giá trị ngay lần chạy đầu (node-4 kẹt → dừng, node-1
không bị đụng, **gián đoạn công khai = 0**). Đây là an toàn, không phải tốc độ.

- [x] M2.3 — **Cái sửa thật: RPC công khai không còn là một node duy nhất.** ✅

      node-2 mở API ra `127.0.0.1:9660` (chỉ loopback) · Caddy `reverse_proxy` hai
      upstream, `lb_policy first` + health check chủ động lẫn bị động.

| đo trên mạng công khai | gián đoạn C-Chain | lượt gọi hỏng |
|---|---|---|
| 1 upstream (nền) | 6.3s | 21 |
| 2 upstream, `fail_duration 5s` | 1.8s | 6 |
| 2 upstream, `fail_duration 30s` + `max_fails 1` | **0.3s** | **1** |
| **đẻ 1 chain đầy đủ (restart cả 5 node)** | **0.5s** | **1** |

      So với nền M1.3 (6.0s / 12 lượt hỏng): **tốt hơn 12 lần**. 20/20 smoke test đạt.
      Đã vá cả `netgen` để mạng sinh sau này có sẵn (không chạy netgen trên mạng đang
      chạy — nó sinh KHOÁ MỚI = đổi danh tính validator; server vá tại chỗ).

**Điều kiện qua M2:** ✅ **đạt** — 6.0s → 0.5s, đo cùng một cách, táo với táo.

---

## M3 — IPv6 P2P (cộng đồng tự chạy node)

**Vì sao:** `netgen/main.go:281` cắm cứng `--public-ip=172.28.0.1x`, compose chỉ publish
9650 của node1, **không node nào publish 9651** → P2P sống trong bridge docker.
HANDOFF: *đừng quảng bá "chạy node cùng chúng tôi"* cho tới khi xong.

- [x] M3.1 — netgen sinh compose có IPv6 network, mỗi node một GUA từ khối `/64`.
      `A1_P2P_MODE=ipv6` + `A1_IPV6_SUBNET` + `A1_IPV6_BASE`; `enable_ipv6` đặt ở
      **cấp network** nên không phải restart Docker daemon (đo: server chạy 29.7.2).
- [x] M3.2 — `--public-ip` = IPv6 thật, `--bootstrap-ips` dạng `[addr]:9651`.
      **KHÔNG publish 9651**: container có GUA riêng nên nó tự đến được từ Internet,
      publish cổng là cơ chế của NAT và ở đây không có NAT.

      **Nghiệm thu (đọc kỹ giới hạn):** sinh thật 5 node ⇒ mỗi node một GUA
      (`…::b`…`::f`), `--public-ip` đúng GUA của chính nó, beacon vào
      `--bootstrap-ips` đúng dạng ngoặc vuông, `docker compose config` **hợp lệ**.
      Sinh lại ở chế độ mặc định và so: **0 dòng ipv6, `--public-ip` vẫn IPv4** —
      hành vi cũ không đổi một dòng nào.

      ⚠️ Đây là nghiệm thu **của bộ sinh**, không phải của mạng chạy thật: máy dev
      Windows không định tuyến được GUA nên không dựng thử được. Tín hiệu thật nằm
      ở M3.5. Và ⚠️ **áp lên mạng đang chạy KHÔNG phải hệ quả tự động** — netgen
      sinh khoá mới, chạy nó trên mạng công khai là giết mạng; phải vá tại chỗ.
- [ ] M3.3 — [human] AAAA record `bootstrap-a1.9chain.org` trên Cloudflare (**DNS-only**, không mây cam)
      🔴 **Đọc H-7 TRƯỚC**: nếu David chọn IPv4-đa-cổng thì đây là bản ghi **A**, không phải AAAA.
- [ ] M3.4 — `docs/RUN-A-NODE.md` + compose mẫu 1 node cho cộng đồng
- [ ] M3.5 — Kiểm chứng từ VPS NGOÀI: bootstrap xong + `info.peers` thấy node 9Chain-A1

**Điều kiện qua M3:** một node ở máy khác **thật sự là peer**, không phải "cổng mở".

---

## M4 — Self-serve đẻ chain (console ra công khai)

**Phụ thuộc M2.** Đây là điểm bán hàng của cả A1 mà hiện chỉ chạy qua SSH tunnel.

- [x] M4.1 — **Auth bằng chữ ký ví (SIWE); địa chỉ ký CHÍNH LÀ `admin`.** Đứng song
      song với `A1_CONSOLE_TOKEN` chứ không thay thế (token vẫn là đường của người
      vận hành + smoke test). Xem D-020, D-022.

      `GET /api/siwe/nonce?address=` → `POST /api/siwe/login {nonce, signature}` → token phiên.
      Đăng nhập bằng ví thì `admin` **bị ghi đè** bằng địa chỉ đã ký — gỡ hẳn lớp lỗi
      tệ nhất của dự án (gõ nhầm 1 ký tự ⇒ genesis bất biến ⇒ chain vô chủ vĩnh viễn).
      Thu hồi bằng ví chỉ đụng được chain của chính mình (403), token vận hành đụng được mọi chain.

      **Nghiệm thu:** `siwe-test.mjs` **21/21** (phần lớn là bài PHẢI TRƯỢT: phát lại,
      ký bằng ví khác, chữ ký của message khác, hết hạn, sai checksum, trần fail-closed)
      · `auth-e2e-test.mjs` **33/33** chạy console thật qua HTTP — **đạt cả trên máy dev
      lẫn trên server**. Mạng công khai sau khi deploy: smoke **16/16**.

      `console-deploy.sh` nay **chặn deploy nếu hai bài này trượt**, và chạy lại chúng
      trên server sau khi cài `node_modules`.
- [x] M4.2 — **Hạn mức theo địa chỉ ví.** Đăng nhập bằng ví ⇒ đếm theo `vi:<địa chỉ>`
      thay vì IP. Nghiệm thu: hai ví khác nhau **từ cùng một IP** giữ ngân sách riêng
      (bài 9 của `auth-e2e-test.mjs`, 37/37) — đúng kịch bản "cả văn phòng chung một
      IP, một người xài hết phần của tất cả". Kèm hạn mức hai tầng, xem D-022.

      🔴 **`A1_TRUST_PROXY=1` CỐ Ý CHƯA BẬT — chuyển sang M4.5.** Bật khi chưa có proxy
      là **đi lùi** về an toàn chứ không phải chuẩn bị trước: console sẽ tin header
      `X-Forwarded-For`/`CF-Connecting-IP` do chính client đặt, tức ai cũng tự khai IP
      để thoát hạn mức. Hôm nay console nghe loopback, không có Caddy phía trước.
      Chỉ bật **đồng thời** với lúc đặt reverse proxy ra trước. Console nay cảnh báo
      to nếu thấy `TRUST_PROXY=1` mà vẫn đang nghe loopback.
- [x] M4.3 — Cap tổng số chain — **HOÁ RA LÀ TRẦN CỨNG CỦA GIAO THỨC, KHÔNG PHẢI
      CON SỐ TUỲ CHỌN.** Đã chặn ở console (mặc định 15, trần tuyệt đối 16). Xem D-009.
- [x] M4.4 — **Endpoint thu hồi chain — trần 16 hết một chiều.** `POST /api/revoke`
      gỡ subnet khỏi `--track-subnets` của mọi node (rolling restart, chung hàng đợi
      với create), rồi gỡ chain khỏi danh bạ. Xem D-013…D-016.

      Xác minh ở source trước khi code, không suy đoán: trần 16 áp lên đúng danh
      sách `TrackedSubnets` gửi lúc bắt tay (`network/peer/peer.go:882`), Primary
      Network bị loại trừ tường minh (`network/network.go:208`) ⇒ **bỏ track thật
      sự trả lại chỗ**, và 16 là 16 L1 chứ không phải 15+Primary.

      Ba thứ đi kèm, không tách rời được:
      - **Chain đã thu hồi giữ chỗ `name` + `chainId` vĩnh viễn** — thu hồi không
        xoá được mạng khỏi ví người dùng, cấp lại chainId là để ví họ lặng lẽ trỏ
        vào chain của người khác (D-014).
      - **Trang `/chains/` vẽ chúng từ mảng `retired`, KHÔNG đo bằng heuristic chain
        sống** — thu hồi không rút node khỏi tập validator P-Chain nên
        `getCurrentValidators` vẫn trả đủ 5 validator cho chain đã chết (D-013).
      - **`smoke-l1.mjs --de-chain` nay tự dọn chain nó đẻ ra** (D-015).

      **Đo thật trên testnet công khai 2026-08-25, chain `Smoke7XWQ2M` — 29/29 ĐẠT:**

| | đẻ chain | thu hồi |
|---|---|---|
| thời gian | 168.9s | **162.8s** |
| gián đoạn C-Chain | 0.5s · 1/338 hỏng | **0.5s · 1/326 hỏng** |

      Thu hồi KHÔNG đắt hơn đẻ — cùng cơ chế rolling restart, cùng con số.
      Bằng chứng slot đã về: RPC chain đã thu hồi **im hẳn** (node hết định tuyến),
      danh bạ **5 → 5 L1** đúng mức trước khi chạy bài.
      Giao dịch thật trên L1 mới chốt 0.1s, block 1, `0xf4b0b992…aa5538`.
- [ ] M4.5 — [human] Caddy route console + Cloudflare Access / mTLS — **David duyệt trước khi mở**.
      Khi làm: bật `A1_TRUST_PROXY=1` **cùng lúc** đặt Caddy ra trước (không sớm hơn —
      xem M4.2), rồi kiểm chứng bằng `/whoami` phải trả IP THẬT của người dùng.

**Điều kiện qua M4:** một ví lạ, không có token, đẻ được chain của chính nó từ Internet.

---

## M5 — Template + precompile chọn được

`l1-evm-genesis.json` hiện cố định, chỉ thay `chainId`/`alloc`/`feeManager`.

- [x] M5.1 — **5 preset** trong `local-net/lib/presets.mjs`: `chuan` · `khong-phi`
      (minBaseFee=0) · `tu-in-tien` (native minter) · `chi-chu-deploy` (deployer
      allowlist) · `kin` (tx allowlist).

      **Tên khoá JSON và địa chỉ precompile lấy TỪ SOURCE subnet-evm**
      (`precompile/contracts/*/module.go`), không gõ theo trí nhớ — subnet-evm **bỏ
      qua khoá lạ trong im lặng**, nên gõ sai một chữ là chain ra đời thiếu đúng thứ
      người dùng chọn mà không lỗi, không cảnh báo.

      Hai luật cứng: (1) chủ chain là admin của MỌI precompile được bật — bật mà
      không ai quản được là đẻ ra công tắc không ai bấm được, genesis thì bất biến;
      (2) không preset nào được làm chain không giao dịch nổi. Nguy hiểm nhất là
      `kin`: chủ chain không nằm trong allowlist ⇒ **không ai gửi được giao dịch
      nào, vĩnh viễn** (sửa allowlist cũng cần một giao dịch). Đã kiểm ở source chứ
      không tin trực giác: `precompile/allowlist/role.go:51` — `IsEnabled()` trả true
      cho AdminRole ⇒ để chủ chain vào `adminAddresses` là đủ.
- [x] M5.2 — Ô chọn kiểu chain trên console (**danh sách do server cấp**, không cắm
      cứng ở client), mô tả hiện ngay dưới ô chọn vì genesis bất biến — người dùng
      chỉ có đúng một lần đọc. Danh bạ `/chains/` hiện "Kiểu chain"; chain đẻ trước M5
      thiếu khoá `preset` ⇒ hiện "Chuẩn", không để `undefined` lọt ra.
- [x] M5.3 — Đẻ thật mỗi preset 1 chain, gửi giao dịch thật chứng minh preset có hiệu lực
      → `local-net/faucet/preset-test.mjs` (đẻ → thử → **tự thu hồi**, nhờ M4.4).

      **ĐẠT 40/40 trên mạng công khai, 2026-08-25 (phiên thứ tư)** — 4 chain thật
      (9117–9120), mỗi chain một preset, mỗi chain **tự thu hồi** sau khi thử xong
      nên bài chạy lại được vô hạn. Danh bạ trả về đúng 6/15 sau mỗi lượt.

| preset | bằng chứng preset CÓ hiệu lực |
|---|---|
| `khong-phi` | baseFee **1 wei** · tx giá gas 1 wei chốt ở block 1 · phí thật **21.000 wei** |
| `tu-in-tien` | đúc **777 token từ hư không** cho một ví lạ, số dư đọc lại đúng 777.0 |
| `chi-chu-deploy` | chủ chain deploy được; ví lạ **có tiền** vẫn bị chặn deploy, nhưng **vẫn gửi được giao dịch thường** |
| `kin` | chủ chain giao dịch được (Admin bao hàm Enabled); ví lạ **có tiền** bị chặn hoàn toàn |

      Hai điều kiện bị chặn đều nghiệm thu bằng **ví đã được nạp tiền trước** —
      không có bước đó thì "bị từ chối" và "hết tiền" trông giống hệt nhau, và bài
      kiểm sẽ xanh vì lý do sai.

      B-3 (`khong-phi` không chốt được giao dịch) gỡ bằng D-028; B-4 (ba lỗi của
      chính bài kiểm) gỡ bằng D-029.
- [x] M5.4 — 🔴 **Giao dịch ĐẦU TIÊN của chain mới hỏng vì ước lượng gas thiếu** (D-025).
      **Đã chọn hướng và làm xong.** Console KHÔNG tự gửi giao dịch mồi — hướng đó
      chết ở một câu hỏi mà nó giấu bên trong: *server lấy tiền ở đâu?* Genesis chỉ
      cấp phát cho `admin` (ví người bấm nút), nên muốn server gửi được thì phải
      cấp thêm cho một địa chỉ của Foundation **vĩnh viễn trong genesis bất biến** —
      phá đúng tính chất `OwnerTest` đã đo (quỹ Foundation: 0, vai None). Xem D-030.

      Thay vào đó `POST /api/create` trả kèm `luuY`, console vẽ ngay dưới kết quả:
      đừng tin ước lượng gas cho giao dịch đầu, và **cách rẻ nhất mở block 1 là một
      giao dịch chuyển tiền thường** (21.000 gas là hằng số EVM ⇒ không cần ước
      lượng ⇒ không dính bẫy). Chữ nằm ở **một chỗ** (server), UI chỉ vẽ lại.

      **Nghiệm thu trên mạng công khai:** 4/4 lượt đẻ chain thật đều có trường
      `luuY` trong đáp án (bài `preset-test.mjs` kiểm ngay tại chỗ gọi `/api/create`).

---

## M6 — Warp/ICM cross-L1

Demo mạnh nhất của A1; tiêu chí "Interop" đang tự chấm 3/5 trong dashboard.

- [x] M6.1 — Bật Warp precompile trong genesis template. **Vào KHUÔN, không làm preset**
      — ICM đòi cả hai đầu có Warp, để nó thành lựa chọn là đẻ ra những cặp chain
      không bao giờ nói chuyện được với nhau, mà genesis bất biến (D-031).

      **Nghiệm thu trên chain thật 9125:** `getBlockchainID()` trả
      `0xcb6347a337236e48…`, và **`sendWarpMessage` là giao dịch THẬT chốt ở block 2
      với 1 log** — thay đổi trạng thái quan sát được, không phải "gọi được thì coi
      là bật".

      🔴 **Lượt đo đầu báo "Warp TẮT" và đó là PHÉP ĐO SAI, không phải cấu hình sai.**
      Đáng ghi vì nó là một họ bẫy mới: precompile khai `blockTimestamp > 0` thì ở
      **block 0 nó chưa hoạt động**, và `eth_call` lúc đó trả `0x` rỗng —
      **không phân biệt được với "khoá cấu hình bị bỏ qua"**, đúng trạng thái mà cả
      mốc M5 sinh ra để chống. Bài kiểm nay đọc **hai lần** (trước và sau khi mở
      block 1) và báo cáo chênh lệch, nên lần sau nó tự phân biệt hộ.

      **Đã đọc source trước khi code (2026-08-25, phiên thứ tư) — hai điều phải biết:**

      1. **Warp TỪ CHỐI bật trước Durango.** `precompile/contracts/warp/config.go:93`
         → `errWarpCannotBeActivated`. Nghe như việc chặn, nhưng KHÔNG phải:
         networkID 9001 không phải Mainnet/Fuji ⇒ `upgrade.GetConfig` trả `Default`,
         ở đó `DurangoTime = InitiallyActiveTime` (2020-12-05) ⇒ **Durango bật sẵn**.
         🔴 Kéo theo: gotcha trong HANDOFF *"L1 EVM chưa bật Durango → compile
         evmVersion:'paris'"* **có vẻ là SAI**. Đã cắm phép đo PUSH0 (`0x5f5ff3`)
         vào `preset-test.mjs` để kết luận bằng chain thật thay vì bằng đọc code.

      2. 🔴 **`warpConfig.blockTimestamp: 0` sẽ TRƯỢT verify** — và đây là chỗ dễ
         mất hàng giờ. Mọi precompile khác trong `presets.mjs` dùng
         `blockTimestamp: 0` và chạy tốt, nên phản xạ tự nhiên là làm y hệt. Nhưng
         Warp kiểm `IsDurango(c.Timestamp())`, tức so mốc bật Warp với mốc Durango
         = **1607144400**, chứ không so với "genesis". `IsDurango(0)` là **false**.
         Phải đặt `blockTimestamp` ≥ 1607144400.
      - Tham số: `quorumNumerator` — 0 nghĩa là dùng mặc định 67; nếu khai thì phải
        trong khoảng 33…100. `requirePrimaryNetworkSigners`: bool.
      - Quyết định còn treo: bật cho **mọi** chain (template) hay làm một preset?
        Nghiêng về template — ICM đòi CẢ HAI đầu có Warp, nên để nó thành lựa chọn
        là đẻ ra những cặp chain không nói chuyện được với nhau, mà genesis bất biến.
- [ ] M6.2 — Chuyển tài sản giữa 2 L1 do người dùng đẻ ra, có bằng chứng giao dịch 2 đầu

      **Ba thứ đã tra ở source (2026-08-25) để bước sau khỏi dò lại:**

      1. 🔴 **API Warp TẮT MẶC ĐỊNH.** `plugin/evm/vm.go:1179` chỉ đăng ký namespace
         `warp` khi `vm.config.WarpAPIEnabled`, mà `plugin/evm/config/config.go:38`
         không đặt mặc định ⇒ giá trị zero của Go ⇒ **false**. Không có API này thì
         không tổng hợp được chữ ký BLS của validator, tức **không gửi được message
         nào đi đâu** — bật Warp precompile (M6.1) mới là một nửa.
         ⇒ Cần cấu hình theo từng chain: `{"warp-api-enabled": true}`.
      2. **Chỗ đặt cấu hình đó.** Compose hiện KHÔNG có `--chain-config-dir`, nên
         avalanchego rơi về `~/.avalanchego/configs/chains/<blockchainID>/config.json`
         — nằm trong volume riêng của TỪNG node, tức phải ghi 5 lần qua `docker exec`.
         Sạch hơn: thêm `--chain-config-dir=/9chain-a1/config/chains` vào netgen và
         để console ghi ra host một lần — thư mục `9chain-a1-config` **đã được mount
         sẵn vào cả 5 node** (`/9chain-a1/config`, ro), y hệt cách `console-tmp` hoạt
         động. ⚠️ Mạng đang chạy phải vá compose tại chỗ, không chạy netgen.
      3. **Đầu nhận vẫn cần một hợp đồng.** `getVerifiedWarpMessage` đọc từ
         **predicate của giao dịch**, không phải từ storage — nên không thể chứng
         minh bằng `eth_call` trần; phải có mã trên chain B gọi vào precompile.

      ⚠️ Cần **2 slot L1 cùng lúc** trong trần 15 — không thu hồi được giữa chừng.

      **Còn phải chọn (chưa quyết):** chứng minh bằng **Warp thô** (gửi → tổng hợp
      chữ ký → đầu kia xác minh) hay dựng hẳn **Teleporter/ICTT**. Warp thô đủ chứng
      minh *cơ chế*; nhưng M6.2 nói "chuyển **tài sản**", mà tài sản thì cần ICTT.

---

## M7 — An toàn vận hành (làm xen kẽ)

- [x] M7.1 — `console-chains.json` ghi qua file tạm + rename, giữ `.bak`.
      Ghi thẳng mà tiến trình chết giữa chừng là còn lại JSON cụt → `loadState()`
      bắt lỗi rồi trả `{chains:[]}`, tức **danh bạ rỗng trông như hợp lệ**, và lượt
      tạo kế tiếp ghi đè lên đó. Đã kiểm: mount của nó là **thư mục** nên `rename`
      không dính bẫy inode (khác `chains-nginx/default.conf` — mount file đơn lẻ,
      sửa file đó phải `cp` chứ không `mv`).
- [x] M7.5 — Kiểm chứng hạn mức faucet nhìn đúng IP người dùng:
      `/faucet/whoami` → `{"ip":"2.49.67.2","trustProxy":true}` — IP thật, không phải
      IP Cloudflare. Hạn mức faucet lành mạnh, không cần sửa.
- [~] M7.2 — **Nền đã xong: `local-net/deploy/kiem-cong.sh`.** `ufw-cloudflare-only.sh`
      còn treo, và cố ý treo — xem dưới.

      🔴 **Vì sao làm bài kiểm TRƯỚC ufw, không phải sau:** bài học thật của B-5
      không phải "thiếu ufw" mà là **`ufw status` nói dối**. Docker publish cổng bằng
      DNAT ở bảng `nat`, ufw lọc chuỗi `INPUT` ⇒ container khai `ports: "7432:5432"`
      hở thẳng ra Internet **trong khi `ufw status` báo cổng đó bị chặn**. Viết
      `ufw-cloudflare-only.sh` rồi tin là xong sẽ tạo đúng thứ đã để lọt B-5: một
      cảm giác an toàn có bằng chứng sai.

      `kiem-cong.sh` đo **ba tầng**, và chỉ tầng cuối có thẩm quyền: (1) server khai
      gì (`ss -tlnp`, lọc loopback) · (2) docker mapping nào thiếu `127.0.0.1` ·
      (3) **bắt tay TCP thật từ máy dev qua Internet**. Kèm **đối chứng ngược** (thử
      cổng 9): không có nó thì "mọi cổng đều đóng" có thể chỉ nghĩa là phép đo hỏng.

      **Chạy thật 2026-08-25:** ngoài chỉ tới được **22 · 80 · 443**, không container
      nào publish ra `0.0.0.0`, đối chứng đạt ⇒ B-5 vẫn đang đóng.

      Còn lại: siết 80/443 về dải Cloudflare. Phải làm cùng lúc với việc kiểm chứng
      bằng `kiem-cong.sh` từ một IP **không phải** Cloudflare, nếu không thì không
      phân biệt được "đã siết" với "ufw bị Docker đi vòng qua".
- [ ] M7.3 — `/api/metrics` cho dashboard + 9Scan-A1 (chờ 9Scan chốt yêu cầu ở KICKOFF của họ)
- [x] M7.4 — `C:\PROJECTS\MetaChain` đã không còn tồn tại (kiểm 2026-08-25, `ls` báo
      No such file or directory). Không cần xoá gì.

---

## M8 — Fork tự đứng được (mở khoá 2026-08-25 khi B-1 được gỡ)

**Vì sao thành mốc riêng:** kiểm kê ngày 2026-08-25 cho thấy lớp chủ quyền chỉ là
**~139 dòng sửa avalanchego** trên 7 file (1266 dòng còn lại trong diff là công cụ
vận hành `9chain-a1-tools/`, không phải chain). Patch mỏng là **điểm mạnh** — nó giữ
cho fork rebase được. Nhưng cả ba đường sống của một fork mỏng đều **chưa từng chạy
lần nào**: chưa build lại, chưa chạy test, chưa rebase thử. Trước khi chạy được ba
thứ đó, mọi khẳng định về độ bền của fork đều là suy đoán.

Docker Desktop đã lên lại (B-1 gỡ, 2026-08-25) — đây là lúc làm.

- [x] M8.1 — Build image từ cây đã commit (= M0.6) — **xong, tái lập từng byte**
- [x] M8.2 — **Test các gói fork có chạm — 6 lỗi, TẤT CẢ là hệ quả có chủ đích của
      việc đổi tên, KHÔNG có lỗi logic nào.** Xem D-018.

| gói | kết quả |
|---|---|
| `config`, `config/node`, `utils/constants` | ✅ xanh |
| `genesis` | ❌ 5 lỗi — hash genesis mainnet/fuji/local đổi + `TestAVAXAssetID` |
| `version` | ❌ 1 lỗi — `TestApplicationString` đòi `avalanchego/x.y.z` |

      **Thí nghiệm tách bạch (đây mới là phần đáng giá):** hoàn nguyên **đúng 4 chuỗi
      identity** trong container, **giữ nguyên toàn bộ logic A1** (`A1NetworkID` ở
      `config.go:811,882` + `params.go:65,80`, cả `genesis_9chain_a1.go`) → **cả 4 gói
      xanh hết**. Nên 6 lỗi kia quy 100% về việc đổi tên, và phần logic chủ quyền —
      thứ thật sự có thể sai — **không làm hỏng test nào**.
- [x] M8.3 — **Nền toàn bộ `go test ./...` — 220 xanh · 204 không có test · 7 đỏ.**
      Fork chỉ chịu trách nhiệm **2 trong 7**, và cả 2 đều là đổi tên. Xem D-019.

| gói đỏ | nguyên nhân | của ai |
|---|---|---|
| `genesis` | hash genesis + `TestAVAXAssetID` đổi do đổi tên token | **fork** (chủ đích) |
| `version` | `TestApplicationString` đòi `avalanchego/x.y.z` | **fork** (chủ đích) |
| `x/blockdb` | `TestWriteBlock_Errors/writeBlockAt_-_failed_to_get_data_file` | upstream |
| `vms/saevm/sae` | ~10 test RPC (`TestGetLogs`, `TestFilterAPIs`, …) | upstream |
| `tests/e2e`, `tests/fixture/bootstrapmonitor/e2e`, `tests/upgrade` | `Ran 0 of 18 Specs — A BeforeSuite node failed` | cần mạng thật, không phải unit test |

      **Cách quy trách nhiệm — không đoán:** chạy lại đúng 2 gói `x/blockdb` và
      `vms/saevm/sae` với identity **hoàn nguyên về upstream** → **vẫn đỏ y hệt**.
      Nên chúng là nền có sẵn của upstream, fork không đụng tới.

      ⚠️ `vms/saevm/sae` **không ổn định**: đỏ sau 45.5s trong lượt chạy toàn bộ,
      nhưng **treo tới hết timeout 600s** khi chạy riêng. Đừng đuổi theo nó.
- [x] M8.4 — **Diễn tập rebase — ĐẠT, nhưng đọc kỹ giới hạn.** `scripts/rebase-drill.sh`
      (mới): worktree tách rời → `git am` 4 patch lên upstream mới → kiểm 7 điểm chủ
      quyền → dọn → **chốt chặn cuối xác nhận nhánh `9chain-a1` không đổi hash**.

      Chạy thật lên `origin/master` (`0eb8166`): 4/4 patch áp sạch, **7/7 điểm chủ quyền
      còn nguyên** (gồm 2 điều kiện `A1NetworkID` ở `config.go` và 2 nhánh `case` ở
      `params.go` — đúng thứ `genesis_9chain_a1.go` dặn phải kiểm). Cây sau rebase lệch
      so với nhánh thật **đúng bằng nội dung commit upstream mới**, không có gì trôi.

      ⚠️ **Giới hạn phải nói rõ:** lúc thử, upstream mới **chỉ có 1 commit** và nó chạm
      `vms/saevm/` — vùng patch ta không đụng tới. Nên đây chứng minh **cơ chế chạy**,
      chưa chứng minh **chịu được xung đột**. Tín hiệu thật nằm ở lần upstream tái cấu
      trúc `config/config.go` hoặc `genesis/`. Script đã in cảnh báo này ở cuối để lần
      sau không ai đọc nhầm "đạt" thành "an toàn vĩnh viễn".

      **KHÔNG dùng `apply-sovereign.sh` để diễn tập** — script đó kết thúc bằng
      `git branch -f 9chain-a1 HEAD`, tức là ghi đè nhánh thật.

**Điều kiện qua M8:** ✅ **ĐẠT cả 4/4** (2026-08-25). Dựng lại được binary — và nó
**trùng từng byte** với bản đang chạy công khai. Biết chắc fork chỉ làm đỏ 2 gói, cả
hai đều do đổi tên. Đã đi qua đường rebase và biến nó thành script chạy lại được.

**Câu trả lời cho "fork hoàn thiện chưa" sau M8:** ba lỗ hổng nêu ra sáng nay đã bịt.
Còn lại **không phải chuyện fork** mà là chuyện kiến trúc sản phẩm: subnet cổ điển,
trần 15 L1, ACP-77 (H-1/H-2).

**KHÔNG thuộc M8** (đã cân nhắc và loại): xoá nốt dấu vết upstream ở lớp vận hành —
env prefix `avago` (`config/viper.go:18`), thư mục dữ liệu `~/.avalanchego`
(`config/flags.go:46`), `DEFAULT_VM_NAME="subnet-evm"`, module path `ava-labs/avalanchego`,
81 file `.go` còn chuỗi `AVAX`. Người dùng cuối không thấy chúng, còn sửa thì làm patch
chủ quyền dày lên — đúng thứ giết fork lúc rebase. Đổi lấy cái không ai nhìn thấy.

---

## M9 — Đo năng lực chain bằng tải thật (David yêu cầu 2026-08-25)

`local-net/faucet/tai-test.mjs` — bơm tải lên **một L1 riêng**, không phải C-Chain.

- [x] M9.1 — Bộ bơm tải + chốt an toàn. Tự ngắt nếu C-Chain công khai hỏng 3 lượt
      liền, hoặc chậm >4s trong 5 lượt liền, hoặc đĩa còn <15%.

      ⚠️ **L1 riêng KHÔNG cô lập được CPU** — L1 và C-Chain chạy trong **cùng 5 tiến
      trình node**. Cái tách được là Blockscout (nó không index L1). Vì vậy chốt an
      toàn là bắt buộc, không phải trang trí.

      Bài báo cáo tách **gửi đi** khỏi **chốt vào block**: "gửi được bao nhiêu mỗi
      giây" là năng lực của cái script, không phải của chain.
- [x] M9.2 — **Đo thật, 20 ví, 3 phút:**

| | |
|---|---|
| Chốt vào block | **173,8 TPS** (31.600 giao dịch) |
| Gửi đi | 32.240 · **0 lỗi** |
| Block | 347 giao dịch/block · 2,0 giây/block |
| C-Chain công khai | p50 **72ms** · p95 113ms · xấu nhất 196ms · **hỏng 0/33** |
| Đĩa | **0,24 MB/s** khi đang tải ≈ 0,9 GB/giờ |

- [x] M9.3 — **Trần TPS là THAM SỐ GENESIS, không phải giới hạn phần cứng.** Nâng
      lên 60 ví chỉ đưa 174 → ~258 TPS (tăng 3× số ví, TPS tăng 1,45×) ⇒ đã gần trần.
      Trần đó tính ra được từ chính genesis:
      ```
      gasLimit 12.000.000 ÷ 21.000 gas/tx = 571 tx/block
      571 ÷ 2 giây (targetBlockRate)      = 285 TPS lý thuyết
      đo được 252–264 TPS                 = 90% trần
      ```
      Trong khi máy chủ ở **load 2,92/8 luồng (~36%)**. Muốn nhanh hơn thì **nâng
      `gasLimit` trong genesis**, không cần thêm phần cứng.
- [x] M9.6 — **Đợt ngắn có kiểm soát trên C-CHAIN để explorer có dữ liệu thật**
      (David duyệt 2026-08-25). 3 phút · 50 TPS · 10 ví · `--c-chain --tps 50`.

| | trước | sau |
|---|---|---|
| Block C-Chain | **9** | **113** |
| Giao dịch explorer index | ~0 | **9.004** |

      Đo được: **48,0 TPS chốt** · 8.975 gửi **0 lỗi** · RPC công khai p50 **19ms**,
      xấu nhất 42ms, **hỏng 0/35** · **Blockscout chậm trung bình 0,3 block** (bám kịp
      thời gian thực) · đĩa vẫn 92% trống.

      **Chi phí ròng ~0,0000000004 LOVE9**: nạp 10 LOVE9 cho ví gửi rồi **quét trả lại
      9,999999999622** — ví gửi là ví dùng một lần, không quét lại là mất vĩnh viễn,
      mà trên C-Chain đó là quỹ THẬT chứ không phải tiền chơi như trên L1 đo tải.

      **Hai tải chạy chồng nhau không hại nhau:** lúc đó L1 vẫn đang bơm ~260 TPS,
      cộng 48 TPS trên C-Chain ⇒ ~308 TPS tổng, RPC công khai vẫn 13–62ms. Đây là
      dữ liệu tốt hơn tôi dự đoán — tôi từng cảnh báo hai tải dùng chung CPU sẽ đá
      nhau; ở mức tải này thì không.
- [~] M9.4 — Preset **"thông lượng cao"** — hệ quả trực tiếp của M9.3.
      **Preset XONG, phần ĐO còn treo.**

      `thong-luong-cao`: `gasLimit` 12M → **60M**, `targetGas` 60M → **300M** (giữ
      đúng tỉ lệ 5× của khuôn gốc — nâng gasLimit mà quên `targetGas` là chain vừa
      dùng hết công suất mới đã bị coi là "trên mức mục tiêu" và **thuật toán phí tự
      đẩy baseFee lên**, tức nâng trần rồi tự phạt người dùng vì đã dùng cái trần đó).

      Kèm một bản vá chung: `createChain` nay **đồng bộ `gasLimit` ở gốc genesis từ
      `feeConfig`** — subnet-evm đòi hai chỗ bằng nhau (`core/genesis.go:456`), nên
      trước đây preset nào đổi thông lượng cũng sẽ đẻ ra chain không khởi động nổi.
      Nay `feeConfig` là nguồn sự thật duy nhất.

      **Nghiệm thu trên chain thật (9121):** `gasLimit` đọc từ **header block** =
      60.000.000, chain vẫn chốt giao dịch bình thường. Đo trên header chứ không đọc
      lại file genesis mình vừa ghi — đọc genesis chỉ chứng minh "ta viết đúng thứ ta
      định viết", đúng loại bằng chứng vô giá trị mà cả mốc M5 sinh ra để chối bỏ.

      🔴 **CÒN LẠI: chưa đo trần TPS thật.** Phép chia cho 1.428 TPS
      (60M ÷ 21.000 ÷ 2s), nhưng ở mức đó **máy mới là thứ đụng trần** chứ không phải
      genesis — M9.3 đã thấy máy ở 36% khi genesis đụng trần 260 TPS. Không có số đo
      thì 1.428 vẫn là phép chia, không phải sự thật. `moTa` vì vậy chỉ hứa "gấp 5
      lần số giao dịch mỗi block" (đúng theo định nghĩa), **không** hứa gấp 5 lần TPS.
- [ ] M9.5 — [human] Có đưa số liệu này lên trang công khai không, và dưới dạng nào.
      **Khuyến nghị:** một **nhịp tim** chậm (1 giao dịch/10–60 giây, từ địa chỉ đặt
      tên rõ) để chiều cao block nhúc nhích — C-Chain công khai hiện mới ở **block
      thứ 9**, người lạ mở trang sẽ tưởng chain chết. Cộng với **bài đo theo yêu
      cầu** có nhãn rõ ràng. **KHÔNG** bơm giao dịch tự sinh liên tục rồi trình bày
      như hoạt động thật: vừa là bịa số liệu, vừa phản tác dụng — một máy đếm
      "9 TPS" chạy vĩnh viễn làm chain trông chậm hơn thực tế 30 lần.

---

## Chờ David — KHÔNG code thay được

- [human] **Tokenomics**: supply cap 720,000,000 LOVE9 (đang kế thừa từ Avalanche, chưa ai duyệt) ·
  tỉ lệ 40/20/20/5/15 + lịch vesting (chưa có phê duyệt kinh doanh/pháp lý) · uptime 80%→90%
- [human] **ACP-77** (`ConvertSubnetToL1Tx`): hiện là subnet cổ điển. Đây là **quyết định kinh tế**
  (L1 chuẩn có phí duy trì liên tục), không phải task kỹ thuật. Chốt tokenomics trước.
- [human] **Mở console công khai hay không** (M4.5)
- [human] URL Cosmos REST của C1 (`:1317`) để dashboard kéo C1 live
