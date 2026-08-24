# PROGRESS — 9Chain-A1 (phần CHAIN)

Backlog autopilot. Explorer là dự án khác (`C:\PROJECTS\9Scan-A1`) — **không làm ở đây**.
Nhật ký chi tiết lịch sử: `docs/PROGRESS.md`. Bàn giao: `HANDOFF.md`.

Trạng thái: `[ ]` chưa làm · `[x]` xong **và đã verify end-to-end thật** · `[blocked]` kẹt · `[human]` cần David.

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
- [blocked] M0.6 — Build image từ cây phục hồi (`--version` in `9chaingo`) — Docker Desktop
      không khởi động được trên máy dev, xem BLOCKERS B-1

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

- [ ] M3.1 — netgen sinh compose có IPv6 network, mỗi node một GUA từ khối `/64`
- [ ] M3.2 — `--public-ip` = IPv6 thật, publish `9651`, `--bootstrap-ips` IPv6
- [ ] M3.3 — [human] AAAA record `bootstrap-a1.9chain.org` trên Cloudflare (**DNS-only**, không mây cam)
- [ ] M3.4 — `docs/RUN-A-NODE.md` + compose mẫu 1 node cho cộng đồng
- [ ] M3.5 — Kiểm chứng từ VPS NGOÀI: bootstrap xong + `info.peers` thấy node 9Chain-A1

**Điều kiện qua M3:** một node ở máy khác **thật sự là peer**, không phải "cổng mở".

---

## M4 — Self-serve đẻ chain (console ra công khai)

**Phụ thuộc M2.** Đây là điểm bán hàng của cả A1 mà hiện chỉ chạy qua SSH tunnel.

- [ ] M4.1 — Auth bằng chữ ký ví (SIWE) thay `A1_CONSOLE_TOKEN` tĩnh; địa chỉ ký **chính là** `admin`
- [ ] M4.2 — Bật `A1_TRUST_PROXY=1` + hạn mức theo **địa chỉ ví**, không chỉ IP
- [x] M4.3 — Cap tổng số chain — **HOÁ RA LÀ TRẦN CỨNG CỦA GIAO THỨC, KHÔNG PHẢI
      CON SỐ TUỲ CHỌN.** Đã chặn ở console (mặc định 15, trần tuyệt đối 16). Xem D-009.
- [ ] M4.4 — Endpoint thu hồi chain (hiện không có đường lùi → rác tích luỹ một chiều)
- [ ] M4.5 — [human] Caddy route console + Cloudflare Access / mTLS — **David duyệt trước khi mở**

**Điều kiện qua M4:** một ví lạ, không có token, đẻ được chain của chính nó từ Internet.

---

## M5 — Template + precompile chọn được

`l1-evm-genesis.json` hiện cố định, chỉ thay `chainId`/`alloc`/`feeManager`.

- [ ] M5.1 — Chọn preset: gasless (fee=0) · native minter · deployer allowlist · tx allowlist
- [ ] M5.2 — Giao diện console + validate preset
- [ ] M5.3 — Đẻ thật mỗi preset 1 chain, gửi giao dịch thật chứng minh preset có hiệu lực

---

## M6 — Warp/ICM cross-L1

Demo mạnh nhất của A1; tiêu chí "Interop" đang tự chấm 3/5 trong dashboard.

- [ ] M6.1 — Bật Warp precompile trong genesis template
- [ ] M6.2 — Chuyển tài sản giữa 2 L1 do người dùng đẻ ra, có bằng chứng giao dịch 2 đầu

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
- [ ] M7.2 — `ufw-cloudflare-only.sh` — giữ **9651 mở** (và 9651/tcp6 sau M3)
- [ ] M7.3 — `/api/metrics` cho dashboard + 9Scan-A1 (chờ 9Scan chốt yêu cầu ở KICKOFF của họ)
- [ ] M7.4 — `rmdir "C:\PROJECTS\MetaChain"`

---

## Chờ David — KHÔNG code thay được

- [human] **Tokenomics**: supply cap 720,000,000 LOVE9 (đang kế thừa từ Avalanche, chưa ai duyệt) ·
  tỉ lệ 40/20/20/5/15 + lịch vesting (chưa có phê duyệt kinh doanh/pháp lý) · uptime 80%→90%
- [human] **ACP-77** (`ConvertSubnetToL1Tx`): hiện là subnet cổ điển. Đây là **quyết định kinh tế**
  (L1 chuẩn có phí duy trì liên tục), không phải task kỹ thuật. Chốt tokenomics trước.
- [human] **Mở console công khai hay không** (M4.5)
- [human] URL Cosmos REST của C1 (`:1317`) để dashboard kéo C1 live
