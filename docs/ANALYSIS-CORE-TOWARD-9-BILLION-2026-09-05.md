# Lõi blockchain trước tầm nhìn 9 tỷ chain — phân tích chi tiết từ mã

Viết `2026-09-05` theo yêu cầu của David: *"phân tích chi tiết về core blockchain cho tầm nhìn 9 tỷ chain."*
Đọc trực tiếp cây fork `upstream/avalanchego` (`1.14.2`, gốc `1cf1fc3` + **27 patch**, HEAD `66e5776`), không đọc
từ testnet. Mỗi khẳng định gắn nhãn theo luật David chốt `04/09`: **[lõi]** giới hạn hoặc năng lực có trong mã ·
**[phải xây]** chưa có ở đâu · **[vận hành]** hiện trạng A1, dùng định cỡ, không đặt trần · **[đo]** con số ước,
có pha đo để thay. Khung tham chiếu: bốn bậc của `MASTER-9CHAIN-9-YEARS.md` §5.

---

## 0. Câu trả lời ngắn — chín điều

1. **27 patch không đổi một dòng đồng thuận nào.** 26 tệp, +4.152/−10; phần chạm lõi thật chỉ là bảng tham số
   (`genesis_9chain_a1.go`), lịch fork chủ quyền (`upgrade.go`), định danh theo thế hệ (`network_ids.go`,
   `params.go`, `config.go`) và bí danh LOVE9. Còn lại là `netgen` và công cụ. ⇒ Rebase upstream rẻ, và mọi năng lực
   dưới đây là của Avalanche, 9Chain **thừa kế** chứ không tự chế.
2. **Sổ cá nhân một validator là hợp lệ từng chữ trong mã.** `ConvertSubnetToL1Tx` đòi ≥ 1 validator
   (`convert_subnet_to_l1_tx.go:29,60`), trọng số ≠ 0 (`:110`), và executor cấm gỡ validator cuối
   (`standard_tx_executor.go:63`). Snowball chấp nhận `k = 1` (`snowball/parameters.go:93–106`). [lõi]
3. **"Ngủ đông" đã nằm trong lõi.** Validator L1 hết tiền phí ⇒ `EndAccumulatedFee = 0` ⇒ `IsActive() = false`
   (`state/l1_validator.go:164–166`) nhưng **vẫn nằm trong sổ**; `IncreaseL1ValidatorBalanceTx` đánh thức. Và trần
   20.000 đếm **`NumActiveL1Validators`** (`executor:803,1006,1232`) — validator ngủ **không chiếm chỗ**. [lõi]
4. **Trần thật của một P-Chain là 20.000 validator L1 *đang hoạt động*, không phải 20.000 chain.** Phí Target
   10.000 / Capacity 20.000, sàn 1 nLOVE9/s, gấp đôi mỗi phút khi vượt mục tiêu (`genesis_9chain_a1.go:103–108`).
   Pha A (sổ = L1 trên P-Chain, 1 validator) ⇒ ≤ 10⁴ sổ **thức cùng lúc**/mạng ở giá sàn. [lõi]
5. **Warp chỉ nhìn thấy mạng của chính nó.** `GetCanonicalValidatorSetFromSubnetID` đọc
   `pChainState.GetValidatorSet(height, subnetID)` (`warp/validator.go:44–58`) ⇒ liên thông **xuyên mạng vùng** là
   [phải xây] (relay + xác minh nhẹ). Trong một mạng: thông điệp ≤ 24 KiB (`payload/codec.go:17`), quorum mặc định
   67/100, tối thiểu 33 (`warp/config.go:23–25`), có bộ gom chữ ký ACP-118 (`network/p2p/acp118`).
6. **Mỗi chain là một tiến trình plugin riêng.** `rpcchainvm/factory.go:45–60` khởi động `subprocess` cho từng lượt
   `vmFactory.New` (`chains/manager.go:534`). Cộng trần 16 subnet/node (`peer/peer.go:41`, cưỡng chế lúc bắt tay
   `:882`) ⇒ **một thiết bị cá nhân chạy 1–3 chain, không 16**; D-178 đo 53 MiB/plugin [vận hành].
