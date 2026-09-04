# Thiết bị di động làm validator — cái gì được, cái gì không, và đường đi cho 9Chain

Viết `2026-09-04`, tiếp nối `PROPOSAL-FREE-L1-DISTRIBUTED-VALIDATORS.md` (mô hình ba tầng) và
`ANALYSIS-WORLD-EVIDENCE-FREE-L1.md` (đối chiếu thế giới). Câu hỏi của David: *"hướng đi thiết bị di
động làm validator trong tương lai thì sao."* Tài liệu này là **phân tích**, không phải quyết định; số của
A1 lấy từ D-178, số thế giới đọc `04/09` (nguồn cuối tệp). Chỗ nào chưa đo thì ghi *chưa đo*.

---

## 0. Câu trả lời ngắn

1. **Điện thoại trong túi làm validator toàn phần** (chạy `avalanchego`, bỏ phiếu Snowman, 80 % uptime):
   **không**, và lý do **không phải phần cứng**. CPU/RAM của điện thoại 2026 dư cho một node A1
   (D-178: `0,07–0,25` core + `~300 MiB` + `53 MiB`/L1). Ba thứ chặn nằm **ngoài tầm phần mềm của mình**:
   hệ điều hành giết tiến trình nền (iOS cấm hẳn; Android 15/16 giới hạn dịch vụ nền `dataSync` **6 giờ /
   24 giờ**, và OEM còn giết mạnh hơn AOSP), mạng di động **CGNAT + đổi IP + radio ngủ**, và **uptime của
   một con người** (điện thoại tắt, hết pin, vào thang máy) không bao giờ đạt sàn 80 %.
2. **Điện thoại cũ cắm sạc, Wi-Fi nhà**: đó **không phải** "điện thoại", đó là **một máy Linux ARM64 có pin
   dự phòng**, giá 0 đồng. `avalanchego` đã build `linux/arm64` sẵn (`scripts/build_image.sh`), cờ
   `--partial-sync-primary-network` có sẵn. Đây là **"hộp node" giai đoạn 2 rẻ nhất có thể** — khả thi
   hôm nay, **chưa đo**. Điều kiện qua ở mục 5.
3. **Điện thoại trong túi làm MỘT PHẦN của validator**: đường đúng, và **fork đã có sẵn thứ làm nó thành
   thật**: `avalanchego 1.14.2` của A1 cho phép chọn engine **Simplex** cho từng subnet
   (`subnets/config.md` §Consensus Config). Trên Snowman, phiếu là **một gói tin từ kết nối TLS** ⇒ chia
   khoá không giúp gì, vì thứ phải "sống" là **tiến trình**. Trên Simplex, phiếu là **chữ ký BLS** ⇒ chia
   ngưỡng được ⇒ một validator = `t-of-n` thiết bị, điện thoại ngủ 40 % thời gian **vẫn được**. ⇒ Mục 2
   của backlog (*"DVT cho `signer.key` BLS"*) phải đổi câu hỏi: **không phải "chia khoá BLS được không"**
   (được, toán học có sẵn) mà **"chain con chạy Simplex hay Snowman"** — vì chỉ một trong hai có gì để chia.
4. **Điện thoại làm chủ chain cá nhân tầng 2**: vai trò **tự nhiên** và **không cần validator**. Tầng 2 là
   sổ do chủ ghi, kiểm bằng bằng chứng, neo lên tầng 1 (PROPOSAL §8b); điện thoại là **nơi giữ khoá và ký**,
   không phải nơi bỏ phiếu. Vai này không chờ công nghệ nào.

Một câu sửa cho bảng §8a của PROPOSAL: *"điện thoại không chạy avalanchego"* đúng cho **mạng mẹ của 8 tỷ
chain** (P-Chain ấy không thiết bị cá nhân nào giữ), nhưng **sai nếu đọc thành "điện thoại không chạy
được avalanchego"**: chạy được, vấn đề là **sống nền** và **được gọi tới**.

---

## 1. Đo đúng đại lượng — năm trục, và trục nào mới chặn

