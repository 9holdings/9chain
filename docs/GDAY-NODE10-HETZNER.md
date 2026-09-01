# NGÀY G — NODE HETZNER VÀO THẲNG GENESIS

> 🔴 **ĐÍNH CHÍNH `2026-08-30` — ba điều trong tệp này đã SAI và đã sửa. Đọc trước.**
> Nguồn: diễn tập g1 trên máy dev (D-123→D-128).
>
> | | bản cũ | sự thật đo được |
> |---|---|---|
> | **số node** | `N=10`, Hetzner là node **thứ mười** | 🔴 **`N=9`, Hetzner THAY một node OVH** — D-122 lật D-046 mà không ai nêu; chỉ `N=9` cho self-bond `999.999` LOVE9/node (`8.999.991 = 9 × 999.999`), và nó vào genesis **bất biến**. David chốt lại `30/08` (**D-126**) |
> | **cổng staking** | `A1_STAKING_PORT_BASE=9700` vì node10 đụng `9660` | 🔴 **Bẫy đó KHÔNG tồn tại** — netgen chỉ publish cổng staking cho **beacon**, nên `9660` của node10 nằm trong namespace container nó. Đo thật: 10 node lên đủ, mesh 9/9 ở base mặc định. **Giữ `9651`** (**D-125**) |
> | **nghiệm thu compose** | `grep -c -- "--public-ip=<IP>"` **phải là 10** | 🔴 **Phải là `1`** — chỉ beacon khai IP công khai (patch 0024/D-089). Dòng cũ báo "hỏng" cho một mạng đúng, và cách sửa hiển nhiên là tái lập đúng thiết kế mà diễn tập đã bác (**D-127**) |
>
> Phần **vẫn đúng nguyên vẹn**: node ngoài vào **từ genesis**, không stake sau.

**David chốt `2026-08-29`:** node ngoài vào **genesis**, không stake sau. Nó là validator từ
**block 0**, không cần giao dịch nào, không tốn 25.000 LOVE9, và không phụ thuộc `AddPermissionless…`
chạy trót lọt đúng hôm bận nhất.

Nền: [`TESTNET1-PUBLIC-2026-09-01.md`](TESTNET1-PUBLIC-2026-09-01.md) · D-118c (P2P thật) ·
D-119 (đã stake được — nay thành **đường lui**, không còn là đường chính).

---

## 0. Vì sao vào genesis tốt hơn stake sau

| | stake sau (D-119) | vào genesis |
|---|---|---|
| tốn | 25.000 LOVE9 + 2 giao dịch | **0** |
| phụ thuộc | ví ký được, P-Chain có tiền, RPC thông | **không gì** |
| thời điểm hỏng | giữa ngày G, khi đang bận nhất | lộ ngay lúc sinh mạng, còn sửa được |
| hạn validator | 14 ngày (ngắn hơn 9 node kia ⇒ B-12 đỏ) | **cùng cửa sổ với 9 node genesis** |

⇒ Lượt `29/08` vẫn có giá trị: nó **chứng minh đường stake chạy được** cho người ngoài thật sự.
Nhưng cho node của chính ta, genesis là đường sạch hơn.

---

## 1. 🔴 Ba cái bẫy phải biết TRƯỚC, không phải lúc đang sinh mạng

### 1a. ~~Xung đột cổng `9660`~~ — 🔴 **BÁC BỎ `30/08` (D-125). Giữ nguyên văn dưới đây vì cách suy luận sai vẫn đáng đọc.**

**Sai ở đâu:** lập luận đúng tới chỗ *"node10 lấy `--staking-port=9660`"* rồi dừng, và bỏ qua
việc netgen **chỉ publish cổng staking cho beacon** (`nd.Index == 1`). Cổng `9660` của node10
sống trong namespace của container nó; `9660` trên host là API node2 — hai không gian tên khác
nhau. Đo thật `30/08`: `N=10` base mặc định ⇒ 10 node lên hết, không va chạm, mesh 9/9.
**Bài học: một bẫy đọc-ra-từ-mã chưa phải một bẫy** — nó chỉ là giả thuyết cho tới khi có số đo,
và ở đây giả thuyết đó suýt mua thêm hai bước phải nhớ giữa ngày G.

