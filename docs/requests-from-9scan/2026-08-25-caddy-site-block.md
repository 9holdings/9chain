# Yêu cầu từ `9Scan-A1` — site block của explorer phải nằm trong `local-net/deploy/Caddyfile`

**Gửi từ:** repo `C:\PROJECTS\9Scan-A1` (explorer) · **Ngày:** 2026-08-25
**Mức:** đã gây sự cố production một lần, và **sẽ lặp lại** cho tới khi sửa ở nguồn

---

## Tóm tắt

`local-net/deploy/Caddyfile` **không có site block cho `testnet-a1.9scan.org`**
(`grep -c 9scan` → **0**). Site block đó được áp thẳng lên server hồi tháng trước và
chưa bao giờ vào nguồn — nên **mỗi lần `caddy-deploy.sh` chạy là một lần nó bị xoá.**

Hôm nay là lần đầu bị bắt: explorer chết **31 phút** không ai biết.

## Chuyện đã xảy ra hôm nay

| giờ (UTC) | |
|---|---|
| 12:47 | `caddy-deploy.sh` áp Caddyfile mới, tạo `Caddyfile.bak-1787662033` |
| 12:47 → 13:18 | `https://testnet-a1.9scan.org` trả **525** cho mọi người dùng |
| 13:18 | explorer khôi phục tay: nối lại site block, `caddy validate`, `caddy reload` |

Khớp với commit `cd34d43` *"M7.2: siết 443 về dải Cloudflare (Caddy remote_ip)"*
(16:49 +0400 = 12:49 UTC). **Bản thân thay đổi M7.2 không sai** — vấn đề chỉ là bản
Caddyfile được áp không mang theo site block của explorer, vì nguồn chưa từng có nó.

**Chuỗi nhân quả:** Caddyfile mới chỉ khai hai domain zone `9chain.org` → Caddy ngừng
quản `testnet-a1.9scan.org` → không còn cert cho zone `9scan.org` → Cloudflare bắt tay
TLS với origin thất bại → **525**.

🔴 **Vì sao khó thấy từ phía chain:** RPC và `testnet-a1.9chain.org` **không hề hấn gì**
— chúng nằm trong cùng Caddyfile và vẫn được sinh ra bình thường. Nhìn từ bên chain,
mọi thứ vẫn xanh.

## Xin làm — thêm khối này vào `local-net/deploy/Caddyfile`

Dùng đúng hai snippet đã có sẵn trong file (`(origintls)` dòng 53, `(secheaders)`
dòng 57), nên nó nhất quán với hai site block kia:

```caddyfile
# ─────────────────────────────────────────────────────────────────────────────
# 9Scan-A1 — explorer (zone 9scan.org, KHÁC zone với chain)
#
# 🔴 KHỐI NÀY TỪNG BỊ XOÁ MỘT LẦN và làm explorer chết 31 phút (2026-08-25):
# nó được áp thẳng lên server chứ chưa vào nguồn, nên lần deploy Caddy kế tiếp
# ghi đè mất. Giữ nó Ở ĐÂY để chuyện đó không lặp lại.
#
# `reverse_proxy` trỏ container `9scan-a1-web` (nginx tĩnh của explorer). Đường
# `/index/` do CHÍNH nginx đó định tuyến sang `9scan-a1-index`, nên Caddy không
# cần biết gì thêm.
# ─────────────────────────────────────────────────────────────────────────────
testnet-a1.9scan.org {
	import origintls
	import secheaders
	encode zstd gzip

	# Deep-link kieu Blockscout. Explorer la static export nen khong co file tuong
	# ung cho nhung duong nay — chuyen ve trang chi tiet kem query.
	@block path_regexp blk ^/block/([0-9]+)/?$
	redir @block /detail/?block={re.blk.1} 301
	@tx path_regexp txh ^/tx/(0x[0-9a-fA-F]{64})/?$
	redir @tx /detail/?tx={re.txh.1} 301
	@addr path_regexp adr ^/address/(0x[0-9a-fA-F]{40})/?$
	redir @addr /detail/?address={re.adr.1} 301

	reverse_proxy 127.0.0.1:8094
}
```

⚠️ Nếu M7.2 siết `remote_ip` về dải Cloudflare cho **mọi** site block, hãy kiểm khối
này cũng được siết theo — explorer cũng đi qua Cloudflare (Proxied, SSL mode **Full**).

## Hai việc nhỏ đi kèm

**1. Một dòng tự kiểm ở cuối `caddy-deploy.sh`.** Script đã kiểm rất kỹ phần của
chain; thêm một phép đo cho zone explorer thì lần sau nó tự bắt thay vì để 31 phút
trôi qua:

```bash
code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 https://testnet-a1.9scan.org/)
[ "$code" = 200 ] || echo "⚠ explorer trả $code — site block testnet-a1.9scan.org còn trong Caddyfile không?"
```

**2. Redirect deep-link thứ TƯ** cho `/validator/*` — chờ từ mốc M9, không chặn gì
(bảng đang link bằng `/detail/?validator=…` và chạy đúng):

```caddyfile
redir /validator/* /detail/?validator={http.request.orig_uri.path.1} 301
```

🔴 **NodeID là base58, PHÂN BIỆT HOA THƯỜNG.** Redirect tuyệt đối không được hạ chữ
thường như đường `/address/*` đang làm với hex — làm thế là biến mọi NodeID thành một
chuỗi không tồn tại.

## Phía explorer đã làm gì để không im lặng lần nữa

`scripts/a1-watch.sh` + `.github/workflows/watch.yml` (repo 9Scan-A1) chạy **mỗi giờ**,
chỉ đọc, không ssh, không cần khoá. Nó đo **cả chứng chỉ** chứ không chỉ mã HTTP — vì
đây đúng là loại sự cố mà `curl -k` sẽ bỏ qua hoàn toàn. Chính nó bắt được ca hôm nay.

## Không xin gì khác

Ba thứ từng định xin đều đã **rút**: header CORS cho danh bạ L1 (P-Chain là nguồn tốt
hơn, sẵn `ACAO: *`), route Caddy cho `/index/` (nginx của explorer tự lo, và cùng
origin nên khỏi CORS), bật `debug_traceBlockByNumber` (indexer chỉ cần
`eth_getBlockByNumber`).

Còn một yêu cầu riêng, độc lập với file này: **21/28 L1 không node nào track** —
`docs/requests-from-9scan/` sẽ nhận bản đó nếu cần, hiện đang ở
`C:\PROJECTS\9Scan-A1\docs\requests\2026-08-25-node-tracking.md`.
