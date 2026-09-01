# 9Chain Testnet A1 vs C1 — Scorecard để cộng đồng chọn

**Bảng điểm SỐNG:** `http://localhost:8092` (9chain-a1 dashboard) — kéo metric A1 live + C1 (điền REST endpoint), slider trọng số → ra điểm.

> Mục tiêu: chạy **hai testnet song song của cùng một sản phẩm 9Chain**, khác nhau ở **engine**, để cộng đồng chọn hướng mainnet **bằng dữ liệu thật**, không bằng tranh luận.

| | **A1 — Avalanche** | **C1 — Cosmos** |
|---|---|---|
| Engine | avalanchego + subnet-evm (Snowman) | Cosmos SDK + Cosmos EVM + CometBFT |
| Node/client | `9chaingo` | `love9d` |
| Token | LOVE9 | LOVE9 (`alove9`) |
| Địa chỉ | `X-love91…` / `C-love91…` / `0x…` | `love91…` / `0x…` |
| Đẻ chain | CLI factory (`create-l1`) → L1 subnet-evm | Operator K8s (CR `Chain`) |
| Repo/vận hành | `C:\PROJECTS\9Chain-A1` (A1 build) | `C:\PROJECTS\9Chain` (đã chạy) |

## Bộ tiêu chí chấm điểm (cộng đồng tự đặt trọng số)

Mỗi tiêu chí chấm 1–5; nhân trọng số của cộng đồng; tổng cao hơn thắng. Cột "đo thế nào" để **không chấm cảm tính**.

| # | Tiêu chí | Đo thế nào (endpoint/thí nghiệm) | A1 (Avalanche) | C1 (Cosmos) |
|---|---|---|---|---|
| 1 | **Phi tập trung** (số validator tối đa vẫn nhanh) | tăng validator tới khi finality xuống cấp | Snowman: ~nghìn node | CometBFT: ~100–150 |
| 2 | **Finality** | đo thời gian tx→final | ~1–2s | ~5–6s |
| 3 | **Độ chín EVM** (bug/an toàn) | chạy bộ contract chuẩn (Uniswap, ERC-20/721/1155) | coreth production | Cosmos EVM pre-v1 |
| 4 | **Tương thích ví/DeFi retail** | MetaMask add-network + swap thử | EVM đầy đủ | EVM (có quirk) |
| 5 | **UX "đẻ chain"** | bấm giờ từ lệnh → chain có RPC | `9chain-a1 l1 create` (đo) | operator CR (đo) |
| 6 | **Interop rộng** | nối chuỗi ngoài + chuyển tài sản | Warp/ICM (nội hệ) | IBC (chuẩn, rộng) |
| 7 | **Chi phí vận hành / chain** | RAM/CPU mỗi chain, phức tạp deploy | node + plugin | K8s operator (nặng hơn) |
| 8 | **Bootstrap network-effect** | thanh khoản/user có sẵn cắm vào | đảo riêng, từ 0 (hoặc L1 trên Avax) | IBC cắm kinh tế Cosmos |
| 9 | **Bảo mật kinh tế cho public** | mô hình staking/token | PoS token-secured sẵn | cần thêm token-econ cho public |
| 10 | **Chi phí chuyển đổi (đội)** | thời gian đạt tính năng hiện tại | mới (A1) | đã có nhiều tháng |

> Ô "đo thế nào" là bắt buộc: mỗi lần công bố điểm phải kèm **phép đo có ngày**, không chấm bằng cảm nhận. (Học đúng kỷ luật chống "tick giả" của chính 9Chain.)

## Cách cộng đồng tham gia (khi lên public)

Cả A1 và C1 phơi ra **cùng bộ cổng công khai**:
- **RPC công khai** (add-network vào ví)
- **Explorer** (xem block/tx/địa chỉ)
- **Faucet** (nhận LOVE9 testnet)
- **Ví** (A1: X/P + EVM; C1: love91 + EVM)
- **"Đẻ chain" thử** (A1: CLI/console; C1: console operator)
- **Bảng điểm sống** cập nhật các phép đo #1–#10

Cộng đồng: thử cả hai → chấm theo trọng số của mình → biểu quyết. **Mainnet đi theo bên thắng.**

## Trạng thái build (local trước)

| Hạng mục A1 | Trạng thái |
|---|---|
| Rebrand identity (9chaingo/LOVE9/love9/love9evm) | ✅ |
| Node A1 (networkID 999999998 — thế hệ `g1`, C-Chain chainId 9000000009) | ✅ 9 validator công khai |
| Faucet / Explorer / Ví X/P (rebrand LOVE9) | ✅ code |
| Chain-factory (create-l1, L1 chainId 9100) | ✅ code |
| Deploy-kit đa VPS (đưa public) | ✅ sẵn |
| Bảng điểm sống công khai | ⏳ |

C1 do đội 9Chain vận hành (repo `9Chain`); A1 build ở đây để đối chứng.