*(nguyên văn bản cũ:)*

netgen publish API của **node2** ở `127.0.0.1:9660` (cố ý — Caddy có hai upstream, D-1xx).
Ở chế độ `ipv4port`, staking port của node **N** là `A1_STAKING_PORT_BASE + N - 1`. Với
`N=10` và mặc định `9651` ⇒ node10 lấy **9660** ⇒ **đụng cổng API node2**.

⇒ **Đặt `A1_STAKING_PORT_BASE=9700`** cho lượt ngày G. Staking ports thành `9700–9709`, không
đụng `9650`/`9660`. Rẻ, và tránh hẳn một lớp lỗi.

⚠️ Với N=9 lỗi này **không tồn tại** (staking cao nhất là 9659), nên nó chỉ xuất hiện đúng lúc
ta thêm node thứ 10 — tức đúng ngày G nếu không lường trước.

### 1b. Node10 KHÔNG chạy bằng compose của netgen

netgen sinh compose cho **cả N node trên một máy**, và đặt `--bootstrap-ips` bằng **địa chỉ nội
bộ** (đúng — Docker không hairpin, D-089). Node10 ở máy khác thì cả hai đều sai với nó:

- nó phải khai `--public-ip=95.217.60.140` (IP **của nó**), không phải của server A1;
- `--bootstrap-ips` của nó phải là **địa chỉ CÔNG KHAI** của beacon: `139.99.145.13:9651`.

⇒ Trên OVH chỉ `up` **node1..node8**. Thư mục `node9/` chỉ dùng để lấy **danh tính**.

### 1c. Binary trên Hetzner hiện là `A1Gen 0` — phải dựng lại, và **DỰNG TRƯỚC NGÀY G**

`A1Gen` đi vào binary. Bump 0 → 1 đổi networkID, tên mạng **và đường DB**. Binary đang chạy ở
Hetzner (dựng `29/08`) là bản `g0` ⇒ **không dùng lại được**.

🔴 **`git am` phải là ĐỦ 26 PATCH, không phải 25.** Bản đầu mục này ghi *"25 patch"* — số của
`28/08`. **Patch `0026` CHÍNH LÀ lượt bump `A1Gen 0→1`**, nên dừng ở 25 cho ra một binary
**thế hệ đã chết** mang nhãn g1: node boot với `--network-id=999999998` trên binary chỉ biết
`999999999` ⇒ `NetworkName()` rơi xuống `network-999999998` (**sai đường dẫn DB**) và `GetHRP()`
sống bằng `FallbackHRP` — đúng nhánh patch 0013 sinh ra để xoá. Đây là **chỗ chặn cứng số 1 của
ngày G (D-137), dời sang máy khác**: cùng lỗi, khác máy chủ.

🔴 **VÀ NÓ PHẢI XONG TRƯỚC NGÀY G.** Binary này **không phụ thuộc byte chữ khắc và không phụ
thuộc genesis** — đúng lập luận D-128 đã dùng để đẩy image OVH ra khỏi ngày G. Để nó lại giữa
ngày G là xếp một lượt build Go **sau `down -v`**, trên máy duy nhất chứng minh **điều kiện qua
số 3** (một node NGOÀI máy chủ là peer).

🔴 **ĐỪNG BUILD Ở HETZNER — CHỞ IMAGE SANG, y như D-137 đã làm cho OVH.** Build lại là dựng
**một binary thứ hai** rồi hy vọng nó bằng bản đã diễn tập; chở đi là **đúng bản đó**. Lý do
D-137 cấm build trên OVH (cây nguồn ở đó là ảnh chụp, không phải git repo) chưa ai đi đo ở
Hetzner — và ta không cần biết câu trả lời nếu không build ở đó. Docker **có sẵn** trên máy đó
(D-118 đã build trong container `golang`).

⚠️ Ba lý do nữa, mỗi cái đủ để bỏ đường build:
- lượt build Go mất **hàng chục phút**, và nó đang được xếp **sau `down -v`**;
- `scripts/build.sh` nhúng `commit=` từ biến `AVALANCHEGO_COMMIT`; build trần mà quên khai thì
  binary tự xưng `9chain-a1-poc`, tức **tiêu chí nghiệm thu không thoả được** (cùng lỗi mà
  `--build-arg A1_COMMIT=` sinh ra ở đường Docker);
