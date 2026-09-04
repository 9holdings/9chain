/**
 * l1-options.mjs — the DEEP options of a user L1, as pure functions (milestone L1-CUSTOM:
 * P-56 allocations · P-57 fee config · P-58 per-precompile selection · P-62 "what this chain
 * can and cannot do").
 *
 * ═══ WHY THIS IS A SEPARATE MODULE ═══
 *
 * Same reason as `l1-allowlist.mjs` and `l1-symbol.mjs`: `console/server.mjs` reads a secret at
 * import time and exits without it, so nothing inside it can be tested on its own. A rule that
 * writes into a genesis — an IMMUTABLE artefact that also consumes one of 15 permanent slots —
 * has to be exercised from both sides before it ever touches a node.
 *
 * ═══ THE THREE HARD RULES OF THIS FILE ═══
 *
 * 1. **Every JSON key comes from subnet-evm's source, never from memory.** subnet-evm IGNORES
 *    unknown keys in silence (`params/precompile_upgrade.go` only unmarshals registered
 *    `ConfigKey`s), so a mistyped key produces a chain that quietly lacks what the owner chose.
 *    Keys used here, with their source lines:
 *      contractNativeMinterConfig       precompile/contracts/nativeminter/module.go:22
 *      contractDeployerAllowListConfig  precompile/contracts/deployerallowlist/module.go:20
 *      txAllowListConfig                precompile/contracts/txallowlist/module.go:20
 *      rewardManagerConfig              precompile/contracts/rewardmanager/module.go:20
 *        initialRewardConfig.{allowFeeRecipients, rewardAddress}  rewardmanager/config.go:19-22
 *      feeConfig.{gasLimit, targetBlockRate, minBaseFee, targetGas, baseFeeChangeDenominator,
 *                 minBlockGasCost, maxBlockGasCost, blockGasCostStep}  commontype/fee_config.go
 *    The same rule is applied to the INPUT: an unknown key in `fees` or `precompiles` THROWS,
 *    because the caller who typed `gaslimit` meant `gasLimit` and would otherwise get the default
 *    with no sign that anything was ignored.
 *
 * 2. **No combination may produce a chain that is dead at birth.** Enforced by code, not by a
 *    comment (PROGRESS, milestone rule):
 *      • `minBaseFee` ≥ 1 wei. Zero passes `FeeConfig.Verify()` (it only rejects negatives,
 *        `fee_config.go:116`) and then `VerifyBlockFee` refuses every block the chain tries to
 *        BUILD (`customheader/block_gas_cost.go:94`). Two chains died of this on 2026-08-25 (D-028).
 *      • The owner is the admin of EVERY enabled precompile, and is therefore always able to
 *        transact when `txAllowList` is on (`precompile/allowlist/role.go:51`: `IsEnabled()` is
 *        true for AdminRole).
 *      • The owner receives a NON-ZERO genesis balance. Governance is done by transactions, and
 *        a transaction costs gas: an owner with 0 tokens on a chain whose only tokens are in the
 *        genesis can never call FeeManager, never mint, never approve anyone — the chain has an
 *        owner on paper and none in practice.
 *      • `rewardManager` cannot have both `allowFeeRecipients` and a `rewardAddress`
 *        (`rewardmanager/config.go:34`, `ErrCannotEnableBothRewards`) — refused here, before
 *        money is spent, instead of by the node during creation.
 *
 * 3. **A preset and explicit options do not mix.** `zero-fee` sets `minBaseFee: 1`; an explicit
 *    `fees.minBaseFee` of 25 gwei on top of it would have to either win or lose silently. Neither
 *    is acceptable for an immutable artefact, so a non-`standard` preset combined with `fees` or
 *    `precompiles` is REFUSED with the explicit equivalent spelled out. Allocations combine with
 *    any preset — they do not overlap with what a preset sets.
 *
 * ═══ THE RAILS, AND WHERE EACH NUMBER COMES FROM ═══
 *
 *   gasLimit            12,000,000 – 60,000,000   template floor · `high-throughput` ceiling.
 *                        Above 60M nobody has measured a block on this hardware (presets.mjs).
 *   targetGas           NOT an input — always 5 × gasLimit, the template ratio (60M/12M). A
 *                        gasLimit raised without it makes the fee algorithm punish users for
 *                        using the new ceiling (presets.mjs, `high-throughput`).
 *   targetBlockRate     1 – 10 seconds            template is 2; below 1 s is untested, above
 *                        10 s the "seconds per block" promise stops being a chain people wait on.
 *   minBaseFee          1 – 1,000,000,000,000 wei  ≥ 1 by rule 2; ≤ 1000 gwei because a higher
 *                        floor makes a simple transfer cost more than the 50M default allocation
 *                        can pay for a few thousand times.
 *   baseFeeChangeDenominator  8 – 1000            8 is EIP-1559's value, the most aggressive a
 *                        production chain has run; the template uses 36. Larger = slower swings.
 *   allocations         1 – 50 recipients, each ≥ 1 whole token, total ≤ 9,000,000,000 tokens
 *                        (the mother network's own supply — a test token claiming more than the
 *                        chain it lives on reads as a joke or a scam, and this file cannot tell).
 *
 * Usage:
 *   node local-net/lib/l1-options.mjs --self-test
 */

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** `0x295BE96E64066972000000` wei — what every chain before P-56 gave its owner. */
export const DEFAULT_OWNER_TOKENS = 50_000_000n;
export const WEI_PER_TOKEN = 10n ** 18n;

export const LIMITS = Object.freeze({
  gasLimit: Object.freeze({ min: 12_000_000, max: 60_000_000 }),
  targetGasRatio: 5,
  targetBlockRate: Object.freeze({ min: 1, max: 10 }),
  minBaseFee: Object.freeze({ min: 1n, max: 1_000_000_000_000n }),
  baseFeeChangeDenominator: Object.freeze({ min: 8, max: 1000 }),
  recipients: Object.freeze({ min: 1, max: 50 }),
  totalTokens: 9_000_000_000n,
});

