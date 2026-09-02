# RUNBOOK — mở lại cổng đẻ chain L1 (bốn việc dọn)

Soạn `2026-09-01 15:4xZ`. **Mọi lệnh dưới đây là việc CÓ NGƯỜI BẤM** (CLAUDE.md §4): deploy,
chuyển tiền, bật công tắc sản phẩm. Autopilot **đo**, không bấm.

> 🔴 **THỨ TỰ LÀ PHÉP KIỂM, không phải danh sách.** Bật cửa trước khi sổ lên server là cấp
> chainId từ **khối của thế hệ đã chết** vào một genesis **bất biến** của người lạ — không thu
> hồi được, vì thu hồi chain **không** lấy lại số nhận dạng (D-152).

**Đo lại bất cứ lúc nào, không tốn gì:**

```bash
node scripts/reopen-chain-creation.mjs --probe
```

Trạng thái lúc soạn: **cả bốn đỏ**.

---

## Việc 1 — console: 5 tệp lên server

Đỏ vì: `chainid-released.json` **thiếu hẳn** · `server.mjs` · `chainid-test.mjs` ·
`chainid-issued.json` · `lib/chainid.mjs` **lệch**. Trong đó `lib/chainid.mjs` khai `A1_GEN`, và
trên server nó **vẫn = 0** ⇒ console đang sẵn sàng cấp chainId từ khối `g0`. Vô hại **chỉ vì**
cửa đang đóng.

```bash
bash local-net/deploy/console-deploy.sh
```

Script làm đủ chuỗi: kiểm cú pháp + chạy `siwe-test`/`auth-e2e`/`chainid-test`/`generation-test`
**trước khi chép** → chép 16 tệp **theo manifest** → `npm install` → chạy lại bài tự kiểm **trên
chính server** → so `md5` **từng tệp** → **từ chối restart nếu đang có lượt đẻ/thu hồi chạy dở**
→ restart (kiểm **PID đổi**, không chỉ kiểm cổng có người nghe) → đo lại `check-deploy-drift`.

🔴 **BẪY: script này CHƯA AI THẤY NÓ CHẠY TRỌN VẸN.** D-088 — nó **hỏng từ chính commit vá nó**
(`a16c81c`), và `lib/chainid.mjs` lên được server bằng **chép tay**. Lỗi cũ (`.join` với một dấu
xuống dòng nằm trong chuỗi JS) **đã sửa**, và `2026-09-01` đã kiểm lại hai thứ rẻ:

```
bash -n local-net/deploy/console-deploy.sh   ->  ✓ cú pháp OK
đoạn đọc manifest chạy thử                    ->  in ra 16 dòng
```

Nhưng *"lệnh chưa chạy chưa phải lệnh"* — **đọc từng dòng nó in ra**, đừng bỏ đi pha trà.

<details><summary>Đường lui nếu script gãy — chép tay đúng 5 tệp</summary>

```bash
K="$HOME/.ssh/9chain-a1"; H="$A1_SSH_HOST"; D=/home/ubuntu/9chain-a1/src
for f in local-net/console/chainid-released.json \
         local-net/console/server.mjs \
         local-net/console/chainid-test.mjs \
         local-net/console/chainid-issued.json \
         local-net/lib/chainid.mjs ; do
  scp -i "$K" "$f" "$H:$D/$f"
done
ssh -i "$K" "$H" '~/9chain-a1/console-restart.sh'
```
⚠️ Chép tay **bỏ qua** mọi bài tự kiểm mà script chạy trước khi chép. Chỉ dùng khi script gãy,
và chạy `node scripts/check-deploy-drift.mjs` ngay sau đó.
</details>

**Nghiệm thu:** `node scripts/check-deploy-drift.mjs` ⇒ `0 lệch · 0 thiếu`, và dòng khởi động
console tự khai thế hệ.

---

## Việc 2 — sổ chain công khai: thay bằng bản đã nén (D-154)

Đỏ vì: `/chains/data/console-chains.json` **công khai** còn khai **2 chain của g0**
(`#9000000010` · `#9000000011`); RPC chúng tự công bố trả `404 page not found`. Bản đúng đã nằm
sẵn trong repo từ giờ G.

