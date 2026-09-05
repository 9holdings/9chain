# K1 — 1.000 sổ trên băng tập: phân tích chi tiết để chuẩn bị triển khai

Viết `2026-09-05`, tiếp `PLAN-1000-L1-TEST-2026-09-05.md` (chọn K1). Đối chiếu với công cụ **đang có** trên `main`
(`9chain-a1-tools/{netgen,create-l1,9chain-a1-cli,keygen}`, `local-net/console/server.mjs`, `scripts/measure-node-load.sh`,
`local-net/faucet/load-test.mjs`, `docker-compose.drill.yml`) và với mã lõi `upstream/avalanchego` (HEAD `66e5776`).
Số **đo** ghi nguồn; số **ước** ghi rõ; nhãn **[lõi] [phải xây] [vận hành] [đo]** như các bản trước.

---

## 0. K1 trong một trang

| | |
|---|---|
| **Là gì** | 1.000 L1 kiểu ACP-77, **mỗi L1 một validator**, trên **băng tập** `A1IDTap` (`899999999 − A1Gen`, tên `9chain-a1-tap-g1`, HRP `love9` chung — `network_ids.go:72–109`). Diễn tập **pha A** của tầm nhìn |
| **Cụm** | 9 node mạng mẹ băng tập (3 máy) · **72 node "chủ sổ"** không cọc, `--partial-sync-primary-network`, mỗi node track ≤ 14 sổ (18 máy, 4 node/máy) · 1 chain cộng đồng "9S Union tập" V = 5 nhận neo · 1 router RPC · 1 máy đo · 10–28 VM sinh tải |
| **Điều kiện tiên quyết** | công cụ **`l1-batch`** [phải xây]: tạo 1.000 subnet/chain/convert trên P-Chain **trước**, gán sổ → node, mỗi node **khởi động một lần** với đủ subnet. Không đi qua console |
| **Phát hiện đổi thiết kế** | subnet-evm mặc định `trie-clean-cache 512 · trie-dirty-cache 512 · snapshot-cache 256` MB **mỗi plugin** (`plugin/evm/config/default_config.go:34–38`) ⇒ lo 15 chain/node lên **19 GB**. **Đã đo pha 0 (`docs/k1-phase0/EVIDENCE-2026-09-05.md` 0.1d):** ở 3 tx/s × 300 s cache mặc định **không** phình — 59–62 MiB/plugin, bằng knob 16/16/8; 512 MB là trần chỉ đầy khi trạng thái chain lớn. Knob giữ làm **nắp an toàn**; cỡ node có thể **hạ**: 15 sổ ≈ 1 GB RAM · 0,3 nhân ⇒ 8 node/máy AX52 ⇒ **9 máy** thay 18 |
| **Tiền** | **~€1.500–1.750/tháng** (r = 1–3 tx/s), một tháng; ~€60 phí thuê lần đầu mỗi máy [ước, giá Hetzner công khai] |
| **Thời gian** | 10 ngày dựng phần mềm + đo trên máy dev · 2 ngày dựng cụm · 7 ngày tải · 3 ngày ngủ đông + rút điện · 1 ngày báo cáo = **~23 ngày** |
| **Điều kiện qua** | 1.000/1.000 đẻ block ở nhịp 7 ngày · 0 `StartClose` · `platform.getValidatorFeeState` giá **= 1 nLOVE9** suốt · 300 sổ cạn phí ngủ và 100 thức lại đúng · một máy rút điện ⇒ 56 sổ ngủ, 944 chạy, máy lên thì thức · xác minh Warp từ sổ lạ dưới ngưỡng đo ở pha 0 |
| **Bốn rủi ro lớn** | RAM plugin (knob cache) · tham số snow cho L1 một validator · UTXO một ví khi phát 3.000 tx · P-Chain `txDB` phình nếu genesis > 10 KB |

---

## 1. Kiến trúc cụm

### 1a. Ba lớp node

