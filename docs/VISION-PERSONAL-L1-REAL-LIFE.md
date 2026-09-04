# Làm sao để mọi người sở hữu Layer 1 của chính mình — và dùng nó trong đời sống thực

Viết `2026-09-04` theo câu hỏi của David: *"làm sao phục vụ được tầm nhìn mọi người đều sở hữu được blockchain
layer 1 của chính mình và ứng dụng nó vào đời sống thực"* — và theo chỉ dẫn kèm: *"đừng quá dựa vào hiện trạng
testnet hiện nay mà dựa vào gốc là core avalanchego và các công nghệ khác hiện tại."*

Vì thế tài liệu này **không** xuất phát từ trần 15 chain, một máy, hay console track-all — đó là hiện trạng vận
hành của A1, không phải giới hạn của giao thức. Nó xuất phát từ **những gì `avalanchego 1.14.2` (bản trong fork,
có `subnet-evm` và `coreth` ghép vào cùng cây) cho phép**, đọc thẳng từ mã, cộng với công nghệ đã có ngoài
Avalanche. Chỗ nào là giới hạn thật của lõi thì ghi rõ là **giới hạn lõi**; chỗ nào là việc phải xây thì ghi là
**phải xây**.

---

## 0. Câu trả lời ngắn

1. **Lõi Avalanche đã cho phép một người có một Layer 1 của riêng mình — theo đúng nghĩa của giao thức.**
   `ConvertSubnetToL1Tx` chỉ đòi **ít nhất một validator** (`ErrConvertMustIncludeValidators`), và từ chối gỡ
   validator cuối (`errRemovingLastValidator`). Quyền quản lý tập validator nằm trong **một hợp đồng trên chính L1
   đó** (ACP-99 Validator Manager). Validator L1 **không cọc mạng mẹ**, chỉ đồng bộ P-Chain
   (`--partial-sync-primary-network`). Một người, một thiết bị, một chain: **hợp lệ ở tầng lõi**.
2. **"Sở hữu" là năm quyền** — chủ quyền, bền, kiểm được, di động, liên thông — và lõi cung cấp cơ chế cho cả
   năm: khoá + precompile allowlist (chủ quyền), danh tính là khoá (bền), Warp ký bằng BLS của validator (kiểm được,
   liên thông), và mẫu ATProto bên ngoài (di động).
3. **Giới hạn thật của lõi không phải máy, mà là P-Chain**: cấu hình phí validator L1 của A1 đặt **mục tiêu 10.000,
   trần 20.000** validator L1 toàn mạng (`genesis_9chain_a1.go`, cùng con số Fuji), giá **gấp đôi mỗi phút** khi
   vượt mục tiêu. ⇒ Một mạng mẹ ghi được **~10⁴ chain một người** trên P-Chain (pha A). 9Chain có chủ quyền để nâng
   số, nhưng P-Chain vẫn là **một** chain; từ 10⁵ trở đi chain cá nhân phải **đăng ký đệ quy** trên chain cộng
   đồng (pha B) — cùng genesis, cùng VM, chỉ khác nơi ghi sổ. Đây là kiến trúc, không phải hạn chế testnet.
4. **Hiến pháp số đã có nguyên thuỷ trong lõi**: `txallowlist` (AI nào được ký), `deployerallowlist` (ai được đổi
   luật), `nativeminter`, `feemanager`, `rewardmanager`, `gaspricemanager`, `warp` — bảy precompile ghép sẵn trong
   `subnet-evm`. Phần còn lại (hạn mức, ngưỡng hỏi lại, thu hồi, uỷ quyền có hạn) là **hợp đồng** theo chuẩn
   thị trường (ERC-4337/7702, ERC-7715, AP2 mandate) — **phải xây**, không phải phát minh.