🔴 **KHÔNG script nào sở hữu tệp này** — nó không có trong manifest (cố ý: console **tự ghi** nó).
Cùng hình dạng với `faucet/server.mjs`, và đó là lý do nó lỡ mất lượt dọn giờ G.

```bash
K="$HOME/.ssh/9chain-a1"; H="$A1_SSH_HOST"; C=/home/ubuntu/9chain-a1/src/9chain-a1-config

# 1. GIỮ BẢN HIỆN TẠI TRƯỚC — "đã có bản lưu" là PHÉP ĐO, không phải câu trấn an (gotcha 17)
scp -i "$K" "$H:$C/console-chains.json" ./console-chains.server-truoc-khi-don.json

# 2. thay bằng bản đã nén, đóng dấu đúng giờ G
scp -i "$K" docs/archive/console-chains-closed-g0-2026-09-01.json "$H:$C/console-chains.json"
```

⚠️ **Không cần restart console** — `loadState()` đọc thẳng từ đĩa **mỗi lượt gọi**, không giữ bản
trong bộ nhớ (đo `2026-09-01`, `server.mjs:275`).
🔴 **Nhưng đừng làm lúc đang có lượt đẻ/thu hồi chạy dở**: `saveState()` sẽ ghi đè bằng trạng thái
nó đang cầm. Cùng cửa sổ ~170 giây mà việc 1 đã kiểm.

**Nghiệm thu — đo trên BỀ MẶT CÔNG KHAI, không đo tệp trên server:**

```bash
node scripts/check-chain-ledger.mjs
```
⇒ `✅ PASS`, `advertised: 0 live · 2 retired`.

---

## Việc 3 — nạp ví `chain-factory`: **HAI chặng, không phải một**

Đỏ vì ví factory = **0 LOVE9**. 🔴 **Địa chỉ không viết ra ở đây** — nó đổi theo thế hệ **và**
theo lượt đổi khoá (đã đổi `2026-09-02`, D-159), nên một bản chép trong runbook là một cái bẫy
chờ sẵn. Lệnh dưới suy nó ra từ `factory-wallets.mjs`, nguồn duy nhất.

🔴 **Câu "nạp X→P" trong sổ cũ là CHƯA ĐỦ, và đây là số đo `2026-09-01`:**

```
vi factory tren X  ->  0        (avm.getBalance)
vi factory tren P  ->  0        (platform.getBalance)
```

Ví **rỗng ở CẢ HAI chain** ⇒ không có gì để chuyển X→P. Nó là ví **số đẹp sinh riêng**, không
phải một quỹ genesis. Phải:

| Chặng | Từ | Tới | Endpoint |
|---|---|---|---|
| **A** | một quỹ genesis (X) | ví factory **trên X** | `/api/send-x` (nhận `to`) |
| **B** | ví factory (X) | ví factory **trên P** | `/api/x-to-p` (**chỉ gửi cho chính nó**) |

`x-to-p` xuất cho `owner()` — **khoá của chính ví đang chạy** — nên không thể nhảy thẳng từ quỹ
sang P của factory. Hai chặng, **hai khoá khác nhau**.

🔴 **Khoá KHÔNG được chạm server** (M11.10 / D-091). Dùng ví chạy trên máy dev qua hầm SSH nằm
**trong cùng container**:

🔴 **CHẠY TRONG GIT BASH, KHÔNG PHẢI PowerShell VÀ KHÔNG PHẢI WSL** (đo `02/09`):
- PowerShell 5.1 có `curl` là **bí danh của `Invoke-WebRequest`** — JSON bị mangle.
- Gõ `bash` trong PowerShell **rơi vào WSL** (`C:\Windows\System32\bash.exe`), nơi `/root/.ssh`
  **không có khoá `9chain-a1`** ⇒ mọi lệnh ssh treo chờ mật khẩu. Đúng thứ đã làm
  `console-deploy.sh` treo mà không ai biết vì sao.
- Đúng shell: Start menu → **Git Bash**, hoặc `& "C:\Program Files\Git\bin\bash.exe" -l -i`.
- Kiểm bằng thứ **thật sự khác nhau**, không bằng hình dáng dấu nhắc:
  `echo "$MSYSTEM"; ls "$A1_SSH_KEY"` → phải ra `MINGW64` và thấy tệp khoá.

