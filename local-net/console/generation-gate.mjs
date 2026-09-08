/**
 * generation-gate.mjs — is this console pointed at the network it was built for?
 *
 * Lifted out of `console/server.mjs` on 2026-09-08 (D-257, P-106 step 7). The RPC calls stay in
 * the console; the verdict is pure, which is what lets every branch below be exercised without a
 * node — and there are four of them, three of which refuse.
 *
 * ═══ WHY THIS GATE IS NOT OPTIONAL ═══
 *
 * The console hands out chainIds from a block that belongs to ONE generation, and a chainId goes
 * into a genesis file that is IMMUTABLE. Issuing a number from generation g1's block onto a g0
 * network cannot be undone by anyone, ever — not by the console, not by the operator, not by the
 * chain's owner. So the console refuses to create anything until it has CONFIRMED which
 * generation the node it is talking to belongs to. "I could not ask" is a refusal, not a shrug.
 *
 * ═══ 🔴 WHY THE DRILL-BAND MISMATCH IS ITS OWN REFUSAL ═══
 *
 * A drill console pointed at the REAL network must not fall through to the generic mismatch. The
 * generic message tells the operator to fix `A1_GEN` — and here the fix is the OPPOSITE: unset
 * the flag, or point the console at a drill node. A correct diagnosis with the wrong remedy sends
 * someone to change the one thing that was already right.
 *
 * ═══ SECTION 0 ═══
 *
 * Two of the four verdicts used to be Vietnamese while the other two were English, and all four
 * are read by an operator — one of them at console startup, one of them as the error that stops a
 * chain creation. A message whose language depends on which branch produced it is worse than
 * either language on its own. All four are English now.
 *
 * The status values are English too (`unmeasured` · `mismatch` · `match`). They never crossed the
 * wire — both readers were inside `server.mjs` — which is what made renaming them safe here,
 * unlike the `{ kieu, diaChi }` contract that `l1-allowlist.mjs` also reads (D-254).
 */

/**
 * Judge one reading of the node's identity.
 *
 * `reading` is `{ networkId, networkName }` as the node reported them, or `{ error }` when it
 * could not be asked. Everything else is configuration, passed in so this stays pure.
 */
export function judgeGeneration(reading, { gen, band, drillBand, api, bandOfNetworkId }) {
  if (reading?.error) {
    return {
      status: "unmeasured",
      why: `could not ask the running node (${api}): ${reading.error}. The console refuses to create `
        + `chains while it does not know which network generation it is on — a chainId issued into `
        + `the wrong generation is permanent.`,
    };
  }

  const raw = reading?.networkId;
  const networkName = reading?.networkName;

  // 🔴 THE SHAPE IS CHECKED BEFORE THE COERCION, and that is not pedantry — it was a real defect
  // carried in from `server.mjs` (found by this file's own counter-check, D-257).
  //
  //     Number(null) === 0   ·   Number("") === 0   ·   Number([]) === 0
  //
  // and `Number.isSafeInteger(0)` is TRUE. So a node that answered `null` — i.e. told us nothing —
  // used to sail past the "is it a number" guard as networkID **0**, get compared against the
  // band, and come back as a MISMATCH: "the running node reports networkID 0". That sends the
  // operator to fix A1_GEN over a node that never answered the question. Wrong verdict, wrong
  // remedy, stated with total confidence — the error class this whole milestone is about.
  const looksNumeric = typeof raw === "number"
    || (typeof raw === "string" && raw.trim() !== "" && Number.isFinite(Number(raw)));
  const networkId = looksNumeric ? Number(raw) : NaN;

  if (!Number.isSafeInteger(networkId)) {
    return {
      status: "unmeasured",
      why: `the node returned a networkID that is not a number: ${JSON.stringify(raw)}`,
    };
  }

  // 🔴 Named separately, BEFORE the generic mismatch — see the header on why the remedy differs.
  if (drillBand && bandOfNetworkId(networkId) === "real") {
    return {
      status: "mismatch",
      why: `A1_DRILL_BAND=1 is set, but the node at ${api} reports the REAL network of this generation `
        + `(networkID ${networkId}, "${networkName}"). A drill console must never allocate chainIds onto `
        + `the live network: it would write drill numbers (${band.floor}–${band.ceiling}) into immutable `
        + `real genesis files. Refusing. Unset A1_DRILL_BAND for the real network, or point NODE_URI at `
        + `a drill-band node (networkID ${band.networkId}).`,
    };
  }

  if (networkId !== band.networkId || (networkName && networkName !== band.name)) {
    // A drill node seen by a REAL console is the one mismatch with a cheap, correct remedy;
    // every other mismatch keeps the generation-bump instructions.
    const drillHint = !drillBand && bandOfNetworkId(networkId) === "drill"
      ? ` Hint: this node IS the drill band of generation g${gen}; start the console with `
        + `A1_DRILL_BAND=1 to serve it (drill chainIds come from a separate block).`
      : "";
    return {
      status: "mismatch",
      why: `GENERATION MISMATCH. This console is built for generation g${gen} (networkID ${band.networkId}, `
        + `"${band.name}") but the running node reports networkID ${networkId}, "${networkName}". The `
        + `console's chainId block starts at ${band.floor} — issuing from that block onto this network `
        + `is issuing into the wrong generation, and a chainId lives in an IMMUTABLE genesis. Fix: update `
        + `A1_GEN in local-net/lib/chainid.mjs to match constants.A1Gen on the Go side, then redeploy the `
        + `console (scripts/check-deploy-drift.mjs).${drillHint}`,
    };
  }

  return {
    status: "match",
    why: `g${gen} · networkID ${networkId} · "${networkName}"${drillBand ? " · DRILL BAND (A1_DRILL_BAND=1)" : ""}`,
  };
}
