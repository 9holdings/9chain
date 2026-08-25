// 9Chain-A1 Console — "bấm nút đẻ chain" (song song console operator của C1).
// Backend chạy TRÊN HOST (điều phối docker), phục vụ UI + API.
//
// Điều phối 1 lần tạo L1 (giống `9chain-a1 l1 create` nhưng tham số hoá + tích luỹ track):
//   1) sinh genesis EVM cho L1 (chainId + alloc của người dùng) vào 9chain-a1-config/console-tmp/
//   2) chạy create-l1 trong node container -> subnetID + blockchainID
//   3) restart node track TẤT CẢ subnet đã tạo (state ở console-chains.json)
//   4) chờ RPC L1 -> trả thông số MetaMask
//
// Chạy:  node local-net/console/server.mjs   (cwd = gốc dự án)  hoặc  9chain-a1 console
import http from "node:http";
import { execFile } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from "node:fs";
import { promisify } from "node:util";
import path from "node:path";
import { clientIp, rateLimit, requireToken, requireSecret, serialQueue } from "../lib/guard.mjs";
import { parseEvmAddress } from "../lib/eip55.mjs";

const PORT = Number(process.env.PORT || 8091);
// Mặc định CHỈ nghe loopback. Console điều phối docker trên host — mở ra ngoài
// là trao quyền chạy lệnh trên máy chủ. Muốn public thì phải qua reverse proxy.
const HOST = process.env.A1_CONSOLE_HOST || "127.0.0.1";
const API = process.env.NODE_URI || "http://localhost:9650";

// Token BẮT BUỘC. Thiếu -> không khởi động. Console tạo được L1 và restart node,
// tức là thao tác tốn tài nguyên và có tác dụng phụ toàn cục; để mở là ai cũng
// bơm chain rác tới khi server sập.
const TOKEN = requireSecret("A1_CONSOLE_TOKEN", {
  hint: "Console co quyen tao L1 + restart node -> BAT BUOC co token.",
});
const TRUST_PROXY = process.env.A1_TRUST_PROXY === "1";
const checkToken = requireToken(TOKEN);

// Tạo chain là thao tác NẶNG (sinh genesis, chạy create-l1, restart node).
// Giới hạn chặt hơn nhiều so với các endpoint chỉ đọc.
const limitCreate = rateLimit({ max: 3, windowMs: 60 * 60 * 1000, name: "create" });
const limitRead = rateLimit({ max: 120, windowMs: 60 * 1000, name: "read" });
// Thu hồi cũng restart cả 5 node như lúc đẻ — nặng ngang nhau, nên hạn mức ngang nhau.
// Hạn mức RIÊNG (không dùng chung khoá với create): gộp chung thì một người đẻ 3 chain
// là hết quyền dọn chính mấy chain đó, tức là hạn mức tự khoá đường sửa sai.
const limitRevoke = rateLimit({ max: 3, windowMs: 60 * 60 * 1000, name: "revoke" });

// Hai lượt tạo chain chạy song song sẽ restart node giữa chừng nhau và hỏng cả
// hai. Xếp hàng tuần tự — đây là ràng buộc đúng đắn, không phải tối ưu hoá.
const queue = serialQueue({ maxPending: 5 });
const ROOT = process.cwd(); // phải là gốc dự án
// Compose + container để điều phối. Mặc định là node đơn (dev cũ); mạng chuẩn
// hiện nay là bộ 5 node nên trên server phải trỏ sang compose multinode:
//   A1_COMPOSE_FILE=/home/ubuntu/9chain-a1/net/docker-compose.multinode.yml
//   A1_NODE_CONTAINER=9chain-a1-node-1
const COMPOSE_FILE = process.env.A1_COMPOSE_FILE || "local-net/docker-compose.yml";
const NODE_CONTAINER = process.env.A1_NODE_CONTAINER || "9chain-a1-node";
const COMPOSE = ["compose", "-f", COMPOSE_FILE];
const CFG_DIR = path.join(ROOT, "9chain-a1-config");
const TMP_DIR = path.join(CFG_DIR, "console-tmp");
const STATE = path.join(CFG_DIR, "console-chains.json");
const L1_TEMPLATE = path.join(CFG_DIR, "l1-evm-genesis.json");
const VMID = process.env.LOVE9EVM_VMID || "pkqXszJe86D3xLomib9bLpXPfW7gr7FPhDAbg46p5iNjrn4mf";

// Địa chỉ admin MẶC ĐỊNH khi lượt tạo chain không kèm `admin`.
//
// Mỗi lượt tạo chain nên tự mang địa chỉ của người bấm nút (trường `admin` trong
// POST /api/create) — đó mới là "multi-L1 as a service": chain của ai người đó
// sở hữu. Biến này chỉ là lưới đỡ cho client cũ và cho lượt tạo từ dòng lệnh.
//
// Mặc định là ewoq — khoá CÔNG KHAI ai cũng biết. Trên mạng dev thì tiện, nhưng
// trên testnet công khai nghĩa là bất kỳ ai cũng nắm toàn bộ tiền và quyền chỉnh
// phí của L1 nào rơi vào mặc định. Đặt A1_L1_ADMIN=0x... trên server.
const EWOQ = "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC";
let L1_ADMIN;
try {
  L1_ADMIN = parseEvmAddress(process.env.A1_L1_ADMIN || EWOQ, "A1_L1_ADMIN");
} catch (e) {
  console.error(`FATAL: ${e.message}`);
  process.exit(1);
}

