#!/usr/bin/env node
/**
 * check-outsider-bootstrap.mjs — gate: **can a stranger's node actually bootstrap this network?**
 *
 * ═══ 🔴 WHY IT EXISTS ═══
 *
 * Staking requires bootstrap, bootstrap requires connecting to 80% of stake, and connecting
 * requires that the addresses the network HANDS OUT are addresses a stranger can dial. D-118b
 * measured what happens when they are not: an outside node reached the beacon, learned the other
 * eight by gossip, and was handed `172.28.0.x` — Docker's internal network. It could see roughly
 * 11% of stake, bootstrap wanted 80%, and there was no way out through configuration. A closed
 * loop, on a network whose every gate was green.
 *
 * The fix (`open-p2p-all-nodes.py`, D-089/D-118c) gives node N the host's public IPv4 and staking
 * port `9650+N`. It was applied on G-day. **Nothing measures that it is still true.** It is a
 * property of a running process, undone by any node recreated without those flags — and the
 * symptom is not an outage. The network stays green, the RPC stays fast, existing validators keep
 * validating, and only a stranger ever finds out, silently, alone, at the end of an afternoon.
 *
 * 🔴 **WHY THIS GATE ALMOST SHIPPED MEASURING THE WRONG FIELD.** `info.peers` returns TWO
 * addresses per peer and they routinely disagree — shape of one real row, with the server's
 * address written as the RFC 5737 documentation address because `check-single-source` owns the
 * real one and caught this file copying it (D-113, and it was right to):
 *
 *     ip        172.28.0.16:46696    the socket THIS node is connected on
 *     publicIP  203.0.113.9:9656     the signed claim that gets gossiped to strangers
 *
 * The first draft printed `ip`, saw eight private addresses, and was one sentence away from
 * reporting a network-wide outage that did not exist — the exact shape of the `testnet-a1` scare
 * (gotcha 9b) and of `check-robots`'s first red (D-106b). **`ip` is what the beacon sees;
 * `publicIP` is what a stranger gets.** Only the second one answers this question, and the
 * `--self-test` pins that with a fixture where the two disagree in each direction.
 *
 * ## WHAT IT MEASURES, AND WHERE (CLAUDE.md section 2)
 *
 * | Question | Measured by | Where |
 * |---|---|---|
 * | What addresses does the network hand a stranger? | `info.peers` → **`publicIP`** | THE RUNNING NODE |
 * | Can those addresses be dialled at all? | a TCP connect | **FROM OUTSIDE THE SERVER** |
 * | Is that enough stake to bootstrap? | `platform.getCurrentValidators` → `weight` | THE RUNNING CHAIN |
 *
 * 🔴 **BOTH DIRECTIONS.** Announced-but-closed is a firewall problem; open-but-unannounced is a
 * gossip problem; either one alone strands a stranger, and each looks fine to the check for the
 * other. The gate scores an address only when BOTH hold.
 *
 * 🔴 **WHERE IT RUNS IS PART OF THE MEASUREMENT.** A TCP probe from the server itself proves
 * nothing — it does not cross the firewall, and Docker does not hairpin, so a same-host container
 * cannot even dial the host's public IP (D-089). This gate is only meaningful run from a machine
 * that is not the server. It says so in its own output rather than assuming.
 *
 * ## 🔴 WHOSE PORTS (changed 2026-09-03, the evening the first outsider staked)
 *
 * The first guest validator ran behind NAT: connected OUTBOUND to the beacon, announced
 * `(guest validator IP, withheld):9651`, and nobody could dial it back. This gate scored "1 of 10 announced
 * addresses refuse a connection — FAIL", which is true of that address and false about the
 * question in the title: 99.99% of stake was dialable, and a stranger bootstraps fine. Red for a
 * reason that is not the gate's reason (D-153), and it would recur for every guest behind NAT —
 * i.e. for most home validators this project invites.
 *
 * ⇒ The "must be 100% open" rule applies to the FOUNDING SET — genesis `initialStakers`, the nodes
 *   this project runs and can fix (`local-net/lib/genesis-stakers.mjs`). Guests are dialled and
 *   listed, and they count toward stake coverage — which is the only number bootstrap actually
 *   gates on — but a closed guest port is reported, not scored: it is theirs to open, and the
 *   guide tells them why they would want to (uptime is measured over connections).
 *
 * ## HONEST FAILURE MODES — a gate about the network must not blame the network for itself
 *
 * If EVERY probe fails, the likeliest explanation is the prober's own connectivity, not nine
 * simultaneous firewall changes. That is scored **INCONCLUSIVE**, not FAIL. If some succeed and
 * some do not, the network is answering and the failures are real. This distinction is the whole
 * difference between a gate people trust and a gate people learn to skip (D-070).
 *
 * ## EXIT CODES (shared convention across the tool set)
 *
 *   0  PASS          — a stranger is handed reachable addresses covering enough stake
 *   1  FAIL          — they are not, so nobody outside can bootstrap, and therefore nobody can stake
 *   2  INCONCLUSIVE  — the node could not be asked, or this machine could not reach anything
 *
 * Usage:
 *   node scripts/check-outsider-bootstrap.mjs
 *   node scripts/check-outsider-bootstrap.mjs --self-test
 *   node scripts/check-outsider-bootstrap.mjs --rpc https://rpc-a1.9chain.org
 */
