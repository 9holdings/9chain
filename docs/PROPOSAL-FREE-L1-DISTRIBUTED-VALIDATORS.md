# Ai cũng tạo được L1 miễn phí — logic của validator phân tán, và đường đi

Viết `2026-09-03` đêm theo yêu cầu của David: *"phân tích các logic để giúp mọi người cùng nhau tạo các
validator phân tán và tạo thành mô hình ai cũng có thể tạo blockchain layer 1 miễn phí cho chính họ
như sứ mệnh này, tính thêm các yếu tố công nghệ sẽ phát triển trong tương lai."*

Đây là phân tích, không phải quyết định. Mọi số đo ghi nguồn; mọi giả định ghi là giả định. Tài liệu
anh em: `PLAN-108-L1-LOAD-TEST.md` (bài toán máy), D-174 (trần 15), D-178 (chi phí mỗi L1), D-180 và D-181
(khách đầu tiên và bẫy hướng dẫn). **Bản hai**, kiểm từng giả định ở đây bằng số liệu thế giới `2026` và
sửa bốn chỗ: `ANALYSIS-WORLD-EVIDENCE-FREE-L1.md`.

---

## 0. Câu trả lời ngắn

**"Miễn phí cho người tạo" không phải "không ai trả". Nó là câu hỏi *ai chạy node*, và mô hình duy nhất
mở rộng được là: người tạo chain mang cộng đồng của họ đến chạy node cho chính họ, A1 chỉ giữ mạng mẹ
và làm "nhà trẻ" trong lúc chain chưa có ai.** Kỹ thuật cho việc đó **đã nằm trong fork** (ACP-77,
`ConvertSubnetToL1Tx`, Etna đang bật) nhưng console chưa dùng; hôm nay 9 node A1 track mọi chain, nên
A1 gánh 100 % chi phí và đụng trần 15 chain.

Ba mô hình, chỉ một hợp sứ mệnh:

| Mô hình | Ai chạy validator | Trần | Ai trả | Hợp "ai cũng tạo được, miễn phí"? |
|---|---|---|---|---|
| **M1 · bể chung** (hôm nay) | node A1 track mọi chain | 15 chain, cứng | A1, 100 % | Không: là danh sách mời 15 chỗ |
| **M2 · bể chung có phân công** | node cộng đồng track chain người khác, 15 chain/node | `N × 15` chỗ | ai chạy node, cần thưởng | Nửa: mở rộng được nhưng ai chạy node cho chain lạ, và vì sao |
| **M3 · L1 chủ quyền (ACP-77)** ⭐ | cộng đồng của chính chain đó, chủ chain chọn qua hợp đồng | không có trần mạng, chỉ trần 16/node | cộng đồng chain, A1 trả P-Chain (~0,0000864 LOVE9/ngày/validator) | **Có**: "miễn phí" = anh rủ 5 người chạy node cho anh |

Đề xuất: **M3 làm xương sống, M2 làm nhà trẻ** (A1 và cộng đồng cho mượn 5 node trong 30 ngày đầu, chain
đủ validator ngoài thì rút). Cái rào chống rác không phải tiền mà là **cam kết validator**: chain chỉ được
sinh khi có ≥ 5 NodeID ký nhận trước, vì tên và chainId là vĩnh viễn (D-069).

**Và ở quy mô của sứ mệnh — một chain cho mỗi con người — mô hình trên là tầng giữa, không phải đáp án
cuối** (mục 8): chain cá nhân không phải một L1 nhỏ hơn với 5 validator lạ; nó là một cuốn sổ do chủ giữ
khoá, có bằng chứng, neo lên chain cộng đồng, và chain cộng đồng neo lên mạng mẹ. Mạng mẹ ghi 10⁴ chain,
không ghi 8 tỷ.

---

## 1. Ràng buộc thật, đã đo — mô hình nào cũng phải đứng trên chúng

