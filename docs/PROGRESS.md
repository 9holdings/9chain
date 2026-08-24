# 9Chain-A1 — Tiến độ & Lộ trình

Cập nhật: 2026-08-24

## ✅ Milestone 0 — PoC rebrand (XONG, đã kiểm chứng thật)

| Việc | Trạng thái | Bằng chứng |
|---|---|---|
| Fork avalanchego v1.14.2 (kèm graft coreth + subnet-evm) | ✅ | `upstream/avalanchego/` |
| Script rebrand idempotent (Client, token, HRP) | ✅ | `scripts/rebrand.sh` chạy 2 lần OK |
| Package identity compile sau rebrand | ✅ | `go build ./version/... ./genesis/... ./utils/constants/...` |
| Build node đầy đủ (Docker/Linux) | ✅ | image `9chain-a1/node:dev` (282MB) |
| Node chạy, báo `9chaingo/1.14.2` | ✅ | `info.getNodeVersion` |
| Địa chỉ mang HRP `love9` | ✅ | `networkID 9001 => X-love91...` |
| Genesis 9Chain-A1 (netID 9001, chainId 9000000009) | ✅ | `9chain-a1-config/genesis.json` |

**Kết luận:** giữ core 100%, chỉ đổi lớp identity — mô hình sovereign fork chạy được.

## ✅ Milestone 1 — Đẻ L1 tuỳ chỉnh (multi-L1 as a service) (XONG, kiểm chứng thật)

| Việc | Trạng thái | Bằng chứng |
|---|---|---|
| Rebrand VMID subnet-evm → **love9evm** (`qBP9WLr...`) | ✅ | `scripts/rebrand.sh` patch `constants.sh` |
| Build subnet-evm thành plugin, nhúng vào node image | ✅ | `/9chain-a1/build/plugins/<love9evm-vmid>` (65MB) |
| Tool tạo L1 (CreateSubnet + CreateChain) qua wallet SDK | ✅ | `9chain-a1-tools/create-l1` |
| Node track subnet, nạp VM love9evm, mở RPC | ✅ | `eth_chainId => 0x1b2e5` (111333) |
| Deploy contract Solidity + tx + read | ✅ | Storage @ `0x5aa01B3b...`, `set(42)=42` PASS |
| Script 1 lệnh đẻ L1 | ✅ | `local-net/create-l1.sh` |

**Lệnh đẻ 1 L1 mới:** `bash local-net/create-l1.sh` → in RPC + thông số MetaMask.

Còn lại (tuỳ chọn, không chặn):
- [ ] Precompile nâng cao mỗi L1: native minter, tx allowlist, reward manager.

## ✅ Milestone 1.5 — 9chain-a1-cli (XONG, kiểm chứng thật)

CLI rebrand **chuyên dụng cho mạng 9Chain-A1** (không spin up mạng riêng như avalanche-cli).

| Việc | Trạng thái | Bằng chứng |
|---|---|---|
| CLI Go không thêm dep (`9chain-a1-cli`) | ✅ | `9chain-a1-tools/9chain-a1-cli`, nhúng vào image |
| Wrapper host thống nhất (`9chain-a1`) | ✅ | `local-net/9chain-a1` |
| `9chain-a1 info` | ✅ | in node 9chaingo/1.14.2 + peers + validators |
| `9chain-a1 l1 create <ten>` (tạo→track→restart→RPC) | ✅ | AlphaChain lên, chainId 111333 |
| `9chain-a1 l1 list` | ✅ | liệt kê AlphaChain (VMID love9evm) + C/X-Chain |
| `9chain-a1 deploy <bid>` | ✅ | deploy Storage, set(42)=42 PASS |
| `9chain-a1 net up/down` | ✅ | bọc gen-network + multinode compose |

```bash
bash local-net/9chain-a1 up
bash local-net/9chain-a1 l1 create AlphaChain
bash local-net/9chain-a1 deploy <BLOCKCHAIN_ID>
```

> Vì sao KHÔNG fork avalanche-cli: nó dùng ANR spin up MẠNG RIÊNG (genesis riêng), không phải mạng chủ quyền 9001 + validator của ta. 9chain-a1-cli chuyên dụng điều khiển đúng mạng của nền tảng.

## ✅ Milestone 2 — Mạng nhiều node thật (XONG, kiểm chứng thật)

| Việc | Trạng thái | Bằng chứng |
|---|---|---|
| Sinh **khoá treasury MỚI** (bỏ ewoq) | ✅ | `netgen` → `treasury.txt` (X/P/EVM đều HRP love9) |
| Sinh staking TLS cert + BLS key mỗi node | ✅ | `net/node1..5/{staker.crt,staker.key,signer.key}` |
| Genesis `initialStakers` khớp nodeID, `startTime` động | ✅ | `net/genesis.json` (startTime = now−60, không hết hạn) |
| Bật lại `sybil-protection` | ✅ | node log `sybilProtectionEnabled:true` |
| docker-compose ≥5 node, static IP, beacon+bootstrap | ✅ | `netgen` sinh `docker-compose.multinode.yml` |
| Mạng chạy: 5 validator connected, staking thật | ✅ | `getCurrentValidators` = 5, weight 20e15, connected:true |
| Node non-beacon bootstrap từ beacon | ✅ | node2 log "bootstrapped check started passing" |
| Treasury được cấp phát | ✅ | X-Chain balance 300e15 LOVE9 |

**Sinh + chạy mạng thật:**
```bash
bash local-net/gen-network.sh 5
docker compose -f local-net/net/docker-compose.multinode.yml up -d --build
```

Công cụ: [`9chain-a1-tools/netgen`](../upstream/avalanchego/9chain-a1-tools/netgen/main.go) sinh toàn bộ khoá + genesis + compose.
⚠️ `local-net/net/treasury.txt` chứa **khoá bí mật** — đã `.gitignore`.

## 🟡 Milestone 3 — Testnet công khai (dịch vụ XONG; bring-up đa VPS là deploy-kit + guide)

| Việc | Trạng thái | Bằng chứng |
|---|---|---|
| **Faucet** (web + API, rate-limit) | ✅ kiểm chứng | drip 10 LOVE9, 429 cooldown, 400 validate |
| **Explorer** (EVM, live blocks/tx/địa chỉ) | ✅ kiểm chứng | render chainId 9000000009, 4 block, search balance |
| **Tokenomics** (thiết kế + tham số + cách codify) | ✅ tài liệu | [TOKENOMICS.md](TOKENOMICS.md) |
| **Deploy-kit đa VPS** (compose 1-validator + guide) | ✅ artifacts | [deploy/node.compose.yml](../local-net/deploy/node.compose.yml), [DEPLOY-TESTNET.md](DEPLOY-TESTNET.md) |
| Wallet | 🟡 MetaMask (EVM) đã dùng được; ví X/P là sau | `9chain-a1 l1 create` in sẵn thông số MetaMask |
| Validator thật nhiều máy/vùng | ⏭️ vận hành | chạy deploy-kit trên VPS thật (ngoài phạm vi local) |

```bash
bash local-net/9chain-a1 faucet      # http://localhost:8080
bash local-net/9chain-a1 explorer    # http://localhost:8081
```

Còn lại (thuần vận hành/kinh doanh, không phải code):
- [ ] Thuê ≥3 VPS đa vùng, chạy `local-net/deploy/node.compose.yml` theo [DEPLOY-TESTNET.md](DEPLOY-TESTNET.md).
- [ ] Chốt tokenomics (%, vesting, supply) rồi codify (mục 3 của TOKENOMICS.md).
- [ ] Faucet dùng ví quỹ testnet riêng (không phải treasury chính).

## ✅ Milestone 3.5 — Explorer đầy đủ (Blockscout) + Ví X/P (XONG, kiểm chứng thật)

| Việc | Trạng thái | Bằng chứng |
|---|---|---|
| **Blockscout** rebrand 9Chain-A1 cho C-Chain | ✅ | UI "9Chain-A1 explorer", coin LOVE9, index block/tx live (title, blocks, txns) |
| Fix tích hợp Blockscout↔coreth | ✅ | tắt SSL DB (`ECTO_USE_SSL=false`), `--http-allowed-hosts=*`, WS realtime, tắt internal-tx |
| Đóng gói tái lập | ✅ | `explorer-full/setup.sh` + override env (không commit clone nặng) |
| **Ví X/P** (Go wallet SDK) | ✅ | `9chain-a1-tools/xp-wallet` |
| Xem số dư X/P | ✅ | ewoq: X=300M, P=31.2M LOVE9 (HRP love9) |
| Gửi trên X-Chain | ✅ | gửi 7 LOVE9 → địa chỉ nhận balance 7 LOVE9 |
| Cross-chain X↔P | ✅ | X→P và P→X đều exportTx+importTx, balance đổi đúng |