5. **Đời sống thực = chain là SỔ QUYỀN VÀ BẰNG CHỨNG, không phải kho dữ liệu.** Trên chain: cam kết, giấy phép,
   biên nhận. Dữ liệu thật ở ngoài, mã hoá, chủ giữ. Kỹ thuật (chain vĩnh viễn) và pháp lý (Luật Bảo vệ dữ liệu cá
   nhân `91/2025`, hiệu lực `01/2026`, có quyền xoá) cùng bắt như vậy.
6. **Ứng dụng đầu tiên: AI đại diện tôi dưới hiến pháp của tôi.** Agent trả hoá đơn trong hạn mức, vượt là hỏi,
   mọi hành động có biên nhận, thu hồi một chạm. Sáu lĩnh vực khác nối vào sau, mỗi cái một việc đo được.
7. **Người thường dùng được khi**: không seed phrase (passkey, ERC-4337/7702), không thấy gas (phí do chain cộng
   đồng tài trợ), tên thay địa chỉ, tiếng Việt trước, tạo sổ một chạm, đổi nhà không mất, mất máy không mất sổ.

---

## 1. "Sở hữu Layer 1 của chính mình" — năm quyền, và cơ chế lõi cho từng quyền

| Quyền | Người thường cảm nhận | Cơ chế | Ở đâu |
|---|---|---|---|
| **Chủ quyền** | *"Không ai, kể cả 9Chain, sửa/xoá/khoá sổ của tôi"* | khoá của tôi là admin của mọi precompile; tập validator do hợp đồng **trên chain tôi** quản; luật ghi trong genesis | lõi: `txallowlist`, `deployerallowlist`, ACP-99 |
| **Bền** | *"Mất điện thoại không mất sổ"* | danh tính = khoá (`staker.key`, `signer.key`, khoá EVM), không phải máy; sao lưu mã hoá; khôi phục xã hội | lõi + **phải xây** (khôi phục) |
| **Kiểm được** | *"Tôi không thể lén sửa quá khứ"* | gốc trạng thái gửi định kỳ bằng **Warp** (ký BLS của validator chain tôi) lên chain cộng đồng; sửa lịch sử ⇒ neo lệch | lõi: `warp` precompile, ACP-118 |
| **Di động** | *"Đổi chỗ chứa sổ mà tên và lịch sử còn nguyên"* | tên → danh tính → máy chủ hiện tại (mẫu ATProto, 46 M người) | ngoài: ATProto DID/PDS — **phải xây** cho 9Chain |
| **Liên thông** | *"Sổ tôi nói chuyện với sổ bạn, với cửa hàng"* | Warp/ICM giữa mọi chain trong mạng; VC/AP2/x402/ERC-8004 ra ngoài | lõi (Warp) + chuẩn ngoài |

Quyền thứ sáu người ta *tưởng* cần — **"chain của tôi phải luôn chạy"** — không cần: Snowman với một validator
không đẻ block rỗng; sổ ngủ khi tôi ngủ. Ai cần *đọc* thì đọc bản neo; AI agent cần *ghi* khi tôi vắng thì chạy ở
máy chủ sổ hoặc hộp của tôi, **khoá vẫn của tôi**.

---

## 2. Lõi `avalanchego 1.14.2` cho gì — đọc từ mã, không từ testnet

