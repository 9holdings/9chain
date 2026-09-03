/**
 * genesis-stakers.mjs — WHICH validators this project answers for. One place, no side effects.
 *
 * ═══ 🔴 WHY THIS FILE EXISTS ═══
 *
 * On 2026-09-03 the first outsider staked on g1. Two gates went red the same evening, and neither
 * red was about the network:
 *
 *   watch-network             "validators 10 (expected 9)"  and  "B-12 earliest expiry: 14 days"
 *   check-outsider-bootstrap  "1 of 10 announced addresses refuse a connection"
 *
 * The outsider had staked for 14 days — the exact example in `RUN-A-VALIDATOR.md` — from a node
 * behind NAT. Both gates had been written when "every validator" and "the nine nodes this project
 * runs" were the same set, and they quietly kept measuring the first while meaning the second.
 * B-12 is *"the network STOPS when the last founding node's term ends"*; a stranger's 14-day term
 * ending stops nothing. A stranger's closed port strands nobody as long as 80% of stake is
 * dialable. Red for a reason that is not the gate's reason is the D-153 shape, and every new
 * validator would have repeated it — the onboarding path this project invites people down would
 * redden its own preflight once per guest.
 *
 * ⇒ The population a gate holds this project responsible for is the FOUNDING SET: the
 *   `initialStakers` of the generation's genesis, read from the tracked artefact (D-158) rather
 *   than copied here. Everyone else is a guest — measured, reported, never a red on this side.
 *
 * ═══ WHAT IS DELIBERATELY NOT HERE ═══
 *
 * No list of NodeIDs. The genesis file is the single source (`check-single-source.mjs`, D-113),
 * and a re-genesis rewrites it; a copy here would describe the dead generation with a straight
 * face, which is exactly how `docs/ALLOCATION-PUBLIC.md` went wrong (D-150).
 *
 * No Hetzner special case. The tenth node this project may run (`docs/GDAY-NODE10-HETZNER.md`)
 * is not in genesis and will be scored as a guest until someone decides otherwise — in code, not
 * in a comment.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { A1_GEN } from "./chainid.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/** The tracked genesis of a generation — the bytes a stranger downloads (D-158). */
export function genesisArtefactPath(gen = A1_GEN) {
  return path.join(REPO_ROOT, "docs", "genesis", `genesis-g${gen}.json`);
}

/**
 * The founding validator set: NodeIDs of `initialStakers` in the tracked genesis.
 *
 * 🔴 THROWS when the artefact is missing or malformed. "I do not know who the founders are" must
 * never become "there are no founders" — that would score every founding node as a guest and
 * turn B-12 into a gate that can no longer go red (the D-153 shape, in the other direction).
 */
export function genesisStakerIDs(gen = A1_GEN) {
  const file = genesisArtefactPath(gen);
  const genesis = JSON.parse(readFileSync(file, "utf8"));
  const stakers = genesis?.initialStakers;
  if (!Array.isArray(stakers) || stakers.length === 0) {
    throw new Error(`${file} carries no initialStakers — the founding set is unknown, not empty`);
  }
  const ids = stakers.map((s) => s?.nodeID).filter((id) => typeof id === "string" && id.startsWith("NodeID-"));
  if (ids.length !== stakers.length) {
    throw new Error(`${file}: ${stakers.length - ids.length} of ${stakers.length} initialStakers carry no NodeID`);
  }
  return new Set(ids);
}

/**
 * Split a validator (or peer) list into the founders this project runs and the guests it does
 * not, and name every founder that is ABSENT — absence is the one thing a filter cannot show.
 *
 * Pure: takes `{ nodeID }` rows and a Set of founding IDs, touches nothing else.
 */
export function partitionByFounding(rows, foundingIDs) {
  const founders = [], guests = [];
  const seen = new Set();
  for (const row of rows ?? []) {
    const id = row?.nodeID;
    if (foundingIDs.has(id)) { founders.push(row); seen.add(id); }
    else guests.push(row);
  }
  const missingFounders = [...foundingIDs].filter((id) => !seen.has(id));
  return { founders, guests, missingFounders };
}