⏱️ **Ví mất ~4 PHÚT mới phục vụ, và trong lúc đó nó im lặng hoàn toàn.** `enter.sh` chạy
`go run` nên **biên dịch `xp-wallet` từ nguồn mỗi lượt**, và build cache không được mount
(chỉ `/go/pkg/mod` là volume). Đo `02/09`: container `Up`, `check-keys` đã xanh trong log,
mà `:8090` vẫn chưa ai nghe suốt ~3 phút 15. ⇒ **`curl` ngay sau khi dựng ví LUÔN LUÔN
trượt**, và với `curl -s` cái trượt đó **không phân biệt được với thành công** — đó là lý do
lượt `02/09` in ra rỗng ở cả hai chặng và bị đọc thành "đã gửi". **Dùng `-sS`, và chờ.**

```bash
cd /c/PROJECTS/9Chain-A1

# ── Địa chỉ lấy từ NGUỒN DUY NHẤT, không gõ tay (D-113) ──────────────────────
DICH_P=$(node --input-type=module -e 'import {VI_FACTORY_THEO_THE_HE} from "./local-net/lib/factory-wallets.mjs"; import {A1_GEN} from "./local-net/lib/chainid.mjs"; console.log(VI_FACTORY_THEO_THE_HE[A1_GEN]);')
DICH_X="X-${DICH_P#P-}"
QUY_X=$(awk '/^\[foundation\]/{f=1;next} /^\[/{f=0} f' local-net/net-g1/keys.txt | grep -o 'X-love9[a-z0-9]*' | head -1)
echo "quy nguon : $QUY_X"
echo "vi dich   : $DICH_X"

# ── Chờ ví lên VÀ kiểm đúng ví. Không đạt thì KHÔNG gửi. ─────────────────────
cho_vi() {   # $1 = địa chỉ X mong đợi
  echo "cho vi len (toi 10 phut — go run bien dich xp-wallet moi luot)..."
  for i in $(seq 1 600); do
    R=$(curl -sS --max-time 5 http://127.0.0.1:8090/api/info 2>/dev/null)
    if [ -n "$R" ]; then
      G=$(printf '%s' "$R" | sed -n 's/.*"xAddr":"\([^"]*\)".*/\1/p')
      echo "vi len sau ${i}s · xAddr=$G"
      [ "$G" = "$1" ] && { echo "✅ DUNG VI"; return 0; }
      echo "🔴 SAI VI — cho doi $1. KHONG gui."; return 1
    fi
    sleep 1
  done
  echo "🔴 vi khong tra loi sau 600s — KHONG gui."; return 1
}
```

**CHẶNG A** — quỹ Foundation → factory, **trên X**:

```bash
docker rm -f 9chain-a1-vi-ham 2>/dev/null
node scripts/wallet-over-tunnel.mjs --wallet-key local-net/net-g1/keys.txt --fund foundation --port 8090
cho_vi "$QUY_X" && curl -sS -X POST -H 'content-type: application/json' \
  -d "{\"to\":\"$DICH_X\",\"amount\":\"1000\"}" http://127.0.0.1:8090/api/send-x
docker rm -f 9chain-a1-vi-ham
```

**CHẶNG B** — factory X → P **của chính nó** (khoá KHÁC ⇒ phải dựng lại ví):

```bash
node scripts/wallet-over-tunnel.mjs --wallet-key ~/9chain-a1-keys/g1/chain-factory-key.txt --port 8090
cho_vi "$DICH_X" && curl -sS -X POST -H 'content-type: application/json' \
  -d '{"amount":"999"}' http://127.0.0.1:8090/api/x-to-p
docker rm -f 9chain-a1-vi-ham
```

`999` chứ không `1000`: `x-to-p` trừ phí xuất trên X. Phí thật cỡ `0,000002` nên 1 LOVE9 là
thừa sức, và phần dư nằm lại trong ví factory chứ không mất.

🔴 **`/api/info` trước mọi lệnh gửi.** Một ví chạy **SAI KHOÁ vẫn trả `200`** — tiến trình cũ giữ
cổng, tiến trình mới bind hỏng rồi chết lặng, và `/api/info` vẫn trả lời **của ví cũ** (D-140
gotcha D). **Dấu hiệu duy nhất là địa chỉ in ra khác địa chỉ mình mong.** Hàm `cho_vi` ở trên
làm phép so đó **thay người bấm**, và `&&` giữ cho lệnh gửi không chạy khi nó đỏ — vì một phép
kiểm phụ thuộc vào việc người ta nhớ nhìn thì sớm muộn cũng bị bỏ qua.

