# HANDOFF — 9Chain Testnet A1 (Avalanche)

Cập nhật: 2026-08-25 (phiên autopilot)

## ▶ Phiên sau bắt đầu từ đâu

🔴 **ĐỌC `PROGRESS.md` TRƯỚC** — từ 2026-08-25 backlog nằm ở đó, không phải file này.
Kèm `DECISIONS.md` (vì sao làm vậy) và `BLOCKERS.md` (đang chờ David cái gì).

**Sức khoẻ lúc chốt (đo thật):** 5/5 validator connected · **5 L1** trong danh bạ ·
smoke test **20/20 đạt** · đẻ chain đầy đủ có gửi giao dịch thật, chốt sau 0.1s.

**Phiên autopilot 2026-08-25 làm xong 3 mốc:**
- **M0** — dự án nay **có git**. Trước đó toàn bộ lớp chủ quyền (6 file identity đã sửa
  + 1079 dòng Go công cụ) là uncommitted/untracked, một lệnh `git checkout .` là mất sạch.
- **M1** — có **bộ đo + smoke test E2E** (trước đây không có test tự động nào).
- **M2** — đẻ 1 chain làm RPC công khai chết **6.0s → 0.5s** (đo thật, 12 lần tốt hơn).

**Hai phát hiện đổi cách nghĩ về sản phẩm** — xem `DECISIONS.md` D-009 và `BLOCKERS.md` H-2:
- 🔴 **Trần cứng 16 L1**: node track quá 16 subnet bị **mọi peer cắt kết nối** lúc bắt
  tay P2P (`network/peer/peer.go:882`). Mạng vỡ, không phải chậm đi. Hiện **5/15**.
  Console đã chặn. ⇒ **ACP-77 từ "việc tương lai" thành thứ duy nhất mở được trần.**
- 🔴 **Repo chưa có remote** — code vẫn chỉ nằm trên một ổ đĩa (H-6, cần David chọn
  nơi đặt + private/public).

**Explorer là dự án KHÁC: `C:\PROJECTS\9Scan-A1`** — có backlog riêng đang chạy dở
(M2 `/chains/`). Muốn làm explorer thì mở phiên ở thư mục đó và đọc `PROGRESS.md`,
đừng làm từ repo này.

## TL;DR
**Testnet công khai ĐÃ LIVE**: https://testnet-a1.9chain.org · RPC https://rpc-testnet-a1.9chain.org
5 validator chạy trên server nhà cung cấp `139.99.145.13`, Blockscout index đầy đủ, faucet + nút "Thêm vào MetaMask" hoạt động. **P0 #1/#2/#3 đều PASS.**

**Nút "đẻ chain" CHẠY THẬT trên mạng công khai**, hiện **5 L1** trong danh bạ (9100–9104).
Ví chain-factory: **9 LOVE9** trên P-Chain ≈ **63,600 lượt đẻ chain** (0.000141468 LOVE9/lượt).

⏱️ **Đẻ 1 chain nay mất ~170 giây, không phải 12s như trước — đây là CHỦ Ý, không phải lỗi.**
Node restart lần lượt (mỗi node ~30s) thay vì đồng loạt, để mạng không mất quorum giữa chừng.
Đổi lại RPC công khai chỉ gián đoạn **0.5s** thay vì 6.0s. Xem `DECISIONS.md` D-008.
Với self-serve (M4) thì 170s là tệ cho người bấm nút — chưa tối ưu, biết và chấp nhận.

A1 = 1 trong 2 testnet song song (A1=Avalanche, C1=Cosmos) để cộng đồng chọn hướng mainnet 9Chain (David chốt: **hướng public đại chúng**).
Thư mục: A1 `C:\PROJECTS\9Chain-A1` · C1 `C:\PROJECTS\9Chain-C1` (đội khác vận hành, KHÔNG đụng).

