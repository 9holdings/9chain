import type { NextConfig } from 'next';

/**
 * Xuất TĨNH — Caddy phục vụ thẳng thư mục `out/`, không thêm một tiến trình nào
 * trên server. Ba ràng buộc thật của dự án ép lựa chọn này (xem docs/UI-PLAN.md §4):
 *
 *   1. Blockscout đã ngốn ~50% CPU của máy chủ — nhiều hơn cả 5 validator cộng lại.
 *      Thêm một tiến trình Node nữa là đi ngược hướng.
 *   2. Đường deploy hôm nay là `scp` một file, có hiệu lực ngay nhờ bind-mount.
 *      Xuất tĩnh giữ nguyên tính chất đó (chép thư mục `out/`).
 *   3. Mọi trang hiện tại vốn đã render phía client — chúng fetch RPC rồi tự vẽ.
 *      SSR ở đây là chi phí không đổi lấy gì.
 *
 * `trailingSlash`: để `/faucet` → `/faucet/index.html`, khớp cách Caddy phục vụ
 * file tĩnh. Thiếu nó thì mọi URL không có gạch chéo cuối trả 404 trên server dù
 * chạy tốt ở `next dev`.
 */
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  /**
   * Dev và build ghi vào thư mục KHÁC nhau.
   *
   * 9Scan-A1 đã trả giá cho việc dùng chung `.next`: chạy `build` trong lúc dev
   * server đang bật là dev server chết ngay với `Cannot find module './xxx.js'` —
   * dính 4 lần trong một phiên. Tách ra thì hai thứ sống chung thoải mái.
   */
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
};

export default nextConfig;
