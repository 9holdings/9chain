# NGÀY G `2026-09-01` — A1 CÒN LẠI NHỮNG GÌ

> **Bản thẩm định của A1, `2026-08-26`.** Đây là câu trả lời cho bản nháp
> `PLAN-REGENESIS-2026-09-01.md` của BOD — bản đó tự khai *"CHƯA được xác minh trên máy"*
> và yêu cầu phiên A1 kiểm lại từng mục. Đã kiểm. Chỗ nào bản nháp sai thì ghi rõ ở đây.
>
> 🔴 **Đừng giữ hai danh sách việc.** Bản nháp BOD là **bối cảnh + quyết định**; file NÀY là
> thứ A1 thi hành. Mâu thuẫn thì file này thắng, vì nó đo trên máy.

---

## 0. Thẩm quyền — một nửa của H-8 đã đóng

`BLOCKERS.md` H-8 ghi: mốc `01/09` đến từ tin nhắn của phiên BOD, và **chính BOD tự đính chính**
rằng phiên ngang hàng không truyền được thẩm quyền. A1 đã từ chối coi đó là ràng buộc.

✅ **`26/08`: David nói trực tiếp với A1, gọi tên `01/09/2026`.** Câu hỏi 1 của H-8 đóng.
🔴 **Câu hỏi 2 vẫn mở** — và đã đổi hình dạng, xem §5 O3.

---

## 1. Đường găng thật: chỉ còn **một** lý do phải sinh lại mạng

Bản nháp BOD được viết **trước** khi lượt re-genesis `26/08` chạy xong. Từ đó tới nay, phần
tokenomics đã thi hành thật trên mạng công khai. Nên bức tranh đổi hẳn:

| Nhóm | Bản nháp BOD nói | Thực tế `26/08` |
|---|---|---|
| **I** (vào binary) | I1 · I2 · I3 · I5 phải làm | ✅ **XONG HẾT** — 9 tỷ, ×12,5, trần 625M, build tái lập. Đang chạy thật |
| **G** (chỉ vào được lúc sinh mạng) | G1–G5 | 🔴 **G5 khắc chữ CHƯA LÀM MỘT DÒNG NÀO.** G1 xung đột. G4 chưa tra |
| **O** (vận hành) | O1–O7 | 🟡 O6 đã có (bản nháp nói chưa) · O7 tập rồi · **O1/O2/O4/O5 chưa** |
| **D** (deploy) | web/explorer/docs | 🟡 làm được bất cứ lúc nào, không chặn |

⇒ **Ngày G tồn tại gần như chỉ để khắc chữ và bắt kịp Block Adam.** Mọi thứ khác đã chạy.
Đây là tin tốt cho lịch, và là tin xấu cho rủi ro: đường găng nay **mỏng và tập trung vào đúng
thứ chưa ai chạm tới**, thay vì trải đều trên nhiều việc đã quen tay.

### Ngân sách thời gian

| | |
|---|---|
| Hôm nay | `2026-08-26` (đã tiêu gần hết) |
| Ngày làm việc thật còn lại | **2** — `27/08`, `28/08` |
| GO/NO-GO | `29/08` |
| Diễn tập topology nhiều máy | `30–31/08` |
| **G** | `2026-09-01` |
| **Sàn trượt CỨNG** | **`2026-09-06`** — sau đó Block Adam (`2026-09-09T06:09:09Z`) trôi qua trước khi chain kịp sống ⇒ **mất vĩnh viễn** |

---

## 2. ✅ ĐÃ PHÂN XỬ `27/08` — giữ bảng ĐANG CHẠY 40/30/12/9/9 (D-045)

**David chốt: giữ nguyên bảng đang chạy.** Không phải sửa một dòng mã nào —
`netgen/allocation.go` đã codify đúng nó (đã đối chiếu `27/08`).
⇒ **Mở khoá G1 · G2 · G3** và điều kiện GO/NO-GO số 1. G2 và G3 **không còn phải quyết riêng**:
self-bond **8.999.991** nằm trong Foundation 12% (không trích từ ô staking như bản nháp BOD
ghi), phần để mint = **3.600.000.000** = ô Staking Rewards 40%.

