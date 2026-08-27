# Đường cơ sở trước ngày G — chụp 2026-08-27

Mục **Đ1-10 mục 4** của `docs/WEB-UPGRADE-2026-08-27.md`. Lý do tồn tại: sau `01/09`
mạng sinh lại, giao dịch on-chain reset và danh bạ chain có thể đổi ⇒ **không còn cách
nào biết trước ngày G đã có ai dùng thật chưa**. Bật đo ngày 02/09 là mãi mãi mất đường
cơ sở.

## Tệp

| | |
|---|---|
| `baseline-2026-08-27-console-chains.json` | danh bạ chain công khai, tải từ `https://a1.9chain.org/chains/data/console-chains.json` |
| sha256 | `bfde395d1efda357a579eb6f1a4aa11d2510f1208df1a83fea7a54b522ce907b` |

## Đọc được gì

**0 chain sống · 6 đã thu hồi.** Cả 6 mang tên **máy tự sinh** và thuộc đúng ba bộ bài
kiểm tự động:

```
SmokeA8ER40 · SmokeA906G2      ← smoke-l1.mjs
WarpNguonD46U · WarpDichD46U   ← warp-test.mjs
CauNguon3SP4 · CauDich3SP4     ← bridge-test.mjs
```

`createdAt` trải từ `1787757388974` tới `1787760550970` — **52,7 phút**, gọn trong một
phiên. Không một tên do người đặt, không một địa chỉ admin lạ.

⇒ Câu *"tới 27/08 chỉ David tự test, chưa có người thật"* trong trí nhớ dự án **nay có
bằng chứng**, không còn là phỏng đoán — nhưng chỉ cho **kênh đẻ chain**. Nó KHÔNG nói gì
về lượt xem trang hay lượt xin faucet; hai kênh đó vẫn chưa có dấu vết nào (xem Đ1-10
mục 1–3).

## 🔴 Đã đóng một câu hỏi mà đợt soát để ngỏ

Đợt soát nêu: *`PLAN-REGENESIS:307` chép "3 L1 SỐNG · 43 ĐÃ THU HỒI" ngày 26/08, hôm nay
đo ra 0/6 — hai con số mâu thuẫn, và 43 bản ghi `retired` chính là **sổ chống phát lại**
mà O3b dựa vào. O3b lo mất sổ SAU ngày G; phép đo này nói sổ có thể đã mất TRƯỚC ngày G
rồi.* Mức tin cậy khi đó: **gia dinh về nguyên nhân**.

**Đo xong, không mất gì cả:**

```
docs/archive/console-chains-pre-regenesis-2026-08-26.json  →  3 sống · 43 thu hồi
```

Khớp **tuyệt đối** con số của PLAN. Giải thích: re-genesis `26/08` reset danh bạ về
`{"chains":[],"retired":[]}` — **có chủ ý, D-037** — và bản cũ được cất lại ở hai nơi
(`console-chains.json.bak-pre-regenesis` trên máy chủ, và tệp trên trong repo).
`HANDOFF.md:160-161` đã ghi việc này từ trước.

⇒ Hai con số **không mâu thuẫn**: một là bản chụp TRƯỚC re-genesis, một là SAU. Sổ chống
phát lại còn nguyên. **Mục này không cần David quyết gì thêm** — chỉ cần O3b nói rõ nó
đang bàn về danh bạ SAU re-genesis (6 bản ghi máy sinh), không phải 43 bản ghi lịch sử.

## Cách dùng lại sau ngày G

```bash
curl -s https://a1.9chain.org/chains/data/console-chains.json | \
  node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);
  console.log('song',(j.chains||[]).length,'retired',(j.retired||[]).length)})"
```
So với 0/6 ở trên. Bản ghi nào mang **tên do người đặt** (không khớp `^(Smoke|Warp|Cau)`)
là dấu hiệu người thật đầu tiên.
