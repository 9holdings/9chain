// probe-net.mjs — đo GIÁN ĐOẠN của một endpoint RPC trong lúc có thao tác nặng
// chạy song song (đẻ chain, restart node, reload Caddy).
//
// Vì sao tồn tại: hiện không có cách nào trả lời câu hỏi "người dùng đang mở ví
// có thấy mạng chết không khi ai đó bấm nút đẻ chain". `docker ps` báo container
// UP trong khi RPC đã ngừng trả lời từ lâu; `curl` một phát thì hoặc trúng lúc
// hỏng hoặc không, không đo được gì. Phải poll liên tục rồi đếm.
//
// KHÔNG DÙNG THƯ VIỆN NGOÀI — chạy được thẳng trên server, nơi
// `~/9chain-a1/src` không có package.json/node_modules (thêm một `import` từ
// npm là script chết lúc khởi động dù máy dev chạy ngon).
//
//   node local-net/faucet/probe-net.mjs <RPC_URL> [--giay 180] [--nhip 250] [--out bao-cao.json]
//
// Ví dụ — đo từ MÁY DEV qua Cloudflare (thứ người dùng thật trải nghiệm):
//   node local-net/faucet/probe-net.mjs https://rpc-a1.9chain.org/ext/bc/C/rpc --giay 300
//
// Ví dụ — đo TRÊN SERVER, bỏ qua CDN (tách lỗi node khỏi lỗi Cloudflare):
//   node probe-net.mjs http://127.0.0.1:9650/ext/bc/C/rpc --giay 300

const args = process.argv.slice(2);
const RPC = args.find(a => !a.startsWith("--"));
function opt(ten, mac) {
  const i = args.indexOf("--" + ten);
  return i >= 0 && args[i + 1] ? args[i + 1] : mac;
}
if (!RPC) {
  console.error("dùng: node probe-net.mjs <RPC_URL> [--giay 180] [--nhip 250] [--out bao-cao.json]");
  process.exit(2);
}
const TONG_MS = Number(opt("giay", 180)) * 1000;
const NHIP_MS = Number(opt("nhip", 250));
const RA = opt("ra", null);
// Timeout mỗi request PHẢI có. Không có nó thì một request treo sẽ chặn vòng
// lặp poll, và ta đo thành "1 lỗi" thay vì "60 giây không ai gọi được" — tức là
// đo hụt đúng cái tệ nhất.
const TIMEOUT_MS = Number(opt("timeout", 5000));

/** Một lượt gọi. Trả {ok, ms, block?, loi?} — không bao giờ ném. */
async function goiMot() {
  const t0 = Date.now();
  const ac = new AbortController();
  const hen = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(RPC, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] }),
      signal: ac.signal,
    });
    const ms = Date.now() - t0;
    if (!r.ok) return { ok: false, ms, loi: `HTTP ${r.status}` };
    const j = await r.json();
    if (j.error) return { ok: false, ms, loi: `RPC ${j.error.message}` };
    if (typeof j.result !== "string") return { ok: false, ms, loi: "thiếu result" };
    return { ok: true, ms, block: parseInt(j.result, 16) };
  } catch (e) {
    const ms = Date.now() - t0;
    return { ok: false, ms, loi: e.name === "AbortError" ? `timeout ${TIMEOUT_MS}ms` : String(e.message || e) };
  } finally {
    clearTimeout(hen);
  }
}

const batDau = Date.now();
const mau = [];        // mọi lượt gọi
const dutQuang = [];   // các khoảng chết: {tuMs, denMs, dai, soLuot, loi}
let dangDut = null;
let blockDau = null, blockCuoi = null;

function moc() { return ((Date.now() - batDau) / 1000).toFixed(1).padStart(6) + "s"; }

console.error(`# đo ${RPC}`);
console.error(`# ${TONG_MS / 1000}s, nhịp ${NHIP_MS}ms, timeout ${TIMEOUT_MS}ms — Ctrl-C để dừng sớm`);

let dungLai = false;
process.on("SIGINT", () => { dungLai = true; });

