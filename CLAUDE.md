# CLAUDE.md — luật cứng của repo 9Chain-A1

> Tệp này là **thứ đọc trước tiên**. `HANDOFF.md` là bàn giao (dài, có lịch sử);
> tệp này là **luật**. Mâu thuẫn thì tệp này thắng về LUẬT, `HANDOFF.md` thắng về SỐ ĐO.

---

## 0. 🔴 LUẬT NGÔN NGỮ — **MÃ NGUỒN CHỈ CÓ TIẾNG ANH** (David chốt `2026-08-28`)

> *"Không đặt tên file, tên hàm, thông tin gì ghi vào code bằng tiếng Việt — vì dùng cho
> quốc tế, nhiều cộng đồng toàn cầu vào để phát triển thêm."*

**Đây là luật về NGƯỜI ĐỌC TƯƠNG LAI, không phải về thẩm mỹ.** Một chú thích tiếng Việt giải
thích một cái bẫy đã trả giá để học thì với người đóng góp ở nước khác **không tồn tại** — và
họ sẽ dẫm lại đúng cái bẫy đó. Chú thích trong repo này là **tài sản đắt nhất** của dự án;
để nó ở ngôn ngữ người ta không đọc được là vứt bỏ tài sản đó một cách im lặng.

**Áp cho MỌI thứ nằm trong mã:** tên tệp · tên thư mục · tên hàm · tên biến · khoá JSON ·
cờ CLI · **chú thích** · chuỗi log · thông báo lỗi · tiêu đề commit.

**Ba ngoại lệ, và chỉ ba** — mỗi cái phải khai vào `scripts/check-english-code.mjs`:

| Ngoại lệ | Vì sao |
|---|---|
| `web/lib/i18n/vi.ts` và mọi tệp bản dịch VI | Đó **là** nội dung tiếng Việt cho người dùng Việt. Dịch nó sang tiếng Anh là phá đúng chức năng của nó |
| `docs/**` · `*.md` ở gốc (`CLAUDE.md`, `HANDOFF.md`, `DECISIONS.md`, `BLOCKERS.md`, `PROGRESS.md`) | Sổ làm việc của David. **Không phải mã.** Xem lưu ý dưới |
| `docs/evidence/**` · `patches/**` | **Đóng băng theo byte** / là bản ghi lịch sử. Sửa chúng là làm hỏng vật chứng hoặc viết lại lịch sử |

⚠️ **Nợ đã biết, và nó lớn:** đo `2026-08-28` sau lượt trả đầu tiên — **107 tệp · 5.856 dòng**
trong repo chính, cộng **54 tệp Go** trong cây fork, vẫn là tiếng Việt. Luật này **không** được
thi hành bằng một lượt dịch ồ ạt sát ngày G. Nó thi hành bằng **bánh cóc**:
`scripts/check-english-code.mjs` giữ một mốc nợ (`scripts/english-debt.json`) **chỉ được PHÉP
CO LẠI** — mã mới phải sạch ngay, mã cũ trả dần. Cổng đỏ khi nợ **phình ra**, và
`--update-baseline` **từ chối ghi** một con số lớn hơn.

Đã trả trong lượt đầu (`28/08`): `gday-preflight.mjs` · `check-net-dirs.mjs` ·
`check-single-source.mjs` · `check-evidence.mjs` · `lib/server.mjs` · `network-id.sh` ·
`deploy/server-env.sh` — **toàn bộ mã phiên đó tạo ra**, cộng cổng thi hành chính nó.

🔴 **Hệ quả tức thì:** mọi tệp anh **tạo mới hoặc viết lại** từ nay phải là tiếng Anh 100%,
kể cả chú thích. Đừng thêm một dòng tiếng Việt nào vào mã nữa.

## 1. Bốn luật cứng — đã trả giá để học

