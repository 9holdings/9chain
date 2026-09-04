import type { NextConfig } from 'next';
import { execFileSync } from 'node:child_process';

/**
 * `deploymentId` — every asset URL carries `?dpl=<this>` so each deploy gets FRESH cache keys.
 *
 * ═══ THE REAL INCIDENT THIS CLOSES (2026-09-04) ═══
 * Guests could not click "Add network to wallet" or switch language; David's machine worked.
 * Measured from outside: `/_next/static/chunks/main-app-<hash>.js` came back **404 text/html**
 * with `cf-cache-status: HIT` and `Age: 102440` — Cloudflare had been serving a cached nginx
 * 404 for the React entrypoint for 28 hours. The origin had the file (200 when the cache was
 * bypassed). The 404 was born in a deploy window (`web-deploy.sh` wiped `out/` then copied,
 * HTML landed before the chunk), and the Caddy `immutable` header — applied to EVERY status —
 * told Cloudflare and browsers to keep that 404 for a year. David's browser still held a good
 * copy from an earlier load; guests hit the poisoned edge. Purging alone would not have helped
 * guests whose browsers had also cached the 404 for a year.
 *
 * A per-deploy id changes the URL, so no cached response from a previous deploy — good or
 * poisoned — is ever consulted again. Content hashes still dedupe within a deploy; the only
 * cost is one refetch per chunk per edge after each deploy.
 *
 * The id is the same 12-char SHA `gen-version.mjs` writes to `version.txt`, so `?dpl=` on a
 * chunk and `commit=` in `version.txt` name the same build. A dirty tree appends a timestamp:
 * two builds of "commit X plus uncommitted work" must not share cache keys.
 */
function deploymentId(): string {
  const git = (...args: string[]): string | null => {
    try {
      return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch {
      return null;
    }
  };
  const sha = git('rev-parse', '--short=12', 'HEAD') ?? 'nogit';
  const dirty = (git('status', '--porcelain') ?? '').length > 0;
  return dirty ? `${sha}.${Date.now().toString(36)}` : sha;
}

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
  deploymentId: deploymentId(),
};

export default nextConfig;