| # | Ràng buộc | Số | Nguồn | Hệ quả cho thiết kế |
|---|---|---|---|---|
| 1 | Mỗi node track tối đa 16 subnet, vượt là mọi peer cắt | `peer.go:39` | D-174 | trần là **mỗi node**, không phải mỗi mạng: mô hình phải để node chọn chain |
| 2 | Mỗi L1 track tốn node ~0,05 luồng + 53 MiB dù chain im | D-178 | 15 chain/node ≈ €0,5–1 mỗi chỗ mỗi tháng trên VM €15 | validator của một chain ~€3–5/tháng cho 5 node: **rẻ tới mức cộng đồng nhỏ cũng chịu được** |
| 3 | Đẻ chain tốn 0,00023 LOVE9; phí duy trì ACP-77 ở đáy 1 nLOVE9/s/validator | D-174, `docs/PROGRESS.md` | LOVE9 chưa có giá thị trường | chi phí trên chain ≈ 0; **chi phí thật là máy**, tính bằng fiat của người chạy node |
| 4 | Tên và chainId là vĩnh viễn, sổ chỉ phình | D-069, `chainid-issued.json` | | "ai cũng tạo" mà không rào = sổ đầy rác vĩnh viễn; rào phải là **cam kết**, không phải tiền |
| 5 | Validator cần 80 % uptime để có thưởng; danh tính = 3 tệp | D-180, D-181 | khách đầu tiên mất NodeID vì hướng dẫn | mọi phần mềm cho người thường phải **giữ danh tính thay họ** |
| 6 | Bootstrap cần thấy ≥ 80 % stake; node sau NAT chỉ nối được chiều ra | D-162, D-180 | | node gia đình vẫn validate được, nhưng mỗi chain cần vài node **quay số được** |
| 7 | A1 là 9 node trên **một máy 4 nhân** | đọc `03/09` | | A1 không thể là bể validator cho ai; nó phải là **mạng mẹ nhẹ** |

---

## 2. Vì sao ACP-77 là xương sống, nói bằng cơ chế

Subnet cổ điển (hôm nay): validator của L1 **phải** là validator mạng mẹ (cọc 81 LOVE9, chạy đủ P/X/C), và
được thêm bằng `AddSubnetValidatorTx` do chủ subnet ký trên P-Chain. Không có thưởng cho việc validate
subnet. Mọi validator A1 track mọi chain vì console làm thế.

L1 chủ quyền (ACP-77, Etna, **đang bật trên A1** — `upgrade.A1`): `ConvertSubnetToL1Tx` giao quyền quản
lý tập validator cho **một hợp đồng trên chính L1** (Validator Manager, chuẩn ACP-99). Sau đó:

- Validator của L1 **không cần cọc mạng mẹ**, chỉ cần chạy node mạng mẹ ở chế độ **đồng bộ một phần**
  (`--partial-sync-primary-network`: theo P-Chain, bỏ C-Chain/X-Chain) ⇒ node nhẹ hơn nhiều.
- Chủ chain thêm/bớt validator bằng giao dịch trên L1 của mình; P-Chain chỉ ghi nhận qua Warp
  (`RegisterL1ValidatorTx`, `SetL1ValidatorWeightTx`). Uptime của validator được ghi nhận và có thể
  **trả thưởng bằng token của chính chain** (PoS native/ERC-20) hoặc PoA không thưởng.
- Mạng mẹ thu phí liên tục theo giây cho mỗi validator (đáy 1 nLOVE9/s). Với 108 chain × 5 validator
  là ~0,047 LOVE9/ngày — quỹ Ecosystem trả được hàng thế kỷ.

⇒ Với ACP-77, **trần mạng biến mất** (mỗi node chỉ track chain nó chọn, tối đa 16), **chi phí node
chuyển về cộng đồng của chain**, và A1 chỉ còn là P-Chain + C-Chain của mạng mẹ. Đó chính là hình dạng
"ai cũng tạo được": A1 không cần lớn theo số chain.

Cái giá: mỗi chain phải **có cộng đồng chạy node**. Chain không có ai thì không có blockchain, chỉ có
một cơ sở dữ liệu. Đó không phải hạn chế kỹ thuật, đó là định nghĩa.

---

## 3. Logic "miễn phí" chịu được lâu dài

### 3a. Ai trả cái gì

