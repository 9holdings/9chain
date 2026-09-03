# PROGRESS — 9Chain-A1 (phần CHAIN)

Backlog autopilot. Explorer là dự án khác (`C:\PROJECTS\9Scan-A1`) — **không làm ở đây**.
Nhật ký chi tiết lịch sử: `docs/PROGRESS.md`. Bàn giao: `HANDOFF.md`.

Trạng thái: `[ ]` chưa làm · `[x]` xong **và đã verify end-to-end thật** · `[~]` làm một
phần, phần còn lại ghi rõ ngay trong mục · `[blocked]` kẹt · `[human]` cần David.

---

## 🟢 PHIÊN `2026-09-02` — PHÁT HÀNH GENESIS + BẢN GHI SUÝT BỊ XOÁ (D-158)

- [x] **P-1 — `genesis.json` vào đường được git theo dõi** (D-158)
      Chặn số 1 của HANDOFF. 🔴 Trạng thái thật **hẹp hơn mô tả**: không phải *"chưa ai tải lên"*
      mà là **tệp không được git theo dõi** — `.gitignore` loại cả nhóm `local-net/net-*` (đúng,
      vì đó là chỗ netgen ghi khoá) và quét luôn tệp duy nhất trong đó vốn để công khai.
      ⇒ Byte cả thế giới cần nằm ở **hai chỗ vận hành, không repo/sao lưu/release nào**.
      **Điều kiện qua:** bản theo dõi trùng byte với genesis **node đang chạy boot bằng**.
      ✅ **ĐẠT — bốn mỏ neo độc lập cùng `4de8caa5…0f6ee6`**: `docs/genesis/genesis-g1.json` ·
      bản làm việc `local-net/net-g1/` · hằng số in trong `RUN-A-VALIDATOR.md` ·
      `~/9chain-a1/net/genesis.json` đọc thẳng từ máy chủ.
      🔴 Kiểm vật liệu khoá **trước** khi theo dõi: 0 bí mật 32 byte. Lượt quét đầu in ra "mười
      khoá riêng" — là **64 ký tự đầu của khoá BLS 96 ký tự**, regex không neo. Neo + gộp theo
      độ dài mới ra bức tranh thật.

- [x] **P-2 — `RUN-A-VALIDATOR.md` khai NGUỒN TẢI** (D-158)
      Tài liệu in `sha256` từ lúc phóng nhưng **chưa bao giờ nói tải ở đâu**. Tệp và URL nằm
      **cùng một commit** ⇒ không có cửa sổ nào tài liệu hứa thứ chưa tồn tại.

- [x] **P-3 — cổng `check-genesis-published.mjs`** (D-158)
      6 phép đo, mỗi phép ở đúng nơi; **cả hai chiều** (tệp khai networkID sống **và** beacon
      trong tài liệu có mặt trong chính genesis đó **và** đang validate); chấm bằng **nội dung**,
      không bằng mã HTTP.
      **Điều kiện qua:** thấy ĐỎ đúng lý do **và** thấy XANH được.
      ✅ **ĐẠT — 27 đối chứng ngược · chạy thật đỏ đúng MỘT bước** (tải công khai 404), năm bước
      kia xanh · **đối chứng DƯƠNG trên byte thật** (`--url` vào host phục vụ đúng tệp ⇒ PASS,
      đường sai cùng host ⇒ đỏ lại). Preflight **40 → 42 mục**.

- [x] **P-4 — cứu bản ghi `heartbeat` g0 trước khi có ai xoá nó** (D-158)
      `check-deploy-drift` chấm mồ côi, HANDOFF xếp *"hình dạng B-17"* = chờ xoá. B-17 nói câu
      *"đã có bản lưu"* là một **PHÉP ĐO** — và phép đo trả lời **KHÔNG**: repo không có bản nào.
      Đó là bản ghi **duy nhất** của lượt bơm g0 (59 giờ · 1.910.316 tx · 9,01 TPS · tự dừng
      đúng hạn), mà *"nhịp sống 9 tx/s"* **đã công bố ra ngoài**.
      ✅ Chép về `docs/archive/` trùng byte (`a16a354d…`), FROZEN. **Giờ mới được xoá trên server.**

- [x] **P-5 — ĐÃ ĐẨY. `genesis.json` NAY TẢI ĐƯỢC TỪ NGOÀI** (David duyệt `02/09`)
      `7b56add..30894f9` lên `official` (`9holdings/9chain`, CÔNG KHAI) + `da4acac..30894f9` lên
      `origin` (sao lưu riêng tư — nó **thiếu 7 commit**, đúng lỗ D-151 sinh ra để canh).
      Kiểm **TRƯỚC** lượt đẩy theo §4: `check-history-secrets --all-objects` **0 vật liệu khoá**
      (chạy lại lần hai để phủ cả hai commit cuối) · `official` **PUBLIC · WRITE · chưa archive**
      · 31 commit / 32 tệp, **không tệp khoá, không `.env`, không `net-*`**.
      **Điều kiện qua:** người ngoài làm đúng Bước 3 mà ra đúng byte.
      ✅ **ĐẠT, đo bằng tay chứ không tin cổng của chính mình**: `curl` URL trong tài liệu →
      `sha256` = `4de8caa5…0f6ee6` **khớp hằng số công bố** → `networkID` trong tệp `999999998`
      **khớp `info.getNetworkID` của mạng sống**. `check-genesis-published` **6/6 ✅ PASS**,
      `official` nay **behind 0**.

- [human] **P-6 — nạp ví `chain-factory` (HAI chặng)** — David chọn **quỹ nào** và **bao nhiêu**;
      gửi giao dịch trên mạng công khai là việc có người bấm (§4).

- [x] **P-7 — xoá mồ côi trên server** (David bấm `02/09`)
      🔴 **Làm TRỌN cả ba bước của B-17, vì mục này đã sai hai lần chính vì bỏ bước.**
      **LIỆT KÊ:** hai tệp cùng thư mục, hash khác nhau — mồ côi `a16a354d…` (1252 B, `ubuntu`)
      và tệp **đang sống** `heartbeat.json` `805ed518…` (847 B, `root`). Lệnh dùng **đường dẫn
      tường minh, không glob** — một dấu `*` đặt sai là nuốt luôn cái đang sống.
      🔴 *"Đã có bản lưu"* được **ĐO**, không phải khẳng định: lấy tệp về từ **ba nơi độc lập
      ngoài server** — repo tại chỗ · remote **công khai** (tải thật qua Internet) · remote sao
      lưu **riêng tư** (đọc thẳng blob của ref) — cả ba `a16a354d…`, trùng byte.
      **XOÁ:** `rm`, **không phải `shred`** — đây là bản ghi **đã công bố**, không phải vật liệu
      khoá; dùng `shred` cho tệp công khai là khai sai mức nhạy cảm và làm loãng nghĩa của nó
      ở chỗ thật sự cần (D-117).
      **ĐỐI CHỨNG:** mồ côi không còn · tệp đang sống **còn nguyên đúng `805ed518…`** ·
      `check-deploy-drift` **20 khớp · 0 lệch · 0 thiếu · 0 MỒ CÔI**, exit 0.
      ✅ Preflight **39 đạt · 3 đỏ → 40 đạt · 2 đỏ**.

- [x] **P-8 — THU HỒI khoá `chain-factory` g1, trước khi nạp một đồng nào** (D-159)
      🔴 **Lỗi do tôi gây ra:** xem hình dạng tệp khoá bằng `sed` che `PrivateKey-…`, mà tệp còn
      mang `EVM privkey : 0x…` — mẫu không bắt ⇒ khoá vào bản ghi phiên. Hai dòng là **cùng một
      bí mật**. Cùng gốc với D-158 ở chiều ngược: ở kia mẫu quá RỘNG (báo động giả), ở đây quá
      HẸP (báo động không nổ) — đều vì viết mẫu trước khi đọc hết tệp.
      ⇒ **Luật: xem tệp bí mật thì DANH SÁCH TRẮNG, không danh sách đen.**
      **Điều kiện qua:** khoá mới suy ra đúng địa chỉ nó tự khai, và ví cũ chưa từng nhận tiền.
      ✅ **ĐẠT.** Đo trước khi quyết: ví cũ **0 trên cả X, P, C** ⇒ đổi khoá tốn **28 phút, 0 đồng**.
      Mới: `P-love9199au4t8uj8s6875ztwvvgctnkcxddtwv549999` (930.267.708 ứng viên · `28m10s`).
      Stdout đổ **thẳng vào tệp**, khoá không qua màn hình. `check-keys` suy lại khớp, `exit 0`.
      `check-key-leaks` **PASS**. Địa chỉ cũ **không** giữ trong bảng — mục chết trong đó là một ví
      người ta vẫn gửi vào được.

- [x] **P-9 — ví factory CHƯA BAO GIỜ chạy nổi: bốn lỗi chồng nhau** (D-159)
      ① `check-keys` nhận quỹ bằng dòng `[tên]`, tệp một khoá **không có** ⇒ `FATAL` ⇒ ví bỏ chạy,
      mà `--rm` **xoá cả xác lẫn log** ② `go run` biên dịch `xp-wallet` mỗi lượt ⇒ **~4 phút** mới
      phục vụ ③ `curl -s` nuốt lỗi kết nối ⇒ rỗng **không phân biệt được** với thành công
      ④ `bash` trong PowerShell rơi vào **WSL** không có khoá ssh.
      **Điều kiện qua:** ví thật sự PHỤC VỤ, và bản hỏng vẫn bị bác.
      ✅ **ĐẠT.** `enter.sh` tổng hợp tiêu đề trong ống (không ghi đĩa). Ví trả `/api/info` thật.
      Bản hỏng (khoá `ewoq` công khai + địa chỉ không phải của nó ⇒ **không khoá thật chạm đĩa**)
      vẫn **BÁC đúng lý do**, `exit 1`. Ba dạng tệp khoá đều đúng, không hồi quy.
      🔴 Kèm lần **thứ ba** cùng lớp lỗi trong một ngày: `quỹ chọn:` in `P-love9199` cụt vì
      `grep -o` vớ phải tham số tìm kiếm. Vá bằng cách neo vào **TÊN TRƯỜNG**.

- [x] **P-10 — runbook việc 3 viết lại: phép kiểm do MÃ giữ, không do trí nhớ** (D-159)
      Hàm `cho_vi` chờ ví lên, so `xAddr`, nối `&&` ⇒ lệnh gửi **không chạy được** khi đỏ. Đối
      chứng hai chiều bằng ví giả: lệch `exit 1`, khớp `exit 0`. Địa chỉ **suy từ nguồn duy nhất**,
      runbook và HANDOFF **thôi in địa chỉ factory ra**.

- [human] **P-11 — đặt `A1_CLI_KEY` mới vào `console.env` + restart console**, rồi huỷ tệp khoá
      đã nghỉ (`chain-factory-key-RETIRED-LEAKED-2026-09-02.txt`). Sau đó mới nạp 1.000.

- [x] **P-12 — B-12 có SỐ THẬT: lịch hết hạn validator của g1, đọc từ chain sống** (D-160)
      Blocker tự dặn từ `27/08`: *"đọc bằng `platform.getCurrentValidators` → `endTime`, đừng
      tính tay … nên làm **ngay sau ngày G**, lúc số còn tươi."* Ngày G là `01/09`, hôm nay `02/09`
      — cửa sổ đó là **bây giờ**.
      **Điều kiện qua:** số đến từ chain đang chạy, không từ phép tính; và biết cổng canh nó sẽ
      chuyển màu **ngày nào**.
      ✅ **ĐẠT.** `9/9` validator, cả 9 `connected: true`, weight bằng nhau. Node đầu rụng
      `2027-07-07T09:19:33Z` (307 ngày) · **node cuối `2027-09-01T09:19:33Z` (363 ngày) = MẠNG
      DỪNG** · cửa sổ **56,00 ngày** · so le **đúng 7 ngày** ⇒ `InitialStakeDurationOffset` còn
      nguyên. Bảng đủ 9 dòng vào `BLOCKERS.md` B-12, mục hạ từ 🔴 xuống 🟡.
      🔴 Hỏi câu §2 về chính cổng đang canh: `watch-network` chấm bằng **`min(endTime)`**, mà một
      cổng đo *"sớm nhất"* có lối tự xanh lại khi cái sớm nhất **rơi khỏi danh sách**. Ở đây không
      xảy ra — nhưng vì **số học** (so le 7 < ngưỡng đỏ 45), không vì may. Đổi `N` hoặc đổi so le
      là lối thoát đó mở ra; đã ghi vào D-160.
      🔵 **Không dựng cổng mới** — đọc mã trước thì `watch-network` đã canh B-12 từ `28/08`. Thêm
      cổng thứ hai cho cùng đại lượng là nhân đôi chỗ phải giữ đồng bộ (lớp lỗi §6). B-12 chưa bao
      giờ thiếu cổng; nó thiếu **số** và **người**.

- [human] **P-13 — nửa NGƯỜI của B-12**: lịch nhắc ở nơi **đánh thức được một con người** (repo
      không đánh thức ai) + **tên người chịu trách nhiệm**. Mốc đáng đặt `~2027-03-09` — chỗ
      `watch-network` chuyển VÀNG (120 ngày), không phải chỗ nó chuyển ĐỎ (`~2027-05-23`, 45 ngày).

- [x] **P-14 — chốt bánh cóc §0: mốc nợ ngôn ngữ `5.856 → 5.719`** (D-160)
      Cổng đo `5.719` trong khi mốc khai `5.856` ⇒ **PASS**, và đó là vấn đề: 137 dòng đã trả nằm
      ngoài mốc, nợ **phình lại tới 5.856 vẫn xanh suốt đường**. Bánh cóc không chốt thì chỉ là
      một phép đo.
      **Điều kiện qua:** thấy nó ĐỎ **vì đúng lý do**, cả hai chiều.
      ✅ **ĐẠT.** `--update-baseline` ⇒ `107 tệp · 5.719 dòng`. Đối chứng: thêm một `.mjs` mới có
      **một** dòng chú thích tiếng Việt ⇒ `108 tệp · 5.720 dòng`, `exit 1`, lời khuyên in ra trỏ
      **đúng** đại lượng (*"tệp mới phải là tiếng Anh ngay từ đầu"*); gỡ tệp ⇒ `exit 0`.
      🔴 Nay đắt hơn nó trông: repo **vừa công khai `02/09`** (D-158) ⇒ §0 thôi là luật phòng xa.