🔴 **Explorer đã tách ra dự án riêng: `C:\PROJECTS\9Scan-A1`** (2026-08-24). Repo này lo **chain** (node, console, faucet, ví, Caddy, deploy); explorer lo **giao diện + đọc dữ liệu**. Hai bên chạy song song — **đừng lấn sân**. Explorer cần endpoint mới trên node thì họ ghi yêu cầu vào `KICKOFF.md` của họ rồi báo sang, không tự sửa ở đây.
Mục tiêu của 9Scan-A1 là **thay Blockscout**: đo trên server, Blockscout ngốn 10 container / 32–75% CPU / ~750MB chỉ để index **1 chain có 8 block** — trong khi cả 5 node avalanchego chỉ 18,5% CPU. Với sản phẩm multi-L1 thì một-instance-một-chain chết từ chain thứ ba.

---

## Hạ tầng đang chạy

| | |
|---|---|
| Trang testnet | https://testnet-a1.9chain.org — Blockscout ở gốc · `/faucet/` · `/chains/` · `/dashboard/` · `/lite/` |
| Danh bạ L1 | `/chains/` — mọi chain do console đẻ ra + tình trạng thật. Container `9chain-a1-chains` (nginx, `127.0.0.1:8093`), đọc `console-chains.json` qua alias `/data/console-chains.json`. **Dấu hiệu sống là SỐ VALIDATOR của subnet**, không phải chiều cao block. Mỗi L1 hiện thêm **Chủ sở hữu (admin)**; chain đẻ trước khi có ô này (OmegaChain) hiện "mặc định của hệ thống", không được để lọt `undefined`. |
| RPC công khai | https://rpc-testnet-a1.9chain.org/ext/bc/C/rpc |
| MetaMask | Chain ID `9000000009` · Symbol `LOVE9` (có nút 1 cú bấm ở `/faucet/` và `/lite/`) |
| Server | `139.99.145.13` (`(không công bố)`), Ubuntu LTS, 8 luồng / 62GB / RAID1 410GB |
| SSH | `ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST"` (key không passphrase, mật khẩu đã tắt) |
| DNS | 2 A record → `139.99.145.13`, Cloudflare **Proxied**, SSL/TLS mode **Full** |

**Ví chain-factory** (khoá trên server, `console.env`): P-Chain `P-love91vgh2whn746dzzvg0dj4w9rsqvlalcldvpueuvj` · **9 LOVE9** · khoá gốc ở `local-net/net-public/chain-factory-key.txt` (chỉ máy dev). Hết tiền thì nạp lại từ quỹ Ecosystem theo cách ghi ở `local-net/net-public/allocation.md`.

**Loopback-only (SSH tunnel, KHÔNG public):**
```bash
ssh -i "$A1_SSH_KEY" -L 8091:127.0.0.1:8091 -L 8090:127.0.0.1:8090 "$A1_SSH_HOST"
```
- Console đẻ chain `:8091` — token ở `~/9chain-a1/console.env` **trên server**.
- Ví X/P `:8090` — **khoá server giữ, KHÔNG có auth**; public là mất sạch ví đó.

**Bố cục trên server:** `~/9chain-a1/{src,net,caddy.env,console.env}` · Blockscout ở `src/explorer-full/blockscout/docker-compose` (UI `127.0.0.1:8100`).

---

## Việc tiếp

🔴 **Backlog nằm ở `PROGRESS.md`, không phải ở đây.** Đừng chép việc vào file này —
hai danh sách sẽ trôi lệch nhau. `BLOCKERS.md` liệt kê thứ đang chờ David.

Tóm tắt để khỏi mở file: **M0–M2 xong** (git · smoke test E2E · gián đoạn 6.0s→0.5s).
**Chưa làm, không bị chặn:** M3 IPv6 cho node · M4.1 SIWE auth · M5 template/precompile ·
M6 Warp/ICM · M7.2 ufw. **Chờ David:** trần 16 L1 ⇒ quy mô bán multi-L1 (H-2) ·
git remote (H-6) · tokenomics (H-1) · mở console công khai (H-3) · AAAA record (H-4).

