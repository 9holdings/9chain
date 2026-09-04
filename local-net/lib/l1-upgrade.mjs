/**
 * l1-upgrade.mjs — GOVERNING AN L1 THAT ALREADY EXISTS, as pure functions (milestone L1-CUSTOM,
 * P-61 "enable a precompile AFTER genesis" and the owner-transfer check).
 *
 * ═══ WHAT A POST-GENESIS UPGRADE IS ═══
 *
 * A genesis is immutable, but subnet-evm reads a second file next to the chain's config —
 * `<chain-config-dir>/<blockchainID>/upgrade.json` (`avalanchego/config/config.go:56,1144`) —
 * and applies its `precompileUpgrades` at the block timestamps they name (`params/extras/
 * precompile_upgrade.go`). Every validator must carry the SAME file before the first of those
 * timestamps, which on this network means a rolling restart of all nine nodes. That is the
 * console's job; this file decides WHAT goes into the file and whether it is legal, and it does
 * so without a node, so it can be tested from both sides.
 *
 * ═══ THE RULES, AND WHERE EACH COMES FROM ═══
 *
 *   one key per entry                         precompile_upgrade.go:45-49
 *   timestamps monotonic across entries       precompile_upgrade.go:131  (equal OK for different keys)
 *   same key: strictly increasing             precompile_upgrade.go:140
 *   enable only what is disabled, and vice versa  precompile_upgrade.go:135 (`disable should be …`)
 *   cannot activate in the past               precompile_upgrade.go:245 ("cannot retroactively enable")
 *   the file must parse, or the chain does NOT START on that node — `plugin/evm/vm.go:544`
 *     returns from `parseGenesis`, the VM never initialises, the node's PRIMARY network is
 *     healthy all the while. A rollout that checks only P/X/C would march through nine nodes
 *     and leave the L1 dead on every one of them. ⇒ the rollout for an upgrade must check the
 *     CHAIN's own health check on each node (`health.health` tagged with the subnetID answers
 *     with a check keyed by the blockchainID — measured 2026-09-04).
 *
 * Project rules on top of Go's:
 *   • activation = now + at least MIN_LEAD_SECONDS. Nine nodes restart at ~33 s each (~5 min);
 *     an activation that arrives mid-rollout splits the validators into two rule sets = a fork.
 *     Fifteen minutes is three times the measured rollout.
 *   • FeeManager and Warp are NOT upgradable through this door. FeeManager is on for every
 *     chain and is how the owner governs fees — disabling it strands that; Warp is a network
 *     feature, not a per-owner choice.
 *   • only ONE pending (future) upgrade per precompile at a time. A second one before the first
 *     activates is legal to Go, but the owner would be signing under a state they cannot see yet.
 *   • the owner is the admin of anything enabled here (same hard rule as at genesis).
 *
 * ═══ OWNER TRANSFER — WHY THE CONSOLE ONLY *CHECKS* ═══
 *
 * On the chain, "the owner" is whoever holds the Admin role on the precompiles, and the current
 * admin can hand that over today with `setAdmin(new)` on each precompile (allowlist contract).
 * The console's ledger carries a separate `admin` string used to authorise revocation and shown
 * on `/chains/`. The console must never make that string SAY something the chain does not: so a
 * transfer in the ledger is accepted only after `readAllowList(new)` on FeeManager — and on every
 * enabled precompile — answers Admin (role 2, `allowlist/role.go:20`). Chain first, ledger second.
 *
 * Usage:
 *   node local-net/lib/l1-upgrade.mjs --self-test
 */
import { PRECOMPILE_KEYS, SELECTABLE_PRECOMPILES, REWARD_MODES } from "./l1-options.mjs";

export const MIN_LEAD_SECONDS = 15 * 60;
export const MAX_LEAD_SECONDS = 7 * 24 * 3600;
export const UPGRADABLE_PRECOMPILES = SELECTABLE_PRECOMPILES;   // nativeMinter · deployerAllowList · txAllowList · rewardManager
export const ACTIONS = Object.freeze(["enable", "disable"]);

/** `precompile/allowlist/role.go:18-21` */
export const ROLE = Object.freeze({ 0: "none", 1: "enabled", 2: "admin", 3: "manager" });
export const ADMIN_ROLE = 2;
/** `readAllowList(address)` — keccak256 of the signature, first 4 bytes; the self-test recomputes it. */
export const READ_ALLOWLIST_SELECTOR = "0xeb54dae1";
export const PRECOMPILE_ADDRESS = Object.freeze({
  deployerAllowList: "0x0200000000000000000000000000000000000000",
  nativeMinter: "0x0200000000000000000000000000000000000001",
  txAllowList: "0x0200000000000000000000000000000000000002",
  feeManager: "0x0200000000000000000000000000000000000003",
  rewardManager: "0x0200000000000000000000000000000000000004",
});

