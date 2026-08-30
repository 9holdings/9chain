# PROGRESS — 9Chain-A1 (phần CHAIN)

Backlog autopilot. Explorer là dự án khác (`C:\PROJECTS\9Scan-A1`) — **không làm ở đây**.
Nhật ký chi tiết lịch sử: `docs/PROGRESS.md`. Bàn giao: `HANDOFF.md`.

Trạng thái: `[ ]` chưa làm · `[x]` xong **và đã verify end-to-end thật** · `[~]` làm một
phần, phần còn lại ghi rõ ngay trong mục · `[blocked]` kẹt · `[human]` cần David.

---

## 🔵 PHIÊN QUÉT LẠI (2026-08-28, khuya) — 3 mốc, đều sinh từ một bản quét toàn diện

Không phải đợt autopilot. David yêu cầu **quét lại + phân tích chuyên sâu** trước GO/NO-GO,
rồi giao ba việc bật ra từ bản quét đó.

- [x] **Q-1 — 🔴 DIỄN TẬP `docker build` CÂY 24 PATCH** (D-105)
      Bản quét đo được: image node mới nhất (`:g0`) tạo `27/08 18:56` ⇒ **chưa image nào từng
      dựng từ cây 24 patch**, mà lượt đầu tiên bị xếp vào **đúng ngày G, sau `down -v`** — và
      bộ đó mang patch 0019/0022 (`LOVE9`), thiếu là **mọi ví X/C chết câm**.
      **Điều kiện qua:** build xong · boot thật · và **đo trên node đang chạy**, không đọc mã.
      ✅ **ĐẠT.** Tag riêng `:g1-dryrun` (không đè `g0`), băng TẬP `899999999`, cổng 9760,
      không server/không giao dịch/không `patches/`. Đo: `supplyCap 7900000001000000000` (log
      **trong** container) · `9chain-a1-tap-g0` · `eth_chainId 0x218711a09` = **9000000009** ·
      **`avm.getAssetDescription("LOVE9")` ⇒ `LOVE9 Coin` denom 9** · 🔴 **đối chứng ngược
      `("AVAX")` ⇒ ĐỎ và NÓI RA LÝ DO**. Cổng C-4 nổ đúng (tập + chainId thật ⇒ cảnh báo lớn);
      patch 0020 sinh `.env` với `A1_API_BIND=127.0.0.1`.
      🔴 **Bắt hai lỗi công cụ, cả hai im lặng:** (1) `gen-network.sh` **không chuyển tiếp
      `NETWORK_ID`** ⇒ đường sinh mạng trong tài liệu **chết ở mọi lượt gọi** từ patch 0020 —
      cùng lớp D-095, **đã vá** (mảng `A1_NETGEN_ENV`, 17 biến; trước vá `exit 1`, sau vá
      `exit 0`); (2) netgen ghi **`image: 9chain-a1/node:dev` cắm cứng**, không biến nào đổi
      được ⇒ quên sửa là mạng lên bằng binary 18 patch **trong khi mọi cổng vẫn xanh** —
      **chưa vá** (đụng netgen = đụng `patches/`), thành **việc tay** ở preflight.
      ⚠️ Dựng ở `A1Gen 0` ⇒ **không thay được lượt build ngày G**.
      ⚠️ `local-net/net-dryrun/` (khoá mạng tập, vứt đi) còn trên máy dev — **xoá tay**.
- [x] **Q-2 — C1 ra khỏi tầm ngắm của A1** (D-104)
      David chốt: *"hai chain này song song, C1 tôi điều phối riêng."* Trước đó 4 tệp sống của
      A1 khai C1 là **đường găng lớn nhất**.
      ✅ **ĐẠT** — đổi ở `HANDOFF.md`, `PROGRESS.md`, `gday-preflight.mjs`. Chữ khắc nay là
      **đầu vào David cấp**, không phải phụ thuộc. 🔴 Vế A1 **không** bỏ theo: byte tới **sau**
      bước sinh genesis là không khắc được nữa ⇒ preflight nay hỏi byte **trước** khi chạy netgen.
      ⚠️ Không sửa các câu **kể về quá khứ** có nhắc C1 (M10.6, D-041, H-5).
- [x] **Q-3 — B-10: cổng chấm bằng NỘI DUNG, và nó ĐÍNH CHÍNH chính B-10** (D-106 → **D-106b**)
      `scripts/check-robots.mjs`. B-10 mở từ `27/08` nhưng chỉ tồn tại như **một dòng chữ**.
      **Điều kiện qua:** chấm bằng nội dung (không bằng mã HTTP) · **đối chứng dương**
      `/sitemap.xml` · ba mã thoát phân biệt *đạt/sai/không biết*.
      🔴 **Bản đầu của tôi ĐỎ, và ĐỎ SAI.** Nó chấm bằng dấu vân tay Cloudflare ở **dòng đầu**
      — tức đo **VỊ TRÍ** trong khi tưởng mình đo **NỘI DUNG**, đúng lỗi lượt `27/08` đã mắc.
      Đọc đủ 5.367 byte thì Cloudflare **CHÈN THÊM VÀO ĐẦU**, không **THAY**: tệp A1 còn nguyên
      bên dưới (`Allow: /` · 7 dòng `Disallow:` · `Sitemap:` grep ra 3 lần).
      ⇒ **B-10 chưa bao giờ là một lỗ; robots.txt của A1 vẫn luôn tới được người đọc.**
      🔴 Cay nhất: `web/public/robots.txt` **đã viết sẵn luật đúng trong chú thích của chính nó**
      (*"đo NỘI DUNG mà không phụ thuộc VỊ TRÍ … đỏ giả cũng phá đúng thứ đó, chỉ chậm hơn"*).
      ✅ **ĐẠT sau khi sửa** — phép chấm nay là **một** chuỗi chỉ có thể tới từ tệp A1;
      `--self-test` **7/7**, gồm ca *route biến mất khỏi Caddyfile* ⇒ `2`, ca *chỉ có khối
      Cloudflare* ⇒ `1`, ca *Sitemap trỏ tên miền CŨ* ⇒ `2`, **và ca tái hiện đúng lỗi bản đầu
      ⇒ phải XANH**. Chạy thật ⇒ **exit 0**.
      ⚠️ **Luật cứng #2 cần vế thứ ba:** thấy cổng ĐỎ chưa đủ — phải kiểm nó **đỏ VÌ ĐÚNG LÝ DO**.
      🟡 Còn lại là **quyết định chính sách của David**, không phải lỗi: khối Cloudflare cấm hẳn
      **9 bot AI** và khai điều khoản **nhân danh A1**.
      🔴 **Kèm:** `gday-preflight.mjs` khai cờ `batBuoc` trong chú thích mà **chưa từng cài**.
      Đã **bỏ lời hứa** thay vì cài — cổng *"đỏ nhưng không sao"* sẽ bị bỏ qua đúng lúc nó kêu
      thật (lý lẽ D-070). Mọi cổng trong preflight nay **đều bắt buộc**.

- [x] **Q-4 — B-17 ĐÓNG: xoá 6 tệp `.bak` trên server** (D-107 · D-107b)
      David duyệt trong phiên. Ba bước **liệt kê → xoá → đối chứng**, không phải một dòng.
      ✅ **ĐẠT** — `ls *.bak*` ⇒ **0** · sổ đang chạy `console-chains.json` còn nguyên 27 byte ·
      `server.mjs`/`index.html` còn sống · drift mồ côi **7 → 1** · `watch-network` 9/9, console 200.
      🔴 **Lệnh soạn sẵn của D-098 sẽ xoá mất NỘI DUNG DUY NHẤT — hai lần:**
      (1) sổ `console-chains.json.bak-1787728833` (20.489 B) không có bản lưu nào trong repo,
      dù D-098 khẳng định *"ba sổ đã có bản lưu trữ chính thức"*;
      (2) `server.mjs.bak-truoc-admin` + `index.html.bak-truoc-admin` **không trùng bất kỳ phiên
      bản git nào** trên cả 4 nhánh — thứ mà cả D-098 lẫn D-107 đều chưa kiểm, vì cả hai chỉ
      nghĩ tới ba sổ danh bạ.
      ✅ Cả ba đã lưu trữ + **đối chiếu `sha256` hai đầu TRƯỚC khi xoá**, và quét bí mật (0 kết
      quả) trước khi cho vào git.
      ⚠️ **Luật:** *"đã có bản lưu rồi nên xoá được"* là một **PHÉP ĐO**, không phải câu trấn an
      — và **phạm vi của một lời trấn an hẹp hơn phạm vi của lệnh nó đi kèm**.
      ✅ Gỡ 4 mục hết đúng khỏi `manifest-deploy.json`, thêm `_thuaDaXoa`: chúng quay lại thì
      cổng phải **ĐỎ**, không im lặng bỏ qua.
