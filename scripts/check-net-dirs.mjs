#!/usr/bin/env node
/**
 * check-net-dirs.mjs — gate: **which generation does each `local-net/net*` directory belong
 * to, and which directory is holding REAL MONEY.**
 *
 * ═══ 🔴 WHY IT EXISTS ═══
 *
 * Measured 2026-08-28 on the dev machine: **9 `net*` directories, 3 generations mixed**, and
 * the naming says the opposite of the truth:
 *
 *   - `net-public/` — sounds like *"the public network"* — its genesis declares
 *     `networkID 9001`, a generation **dead since 2026-08-27**. But `chain-factory-key.txt`
 *     **in that same directory** is the `g0` key **currently holding ~90 LOVE9 of real
 *     money** (key sha256 `1dc334145c8a1abc`, matching the record in D-092).
 *   - `net-public-dead-720m/` — the name literally says "dead" — holds a **byte-identical
 *     copy** of that same key.
 *   - `net-that-g0/` — the ONLY directory declaring `999999999`, the live network — has **no**
 *     `chain-factory-key.txt`, and all six of its wallets hold **zero**.
 *
 * ⇒ A cleanup pass that says *"delete the 9001 directories"* **shreds a key holding money**.
 * That is precisely the failure class of gotcha 17 / D-107: *"there's already a backup, so
 * it's safe to delete"* is a **MEASUREMENT**, not a reassurance — and here nobody had taken it.
 *
 * ## WHAT THIS GATE MEASURES
 *
 * **It trusts no directory name, no allocation file, and nobody's memory.** Two independent
 * measurements:
 *
 * | Question | Measured by | Where |
 * |---|---|---|
 * | Which generation is this directory? | `genesis.json → networkID` | DISK |
 * | Does this file hold real money? | `platform.getBalance` + `avm.getBalance` on the LIVE RPC | CHAIN |
 *
 * The two **intersect** to expose the trap: *an address WITH money inside a directory that is
 * NOT the running generation*. Measure only one side and a dead directory looks safe to wipe.
 *
 * 🔴 **NEVER READS, PRINTS, OR TRANSMITS A PRIVATE KEY.** It lifts only `P-`/`X-` addresses
 * out of a file and asks the chain. Anything shaped like a private key is **stripped before
 * anything is printed**.
 *
 * ## EXIT CODES (shared convention across the tool set)
 *
 *   0  PASS          — every directory's generation is known, and no dead directory holds money
 *   1  FAIL          — at least one TRAP: real money outside the live directory, or a DECOY
 *   2  INCONCLUSIVE  — a genesis was unreadable, or the chain could not be queried
 *                      (⚠️ this is NOT "clean")
 *
 * Usage:
 *   node scripts/check-net-dirs.mjs
 *   node scripts/check-net-dirs.mjs --rpc https://rpc-a1.9chain.org
 *   node scripts/check-net-dirs.mjs --offline     # skip the chain half ⇒ can only reach exit 2
 *   node scripts/check-net-dirs.mjs --self-test   # counter-check: the gate must know how to go red
 */