- `Dockerfile` chạy `scripts/rebrand.sh` **trong lúc build**. Build trần bỏ bước đó ⇒ lớp bản
  sắc có thể lệch với image đang chạy ở OVH, mà **9/9 node vẫn xanh** khi lệch (gotcha 10).

---

## 1d. 🔴 CHỞ IMAGE SANG HETZNER — làm **HÔM NAY**, không phải ngày G

Image `9chain-a1/node:g1` **không phụ thuộc byte chữ khắc và không phụ thuộc genesis** — đúng
lập luận D-128 dùng để đẩy lượt build OVH ra khỏi ngày G. Ngày G chỉ còn **khởi động**.

Số đo trên máy dev, `2026-08-31T20:2x UTC` — dùng làm mỏ neo cho mọi bước dưới:

```
image     9chain-a1/node:g1           586 MB
--version 9chaingo/1.14.2 [database=v1.4.5, rpcchainvm=45,
                           commit=9chain-a1-g1-26patch-60a61707, go=1.25.10]
sha256    7ad4e2ac76ea8e2c6f48cb5144971569510371c7eb644eef88eac5f31f4c6ea4  build/avalanchego
sha256    33d0bd0068afe7b3b1660e7d58c3dc8bb4371e0444e4298de262d58962f6422c  build/plugins/pkqXsz…4mf
nền       debian:12-slim · glibc 2.36
```

### Máy Hetzner thật ra là gì — đo `2026-09-01`, đừng đoán lại

| | |
|---|---|
| khoá SSH | `~/.ssh/id_ed25519`, `root@95.217.60.140` (không phải khoá `9chain-a1` của OVH) |
| hệ | **Ubuntu noble 24.04**, kernel 6.8 ⇒ glibc **≥ 2.36** |
| đĩa | `436G`, còn **84G** (80% đã dùng) — image 586 MB là **0,7%** chỗ trống |
| image A1 | 🔴 **KHÔNG có cái nào.** `docker images 9chain-a1/node` ra **rỗng** |
| node9 | chạy **binary trần**, PID 34489, từ `29/08`, `--network-id=999999999` (**g0**) |

🔴 **ĐÂY LÀ MÁY DÙNG CHUNG, KHÔNG PHẢI MÁY RIÊNG CỦA A1.** Nó đang chạy production của nhiều dự
án khác (`oneboard*`, `9mall-*`, `worldboard-*`, `isocial-*`, `msc-*`, `caddy`, `shared-*`) —
**178 image · 228 container · 87,6 GB**. Mọi thao tác ở đây phải **cộng thêm**, không dọn dẹp:
`docker system prune` trên máy này là xoá việc của người khác.

✅ Vì noble ≥ glibc 2.36, cái bẫy `GLIBC_2.36 not found` ở Bước C **không áp cho máy này** — đó
là số đo, không phải phỏng đoán. Vẫn chạy bằng container ở giờ G vì lý do còn lại: node9 khi đó
dùng **cùng runtime** với 8 node OVH.

### Bước A · chở image (máy dev → Hetzner)

```bash
docker save 9chain-a1/node:g1 | gzip | \
  ssh -i ~/.ssh/id_ed25519 root@95.217.60.140 'gunzip | docker load'
```

### Bước B · 🔴 NGHIỆM THU **TRÊN CHÍNH MÁY HETZNER** — ba mỏ neo độc lập

🔴 **KHÔNG DÙNG `strings` — image KHÔNG CÓ NÓ.** Bản đầu mục này viết `strings … | grep -c`.
Chạy thật `2026-09-01` trên Hetzner: `sh: 1: strings: not found`, và `grep -c` trên đầu vào rỗng
in ra **`0`** — tức mục *"`9chain-a1-g0` phải = 0"* **ĐẠT bằng một cái ống gãy**. Đúng lớp lỗi đắt
nhất của dự án: một con số đúng đến từ một công cụ không chạy. Dùng `grep -a` thẳng trên binary.

