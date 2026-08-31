# Tạo chain riêng của bạn trên 9Chain Testnet A1

**Hướng dẫn cho người bắt đầu từ con số không.** Bạn không cần biết gì về blockchain trước khi
đọc. Cần khoảng **15 phút**, trong đó **3 phút** là ngồi chờ mạng dựng chain cho bạn.

Kết quả: một blockchain **của riêng bạn**, do ví bạn làm chủ, chạy thật trên mạng thử nghiệm —
kết nối được bằng MetaMask, deploy hợp đồng được, mời người khác vào dùng được.

> ⚠️ **Đây là mạng THỬ NGHIỆM (testnet).** Đồng LOVE9 ở đây **không có giá trị thật**. Nó tồn
> tại để bạn trả phí trong lúc thử. Đừng mua, đừng bán, đừng nhận nó thay tiền.

> 🔴 **Chain tạo trước `2026-09-01` sẽ bị XOÁ.** Mạng được dựng lại trong ngày đó, và **mọi chain
> người dùng biến mất theo** — kể cả chain của bạn. Đây không phải rủi ro, mà là một sự kiện đã
> lên lịch và chúng tôi đã biết trước, nên nói với bạn ở đây còn hơn để bạn tự phát hiện. Muốn giữ
> thứ mình dựng thì tạo **sau** lượt dựng lại. Một mạng thử nghiệm có thể được dựng lại lần nữa;
> lần sau chúng tôi cũng sẽ báo trước.

---

## Trước khi bắt đầu — ba câu hỏi hay gặp

**"Chain riêng" nghĩa là gì?**
Một blockchain độc lập, có sổ cái riêng, đồng token riêng, luật phí riêng. Nó chạy trên hạ tầng
của 9Chain-A1 nhưng dữ liệu và quyền quản trị là của bạn. Trong Avalanche người ta gọi nó là
**L1**.

**Tôi phải trả bao nhiêu?**
Không đồng nào. Phí dựng chain do mạng trả. Bạn chỉ cần một ví.

**Ai làm chủ chain?**
Ví bạn ký ở bước 4. Địa chỉ chủ chain **lấy từ chữ ký**, không ai gõ tay — kể cả bạn. Chọn đúng
ví ngay từ đầu, vì địa chỉ đó đi vào nền móng của chain và **không sửa được sau này**.

---

## Bước 1 · Cài MetaMask

MetaMask là ví tiền mã hoá dạng tiện ích trình duyệt. Nó giữ khoá của bạn và ký thay bạn.

1. Vào **https://metamask.io** và cài tiện ích cho trình duyệt bạn đang dùng.
2. Tạo ví mới, đặt mật khẩu.
3. 🔴 **Chép 12 từ khôi phục ra giấy và cất kỹ.** Mất 12 từ đó là mất ví vĩnh viễn — không ai
   khôi phục hộ được, kể cả 9Chain.

Đã có MetaMask rồi thì bỏ qua bước này.

---

## Bước 2 · Thêm mạng A1 vào ví

Mặc định MetaMask chỉ biết Ethereum. Phải chỉ cho nó biết mạng A1 ở đâu.

1. Mở **https://a1.9chain.org/faucet/**
2. Bấm nút **"Add network to wallet"**
3. MetaMask hiện hộp xác nhận → bấm **Approve**

Xong. **Đừng gõ tay các thông số** — một chữ số sai là nửa tiếng đi tìm.

<details>
<summary>Nếu bạn vẫn muốn nhập tay (bấm để mở)</summary>

| Trường | Giá trị |
|---|---|
| Network name | `9Chain Testnet A1` |
| RPC URL | `https://rpc-a1.9chain.org/ext/bc/C/rpc` |
| Chain ID | `9000000009` |
| Currency symbol | `LOVE9` |
| Decimals | `18` |
| Block explorer | `https://a1.9scan.org` |

</details>

> 🔴 **Nếu bạn đã từng thêm mạng A1 từ trước:** xoá nó đi rồi thêm lại bằng nút ở trên. Cấu
> hình cũ có thể trỏ vào địa chỉ `rpc-testnet-a1.9chain.org` — địa chỉ **đã ngừng hoạt động**.
> Ví trỏ vào đó sẽ báo lỗi kết nối, trông y như mạng bị chết trong khi mạng vẫn chạy bình thường.

---

## Bước 3 · Nhận token thử nghiệm

