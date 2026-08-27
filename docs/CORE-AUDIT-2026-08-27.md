# SOÁT CORE BLOCKCHAIN — 9Chain-A1, `2026-08-27`

> **Phạm vi:** fork `avalanchego` v1.14.2 trong `upstream/avalanchego/`, bộ công cụ chủ
> quyền `9chain-a1-tools/`, và 12 patch tái lập. **Không** soát lớp web, console, faucet.
>
> **Kết quả:** 1 lỗi P0 (sai con số sẽ khắc vào genesis ngày G), 3 lỗi P1, 3 lệch chuẩn P2.
> Tất cả đã vá trong **patch 0013**, trừ bốn mục cần David quyết (§7).
>
> Bản soát trước — [`BRAND-AUDIT-2026-08-27.md`](BRAND-AUDIT-2026-08-27.md) — soát **lớp da**.
> Bản này soát **lớp xương**.

---

## 1. Bề mặt chủ quyền thật sự — đo, không ước

Liệt kê mọi tệp `avalanchego` mà 12 patch chạm tới:

| Tệp core bị sửa | Sửa gì |
|---|---|
| `genesis/genesis_9chain_a1.go` (mới) | `A1Params` — staking, phí, `SupplyCap` |
| `genesis/params.go` | 2 `case A1NetworkID` định tuyến sang `A1Params` |
| `config/config.go` | xếp 9001 cùng nhóm Mainnet/Fuji ⇒ cờ CLI không đè được tham số kinh tế |
| `genesis/genesis.go` | `Name`/`Symbol` → `LOVE9 Coin` / `LOVE9` |
| `utils/constants/network_ids.go` | `FallbackHRP` → `love9` |
| `version/constants.go` | `Client` → `9chaingo` |

**Hết.** Chín patch còn lại nằm trong `9chain-a1-tools/` — công cụ mới, không chạm core.
Consensus, VM, mạng, `reward/calculator.go`, `proposal_tx_executor.go`: **vanilla**.

Kiến trúc này đúng — lớp chủ quyền mỏng thì rebase rẻ. Vấn đề là nó **mỏng chưa đều**, và
ba chỗ mỏng nhất rơi đúng vào thứ ngày G sẽ đóng băng vĩnh viễn.

---

## 2. 🔴 P0 — TRẦN CUNG THẬT LÀ **10.099.999.999**, KHÔNG PHẢI 9 TỶ

### 2.1 Cơ chế

`genesis/config.go:146`:

```go
func (c *Config) InitialSupply() (uint64, error) {
	initialSupply := uint64(0)
	for _, allocation := range c.Allocations {
		newInitialSupply, err := math.Add(initialSupply, allocation.InitialAmount)
		for _, unlock := range allocation.UnlockSchedule {
			newInitialSupply, err = math.Add(newInitialSupply, unlock.Amount)
		}
		initialSupply = newInitialSupply
	}
	return initialSupply, nil
}
```

Hàm này cộng **duy nhất** `Allocations`, tức X/P. `CChainGenesis` là một trường **string
riêng** của `UnparsedConfig`, nằm ngoài vòng lặp. ⇒ token phát hành thẳng trên C-Chain
**tồn tại thật nhưng `currentSupply` của P-Chain không bao giờ đếm tới**.

Bảng phân bổ của A1 đặt **1.099.999.999 LOVE9** thẳng lên C-Chain
(`netgen/allocation.go`): Foundation `CChain: 1_000 * mega` + faucet `CChain: 99_999_999`.

### 2.2 Số học

| | LOVE9 |
|---|--:|
| `InitialSupply()` = X/P | **4.300.000.001** |
| C-Chain genesis — tồn tại, **ngoài sổ** | **1.099.999.999** |
| tổng phát hành genesis | 5.400.000.000 ✓ D-042 |
| `SupplyCap` cũ (biên dịch vào binary) | 9.000.000.000 |
| ⇒ dư địa mint = 9.000.000.000 − 4.300.000.001 | **4.699.999.999** |
| D-042 định mint (ô Staking Rewards 40%) | 3.600.000.000 |
| **thừa** | **1.099.999.999** — *đúng bằng phần C-Chain* |

