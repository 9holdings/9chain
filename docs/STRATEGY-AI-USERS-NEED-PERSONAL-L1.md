# Từ năm thứ năm, ai dùng AI cũng cần một Layer 1 riêng — phân tích luận điểm chiến lược

Viết `2026-09-04` theo chỉ đạo của David: *"phân tích theo hướng là kể từ năm thứ 5 thì hầu như ai dùng AI đều sẽ cần
blockchain layer 1 riêng, đây là tầm nhìn chiến lược của dự án."* Năm thứ năm tính từ Block Adam `2026-09-09` là
**2031**. Tài liệu này đối xử với luận điểm như một **giả thuyết chiến lược có điều kiện**: nêu cơ chế làm nó đúng,
cái gì phải đúng trước, vì sao là năm thứ năm, đối thủ thật của nó là gì, và 9Chain phải làm gì trong bốn năm đầu để
khi làn sóng tới thì 9Chain là mặc định. Đứng trên lõi `avalanchego 1.14.2` và công nghệ đã có; số thế giới đọc `04/09`.

---

## 0. Câu trả lời ngắn

1. **Luận điểm đúng về cơ chế, và có điều kiện về thời điểm.** AI agent *hành động thay người* tạo ra một nhu cầu chưa
   từng có: **một nơi ghi quyền và bằng chứng mà không nhà cung cấp AI nào sở hữu**. Không có AI, sổ cá nhân là thứ
   "hay"; có AI hành động, nó là thứ "phải có" — vì **một mô hình không thể tự thi hành giới hạn của chính nó**.
2. **"Cần" đến từ ba phía, không từ người dùng**: (a) **pháp luật** — EU AI Act bắt ghi log tự động mọi hành động,
   tool call, từ chối, can thiệp của hệ thống rủi ro cao từ `02/08/2026`; (b) **nhà cung cấp AI** — cần đẩy trách nhiệm
   pháp lý về một gốc thẩm quyền do người dùng giữ; (c) **agent của người khác** — hai agent giao dịch cần bằng chứng
   hai chiều mà không bên nào kiểm soát. Người dùng không "muốn chain", cũng như không ai "muốn HTTPS".
3. **Vì sao phải là L1 riêng, không phải tài khoản agent ở nền tảng**: bốn thứ nền tảng **không thể** cho — di động
   xuyên nhà cung cấp (agent của OpenAI, Google, Apple cùng một gốc), thu hồi không cần xin phép ai, bằng chứng mà
   bị đơn không giữ, và thừa kế. Lõi Avalanche cho L1 một validator với finality tức thì, ngủ khi rảnh, luật trong
   genesis — đúng hình dạng của "gốc thẩm quyền cá nhân".
4. **Vì sao năm thứ năm**: đường cong ba lớp — người dùng AI đã > 1 tỷ (`2026`), agent thành dòng chính `2027–2028`,
   thanh toán agent `2028`, vụ kiện và tiền lệ về hành động tự động `2028–2030`, pháp luật đuổi kịp `2029–2031`.
   Giống HTTPS: tuỳ chọn (2010) → xếp hạng (2014) → "không an toàn" (2017) → mặc định (2020). **Năm thứ năm là lúc
   agent không có gốc thẩm quyền độc lập bị coi như website không có khoá.**
5. **Số ở năm thứ năm**: 4–5 tỷ người dùng AI, 3–10 agent mỗi người, **~100 hành động/ngày** (agent làm nhiều hơn
   người) ⇒ ~11 MB/năm/người, ~55 PB/năm toàn cầu — vẫn nhỏ hơn video Internet một tháng. Vật lý không đổi kết luận.
6. **Đối thủ thật không phải chain khác; là "sổ nội bộ đủ tốt" của nền tảng** được cơ quan quản lý chấp nhận. 9Chain
   thắng ở đúng chỗ nền tảng không thể: trung lập giữa nhà cung cấp, thuộc về người, sống lâu hơn nhà cung cấp.
