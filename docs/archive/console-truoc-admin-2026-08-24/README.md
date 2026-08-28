# Console `truoc-admin` — ảnh chụp `2026-08-24`, lưu trữ `2026-08-28` (B-17 / D-107b)

> 🔴 **ĐÂY LÀ VẬT CHỨNG LỊCH SỬ. KHÔNG BAO GIỜ KHÔI PHỤC HAI TỆP NÀY LÊN SERVER.**

## Vì sao chúng nằm ở đây

Hai tệp này từng sống trên server công khai dưới tên `.bak-truoc-admin` — đặt tên **như một
đường lui**. B-17 mở ra để xoá chúng, vì người xử lý sự cố lúc 2 giờ sáng sẽ `cp` một trong số
đó lại, và bản họ khôi phục **mở toang thứ vừa được đóng có chủ ý**:

| đo được trên chính hai tệp này | hệ quả nếu khôi phục |
|---|---|
| **0** lần `A1_DE_CHAIN_MO` | **mở lại đẻ chain** mà D-087 đã đóng |
| **0** lần `siwe` | **gỡ xác thực ví** (M4.1/D-020) ⇒ `admin` quay lại kiểu **gõ tay**; gõ nhầm một ký tự là **chain vô chủ vĩnh viễn** |

## Vì sao KHÔNG xoá thẳng như lệnh B-17 bản đầu định làm

Đo `28/08` trước khi xoá: hash của cả hai **không trùng bất kỳ phiên bản nào trong git**
(quét toàn bộ `git rev-list --all` trên cả 4 nhánh: `main`, `web-home`, `audit`,
`brand-standardize`). ⇒ **Nội dung duy nhất.** `shred -u` là mất hẳn.

Đây là **lần thứ hai trong cùng một phiên** mà câu *"xoá không mất gì"* sai — lần đầu là sổ
`console-chains.json.bak-1787728833` (D-107). Cùng một luật rút ra:

> **"Đã có bản lưu rồi nên xoá được" là một PHÉP ĐO, không phải một câu trấn an.**
> Trước khi xoá bất cứ thứ gì trên server: đối chiếu `sha256` với bản lưu, **từng tệp một**.

## Giá trị lịch sử của chúng — không chỉ là "mã cũ"

Chúng chứng minh **server từng chạy mã sửa tay chưa bao giờ quay về git**. Đó không phải suy
đoán: cùng lớp với phát hiện B-9 (`console/index.html` trên server lệch **12 byte** so với cả
`main` lẫn `web-home`) và với D-095 (`chainid.mjs` lên server bằng đường **chép tay**). Xoá
chúng đi là xoá bằng chứng của một thói quen vận hành mà repo đang cố chữa.

## Vật chứng

| tệp | sha256 |
|---|---|
| `server.mjs` (14.037 byte, `24/08 15:21`) | `71a72a67608b0d9c5b6e50f9f1488e5882cd2df7410ddc11eb8528395090513c` |
| `index.html` (6.035 byte, `24/08 15:21`) | `5efa6921d40bb39e827858ffe8e10ddf5f2d3d56fc7335a5f827f6d71b16d681` |

Đã đối chiếu **khớp hai đầu** (server ↔ repo) lúc kéo về. Đã quét bí mật: **0** kết quả cho
khoá riêng `0x…64`, `PRIVATE KEY`, `A1_CONSOLE_TOKEN=`, `FAUCET_PK=`, và chuỗi base64 dài.

*(Tệp thứ ba của cùng đợt, `server.mjs.bak-pre-D087-1787862510`, **không** cần lưu ở đây —
nó **trùng từng byte** với git `69c80ce`, đúng commit mà console công khai từng mắc kẹt ở đó
suốt hai ngày, xem D-087/D-095.)*
