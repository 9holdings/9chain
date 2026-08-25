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