7. **Mạng vùng (bậc 1) là "thêm một thế hệ định danh", không phải công nghệ mới.** `networkID` là `uint32`
   (4,29×10⁹ định danh), bắt tay P2P so **duy nhất** networkID (`peer.go:825`, patch 0018), A1 đã có sơ đồ
   `A1Gen → networkID/tên/dải chainId`. Thiếu **cầu giữa mạng**. [phải xây]
8. **Genesis một chain ≤ 1 MiB, tên ≤ 128 byte** (`create_chain_tx.go:19–20`). Genesis sổ mang ví thông minh +
   hiến pháp + neo + sổ VC phải nằm dưới 1 MiB — chưa ai đo [đo].
9. **Cái lõi không cho, xếp theo thứ tự cần:** hợp đồng hiến pháp · Validator Manager PoA (ACP-99, nằm ngoài cây
   này) · hợp đồng đăng ký đệ quy + nhận neo · máy chủ sổ · relay xuyên mạng · ACP cam kết Merkle tập validator.
   Không mục nào cần sửa đồng thuận Avalanche; mục cuối là ACP.

---

## 1. Cây mã đang nói tới

| Lớp | Có gì | Nghĩa |
|---|---|---|
| `upstream/avalanchego 1.14.2` | ACP-77 (5 loại tx L1), ACP-118, Simplex, Warp, `--partial-sync-primary-network`, proposervm, Snowman, `graft/{coreth,subnet-evm,evm}` | mọi cơ chế đồng thuận và liên thông của bốn bậc |
| 27 patch (`patches/`, tree tái lập được) | `A1Params` (phí, cọc 81, trần cung 7,9 tỷ+1) · `upgrade.A1` (Helicon **chưa lên lịch**, Granite epoch 30 s) · định danh theo `A1Gen` · bí danh LOVE9 · netgen/khắc chữ/công cụ | **quyền**: tham số kinh tế, lịch fork, định danh là của 9Chain; đồng thuận là của upstream |
| Không có trong cây | ICM/Teleporter, Validator Manager (ACP-99), ví thông minh 4337/7702, hợp đồng đăng ký | phải lấy từ `icm-contracts`/cộng đồng hoặc tự viết (Solidity), không phải Go |

---

## 2. Năng lực lõi theo từng bậc — đường dẫn:dòng

### Bậc 3 · Sổ cá nhân (10⁹, nơi tầm nhìn sống)

| Cần | Cơ chế lõi | Ở đâu | Giới hạn số | Nhãn |
|---|---|---|---|---|
| Một người = một chain hợp lệ | `ConvertSubnetToL1Tx` ≥ 1 validator; trọng số ≠ 0; không gỡ validator cuối | `txs/convert_subnet_to_l1_tx.go:29,60,110` · `executor/standard_tx_executor.go:63` | ≥ 1 | lõi |
| Chủ = hợp đồng, ở chain nào cũng được | `ChainID` + `Address` của Subnet manager là hai trường tự do (≤ 4.096 byte) | `convert_subnet_to_l1_tx.go:21,40–42` | — | lõi |
| Đồng thuận với 1 validator | `Verify()` chỉ đòi `k/2 < αP ≤ αC ≤ k` ⇒ `k=1, α=1` qua; tham số đặt **theo subnet** | `snowball/parameters.go:93–106` · `subnets/config.md:61` | k ≥ 1 | lõi |
| Validator = t-of-n thiết bị | Simplex theo subnet: phiếu là chữ ký BLS; tham số `maxNetworkDelay 5 s`, `initialValidators` | `simplex/*` · `snow/consensus/simplex/parameters.go:24–33` · `engine.go:433` | chưa đo trên độ trễ di động | lõi + **đo** |
| Không block rỗng; block ngay khi có tx | proposervm `MinBlkDelay` mặc định **1 s**, "most chains default to 0" | `proposervm/vm.go:51` · `chains/manager.go:1179` | — | lõi |
| Thiết bị chỉ giữ P-Chain + chain mình | `--partial-sync-primary-network` | `config/flags.go:273` | báo unhealthy nếu là validator mạng mẹ | lõi |
| Hiến pháp bằng luật chain | 7 precompile: `txallowlist` `deployerallowlist` `nativeminter` `feemanager` `rewardmanager` `gaspricemanager` `warp`; đổi sau genesis bằng `upgrade.json` | `graft/subnet-evm/precompile/contracts/` | admin là địa chỉ (hợp đồng ví được) | lõi |
| Ví thông minh, uỷ quyền có hạn | EVM đầy đủ (`graft/subnet-evm`) ⇒ ERC-4337/7702/7715 chạy như hợp đồng | — | — | ngoài lõi, có sẵn |
| Genesis sổ | `MaxGenesisLen = 1 MiB`, `MaxNameLen = 128` | `txs/create_chain_tx.go:19–20` | 1 MiB gồm bytecode cài sẵn | lõi + **đo** |
| Chain ngủ khi chủ ngủ | validator hết phí ⇒ inactive, còn trong sổ; `DisableL1ValidatorTx` tắt tay; `IncreaseL1ValidatorBalanceTx` thức | `state/l1_validator.go:116–124,164–166` · `txs/{disable,increase_l1_validator_balance}_l1_validator_tx.go` | — | lõi |
| Mỗi chain một tiến trình | plugin `subprocess` cho từng chain | `rpcchainvm/factory.go:45–60` · `chains/manager.go:534` | 53 MiB/plugin (D-178) | lõi + vận hành |