- [blocked] **Q-5 — B-16 bản sao thứ hai: CHẶN Ở PHẦN CỨNG**
      Đo `28/08`: máy dev chỉ có **một ổ đĩa** (`C:`, 1.862 GB) — không USB, không ổ ngoài.
      *"Hai nơi khác nhau về vật lý"* **không tạo ra được từ phần mềm**, và
      `C:\PROJECTS\9Chain-backups\` cũng trên `C:` nên không tính. ⇒ Cần David cắm ổ vào hoặc
      chỉ ra nơi bản thứ hai đang nằm. Phần A1 làm được đã xong: `o1-check.mjs` trên bộ **chính**
      ⇒ **exit 0** (nó ĐÚNG là bộ của mạng đang chạy, 6/6 quỹ giữ tiền thật).
      ✅ **`28/08` lượt 2 — David chốt phương tiện: MÁY TÍNH THỨ HAI.** Quy trình đầy đủ ở
      `docs/O1-SECOND-COPY-RUNBOOK.md` (đường chuyển được phép / **cấm** · 3 mức nghiệm thu ·
      đường lui khi máy đích không có Docker). Còn lại: David chỉ **máy đích + thư mục**.
- [x] **Q-5b — 🔴 CỔNG NGHIỆM THU CỦA B-16 ĐÃ CHẾT CẢ NGÀY, VÀ NÓ ĐỎ NGƯỢC** (D-116)
      Lượt đổi tên `kiem-khoa`→`check-keys` (patch 0025) không nối vào `scripts/o1-check.mjs`
      ⇒ `go run` gói **không tồn tại** ⇒ exit 1 ⇒ cổng chấm `VE_DO` ⇒ in
      **`🔴 SAI — đừng cất nó làm bản O1`** cho **bộ khoá chính, hoàn toàn đúng**. Tin mặt chữ
      là **vứt bỏ một bản sao lưu tốt**. Cùng lỗi nằm luôn trên **đường ký ví tiền thật**
      (`wallet-tunnel/enter.sh` ⇒ *"khoá không suy ra địa chỉ tệp tự khai"*).
      🔴 Ba lớp cùng mù: `o1-check` là **việc tay**, không phải 1 trong 18 cổng ·
      `--self-test` có ca đúng nhưng **xanh vì SAI LÝ DO** (ca *"bộ chết ⇒ 1"* ra 1 từ đường
      công cụ hỏng) · `wallet-over-tunnel --check` **không mount khoá** nên không đi vào nhánh
      hỏng — cổng xanh, đường thật hỏng (gotcha 4).
      ✅ Vá **không phải bằng cách sửa cái tên**: công cụ phải **TỰ KHAI đã chạy**
      (`check-keys — <đường dẫn>` / `FATAL `) thì lời phán mới được tin; không có dấu đó ⇒
      **`2` CHƯA KẾT LUẬN**, không bao giờ `1`, không bao giờ `0`.
      **Đối chứng:** self-test **7/7** (thêm ca *"gói công cụ không tồn tại ⇒ 2, KHÔNG phải 1"*)
      · ca đắt nhất nay xanh **vì đúng lý do** · `o1-check` bộ g0 ⇒ **exit 0** · đo thẳng trên
      khối khoá **đã chết**: tên cũ ⇒ exit 1 **không dấu tự khai**, tên mới ⇒ exit 0 **có dấu**
      · `bash -n enter.sh` đạt · `check-english-code` **5856 → 5786** (trả 70 dòng).
- [x] **Q-5c — 🔴 KHOÁ QUỸ ĐANG GIỮ TIỀN NẰM TRẦN TRONG THƯ MỤC TẠM 20 GIỜ** (D-117)
      Tìm ra khi quét *"đã có bản sao thứ hai nào chưa"*: `…\Temp\claude\…\scratchpad\kk\` chứa
      **bản trùng byte** của bộ g0 (`keys.txt` + `allocation.md` khớp từng hash) **cộng** hai
      bản *"làm hỏng"* dựng làm ca đối chứng đêm `27/08` — mà **bản làm hỏng vẫn chứa đủ khoá
      riêng thật**.
      🔴 Ba cổng cùng mù, mỗi cổng vì lý do riêng: `check-net-dirs` chỉ đi trong `local-net/` ·
      `o1-check` **không ai bảo nó nhìn đâu** · `check-deploy-drift` so repo↔server, tệp này
      không thuộc bên nào.
      ✅ Cổng mới **`scripts/check-key-leaks.mjs`**. 🔴 **Bản nháp đầu của nó cũng sai, và sai
      đúng lớp lỗi của dự án**: khớp chuỗi `PrivateKey-` ⇒ đỏ **32 tệp**, gồm **hai
      `PROGRESS.md` trong git** (chỗ khớp là câu *"đã quét: không có `PrivateKey-*`"*). Nó đo
      **sự có mặt của một CHỮ**, không phải **của một KHOÁ**. Bản đúng đo hai đại lượng:
      (1) có phải khoá — `PrivateKey-` + **40+ ký tự base58**; (2) có phải khoá **GIỮ TIỀN** —
      băm rồi so với bộ quỹ sống. Trùng ⇒ 🔴; không trùng ⇒ 🟡 **báo mà không chặn**.
      **Đối chứng:** self-test **6/6** (có ca *"tài liệu chỉ NHẮC ⇒ không phải rò rỉ"* và ca
      *"không đọc được bộ quỹ ⇒ 2, KHÔNG phải 0"*) · chạy thật **trước** khi dọn ⇒ 🔴 đúng **2**
      tệp, hai `PROGRESS.md` **rơi khỏi danh sách** · dọn theo D-107 (LIỆT KÊ 4/4 hash khớp →
      `shred -u -n 3` → ĐỐI CHỨNG) · sau khi dọn ⇒ cổng **exit 0**, bản gốc **khớp từng byte**.
      🟡 Còn **19 tệp khoá mạng diễn tập** rải trong cây tạm — không phải tiền, không chặn.
- [x] **Q-5d — cổng rò rỉ tự nó sai HAI lần nữa; một lượt quét ĐỘC LẬP mới bắt được** (D-117b)
      (1) **Phạm vi dừng ở REPO, không ra THƯ MỤC CHA** ⇒ mù với `C:\PROJECTS\9Chain-backups\`,
      hai worktree anh em, các bản gương — **thư mục sao lưu là nơi khoá dễ bị chép vào nhất và
      ít được nhìn lại nhất**. (2) **Mốc so hẹp hơn tập khoá giữ tiền**: chỉ so với `keys.txt`
      6 quỹ, trong khi `chain-factory-key.txt` là **ví thứ BẢY giữ ~90 LOVE9 thật** ⇒ bản trùng
      byte của nó trong gói lưu bị chấm **🟡 "chắc không sao"**.
      ✅ Mốc so nay **nhiều nguồn**, nguồn nào đọc không được thì **khai ra** (mốc so co lại sẽ
      âm thầm biến 🔴 thành 🟡). Self-test **8/8**, có ca chứng minh lỗi cũ **có thật**
      (*"cùng khoá, bỏ nguồn thứ hai ⇒ 0"*). Chạy thật ⇒ 🔴 đúng **2** tệp. **~235s ⇒ cổng tay.**
      🔴 **Phát hiện kèm, lớn hơn cả hai lỗi:** `chain-factory-key.txt` trong gói `20260825`
      (mạng **9001 ĐÃ CHẾT**) **trùng byte** với khoá giữ tiền trên `g0` hôm nay ⇒ **khoá factory
      được tái dùng xuyên thế hệ**, đúng hình dạng gotcha 15. ⇒ **Ngày G phải sinh khoá factory
      mới**, cùng lượt với token.
- [x] **Q-5e — xoá gói lưu `20260825` (David duyệt HAI lần), và phép đo đổi cả câu hỏi** (D-117c)
      Bước LIỆT KÊ lộ ra giả định sai: gói đó **không** phải *"gói của mạng đã chết"* mà là **gói
      duy nhất còn hình dạng bản lưu đầy đủ** — 20 tệp danh tính validator · 651 MB chain data ·
      khoá + genesis; hai gói mới hơn có **0**. Đã trình lại số đo, David **tái khẳng định**.
      Cách xoá: LIỆT KÊ 31/31 → ghi `docs/archive/backup-20260825-inventory.md` (sha256 từng tệp,
      thứ duy nhất sống sót) → `shred -u -n 3` (30 tệp nhỏ) + `-n 1` (archive) → đối chứng: gói
      biến mất, **6 gói A1 còn lại nguyên vẹn**.
      🔴 **Hai bẫy công cụ IM LẶNG trong đúng lượt xoá:** `find -size -1M` khớp **0 tệp** (find
      làm tròn **lên** ⇒ tệp 495 B không *"nhỏ hơn 1M"*), lệnh exit 0 mà xoá **0 tệp** — đúng
      hình dạng B-17 · và dòng đối chứng cuối in *"remaining bundles:"* **rỗng** do lỗi glob của
      chính nó, đọc theo mặt chữ là khai một sự cố không có thật. ⇒ **Dòng đối chứng cũng phải
      được đối chứng.**
      ⇒ Sinh ra **B-20**: không bản lưu nào chứa danh tính validator của **mạng đang chạy**.

**Số đo cuối phiên:** preflight **12/12 xanh, exit 0** (14 việc tay) · `watch-network` 9/9 ·
drift `19 khớp · 0 lệch · 0 thiếu` · `o1-check` trên bộ g0 **chính** ⇒ **exit 0** (nó ĐÚNG là bộ
của mạng đang chạy) · `check-keys-on-chain --self-test` 5/5 · `wallet-over-tunnel --check` 3/3 ·
`h6b --check` 24=24 patch (chậm 1 commit, chỉ tài liệu) · `check-robots` **ĐỎ, có chủ ý**.

---

## 🔴 ĐỢT AUTOPILOT 15 (2026-08-28, chiều/tối) — ĐỘ BỀN trước GO/NO-GO `29/08`

**Chạy KHÔNG có David, ~5 giờ.** Luật cứng + ranh giới: [`CLAUDE.md`](CLAUDE.md).
Nguồn: bản phân tích `28/08` — mọi mốc dưới đây là **cổng**, không mốc nào là tính năng, và
**không mốc nào chạm mạng đang chạy**.

🔴 **Ranh giới cứng của đợt này** (ngoài `CLAUDE.md` §4):
KHÔNG deploy · KHÔNG ghi lên server (SSH **chỉ đọc**) · KHÔNG gửi giao dịch · **KHÔNG đụng
`patches/`** ⇒ tree giữ `074aaa93` / 24 patch · commit đường dẫn tường minh, không remote nên
không push.

- [x] **A15-0 — `CLAUDE.md`: luật cứng ra khỏi tệp 2.023 dòng**
      Luật cứng hiện nằm ở dòng ~229 của `HANDOFF.md`; mỗi phiên mới trả ~85K token để đọc lại.
      **Điều kiện qua:** `CLAUDE.md` ≤120 dòng, đủ 4 luật cứng + lớp lỗi "đo sai đại lượng" +
      danh sách cổng + ranh giới + định nghĩa "xong"; `HANDOFF.md` trỏ tới nó ở đầu tệp.
- [x] **A15-1 — 🔴 CỔNG BỘ ĐỊNH DANH XUYÊN NGÔN NGỮ (`A1Gen` Go ↔ `A1_GEN` JS)**
      Đo `28/08`: `A1Gen` (Go, patch 0018) và `A1_GEN` ([`lib/chainid.mjs:25`](local-net/lib/chainid.mjs:25))
      là **hai hằng số chép tay độc lập**, không cổng nào nối chúng. Và
      `grep networkID local-net/console/server.mjs` ⇒ **0 kết quả**: console **chưa bao giờ hỏi
      node nó đang nói chuyện với thế hệ nào**. Ngày G bump `0 → 1`; quên một bên thì console
      cấp chainId từ khối của thế hệ khác, **im lặng**, vào một genesis bất biến.
      **Hai vế:** (a) `check-consistency.mjs` đọc `A1Gen`/`A1ID`/`A1Name` **thẳng từ Go**
      (đã có tiền lệ `SupplyCap`, dòng 55) và so với `A1_GEN`/`GOC_DAI_CHAINID`/`TRAN_DAI_CHAINID`;
      (b) console lúc khởi động gọi `info.getNetworkID`, lệch ⇒ **fail-closed** `/api/create`.
      **Điều kiện qua:** 3 ca ĐỎ — sửa JS ⇒ đỏ · sửa Go ⇒ đỏ · console trỏ networkID lạ ⇒ từ
      chối đẻ chain, trỏ đúng ⇒ phục vụ bình thường.
      ✅ **ĐẠT `28/08`** (D-093). `check-consistency` **17 đạt/0 lỗi · 14/14 ca đỏ**, kèm đối chứng
      trên **TỆP THẬT** (`sed A1_GEN=1` ⇒ exit 1). `generation-test.mjs` mới: **13/13** trên console
      THẬT với node giả đổi được câu trả lời; **gỡ cổng khỏi `createChain` ⇒ 7 hỏng/exit 1** (bài
      kiểm nối vào mã thật). 🔴 Bẫy đã đo: `info.getNetworkID` trả **CHUỖI**.
      🔴 **Đẻ ra D-094:** `console-deploy.sh` chép 15 tệp mà **đối chiếu chỉ 9** — thiếu đúng
      `lib/chainid.mjs` + hai sổ chặn đã để B-14 hở hai ngày.
      ✅ **ĐÃ DEPLOY THẬT `28/08`** (David yêu cầu trong phiên) — D-095. Lượt deploy lộ ra
      `console-deploy.sh` **hỏng từ chính commit vá nó** (`a16c81c` = D-088): một ký tự xuống
      dòng thật nằm trong chuỗi JS ⇒ `SyntaxError`. Tức bản vá đóng gốc rễ B-14 **chưa từng
      chạy trót lọt lần nào**; `chainid.mjs` lên server bằng đường chép tay. Đã sửa, và lượt
      này là **lần chạy trót lọt đầu tiên**: 15 chép/15 đối chiếu · test trên server 21/21 +
      32/32 · **drift 19 khớp · 0 lệch · 0 thiếu** · console sống tự khai
      `thế hệ : ✅ khớp node đang chạy — g0 · networkID 999999999`.
      ⇒ **D-093 đóng ở CẢ HAI lớp** (repo + sản phẩm).
      🔴 D-096: tên miền sống là **`a1.9chain.org`**; `testnet-a1.9chain.org` trả **525** qua
      Cloudflare — đo bằng tên cũ ra "trang chết" trong khi trang vẫn sống.
      ⚠️ Sửa `console/server.mjs` ⇒ drift **sẽ báo console lệch, và đó là ĐÚNG**. Deploy là việc
      của David.
- [x] **A15-2 — O1 thành MỘT cổng (`scripts/o1-check.mjs`)**
      D-090: `kiem-khoa` một mình chấm `6/6 ✓ exit 0` cho bộ khoá **đã chết**. Luật *"nhớ chạy
      kèm `check-keys-on-chain.mjs`"* hiện chỉ sống trong đầu người đọc HANDOFF — đó là **quy
      trình, không phải cổng**, và nó sai đúng lúc được dùng nhiều nhất (**B-16, David làm bản
      sao thứ hai**).
      **Điều kiện qua:** bộ g0 ⇒ exit 0 · bộ `9001` chết ⇒ exit 1 nêu đúng *"thuộc thế hệ đã
      chết"* · **giấu phép đo trên chain đi ⇒ exit 2 "CHƯA KẾT LUẬN", tuyệt đối không xanh**
      (ba mã thoát phân biệt *đúng* / *sai* / *không đo được*).
      ✅ **ĐẠT `28/08`** (D-097) — nghiệm thu trên **dữ liệu thật**, **6/6 ca đúng mã thoát**:
      g0 sống ⇒ `0` · 🔴 bộ `9001` chết ⇒ `1` *trong khi cùng lượt đó vế 1 vẫn in
      `✓ 6/6 quỹ khôi phục đúng`* · giấu `check-keys-on-chain.mjs` ⇒ `2` **không xanh** ·
      docker hỏng / thư mục rỗng / thư mục không tồn tại ⇒ `2`.
      Kèm: Go bản địa **không** build được `kiem-khoa` (cần container `golang:1.25.10`, ~28s),
      và `spawnSync` né hẳn bẫy MSYS đổi `-w /src` thành `C:/Program Files/Git/src`.
      Kèm: cập nhật `docs/O1-CUSTODY-VERIFICATION.md` + `BLOCKERS.md` B-16 sang **một lệnh duy nhất**.
- [x] **A15-3 — drift gate thấy tệp THỪA (`--quet-thua`)**
      Gotcha 14: cổng canh *"tệp trong danh sách có khớp không"*; tệp **xoá khỏi repo mà còn
      trên server** thì không nhóm nào thấy. Đã cháy thật — genesis LOCAL của Avalanche
      (khoá ewoq công khai) sống trên server sau khi repo xoá.
      **Điều kiện qua:** hàm so sánh tách thuần, đối chứng bằng danh sách tổng hợp (tệp lạ ⇒ đỏ ·
      đúng danh sách ⇒ xanh) + **một lượt chạy thật read-only** lên server. Không ghi một byte.
      ✅ **ĐẠT `28/08`** (D-098). Bật **mặc định**, không núp sau cờ. Tách "thừa" làm hai:
      🔴 **MỒ CÔI** (không có trong repo) ⇒ đỏ · ℹ️ **ngoài tầm canh** (có trong repo, ngoài
      manifest) ⇒ chỉ đếm. `null` ≠ `[]` — không quét được là *không biết*, có ca đối chứng riêng.
      **6/6 ca tổng hợp** + chạy thật bắt **7 mồ côi** ngay lần đầu + đối chứng trên dữ liệu thật
      (gỡ một mục khai ⇒ **đỏ, exit 1**).
      🔴 **Đẻ ra B-17:** hai bản `.bak` của console trên server đo được **0** lần
      `A1_DE_CHAIN_MO` (một bản còn **0** lần `siwe`) ⇒ khôi phục là mở lại D-087 và gỡ M4.1.
      Cần **David** xoá.
- [x] **A15-4 — O3b: kéo sổ THẬT về → dồn `chains` → `retired` (`scripts/close-ledger-before-regenesis.mjs`)**
      Lượt `26/08` reset sổ về `{chains:[],retired:[]}` ⇒ **mất 43 bản ghi chống phát lại**.
      Và `gen-chainid-issued.mjs` đọc **repo** ([dòng 23–24](scripts/gen-chainid-issued.mjs:23))
      trong khi sổ sống nằm trên **server** và bị `boQua` trong drift gate ⇒ **không ai canh
      khoảng cách đó**.
      **Điều kiện qua:** sổ rỗng ⇒ **từ chối** (rỗng ≡ hỏng) · JSON hỏng ⇒ từ chối · 2 chain sống
      ⇒ ra tệp 0 sống / 2 `retired` có `thuHoiLuc`, và `gen-chainid-issued --check` sau đó vẫn
      xanh **với số mục TĂNG**.
      ✅ **ĐẠT `28/08`** (D-099) — `scripts/close-ledger-before-regenesis.mjs`. **9/9 ca đối chứng**
      (4 ca đỏ) + tính chất *không mất/không đẻ bản ghi* đúng ở n = 0/1/5/43. `--pull` chạy thật:
      server `0/0`, repo biết **53 bản ghi từ 3 sổ**. `--compact` chạy thật trên sổ repo ⇒
      `0 sống / 1 retired` có `thuHoiLuc` + `lyDo`; `gen-chainid-issued --check` sau đó vẫn xanh.
      🔴 **Đo ra lỗ thứ hai chưa ai nêu:** sổ sống ở **server** (`0/0`) và sổ repo
      (`DeltaChain#9201`) **không phải bản sao của nhau**, mà drift gate **cố ý bỏ qua** tệp đó
      ⇒ không cổng nào canh khoảng cách giữa hai sổ. `--pull` lấp chỗ đó.
      🔴 **Sửa một lỗi của chính tôi:** bản đầu từ chối mọi sổ thiếu khoá `retired` (viện *rỗng ≡
      hỏng*) và **từ chối luôn sổ thật của repo** — trong khi `loadState()` khai rõ đó là định
      dạng trước M4.4, hợp lệ. Luật đúng: **thiếu khoá ≠ sai kiểu**.
- [x] **A15-5 — `scripts/watch-network.mjs`: giám sát một lệnh**
      HANDOFF tự khai số dư `chain-factory` **chưa có giám sát** (cạn ⇒ đẻ chain chết câm), và
      B-12 (9 validator rụng dần trong cửa sổ 56 ngày, node cuối rụng là **mạng DỪNG**) đang chờ
      một cái lịch không ai dựng.
      Đo: networkID + tên (so `A1_GEN`) · 9/9 node · `supplyCap` đọc **trong container** · số dư
      `chain-factory` · `platform.getCurrentValidators` → `endTime` sớm nhất + **số ngày còn lại**
      · faucet `/api/supply` · console health · gọi drift.
      **Điều kiện qua:** ra bảng số thật + ≥2 ca đỏ (RPC sai đường ⇒ **đỏ**, không phải xanh rỗng ·
      hạ ngưỡng ngày hết hạn ⇒ cảnh báo nổ). Chỉ đọc. ⇒ biến B-12 từ *"David dựng lịch"* thành
      *"máy tự nhắc"*, và trả lời `endTime` **bằng phép đo, không tính tay**.
      ✅ **ĐẠT `28/08`** (D-100). **13/13 ca đối chứng** (6 chấm điểm + 7 ngưỡng B-12) ·
      **chạy thật 9/9 mục xanh**: g0 · 999999999 · 9 validator · 8 peer · hạn sớm nhất **308
      ngày** (`2027-07-02`) · factory **89,899 LOVE9** · `supplyCap` đọc **trong container**
      khớp Go · faucet có số đo · console 200.
      🔴 Hai đối chứng **dữ liệu thật, hai chiều hỏng ⇒ hai mã**: RPC chết ⇒ **2** (không đo
      được) · `A1_GEN = 1` trong khi mạng g0 ⇒ **1** (đúng kịch bản ngày G nếu bump một bên).
      Phát hiện phụ: tài liệu gọi `/api/tien-trinh`, mã thật là `/api/progress`.