1. **Không tin mã HTTP.** Thang đo từ yếu tới mạnh: mã HTTP → `content-type` → **nội dung** →
   header tầng trước (`cf-cache-status`). *Một cổng chỉ biết xanh không chứng minh gì.*
2. **Mọi cổng mới phải được nhìn thấy lúc nó ĐỎ.** Chưa có đối chứng ngược = mới kiểm một
   nửa: nửa *"có chặn không"*, chưa kiểm nửa *"chặn xong nó nói gì"*.
3. **Đụng `patches/` là đụng đường tái lập fork.** Sinh `--no-signature`, **sinh lại CẢ BỘ**,
   nghiệm thu bằng `git am --keep-cr` + so tree. Tree hiện tại **`38723877`** / **27 patch** /
   gốc `1cf1fc3` — ba phép đo độc lập khớp `01/09`: `ls patches/*.patch` = 27 · `TREE_FORK`
   trong `gday-preflight.mjs` · **binary đang chạy tự khai** `gitCommit`
   `9chain-a1-g1-27patch-38723877`. Đối chứng rẻ mà mạnh: áp **26/27** phải ra đúng
   **`60a61707`** — tree mà fork đứng trước lượt thêm patch 0027, tức mốc **không do lượt bump
   này đẻ ra**. *(Mốc cũ `f2b9486b` là đối chứng của thời 26 patch. <!-- stale-ok -->)*
   🔴 **`A1Gen` NẰM TRONG bộ patch (0018) ⇒ bump thế hệ LÀ sửa `patches/`** (đo `30/08`). Bump
   ở cây làm việc mà quên sinh lại bộ patch thì image ngày G đúng, còn **bộ patch công bố vẫn
   khai `A1Gen 0`**: người ngoài áp đủ bộ patch, build ra binary của **thế hệ đã chết**, không
   join được — trong khi cổng fork-tree **xanh suốt** (nó chỉ so `patches/` với hằng số chép
   trong chính nó), và điều kiện qua số 4 của `01/09` cũng xanh.
4. **Chỉ MỘT phiên được deploy.** Worktree web ở `C:\PROJECTS\9Chain-A1-web` (nhánh `web-home`)
   — **Caddyfile đang chạy đến từ nhánh đó**, không phải `main`.

## 2. Lớp lỗi đắt nhất của dự án — **đo sai đại lượng**

Mọi cổng xanh vì tất cả cùng đo sai một thứ. Đã cháy thật nhiều lần:

| Cổng xanh | Sự thật |
|---|---|
| `kiem-khoa` 6/6 ✓ exit 0 | bộ khoá của **thế hệ đã chết**, 0 đồng trên chain |
| `cb58.mjs --self-test` 8/8 | neo vào một blockchainID **chết từ 26/08** |
| `BLOCKERS.md` ghi B-14 "ĐÃ ĐÓNG" | console công khai vẫn cấp chainId cũ **suốt 2 ngày** |
| `curl -w '%{http_code}'` = 200 | Cloudflare trả robots.txt **của chính nó** |
| netgen xanh + `go test` xanh | node vẫn chạy `supplyCap` 720 triệu |

⇒ **Ba câu hỏi bắt buộc trước khi tin một ✓:**
- Cổng này đo **đại lượng nào**, và đó có phải đại lượng ta quan tâm không?
- Nó đo **ở đâu** — repo, image, hay **node đang chạy**? (Ba nơi khác nhau.)
- Nó đã bao giờ **ĐỎ** chưa?

🔴 **"ĐÃ ĐÓNG" trong repo ≠ đã đóng ở nơi người dùng chạm vào.** Mục nào chạm đường sản phẩm
thì phải kèm một phép đo **trên sản phẩm**: `node scripts/check-deploy-drift.mjs`.

🔴 **Dấu miễn trừ (`stale-ok`, "số cũ giữ để đối chiếu") chỉ hợp lệ cho câu KỂ VỀ QUÁ KHỨ,
không bao giờ cho NỘI DUNG SẼ LÊN CHAIN.** Trước khi đánh dấu miễn trừ, hỏi: *dòng này kể về
quá khứ hay sẽ được xuất bản?*

