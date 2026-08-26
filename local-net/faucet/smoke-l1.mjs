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
//   node local-net/faucet/smoke-l1.mjs --create-chain
//       Đầy đủ: đẻ MỘT chain mới, gửi giao dịch thật trên đó, đo gián đoạn
//       C-Chain trong lúc đẻ, RỒI THU HỒI chain vừa đẻ. Chạy TRÊN SERVER
//       (console chỉ nghe loopback). Mất ~5–6 phút vì restart lần lượt hai lượt.
//
//       Tự dọn là điều kiện để bài này CHẠY LẠI ĐƯỢC. Giao thức chặn cứng 16
//       subnet/node, nên nếu mỗi lần nghiệm thu ăn vĩnh viễn một chỗ thì cả dự án
//       chỉ nghiệm thu đầy đủ được khoảng chục lần — bộ kiểm thử tự đặt ra hạn
//       dùng cho chính nó. Thêm `--giu` nếu muốn giữ lại chain để soi bằng tay.
//
//   Trên server:
//     set -a; . ~/9chain-a1/console.env; set +a
//     cd ~/9chain-a1/src && node local-net/faucet/smoke-l1.mjs --create-chain
import { ethers } from "ethers";

const args = process.argv.slice(2);
const co = t => args.includes("--" + t);
function opt(t, mac) { const i = args.indexOf("--" + t); return i >= 0 && args[i + 1] ? args[i + 1] : mac; }

const TRANG = opt("trang", "https://a1.9chain.org");
const RPC_GOC = opt("rpc", "https://rpc-a1.9chain.org");
const CONSOLE = opt("console", "http://127.0.0.1:8091");
const TOKEN = process.env.A1_CONSOLE_TOKEN || "";
const DE_CHAIN = co("create-chain");
const GIU = co("giu");            // giữ lại chain vừa đẻ, không thu hồi
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
let soNode = 0;
try {
  const v = await rpc(`${RPC_GOC}/ext/bc/P`, "platform.getCurrentValidators");
  const tong = v.validators.length;
  const noi = v.validators.filter(x => x.connected).length;
  soNode = tong;
  // Không cắm cứng "phải là 5": mạng có thể mở rộng. Điều kiện thật là KHÔNG
  // validator nào rớt — một node im lặng làm mỏng quorum mà bề ngoài không đổi.
  kiem("mọi validator đang kết nối", noi === tong && tong > 0, `${noi}/${tong}`);
} catch (e) {
  kiem("đọc được validator", false, sach(e.message));
}

// 🔴 HẠN GIỜ PHẢI SUY TỪ SỐ NODE, KHÔNG ĐƯỢC CẮM CỨNG.
// Đẻ/thu hồi chain restart node LẦN LƯỢT (~31s/node, D-008). Bản cũ cắm cứng
// 300s — vừa đủ cho 5 node, và **hỏng ngay khi mạng lên 9 node**: đo thật
// 2026-08-26 là **355s**, client bỏ cuộc trong khi server làm xong.
// 60s nền + 60s/node ⇒ 9 node = 600s, còn gấp rưỡi dư địa so với số đo.
const HAN_THAO_TAC = 60_000 + Math.max(soNode, 5) * 60_000;

/**
 * Chờ một lượt đẻ/thu hồi kết thúc bằng cách đọc /api/progress.
 *
 * 🔴 Vì sao tồn tại: kết quả của lượt POST dài là **không kết luận được**.
 * Cloudflare cắt ở ~100s, hạn giờ client có thể ngắn hơn thao tác, mạng có thể
 * đứt — cả ba đều làm POST hỏng TRONG KHI SERVER CHẠY TỚI CÙNG VÀ THÀNH CÔNG.
 * Giao diện đã theo luật này từ M10.4/M10.5; bài kiểm thì chưa, nên nó báo đỏ
 * cho một sản phẩm hoạt động đúng — và tệ hơn, bỏ lại chain mồ côi ăn một slot.
 *
 * Chỉ tin khi lượt đang đọc ĐÚNG LÀ LƯỢT CỦA MÌNH (khớp name + kind): gọi sớm
 * quá là đọc trúng kết quả của lượt TRƯỚC.
 */
