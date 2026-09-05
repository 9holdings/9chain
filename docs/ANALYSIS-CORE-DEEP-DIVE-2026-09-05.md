# Lõi blockchain trước 9 tỷ chain — lượt đào sâu thứ hai

Viết `2026-09-05`, tiếp `ANALYSIS-CORE-TOWARD-9-BILLION-2026-09-05.md`. Lượt trước lập bản đồ năng lực; lượt này đi
vào **cơ chế** của bảy chỗ mà bản đồ chỉ chạm bề mặt, và **sáu kết luận của bản trước phải sửa**. Mọi khẳng định
có đường dẫn:dòng trong `upstream/avalanchego` (HEAD `66e5776`); nhãn **[lõi] [phải xây] [vận hành] [đo]** như cũ.

---

## 0. Sáu điều bản trước nói chưa đủ — sửa ngay ở đây

| # | Bản trước | Mã nói | Hệ quả |
|---|---|---|---|
| 1 | "Trần 20.000 validator thức" | Trên mục tiêu, `Excess` tăng `(Current − Target)` **mỗi giây** không có trần (`fee.go:33–44`), giá `= MinPrice · e^(Excess/K)` (`gas.go:85`). Ở 20.000 giá **gấp đôi mỗi phút**; sau một giờ ×2⁶⁰ | **Trần bền là 10.000**; 20.000 là tường cứng chỉ chạm trong chốc lát. Mọi định cỡ pha A dùng 10⁴ |
| 2 | "Ngủ đông không chiếm chỗ" | Đúng cho Capacity. Nhưng validator ngủ chỉ mất `NodeID` và khoá BLS (`l1_validator.go:175–194`), **trọng số ở lại mẫu số** (`state.go:2686–2714`) | L1 nhiều validator: cứ 1/3 validator cạn phí là **Warp chết** dù chain còn đẻ block; L1 một validator ngủ = chain dừng hẳn |
| 3 | "Neo mỗi giờ bằng Warp" | Xác minh một thông điệp Warp ở chain nhận tốn `VerifyPredicateBase 200.000` + 500/người ký + 3.200/khối 32 byte (`warp/contract.go:31–33`; 125.000/250/512 ở bảng giảm `:52–54`) | 10⁵ sổ neo riêng mỗi giờ = 2×10¹⁰ gas/giờ — **không thể**. Neo phải **gộp** ở máy chủ sổ, một thông điệp Warp mỗi giờ mỗi cộng đồng |
| 4 | "Genesis ≤ 1 MiB" | `writeTXs` lưu **mọi** tx đã chấp nhận (`state.go:3130–3149`) ⇒ `CreateChainTx` mang genesis sống mãi trong `txDB` của **mọi node mạng mẹ**; P-Chain **không có state sync** (`vms/platformvm` không có `StateSyncEnabled`) ⇒ thiết bị partial-sync **chạy lại từ genesis**, kể cả genesis của người khác | Pha A đắt hơn tưởng: 10⁴ sổ × 200 KB = 2 GB trong mọi node và mọi thiết bị. Genesis sổ phải **nhỏ** (bytecode deploy sau), và sổ đại trà đi **pha B sớm** |
| 5 | "Simplex: điện thoại + hộp + máy chủ sổ" | Simplex an toàn khi **ít hơn 1/3** lỗi (`simplex/docs/reconfiguration.md:15`), quorum kiểm ở `qc.go:63,165,217` | `n = 3` chịu **0** lỗi; muốn một thiết bị tắt mà vẫn ký cần **`n = 4`** |
| 6 | "Sổ pha B neo bằng chữ ký chủ" | EVM của subnet-evm dừng ở **Cancun** (`params/config.go:101`), không Prague ⇒ **không có precompile BLS12-381** (EIP-2537), cũng không có P-256 (RIP-7212) | Chữ ký sổ pha B mà chain cộng đồng kiểm rẻ chỉ có **secp256k1** (`ecrecover` 3.000 gas). Passkey (P-256) và BLS phải qua Solidity đắt, hoặc **precompile riêng trong fork subnet-evm** |

