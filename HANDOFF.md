# HANDOFF — 9Chain Testnet A1 (Avalanche)

Cập nhật: 2026-08-24 (chốt phiên)

## ▶ Phiên sau bắt đầu từ đâu

**Sức khoẻ lúc chốt (đo thật):** 5/5 validator connected · C-Chain block `0x9` ·
`/` `/faucet/` `/chains/` `/dashboard/` `/lite/` đều 200 · **2 L1** trong danh bạ
(OmegaChain, OwnerTest).

Repo này (**chain**) không còn việc nào đang dở. Việc còn lại đều nằm ở mục
"Chưa làm, không chặn" bên dưới, và **phần lớn cần David quyết** (tokenomics, IPv6,
ufw). Ba việc kỹ thuật làm được ngay nếu muốn: IPv6 cho node (để cộng đồng tự chạy
node) · `ufw-cloudflare-only.sh` · URL Cosmos REST của C1 cho dashboard.

**Explorer là dự án KHÁC: `C:\PROJECTS\9Scan-A1`** — có backlog riêng đang chạy dở
(M2 `/chains/`). Muốn làm explorer thì mở phiên ở thư mục đó và đọc `PROGRESS.md`,
đừng làm từ repo này.

## TL;DR
**Testnet công khai ĐÃ LIVE**: https://testnet-a1.9chain.org · RPC https://rpc-testnet-a1.9chain.org
5 validator chạy trên server nhà cung cấp `139.99.145.13`, Blockscout index đầy đủ, faucet + nút "Thêm vào MetaMask" hoạt động. **P0 #1/#2/#3 đều PASS.**

**Nút "đẻ chain" nay CHẠY THẬT trên mạng công khai** (2026-08-24). L1 đầu tiên: **OmegaChain**, chainId 9101, đẻ trong **12.7s**, 5/5 validator, giao dịch thật **chốt sau 1.4s**:
`https://rpc-testnet-a1.9chain.org/ext/bc/DCFT9G29xE94X4syYJQemTEGxrWx1ZnfH6Qea2dBZ8ujKfyXu/rpc`
Ví chain-factory: **9 LOVE9** trên P-Chain ≈ **63,600 lượt đẻ chain** (0.000141468 LOVE9/lượt).

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

### ✅ Đẻ chain — ĐÃ XONG, đã kiểm chứng trên mạng công khai
6 lỗi chồng nhau, không phải một (chi tiết đầy đủ: `docs/PROGRESS.md`). Tiền là mắt xích **cuối và rẻ nhất**.

| Lỗi | Đã sửa ở |
|---|---|
| compose 5 node không đọc `A1_TRACK_SUBNETS` → không node nào track subnet mới | `netgen` + vá tại chỗ 2 compose đã sinh |
| subnet đẻ ra có tập validator **rỗng** → RPC sống, giao dịch treo vô hạn | `9chain-a1-cli l1 create` nay đăng ký validator |
| console không truyền `A1_CLI_KEY` vào container (`compose exec` không mang env vào) | `console/server.mjs` + bọc chống rò khoá |
| thư mục config không mount vào container → CLI không đọc được genesis | `netgen` + `~/9chain-a1/net/.env` |
| console `up` làm `--http-allowed-hosts` tụt về `*` trên node công khai | ghim biến vào `~/9chain-a1/net/.env` |
| Caddy không định tuyến L1 → chain đẻ xong không ai ngoài server gọi được | thêm `/ext/bc/*/rpc` + `/ext/bc/*/ws` |

### ✅ Chain về tay người bấm nút — ĐÃ XONG (2026-08-24)
Trước đây `A1_L1_ADMIN` là **một địa chỉ duy nhất cho MỌI L1** (quỹ Foundation) → người bấm nút không sở hữu chain của mình. Nay `POST /api/create` nhận thêm **`admin`** (địa chỉ EVM), dùng cho **cả** `alloc` genesis **và** `feeManagerConfig.adminAddresses`; bỏ trống mới rơi về `A1_L1_ADMIN`. Giao diện có ô nhập + nút "dùng ví MetaMask".

Kiểm chứng trên mạng công khai — L1 **OwnerTest**, chainId 9100, admin là ví lạ `0xa37681D3371Cd3aA7220e88ba98131Da57eE970E` (KHÔNG phải quỹ):
| | ví lạ (người bấm nút) | quỹ Foundation |
|---|---|---|
| số dư genesis | 50.000.000 | **0** |
| vai trò FeeManager (`readAllowList`) | **2 = Admin** | 0 = None |

Giao dịch thật ký bằng khoá của ví lạ **chốt sau 2.2s** (block 1, status 1) — `2k5TFAvBWH2KyzmZxDpEWVhUo7KUQQraAwgsqNCyreRM9PHgHc`.

