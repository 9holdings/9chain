# NGÀY G — NODE THỨ 10 Ở HETZNER, VÀO THẲNG GENESIS

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

### 1a. Xung đột cổng `9660` — netgen KHÔNG tự phát hiện

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
- `--bootstrap-ips` của nó phải là **địa chỉ CÔNG KHAI** của beacon: `139.99.145.13:9700`.

⇒ Trên OVH chỉ `up` **node1..node9**. Thư mục `node10/` chỉ dùng để lấy **danh tính**.

### 1c. Binary trên Hetzner hiện là `A1Gen 0` — ngày G phải build lại

`A1Gen` đi vào binary. Bump 0 → 1 đổi networkID, tên mạng **và đường DB**. Binary đang chạy ở
Hetzner (dựng `29/08`) là bản `g0` ⇒ **không dùng lại được**.

⇒ Sau khi bump `A1Gen` ở **cả hai ngôn ngữ**, build lại trên Hetzner đúng đường đã chạy ở D-118:
`git am` 25 patch → tree phải ra hash của bộ patch ngày G → build trong container `golang`.

---

## 2. Quy trình — theo đúng thứ tự

### Bước 1 · Sinh mạng 10 node (trên server A1)

```bash
N=10 \
NETWORK_ID=999999998 \
A1_P2P_MODE=ipv4port \
A1_PUBLIC_IP=139.99.145.13 \
A1_STAKING_PORT_BASE=9700 \
  <lệnh netgen ngày G>
```

🔴 Nghiệm thu **ngay**, trước khi `up` bất cứ thứ gì:
```bash
grep -c -- "--public-ip=139.99.145.13" <net>/docker-compose.multinode.yml   # phải là 10
grep image: <net>/docker-compose.multinode.yml                              # gotcha 16
```

### Bước 2 · Chỉ chạy 9 node trên OVH

```bash
docker compose -f <net>/docker-compose.multinode.yml up -d \
  9chain-a1-node-1 9chain-a1-node-2 ... 9chain-a1-node-9
sudo ufw allow 9700:9709/tcp comment "9Chain-A1 P2P g1"
```

### Bước 3 · Chuyển danh tính node10 sang Hetzner

Ba tệp: `node10/staker.key` · `node10/staker.crt` · `node10/signer.key`.

🔴 **Đây là KHOÁ.** Không phải khoá quỹ, nhưng ai cầm nó **mạo danh được validator này**.
- chuyển thẳng máy-sang-máy, **không** qua thư mục trung chuyển trên `C:`;
- xong việc chạy `node scripts/check-key-leaks.mjs` — cổng chỉ đỏ với **khoá quỹ**, nên
  danh tính validator **nó không canh**: dọn bằng tay và đối chứng bằng `find`.

### Bước 4 · Chạy node10 ở Hetzner

```bash
/opt/9chain-a1/avalanchego/build/avalanchego \
  --network-id=999999998 \
  --genesis-file=/opt/9chain-a1/genesis.json \
  --data-dir=/opt/9chain-a1/data \
  --staking-tls-cert-file=/opt/9chain-a1/node10/staker.crt \
  --staking-tls-key-file=/opt/9chain-a1/node10/staker.key \
  --staking-signer-key-file=/opt/9chain-a1/node10/signer.key \
  --public-ip=95.217.60.140 --staking-port=9651 \
  --http-host=127.0.0.1 --http-port=9655 \
  --bootstrap-ips=139.99.145.13:9700 --bootstrap-ids=<NodeID của node1 g1>
```

⚠️ **Xoá `--data-dir` cũ trước** — nó chứa DB của `g0` và một danh tính **tự sinh** khác.
Để lại là node lên bằng nodeID cũ, **không** phải nodeID trong genesis.

### Bước 5 · Nghiệm thu — đo trên MẠNG, không đọc lệnh

| phải đạt | đo bằng |
|---|---|
| **10 validator**, có nodeID node10 | `platform.getCurrentValidators` trên RPC công khai |
| node10 `isBootstrapped` P/X/C = true | `info.isBootstrapped` trên chính node10 |
| **mọi node OVH thấy node10** | `info.peers` trên node **không phải beacon** |
| 🔴 `ingressConnectionCount > 0` | `health.health` trên node10 — xem §3 |
| hạn validator node10 **cùng cửa sổ** 9 node kia | `getCurrentValidators` → `endTime` |

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

Nếu node10 không vào được genesis kịp: **sinh mạng 9 node như cũ**, rồi dùng đường D-119
(`local-net/tools/stake-validator/`) để thêm node ngoài **sau** khi mạng đã ổn. Đường đó đã chạy
thật `29/08`. Mất 25.000 LOVE9 và vài phút — đắt hơn, nhưng nó **đã được chứng minh**, và ngày G
không phải lúc thử một đường chưa ai đi.