| Năng lực | Ở đâu trong lõi | Nghĩa cho "chain của một người" | Giới hạn lõi |
|---|---|---|---|
| **L1 chủ quyền, ≥ 1 validator** | `txs/convert_subnet_to_l1_tx.go:29,61` · `executor/standard_tx_executor.go:63` | một người = một validator = một L1 hợp lệ; không ai gỡ được validator cuối | phải có ≥ 1 |
| **Validator L1 không cọc mạng mẹ, phí liên tục** | `platformvm/validators/fee` · `genesis_9chain_a1.go:104–107` | `MinPrice 1 nLOVE9/s` ≈ 0,0000864 LOVE9/ngày; quỹ trả được cho hàng thế kỷ | **Target 10.000 · Capacity 20.000** validator L1 toàn mạng; vượt mục tiêu giá **gấp đôi mỗi phút** |
| **Đồng bộ một phần mạng mẹ** | `config/flags.go:273` | thiết bị của tôi chỉ giữ P-Chain + chain tôi | báo unhealthy nếu là validator mạng mẹ |
| **Mỗi node track ≤ 16 subnet** | `network/peer/peer.go:39` (D-174) | một thiết bị validate được chain tôi + gia đình + vài cộng đồng | 16 |
| **Simplex (phiếu = chữ ký BLS)** | `subnets/config.md` §Consensus · `snow/engine/common/engine.go` `SimplexHandler` | validator của tôi có thể là **t-of-n thiết bị** (điện thoại + hộp), một cái ngủ vẫn ký | mã mới; **phải đo** |
| **Warp / ICM** | `graft/subnet-evm/precompile/contracts/warp` · ACP-118 | chain tôi gửi thông điệp ký BLS tới chain cộng đồng: **neo** và **liên thông** là native | người nhận phải thấy tập validator chain tôi trên P-Chain (pha A) |
| **Bảy precompile "hiến pháp"** | `graft/subnet-evm/precompile/contracts/{txallowlist, deployerallowlist, nativeminter, feemanager, rewardmanager, gaspricemanager, warp}` | AI nào được ký · ai được đổi luật · ai in token · phí bao nhiêu · phí về đâu | admin là địa chỉ; tổ hợp sai vẫn cho qua (**phải rào ở console**) |
| **Đổi luật sau genesis** | `subnet-evm` `upgrade.json` | chain "lớn lên": bật precompile sau, không cần sinh lại | rollout node |
| **EVM đầy đủ** | `graft/coreth`, `graft/subnet-evm` | MetaMask, ERC-4337/7702 (passkey, tài khoản thông minh), ERC-7715 (uỷ quyền có hạn), mọi thư viện hợp đồng | — |
| **Snowman một validator** | mặc định | finality tức thì; không block rỗng ⇒ chain ngủ khi chủ ngủ | — |

**Đọc bảng:** thứ duy nhất lõi *chặn* là **số validator L1 trên một P-Chain** (20.000). Mọi thứ khác — máy, phí,
luật, liên thông — lõi **đã cho**. Đây là lý do mô hình phải **đệ quy** chứ không phải "làm P-Chain to hơn".

### 2b. Công nghệ ngoài Avalanche, đã có `2026`, dùng như hàng có sẵn

| Cần cho | Công nghệ | Trạng thái | 9Chain làm gì |
|---|---|---|---|
| Không seed phrase, ký bằng vân tay | passkey/WebAuthn + ERC-4337/7702 (40 M tài khoản thông minh) | phổ biến | hợp đồng ví cài sẵn trong genesis sổ |
| AI được phép làm gì | AP2 mandate (Google + 60 đối tác), ERC-7715 uỷ quyền có phạm vi, session key | 2025–2026 | hợp đồng hiến pháp **nói** đúng các chuẩn này |
| AI trả tiền cho dịch vụ | x402 (HTTP 402, 165 M giao dịch agent) | sống | agent của sổ trả bằng x402 |
| Danh tính agent, uy tín | ERC-8004 (ba sổ đăng ký) | draft, có triển khai | sổ cá nhân là nơi lưu |
| Giấy tờ do người khác cấp | W3C Verifiable Credentials; EU bắt mọi nước có ví danh tính cuối `2026` (eIDAS 2.0) | đang triển khai | sổ VC trong genesis; VNeID **không thay** |
| Đổi nhà không mất danh tính | AT Protocol (DID, kho ký Merkle, 1.640 PDS / 46 M người) | sống | mẫu cho máy chủ sổ và di động |
| Kiểm không cần chạy lại | ZK cho khối EVM < 1 ¢, < 10 s (Ethproofs); fraud proof | 2026 | chữ ký + neo trước, ZK sau |
| Validator nhiều thiết bị | DVT Obol/SSV trên BLS12-381 — **cùng đường cong** `signer.key` của avalanchego | sống ở Ethereum | dùng cho Simplex |

---

## 3. "Chain của tôi" — hình dạng cụ thể, và hai pha