## 3. Danh sách cổng — chạy trước khi tin bất cứ điều gì

```bash
node scripts/gday-preflight.mjs              # 32 cổng + 40 VIỆC TAY, một lệnh (~4 phút)
node scripts/check-net-dirs.mjs              # thư mục net* nào thuộc thế hệ nào · thư mục nào giữ TIỀN
node scripts/check-evidence.mjs              # gói vật chứng còn tự nghiệm thu được không
node scripts/check-single-source.mjs         # một hằng số, MỘT nơi khai
node scripts/check-english-code.mjs          # mã nguồn chỉ có tiếng Anh (bánh cóc, §0)
node scripts/make-l1-genesis.mjs --self-test  # khuôn L1 KHÔNG được dùng nguyên xi (D-114)
node scripts/check-deploy-drift.mjs          # repo ↔ server (chạy TRƯỚC mọi mục "đã đóng")
node scripts/check-doc-drift.mjs             # 🔴 TÀI LIỆU có khai số của thế hệ ĐÃ CHẾT không (D-150)
                                             #    ĐO mạng sống rồi mới chấm; bản ghi/đóng băng KHÔNG quét
node scripts/check-remotes.mjs               # 🔴 nơi ĐẨY còn làm được việc của nó không (D-151)
                                             #    sao lưu còn ghi được · và chỗ RIÊNG TƯ còn riêng tư
node scripts/check-consistency.mjs --self-test # số học tokenomics, đọc THẲNG từ Go
node scripts/gen-chainid-issued.mjs --check  # sổ chainId/tên xuyên thế hệ
node local-net/console/chainid-test.mjs      # phép cấp chainId
node local-net/lib/cb58.mjs --self-test
node scripts/check-chainid.mjs               # tra sổ công khai chainid.network
node scripts/check-keys-on-chain.mjs <thư-mục>/allocation.md   # khoá ↔ TIỀN THẬT
node scripts/check-key-leaks.mjs             # khoá quỹ nằm NGOÀI nơi được phép (D-117)
node scripts/check-history-secrets.mjs --all-objects  # 🔴 LỊCH SỬ git có vật liệu khoá không (D-145)
                                             #    CHẠY TRƯỚC KHI BẬT REPO CÔNG KHAI — xoá tệp
                                             #    không xoá object; đã clone là mất
node scripts/wallet-over-tunnel.mjs --check           # ví ký không chạm server (M11.10)
bash scripts/h6b-backup.sh --check           # bản sao lưu có dựng lại được mạng không
node scripts/check-robots.mjs                 # robots.txt của A1 có tới người đọc không
```

⚠️ `gday-preflight.mjs` gọi **32 cổng** (thêm `28/08`: `check-net-dirs`, `check-evidence`
×2, `check-single-source`, `check-english-code`; thêm `01/09`: `check-history-secrets` ×2 —
D-145 — `ceremony-9s-union --self-test` — D-146 — `check-doc-drift` ×2 — D-150 — và
`check-remotes` ×2 — D-151); ba cổng cuối
trong danh sách trên đứng ngoài nó (hai cái là VIỆC TAY của nó,
`check-robots` là mặt web — không đủ tư cách chặn genesis).
⚠️ **Số đo `01/09` 13:03Z: `27 đạt · 2 đỏ · 1 không chạy được`** — 30 mục gọi ra. Hai đỏ đã biết,
**cả hai là việc của David, không phải lỗi mã**: ví `chain-factory` **0 đồng** (`P-love91999h…9999`,
địa chỉ g1) · console trên server **chưa deploy bản g1** (`check-deploy-drift`: 4 lệch + 1 thiếu).
🔴 **Cả hai đỏ này CHẶN việc mở lại cổng đẻ chain L1** — thứ tự bắt buộc: đẩy sổ chainId lên
server → nạp ví factory (X→P, D-140) → mới bật `A1_DE_CHAIN_MO=1`.