- [x] **P-15 — 🔴 ĐƯỜNG TỰ PHỤC VỤ CỦA NGƯỜI NGOÀI SAI ĐÚNG MỘT LƯỢT FAUCET** (D-161)
      David giao: *"focus vào việc mọi người có thể tạo Validator bên ngoài chủ động."*
      Cả lý do hạ `MinValidatorStake` 25.000 → **81** sáng ngày G là để tự phục vụ: `81 = 9 × 9`,
      faucet cấp `9 LOVE9` ⇒ **chín lượt**. Câu đó là **thứ đầu tiên** người ngoài đọc.
      🔴 Đo trên bề mặt công khai: **chín lượt cho đúng 81, mà đặt cọc LÀ 81** — phí chở tiền
      `C→X→P` và phí nộp `AddPermissionlessValidatorTx` **trừ vào chính số dư đó**. Số thật là
      **mười**, trần faucet là **chín/IP/giờ** ⇒ có một **lượt chờ tới một giờ**. Phép số học sai
      là `>=` thay vì `>`.
      🟢 Không phải lỗi cấu hình: faucet **đã** được đặt đúng `9`/`9` (việc tay preflight cảnh báo
      mặc định `10`/`5` — lời cảnh báo **đã được nghe**). Sai nằm ở **quan hệ giữa ba số đúng**,
      mà quan hệ thì **không là trường của ai**: một trong binary Go, một trong env container, một
      trong markdown, không cái nào nhìn thấy hai cái kia.
      **Điều kiện qua:** cổng thấy ĐỎ **trên bản tài liệu đã nghỉ** và XANH trên bản đã sửa.
      ✅ **ĐẠT.** Tài liệu nói thật **ở màn hình đầu** (trước đó tự mâu thuẫn: hứa ở dòng 29, đính
      chính ở dòng **325** — cách 300 dòng thì bằng không đính chính). Cổng mới
      `check-validator-onboarding.mjs`: **36 đối chứng ngược** · đối chứng **âm và dương trên BYTE
      THẬT** (`--guide` chĩa vào `git show HEAD:…` ⇒ `EXIT 1` **đúng dòng 29**; bản đã sửa ⇒
      `EXIT 0`). Preflight **42 → 44 mục**.

- [x] **P-16 — cổng đó sai HAI LẦN trước khi đúng, và cả hai là lớp lỗi của chính dự án** (D-161)
      🔴 **(a) đỏ giả (D-106b lần thứ tư).** Lượt chạy thật đầu tiên ĐỎ — vì **câu tôi vừa viết để
      đính chính** trích lại lời hứa cũ. Cổng không phân biệt **lời hứa** với **câu trích lời hứa
      đã nghỉ**. Vá bằng `stale-ok` **đã có sẵn**, phạm vi ĐOẠN, và cổng **in ra** số dòng được
      miễn — miễn trừ phải nhìn thấy được.
      🔴 **(b) XANH GIẢ — chiều nguy hiểm hơn.** Bản cũ viết `so **nine requests** cover`; dấu `**`
      chen giữa nên mẫu đòi khoảng trắng **đi thẳng qua**. **Cổng dựng ra để bắt đúng câu đó, đọc
      đúng câu đó, và cho qua.** Bắt được **chỉ vì** chạy vào bản tài liệu đã nghỉ, không vào
      fixture — fixture đồng ý với tác giả, byte thì không.
      🔴 **(c) ca self-test XANH VÌ SAI LÝ DO** (Q-5b lặp lại). Nó khẳng định `verdict === "fail"`,
      và đúng là `fail` — nhưng vì fixture **thiếu lời cảnh báo chờ**, không vì bắt được lời hứa
      sai. Nó **luôn xanh về lời hứa** suốt thời gian đó.
      ⇒ **Luật: cổng có HAI nghĩa vụ thì ca đối chứng phải nói nó kiểm nghĩa vụ NÀO.** `reason`
      (`false-promise`/`no-wait-warning`/`none`) nay là thứ mọi ca khẳng định, không phải kết quả.
      🟡 **Nợ khai ra:** `stale-ok` nay có **BA bản cài đặt** — hai bản kia nằm trong module gọi
      `process.exit(main())` ở cấp cao nhất nên **import vào là chạy cổng khác rồi thoát**. Gom vào
      thư viện chung phải sửa hai cổng đang chạy tốt: đáng làm, **chưa làm**. Đúng hình dạng §6.

- [human] **P-17 — bỏ hẳn lượt chờ một giờ trên đường validator (tuỳ David, không phải lỗi)**
      Đường tự phục vụ nay **đúng như tài liệu mô tả**, nhưng vẫn có một lượt chờ tới một giờ.
      Muốn bỏ: `FAUCET_MAX_PER_IP_HOUR` **9 → 10** trên server. ⚠️ `docker rm -f` rồi `docker run`
      — `docker restart` **KHÔNG** nạp lại env (bẫy 2). Cách khác là `FAUCET_AMOUNT` 9 → 10, nhưng
      nó **phá đẳng thức `81 = 9 × 9`** mà cả trang đang dựa vào. Cổng chấp nhận cả hai — nó đo
      **quan hệ**, không ép một con số.

- [x] **P-18 — 🔴 ĐIỀU KIỆN TIÊN QUYẾT của "người ngoài tự làm validator" KHÔNG AI ĐO** (D-162)
      Tiền chỉ là nửa sau; nửa trước là **node phải bootstrap được**. Stake đòi bootstrap, bootstrap
      đòi **80% stake**, và nối được đòi **địa chỉ mạng phát tán ra phải quay số được từ ngoài**.
      D-118b từng đo đúng cái chết đó (11% thấy được / 80% cần) **trên một mạng mọi cổng đều xanh**.
      Bản vá `open-p2p-all-nodes.py` đã áp ngày G — 🔴 **và không gì đo rằng nó CÒN đúng**: đó là
      thuộc tính của **tiến trình đang chạy**, mất khi dựng lại một node thiếu cờ, và **triệu chứng
      không phải sự cố** — mạng vẫn xanh, RPC vẫn nhanh, chỉ **người lạ** phát hiện, một mình.
      **Điều kiện qua:** đo **cả hai chiều** (khai-mà-đóng · mở-mà-không-khai), và đo **từ ngoài**.
      ✅ **ĐẠT.** `check-outsider-bootstrap.mjs`: **26 đối chứng ngược** · đối chứng **trên byte
      thật hai hướng** (cổng thật ⇒ `open`, cổng `9999` cùng host ⇒ `timed out`; tên miền đã nghỉ
      ⇒ `EXIT 2` **chứ không PASS**). Đo mạng sống: **9/9 khai địa chỉ công khai · 9/9 cổng TCP mở
      từ máy này · 100,00% stake quay số được** ⇒ người lạ bootstrap được thật.
      🔴 **NƠI CHẠY LÀ MỘT PHẦN CỦA PHÉP ĐO** — thăm dò từ chính server chứng minh số 0 (không qua
      tường lửa, Docker không hairpin — D-089). Cổng tự in điều kiện đó ra.
      🔴 Stake tính bằng **WEIGHT**, không bằng đầu người: hôm nay chín node cùng trọng số nên hai
      cách trùng nhau, và đó **chính là lý do** không được viết bằng đầu người.
      ⚠️ Khai rõ: nhánh **FAIL** mới chỉ có fixture — dựng ca đỏ thật phải sửa cấu hình mạng đang
      chạy, việc có người bấm (§4). Nói ra thay vì để màu xanh ngụ ý đã kiểm.

- [x] **P-19 — 🔴 tôi SUÝT khai một sự cố không có thật, và chỉ tra mã nguồn mới chặn được** (D-162)
      Lượt đo đầu: `info.peers` trả **8/8 peer mang `172.28.0.x`**. Đọc mặt chữ thì đó là D-118b tái
      phát trên mạng công khai. Tra thẳng `upstream/avalanchego/network/peer/`: **có HAI trường** —
      `ip` là **socket node được hỏi đang nối**, `PublicIP` là **lời khai đã KÝ**, và đó mới là thứ
      được gossip cho người lạ. Trên mạng Docker hai trường **luôn khác nhau**.
      Đo đúng trường ⇒ **8/8 khai địa chỉ công khai**, mạng hoàn toàn khoẻ.
      🔴 Nếu tôi khai theo lượt đọc đầu, David sẽ đi **dựng lại chín node đang chạy đúng**. Cùng
      hình dạng gotcha 9b và lượt đỏ đầu của `check-robots` (D-106b).
      ⚠️ **Luật: hai trường tên gần giống nhau trong một API là một cái bẫy đo sai đại lượng — tra
      ĐỊNH NGHĨA trước khi tin cái TÊN.**
      🟢 Kèm: `check-single-source` **bắt chính cổng mới** vì fixture cắm cứng IP máy chủ (D-113).
      Vá **không bằng cách khai ngoại lệ** mà bỏ hằng số đi — fixture nay dùng địa chỉ tài liệu
      RFC 5737. Cổng đã dạy điều đó **trước khi** tệp kịp vào commit.

- [x] **P-20 — 🔴 DANH SÁCH VIỆC TAY HÔ 40 MỤC TRONG KHI CHỈ 8 CÒN PHẢI LÀM** (D-163)
      David: *"tỉa danh sách 40 việc tay đi."*
      🔴 **Vế thứ hai của luật cứng #2.** `gday-preflight` tự khai luật đúng — *"chưa tự động hoá
      thì in ra như VIỆC TAY, không giả vờ xanh"* — nhưng luật đó chỉ chặn **một** hướng hỏng.
      Hướng ngược lại cũng thật: **một danh sách cứ hô công việc ĐÃ XONG thì dạy người đọc LƯỚT,
      và mục bị lướt qua không bao giờ là mục đã xong.**
      Đo: **12 đã xong** (ba trong số đó đo được bằng **chính cổng chạy trong tệp này**) · **18 là
      runbook re-genesis đã chạy ngày G** · **2 đã gạch**. Tám mục cần người, đứng sau ba mươi hai
      mục không. Vô lý nhất: mỗi lượt vẫn đòi **mở cổng staking** (đo được đã mở, 9/9, 100% stake)
      · **phát hành genesis** (đã tải về qua Internet và so hash) · **sửa payout faucet** (đã ship
      `9`/`9`).
      🔴 **Và lập luận này đã nằm sẵn trong tệp** từ `29/08` lúc gỡ B-18 — áp **một lần rồi thôi**.
      *Luật viết ra không tự thi hành; chỉ thứ được ĐO mới thi hành.*
      **Điều kiện qua:** không mất byte nào, và mỗi lượt rút khai **PHÉP ĐO** chứ không phải câu
      trấn an (luật B-17).
      ✅ **ĐẠT — LIỆT KÊ → CHUYỂN → ĐỐI CHỨNG.** Đối chứng số học: **40 = 8 sống + 12 rút + 18
      runbook + 2 superseded**, và `--all-manual` in **đủ 40** kèm lý do. `git diff --stat` xem
      ngay sau lượt sửa bằng script: 90 thêm / 37 bớt, **không có lượt ghi đè cả tệp** (bẫy CRLF).
      ⚠️ **Rút chỉ AN TOÀN ở chỗ có thứ khác canh.** Mục *"mở cổng staking mọi node"* là **thuộc
      tính của tiến trình đang chạy**, không phải việc xong một lần — rút nó **trước khi**
      `check-outsider-bootstrap` tồn tại (D-162, cùng ngày) sẽ là liều lĩnh. Thứ tự không tình cờ:
      **dựng phép đo trước, rút lời nhắc sau.**
      🔴 **Không xoá 18 mục runbook** — chúng là **quy trình cho thế hệ SAU**; xoá là ném đi đường
      tái lập mạng để đổi lấy một màn hình sạch, mà dự án đã trả giá **hai lần** cho một lượt xoá
      trông an toàn (B-17).
      🟢 Kèm: **B-16 và B-20 khai QUÁ PHẠM VI** — nửa phần mềm cả hai đã đóng `01/09`, thứ còn lại
      **không phải phần mềm**: hai bản sao trên **cùng một ổ đĩa**. Nay nói đúng **một lần**, ở
      B-16 — hai mục cho một hành động là hai lời nhắc cho một việc, tức lại đúng bệnh đang chữa.

- [x] **P-21 — B-13(b): số đã ĐO và đã CHỌN — `--offset-ms 3000`** (D-164)
      David: *"làm B-13(b) đi."* Hạn `09/09`, còn 7 ngày.
      🔴 **Công cụ `check-clock-skew` đang in ra một con số NGUY HIỂM và exit 0.** Chain rảnh tuyệt
      đối (cao **22** block · block cuối **7.062 giây tuổi** · 0 block mới trong 20 giây) ⇒ nó in
      **`--offset-ms 7197020`** — **hai tiếng** — mà toàn bộ là **TUỔI BLOCK**. Ai tin dòng đó bắn
      Block Adam **muộn hai tiếng** so với khoảnh khắc nó sinh ra để đánh dấu.
      🔴 **Và tiêu đề của chính tệp đó đã cảnh báo đúng điều này** rồi vẫn đem đi tính bù. *Một lời
      cảnh báo bằng văn xuôi không phải một cái chặn* — cùng bài học với bánh cóc §0 (D-160).
      **Điều kiện qua:** đo được trên chain **đang rảnh**, và cổng **từ chối** nguồn hỏng.
      ✅ **ĐẠT.** Nguồn mới: `info.peers[].lastReceived` — mốc **do chính đồng hồ node đóng dấu**,
      nằm trong **thân JSON** nên Cloudflare không sửa, và **nhúc nhích khi không có giao dịch nào**
      (đo: tiến 14s qua 12s đồng hồ tường trong lúc chain đẻ **0** block). Thiên lệch của nó chỉ về
      phía **an toàn** và bị chặn bởi **giây**, còn tuổi block **không bị chặn bởi gì**.
      **Số chốt:** `+201ms ±649` và `+29ms ±726` (hai lượt cách nhau ~15 phút, **cùng kết luận**) ·
      biên xấu nhất node chậm **697ms** ⇒ **sàn `3000ms` phủ ~4 lần**. `lệch > 0` = node **nhanh
      hơn** máy bắn = chiều an toàn.
      🟢 Kèm cổng mới: `check-clock-skew` nay **exit 1** khi số đo **vượt sàn** — trước đó exit 0 dù
      đo ra yêu cầu lớn hơn, tức con số in trong `BLOCKERS`/runbook/lệnh người gõ có thể hết đúng mà
      không ai biết (hình dạng D-150, đến qua **công cụ** thay vì qua **tài liệu**). Đối chứng
      **trên dữ liệu thật hai hướng**: hạ sàn còn `100ms` ⇒ `EXIT 1` in đúng yêu cầu thật `1889ms`;
      sàn thật ⇒ `EXIT 0`. Đã vào preflight **hai mục**.

- [x] **P-22 — ✅ nửa "câu chữ" của B-13(b) HẾT ĐÚNG, và đó là phép ĐO** (D-164)
      B-13(b) lo: *"nếu bản khắc còn **câu chữ** khẳng định block vượt mốc `2026-09-09T06:09:09Z`
      thì câu đó vẫn phải đúng."* Đọc **bốn tài liệu đã khắc thật** (`docs/engrave/CANON.txt`,
      1.142 byte, đóng băng ngày G): `genesis_inscription` · `dedication` · `dedication_eva` ·
      `love_paper_en`. **Không tài liệu nào khai một mốc thời gian nào.**
      ⇒ Câu lo đó viết `27/08` **lúc câu chữ còn mở**; chữ đóng băng ngày G và **tình cờ không chứa
      lời khẳng định đó**. **Giả định hết đúng mà không ai đánh dấu** — lớp lỗi chung của `01/09`.

- [human] **P-23 — 🔴 RÀNG BUỘC `09/09` KHÁC, và nó KHÔNG phải chuyện đồng hồ**
      `docs/block-adam/CANON.txt` đã ghi: **C-Chain KHÔNG đẻ block rỗng.** Thông điệp `9S Union`
      neo ở `block(Eva) + 9` ⇒ **trên chain im lặng, chín block đó có thể không bao giờ tới.** Hôm
      nay chain đứng ở block **22**, im **hơn hai tiếng** — đây **không phải rủi ro lý thuyết, nó là
      trạng thái hiện tại**. Hai đường, chọn **TRƯỚC** ngày: (a) bật lại bơm nhịp — ⚠️ nó **từ chối
      khởi động** cho tới khi `HEARTBEAT_STOP_AFTER` (`2026-09-01T00:00:00Z`, **đã ở quá khứ**) được
      dời; hoặc (b) **chín giao dịch chèn** có chủ ý (kịch bản nghi lễ đã có sẵn phần chèn).
      Nối vào mục việc tay `heartbeat` bước 2–4.

