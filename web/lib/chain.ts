/**
 * Hằng số nhận dạng mạng 9Chain-A1 + cách suy ra endpoint.
 *
 * 🔴 KHÔNG BAO GIỜ CẮM CỨNG `localhost` VÀO TRANG CÔNG KHAI. Trình duyệt của người
 * xem phân giải `localhost` thành MÁY HỌ — trang tải từ server mà số liệu lấy từ
 * máy khách, và nó hỏng câm: ai mở trang cũng thấy "mạng chết". Explorer và
 * dashboard của dự án này đều đã dính đúng lỗi đó một lần.
 *
 * Quy ước đã dùng thật: trang ở `<host>`, RPC ở `rpc-<host>`. Suy từ
 * `location.hostname` lúc chạy nên một bản build phục vụ được cả tên miền công
 * khai lẫn `localhost` khi dev.
 */
export const CHAIN = {
  ten: '9Chain Testnet A1',
  /** EVM chainId — số thập phân, dùng để hiển thị. */
  chainId: 9000000009,
  /** 🔴 MetaMask CHỈ nhận chainId dạng hex. Truyền số thập phân là lỗi ngay. */
  chainIdHex: '0x218711a09',
  kyHieu: 'LOVE9',
  tenDayDu: 'LOVE9',
  thapPhan: 18,
  /** networkID của avalanchego là uint32 — KHÔNG phải số 9 tỷ ở trên. */
  networkId: 9001,
} as const;

/** Tên miền mặc định khi không đọc được `location` (lúc build tĩnh). */
const HOST_MAC_DINH = 'testnet-a1.9chain.org';

function host(): string {
  if (typeof window === 'undefined') return HOST_MAC_DINH;
  return window.location.hostname || HOST_MAC_DINH;
}

/** Gốc RPC công khai, suy từ chính tên miền đang mở. */
export function rpcGoc(): string {
  const h = host();
  // Dev trên máy: không có `rpc-localhost`, đi thẳng ra mạng công khai.
  if (h === 'localhost' || h === '127.0.0.1' || h.endsWith('.local')) {
    return `https://rpc-${HOST_MAC_DINH}`;
  }
  return `${window.location.protocol}//rpc-${h}`;
}

/** RPC của C-Chain — mạng chính, thứ ví người dùng kết nối vào. */
export function rpcCChain(): string {
  return `${rpcGoc()}/ext/bc/C/rpc`;
}

/** Gốc của faucet API. Cùng tên miền với trang, nên đường tương đối là đủ. */
export function faucetGoc(): string {
  if (typeof window === 'undefined') return `https://${HOST_MAC_DINH}/faucet`;
  const h = host();
  if (h === 'localhost' || h === '127.0.0.1') return `https://${HOST_MAC_DINH}/faucet`;
  return `${window.location.protocol}//${h}/faucet`;
}

/** Explorer (9Scan-A1) — dự án khác, chỉ liên kết sang. */
export function explorerGoc(): string {
  return 'https://testnet-a1.9scan.org';
}

/** Tham số để thêm mạng vào ví — đúng khuôn EIP-3085. */
export function thamSoThemMang() {
  return {
    chainId: CHAIN.chainIdHex,
    chainName: CHAIN.ten,
    nativeCurrency: { name: CHAIN.tenDayDu, symbol: CHAIN.kyHieu, decimals: CHAIN.thapPhan },
    rpcUrls: [rpcCChain()],
    blockExplorerUrls: [explorerGoc()],
  };
}