✅ **SỐ NODE Ở NGÀY G: GIỮ 9** — David chốt `27/08` (D-046). `allocation.go` khai self-bond là
**tổng cố định** `8.999.991`, avalanchego chia đều cho N; `8.999.991 = 9 × 999.999` nên chỉ ở
**N = 9** mỗi node mới nhận đúng bộ chín số 9.

🔴 **ĐÍNH CHÍNH `27/08` — bản đầu mục này ghi "N=10 dư 1 · N=12 dư 3". SAI, đo nhầm đại lượng.**
Đó là chia theo **LOVE9**; avalanchego chia theo **nano**, mà tổng có sẵn thừa số `1e9` nên
**không N nào để lại dư** (đã đo N = 3·5·7·9·10·11·12·15, dư nano = 0 hết). Ở N khác **không mất
đồng nào** — chỉ là self-bond mỗi node thôi tròn LOVE9 (N=10 → 899.999,1). ⇒ Ràng buộc N=9 là
chuyện **bản sắc**, không phải chuyện **số học**; đừng trích nó như một rủi ro mất tiền.

🔴 **Và nó ĐỔI BẢN CHẤT của O4** (validator ở nhà cung cấp thứ hai): không còn là *"thêm một node
thứ 10"* — thêm là thành N=10. Nó phải là **DỜI một trong 9 node** sang nhà cung cấp khác. Điều
đó **tốt hơn** cho chính mục tiêu của O4 (vẫn 9 node, vẫn giữ bảng phân bổ, mà gỡ được rủi ro
"một máy một nhà cung cấp"), nhưng **chi phí khác hẳn**: dời node là đổi `--public-ip` + cửa P2P
và cần một cửa sổ bảo trì, không phải đẻ thêm khoá staking.

**Thi hành:** `netgen` nay **luôn in** self-bond mỗi node và **cảnh báo** khi nó thôi tròn LOVE9
(`canhBaoSelfBond`). Cố ý **chỉ cảnh báo, không chặn** — chặn cứng sẽ giết đường dev quen thuộc
`gen-network.sh 5` mà không được gì.

<details>
<summary>Bối cảnh xung đột (giữ để đối chiếu)</summary>

### Việc chặn số một cũ: bảng phân bổ có **BA** bản, không phải hai

Bản nháp BOD nêu xung đột giữa hai bảng. Đo lại thì có **ba**, và bản **đang chạy thật** không
khớp bảng nào:

| Ô (ngôn ngữ 4 nhóm của BOD) | **BOD Đ14** | **A1 D-039** (như BOD chép) | **ĐANG CHẠY THẬT (D-042)** |
|---|--:|--:|--:|
| Staking + validator | 30% | 40% | **40%** |
| Con người / Community | 40% | 30% | **30%** |
| Hệ sinh thái | 20% | 20% | **21%** ⚠️ (Foundation 12 + Private Sale 9) |
| Team | 10% | 10% | **9%** ⚠️ |

Bảng thật là **5 nhóm**, không phải 4: Staking Rewards 40 · Community 30 · Foundation 12 ·
Private Sale 9 · Team 9. Tổng 100%, tổng cung **9.000.000.000**, phát hành genesis
**5.400.000.000** (60%). Địa chỉ thật: `docs/ALLOCATION-PUBLIC.md`.

🔴 **Không ai được khắc bảng nào cho tới khi David phân xử.** G2 (lát self-bond) và G3 (phần để
mint) đều **dẫn xuất** từ ô này — tính trước là tính lại lần thứ hai.

⚠️ **Và điều kiện GO/NO-GO số 1 của bản nháp KHÔNG THOẢ MÃN ĐƯỢC như đang viết:** nó đòi
*"`allocation.md` khai đúng 10–20–30–40, tổng ra **90 tỷ**"*. 90 tỷ **không tồn tại** trong
`uint64` — đã chứng minh bằng biên dịch có đối chứng ngược (BLOCKERS H-9). Điều kiện đó phải
viết lại theo trần 9 tỷ.

</details>

---

## 3. 🔴 G5 — khắc chữ: chưa làm gì, và có ràng buộc thứ tự với C1

Đây là **toàn bộ lý do** của ngày G. Trạng thái: **0%**.

### Chỗ khắc đã có sẵn, đã đo

