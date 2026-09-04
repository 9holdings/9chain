# Phân tích lần hai — "ai cũng có blockchain riêng" đối chiếu với số liệu thế giới `2026`

Viết `2026-09-04` theo yêu cầu của David: *"thu thập thêm thông tin, dữ liệu từ các dự án khác trên thế
giới để phân tích lại chuyên sâu một lần nữa."* Bản một: `PROPOSAL-FREE-L1-DISTRIBUTED-VALIDATORS.md`
(ba mô hình, mô hình ba tầng). Bản này **kiểm từng giả định của bản một bằng số của người khác**, và
đổi những chỗ số liệu bác. Nguồn ở cuối; số nào nguồn mâu thuẫn thì ghi cả hai.

---

## 0. Bốn kết luận đã đổi hoặc chắc hơn sau khi đọc thế giới

| # | Bản một nói | Thế giới nói | Kết luận mới |
|---|---|---|---|
| 1 | P-Chain chịu ~10⁴–10⁶ L1, con số "cần đo" | **Avalanche tự thiết kế ACP-77 quanh mục tiêu 10.000 validator L1 toàn mạng** (trần 20.000, phí nhân đôi mỗi ~24 h khi vượt). Sau 20 tháng Etna: **50–69 L1**, mỗi L1 8–21 validator | Tầng 1 của 9Chain ở cỡ **~2.000 chain × 5 validator mỗi thế hệ** là trong thiết kế của giao thức; **8 tỷ cách 6 bậc** — tầng 2 là bắt buộc, không phải lựa chọn |
| 2 | Chain cá nhân = sổ ký, neo, không đồng thuận — chưa có tiền lệ | **AT Protocol đã chạy đúng hình đó ở 46 triệu người**: mỗi người một kho dữ liệu ký Merkle, DID, kiểm bằng chữ ký không cần đồng thuận, **1.640 máy chủ sống / 35.500 máy chủ độc lập từng có** | Tầng 2 có tiền lệ ở 10⁷ người và 10³ máy chủ. Câu hỏi còn lại là **neo + bằng chứng**, không phải "có làm được không" |
| 3 | Rào chống rác = cam kết validator, ngủ đông thay vì xoá | **Chain không có cộng đồng chết hàng loạt**: 2026 Swellchain, Silicon (kẹt ~9,75 M USD), Zero Network, Kinto đóng; 21Shares: *"phần lớn L2 không sống qua 2026"*; Cosmos ICS sau 3 năm còn **3** chain thuê bảo mật | Rào cam kết là đúng, và **phải có luật rút lui**: L2 đóng cửa kẹt tiền người dùng, ngủ đông của 9Chain phải giữ dữ liệu và đường rút |
| 4 | Người ta chạy node cho người khác vì có đi có lại, thưởng, uy tín — chưa có số | **DePIN 2 triệu node sống**, Helium 371 k hotspot sống; **Bitcoin 15–18 k node chạy KHÔNG thưởng**; Ethereum 1,03 M validator, solo ~5,4 % stake; **DVT** (SSV 1.800 operator, 12 % ETH stake) chia một validator cho nhiều máy gia đình | Có bằng chứng ở 10⁴–10⁶ người. Và **DVT là mảnh còn thiếu**: một chỗ validator = cụm 4 máy gia đình, chịu được 1 máy rớt ⇒ giải bài NAT/uptime của khách đầu tiên |

---

## 1. Bảng số thế giới — dùng làm mốc, không dùng làm mục tiêu

### 1a. "Multi-L1" ở các hệ sinh thái, `2026`

