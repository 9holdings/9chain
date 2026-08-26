# 9Chain-A1 — Phân bổ genesis (networkID 9001, 5 node)

Tổng phát hành genesis: **400,000,000 LOVE9** · Trần cung: **720,000,000 LOVE9**

File này CÔNG KHAI được — chỉ chứa địa chỉ, không chứa khoá bí mật.

| Quỹ | % | Tổng (LOVE9) | X/P thanh khoản | X/P khoá | Mở khoá | C-Chain | Địa chỉ X | Địa chỉ EVM |
|---|--:|--:|--:|--:|---|--:|---|---|
| Validators / Staking | 40% | 160,000,000 | 0 | 160,000,000 | 1 nam | 0 | `X-love91enm2cfv854dkgs4jrerz4me2tumkepz88xcv0e` | `0x4a4e3C3cE6447443A691273a4b39D3e294cc3d91` |
| Foundation / Treasury | 20% | 80,000,000 | 0 | 60,000,000 | 2 nam | 20,000,000 | `X-love91acl7fg0qlqjnptxtdd7dyzazhpmz3tdkcz3h5u` | `0xd12B9844CBad2273696bD54e598f52dddb05eF61` |
| Ecosystem / Community | 20% | 80,000,000 | 10,000,000 | 0 | — | 70,000,000 | `X-love91002nxs7vsjee2st5pa9hgel954xul2znznwsxa` | `0x867dB88d183110cF65a571823eE3031f2EA2e3B8` |
| Faucet (testnet) | 5% | 20,000,000 | 2,000,000 | 0 | — | 18,000,000 | `X-love91du9yjmn3z3rnvhytacasssqcj7lv2p8jjekl94` | `0x574849d4B4a34B57Ce509065fFBa0E3B9bD9660B` |
| Team | 15% | 60,000,000 | 0 | 60,000,000 | 4 nam | 0 | `X-love91nvhsqa3y76mpg90ducyrlpzxen92p7amvhhm4t` | `0x20A5A09b430B34f903Ed28d304c9d7ac22dB6006` |

## Ghi chú
- Quỹ **Staking** không có địa chỉ chi tiêu thường: toàn bộ 160,000,000 LOVE9 được avalanchego chia đều thành stake của 5 validator genesis (32,000,000 LOVE9/node).
- Thưởng staking của các node genesis chảy về quỹ **Foundation**.
- Quỹ **Faucet** là ví nóng, cố tình tách riêng — lộ khoá chỉ mất phần faucet, không ảnh hưởng các quỹ khác.
- C-Chain không có cơ chế khoá native: phần C-Chain của mọi quỹ đều thanh khoản ngay.
- Khoá bí mật nằm trong `keys.txt` (chmod 600, KHÔNG commit, KHÔNG đưa lên server).

## Ví vận hành (không thuộc genesis — nạp từ quỹ sau khi mạng chạy)

| Ví | Mục đích | Nạp | Địa chỉ X/P | Địa chỉ EVM |
|---|---|--:|---|---|
| chain-factory | Trả phí đẻ L1 + đăng ký subnet validator; khoá nằm TRÊN SERVER (`console.env`) | 9 LOVE9 (P-Chain) | `X-love91vgh2whn746dzzvg0dj4w9rsqvlalcldvpueuvj` | `0x1e5134A67cB80d96B38Fb406365561ec97C5816a` |

- Nguồn nạp: quỹ **Ecosystem**, tx X-Chain `55yPUUAENFDGZ9NUH7YHdTb7a4x6K1VGtBy2EvEH3MxbtQW8t` (9.01 LOVE9), rồi X→P 9 LOVE9.
- Cố tình tách ví riêng như faucet: lộ khoá trên server chỉ mất 9 LOVE9, không đụng quỹ gốc.
- Chi phí đo thật **0.000141468 LOVE9/lượt đẻ chain** → 9 LOVE9 ≈ **63,600 lượt**.
- Khoá bí mật ở `local-net/net-public/chain-factory-key.txt` (gitignored, chỉ trên máy dev).
- `A1_L1_ADMIN` = địa chỉ EVM quỹ **Foundation** (`0xd12B9844CBad2273696bD54e598f52dddb05eF61`) — cố ý KHÔNG dùng địa chỉ của ví chain-factory, để khoá điều khiển các L1 đẻ ra vẫn nằm offline.