import net from "node:net";
import { request } from "../local-net/lib/chain-ledger.mjs";
import { genesisStakerIDs, partitionByFounding } from "../local-net/lib/genesis-stakers.mjs";

const ARGV = process.argv.slice(2);
const SELF_TEST = ARGV.includes("--self-test");

function argOf(flag) {
  const i = ARGV.indexOf(flag);
  return i >= 0 ? ARGV[i + 1] : null;
}

const RPC = argOf("--rpc") || process.env.A1_RPC_BASE || "https://rpc-a1.9chain.org";

/**
 * What avalanchego demands before it will consider itself bootstrapped.
 *
 * Not a number this project chose, and not one it can change from here — it is upstream's
 * threshold. Quoted rather than derived so that a reader can check it against upstream instead of
 * against this file.
 */
const BOOTSTRAP_STAKE_FRACTION = 0.8;

/* ══════════════════════════════════════════════════════════════════════════
   Pure assessments — every one of these is exercised by --self-test.
   ══════════════════════════════════════════════════════════════════════════ */

/** RFC1918 and loopback: the addresses that mean "only reachable from inside this host". */
export function isPrivateAddress(hostPort) {
  const host = String(hostPort ?? "").replace(/:\d+$/, "");
  return /^(10\.|127\.|0\.0\.0\.0|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)
    || host === "" || host === "::1";
}

/**
 * The address a stranger is handed for one peer.
 *
 * 🔴 `publicIP`, never `ip`. See the header: they disagree by design on a Docker network, and
 * reading the wrong one turns a healthy network into a reported outage.
 */
export function announcedAddress(peer) {
  const claimed = peer?.publicIP;
  if (!claimed) return { ok: false, why: "announces no public address at all — a stranger is handed nothing to dial" };
  if (isPrivateAddress(claimed)) return { ok: false, why: `announces ${claimed}, which is reachable only from inside the host (D-118b)` };
  return { ok: true, address: claimed };
}

/**
 * Does the reachable set carry enough stake?
 *
 * Weight, not headcount. Nine equally-weighted nodes make the two identical today and that is
 * exactly why it must not be written as a count: the day one node's stake changes, a headcount
 * silently stops measuring the thing bootstrap actually gates on.
 */
export function assessStakeCoverage(reachableWeight, totalWeight) {
  if (totalWeight === 0n) return { verdict: "inconclusive", why: "no validator weight could be read — unknown, not zero" };
  const pct = Number((reachableWeight * 10000n) / totalWeight) / 100;
  const need = BOOTSTRAP_STAKE_FRACTION * 100;
  if (pct >= need) return { verdict: "ok", why: `${pct.toFixed(2)}% of stake is dialable by a stranger (bootstrap needs ${need}%)` };
  return { verdict: "fail", why: `only ${pct.toFixed(2)}% of stake is dialable and bootstrap needs ${need}% — a stranger cannot sync, so a stranger cannot stake (D-118b)` };
}

/**
 * Turn probe results into a verdict, refusing to blame the network for this machine's own
 * connectivity.
 *
 * `attempted` counts addresses we tried to dial. All-failed is INCONCLUSIVE; a mix is real.
 */
export function assessReachability({ attempted, open }) {
  if (attempted === 0) return { verdict: "inconclusive", why: "no address was even announced, so nothing could be dialled" };
  if (open === 0) return { verdict: "inconclusive", why: `none of ${attempted} addresses answered — far more likely this machine's connectivity than ${attempted} simultaneous firewall changes` };
  if (open === attempted) return { verdict: "ok", why: `all ${attempted} announced addresses accept a TCP connection from outside the server` };
  return { verdict: "fail", why: `${attempted - open} of ${attempted} announced addresses refuse a connection — the network is answering, so these failures are real` };
}

