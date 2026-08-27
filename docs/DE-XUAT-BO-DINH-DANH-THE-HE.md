# ĐỀ XUẤT — BỘ ĐỊNH DANH THEO THẾ HỆ (trả lời §5 a/b/c của bản chuyển giao `9chain-a1-eb`)

> Ba câu để mở: **(a)** có chia dải L1 thành khối thế hệ không · **(b)** tên mạng · **(c)** có
> khối `networkID` riêng cho mạng tập không.
>
> Bản này **khuyến nghị một phương án**, không liệt kê lựa chọn. Mọi khẳng định về mã đều đã đọc
> nguồn và ghi số dòng.

---

## 0. Phát hiện đổi bản chất câu hỏi: **phương án đang chốt có hạn dùng ĐÚNG MỘT THẾ HỆ**

Bản chuyển giao lập luận rất đúng rằng phải đổi `networkID` khỏi `9001`, vì:

```
network/peer/peer.go:825     if msg.NetworkId != p.NetworkID { … StartClose() }
```

**Đã đọc lại và xác nhận, kèm một phép đếm mạnh hơn:** từ `genesis` xuất hiện **0 lần** trong cả
`network/peer/peer.go`. Bắt tay P2P so **duy nhất `networkID`**, không có bước nào chạm genesis.

🔴 **Nhưng lập luận đó áp cho CHÍNH nó ở thế hệ sau.** Nếu ngày G lấy `999999999`, và lượt
re-genesis kế tiếp **cũng** lấy `999999999`, thì node của thế hệ 0 và node của thế hệ 1 **bắt tay
được với nhau** — đúng cái lỗ vừa bỏ công đóng. Và lúc đó nó tệ hơn hôm nay, vì:

- hôm nay `9001` là *"trùng do không ai chọn"* — netgen ép mọi mạng dùng chung một số;
- lúc đó nó là *"trùng do ta đã chọn và đã ghi vào DECISIONS.md"*.

⚠️ Điều này **không** làm sai ba con số David chốt. Nó nói rằng **ba con số ấy là bộ định danh của
MỘT thế hệ**, và thứ còn thiếu là **quy tắc sinh ra bộ tiếp theo**.

⇒ Ba câu (a)(b)(c) không phải ba câu độc lập. Chúng là **ba mặt của cùng một câu**: *thế hệ được
mã hoá ở đâu?*

---

## 1. Khuyến nghị: **một số nguyên `A1Gen`, ba giá trị suy ra, một cổng bắt chúng phải khớp**

| Đại lượng | Công thức | Thế hệ 0 (ngày G) |
|---|---|---|
| `A1Gen` | `n`, `0 ≤ n ≤ 999` | **`0`** |
| `A1ID` (networkID) | **`999_999_999 − n`** | **`999999999`** ✓ đúng số David chốt |
| `A1Name` | **`9chain-a1-g<n>`** | **`9chain-a1-g0`** |
| `chainId` chain mẹ | **`9_000_000_009`** — cố định MỌI thế hệ | `9000000009` ✓ |
| Khối `chainId` L1 | `[9_000_000_000 + n×1_000_000 … +999_999]` | **`9000000010 – 9000999999`** |

*(Thế hệ 0 nâng sàn lên `…010` để chừa chain mẹ `…009` và chín số đệm — David đã chốt sàn này.)*

**Toàn bộ bộ định danh suy ra từ MỘT số nguyên.** Đó là điểm của đề xuất: hôm nay ba giá trị phải
đổi cùng nhau mà **không có gì bắt chúng đổi cùng nhau**.

### Ba tính chất an toàn của David còn nguyên ở MỌI thế hệ — kiểm bằng số

