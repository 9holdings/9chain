# 9Chain — chín năm, phân tích lại toàn diện (bản tổng hợp)

Viết `2026-09-04` theo yêu cầu của David: *"phân tích lại toàn diện 9 năm của 9Chain."* Đây là **bản tổng hợp** của
tám tài liệu viết trong hai ngày `03–04/09` — `PROPOSAL-FREE-L1…` · `ANALYSIS-WORLD-EVIDENCE…` · `ANALYSIS-MOBILE-VALIDATORS`
· `ROADMAP-2026-2029` · `VISION-PERSONAL-L1-REAL-LIFE` · `PROJECTION-BILLIONS-OF-L1` · `VISION-9-YEARS-9-BILLION` ·
`STRATEGY-AI-USERS-NEED-PERSONAL-L1` — sắp lại quanh **một xương sống** mà David chốt cuối cùng: *từ năm thứ năm, ai
dùng AI cũng cần một Layer 1 riêng.* Đứng trên lõi `avalanchego 1.14.2` và công nghệ đã có; hiện trạng testnet chỉ
dùng để định cỡ chi phí. Chín năm tính từ Block Adam `2026-09-09` tới `2035-09-09`. **Khi mâu thuẫn với tám bản
trước, bản này thắng về kế hoạch; các bản trước giữ chi tiết và dẫn chứng.**

---

## 0. Câu trả lời ngắn — chín điều

1. **9Chain là gì trong chín năm:** *gốc thẩm quyền cá nhân cho AI hành động* — một chain của mỗi người, nơi ghi
   *AI được phép làm gì, đã làm gì, ai cho phép*, mà mô hình không thuyết phục được, vendor không sửa được, bị đơn
   không giữ, và sống lâu hơn tất cả họ. Mọi thứ khác (mạng mẹ, chain cộng đồng, validator, điện thoại, token) là
   **hạ tầng cho câu đó**.
2. **Vì sao thắng:** AI trả lời không cần chain; AI **hành động** cần. Sáu lực (giới hạn ngoài mô hình · nhiều
   vendor · agent trả tiền · agent↔agent · pháp luật · đời người dài hơn vendor) chỉ xuất hiện khi AI làm, và
   **không nền tảng nào có thể trung lập với chính mình** — kẽ hở cấu trúc, không tạm thời.
3. **Lõi đã cho phần đồng thuận:** L1 ≥ 1 validator, chủ = hợp đồng trên chính chain, đồng bộ một phần, bảy precompile
   hiến pháp, Warp, finality tức thì, không block rỗng. Giới hạn lõi duy nhất là **20.000 validator L1/P-Chain** ⇒
   đệ quy (hợp đồng đăng ký · mạng vùng · ACP cam kết tập validator).
4. **Chín năm = 4 + 1 + 4.** Bốn năm **xây và chứng minh** (2027–2030): sổ thật, hiến pháp chặn đúng, chain cộng đồng
   0 node 9Chain, mạng vùng ngoài, chuẩn v1, sandbox pháp lý. Năm thứ năm **điểm gãy** (2031): agent không có gốc
   độc lập bị từ chối ở ngành có quy định — "nhãn Không an toàn" của HTTPS. Bốn năm **phổ cập** (2032–2035): kênh
   phân phối (ví danh tính nhà nước, OEM, nền tảng agent, siêu app) mang sổ tới 9 tỷ.
5. **Bốn dòng việc chạy song song suốt chín năm:** (A) sổ cá nhân và hiến pháp agent · (B) hạ tầng đệ quy · (C) chuẩn,
   pháp lý, kênh phân phối · (D) tổ chức và kinh tế. Dòng A là sản phẩm; B là điều kiện; C là đòn bẩy; D là thứ mã
   không sửa được.
6. **Số:** 10² (2027) → 10⁴ → 10⁵ → 10⁶ (2030) → 10⁷ (2031) → 10⁸ → 5×10⁸ → 2×10⁹ → **9×10⁹ (2035)** = một chain cho
   mỗi người sống. Vật lý: ~55 PB/năm ở 100 hành động agent/ngày/người — nhỏ hơn video Internet một tháng.
7. **9Chain đạt 9 tỷ bằng cách trở thành chuẩn, không phải mạng.** Hàng trăm mạng gốc cùng chuẩn đệ quy; 9Chain là
   gốc đầu tiên, Quỹ giữ đặc tả cùng cộng đồng, tác giả ACP, triển khai tham chiếu. Số 9 tỷ đếm **trên chuẩn**.
