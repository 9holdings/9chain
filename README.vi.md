# 9Chain Testnet A1

**Một bản fork chủ quyền của [avalanchego](https://github.com/ava-labs/avalanchego).** Bộ máy đồng
thuận, các VM và kiến trúc P/X/C là công trình của Ava Labs và **giữ nguyên**. Thứ 9Chain-A1 thay
là **lớp định danh**: network id, tên mạng, tiền tố địa chỉ, token, tham số kinh tế, lịch nâng cấp.

> ⚠️ **Đây là mạng THỬ. LOVE9 không có giá trị tiền tệ.** Đừng mua, đừng bán, đừng nhận thay tiền.
> Mạng thử thì sẽ được sinh lại; khi đó mọi số dư về 0, và chúng tôi báo trước.

| | |
|---|---|
| Trang chính | <https://a1.9chain.org> |
| RPC C-Chain | `https://rpc-a1.9chain.org/ext/bc/C/rpc` |
| Explorer | <https://a1.9scan.org> |
| Vòi token thử | <https://a1.9chain.org/faucet/> |
| Đẻ chain của bạn | <https://a1.9chain.org/create-chain/> |
| Danh bạ L1 | <https://a1.9chain.org/chains/> |

## Bắt đầu đọc từ đâu

| Muốn gì | Đọc |
|---|---|
| **Chạy validator** | [docs/RUN-A-VALIDATOR.md](docs/RUN-A-VALIDATOR.md) — dựng lại fork, nghiệm thu tree hash, join, stake |
| **Đẻ chain của riêng bạn** | [docs/CREATE-A-CHAIN.vi.md](docs/CREATE-A-CHAIN.vi.md) — 15 phút, không cần biết gì về blockchain |
| Hiểu kiến trúc | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Kiểm số học token | [docs/TOKENOMICS.md](docs/TOKENOMICS.md) · [docs/ALLOCATION-PUBLIC.md](docs/ALLOCATION-PUBLIC.md) |
| Đọc chữ khắc trong genesis | [docs/engrave/](docs/engrave/) |
| **Tiếp tục công việc** (sổ nội bộ) | [HANDOFF.md](HANDOFF.md) · [CLAUDE.md](CLAUDE.md) · [DECISIONS.md](DECISIONS.md) · [BLOCKERS.md](BLOCKERS.md) · [PROGRESS.md](PROGRESS.md) |

⚠️ Bản tiếng Anh [README.md](README.md) là **bản nguồn**. Dịch từ nó, đừng dịch từ bản dịch.

## Định danh

| | |
|---|---|
| Tên node | `9chaingo` |
| Token | **LOVE9** |
| Tiền tố địa chỉ (P/X) | `P-love9…` / `X-love9…` |
| VM đẻ L1 EVM | `love9evm` |
| `chainId` C-Chain | **`9000000009`** — cố định ở MỌI thế hệ |
| Network id | suy ra, xem dưới |

### Thế hệ — networkID được SUY RA, không bao giờ chép tay

A1 thỉnh thoảng sinh lại genesis. Mỗi lượt là một **thế hệ**, đếm bằng đúng một số nguyên `A1Gen`
(`utils/constants/network_ids.go`). Mọi thứ khác suy ra từ nó:

```
networkID   = A1IDGoc − A1Gen        (A1IDGoc = 999999999)
networkName = "9chain-a1-g{A1Gen}"
khối chainId L1 = 9_000_000_000 + A1Gen × 1_000_000 + 10 … +999_999
```

Thế hệ `g1` vì thế chạy trên networkID **999999998**, tên `9chain-a1-g1`.

Hai tính chất an toàn đúng ở mọi thế hệ, và cả hai đều có chủ ý:

- **Băng TẬP không bao giờ bắt tay được băng THẬT.** Mạng diễn tập sinh từ
  `A1IDGocTap = 899999999`, một băng riêng. Node của một lượt tập không thể vô tình join mạng công
  khai, dù ai gõ gì.
- **Mỗi thế hệ có một khối chainId L1 riêng, rời nhau.** Chain của thế hệ cũ không thể lặng lẽ trỏ
  vào L1 của người mới, và chữ ký bên này không phát lại được bên kia (EIP-155 buộc chữ ký vào
  `chainId`).

🔴 `A1Gen` **được khai ở HAI ngôn ngữ** — Go (`A1Gen`) và JavaScript (`local-net/lib/chainid.mjs`
→ `A1_GEN`). Bump một bên mà quên bên kia thì **không có gì báo lỗi**: console sẽ cấp chainId từ
khối của thế hệ khác, và số đó đi vào ví người dùng qua một genesis **bất biến**.
`node scripts/check-consistency.mjs` là cổng so hai bên.

## Kinh tế

| | |
|---|--:|
| **Tổng cung công bố** | **9.000.000.000 LOVE9** |
| `SupplyCap` biên dịch vào binary | 7.900.000.001 LOVE9 |
| Phát hành ở genesis | 5.400.000.000 (60%) |
| Phân bổ | Staking 40 · Community 30 · Foundation 12 · Private Sale 9 · Team 9 |
| Validator | 9 node, self-bond 999.999 LOVE9/node |

🔴 **`SupplyCap` KHÁC tổng cung, và hoà hai số về một nghĩa là in thêm 1,1 tỷ.** `SupplyCap` là trần
của `currentSupply` **trên P-Chain**, mà `currentSupply` **không đếm phần C-Chain**. Bất biến
`netgen` cưỡng chế (`mustFitSupplyCap()`):

```
SupplyCap (7.900.000.001)  +  Σ bucket.CChain (1.099.999.999)  ==  9.000.000.000
```

⚠️ **LOVE9 có 9 chữ số thập phân trên P/X-Chain và 18 trên C-Chain.** Cả hai đều đúng — một đồng
tiền, hai thang. Xem [docs/TOKENOMICS.md §0](docs/TOKENOMICS.md).

🔴 `SupplyCap` **được BIÊN DỊCH VÀO BINARY**, không đọc từ `genesis.json`. Đổi nó là phải build lại
image node, không chỉ sinh lại genesis.

## Dựng lại bản fork

Bạn không được yêu cầu tin một binary. Lớp chủ quyền phát hành dưới dạng một bộ patch, áp lên bản
upstream sạch và **phải** ra đúng một tree hash đã công bố.

```bash
git clone https://github.com/ava-labs/avalanchego.git && cd avalanchego
git checkout 1cf1fc3
git am --keep-cr /duong/dan/9chain-a1/patches/*.patch
git rev-parse HEAD^{tree}     # 60a61707f7974a0f1853b8bf78df7d0fdc1ef863
```

`--keep-cr` **không phải tuỳ chọn**: thiếu nó thì ký tự xuống dòng đổi và tree hash không khớp.

**Đối chứng ngược — làm luôn cái này.** Áp **25 trong 26** patch phải ra một tree **khác, cũng đã
công bố**: `f2b9486b71ad53b584a86f77d6017c34d74e6fa6`. Một mỏ neo chỉ chứng minh bộ patch nhất quán
với con số chính chúng tôi in trong tài liệu của mình; **hai** mỏ neo có gốc độc lập mới nói được
điều gì đó. Hướng dẫn đầy đủ ở [docs/RUN-A-VALIDATOR.md](docs/RUN-A-VALIDATOR.md).

## Lớp định danh thực sự đổi những gì

| Điểm chạm | File | Từ | Thành |
|---|---|---|---|
| Tên client/node | `version/constants.go` | `avalanchego` | `9chaingo` |
| Tên token | `genesis/genesis.go` | `Avalanche` | `LOVE9 Coin` |
| Ký hiệu token | `genesis/genesis.go` | `AVAX` | `LOVE9` |
| HRP địa chỉ | `utils/constants/network_ids.go` | `custom` | `love9` |
| VMID L1 EVM | `graft/subnet-evm/scripts/constants.sh` | `subnetevm` | `love9evm` |
| Tham số kinh tế | `genesis/genesis_9chain_a1.go` | `LocalParams` | `A1Params` |
| Network ID | `utils/constants/network_ids.go` (`A1ID`) | `12345` | `A1IDGoc − A1Gen` |
| Tên mạng | `utils/constants/network_ids.go` (`A1Name`) | `local` | `9chain-a1-g{N}` |
| chainId C-Chain | `9chain-a1-tools/netgen/main.go` | `43112` | `9000000009` |
| Lịch nâng cấp | `upgrade/upgrade.go` (`A1`) | `Default` của Ava Labs | `A1` |

**Không đụng:** `snow/` (đồng thuận), `vms/` (máy ảo), `chains/`. Đó là core, giữ nguyên của upstream.

Bí danh tài sản là **`LOVE9`, và chỉ `LOVE9`**. Hỏi X-Chain về `AVAX` sẽ nhận một lỗi nói rõ điều
đó. **Lỗi ấy là tính năng**, không phải thiếu sót.

## Cấu trúc repo

```
9Chain-A1/
├── patches/                   # 26 patch tái lập lớp chủ quyền lên 1cf1fc3
├── upstream/avalanchego/      # bản fork (repo RIÊNG, không track ở đây)
│   └── 9chain-a1-tools/       #   overlay chủ quyền — không đụng core
│       ├── netgen/            #     sinh khoá + genesis + compose N node
│       ├── engrave-verify/    #     đọc ngược chữ khắc, từ TỆP và từ CHAIN
│       ├── 9chain-a1-cli/     #     CLI factory L1
│       └── xp-wallet/         #     ví X/P
├── local-net/
│   ├── console/               # bộ điều phối đẻ chain (đăng nhập bằng chữ ký ví)
│   ├── faucet/                # API vòi token
│   ├── chains/                # trang danh bạ L1
│   ├── deploy/                # Caddyfile + script deploy
│   └── gen-network.sh         # một lệnh, một mạng N node thật
├── scripts/                   # các cổng — xem dưới
├── 9chain-a1-config/
│   └── l1-evm-genesis.json    # KHUÔN genesis L1 EVM, không dùng được nguyên xi (xem lưu ý)
├── web/                       # trang công khai (Next, xuất tĩnh)
└── docs/
```

⚠️ `local-net/net*/` chứa **KHOÁ BÍ MẬT** (`keys.txt`, `faucet.env`). Đã `.gitignore`, tuyệt đối
không commit.

🔴 **Không có thư mục nào tên là "bộ đang chạy", và đừng tin bảng nào chép tay điều đó.** Thư mục
`local-net/net*/` thuộc nhiều thế hệ khác nhau, và cái nghe chính thức nhất có thể là đồ chết —
trong khi một thư mục **tự khai là đồ chết** lại đang giữ khoá **có tiền thật**. Hỏi **từng thư
mục**, bằng phép đo, trước mọi lượt dọn:

```bash
node scripts/check-net-dirs.mjs
```

⚠️ `9chain-a1-config/l1-evm-genesis.json` là **KHUÔN, không phải genesis dùng được**: nó khai một
`chainId` đã bị chiếm trong sổ công khai, và cấp toàn bộ cung cho khoá `ewoq` — khoá **được công bố
trong repo avalanchego**. Mọi đường đẻ L1 nay dựng genesis thật qua `scripts/make-l1-genesis.mjs`.
Đưa thẳng cái khuôn cho CLI là sai lầm mà công cụ nay **từ chối làm hộ bạn**.

## Các cổng

Lớp lỗi đắt nhất của dự án này là **đo sai đại lượng** — mọi phép kiểm đều xanh vì tất cả cùng đo
sai một thứ. Các cổng sinh ra để chống điều đó, và mỗi cổng đều kèm một **đối chứng ngược đã từng
thấy ĐỎ vì đúng lý do**.

```bash
node scripts/gday-preflight.mjs        # cả bộ cổng trong một lệnh, kèm các việc tay nó không tự làm được
node scripts/check-consistency.mjs     # số học tokenomics, đọc THẲNG từ mã Go
node scripts/check-single-source.mjs   # một hằng số, khai đúng MỘT nơi
node scripts/check-net-dirs.mjs        # thư mục mạng nào thuộc thế hệ nào
node scripts/watch-network.mjs         # đo trên NODE ĐANG CHẠY, không đo repo
```

Mã thoát dùng chung cả bộ: **0** đạt · **1** đỏ · **2** không đo được. **`2` không bao giờ là đạt.**

## Chạy một mạng trên máy

Cần Docker. `avalanchego` **không build native trên Windows**, nên mọi thứ đi qua container.

```bash
NETWORK_ID=899999999 bash local-net/gen-network.sh 5
```

🔴 **`NETWORK_ID` là BẮT BUỘC.** Trước đây nó có mặc định, và mặc định đó là một **thế hệ đã chết**.
Chọn băng là một quyết định, nên công cụ bắt bạn quyết. Dùng băng **TẬP** (`899999999` trở xuống)
cho mọi thứ chạy trên máy; nó không bao giờ bắt tay được mạng công khai.

🔴 **Đo BINARY, đừng đo mạng.** Node khởi động sạch trên binary sai — nạp genesis 5,4 tỷ lên một
binary biên dịch cho mức cung khác thì nó **vẫn lên bình thường**, sai lệch chỉ lộ ở phần thưởng
staking nhiều ngày sau. Thêm nữa, `netgen` **cắm cứng** tag image vào compose nó sinh, và không
biến môi trường nào đổi được:

```bash
grep image: <net>/docker-compose.multinode.yml       # TRƯỚC khi `up`
docker exec 9chain-a1-node-1 ./avalanchego --version  # rồi đo BINARY
```

## Chữ khắc trong genesis

Genesis của A1 mang văn bản: ở trường `Message` của P-Chain (mặt **gốc**), và với các tài liệu
tiếng Anh là **mã hợp đồng** tại một địa chỉ C-Chain cố định. Xem [docs/engrave/](docs/engrave/)
cho canon — id, sha256, số byte từng tài liệu — và `docs/GDAY-ENGRAVING.md` cho cơ chế.

🔴 **`0x9000000000000000000000000000000000000009` KHÔNG phải ví của ai cả.** Nó giữ văn bản đã khắc
dưới dạng mã hợp đồng, số dư bằng 0, và **không tồn tại khoá riêng** cho nó — suy ra một khoá là
bài toán 2^160, nên **kể cả chúng tôi cũng không chạm được** vào văn bản đó. Đó chính là điểm của
nó. Nhưng nó cũng là một địa chỉ ngắn, dễ nhớ, **toàn chữ số**, trên một chain có `chainId` mẹ là
`9000000009` — đúng cái hình dạng người ta nhầm là ví quỹ: **gửi gì vào đó là ĐỐT, vĩnh viễn.**

## Giấy phép

Mã gốc của dự án: **BSD-3-Clause** — xem [LICENSE](LICENSE).

🔴 Các thành phần bên thứ ba giữ giấy phép riêng: **avalanchego** (BSD-3-Clause, Ava Labs) — kể cả
mã avalanchego nằm trong `patches/` — và **coreth / subnet-evm** (**LGPL-3.0**, dẫn xuất từ
go-ethereum). Ai phân phối lại image node phải tuân thủ nghĩa vụ LGPL. Danh sách đầy đủ:
[NOTICE](NOTICE).

"Avalanche" và "AvalancheGo" là nhãn hiệu của Ava Labs, Inc. 9Chain-A1 **không dùng chúng để làm
thương hiệu**; nơi chúng xuất hiện là để nói đúng nguồn gốc phần mềm. Đây là dự án độc lập, không
liên kết với Ava Labs.