7. **Chiến lược bốn năm đầu**: xây "hiến pháp agent" như **chuẩn** mà agent vendor tích hợp qua giao diện công cụ
   (kiểu MCP), đứng đầu ở một sandbox pháp lý, làm tham chiếu cho "log không chối được" của AI Act — để tới 2031 câu
   trả lời có sẵn cho "agent của bạn ghi quyền ở đâu" là **sổ của người dùng**, và triển khai tham chiếu là 9Chain.
8. **Điều 9Chain không làm**: không tự làm AI agent; không cạnh tranh với nền tảng; không bắt buộc token; không hứa
   người dùng sẽ "muốn" chain.

---

## 1. Cơ chế — vì sao AI hành động thay người tạo ra nhu cầu sổ quyền cá nhân

| Lực | Cái gì đổi khi AI hành động thay người | Nhu cầu sinh ra | Nguyên thuỷ trong lõi / chuẩn |
|---|---|---|---|
| **1. Giới hạn phải nằm ngoài mô hình** | mô hình có thể bị prompt injection, ảo giác, bị lừa; *"đừng tiêu quá 500 k"* trong prompt **không phải** một giới hạn | một **hợp đồng** thi hành hạn mức, ngưỡng hỏi lại, thu hồi — độc lập với mô hình | `txallowlist` (khoá agent), hợp đồng ví hạn mức, ERC-7715 uỷ quyền có hạn |
| **2. Nhiều agent, nhiều nhà cung cấp** | một người có agent của OpenAI, Google, Apple, ngân hàng, công ty — không cái nào được là "gốc" của cái khác | **gốc thẩm quyền trung lập** do người giữ, mỗi agent một khoá, quyền theo khoá | nhiều địa chỉ genesis (P-56), allowlist theo khoá, ERC-8004 danh tính agent |
| **3. Agent trả tiền** | x402: 165 M giao dịch agent trong vài tháng; agent trả API, mua hàng | ví có hạn mức theo agent, biên nhận mọi khoản, đối chiếu | x402, AP2 mandate, biên nhận ký trên sổ |
| **4. Agent ↔ agent** | agent của tôi thương lượng với agent của bạn; ai chịu trách nhiệm khi sai? | **bằng chứng hai chiều** không bên nào giữ, neo ra nơi trung lập để giải quyết tranh chấp | Warp/ICM giữa hai sổ, neo lên chain cộng đồng |
| **5. Pháp luật** | EU AI Act: hệ thống rủi ro cao phải **tự động ghi log** mọi sự kiện (prompt, tool call, quyết định, từ chối, can thiệp) suốt vòng đời, deployer giữ ≥ 6 tháng; phạt tới 3 % doanh thu | log **không chối được**, **không do bị đơn giữ**, có dấu thời gian và người cho phép | khối ký + neo; sổ cá nhân là log của người, không của vendor |
| **6. Đời người dài hơn nhà cung cấp** | agent đổi, vendor đóng, tài khoản bị khoá | quyền, lịch sử và danh tính **sống lâu hơn** mọi vendor | danh tính = khoá; di động kiểu ATProto; tên đệ quy |

Đọc bảng: sáu lực này **không tồn tại khi AI chỉ trả lời**; chúng xuất hiện khi AI **làm**. Đó là lý do "từ năm thứ
năm" chứ không phải "từ hôm nay": năm 2026 phần lớn AI vẫn trả lời; năm 2031 phần lớn AI sẽ làm.

Và một câu về bản chất: **hiến pháp cho AI phải là hợp đồng, không phải prompt** — vì thứ duy nhất không bị mô hình
thuyết phục là một hợp đồng. Sổ cá nhân là nơi hợp đồng đó sống, và blockchain là cách để không ai (kể cả vendor) sửa nó
lén.

---

## 2. Vì sao phải là "Layer 1 của riêng mình" — so ba lựa chọn

