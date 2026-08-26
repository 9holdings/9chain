// auth-e2e-test.mjs — nghiệm thu ĐƯỜNG XÁC THỰC của console bằng cách chạy
// console THẬT rồi đi hết luồng qua HTTP.
//
//   node local-net/console/auth-e2e-test.mjs      (chạy ở gốc dự án)
//
// ═══ VÌ SAO CẦN, KHI ĐÃ CÓ siwe-test.mjs ═══
// `siwe-test.mjs` kiểm lớp mật mã tách rời. Nó KHÔNG bắt được lớp lỗi nguy hiểm
// hơn: nối dây sai. Ví dụ endpoint quên gọi kiểm quyền, hoặc `admin` không thật sự
// bị ép bằng địa chỉ ký, hoặc 401 trả về ở chỗ đáng lẽ 403. Những thứ đó chỉ lộ ra
// khi có một tiến trình thật nghe cổng thật.
//
// KHÔNG đụng mạng công khai và KHÔNG gọi /api/create (nó cần docker + tốn tiền);
// bài này chỉ kiểm cổng xác thực và quy tắc quyền sở hữu.
import { spawn } from "node:child_process";
import { Wallet } from "ethers";

const PORT = 18099;
const GOC = `http://127.0.0.1:${PORT}`;
const TOKEN_VAN_HANH = "test-token-van-hanh-du-dai-16";

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet = "") {
  if (ok) { dat++; console.log(`  ✓ ${ten}${chiTiet ? "  — " + chiTiet : ""}`); }
  else { hong++; console.log(`  ✗ ${ten}${chiTiet ? "  — " + chiTiet : ""}`); }
}

async function goi(duong, { method = "GET", body, token } = {}) {
  const headers = { "content-type": "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;
  const r = await fetch(GOC + duong, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10000),
  });
  let j = null;
  try { j = await r.json(); } catch { /* có endpoint trả rỗng */ }
  return { status: r.status, j };
}