8. **Ba mốc cứng không đàm phán:** validator sáng lập hết hạn `07–09/2027` (tái cọc trước `06/2027`) · quyết định
   mainnet và ý kiến pháp lý trước `02/2028` · chuẩn v1 với ba triển khai độc lập trước `2030`.
9. **Năm quyết định cần David ngay** (mục 10): mục tiêu validator L1 và V · lịch mainnet và ai quyết · ba vai người và
   tiền · tái cọc hay re-genesis `07/2027` · pháp lý ai hỏi trước ngày nào.

---

## 1. Xương sống — và cách nó sắp lại tám bản trước

Hai ngày qua đi qua bốn cách gọi cùng một sứ mệnh; mỗi cách đúng ở một tầng:

| Cách gọi | Tài liệu | Đúng ở đâu | Chỗ nó là hạ tầng cho xương sống |
|---|---|---|---|
| *"Ai cũng tạo được L1 miễn phí"* | PROPOSAL, ANALYSIS-WORLD | chain **cộng đồng** (10³–10⁶), ACP-77, cụm DVT | bậc 2: sổ đăng ký + máy chủ sổ + nơi nhận neo cho sổ cá nhân |
| *"Một chain cho mỗi người"* | VISION-PERSONAL-L1 | năm quyền; chain = sổ quyền và bằng chứng; hai pha A/B | bậc 3: hình dạng của sổ cá nhân |
| *"Hàng tỷ / 9 tỷ chain"* | PROJECTION, VISION-9-YEARS | vật lý; đệ quy; kênh phân phối; 9Chain là chuẩn | quy mô và đường phổ cập |
| ***"Từ năm 5, ai dùng AI cũng cần L1 riêng"*** | STRATEGY-AI | **lý do để cần** — pháp luật, vendor, agent của người khác | **xương sống**: mọi bậc, mọi năm, mọi thước đo xoay quanh đây |

Điều gộp lại mới thấy: **ba cách gọi đầu trả lời "làm được không" và "bao nhiêu"; cách thứ tư trả lời "vì sao ai đó
sẽ cần".** Không có cách thứ tư, ba cách đầu là hạ tầng chờ nhu cầu. Có nó, thứ tự công việc đổi: **sổ cá nhân và
hiến pháp agent đi trước**, chain cộng đồng và mạng mẹ đi theo với đúng cỡ cần cho sổ, không hơn.

Một điều chỉnh so với `ROADMAP-2026-2029`: bản đó xếp "chuyển console sang L1 chủ quyền" là mốc kỹ thuật số một.
Nay nó là mốc số một của **dòng B**, còn mốc số một của **dự án** là *sổ của một người thật với một agent thật bị
hiến pháp từ chối đúng một lần* (dòng A). Hai mốc cùng mùa 1; thứ tự ưu tiên khi phải chọn: A trước.

---

## 2. Chỗ đang đứng — đọc từ lõi và từ vận hành, tách bạch

| Lớp | Có gì | Nghĩa |
|---|---|---|
| **Lõi** (`avalanchego 1.14.2`, subnet-evm/coreth ghép) | ACP-77 (L1 ≥ 1 validator, cấm gỡ validator cuối), phí validator L1 Target 10 k / Capacity 20 k, `--partial-sync`, 16 subnet/node, Simplex theo subnet, Warp, bảy precompile, `upgrade.json` | **mọi thứ cần cho sổ cá nhân về đồng thuận đã có**; chưa cần sửa lõi |
| **Fork chủ quyền** | 27 patch, thế hệ g1, `upgrade.A1` tách khỏi `Default`, tokenomics 9 tỷ LOVE9, khắc chữ, đường validator ngoài | **quyền đi trước upstream** (ACP mới) và quyền không bị nuốt |
| **Vận hành testnet** | 9 node một máy · validator hết hạn `07–09/2027` · 6 L1, console track-all trần 15 · 1 validator khách · 50 cổng preflight | dùng để **định cỡ chi phí** (D-178) và làm mốc cứng (B-12); **không** dùng để đặt trần cho tầm nhìn |
| **Sản phẩm với người dùng** | RPC, faucet, console (allowlist), 9Scan; **0 sổ cá nhân, 0 agent** | dòng A ở **số không** — đó là việc của mùa 1 |
| **Chuẩn, pháp lý, kênh** | chưa có đặc tả; chưa ý kiến pháp lý; chưa vendor | dòng C ở số không |
| **Tổ chức, kinh tế** | David + phiên AI; LOVE9 chưa giá; Foundation 1,07 tỷ; Team 9 % | dòng D: một người là điểm đơn lỗi |