| Tiêu chí | **Tài khoản agent ở nền tảng** (OpenAI/Google/Apple/ngân hàng giữ) | **Tài khoản trên một chain chung** (smart account trên L1/L2 lớn) | **L1 riêng** (sổ cá nhân, chủ = validator) |
|---|---|---|---|
| UX hôm nay | **tốt nhất** | trung bình | phải xây (vô hình) |
| Di động xuyên nhà cung cấp | **không** — mỗi vendor một tài khoản | có | **có**, và mọi vendor cùng một gốc |
| Thu hồi không cần xin phép | phụ thuộc vendor | có | **có**, một giao dịch của khoá người |
| Bằng chứng mà bị đơn không giữ | **không** — log của vendor | có | **có** |
| Riêng tư | dữ liệu ở vendor | mempool/state công khai toàn cầu | **dữ liệu trong chain riêng**, chỉ neo ra ngoài |
| Độ trễ cho agent | tức thì | phụ thuộc chain chung | **tức thì** (một validator, Snowman) |
| Chi phí khi rảnh | 0 | phí mạng | **~0** (chain ngủ) |
| Luật riêng (ai được ký, phí, mint) | không | hạn chế | **genesis của tôi** (bảy precompile) |
| Thừa kế, đời người | đóng tài khoản | có | **có**, tên và lịch sử giữ |
| Sống lâu hơn vendor | **không** | có | **có** |

Ba lựa chọn sẽ **cùng tồn tại**: nền tảng thắng UX hôm nay và sẽ ra "tài khoản agent" trước (2026–2028); chain chung
thắng ở đơn giản; L1 riêng thắng ở **mọi tiêu chí mà pháp luật, vendor khác và người thừa kế quan tâm**. Cược của 9Chain:
**tới năm thứ năm, ba tiêu chí cuối trở thành bắt buộc**, và chỉ cột phải đáp ứng.

Lõi Avalanche cho đúng hình dạng cột phải, đã đọc từ mã ở `VISION-PERSONAL-L1-REAL-LIFE.md`: L1 ≥ 1 validator, chủ là
hợp đồng trên chính chain, `--partial-sync`, bảy precompile, Warp, không block rỗng.

---

## 3. Vì sao năm thứ năm — đường cong ba lớp

| Năm | Người dùng AI | Agent | Pháp luật và tiền lệ | Trạng thái "sổ quyền cá nhân" |
|---|---|---|---|---|
| **2026** | ChatGPT > 1 tỷ/tuần; Gemini > 1 tỷ/tháng; AI Overviews 2 tỷ | trả lời là chính; agent thí điểm; x402 165 M giao dịch | EU AI Act rủi ro cao **bắt log** từ `02/08/2026`; VN Luật 91/2025 | tuỳ chọn, chưa ai hỏi |
| **2027** | 2 tỷ | agent làm việc thật: đặt, trả, thương lượng | vụ kiện đầu tiên về hành động tự động sai; log vendor bị tranh cãi | **người đầu tiên** (100 sổ) |
| **2028** | 3 tỷ | agent-commerce dòng chính (IMF, Gartner); nhiều agent/người | quy định trách nhiệm agent bắt đầu ở EU/châu Á | 10⁴; agent vendor đầu tiên tích hợp gốc ngoài |
| **2029** | 3,5 tỷ | agent ↔ agent phổ biến; agent có ví | cơ quan quản lý đòi log **độc lập với vendor** cho một số ngành | 10⁵; sandbox pháp lý |
| **2030** | 4 tỷ | agent đại diện trong hầu hết giao dịch số | tiền lệ: log của bị đơn không đủ | 10⁶; nền tảng lớn hỗ trợ gốc ngoài |
| **2031 · năm thứ năm** | 4–5 tỷ | **agent là mặc định**, 3–10/người | **agent không có gốc độc lập = không được chấp nhận** ở ngành có quy định | **mặc định** cho ai dùng AI có tiền/giấy tờ; 10⁷ → 10⁸ |

Phép loại suy HTTPS là chính xác về hình dạng: `2010` tuỳ chọn → `2014` Google ưu tiên xếp hạng → `2017` Chrome dán
nhãn "Không an toàn" → `2020` mặc định. Không người dùng nào "muốn" HTTPS; nền tảng và trình duyệt **bắt**, rồi nó vô
hình. Sổ quyền cá nhân đi đúng đường đó, và **năm thứ năm là "nhãn Không an toàn"**: agent không có gốc thẩm quyền do
người giữ bị nền tảng, ngân hàng, cơ quan quản lý từ chối.