// Khoá P-Chain trả phí tạo subnet/chain + đăng ký validator.
//
// Phải TRUYỀN VÀO CONTAINER: `docker compose exec` KHÔNG mang env của tiến trình
// gọi nó vào bên trong. Đặt A1_CLI_KEY trên host mà không có `-e` thì CLI trong
// container vẫn rơi về ewoq và lỗi thiếu tiền — mất công tìm vì cấu hình trông
// như đã đúng.
//
// Bắt buộc, giống token: cả hai genesis (dev lẫn công khai) đều KHÔNG cấp phát
// cho ewoq, nên chạy không có khoá thì mọi lượt tạo chain đều hỏng.
const CLI_KEY = requireSecret("A1_CLI_KEY", {
  hint: "Khoa P-Chain tra phi tao L1 (dang PrivateKey-<cb58>), can LOVE9 THANH KHOAN tren P-Chain.",
});

const run = promisify(execFile);
if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true });

/**
 * Đọc danh bạ + chuẩn hoá hình dạng.
 *
 * `retired` là khoá THÊM (2026-08-25, M4.4) chứa các L1 đã thu hồi. Chuẩn hoá ở
 * đây để mọi chỗ dùng khỏi phải `|| []` rải rác — thiếu một chỗ là ném
 * `undefined.map` giữa lúc đang restart node, tức là hỏng ở đúng đoạn đắt nhất.
 * File cũ (chưa có khoá này) vẫn hợp lệ: thêm khoá là an toàn với hợp đồng dữ liệu.
 */
function loadState() {
  let s;
  try { s = JSON.parse(readFileSync(STATE, "utf8")); } catch { s = {}; }
  if (!s || typeof s !== "object") s = {};
  if (!Array.isArray(s.chains)) s.chains = [];
  if (!Array.isArray(s.retired)) s.retired = [];
  return s;
}

/**
 * Ghi state + giữ một bản sao trước đó.
 *
 * `console-chains.json` là danh bạ L1 DUY NHẤT và chỉ có một bản trên server.
 * Mất nó thì các chain vẫn chạy nhưng **không ai tìm được chúng nữa**: tên,
 * chủ sở hữu, chainId, URL RPC đều nằm trong đây và không dựng lại được từ
 * P-Chain (P-Chain biết subnetID/blockchainID, không biết ai đặt tên gì).
 *
 * Ghi qua file tạm rồi rename: ghi thẳng mà tiến trình chết giữa chừng là còn
 * lại JSON cụt — `loadState()` bắt lỗi rồi trả `{chains: []}`, tức là **danh bạ
 * rỗng trông như hợp lệ**, và lượt tạo chain kế tiếp sẽ ghi đè lên đó.
 */
function saveState(s) {
  const noiDung = JSON.stringify(s, null, 2);
  try {
    if (existsSync(STATE)) writeFileSync(STATE + ".bak", readFileSync(STATE));
  } catch (e) {
    console.warn(`  ⚠️  không sao lưu được state cũ: ${e.message}`);
  }
  const tmp = STATE + ".tmp";
  writeFileSync(tmp, noiDung);
  renameSync(tmp, STATE);
}

async function rpc(pathSeg, method, params = []) {
  const r = await fetch(API + pathSeg, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message);
  return j.result;
}

/** Xoá khoá bí mật khỏi mọi chuỗi trước khi log hoặc trả về client. */
function scrub(s) {
  return String(s ?? "").split(CLI_KEY).join("<A1_CLI_KEY>");
}

// Subnet của Primary Network (P/X/C). `ids.Empty` in ra chuỗi này.
const PRIMARY_SUBNET = "11111111111111111111111111111111LpoYY";

// ═══════════════════════════════════════════════════════════════════════════
// TRẦN CỨNG CỦA GIAO THỨC — KHÔNG PHẢI CON SỐ TỰ ĐẶT
//
// `network/peer/peer.go:882`: trong lúc BẮT TAY P2P, node nhận đếm số subnet mà
// peer khai. Quá 16 thì nó ghi log "malformed message" rồi gọi `p.StartClose()`
// — CẮT KẾT NỐI. Và `message/outbound_msg_builder.go:266` cho thấy bên gửi
// KHÔNG cắt bớt danh sách: nó gửi nguyên si mọi subnet đang track.
//
// Hệ quả: node track quá 16 L1 sẽ bị MỌI peer ngắt kết nối ngay khi bắt tay.
// Không phải chậm đi, không phải cảnh báo — mạng VỠ. Và hỏng theo kiểu khó đoán
// nhất: node vẫn chạy, log vẫn sạch ở phía nó, chỉ là không ai nói chuyện với nó.
//
// Đây là trần của MÔ HÌNH HIỆN TẠI (mọi validator track mọi L1), không phải trần
// của Avalanche. Muốn vượt qua thì phải đổi kiến trúc: tập validator riêng cho
// từng L1 (đúng thứ ACP-77 sinh ra để giải quyết) hoặc chia node theo nhóm subnet.
//
// Để 15 chứ không phải 16: chừa một chỗ cho subnet đẻ ra ngoài luồng console
// (ví dụ lượt tạo hỏng giữa chừng để lại subnet mồ côi không có trong state).
const TRAN_SUBNET_GIAO_THUC = 16;
const MAX_L1 = Math.min(Number(process.env.A1_MAX_L1 || 15), TRAN_SUBNET_GIAO_THUC);