```bash
bash local-net/9chain-a1 explorer-full up   # Blockscout: http://localhost
bash local-net/9chain-a1 wallet              # Ví X/P: http://localhost:8090
```

Ghi chú: MetaMask lo EVM (C-Chain/L1); ví X/P này lo phần X/P mà MetaMask không làm được.
Caveat Blockscout: realtime index block MỚI; backfill lịch sử cần chain có hoạt động liên tục.

## ⏭️ Milestone 4 — Mainnet
- [ ] Audit bảo mật. [ ] Quy trình rebase upstream định kỳ. [ ] Vận hành 24/7, monitoring.

---

## ⚠️ Rủi ro / Nợ kỹ thuật đang mở
1. **Khoá ewoq công khai:** Primary Network multi-node đã dùng **khoá mới** (netgen). NHƯNG genesis L1 EVM (`l1-evm-genesis.json`) + tool `create-l1` vẫn cấp phát/ký bằng ewoq → khi lên testnet/mainnet phải thay bằng khoá treasury thật + đổi allocation L1.
2. **Bảo mật đến từ validator + tokenomics, không phải code.** 1 node = 0 bảo mật thật.
3. **Không build native trên Windows** — luôn qua Docker/WSL.
4. **Nợ bảo trì:** phải rebase upstream định kỳ để nhận vá bảo mật (Etna/ACP mới...).
5. **Pháp lý:** giữ copyright Ava Labs (BSD-3); tuân thủ LGPL cho phần EVM; không dùng nhãn hiệu "Avalanche".
6. **L1 EVM chưa bật hardfork Durango/Etna:** genesis L1 hiện KHÔNG kích hoạt warp (cần Durango) và EVM ở mức pre-Shanghai → contract phải compile `evmVersion:"paris"` (không PUSH0). Muốn EVM mới + warp: thêm mốc network-upgrade vào genesis L1.
7. **Node phải `--plugin-dir` trỏ đúng** `/9chain-a1/build/plugins` và `--track-subnets=<id>` (đặt qua `AVAGO_TRACK_SUBNETS`) mới nạp được VM của L1.

## Ghi chú vận hành đã rút ra (Milestone 1)
- Tên blockchain chỉ nhận chữ/số/space (dấu `-` -> "illegal name character").
- Sau khi tạo subnet phải restart node có track subnet đó (2 pha) — `create-l1.sh` đã tự động hoá.
- ewoq có sẵn UTXO trên P-Chain của genesis local → tạo subnet/chain không cần import X→P.
- Khoá EVM ewoq (PoC): `0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027` (địa chỉ `0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC`).

## Lệnh nhanh
```bash
# rebrand lại sau khi kéo update
bash scripts/rebrand.sh upstream/avalanchego
# build + chạy PoC
docker compose -f local-net/docker-compose.yml up --build
```

## Chuẩn hoá tên 9Chain-A1 (2026-08-24)
Bỏ hoàn toàn thương hiệu cũ "MetaChain / META / meta-" khỏi dự án để không lẫn với C1.

| Trước | Sau |
|---|---|
| `C:\PROJECTS\MetaChain` | `C:\PROJECTS\9Chain-A1` |
| `metachain-node`, `meta-faucet/explorer/xpwallet/dashboard`, `meta-validator` | `9chain-a1-node`, `9chain-a1-faucet/explorer/xpwallet/dashboard`, `9chain-a1-validator` |
| image `metachain/node:dev` · volume `meta-data`, `metachain-gomod` | `9chain-a1/node:dev` · `9chain-a1-data`, `9chain-a1-gomod` |
| CLI `local-net/metachain` · `metachain-cli` | `local-net/9chain-a1` · `9chain-a1-cli` |
| `metachain-config/` · `metachain-tools/` | `9chain-a1-config/` · `9chain-a1-tools/` |
| path trong container `/metachain/...` | `/9chain-a1/...` |
| env `METACHAIN_*` | `A1_*` (env không được bắt đầu bằng số) |
| token `META` · HRP `meta` · VM `metaevm` · netID `88888` | `LOVE9` · `love9` · `love9evm` · `9001` |

Sửa kèm (không chỉ đổi tên):
- `netgen` và `local-net/deploy/node.compose.yml` còn cắm cứng **networkID 88888** → đổi sang **9001** cho khớp node đang chạy.
- `explorer-full/setup.sh` dùng `grep -q ... || cat >>` với chuỗi kiểm tra KHÔNG khớp nội dung file override → append **trùng lặp** mỗi lần chạy (env Blockscout đã có 2 block chồng nhau). Nay dùng marker `# === 9CHAIN-A1 OVERRIDES ===`, cắt từ marker tới EOF rồi append lại → idempotent thật.
- `docs/ARCHITECTURE.md` còn ghi VMID cũ `qBP9WLr…` → sửa thành VMID đang chạy `pkqXsz…`.
- Vật liệu mạng 5-node cũ ở `local-net/net/` (identity 88888, địa chỉ `X-meta1…`) đã gỡ bỏ — sinh lại bằng `bash local-net/gen-network.sh 5` ở P0 #1.

## P0 #1 — Mạng 5-node A1 local: **PASS** (2026-08-24)

Sinh lại vật liệu mạng bằng `bash local-net/gen-network.sh 5` (khoá mới, networkID 9001, KHÔNG ewoq)
rồi `docker compose -f local-net/net/docker-compose.multinode.yml up -d`.

**Kết quả kiểm chứng:**

| Hạng mục | Kết quả |
|---|---|
| `platform.getCurrentValidators` | **5 validator**, tất cả `connected: true`, `uptime: 100%` (trước đây: 0) |
| `sybilProtectionEnabled` | `true` (đọc từ log khởi động node1) |
| `info.peers` trên node1 | `numPeers: 4` (đủ 4 node còn lại) |
| `info.isBootstrapped` P / X / C | `true` / `true` / `true` |
| `eth_chainId` C-Chain | `0x218711a09` = 9000000009 ✓ |
| Giao dịch C-Chain thật | block 0 → **1**, `status: 1` — consensus 5 validator chạy thật |
| Treasury EVM | `0xa6fD5FF0c997B4F3a22d96b9B602102fFc75646d`, số dư 50,000,000 LOVE9 |
| Stake mỗi node | `20000000000000000` (weight bằng nhau) |

NodeID 5 node: `JngcSVW5…`(beacon, 172.28.0.11) · `D3DLYxTe…` · `Avdpd3iZ…` · `J8AagA3W…` · `BcSBVNLm…`

**Sửa kèm:** docker network trong compose netgen sinh ra còn tên `metanet` (sót từ MetaChain) → đổi thành **`a1net`**.

### Việc phát sinh từ P0 #1 (chưa làm)
1. **Faucet hỏng trên mạng mới** — `local-net/faucet/server.mjs:14` mặc định dùng khoá ewoq
   `0x56289e…`, khoá này **số dư 0** trong genesis netgen (chỉ treasury được cấp phát).
   Phải truyền `FAUCET_PK` = ví faucet riêng nạp từ treasury. Gộp vào **P0 #2**.
2. **Blockscout còn trỏ chain cũ** — mạng 5-node là genesis MỚI, DB Blockscout đang giữ dữ liệu
   chain đơn cũ → phải wipe DB rồi index lại. Ngoài ra compose netgen đặt
   `httpAllowedHosts: ["localhost"]`, Blockscout cần `--http-allowed-hosts=*` mới gọi được.
3. **Node đơn cũ (`9chain-a1-node`) đã `docker stop`** để nhường cổng 9650 — chưa xoá, còn bật lại được.
   Từ nay mạng chuẩn để phát triển là bộ 5 node.

## P0 #2 — Tokenomics public + bỏ ewoq: **PASS** (2026-08-24)