---

## 3. Chín năm = bốn năm xây và chứng minh · năm thứ năm điểm gãy · bốn năm phổ cập

| Năm | Giai đoạn | Chủ đề | Sổ cá nhân | Dòng A · sản phẩm | Dòng B · hạ tầng | Dòng C · chuẩn, pháp lý, kênh | Dòng D · tổ chức | Điều kiện qua | Cái vỡ đầu tiên |
|---|---|---|---|---|---|---|---|---|---|
| **2027** | I | Người đầu tiên | 10² | genesis sổ (bảy precompile + ví thông minh + hiến pháp + neo + sổ VC); **giao diện công cụ cho agent** (`request_permission` · `log_receipt` · `check_mandate`); 100 người 9S Union; **đo hành động/ngày** | mạng mẹ ≥ 3 máy/3 ASN; ACP-77, Simplex, điện thoại cũ, IPv6 trên băng tập; hộp node | ý kiến pháp lý (LOVE9, cam kết hash); đặc tả hiến pháp agent v0 công bố | vai vận hành tuyển; nghi lễ 09/09 | 100 sổ hoạt động hàng tuần; hiến pháp chặn đúng; sổ sống qua đổi máy | không ai dùng ⇒ đổi ứng dụng đầu tiên, giữ chain vô hình |
| **2028** | I | Cộng đồng, mainnet | 10⁴ | khôi phục xã hội 3/5; app một màn; biên nhận từ cửa hàng thật; sổ đồng ý sức khoẻ | **tái cọc trước `06/07/2027`**; console sinh L1 chủ quyền, nhà trẻ 5 node; ≥ 3 chain 0 node 9Chain; **quyết định mainnet**, genesis, 30 node/3 châu lục | sandbox pháp lý AI Act Điều 12/26 với một ngành; **vendor agent đầu tiên** (khung mã mở) dùng sổ làm gốc ngoài; bảng điểm A1/C1 | 3 vai người; pháp lý xong | 9 validator hạn mới > 2028; mainnet 90 ngày không mất block; 10⁴ sổ; 1 vendor | mainnet trượt ⇒ mạng mẹ dừng; pháp lý âm ⇒ mainnet không bán token |
| **2029** | I | Chủ quyền cho người khác | 10⁵ | hiến pháp nói AP2/ERC-7715 đầy đủ; agent↔agent với biên nhận hai chiều; **một vụ tranh chấp thật** giải bằng hai sổ | hộp DVT trên Simplex; ACP cam kết tập validator trên băng tập (10⁶ L1 giả); 100 chain cộng đồng, 50 % không node 9Chain | **chuẩn v1** (đăng ký, neo, tên đệ quy, VC điều kiện, giao diện agent); **ba triển khai độc lập** | Quỹ giữ đặc tả cùng cộng đồng; 5–8 người | 3 triển khai ngoài; 50 % chain không 9Chain; 1 tranh chấp giải được | Simplex/DVT chưa chín ⇒ hộp cắm điện; ACP bị bác ⇒ mạng vùng vẫn đủ |
| **2030** | I | Mạng vùng | 10⁶ | máy chủ sổ là hàng hoá (< $1/người/năm ở 100 hành động/ngày); light client trên điện thoại | **mạng vùng đầu tiên không do 9Chain vận hành**; cầu Warp-qua-relay có kiểm toán; ACP lên mainnet; ZK neo cho khối nhỏ | ví danh tính nhà nước ≥ 1 nước; SDK trong ≥ 1 siêu app; **nền tảng agent lớn hỗ trợ gốc ngoài** | lịch chuyển giao quản trị công bố | 1 mạng vùng ngoài + cầu; 1 kênh ở 10⁶; 1 nền tảng lớn | cầu không an toàn ⇒ mạng vùng là đảo một thời gian |
| **2031** | **II** | **Điểm gãy** | 10⁷ | không gì mới; **mặc định** cho ai dùng AI có tiền/giấy tờ | 10² mạng vùng; 10³ chain cộng đồng | **cơ quan quản lý đòi log độc lập với vendor** ở ≥ 1 ngành; tiền lệ: log của bị đơn không đủ | 9Chain rời bậc 1–2 | agent không gốc độc lập bị từ chối ở ngành có quy định | luật chậm ⇒ lùi 2 năm, không sai |
| **2032** | III | Liên thông nhiều gốc | 10⁸ | proving khối cá nhân trên điện thoại | ≥ 3 mạng gốc độc lập cùng chuẩn; tên đệ quy xuyên gốc | quản trị chuẩn tách khỏi 9Chain | nhiều gốc | sổ chuyển gốc giữ tên và lịch sử | rẽ nhánh nếu 9Chain giữ quản trị |
| **2033** | III | Kênh phân phối | 5×10⁸ | — | 10³ mạng vùng, 10⁵ chain cộng đồng | ví danh tính ≥ 2 nước; siêu app; agent vendor lớn | quốc gia, OEM, app | một kênh ở 10⁸ | không kênh ⇒ trần ~10⁸ |
| **2034** | III | Hàng tỷ | 2×10⁹ | — | 9 PB → 55 PB/năm là vận hành thường | điện thoại xuất xưởng với sổ; agent mặc định có gốc thẩm quyền | thế giới | 1 tỷ sổ **hoạt động** | — |
| **2035** | III | Một chain cho mỗi người sống | 9×10⁹ | — | — | — | — | `2035-09-09`, chín năm từ Block Adam | — |

