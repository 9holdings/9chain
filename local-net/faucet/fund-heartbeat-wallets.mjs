#!/usr/bin/env node
/**
 * fund-heartbeat-wallets.mjs — one-time top-up for the heartbeat pump's wallets.
 *
 * Run on the server:
 *   set -a; . ~/9chain-a1/net/faucet.env; . ~/9chain-a1/heartbeat.env; set +a
 *   FUNDING_KEY="$FAUCET_PK" node local-net/faucet/fund-heartbeat-wallets.mjs
 *
 * ═══ WHY THIS IS A SEPARATE FILE ═══
 * The pump runs forever; the treasury key must not. Splitting funding out means the
 * long-lived process only ever holds HEARTBEAT_SEED, whose wallets carry a few
 * LOVE9 of gas money and nothing else. If that seed leaks, the loss is the gas
 * money and the credibility of the disclosure — not the faucet.
 *
 * ═══ HOW LITTLE IS ACTUALLY NEEDED ═══
 * Measured on this chain: gas price 2-3 wei, 21000 gas per transfer, so one
 * transaction costs about 63,000 wei. At the pump's 1 tx/s per wallet that is
 * roughly 5.4e-9 LOVE9 per wallet per day. One LOVE9 per wallet covers centuries.
 * The default is deliberately far more than necessary, because the failure it
 * prevents (a wallet silently running dry mid-run) is annoying to diagnose and the
 * money is testnet play money.
 *
 * It is also a ring: wallet i pays wallet i+1, so the principal circulates and only
 * gas is actually consumed. Balances stay roughly level on their own.
 */

const RPC = process.env.HEARTBEAT_RPC || "http://127.0.0.1:9650/ext/bc/C/rpc";
const SEED = process.env.HEARTBEAT_SEED || "";
const KEY = process.env.FUNDING_KEY || "";
const WALLETS = Number(process.env.HEARTBEAT_WALLETS || 9);
const AMOUNT = process.env.HEARTBEAT_FUND_AMOUNT || "1";
const ETHERS_PATH = process.env.ETHERS_PATH || "ethers";

const { ethers } = await import(ETHERS_PATH);

if (!SEED) { console.error("FATAL: HEARTBEAT_SEED is required."); process.exit(1); }
if (!KEY) {
  console.error("FATAL: FUNDING_KEY is required.");
  console.error("  Pass it through the environment, never on the command line —");
  console.error("  argv is visible in `ps`, in shell history, and in error messages.");
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC, undefined, { staticNetwork: true });
const source = new ethers.Wallet(KEY, provider);
const root = ethers.HDNodeWallet.fromPhrase(SEED);
const targets = Array.from({ length: WALLETS }, (_, i) => root.deriveChild(i));

const want = ethers.parseEther(AMOUNT);
console.log(`funding source : ${source.address}`);
console.log(`source balance : ${ethers.formatEther(await provider.getBalance(source.address))} LOVE9`);
console.log(`topping up ${targets.length} wallets to ${AMOUNT} LOVE9 each\n`);

let nonce = await provider.getTransactionCount(source.address, "pending");
let funded = 0;
let last = null;

for (const [i, t] of targets.entries()) {
  const have = await provider.getBalance(t.address);
  if (have >= want) {
    console.log(`  ${i}: ${t.address} already has ${ethers.formatEther(have)} — skip`);
    continue;
  }
  const need = want - have;
  last = await source.sendTransaction({ to: t.address, value: need, nonce: nonce++, gasLimit: 21000n });
  console.log(`  ${i}: ${t.address} += ${ethers.formatEther(need)} LOVE9  (${last.hash})`);
  funded++;
}

if (last) {
  // Nonces are sequential, so the last one confirming means all of them did.
  await last.wait(1);
}
console.log(`\ntopped up ${funded} wallet(s). Verifying on chain:`);
for (const [i, t] of targets.entries()) {
  console.log(`  ${i}: ${t.address} = ${ethers.formatEther(await provider.getBalance(t.address))} LOVE9`);
}