```
genesis (subnet-evm)
  tên            : david.9s-union.love9      (pha B: tên đệ quy; pha A: thêm chainId trong dải thế hệ)
  alloc          : token riêng (ký hiệu riêng), địa chỉ tôi + địa chỉ từng agent
  txallowlist    : { khoá tôi, agent-1, agent-2 }        ← AI nào được ký            (lõi)
  deployerallowlist : { khoá tôi }                       ← ai được đổi luật           (lõi)
  nativeminter   : { khoá tôi } hoặc tắt                  ← ai in token                (lõi)
  feemanager     : tôi                                    ← phí = 0 hoặc tuỳ           (lõi)
  warp           : bật                                    ← neo + liên thông           (lõi)
  cài sẵn        : ví thông minh (4337/7702, passkey) · HIẾN PHÁP (hạn mức/ngày, ngưỡng hỏi lại, thu hồi,
                   uỷ quyền có hạn ERC-7715, nói AP2 mandate) · NEO (Warp tới chain cộng đồng) · sổ VC   (phải xây)
validator       : 1 thiết bị của tôi (Snowman) hoặc t-of-n thiết bị (Simplex, phải đo); hoặc máy chủ sổ hộ
neo             : mỗi giờ, gốc trạng thái + số khối; chain cộng đồng gộp Merkle 10⁵ sổ / 1 giao dịch
kiểm            : chữ ký khối + neo → fraud proof → ZK khi rẻ
```

| | **Pha A — L1 trên P-Chain** | **Pha B — đăng ký trên chain cộng đồng** |
|---|---|---|
| Ai | ~10⁴ người đầu mỗi mạng mẹ | 10⁵ → 10⁹ |
| Ghi sổ ở | P-Chain (`ConvertSubnetToL1Tx`, PoA, chủ = tôi) | hợp đồng đăng ký trên chain cộng đồng (**phải xây**) |
| Validator | 1–3 thiết bị của tôi, không cọc mạng mẹ | như A; hoặc máy chủ sổ hộ, khoá của tôi |
| Neo | **Warp native**: chain cộng đồng kiểm chữ ký BLS của validator tôi qua P-Chain | chữ ký khoá tôi đã đăng ký trên chain cộng đồng (Warp không thấy tôi trên P-Chain) |
| Phí | 1 nLOVE9/s, quỹ trả | 0 trên P-Chain; phí neo do chain cộng đồng tài trợ |
| Trần | 20.000 validator L1 (lõi) | không trần từ mạng mẹ |
| Lớn lên | — | khi ≥ 5 cụm validator ký cam kết ⇒ `ConvertSubnetToL1Tx` ⇒ thành chain cộng đồng ACP-77, **tên và lịch sử giữ** |

Cùng genesis, cùng VM, cùng app. Người dùng **không chọn pha**; hệ thống chọn theo chỗ còn trên P-Chain và theo
chain cộng đồng họ thuộc về. Đây là chỗ mô hình ba tầng khớp với vật lý của lõi: **P-Chain ghi 10⁴, chain cộng đồng
ghi 10⁵ dưới nó**.

---

## 4. Đời sống thực — chain là sổ quyền và bằng chứng, không phải kho dữ liệu

Nguyên tắc cứng: **trên chain chỉ có cam kết (hash), giấy phép (ai được làm gì), biên nhận (đã làm gì).** Dữ liệu
thật (ảnh, bệnh án, hợp đồng, tin nhắn) ở ngoài, mã hoá, chủ giữ khoá. Vì chain vĩnh viễn, và vì Luật `91/2025`
cho người dân quyền **xoá** và **rút đồng ý** — dữ liệu phải xoá được. Đồng ý theo luật phải **kiểm chứng được**
(ai, lúc nào, nội dung gì) — đó **đúng là** một biên nhận ký trên sổ. *(Hash của dữ liệu cá nhân có bị coi là dữ
liệu cá nhân không: cần ý kiến pháp lý; phòng bằng hash có muối, xoá muối = xoá.)*

