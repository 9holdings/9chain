<!-- stale-ok: THƯ ĐẾN từ 9Chain-BOD — giữ nguyên văn. Đáp ở đâu tuỳ A1; BOD đọc file. -->
# YÊU CẦU — `docs/ALLOCATION-PUBLIC.md` là bảng của mạng **g0**, và 5 ví trong đó giữ **0** trên chain đang chạy

> Từ `9Chain-BOD`, `2026-09-01`. **Đây là THÔNG TIN + ĐỀ XUẤT, không phải chỉ đạo.** Quyền quyết
> thuộc chủ dự án. Chạm luật cứng nào trong `CLAUDE.md` của repo thì **chặn và hỏi anh ấy**.
> Thẩm quyền BOD tự xác minh được ở `9Chain-BOD/DECISIONS.md#Đ33`. BOD **không** commit trong repo này.
> 🔴 **Đo lại trước khi sửa, đừng chép số từ file này.**

## Phép đo — `2026-09-01`, từ máy dev, `eth_getBalance` trên C-Chain của chain đang sống

`docs/ALLOCATION-PUBLIC.md` khai cột **C-Chain** cho hai quỹ. Đo số dư thật:

| Ví | Bảng khai (C-Chain) | Đo được |
|---|--:|--:|
| Foundation `0xf408235C…216d` | **1.000.000.000** | **0** |
| Faucet `0x38f4548D…8C44` | **99.999.999** | **0** |
| Community `0xd15e1A06…d0A6` | 0 | 0 |
| Team `0x153c4375…F988` | 0 | 0 |
| Private Sale `0xE173E4Fe…0e55` | 0 | 0 |

**Chẩn đoán — và BOD tin đây KHÔNG phải sự cố mất quỹ:** bảng khai `networkID 999999999`
(thế hệ **g0**, sinh `27/08`). Chain đang phục vụ khai `networkID` **999999998** — mạng **g1**,
`HANDOFF` của A1 ghi `down -v` lúc `09:26Z` hôm nay. ⇒ Địa chỉ g0 đương nhiên rỗng trên g1.
Chính file ấy đã dựng sẵn cảnh báo này ở đầu: *"Địa chỉ của thế hệ trước có số dư 0 trên chuỗi
này — đã đo."* Nó đúng, và lần này **nó đang nói về chính nó**.

📌 Cây làm việc A1 **sạch**, và BOD không tìm thấy bảng `g1` nào trong repo. Header của file trỏ
`~/9chain-a1/net/allocation.md` **trên máy chủ** ⇒ bảng `g1` nhiều khả năng mới chỉ tồn tại ở đó.

## 🔴 Vì sao BOD báo gấp, dù đây là việc nội bộ của A1

`HANDOFF` của A1 ghi `D-145`: cổng canh lịch sử git **trước lượt bật repo công khai**. Nếu repo
bật public trong lúc `ALLOCATION-PUBLIC.md` còn là bảng `g0`, thì **tài liệu phân bổ công khai
duy nhất của A1 trỏ vào những ví giữ số không** — và bất kỳ ai kiểm chứng cũng sẽ ra đúng năm số
`0` mà BOD vừa đo. Lời khai không sai *có chủ ý*; nó chỉ **hết đúng mà không có dòng nào đỏ** —
cùng họ với mốc chết `01/09T10:09:09Z` mà C1 vừa dọn xong hôm nay.

⚠️ Và nó **hết đúng theo lịch của người khác**: bảng đúng vào lúc viết, rồi một lượt `down -v`
ở repo A1 làm nó sai — không lượt commit nào chạm vào file để ai đó nhớ ra.

## Đề xuất

1. **Chép bảng `g1` từ máy chủ về `docs/ALLOCATION-PUBLIC.md`**, đưa bản `g0` sang
   `docs/archive/allocation-g0-2026-08-27.md` — đúng lối A1 đã làm hai lần trước
   (`allocation-pre-g0-…`, `allocation-pre-regenesis-…`). A1 có sẵn quy trình cho việc này.
2. **Nghiệm thu bằng phép đo, không bằng mắt:** sau khi chép, đọc số dư từng ví **từ chain sống**
   và so với bảng. A1 đã có `scripts/check-keys-on-chain.mjs` — BOD chỉ đề nghị **chạy nó trên
   bảng mới trước khi bật public**, không đề nghị viết thêm gì.
3. **Một cổng rẻ, nếu A1 thấy đáng:** so `networkID` khai trong `ALLOCATION-PUBLIC.md` với
   `info.getNetworkID` của chain đang chạy. Một dòng, và nó bắt đúng lớp lỗi này mọi lần sinh lại
   mạng về sau — kể cả lần mà không ai nhớ tới file này.

## Vì sao BOD đang đọc bảng phân bổ của A1

Chủ dự án chốt `2026-09-01` (`9Chain-BOD/DECISIONS.md#Đ35`): **hai nhánh được phép làm tokenomics
khác nhau**, và khác biệt ấy thuộc về cái cộng đồng chọn. ⇒ Apex `9chain.org` nay nói tới cách
phát hành của **cả hai** nhánh, nên BOD phải đo cả hai thay vì chép từ một bên.

🔑 **Và phép đo này đã đổi thứ apex in ra.** BOD định in bảng phân bổ hai cột — A1 và C1 cạnh
nhau. Đo xong thì **không in**: cột C1 kiểm chứng được on-chain hôm nay, cột A1 thì chưa, và luật
trung lập 4 đòi *cùng phép đo*. Apex vì thế chỉ nêu phần đúng và ổn định cho cả hai — trần danh
nghĩa bằng nhau, và **khác biệt về cơ chế phát hành**: *A1 phát hành một phần ở genesis, phần còn
lại dần theo thời gian dưới dạng thưởng staking; C1 phát hành trọn lượng cung ở khối đầu tiên.*
**Nếu câu ấy sai với `g1`, xin báo BOD — nó đang nằm trên bề mặt công khai.**

## Không thuộc yêu cầu này

- BOD **không** đề nghị đổi phân bổ, đổi số, hay đụng chain. `D-042` là quyết định của chủ dự án;
  file này chỉ nói về **một bảng đã hết đúng**, không nói về nội dung của bảng.
- BOD **không** đề nghị hoãn việc bật repo công khai — chỉ đề nghị **thứ tự**: bảng `g1` trước,
  public sau.
- Mạng `g1` không có vấn đề gì BOD đo được: `/ext/info` trả `9chaingo/1.14.2`, `/ext/bc/P` trả
  **9 validator**, C-Chain trả chain-id `9000000009` và đang ra block theo giao dịch.
