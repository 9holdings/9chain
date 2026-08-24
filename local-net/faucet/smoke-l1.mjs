// smoke-l1.mjs — nghiệm thu tự động cho phần CHAIN của 9Chain-A1.
//
// Thay cho việc nghiệm thu bằng tay từng lần (mở trang, bấm nút, nhìn bằng mắt).
// Mọi khẳng định ở đây phải là thứ ĐO ĐƯỢC, không phải "RPC trả lời nên chắc ổn":
// một subnet có tập validator RỖNG vẫn trả `eth_chainId`, vẫn cho đọc số dư, ví
// vẫn kết nối — chỉ là giao dịch không bao giờ chốt. Nên bài kiểm tra L1 thật sự
// duy nhất là GỬI MỘT GIAO DỊCH và chờ nó vào block.
//
// HAI CHẾ ĐỘ:
//
//   node local-net/faucet/smoke-l1.mjs
//       Nhẹ, CHỈ ĐỌC, không tốn tiền, chạy bao nhiêu lần cũng được.
//       Kiểm: C-Chain · validator · hợp đồng dữ liệu của danh bạ · MỌI L1 trong
//       danh bạ có còn trả lời đúng chainId nó khai không.
//
//   node local-net/faucet/smoke-l1.mjs --de-chain
//       Đầy đủ: đẻ MỘT chain mới, gửi giao dịch thật trên đó, đo gián đoạn
//       C-Chain trong lúc đẻ. Chạy TRÊN SERVER (console chỉ nghe loopback).
//
// ⚠️ `--de-chain` để lại một L1 VĨNH VIỄN trong danh bạ công khai: hiện chưa có
//    endpoint thu hồi (PROGRESS M4.4). Đừng chạy trong vòng lặp.
//
//   Trên server:
//     set -a; . ~/9chain-a1/console.env; set +a
//     cd ~/9chain-a1/src && node local-net/faucet/smoke-l1.mjs --de-chain
import { ethers } from "ethers";

const args = process.argv.slice(2);
const co = t => args.includes("--" + t);
function opt(t, mac) { const i = args.indexOf("--" + t); return i >= 0 && args[i + 1] ? args[i + 1] : mac; }

const TRANG = opt("trang", "https://testnet-a1.9chain.org");
const RPC_GOC = opt("rpc", "https://rpc-testnet-a1.9chain.org");
const CONSOLE = opt("console", "http://127.0.0.1:8091");
const TOKEN = process.env.A1_CONSOLE_TOKEN || "";
const DE_CHAIN = co("de-chain");
const CHAIN_ID_C = 9000000009;

const ket = [];
let hong = 0;
function kiem(ten, dat, chiTiet = "") {
  ket.push({ ten, dat, chiTiet });
  if (!dat) hong++;
  console.log(`${dat ? "  ✓" : "  ✗"} ${ten}${chiTiet ? "  — " + chiTiet : ""}`);
}
/** Không bao giờ để token lọt ra log/báo cáo. */
function sach(s) { const t = String(s ?? ""); return TOKEN ? t.split(TOKEN).join("<TOKEN>") : t; }

async function rpc(url, method, params = []) {
  const r = await fetch(url, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(20000),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message);
  return j.result;
}

// ══════════════════════════════════════════════════════════════════════════
console.log("\n── 1. Mạng chính (C-Chain) ──");
try {
  const hex = await rpc(`${RPC_GOC}/ext/bc/C/rpc`, "eth_chainId");
  kiem("C-Chain trả lời", true);
  kiem(`chainId = ${CHAIN_ID_C}`, parseInt(hex, 16) === CHAIN_ID_C, `đo được ${parseInt(hex, 16)}`);
} catch (e) {
  kiem("C-Chain trả lời", false, sach(e.message));
}

console.log("\n── 2. Validator ──");
try {
  const v = await rpc(`${RPC_GOC}/ext/bc/P`, "platform.getCurrentValidators");
  const tong = v.validators.length;
  const noi = v.validators.filter(x => x.connected).length;
  // Không cắm cứng "phải là 5": mạng có thể mở rộng. Điều kiện thật là KHÔNG
  // validator nào rớt — một node im lặng làm mỏng quorum mà bề ngoài không đổi.
  kiem("mọi validator đang kết nối", noi === tong && tong > 0, `${noi}/${tong}`);
} catch (e) {
  kiem("đọc được validator", false, sach(e.message));
}

