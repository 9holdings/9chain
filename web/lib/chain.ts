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
  currencyName: 'LOVE9',
  decimals: 18,
  /**
   * networkID của avalanchego là uint32 — KHÔNG phải số 9 tỷ ở trên.
   *
   * 🔴 ĐỔI 2026-08-27: `9001` → `999999999` (D-081, thế hệ **g0**).
   * 🔴 ĐỔI 2026-09-03: `999999999` → `999999998` — **ngày G đã chạy 01/09**, mạng
   *   công khai nay là thế hệ **g1**. Đo thẳng trên mạng đang chạy trước khi sửa:
   *   `info.getNetworkID` → 999999998 · `info.getNetworkName` → `9chain-a1-g1` ·
   *   `eth_chainId` → 0x218711a09 (không đổi, đúng D-047).
   *
   * Số này KHÔNG tuỳ tiện: `network_ids.go` suy cả hai trục danh tính từ một biến
   * `A1Gen` duy nhất — `A1ID = 999999999 − A1Gen` và `A1Name = "9chain-a1-g<A1Gen>"`.
   * Thế hệ đếm XUỐNG từ đỉnh băng, nên mỗi lượt sinh lại số này GIẢM một.
   *
   * ⚠️ HẰNG SỐ NÀY ĐÃ SAI HAI LẦN, VÀ CẢ HAI LẦN ĐỀU CÙNG MỘT KIỂU: chân trang in
   * "networkID 9001" khi mạng đã là 999999999 (27/08), rồi in "999999999" khi mạng
   * đã là 999999998 (01/09 → 03/09, hai ngày trên mạng công khai). Nó là một HẰNG SỐ
   * CHÉP TAY — không sai cú pháp, không sai kiểu, chỉ sai sự thật, nên `tsc`, test và
   * axe đều xanh trong lúc trang nói dối.
   * ⇒ Thứ DUY NHẤT bắt được là `local-net/deploy/check-chain-id.mjs`: nó hỏi mạng
   *   ĐANG CHẠY trước mỗi lượt deploy. Lần này chính nó chặn đúng lượt deploy đang
   *   diễn ra. Đừng gỡ nó khi dọn dẹp, và đừng "sửa" nó thành đo hằng số trong repo.
   *
   * `eth_chainId` thì KHÔNG đổi (D-047 giữ 9000000009) — hai số này độc lập nhau,
   * và đó chính là chỗ dễ nhầm: mạng đổi danh tính mà ví không thấy gì khác.
   */
  networkId: 999999998,
} as const;

/** Tên miền mặc định khi không đọc được `location` (lúc build tĩnh). */
const DEFAULT_HOST = 'a1.9chain.org';

/**
 * RPC origin baked into the prerendered HTML, for `<link rel="preconnect">` only.
 *
 * 🔴 This is NOT a second source of truth for where the site talks to the network —
 * `rpcOrigin()` below still derives that from the page's own hostname at runtime, and it
 * stays the only thing any request goes through. A preconnect is a *hint*: pointing it
 * at the wrong host costs one idle socket and nothing else, while `rpcOrigin()` pointing
 * at the wrong host breaks the page. Keeping the hint constant is what lets it sit in
 * static HTML at all, since the head is written at build time when there is no
 * `location` to read.
 *
 * The two agree everywhere it matters: `rpcOrigin()` returns this exact value on
 * localhost, and on the public site the hostname IS `a1.9chain.org`.
 */
export const RPC_ORIGIN_HINT = `https://rpc-${DEFAULT_HOST}`;

function host(): string {
  if (typeof window === 'undefined') return DEFAULT_HOST;
  return window.location.hostname || DEFAULT_HOST;
}

/** Gốc RPC công khai, suy từ chính tên miền đang mở. */
export function rpcOrigin(): string {
  const h = host();
  // Dev trên máy: không có `rpc-localhost`, đi thẳng ra mạng công khai.
  if (h === 'localhost' || h === '127.0.0.1' || h.endsWith('.local')) {
    return `https://rpc-${DEFAULT_HOST}`;
  }
  return `${window.location.protocol}//rpc-${h}`;
}