Bạn cần một ít LOVE9 để trả phí khi dùng chain sau này.

1. Vẫn ở trang **https://a1.9chain.org/faucet/**
2. Chép địa chỉ ví của bạn từ MetaMask (chuỗi bắt đầu bằng `0x…`) và dán vào ô
3. Bấm **"Send me tokens"**

Token về ví trong vài giây. Nếu MetaMask hiện số 0, kiểm tra xem ví đang đứng ở mạng
**9Chain Testnet A1** chưa — góc trên bên trái MetaMask.

> **Vì sao ví hiện 18 số lẻ mà chỗ khác ghi 9?**
> LOVE9 đếm 18 số lẻ trên C-Chain (nơi MetaMask nói chuyện) và 9 số lẻ trên hai chain còn lại
> của mạng. **Một đồng, hai thang đo** — không phải hai loại token khác nhau.

---

## Bước 4 · Tạo chain

1. Mở **https://a1.9chain.org/create-chain/**

   ⚠️ Nếu trang báo *"No wallet found in this browser"* thì bạn đang mở bằng trình duyệt chưa
   có MetaMask. Quay lại bước 1. Form chỉ hiện ra sau khi ví kết nối — đó là thiết kế, không
   phải lỗi.

2. Bấm **"Connect wallet"** và chọn ví trong MetaMask.

3. MetaMask hiện hộp **ký chữ ký**. Bấm ký.

   Đây **không phải giao dịch**: không tốn phí, không chuyển tiền đi đâu. Nó chỉ chứng minh bạn
   cầm khoá của ví đó.

4. **Đặt tên chain.** Tên phải chưa ai dùng. Nếu trùng, trang sẽ báo và bạn đổi tên khác.
   Viết hoa khác đi **không** làm tên thành trống: `MyChain` và `mychain` tính là **một tên**.

5. **Chọn một cấu hình** trong sáu cái ở bảng dưới. Chưa chắc thì chọn `standard`.

6. Bấm nút tạo, rồi **chờ khoảng ba phút**. Mạng phải dựng chain và khởi động lại node để nó
   bắt đầu phục vụ chain của bạn.

> 🔴 **Nếu trình duyệt báo lỗi `524` hoặc "hết thời gian chờ" — ĐỪNG bấm lại.**
> Việc dựng chain mất khoảng 170 giây, còn lớp bảo vệ phía trước cắt kết nối ở khoảng 100 giây.
> Chain của bạn **vẫn đang được dựng bình thường**. Chờ thêm hai phút rồi mở
> **https://a1.9chain.org/chains/** — nếu chain của bạn có trong danh sách thì nó đã xong.
> Bấm tạo lại chỉ tạo ra chain thứ hai.

---

## Sáu cấu hình — chọn cái nào

| Cấu hình | Dành cho ai | Đánh đổi |
|---|---|---|
| **standard** | Hầu hết mọi người. Chain EVM thường; bạn nhận toàn bộ token khởi tạo và quyền đổi phí | Không có gì đặc biệt |
| **zero-fee** | Game, thử nghiệm, chain nội bộ. Phí gần như bằng 0 | Gần như không có gì cản spam |
| **high-throughput** | Ứng dụng nhiều giao dịch nhỏ, liên tục. Gấp 5 lần số giao dịch mỗi block | Block nặng hơn; ai chạy node cho chain này cần máy mạnh hơn |
| **mintable** | Khi bạn cần in thêm token về sau | ⚠️ **Tổng cung không cố định.** Ai dùng chain của bạn đều phải được cho biết điều này |
| **owner-deploy-only** | Chain mà chỉ bạn được đưa hợp đồng lên | Người khác vẫn gửi giao dịch và dùng hợp đồng sẵn có được |
| **permissioned** | Chain nội bộ công ty | ⚠️ Chặt nhất: chỉ địa chỉ trong danh sách mới **gửi** được giao dịch |

**Bạn không chọn số hiệu chain (chainId).** Mạng tự cấp số trống đầu tiên. Bạn chọn **tên** và
**cấu hình**, thế thôi.

---

## Bước 5 · Thêm chain của bạn vào MetaMask

Tạo xong, trang hiện thông tin chain. Hai thứ bạn cần:

- **RPC** — địa chỉ chain của bạn
- **Chain ID** — số hiệu chain của bạn