- [x] **A15-6 — `scripts/gday-preflight.mjs`: runbook chạy được**
      Hôm nay runbook ngày G nằm rải ở 5 tệp tài liệu, không có gì chạy được. Gọi mọi cổng theo
      **đúng thứ tự ngày G**, in bảng ĐẠT/ĐỎ/BỎ QUA, exit ≠0 nếu mục bắt buộc đỏ.
      🔴 Mục **chưa tự động hoá được** (O2 công bố `sha256` ra chỗ NGOÀI · sinh token/khoá mới ·
      build lại image 24 patch · `down -v`) phải in ra là **VIỆC TAY BẮT BUỘC** — không giả vờ xanh.
      **Điều kiện qua:** 1 lượt chạy thật · làm hỏng 1 cổng con ⇒ preflight **đỏ và nêu đích danh**.
      ✅ **ĐẠT `28/08`** (D-101). **12/12 cổng xanh** + **12 việc tay** in thành ô trống chia
      theo giai đoạn, **không bao giờ tính là "đạt"**. Đối chứng: `A1_GEN = 1` ⇒ **đỏ, exit 1**,
      nêu đích danh.
      🔴 **Đo được bán kính ảnh hưởng:** đổi **một** hằng số làm **bốn** cổng đỏ (số học · phép
      cấp chainId · canh mạng · drift) ⇒ bump `A1Gen` ngày G không phải "sửa hai dòng rồi đi tiếp".
      Sửa một câu nói dối của bản đầu: `--no-network` từng in "MỌI CỔNG XANH" trong khi bỏ qua 3 cổng.
- [x] **A15-7 — HANDOFF gọn + bài đo lệch đồng hồ (B-13b)**
      (a) `HANDOFF.md` ≤300 dòng, lịch sử sang `docs/archive/HANDOFF-2026-08.md` — **không mất
      nội dung** (đối chứng: grep vài chuỗi mốc cũ vẫn tìm được).
      (b) `scripts/check-clock-skew.mjs` — viết TRƯỚC, chạy được SAU khi mạng g1 lên.
      🔴 Bài phải **tự khai**: hôm nay 9 node **cùng một máy ⇒ lệch = 0**, và con số đó chỉ có
      nghĩa **sau O4** (nhà cung cấp thứ hai). Đo lệch trên một đồng hồ duy nhất rồi khai "đã đo"
      chính là *đo sai đại lượng*.
      ✅ **ĐẠT `28/08`** (D-102 · D-103). (a) `HANDOFF.md` **2.026 → 250 dòng**, lịch sử 1.793
      dòng sang `docs/archive/HANDOFF-history-2026-08.md`, **không mất một chữ**.
      (b) `scripts/check-clock-skew.mjs` — **7/7 ca đối chứng**; đo thật **+557ms ± 811ms** ⇒
      biên xấu nhất node chậm 254ms ⇒ giữ `--offset-ms 3000`.
      🔴 **Bỏ hai cách đo vì chúng đo sai đại lượng:** `ssh` cho RTT **4.100ms** và một thiên
      lệch hệ thống +3.150ms **không tách được** khỏi lệch thật (5 mẫu chỉ tản 55ms — *nhất quán
      cao không phải bằng chứng đúng*); `curl` dính chi phí sinh tiến trình. Sàn sai số **±500ms
      bất khả kháng** vì header `Date` có độ phân giải giây.

**Điều kiện qua đợt 15:** ngày G có **một lệnh** để chạy, và mỗi cổng trong lệnh đó **đã từng
được nhìn thấy lúc ĐỎ**.

🔴 **Không thuộc đợt này — cần David, autopilot không đoán thay:** B-16 bản sao thứ hai (chặn
GO/NO-GO `29/08`) · B-10 robots.txt ở dashboard Cloudflare · O4 tiền cho nhà cung cấp thứ hai ·
ký SIWE cho phép kiểm đẻ chain đầu-cuối · gộp `web-home` → `main`.

⚫ **RA KHỎI TẦM NGẮM CỦA A1 (D-104, `28/08`):** nội dung chữ khắc. Hai chuỗi chạy **song
song**; **David điều phối C1 riêng**. A1 nhận byte đã đóng băng như **đầu vào**, không theo
dõi, không chờ, và **không xếp C1 vào bảng rủi ro của mình**. Việc còn lại của A1 ở vế này
đúng một câu: **giữ cơ chế khắc chạy được, và khai rõ hạn chót đầu vào phải tới.**

---

## 🔴 ĐỢT AUTOPILOT 14 (2026-08-27) — 5 mốc đường găng ngày G

Nguồn: `HANDOFF.md` §"Backlog autopilot" + `docs/GDAY-A1-REMAINING.md` §9.
**Không mốc nào cần David.** Không đạt ⇒ ghi `BLOCKERS.md` rồi sang mốc kế, đừng dừng chờ.

- [x] **A-1 — Diễn tập giao dịch nghi lễ Block Adam** (§4 `NGAY-G-A1-CON-LAI`) — **ĐẠT `27/08`**
      Bài `local-net/faucet/block-adam-drill.mjs` + mạng tập `local-net/docker-compose.drill.yml`
      (1 node, cổng 9750, binary đã vá — `supplyCap` 7900000001000000000 trong log đầu).
      **4 lượt chạy:** bù 0 ⇒ 🔴 **7 đạt/1 hỏng** · bù +3s ⇒ ✅ **9 đạt/0 hỏng** · đối chứng
      ngược *không gửi gì* ⇒ 3/3 đúng (0 block) · đối chứng ngược *hẹn sai giờ* ⇒ 5/5 đúng.
      Hẹn giờ lệch **0 ms** cả 3 lượt. Bản đầy đủ: `docs/DRILL-BLOCK-ADAM-2026-08-27.md`.
      🔴 **Lượt bắn ĐÚNG mốc HỎNG** — `block.timestamp` rơi vào đúng giây bấm gửi ⇒ block chứa
      Adam mang `ts = mốc`, không **vượt** mốc; block vượt mốc lại là block của Eva. Luật khắc
      và hành động nghi lễ trỏ vào **hai block khác nhau**. ⇒ sinh ra **B-13** (a: David chốt
      neo vào cái gì · b: đo lệch đồng hồ 9 node rồi chọn `--offset-ms`), D-052…D-055.
      ⚠️ Chỉ phủ **C-Chain**; 1 node ⇒ **không chứng minh được đồng thuận**.
- [x] **A-2 — Quy trình O2**: export + `sha256` mạng sắp chết, công bố **trước** khi xoá —
      **ĐẠT `27/08`**. Bài `scripts/export-chain.mjs` (một lệnh, không phụ thuộc gói ngoài).
      Chạy trên mạng tập: 10 tệp · 33.973 byte · gốc `081d2550…`. Kiểm lại được **hai đường**:
      bằng bài, **và** bằng `sha256sum -c MANIFEST.txt` chuẩn (10/10 OK) — bộ vật chứng chỉ
      kiểm được bằng công cụ sinh ra nó thì yếu.
      **3 ca đối chứng ngược đỏ đúng chỗ:** sửa 1 byte ⇒ `LỆCH BYTE` · sửa 1 byte **và sửa
      luôn manifest** ⇒ `GỐC LỆCH` (ca chứng minh vì sao phải công bố ra **ngoài**) · xoá tệp
      ⇒ `THIẾU TỆP`. Quy trình: `docs/O2-EXPORT-BEFORE-DELETE.md`.
      🔴 Đối chứng ngược bắt một lỗi trong **chính công cụ này**: tờ đầu đếm L1 *được xin* thay
      vì *xuất được* ⇒ khai "kèm 1 L1" trong khi không có byte nào. Đã sửa thành `xin N · XUẤT
      ĐƯỢC M`.
      🔴 **Còn lại (không chặn):** chạy một lượt trên **mạng công khai** để biết thời gian thật;
      nhớ `--add-evm` cho từng L1 còn sống.
- [x] **A-3 — G4**: tra `chainid.network` — **ĐẠT `27/08`**. Bài `scripts/check-chainid.mjs`,
      vật chứng `docs/evidence/g4-2026-08-27/` (`chains.json` 1.161.063 byte · sha256
      `583b67a2…` · 2.723 chuỗi · tra lúc `2026-08-27T09:32:38Z`).
      ✅ **`9000000009` TRỐNG**, và không có chuỗi nào trong bán kính 1 triệu quanh nó.
      🔴 **Nhưng bài tra rộng hơn kế hoạch và bắt được 4 số bị chiếm trong dải console tự cấp
      cho L1 người dùng: `9100` = Genesis Coin (số console cấp ĐẦU TIÊN) · 9108 · 9134 · 9170.**
      Kế hoạch chỉ nêu `9000000009` — tức chainId *của A1*, bỏ sót chainId *A1 phát cho người
      khác*. ⇒ **B-14** (gốc dải, cần David — gộp vào mục quyết §5c).
      3 ca đối chứng ngược: `--add 1` ⇒ bắt được Ethereum Mainnet (exit 1) · sổ cắt cụt và sổ
      `[]` rỗng ⇒ **từ chối kết luận** (exit 2). Mã thoát phân biệt *"bị chiếm"* với *"không tra
      được"*. Bản đầy đủ: `docs/G4-CHAINID-LOOKUP-2026-08-27.md`.
      🔴 **Phải tra LẠI ngay trước bước sinh genesis ngày G** — sổ đổi hàng ngày.
- [x] **A-4 — C-4**: cổng "bản tập ≠ bản thật" cho **chainId** — **ĐẠT `27/08`**, đóng nốt B-11.
      `netgen/chainid.go` (patch **0015**, tree fork **`df68a7d7`**, **15 patch** trên `1cf1fc3`,
      tái lập khớp từng byte; đối chứng ngược 14/15 patch ⇒ tree khác).
      Luật: lượt **thật** (có khắc) + chainId thật ⇒ im lặng · lượt **tập** + chainId thật ⇒
      **cảnh báo lớn** · lượt **thật** + chainId lạ ⇒ **CHẶN** (khắc vĩnh viễn bản sắc sai) ·
      lượt tập + chainId riêng ⇒ đường đúng. Kèm trần EIP-2294 + **luôn in chainId**.
      **7 ca nghiệm thu, 3 ca đỏ đúng chỗ**; ca 1/ca 2 chấm bằng **nội dung genesis**, không
      bằng log. ⚠️ Không cần build lại image node (netgen chạy `go run` lúc sinh mạng).
      ✅ **Phần thứ hai — console (B-14):** nạp `chainid-taken.json` (51 số bị chiếm dải
      9100–9999) và bỏ qua ở **cả hai** đường. Nghiệm thu thật: xin `9100` ⇒ từ chối nêu tên
      *Genesis Coin* · tự cấp trên sổ rỗng ⇒ **9101** (đọc từ genesis vừa dựng) · xoá tệp ⇒
      console **tự khai cổng đang TẮT**. Bản đầy đủ: `docs/CHAINID-GATE-2026-08-27.md`.
      🔴 **Còn lại (cần David):** gốc dải vẫn là 9100 — vướng mục quyết §5c.
- [x] **A-5 — I1b**: phơi cung ra endpoint — **ĐẠT `27/08` bằng đường mạnh hơn (endpoint)**.
      `GET /api/supply` (faucet) + `netgen/cung.json` (patch **0016**, tree fork **`c9226d9c`**,
      **16 patch**, tái lập khớp từng byte).
      🔴 **Sự thật không chiều theo luật được:** tổng cung 9 tỷ **không đọc được từ RPC nào** —
      `getCurrentSupply` chỉ đếm X/P, `SupplyCap` là hằng số binary. Nên endpoint **không giả
      vờ**: mỗi trường mang `source` riêng (`measured` / `binary-constant` / `derived` kèm công
      thức / `genesis-parameter`).
      Đo thật: `xpCurrentSupply` 4.300.883.914 (`platform.getCurrentSupply`) · `cChainGenesis`
      1.099.999.999 (`eth_getBalance` ở **block 0**, không phải `latest`) · `xpSupplyCap`
      7.900.000.001 · `totalSupply` 9.000.000.000 (suy). **Phát hiện P0 nay nằm ngay trong
      phản hồi**, không nằm trong một tài liệu ai đó phải nhớ đi đọc.
      Endpoint **tự đo rồi SO LẠI** bản khai ⇒ `manifestMatchesChain` + `mismatches`.
      **2 ca đối chứng ngược:** sửa bản khai ⇒ nêu đích danh địa chỉ lệch, và `totalSupply`
      **vẫn đúng** (suy từ số đo, không từ số khai) · xoá bản khai ⇒ **503, không bịa số**,
      `/api/info` vẫn 200 (hỏng có phạm vi). Bản đầy đủ: `docs/I1B-SUPPLY-SOURCED-2026-08-27.md`.
      🔴 **Còn lại (không chặn):** (a) `cung.json` phải lên server cùng `faucet.env` ·
      (b) câu khai nguồn trên trang — `web/` thuộc worktree `9Chain-A1-web`, câu chữ đã soạn sẵn.

---

## ✅ Đã xong trước autopilot (kiểm kê 2026-08-24)

- [x] Fork avalanchego → identity 9Chain-A1 (LOVE9/love9/9001/love9evm, chainId 9000000009)
- [x] Mạng 5 validator chạy thật trên `139.99.145.13`, 5/5 connected
- [x] Testnet công khai LIVE: `testnet-a1.9chain.org` + `rpc-testnet-a1.9chain.org`
- [x] Blockscout index đầy đủ · faucet · nút "Thêm vào MetaMask"
- [x] Nút "đẻ chain" chạy thật trên mạng công khai (OmegaChain, 12.7s, giao dịch chốt 1.4s)
- [x] Chain về tay người bấm nút — `admin` vào cả genesis alloc lẫn feeManagerConfig (OwnerTest)
- [x] Validate địa chỉ EIP-55 (`local-net/lib/eip55.mjs`, keccak-256 viết tay)
- [x] Danh bạ `/chains/` hiện chủ sở hữu, xử lý đúng chain thiếu khoá `admin`
- [x] Caddy: lọc path RPC, CORS, access log, `tls internal` (Cloudflare Full)
- [x] Chặn chainId trùng (quét số còn trống, không dùng `9100 + đếm`)

---

## M0 — Version control cho lớp chủ quyền  🔴 P0

**Vì sao trước hết:** toàn bộ thứ làm 9Chain-A1 *khác* avalanchego đang là uncommitted
working-tree changes (6 file M) + untracked (`9chain-a1-tools/` 1079 dòng Go,
`genesis/genesis_9chain_a1.go`). Gốc dự án **không phải git repo**. Gotcha re-rebrand
trong HANDOFF lại hướng dẫn chạy `git checkout --` → gõ nhầm là mất sạch.
Và §5 autopilot yêu cầu "git commit nhỏ" — không có git thì không có lưới đỡ nào.

- [x] M0.1 — Commit lớp chủ quyền vào nhánh `9chain-a1` trong `upstream/avalanchego`
      → 3 commit (`e46465c`), `git status --porcelain` = **0 dòng**
- [x] M0.2 — `git init` gốc dự án + commit đầu — 49 file, `c85d396`.
      Đã quét secret: không có `PrivateKey-*`/khoá riêng. Chuỗi `0x…` trong
      `9chain-a1-config/genesis.json` là BLS publicKey + proofOfPossession (công khai).
      ⚠️ **Tệp đó đã XOÁ `27/08`** — nó là `genesis_local.json` gốc của Avalanche (khoá
      ewoq công khai giữ 50 triệu, địa chỉ `X-local1…`, stake hết hạn `2025-07-15`), và
      vẫn nằm trong đường boot của node dev. Quét secret hồi đó **đúng** — khoá công khai
      của người khác không phải secret của mình; cái sai là **dùng nó làm genesis**.
      Xem `docs/CORE-AUDIT-2026-08-27.md` §7b.