---

## 1. Công thức phí, tính tới cùng

`fee.go:33–44` + `gas.go:31–52,85`: mỗi giây, `Excess += (Current − Target)` nếu trên mục tiêu, `−= (Target − Current)`
nếu dưới (không âm). Giá mỗi giây `= MinPrice · exp(Excess / ExcessConversionConstant)`. A1: `MinPrice 1 nLOVE9`,
`K = 865.617`, `Target 10.000`, `Capacity 20.000`.

| Số validator thức | `Excess` tăng/giây | Giá gấp đôi mỗi | Sau 1 giờ giá × | Sau 1 ngày |
|---|---|---|---|---|
| ≤ 10.000 | 0 (hoặc giảm) | — | 1 | 1 — **0,0000864 LOVE9/validator/ngày** |
| 10.100 | 100 | 100 phút | 1,5 | 2¹⁴ ≈ 16.000 |
| 11.000 | 1.000 | 10 phút | 64 | ×2¹⁴⁴ — không ai trả được |
| 20.000 | 10.000 | **1 phút** | 2⁶⁰ | — |

**Đọc:** cơ chế **không cho** mạng sống lâu trên 10.000. Vượt 100 validator thôi là một ngày sau giá gấp 16.000 lần;
validator không nạp thêm sẽ cạn `EndAccumulatedFee` và ngủ, kéo `Current` về mục tiêu. Đây là bộ điều tốc tự động,
và nó có nghĩa **10.000 là con số duy nhất đáng định cỡ**. Muốn 20.000 thức bền phải đổi `Target` — biên dịch vào
binary, tức re-genesis (`genesis_9chain_a1.go:103–108`). [lõi]

---

## 2. Vòng đời một sổ cá nhân, theo từng giao dịch

| Bước | Giao dịch / cơ chế | Điều kiện trong mã | Ai trả | Nhãn |
|---|---|---|---|---|
| **Sinh** | `CreateSubnetTx` → `CreateChainTx` (genesis ≤ 1 MiB) → `ConvertSubnetToL1Tx` (≥ 1 validator, trọng số ≠ 0, `Balance` ban đầu, `ChainID + Address` của hợp đồng quản lý) | `create_chain_tx.go:19–20` · `convert_subnet_to_l1_tx.go:29,60,110` | phí động P-Chain (~0,00023 LOVE9 đo trên A1 [vận hành]) + `Balance` | lõi |
| **Khởi động một mình** | Router đánh dấu **chính node** là đã nối (`chain_router.go:124–131`); ngưỡng khởi động 75 % stake nối (`chains/manager.go:918`) ⇒ validator đơn = 100 % | không cần peer nào để bắt đầu đẻ block | — | lõi |
| **Ký hành động** | Block khi có tx; `MinBlkDelay` mặc định 1 s, "most chains default to 0" (`proposervm/vm.go:51`, `manager.go:1179`) | finality ngay khi chính mình chấp nhận | phí theo `feemanager` (0 được) | lõi |
| **Thức / ngủ** | Mỗi giây trừ giá vào `EndAccumulatedFee`; `= 0` ⇒ `IsActive() = false` ⇒ `effectiveNodeID = Empty`, khoá BLS = nil (`l1_validator.go:164–194`); `DisableL1ValidatorTx` ngủ chủ động | validator ngủ **không đẻ block, không ký Warp**; trọng số vẫn trong mẫu số | — | lõi |
| **Thức lại** | `IncreaseL1ValidatorBalanceTx{ValidationID, Balance}` — **không có auth** (`increase_l1_validator_balance_tx.go:19–25`) | ai cũng nạp được cho ai ⇒ Quỹ/chain cộng đồng tài trợ là native; dư trả về `RemainingBalanceOwner`, không về người nạp | người tài trợ | lõi |
| **Thêm thiết bị** | `RegisterL1ValidatorTx` mang **thông điệp Warp có `Expiry`** từ hợp đồng quản lý + `ProofOfPossession` (`register_l1_validator_tx.go:17–23`, `message/register_l1_validator.go:35–44`) | hợp đồng quản lý phải ở một chain **đang thức và ký được Warp**. Đặt trên chính sổ ⇒ sổ ngủ không thêm được thiết bị. Đặt trên chain cộng đồng ⇒ được | phí P-Chain | lõi ⇒ **quyết định kiến trúc** |
| **Neo** | Sổ ký Warp (`addWarpMessage` 20.000 gas, `contract.go:24`) → bên gom gửi `AppRequest` tới **NodeID validator** (`acp118/aggregator.go:108–132`) → chain cộng đồng xác minh (`PredicateGas`, `warp/config.go:148–184`) | validator phải là **peer đang nối** với bên gom; sau NAT ⇒ bên gom phải là beacon của nó | gas ở chain cộng đồng | lõi + vận hành |
| **Lớn lên** | thêm validator qua Warp, `SetL1ValidatorWeightTx` với `MinNonce` chống phát lại (`l1_validator.go:110–114`) | tên và lịch sử giữ | — | lõi |
| **Chết** | không có: không gỡ được validator cuối (`executor:63`); `Weight = 0` chỉ khi gỡ (`l1_validator.go:160`) | sổ **ngủ mãi**, không xoá — đúng bất biến 6 | — | lõi |

