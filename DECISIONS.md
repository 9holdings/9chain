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
cờ `--rpc/--khoa` để chạy lại bài kiểm trên chain đã có — vòng gỡ lỗi từ 5,5 phút
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

📄 **Soát rủi ro đầy đủ: `docs/RUI-RO-THANG-1E7.md`** — 6 rủi ro có vị trí cụ thể
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

`docs/RUI-RO-THANG-1E7.md` liệt kê 6 rủi ro của việc đổi thang. Giữ nguyên `1e9` làm
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
điều kiện GO/NO-GO số 1. Xem `docs/NGAY-G-A1-CON-LAI.md`.

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

Cờ `--bu-ms`, mặc định **0** (tức mặc định là hành vi *sai* đã đo được — cố ý, để ai chạy
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
`--toi-da-block` cắt.

**Lý do — có ca thật, không phải phòng xa.** Bản đầu đếm L1 bằng **số được xin**; chạy với một
`blockchainID` không tồn tại thì tờ đầu khai *"kèm 1 L1"* trong khi bộ xuất không có một byte
nào của nó. **Công cụ chống nói dối suýt nói dối ở đúng chỗ nó không được phép.**
Cùng họ với *"đường lui alias = xanh giả"* và với bài học H-6b (`git bundle verify` in "is
okay" cho một bundle clone ngược chết ngay).