/**
 * Node đã phục vụ lại được MẠNG CHÍNH chưa (P, X, C)?
 *
 * ═══ VÌ SAO KHÔNG DÙNG `healthy: true` ═══
 * Cách hiển nhiên — chờ `health.health` trả `"healthy": true` — là DEADLOCK THEO
 * THIẾT KẾ trong đúng tình huống này, và ta đã đo được nó chứ không suy đoán:
 *
 *   node-4 restart xong, track subnet mới, rồi kẹt 90s. Health trả:
 *     "not connected to enough stake: connected to 20%; required at least 80%"
 *     "bootstrapped": error "subnets not bootstrapped"
 *
 * Lý do: node đầu tiên track subnet mới là node DUY NHẤT trên subnet đó. Nó
 * không thể đạt 80% stake cho tới khi các node còn lại cũng restart và track —
 * mà chúng chỉ restart SAU khi node này khoẻ. Vòng chờ khép kín.
 *
 * Và không lọc bằng `tag` được: `bootstrapped` đăng ký với `health.ApplicationTag`
 * (chains/manager.go:1481) = check TOÀN CỤC, luôn có mặt trong kết quả kể cả khi
 * đã lọc theo subnetID. Xem `api/health/service.md`.
 *
 * ═══ ĐIỀU KIỆN ĐÚNG ═══
 * Thứ ta thật sự cần trước khi hạ node kế tiếp: node này KHÔNG còn là gánh nặng
 * cho mạng chính. Tức là P, X, C đều trả lời và không có `error`. Subnet mới chưa
 * bootstrap là chuyện BÌNH THƯỜNG giữa đợt rollout — nó sẽ xong khi node cuối
 * cùng track xong.
 *
 * Hỏi TỪ BÊN TRONG container: chỉ node-1 mở API ra host. Image có sẵn curl.
 * KHÔNG dùng `docker ps` thay thế — nó báo UP trong khi node còn đang bootstrap.
 */
async function nodeSanSang(svc) {
  let out;
  try {
    out = await docker([...COMPOSE, "exec", "-T", svc, "curl", "-sf", "-m", "5",
      "-X", "POST", "-H", "content-type:application/json",
      "--data", `{"jsonrpc":"2.0","id":1,"method":"health.health","params":{"tags":["${PRIMARY_SUBNET}"]}}`,
      "http://127.0.0.1:9650/ext/health"]);
  } catch {
    return { ok: false, vi: "API chưa trả lời" };   // node còn đang khởi động
  }
  let checks;
  try {
    checks = JSON.parse(out.slice(out.indexOf("{"), out.lastIndexOf("}") + 1))?.result?.checks;
  } catch {
    return { ok: false, vi: "không parse được health" };
  }
  if (!checks) return { ok: false, vi: "health thiếu checks" };

  // Đọc TỪNG check của mạng chính thay vì tin cờ tổng — cờ tổng gộp cả subnet mới.
  for (const ten of ["P", "X", "C"]) {
    const c = checks[ten];
    if (!c) return { ok: false, vi: `chưa có check ${ten}` };
    if (c.error) return { ok: false, vi: `${ten}: ${c.error}` };
  }
  return { ok: true, vi: "P/X/C sạch lỗi" };
}

/**
 * Cho MỌI node track thêm subnet mới — LẦN LƯỢT từng node, không đồng loạt.
 *
 * ═══ VÌ SAO ═══
 * Bản trước gọi thẳng `docker compose up -d` (không nêu tên service). Biến
 * A1_TRACK_SUBNETS đổi ⇒ compose recreate MỌI container dùng biến đó = cả 5
 * validator cùng lúc. Không còn node nào giữ mạng, consensus dừng, và RPC công
 * khai (Caddy → node-1) chết theo.
 *
 * ĐO THẬT trên testnet công khai 2026-08-24, đẻ 1 chain:
 *     C-Chain RPC chết 6.0 giây · 12/25 lượt gọi hỏng (48%)
 *     ngay sau đó cả 5 container đều "Up 25 seconds" — CÙNG một con số
 *
 * MetaMask poll RPC mỗi ~4s nên cửa sổ 6s trúng ít nhất một nhịp poll của MỌI ví
 * đang mở, và MetaMask GIỮ banner "Unable to connect" tới khi người dùng tự đổi
 * mạng qua lại. Tức là một người lạ bấm nút để lại banner lỗi dính trên ví của
 * tất cả người khác — chi phí O(số lượt bấm nút) giáng lên người không liên quan.
 *
 * ═══ NODE PHỤC VỤ RPC CÔNG KHAI ĐI CUỐI CÙNG ═══
 * Chỉ node-1 mở API ra host, nên Caddy → node-1 → nó CHÍNH LÀ RPC công khai.
 * Restart nó sau cùng nghĩa là: (1) 4 node kia đã track subnet mới và đang khoẻ,
 * (2) node-1 quay lại một mạng đang sống để đồng bộ, thay vì cả 5 cùng lạnh máy.
 *
 * ═══ HỎNG THÌ DỪNG, KHÔNG ĐI TIẾP ═══
 * Một node không khoẻ lại trong hạn ⇒ NÉM LỖI, không đụng node kế. Hạ thêm node
 * nữa chỉ làm mạng mỏng đi trong khi vấn đề chưa rõ. Thà dừng với vài node chưa
 * track (báo lỗi rõ) còn hơn hạ cả mạng một cách âm thầm.
 */
/**
 * Ghim danh sách subnet vào `.env` cạnh file compose.
 *
 * Console truyền A1_TRACK_SUBNETS qua env lúc chạy, nên bản thân nó không cần
 * file này. Nhưng BẤT KỲ ai sau đó gõ `docker compose up -d` bằng tay — để sửa
 * một node, để nâng image — sẽ lấy giá trị rỗng và node đó **âm thầm thôi track
 * mọi L1**. Chain vẫn "sống" theo mọi dấu hiệu bề ngoài, chỉ là mỏng đi một
 * validator mà không ai biết. Dự án này đã dính đúng lớp lỗi đó một lần với
 * `--http-allowed-hosts` (console `up` làm nó tụt về `*` trên node công khai).
 *
 * Ghi qua file tạm rồi rename: `.env` hỏng giữa chừng là MỌI lệnh compose chết,
 * kể cả lệnh để sửa lỗi.
 */
