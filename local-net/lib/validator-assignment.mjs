// validator-assignment.mjs — which managed nodes validate (and track) which L1.
//
// ═══ WHY THIS EXISTS (P-82, D-233 / D-235) ═══
//
// Until 2026-09-07 the console had ONE model: every managed node tracks every L1. The protocol
// cuts a peer that announces more than 16 subnets at the handshake (`network/peer/peer.go`,
// D-009), so under that model the 16 is a ceiling on the NETWORK — 15 chains, then nothing.
// 108 chains need `108 × V ≤ N × 15`: each chain is served by V nodes, each node carries at most
// 15 chains, and the console must know which node carries what.
//
// This module is that knowledge, kept PURE (no docker, no files) so the assignment can be tested
// against fixtures the way `chainid.mjs` is: the console passes in the node list it read from
// compose and the ledger it read from disk, and gets back a decision or a refusal.
//
// ═══ THE RULES ═══
//
//   1. A chain record carries `validators: [service, …]`. A record WITHOUT the key is a chain
//      created under the old model and means "every node" — the ledger is a public data contract
//      and old records are never rewritten.
//   2. A node's LOAD is the number of chains whose validators include it. The cap is per NODE
//      (`capPerNode`, the console's MAX_L1), never global: with V < N a chain does not consume a
//      slot on every node.
//   3. New chains go to the V least-loaded nodes; ties break on the service name, so the same
//      ledger always yields the same assignment (a rollout that cannot be replayed cannot be
//      audited).
//   4. Refusal happens HERE, before any P-Chain fee is paid, and names the nodes at capacity.
//
// ═══ WHAT IT DOES NOT DECIDE ═══
//
// Which node serves public RPC for a chain (P-86, the router contract), and how the V validators
// get registered on the P-Chain (P-84). Both consume this module's answer; neither changes it.

/**
 * The validators of one ledger record. A record without `validators` predates assignment and
 * means every node. A malformed key is an error, never an empty list: an empty list would read
 * as "no node carries this chain" and free every slot it holds.
 *
 * @param {{ validators?: unknown, name?: string }} chain
 * @param {string[]} nodes  every managed service name
 * @returns {string[]}
 */
export function validatorsOf(chain, nodes) {
  if (chain.validators === undefined) return [...nodes];
  if (!Array.isArray(chain.validators) || chain.validators.length === 0 ||
      !chain.validators.every((v) => typeof v === "string" && v.length > 0)) {
    throw new Error(`Chain "${chain.name}" carries a malformed validators list; the ledger must be repaired by hand.`);
  }
  return [...chain.validators];
}

/**
 * Chains per node, for every node in `nodes` (0 for an idle node). Validators named by a record
 * but absent from `nodes` are counted under their own name too, so a node that vanished from
 * compose is visible as a load the operator must resolve, not silently dropped.
 *
 * @param {Array<{ validators?: string[], name?: string }>} chains  the LIVE chains only
 * @param {string[]} nodes
 * @returns {Map<string, number>}
 */
export function nodeLoad(chains, nodes) {
  const load = new Map(nodes.map((n) => [n, 0]));
  for (const chain of chains) {
    for (const v of validatorsOf(chain, nodes)) load.set(v, (load.get(v) ?? 0) + 1);
  }
  return load;
}

/**
 * Pick the validators for a NEW chain.
 *
 * @param {object} p
 * @param {string[]} p.nodes             managed service names (order irrelevant; ties use the name)
 * @param {Array<object>} p.chains       live ledger records
 * @param {number} p.perChain            V — validators per chain
 * @param {number} p.capPerNode          chains a node may carry (15 leaves one of the 16 spare)
 * @returns {{ validators: string[], load: Map<string, number> }}
 */
export function assignValidators({ nodes, chains, perChain, capPerNode }) {
  if (!Array.isArray(nodes) || nodes.length === 0) throw new Error("No managed nodes to assign validators from");
  if (new Set(nodes).size !== nodes.length) throw new Error("The managed node list contains a duplicate service name");
  if (!Number.isInteger(perChain) || perChain < 1) throw new Error("validators per chain must be a positive integer");
  if (!Number.isInteger(capPerNode) || capPerNode < 1) throw new Error("the per-node cap must be a positive integer");
  if (perChain > nodes.length) {
    throw new Error(`A1_L1_VALIDATORS_PER_CHAIN=${perChain} but only ${nodes.length} managed node(s) exist (${[...nodes].sort().join(", ")}). ` +
      `Lower it, or add nodes to the compose file.`);
  }
  const load = nodeLoad(chains, nodes);
  const free = nodes.filter((n) => load.get(n) < capPerNode).sort((a, b) => (load.get(a) - load.get(b)) || (a < b ? -1 : a > b ? 1 : 0));
  if (free.length < perChain) {
    const full = nodes.filter((n) => load.get(n) >= capPerNode).sort();
    throw new Error(
      `Cannot place a new chain on ${perChain} validator(s): only ${free.length} of ${nodes.length} managed node(s) have a free slot. ` +
      `At capacity (${capPerNode} chains each): ${full.join(", ")}. ` +
      `The 16-subnet handshake limit is the protocol's (network/peer/peer.go); revoke a chain on those nodes or add nodes.`);
  }
  return { validators: free.slice(0, perChain), load };
}

/**
 * The track list of EVERY node, from the ledger: `Map<service, subnetID[]>` (P-83). Pending
 * creations already accepted by the P-Chain are tracked by every node until they are recorded,
 * so a rollout for another chain never untracks them (creation-journal.mjs).
 *
 * @param {object} p
 * @param {Array<{ subnetID: string, validators?: string[] }>} p.chains  live records
 * @param {string[]} p.nodes
 * @param {string[]} [p.pendingSubnetIDs]
 * @returns {Map<string, string[]>}
 */
export function trackListsByNode({ chains, nodes, pendingSubnetIDs = [] }) {
  const lists = new Map(nodes.map((n) => [n, []]));
  for (const chain of chains) {
    for (const v of validatorsOf(chain, nodes)) {
      if (!lists.has(v)) lists.set(v, []);
      if (!lists.get(v).includes(chain.subnetID)) lists.get(v).push(chain.subnetID);
    }
  }
  for (const [, list] of lists) for (const s of pendingSubnetIDs) if (!list.includes(s)) list.push(s);
  return lists;
}