/**
 * The junction: founders are scored, guests are reported. Tested as ONE function because the
 * defect of 2026-09-03 lived exactly here — each half was right and the join was wrong (D-171).
 *
 * `founders` / `guests` are `{ attempted, open }` tallies. The verdict is the founders' verdict;
 * the guests only change the sentence.
 */
export function assessDialability({ founders, guests }) {
  const verdict = assessReachability(founders);
  const guestNote = guests.attempted === 0
    ? ""
    : ` Guests: ${guests.open} of ${guests.attempted} announced address(es) dialable — ${guests.attempted - guests.open === 0
      ? "all open" : "the closed ones are theirs to open (NAT/firewall), and count only through stake coverage"}.`;
  return { verdict: verdict.verdict, why: `founding nodes: ${verdict.why}.${guestNote}` };
}

/* ══════════════════════════════════════════════════════════════════════════
   The run
   ══════════════════════════════════════════════════════════════════════════ */

async function rpc(pathname, method, params = {}) {
  const res = await request(`${RPC}${pathname}`, { method: "POST", payload: { jsonrpc: "2.0", id: 1, method, params } });
  return JSON.parse(res.body)?.result ?? null;
}

/** A plain TCP connect. Not a handshake: this asks whether the door opens, nothing more. */
export function probe(hostPort, timeoutMs = 6000) {
  return new Promise((resolve) => {
    const [host, port] = [hostPort.replace(/:\d+$/, ""), Number(hostPort.match(/:(\d+)$/)?.[1])];
    if (!host || !Number.isInteger(port)) return resolve({ open: false, why: `unparsable address ${hostPort}` });
    const socket = net.connect({ host, port });
    const finish = (open, why) => { socket.destroy(); resolve({ open, why }); };
    socket.setTimeout(timeoutMs);
    socket.on("connect", () => finish(true, "open"));
    socket.on("timeout", () => finish(false, "timed out"));
    socket.on("error", (e) => finish(false, e.code || "error"));
  });
}

async function tryTo(fn) {
  try { return await fn(); } catch { return null; }
}

