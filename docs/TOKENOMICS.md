# 9Chain-A1 Tokenomics (LOVE9)

> 🔴🔴 **FILE NÀY ĐÃ CŨ TỪ 2026-08-26 — MỤC 1 VÀ MỤC 2 KHÔNG CÒN ĐÚNG VỚI MẠNG ĐANG CHẠY.**
> Nó mô tả thời **720 triệu · 40/20/20/5/15**. Mạng công khai đã re-genesis sang
> **9.000.000.000 LOVE9 · 40/30/12/9/9** (D-039 + D-042).
>
> **Nguồn sự thật, theo thứ tự tin cậy:**
> 1. Binary đang chạy — `docker logs <node> 2>&1 | head -1 | grep -o '"supplyCap":[0-9]*'`
> 2. Mã: [`genesis/genesis_9chain_a1.go`](../upstream/avalanchego/genesis/genesis_9chain_a1.go) ·
>    [`netgen/allocation.go`](../upstream/avalanchego/9chain-a1-tools/netgen/allocation.go)
> 3. Bảng phân bổ mạng công khai: [`docs/ALLOCATION-PUBLIC.md`](ALLOCATION-PUBLIC.md)
> 4. Vì sao: `DECISIONS.md` D-039 (trần) · D-042 (phân bổ) · D-041 (A1 làm chuẩn cho C1)
>
> ⚠️ **Đừng trích số từ file này.** 9Scan-A1 đã tự đặt luật *"explorer tuyệt đối không in
> con số nào từ `TOKENOMICS.md`"* — luật đó **đúng chừng nào banner này còn ở đây**.
> Phần dưới giữ lại làm hồ sơ thiết kế thời 720 triệu, không phải tham số hiện hành.

---

## 0. LOVE9 có MẤY chữ số thập phân? — **9 trên P/X-Chain, 18 trên C-Chain**

> ✅ **Mục này KHÔNG cũ.** Nó là bản chất kiến trúc của Avalanche, không phải tham số
> của lượt re-genesis nào — đúng trước `26/08` và đúng sau. Banner phía trên không áp
> vào đây.

Người đọc tài liệu này thấy **9 chữ số**, rồi mở MetaMask thấy **18**, và kết luận tài
liệu sai. Không phải. **Cả hai đều đúng, ở hai chỗ khác nhau:**

| Chain | Chữ số | Đơn vị nhỏ nhất | Vì sao |
|---|--:|---|---|
| **P-Chain · X-Chain** | **9** | `nLOVE9` (nano) | Số lượng token là `uint64` trong avalanchego. Đây là thang của `SupplyCap`, self-bond, phần thưởng staking |
| **C-Chain** (EVM) | **18** | `wei` | C-Chain là EVM; mọi công cụ EVM — ví, `ethers`, explorer — mặc định 18 chữ số |

**Cùng một đồng LOVE9.** 1 LOVE9 = `1e9` nLOVE9 trên P/X = `1e18` wei trên C. Cầu nối
X↔C của avalanchego tự đổi thang khi tài sản đi qua; không có đồng nào sinh ra hay mất đi.

🔴 **Hệ quả phải nhớ khi đọc số ở bất kỳ đâu:**
- `SupplyCap`, `maxValidatorStake`, `minValidatorStake`, self-bond, `potentialReward`
  → **thang 9**, và trần kiểu dữ liệu là **18,447 tỷ LOVE9** (`uint64` max ÷ `1e9`).
- Số dư ví, `eth_getBalance`, faucet, mọi thứ hiện trên MetaMask và Blockscout
  → **thang 18**.
- 🔴 **`platform.getCurrentSupply` KHÔNG cộng C-Chain** (`genesis/config.go:146`
  `InitialSupply()` chỉ cộng `Allocations`, tức X/P; `CChainGenesis` nằm ngoài vòng lặp).
  Nên đừng so nó với tổng phát hành genesis — **và đừng dừng ở đó**, xem ngay dưới.