🔴 **Cổng "áp đủ bộ rồi so hằng số của chính mình" chưa phải cổng** (D-112). Nó chỉ chứng minh
bộ patch **tự nhất quán với con số ta vừa chép vào tệp đó** — ai sinh lại cả bộ rồi dán tree
mới vào cũng làm nó xanh. Preflight nay áp **26/27 TRƯỚC** và neo vào `60a61707` — tree mà fork
đứng từ `30/08` tới `01/09`, **và** tree mà image `g1` đang chạy được dựng lên trên: hai đầu neo
có gốc độc lập mới nói được điều gì đó.
*(Hai mốc cũ `f2b9486b` (thời 26 patch) và `074aaa93` (tree image `g0`) đã nghỉ; chúng còn trong
`DECISIONS.md`, không còn ở đây, vì cổng chặn ngày G phải neo vào thế hệ nó đang chặn.)* <!-- stale-ok -->
🔴 **Đây là đúng lớp lỗi §2:** đoạn này còn khai `25/26 → f2b9486b` **sau** lượt bump lên 27 patch
— luật thì đã đổi ở §1, mà lời giải thích của luật thì chưa. Đo `01/09`, sửa cùng lượt D-150.

🔴 **Vế thứ BA của luật cứng #2 (D-106b, `28/08`): thấy cổng ĐỎ chưa đủ — phải kiểm nó đỏ VÌ
ĐÚNG LÝ DO.** `check-robots` bản đầu đỏ ngay lần đầu và cái đỏ đó bị đọc thành *"cổng nhạy"*,
trong khi nó chấm bằng **dòng đầu** `robots.txt` mà tưởng đang chấm bằng **nội dung**.
Cloudflare **chèn thêm**, không **thay** ⇒ B-10 chưa bao giờ là một lỗ. Bài học kèm: **đọc HẾT
tệp trước khi dựng cổng cho nó** — chính `web/public/robots.txt` đã viết sẵn phép đo đúng.

## 4. Ranh giới — thứ KHÔNG được tự làm