| | Tính chất | Thế hệ 0 | Thế hệ 999 |
|---|---|---|---|
| 1 | `networkID` **9** chữ số vs `chainId` L1 **10** chữ số | `999999999` / `9000000010` ✓ | `999999000` / `9999999999` ✓ |
| 2 | `networkID` nằm **DƯỚI** sàn dải L1 ⇒ chép nhầm thì cổng console bắt | `999999999 < 9000000010` ✓ | `999999000 < 9999000000` ✓ |
| 3 | **Toàn bộ** dải L1 **vượt trần `uint32`** ⇒ chép nhầm chiều ngược lại thì node **chết to** | `9000000010 > 4294967295` ✓ | ✓ |

`networkID` luôn nằm trong `999.999.000 – 999.999.999`: luôn 9 chữ số, luôn dưới trần `uint32`.

---

## 2. (a) CÓ chia khối thế hệ — nhưng **1000 thế hệ × 1 triệu**, không phải 10 × 100 triệu

### Vì sao chia

Không chia thì bảo đảm *"không cấp lại một `chainId`"* **treo lên `console-chains.json` (kể cả mục
`retired`) phải sống sót qua MỌI lượt re-genesis** — trong khi cả điểm của re-genesis là xoá sạch
trạng thái. Tệp đó khi ấy thành **tài sản ngang hàng khoá quỹ**.

🔴 **Và đó là đặt bảo đảm lên đúng chỗ yếu nhất của A1.** Bản soát hiện trạng `27/08` đo được: O1
custody **chưa ai xác nhận**, backup chạy **tay** đúng hai lần, **không có cron nào của A1**, và
lượt `26/08` đã **bỏ lỡ O2**. Năm trong bảy rủi ro hàng đầu của A1 đều là *"chưa có người chịu trách
nhiệm hoặc chưa có máy nhắc"*. Xây một bảo đảm vĩnh viễn lên nền đó là chọn sai móng.

Chia khối thì tính duy nhất xuyên thế hệ là **số học**, không phải **giữ đồ**.

⚠️ **Nói cho đúng mức — đừng bán mạnh hơn thực tế.** Rủi ro *phát lại chữ ký* xuyên thế hệ là
**yếu**: mạng cũ bị xoá hẳn, URL RPC của L1 cũ (`/ext/bc/<blockchainID>/rpc`) chết theo vì
`blockchainID` đổi, và địa chỉ ví ở mạng mới sinh từ khoá khác. Ví cũ nhận *"không nối được"*, không
phải *"lặng lẽ sang chain lạ"*. **Giá trị thật của việc chia khối là NGUỒN GỐC**: một `chainId` từng
mang hai nghĩa khác nhau làm mọi ghi chép lịch sử thành nhập nhằng, vĩnh viễn.

### Vì sao **không** phải 10 × 100 triệu

Sơ đồ *"chữ số thứ 2 = thế hệ"* đặt tài nguyên khan hiếm **lệch trục**:

| Trục | Trần thật hôm nay | 10 × 100 triệu cấp |
|---|---|---|
| Số L1 **trong một thế hệ** | **15–16** (trần subnet của giao thức, H-2/ACP-77) | **100.000.000** |
| Số **thế hệ** | A1 đã re-genesis **2 lần trong 2 ngày** | **10** |

10 thế hệ là con số **với tới được**: ở nhịp 2 lượt/năm là hết trong 5 năm, và lúc đó cửa duy nhất
để sửa lại là… một lượt re-genesis nữa.

**Ba chữ số cho thế hệ** đảo lại cho đúng: **1000 thế hệ × 1.000.000 L1**. Ở nhịp 4 lượt/năm là 250
năm, và 1 triệu L1/thế hệ vẫn dư gấp hàng vạn lần trần kiến trúc. **Cả hai trục đều dư thừa vô lý —
đó mới là câu trả lời đúng khi chưa biết trục nào sẽ căng.**

⚠️ **Không mâu thuẫn với quyết định của David.** Dải `9000000010–9999999999` vẫn là **toàn bộ không
gian L1**; thế hệ chỉ **chia ngăn** bên trong nó. Console của ngày G cấp trong ngăn của thế hệ 0.