console.log("\n── 3. Danh bạ L1 (hợp đồng dữ liệu) ──");
let danhBa = { chains: [] };
try {
  const r = await fetch(`${TRANG}/chains/`, { signal: AbortSignal.timeout(20000) });
  kiem("trang /chains/ trả 200", r.status === 200, `HTTP ${r.status}`);
  const rd = await fetch(`${TRANG}/chains/data/console-chains.json`, { signal: AbortSignal.timeout(20000) });
  kiem("đọc được console-chains.json", rd.ok, `HTTP ${rd.status}`);
  danhBa = await rd.json();
  kiem("JSON có mảng chains", Array.isArray(danhBa.chains), `${danhBa.chains?.length} mục`);

  // Hợp đồng dữ liệu: THÊM khoá thì an toàn, ĐỔI/BỎ khoá cũ là làm hỏng trang.
  const batBuoc = ["name", "subnetID", "blockchainID", "chainId", "rpc"];
  const thieu = danhBa.chains.filter(c => batBuoc.some(k => c[k] === undefined));
  kiem("mọi L1 đủ khoá bắt buộc", thieu.length === 0, thieu.map(c => c.name).join(", ") || "");

  // `admin` là khoá MỚI — chain đẻ trước khi có ô này hợp lệ khi THIẾU HẲN.
  // Cái không bao giờ được phép là chuỗi "undefined" lọt ra mặt người dùng.
  const rac = danhBa.chains.filter(c => "admin" in c &&
    (typeof c.admin !== "string" || c.admin.trim() === "" || c.admin === "undefined"));
  kiem("không có admin rác (undefined/rỗng)", rac.length === 0, rac.map(c => c.name).join(", ") || "");

  // Hai L1 trùng chainId là hố sụt: MetaMask coi chúng là MỘT mạng, và chữ ký
  // của chain này phát lại được trên chain kia.
  const ids = danhBa.chains.map(c => c.chainId);
  kiem("chainId không trùng nhau", new Set(ids).size === ids.length, ids.join(", "));
} catch (e) {
  kiem("đọc được danh bạ", false, sach(e.message));
}

console.log("\n── 4. Mỗi L1 trong danh bạ còn sống ──");
for (const c of danhBa.chains) {
  try {
    const hex = await rpc(c.rpc, "eth_chainId");
    const dung = parseInt(hex, 16) === c.chainId;
    kiem(`${c.name}: RPC trả đúng chainId ${c.chainId}`, dung, dung ? "" : `đo được ${parseInt(hex, 16)}`);
  } catch (e) {
    kiem(`${c.name}: RPC trả lời`, false, sach(e.message));
  }
}
if (danhBa.chains.length) {
  console.log("  ℹ️  RPC trả lời KHÔNG chứng minh chain chốt được block — xem --de-chain.");
}