| Lĩnh vực | Bối cảnh `2026` | Lên sổ cái gì | Việc đầu tiên, đo được |
|---|---|---|---|
| **AI đại diện tôi** | agent bắt đầu trả tiền, đặt dịch vụ; chưa ai có "hiến pháp" cho nó | giấy phép từng agent (AP2 mandate), hạn mức, ngưỡng hỏi lại, thu hồi; **biên nhận mọi hành động** | agent trả điện/nước ≤ 500 k/tháng; giao dịch vượt hạn ⇒ **hợp đồng từ chối, hỏi người** |
| **Mua sắm, tiền** | biên lai điện tử bắt buộc ở VN từ `01/01/2027`; x402 cho agent | biên nhận **người bán ký** → sổ người mua; cashback là bằng chứng; agent trả bằng x402 | một cửa hàng thật ký biên nhận lên sổ khách; khách trình ở nơi khác |
| **Danh tính, giấy tờ** | VNeID của nhà nước; EU: ví danh tính bắt buộc cuối `2026`, VC là xương sống | **không thay VNeID**; sổ giữ VC người khác cấp (bằng, chứng chỉ, hợp đồng, thành viên); trình **có chọn lọc** | một cộng đồng cấp VC thành viên; bên thứ ba kiểm không cần hỏi lại |
| **Sức khoẻ** | luật đòi đồng ý kiểm chứng được; bệnh án rải rác | **sổ đồng ý**: ai đọc gì, tới khi nào; nhật ký truy cập ký | phòng khám đọc với đồng ý 24 h; hết hạn ⇒ từ chối |
| **Học, nghề, uy tín** | bằng giấy, CV tự khai | portfolio ký, chứng chỉ VC, đánh giá từ người thật; ERC-8004 cho agent | một khoá học cấp VC; nhà tuyển dụng kiểm không cần gọi trường |
| **Gia đình, thừa kế** | khoá mất là mất; di chúc giấy | **chain gia đình** (một L1 nhỏ, ≤ 16/thiết bị đủ chỗ); khôi phục xã hội 3/5; di chúc = khoá thời gian + người thi hành | một người "mất máy", khôi phục trong 24 h |
| **Cộng đồng, hội, HTX** | Zalo + sổ tay + tin nhau | chain cộng đồng: thành viên, quỹ, biểu quyết; mỗi thành viên một sổ dưới nó | 100 thành viên, một biểu quyết, một quỹ có sổ |

### Một ngày với sổ cá nhân (2028)

06:30 — agent của Lan trả tiền điện `412 k` từ ví hạn mức; biên nhận vào sổ `lan.9s-union.love9`. 08:00 — quán
cà phê ký biên nhận lên sổ Lan; cashback là bằng chứng trên chain quán. 10:00 — agent định đặt vé máy bay
`3,2 triệu`, **vượt hạn mức**: hợp đồng hiến pháp từ chối, điện thoại hỏi, Lan gật bằng vân tay. 14:00 — phòng
khám xin đọc kết quả; Lan cấp đồng ý 24 giờ; sổ ghi ai đọc lúc nào. 18:00 — Lan trình VC "thành viên" để vào sự
kiện, không lộ số điện thoại. 23:00 — sổ neo gốc trạng thái lên chain cộng đồng bằng Warp; Lan ngủ, chain ngủ.
**Không lúc nào Lan thấy chữ "blockchain", "gas", hay một địa chỉ 0x.**

---

## 5. Điều kiện để người thường dùng được — "crypto hôm nay → phải thành"