### 🔴 `SupplyCap` (7.900.000.001) ≠ tổng cung (9.000.000.000) — có chủ ý

Vì `currentSupply` không đếm C-Chain, **trần cung trong binary phải nhỏ hơn tổng cung công bố
đúng bằng phần phát hành thẳng trên C-Chain**, nếu không staking sẽ mint thừa đúng bằng phần
chênh — mạng vẫn chạy hoàn hảo, chỉ có **lời hứa sai**.

| | LOVE9 |
|---|--:|
| `SupplyCap` — hằng số **biên dịch vào binary**, trần của `currentSupply` (P/X) | **7.900.000.001** |
| + phát hành thẳng C-Chain (Foundation 1.000.000.000 + faucet 99.999.999) | 1.099.999.999 |
| **= TỔNG CUNG (D-039)** | **9.000.000.000** |
| dư địa mint = 7.900.000.001 − genesis X/P 4.300.000.001 | 3.600.000.000 = ô Staking Rewards |

⚠️ **Đừng "dọn dẹp" `SupplyCap` về 9 tỷ cho khớp bảng.** Làm thế là in thêm **1.099.999.999
LOVE9**: trần cung P/X thành 9 tỷ trong khi C-Chain vẫn giữ 1,1 tỷ ngoài sổ ⇒ tổng thật
**10.099.999.999**. Đó là lỗi đã có thật trong mã tới `2026-08-27` — D-048 và
[`CORE-AUDIT-2026-08-27.md`](CORE-AUDIT-2026-08-27.md) §2.

Bất biến, cưỡng chế bằng máy ở `netgen` (`mustFitSupplyCap`) và
`scripts/check-consistency.mjs` (đọc `SupplyCap` **thẳng từ Go**, không chép):

```
SupplyCap + Σ(bucket.CChain) == 9.000.000.000
```

⚠️ **Đây là đúng chỗ một con số chép sang thang khác sẽ đi lọt.** Cùng họ với vụ
`SupplyCap` 90 tỷ đến từ C1 (Cosmos đếm bằng `big.Int` nên 90 tỷ bình thường ở đó,
còn avalanchego đếm bằng `uint64` nên nó **không tồn tại**) — xem `BLOCKERS.md` H-9.
Mọi đại lượng chép từ nơi khác phải hỏi **cả** *"kiểu dữ liệu chứa nổi không"* **lẫn**
*"đang ở thang nào"*.

Khai trong mã: `web/lib/chain.ts` (`thapPhan: 18`, kèm chú thích `networkId` là `uint32`
chứ không phải số 9 tỷ) · `explorer-full/9chain-a1-overrides.frontend.env`
(`NEXT_PUBLIC_NETWORK_CURRENCY_DECIMALS=18`).

---

> Trạng thái: **bản thiết kế + tham số hiện hành**. Con số dưới đây là điểm khởi đầu để chốt trước testnet công khai — sai là khó sửa sau mainnet.

## 1. ~~Tham số ĐANG chạy~~ — ⚠️ **HẾT HẠN**: `A1Params` thời 720 triệu (2026-08-24, mạng 5-node)

> Giá trị **hiện hành** (D-042, ×12,5): supply cap **9.000.000.000** · min validator stake
> **25.000** · max validator stake **625.000.000** · min delegator stake **312,5** ·
> uptime 80% (chưa đổi) · minting period 1 năm (chưa đổi).

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

## 2. ~~Phân bổ genesis~~ — ⚠️ **HẾT HẠN**: bảng thời 720 triệu (codify 2026-08-24)

> Bảng **hiện hành** (D-042): phát hành genesis **5.400.000.000** / trần **9.000.000.000** —
> Staking Rewards 40% (không cấp ở genesis, mint dần) · Community 30% · Foundation 12% ·
> Private Sale 9% · Team 9%. Địa chỉ thật: [`docs/ALLOCATION-PUBLIC.md`](ALLOCATION-PUBLIC.md).

