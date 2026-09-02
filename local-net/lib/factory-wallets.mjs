/**
 * factory-wallets.mjs — the `chain-factory` wallet, PER GENERATION. One place, no side effects.
 *
 * ═══ 🔴 WHY THIS IS A MAP AND NOT A DEFAULT STRING ═══
 *
 * This was once `lay("--wallet", "P-love91vgh2wh…")` — the g0 factory address, hard-coded as the
 * default of a gate that runs on G-day. Re-genesis mints a NEW factory key (D-117b, mandatory
 * since the key leak of 2026-08-31), so on the morning of g1 that gate would have asked the chain
 * about a wallet from the generation that had just been thrown away.
 *
 * And it would not have errored: `platform.getBalance` answers `unlocked: "0"` for an address that
 * simply holds nothing. So the gate goes RED reading "the factory wallet is empty" — true of the
 * address it asked about, meaningless about the network — while the wallet that actually pays for
 * every chain creation is never measured at all. Red for the wrong reason is worse than red: it
 * sends someone to top up a dead wallet.
 *
 * ⇒ Keyed by generation, and a generation with no entry is UNMEASURABLE, never a silent zero.
 *   "I don't know which wallet to ask about" is not "the wallet is empty". Declaring a new
 *   generation's address is a G-day manual task, listed in `gday-preflight.mjs`.
 *
 * ═══ WHY IT LIVES IN ITS OWN FILE ═══
 *
 * It used to be a `const` inside `scripts/watch-network.mjs`, which is a SCRIPT: importing it to
 * borrow the table runs the whole gate and then calls `process.exit`, killing the importer. The
 * second reader (`scripts/reopen-chain-creation.mjs`) therefore had two choices — execute a gate
 * as a side effect of reading a constant, or copy the address into itself. The second is what
 * `check-single-source.mjs` exists to forbid (D-113), and a copied fund address is precisely the
 * kind of constant that goes stale one generation later without a word.
 *
 * Deliberately NOT put in `local-net/lib/chainid.mjs`: that file is shipped to the server and sits
 * on the console's critical path, and the console has no business carrying treasury addresses.
 */

/** @type {Record<number, string>} generation → the P-Chain address that pays for chain creation */
export const VI_FACTORY_THEO_THE_HE = {
  0: "P-love91vgh2whn746dzzvg0dj4w9rsqvlalcldvpueuvj",
  // 🔴 A NEW KEY PER GENERATION, NOT THE OLD ONE CARRIED FORWARD (D-117b). The g0 factory key was
  // byte-identical to the one in a backup of the already-dead 9001 network, which meant a bundle
  // describing a dead chain still held spend authority on the live one. g1 gets its own, and it is
  // a vanity address ground out by `local-net/tools/vanity-keygen`.
  //
  // 🔴 ROTATED 2026-09-02, BEFORE THE WALLET WAS EVER FUNDED. The first g1 factory key
  // (`P-love91999h0q4ucfnex9q0qxefuu0ke0xtyvl6739999`) was exposed while its file was being read
  // with a redaction pattern that covered `PrivateKey-…` but not the `EVM privkey : 0x…` line the
  // same file carries. Both render ONE secp256k1 secret, so the whole wallet was exposed, and by
  // this project's own definition (D-117) key material outside `9chain-a1-keys/g<N>/` is a leak
  // whatever the audience. It held 0 on X, P and C at that moment and had authorised nothing, so
  // rotating cost a 33-minute grind and no money — which is the entire argument for doing it then
  // rather than after funding. The retired address is deliberately NOT listed here: this table
  // answers "who pays now", and a dead entry in it is a wallet somebody can still send to.
  1: "P-love9199au4t8uj8s6875ztwvvgctnkcxddtwv549999",
};