while (!dungLai && Date.now() - batDau < TONG_MS) {
  const dinh = Date.now();
  const r = await goiMot();
  mau.push(r);

  if (r.ok) {
    if (blockDau === null) blockDau = r.block;
    blockCuoi = r.block;
    if (dangDut) {
      // Khoảng chết khép lại. Độ dài tính tới THỜI ĐIỂM NÀY, không phải tới lượt
      // lỗi cuối — người dùng vẫn đang chờ trong suốt khoảng trống đó.
      dangDut.denMs = Date.now() - batDau;
      dangDut.dai = dangDut.denMs - dangDut.tuMs;
      dutQuang.push(dangDut);
      console.error(`${moc()}  ✓ hồi phục sau ${(dangDut.dai / 1000).toFixed(1)}s (${dangDut.soLuot} lượt hỏng)`);
      dangDut = null;
    }
  } else {
    if (!dangDut) {
      dangDut = { tuMs: dinh - batDau, denMs: null, dai: null, soLuot: 0, loi: r.loi };
      console.error(`${moc()}  ✗ BẮT ĐẦU GIÁN ĐOẠN — ${r.loi}`);
    }
    dangDut.soLuot++;
  }

  const con = NHIP_MS - (Date.now() - dinh);
  if (con > 0) await new Promise(s => setTimeout(s, con));
}

// Khoảng chết còn dở lúc kết thúc: vẫn tính, nhưng đánh dấu là CHƯA hồi phục —
// gộp im lặng vào thống kê sẽ biến "mạng còn đang chết" thành "gián đoạn Ns".
if (dangDut) {
  dangDut.denMs = Date.now() - batDau;
  dangDut.dai = dangDut.denMs - dangDut.tuMs;
  dangDut.chuaHoiPhuc = true;
  dutQuang.push(dangDut);
}

const tot = mau.filter(m => m.ok);
const treTang = tot.map(m => m.ms).sort((a, b) => a - b);
const p = q => (treTang.length ? treTang[Math.min(treTang.length - 1, Math.floor(q * treTang.length))] : null);
const dutDaiNhat = dutQuang.reduce((a, b) => (!a || b.dai > a.dai ? b : a), null);

const baoCao = {
  rpc: RPC,
  batDau: new Date(batDau).toISOString(),
  chayGiay: Math.round((Date.now() - batDau) / 1000),
  nhipMs: NHIP_MS,
  tongLuot: mau.length,
  luotHong: mau.length - tot.length,
  tiLeHongPhanTram: mau.length ? +(((mau.length - tot.length) / mau.length) * 100).toFixed(2) : 0,
  treMs: { p50: p(0.5), p95: p(0.95), p99: p(0.99), max: treTang.at(-1) ?? null },
  block: { dau: blockDau, cuoi: blockCuoi, tang: blockDau !== null ? blockCuoi - blockDau : null },
  soLanGianDoan: dutQuang.length,
  gianDoanDaiNhatGiay: dutDaiNhat ? +(dutDaiNhat.dai / 1000).toFixed(1) : 0,
  tongGianDoanGiay: +(dutQuang.reduce((s, d) => s + d.dai, 0) / 1000).toFixed(1),
  chiTietGianDoan: dutQuang.map(d => ({
    tuGiay: +(d.tuMs / 1000).toFixed(1),
    daiGiay: +(d.dai / 1000).toFixed(1),
    soLuot: d.soLuot,
    loi: d.loi,
    ...(d.chuaHoiPhuc ? { chuaHoiPhuc: true } : {}),
  })),
};

console.error("");
console.error("════ KẾT QUẢ ════");
console.error(`  lượt gọi        : ${baoCao.tongLuot} (hỏng ${baoCao.luotHong} = ${baoCao.tiLeHongPhanTram}%)`);
console.error(`  trễ p50/p95/max : ${baoCao.treMs.p50} / ${baoCao.treMs.p95} / ${baoCao.treMs.max} ms`);
console.error(`  block           : ${baoCao.block.dau} → ${baoCao.block.cuoi} (+${baoCao.block.tang})`);
console.error(`  gián đoạn       : ${baoCao.soLanGianDoan} lần · dài nhất ${baoCao.gianDoanDaiNhatGiay}s · tổng ${baoCao.tongGianDoanGiay}s`);
if (dutQuang.some(d => d.chuaHoiPhuc)) console.error(`  ⚠️  kết thúc lúc RPC VẪN ĐANG CHẾT — số trên là cận dưới`);

if (RA) {
  const { writeFileSync } = await import("node:fs");
  writeFileSync(RA, JSON.stringify(baoCao, null, 2));
  console.error(`  đã ghi          : ${RA}`);
}
// stdout = JSON thuần để script khác đọc; mọi thứ người đọc đi qua stderr.
console.log(JSON.stringify(baoCao));