**Đọc bảng:** với sổ cá nhân, lõi **đã cho toàn bộ phần đồng thuận và luật**. Cái thiếu là hợp đồng và app.

### Bậc 2 · Chain cộng đồng, sổ đăng ký (10⁵–10⁶)

| Cần | Cơ chế lõi | Ở đâu | Giới hạn số | Nhãn |
|---|---|---|---|---|
| L1 có tập validator riêng, không cọc mạng mẹ | ACP-77: phí liên tục thay cọc | `validators/fee/fee.go:16–19,50–96` | sàn **1 nLOVE9/s** = 0,0000864 LOVE9/ngày | lõi |
| Bao nhiêu validator L1 thức cùng lúc | `NumActiveL1Validators() >= Capacity ⇒ errMaxNumActiveValidators` | `executor/standard_tx_executor.go:803,1006,1232` · `genesis_9chain_a1.go:104–105` | **Target 10.000 · Capacity 20.000** toàn mạng; giá ×2 mỗi phút vượt target (`ExcessConversionConstant 865.617`) | lõi (số là của A1) |
| Bản ghi validator trên P-Chain | `L1Validator{SubnetID 32 · NodeID 20 · BLS pubkey 96 · 2 owner · StartTime · Weight · MinNonce · EndAccumulatedFee}` | `state/l1_validator.go:81–125` | ~250–300 B/bản ghi ⇒ 20 k ≈ 6 MB; 10⁶ ≈ 300 MB | lõi |
| Vì sao trần không phải đĩa | Warp cần **tập validator của subnet nguồn tại một chiều cao P-Chain**; manager dựng lại bằng diff theo chiều cao, cache 64 chiều cao/subnet | `validators/manager.go:39,170–186,278–289` | mỗi node mạng mẹ phải trả lời được câu này cho **mọi** L1 | lõi |
| Nhận neo từ 10⁵ sổ | Warp + ACP-118 gom chữ ký; hợp đồng đăng ký + nhận neo | `network/p2p/acp118/` · **hợp đồng chưa có** | thông điệp ≤ 24 KiB | lõi + phải xây |
| Chủ chain cộng đồng quản trị | Validator Manager (ACP-99) là **hợp đồng Solidity ngoài cây** | — | — | phải lấy |

### Bậc 1 · Mạng vùng (10³)

| Cần | Cơ chế lõi | Ở đâu | Nhãn |
|---|---|---|---|
| Một mạng avalanchego trọn vẹn, P-Chain riêng ⇒ thêm 20.000 chỗ | `networkID uint32`; bắt tay so networkID; A1 đã có `A1Gen → ID/tên/dải chainId` | `utils/constants/network_ids.go:255` · `peer.go:825` · patch 0018 | lõi + vận hành |
| Cầu giữa hai mạng | Warp **không** thấy validator mạng khác (§2 bậc 2) ⇒ relay + xác minh tập validator mạng kia (chữ ký BLS + cam kết) | `warp/validator.go:44–58` | **phải xây** |
| Tên đệ quy xuyên mạng | không có sổ tên trong lõi | — | phải xây |

### Bậc 0 · Gốc