| Lớp | Số | Vai | Cấu hình node | Cọc |
|---|---|---|---|---|
| **Mạng mẹ băng tập** | 9 (3 máy × 3) | validator mạng mẹ, beacon P2P, RPC P-Chain cho `l1-batch` và cổng đo | netgen `N = 9` như g1, `A1_P2P_MODE=ipv4port`, beacon khai `A1_PUBLIC_IP` (patch 0024) | tự cọc netgen sinh |
| **Chủ sổ** | **72** (18 máy × 4) | validator **duy nhất** của ≤ 14 sổ; RPC cho chính 14 sổ đó | `--partial-sync-primary-network` (`flags.go:273`) · `--track-subnets` 14 ID · `--chain-config-dir` · `--subnet-config-dir` · `--staking-port` riêng · `--http-port` riêng · `--public-ip` máy | **0** — validator L1 không cọc mạng mẹ [lõi] |
| **Chain cộng đồng tập** | 1 L1, V = 5 trên 5 node chủ sổ | nhận neo, đo `GetValidatorSet` cho subnet không track, ACP-118 gom | subnet thứ 15 trên 5 node đó | như trên |

72 × 14 = 1.008 chỗ; 5 node dùng chỗ 15 cho chain cộng đồng. Còn 8 chỗ dự phòng cho subnet mồ côi (một lượt tạo hỏng
giữa chừng — bài học console `MAX_L1 = 15` chừa một).

**Vì sao node chủ sổ không cần cọc:** ACP-77 thay cọc bằng phí (`validators/fee`); node chỉ cần theo dõi P-Chain để
biết tập validator của chính nó. Đây chính là hình dạng "thiết bị của chủ" trong tầm nhìn — K1 diễn tập đúng nó.

### 1b. Mạng

- Mọi node `ipv4port`: mỗi node một `--staking-port` (`A1_STAKING_PORT_BASE + i`), `--public-ip` = IPv4 máy; chỉ beacon
  công khai; node cùng máy giữ địa chỉ nội bộ (patch 0024, đo NAT vòng lại hỏng trên Docker).
- Bootstrap: 72 node chủ sổ khai `--bootstrap-ips/ids` = 9 beacon. Mesh 81 node: mỗi node ~80 kết nối, bình thường.
- Cổng mở mỗi máy: 4 × (staking + http). Docker publish theo `ipv4port`.

### 1c. RPC và router [phải xây]

Node chỉ trả RPC cho chain nó track. Router đọc `assignment.json` (`blockchainID → host:http-port`) và chuyển
`/ext/bc/<blockchainID>/rpc` tới node đúng. Hai lớp khách:

| Khách | Đường |
|---|---|
| Bộ sinh tải | **thẳng** vào node chủ sổ theo bảng (không qua router — router không phải nút thắt của phép đo) |
| Người, công cụ đo, 9Scan tập | qua router; router 404 rõ nếu blockchainID không có trong bảng |

Cài: một VM, Caddy với `map` từ bảng sinh, hoặc ~150 dòng Node. Cổng: `check-router.mjs` — 1.000/1.000 `eth_chainId`
đúng qua router **và** thẳng.

---

## 2. Danh tính, khoá, tiền trên băng tập

| Thứ | Số | Sinh bằng | Giữ ở |
|---|---|---|---|
| Cert + khoá staking node chủ sổ | 72 | `staking.NewCertAndKeyBytes()` (`staking/tls.go:117`) qua `keygen` hoặc để node tự sinh lần đầu | máy tương ứng; **không** cần sao lưu (băng tập) |
| Khoá BLS + PoP mỗi node | 72 | node tự sinh; đọc `info.getNodeID` → `nodeID`, `nodePOP{publicKey, proofOfPossession}` | `l1-batch` đọc **trước** bước convert |
| Chủ sổ (secp256k1) | 1.000 | HD seed thử nghiệm, `so-0001…so-1000` | `ledgers.json` (băng tập, không nhạy cảm — nhưng **không** để lẫn thư mục `net-public/`, bài học §5.10 PLAN-108) |
| Ví bơm mỗi sổ | 1.000 | cùng seed, đường dẫn khác | máy sinh tải |
| Ví quỹ băng tập | 1 | netgen sinh trong genesis băng tập | máy `l1-batch` |
| `RemainingBalanceOwner` / `DeactivationOwner` | 1.000 | = ví chủ sổ (thật hơn) | trong `ConvertSubnetToL1Tx` |