- [x] M0.3 — `patches/` (3 patch) + `scripts/apply-sovereign.sh`, `2d4af01`
- [x] M0.4 — `.gitattributes` `* -text` ở **cả hai** repo (KB: patch fail toàn bộ file khi git Windows/Linux lệch)
- [x] M0.5 — **Kiểm chứng khôi phục đã CHẠY THẬT**: clone sạch → `apply-sovereign.sh` →
      so tree hash với nhánh gốc: `42d43f32…` == `42d43f32…` → cây phục hồi **giống hệt từng byte**
- [x] M0.6 — **Build lại từ cây đã commit — ĐẠT Ở MỨC MẠNH NHẤT CÓ THỂ** (2026-08-25,
      sau khi B-1 được gỡ). `--version` → `9chaingo/1.14.2 [database=v1.4.5,
      rpcchainvm=45, commit=9chain-a1-poc, go=1.25.10]`.

      Và hơn thế: binary build ra **trùng từng byte với binary đang chạy testnet công khai**.
      ```
      avalanchego : 40d5e8f69dcbc786143b1833e34a7f5aeb191fe37844eb15394d17b022a7823f
      love9evm    : f829711b6cc3049a870eefa550e17c1af8b2c3130141c4b26eb279122aae5e27
      ```
      Ba chỗ cùng một hash: image dựng hôm nay · image `:dev` cũ · **node-1 trên
      `139.99.145.13` đang phục vụ RPC công khai**. Xem D-017.

**Điều kiện qua M0:** ✅ đạt phần cốt lõi — lớp chủ quyền không còn tồn tại dưới dạng
uncommitted/untracked ở bất kỳ đâu, và đường khôi phục đã chứng minh bằng tree hash
trùng khớp, không phải "trông có vẻ đúng". Còn treo M0.6 (build lại), không chặn mốc sau.

---

## M1 — Bộ đo + smoke test E2E

**Vì sao sớm:** hiện **không có test tự động nào**; mọi nghiệm thu là thủ công.
Mọi mốc sau đều cần đo, nên xây thước trước khi cưa.

- [x] M1.1 — `probe-net.mjs` — zero-dep, chạy được cả trên server. Đã chạy thật 20s
      qua Cloudflare: 37 lượt, 0% hỏng, p50 458ms.
- [x] M1.2 — `smoke-l1.mjs` hai chế độ (nhẹ chỉ-đọc / `--de-chain` đầy đủ).
      Chạy thật: **18/18 ĐẠT** trên testnet công khai.
- [x] M1.3 — **ĐO XONG trên mạng công khai** (2026-08-24, chain `Smoke7M7Q3D`, chainId 9102):
      > đẻ 1 chain → **C-Chain RPC chết 6.0 giây · 12/25 lượt gọi hỏng (48%)** · 1 khoảng chết
      Bằng chứng phụ: ngay sau đó cả 5 container đều `Up 25 seconds` — **cùng một con số**,
      tức là chúng bị recreate đồng loạt, không phải lần lượt.
      Giao dịch thật chốt sau **0.1s**, block 1, `0xd695ddcc…32b9be`.
- [x] M1.4 — Ghi số đo vào DECISIONS (D-006). **Kết luận: M2 PHẢI LÀM.**

**Điều kiện qua M1:** ✅ đạt — có con số thật, không phải suy đoán.

---

## M2 — Rolling restart khi track subnet mới

**Vì sao:** `console/server.mjs:181` gọi `docker compose up -d` → recreate **cả 5 node
gần như cùng lúc** mỗi lần đẻ chain. Nội bộ 2 chain không ai thấy; công khai thì mỗi lượt
người lạ bấm nút = cả mạng mất quorum. Đây là mắt xích gãy đầu tiên khi mở self-serve.
**Chỉ làm nếu M1.3 cho thấy gián đoạn thật.**

- [x] M2.1 — Restart tuần tự từng node, node phục vụ RPC công khai đi **cuối cùng**,
      hỏng thì **dừng ngay** không đụng node kế. Đã chạy thật: 19/19 đạt.
- [x] M2.2 — Đo lại. **KẾT QUẢ: KHÔNG ĐẠT ĐIỀU KIỆN QUA.**

| | đồng loạt (M1.3) | lần lượt (M2.2) |
|---|---|---|
| C-Chain chết | 6.0s | **6.5s** |
| lượt gọi hỏng (tuyệt đối) | 12 | **13** |
| tỉ lệ hỏng | 48% | 3.8% ← *chỉ vì cửa sổ đo dài gấp 13 lần* |
| thời gian đẻ 1 chain | 12.3s | **168.8s** |

**Đọc đúng số này:** tỉ lệ % giảm là ảo — **số lượt hỏng tuyệt đối gần như y hệt
(12 vs 13)**. Gián đoạn công khai do **riêng node-1 restart** gây ra, mà node-1 thì
buộc phải restart để track subnet mới. Restart lần lượt chỉ dời nó về cuối hàng chứ
không xoá nó. Đổi lại, đẻ chain chậm gấp 13 lần.

**Được gì thật:** 4 node giữ mạng sống suốt quá trình → consensus không đứt, và cơ chế
"hỏng thì dừng" đã chứng minh giá trị ngay lần chạy đầu (node-4 kẹt → dừng, node-1
không bị đụng, **gián đoạn công khai = 0**). Đây là an toàn, không phải tốc độ.

- [x] M2.3 — **Cái sửa thật: RPC công khai không còn là một node duy nhất.** ✅

      node-2 mở API ra `127.0.0.1:9660` (chỉ loopback) · Caddy `reverse_proxy` hai
      upstream, `lb_policy first` + health check chủ động lẫn bị động.

| đo trên mạng công khai | gián đoạn C-Chain | lượt gọi hỏng |
|---|---|---|
| 1 upstream (nền) | 6.3s | 21 |
| 2 upstream, `fail_duration 5s` | 1.8s | 6 |
| 2 upstream, `fail_duration 30s` + `max_fails 1` | **0.3s** | **1** |
| **đẻ 1 chain đầy đủ (restart cả 5 node)** | **0.5s** | **1** |

      So với nền M1.3 (6.0s / 12 lượt hỏng): **tốt hơn 12 lần**. 20/20 smoke test đạt.
      Đã vá cả `netgen` để mạng sinh sau này có sẵn (không chạy netgen trên mạng đang
      chạy — nó sinh KHOÁ MỚI = đổi danh tính validator; server vá tại chỗ).

**Điều kiện qua M2:** ✅ **đạt** — 6.0s → 0.5s, đo cùng một cách, táo với táo.

---

## M3 — IPv6 P2P (cộng đồng tự chạy node)

**Vì sao:** `netgen/main.go:281` cắm cứng `--public-ip=172.28.0.1x`, compose chỉ publish
9650 của node1, **không node nào publish 9651** → P2P sống trong bridge docker.
HANDOFF: *đừng quảng bá "chạy node cùng chúng tôi"* cho tới khi xong.

- [x] M3.1 — netgen sinh compose có IPv6 network, mỗi node một GUA từ khối `/64`.
      `A1_P2P_MODE=ipv6` + `A1_IPV6_SUBNET` + `A1_IPV6_BASE`; `enable_ipv6` đặt ở
      **cấp network** nên không phải restart Docker daemon (đo: server chạy 29.7.2).
- [x] M3.2 — `--public-ip` = IPv6 thật, `--bootstrap-ips` dạng `[addr]:9651`.
      **KHÔNG publish 9651**: container có GUA riêng nên nó tự đến được từ Internet,
      publish cổng là cơ chế của NAT và ở đây không có NAT.

      **Nghiệm thu (đọc kỹ giới hạn):** sinh thật 5 node ⇒ mỗi node một GUA
      (`…::b`…`::f`), `--public-ip` đúng GUA của chính nó, beacon vào
      `--bootstrap-ips` đúng dạng ngoặc vuông, `docker compose config` **hợp lệ**.
      Sinh lại ở chế độ mặc định và so: **0 dòng ipv6, `--public-ip` vẫn IPv4** —
      hành vi cũ không đổi một dòng nào.

      ⚠️ Đây là nghiệm thu **của bộ sinh**, không phải của mạng chạy thật: máy dev
      Windows không định tuyến được GUA nên không dựng thử được. Tín hiệu thật nằm
      ở M3.5. Và ⚠️ **áp lên mạng đang chạy KHÔNG phải hệ quả tự động** — netgen
      sinh khoá mới, chạy nó trên mạng công khai là giết mạng; phải vá tại chỗ.
- [ ] M3.3 — [human] AAAA record `bootstrap-a1.9chain.org` trên Cloudflare (**DNS-only**, không mây cam)
      🔴 **Đọc H-7 TRƯỚC**: nếu David chọn IPv4-đa-cổng thì đây là bản ghi **A**, không phải AAAA.
- [ ] M3.4 — `docs/RUN-A-NODE.md` + compose mẫu 1 node cho cộng đồng
- [ ] M3.5 — Kiểm chứng từ VPS NGOÀI: bootstrap xong + `info.peers` thấy node 9Chain-A1

**Điều kiện qua M3:** một node ở máy khác **thật sự là peer**, không phải "cổng mở".

---

## M4 — Self-serve đẻ chain (console ra công khai)

**Phụ thuộc M2.** Đây là điểm bán hàng của cả A1 mà hiện chỉ chạy qua SSH tunnel.

- [x] M4.1 — **Auth bằng chữ ký ví (SIWE); địa chỉ ký CHÍNH LÀ `admin`.** Đứng song
      song với `A1_CONSOLE_TOKEN` chứ không thay thế (token vẫn là đường của người
      vận hành + smoke test). Xem D-020, D-022.

      `GET /api/siwe/nonce?address=` → `POST /api/siwe/login {nonce, signature}` → token phiên.
      Đăng nhập bằng ví thì `admin` **bị ghi đè** bằng địa chỉ đã ký — gỡ hẳn lớp lỗi
      tệ nhất của dự án (gõ nhầm 1 ký tự ⇒ genesis bất biến ⇒ chain vô chủ vĩnh viễn).
      Thu hồi bằng ví chỉ đụng được chain của chính mình (403), token vận hành đụng được mọi chain.

      **Nghiệm thu:** `siwe-test.mjs` **21/21** (phần lớn là bài PHẢI TRƯỢT: phát lại,
      ký bằng ví khác, chữ ký của message khác, hết hạn, sai checksum, trần fail-closed)
      · `auth-e2e-test.mjs` **33/33** chạy console thật qua HTTP — **đạt cả trên máy dev
      lẫn trên server**. Mạng công khai sau khi deploy: smoke **16/16**.

      `console-deploy.sh` nay **chặn deploy nếu hai bài này trượt**, và chạy lại chúng
      trên server sau khi cài `node_modules`.
- [x] M4.2 — **Hạn mức theo địa chỉ ví.** Đăng nhập bằng ví ⇒ đếm theo `vi:<địa chỉ>`
      thay vì IP. Nghiệm thu: hai ví khác nhau **từ cùng một IP** giữ ngân sách riêng
      (bài 9 của `auth-e2e-test.mjs`, 37/37) — đúng kịch bản "cả văn phòng chung một
      IP, một người xài hết phần của tất cả". Kèm hạn mức hai tầng, xem D-022.

      🔴 **`A1_TRUST_PROXY=1` CỐ Ý CHƯA BẬT — chuyển sang M4.5.** Bật khi chưa có proxy
      là **đi lùi** về an toàn chứ không phải chuẩn bị trước: console sẽ tin header
      `X-Forwarded-For`/`CF-Connecting-IP` do chính client đặt, tức ai cũng tự khai IP
      để thoát hạn mức. Hôm nay console nghe loopback, không có Caddy phía trước.
      Chỉ bật **đồng thời** với lúc đặt reverse proxy ra trước. Console nay cảnh báo
      to nếu thấy `TRUST_PROXY=1` mà vẫn đang nghe loopback.
- [x] M4.3 — Cap tổng số chain — **HOÁ RA LÀ TRẦN CỨNG CỦA GIAO THỨC, KHÔNG PHẢI
      CON SỐ TUỲ CHỌN.** Đã chặn ở console (mặc định 15, trần tuyệt đối 16). Xem D-009.
- [x] M4.4 — **Endpoint thu hồi chain — trần 16 hết một chiều.** `POST /api/revoke`
      gỡ subnet khỏi `--track-subnets` của mọi node (rolling restart, chung hàng đợi
      với create), rồi gỡ chain khỏi danh bạ. Xem D-013…D-016.

      Xác minh ở source trước khi code, không suy đoán: trần 16 áp lên đúng danh
      sách `TrackedSubnets` gửi lúc bắt tay (`network/peer/peer.go:882`), Primary
      Network bị loại trừ tường minh (`network/network.go:208`) ⇒ **bỏ track thật
      sự trả lại chỗ**, và 16 là 16 L1 chứ không phải 15+Primary.

      Ba thứ đi kèm, không tách rời được:
      - **Chain đã thu hồi giữ chỗ `name` + `chainId` vĩnh viễn** — thu hồi không
        xoá được mạng khỏi ví người dùng, cấp lại chainId là để ví họ lặng lẽ trỏ
        vào chain của người khác (D-014).
      - **Trang `/chains/` vẽ chúng từ mảng `retired`, KHÔNG đo bằng heuristic chain
        sống** — thu hồi không rút node khỏi tập validator P-Chain nên
        `getCurrentValidators` vẫn trả đủ 5 validator cho chain đã chết (D-013).
      - **`smoke-l1.mjs --de-chain` nay tự dọn chain nó đẻ ra** (D-015).

      **Đo thật trên testnet công khai 2026-08-25, chain `Smoke7XWQ2M` — 29/29 ĐẠT:**

| | đẻ chain | thu hồi |
|---|---|---|
| thời gian | 168.9s | **162.8s** |
| gián đoạn C-Chain | 0.5s · 1/338 hỏng | **0.5s · 1/326 hỏng** |

      Thu hồi KHÔNG đắt hơn đẻ — cùng cơ chế rolling restart, cùng con số.
      Bằng chứng slot đã về: RPC chain đã thu hồi **im hẳn** (node hết định tuyến),
      danh bạ **5 → 5 L1** đúng mức trước khi chạy bài.
      Giao dịch thật trên L1 mới chốt 0.1s, block 1, `0xf4b0b992…aa5538`.
- [x] M4.5 — **CONSOLE ĐÃ CÔNG KHAI** ở `https://testnet-a1.9chain.org/console/`
      (David duyệt 2026-08-25, phiên thứ tư). H-3 đóng.

      Ba thứ làm CÙNG LÚC, và thứ tự đó là bắt buộc:
      1. Route Caddy `/console/` (`handle_path` cắt tiền tố) + `redir /console → /console/`.
      2. `A1_TRUST_PROXY=1`. Bật sớm hơn là **đi lùi**: client tự khai IP để thoát
         hạn mức. Bật muộn hơn cũng sai: hạn mức gom cả thế giới vào IP của Caddy.
      3. **Siết 443 về dải Cloudflare (M7.2)** — nếu không, ai nối thẳng vào IP máy
         chủ vẫn tự đặt `CF-Connecting-IP` được, và (2) trở thành lỗ hổng chứ không
         phải bản vá. Đã đo: trước khi siết, faucet tin đúng IP bịa.

      Trang console **tự suy đường gốc API** từ URL của chính nó, nên một bản mã chạy
      đúng ở cả hai nơi: tunnel `:8091/` (đường người vận hành, bỏ qua Cloudflare) và
      `/console/`. Cắm cứng `/api/...` sẽ làm bản công khai gọi vào gốc tên miền, rơi
      vào Blockscout, và lỗi hiện ra là *JSON parse error* chứ không phải 404.

      **Nghiệm thu từ ngoài Internet:**

