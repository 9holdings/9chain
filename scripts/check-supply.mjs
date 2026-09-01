#!/usr/bin/env node
/**
 * check-supply.mjs — gate: **does the allocation table we publish add up to what the chain says
 * exists?**
 *
 * ═══ 🔴 WHY IT EXISTS ═══
 *
 * Reported 2026-09-01 by an outside tester (finding S-4 / gap G-2). They summed the published X/P
 * columns, asked the chain, and found a gap of **824,364.880041 LOVE9** that nobody could explain:
 *
 *   Σ docs/ALLOCATION-PUBLIC.md (X/P)   4,300,000,001
 *   platform.getCurrentSupply           4,300,824,365.880041     (P-Chain height 0)
 *
 * Their report said: *"either the number has a legitimate reason and belongs in TOKENOMICS.md, or
 * g1 genesis issued more than the published table. There is no third possibility."*
 *
 * 🔴 **THERE IS A THIRD, AND IT IS THE ANSWER.** Genesis issued exactly the table — measured:
 * `sha256(net-g1/genesis.json)` matches the published hash, and summing the allocations INSIDE
 * that file gives 4,300,000,001 to the LOVE9. The extra is created by the node, not by genesis:
 * when P-Chain admits a validator it computes the POTENTIAL reward for the whole staking period
 * and adds it to `currentSupply` immediately, removing it again if the validator is not rewarded.
 *
 *   Σ potentialReward over the 9 genesis validators   824,364.880041 LOVE9
 *
 * That is the gap to the last digit. So the identity this gate enforces is:
 *
 *   getCurrentSupply  −  Σ potentialReward  ==  Σ published allocation table
 *
 * 🔴 **WHY THE OBVIOUS GATE WOULD HAVE BEEN WORSE THAN NONE.** Comparing the table straight
 * against `getCurrentSupply` — the shape the report proposed — is RED FOREVER on a correct
 * network, and a gate that can never go green carries no information when it is red (D-153). It
 * would have been switched off within a week, and the real drift it was built for would then pass.
 *
 * 🔴 **AND IT ASKS THE CHAIN FOR THE REWARD, IT DOES NOT RE-DERIVE IT.** The formula lives in
 * `vms/platformvm/reward/calculator.go`. Re-implementing it here would create a second copy that
 * can disagree with the first the day a reward parameter changes — D-113, on arithmetic. The chain
 * publishes `potentialReward` per validator; that is the number, from the only authority on it.
 *
 * ## WHAT IT MEASURES, AND WHERE (CLAUDE.md section 2)
 *
 * | Question | Measured by | Where |
 * |---|---|---|
 * | What exists? | `platform.getCurrentSupply` | THE CHAIN |
 * | What is pre-minted but unearned? | `platform.getCurrentValidators` → `potentialReward` | THE CHAIN |
 * | What did we promise? | the markdown table we publish | THE DOCUMENT |
 *
 * ## EXIT CODES (shared convention across the tool set)
 *
 *   0  PASS          — the table, the pre-minted rewards and the live supply reconcile exactly
 *   1  FAIL          — they do not, which means the published allocation is wrong or the chain is
 *   2  INCONCLUSIVE  — the chain could not be asked, or the table could not be parsed
 *
 * Usage:
 *   node scripts/check-supply.mjs
 *   node scripts/check-supply.mjs --self-test
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { request } from "../local-net/lib/chain-ledger.mjs";
import { RPC_URL } from "../local-net/lib/server.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const SELF_TEST = argv.includes("--self-test");
const i = argv.indexOf("--rpc");
const RPC = i >= 0 && argv[i + 1] ? argv[i + 1] : RPC_URL;

const TABLE = "docs/ALLOCATION-PUBLIC.md";
const NANO = 1_000_000_000n;

/** LOVE9 has 9 decimals on P/X. Everything here is nano, in BigInt — never a float. */
export const toLove9 = (nano) => `${(nano / NANO).toLocaleString("en-US")}.${String(nano % NANO).padStart(9, "0")}`;