### Đã kiểm chứng trên mạng công khai (đừng làm lại)
- **Đẻ chain chạy thật** — 6 lỗi chồng nhau đã gỡ (chi tiết: `docs/PROGRESS.md`).
  Tiền là mắt xích cuối và rẻ nhất: 0.000141468 LOVE9/lượt.
- **Chain thuộc về người bấm nút** — `POST /api/create` nhận `admin`, dùng cho **cả**
  `alloc` genesis **lẫn** `feeManagerConfig.adminAddresses`. Chứng minh bằng ví lạ trên
  `OwnerTest`: ví đó 50M token + FeeManager **Admin**, quỹ Foundation **0** + **None**.
- **Danh bạ `/chains/` hiện chủ sở hữu**, chain thiếu khoá `admin` hiện "mặc định của
  hệ thống" — thiếu khoá là trạng thái **hợp lệ**, không phải lỗi.

**Địa chỉ admin validate bằng EIP-55** (`local-net/lib/eip55.mjs`, keccak-256 viết tay vì
thư mục gốc trên server không có node_modules). Khắt khe vì genesis đã đẻ là **bất biến**:
sai một ký tự hex là chain **vĩnh viễn vô chủ**, không lỗi, không dấu hiệu.
Tự kiểm: `node local-net/lib/eip55.mjs --self-test`.

---

## Bí mật — quy tắc cứng
- `local-net/net-public/keys.txt` = **khoá thật của 5 quỹ testnet công khai**. Giữ offline, `.gitignore` sẵn, **KHÔNG BAO GIỜ** lên server.
- File duy nhất được phép lên server: `faucet.env`.
- `local-net/net/` = bộ **dev local** (genesis khác `net-public/`). Đừng lẫn hai bộ.

---

## Chuẩn đặt tên (chốt 2026-08-24)
Mọi thứ dùng `9chain-a1`, bỏ hẳn "MetaChain/META".
Identity: client `9chaingo` · token **LOVE9** · HRP `love9` · VM `love9evm` (VMID `pkqXszJe86D3xLomib9bLpXPfW7gr7FPhDAbg46p5iNjrn4mf`) · networkID **9001** (uint32) · EVM chainId **9000000009**.
Env dùng tiền tố `A1_*` (tên biến không được bắt đầu bằng số).

---

## Gotchas

### Thêm từ phiên 2026-08-25 (đều đo được, không suy đoán)
- 🔴 **Trần cứng 16 subnet/node.** Peer khai >16 subnet lúc bắt tay P2P thì node nhận
  gọi `p.StartClose()` — **cắt kết nối** (`network/peer/peer.go:882`), và bên gửi
  KHÔNG cắt bớt danh sách (`message/outbound_msg_builder.go:266`). Track quá 16 L1 là
  bị mọi peer ngắt: **mạng vỡ**, và vỡ kiểu khó đoán nhất — node vẫn chạy, log phía nó
  vẫn sạch. Console đã chặn ở hai chỗ. Trần này là của **mô hình "mọi validator track
  mọi L1"**, vượt qua phải đổi kiến trúc (ACP-77), không phải nới số.
- 🔴 **Bind-mount MỘT FILE + `mv` = container thấy file CŨ vĩnh viễn.** Docker gắn theo
  **inode**; `mv` tạo inode mới ở cùng đường dẫn. Ác ở chỗ mọi dấu hiệu đều báo thành
  công: `grep` trên host thấy bản mới, `caddy validate` in "Valid configuration",
  `caddy reload` không lỗi — **cả hai đều đọc file cũ**. Đo được: host inode `25045995`
  vs container `25043225`. Phải `cp` (giữ inode) rồi **so md5sum host với trong
  container**. Lỡ `mv` rồi thì chỉ còn recreate (đo được: Caddy recreate tốn **1.2s**).
  Trong dự án này: `Caddyfile` và `chains-nginx/default.conf` là mount file đơn lẻ;
  `9chain-a1-config/` và `local-net/chains/` là mount thư mục (an toàn).