function ghimTrackVaoEnv(trackList) {
  const envPath = path.join(path.dirname(path.resolve(COMPOSE_FILE)), ".env");
  try {
    const cu = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
    const giu = cu.split(/\r?\n/).filter(d => !/^\s*A1_TRACK_SUBNETS\s*=/.test(d));
    while (giu.length && giu.at(-1).trim() === "") giu.pop();
    giu.push(`A1_TRACK_SUBNETS=${trackList}`, "");
    const tmp = envPath + ".tmp";
    writeFileSync(tmp, giu.join("\n"));
    renameSync(tmp, envPath);
  } catch (e) {
    // Không ghim được thì vẫn đi tiếp: console truyền env lúc chạy nên lượt tạo
    // này vẫn đúng. Chỉ là lưới đỡ cho lần chạy tay sau bị thủng — phải kêu lên.
    console.warn(`  ⚠️  không ghim được A1_TRACK_SUBNETS vào ${envPath}: ${e.message}`);
  }
}

async function trackSubnetsLanLuot(trackList) {
  // `docker()` gộp stdout VỚI stderr, mà compose hay in cảnh báo kiểu
  //   WARN[0000] The "A1_TRACK_SUBNETS" variable is not set. Defaulting to ...
  // Nhận nguyên si từng dòng làm tên service thì lệnh kế sẽ thành
  // `compose up -d --no-deps WARN[0000]` — hỏng theo kiểu rất khó đoán.
  // Nên lọc theo hình dạng tên service, rồi ĐỐI CHIẾU với node đã biết.
  // Chốt chặn cuối, ngay TRƯỚC lúc đưa danh sách vào node. Kiểm ở đây chứ không
  // chỉ ở createChain vì đây là chỗ con số thật sự đi vào giao thức — mọi đường
  // gọi khác (CLI, lượt sửa tay) đều phải qua cửa này.
  const soSubnet = trackList.split(",").filter(Boolean).length;
  if (soSubnet > TRAN_SUBNET_GIAO_THUC) {
    throw new Error(
      `TỪ CHỐI: ${soSubnet} subnet vượt trần giao thức ${TRAN_SUBNET_GIAO_THUC}. ` +
      `Node khai quá ${TRAN_SUBNET_GIAO_THUC} subnet lúc bắt tay sẽ bị MỌI peer cắt kết nối ` +
      `(network/peer/peer.go:882) — mạng vỡ, không phải chậm đi.`
    );
  }

  const raw = await docker([...COMPOSE, "config", "--services"]);
  const services = raw.split("\n").map(s => s.trim())
    .filter(s => /^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(s));
  if (!services.length) throw new Error("không đọc được danh sách service từ compose");
  if (!services.includes(NODE_CONTAINER)) {
    // Không có node phục vụ RPC công khai trong danh sách = ta đang hiểu sai
    // compose. Dừng lại thay vì restart mò một loạt container lạ.
    throw new Error(
      `danh sách service (${services.join(", ")}) không chứa A1_NODE_CONTAINER=${NODE_CONTAINER} — ` +
      `kiểm tra A1_COMPOSE_FILE có trỏ đúng compose không`
    );
  }

  // Node phục vụ RPC công khai xuống CUỐI hàng; phần còn lại sắp xếp theo tên để
  // thứ tự lặp lại được giữa các lần chạy. `compose config --services` KHÔNG giữ
  // thứ tự trong file (lần đo đầu nó trả node-4 lên trước), mà thứ tự ngẫu nhiên
  // làm sự cố không tái hiện được.
  const thuTu = [
    ...services.filter(s => s !== NODE_CONTAINER).sort(),
    NODE_CONTAINER,
  ];
  const nhatKy = [];

  // Ghim TRƯỚC khi restart: nếu console chết giữa chừng, người vào dọn bằng tay
  // vẫn có danh sách đúng để dựng lại.
  ghimTrackVaoEnv(trackList);

  for (const svc of thuTu) {
    const t0 = Date.now();
    // `--no-deps`: chỉ đụng đúng service này, không kéo theo service khác.
    await docker([...COMPOSE, "up", "-d", "--no-deps", svc], { A1_TRACK_SUBNETS: trackList });

    let sanSang = null;
    for (let i = 0; i < 45; i++) {           // 45 × 2s = 90s cho mỗi node
      sanSang = await nodeSanSang(svc);
      if (sanSang.ok) break;
      await new Promise(r => setTimeout(r, 2000));
    }
    const ms = Date.now() - t0;
    if (!sanSang?.ok) {
      throw new Error(
        `${svc} chưa phục vụ lại được mạng chính sau 90s (${sanSang?.vi}) — ĐÃ DỪNG, ` +
        `các node còn lại chưa bị đụng tới. ` +
        `Đã xong: ${nhatKy.map(n => n.svc).join(", ") || "(chưa node nào)"}. ` +
        `Kiểm tra: docker logs ${svc} --tail 50`
      );
    }
    nhatKy.push({ svc, ms });
    console.log(`  ✓ ${svc} track xong, mạng chính phục vụ lại sau ${(ms / 1000).toFixed(1)}s`);
  }
  return nhatKy;
}

async function docker(args, env = {}) {
  try {
    const { stdout, stderr } = await run("docker", args, { cwd: ROOT, env: { ...process.env, ...env }, maxBuffer: 1 << 24 });
    return (stdout || "") + (stderr || "");
  } catch (e) {
    // execFile nhét NGUYÊN dòng lệnh vào message — mà dòng lệnh có `-e
    // A1_CLI_KEY=...`. Không lọc thì một lỗi tầm thường sẽ ném khoá quỹ ra
    // log console và ra cả phản hồi HTTP cho người bấm nút.
    const err = new Error(scrub(e.message));
    err.stdout = scrub(e.stdout);
    err.stderr = scrub(e.stderr);
    throw err;
  }
}

