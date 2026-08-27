# I1b — PHƠI CUNG RA ENDPOINT, VÀ MỖI CON SỐ MANG THEO NGUỒN CỦA NÓ

> Mốc A-5 của đợt autopilot 14. Điều kiện qua: *"số trên trang truy được về một lệnh RPC,
> hoặc trang tự khai nguồn là tham số genesis"* — **đạt bằng đường mạnh hơn: endpoint.**
> `GET /api/supply` · `netgen/cung.json` (patch **0016**, tree fork **`c9226d9c`**, 16 patch).

---

## 1. Điều luật cứng của 9Scan-A1 đòi, và điều nó KHÔNG thể đòi

Luật của 9Scan-A1: *"số công bố phải đọc từ chain thật"*. In trần một con số mà không có
endpoint là **gõ hằng số vào giao diện**.

🔴 **Nhưng có một sự thật không chiều theo luật đó được: tổng cung `9.000.000.000` KHÔNG đọc
được từ bất kỳ lệnh RPC nào.** Hai lý do, cả hai đã đo:

| | |
|---|---|
| `platform.getCurrentSupply` **chỉ đếm X/P** | Nó **không bao giờ** đếm `1.099.999.999` LOVE9 phát hành thẳng trên C-Chain. Phát hiện P0 của bản soát core `27/08`, đã đo trên node đang chạy |
| `SupplyCap` là **hằng số biên dịch vào binary** | Không endpoint nào trả về nó. Nó chỉ xuất hiện trong dòng log đầu tiên của node |

⇒ Một endpoint trả về *"totalSupply: 9000000000"* và im lặng về xuất xứ sẽ **đúng số nhưng
sai bản chất** — nó dựng lên vẻ ngoài "đọc từ chain" cho một con số là **phép cộng của một
hằng số binary với một số đo được**.

---

## 2. Cách làm: mỗi trường mang `source` của chính nó

`GET /api/supply` (faucet server) trả về, với **bốn** loại nguồn:

| `source` | Nghĩa | Trường |
|---|---|---|
| `measured` | vừa đo bằng RPC, kèm tên lệnh | `xpCurrentSupply` · `cChainGenesis` |
| `binary-constant` | hằng số trong binary, **không đo được từ RPC** | `xpSupplyCap` |
| `derived` | suy ra, **kèm công thức** | `totalSupply` |
| `genesis-parameter` | tham số genesis (trong bản khai) | các trường trong `cung.json` |

### Đo thật lượt `27/08` (mạng tập, `chainId 9000000909`)

```json
"xpCurrentSupply": { "love9": "4,300,883,914", "source": "measured",
                     "method": "platform.getCurrentSupply",
                     "note": "CHI dem X/P. KHONG dem phan phat hanh thang tren C-Chain" }
"cChainGenesis":   { "love9": "1,099,999,999", "source": "measured",
                     "method": "eth_getBalance(addr, \"0x0\") cong theo 2 dia chi" }
"xpSupplyCap":     { "love9": "7,900,000,001", "source": "binary-constant" }
"totalSupply":     { "love9": "9,000,000,000", "source": "derived",
                     "formula": "xpSupplyCap + cChainGenesis" }
"manifestMatchesChain": true, "mismatches": []
```

🔴 **Phát hiện P0 nay nằm ngay trong phản hồi**, không phải trong một tài liệu ai đó phải nhớ
đi đọc: hai con số đứng cạnh nhau, và `note` nói thẳng cái thứ nhất không đếm cái thứ hai.

### 🔴 `eth_getBalance` ở **block 0**, không phải `latest`

Ta hỏi *"genesis đã phát hành bao nhiêu"*, **không** hỏi *"bây giờ còn bao nhiêu"*. Hai câu đó
khác nhau ngay khi có người tiêu tiền, và trộn chúng là cách một trang tokenomics từ từ thành
một trang số dư ví.

---

## 3. `cung.json` — bản khai, **không phải nguồn sự thật**

netgen nay sinh thêm `<net>/cung.json` cùng lượt với `genesis.json`.

**Vì sao cần:** `allocation.md` là markdown cho **người** đọc; không dịch vụ nào phân tích nổi
nó. Nên tới `27/08`, mọi con số cung xuất hiện ngoài mã nguồn đều là **gõ tay lại**, không truy
ngược được về lượt sinh mạng đã đẻ ra chúng.