// ══════════════════════════════════════════════════════════════════════════
if (DE_CHAIN) {
  console.log("\n── 5. Đẻ chain mới + giao dịch thật ──");
  if (!TOKEN) {
    kiem("có A1_CONSOLE_TOKEN", false, "nạp console.env trước khi chạy");
  } else {
    // Ví dùng một lần: địa chỉ của nó là `admin`, nên genesis cấp phát thẳng cho
    // nó. Không cần quản khoá, không đụng quỹ nào.
    const vi = ethers.Wallet.createRandom();
    const ten = "Smoke" + Date.now().toString(36).slice(-6).toUpperCase();
    console.log(`  ví một lần: ${vi.address}`);
    console.log(`  tên chain : ${ten}`);

    // Đo C-Chain SONG SONG với lúc đẻ — đây là câu hỏi của M1.3: người đang mở
    // ví có thấy mạng chết khi ai đó bấm nút không.
    // Cờ dừng phải là biến RIÊNG khai báo TRƯỚC. Gắn thuộc tính lên chính
    // promise (`doC.dung`) thì thân async chạy ngay và đọc `doC` khi nó còn
    // trong TDZ -> ReferenceError, và vì nó nằm trong promise nên lỗi bị nuốt
    // thành "unhandled rejection" chứ không dừng script.
    let dungDo = false;
    const doC = (async () => {
      const t0 = Date.now(), mau = [];
      let dut = 0, dangDut = null, dutDaiNhat = 0;
      while (Date.now() - t0 < 300000 && !dungDo) {
        const ts = Date.now();
        let ok = false;
        try { await rpc(`${RPC_GOC}/ext/bc/C/rpc`, "eth_blockNumber"); ok = true; } catch { /* đếm bên dưới */ }
        mau.push(ok);
        if (!ok) { if (dangDut === null) { dangDut = ts; dut++; } }
        else if (dangDut !== null) { dutDaiNhat = Math.max(dutDaiNhat, Date.now() - dangDut); dangDut = null; }
        const con = 500 - (Date.now() - ts);
        if (con > 0) await new Promise(s => setTimeout(s, con));
      }
      if (dangDut !== null) dutDaiNhat = Math.max(dutDaiNhat, Date.now() - dangDut);
      return { luot: mau.length, hong: mau.filter(x => !x).length, soLanDut: dut, dutDaiNhatGiay: +(dutDaiNhat / 1000).toFixed(1) };
    })();

    let chain = null;
    const t0 = Date.now();
    try {
      const r = await fetch(`${CONSOLE}/api/create`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${TOKEN}` },
        body: JSON.stringify({ name: ten, admin: vi.address }),
        signal: AbortSignal.timeout(300000),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      chain = j;
      kiem("console đẻ được chain", true, `${((Date.now() - t0) / 1000).toFixed(1)}s`);
    } catch (e) {
      kiem("console đẻ được chain", false, sach(e.message));
    }
    dungDo = true;
    const doDuoc = await doC;

    console.log(`\n  ▸ GIÁN ĐOẠN C-CHAIN trong lúc đẻ chain:`);
    console.log(`    ${doDuoc.luot} lượt · hỏng ${doDuoc.hong} · ${doDuoc.soLanDut} khoảng chết · dài nhất ${doDuoc.dutDaiNhatGiay}s`);
    ket.push({ ten: "đo gián đoạn C-Chain", dat: true, chiTiet: JSON.stringify(doDuoc) });

    if (chain) {
      kiem("admin đúng ví vừa tạo", chain.admin === vi.address, `${chain.admin}`);
      try {
        const p = new ethers.JsonRpcProvider(chain.rpc, undefined, { staticNetwork: true });
        const w = vi.connect(p);
        const duGoc = await p.getBalance(vi.address);
        kiem("genesis cấp phát cho ví", duGoc > 0n, ethers.formatEther(duGoc));

        // ĐÂY là bài kiểm tra thật. Nếu tập validator rỗng, chỗ này treo tới
        // timeout thay vì báo thành công giả.
        const tt = Date.now();
        const tx = await w.sendTransaction({ to: "0x000000000000000000000000000000000000dEaD", value: ethers.parseEther("1") });
        const rc = await Promise.race([
          tx.wait(1),
          new Promise((_, x) => setTimeout(() => x(new Error("giao dịch KHÔNG chốt sau 120s — nhiều khả năng subnet có tập validator RỖNG")), 120000)),
        ]);
        kiem("giao dịch thật CHỐT được", rc.status === 1, `${((Date.now() - tt) / 1000).toFixed(1)}s · block ${rc.blockNumber} · ${rc.hash}`);
      } catch (e) {
        kiem("giao dịch thật CHỐT được", false, sach(e.message));
      }

      // Danh bạ công khai phải thấy chain mới — đây là chặng nối console ↔ trang.
      try {
        const rd = await fetch(`${TRANG}/chains/data/console-chains.json`, { signal: AbortSignal.timeout(20000) });
        const d = await rd.json();
        const m = d.chains.find(c => c.name === ten);
        kiem("danh bạ công khai đã có chain mới", !!m, m ? `admin ${m.admin}` : "không thấy");
        if (m) kiem("danh bạ ghi đúng admin", m.admin === vi.address, m.admin);
      } catch (e) {
        kiem("danh bạ công khai đã có chain mới", false, sach(e.message));
      }
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════
console.log(`\n════ ${ket.length - hong}/${ket.length} ĐẠT ════`);
if (hong) {
  console.log("HỎNG:");
  for (const k of ket.filter(k => !k.dat)) console.log(`  ✗ ${k.ten}${k.chiTiet ? " — " + k.chiTiet : ""}`);
}
if (!DE_CHAIN) console.log("(chế độ nhẹ — thêm --de-chain để nghiệm thu đường đẻ chain đầy đủ)");
process.exit(hong ? 1 : 0);
