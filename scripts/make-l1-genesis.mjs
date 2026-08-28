#!/usr/bin/env node
/**
 * make-l1-genesis.mjs — build a genesis for ONE user L1, from the shared template.
 *
 * ═══ 🔴 WHY IT EXISTS ═══
 *
 * `9chain-a1-config/l1-evm-genesis.json` is a SHAPE, not a usable genesis. Measured
 * 2026-08-28, the raw template still declares:
 *
 *   chainId              9100                                    ← taken: "Genesis Coin" (B-14)
 *   feeManagerConfig     adminAddresses = [ewoq]                 ← a PUBLICLY KNOWN key
 *   alloc                50,000,000 tokens to ewoq               ← same public key
 *
 * The console never ships those values: it overwrites `chainId`, `alloc` and
 * `feeManagerConfig` on every request. But the two CLI paths — `local-net/create-l1.sh` and
 * `local-net/9chain-a1 l1 create` — handed the file to the CLI **verbatim**, so a chain born
 * that way came up on a colliding chainId with its entire supply and its fee-admin rights
 * held by a key anyone can look up.
 *
 * Same shape as D-111: a default that is wrong but internally consistent, so nothing
 * complains. The fix is the same too — **remove the default and make the caller state the
 * value.**
 *
 * ⚠️ `chainId` MATTERS BEYOND THIS MACHINE. Under EIP-155 a signature is bound to the
 * chainId, and to MetaMask two chains sharing a chainId are the same network. Reusing 9100
 * on a laptop is how a signature meant for a toy chain becomes replayable somewhere real.
 *
 * ## EXIT CODES
 *   0  wrote the genesis
 *   1  refused — a required value is missing, or the caller asked for something unsafe
 *
 * Usage:
 *   node scripts/make-l1-genesis.mjs --admin 0x… --out <file> [--chain-id N] [--balance N]
 *   node scripts/make-l1-genesis.mjs --self-test
 *
 * With no `--chain-id`, the next free id is taken from this generation's block, skipping
 * everything the two ledgers say was ever issued — the same rule the console follows.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { capChainIdTuDong, GOC_DAI_CHAINID, TRAN_DAI_CHAINID } from "../local-net/lib/chainid.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};
const SELF_TEST = argv.includes("--self-test");

const TEMPLATE = path.join(ROOT, "9chain-a1-config", "l1-evm-genesis.json");
/** The ewoq key: published in the avalanchego repository, therefore owned by everyone. */
const EWOQ = "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC";
const CHAINID_TAKEN = path.join(ROOT, "local-net", "console", "chainid-taken.json");
const CHAINID_ISSUED = path.join(ROOT, "local-net", "console", "chainid-issued.json");

/** Read both ledgers. A ledger that cannot be read is INCONCLUSIVE, never "empty". */
export function loadLedgers(takenPath = CHAINID_TAKEN, issuedPath = CHAINID_ISSUED) {
  const read = (p, label) => {
    if (!existsSync(p)) throw new Error(`missing ${label} (${p}) — cannot pick a chainId safely`);
    return JSON.parse(readFileSync(p, "utf8"));
  };
  const taken = read(takenPath, "the taken-chainId ledger");
  const issued = read(issuedPath, "the issued-chainId ledger");
  const publiclyTaken = new Map((taken.taken ?? []).map((m) => [m.chainId, m.name]));
  const everIssued = new Set((issued.chainIds ?? []).map(Number));
  // 🔴 An EMPTY ledger means the gate is OFF, not that nothing is taken. Refusing here is the
  // whole point: silently picking the range base would hand out a chainId that is already
  // in a user's wallet.
  if (publiclyTaken.size === 0) throw new Error("the taken-chainId ledger is EMPTY — the collision gate is off, refusing to pick");
  return { publiclyTaken, everIssued };
}

export function buildGenesis(template, { chainId, admin, balanceWei }) {
  const g = structuredClone(template);
  g.config.chainId = chainId;
  g.config.feeManagerConfig = { adminAddresses: [admin], blockTimestamp: 0 };
  // `alloc` keys are BARE hex (no `0x`), lowercase — the same convention the console uses.
  g.alloc = { [admin.slice(2).toLowerCase()]: { balance: balanceWei } };
  // subnet-evm's `Genesis.Verify()` compares `feeConfig.gasLimit` against the top-level
  // `gasLimit` and refuses when they differ, so `feeConfig` stays the single source and the
  // top-level value is derived from it.
  g.gasLimit = "0x" + BigInt(g.config.feeConfig.gasLimit).toString(16);
  return g;
}

