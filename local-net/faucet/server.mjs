// 9Chain Testnet A1 Faucet — phát token testnet LOVE9 trên chain EVM (C-Chain hoặc L1).
// Tự chứa: Node http built-in + ethers. Không framework.
//
// Env:
//   FAUCET_RPC   RPC EVM (mặc định C-Chain: http://localhost:9650/ext/bc/C/rpc)
//   FAUCET_PK    BẮT BUỘC — khoá ví faucet. Lấy từ local-net/net/faucet.env do netgen sinh.
//   FAUCET_AMOUNT  số LOVE9 mỗi lần (mặc định 10)
//   FAUCET_COOLDOWN_MS  chống spam mỗi địa chỉ (mặc định 60000)
//   PORT         (mặc định 8080)
import http from "node:http";
import { ethers } from "ethers";
import { clientIp, rateLimit, serialQueue } from "../lib/guard.mjs";

const RPC = process.env.FAUCET_RPC || "http://localhost:9650/ext/bc/C/rpc";
const AMOUNT = process.env.FAUCET_AMOUNT || "10";
const COOLDOWN = Number(process.env.FAUCET_COOLDOWN_MS || 60000);
const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.FAUCET_HOST || "0.0.0.0"; // chạy trong container -> cần 0.0.0.0
const TRUST_PROXY = process.env.A1_TRUST_PROXY === "1";

// Hạn mức theo IP. Chặn theo ĐỊA CHỈ VÍ là vô dụng một mình: ví mới sinh miễn phí,
// vô hạn. IP mới thì tốn kém hơn nhiều.
const MAX_PER_IP_HOUR = Number(process.env.FAUCET_MAX_PER_IP_HOUR || 5);
const MAX_PER_HOUR = Number(process.env.FAUCET_MAX_PER_HOUR || 300);
const limitIp = rateLimit({ max: MAX_PER_IP_HOUR, windowMs: 3600_000, name: "ip/gio" });
// Trần toàn cục: chặn cạn ví trong một đợt tấn công phân tán (nhiều IP).
const limitGlobal = rateLimit({ max: MAX_PER_HOUR, windowMs: 3600_000, name: "toan cuc/gio" });
// Gửi tuần tự: NonceManager của ethers không an toàn khi nhiều lượt gửi chồng nhau
// (hai request cùng lấy một nonce -> một tx bị thay thế/rớt).
const queue = serialQueue({ maxPending: 20 });

// Khoá ewoq công khai — ai cũng biết. Trước đây đây là giá trị MẶC ĐỊNH của faucet,
// nghĩa là bất kỳ ai deploy faucet mà quên đặt FAUCET_PK đều đang chạy bằng một khoá
// mà cả thế giới có thể rút sạch. Nay chặn cứng.
const EWOQ_PK = "0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027";

const PK = process.env.FAUCET_PK;
if (!PK) {
  console.error("FATAL: thiếu FAUCET_PK.");
  console.error("  Sinh mạng bằng `bash local-net/gen-network.sh 5` rồi lấy khoá trong local-net/net/faucet.env");
  console.error("  Ví dụ: FAUCET_PK=$(grep FAUCET_PK local-net/net/faucet.env | cut -d= -f2) node server.mjs");
  process.exit(1);
}
if (PK.toLowerCase() === EWOQ_PK) {
  console.error("FATAL: FAUCET_PK đang là khoá ewoq CÔNG KHAI của Avalanche — ai cũng rút được.");
  console.error("  Dùng ví faucet riêng trong local-net/net/faucet.env.");
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC);
const wallet = new ethers.NonceManager(new ethers.Wallet(PK, provider));
const lastDrip = new Map(); // address -> timestamp