Tổng phát hành genesis: **400,000,000 LOVE9** (trần cung 720,000,000 → còn 320,000,000 để mint dần làm thưởng staking).

Bảng nguồn: [`9chain-a1-tools/netgen/allocation.go`](../upstream/avalanchego/9chain-a1-tools/netgen/allocation.go). Mỗi lần sinh mạng, netgen xuất bảng địa chỉ thật ra `<NET_DIR>/allocation.md`.

> 🔴 **HAI BỘ MẠNG, HAI `allocation.md` KHÁC NHAU — đọc nhầm là ra số của một mạng khác.**
> `local-net/net/` = bộ **dev local** · `local-net/net-public/` = **mạng công khai**.
> Số của mạng công khai **chỉ** nằm ở `net-public/`; bản chép công khai được là
> [`docs/ALLOCATION-PUBLIC.md`](ALLOCATION-PUBLIC.md). Nhầm hai bộ **không gây lỗi, không
> có dấu hiệu nào** — 9Scan-A1 đã dính đúng thế 2026-08-26 và đăng một kết luận sai.

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

### ⚠️ HỒ SƠ CŨ — đã kiểm chứng trên mạng **5-node thời 720 triệu** (2026-08-24)

> 🔴 **Bảng dưới đây nói về một mạng KHÔNG CÒN TỒN TẠI** — mạng công khai đã re-genesis
> 2026-08-26 (9 node, 9 tỷ). Chuỗi cũ và DB Blockscout của nó **đã xoá**, nên các con số
> này **không còn kiểm lại được**, kể cả bởi chính chúng ta.
> Đây chính là bảng đã làm 9Scan-A1 kết luận nhầm *"108 triệu mà tài liệu khai không tồn
> tại trên chain"*: họ đo trên chuỗi mới bằng địa chỉ lấy từ bộ **dev local**.
> Nghiệm thu của **mạng đang chạy** nằm ở `HANDOFF.md` mục 1, không phải ở đây.

| Kiểm tra (mạng 5-node, ĐÃ CHẾT) | Kết quả khi đó |
|---|---|
| Tổng stake genesis | 160,000,000 LOVE9 = 5 × 32,000,000 ✓ |
| Số dư C-Chain từng quỹ | foundation 20M · ecosystem 70M · faucet 18M · staking 0 · team 0 ✓ |
| Tổng C-Chain | 108,000,000 LOVE9 ✓ |
| `maxValidatorStake` node đang chạy | 50,000,000 LOVE9 (A1Params, không phải LocalParams) ✓ |
| Faucet drip thật | 10 LOVE9 từ ví faucet riêng, tx thành công ✓ |

## 4. Việc còn lại trước testnet công khai
- [x] ~~**Chốt supply cap 720,000,000**~~ → **CHỐT 9,000,000,000** (D-039, David duyệt
  2026-08-26; đã chạy thật trên mạng công khai). Trần cứng của kiểu dữ liệu là
  **18,447 tỷ** — `SupplyCap` là `uint64` và LOVE9 có 9 chữ số thập phân.
- [x] ~~**Chốt % phân bổ + lịch vesting**~~ → **CHỐT 40/30/12/9/9** (D-042). Vesting:
  Community 2 năm · Private Sale 2 năm · Team 4 năm · self-bond 1 năm.
  ⚠️ Phần **ký duyệt pháp lý/kinh doanh** thì vẫn chưa có ai ký — bảng này là quyết định
  kỹ thuật đã thi hành, không phải văn bản đã phê duyệt.
- [ ] Nâng uptime yêu cầu 80% → 90% trước mainnet (ACP-267).
- [ ] Hợp đồng vesting trên C-Chain (phần EVM hiện thanh khoản ngay, không khoá được).
- [ ] Mô phỏng lạm phát/áp lực bán qua vài kịch bản staking.
- [ ] Kiểm toán kinh tế độc lập.