- [x] **P-24 — 🔴 tôi hỏi lại một câu ĐÃ CHỐT, vì nó còn được viết như đang mở** (D-165)
      Đưa David chọn (a) bật bơm / (b) cửa sổ yên tĩnh cho `09/09` — mà **D-149 đã chốt (b) từ
      `01/09`**, chính David, có bảng so sánh và lý lẽ. Tôi trích `docs/block-adam/CANON.txt` dòng
      43 (*"Two ways, decide before the ceremony"*) **mà không tra `DECISIONS.md`**, rồi còn chép
      cái lạc hậu đó vào **việc tay preflight** một tiếng trước.
      ⇒ **Một câu hỏi đã quyết mà còn viết như đang mở thì không đọc ra lịch sử — nó đọc ra một
      quyết định chưa ai lấy, và người sau lấy lại.** Hình dạng D-150, lần này **trong một tệp CANON**.
      ✅ Sửa cả ba nơi: CANON · việc tay preflight · runbook nghi lễ.
      🔵 Và **mã đứng về phía D-149**: `ceremony-9s-union.mjs` kiểm **CỨNG**
      `evaTx.blockNumber === Adam + 1` — tất định **chỉ vì** chain rảnh thì một giao dịch = một
      block. Kịch bản còn **nêu đích danh cái bơm** là thứ làm mất ô neo (`abort: slot-lost`).

- [x] **P-25 — phương án ghép: bơm chạy trước, TỰ dừng trước cửa sổ** (D-165, David chốt `03/09`)
      D-149 quản **cửa sổ nghi lễ**, không quản mấy ngày trước ⇒ hai việc ở cùng nhau được, và
      **phải** ở cùng nhau: chain im từ ngày G nên nguồn đo tốt nhất của B-13(b) không dùng được.
      Runbook nghi lễ **đã dặn đúng thế**; thứ thiếu là **phần bấm thế nào**, và phần đó có ba bẫy:
      ① `docker restart` **không nạp lại env** ⇒ phải `docker rm -f` + `docker run`
      ② `--restart unless-stopped` **bật lại cả khi thoát SẠCH** — tới hạn ⇒ `exit(0)` ⇒ bật lại ⇒
      cửa hạn chặn ⇒ `exit(1)` ⇒ **vòng lặp** (ngày G: **430** lần, bảy tiếng không ai thấy)
      ⇒ **`--restart on-failure:3`**
      ③ 🔴 **bỏ `/hostfs` theo đúng chữ D-138 thì PHÁ PHANH ĐĨA** — `HEARTBEAT_DISK_PATH=/hostfs`,
      mà `diskFreePct()` dùng `statfs(path)`; mất mount thì nó trả `null`, và `null` **không dừng
      bơm**. Lỗ hổng đóng, phanh gỡ, **không gì kêu**.
      ✅ `df` trên máy chủ: `/` · `/home/ubuntu` · `/var/lib/docker` **cùng `/dev/md3`** ⇒ trỏ
      `HEARTBEAT_DISK_PATH=/srv/a1-config` (đã mount sẵn) cho **đúng cùng con số**, phơi nhiễm **0**.
      Mốc dừng **`2026-09-09T05:39:09Z`** = 30 phút trước mốc thiêng.
      **Lệnh + BỐN đối chứng** (boot · phanh đĩa còn in **phần trăm** · `/hostfs` đã biến mất ·
      **chain thật sự đẻ block**): `docs/CEREMONY-2026-09-09.md` mục 1. **Việc có người bấm** (§4).

- [x] **P-26 — 🔴 D-158 LẶP LẠI: mã bơm nằm ở ĐÚNG MỘT MÁY** (D-165)
      `heartbeat-pump.mjs` — **517 dòng · 22.548 byte** — sống trên máy chủ và **không repo nào
      theo dõi**. Nó sinh ra lời khai *"nhịp sống 9 tx/s"* mà dự án **đã công bố ra ngoài**. Mất
      máy đó là mất cái bơm, và **không cổng nào đo một sự vắng mặt** — `check-deploy-drift` còn
      khai ba tệp `heartbeat-*` vào `knownExtra`, tức **cố ý** không nhìn.
      ✅ Kéo về `local-net/faucet/heartbeat-pump.mjs`, **trùng byte** (`b0b2c5ae…45ed2`, so hai đầu).
      Quét trước khi vào git công khai: **0 khoá EVM · 0 `PrivateKey-` · 0 base58 dài · 0 địa chỉ**
      (bí mật đến từ **env**). **0 dòng tiếng Việt** ⇒ không phình nợ §0.

- [x] **P-27 — 🔴 một BẢN GHI khai một SỰ KIỆN KHÔNG XẢY RA, sống hai ngày** (D-166)
      `docs/GDAY-NODE10-HETZNER.md` mở đầu: *"Hetzner **đã vào genesis g1**."* **Không xảy ra.**
      David chốt `01/09 09:10Z`: cả chín validator genesis chạy **trên OVH**, Hetzner vào sau bằng
      cách **stake như người lạ**. Ba nguồn độc lập đo `03/09`: chain **9 validator trọng số y hệt
      nhau** · máy Hetzner **không có container node nào** · thứ chạy ở đó là `avalanchego` **trần**
      của thế hệ **đã chết**.
      ⚠️ Sống được vì tệp mang dấu `<!-- doc-drift: record -->` nên cổng **cố ý bỏ qua**.
      ⇒ **Luật bổ sung: `record` miễn trừ một SỐ ĐO của hôm qua, KHÔNG miễn trừ một SỰ KIỆN không
      có thật.** *"Lúc đó chúng tôi đo 25.000"* là lịch sử; *"việc X đã xảy ra"* khi X không xảy ra
      là **thông tin sai mặc áo lịch sử** — nguy hiểm hơn số cũ, vì số cũ tự khai ngày của nó.

- [x] **P-28 — dọn đường cho node Hetzner: đo xong, soạn xong** (D-166)
      **Điều kiện qua:** mọi tiền đề được **đo**, và đường đi là **tài liệu công khai**.
      ✅ image 27 patch **đã có**, ba mỏ neo khớp (`commit=…27patch-38723877` · `sha256 2f733249…`
      **trùng byte image OVH** · `g0`=0 `g1`=4 `LOVE9`=2) — 🔴 kèm **đối chứng ống**
      (`avalanchego`=283, `zzqqxx`=0) vì đúng bài này từng qua bằng một **ống gãy**: `strings`
      không có trong image, `grep -c` trên rỗng in `0`, và tiêu chí *"g0 = 0"* **đạt bằng cách
      không đo gì**. ✅ beacon g1 tới được từ Hetzner.
      🔴 Ba thứ phải dọn: tiến trình g0 **đang giữ cổng 9651** (PID `34489`) · `genesis.json` trên
      máy là **bản g0** · `/opt/9chain-a1/data` **541 MB** DB g0.
      🔵 **Quyết định về CÁCH đi: dùng `docs/RUN-A-VALIDATOR.md`, không dùng runbook nội bộ.**
      Runbook nội bộ chỉ chứng minh *"máy này chạy được node"* — thứ đã biết. Đi bằng tài liệu công
      khai thì **mỗi chỗ lệch là một lỗi trong tài liệu người lạ đang cầm**. Kể cả lượt tải genesis
      cũng lấy từ **đúng URL người lạ dùng** — kiểm chạy thật: `11.950 byte`, `sha256 4de8caa5…`,
      `networkID 999999998`.

- [human] **P-29 — 🔴 STAKE node Hetzner (việc David bấm — §4)**
      Giết PID `34489` → **đòi HAI đối chứng rỗng** (`pgrep` và `ss :9651`) → xoá DB → thay genesis
      → chạy **bằng container** → **10 lượt faucet** (không phải 9 — D-161) → `c-to-x` (**chưa ai
      chạy `--issue` bao giờ**) → `x-to-p` → `stake-validator --stake 81`.
      🔴 Ba bẫy: tiến trình đó **không phải container** nên `docker stop` không đụng được, và quên
      giết thì container vào **vòng lặp restart im lặng** · xoá `data/` khi nó **còn sống** thì
      *thành công mà không xoá gì có nghĩa* (Linux chỉ `unlink`) · chạy **container**, không phải
      binary trần (glibc 2.36).
      **Nghiệm thu trên CHAIN:** validator thứ **10** với trọng số khác chín node genesis, **và**
      một node **không phải beacon** thấy nó trong `info.peers` — cho mesh **~70 giây**, đừng chấm
      ở giây 30 (D-121). Đây là thứ biến điều kiện qua **3** và **O4** từ *khai* thành *đo*.

- [x] **P-30 — bơm nhịp: dựng lại XONG và an toàn hơn trước; dừng ở một bước không ai ghi** (D-167)
      David chỉ thị trực tiếp (*"bật bơm đi"*), nên A1 thực hiện theo bộ đối chứng đã soạn.
      🔴 **Lệnh trong runbook do chính tôi viết đã HỎNG** — `grep -E '^(ETHERS_PATH|HEARTBEAT_)='`
      đòi dấu `=` **ngay sau** `HEARTBEAT_` ⇒ `HEARTBEAT_TPS=9` không khớp ⇒ **1 biến** sống sót
      thay vì **7**, bơm sẽ lên **không có `HEARTBEAT_SEED`**. Bắt được vì **chạy thật**, không
      phải vì đọc lại. Đã sửa, **và** biến `wc -l` thành **CỔNG** trong chính khối lệnh
      (`≠ 7 ⇒ dừng + shred + exit 1`) thay vì một chú thích người ta lướt qua.
      ✅ **Ba đối chứng đạt:** phanh đĩa `89% free (floor 20%)` — **phần trăm thật**, chứng minh
      mount hẹp vẫn đo được · `/hostfs` **đã biến mất** ⇒ lỗ D-138 đóng thật (container thôi đọc
      được `console.env`, vì mode `600` **không cản root**) · `on-failure:3` dừng sau **3** lần,
      **không phải 430** như ngày G.
      🔴 **Bơm FATAL: `wallet 0 has no balance`.** Ví suy từ `HEARTBEAT_SEED` nên **địa chỉ không
      đổi giữa các thế hệ**, **số dư thì chết cùng thế hệ cũ**. Cửa chặn là `balance === 0n` —
      chỉ cần **khác 0**: `gasPrice` = **2 wei** ⇒ 4,9 triệu giao dịch tới hạn tốn
      ~**0,0000002 LOVE9**.
      🔴 **Sự thật đó ĐÃ được ghi ở chỗ khác suốt hai ngày** — `heartbeat.json` công khai tự khai
      *"the wallets listed here belonged to the previous generation"* — trong khi việc tay, D-149
      và runbook đều chỉ nói *"bật lại bơm"*. ⇒ **Một sự thật ghi ở một chỗ và một việc giao ở chỗ
      khác thì không tự gặp nhau.** Đã nối: runbook có bước **2b · nạp ví bơm**.

- [human] **P-31 — nạp 9 ví bơm rồi `docker start` (việc David bấm — §4)**
      Chín địa chỉ ở `docs/CEREMONY-2026-09-09.md` bước 2b (và đọc lại được từ log của chính bơm).
      Nguồn và số tiền là **quyết định**, không phải mặc định: chín lượt faucet (9 LOVE9/ví, thừa
      sức) hoặc một lượt chuyển từ quỹ.
      ⚠️ Sau khi nạp **không cần dựng lại** — env trong container đã đúng, chỉ cần
      `docker start 9chain-a1-heartbeat`, rồi đối chứng **(4)**: `eth_blockNumber` hai lần cách
      20 giây, số sau phải **lớn hơn** số trước.

- [x] **P-32 — bơm nhịp ĐANG CHẠY; B-13(b) đo lại bằng ĐÚNG đại lượng** (D-168)
      David nạp chín ví (chín lượt faucet, **9/9 trả `txHash`**). **Đo trên chain, không tin lời
      khai:** `9/9` ví giữ đúng `9.00 LOVE9`, chain đi **22 → 35** (chín drip = chín block).
      ✅ Bật bơm: `status=running`, `restarts=0`, phanh đĩa `89% free (floor 20%)`.
      ✅ Đối chứng sản phẩm: **11 block/20 giây**, block cuối **1 giây tuổi**.
      ✅ **B-13(b) nay đứng trên nguồn [1] `block.timestamp`** — thứ nghi lễ literally so sánh —
      thay cho nguồn gossip hôm qua; cổng **tự chọn** nó vì block đủ tươi:
      `[1] -1419ms ±640` · `[2] -260ms ±640` · biên xấu nhất node chậm **1544ms**
      ⇒ **`--offset-ms 3000` giữ nguyên**, sàn phủ ~2 lần, `EXIT 0`.

- [x] **P-33 — 🔴 lượt bật bơm TỰ TAY xoá mỏ neo thế hệ khỏi bề mặt công khai** (D-168)
      Bản `heartbeat.json` seed tay cho g1 có `network`/`networkID`. **Lượt publish đầu của bơm ghi
      đè tệp mà không có hai trường đó** ⇒ trang công khai nói về thông lượng của **một chain không
      tên**. Đúng lớp D-150/D-154/D-158 — **và lần này do chính lượt sửa của tôi tạo ra**: tôi bật
      một tiến trình ghi đè một tệp mà **không hỏi nó ghi những gì**.
      ✅ Vá bằng **PHÉP ĐO, không bằng hằng số**: bơm hỏi chính node (`info.getNetworkID` +
      `info.getNetworkName`). Hằng số ở đây sẽ là **bản khai thứ ba của `A1Gen` ở ngôn ngữ thứ ba**
      (§6) và sẽ **đọc vẫn đúng thêm một thế hệ sau khi đã sai**. Không đo được thì in `null`,
      **không bỏ trường** — thiếu khoá đọc ra *"build cũ"*, `null` đọc ra *"lượt này không đo được"*.
      Kiểm hai phương thức **tồn tại thật** trước khi ship · trùng byte hai đầu · đối chứng **trên
      bề mặt công khai**: `9chain-a1-g1` / `999999998` / `running: true` / `8.85 TPS`.

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

---

## 🔵 PHIÊN 2026-08-31 (chiều) — ba lượt quét + DIỄN TẬP g1 + **D-132: A1 dẫn dắt**

Hai commit: `a8e3e93` (sửa từ ba lượt quét) · `2facaab` (diễn tập + hai phát hiện của nó).

### Quyết định

- [x] **D-132 — A1 là chain DẪN DẮT; C1 và mọi testnet sau follow theo A1.** Mở rộng D-041
      sang đúng phần D-041 loại trừ (khắc chữ). **Không hồi tố:** byte g1 vẫn lấy từ bản đóng
      băng `07/08` của C1 — đổi là mất `G5e`. Canon là **của 9Chain**, C1 chỉ là nhân chứng
      đầu tiên; A1 là nhân chứng **kiểm được bằng một lệnh**.
      🔴 **Việc kèm theo, chưa làm:** báo C1 + BOD (họ có thể đang chờ giao ASV theo chiều cũ).