---

## 3. (b) Tên mạng: **`9chain-a1-g0`**

Ngoài việc dễ đọc, nó **biến một ràng buộc vận hành thành thứ tự thi hành**:

- `A1Name` đi vào **đường dẫn DB** (`config.go:1008`) ⇒ D-050: binary mang tên mới **chỉ lên cùng
  lượt `down -v`**;
- thế hệ nằm trong tên ⇒ **thế hệ mới bắt buộc tên mới bắt buộc wipe**. Đúng thứ ta muốn, và không
  cần ai nhớ.

⚠️ **Một mặt trái phải biết:** tên mới ⇒ đường dẫn DB mới ⇒ node **không báo lỗi**, nó chỉ bootstrap
từ đầu vào một thư mục rỗng. Nếu tên là thứ *duy nhất* mang thế hệ thì một lượt nâng cấp nhầm sẽ
**im lặng**. Đó chính là lý do thế hệ phải nằm **cả trong `networkID`** — lúc đó node thế hệ sai
không bắt tay được với ai, và **lỗi trở nên to**.

---

## 4. (c) CÓ khối `networkID` riêng cho mạng tập — và nó gần như miễn phí trong sơ đồ này

Hôm nay mạng tập dùng **chung `networkID 9001`** với mạng công khai. Đo `27/08`: mạng tập `a1-drill`
lên với `eth_chainId` = **`9000000009`** — đúng số của mạng thật.

**Đề xuất:** một **băng song song**, cùng quy tắc, khác chữ số dẫn đầu.

| | Thế hệ `n` |
|---|---|
| Mạng **thật** | `A1ID = 999_999_999 − n` |
| Mạng **tập** | `A1ID = 899_999_999 − n` |

Vẫn 9 chữ số · vẫn dưới sàn dải L1 · vẫn dưới trần `uint32` · **không bao giờ bắt tay được với mạng
thật** ở bất kỳ thế hệ nào.

### 🔴 Và đây là chỗ dễ chết người nhất trong cả đề xuất

`genesis/params.go:58-67` và `:73-82` đang phân nhánh bằng `case A1NetworkID:`. Thêm một `networkID`
thứ hai mà **quên sửa chỗ này** thì mạng tập rơi vào `default:` ⇒ mượn `LocalParams` ⇒ **trần cung
720 triệu** ⇒ genesis phát hành 4,3 tỷ ⇒ **tràn ngược `uint64`** khi phát thưởng. Mạng vẫn lên
sạch, RPC vẫn xanh, sai lệch chỉ lộ ra nhiều ngày sau.

Đó **đúng là cái bẫy patch 0013 dựng ra để chặn**, và thêm một băng networkID là **dựng lại nó**.

⇒ `params.go` phải chuyển sang **kiểm theo DẢI**, và netgen phải từ chối mọi `networkID` ngoài hai
băng — không im lặng mượn tham số của ai.

---

## 5. Cổng: **ba giá trị phải KHỚP, và nó là phần đắt nhất của đề xuất**

Hôm nay ba giá trị (`networkID`, tên, khối `chainId`) phải đổi cùng nhau mà **không có gì bắt chúng
đổi cùng nhau**. Đề xuất này làm cả ba **suy ra từ `A1Gen`**, rồi thêm một cổng khẳng định điều đó:

```
netgen từ chối, và nói rõ vì sao, nếu BẤT KỲ điều nào sai:
  · A1ID       ≠ 999_999_999 − A1Gen   (hoặc 899_999_999 − A1Gen với mạng tập)
  · A1Name     ≠ "9chain-a1-g<A1Gen>"
  · sàn/trần khối chainId ≠ khối của A1Gen
  · A1ID không nằm trong NetworkIDToHRP   ← đúng lỗi patch 0013 đã vá cho 9001
```