**Tiền P-Chain:** 1.000 × (CreateSubnet + CreateChain + Convert) phí động ≈ 1.000 × 0,00023 ≈ **0,23 LOVE9** (D-174);
`Balance` ban đầu mỗi sổ **0,01 LOVE9** = 10⁷ nLOVE9 ≈ **116 ngày** ở giá sàn 1 nLOVE9/s ⇒ 10 LOVE9. Để chạy 4d
(ngủ đông) cần 300 sổ **cạn** trong cửa sổ đo ⇒ 300 sổ đó nhận `Balance` **0,0002 LOVE9** ≈ 2,3 ngày. Tổng ≤ 20 LOVE9
trên P-Chain của ví quỹ, chia thành **10 UTXO** để phát song song (§4).

**Tên và chainId:** tên `so-0001` (≤ 128 byte, `create_chain_tx.go:19`). ChainId EVM **không** lấy từ dải thật
`9000000010–9999999999` (D-076) — netgen băng tập có cổng "bản tập ≠ bản thật" (patch 0015) và sổ `chainid-issued.json`
của g1 **không được đụng**. Đề xuất dải tập `8990000001–8990001000`; **David chốt** (§10).

---

## 3. Genesis sổ ≤ 10 KB và cấu hình runtime mỗi chain

### 3a. Genesis (bất biến, nằm mãi trong `txDB` P-Chain — §6 `DEEP-DIVE`)

```json
{
  "config": {
    "chainId": 8990000001,
    "feeConfig": { "gasLimit": 8000000, "targetBlockRate": 2, "minBaseFee": 25000000000,
                   "targetGas": 15000000, "baseFeeChangeDenominator": 36, "minBlockGasCost": 0,
                   "maxBlockGasCost": 1000000, "blockGasCostStep": 200000 },
    "txAllowListConfig":               { "blockTimestamp": 0, "adminAddresses": ["<chủ>"], "enabledAddresses": ["<bơm>"] },
    "contractDeployerAllowListConfig": { "blockTimestamp": 0, "adminAddresses": ["<chủ>"] },
    "warpConfig":                      { "blockTimestamp": 0 }
  },
  "alloc": { "<chủ>": { "balance": "0x295BE96E64066972000000" }, "<bơm>": { "balance": "0xD3C21BCECCEDA1000000" } },
  "gasLimit": "0x7A1200", "difficulty": "0x0", "timestamp": "0x0", ...
}
```

Cỡ **~2 KB**. Không `nativeminter`, không `feemanager` ở lượt này — hai precompile đó không đo gì thêm cho K1 và
`minBaseFee 0` là tổ hợp "chết chain lúc sinh" đã ghi. **Không cài bytecode**: 1.000 genesis × 2 KB = 2 MB trong
`txDB` mọi node; đo và ghi con số đó (§7).

`txAllowList` là **hiến pháp tối giản thật**: chỉ chủ và ví bơm ký được — sổ K1 đã là sổ có luật, không phải chain trần.
Phép đo "hiến pháp chặn đúng một lần" (MASTER dòng A) làm được ngay trên K1: một ví thứ ba gửi tx ⇒ bị từ chối.

### 3b. Cấu hình runtime (`--chain-config-dir/<blockchainID>/config.json`) [đo trước]

| Knob (`plugin/evm/config/config.go`) | Mặc định | K1 | Vì sao |
|---|---|---|---|
| `trie-clean-cache` | 512 MB | **16** | 15 plugin × 512 = 7,5 GB |
| `trie-dirty-cache` | 512 MB | **16** | như trên |
| `snapshot-cache` | 256 MB | **8** | như trên |
| `pruning-enabled` | true | true | đĩa |
| `warp-api-enabled` | false | **true** | ACP-118 gom chữ ký |
| `metrics-expensive-enabled` | — | false | CPU |
| `log-level` | info | **warn** | 15 log/node |

Cần thêm `--subnet-config-dir/<subnetID>.json` cho **L1 một validator**: tham số snow phải hợp lệ với 1 người —
`Verify()` đòi `k/2 < αP ≤ αC ≤ k`, `concurrentRepolls ≤ β` (`snowball/parameters.go:93–106`). Đề xuất
`{"snowParameters":{"k":1,"alphaPreference":1,"alphaConfidence":1,"beta":1,"concurrentRepolls":1}}`.
🔴 **[đo ở pha 0]:** có cần khai hay tham số mặc định (k = 20 của mạng mẹ) tự chạy với 1 validator — đo trên
`net-drill9` trước khi viết vào 1.000 tệp.

