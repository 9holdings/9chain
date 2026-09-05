# Mua máy cho K1 — bảng vật tư, cấu hình, nghiệm thu

Viết `2026-09-05` sau pha 0 (`docs/k1-phase0/EVIDENCE-2026-09-05.md`). Mọi cỡ máy dưới đây suy từ **số đo trên
node đang chạy**, không từ mô hình PLAN-108. Việc **đặt hàng và thanh toán là của David** trên tài khoản nhà cung
cấp; tài liệu này là thứ để đặt đúng một lần. Giá: trang Hetzner render bằng JS nên không đọc được từ đây — mọi
số € là **ước từ giá công khai trước đó, phải đọc lại trong console lúc đặt**.

---

## 0. Câu trả lời ngắn

| | |
|---|---|
| **Mua gì** | **9 máy dedicated** (cỡ AX42: 8 nhân/16 luồng, 64 GB, 2 × NVMe) + **5 VM cloud** nhỏ (3 sinh tải, 1 router, 1 đo) |
| **Xếp thế nào** | 72 node chủ sổ = **8 node/máy × 9 máy**; 9 node mạng mẹ băng tập = 3 node trên **3 máy đầu** (mỗi máy đó chạy 8 + 3 = 11 node); 1 chain cộng đồng V = 5 trên 5 node chủ sổ |
| **Vì sao 8 node/máy** | pha 0: 10 sổ/node có tải = cgroup **0,39 GB · 0,2 nhân**; 15 sổ ≈ 0,6 GB · 0,3 nhân ⇒ 8 node = **5 GB RAM · 2,4 nhân** — máy 64 GB/16 luồng dư 10 lần |
| **Cái quyết định số máy là ĐĨA** | mỗi chain cấp sẵn **290 MB** + **~900 B/tx/node**. 8 node × 15 sổ: nền 34 GB; ở **r = 3 tx/s**: +28 GB/ngày ⇒ 30 ngày **~875 GB** ⇒ cần **2 × 1,92 TB**; ở **r = 1**: +9 GB/ngày ⇒ 30 ngày **~315 GB** ⇒ **2 × 512 GB** đủ |
| **Đề xuất** | **r = 1 tx/s** cho 950 sổ + 9 tx/s cho 50 sổ nóng (câu hỏi của K1 nằm ở P-Chain), **AX42 cấu hình mặc định 2 × 512 GB**, RAID1 |
| **Tiền** (ước, kiểm lúc đặt) | 9 × AX42 ≈ **€50–60/máy/tháng** + phí lắp một lần ≈ €40–80/máy · 5 VM ≈ €10/VM · IPv4 ⇒ **~€550–650/tháng + ~€400–700 một lần**. Bằng **một phần ba** con số PLAN-K1 vì cỡ node hạ sau pha 0 |
| **Vị trí** | Hetzner **FSN1** (5 máy) + **HEL1** (4 máy) — hai trung tâm dữ liệu, cùng ASN. Đủ cho thử nghiệm; ≥ 3 ASN là yêu cầu của **mạng mẹ thật** (MASTER dòng B), không của K1 |
| **Không mua** | AX52 (PLAN-108 dựa vào nó — **đã ngừng bán**, dòng AX nay là AX41/AX42/AX102) · máy ARM · máy có sẵn của g1 (OVH, Hetzner đang chạy mạng thật — **không trộn**) |

---

## 1. Định cỡ từ số đo — mỗi con số có nguồn

| Đại lượng | Đo pha 0 | Nguồn | Suy ra cho 15 sổ/node | Cho 8 node/máy |
|---|---|---|---|---|
| RAM plugin có tải 3 tx/s | 59–62 MiB | EVIDENCE 0.1b/0.1d | ~0,9 GB RSS, **~0,6 GB cgroup** | ~5 GB |
| RAM avalanchego | 155–190 MiB | 0.1b | 0,2 GB | 1,6 GB |
| CPU | 20–25 % một nhân cho 30 tx/s | 0.1b/0.1d | ~0,3 nhân ở 45 tx/s | 2,4 nhân |
| Đĩa nền mỗi chain | 288.556 KiB (pebble cấp trước) | đĩa | 4,3 GB | 34 GB |
| Đĩa mỗi tx | ~900 B | đĩa | r = 1: 1,2 GB/ngày · r = 3: 3,5 GB/ngày | 9 / 28 GB/ngày |
| fd | 403 cho 10 sổ | fd | ~600 | ~5.000 — `nofile` 1 M dư |
| Bootstrap sau restart | 11 s cho 10 chain | 0.7 | ~20 s | tuần tự 8 node vẫn dưới 3 phút |
| Băng thông | chưa đo liên máy | — | ước < 5 Mbit/s/node ở r = 1 | Hetzner không giới hạn |

**Đọc bảng:** ở r = 1, một máy 64 GB chạy 8 node dùng ~7 GB RAM, ~2,5 nhân, ~315 GB đĩa sau 30 ngày. Có thể nhồi
**16 node/máy** về RAM/CPU, nhưng đĩa 30 ngày sẽ là 630 GB (vượt 512) và một máy chết kéo 240 sổ — 8 là điểm cân
bằng giữa giá và "một máy rút điện thì 120 sổ ngủ, không hơn".