| Hệ | Chain sống | Validator mỗi chain | Giá một chain / tháng | Mô hình validator | Ghi chú |
|---|---|---|---|---|---|
| **Avalanche L1** | 50–69 | Beam 21 · Dexalot 21 · GUNZ 12 · Lamina1 8; khuyến nghị ≥ 5 | **1,33 AVAX/validator** (512 nAVAX/s, mục tiêu 10 k validator), cộng máy | chủ chain tự chọn (ACP-77), chỉ đồng bộ P-Chain | trước Etna: cọc 2.000 AVAX/validator; 1.300–1.400 validator mạng mẹ |
| **Ethereum L2** | 73 rollup (L2BEAT), 34 OP-chain Superchain | 1 sequencer | Conduit: **$36.000/năm** mainnet + DA; testnet $50/tháng; chia 7,5 % doanh thu | một người ghi + bằng chứng + DA | 2 chain giữ 77 % giá trị; "vách đá grant" giết chain tầng giữa |
| **Saga chainlet** | "500+ dự án", sức chứa 1.000 | tập con ngẫu nhiên đủ 70 % stake | **~$500/tháng**, mục tiêu < $100 | bể validator chung, lịch ngẫu nhiên, đấu giá "ghế nhạc" | gần mô hình M2 nhất; giá = giá đấu × số validator |
| **Cosmos ICS** | **3** consumer chain (Neutron, Stride, Chihuahua thử) | toàn bộ hoặc top-N của Hub | phần thưởng chia cho ~180 validator Hub | thuê bảo mật của mạng mẹ | 115+ chain IBC tự chạy validator riêng; **ít ai thuê** |
| **Polkadot** | 37 parachain sống, 52 core | validator của relay (chung) | coretime sàn 10 DOT, từng bị hét 200 DOT (~$15 k) | bảo mật chung theo lõi | JAM testnet 43 đội, đề xuất mainnet H2/2026 |
| **Dymension / Initia** | "hàng chục" RollApp / thiết kế cho "hàng nghìn" | 1 sequencer | — | rollup trên hub | mới, số nhỏ |
| **9Chain A1 hôm nay** | 6 L1 | 9 (mọi node) | **~€3–5 cho 5 validator** trên node dùng chung (D-178) | mọi node track mọi chain, trần 15 | rẻ hơn thị trường 20–100× **vì** dùng chung node — đó là lợi thế duy nhất cần giữ |

Đọc bảng: **không hệ nào vượt ba chữ số chain sống** sau nhiều năm, kể cả hệ có công nghệ tốt nhất.
Cái chặn không phải kỹ thuật — Avalanche thiết kế cho 10 k validator, Saga cho 1.000 chain, Initia cho
"hàng nghìn" — mà là **mỗi chain cần một lý do và một cộng đồng**, và số cộng đồng thật là hữu hạn.

### 1b. Người thường có chạy hạ tầng không?

| Bằng chứng | Số | Có thưởng? |
|---|---|---|
| Bitcoin node đầy đủ | 15–18 k node tới được (một mốc 9/2026 báo 71 k), ước 100–350 k ẩn | **Không** — chạy vì tự chủ |
| Ethereum node thực thi | 14.339 (Etherscan, đầu 2026) | không trực tiếp |
| Ethereum validator | ~1,03 M validator; solo ~5,4 % stake; DVT-lite của EF cho 72 k ETH bằng Docker | có (staking) |
| DVT (SSV) | 4,3 M ETH, 1.800 operator, ~12 % ETH stake; Lido 17.124 validator DVT | có |
| Helium | 371 k hotspot sống (5/2026), 93 k hotspot di động Mỹ, doanh thu $12 M/quý | có (token) |
| DePIN nói chung | > 2 M node sống, vốn hoá $15 B | có |
| AT Protocol PDS | 1.640 máy chủ sống, 35,5 k từng có, cho 46 M người | **Không** — chạy để sở hữu dữ liệu |
| Node trên ARM | Raspberry Pi 5 16 GB chạy được node Ethereum; điện < $2/tháng | — |

Đọc bảng: ở mức **10⁴ người** thì "chạy vì tự chủ" là đủ (Bitcoin, ATProto); ở mức **10⁵–10⁶** cần
thưởng có thật (Helium, DePIN). Ethereum cho một số quan trọng khác: **solo staker chỉ 5,4 %** dù thưởng
tốt — phần mềm khó, vốn 32 ETH, và bẫy vận hành. **DVT** ra đời để chữa đúng điều đó.

### 1c. Kỷ nguyên AI — thế giới đã hội tụ về cùng bộ nguyên thuỷ