| Khoản | Hôm nay | Đề xuất |
|---|---|---|
| Đẻ chain (P-Chain) | ví factory của A1, 0,00023 LOVE9 | như cũ, quỹ trả, **miễn phí thật** |
| Phí duy trì validator ACP-77 | chưa có | quỹ Ecosystem trả (≈ 0 ở giá đáy); chain có doanh thu tự trả sau |
| Máy chạy validator | A1, 100 % | **cộng đồng của chain** (M3); A1 + tình nguyện cho mượn 30 ngày đầu (nhà trẻ) |
| RPC công khai cho chain | node-1/2 của A1 | chủ chain hoặc pool, node track ≤ 16 |
| Thưởng cho người chạy node hộ | không có | LOVE9 theo uptime đo được (từ quỹ Staking 40 % hoặc Ecosystem 12 %), **có trần theo tháng**, và/hoặc token của chính chain |

### 3b. Rào chống rác mà không thu tiền

Tên và chainId sống vĩnh viễn (D-069), nên cửa mở tự do là sổ đầy rác. Rào đề xuất, theo thứ tự rẻ:

1. **Cam kết validator trước khi sinh**: form tạo chain đòi ≥ 5 NodeID + chữ ký của từng node (thông
   điệp "tôi sẽ validate chain X"). Không có 5 người thì chưa phải cộng đồng, chưa cần chain.
2. **Nhà trẻ có hạn**: A1 cho mượn tối đa 5 node trong 30 ngày; chain không tự có ≥ 3 validator ngoài
   sau 30 ngày thì **ngủ đông** (rút node nhà trẻ, chain dừng đẻ block, tên giữ, dữ liệu giữ), đánh thức
   khi có validator.
3. **Cọc hoàn lại bằng LOVE9 từ faucet**: chỉ để chống bot, không phải doanh thu; hoàn khi chain sống
   90 ngày.
4. **Không gian tên theo chủ**: tên chain đi kèm ví tạo (`bbway.love9`-kiểu), giảm tranh tên toàn cục.

### 3c. Vì sao người ta chạy node cho người khác (M2, nhà trẻ)

Ba động cơ, xếp theo độ bền: (1) **có đi có lại** — validate cho tôi, tôi validate cho anh; hợp đồng ghi
nhận tín dụng validator-ngày; (2) **thưởng LOVE9** theo uptime, có trần; (3) **uy tín** — bảng xếp hạng
uptime công khai, NodeID là danh tính. Đo được cả ba bằng số P-Chain/Warp đã có; không cần tin ai.

---

## 4. Kiến trúc đề xuất, theo giai đoạn — mỗi giai đoạn tự đứng được

### Giai đoạn 1 · Chuyển console sang L1 chủ quyền (mốc mới, trước P-59)

- `createChain` sinh subnet → chain → **`ConvertSubnetToL1Tx`** với Validator Manager **PoA** cài sẵn trong
  genesis (chủ chain là admin), validator ban đầu = 5 node nhà trẻ của A1 (không phải 9).
- Node A1 chạy chain nhà trẻ với **phân công** (mỗi node ≤ 15) thay vì track-all — đây chính là mục 4.1
  của `PLAN-108-L1-LOAD-TEST.md`, dùng chung.
- Chủ chain thêm node cộng đồng qua giao diện: dán NodeID + BLS public key + PoP (node tự in bằng
  `info.getNodeID`), ký trên L1. A1 rút node nhà trẻ khi chain đủ 5 validator ngoài.
- Điều kiện qua: một chain sống với **0 node A1** trong tập validator, đẻ block, RPC do cộng đồng phục vụ.

### Giai đoạn 2 · "Node trong hộp" cho người thường

- Một lệnh `docker compose up`: node mạng mẹ **đồng bộ một phần** + plugin EVM, tự giữ `./staking`,
  tự sao lưu danh tính mã hoá, tự kiểm 9651 từ ngoài (dùng `check-outsider-bootstrap` làm dịch vụ),
  chọn chain muốn validate từ danh bạ, tự đăng ký (in sẵn thông điệp cho chủ chain duyệt).
