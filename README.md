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

- **Nhận diện A1:** node `9chaingo` · token **LOVE9** · địa chỉ `love91…` · VM đẻ L1 `love9evm` · networkID **999999999** (thế hệ `g0`, tên mạng `9chain-a1-g0`) · C-Chain chainId **9000000009**.
  🔴 `networkID` **suy ra từ `A1Gen`**, đừng chép tay: `A1ID = A1IDGoc − A1Gen` = `999999999 − 0`. Ngày G bump `A1Gen` lên **1** ⇒ networkID **999999998**, tên `9chain-a1-g1`. `chainId 9000000009` thì **KHÔNG đổi theo thế hệ**.
- **Multi-L1 (ai cũng đẻ chain):** `graft/subnet-evm` → đẻ nhiều L1 EVM tuỳ chỉnh, qua giao diện hoặc CLI.
- **Merge upstream dễ:** lớp identity chỉ đổi *giá trị chuỗi*, không đổi định danh Go.

## Tham số kinh tế đang chạy

| | |
|---|--:|
| **Tổng cung công bố** | **9.000.000.000 LOVE9** |
| `SupplyCap` trong binary | **7.900.000.001 LOVE9** |
| Phát hành ở genesis | **5.400.000.000** (60%) |
| Phân bổ | Staking 40 · Community 30 · Foundation 12 · Private Sale 9 · Team 9 |
| Validator | **9 node**, self-bond 999.999 LOVE9/node |

🔴 **`SupplyCap` KHÁC tổng cung, và đó là CHỦ Ý — đừng hoà hai số về một.** `SupplyCap` là
trần của `currentSupply` **trên P-Chain**, mà `currentSupply` **không đếm phần C-Chain**.
Bất biến được `netgen` cưỡng chế (`mustFitSupplyCap()`):

```
SupplyCap (7.900.000.001)  +  Σ bucket.CChain (1.099.999.999)  ==  9.000.000.000
```

Hoà chúng về một con số nghĩa là **in thêm 1,1 tỷ**. Xem `genesis_9chain_a1.go` và D-039.

🔴 **`SupplyCap` được BIÊN DỊCH VÀO BINARY**, không đọc từ `genesis.json`. Đổi nó là phải
**build lại image node**, không chỉ sinh lại genesis. Đối chứng **bản đang chạy**:

```bash
ssh -i "$A1_SSH_KEY" "$A1_SSH_HOST" 'docker exec 9chain-a1-node-1 sh -c "grep -rho \"supplyCap[^,]*\" /root/.avalanchego/logs | head -1"'
```

⚠️ **Đừng dùng `docker logs … | head -1`** cho phép đo này. Vòng đệm stdout trôi qua dòng
boot sau ~11 giờ chạy ⇒ lệnh **ra RỖNG mà không báo lỗi**, và cái rỗng đó dễ bị đọc thành
*"không đo được"* thay vì *"đo sai chỗ"*. Đường còn sống là đọc **tệp log trong container**.

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
├── patches/                  # 24 patch tái lập lớp chủ quyền lên fork sạch (tree 074aaa93)
├── scripts/
│   ├── rebrand.sh            #   áp lớp identity (idempotent)
│   ├── check-consistency.mjs #   cổng nhất quán tokenomics (có đối chứng ngược)
│   └── setup-fork.sh
├── 9chain-a1-config/
│   └── l1-evm-genesis.json   # khuôn genesis cho L1 EVM
│                             # (genesis.json ĐÃ XOÁ 2026-08-27 — nó là genesis GỐC
│                             #  của Avalanche, khoá ewoq công khai giữ 50 triệu.
│                             #  Mạng nay boot bằng genesis do netgen sinh.)
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

🔴 **KHÔNG có thư mục nào tên là "bộ đang chạy". Hỏi TỪNG THƯ MỤC, bằng `genesis.json`.**
Đo `2026-08-28` trên máy dev — **9 thư mục, 3 thế hệ, và cái nghe chính thức nhất là đồ chết**:

| Thư mục | `networkID` | Là gì |
|---|--:|---|
| `net-that-g0/` | **999999999** | ✅ **thế hệ đang chạy (g0)** — bộ duy nhất khớp mạng công khai |
| `net-dryrun/` · `net-tap-g0/` · `net-tap-g0b/` | 899999999 | băng **TẬP**, không bao giờ bắt tay mạng thật |
| `net/` | 9001 | ⚫ chết — **nhưng đây là thư mục `docker-compose.yml` mount** |
| `net-public/` | 9001 | ⚫ chết ở phần mạng — 🔴 **nhưng giữ `chain-factory-key.txt` ĐANG CÓ TIỀN** |
| `net-public-dead-720m/` | 9001 | ⚫ chết — 🔴 giữ **bản trùng byte** của chính khoá đó |
| `net-bak-20260827/` · `net-drill9/` | 9001 | ⚫ chết |

🔴 **`net-public/` KHÔNG phải "mạng công khai" nữa** — tên đó có từ thế hệ 9001 và đã lạc hậu
hai lượt re-genesis. Nó là **thư mục TRỘN**: `keys.txt` là bộ đã chết (6/6 quỹ đọc ra **0**
trên chain), còn `chain-factory-key.txt` cùng thư mục là khoá **g0 đang giữ 89,899 LOVE9**
(`sha256` khoá = `1dc334145c8a1abc`, khớp bản ghi D-092).

⇒ **Một lượt dọn "xoá mấy thư mục 9001" sẽ shred mất khoá sống.** Trước khi xoá bất cứ thư
mục nào ở đây: chạy **`node scripts/check-net-dirs.mjs`** — nó khai thế hệ của từng thư mục
VÀ tách riêng tệp nào giữ tiền thật.