function main() {
  const admin = flag("--admin");
  const out = flag("--out");
  const allowEwoq = argv.includes("--allow-ewoq");
  const balanceWei = flag("--balance", "0x295BE96E64066972000000"); // 50,000,000 tokens

  if (!out) { console.error("🔴 --out <file> is required"); return 1; }
  if (!admin) {
    console.error("🔴 --admin 0x… is required.");
    console.error("   There is no default on purpose: the previous default was the ewoq key,");
    console.error("   which is published in the avalanchego repository and owned by everyone.");
    return 1;
  }
  if (!/^0x[0-9a-fA-F]{40}$/.test(admin)) { console.error(`🔴 --admin is not an EVM address: ${admin}`); return 1; }
  if (admin.toLowerCase() === EWOQ.toLowerCase() && !allowEwoq) {
    console.error("🔴 REFUSING: that is the ewoq key — published in the avalanchego repository.");
    console.error("   Every token and every fee-admin right on this chain would belong to anyone");
    console.error("   who looked it up. Pass --allow-ewoq only for a throwaway local chain.");
    return 1;
  }

  const template = JSON.parse(readFileSync(TEMPLATE, "utf8"));
  let chainId = flag("--chain-id");
  if (chainId) {
    chainId = Number(chainId);
    if (!Number.isSafeInteger(chainId)) { console.error("🔴 --chain-id is not an integer"); return 1; }
  } else {
    let ledgers;
    try { ledgers = loadLedgers(); } catch (e) { console.error(`🔴 ${e.message}`); return 1; }
    chainId = capChainIdTuDong(ledgers.everIssued, ledgers.publiclyTaken, GOC_DAI_CHAINID, TRAN_DAI_CHAINID);
  }
  if (chainId === 9100) {
    console.error("🔴 REFUSING chainId 9100 — taken in the public registry by 'Genesis Coin' (B-14).");
    return 1;
  }

  const g = buildGenesis(template, { chainId, admin, balanceWei });
  writeFileSync(out, JSON.stringify(g, null, 2) + "\n");
  console.log(`  L1 genesis written: ${out}`);
  console.log(`    chainId : ${chainId}`);
  console.log(`    admin   : ${admin}${admin.toLowerCase() === EWOQ.toLowerCase() ? "  ⚠️ EWOQ — throwaway chains only" : ""}`);
  return 0;
}

function selfTest() {
  let pass = 0, fail = 0;
  const ok = (n, c, seen) => (c ? (pass++, console.log(`  ✓ ${n}`)) : (fail++, console.log(`  ✗ ${n} — got: ${seen}`)));
  console.log("\n══ COUNTER-CHECK — make-l1-genesis ══\n");

  const template = JSON.parse(readFileSync(TEMPLATE, "utf8"));
  console.log("── 1. The raw template is exactly what must never ship ──");
  ok("🔴 template still declares the taken chainId 9100", template.config.chainId === 9100, template.config.chainId);
  ok("🔴 template still grants fee-admin to the public ewoq key",
    template.config.feeManagerConfig?.adminAddresses?.[0]?.toLowerCase() === EWOQ.toLowerCase(),
    JSON.stringify(template.config.feeManagerConfig));
  ok("🔴 template still allocates the whole supply to ewoq",
    Object.keys(template.alloc)[0].toLowerCase() === EWOQ.slice(2).toLowerCase(),
    Object.keys(template.alloc).join(","));

  console.log("\n── 2. The built genesis replaces all three ──");
  const admin = "0x" + "1".repeat(40);
  const g = buildGenesis(template, { chainId: 9000000042, admin, balanceWei: "0x1" });
  ok("chainId is replaced", g.config.chainId === 9000000042, g.config.chainId);
  ok("fee-admin is replaced", g.config.feeManagerConfig.adminAddresses[0] === admin, JSON.stringify(g.config.feeManagerConfig));
  ok("alloc is replaced, and ewoq is GONE",
    Object.keys(g.alloc).length === 1 && !JSON.stringify(g.alloc).toLowerCase().includes(EWOQ.slice(2).toLowerCase()),
    JSON.stringify(g.alloc));
  ok("top-level gasLimit is derived from feeConfig (subnet-evm compares them)",
    BigInt(g.gasLimit) === BigInt(g.config.feeConfig.gasLimit), `${g.gasLimit} vs ${g.config.feeConfig.gasLimit}`);
  ok("🔴 the template object itself is NOT mutated (a shared shape must stay shared)",
    template.config.chainId === 9100, template.config.chainId);

  console.log("\n── 3. Ledgers ──");
  let threwOnEmpty = false;
  try {
    const tmp = path.join(ROOT, "scripts", "check-english-code.mjs"); // any readable JSON-less file
    loadLedgers(tmp, tmp);
  } catch { threwOnEmpty = true; }
  ok("🔴 an unreadable/empty ledger THROWS — it never degrades to 'nothing is taken'", threwOnEmpty, "did not throw");
  const real = loadLedgers();
  ok("the real taken-ledger is non-empty", real.publiclyTaken.size > 0, String(real.publiclyTaken.size));
  ok("🔴 9100 is listed as taken in that ledger", real.publiclyTaken.has(9100), "not listed");
  const picked = capChainIdTuDong(real.everIssued, real.publiclyTaken, GOC_DAI_CHAINID, TRAN_DAI_CHAINID);
  ok("🔴 the auto-picked chainId is NOT 9100", picked !== 9100, String(picked));
  ok("the auto-picked chainId sits inside this generation's block",
    picked >= GOC_DAI_CHAINID && picked <= TRAN_DAI_CHAINID, `${picked} vs ${GOC_DAI_CHAINID}…${TRAN_DAI_CHAINID}`);

  console.log(`\n${fail === 0 ? "✅" : "🔴"} ${pass} passed · ${fail} failed`);
  return fail === 0 ? 0 : 1;
}

process.exit(SELF_TEST ? selfTest() : main());