- 🔴 **KHÔNG chờ `health.health` trả `healthy:true` giữa đợt rollout subnet mới** — đó
  là **deadlock theo thiết kế**. Node đầu tiên track subnet mới là node duy nhất trên
  subnet đó → `connected to 20%; required at least 80%`; nó chỉ khoẻ khi các node khác
  cũng restart, mà chúng chờ nó khoẻ. Và **không lọc bằng `?tag=` được**: check
  `bootstrapped` đăng ký `ApplicationTag` (toàn cục) nên luôn có mặt. Điều kiện đúng:
  đọc riêng `P`/`X`/`C`, đòi không có `error`.
- **`/ext/health/liveness` là tín hiệu YẾU** — trả 200 ngay khi HTTP server lên, TRƯỚC
  khi C-Chain sẵn sàng. Dùng nó cho health check của Caddy thì Caddy quay lại node
  chưa sẵn sàng quá sớm. Cách chữa: để **passive thắng** (`fail_duration 30s`,
  `max_fails 1`) — Caddy đòi cả hai điều kiện đạt nên liveness xanh sớm không kéo node về sớm.
- **"Đã chép ≠ đang chạy".** Upload console rồi quên restart là bản cũ vẫn phục vụ, không
  dấu hiệu nào. Dùng `console-deploy.sh` (gộp chép + restart + đối chiếu md5sum).
- **`docker compose config --services` KHÔNG giữ thứ tự trong file** (trả node-4 trước
  node-1). Thứ tự ngẫu nhiên làm sự cố không tái hiện được — phải tự sắp xếp.

### Bảo mật / hạ tầng
- 🔴 **Docker publish cổng ĐI VÒNG QUA ufw.** `ports: "9650:9650"` = hở thẳng ra Internet dù `ufw status` báo chặn (ufw lọc `INPUT`, Docker dùng DNAT bảng `nat`). Kiểm tra thật bằng `sudo ss -tlnp | grep 9650`, **đừng tin `ufw status`**.
- 🔴 **Ubuntu cloud image: sửa `PasswordAuthentication` trong `/etc/ssh/sshd_config` KHÔNG có tác dụng.** `Include sshd_config.d/*.conf` ở dòng 12 mà sshd lấy **giá trị gặp ĐẦU TIÊN** → `50-cloud-init.conf` thắng. Phải sửa đúng file đó + `/etc/cloud/cloud.cfg.d/99-disable-ssh-pwauth.cfg`. **Kiểm chứng bằng `sudo sshd -T | grep passwordauth`.**
- 🔴 **A1 và C1 dùng chung zone Cloudflare `9chain.org`.** SSL/TLS mode là thiết lập **cấp zone** — đổi sang `Full (strict)` là C1 chết ngay (lỗi 526, C1 dùng cert tự ký). **Trước khi đổi bất kỳ thiết lập cấp zone/tài khoản nào, kiểm tra ai khác đang dùng chung.**
- **Cloudflare Proxied**: ACME không xin được cert (C1 đã thử, thất bại 2026-07-19) → dùng `tls internal`. IP thật ở header **`CF-Connecting-IP`** — không xử lý thì rate-limit gom cả thế giới vào 1 khoá. Đặt `A1_TRUST_PROXY=1`, kiểm chứng bằng `/faucet/whoami`.
- **Đổi cấu hình Caddy phải `caddy reload`, KHÔNG `--force-recreate`** — recreate làm Caddy chết vài giây, ví poll RPC mỗi ~4s nên MetaMask hiện "Unable to connect" và **giữ nguyên banner** tới khi người dùng đổi mạng qua lại.
- **`pkill` không giết `node.exe` trên Windows** → `netstat -ano | grep :PORT` rồi `taskkill //F //PID`. Từng để console CŨ (bind `0.0.0.0`, chưa auth) sống song song bản mới; `localhost` phân giải `::1` nên request rơi vào bản cũ. **Siết bảo mật xong phải kiểm tra tiến trình cũ đã chết hẳn.**
- 🔴 **`ssh host 'pkill -f "console/server.mjs"; ... khởi động lại'` TỰ GIẾT CHÍNH NÓ.** `pkill -f` khớp trên **toàn bộ dòng lệnh**, mà dòng lệnh `bash -c` của phiên ssh có chứa đúng chuỗi đó → shell chết trước khi kịp bật lại, console nằm im mà không báo lỗi gì. Dùng mẹo ngoặc vuông: `pkill -f "[c]onsole/server.mjs"`. Sau khi bật lại **luôn kiểm chứng bằng `ss -tlnp | grep 8091` từ một phiên ssh KHÁC**, đừng tin dòng banner trong log (log cũ trông y hệt).