const KEY_TO_NAME = Object.fromEntries(Object.entries(PRECOMPILE_KEYS).map(([n, k]) => [k, n]));
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function keyOf(entry) {
  const keys = Object.keys(entry ?? {});
  if (keys.length !== 1) throw new Error(`upgrade entry must have exactly one key, got ${keys.length} (${keys.join(", ")})`);
  return keys[0];
}
function tsOf(cfg, where) {
  const t = cfg?.blockTimestamp;
  if (t === undefined || t === null) throw new Error(`${where}: blockTimestamp cannot be nil`);
  if (!Number.isSafeInteger(Number(t)) || Number(t) < 0) throw new Error(`${where}: blockTimestamp must be a non-negative integer (got ${JSON.stringify(t)})`);
  return Number(t);
}

/**
 * Which precompiles are ON at time `at`, reading genesis config + the upgrade list the way the
 * node does (`GetActivePrecompileConfig`: last config whose timestamp ≤ at wins).
 * `chainConfig` is what `eth_getChainConfig` returns (its `upgrades.precompileUpgrades` is
 * ignored here — pass the upgrade list explicitly so the caller decides which list is truth).
 */
export function activePrecompiles(chainConfig, upgrades, at) {
  const out = {};
  for (const name of Object.keys(PRECOMPILE_KEYS)) {
    const key = PRECOMPILE_KEYS[name];
    const g = chainConfig?.[key];
    let enabled = false, since = null, everConfigured = false, pending = null;
    if (g && g.blockTimestamp !== undefined && g.blockTimestamp !== null) {
      everConfigured = true;
      if (Number(g.blockTimestamp) <= at) { enabled = !g.disable; since = Number(g.blockTimestamp); }
    }
    for (const entry of upgrades ?? []) {
      if (keyOf(entry) !== key) continue;
      const cfg = entry[key];
      const t = tsOf(cfg, key);
      everConfigured = true;
      if (t <= at) { enabled = !cfg.disable; since = t; pending = null; }
      else if (pending === null) pending = { at: t, disable: !!cfg.disable };
    }
    out[name] = { enabled, since, everConfigured, pending };
  }
  return out;
}

/**
 * Port of `ChainConfig.verifyPrecompileUpgrades` (precompile_upgrade.go:79-157) for the
 * structure rules, plus RewardManager's own `InitialRewardConfig.Verify` (config.go:32-39).
 * Run on the WHOLE list that will be written — existing entries included — so a file that was
 * hand-edited on disk is caught before it is extended.
 */
export function verifyPrecompileUpgrades(chainConfig, upgrades) {
  const last = new Map();   // key -> { blockTimestamp, disabled }
  for (const key of Object.values(PRECOMPILE_KEYS)) {
    const g = chainConfig?.[key];
    if (g && g.blockTimestamp !== undefined && g.blockTimestamp !== null) last.set(key, { blockTimestamp: Number(g.blockTimestamp), disabled: false });
  }
  let previous = null;
  (upgrades ?? []).forEach((entry, i) => {
    const key = keyOf(entry);
    if (!KEY_TO_NAME[key]) throw new Error(`unknown precompile config: ${key} (PrecompileUpgrade at [${i}])`);
    const cfg = entry[key];
    const t = tsOf(cfg, `PrecompileUpgrade (${key}) at [${i}]`);
    const prior = last.get(key);
    const disabled = prior ? prior.disabled : true;
    if (previous !== null && t < previous) {
      throw new Error(`precompile upgrade config block timestamp must be greater than or equal to previous timestamp: PrecompileUpgrade (${key}) at [${i}] has timestamp ${t}, previous timestamp ${previous}`);
    }
    if (disabled === !!cfg.disable) {
      throw new Error(`precompile upgrade disable value is invalid: PrecompileUpgrade (${key}) at [${i}], disable should be ${!disabled}`);
    }
    if (prior && t <= prior.blockTimestamp) {
      throw new Error(`precompile upgrade config block timestamp for same key must be strictly greater than previous timestamp: PrecompileUpgrade (${key}) at [${i}] has timestamp ${t}, previous timestamp of same key ${prior.blockTimestamp}`);
    }
    if (!cfg.disable) {
      if (!Array.isArray(cfg.adminAddresses) || cfg.adminAddresses.length === 0) {
        // Go would accept an allowlist precompile with no admin — and the owner could then never
        // touch it. The project rule is stricter than the node's on purpose.
        throw new Error(`PrecompileUpgrade (${key}) at [${i}] enables a precompile with no adminAddresses — nobody could ever govern it`);
      }
      if (key === PRECOMPILE_KEYS.rewardManager && cfg.initialRewardConfig) {
        const r = cfg.initialRewardConfig;
        if (r.allowFeeRecipients && r.rewardAddress && r.rewardAddress.toLowerCase() !== ZERO_ADDRESS) {
          throw new Error("cannot enable both fee recipients and reward address (rewardmanager/config.go:34)");
        }
      }
    }
    last.set(key, { blockTimestamp: t, disabled: !!cfg.disable });
    previous = t;
  });
  return true;
}