- [x] **D-133 — canon khắc chữ của A1 ĐỨNG MỘT MÌNH** (`bbddc25`). David: *"tách ra hoàn toàn"*.
      Đo trước khi cắt: **tài liệu người dùng đã sạch sẵn**, dính chỉ ở **một đường** — đường
      khắc chữ. Nay `docs/engrave/CANON.txt` là canon của riêng A1; bản đóng băng `07/08` hạ
      xuống làm `attestation-2026-08-07.txt` — **vật chứng, không phải phụ thuộc** (bản dựng
      không đọc nó).
      🔴 **Cái giá đã viết ra:** cổng so A1 với chính A1 chỉ chứng minh **nhất quán nội bộ** —
      hình dạng **D-112**. Thứ đỡ nó là bốn hash trùng khít bản đóng băng **có ngày tháng, ở
      nơi khác, trước đó**; nên bản cũ **giữ chứ không xoá**.
      **Đối chứng:** netgen chạy lại với canon mới ⇒ vân tay `f04e939b…366b18` **không đổi**,
      `khac chu: 4/4`, `1.142` byte y nguyên. **Dịch giấy tờ, không dịch một byte lên chain.**
      🔴 **Chưa tách được:** netgen còn **in** `"khop ban dong bang cua C1"` + hàm
      `verifyAgainstC1` — nằm trong `patches/` (luật cứng #3) ⇒ **hoãn sau ngày G**, gộp cùng
      D-132 §4. Ngày G nó là **chữ in sai tên**, không phải hành vi sai.

- [x] **Tài liệu người dùng bỏ phần khảo cổ tên miền cũ** (`8820f48`). David: *"ko hiển thị nội
      dung kiểu này."* Cả hai bản ngôn ngữ nay chỉ đưa **việc phải làm** (xoá mạng đã lưu, thêm
      lại bằng nút) kèm **triệu chứng** (ví dùng cấu hình cũ báo lỗi kết nối **giống hệt mạng
      chết** trong khi mạng vẫn sống), không kể lịch sử. `grep -c "rpc-testnet-a1"` = **0** ở cả
      hai. PDF dựng lại: EN 200 KB · VI 210 KB.
      ⚠️ Ảnh David gửi là **bản WEB** của trang này — nằm ở worktree `web-home`, **luật cứng #4**,
      phiên này **không đụng**. Sửa bản web là việc của phiên đó.

- [x] **D-134 — quét toàn diện trước giờ G** (`d9f636a` · `dcfd4e2`). David: *"đưa lên bản chuẩn
      nhất, sạch nhất, mọi lịch sử bắt đầu từ giờ G."*
      🔴 **Hằng số neo vào thế hệ là một LỚP lỗi:** cùng literal `999999998`/`999999999` chép cứng
      ở **ba** tệp cổng. Nặng nhất: `wallet-over-tunnel.mjs` — công cụ **ký bằng khoá quỹ** — mặc
      định networkID là **g0 đã chết**, và ca đối chứng của nó đang **đòi mạng SỐNG bị từ chối**.
      Cả ba nay **suy ra** từ `A1_GEN`/`A1_ID_GOC`. `check-keys-on-chain --self-test` **5/5 đỏ**.
      🔴 **README khai ba điều SAI**, nặng nhất: *"25 patch, tree `f2b9486b`"* — thật ra **26 /
      `60a61707`**; `f2b9486b` là tree của **đối chứng**. Người ngoài làm theo sẽ **khớp một hash
      đã công bố và build ra binary sai**. Nay **tiếng Anh là bản nguồn**, VI sang `README.vi.md`.
      Bỏ bảng chép tay thư mục `net*` (bản chép cứng đầu ra của một cổng + bản đồ chỗ giữ tiền).
      🔴 **"Lịch sử bắt đầu từ giờ G" KHÔNG áp cho `chainid-issued.json`** (49 chainId · 54 tên):
      đó là danh sách chặn **xuyên thế hệ**; reset = thả 54 tên trở lại lưu thông và mở đường phát
      lại chữ ký. Ba thứ phải qua ngày G **nguyên vẹn**: sổ này · `patches/` · `docs/evidence/**`.
      🔴 **Ba việc là quyết định của David:** (a) `main:web/lib/chain.ts` khai `networkId: 9001`
      — luật cứng #4 cấm phiên này sửa ⇒ merge `web-home` hoặc gỡ `web/` khỏi bản công bố;
      (b) repo công khai **công bố cả sổ nội bộ** (quét khoá = **0**, nên đây là lựa chọn chứ không
      phải sự cố); (c) đẻ chain **đang MỞ**, chain đẻ hôm nay **chết ngày mai**.

- [x] **D-135 — ĐÓNG cổng đẻ chain trên SẢN PHẨM** (`31/08`, David chốt). `A1_DE_CHAIN_MO=1 → 0`
      trong `~/9chain-a1/console.env` (sao lưu `console.env.bak-before-close-20260831`; `diff` ra
      **đúng 2 dòng**, `wc -l` 16 → 16), khởi động lại bằng `~/9chain-a1/console-restart.sh` —
      **PID 751090 → 1143490**, tức bản mới thật sự đang phục vụ, không phải bản cũ còn giữ cổng.
      **Nghiệm thu trên đường người dùng đi** (`POST /console/api/create` qua Cloudflare + Caddy):
      **HTTP 400** kèm **văn bản của chính cái cổng**, không phải lỗi tên / 401 / hạn mức ⇒ đỏ **vì
      đúng lý do**. Gửi tên **không hợp lệ** để dù kết quả thế nào cũng **không đẻ ra chain thật**.
      Bốn mặt công khai vẫn 200; node vẫn `networkID 999999999`; **thu hồi không bị chặn** (cố ý).
      🔴 **Lộ ra:** server đang chạy sổ chặn **47 · 53**, repo là **49 · 54** — thiếu đúng hai
      chainId của Eric. Vô hại khi cửa đóng; **phải đẩy lên TRƯỚC khi mở lại sau ngày G.**

- [x] **D-135b — đã đẩy `chainid-issued.json` lên server** (`31/08`). Kiểm **TRƯỚC** khi đẩy:
      repo **chứa trọn** server (`sẽ MẤT: không có gì`; thêm `9000000010`, `9000000011`, `Eric1`).
      Tên chỉ +1 vì `loiTenDaCap` tra bằng khoá **chữ thường** — đo trên đúng bộ byte vừa đẩy:
      `Eric1`/`eric1`/`ERIC1`/`  eRiC1  ` **đều bị từ chối**, tên chưa dùng **vẫn tự do**.
      `scp` ⇒ server `d1e20037…` **trùng byte** repo; restart **PID 1143490 → 1145349**; banner
      **`49 chainId · 54 tên (gộp từ 5 sổ)`**. Xoá `.bak` (bộ byte cũ tra được ở `d360d33b`, giữ
      lại là **đường lui vào danh sách chặn YẾU HƠN** — D-092b/D-098): LIỆT KÊ → XOÁ → ĐỐI CHỨNG.
      Drift: `chainid-issued.json` rời danh sách LỆCH, mồ côi **5 → 4**. Cửa vẫn `🔒 ĐÓNG`.
      🔴 **Giới hạn:** cửa đóng nên **không đo thẳng** được việc chặn tên qua `/api/create`.
      🔴 **Còn 7 tệp mã LỆCH**, trong đó `CREATE-A-CHAIN.md` **đang hứa** `MyChain`=`mychain` mà
      `server.mjs` trên server **chưa có bản vá đó** — ship console trước khi tài liệu tới tay ai.

- [x] 🔴 ~~**D-136 — giờ G `00:00`**~~ → **ĐỔI sang D-136c cùng ngày**. (Số học múi giờ vẫn đúng.)
      = **`2026-08-31 21:00:00Z`** = `01/09 04:00` giờ Việt Nam. Israel còn DST tới `25/10` nên
      lệch là **+3**, không phải +2 (đo bằng `Intl`/`Asia/Jerusalem`, không chép tay).
      ⚠️ **Bẫy:** *"ngày 01/09"* nghe như sáng mai, nhưng mốc thật là **21:00 UTC HÔM NAY**; máy
      chủ chạy `Etc/UTC` nên lịch trên đó vẫn ghi `2026-08-31` ở đúng thời điểm giờ G.
      Giờ G là **mốc VẬN HÀNH**, không đi vào `genesis.json` (`StartTime: now-60` luôn động) —
      đừng đẽo chỗ cắm nó vào genesis.

- [x] 🔴 ~~**D-136c — giờ G `09:09:09` Jerusalem**~~ → **ĐỔI sang D-136d cùng ngày**.
      = **`01/09 06:09:09Z`** = `01/09 13:09` giờ VN. Đổi vì mốc cũ chỉ còn **4h11m** trong khi
      riêng *bump → sinh lại 26 patch → build image → `docker save|ssh|docker load`* đã có thể ăn
      1,5–2h **và phải xong TRƯỚC `down -v`**. Mốc mới cho **13h16m**.
      ⚠️ Mốc mới rơi vào **`01/09` ở CẢ BA đồng hồ** ⇒ **hết bẫy** *"lịch server (`Etc/UTC`) còn ghi
      `31/08`"* mà mốc `00:00` mang theo.
      🔴 **GO/NO-GO ở mốc `01/09 02:09Z` (VN 09:09):** image chưa nằm trên server **và** chưa tự
      khai đúng `commit=` ⇒ **KHÔNG bấm `down -v`**. Hoãn rẻ; `down -v` thiếu binary đúng là **mất
      g0 mà không dựng được g1**. Cổng đẻ chain đang ĐÓNG nên hoãn không tốn gì cho người dùng.

- [x] 🔴 **D-136d — GIỜ G CHỐT: `2026-09-01 13:09:09` giờ Jerusalem** = **`01/09 10:09:09Z`**
      = `01/09 17:09` giờ VN (David chốt `31/08`).
      🔴 **Tôi đã nói SAI ở lượt trước** rằng mốc `09:09:09` Jerusalem *"nằm gọn trong 01/09 theo
      mọi múi giờ"*. Đo lại: ở mốc đó **cả bờ Tây Mỹ trở đi vẫn còn `31/08`** (LA `23:09`, Hawaii
      `20:09`) — **59,2 triệu người**.
      Sự thật tổng quát: múi giờ trải **26 giờ**, ngày có **24** ⇒ **không khoảnh khắc nào cả thế
      giới cùng một ngày**, không riêng 01/09. Cửa sổ của `UTC+14` và `UTC−12` **rời nhau 2 giờ**.
      ⇒ Quét từng phút suốt 50h, cân theo dân số: **đỉnh là `01/09 10:00–11:00Z`, phủ 99,999%**,
      bỏ lại **~55.000 người**. `13:09:09` Jerusalem nằm giữa cửa sổ đó — **bỏ lại ít hơn mốc cũ
      1.000 lần** mà vẫn giữ `09:09` trên đồng hồ.
      ⚠️ Cái giá: **Kiribati đã sang `02/09`**. Không mốc nào cứu được cả Kiribati lẫn Hawaii —
      chọn bỏ **8.800 người** thay vì **1,44 triệu**.
      🔴 GO/NO-GO ở `01/09 06:09Z` (VN 13:09): image chưa trên server ⇒ **không bấm `down -v`**.

- [x] 🔴 **Việc tay #10 + #11 của preflight: ĐÃ XONG TỪ TRƯỚC — đo được, không phải tin.**
      `A1Gen` đã bump ở **cả hai ngôn ngữ** (Go `A1Gen=1` · `A1Name="9chain-a1-g1"` ·
      `A1NameTap="9chain-a1-tap-g1"`; JS `A1_GEN=1`) **và** bộ patch đã sinh lại: **patch 0026**
      chính là lượt bump, nằm trong bộ 26 đã công bố. Bằng chứng khép kín: cây fork làm việc
      `git rev-parse HEAD^{tree}` = **`60a61707…`** = **`TREE_FORK`**, **0 thay đổi chưa commit**.
      ⇒ Không còn nguy cơ *"bump ở cây làm việc mà bộ patch công bố vẫn khai `A1Gen 0`"* (CLAUDE.md
      luật cứng 3). **Còn 34 việc tay, không phải 36.**

- [x] 🔴 **D-142 — TỔNG DUYỆT TRÊN BĂNG THẬT** (networkID `999999998`), rồi shred ngay (`31/08`).
      David: *"chạy lại chain chính luôn xem như diễn tập chain chính."* Câu đó có **hai cách đọc**;
      tôi đọc là **cấu hình chain chính, vẫn trên máy dev**. **Không đụng máy chủ** — g0 còn sống tới
      giờ G, `down -v` sớm 15 tiếng là mất g0 mà chưa có gì thay.
      🔴 Chạy ở băng thật = **tự đẻ ra con mồi nhử `net-that-g0`** (D-110). Trả giá bằng: tên thư mục
      không thể nhầm · **shred ngay trong phiên** · **tháo ngòi** (xoá `genesis.json`+`allocation.md`
      ⇒ `check-net-dirs` chấm `INCONCLUSIVE`, nó **không còn tự khai là băng thật**).
      **Đối chứng ngược chạy TRƯỚC:** `A1_HTTP_ALLOWED_HOSTS='*'` ⇒ **FATAL**, và thông báo tự nói
      *"mạng TẬP không bị chặn"* — cổng **phân biệt được hai băng**, không chặn bừa.
      **Đo:** binary `commit=…g1-26patch-60a61707` · **networkID 999999998** · **9/9 validator**,
      node1 thấy **8 peer** · `eth_chainId 9000000009` · `LOVE9` · `supplyCap` từ log node · chữ khắc
      **1273 byte, sha256 = extraData**, vân tay **y hệt băng tập**.
      🔴 **Phép đo chỉ có ở BĂNG THẬT:** đường dẫn DB = **`9chain-a1-g1`**, KHÔNG phải
      `network-999999998` ⇒ `A1Name` **có trong bản đồ binary**, nhánh dự phòng (`FallbackHRP`,
      thứ patch 0013 diệt) **không bị đi vào**. Băng tập **không kiểm được điều này** vì tên nó khác.
      **Dọn:** hai bộ, **38 tệp khoá** shred `-u -n 3`, đối chứng **0 còn lại**.
      🔴 Lần đầu con số hiện ra: **18 `staker.key`/`signer.key` mỗi bộ** — danh tính validator LÀ
      khoá riêng, và `check-key-leaks.mjs` **không canh chúng** (B-20).
      ✅ **Đã xoá cả hai thư mục.** Kiểm trước: **0 tệp tracked · 0 khoá riêng**; còn lại chỉ
      `staker.crt` (chứng chỉ CÔNG KHAI) và `engraving.md` — vân tay trong đó đã có trong DECISIONS.
      Đối chứng: `check-net-dirs` không còn liệt kê chúng. Chỉ còn **B-19** đỏ (90,007 LOVE9).