`blockchainID` chỉ biết **sau** `CreateChainTx` ⇒ tệp cấu hình viết ở bước D của §4, **trước** khi node khởi động.

---

## 4. Đường cấp phát theo lô — công cụ `l1-batch` [phải xây, Go, `9chain-a1-tools/l1-batch/`]

Dựa trên `wallet/chain/p` đã có `IssueCreateSubnetTx` · `IssueCreateChainTx` (`create-l1/main.go:64,81` dùng rồi) ·
`IssueConvertSubnetToL1Tx` (`wallet.go:490`, builder `builder.go:860`). Console **không** tham gia — console vẫn là
đường của g1 với rolling restart; K1 không được kéo nó theo.

| Bước | Làm gì | Đầu ra | Cổng |
|---|---|---|---|
| **A** | sinh 1.000 chủ + ví bơm + genesis (§3a) | `ledgers.json`, `genesis/so-####.json` | mọi genesis ≤ 10 KB; chainId không trùng, không trong dải thật |
| **B** | đọc 72 node: `info.getNodeID` ⇒ NodeID + PoP; gán sổ → node **ít sổ nhất**, trần 14 | `assignment.json` | không node nào > 14 (+1 cho 5 node chain cộng đồng); **ca đỏ**: ép 16 ⇒ từ chối |
| **C** | với mỗi sổ: `CreateSubnetTx(owner = quỹ tập)` → `CreateChainTx(subnetID, genesis, vmID LOVE9EVM, "so-####")` → `ConvertSubnetToL1Tx(subnetID, chainID = blockchainID của sổ, address = 0x…01 giữ chỗ, validators = [{NodeID host, Weight 100, Balance, Signer PoP, owners = chủ}])` | `chains.json` (subnetID, blockchainID, validationID) | `platform.getL1Validator(validationID)` trả đúng NodeID, weight, balance |
| **D** | viết `chain-config-dir/<blockchainID>/config.json` (§3b), `subnet-config-dir/<subnetID>.json`, `--track-subnets` cho từng node vào compose/env của máy | 18 compose | mỗi node đúng danh sách của nó trong `assignment.json` |
| **E** | `docker compose up -d` **một lần** mỗi máy; node bootstrap P-Chain (nhỏ) + 14 chain rỗng | 72 node sống | `info.isBootstrapped` cho 14 chain; `info.peers` ≈ 80; log `too many tracked subnets` = **0** |
| **F** | kiểm 1.000 `eth_chainId` thẳng + qua router; `platform.getValidatorFeeState` giá = 1 | báo cáo cấp phát | **ca đỏ**: xoá một dòng `assignment.json` ⇒ router 404 đúng chain |

**Thông lượng bước C:** 3.000 tx; P-Chain `MaxPerSecond 100.000 gas`, mỗi tx ≈ 5–6 k gas ⇒ ~9 tx/s bền (ước,
`ANALYSIS-CORE` §3) ⇒ **~6 phút** nếu ví không nghẽn. Một ví = một chuỗi UTXO tuần tự ⇒ chia quỹ thành **10 UTXO**,
10 goroutine, mỗi goroutine 100 sổ. Ghi `chains.json` **từng dòng khi xong** để lượt chạy lại tiếp từ chỗ gãy (subnet
đã tạo mà chưa convert = subnet mồ côi, chiếm một trong 8 chỗ dự phòng — đếm và báo).

**Địa chỉ quản lý giữ chỗ là hợp lệ** (`convert_subnet_to_l1_tx.go:40–42,58`, ≤ 4.096 byte, không kiểm nội dung):
tập validator ban đầu ghi thẳng trong tx; hợp đồng chỉ cần khi **đổi** tập validator qua Warp
(`RegisterL1ValidatorTx` đòi thông điệp Warp từ `Address` đó). K1 không đổi tập validator ⇒ không cần Validator
Manager. Ghi rõ trong báo cáo: **K1 không đo đường thêm/gỡ validator**.

---

## 5. Sinh tải

| Tham số | r = 3 tx/s (như PLAN-108) | r = 1 tx/s |
|---|---|---|
| Tổng | 3.000 tx/s | 1.000 tx/s |
| VM sinh tải (theo tỉ lệ PLAN-108 ~36 chain/VM 4 vCPU) | **28** | **10** |
| Đĩa cụm/ngày ở 0,5 KB/tx/node [ước] | 130 GB | 43 GB |
| Đĩa mỗi node chủ sổ/ngày | 1,9 GB | 0,6 GB |