async function main() {
  if (SELF_TEST) return selfTest();

  console.log(`\n══ OUTSIDER BOOTSTRAP — the addresses a stranger is handed, dialled from THIS machine ══`);
  console.log(`   asking ${RPC}; this measurement is only meaningful because this machine is not the server\n`);

  const peers = await tryTo(async () => (await rpc("/ext/info", "info.peers"))?.peers ?? null);
  const selfId = await tryTo(async () => (await rpc("/ext/info", "info.getNodeID"))?.nodeID ?? null);
  const validators = await tryTo(async () => (await rpc("/ext/bc/P", "platform.getCurrentValidators"))?.validators ?? null);

  if (!Array.isArray(peers) || !Array.isArray(validators)) {
    console.log("  ⚪ the node could not be asked for its peers or its validator set — unknown, not a pass\n");
    return 2;
  }

  let worst = 0;
  const say = (a, label) => {
    const mark = a.verdict === "ok" ? "  ✓" : a.verdict === "inconclusive" ? "  ⚪" : "  🔴";
    console.log(`${mark} ${label}\n       ${a.why}`);
    worst = Math.max(worst, a.verdict === "ok" ? 0 : a.verdict === "inconclusive" ? 2 : 1);
    return a;
  };

  /**
   * 🔴 The node being asked never appears in its own peer list, and it is a validator like any
   * other. Leaving it out would under-count stake by its own weight and could redden a healthy
   * network; counting it as reachable without dialling it would be a free pass. It is dialled
   * like every other node, at the address it claims for itself.
   */
  const selfIp = await tryTo(async () => (await rpc("/ext/info", "info.getNodeIP"))?.ip ?? null);
  const members = [
    ...(selfId ? [{ nodeID: selfId, publicIP: selfIp, self: true }] : []),
    ...peers.map((p) => ({ nodeID: p.nodeID, publicIP: p.publicIP, socket: p.ip })),
  ];

  const weightOf = new Map(validators.map((v) => [v.nodeID, BigInt(v.weight ?? 0)]));
  const totalWeight = [...weightOf.values()].reduce((a, b) => a + b, 0n);

  // 🔴 Founders are scored, guests are reported — see the header. The founding set is read from
  // the tracked genesis and a missing artefact THROWS (exit 2), never "no founders".
  const founding = genesisStakerIDs();
  const { founders: founderRows, missingFounders } = partitionByFounding(members, founding);
  const isFounder = new Set(founderRows.map((m) => m.nodeID));

  const tally = { founders: { attempted: 0, open: 0 }, guests: { attempted: 0, open: 0 } };
  let reachableWeight = 0n;
  console.log("  node                                          announced          dialled");
  for (const m of members) {
    const a = announcedAddress(m);
    const role = isFounder.has(m.nodeID) ? "founders" : "guests";
    if (!a.ok) {
      console.log(`  ${m.nodeID}  🔴 ${a.why}`);
      continue;
    }
    tally[role].attempted++;
    const r = await probe(a.address);
    if (r.open) { tally[role].open++; reachableWeight += weightOf.get(m.nodeID) ?? 0n; }
    const tag = m.self ? "   (the node we asked)" : role === "guests" ? "   (guest — not in genesis)" : "";
    console.log(`  ${String(m.nodeID).padEnd(45)} ${a.address.padEnd(22)} ${r.open ? "open" : `${role === "guests" ? "⚪" : "🔴"} ${r.why}`}${tag}`);
  }
  if (missingFounders.length) {
    console.log(`  ⚪ founding node(s) not in the peer list of the node asked: ${missingFounders.join(", ")}`);
  }
  console.log();

  // Announcing a private address is a founders' defect by construction: it is what
  // `open-p2p-all-nodes.py` sets, and a guest's claim is whatever they configured.
  const founderAnnounced = founderRows.filter((m) => announcedAddress(m).ok).length;
  say(founderAnnounced === founderRows.length
    ? { verdict: "ok", why: `all ${founderRows.length} founding nodes announce a routable address, not a Docker-internal one (${members.length - founderRows.length} guest(s) listed above)` }
    : { verdict: "fail", why: `${founderRows.length - founderAnnounced} of ${founderRows.length} founding nodes announce only an internal address — a stranger is gossiped an address they cannot dial (D-118b)` },
  "the network hands strangers routable addresses");

  say(assessDialability(tally), "those addresses accept a connection from outside");
  say(assessStakeCoverage(reachableWeight, totalWeight), "that is enough stake to bootstrap");

  console.log(`\n${worst === 0 ? "✅ PASS" : worst === 2 ? "⚪ INCONCLUSIVE" : "🔴 FAIL"} — a stranger `
    + `${worst === 0 ? "can" : "may not be able to"} bootstrap, which is the precondition for staking\n`);
  return worst;
}

/* ══════════════════════════════════════════════════════════════════════════
   Reverse controls
   ══════════════════════════════════════════════════════════════════════════ */