| Cần | Cơ chế lõi | Ở đâu | Nhãn |
|---|---|---|---|
| Quyền với lịch fork | `upgrade.A1` tách khỏi `Default`; Helicon `Unscheduled`; bẫy trường mới = "năm 1" sau rebase | `upgrade/upgrade.go:88–133` | lõi (fork) |
| Mạng gốc nhỏ, bền | 9 node; `MaxStakeDuration 365`; validator sáng lập hết hạn `07–09/2027`; `UptimeRequirement .8`; cọc 81 | `genesis_9chain_a1.go:111–148` | vận hành ⇒ mốc cứng |
| Mỗi node track ≤ 16 subnet | `maxNumTrackedSubnets = 16`, vượt ⇒ `StartClose()` | `network/peer/peer.go:41,882` | lõi |

---

## 3. Ba con số chi phối — và phép tính

| # | Con số | Phép tính | Hệ quả cho bốn bậc |
|---|---|---|---|
| 1 | **16 subnet / node** [lõi] | `Σ(validator mỗi L1) ≤ 16 × N_node` cho **những node phải track** | Sau ACP-77, node mạng mẹ **không** track L1 của người khác; trần 16 chỉ áp lên thiết bị của chủ (1–3 chain) và cụm DVT của chain cộng đồng (≤ 16 chain/cụm). Kế hoạch 108 L1 (`PLAN-108`) đụng trần này vì console vẫn track-all [vận hành] |
| 2 | **10.000 / 20.000 validator hoạt động / P-Chain** [lõi] | pha A: 1 validator/sổ ⇒ ≤ 10⁴ sổ thức ở giá sàn; ngủ **không tính** | Vượt ⇒ đệ quy (§4). Phí ở sàn: 10.000 validator × 0,0000864 = **0,864 LOVE9/ngày** — Foundation 1,07 tỷ trả được hàng thế kỷ |
| 3 | **Thông lượng P-Chain** [lõi + đo] | `MaxPerSecond 100.000 gas/s`, `Target 50.000`, `Bandwidth 1/byte`, `DBWrite 1.000/lượt` (`genesis:88–100`); một `RegisterL1ValidatorTx` ≈ 600 B + ~5 ghi ≈ 5.600 gas | ≈ **9 tx/s bền, ~18 đỉnh** ⇒ đăng ký 10⁴ sổ ≈ 20 phút. Không phải nút thắt; phải đo trên băng tập |

Kèm hai con số nhỏ nhưng thật: **1 MiB genesis** (hiến pháp + ví + neo + sổ VC phải gói vừa) và **24 KiB thông điệp
Warp** (một lượt neo gộp Merkle 10⁵ sổ = một gốc 32 byte, dư nhiều).

---

## 4. Ba đường vượt 20.000 — đọc lại từ mã

| Đường | Cái mã đã cho | Cái phải xây | Rủi ro | Khi nào cần |
|---|---|---|---|---|
| **(a) Đệ quy bằng hợp đồng** trên chain cộng đồng | EVM đầy đủ; Warp trong mạng; ngủ đông không tính trần | hợp đồng đăng ký + nhận neo; sổ cá nhân pha B **không có trên P-Chain** ⇒ Warp không xác minh được nó, neo bằng **chữ ký chủ đã đăng ký** | hợp đồng, không phải giao thức | **nay** — mọi sổ từ 10⁴ trở đi |
| **(b) Mạng vùng** | `uint32 networkID`, `A1Gen`, HRP theo mạng, fork chủ quyền | cầu Warp-qua-relay; sổ đăng ký mạng vùng trên gốc | vận hành ≥ 5–20 node thật mỗi vùng; cầu là bề mặt tấn công | 2030 (MASTER) |
| **(c) ACP cam kết Merkle tập validator** | `L1Validator` lưu phẳng; manager dựng tập theo diff + cache 64 | mỗi L1 chỉ giữ **gốc cam kết**; validator mang bằng chứng Merkle trong chữ ký Warp; Firewood cho trạng thái | **ACP thật**, đổi đường xác minh Warp; cần băng tập + kiểm toán | chỉ khi số sổ **thức đồng thời**/mạng vượt 10⁴ — đo trước, vì ngủ đông đã giảm áp |

