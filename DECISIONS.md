# DECISIONS — 9Chain-A1 (phần chain)

Quyết định tự chủ trong lúc autopilot chạy. Ghi cả **giả định** để David bác được sau.

---

## 2026-08-24 · Khởi động autopilot

### D-001 — Thứ tự mốc: git trước, tính năng sau
Backlog xếp M0 (git) trước mọi tính năng dù David hỏi "cần code những gì nữa".
**Lý do:** §5 của autopilot yêu cầu "git commit nhỏ" sau mỗi task — không có repo thì
không có lưới đỡ nào cho 6 mốc còn lại. Và lớp chủ quyền hiện là uncommitted working-tree
changes, một lệnh `git checkout .` là mất.
**Giả định:** David chấp nhận ~2–3h cho hạ tầng thay vì tính năng nhìn thấy được.

### D-002 — Lớp chủ quyền giữ ở nhánh trong `upstream/avalanchego`, KHÔNG copy ra ngoài
Ba lựa chọn: (a) nhánh trong repo upstream, (b) copy `9chain-a1-tools/` ra gốc dự án,
(c) submodule. Chọn **(a) + patch series backup**.
**Lý do:** Dockerfile `COPY upstream/avalanchego/ ./` rồi build tại chỗ — code phải nằm
đúng cây avalanchego để `go build ./9chain-a1-tools/...` chạy được. Copy ra ngoài là đẻ
hai bản đồng bộ tay. `patches/` chỉ là bản sao cứu hộ, không phải đường build chính.
**Đánh đổi:** phải quản 2 repo. Chấp nhận vì đường build không đổi.

### D-003 — `.gitattributes` đặt `* -text` cho cây fork
**Lý do:** KB (9chain, gotcha CRLF) — cây fork dùng chung giữa git Windows và git Linux
làm `git apply` fail **toàn bộ** file dù patch hợp lệ. Ở đây build chạy trong Docker (Linux)
còn git là Windows git, đúng cấu hình đã từng cháy.

### D-004 — Autopilot làm trực tiếp, không giao subagent cho việc chạm production
**Lý do:** M0–M3 đều SSH vào server đang chạy testnet công khai (5 validator, người ngoài
đang dùng). Giao subagent một phiên SSH có quyền restart node là mất khả năng quan sát
từng bước. Subagent chỉ dùng cho việc thuần code offline nếu có.

### D-006 — M2 (rolling restart) PHẢI LÀM — đã có số đo, không còn là suy đoán
Đo trên mạng công khai 2026-08-24 (`smoke-l1.mjs --de-chain`, chain `Smoke7M7Q3D`):

| | |
|---|---|
| C-Chain RPC chết | **6.0 giây** |
| lượt gọi hỏng trong lúc đẻ | **12/25 = 48%** |
| container sau đó | cả 5 đều `Up 25 seconds` — **cùng một con số** |

"Cùng một con số" là bằng chứng trực tiếp: `docker compose up -d` recreate cả 5
validator **đồng loạt**, không lần lượt. Không có node nào giữ mạng trong lúc đó.

**Vì sao 6 giây là nghiêm trọng, không phải chuyện nhỏ:** MetaMask poll RPC mỗi ~4s.
Cửa sổ 6s chắc chắn trúng ít nhất một nhịp poll của MỌI ví đang mở → hiện
"Unable to connect". Và theo gotcha đã trả giá trong HANDOFF, MetaMask **giữ nguyên
banner đó** cho tới khi người dùng tự đổi mạng qua lại. Nghĩa là một người lạ bấm nút
đẻ chain sẽ để lại banner lỗi dính trên ví của tất cả người khác.

Với self-serve (M4) thì đây là **chi phí O(số lượt bấm nút)** giáng lên toàn bộ
người dùng khác. Đó là lý do M2 chặn M4.

**Giả định:** 6s đo qua Cloudflare từ máy dev. Chưa tách được bao nhiêu là node
chết thật, bao nhiêu là Caddy/CF giữ kết nối cũ. M2.2 sẽ đo lại cùng cách để so
sánh táo-với-táo, nên chênh lệch mới là thứ có nghĩa, không phải con số tuyệt đối.

### D-007 — Smoke test để lại chain vĩnh viễn trong danh bạ công khai
`--de-chain` đẻ chain thật và **hiện chưa có endpoint thu hồi** (M4.4). Chain
`Smoke7M7Q3D` (9102) nay nằm vĩnh viễn trong danh bạ công khai.
**Quyết định:** chấp nhận, nhưng để `--de-chain` là **tuỳ chọn**, mặc định là chế độ
nhẹ chỉ-đọc. Test chạy thường xuyên phải không có tác dụng phụ; chỉ lượt nghiệm thu
có chủ đích mới đẻ chain. Chi phí mỗi lượt: 0.000141468 LOVE9 (ví chain-factory còn
~9 LOVE9 ≈ 63.600 lượt) — tiền không phải ràng buộc, **rác trong danh bạ mới là**.

### D-008 — Giữ rolling restart DÙ nó không giảm gián đoạn công khai
Số đo M2.2 nói thẳng: gián đoạn 6.0s → 6.5s, số lượt hỏng tuyệt đối 12 → 13,
đẻ chain 12.3s → 168.8s. Xét đúng mục tiêu đặt ra thì **M2.1 thất bại**.

**Vẫn giữ, vì nó mua thứ khác — an toàn, không phải tốc độ:**
- Đồng loạt = cả 5 validator xuống cùng lúc, consensus dừng hẳn. Lần lượt = luôn
  còn 4 node giữ mạng.