| phép thử | kết quả |
|---|---|
| `/console` → `/console/` | 301 → **200** |
| `/console/whoami` | **IP THẬT của người dùng**, `trustProxy: true` |
| `POST /console/api/create` không token | **401** (không phải lỗi JSON ⇒ định tuyến đúng) |
| nối thẳng vào origin | **403** |

      🔴 Điểm thứ hai là điểm đáng giá nhất: trả IP của Cloudflare thì hạn mức gom cả
      thế giới vào một khoá, và **không có dấu hiệu nào khác cho biết điều đó**.

      🔴 **Còn lại, không phải lỗ hổng mà là giới hạn quy mô:** trần 16 L1 nghĩa là
      còn **9 suất cho toàn bộ Internet**. Console hiện "Còn N chỗ" kèm giải thích
      trần giao thức, nên người dùng biết trước chứ không phát hiện lúc bị từ chối.
      Vượt qua được chỉ bằng ACP-77 (H-2).

**Điều kiện qua M4:** một ví lạ, không có token, đẻ được chain của chính nó từ Internet.

---

## M5 — Template + precompile chọn được

`l1-evm-genesis.json` hiện cố định, chỉ thay `chainId`/`alloc`/`feeManager`.

- [x] M5.1 — **5 preset** trong `local-net/lib/presets.mjs`: `chuan` · `khong-phi`
      (minBaseFee=0) · `tu-in-tien` (native minter) · `chi-chu-deploy` (deployer
      allowlist) · `kin` (tx allowlist).

      **Tên khoá JSON và địa chỉ precompile lấy TỪ SOURCE subnet-evm**
      (`precompile/contracts/*/module.go`), không gõ theo trí nhớ — subnet-evm **bỏ
      qua khoá lạ trong im lặng**, nên gõ sai một chữ là chain ra đời thiếu đúng thứ
      người dùng chọn mà không lỗi, không cảnh báo.

      Hai luật cứng: (1) chủ chain là admin của MỌI precompile được bật — bật mà
      không ai quản được là đẻ ra công tắc không ai bấm được, genesis thì bất biến;
      (2) không preset nào được làm chain không giao dịch nổi. Nguy hiểm nhất là
      `kin`: chủ chain không nằm trong allowlist ⇒ **không ai gửi được giao dịch
      nào, vĩnh viễn** (sửa allowlist cũng cần một giao dịch). Đã kiểm ở source chứ
      không tin trực giác: `precompile/allowlist/role.go:51` — `IsEnabled()` trả true
      cho AdminRole ⇒ để chủ chain vào `adminAddresses` là đủ.
- [x] M5.2 — Ô chọn kiểu chain trên console (**danh sách do server cấp**, không cắm
      cứng ở client), mô tả hiện ngay dưới ô chọn vì genesis bất biến — người dùng
      chỉ có đúng một lần đọc. Danh bạ `/chains/` hiện "Kiểu chain"; chain đẻ trước M5
      thiếu khoá `preset` ⇒ hiện "Chuẩn", không để `undefined` lọt ra.
- [x] M5.3 — Đẻ thật mỗi preset 1 chain, gửi giao dịch thật chứng minh preset có hiệu lực
      → `local-net/faucet/preset-test.mjs` (đẻ → thử → **tự thu hồi**, nhờ M4.4).

      **ĐẠT 40/40 trên mạng công khai, 2026-08-25 (phiên thứ tư)** — 4 chain thật
      (9117–9120), mỗi chain một preset, mỗi chain **tự thu hồi** sau khi thử xong
      nên bài chạy lại được vô hạn. Danh bạ trả về đúng 6/15 sau mỗi lượt.

| preset | bằng chứng preset CÓ hiệu lực |
|---|---|
| `khong-phi` | baseFee **1 wei** · tx giá gas 1 wei chốt ở block 1 · phí thật **21.000 wei** |
| `tu-in-tien` | đúc **777 token từ hư không** cho một ví lạ, số dư đọc lại đúng 777.0 |
| `chi-chu-deploy` | chủ chain deploy được; ví lạ **có tiền** vẫn bị chặn deploy, nhưng **vẫn gửi được giao dịch thường** |
| `kin` | chủ chain giao dịch được (Admin bao hàm Enabled); ví lạ **có tiền** bị chặn hoàn toàn |

      Hai điều kiện bị chặn đều nghiệm thu bằng **ví đã được nạp tiền trước** —
      không có bước đó thì "bị từ chối" và "hết tiền" trông giống hệt nhau, và bài
      kiểm sẽ xanh vì lý do sai.

      B-3 (`khong-phi` không chốt được giao dịch) gỡ bằng D-028; B-4 (ba lỗi của
      chính bài kiểm) gỡ bằng D-029.
- [x] M5.4 — 🔴 **Giao dịch ĐẦU TIÊN của chain mới hỏng vì ước lượng gas thiếu** (D-025).
      **Đã chọn hướng và làm xong.** Console KHÔNG tự gửi giao dịch mồi — hướng đó
      chết ở một câu hỏi mà nó giấu bên trong: *server lấy tiền ở đâu?* Genesis chỉ
      cấp phát cho `admin` (ví người bấm nút), nên muốn server gửi được thì phải
      cấp thêm cho một địa chỉ của Foundation **vĩnh viễn trong genesis bất biến** —
      phá đúng tính chất `OwnerTest` đã đo (quỹ Foundation: 0, vai None). Xem D-030.

      Thay vào đó `POST /api/create` trả kèm `luuY`, console vẽ ngay dưới kết quả:
      đừng tin ước lượng gas cho giao dịch đầu, và **cách rẻ nhất mở block 1 là một
      giao dịch chuyển tiền thường** (21.000 gas là hằng số EVM ⇒ không cần ước
      lượng ⇒ không dính bẫy). Chữ nằm ở **một chỗ** (server), UI chỉ vẽ lại.

      **Nghiệm thu trên mạng công khai:** 4/4 lượt đẻ chain thật đều có trường
      `luuY` trong đáp án (bài `preset-test.mjs` kiểm ngay tại chỗ gọi `/api/create`).

---

## M6 — Warp/ICM cross-L1

Demo mạnh nhất của A1; tiêu chí "Interop" đang tự chấm 3/5 trong dashboard.

- [x] M6.1 — Bật Warp precompile trong genesis template. **Vào KHUÔN, không làm preset**
      — ICM đòi cả hai đầu có Warp, để nó thành lựa chọn là đẻ ra những cặp chain
      không bao giờ nói chuyện được với nhau, mà genesis bất biến (D-031).

      **Nghiệm thu trên chain thật 9125:** `getBlockchainID()` trả
      `0xcb6347a337236e48…`, và **`sendWarpMessage` là giao dịch THẬT chốt ở block 2
      với 1 log** — thay đổi trạng thái quan sát được, không phải "gọi được thì coi
      là bật".

      🔴 **Lượt đo đầu báo "Warp TẮT" và đó là PHÉP ĐO SAI, không phải cấu hình sai.**
      Đáng ghi vì nó là một họ bẫy mới: precompile khai `blockTimestamp > 0` thì ở
      **block 0 nó chưa hoạt động**, và `eth_call` lúc đó trả `0x` rỗng —
      **không phân biệt được với "khoá cấu hình bị bỏ qua"**, đúng trạng thái mà cả
      mốc M5 sinh ra để chống. Bài kiểm nay đọc **hai lần** (trước và sau khi mở
      block 1) và báo cáo chênh lệch, nên lần sau nó tự phân biệt hộ.

      **Đã đọc source trước khi code (2026-08-25, phiên thứ tư) — hai điều phải biết:**

      1. **Warp TỪ CHỐI bật trước Durango.** `precompile/contracts/warp/config.go:93`
         → `errWarpCannotBeActivated`. Nghe như việc chặn, nhưng KHÔNG phải:
         networkID 9001 không phải Mainnet/Fuji ⇒ `upgrade.GetConfig` trả `Default`,
         ở đó `DurangoTime = InitiallyActiveTime` (2020-12-05) ⇒ **Durango bật sẵn**.
         🔴 Kéo theo: gotcha trong HANDOFF *"L1 EVM chưa bật Durango → compile
         evmVersion:'paris'"* **có vẻ là SAI**. Đã cắm phép đo PUSH0 (`0x5f5ff3`)
         vào `preset-test.mjs` để kết luận bằng chain thật thay vì bằng đọc code.

      2. 🔴 **`warpConfig.blockTimestamp: 0` sẽ TRƯỢT verify** — và đây là chỗ dễ
         mất hàng giờ. Mọi precompile khác trong `presets.mjs` dùng
         `blockTimestamp: 0` và chạy tốt, nên phản xạ tự nhiên là làm y hệt. Nhưng
         Warp kiểm `IsDurango(c.Timestamp())`, tức so mốc bật Warp với mốc Durango
         = **1607144400**, chứ không so với "genesis". `IsDurango(0)` là **false**.
         Phải đặt `blockTimestamp` ≥ 1607144400.
      - Tham số: `quorumNumerator` — 0 nghĩa là dùng mặc định 67; nếu khai thì phải
        trong khoảng 33…100. `requirePrimaryNetworkSigners`: bool.
      - Quyết định còn treo: bật cho **mọi** chain (template) hay làm một preset?
        Nghiêng về template — ICM đòi CẢ HAI đầu có Warp, nên để nó thành lựa chọn
        là đẻ ra những cặp chain không nói chuyện được với nhau, mà genesis bất biến.
- [x] M6.2 — **Chuyển tài sản giữa 2 L1 — XONG, đo trên mạng công khai 2026-08-25.**
      Hai bài, **21/21** và **20/20** ĐẠT. Cả hai tự thu hồi cả hai chain ⇒ chạy lại
      được vô hạn. Cách chọn: D-034 (vì sao KHÔNG dựng ICTT).

      **Việc chặn thật nằm ở cấu hình, không ở hợp đồng: API Warp TẮT MẶC ĐỊNH.**
      `plugin/evm/vm.go:1179` chỉ đăng ký namespace `warp` khi `WarpAPIEnabled`, mà
      `plugin/evm/config/config.go:38` không đặt mặc định ⇒ giá trị zero của Go ⇒
      **false**. Đã đo trên chain thật: chain đẻ trước thay đổi này trả
      **`-32601 the method warp_getMessage does not exist/is not available`**.

      Đường đã làm: netgen + compose khai `--chain-config-dir=/9chain-a1/config/chains`
      (thư mục `9chain-a1-config` vốn đã mount ro vào cả 5 node), console ghi
      `chains/<blockchainID>/config.json` **NGAY TRƯỚC** đợt rolling restart — node
      đọc file đó đúng lúc dựng chain, tức trong chính đợt restart ấy, nên ghi muộn
      một nhịp là cả 5 node dựng chain với cấu hình mặc định.

      **Bước 1 — `warp-test.mjs`, 21/21:** message đi từ L1 nguồn sang L1 đích và
      **được xác minh** (block 3, gas 162.460). Chữ ký tổng hợp 200 byte, predicate 7 khối.

      **Bước 2 — `bridge-test.mjs`, 20/20:** tài sản thật sự chuyển, đo bằng **bốn số dư**:

| | trước | sau |
|---|---|---|
| hợp đồng cầu ở chain NGUỒN | 0,0 | **7,0** (đã khoá) |
| người nhận ở chain ĐÍCH (ví trắng) | 0,0 | **7,0** |
| thanh khoản cầu ở chain ĐÍCH | 100,0 | **93,0** |
| gas lượt nhận | | 219.012 |

      Bằng chứng hai đầu: khoá `0xe02010cc…5ffe02` (chain 9135) · nhận
      `0x9f23489d…5ef337` (chain 9136).

      **Ba bài PHẢI ĐỎ, cả ba revert đúng** — không có chúng thì "status 1" không
      chứng minh gì: phát lại đúng message · khai sai hợp đồng nguồn · bỏ predicate.
      Kèm phép đo cuối: sau ba lượt bị chặn, số dư người nhận **vẫn đúng 7,0**.

      🔴 **Còn lại, cần David biết — KHÔNG chặn mốc này:**
      - **API Warp công khai được từ Internet.** Caddy lọc theo **path** chứ không
        theo **method**, mà `/ext/bc/*/rpc` đã được cho phép ⇒ ai cũng gọi được
        `warp_getMessageAggregateSignature` trên L1 bất kỳ. Gom chữ ký là thao tác
        đắt (một vòng P2P tới 5 validator), nên đây là **điểm khuếch đại tải**.
        Và chú thích đầu Caddyfile ghi *"LỌC PATH + hạn mức"* trong khi **không có
        directive hạn mức nào** cho tên miền RPC — chữ và thực tế đã lệch từ trước.
      - **Hai chain có sẵn (OmegaChain, OwnerTest) vẫn TẮT API Warp** — thay đổi chỉ
        áp cho chain đẻ từ giờ. Bật cho chúng là ghi hai file config rồi chờ lượt
        restart kế tiếp; chưa làm vì chúng không thuộc mốc này.
      - `CauTaiSan.sol` là **bản chứng minh cơ chế, không phải cầu sản xuất** — cố ý
        thiếu quản trị, tạm dừng khẩn cấp, hạn mức, phí, đường rút thanh khoản.

      ⚠️ Bài kiểm cần **2 slot L1 cùng lúc** trong trần 15.

---

## M7 — An toàn vận hành (làm xen kẽ)

- [x] M7.1 — `console-chains.json` ghi qua file tạm + rename, giữ `.bak`.
      Ghi thẳng mà tiến trình chết giữa chừng là còn lại JSON cụt → `loadState()`
      bắt lỗi rồi trả `{chains:[]}`, tức **danh bạ rỗng trông như hợp lệ**, và lượt
      tạo kế tiếp ghi đè lên đó. Đã kiểm: mount của nó là **thư mục** nên `rename`
      không dính bẫy inode (khác `chains-nginx/default.conf` — mount file đơn lẻ,
      sửa file đó phải `cp` chứ không `mv`).
- [x] M7.5 — Kiểm chứng hạn mức faucet nhìn đúng IP người dùng:
      `/faucet/whoami` → `{"ip":"2.49.67.2","trustProxy":true}` — IP thật, không phải
      IP Cloudflare. Hạn mức faucet lành mạnh, không cần sửa.
