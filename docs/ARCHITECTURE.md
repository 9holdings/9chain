# Kiến trúc 9Chain-A1 (sovereign fork của Avalanche)

Cập nhật luồng tạo chain `2026-09-07`: phân biệt mã console hiện có trong repo với
bản đang chạy công khai. Các thay đổi tự chủ D-197–D-224 chưa được deploy lên A1.
Bằng chứng mạng riêng5node/3L1 nằm trong
[PRIVATE-NETWORK-VERIFICATION-2026-09-07.md](PRIVATE-NETWORK-VERIFICATION-2026-09-07.md);
điều kiện chuyển bản công khai nằm trong [CONSOLE-FIRST-ADOPTION.md](CONSOLE-FIRST-ADOPTION.md).

## 1. Vì sao chỉ cần fork 1 repo

Avalanche là nhiều repo, nhưng "network of blockchains" nằm ở **`avalanchego`**. Bản mới đã **graft** (nhúng) coreth và subnet-evm vào monorepo:

```
avalanchego/
├── snow/            # ❄️ CORE: họ consensus Snow* (Snowman++)  — GIỮ NGUYÊN
├── vms/             # ❄️ CORE: khung VM (platformvm=P, avm=X, ...) — GIỮ NGUYÊN
├── chains/          # ❄️ CORE: quản lý chain/subnet             — GIỮ NGUYÊN
├── graft/
│   ├── coreth/      # C-Chain EVM (tương thích Ethereum)
│   └── subnet-evm/  # EVM cho L1/subnet tuỳ chỉnh  ← trọng tâm multi-L1
├── genesis/         # 🎯 identity: token name/symbol, allocation
├── version/         # 🎯 identity: client name
└── utils/constants/ # 🎯 identity: network IDs, HRP (tiền tố địa chỉ)
```

→ **Fork `avalanchego` là có đủ** core + C-Chain + subnet-evm cho mô hình "tự đẻ nhiều L1".

## 2. Primary Network — "network of blockchains" ngay từ genesis

Mỗi node 9Chain-A1 chạy sẵn 3 chain (rebrand từ Avalanche, giữ cơ chế):

| Chain | Vai trò | VM |
|---|---|---|
| **P-Chain** | Điều phối: validator, staking, **tạo L1/subnet** | `platformvm` |
| **X-Chain** | Tài sản (native token LOVE9) | `avm` |
| **C-Chain** | Smart contract EVM | `graft/coreth` |

Khách hàng của bạn tạo **L1 riêng** trên P-Chain, mỗi L1 chạy `graft/subnet-evm` với chainId + token gas riêng → đúng mô hình **multi-L1 as a service**.

## 2b. Luồng đẻ 1 L1 EVM (multi-L1 as a service)

VMID của L1 EVM 9Chain-A1 = `love9evm` (`pkqXszJe86D3xLomib9bLpXPfW7gr7FPhDAbg46p5iNjrn4mf`), build từ `graft/subnet-evm` và nhúng vào node tại `build/plugins/<VMID>`.

Luồng factory hiện tại của console:

```
[1] Tạo genesis riêng: chainId + admin + phân bổ riêng, không dùng nguyên khuôn.
    Ghi reservation bền vững trước khi gọi CLI (mã mới trong repo).
[2] 9chain-a1-cli l1 create, dùng A1_CLI_KEY của operator có tiền thanh khoản trên P:
      IssueCreateSubnetTx -> SUBNET_ID
      đăng ký validator primary vào subnet
      IssueCreateChainTx(vmID=love9evm, genesis=genesis-riêng) -> BLOCKCHAIN_ID
[3] Cho mọi node được quản lý theo dõi subnet, rollout rồi kiểm tra đúng L1 trên
    từng node và RPC công khai; chỉ xác nhận sau khi lưu ledger bền vững.
    RPC của L1: http://<node>/ext/bc/<BLOCKCHAIN_ID>/rpc
```

`9chain-a1-config/l1-evm-genesis.json` chỉ là **khuôn**. Giá trị mẫu không phải định
danh, admin hay phân bổ để dùng trực tiếp. Mỗi L1 có **genesis riêng**: `chainId`, `feeConfig`, precompile
(vd `feeManagerConfig` cho phép chủ L1 chỉnh phí runtime), và cấp phát token gas.
→ Mỗi khách hàng = 1 genesis = 1 L1 độc lập, chạy trên cùng mạng 9Chain-A1.

Hai binary không cùng mức hỗ trợ: `9chain-a1-cli` nhận `A1_CLI_KEY`, còn binary
`create-l1` cũ vẫn dùng khóa ewoq cố định. Script `local-net/create-l1.sh` vẫn gọi
binary cũ; đây là đường dev lịch sử, không phải hướng dẫn vận hành A1 công khai.
CLI cũng chưa có journal độc lập của console. Khi kết quả gửi giao dịch không rõ,
giữ nguyên bằng chứng và đối chiếu theo [CREATION-RECOVERY.md](CREATION-RECOVERY.md).

