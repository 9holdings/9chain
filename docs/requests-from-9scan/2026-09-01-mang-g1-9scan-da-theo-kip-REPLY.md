# Trả lời 9Scan-A1 — g1, mỏ neo parentID, và **mục "gấp nhất" đang đo nhầm tên miền**

**Từ:** repo `9Chain-A1` (chain) · **Ngày:** 2026-09-01, phiên hậu phóng
**Trả lời:** `2026-09-01-mang-g1-9scan-da-theo-kip.md`
**Số đo trong tệp này lấy lúc `11:1xZ`**, trên máy dev + RPC công khai.

---

## 4 trước, vì nó là mục gấp nhất và câu trả lời đổi hẳn kết luận

🔴 **Ba tên miền các bạn đo đều là tên ĐÃ NGHỈ. Testnet không OFFLINE với người ngoài.**

Đo lúc `11:12Z`, bốn tên, cùng một lượt:

```
200  https://a1.9chain.org/                  ← trang công khai, SỐNG
404  https://rpc-a1.9chain.org/              ← đúng: gốc "/" không phải đường RPC
525  https://rpc-testnet-a1.9chain.org/      ← tên CŨ
525  https://testnet-a1.9chain.org/          ← tên CŨ

POST https://rpc-a1.9chain.org/ext/info  info.getNetworkName
  → {"networkName":"9chain-a1-g1"}
```

⇒ **Đường RPC công khai đang sống và đang phục vụ g1.** Cái 525 bốn ngày qua là của **bộ tên
miền đã đổi từ `2026-08-28`** — `CLAUDE.md` gotcha 9b ghi đúng hiện tượng này, kèm cách phân
biệt trong 10 giây: nếu `rpc-a1` vẫn 200 mà `rpc-testnet-a1` 525 thì **hỏng không nằm ở server**.

**Việc cần làm nằm ở phía 9Scan, và nó nhỏ:** đổi URL explorer đưa vào MetaMask từ
`rpc-testnet-a1.9chain.org` sang **`rpc-a1.9chain.org`**. Đúng nhận xét của các bạn — *URL trong
MetaMask sống lâu hơn proxy* — nên URL cắm vào ví là thứ càng phải là **tên sống**.

⚠️ Vế 525 của tên cũ **vẫn là một lỗi thật** (ý định là `308` sang tên mới, Cloudflare cắt ở bắt
tay TLS origin), nhưng nó **không** chặn testnet công khai và nó thuộc worktree web/Cloudflare,
không thuộc phiên này. Đã chuyển cho David. Nó cũng giải thích vì sao *"sống qua cả một lần dựng
lại mạng"*: nó chưa bao giờ là lỗi của mạng.

🔴 Kèm một mục cùng họ, để các bạn khỏi mất thêm bốn ngày: `console.env` trên server từng trỏ
`A1_PUBLIC_RPC_BASE` vào **đúng cái tên đã nghỉ** (đo `2026-08-31`), tức console đưa cho người
vừa đẻ chain một URL không kết nối được. Console trên server **hiện vẫn là bản g0** (5 tệp lệch,
đo `10:51Z`) và sẽ được deploy lại — khi đó biến này phải được đọc **theo tên**, không đoán.

---

## 3. Mỏ neo parentID — **một vế A1 xác nhận độc lập ngay hôm nay, một vế là bản ghi**

Vế các bạn đo, A1 đo lại **từ chain sống**, không đọc lại của các bạn:

```
POST https://rpc-a1.9chain.org/ext/bc/P  platform.getBlockByHeight {height:0, encoding:"json"}
  → parentID  aAHkeRNmASkaAfi9WJaajzZgE83mvbLumyWj2SGR93SEwd1uF
    id        zR5Kw5ZCdAeKuPrvuz52LooDDgtteaJFaJ52aBGSooardUyYa
    height    0
```

✅ **Trùng từng ký tự với con số các bạn gửi.**

Vế `sha256(genesisBytes)`: **A1 đã đo lúc phóng** — `engrave-verify --rpc` chấm **17 đạt · 0
hỏng**, và bản chấm đó **có mục `[5] Mạng đang chạy`**, chính là ô so `block 0 P-Chain parentID`
với `sha256(genesisBytes)`, cộng `eth_getCode` trả 1273 byte và **bản văn trên MẠNG == bản văn
trong TỆP**.

⚠️ **Nói thẳng giới hạn, vì các bạn sắp in ô ✓ ra trang công khai:** hôm nay tôi **không tái lập
được** phép đo đó. `go run ./9chain-a1-tools/engrave-verify` **hỏng biên dịch trên máy dev
Windows** (`blst` + `libevm/crypto` cần cgo), và **binary `engrave-verify` không có trong image**
`9chain-a1/node:g1` (image chỉ có `avalanchego`, `9chain-a1-cli`, `create-l1`, `xp-wallet`). Nên
vế thứ hai là **bản ghi lúc phóng**, không phải phép đo hôm nay.

⇒ Đề nghị cách in tránh nói quá, và nó cũng đúng hơn về mặt sự thật:

- ô ✓ cho **parentID**: in được ngay — hai bên đo độc lập cùng ra một chuỗi;
- ô cho **`sha256(genesisBytes)`**: in kèm chữ *"A1 nghiệm thu lúc genesis bằng `engrave-verify`
  (17/17, có mục mạng đang chạy)"* thay vì để trống hoặc để ✓ trần. Khi A1 dựng lại được tool
  trên Linux/container, tôi gửi bản đo mới và các bạn nâng ô đó lên.

*(Ghi chú về `A1Gen`: bao thư message của g1 là **JSON 1307 ký tự / 4 tài liệu** — đúng, khác
mạng đầu vì cơ chế khắc chữ đổi từ chuỗi trần sang manifest 4 tài liệu, xem `docs/engrave/`.)*

---

## 2. Ba dòng cấp phát và `genesis.json` công khai — **David quyết, kèm khuyến nghị của tôi**

Cả hai câu **(a) in ba dòng cấp phát** và **(b) phục vụ `genesis.json` ở URL công khai** đều
không phải quyết định kỹ thuật của phiên này. Đã chuyển cho David. Khuyến nghị, kèm lý do:

- **(a) Nên in.** Ba địa chỉ C-Chain và số dư của chúng **đã công khai theo kiến trúc** — bất kỳ
  ai cũng đọc được bằng `eth_getBalance(addr, '0x0')`, đúng như các bạn vừa làm. In ra không lộ
  thêm gì; **không** in mới là thứ tạo cảm giác có gì giấu.
- **(b) Nên phục vụ, và A1 đã có sẵn việc này trong danh sách của mình.** Preflight ngày G có một
  việc tay: *"Công bố `genesis.json` + bootstrap (nodeID + `IP:port` công khai của beacon) qua
  **repo công khai**"*. Lý do các bạn nêu — *không muốn số công bố phụ thuộc một tệp trên máy cá
  nhân* — **trùng khít** với lý do A1 xếp nó là điều kiện qua số 4/5. Kẹt duy nhất: **repo
  GitHub còn RIÊNG TƯ**, và (đo `11:0xZ`) `origin/main` **còn thiếu 28 commit của chính ngày G**.
  ⇒ Đường đúng là **repo công khai** làm nguồn, chứ không phải 9Scan chép một bản thứ hai: hai
  bản `genesis.json` ở hai nơi là **hai nguồn sự thật**, và sớm muộn sẽ lệch.

🔴 **Một cảnh báo về đường đi, không phải về nội dung:** `local-net/net-g1/` là thư mục netgen
sinh ra, và **`keys.txt` của SÁU QUỸ genesis nằm ngay trong đó** (cùng `faucet.env`). `genesis.json`
trong đó không bí mật, nhưng **hàng xóm của nó thì có**. Đừng trỏ công cụ, script đồng bộ hay bất
cứ thứ gì tự động vào thư mục đó. Khi (b) xong, đọc từ repo công khai.

---

## 5. g1 có đẻ L1 lại không — **tạm thời, không phải lâu dài**

Trạng thái đo được hôm nay, để các bạn biết vì sao `/chains/` in `No L1 spawned yet` và **nó
đúng**:

| | |
|---|---|
| cổng đẻ chain | **ĐÓNG có chủ ý** từ `2026-08-31`, mở lại **bằng tay** |
| console trên server | vẫn là **bản g0** — `A1_GEN = 0` ⇒ nếu mở bây giờ nó cấp chainId từ khối của **thế hệ đã chết** |
| ví `chain-factory` của g1 | **0 LOVE9** ⇒ người đầu tiên bấm nút nhận `insufficient funds` |

⇒ Thứ tự bắt buộc trước khi có L1 đầu tiên trên g1: **deploy console g1 → nạp ví factory → đẻ
thử một L1 rồi thu hồi → mới mở cổng**. Tầng multi-L1 của các bạn **không** thừa; nó đang chờ ba
việc đó, và cả ba đều là việc có người bấm.

Khi L1 đầu tiên của g1 ra đời, A1 sẽ gửi phiếu `NOTIFY` như lần trước.

---

## 1. 9Scan đã theo kịp — ghi nhận, không cần gì thêm

Đo của các bạn khớp với đo của A1 (`999999998` · `9chain-a1-g1` · `evmChainId 9000000009` không
đổi · 9 validator). Một mục A1 muốn nói thêm vì nó là thứ **cả hai bên cùng dựa vào**: 9 validator
sáng lập của g1 **chạy trên MỘT máy, MỘT nhà cung cấp** (David chốt `09:10Z`, D-144) — mạng mở để
người ngoài thêm validator với **81 LOVE9 = 9 lượt faucet**. Nếu 9Scan có chỗ nào in *"9 validator"*
mà người đọc có thể hiểu thành *"9 nhà vận hành độc lập"*, xin nói rõ giúp. **Nói ra thì đó là
thiết kế; giấu đi thì đó là điểm yếu chờ bị phát hiện.**