`reward/calculator.go` mint tiệm cận `supplyCap`, nên P/X sẽ tiến tới 9.000.000.000. Cộng
1.099.999.999 trên C-Chain chưa bao giờ được đếm:

> **Tổng LOVE9 có thể tồn tại = 10.099.999.999** — vượt lời hứa "9 tỷ tuyệt đối" **12,2%**.

### 2.3 Ba đường xác nhận độc lập

1. **Đọc mã** — `InitialSupply()` như trên.
2. **Đo thật của chính dự án** — `HANDOFF.md:236` ghi `platform.getCurrentSupply` =
   **4.301.076.227** = 4.300.000.001 + 1.076.226 thưởng dự kiến. Phần C-Chain **vắng mặt**,
   đúng như mã dự đoán.
3. **Đối chiếu upstream** — Mainnet **và** Fuji đều có **đúng một** mục `balance` trong
   `cChainGenesis`, giá trị **`0x0`** (stub precompile ở `0x0100…00`, chỉ có `code`). Upstream
   **không phát hành một AVAX nào ở C-Chain genesis**; mọi AVAX vào qua X/P, nên bất biến
   *"currentSupply = toàn bộ token đang tồn tại"* luôn đúng với họ.

⇒ **A1 phá bất biến đó, ở đúng chỗ upstream không có tầng nào canh.** Không phải lỗi của
avalanchego — là hệ quả của một khác biệt A1 tự đưa vào.

### 2.4 Quan sát đã ghi ba lần, kết luận chưa ai rút

`HANDOFF.md:240` · `HANDOFF.md:932` · [`TOKENOMICS.md`](TOKENOMICS.md) đều ghi *"`InitialSupply()`
chỉ cộng X/P"* — và cả ba dừng ở **"đừng so hai số đó với nhau"**, không đi tiếp tới **"vậy
dư địa mint đang thừa 1,1 tỷ"**. Sự thật nằm trên bàn từ `26/08`.

Bài học chung hơn: **một chú thích giải thích tại sao hai con số khác nhau, mà không nói con
số nào mới đúng, là một chú thích chưa hoàn thành.**

### 2.5 Sửa

```go
SupplyCap: 7_900_000_001 * units.Avax,   // thay cho 9_000 * units.MegaAvax
```

| | LOVE9 |
|---|--:|
| trần P/X | 7.900.000.001 |
| + C-Chain | 1.099.999.999 |
| **= tổng cung** | **9.000.000.000** ✓ D-039 |
| dư địa mint = 7.900.000.001 − 4.300.000.001 | **3.600.000.000** ✓ = ô Staking Rewards |

Con số sửa rơi trúng ý định gốc của D-042 **tới từng đơn vị** — đó là bằng chứng mạnh nhất
rằng chẩn đoán đúng chứ không phải chỉ là một cách vá cho khớp.

**Bất biến mới, nay được cưỡng chế ở hai nơi:**

```
SupplyCap + Σ(bucket.CChain) == 9.000.000.000
```

---

## 3. 🔴 P1 — CỔNG CHỐNG TRÀN TỰ VÔ HIỆU Ở ĐÚNG NƠI NÓ CẦN NHẤT

`netgen/allocation.go` (bản cũ):

```go
func supplyCap() uint64 { return genesis.A1Params.RewardConfig.SupplyCap }
```

Đọc **thẳng `A1Params`**, bỏ qua `networkID`. Nhưng `netgen/main.go` nhận
`networkID := uint32(atoi(env("NETWORK_ID", "9001"), 9001))` — **tham số env**.

| `NETWORK_ID=9002` | |
|---|---|
| `mustFitSupplyCap()` đối chiếu với | `A1Params.SupplyCap` = **9e9** ⇒ **qua** |
| node thật gọi `GetStakingConfig(9002)` | nhánh `default:` → `LocalParams.SupplyCap` = **720.000.000** (`genesis_local.go:85`) |
| `reward/calculator.go:56` | `7,2e17 − 4,3e18` ⇒ **tràn ngược `uint64`** |

Đây **chính xác** là thảm hoạ mà `mustFitSupplyCap` được viết ra để chặn — và nó **không
kiểm cái đầu vào duy nhất quyết định trần nào được áp**.

