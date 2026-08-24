# 9Chain-A1 Tokenomics (LOVE9)

> Trạng thái: **bản thiết kế + tham số hiện hành**. Con số dưới đây là điểm khởi đầu để chốt trước testnet công khai — sai là khó sửa sau mainnet.

## 1. Tham số ĐANG chạy — `A1Params` (đã codify 2026-08-24, kiểm chứng trên mạng 5-node)

Mạng 9001 nay dùng **tham số của chính nó**: [`genesis/genesis_9chain_a1.go`](../upstream/avalanchego/genesis/genesis_9chain_a1.go).

| Tham số | Giá trị | So với LocalParams cũ |
|---|---|---|
| Supply cap | 720,000,000 LOVE9 | giữ nguyên ⬅️ *số cần David chốt trước mainnet* |
| Min validator stake | 2,000 LOVE9 | giữ — rào cản thấp để cộng đồng chạy node |
| **Max validator stake** | **50,000,000 LOVE9** | **đổi từ 3,000,000** |
| Min delegator stake | 25 LOVE9 | giữ |
| Min stake duration | 24 giờ | giữ |
| Max stake duration | 365 ngày | giữ |
| Reward (consumption rate) | 10% → 12% | giữ |
| Minting period | 1 năm | giữ |
| Min delegation fee | 2% | giữ |
| Uptime yêu cầu | 80% | giữ ⬅️ *nâng lên 90% trước mainnet* |
| Phí giao dịch cơ bản (P/X) | 0.001 LOVE9 | giữ |

**Vì sao đổi max validator stake:** mỗi node genesis nhận 160,000,000 / 5 = **32,000,000 LOVE9** tiền stake. Trần cũ 3,000,000 khiến validator genesis vượt trần ~10 lần — genesis không kiểm tra nên vẫn chạy, nhưng thành vô lý: không validator cộng đồng nào được phép stake ngang node genesis. Trần 50,000,000 chứa được node genesis mà vẫn chặn tập trung (≈7% supply cap).

**Sửa kèm — lỗ hổng kiến trúc đã vá:** upstream chỉ khoá cứng tham số staking/phí cho Mainnet/Fuji; mọi mạng khác (kể cả 9001) lấy từ **cờ CLI**, mà mặc định các cờ đó lại là `LocalParams`. Hệ quả: (1) `A1Params` sẽ không bao giờ được dùng, và (2) **mỗi node có thể tự đặt supply cap / trần stake khác nhau bằng cờ CLI** — tham số kinh tế phải đồng thuận toàn mạng chứ không tuỳ node. Đã xếp 9001 vào cùng nhóm Mainnet/Fuji trong [`config/config.go`](../upstream/avalanchego/config/config.go) → tham số chốt trong mã, cờ CLI vô hiệu.

## 2. Phân bổ genesis — ĐÃ CODIFY (2026-08-24)

Tổng phát hành genesis: **400,000,000 LOVE9** (trần cung 720,000,000 → còn 320,000,000 để mint dần làm thưởng staking).

Bảng nguồn: [`9chain-a1-tools/netgen/allocation.go`](../upstream/avalanchego/9chain-a1-tools/netgen/allocation.go). Mỗi lần sinh mạng, netgen xuất bảng địa chỉ thật ra `local-net/net/allocation.md`.

| Nhóm | % | LOVE9 | X/P thanh khoản | X/P khoá | Mở khoá | C-Chain |
|---|--:|--:|--:|--:|---|--:|
| Validators/Staking | 40% | 160,000,000 | 0 | 160,000,000 | 1 năm | 0 |
| Foundation/Treasury | 20% | 80,000,000 | 0 | 60,000,000 | 2 năm | 20,000,000 |
| Ecosystem/Community | 20% | 80,000,000 | 10,000,000 | 0 | — | 70,000,000 |
| Faucet (testnet) | 5% | 20,000,000 | 2,000,000 | 0 | — | 18,000,000 |
| Team | 15% | 60,000,000 | 0 | 60,000,000 | 4 năm | 0 |

