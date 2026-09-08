/**
 * node-health.mjs — reading what a managed node says about itself.
 *
 * Lifted out of `console/server.mjs` on 2026-09-08 (D-256, P-106 step 6). The DOCKER call stays
 * in the console; what moved here is the part that decides what the answer means — and that part
 * is pure, so the rules below are now held by cases instead of by a running network.
 *
 * ═══ 🔴 THE REASON STRINGS WERE VIETNAMESE, AND THEY REACH THE USER ═══
 *
 * The primary-network probe returned its reasons in Vietnamese — "the API is not answering yet",
 * "health could not be parsed", and so on — and those strings are interpolated STRAIGHT into
 * errors a person reads: the rollout failure that names a node and stops, and the undo path's
 * per-node report. One of those two sentences was already English and one was not.
 *
 * ⚠️ The originals are not quoted here. Quoting the thing under test is what put Vietnamese into
 * three separate new files during this session and turned the ratchet red each time; naming the
 * idea does the same job (D-247).
 *
 * This repo has already paid for this exact shape once: `lib/eip55.mjs` was Vietnamese until
 * 2026-09-04, when a dump of the console's own error sentences found one coming back from
 * `/api/preview` in Vietnamese on the product path. Section 0 is about the READER, and half of
 * these sentences were already English while the other half were not — which is worse than
 * either, because it makes the language of an error depend on which branch produced it.
 *
 * The field is `why` now, not `vi`.
 *
 * ═══ 🔴 WHY EACH P/X/C CHECK IS READ INSTEAD OF THE OVERALL FLAG ═══
 *
 * `health.health` returns an overall boolean AND a per-check map. The overall flag folds in the
 * subnet being created — so during exactly the operation this is guarding, it is false for a
 * reason that is not a problem. Reading P, X and C individually asks the question actually being
 * asked: is the PRIMARY network fine on this node.
 */

/**
 * The JSON object inside a `docker compose exec … curl` output.
 *
 * 🔴 Not `JSON.parse(out)`. Compose writes its own lines to the same stream, so the output is
 * routinely `{...}` with noise around it — and the noise is not an error, it is compose being
 * compose. Slicing to the outermost braces is what makes this readable at all.
 * Returns `null` when there is nothing parseable, which every caller treats as "not answering"
 * rather than as "answered no".
 */
export function extractJson(text) {
  const raw = String(text ?? "");
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try { return JSON.parse(raw.slice(start, end + 1)); } catch { return null; }
}

/** Is the PRIMARY network (P, X and C) clean on this node? */
export function judgePrimaryHealth(output) {
  const parsed = extractJson(output);
  if (!parsed) return { ok: false, why: "health response not parseable" };
  const checks = parsed?.result?.checks;
  if (!checks) return { ok: false, why: "health response has no checks" };
  // Each chain individually — see the header on why the overall flag is the wrong quantity here.
  for (const name of ["P", "X", "C"]) {
    const check = checks[name];
    if (!check) return { ok: false, why: `no ${name}-Chain check yet` };
    if (check.error) return { ok: false, why: `${name}-Chain: ${asText(check.error)}` };
  }
  return { ok: true, why: "P/X/C report no errors" };
}

/** Is ONE L1 healthy on this node? Keyed by blockchainID, which is how the node keys it. */
export function judgeChainHealth(output, blockchainID) {
  const parsed = extractJson(output);
  if (!parsed) return { ok: false, why: "health response not parseable" };
  const check = parsed?.result?.checks?.[blockchainID];
  if (!check) return { ok: false, why: `no health check for chain ${blockchainID} yet` };
  if (check.error) return { ok: false, why: `chain ${blockchainID}: ${asText(check.error)}` };
  return { ok: true, why: "chain check clean" };
}

/**
 * WHICH upgrade file this node actually came up with.
 *
 * 🔴 Why this exists at all (drill 2026-09-05): a restart proves the node went down, and the
 * chain's health check proves the VM came back — neither says which FILE it came back with. The
 * undo path used to report "restarted on the old file" for nodes whose `eth_getChainConfig` still
 * listed the new upgrade. The quantity that decides whether the network forks at the activation
 * timestamp was never being read.
 */
export function judgeChainConfig(output, upgradeShape) {
  const parsed = extractJson(output);
  if (!parsed) return { ok: false, why: "eth_getChainConfig not parseable" };
  if (parsed.error) return { ok: false, why: `eth_getChainConfig: ${asText(parsed.error)}` };
  // `upgrades` is always present and `precompileUpgrades` is not (D-186 gotcha 2).
  return { ok: true, shape: upgradeShape(parsed?.result?.upgrades?.precompileUpgrades ?? []) };
}

/**
 * Does this node still SERVE the chain's RPC?
 *
 * A node that untracked the subnet routes nothing at `/ext/bc/<id>/rpc`, so `curl -f` fails.
 * 🔴 Anything else that fails — the API being down, the container gone — is ALSO "not serving",
 * and for a revocation that is the safe reading: the question is whether the chain is still
 * reachable there, not why it is not.
 */
export function servesChain(output) {
  return /"result"\s*:\s*"0x/.test(String(output ?? ""));
}

/**
 * The verdict of one wait iteration, given what the two probes said.
 *
 * Pure, and separate from the loop, because the interesting rule is not the sleeping: it is that
 * a chain can be HEALTHY and still be running the wrong file, and that state must not be reported
 * as success.
 */
export function judgeWaitStep(health, loaded, expectShape) {
  if (!health.ok) return health;
  if (typeof expectShape !== "string") return { ok: true, why: "chain check clean" };
  if (loaded?.ok && loaded.shape === expectShape) {
    return { ok: true, why: `chain check clean, runs "${expectShape || "empty"}"` };
  }
  if (loaded?.ok) {
    return { ok: false, why: `chain healthy but it loaded "${loaded.shape || "empty"}", expected "${expectShape || "empty"}"` };
  }
  return { ok: false, why: loaded?.why ?? "chain config could not be read" };
}

/** An error field that may be a string or an object, rendered without throwing. */
function asText(value) {
  return typeof value === "string" ? value : JSON.stringify(value);
}