🔴 **Nhưng một endpoint đọc tệp JSON rồi in lại thì vẫn chỉ là gõ hằng số** — chỉ khác là hằng
số nay đi qua một tệp. Nên `cung.json` chỉ nói **đo cái gì, ở đâu**; endpoint **tự đo rồi so
lại**, và `manifestMatchesChain` / `mismatches` là ô ✓ thật sự của bài này.

⚠️ **`totalSupply` suy từ số ĐO ĐƯỢC, không từ số khai.** Sửa `cChainGenesis` trong `cung.json`
**không** làm đổi `totalSupply` trả về — nó chỉ làm `manifestMatchesChain` thành `false`. Tức
không ai đẩy được con số công bố lên bằng cách sửa một tệp cấu hình.

⚠️ Đơn vị khai **tường minh cả hai thang**: `nLOVE9` (9 chữ số) cho X/P, `wei` (18) cho C-Chain.
Chúng lệch nhau `1e9`, và đó là chỗ đã suýt sai một lần.

---

## 4. Nghiệm thu — chạy thật, có hai ca đối chứng ngược

Mạng tập dựng **từ chính bộ vật liệu netgen vừa sinh** (3 node, `chainId 9000000909`), node
boot thật, faucet server trỏ vào đó.

| # | Ca | Kết quả |
|---|---|---|
| 1 | bình thường | `manifestMatchesChain: true`, `mismatches: []`, 4 trường đủ `source` |
| 2 | 🔴 **sửa bản khai** (`cChainGenesis` 1.099.999.999 → 1.100.000.000, và một địa chỉ +1 LOVE9) | `manifestMatchesChain: **false**` · nêu đích danh `foundation (0x5949806A…): khai … đo …` **và** dòng tổng `cChainGenesis: khai … đo …`. `totalSupply` **vẫn ra 9.000.000.000** — không đẩy được bằng cách sửa tệp |
| 3 | 🔴 **xoá bản khai** | log khởi động `🔴 KHÔNG đọc được …` + `/api/supply` **HTTP 503**, không bịa số. Đối chứng: `/api/info` vẫn **200** ⇒ hỏng **có phạm vi**, không kéo sập faucet |

Ca 3 quan trọng vì lựa chọn dễ hơn là *"thiếu tệp thì dùng số mặc định"*. **Một endpoint cung
trả về số bịa còn tệ hơn một endpoint không trả gì** — số bịa sẽ được chép đi.

### Tái lập fork

Tree **`c9226d9c410e5518cfa0b85b0de93bda24863f9d`** · **16 patch** lên `1cf1fc3`
(`git am --keep-cr`) → **khớp từng byte**. `go vet` + `go build` sạch.

---

## 5. 🔴 Còn lại — hai việc, không cái nào chặn ngày G

### (a) Vận hành: `cung.json` phải lên server cùng `faucet.env`

Tới nay quy ước là *"`faucet.env` là tệp DUY NHẤT trong bộ này được phép đưa lên server"*.
`cung.json` **cũng phải lên** (nó công khai được — chỉ có địa chỉ và số, không có khoá).
**Quên nó thì `/api/supply` trả 503** — hỏng ồn ào, không hỏng câm, nhưng vẫn là hỏng.
⚠️ Bộ `local-net/net/` hiện tại sinh **trước** patch 0016 nên **chưa có** `cung.json`. Nó sẽ
có ở lượt sinh mạng ngày G.

### (b) Trang công khai vẫn in một con số trần

`web/lib/i18n/vi.ts:58` — *"A1 đổi tổng cung lên 9.000.000.000 LOVE9"* — là **chỗ duy nhất**
con số này xuất hiện trên trang, và nó không khai nguồn.

🔴 **Không sửa trong lượt này** vì `web/` thuộc worktree `C:\PROJECTS\9Chain-A1-web` (nhánh
`web-home`), và luật cứng #4 của repo là **chỉ một phiên được deploy**. Việc cần làm, nêu chính
xác để phiên web làm gọn:

> Câu cần thêm cạnh con số: *"9.000.000.000 = trần cung P/X (7.900.000.001, hằng số trong
> binary) + phần phát hành thẳng trên C-Chain (1.099.999.999, đọc được ở block 0). Không một
> lệnh RPC nào trả về con số tổng — kiểm lại được ở `/faucet/api/supply`."*

Điều kiện qua của A-5 là *"endpoint **hoặc** trang tự khai nguồn"*; đường endpoint đã xong, nên
đây là mục **làm cho đủ**, không phải mục còn thiếu.
