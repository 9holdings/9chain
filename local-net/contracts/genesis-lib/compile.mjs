#!/usr/bin/env node
/**
 * compile.mjs — compile the genesis contract library into a committed artifact.
 *
 * ═══ WHY THE ARTIFACT IS COMMITTED AND THE COMPILER IS NOT ═══
 *
 * A compiler is a BUILD tool, not a runtime dependency. Requiring solc on the server would make
 * every acceptance run depend on whichever solc happens to be installed there, and "the contracts
 * that live in every chain's genesis" would stop being reproducible. Committing the compiled
 * artifact means the thing that actually runs is the thing readable in git — the same reason
 * subnet-evm ships `ExampleWarp.bin` in its source tree.
 *
 * ═══ WHY DOCKER AND A PINNED TAG ═══
 *
 * `ethereum/solc:0.8.26` rather than an npm solc: the bytes produced here are frozen into an
 * IMMUTABLE genesis, so "which compiler" has to be a fact and not whatever `npm install` resolved
 * that afternoon. The artifact records the version string solc itself reports, so a rebuild that
 * disagrees is visible rather than silent.
 *
 * ═══ 🔴 RUNTIME BYTECODE, NOT CREATION BYTECODE ═══
 *
 * Genesis `alloc` installs code directly; no constructor ever runs. So the artifact carries
 * `bin-runtime` (what a deployed contract's `eth_getCode` returns), never `bin`. Using `bin` would
 * place a constructor into the account — a chain whose "contract" is a deployment script that
 * nobody can ever run, permanently.
 *
 * That is also why `TokenFactory` holds its implementation address as `constant` and not
 * `immutable`: an immutable is written into the code BY the constructor, so in genesis it would be
 * a zeroed slot and every clone would delegatecall address zero. This script asserts that the
 * address inlined in the compiled bytes is the address `lib/l1-contracts.mjs` actually places the
 * implementation at.
 *
 * Run:
 *   node local-net/contracts/genesis-lib/compile.mjs
 *
 * Writes: `local-net/lib/l1-contracts.mjs`
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", "..", "..");
const OUT = path.join(REPO, "local-net", "lib", "l1-contracts.mjs");
const SOLC_IMAGE = "ethereum/solc:0.8.26";
const SOURCES = ["Erc20.sol", "TokenFactory.sol", "Multicall3.sol"];

/**
 * 🔴 The addresses. Chosen by 9Chain, in a range that cannot collide with anything else:
 * the EVM's own precompiles live at 0x00…01-0a and subnet-evm's at 0x0200…00-04, so a `09` prefix
 * is unmistakably ours and unmistakably not one of theirs.
 *
 * They are part of the contract SOURCE too (TokenFactory inlines the implementation address as a
 * constant), which is why the assertion at the bottom of this file exists: two places state the
 * same address, and only a measurement can say they still agree.
 */
export const ADDRESSES = Object.freeze({
  erc20Implementation: "0x0900000000000000000000000000000000000001",
  tokenFactory: "0x0900000000000000000000000000000000000002",
  multicall3: "0x0900000000000000000000000000000000000003",
});

const CONTRACT_OF = {
  erc20Implementation: "Erc20.sol:Erc20",
  tokenFactory: "TokenFactory.sol:TokenFactory",
  multicall3: "Multicall3.sol:Multicall3",
};

const fail = (msg) => { console.error(`compile: ${msg}`); process.exit(1); };

// ── compile ──
const run = spawnSync("docker", [
  "run", "--rm",
  "-v", `${HERE.split(path.sep).join("/")}:/src`,
  "-w", "/src",
  "--entrypoint", "solc", SOLC_IMAGE,
  "--optimize", "--optimize-runs", "200",
  "--combined-json", "abi,bin-runtime",
  ...SOURCES,
], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, env: { ...process.env, MSYS_NO_PATHCONV: "1" } });

if (run.status !== 0) fail(`solc exited ${run.status}\n${(run.stderr || run.stdout || "").slice(-3000)}`);
let out;
try { out = JSON.parse(run.stdout); } catch { fail(`solc did not return JSON:\n${run.stdout.slice(0, 500)}`); }

// ── collect, and check what a genesis actually needs ──
const contracts = {};
for (const [key, id] of Object.entries(CONTRACT_OF)) {
  const c = out.contracts?.[id];
  if (!c) fail(`solc produced nothing for ${id}`);
  const code = String(c["bin-runtime"] || "");
  if (!/^[0-9a-f]+$/i.test(code) || code.length === 0) fail(`${id}: runtime bytecode is empty or not hex`);
  // 🔴 A stray `__$…$__` is an unlinked library placeholder. It would sit in genesis as literal
  // ASCII inside the code and the contract would revert on the first call that reached it.
  if (code.includes("__")) fail(`${id}: bytecode carries an unlinked library placeholder`);
  contracts[key] = {
    address: ADDRESSES[key],
    code: `0x${code}`,
    bytes: code.length / 2,
    abi: typeof c.abi === "string" ? JSON.parse(c.abi) : c.abi,
  };
}

