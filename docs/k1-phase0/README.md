# K1 · pha 0 trên `net-drill9` mới — bộ kit và runbook

Chuẩn bị cho `PLAN-K1-1000-LEDGERS-DEPLOY-2026-09-05.md` §7. Mọi thứ ở đây chạy trên **băng tập g1**
(`networkID 899999998`, tên `9chain-a1-tap-g1`, C-Chain chainId **9000000909** — không phải số thật), trên
máy dev, **0 €**, và không đụng `local-net/` của `main`.

> **Vì sao kit nằm trong `docs/`:** phiên viết nó chạy ở worktree `web-home`; bảng `worktree-ownership.json`
> chỉ cho nhánh này ghi `web/**` và các đường dùng chung (`docs/**`, `*.md`). Chỗ đúng của kit là
> `local-net/tools/k1/` trên `main` — chuyển khi David hoà nhánh. Không có gì ở đây phụ thuộc vị trí
> ngoài `go.work` (đường tương đối tới `../../../9Chain-A1/upstream/avalanchego`).

## Bố cục

```
docs/k1-phase0/
  go.work                  workspace trỏ vào fork (đọc, không sửa fork)
  l1-batch/                công cụ Go: plan · apply · render · status · pump
  config/                  mount vào /9chain-a1/config của mọi node
    l1-evm-genesis.json      khuôn genesis (chép từ 9chain-a1-config, chỉ giữ trường tĩnh)
    chains/<blockchainID>/config.json   render sinh: cache nhỏ, warp API bật
    subnets/<subnetID>.json             render sinh: snow k = 1
  scripts/                 up · down · l1 (chạy công cụ trong container) · fund-key · 10–14 đo
  out/  (gitignore)        net/ (netgen sinh) · plan/ (plan.json, chains.jsonl, override compose) · l1-batch
```

## Vì sao công cụ chạy trong container

`go build` trên Windows hỏng ở blst (cgo) và `storage.AvailableBytes` (không có bản Windows). Fork được dựng
trong `golang:1.25.10-bookworm` ở mọi nơi khác của dự án, kit làm y vậy: `scripts/l1.sh build` dựng một lần
vào `out/l1-batch`, các lệnh sau chạy trong `debian:bookworm-slim` **trên mạng compose** `k1p0_a1net`, nên
địa chỉ node là `172.31.0.11–13:9650` (nội bộ), còn từ host là `127.0.0.1:9750/9760/9770`.

## Ba việc netgen dạy ngay lượt đầu (đã ghi để không lặp)

1. `SUBNET_PREFIX` **phải kết thúc bằng `.0`** — `172.31` sinh IP `172.31.11` (sai), `172.31.0` sinh `172.31.0.11`.
2. Bản tập mặc định mang **chainId C-Chain của mạng thật** (`9000000009`); netgen cảnh báo nhưng vẫn sinh.
   Phải đặt `A1_CHAIN_ID=9000000909`. Đây là cổng patch 0015 đang làm đúng việc: nó **báo**, người phải **đọc**.
3. Dòng định danh của netgen in *"khối chainId L1 9001000000–9001999999"* cho **cả băng tập** — trùng khối
   của g1 thật (Adam Chain là `9001000000`). Kit **không** dùng khối đó: L1 tập lấy `8990000001+`. 🔴 Đáng
   ghi thành việc cho `main`: netgen nên in khối L1 **riêng** cho băng tập.

## Bốn việc lượt chạy đầu dạy (đã sửa trong kit)

1. **Quỹ netgen nằm trên X-Chain, P-Chain rỗng.** Mọi tx P-Chain cần UTXO P ⇒ `l1-batch fund` (xuất X → nhập P,
   ~200 ms) là bước đầu bắt buộc. Bài "ví hai chặng" của mạng thật đúng cả ở băng tập.