### Web / giao diện
- 🔴 **Trang public KHÔNG được cắm cứng `localhost` làm endpoint.** Trình duyệt người xem phân giải `localhost` thành MÁY HỌ → trang tải từ server nhưng số liệu lấy từ máy khách. Explorer + dashboard đều đã dính. Suy từ `location.hostname` (quy ước: trang ở `<host>`, RPC ở `rpc-<host>`).
- **Avalanche KHÔNG đẻ block rỗng** — chain chỉ sinh block khi có giao dịch. Số block đứng yên là BÌNH THƯỜNG, không phải chain chết. Đã ghi giải thích ngay trên trang explorer.
- MetaMask **chỉ nhận chainId dạng hex** (`0x218711a09`), truyền số thập phân sẽ lỗi.

### Đẻ chain / subnet
- 🔴 **Track ≠ validate.** Subnet mới đẻ có tập validator RỖNG. Chain đó vẫn trả lời `eth_chainId`, vẫn đọc được số dư, MetaMask vẫn kết nối — chỉ là **giao dịch không bao giờ chốt**. Cộng với việc Avalanche không đẻ block rỗng, không có dấu hiệu bề ngoài nào phân biệt được. Nghiệm thu một L1 **bắt buộc** gửi giao dịch thật: `node local-net/faucet/probe-l1.mjs <RPC_URL> [PRIVKEY]`.
- Validator subnet (hậu Durango) **phải** đang là validator primary; thời hạn ≥ 24h và **không vượt hạn primary** — CLI trừ hao 60s vì P-Chain tiến timestamp lúc đang ký.
- **`docker compose exec` KHÔNG mang env của tiến trình gọi nó vào container** — phải `-e VAR=...` tường minh.
- **`execFile` nhét nguyên dòng lệnh vào `err.message`** → truyền khoá bằng `-e` rồi trả `e.message` cho client là ném khoá ra ngoài. Console đã bọc `docker()` để xoá khoá.
- Hậu Etna, P-Chain dùng **phí động**; các số của `info.getTxFee` (`createSubnetTxFee: 0.1 LOVE9`) **không còn được dùng**. Phí thật đo được: **0.000141468 LOVE9/lượt đẻ chain**.
- Luồng hiện tại là **subnet cổ điển** (`AddSubnetValidatorTx`), CHƯA phải L1 chuẩn ACP-77 (`ConvertSubnetToL1Tx`) — nên chưa có phí duy trì liên tục.
- 🔴 **Tự cấp chainId KHÔNG được dùng `9100 + số chain`.** Chỉ cần một lượt trước đó tự chọn chainId là công thức đếm đâm trúng số đã dùng (OmegaChain chọn 9101, chain thứ hai tự cấp cũng ra 9101). Hai L1 trùng chainId là hố sụt: MetaMask coi chúng là **một mạng**, và chữ ký của chain này **phát lại được** trên chain kia. Console nay quét số còn trống và chặn chainId trùng.
- **Địa chỉ admin phải validate bằng EIP-55, không chỉ regex 40 hex.** Genesis đã đẻ là bất biến; gõ sai 1 ký tự vẫn "đúng hình thức" và chain ra đời **vô chủ vĩnh viễn** — không lỗi, không dấu hiệu. `local-net/lib/eip55.mjs` tự viết keccak-256 vì `~/9chain-a1/src` trên server **không có package.json/node_modules**: thêm `import ... from "ethers"` là console chết lúc khởi động dù máy dev chạy ngon.
- **`console-chains.json` là hợp đồng dữ liệu với trang `/chains/`** — nay có thêm khoá `admin`. Thêm khoá thì an toàn, **đổi/bỏ khoá cũ là làm hỏng trang danh bạ**. Khoá mới **chỉ có trên bản ghi mới**: OmegaChain (đẻ trước) không có `admin`. Mọi trang đọc file này phải coi khoá thiếu là trạng thái hợp lệ ("mặc định"), không phải lỗi — và tuyệt đối không để `undefined` lọt ra mặt người dùng.
- **Container `9chain-a1-chains` bind-mount thẳng `~/9chain-a1/src/local-net/chains` (ro)** → `scp` xong là trang đổi ngay, **không cần restart/rebuild**. Nhưng kiểm chứng phải xem **trang thật qua Cloudflare**, không chỉ `curl 127.0.0.1:8093`: trang này render toàn bộ bằng JS sau khi fetch RPC, `curl` chỉ thấy khung HTML rỗng.

