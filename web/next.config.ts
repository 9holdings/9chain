import type { NextConfig } from 'next';

/**
 * STATIC export — Caddy serves the `out/` directory directly, without adding a single process on
 * the server. Three real project constraints force this choice (see docs/UI-PLAN.md §4):
 *
 *   1. Blockscout was already eating ~50% of the server's CPU — more than all 5 validators
 *      combined. Adding another Node process goes the wrong way.
 *   2. Today's deploy path is `scp` one file, effective immediately thanks to a bind-mount.
 *      A static export preserves that property (copy the `out/` directory).
 *   3. Every current page already renders client-side — they fetch RPC and draw themselves.
 *      SSR here is a cost bought with nothing.
 *
 * `trailingSlash`: so `/faucet` → `/faucet/index.html`, matching how Caddy serves static files.
 * Without it, every URL lacking a trailing slash returns 404 on the server even though it works
 * fine under `next dev`.
 */
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  /**
   * Dev and build write into DIFFERENT directories.
   *
   * 9Scan-A1 paid for sharing one `.next`: running `build` while the dev server is up kills the
   * dev server instantly with `Cannot find module './xxx.js'` — hit 4 times in one session.
   * Split apart, the two live together comfortably.
   */
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
};

export default nextConfig;
