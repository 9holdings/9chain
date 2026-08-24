// deploy.mjs — compile + deploy Storage.sol lên L1 EVM 9Chain-A1, rồi gọi set()/value().
// Chạy: node deploy.mjs <RPC_URL>
// Ví dụ: node deploy.mjs http://localhost:9650/ext/bc/<BLOCKCHAIN_ID>/rpc
import solc from "solc";
import { ethers } from "ethers";
import { readFileSync } from "node:fs";

const RPC = process.argv[2] || process.env.L1_RPC;
if (!RPC) { console.error("Thiếu RPC URL"); process.exit(1); }

// Khoá EVM ewoq (test, công khai) — địa chỉ 0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC
const EWOQ_PK = "0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027";

// 1) Compile
const source = readFileSync(new URL("./Storage.sol", import.meta.url), "utf8");
const input = {
  language: "Solidity",
  sources: { "Storage.sol": { content: source } },
  settings: {
    // L1 chưa bật Durango/Shanghai => tránh opcode PUSH0 bằng target "paris".
    evmVersion: "paris",
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
  },
};
const out = JSON.parse(solc.compile(JSON.stringify(input)));
if (out.errors?.some(e => e.severity === "error")) {
  console.error(out.errors); process.exit(1);
}
const c = out.contracts["Storage.sol"].Storage;
const abi = c.abi;
const bytecode = "0x" + c.evm.bytecode.object;
console.log("✓ compiled Storage.sol");

// 2) Connect + verify chain
const provider = new ethers.JsonRpcProvider(RPC);
const net = await provider.getNetwork();
console.log(`✓ connected. chainId = ${net.chainId}`);

const baseWallet = new ethers.Wallet(EWOQ_PK, provider);
const bal = await provider.getBalance(baseWallet.address);
console.log(`✓ deployer ${baseWallet.address} balance = ${ethers.formatEther(bal)}`);
// NonceManager: quản nonce tuần tự (tránh đua nonce khi deploy rồi gọi tx ngay).
const wallet = new ethers.NonceManager(baseWallet);

// 3) Deploy
const factory = new ethers.ContractFactory(abi, bytecode, wallet);
const contract = await factory.deploy();
await contract.waitForDeployment();
const addr = await contract.getAddress();
console.log(`✓ DEPLOYED Storage @ ${addr}`);

// 4) Interact
const tx = await contract.set(42n);
await tx.wait();
const v = await contract.value();
const setter = await contract.lastSetter();
console.log(`✓ set(42) -> value() = ${v}, lastSetter = ${setter}`);
console.log(v === 42n ? "PASS ✅ L1 EVM 9Chain-A1 hoạt động (deploy + tx + read)" : "FAIL");