Bộ bơm: mở rộng `local-net/faucet/load-test.mjs` thành `--chains assignment.json --rate r` [phải xây]: mỗi chain một
ví bơm từ `alloc`, **nonce cục bộ** (bẫy `latest` ⇒ ví chết sau một cú nấc RPC), gửi **thẳng** node chủ sổ, ghi
`heartbeat/<chainId>.json` mỗi 10 s (tx gửi/vào khối/lỗi/block cuối). 50 chain "nóng" 9 tx/s để xem cái gì vỡ trước.

---

## 6. Cụm đo — API và metric cụ thể

| Đại lượng | Đọc ở đâu | Điều kiện qua | Ca đỏ |
|---|---|---|---|
| Bắt tay P2P | log node: `too many tracked subnets` / `StartClose` | **0** suốt | ép 16 ở bước B |
| Peer | `info.peers` mỗi node | ≈ 80 ± 2 | rút một máy ⇒ giảm đúng 4 |
| Chain sống | `eth_blockNumber` mỗi chain mỗi 10 s | tăng khi có tải; block ≤ 2,5 s | tắt bơm một chain ⇒ đứng, cổng đỏ đúng chain |
| Phí P-Chain | `platform.getValidatorFeeState` → `{excess, price, timestamp}` (`service.go:2081–2085`) | `price = 1`, `excess = 0` suốt | 4d: 300 cạn ⇒ `Current` giảm (đọc qua số validator hoạt động) |
| Từng validator | `platform.getL1Validator(validationID)` → weight, balance, nodeID | balance giảm ~86.400 nLOVE9/ngày | sổ cạn ⇒ trả về trạng thái không hoạt động; `platform.getCurrentValidators(subnetID)` không còn NodeID |
| Dựng tập validator subnet lạ | metric của `validators.Manager` (`manager.go:188–191`: số lượt tạo, thời lượng, lệch chiều cao) tại `/ext/metrics` node chain cộng đồng — **tên metric đọc ở pha 0** | thời lượng < ngưỡng đặt ở pha 0 (đề xuất 200 ms) | gửi neo từ sổ cách 10⁴ block P-Chain ⇒ thời lượng tăng, ghi lại |
| ACP-118 | thời gian gom chữ ký từ 200 sổ tới chain cộng đồng | < 10 s | 10 node chủ sổ đặt sau NAT giả không nối tới node gom ⇒ thiếu chữ ký đúng 10 |
| RAM | `measure-node-load.sh` **mở rộng nhiều máy** (cgroup mỗi container) + RSS từng tiến trình plugin trong container | phẳng sau 6 h; ≤ 3 GB/node ở knob §3b | knob mặc định ⇒ vượt, ghi số |
| CPU | như trên | ≤ 2 luồng/node ở r = 3 | — |
| Đĩa | `du` volume mỗi node mỗi ngày; **`du` thư mục DB P-Chain** (txDB) | ngoại suy ≥ 30 ngày; txDB tăng ≈ 2 MB cho 1.000 genesis | genesis 500 KB thử 20 chain ⇒ txDB tăng 10 MB, ghi để chứng minh §6 `DEEP-DIVE` |
| Đồng hồ | `check-clock-skew.mjs` 81 node | < 1 s | — |

Mọi số ghi vào `evidence/k1/<ngày>.json`; báo cáo cuối đọc từ đó, không từ trí nhớ.

---

## 7. Pha 0 — đo trên máy dev TRƯỚC khi thuê máy (3–4 ngày, 0 €)