```bash
ssh -i ~/.ssh/id_ed25519 root@95.217.60.140 '
  B=/9chain-a1/build/avalanchego
  docker run --rm --entrypoint ./avalanchego 9chain-a1/node:g1 --version
  docker run --rm --entrypoint sha256sum   9chain-a1/node:g1 $B
  # 🔴 công cụ phải TỰ KHAI là có (D-116: công cụ hỏng ≠ phán quyết)
  docker run --rm --entrypoint sh 9chain-a1/node:g1 -c "command -v grep >/dev/null && echo grep-OK || echo grep-MISSING"
  # 🔴 hai ca đối chứng TRƯỚC, để biết số 0 nghĩa là "không có" chứ không phải "không đo được"
  docker run --rm --entrypoint grep 9chain-a1/node:g1 -ac avalanchego            $B   # phải > 0
  docker run --rm --entrypoint grep 9chain-a1/node:g1 -ac zzz-khong-ton-tai-zzz  $B   # phải = 0
  docker run --rm --entrypoint grep 9chain-a1/node:g1 -ac 9chain-a1-g1 $B
  docker run --rm --entrypoint grep 9chain-a1/node:g1 -ac 9chain-a1-g0 $B
  docker run --rm --entrypoint grep 9chain-a1/node:g1 -ac LOVE9        $B
'
```

Số đo thật trên Hetzner `2026-09-01` — **trùng khít bản OVH của D-137**:

| phải ra | đo được | vì sao mỏ neo này không thay được mỏ neo kia |
|---|---|---|
| `commit=9chain-a1-g1-26patch-60a61707` | ✅ khớp | chuỗi này do `--build-arg` đặt ⇒ **một mình nó chứng minh rất ít**, khai gì cũng được |
| `sha256 = 7ad4e2ac…6ea4` | ✅ khớp | **byte y hệt** bản đã diễn tập. Đây mới là mỏ neo mạnh |
| `grep-OK` · ca chắc-có > 0 · ca chắc-không = 0 | ✅ `grep-OK` · `283` · `0` | không có ba dòng này thì hai dòng dưới **vô nghĩa** |
| `9chain-a1-g1` > 0 | ✅ **4** | |
| **`9chain-a1-g0` = 0** | ✅ **0** | vế **0 lần** là vế quan trọng: loại hẳn khả năng đây là binary thế hệ chết dán nhãn mới |
| `LOVE9` > 0 | ✅ **2** | bí danh tài sản có trong binary (gotcha 16) |

⚠️ **Git Bash trên Windows bẻ đường dẫn** — `/9chain-a1/build/…` bị dịch thành
`C:/Program Files/Git/9chain-a1/…` và lệnh chết với *"No such file"*. Đã dính khi soạn mục này.
Chạy các lệnh có đường dẫn tuyệt đối trong container với `MSYS_NO_PATHCONV=1` ở đầu, hoặc chạy
chúng **qua `ssh`** như trên (trong dấu nháy đơn thì Git Bash không đụng tới).

### Bước C · ngày G — chạy node9 **BẰNG CONTAINER**, không phải binary trần

🔴 **Đừng `docker cp` binary ra host rồi chạy trần.** Image nền là Debian 12 (**glibc 2.36**);
nếu Hetzner đang là Ubuntu 22.04 (glibc 2.35) thì binary **không khởi động được**, và lỗi
`GLIBC_2.36 not found` xuất hiện đúng lúc mạng cũ đã bị xoá. Chạy trong container thì câu hỏi
đó **không tồn tại** — và node9 khi đó dùng **cùng một runtime** với 8 node OVH.
*(Nếu vẫn muốn đường binary trần: đo trước `ldd --version` trên máy đó, phải ≥ 2.36.)*

🔴 **BƯỚC 0 KHÔNG ĐƯỢC BỎ: node9 hôm nay là một TIẾN TRÌNH TRẦN, và nó đang GIỮ CỔNG `9651`.**
Đo `2026-09-01 07:18Z`: `PID 34489`, chạy từ `29/08`, `LISTEN *:9651`. Nó **không thuộc Docker**
⇒ `docker stop`/`rm`/`compose down` **không đụng được tới nó**, và không lệnh docker nào cho thấy
nó tồn tại. Hai thứ hỏng nếu bỏ bước này, cả hai **sau `down -v`**:

1. `--network host` khiến Docker **không kiểm cổng trước khi chạy**. Container lên, avalanchego
   bind `9651` **thất bại**, tiến trình chết — nhưng `docker run -d` đã trả về **thành công**, và
   `--restart unless-stopped` đưa nó vào **vòng lặp restart**. `docker ps` in `Restarting`, không
   dòng nào nói vì sao, và nguyên nhân nằm ở một PID ba ngày tuổi mà mọi cổng duyệt docker **mù**.
   (Đúng hình dạng container `9chain-a1-heartbeat` sáng nay: 430 lượt restart, không ai biết.)
2. `rm -rf /opt/9chain-a1/data` chạy **trong lúc tiến trình còn sống** vẫn *"thành công"* — Linux
   chỉ gỡ liên kết, tiến trình giữ nguyên fd đang mở và **ghi tiếp**, có thể tạo lại tệp. Ta tưởng
   đã xoá danh tính cũ; nó vẫn ở đó.

```bash
# 0) 🔴 DỪNG TIẾN TRÌNH TRẦN TRƯỚC — nó không phải container.
pgrep -af '[a]valanchego' || echo "  (khong con tien trinh nao — bo qua buoc nay)"
kill "$(pgrep -f '[a]valanchego --network-id=999999999')"
sleep 5
# ĐỐI CHỨNG — cả hai dòng dưới PHẢI rỗng trước khi đi tiếp:
pgrep -af '[a]valanchego'          # tien trinh da chet?
ss -lntp | grep ':9651'            # cong da nha?
# Còn sống sau 5s thì `kill -9 <PID>`. ĐỪNG chạy tiếp khi cổng chưa nhả —
# bước 3 sẽ "thành công" rồi chết lặng trong vòng lặp restart.

# 1) XOÁ DB CŨ — CHỈ SAU KHI tiến trình đã chết (xem trên).
#    Nó giữ database g0 VÀ một danh tính tự sinh.
#    Để lại là node lên bằng nodeID SAI, không phải nodeID trong genesis.
rm -rf /opt/9chain-a1/data && mkdir -p /opt/9chain-a1/data

# 2) chép sang: node9/{staker.key,staker.crt,signer.key} + genesis.json của g1
#    (cả hai chỉ tồn tại SAU khi netgen chạy ở giờ G)

# 3) chạy
docker run -d --name 9chain-a1-node-9 --restart unless-stopped --network host \
  -v /opt/9chain-a1:/opt/9chain-a1 \
  --entrypoint ./avalanchego 9chain-a1/node:g1 \
  --network-id=999999998 \
  --genesis-file=/opt/9chain-a1/genesis.json \
  --data-dir=/opt/9chain-a1/data \
  --staking-tls-cert-file=/opt/9chain-a1/node9/staker.crt \
  --staking-tls-key-file=/opt/9chain-a1/node9/staker.key \
  --staking-signer-key-file=/opt/9chain-a1/node9/signer.key \
  --public-ip=95.217.60.140 --staking-port=9651 \
  --http-host=127.0.0.1 --http-port=9655 \
  --bootstrap-ips=139.99.145.13:9651 --bootstrap-ids=<NodeID node1 của g1>
```

⚠️ `--network host` là cố ý: `--public-ip` và cổng `9651` phải là cổng **thật của máy**, và
`--http-host=127.0.0.1` giữ API **không** ra Internet. Không có nó thì phải `-p` từng cổng và
`127.0.0.1` bên trong container không còn nghĩa như ta tưởng.

### Bước D · đo BINARY đang chạy, rồi mới đo mạng

```bash
docker exec 9chain-a1-node-9 ./avalanchego --version    # lại phải ra commit=…-26patch-60a61707
curl -s -X POST -H 'content-type:application/json' \
  --data '{"jsonrpc":"2.0","id":1,"method":"info.getNodeID","params":{}}' \
  http://127.0.0.1:9655/ext/info                        # rồi grep nodeID đó trong genesis.json
```