Bài học §2 `CLAUDE.md`: hỏi *đo đại lượng nào* trước khi kết luận. "Điện thoại có làm validator được không"
thường bị trả lời bằng CPU/RAM, mà đó là **hai trục không chặn**.

| Trục | Validator A1 cần (đo D-178, chain con im) | Điện thoại 2026 | Chặn? |
|---|---|---|---|
| **Tính toán** | `0,07` core/node nền · `+0,05` core mỗi L1 track · trần 15 L1 ≈ `0,8` core | 8 lõi ARM, lõi lớn ngang laptop 4–5 năm tuổi | **Không** |
| **RAM** | `~300 MiB` avalanchego + `53 MiB` mỗi plugin subnet-evm ⇒ 10 L1 ≈ `0,9 GB` | 8–12 GB | **Không** |
| **Đĩa** | mạng mẹ đồng bộ một phần chỉ giữ P-Chain (A1: nhỏ) + chain con; C-Chain bơm 9 tx/s **bỏ qua** được | 128–256 GB flash, nhưng flash điện thoại chịu ghi kém NVMe | **Chưa đo** — phải đo tốc độ phình của một L1 thật |
| **Mạng** | cần được peer **gọi tới** để bị lấy mẫu; ràng buộc 6 PROPOSAL: sau NAT vẫn validate được nhưng chỉ chiều ra | di động: **CGNAT** trên IPv4 (không inbound); IPv6-only + 464XLAT phổ biến; IP đổi theo cell; **radio ngủ** giữa các gói ⇒ độ trễ nhảy bậc | **Có** — và chỉ giảm chứ không hết khi IPv6 phổ biến |
| **Sống liên tục** | 80 % uptime cho thưởng (ràng buộc 5); Snowman lấy mẫu liên tục | iOS: **không có daemon**, App Store cấm; Android 15/16: `dataSync` FGS **6 h/24 h**, Doze, OEM kill (dontkillmyapp); người dùng tắt máy | **Có — nặng nhất** |
| **Danh tính, khoá** | 3 tệp (`staker.crt/key`, `signer.key`) đọc từ **đĩa**; mất là đổi NodeID (D-181) | có Secure Enclave / StrongBox, nhưng `avalanchego` **không dùng** keystore phần cứng; khoá nằm trong sandbox app; mất máy = mất danh tính | **Có** — ở quy mô người thường |

Kết luận của bảng: **ba trục chặn đều là hệ điều hành, mạng và con người — không phải silicon.** Điều đó
đổi câu hỏi. Không phải *"bao giờ điện thoại đủ mạnh"* (đã đủ từ vài năm), mà là *"hình dạng validator nào
chịu được một thành viên ngủ 40 % thời gian và không gọi tới được"*. Câu đó có lời giải (mục 3), và lời
giải không nằm ở điện thoại mà ở **giao thức**.

### 1b. Về IPv6 — thứ duy nhất trong ba trục chặn đang tự tốt lên

`avalanchego` mã hoá địa chỉ peer bằng **16 byte** (`network/peer/ip.go`), tức IPv6 là công dân hạng
nhất trong giao thức. Nhưng **toàn bộ đường đo của A1 hôm nay là IPv4**: `check-outsider-bootstrap` quay số
9 cổng IPv4, `RUN-A-VALIDATOR.md` in `--public-ip` IPv4, và 9 node A1 sau Docker chỉ khai IPv4. Google đo
IPv6 ở `45–50 %` người dùng toàn cầu (4/2026), phần lớn là **di động** — nghĩa là điện thoại là thiết bị
**có sẵn địa chỉ công khai** nhiều hơn máy bàn, và A1 **chưa có đường nào nhận nó**. Đây là nợ rẻ để trả
trước khi cần: một node A1 khai kép IPv4/IPv6, và cổng bootstrap đo cả hai họ.

---

## 2. Thế giới 2026 đang làm gì với điện thoại