| # | Đo gì | Ở đâu | Quyết định gì |
|---|---|---|---|
| 0.1 | **RAM 15 plugin subnet-evm** dưới tải 3 tx/s mỗi chain, knob mặc định **và** knob §3b | `net-drill9` một node, 15 chain | cỡ node; có cần hạ knob thêm không |
| 0.2 | **L1 một validator** có đẻ block với snow mặc định không; với `k=1` | `net-drill9`, 1 sổ | nội dung `subnet-config-dir` |
| 0.3 | `l1-batch` chạy 30 sổ trên 3 node: bước A–F, kể cả **gãy giữa bước C rồi chạy lại** | `net-drill9` | công cụ đúng trước khi phát 3.000 tx |
| 0.4 | `platform.getValidatorFeeState` / `getL1Validator` đọc được; để 1 sổ cạn phí (Balance 60 s) ⇒ ngủ; nạp lại từ **ví khác** ⇒ thức | `net-drill9` | cổng phí và ngủ đông đúng hình dạng |
| 0.5 | tên metric của `validators.Manager` tại `/ext/metrics`; ngưỡng thời lượng dựng tập validator | `net-drill9` | ngưỡng cho §6 |
| 0.6 | genesis 2 KB vs 500 KB: `du` DB P-Chain trước/sau 20 chain | `net-drill9` | chứng minh luật "genesis nhỏ" bằng số |
| 0.7 | 4 node một máy `ipv4port`, bootstrap 14 chain rỗng: bao lâu | máy dev | thời gian bước E; có cần lệch giờ khởi động không |

`net-drill9/` và `docker-compose.drill.yml` (cổng 9750, project `a1-drill`) đã có — bài học "mạng tập phải lên cổng
khác 9650" đã trả giá.

---

## 8. Lịch triển khai — 23 ngày

| Ngày | Việc | Kết quả phải có |
|---|---|---|
| 1–3 | `l1-batch` (A–F) + test đơn vị; `keygen` cho 72 node | 30 sổ trên `net-drill9` (0.3) |
| 4–5 | knob §3b, `subnet-config` (0.1, 0.2); netgen xuất **compose theo máy** (`A1_HOSTS` hoặc tách tay) | RAM ≤ 3 GB/node với 15 chain có tải |
| 6 | router + `check-router.mjs`; `measure-node-load.sh --hosts` | ca đỏ router thấy |
| 7–8 | `load-test.mjs --chains`, heartbeat; cổng phí/ngủ đông (0.4, 0.5, 0.6) | 30 chain 3 tx/s trên máy dev |
| 9 | gói lệnh dựng máy (cloud-init: Docker, ulimit `nofile` cao — 15 plugin/node), bảng cổng | một máy thử lên trong 20 phút |
| 10 | **GO/NO-GO** trên bằng chứng pha 0; David chốt r và ngân sách | — |
| 11 | thuê 21 máy + VM; netgen mạng mẹ băng tập 9 node lên; 72 node chủ sổ lên **chưa track gì** | `info.peers` ≈ 80 |
| 12 | `l1-batch` A–D (≈ 1 giờ kể cả kiểm); tắt 72 node, ghi cấu hình, **bật một lần** (E); F | 1.000/1.000 `eth_chainId`; phí giá 1 |
| 13–19 | **4b** tải 7 ngày; **4c** đo lõi song song (Warp từ 200 sổ tới chain cộng đồng, NAT giả 10 node) | evidence hằng ngày |
| 20–21 | **4d** ngủ đông: 300 cạn, 100 thức; chain cộng đồng 2/5 rồi 3/5 cạn | Warp qua ở 2/5, chết ở 3/5 |
| 22 | **4e** rút điện một máy 4 node (56 sổ); bật lại | 56 ngủ rồi thức, 944 không đứt |
| 23 | báo cáo từ `evidence/`, quyết K2 | — |

---

## 9. Rủi ro và chặn — riêng cho K1