**Chỗ đắt nhất của bảng:** dòng *Thêm thiết bị*. Nơi đặt `Address` của Subnet manager quyết định sổ có tự quản khi
ngủ hay không. Với người thường, hợp đồng quản lý nên ở **chain cộng đồng** (máy chủ sổ luôn thức), còn hiến pháp
(ai được ký) ở **trong sổ**. Hai hợp đồng, hai chain, một chủ.

---

## 3. Ngủ đông nhìn kỹ — điều bản trước bỏ qua

`state.go:2686–2714`: khi validator đổi trạng thái thức↔ngủ, trọng số được **gỡ khỏi `NodeID` thật và gắn vào
`EmptyNodeID`**. Tổng trọng số của subnet **không đổi**.

| L1 | Khi một phần validator ngủ | Hệ quả |
|---|---|---|
| 1 validator (sổ) | ngủ = mẫu rỗng | chain dừng, Warp im; thức lại bằng nạp phí. **Đúng thiết kế sổ** |
| n validator (chain cộng đồng) | trọng số ngủ vẫn nằm trong tổng; quorum Warp 67 % tính trên tổng (`warp/config.go:23`) | ngủ > 33 % trọng số ⇒ **không thông điệp Warp nào qua** dù chain vẫn đẻ block; ngủ > 25 % ⇒ chưa đủ 75 % để node mới khởi động (`manager.go:918`) |

⇒ Chain cộng đồng phải có **cổng đo `EndAccumulatedFee` còn lại của từng validator** và nạp trước khi cạn. Đây là
lỗi lặng: block vẫn chạy, chỉ neo và đăng ký validator mới là hỏng. [vận hành, phải xây cổng]

---

## 4. Neo — gas nói gì

Chain nhận trả `PredicateGas = 200.000 + 500·người ký + 3.200·⌈byte/32⌉` (bảng đầu, `contract.go:31–33`); bảng
giảm 125.000/250/512 (`:52–54`). Với khối 8 M gas mỗi 2 s (mặc định subnet-evm) ⇒ ~4 M gas/giây ⇒ **~20 lượt xác
minh Warp mỗi giây**, ~72.000/giờ — cho **toàn chain**, không phải cho neo.

| Cách neo | Gas/giờ ở chain cộng đồng cho 10⁵ sổ | Khả thi |
|---|---|---|
| Mỗi sổ một thông điệp Warp | 10⁵ × 200.000 = 2×10¹⁰ | **không** (gấp 1.400 lần sức chain) |
| Sổ gửi gốc trạng thái **ký ECDSA** tới máy chủ sổ; máy chủ gộp Merkle; **một** Warp/giờ | 200.000 + 500·n_máychủ | có; kiểm từng sổ = `ecrecover` 3.000 gas khi có tranh chấp |
| Máy chủ sổ là validator của chain cộng đồng, gộp bằng chữ ký BLS của chính nó | như trên, không cần ecrecover | có; nhưng máy chủ sổ **nằm trong tập validator** ⇒ tính vào mục 3 |

