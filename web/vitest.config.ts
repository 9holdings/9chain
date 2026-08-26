import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

/**
 * Chỉ test LOGIC THUẦN ở đây (EIP-55, i18n, trôi lệch token) — không dựng jsdom để
 * render component. Bài a11y KHÔNG chạy ở tầng này: nó chạy ở `postbuild`, trên
 * **HTML thật đã xuất ra**, chứ không trên một bản render giả. Xem
 * `scripts/check-a11y.mjs` — dự án này đã trả giá nhiều lần cho việc nghiệm thu thứ
 * mình dựng thay vì thứ thật sự được phục vụ.
 */
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  test: { include: ['test/**/*.test.ts'], environment: 'node' },
});
