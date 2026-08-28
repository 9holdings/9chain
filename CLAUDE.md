# CLAUDE.md — luật cứng của repo 9Chain-A1

> Tệp này là **thứ đọc trước tiên**. `HANDOFF.md` là bàn giao (dài, có lịch sử);
> tệp này là **luật**. Mâu thuẫn thì tệp này thắng về LUẬT, `HANDOFF.md` thắng về SỐ ĐO.

---

## 1. Bốn luật cứng — đã trả giá để học

1. **Không tin mã HTTP.** Thang đo từ yếu tới mạnh: mã HTTP → `content-type` → **nội dung** →
   header tầng trước (`cf-cache-status`). *Một cổng chỉ biết xanh không chứng minh gì.*
2. **Mọi cổng mới phải được nhìn thấy lúc nó ĐỎ.** Chưa có đối chứng ngược = mới kiểm một
   nửa: nửa *"có chặn không"*, chưa kiểm nửa *"chặn xong nó nói gì"*.
3. **Đụng `patches/` là đụng đường tái lập fork.** Sinh `--no-signature`, **sinh lại CẢ BỘ**,
   nghiệm thu bằng `git am --keep-cr` + so tree. Tree hiện tại **`074aaa93`** / **24 patch** /
   gốc `1cf1fc3`. Đối chứng rẻ mà mạnh: áp **23/24** phải ra đúng tree cũ `2954b987`.
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
node scripts/check-deploy-drift.mjs          # repo ↔ server (chạy TRƯỚC mọi mục "đã đóng")
node scripts/check-consistency.mjs --tu-kiem # số học tokenomics, đọc THẲNG từ Go
node scripts/sinh-chainid-da-cap.mjs --kiem  # sổ chainId/tên xuyên thế hệ
node local-net/console/chainid-test.mjs      # phép cấp chainId
node local-net/lib/cb58.mjs --self-test
node scripts/check-chainid.mjs               # tra sổ công khai chainid.network
node scripts/kiem-khoa-tren-chain.mjs <thư-mục>/allocation.md   # khoá ↔ TIỀN THẬT
node scripts/vi-qua-ham.mjs --kiem           # ví ký không chạm server (M11.10)
bash scripts/h6b-sao-luu.sh --kiem           # bản sao lưu có dựng lại được mạng không
node scripts/kiem-robots.mjs                 # robots.txt của A1 có tới người đọc không
```

⚠️ `ngay-g-preflight.mjs` gọi **12** cổng đầu; ba cổng cuối đứng ngoài (hai cái là VIỆC TAY
của nó, `kiem-robots` là mặt web — không đủ tư cách chặn genesis).

🔴 **Vế thứ BA của luật cứng #2 (D-106b, `28/08`): thấy cổng ĐỎ chưa đủ — phải kiểm nó đỏ VÌ
ĐÚNG LÝ DO.** `kiem-robots` bản đầu đỏ ngay lần đầu và cái đỏ đó bị đọc thành *"cổng nhạy"*,
trong khi nó chấm bằng **dòng đầu** `robots.txt` mà tưởng đang chấm bằng **nội dung**.
Cloudflare **chèn thêm**, không **thay** ⇒ B-10 chưa bao giờ là một lỗ. Bài học kèm: **đọc HẾT
tệp trước khi dựng cổng cho nó** — chính `web/public/robots.txt` đã viết sẵn phép đo đúng.

## 4. Ranh giới — thứ KHÔNG được tự làm

| Không được | Vì sao |
|---|---|
| `git add -A` | phiên khác đang làm việc trong repo — **đã nuốt nhầm một lần**. Commit bằng đường dẫn tường minh |
| `git push` | repo **không có remote** (H-6). Chống mất việc là nhiệm vụ của `commit` + `h6b-sao-luu.sh` |
| Deploy / restart / ghi lên server công khai | chỉ một phiên được deploy, và deploy là việc **có người bấm** |
| Gửi giao dịch · đẻ/thu hồi chain · faucet | tiêu tiền thật trên mạng công khai; đẻ chain nay còn **mặc định ĐÓNG** (`A1_DE_CHAIN_MO`) |
| Đụng `web/` · Caddyfile · merge `web-home` | thuộc worktree khác đang sống |
| Sửa tay `local-net/net*/genesis.json` | C-Chain genesis nằm trong đó dưới dạng **chuỗi JSON đã escape**; hỏng escape **không ai thấy cho tới lúc node boot** |
| Đổi một giá trị trong `patches/` mà không sinh lại cả bộ | xem luật cứng 3 |

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
9b. 🔴 **TÊN MIỀN SỐNG LÀ `a1.9chain.org`.** `testnet-a1.9chain.org` là tên **CŨ**: origin
   `308` sang tên mới, nhưng **Cloudflare trả `525` cho nó** ⇒ đo bằng tên cũ ra "trang chết"
   trong khi trang vẫn sống. Đã dính `28/08` và suýt khai một sự cố không có thật.
   Cách phân biệt trong 10 giây: `rpc-a1.9chain.org` **vẫn đúng** và vẫn phục vụ 200 — hai
   tên miền hỏng/sống khác nhau thì lỗi không nằm ở server. `/console/` **308 sang
   `/create-chain/`**; theo redirect (`curl -sL`) mới thấy trang thật.
   ⚠️ Tài liệu cũ và sổ lưu trữ còn dẫn tên cũ — **đừng đổi hàng loạt**: phần lớn là câu KỂ
   VỀ QUÁ KHỨ, và đổi chúng là viết lại lịch sử để cho gọn mắt.
10. **`local-net/net-public/` là thư mục TRỘN** — `keys.txt` là bộ **9001 đã chết**, còn
   `chain-factory-key.txt` cùng thư mục là khoá **g0 đang giữ tiền**. Hỏi **từng tệp**.

## 6. Bộ định danh — `A1Gen` là nguồn sự thật, và nó bị CHÉP TAY ở hai ngôn ngữ

| Nơi | Tệp | Ai đọc |
|---|---|---|
| Go | `upstream/avalanchego/utils/constants/network_ids.go` → `A1Gen` | binary, netgen |
| JS | `local-net/lib/chainid.mjs` → `A1_GEN` | console (cấp chainId cho L1 người dùng) |

Hôm nay cả hai = **0** (mạng `g0`, networkID `999999999`). Ngày G lên **1**.
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