⇒ **Máy chủ sổ + hợp đồng gộp neo** không phải "mở rộng sau" như bản trước xếp (mục 4 trong 8). Nó là điều kiện
để bất kỳ sổ nào neo được, từ sổ thứ 100. Thứ tự xây phải đưa nó lên **ngay sau mẫu genesis**.

---

## 5. EVM dừng ở Cancun — chữ ký nào rẻ

`params/config.go:101,176,196,216` đặt `CancunTime = 0`, không có `PragueTime` ⇒ không EIP-2537 (BLS12-381), không
RIP-7212 (P-256). Ba loại khoá của sổ:

| Khoá | Ở đâu trong mô hình | Kiểm trên chain cộng đồng | Giá |
|---|---|---|---|
| secp256k1 (ví EVM) | khoá chủ, khoá agent trong `txallowlist` | `ecrecover` | **3.000 gas** |
| P-256 (passkey / Secure Enclave) | "không có gì để chép" (VISION §5) | Solidity thuần | ~300.000 gas; mỗi lần kiểm là 100 lần `ecrecover` |
| BLS12-381 (`signer.key` của node) | chữ ký Warp của validator | Warp precompile (đã có) | 200.000 + 500/người ký |

⇒ Passkey ký **thẳng** lên chain là đắt. Đường có sẵn: passkey **mở khoá** một khoá secp256k1 phiên (ERC-4337 session
key, ERC-7715) trên thiết bị; chain chỉ thấy secp256k1. Đường mạnh hơn: **thêm stateful precompile P-256 vào fork
subnet-evm** (khung `precompile/contracts/` đã có 7 mẫu) — [phải xây], nhỏ, nhưng là gánh rebase mỗi năm và là hard
fork của mọi sổ. Đề xuất: đường có sẵn trước, precompile khi có 10⁴ sổ thật.

---

## 6. Genesis trên P-Chain — cái giá của pha A

> **Đính chính đo được `05/09` (pha 0, `docs/k1-phase0/EVIDENCE-2026-09-05.md`):** trần thật của một genesis là
> **~256 KiB**, không phải 1 MiB. `txs.Codec = codec.NewDefaultManager()` (`vms/platformvm/txs/codec.go:55`,
> `codec/manager.go:19`) giới hạn **cả giao dịch** ở 256 KiB; genesis 505 KB bị `packer has insufficient length`
> trước khi `MaxGenesisLen` kịp kiểm. Và mỗi KB genesis làm txDB của **mọi** node lớn ~3,2 KB: sổ genesis 199 KB
> = +633 KiB/node, sổ genesis 1,5 KB = +18 KiB/node. Các bảng dưới giữ con số 1 MiB làm trần lý thuyết; định cỡ
> dùng 256 KiB.

- `writeTXs` (`state.go:3130–3149`) lưu byte của **mọi** tx đã chấp nhận; `CreateChainTx.GenesisData` (≤ 1 MiB) nằm
  trong đó. `chainDB` chỉ giữ chainID (`:3271–3276`), nhưng tx thì ở `txDB` **mãi mãi**.
- `vms/platformvm` không có `StateSyncEnabled` ⇒ mọi node (kể cả thiết bị `--partial-sync-primary-network`) **tải và
  chạy lại toàn bộ P-Chain** từ genesis.

| Pha A với | genesis mỗi sổ | Thêm vào P-Chain của **mọi** node và thiết bị |
|---|---|---|
| 10⁴ sổ | 20 KB (chỉ cấu hình + alloc, bytecode deploy sau) | 200 MB |
| 10⁴ sổ | 200 KB (ví thông minh + hiến pháp cài sẵn) | 2 GB |
| 10⁴ sổ | 1 MiB (trần) | 10 GB |