Dự phóng: số người dùng AI theo đường cong ChatGPT/Gemini `2025–2026` (×2–2,5/năm) rồi bão hoà về mức smartphone.
Số hành động agent/ngày là giả định — **đo ở năm 1**.

---

## 4. Cái phải đúng để luận điểm đúng — sáu điều kiện, và dấu hiệu sớm

| # | Điều kiện | Dấu hiệu sớm (đo được) | Nếu không thấy trước |
|---|---|---|---|
| 1 | **Ít nhất một nền tảng agent lớn chấp nhận gốc thẩm quyền ngoài** (AP2 mandate di động, khoá agent do người cấp) | AP2/ERC-7715 có "external authority root" trong đặc tả; một vendor cho phép | `2029` |
| 2 | **Một cơ quan quản lý đòi log không do vendor giữ** cho hành động tự động | hướng dẫn thi hành AI Act Điều 12/26 nhắc "independent"; một ngành (tài chính, y tế) đi trước | `2030` |
| 3 | **Chi phí sổ < $1/người/năm**, kể cả khi agent làm 100 hành động/ngày | đo trên máy chủ sổ của một chain cộng đồng | `2028` |
| 4 | **UX vô hình**: người 60 tuổi cấp và thu hồi quyền cho agent không ai đứng cạnh | thử với 100 người đầu | `2027` |
| 5 | **Danh tính từ ví nhà nước** dùng làm VC ngoài | EU cuối `2026`; VNeID có API | `2028` |
| 6 | **Một tiền lệ pháp lý** nơi log của nền tảng không được chấp nhận vì nền tảng là bên liên quan | theo dõi vụ kiện agent `2027–2029` | `2030` |

Nếu 1 và 2 không xảy ra trước `2030`, luận điểm **lùi hai năm** chứ không sai: sáu lực ở mục 1 vẫn còn, chỉ chưa bị ép.
Nếu 3 và 4 không đạt, luận điểm **sai vì lỗi của 9Chain**, không phải của thị trường — đó là hai điều kiện 9Chain kiểm
soát hoàn toàn.

---

## 5. Số ở năm thứ năm — tính lại với agent làm nhiều hơn người

Giả định `2031`: 4–5 tỷ người dùng AI; 3–10 agent/người; **~100 hành động có chữ ký/ngày** (thanh toán nhỏ, gọi API,
đồng ý, biên nhận, thương lượng) — gấp 10 giả định "10 hành động/ngày" của các bản trước, vì agent không mệt.

| Đại lượng | Một người/năm | × 5 tỷ | So sánh |
|---|---|---|---|
| Khối | 100 × 300 B × 365 ≈ **11 MB** | **~55 PB/năm** | video Internet ~1 tháng |
| Tính toán | ký + xây khối nhỏ, vài chục giây CPU/ngày | như một app nhắn tin bận | — |
| Độ trễ cần | agent chờ xác nhận < 1 s | **một validator = tức thì** | chain chung không hứa được |
| Neo | 24/ngày, gộp theo cộng đồng | 10⁵ sổ = 1 giao dịch/giờ/cộng đồng | không đáng kể |
| Tiền | mục tiêu < $1/năm | ~$5 tỷ/năm | nhỏ hơn thị trường log/observability doanh nghiệp |

Kết luận không đổi: **vật lý cho phép, kể cả khi agent làm gấp mười người**. Và chính độ trễ là lý do kỹ thuật thứ
hai cho "L1 riêng": agent cần xác nhận tức thì, chain của một người cho điều đó miễn phí; chain chung thì không.

---

## 6. Đối thủ thật, và chỗ 9Chain thắng

| Đối thủ | Mạnh | Không thể |
|---|---|---|
| **Sổ nội bộ của nền tảng AI** (OpenAI/Google/Apple "agent account" + log) | UX, phân phối, đã có 1 tỷ người | trung lập giữa vendor · bằng chứng khi **chính họ** là bị đơn · sống lâu hơn họ · thừa kế |
| **Ví/ngân hàng làm gốc agent** | tiền, KYC, quy định | mọi thứ không phải tiền: đồng ý dữ liệu, VC, quyền truy cập; và cũng không trung lập |
| **Chain chung + smart account** (Ethereum L2, Base…) | đơn giản, có sẵn | riêng tư (state công khai), độ trễ, phí, không có "luật riêng" của người |
| **Log tập trung theo AI Act** (SaaS compliance) | đúng luật cho doanh nghiệp | là log của deployer, không của người; không di động; không thừa kế |