/** The activation moment: now + lead, rounded UP to a whole minute so it reads cleanly. */
export function pickActivation(nowSeconds, leadSeconds = MIN_LEAD_SECONDS) {
  return Math.ceil((nowSeconds + leadSeconds) / 60) * 60;
}

/**
 * Build ONE new upgrade entry. `rewardManager` (only for that precompile, only on enable) takes
 * the same shape as at genesis: "burn" | "allowFeeRecipients" | { mode: "rewardAddress", rewardAddress }.
 */
export function buildUpgradeEntry({ precompile, action, admin, activateAt, rewardManager }, parseAddr) {
  if (!UPGRADABLE_PRECOMPILES.includes(precompile)) {
    const near = Object.keys(PRECOMPILE_KEYS).find((n) => n.toLowerCase() === String(precompile).toLowerCase());
    if (near === "feeManager") throw new Error("feeManager cannot be changed through an upgrade: it is on for every chain and it is how the owner governs fees.");
    if (near === "warp") throw new Error("warp cannot be changed through an upgrade: it is a network feature, on from the template.");
    throw new Error(`precompile must be one of ${UPGRADABLE_PRECOMPILES.join(", ")} (got ${JSON.stringify(precompile)})` + (near ? ` — did you mean "${near}"?` : ""));
  }
  if (!ACTIONS.includes(action)) throw new Error(`action must be "enable" or "disable" (got ${JSON.stringify(action)})`);
  if (!Number.isSafeInteger(activateAt) || activateAt <= 0) throw new Error(`activateAt must be a unix timestamp in seconds (got ${activateAt})`);
  const key = PRECOMPILE_KEYS[precompile];
  if (action === "disable") {
    if (rewardManager !== undefined && rewardManager !== null) throw new Error("rewardManager options only apply when enabling.");
    return { [key]: { blockTimestamp: activateAt, disable: true } };
  }
  if (typeof parseAddr !== "function") throw new Error("buildUpgradeEntry: parseAddr is required");
  const owner = parseAddr(admin, "chain owner");
  const cfg = { blockTimestamp: activateAt, adminAddresses: [owner] };
  if (precompile === "rewardManager") {
    const rm = rewardManager ?? "burn";
    let mode, rewardAddress;
    if (typeof rm === "string") mode = rm;
    else if (rm && typeof rm === "object" && !Array.isArray(rm)) { mode = rm.mode; rewardAddress = rm.rewardAddress; }
    else throw new Error(`rewardManager must be one of ${REWARD_MODES.join("/")} or { mode, rewardAddress }.`);
    if (!REWARD_MODES.includes(mode)) throw new Error(`rewardManager: unknown mode ${JSON.stringify(mode)} — one of ${REWARD_MODES.join(", ")}.`);
    if (mode === "allowFeeRecipients") {
      if (rewardAddress) throw new Error("rewardManager: allowFeeRecipients and a rewardAddress cannot both be set (subnet-evm ErrCannotEnableBothRewards).");
      cfg.initialRewardConfig = { allowFeeRecipients: true };
    } else if (mode === "rewardAddress") {
      if (String(rewardAddress ?? "").trim().toLowerCase() === ZERO_ADDRESS) throw new Error("rewardManager.rewardAddress: the zero address means 'disable rewards' to subnet-evm — use mode \"burn\" for that.");
      cfg.initialRewardConfig = { allowFeeRecipients: false, rewardAddress: parseAddr(rewardAddress, "rewardManager.rewardAddress") };
    }
  } else if (rewardManager !== undefined && rewardManager !== null) {
    throw new Error(`rewardManager options only apply to the rewardManager precompile, not to ${precompile}.`);
  }
  return { [key]: cfg };
}

/**
 * The whole decision for one upgrade request, with no side effects.
 *
 * @param chainConfig       what `eth_getChainConfig` returned for the chain (genesis truth)
 * @param existingUpgrades  the `precompileUpgrades` list already on disk for this chain (or [])
 * @param nowSeconds        the console's clock
 * @returns { activateAt, entry, upgradeConfig, before, after, description }
 */