Điểm mới so với `PROJECTION` §2a: vì trần đếm validator **hoạt động**, câu hỏi định cỡ đúng là *"bao nhiêu sổ thức
cùng giờ trên một mạng"*, không phải *"bao nhiêu sổ tồn tại"*. Với 100 hành động agent/ngày/người, một sổ thức vài
phút mỗi giờ; nếu chủ tắt validator giữa các lượt (fee = 0 khi inactive) thì (c) có thể lùi nhiều năm. **Đây là phép
đo rẻ nhất và quyết định nhất của dòng B.** [đo]

---

## 5. Cái lõi không cho — thứ tự xây (dòng B, khớp MASTER §4)

| # | Phải xây | Trên nền lõi nào | Điều kiện qua |
|---|---|---|---|
| 1 | **Mẫu genesis sổ ≤ 1 MiB**: 7 precompile cấu hình + ví thông minh + hợp đồng hiến pháp + neo + sổ VC | subnet-evm, `MaxGenesisLen` | `CreateChainTx` chấp nhận; một agent bị `txallowlist` từ chối đúng một lần |
| 2 | **Validator Manager PoA** (ACP-99) cho sổ 1 validator = thiết bị chủ | `ConvertSubnetToL1Tx.Address` trỏ hợp đồng | chain một người sống với 0 node 9Chain; phí đọc được trên P-Chain |
| 3 | **Hợp đồng đăng ký đệ quy + nhận neo** trên chain cộng đồng | Warp, ACP-118 | 100 sổ dưới một chain cộng đồng; P-Chain không đổi |
| 4 | **Máy chủ sổ** (mẫu PDS): nhận neo, gộp Merkle, giữ bản mã hoá | ngoài lõi | sửa lịch sử sổ ⇒ neo lệch ⇒ phát hiện từ ngoài |
| 5 | **Rào tổ hợp precompile ở console** (`minBaseFee 0`, allowlist không chủ) | mốc `L1-CUSTOM` đã có `/api/preview` | tổ hợp chết chain bị từ chối trước `CreateChainTx` |
| 6 | **Simplex t-of-n thiết bị** | `simplex/`, BLS12-381 cùng đường cong `signer.key` | tắt một thiết bị, sổ vẫn ký; đo ở độ trễ 3G |
| 7 | **Relay xuyên mạng + xác minh nhẹ** | Warp + cam kết tập validator | sổ ở mạng vùng A chứng minh được cho chain ở mạng B |
| 8 | **ACP cam kết Merkle** (chỉ khi §4c kích) | `state/l1_validator.go`, `validators/manager.go`, đường xác minh Warp | băng tập 10⁶ L1 giả; kiểm toán |

Không mục nào từ 1–7 sửa `avalanchego`. Mục 8 là ACP, làm trước ở fork chủ quyền rồi đề xuất upstream.

---

## 6. Rủi ro đọc được trong mã

| Rủi ro | Ở đâu | Dấu hiệu | Chặn |
|---|---|---|---|
| **Một tiến trình plugin mỗi chain** trên thiết bị yếu | `rpcchainvm/factory.go` | 53 MiB × số chain; ARM64 chưa đo | sổ cá nhân = 1 chain/thiết bị; máy chủ sổ hộ khi vắng |
| **Rebase làm trường `upgrade.A1` mới = năm 1** ⇒ fork kích hoạt lặng | `upgrade.go:108–111` | `Config` mọc trường sau rebase | cổng so bảng `A1` với `Default` bằng mã, không bằng mắt |
| **Simplex chưa đo** ngoài phòng thí nghiệm | `simplex/` | chain tập đứng khi độ trễ > 5 s (`maxNetworkDelay`) | Snowman `k=1` là mặc định; Simplex là nâng cấp |
| **Warp cache 64 chiều cao/subnet** | `validators/manager.go:39` | mạng mẹ trả lời chậm khi 10⁴ subnet hỏi lệch chiều cao | đo trên băng tập trước (c) |
| **Hằng số biên dịch** (`MinValidatorStake 81`, phí, trần cung) | `genesis_9chain_a1.go` | mainnet cần bảng khác ⇒ **re-genesis** | bảng tham số mainnet tách riêng từ mùa 2 |
| **Validator sáng lập hết hạn `07–09/2027`** | `MaxStakeDuration 365` [vận hành] | `06/2027` chưa diễn tập tái cọc | B-12, mốc cứng của MASTER |
| **Genesis 1 MiB** với bytecode cài sẵn | `create_chain_tx.go:20` | ví + hiến pháp + neo + VC vượt | đo kích thước từ tuần đầu của dòng A |