| Crypto hôm nay | Phải thành | Công nghệ có sẵn |
|---|---|---|
| seed phrase 24 từ | **không có gì để chép**: passkey + Secure Enclave; khôi phục xã hội 3/5 | ERC-4337/7702, WebAuthn |
| gas, faucet | **không thấy gas**: token riêng trong sổ; `feemanager` đặt 0; phí neo do chain cộng đồng tài trợ | precompile lõi + paymaster |
| địa chỉ `0x…` | **tên**: `lan.9s-union.love9` | sổ tên đệ quy (**phải xây**) |
| tiếng Anh | **tiếng Việt trước**, người dịch | — |
| tạo chain = việc kỹ thuật | **tạo sổ một chạm**, tức thì (pha B), lên P-Chain ngầm khi có chỗ (pha A) | máy chủ sổ + hợp đồng đăng ký (**phải xây**) |
| ví hiện token lạ | ký hiệu riêng, câu "đây là xăng sổ của bạn" | — |
| mất máy = mất tất cả | **mất máy không mất sổ**: sao lưu mã hoá tự động, khoá vẫn của người | mẫu ATProto |
| ví + explorer + console là nhiều trang | **một app**: ví · bảng điều khiển agent · xem sổ · trình VC | — |

Thước đo duy nhất: **một người 60 tuổi tạo sổ, cấp quyền cho agent, và thu hồi nó — không ai đứng cạnh.**

---

## 6. Phải xây gì, theo thứ tự — vì lõi đã cho phần lớn

| # | Phải xây | Dựa trên | Điều kiện qua |
|---|---|---|---|
| 1 | **Mẫu genesis sổ cá nhân** (bảy precompile + ví thông minh + hiến pháp + neo + sổ VC) | subnet-evm, ERC-4337/7702, ERC-7715 | sổ của một người thật; agent thật trả một hoá đơn thật; hiến pháp **từ chối đúng một lần** |
| 2 | **Hợp đồng neo + máy chủ sổ** (nhận neo, gộp Merkle, giữ bản mã hoá, phục vụ đọc khi chủ vắng) | Warp, mẫu ATProto PDS | sửa lịch sử ở sổ ⇒ neo lệch ⇒ phát hiện từ ngoài |
| 3 | **Đường sinh L1 pha A** (ConvertSubnetToL1Tx + PoA Validator Manager, 1 validator = thiết bị người dùng) | ACP-77/99, `--partial-sync` | chain một người sống với 0 node của 9Chain; phí đọc được trên P-Chain |
| 4 | **Hợp đồng đăng ký đệ quy** trên chain cộng đồng (pha B) + sổ tên đệ quy | Warp, hợp đồng | 100 sổ dưới một chain cộng đồng; P-Chain không đổi |
| 5 | **Khôi phục xã hội + sao lưu mã hoá** | ví thông minh, máy chủ sổ | mất máy ⇒ khôi phục trong 24 h |
| 6 | **App điện thoại** (ví, agent, sổ, VC) | passkey, W3C VC | người 60 tuổi tự làm |
| 7 | **Validator nhiều thiết bị** (Simplex + DVT) | Simplex, BLS12-381 | tắt một thiết bị, sổ vẫn ký |
| 8 | **Chain lớn lên** (pha B → chain cộng đồng ACP-77, tên giữ) | ACP-77 | một sổ thành chain cộng đồng, lịch sử liền |

Mục 1–2 là **toàn bộ sản phẩm** đối với người dùng đầu tiên; 3–8 là mở rộng. Không mục nào cần sửa lõi Avalanche.

---

## 7. Cái không làm, và rủi ro

| Không làm | Vì sao |
|---|---|
| Đưa dữ liệu cá nhân lên chain | vĩnh viễn ≠ quyền xoá (`91/2025`) |
| Thay VNeID / tự làm KYC | nhà nước làm; sổ giữ VC do người khác cấp |
| Hứa "chain của bạn chạy mãi, ai cũng validate" | không đúng, không cần |
| Làm P-Chain "to hơn" để ghi hàng tỷ chain | lõi nói 20.000; đệ quy là câu trả lời, không phải tham số |
| Bắt người dùng hiểu chain/gas/validator | thất bại ở người thứ 11 |
| Sửa lõi Avalanche cho tầng 2 | mọi thứ cần đã có; sửa lõi là gánh rebase mỗi năm |