| Dự án | Điện thoại làm gì | Là validator không? | Bài học cho 9Chain |
|---|---|---|---|
| **Ethereum — The Verge** | mục tiêu công khai *"node đầy đủ trên điện thoại, đồng hồ"* bằng stateless client + cây nhị phân + bằng chứng ZK; 2026 đang chuyển cây trạng thái | **chưa** — validator trên điện thoại chưa ship; mục tiêu là *kiểm* trên điện thoại | cách để điện thoại "validate" là **kiểm bằng chứng**, không chạy lại — đúng tầng 2 của PROPOSAL §8d |
| **Celestia — Lumina** | light node trong trình duyệt / điện thoại, lấy mẫu tính sẵn có dữ liệu (DAS) | **không** — không tạo block, không bỏ phiếu | điện thoại = **nhân chứng dữ liệu**: hàng triệu máy kiểm mà không cần uptime |
| **Minima** | L1 *mobile-native*: hàng nghìn node đầy đủ trên Android từ 2023, app cập nhật 6/2026; đang nhúng vào drone/phần cứng ARM | **có**, nhưng vì **giao thức được thiết kế cho điện thoại từ đầu** (mạng nhỏ, thông lượng thấp) | làm được **nếu giao thức chịu node ngủ**; không phải bằng cách ép Snowman lên điện thoại |
| **Blockene** (OSDI 2020) | "citizen" trên điện thoại kiểm bằng lấy mẫu; "politician" trên máy chủ giữ trạng thái; đo: `61 MB/ngày`, `3 % pin/ngày` | **nửa**: điện thoại bỏ phiếu nhưng không giữ trạng thái | **chia vai**: máy thật giữ, điện thoại kiểm và ký — chính là mô hình mục 3 |
| **Helium / Nodle / mobiNODE** | góp sóng, vị trí, "proof of mobile"; Helium `371 k` hotspot sống | **không** — không đồng thuận | thứ điện thoại góp tốt nhất là thứ **máy chủ không có**: vị trí, sự hiện diện, con người thật |
| **Obol / SSV — DVT** | cụm 4+ máy chủ chia một khoá validator; EF đưa `72 k ETH` lên DVT-lite 3/2026 | có, nhưng **chưa ai đưa điện thoại vào cụm** | DVT ra đời để chịu **một thành viên rụng** — đúng cái điện thoại cần; và **nó chỉ có nghĩa khi phiếu là chữ ký** |

Đọc bảng: **trong 2026 không có validator BFT/PoS thật nào chạy trên điện thoại trong túi ở một mạng
lớn.** Mọi đường thành công đều là một trong ba: điện thoại **kiểm** (Verge, Lumina), điện thoại **ký một
phần** (DVT, Blockene), hoặc **giao thức được viết lại cho điện thoại** (Minima). Không đường nào là "cài
client máy chủ lên điện thoại rồi mong nó sống".

---

## 3. Ba vai cho điện thoại, khớp mô hình ba tầng

```
Tầng 0  mạng mẹ            KHÔNG có điện thoại — P-Chain phải luôn sống, 9 node thật (ràng buộc 7 còn nguyên)

Tầng 1  chain cộng đồng    VAI A  "hộp node" = điện thoại cũ cắm sạc, Wi-Fi nhà (một máy ARM64, hôm nay)
                           VAI B  điện thoại trong túi = MỘT MẢNH khoá của một validator Simplex (t-of-n)
                                  + nhân chứng nhẹ (light client) cho chain của cộng đồng mình

Tầng 2  sổ cá nhân         VAI C  điện thoại = CHỦ sổ: giữ khoá, ký, neo; không bỏ phiếu cho ai
```

### Vai A — "Hộp node" từ điện thoại cũ (tầng 1, khả thi hôm nay, chưa đo)

- **Là gì**: Android cũ + `avalanchego` `linux/arm64` + plugin subnet-evm, chạy `--partial-sync-primary-network`,
  track 1–3 chain con. Cắm sạc, Wi-Fi nhà. Hai cách chạy: (a) **Termux/proot** — nhanh, nhưng vẫn là một app
  Android và bị luật nền của Android; (b) **flash Linux thật** (postmarketOS/LineageOS root) — lúc đó nó là
  Raspberry Pi có pin, mọi luật Android biến mất, giá là người dùng phải biết flash.