🔴 **Phép đo binary là BẮT BUỘC và nó KHÔNG có trong bảng nghiệm thu Bước 5** — bảng đó đo
**mạng** (validator · peers · bootstrap), thứ D-137 vừa chứng minh là không nói gì về binary
đang chạy. Và việc tay *"Measure the BINARY"* của preflight viết `docker exec <node>` cho các
node **trong compose ở OVH**; node9 nằm ngoài compose, trên máy khác ⇒ **không mục nào phủ nó**
cho tới dòng này.

### Nếu KHÔNG chở image được (đường lui, chỉ dùng khi bước A thất bại)

Build ở Hetzner **bằng đúng `Dockerfile` này**, không build trần — nó đã gói sẵn `rebrand.sh`
và `AVALANCHEGO_COMMIT`:

```bash
git clone https://github.com/ava-labs/avalanchego.git && cd avalanchego
git checkout 1cf1fc3 && git am --keep-cr /path/9chain-a1/patches/*.patch
git rev-parse HEAD^{tree}     # PHẢI ra 60a61707f7974a0f1853b8bf78df7d0fdc1ef863
# đối chứng ngược: áp 25/26 phải ra f2b9486b71ad53b584a86f77d6017c34d74e6fa6
docker build -f local-net/Dockerfile \
  --build-arg A1_COMMIT=9chain-a1-g1-26patch-60a61707 -t 9chain-a1/node:g1 .
```
Rồi vẫn chạy **Bước B** — và `sha256` ở đó **có thể lệch** (Go build không đảm bảo tái lập
theo byte qua hai máy). Lệch sha256 mà `--version` + hai vế `strings` đúng thì **chấp nhận
được nhưng phải khai ra**: nó nghĩa là node9 chạy một binary **chưa từng được diễn tập**.

---

## 2. Quy trình — theo đúng thứ tự

### Bước 1 · Sinh mạng **9 node** (trên server A1)

```bash
N=9 \
NETWORK_ID=999999998 \
A1_P2P_MODE=ipv4port \
A1_PUBLIC_IP=139.99.145.13 \
  <lệnh netgen ngày G>
```
*(Không đặt `A1_STAKING_PORT_BASE` — mặc định `9651` là đúng, xem đính chính đầu tệp.)*

🔴 Nghiệm thu **ngay**, trước khi `up` bất cứ thứ gì:
```bash
grep -c -- "--public-ip=139.99.145.13" <net>/docker-compose.multinode.yml   # phải là 1  (CHỈ beacon)
grep -c -- "--public-ip=" <net>/docker-compose.multinode.yml                # phải là 9  (mỗi node một dòng)
grep image: <net>/docker-compose.multinode.yml                              # gotcha 16
```
Và đọc dòng netgen in về **self-bond**: phải là `999,999 LOVE9 mỗi node`, **không kèm cảnh báo**.
Có cảnh báo nghĩa là N ≠ 9 và bộ chín số 9 đã mất (D-046 · D-126).

### Bước 2 · Chỉ chạy 8 node trên OVH

```bash
docker compose -f <net>/docker-compose.multinode.yml up -d \
  9chain-a1-node-1 9chain-a1-node-2 ... 9chain-a1-node-8
sudo ufw allow 9651:9659/tcp comment "9Chain-A1 P2P g1"
```

### Bước 3 · Chuyển danh tính node9 sang Hetzner

Ba tệp: `node9/staker.key` · `node9/staker.crt` · `node9/signer.key`.

🔴 **Đây là KHOÁ.** Không phải khoá quỹ, nhưng ai cầm nó **mạo danh được validator này**.
- chuyển thẳng máy-sang-máy, **không** qua thư mục trung chuyển trên `C:`;
- xong việc chạy `node scripts/check-key-leaks.mjs` — cổng chỉ đỏ với **khoá quỹ**, nên
  danh tính validator **nó không canh**: dọn bằng tay và đối chứng bằng `find`.

### Bước 4 · Chạy node9 ở Hetzner

```bash
/opt/9chain-a1/avalanchego/build/avalanchego \
  --network-id=999999998 \
  --genesis-file=/opt/9chain-a1/genesis.json \
  --data-dir=/opt/9chain-a1/data \
  --staking-tls-cert-file=/opt/9chain-a1/node9/staker.crt \
  --staking-tls-key-file=/opt/9chain-a1/node9/staker.key \
  --staking-signer-key-file=/opt/9chain-a1/node9/signer.key \
  --public-ip=95.217.60.140 --staking-port=9651 \
  --http-host=127.0.0.1 --http-port=9655 \
  --bootstrap-ips=139.99.145.13:9651 --bootstrap-ids=<NodeID của node1 g1>
```