export function planUpgrade({ chainConfig, existingUpgrades, precompile, action, admin, rewardManager, nowSeconds, leadSeconds }, parseAddr) {
  if (!chainConfig || typeof chainConfig !== "object") throw new Error("planUpgrade: chainConfig is required (from eth_getChainConfig)");
  if (!Array.isArray(existingUpgrades)) throw new Error("planUpgrade: existingUpgrades must be a list (empty when there is no upgrade.json yet)");
  if (!Number.isSafeInteger(nowSeconds) || nowSeconds <= 0) throw new Error("planUpgrade: nowSeconds is required");
  const lead = leadSeconds ?? MIN_LEAD_SECONDS;
  if (lead < MIN_LEAD_SECONDS || lead > MAX_LEAD_SECONDS) {
    throw new Error(`lead time must be between ${MIN_LEAD_SECONDS} s (${MIN_LEAD_SECONDS / 60} min — three times a nine-node rollout) and ${MAX_LEAD_SECONDS} s (7 days); got ${lead}.`);
  }
  // The file already on disk must be legal before it is extended.
  verifyPrecompileUpgrades(chainConfig, existingUpgrades);

  const before = activePrecompiles(chainConfig, existingUpgrades, nowSeconds);
  // `buildUpgradeEntry` validates precompile/action; call it first so a typo is the FIRST refusal.
  let activateAt = pickActivation(nowSeconds, lead);
  for (const e of existingUpgrades) activateAt = Math.max(activateAt, tsOf(e[keyOf(e)], keyOf(e)));   // monotonic across keys
  const entry = buildUpgradeEntry({ precompile, action, admin, activateAt, rewardManager }, parseAddr);

  const state = before[precompile];
  if (state.pending) {
    throw new Error(
      `${precompile} already has an upgrade scheduled (${state.pending.disable ? "disable" : "enable"} at ${new Date(state.pending.at * 1000).toISOString()}). ` +
      `Wait for it to activate before scheduling another — an owner should not sign under a state they cannot see yet.`);
  }
  if (action === "enable" && state.enabled) {
    throw new Error(`${precompile} is already enabled${state.since === 0 ? " since genesis" : ` since ${new Date(state.since * 1000).toISOString()}`} — nothing to enable.`);
  }
  if (action === "disable" && !state.enabled) {
    throw new Error(`${precompile} is not enabled on this chain — nothing to disable.`);
  }
  // Same key strictly greater than its last timestamp — only reachable when a same-key entry sits
  // at the activation minute; nudge by one minute rather than refuse.
  const lastSame = [...existingUpgrades].reverse().find((e) => keyOf(e) === PRECOMPILE_KEYS[precompile]);
  if (lastSame && tsOf(lastSame[keyOf(lastSame)], "same key") >= activateAt) {
    activateAt = tsOf(lastSame[keyOf(lastSame)], "same key") + 60;
    entry[PRECOMPILE_KEYS[precompile]].blockTimestamp = activateAt;
  }

  const upgrades = [...existingUpgrades, entry];
  verifyPrecompileUpgrades(chainConfig, upgrades);   // the last line before the file exists
  const after = activePrecompiles(chainConfig, upgrades, activateAt);
  return {
    activateAt,
    activateAtIso: new Date(activateAt * 1000).toISOString(),
    entry,
    upgradeConfig: { precompileUpgrades: upgrades },
    before, after,
    description: describeUpgrade({ precompile, action, activateAt, admin, entry, before, after }),
  };
}

export function describeUpgrade({ precompile, action, activateAt, admin, entry, before, after }) {
  const when = new Date(activateAt * 1000).toISOString();
  const will = [], wont = [], facts = [];
  facts.push(`${action === "enable" ? "Enable" : "Disable"} ${precompile} at ${when} (unix ${activateAt}).`);
  facts.push("Every one of the network's nine validators restarts once, one after another (~5 minutes), and must carry the new file before that moment.");
  const on = Object.entries(after).filter(([, v]) => v.enabled).map(([n]) => n);
  facts.push(`Precompiles ON after activation: ${on.join(", ") || "(none besides FeeManager/Warp)"}.`);
  if (action === "enable") {
    will.push(`${admin} becomes the admin of ${precompile}.`);
    if (precompile === "nativeMinter") { will.push("The owner can mint more native token — the supply stops being fixed."); }
    if (precompile === "deployerAllowList") { will.push("Only the owner, and addresses the owner approves, can deploy contracts from that moment."); wont.push("A wallet not approved cannot deploy contracts after activation."); }
    if (precompile === "txAllowList") { will.push("Only the owner, and addresses the owner approves, can SEND transactions from that moment."); wont.push("Every other wallet — including today's users — cannot send any transaction after activation until the owner approves it."); }
    if (precompile === "rewardManager") {
      const r = entry[PRECOMPILE_KEYS.rewardManager].initialRewardConfig;
      if (!r) will.push("Fees keep being burned; the owner can redirect them later through RewardManager.");
      else if (r.allowFeeRecipients) will.push("Validators keep the fees of the blocks they produce.");
      else will.push(`All transaction fees go to ${r.rewardAddress}.`);
    }
  } else {
    will.push(`${precompile} stops existing on the chain at activation; calls to its address revert.`);
    if (precompile === "txAllowList") will.push("Anyone can send transactions again.");
    if (precompile === "deployerAllowList") will.push("Anyone can deploy contracts again.");
    if (precompile === "nativeMinter") wont.push("Nobody can mint any more; the supply is fixed at whatever it is at activation.");
    if (precompile === "rewardManager") will.push("Fees are burned again.");
  }
  wont.push("The timestamp cannot be moved once the file is on the validators; a mistake is undone by a SECOND upgrade, never by editing this one.");
  wont.push("Nothing here changes the genesis: chain ID, name and the original allocation stay as they are.");
  return { facts, will, wont, before: Object.fromEntries(Object.entries(before).map(([k, v]) => [k, v.enabled])), after: Object.fromEntries(Object.entries(after).map(([k, v]) => [k, v.enabled])) };
}