9Chain thắng ở **giao của ba thứ**: *thuộc về người* (không phải vendor/ngân hàng), *trung lập* (mọi agent cùng một
gốc), *sống lâu hơn* (danh tính là khoá, tên vĩnh viễn). Nền tảng có thể thêm hai trong ba; **không nền tảng nào có
thể là trung lập với chính mình**. Đó là kẽ hở cấu trúc, không phải kẽ hở tạm thời.

---

## 7. Chiến lược bốn năm đầu — để năm thứ năm 9Chain là mặc định

| Năm | Việc | Vì sao phải làm ở năm đó |
|---|---|---|
| **1 · 2027** | **"Hiến pháp agent" như chuẩn**: đặc tả hợp đồng hạn mức/ngưỡng/thu hồi/uỷ quyền nói AP2 + ERC-7715; **giao diện công cụ cho agent** (kiểu MCP): `request_permission`, `log_receipt`, `check_mandate` — bất kỳ agent nào gọi được sổ của người dùng | vendor tích hợp thứ có giao diện công cụ, không tích hợp "một blockchain" |
| **1 · 2027** | 100 người thật, agent thật, hiến pháp chặn đúng; **đo số hành động/ngày** | điều kiện 4 và số của mục 5 |
| **2 · 2028** | **Sandbox pháp lý**: đăng ký là tham chiếu cho "log không chối được, không do deployer giữ" theo AI Act Điều 12/26 với một ngành (tài chính hoặc y tế), ở EU hoặc Việt Nam | điều kiện 2: cơ quan quản lý cần một ví dụ chạy được để viết hướng dẫn |
| **2 · 2028** | **Agent vendor đầu tiên** (khung mã nguồn mở trước, thương mại sau) dùng sổ làm gốc thẩm quyền ngoài | điều kiện 1 |
| **3 · 2029** | chuẩn v1 công bố; **ba triển khai độc lập** (không phải 9Chain); mạng vùng ngoài | trung lập phải **được chứng minh**: một vendor không tin "chuẩn" của một công ty |
| **3 · 2029** | hồ sơ tranh chấp: một vụ thật giải quyết bằng biên nhận hai chiều trên hai sổ | điều kiện 6 cần tiền lệ; tự tạo tiền lệ nhỏ trước |
| **4 · 2030** | tích hợp ví danh tính nhà nước ≥ 1 nước; SDK trong ≥ 1 siêu app; máy chủ sổ là hàng hoá | kênh phân phối (`VISION-9-YEARS`) phải sẵn trước làn sóng |
| **5 · 2031** | không có gì mới phải xây; chỉ còn phổ cập | nếu năm 5 còn phải xây thứ gì, đã trễ |

**Thước đo bốn năm**: số agent vendor tích hợp gốc ngoài · số cơ quan/ngành trích dẫn sổ cá nhân làm tham chiếu · số
hành động agent bị hiến pháp chặn đúng · số sổ hoạt động hàng tuần trên chuẩn. **Không phải số chain.**

---

## 8. Điều 9Chain không làm — vì luận điểm này

| Không làm | Vì sao |
|---|---|
| Tự làm AI agent | thành một vendor nữa ⇒ mất trung lập, thứ duy nhất nền tảng không có |
| Cạnh tranh UX với nền tảng | thua từ đầu; chiến lược là **được tích hợp**, không phải thay thế |
| Bắt buộc token để dùng sổ | vendor và cơ quan quản lý từ chối ngay |
| Hứa "người dùng sẽ muốn chain" | không ai muốn HTTPS; nhu cầu tới từ pháp luật, vendor, agent của người khác |
| Giữ dữ liệu người dùng hay log của vendor | mất tư cách "không do bị đơn giữ" và vi phạm 91/2025 |
| Chờ chuẩn của người khác | ai viết chuẩn trước sẽ là tham chiếu; AP2/ERC-7715 chưa có "gốc thẩm quyền ngoài" — chỗ trống đó là của 9Chain |

