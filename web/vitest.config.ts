import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

/**
 * Only PURE LOGIC is tested here (EIP-55, i18n, token drift) — no jsdom is spun up to render
 * components. The a11y suite does NOT run at this layer: it runs in `postbuild`, against the
 * **real exported HTML**, not against a fake render. See `scripts/check-a11y.mjs` — this project
 * has paid several times for accepting what it built instead of what is actually served.
 */
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  test: { include: ['test/**/*.test.ts'], environment: 'node' },
});