/** Precompile config keys — copied from `precompile/contracts/<name>/module.go`, see header. */
export const PRECOMPILE_KEYS = Object.freeze({
  nativeMinter: "contractNativeMinterConfig",
  deployerAllowList: "contractDeployerAllowListConfig",
  txAllowList: "txAllowListConfig",
  rewardManager: "rewardManagerConfig",
  feeManager: "feeManagerConfig",
  warp: "warpConfig",
});

/** The choices a caller may make. Anything else in `precompiles` is a typo and THROWS. */
export const SELECTABLE_PRECOMPILES = Object.freeze(["nativeMinter", "deployerAllowList", "txAllowList", "rewardManager"]);
export const REWARD_MODES = Object.freeze(["burn", "allowFeeRecipients", "rewardAddress"]);
const FEE_FIELDS = Object.freeze(["gasLimit", "targetBlockRate", "minBaseFee", "baseFeeChangeDenominator"]);
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// ─────────────────────────────────────────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Integer from a number or a decimal string; anything else names the field and THROWS. */
function toBigInt(v, field) {
  if (typeof v === "bigint") return v;
  if (typeof v === "number") {
    if (!Number.isSafeInteger(v)) throw new Error(`${field} must be a whole number (got ${v}).`);
    return BigInt(v);
  }
  if (typeof v === "string" && /^\s*[0-9]+\s*$/.test(v)) return BigInt(v.trim());
  throw new Error(`${field} must be a whole number written in digits (got ${JSON.stringify(v)}).`);
}

function toInt(v, field) {
  const b = toBigInt(v, field);
  if (b > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error(`${field} is too large (${b}).`);
  return Number(b);
}

function rejectUnknownKeys(obj, allowed, where) {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    throw new Error(`${where} must be an object with keys ${allowed.join(", ")}.`);
  }
  for (const k of Object.keys(obj)) {
    if (!allowed.includes(k)) {
      // Name the nearest valid key when the difference is only case — the common typo.
      const near = allowed.find((a) => a.toLowerCase() === k.toLowerCase());
      throw new Error(
        `${where}: unknown key "${k}"` + (near ? ` — did you mean "${near}"?` : ` — allowed: ${allowed.join(", ")}.`) +
        " subnet-evm would ignore an unknown key in silence, so it is refused here instead.");
    }
  }
}

