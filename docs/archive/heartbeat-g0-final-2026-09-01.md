# Bia mộ — `heartbeat-g0-final-2026-09-01.json`

> ⚫ **BẢN GHI CUỐI CÙNG của bộ bơm nhịp sống trên thế hệ `g0`** (`networkID 999999999`).
> Lưu trữ, **đừng đọc nó như trạng thái hiện tại**: `running: false`, mạng nó đo đã chết
> `2026-09-01 09:26Z` khi `g1` ra đời.

## Vì sao tệp này tồn tại

Nó là bản chép **theo byte** của `~/9chain-a1/src/9chain-a1-config/heartbeat.json.g0-20260901`
trên máy chủ công khai — tệp mà `check-deploy-drift.mjs` chấm là **mồ côi** (có trên server,
không có trong repo), và HANDOFF xếp vào *"hình dạng B-17"*, tức **chờ xoá**.

🔴 **Đo `2026-09-02` trước khi xoá: repo KHÔNG có bản sao nào.** `git ls-files | grep heartbeat`
ra rỗng; tìm theo nội dung đặc trưng (`1910316`, `212340`) cũng ra rỗng. Câu *"đã có bản lưu rồi
nên xoá được"* của B-17 là một **PHÉP ĐO**, và phép đo đó trả lời **KHÔNG**. Xoá trước khi chép
là mất hẳn bản ghi duy nhất của lượt bơm `g0`.

⇒ Chép về trước (`sha256` khớp hai đầu), rồi mới được xoá trên server.

```
sha256  a16a354da2dd450fe2c3fa675f86a42b40a7e5646c0815b2036238ca815c9486
        khớp giữa máy chủ và bản trong repo — đo 2026-09-02
```

## Nó chứng minh điều gì

Đây là **số đo duy nhất còn lại** của tuyên bố "nhịp sống 9 tx/s" trên `g0` — thứ đã được công
bố ra ngoài, nên bản ghi của nó là vật chứng, không phải rác:

| đại lượng | giá trị |
|---|---|
| chạy từ → tới | `2026-08-29 13:01:03Z` → `2026-09-01 00:00:03Z` (`212.340` giây ≈ 59 giờ) |
| lý do dừng | chạm hạn `HEARTBEAT_STOP_AFTER` = `2026-09-01T00:00:00Z` — **tự dừng, không phải sự cố** |
| TPS đích / đo được | `9` / **`9,01`** (cửa sổ 56 giây) |
| giao dịch đã vào khối | **`1.910.316`** · chiều cao khối `107.874` |
| gửi đi / hỏng / đồng bộ lại | `1.910.305` / `688` / `39` |
| tự khai là traffic tổng hợp | `synthetic: true` — 9 địa chỉ gửi đều liệt kê tường minh |

Ba con số đáng giữ vì chúng **tự đối chứng lẫn nhau**: `secondsPerBlock: 2` (block sàn 2 giây,
xem `a1-nhip-song-bom-tai`) × `blocksInWindow: 28` = 56 giây đúng bằng `windowSeconds`, và
`505 / 56 = 9,01`. Tức con số TPS không phải lời khai, nó suy ra được từ ba đại lượng khác trong
cùng tệp.

⚠️ `submitted.txSinceStart` (`1.910.305`) **nhỏ hơn** `measured.committedTxSinceStart`
(`1.910.316`) — lệch `11`. Đó là hai phép đo khác nguồn (bộ bơm tự đếm vs đọc chiều cao khối),
không phải mâu thuẫn: cửa sổ đo chốt sau lượt ghi cuối. Đừng "sửa" cho khớp.

## Sau tệp này

Trên máy chủ, `heartbeat.json` (bản đang sống, `847` byte, `sha256 805ed518…`) là **tệp khác** và
**không** thuộc bản ghi này — đừng chép nhầm. Bộ bơm của `g1` do David chạy; xem
`manifest-deploy.json` mục `knownExtra`.