| Chuẩn | Là gì | Trạng thái `2026` |
|---|---|---|
| **AP2** (Google + 60 đối tác: Mastercard, PayPal, Coinbase, MetaMask, Ethereum Foundation) | **Intent Mandate** (ý định + giới hạn giá, giờ) và **Cart Mandate** (giỏ đã duyệt), ký bằng Verifiable Credential, dấu vết không chối được từ ý định → giỏ → thanh toán | công bố 9/2025, mở mã |
| **x402** (Coinbase) | HTTP 402: agent trả stablecoin cho API, không tài khoản | **480 k agent sống, 165 M giao dịch, $50 M** (6/2026) |
| **ERC-8004** | ba sổ đăng ký on-chain cho agent: danh tính · uy tín · xác thực; mở rộng A2A của Google | Draft; triển khai tham chiếu trên Base, Linea, Hedera testnet |
| **ERC-7715 / 7710** | ví cấp **quyền có phạm vi, có hạn** cho ứng dụng/agent; hợp đồng uỷ quyền | đang vào ví |
| **ERC-4337 / EIP-7702** | tài khoản thông minh: **40 M tài khoản, 100 M UserOperation**; 7702 sống từ 5/2025 | phổ biến |
| Session key (ERC-7579 smartsessions, ZeroDev, Alchemy, Safe) | khoá phụ với quyền giới hạn cho từng agent | phổ biến |

Đọc bảng: **"hiến pháp số" trong tuyên ngôn đã có ngôn ngữ chung của thị trường** — mandate, quyền
có phạm vi, sổ danh tính agent, dấu vết ký. 9Chain **không nên phát minh chuẩn**; chain cá nhân là
**nơi lưu và thi hành** các mandate/quyền đó dưới khoá của người, nói đúng ngôn ngữ đó để AI của người
này giao dịch được với AI của người kia.

### 1d. Hai công nghệ làm tầng 2 khả thi về tiền

| Công nghệ | Số `2026` | Nghĩa cho chain cá nhân |
|---|---|---|
| **Bằng chứng ZK cho cả khối Ethereum** | **3,54 cent/bằng chứng** (12/2025, giảm > 10× trong năm); 99 % khối chứng minh < 12 s bằng 24–64 GPU 5090 | một khối chain cá nhân nhỏ hơn khối Ethereum hàng nghìn lần ⇒ **kiểm bằng bằng chứng rẻ hơn kiểm bằng sao chép** |
| **Tính sẵn có dữ liệu** | Celestia $0,07–0,81/MB (nguồn lệch), EigenDA ~$730/năm cho 100 MB/ngày, blob Ethereum ~$3,8/MB | chain cá nhân 1 MB/tháng ⇒ **< $1/năm** để neo ra ngoài |

---

## 2. Kiểm lại từng phần của mô hình ba tầng

### Tầng 0 — mạng mẹ: giữ nhỏ là đúng, và có số để đặt trần

ACP-77 cho 9Chain hai nút vặn mà bản một chưa nói: **mục tiêu validator L1** (Avalanche: 10.000, trần
20.000) và **giá sàn** (512 nAVAX/s). 9Chain đặt mục tiêu của mình = **công bố sức chứa tầng 1**:
`mục tiêu / V` chain. Với 10.000 và `V = 5` ⇒ **2.000 chain cộng đồng** mỗi thế hệ; muốn hơn thì nâng mục
tiêu và chứng minh P-Chain chịu được (đo, không hứa).

Cảnh báo từ Cosmos: Hub có ~180 validator và **chỉ 3 chain** thuê bảo mật sau 3 năm — validator lớn
không muốn chạy chain lạ vì phần thưởng nhỏ so với công. **Mạng mẹ đừng bán bảo mật**; nó bán **sổ đăng ký
+ neo + liên thông**, đúng như bản một.

### Tầng 1 — chain cộng đồng: ba điều thế giới bắt phải thêm

1. **Luật rút lui trước khi mở cửa.** Silicon đóng với ~9,75 M USD còn trên chain, Swellchain cho 3 tháng
   rút. 9Chain: ngủ đông **giữ dữ liệu, giữ RPC chỉ đọc, giữ đường rút tài sản về C-Chain** qua Warp; xoá
   là **không bao giờ**. Đây là luật kinh tế, viết vào console như luật `MAX_L1`.
2. **Chỗ validator = cụm DVT, không phải một máy.** Khách đầu tiên của A1 mất danh tính và ngồi sau NAT
   (D-180/181). Ethereum chữa đúng bệnh đó bằng DVT: một khoá validator chia cho 4–7 máy, ngưỡng chữ ký,
   một máy rớt không mất uptime. Với ACP-77, "validator" của chain con là **BLS key + weight** — chia BLS
   bằng ngưỡng là việc đã có (Obol/SSV cho BLS12-381, cùng đường cong avalanchego dùng). ⇒ **Hộp node giai
   đoạn 2 nên là hộp DVT**: 4 người bạn = 1 validator; NAT, mất điện, đổi máy đều không giết chỗ.