- Hỗ trợ ARM (Raspberry Pi 5 / Mac mini): đo D-178 nói một node 15 chain im cần ~1 luồng + 1,5 GB —
  vừa với máy gia đình. Nút đo: bảng "chain của tôi: uptime, thu nhập, block cuối".
- Điều kiện qua: một người lạ, chưa từng chạy node, lên validator đúng NodeID sau 30 phút, và **sống qua
  một lần `docker compose down -v`**.

### Giai đoạn 3 · Bể validator có phân công và thưởng

- Sổ cam kết on-chain (hợp đồng trên C-Chain mạng mẹ): chain xin `V` validator, node xung phong, phân
  công tự động ≤ 15/node, ưu tiên node **quay số được** để mỗi chain có ≥ 2 node inbound.
- Thưởng LOVE9 theo uptime đọc từ P-Chain/Warp, trả theo epoch (Granite đã có epoch 30 s trên A1),
  trần tháng; xếp hạng công khai.
- Điều kiện qua: 36 chain × 5 validator trên ≥ 20 node của ≥ 10 người khác nhau, không node A1.

### Giai đoạn 4 · Liên thông và mở rộng (khi có cầu)

- Warp/ICM + Teleporter cài sẵn trong genesis (P-59) để chain con nói chuyện với nhau và với C-Chain —
  cầu tài sản là lý do người ta muốn ở trong **một** mạng thay vì tự dựng Avalanche riêng.
- Namespace tên, thị trường RPC, ngủ đông/đánh thức tự động.

---

## 5. Công nghệ tương lai đáng tính từ bây giờ

Chia làm hai: **đã có trong fork, chưa dùng** và **đang đến, thiết kế phải chừa chỗ**. Số hiệu ACP theo lộ
trình công khai của Avalanche; kiểm lại số hiệu trước khi trích dẫn ra ngoài.

| Công nghệ | Trạng thái trên A1 | Ảnh hưởng tới mô hình |
|---|---|---|
| **ACP-77 L1 chủ quyền** (Etna) | bật, **chưa dùng** | xương sống mục 2 |
| **ACP-99 Validator Manager chuẩn** + bộ hợp đồng ICM (PoA, PoS native/ERC-20) | mã nguồn mở Ava Labs, chưa nhúng | không tự viết; nhúng vào genesis chain con (P-59 hình dạng) |
| **Đồng bộ một phần mạng mẹ** | có trong binary | node cộng đồng bỏ C-Chain/X-Chain: nhẹ 3–5× (cần đo) |
| **Warp + tổng hợp chữ ký (ACP-118, Fortuna)** | bật | mọi luồng ACP-77 đi qua đây; là cầu tài sản sau này |
| **Epoch P-Chain (Granite)** | bật, 30 s | nhịp trả thưởng và đo uptime |
| **Helicon** (nâng cấp kế tiếp của upstream) | **chưa lên lịch cho A1**, chủ quyền | quyết định của 9Chain khi rebase; đừng để `Default` nuốt |
| **Thực thi bất đồng bộ / gas động (ACP-194, ACP-176)** | theo upstream | tăng throughput mỗi chain, giảm `c_tx` — hạ chi phí validator |
| **Firewood** (DB trạng thái mới của Ava Labs) | chưa | giảm đĩa và I/O, đúng tường mềm số 2 của `PLAN-108` |
| **Light client / bằng chứng hợp lệ (ZK)** | nghiên cứu | validator "kiểm không cần chạy": một ngày nào đó 5 node thật + N người kiểm bằng điện thoại |
| **Bảo mật dùng chung / restaking** (Suzaku và tương tự trên Avalanche) | ngoài | bể bảo mật thuê theo giờ cho chain chưa có cộng đồng — thay nhà trẻ của A1 |
| **VM nhẹ hơn EVM (HyperSDK, WASM)** | ngoài | chain không cần EVM thì validator rẻ hơn nữa; console nên trừu tượng VMID |
| **Máy gia đình ARM, mạng gia đình IPv6** | thị trường | bỏ được bài toán NAT (tường 6) khi IPv6 phổ biến; hộp node ARM là mục tiêu giai đoạn 2 |