---

## 2. Bảng vật tư (BOM)

| # | Món | Số | Cấu hình | Vai | Ước €/tháng |
|---|---|---|---|---|---|
| 1 | Dedicated **AX42** | **9** | Ryzen 7 PRO 8700GE 8C/16T · 64 GB DDR5 ECC · **2 × 512 GB NVMe** RAID1 · IPv4 kèm · traffic không giới hạn · Ubuntu 24.04 | m01–m09: 8 node chủ sổ/máy; m01–m03 thêm 3 node mạng mẹ | 9 × 50–60 |
| 2 | Cloud VM cỡ **CPX31/CX32** (4 vCPU · 8 GB) | **3** | cùng vùng FSN | sinh tải: `l1-batch pump` Go — pha 0 một tiến trình nhỏ đẩy 90 tx/s không đáng kể; 3 VM cho 1.000–1.450 tx/s là dư | 3 × ~10 |
| 3 | Cloud VM cỡ **CX32** | **1** | FSN | router RPC `blockchainID → máy:cổng` (Caddy `map` từ `assignment.json`) | ~8 |
| 4 | Cloud VM cỡ **CX32** | **1** | FSN | đo: Prometheus + `measure-node-load.sh --hosts` + lưu `evidence/` | ~8 |
| 5 | IPv4 | 9 + 5 | một IP/máy là đủ (`ipv4port`: mỗi node một cổng) | — | kèm/ít |
| 6 | Phí lắp dedicated | 9 | một lần | — | 9 × 40–80 một lần |
| | **Tổng** | | | | **~€550–650/tháng · ~€400–700 một lần** |

Nếu David chốt **r = 3**: món 1 đổi sang **2 × 1,92 TB** (hoặc 3 × 512 GB không RAID) — cộng ~€20–30/máy/tháng.

**Không cần:** tầng RPC riêng (validator tự phục vụ 14 sổ của mình qua router) · máy chủ sổ (chưa có ở K1) · IPv6 (H-7
chốt IPv4 đa cổng, patch 0024).

---

## 3. Bố cục cụm và mạng

```
m01 FSN  8 host nodes (h01–h08)  + mẹ M1 M2 M3      beacon = M1..M9 (9 node mẹ, 3 máy)
m02 FSN  8 host nodes (h09–h16)  + mẹ M4 M5 M6
m03 HEL  8 host nodes (h17–h24)  + mẹ M7 M8 M9
m04–m06 FSN · m07–m09 HEL    8 host nodes mỗi máy (h25–h72)
5 trong 72 host node (một máy khác nhau, m04–m08) track thêm chain cộng đồng V = 5
```

| Cổng trên mỗi máy | Node | Mở ra Internet? |
|---|---|---|
| 9651–9658 (8 host) · 9661–9663 (3 mẹ, m01–m03) | `--staking-port` riêng từng node (`A1_STAKING_PORT_BASE`) | **Có** — P2P |
| 9650, 9660, … (API) | `--http-port` từng node | **Không** — chỉ từ IP router + IP máy đo + IP máy `l1-batch` (nftables) |
| 22 | SSH | chỉ khoá; đổi cổng không cần |

`ipv4port` (patch 0024): **chỉ beacon** khai `--public-ip`; node cùng máy giữ địa chỉ Docker nội bộ; node máy khác
nối tới beacon qua IP công khai. Docker **không** hairpin: node trên m01 gọi beacon M1 cùng máy phải dùng IP nội bộ —
netgen đã xử lý cho một máy; **đa máy là việc netgen chưa có** (§5).

---

## 4. Việc David làm trên nhà cung cấp — theo thứ tự

1. **Tài khoản Hetzner Robot** (dedicated) và **Cloud Console** (VM) — tách **dự án riêng** "k1-drill", không dùng dự án
   của g1. Nạp SSH public key của máy vận hành (khoá **mới**, không dùng khoá đang vào máy g1).
2. **Đọc giá thật** AX42 và VM trong console; đối chiếu §2. Nếu AX42 hết hàng ở HEL/FSN, thay bằng máy 8C/64 GB/2 × NVMe
   gần nhất (AX41 64 GB DDR4 cũng đủ: RAM/CPU dư 10 lần).
3. **Đặt 9 × AX42**: 5 FSN1 + 4 HEL1, OS **Ubuntu 24.04**, RAID1 (`installimage` mặc định), hostname `k1-m01…m09`.
   Đặt **5 VM** cùng dự án cloud, FSN, Ubuntu 24.04, cùng SSH key.
4. Khi máy lên: gửi cho phiên triển khai **bảng IP** theo `docs/k1-phase0/hosts/inventory.example.json` (chỉ IP + tên,
   không gửi khoá). Từ đó là việc của kit: `cloud-init`/`bootstrap-host.sh` → `accept-host.sh` → netgen đa máy →
   `l1-batch`.