🔴 **TỆP KHOÁ MỘT VÍ TỪNG LÀM VÍ KHÔNG KHỞI ĐỘNG ĐƯỢC — đã vá `02/09`.** `check-keys` nhận
diện quỹ bằng dòng tiêu đề `[tên]`; tệp khoá `chain-factory` có đủ mọi trường nhưng **không có
dòng đó** (nó chứa một ví, không có gì để phân biệt) ⇒ phân tích ra **0 khối** ⇒ `FATAL` ⇒ ví
bỏ chạy, và vì `docker run --rm` nên **xác lẫn log đều bị xoá**. Chặng B **chưa bao giờ có thể
chạy được**. `enter.sh` nay tổng hợp tiêu đề **trong ống, không ghi ra đĩa**. Nếu thấy lại
`FATAL … không có khối quỹ nào`: đó là **công cụ kiểm hỏng, không phải khoá hỏng** (D-116).
⚠️ Ảnh node **không có `ps`/`pkill`** ⇒ không dừng được ví bằng cách thường; dựng lại container
(hoặc dùng cổng khác) là đường đúng.
⚠️ Số `100`/`99` là **gợi ý**: g0 chạy suốt với **~90 LOVE9**; chặng B phải chừa phí. **David
chọn số và chọn quỹ nào trả** — đây là tiền thật trên mạng công khai.

**Nghiệm thu — ĐO TRÊN NODE, đừng tin ví:**

```bash
node scripts/watch-network.mjs      # mục "số dư chain-factory" phải hết đỏ
```

---

## Việc 4 — bật cửa

```bash
K="$HOME/.ssh/9chain-a1"; H="$A1_SSH_HOST"
ssh -i "$K" "$H" "grep -n A1_DE_CHAIN_MO ~/9chain-a1/console.env"     # xem nó đang là gì
# sửa thành A1_DE_CHAIN_MO=1  (sửa tay, hoặc sed nếu dòng đã tồn tại)
ssh -i "$K" "$H" '~/9chain-a1/console-restart.sh'
```

🔴 **Chỉ đúng chuỗi `1` mới mở.** Thiếu biến · `0` · `true` · `yes` · rỗng — tất cả là ĐÓNG. Cố ý
hẹp: một cổng an toàn nhận nhiều cách nói *"bật"* là một cổng **bật nhầm**.
🔴 `console-restart.sh` **chốt PID cũ trước khi giết** và đòi **PID mới ≠ PID cũ** — vì *"cổng có
người nghe"* cũng đúng khi bản cũ vẫn đang phục vụ.

**Nghiệm thu — QUA CLOUDFLARE, không nghiệm thu trên host:**

```bash
node scripts/reopen-chain-creation.mjs --probe   # cả ba xanh, đúng thứ tự
node scripts/check-chain-ledger.mjs              # sổ vẫn sạch sau khi cửa mở
```

---

## Sau khi cả bốn xanh — **đừng công bố ngay**

1. 🔴 **Đẻ MỘT L1 thật rồi thu hồi**, trước khi nói với ai. Đường đẻ chain **chưa bao giờ chạy
   trên g1** — cổng thế hệ của console **từ chối theo kiến trúc** trên băng tập (D-093), nên nó
   chỉ kiểm được ở đây. Cần **David ký SIWE**.
2. ⚠️ **Cloudflare cắt POST ở ~100s, đẻ chain mất ~170s** ⇒ `524` **không** nghĩa là hỏng. Đọc
   kết quả từ **sổ chain**, không từ mã HTTP (luật cứng #1).
3. ⚠️ **Câu từ chối của cửa còn nhắc *"rebuilt on 2026-09-01"*.** Mở trong hôm nay thì không ai
   đọc nó nữa; **hoãn sang ngày khác thì câu đó thành lời khai cũ trên trang công khai** — sửa
   `server.mjs:808` trước khi hoãn.
4. `node scripts/gday-preflight.mjs` — ba đỏ phải tự hết. Còn đỏ nào thì **nó là đỏ mới**.
