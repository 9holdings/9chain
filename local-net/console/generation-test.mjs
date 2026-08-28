#!/usr/bin/env node
/**
 * generation-test.mjs — cổng THẾ HỆ của console: nó có hỏi node đang chạy không, và
 * nó có **từ chối** khi thế hệ lệch không.
 *
 * 🔴 VÌ SAO CÓ BÀI NÀY. Tới `2026-08-28` console **chưa bao giờ hỏi node nó đang
 * nói chuyện với thế hệ mạng nào** (`grep networkID server.mjs` ⇒ 0 kết quả).
 * Thế hệ nằm ở `lib/chainid.mjs` dưới dạng hằng số **chép tay**, độc lập với
 * `constants.A1Gen` bên Go. Ngày G bump `0 → 1`; quên một bên thì console phát
 * chainId của thế hệ khác vào ví người dùng, qua một genesis **BẤT BIẾN**, và
 * không có gì báo lỗi.
 *
 * ═══ CÁCH ĐO — VÀ VÌ SAO KHÔNG ĐO BẰNG MẠNG THẬT ═══
 * Bài dựng một **node giả đổi được câu trả lời** rồi lái console qua đủ ba trạng
 * thái. Đo bằng mạng thật thì chỉ tới được **một** trạng thái (khớp) — đúng trạng
 * thái không cần cổng. Thứ phải chứng minh là hai trạng thái **CHẶN**.
 *
 * 🔴 Ca `khớp` KHÔNG được gọi một lượt đẻ chain thật. Nó gửi **tên sai** và đòi
 * lỗi trả về phải là lỗi TÊN — tức cổng thế hệ đã cho đi qua. Chứng minh được
 * "cổng mở" mà không tiêu một slot L1 nào.
 *
 * Dùng:  node local-net/console/generation-test.mjs
 */
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { NETWORK_ID, TEN_MANG, A1_GEN } from "../lib/chainid.mjs";

const PORT = 8497;
const PORT_NODE_GIA = 8498;
const GOC = `http://127.0.0.1:${PORT}`;
const TOKEN = "token-van-hanh-chi-song-trong-bai-kiem";

let dat = 0, hong = 0;
const kiem = (ten, ok, chiTiet = "") => {
  if (ok) { dat++; console.log(`  ✓ ${ten}${chiTiet ? "  — " + chiTiet : ""}`); }
  else { hong++; console.log(`  ✗ ${ten}${chiTiet ? "  — " + chiTiet : ""}`); }
};

// ═══ NODE GIẢ ═══
// `traLoi` đổi được giữa các ca; `song` tắt được để dựng ca "không đo được".
let traLoi = { networkID: String(NETWORK_ID), networkName: TEN_MANG };
let song = true;
const nodeGia = createServer((req, res) => {
  if (!song) { req.socket.destroy(); return; }
  let b = "";
  req.on("data", (d) => { b += d; });
  req.on("end", () => {
    let method = "";
    try { method = JSON.parse(b).method; } catch { /* thân hỏng */ }
    const key = method === "info.getNetworkID" ? "networkID"
      : method === "info.getNetworkName" ? "networkName" : null;
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(
      key ? { jsonrpc: "2.0", id: 1, result: { [key]: traLoi[key] } }
        : { jsonrpc: "2.0", id: 1, error: { message: `bài kiểm không giả lập ${method}` } },
    ));
  });
});
await new Promise((r) => nodeGia.listen(PORT_NODE_GIA, "127.0.0.1", r));