const PAGE = `<!doctype html><html lang="vi"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>9Chain Testnet A1 Faucet</title>
<style>
:root{color-scheme:light dark}
body{font-family:system-ui,Segoe UI,Roboto,sans-serif;max-width:560px;margin:8vh auto;padding:0 20px;background:#0b0f17;color:#e6edf3}
.card{background:#131a26;border:1px solid #223049;border-radius:16px;padding:28px}
h1{margin:0 0 4px;font-size:1.6rem}.sub{color:#8aa0b6;margin:0 0 22px}
.brand{display:inline-block;width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,#e84142,#ff8a3d);vertical-align:middle;margin-right:10px}
input{width:100%;padding:13px;border-radius:10px;border:1px solid #2b3a54;background:#0e1420;color:#e6edf3;font-size:15px;box-sizing:border-box}
button{width:100%;margin-top:14px;padding:13px;border:0;border-radius:10px;background:#e84142;color:#fff;font-weight:600;font-size:15px;cursor:pointer}
button:disabled{opacity:.5}
#out{margin-top:16px;font-size:14px;word-break:break-all}
a{color:#ff8a3d}
</style></head><body>
<div class="card">
<h1><span class="brand"></span>9Chain Testnet A1 Faucet</h1>
<p class="sub">Nhận <b>${AMOUNT} LOVE9</b> testnet để thử nghiệm. Mỗi địa chỉ chờ ${Math.round(COOLDOWN/1000)}s giữa 2 lần.</p>
<input id="addr" placeholder="0x... (địa chỉ EVM của bạn)" autocomplete="off">
<button id="btn" onclick="drip()">Nhận ${AMOUNT} LOVE9</button>
<button id="mm" onclick="addChain()" style="background:#2b3a54;margin-top:10px">🦊 Thêm 9Chain-A1 vào MetaMask</button>
<div id="out"></div>
<div id="mmout" style="margin-top:10px;font-size:13px;color:#8aa0b6"></div>
</div>
<script>
// --- Thêm mạng vào ví bằng 1 cú bấm ---
// Trước đây trang chỉ IN RA thông số để người dùng tự gõ tay vào MetaMask: chainId,
// RPC, symbol, decimals. Với testnet hướng đại chúng thì đó là rào cản lớn nhất —
// gõ sai một ký tự là mạng không chạy mà không hiểu vì sao.
function rpcUrl(){
  const h = location.hostname;
  if (!h || h === 'localhost' || h === '127.0.0.1') return 'http://localhost:9650/ext/bc/C/rpc';
  return location.protocol + '//rpc-' + h + '/ext/bc/C/rpc';
}
function explorerUrl(){
  const h = location.hostname;
  if (!h || h === 'localhost' || h === '127.0.0.1') return 'http://localhost';
  return location.protocol + '//' + h;
}
async function addChain(){
  const out = document.getElementById('mmout');
  if (!window.ethereum) {
    out.innerHTML = '❌ Không thấy ví EVM nào trong trình duyệt. Cài <a href="https://metamask.io" target="_blank" rel="noopener">MetaMask</a> rồi thử lại.';
    return;
  }
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        // 9000000009 dạng hex. MetaMask CHỈ nhận hex, truyền số thập phân sẽ lỗi.
        chainId: '0x218711a09',
        chainName: '9Chain Testnet A1',
        nativeCurrency: { name: 'LOVE9', symbol: 'LOVE9', decimals: 18 },
        rpcUrls: [rpcUrl()],
        blockExplorerUrls: [explorerUrl()],
      }],
    });
    out.textContent = '✅ Đã thêm. Chọn mạng "9Chain Testnet A1" trong MetaMask.';
  } catch (e) {
    out.textContent = '❌ ' + (e && e.message ? e.message : e);
  }
}
async function drip(){
  const a=document.getElementById('addr').value.trim();
  const btn=document.getElementById('btn'),out=document.getElementById('out');
  btn.disabled=true;out.textContent='Đang gửi...';
  try{
    // Đường dẫn TƯƠNG ĐỐI: faucet được gắn ở gốc khi chạy local, nhưng dưới
    // /faucet/ khi ra public (chỉ có 1 tên miền cho nhiều dịch vụ). Dùng '/api/drip'
    // tuyệt đối sẽ trượt sang dịch vụ khác khi gắn dưới đường dẫn con.
    const r=await fetch('api/drip',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({address:a})});
    const j=await r.json();
    out.innerHTML = r.ok ? '✅ Đã gửi. Tx: '+j.txHash : '❌ '+(j.error||'lỗi');
  }catch(e){out.textContent='❌ '+e.message}
  btn.disabled=false;
}
</script></body></html>`;