⇒ Hai luật rút ra: **genesis sổ ≤ vài chục KB**, hợp đồng deploy bằng giao dịch đầu tiên của chủ (hoặc `upgrade.json`
cho precompile); và **pha A dành cho chain cộng đồng**, sổ cá nhân đại trà đi **pha B từ đầu** — nơi P-Chain không
biết tới nó. Đây là điểm sửa lớn nhất so với `VISION` §3, vốn để pha A cho "~10⁴ người đầu". [lõi]

---

## 7. Warp không cache cho sổ lạ

`manager.go:196–199`: cache tập validator theo chiều cao **chỉ cho subnet node đang track**; subnet khác nhận
`cache.Empty`. Node của chain cộng đồng track chain cộng đồng, **không track 10⁵ sổ** ⇒ mỗi lần xác minh thông
điệp Warp từ một sổ, node dựng lại tập validator của sổ đó từ diff `(targetHeight, currentHeight]`
(`manager.go:253–297`, `ApplyValidatorWeightDiffs` / `PublicKeyDiffs`). Chi phí ∝ khoảng cách chiều cao × số diff.
Trên A1 P-Chain ít block nên rẻ; trên mạng có 10⁴ L1 đăng ký/đổi trọng số liên tục thì không. Đây là chỗ (c) *"ACP
cam kết Merkle"* thật sự nhắm vào — và cũng là lý do thứ hai để neo **gộp qua máy chủ sổ** (một nguồn Warp, được
track) thay vì 10⁵ nguồn. [lõi]

---

## 8. Hiến pháp bằng vai trò allowlist — bản đồ đúng

`precompile/allowlist/role.go:18–21`: bốn vai `NoRole · Enabled · Admin · Manager`. `Manager` thêm/gỡ `Enabled`
nhưng không chạm `Admin`.

| Precompile | Admin | Manager | Enabled | Câu hiến pháp |
|---|---|---|---|---|
| `txallowlist` | chủ | trợ lý được cấp quyền có hạn | agent được ký | *"AI nào được ký thay tôi, và ai được cấp quyền đó khi tôi vắng"* |
| `deployerallowlist` | chủ | — | — | *"chỉ tôi đổi luật"* |
| `nativeminter` | chủ hoặc tắt | — | — | *"ai in tiền của sổ"* |
| `feemanager` | chủ | — | — | *"phí bao nhiêu"* — 0 cho sổ |
| `warp` | (cấu hình) | — | — | *"sổ nói được với ai"* |

Điều lõi **không** có: hạn mức theo ngày, ngưỡng hỏi lại, hết hạn tự động. Đó là **hợp đồng hiến pháp** ngồi trước
allowlist — allowlist trả lời *ai*, hợp đồng trả lời *bao nhiêu và tới khi nào*. Uptime của validator L1 đọc qua
thông điệp Warp `validator_uptime.go` (`graft/subnet-evm/warp/messages/`) cho Validator Manager thưởng. [lõi]

---

## 9. Thứ tự xây — sửa theo lượt này

| # | Trước | Nay | Vì sao đổi |
|---|---|---|---|
| 1 | Mẫu genesis sổ ≤ 1 MiB | **Mẫu genesis sổ ≤ 50 KB**, hợp đồng deploy bằng tx đầu | §6 |
| 2 | Validator Manager PoA pha A | **Máy chủ sổ + hợp đồng gộp neo** (ECDSA từ sổ, một Warp/giờ) | §4, §7 |
| 3 | Đăng ký đệ quy | **Đăng ký đệ quy trên chain cộng đồng, sổ đại trà đi pha B từ đầu** | §6 |
| 4 | Máy chủ sổ | Validator Manager cho **chain cộng đồng** (không cho sổ), quản lý đặt ở chain cộng đồng | §2 dòng "Thêm thiết bị" |
| 5 | Rào precompile ở console | giữ + **cổng `EndAccumulatedFee` sắp cạn** cho chain cộng đồng | §3 |
| 6 | Simplex t-of-n | Simplex **n = 4** (hoặc chấp nhận 0 lỗi); passkey qua khoá phiên secp256k1 | §0.5, §5 |
| 7 | Relay xuyên mạng | giữ | — |
| 8 | ACP cam kết Merkle | giữ, kích khi sổ thức đồng thời > 10⁴ **hoặc** diff P-Chain làm xác minh Warp chậm (§7) | §1, §7 |

