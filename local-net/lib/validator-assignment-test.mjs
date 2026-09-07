#!/usr/bin/env node
// validator-assignment-test.mjs — the pure assignment rules (P-82), against fixtures.
//
// Run: node local-net/lib/validator-assignment-test.mjs
//
// Every green case has a red counterpart: a placement that must be refused, a malformed record
// that must throw, a tie that must break the SAME way twice. The console-level proof (the record
// on disk carries `validators`, refusal happens before the CLI) lives in
// `console/assignment-e2e-test.mjs`.
import { assignValidators, nodeLoad, validatorsOf, trackListsByNode } from "./validator-assignment.mjs";

let pass = 0, fail = 0;
const ok = (label, cond, detail = "") => {
  if (cond) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; console.log(`  ✗ ${label}${detail ? `  — ${detail}` : ""}`); }
};
const throwsWith = (fn, re) => { try { fn(); return false; } catch (e) { return re.test(e.message); } };

const NODES = Array.from({ length: 9 }, (_, i) => `node-${i + 1}`);
const chain = (i, validators) => ({ name: `Chain ${i}`, subnetID: `S${i}`, chainId: 9001000000 + i, ...(validators ? { validators } : {}) });

console.log("═══ validator assignment — 9 nodes, cap 15 per node ═══");

console.log("\n── 1. legacy records mean EVERY node ──");
ok("a record without `validators` is carried by all nodes", validatorsOf(chain(1), NODES).length === 9);
ok("…and counts once on each of them", [...nodeLoad([chain(1)], NODES).values()].every((n) => n === 1));
ok("🔴 an EMPTY list is malformed, not 'no node' (it would free every slot)", throwsWith(() => validatorsOf(chain(1, []), NODES), /malformed validators list/));
ok("🔴 a non-string entry is malformed", throwsWith(() => validatorsOf(chain(1, ["node-1", 7]), NODES), /malformed validators list/));

console.log("\n── 2. placement: least-loaded first, ties by name ──");
{
  const a = assignValidators({ nodes: NODES, chains: [], perChain: 5, capPerNode: 15 });
  ok("empty ledger ⇒ the five lowest names", JSON.stringify(a.validators) === JSON.stringify(["node-1", "node-2", "node-3", "node-4", "node-5"]), a.validators.join(","));
  const b = assignValidators({ nodes: NODES, chains: [chain(1, a.validators)], perChain: 5, capPerNode: 15 });
  ok("second chain ⇒ the four idle nodes, then the lowest loaded name", JSON.stringify(b.validators) === JSON.stringify(["node-6", "node-7", "node-8", "node-9", "node-1"]), b.validators.join(","));
  const shuffled = [...NODES].reverse();
  const c = assignValidators({ nodes: shuffled, chains: [chain(1, a.validators)], perChain: 5, capPerNode: 15 });
  ok("the node list's ORDER does not change the answer (replayable)", JSON.stringify(c.validators) === JSON.stringify(b.validators), c.validators.join(","));
}

console.log("\n── 3. the arithmetic that gets past 15: 27 chains × 5 = 135 = 9 × 15 ──");
{
  const chains = [];
  let refusedAt = null;
  for (let i = 1; i <= 28; i++) {
    try { chains.push(chain(i, assignValidators({ nodes: NODES, chains, perChain: 5, capPerNode: 15 }).validators)); }
    catch (e) { refusedAt = { i, message: e.message }; break; }
  }
  const load = nodeLoad(chains, NODES);
  ok("27 chains fit: every node carries exactly 15", chains.length === 27 && [...load.values()].every((n) => n === 15), [...load.values()].join("/"));
  ok("🔴 the 28th is refused BEFORE placement, naming the full nodes", refusedAt?.i === 28 && /At capacity/.test(refusedAt.message) && refusedAt.message.includes("node-9"), refusedAt?.message.slice(0, 80));
  ok("the refusal cites the protocol wall, not a console number", /peer\.go/.test(refusedAt?.message ?? ""));
}

console.log("\n── 4. partial capacity: enough free nodes, or none of them ──");
{
  // node-1..node-5 full (15 legacy-free chains pinned to them), four idle nodes, V = 5 ⇒ refuse.
  const pinned = Array.from({ length: 15 }, (_, i) => chain(i + 1, ["node-1", "node-2", "node-3", "node-4", "node-5"]));
  ok("🔴 4 free nodes cannot host V=5", throwsWith(() => assignValidators({ nodes: NODES, chains: pinned, perChain: 5, capPerNode: 15 }), /only 4 of 9 managed node\(s\) have a free slot/));
  const four = assignValidators({ nodes: NODES, chains: pinned, perChain: 4, capPerNode: 15 });
  ok("CONTROL — V=4 lands exactly on the four idle nodes", JSON.stringify(four.validators) === JSON.stringify(["node-6", "node-7", "node-8", "node-9"]));
  // Legacy chains (every node) fill the whole fleet: with 15 of them nothing fits, V=1 included.
  const legacy = Array.from({ length: 15 }, (_, i) => chain(i + 1));
  ok("🔴 15 legacy chains fill every node — even V=1 is refused", throwsWith(() => assignValidators({ nodes: NODES, chains: legacy, perChain: 1, capPerNode: 15 }), /only 0 of 9/));
  ok("CONTROL — 14 legacy chains leave one slot everywhere", assignValidators({ nodes: NODES, chains: legacy.slice(0, 14), perChain: 9, capPerNode: 15 }).validators.length === 9);
}

console.log("\n── 5. inputs that must be refused loudly ──");
ok("🔴 V larger than the fleet", throwsWith(() => assignValidators({ nodes: NODES, chains: [], perChain: 10, capPerNode: 15 }), /only 9 managed node/));
ok("🔴 no nodes", throwsWith(() => assignValidators({ nodes: [], chains: [], perChain: 1, capPerNode: 15 }), /No managed nodes/));
ok("🔴 duplicate service name", throwsWith(() => assignValidators({ nodes: ["a", "a"], chains: [], perChain: 1, capPerNode: 15 }), /duplicate/));
ok("🔴 V = 0", throwsWith(() => assignValidators({ nodes: NODES, chains: [], perChain: 0, capPerNode: 15 }), /positive integer/));
ok("🔴 a validator named by a record but gone from compose is still COUNTED", nodeLoad([chain(1, ["ghost-node"])], NODES).get("ghost-node") === 1);

console.log("\n── 6. per-node track lists (P-83 consumes these) ──");
{
  const chains = [chain(1, ["node-1", "node-2"]), chain(2, ["node-2", "node-3"]), chain(3)];
  const lists = trackListsByNode({ chains, nodes: NODES, pendingSubnetIDs: ["PENDING"] });
  ok("node-2 tracks chains 1, 2, the legacy chain and the pending subnet", JSON.stringify(lists.get("node-2")) === JSON.stringify(["S1", "S2", "S3", "PENDING"]), JSON.stringify(lists.get("node-2")));
  ok("node-9 tracks only the legacy chain and the pending subnet", JSON.stringify(lists.get("node-9")) === JSON.stringify(["S3", "PENDING"]));
  ok("every node has an entry, idle ones included", lists.size === 9);
  ok("a pending subnet is on EVERY node (no rollout may untrack it)", [...lists.values()].every((l) => l.includes("PENDING")));
}

console.log(`\n${fail === 0 ? "✅" : "🔴"} ${pass} passed · ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