2. **Tên chain chỉ nhận chữ, số, khoảng trắng.** `so-0001` bị `illegal name character` **sau** khi subnet đã tạo ⇒
   subnet mồ côi thật đầu tiên. Kit gửi `so 0001`; tên trong `plan.json` vẫn là `so-0001`.
3. **Trần thật của genesis là ~256 KiB, không phải 1 MiB.** `txs.Codec = codec.NewDefaultManager()` giới hạn cả
   giao dịch ở 256 KiB (`codec/manager.go:19`); genesis 505 KB bị `packer has insufficient length` — và cũng để lại
   một subnet mồ côi. `MaxGenesisLen 1 MiB` (`create_chain_tx.go:20`) không bao giờ chạm được.
4. **Sổ một validator đã ngủ mà node restart thì kẹt ở bootstrap** (RPC 503 *"not done bootstrapping"*), và nạp phí
   sau đó **không** tự gỡ kẹt trong 120 s. Luật vận hành: **nạp phí trước khi restart node**, hoặc tính một lượt
   restart nữa sau khi nạp. Đo tiếp ở `EVIDENCE`.

## Chạy

```bash
cd docs/k1-phase0
# 0 · vật liệu mạng tập (đã sinh; sinh lại khi cần — ghi đè out/net)
#     MSYS_NO_PATHCONV=1 docker run --rm -v /c/PROJECTS/9Chain-A1/upstream/avalanchego:/src -w /src \
#       -v "$PWD/out/net":/out -v 9chain-a1-gomod:/go/pkg/mod -e GOWORK=off -e N=3 -e OUT=/out \
#       -e NETWORK_ID=899999998 -e SUBNET_PREFIX=172.31.0 -e A1_CHAIN_ID=9000000909 \
#       -e A1_CONFIG_DIR="$PWD/config" -e A1_HTTP_ALLOWED_HOSTS='*' \
#       golang:1.25.10-bookworm sh -c "go run ./9chain-a1-tools/netgen"
scripts/up.sh                       # 3 node, image g1-81, cổng 9750/9760/9770, chờ P-Chain bootstrap
scripts/l1.sh build                 # một lần
scripts/l1.sh plan  -nodes http://172.31.0.11:9650,http://172.31.0.12:9650,http://172.31.0.13:9650 \
                    -count 30 -per-node 14 -dormant-first 2
K1_FUND_KEY="$(scripts/fund-key.sh)" scripts/l1.sh fund               # X → P, một lần, 1.000 LOVE9
K1_FUND_KEY="$(scripts/fund-key.sh)" scripts/l1.sh apply -limit 5     # 5 sổ đầu; chạy lại = tiếp tục
K1_FUND_KEY="$(scripts/fund-key.sh)" scripts/l1.sh topup -validation <validationID>   # đánh thức một sổ
scripts/l1.sh render                # config/chains, config/subnets, out/plan/docker-compose.k1.yml
scripts/down.sh && scripts/up.sh --k1      # restart MỘT lần với --track-subnets (cờ khởi động)
scripts/l1.sh status                # 5/5 eth_chainId đúng · getL1Validator đúng node · phí giá 1
```

## Bảy phép đo — lệnh, điều kiện qua, ca đỏ