### Đã làm
1. **`A1Params`** (`genesis/genesis_9chain_a1.go`) — tham số kinh tế chủ quyền của mạng 9001,
   thay vì mượn `LocalParams` của Avalanche qua nhánh `default:`. Đổi `MaxValidatorStake`
   3,000,000 → **50,000,000 LOVE9**; các số khác giữ nguyên có chủ đích (xem docs/TOKENOMICS.md).
2. **Vá lỗ hổng `config/config.go`** — xem mục "Bẫy" dưới. Đây là phần quan trọng nhất của P0 #2.
3. **Phân bổ genesis 5 quỹ** (`9chain-a1-tools/netgen/allocation.go`) — mỗi quỹ MỘT khoá riêng,
   tổng phát hành 400,000,000 LOVE9 theo bảng 40/20/20/5/15.
4. **netgen xuất 3 file mới**: `keys.txt` (tuyệt mật, 5 quỹ) · `faucet.env` (chỉ khoá faucet,
   file duy nhất được phép lên server) · `allocation.md` (chỉ địa chỉ, công khai được).
   Bỏ `treasury.txt` cũ.
5. **Faucet bỏ ewoq** — `FAUCET_PK` nay BẮT BUỘC; nếu thiếu, hoặc nếu bằng đúng khoá ewoq
   công khai, faucet **từ chối khởi động** kèm hướng dẫn. Thêm kiểm tra số dư lúc khởi động
   để phát hiện sai khoá/sai chain ngay, thay vì để lỗi hiện ra ở phía người dùng cuối.
6. **`up-all.sh`** đọc khoá từ `faucet.env`; bước sinh giao dịch mẫu cũng bỏ khoá ewoq cắm cứng.
7. **netgen thêm `--http-allowed-hosts`** cho mọi node (mặc định `*`, đặt
   `A1_HTTP_ALLOWED_HOSTS` để siết trên server).

### Kiểm chứng (mạng 5-node sinh lại từ đầu, genesis mới)
| Kiểm tra | Kết quả |
|---|---|
| Validator | 5/5, `connected: true` |
| Tổng stake genesis | **160,000,000 LOVE9** = 5 × 32,000,000 ✓ đúng thiết kế |
| C-Chain: foundation / ecosystem / faucet | **20M / 70M / 18M** ✓ |
| C-Chain: staking / team | 0 / 0 ✓ (đúng — hai quỹ này không có phần EVM) |
| Tổng C-Chain | **108,000,000 LOVE9** ✓ |
| `maxValidatorStake` node đang chạy | **50,000,000 LOVE9** (A1Params thật, không phải LocalParams) |
| Faucet từ chối khi thiếu `FAUCET_PK` | ✓ |
| Faucet từ chối khoá ewoq | ✓ |
| Faucet drip thật | 10 LOVE9 → `0x…BEEF`, ví faucet giảm đúng 10 + phí ✓ |

### Bẫy mới phát hiện (quan trọng)
**Tham số kinh tế của mạng tuỳ chỉnh KHÔNG đọc từ `genesis.GetStakingConfig`.**
`config/config.go` chỉ khoá cứng tham số cho Mainnet/Fuji; mọi networkID khác — kể cả 9001 —
lấy từ **cờ CLI viper**, mà mặc định của các cờ đó lại là `genesis.LocalParams.*`
(`config/flags.go:277,279,293`). Hệ quả:
- thêm `case A1NetworkID` vào `params.go` là **chưa đủ**, A1Params sẽ bị lờ đi hoàn toàn;
- nguy hiểm hơn: **mỗi node có thể tự đặt supply cap / trần stake khác nhau bằng cờ CLI**,
  trong khi đây là tham số phải đồng thuận toàn mạng.

Cách vá: xếp `A1NetworkID` vào cùng nhóm Mainnet/Fuji ở CẢ HAI hàm `getStakingConfig`
và `getTxFeeConfig` trong `config/config.go` → tham số chốt trong mã, cờ CLI vô hiệu.
Triệu chứng nếu quên: log khởi động node in `maxValidatorStake: 3000000000000000`
(3M của LocalParams) thay vì `50000000000000000`.

**Kiểm tra nhanh A1Params có ăn không:**
```bash
docker logs 9chain-a1-node-1 2>&1 | head -1 | grep -o '"maxValidatorStake":[0-9]*'
# phải ra 50000000000000000
```

### Còn treo (cần David quyết, không phải việc kỹ thuật)
- **Supply cap 720,000,000 LOVE9** — đang kế thừa từ Avalanche, chưa ai chốt. Sau mainnet không đổi được.
- **% phân bổ + lịch vesting** — đang chạy theo bảng đề xuất, chưa có phê duyệt kinh doanh/pháp lý.

## Bootstrap server máy chủ (2026-08-24) — XONG

Server `139.99.145.13` (`(không công bố)`, Ubuntu LTS LTS, 8 luồng, 62GB RAM, `/dev/md3` 410GB RAID1).

Chạy `local-net/deploy/ksgame-bootstrap.sh`. Kiểm chứng sau khi chạy:

| Hạng mục | Kết quả |
|---|---|
| SSH bằng key | vào được, không hỏi mật khẩu (key riêng `"$A1_SSH_KEY"`) |
| Docker | 29.7.2 · compose 5.5.0 · chạy được không cần sudo |
| ufw | active — chỉ mở 22/80/443/9651 (cả IPv4 lẫn IPv6) |
| chrony | đồng bộ `time.cloudflare.com`, lệch **0.000000000s** |
| fail2ban | jail `sshd` đang chạy — **đã bắt 6 lượt đăng nhập sai** trong ~30 phút đầu |
| nofile | 65536 |

> fail2ban bắt 6 lượt sai chỉ trong nửa giờ đầu là bằng chứng cụ thể: server công khai
> bị quét liên tục. Tắt đăng nhập bằng mật khẩu là việc phải làm, không phải tuỳ chọn.

### 🔴 Bẫy NGHIÊM TRỌNG phát hiện lúc chuẩn bị deploy: Docker đi vòng qua ufw

Compose do netgen sinh trước đây publish cổng API bằng `"9650:9650"` — tức bind `0.0.0.0`.
**Docker publish cổng bằng luật DNAT trong bảng `nat`, đi vòng qua ufw** (ufw lọc chuỗi
`INPUT`, Docker dùng `FORWARD`/`DOCKER`). Hệ quả: cổng 9650 sẽ **hở thẳng ra Internet
dù `ufw status` báo cổng đó bị chặn** — nhìn tưởng an toàn mà thực ra không.

Cổng 9650 là API node: có `/ext/admin`, ví, toàn quyền RPC. Nếu deploy nguyên trạng thì
mạng bị chiếm ngay từ ngày đầu, mà `ufw status` vẫn hiện xanh.

**Đã sửa:** netgen nay sinh `"${A1_API_BIND:-127.0.0.1}:9650:9650"` — mặc định chỉ nghe
trên loopback. Muốn public RPC thì đặt Caddy trước cổng loopback đó (TLS + rate-limit +
lọc path), KHÔNG bao giờ đổi bind thành `0.0.0.0`.

**Bài học chung:** `ufw status` KHÔNG phản ánh cổng nào Docker đang mở. Kiểm tra thật:
```bash
sudo ss -tlnp | grep -E '9650|9651'     # xem bind 127.0.0.1 hay 0.0.0.0
sudo iptables -t nat -L DOCKER -n       # xem luat DNAT Docker tu them
```

## P0 #3 — Bảo mật console + faucet: **PASS** (2026-08-24)

### Module dùng chung: `local-net/lib/guard.mjs`
`clientIp` · `rateLimit` (cửa sổ trượt) · `requireToken` (so sánh chống timing attack)
· `serialQueue` · `requireSecret` (thiếu cấu hình thì THOÁT, không im lặng chạy tiếp).

### Console `:8091`
| Trước | Sau |
|---|---|
| Ai cũng gọi `/api/create` được | **Bắt buộc Bearer token** (`A1_CONSOLE_TOKEN`, tối thiểu 16 ký tự) |
| Bind `0.0.0.0` | Bind **`127.0.0.1`** mặc định |
| Không giới hạn | Tạo chain **3 lượt/giờ/IP** · đọc **120 lượt/phút/IP** |
| Tạo chain chạy song song được | **Hàng đợi tuần tự** (2 lượt song song sẽ restart node giữa chừng nhau, hỏng cả hai) |
| Body không giới hạn | Cắt ở 256KB |

