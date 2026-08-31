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

## 2026-08-25 · Phiên tiếp theo

### D-013 — Thu hồi chain = bỏ track, KHÔNG phải xoá chain (M4.4)
Không có cách nào xoá một subnet/blockchain khỏi P-Chain — đã đẻ là vĩnh viễn.
Nên "thu hồi" chỉ có thể là: **gỡ subnet khỏi `--track-subnets` của mọi node** rồi
gỡ chain khỏi danh bạ. Sau đó không node nào phục vụ RPC của nó và chain đứng im.

**Vì sao thế là đủ:** thứ khan hiếm không phải subnet trên P-Chain, mà là **slot
track**. Đã xác minh ở source, không suy đoán: trần 16 áp lên đúng danh sách
`TrackedSubnets` gửi lúc bắt tay P2P (`network/peer/peer.go:882`), và Primary
Network bị loại trừ tường minh khỏi danh sách đó (`network/network.go:208`,
`errTrackingPrimaryNetwork`). Bỏ track thật sự trả lại chỗ, và 16 là 16 L1 chứ
không phải 15+Primary.

**Cái nó KHÔNG làm — và đây là chỗ dễ hiểu nhầm nhất:** thu hồi không rút node
khỏi tập validator của subnet trên P-Chain. Nên `platform.getCurrentValidators
({subnetID})` **vẫn trả đủ 5 validator cho một chain đã chết hẳn** — đúng phép đo
mà trang `/chains/` dựa vào để phân biệt sống/chết. Vì vậy chain đã thu hồi phải
được vẽ từ mảng `retired` với nhãn riêng, tuyệt đối **không** đem đo bằng heuristic
của chain sống: nó sẽ nói dối rất thuyết phục.

### D-014 — Chain đã thu hồi giữ chỗ `name` + `chainId` VĨNH VIỄN
Cấp lại chainId của một chain đã thu hồi cho chain mới là hố sụt y hệt lỗi đã chặn
ở D-của-`9100+đếm`: MetaMask coi hai chain cùng chainId là **một mạng**, và chữ ký
ký cho chain cũ **phát lại được** trên chain mới.
Khác biệt duy nhất — và nó làm mọi thứ tệ hơn: thu hồi **không xoá được mạng khỏi
ví người dùng**. Ai từng thêm chain cũ vào MetaMask thì mạng đó vẫn nằm đó, và
ngày chainId được cấp lại, ví của họ lặng lẽ trỏ vào một chain của người khác.
**Quyết định:** `createChain` kiểm trùng trên `chains ∪ retired`. Slot track được
trả lại; **con số nhận dạng thì không**.

### D-015 — Bộ nghiệm thu tự dọn chain nó đẻ ra (đảo ngược D-007)
D-007 chấp nhận `--de-chain` để lại chain vĩnh viễn vì "chưa có endpoint thu hồi".
M4.4 gỡ đúng điều kiện đó, và lý do phải gỡ mạnh hơn chuyện rác: với trần cứng 15,
một bài nghiệm thu ăn vĩnh viễn một chỗ mỗi lần chạy là **bộ kiểm thử tự đặt hạn
dùng cho chính nó** — khoảng chục lần cho cả đời dự án. Test không chạy lại được
thì không phải test, chỉ là một lần nghiệm thu thủ công có script.
`--de-chain` nay đẻ → kiểm → thu hồi, và **khẳng định số L1 trở về đúng mức ban
đầu**. `--giu` để tắt khi muốn giữ chain soi bằng tay.

### D-016 — Thu hồi đòi gõ lại đúng tên chain, không phải OK/Cancel
`POST /api/revoke` bắt buộc có `xacNhan` khớp chính xác `name`; nút trên console
cũng bắt gõ lại tên chứ không phải hộp thoại xác nhận. Nút thu hồi nằm cùng một
bảng với chain của người khác, cách nhau một dòng, và thao tác này gỡ chain khỏi
danh bạ công khai + ngừng phục vụ RPC **ngay**. Một hộp thoại chỉ cần bấm OK bảo
vệ đúng bằng không.

### D-017 — Build lại cho ra binary TRÙNG TỪNG BYTE với bản đang chạy công khai
M0.6 chỉ đòi `--version` in `9chaingo`. Kết quả thật mạnh hơn hẳn: dựng lại từ cây
đã commit cho ra binary có **cùng SHA256 với binary node-1 đang phục vụ RPC công khai**
(`40d5e8f6…7823f`), plugin `love9evm` cũng vậy (`f829711b…5e27`).

**Vì sao nó xảy ra:** cùng `golang:1.25.10-bookworm` ghim trong Dockerfile, cùng cây
nguồn, và `AVALANCHEGO_COMMIT` được truyền bằng ARG cố định (`9chain-a1-poc`) thay vì
`git rev-parse` — nên không có timestamp/commit hash trôi vào binary. Go build tái lập
được trong điều kiện đó. Việc ghim ARG vốn chỉ để né chuyện build context không có
`.git`; tác dụng phụ là biến build thành reproducible.

**Vì sao phải đo binary chứ không đọc log build:** log báo `#16 COPY --from=builder …
CACHED` — nhìn qua giống hệt "build giả, toàn cache", và tôi suýt kết luận M0.6 chưa
đạt. Thực tế #12/#13/#14 (build Go) đều chạy tươi 68s/89s/65s; `COPY` được cache CHÍNH
LÀ VÌ output trùng digest. Ba thứ khác nhau, phải đo đúng thứ cuối: **bước build có
chạy không ≠ layer có cache không ≠ binary có giống không**. Cùng họ với bẫy KB
"docker images không chứng minh được binary prod build bằng base nào".

**Nghĩa là gì:** đường khôi phục của dự án nay được chứng minh hai tầng — M0.5 khớp
tree hash (nguồn), D-017 khớp SHA256 (nhị phân). Không còn chỗ nào phải tin.

### D-018 — 6 test đỏ là GIÁ CỦA CHỦ QUYỀN, không phải nợ kỹ thuật — không sửa
Test các gói fork có chạm cho 6 lỗi. Câu hỏi đúng không phải "sửa thế nào" mà
"chúng đỏ vì đổi tên, hay vì logic sai?". Đã tách bạch bằng thí nghiệm chứ không
đoán: hoàn nguyên **đúng 4 chuỗi identity** (Client, token Name, token Symbol,
FallbackHRP), **giữ nguyên logic A1** → cả 4 gói xanh. Kết luận chắc chắn:

- 6 lỗi = 100% do đổi tên có chủ đích.
- Phần logic chủ quyền (`A1Params`, nhánh `A1NetworkID` trong `getStakingConfig`/
  `getTxFeeConfig`, `genesis_9chain_a1.go`) **không làm hỏng test nào**.

**Quyết định: KHÔNG sửa 6 test đó.** Sửa nghĩa là đi vá `version/application_test.go`
và `genesis/genesis_test.go` cho khớp tên mới — làm patch chủ quyền phình từ ~139 dòng
sang chạm cả file test upstream, tức là đúng thứ giết fork lúc rebase, đổi lấy một
màu xanh không nói thêm điều gì. Ta đã biết chính xác vì sao chúng đỏ.

**Điều PHẢI ghi lại vì nó là hệ quả thật, không phải chi tiết vụn:**
🔴 **Fork này không bao giờ sync được Avalanche Mainnet/Fuji nữa.** Đổi Name/Symbol
trong `FromConfig` làm đổi byte genesis của MỌI mạng, nên hash mainnet/fuji tính ra
khác hằng số upstream (`UUvXi6j7…` → `oXraYtvt…`). Với 9Chain đây là điều đúng đắn —
mạng chủ quyền không việc gì phải chạy được mainnet của người khác — nhưng nếu sau này
có ai định dùng binary `9chaingo` để chạy một node Avalanche thật thì nó sẽ hỏng, và
hỏng ở chỗ khó đoán (genesis mismatch lúc bootstrap).

**Cách đọc kết quả M8.2 ở lần rebase sau:** vẫn đúng 6 lỗi này = fork lành. **Nhiều hơn
6, hoặc đỏ ở gói khác = upstream vừa đụng vào thứ ta có sửa** — đó mới là tín hiệu.

### D-019 — Nền test: fork chịu trách nhiệm ĐÚNG 2 gói đỏ, không phải 7
`go test ./...` cho 7 gói đỏ. Con số đó **vô nghĩa nếu không có nền** — upstream vốn
đã đỏ sẵn vài chỗ, và không biết chỗ nào là của mình thì mỗi lần rebase sau này lại
phải điều tra lại từ đầu.

Đã quy trách nhiệm bằng thí nghiệm, không bằng suy luận "chắc không phải tại mình":
chạy riêng `x/blockdb` và `vms/saevm/sae` với identity **hoàn nguyên về upstream**
(giữ nguyên logic A1) → **vẫn đỏ y hệt** ⇒ nền upstream.
3 gói `tests/*` báo `Ran 0 of 18 Specs — A BeforeSuite node failed` ⇒ chúng cần mạng
thật, không phải unit test.

**Nền chốt lại — dùng cái này để đọc mọi lần chạy sau:**
```
220 xanh · 204 không có test · 7 đỏ
   ├─ 2 của FORK  : genesis, version   (100% do đổi tên, xem D-018)
   ├─ 2 của UPSTREAM: x/blockdb, vms/saevm/sae
   └─ 3 cần MẠNG  : tests/e2e, tests/fixture/bootstrapmonitor/e2e, tests/upgrade
```
**Lệch khỏi nền này = tín hiệu.** Đỏ ở gói thứ 8, hoặc `genesis`/`version` đỏ thêm
test mới ⇒ upstream vừa đụng vào vùng ta có sửa. Bằng nền ⇒ fork lành.

⚠️ `vms/saevm/sae` KHÔNG ổn định: đỏ sau 45.5s khi chạy cùng cả suite, nhưng **treo
tới hết timeout 600s** khi chạy riêng. Không phải do fork (đã kiểm), và đừng tốn thời
gian đuổi theo — chỉ cần biết nó vốn thế.

### D-020 — M4.1 (SIWE) sẽ DÙNG ethers, không tự viết secp256k1
Ghi chú cũ trong HANDOFF ("thư mục gốc trên server không có node_modules") đúng nhưng
thiếu một vế, và vế thiếu đổi hẳn cách làm: **`local-net/faucet/` CÓ `package.json` +
`node_modules` với ethers 6.17.0**. Đo được:

```
~/9chain-a1/src            : import ethers → ERR_MODULE_NOT_FOUND
~/9chain-a1/src/local-net/faucet : import ethers → OK 6.17.0
```

Đó là lý do `smoke-l1.mjs` (nằm trong `faucet/`) `import { ethers }` chạy ngon trên
server, trong khi `eip55.mjs` (dùng cho console) phải tự viết keccak-256.

**Quyết định:** M4.1 cấp cho `local-net/console/` một `package.json` + `node_modules`
riêng đúng theo khuôn `faucet/` đã có, rồi xác minh chữ ký bằng `ethers.verifyMessage`.

**Vì sao KHÔNG tự viết:** SIWE cần **khôi phục khoá công khai từ chữ ký** (secp256k1
ECDSA recovery) — không có trong `node:crypto`. Tự viết được, và dự án này đã tự viết
keccak-256 nên có tiền lệ. Nhưng keccak sai thì địa chỉ sai và **hỏng ầm ĩ**; recovery
sai thì **chấp nhận chữ ký giả và im lặng** — đó là cửa hậu, không phải lỗi. Tự viết
mã mật mã cho đường xác thực để né một thư mục `node_modules` là đánh đổi sai hướng.

**Đổi lại phải nhận:** console điều phối docker trên host, quyền cao hơn faucet, nên
thêm cây phụ thuộc vào đúng nó là tăng bề mặt supply-chain. Chấp nhận vì ethers vốn
đã nằm trên server rồi (faucet dùng), nên đây là rủi ro **biên**, không phải rủi ro mới.

### D-021 — Làm M4.1 trước M3, tuy PROGRESS xếp M3 đứng trước
Luật autopilot là không nhảy mốc. Lệch ở đây có lý do cụ thể: **"điều kiện qua" của M3
là M3.5 — "kiểm chứng từ một VPS NGOÀI thấy node 9Chain-A1 là peer thật"** — mà dự án
chỉ có đúng một VPS. Bắt đầu M3 là bắt đầu một mốc **không thể đóng** trong đêm nay.
Còn M4 thì M4.3/M4.4 đã xong, và M4 mới là điểm bán hàng của A1.

Chưa loại M3: máy dev chạy một node trong Docker rồi nối IPv6 tới server có thể thay
được vai "node ngoài". Chưa kiểm, ghi lại để lần tới thử trước khi kết luận M3 kẹt.

### D-022 — Hạn mức HAI TẦNG, ranh giới là chỗ xác thực
Bài nghiệm thu end-to-end phơi ra một lỗ hổng mà unit test không thể thấy: hạn mức
nghiêm ngặt (3 lượt/giờ/IP) đặt **trước** lúc xác thực, nên một request **không có
token** cũng tiêu quota. Ai gửi 3 request rác là khoá được người dùng thật cùng IP
suốt một giờ — hạn mức thành vũ khí thay vì lớp bảo vệ.

Phát hiện tình cờ: bài kiểm gọi nhiều lượt thu hồi *bị từ chối* để kiểm cổng quyền,
rồi **tự khoá chính mình** ở 429. Dễ chữa bằng cách sửa bài kiểm cho êm; nhưng bài
kiểm chỉ đang mô phỏng đúng thứ một kẻ tấn công sẽ làm.

**Quyết định:** tách hai tầng —
```
cửa ngoài (trước xác thực): 60 lượt/giờ/IP  — chỉ để chặn lụt request
cửa trong (sau xác thực)  : 3 lượt/giờ/IP   — ngân sách thật cho thao tác nặng
```
Hôm nay console chỉ nghe loopback nên chưa khai thác được; M4.5 định mở ra Internet
thì nó là lỗ hổng thật. Hạn mức nay đọc được từ env (`A1_LIMIT_CREATE`,
`A1_LIMIT_REVOKE`) để chỉnh được mà không phải sửa mã — và để bài kiểm đo đúng ranh giới.

Chưa phải lời giải cuối: khoá vẫn là IP. Hạn mức theo **địa chỉ ví** là M4.2.

### D-023 — Bài nghiệm thu chạy console THẬT phải bị chặn cứng khỏi mạng thật
`auth-e2e-test.mjs` dựng một console thật, và console đó đọc đúng
`console-chains.json` thật — trên server thì đó là danh bạ của testnet công khai.
Mọi lượt thu hồi trong bài **được thiết kế** để bị từ chối, nhưng "được thiết kế"
không phải bảo đảm: một lỗ trong logic quyền sẽ làm bài kiểm restart lần lượt cả 5
validator của mạng đang chạy — bài kiểm trở thành sự cố.

**Quyết định:** tiến trình console của bài kiểm luôn chạy với
`A1_COMPOSE_FILE=/khong-ton-tai/...`. Lệnh docker nào lọt qua cũng chết vì thiếu file
thay vì đụng mạng thật. Rẻ, và biến "chắc là không xảy ra" thành "không thể xảy ra".

### D-024 — Bài nghiệm thu không được cắm cứng dữ liệu của một máy
Bản đầu của `auth-e2e-test.mjs` cắm cứng tên chain `DeltaChain` — chỉ có trong config
máy dev. Trên server nó trượt 3 bài với lý do "không có L1 nào tên DeltaChain", tức là
**báo hỏng ở chỗ code hoàn toàn đúng**. Đó là kiểu sai tệ hơn cả không có test: nó dạy
người đọc bỏ qua màu đỏ.

Sửa: lấy tên chain **từ danh bạ đang chạy** qua `/api/chains`; danh bạ rỗng thì in
`⏭️ bỏ qua` và **không tính là đạt**. Nay chạy giống hệt nhau ở cả hai nơi (33/33),
nên `console-deploy.sh` mới dùng được nó làm cổng chặn — mà deploy chính là chỗ cần nó nhất.

### D-025 — Bẫy gas ở giao dịch ĐẦU TIÊN của chain mới (tìm ra khi làm M5.3)
`eth_estimateGas` **ước lượng thiếu** cho giao dịch đầu tiên của một L1 vừa đẻ. Đo có
đối chứng trên **cùng một chain** (`Ptuintien3C7B`, chainId 9109):

| | estimateGas | gasUsed | kết quả |
|---|---|---|---|
| block 1 (giao dịch đầu tiên) | 52037 | 52037 (cạn sạch) | ❌ revert, `status 0` |
| block 2 trở đi | 54183 | 53388 | ✅ `status 1`, ví nhận đúng 777 token |

Cùng calldata, cùng người gửi, cùng precompile. **Ba chain khác nhau** đều hỏng y hệt
ở block 1 với đúng con số 52037.

**Vì sao nó nguy hiểm hơn một lỗi gas thường:** nó **giả dạng "tính năng không tồn
tại"**. Receipt chỉ có `status: 0` — lỗi của precompile là lỗi Go, không lọt vào
receipt dưới dạng đọc được. Tôi đã đi đúng con đường sai: kiểm lại tên khoá genesis,
kiểm registry precompile, kiểm chữ ký ABI — tất cả đều đúng, và mỗi vòng thử mất 5,5
phút vì phải đẻ lại chain.

**Ba phép đo tách được nguyên nhân — nay đã nằm sẵn trong bài kiểm:**
1. `eth_call` cùng lời gọi đó. eth_call chạy với trần gas rất lớn nên nó **thành
   công** trong khi tx thật revert. **"eth_call OK + tx revert" = vấn đề GAS**, không
   phải vấn đề cấu hình. Đây là tín hiệu đã chỉ thẳng ra đáp án.
2. Đọc `readAllowList` từ chính precompile: `0x` rỗng = precompile TẮT · `0` = bật
   nhưng không quyền · `2` = Admin. Tách ba trạng thái nhìn bề ngoài giống hệt nhau.
3. Gửi lại với `gasLimit` tường minh.

**Quyết định:** mọi giao dịch trong `preset-test.mjs` đặt `gasLimit` tường minh, kèm
cờ `--rpc/--wallet-key` để chạy lại bài kiểm trên chain đã có — vòng gỡ lỗi từ 5,5 phút
xuống vài giây. Vòng lặp chậm là thứ đẩy người ta sang đoán mò thay vì đo.

⚠️ **Ảnh hưởng người dùng thật, chưa xử lý:** ai vừa đẻ chain rồi gọi precompile lần
đầu sẽ thấy "tính năng hỏng". Cần ghi vào tài liệu hướng dẫn cho người đẻ chain
(và cân nhắc để console tự gửi một giao dịch mồi sau khi đẻ xong).

### D-026 — "Phí bằng 0" là thứ subnet-evm KHÔNG cho phép; preset phải nói thật
Preset `khong-phi` ban đầu đặt `minBaseFee = 0` và bài kiểm gửi giao dịch giá gas 0.
Kết quả đo trên chain `PkhongphiE1LM` (chainId 9110): **baseFee = 0 đúng như khai**,
nhưng giao dịch giá gas 0 **không bao giờ vào block** — node nhận nó rồi để đó,
không lỗi, không từ chối. Đúng kiểu hỏng im lặng mà cả mốc M5 sinh ra để chặn.

Nguyên nhân ở source: `core/txpool/legacypool/legacypool.go:158` có `PriceLimit`
(sàn giá gas để được nhận vào mempool), mặc định 1, và **dòng 195 tự ép về 1 nếu
cấu hình thấp hơn**. Nên phí đúng bằng 0 không phải "chưa cấu hình được" mà là
**không cấu hình được**.

**Quyết định: đổi tên và mô tả preset cho đúng sự thật**, không đổi kỳ vọng của bài
kiểm để nó xanh. "Không phí gas" → **"Phí gần như bằng 0"**: baseFee = 0, giao dịch
trả sàn 1 wei/gas ⇒ một lượt chuyển tiền tốn ~0,000000000000021 LOVE9.

Cách khác — bỏ preset — là phản ứng quá tay: chênh lệch với chain chuẩn vẫn là **năm
bậc độ lớn** (21.000 wei so với 525.000 gwei), tức giá trị thật cho game và chain nội
bộ vẫn còn nguyên. Cái sai là **lời hứa**, không phải tính năng.

Bài kiểm nay gửi giá gas 1 wei và đòi phí thực trả < 1 gwei — ngưỡng cách con số của
chain chuẩn năm bậc độ lớn nên phép so không mơ hồ.

### D-027 — Token vận hành KHÔNG chịu ngân sách nghiêm ngặt (chỉ chịu cửa chống lụt)
Bộ nghiệm thu M5.3 chạy 4 preset × 1 chain và **tự khoá mình ở lượt thứ tư**: hạn mức
3 lượt tạo/giờ tính cả người vận hành, nên 3/4 preset không bao giờ được nghiệm thu.

Siết người vận hành là bảo vệ hình thức: họ có shell trên chính máy đó. Nhưng nó chặn
thật ở đúng lúc cần nhất — lúc chạy kiểm thử, lúc dọn sự cố.

**Quyết định:** ngân sách nghiêm ngặt (3/giờ) chỉ áp cho **ví**; token vận hành chỉ
chịu **cửa ngoài chống lụt** (60/giờ). Vòng lặp chạy loạn vẫn bị chặn ở 60, và trần
15 L1 chặn nốt phần còn lại. Bài kiểm nay khẳng định CẢ HAI chiều: ví bị siết đúng
suất của mình, người vận hành thì không (auth-e2e 38/38).

### D-028 — B-3 gỡ: `minBaseFee = 0` làm chain KHÔNG DỰNG NỔI BLOCK NÀO (không phải chuyện mempool)
**Đây là bản đính chính cho D-026.** D-026 đúng kết luận ("phí bằng 0 không cấu hình
được") nhưng **sai cơ chế**, và vì sai cơ chế nên bản vá của nó không đủ: preset
`khong-phi` giữ nguyên `minBaseFee: 0`, chỉ đổi giá gas của bài kiểm từ 0 lên 1 wei.
Đo lại trên chain `PkhongphiSQSW` (9111): vẫn hỏng y hệt. Đó là B-3.

**Cơ chế thật, đọc từ source chứ không đoán** — bẫy nằm ở hai file mâu thuẫn nhau:

| tầng | file | phán quyết về `minBaseFee = 0` |
|---|---|---|
| validate cấu hình | `commontype/fee_config.go` `Verify()` | **HỢP LỆ** — chỉ từ chối số âm (`errMinBaseFeeNegative`) |
| dựng block, lúc chạy | `customheader/block_gas_cost.go:94` `VerifyBlockFee()` | **TỪ CHỐI** — `baseFee.Sign() <= 0` ⇒ `errInvalidBaseFee` |

Ba mắt xích khoá lại thành chuỗi kín:
1. `dynamic_fee_windower.go:32` trả thẳng `MinBaseFee` làm baseFee của block đầu;
   dòng 109 kẹp sàn `selectBigWithinBounds(MinBaseFee, …)` cho mọi block sau
   ⇒ khai 0 thì baseFee **chắc chắn** là 0, không phải "có thể".
2. `consensus/dummy/consensus.go:299` gọi `VerifyBlockFee` từ trong
   **`FinalizeAndAssemble`** — đường **dựng** block của chính node mình, không phải
   chỉ đường kiểm block của người khác.
3. Cái chốt `if requiredBlockGasCost.Sign() == 0 { return nil }` nằm ở dòng **101**,
   tức **SAU** cái chốt baseFee ở dòng 94. Nên zero hoá `blockGasCost` — đúng giả
   thuyết ghi trong B-3 — **không cứu được gì**. Giả thuyết đó sai.

⇒ Chain khai `minBaseFee: 0` không phải "chain có giao dịch bị kẹt ngoài mempool".
Nó là **chain không đẻ được block nào, kể từ block 1**.

**Vì sao mất cả một mốc vào đây:** mọi dấu hiệu đều nói chain khoẻ. Node lên sạch,
`eth_chainId` đúng, `eth_getBalance` trả đúng phần genesis, `baseFeePerGas` trả đúng
0 y như đã khai. Chỉ có giao dịch là không bao giờ chốt — cùng một biểu hiện với
"subnet chưa có validator", nên nó dẫn người đi chẩn đoán nhầm hẳn sang hướng khác.

**Bản vá (đã áp):** `minBaseFee: 1` — 1 wei, số nhỏ nhất còn giữ `Sign() > 0`.
**Đó là toàn bộ bản vá.** Kèm theo `minBlockGasCost/maxBlockGasCost/blockGasCostStep
= 0`, nhưng phải nói rõ: **ba dòng đó không sửa gì cả trên mạng này.**

🔴 **Tự đính chính, đo sau khi đã viết bản đầu của D-028 này.** Bản đầu nói zero hoá
`blockGasCost` là "điều kiện cần thêm". SAI — chúng đã bằng 0 sẵn:
`customheader/block_gas_cost.go:41` trả thẳng 0 nếu `IsGranite`, mà networkID 9001
không phải Mainnet/Fuji nên `upgrade.GetConfig` rơi vào `Default`, ở đó
`GraniteTime = InitiallyActiveTime` (2020-12-05) ⇒ **Granite bật từ genesis** ⇒
`requiredBlockGasCost` luôn 0 với mọi L1 của ta. Giữ ba dòng đó lại làm **đai an
toàn** cho trường hợp Granite không còn hoạt động, không phải làm bản vá.

Ghi cái tự đính chính này ra thay vì lặng lẽ sửa, vì B-3 tồn tại **chính vì** D-026
kết luận đúng mà cơ chế sai — một câu chuyện nhân quả sai đọc vẫn xuôi tai, và lần
sau người ta chữa đúng theo cái sai đó.

Đổi lại chain này mất cơ chế chống đẻ-block-quá-nhanh (nếu Granite tắt). Chấp nhận:
đúng chủ ý preset, và `moTa` đã nói "gần như không có chi phí nào cản spam".

**Bài kiểm đòi baseFee ĐÚNG BẰNG 1, không đòi "≤ 1"** — cố ý. Nếu sau này có người
sửa về 0 vì thấy "0 mới đúng nghĩa không phí", bài phải đỏ ngay ở dòng đầu thay vì
để nó biểu hiện thành một chain câm mất thêm một mốc nữa để chẩn đoán.

**Bài học tổng quát, đắt hơn bản vá:** trong subnet-evm, **`Verify()` của config
KHÔNG phải hợp đồng về tính chạy được**. Nó kiểm hình dạng, không kiểm hệ quả. Với
genesis — thứ bất biến — khoảng cách giữa "cấu hình hợp lệ" và "chain sống được" là
chỗ để lọt những chain chết vĩnh viễn ngay lúc sinh ra.

### D-029 — Ba lỗi B-4 là của BÀI KIỂM, và cả ba đều là "đọc quá sớm"
Gom chung vì cùng một họ, không phải trùng hợp.

1. **`tu-in-tien` đọc số dư ngay sau `tx.wait(1)`** ra `0.0` trong khi mint `status 1`.
   `wait(1)` chỉ hứa receipt đã có, không hứa lượt `eth_getBalance` kế tiếp đọc trạng
   thái sau block đó. Vá: `doiSoDu()` đọc lại tối đa 10 nhịp, và **in ra thấy sau bao
   nhiêu nhịp** — số đó là dữ liệu, không phải chi tiết thừa.
2. **`chi-chu-deploy` / `kin` ăn `nonce has already been used`.** Hai kiểu chặn để
   lại nonce ở hai trạng thái khác nhau: `txAllowList` chặn lúc nộp (nonce **không**
   tiêu), `deployerAllowList` cho vào block rồi revert (nonce **đã** tiêu). Đoán sai
   một trong hai đường là bài đỏ ở chỗ sản phẩm hoàn toàn đúng. Vá: `guiVoiNonce()`
   đọc nonce tươi mỗi lượt, thử lại **chỉ khi** lỗi đúng là lỗi nonce — mọi lỗi khác
   ném thẳng, vì `phaiChan` cần nhìn thấy lý do từ chối thật để phân biệt "bị chặn"
   với "hết tiền".

Cả ba đều làm bài kiểm **nói dối theo hướng nguy hiểm hơn**: báo đỏ ở tính năng đang
chạy đúng. Một bài kiểm hay báo đỏ giả thì người ta bắt đầu bỏ qua nó, và lúc đó nó
mất sạch giá trị.

### D-030 — M5.4: console KHÔNG tự gửi "giao dịch mồi"; nó nói thật và chỉ cách rẻ nhất
Bẫy: `eth_estimateGas` ước lượng thiếu cho giao dịch ĐẦU TIÊN của chain vừa đẻ, và
receipt chỉ trả `status 0` không kèm lý do ⇒ **giả dạng "tính năng không được bật"**
(D-025). Người vừa chọn kiểu chain "tự in tiền" rồi gọi mint lần đầu sẽ kết luận
preset hỏng. Chính tôi đã kết luận nhầm đúng như vậy khi làm M5.3.

PROGRESS nêu hai hướng và để ngỏ. Chọn được sau khi trả lời một câu hỏi mà hướng
thứ nhất giấu bên trong: **server lấy tiền ở đâu để gửi giao dịch mồi?**

`createChain` cấp phát genesis cho **đúng một địa chỉ**: `admin`, tức ví của người
bấm nút — và server không giữ khoá đó. Muốn server gửi được một giao dịch trên chain
mới thì genesis phải cấp phát thêm cho một địa chỉ do Foundation giữ. Genesis là
**bất biến**, nên đó không phải "một tài khoản tạm": mọi chain người dùng đẻ ra sẽ
mang sẵn một tài khoản của chúng tôi **vĩnh viễn**, không gỡ được.

Đó chính là thứ `OwnerTest` đã đo để chứng minh điều ngược lại (quỹ Foundation: số dư
**0**, vai **None**). Đánh đổi một tính chất về **quyền sở hữu** — thứ khó xây, dễ mất,
và là lý do tồn tại của cả M4 — để lấy sự tiện lợi cho một lượt giao dịch, là cái giá
sai. **Loại hướng "server tự gửi giao dịch mồi".**

(Biến thể "cấp dust cho một khoá công khai ai cũng biết" cũng loại: nó chỉ đổi
"tài khoản của Foundation" thành "tài khoản không ai sở hữu nhưng có tiền" nằm vĩnh
viễn trong genesis — trông y hệt một cửa hậu, và là hố cho ai lỡ gửi tiền vào.)

**Đã làm:** `LUU_Y_GIAO_DICH_DAU` trong `console/server.mjs`, trả kèm trong đáp án
của `POST /api/create`, console vẽ nó ngay dưới kết quả đẻ chain. Nội dung: đừng tin
ước lượng gas cho giao dịch đầu, và **cách rẻ nhất để mở block 1 là một giao dịch
chuyển tiền thường** — 21000 gas là hằng số của EVM, **không cần ước lượng nên không
dính bẫy**. Sau block 1 ước lượng chuẩn trở lại.

Chữ nằm ở **một chỗ duy nhất** (server) và giao diện chỉ vẽ lại — cùng lý do danh
sách preset do server cấp: hai bản chép tay sẽ trôi lệch, và bản sai là bản người
dùng đọc.

Đáng ghi: `probe-l1.mjs` — công cụ ta vẫn bảo người dùng chạy để kiểm chứng chain —
vốn đã gửi đúng một giao dịch chuyển tiền thường. Nên ai làm theo hướng dẫn thì đã
vô tình thoát bẫy; **chỉ người đi thẳng vào precompile mới dính**. Đó là lý do bẫy
này sống sót qua nhiều lượt nghiệm thu xanh.

`luuY` **không** ghi vào `console-chains.json`: nó là lời dặn cho người vừa đẻ chain
và hết giá trị ngay khi chain có block đầu. Ghi vào danh bạ là để một cảnh báo nhất
thời sống vĩnh viễn cạnh dữ liệu chain.

### D-031 — M6.1: Warp bật cho MỌI chain (khuôn genesis), không làm preset
ICM đòi **cả hai đầu** có Warp. Để nó thành một lựa chọn trong danh sách preset là đẻ
ra những cặp chain không bao giờ nói chuyện được với nhau — và genesis **bất biến**,
nên "bật sau" không tồn tại: người dùng chọn nhầm một lần là mất khả năng đó vĩnh
viễn, mà lúc chọn họ chưa biết sau này sẽ cần. Warp không tốn gì khi không dùng.

⇒ `warpConfig` vào thẳng `9chain-a1-config/l1-evm-genesis.json`, mọi chain đều có.

**Con số 1607144400 — chỗ dễ mất hàng giờ nhất:**
`warp.Config.Verify()` (`precompile/contracts/warp/config.go:93`) từ chối nếu Warp
bật **trước Durango**. Phản xạ tự nhiên là đặt `blockTimestamp: 0` — mọi precompile
khác trong `presets.mjs` (`nativeMinter`, `deployerAllowList`, `txAllowList`) đều
dùng 0 và chạy tốt. Nhưng phép kiểm của Warp là `IsDurango(c.Timestamp())`, tức so
**mốc bật Warp** với **mốc Durango của mạng**, không phải với genesis. Mốc Durango
của 9Chain-A1 là **1607144400** (2020-12-05): networkID 9001 không phải Mainnet/Fuji
⇒ `upgrade.GetConfig` trả `Default` ⇒ `DurangoTime = InitiallyActiveTime`.
`IsDurango(0)` là **false** ⇒ `blockTimestamp: 0` làm chain không đẻ nổi.

Đặt đúng 1607144400 thì Warp sống từ block thật đầu tiên (mọi block đều có thời gian
sau 2020) mà vẫn qua được phép kiểm.

`quorumNumerator: 67` là mặc định của subnet-evm (`WarpDefaultQuorumNumerator`); hợp
lệ là 0 (=dùng mặc định) hoặc 33…100. Với 5 validator, 67% ⇒ cần **4/5 chữ ký**.
`requirePrimaryNetworkSigners: false` — hai L1 của ta dùng chung tập validator của
chính subnet, không cần chữ ký của Primary Network.

**Điều này KHÔNG đóng M6.** Nó mới là bật công tắc. M6.2 ("chuyển tài sản giữa 2 L1")
còn hai thứ chưa quyết, ghi ở PROGRESS: dùng **Warp thô** (gửi message, đầu kia
`getVerifiedWarpMessage`) hay dựng hẳn **Teleporter/ICTT**; và nó cần **2 slot L1
cùng lúc** trong trần 15 chứ không thu hồi được giữa chừng như bài preset.

### D-032 — Siết 443 về Cloudflare bằng **Caddy**, không bằng ufw (và vì sao vẫn đủ)
**Bối cảnh:** chuẩn bị mở console ra công khai (M4.5), phát hiện `A1_TRUST_PROXY=1`
của **faucet** đang bị khai thác được. Đo thật, không suy:

```
curl -k --resolve testnet-a1.9chain.org:443:139.99.145.13 \
     -H 'CF-Connecting-IP: 1.2.3.4' .../faucet/whoami
→ {"ip":"1.2.3.4","trustProxy":true}
```

Faucet **tin đúng cái IP bịa** ⇒ hạn mức faucet công khai vượt qua được bằng cách
xoay IP giả. Đây là lỗ **đang mở trên sản phẩm đang chạy**, không phải rủi ro tương
lai của console. Gốc của nó: Cloudflare ghi đè `CF-Connecting-IP` ở biên nên đi qua
Cloudflare thì không giả được — nhưng **không đi qua Cloudflare thì không ai ghi đè
cả**. Niềm tin ấy chỉ đúng nếu origin từ chối mọi kết nối không từ Cloudflare.

**Chọn tầng Caddy (`remote_ip`), không phải ufw.** M7.2 vốn đặt tên là
`ufw-cloudflare-only.sh`, nhưng ba lý do đẩy sang Caddy:
1. **Gỡ lại được trong vài giây** — xoá hai dòng `import chi_cloudflare` rồi
   `caddy reload` (zero-downtime). Sai một dải IP trong ufw thì cách chữa là sửa
   tường lửa của một máy đang phục vụ công khai, dưới áp lực.
2. **Có cổng kiểm trước khi áp**: `caddy validate` chạy trong container ở máy dev đã
   nói "Valid configuration" **trước khi** file chạm tới server.
3. Cùng một kết quả cho đúng mối nguy đang chữa: header giả không còn được tin.

**ufw KHÔNG làm, và ghi ra để lần sau khỏi cân nhắc lại:** nó chỉ thêm được hai thứ
— tiết kiệm chi phí bắt tay TLS với máy quét, và giấu origin ở tầng mạng (máy quét
thấy cổng đóng thay vì 403). Cả hai đều nhỏ so với rủi ro tự chặn nhầm mình. Đáng làm
**cùng lúc** với một cửa sổ bảo trì có người trực, không phải làm thêm lúc này.
(Đáng lưu: Caddy chạy `network_mode: host` nên ufw **sẽ** có tác dụng với 443 — khác
hẳn cổng do Docker publish, thứ đi vòng qua ufw. Nên khi làm thì nó chạy thật.)

**Cái bẫy mà bản vá này tự sinh ra, và cách đã bịt:** Cloudflare thỉnh thoảng thêm
dải IP. Dải mới mà Caddyfile chưa có ⇒ người đi qua dải đó ăn 403, và triệu chứng là
**"một số người vào được, một số không"** — gần như không thể đoán ra nếu không nghi
đúng chỗ. Nên `check-ports.sh` có thêm **tầng 5**: tải danh sách chính chủ về và chỉ
đích danh dải nào bị bỏ sót. Kèm **tầng 4** tách bạch hai chuyện khác nhau mà dễ lẫn:
*cổng 443 có mở không* (vẫn mở, TCP vẫn bắt tay) ≠ *origin có phục vụ nội dung cho
người ngoài Cloudflare không* (phải là 403). Không tách thì bản vá trông như vô hiệu.

**Đo trước/sau, cùng một cách:**

| phép thử | trước | sau |
|---|---|---|
| nối thẳng vào origin — `testnet-a1` | 200 | **403** |
| nối thẳng vào origin — `rpc-testnet-a1` | 404 (tới được Caddy) | **403** |
| giả `CF-Connecting-IP` khi nối thẳng | **tin IP bịa** | **403** |
| qua Cloudflare: trang chủ · faucet · chains · RPC | 200 | **200** |
| `/faucet/whoami` qua Cloudflare | — | IP **thật** của người dùng |

### D-033 — M9.4 đo xong: nâng `gasLimit` KHÔNG nâng thông lượng. Đính chính M9.3.
**M9.3 kết luận:** *"trần TPS là THAM SỐ GENESIS, không phải giới hạn phần cứng"* —
dựa trên phép chia `gasLimit 12M ÷ 21.000 ÷ 2s = 285 TPS lý thuyết`, đo được 252–264,
tức 90% trần, trong khi máy chỉ ở load ~36%.

**M9.4 kiểm giả thuyết đó bằng cách nâng `gasLimit` lên 5 lần (60M). Nó SAI.**

| chain | trần genesis lý thuyết | TPS đo được | block đầy |
|---|---|---|---|
| `chuan` 12M (M9.3) | 285 | 252–264 | ~gần đủ |
| `thong-luong-cao` 60M | **1.428** | **207–230** | **~16%** |

Nâng trần genesis 5 lần mà thông lượng **không tăng — thậm chí thấp hơn**. Và block
chỉ chứa ~455 giao dịch trên 2.857 chỗ ⇒ **gasLimit không phải thứ đang chặn**.

**Đã loại trừ ba nghi phạm, mỗi cái bằng một đối chứng — và HAI trong ba là giả
thuyết của tôi, cả hai đều sai:**

| nghi phạm | đối chứng | kết quả |
|---|---|---|
| đường truyền (Cloudflare) | bơm qua URL công khai **vs** thẳng vào `127.0.0.1:9650` | 229,6 vs 226,3 TPS — **như nhau**, giả thuyết SAI |
| gộp lô của ethers | `batchMaxCount` mặc định **vs** `1` | 226,3 vs 224,6 TPS — **như nhau**, giả thuyết SAI |
| thiếu người gửi | 20 → 60 → 150 → 300 → 600 ví | 155 → 205 → 223 → 226 → **207** (giảm) |

**Nút thắt nằm ở đường NẠP GIAO DỊCH CỦA NODE, khoảng ~230 tx/s.** Chuỗi suy luận
dựa trên hai dấu hiệu đi cùng nhau:
- **Nhịp block đứng đúng 2,0s ở MỌI mức tải** ⇒ khâu *dựng block* không hề đuối.
- **Block không bao giờ đầy** ⇒ lúc dựng block, mempool đơn giản là **không có** thêm
  giao dịch để lấy.
⇒ Chỗ nghẽn nằm TRƯỚC mempool: nhận request, phục hồi chữ ký, validate, chèn mempool.

**Bằng chứng mạnh nhất, và cũng là phát hiện vận hành đắt nhất:** tăng tải không
chuyển thành thông lượng mà chuyển thành **độ trễ cho người dùng thật**. p50 của
C-Chain **công khai** theo mức tải: **22ms → 236ms → 1.720ms → 3.852ms**. Đây là dấu
vân tay kinh điển của một máy chủ đã bão hoà. Nó cũng xác nhận cảnh báo M9.1 (*L1
không cô lập được CPU — L1 và C-Chain chạy trong cùng 5 tiến trình node*) không phải
lý thuyết.

**Hai thay đổi theo sau, đã áp:**
1. **Hoàn nguyên `batchMaxCount: 1`.** Nó không tăng TPS mà làm p50 công khai từ
   236ms lên **1.720ms** ở cùng 300 ví — đổi trải nghiệm người ngoài lấy con số
   không nhúc nhích.
2. **Hạ `NGUONG_CHAM_MS` 4000 → 1500.** Ở bậc 600 ví, người dùng thật chờ **3,85
   giây/lời gọi** mà chốt an toàn **không nổ**, vì 3.852 < 4.000. Chú thích của chính
   ngưỡng đó nói "người dùng đã thấy lag là cái giá không nên trả" — nhưng nó được
   đặt cao tới mức không bao giờ bắt được điều nó mô tả.

**Hệ quả cho sản phẩm:** preset `thong-luong-cao` **không** làm chain nhanh hơn ở
mức tải hôm nay. Nó chỉ mở trần cho tương lai. `moTa` của preset vì vậy phải giữ
đúng lời hứa hiện tại — *"gấp 5 lần số giao dịch mỗi block"* (đúng theo định nghĩa),
**không** hứa gấp 5 lần TPS. Muốn TPS thật cao hơn thì phải làm ở phía node/máy chủ,
không phải ở genesis — và đó là việc chưa ai đo tới đáy.

---

### D-034 — M6.2: chứng minh Warp bằng **cầu khoá/trả tự viết**, KHÔNG dựng ICTT

**Câu hỏi treo từ phiên trước:** chứng minh M6.2 bằng *Warp thô* (gửi → gom chữ ký →
đầu kia xác minh) hay dựng hẳn *Teleporter/ICTT*? Warp thô đủ chứng minh **cơ chế**,
nhưng M6.2 nói "chuyển **tài sản**", mà tài sản thì cần một hợp đồng ở cả hai đầu.

**Đã chọn: cả hai bước, nhưng bằng hợp đồng của mình — không dựng ICTT.**
- Bước 1 `warp-test.mjs` — message qua được và **được xác minh** ở đầu kia.
- Bước 2 `bridge-test.mjs` — token gốc rời chain nguồn và xuất hiện ở chain đích, đo
  bằng **bốn số dư** chứ không bằng "hàm không revert".

**Vì sao KHÔNG ICTT.** ICTT là hệ hợp đồng nhiều lớp cộng một **relayer chạy liên
tục** — tức thêm một tiến trình phải sống mãi, phải có khoá trả phí gas ở mọi chain
đích, phải giám sát. Đó là một dịch vụ vận hành mới trên một hạ tầng đang có **một
máy, một nhà cung cấp** và chưa có validator thứ sáu. Mốc này hỏi *"Warp có thật sự
chuyển được tài sản giữa hai L1 do người dùng đẻ ra không"*; câu hỏi đó trả lời được
trọn vẹn mà không cần thứ nào phải sống mãi — bài kiểm tự đóng vai relayer trong
đúng một lượt chạy rồi thu hồi cả hai chain.

**Điều này KHÔNG có nghĩa "ICTT không cần".** Cầu sản xuất thì cần: nó có chuẩn hoá
token, xử lý decimal, đường nâng cấp, và quan trọng nhất là relayer để người dùng
không phải tự gom chữ ký. `CauTaiSan.sol` cố ý **thiếu** quản trị, tạm dừng khẩn
cấp, hạn mức, phí và đường rút thanh khoản — nó là bản chứng minh cơ chế, và phải
được gọi đúng tên đó ở mọi chỗ nó xuất hiện.

**Ba thứ đo được, mỗi thứ chặn một cách hỏng khác nhau:**

| bài phải ĐỎ | chặn kiểu hỏng nào |
|---|---|
| phát lại đúng message đó | message đã ký thì ký **vĩnh viễn** — thiếu sổ chống phát lại là một lượt gửi rút cạn thanh khoản |
| khai sai hợp đồng nguồn | chữ ký validator vẫn **hợp lệ hoàn toàn**; `getVerifiedWarpMessage` chứng minh "validator subnet nguồn đã ký", KHÔNG chứng minh **ai** gửi |
| bỏ predicate | chữ ký đi bằng **access list**, không phải calldata — đặt nhầm chỗ thì `valid=false` mà giao dịch vẫn chốt bình thường |

**Không đúc token ở đầu nhận, dù `tu-in-tien` có sẵn.** Đúc để trả cho một message
là biến quyền đúc thành một hàm của cầu; lúc đó một lỗi ở khâu xác minh không còn là
mất thanh khoản của cầu mà là **lạm phát vô hạn của cả chain**. Thanh khoản có trần
tự nhiên; quyền đúc thì không.

**Artifact hợp đồng commit vào repo, solc KHÔNG.** Bộ biên dịch là công cụ lúc dựng,
không phải phụ thuộc lúc chạy. Bắt server có solc nghĩa là "hợp đồng đang chạy trên
mạng công khai" trở thành thứ phụ thuộc vào một bản solc cài ở đó — không tái lập
được. `local-net/contracts/compile.mjs` sinh ra `local-net/lib/asset-bridge.mjs`
kèm **vân tay sha256 của file .sol**, để câu hỏi hay bị hỏi nhất ("artifact còn khớp
nguồn không") trả lời được mà không cần dựng lại.

### D-035 — Mọi cổng chặn phải trả lời được câu "làm sao tôi biết mày vừa chạy?"

**Bối cảnh.** Ngày 2026-08-26, một phiên soát nguồn tìm ra 6 phép kiểm cùng mắc một
lỗi, và lỗi đó không phải "đo sai chỗ" mà là **không phân biệt nổi *đã kiểm và đạt*
với *chưa kiểm gì*.** Ba ví dụ đắt nhất, tất cả đều tái hiện được:

| Phép kiểm | Nó đo | Thứ ta cần biết | Hậu quả |
|---|---|---|---|
| `caddy-deploy.sh` | md5 host ↔ container **khớp nhau không** | bản MỚI đã vào chưa | `cp` hỏng ⇒ cũ-với-cũ khớp ⇒ **deploy thất bại báo thành công hoàn toàn** |
| `check-ports.sh` | từng cổng có hở không | có quét được cổng nào không | tầng 1 rỗng ⇒ quét **0 cổng** ⇒ vẫn in "✓ không cổng nào hở" |
| `console-restart.sh` | có ai nghe cổng 8091 không | bản MỚI có đang nghe không | `pkill` trượt ⇒ tiến trình **cũ** giữ cổng ⇒ in "✓ ĐANG NGHE" |

Cùng họ với `check-links.mjs` đo `<title>` (xanh cho một trang đã chết) và
`check-a11y.mjs` in "sạch trên 6 trang" trong khi 2 trang xuất ra **0 input**.

**Quyết định.** Mọi cổng chặn trong repo này phải mang **ít nhất một** trong hai thứ:

1. **Đối chứng ngược** — một trường hợp mà nó *phải* đỏ, chạy cùng lúc.
   `check-ports.sh` thử cổng 9 (chắc chắn đóng); `check-html.mjs` có bài chèn lỗi
   thật. Nếu đối chứng không đỏ thì phép đo đang hỏng, bất kể kết quả chính.
2. **In ra CON SỐ nó vừa đo**, không chỉ in ✓ — bao nhiêu cổng, bao nhiêu khối
   script, bao nhiêu tên miền, bao nhiêu ô nhập. Đây là bản rẻ tiền của đối chứng
   ngược: *"đã quét 0 cổng"* đọc khác hẳn *"✓"*, và khác ngay từ dòng đầu.

**Vì sao đáng thành luật chứ không phải mẹo.** Cả 6 lỗi đều lọt qua mọi bài kiểm
đang có, và lọt vì chúng **không sai** — chúng trả lời đúng một câu hỏi khác với câu
ta tưởng đang hỏi. Không đọc kỹ từng dòng thì không thấy. Luật này biến thứ chỉ phát
hiện được bằng cách đọc mã thành thứ phát hiện được bằng cách **nhìn đầu ra**.

**Không bao trùm cái gì.** Nó chỉ đảm bảo phép kiểm *có chạy*, hoàn toàn độc lập với
việc nó có đo *đúng đại lượng* hay không. `check-html.mjs` in đủ số khối và vẫn không
biết gì về logic sai. Đừng để bảng xanh thay cho việc đọc mã — P0-1 (trang `/chains/`
chết trên production) do một người đọc mã tìm ra, không do cổng chặn nào.

### D-036 — Ngày G **01/09/2026**: sinh lại genesis A1 để đồng nhất tokenomics với C1

**David chốt trực tiếp 2026-08-26** (trả lời câu hỏi ở BLOCKERS H-8). Trước đó mốc này
đến qua phiên `9Chain-BOD`, và A1 **không nhận** vì một phiên ngang hàng không truyền
được thẩm quyền — BOD tự đính chính đúng điểm đó. Nay có xác nhận của chính David nên
nó là mốc ràng buộc.

**Hệ quả trực tiếp lên mọi việc đang mở:**
- Genesis hiện tại **sẽ bị bỏ**. Mọi thứ khắc vào nó là tạm.
- **Sàn trượt cứng là 06/09**, không phải "trượt bao nhiêu cũng được": A1 khắc Block
  Adam = block đầu tiên vượt `2026-09-09T06:09:09Z`. Chain sinh sau mốc đó thì **không
  thể có Block Adam** — mất vĩnh viễn, không sửa được bằng bất kỳ thao tác nào sau này.
- `keys.txt` (H-8 cũ gọi là "chỗ hỏng duy nhất còn lại của dữ liệu") **đổi bản chất**:
  sinh lại mạng là sinh bộ khoá quỹ MỚI, nên đây không còn là bài toán đi sao lưu mà là
  bài toán **thiết kế custody**. Chốt sơ đồ TRƯỚC khi bấm sinh khoá; sau ngày G là về
  đúng thế kẹt cũ và cơ hội không quay lại.

### D-037 — Chấp nhận MẤT toàn bộ L1 đã tạo khi sinh lại mạng

**David chốt 2026-08-26:** *"các chain đang test đều xóa được, mất được"* — gồm cả
chain `David Do` 9141 của chính anh.

**Vì sao ghi lại thay vì coi là hiển nhiên.** Bản kế hoạch của BOD xếp mục này (`O3`)
là *"thứ duy nhất trong toàn kế hoạch chạm tới người dùng thật đã bấm nút"* và ghi
**28 L1 sẽ mất**. A1 đo lại: **3 L1 sống · 43 đã thu hồi**, và trong 3 chain sống chỉ
**một** thuộc người dùng thật — chain của chính David. Quyết định vì thế rẻ hơn hẳn
thứ kế hoạch mô tả, và nó chỉ rẻ **hôm nay**.

⚠️ **Rủi ro còn lại, đã chấp nhận có ý thức, không phải bỏ sót:** 43 bản ghi `retired`
giữ `name` + `chainId` **vĩnh viễn** để chống phát lại — đó là lý do `createChain` kiểm
trùng trên `chains ∪ retired`. Sinh lại mạng xoá sổ đó ⇒ những tên và chainId ấy dùng
lại được ⇒ ví nào còn lưu mạng cũ sẽ lặng lẽ trỏ vào **chain của người khác**, và chữ
ký phát lại được. Chấp nhận được **chỉ vì** mọi chain hiện tại đều là chain thử và
không ai ngoài đội đang dùng. **Điều kiện để nó vẫn đúng: mời người dùng thật vào
TRƯỚC 01/09 thì rủi ro này quay lại và không còn rẻ.** Nếu có đợt mời trước ngày G,
phải quyết lại mục này.

### ~~D-038~~ — ĐÃ THAY BẰNG **D-039**. Giữ lại để tra vì phần đo đạc vẫn đúng và vẫn dùng được.

### ~~D-038~~ — Giữ đúng 90 tỷ LOVE9 bằng cách đổi **thang đơn vị nội bộ P/X**, không đổi thứ người dùng thấy

**David chốt 2026-08-26: `1e7`.** — `1 LOVE9 = 10.000.000 đơn vị` trên P/X-Chain
(trước là `1e9`), và `X2CRateUint64` đổi `1e9 → 1e11` để C-Chain **vẫn 18 chữ số**.

**Bài toán (H-9).** `SupplyCap` là `uint64`; 90 tỷ × `1e9` = `9e19`, **tràn 4,88 lần**.
Trần lý thuyết với `1e9` là 18,447 tỷ LOVE9. Đo bằng biên dịch thật, có đối chứng ngược.

🔴 **Đính chính một câu tôi đã nói sai lúc đầu.** Tôi bảo đổi số thập phân là "đụng
bản sắc, vì 9 chữ số đi cùng LOVE9/love9/9001". **Sai.** Số chữ số thập phân KHÔNG có
trong danh sách bản sắc, và **người dùng đã luôn thấy 18 chữ số** (`web/lib/chain.ts`
khai `thapPhan: 18`; C1 cũng 18). Con số `1e9` chỉ là đơn vị kế toán nội bộ của
P/X-Chain (nAVAX), người dùng không bao giờ nhìn thấy. Cái sai đó suýt đẩy quyết định
sang hướng đắt hơn nhiều (hạ trần xuống 18 tỷ, tức bỏ mục tiêu đồng nhất hai nhánh).

**Vì sao `1e7` chứ không phải `1e6` hay `1e8`:** nó giữ gần nguyên **hồ sơ rủi ro của
mạng đang chạy và đã chứng minh được** — 720 triệu ở `1e9` chiếm 3,90% `uint64`;
90 tỷ ở `1e7` chiếm **4,88%**. `1e8` thì 48,79% (một nửa dải kiểu dữ liệu, chặn mọi
đường nâng cung sau này); `1e6` dư dả hơn nhưng bỏ xa mốc đã kiểm chứng.

**Con số dẫn xuất (×125 từ bảng hiện tại):**
| | LOVE9 | đơn vị P/X | % `uint64` |
|---|--:|--:|--:|
| SupplyCap | 90.000.000.000 | 900.000.000.000.000.000 | 4,879% |
| Phát hành genesis | 50.000.000.000 | 500.000.000.000.000.000 | 2,711% |
| MaxValidatorStake | 6.250.000.000 | 62.500.000.000.000.000 | 0,339% |
| MinValidatorStake | 250.000 | 2.500.000.000.000 | ~0% |
| MinDelegatorStake | 3.125 | 31.250.000.000 | ~0% |

✅ **Cổng G2 của kế hoạch (`self-bond genesis ≤ maxValidatorStake`) — ĐẠT, đã tính:**
self-bond = 50 tỷ × tỷ-lệ-staking ÷ 5 node. Với **mọi** khả năng của phân bổ
10-20-30-40 (10%→1 tỷ · 20%→2 tỷ · 30%→3 tỷ · 40%→4 tỷ mỗi node) đều ≤ 6,25 tỷ.
⇒ G2 không còn là ẩn số, **bất kể bucket nào là staking**.

**Cơ sở kỹ thuật khiến lời giải này an toàn:**
- `reward/calculator.go:46-60` tính bằng **`big.Int`** ⇒ không có tràn ở bước trung
  gian; chỉ đầu vào/ra là `uint64`.
- Cầu nối P/X↔C là **đúng một hằng số** `X2CRateUint64` (`coreth/plugin/evm/atomic/tx.go:33`).

📄 **Soát rủi ro đầy đủ: `docs/RISK-SCALE-1E7.md`** — 6 rủi ro có vị trí cụ thể
trong mã, 7 thứ đã kiểm và KHÔNG phải rủi ro, và 3 thứ chưa đo. Hai điều nặng nhất:
thang `1e9` nằm ở **BA chỗ độc lập** (netgen `unitLOVE9`, netgen `cChainGenesis`,
coreth `X2CRateUint64`) và lệch nhau thì **không gây lỗi nào**; và mọi `units.*` còn
sót trong `A1Params` trở thành **sai số 100 lần với chú thích khẳng định điều ngược lại**.

🔴 **RỦI RO CHƯA ĐÓNG — phải có bài kiểm trước ngày G.** `X2CRate` là hằng số
**consensus-critical cho chuyển tài sản X/P ↔ C-Chain**. A1 hiện **không có bài
nghiệm thu nào chạm đường đó**. Đổi nó mà không có bài kiểm là đúng loại thay đổi
"mọi thứ xanh cho tới lúc có người rút tiền".

**Đã loại, ghi ra để không ai đề xuất lại:**
- *Hạ trần xuống ≤18 tỷ*: bỏ đúng mục tiêu ngày G (hai nhánh cùng một con số).
- *Giữ `1e9`, phần dư để ngoài P-Chain*: đường cong thưởng tính theo `supplyCap` nên
  sẽ phát thưởng sai, và mạng khai **hai tổng cung khác nhau**.
- *Vá avalanchego dùng `big.Int` cho supply*: viết lại kế toán consensus-critical toàn
  codebase và **phá khả năng rebase** mà dự án cố ý giữ (`rebase-drill.sh`, M8).


### D-039 — **Tổng cung 9 tỷ LOVE9, GIỮ NGUYÊN thang `1e9`.** Thay D-038.

**David chốt 2026-08-26** sau khi xem ba phương án: *"đổi hết sang 9 tỷ LOVE9 để tối
ưu nhất"*. Đây là **PA-3** — không đụng máy móc, đổi chính con số. C1 chỉnh theo.

**Hệ số nhân từ bản hiện tại: ×12,5** (720 triệu → 9 tỷ).

| | LOVE9 | đơn vị P/X | % `uint64` |
|---|--:|--:|--:|
| SupplyCap | 9.000.000.000 | 9.000.000.000.000.000.000 | 48,79% |
| Phát hành genesis | 5.000.000.000 | 5.000.000.000.000.000.000 | 27,11% |
| MaxValidatorStake | 625.000.000 | 625.000.000.000.000.000 | 3,39% |
| MinValidatorStake | 25.000 | 25.000.000.000.000 | ~0% |
| MinDelegatorStake | **312,5** ⚠️ | 312.500.000.000 | ~0% |

✅ **G2 đạt** với mọi mapping của phân bổ 10-20-30-40: self-bond 100/200/300/400 triệu
mỗi node, trần 625 triệu.

⚠️ **`MinDelegatorStake` ra số lẻ** (25 × 12,5 = 312,5 LOVE9). Phải chốt làm tròn —
đề xuất **300** cho tròn, hoặc giữ **25** nếu muốn rào cản uỷ quyền thấp hơn theo tỷ lệ.
Đây là mục nhỏ duy nhất còn treo trong bảng số.

---

#### 🔴 48,79% `uint64` KHÔNG phải rủi ro — đã kiểm, đừng lo lại

Tôi từng gọi 9 tỷ là "sát hơn nhiều" và ngụ ý rủi ro. **Đo lại thì không.**

`reward/calculator.go:69` kết thúc bằng `return min(remainingSupply, finalReward)` —
phần thưởng bị **kẹp cứng** vào `supplyCap - currentSupply`. Nên phép cộng `uint64`
thô ở `txs/executor/standard_tx_executor.go:1533`
(`SetCurrentSupply(subnetID, currentSupply+potentialReward)`) **không thể tràn**, bất
kể `supplyCap` chiếm bao nhiêu phần trăm dải kiểu dữ liệu. Toàn bộ phần nhân trung
gian chạy bằng `big.Int` (`calculator.go:46-62`).

⇒ 48,79% là **dư địa để NÂNG trần sau này**, không phải biên an toàn số học. Muốn nâng
trần quá ~18,4 tỷ thì mới phải quay lại bài toán thang đơn vị.

---

#### Vì sao phương án này tối ưu — nó **xoá** gần hết bảng rủi ro

`docs/RISK-SCALE-1E7.md` liệt kê 6 rủi ro của việc đổi thang. Giữ nguyên `1e9` làm
chúng **biến mất**, không phải giảm nhẹ:

| | Rủi ro của PA-1/PA-2 | Ở D-039 |
|---|---|---|
| R1 | thang `1e9` nằm ở **3 chỗ độc lập**, lệch nhau không gây lỗi | **Không đổi chỗ nào** ⇒ tan |
| R2 | mọi `units.*` còn sót thành sai số 100 lần, chú thích vẫn ghi số cũ | `units.*` **vẫn đúng nghĩa cũ**; chỉ đổi hệ số (`50 * units.MegaAvax` → `625 * units.MegaAvax`) ⇒ tan |
| R3 | không có bài kiểm nào chạm X/P↔C, mà `X2CRate` là consensus-critical | **`X2CRate` không đụng tới** ⇒ tan |
| R4 | `coreth` thành điểm chủ quyền MỚI (7→8), phải diễn tập rebase lại | **Không chạm `coreth`** ⇒ tan. (Vẫn phải qua patch series cho `0002`/`0003`) |
| R5 | `X2CRate` là hằng toàn cục ⇒ test upstream đỏ thêm, không rollout từng node được | ⇒ tan |
| R6 | 9Scan-A1 hiển thị số dư P-Chain **sai 100 lần** | **Ý nghĩa đơn vị không đổi** ⇒ tan |

**Việc còn lại rút xuống:** sửa ~6 con số trong `genesis_9chain_a1.go`, bảng phân bổ
trong netgen, và `allocation.md`. Không có thay đổi consensus-critical nào.

**Cái giá, ghi ra cho sòng phẳng:** 90 tỷ là con số đã xuất hiện trong kế hoạch BOD và
mang ý nghĩa `9×10`. Đổi sang 9 tỷ giữ được biểu tượng số 9 và **C1 phải chỉnh theo** —
mục tiêu "hai nhánh cùng một con số" chỉ đạt khi C1 cũng đổi. **A1 không tự làm được
phần đó.**

### D-040 — Bảng phân bổ genesis 9 tỷ: **40 staking · 30 con người · 20 hệ sinh thái · 10 team**

**David chốt 2026-08-26.** Thay bảng đang chạy `40/20/20/5/15` (staking/foundation/
ecosystem/faucet/team).

| Quỹ | % | LOVE9 | Dạng |
|---|--:|--:|---|
| Staking + validator | 40 | 3.600.000.000 | self-bond genesis **900.000.000** (180 tr/node × 5, khoá 1 năm) + **2.700.000.000** để mint dần |
| Con người | 30 | 2.700.000.000 | faucet **nóng** 250.000.000 (thanh khoản) + **2.450.000.000 khoá 2 năm** |
| Hệ sinh thái | 20 | 1.800.000.000 | 225.000.000 thanh khoản X/P + 1.575.000.000 C-Chain |
| Team | 10 | 900.000.000 | khoá 4 năm |

**Phát hành genesis 6.300.000.000** (70,0% trần) · **để mint 2.700.000.000** (30,0%).
Tổng phần chia nhỏ khớp đúng 6,3 tỷ — đã đối chiếu.

**Vì sao bảng này thay vì bảng BOD đề (`đội 10 · hệ sinh thái 20 · staking 30 ·
con người 40`):** nó **đổi ít nhất** so với mạng đang chạy — Staking giữ nguyên 40%,
Hệ sinh thái giữ nguyên 20%. Với một lượt re-genesis thì "đổi ít biến hơn" là ưu điểm
thật: hỏng thì biết ngay do đâu.

**Team 10% — David chốt, và chốt có chủ đích.** Lý do anh nêu: ngang Avalanche, và
thấp hơn nhiều dự án khác.
⚠️ **Tôi KHÔNG kiểm chứng được con số "Avalanche team 10%" từ mã trong repo** —
genesis mainnet trong `avalanchego` chỉ là danh sách địa chỉ + số tiền, không nhãn quỹ.
Ghi lại theo lời David, và ghi rõ đó là nguồn duy nhất.
🔴 **Biết trước để không bị hỏi bất ngờ:** C1 khai **Team 0%** trong
`9chain/docs/SPEC-TOKENOMICS.md` (*"KHÔNG có allocation, KHÔNG có vesting account nào
trong genesis. Team đào như mọi người — fair launch tuyệt đối"*). Hai nhánh vì thế kể
hai câu chuyện công bằng khác nhau, và đó là thứ người ngoài so sánh sẽ thấy trước
tiên. **David chốt A1 làm chuẩn ⇒ C1 sẽ sửa theo** (xem D-041).

**Hai điều tôi đề nghị và David không phản đối, đã áp:**
1. **Quỹ "Con người" KHOÁ 2 năm** thay vì để trần. Ở C1 quỹ tương đương là module
   account có luật mở 0,09%/ngày **cưỡng chế trên chain**; ở A1 nếu để trần thì nó chỉ
   là một cái khoá — ai giữ khoá chuyển hết được bất cứ lúc nào. Dùng `unlockSchedule`
   (cơ chế đã dùng cho Foundation 2 năm / Team 4 năm) thì **genesis cưỡng chế**, không
   phụ thuộc người giữ khoá. Chừa 250 tr thanh khoản cho faucet.
2. **self-bond 900 tr (180 tr/node) thay vì 1,2 tỷ.** self-bond lớn siết ngân sách
   thưởng: 1,2 tỷ ⇒ chỉ còn 26,7% trần để mint; 900 tr ⇒ 30,0%. (Bản đang chạy: 44,4%
   — vẫn thấp hơn, đây là đánh đổi có ý thức của việc nâng tỷ trọng phát hành genesis.)
   Dư địa nhận uỷ quyền mỗi node: **71%** của trần 625 tr.

**Ghi ra vì nó không tự hiện ra ở đâu:** validator genesis giữ 180 tr, validator cộng
đồng vào ở mức tối thiểu 25.000 ⇒ **chênh 7.200 lần** (0,003% trọng số). Với M3
(*"cộng đồng chạy node"*) thì node cộng đồng gần như không có tiếng nói consensus trừ
khi được cấp vốn. **Đường cấp vốn là quỹ Hệ sinh thái 1,8 tỷ** — ghi ở đây để sau
không ai hỏi "tiền đó để làm gì".

### D-041 — **A1 làm chuẩn tokenomics, C1 follow theo.** Đảo chiều so với kế hoạch BOD

**David chốt 2026-08-26.**

Kế hoạch BOD đang đặt **C1 làm nguồn** — rõ nhất ở phần khắc chữ: *"C1 sinh trước, A1
lấy byte đó, không gõ lại"*, và phần tokenomics mô tả A1 "đồng nhất **theo** C1".
Nay ngược lại cho **phần phân bổ**: A1 chốt trước, C1 sửa theo.

🔴 **Phải báo BOD và C1 ngay, vì hai bên có thể đang chờ nhau.** Nếu C1 vẫn coi mình là
nguồn thì cả hai cùng đứng, và mốc 01/09 mất ngày trong lúc không ai làm gì.

⚠️ **Đảo chiều này CHỈ áp cho phân bổ/tokenomics.** Phần **khắc chữ** (bản Hebrew, 9
tài liệu, bản ASV 1901 phải khớp từng byte) vẫn theo chiều cũ — C1 sinh, A1 chép byte.
Trộn hai chiều là chỗ đẻ ra hai bản văn khác nhau trên hai chain, và đó là thứ không
sửa được sau khi khắc.

### D-042 — BẢNG PHÂN BỔ CHỐT CUỐI (thay bảng ở D-040)

**David chốt 2026-08-26.** Tổng **9.000.000.000 LOVE9**, đúng 100%.

| Hạng mục | % | LOVE9 | Dạng |
|---|--:|--:|---|
| Team | 9 | 810.000.000 | khoá 4 năm |
| Private Sale | 9 | 810.000.000 | khoá 2 năm |
| Foundation | 12 | 1.080.000.000 | thanh khoản; **chứa self-bond 8.999.991** và nhận thưởng staking |
| Community | 30 | 2.700.000.000 | faucet **nóng** 99.999.999 + **2.600.000.001 khoá 2 năm** |
| Staking Rewards | 40 | 3.600.000.000 | **KHÔNG cấp ở genesis** — quỹ mint dần |

**Phát hành genesis = 5.400.000.000 (60%)** · **quỹ mint = 3.600.000.000 (40%)**.

**"Staking Rewards" là tên trung thực** — các bản nháp trước gọi "Staking + validator 40%"
làm người đọc tưởng 40% được cấp ở genesis. Nó là quỹ **mint theo mức staking thực tế**;
với ~9 triệu đang stake thì mỗi năm chỉ đúc cỡ **700 nghìn LOVE9**, tức trần 9 tỷ trên
thực tế là trần danh nghĩa và cung thật sẽ nằm quanh 5,4 tỷ. Ghi ra để tài liệu không
nói một đằng chain nói một nẻo.

**Bốn mục A1 đề xuất, David duyệt cùng lượt:**
1. **Faucet lấy từ Community** — ví nóng 99.999.999 (**100% trên C-Chain**; faucet chỉ
   tiêu trên C-Chain, phần X/P ở bảng cũ chưa bao giờ được dùng), phần còn lại khoá.
   Ví nóng nhỏ vì nó *được thiết kế để chấp nhận mất* và **nạp lại được**.
   🔴 Đây cũng là sửa một khiếm khuyết đang tồn tại: hiện **toàn bộ** quỹ faucet nằm
   trong một ví nóng (18/20 triệu), không có dự trữ lạnh.
2. **self-bond 9 × 999.999 = 8.999.991 lấy từ Foundation** (0,83% quỹ đó) — Foundation
   cũng là nơi nhận thưởng staking ⇒ quỹ nuôi validator nhận lại thưởng, vòng khép kín.
   Dùng **địa chỉ RIÊNG**, không dùng chung địa chỉ Foundation: phần **khoá** của địa chỉ
   nằm trong `initialStakedFunds` **chính là** stake validator, nên trộn chung thì sau này
   đổi lịch khoá Foundation sẽ **âm thầm đổi trọng số validator**.
3. **Lịch khoá:** Team 4 năm · Private Sale 2 năm · Community (phần lạnh) 2 năm ·
   Foundation thanh khoản.
4. **Nhiệm kỳ validator 365 ngày, SO LE giữa 9 node.** 9 node cùng hết hạn một ngày là
   mạng chết im lặng (HANDOFF đã ghi mốc `2027-08-24` cho bản 5 node). So le thì node
   đầu rụng trở thành **cảnh báo sớm** thay vì dấu chấm hết. 365 ngày là **trần**
   (`MaxStakeDuration`), không phải lựa chọn.

### D-043 — C1 sửa theo A1 **kể cả phần phân bổ nội bộ**, gồm Team 9% + Private Sale 9%

**David chốt 2026-08-26**, sau khi A1 nêu rõ cái giá. Mở rộng D-041 (vốn chỉ nói
"tokenomics") thành: **C1 follow A1 cả bảng phân bổ.**

🔴 **A1 đã cảnh báo và David vẫn chốt — ghi lại để sau không ai bảo là không ai biết:**
`9chain/docs/SPEC-TOKENOMICS.md` của C1 khai **Team / Investor = 0%**, *"KHÔNG có
allocation, KHÔNG có vesting account nào trong genesis — fair launch tuyệt đối, Điều
luật 51%"*, và cột lịch sử ghi *"Cũ: team 150M ContinuousVesting — **XOÁ** khỏi
`render.go`/`mainnet-genesis.sh`"*. Tức **C1 đã từng có phân bổ team và cố ý xoá đi**.

⇒ Với D-043, C1 phải **đặt lại thứ họ vừa xoá, cộng thêm 9% Private Sale** — tổng 18%
cho nội bộ, ngược hẳn nguyên tắc họ đã ghi vào Paper (thứ họ gọi là *"hiến pháp vô thời
hạn"*). Đây không phải sửa con số mà là đảo một nguyên tắc nền, và nó sẽ là **câu hỏi
đầu tiên người ngoài đặt ra khi so hai nhánh**.

A1 đề xuất phương án gỡ (thu hẹp phạm vi: C1 chỉ follow tổng cung + cấu trúc pool, phân
bổ nội bộ mỗi nhánh tự quyết) — **David không chọn**. Ghi lại cả đề xuất lẫn việc nó bị
bỏ qua, vì đó là thông tin cần cho người quyết sau này.

### D-044 — Custody khoá quỹ: **GIỮ NGUYÊN SƠ ĐỒ CŨ** (một `keys.txt` offline, David tự cất bản thứ hai)

**David chốt 2026-08-26**, sau khi A1 nêu ba đường: giữ nguyên · tách theo mức rủi ro
(giấy + bản mã hoá, hai nơi) · multisig P-Chain ở genesis.

D-036 đặt điều kiện **chốt sơ đồ custody TRƯỚC khi bấm sinh khoá**, vì sinh lại mạng
là cơ hội một lần — sau ngày G thì đổi sơ đồ nghĩa là phải re-genesis lần nữa. Mục này
là câu trả lời cho điều kiện đó, nên nó **mở khoá** bước sinh khoá của re-genesis.

**Sơ đồ được chốt** (y như đang chạy, không thêm gì):
- `local-net/net-public/keys.txt` giữ **offline trên máy dev**, `.gitignore` sẵn,
  **không bao giờ** lên server.
- File duy nhất được phép lên server: `faucet.env` (ví nóng 99.999.999 LOVE9,
  **được thiết kế để chấp nhận mất** và nạp lại được từ Foundation).
- Bản sao thứ hai: **David tự cất**, ngoài phạm vi repo và ngoài phạm vi của A1.

🔴 **Rủi ro còn lại, chấp nhận có ý thức — ghi ra để sau không ai bảo là không ai biết:**
mất máy dev = mất **toàn bộ** khoá của 5 quỹ genesis (Foundation 1,08 tỷ · Community
2,7 tỷ · Private Sale 810 triệu · Team 810 triệu). Không có đường khôi phục nào khác:
genesis bất biến, không có multisig, không có social recovery. Bản thứ hai của David
**là** kế hoạch dự phòng duy nhất — nếu bản đó không tồn tại thì sơ đồ này chỉ có một
điểm hỏng, và điểm đó là một ổ đĩa.

**Vì sao vẫn hợp lý hôm nay:** A1 là **testnet**, token không có giá, và hai đường kia
đều đắt hơn cái được ở giai đoạn này — multisig phải sửa netgen (thêm điểm chủ quyền,
phải diễn tập rebase lại) cho một mạng sẽ re-genesis lần nữa vào 01/09.
⚠️ **Điều kiện để nó còn đúng:** khi A1 chuyển sang thứ có giá trị thật (hoặc trước
mainnet), mục này **phải quyết lại** — lúc đó "một ổ đĩa" không còn là rủi ro chấp nhận được.


### D-045 — PHÂN XỬ XUNG ĐỘT BẢNG PHÂN BỔ: **giữ bảng ĐANG CHẠY 40/30/12/9/9**

**David chốt 2026-08-27**, trả lời trực tiếp việc chặn số một của ngày G.

`PLAN-REGENESIS-2026-09-01.md` §G1 để ngỏ một xung đột và ghi *"đừng khắc bảng nào cho
tới khi chủ dự án phân xử"*. A1 thẩm định lại thì hoá ra có **BA** bảng, không phải hai —
và bảng **đang chạy thật** không khớp bảng nào trong hai bảng đang tranh chấp:

| Ô (ngôn ngữ 4 nhóm của BOD) | BOD Đ14 | A1 D-039 (như BOD chép) | **ĐANG CHẠY (D-042)** |
|---|--:|--:|--:|
| Staking + validator | 30% | 40% | **40%** |
| Con người / Community | 40% | 30% | **30%** |
| Hệ sinh thái | 20% | 20% | **21%** |
| Team | 10% | 10% | **9%** |

**Chốt: giữ nguyên bảng đang chạy.** Nó là bảng **5 hạng mục**, không phải 4:

| Hạng mục | % | LOVE9 |
|---|--:|--:|
| Staking Rewards | 40 | 3.600.000.000 — **KHÔNG cấp ở genesis**, mint dần |
| Community | 30 | 2.700.000.000 (faucet nóng 99.999.999 + khoá 2 năm 2.600.000.001) |
| Foundation | 12 | 1.080.000.000 (self-bond 8.999.991 + 1.071.000.009) |
| Private Sale | 9 | 810.000.000 — khoá 2 năm |
| Team | 9 | 810.000.000 — khoá 4 năm |

Tổng cung **9.000.000.000** · phát hành genesis **5.400.000.000** (60%).

**Vì sao đây là lựa chọn rẻ nhất:** bảng này **đã thi hành thật** trên mạng công khai từ
26/08 và đã qua nghiệm thu đầy đủ. Chọn nó nghĩa là **không phải sửa một dòng mã nào** —
`netgen/allocation.go` đã codify đúng nó (đã đối chiếu 27/08). Hai bảng kia đều đòi sinh
lại bảng, tính lại lát self-bond, và chạy lại toàn bộ nghiệm thu, đổi lấy một khác biệt
mà chưa ai nêu được lý do kỹ thuật.

⇒ **Mở khoá:** G1 · G2 (lát self-bond) · G3 (phần để mint) trong kế hoạch ngày G, và
điều kiện GO/NO-GO số 1. Xem `docs/GDAY-A1-REMAINING.md`.

**Hệ quả kèm theo, đã tính sẵn (G2/G3 không còn phải quyết riêng):**
- **G2** — self-bond **8.999.991** nằm trong Foundation 12% (KHÔNG trích từ ô staking như
  bản nháp BOD ghi). Ở 9 node = **999.999/node**. Đã đo: ≤ `maxValidatorStake` 625.000.000,
  còn ~624 triệu dư địa nhận uỷ quyền mỗi node.
- **G3** — phần để mint = **3.600.000.000**, chính là ô Staking Rewards 40%, không cấp ở
  genesis. `SupplyCap − tổng alloc genesis` = 9,0 tỷ − 5,4 tỷ ✓.

🔴 **MỘT RÀNG BUỘC CHƯA AI NÊU — SỐ NODE Ở NGÀY G PHẢI LÀ 9.**
`allocation.go` khai self-bond là một **TỔNG cố định** (`8_999_991`), rồi avalanchego chia
đều cho N node. `8.999.991 = 9 × 999.999` — bộ chín số 9 chỉ ra đúng ở **N = 9**:

| N | LOVE9/node | |
|--:|--:|---|
| 9 | **999.999** | tròn — bản sắc "toàn số 9" |
| 10 | 899.999,1 | **thôi tròn LOVE9** |
| 12 | 749.999,25 | **thôi tròn LOVE9** |

🔴 **ĐÍNH CHÍNH `27/08` — bản đầu của mục này ghi "dư 1 / dư 3". SAI, và sai kiểu đo nhầm
đại lượng.** Đó là chia theo đơn vị **LOVE9**; avalanchego chia theo **nano**, mà tổng có
sẵn thừa số `1e9` nên **không N nào để lại dư** (đã đo N = 3·5·7·9·10·11·12·15, dư nano
= 0 hết). ⇒ Ràng buộc N=9 là chuyện **BẢN SẮC**, không phải chuyện **số học** — không mất
đồng nào ở N khác, chỉ là self-bond mỗi node thôi tròn LOVE9. Đừng lấy mục này làm bằng
chứng cho một rủi ro mất tiền.

⚠️ Điều này **giao thoa với O4** (validator ở nhà cung cấp thứ hai). Thêm một node trước
ngày G ⇒ N = 10 ⇒ self-bond mỗi node thành **899.999 và lẻ 1 đơn vị**, mất luôn ý nghĩa
"toàn số 9". Muốn cả hai thì phải **nâng tổng self-bond** cho chia hết cho N mới — và đó là
đổi bảng phân bổ, tức lại là việc của David. **Đừng để nó tự xảy ra ở phút chót.**

### D-046 — **Số node ở ngày G: GIỮ 9.** Và điều đó ĐỔI BẢN CHẤT của O4

**David chốt 2026-08-27.** Hệ quả trực tiếp của D-045: self-bond khai là **tổng cố định**
8.999.991, chia đều cho N ⇒ `8.999.991 = 9 × 999.999` chỉ cho mỗi node đúng bộ chín số 9
**ở N = 9**.

⚠️ **Đây là ràng buộc BẢN SẮC, không phải ràng buộc số học** — xem phần đính chính trong
D-045. Ở N khác **không mất đồng nào**; chỉ là self-bond mỗi node thôi tròn LOVE9.

🔴 **Hệ quả phải nói ra, vì nó đổi một việc đang mở:** O4 (validator ở nhà cung cấp thứ hai)
**không còn là "thêm một node thứ 10"** — thêm là thành N=10. Nó phải là **DỜI một trong 9
node sang nhà cung cấp khác**. Điều đó **tốt hơn** cho chính mục tiêu của O4: vẫn 9 node,
vẫn giữ bảng phân bổ, mà gỡ được đúng cái rủi ro "một máy, một nhà cung cấp". Chi phí thì
khác hẳn: dời node là **đổi `--public-ip` + cửa P2P**, không phải đẻ thêm khoá staking.

**Thi hành:** `netgen` nay **luôn in** self-bond mỗi node, và **cảnh báo** khi nó thôi tròn
LOVE9 (`canhBaoSelfBond`). **Cố ý chỉ cảnh báo, không chặn** — chặn cứng sẽ giết đường dev
quen thuộc `gen-network.sh 5` mà không được gì, vì đây là chuyện bản sắc chứ không phải
chuyện đúng/sai.

### D-047 — **chainId `9000000009`: GIỮ ở ngày G**

**David chốt 2026-08-27.** Trước mục này **không có quyết định nào tồn tại** về việc giữ hay
đổi — phiên web đi tìm và không thấy, đúng vì nó chưa từng được quyết.

Phiên web nêu ba lý do nên đổi. Đo lại: **một đổ, hai đứng**.

| Lý do | Thẩm định |
|---|---|
| chữ ký **SIWE** cũ phát lại được | 🔴 **ĐỔ.** `siwe.mjs:113` — server **không bao giờ nhận `message` từ client**, nó tra message từ kho của chính nó theo nonce ⇒ chữ ký mạng cũ **không có đường trình lên**. Thêm hai lớp: `khoNonce` là `Map` trong bộ nhớ (mất khi restart) và nonce **dùng một lần**, xoá ngay cả khi xác minh hỏng. Chặn **độc lập với chainId** |
| ví còn cấu hình cũ nối vào mạng mới không cảnh báo | ✅ **Đứng** — cùng chainId + cùng RPC + cùng tên ⇒ số dư 0 mà người dùng không hiểu vì sao |
| tx đã ký **chưa phát** của mạng cũ phát lại được | ✅ **Đứng, nhưng hẹp** — sau re-genesis mọi địa chỉ số dư 0 nên tx phát lại chết vì thiếu tiền; cửa còn mở là người đó xin faucet rồi tx cũ nonce 0 mới chạy |

**Vì sao GIỮ:** chân trụ mạnh nhất của phía "đổi" đã đổ, trong khi giá của việc đổi là thật —
mọi tài liệu/ví/hướng dẫn đã phát ra ngoài đều sai, và `9000000009` nằm trong **chuẩn đặt tên
chốt 24/08** cùng `LOVE9`/`love9`/`9001`, tức nó là **bản sắc**, không phải tham số.

⇒ **Hai vế còn lại xử bằng CÂU CHỮ trên trang, không bằng đổi số.** Việc thuộc `Web9Chain` /
phiên web: nói thẳng "ví cũ sẽ thấy số dư 0, hãy thêm lại mạng", và một câu cho vế tx chưa phát.

### D-048 — **`SupplyCap` = 7.900.000.001, KHÔNG phải 9 tỷ.** Tổng cung vẫn là 9 tỷ

**A1 quyết 2026-08-27, từ phép đo, không phải từ ý muốn.** Bản soát core
([`docs/CORE-AUDIT-2026-08-27.md`](docs/CORE-AUDIT-2026-08-27.md) §2) đo được:
`Config.InitialSupply()` (`genesis/config.go:146`) cộng **duy nhất** `Allocations` (X/P);
trường `CChainGenesis` nằm ngoài vòng lặp ⇒ **1.099.999.999 LOVE9 phát hành thẳng trên
C-Chain tồn tại thật mà `currentSupply` không bao giờ đếm tới.**

Với `SupplyCap` 9 tỷ, dư địa mint là **4.699.999.999** thay vì 3.600.000.000 như D-042 định,
và **tổng LOVE9 tối đa từng tồn tại là 10.099.999.999** — vượt lời hứa 9 tỷ **12,2%**.

| | LOVE9 |
|---|--:|
| trần cung P/X (hằng số trong binary) | **7.900.000.001** |
| + phát hành thẳng C-Chain | 1.099.999.999 |
| **= tổng cung công bố (D-039, KHÔNG đổi)** | **9.000.000.000** |
| dư địa mint = 7.900.000.001 − 4.300.000.001 | **3.600.000.000** = ô Staking Rewards 40% ✓ |

🔴 **D-039 và D-042 KHÔNG đổi.** Tổng cung vẫn 9 tỷ, bảng phân bổ vẫn 40/30/12/9/9, phát hành
genesis vẫn 5,4 tỷ. Cái đổi là **một hằng số kỹ thuật trong binary** để hành vi khớp với lời
hứa đã có. Đừng trích D-048 như một lần "hạ tổng cung".

**Bất biến mới**, cưỡng chế ở `netgen/allocation.go` (`mustFitSupplyCap`) và
`scripts/check-consistency.mjs`:

```
SupplyCap + Σ(bucket.CChain) == 9.000.000.000
```

**Vì sao A1 tự quyết chứ không hỏi David:** đây không phải lựa chọn giữa hai đường — con số
cũ làm mã **nói khác tài liệu**, và con số mới rơi trúng ý định gốc của D-042 tới từng đơn vị.
Không có phương án B nào giữ nguyên cả D-039 lẫn D-042. Cái cần David biết là **hệ quả**: nó
chạm binary ⇒ phải nằm trong lượt `docker build` của ngày G, và bước 0 của runbook nay đối
chứng `"supplyCap":7900000001000000000`.

⚠️ **Nếu sau này đổi cột `CChain` trong bảng phân bổ thì PHẢI đổi `SupplyCap` theo.** Cổng sẽ
đỏ nếu quên — nhưng nhớ rằng cái đỏ đó nói "kế toán lệch", không nói "bạn vừa in thêm tiền".

### D-049 — **A1 sở hữu lịch nâng cấp của chính mình** (`upgrade.A1`)

**A1 quyết 2026-08-27.** `upgrade.GetConfig` chỉ tách Mainnet/Fuji; 9001 rơi vào `Default` —
bảng của Ava Labs, thay đổi theo mỗi lượt phát hành của họ. Lịch kích hoạt hard fork
consensus-critical **ngang `SupplyCap`**, nên để nó đi theo upstream nghĩa là: khi Ava Labs
lên lịch Helicon, **lượt rebase kế tiếp của A1 nuốt trọn một hard fork không qua quyết định
nào**.

Thêm `upgrade.A1` — **chép tường minh từ `Default`, giá trị y hệt**. Đây là lượt đổi **quyền**,
không đổi **hành vi**: mạng đang chạy trên `Default` nên chép nguyên là giữ nguyên mọi thứ
đang đúng.

⚠️ **Sau mỗi lượt rebase phải đối chiếu `A1` với `Default` bằng mắt.** Nếu `upgrade.Config`
mọc thêm trường, Go **không báo lỗi** — trường thiếu nhận `time.Time{}` zero là **năm 1**,
tức "đã kích hoạt từ lâu". Không cổng nào canh hộ.

**`HeliconTime` giữ `UnscheduledActivationTime`** — bật nó là một hard fork của 9Chain và
phải có một mục DECISIONS riêng.

### D-050 — mạng có TÊN ở lớp giao thức, và HRP thôi sống bằng fallback

**A1 quyết 2026-08-27.** Khai tường minh `constants.A1ID` / `A1Name` = `"9chain-a1"` /
`A1HRP` = `"love9"`, và đưa cả ba vào `NetworkIDToNetworkName`, `NetworkNameToNetworkID`,
`NetworkIDToHRP`.

- **HRP:** trước đây 9001 không có trong map, `GetHRP` rơi xuống `FallbackHRP`. Tiền tố địa
  chỉ của mạng công khai sống bằng **nhánh dự phòng**. Một lượt rebase đặt lại `FallbackHRP`
  về `"custom"` là **đổi tiền tố mọi địa chỉ P/X đã phát ra ngoài**, và không cổng nào bắt.
  Giá trị **không đổi** (`"love9"` cả trước lẫn sau) — chỉ chuyển từ *rơi vào* thành *khai ra*.
- **Tên:** `NetworkName(9001)` trước đây là `"network-9001"` — chuỗi `info.getNetworkName` trả
  ra, thứ 9Scan-A1 và ví đọc.

🔴 **HỆ QUẢ PHẢI ĐỌC TRƯỚC KHI DEPLOY:** `config/config.go:1008` dựng đường dẫn DB là
`<db-dir>/<NetworkName(networkID)>`. Đổi tên mạng ⇒ node đi tìm `<db-dir>/9chain-a1/` thay vì
`<db-dir>/network-9001/` — **thư mục rỗng**.

⇒ **Binary mang patch 0013 CHỈ được lên cùng một lượt sinh lại mạng** (`down -v`). Ngày G
thoả điều đó. Đưa nó lên mạng đang chạy mà không wipe thì cả 9 node cùng lúc thấy DB trống và
bootstrap lại từ đầu — dữ liệu cũ **vẫn còn trên đĩa** ở thư mục cũ, nhưng mạng đứng.

Muốn bỏ vế tên để gỡ hẳn rủi ro này: xoá đúng dòng `A1ID: A1Name` trong
`NetworkIDToNetworkName`. Phần HRP và `A1ID` độc lập, giữ nguyên được.

### D-051 — **B-11: giữ `UptimeRequirement` 0.8 · giữ `MaxStakeDuration` 365 ngày · phí C-Chain giữ nguyên, KHAI LÀ CỐ Ý**

**David chốt `2026-08-27`.** Ba mục do bản soát core nêu
([`docs/CORE-AUDIT-2026-08-27.md`](docs/CORE-AUDIT-2026-08-27.md) §7, `BLOCKERS.md` B-11).
Cả ba **biên dịch vào binary** ⇒ phải đóng băng trước lượt `docker build` của ngày G.

Thi hành: **patch 0014**, tree `4c5d5b1e`. 🔴 **Không đổi một giá trị nào — chỉ đổi CHỮ.**
Đó là cả điểm của nó: trong mã, một tham số **chưa ai quyết** trông y hệt một tham số **đã
quyết**, và ba chỗ này đang ở trạng thái thứ nhất.

#### (a) `UptimeRequirement` giữ **0.8**

Chú thích cũ ghi *"⬅️ CHỐT LẠI THÀNH 0.9 TRƯỚC MAINNET"* — một việc nằm trong **comment** và
không nằm trong file này, tức **không ai canh**. Nay nó có ngày tháng, và **mốc xét lại là
MAINNET, không phải ngày G**: A1 vẫn đúng là testnet công khai mời cộng đồng chạy node, mà
0.9 trên hạ tầng không chuyên là cắt thưởng của người chạy thật.
*(Avalanche mainnet dùng 0.9 theo ACP-267.)*

#### (b) `MaxStakeDuration` giữ **365 ngày** — bằng Avalanche mainnet

🔴 **Hệ quả phải có NGƯỜI canh, không phải mã canh.** Trần này + `InitialStakeDuration` 365
ngày + `InitialStakeDurationOffset` 7 ngày ⇒ **9 validator genesis hết hạn lần lượt trong một
cửa sổ 56 ngày, bắt đầu ~365 ngày sau ngày G**. Node cuối rụng là **mạng DỪNG**; avalanchego
không có cơ chế tự gia hạn.

**Không phải lỗi.** Trần dài hơn nghĩa là khoá staking bị giam lâu hơn — đánh đổi, không phải
cải thiện. Cái thiếu là **quy trình gia hạn**, mà quy trình không sống trong mã.

⚠️ **So le 7 ngày là CỐ Ý và chính nó là hệ thống cảnh báo:** node đầu rụng ở ~ngày 309 của
nhiệm kỳ, lúc đó 8 node còn chạy ⇒ có ~56 ngày để phản ứng, thay vì cả mạng tắt cùng lúc.
**Đừng "dọn dẹp" offset về 0 cho đều.**

⇒ Sinh ra một việc vận hành, **không** phải việc mã: dựng lịch gia hạn validator. Ngày hết hạn
thật chỉ biết sau khi sinh genesis ngày G — đọc bằng `platform.getCurrentValidators` →
`endTime`, **đừng tính tay**.

#### (c) Phí C-Chain giữ nguyên đường cong Avalanche — và **khai ra là cố ý**

Bản soát đối chiếu thì thấy A1 hạ `TxFee` xuống `MilliAvax` cho P/X (*"mạng đẻ L1, phí không
được là rào cản với builder"*) nhưng **không chạm một tham số nào của C-Chain** — trong khi
C-Chain mới là nơi người dùng **thật sự** giao dịch: faucet cấp 100% trên C-Chain, MetaMask
nói chuyện với C-Chain, Blockscout index C-Chain, soak 210 TPS chạy trên C-Chain. Tức A1 hạ
phí ở đúng lớp người dùng **ít chạm nhất**.

🔴 **Sự im lặng đó không phân biệt được với bỏ sót** — và người soát lần sau sẽ phải điều tra
lại từ đầu để tới cùng một chỗ. Nay khai thành chữ trong `genesis_9chain_a1.go`, kèm:

- **Lý do giữ:** phí C-Chain đi theo **ACP-176** (đường cong động của coreth), không phải hằng
  số để chỉnh — đổi là rời khỏi cơ chế đã kiểm chứng ở quy mô mainnet để lấy một con số chưa
  ai đo trên A1 · soak `25/08` đo **2.272.500 tx / 210,4 TPS / 0 lỗi gửi**, p50 19ms ⇒ phí
  hiện tại **không chặn ai** · A1 là testnet, token xin ở faucet nên phí không phải rào cản
  kinh tế thật.
- **Điều kiện xét lại:** có mainnet thật (phí thành kinh tế thật), **hoặc** đo được một tải mà
  ACP-176 xử lý kém. Cả hai đều chưa xảy ra.
- **Con trỏ:** muốn đổi thì chỗ đổi **không phải `genesis_9chain_a1.go`** — nó nằm trong chain
  config của C-Chain (`--chain-config-dir`), và là re-genesis nếu chạm phần trong `cChainGenesis`.

#### Còn mở: C-4

**chainId `9000000009` cắm cứng** trong `cChainGenesis` ⇒ mạng tập và mạng thật không phân
biệt được. **Không chạm binary** nên không chặn ngày G. Vẫn ở `BLOCKERS.md` B-11.

---

## 2026-08-27 · Đợt autopilot 14 (5 mốc đường găng ngày G)

### D-052 — Mạng tập diễn tập có tệp compose RIÊNG, cổng 9750, KHÔNG dùng lại cổng 9650

`local-net/docker-compose.drill.yml` (project `a1-drill`, volume riêng, image mặc định
`9chain-a1/node:boottest`).

**Lý do:** Blockscout local trỏ vào **9650**. Cho một mạng tập lên đó là để explorer index
một chuỗi rồi chuỗi đó biến mất lúc `down -v` — DB explorer giữ lại block của một mạng
không còn tồn tại, **và không có gì báo lỗi**. Bản soát core `27/08` (§9.6) đã dựng tay đúng
sơ đồ này để boot thử patch 0013; tệp này chỉ codify lại để lần sau không phải nhớ.

**Đánh đổi:** thêm một tệp compose phải giữ đồng bộ với `docker-compose.yml`. Chấp nhận, và
giảm rủi ro bằng cách chỉ cho lệch **đúng ba chỗ** (cổng · volume · biến image); mọi tham số
avalanchego giữ y nguyên — mạng tập lệch tham số so với mạng thật thì nó thôi là bài tập.

### D-053 — Bài diễn tập Block Adam chấm bằng "quét chuỗi", KHÔNG chấm bằng "giao dịch có receipt"

`local-net/faucet/block-adam-drill.mjs` chấm đạt/hỏng bằng cách **quét chuỗi tìm block đầu
tiên có `timestamp` vượt mốc**, rồi hỏi block đó có đúng là block của giao dịch nghi lễ không.

**Lý do — có số đo, không phải cẩn thận suông.** Ca đối chứng ngược "hẹn sai giờ" (bắn sớm
12s) cho: hai giao dịch `status 1`, chuỗi đẻ ra 2 block, không lỗi ở đâu — **mà vẫn không có
Block Adam**. Một bài kiểm hỏi *"giao dịch có chốt không"* sẽ báo ĐẠT ở đúng ca hỏng. Mệnh đề
sẽ được khắc là mệnh đề về **chuỗi**, nên phép đo phải hỏi **chuỗi**.

### D-054 — Nghi lễ bắn ở `mốc + bù`, bù > 0; con số bù là THAM SỐ, không cắm cứng

Cờ `--offset-ms`, mặc định **0** (tức mặc định là hành vi *sai* đã đo được — cố ý, để ai chạy
mặc định thì gặp đúng cái bẫy trong môi trường tập chứ không phải ngày `09/09`).

**Lý do:** đo `27/08`, bắn tại giây `T` ⇒ `block.timestamp = T`, mà luật khắc đòi **vượt** mốc
(`> T`). Bù 0 làm luật khắc và hành động nghi lễ trỏ vào **hai block khác nhau**.

**Giả định phải bác được, và A1 KHÔNG tự chốt con số:** +3s đạt trên mạng tập **1 node dùng
chung đồng hồ với máy bắn**. Trên bộ 9 node, `block.timestamp` là đồng hồ của **node đề xuất
block**. ⇒ con số bù thật phải suy từ phép **đo lệch đồng hồ cả 9 node**, làm sau khi mạng
ngày G lên. Cắm +3s vào runbook bây giờ là chép một con số ra khỏi thang đo của nó.

### D-055 — Diễn tập chỉ phủ C-Chain; KHÔNG suy sang P-Chain

**Lý do:** khuyến nghị hiện tại là C-Chain (§4 `NGAY-G-A1-CON-LAI`) và bài đo đúng chuỗi đó.
Giao dịch nghi lễ trên P-Chain là **cơ chế khác hẳn** — export/import hoặc thao tác staking,
không phải một `eth_sendRawTransaction`. Viết sẵn cả hai rồi bỏ một là phí, mà suy từ chuỗi
này sang chuỗi kia là đúng lớp lỗi repo này cấm.
**Hệ quả:** David chọn P-Chain ⇒ **phải diễn tập lại**, và phải tính thời gian trước `09/09`.

### D-056 — Bộ xuất O2 giữ đúng khuôn `sha256sum`, và neo bằng một GỐC tách rời

`MANIFEST.txt` = `<sha256><2 khoảng trắng><đường dẫn>` (khuôn `sha256sum`), LF tường minh.
`GOC.txt` = `sha256` của chính `MANIFEST.txt` — **đó là con số duy nhất phải công bố**.

**Lý do khuôn chuẩn:** kiểm lại được bằng `sha256sum -c` mà **không cần tin bài xuất**. Một
bộ vật chứng chỉ kiểm được bằng chính công cụ sinh ra nó thì yếu — nó đòi người kiểm tin đúng
thứ đang cần chứng minh. Đã chạy cả hai đường `27/08`, khớp.

**Lý do có GỐC tách rời:** đối chứng ngược số 2 — sửa 1 byte **và sửa luôn manifest cho khớp**
— cho `10 tệp khớp · 0 lệch byte`. Chỉ GỐC bắt được. Và GỐC chỉ có tác dụng khi nó **nằm
ngoài** thư mục nó bảo vệ, nên quy trình bắt buộc bước "công bố" **trước** bước "xoá".

**LF tường minh vì:** repo chạy trên Windows; CRLF đổi hash **và** làm hỏng `sha256sum -c`.

### D-057 — Bộ xuất phải TỰ KHAI chỗ nó thiếu, và đếm cái ĐÃ XUẤT chứ không đếm cái ĐÃ XIN

`00-DOC-TRUOC.md` liệt kê: không khôi phục được mạng · không có LevelDB/Blockscout/khoá ·
số L1 dạng `xin N · XUẤT ĐƯỢC M` + cờ đỏ khi lệch · mọi lời gọi RPC hỏng · mọi chỗ bị
`--max-blocks` cắt.

**Lý do — có ca thật, không phải phòng xa.** Bản đầu đếm L1 bằng **số được xin**; chạy với một
`blockchainID` không tồn tại thì tờ đầu khai *"kèm 1 L1"* trong khi bộ xuất không có một byte
nào của nó. **Công cụ chống nói dối suýt nói dối ở đúng chỗ nó không được phép.**
Cùng họ với *"đường lui alias = xanh giả"* và với bài học H-6b (`git bundle verify` in "is
okay" cho một bundle clone ngược chết ngay).

### D-058 — G4 tra CẢ dải chainId của L1 người dùng, không chỉ `9000000009`

`scripts/check-chainid.mjs` tra **101 số**: `9000000009` + trọn dải `9100–9199`.

**Lý do:** kế hoạch (`NGAY-G-A1-CON-LAI` §7 điều 3, `HANDOFF` A-3) chỉ nêu `9000000009` — đó là
chainId **của A1**. Nhưng console còn **phát chainId cho người khác** (`9100+`), và đó cũng là
chainId EVM thật, cũng nằm trong ví người dùng, cũng bị EIP-155 buộc chữ ký vào.
Nhóm thứ hai **đông hơn và chạm người thật nhiều hơn**, mà không cổng nào canh.
**Đo ra ngay:** `9100` (số console cấp **đầu tiên**) trùng **Genesis Coin** trong sổ công khai.

### D-059 — Mã thoát của G4 phân biệt "bị chiếm" với "không tra được"

`1` = có chainId bị chiếm · `2` = **sổ không đáng tin, đừng kết luận gì**.

**Lý do:** luật cứng #1 của repo. Trang chặn bot, bản tải cắt cụt, lỗi CDN — tất cả trả **200**,
và khi đó *"9000000009 không thấy trong sổ"* đúng y hệt lúc sổ rỗng. Bài neo vào một mục **phải
có** (chainId 1 = Ethereum Mainnet) + ngưỡng số mục trước khi tin bất cứ kết luận nào.
**Đối chứng ngược:** sổ `[]` — JSON **hợp lệ hoàn hảo** — bị từ chối đúng, không ra "trống".
Gộp hai mã thoát làm một là mất đúng thông tin cần cho ngày G.

### D-060 — Giữ `chains.json` (1,1 MB) trong repo làm vật chứng, không chỉ giữ `sha256`

`docs/evidence/g4-2026-08-27/chains.json`.

**Lý do:** sổ đổi **hàng ngày**, nên chỉ giữ `sha256` là giữ một con số **không ai kiểm lại
được** — bản gốc để đối chiếu sẽ không còn tồn tại. Vật chứng cho một quyết định **khắc vĩnh
viễn** thì 1,1 MB một lần là rẻ, và nó làm lượt tra **tái lập được từng byte** (`--tep`).
**Đánh đổi:** repo phình. Chấp nhận; các lượt tra sau chỉ thêm khi có phát hiện mới.

### D-061 — "Lượt THẬT" = "lượt có khắc chữ"; KHÔNG thêm cờ khai báo thứ hai

Cổng chainId (`netgen/chainid.go`) suy trạng thái tập/thật từ `loadEngraving() != nil`.

**Lý do:** A1 đã có đúng **một** thứ chỉ xuất hiện ở lượt thật — chữ khắc, với cổng xác nhận
vân tay + đối chiếu C1. Bắt người vận hành khai lần thứ hai cùng một sự thật là đẻ ra chỗ để
**hai lời khai lệch nhau**, và lúc đó không cổng nào biết tin lời khai nào.
**Đánh đổi:** một lượt sinh mạng thật **không khắc chữ** sẽ bị coi là lượt tập ⇒ ăn cảnh báo.
Chấp nhận: theo kế hoạch ngày G, lượt thật **luôn** khắc chữ; và cảnh báo thừa rẻ hơn cổng câm.

### D-062 — chainId: lượt tập chỉ CẢNH BÁO, lượt thật thì CHẶN

**Lý do — bất đối xứng có chủ ý, không phải làm dở:**
- Chặn cứng lượt tập sẽ giết đường dev quen thuộc `gen-network.sh 5`, và đổi chainId mặc định
  của mạng dev là đổi cấu hình MetaMask/faucet/explorer của mọi người đang làm việc. Một cổng
  chặn mà không được gì chỉ tạo ra **thói quen đi vòng** (đúng lý lẽ của `canhBaoSelfBond`).
- Khắc chữ lên mạng mang chainId lạ là khắc **vĩnh viễn** một bản sắc sai — **không sửa được**,
  và không ai phát hiện cho tới khi có người thật thêm mạng vào ví.

⇒ **Cái sửa được thì cảnh báo. Cái không sửa được thì chặn.**

### D-063 — netgen LUÔN in `chainId`, kể cả khi nó đúng

**Lý do:** tới `27/08` netgen không in con số này ở đâu cả ⇒ **không lượt sinh mạng nào để lại
dấu vết về bản sắc nó vừa phát ra**. Im lặng ở đây là cách một mạng tập đi ra ngoài dưới tên
mạng thật mà không ai nhận ra — cùng lý lẽ đã dùng cho dòng `Chu khac: KHONG (ban tap)`.

### D-064 — Console chặn chainId đã bị chiếm bằng ẢNH CHỤP, không tra mạng lúc đẻ chain

`local-net/console/chainid-taken.json`, sinh bằng `check-chainid.mjs --gen-blocklist`.

**Lý do:** một lời gọi HTTP ra Internet nằm **giữa đường người dùng bấm nút** là thêm một chỗ
hỏng ngoài tầm kiểm soát — và hỏng lúc đó thì hoặc **chặn oan** một chain hợp lệ, hoặc **bỏ qua
trong im lặng**. Cả hai đều tệ hơn một ảnh chụp cũ vài tuần.
**Cái giá, đã trả bằng cách khai ra:** ảnh chụp cũ dần ⇒ tệp mang `ngayTra`, console **in tuổi
của nó** lúc khởi động và cảnh báo khi quá 90 ngày.
**Và thiếu tệp thì console KHÔNG chạy tiếp trong im lặng** — nó in `🔴 CỔNG ĐANG TẮT` kèm cách
sinh lại. Một cổng biến mất mà chương trình vẫn chạy như thường là đúng kiểu *"xanh giả"*, và
nó chỉ lộ ra khi có người thật nhận chainId trùng.

### D-065 — Sinh lại TOÀN BỘ patch series, không chỉ thêm patch mới

Lượt `27/08` regenerate cả 15 patch bằng `git format-patch --no-signature 1cf1fc3..9chain-a1`.

**Lý do:** 0013 và 0014 trên đĩa vẫn mang tiêu đề `[PATCH nn/12]` — tức chúng được **thêm vào**
chứ không sinh cùng bộ, nên bộ tự khai sai số lượng của chính mình. Nội dung không đổi (đã so
diff: chỉ đúng dòng `Subject` của 14 tệp), nhưng một bộ vật liệu tái lập mà **tự đếm sai** là
thứ người sau sẽ tin nhầm.
**Nghiệm thu:** 15 patch lên `1cf1fc3` → tree **`df68a7d7`**, khớp cây fork từng byte; đối chứng
ngược áp **14/15** → tree `4c5d5b1e` ≠ ⇒ phép đo phân biệt được bản đủ với bản thiếu.

### D-066 — Endpoint cung KHÔNG giả vờ mọi con số đều đo được: mỗi trường mang `source` riêng

`GET /api/supply` gắn cho từng trường một trong bốn nguồn: `measured` (kèm tên lệnh RPC) ·
`binary-constant` · `derived` (kèm công thức) · `genesis-parameter`.

**Lý do:** luật cứng của 9Scan-A1 là *"số công bố phải đọc từ chain thật"*, nhưng **tổng cung
9.000.000.000 không đọc được từ bất kỳ lệnh RPC nào** — `platform.getCurrentSupply` chỉ đếm X/P
(phát hiện P0, đã đo trên node đang chạy), và `SupplyCap` là hằng số biên dịch vào binary.
Một endpoint trả `totalSupply: 9000000000` rồi im lặng về xuất xứ sẽ **đúng số nhưng sai bản
chất**: nó dựng lên vẻ ngoài *"đọc từ chain"* cho một **phép cộng** của hằng số binary với một
số đo được. Khai nguồn ra là cách duy nhất vừa phục vụ được luật đó vừa không nói dối nó.

**Hệ quả tốt ngoài dự tính:** phát hiện P0 nay nằm **ngay trong phản hồi** — hai con số đứng
cạnh nhau kèm câu *"cái này không đếm cái kia"* — thay vì nằm trong một tài liệu ai đó phải nhớ.

### D-067 — `cung.json` là BẢN KHAI, không phải nguồn sự thật; endpoint phải tự đo rồi SO LẠI

**Lý do:** một endpoint đọc tệp JSON rồi in lại thì **vẫn chỉ là gõ hằng số vào giao diện**,
chỉ khác là hằng số nay đi qua một tệp. Nên `cung.json` chỉ nói *"đo cái gì, ở đâu"*; endpoint
đo `eth_getBalance` từng địa chỉ ở **block 0** và trả `manifestMatchesChain` + `mismatches`.
**Và `totalSupply` suy từ số ĐO ĐƯỢC, không từ số khai** ⇒ sửa `cung.json` không đẩy được con
số công bố lên, chỉ làm cổng đỏ. Đã đối chứng ngược: sửa bản khai ⇒ nêu đích danh địa chỉ lệch,
`totalSupply` vẫn đúng.

⚠️ Đo ở **block 0**, không phải `latest`: ta hỏi *"genesis đã phát hành bao nhiêu"*, không hỏi
*"bây giờ còn bao nhiêu"*. Hai câu khác nhau ngay khi có người tiêu tiền, và trộn chúng là cách
một trang tokenomics từ từ thành một trang số dư ví.

### D-068 — Thiếu bản khai ⇒ `/api/supply` trả **503**, KHÔNG dùng số mặc định

**Lý do:** đường dễ hơn là *"thiếu tệp thì lấy hằng số dự phòng"*. **Một endpoint cung trả về
số bịa còn tệ hơn một endpoint không trả gì** — số bịa sẽ được chép đi, và không ai biết nó
không phải số đo. Hỏng **có phạm vi**: `/api/info` và `/api/drip` vẫn chạy bình thường, đã đối
chứng.

### D-069 — **Gốc dải chainId cho L1 người dùng: `9100` → `9000000010`**

**David chốt `2026-08-27`** (đóng B-14). Console tự cấp chainId bắt đầu từ **`9000000010`** =
chainId của A1 (`9000000009`) **+ 1**. `local-net/lib/chainid.mjs`.

**Vì sao dải cũ phải bỏ:** tra sổ công khai `27/08` cho thấy **`9100` = Genesis Coin** — số
console cấp **ĐẦU TIÊN** trùng một chuỗi có thật, và điều đó **đã xảy ra rồi** (chain
`OwnerTest` nhận 9100 hai lần). Trong 100 số đầu của dải cũ còn `9108` · `9134` · `9170`.

**Vì sao gốc mới tốt hơn cả ba đường A1 đề xuất** (9146 / 9100 / "dải khác"):

| | |
|---|---|
| **Vùng trống** | đo trên sổ `27/08` (2.725 mục): **không một chuỗi nào trong bán kính 10 triệu** quanh 9000000009. Dải cũ có 4/100 số đầu đã có chủ |
| **Bản sắc** | mọi chain thuộc A1 cùng mở đầu `9000000…` |
| **Trần EIP-2294** | `2^53-1` = 9.007.199.254.740.991 ⇒ còn **9.007.190.254.740.981** số trống trên gốc dải |

🔴 **Cái được lớn nhất, và nó KHÔNG nằm trong câu hỏi ban đầu:** dải cũ `9100–9145` từ nay
**không bao giờ được tự cấp lại**, nên ví của người từng dùng L1 cũ không thể lặng lẽ trỏ vào
L1 của người mới. Lỗ phát lại mà §5c định vá **bằng sổ** nay được đóng **bằng kiến trúc**.

⚠️ **Đừng đọc thành "§5c đã đóng".** Chỉ đóng **nửa `chainId`, và chỉ đường TỰ CẤP**:
- người dùng vẫn **tự nhập** được `9102` — chặn nó vẫn dựa vào `state.retired`;
- trùng **TÊN** thì hoàn toàn không đụng tới (`createChain` kiểm tên trên `chains ∪ retired`).

⚠️ **Đánh đổi đã biết, có chủ ý:** `9000000010` và `9000000009` khác nhau **đúng một chữ số
cuối** ⇒ người ĐỌC dễ lẫn. Ví thì không lẫn (EIP-155 buộc chữ ký vào đúng số). Hư hại tối đa
là nối nhầm mạng và thấy số dư lạ — **không** mất tiền, **không** phát lại được chữ ký.

**Nghiệm thu:** `local-net/console/chainid-test.mjs` — **13 đạt / 0 hỏng**, bài `import` mã
thật (`lib/chainid.mjs`) và đọc danh sách chặn thật, **không chép công thức**. Bốn ca đối
chứng ngược trên `check-chainid.mjs` đỏ đúng chỗ (`--add 9100` · `--add 1` · sổ cắt cụt ·
danh sách chặn rỗng).

### D-069b — Danh sách chặn giữ **CẢ dải cũ** `9100–9999`, cố ý

Sinh mặc định trên **hai dải**: `9100–9999` + `9000000010–9000009999`.

**Lý do 1 — vẫn cần thật:** người dùng tự nhập được số trong dải cũ.
**Lý do 2, đắt hơn:** dải mới **trống hoàn toàn** ⇒ sinh riêng nó ra tệp `daBiChiem: []`. Một
danh sách chặn **RỖNG không phân biệt được với một bộ sinh HỎNG** — cả hai cho ra cùng một
tệp, và console nạp xong in "0 số" ở cả hai trường hợp. Giữ dải cũ cho tệp một **nội dung
khác rỗng đã biết trước** (51 số, trong đó `9100 = Genesis Coin` làm neo) ⇒ **tệp rỗng từ nay
là tín hiệu HỎNG**, không phải trạng thái bình thường.

⇒ Kèm hai cổng: bộ sinh **từ chối ghi** tệp rỗng (exit 2); console **kêu to** nếu nạp phải
danh sách rỗng. Đã đối chứng ngược cả hai.

### D-069c — `check-chainid.mjs` bỏ dải cũ khỏi `CAN_TRA`, KHÔNG phải vì nó sạch

`CAN_TRA` nay là `9000000009` + `9000000010–9000000109`. Dải cũ ra ngoài **dù nó có 4 số bị
chiếm thật**.

**Lý do:** `CAN_TRA` mang nghĩa *"số A1 định dùng — bị chiếm là ĐỎ"*. Sau D-069 console không
cấp trong dải đó nữa, nên để lại là làm bài **luôn luôn đỏ**, mà **một cổng đỏ vĩnh viễn là
một cổng không ai còn đọc**. Dải cũ đổi vai sang **danh sách chặn**: thông tin, không phải
báo động. Trước lượt này bài thoát `1` ở mọi lần chạy bình thường; nay thoát `0`, tức mã
thoát lấy lại được nghĩa cho ngày G.

### D-070 — **Block Adam neo vào HASH GIAO DỊCH NGHI LỄ**, không vào "block đầu tiên vượt mốc"

**David chốt `2026-08-27`** (đóng B-13(a)).

**Lý do:** luật cũ — *"block **đầu tiên** vượt `2026-09-09T06:09:09Z`"* — là mệnh đề về
**TOÀN CHUỖI**, mà nghi lễ chỉ điều khiển được **giao dịch của mình**. Ai gửi một giao dịch
vào khoảng giữa mốc và lúc ta bắn là **chiếm mất ô đó, không giành lại được** — và thứ đã
khắc thì vĩnh viễn. Hash giao dịch là thứ nghi lễ **cầm được**.

**Hệ quả lên bài diễn tập** (`local-net/faucet/block-adam-drill.mjs`):

| | trước | sau |
|---|---|---|
| ô mạnh nhất | "block đầu tiên vượt mốc CHÍNH LÀ block của Adam" | 🔴 **"đưa hash cho chuỗi, chuỗi trả lại đúng giao dịch đó"** |
| ô cũ | ✓/✗ | **⚠️ lưu ý** — không tính đạt/hỏng |

🔴 **Neo phải nghiệm thu bằng đường NGƯỢC.** Đọc `rcAdam.hash` từ biến trong tay mình rồi
khai *"neo đọc được"* là **tự hỏi chính mình**. Bài nay đưa hash cho chuỗi và bắt chuỗi trả
lại giao dịch. Cùng lớp lỗi với bộ xuất O2 khai *"kèm 1 L1"* khi không có byte nào (D-057).

**Vì sao ô cũ xuống hạng chứ không bị xoá:** xoá là mất luôn phép đo độ lệch đồng hồ mà
B-13(b) cần; giữ ở hạng ✗ là để bài **báo đỏ ở một lượt không có gì sai**, mà một cổng kêu
oan là một cổng sẽ bị bỏ qua đúng lúc nó kêu thật.

**Nghiệm thu — chạy thật trên mạng tập `27/08`** (`a1-drill`, cổng 9750, chainId 9000000009):

| lượt | kết quả |
|---|---|
| `--offset-ms 3000` | **10 đạt · 0 hỏng · 2 lưu ý (0 không đạt)** |
| 🔴 `--offset-ms 0` — **ca mà bản cũ chấm ✗** | **10 đạt · 0 hỏng · 2 lưu ý (2 KHÔNG đạt)**, exit 0. Block đầu tiên vượt mốc là của **Eva `#4`**, Adam ở `#3` — neo vẫn trỏ đúng `#3` |
| `--no-send` (đối chứng ngược gốc) | 2 đạt · 0 hỏng, exit 0 |

Vật chứng: `docs/evidence/block-adam-anchor-2026-08-27.json` + `…-bu0-2026-08-27.json`.

🔴 **D-070 HẠ MỨC B-13(b), KHÔNG ĐÓNG NÓ.** Bù `--offset-ms` thôi quyết định *"neo đúng hay sai"*,
nhưng nếu bản khắc còn **CÂU CHỮ** khẳng định block vượt mốc `2026-09-09T06:09:09Z` thì câu đó
vẫn phải đúng, và nó vẫn phụ thuộc đồng hồ của **node đề xuất block**. ⇒ vẫn phải đo lệch
đồng hồ 9 node **sau khi mạng ngày G lên**. Câu chữ chốt cùng lượt C1 đóng băng byte.

⚠️ **Nếu David đổi sang P-Chain thì phải diễn tập lại** — D-055 không đổi.

### D-071 — 9 validator mang `restart: unless-stopped`, KHÔNG phải `always`

**David duyệt `2026-08-27`** (P0-1 của `FULL-REVIEW-2026-08-27.md`). Đã áp trên mạng công
khai: `9/9` từ `no` → `unless-stopped`, container **không bị restart**.

**Vì sao trước đó là `no`:** không ai chọn nó. `netgen` sinh `docker-compose.multinode.yml` mà
**không bao giờ ghi khoá `restart:`** ⇒ Docker lấy mặc định. Hệ quả: máy chủ reboot thì Caddy,
trang web, faucet và **Blockscout** đều dậy, còn **9 validator nằm im** — trạng thái mà mọi dấu
hiệu bên ngoài vẫn xanh.

**Vì sao `unless-stopped` chứ không `always`:**
- khớp quy ước Caddy/faucet/web đang dùng trên chính máy đó;
- **không cãi lại rolling-restart của M2** — `docker stop` tường minh vẫn giữ nguyên trạng thái
  dừng, tức người vận hành vẫn hạ được một node để bảo trì mà nó không tự bật lên.

🔴 **VÀ NÓ NGƯỢC LẠI LÀ MỘT CÁI BẪY VẬN HÀNH.** Chính vế "tôn trọng lệnh dừng" làm cho
`docker kill` **không** kích hoạt chính sách: cả `stop` lẫn `kill` đều là *người dùng chủ động
dừng*. Phép kiểm đầu tiên của phiên này dùng `docker kill` ⇒ node không dậy ⇒ **suýt kết luận
sai rằng bản vá không ăn**. Cùng lớp lỗi với *"phép kiểm đo sai đại lượng"* đã ghi trong
HANDOFF, lần này do chính người kiểm gây ra.

⇒ **Muốn dừng hẳn một node: `docker stop`. Muốn thử chính sách: để tiến trình TỰ CHẾT.**

**Nghiệm thu (container nháp, không đụng validator):**

| Ca | Cấu hình | Kết quả |
|---|---|---|
| A | `unless-stopped` + tiến trình `exit 1` | **1 → 3 lần restart · running** ✓ |
| B 🔴 **đối chứng ngược** | `restart=no` + cùng tiến trình | **0 lần restart · exited** ✓ |

Ca B tái hiện **đúng trạng thái 9 validator trước bản vá**, nên phép đo phân biệt được hai
trạng thái chứ không chỉ biết in ✓.

⚠️ **Vế "reboot máy chủ" CHƯA chứng minh được trên máy này.** Mọi container đều dựng `26/08`
(sau re-genesis) còn máy boot `24/08` ⇒ không lượt nào đi qua một lần boot. Vế đó đứng ở mức
*"hành vi Docker đã biết + `systemctl is-enabled docker` = enabled"*. Phép kiểm kết luận duy
nhất là reboot thật — **không làm trên mạng công khai đang phục vụ người ngoài**.

🔴 **Bản vá này là TẠM cho tới ngày G.** Nó nằm trên container đang chạy, không nằm trong nguồn.
Lượt `down -v` ngày G dựng container mới từ compose do netgen sinh ⇒ **mất sạch**, quay về `no`,
không dấu hiệu nào. Cùng lớp lỗi với B-6 (*"vá thẳng trên server mà không vào nguồn là quả mìn
hẹn giờ tới lượt deploy sau"*) — nên bản vá netgen **phải lên cùng lượt ngày G**, không để sau.

### D-071b — Bản vá `restart:` PHẢI vào netgen, không dừng ở `docker update`

`docker update --restart=unless-stopped` áp `27/08` là **bản vá tạm**, nằm trên container đang
chạy chứ không nằm trong nguồn.

🔴 **Lượt `down -v` ngày G dựng container MỚI từ compose do netgen sinh ⇒ bản vá biến mất, quay
về `no`, không dấu hiệu nào.** Đó đúng là bài học đã trả giá hai lần trong dự án này (B-5 thư
mục `blockscout/` bị gitignore · B-6 site block Caddy chưa vào nguồn): *"vá thẳng trên server mà
không vào nguồn thì không phải đã sửa — nó là quả mìn hẹn giờ tới lượt deploy sau."*

Và lần này quả mìn nổ vào **đúng ngày G**, lúc không ai còn để ý tới cấu hình Docker.

**Đã làm cùng ngày:** `netgen/main.go` ghi `restart: unless-stopped` cho mọi node, kèm khối chú
thích mang theo cả phép đo lẫn cái bẫy `docker kill`.

**Nghiệm thu — sinh lại CẢ BỘ patch (luật cứng #3):**

| | |
|---|---|
| `go vet` + `go build` | sạch (`golang:1.25.10`) |
| netgen N=3 | compose sinh ra có **3/3** dòng `restart: unless-stopped` |
| Bộ patch | **17 patch**, tiêu đề `01/17`…`17/17` ⇒ **D-065 đã hết**, không còn `[PATCH nn/12]` lạc |
| Tái lập | `git am --keep-cr` 17 patch lên `1cf1fc3` → tree **`f8458b33f2b18c53d01959d0d77ca8568241181b`**, khớp cây fork từng byte |
| 🔴 **Đối chứng ngược** | áp **16/17** → tree **`c9226d9c`** = **đúng tree cũ HANDOFF ghi** |

⚠️ Ca đối chứng ngược ở đây mạnh hơn thường lệ vì nó chứng minh **hai** mệnh đề bằng một phép
đo: phép so tree *phân biệt được* bản đủ với bản thiếu, **và** lượt sinh lại **không âm thầm đổi
gì** ở 16 patch cũ — thứ mà một lượt `format-patch` toàn bộ rất dễ làm hỏng mà không ai thấy.

⚠️ **B-9 vẫn chưa quyết** (`#e84142` trong `patches/0003`). Nếu David chốt sửa thì phải sinh lại
bộ patch **một lần nữa**. Đã cân nhắc chờ để gộp; không chờ vì bản vá `restart:` là **bắt buộc
cho ngày G** còn B-9 thì không, và để bản vá tạm sống một mình qua ngày G là đúng cái bẫy D-071b
nói tới.

### D-072 — O2 đã chạy THẬT trên mạng công khai; `GỐC` neo một THỜI ĐIỂM, không neo một chuỗi

Lượt O2 đầu tiên trên mạng công khai, `2026-08-27`. Vật chứng:
`docs/evidence/o2-public-network-2026-08-27/`.

| | |
|---|--:|
| **Thời gian thật** | **37–54 giây** (3 lượt đo; biến thiên do độ trễ mạng) |
| Quy mô | P-Chain 68 block · X-Chain 3 · C-Chain 5 · 9 tệp · 121.771 byte |
| 🔴 **`GỐC` công bố** | **`a22dfc55d7bf57725f07567f1546568a437d3be19d8c71806706573777f43b23`** |

**Con số đó chính là "công bố"** — nó nằm ở đây, trong `DECISIONS.md`, **ngoài** thư mục nó
bảo vệ. Để nó nằm cạnh dữ liệu thì nó không bảo vệ gì cả.

⇒ **Runbook ngày G:** O2 tốn ~1 phút cho một mạng cỡ này. Không có lý do gì để bỏ qua nó lần
nữa (lượt `26/08` đã bỏ lỡ, và câu hỏi *"20M/70M có thật trên chain cũ không"* vĩnh viễn không
trả lời được vì thế).
⚠️ Thời gian **tỉ lệ thuận với số block** — bài lấy từng block một. Mạng ngày G nếu có nhiều
giao dịch hơn thì phải đo lại, đừng chép con số 53s sang thang khác.

#### 🔴 Phát hiện: hai lượt xuất cùng một mạng KHÔNG BAO GIỜ ra cùng `GỐC`

Đo được, không suy: hai lượt cách nhau vài phút, **mạng không đẻ thêm block nào**, vẫn ra hai
`GỐC` khác nhau. Khác nhau **duy nhất** ở `p-chain/tip.json`, và trong đó **duy nhất** ở trường
`uptime` của validator — `99.8756` → `99.8758`.

`uptime` trôi liên tục, và sâu hơn: **nó không phải thuộc tính của chuỗi.** Nó là ý kiến của
**node đang được hỏi** về peer của nó, nên hỏi node khác ra số khác.

**Giữ nó lại là CỐ Ý** — đó là dữ liệu pháp y (*mạng lúc chết có khoẻ không*). Nhưng cái giá là
bộ xuất **không tái lập được**, và điều đó phải được **khai ra** chứ không để người sau tự vấp:

| `GỐC` chứng minh | `GỐC` KHÔNG chứng minh |
|---|---|
| *"đây đúng là bộ byte tôi lấy lúc T"* | *"chuỗi lúc đó là thế này, ai xuất cũng ra thế"* |
| chống sửa đổi **sau** khi xuất | hai người xuất cùng lúc ra hai `GỐC`, **cả hai đều đúng** |

🔴 ⇒ **Thấy hai `GỐC` lệch thì ĐỪNG kết luận có người sửa.** So từng tệp trước; chỉ lệch ở
`tip.json` là bình thường. Đã ghi thành chữ ở **hai** chỗ: đầu `export-chain.mjs` và trong
`00-DOC-TRUOC.md` mà chính bộ xuất sinh ra — chỗ thứ hai quan trọng hơn, vì người kiểm lại bộ
xuất ba năm nữa sẽ đọc tệp đó chứ không mở mã nguồn.

#### Nghiệm thu — 4 ca, 2 ca đối chứng ngược

| # | Ca | Kết quả |
|---|---|---|
| 1 | `--check` bản lành | **9 tệp khớp · 0 lệch · gốc khớp** · exit 0 |
| 2 | `sha256sum -c MANIFEST.txt` — **công cụ chuẩn, không cần tin bài này** | tất cả `OK` · exit 0 |
| 3 | 🔴 sửa **đúng một byte** trong `c-chain/blocks.jsonl` | **1 lệch byte** · exit 1 |
| 4 | 🔴 **sửa cả `MANIFEST` để che ca 3** | *"9 tệp khớp · 0 lệch byte · **gốc LỆCH**"* · exit 1 |

⚠️ Ca 4 là ca đắt nhất và là **lý do `GOC.txt` tồn tại**: kẻ sửa dữ liệu rồi sửa luôn bản kê để
che vẫn bị bắt — **miễn là con số gốc đã được công bố ra ngoài**. Nếu `GỐC` chỉ nằm trong thư
mục đó thì ca 4 **đi lọt sạch**.

⚠️ Bộ xuất khai `L1 người dùng: xin 0 · XUẤT ĐƯỢC 0` — đúng (0 L1 đang sống). Ngày G nếu có L1
thì **bắt buộc** dùng `--add-evm`, không thì chúng biến mất không dấu vết (D-057).

### D-073 — Header chống nhúng là snippet RIÊNG, KHÔNG nhét vào `(secheaders)`

**Đã deploy `2026-08-27`** (P2-1 của bản soát vận hành). `a1.9chain.org` và
`testnet-a1.9chain.org` nay gửi `Content-Security-Policy: frame-ancestors 'self'` +
`X-Frame-Options: SAMEORIGIN`.

**Vì sao cần ở đúng site này**, chứ không phải *"site nào cũng nên có"*: `/console/` đăng
nhập bằng **chữ ký ví** và đẻ ra L1 thật. Nhúng nó trong iframe trong suốt rồi phủ nút mồi
thì người dùng ký mà tưởng bấm thứ khác — chữ ký đó không rút lại được.

🔴 **Vì sao KHÔNG dùng `(secheaders)` — suýt làm site của đội khác KÉM AN TOÀN ĐI.**
Bản vá đầu đặt hai dòng đó vào `(secheaders)`, mà snippet ấy được import bởi **cả bốn** tên
miền, trong đó hai là của **9Scan**. Đo trước khi deploy:

```
a1.9scan.org → content-security-policy: frame-ancestors 'none'; base-uri 'none';
                                        form-action 'self'; object-src 'none'
               x-frame-options: DENY
```

**Chính sách của họ CHẶT HƠN của ta.** Áp thêm ở tầng Caddy thì hoặc **nới lỏng** nó, hoặc đẻ
ra header **trùng lặp** — mà hai `X-Frame-Options` lệch nhau khiến trình duyệt **bỏ qua cả
hai**. Cả hai kết cục đều là làm site người khác kém an toàn đi, **nhân danh một bản vá bảo
mật**.

⇒ Snippet `(chongnhung)` riêng, chỉ import ở hai tên miền `9chain.org`.

**Nghiệm thu — đo từ ngoài, không tin lời kịch bản deploy:**

| | |
|---|---|
| `a1.9chain.org` | `frame-ancestors 'self'` + `SAMEORIGIN` ✓ **mới** |
| `a1.9scan.org` | **đúng 1** dòng `x-frame-options`, vẫn `DENY`, CSP của họ **nguyên vẹn** ✓ |

### D-074 — RPC: `defer` + gỡ tường minh `Allow-Credentials`; Caddy phải THẬT SỰ cầm lái

Đo `27/08` trên cùng một URL: `OPTIONS` (Caddy tự trả 204) ra đúng 3 header khai trong
Caddyfile; `POST` (qua `reverse_proxy`) ra 3 header đó **+ `Access-Control-Allow-Credentials:
true` + `Vary: Origin`** — **hai cái thêm không có ở đâu trong Caddyfile**, chúng của chính
avalanchego. Tức ở đường POST, thứ tới trình duyệt là header của **node**.

Cùng bẫy đã trả giá với `.webmanifest`: `header` không `defer` ghi **trước** khi `reverse_proxy`
chạy. Và `Allow-Origin: *` + `Allow-Credentials: true` là tổ hợp **trình duyệt từ chối** theo
đặc tả ⇒ dapp gửi kèm credential sẽ hỏng mà không ai hiểu vì sao.

🔴 **`defer` một mình KHÔNG đủ** — nó làm ta *ghi sau*, nó **không tự xoá** thứ upstream đã
thêm. Phải có dòng `-Access-Control-Allow-Credentials`.

**Sau deploy:** `allow-credentials` **biến mất**; `eth_chainId` vẫn trả `0x218711a09`; preflight
vẫn 204.

### D-075 — `caddy-deploy.sh` TỪ CHỐI bản mới ít dòng cấu hình hơn bản đang chạy

Cổng mới. Đếm **dòng không-phải-chú-thích**; giảm ≥ 10 ⇒ **chặn**, giảm ít ⇒ cảnh báo, gỡ thật
thì `A1_CHO_PHEP_TEO=1`.

**Vì sao:** bài học B-6 (deploy xoá site block của 9Scan ⇒ explorer 525 trong 31 phút) **suýt
lặp lại y hệt hôm nay**. Caddyfile **đang chạy** đến từ nhánh `web-home` — trang 404 thương
hiệu, `Cache-Control: no-cache` cho HTML, `handle /api/*` — còn bản vá bảo mật nằm ở `main`.
Deploy thẳng từ `main` sẽ xoá sạch chúng. Bắt được nhờ **so tay trước khi deploy**, nhưng
*"nhờ nhớ so tay"* không phải một cổng.

⚠️ **Đo bằng số dòng đặc, không bằng `diff` hay số byte:** tệp này 2/3 là chú thích và chú
thích đổi liên tục, nên một cổng dựa trên `diff` sẽ kêu mọi lượt và **bị bỏ qua ngay tuần
đầu**. Số dòng không-chú-thích chỉ tụt khi có **cấu hình thật** biến mất.

⚠️ **Cảnh báo khi giảm ít, chặn khi giảm nhiều — cố ý**, cùng lý lẽ với `canhBaoSelfBond` và
cổng chainId: chặn cứng một đường hợp lệ chỉ đẻ ra thói quen đi vòng.

**🔴 Nghiệm thu: đã bắn ĐÚNG CA SUÝT XẢY RA vào cổng, trên server thật.**

| | |
|---|---|
| Đẩy bản `main` lên (ca thật) | `253 → 185` dòng · **✗ ít hơn 68 dòng — DỪNG** · exit 1 |
| Bản đang chạy sau đó | vân tay `61640093…` **không đổi** |
| `Caddyfile.new` | **còn nguyên** — cổng dừng **trước** khi xoá bằng chứng |
| Site | `a1.9chain.org` 200 · `a1.9scan.org` 200 |

⚠️ **Còn một chỗ hở mà cổng này KHÔNG bịt:** Caddyfile sống ở **hai nhánh**, và bản đang chạy
đến từ `web-home`. Cổng chỉ chặn hậu quả, không chữa nguyên nhân. Nguyên nhân là **hạ tầng dùng
chung không có một nhà duy nhất** — việc đó cần David quyết (gộp `web-home` vào `main`, hay tách
Caddyfile ra khỏi cả hai).

---

### D-076 — **Bộ định danh cho mạng ngày G: `networkID 999999999` · `chainId 9000000009` · dải L1 `9000000010–9999999999`**

**David chốt `2026-08-27`.** Thay phần trần dải của D-069 (sàn `9000000010` **giữ nguyên**).

| | Chốt | Trước |
|---|---|---|
| `networkID` (Avalanche, uint32) | **`999999999`** | `9001` |
| `chainId` chain mẹ (EVM) | **`9000000009`** — chốt cứng MỌI thế hệ | (giữ, D-047) |
| dải `chainId` L1 | **`9000000010` – `9999999999`** | trần `9000009999` |

#### Vì sao đổi `networkID` — không phải thẩm mỹ

netgen **ép mọi mạng nó sinh dùng chung `9001`** (`netgen/main.go:126`, exit 1 nếu khác): mạng dev,
`net-drill9`, `net-bak`, mạng công khai, **và mạng sau ngày G**. Mà:

- bắt tay P2P **CHỈ kiểm `networkID`** — đọc hết hàm xử lý `Handshake`, `network/peer/peer.go:825`,
  **không có bước nào so genesis**;
- P-Chain mang **cùng** `blockchainID` = `ids.Empty` trên **mọi** mạng Avalanche
  (`utils/constants/network_ids.go:88`);
- bootstrap IP không đổi qua các thế hệ (cùng VPS).

⇒ **node của mạng A1 CŨ bắt tay được node của mạng A1 MỚI, và node dev bắt tay được mạng công
khai.** `networkID` nằm trong genesis ⇒ **chỉ đổi được vào lượt re-genesis; ngày G là cửa duy nhất.**

🔴 **`uint32` (trần 4.294.967.295) ⇒ KHÔNG thể dùng `9000000009` làm `networkID`.** Số 9 chữ số
toàn 9 là trần thực tế của mọi phương án mang bản sắc 9.

#### Vì sao trần dải L1 nới từ `9000009999` lên `9999999999`

D-069 chọn trần cho một console có **trần 16 L1** (giới hạn P2P: node khai quá 16 subnet bị cắt
kết nối). Nhưng trần 16 là **kiến trúc hiện tại**, sẽ mất khi có tập validator riêng cho từng L1
(ACP-77) — và **bó hẹp dải số là cửa MỘT CHIỀU** (số đã cấp cho một L1 thì không đổi, không thu
hồi được), trong khi **nới rộng thì miễn phí, nhưng chỉ miễn phí lúc chưa cấp số nào.**

#### Ba tính chất an toàn tự có — đừng phá khi refactor

- `networkID` **9 chữ số** vs `chainId` L1 **10 chữ số** ⇒ không nhìn nhầm nhau.
- `999999999` nằm **dưới sàn** dải L1 (`9000000010`) ⇒ chép nhầm sang ô `chainId` **rơi ngoài dải
  A1 đã khai**, cổng console bắt được.
- **Toàn bộ** dải L1 (`≥ 9.000.000.010`) **vượt trần uint32** ⇒ chép nhầm chiều ngược lại thì node
  **không khởi động được**. Không số nào trong dải lọt qua được cả hai ô.

#### Phép đo — `chainid.network`, `2026-08-27T13:11:47Z`

`2726 mục · 1.162.288 byte · sha256 7a122fb15423a595324f6a95d82077adacaef89c8492036bdb88707b9cd493ff`

| | |
|---|---|
| Sổ qua phép kiểm **lành** | neo `chainId 1` = "Ethereum Mainnet" · `43114` = "Avalanche C-Chain" |
| Đối chứng ngược | `1` và `43114` **ĐỎ đúng chỗ** |
| `9000000009` | ✓ trống |
| **`9000000010`–`9999999999`** | ✓ **TRỐNG HOÀN TOÀN — 0/2726** |
| Hàng xóm gần nhất dưới sàn | `8.691.942.025` (ONFA Chain Testnet) — cách **308 triệu** |
| Hàng xóm gần nhất trên trần | `11.297.108.099` (Palm Testnet) — cách **1,3 tỷ** |
| ±10 triệu quanh chain mẹ | ✓ trống — tái lập phép đo G4 `27/08`, **vẫn đúng hôm nay** |
| `LOVE9` · `9Chain` · `9Scan` | ✓ không chuỗi nào dùng tên/ký hiệu này |

**Vật chứng:** `docs/evidence/g4-2026-08-27-c-new-range/` — `chains.json` + `LOOKUP-RESULT.json` (kèm bảng 10 khối thế hệ).
⚠️ **Luật cũ giữ nguyên: tra LẠI ngay trước bước sinh genesis `01/09`, với dải mới.**

#### `999999999` trùng Zora Sepolia ở thang `chainId` — và vì sao vẫn chốt

Sổ ghi `999999999` = **Zora Sepolia Testnet** (cả `chainId` lẫn trường `networkId`).
**Không phải va chạm kỹ thuật.** Đo trên mạng thật: C-Chain A1 trả `net_version` = **`9000000009`**,
không phải `9001` ⇒ `networkID` của Avalanche **không rò ra bất kỳ ví hay công cụ EVM nào**.

⚠️ Nhưng *vai trò* của `networkId` (devp2p) và `networkID` (avalanchego) là **giống hệt** — cùng là
"số tách mạng ở tầng P2P", chỉ khác là hai hệ sinh thái giữ và **không có sổ chung**. Nói "khác
namespace nên vô hại" là nói nhẹ hơn thực tế.

⇒ Đường phơi bày duy nhất là **chữ trong footer**. Điều kiện kèm theo của D-076:
**footer không được in `networkID` như một thông số ngang hàng để chép**
(`web/lib/chain.ts:23` · `web/components/SiteFooter.tsx:15`).

#### Bối cảnh: `networkID` ≠ `chainId`, và vì sao chuỗi khác dùng chung một số

| | Avalanche `networkID` | EVM `chainId` |
|---|---|---|
| Tầng | node / P2P | máy ảo EVM |
| Phạm vi | **cả MẠNG** — P + X + C + mọi L1 dùng **một** giá trị | **một CHUỖI** |
| Kiểu | `uint32` | ≤ `2⁵³−1` (EIP-2294) |
| Việc | cắt bắt tay giữa node khác mạng | buộc chữ ký vào chuỗi (EIP-155) |
| Sổ đăng ký | **không tồn tại** | `chainid.network` |

Tỷ lệ **1 : N** là điểm cốt lõi — A1 có **một** `networkID` phủ **nhiều** `chainId`, nên hai đại
lượng **buộc phải khác nhau**. Gần như mọi chuỗi EVM là *một chuỗi = một mạng* nên đặt chúng bằng
nhau (**2.678/2.726 = 98,2%** trong sổ). 1,8% lệch nhau gồm đúng hai nhóm: tàn dư chia tách DAO
(Ethereum Classic `61`/`1`, Callisto, Expanse) — **và fork avalanchego**: **Camino C-Chain
`chainId 500` / `networkId 1000`**, Columbus Testnet `501`/`1001`. **A1 nằm đúng nhóm mà cấu trúc
bắt buộc phải lệch, không đi lệch chuẩn.**

#### Còn mở — chờ David, đừng đoán thay

- **(a) Có chia dải L1 thành KHỐI THẾ HỆ không** (chữ số thứ 2 = thế hệ: thế hệ 0 =
  `9.000.000.010–9.099.999.999` … thế hệ 9 = `9.900.000.000–9.999.999.999`; **đã tra cả 10 khối,
  trống**). Không chia ⇒ sau lần re-genesis sau, L1 đầu tiên **lại nhận `9000000010`**, trùng số
  với một L1 của thế hệ trước, và bảo đảm "không cấp lại" khi đó **treo lên `console-chains.json`
  (cả mục `retired`) phải sống sót qua mọi lần sinh lại mạng** — tức nó thành tài sản ngang hàng
  khoá quỹ và phải vào quy trình O2.
- **(b) Tên mạng cụ thể** (`9chain-a1-g0`?) — `A1Name` đi vào **đường dẫn DB** (D-050).
- **(c) Có làm khối `networkID` riêng cho MẠNG TẬP không.** Nếu có ⇒ `genesis/params.go` **phải**
  chuyển từ `case A1NetworkID` sang kiểm **theo DẢI**: networkID lạ rơi vào `default:` là mượn
  `LocalParams` (trần cung 720 triệu) ⇒ **tràn ngược uint64** — đúng bẫy patch 0013 dựng ra để chặn.

### D-077 — Neo tự kiểm của `cb58.mjs`: C-Chain → **P-Chain**. Và neo mới MẠNH hơn, không chỉ bền hơn

Sinh từ bản chuyển giao của phiên phân tích `9chain-a1-eb`; **A1 đo lại trước khi vá**, không nhận
kết luận suông.

**Bản cũ cắm cứng** `2s5pikvmRzazmG22kBDvvVsz9HtB8pt3DfsvUvAW6LsyQT2mTt` kèm chú thích *"cố định
vĩnh viễn"*. **Cả hai vế đều sai:**

| | |
|---|---|
| Số đó đã chết | Đo `27/08` trên mạng công khai: `info.getBlockchainID{alias:"C"}` = **`JPWKwpGCwSQpXNy8HUb1TFcGh57MY7B6vC7K6mzLGLpBCX4Zx`**. Số cũ chết từ re-genesis `26/08` |
| Bài vẫn xanh | `--self-test` **8/8 ĐẠT** suốt thời gian đó |

🔴 **Vì sao nó xanh trong khi neo đã chết:** ca đó chỉ kiểm **checksum của chính chuỗi được cắm
vào**, không đối chiếu mạng nào. **Một hằng số SAI vẫn có checksum ĐÚNG** — nên bài xanh mãi mãi.

**Vì sao mô hình *"cố định vĩnh viễn"* sai từ gốc:** C-Chain ID = `tx.ID()` của `CreateChainTx`
trong genesis, mà tx đó **không có input/credential** ⇒ ID là hàm của `networkID` **+ toàn văn byte
`cChainGenesis`**. netgen dựng `cChainGenesis` từ địa chỉ 5 quỹ **sinh khoá mới mỗi lượt** ⇒ **mỗi
lần re-genesis là một C-Chain ID mới.**
⇒ **Đừng cắm cứng C-Chain ID ở bất kỳ đâu.** URL bền là `/ext/bc/C/rpc` (alias), không phải cb58.

**Neo mới:** P-Chain = `11111111111111111111111111111111LpoYY` = `ids.Empty` — hằng số của **mọi**
mạng Avalanche. Không chết theo re-genesis, không chết theo đổi `networkID`.

#### 🔴 Và nó MẠNH hơn — đo được, không lập luận

Cấy đúng con bug kinh điển (**bộ giải nuốt byte 0 dẫn đầu**) vào bản sao rồi chạy `--self-test`:

| Neo | Kết quả dưới cùng con bug |
|---|---|
| **cũ** — C-Chain, hex `0xf56a800e…` | **1/8 ô đỏ.** Ô *"ID thật"* vẫn **XANH** |
| **mới** — P-Chain, `ids.Empty` = 32 byte 0 | **4/9 ô đỏ**, kể cả ô dùng chuỗi thật |

⚠️ **Bốn ô `round-trip` xanh ở CẢ HAI** — vì dữ liệu tự sinh thì tự nhất quán. Đó đúng là lớp lỗi
mà một neo **THẬT** sinh ra để bắt, và là lý do neo phải là chuỗi do avalanchego in ra chứ không
phải chuỗi ta tự dựng.

Thêm một ô mới: *"P-Chain ID giải ra ĐÚNG 32 byte 0"*. Bản lành: **9/9**.

---

### D-078 — Dải chainId L1 có TRẦN, và cạn dải thì **DỪNG CỨNG**

Thi hành phần trần của D-076. `local-net/lib/chainid.mjs`: `TRAN_DAI_CHAINID = 9_999_999_999`.

🔴 **Vì sao phải dừng cứng thay vì `chainId++` tới `MAX_SAFE_INTEGER`:** ba tính chất an toàn của
bộ định danh D-076 **đều sinh ra từ ĐỘ DÀI CHỮ SỐ**, và tràn khỏi dải là mất cả ba **trong im lặng**:

| | Tính chất | Mất khi tràn |
|---|---|---|
| 1 | `networkID` **9** chữ số vs chainId L1 **10** chữ số ⇒ không nhìn nhầm | số kế tiếp là `10000000010` — **11** chữ số |
| 2 | `networkID` (`999999999`) nằm **DƯỚI** sàn dải ⇒ chép nhầm sang ô chainId thì cổng bắt | — |
| 3 | **Toàn bộ** dải ≥ `9.000.000.010` **vượt trần `uint32`** ⇒ chép nhầm chiều ngược lại thì node **không khởi động được** (lỗi to, không im lặng) | — |

Cạn một tỷ số là chuyện của rất xa. Nếu nó xảy ra thật thì **đó là lúc cần một quyết định, không
phải một `chainId++`**.

**Kèm:** `check-chainid.mjs` chuyển từ *liệt kê 100 số đầu* sang **quét TRỌN dải bằng lọc ngược sổ**
— tra 100 số trong một dải 1 tỷ là **xanh đúng ở chỗ không ai đứng**. Lọc ngược là `O(số mục sổ)`
(2.7k) thay vì `O(độ rộng dải)`, và nó **phủ trọn dải**. Đo `27/08`: **999.999.990 số, 0 mục**.

**Nghiệm thu:** `chainid-test.mjs` **20 đạt / 0 hỏng**, trong đó 5 ô mới cho trần dải và **hai ô đối
chứng ngược**: bịt kín tới trần ⇒ ném lỗi; chừa đúng một chỗ ⇒ vẫn cấp được *(phép đo phân biệt được
"cạn" với "không cạn")*.

🔴 **Và một lỗi bắt được trong CHÍNH bản vá này:** câu lỗi in ra **số âm** —
`(-9.007.189.254.740.991 số)` — khi ca kiểm gọi với `goc > tran`. Cổng **chặn đúng**, nhưng người
đọc nó bị dẫn sai. Cùng lớp lỗi với `Fprintf` thiếu tham số mà patch 0013 đã trả giá: **một cổng mới
kiểm được nửa "có chặn không", chưa kiểm nửa "chặn xong nó nói gì".** Nay tách hai câu.

### D-079 — Bộ định danh theo thế hệ ĐÃ HIỆN THỰC. Và một cổng xanh vẫn để lọt một lỗi 720 triệu

Thi hành D-076 + đề xuất thế hệ (`docs/PROPOSAL-GENERATION-IDS.md`). Cây fork: **18 patch**,
tree **`f4615e73`**.

| | Thế hệ 0 |
|---|---|
| `A1Gen` | **0** |
| `A1ID` · `A1Name` | **`999999999`** · **`9chain-a1-g0`** |
| Băng mạng TẬP | **`899999999`** · `9chain-a1-tap-g0` |
| `chainId` mẹ · khối L1 | `9000000009` · **`9000000010–9000999999`** |

#### 🔴 Ba chỗ phải kiểm THEO DẢI, và chúng ở ba gói không import được nhau

| Gói | Chuyện gì nếu quên |
|---|---|
| `genesis/params.go` | tham số kinh tế mượn `LocalParams` |
| `config/config.go` (**2 chỗ**) | node lắp cấu hình staking/phí từ cờ CLI |
| `upgrade/upgrade.go` | 🔴 **`upgrade` KHÔNG import được `genesis`** — vòng import |

⇒ `LaMangA1` đặt ở **`constants`** cho cả ba dùng chung. Trước lượt này cả ba so với **một hằng
số đơn**, nên bộ định danh theo thế hệ làm cả ba cùng sai một kiểu — và `upgrade.go` là chỗ đắt
nhất: mọi thế hệ sau và cả băng mạng tập sẽ rơi xuống `Default` của Ava Labs, tức **D-049 bị vô
hiệu trong im lặng**.

#### 🔴 BÀI HỌC ĐẮT NHẤT: cổng XANH mà node vẫn SAI

netgen đã có cổng kiểm bộ định danh (`identity.go`) — **năm thứ phải khớp**. Cổng đó **xanh**.
`GetStakingConfig(899999999)` trả đúng **7.900.000.001** (đã kiểm bằng `go test`).

**Và node khởi động lại log `supplyCap: 720000000000000000`.**

Vì `config/config.go` lắp cấu hình bằng **đường khác** với thứ cổng kiểm. Cổng kiểm cái **netgen**
thấy; chỉ **boot một node thật** mới kiểm được cái **NODE** thấy.

⚠️ Nếu không boot thử thì ngày G sinh ra một mạng **phát hành 4,3 tỷ chạy trên trần 720 triệu** ⇒
**tràn ngược `uint64`** khi phát thưởng, lộ ra nhiều ngày sau, trên một genesis bất biến.

⇒ **Luật mới cho repo:** một cổng chỉ chứng minh được đường mà chính nó đi. Thứ đi vào genesis
phải được nghiệm thu **trên một node đang chạy**, không phải trên hàm thư viện.

#### Hai chỗ khác lộ ra khi boot, không lộ ra khi đọc mã

- **`--network-id=9001` cắm cứng** trong compose netgen sinh ra ⇒ node **từ chối khởi động**:
  `conflicting networkIDs: expected 9001 but config contains 899999999`. Lỗi hiền (nổ to, chỉ
  đúng chỗ) nhưng nó phơi ra rằng netgen từng có **hai nguồn sự thật** cho cùng một con số.
- **`SUBNET_PREFIX` phải kết thúc bằng `.0`** — netgen nhận `172.31.9` im lặng rồi sinh compose
  Docker từ chối. Chưa vá, đã ghi vào chú thích đầu netgen.

#### Nghiệm thu — mạng tập 3 node THẬT (`a1tap`, `networkID 899999999`)

| | |
|---|---|
| `info.getNetworkID` · `getNetworkName` | `899999999` · `9chain-a1-tap-g0` |
| `eth_chainId` | `0x218711d8d` = **9000000909** (số của mạng tập) |
| `supplyCap` (log node) | **7900000001000000000** |
| `numPeers` · lỗi | **2** · **0 ERROR** |
| X-Chain | `avm.getAssetDescription{assetID:"LOVE9"}` **trả về đúng** ⇒ khoá map đã vào chain thật |
| Đường dẫn DB | `/root/.avalanchego/db/**9chain-a1-g0**` ⇒ thế hệ đã vào đường dẫn |

#### 🔴 Bài cắt-kết-nối, kèm ĐỐI CHỨNG DƯƠNG

| Node | `networkID` | `numPeers` |
|---|---|---|
| **kẻ xâm nhập** | `999999999` (lệch băng) | **0** — bị cắt |
| **đối chứng** | `899999999` (khớp) | **3** — vào được lưới |

```
peer.go:826 malformed message
  {"field":"networkID","peerNetworkID":899999999,"ourNetworkID":999999999}
```

⚠️ **Không có đối chứng dương thì `numPeers 0` không phân biệt được với "node hỏng"** — và đó
mới là điều bài này phải chứng minh.

#### Cổng netgen — 3 ca đối chứng ngược

băng tập đi qua · **`999999998`** (số của thế hệ SAU) bị chặn **kèm đúng cảnh báo `NetworkIDToHRP`**
· `9001` cũ bị từ chối.

#### Tái lập

18 patch lên `1cf1fc3` → tree **`f4615e73`**, khớp cây fork từng byte.
🔴 **Đối chứng ngược:** áp **17/18** → tree **`f8458b33`** = **đúng tree đã ghi trước đó** ⇒ lượt
sinh lại **không âm thầm đổi gì** ở 17 patch cũ.

### D-080 — 🔴 GỐC của mạng công khai thế hệ trước, công bố TRƯỚC khi xoá

Lượt O2 cuối cùng của mạng `networkID 9001` (sinh `2026-08-26`, xoá `2026-08-27`).
Vật chứng: `docs/evidence/o2-before-delete-2026-08-27/`.

| | |
|---|--:|
| P-Chain · X-Chain · C-Chain | 68 · 3 · **7** block |
| Tệp · byte | 9 · 126.717 |
| Thời gian | **42 giây** |
| 🔴 **`GỐC` CÔNG BỐ** | **`c92ad73cf6cdcf44ef32bf4bb6475d282fb76878c553f690533bfa6c476ce066`** |

**Con số đó nằm ở ĐÂY, ngoài thư mục nó bảo vệ.** Để nó nằm cạnh dữ liệu thì nó không bảo vệ gì.

⚠️ **Phải xuất LẠI ngay trước khi xoá, không dùng bản xuất cũ trong ngày.** Bản lúc `11:22Z`
(D-072, `GỐC a22dfc55…`) đã lạc hậu: C-Chain lúc đó **4 block**, lúc xoá **7 block**. Hai giao
dịch trong khoảng giữa sẽ biến mất không dấu vết nếu tin bản cũ.

*(Lượt `26/08` bỏ lỡ bước này ⇒ câu hỏi "20M/70M có thật trên chain cũ không" vĩnh viễn không
trả lời được. Đây là lần đầu A1 xoá một mạng mà có vật chứng.)*

### D-081 — 🔴 MẠNG CÔNG KHAI ĐÃ SINH LẠI `2026-08-27` — thế hệ **g0**

David yêu cầu: *"chạy lại mạng công khai để các chỉ số từ bây giờ là chuẩn nhất, không còn
những chỉ số cũ"*. Đã chạy. **9/9 node lên, 0 lỗi.**

| | Thế hệ trước | **Thế hệ 0 (nay)** |
|---|---|---|
| `networkID` | `9001` | **`999999999`** |
| `info.getNetworkName` | `network-9001` | **`9chain-a1-g0`** |
| `supplyCap` | **9.000.000.000** ❌ | **7.900.000.001** ✓ |
| Lịch nâng cấp | `Default` của Ava Labs | `upgrade.A1` |
| HRP | qua `FallbackHRP` | khai tường minh trong `NetworkIDToHRP` |
| Đường dẫn DB | `db/network-9001` | **`db/9chain-a1-g0`** |
| `eth_chainId` | `9000000009` | **`9000000009`** — GIỮ, xem §8.2 đề xuất |
| Patch trong image | ~12 | **18** (tree `f4615e73`) |

**Bốn patch cuối (0013–0018) nay đã chạy trên mạng công khai** — trước lượt này chúng chỉ nằm
trên đĩa. Đó là điều đắt nhất lượt này mua được, hơn cả việc sửa con số.

#### Kế toán, đo trên chuỗi mới

```
trần cung P/X        7.900.000.001
C-Chain genesis      1.099.999.999   (currentSupply KHÔNG đếm — cố ý, D-048)
                     ─────────────
tổng cung             9.000.000.000  ✓ đúng lời hứa công bố
currentSupply đo      4.300.824.365
dư địa mint           3.599.175.636  (mục tiêu 3.600.000.000)
```

Faucet **99.999.999** · Foundation C-Chain **1.000.000.000** — đo bằng `eth_getBalance`.
🔴 **Địa chỉ faucet thế hệ trước trả `0x0`** ⇒ chứng minh đây là chuỗi thật sự mới, không phải
cùng một chuỗi đổi tên.

#### Nghiệm thu đường sản phẩm

| | |
|---|---|
| 6 trang công khai | **200** hết |
| RPC | `eth_chainId` = `0x218711a09` |
| Console API không token | từ chối đúng cách |
| Header chống nhúng (D-073) | `frame-ancestors 'self'` + `SAMEORIGIN` **còn nguyên** |
| 🔴 **Giao dịch thật** | faucet drip `0x635f2183…` ⇒ đọc lại **từ chain**: `0x…dEaD` có **10 LOVE9** |

#### 🔴 Ba thứ hỏng khi cutover — không cái nào đọc mã ra được

| # | Hỏng | Vì sao đắt |
|---|---|---|
| 1 | `net/` do container sinh ⇒ thuộc `root` ⇒ `sed` sửa compose **thất bại lặng lẽ** | Mạng lên bằng image **CŨ** (`:dev`, `A1ID = 9001`) trong khi genesis mang `999999999`. Nếu binary cũ chấp nhận thì mạng lên với **trần 720 triệu** — im lặng |
| 2 | 🔴 **netgen KHÔNG sinh `.env`** | Tệp đó đặt `A1_CONFIG_DIR`, `A1_API_BIND`, **`A1_HTTP_ALLOWED_HOSTS=localhost,127.0.0.1`**. Thiếu nó thì compose lấy mặc định **`--http-allowed-hosts=*`** — *nới lỏng bộ lọc Host trên node công khai*. **Chú thích trong chính tệp đó đã cảnh báo trước điều này**, và nó vẫn suýt xảy ra |
| 3 | `docker restart` **không nạp lại env** | Faucet giữ khoá thế hệ trước ⇒ `insufficient funds`. Phải **tạo lại** container, không phải restart |

⚠️ **Cả ba chỉ lộ ra khi CHẠY.** Không phép đọc mã nào bắt được, kể cả cổng năm-thứ-phải-khớp
của netgen. Cùng bài học với D-079: **cổng chỉ chứng minh được đường mà chính nó đi.**

⇒ **Việc phải làm trước ngày G:** netgen **phải sinh `.env`**, hoặc runbook phải có một dòng
đối chứng `grep A1_HTTP_ALLOWED_HOSTS net/.env`. Hiện tại nó là thứ sống bằng trí nhớ.

#### Vật chứng thế hệ trước

`docs/evidence/o2-before-delete-2026-08-27/` · `GỐC` ở **D-080**.
Bản sao trên máy chủ: `net-pre-g0-20260827-152109/` · `console.env.bak-pre-g0-*` ·
`faucet.env.bak-pre-g0-*` · cây fork cũ ở `src/upstream/avalanchego.bak-pre-g0`.

#### 🔴 Còn lại, KHÔNG được quên

1. **`chain-factory` chưa nạp tiền P-Chain** ⇒ **đẻ chain chưa dùng được**. Nạp từ Foundation
   X-Chain (`X-love918a4zwddz9nqjmzyzd86nt2czjkgpfxl8s3wx4g`) → X→P 9 LOVE9. Xem `WALLET-OPERATIONS.md`.
2. **Blockscout đang index lại từ block 0** của chuỗi mới.
3. **Ngày G `01/09` vẫn phải sinh lại lần nữa** — chữ khắc đi vào genesis, C1 chưa đóng băng byte.
   ⇒ Lượt đó là **thế hệ 1**: `A1Gen 1` · `networkID 999999998` · `9chain-a1-g1` · khối chainId
   `9001000000–9001999999`.
4. **B-9** (`#e84142` trong `patches/0003`) **chưa làm** — David đã gật nhưng lượt này không gộp.
   Gộp vào lượt regen của ngày G.

---

### D-082 — 🔴 Bí danh tài sản X-Chain: một hằng, hai nơi đọc. Và ví `chain-factory` đã có tiền

**Triệu chứng ban đầu chỉ là "đẻ chain chưa dùng được vì thiếu tiền".** Nạp tiền thì phải chạy
`xp-wallet` — đúng công cụ `docs/WALLET-OPERATIONS.md` chỉ định. Nó **không khởi động nổi**:

```
khong ket noi duoc node: failed to decode client response: asset 'AVAX' not found
```

#### Gốc

Lượt g0 đổi **khoá map tài sản** trong `genesis.FromConfig` từ `"AVAX"` sang `"LOVE9"` — có chủ
ý, có chú thích dài giải thích rằng khoá đó là **bí danh được đăng ký thật** trên X-Chain chứ
không phải nhãn hiển thị. Đúng. Nhưng `wallet/chain/x/context.go:35` và
`wallet/chain/c/context.go:46` **vẫn hỏi cứng `"AVAX"`**, và `rebrand.sh` không chạm hai tệp đó
(phạm vi nó dừng ở 4 chuỗi: `Client`, token `Name`, token `Symbol`, `FallbackHRP`).

⇒ **Mọi công cụ dùng ví X hoặc C chết ngay lúc mạng lên thế hệ mới.** Cùng họ với `FallbackHRP`
— bản sắc sống bằng thứ không ai canh — nhưng **ngược chiều**: lần này nơi ĐẶT tên đã đổi, còn
nơi HỎI tên thì không, và chính người đặt tên chết vì cái tên mình đặt.

🔴 **Vì sao không cổng nào bắt được.** `9chain-a1-cli l1 create` — đường đẻ chain thật sự chạy —
dùng `MakePWallet`, lấy assetID qua `platform.getStakingAssetID`, **không hỏi bí danh**. Nên công
cụ trên đường chính vẫn xanh trong khi đường nạp tiền chết câm. Lại đúng luật đã trả giá:
**cổng chỉ chứng minh được đường mà chính nó đi.**

#### Sửa (patch 0019, tree `f4615e73` → **`bc8b634b`**, 19 patch trên `1cf1fc3`)

- `constants.A1AssetAlias = "LOVE9"` · `constants.UpstreamAssetAlias = "AVAX"`
- `constants.GetAssetAlias(networkID)` quyết theo **BĂNG** (`LaMangA1`), dùng ở **cả ba** chỗ:
  `genesis.FromConfig` (nơi ĐẶT tên) + `wallet/chain/{x,c}` (nơi HỎI tên).
- 🔴 **CỐ Ý KHÔNG có nhánh dự phòng** *"thử LOVE9, hỏng thì thử AVAX"*. Đường lui như thế biến
  "hỏi sai tên" thành xanh và giấu luôn cái sai — đúng lớp lỗi `/moi/` che một trang 404 THẬT.

#### Nghiệm thu — có ca ĐỎ, không chỉ ca xanh

| Phép đo | Kết quả |
|---|---|
| `sha256` byte genesis, 5 networkID, trước/sau | `999999999` (g0 thật) + `899999999` (tập) **khớp từng bit** ⇒ mạng đang chạy không đổi; `1`/`5`/`12345` **đổi** ⇒ phép so này phân biệt được |
| assetID | **không đổi ở đâu cả** — bí danh nằm trong byte genesis nhưng KHÔNG trong assetID (`assetID` = ID của `CreateAssetTx`, không gồm trường `Alias`) |
| `TestGetAssetAlias` | 11 ca, **6 ca đỏ thật** (ngoài băng phải ra `"AVAX"`) + khẳng định hai bí danh không được hoà về một |
| `go build` + `go vet` | sạch (`golang:1.25.10-bookworm`) |
| Tái lập cây fork | 19 patch → **`bc8b634b`** ✓ · **đối chứng ngược 18/19 → `f4615e73`** đúng tree cũ |
| 🔴 Trên mạng ĐANG CHẠY | `xp-wallet` khởi động lại được, tự đọc ra `assetID v5fAh1Cz…` **trùng** giá trị RPC công khai trả cho `LOVE9` |

⚠️ `genesis/TestAVAXAssetID` **đã đỏ sẵn 3/3 từ trước lượt này** (do rebrand `Name`/`Symbol`,
patch 0002; tệp test là bản upstream chưa patch nào chạm). Đã đo ở mốc gốc `c1ef307` để đối
chứng — lượt này không làm nó xấu đi, ba giá trị `actual` không đổi.

#### Nạp ví `chain-factory` — David chốt **90 LOVE9**, không phải 9

Tài liệu nhắm 9 LOVE9 (≈63.600 lượt đẻ chain). David chọn nạp **gấp 10** trong phiên.

| | |
|---|---|
| TX1 (khoá Foundation, X-Chain) | `BxdRjAQcCoTUjKSxD3A2YwVK9oMUc9LtCn1NUnuE2g8BTNYqq` — 90,01 LOVE9 |
| TX2 (khoá chain-factory, X→P) | export `23z2i36HqtVsQqcfPFS1VJPbcTxWE4SSRJGDM2FJLphEaVxQDT` · import `FPCP5meMVFWwjUX5cRcetXmHgpEXoexZxktk8Q7yqjBwXpUrJ` |
| Foundation X | 71.000.009 → **70.999.918,989** = đúng −90,011 (90,01 + phí 0,001) |
| **chain-factory P** | **89,99999173 LOVE9, `unlocked`** — đọc lại bằng RPC CÔNG KHAI, không qua chính cái ví vừa vá |
| chain-factory X | 0,009 (phần thừa sau phí) |

🔴 **CHƯA CHỨNG MINH: đẻ chain chạy được.** Ví có tiền ≠ đường đẻ chain thông. Phép kiểm thật
là đẻ **một** L1 rồi thu hồi — cần David ký SIWE trên console, và nó tạo một chain THẬT trên
mạng công khai. Đừng đọc "ví đã có tiền" thành "mục #1 đã xong hết".

#### Việc sinh ra

- 🔴 **B-15 — bí danh tài sản ở ngày G.** Giữ `LOVE9` là chủ quyền, nhưng **mọi công cụ Avalanche
  của bên thứ ba** (dựng trên SDK upstream hỏi `"AVAX"`) sẽ chết khi nói chuyện với A1 — hôm nay
  chính A1 vừa dính. Đổi về `"AVAX"` chỉ làm được ở **lượt sinh lại `01/09`**, sau đó khoá vĩnh
  viễn trong thế hệ. **Cần David quyết trước ngày G.**
- 🔴 **O1 nặng hơn tài liệu giả định.** `~/9chain-a1/net/keys.txt` (khoá bí mật **cả 5 quỹ** +
  private key EVM của g0) **đang nằm trên server công khai**, trong khi dòng đầu chính tệp đó ghi
  *"TUYỆT MẬT — giữ offline/cold"* và `allocation.md` cạnh nó ghi *"KHÔNG đưa lên server"*.
  netgen chạy trên server nên đẻ nó ra ngay tại đó. Không phải *"chưa có bản thứ hai"* mà là
  **bản thứ nhất đang ở nơi tự nó cấm**.

---

### D-083 — `netgen` tự sinh `.env`, và **chặn mạng THẬT sinh ra ở tư thế phơi trần**

`netgen` sinh `docker-compose.multinode.yml` nhưng **không sinh `.env`**. Compose tự nạp `.env`
từ thư mục chứa tệp compose, và mọi biến trong đó đều khai kèm **giá trị mặc định kém an toàn
hơn**:

```
--http-allowed-hosts=${A1_HTTP_ALLOWED_HOSTS:-*}
ports: "${A1_API_BIND:-127.0.0.1}:9650:9650"
```

⇒ Thiếu `.env` thì mạng vẫn lên, **9/9 node xanh, không một dòng lỗi nào** — nhưng bộ lọc Host
của node CÔNG KHAI mở thành `*`. Lượt g0 `27/08` thoát **chỉ vì có người nhớ chép tay `.env`**
từ thư mục mạng cũ sang. 🔴 **Trí nhớ không phải một cổng.**

⚠️ Nặng hơn `FallbackHRP` một bậc: ở đó nhánh dự phòng chỉ là *một giá trị khác*; ở đây nhánh
dự phòng là **nhánh kém an toàn hơn**. Mặc định của compose đang làm việc ngược với ý định.

#### Ba thứ patch 0020 thêm

| | |
|---|---|
| **1** | netgen sinh `<out>/.env` — `A1_CONFIG_DIR` · `A1_API_BIND` · `A1_HTTP_ALLOWED_HOSTS` · `A1_TRACK_SUBNETS`. Ba biến đầu đọc từ chính môi trường netgen, **cùng tên** với biến nó ghi ra. Mặc định **trùng** mặc định của compose, để việc sinh `.env` tự nó không thành một thay đổi hành vi âm thầm |
| **2** | **Cổng `kiemPhoiTran`** — mạng THẬT không được sinh với `A1_HTTP_ALLOWED_HOSTS=*` hoặc `A1_API_BIND=0.0.0.0`: **dừng cứng**. Mạng TẬP cho qua kèm cảnh báo. **Không có cờ "tôi biết tôi đang làm gì"**: mở thật thì mở lúc `up` bằng `--env-file` của riêng lượt đó, đừng nướng vào vật liệu sinh mạng |
| **3** | `NETWORK_ID` nay **bắt buộc**. Trước đó mặc định `"9001"` — networkID của **thế hệ đã chết**, mà chính cổng bộ định danh từ chối |

🔴 **Mục 3 là loại lỗi khó thấy nhất trong ba.** Hành vi *"chạy netgen trần thì dừng"* đang
**đúng, nhưng đúng do TAI NẠN** — và thông báo lỗi nói về một con số người dùng chưa từng gõ.
Tệ hơn: chú thích đầu tệp khai mặc định là `constants.A1ID`, tức **tài liệu mô tả một hành vi
mà nếu ai đó "sửa cho khớp tài liệu" thì `netgen` trần sẽ lặng lẽ sinh ra MẠNG THẬT.**

⚠️ **CỐ Ý KHÔNG kiểm `A1_CONFIG_DIR`**, và nói rõ vì sao ngay trong mã: netgen chạy trong
container ghi ra `/out`, còn đường dẫn đó do compose giải **trên máy chủ**. Nó chỉ chép lại giá
trị và **in to ra**. Thêm một phép kiểm ở đây là thêm một cổng chỉ chứng minh được đường của
chính nó.

#### Nghiệm thu — 6 ca, 3 đỏ 3 xanh, cặp đỏ/xanh **đối xứng**

| # | Ca | Kết quả |
|---|---|---|
| 1 | mạng THẬT, mặc định | ✓ `.env` đủ 4 biến |
| 2 | mạng THẬT + `allowed-hosts=*` | ✗ FATAL — **và không ghi `.env` nào cả** |
| 3 | mạng THẬT + `api-bind=0.0.0.0` | ✗ FATAL |
| 4 | **mạng TẬP + đúng tham số của ca 2** | ✓ cho qua, có cảnh báo |
| 5 | không khai `NETWORK_ID` | ✗ FATAL |
| 6 | `A1_CONFIG_DIR` tường minh | ✓ chép đúng vào `.env` |

🔴 **Ca 2 và ca 4 dùng CÙNG một tham số, chỉ khác băng mạng** — đó là thứ chứng minh cổng đang
canh *băng*, không phải canh *chuỗi ký tự*.

#### Và phép đo ĐẦU-CUỐI, bằng `docker compose config` chứ không bằng đọc mã

```
có .env    →  --http-allowed-hosts=localhost,127.0.0.1
giấu .env  →  --http-allowed-hosts=*          ← đúng sự cố suýt xảy ra 27/08
```

**Tái lập:** 20 patch → tree **`6879819f`** · đối chứng ngược **19/20 → `bc8b634b`** ✓.
`.env` đang chạy trên server khớp **đúng 4 biến** netgen nay tự sinh — không phải sửa gì.

---

### D-084 — 🔴 Bí danh tài sản là **`LOVE9`, DỨT KHOÁT**. B-15 đóng, không chờ ngày G

**David chốt `27/08`:** *"tuyệt đối không được, chỉnh hết về `LOVE9`."*

A1 đưa ba đường. Đường thứ ba tưởng là "cả hai cùng thắng" — `ids.Aliaser` cho phép **nhiều bí
danh trỏ cùng một assetID**, và `PrimaryAlias` trả về cái **đăng ký đầu tiên**
([ids/aliases.go:74](upstream/avalanchego/ids/aliases.go:74)) ⇒ genesis giữ `LOVE9`, node đăng
ký thêm `AVAX`, RPC vẫn hiện `LOVE9`, SDK upstream vẫn chạy, **không đụng byte genesis nên
không cần chờ ngày G**. **BỊ LOẠI.**

🔴 **Và loại là đúng lớp:** phương án đó mua tương thích bằng cách để tài sản gốc **có hai
tên**, trong đó một tên là tên của mạng khác. Chủ quyền ở lớp máy ĐỌC không phải thứ đem đổi
lấy tiện nghi cho công cụ bên thứ ba. Đây cũng là quyết định **có giá đã biết trước**, không
phải quyết định thiếu thông tin:

> **Mọi công cụ dựng trên SDK avalanchego gốc — hỏi cứng `"AVAX"` ở
> `wallet/chain/{x,c}/context.go` — KHÔNG nói chuyện được với 9Chain-A1.** Ví, explorer,
> bridge, indexer của bên thứ ba đều phải dùng bí danh `LOVE9` hoặc assetID trần.

#### Việc còn lại: đã chọn cho nó hỏng, thì bắt nó **hỏng RA TIẾNG**

Patch 0022 — `vms/avm/vm.go` `lookupAssetID`: khi ai đó hỏi `AVAX` **trên mạng thuộc băng A1**,
câu lỗi nói ra lý do thay vì `asset 'AVAX' not found` trần trụi.

🔴 **Nó KHÔNG làm `AVAX` chạy được.** Nó chỉ làm việc *không chạy* mang theo lời giải thích.
Chính A1 mất nửa ngày vì câu lỗi trần đó (D-082) — **và A1 có cả `DECISIONS.md` để tra.**
Người ngoài gặp đúng câu đó thì không có gì cả.

Câu lỗi viết **tiếng Anh, cố ý**: người đọc nó là lập trình viên bên thứ ba.

⚠️ **Phạm vi cần David biết:** chạm `vms/avm` — gói `rebrand.sh` khai *"tuyệt đối không chạm"*.
Đây là một nhánh trong **hàm tra tên**: không đụng đồng thuận, không đụng trạng thái, không đụng
byte genesis. Nếu David thấy lằn ranh đó không nên có ngoại lệ thì **gỡ đúng commit `b904317`**,
phần còn lại không phụ thuộc vào nó.

#### Nghiệm thu — 6 ca, **ba ca đối chứng mới là phần đáng giá**

| Ca | Kết quả |
|---|---|
| A1 mạng THẬT + `AVAX` | có giải thích |
| A1 mạng TẬP + `AVAX` | có giải thích |
| **A1 + tên khác** | **lỗi TRẦN** — lời giải thích không được vãi ra mọi lỗi tra tên, thế thì nó thôi mang tin |
| **UnitTest + `AVAX`** | **lỗi TRẦN** — nhánh theo **BĂNG**, không theo chuỗi |
| **mainnet + `AVAX`** | **lỗi TRẦN** |
| A1 + tên có thật | vẫn tra được — nhánh thêm vào không chắn đường sống |

Toàn bộ gói `vms/avm`: xanh, 0 `FAIL`. Tree `17dd3b3f` → **`f29d8c87`**, 22 patch; đối chứng
ngược 21/22 → `17dd3b3f` ✓.

⚠️ **Câu lỗi chỉ tới tay người dùng khi dựng lại image node** — lượt build ngày G. Không dựng
lại image chỉ vì việc này: restart 9 node công khai đắt hơn giá trị nó mang lại hôm nay.

#### Đã soát: A1 **không còn** chỗ nào giả định `AVAX` lúc chạy

Quét `local-net/` · `scripts/` · `docs/` · `README.md`: mọi kết quả đều là **tên biến Go**
(`units.Avax` — không đổi theo triết lý rebrand *"chỉ đổi giá trị, không đổi định danh"*) hoặc
tài liệu **mô tả** việc đổi tên. `constants.UpstreamAssetAlias = "AVAX"` giữ nguyên vì nó chỉ
phục vụ **mạng ngoài băng A1** (mainnet/fuji/local) — nếu bỏ, fork mất khả năng dựng lại genesis
upstream **và** bảng kiểm mất sạch ca đỏ.

---

### D-085 — O1 bước 1 XONG: khoá g0 đã rời server, và O1 nay là **một lệnh chạy được**

David duyệt quy trình ba bước `27/08`. Bước 1 đã chạy.

#### Trước lượt này

🔴 **Khoá của mạng công khai đang chạy tồn tại ở ĐÚNG MỘT NƠI: server.** `local-net/net-public/`
trên máy dev là bộ `26/08` — **thế hệ đã chết** (đối chứng: ví Foundation của bộ đó đọc ra
**rỗng** trên chain). Nên thứ tự bắt buộc là **chép về trước, xoá sau** — làm ngược là mất sạch.

#### Đã làm

| | |
|---|---|
| Chép về máy dev | `C:\Users\abc\9chain-a1-keys\g0\` — `keys.txt` · `allocation.md` · `genesis.json`, **ngoài repo, ngoài đường git** |
| Đối chứng byte | `sha256` **3/3 khớp** hai đầu |
| 🔴 Phép kiểm khôi phục | `kiem-khoa` — **6/6 quỹ**, mọi X/P/EVM suy lại từ khoá đều khớp thứ tệp tự khai · đối chiếu chéo `allocation.md` **6/6** |
| Kiểm phụ thuộc | không container nào mount `keys.txt` (node chỉ mount `node1/` + `genesis.json`) · `gen-network.sh` chỉ **nhắc tên** trong một dòng cảnh báo |
| Xoá | `shred -u -n 3` trên server. Sau đó: `find ~/9chain-a1 -name keys.txt` ⇒ **0** |
| Đối chứng sau | mạng vẫn `9chain-a1-g0`, số dư `chain-factory` P vẫn đọc được ⇒ không tệp nào đang chạy phụ thuộc vào nó |

#### 🔴 Trạng thái mới, nói thẳng

**Khoá 5 quỹ của g0 nay tồn tại ở ĐÚNG MỘT nơi: một ổ đĩa máy dev.** Đó là sơ đồ D-044 đã chốt,
được **khôi phục** chứ không phải được cải thiện — đổi rủi ro *lộ* lấy rủi ro *mất*. Bản thứ hai
vẫn là việc của David, và nay **có công cụ để kiểm nó**:

```bash
kiem-khoa -allocation allocation.md keys.txt
```

#### Bước 2 gặp một ràng buộc chưa ai lường

Ý định: ngày G chạy netgen ở máy dev, nạp ví từ máy dev qua RPC công khai ⇒ khoá không bao giờ
chạm server. Đo thật thì **không đi thẳng được**, hai lớp chặn, **cả hai đều đúng**:

| Lớp | Đo được |
|---|---|
| RPC công khai | `/ext/info` · `/ext/bc/X` · `/ext/bc/P` · `/ext/bc/C/rpc` = **200**, nhưng **`/ext/bc/C/avax` = 404** — đúng đường `primary.MakeWallet` cần cho ví C |
| Hầm SSH tới `127.0.0.1:9650` | mở được, `/ext/bc/C/avax` = **200**. Nhưng ví trong container gửi `Host: host.docker.internal` ⇒ node trả **403** — chính bộ lọc `A1_HTTP_ALLOWED_HOSTS` của D-083 |

⇒ **Không mở thêm cổng công khai.** Cách đúng cho ngày G: **hầm SSH chạy TRONG cùng container
với ví**, để ví gọi `127.0.0.1` và header `Host` nằm trong danh sách cho phép. Chưa dựng — ghi
lại đây để lượt ngày G không phải dò lại từ đầu.

⚠️ Và đây là một tin tốt đọc ngược: **bộ lọc Host chặn đúng một thứ đáng chặn**, trong một tình
huống không ai dựng ra để thử nó.

---

### D-086 — §5c: **không khôi phục sổ cũ**, mà rút `chainId` + **TÊN** ra thành sổ chặn xuyên thế hệ

David chốt `27/08`: câu hỏi *"có khôi phục sổ `retired` cũ không"* là câu hỏi nhị phân sai — **cả
hai đường đều dở**. Khôi phục là kéo **trạng thái** của một mạng đã chết vào mạng mới
(`subnetID`/`blockchainID` trong đó không còn tồn tại, và mọi phép đo chain sống sẽ vấp phải
chúng). Không khôi phục là để hở đường **người dùng tự nhập**.

⇒ Giữ lại **lời hứa**, bỏ **trạng thái**: con số này, cái tên này, đã phát ra ngoài rồi.

#### 🔴 Lỗ đo được, không phải suy luận

`console-chains.json` **bị xoá sạch mỗi lượt re-genesis**. Đo `27/08` sau lượt g0: sổ đang chạy
đúng **27 byte**. Tức `chains ∪ retired` — thứ `createChain` dựa vào để chặn trùng — **rỗng**, và
**47 chainId + 53 tên** từng cấp cho người dùng đã tự do trở lại, gồm `9141 "David Do"`.

Hậu quả không phải "hai chain trùng tên": cấp lại `9102` cho một chain KHÁC là để ví của người
từng dùng chain cũ trỏ vào chain lạ **dưới cùng một chainId** — MetaMask coi hai chain là MỘT
mạng, EIP-155 buộc chữ ký vào chainId, nên **chữ ký cũ phát lại được**.

#### Đã làm

| | |
|---|---|
| `scripts/gen-chainid-issued.mjs` | gộp **mọi sổ console trong repo** → `local-net/console/chainid-issued.json`. Có `--check` (thoát 1 khi tệp trôi lệch khỏi nguồn) |
| `docs/archive/console-chains-pre-g0-2026-08-27.json` | sổ `26/08→27/08` **chỉ còn trên server** — nay vào repo, để danh sách chặn **tái lập được** mà không phụ thuộc máy chủ |
| `local-net/lib/chainid.mjs` | `loiChainIdDaCap()` · `loiTenDaCap()` — **hàm thuần**, đặt ở lib theo đúng tiền lệ `capChainIdTuDong`: một phép kiểm sống trong `server.mjs` chỉ chạy được khi có node + SIWE + mạng, nên thực tế nó không bao giờ được kiểm |
| `server.mjs` | nạp sổ thứ hai (rỗng ≡ cổng tắt, thiếu tệp ≡ cổng tắt — **nói to cả hai**) · chặn TÊN · chặn chainId tự nhập · đường **tự cấp** nhận HỢP hai sổ |

🔴 **Chặn tên so THƯỜNG HOÁ.** `"david do"` và `"David Do"` là cùng một lời hứa với cùng một
người. Chặn theo byte thì đổi một chữ hoa là lách được — và người lách **không nhất thiết cố ý**,
họ chỉ gõ lại cái tên họ nhớ.

⚠️ **`9201` (DeltaChain) nằm NGOÀI dải liền `9100–9145`.** Nếu suy danh sách từ "dải" thay vì gộp
từ sổ thật thì số đó lọt. Đây là lý do bộ sinh đọc tệp chứ không đọc dải.

#### Nghiệm thu

`chainid-test.mjs`: **35 đạt · 0 hỏng** (mục 8 mới: 13 ca, trong đó **5 ca đối chứng ngược** —
`9146` và gốc dải phải KHÔNG bị chặn, sổ rỗng phải không chặn gì, và cùng một dải mà không truyền
sổ vào thì phải ra `9100`, chứng minh chính việc truyền sổ tạo ra khác biệt).

🔴 **Và cổng verify chạy trên API THẬT** — dựng console thật trong một gốc giả, gọi `POST /api/create`:

| Ca | Kết quả |
|---|---|
| `chainId 9141` | chặn, đúng câu lỗi mới |
| tên `"david do"` | chặn — so thường hoá chạy đúng trên đường thật |
| `chainId 9100` | chặn bởi cổng **sổ công khai** (bắn trước) ⇒ hai cổng tách bạch, đúng thứ tự |
| **đối chứng**: tên + số chưa ai dùng | **đi qua hết mọi cổng**, chỉ hỏng ở bước gọi docker ⇒ cổng không chặn bừa |

#### Còn hở, nói thẳng

⚠️ Sổ này chỉ nhớ được thứ **có trong repo**. Một lượt re-genesis mà không lưu `console-chains.json`
vào `docs/archive/` trước khi xoá là **mất vĩnh viễn** phần đó — và không có gì báo. ⇒ Việc lưu
sổ phải nằm trong **runbook re-genesis**, cùng chỗ với quy trình O2.

---

### D-087 — Đẻ chain **TẠM ĐÓNG** tới sau ngày G. Và: console sống đã lạc hậu **3 commit**

#### Phần quyết định (David chốt `27/08`, O3)

Ngày G `01/09` **xoá sạch mọi L1 người dùng**. Mở cửa từ giờ tới đó nghĩa là mỗi chain người lạ
đẻ ra là **một lời hứa ta biết chắc sẽ nuốt lời sau vài ngày** — và họ không biết điều đó. Sau
ngày G thì đúng chính sách ấy lại trung thực, vì mạng mới sống lâu hơn.

⇒ `A1_DE_CHAIN_MO` mặc định **ĐÓNG**. Chỉ đúng chuỗi `"1"` mới mở.

| | |
|---|---|
| 🔴 Mở **bằng tay**, không bằng đồng hồ | Cổng tự mở theo mốc thời gian sẽ mở **kể cả khi ngày G trượt** — đúng lúc điều kiện nó canh chưa thoả. Ngày tháng không biết mạng đã sinh lại chưa; người thì biết |
| Nhận đúng một cách nói "bật" | `true`/`yes`/`0`/rỗng đều là ĐÓNG. Một cổng an toàn mà nhận nhiều cách bật là một cổng **bật nhầm** |
| `thuHoiChain` **không** bị chặn | Đóng cửa vào không được nhốt người đã ở trong |
| Trạng thái in ra log **cả khi mở** | Một chính sách chặn người dùng mà im lặng ở log là chính sách không ai biết mình đang chạy — kể cả lúc nó chạy sai |

**Nghiệm thu:** 3 ca trên console thật, mỗi ca một tiến trình sạch, **có chốt chống
`EADDRINUSE`** — biến rỗng ⇒ chặn · `=1` ⇒ đi qua cổng · `="true"` ⇒ chặn.
🔴 Chốt đó cần thật: lượt đo đầu tiên **vô hiệu** vì `pkill` không giết được tiến trình node
trên Windows, nên cả hai ca đều bắn vào **bản cũ** và cho ra kết quả giống nhau. *Một phép đo
mà ca đỏ và ca xanh ra cùng kết quả thì thứ hỏng là phép đo, không phải sản phẩm.*

---

#### 🔴 Phần đắt hơn: **B-14 ghi "ĐÃ ĐÓNG" trong repo, nhưng ngoài đời vẫn hở**

Lúc chuẩn bị deploy, so `sha256` bản trên server với git:

```
local-net/lib/chainid.mjs           THIẾU trên server
local-net/console/chainid-taken.json   THIẾU trên server
local-net/console/server.mjs        = commit 69c80ce (2026-08-26)
```

**Console công khai đang chạy đứng ở `69c80ce`, và ba commit sau nó chưa bao giờ lên:**

| | |
|---|---|
| `6500e03` `27/08` | cổng "bản tập ≠ bản thật" cho chainId — mục đóng **B-11** |
| `b53c8f5` `27/08` | **B-14: gốc dải `9000000010`** — mục David đích thân chốt |
| `20b2790` `28/08` | D-086 sổ xuyên thế hệ |

⇒ Tới `28/08`, console sống **vẫn cấp chainId từ `9100`** — đúng con số trùng **Genesis Coin** mà
B-14 sinh ra để tránh — và **không có danh sách chặn nào**. `BLOCKERS.md` ghi B-14 *"ĐÃ ĐÓNG
27/08"*; điều đóng là **quyết định**, không phải **lỗ**.

🔴 **Bài học, và nó không mới — nó là bài cũ ở một tầng chưa ai canh:** repo đã có luật *"cổng
chỉ chứng minh được đường mà chính nó đi"* và *"phải đo trên node đang chạy"*. Cả hai nói về
**cùng một máy**. Lớp này ở giữa **hai máy**: mã đúng, bài kiểm xanh, quyết định đã chốt, tài
liệu đã ghi "đóng" — và **không byte nào của nó tồn tại ở nơi người dùng chạm vào**.
*Không có cổng nào canh khoảng cách giữa repo và server.*

⚠️ **Thiệt hại thực tế hôm nay ~0** — đẻ chain đòi token/SIWE và chưa có người thật nào dùng
(`docs` ghi rõ). Cái đang hở là **cửa**, không phải vết thương. Đừng trích mạnh hơn thế.

#### Đã vá cùng lượt

Đồng bộ 4 tệp (`server.mjs` · `lib/chainid.mjs` · hai sổ chặn), `sha256` khớp 4/4,
`node --check` sạch, restart bằng **đúng** môi trường cũ đọc từ `console.env`, cwd
`~/9chain-a1/src`, log nối vào `console.log`. Sao lưu bản cũ tại
`server.mjs.bak-pre-D087-*`.

**Nghiệm thu trên console CÔNG KHAI đang chạy:**

```
[chainId] danh sách chặn: 51 số (dải 9100–9999 · 9000000010–9999999999)
[chainId] sổ A1 đã cấp: 47 chainId · 53 tên
  đẻ chain: 🔒 ĐÓNG
```
· không token ⇒ **401** (cổng auth còn nguyên) · có token ⇒ **vấp đúng cổng đẻ chain đóng**.

---

### D-088 — Cổng canh **khoảng cách repo ↔ server**, và gốc rễ của việc B-14 không tới sản phẩm

#### Gốc rễ, tìm được khi đi tìm chỗ khác

`local-net/deploy/console-deploy.sh` — **đường deploy chính thức** — liệt kê tệp **thẳng trong
script**. Khi `lib/chainid.mjs` được tách ra khỏi `server.mjs` (27/08, để bài kiểm đọc được mã
thật) thì **không ai nhớ thêm nó vào danh sách chép**. `chainid-taken.json` cũng vậy.

⇒ Cổng chainId David đích thân chốt (B-14) **chưa bao giờ tới được server**. Console công khai
vẫn cấp từ `9100` suốt hai ngày, và ô nhập trên giao diện còn ghi gợi ý `tự cấp (9100, 9101, …)`
— **đúng con số B-14 sinh ra để tránh**, hiện ra trước mắt người dùng.

🔴 **Việc tách mã ra cho DỄ KIỂM đã làm nó KHÔNG ĐƯỢC DEPLOY.** Một cải tiến chất lượng, làm
đúng theo luật của repo, và nó tạo ra lỗ. Không ai làm sai bước nào.

#### Sửa bằng kiến trúc: **một danh sách, hai nơi đọc**

`local-net/deploy/manifest-deploy.json` khai mã phải giống nhau giữa hai máy, theo nhóm dịch vụ
(`console` · `faucet` · `vantoc`), kèm **lý do cho từng mục bỏ qua**. Cả `console-deploy.sh`
(chép lên) lẫn `scripts/check-deploy-drift.mjs` (đo lệch) đọc **cùng tệp đó**. Thêm tệp vào
đường chạy mà quên khai ⇒ **cổng drift đỏ**, thay vì im lặng như cũ.

Cùng lối với `constants.GetAssetAlias` ở D-082: nơi ĐẶT và nơi HỎI phải đọc chung một hằng.

#### 🔴 Bản đầu của chính cổng này sai, và giữ lại bài học

Bản đầu tự đoán phạm vi bằng glob. Nó chạy và báo **27/58 tệp lệch** — phần lớn là công cụ chỉ
chạy ở máy dev, tức **đỏ giả**. *Một cổng đỏ ở chỗ không cần đỏ sẽ bị người ta học cách bỏ qua,
và nó sẽ bị bỏ qua đúng vào lần nó đỏ thật.* Phạm vi nay là **quyết định được ghi ra**.

#### Những gì cổng bắt được ngay lần chạy thật đầu tiên (18 tệp, 5 lệch)

| | |
|---|---|
| `lib/chainid.mjs` · 2 sổ chặn | **không tồn tại trên server** — B-14 chưa từng chạy |
| `console/index.html` | gợi ý cho người dùng vẫn ghi `9100, 9101, …` |
| `faucet/server.mjs` · `lib/cb58.mjs` | cũng đứng ở `69c80ce` (26/08) ⇒ **`/faucet/api/supply` trả 404**: I1b *"cung có nguồn"* làm `27/08` **chưa bao giờ tới người dùng** |
| `scripts/export-chain.mjs` | **thiếu trên server** — quy trình **O2** gọi nó, và O2 chạy ở nơi có dữ liệu. Không có nó thì O2 **không chạy được ở ngày G**, và điều đó chỉ lộ ra đúng lúc đang cần |

#### Đã deploy + nghiệm thu trên dịch vụ CÔNG KHAI

| | |
|---|---|
| Console | hai sổ chặn đã nạp · `đẻ chain: 🔒 ĐÓNG` · không token ⇒ 401 · có token ⇒ vấp cổng đóng |
| Faucet | `/faucet/api/supply` **200**, số **đo từ chain** (`source: "measured"`, `platform.getCurrentSupply`) · trang faucet 200 · `drip` vẫn kiểm địa chỉ ⇒ không làm hỏng gì |
| Cổng drift | **18/18 khớp**, thoát 0 |

**Đối chứng ngược cho chính cổng:** khai thêm một tệp chưa hề deploy ⇒ **thoát 1**; trả lại ⇒
thoát 0. *(Ca đối chứng đầu tiên tôi chọn `package-lock.json` — hoá ra nó ĐÃ có trên server nên
ra xanh. Một ca đối chứng chọn nhầm vật thì không chứng minh gì.)*

⚠️ **Phạm vi cổng là 18 tệp, không phải cả cây.** Ngoài phạm vi vẫn có thể lệch — `web/` cố ý
nằm ngoài (thuộc worktree `web-home`), `upstream/` cũng vậy. Đừng đọc "18/18 khớp" thành "server
giống repo".

---

### D-089 — H-7: **IPv4 đa cổng**. Và một thiết kế bị chính diễn tập của nó bác bỏ

**David chốt `27/08`:** IPv4 đa cổng, không IPv6. H-7 là **chọn tập người dùng**, không phải
chọn kỹ thuật — IPv6 loại phần lớn người muốn chạy node hôm nay, còn NAT vòng lại giữa các node
cùng máy chỉ là phiền.

`A1_P2P_MODE=ipv4port` (patch 0024): mỗi node một `--staking-port`, beacon publish cổng ra
`0.0.0.0` và khai `--public-ip` = IPv4 công khai của máy chủ.

#### Phép đo quyết định cả thiết kế (`28/08`, trên chính máy chủ)

```
ngoài Internet        → 139.99.145.13:9751   ✓   nhà cung cấp KHÔNG chặn
host                  → 139.99.145.13:9751   ✓
container cùng bridge → 139.99.145.13:9751   ✗   TIMEOUT   ← NAT vòng lại HỎNG
container cùng bridge → 172.28.0.7:9751      ✓             ← đối chứng phân biệt
```

Docker không DNAT lưu lượng đến từ chính bridge đó. *(Ca đối chứng đầu tiên tôi chọn là "cổng
không publish" — nó cũng timeout, nên **không phân biệt được gì**. Phải đổi sang "cùng cổng,
địa chỉ nội bộ" thì phép đo mới có nghĩa.)*

#### 🔴 Bản đầu SAI, và diễn tập bác nó bằng một con số

Bản đầu cho **mọi** node khai `publicIP:965N`. Mạng 3 node lên **xanh**, log sạch. Nhưng:

| | numPeers |
|---|---|
| node1 | **2** |
| node2 | **1** ← không thấy node3 |

node2 và node3 học địa chỉ của nhau qua `--public-ip` (địa chỉ node **tự khai**) rồi gọi vào IP
công khai của chính máy mình ⇒ hỏng. Với 9 node, mesh **teo thành hình SAO quanh node1** — mà
đồng thuận cần lấy mẫu khắp tập validator, không phải qua một trung tâm.

🔴 **Không một phép kiểm tĩnh nào bắt được điều này.** Compose đúng, cờ đúng, node chạy, log
sạch. Chỉ `info.peers` trên mạng đang chạy mới nói ra.

#### Sửa: chỉ BEACON khai công khai

Các node cùng máy giữ địa chỉ **nội bộ**. Node ở nhà cung cấp thứ hai chạy **cùng chế độ** với
`A1_PUBLIC_IP` của chính nó ⇒ nó gọi vào beacon được, và các node cùng máy gọi **ra** nó được
(gọi ra từ container luôn chạy). **Đó chính là O4.**

**Đo lại, cùng phép đo:** node1 `numPeers 2` · node2 `numPeers 2` — thấy node3 ở
`172.31.0.13:9753`. Từ ngoài Internet: `9751` bắt tay TCP ✓ · `9752`/`9753` **không nối được**
✓ (đúng thiết kế — publish cổng cho một node không khai công khai chỉ là bề mặt tấn công).

#### Kèm theo: mạng TẬP nay có tiền tố container riêng

`container_name` là **không gian tên toàn máy**, không thuộc project compose. Mạng tập netgen
sinh ra **không thể chạy cùng máy với mạng thật** — `docker compose up` va tên và dừng giữa
chừng. Đã chặn đúng một lượt diễn tập hôm nay, và nó dừng ở chỗ **an toàn** chỉ vì Docker canh
trùng tên, **không phải vì ta lường trước**. Băng tập nay là `9chain-a1-tap-node-N`; băng
**thật giữ nguyên** `9chain-a1-node-N`, cố ý (`console.env` khai `A1_NODE_CONTAINER`).

#### Ba cổng từ chối + đối chứng

thiếu `A1_PUBLIC_IP` · `A1_PUBLIC_IP` là IPv6 · `A1_STAKING_PORT_BASE` đâm vào `9650`.
Đối chứng: chế độ `docker` mặc định sinh ra **y hệt như trước** (0 dòng `staking-port`, 0 publish).

Tree `2954b987` → **`074aaa93`**, 24 patch; đối chứng ngược 23/24 → `2954b987` ✓.

#### Còn lại cho O4 — nói thẳng

⚠️ Đã chứng minh: **beacon tới được từ Internet**, và **mesh cùng máy còn nguyên**. **CHƯA**
chứng minh: một node ở **máy khác** bắt tay và đồng thuận được — việc đó cần một máy thứ hai,
tức cần **O4 (tiền)**. Đừng đọc lượt này thành "O4 xong".

---

### D-090 — O1: `kiem-khoa` **chấm 6/6 ✓ cho một bộ khoá đã chết**. Cổng thứ hai nối vào chain

`2026-08-28`, làm tiếp O1. Trước khi soạn quy trình cho David, tôi kiểm chính **công cụ** mà
quy trình đó dựa vào — và nó không đứng vững.

#### 🔴 Phép đo, không phải suy luận

Bộ khoá thế hệ **9001** (bộ `26/08`, mạng đã chết, tiền của nó **không tồn tại ở đâu cả**) vẫn
còn trên máy dev tại `local-net/net-public/`. Chạy `kiem-khoa` trên nó:

```
kiem-khoa — /keys/keys.txt
  networkID 9001 · mạng "network-9001" · HRP "love9" · 6 quỹ
  ⚠️  networkID 9001 KHÔNG thuộc băng 9Chain-A1 — chắc chắn đây là bộ khoá muốn kiểm?
  ✓ staking … ✓ foundation … ✓ ecosystem … ✓ faucet … ✓ private-sale … ✓ team
  ✓ đối chiếu chéo: 6 địa chỉ trong /keys/allocation.md đều có khoá
✓ 6/6 quỹ khôi phục đúng — mọi địa chỉ suy lại từ khoá đều khớp thứ tệp tự khai.
EXIT=0
```

Nó **có** cảnh báo — ghi nhận, đó là một nửa cổng thật. Nhưng **câu phán cuối vẫn xanh và mã
thoát vẫn `0`**, mà câu phán cuối mới là thứ người ta đọc và trích ra ngoài.

#### Vì sao đây đúng là lớp lỗi đắt nhất của repo này

`kiem-khoa` đo `keys.txt` ↔ `allocation.md` — **hai tệp nằm cùng một thư mục, chép cùng một
lượt**. Nó chứng minh bản sao **tự nhất quán**, không chứng minh bản sao **còn giá trị**.

🔴 **Và tình huống nguy hiểm nhất của O1 rơi đúng vào lỗ đó.** Rủi ro thật không phải "tệp
hỏng" — mà là **David cất đúng một bản, của thế hệ trước**: bộ `26/08` là bộ đang tồn tại vào
đúng lúc anh được nhắc phải sao lưu, và nó vẫn nằm nguyên trên máy dev để chép nhầm. Nếu bản
thứ hai là bộ đó thì `kiem-khoa` in **6/6 ✓**, O1 được chấm ĐẠT ở GO/NO-GO, và **khoá thật thì
vẫn chỉ có một bản**. Cùng họ với *"đường lui alias = xanh giả"* và *"cổng chỉ chứng minh
đường của nó"*.

#### Đã làm — `scripts/check-keys-on-chain.mjs`

Không sửa `kiem-khoa`: nó nằm trong **patch 0023**, đụng vào là đụng đường tái lập fork và
phải sinh lại cả 24 patch — bốn ngày trước ngày G, cái giá đó không đáng cho một cổng **cần
mạng mới chạy được**. Cổng vận hành thì đặt ở `scripts/`, đúng chỗ `check-*.mjs` đang ở.

Nó **chỉ đọc `allocation.md`** — tệp tự khai *"CÔNG KHAI được, không chứa khoá bí mật"*.
**Không đọc, không in, không gửi đi khoá riêng nào.** Mắt xích `keys.txt → địa chỉ` do
`kiem-khoa` chứng minh; tệp này nối `địa chỉ → tiền trên chain đang chạy`.

| Ô | Đo bằng | Phép so | Vì sao chọn phép so đó |
|---|---|---|---|
| X/P **khoá** | `lockedStakeable` + `platform.getStake` | **khớp từng nLOVE9** | tiền khoá không tiêu được ⇒ lệch = sai bộ |
| **C-Chain** | `eth_getBalance(addr, **"0x0"**)` | **khớp từng wei** | số dư **ở block 0** là lịch sử genesis, bất biến, không trôi theo ngày |
| X/P **thanh khoản** | số dư X + `unlocked` | `0 < đo ≤ khai` | ví tiêu được ⇒ đòi khớp là đẻ báo động giả |
| `networkID` đầu tệp | `info.getNetworkID` | **CHẶN** nếu lệch | đây đúng là ca `kiem-khoa` chỉ cảnh báo rồi thoát `0` |

⚠️ Quỹ staking không có `lockedStakeable` — 8.999.991 LOVE9 của nó nằm trong stake của 9
validator. Vế khoá vì thế đo bằng **tổng** `lockedStakeable + staked`, **không đặc cách theo
tên quỹ**: tên đổi được, phép cộng thì không.

#### Nghiệm thu

| | |
|---|---|
| Bộ g0 thật (`C:\Users\abc\9chain-a1-keys\g0\`) | **6/6 khớp chain đang chạy**, exit `0` |
| `kiem-khoa` trên cùng bộ đó | **6/6 ✓** + đối chiếu chéo `allocation.md` 6/6 |
| 🔴 Bộ 9001 đã chết | **8 lệch, exit 1** — trong khi `kiem-khoa` cho nó **6/6 ✓ exit 0** |
| Đối chứng ngược `--self-test` | **5/5 đỏ đúng chỗ** |

Kèm một phép đo O1 chưa từng có: **6/6 quỹ của bộ khoá trên máy dev giữ tiền thật trên g0** —
khoá 8.999.991 (staked, khớp self-bond 999.999 × 9) · 2.600.000.001 · 810.000.000 × 2 ·
C-Chain@block0 1.000.000.000 + 99.999.999. Trước lượt này O1 **chưa bao giờ nối bộ khoá với
tiền**, chỉ nối nó với một tệp nằm cạnh nó.

#### 🔴 Đối chứng ngược lại bắt lỗi trong CHÍNH lượt vá này — lần thứ tư trong dự án

Ca *"một ô KHOÁ lệch đúng 1 LOVE9"* ra **XANH**. Cổng không sai — **ca kiểm bắn nhầm ô**:
`2,600,000,001` xuất hiện **hai lần trong cùng một dòng** (ô `Tổng` rồi mới tới ô `khoá`), và
`String.replace` trơn thay ô **đầu**.

Nhưng bắn nhầm mới lộ ra cái đáng giá: **ô `Tổng` không được cổng nào canh**, mà nó chính là ô
người ta đọc và trích ra ngoài — không chain nào bác được nó, chỉ **phép cộng** bác được. Nay
cổng kiểm `Tổng == lỏng + khoá + C`, và ca đối chứng tách làm hai, mỗi ca nói một chuyện.

⇒ **Vẫn đúng luật cũ, thêm một vế:** cổng chưa ai thấy nó ĐỎ thì mới kiểm một nửa — và **ca
đối chứng chưa ai kiểm là nó bắn trúng ô nào thì cũng chỉ là một nửa**. Một ca đối chứng ra
xanh có hai nghĩa, "cổng thủng" và "ca bắn trượt", và chúng nhìn giống hệt nhau.

#### Còn lại của O1 — nói thẳng

`kiem-khoa` + `check-keys-on-chain` là **HAI lệnh**, chạy trên **cùng một thư mục** mới khép
vòng. D-085 hứa *"O1 nay là một lệnh chạy được"* — câu đó nay **sai**, ghi ra thay vì để nó
đứng. Đầu ra của lệnh mới in cả hai bước ở chân màn hình để không ai chạy nửa vòng.

🔴 Và **không cổng nào trong hai cổng đó tạo ra bản sao thứ hai.** Khoá g0 vẫn ở **đúng một ổ
đĩa**. Việc còn lại của O1 vẫn nguyên: **David lấy bản anh tự cất, chạy hai lệnh trên nó** —
xem `docs/O1-CUSTODY-VERIFICATION.md`.

---

### D-091 — M11.10: ví ký ở máy dev, **hầm SSH trong cùng container**. Khoá không chạm server

`2026-08-28`. Mảnh A1 còn nợ của sơ đồ custody O1 — D-085 đã dò ra ràng buộc nhưng chưa dựng.

#### Vấn đề: mọi lượt nạp quỹ hôm nay là một lượt khoá quỹ đi lên máy công khai

Ví X/P chạy **trên server** (`9chain-a1-xpwallet`), khoá nằm trong env container. Lượt g0
`27/08` đã phải lách bằng container tạm `a1-fund-tmp` rồi `docker rm -f` ngay — **né được,
không đóng được**. Ngày G nạp lại cả 6 quỹ ⇒ phải đóng thật.

#### Hai lớp chặn của đường thẳng — đo lại `28/08`, **cả hai đều ĐÚNG**

| Đường | Đo được |
|---|---|
| RPC công khai | `/ext/info` `/ext/bc/X` `/ext/bc/P` `/ext/bc/C/rpc` = **200** · **`/ext/bc/C/avax` = 404** — đúng đường `primary.MakeWallet` cần |
| Hầm SSH mở từ Windows, ví trong container | ví gọi `host.docker.internal` ⇒ **header `Host` mang đúng chuỗi đó** ⇒ node **403** (`A1_HTTP_ALLOWED_HOSTS=localhost,127.0.0.1`, D-083) |

Đo thẳng qua hầm, ba ca cạnh nhau: `Host: 127.0.0.1` → **200** · `Host: localhost:19650` →
**200** (cổng bị bỏ qua) · `Host: host.docker.internal` → **403**.

⚠️ **403 đó là tin tốt đọc ngược** — bộ lọc Host chặn đúng một thứ đáng chặn, trong một tình
huống không ai dựng ra để thử nó. Đường ra **không phải nới nó**, và đã không nới.

#### Đã dựng — `local-net/deploy/wallet-tunnel/` + `scripts/wallet-over-tunnel.mjs`

Hầm SSH chạy **TRONG CÙNG container với ví** ⇒ ví gọi `127.0.0.1:9650`, header `Host` tự nó đã
nằm trong danh sách cho phép. **Không nới một cổng nào ở server, không đổi một dòng cấu hình
node nào.**

🔴 **Thứ tự trong `enter.sh` là toàn bộ giá trị của nó: chứng minh đường đi TRƯỚC, nạp khoá SAU.**
Ba phép đo chạy **mỗi lượt**, không phải lượt đầu rồi tin mãi:

| | Đo | Vì sao ở đây |
|---|---|---|
| a | `networkID` khớp số **bắt buộc khai** | cổng rẻ nhất, bắt sai lầm đắt nhất: bắn giao dịch của quỹ vào **thế hệ khác** |
| b | `/ext/bc/C/avax` = 200 | chính đường RPC công khai không có; 404 ở đây là M11.10 mất lý do tồn tại |
| c | 🔴 **đối chứng ngược**: `Host` lạ = **403** | giữ cho (b) còn nghĩa — ngày nào ô này ra 200 thì bộ lọc Host đã bị nới và (b) không chứng minh gì nữa |

#### Ba thứ dựng ra vì đo mới thấy, không phải vì thiết kế trước

1. **Khoá SSH phải chép ra rồi `chmod 600`.** Tệp mount từ NTFS hiện ra `0777` trong container
   và `ssh` **từ chối** ("UNPROTECTED PRIVATE KEY FILE"); mount `:ro` nên không siết tại chỗ được.
2. **`known_hosts` BẮT BUỘC, `StrictHostKeyChecking=yes`.** Hầm này chở **giao dịch đã ký của
   quỹ**; chấp nhận host lạ (TOFU) là để ngỏ chỗ cho một node giả bơm UTXO sai vào lúc ví đang
   dựng giao dịch. Ví ký cục bộ nên MITM không lấy được khoá — nhưng **lái được thứ được ký**.
3. **Khoá ví vào bằng TỆP MOUNT, không bằng `-e WALLET_KEY`.** Env của container hiện nguyên
   văn trong `docker inspect` và nằm lại trong lịch sử shell của người gõ.
   🔴 Và `keys.txt` genesis chứa **cả 6 quỹ trong một tệp** ⇒ phải khai `A1_VI_QUY=<tên quỹ>`;
   **nhiều hơn một khoá mà không chọn thì DỪNG**, không lấy cái đầu tiên. Lấy nhầm quỹ ở đây là
   ký bằng khoá của một quỹ khác — **hỏng câm, và vĩnh viễn nếu giao dịch đã lên chain.**
   Container in **địa chỉ** (không phải khoá) trước khi ví lên, để bắt "chọn nhầm quỹ" trước khi ký.

#### Nghiệm thu — chạy thật trên mạng công khai, David duyệt lượt ký

| | |
|---|---|
| Nghiệm thu đường đi | 3/3 đạt, in ra mỗi lượt |
| Đối chứng ngược `--self-test` | **3/3 đỏ đúng chỗ**: `networkID` sai băng · `known_hosts` rỗng · đích SSH sai |
| Ví lên, đọc chain | `pBalance 89.99999173` — **khớp từng chữ số** với phép đo độc lập qua RPC công khai |
| 🔴 **KÝ THẬT** | `p-to-x 0.1 LOVE9` tự gửi mình · `exportTx saTLkuyy…` · `importTx c1zDFCg4…` |
| Đọc lại bằng **RPC công khai**, không qua ví | P `89.99999173 → 89.8999813` · X `0.009 → 0.108` · `getTxStatus` = **`Accepted`** |

⇒ **Khoá ở máy dev ký được giao dịch lên mạng công khai mà không một byte khoá nào chạm server.**
Đây là vế `primary.MakeWallet` — thứ `--check` **không** chứng minh được, vì ví chỉ dựng khi GỬI.

#### Giới hạn — đừng trích mạnh hơn

✅ **Đường `A1_VI_QUY` đã chạy thật cùng ngày — xem D-091b bên dưới.**
⚠️ Container thường trực `9chain-a1-xpwallet` **trên server vẫn còn** và vẫn giữ khoá
`chain-factory` trong env. D-091 mở đường mới, **chưa gỡ đường cũ**. Gỡ nó là việc vận hành,
làm cùng lượt ngày G.

---

### D-091b — `--fund`: chọn 1 trong 6 khoá của `keys.txt`, và **dòng chữ trong tệp không được tin**

`2026-08-28`, đóng nốt giới hạn D-091. Ngày G nạp **6 quỹ liên tiếp** từ **một tệp** —
đây là đường sẽ chạy nhiều nhất, và là đường hỏng câm dễ nhất.

#### Sửa một chỗ trước khi thử: `--check` nay kiểm được cả việc CHỌN QUỸ

Bản D-091 để việc chọn quỹ nằm **sau** cổng `--check` ⇒ cách duy nhất để biết *"khối nào được
chọn"* là **chạy ví lên với khoá thật**. 🔴 **Chính phép kiểm ấy là một lần phơi khoá.** Nay
`--check --wallet-key <tệp> --fund <quỹ>` đọc tệp, in **địa chỉ**, đối chiếu, rồi **dừng — không khởi
động ví**. Sáu quỹ kiểm được liên tiếp mà không lần nào có ví HTTP cầm khoá.

#### 🔴 Phát hiện: dòng `P-addr` trong `keys.txt` là CHỮ NGƯỜI VIẾT, không phải phép đo

Bản đầu in địa chỉ lấy từ dòng `P-addr` của khối. Khối `[team]` mang **khoá của team** nhưng
dán **địa chỉ của foundation** thì dòng in ra **trông đúng hoàn toàn**, và ví vẫn ký — bằng
khoá team, dưới cái tên foundation. Người bấm không có cách nào thấy.

⇒ Nay gọi thẳng **`kiem-khoa` trên đúng khối vừa chọn**: địa chỉ phải **suy lại được TỪ KHOÁ**.
Đây là lần đầu hai công cụ của O1 nối vào nhau thay vì đứng cạnh nhau.

⚠️ Đo được ở ca đối chứng: dòng `quỹ chọn: team → P-love91agflqw…` in ra **vẫn trông đúng**;
chỉ dòng `kiem-khoa` sau đó mới bác. **Giữ cả hai dòng là cố ý** — dòng trên là thứ tệp *tự
khai*, dòng dưới là thứ *đo được*, và để chúng cạnh nhau thì người đọc thấy được cái nào là cái nào.

#### Nghiệm thu — chạy thật trên `keys.txt` 6 khoá của g0

| | |
|---|---|
| 6/6 quỹ chọn đúng | `staking` · `foundation` · `ecosystem` · `faucet` · `private-sale` · `team` — **sáu địa chỉ khác nhau**, khớp `ALLOCATION-PUBLIC.md` từng ký tự |
| Phép so phân biệt được | `ecosystem` là khối **thứ 3**, `team` là khối **thứ 6** — nếu mã lấy khối đầu thì hai ca này đã sai |
| Mỗi quỹ có `kiem-khoa` xác nhận | địa chỉ **suy từ khoá**, không phải đọc chữ |
| Ví lên thật với khoá `--fund` chọn | `--fund faucet` → ví khai `X/P-love91l778hux…` = đúng địa chỉ faucet công bố · X/P `0/0` khớp `ALLOCATION-PUBLIC.md` (tiền faucet nằm ở C-Chain) · dừng container ngay |
| Đối chứng ngược `--self-test` | **6/6 đỏ đúng chỗ** (3 ca đường mạng + 3 ca đường chọn quỹ) |

Ba ca chọn quỹ nay là **cổng thường trực**, không phải một lượt thử: tệp 6 khoá mà không khai
`--fund` ⇒ **dừng, không lấy khối đầu** · `--fund` trỏ tên không tồn tại ⇒ dừng · khối tự mâu
thuẫn ⇒ dừng.

⚠️ Ba ca đó dựng trên **bộ khoá thế hệ 9001 ĐÃ CHẾT** trong repo — đúng khuôn 6 khối, và tiền
của nó **đo được là 0** (D-090), nên bản chép tạm không phơi thứ gì. Bản chép nằm trong
`mkdtemp` và bị xoá cuối hàm. **Đừng đổi ca này sang dùng khoá thật.**

#### Còn lại

⚠️ `--fund` đã chứng minh **chọn đúng + nạp ví được**. **Chưa** chứng minh **ký** bằng một khoá
quỹ — lượt ký thật của D-091 chạy trên `chain-factory` (ví nóng), cố ý. Ký bằng khoá quỹ chỉ
nên xảy ra **một lần, ngày G, khi nạp thật**.
⚠️ `9chain-a1-xpwallet` trên server **vẫn còn và vẫn giữ khoá trong env** — chưa gỡ.

---

### D-092 — Gỡ `9chain-a1-xpwallet` khỏi server. Và phép quét sau đó lộ hai thứ khác

`2026-08-28`, David yêu cầu. Đây là đường cũ mà D-091 thay thế: ví HTTP **không auth**, giữ
khoá `chain-factory` trong **env container**, chạy thường trực trên máy công khai.

#### Soi cái đích trước — bốn phép đo trước khi đụng vào

| | Đo được |
|---|---|
| Khoá trong env | `WALLET_KEY` **sha256 `1dc334145c8a1abc`** = **trùng khít** khoá `chain-factory` đang giữ ở `local-net/net-public/chain-factory-key.txt` trên máy dev ⇒ **xoá không huỷ bản duy nhất nào** |
| Ai trỏ tới | **không tuyến Caddy nào** · **không mã console/faucet nào** · **không tệp env nào** — grep cả `/etc/caddy/` lẫn nguồn trên server |
| Ai đang nối | `ss -tn :8090` ⇒ **0 kết nối** |
| Chính sách | `restart=no`, `WALLET_URI=172.28.0.11:9650`, `--restart` khác `up-all.sh` ⇒ **chạy tay**, không phải do script nào dựng lên |

🔴 Điểm cuối quan trọng hơn vẻ ngoài: `up-all.sh` **cũng** dựng một `9chain-a1-xpwallet`, nhưng
**không truyền `WALLET_KEY`** ⇒ ví đó dùng khoá `ewoq` mặc định, và đó là máy dev. Nên đây
**không** phải ca *"vá trên server rồi lượt deploy sau dựng lại"* (B-5/B-6). Không cần sửa
`up-all.sh`; cần sửa **tài liệu**, vì `WALLET-OPERATIONS.md` mô tả lượt chạy tay đó là cách làm.

#### Đã làm — dừng trước, xoá sau

`docker stop` ⇒ đo lại sản phẩm công khai (`/` 200 · `/faucet/api/supply` 200 ·
`/console/api/chains` 401 đúng cửa auth · RPC sống · **9/9 node**) ⇒ rồi mới `docker rm`.
Thứ tự đó mua được một cửa sổ `docker start` hoàn nguyên; `rm -f` thẳng thì không có cửa sổ nào.

**Đối chứng sau:** không container nào còn `WALLET_KEY` · `find ~/9chain-a1 -name keys.txt` ⇒ **0**.

#### 🔴 Nhưng "không còn `WALLET_KEY`" KHÔNG PHẢI "không còn khoá" — tôi suýt khai thiếu

Phép quét đầu chỉ tìm **đúng tên biến** `WALLET_KEY`. Quét lại theo **HÌNH DẠNG** khoá
(`PrivateKey-…` hoặc `0x`+64 hex) trên **mọi** container và mọi tệp:

| | Kết quả |
|---|---|
| `9chain-a1-faucet` → `FAUCET_PK` | **CÓ CHỦ Ý** — ví nóng, `faucet.env`, "lộ khoá chỉ mất phần faucet" |
| `genesis.json` · `console-tmp/*.json` | **báo động giả** — khớp rơi vào `mixHash`/`parentHash`, không phải khoá riêng |
| 🔴 `~/9chain-a1/vi-thu.json` | **khoá riêng trần, 130 byte, `{"address","pk"}`**, `25/08`. Đo trên g0: **số dư 0** (đối chứng: Foundation cùng lệnh ra 1 tỷ ⇒ phép đo phân biệt được) ⇒ ví thử thế hệ đã chết, **mất tiền = 0**, nhưng vẫn là một khoá trần nằm trên máy công khai |
| 🔴 `~/9chain-a1/src/9chain-a1-config/genesis.json` | **genesis LOCAL của Avalanche vẫn còn trên server** — `networkID 9001`, 3 địa chỉ `X-local1…` (khoá **công khai trong repo avalanchego**). Repo đã **XOÁ** tệp này `27/08` vì nó là đường boot nguy hiểm; **server thì chưa** |

⇒ **Bài học lặp lại lần thứ ba, ở một lớp mới:** `check-deploy-drift.mjs` (D-088) canh **18 tệp
trong 3 nhóm**. Một tệp bị **XOÁ** khỏi repo mà vẫn nằm trên server thì **không nhóm nào thấy** —
cổng đó đo *"tệp trong phạm vi có khớp không"*, không đo *"trên server có gì thừa"*.

⚠️ **Đừng trích mạnh hơn thực tế:** mạng công khai boot bằng `~/9chain-a1/net/genesis.json` do
netgen sinh, **không** bằng tệp kia. Hôm nay nó là **cái bẫy nằm im**, không phải lỗ đang chảy.

#### Còn lại

🔴 **Hai tệp trên CHƯA XOÁ — chờ David.** Xoá tệp trên máy công khai nằm ngoài câu *"gỡ
xpwallet"*, và `vi-thu.json` có thể còn ai đó đang dùng làm ví thử.

---

### D-092b — Xoá hai tệp còn lại. Và phép quét dọn lại xác nhận được một điều lớn hơn

`2026-08-28`, David duyệt xoá cả hai.

#### Soi đích trước — đo trên thứ ĐANG CHẠY, không đọc tài liệu

| | |
|---|---|
| 9 node có đọc `config/genesis.json` không | **KHÔNG** — cả 9 đều `--genesis-file=/9chain-a1/net/genesis.json` (đọc `docker inspect`, không đọc compose) |
| `9chain-a1-chains` (nginx) có phục vụ nó không | **KHÔNG** — chỉ `location = /data/console-chains.json` với `alias`, **không `autoindex`**. Chú thích trong chính conf đó nói rõ: *"chỉ mở đúng MỘT file … để không lộ những file khác nằm cùng thư mục config (genesis mẫu, console-tmp/…)"* |
| Ai trỏ tới `vi-thu.json` | **0** |
| Ghi lại trước khi huỷ (luật O2) | `vi-thu.json` `a3ffed60…` · `config/genesis.json` `5b77a812…` |

⇒ `shred -u -n 3` cả hai · đối chứng `ls` ⇒ **No such file** · `l1-evm-genesis.json` và
`console-chains.json` **còn nguyên** · sản phẩm sau đó: `/` `/chains/` `/faucet/api/supply`
đều 200, `9chain-a1-g0`, **9/9 node Up 12 giờ (không node nào restart)**.

🔴 **Một lượt đo của tôi ra 404 và suýt bị đọc thành "vừa làm hỏng":** tôi gọi
`:8093/console-chains.json` trong khi đường thật là **`/data/console-chains.json`**. Đường
đúng ra **200**, cả nội bộ lẫn công khai. **Lỗi ở phép đo, không ở sản phẩm** — đúng lớp
*"đo sai đại lượng"*, lần này tự mình dính.

#### Quét dọn: cái gì còn lại, và vì sao KHÔNG xoá

| Còn `X-local1…` | Kết luận |
|---|---|
| `upstream/avalanchego/genesis/genesis_local.{go,json}` · `genesis_test.json` · một `examples/` | **MÃ NGUỒN UPSTREAM, phải giữ.** Xoá là hỏng fork |

⇒ Tệp vừa xoá đúng là **đứa lạc đàn**: bản chép rời trong thư mục `config` mà node **từng**
boot bằng nó. Không phải "dọn mọi thứ có chữ `X-local1`".

#### 🔴 Và phép quét khép lại được một câu D-085 mới chỉ khẳng định một nửa

Quét **toàn máy** theo hình dạng khoá, rồi đối chiếu hash với **cả 6 khoá quỹ g0**:

| Nơi | Khoá | Kết luận |
|---|---|---|
| `9chain-a1-faucet` → `FAUCET_PK` | ví nóng | **có chủ ý** |
| `~/9chain-a1/console.env` → `A1_CLI_KEY` | **`1dc334145c8a1abc` = `chain-factory`** | **có chủ ý** — console cần nó để đẻ L1; và đẻ chain đang **TẠM ĐÓNG** (D-087) |
| `console.env` → `A1_L1_ADMIN` = `0xf408235C…` | **ĐỊA CHỈ Foundation, không phải khoá** | dùng làm admin của L1 sinh ra. Nhìn giật mình, đo ra vô hại |

**Không hash nào trùng bất kỳ khoá nào trong 6 quỹ** (`91e3a12f` · `417c9c08` · `321fe3d6` ·
`f68aa092` · `e42bb357` · `35bc2f61`). ⇒ **Trên server không còn một khoá quỹ nào** — trước đây
đó là lời khẳng định dựa vào `find -name keys.txt`; nay nó dựa vào **đối chiếu hash toàn máy**.

#### 🔴 Việc của David — do TÔI gây ra

Lệnh in `console.env` của tôi che **hình dạng khoá** nhưng **không che token**, nên
`A1_CONSOLE_TOKEN` đã hiện **nguyên văn** trong bản ghi phiên. Bản ghi nằm trên máy David,
không công khai ⇒ **rủi ro thấp nhưng khác 0**. **Nên đổi token** (sửa `console.env` rồi
`local-net/deploy/console-restart.sh`). Chưa làm — đổi token là đổi auth của dịch vụ công khai
đang chạy.

---

### D-092c — Đổi `A1_CONSOLE_TOKEN`. Và nó lộ ra: token **chưa từng đổi qua hai lượt re-genesis**

`2026-08-28`. **Nguyên nhân là lỗi của tôi:** lệnh in `console.env` ở D-092b che **hình dạng
khoá** nhưng **không che token**, nên `A1_CONSOLE_TOKEN` hiện nguyên văn trong bản ghi phiên.
David duyệt đổi.

⚠️ Bài học của lớp che: **danh sách "cái gì là bí mật" viết theo HÌNH DẠNG thì bỏ sót mọi bí mật
không có hình dạng.** Khoá riêng nhận ra được (`PrivateKey-…`, `0x`+64hex); **token thì trông y
hệt một chuỗi cấu hình bình thường**. Cùng họ với *"đo sai đại lượng"*, ở phía đầu ra.

#### Trước khi đổi — hai phép đo đổi cách làm

| | |
|---|---|
| Ai dùng token | **người thật**: ô `prompt()` trong `console/index.html:98` · `console-deploy.sh` · `bridge-test.mjs` · `auth-e2e-test.mjs` ⇒ **David cần giá trị mới**, không thể chỉ đổi rồi im |
| Console chạy bằng gì | `node local-net/console/server.mjs`, **PPID 1**, không compose, không unit ⇒ phải dùng `console-restart.sh` |
| 🔴 `console-restart.sh` trên server | **KHÔNG CÓ** — repo có, server không. Lại đúng lớp *repo ≠ server*, lại **ngoài phạm vi 18 tệp** của `check-deploy-drift`. Đã `scp` sang, `sha256` khớp hai đầu `97706131660266f7` |

#### Đã làm

Token **sinh trên server** (`secrets.token_bytes(24)` → base64 32 ký tự, **đúng khuôn cũ**),
**không đi qua bản ghi phiên**. Cổng tự kiểm trong lượt sửa: độ dài phải bằng bản cũ · số dòng
không đổi · `diff` mọi dòng **trừ** dòng token ⇒ **khớp từng byte** (chứng minh `A1_CLI_KEY`
không bị đụng).

`console-restart.sh` chạy sạch: **PID 3456928 → 3700068** — chính bài kiểm của script (*"cổng có
người nghe CHƯA phải bằng chứng, phải là NGƯỜI KHÁC"*) là thứ chứng minh bản mới đang phục vụ.

#### Nghiệm thu — bốn chiều, có cả chiều PHẢI ĐỎ

| | |
|---|---|
| 🔴 **token CŨ (đã lộ)** | **401** ⇒ đổi thật, không phải khai suông |
| token MỚI | **200** |
| không token · token rác | **401 · 401** |
| công khai | `/console/api/chains` **401** · `/` `/chains/` `/faucet/api/supply` **200** |

#### 🔴 Và một quả mìn hẹn giờ suýt để lại

`grep` token đã lộ trên toàn máy sau khi đổi: **5 tệp `console.env.bak*` đều còn nó** — gồm
`bak-720m` và `bak-pre-g0`. ⇒ **Token đó chưa từng được đổi qua HAI lượt re-genesis** (720M-era
→ 9001 → g0). Một token tĩnh dùng chung, sống lâu hơn cả hai thế hệ mạng.

Và quan trọng hơn: **phục hồi bất kỳ bản `.bak` nào là bật lại token đã lộ**, im lặng.

**Không xoá 5 tệp đó** — chúng là điểm hoàn nguyên thật (`A1_CLI_KEY` và cấu hình các thế hệ).
Thay dòng token bằng **một chuỗi ngẫu nhiên khác cho từng tệp, không ai biết**, kèm 3 dòng chú
thích tại chỗ. ⇒ Phục hồi một bản `.bak` nay cho ra console **không ai đăng nhập được bằng
token**, thay vì console **chạy bằng token đã lộ**. *Hỏng ồn hơn hỏng câm.*

⚠️ **Đặt giá trị rỗng thì rẻ hơn — và tôi đã loại.** Nó phụ thuộc vào việc `requireSecret` coi
rỗng là thiếu, điều tôi **chưa đo**. Và một placeholder tự nghĩ ra thì **chính nó nằm trong bản
ghi phiên** ⇒ lại là token ai cũng biết. Ngẫu nhiên trên server là đường duy nhất không dựa vào
giả định nào.

**Đối chứng:** `grep` token cũ toàn máy ⇒ **0 tệp**. Đối chứng ngược: `A1_CLI_KEY` vẫn còn trong
4/5 bản `.bak` (bản thứ 5 vốn không có — định dạng cũ) ⇒ phép sửa **không** dọn nhầm thứ khác.

#### Token mới ở đâu

`C:\Users\abc\9chain-a1-keys\console-token.txt` — ngoài repo, ngoài git, cùng chỗ khoá g0.
Ghi bằng **đường ống thẳng từ server vào tệp**, không qua màn hình. Đối chứng bằng **hash**:
tệp trên máy dev `79235ba36980be4a` = `console.env` trên server, và console trả **200** cho nó.

## D-093 — Cổng bộ định danh XUYÊN NGÔN NGỮ, và console phải hỏi node nó đứng ở thế hệ nào (2026-08-28)

**Đo được, không suy.** Thế hệ mạng được khai **hai lần bằng hai ngôn ngữ**, ở hai tệp mà
**không cổng nào nối lại**:

| nguồn | tệp | ai đọc |
|---|---|---|
| Go | `utils/constants/network_ids.go` → `A1Gen` | binary + netgen |
| JS | `local-net/lib/chainid.mjs` → `A1_GEN` | console cấp chainId cho L1 người dùng |

`chainid.mjs` **tự khai** mình là bản chép (*"Đừng sửa số này một mình"*) — nhưng lời dặn đó
sống trong một khối chú thích, tức nó chỉ có hiệu lực với người **đọc đúng tệp đó đúng hôm ấy**.
Và `grep networkID local-net/console/server.mjs` ⇒ **0 kết quả**: console **chưa bao giờ hỏi
node** nó đang nói chuyện với thế hệ nào.

🔴 **Thiệt hại nếu để nguyên:** ngày G bump `0 → 1`. Quên một bên ⇒ console cấp chainId từ khối
của **thế hệ khác**, im lặng, vào một genesis **BẤT BIẾN**. Thu hồi chain **không** trả lại số
nhận dạng ⇒ không sửa được sau.

**Vá hai lớp, vì đó là hai lớp khác nhau:**

| lớp | cổng | canh cái gì |
|---|---|---|
| repo | `check-consistency.mjs` — đọc `A1Gen`/`A1IDGoc`/`A1IDGocTap`/`A1Name`/`A1NameTap` **thẳng từ Go**, so với `A1_GEN`/`A1_ID_GOC`/`NETWORK_ID`/`TEN_MANG`/khối chainId của JS | hai tệp trong repo có khớp nhau không |
| sản phẩm | `console/server.mjs` → `kiemTheHeMang()`, gọi trong `createChain` | **mã trong repo ↔ MẠNG ĐANG CHẠY** — đúng lớp đã để B-14 hở hai ngày (D-088) |

**Ba trạng thái, HAI trong ba đều CHẶN:** khớp → phục vụ · lệch → chặn · **chưa đo được → cũng
chặn** (*"không biết mình ở thế hệ nào"* không phải lý do để phát một số vĩnh viễn; rỗng ≡ hỏng,
D-069b). Đo **mỗi lượt, không cache** — một kết quả "khớp" nhớ từ lúc boot sẽ sống sót qua đúng
thứ nó sinh ra để bắt: một lượt sinh lại mạng dưới chân console.

🔴 **Bẫy đã ĐO trước khi viết:** `info.getNetworkID` trả về **CHUỖI** `"999999999"`, không phải
số. So `===` với số ⇒ cổng **đỏ vĩnh viễn** (hỏng theo hướng "chặn tất", và cổng chặn tất thì
sẽ bị gỡ). Đã cắm hẳn một ca kiểm cho cả hai dạng.

**Nghiệm thu:**
- `check-consistency.mjs`: **17 đạt · 0 lỗi** · **14/14 ca đối chứng ngược ĐỎ**, trong đó hai ca
  đầu là đúng hai cách quên của ngày G (*bump JS quên Go* · *bump Go quên JS*).
- 🔴 **Đối chứng trên TỆP THẬT** (không phải ca tiêm vào bộ nhớ): `sed` đổi `A1_GEN = 1` trong
  `lib/chainid.mjs` ⇒ cổng đỏ, **mã thoát 1**; hoàn nguyên ⇒ 0.
- `generation-test.mjs` (mới): **13/13 đạt** trên console THẬT với một **node giả đổi được câu trả
  lời** — đo bằng mạng thật chỉ tới được trạng thái *khớp*, đúng trạng thái không cần cổng.
- 🔴 **Đối chứng mức bộ:** gỡ hai dòng cổng khỏi `createChain` ⇒ **7 hỏng, exit 1** ⇒ bài kiểm
  nối vào **mã thật**, không tự kiểm chính nó.
- Ca *khớp* chứng minh bằng cách gửi **tên sai** và đòi lỗi trả về là lỗi TÊN ⇒ cổng đã cho đi
  qua, mà **không tiêu một slot L1 nào**.
- Không gãy gì: `siwe-test` 21/21 · `auth-e2e-test` **38/38** · `chainid-test` 35/35.

⚠️ **Hệ quả phải biết:** `console/server.mjs` đổi ⇒ `check-deploy-drift.mjs` **sẽ báo console
lệch, và đó là ĐÚNG** — mã mới ở repo, chưa lên server. Deploy là việc có người bấm.

## D-094 — `console-deploy.sh` chép 15 tệp nhưng chỉ đối chiếu 9 (2026-08-28)

Tìm thấy trong lúc làm D-093. **Bản thứ hai của chính lỗ D-088**, ngay trong cùng một script:
bước **CHÉP** đã đọc `manifest-deploy.json` (bản vá D-088), nhưng vòng **ĐỐI CHIẾU** ngay sau đó
vẫn **liệt kê tay 9 tệp** — thiếu `lib/chainid.mjs`, `chainid-taken.json`,
`chainid-issued.json`, `chainid-test.mjs`, `l1-evm-genesis.json`.

🔴 Tức **đúng bộ tệp đã để B-14 hở hai ngày lại nằm ngoài tầm nhìn của cổng**, lần này ở khâu
sau. Một lượt `scp` hỏng ở năm tệp đó ⇒ script in đủ 9 dòng `✓ khớp` rồi restart — đúng kịch bản
mà khối chú thích ngay phía trên nó mô tả (B-3), chỉ khác là xảy ra ở những tệp **không có trong
danh sách** thay vì ở `presets.mjs`.

**Bài học chung:** vá một danh sách chép tay bằng cách cho **một** chỗ đọc manifest là chưa đủ —
phải đếm xem trong cùng file còn mấy chỗ nữa đang giữ bản chép. Nay vòng đối chiếu đọc **cùng
`$TEP`** với bước chép (một danh sách, **ba** nơi đọc), và script **in ra số tệp đã đối chiếu**
để hai con số lệch nhau là nhìn thấy được ngay.

**Nghiệm thu:** `bash -n` sạch · manifest cấp **15** tệp ⇒ chép 15, đối chiếu 15.
⚠️ Chưa chạy `console-deploy.sh` thật (đợt này **không deploy**) — vá này nghiệm thu ở mức đọc
mã + cú pháp, và phải được nhìn thấy chạy thật ở lượt deploy kế tiếp.

## D-095 — `console-deploy.sh` HỎNG TỪ CHÍNH COMMIT VÁ NÓ, và lượt deploy `28/08` là lần chạy trót lọt ĐẦU TIÊN

**David yêu cầu deploy console `28/08`.** Bước đọc manifest chết ngay:

```
process.stdout.write((m.nhom.console.tep||[]).join('
'))                                    ← xuống dòng THẬT nằm trong chuỗi JS
SyntaxError: Invalid or unexpected token
```

`git show` xác nhận dòng đó vào repo ở **`a16c81c` — đúng commit của D-088**, tức bản vá sinh
ra để đóng gốc rễ B-14 (*"console-deploy.sh liệt kê tệp thẳng trong script"*) **chưa từng chạy
trót lọt một lần nào**. `lib/chainid.mjs` lên được server bằng đường **chép tay**, và vì kết quả
cuối cùng đúng nên không ai phát hiện công cụ đã chết.

🔴 **Luật cứng #2 nhìn ngược lại:** repo đòi *"mọi cổng mới phải được nhìn thấy lúc nó ĐỎ"*.
Ca này cho thấy vế còn thiếu — **một cổng chưa ai thấy nó CHẠY XANH THẬT thì cũng chưa phải
cổng.** D-088 nghiệm thu `check-deploy-drift.mjs` (đo lệch) rất kỹ mà không chạy `console-deploy.sh`
(chép lên) lấy một lần.

**Sửa:** in từng dòng bằng `forEach(f => console.log(f))` — không có xuống dòng nào nằm trong
chuỗi JS nữa.

**Kèm D-094 được nghiệm thu THẬT trong cùng lượt:** vòng đối chiếu nay đọc cùng `$TEP`, và
script in `→ đối chiếu 15 tệp (bằng số tệp đã chép)`. Trước đó chép 15 / đối chiếu 9.

### Nghiệm thu lượt deploy (chạy thật, `28/08`)

| | |
|---|---|
| Bài kiểm trước khi chép | `siwe` · `auth-e2e` · `chainid` · **`thehe` (mới)** đều đạt |
| Chép | **15 tệp** theo manifest |
| Bài kiểm **trên server** | `21/21` + `32/32` |
| Đối chiếu | **15/15 khớp** (lần đầu đủ số) |
| Restart | console PID `3700068` → `3716315`, nghe 8091 sau **2s** |
| Drift sau deploy | **19 khớp · 0 lệch · 0 thiếu** |
| 🔴 Cổng thế hệ TRÊN SẢN PHẨM | console sống tự khai: `thế hệ : ✅ khớp node đang chạy — g0 · networkID 999999999 · "9chain-a1-g0"` |
| Đường công khai | `a1.9chain.org/` **200** · `/console/` → 308 → `/create-chain/` **200, 39.050 byte** · `create` không token → **401 đúng câu** |

⇒ **D-093 nay đã đóng ở CẢ HAI lớp**: repo (`check-consistency`) và **sản phẩm** (console sống
đang hỏi node mỗi lượt). Không còn khoảng cách repo ↔ server nào trong phạm vi cổng canh.

## D-096 — Tên miền sống là `a1.9chain.org`; `testnet-a1.9chain.org` trả 525 qua Cloudflare

Trong lúc nghiệm thu deploy, đo `https://testnet-a1.9chain.org/console/` ⇒ **525** ở mọi đường,
và tôi **suýt khai một sự cố không có thật**.

**Đo tiếp mới ra sự thật:** origin `308` sang `https://a1.9chain.org/…` cho mọi đường; bắt tay
TLS tới origin **thành công từ Internet** (308) và từ chính server (308); `rpc-a1.9chain.org`
**vẫn phục vụ người dùng thật 200** qua cùng một Caddy; và **log Caddy 30 phút không có một
request `testnet-a1` nào** — tức request chết **trước** khi tới origin. ⇒ Lỗi nằm ở cấu hình
Cloudflare **của riêng tên miền cũ**, không ở server, và **không liên quan tới lượt deploy**.

🔴 **Bài học, cùng họ với "đo sai đại lượng" nhưng ở một trục mới — ĐẠI LƯỢNG ĐÂY LÀ TÊN MIỀN.**
Ba dấu hiệu tách "server hỏng" khỏi "tôi gõ nhầm địa chỉ", theo thứ tự rẻ dần:
1. một tên miền khác trên **cùng máy** có sống không (`rpc-a1` ⇒ sống);
2. request có **tới log của origin** không (⇒ không);
3. bắt tay TLS **thẳng tới IP origin** có được không (⇒ được).

⚠️ **Không đổi hàng loạt 80 chỗ dẫn tên cũ trong repo:** phần lớn nằm trong sổ lưu trữ và các
quyết định cũ — chúng **kể về quá khứ**, và sửa chúng cho gọn mắt là viết lại lịch sử. Đã ghi
bẫy vào `CLAUDE.md` §5 mục 9b thay vì `sed` cả repo.

## D-097 — O1 thành MỘT cổng: `scripts/o1-check.mjs`, ba mã thoát (2026-08-28)

D-090 đã dựng đủ **hai** phép đo và tài liệu đã dặn *"phải chạy CẢ HAI"*. Nhưng **một lời dặn
không phải một cổng.** Nó chỉ có hiệu lực với người đọc đúng tài liệu, đúng hôm ấy, và nhớ tới
lệnh thứ hai **sau khi lệnh thứ nhất vừa in một dòng xanh rất thuyết phục**:

```
✓ 6/6 quỹ khôi phục đúng — mọi địa chỉ suy lại từ khoá đều khớp thứ tệp tự khai.
```

Đó chính là dòng `kiem-khoa` in cho bộ khoá **thế hệ 9001 đã chết**. Và tình huống nguy hiểm
nhất của O1 không phải *"tệp hỏng"* mà là **cất đúng một bản, của thế hệ trước** — trên đúng
con đường đó, phép đo còn thiếu lại là phép đo dễ quên nhất. Việc này gấp vì **David sắp tự
chạy nó** (B-16, chặn GO/NO-GO `29/08`).

### Ba mã thoát, không phải hai

| mã | nghĩa | khi nào |
|---:|---|---|
| `0` | **ĐẠT** | cả hai vế chạy được **và** cả hai xanh |
| `1` | **SAI** | một vế chạy được và báo đỏ |
| `2` | 🟡 **CHƯA KẾT LUẬN** | một vế **không chạy được** (thiếu tệp · thiếu docker · không tới được chain) |

Gộp `2` vào `1` thì *"hỏng"* nuốt mất *"không biết"* và người ta đi sửa nhầm thứ. Gộp `2` vào
`0` thì tệ hơn nhiều: **một bản sao chưa được kiểm sẽ được chấm là đã kiểm** — đúng lớp lỗi
D-090 sinh ra để chặn. Thứ tự phán xét trong mã cũng theo đó: *"không chạy được"* xét **trước**
*"sai"*.

### Nghiệm thu — trên DỮ LIỆU THẬT, không phải ca dựng

| ca | mong | ra |
|---|---:|---:|
| bộ `g0` **đang sống** (`9chain-a1-keys/g0`) | 0 | **0** ✓ |
| 🔴 bộ `9001` **đã chết** (`local-net/net-public`) | 1 | **1** ✓ — cùng lượt đó vế 1 vẫn in `✓ 6/6 quỹ khôi phục đúng` |
| **giấu `check-keys-on-chain.mjs` đi** (mô phỏng "chỉ chạy kiem-khoa") | 2 | **2** ✓ — *không xanh* |
| không gọi được docker | 2 | **2** ✓ |
| thư mục không tồn tại · thư mục RỖNG | 2 | **2** ✓ |

**6/6 ca đối chứng ngược đúng mã thoát.** Ca thứ hai là ca đắt nhất và nó chạy trên **đúng bộ
khoá đang nằm trên máy dev** — thứ dễ bị chép nhầm thành "bản sao lưu O1" nhất.

### Hai chi tiết kỹ thuật đáng ghi

1. 🔴 **Go bản địa KHÔNG build được `kiem-khoa`** (Windows, go1.26.4): `libevm/crypto` cần
   CGO/btcec khác phiên bản ⇒ `assignment mismatch`. Đường duy nhất là container
   `golang:1.25.10` + volume `9chain-gomod` (527 MB cache đã có). ~28s mỗi lượt.
2. 🔴 **`spawnSync` thay vì shell là một quyết định, không phải thói quen.** Trên Git Bash
   (Windows), MSYS đổi mọi đối số bắt đầu bằng `/` thành đường dẫn Windows ⇒ `-w /src` biến
   thành `C:/Program Files/Git/src` và docker từ chối. Tài liệu O1 đã phải dặn
   `MSYS_NO_PATHCONV=1`; gọi qua `spawnSync` thì **lời dặn đó thôi cần thiết** — cùng tinh
   thần với chính mốc này: **biến lời dặn thành cấu trúc.**

Đã cập nhật `docs/O1-CUSTODY-VERIFICATION.md` và `BLOCKERS.md` B-16 sang một lệnh; hai lệnh rời
**vẫn giữ** cho ai muốn đọc kỹ từng vế.

## D-098 — Cổng drift nhìn HƯỚNG NGƯỢC: tệp có trên server mà không có trong repo (2026-08-28)

Gotcha 14 đã ghi lỗ này từ `28/08` nhưng chưa ai vá: `check-deploy-drift.mjs` chỉ hỏi *"tệp
**trong danh sách** có khớp không"*. Một tệp **xoá khỏi repo mà vẫn nằm trên server** thì
**không nhóm nào thấy** — và điều đó đã cháy thật (D-092b: genesis LOCAL của Avalanche, khoá
ewoq công khai, repo xoá `27/08` mà server còn tới `28/08`).

### Quyết định thiết kế: "thừa" là HAI thứ, không phải một

Gộp chúng là đẻ ra cổng đỏ tràn lan — và chính tệp này đã ghi bài học đó (bản đầu dùng glob,
báo **27/58 lệch**, phần lớn đỏ giả; *"một cổng đỏ ở chỗ không cần đỏ sẽ bị người ta học cách
bỏ qua, và nó sẽ bị bỏ qua đúng vào lần nó đỏ thật"*).

| nhóm | định nghĩa | màu |
|---|---|---|
| 🔴 **MỒ CÔI** | trên server, **không tồn tại trong repo** | **ĐỎ, exit 1** — lớp bẫy nằm im |
| 🟡 **mồ côi ĐÃ KHAI** | mồ côi có mục trong `thuaDaBiet` **kèm lý do** | in ra, không đỏ |
| ℹ️ **NGOÀI TẦM CANH** | có trong repo nhưng không trong manifest | đếm + liệt kê, không đỏ — đây là lỗ **phủ sóng**, không phải vết thương |

Thư mục quét **suy ra từ chính manifest**, không khai tay — một danh sách thư mục viết riêng sẽ
trôi lệch khỏi danh sách tệp, đúng lỗ D-088/D-094. `-maxdepth 1`: đệ quy là nuốt `node_modules`
và biến cổng thành tiếng ồn, còn bẫy thật nằm ngay trong thư mục.

🔴 **`null` ≠ `[]`.** Không quét được là **không biết**; quét ra rỗng là một **khẳng định**.
Nhập hai thứ đó là đúng cách một cổng báo "sạch" cho một lượt quét chưa từng chạy (rỗng ≡ hỏng,
D-069b). Có một ca đối chứng riêng cho việc này.

### Bật MẶC ĐỊNH, không núp sau cờ

Bản đầu tôi định làm `--quet-thua`. Bỏ, vì nó tái phạm đúng thứ A15-2 vừa sửa: **một cổng phải
nhớ bật thì nó là một lời dặn, không phải một cổng.**

### Nghiệm thu

- **6/6 đối chứng ngược** trên danh sách tổng hợp (`--self-test`), gồm ca `null` ⇒ phải khai
  *"không biết"* và ca `[]` ⇒ là khẳng định thật.
- **Chạy thật, chỉ đọc, lên server:** bắt **7 tệp mồ côi** ngay lần đầu.
- 🔴 **Đối chứng trên DỮ LIỆU THẬT:** gỡ một mục khỏi `thuaDaBiet` (≡ một mồ côi MỚI xuất hiện)
  ⇒ cổng **ĐỎ, exit 1**; khai lại ⇒ xanh. Phép đo **phân biệt được**, không phải chặn tất.
- Sau khi khai đủ 7 mục: `19 khớp · 0 lệch · 0 thiếu · 0 mồ côi · 7 mồ côi đã khai · 14 ngoài
  tầm canh`, exit 0 ⇒ `console-deploy.sh` vẫn deploy được.

### 🔴 Cái nó tìm thấy quan trọng hơn chính nó — B-17

Hai trong bảy tệp là **đường lui trỏ vào quyết định đã đóng**, và số đo nói rõ:

| tệp | `A1_DE_CHAIN_MO` | `siwe` |
|---|---:|---:|
| `server.mjs.bak-pre-D087-…` (27/08) | **0** | 7 |
| `server.mjs.bak-truoc-admin` (24/08) | **0** | **0** |

Khôi phục bản thứ nhất = mở lại đẻ chain mà D-087 đóng. Bản thứ hai còn gỡ luôn xác thực ví
(M4.1/D-020) ⇒ `admin` quay lại kiểu **gõ tay**. Chúng không phục vụ đường nào hôm nay, nhưng
chúng **được đặt tên như một đường lui** — người xử lý sự cố lúc 2 giờ sáng sẽ `cp` một trong
số đó lại. ⇒ **B-17**, cần David xoá (ghi lên server là ranh giới cứng của đợt này).

**Khai vào `thuaDaBiet` KHÔNG phải là tha bổng:** mỗi mục nói thật nó là gì, kể cả khi sự thật
là *"🔴 NGUY HIỂM — chờ David xoá: B-17"*. Cổng xanh nghĩa là *"không có mồ côi nào CHƯA ai
nhìn"*, không phải *"không có mồ côi nào"*.

## D-099 — Công cụ O3b: kéo sổ SỐNG về rồi dồn `chains` → `retired` (2026-08-28)

`GDAY-A1-REMAINING.md` §5c đã chỉ đúng cách làm từ `26/08` — **dồn rồi giữ tệp**, đừng reset
(mất sổ chống phát lại) và cũng đừng giữ nguyên (console tưởng chain còn sống trên một mạng
chúng không tồn tại). Nhưng tới `28/08` **chưa có công cụ nào làm việc đó**: nó vẫn là thao tác
tay trên một tệp JSON — đúng loại việc đã hỏng một lần và mất **43 bản ghi**.

### 🔴 Đo được một lỗ thứ hai, chưa ai nêu

`gen-chainid-issued.mjs` đọc sổ **trong repo**; sổ **đang sống** nằm trên **server**; và
`check-deploy-drift.mjs` **cố ý bỏ qua** tệp đó (`boQua`, vì nó đổi theo thời gian). ⇒ **Không
cổng nào canh khoảng cách giữa hai sổ.**

Đo `28/08`: server `0 sống · 0 thu hồi` · repo `1 sống — DeltaChain#9201`. **Hai tệp không phải
bản sao của nhau.** Hôm nay vô hại (server rỗng), nhưng nếu server có chain mà repo chưa biết
thì lượt sinh lại ngày G sẽ xoá chúng khỏi **mọi nơi** — không ai còn nguồn để dựng lại sổ chặn.

⇒ `--pull` kéo sổ sống về (chỉ đọc), đối chiếu với mọi sổ repo đã biết, và **lưu vào
`docs/archive/` những bản ghi chưa ai biết — trước khi có gì bị xoá**.

### Hai phân biệt phải làm đúng, và tôi làm sai một cái ở bản đầu

1. **`null` ≠ `[]`** — *không hỏi được server* trả **exit 2** ("không biết"), khác hẳn *sổ rỗng*.
2. 🔴 **THIẾU KHOÁ ≠ SAI KIỂU.** Bản đầu tôi từ chối mọi sổ không có mảng `retired`, viện luật
   *"rỗng ≡ hỏng"* — và nó **từ chối luôn sổ thật của repo**. Sai: `loadState()` trong
   `console/server.mjs` **khai rõ** tệp không có khoá `retired` là **định dạng trước M4.4** và
   vẫn hợp lệ. Luật đúng:
   - khoá **vắng mặt** ⇒ định dạng cũ, coi như rỗng, **nhưng phải KHAI RA** (in `⚠️`);
   - khoá **có mà sai kiểu** ⇒ **HỎNG** — đó mới là lúc "coi như rỗng" nghĩa là **im lặng vứt
     đi phần sổ mình không đọc được**.

   *Bài học: "rỗng ≡ hỏng" là luật đúng, nhưng áp nó vào **sự vắng mặt của một khoá tuỳ chọn**
   là biến một cổng thành một cái chặn đường. Cổng đúng phải đọc mã đang chạy trước — ở đây là
   `loadState()` — chứ không suy từ một khẩu hiệu.*

### 🔴 Sổ sống RỖNG là trạng thái HỢP LỆ, không phải hỏng

Sau một lượt sinh lại, rỗng là đúng. Áp "rỗng ≡ hỏng" ở đây sẽ **chặn đúng lượt chạy đúng**.
Nên `--pull` in một dòng vàng nói rõ *"hợp lệ — nhưng nếu anh ĐANG mong thấy chain trong đó thì
một lượt reset vừa xảy ra"*. Rỗng vừa là trạng thái hợp lệ vừa là triệu chứng; công cụ không
được chọn hộ người đọc.

### Nghiệm thu

| | |
|---|---|
| Đối chứng ngược | **9/9 ca đúng**, gồm 4 ca ĐỎ (`retired` sai kiểu · `chains` sai kiểu · bản ghi thiếu `chainId` · sổ `null`) |
| Tính chất bao trùm | `|ra.retired| = |vào.chains ∪ vào.retired|` đúng ở **n = 0, 1, 5, 43** — không mất, không đẻ |
| `--pull` chạy thật | server `0/0` · repo biết **53 bản ghi từ 3 sổ** · exit 0 kèm dòng vàng |
| `--compact` chạy thật | sổ repo thật ⇒ `chains 0 · retired 1`, bản ghi mang `thuHoiLuc` + `lyDo`, và ⚠️ khai luôn "sổ không có khoá `retired`" |
| Sau đó | `gen-chainid-issued.mjs --check` vẫn xanh — 47 chainId · 53 tên, và `9201` vẫn nằm trong sổ chặn |

⚠️ **Không ghi gì lên server** — công cụ chuẩn bị tệp ở máy dev; đưa lên là việc có người bấm.
Đó cũng là lý do nó **không** tự chạy `gen-chainid-issued.mjs`: hai việc đó phải là hai quyết
định, vì việc thứ hai ghi vào một tệp đang được deploy.

## D-100 — `watch-network.mjs`: biến hai thứ "phải nhớ tự đo" thành một lệnh có mã thoát (2026-08-28)

Tới `28/08`, hai thứ **có thể giết mạng** đang được canh bằng **trí nhớ**:

| | Canh bằng gì trước đó | Hỏng thì sao |
|---|---|---|
| Số dư `chain-factory` | `HANDOFF.md` tự khai *"chưa có giám sát, phải nhớ tự đo"* | ví cạn ⇒ đẻ chain **chết câm** |
| **B-12** hạn validator | `BLOCKERS.md`: *"cần David dựng lịch nhắc"* | 9 node rụng trong cửa sổ **56 ngày**; **node cuối rụng là mạng DỪNG** |

Và ngày hết hạn **chỉ đọc được bằng phép đo** — `BLOCKERS.md` dặn thẳng *"đừng tính tay"*, vì
mốc thật phụ thuộc `InitialStakeDurationOffset` (so le 7 ngày, **cố ý**) và giờ sinh genesis.

### Ba mã thoát, cùng họ với `o1-check.mjs`

`0` mọi mục đo được và đạt · `1` có mục ĐỎ · `2` có mục **không đo được**. Thứ tự phán xét:
**ĐỎ trước, KHÔNG-ĐO-ĐƯỢC sau** — một mục hỏng đã biết quan trọng hơn một mục chưa biết.
🔴 `do === 0` là **đo được**, không phải `null`: có ca đối chứng riêng, vì số dư 0 và
"không hỏi được" là hai tình huống hoàn toàn khác nhau mà cùng trông như "không có số".

### Chín mục — mỗi mục đo một đại lượng khác nhau

Đáng chú ý ba mục **nối hai lớp**, tức chúng đo *quan hệ* chứ không đo *giá trị*:
- **tên mạng / networkID ↔ `A1_GEN` của repo** — đưa cổng D-093 xuống lớp vận hành: giờ
  chạy một lệnh là biết repo có còn nói cùng thế hệ với mạng không.
- **`supplyCap` TRÊN NODE ĐANG CHẠY ↔ `SupplyCap` đọc thẳng từ Go** — đúng gotcha 4
  (*"thứ đi vào genesis phải nghiệm thu trên node đang chạy"*), nay tự động.

### Ngưỡng B-12 — và vì sao vàng ở 120 chứ không phải 30

Node **đầu** rụng ở ~ngày 309, lúc đó 8 node còn chạy ⇒ có ~56 ngày để phản ứng. Vàng ở
**120 ngày** để lời nhắc đến **trước** khi cần gấp; đỏ ở **45** vì gia hạn validator không
phải việc làm trong một buổi chiều. *(Cảnh báo vàng **không** làm mã thoát thành 1 — một cổng
đỏ vì một việc còn 4 tháng nữa sẽ bị học cách bỏ qua.)*

### Nghiệm thu

- **13/13 ca đối chứng ngược** (`--self-test`): 6 ca chấm điểm + 7 ca ngưỡng B-12 (309 / 121 /
  119 / 46 / 44 / 0 / **-5** ngày).
- **Chạy thật trên mạng công khai: 9/9 mục xanh** — `9chain-a1-g0` · `999999999` · 9 validator ·
  8 peer · hạn sớm nhất **308 ngày** (`2027-07-02`) · factory **89,899 LOVE9** ·
  `supplyCap":7900000001000000000` đọc **trong container** khớp Go · faucet có số đo ·
  console `/whoami` 200.
- 🔴 **Hai đối chứng trên DỮ LIỆU THẬT, hai chiều hỏng khác nhau ⇒ hai mã khác nhau:**
  RPC chết ⇒ **exit 2** (`KHÔNG ĐO ĐƯỢC`, không phải "đạt") · đặt `A1_GEN = 1` trong khi mạng
  vẫn g0 ⇒ **exit 1** với hai dòng đỏ nêu đích danh cả hai số. Ca thứ hai chính là **kịch bản
  ngày G nếu chỉ bump một bên**.

### Phát hiện phụ

Tài liệu (`HANDOFF.md`, `PROGRESS.md` M10.4) gọi endpoint tiến trình của console là
`/api/tien-trinh`; **mã thật là `/api/progress`** (`server.mjs:1232`) và `console-deploy.sh`
gọi đúng tên đó. Không gây hỏng — nhưng ai gõ theo tài liệu sẽ nhận 404 và dễ đọc thành
"console hỏng". Bộ canh dùng `/whoami` (công khai, không cần token).

## D-101 — `gday-preflight.mjs`: runbook ngày G ở dạng CHẠY ĐƯỢC (2026-08-28)

Tới `28/08`, runbook ngày G nằm rải ở **năm tệp tài liệu** và **không có gì chạy được**. Một
quy trình chỉ tồn tại dưới dạng văn bản là một quy trình được thi hành **bằng trí nhớ**, vào
đúng ngày người ta bận nhất và ít ngủ nhất. Mà ngày G là **cơ hội một lần** — genesis bất biến,
sàn trượt cứng `2026-09-06`.

### 🔴 Luật quan trọng nhất của tệp này: VIỆC TAY không bao giờ được tính là "đạt"

Preflight in **12 việc tay** thành một danh sách ô trống, chia theo giai đoạn thi hành
(*trước khi đụng gì* → *trước `down -v`* → *lúc sinh mạng* → *sau khi mạng lên* → *sau khi
deploy*). Chúng **luôn hiện**, **luôn là ô trống**, và **không vào phép đếm "đạt"**.

Một preflight in *"✅ tất cả đạt"* trong khi ba việc quyết định nhất chưa ai làm thì nó không
phải cổng — nó là **giấy chứng nhận giả**. Câu phán cuối nói thẳng: *"preflight xanh KHÔNG có
nghĩa là sẵn sàng sinh mạng."*

### 12 cổng tự động, ba nhóm, theo đúng thứ tự thi hành

1. **CÂY FORK** — tái lập 24 patch lên `1cf1fc3` rồi so tree với `074aaa93…`. Chạy **đầu tiên**
   vì mọi thứ khác dựng trên nó. Kèm cổng đếm: thấy ≠ 24 patch ⇒ đỏ với câu *"sinh lại CẢ BỘ
   hay sửa luật, đừng thêm lẻ"*. Worktree dọn trong `finally`.
2. **CỔNG REPO** (8) — rẻ, không mạng, chạy trước để hỏng sớm.
3. **THẾ GIỚI THẬT** (3) — mạng đang chạy · repo ↔ server + tệp mồ côi · **tra lại sổ chainId
   công khai** (§7 mục 3 đòi tra **ngay trước** bước sinh genesis, vì sổ đổi trong cùng một ngày).

### Mã thoát: 0 / 1 / 2 — cùng họ với `o1-check.mjs` và `watch-network.mjs`

Ba công cụ của đợt này dùng **cùng một quy ước**: `2` = *không chạy được* ≠ `0` = *đạt*. Một
quy ước dùng chung là thứ người đọc học **một lần** rồi áp cho cả bộ.

### Nghiệm thu

- **Chạy thật: 12/12 cổng xanh**, exit 0, kèm 12 việc tay hiện đủ.
- 🔴 **Đối chứng ngược trên dữ liệu thật:** đặt `A1_GEN = 1` ⇒ preflight **ĐỎ, exit 1**, và
  **nêu đích danh** từng cổng hỏng.
- 🔴 **Và nó đo được một thứ chưa ai nêu — BÁN KÍNH ẢNH HƯỞNG.** Đổi **một** hằng số làm **bốn**
  cổng đỏ cùng lúc: số học tokenomics · **phép cấp chainId** (`33 đạt · 2 hỏng`) · canh mạng ·
  drift repo↔server. Tức lượt bump `A1Gen` ngày G **không phải sửa hai dòng rồi đi tiếp** — nó
  chạm bốn đường đo độc lập, và cả bốn phải được nhìn thấy xanh lại.
- **Sửa một câu nói dối gọn gàng của chính bản đầu:** với `--no-network`, nó in *"MỌI CỔNG TỰ
  ĐỘNG ĐỀU XANH"* trong khi 3 cổng bị bỏ qua. Số bỏ qua nay nằm **trong chính câu phán**, không
  ở một dòng phía trên mà mắt đã lướt qua.

## D-102 — B-13(b): đại lượng cần đo KHÔNG phải "lệch giữa 9 node" (2026-08-28)

`BLOCKERS.md` B-13(b) viết *"đo lệch đồng hồ 9 node"*. Đúng **ý**, sai **đại lượng** — và sai
theo hướng khiến người ta đo một con số vô nghĩa rồi tin nó.

Thứ quyết định Block Adam là **một** phép so: `block.timestamp > 2026-09-09T06:09:09Z`.
`block.timestamp` là đồng hồ **node đề xuất block**; thời điểm bấm gửi là đồng hồ **máy bắn**.
⇒ Đại lượng thật là **lệch(máy bắn ↔ node đề xuất)**.

🔴 **Lệch giữa 9 node hôm nay là 0 theo KIẾN TRÚC, không theo phép đo:** 9 container trên
**cùng một máy**, Docker không ảo hoá đồng hồ ⇒ chung một `CLOCK_REALTIME`. Đo 9 lần rồi khai
*"lệch 0ms, đã kiểm"* là đo một tính chất của **hạ tầng**, không phải của **đồng hồ** — và nó
sẽ được đọc thành "đã xử lý B-13(b)". Nó chỉ thành phép đo nhiều đồng hồ thật **sau O4**.

### Ba cách đo đã thử, hai cái BỎ — và lý do là bài học chung

| cách | RTT | ước lượng | phán |
|---|--:|--:|---|
| `ssh 'date +%s%3N'` | **4.100ms** | +3.150ms ±2.050 | 🔴 **BỎ** |
| `curl -sI` (Date header) | 1.600ms | +1.650ms ±1.300 | 🔴 BỎ |
| `fetch` trong tiến trình | **600ms** | +1.279ms **±800** | ✅ dùng |

🔴 **Vì sao `ssh` không dùng được, và nó tinh vi:** lệnh chạy ở **cuối** lượt bắt tay, không ở
giữa ⇒ giả định *đường đi đối xứng* mà NTP dựa vào bị **vỡ**. Năm mẫu ra `3149·3140·3150·3195·
3174` — độ tản chỉ ~55ms. Nhất quán cao **không phải bằng chứng đúng**: ở đây nó là bằng chứng
của một **thiên lệch hệ thống**, và thiên lệch đó **không tách được** khỏi lệch đồng hồ thật.
*(Một phép đo lặp lại rất ổn định vẫn có thể sai — ổn định chỉ nói về phương sai, không nói về
độ chệch.)*

⚠️ **Sàn sai số ±500ms là BẤT KHẢ KHÁNG:** header HTTP `Date` chỉ có **độ phân giải giây**.
Bài nào khai chính xác hơn thế là đang bịa chữ số. Lọc kiểu NTP: lấy mẫu **RTT nhỏ nhất**.

### Chọn bù theo BIÊN XẤU NHẤT, không theo giá trị trung tâm

Lấy giá trị trung tâm là chọn con số đúng 50% số lần — mà đây là việc **không có lần hai**.
`lech > 0` (node nhanh hơn máy bắn) là chiều **an toàn**; chiều nguy hiểm là node **chậm**.

**Đo thật `28/08`:** mẫu tốt nhất **+557ms ± 811ms** ⇒ biên xấu nhất node chậm **254ms** ⇒
`--offset-ms 3000` (sàn của lượt diễn tập `27/08`) **vẫn dư sức**. 7/7 ca đối chứng, gồm ca *không
đo được ⇒ trả `null`, KHÔNG rơi về sàn* — một nửa phép đo không phải phép đo.

🔴 **Phải đo LẠI sau khi mạng ngày G lên** — số này nói về mạng g0 hôm nay.

## D-103 — Cắt `HANDOFF.md` 2.026 → 250 dòng (2026-08-28)

Mỗi phiên mới trả ~85K token để đọc lại một tệp mà ~90% là lịch sử tệp đó **tự khai** là
*"không cần đọc nếu chỉ tiếp việc"*. Đây là chi phí **định kỳ**, không phải một lần.

Toàn bộ phần lịch sử sang [`docs/archive/HANDOFF-history-2026-08.md`](docs/archive/HANDOFF-history-2026-08.md)
— **1.793 dòng, không mất một chữ nào**. `HANDOFF.md` giữ: TL;DR · đợt 15 · việc tiếp · gotchas
· lệnh hữu ích. Luật cứng đã ra `CLAUDE.md` từ A15-0.

⚠️ **Không sửa nội dung lịch sử cho khớp hiện tại** — chúng **kể về quá khứ**; sửa cho gọn mắt
là viết lại lịch sử (cùng lý lẽ đã dùng cho 80 chỗ dẫn tên miền cũ ở D-096).

---

## D-104 — C1 **ra khỏi tầm ngắm của A1**; chữ khắc là ĐẦU VÀO, không phải phụ thuộc (2026-08-28)

**David chốt trực tiếp trong phiên `28/08`:** *"hai chain này song song, bạn hãy chỉ quan tâm
tập trung A1, C1 tôi điều phối riêng."*

Trước quyết định này, ba tệp sống của A1 đều khai C1 là **đường găng lớn nhất**:
`HANDOFF.md` (*"ngoài tầm A1: chữ khắc chờ C1 đóng băng byte"*), `PROGRESS.md` (cuối đợt 15),
`gday-preflight.mjs` (việc tay *"chờ C1 đóng băng byte"*), và `GDAY-A1-REMAINING.md` §8 xếp
*"C1 chưa đóng băng byte kịp `28/08`"* là **rủi ro số 1**.

⇒ **Đổi hình dạng, không đổi cơ chế.** A1 nhận **byte đã đóng băng như một đầu vào David cấp**:
không theo dõi C1, không chờ C1, không xếp C1 vào bảng rủi ro của mình. Cơ chế khắc
(patch 0010 + 0011, `A1_ENGRAVE*`) **đã xong 100% và vẫn phải giữ chạy được**.

🔴 **Vế A1 KHÔNG được bỏ cùng với C1:** *hạn chót đầu vào phải tới*. Byte tới sau bước sinh
genesis là **không khắc được nữa trong thế hệ đó** — genesis bất biến. Nên A1 vẫn phải khai
một mốc, và mốc đó thuộc runbook ngày G, không thuộc lịch của C1.

⚠️ **Đừng sửa hàng loạt các câu KỂ VỀ QUÁ KHỨ** có nhắc C1 (bảng so sánh M10.6, D-041 *"A1 làm
chuẩn, C1 sửa theo"*, H-5). Chúng kể đúng chuyện đã xảy ra. Chỉ đổi câu nói **A1 đang chờ gì**.

---

## D-105 — Diễn tập `docker build` cây 24 patch: **ĐẠT**, và nó bắt hai lỗi công cụ (2026-08-28)

**Vì sao chạy:** bản quét `28/08` đo được image node mới nhất (`9chain-a1/node:g0`) tạo lúc
`27/08 18:56`, tức **chưa image nào từng được dựng từ cây 24 patch**. Lượt build đầu tiên của
bộ patch đó bị xếp vào **đúng ngày G**, sau `down -v` — tức sau khi mạng cũ đã chết. Và bộ đó
mang **patch 0019/0022** (bí danh `LOVE9`), thiếu là **mọi ví X/C chết câm**.

**Cách chạy — không đụng gì đang sống:** tag riêng `9chain-a1/node:g1-dryrun` (không đè `g0`),
mạng TẬP `NETWORK_ID=899999999`, cổng `9760`, không server, không giao dịch, không `patches/`.

| Đo trên **node đang chạy** bằng image vừa build | |
|---|---|
| build | **exit 0** · `9chaingo/1.14.2 [… commit=9chain-a1-24patch-dryrun, go=1.25.10]` |
| `supplyCap` (log **trong** container) | `7900000001000000000` — khớp Go, khớp mạng công khai |
| `info.getNetworkID` · tên | `899999999` · `9chain-a1-tap-g0` |
| `eth_chainId` | `0x218711a09` = **9000000009** |
| **X-Chain `avm.getAssetDescription("LOVE9")`** | `LOVE9 Coin` · `LOVE9` · denom 9 ⇒ **0019/0022 CÓ trong binary** |
| 🔴 **đối chứng ngược `("AVAX")`** | **ĐỎ và nói ra lý do**: *"…registered under the alias 'LOVE9', not 'AVAX'. This is deliberate, not a bug…"* |
| cổng C-4 | nổ đúng: bản TẬP mang chainId THẬT ⇒ **cảnh báo lớn**, không im lặng |
| cổng patch 0020 | `.env` sinh ra với `A1_API_BIND=127.0.0.1` · `A1_HTTP_ALLOWED_HOSTS=localhost,127.0.0.1` |

🔴 **Lỗi 1 — `local-net/gen-network.sh` chuyển tiếp thiếu biến ⇒ đường sinh mạng ĐƯỢC GHI
TRONG TÀI LIỆU chết ở MỌI lượt gọi.** Script liệt kê đúng 3 cờ `-e` (`A1_P2P_MODE`,
`A1_IPV6_*`), trong khi patch 0020 (D-083) đã làm `NETWORK_ID` **bắt buộc**. Người dùng khai
`NETWORK_ID` ở shell thì biến đó **không vào tới container** ⇒ `FATAL NETWORK_ID chưa đặt`,
và thông báo nói về một biến người dùng **đã** đặt. **Cùng lớp lỗi D-095** (`console-deploy.sh`
hỏng từ chính commit vá nó): danh sách nằm thẳng trong script thì thứ thêm sau đó lặng lẽ rơi
ra ngoài. Đã vá: một mảng `A1_NETGEN_ENV` đủ **17 biến**, dựng cờ `-e` từ nó, và in
`NETWORK_ID` ra trước khi chạy. Nghiệm thu: trước khi vá ⇒ `exit 1`; sau khi vá ⇒ sinh xong
1 node, `exit 0`.

🔴 **Lỗi 2 — netgen ghi `image: 9chain-a1/node:dev` CẮM CỨNG vào compose nó sinh ra.** Không
có biến môi trường nào đổi được (đối chiếu toàn bộ `env("…")` của netgen: 18 biến, **không có
biến ảnh**). Ngày G build image mới rồi `up -d` mà quên sửa dòng đó ⇒ mạng lên bằng
**`:dev` (24/08, thời 18 patch)**, 9/9 node xanh, mọi cổng xanh — và bí danh `LOVE9` **không
có trong binary**. Đây đúng lớp *"đo sai đại lượng"*: cổng đo mạng, không ai đo **binary nào
đang chạy**. ⚠️ Mạng công khai hiện chạy `:g0` ⇒ dòng đó **đã bị sửa tay một lần** rồi.
**Chưa vá** — sửa netgen là đụng `patches/` (luật cứng 3, phải sinh lại CẢ BỘ), bốn ngày trước
ngày G không đáng. ⇒ Đưa thành **việc tay bắt buộc** trong preflight.

⚠️ **Diễn tập này KHÔNG thay được lượt build ngày G.** Image `g1-dryrun` dựng ở `A1Gen 0`;
ngày G bump `A1Gen 1` là **đổi binary** ⇒ vẫn phải build lại. Cái nó chứng minh là **đường
build thông và bộ 24 patch nạp đúng thứ nó hứa** — chỉ vậy, và đó là đủ để bước này thôi là
bước chưa ai đi.

⚠️ Vật liệu tập còn lại trên máy dev: `local-net/net-dryrun/` (bộ khoá **vứt đi** của mạng
`899999999`). Đã gitignore (`local-net/net-*/`), **chưa xoá được** trong phiên. Xoá tay —
đừng để nó nằm cạnh các thư mục thật, đúng bẫy gotcha 13.

---

## D-106 — B-10 có cổng: `check-robots.mjs` chấm bằng NỘI DUNG (2026-08-28)

B-10 mở từ `27/08` và tồn tại **chỉ như một dòng chữ trong `BLOCKERS.md`** — tức nó là *quy
trình*, không phải *cổng*, và nó sai đúng lúc được cần: sau khi David tắt tính năng ở
Cloudflare, không có gì nói cho ai biết là đã ăn hay chưa.

Đây là **ca xanh giả sách giáo khoa** của repo, nên cổng cố tình chấm **ngược thang đo**:

| tầng (`CLAUDE.md` §1) | đo được `28/08` | dùng để chấm? |
|---|---|---|
| mã HTTP | `200` | ❌ **không** — in ra kèm chú thích *"tầng yếu nhất"* |
| `content-type` | `text/plain` | ❌ không |
| **nội dung** | *"As a condition of accessing this website…"* | ✅ **đây là phép chấm** |
| header tầng trước | `cf-cache-status: HIT` · `age 1153s` · `max-age=14400` | ✅ nói **vì sao** |

🔴 **Đối chứng DƯƠNG là phần không được bỏ:** `/sitemap.xml` phải ra `DYNAMIC`. Thiếu nó thì
một origin chết cũng cho ra cùng triệu chứng ở `/robots.txt`, và ta đi sửa nhầm chỗ — đúng
bài học D-096 (*hai tên miền hỏng/sống khác nhau thì lỗi không nằm ở server*).

⚠️ **Không đo được origin trực tiếp**: `curl --resolve` vào `139.99.145.13` trả **403 "máy chủ
này chỉ phục vụ qua Cloudflare"** — bộ lọc `Host` của M11.10 đang làm đúng việc. Ghi lại đây
để phiên sau **đừng nới cổng đó ra cho dễ kiểm**.

**Nghiệm thu:** `--self-test` **6/6 đúng mã thoát**, gồm ca *"200 + text/plain nhưng nội dung của
Cloudflare"* ⇒ `1`, ca *"nội dung lạ không nhận ra của ai"* ⇒ **`2` CHƯA KẾT LUẬN** (không biết
≠ đạt), ca *"robots thật nhưng sitemap cũng không tới origin"* ⇒ `0` **kèm lưu ý về cả zone**.
Chạy thật trên sản phẩm ⇒ **`1`, đỏ**. ⇒ Cổng này **sinh ra đã ĐỎ**, thoả luật cứng #2 mà
không phải dựng ca giả.

🔴 **Kèm một lỗi bắt được lúc định nối vào preflight:** `gday-preflight.mjs` khai trong chú
thích một cờ `batBuoc` (*"sai nghĩa là đỏ vẫn không chặn"*) — **cờ đó chưa từng được cài**.
Đã **bỏ lời hứa** thay vì cài nó: một cổng *"đỏ nhưng không sao"* sẽ bị bỏ qua đúng lúc nó kêu
thật (lý lẽ D-070). ⇒ Mọi cổng trong preflight đều **bắt buộc**; cổng chưa đủ tư cách chặn
ngày G thì để **ngoài** và ghi vào `CLAUDE.md` §3 — `check-robots` thuộc nhóm đó (mặt web,
không chạm genesis).

---

## D-106b — ĐÍNH CHÍNH D-106 và B-10: **chẩn đoán sai từ `27/08`, đóng `28/08`**

**B-10 chưa bao giờ là một lỗ.** Cloudflare **CHÈN THÊM VÀO ĐẦU** `robots.txt`, không **THAY**
nó. Đo đầy đủ `28/08`: tệp của A1 còn nguyên bên dưới — `User-agent: *` · `Allow: /` · đủ 7
dòng `Disallow:` · `Sitemap: https://a1.9chain.org/sitemap.xml` (grep ra **3** lần trong tệp
phục vụ). **robots.txt của A1 vẫn luôn tới được người đọc.**

🔴 **Vì sao lỗi sống được hai ngày, và vì sao nó đắt hơn vẻ ngoài:**

| lượt | làm gì | sai ở đâu |
|---|---|---|
| `27/08` | đọc **dòng đầu** + header, kết luận *"Cloudflare trả robots.txt của chính nó"* | đọc dòng đầu, gọi đó là "đọc nội dung" |
| `28/08` bản đầu của `check-robots.mjs` | dựng cổng chấm bằng **dấu vân tay Cloudflare** ⇒ đỏ | **cùng lỗi, nhưng nay đóng băng vào một cổng** |

⇒ **Thang đo `CLAUDE.md` §1 nói *"đọc NỘI DUNG"*, không nói *"đọc DÒNG ĐẦU"* — và khoảng cách
giữa hai câu đó vừa tốn hai ngày.** Header `cf-cache-status: HIT` **đúng và vẫn đúng**: nó nói
về **đường đi**, không nói về **nội dung**. Cloudflare lấy tệp origin, chèn khối của nó vào
đầu, rồi cache **kết quả đã ghép**. Suy từ *"trả từ cache"* ra *"thay tệp của ta"* là một bước
nhảy không ai kiểm.

🔴 **Bài học riêng, và nó cay:** `web/public/robots.txt` **đã viết sẵn luật đúng trong chú
thích của chính nó** — *"đo NỘI DUNG mà không phụ thuộc VỊ TRÍ: `grep -q 'Sitemap: …'`. Đây là
mặt trái của xanh giả: **đỏ giả** cũng phá đúng thứ đó, chỉ chậm hơn."* Người viết dòng đó đã
đi trước cả hai lượt chẩn đoán. ⇒ **Trước khi dựng cổng cho một tệp, đọc hết tệp đó — kể cả
phần chú thích.** Nó thường đã chứa phép đo đúng.

⚠️ **Luật cứng #2 cần vế thứ ba.** Hai vế đã có: *cổng phải được nhìn thấy lúc ĐỎ* (#2), và
*cổng chưa ai thấy CHẠY XANH THẬT thì cũng chưa phải cổng* (D-095). Vế mới: **thấy nó đỏ chưa
đủ — phải kiểm rằng nó đỏ VÌ ĐÚNG LÝ DO.** Cổng bản đầu đỏ ngay lần chạy đầu, và cái đỏ đó
được đọc thành *"bằng chứng cổng nhạy"* trong khi nó là **đỏ giả**.

**Cổng nay chấm đúng:** một câu hỏi duy nhất quyết định xanh/đỏ — *chuỗi chỉ có thể tới từ tệp
của A1 (`Sitemap: https://a1.9chain.org/sitemap.xml`) có xuất hiện không?* — độc lập vị trí,
độc lập độ dài, độc lập việc Cloudflare có chèn gì hay không. Mọi thứ khác **hạ xuống ghi
chú**. **7/7 ca đối chứng**, gồm: *chỉ có khối Cloudflare, mất dòng Sitemap* ⇒ **1** ·
*route biến mất khỏi Caddyfile, trả HTML 404* ⇒ **2** · *Sitemap trỏ tên miền CŨ
`testnet-a1`* ⇒ **2** (không tính là dấu của A1) · **và ca tái hiện đúng lỗi của bản đầu**,
nay phải **XANH**. Chạy thật ⇒ **exit 0**.

**🟡 Còn lại một việc, và nó là QUYẾT ĐỊNH CHÍNH SÁCH của David — không phải lỗi.** Khối
Cloudflare chèn vào **nhân danh A1**: điều khoản *"As a condition of accessing this website,
you agree…"* · `Content-Signal: search=yes,ai-train=no,use=reference` · **cấm hẳn 9 bot**
(`Amazonbot`, `Applebot-Extended`, `Bytespider`, `CCBot`, `ClaudeBot`,
`CloudflareBrowserRenderingCrawler`, `Google-Extended`, `GPTBot`, …) · viện **Điều 4 Chỉ thị
EU 2019/790**. Với một testnet công khai mời cộng đồng, *"ai được đọc nội dung của A1"* là câu
David nên tự trả lời chứ không nhận mặc định của nhà cung cấp CDN.
⚠️ Lý do kỹ thuật phụ: nhóm `User-agent: *` của Cloudflare đứng **trước** nhóm của A1. RFC 9309
§2.2.1 buộc bot **gộp** hai nhóm cùng tên nên bot tuân thủ vẫn thấy `Disallow:` của A1 — bot
chỉ đọc nhóm đầu thì **không**, mà đó đúng là các dòng dựng ra để Blockscout khỏi bị bò hết.
**Rủi ro thấp, không phải zero.**
Chỗ tắt: `dash.cloudflare.com` → zone `9chain.org` → **Overview → Control AI Crawlers** → bỏ
chọn **Display Content Signals Policy**; hoặc **Security → Settings** → lọc *Bot traffic* →
*Instruct AI bot traffic with robots.txt*. Purge `/robots.txt` rồi chạy lại cổng.

---

## D-107 — B-17: lệnh xoá soạn sẵn sẽ XOÁ MẤT DỮ LIỆU; kéo sổ mồ côi về trước (2026-08-28)

B-17 (D-098) khai: *"Ba sổ danh bạ đã có bản lưu trữ chính thức trong repo
(`docs/archive/console-chains-*.json`) nên xoá không mất dữ liệu."* **Câu đó chưa từng được đo,
và nó sai với một trong ba.**

Đối chiếu `sha256` hai đầu `28/08`:

| server | byte | repo |
|---|--:|---|
| `console-chains.json.bak` | 3.116 | ✅ `b8c88b3e…` trùng `console-chains-pre-g0-2026-08-27.json` |
| `console-chains.json.bak-pre-regenesis` | 22.538 | ✅ `ca073735…` trùng `console-chains-pre-regenesis-2026-08-26.json` |
| **`console-chains.json.bak-1787728833`** | **20.489** | 🔴 `ca24eb59…` — **không có ở đâu khác** |

Repo có **hai** tệp archive, server có **ba** bản `.bak`. Không cổng nào bắt được vì cả hai
cổng liên quan nhìn chỗ khác: `check-deploy-drift` hỏi *"tệp này có được KHAI không"* (có — nên
nó im), `gen-chainid-issued` **cố ý không đọc sổ trên server** (đúng, để danh sách chặn tái lập
được). Khoảng giữa hai câu hỏi đó là chỗ tệp này nằm.

✅ **Đã kéo về** → `docs/archive/console-chains-2026-08-26T0720Z.json`, `sha256` **khớp hai
đầu**. Ảnh chụp `2026-08-26T07:20:33Z` — **3 chain sống · 39 thu hồi**, tức sổ ngay **trước**
lượt re-genesis `26/08`.

🔴 **Cổng `gen-chainid-issued --check` ĐỎ NGAY khi có nguồn thứ tư** — đúng chức năng, và đó là
lần nó chứng minh mình canh **nguồn** chứ không chỉ canh **kết quả**. `--write` xong: **47 chainId
· 53 tên — KHÔNG ĐỔI**. ⇒ Sổ đó **không thiếu lời hứa chống phát lại nào** (nó là tập con của
hai sổ kia). Nhưng nó vẫn là **bản duy nhất** của ảnh chụp ấy, và lý do dùng để biện minh cho
việc xoá thì **sai**.

⚠️ **Đừng đọc kết quả này thành "hoá ra không sao".** Điều được chứng minh là *lần này thiệt
hại bằng 0*, không phải *câu khẳng định kia đúng*. Nếu bản `.bak` đó là sổ của một nhánh khác
thì 42 bản ghi đã đi mất, và đi mất **do một dòng lệnh soạn sẵn kèm lời trấn an**.

**Hai thứ đổi trong B-17:**
1. Một dòng `shred -u` → **ba bước: LIỆT KÊ → XOÁ → ĐỐI CHỨNG** (kỷ luật D-092: *dừng trước, đo
   sản phẩm, rồi mới xoá*). Bước 1 tồn tại để mắt người nhìn thấy đúng **6** tệp trước khi
   bước 2 chạy — glob `console-chains.json.bak*` **không** khớp `console-chains.json` trần, và
   tệp trần đó là **sổ đang chạy**; sai một ký tự là mất danh bạ chain đang sống.
2. Bước 3 đối chứng bằng **hai cổng có sẵn**: `check-deploy-drift` (mồ côi 7 → 1) và
   `watch-network` (console `/whoami` vẫn 200) — không tin `ls` một mình.

🔴 **Luật rút ra: câu "đã có bản lưu rồi nên xoá được" là một PHÉP ĐO, không phải một câu trấn
an.** Trước khi xoá bất cứ thứ gì trên server: **đối chiếu `sha256` với bản lưu, TỪNG TỆP MỘT.**

---

## D-107b — B-17 lần thứ HAI suýt xoá nội dung duy nhất; hai tệp console `truoc-admin` (2026-08-28)

Áp đúng luật vừa rút ra ở D-107 (*"đối chiếu `sha256` với bản lưu, từng tệp một"*) lên **ba tệp
mã** còn lại của B-17 — thứ mà cả D-098 lẫn D-107 đều chưa kiểm, vì cả hai chỉ nghĩ tới ba sổ
danh bạ. Quét hash từng tệp đối chiếu **toàn bộ `git rev-list --all`** (4 nhánh: `main`,
`web-home`, `audit`, `brand-standardize`):

| tệp trên server | kết quả |
|---|---|
| `server.mjs.bak-pre-D087-1787862510` | ✅ **trùng git `69c80ce`** — đúng commit console công khai từng mắc kẹt (D-087/D-095). Xoá an toàn |
| **`server.mjs.bak-truoc-admin`** (14.037 B) | 🔴 **không trùng phiên bản git nào** |
| **`index.html.bak-truoc-admin`** (6.035 B) | 🔴 **không trùng phiên bản git nào** |

⇒ **Lần thứ HAI trong cùng một phiên** câu *"xoá không mất gì"* sai. Lần đầu là một sổ danh bạ
(D-107); lần này là **mã**, và `shred -u` là mất hẳn.

✅ **Đã lưu trữ** → `docs/archive/console-pre-admin-2026-08-24/` (kèm `SHA256SUMS.txt` +
README mang cảnh báo **KHÔNG BAO GIỜ khôi phục**). Khớp `sha256` hai đầu. **Quét bí mật trước
khi commit: 0 kết quả** cho `0x…64`, `PRIVATE KEY`, `A1_CONSOLE_TOKEN=`, `FAUCET_PK=`, base64
dài — không đưa bí mật vào git chỉ vì đang vội dọn dẹp.

🔴 **Giá trị của hai tệp không phải "mã cũ" mà là BẰNG CHỨNG:** chúng chứng minh server từng
chạy mã **sửa tay chưa bao giờ quay về git**. Cùng lớp với B-9 (`console/index.html` trên
server lệch **12 byte** so với cả `main` lẫn `web-home`) và D-095 (`chainid.mjs` lên server
bằng đường **chép tay**). Xoá đi là xoá bằng chứng của đúng thói quen vận hành mà repo đang chữa.

⚠️ **Bài học về hình dạng của lỗi, không phải về ba tệp này.** D-098 khai *"xoá 6 tệp"* kèm một
lệnh một dòng và một câu trấn an. Câu trấn an đó **đúng cho nhóm tệp mà người viết đang nghĩ
tới** (ba sổ) và **chưa từng được kiểm cho nhóm còn lại** (ba tệp mã) — mà lệnh thì xoá **cả
sáu**. ⇒ **Phạm vi của một lời trấn an hẹp hơn phạm vi của lệnh nó đi kèm**, và khoảng chênh đó
là chỗ dữ liệu biến mất. Kiểm **từng tệp trong lệnh**, không kiểm *"nhóm tệp"*.

---

## D-108 — Chuẩn hoá toàn diện định danh sang tiếng Anh; và ba lỗi nó lộ ra ở ba lớp khác nhau (2026-08-28)

David yêu cầu: *"quét lại toàn bộ hệ thống… các file có file nào đặt tên kiểu tiếng Việt không
thì sửa lại thành tiếng Anh hết. Chuẩn hoá toàn diện code."* Chốt phạm vi **tối đa** (gồm
`patches/`) và **không giữ bí danh**.

### Đã đổi

| Lớp | Số lượng |
|---|---|
| Tên tệp mã (`scripts/`, `local-net/`) | **15** — `git mv`, 15/15 git nhận là `R`, lịch sử giữ nguyên |
| Cờ CLI | **32 cờ · 325 lần thay** |
| Khoá JSON (hợp đồng liên tệp) | `manifest-deploy.json` + hai sổ chainId |
| id preset (**dữ liệu đã lưu**) | 6 |
| Tên tệp tài liệu | **56** (gồm `docs/vat-chung/` → `docs/evidence/`) |
| Tiêu đề commit của cây fork ⇒ tên tệp patch | **25** |

**Gộp hai tên cho một khái niệm** — đây mới là chuẩn hoá, không phải dịch: `--tu-kiem` (13 chỗ)
+ `--self-test` (4 chỗ đã có) ⇒ **một** `--self-test`; `--khoa-ssh` + `--key` ⇒ **một**
`--ssh-key`. Và **tách một tên đang mang hai nghĩa**: `--khoa` ⇒ `--wallet-key` (khoá riêng của
ví) ≠ `--ssh-key`; `--tep` ⇒ `--file` (tệp để đọc) và `--attach` (tệp kèm vào bản xuất).

### 🔴 Ba lỗi lộ ra, và chúng nằm ở ba lớp khác nhau — đó mới là phần đáng ghi

**1. `patches/` — cổng bắt được.** Kịch bản đổi cờ *"trên mọi tệp văn bản"* sửa **đúng một
dòng** trong patch 0006 (một cờ `--tu-kiem` nằm trong chú thích Go). `gday-preflight` đỏ ngay:
`tree fa2e502c ≠ 074aaa93`. Hoàn nguyên, chứng minh lại nền.

**2. Gói vật chứng O2 — KHÔNG cổng nào bắt được.** Cùng lượt quét đó sửa `--tu-kiem` bên trong
`00-DOC-TRUOC.md` của **cả hai** gói vật chứng ⇒ chúng tụt từ **9/9 xuống 7/9** và **im lặng
hoàn toàn**. Chỉ lộ ra vì tôi tình cờ chạy `sha256sum -c` sau một bước khác.

⇒ **Bài học, và nó tổng quát hơn cả hai ca:** *thứ nào phải đóng băng theo BYTE thì phải có
CỔNG canh byte.* `patches/` có luật cứng #3 nên nó có cổng, nên nó sống. Vật chứng chỉ có một
quy ước *"đừng sửa thư mục đó"* nằm trong đầu người viết script — và quy ước đó **không chặn
được gì**. Đã dựng `scripts/check-evidence.mjs` (xem D-109).

**3. Đổi khoá xuất mà quên biến cục bộ.** `soTen` → `nameCount` nhưng biến vẫn là `tens` ⇒
`gen-chainid-issued.mjs` ném `ReferenceError`. Cổng `--check` bắt ngay. Vô hại vì có cổng —
và đó chính là điểm.

### id preset: đổi ĐƯỜNG VÀO, giữ ĐƯỜNG ĐỌC

`chuan`/`khong-phi`/… **là dữ liệu đã lưu** trong `console-chains.json` (đo được: **42 bản ghi**
mang id cũ), và console **không bao giờ viết lại bản ghi đã đẻ**. Nên:

- **Đường VÀO (API)**: không bí danh. `apDungPreset(_, "khong-phi")` **ném lỗi**, liệt kê id hợp lệ.
- **Đường ĐỌC (hiển thị)**: bảng `TEN_PRESET` ở `/chains/` **giữ cả id cũ**. Xoá hàng cũ là làm
  mọi chain cũ hiện ra id trần thay vì tên.

Hai chuyện khác nhau: một cái **nhận đầu vào mới**, một cái **đọc quá khứ**. Gộp chúng lại thì
hoặc ta phá dữ liệu lịch sử, hoặc ta đẻ ra một bí danh mà David đã bác.

### Không làm — khai rõ, không giấu

**Định danh cục bộ trong JS và Go vẫn là tiếng Việt** (hàng trăm tên, nhiều tên 2–3 ký tự như
`ma`, `so`, `co`, `kq`). Đổi chúng bằng quét-và-thay là **rủi ro cao nhất, giá trị mỗi đơn vị
rủi ro thấp nhất**: chúng vô hình ngoài phạm vi tệp, trong khi một lần khớp nhầm chuỗi con làm
hỏng lặng một cổng đang canh ngày G. Với Go còn thêm một vế: `go vet` trên máy này **đang hỏng
vì lý do không liên quan** (libevm/`btc_ecdsa`, cgo) ⇒ **không nghiệm thu được**, và luật cứng
#2 nói thẳng một thay đổi không nghiệm thu được thì chưa xong. Bốn ngày trước ngày G không phải
lúc đổi thứ mình không đo được.

**`web/` không đụng** (luật cứng #4): `main` lệch `web-home` **78 tệp / +17.440 −2.792**, mọi
lần đổi tên tôi làm ở đó sẽ bị xoá lúc gộp. Đã liệt kê ra thành việc riêng cho lượt gộp.

---

## D-109 — `check-evidence.mjs`: gói vật chứng phải TỰ nghiệm thu được, và giờ có cổng (2026-08-28)

Sinh ra từ đúng lỗi thứ 2 ở D-108. Đo `sha256` **thực tế trên đĩa** ↔ `sha256` **gói tự khai**.
Không đọc git: một gói vật chứng phải đứng được **một mình**, kể cả khi tách khỏi repo — đó là
toàn bộ lý do nó tồn tại.

⚠️ **Nó KHÔNG nói gói mô tả đúng sự thật lúc đó.** Nó chỉ nói gói **chưa bị sửa kể từ lúc niêm**.
Hai câu hỏi khác nhau; đọc cái này thành cái kia là đúng lớp lỗi "đo sai đại lượng".

Đối chứng ngược `--self-test` **8/8**, gồm hai ca đã cháy thật và một ca suýt:
- sửa MỘT tệp ⇒ báo **LỆCH HASH**, và **không** báo nhầm thành "mất tệp" (hai lỗi khác nhau)
- xoá MỘT tệp ⇒ báo **MẤT TỆP**
- đọc được **cả hai** khuôn `sha256sum` (hai khoảng trắng, và dấu `*`) — `SHA256SUMS.txt` dùng
  khuôn thứ hai, **bỏ sót nó là cổng đọc ra 0 mục rồi báo XANH**

Chạy thật: **3 gói · 20/20 dòng khớp**. Đã nối vào `gday-preflight` nhóm 2 (cả bản đo thật lẫn
bản đối chứng) — O2 là **việc tay của chính ngày G**, phát hiện gói hỏng lúc đang chạy runbook
thì đã muộn.

🔴 **Cũng vì thế mà không đổi tên tệp NẰM TRONG gói.** `MANIFEST.txt` băm theo **đường dẫn bên
trong gói**. Đổi tên `00-DOC-TRUOC.md`/`tep-kem/` thì hoặc gói tự bác chính nó, hoặc phải sinh
lại manifest — mà **sinh lại manifest là xoá đúng thứ tạo ra giá trị của một gói vật chứng**.
Chỉ đổi tên **thư mục ngoài**, thứ không xuất hiện trong manifest.

---

## D-110 — `check-net-dirs.mjs`: hỏi TỪNG thư mục, và nó tìm ra một MỒI NHỬ (2026-08-28)

`CLAUDE.md` gotcha 10 khai `local-net/net-public/` là *"thư mục TRỘN"*. Quét lại `28/08`: thực
tế **rộng hơn nhiều** — **9 thư mục `net*`, 3 thế hệ**, và **năm** từ khác nhau cho *"mạng
thử"* (`public`/`drill`/`dryrun`/`tap`/`bak`).

Cổng đo **hai đại lượng cắt nhau**, không tin tên thư mục: thế hệ ← `genesis.json/networkID`
(đĩa) · tiền ← `platform.getBalance` + `avm.getBalance` (**chain đang chạy**).

**Ba kết quả, mỗi cái một loại nguy hiểm:**

| | |
|---|---|
| `net-public/` + `net-public-dead-720m/` | `9001` chết, **nhưng giữ ~90 LOVE9 thật** (P 89,89998130 + X) ⇒ dọn theo thư mục là mất tiền |
| `net-that-g0/` | networkID **KHỚP** mạng sống, **6 ví đều 0đ** ⇒ **MỒI NHỬ** |
| 6 thư mục còn lại | chết hoặc băng tập, 0đ — dọn được |

🔴 **Mồi nhử nguy hiểm hơn bộ đã chết.** Ở bộ `9001`, `networkID` lệch nên `check-keys` còn có
cái để cảnh báo (D-090). Ở `net-that-g0` **networkID khớp**, nên `check-keys` chấm **6/6 ✓** và
**không cổng nào kêu** — trong khi `allocation.md` của nó tự khai *"1 node"* còn mạng thật là
**9 node**. Đây đúng thứ bị cất nhầm thành *"bản sao lưu khoá quỹ"* của **O1/B-16**, và B-16
đang là mục **chặn GO/NO-GO**. ⇒ **B-19.**

**Hai lỗi của chính cổng này lộ ra lúc dùng, cả hai cùng lớp với thứ nó đi soát:**
1. Gửi địa chỉ `X-` vào endpoint P-Chain ⇒ `mismatched chainIDs` hàng loạt.
2. **Một vế chain hỏng mà vẫn cộng thành `0`.** Quỹ Foundation g0 đo được **P = 0, X =
   70.999.918** ⇒ nếu vế X sập mà cổng trả `0`, thư mục giữ khoá đó **đọc ra sạch**. Nay ném
   lỗi ⇒ **CHƯA KẾT LUẬN**, đúng luật `null ≠ []`.

Đối chứng ngược `--self-test` **17/17**, gồm: `9001` ⇒ không phải live · `899999999` ⇒ băng tập ·
`999999998` ⇒ băng thật nhưng khác thế hệ · thư mục **tên nghe chính thức** vẫn bị chấm theo
`genesis.json` chứ không theo tên · khoá riêng (`PrivateKey-…` và `0x`+64hex) **không bao giờ**
lọt vào kết quả in ra.

---

## D-111 — `NETWORK_ID` là HÀM CỦA GENESIS, không còn là hằng số chép tay (2026-08-28)

Bốn tệp compose cắm cứng `--network-id=9001` (8 dòng) — **thế hệ đã chết từ 27/08**. Và
`local-net/net/genesis.json` trên máy dev **cũng** là bộ 9001. Hai bên **khớp nhau**, nên node
boot sạch, health xanh, **mọi cổng xanh** — trong khi thứ đang chạy là một mạng **không còn tồn
tại**.

⇒ Đây là §2 của `CLAUDE.md` ở dạng thuần khiết nhất: **nhất quán nội bộ không phải bằng chứng
còn sống.** Hai hằng số chép tay ở hai tệp, không cổng nào nối chúng — cùng hình dạng với
`A1Gen ↔ A1_GEN` (D-093), chỉ khác chỗ.

Cách chữa **không phải** sửa `9001` thành `999999999`: làm thế là chép tay lần nữa, chỉ đúng cho
tới lượt re-genesis sau. Nay:
- compose khai `${NETWORK_ID:?…}` ⇒ **dừng** khi thiếu, không còn mặc định nào
- `local-net/network-id.sh` **suy `NETWORK_ID` từ chính genesis sắp mount** và khai thẳng ra
  màn hình nó thuộc băng nào ⇒ **compose không thể lệch khỏi genesis, vì nó không còn giữ con
  số nào của riêng mình**

Nghiệm thu trên **đường sản phẩm** (`docker compose config`), **cả hai chiều**: thiếu biến ⇒
exit 1 kèm câu lỗi nói rõ `9001` là thế hệ đã chết (4/4 tệp) · có biến ⇒ `--network-id=899999999`
đúng ở mọi node (7 dòng).

---

## D-112 — Đối chứng ngược của luật cứng #3 nay là MÃ, không còn là nghi thức (2026-08-28)

Sinh lại cả bộ patch (D-108) buộc phải đổi `TREE_FORK`. Lúc đổi mới thấy: cổng *"áp đủ bộ rồi
so tree"* chỉ chứng minh bộ patch **tự nhất quán với hằng số ta vừa chép vào chính tệp đó**.
Ai sinh lại cả bộ rồi dán tree mới vào cũng làm nó xanh — **kể cả khi nội dung đã trôi**.

⇒ `gday-preflight` nay áp **24/25 TRƯỚC**, đối chiếu với `074aaa93` — cây mà **image đang chạy**
dựng lên trên. Hai đầu neo có gốc độc lập mới nói được điều gì đó.

Đã nhìn thấy nó **ĐỎ, vì đúng lý do**: đổi một ký tự trong **thân diff** patch 0012 ⇒
`đối chứng 24/25: tree 924282f4 ≠ 074aaa93 — bộ patch đã trôi Ở GIỮA`.

⚠️ Lần thử đầu tôi đổi ký tự trong **tiêu đề commit** và cổng vẫn xanh — **đúng**, vì `git am`
dựng tree từ phần diff; tiêu đề không vào tree. Đó cũng là lý do lượt viết lại 25 tiêu đề sang
tiếng Anh **không đổi tree** (`f2b9486b` trước và sau), và tính chất đó chính là bằng chứng
lượt đó chỉ đụng thông điệp.

---

## D-113 — LUẬT NGÔN NGỮ: mã nguồn chỉ có tiếng Anh, thi hành bằng BÁNH CÓC (2026-08-28)

David: *"Không đặt tên file, tên hàm, thông tin gì ghi vào code bằng tiếng Việt — vì dùng cho
quốc tế, nhiều cộng đồng toàn cầu vào để phát triển thêm."* ⇒ `CLAUDE.md` **§0**, đặt **trên**
cả bốn luật cứng.

### Vì sao nó là luật, không phải sở thích

Chú thích trong repo này **là** tài sản đắt nhất của dự án — mỗi khối `🔴` là một cái bẫy đã
trả giá để học. Với người đóng góp ở nước khác, một chú thích tiếng Việt **không tồn tại**, và
họ sẽ dẫm lại đúng cái bẫy đó. Để tài sản ở ngôn ngữ người ta không đọc được là vứt bỏ nó một
cách **im lặng** — cùng hình dạng với mọi lỗi đắt khác của dự án.

### Vì sao BÁNH CÓC, không phải một lượt dịch ồ ạt

Quy mô đo được: **109 tệp · 6.485 dòng** (repo chính) + **54 tệp Go** (fork). Viết lại tất cả
**bốn ngày trước ngày G** là thay đổi lớn nhất và **ít nghiệm thu được nhất** trong lịch sử dự
án — đúng lúc một genesis **bất biến** sắp được đúc ra. Một lượt dịch hỏng một chú thích cảnh
báo còn tệ hơn để nguyên nó tiếng Việt.

`scripts/check-english-code.mjs`:
- tệp **không** trong danh sách nợ ⇒ phải **100% tiếng Anh ngay** (mã mới sạch từ đầu)
- tệp **đã** trong danh sách nợ ⇒ **không được tệ hơn** (nợ cũ trả dần)
- `--update-baseline` **TỪ CHỐI** ghi một con số lớn hơn — bánh cóc phải thật sự cóc

🔴 **Khai thẳng điểm mù ngay trong tệp:** nó **không** bắt được tiếng Việt viết hoàn toàn không
dấu. Đọc xanh là *"không có tiếng Việt có dấu và không có từ đánh dấu nào"*, **không phải**
*"tệp này là tiếng Anh"*. Một cổng không viết ra giới hạn của mình sẽ bị đọc thành bằng chứng
cho thứ nó chưa bao giờ đo.

⚠️ **Tên riêng trong dấu nháy ngược không phải văn xuôi.** Bộ dò bỏ qua `` `…` `` — nếu không,
một chú thích trích đúng tên tệp `00-DOC-TRUOC.md` trong gói vật chứng đã niêm sẽ bị chấm là vi
phạm, và người ta sẽ sửa **tên tệp trong trích dẫn** cho cổng xanh, tức làm hỏng chính con trỏ.

### 🔴 Cổng bắt được TÔI ba lần trong một phiên

Ba lần, mỗi lần trong vòng vài phút sau khi tôi tự viết ra luật: thêm hai mục cổng vào
`gday-preflight` (kéo theo nhãn nhóm tiếng Việt) · thêm chú thích vào `create-l1.sh` · sửa một
chú thích đã cũ ở chính tệp đó. **Không lần nào tôi cố ý.** Đó là toàn bộ lý lẽ cho việc luật
này phải là **mã chạy được**, không phải một dòng quy ước — người viết ra luật còn quên nó
trong vòng năm phút.

### Đã trả trong lượt đầu

`gday-preflight.mjs` (106→0, tệp người ngoài mở đầu tiên) · `check-net-dirs.mjs` (120→0) ·
`check-single-source.mjs` (85→0) · `check-evidence.mjs` (60→0) · `lib/server.mjs` (24→0) ·
`network-id.sh` (23→0) · `deploy/server-env.sh` (7→0) — **toàn bộ mã phiên này tạo ra**, cộng
chính cổng thi hành. Nợ **6.801 → 5.856 dòng**.

Mọi tệp đều **chạy lại và cho kết quả y hệt** bản tiếng Việt: preflight giữ đủ **17 cổng · 15
việc tay**, `check-net-dirs --self-test` 17/17 và bản chạy thật vẫn bắt đúng 1 mồi nhử + 2 bẫy.

### Kèm: MỘT khái niệm, MỘT tên

Đo cùng lượt: khái niệm *"máy chủ"* mang **sáu** tên biến môi trường (`A1_HOST`, `A1_SSH_HOST`,
`A1_BACKUP_HOST`, `A1_SSH_TARGET`, `A1_SRC`, `A1_REMOTE_DIR`) và **hai** tên cờ — trong đó
`--target` mang **hai nghĩa khác nhau** ở hai tệp.

Chưa cháy, nhưng đường cháy đã có tên: **O4** — dời node sang nhà cung cấp thứ hai. Người làm
sẽ đặt *một* biến, thấy vài lệnh trỏ đúng máy mới, rồi `h6b-backup.sh` — **chính cái sao lưu** —
lặng lẽ chụp **máy cũ**. ⚠️ *Sao lưu sai máy không báo lỗi: nó chạy xong, in một dòng xanh, và
chỉ sai vào đúng ngày cần dùng tới.*

⇒ `local-net/lib/server.mjs` + `local-net/deploy/server-env.sh` (hai bản song sinh, **cùng tên
biến**), 8 script nạp từ đó, và `scripts/check-single-source.mjs` canh để không ai chép bản thứ
hai. Ba lần sửa chính cổng đó lúc dựng, cả ba đều là bài học:
1. Quét cả tài liệu ⇒ bắt nhầm `README`. **Sai đại lượng:** một lệnh `ssh` trong runbook tồn
   tại để **người dán vào terminal**; ép nó viết `$A1_SSH_HOST` là làm runbook vô dụng.
2. Khớp chuỗi trần ⇒ `999_999_999` là chuỗi con của `9_999_999_999`, báo động giả.
3. Cổng **tự bắt chính nó**. Một cổng luôn đỏ sẽ bị tắt đi, và lúc đó nó vô dụng đúng lúc cần.

---

## D-114 — Khuôn genesis L1 vẫn cấp toàn bộ token cho một khoá CÔNG KHAI, và hai đường CLI truyền thẳng nó (2026-08-28)

Quét lượt hai phát hiện: `9chain-a1-config/l1-evm-genesis.json` — khuôn cho **mọi L1 người
dùng** — vẫn khai:

| | |
|---|---|
| `chainId` | **9100** — đã bị chiếm trong sổ công khai (*Genesis Coin*), chính là B-14 |
| `feeManagerConfig.adminAddresses` | **`ewoq`** — khoá nằm **công khai trong repo avalanchego** |
| `alloc` | **50.000.000 token** cho cùng khoá `ewoq` đó |

Console **luôn ghi đè cả ba** (`server.mjs`: `tpl.config.chainId = chainId` · `tpl.alloc = {…}` ·
`feeManagerConfig = {adminAddresses:[ADMIN]}`) ⇒ **đường giao diện an toàn**. Nhưng **hai đường
CLI** — `local-net/create-l1.sh` và `local-net/9chain-a1 l1 create` — truyền tệp cho CLI
**nguyên xi**. Chain đẻ ra bằng đường đó có `chainId` trùng, và **toàn bộ nguồn cung lẫn quyền
chỉnh phí thuộc về một khoá ai cũng tra được**.

⚠️ **`chainId` không dừng lại ở máy đó.** EIP-155 buộc chữ ký vào `chainId`, và dưới mắt
MetaMask hai chain cùng `chainId` là **cùng một mạng**. Dùng lại 9100 trên máy dev là cách một
chữ ký dành cho chain đồ chơi trở nên phát lại được ở nơi khác.

Cùng hình dạng với **D-111**: một **mặc định sai nhưng nhất quán nội bộ**, nên không gì kêu lên.
Và cách chữa cũng y hệt: **bỏ mặc định đi, bắt người gọi khai giá trị.**

⇒ `scripts/make-l1-genesis.mjs` (tiếng Anh, theo D-113): sinh genesis cho **từng lượt**, thay cả
ba trường, **từ chối** khi thiếu `--admin`, **từ chối** `ewoq` (trừ `--allow-ewoq` cho chain vứt
đi), **từ chối** `chainId 9100`, và tự cấp chainId từ khối của thế hệ hiện tại theo **đúng luật
console** — đọc cả hai sổ, và **ném lỗi nếu sổ rỗng** (sổ rỗng nghĩa là cổng đang TẮT, không
phải "chưa ai chiếm gì").

Đối chứng ngược **13/13**, gồm ba ca khẳng định khuôn **vẫn** mang cả ba giá trị nguy hiểm — nếu
ai đó "dọn" chúng khỏi khuôn thì bài kiểm này phải đỏ, vì lúc đó nó đang chứng minh một thứ
không còn đúng. Chạy thật: thiếu `--admin` ⇒ từ chối · `--admin ewoq` ⇒ từ chối · ép
`--chain-id 9100` ⇒ từ chối · admin thật ⇒ sinh ra `chainId 9000000010`, alloc và fee-admin đều
là địa chỉ được khai.

Hai đường CLI nay **đòi `A1_L1_ADMIN`** và dừng ngay nếu thiếu (đối chứng: chạy không có biến ⇒
exit 1, **không đẻ chain nào**).

---

## D-115 — Công cụ O2 vẫn đẻ tên tiếng Việt, và gói đã niêm thì KHÔNG sửa (2026-08-28)

Lượt đổi tên `28/08` giữ nguyên tên tệp **bên trong** hai gói vật chứng O2 — đúng, vì
`MANIFEST.txt` băm theo đường dẫn bên trong gói. Nhưng quét lượt hai lộ ra vế còn thiếu:
**`scripts/export-chain.mjs` — công cụ chạy ở NGÀY G, việc tay bắt buộc — vẫn sinh ra
`00-DOC-TRUOC.md`, `GOC.txt`, `tep-kem/`.** Bản xuất tiếp theo, ba ngày nữa, lại là tiếng Việt.

⇒ **Sửa NGUỒN, không sửa bản đã niêm:**
- chế độ **XUẤT** nay sinh `00-READ-FIRST.md` · `ROOT.txt` · `attachments/`
- chế độ **KIỂM** đọc được **cả hai**: `ROOT.txt` (bộ mới) và `GOC.txt` (bộ đã niêm)

Đây là tương thích với **dữ liệu đã ghi**, không phải bí danh của đầu vào mới — cùng phân biệt
đã áp cho id preset ở D-108: *đường VÀO* và *đường ĐỌC* là hai chuyện.

Nghiệm thu bằng một lượt **xuất thật** từ RPC công khai: ra đúng ba tên mới, `--check` bộ mới
9/9 gốc khớp, và `--check` bộ cũ `2026-08-27` **vẫn** 9/9 gốc khớp.

## D-116 — Lượt đổi tên giết CỔNG O1 và ĐƯỜNG KÝ VÍ, và cả hai khai "công cụ hỏng" thành "khoá sai" (2026-08-28)

Patch 0025 đổi công cụ Go `9chain-a1-tools/kiem-khoa` → `check-keys`. **Hai nơi gọi nó bằng
đường dẫn cắm cứng không được đổi theo**, và cả hai đều nằm trên đường khoá quỹ:

| nơi | gọi | hậu quả |
|---|---|---|
| `scripts/o1-check.mjs` | vế 1 của cổng O1 | `go run` gói không tồn tại ⇒ **exit 1** ⇒ chấm `VE_DO` ⇒ in **`🔴 SAI — đừng cất nó làm bản O1`** cho bộ khoá **chính, hoàn toàn đúng** |
| `local-net/deploy/wallet-tunnel/enter.sh` | xác thực khối quỹ trước khi ký | cùng exit 1 ⇒ `chet "kiem-khoa BÁC khối […] — khoá không suy ra địa chỉ tệp tự khai"` |

🔴 **Cả hai đều biến một CÔNG CỤ HỎNG thành một PHÁN QUYẾT VỀ KHOÁ.** Đọc đúng mặt chữ, cổng
O1 bảo David **vứt bỏ một bản sao lưu tốt**; `enter.sh` báo động **khoá quỹ không khớp địa chỉ**
ngay trên đường ký tiền thật. Đây là lớp lỗi *đo sai đại lượng* ở dạng độc nhất: không phải đo
nhầm thứ, mà là **quy kết một phép đo chưa từng xảy ra**.

**Vì sao không cổng nào bắt** — ba lớp cùng mù, mỗi lớp vì một lý do riêng:
- `o1-check` là **VIỆC TAY** trong preflight, không phải một trong 18 cổng ⇒ preflight vẫn 16/18.
- `--self-test` của chính nó **có ca đúng nhưng xanh vì SAI LÝ DO**: ca đắt nhất *"bộ khoá thế
  hệ ĐÃ CHẾT ⇒ 1"* vẫn ra `1` — từ đường công cụ hỏng, **không** từ bộ khoá. Chỉ ca cuối
  (*"bộ g0 đang sống ⇒ 0"*) đỏ. Tức **vế 3 của luật cứng #2 lại đúng lần nữa**: xanh vì sai lý
  do cũng nguy hiểm như đỏ vì sai lý do (D-106b).
- `wallet-over-tunnel.mjs --check` **không mount tệp khoá**, nên nó không bao giờ đi vào nhánh
  chứa lệnh hỏng ⇒ cổng xanh, đường ký thật hỏng. Gotcha 4 nguyên văn: *cổng chỉ chứng minh
  được đường mà CHÍNH NÓ đi.*

⇒ **Bản vá không phải là sửa cái tên.** Sửa tên đóng lượt này; lượt đổi tên sau lại mở ra.
Cách chặn là **đòi công cụ TỰ KHAI rằng nó đã chạy** trước khi lời phán của nó được tin:
`check-keys` in `check-keys — <đường dẫn>` khi bắt đầu đo, và `FATAL ` ở mọi lối đỏ **của chính
nó**; lỗi của `go` không in cái nào.

- `o1-check.mjs`: không có dấu tự khai ⇒ **`2` CHƯA KẾT LUẬN**, không bao giờ `1`, không bao
  giờ `0`. *Không biết* không được rơi về **bất kỳ** phía nào.
- `enter.sh`: không có dấu tự khai ⇒ `chet "check-keys KHÔNG CHẠY ĐƯỢC — chưa đo gì cả, đừng
  đọc thành 'khoá sai'"`, kèm 5 dòng đầu output thật.

| nghiệm thu | đo được |
|---|---|
| `o1-check --self-test` | **7/7**, gồm ca mới *"gói công cụ không tồn tại ⇒ 2, KHÔNG phải 1"* |
| ca đắt nhất nay xanh **vì đúng lý do** | bộ 9001 chết ⇒ `1` sau khi `check-keys` thật sự chạy và phán đỏ |
| `o1-check` trên bộ g0 chính | **exit 0** · 6/6 khoá suy đúng địa chỉ · 6/6 địa chỉ giữ tiền thật |
| đối chứng thẳng trên khối khoá **đã chết** | `kiem-khoa` ⇒ exit 1, dấu tự khai **VẮNG** · `check-keys` ⇒ exit 0, dấu **CÓ** |
| `bash -n enter.sh` | cú pháp đạt |

⚠️ **`--tool` được thêm vào `o1-check.mjs` là CÓ CHỦ Ý.** Không có nó thì nhánh *"công cụ chưa
chạy"* không có cách nào được nhìn thấy lúc nó hoạt động — mà một nhánh chưa ai thấy chạy thì
chưa phải một cổng (luật cứng #2, vế 2). Lượt đổi tên sau chỉ cần sửa **giá trị mặc định**.

🔴 **Việc còn lại của B-16 KHÔNG đổi:** cổng nay đúng, nhưng nó vẫn chỉ mới chấm ĐẠT cho bản
**gốc**. Bản thứ hai vẫn chưa tồn tại. David chốt `28/08`: phương tiện là **máy tính thứ hai** —
quy trình ở [`docs/O1-SECOND-COPY-RUNBOOK.md`](docs/O1-SECOND-COPY-RUNBOOK.md).

## D-117 — Khoá quỹ ĐANG GIỮ TIỀN nằm trần trong thư mục tạm 20 giờ, ngoài tầm mọi cổng (2026-08-28)

Trong lúc tìm *"đã có bản sao thứ hai nào chưa"*, một lượt quét toàn ổ tìm ra **bản sao trùng
byte của bộ khoá quỹ g0** ở `…\Temp\claude\…\<phiên>\scratchpad\kk\` — bốn tệp: `keys.txt` +
`allocation.md` **khớp bản gốc từng hash**, cộng `keys-hong.txt` + `allocation-hong.md`, hai bản
sửa tay dựng làm ca đối chứng cho D-090/D-097 đêm `27/08`. Nằm đó **20 giờ**, giữ quyền chi của
cả 6 quỹ.

🔴 **Ba cổng cùng mù, mỗi cổng vì một lý do khác nhau** — và đó mới là điều đáng ghi:
- `check-net-dirs.mjs` chỉ đi trong `local-net/`; chỗ này nằm dưới `%LOCALAPPDATA%\Temp`.
- `o1-check.mjs` trả lời *"thư mục NÀY có phải bản sao tốt không"* — **không ai bảo nó nhìn đâu**.
- `check-deploy-drift.mjs` so repo ↔ server; tệp này không thuộc bên nào.

⇒ Đúng hình dạng quen thuộc: **mọi cổng xanh vì không cổng nào đo đại lượng này.**

**Cổng mới `scripts/check-key-leaks.mjs`** — và bản nháp đầu của nó là một bài học riêng:

> Bản đầu khớp chuỗi `PrivateKey-` và **đỏ trên 32 tệp**, trong đó có **hai `PROGRESS.md` nằm
> trong git** — chỗ khớp là câu *"Đã quét secret: không có `PrivateKey-*`"*. Nó đo **sự có mặt
> của một CHỮ**, không phải **sự có mặt của một KHOÁ**. Một cổng in 32 dòng phần lớn là nhiễu
> thì **dạy người ta thôi đọc nó** — đúng lớp lỗi đắt nhất của dự án, hạ cánh xuống chính công
> cụ sinh ra để chặn nó.

Bản đúng đo **hai đại lượng, theo thứ tự**:
1. **Có phải khoá không** — `PrivateKey-` + **40+ ký tự base58** (khoá cb58 dài ~51). Một tài
   liệu nhắc `PrivateKey-*` không phải khoá.
2. **Có phải khoá GIỮ TIỀN không** — băm từng khoá tìm được, so với khoá trong **bộ quỹ đang
   sống**. Trùng ⇒ 🔴 ĐỎ. Không trùng ⇒ 🟡 **báo mà không chặn**: khoá mạng diễn tập rải khắp
   cây tạm, đỏ vì chúng mỗi lượt là cách biến một cổng thành giấy dán tường.

🔴 **Không bao giờ in khoá** — so sánh chỉ bằng `sha256` của chuỗi khoá. Và **không đọc được bộ
quỹ ⇒ mã `2`**: không có mốc so thì câu *"khoá này không phải khoá quỹ"* là một **giả định**,
không phải phép đo.

| nghiệm thu | đo được |
|---|---|
| `--self-test` | **6/6**, gồm ca *"tài liệu chỉ NHẮC `PrivateKey-*` ⇒ 0, không được gọi là rò rỉ"* |
| chạy trên máy thật, **trước** khi dọn | 🔴 đúng **2** tệp (`kk/keys.txt`, `kk/keys-hong.txt`) · 19 tệp khoá mạng tập ⇒ 🟡 · hai `PROGRESS.md` **rơi khỏi danh sách** |
| dọn theo D-107 | LIỆT KÊ (4/4 hash khớp danh sách đã duyệt) → `shred -u -n 3` → ĐỐI CHỨNG |
| sau khi dọn | cổng **exit 0** · bản gốc `9chain-a1-keys/g0` **khớp từng byte** |

⚠️ **`keys-hong.txt` — bản "làm hỏng" cố ý — VẪN chứa đủ khoá riêng thật.** Làm hỏng một trường
để dựng ca đối chứng **không** làm tệp đó bớt nhạy cảm. Ai dựng ca đối chứng từ dữ liệu thật
phải dọn nó như dọn dữ liệu thật.

⚠️ **Phạm vi cổng là 7 gốc, không phải cả ổ đĩa** — quét toàn `C:` mất nhiều phút và **một cổng
không ai chạy thì không phải cổng**. Ngoài 7 gốc đó là **chưa đo**, không phải *sạch*; tệp khai
rõ điều đó thay vì im lặng.

🔴 **Còn 19 tệp khoá mạng diễn tập nằm rải trong cây tạm.** Không phải tiền, nhưng đúng thứ để
ai đó cất nhầm — chính là bẫy B-19 và gotcha 11 ở dạng khác. Việc dọn: không gấp, không chặn.

### D-117b — cùng ngày, cổng ĐÓ lại sai HAI lần nữa, và một lượt quét độc lập mới bắt được

Sau khi `check-key-leaks` chấm **exit 0**, một lượt quét nền viết trước đó (phạm vi khác, tiêu
chí thô hơn) chạy xong và chỉ ra **hai chỗ cổng không nhìn tới**:

**(1) PHẠM VI — cổng dừng ở REPO, không ra tới THƯ MỤC CHA.** Danh sách gốc có `ROOT` (chính
repo) nhưng bỏ qua `C:\PROJECTS\9Chain-backups\`, hai worktree anh em (`-web`, `-audit`), và các
bản gương của `claude-config`. **Thư mục sao lưu là nơi khoá dễ bị chép vào nhất và ít được nhìn
lại nhất** — mà cổng mù với nó trong khi vẫn in một dòng xanh rất thuyết phục về mọi chỗ nó có
quét. ⇒ quét `path.dirname(ROOT)`.

**(2) MỐC SO hẹp hơn tập "khoá giữ tiền".** Mốc so ban đầu là **một tệp**:
`9chain-a1-keys/g0/keys.txt` — sáu quỹ genesis. Nhưng `chain-factory-key.txt` là **ví thứ BẢY,
đang giữ ~90 LOVE9 thật** (B-19), và nó **không nằm trong tệp đó**. Hệ quả: một bản trùng byte
của nó trong gói sao lưu bị chấm **🟡 "không phải khoá quỹ"** — cổng nói *"chắc không sao"* về
quyền chi tiền thật.

⇒ Mốc so nay là **danh sách nhiều nguồn** (`DEFAULT_FUND_SETS`), và nguồn nào đọc không được thì
**khai ra** — vì một mốc so co lại sẽ **âm thầm biến 🔴 thành 🟡** mà không ai đụng vào tệp này.

| nghiệm thu | đo được |
|---|---|
| `--self-test` | **8/8**, thêm ca *"khoá giữ tiền từ nguồn mốc so THỨ HAI ⇒ 1, không phải vàng"* |
| ca chứng minh lỗi cũ có thật | *"cùng khoá đó, BỎ nguồn thứ hai ⇒ 0"* — tức trước khi vá nó **đúng là** vàng |
| chạy thật, mốc so 7 khoá / 9 gốc | 🔴 **2 tệp**: `…\scratchpad\verify1\console.env` (`A1_CLI_KEY`) · `9Chain-backups\…\net-public\chain-factory-key.txt` |
| thời gian | **~235 giây** — chậm, nên đây là cổng **chạy tay**, không nhét vào preflight |

🔴 **PHÁT HIỆN KÈM, và nó lớn hơn cả hai lỗi trên: KHOÁ FACTORY ĐƯỢC TÁI DÙNG XUYÊN THẾ HỆ.**
`chain-factory-key.txt` trong gói lưu `20260825` — gói của mạng **`9001` ĐÃ CHẾT** — **trùng
byte** với khoá đang giữ tiền trên `g0` hôm nay (`ced0f04f…`, cả ba nơi). Đây đúng hình dạng
gotcha 15 (`A1_CONSOLE_TOKEN` chưa từng đổi qua **hai** lượt re-genesis): **re-genesis thay khoá
quỹ nhưng KHÔNG thay khoá factory**, nên mọi bản lưu cũ vẫn cầm quyền chi **hôm nay**.
⇒ **Đưa vào việc ngày G: sinh mạng mới thì sinh luôn khoá factory mới**, cùng lượt với token.

⏸️ **Hai tệp đỏ chưa xử lý — chờ David, và hai ca KHÁC NHAU về bản chất:**
- `verify1\console.env` (`24/08`, 396 B) — bản sao thuần trong cây tạm; khoá còn ở 3 nơi khác nên
  xoá không mất gì. `A1_CONSOLE_TOKEN` trong đó là **token cũ đã vô hiệu** (D-092c), nhưng
  `A1_CLI_KEY` **vẫn sống**.
- `9Chain-backups\…\chain-factory-key.txt` — 🔴 **`MANIFEST.txt` của gói có liệt kê tệp này**.
  Xoá nó là làm gói **lệch manifest**, và luật repo cấm sinh lại manifest cho một gói đã niêm.
  Đây là **quyết định của David**, không phải thao tác dọn dẹp.

### D-117c — gói lưu `20260825` bị XOÁ, và phép đo trước khi xoá đổi cả câu hỏi

David chọn *"xoá cả gói"* để khỏi phải đụng `MANIFEST.txt`. Bước **LIỆT KÊ** của D-107 lộ ra
rằng giả định đằng sau lựa chọn đó sai:

| | `20260825` | `20260827` | `20260828` |
|---|---|---|---|
| danh tính validator (`staker.key`/`signer.key`) | **20 tệp** | 0 | 0 |
| chain data | **651 MB** | 0 | 0 |
| khoá + genesis + compose | **có** | 0 | 0 |
| git bundle + patches | có | có | có |

⇒ Nó **không** phải *"một gói của mạng đã chết"*. Nó là **gói duy nhất còn hình dạng một bản lưu
đầy đủ**, và `MANIFEST.txt` của chính nó khai 5 danh tính validator là *"thứ không thể tái tạo"*.
Đã trình lại số đo; **David tái khẳng định xoá** — quyết định của anh, ghi lại nguyên văn bối
cảnh vì nó là thứ sau này người ta sẽ hỏi.

🔴 **Phát hiện lớn hơn cả câu hỏi ban đầu — và nó chưa được xử lý:** danh tính 9 node của **mạng
g0 ĐANG CHẠY** không nằm trong **bất kỳ** gói lưu nào; chúng chỉ ở máy dev và trên server. Hai
gói lưu mới nhất chứa **0 tệp** danh tính/khoá/archive. H-6b lâu nay đo bằng **số patch** — hoá
ra **nội dung** cũng trống. Server cháy hôm nay thì không bản lưu nào dựng lại được mạng.

**Cách xoá** (D-107): LIỆT KÊ **31/31 tệp** → ghi
[`docs/archive/backup-20260825-inventory.md`](docs/archive/backup-20260825-inventory.md)
(kích thước + `sha256` từng tệp — thứ duy nhất sống sót) → `shred -u -n 3` cho 30 tệp nhỏ,
`-n 1` cho archive 651 MB → ĐỐI CHỨNG: thư mục biến mất, **6 gói A1 còn lại nguyên vẹn**.

⚠️ **Hai bẫy công cụ trong đúng lượt xoá này, cả hai đều IM LẶNG:**
1. `find -size -1M` **không khớp tệp nào** — `find` làm tròn **lên**, nên tệp 495 B không
   *"nhỏ hơn 1M"*. Lệnh chạy trót lọt, exit 0, xoá **0 tệp**. Phải dùng đơn vị byte
   (`-size -1048576c`). Một lượt xoá tưởng đã chạy mà thật ra chưa là đúng hình dạng B-17.
2. Dòng đối chứng cuối in *"remaining A1 bundles:"* **rỗng** — lỗi glob trong chính dòng đó,
   không phải mất dữ liệu. `ls` trực tiếp cho thấy **cả 6 gói còn nguyên**. ⇒ **Một dòng đối
   chứng cũng phải được đối chứng**; nếu đọc nó theo mặt chữ thì đã khai một sự cố không có thật.

## D-118 — Node A1 dựng được TỪ TAY TRẮNG trên máy nhà cung cấp khác (2026-08-29)

David chốt mở testnet công khai `01/09` và chọn máy Hetzner **`95.217.60.140`** (Đức) làm node
thứ hai — nhà cung cấp **khác** OVH ⇒ gỡ luôn O4, không chỉ chứng minh P2P.

**Dựng đúng đường một người NGOÀI sẽ đi**, cố ý: không chép image từ server A1 sang, vì làm thế
thì không chứng minh được gì cho người ngoài. Đường đã đi: `git clone` avalanchego **từ GitHub
công khai** → `git checkout 1cf1fc3` → `git am --keep-cr` 25 patch → build trong container
`golang:1.26` (host **không cài** Go/gcc — máy đó của dự án khác, 201 container đang chạy).

| nghiệm thu | đo được |
|---|---|
| 🔴 **tái lập cây fork NGOÀI máy dev** | 25 patch ⇒ tree **`f2b9486b71`** = `f2b9486b` ✓ |
| đối chứng ngược | 24/25 ⇒ **`074aaa9327`** = `074aaa93` ✓ |
| binary là bản A1, không phải upstream | `--version` ⇒ **`9chaingo/1.14.2`** · `LOVE9` ×2 · `9chain-a1-g0` ×1 · **`avalanchego/1.14` = 0** |
| đối chứng ngược của phép đo chuỗi | chuỗi bịa ⇒ 0 (phép đo phân biệt được) |
| genesis khớp mạng thật | `sha256 e1024eab…` **giống nhau ở CẢ BA**: máy dev · `~/9chain-a1/net/genesis.json` trên server A1 · Hetzner |
| node chạy | 0 fatal · `networkID 999999999` · `supplyCap 7900000001000000000` · DB `db/9chain-a1-g0` |
| 🔴 **peers** | **0** — beacon A1 không mở, đúng như đo TCP |

⇒ **Điều kiện qua số 4 của ngày G đã ĐẠT SỚM**: *"một người lạ dựng lại được cây fork từ
`patches/` ra đúng tree hash"* — nay không còn là suy luận, đã chạy trên một máy thứ ba.

⚠️ **`strings` không có trên máy đó, và `grep -c` của lượt đo đầu trả `0` cho MỌI chuỗi** — suýt
đọc thành *"binary không có LOVE9"*. Đúng lớp lỗi D-116 cùng ngày: **công cụ hỏng ≠ phán quyết**.
Đo lại bằng `grep -a` mới ra số thật.

🔴 **Còn đúng một bước, và nó cần David bấm:** beacon trên server A1 chưa publish cổng P2P
(mạng g0 sinh ở chế độ `A1_P2P_MODE=docker`). Xem `docs/TESTNET1-PUBLIC-2026-09-01.md` §P1.

## D-118b — 🔴 P1-3 KHÔNG ĐẠT: một beacon công khai KHÔNG đủ cho node ngoài (2026-08-29)

David duyệt mở P2P trên `g0`. Sửa **đúng 2 dòng** trong khối node-1 của compose
(`--public-ip=172.28.0.11` → `139.99.145.13`, thêm publish `0.0.0.0:9651:9651`), recreate
**chỉ node-1**. Backup: `docker-compose.multinode.yml.pre-p2p-20260829`.

| đo | trước | sau |
|---|---|---|
| mesh nội bộ (node 1/2/5/9) | 8 peer mỗi node | **8 peer mỗi node** — không gãy ✓ |
| validator | 9 | **9** ✓ |
| `9651` từ Internet | đóng | **mở** ✓ (đối chứng `9652` vẫn đóng) |
| node ngoài (Hetzner) | 0 peer | **1 peer** ✓ |

⇒ Rủi ro hairpin mà D-089 cảnh báo **KHÔNG xảy ra** khi chỉ beacon đổi. Nhưng:

🔴 **Điều kiện qua P1-3 THẤT BẠI, và nó thất bại vì KIẾN TRÚC, không vì cấu hình:**

```
node-1 (beacon)   9 peer   thấy node ngoài : CÓ
node-2 / 5 / 9    8 peer   thấy node ngoài : KHÔNG
node ngoài        1 peer   isBootstrapped(P) = false · healthy = false
                           health liệt kê 8 nodeID trong "disconnectedValidators"
```

**Vòng luẩn quẩn, và không có đường ra bằng cấu hình:**
1. 8 node kia khai `--public-ip=172.28.0.x` ⇒ node ngoài **không thể gọi tới** chúng.
2. Chúng chỉ gọi RA node ngoài nếu biết địa chỉ nó — mà avalanchego gossip **IP của
   VALIDATOR**, còn node ngoài chưa stake nên không nằm trong danh sách đó.
3. Muốn stake thì node phải **bootstrap xong**; bootstrap đòi kết nối tới **đủ stake**, mà nó
   chỉ với tới 1/9 validator (~11%). ⇒ quay lại (1).

⇒ **Mô hình "1 beacon công khai + 8 node sau bridge nội bộ" không phục vụ được validator
ngoài.** Nó đủ cho *"có RPC công khai"*, **không** đủ cho *"testnet công khai"* — đúng ranh
giới đã ghi ở §4 điều 3 của `docs/TESTNET1-PUBLIC-2026-09-01.md`, nay có số đo đứng sau.

**Đường ra — và nó KHÔNG bắt buộc phải đụng `patches/`:** mọi node phải đến được từ Internet.
Trên bridge thì bất khả (hairpin, D-089 đã đo). Nhưng `network_mode: host` **bỏ NAT hoàn toàn**:
mỗi node một `--staking-port` riêng, tất cả khai IP công khai, node cùng máy gọi nhau thẳng qua
`127.0.0.1:965N`. Đó là **hậu xử lý compose**, không phải sửa netgen ⇒ không sinh lại patch.

⏳ `g0` bị vứt bỏ `01/09` ⇒ đây vẫn là cửa sổ thử **rủi ro thấp nhất sẽ có**.

## D-118c — ✅ P1-3 ĐẠT: node ở nhà cung cấp KHÁC, nước KHÁC, đã vào mạng (2026-08-29)

D-118b kết luận *"1 beacon công khai + 8 node sau bridge"* không phục vụ được node ngoài, và đề
xuất `network_mode: host`. **Đo trước khi làm đã bác chính đề xuất đó:** `9scan-a1-web`,
`9chain-a1-faucet` và `backend` nằm **cùng bridge `net_a1net`** với các node ⇒ bỏ bridge là đứt
cả ba; thêm nữa `--http-host=0.0.0.0` ở host-mode sẽ **mở API RPC toàn quyền ra Internet**.

⇒ Chọn đường rẻ hơn và không phá gì: **giữ bridge, cho MỖI node một cổng staking riêng ra
Internet** — đúng hình dạng `ipv4port` mà netgen đã có (H-7/D-089), nhưng áp cho **cả 9** thay vì
chỉ beacon. `scripts/open-p2p-all-nodes.py` sửa compose (idempotent, tự dừng nếu không thấy đúng
9 service). `--bootstrap-ips` **giữ địa chỉ nội bộ**, đúng lý do D-089 đã đo.

Recreate **từng node một**, không đồng loạt: mất đa số cùng lúc là dừng mạng.

| đo | trước | sau |
|---|---|---|
| node 1,2,3,5,7,9 thấy node ngoài | **chỉ beacon** | **6/6 node đều thấy** ✓ |
| peer mỗi node | 8 | **9** ✓ |
| node ngoài | 1 peer · `isBootstrapped=false` · `healthy=false` | **9 peer · P và C `true` · `healthy=true`** ✓ |
| P-Chain height | — | **khớp**: RPC công khai `2` ↔ node ngoài `2` |
| `eth_chainId` từ node NGOÀI | — | **`0x218711a09`** = 9000000009 |
| validator | 9 | **9** ✓ |

🔴 **D-089 dự báo mesh sẽ teo thành hình sao khi mọi node khai IP công khai. Điều đó KHÔNG xảy
ra ở đây.** Khác biệt: D-089 đo lúc **SINH mạng mới** (chưa node nào biết ai); ở đây mạng **đã có
mesh** và `--bootstrap-ips` vẫn trỏ địa chỉ nội bộ, nên node cùng máy giữ được đường nội bộ
trong khi vẫn khai được địa chỉ công khai cho người ngoài. ⇒ **Một kết luận đúng ở một thời
điểm không tự động đúng ở thời điểm khác** — và cách duy nhất biết là đo lại.

⇒ **Điều kiện qua §4 điều 3 của kế hoạch ngày G đã ĐẠT**, ba ngày trước hạn: *"một node NGOÀI
máy chủ đang là peer — đo trên node đang chạy"*. Nay còn mạnh hơn: nó **đồng bộ trọn vẹn** và
**khác nhà cung cấp** (Hetzner 🇩🇪 vs OVH 🇫🇷) ⇒ **O4 cũng đạt**.

⏳ Còn lại để thành **validator** (không chỉ full node): stake ≥ 25.000 LOVE9 qua
`AddPermissionlessValidatorTx`. Cần David ký — tiền thật trên mạng công khai.
Backup compose: `docker-compose.multinode.yml.pre-hostports-20260829`.

## D-119 — ✅ NGƯỜI NGOÀI ĐÃ VALIDATE ĐƯỢC: validator thứ 10, nhà cung cấp khác (2026-08-29)

David duyệt trong phiên (*"làm luôn"*), A1 chạy — cùng tiền lệ B-17. Rủi ro tài chính **bằng
không**: `g0` bị vứt bỏ `01/09`, token của nó thành vô nghĩa cùng ngày.

**Công cụ mới `local-net/tools/stake-validator/`** — module Go **ngoài cây fork** (dùng `replace`),
nên `patches/` không bị đụng và tree vẫn `f2b9486b` ba ngày trước ngày G.

| bước | kết quả |
|---|---|
| X→P (xp-wallet qua hầm, patch 0019) | `exportTx 2M4WXqek…` · `importTx 2Q5d92Tv…` ⇒ P: 0 → **29.999,99999173 LOVE9** |
| dừng container giữ khoá | `9chain-a1-vi-ham` **đã xoá ngay** |
| `AddPermissionlessValidatorTx` | `txID EQZgjvCyjMTiUMkgnNCiSeRQoJtB8HthPs685TBWvR4Wm1M9A` |
| 🔴 **đối chứng TRÊN CHAIN** | **10 validator** (từ 9) · nodeID Hetzner có mặt · `weight 25000000000000` · thưởng về Foundation |

⇒ **Vòng đã khép**: người ngoài `git clone` từ GitHub công khai → `git am` 25 patch → build →
chạy node → join mạng → **stake → validate**. Không bước nào cần thứ gì chỉ David mới có, ngoài
tiền để stake.

🔴 **Bốn ràng buộc công cụ TÔN TRỌNG thay vì nới** — mỗi cái là một cổng đã trả giá để có:
1. **Không bao giờ đọc khoá BLS bí mật** của validator. Proof-of-possession đã được node tự công
   bố qua `info.getNodeID`; chỉ nửa công khai đi ra ngoài.
2. `MakePWallet` **chứ không** `MakeWallet`: ví đầy đủ fetch C-chain từ `/ext/bc/C/avax`, endpoint
   **404 công khai CÓ CHỦ Ý** (M11.10). Stake chỉ cần P-Chain.
3. **Hầm SSH trong container** (mô hình M11.10/D-091): SDK gọi `<uri>/ext/P` mà RPC công khai chỉ
   phục vụ `/ext/bc/*`; và node lọc `--http-allowed-hosts=localhost,127.0.0.1` nên hầm trên host
   qua `host.docker.internal` bị **403**. Forward bên trong ⇒ ví thật sự gọi `localhost`,
   **không cổng nào bị nới**.
4. `MSYS_NO_PATHCONV=1` đặt **trong script**, không để người gọi nhớ — Git Bash đổi `/src` thành
   `C:/Program Files/Git/src`. Đã ghi ở `O1-CUSTODY-VERIFICATION.md` và **vẫn dẫm lại** khi viết.

⚠️ **Bản nháp đầu của dry-run chỉ in ý định rồi nói "sẵn sàng".** Foundation giữ tiền trên
X-Chain và **0 trên P**, nên `--issue` sẽ hỏng **sau khi** người vận hành đã quyết chi. Nay dry-run
**đo số dư thật** và **từ chối gửi giao dịch không thể thành công**. Một lượt chạy thử chỉ in dự
định là một lượt chạy thử nói dối.

⏳ Ngày G có đường sạch hơn cho việc này: cho node ngoài vào **thẳng genesis** (netgen sinh 10
node) — validator từ block 0, không cần giao dịch nào. Lượt hôm nay là **diễn tập trọn đường mà
người ngoài sẽ đi**, và nó đã chạy được.

## D-120 — Deploy console: chuỗi công khai sang tiếng Anh, B-18 đóng, và hai cổng đỏ ĐÚNG LÝ DO (2026-08-29)

David duyệt deploy. `console-deploy.sh` chạy trót lọt (nó tự dừng ở *"✗ VẪN CÒN LỆCH"* khi còn
`export-chain.mjs` nhóm `vantoc` ngoài phạm vi — **đúng**, và đó là lần đầu vế thứ hai của luật
cứng #2 được thấy hoạt động trên chính script này).

| đo | trước | sau |
|---|---|---|
| drift | 10 khớp · 6 lệch · 3 thiếu · 6 mồ côi | **19 khớp · 0 lệch · 0 thiếu · 3 mồ côi** |
| preset trên server | tiếng Việt | **6/6 tiếng Anh** |
| thông báo tạm đóng | lộ `A1_DE_CHAIN_MO=1` | tiếng Anh, **không lộ gì** |
| console đang chạy bản nào | — | khởi động `12:24:16` **sau** mtime `12:22:03` ⇒ **bản mới** |

🔴 **Vì sao grep trang công khai ra 0 cho CẢ tiếng Việt lẫn tiếng Anh** — và suýt đọc thành
*"deploy không ăn"*: trang `/create-chain/` là **Next.js xuất tĩnh** và **form chỉ render sau khi
kết nối ví**. Trình duyệt không có MetaMask thì `document.querySelector("select")` là `null`, nên
mọi phép đo dựa trên HTML tải về đều mù. Phép đo đúng nằm **trên server**: import `presets.mjs`
và in ra. ⇒ *Đo ở nơi chuỗi thực sự sống, không ở nơi tiện tay nhất.*

### B-18 ĐÓNG — nhưng bước LIỆT KÊ đã suýt biến nó thành B-17 lần thứ ba

Cả **ba** tệp tên cũ đều **KHÁC hash** với bản đã đổi tên, đúng cái mà `BLOCKERS.md` dặn
*"khác ⇒ DỪNG, đó là tin"*. Dừng, rồi đo tiếp thay vì suy đoán:

- khác biệt là **đổi tên khoá JSON** (`tep`→`file`, `dais`→`ranges`, `daBiChiem`→`taken`…) cộng
  danh sách **nguồn** khác nhau — tức nghi vấn *"bản mới có thiếu bản ghi không"* là chính đáng;
- so **tập dữ liệu thật**, không so tên khoá: `chainIds` **47/47** · `names` **53/53** ·
  danh sách `taken` **56/56** ⇒ **LOST 0**;
- `thehe-test.mjs` còn nguyên trong git (2 commit) ⇒ khôi phục được.

Chỉ khi đó mới `shred -u -n 3`. Đối chứng: 3 tệp biến mất, 3 bản đã đổi tên **còn đủ**.

⚠️ **Phép đo đầu tiên của tôi lọc `> 100000` nên bỏ sót cả sổ** — `chainIds` bắt đầu từ **9100**.
Nó in *"LOST 0"* vì **không thấy gì cả**, không phải vì không mất gì. Suýt là một câu trấn an
dựa trên một bộ lọc sai. Lớp lỗi D-116 lần nữa: **kết quả rỗng không phải kết quả sạch**.

### 🔴 Hai cổng nay ĐỎ, và chúng đỏ vì ĐÚNG LÝ DO — đừng vá cho xanh

`watch-network`: **số validator 10 (mong 9)** · **B-12 hết hạn sớm nhất 14 ngày (`2026-09-12`)**.
Cả hai là hệ quả trực tiếp của D-119: node ngoài stake **14 ngày**, ngắn hơn 9 node genesis (307).

🔴 Nhưng B-12 nay **đo sai đại lượng trong bối cảnh mới**: nó sinh ra để cảnh báo *"mạng sắp
dừng"*, mà *"validator hết hạn sớm nhất"* không còn nghĩa đó khi có validator **ngoài** đến và đi
theo ý họ — đó chính là điều một testnet công khai phải chấp nhận. Một validator ngoài rời đi là
**bình thường**; 9 node genesis hết hạn mới là **mạng dừng**.
⇒ Việc cần làm trước ngày G: tách hai đại lượng đó. **Chưa sửa** — sửa một cổng quan trọng lúc
đang mỏi là cách tốt nhất để đẻ ra cổng thứ ba đo sai.

## D-121 — Tự soát lượt `29/08`: một hồi quy do chính A1 gây ra, và một cổng chưa ai thấy xanh (2026-08-29)

David yêu cầu *"tự check lại"*. Soát toàn bộ việc trong ngày. Bốn kết quả:

**1. 🔴 HỒI QUY DO A1 GÂY RA — `check-single-source` đỏ.** `run-over-tunnel.sh` chép cứng
`139.99.145.13` và `.ssh/9chain-a1` thay vì lấy từ `deploy/server-env.sh`. Cổng bắt đúng: hằng
số có bản thứ hai. **Ngày server đổi máy, bản sao không ai nhớ là bản còn trỏ vào máy cũ.**
Đã `source` từ nguồn ⇒ cổng xanh, script vẫn chạy. Preflight **14/4 → 15 đạt · 3 đỏ**.

**2. ✅ Bản vá `enter.sh` (D-116) nay ĐÃ ĐƯỢC THẤY CHẠY XANH trên khoá quỹ thật.** Sáng nay nó
chỉ có `bash -n` và `wallet-over-tunnel --check` — mà `--check` **không mount khoá** nên không đi
vào nhánh đã sửa. Lượt X→P có đi qua, nhưng log nằm trong container và container đã bị xoá ⇒
**không còn bằng chứng**. Chạy lại đúng chế độ `--check --wallet-key --fund` (kiểm chọn quỹ mà
không khởi động ví) ⇒ in `✓ check-keys: khoá suy ra đúng X-love918a4zwd…`. Lỗ *"cổng chưa ai
thấy chạy xanh"* đóng.

**3. 🟡 Node ngoài: `healthy=false`, và nó chỉ đỏ SAU khi thành validator.**
`ingressConnectionCount: 0` · `primaryNetworkValidator: true` ⇒ *"primary network validator has
no inbound connections"*. Health check này **chỉ bật cho validator**, nên lỗi không thể lộ ra
trước lượt stake. Đo tiếp thay vì đoán: TCP `95.217.60.140:9651` từ Internet ⇒ **True**, node
listen `*:9651`, ufw cho phép. ⇒ Cổng **thông**; con số 0 phản ánh *chưa peer nào chủ động gọi
vào*, không phải *không gọi được* — avalanchego **không phân biệt hai điều đó**.
⚠️ Vẫn phải theo dõi: uptime của validator tính theo kết nối, nên nếu ngày G node ngoài vẫn
`ingress=0` thì đó là chuyện thật, không phải nhiễu.

**4. ✅ Không thao tác nào hôm nay đẻ ra rò rỉ khoá mới.** `check-key-leaks` đỏ đúng **một** tệp,
và đó là `verify1/console.env` từ `24/08` mà David **chưa duyệt xoá** — không phải hệ quả của
lượt này. Mount `:ro`, container `--rm`, hầm trong container: không cái nào để lại bản sao.

⚠️ **Preflight vẫn liệt kê B-18 sau khi B-18 đã đóng.** Một việc tay còn nằm trên danh sách sau
khi xong sẽ dạy người ta **lướt qua danh sách** — đúng cơ chế biến một cổng thành giấy dán tường.
Đã gỡ khỏi `MANUAL_TASKS` và đóng mục trong `BLOCKERS.md` kèm số đo.

**Ba đỏ còn lại, tất cả ĐỎ ĐÚNG LÝ DO:** `watch-network` (validator 10 · B-12 14 ngày — hệ quả
D-119, và B-12 nay đo sai đại lượng, xem D-120) · `drift` (3 mồ côi `heartbeat-*` **không thuộc
repo** — chưa rõ nguồn, A1 không đụng) · `net* directories` (**B-19**, việc của David).

## D-121b — Dọn nốt hai thứ còn lại: cổng rò rỉ khoá nay XANH (2026-08-29)

David duyệt xoá cả hai. Theo D-107, **chứng minh trước khi xoá**, không trấn an:

| | đo được |
|---|---|
| `…\292d2448-…\scratchpad\verify1\console.env` (396 B, `24/08`) | khoá `A1_CLI_KEY` trong đó **trùng digest** với `net-public/chain-factory-key.txt` **và** `net-public-dead-720m/` ⇒ xoá không mất khoá. `A1_CONSOLE_TOKEN` là **token cũ đã vô hiệu** (D-092c). Các biến còn lại là cấu hình tái tạo được |
| container `9chain-a1-xpwallet` (**354 lần restart** từ `24/08`) | image `golang`, 2 mount: volume `9chain-a1-gomod` (**cache dùng chung**) + bind nguồn fork chỉ đọc ⇒ **không có state riêng** |

Xoá: `shred -u -n 3` cho tệp · `docker rm -f` **KHÔNG kèm `-v`** cho container — `-v` sẽ cuốn
theo volume cache mà các công cụ khác đang dùng chung; xoá container không có nghĩa là xoá thứ
nó mượn.

**Đối chứng:** tệp biến mất · 0 instance container · volume `9chain-a1-gomod` **còn nguyên** ·
khoá factory vẫn còn trong `net-public/` · **`check-key-leaks` ⇒ exit 0** — lần đầu kể từ khi
cổng này ra đời (D-117), không còn khoá quỹ sống nào nằm ngoài nơi được phép.

🟡 Còn 18 tệp giữ khoá **mạng diễn tập** rải trong cây tạm — báo mà không chặn, đúng thiết kế.

## D-122 — Node thứ 10 vào THẲNG GENESIS ngày G, không stake sau (2026-08-29)

David chốt. So với đường D-119 (stake sau):

| | stake sau | vào genesis |
|---|---|---|
| tốn | 25.000 LOVE9 + 2 giao dịch | **0** |
| phụ thuộc | ví ký được · P-Chain có tiền · RPC thông | **không gì** |
| hỏng thì lộ lúc nào | **giữa ngày G**, lúc bận nhất | **ngay khi sinh mạng**, còn sửa được |
| hạn validator | 14 ngày ⇒ lệch 9 node kia ⇒ B-12 đỏ | **cùng cửa sổ** |

⇒ D-119 **không phí**: nó chứng minh đường stake chạy được cho **người ngoài thật**, và nay là
**đường lui** nếu node10 lỡ chuyến genesis.

Quy trình đầy đủ: [`docs/GDAY-NODE10-HETZNER.md`](docs/GDAY-NODE10-HETZNER.md). Đã đưa **3 việc
tay** vào `gday-preflight.mjs` (14 → 17) — runbook là nơi người ta thực sự đọc, tài liệu là nơi
người ta định đọc.

🔴 **Bẫy tìm ra khi soạn, không phải khi chạy: xung đột cổng `9660`.** netgen publish API của
**node2** ở `127.0.0.1:9660`; ở chế độ `ipv4port`, staking port của node *N* là
`A1_STAKING_PORT_BASE + N - 1`, nên **node10 lấy đúng 9660**. Với `N=9` lỗi này **không tồn
tại** (cao nhất 9659) ⇒ nó xuất hiện lần đầu **đúng vào ngày thêm node thứ mười**.
⇒ Ngày G dùng `A1_STAKING_PORT_BASE=9700`. Không sửa netgen, không đụng `patches/`.

**Hai điều node10 KHÔNG lấy từ compose netgen sinh** (nó ở máy khác, cả hai đều sai với nó):
`--public-ip` phải là IP **của chính nó**, và `--bootstrap-ips` phải là địa chỉ **CÔNG KHAI** của
beacon — không phải địa chỉ nội bộ mà netgen ghi (đúng cho node cùng máy, D-089).
⚠️ **Xoá `--data-dir` cũ trước**: nó giữ DB `g0` **và một danh tính tự sinh**; để lại là node lên
bằng nodeID cũ, không phải nodeID trong genesis — và mọi cổng vẫn xanh.

⚠️ Binary trên Hetzner hiện là bản `A1Gen 0`. Bump lên 1 đổi networkID, tên mạng **và đường DB**
⇒ **phải build lại**, đúng đường D-118 đã chạy.

### Lượt này lại tự tạo ra một hồi quy — và cổng bắt được lần thứ hai trong ngày

Thêm việc tay xong, `check-single-source` **đỏ**: hai chuỗi hướng dẫn chép cứng
`139.99.145.13`. Cổng đúng — **một dòng runbook chép sai địa chỉ còn tệ hơn không có dòng nào**,
vì người ta tin runbook. Đã `import { SSH_HOST }` từ `local-net/lib/server.mjs` và nối chuỗi.
⚠️ Lần sửa đầu dùng `${SERVER_IP}` **trong chuỗi nháy kép** ⇒ in ra nguyên văn `${SERVER_IP}`.
Cổng single-source **không bắt được** cái đó (nó tìm chuỗi IP, và chuỗi IP đã biến mất). Chỉ
lộ ra vì đã **chạy thật và đọc dòng in ra** thay vì tin rằng sửa xong là đúng.

**Số đo cuối:** preflight **15 đạt · 3 đỏ · 17 việc tay** — ba đỏ đều đã ghi sổ và đỏ đúng lý do.

---

## D-123 — Diễn tập g1 `2026-08-30`: **`A1Gen` nằm TRONG bộ patch**, nên bump thế hệ là sửa `patches/`

**Tìm ra trước khi up node nào**, lúc định bump: `grep -l A1Gen patches/*.patch` ⇒ **patch 0018**
khai `A1Gen uint32 = 0`. Cây làm việc `upstream/avalanchego` sạch, HEAD tree đúng bằng
`f2b9486b` của bộ 25 patch.

⇒ Bump thế hệ **không phải** *"sửa ba dòng Go"*. Nó là **sửa `patches/`**, tức luật cứng #3:
sinh lại **CẢ BỘ**, và **hai** hằng số tree trong `gday-preflight.mjs` phải đi cùng.

🔴 **Hình dạng của lỗ nếu quên** — đây là lý do mục này tồn tại:

| | |
|---|---|
| image ngày G (build từ cây làm việc) | `A1Gen 1` ✓ **đúng** |
| `patches/` **công bố cho người ngoài** | vẫn `A1Gen 0` ⇒ họ build ra binary của **thế hệ đã chết**, **không join được** |
| cổng `replayFork` trong preflight | **XANH suốt** — nó chỉ so `patches/` với hằng số **chép trong chính nó** |
| điều kiện qua số 4 của `01/09` (*"người lạ dựng lại được cây fork ra đúng tree hash"*) | **XANH** |

Tức mọi cổng xanh trong khi đúng thứ người ngoài chạm vào thì hỏng — lớp lỗi *"đo sai đại
lượng"*, lần này ở tầng **bộ phát hành**. Không tài liệu nào trong repo nối `A1Gen` với việc
sinh lại patch set (đã grep `docs/**` · `DECISIONS` · `BLOCKERS` · `PROGRESS` · `HANDOFF`).

**Đã làm:** `git format-patch --no-signature 1cf1fc3..9chain-a1` ⇒ **26 patch**, tree
`f2b9486b` → **`60a61707`**. Đối chứng bộ cũ có bị lượt sinh lại làm hỏng không:
**50 dòng đổi trên 25 patch cũ, và 0 dòng nào không phải `Subject: [PATCH nn/25→26]`** — không
một byte nội dung. Nghiệm thu bằng preflight: 26 patch → `60a61707` ✓, đối chứng
**25/26 → `f2b9486b`** ✓.

**Mốc neo đổi, và có lý do:** counter-check cũ neo vào `074aaa93` (tree mà image `g0` dựng lên
trên). Mốc đó **nghỉ cùng thế hệ g0**. Mốc mới `f2b9486b` là tree fork đứng suốt `28–29/08` —
vẫn có **gốc độc lập** với con số lượt bump này đẻ ra, và đó là cả điểm của đối chứng N−1.

⇒ Thêm **một việc tay** vào preflight (22 → 23).

---

## D-124 — Hai cổng **cắm cứng thế hệ 0**, nên chúng mù ĐÚNG VÀO NGÀY bump

Bump xong, preflight đỏ hai cổng. Cả hai **không** đỏ vì *"repo tả g1 mà mạng là g0"*:

**1. `check-consistency --self-test`: 5/14 ca đối chứng ngược NGỪNG bắt được.** Các ca dựng lỗi
bằng chữ số `1` (`d.js.gen = 1`). Ở thế hệ 0 đó là lệch ⇒ bắt được; ở thế hệ 1 đó **chính là
giá trị đúng** ⇒ không lệch, cổng mù. Năm ca đó là: *"bump JS quên Go"* · *"bump Go quên JS"* ·
*"quên đổi `A1Name`"* · *"khối chainId giữ nguyên thế hệ cũ"* · *"console mang networkID thế hệ
trước"* — tức **đúng năm cách hỏng của ngày G**.

🔴 **Hướng hỏng mới là chỗ đắt:** một lượt chạy ngay sau bump in ra năm dòng `✗`, và chúng **đọc
như vô hại** — rất dễ xếp vào *"đỏ dự kiến"*. Cổng tự khai *"đang MÙ ở chỗ đó"* mà câu đó vẫn dễ
bị đọc lướt, vì nó xuất hiện đúng lúc người ta đang chờ vài dòng đỏ.

**2. `chainid-test`: hai assertion khai `trần KHỐI THẾ HỆ 0 = 9.000.999.999` và `rộng 999.990
số`** ⇒ **ĐỎ GIẢ**, không có gì sai cả.

**Đã sửa, cùng một nguyên tắc: lỗi phải diễn đạt TƯƠNG ĐỐI so với thế hệ đang có trong mã.**
`d.js.gen + 1` thay cho `1`; hai assertion chainId kiểm **ngược** bằng modulo + chia nguyên
(`tran % 1_000_000 === 999_999`, `floor((tran − 9e9)/1e6) === A1_GEN`) thay vì chép lại công
thức của `lib/chainid.mjs` — chép công thức là làm bài kiểm xanh **theo cấu tạo**, đúng điều chú
thích đầu tệp đó đã cảnh báo.

**Nghiệm thu:** 14/14 ca bắt lại được · `chainid-test` **36 đạt · 0 hỏng**. Đối chứng ngược cho
chính bản vá: làm hỏng công thức trần ⇒ **bắt được (2 lỗi)**; bỏ quên nhân thế hệ ⇒ mã thật **nổ
to** (`gốc 9001000000 nằm TRÊN trần 9000999999`), không im lặng.

**Bài học rộng hơn:** *một self-test neo vào chính hằng số nó canh chỉ đúng vào ngày nó được
viết.* Đáng soát mọi cổng khác theo tiêu chí này.

---

## D-125 — Bẫy cổng `9660` (D-122) **KHÔNG TỒN TẠI** — đo, không suy

D-122 và `GDAY-G1-GAPS.md` đều **tự khai** rằng cổng `9660` mới là *"suy luận từ mã, chưa ai thấy
xảy ra"*. Lượt tập biến nó thành số đo: sinh mạng `N=10`, `ipv4port`, base **mặc định**.

```
node10 --staking-port=9660        ← ĐÚNG, D-122 đọc mã không sai chỗ này
publish ra host: 127.0.0.1:9650 (node1 API) · 0.0.0.0:9651 (node1 staking) · 127.0.0.1:9660→9650 (node2 API)
node10 publish cổng staking       ← KHÔNG
```

`buildCompose` chỉ publish cổng staking khi `nd.Index == 1` — **chỉ beacon**, và đó là cố ý
(publish cổng cho một node khai địa chỉ nội bộ là mở cửa không ai được bảo là có). Nên `9660` của
node10 sống trong **namespace của container nó**, còn `9660` trên host là API node2: hai không
gian tên khác nhau, không giao nhau.

**Đo trên mạng chạy thật:** 10 node lên hết, không một va chạm · beacon **9** peer · node2
(**không phải beacon**) **9** peer · node10 có mặt trong `info.peers` của **cả hai**.

⇒ `A1_STAKING_PORT_BASE=9700` **không sai**, nhưng nó mua một bẫy không có thật bằng hai bước
phải nhớ giữa ngày G: mở `ufw 9700`, và công bố bootstrap `:9700`. **David chốt `30/08`: giữ
`9651` mặc định** — `ufw 9651` đã mở, tài liệu công khai đã nói `9651`.

⚠️ Đo trên máy dev (Docker Desktop). Cơ chế là thuộc tính của compose, không của hệ điều hành,
nhưng lượt đo trên OVH chưa có.

---

## D-126 — **Ngày G quay lại `N=9`.** Hetzner **THAY** một node OVH, không phải node thứ mười

**David chốt `2026-08-30`,** sau khi lượt tập phơi ra một mâu thuẫn chưa ai nêu.

netgen in cảnh báo này ở **mọi** lượt sinh `N=10`:

> *self-bond mỗi node KHÔNG tròn LOVE9 ở N=10 — thật ra là 899999,100000000 LOVE9 (chỉ tròn ở
> N=9: 999.999). Nhưng mạng CÔNG KHAI ngày G phải là N=9 (D-046) — N khác là mất bộ chín số 9.*

**D-046** (`27/08`) nói thẳng: *"Số node ở ngày G: **GIỮ 9**"*, và *"O4 không còn là 'thêm một
node thứ 10' — nó phải là **DỜI một trong 9 node** sang nhà cung cấp khác"*. **D-122** (`29/08`)
chốt node Hetzner vào genesis ⇒ `N=10`, tức **lật D-046 mà không mục nào ghi là đang lật**, và hệ
quả bản sắc không được nêu lúc chốt. Cảnh báo của netgen thì có ở đó suốt — nó chỉ **cảnh báo,
không chặn** (cố ý, D-046), nên nó bị đọc lướt.

**Vì sao `N=9` tốt hơn ở cả hai mặt:**
- **bản sắc:** `8.999.991 = 9 × 999.999` — bộ chín số 9 chỉ tồn tại ở `N=9`, và nó đi vào genesis
  **bất biến**;
- **O4:** *dời* cho ra **8 OVH + 1 Hetzner**, còn *thêm* cho ra **9 OVH + 1** — dời gỡ được nhiều
  rủi ro "một máy một nhà cung cấp" hơn.

Giữ nguyên phần đúng của D-122: node ngoài vào **từ genesis**, không stake sau — 0 LOVE9, không
phụ thuộc `AddPermissionless…`, hạn validator cùng cửa sổ với các node kia.

---

## D-127 — Phép nghiệm thu compose trong runbook ngày G **SAI**, và sai theo hướng khiến người ta phá thứ đang đúng

`docs/GDAY-NODE10-HETZNER.md` §Bước 1 ghi:

```bash
grep -c -- "--public-ip=139.99.145.13" <net>/docker-compose.multinode.yml   # phải là 10
```

**Đo `30/08`: kết quả là `1`, và `1` mới ĐÚNG.** netgen (patch 0024 / D-089) **cố ý** chỉ cho
beacon khai địa chỉ công khai; các node cùng máy giữ địa chỉ nội bộ vì Docker không NAT vòng lại
— và **chính diễn tập của thiết kế đó đã bác bỏ** phương án cho mọi node khai IP công khai (node2
và node3 không nối được nhau, mesh teo thành hình sao quanh node1).

🔴 Giữa ngày G, phép đo này báo *"hỏng"* cho một mạng **đúng**, và cách sửa hiển nhiên nhất — cho
mọi node khai IP công khai — là **tái lập đúng cái thiết kế đã bị bác**. Một dòng nghiệm thu sai
còn tệ hơn không có dòng nào.

**Phép đo đúng:** `--public-ip=<IP công khai>` xuất hiện **đúng 1** lần · `--public-ip=` xuất hiện
**N** lần. Đã đưa thành việc tay riêng trong preflight (23 → 24).

---

## D-128 — Số đo lượt diễn tập g1 `2026-08-30` (máy dev, băng TẬP `899999998`)

Hai lượt sinh mạng, cả hai ở thế hệ **1**, băng **TẬP** — hai băng không bao giờ bắt tay được với
nhau (`A1IDGocTap`), nên tập ở `A1Gen 1` không tạo rủi ro *"bản tập thành bản thật"*.

**Binary — đo BINARY, không đo mạng:**

| | |
|---|---|
| build image `9chain-a1/node:g1` | **exit 0** · `commit=9chain-a1-g1-26patch-60a61707` |
| `supplyCap` (log **trong** container) | `7900000001000000000` ✓ |
| `eth_chainId` | `0x218711a09` = **9000000009** ✓ |
| `avm.getAssetDescription("LOVE9")` | `LOVE9 Coin` · denom 9 ⇒ patch 0019/0022 **có** trong binary |
| đối chứng ngược `("AVAX")` | **ĐỎ và nói ra lý do**, câu trả lời tự khai `networkID 899999998` |

🔴 **Image này dùng lại được ngày G** — binary **không** phụ thuộc byte chữ khắc (chữ khắc đi vào
genesis). Bước dài nhất của ngày G đã đẩy ra khỏi ngày G.

**Chữ khắc — cơ chế nghiệm thu trọn ở thế hệ 1, hai lần (N=10 và N=9):**

| | |
|---|---|
| `engrave-verify` đọc ngược từ **chain sống** | **13 đạt · 0 hỏng** (cả hai lượt) |
| block 0 P-Chain | `parentID == sha256(genesisBytes)` ✓ |
| bản văn **trên MẠNG** == **trong TỆP** | ✓ · `extraData` khớp · P/C cùng byte 3/3 |
| 4 hash tài liệu tính **độc lập** trên host | khớp **4/4** bảng netgen in |
| ĐỎ: thiếu `A1_ENGRAVE_CHECKSUMS` | chặn, chỉ ra cả đường thật lẫn đường tập |
| ĐỎ: vân tay **lệch 1 ký tự** | chặn, và nói *"đi tìm xem tài liệu nào đổi"* |

⚠️ **Bẫy phép đo:** gọi `engrave-verify --rpc` qua `host.docker.internal` ⇒ **HTTP 403 "invalid
host specified"** — đó là bộ lọc `Host` của M11.10 **làm đúng việc**, không phải chữ khắc hỏng.
Gọi từ trong namespace mạng của node (`--network container:<node1>`, `http://127.0.0.1:9650`) thì
qua. Ngày G phải gọi qua Host nằm trong `A1_HTTP_ALLOWED_HOSTS`.

**Hình dạng ngày G (`N=9`, node9 chạy NGOÀI compose, vai máy Hetzner):**

| điều kiện qua | đo được |
|---|---|
| self-bond mỗi node | **999.999 LOVE9** — bộ chín số 9, hết cảnh báo netgen |
| `--public-ip=<công khai>` / tổng `--public-ip=` | **1 / 9** ✓ |
| staking port | `9651…9659` · publish `0.0.0.0:9651` (chỉ beacon) |
| node9 bootstrapped P/X/C | **true / true / true** |
| nodeID node9 tự khai ↔ `genesis.json` | **khớp** — danh tính đúng, không phải bản tự sinh |
| `platform.getCurrentValidators` | **9** |
| node **không phải beacon** thấy node9 | **có** |
| cửa sổ hạn validator | **56 ngày** · offset **7 ngày**/node ✓ |
| health node9 | `healthy: true` · `connectedPeers: 8` · không cảnh báo D-121 |

🔴 **Con số đáng nhớ nhất cho ngày G: node ngoài bootstrap ở ~50s, nhưng node KHÔNG-beacon chỉ
thấy nó ở ~70s.** Chấm điểm ở mốc 30s là khai một sự cố không có thật.

⚠️ **Giới hạn phải khai:** node ngoài chạy trên **cùng máy dev** (bridge khác), nên rào cản mạng
giữa **hai máy vật lý** không được mô phỏng — và inbound tới nó dễ hơn thực tế. Lượt này **không
thay thế** phép đo với Hetzner, đặc biệt cho `ingressConnectionCount` (D-121).

**Gotcha 16 xác nhận thật:** netgen ghi `image: 9chain-a1/node:dev` đúng **10 lần** (N=10) và **9
lần** (N=9). Không biến nào đổi được. Phải sửa tay trước mỗi lượt `up`.

**Dọn theo kỷ luật D-107, ngay trong phiên tạo ra:** mạng tập cũ `a1tap-node-1/2/3` (thế hệ 0,
băng tập) + 3 volume · bộ dò `net-probe-portbase` (**22** tệp khoá) · `net-tap-g1` (**20** tệp
khoá) — tất cả `shred -u -n 3`, đối chứng bằng `find` ⇒ **0 tệp**, thư mục biến mất.
`check-key-leaks.mjs` ⇒ **exit 0**.

**Số đo cuối:** preflight `--no-network` **14 đạt · 0 đỏ · 4 bỏ qua · 24 việc tay**
(17 → 22 → **24**).

---

## D-129 — Đường sản phẩm gãy ba chỗ, và chỗ đắt nhất nằm ở BIẾN MÔI TRƯỜNG TRÊN SERVER (2026-08-31)

David đi thử `/create-chain/` **đúng như một người dùng thật**. Ba lỗi lộ ra theo đúng thứ tự
người dùng gặp — không lỗi nào bị cổng nào bắt trước đó.

**1. Ô chọn loại chain hiện SÁU DÒNG TRỐNG.** `CreateChainScreen.tsx` khai kiểu
`{ id, ten, moTa }` — tên trường thời id preset còn tiếng Việt. Console
(`local-net/lib/presets.mjs`) trả `{ id, name, desc }`, nên `p.ten` là `undefined` và mọi
`<option>` render **không có chữ**: người dùng chọn cấu hình **vĩnh viễn** cho chain của mình
bằng cách bấm mù, ngay dưới dòng chữ *"Once chosen it is fixed — a chain's genesis cannot be
edited."* Cùng lệch đó làm **màn hình soát lại** cũng trống ở dòng loại chain — tức nó che mất
lựa chọn ở **cả hai** nơi người dùng lẽ ra được đọc. TypeScript không bắt được: dữ liệu qua
dây, không phải giá trị trong mã. Đây là D-108 quay lại — lượt đổi id sang tiếng Anh làm ở
console mà **không nối sang web**.

**2. Cổng đẻ chain ĐÓNG** — đúng thiết kế (D-087). Ảnh chụp của David là lần đầu ai đó thấy
cổng đó **nói ra thành lời với người dùng thật**; trước giờ nó chỉ tồn tại trong mã.
⇒ **David chốt `31/08`: MỞ HẲN tới ngày G.** Đã đặt `A1_DE_CHAIN_MO=1` trong
`~/9chain-a1/console.env` và khởi động lại bằng `console-restart.sh` (PID mới 751090 ≠ cũ
145971). Console tự khai `đẻ chain: 🔓 MỞ`.

**3. 🔴 `A1_PUBLIC_RPC_BASE` trỏ TÊN MIỀN CHẾT.** Biến trên server khai
`https://rpc-testnet-a1.9chain.org` — tên cũ, đo được **525**. Console dùng đúng biến này để
dựng URL RPC **trả cho người vừa tạo chain**: chain chạy thật, nhưng người dùng nhận một địa
chỉ không bao giờ nối được. Đã sửa → `https://rpc-a1.9chain.org` (**200**).

🔴 **Bài học chung của cả ba, và nó là lớp lỗi mới cho repo này: cấu hình sản phẩm nằm trong
BIẾN MÔI TRƯỜNG TRÊN SERVER là điểm mù của mọi cổng đang có.** `check-deploy-drift` so **tệp**,
không so **env**. Repo đúng, tệp khớp, cổng xanh — mà thứ người dùng chạm vào thì sai. Chính
`server.mjs` có sẵn dòng dặn đặt đúng tên miền; biến *có* được đặt, chỉ là đặt sai giá trị, và
không gì trên đời này bắt được điều đó. ⇒ Ngày G phải có một phép đo **env trên server**, không
chỉ so tệp.

**Nghiệm thu — đo trên sản phẩm, không tin bước deploy:** bundle công khai của
`a1.9chain.org/create-chain/` nay chứa `children: e.name`, `"chuan"` **0 lần**;
`/create-chain/` 200 · `/console/api/chains` 401 (sống, đòi đăng nhập) · `rpc-a1` 200.
`npm run build` exit 0 qua hết cổng postbuild; typecheck **0 lỗi** ở tệp sửa (7 lỗi còn lại ở
`test/mang.test.ts`, có sẵn từ trước).

⚠️ **Đã đụng worktree web** — vượt luật cứng #4, theo yêu cầu tường minh của David sau khi đo
worktree sạch (không phiên nào làm dở). Commit `7ac2ada` trên `web-home` + `web-deploy.sh`
(7/7 liên kết sống). Ghi ra đây để phiên web biết mà `git pull` trước khi làm tiếp.

---

## D-130 — 🔴 Khoá `A1_CLI_KEY` lộ trong transcript: sinh khoá factory mới thành BẮT BUỘC (2026-08-31)

Lệnh đo `/proc/<pid>/environ` của console lọc bí mật theo **mẫu chuỗi** (`TOKEN=`, `PK=`) và
**trượt** `A1_CLI_KEY`. Khoá ví `chain-factory` in ra dạng rõ trong transcript phiên.

**Thiệt hại kinh tế bằng 0** — ví testnet, ~90 LOVE9 không có giá trị thật. Nhưng:

🔴 **D-117b đã ghi *"ngày G sinh mạng mới thì sinh luôn khoá factory mới"* ở mức KHUYẾN NGHỊ.
Nay là BẮT BUỘC** — cùng lượt với token console và khoá faucet.

**Bài học:** lọc bí mật phải theo **danh sách trắng tên biến được phép in**, không theo mẫu
chuỗi. Mẫu chuỗi bảo vệ đúng những gì ta nghĩ ra lúc viết lệnh, và biến nguy hiểm nhất thường
là biến không nằm trong danh sách đó. Cùng họ với D-117 (khoá quỹ nằm 20 giờ trong `%TEMP%`),
chỉ khác là lần này kênh rò rỉ là **transcript**, không phải đĩa.

---

## D-131 — Soát tổng `31/08`: điều kiện qua ngày G đang **1/5**, và cái chặn phần lớn không phải mã

Đo lại toàn bộ, không trích tài liệu. Đối chiếu với năm điều kiện của
`TESTNET1-PUBLIC-2026-09-01.md` §4:

| # | điều kiện | trạng thái `31/08` |
|---|---|---|
| 1 | `gday-preflight.mjs` exit 0 | 🔴 15 đạt · 3 đỏ · **24 việc tay chưa tick** |
| 2 | g1 sống, chữ khắc đọc ngược được | 🔴 **cơ chế 13/13, BYTE CHƯA TỒN TẠI** |
| 3 | node NGOÀI máy chủ là peer | ✅ đạt (Hetzner 🇩🇪, và đường vào-genesis đã tập `30/08`) |
| 4 | repo công khai, người lạ dựng lại được fork | 🔴 cây fork sẵn sàng, **chưa có GitHub remote** (H-6) |
| 5 | genesis+bootstrap công bố + tài liệu validator | 🔴 `docs/RUN-A-VALIDATOR.md` **chưa tồn tại** (G-2) |

🔴 **Rủi ro cao nhất, và nó tránh được bằng MỘT quyết định chứ không bằng thêm giờ làm:
ngày G có thể mất lý do tồn tại.** Khắc chữ là lý do chính để bỏ `g0` đang chạy tốt. Không có
byte thì ta trả **toàn bộ** chi phí re-genesis — mọi `blockchainID` đổi, mọi ví về 0, mọi L1
người dùng biến mất — để nhận về một mạng **giống hệt cái vừa xoá, chỉ khác số thế hệ**.
Ba đường: đóng băng byte hôm nay · chấp nhận g1 không chữ khắc · **dời ngày G**. Không có gì
buộc `g0` phải chết ngày `01/09`: nó đang 10/10 validator.

**Hai phát hiện phụ, cả hai ở bề mặt người lạ nhìn thấy đầu tiên:**

1. **`heartbeat.json` không phải rác** — trang chủ đọc số đo từ `/chains/data/heartbeat.json`.
   Suy đoán `30/08` (*"bộ bơm giao dịch"*) mới đúng một nửa. ⇒ Sau `down -v` mà không dựng lại
   cho g1 thì **trang chủ in số của mạng đã chết**, HTTP 200, không cổng nào bắt. G-6 nay có
   thêm mặt này, không chỉ mặt "bơm vào chain chết".
2. **`a1.9scan.org` khai endpoint bằng tên miền cũ** ⇒ `LATEST BLOCK —`, `VALIDATORS —`, mọi số
   rỗng. NetworkID nó in thì **đúng** (`999999999`), nên lỗi không lộ ở chỗ dễ thấy. Người lạ mở
   explorer sẽ kết luận mạng chết trong khi mạng chạy 10/10. Thuộc 9Scan-A1 — A1 chỉ báo.

**Số đo nền:** preflight **15 đạt · 3 đỏ · 24 việc tay** · drift **17 khớp · 2 lệch · 3 mồ côi**
· `check-net-dirs` **🔴 2 tệp giữ tiền thật ngoài thư mục thế hệ sống** (B-19) ·
`h6b-backup --check` **🔴 không còn tả được mạng đang chạy** · mạng g0 **10/10 validator**.

## D-132 — **A1 là chain DẪN DẮT; C1 và mọi testnet sau follow theo A1** (2026-08-31)

**David chốt:** *"giờ bạn hãy xem testnet A1 là dẫn dắt và C1 hoặc các testnet khác sau này
có thể sẽ follow theo"*.

Đây là **mở rộng D-041 sang đúng phần mà D-041 đã loại trừ tường minh**. D-041 (`26/08`) đảo
chiều cho tokenomics và ghi rõ: *"Đảo chiều này CHỈ áp cho phân bổ/tokenomics. Phần khắc chữ
vẫn theo chiều cũ — C1 sinh, A1 chép byte."* Vế loại trừ đó **nay bỏ**.

### 🔴 Thứ KHÔNG đổi — và nó không mâu thuẫn với việc dẫn dắt

**Byte của g1 vẫn lấy từ bản đóng băng `2026-08-07` của C1.** Ba tài liệu
(`genesis_inscription` · `dedication` · `dedication_eva`) đã được C1 khắc lên chain của nó từ
tháng trước. A1 tự đóng băng lại phiên bản của mình ⇒ hash khác ⇒ **`G5e` — vật chứng đồng
nhất giữa hai chain — biến mất**. Đó là thứ mạnh nhất cả hệ đang có; đổi nó lấy một tư thế là
lỗ ròng.

⇒ Cách đọc đúng: **văn bản không phải "của C1", nó là canon của 9Chain.** C1 chỉ là **nhân
chứng đầu tiên**. A1 khắc đúng byte đó là trở thành nhân chứng **thứ hai** — và là nhân chứng
**kiểm được bằng một lệnh**, thứ C1 không có.

⇒ **Dẫn dắt TỪ NAY, không hồi tố.** Cùng luật D-104 đã dặn: đừng sửa những câu **kể về quá
khứ**; chỉ đổi câu nói **A1 đang chờ gì**.

### Bốn hệ quả cụ thể

**1. A1 là nơi canon được KIỂM, không chỉ được lưu.** A1 có hai mặt khắc (P-Chain gốc +
C-Chain `eth_getCode`), có `engrave-verify` đọc ngược **từ chain sống**, và netgen tự sinh
`engraving.md`. C1 có một mặt và không có công cụ đọc ngược. Nghiệm thu `31/08` trên mạng tập
g1: **15 đạt · 0 hỏng**, gồm `parentID` block 0 P-Chain `==` `sha256(genesisBytes)`. Sau ngày
G, câu *"chứng minh đi"* trả lời được bằng một lệnh — **trên A1**.

**2. Bộ định danh theo THẾ HỆ là thứ chain sau nên chép trước tiên.** `A1Gen` là một số
nguyên, và networkID · tên mạng · khối chainId L1 · băng TẬP đều **suy ra từ nó**, có cổng bắt
ở **hai ngôn ngữ** (`check-consistency.mjs`), và băng tập **không bao giờ bắt tay được** băng
thật (`A1IDGocTap 899_999_999`). C1 không có gì tương đương. Nó chặn đúng lớp hỏng đắt nhất:
*một mạng tập mang bản sắc của mạng thật*.

**3. Kỷ luật cổng chuyển giao tốt hơn cả mã.** Mã thoát **0/1/2 với `2` = "không đo được" ≠
"đạt"** · mọi cổng phải **từng thấy ĐỎ vì đúng lý do** (luật cứng #2, ba vế) · một hằng số
**MỘT nơi khai** (`check-single-source`) · bánh cóc thay vì di dời ồ ạt · *"dấu miễn trừ không
bao giờ cho nội dung sẽ lên chain"*. Đó là thứ chain sau copy được ngay, không cần Avalanche.

**4. Chiều của cổng đối chiếu phải tổng quát hoá — nhưng SAU ngày G.**
`netgen/engrave.go → verifyAgainstC1()` đóng cứng chiều vào **tên hàm và tên biến môi trường**
(`A1_ENGRAVE_CHECKSUMS` mô tả là *"bản đóng băng của C1"*). Nó phải thành *"đối chiếu với
CANON"*, canon là một artifact bất kỳ chain nào trỏ vào được. Nhưng nó nằm trong `patches/`
⇒ sửa là **sinh lại cả 26 patch** và dịch `TREE_FORK`, vào đúng hôm trước ngày G, đồng thời
làm `commit=` của image g1 dùng lại thành lạc hậu. **Hoãn sau ngày G**, ghi thành việc.

### 🔴 Nghĩa vụ đi kèm — phần nặng hơn phần quyền

Người dẫn dắt thì **lỗi cũng được nhân bản**. Ba lượt quét `31/08` tìm ra, tất cả trong mã của
chính A1: một bộ đối chứng **đỏ suốt một ngày** mà preflight không chạy · một cổng đo **đồng hồ
của Cloudflare** thay vì của node · một phép đối chiếu C1 **không bắt được gán nhầm tài liệu**
· một tiêu chí nghiệm thu **runbook không thoả được** (`A1_COMMIT`) · một trần L1 **biến mất vì
một biến gõ sai**. Chain sau chép **cả thiết kế lẫn lỗi**.

⇒ **Luật cho việc xuất bản: đừng công bố một chuẩn mà chính A1 chưa đạt.** Ví dụ sống — quy
tắc *"mã nguồn chỉ tiếng Anh"* (§0): nợ của chính A1 hôm nay là **5.750 dòng / 107 tệp**. Công
bố nó như một **trạng thái** là dựng lại đúng *"ĐÃ ĐÓNG trong repo ≠ đã đóng ở nơi người dùng
chạm"*. Công bố như một **bánh cóc kèm số nợ khai thật** thì trung thực, và đáng học hơn.

### ASV 1901 — nay A1 CÓ quyền tự đóng băng, và vẫn KHÔNG dùng quyền đó cho g1

Dưới chiều mới, A1 tự soạn `ASV 1901` + tự ghi hash vào freeze của mình là hợp lệ về quy trình.

🔴 **Nhưng nó phá chính cổng đang bảo vệ nó.** `verifyAgainstC1` sinh ra để chặn *"gõ lại văn
bản thay vì chép byte"*. Một tài liệu A1 **vừa soạn, vừa đóng băng, vừa khắc trong cùng 24
giờ** thì cổng đang so A1 với **chính A1** — đúng **D-112**: *"cổng áp đủ bộ rồi so hằng số
của chính mình chưa phải cổng"*. Trong cả bộ khắc nó sẽ là mục **trông chắc nhất mà yếu nhất**.

⇒ Thứ tự đúng của người dẫn dắt: **A1 công bố ASV vào canon trước** (commit, có mốc thời gian,
công khai) → C1 và chain sau nhận → **thế hệ sau** khắc với hai nhân chứng độc lập. Dẫn dắt
không có nghĩa là vội. Ngày G g1 khắc **4 tài liệu đã có hai nguồn độc lập**.

### Phải báo ngay, vì có thể đang chờ nhau

D-041 đã dặn đúng câu này và nó lặp lại: **báo C1 + BOD ngay.** Có một trường hợp đang sống —
`request/2026-08-26-genesis-document-10-EN.md` gửi dưới **chiều cũ** (*C1 giao, A1 chép*). Nếu
C1 vẫn đang chờ để giao mà A1 đã quyết không dùng cho g1, hai bên đốt ngày cho một thứ không
ai còn cần.

---

## D-133 — Canon khắc chữ của A1 **đứng một mình**; bản đóng băng cũ hạ xuống làm **vật chứng** (2026-08-31)

David: *"tách biệt dữ liệu nói về C1, vì có thể C1 sẽ không được chọn và A1 được chọn.. nên
tách ra hoàn toàn."*

**Đo trước khi cắt.** Toàn bộ tài liệu người dùng chạm vào (`CREATE-A-CHAIN.md` + bản VI,
`RUN-A-VALIDATOR.md`, trang faucet/create-chain) **đã sạch sẵn** — không nhắc C1 dòng nào.
Chỗ dính là **đúng một đường**: đường khắc chữ. Cổng chứng minh *"byte được CHÉP, không GÕ
LẠI"* trỏ vào tệp đóng băng của mạng khác, và runbook bảo người vận hành đối chiếu với tệp đó.

### Làm gì

| | |
|---|---|
| `docs/engrave/CANON.txt` **(mới)** | canon của riêng A1, sinh từ chính byte của A1: `id · sha256 · bytes · surfaces · lang`. **Không nêu tên mạng nào khác, không phụ thuộc mạng nào khác.** Đây là tệp `A1_ENGRAVE_CHECKSUMS` trỏ vào |
| `CHECKSUMS-FREEZE-LOVEPAPER.txt` → `attestation-2026-08-07.txt` | giữ lại làm **VẬT CHỨNG**, không còn là **PHỤ THUỘC**. Bản dựng **không đọc tệp này** |
| `GDAY-ENGRAVING.md` · `gday-preflight.mjs` | mọi đường dẫn và mọi câu chỉ dẫn nay trỏ `CANON.txt` |

### 🔴 Cái giá — viết ra, không giấu

Cổng đối chiếu **mạnh nhất khi tệp nó so là tệp người khác viết TRƯỚC ĐÓ**. `CANON.txt` do
chính A1 viết từ chính tệp của A1 ⇒ **một mình nó chỉ chứng minh nhất quán nội bộ**, không
chứng minh **nguồn gốc độc lập**. Đó là hình dạng **D-112**, y hệt thứ D-132 §4 vừa cảnh báo.

Thứ vẫn đỡ nó: bốn hash trong `CANON.txt` **trùng khít từng chữ số** với
`attestation-2026-08-07.txt` — bản đóng băng **có ngày tháng, sinh ra ở nơi khác, TRƯỚC** tệp
này. So hai tệp mất một lệnh. Đó là lý do bản cũ được **giữ chứ không xoá**: xoá nó là biến
`CANON.txt` từ *"có hai nguồn"* thành *"A1 tự khai"* mà không cổng nào kêu.

### Còn đúng một chỗ chưa tách được — và nó nằm sau luật cứng #3

netgen vẫn **in ra** chuỗi `"khop ban dong bang cua C1"`, và hàm của nó tên `verifyAgainstC1`
(`9chain-a1-tools/netgen/engrave.go`, 28 lần nhắc). Cả hai nằm **trong `patches/`** ⇒ đổi là
**sinh lại cả 26 patch và dịch `TREE_FORK`** vào đúng đêm trước ngày G. **Hoãn sau ngày G**,
gộp cùng việc tổng quát hoá cổng (D-132 §4). Ngày G nó chỉ là **một dòng chữ in ra sai tên**,
không phải hành vi sai.

### Đối chứng — thứ nói lên tất cả

Chạy lại netgen với `A1_ENGRAVE_CHECKSUMS=/repo/docs/engrave/CANON.txt`:
vân tay **`f04e939b58e58db46714047978b989cb167cf5f8875bcb4e4ad2563ebd366b18`** — **không đổi** —
và `✓ khac chu: 4/4`. Bốn tài liệu vẫn `108 + 25 + 45 + 964 = 1.142` byte, hash từng tệp y nguyên.
⇒ **Lượt tách này dịch chuyển giấy tờ, không dịch chuyển một byte nào sẽ lên chain.**

---

## D-134 — Quét toàn diện trước giờ G: **hằng số neo vào thế hệ** là một lớp lỗi, không phải một lỗi (2026-08-31)

David: *"quét lại toàn diện code, tài liệu… đảm bảo đến giờ G sẽ đưa lên bản chuẩn nhất, sạch
nhất, mọi lịch sử bắt đầu từ giờ G."*

### 🔴 Phát hiện chính: cùng MỘT literal, BA tệp, và cả ba đều là cổng

Sáng nay `check-net-dirs.mjs` được sửa vì chép cứng `999_999_998` làm *"thế hệ KHÁC"* — con số đó
**trở thành mạng sống** đúng lúc `A1Gen` lên 1, nên đối chứng ngược của nó đã **ĐỎ suốt một ngày**.
Quét literal ấy ra thêm **hai** chỗ nữa, và cả hai nặng hơn:

| Tệp | Chép cứng | Vì sao nguy |
|---|---|---|
| `scripts/wallet-over-tunnel.mjs` | `NETWORK_ID` mặc định `"999999999"` | **thế hệ g0 ĐÃ CHẾT**. Đây là công cụ ký giao dịch X/P **bằng khoá quỹ**. networkID sai **không** làm ví từ chối dựng giao dịch — nó làm **mạng từ chối chữ ký**, và cái đó đọc ra như lỗi hầm hoặc lỗi node, **không** như *"anh vừa ký cho một thế hệ đã chết"* |
| `scripts/wallet-over-tunnel.mjs` (đối chứng) | ca "sai băng" = `"999999998"` | đang **đòi mạng SỐNG phải bị từ chối** |
| `scripts/check-keys-on-chain.mjs` | ca "thế hệ khác" thay bằng `999999998` | thay bằng **giá trị sống** ⇒ ca đối chứng ra **XANH**, và cái xanh đó đọc ra như *"cổng mềm đi"* |

⇒ **Bài học, và nó tổng quát hơn cả ba ca:** một hằng số viết dưới dạng *"thế hệ nào đó khác"*
**luôn** đi vào ô của mạng sống ở lượt bump kế tiếp. Không được chép; phải **suy ra**. Cả ba nay
đọc `A1_GEN`/`A1_ID_GOC` từ `local-net/lib/chainid.mjs` — đúng module `local-net/network-id.sh`
vốn đã dùng. Ca "sai băng" của công cụ ví nay là **thế hệ TRƯỚC** (`netID + 1`): sai ở mọi thế hệ
theo kiến trúc, không cần ai nhớ sửa.

**Đo, không đoán:** `check-keys-on-chain --self-test` = **5/5 đỏ**, ca mới in
*"tệp khai 999999997, chain đang chạy 999999999"* — né đúng cả giá trị sống lẫn giá trị chính tệp
mẫu khai. `wallet-over-tunnel` thêm một assertion **chạy trước cả Docker**: mặc định phải LÀ thế hệ
sống — đúng một dòng, và nó là dòng đáng ra đã bắt được cả lớp lỗi này.

### README — cửa trước, và nó khai ba điều SAI

`README.md` là **tệp gốc duy nhất không phải sổ tay**: người lạ đọc nó trước, và ngày G repo là
đường người ngoài lấy `genesis.json` + bootstrap. Nó đang **chỉ có tiếng Việt**, trên một dự án có
luật §0 sinh ra chính vì người đóng góp nước khác. ⇒ **Tiếng Anh thành bản nguồn**, tiếng Việt sang
`README.vi.md` — đúng khuôn `CREATE-A-CHAIN.md`/`.vi.md` và đúng D-132.

Ba câu **sai**, không phải cũ:

1. 🔴 *"`patches/` — 25 patch (tree `f2b9486b`)"*. Trên đĩa: **26 patch, tree `60a61707`**.
   `f2b9486b` là tree của **đối chứng 25/26**. Người làm theo README sẽ áp 25 patch, **khớp một
   hash đã công bố**, và build ra **binary sai** — đúng cái hỏng mà đối chứng sinh ra để chặn, nay
   được trao cho họ dưới dạng **hướng dẫn**.
2. Mục thế hệ mô tả g0 là hiện hành và bảo *"ngày G bump `A1Gen` lên 1"* — `A1Gen` **đã** là 1.
3. Cảnh báo B-14 nói đường CLI vẫn đẻ chain `chainId 9100`. **D-114 đã đóng**: cả `create-l1.sh`
   lẫn `9chain-a1 l1 create` nay dựng genesis qua `make-l1-genesis.mjs` (đo lại hôm nay).

**Bỏ:** bảng chép tay *"thư mục `net*` nào thuộc thế hệ nào, thư mục nào giữ tiền"*. Nó là **bản
chép cứng đầu ra của `check-net-dirs.mjs`** — đúng lớp "số chép tay trôi khỏi thứ nó mô tả" mà repo
này dựng lên để chống — **và** nó là tấm bản đồ chỉ chỗ quyền chi tiêu nằm trên máy dev. README nay
bảo **chạy cổng**. Cùng lý do: **không có con số đếm cổng** trong hai tệp; ghi số vào đó là hẹn
trước một lần trôi lệch.

### 🔴 "Mọi lịch sử bắt đầu từ giờ G" — một chỗ mà đọc theo NGHĨA ĐEN là hỏng

Đúng cho **chain**: block, số dư, `blockchainID` của C/X, danh tính validator, khoá, token — tất cả
sinh lại, không mang gì từ g0 sang.

🔴 **SAI cho `local-net/console/chainid-issued.json`.** Sổ đó (**49 chainId · 54 tên**, gộp từ 5
nguồn gồm bản kéo về từ server `31/08`) là **danh sách chặn XUYÊN thế hệ**. Thu hồi một chain
**không gỡ được mạng khỏi ví ai**, nên cấp lại một chainId cũ là **mở đường cho chữ ký của chain
chết phát lại trên chain mới**. "Bắt đầu lại từ 0" ở đây = **thả 54 tên + 49 chainId trở lại lưu
thông**. Sổ này, `patches/` và `docs/evidence/**` là **ba thứ phải đi qua ngày G nguyên vẹn**.

### Ba việc còn lại, và cả ba là quyết định của David

| | |
|---|---|
| 🔴 `main:web/lib/chain.ts:23` khai `networkId: 9001` — **hai thế hệ chết** | `main` **không** phải bản đang chạy (bản sống ở worktree `web-home`), nhưng repo công khai sẽ **xuất bản** mã nguồn trang web khai thế hệ chết. Luật cứng #4 cấm phiên này đụng `web/` ⇒ hoặc merge `web-home` vào `main` trước ngày G, hoặc gỡ `web/` khỏi bản công bố |
| 🔴 Repo công khai = **công bố cả sổ nội bộ** | `DECISIONS.md` · `HANDOFF.md` · `BLOCKERS.md` · `docs/AUDIT-A1/` đi kèm: mọi lần cháy, mọi phát hiện soát nguồn, bố cục server. Không có khoá nào trong đó (quét `PrivateKey-` = **0**, khoá EVM 64-hex gán cho biến khoá = **0**, ngoài khoá `ewoq` vốn đã công khai). Đây là **lựa chọn**, không phải sự cố — nhưng phải là lựa chọn có ý thức |
| 🔴 Đẻ chain đang **MỞ**, và chain đẻ hôm nay **chết ngày mai** | Hai chain người thật (`Eric1` · `eric1`) đã có. Hoặc đóng cổng đẻ tới sau ngày G, hoặc báo cho họ. Bản ghi đã cứu vào sổ; **người thì chưa ai báo** |

---

## D-135 — **ĐÓNG cổng đẻ chain** trên sản phẩm, `31/08` (David chốt)

David: *"đóng cổng đẻ chain lại đi."* Lý do đã nằm sẵn trong chính đoạn mã: ngày G `01/09` xoá
sạch mọi L1 người dùng, nên **mỗi chain người lạ đẻ ra từ giờ tới đó là một lời hứa ta BIẾT CHẮC
sẽ nuốt lời** — và họ không biết điều đó. Hai chain người thật (`Eric1` · `eric1`) đã là bằng chứng
cái cửa mở này tốn gì.

### Đã làm — trên SERVER, không phải trong repo

| Bước | |
|---|---|
| Sao lưu | `console.env.bak-before-close-20260831` (`cp -n`, không đè bản có sẵn) |
| Đổi | `A1_DE_CHAIN_MO=1` → `=0`. **Đúng một dòng**: `diff` ra **2 dòng** (`<`/`>`), bộ tên biến **trùng khít**, `wc -l` **16 → 16** |
| Khởi động lại | `~/9chain-a1/console-restart.sh` — đường được hỗ trợ, **không** phải một dòng `ssh` tự chế |

🔴 **Vì sao dùng script chứ không gõ tay:** console chạy bằng **`node` trần, PPID 1, không
systemd, không compose** — không có ai dựng nó dậy nếu nó chết. `ssh host 'pkill -f
"console/server.mjs"'` **tự giết chính phiên ssh** (chuỗi đó nằm trong dòng `bash -c` của nó), và
`tail console.log` sau đó **trông y hệt một lượt lên thành công** vì banner cũ còn nằm lại. Script
chốt **PID cũ trước khi giết** rồi đòi **PID mới ≠ PID cũ** trên cổng đang nghe: `751090 → 1143490`.
Cổng có người nghe chưa phải bằng chứng — **người khác** mới là.

### Nghiệm thu — trên SẢN PHẨM, không phải trên repo

```
POST https://a1.9chain.org/console/api/create   (qua Cloudflare + Caddy, đường người dùng đi)
→ HTTP 400
→ "Chain creation is paused. The public network is being rebuilt on 2026-09-01 …"
```

🔴 **Đỏ VÌ ĐÚNG LÝ DO** (vế ba của luật cứng #2). Tôi cố ý gửi **tên KHÔNG hợp lệ** (`"!!!"`): nếu
cổng còn mở, phép kiểm tên sẽ bác — nên **không lượt nào đẻ ra chain thật dù kết quả thế nào**, và
hai câu trả lời phân biệt được. Thứ trả về là **văn bản của chính cái cổng**, không phải lỗi tên,
không phải 401, không phải hạn mức ⇒ cổng chặn **trước mọi phép kiểm khác**, đúng chỗ mã đặt nó.

Banner tiến trình mới: `đẻ chain: 🔒 ĐÓNG`. Bốn mặt công khai (`/`, `/create-chain/`, `/faucet/`,
`/chains/`) đều **200**; node vẫn `networkID 999999999`. **Thu hồi KHÔNG bị chặn** — mã cố ý để vậy:
*"đóng cửa vào không được nhốt người đã ở trong"*.

### 🔴 Lộ ra một thứ khác khi đọc banner

Console trên server in: **`sổ A1 đã cấp: 47 chainId · 53 tên (gộp từ 4 sổ)`**. Repo đang là
**49 · 54, gộp từ 5 sổ** — bản tôi sinh lại sau khi kéo sổ sống về `31/08`. ⇒ **Server đang chạy
danh sách chặn CŨ, thiếu đúng hai chainId của Eric.** Hôm nay vô hại vì cửa đã đóng; **trước khi
mở lại sau ngày G thì bắt buộc phải đẩy lên**, nếu không hai số đó có thể được cấp lại cho người
khác — đúng lỗ phát lại mà cả cuốn sổ sinh ra để bịt. Đã có trong việc tay của preflight; đây là
lần **đo được trên sản phẩm**.

### Mở lại

`A1_DE_CHAIN_MO=1` trong `~/9chain-a1/console.env`, rồi `~/9chain-a1/console-restart.sh`.
🔴 **Mở bằng TAY, không mở bằng đồng hồ** — một cổng tự mở theo mốc thời gian sẽ mở **kể cả khi
ngày G trượt**, tức đúng lúc điều kiện nó đang canh chưa thoả. Trước khi mở: đẩy
`chainid-issued.json` (49 · 54) lên server.

### D-135b — đẩy `chainid-issued.json` lên server (`31/08`, ngay sau khi đóng cổng)

David: *"đẩy chainid-issued.json lên server luôn đi."*

🔴 **Phép kiểm phải chạy TRƯỚC, không phải sau:** đẩy một sổ chặn **thiếu mục** là tự tay mở lại
đúng cái lỗ nó bịt. Nên câu hỏi không phải *"bản mới có mới hơn không"* mà *"bản mới có CHỨA TRỌN
bản cũ không"*:

```
chainIds: server 47 → repo 49   · sẽ MẤT: không có gì · thêm: 9000000010, 9000000011
names   : server 53 → repo 54   · sẽ MẤT: không có gì · thêm: Eric1
```

⚠️ **Tên chỉ +1 trong khi chain là +2 — và đó ĐÚNG, không phải mất bản ghi.** `loiTenDaCap` tra
bằng khoá **đã hạ về chữ thường**, nên một cách viết chặn mọi cách viết. Đo trên đúng bộ byte vừa
đẩy: `Eric1` · `eric1` · `ERIC1` · `  eRiC1  ` → **đều bị từ chối**, cùng khớp về `"Eric1"`; một
tên chưa ai dùng → **vẫn tự do**.

| Bước | |
|---|---|
| Sao lưu | `.bak-20260831` (hash cũ `c8fd48c8…`) |
| Đẩy | `scp` — server nay `d1e20037…`, **trùng byte** với repo |
| Nạp | `console-restart.sh` — **PID 1143490 → 1145349**; banner: `sổ A1 đã cấp: 49 chainId · 54 tên (gộp từ 5 sổ)` |
| Dọn | 🔴 **xoá `.bak`**: bộ byte cũ **tra được trong git** (`d360d33b`), nên bản sao chỉ còn là **đường lui trỏ vào một danh sách chặn YẾU HƠN** — đúng thứ D-092b/D-098 cấm để lại. Ba bước: **LIỆT KÊ → XOÁ → ĐỐI CHỨNG** (`No such file`), sổ sống không suy suyển |

Cổng drift: `chainid-issued.json` rời khỏi danh sách **LỆCH**, mồ côi **5 → 4** (bốn cái còn lại
có từ trước). Cổng đẻ chain vẫn `🔒 ĐÓNG`; ba mặt công khai vẫn **200**.

🔴 **Nói rõ giới hạn của phép đo này:** cửa đang đóng nên **không thể** nghiệm thu việc chặn tên
qua `/api/create` — cổng đóng trả lời trước khi tới phép kiểm tên. Thứ chứng minh được là chuỗi ba
khâu: **byte đã chứng minh là chặn đủ mọi cách viết** → **byte trên server trùng khít** → **console
đã nạp đúng bộ đó** (banner đếm 49 · 54). Muốn đo thẳng thì phải chờ lượt mở lại sau ngày G.

### 🔴 Còn 7 tệp mã LỆCH giữa repo và server — và một cái đã được hứa ra công chúng

`local-net/lib/chainid.mjs` (repo `A1_GEN = 1`, server `0` — **đúng cho hôm nay**, phải đẩy ngày G) ·
`console/server.mjs` · `console/index.html` · `console/chainid-test.mjs` · `lib/guard.mjs` ·
`faucet/server.mjs` · `scripts/export-chain.mjs`.

⚠️ **`docs/CREATE-A-CHAIN.md` đang hứa một hành vi server CHƯA CÓ:** nó nói với người đọc rằng
`MyChain` và `mychain` tính là **cùng một tên**. Điều đó thành thật trong `server.mjs` ngày `31/08`,
sau khi một người dùng thật đẻ `Eric1` rồi `eric1` cách nhau chín phút — nhưng bản vá **vẫn nằm
trong repo**. Ship console trước khi tài liệu đó tới tay ai, nếu không tài liệu đang mô tả một sản
phẩm không tồn tại (D-083).

---

## D-136 — ~~GIỜ G: `2026-09-01 00:00` giờ Jerusalem~~ → **THAY BẮNG D-136c** (David chốt `31/08`)

> 🔴 **Mốc này đã đổi cùng ngày sang `09:09:09`. Xem D-136c.** Giữ mục này vì phần số học múi giờ
> và cái bẫy *"lịch server ghi ngày khác"* vẫn đúng y nguyên — chỉ giờ trong ngày là đổi.

David: *"giờ G sẽ chốt lại đúng 00:00 ngày 01/09/2026 theo giờ Jerusalem."*

### 🔴 Một khoảnh khắc, ba mặt đồng hồ — và hai trong ba KHÔNG phải ngày 01/09

| Đồng hồ | Giờ G rơi vào |
|---|---|
| **Jerusalem (IDT, UTC+3)** | **thứ Ba `2026-09-01` 00:00:00** ← mốc chốt |
| **UTC** | thứ Hai **`2026-08-31` 21:00:00Z** |
| **Việt Nam (UTC+7)** | thứ Ba `2026-09-01` **04:00:00** |

⚠️ **Đây là chỗ dễ trượt nhất của cả mốc này:** *"ngày 01/09"* trong đầu người Việt là **sáng mai**,
còn mốc thật là **21:00 UTC HÔM NAY**. Máy chủ chạy `Etc/UTC` (đã đồng bộ NTP), nên mọi lệnh gõ
trên đó thấy **`2026-08-31`** ở đúng thời điểm giờ G. Ai đọc lịch server rồi kết luận *"chưa tới
ngày"* sẽ trễ mất ba tiếng.

Israel còn trong **DST tới `25/10/2026`**, nên `+3` là đúng cho mốc này — **không** phải `+2`.
Đo bằng `Intl` với `Asia/Jerusalem`, không chép tay độ lệch.

### Vì sao mốc này không nằm trong `genesis.json`

`netgen/main.go` đặt `StartTime: now-60`, **luôn động** — A1 **không** dùng `genesisTime` làm dấu
nghi lễ. Dấu phân biệt bản tập với bản thật của A1 là **chính việc có khắc chữ hay không**, cộng
`A1_ENGRAVE_CONFIRM` (xem `GDAY-ENGRAVING.md`). ⇒ Giờ G là **mốc VẬN HÀNH**: nó nói *khi nào bấm*,
không phải *con số nào đi vào genesis*. Đừng đi tìm chỗ cắm nó vào genesis — không có chỗ đó, và
đẽo ra một chỗ là tự thêm một hằng số chép tay.

### Hệ quả phải nhớ

- **Block Adam** (B-13(b)) đo lệch đồng hồ **sau** khi g1 lên, rồi mới chọn `--offset-ms`. Mốc
  `2026-09-09` của nó tính từ giờ G này.
- Câu công khai *"chains created before 2026-09-01 will be erased"* vẫn **đúng** ở giờ Jerusalem —
  không sửa, vì sửa sang UTC là làm người đọc phải tự quy đổi.
- Cổng đẻ chain **mở lại bằng TAY sau khi mạng đã sinh lại**, không hẹn giờ (D-135). Giờ G trượt
  thì cái cửa vẫn đóng — đó là điểm của việc không dùng đồng hồ.

---

## D-136b — Ship console lên server `31/08`: bốn tệp ĐI, một tệp **CỐ Ý GIỮ LẠI**

David: *"ship console lên server luôn đi."* Lý do: `docs/CREATE-A-CHAIN.md` đã **hứa ra công chúng**
rằng `MyChain` và `mychain` là **một tên** — bản vá nằm trong repo, server thì chưa có.

### 🔴 Tệp giữ lại là phần quan trọng nhất của lượt ship này

`local-net/lib/chainid.mjs` khác **đúng một dòng**: `A1_GEN 0 → 1`. Mạng đang chạy là **g0**.
Đẩy tệp đó **hôm nay** là đặt console vào trạng thái **lệch thế hệ vĩnh viễn**: cổng của chính nó
so với `999999998` trong khi node trả `999999999` ⇒ banner đỏ, và chainId (nếu cửa mở) rơi vào
**khối của thế hệ chưa tồn tại**. ⇒ Tệp này đi **cùng lượt bump ở giờ G**, không sớm hơn một phút.

### Đo phụ thuộc TRƯỚC khi copy — vì console là thứ restart cả 9 node

| Câu hỏi | Đo được |
|---|---|
| `server.mjs` mới có chạy được với `chainid.mjs` **cũ** không? | ✅ Nó cần `capChainIdTuDong · loiChainIdDaCap · loiTenDaCap · GOC_DAI_CHAINID · A1_GEN · NETWORK_ID · TEN_MANG` — bản trên server **xuất đủ cả bảy** |
| `guard.mjs` mới có phá tiến trình khác không? | ✅ **Thuần cộng thêm** (`requireInt`), không bỏ export nào. `faucet/server.mjs` và `siwe.mjs` (bản cũ) vẫn chạy |
| `requireInt` có giết console khi env **không đặt** không? | ✅ vắng ⇒ dùng mặc định (15); `"fifteen"` ⇒ **từ chối kèm lý do** — đúng lỗi nó sinh ra để bắt |
| Ba module còn lại (`eip55` · `presets` · `siwe`) | ✅ **trùng hash** sẵn |

### Đã làm

Sao lưu `~/9chain-a1/rollback-console-20260831/` (4 tệp, có sha256) → `scp` → **cả 4 trùng byte** →
`console-restart.sh` (**PID 1145349 → 1148847**).

**Banner bản mới:** `thế hệ ✅ khớp node đang chạy — g0 · 999999999` · `sổ 49 chainId · 54 tên` ·
`đẻ chain 🔒 ĐÓNG` · `trần L1 15` (tức `requireInt` đã chạy, không nổ).

**Nghiệm thu trên sản phẩm:** `POST /console/api/create` qua Cloudflare ⇒ **400** kèm văn bản của
chính cổng. Bốn mặt công khai **200**.

**Drift: `12 khớp · 7 lệch` → `16 khớp · 3 lệch`.** Ba cái còn lại: `lib/chainid.mjs`
(**giữ có chủ ý**, đi ở giờ G) · `faucet/server.mjs` · `scripts/export-chain.mjs` (công cụ, không
phải dịch vụ).

⚠️ **Vẫn KHÔNG đo thẳng được luật tên phân biệt hoa-thường** qua `/api/create`: cửa đóng trả lời
trước khi tới phép kiểm tên. Bản vá **đã ở trên server** (trùng byte) và console **đã nạp nó**;
phép đo thẳng phải chờ lượt mở lại sau giờ G.

---

## D-136c — ~~GIỜ G: `2026-09-01 09:09:09` Jerusalem~~ → **THAY BẰNG D-136d** (David chốt `31/08`)

> 🔴 **Mốc này đã đổi lần nữa cùng ngày sang `13:09:09` Jerusalem. Xem D-136d.** Giữ mục này vì
> lý do đổi khỏi `00:00` (đường tới hạn cần thời gian) vẫn đúng và vẫn là lý do của mốc mới.

David: *"vậy đổi lại 09:09:09 ngày 01/09/2026 giờ Jerusalem là ok."*

### Một khoảnh khắc, ba mặt đồng hồ

| Đồng hồ | Giờ G |
|---|---|
| **Jerusalem (IDT, UTC+3)** | thứ Ba **`2026-09-01` 09:09:09** ← mốc chốt |
| **UTC** | thứ Ba **`2026-09-01` 06:09:09Z** |
| **Việt Nam (UTC+7)** | thứ Ba `2026-09-01` **13:09:09** |

Lệch múi giờ đo bằng `Intl`/`Asia/Jerusalem`, không chép tay: Israel còn DST tới `25/10/2026`
nên là **+3**, không phải +2.

### 🔴 Vì sao đổi, và đổi được gì

Mốc cũ `00:00` Jerusalem rơi vào **`31/08` 21:00Z** — tức **hơn 4 tiếng** kể từ lúc chốt, trong khi
đường tới hạn (bump `A1Gen` → sinh lại 26 patch → build image → `docker save | ssh | docker load`)
**một mình nó đã có thể ăn 1,5–2 tiếng**, và nó **phải xong TRƯỚC `down -v`**. Mốc mới cho
**13h16m**, tức thêm **9 giờ** — đủ để bước 6 (đưa image lên server) hoàn tất và **được nghiệm thu**
trước điểm không quay lại, thay vì bị bấm vội.

⚠️ **Khác biệt so với mốc cũ, đáng ghi:** mốc `09:09:09` rơi vào **`01/09` ở CẢ BA đồng hồ**. Mốc
`00:00` thì UTC và lịch server (`Etc/UTC`) vẫn ghi **`31/08`** — cái bẫy *"nhìn lịch server rồi
tưởng chưa tới ngày"* nay **không còn**. Mốc mới **rẻ hơn về mặt nhận thức**, không chỉ về thời gian.

### Mốc treo cho ngày G (giờ UTC · giờ VN)

| Xong việc gì | UTC | Việt Nam |
|---|---|---|
| KHỐI 0 — image **đã nằm trên server** và tự khai đúng `commit=` | `01/09 02:09Z` | `01/09 09:09` |
| KHỐI 1 — B-16 · B-19 · O2 · sổ chain · H-6b | `01/09 03:09Z` | `01/09 10:09` |
| 🟥 **`down -v` — điểm không quay lại** | `01/09 03:39Z` | `01/09 10:39` |
| Mạng lên 9/9, đo trên binary | `01/09 04:29Z` | `01/09 11:29` |
| `engrave-verify` xanh **trên chain thật** | `01/09 04:59Z` | `01/09 11:59` |
| Công bố + mở lại cổng đẻ chain | **`01/09 06:09Z`** | **`01/09 13:09`** |

🔴 **Điểm quyết định GO/NO-GO là mốc KHỐI 0.** Tới `02:09Z` mà image chưa nằm trên server **và
chưa tự khai đúng `commit=`** thì **đừng bấm `down -v`** — hoãn giờ G còn rẻ, `down -v` khi chưa có
binary đúng là **mất g0 mà không dựng được g1** (bản fork trên server là snapshot không-git ở
`A1Gen 0`, build ở đó ra binary thế hệ chết đeo nhãn `:g1`, và không có tree hash nào ở đó bắt được).
Cổng đẻ chain **đang ĐÓNG** (D-135), nên hoãn **không tốn thêm gì cho người dùng**.

### Vẫn đúng như D-136

Giờ G là **mốc VẬN HÀNH**, **không** đi vào `genesis.json`: `netgen/main.go` đặt
`StartTime: now-60`, luôn động. Dấu phân biệt bản tập với bản thật của A1 là **có khắc chữ hay
không** cộng `A1_ENGRAVE_CONFIRM`. Đừng đẽo một chỗ trong genesis để cắm mốc này vào — làm thế là
tự thêm một hằng số chép tay.

---

## D-136d — **GIỜ G CHỐT: `2026-09-01 13:09:09` giờ Jerusalem** (David chốt `31/08`, thay D-136c)

David: *"chốt 13:09:09 Jerusalem."*

| Đồng hồ | Giờ G |
|---|---|
| **Jerusalem (IDT, UTC+3)** | thứ Ba **`2026-09-01` 13:09:09** ← mốc chốt |
| **UTC** | thứ Ba **`2026-09-01` 10:09:09Z** |
| **Việt Nam (UTC+7)** | thứ Ba `2026-09-01` **17:09:09** |

### 🔴 Vì sao mốc NÀY — và một câu tôi đã nói SAI phải sửa

Ở lượt trước tôi viết *"giờ G nằm gọn trong ngày 01/09 theo mọi múi giờ trên hành tinh"*. **Sai.**
Đo lại: ở mốc `09:09:09` Jerusalem (`06:09:09Z`), **cả bờ Tây nước Mỹ trở đi vẫn còn `31/08`** —
Los Angeles `31/08 23:09`, Hawaii `31/08 20:09`.

Sự thật tổng quát hơn, và nó không riêng gì ngày này: **múi giờ trải 26 giờ (`+14` … `−12`) mà một
ngày chỉ có 24 giờ ⇒ KHÔNG tồn tại khoảnh khắc nào cả thế giới cùng một ngày.** Cửa sổ 01/09 của
`UTC+14` (`31/08 10:00Z` → `01/09 10:00Z`) và của `UTC−12` (`01/09 12:00Z` → `02/09 12:00Z`)
**rời nhau đúng 2 giờ**. Kiritimati và Baker Island không bao giờ chung ngày.

⇒ Bài toán không phải *"phủ hết"* mà **"đặt dải 24 giờ vào chỗ ít người bị hụt nhất"**. Quét từng
phút suốt 50 giờ mà ngày 01/09 tồn tại, cân theo dân số (51 múi giờ, ~6,18 tỷ):

| Cửa sổ | Phủ | Bỏ lại |
|---|--:|---|
| **`01/09 10:00:00Z` → `10:59:59Z`** ← **đỉnh** | **99,999%** · 47/51 múi | **~55.000 người**: Samoa thuộc Mỹ (45k) · Niue (1,7k) · Kiritimati (8,8k) · Baker (0) |
| `09:00Z` → `10:00Z` | | 1,48 triệu — thêm **Hawaii** |
| `06:09:09Z` (mốc D-136c) | | 🔴 **59,2 triệu** — cả bờ Tây Mỹ, Alaska, Hawaii |

`13:09:09` Jerusalem = `10:09:09Z` nằm **giữa cửa sổ đỉnh**, và vẫn giữ `09:09` trên đồng hồ.
**Bỏ lại ít hơn mốc cũ 1.000 lần.**

⚠️ **Cái giá, nói rõ:** ở mốc này **Kiribati đã sang `02/09`**. Không mốc nào cứu được cả Kiribati
lẫn Hawaii — hai nơi đó **không bao giờ chung một ngày**. Lựa chọn là **bỏ 8.800 người hay bỏ 1,44
triệu**, và mốc này chọn bỏ 8.800.

### Mốc treo cho ngày G

| Xong việc gì | UTC | Việt Nam |
|---|---|---|
| KHỐI 0 — image **trên server**, tự khai đúng `commit=` | `01/09 06:09Z` | `01/09 13:09` |
| KHỐI 1 — B-16 · B-19 · O2 · sổ chain · H-6b | `01/09 07:09Z` | `01/09 14:09` |
| 🟥 **`down -v` — điểm không quay lại** | `01/09 07:39Z` | `01/09 14:39` |
| Mạng lên 9/9, đo trên **binary** | `01/09 08:29Z` | `01/09 15:29` |
| `engrave-verify` xanh trên chain thật | `01/09 08:59Z` | `01/09 15:59` |
| Công bố + mở lại cổng đẻ chain | **`01/09 10:09Z`** | **`01/09 17:09`** |

🔴 **GO/NO-GO ở mốc KHỐI 0.** Image chưa nằm trên server và chưa tự khai đúng `commit=` ⇒ **đừng
bấm `down -v`**. Cổng đẻ chain đang ĐÓNG nên hoãn **không tốn gì cho người dùng**.

### Vẫn đúng như D-136

Giờ G là **mốc VẬN HÀNH**, không đi vào `genesis.json` (`StartTime: now-60`, luôn động).

---

## D-137 — Image `g1` **đã nằm trên server**, và nó được nghiệm thu bằng HAI mỏ neo độc lập (2026-08-31)

Đây là **rủi ro lớn nhất của ngày G** và nó vừa đóng lại, **sớm hơn hạn KHỐI 0 gần 13 giờ**.

### Không phải build lại — image đã có sẵn từ lượt diễn tập `30/08`

`9chain-a1/node:g1` · 586 MB · dựng `2026-08-30 10:04`. Theo **D-128** (*dùng lại image đã diễn
tập, đừng build lại*), bước build **bỏ được** — cắt đôi đường tới hạn.

### 🔴 Nhãn không chứng minh gì — hai phép đo có gốc độc lập

| Mỏ neo | Đo được | Vì sao chưa đủ một mình |
|---|---|---|
| **Binary tự khai** | `commit=9chain-a1-g1-26patch-60a61707` — khớp **chính xác** điều kiện nghiệm thu | `commit=` là **chuỗi người gõ vào `--build-arg`**. Nó nói người build **KHAI** gì, không nói binary **CHỨA** gì |
| **Nội dung nhị phân** | `9chain-a1-g1` **4 lần** · **`9chain-a1-g0` 0 lần** · `9chain-a1-tap-g1` 1 · **`LOVE9` 2** · `love9` 1 | một mình nó không gắn được với bộ patch nào |

**`9chain-a1-g0` = 0** là đối chứng ngược: **không còn một dấu vết nào của thế hệ đã chết** trong
binary. Và **`LOVE9` có mặt** ⇒ patch **0019/0022** nằm trong image — đúng thứ image 18-patch
thiếu, mà thiếu nó thì **mọi ví X/C chết câm** trong khi 9/9 node vẫn xanh.

### Chuyển và đo LẠI ở đầu bên kia

```
docker save 9chain-a1/node:g1 | gzip -6 | ssh … 'gunzip | docker load'
17:13:12Z → 17:13:42Z   —  30 giây
```

🔴 **"Đã load" không phải phép đo.** Chạy lại **cả ba** phép trên **chính máy chủ**: binary ở đó
tự khai **cùng chuỗi `commit=`**, và các con số nhị phân **trùng khít** bản trên máy dev
(`g1`=4 · `g0`=0 · `tap-g1`=1 · `LOVE9`=2 · `love9`=1).

Đó là điều làm cho **binary đã được diễn tập chính là binary sẽ chạy** — không phải một bản build
lại trên một cây nguồn khác. 🔴 Nhắc lại vì sao **cấm build trên server**: cây fork ở đó là
**snapshot không-git ở `A1Gen 0`**, không `.git`, không `patches/` ⇒ build ở đó ra **binary thế hệ
đã chết đeo nhãn `:g1`**, và **không tree hash nào trên máy đó bắt được**.

### Đường lui còn nguyên

`9chain-a1/node:g0` **vẫn còn trên server**, không đụng tới. Đĩa còn **342G/410G**.

⇒ **Việc tay #14 · #15 · #17 của preflight: ĐẠT.** Còn **31 việc tay**, không phải 34.

---

## D-138 — Truy ra `heartbeat-*`: ba phát hiện, một cái đổi lịch **tối nay** (2026-08-31)

David: *"các việc này mai chạy lại chain thì làm luôn"* — hoãn B-16 · B-19 · `heartbeat-*` sang
ngày G. **Đồng ý cho hai cái đầu** (xem cuối mục). Nhưng việc `heartbeat-*` **mất bằng chứng nếu
để tới đó**: preflight nói rõ *"tìm cái gì ghi ra chúng và DỪNG trước khi mạng cũ biến mất; sau đó
dấu vết cũng mất"*. Nên truy **ngay**, chỉ đọc, không đụng gì.

### 1 · Ai ghi — và vì sao ba cổng đều mù với nó

`9chain-a1-heartbeat`, **container Docker** (`node:24-alpine`), chạy từ `2026-08-29 13:01:03Z`
(hơn 2 ngày). Nó ghi `heartbeat.json` **qua bind mount** ⇒ tệp thuộc `root` trên host — đúng
**gotcha #1** (*"thư mục do container sinh thuộc root"*).

🔴 **`compose project` RỖNG** — nó **không thuộc compose nào**, hệt như console (`node` trần,
PPID 1). ⇒ Mọi cổng duyệt `docker compose` **mù với nó**, và `check-deploy-drift` chỉ thấy được
*dấu chân* của nó (`heartbeat.json` + hai `.mjs` mồ côi), không thấy chính nó. **Đây là container
thứ hai trên máy chủ không có ai canh.**

`RestartPolicy: unless-stopped` ⇒ `docker stop` là đủ (gotcha #3). Nhưng có đường **êm hơn**:
`HEARTBEAT_STOP_FILE=/srv/a1-config/heartbeat.stop`. Tạo tệp đó là bơm tự dừng và **tự ghi lý do**:

```bash
touch ~/9chain-a1/src/9chain-a1-config/heartbeat.stop
```

### 2 · 🔴 NÓ TỰ DỪNG LÚC `00:00Z` — SỚM HƠN GIỜ G **10 GIỜ 9 PHÚT**

```
HEARTBEAT_STOP_AFTER = 2026-09-01T00:00:00Z
GIỜ G (D-136d)       = 2026-09-01T10:09:09Z
```

Con số đó được đặt hồi giờ G còn được giả định là *"01/09 00:00 UTC"*. Nay giờ G là **`10:09:09Z`**.
Hệ quả **không phải lỗi kỹ thuật mà là lỗ hổng hình ảnh**: mạng công khai sẽ **im lặng hoàn toàn
hơn 10 tiếng** ngay trước lượt sinh lại — đúng lúc người ngoài có thể đang nhìn explorer. Ai nhìn
vào sẽ thấy một mạng **trông như đã chết**, và họ **không sai** khi đọc thế.

⇒ **Quyết định cần David:** (a) để nguyên, chấp nhận 10 giờ im lặng; (b) dời `HEARTBEAT_STOP_AFTER`
sang `2026-09-01T10:09:09Z` cho khớp giờ G — phải `docker rm -f` rồi `docker run` vì
**`docker restart` KHÔNG nạp lại env** (gotcha #2). Việc này **không** chặn ngày G.

### 3 · 🔴 Container bơm tải đọc được TOÀN BỘ bí mật trên máy chủ

| Đo được | |
|---|---|
| Mount | `/ → /hostfs (ro)` — **toàn bộ hệ tệp host** |
| Container chạy như | **`root`** (`Config.User` rỗng) |
| User-namespace remapping | **OFF** |
| `console.env` | `-rw------- ubuntu:ubuntu` (600) — nhưng **đọc được từ trong container: 800 byte** |

⇒ Một container chỉ để **bơm giao dịch giả** đọc được `A1_CONSOLE_TOKEN`, `A1_CLI_KEY`, `FAUCET_PK`.
Đây **không phải một vụ xâm nhập** — mã trong đó là mã của dự án — nhưng nó là **bán kính thiệt hại**
lớn hơn nhu cầu **rất nhiều**: thứ nó thật sự cần chỉ là dung lượng đĩa (`HEARTBEAT_DISK_PATH=/hostfs`).
Một thư mục là đủ; nó được cho cả ổ.

✅ Điểm sáng: `~/.ssh/` trên máy chủ **chỉ có `authorized_keys`**, không có khoá riêng — đúng kỷ luật
*"ví ký không chạm server"*.

⇒ **Ngày G phải dựng lại container này** (seed mới cho ví g1). Dựng lại là lúc **thu hẹp mount**,
và nó **không tốn thêm một bước nào** vì bước đó đã có trong lịch.

### 4 · Hoãn B-16 / B-19 — đồng ý, và lý do MẠNH HƠN David nêu

Hoãn là **đúng**, không chỉ chấp nhận được, vì nó đổi **bộ khoá nào đáng bảo vệ**:

- **B-19** — `chain-factory-key.txt` giữ **90,007 LOVE9** *trên g0*. Số tiền đó **chết cùng g0** ở
  giờ G, không mang sang được. Giá trị còn lại của việc dời nó là **giữ bản ghi**, không phải giữ tiền.
- **B-16** — bản sao thứ hai của bộ khoá quỹ. Bộ **g0** cũng chết ở giờ G. Bộ đáng làm B-16 là bộ
  **g1**, mà nó **chưa tồn tại** — netgen mới sinh ra ở giờ G. Làm B-16 trên g0 hôm nay là bảo vệ
  thứ ngày mai vô giá trị.

🔴 **Nhưng một điều kiện phải giữ:** **đừng shred gì của g0 cho tới khi g1 được chứng minh là sống.**
Nếu lượt sinh lại hỏng và phải hoãn, g0 là thứ duy nhất còn lại — và lúc đó 90,007 LOVE9 cùng bộ
khoá g0 **lại có giá trị trở lại**. Thứ tự đúng: **g1 xanh trước, dọn g0 sau.**

---

## D-139 — Diễn tập ngày G ở **băng TẬP g1**: 17/17 đạt, và nó nghiệm thu canon MỚI (2026-08-31)

David: *"giờ chạy lại chain để diễn tập."* Chạy trên **máy dev**, băng **TẬP** — networkID
**`899999998`** (`899999999 − A1Gen`), tên `9chain-a1-tap-g1`. Băng tập **không bao giờ bắt tay
được** mạng thật `999999998`, nên đây là an toàn **theo kiến trúc**, không phải theo kỷ luật.

**Vì sao lượt này cần thiết:** canon khắc chữ vừa đổi hôm nay (D-133 — A1 đứng một mình,
`CANON.txt` thay bản đóng băng của C1). Một canon mới **chưa từng đi hết đường tới chain thật** là
một canon chưa được kiểm.

### Lượt 1 — bị TỪ CHỐI, đúng thiết kế

netgen in bảng 4 tài liệu rồi `exit 1`. Vân tay: **`f04e939b…366b18`**.

🔴 **Việc tay #20 làm bằng MÁY, không bằng mắt** (cổng khắc chữ **không** kiểm tài liệu nào là tài
liệu nào — nó khớp hash với *tên tệp*, đúng ô mà một lượt buộc nhầm sẽ đổi):

| Kiểm | Kết quả |
|---|---|
| 4 hash có trong `CANON.txt` | ✅ 4/4 |
| 4 hash **phân biệt** nhau | ✅ 4/4 (hai dòng cùng hash = manifest buộc nhầm) |
| `lang` khớp id · Hebrew chỉ mặt `[p]` | ✅ |
| 4 hash **cũng** có trong `attestation-2026-08-07.txt` — bản đóng băng **có ngày, viết ở nơi khác, TRƯỚC đó** | ✅ 4/4 |

⇒ Vân tay dùng để xác nhận **đã nằm trong git từ trước lượt chạy** (D-133), nên nó **không phải con
số vừa in ra** — đúng điều kiện mà việc tay #20 đòi.

### Lượt 2 — sinh mạng, và cái bẫy `image:`

9 node · self-bond `8.999.991 = 9 × 999.999` · genesis 5.400.000.000 · chainId C `9000000009`.

🔴 **netgen ghi `image: 9chain-a1/node:dev` CẮM CỨNG — 9 dòng.** Sửa hết sang `:g1` **trước khi
`up`**; quên là mạng lên bằng binary cũ trong khi mọi cổng vẫn xanh (D-105).

⚠️ **Đụng subnet:** `172.28.0.0/16` đang do `net_a1net` giữ (faucet dev tự bật lại cùng Docker
Desktop). **Không xoá gì của David** — dời bản diễn tập sang `172.29.` (genesis **không chứa IP**
nên sửa compose là đủ; đã đo trước khi sửa: `genesis.json` 0 lần, compose 27 lần).

### Đo trên mạng thật — không đo repo

| | |
|---|---|
| **BINARY** trong node đang chạy | `commit=9chain-a1-g1-26patch-60a61707` ✅ đúng image đã ship lên server |
| networkID · health | `899999998` · `healthy:true` |
| validator | **9/9** |
| `eth_chainId` | `9000000009` ✅ **không đổi theo thế hệ**, đúng cả ở băng tập |
| `supplyCap` **đọc từ log node** | `7900000001000000000` ✅ |
| `LOVE9` | giải được, `denomination: 9` ✅ |
| **`AVAX`** | 🔴 **ĐỎ kèm lý do**, nêu thẳng networkID — đối chứng ngược, đúng chỗ |

### 🔴 Một giả định của TÔI sai, và sửa nó thì ba số cùng khớp

Đọc `eth_getCode` ra **1274 byte** trong khi `engraving.md` khai **1273**, JSON **không parse
được**, và `sha256` **không khớp** `extraData`. Ba thứ lệch cùng lúc thường nghĩa là **một giả định
sai**, không phải ba lỗi — và đúng thế:

**`byte[0] = 0x00`, opcode STOP.** Mã khắc **cố ý không chạy được**. Bỏ byte đó ra:
**đúng 1273 byte · JSON hợp lệ · `sha256(payload)` = `340ce488…` = ĐÚNG `extraData` trong genesis.**

### `engrave-verify` — **17 đạt · 0 hỏng**, và mục [5] có chạy

Chạy với `--network container:<node>` để chia namespace mạng với node: header `Host` là `127.0.0.1`,
nằm trong danh sách cho phép. **Đi vòng khác là 403** — và cái 403 đó là cổng M11.10 đang canh, không
phải thứ để nới.

Nghiệm thu mạnh nhất trong đó: **`block 0 P-Chain: parentID == sha256(genesisBytes)`** — mỏ neo
khiến chữ khắc P-Chain đọc được từ **node đang chạy**, dù trường `Message` là trường **chỉ ghi**.
Cộng **`bản văn trên MẠNG == bản văn trong TỆP`** và **`extraData trên MẠNG == trong TỆP`**.

⇒ **Đường khắc chữ ngày G đã đi trọn vẹn một lần, trên canon mới.** Còn đúng một chỗ chưa tách được:
netgen vẫn in `"khop ban dong bang cua C1"` (D-133 §hoãn sau ngày G).

### Việc dọn còn nợ

`local-net/net-tap-g1b/keys.txt` + `faucet.env` chứa **khoá thật của bộ diễn tập** (đã `.gitignore`).
🔴 **`shred -u -n 3` ngay trong phiên dọn mạng này** — D-107 đã trả giá một lần cho một bản trùng
byte nằm 20 giờ trong `%TEMP%`.
