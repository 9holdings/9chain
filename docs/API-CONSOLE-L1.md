# API console L1 — hợp đồng bàn giao cho `web-home`

> **Mục đích:** để phiên `web-home` làm **P-55** (ký hiệu token), **P-60** (trang "quản trị chain của
> tôi") và **P-62** (màn xem trước + câu ký) **mà không phải đọc `server.mjs`**.
>
> 🔴 **Mọi hình dạng dưới đây được ĐO, không chép từ mã** (`2026-09-04` đêm): phần tạo chain đo trên
> một console tạm chạy đúng `server.mjs` của repo; phần quản trị đo trên **console đang chạy thật**
> (`a1.9chain.org`, PID `2776958`) bằng `GET` và bằng đường **chạy khô** — không lượt nào ghi gì.
>
> ⚠️ **Đọc [`CLAUDE.md`](../CLAUDE.md) trước.** Luật cứng #4: A1 **không đụng** `web/`; tài liệu này
> là thứ A1 giao sang, không phải mã A1 sẽ viết.

---

## 0. Điều phải biết trước khi vẽ một màn hình nào

| Sự thật | Vì sao nó đổi thiết kế |
|---|---|
| **Genesis là BẤT BIẾN** | Không có nút "sửa". Mọi lựa chọn lúc tạo là vĩnh viễn ⇒ **P-62 (màn xem trước + câu ký) là chặn cuối, không phải trang trí** |
| **Mỗi chain chiếm 1 trong 15 chỗ VĨNH VIỄN** | Thu hồi trả lại **chỗ**, không trả lại **tên** và **chainId**. Giao diện phải nói câu đó **trước** nút bấm, không phải sau |
| **Trần thật là 15** (giao thức P2P), `tranGiaoThuc` = 16 | `/api/status` trả cả hai. Hiện `04/09`: **11 chain sống ⇒ còn 4 chỗ** |
| **Token của L1 KHÔNG phải LOVE9** | Đây là toàn bộ lý do P-55 tồn tại. Không cầu, không đổi được |
| **Một thao tác tạo/nâng cấp chạy ~170 s, Cloudflare cắt POST ở ~100 s** | ⇒ **đừng đọc kết quả từ mã HTTP của POST**. Hỏi `/api/progress` |

---

## 1. Xác thực — hai đường, và trang web dùng đường thứ hai

```
Authorization: Bearer <A1_CONSOLE_TOKEN>     ← token VẬN HÀNH (server-to-server, không đưa ra trình duyệt)
```
hoặc **SIWE** (ví ký): `POST /api/siwe/nonce` → ví ký → `POST /api/siwe/login` → cookie phiên.

Thiếu cả hai ⇒ **401**, kèm đúng câu này:

```json
{"error":"not authenticated — use the operator token (Authorization: Bearer <A1_CONSOLE_TOKEN>) or sign in with a wallet via /api/siwe/nonce then /api/siwe/login"}
```

🔴 **Khi đăng nhập bằng ví, console GHI ĐÈ trường `admin` bằng địa chỉ của ví đã ký** (`server.mjs`,
nhánh `ai.kieu === "vi"`). Gửi `admin` khác trong thân yêu cầu **không có tác dụng** — đó là tính năng,
không phải lỗi: chain của ai người đó sở hữu.

⚠️ **Nguồn token đúng là `A1_CONSOLE_TOKEN` trong `~/9chain-a1/console.env` TRÊN SERVER**, không phải
tệp `console-token.txt` cục bộ (tệp đó đã lạc hậu — bẫy 8 `CLAUDE.md`, sửa `04/09`).

---

## 2. `GET /api/status` — mọi rào giao diện cần, lấy từ server chứ đừng chép

Trả về (rút gọn, tên khoá **nguyên văn**):

```jsonc
{
  "tran": 15, "tranGiaoThuc": 16,
  "defaultAdmin": "0x…",
  "chains": [...], "retired": [...],
  "dangNhap": "vanHanh" | "vi", "viDangNhap": "0x…" | null,
  "presets": [{ "id": "standard", "name": "Standard", "desc": "…" }, …],   // 6 preset
  "limits": {
    "gasLimit":  { "min": 12000000, "max": 60000000 },
    "targetGasRatio": 5,                                   // targetGas = gasLimit × 5, TỰ ĐỘNG
    "targetBlockRate": { "min": 1, "max": 10 },            // giây
    "minBaseFee": { "min": "1", "max": "1000000000000" },  // 🔴 CHUỖI (wei, vượt Number)
    "baseFeeChangeDenominator": { "min": 8, "max": 1000 },
    "recipients": { "min": 1, "max": 50 },
    "totalTokens": "9000000000"                            // 🔴 CHUỖI
  },
  "selectablePrecompiles": ["nativeMinter","deployerAllowList","txAllowList","rewardManager"],
  "rewardModes": ["burn","allowFeeRecipients","rewardAddress"]
}
```

🔴 **Đọc rào từ đây, đừng cắm cứng vào TSX.** Ngày `LIMITS` đổi, giao diện đổi theo mà không ai phải nhớ.
🔴 **`minBaseFee` và `totalTokens` là CHUỖI** vì chúng vượt `Number.MAX_SAFE_INTEGER`. Đưa qua `BigInt`,
đừng qua `parseInt` — và đừng `JSON.stringify` một `BigInt`.

Sáu preset: `standard` · `zero-fee` · `high-throughput` · `mintable` · `owner-deploy-only` · `permissioned`.

---

## 3. Tạo chain

### 3.1 `POST /api/preview` — chạy khô, **KHÔNG ghi gì**

Nhận **đúng cùng thân** với `/api/create`, đi **đúng cùng đường mã** (`planChain`), và **không** chạm node,
**không** tiêu tiền, **không** ghi sổ. Đây là thứ P-62 gọi.

**Thân yêu cầu — mọi trường ngoài `name` đều tuỳ chọn:**

```jsonc
{
  "name": "Doc Sample",              // 2–32 ký tự, BẮT BUỘC
  "symbol": "DOCS",                  // 2–8 [A-Z0-9]; vắng ⇒ suy từ tên
  "preset": "standard",              // vắng ⇒ "standard"
  "allocations": [                   // vắng ⇒ 50 000 000 cho ví chủ
    { "address": "0x…", "tokens": "1000000" }
  ],
  "fees": {                          // vắng ⇒ số của preset
    "gasLimit": 24000000, "targetBlockRate": 3,
    "minBaseFee": "25000000000", "baseFeeChangeDenominator": 36
  },
  "precompiles": {                   // vắng ⇒ không bật gì thêm
    "nativeMinter": true, "deployerAllowList": false, "txAllowList": true,
    "rewardManager": "burn" | "allowFeeRecipients" | { "mode": "rewardAddress", "rewardAddress": "0x…" }
  },
  "contracts": true                  // P-59, vắng ⇒ FALSE. Chỉ true/false, không nhận danh sách
}
```

🔴 **`contracts` (P-59) — một ô chọn, không phải nhiều ô.** Bật thì genesis mang thêm ba hợp đồng
(6.761 byte): `Erc20` mẫu · `TokenFactory` (đúc token bằng **một giao dịch**, có `predict()` trả địa chỉ
trước khi tiêu gì) · `Multicall3`. Địa chỉ và số byte đọc từ `/api/status.contractLibrary` — **đừng cắm
cứng**. Gửi một danh sách (`["erc20"]`) bị **từ chối**: `TokenFactory` không có `Erc20` thì clone ra hư
không, nên nó vào cả bộ hoặc không vào.
🔴 Và câu **phải hiện trên màn ký**: `Multicall3` này **tương thích ABI** nhưng **không** trùng byte với bản
chính thống và **không** ở `0xcA11bde0…`. Console đã tự đưa câu đó vào `description.cannot` — hiện nguyên văn,
đừng viết lại nhẹ đi.

**Trả về `200`:**

```jsonc
{
  "preview": true,
  "name": "Doc Sample", "chainId": 9001000000, "admin": "0x…",
  "symbol": "DOCS", "symbolIsFallback": false,       // 🔴 xem 3.3
  "preset": "standard", "presetName": "Standard",
  "options": {                                        // số ĐÃ CHUẨN HOÁ, không phải số người gõ
    "fees": { "gasLimit": 24000000, "targetGas": 120000000, "targetBlockRate": 3,
              "minBaseFee": "25000000000", "baseFeeChangeDenominator": 36 },
    "precompiles": ["nativeMinter","txAllowList","rewardManager"],
    "rewardManager": { "mode": "allowFeeRecipients" },
    "allocations": [{ "address": "0x…", "tokens": "1000000" }, …],
    "totalTokens": "1500000"
  },
  "description": { "facts": [...], "can": [...], "cannot": [...] },   // 🔴 câu để KÝ
  "genesis": { "config": {...}, "alloc": {...}, … }                   // genesis đầy đủ
}
```

🔴 **`description` là văn bản cho P-62, đã viết sẵn, đã kiểm.** Đừng viết lại bằng tay ở TSX — nó suy ra
từ **chính genesis vừa dựng**, nên nó không thể nói sai về chain. Ba nhóm:
- `facts` — chainId, ký hiệu, tổng cung, gas limit và **số giao dịch/giây ước tính**;
- `can` — chủ chain làm được gì (đổi phí, mint, duyệt người gửi, Warp…);
- `cannot` — 🔴 nhóm **phải hiện ngay trên nút ký**. Luôn có hai câu: *"sau khi tạo không đổi được gì
  ngoài các precompile trên"* và *"chain chiếm một trong 15 chỗ vĩnh viễn"*.

**`targetGas` không nhận từ người dùng** — console tự tính `gasLimit × 5`. Hiện nó ở màn xem trước, đừng cho nhập.

### 3.2 `POST /api/create` — TIÊU TIỀN, chiếm một chỗ vĩnh viễn

Cùng thân với `/api/preview`. Chạy ~170 s ⇒ **theo dõi bằng `GET /api/progress`**, đừng chờ POST trả về:

```jsonc
{ "running": false, "kind": "create" | "revoke" | "upgrade", "name": "Lumina Chain",
  "secondsElapsed": 3681,
  "steps": [ { "code": "genesis", "label": "Building genesis", "status": "done", "ms": 0 },
             { "code": "subnet",  "label": "Creating subnet + blockchain on P-Chain", "status": "done", "ms": 12474 },
             { "code": "rpc",     "label": "Waiting for the L1 RPC to answer", "status": "done", "ms": 4 },
             { "code": "node:9chain-a1-node-2", "label": "9chain-a1-node-2", "status": "…" }, … ] }
```

### 3.3 🔴 P-55 — ký hiệu token: luật mà giao diện **phải** theo

| Tình huống | Việc đúng |
|---|---|
| Bản ghi có `symbol` | Dùng nó |
| Bản ghi **không** có `symbol` (chain tạo trước P-54) | **Suy từ tên** (`BBWay Chain → BBWAY`) |
| Bất kỳ tình huống nào | 🔴 **KHÔNG BAO GIỜ rơi về `'LOVE9'`** |

`symbolIsFallback: true` nghĩa là ký hiệu **do console suy ra**, không phải người dùng chọn — phỏng đoán
**không bao giờ** được ghi vào sổ. Chỗ phải sửa: `CreateChainScreen.tsx:401` · `wallet.ts:433`.
`"LOVE9"` bị **từ chối** nếu ai đó thử đặt (xem bảng câu lỗi).

---

## 4. Câu lỗi — **nguyên văn**, để giao diện hiện thẳng thay vì tự viết

Mọi lỗi trả **`400`** với `{ "error": "<câu>" }`. Các câu này viết cho **người dùng cuối** đọc, và mỗi câu
nói **vì sao** chứ không chỉ nói *sai*:

| Vi phạm | Câu console trả |
|---|---|
| tên rỗng | `Name must be 2-32 characters long; this one is 0.` |
| `symbol: "LOVE9"` | `"LOVE9" is reserved — it is the network's own coin. A user L1's native token is separate from LOVE9 and cannot be exchanged for it; giving it that name would tell wallet users they hold LOVE9 when they do not.` |
| `minBaseFee: 0` | `fees.minBaseFee must be at least 1 wei (got 0). Zero passes subnet-evm's Verify() and then refuses every block the chain tries to build (block_gas_cost.go:94) — the chain would be dead at birth.` |
| `gasLimit` ngoài rào | `fees.gasLimit must be between 12,000,000 and 60,000,000 (got 1,000).` |
| `targetBlockRate` ngoài rào | `fees.targetBlockRate must be between 1 and 10 seconds (got 99).` |
| `baseFeeChangeDenominator` ngoài rào | `fees.baseFeeChangeDenominator must be between 8 and 1000 (got 1).` |
| khoá precompile lạ | `precompiles: unknown key "warp" — allowed: nativeMinter, deployerAllowList, txAllowList, rewardManager. subnet-evm would ignore an unknown key in silence, so it is refused here instead.` |
| `rewardManager` mode lạ | `precompiles.rewardManager: unknown mode "nope" — one of burn, allowFeeRecipients, rewardAddress.` |
| preset ≠ `standard` + tuỳ chọn | `Preset "nhanh" cannot be combined with explicit fees/precompiles — one of them would win in silence and the genesis is immutable. Use preset "standard" and write the same choice explicitly, then add your other options.` |
| chủ không nhận gì | `allocations: the owner 0x… receives nothing. Governance is done by transactions and every transaction costs gas — an owner with 0 tokens can never change fees, mint, or approve anyone. Add a line for the owner.` |
| địa chỉ trùng | `allocations: 0x… appears twice (lines 1 and 2). One line per address.` |
| tổng vượt trần | `allocations: total 9,000,000,001 tokens exceeds the ceiling of 9,000,000,000 (the mother network's whole supply).` |
| checksum EIP-55 sai | `… fails the EIP-55 checksum — most likely one character was mistyped or mis-pasted. If you are certain it is right, enter it in all lower case: 0x…` |

🔴 **Địa chỉ viết TOÀN chữ thường được CHẤP NHẬN** và console chuẩn hoá về EIP-55. Đó **không** phải lỗ:
EIP-55 giấu checksum trong **cách viết hoa/thường**, nên một địa chỉ một-kiểu-chữ **không mang checksum để
mà sai**. Chỉ **hoa/thường lẫn lộn** mới bắt buộc khớp. Đừng "sửa" bằng cách bắt buộc checksum ở phía web —
làm thế là từ chối đúng dạng nhiều công cụ phát ra.

---

## 5. Quản trị một L1 đã tạo (P-60)

### 5.1 `GET /api/governance?name=<tên>` — vai trò + precompile, **đo trên chain**

```jsonc
{
  "name": "SBull Chain", "chainId": 9001000008, "admin": "0x1e8c…292C",
  "adminRoles": { "feeManager": "admin" },          // 🔴 ĐO bằng readAllowList TRÊN CHAIN
  "precompiles": {
    "nativeMinter":      { "enabled": false, "since": null,       "everConfigured": false, "pending": null },
    "deployerAllowList": { "enabled": false, "since": null,       "everConfigured": false, "pending": null },
    "txAllowList":       { "enabled": false, "since": null,       "everConfigured": false, "pending": null },
    "rewardManager":     { "enabled": false, "since": null,       "everConfigured": false, "pending": null },
    "feeManager":        { "enabled": true,  "since": 0,          "everConfigured": true,  "pending": null },
    "warp":              { "enabled": true,  "since": 1607144400, "everConfigured": true,  "pending": null }
  },
  "addresses": {
    "deployerAllowList": "0x0200000000000000000000000000000000000000",
    "nativeMinter":      "0x0200000000000000000000000000000000000001",
    "txAllowList":       "0x0200000000000000000000000000000000000002",
    "feeManager":        "0x0200000000000000000000000000000000000003",
    "rewardManager":     "0x0200000000000000000000000000000000000004"
  },
  "upgradable": [...], "upgradeFile": …, "upgrades": [], "previousAdmins": [...],
  "lead": …,
  "now": 1788542079,                                  // đồng hồ của SERVER
  "chainHead": { "number": 1, "timestamp": 1788526073 },   // 🔴 đồng hồ của CHAIN
  "waitingForABlock": ["deployerAllowList"],
  "diskDiffersFromNode": false
}
```

- **`feeManager` và `warp` LUÔN bật** — chúng đến từ khuôn, không chọn được. Giao diện đừng cho tắt.
- **`pending`** ≠ null ⇒ có một nâng cấp **đã lên lịch, chưa tới mốc**. Hiện đồng hồ đếm ngược.

#### 🔴 BA trạng thái, không phải hai — và cái ở giữa có thể kéo dài vô hạn

Precompile kích hoạt trong **block đầu tiên có mốc thời gian đạt tới mốc kích hoạt**, mà subnet-evm **chỉ
dựng block khi có giao dịch**. Trên một L1 **không ai dùng**, đồng hồ treo tường đi qua mốc còn chain
**đứng yên**.

| Trạng thái | Đọc từ đâu | Giao diện phải nói |
|---|---|---|
| chưa lên lịch | `pending: null`, `enabled: false` | *"chưa bật"* |
| **đã lên lịch, CHỜ BLOCK** | `enabled: false` · `pending` ≠ null · tên nằm trong **`waitingForABlock`** | *"đã lên lịch; sẽ có hiệu lực ở block tiếp theo của chain — hãy gửi một giao dịch bất kỳ"* |
| đang sống | `enabled: true` | *"đang bật"*, kèm vai trò trong `adminRoles` |

🔴 **Đừng suy trạng thái từ `now`.** So `chainHead.timestamp` với `pending.at`. Đo thật `04/09 17:14Z`:
đồng hồ server `17:14:39Z`, mốc kích hoạt `17:05:00Z` **đã qua**, nhưng `chainHead` vẫn là **block 1 lúc
`12:47:53Z`** ⇒ precompile **chưa tồn tại**, và hỏi vai trò của nó trả về `0x`. Bản console trước `04/09`
tối suy từ `now` và **trả HTTP 400** trên đúng chain vừa nâng cấp (D-191).

- **`diskDiffersFromNode: true`** = tệp trên đĩa **không phải** tệp các node đang chạy. Không bao giờ là
  trạng thái bình thường — hiện cảnh báo, đừng nuốt. (D-189: một rollout ghi tệp mà **không restart node nào**.)
- **`addresses`** là địa chỉ MetaMask gọi tới. Đây là thứ P-60 cần: mọi nút `setAdmin`/`setEnabled`/
  `setNone`/`setFeeConfig`/`mint` là **giao dịch ví gửi thẳng lên chain con**, **không** qua console.

### 5.2 Nút nào gọi vào đâu (qua MetaMask, không qua console)

| Nút | Precompile | Ghi chú |
|---|---|---|
| Đổi phí | `feeManager` `…0003` | luôn có sẵn |
| Mint thêm token | `nativeMinter` `…0001` | chỉ khi `enabled` |
| Thêm/bớt quyền deploy | `deployerAllowList` `…0000` | |
| Thêm/bớt quyền gửi giao dịch | `txAllowList` `…0002` | |
| Đổi nơi nhận phí | `rewardManager` `…0004` | |
| **Chuyển quyền chủ** | `setAdmin`/`setNone` trên **từng** precompile đang bật | 🔴 xem 5.4 |

### 5.3 `POST /api/upgrade-preview` → `POST /api/upgrade` — bật precompile SAU genesis

Thân: `{ "name": "SBull Chain", "precompile": "deployerAllowList", "action": "enable" | "disable" }`

🔴 **`/api/upgrade` cần `"confirm": "<TÊN CHAIN>"`, KHÔNG phải `true`.** Người bấm phải **gõ lại đúng
tên chain**, kiểu GitHub bắt gõ tên repo trước khi xoá — vì lượt này restart cả 9 validator và đổi luật
của chain tại một mốc **không dời được**. `"confirm": true` bị **từ chối 400**, và câu lỗi in sẵn chuỗi
cần gửi. `/api/transfer-owner` **cùng luật** (`server.mjs:1592` và `:1648`).
*(Tài liệu này ghi `true` cho tới `04/09` — sai, và chỉ lộ ra khi chạy thật một lượt.)*

`upgrade-preview` **chạy khô, không ghi gì**, trả:

```jsonc
{ "preview": true, "name": "…", "chainId": …, "admin": "0x…",
  "activateAt": 1788535680, "activateAtIso": "2026-09-04T15:28:00.000Z",   // now + 15 phút
  "entry": { "contractDeployerAllowListConfig": { "blockTimestamp": …, "adminAddresses": ["0x…"] } },
  "upgradeConfig": { "precompileUpgrades": [ … ] },
  "before": { …trạng thái precompile… }, "after": { … },
  "description": { "facts": [...], "will": [...], "wont": [...] } }
```

🔴 **`description.wont` chứa câu quan trọng nhất của màn này** — nguyên văn:
> *"The timestamp cannot be moved once the file is on the validators; a mistake is undone by a SECOND
> upgrade, never by editing this one."*

Và `facts` nói rõ cái giá vận hành:
> *"Every one of the network's nine validators restarts once, one after another (~5 minutes), and must
> carry the new file before that moment."*

⇒ Giao diện phải nói **~5 phút** và **9 node restart**, không được hiện nút rồi im lặng.

### 5.4 `POST /api/transfer-owner` — sổ đi **SAU** chain

`{ "name": "…", "newAdmin": "0x…", "confirm": "<TÊN CHAIN>" }` — cùng luật gõ-lại-tên như `/api/upgrade`.

🔴 **Thứ tự là bắt buộc và giao diện phải dạy đúng thứ tự:**
1. Chủ **hiện tại** gọi `setAdmin(newAdmin)` trên **mọi precompile đang bật** — bằng MetaMask, không qua console;
2. *rồi mới* gọi `/api/transfer-owner`. Console **đo `readAllowList(newAdmin)` trên chain trước**, chỉ khi
   ví mới đã đủ quyền Admin ở **tất cả** precompile đang bật thì sổ mới đổi `admin`, và giữ `previousAdmins[]`.

Làm ngược lại thì sổ nói dối về chain. Console **từ chối** ghi, đúng như thiết kế.

---

## 6. Ba việc `web-home` còn nợ, và cái nào chặn cái nào

| Mã | Việc | Gọi gì |
|---|---|---|
| **P-55** | ô nhập ký hiệu; `addChain` dùng `symbol` của bản ghi; trang Done nói *"50M này là xăng của chain riêng, không phải LOVE9"*; `/chains/` hiện ký hiệu | mục 3.3 |
| **P-62** | màn xem trước trước nút tạo: `facts` / `can` / `cannot`, **câu ký đặt dưới `cannot`**; ô nhập ba nhóm tuỳ chọn với rào đọc từ `/api/status.limits`; trang Done hiện `options` | `/api/preview` + `/api/status` |
| **P-60** | trang "quản trị chain của tôi": vai trò + precompile, hai màn xem trước, nút gọi precompile qua MetaMask, rồi `transfer-owner` | mục 5 |

**Thứ tự đề nghị: P-55 → P-62 → P-60.** P-55 rẻ nhất và đang **gây nhầm cho người dùng thật ngay lúc này**
(mọi L1 vẫn hiện `LOVE9` trong MetaMask). P-62 là **chặn cuối trước một chỗ vĩnh viễn** nên đáng làm trước
P-60. P-60 to nhất và không ai đang bị chặn vì thiếu nó — chủ chain **đã có** toàn quyền on-chain, chỉ thiếu
giao diện.

---

## 7. Cái mà API **chưa** có — đừng vẽ nút cho nó

- **P-59 — làm MỘT NỬA.** Thư viện **không storage** đã có (`contracts: true`, xem 3.1) và đã đo chạy thật
  trong EVM của subnet-evm. **Chưa có**: Teleporter/registry (lớn, nhạy phiên bản) và multisig. Warp
  precompile + `warp-api-enabled` thì **đã bật sẵn** từ khuôn cho mọi chain.
  ⏳ Việc `web-home`: một ô bật thư viện ở màn tạo chain (đọc `/api/status.contractLibrary` để hiện địa chỉ
  và **số byte nó thêm vào**), và trang Done hiện `options.contracts`.
- **Chưa có lượt nâng cấp THẬT nào chạy trên mạng** (`04/09`: 11 chain, **0 tệp `upgrade.json`** trên đĩa —
  đo bằng `scripts/check-l1-upgrades.mjs`). Đường mã đã có đối chứng, nhưng ca *"gãy ở node thứ k > 1 rồi
  chạy đường lùi"* **chưa ai đo trên mạng thật**. Giao diện đừng hứa điều gì mạnh hơn thế.
- **Đổi tên chain, đổi chainId, sửa phân bổ genesis:** **không tồn tại và sẽ không tồn tại.** Genesis bất biến.