- [x] M7.2 — **Siết 443 về dải Cloudflare — XONG, đo được cả hai chiều.** Xem D-032.

      🔴 **Không phải việc dọn dẹp: nó vá một lỗ ĐANG MỞ.** Đo trước khi vá — nối
      thẳng vào IP máy chủ kèm header giả thì `/faucet/whoami` trả
      `{"ip":"1.2.3.4","trustProxy":true}`, tức **hạn mức faucet công khai vượt qua
      được** bằng cách xoay IP giả. `A1_TRUST_PROXY=1` bảo dịch vụ tin
      `CF-Connecting-IP`; Cloudflare ghi đè header đó ở biên nên qua Cloudflare thì
      không giả được — **nhưng không đi qua Cloudflare thì không ai ghi đè cả**.

      Làm ở **tầng Caddy** (`remote_ip`), không phải ufw — gỡ lại được trong vài
      giây và có `caddy validate` chạy trước khi chạm server (D-032 ghi vì sao ufw
      chưa làm, và vì sao nó vẫn sẽ chạy thật khi làm: Caddy dùng `network_mode: host`).

      **Đo:** nối thẳng vào origin **200 → 403** (cả hai tên miền) · giả header
      **tin IP bịa → 403** · qua Cloudflare **200 → 200** (trang chủ, faucet,
      chains, RPC) · `/faucet/whoami` trả **IP thật** của người dùng.
      Dải IP lấy bằng script từ `cloudflare.com/ips-v4`+`ips-v6` (22 dải),
      **không gõ tay**.

      Kèm `check-ports.sh` **tầng 4 + tầng 5**: tầng 4 tách *cổng có mở* (vẫn mở, TCP
      vẫn bắt tay) khỏi *origin có phục vụ người ngoài Cloudflare* (phải 403) —
      không tách thì bản vá trông như vô hiệu; tầng 5 so dải trong Caddyfile với
      bản chính chủ, vì Cloudflare thêm dải mới sẽ gây triệu chứng **"một số người
      vào được, một số không"**, gần như không đoán ra nếu không nghi đúng chỗ.

      Còn lại (không chặn): ufw như lớp thứ hai — làm cùng cửa sổ bảo trì có người trực.
- [ ] M7.3 — `/api/metrics` cho dashboard + 9Scan-A1 (chờ 9Scan chốt yêu cầu ở KICKOFF của họ)
- [x] M7.4 — `C:\PROJECTS\MetaChain` đã không còn tồn tại (kiểm 2026-08-25, `ls` báo
      No such file or directory). Không cần xoá gì.

---

## M8 — Fork tự đứng được (mở khoá 2026-08-25 khi B-1 được gỡ)

**Vì sao thành mốc riêng:** kiểm kê ngày 2026-08-25 cho thấy lớp chủ quyền chỉ là
**~139 dòng sửa avalanchego** trên 7 file (1266 dòng còn lại trong diff là công cụ
vận hành `9chain-a1-tools/`, không phải chain). Patch mỏng là **điểm mạnh** — nó giữ
cho fork rebase được. Nhưng cả ba đường sống của một fork mỏng đều **chưa từng chạy
lần nào**: chưa build lại, chưa chạy test, chưa rebase thử. Trước khi chạy được ba
thứ đó, mọi khẳng định về độ bền của fork đều là suy đoán.

Docker Desktop đã lên lại (B-1 gỡ, 2026-08-25) — đây là lúc làm.

- [x] M8.1 — Build image từ cây đã commit (= M0.6) — **xong, tái lập từng byte**
- [x] M8.2 — **Test các gói fork có chạm — 6 lỗi, TẤT CẢ là hệ quả có chủ đích của
      việc đổi tên, KHÔNG có lỗi logic nào.** Xem D-018.

| gói | kết quả |
|---|---|
| `config`, `config/node`, `utils/constants` | ✅ xanh |
| `genesis` | ❌ 5 lỗi — hash genesis mainnet/fuji/local đổi + `TestAVAXAssetID` |
| `version` | ❌ 1 lỗi — `TestApplicationString` đòi `avalanchego/x.y.z` |

      **Thí nghiệm tách bạch (đây mới là phần đáng giá):** hoàn nguyên **đúng 4 chuỗi
      identity** trong container, **giữ nguyên toàn bộ logic A1** (`A1NetworkID` ở
      `config.go:811,882` + `params.go:65,80`, cả `genesis_9chain_a1.go`) → **cả 4 gói
      xanh hết**. Nên 6 lỗi kia quy 100% về việc đổi tên, và phần logic chủ quyền —
      thứ thật sự có thể sai — **không làm hỏng test nào**.
- [x] M8.3 — **Nền toàn bộ `go test ./...` — 220 xanh · 204 không có test · 7 đỏ.**
      Fork chỉ chịu trách nhiệm **2 trong 7**, và cả 2 đều là đổi tên. Xem D-019.

| gói đỏ | nguyên nhân | của ai |
|---|---|---|
| `genesis` | hash genesis + `TestAVAXAssetID` đổi do đổi tên token | **fork** (chủ đích) |
| `version` | `TestApplicationString` đòi `avalanchego/x.y.z` | **fork** (chủ đích) |
| `x/blockdb` | `TestWriteBlock_Errors/writeBlockAt_-_failed_to_get_data_file` | upstream |
| `vms/saevm/sae` | ~10 test RPC (`TestGetLogs`, `TestFilterAPIs`, …) | upstream |
| `tests/e2e`, `tests/fixture/bootstrapmonitor/e2e`, `tests/upgrade` | `Ran 0 of 18 Specs — A BeforeSuite node failed` | cần mạng thật, không phải unit test |

      **Cách quy trách nhiệm — không đoán:** chạy lại đúng 2 gói `x/blockdb` và
      `vms/saevm/sae` với identity **hoàn nguyên về upstream** → **vẫn đỏ y hệt**.
      Nên chúng là nền có sẵn của upstream, fork không đụng tới.

      ⚠️ `vms/saevm/sae` **không ổn định**: đỏ sau 45.5s trong lượt chạy toàn bộ,
      nhưng **treo tới hết timeout 600s** khi chạy riêng. Đừng đuổi theo nó.
- [x] M8.4 — **Diễn tập rebase — ĐẠT, nhưng đọc kỹ giới hạn.** `scripts/rebase-drill.sh`
      (mới): worktree tách rời → `git am` 4 patch lên upstream mới → kiểm 7 điểm chủ
      quyền → dọn → **chốt chặn cuối xác nhận nhánh `9chain-a1` không đổi hash**.

      Chạy thật lên `origin/master` (`0eb8166`): 4/4 patch áp sạch, **7/7 điểm chủ quyền
      còn nguyên** (gồm 2 điều kiện `A1NetworkID` ở `config.go` và 2 nhánh `case` ở
      `params.go` — đúng thứ `genesis_9chain_a1.go` dặn phải kiểm). Cây sau rebase lệch
      so với nhánh thật **đúng bằng nội dung commit upstream mới**, không có gì trôi.

      ⚠️ **Giới hạn phải nói rõ:** lúc thử, upstream mới **chỉ có 1 commit** và nó chạm
      `vms/saevm/` — vùng patch ta không đụng tới. Nên đây chứng minh **cơ chế chạy**,
      chưa chứng minh **chịu được xung đột**. Tín hiệu thật nằm ở lần upstream tái cấu
      trúc `config/config.go` hoặc `genesis/`. Script đã in cảnh báo này ở cuối để lần
      sau không ai đọc nhầm "đạt" thành "an toàn vĩnh viễn".

      **KHÔNG dùng `apply-sovereign.sh` để diễn tập** — script đó kết thúc bằng
      `git branch -f 9chain-a1 HEAD`, tức là ghi đè nhánh thật.

**Điều kiện qua M8:** ✅ **ĐẠT cả 4/4** (2026-08-25). Dựng lại được binary — và nó
**trùng từng byte** với bản đang chạy công khai. Biết chắc fork chỉ làm đỏ 2 gói, cả
hai đều do đổi tên. Đã đi qua đường rebase và biến nó thành script chạy lại được.

**Câu trả lời cho "fork hoàn thiện chưa" sau M8:** ba lỗ hổng nêu ra sáng nay đã bịt.
Còn lại **không phải chuyện fork** mà là chuyện kiến trúc sản phẩm: subnet cổ điển,
trần 15 L1, ACP-77 (H-1/H-2).

**KHÔNG thuộc M8** (đã cân nhắc và loại): xoá nốt dấu vết upstream ở lớp vận hành —
env prefix `avago` (`config/viper.go:18`), thư mục dữ liệu `~/.avalanchego`
(`config/flags.go:46`), `DEFAULT_VM_NAME="subnet-evm"`, module path `ava-labs/avalanchego`,
81 file `.go` còn chuỗi `AVAX`. Người dùng cuối không thấy chúng, còn sửa thì làm patch
chủ quyền dày lên — đúng thứ giết fork lúc rebase. Đổi lấy cái không ai nhìn thấy.

---

## M9 — Đo năng lực chain bằng tải thật (David yêu cầu 2026-08-25)

`local-net/faucet/load-test.mjs` — bơm tải lên **một L1 riêng**, không phải C-Chain.

- [x] M9.1 — Bộ bơm tải + chốt an toàn. Tự ngắt nếu C-Chain công khai hỏng 3 lượt
      liền, hoặc chậm >4s trong 5 lượt liền, hoặc đĩa còn <15%.

      ⚠️ **L1 riêng KHÔNG cô lập được CPU** — L1 và C-Chain chạy trong **cùng 5 tiến
      trình node**. Cái tách được là Blockscout (nó không index L1). Vì vậy chốt an
      toàn là bắt buộc, không phải trang trí.

      Bài báo cáo tách **gửi đi** khỏi **chốt vào block**: "gửi được bao nhiêu mỗi
      giây" là năng lực của cái script, không phải của chain.
- [x] M9.2 — **Đo thật, 20 ví, 3 phút:**

| | |
|---|---|
| Chốt vào block | **173,8 TPS** (31.600 giao dịch) |
| Gửi đi | 32.240 · **0 lỗi** |
| Block | 347 giao dịch/block · 2,0 giây/block |
| C-Chain công khai | p50 **72ms** · p95 113ms · xấu nhất 196ms · **hỏng 0/33** |
| Đĩa | **0,24 MB/s** khi đang tải ≈ 0,9 GB/giờ |

- [x] M9.3 — **Trần TPS là THAM SỐ GENESIS, không phải giới hạn phần cứng.** Nâng
      lên 60 ví chỉ đưa 174 → ~258 TPS (tăng 3× số ví, TPS tăng 1,45×) ⇒ đã gần trần.
      Trần đó tính ra được từ chính genesis:
      ```
      gasLimit 12.000.000 ÷ 21.000 gas/tx = 571 tx/block
      571 ÷ 2 giây (targetBlockRate)      = 285 TPS lý thuyết
      đo được 252–264 TPS                 = 90% trần
      ```
      Trong khi máy chủ ở **load 2,92/8 luồng (~36%)**. Muốn nhanh hơn thì **nâng
      `gasLimit` trong genesis**, không cần thêm phần cứng.
- [x] M9.6 — **Đợt ngắn có kiểm soát trên C-CHAIN để explorer có dữ liệu thật**
      (David duyệt 2026-08-25). 3 phút · 50 TPS · 10 ví · `--c-chain --tps 50`.

| | trước | sau |
|---|---|---|
| Block C-Chain | **9** | **113** |
| Giao dịch explorer index | ~0 | **9.004** |

      Đo được: **48,0 TPS chốt** · 8.975 gửi **0 lỗi** · RPC công khai p50 **19ms**,
      xấu nhất 42ms, **hỏng 0/35** · **Blockscout chậm trung bình 0,3 block** (bám kịp
      thời gian thực) · đĩa vẫn 92% trống.

      **Chi phí ròng ~0,0000000004 LOVE9**: nạp 10 LOVE9 cho ví gửi rồi **quét trả lại
      9,999999999622** — ví gửi là ví dùng một lần, không quét lại là mất vĩnh viễn,
      mà trên C-Chain đó là quỹ THẬT chứ không phải tiền chơi như trên L1 đo tải.

      **Hai tải chạy chồng nhau không hại nhau:** lúc đó L1 vẫn đang bơm ~260 TPS,
      cộng 48 TPS trên C-Chain ⇒ ~308 TPS tổng, RPC công khai vẫn 13–62ms. Đây là
      dữ liệu tốt hơn tôi dự đoán — tôi từng cảnh báo hai tải dùng chung CPU sẽ đá
      nhau; ở mức tải này thì không.
- [x] M9.4 — Preset **"thông lượng cao"** + **ĐO XONG trần**. Kết quả **đính chính
      M9.3**, xem D-033.

      Preset: `gasLimit` 12M → **60M**, `targetGas` 60M → **300M** (giữ tỉ lệ 5× của
      khuôn gốc — nâng gasLimit mà quên `targetGas` là chain vừa dùng hết công suất
      mới đã bị coi là "trên mức mục tiêu" và thuật toán phí **tự đẩy baseFee lên**).
      Kèm: `createChain` đồng bộ `gasLimit` ở gốc genesis từ `feeConfig` — subnet-evm
      đòi hai chỗ bằng nhau (`core/genesis.go:456`).

      🔴 **KẾT QUẢ: nâng trần genesis 5 lần KHÔNG nâng thông lượng.**

| chain | trần genesis lý thuyết | TPS đo được | block đầy |
|---|---|---|---|
| `chuan` 12M (M9.3) | 285 | 252–264 | gần đủ |
| `thong-luong-cao` 60M | **1.428** | **207–230** | **~16%** |

      Bậc thang 20→60→150→300→600 ví: **155 → 205 → 223 → 226 → 207** (giảm ở bậc
      cuối). Đã loại trừ đường truyền (bơm qua Cloudflare vs thẳng `127.0.0.1:9650`:
      **như nhau**) và gộp lô của ethers (**như nhau**) — cả hai đều là giả thuyết
      của tôi và cả hai đều sai.

      **Nút thắt: đường NẠP GIAO DỊCH CỦA NODE, ~230 tx/s.** Hai dấu hiệu đi cùng
      nhau chỉ ra điều đó: nhịp block đứng **đúng 2,0s ở mọi mức tải** (khâu dựng
      block không đuối) và block **không bao giờ đầy** (lúc dựng, mempool không có
      thêm giao dịch) ⇒ nghẽn nằm TRƯỚC mempool.

      🔴 **Phát hiện vận hành đắt nhất:** tăng tải không thành thông lượng mà thành
      **độ trễ cho người dùng thật** — p50 C-Chain **công khai**: 22ms → 236ms →
      1.720ms → **3.852ms**. Xác nhận cảnh báo M9.1 (L1 không cô lập được CPU).
      ⇒ Đã hạ `NGUONG_CHAM_MS` **4000 → 1500**: ở 3.852ms chốt an toàn **không nổ**
      vì 3.852 < 4.000, tức ngưỡng cũ được đặt cao tới mức không bao giờ bắt được
      đúng thứ chú thích của nó mô tả.

      **Hệ quả sản phẩm:** preset này **không** làm chain nhanh hơn ở mức tải hôm nay,
      nó chỉ mở trần cho tương lai. `moTa` giữ đúng lời hứa: *"gấp 5 lần số giao dịch
      mỗi block"*, **không** hứa gấp 5 lần TPS.

      **Còn chưa đo tới đáy:** nút thắt phía node là gì (phục hồi chữ ký? validate?
      chèn mempool?) và nó có mở được không. Cần nhiều tiến trình gửi độc lập +
      đo CPU từng tiến trình node, không phải một script Node duy nhất.
- [ ] M9.5 — [human] Có đưa số liệu này lên trang công khai không, và dưới dạng nào.
      **Khuyến nghị:** một **nhịp tim** chậm (1 giao dịch/10–60 giây, từ địa chỉ đặt
      tên rõ) để chiều cao block nhúc nhích — C-Chain công khai hiện mới ở **block
      thứ 9**, người lạ mở trang sẽ tưởng chain chết. Cộng với **bài đo theo yêu
      cầu** có nhãn rõ ràng. **KHÔNG** bơm giao dịch tự sinh liên tục rồi trình bày
      như hoạt động thật: vừa là bịa số liệu, vừa phản tác dụng — một máy đếm
      "9 TPS" chạy vĩnh viễn làm chain trông chậm hơn thực tế 30 lần.

---

