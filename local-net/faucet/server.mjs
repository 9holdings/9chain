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

/**
 * ═══ TRANG FAUCET NAY LA MOT TRANG THAT, KHONG PHAI CHUOI JS ═══
 *
 * Trước M10.2, toàn bộ HTML của faucet là một template literal ngay tại đây: không
 * lint được, không format được, không tách component được, không có điểm ngắt
 * responsive nào, không dark mode, không một vòng focus nào. Nay nó là
 * `web/app/faucet/page.tsx` — xuất tĩnh và do Caddy phục vụ.
 *
 * Tiến trình này giữ đúng phần việc của nó: **API**. Đường `/` chỉ còn là một tấm
 * biển chỉ chỗ cho ai gọi thẳng qua tunnel — trả HTML ở hai nơi là hai bản sẽ trôi
 * lệch nhau, và bản trôi lệch sẽ là bản người dùng thật nhìn thấy.
 */
const CHI_CHO = {
  luuY: "Giao dien faucet nay o /faucet/ (trang tinh, Caddy phuc vu). Tien trinh nay chi con API.",
  api: ["GET /health", "GET /whoami", "GET /api/info", "POST /api/drip {address}"],
};

function send(res, code, obj, retryAfter) {
  const h = { "content-type": "application/json" };
  if (retryAfter) h["retry-after"] = String(retryAfter);
  res.writeHead(code, h);
  res.end(JSON.stringify(obj));
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/") return send(res, 200, CHI_CHO);
  if (req.method === "GET" && req.url === "/health") return send(res, 200, { ok: true });
  // Chẩn đoán: xác nhận faucet nhìn thấy ĐÚNG IP người dùng. Nếu ở đây luôn ra IP
  // của Caddy thì hạn mức theo IP vô dụng — mọi người bị gom chung một khoá.
  if (req.method === "GET" && req.url === "/whoami")
    return send(res, 200, { ip: clientIp(req, TRUST_PROXY), trustProxy: TRUST_PROXY });

  /**
   * Hạn mức + thông số, ĐỌC KHÔNG TIÊU SUẤT.
   *
   * Vì sao có: trước M10.2 người dùng chỉ biết mình hết suất **sau khi** đã điền
   * địa chỉ và bấm gửi — lỗi 429 là thứ đầu tiên nói cho họ biết luật chơi. Hiện
   * số trước khi bấm rẻ hơn nhiều so với một lượt thất bại.
   *
   * 🔴 Dùng `peek()` chứ KHÔNG gọi `limitIp(ip)`: gọi hàm kiểm là **tiêu một
   * suất**, nên mỗi lần mở trang lại mất một lượt và người dùng hết suất mà chưa
   * xin được gì. Xem `rateLimit` trong lib/guard.mjs.
   */
  // Khoá JSON bằng tiếng Anh (David chốt 2026-08-26). Định danh mã nguồn trong dự
  // án này vẫn là tiếng Việt — chỗ dịch nằm đúng ở ranh giới đi ra dây.
  if (req.method === "GET" && req.url === "/api/info") {
    const ip = clientIp(req, TRUST_PROXY);
    const p = limitIp.peek(ip);
    const g = limitGlobal.peek(":global:");
    return send(res, 200, {
      amount: AMOUNT,
      symbol: "LOVE9",
      cooldownSeconds: Math.round(COOLDOWN / 1000),
      perIp: { remaining: p.remaining, max: p.max, windowHours: p.windowMs / 3600_000, retryAfter: p.retryAfter },
      global: { remaining: g.remaining, max: g.max },
    });
  }

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