// Tạo 1 L1: trả {name, subnetID, blockchainID, chainId, admin, rpc}
//
// `admin` = địa chỉ EVM sở hữu chain vừa đẻ: nhận toàn bộ phân bổ genesis VÀ là
// adminAddresses của feeManagerConfig. Không truyền thì rơi về A1_L1_ADMIN.
// Đây là thứ quyết định "người bấm nút có sở hữu chain của họ không" — nên nó
// được kiểm tra kỹ (EIP-55) trước khi ghi vào genesis: genesis đã đẻ là bất biến,
// gõ sai một ký tự là chain vĩnh viễn vô chủ.
async function createChain({ name, chainId, admin }) {
  name = String(name || "").trim();
  if (!/^[A-Za-z0-9 ]{2,32}$/.test(name)) throw new Error("Tên chỉ gồm chữ/số/space (2–32 ký tự)");

  // Trường vắng mặt / rỗng = "dùng mặc định". Nhưng nếu người dùng ĐÃ nhập gì đó
  // thì không bao giờ âm thầm rơi về mặc định — im lặng ở đây nghĩa là trao chain
  // của họ cho quỹ Foundation mà không ai biết.
  const adminGiven = admin !== undefined && admin !== null && String(admin).trim() !== "";
  const ADMIN = adminGiven ? parseEvmAddress(admin, "Địa chỉ admin") : L1_ADMIN;

  const state = loadState();
  // Chain ĐÃ THU HỒI vẫn giữ chỗ tên và chainId của nó.
  //
  // Thu hồi chỉ gỡ chain khỏi danh bạ và khỏi danh sách track — nó KHÔNG xoá được
  // gì trên P-Chain (subnet/blockchain đã đẻ là vĩnh viễn), và cũng không xoá được
  // mạng mà người dùng đã thêm vào MetaMask. Cấp lại chainId 9102 cho một chain
  // KHÁC nghĩa là ví của người từng dùng chain cũ nay trỏ vào một chain lạ dưới
  // cùng một chainId: MetaMask coi hai chain là MỘT mạng, và chữ ký ký cho chain
  // cũ phát lại được trên chain mới. Chỗ trống thu hồi trả lại là **slot track**
  // (trần 16 của giao thức), không phải con số nhận dạng.
  const daDung = [...state.chains, ...state.retired];
  const trung = daDung.find(c => c.name === name);
  if (trung) {
    throw new Error(state.chains.includes(trung)
      ? "Tên đã tồn tại"
      : `Tên "${name}" từng thuộc một L1 đã thu hồi — chọn tên khác để lịch sử không bị nhập nhằng`);
  }

  // Chặn SỚM, trước khi tiêu tiền và trước khi đụng vào node. Xem TRAN_SUBNET_GIAO_THUC.
  if (state.chains.length >= MAX_L1) {
    throw new Error(
      `Đã đạt trần ${MAX_L1} L1. Mô hình hiện tại cho MỌI validator track MỌI L1, ` +
      `mà giao thức P2P cắt kết nối node khai quá ${TRAN_SUBNET_GIAO_THUC} subnet. ` +
      `Vượt trần phải đổi kiến trúc (tập validator riêng cho từng L1 / ACP-77), không phải nới số.`
    );
  }

  // chainId: chặn số không hợp lệ thay vì để nó lặng lẽ thành genesis hỏng.
  //
  // Tự cấp thì phải lấy số CÒN TRỐNG, không phải `9100 + số chain`: chỉ cần một
  // lượt trước đó tự chọn chainId là công thức đếm đó đâm trúng số đã dùng. Hai
  // L1 trùng chainId là hố sụt — MetaMask coi chúng là một mạng, và chữ ký của
  // chain này phát lại được trên chain kia.
  const taken = new Set(daDung.map(c => c.chainId));
  if (chainId !== undefined && chainId !== null && String(chainId).trim() !== "") {
    const n = Number(chainId);
    if (!Number.isSafeInteger(n) || n <= 0) throw new Error("Chain ID EVM phải là số nguyên dương");
    if (taken.has(n)) {
      const cu = daDung.find(c => c.chainId === n);
      throw new Error(state.chains.includes(cu)
        ? `Chain ID ${n} đã dùng cho chain khác (${cu.name})`
        : `Chain ID ${n} thuộc về "${cu.name}" — L1 đã thu hồi. Số nhận dạng KHÔNG được cấp lại: ` +
          `ví của người từng dùng chain cũ sẽ coi chain mới là cùng một mạng.`);
    }
    chainId = n;
  } else {
    chainId = 9100;
    while (taken.has(chainId)) chainId++;
  }

  // 1) genesis EVM cho L1 này
  const tpl = JSON.parse(readFileSync(L1_TEMPLATE, "utf8"));
  tpl.config.chainId = chainId;
  tpl.config.feeManagerConfig = { adminAddresses: [ADMIN], blockTimestamp: 0 };
  // Khoá của `alloc` là hex TRẦN (không `0x`); dùng chữ thường cho đúng quy ước.
  tpl.alloc = { [ADMIN.slice(2).toLowerCase()]: { balance: "0x295BE96E64066972000000" } };
  const fname = `${name.replace(/ /g, "_")}.json`;
  writeFileSync(path.join(TMP_DIR, fname), JSON.stringify(tpl, null, 2));
  const inContainer = `/9chain-a1/config/console-tmp/${fname}`;

  // 2) đẻ subnet + chain qua 9chain-a1-cli (in SUBNET_ID=/BLOCKCHAIN_ID= ra stdout)
  const out = await docker([...COMPOSE, "exec", "-T",
    "-e", `A1_CLI_KEY=${CLI_KEY}`, NODE_CONTAINER,
    "/9chain-a1/build/9chain-a1-cli", "l1", "create",
    "--uri", API, "--genesis", inContainer, "--name", name]);
  const subnetID = (out.match(/SUBNET_ID=([A-Za-z0-9]+)/) || [])[1];
  const blockchainID = (out.match(/BLOCKCHAIN_ID=([A-Za-z0-9]+)/) || [])[1];
  if (!subnetID || !blockchainID) throw new Error("Không parse được ID:\n" + out);

  // 3) cho node track TẤT CẢ subnet đã tạo — lần lượt, xem trackSubnetsLanLuot
  const allSubnets = [...state.chains.map(c => c.subnetID), subnetID];
  const nhatKyRestart = await trackSubnetsLanLuot(allSubnets.join(","));

  // 4) chờ RPC L1 — và BÁO LỖI nếu không lên.
  //
  // Bản trước lặp 30 lần rồi đi tiếp bất kể kết quả, nên khi node không track
  // được subnet thì console vẫn trả về một chain trông hợp lệ (có đủ ID, có URL
  // RPC) mà thực ra chết. Người dùng thêm vào MetaMask rồi mới phát hiện.
  const rpcPath = `/ext/bc/${blockchainID}/rpc`;
  let live = false;
  for (let i = 0; i < 30; i++) {
    try { await rpc(rpcPath, "eth_chainId"); live = true; break; } catch { await new Promise(r => setTimeout(r, 5000)); }
  }
  if (!live) {
    throw new Error(
      `L1 ${blockchainID} không lên RPC sau 150s. Thường là node chưa track subnet — ` +
      `kiểm tra compose có đọc AVAGO_TRACK_SUBNETS=\${A1_TRACK_SUBNETS} ở MỌI node chưa.`
    );
  }
  // URL trả cho người dùng phải là URL họ gọi được, không phải URL của server.
  //
  // `API` là địa chỉ console dùng để điều phối (`http://localhost:9650`). Đưa
  // nguyên nó ra giao diện là lặp lại đúng lỗi đã trả giá ở explorer và dashboard:
  // trình duyệt người xem phân giải `localhost` thành MÁY HỌ, nên URL dán vào
  // MetaMask trỏ về chính máy người dùng và không bao giờ chạy.
  // Đặt A1_PUBLIC_RPC_BASE=https://rpc-testnet-a1.9chain.org trên server.
  const rpcBase = process.env.A1_PUBLIC_RPC_BASE || API;
  const chain = {
    name, subnetID, blockchainID, chainId, admin: ADMIN,
    rpc: `${rpcBase}${rpcPath}`, createdAt: Date.now(),
  };
  state.chains.push(chain); saveState(state);
  // Nhật ký restart trả cho người gọi làm bằng chứng, nhưng KHÔNG ghi vào state:
  // `console-chains.json` là hợp đồng dữ liệu với trang /chains/ công khai, chỉ
  // nên chứa thông tin về chain — không phải chi tiết vận hành của server.
  return { ...chain, restart: nhatKyRestart };
}

