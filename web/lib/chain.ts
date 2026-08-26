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
const HOST_MAC_DINH = 'a1.9chain.org';

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

/**
 * Biểu tượng LOVE9 — URL TUYỆT ĐỐI, và bắt buộc phải tuyệt đối.
 *
 * Ví đọc URL này ở tiến trình của NÓ, không ở ngữ cảnh trang, nên đường dẫn tương
 * đối (`/brand/…`) là vô nghĩa với ví — nó không có gốc nào để giải ra.
 *
 * 🔴 Đường `/brand/*` phải có route riêng trong Caddy. Gốc `/` là Blockscout,
 * mà Blockscout là SPA trả **HTTP 200 kèm khung rỗng** cho mọi đường lạ — nên quên
 * route thì ảnh "tải được" 200, ví chỉ hiện ô trống, và mọi phép kiểm bằng mã
 * trạng thái vẫn xanh. Đo bằng `content-type` chứ đừng đo bằng mã HTTP.
 */
export function bieuTuongGoc(): string {
  if (typeof window === 'undefined') return `https://${HOST_MAC_DINH}/brand`;
  const h = host();
  if (h === 'localhost' || h === '127.0.0.1') return `https://${HOST_MAC_DINH}/brand`;
  return `${window.location.protocol}//${h}/brand`;
}

/** PNG 256px của LOVE9 — cỡ ví hay dùng nhất, và có nền nên không lẫn vào theme tối. */
export function bieuTuongLove9(): string {
  return `${bieuTuongGoc()}/love9-navy-inverse-256px.png`;
}

/**
 * Tham số để thêm mạng vào ví — đúng khuôn EIP-3085.
 *
 * ⚠️ `iconUrls` là tham số CÓ TRONG chuẩn và có trong tài liệu MetaMask, nhưng
 * **chưa đo được là MetaMask có thật sự vẽ nó cho token GỐC hay không** — icon của
 * token gốc trên mạng tuỳ chỉnh xưa nay lấy từ registry mạng của chính MetaMask
 * (chainid.network), không lấy từ site. Gửi lên thì không mất gì; nếu ví bỏ qua,
 * đường còn lại là đưa chain vào `ethereum-lists/chains` — nhưng đó là PR công
 * khai và **công bố vĩnh viễn chainId 9000000009**, nên phải David quyết.
 * Đừng ghi vào tài liệu là "đã có icon" cho tới khi nhìn thấy nó trong ví thật.
 */
export function thamSoThemMang() {
  return {
    chainId: CHAIN.chainIdHex,
    chainName: CHAIN.ten,
    nativeCurrency: { name: CHAIN.tenDayDu, symbol: CHAIN.kyHieu, decimals: CHAIN.thapPhan },
    rpcUrls: [rpcCChain()],
    blockExplorerUrls: [explorerGoc()],
    iconUrls: [bieuTuongLove9()],
  };
}
