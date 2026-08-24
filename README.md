# 9Chain Testnet A1 (Avalanche)

**Track Avalanche** của 9Chain — một trong hai testnet chạy song song để cộng đồng chọn hướng mainnet (A1 = Avalanche, C1 = Cosmos). Đây là một **sovereign fork** của [Avalanche](https://github.com/ava-labs/avalanchego), **giữ nguyên 100% core** (Snow* + P/X/C + subnet/L1), chỉ **rebrand lớp identity** sang 9Chain.

- **Nhận diện A1:** node `9chaingo` · token **LOVE9** · địa chỉ `love91…` · VM đẻ L1 `love9evm` · networkID 9001 · C-Chain chainId 9000000009.
- **Multi-L1 (ai cũng đẻ chain):** `graft/subnet-evm` → đẻ nhiều L1 EVM tuỳ chỉnh (`9chain-a1 l1 create`).
- **Merge upstream dễ:** rebrand chỉ đổi *giá trị chuỗi*, không đổi định danh Go.

> ⚠️ **Testnet local (giai đoạn 1).** Chưa phải mainnet. So sánh A1 vs C1 để cộng đồng chọn: [docs/A1-vs-C1-SCORECARD.md](docs/A1-vs-C1-SCORECARD.md). Bảo mật/tokenomics public: [docs/TOKENOMICS.md](docs/TOKENOMICS.md).

## Cấu trúc

```
9Chain-A1/
├── upstream/avalanchego/     # bản fork avalanchego (core, KHÔNG sửa logic)
│   └── 9chain-a1-tools/            # overlay (không đụng core)
│       ├── 9chain-a1-cli/          # CLI factory L1 (version/info/l1 create/list)
│       ├── create-l1/              # tạo subnet + L1 EVM (tool gốc)
│       ├── netgen/                 # sinh khoá + genesis + compose nhiều node
│       └── xp-wallet/              # ví X/P (số dư, gửi, cross-chain X↔P)
├── scripts/
│   ├── rebrand.sh            # áp lớp identity 9Chain-A1 (idempotent, re-runnable)
│   └── setup-fork.sh         # cấu hình git remote upstream/origin cho fork
├── 9chain-a1-config/
│   ├── genesis.json          # genesis Primary Network (networkID 9001, token LOVE9)
│   └── l1-evm-genesis.json   # genesis mẫu cho L1 EVM (chainId 9100, gas config)
├── local-net/
│   ├── Dockerfile            # build node + plugin love9evm + tool create-l1
│   ├── docker-compose.yml    # mạng dev 1 node
│   ├── 9chain-a1             # CLI mặt tiền (wrapper): up/down/l1/deploy/net/info
│   ├── create-l1.sh          # 1 lệnh đẻ 1 L1 EVM mới
│   ├── gen-network.sh        # 1 lệnh sinh mạng N node thật (khoá mới)
│   ├── net/                  # (sinh ra) genesis + compose + khoá — .gitignore
│   ├── faucet/               # dịch vụ faucet (Node+ethers, UI rebrand)
│   ├── explorer/             # EVM explorer tĩnh (rebrand)
│   ├── deploy/               # compose 1-validator cho VPS (testnet công khai)
│   └── deploy-test/          # compile + deploy contract kiểm thử (ethers+solc)
├── explorer-full/            # Blockscout rebrand 9Chain-A1 (setup.sh + override env)
└── docs/  (ARCHITECTURE, PROGRESS, TOKENOMICS, DEPLOY-TESTNET)
    ├── ARCHITECTURE.md       # kiến trúc fork & bề mặt rebrand
    └── PROGRESS.md           # mốc & việc còn lại
```

## Lớp rebrand (toàn bộ thay đổi identity)

| Điểm chạm | File | Từ | Thành |
|---|---|---|---|
| Client/node name | `version/constants.go` | `avalanchego` | `9chaingo` |
| Tên token | `genesis/genesis.go` | `Avalanche` | `LOVE9 Coin` |
| Ký hiệu token | `genesis/genesis.go` | `AVAX` | `LOVE9` |
| HRP địa chỉ (custom net) | `utils/constants/network_ids.go` | `custom` | `love9` |
| VMID L1 EVM | `graft/subnet-evm/scripts/constants.sh` | `subnetevm` | `love9evm` |
| Network ID | `9chain-a1-config/genesis.json` | `12345` | `9001` |
| C-Chain chainId (EVM) | `9chain-a1-config/genesis.json` | `43112` | `9000000009` |

**Không đụng:** `snow/` (consensus), `vms/` (VM), `chains/`. Đó là core, giữ nguyên.

## Chạy nhanh bằng `9chain-a1` CLI

Yêu cầu: Docker Desktop (Linux containers). `avalanchego` **không build native trên Windows** → luôn qua Docker.

```bash
bash local-net/9chain-a1 up                 # mạng dev 1 node
bash local-net/9chain-a1 l1 create AlphaChain   # đẻ 1 L1 EVM (tạo→track→restart→RPC)
bash local-net/9chain-a1 l1 list                # liệt kê blockchain
bash local-net/9chain-a1 deploy <BLOCKCHAIN_ID> # deploy contract kiểm thử
bash local-net/9chain-a1 net up 5               # mạng 5 node THẬT (khoá mới)
bash local-net/9chain-a1 info                    # phiên bản node + peers + validators
bash local-net/9chain-a1 faucet                  # faucet testnet (http://localhost:8080)
bash local-net/9chain-a1 explorer                # explorer nhẹ (http://localhost:8081)
bash local-net/9chain-a1 explorer-full up        # Blockscout đầy đủ (http://localhost)
bash local-net/9chain-a1 wallet                  # ví X/P (http://localhost:8090)
```

Triển khai testnet công khai đa VPS: [docs/DEPLOY-TESTNET.md](docs/DEPLOY-TESTNET.md) · Tokenomics: [docs/TOKENOMICS.md](docs/TOKENOMICS.md)

Hoặc thủ công không qua CLI:

```bash
docker compose -f local-net/docker-compose.yml up --build
```

Kiểm chứng (terminal khác):

```bash
# 1) Client đã rebrand thành 9chaingo
curl -s -X POST --data '{"jsonrpc":"2.0","id":1,"method":"info.getNodeVersion"}' \
  -H 'content-type:application/json' http://localhost:9650/ext/info

# 2) Địa chỉ mới mang tiền tố love9 (X-love91...)
curl -s -X POST --data '{"jsonrpc":"2.0","id":1,"method":"avm.createAddress","params":{"username":"u","password":"Str0ng-Pass-123"}}' \
  -H 'content-type:application/json' http://localhost:9650/ext/bc/X
```

## Đẻ 1 L1 EVM tuỳ chỉnh (multi-L1 as a service)

Một lệnh — tạo subnet + blockchain EVM (`love9evm`), track, mở RPC:

```bash
bash local-net/create-l1.sh MyChain
```

In ra RPC URL + thông số MetaMask (Chain ID 9100, symbol LOVE9). Deploy contract kiểm thử:

```bash
cd local-net/deploy-test && node deploy.mjs "http://localhost:9650/ext/bc/<BLOCKCHAIN_ID>/rpc"
```

Cấu hình mỗi L1 (chainId, phí gas, precompile governance, cấp phát token) nằm ở [9chain-a1-config/l1-evm-genesis.json](9chain-a1-config/l1-evm-genesis.json) — mỗi khách hàng = 1 genesis riêng.

> ⚠️ L1 hiện chưa bật Durango → compile contract với `evmVersion:"paris"` (script deploy đã set sẵn).

## Mạng nhiều node thật (khoá mới, không ewoq)

Sinh 1 mạng N node với khoá treasury + staking mới toanh, genesis `startTime` động, và compose gán static IP:

```bash
bash local-net/gen-network.sh 5
docker compose -f local-net/net/docker-compose.multinode.yml up -d --build
```

Kiểm chứng 5 validator thật (sybil-protection bật):

```bash
curl -s -X POST --data '{"jsonrpc":"2.0","id":1,"method":"platform.getCurrentValidators"}' \
  -H 'content-type:application/json' http://localhost:9650/ext/bc/P
```

> ⚠️ `local-net/net/treasury.txt` chứa **khoá bí mật** — đã `.gitignore`, tuyệt đối không commit. Với testnet/mainnet thật, sinh khoá trên máy an toàn, giữ offline.

## Rebrand lại sau khi kéo update Avalanche

```bash
cd upstream/avalanchego
git fetch upstream && git merge upstream/master   # hoặc tag vd v1.14.3
bash ../../scripts/rebrand.sh .                    # idempotent
```

Xem thêm: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · [docs/PROGRESS.md](docs/PROGRESS.md)

---
*9Chain-A1 là fork độc lập dựa trên avalanchego (BSD-3-Clause). Giữ nguyên bản quyền Ava Labs trong source; không dùng nhãn hiệu "Avalanche" cho branding. Phần EVM (`graft/coreth`, `graft/subnet-evm`) chứa code go-ethereum (LGPL) — tuân thủ LGPL.*