// Console bắt buộc có A1_CONSOLE_TOKEN và A1_CLI_KEY, nếu không nó tự thoát.
// Khoá ở đây là GIẢ và chỉ sống trong tiến trình con — bài này không đẻ chain.
const con = spawn(process.execPath, ["local-net/console/server.mjs"], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    PORT: String(PORT),
    A1_CONSOLE_HOST: "127.0.0.1",
    A1_CONSOLE_TOKEN: TOKEN_VAN_HANH,
    A1_CLI_KEY: "PrivateKey-khoa-gia-chi-de-console-chiu-khoi-dong",
    // ═══ CHỐT CHẶN AN TOÀN — ĐỪNG BỎ ═══
    // Bài này chạy console THẬT, đọc ĐÚNG `console-chains.json` thật, và trên
    // server thì đó là danh bạ của testnet công khai. Mọi lượt thu hồi ở đây đều
    // ĐƯỢC THIẾT KẾ để bị từ chối — nhưng "được thiết kế" không phải là bảo đảm.
    // Một lượt lọt qua sẽ restart lần lượt cả 5 validator của mạng đang chạy.
    // Trỏ compose vào đường dẫn không tồn tại: nếu logic quyền có lỗ, lệnh docker
    // sẽ chết vì thiếu file thay vì đụng vào mạng thật. Rẻ, và biến một rủi ro
    // "chắc là không xảy ra" thành "không thể xảy ra".
    A1_COMPOSE_FILE: "/khong-ton-tai/an-toan-cho-bai-kiem.yml",
    A1_CONSOLE_DOMAIN: "a1.9chain.org",
    // Nới hạn mức cho bài kiểm: nó cố tình gọi nhiều lượt thu hồi BỊ TỪ CHỐI để
    // kiểm cổng quyền. Với mặc định 3/giờ thì chính bài kiểm tự khoá mình lại —
    // và đó là cách phát hiện ra hạn mức đang bị tiêu bởi request không làm gì cả.
    A1_LIMIT_REVOKE: "50",
    A1_LIMIT_CREATE: "50",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let logCon = "";
con.stdout.on("data", d => { logCon += d; });
con.stderr.on("data", d => { logCon += d; });

function dong() { try { con.kill(); } catch { /* đã chết */ } }
process.on("exit", dong);

// Chờ console nghe cổng — thăm dò chứ không ngủ một khoảng đoán mò.
let len = false;
for (let i = 0; i < 50; i++) {
  try { await goi("/whoami"); len = true; break; } catch { await new Promise(r => setTimeout(r, 200)); }
}
if (!len) {
  console.log("✗ console KHÔNG khởi động được. Log:\n" + logCon);
  process.exit(1);
}

console.log("\n── 1. Cổng đóng mặc định ──");
{
  const a = await goi("/api/status");
  kiem("không token → 401", a.status === 401, `HTTP ${a.status}`);
  kiem("401 chỉ đường cho cả hai cách đăng nhập",
    /A1_CONSOLE_TOKEN/.test(a.j?.error || "") && /siwe/.test(a.j?.error || ""));
  const b = await goi("/api/status", { token: "token-bia-dat" });
  kiem("token sai → 401", b.status === 401, `HTTP ${b.status}`);
  const c = await goi("/api/create", { method: "POST", body: { name: "Hack" } });
  kiem("đẻ chain không token → 401", c.status === 401, `HTTP ${c.status}`);
  const d = await goi("/api/revoke", { method: "POST", body: { name: "DeltaChain", xacNhan: "DeltaChain" } });
  kiem("thu hồi không token → 401", d.status === 401, `HTTP ${d.status}`);
}

console.log("\n── 2. Token vận hành (đường cũ KHÔNG được gãy) ──");
{
  const a = await goi("/api/status", { token: TOKEN_VAN_HANH });
  kiem("token vận hành vào được /api/status", a.status === 200, `HTTP ${a.status}`);
  kiem("khai đúng kiểu đăng nhập", a.j?.dangNhap === "vanHanh", String(a.j?.dangNhap));
  kiem("không gắn ví nào", a.j?.viDangNhap === null);
  kiem("vẫn trả danh bạ như cũ", Array.isArray(a.j?.chains));
  kiem("có trần L1 cho giao diện", a.j?.tran > 0 && a.j?.tranGiaoThuc === 16, `${a.j?.tran}/${a.j?.tranGiaoThuc}`);
}

console.log("\n── 3. Đăng nhập bằng ví ──");
const vi = Wallet.createRandom();
let phien = null;
{
  const n = await goi(`/api/siwe/nonce?address=${vi.address}`);
  kiem("xin được lời mời ký", n.status === 200 && !!n.j?.nonce, `HTTP ${n.status}`);
  kiem("message nêu đúng domain", (n.j?.message || "").startsWith("a1.9chain.org wants you to sign in"));
  kiem("message nêu đúng địa chỉ", (n.j?.message || "").includes(vi.address));

  const chuKy = await vi.signMessage(n.j.message);
  const l = await goi("/api/siwe/login", { method: "POST", body: { nonce: n.j.nonce, signature: chuKy } });
  kiem("đổi chữ ký lấy phiên", l.status === 200 && !!l.j?.token, `HTTP ${l.status}`);
  kiem("phiên gắn đúng ví", l.j?.address === vi.address, l.j?.address);
  phien = l.j?.token;

  // Phát lại qua HTTP — cùng bài của siwe-test nhưng đi hết đường dây thật.
  const lai = await goi("/api/siwe/login", { method: "POST", body: { nonce: n.j.nonce, signature: chuKy } });
  kiem("dùng lại nonce qua HTTP → 401", lai.status === 401, `HTTP ${lai.status}`);

  const a = await goi("/api/status", { token: phien });
  kiem("phiên ví vào được /api/status", a.status === 200, `HTTP ${a.status}`);
  kiem("khai đúng kiểu đăng nhập", a.j?.dangNhap === "vi", String(a.j?.dangNhap));
  kiem("khai đúng ví đang đăng nhập", a.j?.viDangNhap === vi.address, a.j?.viDangNhap);
}

console.log("\n── 4. Địa chỉ hỏng checksum bị chặn ở cửa ──");
{
  const xau = vi.address.slice(0, -1) + (vi.address.at(-1) === "a" ? "A" : "a");
  const n = await goi(`/api/siwe/nonce?address=${xau}`);
  kiem("địa chỉ sai checksum → 400", n.status === 400, `HTTP ${n.status}`);
  const t = await goi(`/api/siwe/nonce?address=khong-phai-dia-chi`);
  kiem("chuỗi rác → 400", t.status === 400, `HTTP ${t.status}`);
  const r = await goi(`/api/siwe/nonce`);
  kiem("thiếu address → 400", r.status === 400, `HTTP ${r.status}`);
}

// Tên chain lấy TỪ DANH BẠ ĐANG CHẠY, không cắm cứng.
//
// Bản đầu cắm cứng "DeltaChain" — chain chỉ có trong config máy dev. Chạy trên
// server thì 3 bài trượt với lý do "không có L1 nào tên DeltaChain", tức là bài
// kiểm báo hỏng ở chỗ code hoàn toàn đúng. Một bài nghiệm thu chỉ chạy được trên
// đúng một máy thì không dùng được trong deploy — mà deploy mới là chỗ cần nó nhất.
const dsChain = (await goi("/api/chains", { token: TOKEN_VAN_HANH })).j?.chains || [];
const chainThat = dsChain[0]?.name || null;

console.log("\n── 5. Ví lạ KHÔNG thu hồi được chain của người khác ──");
if (!chainThat) {
  console.log("  ⏭️  danh bạ rỗng — bỏ qua (KHÔNG tính là đạt)");
} else {
  const chuSoHuu = typeof dsChain[0].admin === "string" ? dsChain[0].admin.trim() : "";
  const a = await goi("/api/revoke", { method: "POST", token: phien, body: { name: chainThat, xacNhan: chainThat } });
  kiem(`ví lạ thu hồi "${chainThat}" (không phải của nó) → 403`, a.status === 403, `HTTP ${a.status}`);
  kiem("lỗi nói rõ vì sao", /mặc định của hệ thống|thuộc về/.test(a.j?.error || ""), a.j?.error);
  kiem("lỗi nêu đúng loại chủ sở hữu",
    chuSoHuu ? (a.j?.error || "").includes(chuSoHuu) : /mặc định của hệ thống/.test(a.j?.error || ""),
    chuSoHuu || "(không có admin)");

  // Chain không tồn tại: phải rơi vào lỗi "không có chain" của thuHoiChain (400),
  // KHÔNG phải 403 — nhầm mã ở đây làm người dùng tưởng mình thiếu quyền.
  const b = await goi("/api/revoke", { method: "POST", token: phien, body: { name: "ChainKhongCo", xacNhan: "ChainKhongCo" } });
  kiem("chain không tồn tại → 400 (không phải 403)", b.status === 400, `HTTP ${b.status}`);
}

console.log("\n── 6. Thu hồi vẫn đòi xác nhận đúng tên ──");
if (!chainThat) {
  console.log("  ⏭️  danh bạ rỗng — bỏ qua (KHÔNG tính là đạt)");
} else {
  const a = await goi("/api/revoke", { method: "POST", token: TOKEN_VAN_HANH, body: { name: chainThat } });
  kiem("thiếu xacNhan → từ chối", a.status === 400 && /xacNhan/.test(a.j?.error || ""), a.j?.error);
  const b = await goi("/api/revoke", { method: "POST", token: TOKEN_VAN_HANH, body: { name: chainThat, xacNhan: "sai" } });
  kiem("xacNhan sai → từ chối", b.status === 400, `HTTP ${b.status}`);
}

console.log("\n── 7. Không rò bí mật ra phản hồi ──");
{
  const a = await goi("/api/status", { token: phien });
  const chuoi = JSON.stringify(a.j);
  kiem("phản hồi không chứa token vận hành", !chuoi.includes(TOKEN_VAN_HANH));
  kiem("phản hồi không chứa khoá CLI", !chuoi.includes("PrivateKey-"));
  kiem("banner console không in token", !logCon.includes(TOKEN_VAN_HANH));
}

console.log("\n── 8. Request CHƯA XÁC THỰC không được tiêu quota của người thật ──");
{
  // Dựng một console thứ hai với ngân sách thu hồi = 1 để đo đúng ranh giới.
  const PORT2 = PORT + 1;
  const con2 = spawn(process.execPath, ["local-net/console/server.mjs"], {
    cwd: process.cwd(),
    env: {
      ...process.env, PORT: String(PORT2), A1_CONSOLE_HOST: "127.0.0.1",
      A1_CONSOLE_TOKEN: TOKEN_VAN_HANH,
      A1_CLI_KEY: "PrivateKey-khoa-gia-chi-de-console-chiu-khoi-dong",
    // ═══ CHỐT CHẶN AN TOÀN — ĐỪNG BỎ ═══
    // Bài này chạy console THẬT, đọc ĐÚNG `console-chains.json` thật, và trên
    // server thì đó là danh bạ của testnet công khai. Mọi lượt thu hồi ở đây đều
    // ĐƯỢC THIẾT KẾ để bị từ chối — nhưng "được thiết kế" không phải là bảo đảm.
    // Một lượt lọt qua sẽ restart lần lượt cả 5 validator của mạng đang chạy.
    // Trỏ compose vào đường dẫn không tồn tại: nếu logic quyền có lỗ, lệnh docker
    // sẽ chết vì thiếu file thay vì đụng vào mạng thật. Rẻ, và biến một rủi ro
    // "chắc là không xảy ra" thành "không thể xảy ra".
    A1_COMPOSE_FILE: "/khong-ton-tai/an-toan-cho-bai-kiem.yml",
      A1_LIMIT_REVOKE: "1",
    },
    stdio: ["ignore", "ignore", "ignore"],
  });
  const goi2 = async (duong, o = {}) => {
    const headers = { "content-type": "application/json" };
    if (o.token) headers.authorization = `Bearer ${o.token}`;
    const r = await fetch(`http://127.0.0.1:${PORT2}${duong}`, {
      method: o.method || "GET", headers,
      body: o.body ? JSON.stringify(o.body) : undefined,
      signal: AbortSignal.timeout(10000),
    });
    return { status: r.status, j: await r.json().catch(() => null) };
  };
  try {
    for (let i = 0; i < 40; i++) {
      try { await goi2("/whoami"); break; } catch { await new Promise(r => setTimeout(r, 200)); }
    }
    // 5 lượt gõ cửa KHÔNG token — trước đây mỗi lượt ăn một suất trong ngân sách 1.
    for (let i = 0; i < 5; i++) {
      await goi2("/api/revoke", { method: "POST", body: { name: "X", xacNhan: "X" } });
    }
    // Người dùng thật ở đây là một VÍ (ngân sách nghiêm ngặt chỉ áp cho ví).
    const v = Wallet.createRandom();
    const n = (await goi2(`/api/siwe/nonce?address=${v.address}`)).j;
    const phienVi = (await goi2("/api/siwe/login", {
      method: "POST", body: { nonce: n.nonce, signature: await v.signMessage(n.message) },
    })).j.token;

    const that = await goi2("/api/revoke", {
      method: "POST", token: phienVi, body: { name: "ChainKhongCo", xacNhan: "ChainKhongCo" },
    });
    kiem("sau 5 lượt gõ cửa không token, ví thật VẪN còn nguyên suất",
      that.status !== 429, `HTTP ${that.status}`);

    const nua = await goi2("/api/revoke", {
      method: "POST", token: phienVi, body: { name: "ChainKhongCo", xacNhan: "ChainKhongCo" },
    });
    kiem("ngân sách thật vẫn siết ví (lượt 2 → 429)", nua.status === 429, `HTTP ${nua.status}`);

    // Người vận hành KHÔNG bị ngân sách nghiêm ngặt chặn — họ sở hữu chính máy này,
    // và siết họ chỉ chặn đúng lúc cần dùng nhất (bộ nghiệm thu M5.3 tự khoá mình).
    // Cửa ngoài chống lụt vẫn áp cho họ, nên vòng lặp chạy loạn vẫn bị chặn.
    for (let i = 0; i < 4; i++) {
      await goi2("/api/revoke", { method: "POST", token: TOKEN_VAN_HANH, body: { name: "ChainKhongCo", xacNhan: "ChainKhongCo" } });
    }
    const vh = await goi2("/api/revoke", {
      method: "POST", token: TOKEN_VAN_HANH, body: { name: "ChainKhongCo", xacNhan: "ChainKhongCo" },
    });
    kiem("token vận hành KHÔNG bị ngân sách 1 lượt/giờ chặn", vh.status !== 429, `HTTP ${vh.status}`);
  } finally {
    try { con2.kill(); } catch { /* đã chết */ }
  }
}

console.log("\n── 9. Hạn mức đếm theo VÍ, không phải theo IP ──");
{
  const PORT3 = PORT + 2;
  const con3 = spawn(process.execPath, ["local-net/console/server.mjs"], {
    cwd: process.cwd(),
    env: {
      ...process.env, PORT: String(PORT3), A1_CONSOLE_HOST: "127.0.0.1",
      A1_CONSOLE_TOKEN: TOKEN_VAN_HANH,
      A1_CLI_KEY: "PrivateKey-khoa-gia-chi-de-console-chiu-khoi-dong",
      A1_COMPOSE_FILE: "/khong-ton-tai/an-toan-cho-bai-kiem.yml",
      A1_LIMIT_REVOKE: "1",
    },
    stdio: ["ignore", "ignore", "ignore"],
  });
  const G = `http://127.0.0.1:${PORT3}`;
  const g3 = async (duong, o = {}) => {
    const headers = { "content-type": "application/json" };
    if (o.token) headers.authorization = `Bearer ${o.token}`;
    const r = await fetch(G + duong, {
      method: o.method || "GET", headers,
      body: o.body ? JSON.stringify(o.body) : undefined, signal: AbortSignal.timeout(10000),
    });
    return { status: r.status, j: await r.json().catch(() => null) };
  };
  const dangNhap = async () => {
    const v = Wallet.createRandom();
    const n = (await g3(`/api/siwe/nonce?address=${v.address}`)).j;
    const l = await g3("/api/siwe/login", { method: "POST", body: { nonce: n.nonce, signature: await v.signMessage(n.message) } });
    return l.j.token;
  };
  try {
    for (let i = 0; i < 40; i++) {
      try { await g3("/whoami"); break; } catch { await new Promise(r => setTimeout(r, 200)); }
    }
    const viA = await dangNhap();
    const viB = await dangNhap();
    const body = { method: "POST", body: { name: "ChainKhongCo", xacNhan: "ChainKhongCo" } };

    const a1 = await g3("/api/revoke", { ...body, token: viA });
    kiem("ví A dùng suất đầu tiên", a1.status !== 429, `HTTP ${a1.status}`);
    const a2 = await g3("/api/revoke", { ...body, token: viA });
    kiem("ví A hết suất → 429", a2.status === 429, `HTTP ${a2.status}`);

    // ĐÂY là điều kiện qua của M4.2: hai ví này đi từ CÙNG MỘT IP (127.0.0.1).
    // Nếu hạn mức còn khoá theo IP thì ví B đã bị ví A khoá mất — đúng kịch bản
    // "cả văn phòng dùng chung một IP, một người xài hết phần của tất cả".
    const b1 = await g3("/api/revoke", { ...body, token: viB });
    kiem("ví B CÙNG IP vẫn còn nguyên suất của mình", b1.status !== 429, `HTTP ${b1.status}`);
    const b2 = await g3("/api/revoke", { ...body, token: viB });
    kiem("ví B cũng hết suất sau lượt của chính nó → 429", b2.status === 429, `HTTP ${b2.status}`);
  } finally {
    try { con3.kill(); } catch { /* đã chết */ }
  }
}

dong();
console.log(`\n════ ${dat}/${dat + hong} ĐẠT ════`);
if (hong) console.log("Log console:\n" + logCon.split("\n").slice(0, 20).join("\n"));
process.exit(hong ? 1 : 0);