---

## 10. Phép đo mới, rẻ trước

1. **Kích thước `txDB` P-Chain sau 100 `CreateChainTx` 50 KB và 100 lượt 500 KB** trên băng tập — đo đúng cái §6 nói.
2. **Thời gian `GetValidatorSet` cho subnet không track** khi P-Chain cách 10³ và 10⁴ block — đo §7.
3. **`AppRequest` tới thiết bị sau NAT** từ node không phải beacon của nó — kỳ vọng thất bại; đo để viết luật
   "máy chủ sổ là beacon".
4. **Ba validator, một cạn phí**: Warp còn qua không (kỳ vọng còn, 67 %); **hai cạn**: kỳ vọng chết — đối chứng §3.
5. **Gas thật** của `PredicateGas` với 1 và 50 người ký; `ecrecover` so P-256 Solidity trên subnet-evm Cancun.
6. **Simplex 3 và 4 thiết bị, tắt một** — đối chứng §0.5.

---

## 11. Quyết định cần David từ lượt này

1. **Sổ cá nhân đi pha B từ đầu, pha A chỉ cho chain cộng đồng?** (§6). Đây là quyết định lớn nhất; nó đổi thứ tự
   xây và làm P-Chain của gốc "nhàm chán" đúng nghĩa.
2. **Hợp đồng quản lý validator của sổ đặt ở chain cộng đồng** (sổ ngủ vẫn thêm thiết bị được) — chấp nhận phụ
   thuộc máy chủ sổ?
3. **Precompile P-256 trong fork subnet-evm**: làm sớm (UX passkey thẳng) hay đi khoá phiên secp256k1 (không sửa fork)?
4. **Quỹ tài trợ phí validator** qua `IncreaseL1ValidatorBalanceTx` — có, và trần bao nhiêu/sổ/tháng?
5. **`Target 10.000`** giữ cho thế hệ kế hay nâng — biết rằng 20.000 chưa bao giờ là con số bền.

---

## Nguồn

`vms/platformvm/validators/fee/fee.go:24–96` · `vms/components/gas/gas.go:31–52,85` · `vms/platformvm/state/l1_validator.go:110–194` ·
`vms/platformvm/state/state.go:2686–2714,3090–3149,3271–3276` · `vms/platformvm/validators/manager.go:39,165–297` ·
`vms/platformvm/txs/increase_l1_validator_balance_tx.go:14–36` · `vms/platformvm/txs/register_l1_validator_tx.go:17–23` ·
`vms/platformvm/warp/message/register_l1_validator.go:35–44` · `network/p2p/acp118/aggregator.go:108–132` ·
`snow/networking/router/chain_router.go:124–131` · `chains/manager.go:918,1179` · `vms/proposervm/vm.go:51` ·
`graft/subnet-evm/precompile/contracts/warp/contract.go:24,31–33,52–54` · `graft/subnet-evm/precompile/contracts/warp/config.go:23–25,148–184` ·
`graft/subnet-evm/precompile/allowlist/role.go:18–21` · `graft/subnet-evm/warp/messages/validator_uptime.go` ·
`graft/subnet-evm/params/config.go:101,176,196,216` · `simplex/docs/reconfiguration.md:15` · `simplex/qc.go:63,165,217` ·
`genesis/genesis_9chain_a1.go:103–108` · `vms/platformvm/txs/create_chain_tx.go:19–20` · `vms/platformvm/txs/executor/standard_tx_executor.go:63`.