Đọc bảng theo hàng 2031: **năm thứ năm không có việc xây**. Nếu năm 2031 còn phải xây, đã trễ. Đó là lý do bốn năm
đầu dày như vậy và bốn năm sau gần như chỉ có cột C và D.

---

## 4. Bốn dòng việc — mỗi dòng một cung chín năm

### Dòng A · Sổ cá nhân và hiến pháp agent (sản phẩm)

- **Là gì:** genesis sổ (subnet-evm: `txallowlist` = khoá agent, `deployerallowlist` = chủ, `nativeminter`,
  `feemanager` phí 0, `warp` bật; cài sẵn ví thông minh passkey, hợp đồng hiến pháp — hạn mức, ngưỡng hỏi lại, thu hồi,
  uỷ quyền có hạn ERC-7715, nói AP2 mandate — hợp đồng neo, sổ VC). **Giao diện công cụ** để agent gọi sổ. **Máy chủ
  sổ** (mẫu PDS) cho khi chủ ngủ. App một màn.
- **Cung:** 2027 một người thật → 2028 khôi phục xã hội, biên nhận cửa hàng → 2029 agent↔agent, tranh chấp → 2030
  máy chủ sổ hàng hoá, light client → 2031 mặc định → 2032 proving trên điện thoại.
- **Thước đo:** sổ hoạt động hàng tuần · hành động bị hiến pháp chặn đúng · sổ sống qua đổi máy chủ · chi phí/người/năm.
- **Không làm:** dữ liệu lên chain; tự làm agent; UX crypto.

### Dòng B · Hạ tầng đệ quy (điều kiện)

- **Là gì:** mạng mẹ nhỏ, bền, nhàm chán (≥ 3 máy/3 ASN/2 châu lục, tái cọc `07/2027`, mainnet 2028); chain cộng đồng
  ACP-77 (nhà trẻ 5 node, rút khi đủ, cụm DVT trên Simplex, ngủ đông có đường rút, thưởng giảm theo tuổi); mạng vùng
  (mạng avalanchego trọn vẹn, cầu Warp-qua-relay); ACP cam kết tập validator.
- **Cung:** 2027 bền + băng tập → 2028 mainnet + L1 chủ quyền → 2029 DVT + ACP băng tập → 2030 mạng vùng ngoài +
  ACP mainnet → 2032 nhiều gốc.
- **Thước đo:** máy/ASN giữ ≥ 2/3 stake · chain cộng đồng 0 node 9Chain · mạng vùng ngoài 9Chain · P-Chain với 10⁶ L1 giả.
- **Không làm:** làm mạng mẹ to theo số chain; bán bảo mật kiểu ICS; sửa lõi cho tầng 2.

### Dòng C · Chuẩn, pháp lý, kênh phân phối (đòn bẩy)