import { readFileSync, existsSync, readdirSync, statSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { A1_ID_GOC, A1_GEN, TEN_MANG } from "../local-net/lib/chainid.mjs";
import { RPC_URL } from "../local-net/lib/server.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};
const RPC = flag("--rpc", RPC_URL);
const OFFLINE = argv.includes("--offline");
const SELF_TEST = argv.includes("--self-test");

/** networkID of the RUNNING network, derived from the source of truth — never hand-copied. */
const LIVE_NETWORK_ID = A1_ID_GOC - A1_GEN;
/** Top of the DRILL band. A drill network can never handshake with the real one. */
const DRILL_BAND_TOP = 899_999_999;
const BAND_WIDTH = 999; // A1Gen runs 0…999

/** X-Chain asset alias. DEFINITIVE: `LOVE9`, never `AVAX` (D-084, patch 0022). */
const ASSET_ALIAS = "LOVE9";
const SECRET_NAMES = /^(keys\.txt|faucet\.env|staker\.(key|crt)|.*key.*\.txt)$/i;
/** The shape of a private key — used to STRIP it from anything that will be printed. */
const PRIVATE_KEY_SHAPE = /(PrivateKey-[A-Za-z0-9]+|0x[0-9a-fA-F]{64})/g;
const BECH32_ADDR = /\b([PX]-[a-z0-9]{1,20}1[02-9ac-hj-np-z]{20,})\b/g;

/** Extract addresses from text AFTER erasing anything shaped like a private key. */
export function extractAddresses(text) {
  const scrubbed = text.replace(PRIVATE_KEY_SHAPE, "<KEY-REMOVED>");
  return [...new Set([...scrubbed.matchAll(BECH32_ADDR)].map((m) => m[1]))];
}

/**
 * The bech32 body without the chain prefix. `X-love9abc…` and `P-love9abc…` are the SAME
 * wallet, so ask the chain ONCE, not twice. Collapsing here stops one wallet from being
 * counted as two separate traps.
 */
export function addressBody(addr) {
  return addr.replace(/^[PX]-/, "");
}

/** Classify a networkID into one of the bands. Never guesses from the directory name. */
export function classifyNetworkId(networkId) {
  if (networkId === LIVE_NETWORK_ID) return "live";
  if (networkId <= A1_ID_GOC && networkId > A1_ID_GOC - BAND_WIDTH - 1) return "real-band-other-gen";
  if (networkId <= DRILL_BAND_TOP && networkId > DRILL_BAND_TOP - BAND_WIDTH - 1) return "drill-band";
  return "dead";
}

const LABEL = {
  live: "✅ THE RUNNING GENERATION",
  "real-band-other-gen": "🟡 real band, different generation",
  "drill-band": "🧪 DRILL band",
  dead: "⚫ outside every band — dead",
};

/** Read one net* directory: generation + secret files + addresses found. */
export function readNetDir(dir) {
  const out = { dir, networkId: null, band: null, secrets: [], addresses: [], error: null };
  const genesis = path.join(dir, "genesis.json");
  if (!existsSync(genesis)) {
    out.error = "no genesis.json";
    return out;
  }
  try {
    const g = JSON.parse(readFileSync(genesis, "utf8"));
    if (typeof g.networkID !== "number") throw new Error("genesis.json has no numeric networkID");
    out.networkId = g.networkID;
    out.band = classifyNetworkId(g.networkID);
  } catch (e) {
    out.error = e.message;
    return out;
  }
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (!statSync(full).isFile()) continue;
    if (SECRET_NAMES.test(name)) out.secrets.push(name);
    if (/\.(txt|md|env)$/i.test(name)) {
      try {
        for (const addr of extractAddresses(readFileSync(full, "utf8"))) {
          const body = addressBody(addr);
          // One wallet may appear in several files and under both prefixes, so keep ONE entry
          // listing every file that names it. Double-counting turns one wallet into several
          // "traps" and inflates the alarm.
          const seen = out.addresses.find((a) => a.body === body);
          if (seen) { if (!seen.files.includes(name)) seen.files.push(name); }
          else out.addresses.push({ body, files: [name] });
        }
      } catch { /* binary file — skip, not an error */ }
    }
  }
  return out;
}

