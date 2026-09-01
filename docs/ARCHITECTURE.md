# Kiến trúc 9Chain-A1 (sovereign fork của Avalanche)

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

Quy trình 2 pha (đã tự động hoá trong `local-net/create-l1.sh`):

```
[1] create-l1 (wallet SDK, khoá ewoq)
      IssueCreateSubnetTx      -> SUBNET_ID
      IssueCreateChainTx(vmID=love9evm, genesis=l1-evm-genesis.json) -> BLOCKCHAIN_ID
[2] restart node với AVAGO_TRACK_SUBNETS=SUBNET_ID + --plugin-dir=.../plugins
      -> node nạp plugin love9evm, khởi tạo chain, mở RPC:
         http://<node>/ext/bc/<BLOCKCHAIN_ID>/rpc  (JSON-RPC EVM chuẩn)
```

Mỗi L1 có **genesis riêng** (`l1-evm-genesis.json`): `chainId`, `feeConfig`, precompile
(vd `feeManagerConfig` cho phép chủ L1 chỉnh phí runtime), và cấp phát token gas.
→ Mỗi khách hàng = 1 genesis = 1 L1 độc lập, chạy trên cùng mạng 9Chain-A1.

## 2c. Mạng nhiều node thật (Milestone 2)

Tool [`netgen`](../upstream/avalanchego/9chain-a1-tools/netgen/main.go) sinh mọi thứ cho 1 mạng chủ quyền thật:

```
treasury (secp256k1)  -> cấp phát genesis (X/P + C-Chain EVM), là reward/stake owner
mỗi node:
  staking TLS cert+key -> NodeID (ids.NodeIDFromCert)
  BLS secret key       -> ProofOfPossession (signer.NewProofOfPossession)
genesis.json:
  networkID 999999998 (BẮT BUỘC khai — mặc định cũ đã chết cùng thế hệ của nó),
  startTime = now-60 (ĐỘNG — tránh stake hết hạn),
  initialStakers = N node, initialStakedFunds = treasury (khoá locked chia đều)
docker-compose.multinode.yml:
  static IP (avalanchego cần IP, không hostname), node1 = beacon,
  node2.. --bootstrap-ids/--bootstrap-ips trỏ node1
```

Đã kiểm chứng: 5 node, `sybil-protection` bật, `getCurrentValidators` = 5 (connected, weight 20e15 mỗi node), node non-beacon bootstrap thành công. **Không dùng ewoq.**

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
Code rebrand xong **không tạo ra một blockchain an toàn**. Phần nặng còn lại là **vận hành + kinh tế**, xem [PROGRESS.md](PROGRESS.md):
- Validator độc lập, phi tập trung (không thì mạng không có bảo mật thật).
- Tokenomics genesis (allocation, staking reward, phí) — sai là hỏng vĩnh viễn.
- Tái sinh khoá/địa chỉ genesis thật (không dùng khoá test ewoq công khai).
- Bootstrap nodes, explorer, wallet, faucet.
- Quy trình rebase upstream định kỳ (vá bảo mật).