Việc một subnet có đăng ký trên P chưa chứng minh L1 đang thực thi: phép thử D-223
đã quan sát cả5 node primary khỏe nhưng L1 trả404 trước khi theo dõi subnet. Mô hình
factory hiện tại dùng validator primary; chưa triển khai bộ lập lịch thực thi dùng
chung hoặc cơ chế ngủ đông cho hàng tỷ sổ cá nhân.

## 2c. Mạng nhiều node thật (Milestone 2)

Tool [`netgen`](../upstream/avalanchego/9chain-a1-tools/netgen/main.go) sinh mọi thứ cho 1 mạng chủ quyền thật:

```
các quỹ riêng (secp256k1) -> phân bổ theo netgen/allocation.go
self-bond -> stake ban đầu; foundation -> địa chỉ nhận thưởng
mỗi node:
  staking TLS cert+key -> NodeID (ids.NodeIDFromCert)
  BLS secret key       -> ProofOfPossession (signer.NewProofOfPossession)
genesis.json:
  networkID 999999998 (BẮT BUỘC khai — mặc định cũ đã chết cùng thế hệ của nó),
  startTime = now-60 (ĐỘNG — tránh stake hết hạn),
  initialStakers = N node, initialStakedFunds = quỹ self-bond riêng (chia đều)
docker-compose.multinode.yml:
  static IP (avalanchego cần IP, không hostname), node1 = beacon,
  node2.. --bootstrap-ids/--bootstrap-ips trỏ node1
```

Đo mới D-223:5 node với Sybil protection mặc định; mỗi validator primary có trọng
số1799998200000000nLOVE9. Các subnet thử có5validator, trọng số100 mỗi validator.
Node ngoài beacon bootstrap được; khóa đều mới sinh trong fixture riêng, không dùng
ewoq. Các số này là của mạng thử riêng; không mô tả bộ validator công khai.

> Vì sao cần `startTime` động: genesis local Avalanche cắm cứng `startTime=1721016000` (2024) + stake 1 năm → so với hiện tại đã hết hạn → mạng chết. netgen dùng `time.Now()`.

## 3. Bề mặt rebrand & vì sao merge upstream sạch

Nguyên tắc: **đổi VALUE, không đổi IDENTIFIER**.

```
Client = "avalanchego"   →  Client = "9chaingo"     # đổi chuỗi, không đổi tên biến Client
Symbol: "AVAX"           →  Symbol: "LOVE9"             # đổi chuỗi, không đổi field
FallbackHRP = "custom"   →  FallbackHRP = "love9"        # đổi chuỗi hằng
```

Vì tên biến/hàm/field giữ nguyên, khi `git merge upstream` Git chỉ thấy vài dòng chuỗi khác → hầu như không conflict. Nếu upstream đổi ngay dòng đó, chạy lại `rebrand.sh` (idempotent) là xong.

### Cơ chế địa chỉ (điểm tinh tế)
`genesis.go` format địa chỉ bằng `address.FormatBech32(GetHRP(networkID), addrBytes)`. Vì 9Chain-A1 dùng **networkID 999999998** (không nằm trong bảng `1/5/12345` của Ava Labs), `GetHRP` rơi vào `FallbackHRP="love9"` ⇒ địa chỉ hiển thị tiền tố `love9`. Cơ chế này đúng với **mọi thế hệ**: bump `A1Gen` là đổi `networkID`, và tiền tố vẫn `love9` vì nó luôn rơi vào nhánh fallback — đó là lý do đổi thế hệ **không** đổi hình dạng địa chỉ, nên nhìn bằng mắt không phân biệt được ví g0 với ví g1. Phải đo.

*(Thời PoC còn dùng khoá test `ewoq`: bytes địa chỉ giữ nguyên nên vẫn ký được, chỉ tiền tố hiển thị đổi. Genesis công khai từ `2026-08-27` trở đi **không** dùng `ewoq` — mỗi thế hệ sinh bộ khoá quỹ riêng.)*

## 4. Ràng buộc môi trường
- `avalanchego` dùng syscall Unix (`utils/ulimit`) → **không build native trên Windows**. Luôn build/chạy qua **Docker (Linux)** hoặc WSL.
- Cần **Go 1.25.10** (theo `go.mod`); Dockerfile đã ghim base image.
- Build cần CGO (blst, zstd, libevm) → build trong Linux container có `gcc`.

## 5. Ranh giới PoC ↔ Production
Code rebrand xong **không tạo ra một blockchain an toàn**. Phần nặng còn lại là **vận hành + kinh tế**, xem [PROGRESS.md](../PROGRESS.md):
- Validator độc lập, phi tập trung (không thì mạng không có bảo mật thật).
- Tokenomics genesis (allocation, staking reward, phí) — sai là hỏng vĩnh viễn.
- Tái sinh khoá/địa chỉ genesis thật (không dùng khoá test ewoq công khai).
- Bootstrap nodes, explorer, wallet, faucet.
- Quy trình rebase upstream định kỳ (vá bảo mật).