- [x] 🔴 **D-141 — hai phát hiện nữa từ bản diễn tập** (`31/08`).
      (1) **`make-l1-genesis.mjs` TRA sổ nhưng KHÔNG ghi lại** ⇒ chỉ an toàn **đúng một lần**: L1 #1
      và L1 #2 đẻ cách nhau vài phút **cùng nhận `chainId 9001000000`**. Console an toàn vì **chính
      nó** ghi vào `console-chains.json`; đường CLI **không có bước đó**. Với MetaMask hai chain cùng
      chainId là **MỘT mạng**, và EIP-155 buộc chữ ký vào chainId ⇒ **phát lại được**. Đúng lỗ D-069,
      trên đường nó không phủ. **Đã vá bằng cảnh báo lớn** (đối chứng: tự chọn ⇒ có, khai tay ⇒ không,
      chạy hai lần ⇒ cùng số; `--self-test` 13/13). Sửa tận gốc (ghi ngược vào sổ) **hoãn sau ngày G**.
      (2) 🔴 **Cái bẫy "giao dịch đầu tiên" KHÔNG tái hiện.** Trên L1 mới toanh, block 0:
      `eth_estimateGas` = **56.070** vs thực dùng **55.270** ⇒ **ước lượng đúng, dư 1,4%**. Cả 4 ca
      **thành công**, kể cả ca 1 (deploy làm giao dịch đầu tiên) mà tài liệu nói sẽ hỏng.
      ⚠️ Giới hạn: một preset, hợp đồng rất nhỏ, băng TẬP ⇒ **chưa đủ để xoá** cảnh báo khỏi
      `CREATE-A-CHAIN.md`. **Cần David quyết sau khi đo lại trên L1 THẬT đầu tiên sau giờ G.**
      Tôi **không tự sửa tài liệu công khai dựa trên một lượt diễn tập.**
      (3) ⚠️ **Bài kiểm đầu của tôi SAI** — để `ethers` tự lấy nonce ⇒ ca 2–4 đỏ vì
      `nonce has already been used`. **Lỗi ở bài kiểm, không ở chain**, đúng bẫy đã ghi cho
      `load-test.mjs`. Đọc vội thì ba ca đó thành *"chain hỏng"*. Nay quản nonce tường minh.

- [x] 🔴 **D-140 — ĐẺ L1 TRÊN BẢN DIỄN TẬP: tái hiện ĐÚNG lỗ hổng ngày G** (`31/08`).
      Lượt quét `31/08` cảnh báo *"nạp `chain-factory` X→P có **0 dòng** trong runbook"*. Bản diễn
      tập **dựng lại nguyên vẹn** cảnh báo đó bằng một lỗi dừng hẳn:
      `LỖI CreateSubnetTx: insufficient funds: needed 2196 more nAVAX` — trong khi quỹ Foundation có
      **X-Chain 71.000.009 · P-Chain 0**. **Thanh khoản genesis ở X, CLI trả phí ở P.**
      🔴 Và `create-l1` (+ `create-l1.sh`) cắm cứng **khoá ewoq**; đo được `ewoq` xuất hiện **0 lần**
      trong `allocation.md`/`genesis.json` ⇒ đường đó **không chạy được trên mạng netgen nào**.
      Đường đúng là `9chain-a1-cli l1 create` với `A1_CLI_KEY`.
      **Bốn dòng runbook còn thiếu nay đã chạy thật:** `xp-wallet` chạy TRONG container node (Host là
      `127.0.0.1`; đi vòng ngoài là **403** — cổng M11.10) → `POST /api/x-to-p` → **đo trên node**
      (`platform.getBalance` = 999,99999173) → mới `l1 create`.
      Kết quả: subnet + blockchain, **9/9 validator đăng ký**, healthy 40s, L1 phục vụ 10s.
      🔴 **Phép đo quan trọng nhất:** `eth_chainId` = **`9001000000`** — **nằm trong khối g1**,
      **KHÔNG** nằm trong khối g0. Đó là bằng chứng `A1_GEN` đi trọn từ hằng số Go/JS →
      `make-l1-genesis.mjs` → genesis L1 → **con số ví người dùng thấy**, và nó vào genesis **bất biến**.
      Admin nhận 50.000.000 token, **`alloc` không có ewoq** (D-114).
      ⚠️ Hai chỗ tôi vấp: (a) một ví chạy **sai khoá** vẫn trả `200` — dấu hiệu duy nhất là **địa chỉ
      in ra khác địa chỉ mình mong** ⇒ **đọc `xAddr` trước khi tin số dư**; (b) image node **không có
      `ps`/`pkill`**.

- [x] 🔴 **D-139 — DIỄN TẬP NGÀY G ở băng TẬP g1: `engrave-verify` 17 đạt · 0 hỏng** (`31/08`).
      networkID **`899999998`** trên máy dev — băng tập **không bao giờ bắt tay được** mạng thật,
      an toàn **theo kiến trúc**. Cần lượt này vì **canon khắc chữ vừa đổi hôm nay** (D-133), và
      một canon chưa đi hết đường tới chain thật là canon **chưa được kiểm**.
      Lượt 1 **bị từ chối đúng thiết kế**; việc tay #20 làm **bằng máy**: 4/4 hash trong `CANON.txt`,
      **4/4 phân biệt**, `lang` đúng id, và 4/4 **cũng có trong `attestation-2026-08-07.txt`** —
      bản đóng băng có ngày, viết ở nơi khác, TRƯỚC đó. Vân tay xác nhận **đã ở trong git từ trước**.
      Lượt 2: 9 node · self-bond `9 × 999.999` · 🔴 sửa **9 dòng `image: :dev` → `:g1`** trước `up`.
      ⚠️ Đụng subnet với faucet dev ⇒ **dời bản diễn tập** sang `172.29.`, **không xoá gì của David**.
      **Đo trên mạng thật:** binary `commit=…g1-26patch-60a61707` (đúng image đã ship) · 9/9 validator
      · `eth_chainId 9000000009` · `supplyCap` đọc từ log node · `LOVE9` giải được · **`AVAX` ĐỎ kèm
      lý do**.
      🔴 **Một giả định của tôi sai:** đọc ra 1274 byte ≠ 1273 khai, JSON không parse, sha256 không
      khớp — **ba số lệch cùng lúc = MỘT giả định sai**. `byte[0]=0x00` (STOP, mã cố ý không chạy
      được); bỏ ra ⇒ **1273 byte · JSON hợp lệ · sha256 = đúng `extraData`**.
      Mạnh nhất trong 17 mục: **`block 0 parentID == sha256(genesisBytes)`** (mỏ neo đọc được chữ
      khắc P-Chain từ node đang chạy, dù `Message` là trường CHỈ GHI) + **bản văn trên MẠNG == trong
      TỆP**. Chạy qua `--network container:` vì đi vòng khác là **403** — cổng M11.10, đừng nới.
      🔴 **Nợ dọn:** `net-tap-g1b/keys.txt` + `faucet.env` phải `shred -u -n 3` khi dọn (D-107).

- [x] **VIỆC 3–5 TRƯỚC `down -v` ĐÃ CHẠY** (`31/08`). Sổ chain: `--pull` (2 sống · repo biết 55
      ⇒ *không có gì sắp mất*) → `gen-chainid-issued --write` (**49 · 54, không đổi** ⇒ server đang
      đúng) → `--compact` ra `docs/archive/console-chains-closed-g0-2026-09-01.json`.
      🔴 Thêm cờ `--at`: `thuHoiLuc` từng đóng dấu **giờ chạy lệnh**, tức khai 2 chain người thật
      *"đã thu hồi"* trong khi chúng còn phục vụ **17 giờ nữa**. Nay đóng dấu đúng giờ G.
      **H-6b ĐẠT · 26 patch**, hai nơi, clone ngược khớp tree ở **cả dev lẫn máy chủ**.
      **O2 XONG**: P 29 · X 5 · **C 96.173** · 2 L1 · 14 tệp · **1,32 GB**. Nghiệm thu **hai đường**
      (công cụ dự án 14/14 · `sha256sum -c` chuẩn). Neo đã **công bố ra ngoài server**:
      `4432d62a…7b63` (`docs/o2-g0-final/`).
      🔴 Lượt đầu **CHẾT THẬT**: `RangeError: Invalid string length` — 96k block nối thành MỘT
      chuỗi vượt trần V8. Sửa bằng gom `Buffer`. Chain 26/08 quá nhỏ nên chưa bao giờ lộ.

- [x] 🔴 **D-138 — truy ra `heartbeat-*`, ba phát hiện** (`31/08`). David hoãn B-16/B-19/heartbeat
      sang ngày G; riêng heartbeat **mất dấu vết sau `down -v`** nên truy ngay (chỉ đọc).
      (1) Thủ phạm: container **`9chain-a1-heartbeat`**, chạy 2 ngày, **KHÔNG thuộc compose nào**
      ⇒ **container thứ hai không ai canh** (như console). Dừng êm: `touch …/heartbeat.stop`.
      (2) 🔴 `HEARTBEAT_STOP_AFTER=2026-09-01T00:00:00Z` — **tự dừng sớm hơn giờ G 10h09m** ⇒ mạng
      công khai **im lặng hoàn toàn 10 tiếng** ngay trước lượt sinh lại. **Cần David quyết**: để
      nguyên, hay dời cho khớp giờ G (`docker rm -f` + `run`, vì `restart` không nạp env).
      (3) 🔴 Container bơm tải mount `/ → /hostfs`, chạy **root**, userns **OFF** ⇒ **đọc được
      `console.env`** (đã đo: 800 byte) tức `A1_CONSOLE_TOKEN`/`A1_CLI_KEY`/`FAUCET_PK`. Không phải
      xâm nhập, nhưng **bán kính thiệt hại lớn hơn nhu cầu rất nhiều**. Ngày G dựng lại nó (seed g1)
      — **thu hẹp mount ngay lúc đó, không tốn thêm bước**. ✅ `~/.ssh/` chỉ có `authorized_keys`.
      (4) Hoãn B-16/B-19 **đúng**: tiền 90.007 LOVE9 và bộ khoá g0 **chết cùng g0**; bộ đáng làm
      B-16 là **g1**, chưa tồn tại. 🔴 Điều kiện: **đừng shred gì của g0 tới khi g1 xanh** — hỏng
      lượt sinh lại thì g0 lại có giá trị trở lại.

- [x] 🔴 **D-137 — IMAGE `g1` ĐÃ NẰM TRÊN SERVER** (`31/08 17:13Z`). **Rủi ro lớn nhất của ngày G
      đã đóng, sớm hơn hạn KHỐI 0 gần 13 giờ.**
      Không phải build lại: image có sẵn từ lượt diễn tập `30/08` (D-128) ⇒ **cắt đôi đường tới hạn**.
      🔴 Nghiệm thu bằng **hai mỏ neo có gốc độc lập**, vì nhãn `:g1` không chứng minh gì:
      (a) binary tự khai `commit=9chain-a1-g1-26patch-60a61707`; (b) nội dung nhị phân —
      `9chain-a1-g1` **4 lần**, **`9chain-a1-g0` 0 lần** (đối chứng ngược), **`LOVE9` 2 lần**
      (⇒ patch 0019/0022 CÓ trong image; thiếu nó là **mọi ví X/C chết câm** mà 9/9 node vẫn xanh).
      `commit=` một mình **không đủ** — nó là chuỗi gõ vào `--build-arg`, nói người build KHAI gì
      chứ không nói binary CHỨA gì.
      Chuyển `docker save | gzip | ssh | docker load` — **30 giây**. Rồi **đo LẠI cả ba phép trên
      chính máy chủ**: trùng khít bản dev. *"Đã load" không phải phép đo.*
      Đường lui: `node:g0` **vẫn còn trên server**, đĩa còn 342G/410G.
      ⇒ **Việc tay #14 · #15 · #17 ĐẠT. Còn 31, không phải 34.**

- [x] **D-136b — ship console lên server** (`31/08`). Bốn tệp đi: `console/server.mjs` ·
      `console/index.html` · `console/chainid-test.mjs` · `lib/guard.mjs`.
      🔴 **Giữ lại `lib/chainid.mjs`** (khác đúng một dòng `A1_GEN 0→1`): mạng đang là **g0**, đẩy
      hôm nay là đặt console vào **lệch thế hệ vĩnh viễn**. Tệp đó đi **cùng lượt bump ở giờ G**.
      Đo phụ thuộc trước: `server.mjs` mới cần 7 export và `chainid.mjs` cũ **có đủ cả 7**;
      `guard.mjs` **thuần cộng thêm** nên faucet/siwe cũ vẫn chạy; `requireInt` vắng env ⇒ mặc
      định, `"fifteen"` ⇒ **từ chối kèm lý do**. Sao lưu `rollback-console-20260831/` (4 tệp +
      sha256) → scp **trùng byte cả 4** → restart **PID 1145349 → 1148847**.
      Banner: `thế hệ ✅ g0 · 999999999` · `49 chainId · 54 tên` · `🔒 ĐÓNG` · `trần L1 15`.
      Sản phẩm: `/console/api/create` ⇒ **400** kèm văn bản của cổng; 4 mặt công khai **200**.
      **Drift `12 khớp · 7 lệch` → `16 khớp · 3 lệch`** (còn `chainid.mjs` giữ có chủ ý,
      `faucet/server.mjs`, `export-chain.mjs`).

### Cổng — preflight offline **14 → 20**, và một cổng đã ĐỎ suốt một ngày

- [x] **`check-net-dirs --self-test` đang ĐỎ từ lượt bump `A1Gen 0→1`** (`30/08`): một ca đối
      chứng cắm cứng `999999998` làm *"thế hệ SAU"*, mà số đó **thành networkID SỐNG** ở lượt
      bump. Đúng lớp **D-124**, một tệp xa hơn — và ẩn được vì preflight chỉ chạy **7/15** bộ
      tự kiểm trong repo. Sửa sang lệch tương đối ⇒ **19 đạt**; nối thêm **6** bộ tự kiểm vào
      preflight.
- [x] `check-clock-skew` đo **đồng hồ của Cloudflare**, không phải của node — đo được
      `server: cloudflare` + `cf-ray …-CDG` trên `rpc-a1.9chain.org`. Nay đọc `block.timestamp`
      qua `eth_getBlockByNumber` (giá trị **do node sinh**, proxy không đổi được). Số đầu tiên:
      node **−1569ms** vs Cloudflare **−952ms**, node ở **chiều nguy hiểm**; bù `3000 → 3025`.
- [x] `h6b-backup --check` **mù hoàn toàn với cây fork**: `DUONG_MA` có `upstream`, nhưng
      `.gitignore` có dòng `upstream/` ⇒ `git ls-files upstream` = **0**. Số patch là proxy duy
      nhất. `manifest.env` đã ghi sẵn `FORK_TREE` mà `doc_manifest()` vứt đi. Nay so thật.
- [x] `gen-network.sh` mount gốc repo ở `/repo` + **từ chối** `A1_ENGRAVE` ngoài `/repo,/out,/src`.
- [x] `requireInt` trong `guard.mjs` — `Number(env || d)` biến typo thành `NaN`, mà mọi phép so
      với `NaN` là false ⇒ `A1_MAX_L1=fifteen` **xoá sạch trần 15 L1**. Nay từ chối khởi động.
- [x] `console/index.html:302` in **id preset** thay vì tên (`.ten` — khoá đã chết từ D-108).
      Cùng tàn dư D-129 bên `web/`, không sang tới trang của chính console. `/api/status` xác
      nhận: preset về dạng `{id,name,desc}`, **không có khoá `.ten`**.