/**
 * Thu hồi một L1 — trả lại SLOT TRACK, không xoá chain.
 *
 * ═══ THU HỒI THẬT SỰ LÀM GÌ ═══
 * Gỡ subnet của chain khỏi `--track-subnets` của MỌI node, rồi gỡ chain khỏi danh
 * bạ công khai. Sau đó không node nào phục vụ RPC của nó nữa và chain đứng im.
 *
 * ═══ NÓ KHÔNG LÀM GÌ (đọc kỹ, đây là chỗ dễ hiểu nhầm nhất) ═══
 * • KHÔNG xoá subnet/blockchain trên P-Chain — đã đẻ là vĩnh viễn, không có
 *   giao dịch nào xoá được. Dữ liệu chain cũng còn nguyên trên đĩa node.
 * • KHÔNG rút 5 node khỏi tập validator của subnet đó. Chúng vẫn là validator đã
 *   đăng ký cho tới hết hạn, chỉ là không còn chạy subnet nữa.
 *   ⚠️ Hệ quả: `platform.getCurrentValidators({subnetID})` vẫn trả 5 validator cho
 *   chain đã thu hồi. Tức là phép đo "sống = có validator" mà trang /chains/ dùng
 *   sẽ NÓI DỐI với chain đã thu hồi. Vì vậy chain thu hồi phải được vẽ từ mảng
 *   `retired` với nhãn riêng, KHÔNG được đem đi đo bằng heuristic của chain sống.
 * • KHÔNG lấy lại được token của ai. Người dùng đã thêm mạng vào MetaMask thì
 *   mạng đó vẫn nằm trong ví họ, chỉ là gọi RPC không ai trả lời.
 *
 * ═══ VÌ SAO CẦN ═══
 * Trần 16 subnet của giao thức (xem TRAN_SUBNET_GIAO_THUC) là bánh cóc một chiều
 * nếu không có đường lùi: mỗi lượt đẻ chain — kể cả chain rác của bài kiểm thử —
 * ăn vĩnh viễn một trong 15 chỗ. Không có endpoint này thì bộ nghiệm thu đầy đủ
 * (`smoke-l1.mjs --de-chain`) chỉ chạy được tối đa ~10 lần trong cả đời dự án.
 *
 * ═══ THỨ TỰ GHI STATE ═══
 * Đánh dấu `thuHoi` vào state TRƯỚC khi đụng node, gỡ hẳn SAU khi node đã bỏ track.
 * Chết giữa chừng thì state vẫn liệt chain là đang sống ⇒ lượt đẻ chain kế tiếp
 * tính nó vào danh sách track và **track lại** — lùi về trạng thái nhất quán, chứ
 * không để lại một chain nửa sống nửa chết. Dấu `thuHoi.batDau` còn lại là bằng
 * chứng cho người vào dọn biết chuyện gì đã xảy ra.
 */