---

## 9. Rủi ro của chính luận điểm

| Rủi ro | Xác suất (đánh giá) | Chặn |
|---|---|---|
| **Nền tảng làm "sổ nội bộ đủ tốt" và cơ quan quản lý chấp nhận** | cao ở `2027–2029`, giảm sau vụ kiện đầu | 9Chain giữ ba thứ nền tảng không thể (mục 6); sandbox pháp lý sớm để định nghĩa "độc lập" |
| **Người dùng không quan tâm chủ quyền** (đúng — họ chưa từng quan tâm với email) | gần chắc | không dựa vào người dùng; dựa vào vendor, pháp luật, agent đối tác — kênh phân phối |
| **Luật đi chậm hơn dự phóng** | vừa | luận điểm lùi 2 năm, không sai; điều kiện 3–4 vẫn phải đạt đúng hạn |
| **Agent "đủ đáng tin" để người ta bỏ giới hạn** | thấp — trách nhiệm pháp lý không biến mất khi mô hình tốt hơn | hiến pháp là về **trách nhiệm**, không về năng lực mô hình |
| **9Chain không đạt điều kiện 3–4** (chi phí, UX) | phụ thuộc 9Chain | đây là toàn bộ việc của năm 1–2 |

---

## 10. Một câu kết

AI trả lời không cần blockchain. **AI hành động** cần một nơi ghi *nó được phép làm gì, nó đã làm gì, và ai cho phép*
— một nơi mà mô hình không thuyết phục được, vendor không sửa được, bị đơn không giữ, và sống lâu hơn tất cả họ. Lõi
Avalanche đã cho hình dạng của nơi đó: một chain của một người. Từ năm thứ năm, khi phần lớn AI làm thay vì trả lời,
**không có nơi đó sẽ giống như không có HTTPS** — không ai muốn, nhưng ai cũng phải có. Việc của 9Chain trong bốn năm
đầu là làm cho nơi đó **rẻ, vô hình, trung lập, và được một vendor, một cơ quan quản lý, một tiền lệ trích dẫn** —
để tới 2031, câu hỏi "agent của bạn ghi quyền ở đâu" đã có câu trả lời mặc định.

---

## Nguồn (đọc `2026-09-04`)

Lõi và nội bộ: `VISION-PERSONAL-L1-REAL-LIFE.md` (mục 2, năng lực lõi) · `PROJECTION-BILLIONS-OF-L1.md` ·
`VISION-9-YEARS-9-BILLION.md` · `ANALYSIS-WORLD-EVIDENCE-FREE-L1.md` §1c.

Thế giới: [ChatGPT 1 tỷ người dùng/tuần, Gemini 1 tỷ/tháng (8/2026)](https://thenationaldesk.com/news/americas-news-now/google-gemini-passes-1-billion-monthly-users-as-chatgpt-reaches-1-billion-weekly-users) ·
[ChatGPT statistics 2026](https://www.demandsage.com/chatgpt-statistics/) ·
[EU AI Act Điều 12 — ghi log](https://artificialintelligenceact.eu/article/12/) ·
[AI Act và log cho AI agent (Help Net Security, 4/2026)](https://www.helpnetsecurity.com/2026/04/16/eu-ai-act-logging-requirements/) ·
[AI agents và mốc 2/8/2026 (A4BEE)](https://a4bee.com/article/ai-agents-eu-ai-act-ready/) ·
[AI Act enforcement 8/2026 (Trussed)](https://trussed.ai/resources/eu-ai-act-enforcement-august-2026-guide) ·
[IMF: agentic AI and payments 2026](https://www.elibrary.imf.org/view/journals/068/2026/004/article-A001-en.xml) ·
[AP2, x402](https://www.bitontree.com/agentic-commerce-ai-agents-payments-ap2-x402) ·
[EU Digital Identity Wallet](https://en.wikipedia.org/wiki/EU_Digital_Identity_Wallet).