### avalanchego / fork
- **Tham số kinh tế mạng tuỳ chỉnh KHÔNG đọc từ `genesis.GetStakingConfig`** — `config/config.go` chỉ khoá cứng cho Mainnet/Fuji; mọi networkID khác lấy từ **cờ CLI viper** mặc định `LocalParams`. Thêm `case A1NetworkID` vào `params.go` là **chưa đủ**, phải vá cả `getStakingConfig` và `getTxFeeConfig`. Kiểm tra: `docker logs 9chain-a1-node-1 2>&1 | head -1 | grep -o '"maxValidatorStake":[0-9]*'` → phải ra `50000000000000000`.
- **KHÔNG build native trên Windows** (`utils/ulimit`) → luôn qua Docker.
- **Re-rebrand**: `rebrand.sh` tìm chuỗi GỐC upstream; đã rebrand rồi phải `git checkout --` 4 file identity trước.
- **Đổi EVM chainId / phân bổ genesis = re-genesis** → `docker compose ... down -v` rồi up; wipe cả Blockscout DB.
- `--http-allowed-hosts` mặc định `["localhost"]` → dịch vụ gọi node qua tên khác bị chặn với lỗi khó đoán (`JsonRpcProvider failed to detect network`). netgen nay luôn set cờ này.
- **Bind loopback làm container mất đường tới node**: `host.docker.internal` trỏ IP bridge, không phải loopback host. Cách đúng: `--network net_a1net` + `http://172.28.0.11:9650`.
- netgen `--public-ip` = IP nội bộ docker → node NGOÀI không join P2P được.
- networkID Avalanche là **uint32** — không thể là 9000000009; chỉ EVM chainId mới là số 9 tỷ.
- L1 EVM chưa bật Durango → compile contract `evmVersion:"paris"` (không PUSH0).

### Blockscout
- 🔴 **`dets`/`logs` sai đường dẫn VÀ sai UID** → backend crash-loop `{:file_error, "./dets/queue_storage", :eacces}` chôn trong stack trace Erlang. Compose giải `./dets/` tương đối theo **thư mục chứa file khai** (`services/backend.yml`) → là `services/dets`. Process chạy UID **10001**, không phải 1000. Đã đóng gói vào `explorer-full/9chain-a1-server.env.sh`.
- **nginx cache DNS lúc khởi động** — proxy lên khi backend còn crash sẽ giữ mãi 502; `docker restart proxy frontend` sau khi backend ổn.
- API v2 ở **cổng UI** (`/api/v2/...` trên 8100), không phải 8101.
- Nút "Add network to MetaMask" chỉ hiện khi có `NEXT_PUBLIC_NETWORK_RPC_URL`.
- `explorer-full/setup.sh` cắt block cũ theo marker rồi append lại (bản đầu dùng `grep -q || cat >>` sai chuỗi → append trùng mỗi lần).