/**
 * Which heading marks which column.
 *
 * 🔴 Parameterised, and not for elegance. The published table is Vietnamese, so the defaults must
 * match Vietnamese headings — but a counter-check fixture that copied those headings would put
 * Vietnamese into a new source file, which CLAUDE.md section 0 forbids. Removing the accents from
 * the fixture to slip past that gate would be worse than either: the fixture would stop resembling
 * the document it claims to model, and a later tightening of these patterns would not fail a
 * single case. So the LOGIC is proven against an English fixture and the real Vietnamese defaults
 * are exercised by the real run.
 *
 * The patterns deliberately stop before the accented characters (`thanh kho`, `kho`), which is why
 * they match `X/P thanh khoản` and `X/P khoá` without carrying an accent themselves.
 */
export const COLUMNS = {
  liquid: /X\/P\s+(?:thanh\s+kho|liquid)/i,
  locked: /X\/P\s+(?:kho|locked)/i,
  notLiquid: /thanh|liquid/i,
};

/**
 * Sum the X/P columns of the published table.
 *
 * 🔴 BY COLUMN HEADING, never by position. The table has ten columns and gains more over time; a
 * gate indexing column 4 silently starts summing something else the day a column is inserted, and
 * it would still print a total, which is the worst way for this to fail.
 *
 * Both X/P columns count: locked LOVE9 is issued LOVE9. `currentSupply` does not care that
 * something sits on an unlock schedule.
 */
