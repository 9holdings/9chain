# 9Chain Testnet A1 (Avalanche)

**Track Avalanche** của 9Chain — một trong hai testnet chạy song song để cộng đồng chọn hướng mainnet (A1 = Avalanche, C1 = Cosmos). Đây là một **sovereign fork** của [avalanchego](https://github.com/ava-labs/avalanchego): **giữ nguyên 100% core** (Snow\* + P/X/C + subnet/L1), chỉ **thay lớp identity** sang 9Chain.

> 🟢 **Testnet đang chạy công khai.** Không phải mạng local.
>
> | | |
> |---|---|
> | Trang chính | **<https://a1.9chain.org>** |
> | RPC C-Chain | **`https://rpc-a1.9chain.org/ext/bc/C/rpc`** |
> | Explorer | **<https://a1.9scan.org>** (dự án riêng: `9Scan-A1`) |
> | Vòi token thử | <https://a1.9chain.org/faucet/> |
> | Đẻ chain của bạn | <https://a1.9chain.org/create-chain/> |
> | Danh bạ L1 | <https://a1.9chain.org/chains/> |
>
> ⚠️ **Testnet — token không có giá trị.** Mạng sẽ **sinh lại genesis ngày `2026-09-01`**;
> mọi số dư hiện tại về 0. Xem <https://a1.9chain.org/re-genesis/>.

- **Nhận diện A1:** node `9chaingo` · token **LOVE9** · địa chỉ `love91…` · VM đẻ L1 `love9evm` · networkID **9001** · C-Chain chainId **9000000009**.
- **Multi-L1 (ai cũng đẻ chain):** `graft/subnet-evm` → đẻ nhiều L1 EVM tuỳ chỉnh, qua giao diện hoặc CLI.
- **Merge upstream dễ:** lớp identity chỉ đổi *giá trị chuỗi*, không đổi định danh Go.

## Tham số kinh tế đang chạy

| | |
|---|--:|
| Tổng cung (`SupplyCap`) | **9.000.000.000 LOVE9** |
| Phát hành ở genesis | **5.400.000.000** (60%) |
| Phân bổ | Staking 40 · Community 30 · Foundation 12 · Private Sale 9 · Team 9 |
| Validator | **9 node**, self-bond 999.999 LOVE9/node |

🔴 **`SupplyCap` được BIÊN DỊCH VÀO BINARY**, không đọc từ `genesis.json`. Đổi nó là phải
**build lại image node**, không chỉ sinh lại genesis. Đối chứng bản đang chạy:

```bash
docker logs 9chain-a1-node-1 2>&1 | head -1 | grep -o '"supplyCap":[0-9]*'
```

⚠️ **LOVE9 có 9 chữ số thập phân trên P/X-Chain và 18 trên C-Chain.** Cả hai đều đúng —
xem [docs/TOKENOMICS.md §0](docs/TOKENOMICS.md). Nguồn sự thật cho con số là mã và mạng
đang chạy, **không phải** `TOKENOMICS.md` (tệp đó còn phần cũ, có banner cảnh báo).

## Cấu trúc

```
9Chain-A1/
├── web/                      # 🟢 TRANG CÔNG KHAI — Next 15 xuất tĩnh, Tailwind v4
│   ├── app/                  #    /, /faucet/, /create-chain/, /my-chains/,
│   │                         #    /compare/, /re-genesis/
│   ├── lib/i18n/vi.ts        #    MỌI chữ hiện ra cho người dùng nằm ở đây
│   ├── app/tokens.css        #    token thiết kế — CHÉP từ 9Scan-A1, đừng sửa tay
│   └── public/brand/         #    logo + og-image
├── upstream/avalanchego/     # bản fork avalanchego (repo RIÊNG, không track ở đây)
│   └── 9chain-a1-tools/      #   overlay chủ quyền (không đụng core)
│       ├── netgen/           #     sinh khoá + genesis + compose N node
│       ├── engrave-verify/   #     đọc ngược chữ khắc genesis (ngày G)
│       ├── 9chain-a1-cli/    #     CLI factory L1
│       └── xp-wallet/        #     ví X/P
├── patches/                  # 12 patch tái lập lớp chủ quyền lên fork sạch
├── scripts/
│   ├── rebrand.sh            #   áp lớp identity (idempotent)
│   ├── check-consistency.mjs #   cổng nhất quán tokenomics (có đối chứng ngược)
│   └── setup-fork.sh
├── 9chain-a1-config/
│   ├── genesis.json          # genesis Primary Network (networkID 9001)
│   └── l1-evm-genesis.json   # khuôn genesis cho L1 EVM
├── local-net/
│   ├── console/              # 🟢 bộ điều phối đẻ/thu hồi L1 (SIWE) — API sống
│   ├── faucet/              # 🟢 API faucet + các bài kiểm trên mạng thật
│   ├── chains/              # 🟢 trang danh bạ L1  → /chains/
│   ├── deploy/              # 🟢 Caddyfile + script deploy có nghiệm thu thật
│   ├── contracts/           #   AssetBridge.sol + IWarpMessenger.sol
│   ├── gen-network.sh       #   1 lệnh sinh mạng N node thật (khoá MỚI)
│   ├── explorer/  dashboard/ # ⚫ ĐÃ TẮT (docker stop, chưa xoá) — thay bằng 9Scan-A1
│   └── 9chain-a1            #   CLI mặt tiền cho dev
├── explorer-full/            # Blockscout rebrand (đang phục vụ, sẽ thay bằng 9Scan-A1)
└── docs/
```

⚠️ **`local-net/net*/` chứa KHOÁ BÍ MẬT** (`keys.txt`, `faucet.env`, …) — đã `.gitignore`,
tuyệt đối không commit.

🔴 **`local-net/net/` là bộ DEV LOCAL, `local-net/net-public/` là MẠNG CÔNG KHAI.**
Bảng phân bổ của mạng công khai ở [docs/ALLOCATION-PUBLIC.md](docs/ALLOCATION-PUBLIC.md).
Đọc nhầm `net/allocation.md` rồi tưởng là số liệu công khai **đã xảy ra một lần** và làm
dự án explorer kết luận sai suốt một phiên.

## Bắt đầu đọc từ đâu

| Muốn gì | Đọc |
|---|---|
| Tiếp tục công việc | [HANDOFF.md](HANDOFF.md) — bàn giao, gotchas, sự cố đã trả giá |
| Việc còn lại | [PROGRESS.md](PROGRESS.md) ← **bản sống**. `docs/PROGRESS.md` là **nhật ký lịch sử, đóng băng 2026-08-24** |
| Vì sao lại quyết thế | [DECISIONS.md](DECISIONS.md) — D-001 → D-047 |
| Đang kẹt gì / chờ ai | [BLOCKERS.md](BLOCKERS.md) |
| Kiến trúc fork | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Ngày G `01/09` | [docs/NGAY-G-A1-CON-LAI.md](docs/NGAY-G-A1-CON-LAI.md) · [docs/KHAC-CHU-NGAY-G.md](docs/KHAC-CHU-NGAY-G.md) |
| A1 so với C1 | [docs/A1-vs-C1-SCORECARD.md](docs/A1-vs-C1-SCORECARD.md) |
| Chuẩn hoá thương hiệu | [docs/BRAND-AUDIT-2026-08-27.md](docs/BRAND-AUDIT-2026-08-27.md) |

## Lớp identity (toàn bộ thay đổi so với upstream)

| Điểm chạm | File | Từ | Thành |
|---|---|---|---|
| Client/node name | `version/constants.go` | `avalanchego` | `9chaingo` |
| Tên token | `genesis/genesis.go` | `Avalanche` | `LOVE9 Coin` |
| Ký hiệu token | `genesis/genesis.go` | `AVAX` | `LOVE9` |
| HRP địa chỉ | `utils/constants/network_ids.go` | `custom` | `love9` |
| VMID L1 EVM | `graft/subnet-evm/scripts/constants.sh` | `subnetevm` | `love9evm` |
| Tham số kinh tế | `genesis/genesis_9chain_a1.go` | LocalParams | `A1Params` (9 tỷ) |
| Network ID | `9chain-a1-config/genesis.json` | `12345` | `9001` |
| C-Chain chainId | `9chain-a1-config/genesis.json` | `43112` | `9000000009` |

**Không đụng:** `snow/` (consensus), `vms/` (VM), `chains/`. Đó là core, giữ nguyên.

Chuẩn đặt tên đầy đủ (chốt `2026-08-24`): xem [HANDOFF.md § Chuẩn đặt tên](HANDOFF.md).
Env dùng tiền tố `A1_*` (tên biến không được bắt đầu bằng số).

## Chạy mạng dev trên máy

Yêu cầu: Docker Desktop (Linux containers). `avalanchego` **không build native trên Windows** → luôn qua Docker.

```bash
bash local-net/9chain-a1 up                     # mạng dev 1 node
bash local-net/9chain-a1 l1 create AlphaChain   # đẻ 1 L1 EVM
bash local-net/9chain-a1 net up 5               # mạng 5 node THẬT (khoá mới)
bash local-net/9chain-a1 info                   # phiên bản node + peers + validators
```

🔴 **Trên máy dev, tag `9chain-a1/node:dev` có thể là BINARY CŨ 720 triệu.** Bản 9 tỷ ở
tag `:drill9`; còn `:dev` của **server** mới là bản 9 tỷ. **Cùng một tag, hai máy, hai
binary.** Luôn đối chứng `supplyCap` bằng lệnh ở mục tham số phía trên — nạp genesis
5,4 tỷ lên binary trần 720 triệu thì node **vẫn khởi động sạch**, sai lệch chỉ lộ ở phần
thưởng staking nhiều ngày sau.

Kiểm chứng lớp identity:

```bash
# Client đã là 9chaingo
curl -s -X POST --data '{"jsonrpc":"2.0","id":1,"method":"info.getNodeVersion"}' \
  -H 'content-type:application/json' http://localhost:9650/ext/info
```

## Đẻ một L1 EVM

Qua giao diện: <https://a1.9chain.org/create-chain/> (đăng nhập bằng chữ ký ví).
Hoặc một lệnh trên máy dev:

```bash
bash local-net/create-l1.sh MyChain
```

`chainId` do console **tự cấp** từ `9100` trở lên, không cắm cứng. Cấu hình mỗi L1
(phí gas, precompile governance, cấp phát token) nằm ở
[9chain-a1-config/l1-evm-genesis.json](9chain-a1-config/l1-evm-genesis.json).

⚠️ **Trần 15 L1** — mô hình hiện tại cho mọi validator track mọi L1, và đụng trần cứng
ở 16 (`network/peer/peer.go`). Muốn hơn thì phải làm ACP-77. Xem `BLOCKERS.md` H-2.

⚠️ L1 chưa bật Durango → compile contract với `evmVersion:"paris"`.

## Rebrand lại sau khi kéo update upstream

```bash
cd upstream/avalanchego
git fetch upstream && git merge upstream/master
bash ../../scripts/rebrand.sh .                  # idempotent
```

Lớp chủ quyền tái lập được từ fork sạch bằng `patches/` — nhớ **`git am --keep-cr`**, và
nghiệm thu bằng **tree hash**, không phải commit hash (`git am` ghi lại committer).

## Giấy phép

Mã gốc của dự án: **BSD-3-Clause** — xem [LICENSE](LICENSE).

🔴 Các thành phần bên thứ ba giữ giấy phép riêng của chúng, gồm **avalanchego**
(BSD-3-Clause, Ava Labs) — kể cả mã avalanchego nằm trong `patches/` — và **coreth /
subnet-evm** (**LGPL-3.0**, dẫn xuất từ go-ethereum). Ai phân phối lại image node phải
tuân thủ nghĩa vụ LGPL. Danh sách đầy đủ: [NOTICE](NOTICE).

"Avalanche" và "AvalancheGo" là nhãn hiệu của Ava Labs, Inc. 9Chain-A1 **không dùng chúng
để làm thương hiệu**; nơi chúng xuất hiện là để nói đúng nguồn gốc phần mềm. Đây là dự án
độc lập, không liên kết với Ava Labs.