- **Là gì:** đặc tả hiến pháp agent + đăng ký đệ quy + neo + tên + VC điều kiện, **đặc tả trước mã**; ý kiến pháp lý VN
  (Luật 91/2025, NQ 05/2025) và EU (AI Act Điều 12/26); sandbox pháp lý; tác giả ACP; vendor agent; ví danh tính nhà
  nước; OEM; siêu app.
- **Cung:** 2027 pháp lý + đặc tả v0 → 2028 sandbox + vendor đầu → 2029 chuẩn v1 + ba triển khai → 2030 nền tảng lớn +
  ví danh tính + siêu app → 2031 cơ quan quản lý đòi log độc lập → 2033 kênh ở 10⁸.
- **Thước đo:** vendor tích hợp gốc ngoài · cơ quan/ngành trích dẫn · triển khai độc lập · kênh ở 10⁶/10⁸.
- **Không làm:** tự phát minh chuẩn khi thị trường đã có (AP2, x402, ERC-8004/7715, W3C VC); bắt token; KYC.

### Dòng D · Tổ chức và kinh tế (thứ mã không sửa được)

- **Là gì:** 1 → 3 vai (vận hành 2027, cộng đồng 2028, giao thức 2028) → 5–8 (2029) → Quỹ giữ đặc tả cùng cộng đồng
  (2029) → quản trị nhiều gốc (2032). Kinh tế bằng fiat: máy mạng mẹ €60–300/tháng; máy chủ sổ < $1/người/năm; thưởng
  validator LOVE9 có trần, giảm theo tuổi; **không kế hoạch nào cần LOVE9 có giá trước 2028**.
- **Vai của LOVE9 ở 2035:** phí, neo, thưởng trên gốc 9Chain và các chain chọn nó; không bắt buộc với chuẩn.
- **Thước đo:** người thứ hai biết mở két (2027) · pháp lý có chữ ký (2028) · lịch chuyển giao công bố (2030).

---

## 5. Kiến trúc ở 2035 — bốn bậc, và dòng chảy của một hành động agent

```
BẬC 0  GỐC (10¹–10² mạng, 9Chain là một)   sổ tên gốc · đăng ký mạng vùng · nhận neo bậc 1
BẬC 1  MẠNG VÙNG (10³–10⁴)                 mạng avalanchego trọn vẹn · P-Chain riêng · cầu Warp-qua-relay
BẬC 2  CHAIN CỘNG ĐỒNG (10⁵–10⁶)           L1 ACP-77 · cụm DVT · máy chủ sổ · hợp đồng đăng ký + nhận neo
BẬC 3  SỔ CÁ NHÂN (9×10⁹)                  chủ = validator · hiến pháp · neo mỗi giờ · tên  lan.9s-union.mekong.love9
```

Một hành động của agent, 2035: agent của Lan (vendor X) gọi `check_mandate` trên sổ Lan → hợp đồng hiến pháp trả
"được, hạn còn 300 k" → agent trả x402 cho dịch vụ → biên nhận ký vào sổ Lan (khối mới, finality tức thì, một
validator là điện thoại/hộp/máy chủ sổ của Lan) → cuối giờ, gốc trạng thái sổ Lan gộp Merkle với 10⁵ sổ khác thành
một giao dịch neo trên chain 9S Union → chain 9S Union neo lên mạng vùng Mekong → mạng vùng neo lên gốc. Tranh chấp
sáu tháng sau: bên kia trình biên nhận trên sổ **của họ**, neo cùng giờ; hai neo khớp; không vendor nào là bị đơn giữ
log. **Lan không thấy chữ nào trong đoạn trên.**

---

## 6. Chín bất biến và chín thước đo

| # | Bất biến (không đổi 2026–2035) | Thước đo tương ứng |
|---|---|---|
| 1 | Năm quyền của chủ sổ | sổ sống qua đổi máy chủ / đổi máy |
| 2 | Chain là sổ quyền và bằng chứng, không kho dữ liệu | 0 byte dữ liệu cá nhân trên chain (kiểm toán) |
| 3 | Đệ quy | chain/mạng vùng ngoài 9Chain |
| 4 | Mạng gốc nhỏ và nhàm chán | mạng gốc ≤ 100 node, 0 sự cố mất block/năm |
| 5 | Kiểm bằng bằng chứng, không chạy lại | chi phí kiểm 10⁵ neo/giờ; tỷ lệ sổ neo bằng bằng chứng |
| 6 | Tên vĩnh viễn; ngủ đông thay xoá; đường rút mở | 0 chain bị xoá; chain ngủ có RPC chỉ đọc |
| 7 | Không KYC, không giữ dữ liệu người dùng | 0 kho dữ liệu người dùng ở 9Chain |
| 8 | Mã mở, tiếng Anh, đặc tả trước mã | triển khai độc lập của đặc tả |
| 9 | Kinh tế bằng fiat và việc thật | chi phí/người/năm; 0 kế hoạch phụ thuộc giá LOVE9 |