- [x] Faucet: cooldown địa chỉ nay kiểm **trước** khi tiêu suất IP · `lastDrip` có bộ quét.
- [x] `export-chain`: đứt giữa chừng nay tính là **CẮT**; `tip.json` ghi `blocksExported`/`complete`.
- [x] `watch-network` + `check-key-leaks` neo theo **thế hệ**; thế hệ chưa khai ⇒ **không đo
      được (2)**, không phải `0` câm.
- [x] `MANUAL_TASKS` **25 → 31**: `A1_CONFIG_DIR` · `--build-arg A1_COMMIT=` ·
      `gen-chainid-issued --write` · `engrave-verify --rpc` · dời neo hằng số thế hệ · đọc bảng
      tài liệu trước khi xác nhận vân tay.

### Diễn tập g1 — băng TẬP `899999998`, 3 node, image `:g1`

- [x] **Đường khắc chữ trong tài liệu CHẠY ĐƯỢC — lần đầu tiên trong repo.** `engraving.md`
      sinh ra; trước đó **không thư mục `net*` nào** có tệp đó.
- [x] `engrave-verify` trên chain SỐNG: **15 đạt · 0 hỏng**, có mục `[5] Mạng đang chạy`.
      `parentID` block 0 P-Chain `==` `sha256(genesisBytes)` ⇒ **điều kiện qua số 2 nghiệm thu được**.
- [x] Block Adam ở thế hệ 1: **10 đạt · 0 hỏng**, gồm phép **neo ngược**. Block Adam ở mốc **+3s**.
- [x] Gotcha 16 tái hiện đúng D-105: netgen ghi `image: :dev` **3 lần**. Vá, đo `:g1` ×3 / `:dev` ×0,
      rồi **đo BINARY**: `commit=9chain-a1-g1-26patch-60a61707`.
- [x] Dọn: 3 container + 3 volume + network · **11 tệp khoá `shred -u -n 3`** ·
      `check-key-leaks` **exit 0** · 55/58 container dự án khác **không đụng**.

🔴 **Hai thứ diễn tập tìm ra:**

1. **Cổng đối chiếu C1 của netgen KHÔNG bắt được manifest gán nhầm tài liệu** — đúng ca mà câu
   lỗi của chính nó mô tả. Nó neo bằng `Contains(dòng, tên_tệp) || Contains(dòng, id)`, mà
   `file` là trường một lượt gán nhầm sẽ đổi. Trỏ `drill-charter-he` vào tệp tiếng Anh vẫn nhận
   `✓ khac chu: 3/3 … (hash VA ten tep)`. **Freeze của C1 (dạng `title  hash`, không có tên tệp)
   vá lỗ này** — chỉ `id` neo được ⇒ gán nhầm bị bắt. ⇒ Đặt `id` manifest **trùng `title` C1**,
   tệp đặt `<id>.txt`, **đừng đặt trần `<id>`**.
2. Tôi viết một câu **không phải phép đo** (khẳng định "proxied by Cloudflare" cho `127.0.0.1`).
   Nay đọc `cf-ray`/`server` và chỉ nêu khi có thật.

- [x] **Byte chữ khắc: TÌM ĐƯỢC, tái lập đúng cả 4 hash đóng băng.** Nằm inline trong
      `9Chain-C1/9chain-operator/config/samples/chain_love9.yaml` dòng 611–617. Dạng **`body
      as-is`** — không NFC/NFD, không thêm bớt xuống dòng. `genesis_inscription` **108 B** ·
      `dedication` **25 B** · `dedication_eva` **45 B** · `love_paper_en` **964 B** ⇒ bộ khắc
      thật **1.142 B**, **NHỎ HƠN** bản tập `1.328 B` ⇒ đường ống đã kiểm ở đúng cỡ.
      🔴 **Một nguồn duy nhất:** không `genesis.json` nào trong C1; ba tài liệu ngắn **không có
      tệp riêng**. Khắc lên A1 là tạo bản bất biến **thứ hai**.

### 🔴 Còn mở

- [human] **`cChainAddress`** — vĩnh viễn, netgen cố ý không có mặc định. **Chặn bộ khắc.**
- [human] **Xác nhận bỏ `ASV 1901` cho g1** (D-132 giải thích vì sao không tự đóng băng).
- [x] **G-2 — `docs/RUN-A-VALIDATOR.md` ĐÃ VIẾT** (điều kiện qua số 5). Tiếng **Anh** — người đọc
      là cộng đồng quốc tế, đúng lý do §0 tồn tại. 11 chỗ `FILL-ON-G-DAY` (sha256 genesis · nodeID
      + `IP:port` beacon · `A1_COMMIT` · kênh liên hệ · nguồn 25.000 LOVE9); **cổng xuất bản:**
      `grep -c FILL-ON-G-DAY` phải `= 0`.
      🔴 **Viết nó lộ ra chỗ hở lớn nhất của điều kiện 5** — xem mục ngay dưới.
- [human] Điều kiện qua **4**: GitHub repo rỗng (5 phút).
- [human] 🔴 **MỞ CỔNG STAKING TRÊN MỌI NODE, không chỉ beacon — nếu không, KHÔNG người ngoài nào
      validate được.** `scripts/open-p2p-all-nodes.py` xuất hiện **0 lần** trong `gday-preflight.mjs`
      và **0 lần** trong `docs/TESTNET1-PUBLIC-2026-09-01.md`. Chế độ `ipv4port` của netgen chỉ cho
      **beacon** khai địa chỉ công khai (patch 0024/D-089), và **D-118b đã đo cái giá**: node ngoài
      học địa chỉ 8 node kia qua gossip, chúng khai `172.28.0.x` ⇒ với tới **1/9 validator (~11%)**,
      mà bootstrap đòi **80%**, stake đòi bootstrap ⇒ **vòng khép, không có đường ra bằng cấu hình**.
      Ngày G hình dạng là beacon + node9 Hetzner công khai, bảy node nội bộ ⇒ **~22%**, vẫn xa 80%.
      ⚠️ **Thứ tự quan trọng:** lên mạng bằng mặc định netgen TRƯỚC (mesh hình thành qua địa chỉ nội
      bộ), rồi mới mở cổng, recreate **từng node một** — D-089 đo mesh teo thành hình sao khi mọi
      node khai IP công khai lúc **SINH** mạng; D-118c đo **không** teo khi làm với mesh đã có và
      `--bootstrap-ips` vẫn nội bộ. Nghiệm thu **trên chain**: một node **không phải beacon** thấy
      node ngoài trong `info.peers`, và node ngoài `healthy: true` với P+C bootstrapped.
- [x] 🔴 **NGƯỜI THẬT ĐÃ ĐẺ CHAIN — bản ghi đã được cứu.** Đo `13:40 UTC`: sổ sống có **2 chain**
      (`Eric1` #9000000010 · `eric1` #9000000011, cùng chủ `0x29B0864c…6F71`, preset `zero-fee`,
      tạo lúc `11:16` và `11:25 UTC`, **cả hai đang chạy thật**). 🔴 **Số đo `09:2x` của phiên này
      — *"sổ sống rỗng, không gì sắp mất"* — ĐÃ HẾT ĐÚNG chỉ sau hai tiếng.** Đã chạy
      `close-ledger --pull` → `docs/archive/console-chains-song-2026-08-31.json` →
      `gen-chainid-issued --write` ⇒ sổ chặn xuyên thế hệ **47 → 49 chainId · 53 → 54 tên**;
      `9000000010`/`9000000011` và mọi biến thể hoa/thường của `eric1` nay **chặn vĩnh viễn**.
      ⚠️ **Ngày G vẫn phải chạy lại chuỗi này** — có thể còn chain mới sinh ra từ giờ tới lúc đó.
      ⚠️ **Eric mất cả hai chain vào ngày mai và không biết điều đó.**
- [x] **Sửa: `createChain` so tên PHÂN BIỆT hoa/thường** — chính vì thế Eric có được cả `Eric1`
      lẫn `eric1`, mỗi lượt kéo theo một đợt rolling restart 9 node. Sổ **xuyên thế hệ** đã thường
      hoá từ D-086 với lý lẽ áp đúng y hệt ở đây ⇒ thế hệ NÀY cho phép hai tên mà thế hệ SAU chặn.
      Nay thường hoá cả hai. `thuHoiChain` giữ so chính xác (nó trỏ vào một chain đã tồn tại).
- [human] 🔴 **Người ngoài lấy 25.000 LOVE9 ở đâu để stake?** Faucet cấp **10 LOVE9** mỗi lượt,
      có hạn mức ⇒ **không phải đường chậm, mà là không có đường**. Trên g0, D-119 nạp từ quỹ
      Foundation. Tài liệu validator nói thẳng điều này thay vì để người ta dựng node một tuần rồi
      mới phát hiện — nhưng **kênh xin cấp thì chưa tồn tại**.
- [human] **B-16** bản sao khoá quỹ sang máy thứ hai. Hôm nay là cửa sổ tập **rủi ro bằng không**.
- [human] **B-20** — gói `h6b` vừa dựng, qua cả 4 phép nghiệm thu của chính nó, chứa **0
      `staker.key` · 0 `signer.key` · 0 `genesis.json`**. Đếm tệp mới là phép đo; đọc dòng
      `--check` thì không.
- [human] 🔴 **Nạp ví factory trên P-Chain — HAI CHẶNG, không phải X→P** (sửa `01/09`, D-155: ví
      factory **0 trên cả X lẫn P**, xem `docs/RUNBOOK-REOPEN-CHAIN-CREATION.md` việc 3) — runbook
      lúc viết dòng này có **0 dòng** về việc đó
      (`grep` = 0). Trên genesis mới, tiền thanh khoản mọi quỹ nằm trên **X-Chain**, CLI trả phí
      trên **P-Chain**: Foundation `71.000.009` trên X, **`0` trên P**. Quên ⇒ console lên xanh
      và **người đầu tiên bấm nút nhận `insufficient funds`**.
- [ ] **Console đẻ L1 không diễn tập được trước ngày G** — cổng thế hệ so node với
      `NETWORK_ID = A1_ID_GOC − A1_GEN` (băng THẬT), không có biến thể băng TẬP, nên trước mạng
      tập nó **từ chối theo kiến trúc** (đã kiểm ở tầng API). Cổng làm đúng việc (D-093) ⇒ đường
      đẻ chain chỉ kiểm được **trên g1 thật, sau khi lên**. Đẻ **một** L1 rồi thu hồi, **trước
      khi công bố**.
- [ ] Sau ngày G: **tổng quát hoá `verifyAgainstC1`** thành *"đối chiếu với CANON"* (D-132 §4)
      — đụng `patches/`, không làm trước ngày G.
- [ ] Chưa cấp số quyết định cho các phát hiện của ba lượt quét + diễn tập (mới có D-132).

**Số đo cuối phiên:** preflight offline **20 đạt · 0 đỏ · 4 bỏ qua · 31 việc tay** ·
`h6b --check` ✓ (fork tree `60a61707f797` khớp) · `check-key-leaks` exit 0 · nợ ngôn ngữ
**5.753 → 5.750** · mạng công khai g0 **10 validator · 9 peer · factory 89,899 LOVE9** ·
B-12 còn **12 ngày** (`2026-09-12`, node stake-sau, chết cùng g0 ngày G).

---

## 🔴 NGÀY G `2026-09-01` — SỐ ĐO `06:25Z` (VN 13:25), lấy TRƯỚC khối `07:09Z`

Phiên đo, không sửa mã. Mốc thời gian để đọc mọi con số dưới đây: `down -v` ở **`07:39Z`**,
giờ G ở **`10:09:09Z`**.

⚠️ **Nợ sổ sách phát hiện ngay đầu phiên:** phiên **SOÁT 3 VÒNG** (`8ebae9e`→`cb3813f`, cùng
ngày) **không cập nhật tệp này** — 7 phát hiện của nó chỉ sống ở `HANDOFF.md` + `DECISIONS.md`.
Phiên này **không backfill hộ**; mục đó vẫn nợ, và ghi ra đây để nó thôi vô hình.

- [x] 🔴 **H-6b chạy lại — ĐẠT, hai nơi.** Cổng đang **ĐỎ** lúc phiên bắt đầu.
      **Thấy ĐỎ trước, và đỏ vì ĐÚNG LÝ DO:** fork tree `60a61707` + **26 patch** vẫn khớp;
      đỏ **chỉ** vì **3 tệp MÃ** đổi sau bản `20260831-201321` —
      `local-net/deploy/manifest-deploy.json` · `scripts/check-deploy-drift.mjs` ·
      `scripts/gday-preflight.mjs`, đúng ba tệp 7 commit hôm qua đụng. Tức cổng đo **đúng đại
      lượng nó khai** (D-069b: "lệch mã ⇒ ĐỎ, lệch tài liệu ⇒ VÀNG"), không phải đỏ giả.
      ✅ Bản mới **`20260901-061904`**: repo `main f69a216` · **333 commit** · tree `569bc7d1` ·
      fork **26 patch** · tree `60a61707`. Sáu phép nghiệm thu **chạy thật**: clone ngược máy dev
      (tree khớp tuyệt đối) · áp 26 patch lên `1cf1fc3` (khớp cây fork **từng byte**) ·
      🔴 **đối chứng ngược — bundle cắt cụt bị TỪ CHỐI** · quét bí mật **0 khối PRIVATE KEY**
      (4 tệp `.env`/`.key`; xem lại nếu con số này tăng) · sha256 hai đầu **30/30** ·
      **clone ngược TRÊN MÁY CHỦ** tree khớp tuyệt đối.
      Nằm ở `C:\PROJECTS\9Chain-backups\9chain-a1-backup-20260901-061904` và
      `"$A1_SSH_HOST":~/9chain-a1/backup/20260901-061904`.
      🔴 **KHÔNG ĐƯỢC ĐỌC THÀNH "ĐÃ AN TOÀN"** — chính script in ra câu đó. Nó **chưa bao giờ**
      cứu khoá 5 quỹ (D-044 / O1) và chứa **0** danh tính validator (B-20). Lượt này **không**
      dời B-16 hay B-20 một milimet.
      ⚠️ **Hết hạn lại** nếu còn commit nào chạm `patches/ local-net/ upstream/ scripts/ web/
      genesis/ 9chain-a1-config/` trước `down -v`. `bash scripts/h6b-backup.sh --check` trả lời
      trong 3 giây — **hỏi lại nó, đừng nhớ**.