🔴 **Ngay sau khi nó lên, đo nodeID nó tự khai và so với `genesis.json`** — đó là thứ chứng minh
danh tính đã nạp đúng. Đo `30/08` trên bản tập: khớp, và `grep -c <nodeID> genesis.json` = 1.

⚠️ **Xoá `--data-dir` cũ trước** — nó chứa DB của `g0` và một danh tính **tự sinh** khác.
Để lại là node lên bằng nodeID cũ, **không** phải nodeID trong genesis.

### Bước 5 · Nghiệm thu — đo trên MẠNG, không đọc lệnh

| phải đạt | đo bằng |
|---|---|
| **9 validator**, có nodeID node9 | `platform.getCurrentValidators` trên RPC công khai |
| node9 `isBootstrapped` P/X/C = true | `info.isBootstrapped` trên chính node9 |
| **node OVH KHÔNG phải beacon thấy node9** | `info.peers` trên node đó |
| 🔴 `ingressConnectionCount > 0` | `health.health` trên node9 — xem §3 |
| hạn validator node9 **cùng cửa sổ** 8 node kia | `getCurrentValidators` → `endTime` |

⏱️ **Cho mesh thời gian trước khi kết luận.** Đo `30/08` trên bản tập: node ngoài bootstrap ở
**~50s**, nhưng node **không phải beacon** chỉ thấy nó ở **~70s**. Chấm điểm ở mốc 30s là khai
một sự cố không có thật — đúng lớp lỗi mà repo này đã trả giá nhiều lần.

✅ **Hạn validator cùng cửa sổ là ĐẠT SẴN theo kiến trúc** khi node vào từ genesis: đo được
cửa sổ **56 ngày**, mỗi node cách nhau đúng **7 ngày**. Không cần thao tác gì để đạt điều kiện
này — chỉ cần **không** đi đường stake-sau (đường đó cho 14 ngày, và làm B-12 đỏ).

---

## 3. 🔴 Điều D-121 phát hiện, và ngày G nó sẽ quay lại

Sau khi node ngoài thành validator, avalanchego bật một phép kiểm **chỉ áp cho validator**:

```
network layer is unhealthy: primary network validator has no inbound connections
ingressConnectionCount: 0 · primaryNetworkValidator: true
```

Đo `29/08`: cổng `9651` **thông thật** từ Internet (TCP True, node listen `*:9651`, ufw mở) —
nên số 0 nghĩa là *chưa peer nào chủ động gọi VÀO*, không phải *không gọi được*. Avalanchego
**không phân biệt hai điều đó**.

🔴 **Ngày G điều này quan trọng hơn hôm nay**: uptime của validator đo theo kết nối, và một
validator genesis bị chấm uptime thấp là chuyện thật, không phải nhiễu. ⇒ Sau bước 5, **theo dõi
`ingressConnectionCount` ít nhất một giờ**; nếu vẫn 0 thì đó là việc phải xử lý, không phải cảnh
báo bỏ qua được.

---

## 4. Đường lui

Nếu máy Hetzner không kịp nhận danh tính node9: **chạy cả 9 node trên OVH** (mạng vẫn đúng, chỉ
là O4 chưa gỡ được), rồi dùng đường D-119 (`local-net/tools/stake-validator/`) để thêm node ngoài
**sau** khi mạng đã ổn. Đường đó đã chạy thật `29/08`.

⚠️ Giá của đường lui, nói thẳng: node thêm sau là **validator thứ 10** ⇒ hạn của nó **14 ngày**,
ngắn hơn hẳn cửa sổ 56 ngày của 9 node genesis ⇒ **B-12 đỏ**; cộng **25.000 LOVE9**. Đắt hơn,
nhưng nó **đã được chứng minh**, và ngày G không phải lúc thử một đường chưa ai đi.
⚠️ Và nó **không** đụng tới bộ chín số 9: self-bond vẫn chia cho 9 node genesis (D-046 · D-126).