| Rủi ro | Dấu hiệu | Chặn |
|---|---|---|
| **Sổ rỗng** | sổ hoạt động hàng tuần < 30 % sau 90 ngày | bắt đầu từ **ứng dụng**, không từ "tạo chain" |
| **Agent làm bậy** | biên nhận bất thường | hiến pháp là hợp đồng, không phải prompt; mọi hành động là giao dịch ký |
| **Tổ hợp precompile chết chain lúc sinh** | `minBaseFee 0`, allowlist không chủ | rào ở console bằng mã (mốc `L1-CUSTOM` đã ghi) |
| **Pháp lý dữ liệu** | ý kiến pháp lý | cam kết hash có muối + dữ liệu ngoài |
| **Mất khoá** | một người mất máy | khôi phục xã hội **trước** người thứ 11 |
| **Simplex chưa chín** | chain tập đứng khi độ trễ cao | Snowman một validator là mặc định; Simplex là nâng cấp |

---

## 8. Một câu kết

Lõi Avalanche hôm nay **đã cho phép** một người có một Layer 1 thật của riêng mình — một validator, luật riêng,
Warp để nói chuyện — và giới hạn duy nhất nó đặt là **hai vạn chỗ trên một P-Chain**, thứ được giải bằng đệ quy chứ
không bằng máy to hơn. Phần **phải xây** không nằm ở tầng đồng thuận; nó nằm ở **hợp đồng hiến pháp, hợp đồng neo,
máy chủ sổ, và một app không có chữ "blockchain"**. Bước tiếp theo vì thế là **một sổ thật cho một người thật, với
một agent thật, trả một hoá đơn thật, và bị từ chối đúng một lần.**

---

## Nguồn (đọc `2026-09-04`)

Lõi (`upstream/avalanchego` `1.14.2`): `vms/platformvm/txs/convert_subnet_to_l1_tx.go:29,61` ·
`vms/platformvm/txs/executor/standard_tx_executor.go:63,1121` · `genesis/genesis_9chain_a1.go:95–107` ·
`config/flags.go:113–116,273` · `network/peer/peer.go:39` · `subnets/config.md` §Consensus Config ·
`snow/engine/common/engine.go:433` · `graft/subnet-evm/precompile/contracts/*` · `graft/coreth`.

Nội bộ: `PROPOSAL-FREE-L1-DISTRIBUTED-VALIDATORS.md` §8 · `ANALYSIS-WORLD-EVIDENCE-FREE-L1.md` §1c, §2 ·
`ANALYSIS-MOBILE-VALIDATORS.md` §3 · `ROADMAP-2026-2029.md` · `PROGRESS.md` mốc `L1-CUSTOM`.

Thế giới: [ACP-77](https://github.com/avalanche-foundation/ACPs/blob/main/ACPs/77-reinventing-subnets/README.md) ·
[ava-labs/Simplex](https://github.com/ava-labs/Simplex) ·
[Luật Bảo vệ dữ liệu cá nhân 91/2025 (DFDL)](https://www.dfdl.com/insights/legal-and-tax-updates/vietnam-personal-data-protection-2026-what-foreign-organizations-need-to-know/) ·
[PDPL tổng quan](https://www.vietnam-briefing.com/doing-business-guide/vietnam/company-establishment/vietnam-personal-data-privacy-law) ·
[VNeID](https://en.wikipedia.org/wiki/VNeID) · [Hoá đơn điện tử VN 2026–2027](https://www.fonoa.com/resources/blog/official-mandatory-application-of-e-invoices-in-vietnam) ·
[EU Digital Identity Wallet](https://en.wikipedia.org/wiki/EU_Digital_Identity_Wallet) · [eIDAS 2.0 mốc](https://verycreatives.com/blog/eidas-2-explained) ·
[AP2, x402](https://www.bitontree.com/agentic-commerce-ai-agents-payments-ap2-x402) · [Ethproofs](https://hackmd.io/@willcorcoran/S1A840ZMZg) ·
[DVT overview](https://p2p.org/economy/distributed-validator-technology-institutional-operators/).