| Không được | Vì sao |
|---|---|
| `git add -A` | phiên khác đang làm việc trong repo — **đã nuốt nhầm một lần**. Commit bằng đường dẫn tường minh |
| `git push` | 🔴 **BA remote, và chỉ MỘT trong ba là nơi công bố — đọc tên trước khi đẩy** (đo `01/09` chiều): `official` = **`9holdings/9chain`, CÔNG KHAI** ⇒ đẩy vào đây là **đưa byte ra Internet, không thu lại được**, luôn **hỏi David** · `origin` = `daviddokrao/9chain-a1-backup`, **RIÊNG TƯ**, tuyến sao lưu, kiểm `visibility` **TRƯỚC** mỗi lượt đẩy chứ không phải sau · `archived-31aug` = `daviddokrao/9chain-a1`, **CHỈ ĐỌC** (archive `01/09 12:19Z`, đóng băng ở `556a470`) — giữ lại làm bản ghi, **đẩy vào là 403**. ⚠️ Tuyến sao lưu **đã đứt một lần mà không ai biết**: repo cũ bị archive và mọi thứ vẫn xanh cho tới lượt đẩy thật (D-151). Đẩy nhánh mới, `push --all`, hay đẩy khi chưa chạy `check-history-secrets --all-objects`: **hỏi David**. `web-home`/`audit`/`gday-heartbeat-gate` thuộc worktree khác — đẩy nhầm là **công bố** việc của phiên khác |
| Deploy / restart / ghi lên server công khai | chỉ một phiên được deploy, và deploy là việc **có người bấm** |
| Gửi giao dịch · đẻ/thu hồi chain · faucet | tiêu tiền thật trên mạng công khai; đẻ chain nay còn **mặc định ĐÓNG** (`A1_DE_CHAIN_MO`) |
| Đụng `web/` · Caddyfile · merge `web-home` | thuộc worktree khác đang sống |
| Sửa tay `local-net/net*/genesis.json` | C-Chain genesis nằm trong đó dưới dạng **chuỗi JSON đã escape**; hỏng escape **không ai thấy cho tới lúc node boot** |
| Đổi một giá trị trong `patches/` mà không sinh lại cả bộ | xem luật cứng 3 |
| **Quét-và-thay "trên mọi tệp văn bản"** | `patches/` và `docs/evidence/**` phải **loại trừ TƯỜNG MINH**. Đã cháy **hai lần trong một phiên** (`28/08`): một lần patch 0006 (cổng bắt được), một lần gói vật chứng (**không cổng nào bắt**, 9/9 → 7/9 im lặng) |
| Sinh lại `MANIFEST.txt` / `SHA256SUMS.txt` cho một gói vật chứng | làm thế là **xoá đúng thứ tạo ra giá trị** của gói. Gói lệch hash thì **khôi phục byte gốc**, không sinh lại manifest |
| Xoá một thư mục `local-net/net*` | 🔴 chạy `check-net-dirs.mjs` trước: **khoá đang giữ tiền nằm trong thư mục tự khai là đồ chết** (B-19) |
| **Chép khoá quỹ ra thư mục tạm để dựng ca đối chứng** | Đã cháy: bản **trùng byte** của bộ g0 nằm trong `%TEMP%\claude\…\scratchpad\` **20 giờ**, ngoài tầm cả ba cổng. Và bản *"làm hỏng"* cố ý **vẫn chứa đủ khoá riêng thật**. Dọn bằng `shred -u -n 3` **ngay trong phiên tạo ra nó**; canh bằng `check-key-leaks.mjs` (D-117) |

## 5. Bẫy phải biết trước (bản rút gọn — bản đầy đủ ở `HANDOFF.md` §GOTCHAS)

1. **`net/` do container netgen sinh ⇒ thuộc `root`** — `sed` sửa compose **thất bại lặng lẽ**.
2. **`docker restart` KHÔNG nạp lại env** — đổi khoá phải `docker rm -f` rồi `docker run`.
3. **`docker stop` và `docker kill` đều không kích hoạt `restart: unless-stopped`.**
4. **`SUBNET_PREFIX` của netgen phải kết thúc bằng `.0`.**
5. **`NETWORK_ID` của netgen NAY BẮT BUỘC** — mặc định cũ `9001` là thế hệ đã chết.
6. **`A1Name` đổi đường dẫn DB** ⇒ binary mới chỉ lên cùng một lượt `down -v`.
7. **Heredoc bash + Python nuốt dấu gạch chéo** — sửa mã Go có `\n` thì dùng công cụ sửa tệp.
8. **`A1_CONSOLE_TOKEN` đổi `28/08`** — đọc từ `C:\Users\abc\9chain-a1-keys\console-token.txt`,
   đừng dùng giá trị nhớ trong đầu.
9b. 🔴 **TÊN MIỀN SỐNG LÀ `a1.9chain.org`.** `testnet-a1.9chain.org` là tên **CŨ**: origin <!-- stale-ok: mục này TỒN TẠI để nói về cái tên đã nghỉ -->
   `308` sang tên mới, nhưng **Cloudflare trả `525` cho nó** ⇒ đo bằng tên cũ ra "trang chết"
   trong khi trang vẫn sống. Đã dính `28/08` và suýt khai một sự cố không có thật.
   Cách phân biệt trong 10 giây: `rpc-a1.9chain.org` **vẫn đúng** và vẫn phục vụ 200 — hai
   tên miền hỏng/sống khác nhau thì lỗi không nằm ở server. `/console/` **308 sang
   `/create-chain/`**; theo redirect (`curl -sL`) mới thấy trang thật.
   ⚠️ Tài liệu cũ và sổ lưu trữ còn dẫn tên cũ — **đừng đổi hàng loạt**: phần lớn là câu KỂ
   VỀ QUÁ KHỨ, và đổi chúng là viết lại lịch sử để cho gọn mắt.
10. **`local-net/net-public/` là thư mục TRỘN** — `keys.txt` là bộ **9001 đã chết**, còn
   `chain-factory-key.txt` cùng thư mục là khoá **g0 đang giữ tiền**. Hỏi **từng tệp**.
11. 🔴 **MỒI NHỬ: `local-net/net-that-g0/` khai ĐÚNG networkID của mạng đang chạy nhưng cả 6
   ví đều 0đ** — nó là bộ khoá của **một lượt sinh mạng KHÁC** (`allocation.md` của nó tự khai
   *"1 node"*, mạng thật là **9**). Nguy hiểm hơn bộ `9001`: ở kia `networkID` lệch nên
   `check-keys` còn cảnh báo được, ở đây **networkID KHỚP** ⇒ `check-keys` chấm **6/6 ✓** và
   **không cổng nào kêu**. Đúng thứ dễ bị cất nhầm thành *"bản sao lưu khoá quỹ"* của O1/B-16.
   Bộ quỹ THẬT: `C:\Users\abc\9chain-a1-keys\g0\`. Đo bằng `check-net-dirs.mjs`. (D-110)
12. 🔴 **Đổi tên định danh: đường VÀO và đường ĐỌC là hai chuyện.** id preset (`chuan`→`standard`…)
   **là dữ liệu đã lưu** trong sổ danh bạ. API **từ chối** id cũ (không bí danh), nhưng bảng
   hiển thị ở `/chains/` **giữ id cũ** để bản ghi lịch sử còn đọc được. Trước khi đổi một
   "hằng số", hỏi: *nó có nằm trong dữ liệu đã ghi ra đĩa/lên chain không?* (D-108)

## 6. Bộ định danh — `A1Gen` là nguồn sự thật, và nó bị CHÉP TAY ở hai ngôn ngữ

| Nơi | Tệp | Ai đọc |
|---|---|---|
| Go | `upstream/avalanchego/utils/constants/network_ids.go` → `A1Gen` | binary, netgen |
| JS | `local-net/lib/chainid.mjs` → `A1_GEN` | console (cấp chainId cho L1 người dùng) |

🔴 **Từ `2026-09-01` cả hai = `1`** — mạng đang chạy là `g1`, networkID **`999999998`**, tên `9chain-a1-g1`. *(Trước ngày G cả hai = 0, networkID `999999999` — thế hệ đó đã chết.)* <!-- stale-ok: câu trong ngoặc kể về quá khứ và tự khai thế -->
🔴 **Bump một bên mà quên bên kia thì không có gì báo lỗi** — console sẽ cấp chainId từ khối
của thế hệ khác, và số đó đi vào ví người dùng qua một genesis **bất biến**.
⇒ Đổi thế hệ là đổi **cả hai**, rồi chạy `check-consistency.mjs`.

## 7. Định nghĩa "XONG"

Một mục chỉ được đánh `[x]` khi **cả bốn** đều đúng:
1. Chạy thật **đường sản phẩm**, không chỉ test unit.
2. Có ít nhất một **ca đối chứng ngược đã thấy ĐỎ**.
3. Phép đo thực hiện **đúng nơi** (node đang chạy / server / repo — nói rõ nơi nào).
4. Đã ghi vào `DECISIONS.md` (vì sao) và `PROGRESS.md` (trạng thái).

Không đạt sau ~5 lần sửa ⇒ `[blocked]` + ghi `BLOCKERS.md` ⇒ **đi làm việc khác, không dừng chờ**.
Cần người thật/thiết bị/tiền/thẩm quyền ⇒ `[human]`, coi phần mềm là xong, đi tiếp.