3. **Giá phải ở mức Saga muốn tới, không phải mức Conduit.** Saga $500 → mục tiêu < $100/chain/tháng;
   Conduit $3.000/tháng. 9Chain đo được **€3–5** cho 5 validator trên node dùng chung. **Giữ được số đó
   chỉ khi node dùng chung** (mỗi node 15 chain). Lịch ngẫu nhiên tập con của Saga (đủ 70 % stake) là bản
   có sẵn của "phân công ≤ 15 chain/node" — mượn thiết kế, không mượn giá.

### Tầng 2 — chain cá nhân: ATProto là bản mẫu, thiếu đúng hai thứ

AT Protocol chứng minh ở 46 M người: mỗi người một kho ký Merkle, DID trỏ máy chủ, chuyển máy chủ không
mất danh tính, kiểm bằng chữ ký. Nó **thiếu hai thứ** mà tuyên ngôn cần và blockchain có:

| Thiếu ở ATProto | 9Chain thêm | Bằng cách |
|---|---|---|
| **Không có neo ra ngoài** ⇒ chủ (hoặc máy chủ) viết lại lịch sử được mà không lộ | gốc kho ký được neo định kỳ lên chain cộng đồng | gộp Merkle: một giao dịch neo 10⁵ gốc; DA < $1/năm/người |
| **Không thi hành luật** ⇒ kho chỉ lưu, không "từ chối" một hành động của agent | hiến pháp là **hợp đồng** trên sổ cá nhân: allowlist, hạn mức, ngưỡng hỏi lại, thu hồi | mandate AP2/VC là **đầu vào**, hợp đồng là **người gác**, khối ký là **bằng chứng** |

Và một thứ ATProto có mà bản một chưa nhấn đủ: **1.640 máy chủ cho 46 M người**. Tầng 2 không cần 8 tỷ
máy; cần **10³–10⁵ người/ tổ chức chạy "máy chủ sổ cá nhân"** cho người khác (như PDS), còn **khoá vẫn
của từng người**. Chain cộng đồng tầng 1 chính là nơi tự nhiên để chạy máy chủ đó cho thành viên của nó.

---

## 3. Kiến trúc đề xuất — bản hai, đã sửa theo số liệu

```
Tầng 0  9Chain mạng mẹ           ~10–100 node · ACP-77 mục tiêu 10 k validator L1 (công bố = 2.000 chain × 5)
                                 bán: sổ tên đệ quy · neo · Warp · quỹ thưởng — KHÔNG bán bảo mật

Tầng 1  chain cộng đồng          ≤ 2.000/thế hệ · ≥ 5 validator, mỗi validator = cụm DVT 4 máy gia đình
                                 sinh khi ≥ 5 cụm ký cam kết · nhà trẻ 30 ngày · ngủ đông có đường rút
                                 mỗi chain = máy chủ sổ cá nhân + sổ đăng ký cho tầng 2

Tầng 2  sổ cá nhân               kho ký Merkle theo mẫu ATProto + hợp đồng hiến pháp + neo gộp lên tầng 1
                                 nói AP2 mandate · ERC-8004 · ERC-7715 · x402 để AI-của-tôi ↔ AI-của-bạn
                                 kiểm bằng bằng chứng (ZK khi rẻ, chữ ký + fraud proof trước đó)
```

Thay đổi so với bản một, có dẫn chứng:

| Đổi | Vì số nào |
|---|---|
| Trần tầng 1 **công bố** = mục tiêu ACP-77 / V | Avalanche: 10 k mục tiêu, 20 k trần, phí nhân đôi/24 h |
| Validator = **cụm DVT**, không phải một máy | solo staker 5,4 %; SSV 12 % stake; khách A1 mất danh tính + NAT |
| **Ngủ đông có đường rút**, viết như luật mã | Silicon 9,75 M USD kẹt; Swellchain; Zero; Kinto |
| Tầng 2 theo **mẫu ATProto + neo + hợp đồng** | 46 M người, 1.640 PDS; ZK 3,5 cent/khối; DA < $1/MB |
| Hiến pháp số **nói chuẩn thị trường** | AP2 60+ đối tác; x402 480 k agent; ERC-4337 40 M tài khoản |
| Mạng mẹ **không bán bảo mật** | Cosmos ICS 3 chain sau 3 năm |

---

## 4. Ba rủi ro mới, thấy từ số của người khác