| Chỗ | Bằng chứng | Hiện là |
|---|---|---|
| **P-Chain** `Message` | `9chain-a1-config/genesis.json:95` `"{{ fun_quote }}"`, netgen điền ở `netgen/main.go:222` | `"9Chain-A1 sovereign genesis"` |
| **C-Chain** `extraData` + `alloc` | khuôn cChainGenesis | `"0x00"` |

✅ Ô trống **có thật**, không phải giả định. `GenesisCodec = codec.NewManager(math.MaxInt32)` ⇒
trường `Message` không giới hạn thực tế ⇒ chứa được trọn bộ tài liệu.

### Quyết định đã chốt `26/08` (giữ nguyên, A1 không phản đối)

- **P-Chain**: Hebrew nguyên ngữ + trọn bộ tài liệu — *gốc*, nơi khai sinh X và C.
- **C-Chain**: bản **tiếng Anh** — *hiện tại phổ biến*. `extraData` = `sha256` đúng 32 byte
  (con dấu) · `alloc` = hợp đồng dữ liệu mở đầu `0x00` (bản văn, đọc bằng `eth_getCode`).
- **X-Chain**: không khắc, nói thẳng lý do (P-Chain ở trên nó một bậc).
- **L1 người dùng**: không khắc. Gỡ luôn vướng mắc thương mại với chain permissioned B2B.
- **Bản dịch EN**: **ASV 1901** (phạm vi công cộng; `"heavens"` số nhiều sát Hebrew).

### 🔴 Ràng buộc thứ tự — thứ dễ làm hỏng lịch nhất

```
C1 sinh bản chính tắc + CHECKSUMS-FREEZE  ──►  A1 lấy ĐÚNG BYTE  ──►  A1 khắc
```

**Không làm song song. Không gõ lại hai lần.** Dấu chấm cuối câu, kiểu nháy, BOM, niqqud có hay
không — mỗi thứ đổi một byte là đổi cả `sha256`, và số đó nằm trong genesis không sửa được.
⇒ **A1 đang chờ C1.** Nếu C1 chưa đóng băng byte trước hết `28/08` thì đường găng gãy, và nó gãy
ở chỗ A1 không tự cứu được.

### Việc A1 làm được NGAY, không cần chờ ai

1. Tham số hoá `Message` trong netgen: đọc từ tệp, nội dung là **JSON chính tắc của N tài liệu**,
   thứ tự cố định — để `sha256` **từng tài liệu** vẫn tính ra và đối chiếu được với C1.
   *(Nhét thành một khối văn bản trộn là mất vật chứng đồng nhất mạnh nhất đang có.)*
2. Sinh hợp đồng dữ liệu C-Chain trong netgen + `extraData` = 32 byte hash.
   🔴 **Tuyệt đối không sửa tay `9chain-a1-config/genesis.json`** — C-Chain genesis nằm ở đó dưới
   dạng **chuỗi JSON đã escape**; sửa tay là hỏng escape và không ai thấy cho tới lúc boot.
3. Bài kiểm đọc ngược: lấy `Message` từ P-Chain genesis + `eth_getCode` từ C-Chain, băm lại từng
   tài liệu, so với bản đóng băng của C1. **Chạy được bằng một lệnh** — đây là ô ✓/✗ mạnh nhất
   trong scorecard A1↔C1.

---

## 4. 🔴 Block Adam — rủi ro thật, đã đo, chưa có đối sách

Đo `26/08`, 10 mẫu / 5 phút trên mạng công khai lúc rảnh: **P-Chain đứng nguyên ở 330, C-Chain ở
`0x73`** — không một block nào. Avalanche không đẻ block rỗng, và điều đó đúng **cả với P-Chain**.

⚠️ Giới hạn của phép đo, đừng trích mạnh hơn nó cho phép: nó chứng minh block **không sinh theo
nhịp thời gian**; nó **không** chứng minh P-Chain đứng yên tuyệt đối (sự kiện staking vẫn đẻ block).
Nên *"không có block đúng mốc"* là **rủi ro thật, không phải điều chắc chắn** — và đó đã đủ để
phải xử.

**Đối sách (và nó hợp nghi thức hơn là phó mặc):** hẹn sẵn **hai giao dịch nền tảng nghi lễ**
chạy đúng `2026-09-09T06:09:09Z` và ngay sau đó, để Block Adam / Eva **được sinh ra bởi một hành
động có chủ đích**.

