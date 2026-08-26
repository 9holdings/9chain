# Rủi ro của việc đổi thang đơn vị P/X sang `1e7` (D-038)

Soát 2026-08-26, sau khi David chốt `1e7`. **Mọi mục dưới đây đều có vị trí cụ thể
trong mã** — không có mục nào là suy đoán. Chỗ nào chưa đo được thì ghi rõ là chưa đo.

---

## 🔴 R1 — THANG `1e9` NẰM Ở **BA** CHỖ ĐỘC LẬP, KHÔNG PHẢI MỘT

Đây là rủi ro lớn nhất, và nó lớn vì **sai lệch giữa ba chỗ không gây lỗi nào**.

| # | Vị trí | Vai trò | Giá trị mới |
|---|---|---|---|
| 1 | `9chain-a1-tools/netgen/allocation.go:20` — `unitLOVE9 = 1_000_000_000` | LOVE9 → đơn vị P/X, lúc **sinh genesis** | `10_000_000` |
| 2 | `9chain-a1-tools/netgen/main.go:273` — `Mul(b.CChain, big.NewInt(1_000_000_000))` | đơn vị P/X → **wei** trong `cChainGenesis` | `100_000_000_000` |
| 3 | `graft/coreth/plugin/evm/atomic/tx.go:33` — `X2CRateUint64` | đơn vị P/X ↔ wei, **lúc chạy** (atomic X/P↔C) | `100_000_000_000` |

**Bất biến phải giữ:** `unitLOVE9 × X2CRate = 1e18` (để C-Chain vẫn 18 chữ số), và
(2) phải **luôn bằng** (3).

🔴 **Nếu đổi (1) mà quên (2):** mạng vẫn khởi động, P-Chain đúng, nhưng số dư
C-Chain trong genesis **sai 100 lần**. Không lỗi, không cảnh báo — chỉ là quỹ trên
C-Chain nhiều/ít hơn 100 lần so với bảng phân bổ.

🔴 **Nếu đổi (2) mà quên (3):** genesis đúng, nhưng **mọi lượt chuyển tài sản
X/P → C sau đó sai 100 lần**. Lộ ra vào đúng lúc có người chuyển tiền thật.

**Cách chặn:** cổng nhất quán phải đọc cả ba con số từ mã nguồn và khẳng định quan hệ,
chứ không để ba chỗ tự do trôi. Đây là thứ *không* con người review nào bắt được đáng
tin — ba tệp khác nhau, hai ngôn ngữ vai trò khác nhau.

---

## 🔴 R2 — `units.*` TRỞ THÀNH LỜI NÓI DỐI CÂM TRONG `genesis_9chain_a1.go`

Hiện tệp đó viết:
```go
MinValidatorStake: 2 * units.KiloAvax,   // chú thích: "2,000 LOVE9"
MaxValidatorStake: 50 * units.MegaAvax,  // chú thích: "50,000,000 LOVE9"
```
`units.KiloAvax` = `1e12`. Ở thang `1e9` đó là 1.000 LOVE9 ✓. **Ở thang `1e7` đó là
100.000 LOVE9** — sai 100 lần, **và chú thích vẫn ghi "2,000 LOVE9"**.

⇒ Mỗi `units.*` còn sót lại là một sai số 100 lần **không có lỗi biên dịch, không có
lỗi lúc chạy, và chú thích bên cạnh khẳng định điều ngược lại**. Người review đọc
chú thích rồi gật.

**Cách chặn — bất biến kiểm được:** khai `const LOVE9 uint64 = 10_000_000` trong chính
tệp A1 và **cấm tuyệt đối `units.` xuất hiện trong `A1Params`**. Cổng nhất quán khẳng
định `số lần xuất hiện "units." trong khối A1Params == 0`. Một dòng grep, chặn cả lớp lỗi.

---

## 🔴 R3 — KHÔNG CÓ BÀI KIỂM NÀO CHẠM ĐƯỜNG X/P ↔ C-CHAIN

Bộ nghiệm thu hiện có: `smoke-l1` (C-Chain + RPC L1), `faucet` (C-Chain, ethers),
`bridge-test`/`warp-test` (**giữa hai L1**, không qua P/X), `load-test` (C-Chain).
**Không bài nào gửi tài sản giữa X/P và C-Chain.**

⇒ Đổi `X2CRate` là thay đổi consensus-critical mà **toàn bộ bảng nghiệm thu vẫn xanh
100%**. Đây đúng lớp lỗi dự án đã trả giá nhiều lần trong ngày 2026-08-26, và lần này
thứ hỏng là **tiền của người dùng**, không phải một trang web.

**Phải có trước ngày G:** một bài kiểm export X→C và import C→X, đối chứng số dư hai
đầu. Không có nó thì không được bấm.

---

## 🟠 R4 — LỚP CHỦ QUYỀN LÀ **PATCH SERIES**: SỬA `upstream/` TRỰC TIẾP SẼ BỐC HƠI