async function choThaoTacXong(ten, loai, hanGio) {
  const t0 = Date.now();
  while (Date.now() - t0 < hanGio) {
    try {
      const r = await fetch(`${CONSOLE}/api/progress`, {
        headers: { authorization: `Bearer ${TOKEN}` },
        signal: AbortSignal.timeout(15000),
      });
      const j = await r.json();
      if (j && j.name === ten && j.kind === loai && j.running === false) return j;
    } catch { /* console có thể đang bận giữa đợt restart — thử lại */ }
    await new Promise(s => setTimeout(s, 5000));
  }
  return null;
}

/** Bản danh bạ công khai (qua Cloudflare) — nguồn sự thật mà người dùng thật thấy. */
async function docDanhBa() {
  const rd = await fetch(`${TRANG}/chains/data/console-chains.json?t=${Date.now()}`,
    { cache: "no-store", signal: AbortSignal.timeout(20000) });
  if (!rd.ok) throw new Error(`HTTP ${rd.status}`);
  const d = await rd.json();
  return { chains: d.chains || [], retired: d.retired || [] };
}

console.log("\n── 3. Danh bạ L1 (hợp đồng dữ liệu) ──");
let danhBa = { chains: [], retired: [] };
try {
  const r = await fetch(`${TRANG}/chains/`, { signal: AbortSignal.timeout(20000) });
  kiem("trang /chains/ trả 200", r.status === 200, `HTTP ${r.status}`);
  const rd = await fetch(`${TRANG}/chains/data/console-chains.json`, { signal: AbortSignal.timeout(20000) });
  kiem("đọc được console-chains.json", rd.ok, `HTTP ${rd.status}`);
  danhBa = await rd.json();
  danhBa.retired = danhBa.retired || [];   // khoá THÊM — thiếu là hợp lệ
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

  // `preset` là khoá THÊM (M5) — chain đẻ trước đó hợp lệ khi THIẾU HẲN, trang
  // danh bạ hiện "Chuẩn". Cái không bao giờ được phép là chuỗi "undefined"/rỗng
  // lọt ra mặt người dùng — đúng luật đã áp cho khoá `admin` khi nó mới thêm.
  const presetRac = [...danhBa.chains, ...danhBa.retired].filter(c => "preset" in c &&
    (typeof c.preset !== "string" || c.preset.trim() === "" || c.preset === "undefined"));
  kiem("không có preset rác (undefined/rỗng)", presetRac.length === 0, presetRac.map(c => c.name).join(", ") || "");

  // Hai L1 trùng chainId là hố sụt: MetaMask coi chúng là MỘT mạng, và chữ ký
  // của chain này phát lại được trên chain kia.
  //
  // Tính CẢ chain đã thu hồi. Thu hồi không xoá được mạng khỏi ví người dùng, nên
  // cấp lại chainId của một chain đã thu hồi cho chain mới đẻ ra đúng cái hố đó —
  // chỉ khác là nạn nhân không có cách nào nhận ra.
  const song = danhBa.chains.map(c => c.chainId);
  const ids = [...song, ...danhBa.retired.map(c => c.chainId)];
  kiem("chainId không trùng nhau (kể cả chain đã thu hồi)",
    new Set(ids).size === ids.length, ids.join(", "));

  // Một cái tên nằm ở CẢ hai mảng nghĩa là lượt thu hồi dừng giữa chừng: hoặc
  // chain còn sống mà bị liệt là đã thu hồi, hoặc ngược lại. Cả hai đều làm trang
  // danh bạ hiện cùng một chain hai lần với hai trạng thái đối nhau.
  const tenSong = new Set(danhBa.chains.map(c => c.name));
  const kep = danhBa.retired.filter(c => tenSong.has(c.name)).map(c => c.name);
  kiem("không chain nào vừa sống vừa đã thu hồi", kep.length === 0, kep.join(", ") || "");

  // Trần cứng của giao thức: node khai quá 16 subnet lúc bắt tay bị mọi peer cắt
  // kết nối. Chỉ chain ĐANG TRACK mới tính — đó chính là điều thu hồi mua về.
  kiem("số L1 đang track dưới trần giao thức", danhBa.chains.length <= 16,
    `${danhBa.chains.length}/16` + (danhBa.retired.length ? ` · đã trả lại ${danhBa.retired.length} chỗ` : ""));
} catch (e) {
  kiem("đọc được danh bạ", false, sach(e.message));
}