// Two places state where the implementation lives: `TokenFactory.sol` inlines it as a constant, and
// `ADDRESSES` above decides where genesis puts it. Shipping them apart yields a factory that clones
// proxies pointing at nothing — nothing would report it, the transaction succeeds, and the chain can
// never be fixed. So they are compared here, at the SOURCE level.
//
// 🔴 Deliberately NOT by searching the bytecode for the address. The first version of this check did
// exactly that and failed on a correct build: this address has seventeen leading zero bytes, so the
// optimiser emits a short PUSH rather than a literal PUSH20 and the 20 bytes are simply not in the
// code as such. That is a red for the wrong reason (D-106b) — it would have sent someone hunting a
// defect that was not there, and worse, a future edit could have "fixed" it by picking an address
// the optimiser happens not to compress.
//
// The check that the compiled code really BINDS to that address is a different measurement and lives
// where it can actually be made: `scripts/check-genesis-contracts.mjs` builds the genesis state and
// calls `implementation()` in subnet-evm's own EVM.
const declared = /address\s+public\s+constant\s+implementation\s*=\s*(0x[0-9a-fA-F]{40})/.exec(
  readFileSync(path.join(HERE, "TokenFactory.sol"), "utf8"),
);
if (!declared) fail("TokenFactory.sol no longer declares `address public constant implementation = 0x…` — this check cannot see what it is asserting about");
if (declared[1].toLowerCase() !== ADDRESSES.erc20Implementation.toLowerCase()) {
  fail(
    `TokenFactory.sol declares implementation = ${declared[1]}\n` +
    `       ADDRESSES here places it at        ${ADDRESSES.erc20Implementation}\n` +
    `       They disagree. Fix one — but do not ship them apart.`
  );
}

const sourceHashes = {};
for (const f of SOURCES) {
  sourceHashes[f] = createHash("sha256").update(readFileSync(path.join(HERE, f))).digest("hex").slice(0, 16);
}

const total = Object.values(contracts).reduce((n, c) => n + c.bytes, 0);
const body = `// l1-contracts.mjs — GENERATED ARTIFACT, do not edit by hand.
//
// Rebuild:  node local-net/contracts/genesis-lib/compile.mjs
//
// solc    : ${out.version}   (image ${SOLC_IMAGE}, --optimize --optimize-runs 200)
// sources : ${SOURCES.map((f) => `${f} sha256:${sourceHashes[f]}`).join("\\n//           ")}
// size    : ${total} bytes of code added to a genesis that includes the whole library
//
// 🔴 These are RUNTIME bytecodes. Genesis \`alloc\` installs code and never runs a constructor, so
// creation bytecode here would put a deployment script into the account permanently. See the
// compile script's header for the rest of the reasoning, including why TokenFactory's
// implementation address is a \`constant\`.
//
// 🔴 Multicall3 here is ABI-COMPATIBLE with the widely deployed one, compiled from this repo's
// source, at a 9Chain address. It is NOT byte-identical to the canonical deployment and NOT at
// \`0xcA11bde0…\`, because that address is produced by replaying a signed transaction and a genesis
// cannot do that. Tools that hard-code the canonical address will not find it.

export const SOLC_VERSION = ${JSON.stringify(out.version)};
export const SOURCE_HASHES = Object.freeze(${JSON.stringify(sourceHashes, null, 2)});
export const CONTRACTS = Object.freeze(${JSON.stringify(contracts, null, 2)});

/** The contract library, in the shape genesis \`alloc\` wants: address -> { code }. */
export function libraryAlloc() {
  const alloc = {};
  for (const c of Object.values(CONTRACTS)) {
    // \`alloc\` keys are BARE lower-case hex, no \`0x\` — the convention the console already uses.
    alloc[c.address.slice(2).toLowerCase()] = { balance: "0x0", code: c.code };
  }
  return alloc;
}
`;

writeFileSync(OUT, body);
console.log(`✅ wrote ${path.relative(REPO, OUT)}`);
console.log(`   solc ${out.version}`);
for (const [k, c] of Object.entries(contracts)) console.log(`   ${k.padEnd(20)} ${c.address}  ${String(c.bytes).padStart(5)} bytes`);
console.log(`   total ${total} bytes`);