Nguyên tắc thiết kế để không bị các thứ trên làm lỗi thời: **console chỉ giữ ba việc** — sổ tên/chainId,
sinh genesis, và sổ cam kết validator. Việc quản lý validator để trong hợp đồng trên chain con (ACP-99),
việc chạy node để trong hộp node. Mỗi lớp đổi công nghệ mà không kéo lớp kia.

---

## 6. Rủi ro và phép đo cho từng cái

| Rủi ro | Vì sao thật | Đo/chặn |
|---|---|---|
| **Sybil**: 5 validator là 5 container của một người | miễn phí nên không có gì cản | không chặn hoàn toàn; đo: IP/ASN khác nhau cho ≥ 3 node, thưởng chỉ trả cho node quay số được từ ngoài |
| **Rụng đồng loạt**: cộng đồng bỏ, chain chết | chain nhỏ | ngủ đông thay vì xoá; tên giữ; đánh thức cần ≥ 3 node |
| **Thưởng bị vắt**: node chỉ chạy lúc đo | uptime đo qua kết nối | uptime ACP-77 do các validator khác ghi liên tục; trần tháng |
| **Rác trong sổ tên** | vĩnh viễn | cam kết trước khi sinh + namespace theo chủ |
| **A1 vẫn một máy** (tường 7) | mạng mẹ chết là mọi chain con mất P-Chain | 9 node A1 sang ≥ 3 máy/nhà cung cấp — việc riêng, trước mọi thứ ở đây |
| **Người thường mất danh tính** (D-181 lặp lại) | phần mềm | hộp node giữ và sao lưu danh tính; cổng kiểm "NodeID không đổi sau restart" |

---

## 7. Việc kế tiếp, cụ thể và theo thứ tự

1. **[human]** chốt M3 + nhà trẻ làm hướng; chốt rào "≥ 5 NodeID cam kết trước khi sinh".
2. **[A1, băng tập]** thử `ConvertSubnetToL1Tx` + PoA Validator Manager trên một chain tập; đo: chain sống
   với validator **không cọc mạng mẹ**, node đồng bộ một phần — ra số "node nhẹ tốn bao nhiêu".
3. **[A1]** console: phân công validator (dùng chung với `PLAN-108`), rồi đường sinh chain ACP-77.
4. **[A1]** hộp node cho người thường, kèm cổng "NodeID sống qua `down -v`" — bài học D-181 thành cổng.
5. **[human]** kinh tế thưởng: quỹ nào, trần bao nhiêu, đo uptime ở đâu — sau khi 2 và 3 có số.
6. **[A1]** viết lại `RUN-A-VALIDATOR.md` thành hai đường: *validator mạng mẹ* (như nay) và *validator
   cho một chain con* (mới, nhẹ hơn).

---

## 8. Từ 108 tới 8 tỷ — đọc sứ mệnh bằng vật lý của kiến trúc

David gửi bản tuyên ngôn *"9Chain và tương lai của nhân loại trong kỷ nguyên AI"* trong lúc viết tài
liệu này: **mỗi con người một blockchain**, AI hành động thay người dưới một **hiến pháp số** ghi trên
chain đó, hàng tỷ chain nối thành một mạng. Phần trên trả lời cho *chain cộng đồng* (hàng trăm tới hàng
chục nghìn). Sứ mệnh đòi thêm ba bậc độ lớn, và ở đó một số giả định phải đổi.

### 8a. Cái gì KHÔNG đi tới 8 tỷ

