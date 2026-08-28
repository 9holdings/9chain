<!-- BẢN CHÉP của local-net/net-public/allocation.md (netgen sinh, thư mục đó gitignore).
     Chỉ chứa ĐỊA CHỈ — công khai được. Sinh lại thì chép lại. -->

# 9Chain-A1 — Phân bổ genesis (networkID 9001, 9 node)

> ✅ **ĐÂY LÀ BẢNG CỦA MẠNG CÔNG KHAI** (`local-net/net-public/`), tính tới re-genesis
> 2026-08-26. Nếu đang đi tìm "bảng phân bổ của 9Chain-A1" thì **dừng ở đây** — đừng đọc
> `local-net/net/allocation.md`, đó là bộ **dev local**, một mạng khác, khoá khác, số khác.
> Nhầm hai bộ **không gây lỗi và không có dấu hiệu nào**; 9Scan-A1 đã dính đúng thế
> 2026-08-26 (họ tìm thấy 18.000.000 ở `0x574849d4…` và kết luận "không phải địa chỉ
> faucet" — đó chính là ví faucet của **mạng công khai cũ**, xem
> `docs/archive/allocation-pre-regenesis-2026-08-26.md`).
>
> Mạng **trước** re-genesis: `docs/archive/allocation-pre-regenesis-2026-08-26.md`.
> Ví vận hành (không thuộc genesis): `docs/WALLET-OPERATIONS.md`.

Tổng phát hành genesis: **5,400,000,000 LOVE9** · Trần cung: **9,000,000,000 LOVE9**

File này CÔNG KHAI được — chỉ chứa địa chỉ, không chứa khoá bí mật.

| Hạng mục | Quỹ | % | Tổng (LOVE9) | X/P thanh khoản | X/P khoá | Mở khoá | C-Chain | Địa chỉ X | Địa chỉ EVM |
|---|---|--:|--:|--:|--:|---|--:|---|---|
| Foundation | Self-bond validator genesis | 12% | 8,999,991 | 0 | 8,999,991 | 1 nam | 0 | `X-love91a4ws9g8n5vx6z9x06psxyurtgvfkj462efpha4` | `0x4392eFAC3D261148faB6A2387ED56EeF513d9cbc` |
| Foundation | Foundation | 12% | 1,071,000,009 | 71,000,009 | 0 | — | 1,000,000,000 | `X-love91agflqw3vh3mmhw9hd8sjhgfj4eqq7gld6lgxlu` | `0xcD0D354A1DD2C105c85B45Dd2D7F38f1465Bd84C` |
| Community | Community (khoá) | 30% | 2,600,000,001 | 0 | 2,600,000,001 | 2 nam | 0 | `X-love91e5te7g6n8wh7ayfkwqt0y9c76tkfv4wxhltuwd` | `0xb210EAa0740f10B503BA0C583FD32d2e3Eb69F46` |
| Community | Faucet (ví NÓNG) | 30% | 99,999,999 | 0 | 0 | — | 99,999,999 | `X-love91cxn5md87ymguzqv73erkn3jtav7a89w9zdyk8u` | `0xC15822D478E44ff6B87e2bB1E213e1FA7ec56A03` |
| Private Sale | Private Sale | 9% | 810,000,000 | 0 | 810,000,000 | 2 nam | 0 | `X-love91ekw8p70duq7fun4qe8w0z2v89sav408dwm2283` | `0xe70D94FC92e5933dE6abBcECe0D43e1FC2F5DDBa` |
| Team | Team | 9% | 810,000,000 | 0 | 810,000,000 | 4 nam | 0 | `X-love914vdxn6fxr2wkzpvsf8uw4j92hs33rn00524xnl` | `0xBe07BCed488Fa4d7aFBf65b0089E9f8752C1a2e4` |

## Ghi chú
- Quỹ **Staking** không có địa chỉ chi tiêu thường: toàn bộ 8,999,991 LOVE9 được avalanchego chia đều thành stake của 9 validator genesis (999,999 LOVE9/node).
- Thưởng staking của các node genesis chảy về quỹ **Foundation**.
- Quỹ **Faucet** là ví nóng, cố tình tách riêng — lộ khoá chỉ mất phần faucet, không ảnh hưởng các quỹ khác.
- C-Chain không có cơ chế khoá native: phần C-Chain của mọi quỹ đều thanh khoản ngay.
- Khoá bí mật nằm trong `keys.txt` (chmod 600, KHÔNG commit, KHÔNG đưa lên server).

## Ví vận hành

| Ví | Mục đích | Số dư | Địa chỉ X/P |
|---|---|--:|---|
| chain-factory | phí đẻ L1 (khoá TRÊN SERVER, `console.env`) | ~9 LOVE9 P-Chain | `X-love91vgh2whn746dzzvg0dj4w9rsqvlalcldvpueuvj` |

Chi tiết + quy trình nạp lại: [WALLET-OPERATIONS.md](../WALLET-OPERATIONS.md).
