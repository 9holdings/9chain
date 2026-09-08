/**
 * chain-ownership.mjs — which chain, and whether this caller may govern it.
 *
 * Lifted out of `console/server.mjs` on 2026-09-08 (D-255, P-106 step 5). Two pure functions and
 * one RPC read. They are small, and they are the two questions every governance route asks before
 * it touches anything: WHICH chain is this, and MAY YOU.
 *
 * ═══ WHY THESE TWO IN PARTICULAR ═══
 *
 * Everything else in the governance block has side effects — it writes files, restarts nodes,
 * appends to the ledger. These do not. They were the only part of the answer to "may this wallet
 * change this chain's fees" that could be tested on its own, and they were the part with no test:
 * inside a 2 927-line file they could only be reached by standing up a console.
 *
 * That is the same argument `lib/l1-allowlist.mjs` makes at the top of itself, for the same kind
 * of rule: *a rule that decides who may spend a permanent resource has to be testable on its own*.
 *
 * ═══ 🔴 TWO NAMES THAT ARE NOT MINE TO CHANGE ═══
 *
 * `chain.thuHoi` is a key IN `console-chains.json` — written to disk on the live server. Renaming
 * a stored key is a different question from renaming a variable (CLAUDE.md section 5, trap 12),
 * and getting it wrong makes the console stop seeing chains that are mid-revocation.
 *
 * `{ kieu, diaChi }` with the values `"vanHanh"` and `"vi"` is a CONTRACT BETWEEN MODULES:
 * `lib/l1-allowlist.mjs` reads it, and so do the auth and governance suites. Renaming it has to
 * move every reader in one step or it silently splits the check that decides who may spend a
 * permanent chain slot. Both are section-0 debt, recorded as such (P-107), not quietly kept.
 */

/**
 * The chain a governance request is about, or a THROW that says why not.
 *
 * 🔴 The three refusals are deliberately different sentences, because they need different actions
 * from the reader: a revoked chain is gone for good, an unknown name is probably a typo, and a
 * chain mid-revocation will be one of the other two shortly. Collapsing them into "not found"
 * would save a line and cost the person the only clue they had.
 */
export function findGovernableChain(state, name) {
  const wanted = String(name || "").trim();
  if (!wanted) throw new Error("Missing the chain name");
  const chain = state.chains.find((c) => c.name === wanted);
  if (!chain) {
    throw new Error(state.retired.some((c) => c.name === wanted)
      ? `"${wanted}" has been revoked — nothing to govern.`
      : `No L1 named "${wanted}" in the directory.`);
  }
  if (chain.thuHoi) throw new Error(`"${wanted}" is being revoked right now.`);
  return chain;
}

/**
 * A wallet may govern only its OWN chain; the operator token may govern any.
 *
 * 🔴 Comparison is lowercased. EIP-55 casing is a checksum, i.e. presentation, not identity —
 * refusing a correct wallet because the ledger stored it in the other casing would lock an owner
 * out of their own chain. `lib/eip55.mjs` makes the same call for the same reason.
 *
 * 🔴 401 and 403 are kept apart. "I do not know who you are" and "I know who you are and it is
 * not your chain" are different facts, and a client that cannot tell them apart cannot decide
 * whether signing in again would help.
 */
export function assertChainOwner(chain, who) {
  if (who?.kieu === "vanHanh") return;
  if (who?.kieu !== "vi" || typeof who.diaChi !== "string") {
    const error = new Error("not authenticated");
    error.status = 401;
    throw error;
  }
  const owner = typeof chain.admin === "string" ? chain.admin.trim() : "";
  if (!owner || owner.toLowerCase() !== who.diaChi.toLowerCase()) {
    const error = new Error(owner
      ? `"${chain.name}" belongs to ${owner}, not to the wallet signed in (${who.diaChi}).`
      : `"${chain.name}" is a system chain — only the operator can govern it.`);
    error.status = 403;
    throw error;
  }
}

/**
 * `readAllowList(address)` on one precompile, decoded.
 *
 * The RPC caller is injected so a test can drive this without a node — and so the caller keeps
 * using the console's own client, with its deadline and its response bound.
 */
export function createRoleReader({ rpc, encodeReadAllowList, decodeRole }) {
  if (typeof rpc !== "function") throw new Error("createRoleReader needs an rpc function");
  return async function readRole(rpcPath, precompileAddress, address) {
    const hex = await rpc(rpcPath, "eth_call", [{ to: precompileAddress, data: encodeReadAllowList(address) }, "latest"]);
    return decodeRole(hex);
  };
}