async function rpc(chainPath, method, params) {
  const res = await fetch(`${RPC}${chainPath}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();
  if (j.error) throw new Error(j.error.message ?? "RPC error");
  return j.result;
}

/**
 * One wallet's balance, measured on BOTH chains.
 *
 * 🔴 The bech32 body is identical across chains — `X-love9abc…` and `P-love9abc…` are the
 * SAME wallet. But each chain keeps its own ledger, and `platform.getBalance` **rejects** an
 * `X-` address outright (`mismatched chainIDs`). Asking only P and then concluding "0" is
 * measuring the wrong quantity: a wallet holding funds only on X would read as clean, and the
 * directory containing it would look safe to delete.
 */
export async function walletBalance(body, ask = rpc) {
  let total = 0n;
  const errors = [];
  // P-Chain's `balance` ALREADY INCLUDES the locked portion — measured on the Community fund:
  // `balance` = `lockedStakeable` = 2,600,000,001. So there is no need to sum the fields by
  // hand, and reading `unlocked` alone would be wrong: a locked fund would read 0 and the
  // directory holding it would look clean.
  try {
    const r = await ask("/ext/bc/P", "platform.getBalance", { addresses: [`P-${body}`] });
    total += BigInt(r?.balance ?? "0");
  } catch (e) { errors.push(`P: ${e.message}`); }
  try {
    const r = await ask("/ext/bc/X", "avm.getBalance", { address: `X-${body}`, assetID: ASSET_ALIAS });
    total += BigInt(r?.balance ?? "0");
  } catch (e) { errors.push(`X: ${e.message}`); }
  // 🔴 One failed half must NOT be summed into a number. The g0 Foundation fund measures
  // P = 0 and X = 70,999,918 — so if the X half fails and we still return `0`, the directory
  // holding that key reads CLEAN. "Could not measure" is INCONCLUSIVE, not "has no money".
  // (null is not the empty list.)
  if (errors.length) throw new Error(errors.join(" · "));
  return total;
}

async function main() {
  if (SELF_TEST) return selfTest();

  console.log(`\n══ NETWORK DIRECTORIES — ${ROOT}/local-net ══`);
  console.log(`   running network: networkID ${LIVE_NETWORK_ID} · ${TEN_MANG} (A1Gen ${A1_GEN})`);
  console.log(`   ${OFFLINE ? "⚠️  --offline: SKIPPING the on-chain half" : `RPC: ${RPC}`}\n`);

  const base = path.join(ROOT, "local-net");
  const dirs = readdirSync(base)
    .filter((n) => n === "net" || n.startsWith("net-"))
    .map((n) => path.join(base, n))
    .filter((p) => statSync(p).isDirectory())
    .sort();

  if (dirs.length === 0) {
    console.log("  (no net* directory — this machine has not generated a network)");
    return 0;
  }

  const reports = dirs.map(readNetDir);
  let unresolved = reports.filter((r) => r.error).length;
  const traps = [];
  const decoys = [];

  for (const r of reports) {
    const name = path.basename(r.dir);
    if (r.error) {
      console.log(`  ⁇ ${name.padEnd(26)} INCONCLUSIVE — ${r.error}`);
      continue;
    }
    console.log(`  ${name.padEnd(26)} networkID ${String(r.networkId).padEnd(11)} ${LABEL[r.band]}`);
    if (r.secrets.length) console.log(`     secrets: ${r.secrets.join(" · ")}`);

    if (OFFLINE) {
      if (r.addresses.length) {
        unresolved++;
        console.log(`     ⁇ ${r.addresses.length} address(es) NOT measured on chain (--offline)`);
      }
      continue;
    }

    let funded = 0;
    for (const { body, files } of r.addresses) {
      let bal;
      try {
        bal = await walletBalance(body);
      } catch (e) {
        unresolved++;
        console.log(`     ⁇ ${body.slice(0, 18)}… could not ask the chain (${e.message})`);
        continue;
      }
      if (bal === 0n) continue;
      funded++;
      // 🔴 Print the amount with FIXED precision and no locale separators. Reading a
      // `toLocaleString` result across locales is how this very session mis-stated the
      // factory wallet by a factor of 1000: `vi-VN` renders 90.008 as "90,008", which an
      // English reader parses as ninety THOUSAND. An unambiguous number costs nothing.
      const love9 = (Number(bal) / 1e9).toFixed(9).replace(/0+$/, "").replace(/\.$/, "");
      const where = `${files.join("+")} → ${body.slice(0, 18)}…`;
      if (r.band === "live") {
        console.log(`     ✓ ${where} holds ${love9} LOVE9 (correct directory)`);
      } else {
        traps.push({ dir: name, files, body, love9, band: r.band });
        console.log(`     🔴 TRAP — ${where} holds ${love9} LOVE9`);
        console.log(`             …inside a directory that is ${LABEL[r.band]}. Deleting it LOSES MONEY.`);
      }
    }
    if (r.addresses.length && funded === 0) {
      if (r.band === "live") {
        // 🔴 DECOY. The directory declares exactly the running network's networkID, yet no
        // wallet holds anything, so this is the key set of a DIFFERENT generation run in the
        // same band. More dangerous than a dead 9001 set: there the networkID differs, so
        // something can at least warn; here the networkID MATCHES, `check-keys` scores 6/6 and
        // no gate makes a sound. Exactly the thing that gets filed away as the "fund key
        // backup" for O1/B-16.
        decoys.push({ dir: name, wallets: r.addresses.length });
        console.log(`     🔴 DECOY — networkID MATCHES the running network, yet all ${r.addresses.length} wallets are empty`);
        console.log(`             => key set from a DIFFERENT generation run. DO NOT keep this as the fund backup.`);
      } else {
        console.log(`     · ${r.addresses.length} wallet(s), all zero on the running network`);
      }
    }
  }

  console.log();
  if (decoys.length) {
    console.log(`🔴 FAIL — ${decoys.length} DECOY directory/directories (networkID matches the live network, money = 0):`);
    for (const d of decoys) console.log(`   ${d.dir}/ — ${d.wallets} wallets, none funded`);
    console.log(`\n   The REAL g0 fund key set lives in C:\\Users\\abc\\9chain-a1-keys\\g0\\.`);
    console.log(`   Verify with \`node scripts/o1-check.mjs <dir>\`; never judge by directory name.`);
  }
  if (traps.length) {
    console.log(`🔴 FAIL — ${traps.length} file(s) holding REAL MONEY outside the live generation's directory:`);
    for (const t of traps) console.log(`   ${t.dir}/${t.files.join("+")} — ${t.love9} LOVE9`);
    console.log(`\n   => DO NOT delete by directory. Move the key into the live generation's directory FIRST,`);
    console.log(`      verify \`sha256\` FILE BY FILE, and only then clean up. (gotcha 17 · D-107)`);
    return 1;
  }
  if (decoys.length) return 1;
  if (unresolved) {
    console.log(`⁇ INCONCLUSIVE — ${unresolved} item(s) could not be measured.`);
    console.log(`   "could not measure" is NOT "clean". Re-run when the chain is reachable.`);
    return 2;
  }
  console.log(`✅ PASS — all ${reports.length} directories have a known generation, and no dead one holds money.`);
  return 0;
}

