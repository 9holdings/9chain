// Kiểm chứng một L1 vừa đẻ có THỰC SỰ chốt được block hay không.
//
// Vì sao cần: Avalanche không đẻ block rỗng, nên "block đứng yên" vừa là dấu
// hiệu chain khoẻ vừa là dấu hiệu chain chết — nhìn số block không phân biệt
// được. Cách duy nhất chắc chắn là gửi một giao dịch thật rồi chờ nó vào block.
// Nếu tập validator của subnet rỗng, lệnh này sẽ treo ở bước `wait` (đúng như
// mong đợi) thay vì báo thành công giả.
//
//   node local-net/faucet/probe-l1.mjs <RPC_URL> [PRIVATE_KEY]
import { ethers } from "ethers";

const RPC = process.argv[2];
// Mặc định ewoq — khoá test CÔNG KHAI, chỉ dùng cho L1 dev do console đẻ ra
// (genesis mẫu cấp phát cho đúng địa chỉ này). KHÔNG dùng trên mạng công khai.
const PK = process.argv[3] || "0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027";
if (!RPC) {
  console.error("dùng: node probe-l1.mjs <RPC_URL> [PRIVATE_KEY]");
  process.exit(2);
}

const p = new ethers.JsonRpcProvider(RPC, undefined, { staticNetwork: true });
const w = new ethers.Wallet(PK, p);

console.log("chainId  :", (await p.getNetwork()).chainId.toString());
console.log("block    :", await p.getBlockNumber());
console.log("balance  :", ethers.formatEther(await p.getBalance(w.address)), "(", w.address, ")");

const t0 = Date.now();
const tx = await w.sendTransaction({
  to: "0x000000000000000000000000000000000000dEaD",
  value: ethers.parseEther("1"),
});
const rc = await tx.wait(1);
console.log("tx       :", rc.hash);
console.log("chốt sau :", ((Date.now() - t0) / 1000).toFixed(1) + "s — block", rc.blockNumber, "status", rc.status);
console.log("block sau:", await p.getBlockNumber());