UI giữ token trong `sessionStorage` (mất khi đóng tab), không phải `localStorage`.

**Console KHÔNG public.** Nó điều phối docker trên host — mở ra Internet là trao quyền
chạy lệnh trên máy chủ, kể cả khi có token. Truy cập qua SSH tunnel:
```bash
ssh -i "$A1_SSH_KEY" -L 8091:127.0.0.1:8091 "$A1_SSH_HOST"
```

### Faucet `:8088`
| Trước | Sau |
|---|---|
| Chỉ chặn theo **địa chỉ ví** | Thêm **5 lượt/giờ/IP** + **trần toàn cục 300/giờ** |
| Gửi tx song song | **Hàng đợi tuần tự** (NonceManager không an toàn khi chồng lượt — hai request cùng lấy một nonce, một tx bị thay thế) |
| `fetch('/api/drip')` tuyệt đối | `fetch('api/drip')` **tương đối** — để gắn được dưới `/faucet/` |
| — | `/whoami` để kiểm chứng nhìn thấy đúng IP người dùng |

**Kiểm chứng bằng cách tấn công thật** — 5 lượt liên tiếp từ 1 IP, mỗi lượt một ví khác
(đúng cách kẻ xấu vượt giới hạn theo địa chỉ):
```
lan 1..3 -> txHash (cho qua)
lan 4..5 -> "IP này đã nhận đủ suất, thử lại sau 60 phút"
```
Đổi ví KHÔNG thoát được. Hạn mức đọc console: bắn 130 request → 117 qua, 13 bị chặn 429.

### 🔴 Phát hiện trong lúc test: console CŨ chưa auth vẫn đang chạy
`netstat` cho thấy **hai** tiến trình cùng giữ cổng 8091: bản cũ (từ `up-all.sh` chạy lúc
14:56) bind `0.0.0.0:8091` **không có auth**, và bản mới bind `127.0.0.1:8091`. Windows cho
phép cả hai cùng tồn tại, và `localhost` phân giải ra `::1` nên request rơi vào **bản cũ**
— test auth ban đầu ra kết quả mâu thuẫn (401 lẫn 200) chính vì vậy.

Nghĩa là suốt phiên đó, console **không xác thực** đang mở ra toàn mạng LAN.

`pkill` không giết được `node.exe` trên Windows (bẫy đã biết), nên `up-all.sh` nay tìm PID
qua `netstat` rồi `taskkill` trước khi bật bản mới. **Bài học: khi siết bảo mật một dịch vụ,
phải kiểm tra bản CŨ đã chết hẳn chưa — cấu hình mới không tự thay thế tiến trình cũ.**

### Hệ quả dây chuyền của việc bind loopback (P0 #2)
Sau khi node1 chuyển sang bind `127.0.0.1:9650`, faucet trong container **không tới được
node nữa** (`host.docker.internal` trỏ IP LAN của host, không phải loopback). Cách sửa:
đấu faucet thẳng vào mạng docker của các node (`--network net_a1net`) và gọi
`http://172.28.0.11:9650`. Không mở thêm cổng nào ra ngoài.

### Reverse proxy — 2 tên miền David chốt
`local-net/deploy/Caddyfile` + `caddy.compose.yml` + `caddy.Dockerfile`:
- `rpc-testnet-a1.9chain.org` → `127.0.0.1:9650`, **lọc path danh sách trắng**
  (chỉ `/ext/bc/{C,P,X}`, `/ext/info`, `/ext/health`). `/ext/admin` và `/ext/keystore`
  **không mở** — chúng tắt/bật được chain và quản lý ví trên node.
- `testnet-a1.9chain.org` → Blockscout ở gốc, `/faucet/`, `/dashboard/`, `/lite/`.

### Bẫy: Cloudflare Proxied đổi 2 thứ
Cả hai bản ghi DNS đang bật **Proxied** (đám mây cam):
1. **Caddy không xin được chứng chỉ bằng HTTP-01/TLS-ALPN** — Cloudflare kết thúc TLS ở
   biên nên thử thách không tới được origin. Phải dùng **DNS-01 + Cloudflare API token**,
   mà image caddy chính thức không kèm plugin DNS → build riêng bằng xcaddy
   (`caddy.Dockerfile`).
2. **IP thật nằm ở header `CF-Connecting-IP`**, không phải remote addr. Không xử lý thì
   rate-limit gom MỌI người dùng vào một khoá → một người spam là cả thế giới bị chặn.
   `guard.mjs` ưu tiên `CF-Connecting-IP`, và Caddyfile chỉ tin header proxy từ dải IP
   của Cloudflare (nếu không, ai cũng giả header để thoát hạn mức).
   Bắt buộc đặt `A1_TRUST_PROXY=1` cho faucet/console khi ra public — kiểm chứng bằng
   `/whoami` TRƯỚC khi mở cho cộng đồng.

### Còn treo
- **Console đang trỏ sai compose**: `local-net/docker-compose.yml` (node đơn) chứ không phải
  mạng 5-node → chức năng đẻ chain hiện KHÔNG dùng được với mạng chuẩn. Phải sửa trước khi
  demo tính năng này.
- Chưa dựng Caddy thật trên server (cần Cloudflare API token của David).

## Dùng chung hạ tầng với C1 — kiểm tra 2026-08-24

David hỏi có dùng chung Cloudflare API token với C1 được không. **Câu trả lời: không có
token nào để dùng chung — C1 CỐ TÌNH không dùng token.**

### C1 nằm ở đâu
`C:\PROJECTS\9Chain-C1` (HANDOFF đang ghi `C:\PROJECTS\9Chain` — đường dẫn cũ, đã sửa).

### C1 giải bài TLS-sau-Cloudflare thế nào
`9Chain-C1/9chain-operator/deploy/9chain-Caddyfile`, snippet `(origintls)`. Họ **đã thử ACME
và thất bại ngày 2026-07-19**, ghi lại nguyên nhân:

> CF ở chế độ Full lấy nội dung từ origin qua HTTPS :443, mà bộ trả lời thử thách HTTP-01
> của Caddy chỉ đăng ký trên :80 — nơi CF không bao giờ gọi tới. Vòng lặp chết: cần cert
> để phục vụ :443, mà để có cert phải trả lời được trên :80. TLS-ALPN-01 cũng hỏng vì nó
> chạy trên :443 và bị CF chặn giữa.

Kết luận của họ: `tls internal` (Caddy tự ký), TLS công khai để Cloudflare lo.
**Không ACME, không hạn mức phát hành, không bí mật nào phải truyền qua tay người.**

### 🔴 Xung đột suýt gây sự cố cho C1
Thiết kế A1 ban đầu của phiên này định dùng **DNS-01 + Cloudflare API token + build Caddy
riêng bằng xcaddy**, và hướng dẫn David đặt **SSL/TLS mode = Full (strict)**.

SSL/TLS mode là thiết lập **CẤP ZONE**. C1 dùng cert tự ký nên strict sẽ khiến Cloudflare
từ chối origin của C1 → **C1 chết ngay với lỗi 526**. Suýt nữa hạ tầng đang chạy của đội
khác bị gãy vì một thay đổi tưởng chỉ ảnh hưởng A1.

**Bài học: trước khi đổi bất kỳ thiết lập cấp zone/cấp tài khoản nào, phải kiểm tra ai
khác đang dùng chung.** Hai dự án khác thư mục không có nghĩa là khác hạ tầng.

### Đã sửa A1 theo cách của C1
- `Caddyfile`: bỏ `acme_dns`, dùng snippet `(origintls) { tls internal }`
- `caddy.compose.yml`: dùng `caddy:2-alpine` chính thức, bỏ `env_file` phần token
- **Xoá `caddy.Dockerfile`** — không cần build riêng nữa
- Cloudflare SSL/TLS mode: **giữ nguyên `Full`**
- `caddy validate` → `Valid configuration`