---

## Lệnh hữu ích

```bash
cd /c/PROJECTS/9Chain-A1
bash local-net/gen-network.sh 5                        # sinh mạng dev local
A1_NET_DIR=local-net/net-public bash local-net/gen-network.sh 5   # sinh bộ public (khoá mới)
bash local-net/up-all.sh                               # bật stack local (cần A1_CONSOLE_TOKEN)
docker compose -f local-net/net/docker-compose.multinode.yml up -d
```

```bash
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'docker ps --format "{{.Names}}\t{{.Status}}"; uptime; df -h /'
```

```bash
curl -s -X POST -H 'content-type:application/json' --data '{"jsonrpc":"2.0","id":1,"method":"platform.getCurrentValidators"}' https://rpc-testnet-a1.9chain.org/ext/bc/P | python -c "import json,sys; v=json.load(sys.stdin)['result']['validators']; print(len(v),'validators,',sum(1 for x in v if x.get('connected')),'connected')"
```

```bash
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'docker exec 9chain-a1-caddy caddy reload --config /etc/caddy/Caddyfile'
```

Nghiệm thu tự động — **dùng cái này thay cho mở trang nhìn bằng mắt**:
```bash
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'cd ~/9chain-a1/src && node local-net/faucet/smoke-l1.mjs'
```
Chế độ nhẹ chỉ đọc, không tốn tiền, chạy bao nhiêu lần cũng được. Thêm `--de-chain`
để nghiệm thu đường đẻ chain đầy đủ (đẻ chain thật + giao dịch thật + đo gián đoạn)
— **để lại một L1 vĩnh viễn trong danh bạ**, đừng chạy trong vòng lặp.

Đo gián đoạn RPC trong lúc làm thao tác nặng:
```bash
node local-net/faucet/probe-net.mjs https://rpc-testnet-a1.9chain.org/ext/bc/C/rpc --giay 120
```

Đồng bộ console lên server (chép + khởi động lại + **tự kiểm chứng**, một lệnh):
```bash
bash local-net/deploy/console-deploy.sh
```

Đổi cấu hình Caddy (`cp` giữ inode + so md5sum + validate + reload, **không** recreate):
```bash
scp -i "$A1_SSH_KEY" local-net/deploy/Caddyfile "$A1_SSH_HOST":'~/9chain-a1/Caddyfile.new' && ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" '~/9chain-a1/caddy-deploy.sh'
```

Đồng bộ trang danh bạ L1 (bind-mount → có hiệu lực ngay, không restart):
```bash
scp -i "$A1_SSH_KEY" local-net/chains/index.html "$A1_SSH_HOST":'~/9chain-a1/src/local-net/chains/'
```

Đẻ thử một chain có chủ riêng (chạy TRÊN server; đổi `<0xADMIN>` thành ví của bạn):
```bash
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'set -a; . ~/9chain-a1/console.env; set +a; curl -sS -X POST http://127.0.0.1:8091/api/create -H "content-type: application/json" -H "authorization: Bearer $A1_CONSOLE_TOKEN" -d "{\"name\":\"TenChain\",\"admin\":\"<0xADMIN>\"}"'
```

Tài liệu: `docs/PROGRESS.md` (nhật ký chi tiết) · `docs/DEPLOY-KSGAME.md` (runbook server) · `docs/TOKENOMICS.md` · `docs/DEPLOY-TESTNET.md` (đa VPS, đường lên mainnet) · `docs/ARCHITECTURE.md`.