function send(res, code, obj, retryAfter) {
  const h = { "content-type": "application/json" };
  if (retryAfter) h["retry-after"] = String(retryAfter);
  res.writeHead(code, h);
  res.end(JSON.stringify(obj));
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return res.end(PAGE);
  }
  if (req.method === "GET" && req.url === "/health") return send(res, 200, { ok: true });
  // Chẩn đoán: xác nhận faucet nhìn thấy ĐÚNG IP người dùng. Nếu ở đây luôn ra IP
  // của Caddy thì hạn mức theo IP vô dụng — mọi người bị gom chung một khoá.
  if (req.method === "GET" && req.url === "/whoami")
    return send(res, 200, { ip: clientIp(req, TRUST_PROXY), trustProxy: TRUST_PROXY });

  if (req.method === "POST" && req.url === "/api/drip") {
    const ip = clientIp(req, TRUST_PROXY);
    let body = "";
    let tooBig = false;
    req.on("data", c => {
      body += c;
      if (body.length > 8 * 1024 && !tooBig) { tooBig = true; req.destroy(); }
    });
    req.on("end", async () => {
      if (tooBig) return;
      try {
        const { address } = JSON.parse(body || "{}");
        if (!ethers.isAddress(address)) return send(res, 400, { error: "địa chỉ không hợp lệ" });

        // Thứ tự kiểm tra: rẻ trước, đắt sau. Trần toàn cục kiểm CUỐI trong nhóm
        // hạn mức để một IP bị chặn không tiêu mất một suất của trần toàn cục.
        const rIp = limitIp(ip);
        if (!rIp.ok)
          return send(res, 429, { error: `IP này đã nhận đủ suất, thử lại sau ${Math.ceil(rIp.retryAfter / 60)} phút` }, rIp.retryAfter);

        const now = Date.now();
        const prev = lastDrip.get(address.toLowerCase()) || 0;
        if (now - prev < COOLDOWN)
          return send(res, 429, { error: `chờ ${Math.ceil((COOLDOWN - (now - prev)) / 1000)}s nữa` });

        const rG = limitGlobal(":global:");
        if (!rG.ok)
          return send(res, 429, { error: `faucet đang quá tải, thử lại sau ${Math.ceil(rG.retryAfter / 60)} phút` }, rG.retryAfter);

        lastDrip.set(address.toLowerCase(), now);
        // Gửi tuần tự để không đụng nonce.
        const tx = await queue.run(() => wallet.sendTransaction({ to: address, value: ethers.parseEther(AMOUNT) }));
        await tx.wait();
        return send(res, 200, { txHash: tx.hash, amount: AMOUNT });
      } catch (e) {
        return send(res, 500, { error: String(e.shortMessage || e.message || e) });
      }
    });
    return;
  }
  send(res, 404, { error: "not found" });
});

server.listen(PORT, HOST, async () => {
  const net = await provider.getNetwork().catch(() => null);
  const addr = await wallet.getAddress();
  console.log(`9Chain Testnet A1 Faucet @ http://${HOST}:${PORT}`);
  console.log(`  RPC=${RPC}  chainId=${net?.chainId}  amount=${AMOUNT} LOVE9`);
  console.log(`  faucet address=${addr}`);
  console.log(`  hạn mức: ${MAX_PER_IP_HOUR} lượt/giờ/IP · trần toàn cục ${MAX_PER_HOUR}/giờ · chờ ${Math.round(COOLDOWN / 1000)}s/địa chỉ`);
  if (!TRUST_PROXY) {
    console.log(`  lưu ý : A1_TRUST_PROXY chưa bật -> hạn mức khoá theo IP TCP trực tiếp.`);
    console.log(`          Đứng sau Caddy/Cloudflare PHẢI đặt A1_TRUST_PROXY=1, nếu không mọi`);
    console.log(`          người dùng bị gom chung một khoá và chặn lẫn nhau. Kiểm tra: /whoami`);
  }

  // Cảnh báo sớm: ví rỗng thì mọi lượt drip đều lỗi, mà lỗi chỉ hiện ở phía người
  // dùng cuối. Kiểm tra ngay lúc khởi động để phát hiện sai khoá / sai chain.
  const bal = await provider.getBalance(addr).catch(() => null);
  if (bal === null) {
    console.warn(`  ⚠️  không đọc được số dư — RPC sai hay node chưa lên?`);
  } else {
    console.log(`  số dư=${ethers.formatEther(bal)} LOVE9`);
    if (bal === 0n) {
      console.warn(`  ⚠️  VÍ FAUCET RỖNG trên chain này. Sai khoá, hay genesis khác?`);
    }
  }
});
