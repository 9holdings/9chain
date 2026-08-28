# CỔNG "BẢN TẬP ≠ BẢN THẬT" CHO `chainId` — C-4, `2026-08-27`

> Mốc A-4 của đợt autopilot 14, đóng nốt **B-11**. Điều kiện qua: *"netgen từ chối/cảnh báo khi
> sinh mạng tập mang chainId của mạng thật; có đối chứng ngược"* — **đạt, 7 ca nghiệm thu,
> 3 ca đỏ đúng chỗ.**
> Mã: [`netgen/chainid.go`](../upstream/avalanchego/9chain-a1-tools/netgen/chainid.go) ·
> patch **0015** · tree fork **`df68a7d7`** · **15 patch** trên `1cf1fc3`.

---

## 1. Bất đối xứng đã tồn tại tới `27/08`

A1 dựng cổng *"bản tập ≠ bản thật"* **rất kỹ** cho **chữ khắc**: `A1_ENGRAVE_CONFIRM` khớp vân
tay, đối chiếu `CHECKSUMS-FREEZE` của C1, báo cáo `engraving.md`, mặc định **không khắc**.

Cho **`chainId`** thì **không có cổng nào**. `cChainGenesis` cắm cứng `9000000009`, nên **mọi
mạng netgen sinh ra — tập hay thật — đều mang bản sắc của mạng thật**. Và netgen **không in con
số đó ở đâu cả**, nên không lượt sinh mạng nào để lại dấu vết về bản sắc nó vừa phát ra.

🔴 **Vì sao đó là chỗ đắt hơn nó trông:** `networkID` là chuyện nội bộ avalanchego — cổng
`mustFitSupplyCap` và `netgen` đã canh nó rất kỹ từ patch 0013. Nhưng thứ **ví người dùng đọc**
là `chainId`, và **EIP-155 buộc chữ ký vào `chainId`, không vào `networkID`**. Tức A1 canh cẩn
thận con số **không ai thấy**, và bỏ trống con số **ai cũng thấy**.

⚠️ **Đừng trích mạnh hơn phép đo.** Rủi ro thực tế thấp và vẫn thấp: netgen sinh **khoá mới mỗi
lượt** nên địa chỉ hai mạng khác nhau; cửa duy nhất là người tự import cùng một khoá vào cả hai.
Cái được vá là **bất đối xứng thiết kế**, không phải một vết thương đang chảy.

---

## 2. Luật

| | khắc chữ **BẬT** (lượt THẬT) | khắc chữ **TẮT** (lượt TẬP) |
|---|---|---|
| `chainId` = `9000000009` | ✓ im lặng — đúng bản sắc | ⚠️ **CẢNH BÁO LỚN** (hoặc khai `A1_CHAIN_ID_KHAI_NHAN`) |
| `chainId` ≠ `9000000009` | 🔴 **CHẶN** | ✓ in ra — đường **đúng** cho một mạng tập |

**Lượt thật = lượt có khắc chữ.** Không thêm cờ khai báo mới: A1 đã có đúng một thứ chỉ xuất
hiện ở lượt thật, và bắt người vận hành khai hai lần cùng một sự thật là đẻ ra chỗ để hai lời
khai lệch nhau.

### 🔴 Bất đối xứng "cảnh báo vs chặn" là CỐ Ý

- **Lượt tập chỉ CẢNH BÁO** vì chặn cứng sẽ giết đường dev quen thuộc `gen-network.sh 5`, và
  đổi chainId mặc định của mạng dev là đổi cấu hình MetaMask/faucet/explorer của mọi người
  đang làm việc. Đây đúng lý lẽ đã dùng cho `canhBaoSelfBond` (§2 `NGAY-G-A1-CON-LAI`): một
  cổng chặn mà không được gì chỉ tạo ra **thói quen đi vòng**.
- **Chiều ngược lại thì CHẶN** vì khắc chữ lên một mạng mang chainId lạ là khắc **vĩnh viễn**
  một bản sắc sai — không sửa được, và không ai phát hiện cho tới khi có người thật thêm mạng
  vào ví.

⇒ **Cái sửa được thì cảnh báo. Cái không sửa được thì chặn.**

### Kèm theo

- **Trần EIP-2294** (`9007199254740990` = `MAX_SAFE_INTEGER` của JS). Vượt ngưỡng thì con số
  **im lặng bị làm tròn** ở phía ví — không lỗi nào, chỉ là một mạng khác.
- **Luôn in `chainId`** ở dòng tổng kết, kể cả khi nó đúng. Im lặng ở đây là cách một mạng tập
  đi ra ngoài dưới tên mạng thật mà không ai nhận ra — cùng lý lẽ với dòng
  `Chu khac: KHONG (ban tap)`.
- `A1_CHAIN_ID_KHAI_NHAN` cố ý là **một câu tiếng Việt dài**, không phải `1`/`true`: nó nằm lại
  trong lịch sử shell và log CI. Một cờ mà gõ nhầm cũng bật được là một cờ sẽ bị bật nhầm.
  (Cùng khuôn với `engraveDrillOptOut`.)

---

## 3. Nghiệm thu — 7 ca, mạng 3 node sinh thật