/** RPC của C-Chain — mạng chính, thứ ví người dùng kết nối vào. */
export function rpcCChain(): string {
  return `${rpcOrigin()}/ext/bc/C/rpc`;
}

/** Gốc của faucet API. Cùng tên miền với trang, nên đường tương đối là đủ. */
export function faucetOrigin(): string {
  if (typeof window === 'undefined') return `https://${DEFAULT_HOST}/faucet`;
  const h = host();
  if (h === 'localhost' || h === '127.0.0.1') return `https://${DEFAULT_HOST}/faucet`;
  return `${window.location.protocol}//${h}/faucet`;
}

/** Explorer (9Scan-A1) — dự án khác, chỉ liên kết sang. */
export function explorerOrigin(): string {
  return 'https://a1.9scan.org';
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
export function brandOrigin(): string {
  if (typeof window === 'undefined') return `https://${DEFAULT_HOST}/brand`;
  const h = host();
  if (h === 'localhost' || h === '127.0.0.1') return `https://${DEFAULT_HOST}/brand`;
  return `${window.location.protocol}//${h}/brand`;
}

/** PNG 256px của LOVE9 — cỡ ví hay dùng nhất, và có nền nên không lẫn vào theme tối. */
export function love9IconUrl(): string {
  return `${brandOrigin()}/love9-navy-inverse-256px.png`;
}

/**
 * Tham số để thêm mạng vào ví — đúng khuôn EIP-3085.
 *
 * 🔴 `iconUrls` — ĐÃ ĐO 2026-08-26, VÀ NÓ KHÔNG ĂN. ĐỪNG THỬ LẠI.
 *
 * Tham số này CÓ trong chuẩn EIP-3085 và CÓ trong ví dụ của chính tài liệu
 * MetaMask, nên nhìn vào tài liệu thì tưởng là làm được. Đo thật: thêm mạng thành
 * công qua MetaMask (màn xác nhận "Update 9Chain Testnet A1" hiện đúng Network +
 * RPC, **không hiện icon nào**), rồi mở tab Tokens — LOVE9 vẫn là **vòng tròn xám
 * chữ "L9"**. MetaMask không cho đặt icon cho **token GỐC**, dù chuẩn khai có.
 *
 * GIỮ LẠI dòng này chứ không xoá: nó đúng chuẩn, không tốn gì, và ăn ngay nếu ví
 * nào đó (hoặc MetaMask bản sau) chịu vẽ. Cái đắt là **phép đo**, nên ghi ở đây để
 * không ai điều tra lại từ đầu.
 *
 * Đường CÒN LẠI nếu một ngày thật sự cần icon trong ví:
 *   • Token ERC-20 thì `wallet_watchAsset` (EIP-747) nhận thẳng `image` — chạy được.
 *     Nhưng LOVE9 là coin GỐC, nên muốn vậy phải đẻ một bản wrap (WLOVE9); đổi
 *     kiến trúc token chỉ để lấy một cái icon là món hời tồi.
 *   • Vào registry của chính MetaMask: thực tế chỉ dành cho mainnet, và với một
 *     testnet mang chainId tự chọn thì gần như chắc chắn không được nhận.
 * ⇒ Chỗ ta THẬT SỰ kiểm soát nhận diện là trang của mình và explorer 9Scan-A1 —
 *   cả hai đã dùng dấu LOVE9 (favicon + `/brand/`).
 */
export function addNetworkParams() {
  return {
    chainId: CHAIN.chainIdHex,
    chainName: CHAIN.ten,
    nativeCurrency: { name: CHAIN.currencyName, symbol: CHAIN.kyHieu, decimals: CHAIN.decimals },
    rpcUrls: [rpcCChain()],
    blockExplorerUrls: [explorerOrigin()],
    iconUrls: [love9IconUrl()],
  };
}