Validate địa chỉ dùng **EIP-55** (`local-net/lib/eip55.mjs`, keccak-256 viết tay vì server không có node_modules) — hoa/thường lẫn lộn mà sai checksum thì bị chặn. Lý do khắt khe: genesis đã đẻ là bất biến, sai một ký tự hex là chain **vĩnh viễn vô chủ**, không có dấu hiệu báo lỗi. Tự kiểm chứng: `node local-net/lib/eip55.mjs --self-test`.

**Nghiệm thu một L1 BẮT BUỘC gửi giao dịch thật** — RPC trả lời không chứng minh được gì:
```bash
node local-net/faucet/probe-l1.mjs https://rpc-testnet-a1.9chain.org/ext/bc/<BLOCKCHAIN_ID>/rpc <PRIVKEY>
```

### ✅ Danh bạ L1 hiện chủ sở hữu — ĐÃ XONG (2026-08-24)
`/chains/` nay có dòng **"Chủ sở hữu (admin)"** trên mỗi card L1, đặt ngay dưới badge tình trạng (trước `chainId`), tô xanh riêng (`.kv.own`) để tách khỏi metadata kỹ thuật — đây là điểm bán hàng của multi-L1: ai cũng thấy chain là của người tạo, không phải của quỹ. Có nút "📋 Chép địa chỉ chủ sở hữu" khi chain có chủ. Card **MẠNG CHÍNH** (C-Chain) không có dòng này.

Chain không khai `admin` hiện `mặc định của hệ thống (chain tạo trước khi có ô chủ sở hữu)` bằng chữ xám. Hàm `ownerCell()` kiểm cả `typeof === 'string'` lẫn `.trim()` → thiếu khoá / `undefined` / chuỗi rỗng đều rơi cùng một nhánh.

Kiểm chứng **trên trang thật** https://testnet-a1.9chain.org/chains/ (không phải đọc file): `OmegaChain` → "mặc định của hệ thống"; `OwnerTest` → `0xa37681D3371Cd3aA7220e88ba98131Da57eE970E` nguyên dạng EIP-55; footer `2 L1 + mạng chính`.

### Chưa làm, không chặn
- **Cộng đồng chưa tự chạy node được** — P2P 9651 chỉ sống trong mạng docker, host không lắng nghe. **Đừng quảng bá "chạy node cùng chúng tôi"** cho tới khi gán IPv6 công khai cho từng node (server có sẵn khối `/64`).
- `ufw-cloudflare-only.sh` (mượn từ C1) — khoá 80/443 chỉ cho dải IP Cloudflare. Chạy sau vài ngày theo dõi. **Giữ 9651 mở cho mọi nơi.**
- Số cần chốt trước mainnet: **supply cap 720,000,000 LOVE9** (đang kế thừa từ Avalanche, chưa ai duyệt) · **tỉ lệ phân bổ 40/20/20/5/15 + lịch vesting** (chưa có phê duyệt kinh doanh/pháp lý) · uptime 80%→90%.
- URL Cosmos REST của C1 (`:1317`) để dashboard kéo C1 live.
- Console vẫn **chỉ loopback + token vận hành**. Muốn người ngoài tự đẻ chain thì cần Caddy route + chống lạm dụng thật (hạn mức hiện tại 3 lượt/giờ/IP tính theo IP TCP vì `A1_TRUST_PROXY` chưa bật trong `console.env`).
- `rmdir "C:\PROJECTS\MetaChain"` (thư mục rỗng cũ).

**P1:** demo DeFi · Warp/ICM cross-L1 · template+precompile · metric thật→dashboard · explorer X/P · IPv6 cho node.
**P2:** docs onboarding · ví non-custodial · CI/E2E · chốt genesis mainnet.

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

Đồng bộ console lên server rồi khởi động lại (ngoặc vuông trong `pkill` là BẮT BUỘC — xem Gotchas):
```bash
scp -i "$A1_SSH_KEY" local-net/console/server.mjs local-net/console/index.html "$A1_SSH_HOST":'~/9chain-a1/src/local-net/console/' && scp -i "$A1_SSH_KEY" local-net/lib/eip55.mjs "$A1_SSH_HOST":'~/9chain-a1/src/local-net/lib/'
```
```bash
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'pkill -f "[c]onsole/server.mjs"; sleep 2; cd ~/9chain-a1/src && set -a && . ~/9chain-a1/console.env && set +a && setsid node local-net/console/server.mjs >> ~/9chain-a1/console.log 2>&1 < /dev/null & sleep 4; ss -tlnp | grep 8091'
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