async function thuHoiChain({ name, xacNhan }) {
  name = String(name || "").trim();
  if (!name) throw new Error("Thiếu tên chain cần thu hồi");

  const state = loadState();
  const idx = state.chains.findIndex(c => c.name === name);
  if (idx < 0) {
    throw new Error(state.retired.some(c => c.name === name)
      ? `"${name}" đã được thu hồi trước đó — không còn gì để làm.`
      : `Không có L1 nào tên "${name}" trong danh bạ.`);
  }

  // Bắt gõ lại đúng tên chain. Thu hồi làm một chain biến mất khỏi danh bạ công
  // khai và ngừng phục vụ RPC NGAY, mà nó chỉ khác lượt đọc bình thường đúng một
  // chữ trong URL. Một cú bấm nhầm / một dòng curl copy sai không được phép đủ
  // để giết chain của người khác.
  if (String(xacNhan ?? "") !== name) {
    throw new Error(
      `Thu hồi "${name}" sẽ gỡ nó khỏi danh bạ công khai và ngừng phục vụ RPC ngay lập tức. ` +
      `Gửi kèm "xacNhan":"${name}" để xác nhận.`
    );
  }

  const chain = state.chains[idx];

  state.chains[idx] = { ...chain, thuHoi: { batDau: Date.now() } };
  saveState(state);

  // Danh sách track mới = mọi chain còn lại. Rỗng cũng hợp lệ (thu hồi chain cuối
  // cùng) — khi đó node chỉ chạy Primary Network, đúng như mạng lúc mới dựng.
  const conLai = state.chains.filter((_, i) => i !== idx).map(c => c.subnetID);
  const nhatKyRestart = await trackSubnetsLanLuot(conLai.join(","));

  // ═══ KIỂM CHỨNG, KHÔNG TIN ═══
  // "Đã restart" không chứng minh "đã bỏ track". Bằng chứng duy nhất đáng tin là
  // RPC của chain THÔI trả lời: node còn track thì nó còn định tuyến /ext/bc/<id>/rpc.
  // Không kiểm chỗ này thì một lượt thu hồi hỏng vẫn báo thành công, chain biến
  // mất khỏi danh bạ nhưng slot track thì không được trả lại — đúng kiểu hỏng mà
  // dự án này đã trả giá vài lần: mọi dấu hiệu bề ngoài đều xanh.
  const rpcPath = `/ext/bc/${chain.blockchainID}/rpc`;
  let conPhucVu = true;
  for (let i = 0; i < 10 && conPhucVu; i++) {
    try {
      await rpc(rpcPath, "eth_chainId");
      await new Promise(r => setTimeout(r, 2000));
    } catch {
      conPhucVu = false;
    }
  }
  if (conPhucVu) {
    throw new Error(
      `Đã restart hết node nhưng ${chain.blockchainID} VẪN phục vụ RPC sau 20s — node chưa bỏ track. ` +
      `Slot track chưa được trả lại. State đang giữ dấu "thuHoi" cho "${name}"; ` +
      `kiểm tra A1_TRACK_SUBNETS trong .env cạnh ${COMPOSE_FILE} rồi chạy lại.`
    );
  }

  // Chuyển sang `retired`, bỏ dấu tiến trình. Giữ nguyên mọi khoá cũ (name,
  // subnetID, blockchainID, chainId, admin, rpc, createdAt) — đây là bản ghi lịch
  // sử, và là thứ giữ chỗ chainId cho `createChain`.
  const { thuHoi: _bo, ...goc } = state.chains[idx];
  state.chains.splice(idx, 1);
  state.retired.push({ ...goc, thuHoiLuc: Date.now() });
  saveState(state);

  console.log(`  ✓ thu hồi "${name}" — còn ${state.chains.length}/${MAX_L1} L1 đang track`);
  return {
    name, subnetID: chain.subnetID, blockchainID: chain.blockchainID, chainId: chain.chainId,
    thuHoi: true, dangTrack: state.chains.length, tran: MAX_L1,
    restart: nhatKyRestart,
  };
}

const PAGE = readFileSync(path.join(ROOT, "local-net/console/index.html"), "utf8");
function send(res, code, obj) {
  // Socket có thể đã bị huỷ (vd body vượt hạn -> req.destroy()). Ghi tiếp lên đó
  // ném lỗi ở tầng ngoài và biến một request rác thành một stack trace lạ.
  if (res.writableEnded || res.destroyed) return;
  res.writeHead(code, { "content-type": "application/json" });
  res.end(JSON.stringify(obj));
}

/** Đọc body JSON, chặn body khổng lồ trước cả khi parse (cạn RAM). */
function docBody(req, gioiHan = 256 * 1024) {
  return new Promise((resolve, reject) => {
    let body = "", qua = false;
    req.on("data", c => {
      body += c;
      if (body.length > gioiHan && !qua) {
        qua = true;
        req.destroy();
        reject(new Error(`body vượt ${gioiHan} byte`));
      }
    });
    req.on("end", () => { if (!qua) resolve(body); });
    req.on("error", e => { if (!qua) reject(e); });
  });
}