---

## 7. Phép đo phải làm trước khi viết thêm mã (rẻ → đắt)

1. **Bao nhiêu sổ thức cùng giờ** với 100 hành động/ngày và validator tắt giữa các lượt — quyết định §4c có cần
   trước 2029 không. Mô phỏng bằng dữ liệu, không cần mạng.
2. **Kích thước genesis sổ**: dựng mẫu (4337 EntryPoint + ví + hiến pháp tối giản + neo + VC) và đo byte so với 1 MiB.
3. **Validator inactive có tính vào Capacity không** — đối chứng ngược trên băng tập: đăng ký 20.000 rồi để 10.000
   cạn phí, thử đăng ký thêm.
4. **Simplex 3 thiết bị** (điện thoại cũ + hộp + máy chủ sổ) ở độ trễ 3G/4G thật.
5. **RAM plugin trên ARM64** cho 1 và 3 chain.
6. **P-Chain với 10⁴ L1 giả** trên băng tập `A1IDTap`: thời gian trả lời `GetValidatorSet` lệch chiều cao, RAM
   manager, đĩa.

---

## 8. Quyết định cần David

1. **Giữ Target 10.000 / Capacity 20.000** cho thế hệ kế (mainnet), hay đặt theo số sổ thức dự kiến? Số này biên dịch
   vào binary, đổi là re-genesis.
2. **Snowman `k=1` hay Simplex làm mặc định cho sổ cá nhân** — đề xuất Snowman mặc định, Simplex sau khi đo (mục 7.4).
3. **Helicon**: `upgrade.A1` để `Unscheduled`; khi upstream lên lịch, 9Chain quyết theo `DECISIONS` hay theo họ?
4. **Bảng tham số mainnet** tách khỏi `A1Params` từ mùa nào — vì mọi hằng số kinh tế đang là hằng biên dịch của testnet.
5. **Tác giả ACP** cam kết tập validator: bắt đầu đặc tả năm 2027 (MASTER dòng C) hay chờ kết quả đo 7.1?

---

## Nguồn

`upstream/avalanchego` HEAD `66e5776` (gốc `1cf1fc3`, 27 patch, `git diff --shortstat` 26 tệp +4.152/−10):
`vms/platformvm/txs/convert_subnet_to_l1_tx.go:21,29,40–42,60,110` · `vms/platformvm/txs/executor/standard_tx_executor.go:54,63,803,1006,1232` ·
`vms/platformvm/state/l1_validator.go:81–125,164–166` · `vms/platformvm/validators/fee/fee.go:16–19,50–96` ·
`vms/platformvm/validators/manager.go:39,170–186,278–289` · `vms/platformvm/warp/validator.go:44–58` ·
`vms/platformvm/warp/payload/codec.go:17` · `graft/subnet-evm/precompile/contracts/warp/config.go:23–25` ·
`graft/subnet-evm/precompile/contracts/` · `snow/consensus/snowball/parameters.go:93–106` ·
`snow/consensus/simplex/parameters.go:24–33` · `snow/engine/common/engine.go:433` · `subnets/config.md:61–77` ·
`vms/proposervm/vm.go:51` · `chains/manager.go:534,1179` · `vms/rpcchainvm/factory.go:45–60` ·
`config/flags.go:273` · `config/keys.go:149–150,160` · `network/peer/peer.go:41,825,882` ·
`network/p2p/acp118/` · `vms/platformvm/txs/create_chain_tx.go:19–20` · `utils/constants/network_ids.go:255` ·
`genesis/genesis_9chain_a1.go:78–148` · `upgrade/upgrade.go:88–133` · patch `0013` `0018` `0024` `0027`.
Đối chiếu: `MASTER-9CHAIN-9-YEARS.md` §2 §4 §5 · `VISION-PERSONAL-L1-REAL-LIFE.md` §2 §6 · `PROJECTION-BILLIONS-OF-L1.md` §2 ·
`PLAN-108-L1-LOAD-TEST.md` §1 §4 · D-174 · D-178.