`patches/0001..0004` + `scripts/apply-sovereign.sh` dựng lại nhánh `9chain-a1` từ
patch. Cả ba vị trí ở R1 đều nằm trong `upstream/`:
- (1) và (2) thuộc `0003` (bộ công cụ netgen)
- (3) thuộc `graft/coreth` — **hiện KHÔNG có patch nào chạm tới nó**, nên đây sẽ là
  **điểm chủ quyền MỚI** (dự án đang khai 7 điểm, M8 diễn tập rebase giữ đủ 7).

⇒ Đổi số mà không đưa vào patch series thì lượt `apply-sovereign.sh` kế tiếp **xoá
sạch**, và binary build ra sẽ là bản cũ — trong khi mã nguồn trên đĩa trông đúng.
⇒ Phải chạy lại `scripts/rebase-drill.sh` và cập nhật con số 7 → 8.

---

## 🟠 R5 — `X2CRate` LÀ HẰNG SỐ **TOÀN CỤC**, KHÔNG THEO `networkID`

`A1Params` được chọn theo `networkID` (`GetStakingConfig`/`GetTxFeeConfig`), nhưng
`X2CRateUint64` là `const` cấp gói — **áp cho mọi mạng trong cùng binary**.

Hệ quả:
- Không ảnh hưởng vận hành (binary này chỉ chạy 9001).
- Nhưng **test upstream nào khẳng định `X2CRate == 1e9` sẽ đỏ**. Nền hiện tại là
  "220 xanh / 7 đỏ, fork chịu trách nhiệm đúng 2 gói" (M8/D-018). Con số đó sẽ đổi,
  và nếu không cập nhật thì phiên sau đọc đỏ mới thành hồi quy.
- 🔴 **Consensus-critical:** hai node chạy `X2CRate` khác nhau sẽ bất đồng về phí
  atomic ⇒ **tách chain**. Nên thay đổi này **không rollout từng node được** — bắt
  buộc đi cùng một lượt re-genesis toàn mạng (điều đang làm, nhưng phải nói rõ).

---

## 🟡 R6 — 9SCAN-A1 (DỰ ÁN KHÁC) SẼ HIỂN THỊ SAI 100 LẦN

Explorer chia số dư P-Chain cho `1e9` để ra LOVE9. Sau đổi thang, mọi số dư P-Chain
họ hiện **to gấp 100 lần sự thật**. Họ là repo khác, A1 không sửa hộ — **phải báo**,
và báo **trước** ngày G chứ không sau.

Cùng nhóm: ví X/P ở `:8090`, `allocation.md`, và mọi tài liệu có số LOVE9.

---

## 🟢 Những thứ ĐÃ KIỂM và **KHÔNG** phải rủi ro

| | Kết luận | Bằng chứng |
|---|---|---|
| **L1 của người dùng** | Không ảnh hưởng | `subnet-evm` có **0** tham chiếu `X2CRate` |
| **Tràn ở phép tính thưởng** | Không | `reward/calculator.go:46-60` tính bằng `big.Int`; chỉ vào/ra là `uint64` |
| **Phí atomic đổi giá trị** | Không | `fee = ceil(cost × baseFee_wei / X2CRate)`; thang và tỷ lệ đổi cùng nhau ⇒ phí tính bằng LOVE9 **không đổi**. Kiểm bằng số: `1e15` wei → cũ `1e6`đv ÷`1e9`=0,001 · mới `1e4`đv ÷`1e7`=0,001 |
| **Người dùng thấy khác đi** | Không | C-Chain vẫn 18 chữ số; `web/lib/chain.ts` `thapPhan: 18` không đổi |
| **Mất chính xác / bụi** | Không đáng kể | Xuất C→X cắt phần dư dưới `1e11` wei = `1e-7` LOVE9 |
| **G2 self-bond ≤ maxValidatorStake** | Đạt | 10/20/30/40% → 1/2/3/4 tỷ mỗi node, trần 6,25 tỷ |
| **Trần `uint64`** | Còn rất rộng | SupplyCap chiếm **4,879%**, gần đúng mức 3,90% của mạng đang chạy |

---

## Chưa đo được — ghi ra để không ai tưởng đã kiểm

- Có chỗ nào khác trong `avalanchego` ngầm giả định `1 AVAX = 1e9` ngoài ba chỗ ở R1
  hay không. Đã grep `X2CRate` và `units.` ở phạm vi liên quan, **chưa soát toàn bộ
  codebase**.
- Ví X/P `:8090` và console hiển thị số dư P/X như thế nào.
- Bao nhiêu test upstream sẽ đỏ thêm (R5) — cần chạy mới biết.

---

## Thứ tự an toàn

1. Dựng **cổng nhất quán** khẳng định R1 (ba con số) và R2 (`units.` = 0) — **trước
   khi đổi bất kỳ số nào**.
2. Viết **bài kiểm X↔C** (R3). Chạy trên mạng HIỆN TẠI để có mốc đối chứng lúc thang
   còn `1e9`.
3. Đổi số, đưa vào **patch series** (R4), chạy `rebase-drill.sh`.
4. Chạy lại bài X↔C — số phải khớp mốc ở bước 2 **tính bằng LOVE9**.
5. Báo 9Scan-A1 (R6).