| Giả định của mục 1–7 | Ở 8 tỷ chain | Vì sao |
|---|---|---|
| Mỗi chain ≥ 5 validator của cộng đồng | **Sai**: chain cá nhân không có cộng đồng, nó có **một chủ** | 5 validator cho mỗi người = 40 tỷ node; và người ta không rủ 5 người lạ để giữ sổ riêng |
| P-Chain mạng mẹ ghi mọi validator và thu phí liên tục | **Không chịu nổi**: 8 tỷ bản ghi validator + hàng tỷ `RegisterL1ValidatorTx` | P-Chain là một chain; nó đăng ký được ~10⁴–10⁶ L1, không phải 10⁹ (số cần đo, bậc độ lớn) |
| Validator chạy node mạng mẹ (kể cả đồng bộ một phần) | **Không**: điện thoại không chạy avalanchego | node mạng mẹ phải giữ P-Chain; P-Chain 8 tỷ chain thì không thiết bị cá nhân nào giữ |
| ChainId EIP-155 toàn cục cho mỗi chain | **Hết số**: dải A1 là ~10⁹ id, mỗi thế hệ 10⁶ (`PROPOSAL-GENERATION-IDS`) | và sổ chainid.network không phải chỗ cho 8 tỷ dòng |

⇒ **Chain cá nhân không thể là một L1 Snowman với tập validator riêng ghi trên P-Chain.** Không phải vì
thiếu máy, mà vì *mô hình đồng thuận sao chép* (mọi validator chạy lại mọi giao dịch) không phải công cụ
cho "sổ của một người". Thứ đúng cho một người là **sổ do chủ ghi, ai cũng kiểm được, neo vào mạng chung**.

### 8b. Mô hình ba tầng — chain cá nhân là tầng khác, không phải L1 nhỏ hơn

```
Tầng 0  MẠNG MẸ (9Chain P/C-Chain)       ~10 node công khai, đồng thuận sao chép
        sổ gốc: tên, thế hệ, neo của các chain cộng đồng, thưởng, quỹ

Tầng 1  CHAIN CỘNG ĐỒNG / TỔ CHỨC        10³–10⁵ chain, ACP-77, ≥ 5 validator của cộng đồng
        (mục 1–7 của tài liệu này)        MỖI CHAIN LÀ MỘT SỔ ĐĂNG KÝ cho chain cá nhân bên dưới nó

Tầng 2  CHAIN CÁ NHÂN                     10⁹–10¹⁰, "hiến pháp số" của một người
        chủ = người đó (khoá), người ghi = thiết bị + AI agent của họ,
        kiểm = bằng chứng (chữ ký, cam kết trạng thái, sau này ZK), neo định kỳ lên tầng 1
```

Vì sao tầng 2 vẫn xứng đáng gọi là blockchain của người đó: **chủ quyền** (khoá của họ, không ai chỉnh
được sổ), **bất biến có bằng chứng** (mỗi khối ký, gốc trạng thái neo lên tầng 1 nên chủ cũng không viết
lại lịch sử được mà không lộ), **tương tác** (Warp/ICM từ tầng 1 xuống, hợp đồng đọc được neo), và
**thu hồi tức thì** (hiến pháp là hợp đồng trên chain cá nhân, người giữ khoá gốc). Cái nó **không** có
là *đồng thuận của người lạ* — và một cuốn sổ cá nhân không cần điều đó, cũng như sổ tay của anh không cần
năm người lạ gật đầu mỗi lần anh viết.

Hình dạng đệ quy này là câu trả lời cho "Internet of Blockchains" trong tuyên ngôn: **P-Chain không ghi 8
tỷ chain; nó ghi 10⁴ chain cộng đồng, mỗi chain cộng đồng ghi 10⁵ chain cá nhân.** Tên cũng đệ quy:
`david.9s-union.love9` thay vì một chainId toàn cục — hết bài toán dải số.

### 8c. Hiến pháp số = đúng những nguyên thuỷ mốc `L1-CUSTOM` đang làm

Tuyên ngôn liệt kê: AI nào đại diện · truy cập dữ liệu nào · dùng bao nhiêu tài sản · ký loại giao dịch
nào · khi nào phải hỏi lại · thu hồi ngay · bằng chứng mọi hành động. Trong subnet-evm hôm nay đó là:

| Điều khoản hiến pháp | Nguyên thuỷ có sẵn | Ở mốc |
|---|---|---|
| AI nào được gửi giao dịch | `txAllowList` precompile (khoá của agent = một địa chỉ) | P-58 |
| AI nào được deploy/đổi luật | `contractDeployerAllowList`, admin = khoá người | P-58 |
| Dùng bao nhiêu tài sản, ký loại gì | account abstraction / hợp đồng ví có hạn mức, session key theo agent | P-59 (thư viện cài sẵn) |
| Khi nào phải hỏi lại | ngưỡng trong hợp đồng ví: quá mức ⇒ chờ chữ ký người | P-59/P-60 |
| Thu hồi ngay | admin gỡ địa chỉ khỏi allowlist, một giao dịch | P-60 (trang quản trị) |
| Bằng chứng | chính chain: mọi hành động của agent là giao dịch có chữ ký, có khối | có sẵn |
| Nhiều AI, nhiều vai | mỗi agent một khoá, quyền theo khoá | P-56 (nhiều địa chỉ genesis) |

⇒ Việc đang làm (ký hiệu token → số cấp → precompile chọn từng cái → hợp đồng cài sẵn → trang quản trị)
**chính là** đang xây hiến pháp số, chỉ đang xây ở tầng 1. Khi tầng 2 ra đời, cùng bộ nguyên thuỷ đó
chạy trên chain cá nhân; console không cần thiết kế lại luật, chỉ đổi nơi chạy.

### 8d. Công nghệ phải có để tầng 2 tồn tại (chưa có hôm nay, phải chừa chỗ)

| Thiếu | Vì sao chặn | Đang tới |
|---|---|---|
| **Kiểm không cần chạy lại** | tầng 1 không thể chạy lại 10⁵ chain con; phải kiểm bằng bằng chứng | bằng chứng hợp lệ ZK cho EVM (zkEVM) đang rẻ dần; trước mắt: cam kết trạng thái ký + fraud proof |
| **Neo hàng loạt** | 10⁵ chain neo mỗi phút lên một chain cộng đồng = 10⁵ giao dịch/phút | gộp neo theo cây Merkle: một giao dịch neo 10⁵ gốc; Warp đã có để chuyển gốc lên tầng 0 |
| **Sổ cá nhân chạy trên thiết bị cá nhân** | avalanchego + subnet-evm không dành cho điện thoại | VM nhẹ (HyperSDK/WASM) hoặc EVM client nhẹ; Firewood giảm đĩa; hoặc AI agent của người đó **là** người ghi sổ, chạy ở đâu người đó chọn |
| **Tính sẵn có dữ liệu** | chủ mất thiết bị là mất sổ | chủ tự sao lưu mã hoá + tầng 1 giữ bản mã hoá (DAS); danh tính = khoá, không phải máy — bài học D-181 ở quy mô 8 tỷ |
| **Danh tính người thật** | 8 tỷ chain cần 8 tỷ người, không phải 8 tỷ bot | không ở tầm A1; chừa giao diện: tầng 1 quyết ai được đăng ký chain cá nhân dưới nó |

### 8e. Điều này đổi gì trong việc kế tiếp

Không đổi thứ tự mục 7. Nó **thêm** một điều kiện vào mỗi bước: *thiết kế tầng 1 sao cho nó làm được sổ
đăng ký cho tầng 2*. Cụ thể: sổ tên đệ quy (tên dưới tên), hợp đồng "neo" chuẩn trong bộ cài sẵn P-59,
và console giữ VMID trừu tượng để một ngày VM nhẹ thay EVM ở tầng 2 mà tầng 1 không biết.

Và một câu để giữ cho tuyên ngôn và kỹ thuật không rời nhau: **"một blockchain cho mỗi người" nghĩa là
mỗi người giữ khoá của một cuốn sổ có bằng chứng và có neo — không nghĩa là mỗi người có năm validator
lạ.** Cái đầu làm được với công nghệ đang tới; cái sau không làm được với bất kỳ công nghệ nào, vì nó
không phải thứ người ta cần.

*Nguồn: `upgrade/upgrade.go` (Etna/Fortuna/Granite bật cho A1) · D-069 · D-174 · D-178 · D-180 · D-181 ·
`docs/PROGRESS.md` (phí ACP-77) · `PLAN-108-L1-LOAD-TEST.md` · `PROPOSAL-GENERATION-IDS.md` · tuyên ngôn
"9Chain và tương lai của nhân loại trong kỷ nguyên AI" (David, `03/09`).*