function selfTest() {
  let pass = 0, fail = 0;
  const ok = (label, got, want) => {
    if (got === want) { pass++; console.log(`  ✓ ${label}`); }
    else { fail++; console.log(`  ✗ ${label} — wanted ${want}, got ${got}`); }
  };

  console.log("══ REVERSE CONTROLS — check-outsider-bootstrap ══");

  console.log("\n── 🔴 `ip` vs `publicIP`: the field this gate nearly measured by mistake ──");
  ok("🔴 THE TRAP — a private socket `ip` with a PUBLIC `publicIP` is FINE, that is normal Docker",
    announcedAddress({ ip: "172.28.0.16:46696", publicIP: "203.0.113.9:9656" }).ok, true);
  ok("🔴 THE REAL DEFECT — a public socket `ip` with a PRIVATE `publicIP` FAILS, because the claim is what is gossiped",
    announcedAddress({ ip: "203.0.113.9:9656", publicIP: "172.28.0.16:9656" }).ok, false);
  ok("🔴 no claim at all fails — a stranger is handed nothing to dial",
    announcedAddress({ ip: "172.28.0.16:46696" }).ok, false);
  ok("a routable claim passes", announcedAddress({ publicIP: "95.217.60.140:9651" }).ok, true);

  console.log("\n── which addresses mean `inside this host only` ──");
  for (const a of ["172.28.0.16:9651", "10.0.0.1:9651", "192.168.1.9:9651", "127.0.0.1:9651", "0.0.0.0:9651", "169.254.1.1:9651"]) {
    ok(`🔴 ${a} is not reachable by a stranger`, isPrivateAddress(a), true);
  }
  ok("203.0.113.9:9651 is", isPrivateAddress("203.0.113.9:9651"), false);
  ok("🔴 172.32.x is NOT private — the RFC1918 block ends at 172.31", isPrivateAddress("172.32.0.1:9651"), false);
  ok("🔴 172.15.x is NOT private either — it starts at 172.16", isPrivateAddress("172.15.0.1:9651"), false);
  ok("an empty address counts as unreachable rather than throwing", isPrivateAddress(""), true);

  console.log("\n── reachability: refuse to blame the network for this machine's own connectivity ──");
  ok("everything open passes", assessReachability({ attempted: 9, open: 9 }).verdict, "ok");
  ok("🔴 a partial failure is REAL — the network is answering, so the closed ones are closed",
    assessReachability({ attempted: 9, open: 8 }).verdict, "fail");
  ok("🔴 EVERYTHING failing is INCONCLUSIVE, not nine simultaneous firewall changes",
    assessReachability({ attempted: 9, open: 0 }).verdict, "inconclusive");
  ok("nothing announced ⇒ inconclusive here, and the announce check is what reddens",
    assessReachability({ attempted: 0, open: 0 }).verdict, "inconclusive");

  console.log("\n── 🔴 founders are scored, guests are reported — the join, not the halves (D-171) ──");
  // The shape measured 2026-09-03: nine founders open, one guest behind NAT. Before this change
  // the gate said FAIL; a stranger could bootstrap the whole time.
  const natGuest = assessDialability({ founders: { attempted: 9, open: 9 }, guests: { attempted: 1, open: 0 } });
  ok("🔴 THE 2026-09-03 SHAPE — 9/9 founders open, 1 guest behind NAT ⇒ PASSES", natGuest.verdict, "ok");
  ok("… and the sentence says the guest port is theirs to open", /theirs to open/.test(natGuest.why), true);
  ok("🔴 a FOUNDER closed still FAILS, however many guests are open",
    assessDialability({ founders: { attempted: 9, open: 8 }, guests: { attempted: 3, open: 3 } }).verdict, "fail");
  ok("🔴 every founder closed is INCONCLUSIVE even when a guest answers — that is this machine, not nine firewalls",
    assessDialability({ founders: { attempted: 9, open: 0 }, guests: { attempted: 1, open: 1 } }).verdict, "inconclusive");
  ok("no guests ⇒ the founders' verdict, no guest sentence",
    /Guests/.test(assessDialability({ founders: { attempted: 9, open: 9 }, guests: { attempted: 0, open: 0 } }).why), false);
  const F = new Set(["NodeID-A", "NodeID-B"]);
  const split = partitionByFounding([{ nodeID: "NodeID-A" }, { nodeID: "NodeID-GUEST" }], F);
  ok("partition: a genesis staker is a founder", split.founders.length, 1);
  ok("partition: anyone else is a guest", split.guests.length, 1);
  ok("🔴 partition: a founder ABSENT from the peer list is NAMED — absence is what a filter cannot show",
    split.missingFounders.join(","), "NodeID-B");

  console.log("\n── stake coverage: WEIGHT, never headcount ──");
  const W = (n) => BigInt(n) * 999_999_000_000_000n;
  ok("9 of 9 passes", assessStakeCoverage(W(9), W(9)).verdict, "ok");
  ok("🔴 the D-118b shape — 1 of 9 is ~11% and FAILS", assessStakeCoverage(W(1), W(9)).verdict, "fail");
  ok("🔴 the G-day shape D-126 warned about — 2 of 9 is ~22% and still FAILS", assessStakeCoverage(W(2), W(9)).verdict, "fail");
  ok("🔴 7 of 9 is 77.8%, just under the bar, and FAILS", assessStakeCoverage(W(7), W(9)).verdict, "fail");
  ok("8 of 9 is 88.9% and passes", assessStakeCoverage(W(8), W(9)).verdict, "ok");
  ok("🔴 exactly 80% passes — the boundary is inclusive, as upstream has it",
    assessStakeCoverage(8n, 10n).verdict, "ok");
  ok("🔴 unequal weights are why this is not a headcount: 8 small nodes can be under the bar",
    assessStakeCoverage(8n, 100n).verdict, "fail");
  ok("🔴 an unreadable validator set is INCONCLUSIVE, never 0%", assessStakeCoverage(0n, 0n).verdict, "inconclusive");

  console.log(`\n${fail === 0 ? "✅" : "🔴"} ${pass} passed · ${fail} failed`);
  return fail === 0 ? 0 : 1;
}

main().then((code) => process.exit(code)).catch((e) => {
  console.error(`⚪ INCONCLUSIVE — the gate itself could not run: ${e.stack || e.message}`);
  process.exit(2);
});
