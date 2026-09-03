/**
 * l1-symbol.mjs — the native-token SYMBOL of a user L1: validation and the fallback rule.
 *
 * ═══ WHY THIS FILE EXISTS ═══
 *
 * Measured 2026-09-03 on a real user (David): right after creating "9Cashback Chain", MetaMask
 * showed **"50.00M LOVE9"**. The 50,000,000 are the L1's own native token, allocated to the
 * owner by the genesis the console builds. They are NOT LOVE9: they live only on that L1, there
 * is no bridge, and they cannot be moved to the C-Chain. The web front-end handed MetaMask
 * `symbol: "LOVE9"` for EVERY user L1, so a worthless test balance was labelled with the name
 * of the network's real coin. A stranger who reads that line believes they own 50M LOVE9.
 *
 * The fix has two halves. This file is the console half: the create-chain API accepts an
 * optional `symbol`, validates it strictly, refuses the reserved names, and records it in the
 * chain ledger (`console-chains.json`, a public file — adding a key is safe for `/chains/`).
 * The web half (worktree `web-home`, hard rule #4) reads that key instead of a constant.
 *
 * ═══ RULES, AND WHY EACH ONE ═══
 *
 *   2–8 characters, `A-Z0-9` only, upper case.
 *     Wallets render symbols in caps and truncate long ones; a symbol with spaces or
 *     punctuation breaks `wallet_addEthereumChain` in some wallets. Lower case is REJECTED,
 *     not upcased silently: a user who typed `love9` must see that `LOVE9` is reserved, not
 *     watch their input mutate into something that is then refused for a different reason.
 *   Reserved: LOVE9, AVAX, ETH, BTC, USDT, USDC.
 *     LOVE9 is the network coin — the whole reason this file exists. The others are names a
 *     wallet user recognises and would trust; a test token wearing one of them is the same
 *     confusion pointed at a different victim.
 *   Unique across the ledger, case-insensitively, INCLUDING retired chains.
 *     A symbol identifies a chain to a human the way a chainId identifies it to a wallet.
 *     Two chains showing the same ticker in the same wallet is the D-069 replay problem in a
 *     coat: the user cannot tell which balance is which. Retired chains keep their symbol for
 *     the same reason they keep their chainId (server.mjs, revoke).
 *   Name the violation, not just the rule (same lesson as chain names, 2026-09-03):
 *     an invisible U+00A0 pasted into a symbol produces a message pointing at "character 3 is
 *     U+00A0", not "only letters and digits" — a true sentence that made a wrong input look right.
 *
 * ═══ THE FALLBACK — for chains created before this key existed ═══
 *
 * Six L1s were created on g1 before 2026-09-03 with no `symbol` in their record. A missing key
 * must never reach a wallet as `undefined` or, worse, as `LOVE9`. `symbolFromName` derives a
 * deterministic symbol from the chain name so every reader (this console, `web/`, 9Scan) gets
 * the SAME fallback without sharing code: take the alphanumerics of the name, upper-case, first
 * 6 characters, and drop a trailing "CHAIN" word first because most names end with it
 * ("BBWay Chain" → "BBWAY", "9S Union" → "9SUNIO"). The fallback is a DISPLAY rule, never
 * written into the ledger: writing it would make a guess look like a decision the owner made.
 */

export const SYMBOL_MIN = 2;
export const SYMBOL_MAX = 8;
export const SYMBOL_RE = /^[A-Z0-9]{2,8}$/;

/** Names a test token must not wear. Upper case; compared case-insensitively. */
export const RESERVED_SYMBOLS = Object.freeze(["LOVE9", "AVAX", "ETH", "BTC", "USDT", "USDC"]);

const INVISIBLE = new Set(["00A0", "202F", "2009", "200B"]);

/**
 * Validate a user-supplied symbol.
 *
 * @param {unknown} raw   whatever arrived in the request body
 * @param {Array<{symbol?: string, name?: string}>} ledger  every chain, live AND retired
 * @returns {string} the symbol, unchanged
 * @throws {Error} with a message that names the exact violation
 */
export function validateSymbol(raw, ledger) {
  if (typeof raw !== "string") throw new Error("Symbol must be a string.");
  const symbol = raw.trim();
  if (!Array.isArray(ledger)) {
    // A missing ledger is a programming error, not an empty ledger: treating it as empty would
    // let a duplicate through on the day the call site forgets the argument (D-171 shape).
    throw new Error("validateSymbol: ledger must be an array (live + retired chains)");
  }
  if (!SYMBOL_RE.test(symbol)) {
    const chars = [...symbol];
    const at = chars.findIndex((c) => !/[A-Z0-9]/.test(c));
    if (at >= 0) {
      const cp = chars[at].codePointAt(0).toString(16).toUpperCase().padStart(4, "0");
      if (/[a-z]/.test(chars[at])) {
        throw new Error(
          `Symbol must be upper case: character ${at + 1} is "${chars[at]}". ` +
          `Write it as ${symbol.toUpperCase()}.`);
      }
      throw new Error(
        `Symbol may contain only capital letters and digits. Character ${at + 1} is U+${cp}` +
        (INVISIBLE.has(cp)
          ? " — an invisible space lookalike, almost always from pasting. Retype it by hand."
          : ` (${JSON.stringify(chars[at])}) — remove it.`));
    }
    throw new Error(`Symbol must be ${SYMBOL_MIN}-${SYMBOL_MAX} characters long; this one is ${chars.length}.`);
  }
  if (RESERVED_SYMBOLS.includes(symbol)) {
    throw new Error(
      `"${symbol}" is reserved${symbol === "LOVE9" ? " — it is the network's own coin" : ""}. ` +
      `A user L1's native token is separate from ${symbol} and cannot be exchanged for it; ` +
      `giving it that name would tell wallet users they hold ${symbol} when they do not.`);
  }
  const clash = ledger.find((c) => symbolOf(c).toUpperCase() === symbol);
  if (clash) {
    throw new Error(
      `Symbol "${symbol}" is already used by "${clash.name}"` +
      (clash.symbol ? "" : " (its fallback symbol, derived from its name)") +
      ". Two chains with one ticker cannot be told apart in a wallet. Choose another.");
  }
  return symbol;
}

/**
 * Deterministic fallback for a chain record that has no `symbol` key. Display only — see the
 * header. Returns "" only for a name with no alphanumerics at all, which the name rule forbids.
 */
export function symbolFromName(name) {
  let s = String(name ?? "").trim();
  s = s.replace(/\s+chain$/i, "");
  s = s.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 6);
  return s;
}

/** The symbol a reader should show for a ledger record: the owner's choice, else the fallback. */
export function symbolOf(chain) {
  return (typeof chain?.symbol === "string" && chain.symbol.trim()) ? chain.symbol.trim() : symbolFromName(chain?.name);
}