- **Gì chặn**: luật nền Android (`dataSync` 6 h/24 h ở API 35+, OEM kill) — với cách (a) phải giữ app ở
  **tiền cảnh** hoặc dùng loại FGS không bị trần; và **NAT nhà**: giống hệt khách `03/09` — nối được chiều
  ra, không được gọi tới, nên cần chain có ≥ 2 node quay số được (ràng buộc 6).
- **Được gì**: một "hộp node" giá **0 đồng phần cứng**, ~`2–3 W`; và một câu chuyện dễ kể cho cộng đồng:
  *"cái điện thoại cũ trong ngăn kéo là một validator."*
- **Sứ mệnh nói gì**: đây là đường **rẻ nhất** để tới 10⁴ node của mục 3 PROPOSAL, vì số điện thoại cũ
  trong ngăn kéo lớn hơn số Raspberry Pi người ta sẽ mua.

### Vai B — Một mảnh của validator Simplex, và nhân chứng nhẹ (tầng 1, sau khi đo Simplex)

- **Cơ chế**: chain con chọn engine **Simplex** (fork đã có: `simplexParameters` trong subnet config,
  `SimplexHandler` trong engine). Phiếu Simplex là **chữ ký BLS** được gộp thành notarization ⇒ khoá của một
  validator chia `t-of-n` (DKG kiểu Obol) cho `n` thiết bị, trong đó **vài cái là điện thoại**. Chỉ cần `t`
  thiết bị thức là phiếu được ký. **Tiến trình node** (nối mạng, nhận block, giữ trạng thái) vẫn chạy ở
  **một máy luôn sống** (hộp node vai A hoặc VPS của cộng đồng); điện thoại **chỉ ký**, vài KB mỗi block.
- **Vì sao Snowman không cho làm thế**: phiếu Snowman (`Chits`) là **gói tin** trả lời một truy vấn lấy mẫu,
  đi trên kết nối TLS mang NodeID. Không có chữ ký để chia; thứ phải sống là **socket**. Chia `signer.key`
  BLS trên Snowman chỉ làm Warp (ICM) chịu lỗi, không làm phiếu chịu lỗi. ⇒ **Mục 2 backlog đổi đề bài**:
  đo Simplex trước, DVT sau.
- **Chưa biết, phải đo**: Simplex trên A1 chưa từng chạy (mọi chain con đều Snowman qua console); ngưỡng
  `maxNetworkDelay` của Simplex có chịu độ trễ điện thoại không; và **cái giá về liveness**: nếu quá `n−t`
  điện thoại ngủ cùng lúc thì validator đó im, cần luật *"validator cụm phải có ≥ `t` máy cắm điện"* —
  giống luật *"≥ 2 node quay số được"* đã có.
- **Nhân chứng nhẹ** (không chờ Simplex): một light client subnet-evm/Warp trên điện thoại kiểm block header +
  chữ ký validator của chain cộng đồng mình, báo khi chain im hoặc fork. Không bỏ phiếu, không uptime; đây
  là "Lumina cho L1 của mình", và là thứ giúp cộng đồng **thấy** chain của họ sống mà không cần tin RPC.

### Vai C — Chủ sổ cá nhân (tầng 2, không cần validator)

- Tầng 2 theo PROPOSAL §8b: kho ký Merkle theo mẫu ATProto + hợp đồng hiến pháp + neo gộp lên tầng 1.
  **Không có tập validator** ⇒ câu hỏi "điện thoại làm validator" **không đặt ra** ở tầng này. Điện thoại
  là **chủ**: giữ khoá gốc (Secure Enclave dùng được vì đây là mã của mình, không phải `avalanchego`), ký
  khối của sổ mình, đẩy bản mã hoá lên máy chủ sổ của chain cộng đồng, và **ký neo**.
