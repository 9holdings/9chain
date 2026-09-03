/**
 * l1-allowlist.mjs — WHO MAY CREATE AN L1, as pure functions (D-171).
 *
 * ═══ 🔴 WHY THIS IS A SEPARATE MODULE ═══
 *
 * The logic could have lived inside `console/server.mjs`, and the first draft did. But that file
 * reads `A1_CONSOLE_TOKEN` at import time and `process.exit(1)` without it, so importing it to
 * test one pure function runs a server's whole startup and dies. This project already paid for
 * that shape once today: `check-patch-count.mjs` exports `exemptLines` and calls
 * `process.exit(main())` at top level, so a second gate that needed the same helper had to COPY
 * it — a third declaration of one rule (CLAUDE.md section 6).
 *
 * ⇒ A rule that decides who may spend a permanent resource has to be testable on its own. That is
 *   the whole reason this file exists.
 *
 * ═══ WHAT IT GUARDS ═══
 *
 * `MAX_L1` is 15 and it is not a number anyone can raise: `maxNumTrackedSubnets = 16` in
 * avalanchego's `network/peer/peer.go:39` is enforced at handshake and exceeding it calls
 * `p.StartClose()` — every peer drops the node, so the network breaks rather than slows.
 *
 * And a junk chain does not cost a slot, it costs a NAME **permanently and across generations**:
 * re-genesis erases the chain, but `chainid-issued.json` keeps the name and chainId blocked
 * forever, because reissuing a chainId is what would let an old chain's signatures replay on a
 * new one. That ledger only ever grows.
 *
 * ⇒ Self-service is the right shape when a resource is effectively unlimited. Thirteen permanent
 *   slots is the size of an invitation list, and no technical gate detects that kind of mismatch
 *   between the shape of a product and what it actually has. This one is the human answer to it.
 *
 * Usage:
 *   node local-net/lib/l1-allowlist.mjs --self-test
 */

/**
 * Parse `A1_L1_ALLOWLIST` into a set of lowercased addresses.
 *
 * 🔴 THROWS on a bad entry rather than skipping it. A list quietly one shorter than the operator
 * believes is exactly the failure this gate exists to prevent, pointing inward — and a dropped
 * entry looks like nothing at all. `parseAddr` is injected so this stays pure and so the caller
 * uses the SAME parser as the admin address, the one that rejects a bad EIP-55 checksum and
 * therefore catches a mistyped character.
 *
 * Comparison is lowercased on purpose: the EIP-55 checksum is presentation, not identity, and
 * refusing a correct wallet because it was pasted in the other casing would be a false red on the
 * one path where a false red costs a person their invitation.
 */
export function parseAllowlist(raw, parseAddr) {
  const out = new Set();
  for (const part of String(raw ?? "").split(/[\s,;]+/).filter(Boolean)) {
    out.add(parseAddr(part, "A1_L1_ALLOWLIST entry").toLowerCase());
  }
  return out;
}

/**
 * May this identity create an L1?
 *
 * 🔴 **FAILS CLOSED.** An empty or unset list means NO wallet may create — only the operator
 * token. This follows the rule `A1_DE_CHAIN_MO` already sets in the console: a safety gate that
 * accepts many ways of saying "allow" is a gate that opens by accident. An allowlist that falls
 * OPEN when its variable is missing is that mistake in its purest form, and the failure would be
 * silent, because nothing looks wrong from the outside.
 *
 * 🔴 **CREATION ONLY.** The caller must not apply this to revocation. `/api/revoke` already
 * checks that the signer owns the chain; gating revocation as well would mean that removing a
 * wallet from the list STRANDS that wallet's chain — it could not revoke it, and nobody else
 * could either without the operator token. A gate that can trap a user's own property inside is
 * not a safety feature.
 *
 * 🔴 An identity shape nobody planned for is REFUSED, not waved through. If a third login kind is
 * ever added, this gate must be updated deliberately rather than silently admitting it.
 */
