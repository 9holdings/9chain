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
import { readFileSync } from "node:fs";
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

// ═══════════════════ I1b — cung, kèm nguồn của từng con số ═══════════════════
//
// Bản khai do netgen sinh (`<net>/cung.json`). KHÔNG phải nguồn sự thật — nó chỉ nói
// **đo cái gì, ở đâu**. Chỗ nào đo được thì dưới đây đo lại và **so**.
const CUNG_FILE = process.env.A1_CUNG_FILE ||
  new URL("../net/cung.json", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
// P-Chain suy từ RPC của C-Chain. Cho phép ghi đè: faucet của một L1 trỏ vào chuỗi khác,
// và lúc đó suy ra sẽ sai.
const PCHAIN_RPC = process.env.A1_PCHAIN_RPC ||
  (RPC.includes("/ext/bc/") ? RPC.replace(/\/ext\/bc\/.*$/, "/ext/bc/P") : null);

let cungKhai = null, cungLoi = null;
try {
  cungKhai = JSON.parse(readFileSync(CUNG_FILE, "utf8"));
  console.log(`[cung] bản khai: ${CUNG_FILE} — networkID ${cungKhai.networkID}, ${cungKhai.cChainAllocations?.length ?? 0} địa chỉ C-Chain`);
} catch (e) {
  // 🔴 KHÔNG im lặng, và KHÔNG bịa số thay. Thiếu bản khai thì `/api/supply` trả 503 —
  // một endpoint cung trả về số bịa còn tệ hơn một endpoint không trả gì.
  cungLoi = String(e?.message ?? e);
  console.log(`[cung] 🔴 KHÔNG đọc được ${CUNG_FILE} (${cungLoi})`);
  console.log(`[cung] 🔴 /api/supply sẽ trả 503. Bản khai do netgen sinh cùng genesis —`);
  console.log(`[cung]    sinh lại: bash local-net/gen-network.sh <N>, rồi mount cả cung.json.`);
}

async function rpcP(method, params = {}) {
  const r = await fetch(PCHAIN_RPC, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const j = await r.json();
  if (j.error) throw new Error(`${method}: ${j.error.message ?? JSON.stringify(j.error)}`);
  return j.result;
}

/** nLOVE9 (chuỗi) -> "9,000,000,000" phần nguyên. Không làm tròn, không dùng Number:
 *  9e18 vượt MAX_SAFE_INTEGER, và làm tròn im lặng ở đây là đúng lớp lỗi trang này canh. */
function love9(nLove9) {
  const n = BigInt(nLove9) / 1_000_000_000n;
  return n.toLocaleString("en-US");
}

async function doCung() {
  if (!cungKhai) throw new Error(`thiếu bản khai cung (${cungLoi})`);
  if (!PCHAIN_RPC) throw new Error("không suy được RPC của P-Chain từ FAUCET_RPC; đặt A1_PCHAIN_RPC");

  const lech = [];

  // ── ĐO 1: X/P đang lưu hành. Đây là con số DUY NHẤT về cung mà RPC trả về thẳng.
  const cs = await rpcP("platform.getCurrentSupply", { subnetID: "11111111111111111111111111111111LpoYY" });
  const xpHienTai = BigInt(cs.supply);

  // ── ĐO 2: phần C-Chain, đọc SỐ DƯ TẠI BLOCK 0 của từng địa chỉ trong bản khai.
  // Block 0 chứ không phải "latest": ta hỏi *"genesis đã phát hành bao nhiêu"*, không hỏi
  // *"bây giờ còn bao nhiêu"*. Hai câu đó khác nhau ngay khi có người tiêu tiền.
  const dsC = cungKhai.cChainAllocations ?? [];
  let cTong = 0n;
  const cChiTiet = [];
  for (const a of dsC) {
    const soDuWei = await provider.getBalance(a.address, 0);
    const khaiWei = BigInt(a.wei);
    if (soDuWei !== khaiWei) lech.push(`${a.bucket} (${a.address}): khai ${khaiWei} wei, đo ${soDuWei} wei`);
    cTong += soDuWei;
    cChiTiet.push({ bucket: a.bucket, name: a.name, address: a.address, weiAtBlock0: soDuWei.toString(), matchesManifest: soDuWei === khaiWei });
  }
  const cTongNLove9 = cTong / 1_000_000_000n; // wei (18) -> nLOVE9 (9)
  if (cTongNLove9.toString() !== String(cungKhai.cChainGenesis?.nLove9)) {
    lech.push(`cChainGenesis: khai ${cungKhai.cChainGenesis?.nLove9}, đo ${cTongNLove9}`);
  }

  // ── SUY: tổng cung. KHÔNG có RPC nào trả về nó.
  const tranXP = BigInt(cungKhai.xpSupplyCap.nLove9);
  const tongCung = tranXP + cTongNLove9;
  if (tongCung.toString() !== String(cungKhai.totalSupply?.nLove9)) {
    lech.push(`totalSupply: khai ${cungKhai.totalSupply?.nLove9}, suy ra ${tongCung}`);
  }

  return {
    unit: "nLOVE9 (9 decimals)",
    measuredAt: new Date().toISOString(),
    rpc: { cChain: RPC, pChain: PCHAIN_RPC },

    xpCurrentSupply: {
      nLove9: xpHienTai.toString(), love9: love9(xpHienTai),
      source: "measured", method: "platform.getCurrentSupply",
      note: "CHI dem X/P. KHONG dem phan phat hanh thang tren C-Chain — xem cChainGenesis.",
    },
    cChainGenesis: {
      nLove9: cTongNLove9.toString(), love9: love9(cTongNLove9),
      source: "measured", method: `eth_getBalance(addr, "0x0") cong theo ${dsC.length} dia chi`,
      note: "Ton tai that tren chain, nhung platform.getCurrentSupply KHONG BAO GIO dem toi.",
      addresses: cChiTiet,
    },
    xpSupplyCap: {
      nLove9: tranXP.toString(), love9: love9(tranXP),
      source: "binary-constant", where: cungKhai.xpSupplyCap.where,
      note: "Hang so bien dich vao binary. KHONG mot lenh RPC nao tra ve no.",
    },
    totalSupply: {
      nLove9: tongCung.toString(), love9: love9(tongCung),
      source: "derived", formula: "xpSupplyCap + cChainGenesis",
      note: "Con so cong bo. KHONG mot lenh RPC nao tra ve no — no la mot PHEP CONG cua mot hang so binary voi mot so do duoc.",
    },

    // 🔴 Ô quan trọng nhất của endpoint này.
    manifestMatchesChain: lech.length === 0,
    mismatches: lech,
    manifest: { networkID: cungKhai.networkID, cChainId: cungKhai.cChainId, file: CUNG_FILE },
  };
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

  // ═══ I1b — CUNG, VÀ MỖI CON SỐ MANG THEO NGUỒN CỦA NÓ ═══
  //
  // Luật cứng của 9Scan-A1: *"số công bố phải đọc từ chain thật"*. In trần một con số mà
  // không có endpoint là **gõ hằng số vào giao diện**.
  //
  // 🔴 Nhưng có một sự thật không thể chiều theo luật đó: **tổng cung 9.000.000.000 KHÔNG
  // đọc được từ bất kỳ lệnh RPC nào.** `platform.getCurrentSupply` chỉ đếm X/P — nó **không
  // bao giờ** đếm 1.099.999.999 LOVE9 phát hành thẳng trên C-Chain (phát hiện P0, bản soát
  // core `27/08`, đã đo trên node đang chạy). Và `SupplyCap` là **hằng số biên dịch vào
  // binary**, không có endpoint nào trả về nó.
  //
  // ⇒ Endpoint này **không giả vờ** mọi con số đều đo được. Mỗi trường mang `source`:
  //     measured          — vừa đo bằng RPC, kèm tên lệnh
  //     genesis-parameter — tham số genesis; đo lại được, và ở đây ĐÃ đo lại
  //     binary-constant   — hằng số trong binary, KHÔNG đo được từ RPC
  //     derived           — suy ra, kèm công thức
  // Và nó **so bản khai với phép đo**, rồi nói ra khi lệch. Một endpoint đọc tệp JSON rồi
  // in lại thì vẫn chỉ là gõ hằng số, chỉ khác là hằng số nay đi qua một tệp.
  if (req.method === "GET" && req.url === "/api/supply") {
    try {
      return send(res, 200, await doCung());
    } catch (e) {
      return send(res, 503, { error: "khong doc duoc cung", detail: String(e?.message ?? e) });
    }
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