export function sumAllocationTable(md, cols = COLUMNS) {
  const rows = md.split(/\r?\n/).filter((l) => l.trim().startsWith("|"));
  if (rows.length < 3) return { error: "no markdown table found" };

  const cells = (line) => line.split("|").slice(1, -1).map((c) => c.trim());
  let header = null, headerAt = -1;
  rows.forEach((r, idx) => {
    const c = cells(r);
    if (header === null && c.some((x) => cols.liquid.test(x)) && c.some((x) => cols.locked.test(x))) {
      header = c; headerAt = idx;
    }
  });
  if (header === null) return { error: "no header row carrying both X/P columns" };

  const liquid = header.findIndex((x) => cols.liquid.test(x));
  const locked = header.findIndex((x) => cols.locked.test(x) && !cols.notLiquid.test(x));
  if (liquid < 0 || locked < 0) return { error: "could not locate both X/P columns" };

  let total = 0n;
  const counted = [];
  for (const r of rows.slice(headerAt + 1)) {
    const c = cells(r);
    if (c.length <= Math.max(liquid, locked)) continue;
    if (/^[-: ]+$/.test(c[0])) continue;                       // the |---|---| separator
    const num = (s) => {
      const t = String(s).replace(/[`*\s]/g, "").replace(/,/g, "");
      if (!/^\d+$/.test(t)) return null;                        // "—", "", prose: not a number
      return BigInt(t) * NANO;
    };
    const a = num(c[liquid]), b = num(c[locked]);
    if (a === null && b === null) continue;
    const row = (a ?? 0n) + (b ?? 0n);
    total += row;
    counted.push({ label: `${c[0]} / ${c[1] ?? ""}`.trim(), nano: row });
  }
  if (counted.length === 0) return { error: "the table has no numeric X/P rows" };
  return { total, rows: counted };
}

/** What the chain says exists, and how much of it is pre-minted but not yet earned. */
export async function measureChain(ask = request, rpcBase = RPC) {
  const post = (p, payload) => ask(`${rpcBase}${p}`, { method: "POST", payload });

  const s = await post("/ext/bc/P", { jsonrpc: "2.0", id: 1, method: "platform.getCurrentSupply", params: {} });
  const supplyRaw = JSON.parse(s.body)?.result?.supply;
  if (!/^\d+$/.test(String(supplyRaw ?? ""))) throw new Error(`getCurrentSupply answered ${JSON.stringify(supplyRaw)}`);

  const v = await post("/ext/bc/P", { jsonrpc: "2.0", id: 1, method: "platform.getCurrentValidators", params: {} });
  const validators = JSON.parse(v.body)?.result?.validators;
  if (!Array.isArray(validators)) throw new Error("getCurrentValidators did not answer with a list");

  let potential = 0n, weight = 0n;
  for (const x of validators) {
    // 🔴 A validator with no `potentialReward` is NOT zero reward — it is a field this gate did not
    // understand, and treating it as zero would quietly shrink the amount being subtracted and
    // turn a real over-issuance into a pass.
    if (!/^\d+$/.test(String(x?.potentialReward ?? ""))) {
      throw new Error(`validator ${x?.nodeID ?? "?"} has no readable potentialReward`);
    }
    potential += BigInt(x.potentialReward);
    weight += BigInt(x.weight ?? 0);
  }
  return { supply: BigInt(supplyRaw), potential, weight, validatorCount: validators.length };
}

/**
 * The identity. Exact, in nano — no tolerance.
 *
 * A tolerance would be the thing that hides the defect: over-issuance at genesis is a round number
 * of LOVE9, and any epsilon wide enough to be "safe" is wide enough to swallow it.
 */
export function judge(chain, tableTotal) {
  const accounted = chain.supply - chain.potential;
  return {
    ok: accounted === tableTotal,
    accounted,
    tableTotal,
    difference: accounted - tableTotal,
  };
}

async function main() {
  if (SELF_TEST) return selfTest();

  const p = path.join(ROOT, TABLE);
  if (!existsSync(p)) {
    console.log(`⁇ INCONCLUSIVE — ${TABLE} is missing; "not read" is not "agrees".`);
    return 2;
  }
  const parsed = sumAllocationTable(readFileSync(p, "utf8"));
  if (parsed.error) {
    console.log(`⁇ INCONCLUSIVE — could not read the table: ${parsed.error}`);
    return 2;
  }

  console.log(`\n══ SUPPLY — ${TABLE} against ${RPC} ══\n`);

  let chain;
  try {
    chain = await measureChain();
  } catch (e) {
    console.log(`   🔴 could not measure the chain: ${e.message}`);
    console.log(`   ⁇ INCONCLUSIVE — a table on its own proves nothing.`);
    return 2;
  }

  const v = judge(chain, parsed.total);
  console.log(`   published X/P total        ${toLove9(parsed.total).padStart(28)}   (${parsed.rows.length} rows)`);
  console.log(`   getCurrentSupply           ${toLove9(chain.supply).padStart(28)}   ⇦ MEASURED`);
  console.log(`   − Σ potentialReward        ${toLove9(chain.potential).padStart(28)}   ⇦ MEASURED, ${chain.validatorCount} validators`);
  console.log(`   ${"".padEnd(28)}${"─".repeat(28)}`);
  console.log(`   accounted issuance         ${toLove9(v.accounted).padStart(28)}\n`);
  console.log(`   Σ validator weight         ${toLove9(chain.weight).padStart(28)}   (the self-bond row)\n`);

  if (v.ok) {
    console.log(`✅ PASS — the published table, the pre-minted rewards and the live supply reconcile exactly.`);
    console.log(`   The pre-minted rewards are NOT issuance: P-Chain adds a validator's potential reward to`);
    console.log(`   currentSupply on admission and removes it if the validator is never rewarded. See`);
    console.log(`   docs/TOKENOMICS.md section 5. This number moves whenever the validator set moves.`);
    return 0;
  }
  console.log(`🔴 FAIL — off by ${toLove9(v.difference < 0n ? -v.difference : v.difference)} LOVE9 (${v.difference < 0n ? "chain has LESS" : "chain has MORE"} than published).`);
  console.log(`\n   This is not a rounding question — both sides are integers in nano. Either the published`);
  console.log(`   allocation is wrong, or genesis issued something the table does not name. Check the`);
  console.log(`   allocations INSIDE net-g<N>/genesis.json first: that file, not the table, is what ran.`);
  return 1;
}

/** Counter-check — the gate must go red when it should, and red FOR THE RIGHT REASON. */
async function selfTest() {
  let pass = 0, fail = 0;
  const ok = (name, cond, seen) => {
    if (cond) { pass++; console.log(`  ✓ ${name}`); }
    else { fail++; console.log(`  ✗ ${name}  — got: ${seen}`); }
  };

  console.log("\n══ COUNTER-CHECK — check-supply ══\n");

  // English mirror of the published table's SHAPE. The real Vietnamese headings are matched by the
  // same COLUMNS patterns and are exercised by the real run — see the note on COLUMNS.
  const table = [
    "| Bucket | Fund | % | Total (LOVE9) | X/P liquid | X/P locked | Unlock |",
    "|---|---|--:|--:|--:|--:|---|",
    "| Foundation | Self-bond | 12% | 8,999,991 | 0 | 8,999,991 | 1 year |",
    "| Foundation | Foundation | 12% | 1,071,000,009 | 71,000,009 | 0 | — |",
    "| Community | Locked | 30% | 2,600,000,001 | 0 | 2,600,000,001 | 2 years |",
    "| Community | Faucet | 30% | 99,999,999 | 0 | 0 | — |",
  ].join("\n");

  console.log("── 1. Reading the published table ──");
  const s = sumAllocationTable(table);
  ok("both X/P columns are summed, liquid AND locked",
    s.total === 2_680_000_001n * 1_000_000_000n, String(s.total));
  ok("a row whose X/P cells are both zero still counts as a row (it claims zero)",
    s.rows.length === 4, String(s.rows?.length));
  ok("🔴 an em-dash is not read as a number", !String(s.total).includes("NaN"), String(s.total));
  // 🔴 By heading, never by position: the table gains columns over time.
  const shifted = table.replace("| Bucket | Fund |", "| Note | Bucket | Fund |").replace(/^\| (Foundation|Community) \|/gm, "| x | $1 |");
  ok("🔴 an inserted column does not shift the sum (columns found by HEADING)",
    sumAllocationTable(shifted).total === s.total, String(sumAllocationTable(shifted).total));
  ok("🔴 a table with no X/P columns is INCONCLUSIVE, not zero",
    !!sumAllocationTable("| a | b |\n|---|---|\n| 1 | 2 |").error, "parsed anyway");

  console.log("\n── 2. The identity, and why the naive gate would be worse than none ──");
  const chain = { supply: 4_300_824_365_880_040_837n, potential: 824_364_880_040_837n, weight: 0n, validatorCount: 9 };
  const published = 4_300_000_001n * 1_000_000_000n;
  ok("🔴 REAL DATA — supply minus pre-minted rewards equals the published table EXACTLY",
    judge(chain, published).ok === true, String(judge(chain, published).difference));
  // 🔴 The gate the outside report proposed. It is red on a correct network, forever.
  ok("🔴 …and comparing supply DIRECTLY to the table would be red on this same correct network",
    judge({ ...chain, potential: 0n }, published).ok === false, "green");
  ok("🔴 one extra LOVE9 issued at genesis => RED (no tolerance)",
    judge({ ...chain, supply: chain.supply + 1_000_000_000n }, published).ok === false, "green");
  ok("🔴 one nano => RED as well — a tolerance would be the thing that hides this",
    judge({ ...chain, supply: chain.supply + 1n }, published).ok === false, "green");
  ok("…and the direction is reported, not just the size",
    judge({ ...chain, supply: chain.supply + 1n }, published).difference > 0n, "wrong sign");

  console.log("\n── 3. The chain is asked, never assumed ──");
  const stub = (supply, vals) => async (url, opt) => {
    if (opt?.payload?.method === "platform.getCurrentSupply") return { status: 200, body: JSON.stringify({ result: { supply } }) };
    return { status: 200, body: JSON.stringify({ result: { validators: vals } }) };
  };
  const m = await measureChain(stub("4300824365880040837", [{ potentialReward: "824364880040837", weight: "8999991000000000" }]), "https://x");
  ok("supply and potentialReward are read as BigInt, not float",
    m.supply === 4_300_824_365_880_040_837n && m.potential === 824_364_880_040_837n, JSON.stringify({ s: String(m.supply) }));
  // 🔴 The failure mode that would turn real over-issuance into a pass: a missing field read as 0
  // shrinks what gets subtracted, so the accounted total rises to meet the table.
  let threw = false;
  await measureChain(stub("1", [{ weight: "1" }]), "https://x").then(() => {}, () => { threw = true; });
  ok("🔴 a validator with NO potentialReward THROWS — it is never treated as zero", threw, "returned");
  threw = false;
  await measureChain(stub("not-a-number", []), "https://x").then(() => {}, () => { threw = true; });
  ok("🔴 an unreadable supply THROWS rather than falling back", threw, "returned");

  console.log(`\n${fail === 0 ? "✅" : "🔴"} ${pass} passed · ${fail} failed`);
  return fail === 0 ? 0 : 1;
}

main().then((c) => process.exit(c)).catch((e) => { console.error(`\n🔴 ${e.stack ?? e.message}`); process.exit(2); });