🔴 **Phải diễn tập trước.** Không diễn tập thì sai lầm chỉ lộ ra đúng ngày `09/09`, và ngày đó
không có lần thứ hai.
🔴 **Còn phải chốt: Block Adam nằm trên CHAIN NÀO.** A1 có P/X/C, không như C1 chỉ một chuỗi.
Khuyến nghị **C-Chain** — đó là thứ explorer hiện và người dùng trích dẫn.

---

## 5. Nhóm O — việc vận hành, chỗ đắt nhất

| # | Việc | Trạng thái thật | Ai làm |
|---|---|---|---|
| **O1** ⭐ | **Custody bộ khoá quỹ MỚI** | 🔴 **CHƯA.** D-044 giữ nguyên sơ đồ cũ; bản thứ hai David tự cất, **chưa ai xác nhận có**. Mất máy dev = mất khoá cả 5 quỹ | **David** |
| **O2** | Export + `sha256` mạng sắp chết, công bố trước khi xoá | 🔴 **CHƯA — và đã BỎ LỠ ở lượt `26/08`.** Chain data + DB Blockscout đã xoá không có bản công bố nào | A1 |
| **O3** | Chính sách với L1 người dùng | 🟡 **Đã đổi hình dạng**: sau `26/08` danh bạ là **0 sống / 6 đã thu hồi** — chain `David Do` 9141 **đã mất rồi**. Rủi ro nay nằm ở người được mời **từ nay tới 01/09** | **David** + `Web9Chain` |
| **O3b** | Sổ chống phát lại | ✅ **A1 XÁC NHẬN giả thuyết BOD đúng** — xem dưới | A1 |
| **O4** 🔴 | Validator ở nhà cung cấp **thứ hai** | 🔴 **CHƯA.** 9 node vẫn *một máy, một nhà cung cấp*. Tốn tiền | **David** |
| **O5** | Gỡ H-7 — IPv4 đa cổng hay IPv6 cho node beacon | 🔴 **CHƯA QUYẾT.** Đây là chọn **tập người dùng**, không phải chọn kỹ thuật | **David** |
| **O6** | Cổng nhất quán | ✅ **BẢN NHÁP SAI** — `scripts/check-consistency.mjs` đã có. ⚠️ Nhưng nó **không đọc một dòng Go nào** (bảng số riêng bằng JS) ⇒ là cổng **một phần** | A1 |
| **O7** | Diễn tập trọn kịch bản | 🟡 Đã tập 2 lượt (cục bộ 9 node + re-genesis công khai thật). **Chưa tập trên topology nhiều máy** — mà cái đó chặn bởi O4 | A1, sau O4 |

### O3b — A1 xác nhận, đo bằng mã

BOD suy từ B-7 nhưng chưa đo. **Đo rồi: đúng.** `local-net/console/server.mjs:622` kiểm trùng trên
`[...state.chains, ...state.retired]`, đọc từ `console-chains.json` — **trạng thái phía operator,
không phải trạng thái chain**. ⇒ Giữ nguyên tệp qua ngày G thì `createChain` tiếp tục từ chối
tên/chainId cũ, **chi phí gần bằng không**.

🔴 **Chi tiết BOD không nêu, và nó quan trọng:** giữ **nguyên cả tệp** là sai — console sẽ tưởng
các chain trong `chains` còn sống trên một mạng chúng không tồn tại. Cách đúng: **dồn toàn bộ
`chains` sang `retired` trước khi sinh mạng**, rồi giữ tệp.

⚠️ **Thiệt hại này đã xảy ra một lần rồi:** lượt `26/08` reset danh bạ về `{"chains":[],"retired":[]}`
⇒ **43 tên + chainId cũ nay dùng lại được**. Bản cũ còn ở `docs/archive/console-chains-pre-regenesis-2026-08-26.json`,
nên **khôi phục được** — nhưng phải có người quyết là có khôi phục hay không.

### 5c — 🔴 Lỗ chống phát lại KHÔNG còn là lý thuyết: **6 chainId cũ đã bị cấp lại trong 24 giờ**

Đo `27/08`, so sổ lưu trữ với sổ đang chạy:

| | |
|---|---|
| Sổ cũ (trước `26/08`) | **46 bản ghi** — 3 sống, 43 đã thu hồi · chainId **9100–9145**, không trùng nhau |
| Sổ hiện tại | **0 sống · 6 đã thu hồi** · chainId **9100–9105** |
| **Đâm nhau** | **chainId: 9100 · 9101 · 9102 · 9103 · 9104 · 9105** — cả sáu. Tên: **không cái nào** |

Trong sáu số đó, **9100 (`OwnerTest`) và 9101 (`OmegaChain`) là chain ĐANG SỐNG** lúc re-genesis.

**Hôm nay thiệt hại thực tế ~0** — cả 6 chain mới ở dải đó đều đã thu hồi, nên không có gì đang
phục vụ dưới các số ấy. **Nhưng lỗ vẫn mở, và nó mở đúng chỗ đắt nhất:**

🔴 **chainId 9106–9145 hiện ĐANG TRỐNG và sẽ được cấp cho 40 chain kế tiếp** — console tự cấp
bằng `chainId = 9100; while (taken) chainId++` (`server.mjs:659`). Trong dải đó có **`9141` =
chain `David Do`**. Đẻ thêm ~36 chain nữa là số đó được cấp lại, và **ví của David lặng lẽ trỏ
vào chain của người lạ**.

**Nếu khôi phục** (trả lời câu phiên web hỏi):
- **Không** làm `createChain` từ chối nhầm gì đáng kể: nó chặn thêm 46 số, và tự cấp chỉ việc
  bắt đầu từ **9146**. Không gian chainId là số nguyên, **không khan hiếm**.
- **Không** đâm tên: 46 tên cũ khác hoàn toàn 6 tên mới.
- ⚠️ **Nhưng KHÔNG phải thuần lợi như tưởng:** 6 chainId `9100–9105` sẽ xuất hiện **hai lần**
  trong `retired` với **hai tên khác nhau**. Không sập (chặn hai lần vẫn là chặn), nhưng trang
  `/chains/` sẽ vẽ hai bản ghi cùng số — phải chốt luật gộp trước khi làm.

### 5d — chainId `9000000009` ở ngày G: **chưa có quyết định nào tồn tại**

Phiên web nêu ba lý do nên đổi. Đo lại thì **một lý do đổ, hai lý do đứng**:

| Lý do | Thẩm định |
|---|---|
| chữ ký **SIWE** cũ phát lại được | 🔴 **ĐỔ.** `siwe.mjs:113` — server **không bao giờ nhận `message` từ client**, nó tra message từ kho của chính mình theo nonce ⇒ chữ ký mạng cũ **không có đường trình lên**. Cộng thêm: `khoNonce` là `Map` **trong bộ nhớ** (mất khi restart), nonce **dùng một lần**, xoá ngay cả khi xác minh hỏng. Chặn **độc lập với chainId** |
| ví còn cấu hình cũ nối vào mạng mới **không cảnh báo gì** | ✅ **Đứng.** Cùng chainId + cùng RPC + cùng tên ⇒ người dùng thấy số dư 0 và không hiểu vì sao. Đây là vế người dùng thật sự va phải |
| giao dịch đã ký **chưa phát** của mạng cũ phát lại được | ✅ **Đứng, nhưng hẹp.** EIP-155 buộc chữ ký vào chainId, nonce đếm lại từ 0. Hẹp vì sau re-genesis mọi địa chỉ có số dư 0 ⇒ tx phát lại chết vì thiếu tiền; cửa còn mở là người đó **xin faucet trên mạng mới** rồi tx cũ nonce 0 mới chạy |

✅ **CHỐT `27/08` (D-047): GIỮ `9000000009`.** Chân trụ mạnh nhất của phía "đổi" (SIWE) đã đổ, trong khi
cái giá của việc đổi là thật: mọi tài liệu/ví/hướng dẫn đã phát ra ngoài đều sai, và
`9000000009` nằm trong **chuẩn đặt tên chốt `24/08`** — tức nó là bản sắc, không phải tham số.
⇒ Hai vế còn lại xử bằng **câu chữ trên trang**, không bằng đổi số.

### Bẫy "bản tập biến thành bản thật" — A1 **không** dùng được kỷ luật của C1