/** Counter-check — the gate must go red when it should, and red FOR THE RIGHT REASON. */
async function selfTest() {
  let pass = 0;
  let fail = 0;
  const ok = (name, cond, seen) => {
    if (cond) { pass++; console.log(`  ✓ ${name}`); }
    else { fail++; console.log(`  ✗ ${name}  — got: ${seen}`); }
  };

  console.log("\n══ COUNTER-CHECK — check-net-dirs ══\n");

  console.log("── 1. Band classification ──");
  ok("the running network's networkID => live", classifyNetworkId(LIVE_NETWORK_ID) === "live", classifyNetworkId(LIVE_NETWORK_ID));
  ok("🔴 9001 (the dead generation) => NOT live", classifyNetworkId(9001) !== "live", classifyNetworkId(9001));
  ok("🔴 9001 lands in 'dead', not in any band", classifyNetworkId(9001) === "dead", classifyNetworkId(9001));
  ok("🔴 899999999 => DRILL band, NOT live", classifyNetworkId(899_999_999) === "drill-band", classifyNetworkId(899_999_999));
  ok("🔴 999999998 (the NEXT generation) => real band but NOT live", classifyNetworkId(999_999_998) === "real-band-other-gen", classifyNetworkId(999_999_998));

  console.log("\n── 2. A private key must never escape ──");
  const leaky = `P-love91vgh2whn746dzzvg0dj4w9rsqvlalcldvpueuvj\nPrivateKey-abcDEF123\n0x${"a".repeat(64)}`;
  const got = extractAddresses(leaky);
  ok("🔴 a PrivateKey- string never reaches the result", !got.some((a) => a.includes("PrivateKey")), got.join(","));
  ok("🔴 an EVM key (0x + 64 hex) never reaches the result", !got.some((a) => /^0x/.test(a)), got.join(","));
  ok("a P- address IS still extracted", got.length === 1 && got[0].startsWith("P-love9"), got.join(","));

  console.log("\n── 3. A failed chain half must NOT be summed as zero ──");
  // A real case: the g0 Foundation fund measures P = 0 and X = 70,999,918 LOVE9. If the X
  // half fails and the gate still returns `0`, the directory holding that key reads CLEAN
  // and gets cleaned away.
  const askBoth = async (p) => (p === "/ext/bc/P" ? { balance: "0" } : { balance: "70999918989000000" });
  const askXBroken = async (p) => {
    if (p === "/ext/bc/P") return { balance: "0" };
    throw new Error("pretending X is down");
  };
  const results = [];
  await walletBalance("love9test", askBoth).then((v) => results.push(["both-ok", v]), (e) => results.push(["both-ok-THREW", e.message]));
  await walletBalance("love9test", askXBroken).then((v) => results.push(["x-down", v]), (e) => results.push(["x-down-THREW", e.message]));
  ok("both halves healthy => correct total (money sitting on X is still seen)",
    results[0][0] === "both-ok" && results[0][1] === 70999918989000000n, String(results[0][1]));
  ok("🔴 X half down => THROWS, does NOT return 0 (could-not-measure is not has-no-money)",
    results[1][0] === "x-down-THREW", String(results[1][1]));

  console.log("\n── 4. Reading a directory — hand-built cases ──");
  const tmp = mkdtempSync(path.join(os.tmpdir(), "a1-netdirs-"));
  try {
    const dead = path.join(tmp, "net-looks-official");
    const live = path.join(tmp, "net-that-g0");
    for (const d of [dead, live]) mkdirSync(d, { recursive: true });
    writeFileSync(path.join(dead, "genesis.json"), JSON.stringify({ networkID: 9001 }));
    writeFileSync(path.join(dead, "chain-factory-key.txt"),
      "PrivateKey-NOTREAL\n  P-addr : P-love91vgh2whn746dzzvg0dj4w9rsqvlalcldvpueuvj\n");
    writeFileSync(path.join(live, "genesis.json"), JSON.stringify({ networkID: LIVE_NETWORK_ID }));

    const rDead = readNetDir(dead);
    ok("🔴 an official-SOUNDING directory is still judged by its genesis, not its name",
      rDead.band === "dead", `${rDead.band}`);
    ok("a secret file inside a dead directory is detected",
      rDead.secrets.includes("chain-factory-key.txt"), rDead.secrets.join(","));
    ok("a P- address is extracted so it can be asked about on chain",
      rDead.addresses.some((a) => a.body.startsWith("love9")), JSON.stringify(rDead.addresses));
    ok("🔴 and the private key on the line above is NOT carried along",
      !JSON.stringify(rDead.addresses).includes("PrivateKey"), JSON.stringify(rDead.addresses));

    const rLive = readNetDir(live);
    ok("CONTROL — a directory matching the live networkID => live", rLive.band === "live", rLive.band);

    const broken = path.join(tmp, "net-broken");
    mkdirSync(broken, { recursive: true });
    writeFileSync(path.join(broken, "genesis.json"), "{ not json");
    ok("🔴 a broken genesis => INCONCLUSIVE, NOT scored as clean",
      readNetDir(broken).error !== null, String(readNetDir(broken).error));

    const noGenesis = path.join(tmp, "net-no-genesis");
    mkdirSync(noGenesis, { recursive: true });
    ok("🔴 a missing genesis.json => INCONCLUSIVE, NOT scored as clean",
      readNetDir(noGenesis).error !== null, String(readNetDir(noGenesis).error));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  console.log(`\n${fail === 0 ? "✅" : "🔴"} ${pass} passed · ${fail} failed`);
  return fail === 0 ? 0 : 1;
}

main().then((code) => process.exit(code)).catch((e) => {
  console.error(`\n🔴 ${e.stack ?? e.message}`);
  process.exit(2);
});