- [x] **Preflight ĐẦY ĐỦ (có mạng) — `22 đạt · 3 đỏ · 0 không chạy được · 0 bỏ qua · 38 việc tay`**
      **Trùng khít số đo phiên trước ⇒ 7 commit hôm qua không làm hỏng gì.** Cả **21 cổng repo**
      xanh, gồm bánh cóc sổ chặn chainId, cổng ngôn ngữ, và **12 bộ đối chứng ngược**.
      ✓ `G4 · sổ chainId công khai` — nhưng nó **tự khai phải đo lại ngay trước genesis**;
      đừng dùng lại con số này ở `07:39Z`.
      🔴 **Ba đỏ, đã kiểm từng cái đỏ VÌ ĐÚNG LÝ DO — đừng vá cho xanh:**
      (a) `watch-network`: `9chain-a1-g0` · `999999999` · validator **10** · B-12 còn **11 ngày**
      (`2026-09-12`). Hết đỏ khi g1 lên. 🟡 Số dư `chain-factory` in **KHÔNG ĐO ĐƯỢC** — đó là
      **đúng thiết kế** (việc tay #99a: chưa khai ví factory cho g1), **vàng chứ không đỏ**;
      trước khi có mục đó nó mặc định về địa chỉ g0 và trả `unlocked: "0"`, tức **đỏ vì sai lý do**.
      ✓ Mục mạnh nhất vẫn xanh: **`supplyCap` đo TRÊN NODE ĐANG CHẠY** = `7900000001000000000`
      khớp repo · node-1 thấy **9 peer** · faucet `/api/supply` có số · console `/whoami` 200.
      (b) `check-deploy-drift`: **14 khớp · 5 lệch · 1 thiếu · 0 mồ côi · 4 mồ côi ĐÃ KHAI ·
      14 ngoài tầm canh**. Tất cả là console + faucet **chờ deploy ở giờ G**.
      (c) `check-net-dirs`: **2 TRAP + 1 DECOY** — không đổi, việc David (B-19).

- [human] 🔴 **SÁU tệp phải lên server ở giờ G — danh sách ĐÃ ĐO, đừng dựng lại từ trí nhớ:**
      `console/chainid-released.json` (**THIẾU trên server**) · `console/server.mjs` ·
      `console/chainid-test.mjs` · `console/chainid-issued.json` · `lib/chainid.mjs` ·
      `faucet/server.mjs`.
      🔴 `lib/chainid.mjs` **cố ý lệch tới nay** (D-136b) — nó đi **cùng lượt bump**, đẩy sớm là
      đặt console vào lệch thế hệ vĩnh viễn. 🔴 `faucet/server.mjs` là **MÃ, không phải env** —
      **không script nào sở hữu tệp này**, nó chỉ di chuyển khi có người dời.

- [human] 🔴 **B-19 nay có SỐ, không còn là chữ.** Hai tệp giữ **cùng `90.007476864 LOVE9`**:
      `local-net/net-public/chain-factory-key.txt` và
      `local-net/net-public-dead-720m/allocation.md+chain-factory-key.txt` — cả hai nằm **ngoài
      mọi băng thế hệ sống** (`⚫ outside every band — dead`). Số tiền đó **chết cùng g0**; giá trị
      còn lại là **giữ bản ghi**. Dời **rồi so `sha256` từng tệp một**, đừng xoá theo thư mục
      (gotcha 17 · D-107). Kèm: `net-that-g0/` vẫn là **DECOY** — networkID khớp mạng sống, 6 ví
      **0đ**; bộ quỹ thật ở `C:\Users\abc\9chain-a1-keys\g0\`.

- [human] **B-16 — thuộc SAU khi g1 xanh, không phải trước `down -v`.** Bộ đáng làm là **g1**,
      mà netgen chỉ sinh nó ở giờ G. 🔴 **Điều kiện phải giữ suốt lượt bấm: ĐỪNG SHRED GÌ CỦA g0
      CHO TỚI KHI g1 XANH** — hỏng lượt sinh lại phải hoãn thì g0 là thứ duy nhất còn lại, và
      lúc đó tiền + khoá g0 **lại có giá trị trở lại**.

### 🔵 SAU NGÀY G — sinh từ lượt quét `2026-09-01`, không cái nào chặn genesis

- [ ] **Đổi tên ba công cụ còn mang tên upstream** (David hỏi `08:30Z`: *"nên đổi tên file hay
      tên gì đó để mang bản sắc 9Chain nhiều hơn không?"*).
      🔴 **Câu trả lời hôm đó là KHÔNG-phải-hôm-nay, và lý do là một phép đo, không phải sự thận
      trọng:** mọi thứ **đóng băng vĩnh viễn lúc genesis đã mang tên 9Chain rồi** —
      `A1Name "9chain-a1-g1"` · HRP **`love9`** (`P-love91…`) · bí danh tài sản **`LOVE9`**
      (và `AVAX` bị từ chối có chủ ý) · chainId mẹ `9000000009` · khối L1
      `9001000000–9001999999` · networkID `999999998` · địa chỉ khắc chữ `0x9000…0009` · binary
      tự khai **`9chaingo/1.14.2`**. Không chỗ nào người dùng chạm vào là chữ mượn.
      Thứ còn generic nằm trong `/9chain-a1/build/` và **không** đóng băng:
      ```
      9chain-a1-cli   ✓ đã mang tên
      avalanchego     🔴 tên upstream — bề mặt "không phải 9Chain" lớn nhất còn lại
      create-l1       ○ generic
      xp-wallet       ○ generic
      ```
      ⇒ Đề xuất: `avalanchego` → **`9chaingo`** (chuỗi phiên bản **đã** dùng tên đó), `create-l1`
      → `9chain-a1-create-l1`, `xp-wallet` → `9chain-a1-wallet`.
      **Điều kiện qua:** image dựng lại chạy được, `--version` giữ nguyên `9chaingo/`, node lên
      9/9, và `docs/RUN-A-VALIDATOR.md` + `GDAY-NODE10-HETZNER.md` đổi theo **cùng lượt** (chúng
      gõ `./avalanchego` trong lệnh người ngoài dán vào terminal).
      ⚠️ **Không chạm chain** — đây là tên TỆP, nên đổi hôm nay hay sau một tháng **chi phí y hệt**.
      🔴 **Thứ DUY NHẤT là bây-giờ-hoặc-không-bao-giờ mà tôi vẫn khuyên không đụng:** tên sáu quỹ
      (`staking · foundation · ecosystem · faucet · private-sale · team`) đóng băng theo genesis.
      Đổi = sửa `newFund()` trong netgen ⇒ **`patches/`** ⇒ sinh lại cả bộ ⇒ build ⇒ ship hai máy
      ⇒ đo lại ba mỏ neo (**lượt thứ hai trong một ngày**), và làm lệch `allocation.md` khỏi các
      gói vật chứng + bản xuất O2 **đã công bố**. Đổi lấy sáu cái tên nội bộ người dùng gần như
      không nhìn. Khác `MinValidatorStake` ở chỗ: cái đó vừa bất biến **vừa** chặn đúng mục đích
      tồn tại của mạng; tên quỹ không phải cả hai.

- [ ] 🟡 **`check-key-leaks` — lỗ phạm vi trong `ALLOWED`.** Nó nhận ra *"khoá test công khai của
      avalanchego"* cho bản trong repo chính, nhưng **không** cho bản y hệt trong worktree
      `C:\PROJECTS\9Chain-A1-audit\` và bản sao tạm của nó ⇒ mỗi lượt chạy in **4 mục 🟡 không bao
      giờ tự hết** (`genesis_local.go`, `secp256k1_test.go` × 2 nơi). Vô hại về khoá (chúng công
      khai trong repo upstream), nhưng **cảnh báo không bao giờ hết là cách nhanh nhất dạy người
      ta lướt qua danh sách** — đúng lý lẽ D-070. Nới `ALLOWED` theo **nội dung nguồn** (tệp thuộc
      cây `upstream/avalanchego`), đừng nới theo đường dẫn tuyệt đối của một worktree.

- [ ] **Đo lại thời gian chạy `check-key-leaks`.** Sau lượt đổi allow-list → deny-list (B-21) nó
      chạy **4 phút 37 giây** (mở nhiều tệp hơn hẳn). Chưa nằm trong `gday-preflight` (preflight
      chỉ gọi `--self-test`), nên **hôm nay không tốn gì** — nhưng nếu sau này nối lượt quét đầy
      đủ vào preflight thì con số đó phải được biết trước, không phát hiện giữa ngày G.

---

## 🟢 `2026-09-01` SAU GIỜ G — phiên **HẬU PHÓNG**, số đo `10:2xZ`–`11:0xZ`

Mạng g1 sống được ~1 giờ khi phiên bắt đầu. Không đụng mạng, không đụng server, không gửi
giao dịch nào.

- [x] 🔴 **CỔNG MỚI: lịch sử git có vật liệu khoá không** — `scripts/check-history-secrets.mjs`
      (D-145). **Vì sao bây giờ:** việc kế tiếp của David là **bật repo CÔNG KHAI**, mà bật là
      xuất bản **mọi commit** — và **không cổng nào từng đọc một object lịch sử nào**
      (`h6b-backup.sh` quét `--exclude-dir=.git` + chỉ tìm PEM; `check-key-leaks` đi theo thư mục
      nên mù với blob không cây nào trỏ tới).
      **Điều kiện qua — cả bốn:** ① chạy trên repo THẬT, hai phạm vi ② **11 ca đối chứng ngược**
      + **một ca ĐỎ trên dữ liệu thật** (nạp sha256 genesis công khai giả dạng dòng khai khoá ⇒
      đỏ đúng `HANDOFF.md` · `RUN-A-VALIDATOR.md` · **một lời nhắn commit**) ③ đo **trên máy dev**
      — nơi sinh ra thứ được đẩy đi ④ D-145 + mục này.
      🔴 **Lần chạy thật đầu tiên ĐỎ 68 mục và nó đỏ VÌ SAI LÝ DO** — thước đo nuốt cả
      `g0/genesis.json`. *"Sai rộng thì không mất gì"* đúng cho phía ĐI TÌM, **sai cho THƯỚC ĐO**.
      **Kết quả: 0 phát hiện · 2.349 object (toàn kho) · 969–978 token hex 🟡 khai ra ·
      121 object không ref nào với tới** (đó là thứ `git push --mirror` gửi mà `git push` không).
      ⇒ **Bật công khai KHÔNG bị chặn bởi đại lượng này.**
      Đã nối vào `gday-preflight` cả hai vế (self-test + lượt thật): cổng **22 → 24 đạt**.

- [x] **Đo lại toàn bộ sau khi mạng lên** — `24 đạt · 2 đỏ · 1 không chạy được · 40 việc tay`.
      Hai đỏ **đã kiểm là đỏ vì đúng lý do**, và **cả hai đều là việc của David**:
      🔴 (a) `watch-network`: mọi mục xanh (`9chain-a1-g1` · `999999998` · **9 validator** ·
      8 peer · `supplyCap` đo **trên node đang chạy** · B-12 còn **309 ngày**) trừ **ví
      `chain-factory` = 0 LOVE9**. Đây là mục #3 trong ba việc của David: **nạp X→P trước khi mở
      cổng đẻ chain**, nếu không người đầu tiên bấm nút nhận `insufficient funds`.
      🔴 (b) `check-deploy-drift`: **15 khớp · 4 lệch · 1 thiếu · 1 mồ côi**. Lệch là **console**:
      `chainid-released.json` (**THIẾU trên server**) · `server.mjs` · `chainid-test.mjs` ·
      `chainid-issued.json` · `lib/chainid.mjs`. 🔴 Nghĩa là **console công khai vẫn là bản g0**:
      `A1_GEN` ở đó = 0 ⇒ nó cấp chainId từ khối của **thế hệ đã chết**. Tạm thời vô hại **chỉ
      vì** cổng đẻ chain đang ĐÓNG — mở cổng trước khi deploy console là mở đúng cái bẫy §6.
      ✅ Tin tốt: `local-net/faucet/server.mjs` nay **KHỚP** — mã faucet đã lên server.
      🟡 Mồ côi mới: `9chain-a1-config/heartbeat.json.g0-20260901` — bản lưu của thế hệ chết nằm
      cạnh tệp đang chạy, đúng hình dạng B-17. Khai hoặc `shred`, đừng để nguyên.

- [ ] 🟡 **`check-net-dirs` vẫn KHÔNG KẾT LUẬN ĐƯỢC 1 mục** — `local-net/net-tap-g1/` **rỗng,
      không có `genesis.json`** ⇒ cổng không xếp nổi thế hệ. *"Không đo được" không phải "sạch"*.
      Mười thư mục còn lại đo sạch: **`net-g1` là THẾ HỆ ĐANG CHẠY** (4 ví đọc ra tiền thật trên
      chain), mọi thư mục khác **0 đồng**. Việc: xoá thư mục rỗng đó (an toàn — nhưng theo luật §4
      thì **xoá thư mục `net*` là việc có người bấm**, và LIỆT KÊ → XOÁ → ĐỐI CHỨNG).

### Việc của David còn nguyên (không phiên nào tự làm được)

1. 🔴 **Repo → CÔNG KHAI** — chặn điều kiện qua **4 + 5**. ✅ Nay đã có phép đo nói *lịch sử sạch*.
2. 🔴 **Nạp ví `chain-factory` — HAI CHẶNG** (quỹ→X của factory, rồi factory X→P của chính nó;
   **không phải** một cú X→P — D-155) trước khi mở cổng đẻ chain (cổng đang ĐÓNG — giữ nguyên thế).
3. 🔴 **Deploy console bản g1** (5 tệp) — trước khi mở cổng đẻ chain, không sau.
4. **Kênh liên hệ** — `FILL-ON-G-DAY` cuối cùng ở `docs/RUN-A-VALIDATOR.md:340`; cộng chỗ URL
   repo ở dòng 77 sẽ điền được ngay khi việc 1 xong. Cổng xuất bản đang đếm **2**.

- [x] 🔵 **Kịch bản nghi lễ `2026-09-09` — `local-net/faucet/ceremony-9s-union.mjs`** (D-146).
      Adam → Eva → 8 giao dịch chèn → thông điệp vào đúng `block(Eva)+9` → **đọc ngược từ chain**.
      Mặc định **chạy khô**; 6 cửa từ chối đều đã chạy thật (mã 2); 8 ca đối chứng ngược; đã nối
      vào preflight (**25 đạt**). Chạy `--plan` trên mạng thật: chainId `9000000009` ✓, thông điệp
      **182 byte khớp vân tay đóng băng** ✓, chain **0 block trong 20 giây** (rảnh tuyệt đối).
      🔴 **Còn treo, cần David:** ① nội dung giao dịch **Adam/Eva** chưa ai khai — đóng băng byte
      trước ngày ② **B-13(b)** phải đo khi chain đang đẻ block; số đo hôm nay (−443s) là **tuổi
      block**, không phải lệch đồng hồ, **đừng dùng làm offset**.

- [x] 🔵 **D-147 — ranh giới Block Adam chốt: LUẬT BAO GỒM (`ts >= mốc`)**, David `01/09`, lý do:
      **C1 đã công bố** và hai chain kể một câu chuyện thì không được dùng hai phép so. Đổi ở ba
      nơi trong một lượt (kịch bản nghi lễ · bài diễn tập · CANON). `--boundary strict` giữ lại
      **chỉ để đo** bản đọc đã nghỉ. Bản chấm 7/1 của vật chứng `27/08` **giữ nguyên** — nó chấm
      dưới luật cũ và là câu kể về quá khứ. 11/11 đối chứng vẫn xanh sau lượt đổi.

- [x] 🟢 **B-20 nửa phần mềm ĐÓNG** — gói danh tính 9 validator của g1: **29 tệp · 27 danh tính ·
      0 thiếu · 0 lệch**, nghiệm thu bằng **đếm tệp trong gói**. Công cụ: `backup-validator-identity.mjs`
      (11 đối chứng ngược; `--check --rpc` hỏi **chain thật**, không suy từ thư mục — D-110).
- [x] 🟢 **B-16 ĐÓNG cho g1** — bộ khoá quỹ vào kho khoá, **trùng byte**; `o1-check --rpc` **mã 0,
      cả hai nửa xanh**: khoá suy đúng 6 địa chỉ **và** 6 địa chỉ giữ tiền thật trên `999999998`.
- [ ] 🔴 **[human] Nửa VẬT LÝ của cả B-16 lẫn B-20** — hai bản sao đang trên **cùng một ổ đĩa**.
      Sống sót qua *xoá nhầm*, **không** sống sót qua *mất máy*. Đưa sang media khác, và **cất
      tách nhau** (`check-key-leaks` canh khoá quỹ, không canh danh tính).
- [x] **Hai chỗ `FILL-ON-G-DAY` cuối đã điền** ⇒ cổng xuất bản `grep -c` = **0**. Repo chính thức:
      `github.com/9holdings/9chain` · kênh liên hệ: GitHub Issues (D-148).

- [x] 🔴 **D-150 — BẢNG PHÂN BỔ CÔNG KHAI là bảng của mạng ĐÃ XOÁ, và không cổng nào đọc tài liệu**
      (`01/09`, phát hiện đến từ **9Chain-BOD** chứ không từ cổng nào của A1).
      `docs/ALLOCATION-PUBLIC.md` khai `networkID 999999999` (g0, chết `09:26Z` sáng đó) **sau khi
      repo đã công khai**; Foundation khai **1 tỷ**, đo trên chain sống ra **0**. Địa chỉ chết
      không báo lỗi — người đầu tiên phát hiện sẽ là người **đã gửi tiền vào đó**.
      ✅ Bảng `g1` đã chép về, nghiệm thu `o1-check --rpc` **cả hai nửa xanh** (khoá→địa chỉ **và**
      địa chỉ→tiền thật, khớp từng đơn vị); bản `g0` sang `docs/archive/` **kèm bia mộ**.
      ✅ Cổng mới `scripts/check-doc-drift.mjs`, **đã nối vào preflight** (nay **30 cổng**):
      **17/17** đối chứng ngược · thấy **đỏ thật 24 dòng/8 tệp** · thấy **mã 2** khi không đo được.
      Nó **ĐO mạng sống** rồi mới chấm (D-110), tập quét là **`git ls-files`** — *"công bố có đưa
      tệp này cho người lạ không"*, không phải *"tệp có trên đĩa không"*.
      🔴 **Ba thứ bắt được mà không ai đi tìm:** (1) `stale-ok` đặt ở **dòng trên** không có tác
      dụng — đúng cách `RUN-A-VALIDATOR.md` đang viết ⇒ đã thành luật, có ca hai chiều; (2) chính
      cổng vừa dựng **đếm sai đại lượng** (in *"scanned 23"* trong khi 4 tệp không được đọc);
      (3) `CLAUDE.md` §3 còn khai `25/26 → f2b9486b` sau lượt bump 27 patch.
      ⚠️ **Nợ đã biết:** cổng chấm bằng **mẫu** ⇒ `blockchainID` C/X (chết mỗi lần re-genesis)
      **chưa có mẫu**. Lần sinh mạng sau: thêm mẫu **trước** khi công bố.

- [x] **D-149 viết bù** — cửa sổ yên tĩnh cho nghi lễ `09/09`. Nó đã bị **ba nơi trích dẫn**
      (`CEREMONY-2026-09-09.md` ×2, `ceremony-9s-union.mjs:779`) trong khi **chưa ai viết ra**.
      Kèm: lời khai của cửa `--allow-busy-chain` đã sửa để nói *cờ này không làm chain yên, chỉ
      làm cổng im*. 🟢 Ghi rõ trong D-149: **đẻ chain L1 KHÔNG ảnh hưởng nghi lễ** (P-Chain ≠ C-Chain)
      — hai việc này hay bị buộc nhầm vào nhau.

- [x] 🔴 **D-151 — tuyến sao lưu ĐÃ ĐỨT 7 tiếng mà không gì báo; nay có cổng canh** (`01/09`).
      `git push origin main` trả **403**: repo sao lưu bị **archive lúc `12:19Z`**, đóng băng ở
      **325 commit**, để **49 commit của chính ngày G** nằm ngoài. Repo archive **vẫn giữ URL, vẫn
      cho đọc, vẫn trả `fetch`/`ls-remote`** — chỉ từ chối **GHI**, mà ghi là thao tác ta chỉ làm
      khi đã có việc cần cứu.
      ✅ Remote riêng tư mới `daviddokrao/9chain-a1-backup`; `visibility` kiểm **TRƯỚC** lượt đẩy
      đầu (kiểm sau thì nếu cờ `--private` hỏng, thứ ta đo đã công khai rồi). Nghiệm thu: **375
      commit hai đầu, cùng tip, PRIVATE, đúng một nhánh**. Remote chết **giữ lại, đổi tên**
      `archived-31aug` — xoá là mất bản ghi, để tên `origin` là để lại bẫy 403 dưới cái tên người
      ta gõ theo phản xạ.
      ✅ Cổng `scripts/check-remotes.mjs`, **16/16** đối chứng ngược, đã nối preflight (**32 cổng**).
      Canh hai chiều: sao lưu **hết ghi được** · chỗ riêng tư **thành CÔNG KHAI**. Danh sách remote
      lấy từ `git remote` ⇒ **remote không ai khai là ĐỎ**.
      🔴 **Thấy đỏ trên DỮ LIỆU THẬT**, không chỉ fixture: khai `archived-31aug` là tuyến sao lưu
      ⇒ đỏ đúng hai câu (*ARCHIVED* · *51 commit, gap is permanent*).
      🔴 **Suýt có cổng xanh giả:** GitHub vẫn khai `viewerPermission: ADMIN` cho repo đã archive
      ⇒ cổng hỏi *"tôi có quyền ghi không"* sẽ xanh suốt sự cố. `isArchived` mới là thứ phân biệt.
      ⚠️ Và **6/15 ca đối chứng đầu đỏ vì lỗi trong chính bài kiểm** — ca *"remote biến mất"* khi
      đó **xanh VÌ LỖI ĐÓ**. Đã tách vai theo từng ca + thêm ca kiểm **gọi đúng TÊN**.

### 🔴 Mở lại cổng đẻ chain L1 — **BỐN việc**, cả bốn là việc có người bấm

✅ **Nay có MỘT lệnh đo cả bốn** (D-152, nối bước 2 ở D-155) — mặc định chỉ đọc, không gửi gì tới
sản phẩm:

```bash
node scripts/reopen-chain-creation.mjs            # bốn bước, và THỨ TỰ là phép kiểm
node scripts/reopen-chain-creation.mjs --probe     # hỏi console thật (KHÔNG tạo được chain)
```

Đo `01/09` `18:5xZ` — **cả bốn đỏ, đúng thứ tự**: `1` 4 lệch + 1 thiếu · `2` **sổ chain công khai
khai 2 chain g0** · `3` **0 LOVE9** · `4` **CLOSED**, cửa tự trả lời bằng câu của chính nó.
**33/33** đối chứng ngược (từ 21).
🔴 **Bước 2 KHÔNG có ở bản đầu** (D-155): cổng viết cho ba việc của D-152, D-154 đẻ ra việc thứ tư
một giờ sau, và không gì nối hai cái lại ⇒ làm xong ba việc nó biết là nó in **"sẵn sàng"** trong
khi `/chains/` vẫn quảng cáo hai chain chết. *Một cổng sẵn sàng không biết một trong những thứ nó
đang canh thì không phải là dè dặt — nó là **sai một cách tự tin**.*
🔴 Nó **từ chối nói "sẵn sàng"** khi **CỬA MỞ** mà bước trước chưa đạt, và gọi thẳng đó là
**OUT OF ORDER** — vì mở cửa trước khi đẩy sổ là cấp chainId của **thế hệ đã chết** vào một
genesis **bất biến**, thứ không thu hồi được. ⚠️ **Chỉ CỬA mới nguy hiểm** (thu hẹp ở D-155): ví
đã nạp hay sổ đã sạch đứng trước console cũ **không** cấp cho ai cái gì — cửa đang đóng.
⚠️ Ba lỗi lộ ra lúc dựng, đều là bài cũ: cổng **đỏ vì sai lý do** (bung dấu ngã ⇒ báo cả 5 tệp
MISSING trong khi 4 tệp có thật) · **tệp token là ghi chú có chứa bí mật**, không phải bí mật
(5 dòng; đọc cả tệp ra "token" 280 ký tự) · **Node sập lúc thoát mã 127** vì `fetch` giữ socket.
✅ Kèm: `VI_FACTORY_THEO_THE_HE` tách khỏi `watch-network.mjs` sang `local-net/lib/factory-wallets.mjs`
— import một script để mượn hằng số thì **chạy cả cổng đó** rồi `process.exit`, đã xảy ra thật.

Thứ tự **bắt buộc**, và nó là thứ tự chứ không phải danh sách:

1. **Đẩy sổ chainId lên server TRƯỚC** — `check-deploy-drift`: `chainid-released.json` **thiếu hẳn**,
   `chainid-issued.json` · `server.mjs` · `chainid-test.mjs` · `lib/chainid.mjs` **lệch**. Trong đó
   `lib/chainid.mjs` là nơi khai `A1_GEN` ⇒ **console trên server đang cấp chainId từ khối của g0**.
   Bật cờ trước khi sổ lên = phát trùng tên/số **vào một genesis bất biến**.
2. **Nạp ví `chain-factory`** — `watch-network`: 🔴 **0 LOVE9** trên `P-love91999h…9999` (đúng ví g1).
   🔴 **HAI CHẶNG, HAI KHOÁ — không phải một cú X→P** (D-155): ví factory là ví số đẹp sinh riêng,
   đo `01/09` ra **0 trên cả X lẫn P** ⇒ không có gì để chuyển. Quỹ genesis →`/api/send-x`→ factory
   trên X, rồi factory →`/api/x-to-p`→ P của chính nó (`x-to-p` chỉ xuất cho `owner()`).
   *(Câu "thanh khoản ở X, phí ở P" đúng cho **quỹ genesis** — D-140 dựng lại đúng lỗi đó trên bản
   diễn tập: `insufficient funds: needed 2196 more nAVAX`. Ví factory không phải quỹ genesis.)*
3. **`A1_DE_CHAIN_MO=1`** + `~/9chain-a1/console-restart.sh`, rồi nghiệm thu **qua Cloudflare**,
   không nghiệm thu trên host.

---

## 🔵 `2026-09-01` (chiều muộn, sau D-152) — preflight lấy số tươi + vá một cổng không xanh được

Phiên đo. Không đụng mạng, không đụng server, không gửi giao dịch.

- [x] 🔴 **Preflight đầy đủ, số tươi `14:49Z`** — `29 đạt · 2 đỏ · 1 không chạy được · 40 việc tay`.
      **Trùng khít số đo phiên trước** ⇒ không có gì hỏng thêm. Fork tree ✓ 27 patch →
      `38723877`, đối chứng **26/27 → `60a61707`** chạy trong cùng cổng.
      Hai đỏ đã kiểm **từng cái đỏ VÌ ĐÚNG LÝ DO**, và **cả hai là việc David**:
      `watch-network` 8/9 mục xanh, đỏ **chỉ** ở ví `chain-factory` **0 LOVE9** ·
      `check-deploy-drift` **15 khớp · 4 lệch · 1 thiếu · 1 mồ côi**, toàn bộ là console chờ deploy.
      🟢 **Đổi so với HANDOFF:** `faucet/server.mjs` nay **KHỚP** ⇒ danh sách còn **5 tệp**,
      không phải 6. Mồ côi mới `9chain-a1-config/heartbeat.json.g0-20260901` (hình dạng B-17).
- [x] 🟢 **B-19 hết là "tiền thật", đo trên chain sống.** `net-public/` và
      `net-public-dead-720m/` nay đo ra **mọi ví 0đ** trên `999999998` — `90,007 LOVE9` chết cùng
      g0. Hai mục TRAP biến mất **không phải vì ai dọn**, mà vì đại lượng chúng canh đã đổi.
      ⇒ B-19 còn lại **giá trị GIỮ BẢN GHI**, không còn là chặn GO/NO-GO. Mồi nhử `net-that-g0`
      vẫn bị chấm đúng `🟡 real band, different generation`.
- [x] 🔴 **`check-net-dirs` — cổng KHÔNG BAO GIỜ xanh được, vì lý do không phải của nó** (D-153)
      `local-net/net-tap-g1/` **rỗng** (còn lại sau lượt shred `31/08`) ⇒ `no genesis.json` ⇒ mã 2
      **vĩnh viễn**, và câu kết khuyên *"chạy lại khi chain tới được"* trong khi chain **vừa được
      đo thành công** ở dòng ngay trên. Mặt sau của D-106b: đỏ **đúng**, lời khuyên **sai đại lượng**.
      **Điều kiện qua:** thư mục rỗng là verdict riêng · rỗng phải **ĐẾM** chứ không suy từ thiếu
      genesis · phép đếm **đệ quy** (`node1/staker.key`) · mã 2 khai **nửa nào** hỏng.
      ✅ **ĐẠT.** Đối chứng ngược **27 → 40 ca**; **ba bản hỏng có chủ ý**, mỗi bản đỏ đúng ở ca
      mang tên nó (bỏ đệ quy · coi thiếu genesis là rỗng · in cả hai lời khuyên).
      Chạy thật: `✅ PASS — 10 thư mục`, khai riêng 1 thư mục rỗng. `--offline` **vẫn mã 2**.
      ⚠️ **Thư mục KHÔNG xoá** (David chốt). ⚠️ Lỗi của chính lượt này: 2 chú thích tiếng Việt lọt
      vào mã, `check-english-code` bắt được ngay — nợ ngôn ngữ **5.721 → 5.719**.
      ⇒ Preflight: **`30 đạt · 2 đỏ · 0 không chạy được`**.

- [x] 🔴 **Cổng đọc SỔ CHAIN SỐNG — `scripts/check-chain-ledger.mjs`** (D-154)
      Tìm bằng tay khi trả lời *"sắp chạy được phần user tạo chain chưa"*: sổ chain **công khai**
      còn khai **2 chain của g0** (`#9000000010` · `#9000000011`), RPC của chúng trả `404`.
      Bản nén đúng đã có sẵn trong `docs/archive/` từ giờ G — **chưa bao giờ lên server**.
      🔴 Không cổng nào bắt được vì **lỗ nằm GIỮA hai đại lượng**: `check-deploy-drift` để tệp đó
      **ngoài tầm canh** (console tự ghi) · `check-doc-drift` chỉ đọc **văn xuôi**, đây là **JSON**.
      **Điều kiện qua:** đo trên **bề mặt công khai** (không phải repo, không phải tệp server) ·
      **cả hai chiều** (trong khối thế hệ **và** RPC tự khai đúng id) · `retired` **được phép**
      mang id thế hệ cũ · phân biệt *từ chối* với *không với tới được* · **không gửi yêu cầu** tới
      host mà tệp tải về chỉ định.
      ✅ **ĐẠT.** **24 ca đối chứng ngược** · đỏ thật trên dữ liệu công khai (4 lỗi/2 chain, hai
      chiều bắt **độc lập**) · 🔴 **đối chứng DƯƠNG**: chấm bản nén đúng ⇒ **PASS**, tức cái đỏ kia
      là trạng thái **sửa được** chứ không phải cổng không xanh nổi (bài D-153, cùng ngày).
      Nối vào preflight cả hai vế ⇒ **32 → 34 cổng**, `31 đạt · 3 đỏ · 0 không chạy được`.
      🔴 Đỏ thứ ba **chặn mở lại cổng đẻ chain**: nó nằm **trước** trang tạo chain trên đúng đường
      người dùng đi.