// Mốc so sánh cho `--create-chain`: đọc TRƯỚC khi đẻ. Bài nghiệm thu phải trả mạng về
// đúng trạng thái nó nhận được, nếu không thì chính nó là thứ làm cạn 15 chỗ.
const soL1BanDau = danhBa.chains.length;

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
  console.log("  ℹ️  RPC trả lời KHÔNG chứng minh chain chốt được block — xem --create-chain.");
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
      while (Date.now() - t0 < HAN_THAO_TAC && !dungDo) {
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
        signal: AbortSignal.timeout(HAN_THAO_TAC),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      chain = j;
      kiem("console đẻ được chain", true, `${((Date.now() - t0) / 1000).toFixed(1)}s`);
    } catch (e) {
      // POST hỏng ≠ server hỏng. Đi hỏi tiến trình rồi hỏi DANH BẠ xem sự thật là gì.
      await choThaoTacXong(ten, "create", HAN_THAO_TAC);
      let m = null;
      try { m = (await docDanhBa()).chains.find(c => c.name === ten) || null; } catch { /* dưới báo */ }
      chain = m;
      kiem("console đẻ được chain", !!m,
        m ? `${((Date.now() - t0) / 1000).toFixed(1)}s — POST không kết luận được (${sach(e.message)}), sự thật lấy từ danh bạ`
          : sach(e.message));
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
        const d = await docDanhBa();
        const m = d.chains.find(c => c.name === ten);
        kiem("danh bạ công khai đã có chain mới", !!m, m ? `admin ${m.admin}` : "không thấy");
        if (m) kiem("danh bạ ghi đúng admin", m.admin === vi.address, m.admin);
      } catch (e) {
        kiem("danh bạ công khai đã có chain mới", false, sach(e.message));
      }
    }

    // ══════════════════════════════════════════════════════════════════════
    if (chain && !GIU) {
      console.log("\n── 6. Thu hồi chain vừa đẻ (trả lại slot track) ──");

      // Đo C-Chain trong lúc thu hồi. Thu hồi cũng restart cả 5 node y như lúc đẻ,
      // nên nó có đúng nguy cơ giáng gián đoạn lên ví của người ngoài — phải đo
      // chứ không giả định "chỉ là dọn dẹp nên chắc nhẹ".
      let dungDo2 = false;
      const doC2 = (async () => {
        const t0 = Date.now(), mau = [];
        let dangDut = null, dutDaiNhat = 0;
        while (Date.now() - t0 < HAN_THAO_TAC && !dungDo2) {
          const ts = Date.now();
          let ok = false;
          try { await rpc(`${RPC_GOC}/ext/bc/C/rpc`, "eth_blockNumber"); ok = true; } catch { /* đếm dưới */ }
          mau.push(ok);
          if (!ok) { if (dangDut === null) dangDut = ts; }
          else if (dangDut !== null) { dutDaiNhat = Math.max(dutDaiNhat, Date.now() - dangDut); dangDut = null; }
          const con = 500 - (Date.now() - ts);
          if (con > 0) await new Promise(s => setTimeout(s, con));
        }
        if (dangDut !== null) dutDaiNhat = Math.max(dutDaiNhat, Date.now() - dangDut);
        return { luot: mau.length, hong: mau.filter(x => !x).length, dutDaiNhatGiay: +(dutDaiNhat / 1000).toFixed(1) };
      })();

      let thuHoi = null;
      const tr = Date.now();
      try {
        const r = await fetch(`${CONSOLE}/api/revoke`, {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Bearer ${TOKEN}` },
          body: JSON.stringify({ name: ten, xacNhan: ten }),
          signal: AbortSignal.timeout(HAN_THAO_TAC),
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
        thuHoi = j;
        kiem("console thu hồi được chain", true, `${((Date.now() - tr) / 1000).toFixed(1)}s`);
      } catch (e) {
        // Y như lúc đẻ: POST hỏng không kết luận được. Sự thật nằm ở danh bạ —
        // chain phải RỜI mảng `chains` và xuất hiện trong `retired`.
        await choThaoTacXong(ten, "revoke", HAN_THAO_TAC);
        let daThuHoi = false;
        try {
          const d = await docDanhBa();
          daThuHoi = !d.chains.some(c => c.name === ten) && d.retired.some(c => c.name === ten);
        } catch { /* dưới báo */ }
        if (daThuHoi) thuHoi = { name: ten };
        kiem("console thu hồi được chain", daThuHoi,
          daThuHoi ? `${((Date.now() - tr) / 1000).toFixed(1)}s — POST không kết luận được (${sach(e.message)}), sự thật lấy từ danh bạ`
            : sach(e.message));
      }
      dungDo2 = true;
      const do2 = await doC2;
      console.log(`\n  ▸ GIÁN ĐOẠN C-CHAIN trong lúc thu hồi:`);
      console.log(`    ${do2.luot} lượt · hỏng ${do2.hong} · dài nhất ${do2.dutDaiNhatGiay}s`);
      ket.push({ ten: "đo gián đoạn C-Chain (thu hồi)", dat: true, chiTiet: JSON.stringify(do2) });

      if (thuHoi) {
        // ĐÂY là bằng chứng slot đã được trả lại, không phải con số console tự khai:
        // node còn track thì nó còn định tuyến /ext/bc/<id>/rpc. RPC im hẳn nghĩa là
        // subnet đã rời khỏi danh sách track — thứ mà trần 16 của giao thức đếm.
        let conSong = true;
        try { await rpc(chain.rpc, "eth_chainId"); } catch { conSong = false; }
        kiem("RPC của chain đã thu hồi THÔI trả lời", !conSong,
          conSong ? "vẫn trả lời — slot CHƯA được trả lại" : "im hẳn");

        try {
          const d = await docDanhBa();
          kiem("danh bạ công khai không còn liệt chain đó là đang chạy",
            !d.chains.some(c => c.name === ten), `${d.chains.length} L1 đang chạy`);
          kiem("chain nằm trong mục đã thu hồi", d.retired.some(c => c.name === ten),
            `${d.retired.length} mục`);
          // Điều kiện qua của M4.4: chạy bài này n lần thì danh bạ vẫn n lần y như cũ.
          kiem("số L1 đang chạy trở về đúng mức trước khi chạy bài này",
            d.chains.length === soL1BanDau, `${soL1BanDau} → ${d.chains.length}`);
        } catch (e) {
          kiem("danh bạ công khai phản ánh việc thu hồi", false, sach(e.message));
        }
      }
    } else if (chain && GIU) {
      console.log(`\n  ℹ️  --giu: KHÔNG thu hồi. "${ten}" ở lại danh bạ và giữ một slot track vĩnh viễn.`);
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════
console.log(`\n════ ${ket.length - hong}/${ket.length} ĐẠT ════`);
if (hong) {
  console.log("HỎNG:");
  for (const k of ket.filter(k => !k.dat)) console.log(`  ✗ ${k.ten}${k.chiTiet ? " — " + k.chiTiet : ""}`);
}
if (!DE_CHAIN) console.log("(chế độ nhẹ — thêm --create-chain để nghiệm thu đường đẻ chain đầy đủ)");
process.exit(hong ? 1 : 0);