- "Hỏng thì dừng" đã tự chứng minh ngay lần chạy đầu: node-4 kẹt → dừng lại, node-1
  chưa bị đụng → **gián đoạn công khai = 0** (205 lượt, 0 hỏng). Bản đồng loạt
  trong cùng tình huống sẽ hạ cả 5 node rồi mới phát hiện có vấn đề.

**Giá phải trả có thật:** 168.8s cho một lượt đẻ chain là tệ cho self-serve (M4).
Người bấm nút chờ gần 3 phút. Chưa tối ưu — mỗi node tốn ~30s để P/X/C sạch lỗi.

**Cái sửa thật là M2.3**, không phải chỗ này: chừng nào RPC công khai còn là MỘT
node thì restart node đó còn nhìn thấy được. Caddy nhiều upstream mới đưa về 0.

### D-009 — 🔴 Trần 16 L1: trần CỨNG của mô hình hiện tại, phát hiện khi đọc source
Không phải suy đoán — hai chỗ trong code fork:
- `network/peer/peer.go:882` — lúc **bắt tay P2P**, peer khai >16 subnet thì node
  nhận ghi log `malformed message` rồi **`p.StartClose()` = cắt kết nối**.
- `message/outbound_msg_builder.go:266` — bên gửi **không cắt bớt**, gửi nguyên si
  mọi subnet đang track.

⇒ Node track quá 16 L1 bị **mọi peer ngắt kết nối ngay khi bắt tay**. Không phải
chậm đi, không phải cảnh báo — **mạng vỡ**. Và vỡ theo kiểu khó đoán nhất: node vẫn
chạy, log phía nó vẫn sạch, chỉ là không ai nói chuyện với nó nữa.

**Vì sao KHÔNG kiểm chứng bằng cách đẻ thử 17 chain:** làm vậy là cố tình phá mạng
công khai đang có người dùng, tốn ~40 phút và để lại 13 chain rác vĩnh viễn trong
danh bạ. Bằng chứng từ source ở đây là dứt khoát (`StartClose()`), đọc code LÀ cách
kiểm chứng đúng cho loại khẳng định này.

**Đã làm:** console từ chối lượt tạo thứ 16 trở đi (`A1_MAX_L1`, mặc định 15, trần
tuyệt đối 16), chặn ở **hai chỗ**: sớm trong `createChain` (trước khi tiêu tiền) và
ngay trước lúc đưa danh sách vào node (mọi đường gọi khác đều qua cửa này).
Hiện có 4/15.

**Điều này đổi bản chất một quyết định đang treo:** trần 16 là trần của **mô hình
"mọi validator track mọi L1"**, không phải trần của Avalanche. Vượt qua nó đòi tập
validator RIÊNG cho từng L1 — đúng thứ **ACP-77** sinh ra để giải quyết. Nên ACP-77
không còn là "việc tương lai chờ tokenomics"; nó là **thứ duy nhất mở được trần cho
sản phẩm multi-L1**. Xem BLOCKERS H-2.

### D-010 — Console tự ghim `A1_TRACK_SUBNETS` vào `net/.env`
`.env` cạnh compose có mục đích ghi rõ trong chính nó: *"BẤT KỲ ai chạy — tay hay
console bấm nút — đều tái lập đúng cấu hình đang chạy"*. Nhưng nó **không** ghim
biến quan trọng nhất. Ai gõ `docker compose up -d` bằng tay (sửa một node, nâng
image) sẽ đưa node đó về danh sách RỖNG → node **âm thầm thôi track mọi L1**. Chain
vẫn "sống" theo mọi dấu hiệu bề ngoài, chỉ mỏng đi một validator mà không ai biết.
Dự án đã dính đúng lớp lỗi này một lần với `--http-allowed-hosts`.

Console nay ghi vào `.env` **trước** khi restart (console chết giữa chừng thì người
vào dọn vẫn có danh sách đúng), qua file tạm rồi rename — `.env` hỏng là **mọi** lệnh
compose chết, kể cả lệnh để sửa lỗi.

### D-011 — Chọn `lb_policy first` chứ không phải round-robin
Hai upstream nhưng **không** chia tải: node-1 nhận hết, node-2 chỉ là lưới đỡ.
**Lý do:** giữ hành vi thường ngày không đổi — mọi request đi một đường, log dễ đọc,
và không đẻ ra lớp "lúc thì node này lúc thì node kia" khi truy lỗi. Chia tải là bài
toán khác (chưa có nhu cầu: p50 8ms). Đây là bài toán **sẵn sàng**.

### D-012 — Giữ nguyên phần gofmt lệch có sẵn trong netgen
`gofmt -l` liệt kê `netgen/main.go`. Kiểm bằng `git stash` → **đã lệch từ trước**
khi tôi sửa (khác phiên bản gofmt về thụt lề comment), phần tôi thêm thì sạch.
**Quyết định:** không chạy `gofmt -w`. Format lại cả file sẽ nhét nhiễu vào patch
chủ quyền — patch càng to càng dễ chết khi rebase lên upstream mới.

### D-005 — Verify gate = giao dịch thật, không phải "RPC trả lời"
Kế thừa luật đã trả giá trong HANDOFF: subnet có tập validator RỖNG vẫn trả `eth_chainId`,
vẫn đọc được số dư, MetaMask vẫn kết nối — chỉ là giao dịch **không bao giờ chốt**.
Mọi `[x]` liên quan L1 bắt buộc kèm hash giao dịch thật.