Bản nháp đề xuất: bản tập đặt `genesisTime = bây giờ + 120s`, chỉ bản thật mang mốc thiêng.
**Không áp được nguyên si cho A1.** Đo: `netgen/main.go:210` đặt `StartTime: uint64(now - 60)` —
**luôn động, không tham số hoá**. A1 không có khái niệm "mốc thiêng trong genesis" để làm dấu phân
biệt. ⇒ A1 phải tự thiết kế cổng khác (cờ xác nhận tường minh + đối chứng sau khi sinh), **và
phải thiết kế trước lượt tập đầu tiên**, không phải trước lượt thật.

---

## 6. Việc David phải quyết — không agent nào thay được

| # | Việc | Vì sao không tự quyết được | Hạn |
|---|---|---|---|
| ~~1~~ | ✅ **XONG `27/08`** — ~~phân xử bảng phân bổ~~ → **giữ bảng đang chạy 40/30/12/9/9** (D-045). G1+G2+G3 mở khoá, không phải sửa mã | — | — |
| ~~1b~~ | ✅ **XONG `27/08` — GIỮ N = 9** (D-046). 🔴 **Đổi bản chất O4**: không còn là "thêm node thứ 10" mà là **DỜI một trong 9 node** sang nhà cung cấp khác — tốt hơn, và chi phí khác hẳn | — | — |
| **2** | 🔴 **Sơ đồ custody khoá quỹ mới** (O1) | Sinh lại mạng là **cơ hội một lần**; sau ngày G lại kẹt y cũ | **`28/08`** |
| **3** | **Block Adam nằm trên chain nào** (khuyến nghị C-Chain) | Khắc vĩnh viễn | `28/08` |
| **4** | **L1 người dùng + câu cảnh báo khi mời người** (O3) | Chạm người thật ngoài dự án | `28/08` |
| **5** 🔴 | **Có khôi phục sổ `retired` cũ không** (O3b) — **KHÔNG còn là rủi ro lý thuyết**, xem §5c | Chống phát lại cho ví người dùng cũ · **chain `David Do` 9141 nằm trong vùng đang hở** | `28/08` |
| ~~7b~~ | ✅ **XONG `27/08` — GIỮ `9000000009`** (D-047). Hai vế rủi ro còn lại xử bằng **câu chữ trên trang**, không bằng đổi số | — | — |
| **6** | 🔴 **Chi tiền cho validator nhà cung cấp thứ hai** (O4) | Tiền | `29/08` |
| **7** | **H-7: IPv4 đa cổng hay IPv6** (O5) | Chọn **tập người dùng**, không phải chọn kỹ thuật | `29/08` |

🔴 **Nếu O4 không đạt thì `01/09` KHÔNG được gọi là "chạy chính thức".** Câu *"một máy chủ đội lốt
một mạng"* áp y nguyên cho 9 node như cho 5. Đây là đánh giá của A1, không phải của BOD.

---

## 7. GO/NO-GO `29/08` — bản viết lại

Bản nháp BOD có 7 điều kiện, trong đó **điều 1 không thoả mãn được** (đòi 90 tỷ). Bản A1:

1. **G1** — David đã phân xử bảng phân bổ; `allocation.md` khớp, tổng ra **9.000.000.000**
2. **G2** — self-bond genesis ≤ `maxValidatorStake`, **có phép đo**, và còn dư địa nhận uỷ quyền
3. **G4** — tra lại `chainid.network` **ngay trước bước sinh genesis**, `9000000009` không trùng
4. **G5** — chữ khắc **đọc ngược lại được từ chain**, `sha256` từng tài liệu **khớp bản đóng băng
   của C1**, và đã chốt Block Adam nằm trên chain nào
5. **I** — ✅ đã xong từ `26/08`; chỉ cần đối chứng lại `supplyCap` trên binary sau khi build
6. **O1** — custody đã chốt **và đã diễn tập trọn ít nhất một lượt bằng phương tiện thật**
7. **O2** — quy trình export + `sha256` đã chạy thử được (đừng lặp lại lỗ hổng `26/08`)
8. **O3** — đã có quyết định, và câu cảnh báo đã lên `Web9Chain`
9. 🆕 **Giao dịch nghi lễ Block Adam đã diễn tập trên bản tập**
10. 🆕 **Cổng "bản tập ≠ bản thật" đã tồn tại và đã bắt được ít nhất một ca đối chứng ngược**