| # | Đo | Lệnh | Qua khi | Ca đỏ |
|---|---|---|---|---|
| **0.1** RAM 15 plugin | 15 sổ trên **một** node (`-nodes http://172.31.0.11:9650 -count 15 -per-node 15`), `pump -rate 3 -seconds 600`, đo `10-measure-plugins.sh` ở phút 0/5/10, **hai lượt**: knob mặc định (xoá `config/chains/*`) và knob K1 | plugSum ≤ ~500 MiB với knob K1; ghi số knob mặc định | knob mặc định vượt 3 GB ⇒ đúng dự đoán §3b của PLAN-K1 |
| **0.2** L1 một validator | `apply -limit 1` rồi `render -solo-snow=false` (không viết subnet config) → restart → `status` + `pump -only so-0001 -seconds 60` | block tăng ⇒ snow mặc định chạy với 1 validator; nếu **không** tăng ⇒ `render -solo-snow=true` rồi thử lại | cố tình `k=2` cho subnet 1 validator ⇒ chain đứng |
| **0.3** `l1-batch` gãy giữa chừng | `apply -limit 3`; giết tiến trình giữa sổ thứ 4 (Ctrl-C khi thấy "CreateSubnetTx"); `apply` lại | `chains.jsonl` không trùng, sổ mồ côi được **báo** (subnet đã tạo, chưa convert) | xoá một dòng `chains.jsonl` ⇒ `apply` tạo lại sổ đó (đúng hành vi), `status` vẫn 1 sổ cũ trên chain — **đây là subnet mồ côi thứ hai**, đếm được |
| **0.4** phí & ngủ đông | `-dormant-first 2 -dormant-balance 120`; `11-fee-state.sh http://127.0.0.1:9750 <validationID>` mỗi 30 s | sau ~2 phút `getL1Validator` hết balance, `status` in `active NO`, block sổ đó **dừng**; `IncreaseL1ValidatorBalanceTx` từ ví **khác** (chưa có trong công cụ — dùng `9chain-a1-cli`/wallet, ghi lại lệnh) ⇒ thức | nạp bằng đúng ví chủ cũng phải được (tx không auth) |
| **0.5** tên metric | `12-metrics-names.sh http://127.0.0.1:9750` | có tên metric cho lượt dựng tập validator (số lượt, thời lượng, lệch chiều cao) | — |
| **0.6** genesis vs txDB | `13-txdb-size.sh` trước `apply`; sau 20 sổ genesis 2 KB; rồi 20 sổ với khuôn phình 500 KB (`-template` khuôn có `alloc` giả 500 KB) | +MB đo được, tỉ lệ ≈ 250× | — |
| **0.7** bootstrap 14 chain | `render` cho node có 14 sổ; `down.sh && up.sh --k1`; đo thời gian tới `info.isBootstrapped` cả 14; `14-startclose.sh` | ≤ vài phút; `too-many-tracked=0`, peers = 2 | ép `-per-node 16` ở `plan` ⇒ **`plan` từ chối** trước khi node nào bị cắt |

Khuôn genesis phình cho 0.6 (không commit, sinh lại — 2.700 mục ≈ 199 KB, 6.900 mục ≈ 505 KB):

```bash
node -e 'const fs=require("fs");const g=JSON.parse(fs.readFileSync("config/l1-evm-genesis.json","utf8"));for(let i=0;i<2700;i++){g.alloc[(BigInt(i)+1n).toString(16).padStart(40,"0")]={balance:"0x1"}}fs.writeFileSync("config/l1-evm-genesis-200k.json",JSON.stringify(g,null,1))'
scripts/l1.sh plan -nodes http://172.31.0.11:9650 -count 5 -per-node 15 -chain-id-base 8990001021 \
  -template config/l1-evm-genesis-200k.json -max-genesis-bytes 1048576 -keep-template-alloc -out out/plan-fat3
```

Mọi số ghi vào `EVIDENCE-<ngày>.md` **trong repo** (không vào `out/`, thư mục đó bị gitignore).

## Cái kit CHƯA có (cố ý, để pha 0 quyết)

- `IncreaseL1ValidatorBalanceTx` và `DisableL1ValidatorTx` — 0.4 dùng công cụ ngoài, kết quả pha 0 quyết có đưa
  vào `l1-batch` không.
- Nhiều ví phát song song (`-workers`) — 30 sổ tuần tự đủ cho pha 0; K1 thật cần 10 UTXO.
- Router RPC — pha 0 gọi thẳng node.
- Chain cộng đồng V = 5 nhận neo — pha 0 chỉ có 3 node.

## Dọn

```bash
scripts/down.sh --wipe        # xoá volume: chain tập biến mất, out/plan giữ lại để đọc
```
