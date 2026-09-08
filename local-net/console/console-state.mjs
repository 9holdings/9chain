/**
 * console-state.mjs — the router contract, and keeping a secret out of a log line.
 *
 * Lifted out of `console/server.mjs` on 2026-09-08 (D-258, P-106 step 8). Two pure functions.
 * The file writes stay in the console; what moved is the part that decides WHAT gets written and
 * WHAT gets hidden, because those are the parts that can be wrong in a way nobody notices.
 */

/**
 * ═══ THE ROUTER CONTRACT — `assignment.json` (P-86, D-239) ═══
 *
 * Under the per-node model a node answers RPC only for the chains it TRACKS, so "the public RPC
 * node" stops being one node: something in front — the K1 kit's `l1-batch router`, a Caddyfile —
 * has to send `/ext/bc/<blockchainID>/*` to a node that actually serves it.
 *
 * 🔴 That something is on the other side of hard rule #4: Caddy belongs to the web worktree. So
 * the contract between the two sides is a FILE, not shared code. Written here beside the ledger
 * on every save; read unchanged by the router generator
 * (`local-net/tools/k1/l1-batch/k1.go`, `cmdRouter`).
 *
 *   { "<blockchainID>": { node, uri, chainId, name, subnetID, validators } }
 *
 * `node` is the serving node: the public node when it validates the chain — so nothing changes
 * for those — otherwise the FIRST validator in rollout order. `uri` is that node's API as another
 * container on the compose network reaches it. A chain with no `validators` is the every-node
 * model and is served by the public node, exactly as it always was.
 *
 * Pure, and separate from the write, because getting this map wrong does not throw: it produces a
 * router that sends requests to a node which does not serve the chain, and the symptom is a chain
 * that "does not exist" from the outside while being perfectly healthy inside.
 */
export function buildAssignment(chains, { nodeContainer, port }) {
  if (!nodeContainer) throw new Error("buildAssignment needs the public node container name");
  const assignment = {};
  for (const chain of chains ?? []) {
    const validators = Array.isArray(chain.validators) ? chain.validators : null;
    // The public node serves it when it is one of the validators — or when there are none.
    const node = !validators || validators.includes(nodeContainer) ? nodeContainer : validators[0];
    assignment[chain.blockchainID] = {
      node,
      uri: `http://${node}:${port}`,
      chainId: chain.chainId,
      name: chain.name,
      subnetID: chain.subnetID,
      validators,
    };
  }
  return assignment;
}

/**
 * Replace every occurrence of a secret with a placeholder, before anything is logged or returned.
 *
 * 🔴 AN EMPTY SECRET THROWS RATHER THAN REDACTING NOTHING.
 *
 * `"abc".split("").join("<KEY>")` is `"a<KEY>b<KEY>c"` — an empty needle does not match nothing,
 * it matches BETWEEN EVERY CHARACTER, and the message becomes unreadable rubbish at exactly the
 * moment someone is reading it to diagnose a failure.
 *
 * In the console this cannot happen today: `requireSecret` exits the process unless the value is
 * at least 16 characters. But that guarantee lives three hundred lines away from the call, and a
 * function whose safety depends on a caller it cannot see is one reuse away from being wrong.
 * The guarantee is stated here, where the split happens.
 */
export function redactSecret(text, secret, placeholder = "<REDACTED>") {
  if (typeof secret !== "string" || secret === "") {
    throw new Error("redactSecret: refusing to redact with an empty secret — an empty needle matches between every character");
  }
  return String(text ?? "").split(secret).join(placeholder);
}
