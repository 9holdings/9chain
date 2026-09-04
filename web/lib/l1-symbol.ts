/**
 * The native-token symbol of a user L1 — the READER'S half of the contract in
 * `local-net/lib/l1-symbol.mjs` (console, P-54).
 *
 * ═══ WHY THIS FILE EXISTS (P-55) ═══
 * Measured 2026-09-03 on a real user: right after launching "9Cashback Chain", MetaMask showed
 * **"50.00M LOVE9"**. Those 50,000,000 are the L1's OWN native token, allocated to the owner by
 * the genesis the console builds. They are not LOVE9, there is no bridge, and they cannot move
 * to the C-Chain — but every page here handed the wallet `symbol: 'LOVE9'` for every user chain,
 * so a worthless test balance wore the name of the network's real coin.
 *
 * The console now records an optional `symbol` in `console-chains.json`. A record WITHOUT the
 * key (every chain launched before P-54) must never reach a wallet as `undefined`, and never as
 * `LOVE9` — so the fallback below derives one from the name, with the SAME rule the console and
 * 9Scan apply, so every reader shows the same ticker without sharing code.
 *
 * 🔴 THE FALLBACK IS A DISPLAY RULE, NEVER WRITTEN ANYWHERE. Writing it would make a guess look
 * like a decision the owner made. If the console's rule ever changes, change it here in the
 * same commit — `test/directory-model.test.ts` pins the worked examples from the console's own
 * header comment ("BBWay Chain" → "BBWAY", "9S Union" → "9SUNIO").
 */

/** Take the alphanumerics of the name, upper-case, first 6 — dropping a trailing "Chain" first. */
export function symbolFromName(name: string | undefined | null): string {
  let s = String(name ?? '').trim();
  s = s.replace(/\s+chain$/i, '');
  s = s.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6);
  return s;
}

/** The symbol a reader should show for a ledger record: the owner's choice, else the fallback. */
export function symbolOf(c: { symbol?: string; name?: string } | null | undefined): string {
  return typeof c?.symbol === 'string' && c.symbol.trim() ? c.symbol.trim() : symbolFromName(c?.name);
}