Bảng phân bổ của mạng công khai ở [docs/ALLOCATION-PUBLIC.md](docs/ALLOCATION-PUBLIC.md).
Đọc nhầm `net/allocation.md` rồi tưởng là số liệu công khai **đã xảy ra một lần** và làm
dự án explorer kết luận sai suốt một phiên.

## Bắt đầu đọc từ đâu

| Muốn gì | Đọc |
|---|---|
| Tiếp tục công việc | [HANDOFF.md](HANDOFF.md) — bàn giao, gotchas, sự cố đã trả giá |
| Việc còn lại | [PROGRESS.md](PROGRESS.md) ← **bản sống**. `docs/PROGRESS.md` là **nhật ký lịch sử, đóng băng 2026-08-24** |
| Vì sao lại quyết thế | [DECISIONS.md](DECISIONS.md) — D-001 → D-107b |
| Đang kẹt gì / chờ ai | [BLOCKERS.md](BLOCKERS.md) |
| Kiến trúc fork | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Ngày G `01/09` | [docs/GDAY-A1-REMAINING.md](docs/GDAY-A1-REMAINING.md) · [docs/GDAY-ENGRAVING.md](docs/GDAY-ENGRAVING.md) |
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
| Network ID | `utils/constants/network_ids.go` (`A1ID`) | `12345` | `999999999` = `A1IDGoc − A1Gen` |
| Tên mạng | `utils/constants/network_ids.go` (`A1Name`) | `local` | `9chain-a1-g0` |
| C-Chain chainId | `9chain-a1-tools/netgen/main.go` (`cChainGenesis`) | `43112` | `9000000009` |
| Lịch nâng cấp | `upgrade/upgrade.go` (`A1`) | `Default` của Ava Labs | `A1` |

**Không đụng:** `snow/` (consensus), `vms/` (VM), `chains/`. Đó là core, giữ nguyên.

Chuẩn đặt tên đầy đủ (chốt `2026-08-24`): xem [HANDOFF.md § Chuẩn đặt tên](HANDOFF.md).
Env dùng tiền tố `A1_*` (tên biến không được bắt đầu bằng số).

## Chạy mạng dev trên máy

Yêu cầu: Docker Desktop (Linux containers). `avalanchego` **không build native trên Windows** → luôn qua Docker.

```bash
bash local-net/9chain-a1 up                     # mạng dev 1 node
bash local-net/9chain-a1 l1 create AlphaChain   # đẻ 1 L1 EVM
NETWORK_ID=899999999 bash local-net/9chain-a1 net up 9   # mạng 9 node THẬT (khoá MỚI)
bash local-net/9chain-a1 info                   # phiên bản node + peers + validators
```

🔴 **`NETWORK_ID` là BẮT BUỘC** (patch 0020 · D-083). Mặc định cũ `9001` là **thế hệ đã
chết**; netgen nay dừng thẳng nếu thiếu, và đó là chủ ý — chọn băng là một quyết định.
Băng **TẬP** là `899999999` trở xuống, băng **THẬT** là `999999999` trở xuống; hai băng
không bao giờ bắt tay được nhau. Mạng thử trên máy dev thì dùng băng TẬP.

🔴 **Đo BINARY, đừng đo mạng — và đừng tin tag.** Hai bẫy đã cháy thật:

1. **`9chain-a1/node:dev` không nói gì về nội dung.** Cùng một tag ở máy dev và ở server
   từng là **hai binary khác nhau**. Nạp genesis 5,4 tỷ lên binary trần 720 triệu thì node
   **vẫn khởi động sạch**; sai lệch chỉ lộ ở phần thưởng staking nhiều ngày sau.
2. **netgen ghi `image: 9chain-a1/node:dev` CẮM CỨNG vào compose nó sinh** — không biến môi
   trường nào đổi được. Build image mới rồi `up -d` mà quên sửa dòng đó ⇒ mạng lên bằng
   **binary cũ**, 9/9 node xanh, **mọi cổng xanh**, mà bí danh `LOVE9` không có trong binary
   ⇒ mọi ví X/C chết câm. (D-105 · gotcha 16)

```bash
grep image: <net>/docker-compose.multinode.yml   # TRƯỚC khi `up`
docker exec 9chain-a1-node-1 ./avalanchego --version   # rồi đo BINARY, không đo mạng
```

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

`chainId` do console **tự cấp** từ **`9000000010`** trở lên, không cắm cứng. Cấu hình mỗi L1
(phí gas, precompile governance, cấp phát token) nằm ở
[9chain-a1-config/l1-evm-genesis.json](9chain-a1-config/l1-evm-genesis.json).

🔴 **Gốc dải KHÔNG còn là `9100`** (D-069 · B-14). `9100` đã bị chiếm trong sổ công khai
(*Genesis Coin*) — cùng `chainId` là **cùng một mạng dưới mắt MetaMask**, và EIP-155 buộc
chữ ký vào `chainId`. Gốc mới = `chainId` của A1 (`9000000009`) **+1**. Mỗi thế hệ lấy một
khối riêng `9_000_000_000 + A1Gen×1_000_000 + 10 … +999_999`, nên chain của thế hệ cũ không
thể lặng lẽ trỏ vào L1 của người mới.

⚠️ **`l1-evm-genesis.json` còn ghi `"chainId": 9100`.** Console **luôn ghi đè** giá trị đó
(`server.mjs`: `tpl.config.chainId = chainId`) nên đường qua giao diện an toàn. Nhưng
`create-l1.sh` và `local-net/9chain-a1 l1 create` truyền **thẳng** tệp này cho CLI ⇒ đường
dòng lệnh vẫn đẻ ra chain mang `chainId 9100`. Xem `BLOCKERS.md` B-14.

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