**Sửa:** đọc qua `genesis.GetStakingConfig(networkID)` — cùng hàm node sẽ gọi — **và**
netgen từ chối thẳng mọi `NETWORK_ID != 9001`, kèm câu giải thích tại sao.

---

## 4. 🔴 P1 — A1 KHÔNG SỞ HỮU LỊCH NÂNG CẤP

`upgrade/upgrade.go:204` — `GetConfig` chỉ tách `MainnetID` và `FujiID`; **9001 rơi vào
`Default`**, tức vào bảng của Ava Labs.

Lịch kích hoạt hard fork là consensus-critical **ngang `SupplyCap`**. Patch 0002 đã dùng
đúng lập luận này để tách `config.go` khỏi cờ CLI (*"tham số kinh tế phải đồng thuận toàn
mạng, không phải tuỳ node"*) rồi **dừng lại trước `upgrade.go`**.

Hôm nay vô hại: `Default` bật mọi thứ từ `InitiallyActiveTime` (2020-12-05), khớp với thực
tế đo được (Warp, ACP-77/Etna, Granite đều sống). Chỗ hỏng nằm ở tương lai:

- `upgrade.go:85` — `HeliconTime: UnscheduledActivationTime` (năm 9999).
- Khi Ava Labs lên lịch Helicon, họ sửa `Default`.
- Lượt rebase kế tiếp của A1 **nuốt trọn một hard fork mà không qua quyết định nào** —
  không DECISIONS, không ai duyệt, không một dòng log khác thường.

Và `A1Params` đã khai sẵn `HeliconMinStakeDuration: 1 * time.Hour` — tham số cho một upgrade
mà cấu hình hiện tại **không bao giờ bật**.

**Sửa:** thêm `upgrade.A1` (chép **tường minh** từ `Default`, **giá trị y hệt**) và
`case constants.A1ID` trong `GetConfig`. Đây là một lượt đổi **quyền**, không đổi **hành vi**.

⚠️ **Cạm bẫy sau mỗi lượt rebase:** nếu `upgrade.Config` mọc thêm trường, Go **không báo
lỗi** — trường thiếu nhận giá trị zero, mà `time.Time{}` zero là **năm 1**, tức *"đã kích
hoạt từ lâu"*. Phải đối chiếu `A1` với `Default` bằng mắt sau mỗi lượt rebase.

### 4b. 🔴 `A1Name` ĐỔI ĐƯỜNG DẪN DB — ĐỌC TRƯỚC KHI DEPLOY

Cùng patch này khai `constants.A1Name = "9chain-a1"` để `info.getNetworkName` thôi trả về
`"network-9001"`. **Hệ quả không hiển nhiên:** `config/config.go:1008`

```go
Path: filepath.Join(getExpandedArg(v, DBPathKey), constants.NetworkName(networkID)),
```

Đường dẫn DB **chứa tên mạng**. Trước patch: `<db-dir>/network-9001/`. Sau patch:
`<db-dir>/9chain-a1/` — **thư mục rỗng**.

| Kịch bản | Hậu quả |
|---|---|
| Deploy cùng một lượt sinh lại mạng (`down -v`) — **ngày G** | ✅ vô hại, volume bị xoá sạch dù sao |
| Deploy lên mạng **đang chạy**, không wipe | 🔴 cả 9 node cùng lúc thấy DB trống và bootstrap lại từ đầu. Dữ liệu cũ **vẫn còn trên đĩa** ở thư mục cũ, nhưng mạng đứng cho tới khi có người đổi tên thư mục về |

⇒ **Binary mang patch 0013 CHỈ được lên cùng lượt re-genesis ngày G.** Cảnh báo đã dán tại
chỗ trong `network_ids.go`. Nếu David muốn bỏ vế này để gỡ hẳn rủi ro, xoá đúng một dòng
`A1ID: A1Name` trong `NetworkIDToNetworkName` — phần HRP và `A1ID` không liên quan.

---

## 5. 🟠 P1 — HRP SỐNG BẰNG FALLBACK, VÀ MẠNG KHÔNG CÓ TÊN

`utils/constants/network_ids.go` — **9001 không có trong `NetworkIDToHRP`**. `GetHRP(9001)`
rơi xuống `FallbackHRP = "love9"` (do `rebrand.sh` đặt).

Chạy đúng — nhưng đúng theo **cùng cơ chế đã làm hỏng `--font-sans`**: một giá trị chịu lực
nằm ở ô dự phòng. Hệ quả:

- Một lượt rebase mà `rebrand.sh` sót ⇒ `FallbackHRP` về `"custom"` của upstream ⇒ **mọi
  địa chỉ P/X đổi tiền tố**, mọi tài liệu và ví đã phát ra ngoài sai hết. **Không cổng nào bắt.**
- Mọi networkID lạ khác cũng nhận HRP `love9`.

Và `NetworkIDToNetworkName` cũng thiếu 9001 ⇒ `NetworkName(9001)` = **`"network-9001"`**. Sau
cả một đợt chuẩn hoá thương hiệu ở lớp web, **lớp giao thức vẫn tự giới thiệu là
`network-9001`** — đó là chuỗi `info.getNetworkName` trả ra, thứ 9Scan-A1 và ví đọc.

**Sửa:** khai tường minh `A1ID` / `A1Name` / `A1HRP` và đưa cả ba vào map. `FallbackHRP` giữ
nguyên `"love9"` — nay chỉ là dây bảo hiểm thứ hai, không còn chịu lực. Thêm
`A1Name → A1ID` cho phép `--network-id=9chain-a1` thay vì chỉ số trần.

---

## 6. 🟠 P2 — BA CỔNG KHẮC CHỮ LỆCH CHÍNH CHUẨN CỦA NÓ

`netgen/engrave.go` viết tốt: ba luật cứng, đọc byte thô không chuẩn hoá, không giữ hash chép
tay, `DisallowUnknownFields`, cổng vân tay `A1_ENGRAVE_CONFIRM`. Ba chỗ hụt:

### 6.1 `verifyAgainstC1` chỉ hỏi "hash có nằm đâu đó trong tệp không"

```go
if !strings.Contains(body, d.sum) { missing = append(...) }
```

Chứng minh được *"byte thuộc bộ của C1"*, **không** chứng minh *"đúng tài liệu nào"*. Một
manifest trỏ `id: doc-hebrew` sang **tệp tiếng Anh** vẫn qua sạch, vì cả hai hash đều có
trong `CHECKSUMS-FREEZE`. Với một cổng mà toàn bộ giá trị là **đối ứng byte theo từng tài
liệu**, đó là lỗ đúng chỗ.

**Sửa:** dòng mang hash phải mang **kèm** tên tệp hoặc `id` của chính tài liệu đó. Chấp nhận
cả định dạng `sha256sum` (`<hash>  <tên tệp>`) lẫn bảng markdown. Ca "hash có nhưng gắn nhầm"
nay có thông báo **riêng**, nói thẳng là manifest gán nhầm chứ không phải byte sai.

### 6.2 Thiếu `A1_ENGRAVE_CHECKSUMS` chỉ **cảnh báo** rồi khắc tiếp

Bất đối xứng ở đúng chỗ đắt nhất: cổng chống **lỗi của chính mình**
(`A1_ENGRAVE_CONFIRM`) thì **cứng**; cổng chống **lệch với C1** — thứ không sửa được sau, và
là vật chứng đồng nhất mạnh nhất dự án đang có — thì **mềm**. Chú thích cũ tự dặn *"đừng bỏ
qua ở lượt THẬT"*; **một lời dặn không phải một cổng**.

**Sửa:** CHẶN. Lượt tập khai `A1_ENGRAVE_NO_CHECKSUMS=toi-biet-day-la-ban-tap` — cố ý là một
câu dài, không phải `1`/`true`, để nó đọc được trong lịch sử shell và log CI. *Một cờ mà gõ
nhầm cũng bật được là một cờ sẽ bị bật nhầm.*

### 6.3 Không có cổng nào canh mặt `p`

```go
cDocs := filterSurface(docs, surfaceC)
if len(cDocs) == 0 { engraveFatal(...) }      // có
e.PMessage = canonicalBundle(docs, surfaceP)  // không kiểm gì
```

Không tài liệu nào khai `"p"` ⇒ khắc `{"v":1,"chain":"9Chain-A1","surface":"p","docs":[]}` —
một **bó rỗng** vào P-Chain, tức vào đúng thứ chính file này gọi là *"GỐC: nơi khai sinh ra
cả X-Chain lẫn C-Chain"*. Không một tiếng động.

**Mặt gốc phải được canh chặt hơn mặt phái sinh, không phải lỏng hơn.** Đã thêm cổng.

---

## 7. Chưa sửa — cần David quyết

| # | Việc | Vì sao không tự quyết | Chạm binary? |
|---|---|---|---|
| **C-1** | `UptimeRequirement: .8` — file tự ghi *"⬅️ CHỐT LẠI THÀNH 0.9 TRƯỚC MAINNET"* | quyết định về mức khắt khe với validator cộng đồng | ✅ |
| **C-2** | `MaxStakeDuration: 365 ngày` ⇒ 9 node hết hạn trong cửa sổ 56 ngày từ `2027-08-24`, **mạng dừng**. Avalanche mainnet cũng 365, nên không phải lỗi — nhưng với chain khắc chữ "vĩnh viễn" thì đó là **nghĩa vụ gia hạn hằng năm chưa có quy trình** | nâng trần hay dựng quy trình gia hạn — hai đường khác hẳn về chi phí | ✅ nếu nâng trần |
| **C-3** | **Phí C-Chain = vanilla Avalanche.** `A1Params` phủ P/X; C-Chain — nơi người dùng **thật sự** giao dịch (faucet 100% C-Chain, MetaMask, Blockscout) — không có ô nào. Hiện là **im lặng**, mà im lặng không phân biệt được với bỏ sót | đổi số, hay khai là cố ý | ✅ nếu đổi |
| **C-4** | **chainId `9000000009` cắm cứng** trong `cChainGenesis` (`netgen/main.go:351`) trong khi `networkID` là tham số ⇒ **mạng tập và mạng thật cùng chainId**. MetaMask không phân biệt được; EIP-155 buộc chữ ký vào chainId chứ không vào networkID | A1 đã dựng cổng *"bản tập ≠ bản thật"* rất kỹ cho **chữ khắc**, mà **không có cổng nào cho chainId** | ❌ |

Rủi ro thực tế của **C-4** hôm nay thấp: netgen sinh khoá mới mỗi lượt nên địa chỉ khác nhau;
cửa duy nhất là người tự import cùng một khoá vào cả hai mạng. Nhưng bất đối xứng thiết kế
thì có thật.

### 7b. ✅ ĐÃ SỬA `27/08` — genesis gốc của Avalanche còn trong đường boot

> **Trạng thái:** tệp **đã xoá**, đường boot **đã đổi**, con trỏ khắc chữ **đã sửa ở 5 chỗ**.
> Xem §7c ngay dưới. Phần mô tả dưới đây giữ nguyên làm bằng chứng.

**`9chain-a1-config/genesis.json` là genesis gốc của Avalanche, và vẫn trong đường boot.**
`local-net/docker-compose.yml:29` → `--genesis-file=/9chain-a1/config/genesis.json`. Tệp đó là
`genesis_local.json` của Avalanche, đổi **đúng một trường** `networkID`:

| | |
|---|---|
| 3 `avaxAddr` | `X-local1g65uqn6…` · `X-local18jma8pp…` · `X-local1ur873jh…` — địa chỉ local chuẩn, **khoá riêng nằm trong repo avalanchego** |
| `nodeID` | `NodeID-7Xhw2mDxuDS44j42TCB6U5579esbSt3Lg` — node local gốc |
| `cChainGenesis.alloc` | `8db97C7c…52FC` = **khoá ewoq công khai**, `0x295BE96E64066972000000` = **50.000.000** |
| HRP | `local` — trong khi binary phục vụ `love9` |
| `startTime` + `initialStakeDuration` | 2024-07-15 + 365 ngày ⇒ **hết hạn 2025-07-15** |

`netgen` **không đọc tệp này** (dựng `UnparsedConfig` trong Go, `main.go:213`; `main.go:9` ghi
rõ *"KHÔNG dùng khoá ewoq"*), nên **mạng công khai sạch**. Nhưng tệp vẫn mount `ro` vào mọi
node, `README.md:111` trỏ vào nó làm nguồn Network ID và chainId, và — đắt nhất —
[`NGAY-G-A1-CON-LAI.md`](NGAY-G-A1-CON-LAI.md) cùng `PLAN-REGENESIS:105` trỏ **`:95
"{{ fun_quote }}"` làm ô khắc chữ ngày G**, trong khi ô khắc thật nằm ở `netgen/engrave.go`.

⇒ **Tài liệu ngày G đang chỉ người đọc vào một tệp không có vai trò nhân quả nào.**

*(Chưa boot thử nên không khẳng định nó chết ở lỗi nào trước — HRP lệch hay stake hết hạn.
Nhưng nó không thể đúng, và nó là đường boot mà README đang dạy.)*

### 7c. ✅ Đã sửa — và nó gỡ luôn một mâu thuẫn không ai để ý

🔴 **Phát hiện thêm khi sửa:** `up-all.sh` bước [2/6] lấy khoá faucet từ
`local-net/net/faucet.env` **do netgen sinh**, trong khi node ở bước [1/6] boot bằng genesis
gốc của Avalanche. ⇒ **node dev và ví faucet dev thuộc hai mạng khác nhau** — ví faucet luôn có
số dư 0, và không có thông báo lỗi nào giải thích vì sao. Đường dev đã hỏng theo kiểu im lặng,
có lẽ từ lúc netgen ra đời.

Nay cả hai lấy từ **cùng một bộ `local-net/net/`**.

| | Trước | Sau |
|---|---|---|
| `local-net/docker-compose.yml` | `--genesis-file=/9chain-a1/config/genesis.json` | **`/9chain-a1/net/genesis.json`**, mount `./net:/9chain-a1/net:ro` |
| `9chain-a1-config/genesis.json` | boot thật | **đã xoá** |
| `9chain-a1-config/l1-evm-genesis.json` | mount | **giữ nguyên** — khuôn genesis L1 EVM, `create-l1` đọc |
| thiếu `net/genesis.json` | boot một mạng lạ | **dừng, in lệnh `gen-network.sh`** (`up-all.sh` · `create-l1.sh` · `9chain-a1 up`) |

**Con trỏ khắc chữ — sửa ở 5 chỗ:** `NGAY-G-A1-CON-LAI.md` §3 · `PLAN-REGENESIS` §G5 + G5a +
mục (d) · `KHAC-CHU-NGAY-G.md` luật 3 · `README.md` bảng identity · **`netgen/main.go`** (chú
thích trong mã — nằm trong patch 0013, nên tree đổi sang `0f497b37`).

Mỗi chỗ đều giữ lại một dòng nói **bản cũ ghi gì và vì sao sai**, thay vì im lặng thay số —
người đọc lại tài liệu cũ (hoặc `patches/0010`, vẫn mang câu cũ vì patch là *lịch sử*) phải
tra được vì sao hai bản khác nhau.

⚠️ **Vì sao lớp lỗi này đắt:** đi theo con trỏ cũ để sửa chữ khắc thì sửa một tệp **không ai
đọc**, và **không có gì báo lỗi** — lượt sinh mạng vẫn chạy, genesis vẫn hợp lệ, chữ khắc vẫn
là chuỗi mặc định `"9Chain-A1 sovereign genesis"`. Cùng họ với *"đường lui alias = xanh giả"*:
**một đường dẫn sai chỉ lộ ra khi có người đi tới cuối nó.**

---

## 8. Cái đã kiểm và thấy ĐÚNG

Để §2–§6 không đọc như "mọi thứ đều hỏng":

- **Số học bảng phân bổ khớp tuyệt đối.** 6 bucket → 5 hạng mục: Foundation 1.080.000.000
  (12%) · Community 2.700.000.000 (30%) · Private Sale 810.000.000 (9%) · Team 810.000.000
  (9%) · tổng **5.400.000.000** = 60% của 9 tỷ. Không lệch một đơn vị.
- **`keygen` và `newFund` dùng `secp256k1.NewPrivateKey()`** → `crypto/rand`. Không có ngẫu
  nhiên yếu ở bất kỳ đâu trong đường sinh khoá quỹ.
- **Tách địa chỉ self-bond khỏi Foundation** có lý do đúng và được ghi tại chỗ: trộn chung
  thì đổi lịch khoá Foundation sẽ **âm thầm đổi trọng số validator**.
- **`mustUsableDataAddr`** chặn địa chỉ 0 và vùng precompile `< 0x100`; chỉ số `h[:38]` đúng
  (19 byte đầu). Và **cố ý không** chặn cứng vùng Avalanche `0x0200…` vì danh sách đó trôi
  theo phiên bản — suy nghĩ đúng, ghi rõ lý do.
- **Chặn đâm địa chỉ hợp đồng dữ liệu vào địa chỉ quỹ** (`main.go:343`) — đúng, và đó là lỗi
  sẽ mất sạch một quỹ mà không có dấu hiệu nào.
- **So le nhiệm kỳ 7 ngày** thay 5400 giây: có lập luận thật (*node đầu rụng ở ~ngày 309, và
  đó là lời cảnh báo sớm với 8 node vẫn chạy*), không phải số bịa.
- **`config/config.go`** xếp 9001 cùng nhóm Mainnet/Fuji để cờ CLI không đè được tham số kinh
  tế — đúng, và chính lập luận đó là thứ §4 mở rộng sang `upgrade.go`.

---

## 9. Patch 0013 — nghiệm thu

**6 tệp:** `utils/constants/network_ids.go` · `upgrade/upgrade.go` ·
`genesis/genesis_9chain_a1.go` · `netgen/allocation.go` · `netgen/main.go` · `netgen/engrave.go`.

### 9.1 Tái lập

| | |
|---|---|
| Gốc | `1cf1fc3` |
| Áp **13** patch bằng `git am --keep-cr` trong worktree tách rời | tree **`0f497b379fdabb75e61c17aa414ef07bf9af18da`** |
| Cây fork đang làm việc | tree **`0f497b379fdabb75e61c17aa414ef07bf9af18da`** |
| | **khớp từng byte** ✓ |

*(Nhớ `--no-signature` khi sinh patch — thiếu cờ đó thì 13/13 báo "khác" dù nội dung y hệt.)*

### 9.2 Biên dịch + chạy (container `golang:1.25.10-bookworm`, mount fork)

```
go vet   ./9chain-a1-tools/... ./genesis/... ./upgrade/... ./utils/constants/...   sạch
go build (thêm ./config/...)                                                       sạch
```

`netgen N=9 NETWORK_ID=9001`:

```
✓ cung: X/P 4,300,000,001 ≤ trần 7,900,000,001 · trần + C-Chain 1,099,999,999
        = tổng cung 9,000,000,000 LOVE9 (dư địa mint 3,600,000,000)
self-bond: 8,999,991 LOVE9 / 9 node = 999,999 LOVE9 mỗi node
```

`genesis.json` sinh ra, **phân tích lại độc lập bằng Python** (không tin bản in của netgen):

| | |
|---|---|
| networkID · allocation · staker | 9001 · 6 · 9 |
| `initialStakeDurationOffset` | 604800 (7 ngày) ✓ |
| C-Chain chainId · `extraData` | 9000000009 · `0x00` (không khắc — đúng, đây là bản tập) |
| **X/P 4.300.000.001 + C-Chain 1.099.999.999** | **= 5.400.000.000** ✓ |

### 9.3 Đối chứng ngược — 5/5 đỏ đúng chỗ

| Ca | Kết quả |
|---|---|
| `NETWORK_ID=9002` | FATAL, exit 1 |
| `SupplyCap` đặt lại 9e9 | FATAL kế toán, **in ra `10,099,999,999`** |
| thiếu `A1_ENGRAVE_CHECKSUMS` | FATAL *(bản cũ: chỉ cảnh báo rồi khắc tiếp)* |
| `CHECKSUMS` gắn **nhầm tên tệp** | FATAL *(bản cũ: **CHO QUA**)* |
| manifest không có mặt `p` | FATAL *(bản cũ: khắc bó rỗng vào P-Chain)* |

Cộng hai ca phải **XANH**: cờ `A1_ENGRAVE_NO_CHECKSUMS` cho lượt tập đi qua có cảnh báo, và
`CHECKSUMS` đúng ⇒ `✓ khac chu: 2/2 tai lieu khop ban dong bang cua C1 (hash VA ten tep)`.

### 9.4 🔴 Đối chứng ngược bắt được một lỗi trong chính bản vá này

Ca *"`SupplyCap` đặt lại 9e9"* làm cổng mới đỏ **đúng như thiết kế**, nhưng thông báo in ra:

```
FATAL kế toán tổng cung KHÔNG khớp (networkID %!d(string=9,000,000,000)):
         trần cung P/X (binary)   1,099,999,999 LOVE9
       + phát hành C-Chain        10,099,999,999 LOVE9
       = 9,000,000,000 LOVE9, nhưng tổng cung công bố là %!s(MISSING) LOVE9
```

Thiếu tham số `networkID` trong `Fprintf` ⇒ mọi cột lệch một chỗ. **Cổng vẫn CHẶN đúng, nhưng
người đọc nó sẽ bị dẫn sai** — và người đọc nó là người đang đứng trước một lượt sinh mạng.

Đã sửa. `go vet` cũng bắt được ca này ⇒ **từ nay chạy `go vet` trước khi tin một thông báo lỗi
mới.** Bài học: *một cổng chưa được nhìn thấy lúc nó ĐỎ thì mới chỉ được kiểm một nửa — nửa
"có chặn không", chưa kiểm nửa "chặn xong nó nói gì".*

### 9.5 Cổng nhất quán — nay ĐỌC Go, không chép Go

`scripts/check-consistency.mjs` vẫn khẳng định `SupplyCap = 9,000,000,000` sau khi binary đã
đổi. Bản chép tay bằng JS **đã trôi lệch thật** — đúng điều `HANDOFF.md` cảnh báo về chính cổng
này. Một cổng khẳng định một hằng số **không còn tồn tại** thì tệ hơn là không có cổng.

Nay nó `readFileSync` chính `genesis_9chain_a1.go` và parse dòng gán (neo đầu dòng, đòi dấu
phẩy cuối — khối chú thích phía trên nhắc `SupplyCap` nhiều lần, khớp nhầm vào đó là đọc ra số
của một ví dụ). Thêm ba ràng buộc và ba đối chứng ngược:

```
✓ SupplyCap đọc TỪ GO: 7,900,000,001 LOVE9 (`7_900_000_001 * units.Avax`) — không chép tay
✓ SupplyCap 7,900,000,001 + C-Chain 1,099,999,999 = 9,000,000,000 (tổng cung 9,000,000,000)
✓ dư địa mint = 7,900,000,001 − 4,300,000,001 = 3,600,000,000 (ô mint khai 3,600,000,000)
21 đạt · 0 lỗi · 9/9 đối chứng ngược bắt được
```

Ba ca đối chứng mới — *"SupplyCap = tổng cung"*, *"quên khai cChain của một mục"*, *"không đọc
được SupplyCap từ Go"* — **là lỗi có thật trong mã tới `27/08`, không phải giả định.**

⚠️ Phạm vi của cổng này vẫn không đổi: nó là cổng **số học**, không phải cổng **hành vi**.

---

## 10. Việc còn lại trước ngày G

**Đã xong (patch 0013):** P0 kế toán cung · cổng theo `networkID` · `upgrade.A1` ·
`A1ID`/`A1Name`/`A1HRP` · ba cổng khắc chữ · cổng nhất quán đọc Go.

**✅ Xong `27/08`, không chạm binary:** gỡ `9chain-a1-config/genesis.json` khỏi đường boot và
sửa con trỏ khắc chữ ở 5 chỗ — §7c.

**Cần David:** C-1 `UptimeRequirement` · C-2 `MaxStakeDuration` · C-3 phí C-Chain · C-4
chainId mạng tập. C-1 → C-3 chạm binary ⇒ **quyết trước lượt `docker build` của ngày G**, nếu
không thì kẹt tới lần sinh mạng sau.

🔴 **Và bước 0 của runbook ngày G nay có thêm một dòng đối chứng:**

```bash
docker logs 9chain-a1-node-1 | head -1 | grep -o '"supplyCap":[0-9]*'
# -> PHẢI ra 7900000001000000000, KHÔNG phải 9000000000000000000
```
