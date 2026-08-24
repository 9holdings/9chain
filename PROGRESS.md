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

- [ ] M0.1 — Commit lớp chủ quyền vào nhánh `9chain-a1` trong `upstream/avalanchego`
- [ ] M0.2 — `git init` gốc dự án + commit đầu (loại `upstream/`, loại secrets)
- [ ] M0.3 — Export patch series `patches/` + `scripts/apply-sovereign.sh` (sống sót cả khi mất `upstream/`)
- [ ] M0.4 — `.gitattributes` chống CRLF war (KB: patch fail toàn bộ 5 file khi git Windows/WSL lệch)
- [ ] M0.5 — Kiểm chứng khôi phục: cây sạch → apply → **build image thành công**

**Điều kiện qua M0:** từ một bản copy chỉ có root repo + `patches/`, chạy
`apply-sovereign.sh` rồi `docker build` ra image chạy được `--version` in đúng `9chaingo`.
Và `git status --porcelain` ở cả 2 repo ra **0 dòng** (`??` cũng tính — KB 9chain).

---

## M1 — Bộ đo + smoke test E2E

**Vì sao sớm:** hiện **không có test tự động nào**; mọi nghiệm thu là thủ công.
Mọi mốc sau đều cần đo, nên xây thước trước khi cưa.

- [ ] M1.1 — `probe-net.mjs`: poll C-Chain RPC liên tục, ghi nhận gián đoạn (ms) + tỉ lệ lỗi
- [ ] M1.2 — `smoke-l1.mjs`: đẻ chain → probe giao dịch thật → kiểm `/chains/` → báo cáo
- [ ] M1.3 — Chạy thật trên server: **đo gián đoạn C-Chain trong lúc đẻ 1 chain**
- [ ] M1.4 — Ghi số đo vào DECISIONS (số này quyết định M2 làm hay không)

**Điều kiện qua M1:** có con số thật "đẻ 1 chain làm C-Chain RPC chết N giây / M request lỗi".

---

## M2 — Rolling restart khi track subnet mới

**Vì sao:** `console/server.mjs:181` gọi `docker compose up -d` → recreate **cả 5 node
gần như cùng lúc** mỗi lần đẻ chain. Nội bộ 2 chain không ai thấy; công khai thì mỗi lượt
người lạ bấm nút = cả mạng mất quorum. Đây là mắt xích gãy đầu tiên khi mở self-serve.
**Chỉ làm nếu M1.3 cho thấy gián đoạn thật.**

- [ ] M2.1 — Restart tuần tự từng node, chờ `health.health` xanh mới sang node kế
- [ ] M2.2 — Chạy lại M1.3, so số trước/sau

**Điều kiện qua M2:** gián đoạn C-Chain đo được **giảm rõ rệt** so với M1.3 (không phải "code trông đúng").

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
- [ ] M4.3 — Cap tổng số chain (mỗi chain = 1 slot track vĩnh viễn trên cả 5 node)
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

- [ ] M7.1 — Backup `console-chains.json` (danh bạ L1 duy nhất, 1 bản trên server)
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