## M10 — Giao diện người dùng (kế hoạch đầy đủ: `docs/UI-PLAN.md`)

**Vì sao thành mốc riêng:** đếm thật trên 4 trang HTML viết tay (963 dòng) —
**0 điểm ngắt responsive · 0 dark mode · 0 vòng focus** trên cả bốn. Trong khi
9Scan-A1, trang người dùng bấm sang ngay sau đó, có đủ cả ba. Hai bề mặt của cùng
một sản phẩm lệch nhau ở đúng thứ nhìn thấy đầu tiên.

🔴 **KHÔNG thiết kế mới.** 9Chain **đã có** hệ token (navy/gold, tương phản đã sửa
đạt AA kèm lý do, dark mode wire thật) sống trong `9Scan-A1/app/globals.css`, tự nhận
là "nguồn sự thật duy nhất". Việc của M10 là **dọn 4 trang viết tay về đúng hệ đó**.
Vẽ một hệ thứ hai là tự tạo ra đúng sự thiếu nhất quán mà mốc này sinh ra để xoá.

Ranh giới: A1 làm **bề mặt GHI** (đẻ chain, faucet, trang chủ, dashboard);
**9Scan-A1 làm phần đọc**, gồm cả danh bạ `/chains/` (họ đang làm — trang cũ của A1
sẽ bị THAY, không nâng cấp). 🔴 Ví X/P `:8090` **không có UI công khai trong mọi
phương án** — nó giữ khoá và không có auth.

✅ **David đã chốt 2026-08-25:** (1) **Next xuất tĩnh** — không dùng đường lui
zero-build; (2) **trang chủ nhắm "người muốn có chain riêng"**, tức lấy *đẻ chain*
làm trung tâm.
🔴 **Hệ quả của (2):** trang chủ đó gắn chặt vào **H-3** — console hôm nay chỉ nghe
loopback, nên nút chính sẽ hứa một thứ chưa bấm được từ Internet. Chọn đối tượng này
là tín hiệu mạnh rằng M4.5 nên mở, **nhưng không thay David quyết H-3** (đưa endpoint
GHI tiêu tiền thật ra Internet là quyết định an toàn). ⇒ **M4.5 nay là việc `[human]`
có thứ tự cao nhất.** Trong lúc chờ: nút chính trỏ vào trang "đang mở dần" thu ví.

- [x] M10.1 — **Dựng `web/` — XONG 2026-08-25, đủ cả ba điều kiện qua.**

| điều kiện qua | kết quả |
|---|---|
| build tĩnh chạy | ✅ `pnpm build` → `out/` (3 trang) |
| axe-core sạch | ✅ **3/3 trang**, đo trên HTML THẬT đã xuất, không phải bản render giả |
| token khớp bản 9Scan | ✅ vân tay `535cbf6329efb6d0`, có test bắt trôi lệch |

      Kèm: `pnpm test` **12/12** · `pnpm typecheck` sạch · ngân sách JS
      **149,7 KB gzip / trần 160** (trang nặng nhất).

      **Không thiết kế mới** — `web/app/tokens.css` sinh bằng
      `web/scripts/sync-tokens.mjs` từ `9Scan-A1/app/globals.css`. Băm **khối
      token** chứ không băm cả file: 9Scan sửa animation/layer liên tục, băm cả file
      thì phép đo kêu tới lúc không ai nghe nữa.

      Có: khung (`SiteHeader`/`SiteFooter`, ngăn kéo mobile, Esc trả tiêu điểm về
      nút), `ThemeScript` đặt `data-theme` **trước khung hình đầu** (không chớp
      trắng), bộ `components/ui` tự viết (không shadcn/MUI/Radix), i18n vi-first
      (`lib/i18n/vi.ts`) + test chặn chuỗi viết thẳng vào JSX, `lib/eip55.ts` +
      test đối chiếu 200 vector với bản `.mjs` đang chạy trên server.

      🔴 **Ba phép đo tôi cố ý đặt khác thói quen, vì thói quen ở đây đo sai:**
      - **axe chạy ở `postbuild` trên `out/**.html`**, không trong vitest. Dự án này
        đã trả giá nhiều lần cho việc nghiệm thu thứ mình dựng thay vì thứ thật sự
        được phục vụ. ⚠️ Giới hạn: đây là ảnh chụp TĨNH trước hydrate — không bắt
        được trạng thái sau tương tác. "axe sạch" ≠ "a11y xong".
      - **Tắt `color-contrast` trong axe**: jsdom không có layout engine nên nó cho
        cả dương tính giả lẫn âm tính giả. Tương phản được bảo đảm ở tầng TOKEN.
      - **Ngân sách JS đo theo TỪNG TRANG, sau khi gzip.** Hai cách đo sai đã thử và
        bỏ: cộng mọi file trong `chunks/` (ra 800 KB — không ai tải chừng đó) và đo
        chưa nén (cao gấp ~5 lần thứ đi qua đường truyền).
- [x] M10.2 — **Faucet — XONG 2026-08-25, đã xin token THẬT trên mạng công khai.**

      Nghiệm thu bằng trình duyệt thật ở **khổ điện thoại 375×812, qua Cloudflare**
      (không phải `curl`: trang render bằng JS): gõ địa chỉ → bấm gửi →
      **`Đã gửi 10 LOVE9`**, và đối chứng trên chain: `eth_getBalance` của ví trắng
      `0x1eC3A1…459C` = **10,0 LOVE9**. Hạn mức trên màn tự đi **5/5 → 4/5**.
      ⚠️ Là **giả lập thiết bị di động**, không phải máy điện thoại vật lý.

      Đo thêm ở 380px: **không tràn ngang**, kể cả khi ép **chữ lớn 1,25×**; không
      phần tử bấm được nào lọt ra ngoài khung. Nền tối wire thật
      (`data-theme=dark` → nền `#0a1122`, chữ `#e9eefa`). Ngăn kéo mobile: mở/đóng
      đúng, `aria-expanded` đổi theo, **Esc đóng và trả tiêu điểm về nút**.

      **HTML đã ra khỏi chuỗi JS.** `faucet/server.mjs` nay chỉ còn API; đường `/`
      trả một tấm biển chỉ chỗ. Trả HTML ở hai nơi là hai bản sẽ trôi lệch, và bản
      trôi lệch sẽ là bản người dùng thật nhìn thấy.

      **Mới: `GET /api/thongtin` — hạn mức hiện TRƯỚC khi bấm.** Trước đó người dùng
      chỉ biết mình hết suất **sau khi** đã điền địa chỉ và ăn lỗi 429.
      🔴 Nó dùng `rateLimit(...).peek()` (mới, trong `lib/guard.mjs`) chứ KHÔNG gọi
      hàm kiểm: gọi hàm kiểm là **tiêu một suất**, tức mỗi lần mở trang lại mất một
      lượt và người dùng hết suất mà chưa xin được gì.

      **Caddy tách hai đường** (`local-net/deploy/Caddyfile`): `/faucet/api/*`,
      `/faucet/whoami`, `/faucet/health` → tiến trình node; `/faucet/*` và
      `/_next/*` → container tĩnh `9chain-a1-web` (nginx, `127.0.0.1:8095`).
      Deploy + tự nghiệm chứng: `bash local-net/deploy/web-deploy.sh`.

      Trang chủ mới xem trước ở **`/moi/`** — gốc `/` vẫn là Blockscout, đổi gốc là
      việc của M10.3 (cần David chọn biến thể).