export function mayCreateL1(ai, allow) {
  if (!ai) return { ok: false, why: "not authenticated" };
  if (ai.kieu === "vanHanh") return { ok: true, why: "operator token" };
  if (ai.kieu !== "vi" || typeof ai.diaChi !== "string" || !ai.diaChi) {
    return { ok: false, why: "unrecognised identity kind — refused rather than assumed" };
  }
  if (!allow || allow.size === 0) {
    return {
      ok: false,
      why: "chain creation is by invitation and no wallet is on the list yet "
         + "(A1_L1_ALLOWLIST is unset on this server)",
    };
  }
  if (!allow.has(ai.diaChi.toLowerCase())) {
    return { ok: false, why: `wallet ${ai.diaChi} is not on the invite list` };
  }
  return { ok: true, why: "wallet is on the invite list" };
}

/* ══════════════════════════════════════════════════════════════════════════
   Reverse controls
   ══════════════════════════════════════════════════════════════════════════ */
if (process.argv[1]?.endsWith("l1-allowlist.mjs") && process.argv.includes("--self-test")) {
  const { parseEvmAddress } = await import("./eip55.mjs");
  let pass = 0, fail = 0;
  const ok = (label, got, want) => {
    if (got === want) { pass++; console.log(`  ✓ ${label}`); }
    else { fail++; console.log(`  ✗ ${label} — wanted ${want}, got ${got}`); }
  };
  const A = "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC";   // the well-known ewoq address
  const B = "0x1212b2445e74f788B30BfA9C42aa46f252345a0B";   // the published foundation address
  const list = parseAllowlist(A, parseEvmAddress);

  console.log("══ REVERSE CONTROLS — l1-allowlist ══\n");
  console.log("── who may create ──");
  ok("the operator token is allowed even with an EMPTY list", mayCreateL1({ kieu: "vanHanh" }, new Set()).ok, true);
  ok("🔴 an EMPTY list refuses every wallet — it fails CLOSED, never open",
    mayCreateL1({ kieu: "vi", diaChi: A }, new Set()).ok, false);
  ok("🔴 a MISSING list (undefined) also refuses — same as empty, not a bypass",
    mayCreateL1({ kieu: "vi", diaChi: A }, undefined).ok, false);
  ok("a wallet on the list is allowed", mayCreateL1({ kieu: "vi", diaChi: A }, list).ok, true);
  ok("🔴 a wallet NOT on the list is refused", mayCreateL1({ kieu: "vi", diaChi: B }, list).ok, false);
  ok("🔴 casing does not decide identity — the same wallet lowercased is still allowed",
    mayCreateL1({ kieu: "vi", diaChi: A.toLowerCase() }, list).ok, true);
  ok("🔴 unauthenticated is refused", mayCreateL1(null, list).ok, false);
  ok("🔴 an identity kind nobody planned for is REFUSED, not waved through",
    mayCreateL1({ kieu: "somethingNew", diaChi: A }, list).ok, false);
  ok("🔴 a wallet identity carrying no address is refused", mayCreateL1({ kieu: "vi" }, list).ok, false);
  ok("🔴 …and one carrying an empty address is refused too",
    mayCreateL1({ kieu: "vi", diaChi: "" }, list).ok, false);

  console.log("\n── parsing the list ──");
  ok("empty string yields an empty set, not a throw", parseAllowlist("", parseEvmAddress).size, 0);
  ok("undefined yields an empty set", parseAllowlist(undefined, parseEvmAddress).size, 0);
  ok("comma separated", parseAllowlist(`${A},${B}`, parseEvmAddress).size, 2);
  ok("whitespace and semicolons separate too", parseAllowlist(`${A} ; ${B}`, parseEvmAddress).size, 2);
  ok("the same address twice collapses to one", parseAllowlist(`${A},${A.toLowerCase()}`, parseEvmAddress).size, 1);
  ok("🔴 a mistyped address THROWS rather than being silently dropped",
    (() => { try { parseAllowlist(`${A},0xdeadbeef`, parseEvmAddress); return "no throw"; } catch { return "threw"; } })(), "threw");
  ok("🔴 a bad EIP-55 checksum throws — that is how one wrong character is caught",
    (() => {
      const bad = "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52Fc";   // last char case flipped
      try { parseAllowlist(bad, parseEvmAddress); return "no throw"; } catch { return "threw"; }
    })(), "threw");

  console.log(`\n${fail === 0 ? "✅" : "🔴"} ${pass} passed · ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