Vào MetaMask → *Settings → Networks → Add network → Add a network manually*, điền hai giá trị
đó, đặt tên chain và ký hiệu token tuỳ ý.

Bây giờ ví bạn có **hai** mạng: mạng A1 (để lấy token, tạo chain) và **chain của riêng bạn**.
Chuyển qua lại bằng menu ở góc trên bên trái MetaMask.

---

## 🔴 Giao dịch đầu tiên trên chain mới — đọc trước khi thử

Chain vừa sinh ra chưa có block nào ngoài block gốc, và điều đó làm **phép ước lượng phí bị
sai**. Hậu quả: giao dịch đầu tiên của bạn sẽ **hết phí giữa chừng và thất bại mà không báo lý
do** — trông hệt như "chức năng này không được bật". Từ block thứ hai trở đi mọi thứ bình
thường.

**Cách đi qua nó:** giao dịch đầu tiên hãy là một lần **chuyển tiền thường** (gửi một ít LOVE9
từ ví bạn sang chính ví bạn cũng được). Loại giao dịch này tốn đúng 21 000 đơn vị phí, cố định,
không cần ước lượng. Sau đó deploy hợp đồng hay gọi chức năng gì cũng chạy bình thường.

Nếu buộc phải làm việc khác trước, đặt giới hạn phí thủ công **300 000**.

---

## Sự cố thường gặp

| Bạn thấy | Nguyên nhân | Cách xử lý |
|---|---|---|
| Trang tạo chain không có ô nào để điền | Chưa cài MetaMask, hoặc chưa kết nối ví | Cài MetaMask, tải lại trang, bấm *Connect wallet* |
| Ví hiện số dư 0 sau khi xin token | Ví đang đứng ở mạng khác | Chuyển sang mạng *9Chain Testnet A1* ở góc trên bên trái |
| Ví báo lỗi kết nối mạng | Cấu hình cũ trỏ vào địa chỉ đã ngừng hoạt động | Xoá mạng A1 trong ví, thêm lại bằng nút ở bước 2 |
| Lỗi `524` khi tạo chain | Chain vẫn đang dựng, chỉ là trình duyệt hết kiên nhẫn | **Đừng bấm lại.** Chờ 2 phút, xem `/chains/` |
| Giao dịch đầu tiên thất bại, không rõ lý do | Ước lượng phí sai ở block đầu | Xem mục ngay phía trên |
| Trang danh bạ chưa thấy chain của bạn | Chain chưa lên xong | Chờ thêm một phút rồi tải lại |

---

## Từ vựng — đủ để hiểu hết trang này

| Từ | Nghĩa |
|---|---|
| **Ví (wallet)** | Phần mềm giữ khoá của bạn và ký thay bạn. Ở đây là MetaMask |
| **Địa chỉ** | Chuỗi bắt đầu bằng `0x…`. Giống số tài khoản — chia sẻ được, an toàn |
| **Khoá / 12 từ khôi phục** | Thứ mở được ví. **Không bao giờ đưa cho ai**, kể cả người tự xưng là 9Chain |
| **Phí (gas)** | Chi phí mỗi giao dịch, trả bằng token của mạng |
| **Faucet** | Vòi cấp token miễn phí trên mạng thử nghiệm |
| **Testnet** | Mạng thử nghiệm. Token không có giá trị thật |
| **L1** | Một blockchain độc lập — thứ bạn sắp tạo |
| **Chain ID** | Số hiệu để ví phân biệt các mạng với nhau |
| **RPC** | Địa chỉ mà ví gọi tới để nói chuyện với một mạng |
| **Explorer** | Trang tra cứu block và giao dịch. Của A1 là 9Scan-A1 |

---

## Còn thắc mắc

- Danh bạ mọi chain đang chạy: **https://a1.9chain.org/chains/**
- Tra cứu block và giao dịch: **https://a1.9scan.org**
- Trang chủ mạng: **https://a1.9chain.org**

🔴 **Nhắc lại một lần nữa:** đây là mạng thử nghiệm. Token không có giá trị. Đừng gửi tài sản
thật vào đây, và đừng bao giờ đưa 12 từ khôi phục cho bất kỳ ai.

---

<sub>Bản **nguồn** để dịch mọi thứ tiếng là bản tiếng Anh:
[`CREATE-A-CHAIN.md`](CREATE-A-CHAIN.md). Dịch từ tệp đó, đừng dịch từ một bản dịch.</sub>
