# Yêu cầu từ `9Scan-A1` — explorer không phân biệt được "đã thu hồi" với "hết slot track"

**Gửi từ:** repo `C:\PROJECTS\9Scan-A1` (explorer) · **Ngày:** 2026-08-25
**Không phải báo lỗi.** Bên chain đã biết trần 16 và đã quyết hướng đi (H-2, D-009,
D-013). Đây là **một hệ quả của D-013 mà explorer nhìn thấy từ ngoài**, cộng một phát
hiện có thể ảnh hưởng mọi client đọc P-Chain, chứ không riêng explorer.

---

## Số đo (2026-08-25, đọc `/ext/health` của cả 5 node + `platform.getBlockchains`)

| | |
|---|--:|
| chain P-Chain liệt kê | **30** (C + X + **28 L1**) |
| L1 mà ít nhất một node track | **7** |
| L1 **không node nào** track | **21** |
| slot track còn trống | **9** (trần 16, đang dùng 7) |

Cả 5 node track **cùng một bộ**; node đông nhất (node-1) track 7.

## Điều explorer KHÔNG thể tự giải

Với 21 L1 đó, không node nào chạy VM ⇒ không RPC nào trả lời ⇒ explorer không đọc được
gì. Nó hiện verdict **`not served here`** và nói thẳng là không kết luận được — chứ
không dám nói chain sống hay chết.

Nhưng `not served here` đang **gộp hai ca khác hẳn nhau**:

| ca | thực chất | người đọc cần biết |
|---|---|---|
| **đã thu hồi** (D-013) | quyết định có chủ ý, chain sẽ không bao giờ phục vụ lại | "chain này đã ngừng, đừng gửi gì vào" |
| **hết slot track** | chain bình thường, chỉ là 28 L1 > trần 16 | "tạm thời không đọc được từ đây" |

**Xin một trong hai** (explorer đọc được cả hai dạng, không cần API mới):

1. **Đánh dấu trong danh bạ.** `console-chains.json` thêm một trường kiểu
   `"status": "revoked" | "active"`. Explorer đã đọc file này làm nguồn làm giàu
   (`admin`, `createdAt`) nên chỉ cần thêm trường; hụt file thì explorer vẫn chạy.
2. **Hoặc nói rõ là không phân biệt được**, và explorer sẽ giữ nguyên một nhãn chung —
   nhưng khi đó xin xác nhận để explorer viết đúng câu giải thích, thay vì đoán.

⚠️ Nếu 21 L1 kia **đều** đã thu hồi có chủ ý thì mục này thành đơn giản: chỉ cần một
câu xác nhận, explorer sẽ đổi nhãn cho đúng.

## Phát hiện có thể ảnh hưởng mọi client, không riêng explorer

`platform.getCurrentValidators` cho một subnet **đã bỏ track** vẫn trả **đủ 5
validator** — đúng 5 NodeID của mạng. Đo trực tiếp:

```
platform.getCurrentValidators { subnetID: 2fa3TUXymzKRsEBthRGzLknak9WbW43qn648R5HQzcopXhfn8U }
→ 5 validator   (Smoke7XWQ2M — không node nào track)
```

Tức **P-Chain vẫn khai chain đó có đầy đủ validator**, trong khi trên thực tế không
node nào chạy VM của nó.

Điều này đúng với D-013 về mặt cơ chế (bỏ track không xoá được đăng ký trên P-Chain —
"đã đẻ là vĩnh viễn"), nhưng nó tạo ra một cái bẫy cho **bất kỳ ai** đọc P-Chain để
đánh giá sức khoẻ chain: ví, dashboard, console, và explorer đều dễ kết luận "chain này
có 5 validator ⇒ chốt được giao dịch".

Đây chính là lớp lỗi mà D-005 đã đặt luật để chặn — *"verify gate = giao dịch thật,
không phải RPC trả lời"*. Số đo hôm nay cho thấy **tập validator trên P-Chain cũng
không đủ**: phải cộng thêm "có node thực sự track subnet đó".

Bên explorer đã sửa theo: `CLAUDE.md` của 9Scan-A1 nay ghi luật đó là **điều kiện cần,
không đủ**, và thẻ CAN SETTLE đã ngừng đếm chain `untracked` (trước đó nó khẳng định
30/30 chain chốt được giao dịch — một lời nói dối đã lên production).

## Một câu hỏi thực tế: 9 slot còn trống

Đang dùng 7/16. Nếu 9 slot kia không có kế hoạch nào, xin cho biết **có L1 nào đáng
đưa vào không** — đó là lựa chọn sản phẩm, explorer không có căn cứ để quyết. Chain nào
được track là chain đó đọc được đầy đủ trên explorer **và được `9index` index tự động**,
không cần ai làm gì thêm.

⚠️ Dù dùng hết 9 slot thì vẫn còn 12 L1 ngoài tầm — trần 16 là trần thật, và ACP-77
(H-2) vẫn là thứ duy nhất mở được nó. Mục này không đề nghị gì trái với hướng đó.

## Không xin gì khác

| từng định xin | vì sao rút |
|---|---|
| header CORS cho danh bạ L1 | P-Chain là nguồn gốc, đầy đủ hơn, sẵn `ACAO: *` |
| route Caddy cho `/index/` | nginx của explorer tự lo, và cùng origin nên khỏi CORS |
| bật `debug_traceBlockByNumber` | `9index` chỉ cần `eth_getBlockByNumber` |

Yêu cầu còn lại và độc lập: **B-6** — site block của explorer chưa có trong
`local-net/deploy/Caddyfile`.

## Cách tự kiểm (không cần hỏi explorer)

```bash
# Node đang track bao nhiêu L1 — /ext/health liệt kê mọi chain nó chạy.
# ⚠️ Đường này trả HTTP 503 KÈM thân JSON đầy đủ; đừng coi 503 là hỏng.
docker exec 9chain-a1-node-1 curl -s http://127.0.0.1:9650/ext/health \
  | python3 -c "import sys,json;print(len([k for k in json.load(sys.stdin)['checks'] if len(k)>30]),'L1')"
```

Explorer **không cần bên chain làm gì thêm** để hiển thị chain mới: `/chains/` đọc
`platform.getBlockchains` nên chain mới hiện ra tự động, và `9index` tự khám phá rồi
index ngay khi RPC trả lời.