Thước đo tổng của dự án, một dòng: **sổ hoạt động hàng tuần trên chuẩn** (tính cả gốc khác) × **hành động agent bị
hiến pháp chặn đúng**. Số chain, số validator, số token — không.

---

## 7. Chín rủi ro — gộp từ tám bản, xếp theo năm chúng thật sự cắn

| Năm | Rủi ro | Dấu hiệu sớm | Chặn |
|---|---|---|---|
| 2027 | **Không ai cần sổ** (dòng A) | sổ hoạt động hàng tuần < 30 % | bắt đầu từ agent trả hoá đơn, không từ "tạo chain"; chain vô hình |
| 2027 | **Một người** (dòng D) | David vắng > 2 tuần và mạng cần bấm | vai vận hành trước mùa 2 |
| 2028 | **Mạng mẹ dừng `07/2027`** hoặc **pháp lý chặn LOVE9** | `06/2027` chưa diễn tập tái cọc; ý kiến âm | tái cọc tay; mainnet không bán token |
| 2028 | **Nền tảng làm sổ nội bộ đủ tốt** và được chấp nhận | vendor lớn ra "agent account" + log | sandbox sớm để định nghĩa "độc lập"; giữ ba thứ nền tảng không thể |
| 2029 | **Không ai chạy node cho chain lạ** | < 50 % chain không node 9Chain | thưởng có trần, giảm theo tuổi; hộp DVT dễ |
| 2030 | **ACP bị bác / cầu không an toàn** | băng tập 10⁶ không đạt; kiểm toán đỏ | mạng vùng + hợp đồng đệ quy vẫn đủ 10⁹ |
| 2031 | **Luật chậm hơn dự phóng** | không cơ quan nào đòi log độc lập | lùi 2 năm; điều kiện chi phí/UX vẫn đúng hạn |
| 2032 | **Rẽ nhánh chuẩn** vì 9Chain giữ quản trị | gốc khác công bố biến thể | chuyển giao trước khi bị ép |
| 2033–35 | **Không kênh phân phối / Sybil / độc quyền mới** | 0 tích hợp ở 10⁸; sổ không VC; một gốc > 50 % | chấp nhận trần 10⁸ nếu cần; sổ không VC hạng hai; bất biến 3–4–7 |

Rủi ro duy nhất 9Chain **kiểm soát hoàn toàn**: chi phí < $1 và UX vô hình. Mọi rủi ro khác chỉ làm lộ trình lùi,
không làm nó sai.

---

## 8. Kinh tế chín năm — bằng fiat

| Khoản | 2027–2028 | 2029–2031 | 2032–2035 | Ai trả |
|---|---|---|---|---|
| Mạng mẹ | 3 máy ≈ €60–100/tháng → mainnet 9Chain giữ ≤ 9 node ≈ €200–300 | như trên | như trên | Foundation |
| Máy chủ sổ | trong 3 máy; 100 → 10⁴ người | hàng hoá < $1/người/năm; chain cộng đồng/vendor tự chạy | thị trường | Foundation → cộng đồng/vendor |
| Nhà trẻ + RPC | trong 3 máy | 5–10 node ≈ €100–150/tháng | thị trường RPC | Foundation → chain |
| Thưởng validator | 0 | LOVE9 trần tháng, giảm theo tuổi | như trên | quỹ on-chain |
| Người | 1 + AI → 3 | 5–8 | Quỹ + nhiều gốc | Foundation / Team 9 % |
| Pháp lý, kiểm toán | ý kiến pháp lý; sandbox | kiểm toán hợp đồng hiến pháp + Validator Manager mỗi năm | như trên | Foundation |

Ba luật kinh tế viết vào mã: thưởng giảm theo tuổi chain · chain im không trả phí · ngủ đông giữ đường rút. Doanh thu
có thể có, không được lên kế hoạch: máy chủ sổ cho tổ chức; dịch vụ tuân thủ AI Act cho deployer (log độc lập); RPC.

---

## 9. Điều 9Chain không làm trong chín năm