🔴 **Ô cuối là ô rẻ nhất và đắt nhất cùng lúc.** Trước patch 0013, `9001` không có trong
`NetworkIDToHRP` nên `GetHRP(9001)` rơi xuống `FallbackHRP` — HRP `love9` **sống bằng đường lui**,
và không cổng nào bắt được. Đổi `A1ID` mà quên cập nhật map là **dựng lại chính lỗi đó**, ở đúng
lượt không có lần thứ hai.

**Đối chứng ngược bắt buộc** (bài đáng giá nhất, đúng như bản chuyển giao đã nêu ở §7.2): dựng một
mạng `networkID` khác rồi chĩa node của nó vào bootstrap của mạng mới ⇒ log **phải** có dòng cắt
kết nối vì lệch `networkID`. Không có bài này thì việc đổi số chỉ là niềm tin.

---

## 6. Chi phí, và vì sao vẫn nên làm TRƯỚC ngày G

| | |
|---|---|
| Mã | `network_ids.go` · `genesis_9chain_a1.go` · `params.go` (chuyển sang dải) · `netgen` (cổng) · `lib/chainid.mjs` (khối thế hệ) — **~60–80 dòng Go + cổng + bài kiểm** |
| Patch series | **một** lượt sinh lại cả bộ — quy trình đã chạy **hai lượt trong ngày `27/08`**, có đối chứng ngược (áp 16/17 → ra đúng tree cũ) |
| Nghiệm thu | tree hash khớp từng byte + bài cắt-kết-nối ở §5 |

⚠️ **Rủi ro thật, nói thẳng:** đây là thêm mảnh chuyển động vào lớp genesis, **năm ngày trước** một
lượt sinh mạng không có lần thứ hai. Cái giảm rủi ro không phải sự cẩn thận — mà là **cổng ở §5**:
nó biến "ba thứ phải nhớ đổi cùng nhau" thành "một thứ, và máy kiểm hộ".

**Vì sao không hoãn sang sau ngày G:** `networkID` và `A1Name` **nằm trong genesis / đường dẫn DB**.
Chúng chỉ đổi được ở một lượt re-genesis. Hoãn nghĩa là hoặc chịu một thế hệ nữa với sơ đồ chưa
xong, hoặc **re-genesis thêm một lần nữa** chỉ để sửa số — và mỗi lượt re-genesis là một lượt
custody khoá quỹ mới, tức là mở lại đúng rủi ro số 1 của A1.

**Gộp cùng lượt sinh lại patch:** B-9 (`#e84142` trong `patches/0003`) nếu David chốt sửa — một lượt
regen thay vì hai.

---

## 7. Tóm tắt để chốt

| # | Câu | Khuyến nghị |
|---|---|---|
| **(a)** | Chia khối thế hệ? | **CÓ** — nhưng **1000 thế hệ × 1 triệu** (3 chữ số), không phải 10 × 100 triệu |
| **(b)** | Tên mạng | **`9chain-a1-g0`**, thế hệ nằm trong tên |
| **(c)** | Khối networkID cho mạng tập | **CÓ** — băng `899_999_999 − n`; **bắt buộc** đổi `params.go` sang kiểm theo dải |
| **+** | *(A1 thêm vào)* | Thế hệ phải nằm **cả trong `networkID`** (`999_999_999 − n`), nếu không thì bản vá hôm nay **hết hạn ở lượt re-genesis kế tiếp** |
| **+** | *(A1 thêm vào)* | Một cổng netgen bắt **`A1Gen` ↔ `A1ID` ↔ `A1Name` ↔ khối chainId ↔ `NetworkIDToHRP`** phải khớp |

**Thế hệ 0 giữ NGUYÊN VẸN ba con số David đã chốt.** Đề xuất này không đổi con số nào của ngày G —
nó chỉ trả lời câu *"ngày G lần sau lấy số ở đâu"*, và trả lời bằng số học thay vì bằng một tệp phải
sống sót.