- [x] M10.3 — **XONG. David chọn BẢN C ngày 2026-08-26, và nó đã chiếm gốc `/`.**

      Bản C dẫn bằng **bằng chứng trước, lời mời sau**: cho thấy L1 có thật đang
      chạy, có chủ thật, rồi mới mời đẻ chain. Hai bản còn lại (A — dẫn bằng lời
      hứa; B — đặt thẳng ô đặt tên lên trang chủ) và `components/ThanhChon.tsx`
      **đã gỡ khỏi mã nguồn** — để cả ba lại sau khi đã chốt là để một bộ điều khiển
      nội bộ nằm trên trang chủ công khai. Lịch sử nằm trong git (commit `4ed0b01`).

      🔴 **Gốc `/` KHÔNG còn là Blockscout.** Caddy khớp **đúng `/`** chứ không phải
      `/*`: Blockscout dùng rất nhiều đường dẫn ở gốc (`/tx/…`, `/address/…`,
      `/blocks`, `/api/…`) và **tất cả vẫn chạy** — chỉ riêng trang chủ trần đổi chủ.
      Viết `/*` ở đó là nuốt luôn cả explorer. Đã đối chứng sau khi đổi: `/blocks`
      vẫn trả về HTML của Blockscout (76 KB, có chuỗi "Blockscout").
      **Gỡ nhanh nếu cần:** xoá khối `@trangchu` trong Caddyfile rồi `caddy reload`.

      **Điểm yếu đã biết của bản C, ghi lại để không ai ngạc nhiên:** nó mạnh dần
      theo số chain trong danh bạ, mà hôm nay danh bạ đang **vắng** (2 L1, cả hai của
      hệ thống). Vì thế trạng thái rỗng của bảng viết như một **lời mời** ("bạn sẽ là
      người đầu tiên"), không phải một ô trống.

- [~] M10.4 — **Màn đẻ chain — phần mềm XONG; còn một việc chỉ người thật làm được.**

      **Việc chặn đã gỡ: console nay có `GET /api/tien-trinh`.** Trước đó `/api/create`
      chỉ trả nhật ký `restart` **sau khi xong**, tức đúng lúc không còn ai cần nó.
      Endpoint mới cố ý rẻ — không chạm docker hay RPC, chỉ trả lại thứ đã ghi sẵn
      trong bộ nhớ, vì giao diện gọi nó mỗi 2 giây suốt ~170 giây.

      **Nghiệm thu phía SERVER — đẻ một chain THẬT (`BuocTest1951`, chainId 9137),
      đọc tiến trình mỗi 3 giây suốt cả lượt:**

| thời điểm | bước |
|---|---|
| 23s | 2/8 · đang `node-2` · còn ~198s |
| 41s | 3/8 · đang `node-3` |
| 71s | 4/8 · đang `node-4` |
| 102s | 5/8 · đang `node-5` |
| 138s | 6/8 · đang `node-1` |
| xong | **8/8**, mỗi node 31–33s |

      Đủ **5 bước node lần lượt** đúng thứ tự thiết kế (node phục vụ RPC công khai đi
      CUỐI). Chain thử đã thu hồi.

      **Nghiệm thu phía GIAO DIỆN** (trên trang đã deploy, ví + API giả với đúng
      khuôn payload server trả — đường ký thật cần MetaMask, xem `[human]` dưới):
      trần hiện **trước** khi bỏ công (`Còn 13/15 chỗ`) · ô chọn kiểu chain **do
      server cấp** kèm mô tả ngay dưới · bước **soát lại** hiện đủ tên/kiểu/địa chỉ
      ký + câu "BẤT BIẾN" + nút quay lại · màn tiến trình vẽ **8/8 bước** với trạng
      thái đúng, ước thời gian, vùng `aria-live`, và **không có spinner trơ**.

      Kèm: kết quả có nút **"Kích hoạt chain"** gửi một giao dịch chuyển tiền thường
      (21.000 gas — hằng số EVM, không cần ước lượng) ⇒ `luuY` là một **việc bấm
      được**, không phải đoạn văn cảnh báo. Và nút thêm chain vào ví.

      - [human] **Bấm thử đường ký thật bằng MetaMask.** Công cụ tự động không có ví
        trong trình duyệt nên không lái được `personal_sign`. Mở
        `https://testnet-a1.9chain.org/moi/de-chain/` và đẻ một chain.

      🔴 **Lỗi tôi gây ra trong lúc làm mốc này, đã sửa gốc:** deploy console **giữa
      lúc một lượt thu hồi đang chạy**. Đợt rolling restart vẫn chạy tới cùng (docker
      làm, không phải console), nhưng console chết **trước khi ghi danh bạ** ⇒ node
      không còn track subnet đó trong khi `console-chains.json` vẫn khai chain còn
      sống — **danh bạ nói dối một cách hoàn toàn thuyết phục**. `console-deploy.sh`
      nay đọc `/api/tien-trinh` và **từ chối restart** khi có lượt đang chạy.
      Kèm một lỗi cùng họ đã sửa: lượt thu hồi trước đây **ghi đè tiến trình của lượt
      đẻ vừa xong** (kéo bước `node-2` từ "xong" về "chay" ⇒ giao diện chạy lùi).
- [x] M10.5 — **"Chain của tôi" + thu hồi — XONG, đã thu hồi THẬT một chain từ giao diện.**

      **Nghiệm thu qua Cloudflare bằng đường THẬT** (chữ ký ví thật của
      `0xa5D486…407D`, ký ngoài trình duyệt rồi đưa vào; nonce thật; `/api/siwe/login`,
      `/api/status`, `/api/revoke` đều đi tới server thật):
      danh sách **chỉ hiện chain của ví đang đăng nhập** (`ViThuTest#9139` — chain
      của người khác bị ẩn đúng) · số validator **đo sống** (5) · hộp xác nhận nói đủ
      hai điều người dùng không đoán được · nút thu hồi **tắt** cho tới khi gõ đúng
      tên · thu hồi thật → **"Đã thu hồi ViThuHai. Còn 12/15 chỗ."**

      🔴 **PHÁT HIỆN LỚN NHẤT CỦA MỐC NÀY — Cloudflare cắt POST ở ~100 giây (HTTP 524),
      mà đẻ/thu hồi chain mất ~170 giây.** Nghĩa là qua tên miền công khai, lượt POST
      **LUÔN LUÔN hỏng** trong khi server vẫn chạy tới cùng và **thành công**.
      Đo thật: thu hồi `ViThuTest` từ giao diện → trình duyệt nhận **524** → màn hình
      báo *"Không thu hồi được"*, trong khi `console-chains.json` **đã ghi chain đó
      vào `retired`**. Giao diện nói dối theo hướng tệ nhất: nó mời người dùng làm
      lại một việc đã xong — và với **đẻ chain** thì lần làm lại là một chain thừa ăn
      mất một slot trong trần 15 **và giữ vĩnh viễn tên + chainId**.

      **Cách sửa (áp cho CẢ hai màn):** kết quả của POST là **không kết luận được**.
      Bắn POST rồi đọc `/api/tien-trinh` cho tới khi lượt chạy kết thúc, sau đó hỏi
      **danh bạ** xem sự thật là gì — thu hồi thành công ⇔ chain không còn trong
      `chains`; đẻ thành công ⇔ chain xuất hiện trong `chains`.
      ⚠️ Chỉ kết luận "xong" **sau khi đã thấy `dangChay=true` ít nhất một lần**: gọi
      quá sớm thì hàng đợi chưa nhận việc và ta đọc trúng kết quả của lượt TRƯỚC.

      🔴 **Một lỗi nữa tự bắt được trong lúc viết màn này:** tôi dùng `0` làm giá trị
      "đang đo" số validator. Nhưng **0 validator là một trạng thái THẬT và nguy
      hiểm** — subnet track mà chưa có validator thì chain vẫn trả lời `eth_chainId`,
      vẫn đọc được số dư, MetaMask vẫn kết nối, **chỉ là giao dịch không bao giờ
      chốt**, và không có dấu hiệu bề ngoài nào khác. Dùng 0 làm sentinel là che đúng
      cái trạng thái cần hiện. Nay sentinel là `'dang'`, và 0 validator hiện một cảnh
      báo riêng.
- [x] M10.6 — **Bảng so sánh A1↔C1 — XONG.** `/bang/`

      **Điều kiện qua đã đo:** C1 vắng mặt hiện ra **như VẮNG, không như HỎNG** —
      một khối viền nét đứt nói thẳng *"C1 — chưa nối được"* kèm lý do (cần URL
      Cosmos REST, H-5), phần A1 vẫn là số sống bình thường. Kèm: kéo trọng số thì
      điểm **đổi theo** (chứng minh không phải số cắm cứng), 10 tiêu chí giữ nguyên
      từ `docs/A1-vs-C1-SCORECARD.md`, không tràn ngang ở khổ điện thoại.

      🔴 **Câu quan trọng nhất trên màn là câu tự tố:** *"Điểm dưới đây là ĐỘI TỰ
      CHẤM, không phải đo độc lập."* A1 là bên đang trình bày; một bảng điểm không
      khai điều đó thì nó không phải bằng chứng, nó là quảng cáo có bảng biểu.
- [~] M10.7 — **Phần đo được đã làm: "không URL nào chết" — 10/10 liên kết sống.**
      Phần còn lại chờ hai thứ bên ngoài.

      `web/scripts/check-links.mjs`, chạy tự động ở cuối `web-deploy.sh`.

      🔴 **Bài kiểm này phải đo NỘI DUNG, không đo mã HTTP** — và bản đầu của tôi
      không làm thế nên nó cho **xanh giả**. Gốc `/` là Blockscout, một SPA trả
      **HTTP 200 kèm khung rỗng** cho mọi đường lạ. `/tc-a/` và `/de-chain/` khi đó
      "200 ✓" trong khi người dùng bấm vào chỉ thấy trang trắng. Nay phép đo đòi
      `<title>` không rỗng.

      **Kéo theo một sửa kiến trúc:** bỏ cách phục vụ cả site dưới tiền tố `/moi/`.
      Bản xuất tĩnh của Next dùng đường dẫn **tuyệt đối** cho liên kết nội bộ, nên
      dưới tiền tố thì **mỗi cú bấm nhảy ra khỏi tiền tố** và rơi xuống Blockscout.
      Nay mỗi trang có route thật (`/de-chain/`, `/chain-cua-toi/`, `/bang/`,
      `/tc-a|b|c/`); chỉ trang CHỌN BIẾN THỂ còn ở `/moi/` vì gốc `/` vẫn là
      Blockscout tới khi M10.3 chốt.

      🔴 **Và một lỗi tôi gây ra rồi sửa trong cùng lượt:** khối route mới có
      `/faucet/*` bị đặt **trước** `@faucet_api`, mà `handle` của Caddy xét theo thứ
      tự ⇒ `/faucet/api/thongtin` rơi vào container tĩnh và trả **404**. Trang faucet
      vẫn hiện bình thường nên nhìn bằng mắt không thấy gì; `web-deploy.sh` bắt được
      vì nó có phép kiểm API riêng.

      - [x] **`/lite/` → `/` và `/dashboard/` → `/bang/`, cả hai 301.** Mở khoá được
        vì gốc `/` nay là trang chủ thật (M10.3 đã chốt). Giữ URL cũ bằng redirect
        chứ **không xoá**: chúng có thể đã nằm trong tài liệu hay tin nhắn của ai đó,
        và một URL chết thì không nói được nó đã đi đâu. 301 vì đây là chuyển nhà
        vĩnh viễn.
      - [x] **Đã TẮT hai container cũ** `9chain-a1-explorer` (:8082) và
        `9chain-a1-dashboard` (:8092) — chúng không còn đường vào nào sau khi
        `/lite/` và `/dashboard/` thành redirect (David duyệt 2026-08-26).
        Dùng `docker stop`, **không `rm`**: `unless-stopped` nghĩa là chúng ở yên
        sau khi dừng tường minh, còn dữ liệu và cấu hình vẫn nguyên.
        Bật lại: `docker start 9chain-a1-explorer 9chain-a1-dashboard`.

        🔴 **Phải kiểm một thứ TRƯỚC khi tắt, và nó suýt là bẫy:** Caddyfile có
        đường lui `A1_ROOT_UPSTREAM` cho gốc, và chú thích cũ ghi giá trị mẫu là
        `127.0.0.1:8082` — tức đúng container sắp tắt. Đo `caddy.env` thật thì nó
        đang là `127.0.0.1:8100` (Blockscout), nên tắt an toàn. Đã sửa chú thích:
        để nguyên là để lại một đường lui **trỏ vào thứ đã chết**, và nó chỉ lộ ra
        đúng lúc có sự cố cần dùng tới nó.
      - [blocked] Gỡ trang `/chains/` cũ — chờ 9Scan-A1 đưa `/chains/` của họ lên
        (U-5, việc của dự án khác).

**Nghiệm thu chung:** mở trên **trang công khai qua Cloudflare** (không `curl
127.0.0.1` — trang render bằng JS nên curl chỉ thấy khung rỗng), **cả điện thoại lẫn
desktop**, **cả sáng lẫn tối**.

**Còn chờ David:** 🔴 **U-2 = H-3/M4.5 (đắt nhất, xem trên)** · U-3 chọn biến thể
trang chủ · U-4 có design handoff gốc (file/Figma) mà `globals.css` dẫn nguồn không —
không có thì `globals.css` **là** nguồn sự thật · U-5 thống nhất URL `/chains/` với
9Scan. (U-1 đã duyệt.) Chi tiết: `docs/UI-PLAN.md` §9.

---

## M11 — Chốt trước ngày G `01/09` (autopilot `2026-08-28`, David duyệt từng mục `27/08`)

Điều kiện qua chung: **mỗi mục phải có ca ĐỎ đã nhìn thấy**, và mục nào chạm đường sản phẩm thì
phải chạy thật đường đó — test xanh không đủ.

| # | Việc | Trạng thái | Bằng chứng |
|---|---|---|---|
| M11.1 | Nạp ví `chain-factory` | `[x]` | D-082 · P = 89,99999173 LOVE9, đọc bằng RPC công khai |
| M11.2 | Vá bí danh tài sản (SDK ví chết trên g0) | `[x]` | D-082 · patch 0019 · sha256 genesis g0 khớp từng bit trước/sau |
| M11.3 | netgen sinh `.env` + cổng chặn phơi trần | `[x]` | D-083 · patch 0020 · `docker compose config` đo đầu-cuối |
| M11.4 | B-9 — gỡ đỏ Avalanche khỏi ví X/P | `[x]` | D-084 · patch 0021 |
| M11.5 | Bí danh `LOVE9` dứt khoát + hỏng ra tiếng | `[x]` | D-084 · patch 0022 · 6 ca, 3 đối chứng |
| M11.6 | O1 bước 1 — khoá g0 rời server + `kiem-khoa` | `[x]` | D-085 · patch 0023 · khôi phục 6/6, `shred -u` |
| M11.7 | §5c — sổ "A1 đã cấp", chặn xuyên thế hệ | `[x]` | D-086 · 35 đạt/0 hỏng · **verify trên API thật** |
| M11.8 | Khoá đẻ chain cho người ngoài tới sau ngày G (O3) | `[x]` | D-087 · 3 ca · **đã deploy + nghiệm thu trên console công khai** |
| M11.9 | H-7 — IPv4 đa cổng cho P2P (mở khoá O4) | `[x]` | D-089 · patch 0024 · **diễn tập 3 node thật**: mesh 2/2, beacon tới được từ Internet |
| M11.10 | O1 bước 2 — ví ký từ máy dev qua hầm SSH trong container | `[ ]` | ràng buộc đã đo, xem D-085 |
| M11.11 | 🔴 **Cổng canh khoảng cách repo ↔ server** | `[x]` | D-088 · bắt 5 lệch thật ngay lần đầu · đối chứng ngược đạt |
| M11.12 | Deploy phần còn lại của 27–28/08 (faucet I1b, `export-chain`, `index.html`) | `[x]` | D-088 · `/faucet/api/supply` nay **200, số đo từ chain** |
| M11.13 | 🔴 **Diễn tập trọn lượt ngày G ở thế hệ 1** (P2-5 của `TESTNET1-PUBLIC`) | `[x]` | D-123→D-128 · `30/08` · bump `A1Gen` + **sinh lại 26 patch** (tree `60a61707`) · image `9chain-a1/node:g1` **dùng lại được ngày G** · khắc chữ `engrave-verify` **13/13 trên chain sống** · `N=9`: node ngoài compose bootstrapped, validators **9**, node **không phải beacon** thấy nó · **5 phát hiện, 4 nằm trong thứ đang xanh** |

🔴 **Chờ người, autopilot không làm thay được:** bản thứ hai của bộ khoá (O1) · ký SIWE để chạy
phép kiểm đẻ chain đầu-cuối · B-10 tắt robots.txt ở dashboard Cloudflare · O4 tiền cho nhà cung
cấp thứ hai · gộp `web-home` → `main`.

## Chờ David — KHÔNG code thay được

- [human] **Tokenomics**: supply cap 720,000,000 LOVE9 (đang kế thừa từ Avalanche, chưa ai duyệt) ·
  tỉ lệ 40/20/20/5/15 + lịch vesting (chưa có phê duyệt kinh doanh/pháp lý) · uptime 80%→90%
- [human] **ACP-77** (`ConvertSubnetToL1Tx`): hiện là subnet cổ điển. Đây là **quyết định kinh tế**
  (L1 chuẩn có phí duy trì liên tục), không phải task kỹ thuật. Chốt tokenomics trước.
- [human] **Mở console công khai hay không** (M4.5)
- [human] URL Cosmos REST của C1 (`:1317`) để dashboard kéo C1 live

---

## 2026-08-28 — quét chuẩn hoá toàn diện (David yêu cầu)

**Yêu cầu:** quét ngôn từ / tên / cấu trúc / logic / mã số / url / domain; xoá thứ đã bỏ; đổi
tên tệp tiếng Việt sang tiếng Anh. David chốt **phạm vi tối đa** (gồm `patches/`) và **không
giữ bí danh**.

### Đã sửa — lỗi thực chất (không phải đổi tên)

| | |
|---|---|
| `README.md` | networkID **9001 → 999999999**; tách *tổng cung 9 tỷ* khỏi *`SupplyCap` 7.900.000.001*; lệnh đo supplyCap (`docker logs` **nay ra rỗng**); gốc dải chainId **9100 → 9000000010**; 12 → 25 patch; bảng 9 thư mục `net*` |
| 4 tệp compose | bỏ `--network-id=9001` cắm cứng (8 dòng) ⇒ `${NETWORK_ID:?…}`; thêm `local-net/network-id.sh` **suy từ genesis** (D-111) |
| `multinode.compose.yml` | bỏ dòng tự khai *"NGUỒN CHÍNH THỨC"* — sai, nó tả mạng **5 node** đã chết; thêm `restart:` cho cả 5 node (A-003, mở từ 27/08) |
| console **công khai** | 3 lần `#e84142` (đỏ thương hiệu Avalanche) → vàng 9Chain; gỡ mọi khẳng định *"5 node"* (mạng thật **9**) |
| `9chain-a1-config/l1-evm-genesis.json` | khai rõ `chainId 9100` là **khuôn**, console luôn ghi đè — nhưng đường **CLI** thì không (cảnh báo trong README) |

🔴 Miễn trừ B-9 trong HANDOFF ghi `local-net/console/index.html` *"thuộc worktree web"* —
**sai**: tệp nằm ở `local-net/`, trên `main`, và có tên trong `manifest-deploy.json`. **Một miễn
trừ đặt nhầm chỗ đã giấu mục này lại nhiều ngày** — cùng hình dạng với "ĐÃ ĐÓNG trong repo ≠
đã đóng ngoài đời".

### Đã đổi tên

15 tệp mã · 32 cờ CLI (325 lần thay) · khoá JSON của 3 tệp dữ liệu · 6 id preset · 56 tệp tài
liệu · 25 tiêu đề commit fork ⇒ 25 tên tệp patch. Chi tiết, gồm **phần cố ý KHÔNG làm**: **D-108**.

### Cổng mới

- `scripts/check-net-dirs.mjs` — thư mục `net*` nào thuộc thế hệ nào, thư mục nào giữ **TIỀN
  THẬT** (đối chứng ngược 17/17). Chính nó tìm ra **B-19**.
- `scripts/check-evidence.mjs` — gói vật chứng còn **tự nghiệm thu** được không (đối chứng 8/8).
- Đối chứng **24/25 → `074aaa93`** của luật cứng #3 nay **là mã**, không còn là nghi thức (D-112);
  đã nhìn thấy nó ĐỎ vì đúng lý do.

`gday-preflight --no-network`: **11 đạt · 0 đỏ · 0 không chạy được · 4 bỏ qua · 14 việc tay**.

### 🔴 Còn lại — việc của David

- [human] **B-19** — di dời `chain-factory-key.txt` (~90 LOVE9 thật) ra khỏi thư mục `9001` **trước**
  khi dọn; và **đừng** cất `net-that-g0` làm bản sao lưu quỹ — nó là **mồi nhử, 0đ**.
- [human] **B-18** — xoá 3 tên tệp **cũ** còn trên server, **cùng lượt deploy console**.
- [human] **Gộp `web-home` → `main`.** `web/` **không** được chuẩn hoá trong phiên này (luật
  cứng #4): `main` lệch `web-home` **78 tệp / +17.440 −2.792**, và `main:web/lib/chain.ts` vẫn
  khai `networkId: 9001` trong khi `web-home` đã đúng `999999999`.
- [ ] Định danh **cục bộ** trong JS/Go vẫn tiếng Việt — cố ý hoãn, lý do ở D-108. Làm sau ngày G.

### Lượt quét thứ HAI (`28/08`, David yêu cầu quét lại)

Vòng hai tìm được **ba** thứ vòng một bỏ sót — cả ba đều là *"đã đổi ở một nơi, chưa đổi ở
nguồn"*:

| | |
|---|---|
| **D-115** | `export-chain.mjs` vẫn **đẻ ra** tên tiếng Việt (`00-DOC-TRUOC.md`, `GOC.txt`, `tep-kem/`) — bản xuất ngày G sẽ lại là tiếng Việt. Sửa **nguồn**, giữ nguyên gói đã niêm; chế độ KIỂM đọc được cả hai |
| **D-113** | một khái niệm *"máy chủ"* mang **sáu** tên biến; `h6b-backup.sh` dùng tên **không script nào khác dùng** ⇒ O4 sẽ làm nó lặng lẽ sao lưu máy cũ |
| **D-114** | khuôn genesis L1 vẫn cấp **50 triệu token + quyền chỉnh phí** cho khoá **công khai** `ewoq`, trên `chainId 9100` đã bị chiếm — và **hai đường CLI truyền thẳng nó** |

Cổng mới: `check-single-source.mjs` (6/6) · `check-english-code.mjs` (12/12, bánh cóc) ·
`make-l1-genesis.mjs` (13/13). Preflight nay **18 cổng · 15 việc tay**.

🔴 **Luật ngôn ngữ (D-113):** mã nguồn chỉ có tiếng Anh. Nợ **6.801 → 5.856 dòng**; toàn bộ mã
phiên này tạo ra đã trả hết. Cổng bắt được **chính tôi ba lần** trong một phiên — đó là lý do
nó phải là mã, không phải quy ước.

- [ ] Trả tiếp nợ ngôn ngữ: 107 tệp · 5.856 dòng còn lại + 54 tệp Go trong fork. Ưu tiên
  `local-net/console/server.mjs` (639 dòng — sản phẩm sống, người ngoài đọc nhiều nhất).