| Không làm | Vì sao |
|---|---|
| Tự làm AI agent | thành vendor ⇒ mất trung lập, thứ duy nhất nền tảng không có |
| Cạnh tranh UX với nền tảng | được tích hợp, không thay thế |
| Bán "L1 rẻ" làm sản phẩm chính | thị trường đã có; không phải lý do người ta ở lại |
| Mạng mẹ bán bảo mật / lớn theo số chain | Cosmos ICS 3 chain/3 năm; 16 subnet/node là giao thức |
| Sửa lõi Avalanche cho tầng 2 | mọi thứ cần đã có; sửa là gánh rebase mỗi năm — ACP thì có, vá riêng thì không |
| Ép avalanchego sống nền trên iOS/Android | trận thua với hệ điều hành; điện thoại là chủ sổ và mảnh khoá |
| Đưa dữ liệu cá nhân lên chain; KYC; giữ log vendor | pháp luật + mất tư cách "không do bị đơn giữ" |
| Bắt buộc token; kế hoạch cần LOVE9 có giá | vendor và cơ quan quản lý từ chối; vách đá grant |
| Hứa "5 validator cho mỗi người", "validate bằng điện thoại", "người dùng sẽ muốn chain" | cả ba sai; D-161 ở quy mô lớn |
| Xoá chain, tên, bản ghi | vĩnh viễn; ngủ đông thay xoá |

---

## 10. Quyết định cần David bây giờ

1. **Mục tiêu validator L1 và V** — đề xuất 10.000 / V = 5 ⇒ 2.000 chain cộng đồng mỗi thế hệ; không có số này thì
   không đặt được phí ACP-77, luật ngủ đông, cỡ nhà trẻ.
2. **Lịch quyết định mainnet và ai quyết** — đề xuất bảng điểm công khai từ mùa 2, chốt `02/2028`, genesis mùa 4.
3. **Ba vai người và tiền cho họ** — vận hành trước mùa 2; từ Team 9 % / Foundation hay vốn ngoài.
4. **Tái cọc giữ g1 hay re-genesis cho `07/2027`** — tái cọc rẻ và giữ lịch sử; re-genesis chỉ nếu mainnet không trượt.
5. **Pháp lý: ai hỏi, hỏi ai, trước ngày nào** — VN (91/2025, NQ 05/2025) và EU (AI Act) — bắt đầu mùa 1, xong trước
   `02/2028`.
6. *(mới, từ xương sống)* **Chốt thứ tự A trước B khi phải chọn** — sổ của một người thật với agent thật đi trước
   chuyển console sang L1 chủ quyền, nếu tài nguyên chỉ đủ một.

---

## 11. Một câu kết

Chín năm của 9Chain là chín năm làm cho một câu trở thành mặc định: **AI của tôi phải xin phép, và có một nơi ghi lại
nó đã xin — nơi đó là của tôi, không của ai bán AI cho tôi.** Lõi Avalanche đã cho nơi đó hình dạng; vật lý cho nó
quy mô chín tỷ; đệ quy cho nó sổ đăng ký; nhà nước đang phát danh tính; pháp luật đang bắt ghi log; kỷ nguyên AI đang
tạo lý do. Bốn năm đầu 9Chain xây nó, chứng minh nó, và tự rút khỏi mọi bậc giữa. Năm thứ năm thế giới bắt buộc nó.
Bốn năm sau người khác mang nó tới hàng tỷ người dưới tên của họ. **9Chain đạt 9 tỷ vào ngày người thứ chín tỷ có sổ
mà không biết 9Chain là gì** — `2035-09-09`, chín năm kể từ Block Adam.

---

## Nguồn

Tám tài liệu nêu ở đầu tệp và toàn bộ nguồn của chúng. Lõi: `upstream/avalanchego 1.14.2` —
`vms/platformvm/txs/convert_subnet_to_l1_tx.go:29,61` · `vms/platformvm/txs/executor/standard_tx_executor.go:63` ·
`genesis/genesis_9chain_a1.go:95–107` · `config/flags.go:273` · `network/peer/peer.go:39` · `subnets/config.md` ·
`snow/engine/common/engine.go:433` · `graft/subnet-evm/precompile/contracts/*`. Vận hành: D-166 · D-174 · D-178 ·
D-180 · D-181 · B-12 · B-16/B-20 · `ALLOCATION-PUBLIC.md`.