| Rủi ro | Dấu hiệu | Chặn | Nhãn |
|---|---|---|---|
| **RAM plugin** ở knob mặc định 1,28 GB/chain | node OOM ở giờ đầu có tải | knob §3b; 0.1 đo trước; `memory.max` cgroup mỗi container | vận hành |
| **Snow mặc định với 1 validator** không đẻ block | 0.2 | `subnet-config-dir` k = 1 | lõi + đo |
| **UTXO một ví** phát 3.000 tx tuần tự | bước C mất giờ | 10 UTXO × 10 goroutine; ghi tiến độ từng dòng | phải xây |
| **Subnet mồ côi** khi C gãy giữa Create và Convert | chiếm chỗ track vô ích | 8 chỗ dự phòng; `chains.json` idempotent | vận hành |
| **`chain-config-dir` theo blockchainID** chưa biết trước | cấu hình thiếu ⇒ plugin chạy knob mặc định | bước D bắt buộc trước E; cổng "mọi blockchainID có tệp" | vận hành |
| **`ulimit nofile`**: 15 plugin + gRPC mỗi node | `too many open files` | cloud-init đặt 1 M; đo 0.7 | vận hành |
| **Bão bootstrap** 72 node × 14 chain cùng lúc | CPU máy mẹ | chain rỗng nên rẻ; lệch 30 s giữa các máy nếu 0.7 nói cần | đo |
| **`txDB` P-Chain phình** | genesis > 10 KB lọt | cổng bước A. Đo pha 0: +18 KiB/sổ ở 1,5 KB, **+633 KiB/sổ ở 199 KB**; trần codec thật **256 KiB/tx** | lõi |
| **Sổ ngủ + node restart = kẹt bootstrap** (đo pha 0: RPC 503, nạp phí sau không gỡ trong 120 s) | node có sổ ngủ phải restart | nạp phí **trước** restart; sau restart kiểm `info.isBootstrapped` từng sổ | lõi + vận hành |
| **Trộn băng tập vào máy g1** | tệp `net-*` lẫn | máy tách hẳn; `check-net-dirs.mjs` | vận hành |
| **1.000 tên lọt vào sổ g1** | `chainid-issued.json` đổi | không chạy `gen-chainid-issued.mjs` trỏ vào băng tập; cổng so hash sổ trước/sau | vận hành |
| Xác minh Warp từ sổ lạ chậm khi P-Chain đầy diff | 4c | đây là **phép đo**, không phải lỗi; ghi số cho ACP (c) | lõi |

---

## 10. Điều cần David quyết trước ngày 10

1. **r** — 3 tx/s (28 VM, €1.750) hay 1 tx/s (10 VM, €1.500). Đề xuất **1 tx/s cho 950 chain + 9 tx/s cho 50 chain
   nóng**: đủ để "mọi chain đều hoạt động", đĩa chia 3, và câu hỏi của K1 nằm ở P-Chain chứ không ở thông lượng EVM.
2. **Dải chainId băng tập** `8990000001–8990001000` — hoặc dải khác, miễn ngoài dải thật và qua cổng patch 0015.
3. **Địa chỉ quản lý giữ chỗ** trong `ConvertSubnetToL1Tx` — chấp nhận, kèm câu "K1 không đo thêm/gỡ validator".
4. **Chain cộng đồng tập V = 5** có dựng không (5 chỗ track + việc gom neo). Không có nó thì 4c (đo Warp/ACP-118) bỏ.
5. **Máy thuê ở đâu** — Hetzner (AX52 ~€60) như PLAN-108, tách hẳn OVH/Hetzner đang chạy g1.
6. **Bề mặt công khai** — K1 **không** lên `a1.9chain.org` (đề xuất); nếu muốn xem, dùng router + 9Scan tập trỏ vào
   cụm, không đụng danh bạ site.

---

## Nguồn

`PLAN-1000-L1-TEST-2026-09-05.md` · `PLAN-108-L1-LOAD-TEST.md` §2–§6 · `ANALYSIS-CORE-TOWARD-9-BILLION-2026-09-05.md` §3 ·
`ANALYSIS-CORE-DEEP-DIVE-2026-09-05.md` §1 §3 §6 §7 · D-174 · D-178 · D-076 · patch 0005 0015 0024 ·
`upstream/avalanchego`: `utils/constants/network_ids.go:72–109` · `config/flags.go:273` · `config/keys.go:56–79,150,168–176` ·
`staking/tls.go:117` · `wallet/chain/p/wallet/wallet.go:490` · `wallet/chain/p/builder/builder.go:860` ·
`vms/platformvm/txs/convert_subnet_to_l1_tx.go:21,40–44,58` · `vms/platformvm/txs/create_chain_tx.go:19–20` ·
`vms/platformvm/service.go:1010,2081–2088` · `vms/platformvm/validators/manager.go:188–191,196–199` ·
`snow/consensus/snowball/parameters.go:93–106` · `graft/subnet-evm/plugin/evm/config/config.go:54–68,132` ·
`graft/subnet-evm/plugin/evm/config/default_config.go:34–38` · `9chain-a1-tools/create-l1/main.go:34–37,64,81` ·
`9chain-a1-tools/9chain-a1-cli/main.go:309` · `local-net/console/server.mjs:48,985,1130` · `scripts/measure-node-load.sh` ·
`local-net/faucet/load-test.mjs` · `local-net/docker-compose.drill.yml`.