**Mỗi quỹ có một khoá riêng** (trước đây 1 khoá "treasury" ôm hết → lộ 1 khoá là mất sạch, và faucet buộc phải dùng chung khoá quỹ):
- `keys.txt` — khoá cả 5 quỹ, **giữ offline, không bao giờ lên server**
- `faucet.env` — chỉ khoá faucet, **file duy nhất được phép lên server**
- `allocation.md` — chỉ địa chỉ, công khai được

Quỹ **Staking** không có địa chỉ chi tiêu thường: toàn bộ 160,000,000 được avalanchego chia đều thành stake của N validator genesis. Thưởng staking chảy về quỹ **Foundation**.

Quỹ **Faucet** là ví nóng, tách riêng có chủ đích — lộ khoá chỉ mất 5%, không ảnh hưởng quỹ khác.

⚠️ C-Chain không có cơ chế khoá native → phần C-Chain của mọi quỹ đều thanh khoản ngay. Muốn vesting thật trên EVM phải dùng hợp đồng vesting (việc riêng, chưa làm).

### Reward staking
- Giữ mô hình consumption-rate của Avalanche (10–12%) — đã được kiểm chứng, chống lạm phát nhờ supply cap.
- Có thể hạ supply cap / đổi đường cong để phù hợp định vị 9Chain-A1.

### Phí & đốt
- P/X-Chain: phí cố định nhỏ.
- C-Chain / L1 EVM: EIP-1559 (base fee **đốt**) qua `feeConfig` mỗi L1 → giảm phát khi mạng bận.
- Mỗi L1 tự đặt token gas + `feeManagerConfig` (chủ L1 chỉnh phí runtime) — xem [l1-evm-genesis.json](../9chain-a1-config/l1-evm-genesis.json).

## 3. Trạng thái codify

- [x] **A. Tham số staking/supply** → `genesis/genesis_9chain_a1.go` (`A1Params`) + nhánh `case A1NetworkID` trong `genesis/params.go` + vá `config/config.go` để cờ CLI không ghi đè được.
- [x] **B. Phân bổ genesis** → `9chain-a1-tools/netgen/allocation.go`: 5 quỹ, mỗi quỹ 1 khoá, có `unlockSchedule`.
- [ ] **C. Phí EVM mỗi L1** — chỉnh `feeConfig` trong `l1-evm-genesis.json` (gasLimit, minBaseFee, targetGas…). **Chưa làm.**

### Đã kiểm chứng trên mạng 5-node (2026-08-24)
| Kiểm tra | Kết quả |
|---|---|
| Tổng stake genesis | 160,000,000 LOVE9 = 5 × 32,000,000 ✓ |
| Số dư C-Chain từng quỹ | foundation 20M · ecosystem 70M · faucet 18M · staking 0 · team 0 ✓ |
| Tổng C-Chain | 108,000,000 LOVE9 ✓ |
| `maxValidatorStake` node đang chạy | 50,000,000 LOVE9 (A1Params, không phải LocalParams) ✓ |
| Faucet drip thật | 10 LOVE9 từ ví faucet riêng, tx thành công ✓ |

## 4. Việc còn lại trước testnet công khai
- [ ] **Chốt supply cap 720,000,000** — số quan trọng nhất còn treo. Đổi sau mainnet là không thể.
- [ ] **Chốt % phân bổ + lịch vesting** (pháp lý/kinh doanh) — hiện đang chạy theo bảng đề xuất ở mục 2, chưa có ai ký duyệt.
- [ ] Nâng uptime yêu cầu 80% → 90% trước mainnet (ACP-267).
- [ ] Hợp đồng vesting trên C-Chain (phần EVM hiện thanh khoản ngay, không khoá được).
- [ ] Mô phỏng lạm phát/áp lực bán qua vài kịch bản staking.
- [ ] Kiểm toán kinh tế độc lập.