---

## 8. Rủi ro lớn nhất, xếp theo mức mất mát

| | Rủi ro | Vì sao đắt |
|---|---|---|
| 1 | **C1 chưa đóng băng byte kịp `28/08`** | A1 không tự cứu được. Khắc sai byte = sai `sha256` vĩnh viễn, và mất luôn vật chứng đồng nhất |
| 2 | **Bảng phân bổ chưa phân xử** | Chặn genesis. Mọi con số dưới nó phải tính lại |
| 3 | **Custody chốt vội trong lúc vội** | Sau ngày G là hết cơ hội, phải chờ lần sinh mạng sau |
| 4 | **Block Adam không có block để trỏ vào** | Chỉ lộ đúng `09/09`, không có lần hai |
| 5 | **O4 không đạt** | `01/09` thành một cột mốc truyền thông cho thứ vẫn là một máy chủ |

---

## 9. A1 bắt đầu ngay được (không chờ ai)

Xếp theo thứ tự đường găng:

1. ✅ **XONG `26/08`** — **Tham số hoá `Message` + hợp đồng dữ liệu C-Chain trong netgen.**
   Cơ chế dựng sẵn, nội dung nhét vào sau khi C1 giao byte. Patch 0010, cây fork tree
   `76a714ea`. Cách dùng + bảng nghiệm thu: [`KHAC-CHU-NGAY-G.md`](KHAC-CHU-NGAY-G.md).
2. ✅ **XONG `26-27/08`** — **Bài kiểm đọc ngược chữ khắc**: `9chain-a1-tools/engrave-verify`,
   một lệnh, chạy được vào chain thật. **17 đạt/0 hỏng trên mạng tập 3 node dựng thật**, ba ca
   đối chứng ngược đều đỏ đúng chỗ. Patch 0011, tree `09c74a2a`.
   🔴 Phát hiện nền: `Message` là **trường chỉ ghi**, không API nào đọc được — nhưng `parentID`
   của block 0 P-Chain **chính là `sha256` của toàn bộ genesis blob**, nên mạng đang chạy mang
   sẵn cam kết mật mã cho chữ khắc. Xem [`KHAC-CHU-NGAY-G.md`](KHAC-CHU-NGAY-G.md).
3. ✅ **XONG `26/08`** — **Cổng "bản tập ≠ bản thật"** (§5): mặc định KHÔNG khắc, bật khắc thì
   bắt buộc `A1_ENGRAVE_CONFIRM` khớp vân tay bộ tài liệu, và netgen **luôn in ra** mình có
   khắc hay không. Đã có đối chứng ngược: vân tay lệch ⇒ từ chối sinh mạng.
4. **Diễn tập giao dịch nghi lễ Block Adam** trên bản tập.
5. **Quy trình O2** (export + `sha256` + công bố) — thứ đã bỏ lỡ ở `26/08`.
5b. ✅ **ĐÃ BÁO `27/08`** — 9Scan-A1 nay biết `Message` là trường chỉ ghi, không API nào trả về;
   bản văn phải đọc từ **tệp genesis** (nói rõ nguồn là tệp), còn thứ đọc **từ chain** là
   `parentID` block 0 (= `sha256` cả blob) làm ô đối chứng, cộng `eth_getCode` cho mặt C-Chain.
   Commit `7e3b579` trong `C:\PROJECTS\9Scan-A1`; bản sao bên mình ở
   `docs/requests-from-9scan/2026-08-27-chu-khac-BAO-CHO-9SCAN.md` (đối chứng `sha256` khớp).
   🟡 **Chờ họ trả lời một câu**: thiết kế đó có đủ cho luật cứng #2 của họ không, hay họ cần
   endpoint mới trên node — nếu cần thì phải biết **trước ngày G**.
6. **G4** — tra `chainid.network`.
7. **I1b** — phơi trần cung ra endpoint đọc được, hoặc ghi rõ trên trang rằng nguồn là **tham số
   genesis**. Luật cứng của 9Scan-A1 là *"số công bố phải đọc từ chain thật"*; in trần mà không có
   endpoint là **gõ hằng số vào giao diện**.
8. **Dồn `chains` → `retired`, giữ tệp** (O3b) — chờ David quyết có khôi phục 43 bản ghi cũ không.
