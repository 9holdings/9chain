# Triển khai 9Chain-A1 Testnet công khai (validator nhiều máy/vùng)

Hướng dẫn đưa mạng 9Chain-A1 ra nhiều VPS thật (đa vùng). Local đã kiểm chứng 5 node; đây là bản "thật".

## Tổng quan

```
[Máy build]  netgen -> genesis.json + node1..N/{staker.crt,staker.key,signer.key}
     │            │
     │ push image │ chuyển AN TOÀN mỗi bộ khoá tới đúng VPS (scp/age/vault)
     ▼            ▼
[VPS #1 vùng A]  node1 = BEACON   (public IP A)
[VPS #2 vùng B]  node2  bootstrap từ node1
[VPS #3 vùng C]  node3  ...
     ...         (mỗi máy chạy local-net/deploy/node.compose.yml)
```

## 1. Sinh vật liệu mạng (máy build, offline)
```bash
bash local-net/gen-network.sh 5     # -> local-net/net/{genesis.json,node1..5,treasury.txt}
```
- Lưu `treasury.txt` **offline** (khoá quỹ). Không bao giờ đưa lên VPS.
- Mỗi `nodeK/` chỉ chuyển tới ĐÚNG VPS thứ K.

## 2. Chuẩn bị image trên mỗi VPS
Cách A — build tại chỗ: copy repo + `docker build -f local-net/Dockerfile -t 9chain-a1/node:dev .`
Cách B (khuyến nghị) — build 1 lần, push registry riêng, mỗi VPS `docker pull`:
```bash
docker tag 9chain-a1/node:dev <registry>/9chain-a1-node:testnet
docker push <registry>/9chain-a1-node:testnet
# trên VPS: đặt A1_IMAGE=<registry>/9chain-a1-node:testnet
```

## 3. Trên MỖI VPS
```bash
# thư mục làm việc
mkdir -p 9chain-a1 && cd 9chain-a1
# đưa vào: genesis.json (chung) + node/  (đúng bộ khoá của máy này)
scp build:.../net/genesis.json ./genesis.json
scp build:.../net/node2/*      ./node/        # ví dụ máy #2

# mở firewall P2P
sudo ufw allow 9651/tcp

# lấy compose
scp build:.../local-net/deploy/node.compose.yml ./
```

### Node BEACON (node1) — chạy trước
```bash
PUBLIC_IP=<IP_công_khai_node1> \
  docker compose -f node.compose.yml up -d
# lấy NodeID (đã biết từ netgen, hoặc):
curl -s -X POST --data '{"jsonrpc":"2.0","id":1,"method":"info.getNodeID"}' \
  -H 'content-type:application/json' http://127.0.0.1:9650/ext/info
```

### Các node còn lại — trỏ về beacon
```bash
PUBLIC_IP=<IP_công_khai_máy_này> \
BOOTSTRAP_IDS=<NodeID_của_node1> \
BOOTSTRAP_IPS=<IP_node1>:9651 \
  docker compose -f node.compose.yml up -d
```

## 4. Kiểm chứng mạng
```bash
# trên bất kỳ node có API:
curl -s -X POST --data '{"jsonrpc":"2.0","id":1,"method":"platform.getCurrentValidators"}' \
  -H 'content-type:application/json' http://127.0.0.1:9650/ext/bc/P
# -> phải thấy đủ N validator, connected:true
```

## 5. Dịch vụ testnet
- **Faucet**: chạy `local-net/faucet` với `FAUCET_PK` = 1 khoá quỹ testnet (KHÔNG dùng treasury chính), `FAUCET_RPC` = C-Chain public RPC.
- **Explorer**: host `local-net/explorer` (static) trỏ `rpc` tới C-Chain/L1 public RPC.
- **RPC công khai**: đặt `HTTP_HOST=0.0.0.0` + đứng sau reverse proxy (rate-limit, TLS). Cân nhắc kỹ bảo mật.

## 6. An toàn khoá (BẮT BUỘC)
- `signer.key`, `staker.key`: bí mật của từng node — chuyển qua kênh mã hoá (scp/age/Vault), quyền `600`, không commit.
- `treasury.txt`: giữ offline/cold. Faucet dùng ví riêng nạp sẵn, không dùng treasury chính.
- Đặt `restart: unless-stopped` (đã có) + monitoring uptime (yêu cầu 80%).

## Ghi chú vận hành
- avalanchego cần **IP thật** (không hostname) → dùng `network_mode: host` trên VPS.
- Đồng bộ đồng hồ (chrony/ntp) — lệch giờ > 60s gây rớt peer.
- Đa vùng: chọn ≥3 vùng địa lý khác nhau để phi tập trung thật.
- Rebase upstream định kỳ (vá bảo mật) — xem [ARCHITECTURE.md](ARCHITECTURE.md).