Kết quả: A1 đơn giản hơn (không token, không build riêng, không hạn mức Let's Encrypt),
nhất quán với C1, và không đụng gì tới hạ tầng đang chạy của họ.

### Còn dùng lại được từ C1
- `9Chain-C1/9chain-operator/deploy/ufw-cloudflare-only.sh` — khoá 80/443 chỉ cho dải IP
  Cloudflare (không có bước này thì mây cam chỉ là trang trí: dò ra IP origin là nối thẳng
  :443, bỏ qua cả WAF lẫn chống DDoS). Có `--dry-run`.
  ⚠️ Khi áp cho A1 phải **GIỮ 9651 mở cho mọi nơi** — P2P không đi qua Cloudflare được
  (C1 cũng có ghi chú tương tự cho cổng 26656 của họ).
- Dải IP Cloudflare trong `trusted_proxies` — C1 đã tra sẵn, A1 dùng cùng danh sách.

## 🚀 Deploy testnet công khai lên máy chủ — LIVE (2026-08-24)

**https://testnet-a1.9chain.org** · **https://rpc-testnet-a1.9chain.org**

### Trước đó: SSH "đã tắt mật khẩu" nhưng thực ra CHƯA tắt
David sửa `PasswordAuthentication no` trong `/etc/ssh/sshd_config`, nhưng `sshd -T`
(cấu hình **hiệu lực**) vẫn báo `passwordauthentication yes`. Nguyên nhân:

```
/etc/ssh/sshd_config
  dòng 12: Include /etc/ssh/sshd_config.d/*.conf   <- đọc TRƯỚC
  dòng 57: PasswordAuthentication no                <- chỗ đã sửa, BỊ BỎ QUA

sshd_config.d/50-cloud-init.conf      : PasswordAuthentication yes  <- THẮNG
sshd_config.d/60-cloudimg-settings.conf: PasswordAuthentication no
```
sshd lấy **giá trị gặp ĐẦU TIÊN**. `Include` ở dòng 12 nên file `50-cloud-init.conf`
thắng file chính. Ubuntu cloud image nào cũng vậy.

Vá: sửa đúng `50-cloud-init.conf`, + `/etc/cloud/cloud.cfg.d/99-disable-ssh-pwauth.cfg`
(`ssh_pwauth: false`) để cloud-init không ghi lại khi reboot. `sshd -t` trước khi restart.

Kiểm chứng: server giờ chỉ chào `Permission denied (publickey)` — trước là
`(publickey,password)`. **Bài học: kiểm tra bằng `sshd -T`, đừng tin nội dung file.**

### Vật liệu mạng
Sinh bộ **riêng cho public** (`A1_NET_DIR=local-net/net-public`), khoá hoàn toàn mới,
không tái dùng bộ dev. `gen-network.sh` nay nhận `A1_NET_DIR`. `keys.txt` **không** lên server
(đã `find` xác nhận). Chỉ `faucet.env` + `genesis.json` + `node1..5/` được đưa lên.

### Đang chạy trên server
| Container | Bind | Ghi chú |
|---|---|---|
| `9chain-a1-node-1..5` | API `127.0.0.1:9650` | 5 validator, `connected: true` |
| `9chain-a1-faucet` | `127.0.0.1:8088` | `A1_TRUST_PROXY=1`, ví riêng 18M LOVE9 |
| `9chain-a1-explorer` | `127.0.0.1:8082` | tạm giữ gốc tên miền |
| `9chain-a1-dashboard` | `127.0.0.1:8092` | |
| `9chain-a1-caddy` | `*:80`, `*:443` | healthy, `tls internal` |

Tải: load 0.46, RAM dùng ~8/62GB. **Còn rất nhiều dư địa** — Blockscout bật được.

### Kiểm chứng từ Internet (không phải từ trong server)
| Kiểm tra | Kết quả |
|---|---|
| `POST /ext/bc/C/rpc` `eth_chainId` | `0x218711a09` ✓ |
| `platform.getCurrentValidators` | **5 validator, 5 connected** ✓ |
| `/ext/admin` · `/ext/keystore` | **404** — bị Caddy chặn, không lộ node ✓ |
| `https://testnet-a1.9chain.org/` · `/faucet/` · `/dashboard/` | 200 ✓ |
| **`/faucet/whoami`** | trả **IP thật của client**, `trustProxy: true` ✓ |
| **Drip thật qua tên miền công khai** | 10 LOVE9 → `0x…CAFE`, xác nhận bằng `eth_getBalance` ✓ |
| `http://139.99.145.13:9650` từ ngoài | **không kết nối được** ✓ |

Phép thử `/whoami` là phép quan trọng nhất: nếu faucet chỉ thấy IP của Caddy/Cloudflare
thì hạn mức theo IP gom cả thế giới vào một khoá — một người spam là mọi người bị chặn.

### ⚠️ Giới hạn còn nguyên: cộng đồng CHƯA tự chạy node được
`ss` trên server cho thấy **không có gì lắng nghe cổng 9651 trên host** — netgen giữ P2P
bên trong mạng docker (`172.28.0.x:9651`). ufw đã mở 9651 nhưng không có dịch vụ phía sau.

Nghĩa là hiện tại cộng đồng chỉ dùng được **public RPC**, chưa join P2P được.
Gỡ bằng cách gán IPv6 công khai cho mỗi node (server có sẵn khối `/64`) — việc P1.
**Đừng quảng bá "chạy node cùng chúng tôi" cho tới khi làm xong.**

### Ghi chú nhỏ
- Node lọc Host header bằng `A1_HTTP_ALLOWED_HOSTS="localhost,127.0.0.1"` — Caddy ghi đè
  Host thành upstream, nên **chỉ request đi qua Caddy mới vào được node**. Chặt hơn là
  cho phép thẳng tên miền công khai.
- Client có cả IPv4 lẫn IPv6 sẽ được tính là **hai IP khác nhau** → nhận được 2× hạn mức
  faucet. Chấp nhận được với testnet; siết thì phải gộp theo prefix /64.
- Chưa bật `ufw-cloudflare-only.sh` — làm sau khi theo dõi vài ngày cho chắc.

### Chưa làm
- **Blockscout** (gốc tên miền đang là explorer nhẹ; đổi bằng `A1_ROOT_UPSTREAM` trong `caddy.env`)
- **Console** chưa deploy — vẫn trỏ sai compose (node đơn), và chỉ nên vào qua SSH tunnel

## Sửa explorer: đọc nhầm chain + hiểu nhầm "không tạo block" (2026-08-24)

David mở https://testnet-a1.9chain.org và báo "không thấy hoạt động tạo block".
Hoá ra là **hai vấn đề khác nhau**, một là lỗi thật, một là hiểu nhầm.

### 🔴 Lỗi thật: explorer đọc chain trên MÁY NGƯỜI XEM, không phải server
`local-net/explorer/index.html` cắm cứng `value="http://localhost:9650/ext/bc/C/rpc"`.

Nghe thì hợp lý — nhưng khi trang chạy trên tên miền công khai, trình duyệt người xem
phân giải `localhost` thành **chính máy họ**. Trang tải từ server, số liệu lấy từ máy khách.

Bằng chứng đối chiếu tại thời điểm đó:
| Nguồn | block |
|---|---|
| Chain trên server (qua RPC công khai) | **1** |
| Chain dev local trên máy David | **4** ← đúng con số David nhìn thấy |

Hỏng theo kiểu nguy hiểm: ai có node local sẽ thấy chain của chính mình và tưởng đó là
testnet; ai không có node thì thấy trang chết. Không ai nhận ra mình đang xem nhầm.

**Sửa:** suy RPC ra từ nơi trang được phục vụ —
`localhost` → RPC local; tên miền `<host>` → `https://rpc-<host>/ext/bc/C/rpc`.
Thêm cảnh báo vàng ngay dưới ô RPC khi trang công khai lại trỏ về localhost.

### Không phải lỗi: Avalanche KHÔNG đẻ block rỗng
Khác Ethereum (đều đặn ~12s/block), C-Chain chỉ sinh block **khi có giao dịch**.
Testnet nhàn thì số block đứng yên — đó là bình thường.

Chứng minh trên chain server: block **1** → gửi 1 giao dịch qua faucet công khai →
block **2** ngay lập tức.

Đã thêm đoạn giải thích này vào chính trang explorer, để người dùng cộng đồng không
kết luận nhầm là chain chết. **Người ngoài không đọc PROGRESS.md — chỗ để giải thích
là trên chính giao diện.**

Kiểm chứng sau khi sửa (đọc trang từ Internet): nhãn hiện
`chainId 9000000009 · https://rpc-testnet-a1.9chain.org/ext/bc/C/rpc`, block cao nhất **2**
— khớp đúng chain server.

## Đưa toàn bộ stack lên server (2026-08-24)

### Đang chạy công khai
| URL | Dịch vụ |
|---|---|
| `https://testnet-a1.9chain.org/` | **Blockscout** (explorer đầy đủ) |
| `.../faucet/` · `/dashboard/` · `/lite/` | faucet · bảng điểm A1-C1 · explorer nhẹ |
| `https://rpc-testnet-a1.9chain.org/...` | RPC C-Chain (lọc path) |

### Chỉ loopback — vào bằng SSH tunnel, KHÔNG public
```bash
ssh -i "$A1_SSH_KEY" -L 8091:127.0.0.1:8091 -L 8090:127.0.0.1:8090 "$A1_SSH_HOST"
```
- **Console `:8091`** — điều phối docker trên host; token trong `~/9chain-a1/console.env` trên server.
- **Ví X/P `:8090`** — **khoá do server giữ và KHÔNG có xác thực**; `/api/send-x`, `/api/x-to-p`
  cho phép bất kỳ ai chuyển tiền. Public là mất sạch ví đó. Đây là lý do nó chỉ loopback.

### Sửa cùng lớp lỗi "cắm cứng localhost" ở dashboard
Bảng điểm A1-C1 cũng cắm cứng `http://localhost:9650` như explorer → cũng sẽ đọc chain của
người xem. Đã sửa theo cùng cách (suy từ `location.hostname`).

### 🔴 Chức năng đẻ chain KHÔNG dùng được trên testnet công khai
`9chain-a1-cli` trả phí tạo subnet bằng **khoá ewoq** (`main.go:172`, comment gốc ghi
"PoC — thay bằng treasury key khi lên thật"). Từ P0 #2, ewoq **không còn được cấp phát
đồng nào** — nên mọi lệnh tạo chain trên mạng công khai sẽ lỗi thiếu tiền.

Đã sửa CLI nhận `A1_CLI_KEY` (dạng `PrivateKey-<cb58>`) và console nhận `A1_L1_ADMIN`
(trước đây mọi L1 đẻ ra đều cấp tiền + quyền admin phí cho **ewoq**, tức ai cũng nắm).

**Nhưng vẫn còn một việc chưa làm:** khoá đó cần LOVE9 **thanh khoản trên P-Chain**, mà
genesis chỉ cấp thanh khoản trên **X-Chain** (`InitialAmount`); phần P-Chain đều bị khoá
(`UnlockSchedule`). Phải chuyển X→P trước bằng ví X/P rồi mới đặt `A1_CLI_KEY`.
Cho tới lúc đó, nút "đẻ chain" trên console sẽ báo lỗi thiếu tiền.

### Bẫy Blockscout trên server (mất nhiều thời gian nhất)
1. **Cổng.** `services/nginx.yml` publish 80 + 8080 ra `0.0.0.0` — vừa đụng Caddy, vừa dính
   lại bẫy Docker-qua-mặt-ufw. Dời sang `127.0.0.1:8100` (UI) / `8101`, Caddy proxy tới 8100.
2. **Đường tới node.** Node bind `127.0.0.1:9650`; `host.docker.internal` (host-gateway) trỏ
   vào IP bridge docker chứ KHÔNG phải loopback của host → container không bao giờ tới được.
   Cho `backend` + `user-ops-indexer` vào thẳng mạng `net_a1net`, gọi `172.28.0.11:9650`.
3. 🔴 **`dets`/`logs` sai đường dẫn VÀ sai UID** — backend crash-loop vô hạn với
   `{:file_error, "./dets/queue_storage", :eacces}`, thông báo chôn sâu trong stack trace Erlang.
   - Compose giải `./dets/` tương đối theo **thư mục chứa file khai** (`services/backend.yml`)
     → thật ra là `services/dets`, không phải `docker-compose/dets`. Tôi tạo nhầm chỗ lần đầu.
   - Compose tự tạo thư mục thiếu với chủ sở hữu **root**, mà process chạy bằng user
     `blockscout` **UID 10001** (không phải 1000). `chown 1000` vẫn hỏng.
4. **nginx cache DNS lúc khởi động** — proxy lên khi backend còn crash nên giữ mãi 502;
   phải `docker restart proxy frontend` sau khi backend ổn định.
5. API v2 nằm ở **cổng UI** (`/api/v2/...` trên 8100), không phải cổng 8101.

Tất cả đã đóng gói vào `explorer-full/9chain-a1-server.env.sh` +
`9chain-a1-server.override.yml` để lần sau chạy một phát là xong.

### Kết quả
`finished_indexing: true`, `indexed_blocks_ratio: 1.00`. Từ Internet:
`total_blocks: 5 · total_addresses: 5 · total_transactions: 4`.

### Node.js phải cài trên host
Console điều phối docker nên chạy trên host, mà server không có Node. Đã cài Node 22
(NodeSource). Ubuntu 22.04 apt chỉ có bản quá cũ, thiếu `fetch` toàn cục.

## Trạng thái tính năng người dùng (2026-08-24)

### "Thêm vào MetaMask" — TRƯỚC ĐÂY KHÔNG HỀ CÓ
Soát toàn bộ giao diện: **không có nút nào hoạt động**. Mọi chỗ nhắc MetaMask
(console, dashboard, HANDOFF) đều chỉ là **chữ hướng dẫn tự gõ tay** chainId / RPC /
symbol / decimals. Với testnet hướng đại chúng đó là rào cản lớn nhất — gõ sai một ký
tự là mạng không chạy mà người dùng không hiểu vì sao.

Nút gắn sẵn của Blockscout cũng **không hiện**, vì nó chỉ xuất hiện khi có
`NEXT_PUBLIC_NETWORK_RPC_URL` — biến này chưa từng được khai.

**Đã sửa, cả 3 chỗ:**
| Nơi | Cách |
|---|---|
| `/faucet/` | nút "🦊 Thêm 9Chain-A1 vào MetaMask" — `wallet_addEthereumChain`, chainId `0x218711a09` |
| `/lite/` | nút tương tự, lấy chainId **từ chính chain đang xem** (không cắm cứng) nên thêm đúng cả khi trỏ sang L1 khác |
| Blockscout (gốc) | khai `NEXT_PUBLIC_NETWORK_RPC_URL` → nút gắn sẵn hoạt động |

Lưu ý kỹ thuật: MetaMask **chỉ nhận chainId dạng hex**; truyền số thập phân sẽ lỗi.
RPC/explorer URL đều suy từ `location.hostname`, không cắm cứng (bài học cùng ngày).

### "Tạo chain" (console) — CHƯA DÙNG ĐƯỢC trên testnet công khai
Chuỗi nguyên nhân:
1. `9chain-a1-cli` trả phí tạo subnet bằng khoá **ewoq** (comment gốc: "PoC — thay bằng
   treasury key khi lên thật").
2. Từ P0 #2, ewoq **không còn được cấp phát đồng nào** → mọi lệnh tạo chain lỗi thiếu tiền.
3. Đã sửa: CLI nhận `A1_CLI_KEY`, console nhận `A1_L1_ADMIN` (trước đây mọi L1 đẻ ra đều
   trao tiền + quyền admin phí cho ewoq — tức ai cũng nắm mọi L1).
4. **Mắt xích còn thiếu:** khoá trả phí cần LOVE9 **thanh khoản trên P-Chain**. Đã đo trực
   tiếp trên server — quỹ ecosystem có `balance: 0` trên P-Chain; 10,000,000 LOVE9 của nó
   nằm ở **X-Chain** (`InitialAmount`). Phần P-Chain của mọi quỹ đều bị khoá (`UnlockSchedule`).

**Việc còn phải làm (cần David quyết vì tiêu tiền quỹ thật):**
- Tạo **ví vận hành riêng cho chain-factory** (giống cách faucet có ví riêng), nạp từ quỹ
  ecosystem, chỉ đưa khoá ví đó lên server — KHÔNG đưa khoá quỹ gốc.
- Chuyển X→P một khoản cho ví đó (ví X/P có sẵn `/api/x-to-p`).
- Đặt `A1_CLI_KEY` + `A1_L1_ADMIN` cho console.
- Quyết **cấp bao nhiêu** — L1 còn có phí duy trì validator liên tục (ACP-77), không chỉ
  phí tạo một lần.

Ký giao dịch nạp tiền nên làm **từ máy dev** (nơi giữ `keys.txt`) qua SSH tunnel tới node,
không đưa khoá quỹ lên server.

## MetaMask báo "Unable to connect" (2026-08-24) — nguyên nhân: chính mình restart Caddy

David thêm mạng bằng nút mới → thành công, nhận 20 LOVE9 từ faucet công khai (block lên 0x6).
Ít phút sau MetaMask hiện "Unable to connect to 9Chain Testnet A1".

### Đã loại trừ những gì
Thử đúng cách MetaMask gọi, đều **HTTP 200**:
`net_version` · **batch request** (mảng JSON) · `Origin: chrome-extension://…` ·
`eth_blockNumber` · `eth_gasPrice` · `eth_feeHistory` · `eth_getBlockByNumber` ·
`eth_maxPriorityFeePerGas`. Thêm 6 lần fetch liên tiếp **từ trình duyệt thật** → 200, ~290ms.

Nên endpoint không hỏng, không phải Cloudflare chặn bot, không phải lọc path.

### Nguyên nhân
`docker inspect` cho thấy Caddy **khởi động lại lúc 14:01:21** — đúng lúc tôi chuyển gốc
tên miền sang Blockscout bằng `up -d --force-recreate`. Ví poll RPC mỗi ~4s nên rơi trúng
vài giây gián đoạn đó. MetaMask **giữ nguyên banner lỗi** cho tới khi người dùng đổi mạng
qua lại, dù RPC đã khoẻ trở lại từ lâu.

### Hai thứ đã sửa để không lặp lại
1. **Bật access log JSON cho tên miền RPC.** Trước đó grep log không ra dòng `status` nào —
   nghĩa là "không thấy lỗi" là **bằng chứng rỗng**, không phải bằng chứng khoẻ. Không có
   log thì không phân biệt được lỗi phía mình với lỗi phía Cloudflare/ví.
2. **Đổi cấu hình phải `caddy reload`, KHÔNG recreate:**
   ```bash
   docker exec 9chain-a1-caddy caddy reload --config /etc/caddy/Caddyfile
   ```
   Zero-downtime. Đã dùng chính lệnh này để áp access log — không gián đoạn lần nào.
   (Đổi biến trong `caddy.env` thì buộc phải recreate vì env chỉ đọc lúc khởi động →
   làm vào lúc vắng người, báo trước nếu đã công bố rộng.)

**Bài học vận hành:** khi testnet đã có người dùng thật, mỗi lần `--force-recreate` một
thành phần ở tuyến đầu là một lần cắt kết nối của tất cả ví đang mở.

## Nút "đẻ chain": không phải một lỗi thiếu tiền, mà BỐN lỗi chồng nhau (2026-08-24)

Cho tới hôm nay, tài liệu ghi việc chặn duy nhất là "thiếu ví có LOVE9 trên P-Chain".
Đo lại toàn tuyến thì tiền chỉ là mắt xích cuối, và là mắt xích **rẻ nhất**. Ba lỗi
còn lại nằm trong mã, không ai trả tiền cũng không chạy được.

### 1. Không node nào track subnet mới
Console đặt `A1_TRACK_SUBNETS=<danh sách>` rồi `compose up -d`. Nhưng
`docker-compose.multinode.yml` do **netgen** sinh ra **không đọc biến đó** — chỉ bản
node đơn `local-net/docker-compose.yml` (bộ dev cũ) mới có. Trên mạng 5 node, biến
được đặt rồi rơi vào hư không.

Hậu quả không phải là lỗi rõ ràng: chain vẫn được tạo trên P-Chain, console chờ RPC
đủ 150s rồi **vẫn trả về một chain trông hợp lệ**. Người dùng nhận đủ chainId + URL
RPC, thêm vào MetaMask, và chỉ phát hiện ra khi không làm được gì.

Đã sửa ở netgen (mọi node đều có `AVAGO_TRACK_SUBNETS=${A1_TRACK_SUBNETS:-}`) và vá
tại chỗ hai compose đã sinh (`local-net/net/`, `local-net/net-public/`) — KHÔNG sinh
lại được vì netgen sẽ đẻ khoá mới, mạng công khai sẽ chết.

### 2. Subnet đẻ ra có tập validator RỖNG — và đó là kiểu hỏng tệ nhất
`9chain-a1-cli l1 create` chỉ làm `CreateSubnetTx` + `CreateChainTx`. Không có
`AddSubnetValidatorTx` nào. Track ≠ validate: track là "tôi theo dõi chain này",
validate là "tôi bỏ phiếu chốt block".

Đối chứng đã chạy thật (`--no-validators`, chain 9198):

| | có validator (9199) | không validator (9198) |
|---|---|---|
| RPC `eth_chainId` | trả lời | **trả lời** |
| đọc số dư | đúng | **đúng** |
| MetaMask kết nối | được | **được** |
| gửi giao dịch | chốt sau **0.1s** | **treo vô hạn** |

Nghĩa là chain chết trông y hệt chain sống ở mọi chỗ người ta hay nhìn. Nhớ thêm:
Avalanche không đẻ block rỗng, nên "số block đứng yên" cũng không phân biệt được.
Cách duy nhất chắc chắn là **gửi một giao dịch thật** — đó là việc của
`local-net/faucet/probe-l1.mjs`.

Đã sửa: `l1 create` nay đăng ký MỌI validator của primary network làm validator của
subnet (`--validator-weight`, mặc định 100; `--validator-duration`, mặc định bám hạn
primary; `--no-validators` để tái lập lỗi khi cần).

Ràng buộc hậu Durango đã phải đọc mã mới biết: validator subnet **bắt buộc** đang là
validator primary; thời điểm bắt đầu bị bỏ qua (lấy timestamp chain); thời hạn phải
≥ MinStakeDuration (24h) và **không vượt hạn primary** — nên mặc định lấy hạn primary
trừ hao 60s, vì P-Chain tiến timestamp trong lúc mình còn đang ký.

### 3. Console không hề chuyển `A1_CLI_KEY` vào container
`docker compose exec` **không** mang env của tiến trình gọi nó vào bên trong. Console
đọc `A1_L1_ADMIN` nhưng chưa bao giờ đụng tới `A1_CLI_KEY` — đặt biến trên host xong
thì CLI trong container vẫn rơi về ewoq và lỗi thiếu tiền, trong khi cấu hình nhìn
như đã đúng.

Đã sửa: truyền `-e A1_CLI_KEY=...`, và bắt buộc phải có (như token) vì **cả hai**
genesis (dev lẫn công khai) đều không cấp phát cho ewoq.

Kèm theo một cái bẫy bảo mật: `execFile` nhét NGUYÊN dòng lệnh vào `err.message`, mà
console trả `String(e.message)` thẳng cho client. Một lỗi tầm thường là ném khoá quỹ
ra log **và** ra phản hồi HTTP. Đã bọc `docker()` để xoá khoá khỏi mọi chuỗi; đã thử
lại bằng container không tồn tại → phản hồi hiện `A1_CLI_KEY=<A1_CLI_KEY>`.

### 4. Thư mục config không được mount vào container
Console chạy trên host, ghi genesis EVM của L1 mới ra `9chain-a1-config/console-tmp/`,
rồi bảo CLI **trong container** đọc `/9chain-a1/config/console-tmp/<file>`. Compose
multinode chỉ mount `node<N>/` và `genesis.json` — đường dẫn đó không tồn tại.

Đã sửa ở netgen: mount `${A1_CONFIG_DIR:-../../9chain-a1-config}:/9chain-a1/config:ro`.
Bố cục trên server khác (compose ở `~/9chain-a1/net`, config ở `~/9chain-a1/src/...`)
nên đặt `A1_CONFIG_DIR` trong `~/9chain-a1/net/.env` — docker compose tự nạp `.env`
cạnh file compose, nên cả lệnh `up` thủ công lẫn `up` do console gọi đều đúng.

### Chi phí thật — đo trực tiếp, không ước lượng
Trên mạng dev, ví quỹ ecosystem sau khi chuyển X→P 1000 LOVE9:

| Bước | LOVE9 |
|---|--:|
| X→P (export + import) | 0.00100827 |
| 1 lượt đẻ chain (CreateSubnet + 5×AddSubnetValidator + CreateChain) | **0.000141468** |

Hậu Etna, P-Chain dùng **phí động**, nên các số tĩnh của `info.getTxFee`
(`createSubnetTxFee: 0.1 LOVE9`) **không còn được dùng**. Giá hiện tại đang ở đáy
(`minPrice: 1` nLOVE9/gas, `excess: 0`) và một lượt đẻ chain tốn ~65k gas so với
`targetPerSecond: 50000` — tức là không có cách nào làm nghẽn để giá tăng đáng kể.

Phí duy trì validator theo ACP-77 chưa áp dụng: luồng hiện tại là **subnet cổ điển**
(`AddSubnetValidatorTx`), không phải `ConvertSubnetToL1Tx`. Nếu sau này chuyển sang
L1 chuẩn ACP-77 thì mới có phí liên tục, ở giá đáy là 1 nLOVE9/giây/validator
= 0.0000864 LOVE9/ngày/validator.

**Kết luận: 1,000 LOVE9 đủ cho ~7 triệu lượt đẻ chain.** Con số cần David chốt không
phải bài toán ngân sách mà là bài toán rủi ro: cấp bao nhiêu thì mất bấy nhiêu nếu
khoá trên server bị lộ.

### Kiểm chứng cuối — đúng luồng nút bấm
Console thật (không phải gọi CLI tay), mạng dev 5 node:
`POST /api/create {"name":"DeltaChain","chainId":9201}` → **18.3 giây** → subnet +
chain + 5 validator + RPC sống. Gửi giao dịch: **chốt ở block 1 sau 0.1s**, quyền
admin phí thuộc `A1_L1_ADMIN` (không còn là ewoq).

Console nay **báo lỗi** nếu RPC không lên sau 150s thay vì trả về chain chết.

## Triển khai lên testnet công khai + đẻ L1 thật đầu tiên (2026-08-24)

David chốt **9 LOVE9** cho ví chain-factory và cho phép dựng lại cả 5 node ngay.

### Restart 5 node
Đổi tag `9chain-a1/node:next` → `:dev` (giữ tag cũ `:prev-20260824` để lùi), rồi
`compose up -d`. RPC công khai **lên lại sau ~10 giây**, chiều cao block giữ nguyên
(`0x8`), 5/5 validator connected, Blockscout không đụng tới. Nhẹ hơn dự đoán nhiều.

### Ví chain-factory
Thêm công cụ `9chain-a1-tools/keygen` — netgen sinh cả một MẠNG (5 quỹ genesis +
staker), dùng nó chỉ để lấy một ví là đẻ ra bộ khoá genesis mới, trên mạng đang chạy
thì đó là thảm hoạ.

| | |
|---|---|
| X/P | `X-love91vgh2whn746dzzvg0dj4w9rsqvlalcldvpueuvj` |
| EVM | `0x1e5134A67cB80d96B38Fb406365561ec97C5816a` |
| Số dư P-Chain | **8.99999173 LOVE9** ≈ 63,600 lượt đẻ chain |

Nạp: quỹ Ecosystem gửi 9.01 LOVE9 trên X (`55yPUUAENFDGZ9NUH7YHdTb7a4x6K1VGtBy2EvEH3MxbtQW8t`),
rồi X→P 9 LOVE9. **Khoá quỹ Ecosystem không bao giờ rời máy dev** — ví ký cục bộ,
chỉ phát giao dịch đã ký.

Chi tiết đường truyền (mất thời gian nhất): RPC công khai **không đủ** cho ví X/P —
Caddy lọc path nên SDK ăn 404. Đi qua SSH tunnel thì container lại bị node từ chối
`invalid host specified` vì `--http-allowed-hosts=localhost,127.0.0.1` mà container
gửi `Host: host.docker.internal`. Cách gỡ: dựng ảnh tạm có `socat` nghe
`127.0.0.1:9650` **trong** container rồi đẩy sang tunnel — nhờ vậy Host header ví gửi
đi đúng là `localhost:9650`.

`A1_L1_ADMIN` đặt bằng địa chỉ EVM quỹ **Foundation**, cố ý KHÔNG dùng địa chỉ ví
chain-factory: khoá điều khiển mọi L1 đẻ ra vẫn nằm offline. (Trước đó `console.env`
trên server **chưa từng** có `A1_L1_ADMIN` — tức vẫn đang chạy với ewoq, trái với
những gì tài liệu ghi.)

### Hai lỗi nữa lộ ra khi triển khai
1. **`compose up` do console gọi sẽ nới lỏng bộ lọc Host.** Console truyền env riêng
   nên `A1_HTTP_ALLOWED_HOSTS` không có → compose lấy mặc định `*`. Tức chỉ cần bấm
   nút đẻ chain là node công khai âm thầm mở rộng bộ lọc Host. Đã ghim
   `A1_CONFIG_DIR` / `A1_API_BIND` / `A1_HTTP_ALLOWED_HOSTS` vào `~/9chain-a1/net/.env`
   — docker compose tự nạp `.env` cạnh file compose, nên `up` tay hay `up` do console
   gọi đều tái lập đúng cấu hình.
2. **Console trả URL `http://localhost:9650/...`** cho người dùng dán vào MetaMask —
   đúng lớp lỗi "cắm cứng localhost" đã trả giá ở explorer và dashboard. Thêm
   `A1_PUBLIC_RPC_BASE`.

### L1 đầu tiên trên mạng công khai: OmegaChain
`POST /api/create {"name":"OmegaChain","chainId":9101}` → **12.7 giây**.

| | |
|---|---|
| subnetID | `2mEWMXeeaptYp14m1qU9PHDNxG9m4tNFNDnJaEb24rmQYQByhZ` |
| blockchainID | `DCFT9G29xE94X4syYJQemTEGxrWx1ZnfH6Qea2dBZ8ujKfyXu` |
| RPC | `https://rpc-testnet-a1.9chain.org/ext/bc/DCFT9G29xE94X4syYJQemTEGxrWx1ZnfH6Qea2dBZ8ujKfyXu/rpc` |
| validator | 5/5 |
| giao dịch thật | **chốt sau 1.4s ở block 1** |

### Caddy: chain đẻ ra vốn KHÔNG ai gọi được
Danh sách path của tên miền RPC liệt kê từng path một, không có L1 nào — chain đẻ
xong chỉ gọi được từ trong server. Đã thêm `/ext/bc/*/rpc` + `/ext/bc/*/ws`;
wildcard chỉ nới **bên trong** nhánh `/ext/bc/`. Kiểm chứng lại sau khi áp:
`/ext/admin` = 404, `/ext/keystore` = 404, C-Chain = 200, L1 = 200.
Áp bằng `caddy validate` rồi `caddy reload` — **không** recreate, không gián đoạn.

## Trang "Danh bạ L1" — `/chains/` (2026-08-24)

David hỏi "làm sao để tôi thấy mọi thứ". Trả lời trung thực: **không có chỗ nào** —
danh sách chain nằm trong `console-chains.json`, chỉ tới được qua SSH tunnel + token;
Blockscout chỉ index C-Chain, không biết gì về các L1.

Đã dựng `local-net/chains/index.html` (nginx tĩnh, container `9chain-a1-chains`,
`127.0.0.1:8093`, Caddy `/chains/`).

**Điểm cốt của trang này là chọn ĐÚNG dấu hiệu sống.** Chiều cao block vô dụng ở cả
hai chiều: Avalanche không đẻ block rỗng nên block đứng yên là bình thường; còn chain
không validator thì vẫn trả lời RPC, vẫn cho đọc số dư, MetaMask vẫn kết nối. Nên
trang lấy **số validator của subnet từ P-Chain** làm căn cứ, và nói rõ điều đó ngay
trên trang thay vì để người xem tự đoán.

Ba trạng thái: `ĐANG CHẠY` (validator > 0) · `KHÔNG CHỐT ĐƯỢC BLOCK` (RPC sống nhưng
validator = 0) · `KHÔNG PHẢN HỒI`.

Chi tiết kỹ thuật: không mount lồng `:ro` trong `:ro` được (Docker phải tạo điểm gắn
trong rootfs chỉ-đọc → fail), nên state mount ra `/srv/a1-config` rồi `alias` bằng
`local-net/chains-nginx/default.conf`. Chỉ mở **đúng một file**, không autoindex —
kiểm chứng: `/data/genesis.json` = 404, `/data/` = 404.