- Đây là nơi điện thoại **mạnh hơn máy chủ**: sinh trắc, hiện diện, "khi nào phải hỏi lại" (§8c) — ngưỡng
  trong hợp đồng ví cần một cái gật của **người**, và người đang cầm điện thoại.

---

## 4. Thứ tự ưu tiên — và vì sao không phải theo độ hấp dẫn

| # | Việc | Vì sao đứng ở đó | Tốn |
|---|---|---|---|
| 1 | **Đo Simplex trên băng tập** (một chain con `simplexParameters`, 5 node, đo `maxNetworkDelay` chịu được với 1 node có độ trễ 200–500 ms + rụng 40 % thời gian) | quyết định vai B **có tồn tại không**; và là cùng chuyến với mục 1 backlog (ACP-77 trên băng tập) | 1–2 ngày |
| 2 | **Vai A thử thật**: một Android cũ, Termux, `avalanchego` arm64, join băng tập, 7 ngày | rẻ nhất, cho số **thật** về pin/MB/uptime/NodeID mà mọi tài liệu sau này trích | 1 ngày dựng + 7 ngày chờ |
| 3 | **IPv6 kép** cho node A1 + `check-outsider-bootstrap` đo hai họ địa chỉ | rào duy nhất tự tốt lên; trả nợ trước khi điện thoại xuất hiện thật | 1 ngày |
| 4 | **Nhân chứng nhẹ** cho chain cộng đồng (light client Warp/header trên điện thoại) | không chờ gì; là mặt sản phẩm đầu tiên của "điện thoại trong mạng" | tuần |
| 5 | **DVT ngưỡng cho validator Simplex** với điện thoại là 1–2 trong `n` | chỉ sau khi 1 nói Simplex chịu được | tuần–tháng |
| — | Ép `avalanchego` Snowman sống nền trên iOS/Android tiêu dùng | **không làm**: đánh nhau với hệ điều hành là trận thua từ đầu, và Apple không cho ship | — |

Vai C không nằm trong bảng vì nó đi theo backlog tầng 2 đã có (mục 3 backlog), không cần việc riêng.

---

## 5. Điều kiện qua — viết trước khi làm, để không tự chấm xanh

- **Vai A**: một điện thoại Android **cũ** (không phải máy dev), join băng tập `A1IDTap`, **7 ngày**:
  uptime ≥ `95 %` đo bằng `watch-network` từ **máy khác**; NodeID **không đổi** qua 3 lần khởi động lại +
  1 lần app bị hệ điều hành giết; dữ liệu `< 500 MB/ngày`; pin: máy **không nóng quá 40 °C** khi cắm sạc.
  Đối chứng ngược: rút sạc 8 giờ ⇒ phải thấy uptime rơi **và** cổng nói đúng lý do.
- **Simplex**: chain tập 5 validator Simplex đẻ block đều; **tắt 1 validator** ⇒ chain vẫn đẻ block; cho 1
  validator độ trễ nhân tạo `500 ms` ⇒ đo block time đổi bao nhiêu. Đối chứng ngược: đặt `maxNetworkDelay`
  thấp hơn độ trễ ⇒ phải thấy chain **chậm/đứng vì đúng lý do đó**.
- **DVT (vai B)**: một validator Simplex = 4 thiết bị (`3-of-4`), một là điện thoại; **tắt điện thoại** ⇒
  uptime của validator đó **không đổi**; tắt 2 ⇒ **phải** rụng (đối chứng ngược).
- **IPv6**: một node A1 khai kép; một máy **chỉ IPv6** (điện thoại 4G/5G là ca thật) bootstrap được và thấy
  `≥ 80 %` stake.

Không mục nào được đánh `[x]` khi chỉ chạy trên máy dev hoặc chỉ có fixture — luật §7 `CLAUDE.md`.

---

## 6. Rủi ro riêng của hướng này