5. **Không** bật gì thêm trong Robot: không backup space, không IP phụ, không vSwitch (một mạng công khai là đủ cho
   thử nghiệm; vSwitch là tối ưu sau khi đo băng thông).
6. Đặt **nhắc huỷ**: dedicated Hetzner tính theo tháng, huỷ trước ngày gia hạn; K1 kế hoạch 1 tháng (23 ngày + dự phòng).

Tôi **không** làm bước 1–3 và 6: đó là tài khoản, tiền và cam kết hợp đồng — việc của David (và luật của phiên này).

---

## 5. Phần mềm còn thiếu TRƯỚC khi máy lên — thứ tự làm trong lúc chờ giao máy

| # | Việc | Từ đâu | Ngày |
|---|---|---|---|
| 1 | **netgen đa máy**: sinh compose cho từng máy, beacon công khai, host node nội bộ, `A1_STAKING_PORT_BASE` theo máy, node mẹ 9 chia 3 máy | `9chain-a1-tools/netgen` (main) — hôm nay một máy | 2 |
| 2 | **`l1-batch` cho 72 node**: `-per-node 14`, 10 ví song song (`-workers`, mỗi ví một UTXO), `render` xuất override **theo máy** | kit pha 0 | 1 |
| 3 | **Router**: Caddy `map` từ `assignment.json` → `http://<máy>:<cổng>` | mới, ~100 dòng | 1 |
| 4 | **`measure-node-load.sh --hosts`** + Prometheus scrape 81 node `/ext/metrics` (`validator_sets_*`, `network_peers`) | `scripts/measure-node-load.sh` (main) | 1 |
| 5 | **Cổng phí sắp cạn** + cổng `too many tracked subnets = 0` liên máy | kit `11-fee-state.sh`, `14-startclose.sh` | 0,5 |
| 6 | `bootstrap-host.sh` + `accept-host.sh` chạy thử trên **một VM** trước khi máy dedicated tới | kit `hosts/` (viết hôm nay) | 0,5 |

Tổng ~6 ngày, khớp cửa sổ giao máy dedicated (thường 1–7 ngày).

---

## 6. Nghiệm thu từng máy — `hosts/accept-host.sh`

Máy chỉ được nhận node khi **tất cả** dòng dưới xanh, và bài này phải **được nhìn thấy đỏ** ít nhất một lần (chạy
trên một VM cố tình thiếu Docker):

| Kiểm | Điều kiện qua |
|---|---|
| CPU · RAM · đĩa | ≥ 8 luồng · ≥ 32 GB · ≥ 400 GB trống trên `/var/lib/docker` |
| Docker | `docker version` ≥ 27, compose v2 ≥ 2.24 (cần `!override`) |
| `ulimit -n` cho dịch vụ docker | ≥ 1.048.576 |
| Đồng hồ | `chronyc tracking` lệch < 100 ms (cổng `check-clock-skew` của mạng thật đòi < 1 s) |
| Cổng P2P | 9651–9663 **mở** từ ngoài (đo từ máy đo bằng `nc`), cổng API **đóng** từ ngoài, mở từ IP router |
| Image | `docker pull`/`load` `9chain-a1/node:g1-81` đúng `sha256` như máy dev |
| Hairpin | từ container tới `IP công khai máy:9651` — **ghi kết quả** (Docker không hairpin: phải là ✗, đúng như patch 0024 đo) |

---

## 7. Quyết định cần David trước khi đặt

1. **r = 1** (2 × 512 GB, ~€550–650) hay **r = 3** (2 × 1,92 TB, +€200–270/tháng)? Đề xuất r = 1.
2. **9 máy × 8 node** (một máy chết = 120 sổ ngủ) hay **18 máy × 4 node** (60 sổ, gấp đôi tiền)? Đề xuất 9.
3. **Hetzner một nhà** hay thêm **một máy OVH** cho 3 node mẹ (thử liên ASN sớm, +~€40)? Đề xuất: Hetzner thôi cho K1.
4. **Thời điểm đặt**: máy dedicated tính tròn tháng — đặt khi §5 xong (≈ 6 ngày) để không trả tiền máy đứng.
5. **Ai cầm tài khoản/khoá SSH vận hành**: David, hay vai vận hành theo MASTER dòng D.

---

## Nguồn

`docs/k1-phase0/EVIDENCE-2026-09-05.md` (0.1b/0.1d, đĩa, fd, 0.7) · `PLAN-K1-1000-LEDGERS-DEPLOY-2026-09-05.md` §1–§3 ·
`PLAN-108-L1-LOAD-TEST.md` §6 (giá tham chiếu AX52 — mẫu đã ngừng) · patch 0024 (`ipv4port`, hairpin) · Hetzner
`dedicated-rootserver/matrix-ax` và `ax42` đọc `05/09` (dòng máy, vị trí HEL1/FSN1, traffic không giới hạn; **giá không
đọc được**) · MASTER dòng B (≥ 3 máy/3 ASN là cho mạng mẹ thật).