| # | Ca | Kết quả |
|---|---|---|
| 1 | **mặc định** (không khắc, không `A1_CHAIN_ID`) | ⚠️ khối cảnh báo lớn · genesis mang `9000000009` · exit 0 |
| 2 | mạng tập khai `A1_CHAIN_ID=9000000909` | ✓ một dòng · genesis mang **`9000000909`** · exit 0 |
| 3 | khai nhận cố ý | ⚠️ đúng **một dòng** thay cho cả khối · exit 0 |
| 4 | 🔴 `A1_CHAIN_ID=chin-ty` | **CHẶN** — *"khong doc duoc"* · exit 1 |
| 5 | 🔴 `A1_CHAIN_ID=9007199254740991` | **CHẶN** — vượt trần EIP-2294 · exit 1 |
| 6 | 🔴 **lượt THẬT (có khắc) mang chainId mạng tập** | **CHẶN** — *"Genesis la BAT BIEN…"* · exit 1 |
| 7 | lượt thật + chainId thật | ✓ im lặng đi qua, khắc chữ chạy · exit 0 |

🔴 **Chấm bằng NỘI DUNG genesis, không bằng dòng log.** Ca 1 và ca 2 được kiểm bằng cách mở
`genesis.json` sinh ra, giải chuỗi `cChainGenesis` đã escape, đọc `config.chainId`:

```
ca1 -> chainId trong cChainGenesis = 9000000009
ca2 -> chainId trong cChainGenesis = 9000000909
```

Một cổng in ✓ mà không đổi thứ nó nói là đã đổi thì đúng lớp lỗi repo này cấm.

### Tái lập fork

| | |
|---|---|
| Tree cây fork | **`df68a7d7460fe356b720e2ca2affd7cadb23786c`** |
| Tái lập | 15 patch lên `1cf1fc3` (`git am --keep-cr`) → **khớp từng byte** |
| Đối chứng ngược | chỉ áp **14/15** patch → tree ra `4c5d5b1e` ≠ ⇒ phép đo phân biệt được bản đủ với bản thiếu |
| `go vet` + `go build` | sạch (`golang:1.25.10`) |

⚠️ **Không cần build lại image node.** `netgen` chạy bằng `go run` trong container golang lúc
sinh mạng, không nằm trong binary node ⇒ patch 0015 **không** ràng buộc vào lượt `down -v` như
patch 0013 (D-050).

---

## 4. Phần thứ hai — console không cấp chainId đã bị người khác chiếm (B-14)

Tra sổ công khai `27/08` ([`G4-TRA-CHAINID-2026-08-27.md`](G4-TRA-CHAINID-2026-08-27.md)) phát
hiện **`9100` = Genesis Coin**, mà `9100` là **số đầu tiên console cấp** cho L1 người dùng.

`server.mjs` nay đọc [`local-net/console/chainid-taken.json`](../local-net/console/chainid-taken.json)
— **51 số** bị chiếm trong dải `9100–9999` — và bỏ qua chúng ở **cả hai** đường: người dùng tự
chọn số, và console tự cấp.

🔴 **Đây là ẢNH CHỤP, không phải tra trực tiếp.** Cố ý: một lời gọi HTTP ra Internet nằm giữa
đường người dùng bấm nút là thêm một chỗ hỏng ngoài tầm kiểm soát — hỏng lúc đó thì hoặc chặn
oan, hoặc bỏ qua trong im lặng. Cái giá là ảnh chụp **cũ dần**, nên tệp mang theo `ngayTra` và
console **in tuổi của nó** lúc khởi động, kèm cảnh báo khi quá 90 ngày.

Sinh lại: `node scripts/check-chainid.mjs --sinh-danh-sach-chan local-net/console/chainid-taken.json`

### Nghiệm thu — chạy thật trên console

| | |
|---|---|
| Nạp danh sách | `[chainId] danh sách chặn: 51 số (dải 9100–9999), tra 2026-08-27T09:43:32.748Z — 0 ngày trước` |
| Xin thẳng `9100` | 🔴 từ chối: *"Chain ID 9100 đã thuộc về "Genesis Coin" trong sổ chainId công khai… Ví đọc chainId chứ không đọc tên mạng"* |
| **Tự cấp** trên sổ RỖNG | genesis sinh ra mang **`chainId = 9101`** ⇒ **đã bỏ qua 9100** |
| 🔴 Đối chứng ngược: **xoá tệp danh sách** | console in `🔴 CỔNG CHẶN chainId ĐÃ BỊ CHIẾM ĐANG TẮT` + cách sinh lại — **không chạy tiếp trong im lặng** |

Ca đối chứng cuối là ca đáng giá: một cổng biến mất mà chương trình vẫn chạy như thường là đúng
kiểu *"xanh giả"* — nó chỉ lộ ra khi có người thật nhận chainId trùng.

Con số `9101` **đọc từ genesis L1 console vừa dựng** (`console-tmp/TuCapSoTest.json`), không đọc
từ log.

⚠️ **Câu lỗi tách riêng khỏi câu "trùng sổ nhà"** vì hai chỗ trùng là hai thứ khác nhau và cách
gỡ cũng khác: trùng sổ **nhà** ⇒ đổi số hoặc hỏi chủ cũ; trùng sổ **công khai** ⇒ không ai hỏi
được ai, chỉ còn đường chọn số khác.

---

## 5. 🔴 Còn lại — cần David

**Gốc dải `9100` vẫn là `9100`.** Danh sách chặn làm console **nhảy qua** số bị chiếm, nhưng
không trả lời câu *"dải nên bắt đầu từ đâu"* — và câu đó vướng đúng mục §5c đang chờ David:
*"có khôi phục sổ `retired` cũ không"* (khôi phục ⇒ bắt đầu từ **9146**; không ⇒ từ **9100**).
Xem `BLOCKERS.md` **B-14**.