1. **"Vách đá grant"** (Ethereum L2, 2026): TVL và cộng đồng thuê bằng token, hết token là chết. Nếu 9Chain
   thưởng LOVE9 cho node hộ, **thưởng phải giảm dần theo tuổi chain** và chain phải tự có validator trước
   khi hết thưởng — không thì nhà trẻ thành nhà dưỡng lão.
2. **Tập trung ở 2 chain** (77 % giá trị L2 ở 2 chain; Superchain 34 chain nhưng Base chiếm gần hết). 2.000
   chain cộng đồng sẽ có phân bố đuôi dài: vài chục chain thật, phần còn lại im. Thiết kế phải **rẻ cho chain
   im** (đo D-178: 0,05 luồng/L1 — tốt) và **không bắt chain im trả phí** (ACP-77 tính phí theo validator sống;
   chain ngủ đông = 0 validator = 0 phí — khớp).
3. **Sybil DVT**: 4 máy của cùng một người vẫn là một người. Không có lời giải kỹ thuật hoàn toàn; ATProto và
   Bitcoin cũng không có. Dùng **danh tính người thật ở tầng 1** (cộng đồng biết mặt nhau) và thưởng chỉ cho
   cụm có **≥ 2 mạng/ASN khác nhau** — đo được, không đoán.

---

## 5. Việc kế tiếp — bản hai

Không đổi thứ tự của bản một (M3 + nhà trẻ · thử `ConvertSubnetToL1Tx` trên băng tập · phân công validator
· hộp node · kinh tế thưởng · tách hướng dẫn). **Thêm và sửa:**

- **[A1, sau thử ACP-77]** hộp node = **hộp DVT**: đo BLS threshold cho `signer.key` của avalanchego với
  Obol/SSV-style; điều kiện qua: một validator L1 tập với 4 máy, tắt 1 máy, uptime không đổi.
- **[A1, console]** viết luật **ngủ đông có đường rút** cạnh `MAX_L1`; ca đỏ: chain ngủ đông mà RPC chỉ đọc
  hoặc đường rút không còn ⇒ cổng đỏ.
- **[A1, tầng 2 thử nghiệm]** một kho ký Merkle theo mẫu ATProto cho một người + hợp đồng hiến pháp trên
  một chain tầng 1 + neo gộp mỗi giờ; điều kiện qua: sửa lịch sử ở kho ⇒ neo không khớp ⇒ phát hiện được
  từ ngoài.
- **[David]** chốt **mục tiêu validator L1** của 9Chain (⇒ số chain cộng đồng công bố), và chốt "9Chain nói
  chuẩn AP2/ERC-8004/7715 thay vì tự đặt".

---

## Nguồn (đọc `2026-09-04`)

Avalanche: ACP-77 spec (avalanche-foundation/ACPs) · build.avax.network "How do L1 validator fees work" ·
support.avax.network "L1 validator requirements" · eco.com "What is Avalanche… in 2026" · Coin Bureau
"Avalanche Review 2026" · Avascan validators (Beam/Dexalot/GUNZ/Lamina1) · Messari "State of Avalanche Q1 2025".
Ethereum L2: L2BEAT summary · yellow.com "Ethereum L2 winners and dead weight 2026" · CoinDesk 04/06/2026
"Not all L2s are dying…" · CryptoSlate (Silicon, Swellchain) · TradingView/21Shares · Conduit pricing ·
Messari "State of the Superchain H2 2025". Saga: docs.saga.xyz (validator selection, paying for chainlets) ·
BusinessWire 12/2024. Cosmos: hub.cosmos.network ICS · cosmos.github.io PSS · ryder.id "Cosmos in 2026".
Polkadot: parachains.info coretime · docs.polkadot.com agile coretime · Coin Bureau 2026. Node/DVT/DePIN:
bitnodes.io · etherscan nodetracker · ethstaker solo-stakers · SSV/Obol · Dappnode · Helium explorer/DePIN
Scan · FalconX DePIN · web3pi.io · Ethereum on ARM. ATProto: atproto.com data-repos · sifa.id stats ·
Wikipedia Bluesky. AI: cloud.google.com AP2 · coinbase.com x402/AP2 · ERC-8004 (ethereum-magicians,
QuickNode) · ERC-7715 (eco.com) · ERC-4337 (Alchemy/Dune) · EIP-7702 (Safe, Etherscan). ZK/DA: ethproofs ·
Succinct SP1 Hypercube · Aligned "year of real-time proving" · Conduit "DA costs" · BlockEden DA 2026.