// ─────────────────────────────────────────────────────────────────────────────
// Owner transfer — the on-chain check
// ─────────────────────────────────────────────────────────────────────────────

/** `eth_call` data for `readAllowList(address)` on any allowlist precompile. */
export function encodeReadAllowList(address) {
  if (!/^0x[0-9a-fA-F]{40}$/.test(String(address || ""))) throw new Error(`encodeReadAllowList: not an address (${address})`);
  return READ_ALLOWLIST_SELECTOR + address.slice(2).toLowerCase().padStart(64, "0");
}

/** The role word from an `eth_call` result. Anything unexpected is an error, never "none". */
export function decodeRole(hex) {
  if (typeof hex !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(hex)) throw new Error(`decodeRole: expected a 32-byte hex word, got ${JSON.stringify(hex)}`);
  const n = Number(BigInt(hex));
  if (!(n in ROLE)) throw new Error(`decodeRole: unknown role ${n}`);
  return { code: n, name: ROLE[n] };
}

/**
 * Given the MEASURED roles of the proposed new owner on FeeManager and on every precompile that
 * is enabled right now, decide whether the ledger may follow. Pure: the caller does the eth_calls.
 *
 * @param roles  { feeManager: {code,name}, [enabledPrecompileName]: {code,name}, … }
 */
export function ownerTransferVerdict({ newAdmin, currentAdmin, roles }) {
  if (String(newAdmin).toLowerCase() === String(currentAdmin).toLowerCase()) {
    return { ok: false, why: `${newAdmin} is already the recorded owner.` };
  }
  const missing = Object.entries(roles).filter(([, r]) => r?.code !== ADMIN_ROLE).map(([name, r]) => `${name} (role: ${r?.name ?? "?"})`);
  if (missing.length) {
    return {
      ok: false,
      why: `${newAdmin} is not yet Admin on: ${missing.join(", ")}. The current owner must call setAdmin(${newAdmin}) on each of those precompiles first — ` +
           `the ledger follows the chain, it does not lead it.`,
      missing,
    };
  }
  return { ok: true, why: `${newAdmin} holds the Admin role on ${Object.keys(roles).join(", ")}.` };
}