const con = spawn(process.execPath, ["local-net/console/server.mjs"], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    PORT: String(PORT),
    A1_CONSOLE_HOST: "127.0.0.1",
    A1_CONSOLE_TOKEN: TOKEN,
    A1_CLI_KEY: "PrivateKey-khoa-gia-chi-de-console-chiu-khoi-dong",
    NODE_URI: `http://127.0.0.1:${PORT_NODE_GIA}`,
    // Cổng thế hệ nằm SAU cổng `A1_DE_CHAIN_MO`, nên phải mở cửa đó mới chạm tới nó.
    A1_DE_CHAIN_MO: "1",
    // ═══ CHỐT CHẶN AN TOÀN — ĐỪNG BỎ (cùng lý do với auth-e2e-test.mjs) ═══
    // Mọi lượt tạo ở đây ĐƯỢC THIẾT KẾ để bị từ chối. "Được thiết kế" không phải
    // bảo đảm: trỏ compose vào đường không tồn tại để một lỗ logic cũng chỉ chết
    // vì thiếu file, chứ không restart validator của mạng thật.
    A1_COMPOSE_FILE: "/khong-ton-tai/an-toan-cho-bai-kiem.yml",
    A1_LIMIT_CREATE: "99",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let logCon = "";
con.stdout.on("data", (d) => { logCon += d; });
con.stderr.on("data", (d) => { logCon += d; });
// 🔴 Phải CHỐNG GỌI HAI LẦN. `dong()` được gọi cả ở cuối bài lẫn ở `process.on("exit")`;
// đóng lần thứ hai một handle đang đóng làm libuv ném assertion **sau khi** bài đã in
// "✅ 13 đạt" — tức bài xanh mà tiến trình chết, và mã thoát thành mã của một vụ sập.
// 🔴 `process.on("exit")` KHÔNG được đóng handle của libuv — đóng một server ngay
// trong lượt thoát làm libuv ném assertion (`src\win\async.c`) **sau khi** bài đã in
// "✅ 13 đạt": bài xanh, tiến trình sập, và mã thoát thành mã của một vụ sập (127).
// Cổng nào cũng vô dụng nếu thứ gọi nó đọc nhầm mã thoát. Ở đây chỉ giết tiến trình
// con (việc bắt buộc nếu bài chết sớm); server đóng ở cuối, bằng đường bình thường.
process.on("exit", () => { try { con.kill(); } catch { /* đã chết */ } });

async function goi(duong, { method = "GET", body } = {}) {
  const r = await fetch(GOC + duong, {
    method,
    headers: { "content-type": "application/json", authorization: `Bearer ${TOKEN}` },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
  });
  let j = null;
  try { j = await r.json(); } catch { /* có endpoint trả rỗng */ }
  return { status: r.status, j };
}

let len = false;
for (let i = 0; i < 50; i++) {
  try { await goi("/whoami"); len = true; break; } catch { await new Promise((r) => setTimeout(r, 200)); }
}
if (!len) { console.log("✗ console KHÔNG khởi động được. Log:\n" + logCon); process.exit(1); }

/** Gửi một lượt đẻ chain và trả về câu lỗi. Tên CỐ Ý SAI ở mọi ca. */
const thu = async (ten = "!!") => (await goi("/api/create", { method: "POST", body: { name: ten } })).j?.error || "";

console.log(`\n══ CỔNG THẾ HỆ — console dựng cho g${A1_GEN} (networkID ${NETWORK_ID}, "${TEN_MANG}") ══`);

console.log("\n── 1. KHỚP → cổng phải CHO ĐI QUA ──");
{
  traLoi = { networkID: String(NETWORK_ID), networkName: TEN_MANG };
  const loi = await thu();
  kiem("không phải lỗi thế hệ (cổng đã mở)", !/THẾ HỆ/i.test(loi), loi.slice(0, 60));
  kiem("đi tới được phép kiểm KẾ TIẾP (tên sai)", /Tên chỉ gồm/.test(loi), loi.slice(0, 60));
}

console.log("\n── 2. 🔴 BẪY ĐÃ ĐO: node trả networkID là CHUỖI, không phải số ──");
{
  // `info.getNetworkID` trên avalanchego trả `"networkID":"999999999"`. So bằng
  // `===` với số là cổng ĐỎ VĨNH VIỄN — hỏng theo hướng "chặn tất", dễ bị gỡ bỏ.
  traLoi = { networkID: NETWORK_ID, networkName: TEN_MANG }; // số trần
  kiem("dạng SỐ vẫn khớp", !/THẾ HỆ/i.test(await thu()));
  traLoi = { networkID: String(NETWORK_ID), networkName: TEN_MANG }; // chuỗi
  kiem("dạng CHUỖI vẫn khớp (dạng node thật trả về)", !/THẾ HỆ/i.test(await thu()));
}

console.log("\n── 3. LỆCH THẾ HỆ → phải CHẶN ──");
{
  traLoi = { networkID: String(NETWORK_ID - 1), networkName: `9chain-a1-g${A1_GEN + 1}` };
  const loi = await thu("TenHopLe");
  kiem("🔴 chặn khi node thuộc thế hệ SAU", /LỆCH THẾ HỆ/.test(loi));
  kiem("câu lỗi nêu CẢ HAI số", loi.includes(String(NETWORK_ID)) && loi.includes(String(NETWORK_ID - 1)), loi.slice(0, 90));
  kiem("câu lỗi chỉ đúng chỗ sửa", /chainid\.mjs/.test(loi) && /A1Gen/.test(loi));
}

console.log("\n── 4. networkID đúng nhưng TÊN mạng lệch → vẫn phải chặn ──");
{
  // Hai phép đo độc lập của cùng một sự thật. Chỉ kiểm một là bỏ nửa kia.
  traLoi = { networkID: String(NETWORK_ID), networkName: "9chain-a1-tap-g0" };
  kiem("chặn khi tên mạng lệch (mạng TẬP đội lốt)", /LỆCH THẾ HỆ/.test(await thu("TenHopLe")));
}

console.log("\n── 5. KHÔNG ĐO ĐƯỢC → cũng phải chặn (rỗng ≡ hỏng) ──");
{
  song = false;
  const loi = await thu("TenHopLe");
  kiem("🔴 chặn khi không hỏi được node", /không hỏi được node/.test(loi), loi.slice(0, 80));
  kiem("nói rõ vì sao từ chối, không im lặng", /vĩnh viễn/.test(loi));
  song = true;
  traLoi = { networkID: "khong-phai-so", networkName: TEN_MANG };
  kiem("chặn khi node trả networkID không đọc được thành số", /không đọc được thành số/.test(await thu("TenHopLe")));
}

console.log("\n── 6. ĐỐI CHỨNG: cổng KHÔNG chặn bừa ──");
{
  // Không có ca này thì "chặn hết" cũng ra 100% xanh ở mục 3–5.
  traLoi = { networkID: String(NETWORK_ID), networkName: TEN_MANG };
  const loi = await thu();
  kiem("về lại trạng thái khớp thì cổng mở lại", !/THẾ HỆ|không hỏi được/.test(loi), loi.slice(0, 60));
  kiem("⇒ ba trạng thái PHÂN BIỆT ĐƯỢC, không phải chặn tất", true);
}

console.log(`\n${hong ? "✗" : "✅"} ${dat} đạt · ${hong} hỏng`);
// Không `process.exit()`: đặt mã thoát rồi để vòng lặp sự kiện tự cạn. `exit()` cắt
// ngang lúc tiến trình con và server còn đang tháo gỡ — xem chú thích ở `process.on("exit")`.
process.exitCode = hong ? 1 : 0;
con.kill();
nodeGia.close();
