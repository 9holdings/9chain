/**
 * 9Chain-A1 network identity constants + how the endpoints are derived.
 *
 * 🔴 NEVER HARD-CODE `localhost` INTO A PUBLIC PAGE. A visitor's browser resolves
 * `localhost` to THEIR OWN MACHINE — the page loads from the server while the numbers
 * come from the client, and it fails silently: everyone who opens the page sees "the
 * network is dead". Both this project's explorer and its dashboard hit exactly that once.
 *
 * The convention actually in use: the page is at `<host>`, the RPC at `rpc-<host>`.
 * Derived from `location.hostname` at runtime, so one build serves both the public
 * domain and `localhost` during development.
 */
export const CHAIN = {
  ten: '9Chain Testnet A1',
  /** EVM chainId — decimal, for display. */
  chainId: 9000000009,
  /** 🔴 MetaMask ONLY accepts a hex chainId. Passing decimal fails immediately. */
  chainIdHex: '0x218711a09',
  kyHieu: 'LOVE9',
  currencyName: 'LOVE9',
  decimals: 18,
  /**
   * avalanchego's networkID is a uint32 — NOT the nine-billion number above.
   *
   * 🔴 CHANGED 2026-08-27: `9001` → `999999999` (D-081, generation **g0**).
   * 🔴 CHANGED 2026-09-03: `999999999` → `999999998` — **G-day ran on 01/09**, so the
   *   public network is now generation **g1**. Measured directly against the running
   *   network before editing: `info.getNetworkID` → 999999998 · `info.getNetworkName` →
   *   `9chain-a1-g1` · `eth_chainId` → 0x218711a09 (unchanged, per D-047).
   *
   * This number is not arbitrary: `network_ids.go` derives both identity axes from one
   * variable `A1Gen` — `A1ID = 999999999 − A1Gen` and `A1Name = "9chain-a1-g<A1Gen>"`.
   * Generations count DOWN from the top of the reserved band, so each rebirth DECREASES
   * this number by one.
   *
   * ⚠️ THIS CONSTANT HAS BEEN WRONG TWICE, BOTH TIMES THE SAME WAY: the footer printed
   * "networkID 9001" when the network was already 999999999 (27/08), then printed
   * "999999999" when the network was already 999999998 (01/09 → 03/09, two days live on
   * the public site). It is a HAND-COPIED CONSTANT — no syntax error, no type error, only
   * a false statement, so `tsc`, the tests and axe are all green while the page lies.
   * ⇒ The ONLY thing that catches it is `local-net/deploy/check-chain-id.mjs`: it asks the
   *   RUNNING network before every deploy. This time it blocked the very deploy in
   *   progress. Do not remove it during a cleanup, and do not "fix" it into reading a
   *   constant out of the repo.
   *
   * `eth_chainId` does NOT change (D-047 keeps 9000000009) — the two numbers are
   * independent, and that is exactly where the confusion lives: the network changes
   * identity while the wallet sees nothing different.
   */
  networkId: 999999998,
} as const;

/** Default domain when `location` cannot be read (during the static build). */
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

/** The public RPC origin, derived from whichever domain is open. */
export function rpcOrigin(): string {
  const h = host();
  // Local dev: there is no `rpc-localhost`, so go straight out to the public network.
  if (h === 'localhost' || h === '127.0.0.1' || h.endsWith('.local')) {
    return `https://rpc-${DEFAULT_HOST}`;
  }
  return `${window.location.protocol}//rpc-${h}`;
}

/** The C-Chain RPC — the main network, the one a user's wallet connects to. */
export function rpcCChain(): string {
  return `${rpcOrigin()}/ext/bc/C/rpc`;
}

/** The faucet API origin. Same domain as the page, so a relative path is enough. */
export function faucetOrigin(): string {
  if (typeof window === 'undefined') return `https://${DEFAULT_HOST}/faucet`;
  const h = host();
  if (h === 'localhost' || h === '127.0.0.1') return `https://${DEFAULT_HOST}/faucet`;
  return `${window.location.protocol}//${h}/faucet`;
}

/** Explorer (9Scan-A1) — a separate project, we only link to it. */
export function explorerOrigin(): string {
  return 'https://a1.9scan.org';
}

/**
 * The LOVE9 mark — an ABSOLUTE URL, and it has to be absolute.
 *
 * The wallet reads this URL in ITS OWN process, not in the page's context, so a relative
 * path (`/brand/…`) is meaningless to it — there is no base for it to resolve against.
 *
 * 🔴 The `/brand/*` path needs its own route in Caddy. The root `/` is Blockscout, and
 * Blockscout is an SPA that returns **HTTP 200 with an empty shell** for any unknown path
 * — so a forgotten route means the image "loads" with a 200, the wallet shows an empty
 * box, and every status-code check stays green. Measure by `content-type`, not by HTTP status.
 */
export function brandOrigin(): string {
  if (typeof window === 'undefined') return `https://${DEFAULT_HOST}/brand`;
  const h = host();
  if (h === 'localhost' || h === '127.0.0.1') return `https://${DEFAULT_HOST}/brand`;
  return `${window.location.protocol}//${h}/brand`;
}

/** 256px PNG of LOVE9 — the size wallets use most, and it has a background so it does not vanish into a dark theme. */
export function love9IconUrl(): string {
  return `${brandOrigin()}/love9-navy-inverse-256px.png`;
}

/**
 * Parameters for adding the network to a wallet — the EIP-3085 shape.
 *
 * 🔴 `iconUrls` — MEASURED 2026-08-26, AND IT DOES NOT WORK. DO NOT TRY AGAIN.
 *
 * This parameter IS in the EIP-3085 standard and IS in MetaMask's own documented example,
 * so reading the docs makes it look achievable. What actually happened: adding the network
 * through MetaMask succeeded (the "Update 9Chain Testnet A1" confirmation screen showed
 * the right Network + RPC and **no icon at all**), then the Tokens tab still showed LOVE9
 * as a **grey circle reading "L9"**. MetaMask does not let you set an icon for the
 * **NATIVE token**, even though the standard defines one.
 *
 * KEPT rather than deleted: it is standards-correct, costs nothing, and starts working the
 * day some wallet (or a later MetaMask) chooses to render it. The expensive part was the
 * MEASUREMENT, so it is written down here to stop anyone investigating it from scratch.
 *
 * The remaining routes, if a wallet icon ever genuinely matters:
 *   • For an ERC-20, `wallet_watchAsset` (EIP-747) takes `image` directly — that works.
 *     But LOVE9 is the NATIVE coin, so this would mean minting a wrapped version (WLOVE9);
 *     changing the token architecture just to get an icon is a bad trade.
 *   • Getting into MetaMask's own registry: in practice mainnet-only, and for a testnet on
 *     a self-assigned chainId it would almost certainly be refused.
 * ⇒ The places we ACTUALLY control the identity are our own site and the 9Scan-A1 explorer
 *   — both already carry the LOVE9 mark (favicon + `/brand/`).
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