// ═══════════════════════════════════════════════════════════════════════════
// Reverse controls
// ═══════════════════════════════════════════════════════════════════════════
if (process.argv[1]?.endsWith("l1-upgrade.mjs") && process.argv.includes("--self-test")) {
  const { parseEvmAddress, keccak256 } = await import("./eip55.mjs");
  let pass = 0, fail = 0;
  const ok = (label, cond, detail = "") => { if (cond) { pass++; console.log(`  ✓ ${label}`); } else { fail++; console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`); } };
  const throwsWith = (label, fn, fragment) => {
    try { const v = fn(); ok(label, false, `did not throw (returned ${JSON.stringify(v)})`); }
    catch (e) { ok(label, String(e.message).includes(fragment), `message was: ${e.message}`); }
  };
  const A = "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC";
  const B = "0x1212b2445e74f788B30BfA9C42aa46f252345a0B";
  const P = parseEvmAddress;
  const NOW = 1_800_000_000;   // 2027-01-15, any fixed instant
  // A genesis as `eth_getChainConfig` returns it: FeeManager + Warp on, nativeMinter on since genesis.
  const GEN = { chainId: 9001000009, feeConfig: {}, feeManagerConfig: { adminAddresses: [A.toLowerCase()], blockTimestamp: 0 },
    warpConfig: { blockTimestamp: 1607144400, quorumNumerator: 67 }, contractNativeMinterConfig: { adminAddresses: [A.toLowerCase()], blockTimestamp: 0 } };

  console.log("══ REVERSE CONTROLS — l1-upgrade ══\n");
  console.log("── selector + roles ──");
  {
    const sel = "0x" + Buffer.from(keccak256(new TextEncoder().encode("readAllowList(address)"))).toString("hex").slice(0, 8);
    ok("🔴 READ_ALLOWLIST_SELECTOR is keccak('readAllowList(address)')[0:4], recomputed", sel === READ_ALLOWLIST_SELECTOR, sel);
    ok("encodeReadAllowList pads the address to 32 bytes", encodeReadAllowList(A) === READ_ALLOWLIST_SELECTOR + "000000000000000000000000" + A.slice(2).toLowerCase());
    ok("decodeRole 2 = admin (the value measured live on SBull Chain)", decodeRole("0x" + "0".repeat(63) + "2").name === "admin");
    ok("decodeRole 0 = none", decodeRole("0x" + "0".repeat(64)).name === "none");
    throwsWith("🔴 an unknown role is an error, not 'none'", () => decodeRole("0x" + "0".repeat(63) + "9"), "unknown role");
    throwsWith("🔴 a short word is an error", () => decodeRole("0x02"), "32-byte");
  }

  console.log("\n── activePrecompiles ──");
  {
    const s = activePrecompiles(GEN, [], NOW);
    ok("genesis precompile is on since 0; the others off", s.nativeMinter.enabled && s.nativeMinter.since === 0 && !s.txAllowList.enabled && !s.rewardManager.enabled);
    ok("feeManager + warp reported on", s.feeManager.enabled && s.warp.enabled);
    const up = [{ txAllowListConfig: { blockTimestamp: NOW - 100, adminAddresses: [A] } }, { contractNativeMinterConfig: { blockTimestamp: NOW + 900, disable: true } }];
    const t = activePrecompiles(GEN, up, NOW);
    ok("a past upgrade is applied; a future one is reported as pending", t.txAllowList.enabled && t.txAllowList.since === NOW - 100 && t.nativeMinter.enabled && t.nativeMinter.pending?.disable === true);
    ok("…and at activation the pending disable has taken effect", activePrecompiles(GEN, up, NOW + 900).nativeMinter.enabled === false);
  }

  console.log("\n── verifyPrecompileUpgrades — port of precompile_upgrade.go ──");
  ok("empty list passes", verifyPrecompileUpgrades(GEN, []) === true);
  ok("enable a disabled one, then disable it later: passes",
    verifyPrecompileUpgrades(GEN, [{ txAllowListConfig: { blockTimestamp: 10, adminAddresses: [A] } }, { txAllowListConfig: { blockTimestamp: 20, disable: true } }]) === true);
  throwsWith("🔴 enabling what genesis already enables", () => verifyPrecompileUpgrades(GEN, [{ contractNativeMinterConfig: { blockTimestamp: 10, adminAddresses: [A] } }]), "disable should be true");
  throwsWith("🔴 disabling what is not enabled", () => verifyPrecompileUpgrades(GEN, [{ txAllowListConfig: { blockTimestamp: 10, disable: true } }]), "disable should be false");
  throwsWith("🔴 timestamps going backwards across keys", () => verifyPrecompileUpgrades(GEN, [{ txAllowListConfig: { blockTimestamp: 20, adminAddresses: [A] } }, { contractDeployerAllowListConfig: { blockTimestamp: 10, adminAddresses: [A] } }]), "greater than or equal to previous");
  ok("equal timestamps for DIFFERENT keys are fine", verifyPrecompileUpgrades(GEN, [{ txAllowListConfig: { blockTimestamp: 20, adminAddresses: [A] } }, { contractDeployerAllowListConfig: { blockTimestamp: 20, adminAddresses: [A] } }]) === true);
  throwsWith("🔴 same key, same timestamp", () => verifyPrecompileUpgrades(GEN, [{ txAllowListConfig: { blockTimestamp: 20, adminAddresses: [A] } }, { txAllowListConfig: { blockTimestamp: 20, disable: true } }]), "strictly greater");
  throwsWith("🔴 two keys in one entry", () => verifyPrecompileUpgrades(GEN, [{ txAllowListConfig: { blockTimestamp: 1 }, contractDeployerAllowListConfig: { blockTimestamp: 1 } }]), "exactly one key");
  throwsWith("🔴 unknown key", () => verifyPrecompileUpgrades(GEN, [{ txallowlistconfig: { blockTimestamp: 1 } }]), "unknown precompile config");
  throwsWith("🔴 nil timestamp", () => verifyPrecompileUpgrades(GEN, [{ txAllowListConfig: { adminAddresses: [A] } }]), "cannot be nil");
  throwsWith("🔴 enabling with no admin (project rule, stricter than Go)", () => verifyPrecompileUpgrades(GEN, [{ txAllowListConfig: { blockTimestamp: 1, adminAddresses: [] } }]), "no adminAddresses");
  throwsWith("🔴 both reward modes at once", () => verifyPrecompileUpgrades(GEN, [{ rewardManagerConfig: { blockTimestamp: 1, adminAddresses: [A], initialRewardConfig: { allowFeeRecipients: true, rewardAddress: B } } }]), "cannot enable both");

  console.log("\n── buildUpgradeEntry ──");
  {
    const e = buildUpgradeEntry({ precompile: "txAllowList", action: "enable", admin: A, activateAt: 100 }, P);
    ok("enable ⇒ {key: {blockTimestamp, adminAddresses:[owner]}}", JSON.stringify(e) === JSON.stringify({ txAllowListConfig: { blockTimestamp: 100, adminAddresses: [A] } }));
    const d = buildUpgradeEntry({ precompile: "nativeMinter", action: "disable", activateAt: 100 }, P);
    ok("disable ⇒ {key: {blockTimestamp, disable:true}} and nothing else", JSON.stringify(d) === JSON.stringify({ contractNativeMinterConfig: { blockTimestamp: 100, disable: true } }));
    const r = buildUpgradeEntry({ precompile: "rewardManager", action: "enable", admin: A, activateAt: 100, rewardManager: { mode: "rewardAddress", rewardAddress: B } }, P);
    ok("rewardManager enable carries initialRewardConfig", r.rewardManagerConfig.initialRewardConfig.rewardAddress === B && r.rewardManagerConfig.initialRewardConfig.allowFeeRecipients === false);
    ok("rewardManager default mode is burn (no initialRewardConfig)", buildUpgradeEntry({ precompile: "rewardManager", action: "enable", admin: A, activateAt: 100 }, P).rewardManagerConfig.initialRewardConfig === undefined);
  }
  throwsWith("🔴 feeManager is refused with the reason", () => buildUpgradeEntry({ precompile: "feeManager", action: "disable", activateAt: 1 }, P), "how the owner governs fees");
  throwsWith("🔴 warp is refused", () => buildUpgradeEntry({ precompile: "warp", action: "disable", activateAt: 1 }, P), "network feature");
  throwsWith("🔴 a typo names the right precompile", () => buildUpgradeEntry({ precompile: "nativeminter", action: "enable", admin: A, activateAt: 1 }, P), 'did you mean "nativeMinter"');
  throwsWith("🔴 unknown action", () => buildUpgradeEntry({ precompile: "txAllowList", action: "toggle", admin: A, activateAt: 1 }, P), '"enable" or "disable"');
  throwsWith("🔴 reward options on a disable", () => buildUpgradeEntry({ precompile: "rewardManager", action: "disable", activateAt: 1, rewardManager: "burn" }, P), "only apply when enabling");
  throwsWith("🔴 reward options on another precompile", () => buildUpgradeEntry({ precompile: "txAllowList", action: "enable", admin: A, activateAt: 1, rewardManager: "burn" }, P), "only apply to the rewardManager");
  throwsWith("🔴 bad owner checksum", () => buildUpgradeEntry({ precompile: "txAllowList", action: "enable", admin: A.toLowerCase().replace(/c$/, "C"), activateAt: 1 }, P), "chain owner");
  throwsWith("🔴 zero reward address", () => buildUpgradeEntry({ precompile: "rewardManager", action: "enable", admin: A, activateAt: 1, rewardManager: { mode: "rewardAddress", rewardAddress: ZERO_ADDRESS } }, P), "zero address");

  console.log("\n── planUpgrade ──");
  {
    const p = planUpgrade({ chainConfig: GEN, existingUpgrades: [], precompile: "txAllowList", action: "enable", admin: A, nowSeconds: NOW }, P);
    ok("activation = now + 15 min, rounded up to the minute", p.activateAt >= NOW + MIN_LEAD_SECONDS && p.activateAt % 60 === 0 && p.activateAt < NOW + MIN_LEAD_SECONDS + 60, String(p.activateAt - NOW));
    ok("file shape is {precompileUpgrades:[…]} with one entry", p.upgradeConfig.precompileUpgrades.length === 1 && "txAllowListConfig" in p.upgradeConfig.precompileUpgrades[0]);
    ok("before/after differ exactly on txAllowList", p.description.before.txAllowList === false && p.description.after.txAllowList === true && p.description.after.nativeMinter === true);
    ok("description warns today's users in WONT", p.description.wont.some((s) => s.includes("including today's users")));
    ok("description: nine validators restart", p.description.facts.some((s) => s.includes("nine validators")));
    const d = planUpgrade({ chainConfig: GEN, existingUpgrades: [], precompile: "nativeMinter", action: "disable", admin: A, nowSeconds: NOW }, P);
    ok("disabling a genesis precompile is legal and the entry has disable:true", d.entry.contractNativeMinterConfig.disable === true && d.description.after.nativeMinter === false);
    // existing file with a pending entry for a different key: monotonic ⇒ activation moves to it
    const pend = [{ contractDeployerAllowListConfig: { blockTimestamp: NOW + 3600, adminAddresses: [A] } }];
    const q = planUpgrade({ chainConfig: GEN, existingUpgrades: pend, precompile: "txAllowList", action: "enable", admin: A, nowSeconds: NOW }, P);
    ok("a later pending entry for ANOTHER key pushes activation to its timestamp (monotonic)", q.activateAt === NOW + 3600 && q.upgradeConfig.precompileUpgrades.length === 2);
    // existing file with an activated enable: disable now appends after it
    const past = [{ txAllowListConfig: { blockTimestamp: NOW - 86400, adminAddresses: [A] } }];
    const r = planUpgrade({ chainConfig: GEN, existingUpgrades: past, precompile: "txAllowList", action: "disable", admin: A, nowSeconds: NOW }, P);
    ok("disable after an activated enable appends, keeps history", r.upgradeConfig.precompileUpgrades.length === 2 && r.upgradeConfig.precompileUpgrades[1].txAllowListConfig.disable === true);
    ok("a 7-day lead is accepted", planUpgrade({ chainConfig: GEN, existingUpgrades: [], precompile: "txAllowList", action: "enable", admin: A, nowSeconds: NOW, leadSeconds: MAX_LEAD_SECONDS }, P).activateAt >= NOW + MAX_LEAD_SECONDS);
  }
  throwsWith("🔴 enabling what is on since genesis", () => planUpgrade({ chainConfig: GEN, existingUpgrades: [], precompile: "nativeMinter", action: "enable", admin: A, nowSeconds: NOW }, P), "already enabled since genesis");
  throwsWith("🔴 disabling what is off", () => planUpgrade({ chainConfig: GEN, existingUpgrades: [], precompile: "txAllowList", action: "disable", admin: A, nowSeconds: NOW }, P), "not enabled on this chain");
  throwsWith("🔴 a second upgrade while one is pending for the same key",
    () => planUpgrade({ chainConfig: GEN, existingUpgrades: [{ txAllowListConfig: { blockTimestamp: NOW + 3600, adminAddresses: [A] } }], precompile: "txAllowList", action: "disable", admin: A, nowSeconds: NOW }, P), "already has an upgrade scheduled");
  throwsWith("🔴 a lead below 15 minutes", () => planUpgrade({ chainConfig: GEN, existingUpgrades: [], precompile: "txAllowList", action: "enable", admin: A, nowSeconds: NOW, leadSeconds: 60 }, P), "three times a nine-node rollout");
  throwsWith("🔴 a lead above 7 days", () => planUpgrade({ chainConfig: GEN, existingUpgrades: [], precompile: "txAllowList", action: "enable", admin: A, nowSeconds: NOW, leadSeconds: MAX_LEAD_SECONDS + 1 }, P), "7 days");
  throwsWith("🔴 a hand-edited illegal file on disk is caught BEFORE being extended",
    () => planUpgrade({ chainConfig: GEN, existingUpgrades: [{ contractNativeMinterConfig: { blockTimestamp: 5, adminAddresses: [A] } }], precompile: "txAllowList", action: "enable", admin: A, nowSeconds: NOW }, P), "disable should be true");
  throwsWith("🔴 missing chainConfig is a wiring bug", () => planUpgrade({ existingUpgrades: [], precompile: "txAllowList", action: "enable", admin: A, nowSeconds: NOW }, P), "chainConfig is required");
  throwsWith("🔴 missing existingUpgrades is a wiring bug, not an empty list", () => planUpgrade({ chainConfig: GEN, precompile: "txAllowList", action: "enable", admin: A, nowSeconds: NOW }, P), "must be a list");

  console.log("\n── ownerTransferVerdict ──");
  {
    const adm = { code: 2, name: "admin" }, none = { code: 0, name: "none" };
    ok("admin everywhere ⇒ ok", ownerTransferVerdict({ newAdmin: B, currentAdmin: A, roles: { feeManager: adm, nativeMinter: adm } }).ok === true);
    const v = ownerTransferVerdict({ newAdmin: B, currentAdmin: A, roles: { feeManager: adm, nativeMinter: none } });
    ok("🔴 missing on one enabled precompile ⇒ refused, naming it and the fix", v.ok === false && v.why.includes("nativeMinter (role: none)") && v.why.includes(`setAdmin(${B})`));
    ok("🔴 enabled-but-not-admin (role 1) is NOT enough", ownerTransferVerdict({ newAdmin: B, currentAdmin: A, roles: { feeManager: { code: 1, name: "enabled" } } }).ok === false);
    ok("🔴 same address as current owner ⇒ refused", ownerTransferVerdict({ newAdmin: A.toLowerCase(), currentAdmin: A, roles: { feeManager: adm } }).ok === false);
  }

  console.log(`\n${fail === 0 ? "✅" : "🔴"} ${pass} passed · ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