/** Format a whole-token amount with thousands separators for messages. */
export function fmtTokens(n) {
  return BigInt(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ─────────────────────────────────────────────────────────────────────────────
// P-56 — genesis allocations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse the `allocations` input into the genesis `alloc` map.
 *
 * Input shapes accepted (all optional):
 *   undefined / null / []          ⇒ the owner receives DEFAULT_OWNER_TOKENS (pre-P-56 behaviour)
 *   [{ address, tokens }, …]       ⇒ exactly these recipients, whole tokens each
 *
 * `admin` MUST be one of the recipients with tokens ≥ 1 (hard rule 2). Duplicates are refused,
 * not merged: two lines for one address is almost always a paste error, and merging would give
 * that address double what the person believes they typed.
 *
 * @returns {{ alloc: Record<string,{balance:string}>, recipients: Array<{address:string, tokens:string}>, totalTokens: string }}
 */
export function parseAllocations(raw, admin, parseAddr) {
  if (typeof parseAddr !== "function") throw new Error("parseAllocations: parseAddr is required (the EIP-55 parser)");
  if (typeof admin !== "string" || !/^0x[0-9a-fA-F]{40}$/.test(admin)) throw new Error(`parseAllocations: admin must be an address (got ${admin})`);

  let list = raw;
  if (list === undefined || list === null || (Array.isArray(list) && list.length === 0)) {
    list = [{ address: admin, tokens: DEFAULT_OWNER_TOKENS.toString() }];
  }
  if (!Array.isArray(list)) throw new Error("allocations must be a list of { address, tokens }.");
  if (list.length > LIMITS.recipients.max) {
    throw new Error(`allocations: at most ${LIMITS.recipients.max} recipients (got ${list.length}).`);
  }

  const seen = new Map();
  const recipients = [];
  let total = 0n;
  list.forEach((entry, i) => {
    rejectUnknownKeys(entry, ["address", "tokens"], `allocations[${i}]`);
    const address = parseAddr(entry.address, `allocations[${i}].address`);
    const key = address.toLowerCase();
    if (seen.has(key)) {
      throw new Error(`allocations: ${address} appears twice (lines ${seen.get(key) + 1} and ${i + 1}). One line per address.`);
    }
    seen.set(key, i);
    const tokens = toBigInt(entry.tokens, `allocations[${i}].tokens`);
    if (tokens < 1n) throw new Error(`allocations[${i}]: ${address} would receive ${tokens} tokens — each recipient must receive at least 1.`);
    total += tokens;
    recipients.push({ address, tokens: tokens.toString() });
  });

  if (total > LIMITS.totalTokens) {
    throw new Error(
      `allocations: total ${fmtTokens(total)} tokens exceeds the ceiling of ${fmtTokens(LIMITS.totalTokens)} ` +
      `(the mother network's whole supply).`);
  }
  if (!seen.has(admin.toLowerCase())) {
    throw new Error(
      `allocations: the owner ${admin} receives nothing. Governance is done by transactions and every ` +
      `transaction costs gas — an owner with 0 tokens can never change fees, mint, or approve anyone. ` +
      `Add a line for the owner.`);
  }

  // `alloc` keys are BARE hex (no `0x`), lower case — the convention `createChain` already uses.
  const alloc = {};
  for (const r of recipients) {
    alloc[r.address.slice(2).toLowerCase()] = { balance: "0x" + (BigInt(r.tokens) * WEI_PER_TOKEN).toString(16).toUpperCase() };
  }
  return { alloc, recipients, totalTokens: total.toString() };
}

// ─────────────────────────────────────────────────────────────────────────────
// P-57 — fee config with rails
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apply the caller's `fees` on top of the template's `feeConfig`, inside the rails.
 * Returns the new feeConfig; does not touch `base`.
 */
export function applyFees(base, raw) {
  if (base === null || typeof base !== "object") throw new Error("applyFees: base feeConfig is required");
  const out = { ...base };
  if (raw === undefined || raw === null) return out;
  rejectUnknownKeys(raw, FEE_FIELDS, "fees");

  if (raw.gasLimit !== undefined) {
    const g = toInt(raw.gasLimit, "fees.gasLimit");
    if (g < LIMITS.gasLimit.min || g > LIMITS.gasLimit.max) {
      throw new Error(`fees.gasLimit must be between ${fmtTokens(LIMITS.gasLimit.min)} and ${fmtTokens(LIMITS.gasLimit.max)} (got ${fmtTokens(g)}).`);
    }
    out.gasLimit = g;
  }
  // targetGas follows gasLimit ALWAYS — also when gasLimit was not given, so a template whose
  // ratio drifted cannot ship a chain whose fee algorithm fights its own ceiling.
  out.targetGas = out.gasLimit * LIMITS.targetGasRatio;

  if (raw.targetBlockRate !== undefined) {
    const r = toInt(raw.targetBlockRate, "fees.targetBlockRate");
    if (r < LIMITS.targetBlockRate.min || r > LIMITS.targetBlockRate.max) {
      throw new Error(`fees.targetBlockRate must be between ${LIMITS.targetBlockRate.min} and ${LIMITS.targetBlockRate.max} seconds (got ${r}).`);
    }
    out.targetBlockRate = r;
  }

  if (raw.minBaseFee !== undefined) {
    const f = toBigInt(raw.minBaseFee, "fees.minBaseFee");
    if (f < LIMITS.minBaseFee.min) {
      throw new Error(
        `fees.minBaseFee must be at least 1 wei (got ${f}). Zero passes subnet-evm's Verify() and then ` +
        `refuses every block the chain tries to build (block_gas_cost.go:94) — the chain would be dead at birth.`);
    }
    if (f > LIMITS.minBaseFee.max) {
      throw new Error(`fees.minBaseFee must be at most ${fmtTokens(LIMITS.minBaseFee.max)} wei (1000 gwei); got ${fmtTokens(f)}.`);
    }
    out.minBaseFee = Number(f) <= Number.MAX_SAFE_INTEGER ? Number(f) : f.toString();
  }

  if (raw.baseFeeChangeDenominator !== undefined) {
    const d = toInt(raw.baseFeeChangeDenominator, "fees.baseFeeChangeDenominator");
    if (d < LIMITS.baseFeeChangeDenominator.min || d > LIMITS.baseFeeChangeDenominator.max) {
      throw new Error(`fees.baseFeeChangeDenominator must be between ${LIMITS.baseFeeChangeDenominator.min} and ${LIMITS.baseFeeChangeDenominator.max} (got ${d}).`);
    }
    out.baseFeeChangeDenominator = d;
  }
  return out;
}

/**
 * A port of `FeeConfig.Verify()` (`commontype/fee_config.go:93-131`), run on the FINAL feeConfig
 * whatever produced it — preset, explicit fees, or the template itself. It is the last line
 * before a genesis is written, so the message names the same condition the node would.
 *
 * ⚠️ This is a port, not the Go function. The real `Verify()` still runs inside the node when the
 * chain is created; this copy exists so the refusal arrives BEFORE a P-Chain transaction is paid
 * for. If subnet-evm adds a rule, this port is behind until someone reads the diff.
 */
export function verifyFeeConfig(fc) {
  const need = ["gasLimit", "targetBlockRate", "minBaseFee", "targetGas", "baseFeeChangeDenominator", "minBlockGasCost", "maxBlockGasCost", "blockGasCostStep"];
  for (const k of need) if (fc?.[k] === undefined || fc[k] === null) throw new Error(`feeConfig: ${k} cannot be nil`);
  const big = (k) => toBigInt(fc[k], `feeConfig.${k}`);
  if (big("gasLimit") <= 0n) throw new Error(`feeConfig: gasLimit cannot be less than or equal to 0`);
  if (big("targetBlockRate") <= 0n) throw new Error(`feeConfig: targetBlockRate cannot be less than or equal to 0`);
  if (big("minBaseFee") < 0n) throw new Error(`feeConfig: minBaseFee cannot be less than 0`);
  if (big("targetGas") <= 0n) throw new Error(`feeConfig: targetGas cannot be less than or equal to 0`);
  if (big("baseFeeChangeDenominator") <= 0n) throw new Error(`feeConfig: baseFeeChangeDenominator cannot be less than or equal to 0`);
  if (big("minBlockGasCost") < 0n) throw new Error(`feeConfig: minBlockGasCost cannot be less than 0`);
  if (big("minBlockGasCost") > big("maxBlockGasCost")) throw new Error(`feeConfig: minBlockGasCost cannot be greater than maxBlockGasCost`);
  if (big("blockGasCostStep") < 0n) throw new Error(`feeConfig: blockGasCostStep cannot be less than 0`);
  if (big("maxBlockGasCost") > (1n << 64n) - 1n) throw new Error(`feeConfig: maxBlockGasCost is not a valid uint64`);
  // `checkByteLens()` (fee_config.go:151-178), the LAST statement of the real Verify(). It runs
  // after every value check above, in Go and here, so a field that is both wrong and wide still
  // reports the wrong-value sentence first.
  //
  // 🔴 This block was missing until 2026-09-04, and nothing noticed for a reason worth keeping:
  // the API's own LIMITS cap every one of these fields far below 32 bytes, so the gap was
  // unreachable from outside. "Unreachable through today's front door" is not "closed" — it was
  // true by accident, and one widened cap would have made a genesis the port blessed and the node
  // refused, discovered after the P-Chain transaction was paid, on a permanent slot.
  // `scripts/check-genesis-verify.mjs` control R3 measures this boundary against the real Go
  // function; it is what found the omission.
  for (const k of need) {
    if (big(k) >> 256n) throw new Error(`feeConfig: ${k} exceeds 32 bytes`);
  }
  // 🔴 The project's own rule on top of Go's: zero is legal to Verify() and fatal to the chain.
  if (big("minBaseFee") < 1n) throw new Error(`feeConfig: minBaseFee must be at least 1 wei (D-028 — a 0 floor makes every block unbuildable)`);
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// P-58 — precompiles, one by one
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apply the caller's `precompiles` to the genesis `config` IN PLACE. The owner becomes the admin
 * of every precompile enabled here (hard rule 2).
 *
 * Input shape:
 *   { nativeMinter?: bool, deployerAllowList?: bool, txAllowList?: bool,
 *     rewardManager?: false | "burn" | "allowFeeRecipients" | { mode: "rewardAddress", rewardAddress: "0x…" } }
 */
export function applyPrecompiles(cfg, raw, admin, parseAddr) {
  if (cfg === null || typeof cfg !== "object") throw new Error("applyPrecompiles: genesis config is required");
  if (!/^0x[0-9a-fA-F]{40}$/.test(String(admin || ""))) throw new Error(`applyPrecompiles: admin must be an address (got ${admin})`);
  if (raw === undefined || raw === null) return cfg;
  rejectUnknownKeys(raw, SELECTABLE_PRECOMPILES, "precompiles");

  const bool = (k) => {
    const v = raw[k];
    if (v === undefined || v === null) return false;
    if (typeof v !== "boolean") throw new Error(`precompiles.${k} must be true or false (got ${JSON.stringify(v)}).`);
    return v;
  };
  if (bool("nativeMinter")) cfg[PRECOMPILE_KEYS.nativeMinter] = { adminAddresses: [admin], blockTimestamp: 0 };
  if (bool("deployerAllowList")) cfg[PRECOMPILE_KEYS.deployerAllowList] = { adminAddresses: [admin], blockTimestamp: 0 };
  // Owner in `adminAddresses` ⇒ owner can transact (allowlist/role.go:51). That is what keeps
  // this preset from producing a chain nobody can use.
  if (bool("txAllowList")) cfg[PRECOMPILE_KEYS.txAllowList] = { adminAddresses: [admin], blockTimestamp: 0 };

  const rm = raw.rewardManager;
  if (rm !== undefined && rm !== null && rm !== false) {
    let mode, rewardAddress;
    if (typeof rm === "string") mode = rm;
    else if (typeof rm === "object" && !Array.isArray(rm)) {
      rejectUnknownKeys(rm, ["mode", "rewardAddress"], "precompiles.rewardManager");
      mode = rm.mode; rewardAddress = rm.rewardAddress;
    } else throw new Error(`precompiles.rewardManager must be false, one of ${REWARD_MODES.join("/")}, or { mode, rewardAddress }.`);
    if (!REWARD_MODES.includes(mode)) {
      throw new Error(`precompiles.rewardManager: unknown mode ${JSON.stringify(mode)} — one of ${REWARD_MODES.join(", ")}.`);
    }
    const conf = { adminAddresses: [admin], blockTimestamp: 0 };
    if (mode === "allowFeeRecipients") {
      if (rewardAddress !== undefined && rewardAddress !== null && String(rewardAddress).trim() !== "") {
        // rewardmanager/config.go:34 — ErrCannotEnableBothRewards. Refused before any money moves.
        throw new Error("precompiles.rewardManager: allowFeeRecipients and a rewardAddress cannot both be set (subnet-evm ErrCannotEnableBothRewards).");
      }
      conf.initialRewardConfig = { allowFeeRecipients: true };
    } else if (mode === "rewardAddress") {
      if (typeof parseAddr !== "function") throw new Error("applyPrecompiles: parseAddr is required for rewardAddress");
      if (String(rewardAddress ?? "").trim().toLowerCase() === ZERO_ADDRESS) {
        // The zero address means "rewards disabled" to Configure() (config.go:45) — the caller who
        // typed it wanted a recipient, so the silent reinterpretation is refused. Checked BEFORE the
        // EIP-55 parser, which also refuses it, so the sentence the caller reads is this one.
        throw new Error("precompiles.rewardManager.rewardAddress: the zero address means 'disable rewards' to subnet-evm — use mode \"burn\" if that is what you want.");
      }
      const a = parseAddr(rewardAddress, "precompiles.rewardManager.rewardAddress");
      conf.initialRewardConfig = { allowFeeRecipients: false, rewardAddress: a };
    }
    // mode "burn": precompile enabled, no initialRewardConfig ⇒ Configure() disables rewards
    // (config.go:44-48); the owner can switch later through the precompile.
    cfg[PRECOMPILE_KEYS.rewardManager] = conf;
  }
  return cfg;
}

// ─────────────────────────────────────────────────────────────────────────────
// Composition, and the effective record
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hard rule 3: a non-standard preset and explicit fees/precompiles are refused together.
 * `presetId` empty ⇒ "standard".
 */
export function assertPresetCompatible(presetId, options) {
  const id = String(presetId ?? "").trim() || "standard";
  if (id === "standard") return;
  const hasFees = options?.fees !== undefined && options.fees !== null;
  const hasPre = options?.precompiles !== undefined && options.precompiles !== null;
  if (!hasFees && !hasPre) return;
  const explicit = {
    "zero-fee": `fees: { minBaseFee: 1 }`,
    "high-throughput": `fees: { gasLimit: 60000000 }`,
    "mintable": `precompiles: { nativeMinter: true }`,
    "owner-deploy-only": `precompiles: { deployerAllowList: true }`,
    "permissioned": `precompiles: { txAllowList: true }`,
  }[id];
  throw new Error(
    `Preset "${id}" cannot be combined with explicit fees/precompiles — one of them would win in silence ` +
    `and the genesis is immutable. Use preset "standard" and write the same choice explicitly` +
    (explicit ? ` (${explicit})` : "") + ", then add your other options.");
}

/** Which selectable precompiles the FINAL config enables — read from the config, not the input. */
export function enabledPrecompiles(cfg) {
  const out = [];
  for (const name of SELECTABLE_PRECOMPILES) if (cfg?.[PRECOMPILE_KEYS[name]]) out.push(name);
  return out;
}

/** The reward mode the final config expresses, or null when the precompile is off. */
export function rewardModeOf(cfg) {
  const rm = cfg?.[PRECOMPILE_KEYS.rewardManager];
  if (!rm) return null;
  const init = rm.initialRewardConfig;
  if (!init) return { mode: "burn" };
  if (init.allowFeeRecipients) return { mode: "allowFeeRecipients" };
  if (init.rewardAddress && init.rewardAddress.toLowerCase() !== ZERO_ADDRESS) return { mode: "rewardAddress", rewardAddress: init.rewardAddress };
  return { mode: "burn" };
}

/**
 * The compact, public record of what was chosen — written next to the chain in
 * `console-chains.json` (an ADDED key, safe for `/chains/`). Everything in it is already public
 * in the genesis; this is the same information in a shape a directory page can show.
 */
/**
 * P-59 — the genesis contract library, opt-in.
 *
 * 🔴 DEFAULT OFF, and that is a decision. Turning it on for everyone would add ~6.7 KB of code and
 * three permanent accounts to every chain, and — the part that decides it — would make a genesis
 * built with no options DIFFERENT from the eleven chains already alive. The rule the rest of this
 * file follows is that absent options reproduce the old bytes exactly (P-56); nothing here earns an
 * exception to that.
 *
 * Accepts `true` (the whole library) or `false`/absent (nothing). A list of individual contracts is
 * deliberately NOT offered: `TokenFactory` is useless without `Erc20`, so the only combination worth
 * having is all of it, and an option whose wrong settings are silently useless is worse than none.
 *
 * @returns {boolean} whether the library goes in
 */
export function parseContractLibrary(raw) {
  if (raw === undefined || raw === null || raw === false) return false;
  if (raw === true) return true;
  throw new Error(`contracts must be true or false (got ${JSON.stringify(raw)}). The library goes in whole or not at all — TokenFactory without Erc20 would clone nothing.`);
}

export function effectiveOptions(cfg, allocation, contractLibrary = false) {
  const fc = cfg.feeConfig;
  return {
    fees: {
      gasLimit: Number(fc.gasLimit),
      targetGas: Number(fc.targetGas),
      targetBlockRate: Number(fc.targetBlockRate),
      minBaseFee: String(fc.minBaseFee),
      baseFeeChangeDenominator: Number(fc.baseFeeChangeDenominator),
    },
    precompiles: enabledPrecompiles(cfg),
    ...(rewardModeOf(cfg) ? { rewardManager: rewardModeOf(cfg) } : {}),
    allocations: allocation.recipients,
    totalTokens: allocation.totalTokens,
    ...(contractLibrary ? { contracts: true } : {}),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// P-62 — what this chain can and cannot do, in sentences a person signs under
// ─────────────────────────────────────────────────────────────────────────────

const GAS_PER_TRANSFER = 21_000;

/**
 * Plain sentences derived from the FINAL genesis config — never from the input, so what the
 * person reads is what the node will run. `can` and `cannot` are separate lists on purpose:
 * the second list is the one people skip, and it is the one that matters for an immutable chain.
 */
export function describeChain({ cfg, allocation, symbol, chainId, name, contractLibrary = false }) {
  const fc = cfg.feeConfig;
  const perBlock = Math.floor(Number(fc.gasLimit) / GAS_PER_TRANSFER);
  const perSecond = Math.floor(perBlock / Number(fc.targetBlockRate));
  const pre = new Set(enabledPrecompiles(cfg));
  const reward = rewardModeOf(cfg);
  const can = [], cannot = [], facts = [];

  facts.push(`"${name}" — EVM chain ID ${chainId}, native token ${symbol}.`);
  facts.push(`Genesis supply: ${fmtTokens(allocation.totalTokens)} ${symbol} to ${allocation.recipients.length} address${allocation.recipients.length === 1 ? "" : "es"}.`);
  facts.push(`Blocks: gas limit ${fmtTokens(fc.gasLimit)} (up to ~${fmtTokens(perBlock)} simple transfers per block, ~${fmtTokens(perSecond)} per second at one block every ${fc.targetBlockRate} s); minimum base fee ${fmtTokens(fc.minBaseFee)} wei.`);

  can.push("The owner can change fees at any time (FeeManager precompile).");
  if (pre.has("nativeMinter")) can.push(`The owner can mint more ${symbol} at any time — the supply is NOT fixed.`);
  else cannot.push(`Nobody can ever mint more ${symbol}: the supply is fixed at ${fmtTokens(allocation.totalTokens)} forever.`);
  if (pre.has("deployerAllowList")) { can.push("The owner decides who may deploy contracts."); cannot.push("A wallet the owner has not approved cannot deploy contracts."); }
  else can.push("Anyone can deploy contracts.");
  if (pre.has("txAllowList")) { can.push("The owner decides who may send transactions."); cannot.push("A wallet the owner has not approved cannot send ANY transaction — not even a transfer."); }
  else can.push("Anyone can send transactions.");
  if (!reward) cannot.push("Transaction fees are burned. Paying them to validators or to an address later would need a network upgrade on every node.");
  else if (reward.mode === "burn") can.push("Transaction fees are burned for now; the owner can redirect them later (RewardManager precompile).");
  else if (reward.mode === "allowFeeRecipients") can.push("Validators keep the fees of the blocks they produce.");
  else can.push(`All transaction fees go to ${reward.rewardAddress}; the owner can change that later.`);
  if (cfg[PRECOMPILE_KEYS.warp]) can.push("Warp messaging is on — this chain can exchange signed messages with other 9Chain L1s.");

  if (contractLibrary) {
    can.push("A token factory and a Multicall3 are already installed, so the owner can create ERC-20 tokens with one transaction and indexers can batch their reads from the first block.");
    // The honest half, in the list people skip, because a name is not a measurement: this is not
    // the canonical Multicall3 deployment and tools that hard-code its address will not find it.
    cannot.push("The installed Multicall3 is ABI-compatible but is NOT the canonical deployment and is NOT at 0xcA11bde0…; tools that hard-code that address will not find it here.");
  } else {
    cannot.push("No contracts are installed in the genesis. Anything the chain needs — a token, a multicall — has to be deployed after it is running, and cannot be added to the genesis later.");
  }

  cannot.push("After creation nothing here can be changed except through the precompiles above: chain ID, name, genesis allocation and the set of enabled precompiles are permanent.");
  cannot.push("The chain occupies one of the network's 15 permanent L1 slots; revoking it frees the slot but never the name or chain ID.");
  return { facts, can, cannot };
}

// ═══════════════════════════════════════════════════════════════════════════
// Reverse controls
// ═══════════════════════════════════════════════════════════════════════════
if (process.argv[1]?.endsWith("l1-options.mjs") && process.argv.includes("--self-test")) {
  const { parseEvmAddress } = await import("./eip55.mjs");
  const { readFileSync } = await import("node:fs");
  const path = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
  const TEMPLATE = JSON.parse(readFileSync(path.join(ROOT, "9chain-a1-config", "l1-evm-genesis.json"), "utf8"));

  let pass = 0, fail = 0;
  const ok = (label, cond, detail = "") => {
    if (cond) { pass++; console.log(`  ✓ ${label}`); }
    else { fail++; console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`); }
  };
  const throwsWith = (label, fn, fragment) => {
    try { const v = fn(); ok(label, false, `did not throw (returned ${JSON.stringify(v, (_, x) => typeof x === "bigint" ? x.toString() : x)})`); }
    catch (e) { ok(label, String(e.message).includes(fragment), `message was: ${e.message}`); }
  };
  const A = "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC";   // ewoq, published
  const B = "0x1212b2445e74f788B30BfA9C42aa46f252345a0B";   // foundation, published
  const C = "0x5eE9233D2452fdf85f62edbb80035339F1e93a39";   // invited 2026-09-04
  const P = parseEvmAddress;
  const freshCfg = () => structuredClone(TEMPLATE.config);

  console.log("══ REVERSE CONTROLS — l1-options ══\n");

  console.log("── P-56 allocations ──");
  {
    const d = parseAllocations(undefined, A, P);
    ok("absent ⇒ owner gets the pre-P-56 default (50,000,000)", d.recipients.length === 1 && d.recipients[0].tokens === "50000000");
    ok("🔴 the default balance is BYTE-IDENTICAL to what every chain before P-56 received",
      d.alloc[A.slice(2).toLowerCase()].balance === "0x295BE96E64066972000000", JSON.stringify(d.alloc));
    ok("empty list ⇒ same default", parseAllocations([], A, P).totalTokens === "50000000");
    const m = parseAllocations([{ address: A, tokens: 1 }, { address: B, tokens: "2500000" }], A, P);
    ok("two recipients, total summed", m.totalTokens === "2500001" && Object.keys(m.alloc).length === 2);
    ok("alloc keys are bare lower-case hex", Object.keys(m.alloc).every((k) => /^[0-9a-f]{40}$/.test(k)));
    ok("balance is tokens × 10^18 in hex", m.alloc[B.slice(2).toLowerCase()].balance === "0x" + (2500000n * 10n ** 18n).toString(16).toUpperCase());
  }
  throwsWith("🔴 owner receiving nothing is refused — an owner with 0 gas cannot govern",
    () => parseAllocations([{ address: B, tokens: 10 }], A, P), "the owner " + A + " receives nothing");
  throwsWith("🔴 zero tokens for a recipient", () => parseAllocations([{ address: A, tokens: 0 }], A, P), "at least 1");
  throwsWith("🔴 duplicate address is refused, not merged", () => parseAllocations([{ address: A, tokens: 1 }, { address: A.toLowerCase(), tokens: 1 }], A, P), "appears twice");
  throwsWith("🔴 bad EIP-55 checksum is caught by the injected parser",
    () => parseAllocations([{ address: "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52Fc", tokens: 1 }], A, P), "allocations[0].address");
  throwsWith("🔴 total above 9,000,000,000 is refused", () => parseAllocations([{ address: A, tokens: "9000000001" }], A, P), "exceeds the ceiling");
  ok("total exactly 9,000,000,000 is allowed", parseAllocations([{ address: A, tokens: "9000000000" }], A, P).totalTokens === "9000000000");
  throwsWith("🔴 51 recipients is refused",
    () => parseAllocations(Array.from({ length: 51 }, (_, i) => ({ address: A, tokens: 1 })), A, P), "at most 50");
  throwsWith("🔴 decimal tokens are refused (whole tokens only)", () => parseAllocations([{ address: A, tokens: "1.5" }], A, P), "whole number");
  throwsWith("🔴 unknown key in an entry names the typo", () => parseAllocations([{ address: A, Tokens: 1 }], A, P), 'did you mean "tokens"');
  throwsWith("🔴 non-list input", () => parseAllocations({ address: A }, A, P), "must be a list");
  throwsWith("🔴 missing parser is a wiring bug", () => parseAllocations(undefined, A), "parseAddr is required");

  console.log("\n── P-57 fees ──");
  {
    const base = freshCfg().feeConfig;
    const same = applyFees(base, undefined);
    ok("absent ⇒ template values, targetGas = 5 × gasLimit", same.gasLimit === 12000000 && same.targetGas === 60000000 && same.minBaseFee === 25000000000);
    const hi = applyFees(base, { gasLimit: 60000000 });
    ok("gasLimit 60M ⇒ targetGas re-derived to 300M (the high-throughput preset's pair)", hi.gasLimit === 60000000 && hi.targetGas === 300000000);
    ok("🔴 targetGas is NOT an input", (() => { try { applyFees(base, { targetGas: 1 }); return false; } catch (e) { return /unknown key "targetGas"/.test(e.message); } })());
    const z = applyFees(base, { minBaseFee: 1, targetBlockRate: 1, baseFeeChangeDenominator: 8 });
    ok("all rails at their floors are accepted", z.minBaseFee === 1 && z.targetBlockRate === 1 && z.baseFeeChangeDenominator === 8);
    ok("minBaseFee as a digit string", applyFees(base, { minBaseFee: "1000000000000" }).minBaseFee === 1000000000000);
    ok("base object is not mutated", base.gasLimit === 12000000 && base.targetGas === 60000000);
  }
  const fb = freshCfg().feeConfig;
  throwsWith("🔴 minBaseFee 0 is refused and the message says why (D-028)", () => applyFees(fb, { minBaseFee: 0 }), "dead at birth");
  throwsWith("🔴 minBaseFee above 1000 gwei", () => applyFees(fb, { minBaseFee: "1000000000001" }), "at most");
  throwsWith("🔴 gasLimit below 12M", () => applyFees(fb, { gasLimit: 11999999 }), "between 12,000,000 and 60,000,000");
  throwsWith("🔴 gasLimit above 60M", () => applyFees(fb, { gasLimit: 60000001 }), "between 12,000,000 and 60,000,000");
  throwsWith("🔴 targetBlockRate 0", () => applyFees(fb, { targetBlockRate: 0 }), "between 1 and 10");
  throwsWith("🔴 targetBlockRate 11", () => applyFees(fb, { targetBlockRate: 11 }), "between 1 and 10");
  throwsWith("🔴 baseFeeChangeDenominator 7", () => applyFees(fb, { baseFeeChangeDenominator: 7 }), "between 8 and 1000");
  throwsWith("🔴 a mistyped key is refused, naming the right one", () => applyFees(fb, { gaslimit: 12000000 }), 'did you mean "gasLimit"');
  throwsWith("🔴 a non-integer", () => applyFees(fb, { gasLimit: 12000000.5 }), "whole number");
  throwsWith("🔴 fees given as a list", () => applyFees(fb, [1]), "must be an object");

  console.log("\n── P-59 contract library (opt-in) ──");
  ok("absent ⇒ off, so a genesis with no options is unchanged", parseContractLibrary(undefined) === false);
  ok("false ⇒ off", parseContractLibrary(false) === false);
  ok("true ⇒ on", parseContractLibrary(true) === true);
  throwsWith("🔴 a list is refused — the library goes in whole or not at all", () => parseContractLibrary(["erc20"]), "whole or not at all");
  throwsWith('🔴 the string "true" is not true', () => parseContractLibrary("true"), "must be true or false");
  ok("off ⇒ effectiveOptions carries no `contracts` key at all (not `false`)",
    !("contracts" in effectiveOptions(freshCfg(), { recipients: [], totalTokens: 0n }, false)));
  ok("on ⇒ effectiveOptions records it", effectiveOptions(freshCfg(), { recipients: [], totalTokens: 0n }, true).contracts === true);
  {
    const args = { cfg: freshCfg(), allocation: { recipients: [{ address: A, tokens: "1" }], totalTokens: 1n }, symbol: "T", chainId: 1, name: "T" };
    const off = describeChain(args);
    const on = describeChain({ ...args, contractLibrary: true });
    ok("🔴 off ⇒ CANNOT says the genesis carries no contracts and none can be added later",
      off.cannot.some((s) => s.includes("No contracts are installed")));
    ok("on ⇒ CAN names the factory and the multicall", on.can.some((s) => s.includes("token factory")));
    ok("🔴 on ⇒ CANNOT admits the Multicall3 is not the canonical one — the honest half, in the list people skip",
      on.cannot.some((s) => s.includes("NOT the canonical deployment")));
  }

  console.log("\n── verifyFeeConfig — port of commontype/fee_config.go ──");
  ok("the template passes", verifyFeeConfig(freshCfg().feeConfig) === true);
  throwsWith("🔴 minBlockGasCost > maxBlockGasCost", () => verifyFeeConfig({ ...freshCfg().feeConfig, minBlockGasCost: 2, maxBlockGasCost: 1 }), "minBlockGasCost cannot be greater than maxBlockGasCost");
  throwsWith("🔴 a nil field", () => verifyFeeConfig({ ...freshCfg().feeConfig, targetGas: undefined }), "targetGas cannot be nil");
  throwsWith("🔴 minBaseFee 0 — legal to Go, fatal to the chain, refused here", () => verifyFeeConfig({ ...freshCfg().feeConfig, minBaseFee: 0 }), "at least 1 wei");
  throwsWith("🔴 maxBlockGasCost beyond uint64", () => verifyFeeConfig({ ...freshCfg().feeConfig, maxBlockGasCost: "18446744073709551616" }), "not a valid uint64");
  // checkByteLens — added 2026-09-04 after `scripts/check-genesis-verify.mjs` measured the real Go
  // function refusing a document this port had blessed. Both sides of the boundary, because a rule
  // that rejects one byte too much is a different bug from one that rejects nothing.
  throwsWith("🔴 minBaseFee 33 bytes wide — the last statement of the real Verify()", () => verifyFeeConfig({ ...freshCfg().feeConfig, minBaseFee: (2n ** 256n).toString() }), "minBaseFee exceeds 32 bytes");
  throwsWith("🔴 gasLimit 33 bytes wide", () => verifyFeeConfig({ ...freshCfg().feeConfig, gasLimit: (2n ** 300n).toString() }), "gasLimit exceeds 32 bytes");
  ok("exactly 32 bytes is still legal (the check is width, not magnitude)", verifyFeeConfig({ ...freshCfg().feeConfig, minBaseFee: (2n ** 256n - 1n).toString() }) === true);

  console.log("\n── P-58 precompiles ──");
  {
    const c = applyPrecompiles(freshCfg(), undefined, A, P);
    ok("absent ⇒ nothing added beyond the template (feeManager + warp)", enabledPrecompiles(c).length === 0 && !!c.feeManagerConfig && !!c.warpConfig);
    const all = applyPrecompiles(freshCfg(), { nativeMinter: true, deployerAllowList: true, txAllowList: true, rewardManager: "burn" }, A, P);
    ok("four enabled, read back from the CONFIG keys", enabledPrecompiles(all).join(",") === "nativeMinter,deployerAllowList,txAllowList,rewardManager");
    ok("🔴 the owner is admin of EVERY enabled precompile",
      ["contractNativeMinterConfig", "contractDeployerAllowListConfig", "txAllowListConfig", "rewardManagerConfig"].every((k) => all[k].adminAddresses[0] === A && all[k].blockTimestamp === 0));
    ok("🔴 keys are the exact ConfigKey strings from module.go", "contractNativeMinterConfig" in all && "contractDeployerAllowListConfig" in all && "txAllowListConfig" in all && "rewardManagerConfig" in all);
    ok("burn ⇒ no initialRewardConfig (Configure() disables rewards)", all.rewardManagerConfig.initialRewardConfig === undefined && rewardModeOf(all).mode === "burn");
    const afr = applyPrecompiles(freshCfg(), { rewardManager: "allowFeeRecipients" }, A, P);
    ok("allowFeeRecipients ⇒ initialRewardConfig.allowFeeRecipients = true", afr.rewardManagerConfig.initialRewardConfig.allowFeeRecipients === true && rewardModeOf(afr).mode === "allowFeeRecipients");
    const ra = applyPrecompiles(freshCfg(), { rewardManager: { mode: "rewardAddress", rewardAddress: B } }, A, P);
    ok("rewardAddress ⇒ stored, allowFeeRecipients false", ra.rewardManagerConfig.initialRewardConfig.rewardAddress === B && ra.rewardManagerConfig.initialRewardConfig.allowFeeRecipients === false && rewardModeOf(ra).rewardAddress === B);
    ok("false ⇒ off", enabledPrecompiles(applyPrecompiles(freshCfg(), { nativeMinter: false, rewardManager: false }, A, P)).length === 0);
  }
  throwsWith("🔴 unknown precompile name (case typo)", () => applyPrecompiles(freshCfg(), { nativeminter: true }, A, P), 'did you mean "nativeMinter"');
  throwsWith("🔴 warp is not selectable (always on from the template)", () => applyPrecompiles(freshCfg(), { warp: true }, A, P), "unknown key \"warp\"");
  throwsWith("🔴 a string where a boolean is expected", () => applyPrecompiles(freshCfg(), { nativeMinter: "yes" }, A, P), "must be true or false");
  throwsWith("🔴 unknown reward mode", () => applyPrecompiles(freshCfg(), { rewardManager: "share" }, A, P), "unknown mode");
  throwsWith("🔴 allowFeeRecipients + rewardAddress together (ErrCannotEnableBothRewards)",
    () => applyPrecompiles(freshCfg(), { rewardManager: { mode: "allowFeeRecipients", rewardAddress: B } }, A, P), "cannot both be set");
  throwsWith("🔴 rewardAddress mode without an address", () => applyPrecompiles(freshCfg(), { rewardManager: { mode: "rewardAddress" } }, A, P), "rewardAddress");
  throwsWith("🔴 the zero address as reward address is refused, not reinterpreted",
    () => applyPrecompiles(freshCfg(), { rewardManager: { mode: "rewardAddress", rewardAddress: ZERO_ADDRESS } }, A, P), "zero address");
  throwsWith("🔴 bad checksum on the reward address", () => applyPrecompiles(freshCfg(), { rewardManager: { mode: "rewardAddress", rewardAddress: B.toLowerCase().replace(/b$/, "B") } }, A, P), "rewardAddress");
  throwsWith("🔴 bad admin is refused even though the caller validated it", () => applyPrecompiles(freshCfg(), { nativeMinter: true }, "0xnope", P), "admin must be an address");

  console.log("\n── composition ──");
  ok("standard + anything is fine", (() => { assertPresetCompatible("standard", { fees: { gasLimit: 60000000 }, precompiles: { nativeMinter: true } }); assertPresetCompatible("", { fees: {} }); return true; })());
  ok("a non-standard preset with allocations only is fine", (() => { assertPresetCompatible("mintable", { allocations: [{ address: A, tokens: 1 }] }); return true; })());
  throwsWith("🔴 zero-fee + explicit fees refused, with the explicit equivalent", () => assertPresetCompatible("zero-fee", { fees: { minBaseFee: 5 } }), "fees: { minBaseFee: 1 }");
  throwsWith("🔴 mintable + explicit precompiles refused", () => assertPresetCompatible("mintable", { precompiles: { txAllowList: true } }), "precompiles: { nativeMinter: true }");

  console.log("\n── effective record + description ──");
  {
    const cfg = freshCfg();
    cfg.feeConfig = applyFees(cfg.feeConfig, { gasLimit: 60000000, targetBlockRate: 1 });
    applyPrecompiles(cfg, { nativeMinter: true, rewardManager: { mode: "rewardAddress", rewardAddress: C } }, A, P);
    const alloc = parseAllocations([{ address: A, tokens: 1000 }, { address: C, tokens: 9000 }], A, P);
    const eff = effectiveOptions(cfg, alloc);
    ok("record carries the FINAL fee numbers", eff.fees.gasLimit === 60000000 && eff.fees.targetGas === 300000000 && eff.fees.targetBlockRate === 1 && eff.fees.minBaseFee === "25000000000");
    ok("record lists enabled precompiles + reward mode", eff.precompiles.join(",") === "nativeMinter,rewardManager" && eff.rewardManager.rewardAddress === C);
    ok("record carries recipients + total", eff.allocations.length === 2 && eff.totalTokens === "10000");
    ok("record is plain JSON (no bigint)", JSON.stringify(eff).length > 0);
    const d = describeChain({ cfg, allocation: alloc, symbol: "TST", chainId: 9000000099, name: "Test Chain" });
    ok("facts: supply and throughput are computed from the FINAL config", d.facts.some((s) => s.includes("10,000 TST to 2 addresses")) && d.facts.some((s) => s.includes("2,857 simple transfers per block") && s.includes("2,857 per second")));
    ok("can: mint is announced as NOT fixed", d.can.some((s) => s.includes("supply is NOT fixed")));
    ok("can: fee recipient named", d.can.some((s) => s.includes(C)));
    ok("cannot: permanence is always stated", d.cannot.some((s) => s.includes("permanent")) && d.cannot.some((s) => s.includes("15 permanent L1 slots")));
    const plain = describeChain({ cfg: freshCfg(), allocation: parseAllocations(undefined, A, P), symbol: "PLN", chainId: 1, name: "Plain" });
    ok("plain chain: fixed supply + fees burned are in CANNOT", plain.cannot.some((s) => s.includes("fixed at 50,000,000 forever")) && plain.cannot.some((s) => s.includes("fees are burned")));
    ok("plain chain: anyone can deploy and send", plain.can.some((s) => s === "Anyone can deploy contracts.") && plain.can.some((s) => s === "Anyone can send transactions."));
    const strict = freshCfg(); applyPrecompiles(strict, { txAllowList: true, deployerAllowList: true }, A, P);
    const sd = describeChain({ cfg: strict, allocation: parseAllocations(undefined, A, P), symbol: "S", chainId: 1, name: "Strict" });
    ok("strict chain: the stranger's position is spelled out in CANNOT", sd.cannot.some((s) => s.includes("cannot send ANY transaction")) && sd.cannot.some((s) => s.includes("cannot deploy contracts")));
  }

  console.log(`\n${fail === 0 ? "✅" : "🔴"} ${pass} passed · ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