| Rủi ro | Vì sao thật | Chặn |
|---|---|---|
| **Hứa sai một lần nữa** kiểu D-161: trang công khai nói *"validate bằng điện thoại"* trước khi có số | câu đó bán được, và nó sai ở cả ba trục chặn | không dòng nào lên `web/` hay `RUN-A-VALIDATOR.md` trước khi vai A qua 7 ngày; cổng doc-drift canh cụm từ |
| **Khoá trong app** = danh tính người thường mất theo máy | D-181 ở quy mô 10⁴ | hộp node tự sao lưu danh tính mã hoá (PROPOSAL giai đoạn 2); vai B: DKG lại khi mất mảnh, không có gì để mất |
| **Sybil bằng điện thoại**: 5 điện thoại cũ của một người = 5 "validator" | rẻ hơn 5 VPS | như §4 ANALYSIS: thưởng theo `≥ 2 ASN`; điện thoại trong túi thật ra **giúp** — mỗi cái một mạng di động khác |
| **Simplex là mã mới của upstream** | A1 chưa chạy; nâng cấp sau (Helicon…) có thể đổi tham số | băng tập trước, và không chain công khai nào chọn Simplex cho tới khi có số |
| **Flash điện thoại chết sớm** | chain đẻ block ghi liên tục | đo tốc độ ghi ở vai A; `Firewood` khi tới |

---

## 7. Một câu để giữ cho sứ mệnh và kỹ thuật không rời nhau

*"Một chain cho mỗi người"* không cần điện thoại của mỗi người **bỏ phiếu** cho ai; nó cần điện thoại của
mỗi người **giữ khoá** của sổ mình (vai C), thỉnh thoảng **góp một chữ ký** cho chain cộng đồng mình (vai B),
và cái điện thoại cũ trong ngăn kéo **giữ sổ** cho hàng xóm (vai A). Ba vai đó đều đứng trên công nghệ đã
có trong fork hôm nay; vai duy nhất **không** đứng được là vai mà ai cũng nghĩ tới đầu tiên.

---

## Nguồn (đọc `2026-09-04`)

A1: D-178 `DECISIONS.md` (tải mỗi L1) · D-162/D-180/D-181 (NAT, uptime, danh tính) · `upstream/avalanchego`
`1.14.2`: `subnets/config.md` §Consensus Config (`simplexParameters`) · `snow/engine/common/engine.go`
(`SimplexHandler`) · `config/flags.go:273` (`--partial-sync-primary-network`) · `network/peer/ip.go` (địa chỉ 16
byte) · `scripts/build_image.sh` (`linux/arm64`).

Thế giới: [Avalanche system requirements](https://build.avax.network/docs/nodes/system-requirements) ·
[ACP-77](https://github.com/avalanche-foundation/ACPs/blob/main/ACPs/77-reinventing-subnets/README.md) ·
[The Verge — stateless clients on everyday devices](https://www.theblock.co/post/322579/ethereums-verge-roadmap-could-enable-stateless-clients-for-block-verification-on-everyday-devices) ·
[Verge could enable nodes on smartphones](https://www.ccn.com/news/crypto/eth-verge-upgrade-enable-nodes-smartphones/) ·
[Celestia Lumina](https://github.com/celestiaorg/lumina) · [Run a light node](https://celestia.org/run-a-light-node/) ·
[Minima node types](https://docs.minima.global/docs/run-a-node/node-types) · [Minima on Google Play](https://play.google.com/store/apps/details?id=com.minima.android) ·
[Blockene, OSDI 2020](https://www.usenix.org/conference/osdi20/presentation/satija) ·
[Android FGS changes](https://developer.android.com/develop/background-work/services/fgs/changes) ·
[Android background restrictions](https://developer.android.com/develop/background-work/background-tasks/bg-work-restrictions) ·
[dontkillmyapp](https://github.com/urbandroid-team/dontkillmy-app) ·
[IPv6 deployment](https://en.wikipedia.org/wiki/IPv6_deployment) · [CGNAT on cellular](https://www.pondiot.com/blog/cgnat-iot-cellular-networks) ·
[DVT institutional overview](https://p2p.org/economy/distributed-validator-technology-institutional-operators/) ·
[Obol vs SSV](https://medium.com/node-guardians/two-roads-in-the-dvt-journey-comparing-obol-and-ssv-flows-c7bb529dc633).