/** Chặn nếu vượt hạn mức; trả true nghĩa là ĐÃ trả lời lỗi, caller dừng lại. */
function blockedByRate(req, res, limiter) {
  const r = limiter(clientIp(req, TRUST_PROXY));
  if (r.ok) return false;
  res.writeHead(429, { "content-type": "application/json", "retry-after": String(r.retryAfter) });
  res.end(JSON.stringify({ error: `vượt hạn mức (${r.name}), thử lại sau ${r.retryAfter}s` }));
  return true;
}

/** Chặn nếu thiếu/sai token. Trả true nghĩa là ĐÃ trả lời lỗi. */
function blockedByAuth(req, res) {
  if (checkToken(req)) return false;
  // 401 kèm WWW-Authenticate để client biết cách gửi lại.
  res.writeHead(401, { "content-type": "application/json", "www-authenticate": "Bearer" });
  res.end(JSON.stringify({ error: "thiếu hoặc sai token — gửi header 'Authorization: Bearer <A1_CONSOLE_TOKEN>'" }));
  return true;
}

const server = http.createServer(async (req, res) => {
  try {
    // Trang UI để mở — nó không làm gì nếu không có token; mọi hành động đều
    // đi qua /api/* và đều bị chặn.
    if (req.method === "GET" && req.url === "/") {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); return res.end(PAGE);
    }

    // Công cụ chẩn đoán: xác nhận console nhìn thấy ĐÚNG IP người dùng.
    // Nếu ở đây luôn ra IP của Caddy thì rate-limit vô dụng (gom chung 1 khoá).
    if (req.method === "GET" && req.url === "/whoami") {
      return send(res, 200, { ip: clientIp(req, TRUST_PROXY), trustProxy: TRUST_PROXY });
    }

    if (req.method === "GET" && req.url === "/api/status") {
      if (blockedByRate(req, res, limitRead)) return;
      if (blockedByAuth(req, res)) return;
      const [ver, cid] = await Promise.all([
        rpc("/ext/info", "info.getNodeVersion").then(v => v.version).catch(() => "?"),
        rpc("/ext/bc/C/rpc", "eth_chainId").then(x => parseInt(x, 16)).catch(() => null),
      ]);
      // defaultAdmin để giao diện nói rõ chain sẽ về tay ai nếu bỏ trống ô admin.
      const st = loadState();
      return send(res, 200, {
        node: ver, cChainId: cid, defaultAdmin: L1_ADMIN,
        chains: st.chains, retired: st.retired,
        // Người vận hành cần thấy còn bao nhiêu chỗ TRƯỚC khi bấm nút, không phải
        // sau khi bị từ chối: trần này là trần giao thức, không nới được.
        tran: MAX_L1, tranGiaoThuc: TRAN_SUBNET_GIAO_THUC,
      });
    }

    if (req.method === "GET" && req.url === "/api/chains") {
      if (blockedByRate(req, res, limitRead)) return;
      if (blockedByAuth(req, res)) return;
      return send(res, 200, loadState());
    }

    // Đẻ chain và thu hồi chain đi chung một cửa: cả hai đều restart lần lượt cả
    // 5 node, nên cả hai PHẢI đi qua cùng một hàng đợi tuần tự. Chạy chồng nhau
    // là hai đợt rollout đá nhau giữa chừng và hỏng cả hai.
    if (req.method === "POST" && (req.url === "/api/create" || req.url === "/api/revoke")) {
      const laThuHoi = req.url === "/api/revoke";
      if (blockedByRate(req, res, laThuHoi ? limitRevoke : limitCreate)) return;
      if (blockedByAuth(req, res)) return;
      try {
        const tham = JSON.parse((await docBody(req)) || "{}");
        const kq = await queue.run(() => laThuHoi ? thuHoiChain(tham) : createChain(tham));
        return send(res, 200, kq);
      } catch (e) {
        return send(res, 400, { error: String(e.message || e) });
      }
    }
    send(res, 404, { error: "not found" });
  } catch (e) { send(res, 500, { error: String(e.message || e) }); }
});

server.listen(PORT, HOST, () => {
  console.log(`9Chain-A1 Console @ http://${HOST}:${PORT}  (điều phối node ${API})`);
  console.log(`  auth   : BẬT (Authorization: Bearer <A1_CONSOLE_TOKEN>)`);
  console.log(`  hạn mức: tạo chain 3 lượt/giờ/IP · thu hồi 3 lượt/giờ/IP · đọc 120 lượt/phút/IP`);
  console.log(`  trần L1: ${MAX_L1} (trần cứng giao thức ${TRAN_SUBNET_GIAO_THUC}) · thu hồi trả lại slot`);
  console.log(`  hàng đợi: tuần tự, tối đa 5 lượt chờ`);
  console.log(`  admin  : mỗi lượt tạo tự mang địa chỉ riêng (trường "admin"); bỏ trống -> ${L1_ADMIN}`);
  if (L1_ADMIN === EWOQ) {
    console.warn(`  ⚠️  A1_L1_ADMIN chưa đặt -> mặc định là ewoq, khoá CÔNG KHAI ai cũng có.`);
  }
  if (HOST !== "127.0.0.1") {
    console.warn(`  ⚠️  đang nghe trên ${HOST} (không phải loopback) — chắc chắn có reverse proxy phía trước chưa?`);
  }
  if (!TRUST_PROXY) {
    console.log(`  lưu ý : A1_TRUST_PROXY chưa bật -> rate-limit khoá theo IP TCP trực tiếp.`);
    console.log(`          Đứng sau Caddy/Cloudflare thì PHẢI đặt A1_TRUST_PROXY=1, nếu không mọi`);
    console.log(`          người dùng bị gom chung một khoá và chặn lẫn nhau.`);
  }
});
