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
import { clientIp, rateLimit, requireToken, requireSecret, requireInt, serialQueue } from "../lib/guard.mjs";
import { parseEvmAddress } from "../lib/eip55.mjs";
import { parseAllowlist, mayCreateL1 } from "../lib/l1-allowlist.mjs";
import { apDungPreset, danhSachPreset } from "../lib/presets.mjs";
import { validateSymbol, symbolFromName } from "../lib/l1-symbol.mjs";
import { libraryAlloc, CONTRACTS as GENESIS_CONTRACTS } from "../lib/l1-contracts.mjs";
import {
  parseAllocations, applyFees, applyPrecompiles, verifyFeeConfig, assertPresetCompatible,
  effectiveOptions, describeChain, parseContractLibrary, LIMITS, SELECTABLE_PRECOMPILES, REWARD_MODES,
} from "../lib/l1-options.mjs";
import {
  planUpgrade, activePrecompiles, upgradeShape, restartProven, encodeReadAllowList, decodeRole, ownerTransferVerdict,
  PRECOMPILE_ADDRESS, UPGRADABLE_PRECOMPILES, MIN_LEAD_SECONDS, MAX_LEAD_SECONDS,
} from "../lib/l1-upgrade.mjs";
import { capChainIdTuDong, loiChainIdDaCap, loiTenDaCap, GOC_DAI_CHAINID, A1_GEN, NETWORK_ID, TEN_MANG } from "../lib/chainid.mjs";
import { siwe } from "./siwe.mjs";

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
// HAI TẦNG, và ranh giới giữa chúng là chỗ XÁC THỰC — không phải một con số duy nhất.
//
// Bài nghiệm thu end-to-end phơi ra vấn đề: đặt hạn mức nghiêm ngặt TRƯỚC lúc xác
// thực nghĩa là một request **không có token** cũng tiêu quota của IP đó. Ai gửi 3
// request rác là khoá được người dùng thật ở cùng IP suốt một giờ — hạn mức trở
// thành vũ khí thay vì lớp bảo vệ. (Hôm nay console chỉ nghe loopback nên chưa
// khai thác được; M4.5 định mở ra Internet thì nó thành lỗ hổng thật.)
//
//   cửa ngoài  (trước xác thực): rộng tay, chỉ để chặn lụt request
//   cửa trong  (sau xác thực)  : ngân sách thật cho thao tác nặng
const limitFlood = rateLimit({ max: 60, windowMs: 60 * 60 * 1000, name: "flood" });
const limitCreate = rateLimit({ max: requireInt("A1_LIMIT_CREATE", 3), windowMs: 60 * 60 * 1000, name: "create" });
const limitRead = rateLimit({ max: 120, windowMs: 60 * 1000, name: "read" });
// Thu hồi cũng restart cả cụm node như lúc đẻ — nặng ngang nhau, nên hạn mức ngang nhau.
// Hạn mức RIÊNG (không dùng chung khoá với create): gộp chung thì một người đẻ 3 chain
// là hết quyền dọn chính mấy chain đó, tức là hạn mức tự khoá đường sửa sai.
const limitRevoke = rateLimit({ max: requireInt("A1_LIMIT_REVOKE", 3), windowMs: 60 * 60 * 1000, name: "revoke" });
// A post-genesis upgrade is a nine-node rolling restart like create/revoke, and it is the owner
// changing the rules of a chain other people use — the same budget, its own bucket (P-61).
// Transferring ownership touches only the ledger, but it is rare and irreversible for the sender.
const limitUpgrade = rateLimit({ max: requireInt("A1_LIMIT_UPGRADE", 3), windowMs: 60 * 60 * 1000, name: "upgrade" });
const limitTransfer = rateLimit({ max: 3, windowMs: 60 * 60 * 1000, name: "transfer" });
// Xin lời mời ký là thao tác RẺ nhưng chiếm chỗ trong kho nonce — hạn mức rộng tay
// hơn create/revoke nhiều, nhưng không để mở toang.
const limitNonce = rateLimit({ max: 30, windowMs: 10 * 60 * 1000, name: "nonce" });

// ═══ ĐĂNG NHẬP BẰNG VÍ (M4.1) ═══
// Đứng SONG SONG với A1_CONSOLE_TOKEN, không thay thế: token tĩnh là đường của
// người vận hành (và của smoke test), chữ ký ví là đường của người dùng thật.
// Khác biệt quan trọng nhất không phải "an toàn hơn" mà là **biết ai đang bấm nút**:
// đăng nhập bằng ví thì `admin` được ÉP bằng địa chỉ đã ký, người dùng không gõ gì
// cả — gỡ hẳn lớp lỗi "gõ nhầm một ký tự ⇒ chain vô chủ vĩnh viễn".
const SIWE_DOMAIN = process.env.A1_CONSOLE_DOMAIN || "a1.9chain.org";
const SIWE_URI = process.env.A1_CONSOLE_URI || `https://${SIWE_DOMAIN}/console`;
const dangNhapVi = siwe({
  domain: SIWE_DOMAIN,
  uri: SIWE_URI,
  chainId: Number(process.env.A1_EVM_CHAIN_ID || 9000000009),
});

// ═══ GỐC DẢI chainId CHO L1 NGƯỜI DÙNG — David chốt `2026-08-27` (D-069, B-14) ═══
//
// Dải cũ bắt đầu ở **9100**, và tra sổ công khai `27/08` phát hiện **9100 = Genesis Coin**:
// số console cấp ĐẦU TIÊN trùng một chuỗi có thật, và điều đó đã xảy ra rồi (chain
// `OwnerTest` nhận 9100 hai lần). Trong dải cũ còn 9108 · 9134 · 9170 bị chiếm nữa.
//
// Gốc mới **9000000010** = chainId của A1 (`9000000009`) **+1**. Ba cái được:
//   1. **Vùng trống rộng** — đo trên ảnh chụp `27/08` (2.723 mục): không một chuỗi nào
//      trong **bán kính 10 triệu** quanh 9000000009. Dải cũ thì 4/100 số đầu đã có chủ.
//   2. **Bản sắc đọc được** — mọi chain thuộc A1 cùng mở đầu `9000000…`.
//   3. 🔴 **Đóng lỗ phát lại của sổ `retired` bằng KIẾN TRÚC, không bằng sổ.** Dải cũ
//      9100–9145 từ nay **không bao giờ được tự cấp lại**, nên ví của người từng dùng L1
//      cũ không thể lặng lẽ trỏ vào L1 của người mới. Điều đó gỡ nửa `chainId` của câu
//      hỏi §5c *"có khôi phục sổ retired cũ không"*.
//      ⚠️ **Chỉ nửa `chainId`, và chỉ đường TỰ CẤP.** Người dùng vẫn tự nhập được 9102 ở
//      nhánh trên; chặn nó vẫn dựa vào `state.retired`. Và trùng **TÊN** thì hoàn toàn
//      không đụng tới. Đừng đọc mục này thành "§5c đã đóng".
//
// ⚠️ **Đánh đổi đã biết, có chủ ý:** `9000000010` và `9000000009` khác nhau đúng một chữ
// số cuối, nên người ĐỌC dễ lẫn (ví thì không — EIP-155 buộc chữ ký vào đúng số). Hư hại
// tối đa là nối nhầm mạng và thấy số dư lạ, không phải mất tiền hay phát lại chữ ký.
//
// Con số + phép cấp nằm ở `../lib/chainid.mjs` — tách ra để bài kiểm đọc được mã thật mà
// không phải dựng cổng 8091 (`server.listen` chạy ở mức module tại đây).

// ═══ chainId ĐÃ BỊ CHIẾM TRONG SỔ CÔNG KHAI (B-14) ═══
//
// Đổi gốc dải KHÔNG thay được cổng này: sổ công khai đổi hàng ngày, nên vùng hôm nay
// trống có thể mai có người. Cổng tra ảnh chụp vẫn phải đứng đó.
// Cùng chainId là cùng một mạng dưới mắt MetaMask, và EIP-155 buộc chữ ký vào chainId.
//
// 🔴 Đây là **ảnh chụp**, không phải tra trực tiếp. Cố ý: một lời gọi HTTP ra Internet nằm
// giữa đường người dùng bấm nút là thêm một chỗ hỏng ngoài tầm kiểm soát — hỏng lúc đó thì
// hoặc chặn oan, hoặc bỏ qua trong im lặng. Cái giá là ảnh chụp **cũ dần**, nên nó mang theo
// ngày tra và console in tuổi của nó ra lúc khởi động.
//
// Sinh lại: `node scripts/check-chainid.mjs --gen-blocklist local-net/console/chainid-taken.json`
const CHAINID_CHIEM_FILE = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "chainid-taken.json");
const chainIdDaChiem = new Map();
let chainIdChiemNgayTra = null;
try {
  const j = JSON.parse(readFileSync(CHAINID_CHIEM_FILE, "utf8"));
  for (const m of j.taken ?? []) chainIdDaChiem.set(m.chainId, m.name);
  chainIdChiemNgayTra = j.lookupDate ?? null;
  const tuổiNgày = chainIdChiemNgayTra
    ? Math.floor((Date.now() - Date.parse(chainIdChiemNgayTra)) / 86_400_000) : null;
  // `ranges` = nhiều dải (D-069). `dai` = một dải, khuôn cũ — giữ đường đọc ngược để một tệp
  // chưa sinh lại không làm console im lặng mất thông tin dải.
  const môTảDải = Array.isArray(j.ranges)
    ? j.ranges.map((d) => d.join("–")).join(" · ")
    : (j.dai ?? []).join("–");
  console.log(`[chainId] danh sách chặn: ${chainIdDaChiem.size} số (dải ${môTảDải}), ` +
    `tra ${chainIdChiemNgayTra}${tuổiNgày !== null ? ` — ${tuổiNgày} ngày trước` : ""}`);
  // 🔴 Danh sách rỗng = cổng đang TẮT, dù tệp đọc được. Bộ sinh nay từ chối ghi tệp rỗng,
  // nhưng một tệp cũ / sửa tay vẫn có thể rỗng — và im lặng ở đây là xanh giả.
  if (chainIdDaChiem.size === 0) {
    console.log(`[chainId] 🔴 danh sách chặn RỖNG ⇒ CỔNG ĐANG TẮT. Sinh lại bằng check-chainid.mjs.`);
  }
  if (tuổiNgày !== null && tuổiNgày > 90) {
    console.log(`[chainId] ⚠️  ảnh chụp đã ${tuổiNgày} ngày. Sổ công khai đổi hàng ngày — sinh lại.`);
  }
} catch (e) {
  // 🔴 KHÔNG im lặng. Thiếu tệp mà console vẫn chạy như thường là đúng kiểu "xanh giả":
  // cổng biến mất, không ai biết, và nó chỉ lộ ra khi có người thật nhận chainId trùng.
  console.log(`[chainId] 🔴 KHÔNG đọc được ${CHAINID_CHIEM_FILE} (${e.message})`);
  console.log(`[chainId] 🔴 CỔNG CHẶN chainId ĐÃ BỊ CHIẾM ĐANG TẮT. Sinh lại bằng:`);
  console.log(`[chainId]    node scripts/check-chainid.mjs --gen-blocklist local-net/console/chainid-taken.json`);
}

// ═══ SỔ THỨ HAI: chainId + TÊN CHÍNH A1 ĐÃ TỪNG CẤP (D-086) ═══
//
// 🔴 Sổ ở trên canh thế giới đã chiếm gì. Sổ này canh **chính A1 đã phát gì ra ngoài** —
// và nó tồn tại vì `console-chains.json` **bị xoá sạch mỗi lượt re-genesis**. Đo `27/08`
// sau lượt g0: sổ đang chạy đúng **27 byte**. Tức `chains ∪ retired` — thứ `createChain`
// dựa vào để chặn trùng — quay về RỖNG, và mọi chainId/tên từng cấp **tự do trở lại**.
//
// Hậu quả không phải "hai chain trùng tên". Cấp lại `9102` cho một chain KHÁC nghĩa là ví
// của người từng dùng chain cũ nay trỏ vào một chain lạ **dưới cùng một chainId**: MetaMask
// coi hai chain là MỘT mạng, và chữ ký ký cho chain cũ **phát lại được**. Thu hồi không gỡ
// được mạng khỏi ví ai — xem `thuHoiChain`.
//
// ⚠️ Đây KHÔNG phải "khôi phục sổ retired cũ" (§5c). Khôi phục sổ là kéo **trạng thái** của
// một mạng đã chết vào mạng mới — `subnetID`/`blockchainID` trong đó không còn tồn tại. Thứ
// giữ lại chỉ là **lời hứa**: con số này, cái tên này, đã phát ra ngoài rồi.
//
// Sinh lại: `node scripts/gen-chainid-issued.mjs --write`
const CHAINID_DACAP_FILE = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "chainid-issued.json");
const chainIdDaCap = new Set();
const tenDaCap = new Map(); // tên thường hoá -> tên gốc (để câu lỗi đọc được)
try {
  const j = JSON.parse(readFileSync(CHAINID_DACAP_FILE, "utf8"));
  for (const n of j.chainIds ?? []) chainIdDaCap.add(Number(n));
  for (const t of j.names ?? []) tenDaCap.set(String(t).toLowerCase(), String(t));
  console.log(`[chainId] sổ A1 đã cấp: ${chainIdDaCap.size} chainId · ${tenDaCap.size} tên ` +
    `(gộp từ ${(j.sources ?? []).length} sổ console trong repo)`);
  // Rỗng ≡ cổng tắt. Cùng luật với sổ trên: một tệp đọc được mà rỗng vẫn là xanh giả.
  //
  // 🔴 BUT EMPTY-BECAUSE-SOMEBODY-DECIDED IS NOT EMPTY-BECAUSE-A-SOURCE-VANISHED, and counting
  // alone cannot tell them apart. The previous version printed one line — *"regenerate with
  // gen-chainid-issued"* — for both, i.e. in the decided case it sent the operator off to re-run
  // a command that changes nothing, in the middle of G-day. `released` says which case this is.
  if (chainIdDaCap.size === 0) {
    const released = j.released?.chainIds ?? 0;
    if (released > 0) {
      console.log(`[chainId] ℹ️  issued-list EMPTY ON PURPOSE — ${released} chainId · ` +
        `${j.released?.names ?? 0} names released across ${j.released?.releases ?? 0} declaration(s) ` +
        `(chainid-released.json). Not a fault, and nothing to regenerate.`);
    } else {
      console.log(`[chainId] 🔴 issued-list EMPTY with NO release declaration => THE GATE IS OFF.`);
      console.log(`[chainId]    Almost certainly a ledger under docs/archive/ went missing. Rebuild: gen-chainid-issued.mjs.`);
    }
  }
} catch (e) {
  console.log(`[chainId] 🔴 KHÔNG đọc được ${CHAINID_DACAP_FILE} (${e.message})`);
  console.log(`[chainId] 🔴 CỔNG CHẶN "A1 đã từng cấp" ĐANG TẮT. Sinh lại bằng:`);
  console.log(`[chainId]    node scripts/gen-chainid-issued.mjs --write`);
}

// ═══ CỔNG ĐẺ CHAIN: MẶC ĐỊNH ĐÓNG (D-087) ═══
//
// Chỉ `A1_DE_CHAIN_MO=1` mới mở. Mọi giá trị khác — thiếu biến, `0`, `true`, `yes`, chuỗi
// rỗng — đều là ĐÓNG. Cố ý hẹp: một cổng an toàn mà nhận nhiều cách nói "bật" là một cổng
// bật nhầm, và ở đây bật nhầm nghĩa là hứa với người lạ một thứ sắp bị xoá.
const DE_CHAIN_MO = process.env.A1_DE_CHAIN_MO === "1";

// Hai lượt tạo chain chạy song song sẽ restart node giữa chừng nhau và hỏng cả
// hai. Xếp hàng tuần tự — đây là ràng buộc đúng đắn, không phải tối ưu hoá.
const queue = serialQueue({ maxPending: 5 });
const ROOT = process.cwd(); // phải là gốc dự án
// Compose + container để điều phối. Mặc định là node đơn (dev cũ); mạng chuẩn
// hiện nay là bộ nhiều node nên trên server phải trỏ sang compose multinode:
//   A1_COMPOSE_FILE=/home/ubuntu/9chain-a1/net/docker-compose.multinode.yml
//   A1_NODE_CONTAINER=9chain-a1-node-1
const COMPOSE_FILE = process.env.A1_COMPOSE_FILE || "local-net/docker-compose.yml";
const NODE_CONTAINER = process.env.A1_NODE_CONTAINER || "9chain-a1-node";
const COMPOSE = ["compose", "-f", COMPOSE_FILE];
const CFG_DIR = path.join(ROOT, "9chain-a1-config");
const TMP_DIR = path.join(CFG_DIR, "console-tmp");
// Cấu hình riêng của từng chain: `<CHAIN_CFG_DIR>/<blockchainID>/config.json`.
// Compose mount thư mục cha vào MỌI node ở `/9chain-a1/config` (ro) và mỗi node
// chạy với `--chain-config-dir=/9chain-a1/config/chains`, nên ghi MỘT lần ở đây là
// mọi node cùng đọc. Xem ghiChainConfig().
const CHAIN_CFG_DIR = path.join(CFG_DIR, "chains");
const STATE = path.join(CFG_DIR, "console-chains.json");
// Khuôn genesis cho mọi L1. JSON không chứa được chú thích, mà trong đó có đúng một
// con số không tự giải thích nổi — `warpConfig.blockTimestamp: 1607144400`:
//
//   Warp TỪ CHỐI bật trước Durango (`precompile/contracts/warp/config.go:93`), và
//   phép kiểm là `IsDurango(<mốc bật Warp>)`, tức so với **mốc Durango của mạng**
//   = 1607144400 (2020-12-05), KHÔNG phải so với "genesis". Nên `blockTimestamp: 0`
//   — thứ mọi precompile khác trong `presets.mjs` dùng và chạy tốt — ở riêng Warp
//   lại làm chain **không đẻ nổi**: `IsDurango(0)` là false.
//
// Đặt đúng mốc Durango nghĩa là Warp sống từ block thật đầu tiên (mọi block đều có
// thời gian sau 2020), mà vẫn qua được phép kiểm. Xem D-031.
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

/**
 * WHO MAY CREATE AN L1 — the wallet allowlist (D-171).
 *
 * ═══ 🔴 WHY IT EXISTS ═══
 *
 * Until 2026-09-03 anyone who could sign a SIWE message could create a chain, and the only limits
 * were rate limits. Measured that day, that is a much bigger door than it looks:
 *
 *   · `MAX_L1` is **15**, and it is not a number anyone can raise: `maxNumTrackedSubnets = 16` in
 *     `network/peer/peer.go:39` is enforced at handshake and exceeding it calls `p.StartClose()` —
 *     every peer drops the node. Two are used, so **13 slots exist, ever**.
 *   · A junk chain does not cost a slot, it costs a NAME, **permanently and across generations**:
 *     re-genesis erases the chain but `chainid-issued.json` keeps the name and chainId blocked
 *     forever, because reissuing a chainId is what would let an old chain's signatures replay on
 *     a new one. That ledger only ever grows.
 *
 * ⇒ Self-service is the right shape when the resource is effectively unlimited. Thirteen
 *   permanent slots is the size of an INVITATION LIST, and no technical gate detects that kind of
 *   mismatch between a product's shape and what it actually has.
 *
 * ═══ 🔴 FAIL CLOSED, and deliberately so ═══
 *
 * Unset or empty ⇒ **no wallet may create**; only the operator token can. This follows the rule
 * `A1_DE_CHAIN_MO` already sets in this file: a safety gate that accepts many ways of saying
 * "allow" is a gate that opens by accident. An allowlist that falls open when its variable is
 * missing is exactly that — and the failure would be silent, because nothing looks wrong.
 * The startup line below says out loud which state it is in, so "I forgot to set it" cannot be
 * mistaken for "it is working".
 *
 * ═══ 🔴 IT GATES CREATION ONLY — NEVER REVOCATION ═══
 *
 * `/api/revoke` already checks that the signer owns the chain. If the allowlist also gated
 * revocation, then removing someone from the list would STRAND their chain: they could not
 * revoke it, and neither could anyone else without the operator token. A gate that can trap a
 * user's own property inside is not a safety feature.
 *
 * The rule itself lives in `../lib/l1-allowlist.mjs` — importable, and therefore testable without
 * starting a server. This file exits at import time when `A1_CONSOLE_TOKEN` is missing, so a pure
 * function kept in here could only be verified by copying it somewhere else, which is how one
 * rule becomes three declarations (CLAUDE.md section 6).
 */
let L1_ALLOWLIST;
try {
  L1_ALLOWLIST = parseAllowlist(process.env.A1_L1_ALLOWLIST, parseEvmAddress);
} catch (e) {
  // 🔴 Refuse to start rather than silently drop an entry. A list quietly one shorter than the
  // operator believes is the failure this whole gate exists to prevent, pointing inward.
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
if (!existsSync(CHAIN_CFG_DIR)) mkdirSync(CHAIN_CFG_DIR, { recursive: true });

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
// CỔNG THẾ HỆ — console đang nói chuyện với mạng của thế hệ NÀO?
//
// 🔴 VÌ SAO. Tới `2026-08-28` console **chưa bao giờ hỏi node câu này**
// (`grep networkID server.mjs` ⇒ 0 kết quả). Nó cấp chainId từ khối của thế hệ
// khai trong `lib/chainid.mjs` — một hằng số **chép tay**, độc lập với
// `constants.A1Gen` bên Go. Ngày G bump `0 → 1`; quên một bên thì không có gì
// báo lỗi và console phát chainId của **thế hệ khác** vào ví người dùng, qua
// một genesis **BẤT BIẾN**.
//
// `scripts/check-consistency.mjs` canh quan hệ Go ↔ JS **trong repo**. Cổng này
// canh lớp còn lại và là lớp đắt hơn: *mã trong repo* ↔ **mạng đang chạy**. Đó
// đúng là lớp đã để B-14 hở hai ngày (D-088) — mã đúng, cổng xanh, tài liệu ghi
// "đã đóng", mà sản phẩm thì không.
//
// ⚠️ Ba trạng thái, và **hai trong ba đều CHẶN**:
//   khớp      → phục vụ
//   lệch      → CHẶN. Đây là lúc cổng có ích nhất.
//   chưa đo   → CHẶN. "Không biết mình đang ở thế hệ nào" không phải lý do để
//               phát một số vĩnh viễn. Rỗng ≡ hỏng (D-069b).
//
// 🔴 BẪY ĐÃ ĐO: `info.getNetworkID` trả về **CHUỖI** `"999999999"`, không phải
// số. So bằng `===` với số là cổng ĐỎ VĨNH VIỄN; so bằng `==` là cổng lỏng.
// Đo thật `28/08` trên `rpc-a1.9chain.org` trước khi viết dòng này.
//
// Đo MỖI LƯỢT, không cache: một kết quả "khớp" nhớ từ lúc khởi động sẽ sống sót
// qua đúng thứ nó sinh ra để bắt — một lượt sinh lại mạng dưới chân console.
async function kiemTheHeMang() {
  let doDuoc, tenDo;
  try {
    const r = await rpc("/ext/info", "info.getNetworkID");
    const t = await rpc("/ext/info", "info.getNetworkName");
    doDuoc = Number(r?.networkID);
    tenDo = t?.networkName;
  } catch (e) {
    return {
      trangThai: "chuaDo",
      vi: `không hỏi được node đang chạy (${API}): ${e.message}. Console từ chối đẻ chain khi ` +
        `chưa biết mình đang ở thế hệ mạng nào — một chainId phát nhầm thế hệ là vĩnh viễn.`,
    };
  }
  if (!Number.isSafeInteger(doDuoc)) {
    return {
      trangThai: "chuaDo",
      vi: `node trả networkID không đọc được thành số: ${JSON.stringify(doDuoc)}`,
    };
  }
  if (doDuoc !== NETWORK_ID || (tenDo && tenDo !== TEN_MANG)) {
    return {
      trangThai: "lech",
      vi: `LỆCH THẾ HỆ. Console dựng cho thế hệ g${A1_GEN} (networkID ${NETWORK_ID}, "${TEN_MANG}") ` +
        `nhưng node đang chạy khai networkID ${doDuoc}, "${tenDo}". Khối chainId của console ` +
        `bắt đầu ở ${GOC_DAI_CHAINID} — cấp số từ khối đó lên mạng này là phát nhầm thế hệ, ` +
        `và chainId nằm trong genesis BẤT BIẾN. Sửa: cập nhật A1_GEN trong local-net/lib/chainid.mjs ` +
        `cho khớp constants.A1Gen bên Go rồi deploy lại console (scripts/check-deploy-drift.mjs).`,
    };
  }
  return { trangThai: "khop", vi: `g${A1_GEN} · networkID ${doDuoc} · "${tenDo}"` };
}

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
// `requireInt` refuses a mistyped value instead of turning it into NaN — a NaN ceiling is
// not a loose ceiling, it is NO ceiling (every `>=` against NaN is false). See guard.mjs.
const MAX_L1 = Math.min(requireInt("A1_MAX_L1", 15, { min: 1, max: TRAN_SUBNET_GIAO_THUC }), TRAN_SUBNET_GIAO_THUC);

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

/**
 * ═══ TIẾN TRÌNH ĐANG CHẠY — vì sao cần một cái riêng ═══
 *
 * Một lượt đẻ chain mất **~170 giây**, và đó là CHỦ Ý: các node restart lần lượt để
 * mạng không mất quorum, đổi lại RPC công khai chỉ gián đoạn 0,5s thay vì 6,0s
 * (D-008). Nhưng với người bấm nút thì một vòng xoay 170 giây đọc là **"hỏng rồi"** —
 * họ tải lại trang, bấm lại, và lần bấm thứ hai là một chain thừa ăn mất một slot
 * trong trần 15.
 *
 * `/api/create` trả về nhật ký `restart` **sau khi xong**, tức đúng lúc không còn ai
 * cần nó nữa. Cái thiếu là đọc được tiến trình **giữa chừng**.
 *
 * ═══ VÌ SAO MỘT BIẾN TOÀN CỤC LÀ ĐỦ (VÀ ĐÚNG) ═══
 * Console chạy MỘT tiến trình, và `create`/`revoke` đi chung một **hàng đợi tuần
 * tự** — theo thiết kế, vì hai đợt rollout chồng nhau sẽ restart giữa chừng nhau và
 * hỏng cả hai. Nên tại mọi thời điểm có **nhiều nhất một** lượt đang chạy. Dựng một
 * bảng job có id cho một thứ không bao giờ có hai là thêm trạng thái để giữ đồng bộ
 * mà không mua được gì.
 *
 * Giữ lại lượt VỪA XONG (không xoá ngay) để người dùng tải lại trang muộn vài giây
 * vẫn thấy kết quả thay vì một màn trống.
 */
const tienTrinh = {
  dangChay: false,
  loai: null,      // "tao" | "thuHoi"
  ten: null,
  batDau: 0,
  buoc: [],        // [{ ma, nhan, trangThai: "cho"|"chay"|"xong"|"hong", ms }]
  loi: null,
};

/**
 * 🔴 BA HÀM DƯỚI ĐÂY ĐỀU IM LẶNG BỎ QUA KHI KHÔNG CÓ LƯỢT NÀO ĐANG CHẠY.
 *
 * Không có cửa chặn đó thì lượt **thu hồi** (cũng gọi `trackSubnetsLanLuot`) sẽ ghi
 * đè lên tiến trình của lượt **đẻ vừa xong** — đo được 2026-08-25: ngay sau khi
 * lượt đẻ đóng ở 8/8, lượt thu hồi kéo bước `node-2` từ "xong" về "chay" và giao
 * diện của người vừa đẻ chain thấy tiến trình **chạy lùi**. Hỏng theo kiểu tệ: hai
 * thao tác khác nhau dùng chung một bảng trạng thái mà không ai khai điều đó.
 */
function moTienTrinh(loai, ten, buoc) {
  tienTrinh.dangChay = true;
  tienTrinh.loai = loai;
  tienTrinh.ten = ten;
  tienTrinh.batDau = Date.now();
  tienTrinh.loi = null;
  tienTrinh.buoc = buoc.map(b => ({ ...b, trangThai: "cho", ms: 0 }));
}

/** Đánh dấu một bước bắt đầu chạy; bước trước đó (nếu còn "chay") coi như xong. */
function buocChay(ma, nhan) {
  if (!tienTrinh.dangChay) return;
  const b = tienTrinh.buoc.find(x => x.ma === ma);
  if (b) { b.trangThai = "chay"; b.batDau = Date.now(); if (nhan) b.nhan = nhan; }
}

function buocXong(ma, ms) {
  if (!tienTrinh.dangChay) return;
  const b = tienTrinh.buoc.find(x => x.ma === ma);
  if (b) { b.trangThai = "xong"; b.ms = ms ?? (b.batDau ? Date.now() - b.batDau : 0); }
}

/** Thêm bước phát hiện lúc chạy (số node chỉ biết sau khi đọc compose). */
function themBuoc(ma, nhan) {
  if (!tienTrinh.dangChay) return;
  if (!tienTrinh.buoc.some(x => x.ma === ma)) {
    tienTrinh.buoc.push({ ma, nhan, trangThai: "cho", ms: 0 });
  }
}

function dongTienTrinh(loi) {
  tienTrinh.dangChay = false;
  tienTrinh.loi = loi ? String(loi.message || loi) : null;
  if (loi) {
    const b = tienTrinh.buoc.find(x => x.trangThai === "chay");
    if (b) b.trangThai = "hong";
  }
}

/**
 * Is the L1 itself (not just P/X/C) healthy again on this node?
 *
 * 🔴 WHY A SECOND CHECK EXISTS (P-61, 2026-09-04). A node with an unparsable `upgrade.json`
 * never initialises that chain's VM (`plugin/evm/vm.go:544`) while its PRIMARY network is
 * perfectly healthy. `nodeSanSang` reads P/X/C only — correct for create/revoke, where the L1
 * is new or gone — so an upgrade rollout guarded by it alone would restart nine nodes and leave
 * the L1 dead on every one, all green. `health.health` tagged with the subnetID answers with a
 * check keyed by the blockchainID (measured on SBull Chain, 2026-09-04); that key absent or
 * carrying `error` is the signal.
 */
async function chainSanSang(svc, subnetID, blockchainID) {
  let out;
  try {
    out = await docker([...COMPOSE, "exec", "-T", svc, "curl", "-sf", "-m", "5",
      "-X", "POST", "-H", "content-type:application/json",
      "--data", `{"jsonrpc":"2.0","id":1,"method":"health.health","params":{"tags":["${subnetID}"]}}`,
      "http://127.0.0.1:9650/ext/health"]);
  } catch {
    return { ok: false, vi: "API not answering" };
  }
  let checks;
  try { checks = JSON.parse(out.slice(out.indexOf("{"), out.lastIndexOf("}") + 1))?.result?.checks; } catch { return { ok: false, vi: "health not parseable" }; }
  const c = checks?.[blockchainID];
  if (!c) return { ok: false, vi: `no health check for chain ${blockchainID} yet` };
  if (c.error) return { ok: false, vi: `chain ${blockchainID}: ${typeof c.error === "string" ? c.error : JSON.stringify(c.error)}` };
  return { ok: true, vi: "chain check clean" };
}

/**
 * @param {string} trackList   comma-separated subnetIDs every node must track
 * @param {{requireChain?: {subnetID:string, blockchainID:string}}} opts
 *   `requireChain` — ALSO wait for this chain's own health check on each node (upgrade rollouts).
 * On failure the thrown error carries `daXong` (the services already restarted) so the caller
 * can undo them; the text lists them too, for a human reading the log.
 */
/**
 * When did this container's process last start? Used to prove a restart HAPPENED.
 *
 * 🔴 Returns null when docker cannot answer, and the caller must treat null as "unknown", never as
 * "unchanged". An unreadable timestamp compared against another unreadable timestamp is equal, and
 * equal would read as "it restarted correctly" — the exact inversion this whole check exists to
 * prevent.
 */
async function nodeStartedAt(svc) {
  try {
    const out = await docker(["inspect", "--format", "{{.State.StartedAt}}", svc]);
    const t = out.trim().split("\n").pop().trim();
    return /^\d{4}-\d{2}-\d{2}T/.test(t) ? t : null;
  } catch { return null; }
}

/**
 * @param {string} trackList   comma-separated subnetIDs every node must track
 * @param {object} opts
 *   `requireChain`  — ALSO wait for this chain's own health check on each node (upgrade rollouts)
 *   `forceRestart`  — 🔴 REQUIRED whenever the point of the rollout is to make nodes RE-READ A FILE
 *
 * ═══ 🔴 WHY `forceRestart` EXISTS (measured on the live network, 2026-09-04 16:09Z) ═══
 *
 * `compose up -d --no-deps <svc>` recreates a container only when its CONFIG CHANGED. On the create
 * path `A1_TRACK_SUBNETS` gains a subnet, so it changes and the node really restarts — the log
 * records about 32 s per node. On an UPGRADE the track list is IDENTICAL, so compose does nothing
 * at all: the log recorded 0.4 s for all nine nodes, `docker inspect` showed every container still
 * running from two hours earlier, and `upgrade.json` sat on disk unread.
 *
 * Every health check passed instantly — because the node had never gone down. That is "silence
 * read as agreement" wearing a different costume: the rollout asked "is this node healthy" when the
 * question it needed was "did this node restart".
 *
 * So this flag does two things, and the second matters more than the first:
 *   1. `--force-recreate`, so the restart actually happens;
 *   2. it MEASURES that it happened, by requiring `.State.StartedAt` to move. A rollout that cannot
 *      prove the node restarted must fail loudly, not proceed to the next node.
 *
 * Only the final verification in `/api/upgrade` caught this, after all nine nodes had reported
 * success. It recorded nothing, which is why nothing was corrupted — but nine "done" lines for nine
 * no-ops is exactly the report that gets believed.
 */
async function trackSubnetsLanLuot(trackList, { requireChain, forceRestart = false } = {}) {
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
  if (!services.length) throw new Error("could not read the service list from compose");
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

  // Số node chỉ biết được SAU khi đọc compose, nên các bước này thêm vào lúc chạy.
  // Giao diện nhờ vậy hiện được "node 2/5" thay vì một vòng xoay không biết bao lâu.
  for (const svc of thuTu) themBuoc(`node:${svc}`, svc);

  for (const svc of thuTu) {
    const t0 = Date.now();
    buocChay(`node:${svc}`);
    // 🔴 Read this BEFORE touching the container: it is the only evidence that the restart below
    // was real. `null` means docker could not answer, and the check further down refuses to accept
    // a comparison between two unknowns.
    const truocKhiRestart = forceRestart ? await nodeStartedAt(svc) : null;
    // `--no-deps`: chỉ đụng đúng service này, không kéo theo service khác.
    // `--force-recreate` only when the point is to make the node re-read a file on disk — see the
    // header. Adding it unconditionally would recreate nine containers on every chain creation for
    // no reason, which is a slower and riskier rollout, not a safer one.
    await docker([
      ...COMPOSE, "up", "-d", "--no-deps", ...(forceRestart ? ["--force-recreate"] : []), svc,
    ], { A1_TRACK_SUBNETS: trackList });

    if (forceRestart) {
      // The container has a new start time, or the "restart" did not happen. Nine no-ops reported
      // as nine successes is how a rollout lies (measured 2026-09-04).
      const sauKhiRestart = await nodeStartedAt(svc);
      if (!restartProven(truocKhiRestart, sauKhiRestart)) {
        const err = new Error(
          `${svc} did NOT actually restart` +
          (truocKhiRestart === null || sauKhiRestart === null
            ? ` — docker could not report .State.StartedAt (before=${truocKhiRestart}, after=${sauKhiRestart}), so the restart cannot be proven and must not be assumed`
            : ` — .State.StartedAt is still ${sauKhiRestart}. The container was not recreated, so it never re-read its chain config directory, and every health check below would pass for a node that never went down.`) +
          ` STOPPED. Done: ${nhatKy.map(n => n.svc).join(", ") || "(none)"}.`
        );
        err.daXong = nhatKy.map(n => n.svc);
        err.hong = svc;
        throw err;
      }
    }

    let sanSang = null;
    for (let i = 0; i < 45; i++) {           // 45 × 2s = 90s cho mỗi node
      sanSang = await nodeSanSang(svc);
      if (sanSang.ok) break;
      await new Promise(r => setTimeout(r, 2000));
    }
    if (!sanSang?.ok) {
      const err = new Error(
        `${svc} chưa phục vụ lại được mạng chính sau 90s (${sanSang?.vi}) — ĐÃ DỪNG, ` +
        `các node còn lại chưa bị đụng tới. ` +
        `Đã xong: ${nhatKy.map(n => n.svc).join(", ") || "(chưa node nào)"}. ` +
        `Kiểm tra: docker logs ${svc} --tail 50`
      );
      err.daXong = nhatKy.map(n => n.svc);
      err.hong = svc;
      throw err;
    }
    if (requireChain) {
      // The L1 bootstraps AFTER the primary network; give it the same budget again.
      let chainOk = null;
      for (let i = 0; i < 45; i++) {
        chainOk = await chainSanSang(svc, requireChain.subnetID, requireChain.blockchainID);
        if (chainOk.ok) break;
        await new Promise(r => setTimeout(r, 2000));
      }
      if (!chainOk?.ok) {
        const err = new Error(
          `${svc} is back on the primary network but the L1 ${requireChain.blockchainID} is NOT healthy on it after 90s ` +
          `(${chainOk?.vi}) — STOPPED, the remaining nodes were not touched. ` +
          `Done: ${nhatKy.map(n => n.svc).join(", ") || "(none)"}. Check: docker logs ${svc} --tail 50`
        );
        err.daXong = nhatKy.map(n => n.svc);
        err.hong = svc;
        throw err;
      }
    }
    const ms = Date.now() - t0;
    nhatKy.push({ svc, ms });
    buocXong(`node:${svc}`, ms);
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

/**
 * Lời dặn về GIAO DỊCH ĐẦU TIÊN của một chain vừa đẻ (M5.4).
 *
 * ═══ VẤN ĐỀ ═══
 * `eth_estimateGas` **ước lượng THIẾU cho giao dịch đầu tiên** của chain mới. Đo có
 * đối chứng trên cùng một chain (Ptuintien3C7B, 2026-08-25): cùng calldata, cùng
 * người gửi, cùng precompile — block 1 ước lượng 52037 ⇒ hết gas ⇒ `status 0`;
 * block 2 trở đi ước lượng 54183 ⇒ `gasUsed 53388` ⇒ chốt. Ba chain khác nhau đều
 * hỏng y hệt ở block 1 với đúng con số 52037.
 *
 * Cách hỏng này ĐỘC vì nó **giả dạng "tính năng không tồn tại"**: receipt chỉ có
 * `status: 0` và không có lý do (lỗi của precompile là lỗi Go, không vào receipt
 * dưới dạng đọc được). Người vừa chọn kiểu chain "tự in tiền" rồi gọi mint lần đầu
 * sẽ thấy nó hỏng và kết luận preset không có hiệu lực — chính tôi đã kết luận nhầm
 * đúng như vậy khi làm M5.3. Xem D-025.
 *
 * ═══ VÌ SAO CONSOLE KHÔNG TỰ GỬI "GIAO DỊCH MỒI" (hướng đã cân nhắc và LOẠI) ═══
 * Cách giấu hẳn vấn đề là để server tự gửi một giao dịch ngay sau khi đẻ chain, mở
 * block 1 trước khi trao chain cho người dùng. Nhưng server **không có khoá nào
 * tiêu được tiền trên chain đó**: genesis chỉ cấp phát cho `admin`, và đó là ví của
 * người bấm nút. Muốn server gửi được thì genesis phải cấp thêm cho một địa chỉ do
 * Foundation giữ — tức là mọi chain người dùng đẻ ra đều mang sẵn một tài khoản của
 * chúng tôi, **vĩnh viễn**, vì genesis bất biến. Đó là phá đúng tính chất đắt nhất
 * mà `OwnerTest` đã chứng minh (quỹ Foundation: số dư 0, vai None). Đổi một tính
 * chất về quyền sở hữu lấy sự tiện lợi là cái giá sai. Xem D-030.
 *
 * ═══ CÁCH ĐÚNG ═══
 * Nói thật, và chỉ cách rẻ nhất: một **giao dịch chuyển tiền thường** tốn đúng
 * 21000 gas — con số cố định của EVM, **không cần ước lượng, nên không dính bẫy**.
 * Gửi một lượt như thế là block 1 mở ra và từ đó ước lượng chuẩn trở lại.
 * `probe-l1.mjs` vốn đã làm đúng việc này, nên ai chạy bài kiểm chứng theo hướng
 * dẫn thì đã vô tình thoát bẫy — chỉ người đi thẳng vào precompile mới dính.
 */
export const LUU_Y_GIAO_DICH_DAU = {
  title: "Giao dịch ĐẦU TIÊN trên chain mới: đừng tin ước lượng gas",
  body:
    "eth_estimateGas ước lượng THIẾU cho giao dịch đầu tiên của một chain vừa đẻ. " +
    "Giao dịch sẽ hết gas và trả về status 0 KHÔNG KÈM LÝ DO — trông hệt như " +
    "'tính năng không được bật'. Từ block 2 trở đi ước lượng chuẩn lại.",
  how:
    "Mở block 1 bằng một giao dịch chuyển tiền thường (tốn đúng 21000 gas, cố định, " +
    "không cần ước lượng). Sau đó gọi precompile hay deploy hợp đồng đều bình thường.",
  command: "node local-net/faucet/probe-l1.mjs <RPC> <PRIVKEY>",
  safeGasLimit: 300000,
};

// Tạo 1 L1: trả {name, subnetID, blockchainID, chainId, admin, rpc}
//
// `admin` = địa chỉ EVM sở hữu chain vừa đẻ: nhận toàn bộ phân bổ genesis VÀ là
// adminAddresses của feeManagerConfig. Không truyền thì rơi về A1_L1_ADMIN.
// Đây là thứ quyết định "người bấm nút có sở hữu chain của họ không" — nên nó
// được kiểm tra kỹ (EIP-55) trước khi ghi vào genesis: genesis đã đẻ là bất biến,
// gõ sai một ký tự là chain vĩnh viễn vô chủ.
/**
 * Ghi cấu hình VM cho MỘT chain — hiện chỉ để bật API Warp.
 *
 * ═══ VÌ SAO ĐÂY LÀ VIỆC BẮT BUỘC, KHÔNG PHẢI TUỲ CHỌN ═══
 * Bật Warp precompile trong genesis (M6.1) mới là **một nửa**. Nửa còn lại là API:
 * `plugin/evm/vm.go:1179` chỉ đăng ký namespace `warp` khi `vm.config.WarpAPIEnabled`,
 * mà `plugin/evm/config/config.go:38` KHÔNG đặt mặc định ⇒ giá trị zero của Go ⇒
 * **false**. Không có API đó thì không gọi được `warp_getMessageAggregateSignature`,
 * tức không gom được chữ ký BLS của validator, tức message gửi đi **không bao giờ
 * chứng minh được ở đầu kia**.
 *
 * Và nó hỏng đúng kiểu tệ nhất của dự án này: `sendWarpMessage` trên chain nguồn
 * vẫn là giao dịch THẬT, vẫn chốt, vẫn sinh log. Mọi dấu hiệu ở đầu gửi đều xanh.
 * Chỉ tới lúc đi tổng hợp chữ ký mới lộ ra, và lỗi khi đó là `method not found` —
 * đọc như "gọi sai tên hàm" chứ không như "thiếu cấu hình".
 *
 * ═══ VÌ SAO GHI Ở HOST, TRƯỚC KHI RESTART ═══
 * Node đọc file này lúc **dựng chain**, mà chain chỉ được dựng sau khi node track
 * subnet — tức là trong đợt rolling restart ngay sau đây. Ghi muộn hơn một nhịp là
 * mọi node dựng chain với cấu hình mặc định và phải restart lại lần nữa mới sửa.
 *
 * Thư mục `9chain-a1-config/` đã mount sẵn vào MỌI node (ro) nên một lần ghi là
 * đủ — khác hẳn đường mặc định `~/.avalanchego/configs/chains/` nằm trong volume
 * RIÊNG của từng node (phải `docker exec` 5 lần).
 *
 * Ghi qua file tạm rồi rename, giống console-chains.json: mount này là **thư mục**
 * nên rename không dính bẫy inode của bind-mount file đơn lẻ.
 */
function ghiChainConfig(blockchainID) {
  const dir = path.join(CHAIN_CFG_DIR, blockchainID);
  mkdirSync(dir, { recursive: true });
  const cfg = {
    // Tên khoá lấy từ source (`plugin/evm/config/config.go:38`), không gõ theo trí
    // nhớ — cùng lý do với tên khoá precompile ở presets.mjs: khoá lạ bị bỏ qua
    // TRONG IM LẶNG, nên gõ sai một chữ là API không bật mà không ai báo gì.
    "warp-api-enabled": true,
  };
  const dich = path.join(dir, "config.json");
  const tmp = dich + ".tmp";
  writeFileSync(tmp, JSON.stringify(cfg, null, 2) + "\n");
  renameSync(tmp, dich);
  return dich;
}

async function createChain(tham) {
  // 🔴 CỔNG ĐẺ CHAIN — MẶC ĐỊNH ĐÓNG (D-087).
  //
  // Ngày G `01/09` **xoá sạch mọi L1 người dùng**. Mở cửa từ giờ tới đó nghĩa là mỗi chain
  // người lạ đẻ ra là một lời hứa ta **biết chắc** sẽ nuốt lời sau vài ngày — và họ không
  // biết điều đó. Sau ngày G thì đúng chính sách ấy lại trung thực, vì mạng mới sống lâu hơn.
  //
  // 🔴 MỞ BẰNG TAY, KHÔNG MỞ BẰNG ĐỒNG HỒ. Một cổng tự mở theo mốc thời gian sẽ mở **kể cả
  // khi ngày G trượt** — tức đúng lúc điều kiện nó đang canh chưa thoả. Ngày tháng không
  // biết mạng đã sinh lại hay chưa; người thì biết.
  //
  // Đặt ở ĐẦU `createChain`, trước mọi phép kiểm khác: nó là câu trả lời rẻ nhất và không
  // phụ thuộc gì. `thuHoiChain` KHÔNG bị chặn — đóng cửa vào không được nhốt người đã ở trong.
  if (!DE_CHAIN_MO) {
    // 🔴 NEVER name the environment variable in this sentence. It goes straight to a visitor's
    //    browser: an internal operations hint on a public page is meaningless to the reader and
    //    tells a stranger what the switch is called. How to open it belongs in the startup log
    //    (operators only) and in `docs/`.
    throw new Error(
      "Chain creation is paused. The public network is being rebuilt on 2026-09-01 and every " +
      "user L1 will be erased with it — opening the door now would be promising something we " +
      "already know we cannot keep. It reopens after the rebuild.");
  }

  const plan = await planChain(tham);
  return await launchChain(plan);
}

/**
 * ═══ PLAN vs LAUNCH (milestone L1-CUSTOM, 2026-09-04) ═══
 *
 * `planChain` runs EVERY check and builds the whole genesis IN MEMORY, and spends nothing: no
 * file written, no P-Chain transaction, no node touched, no progress opened. `launchChain` takes
 * a plan and does the expensive, irreversible half.
 *
 * The split exists for `/api/preview` (P-62): a person about to spend one of 15 permanent slots
 * on an IMMUTABLE genesis deserves to read exactly what the node will run — and "exactly" means
 * the same code path, not a second implementation that drifts. Every refusal `createChain` would
 * make, `preview` makes first, in the same words.
 *
 * ⚠️ `planChain` reads the ledger; `launchChain` reads it AGAIN. Creation runs inside the serial
 * queue so nothing changes between the two, but preview runs outside it, and a plan must never be
 * launched later from a stale read — the plan is not a reservation.
 */
async function planChain({ name, chainId, admin, preset, symbol, allocations, fees, precompiles, contracts }) {
  // Cổng thứ hai, ngay sau cổng rẻ nhất: console có đang đứng đúng thế hệ mạng
  // không. Đặt TRƯỚC mọi phép kiểm tên/hạn mức/khoá vì một chainId phát nhầm thế
  // hệ là thứ **không thu hồi được** — thu hồi chain không trả lại số nhận dạng.
  const theHe = await kiemTheHeMang();
  if (theHe.trangThai !== "khop") throw new Error(theHe.vi);

  name = String(name || "").trim();
  /**
   * 🔴 NAME THE VIOLATION, NOT JUST THE RULE — measured on a real user, 2026-09-03.
   *
   * David typed `9S Union`, which satisfies this rule, and was refused. The character between the
   * words was a NON-BREAKING SPACE (U+00A0), pasted rather than typed. Four different characters
   * fail here while looking exactly like a space — U+00A0, U+202F, U+2009 — and U+200B is
   * invisible entirely.
   *
   * The old message stated the rule and stopped: *"only letters, digits and spaces"*. Read while
   * looking at a field containing letters, digits and what appears to be a space, that is worse
   * than saying nothing: it is a true sentence that makes a correct-looking input seem correct,
   * so the reader doubts the tool instead of the character. An error about an INVISIBLE cause
   * must point at the cause.
   *
   * ⚠️ Two failure modes shared one message, which hid both: a bad CHARACTER and a bad LENGTH.
   * They are told apart now, because "the name is too short" and "there is a NBSP in it" have
   * nothing to do with each other and no shared remedy.
   */
  if (!/^[A-Za-z0-9 ]{2,32}$/.test(name)) {
    const chars = [...String(name)];
    const at = chars.findIndex((c) => !/[A-Za-z0-9 ]/.test(c));
    if (at >= 0) {
      const cp = chars[at].codePointAt(0).toString(16).toUpperCase().padStart(4, "0");
      throw new Error(
        `Name may contain only letters, digits and spaces. Character ${at + 1} is U+${cp}` +
        (cp === "00A0" || cp === "202F" || cp === "2009" || cp === "200B"
          ? " — an invisible space lookalike, almost always from pasting. Retype the name by hand."
          : ` (${JSON.stringify(chars[at])}) — remove it.`)
      );
    }
    throw new Error(`Name must be 2-32 characters long; this one is ${chars.length}.`);
  }

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
  // 🔴 COMPARE CASE-INSENSITIVELY — the same rule `loiTenDaCap` already applies, and production
  // demonstrated why on 2026-08-31.
  //
  // This line compared with `===` until that day, so within ONE generation two names differing
  // only in case both got through: measured on the public network, a team member created `Eric1`
  // and then `eric1` nine minutes apart, each one dragging a rolling restart of all nine nodes
  // behind it.
  //
  // The asymmetry had no reason to exist. The CROSS-GENERATION ledger has normalised case since
  // D-086, and the argument written there — two spellings of a name are the same promise to the
  // same person, and someone who slips past a byte-exact check is usually just retyping the name
  // they remember — applies identically here. Applying it to only one half produced a generation
  // that permits two names the NEXT generation will refuse.
  //
  // ⚠️ `thuHoiChain` still compares exactly, deliberately: revoking points at one chain that
  // already exists, it does not ask whether a name is free.
  const trung = daDung.find(c => c.name.toLowerCase() === name.toLowerCase());
  if (trung) {
    throw new Error(state.chains.includes(trung)
      ? "Tên đã tồn tại"
      : `Tên "${name}" từng thuộc một L1 đã thu hồi — chọn tên khác để lịch sử không bị nhập nhằng`);
  }
  // 🔴 Sổ NHÀ ở trên chỉ nhớ được **thế hệ mạng hiện tại** — nó bị xoá sạch mỗi lượt
  // re-genesis. Sổ "A1 đã từng cấp" nhớ xuyên thế hệ. Không có nó thì sau mỗi lượt sinh
  // lại mạng, mọi tên cũ đều "còn trống" và người mới nhận đúng cái tên người cũ từng có.
  const loiTen = loiTenDaCap(name, tenDaCap);
  if (loiTen) throw new Error(loiTen);

  // ═══ NATIVE-TOKEN SYMBOL (P-54, 2026-09-03) ═══
  // Optional. Absent or blank ⇒ the record carries NO `symbol` key and readers apply the
  // fallback rule in `lib/l1-symbol.mjs` (derived from the name) — a guess is never written
  // into the ledger as if the owner had chosen it. Given ⇒ validated strictly and checked for
  // uniqueness against EVERY chain, retired ones included, the same way names and chainIds are:
  // a retired chain's symbol still sits in wallets that added that network.
  // Measured reason, on a real user: MetaMask showing "50.00M LOVE9" for a fresh L1 — the web
  // front-end passed the NETWORK coin's symbol for every user chain. The ledger key is what the
  // web reads instead (worktree web-home, P-55).
  const symbolGiven = symbol !== undefined && symbol !== null && String(symbol).trim() !== "";
  const SYMBOL = symbolGiven ? validateSymbol(symbol, daDung) : undefined;

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
    if (!Number.isSafeInteger(n) || n <= 0) throw new Error("The EVM chain ID must be a positive integer");
    if (taken.has(n)) {
      const cu = daDung.find(c => c.chainId === n);
      throw new Error(state.chains.includes(cu)
        ? `Chain ID ${n} đã dùng cho chain khác (${cu.name})`
        : `Chain ID ${n} thuộc về "${cu.name}" — L1 đã thu hồi. Số nhận dạng KHÔNG được cấp lại: ` +
          `ví của người từng dùng chain cũ sẽ coi chain mới là cùng một mạng.`);
    }
    // Câu lỗi tách riêng khỏi câu trên: hai chỗ trùng là hai thứ khác nhau và cách gỡ
    // cũng khác. Trùng sổ NHÀ ⇒ đổi số hoặc hỏi chủ cũ. Trùng sổ CÔNG KHAI ⇒ không ai
    // hỏi được ai, chỉ có đường chọn số khác.
    if (chainIdDaChiem.has(n)) {
      throw new Error(`Chain ID ${n} already belongs to "${chainIdDaChiem.get(n)}" in the public chainId registry ` +
        `(chainid.network, tra ${chainIdChiemNgayTra}). Ví đọc chainId chứ không đọc tên mạng, ` +
        `nên chain của bạn sẽ không phân biệt được với chuỗi đó trong MetaMask. Chọn số khác.`);
    }
    // 🔴 SỔ THỨ BA, và là lỗ mà §5c để hở: chính A1 đã cấp số này ở một thế hệ TRƯỚC.
    // Sổ nhà bên trên không bắt được vì nó bị xoá mỗi lượt re-genesis. Đây đúng là đường
    // người dùng **tự nhập** — D-069 dời gốc dải nên đường TỰ CẤP không còn chạm 9100–9145,
    // nhưng gõ tay thì vẫn tới được.
    const loiCap = loiChainIdDaCap(n, chainIdDaCap);
    if (loiCap) throw new Error(loiCap);
    chainId = n;
  } else {
    // Bỏ qua CẢ hai sổ. Bản trước chỉ bỏ qua sổ nhà, nên số đầu tiên nó cấp — 9100 —
    // trùng "Genesis Coin" trong sổ công khai. Xem khối chú thích ở `chainIdDaChiem`.
    // Gốc dải nay là 9000000010 (D-069). Phép cấp + cổng trần EIP-2294 ở `lib/chainid.mjs`,
    // nơi bài kiểm với tới được.
    // Sổ nhà truyền vào là HỢP của sổ thế hệ này và sổ mọi thế hệ trước. Hôm nay gốc dải
    // 9000000010 nằm cách 9100–9201 rất xa nên hợp này không đổi kết quả — nhưng phép cấp
    // không được phụ thuộc vào khoảng cách đó: đổi `A1_GEN` là khối dải dịch đi, và một
    // cổng chỉ đúng nhờ "may là chưa chạm" thì không phải cổng.
    chainId = capChainIdTuDong(new Set([...taken, ...chainIdDaCap]), chainIdDaChiem, GOC_DAI_CHAINID);
  }

  // 1) genesis EVM cho L1 này — IN MEMORY. Nothing is written until `launchChain`.
  const tpl = JSON.parse(readFileSync(L1_TEMPLATE, "utf8"));
  tpl.config.chainId = chainId;
  tpl.config.feeManagerConfig = { adminAddresses: [ADMIN], blockTimestamp: 0 };
  // ═══ DEEP OPTIONS (L1-CUSTOM: P-56 · P-57 · P-58) ═══
  // A non-standard preset and explicit fees/precompiles are refused TOGETHER (l1-options.mjs,
  // hard rule 3): with an immutable genesis, "which one wins" must never be answered in silence.
  assertPresetCompatible(preset, { fees, precompiles });
  // Preset áp SAU feeManagerConfig và không đụng vào nó — chủ chain giữ quyền
  // chỉnh phí ở mọi kiểu chain. Preset sai tên thì NÉM LỖI ở đây, trước khi tiêu
  // tiền và trước khi đụng node: subnet-evm bỏ qua khoá lạ trong im lặng, nên nếu
  // để lọt thì chain ra đời thiếu đúng thứ người dùng chọn mà không ai biết.
  const presetDaAp = apDungPreset(tpl.config, preset, ADMIN);
  // `gasLimit` nằm ở HAI chỗ trong genesis và subnet-evm ĐÒI chúng bằng nhau:
  // `core/genesis.go:456` `Genesis.Verify()` so `feeConfig.gasLimit` với `gasLimit`
  // ở gốc và trả lỗi nếu lệch. Đồng bộ tại đây ⇒ **`feeConfig` là nguồn sự thật
  // duy nhất**, và preset nào đổi thông lượng cũng chỉ cần sửa một chỗ.
  //
  // Không để preset tự lo hai chỗ: `apDungPreset` chỉ nhận phần `config`, nên một
  // preset muốn đổi gasLimit sẽ hoặc không với tới gốc, hoặc phải được trao cả
  // genesis — mở rộng quyền của preset lên toàn bộ thứ bất biến để giải một bài
  // toán một dòng. (Lỗi này ít nhất báo TO: chain không khởi động được và câu lỗi
  // nói thẳng hai con số — khác hẳn bẫy `minBaseFee` ở D-028.)
  // Explicit fees are applied AFTER the preset and inside the rails; `targetGas` is re-derived
  // from the final gasLimit either way (5×, the template ratio). Precompiles chosen one by one
  // all get the owner as admin — the library refuses anything else.
  tpl.config.feeConfig = applyFees(tpl.config.feeConfig, fees);
  applyPrecompiles(tpl.config, precompiles, ADMIN, parseEvmAddress);
  // 🔴 LAST LINE BEFORE THE GENESIS EXISTS: a port of subnet-evm's `FeeConfig.Verify()` plus the
  // project's own `minBaseFee ≥ 1` (D-028), run on the FINAL config whatever produced it. The
  // node runs the real Verify() too — this one runs before a P-Chain fee is paid.
  verifyFeeConfig(tpl.config.feeConfig);
  tpl.gasLimit = "0x" + BigInt(tpl.config.feeConfig.gasLimit).toString(16);
  // Khoá của `alloc` là hex TRẦN (không `0x`); dùng chữ thường cho đúng quy ước.
  // P-56: the owner's 50,000,000 is now the DEFAULT of `parseAllocations`, byte-identical to the
  // constant that stood here before (its self-test asserts that); the owner must always receive
  // a non-zero balance, or nobody could ever govern the chain.
  const allocation = parseAllocations(allocations, ADMIN, parseEvmAddress);
  tpl.alloc = allocation.alloc;
  // P-59: the contract library, opt-in. It is merged AFTER the user's allocation on purpose — the
  // library's three addresses are in a 0x09… range no wallet can hold a key for, so a collision is
  // impossible, but merging in this order means a future collision would be visible as an
  // overwrite here rather than as a silently missing contract on a chain nobody can fix.
  const withLibrary = parseContractLibrary(contracts);
  if (withLibrary) {
    for (const [addr, entry] of Object.entries(libraryAlloc())) {
      if (tpl.alloc[addr]) throw new Error(`contracts: address 0x${addr} is both a genesis recipient and a library contract — refusing to overwrite one with the other.`);
      tpl.alloc[addr] = entry;
    }
  }
  const options = effectiveOptions(tpl.config, allocation, withLibrary);
  const description = describeChain({
    cfg: tpl.config, allocation, chainId, name,
    symbol: SYMBOL ?? symbolFromName(name),
    contractLibrary: withLibrary,
  });

  return { name, chainId, ADMIN, SYMBOL, presetDaAp, tpl, options, description };
}

/** The irreversible half — see `planChain`. Runs inside the serial queue only. */
async function launchChain(plan) {
  const { name, chainId, ADMIN, SYMBOL, presetDaAp, tpl, options } = plan;
  const state = loadState();

  // Mở tiến trình NGAY SAU khi mọi phép kiểm rẻ đã qua — trước đó mà hỏng thì
  // người dùng nhận lỗi tức thì, không cần màn tiến trình nào.
  // 🔴 IT GOES OUT ON THE WIRE ⇒ IT IS ENGLISH. These three labels were Vietnamese and USERS SAW
  // THEM: measured 2026-09-03 on `/create-chain/` set to `EN English` — every sentence around
  // them in English, the three progress steps in Vietnamese.
  //
  // The translation boundary is already declared at `/api/progress` and was applied to exactly
  // HALF of what crosses it: `trangThai` is translated through `STATUS[...]` because it is an
  // enum the client switches on, and then `nhan` is passed straight through. Whoever wrote it
  // thought about ENUMS and missed FREE TEXT — the same shape as every other defect found this
  // day: the rule is right and it was applied to one half.
  //
  // ⚠️ Real localisation belongs to the client, not here. The API already ships `code`
  // (`genesis`/`subnet`/`rpc`) beside the label, so `web/` can translate from the code without
  // the console changing anything. The console does NOT guess the user's language — it does not
  // know it, and guessing wrong is this same bug pointing the other way.
  moTienTrinh("tao", name, [
    { ma: "genesis", nhan: "Building genesis" },
    { ma: "subnet", nhan: "Creating subnet + blockchain on P-Chain" },
    { ma: "rpc", nhan: "Waiting for the L1 RPC to answer" },
  ]);
  buocChay("genesis");

  const fname = `${name.replace(/ /g, "_")}.json`;
  writeFileSync(path.join(TMP_DIR, fname), JSON.stringify(tpl, null, 2));
  const inContainer = `/9chain-a1/config/console-tmp/${fname}`;

  buocXong("genesis");
  buocChay("subnet");

  // 2) đẻ subnet + chain qua 9chain-a1-cli (in SUBNET_ID=/BLOCKCHAIN_ID= ra stdout)
  const out = await docker([...COMPOSE, "exec", "-T",
    "-e", `A1_CLI_KEY=${CLI_KEY}`, NODE_CONTAINER,
    "/9chain-a1/build/9chain-a1-cli", "l1", "create",
    "--uri", API, "--genesis", inContainer, "--name", name]);
  const subnetID = (out.match(/SUBNET_ID=([A-Za-z0-9]+)/) || [])[1];
  const blockchainID = (out.match(/BLOCKCHAIN_ID=([A-Za-z0-9]+)/) || [])[1];
  if (!subnetID || !blockchainID) throw new Error("could not parse the IDs out of the CLI output:\n" + out);

  buocXong("subnet");

  // 2b) cấu hình VM của chain — PHẢI ghi trước đợt restart ở bước 3, vì node đọc
  //     nó đúng lúc dựng chain (tức là trong đợt restart đó). Xem ghiChainConfig.
  ghiChainConfig(blockchainID);

  // 3) cho node track TẤT CẢ subnet đã tạo — lần lượt, xem trackSubnetsLanLuot
  const allSubnets = [...state.chains.map(c => c.subnetID), subnetID];
  const nhatKyRestart = await trackSubnetsLanLuot(allSubnets.join(","));

  // 4) chờ RPC L1 — và BÁO LỖI nếu không lên.
  //
  // Bản trước lặp 30 lần rồi đi tiếp bất kể kết quả, nên khi node không track
  // được subnet thì console vẫn trả về một chain trông hợp lệ (có đủ ID, có URL
  // RPC) mà thực ra chết. Người dùng thêm vào MetaMask rồi mới phát hiện.
  buocChay("rpc");
  const rpcPath = `/ext/bc/${blockchainID}/rpc`;
  let live = false;
  for (let i = 0; i < 30; i++) {
    try { await rpc(rpcPath, "eth_chainId"); live = true; break; } catch { await new Promise(r => setTimeout(r, 5000)); }
  }
  buocXong("rpc");
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
  // Đặt A1_PUBLIC_RPC_BASE=https://rpc-a1.9chain.org trên server.
  const rpcBase = process.env.A1_PUBLIC_RPC_BASE || API;
  const chain = {
    name, subnetID, blockchainID, chainId, admin: ADMIN,
    // `preset` là khoá THÊM vào hợp đồng dữ liệu với trang /chains/ (an toàn).
    // Chain đẻ TRƯỚC M5 không có khoá này — trang phải coi thiếu là "Chuẩn", y như
    // cách đã xử lý khoá `admin` thiếu, chứ không được để `undefined` lọt ra.
    preset: presetDaAp.id,
    // Tên hiển thị đi KÈM bản ghi, không để trang danh bạ tự dịch id → tên.
    //
    // Trang `/chains/` là HTML tĩnh sau nginx, không gọi được console (loopback),
    // nên nó từng giữ một bảng id→tên chép tay. Bảng đó **đã trôi lệch**: nó gọi
    // `khong-phi` là "Không phí gas" trong khi preset đã đổi tên thành "Phí gần như
    // bằng 0" từ D-026 — đúng cái lời hứa sai mà việc đổi tên sinh ra để bỏ. Ghi tên
    // vào đây là ghi tại thời điểm đẻ chain, từ chính `presets.mjs`, nên hết trôi.
    // Thêm khoá vào `console-chains.json` là thao tác AN TOÀN với trang danh bạ.
    presetName: presetDaAp.name,
    rpc: `${rpcBase}${rpcPath}`, createdAt: Date.now(),
    // `symbol` — the owner's ticker for the L1's native token (P-54). Only present when the
    // owner chose one; a missing key means "apply the fallback rule", never "LOVE9". Another
    // ADDED key, so `/chains/` and `check-chain-ledger` keep working unchanged.
    ...(SYMBOL ? { symbol: SYMBOL } : {}),
    // `options` — the effective deep options (L1-CUSTOM), read back from the FINAL genesis
    // config: fee numbers, enabled precompiles, reward mode, genesis recipients. All of it is
    // already public in the genesis; this is the same facts in a shape `/chains/` can show.
    // Another ADDED key — chains created before it have none, and readers must treat a
    // missing key as "the template defaults", never as `undefined` on a page.
    options,
  };
  state.chains.push(chain); saveState(state);
  // Nhật ký restart trả cho người gọi làm bằng chứng, nhưng KHÔNG ghi vào state:
  // `console-chains.json` là hợp đồng dữ liệu với trang /chains/ công khai, chỉ
  // nên chứa thông tin về chain — không phải chi tiết vận hành của server.
  //
  // `luuY` cũng chỉ trả về, không ghi vào state, và cùng một lý do ở dạng khác: nó
  // là lời dặn cho người VỪA đẻ chain và hết giá trị ngay khi chain có block đầu.
  // Ghi vào danh bạ là để một cảnh báo nhất thời sống vĩnh viễn cạnh dữ liệu chain.
  return { ...chain, restart: nhatKyRestart, notes: LUU_Y_GIAO_DICH_DAU };
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
 * • KHÔNG rút node nào khỏi tập validator của subnet đó. Chúng vẫn là validator đã
 *   đăng ký cho tới hết hạn, chỉ là không còn chạy subnet nữa.
 *   ⚠️ Hệ quả: `platform.getCurrentValidators({subnetID})` vẫn trả ĐỦ validator cho
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
 * (`smoke-l1.mjs --create-chain`) chỉ chạy được tối đa ~10 lần trong cả đời dự án.
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
  if (!name) throw new Error("Missing the name of the chain to revoke");

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
  // Thu hồi cũng là một đợt rolling restart ~163 giây — cũng cần tiến trình theo
  // bước, và cần tiến trình RIÊNG để không đụng vào lượt đẻ vừa xong.
  moTienTrinh("thuHoi", name, []);
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

// ═══════════════════════════════════════════════════════════════════════════
// GOVERNING AN L1 THAT EXISTS — P-61 post-genesis upgrades · owner transfer · governance view
// (milestone L1-CUSTOM, 2026-09-04). The decisions live in `lib/l1-upgrade.mjs`; this block is
// the side effects: reading the node, the file on disk, the rollout, the ledger.
// ═══════════════════════════════════════════════════════════════════════════

function upgradeFilePath(blockchainID) { return path.join(CHAIN_CFG_DIR, blockchainID, "upgrade.json"); }

/** The upgrade list on disk for a chain — `[]` when there is no file, an ERROR when there is a broken one. */
function docUpgradeFile(blockchainID) {
  const p = upgradeFilePath(blockchainID);
  if (!existsSync(p)) return { list: [], exists: false };
  let j;
  try { j = JSON.parse(readFileSync(p, "utf8")); }
  catch (e) {
    // 🔴 Not "treat as empty": a file that does not parse stops this chain's VM on every node that
    // reads it (plugin/evm/vm.go:544). Extending it would hide that under a fresh timestamp.
    throw new Error(`upgrade.json for ${blockchainID} on disk is not valid JSON (${e.message}) — every node would refuse to start this chain; fix the file by hand before scheduling anything`);
  }
  if (!Array.isArray(j?.precompileUpgrades)) {
    throw new Error(`upgrade.json for ${blockchainID} has no precompileUpgrades list — this console did not write it; refusing to extend a file it does not understand`);
  }
  return { list: j.precompileUpgrades, exists: true };
}

/** Write the file atomically, keeping the previous version beside it so a failed rollout can undo. */
function ghiUpgradeFile(blockchainID, upgradeConfig) {
  const p = upgradeFilePath(blockchainID);
  mkdirSync(path.dirname(p), { recursive: true });
  let prev = null;
  if (existsSync(p)) {
    prev = `${p}.prev-${new Date().toISOString().replace(/[:.]/g, "-")}`;
    writeFileSync(prev, readFileSync(p));
  }
  const tmp = p + ".tmp";
  writeFileSync(tmp, JSON.stringify(upgradeConfig, null, 2) + "\n");
  renameSync(tmp, p);
  return { path: p, prev };
}

function chuChain(state, name) {
  const ten = String(name || "").trim();
  if (!ten) throw new Error("Missing the chain name");
  const chain = state.chains.find(c => c.name === ten);
  if (!chain) {
    throw new Error(state.retired.some(c => c.name === ten)
      ? `"${ten}" has been revoked — nothing to govern.`
      : `No L1 named "${ten}" in the directory.`);
  }
  if (chain.thuHoi) throw new Error(`"${ten}" is being revoked right now.`);
  return chain;
}

/** A wallet may govern only its own chain; the operator token may govern any. */
function kiemChuSoHuu(chain, ai) {
  if (ai?.kieu === "vanHanh") return;
  if (ai?.kieu !== "vi" || typeof ai.diaChi !== "string") { const e = new Error("not authenticated"); e.status = 401; throw e; }
  const chu = typeof chain.admin === "string" ? chain.admin.trim() : "";
  if (!chu || chu.toLowerCase() !== ai.diaChi.toLowerCase()) {
    const e = new Error(chu
      ? `"${chain.name}" belongs to ${chu}, not to the wallet signed in (${ai.diaChi}).`
      : `"${chain.name}" is a system chain — only the operator can govern it.`);
    e.status = 403;
    throw e;
  }
}

/** `readAllowList(address)` on one precompile, decoded. */
async function docVaiTro(rpcPath, precompileAddress, address) {
  const hex = await rpc(rpcPath, "eth_call", [{ to: precompileAddress, data: encodeReadAllowList(address) }, "latest"]);
  return decodeRole(hex);
}

/**
 * Everything an upgrade needs decided, with no side effect — shared by `/api/upgrade-preview`
 * and `/api/upgrade` (same shape as planChain/launchChain, same reason).
 */
async function planUpgradeForChain({ name, precompile, action, rewardManager, leadSeconds }, ai) {
  const state = loadState();
  const chain = chuChain(state, name);
  kiemChuSoHuu(chain, ai);
  const rpcPath = `/ext/bc/${chain.blockchainID}/rpc`;
  // The genesis truth comes from the NODE, not from the template in the repo: a chain created by
  // an older console, or with a preset, has a config this process never saw.
  const cfg = await rpc(rpcPath, "eth_getChainConfig");
  const disk = docUpgradeFile(chain.blockchainID);
  // The file on disk and the file the node runs must agree before either is extended: a
  // mismatch means a rollout never finished, or someone edited the file — both refuse.
  const trenNode = upgradeShape(cfg?.upgrades?.precompileUpgrades);
  const trenDia = upgradeShape(disk.list);
  if (trenNode !== trenDia) {
    throw new Error(`the upgrade.json on disk (${trenDia || "empty"}) is not what the public node runs (${trenNode || "empty"}) — a rollout is missing or the file was edited; refusing to extend it`);
  }
  const lead = leadSeconds === undefined || leadSeconds === null || leadSeconds === "" ? undefined : Number(leadSeconds);
  const plan = planUpgrade({
    chainConfig: cfg, existingUpgrades: disk.list, precompile, action, admin: chain.admin, rewardManager,
    nowSeconds: Math.floor(Date.now() / 1000), leadSeconds: lead,
  }, parseEvmAddress);
  return { chain, plan, rpcPath, cfg };
}

/**
 * Undo a rollout that stopped part-way: put the previous file back (or remove the new one) and
 * restart the nodes that already took the new file, so no validator is left to activate a rule
 * set the others do not carry. Best effort — it reports, it does not throw.
 */
async function hoanTacNangCap(chain, filePath, prev, daXong, hong) {
  const steps = [];
  try {
    if (prev) { writeFileSync(filePath, readFileSync(prev)); steps.push(`restored ${path.basename(prev)}`); }
    else { renameSync(filePath, filePath + ".failed-" + Date.now()); steps.push("removed the new upgrade.json (there was none before)"); }
  } catch (e) { steps.push(`could NOT restore the file: ${e.message}`); return steps.join("; "); }
  const trackList = loadState().chains.map(c => c.subnetID).join(",");
  for (const svc of [...daXong, ...(hong ? [hong] : [])]) {
    try {
      await docker([...COMPOSE, "up", "-d", "--no-deps", svc], { A1_TRACK_SUBNETS: trackList });
      let ok = null;
      for (let i = 0; i < 45; i++) { ok = await nodeSanSang(svc); if (ok.ok) break; await new Promise(r => setTimeout(r, 2000)); }
      steps.push(`${svc} restarted on the old file${ok?.ok ? "" : " (primary network NOT healthy after 90s — check it)"}`);
    } catch (e) { steps.push(`${svc} restart FAILED: ${e.message}`); }
  }
  return steps.join("; ");
}

async function napCapChain(tham, ai) {
  const { chain, plan, rpcPath } = await planUpgradeForChain(tham, ai);
  if (String(tham.confirm ?? "") !== chain.name) {
    throw new Error(
      `Upgrading "${chain.name}" restarts all validators and changes the chain's rules at ${plan.activateAtIso}. ` +
      `Send "confirm":"${chain.name}" to proceed.`);
  }
  moTienTrinh("nangCap", chain.name, [{ ma: "file", nhan: "Writing upgrade.json" }]);
  buocChay("file");
  const { path: filePath, prev } = ghiUpgradeFile(chain.blockchainID, plan.upgradeConfig);
  buocXong("file");

  // Same track list as today — the rollout exists only so every node re-reads the chain dir.
  const trackList = loadState().chains.map(c => c.subnetID).join(",");
  let nhatKy;
  try {
    // 🔴 `forceRestart` is NOT optional here. This rollout exists to make nine nodes re-read
    // `upgrade.json`; without it compose sees an unchanged config and does nothing, and every node
    // reports success in under a second (measured on the live network, 2026-09-04 16:09Z).
    nhatKy = await trackSubnetsLanLuot(trackList, {
      requireChain: { subnetID: chain.subnetID, blockchainID: chain.blockchainID },
      forceRestart: true,
    });
  } catch (e) {
    const undo = await hoanTacNangCap(chain, filePath, prev, e.daXong ?? [], e.hong);
    throw new Error(`${e.message} — UNDONE: ${undo}. Nothing was recorded; the chain keeps its previous rules.`);
  }

  // ═══ VERIFY, DO NOT TRUST ═══ "every node restarted" is not "every node read the file". The
  // public node's own chain config must list the new entry before the ledger says so.
  const cfg = await rpc(rpcPath, "eth_getChainConfig");
  const daVao = upgradeShape(cfg?.upgrades?.precompileUpgrades);
  const mongDoi = upgradeShape(plan.upgradeConfig.precompileUpgrades);
  if (daVao !== mongDoi) {
    throw new Error(`all nodes restarted but the public node's eth_getChainConfig shows "${daVao || "empty"}", expected "${mongDoi}" — the file it read is not the file written (${filePath}). Nothing recorded.`);
  }

  const st = loadState();
  const idx = st.chains.findIndex(c => c.name === chain.name);
  const rec = {
    precompile: tham.precompile, action: tham.action, activateAt: plan.activateAt, activateAtIso: plan.activateAtIso,
    appliedAt: Date.now(), by: ai.kieu === "vi" ? ai.diaChi : "operator",
  };
  // `upgrades` — an ADDED key on the public record: what changed after genesis, and when.
  if (idx >= 0) { st.chains[idx] = { ...st.chains[idx], upgrades: [...(st.chains[idx].upgrades ?? []), rec] }; saveState(st); }
  console.log(`  ✓ upgrade "${chain.name}": ${rec.action} ${rec.precompile} at ${rec.activateAtIso}`);
  return { name: chain.name, ...rec, entry: plan.entry, description: plan.description, restart: nhatKy };
}

/**
 * Transfer the RECORDED owner — after measuring that the chain already agrees (l1-upgrade.mjs
 * header: chain first, ledger second). No rollout: nothing on the nodes changes.
 */
async function doiChu({ name, newAdmin, confirm }, ai) {
  const state = loadState();
  const chain = chuChain(state, name);
  kiemChuSoHuu(chain, ai);
  const moi = parseEvmAddress(newAdmin, "newAdmin");
  if (String(confirm ?? "") !== chain.name) {
    throw new Error(`Transferring "${chain.name}" to ${moi} cannot be undone by this console. Send "confirm":"${chain.name}" to proceed.`);
  }
  const rpcPath = `/ext/bc/${chain.blockchainID}/rpc`;
  const cfg = await rpc(rpcPath, "eth_getChainConfig");
  const disk = docUpgradeFile(chain.blockchainID);
  const active = activePrecompiles(cfg, disk.list, Math.floor(Date.now() / 1000));
  const roles = { feeManager: await docVaiTro(rpcPath, PRECOMPILE_ADDRESS.feeManager, moi) };
  for (const n of UPGRADABLE_PRECOMPILES) if (active[n].enabled) roles[n] = await docVaiTro(rpcPath, PRECOMPILE_ADDRESS[n], moi);
  const verdict = ownerTransferVerdict({ newAdmin: moi, currentAdmin: chain.admin, roles });
  if (!verdict.ok) throw new Error(verdict.why);
  const cuConAdmin = (await docVaiTro(rpcPath, PRECOMPILE_ADDRESS.feeManager, chain.admin)).code === 2;

  const st = loadState();
  const idx = st.chains.findIndex(c => c.name === chain.name);
  if (idx < 0) throw new Error(`"${chain.name}" vanished from the ledger while checking the chain — nothing changed`);
  const truoc = st.chains[idx].admin;
  st.chains[idx] = {
    ...st.chains[idx], admin: moi,
    previousAdmins: [...(st.chains[idx].previousAdmins ?? []), { address: truoc, until: Date.now(), stillAdminOnChain: cuConAdmin, by: ai.kieu === "vi" ? ai.diaChi : "operator" }],
  };
  saveState(st);
  console.log(`  ✓ owner of "${chain.name}": ${truoc} → ${moi}`);
  return {
    name: chain.name, admin: moi, previousAdmin: truoc, previousStillAdminOnChain: cuConAdmin,
    checked: Object.keys(roles), why: verdict.why,
    note: cuConAdmin ? `${truoc} still holds Admin on FeeManager; call setNone(${truoc}) there (and on each precompile) if the hand-over is meant to be complete.` : undefined,
  };
}

/** Read-only picture for a "govern my chain" page: what is on, what is pending, who holds Admin. */
async function quanTri(name) {
  const state = loadState();
  const chain = chuChain(state, name);
  const rpcPath = `/ext/bc/${chain.blockchainID}/rpc`;
  const cfg = await rpc(rpcPath, "eth_getChainConfig");
  const disk = docUpgradeFile(chain.blockchainID);
  const now = Math.floor(Date.now() / 1000);

  // ═══ 🔴 WHICH CLOCK DECIDES WHETHER A PRECOMPILE IS LIVE ═══
  //
  // Not this server's. A precompile activates in the first block whose TIMESTAMP reaches the
  // activation moment, and subnet-evm builds a block only when there is a transaction. So on a
  // chain nobody uses, wall-clock time passes the activation and the chain stays exactly where it
  // was — the precompile does not exist yet, for anyone.
  //
  // Measured on SBull Chain 2026-09-04 17:08Z, and it took the page down: the upgrade activated at
  // 17:05Z by the clock, this function called it enabled, then asked the chain for its admin role
  // and got back `0x` because the latest block was still block 1 from 12:47Z — four hours before
  // the activation. `decodeRole` threw, correctly, and `/api/governance` answered 400 for that
  // chain. The upgrade was fine; the QUESTION was asked against the wrong clock.
  //
  // The chain's own head is the only clock that can answer this, so it is the one used.
  let chainHead = null;
  try {
    const b = await rpc(rpcPath, "eth_getBlockByNumber", ["latest", false]);
    chainHead = { number: Number(BigInt(b.number)), timestamp: Number(BigInt(b.timestamp)) };
  } catch { /* leave null; reported below rather than guessed at */ }
  // No head means no answer, not "assume now": guessing here is what produced the 400 above.
  const at = chainHead ? chainHead.timestamp : 0;

  // ═══ 🔴 WHICH LIST IS THE TRUTH: the NODE's, not the disk's ═══
  //
  // `disk.list` is what this console INTENDED; `cfg.upgrades.precompileUpgrades` is what the node
  // actually loaded and will execute. They are the same at rest and different exactly when
  // something went wrong — and on 2026-09-04 something did: a rollout wrote the file and restarted
  // nothing, so the disk said "enabled" while all nine nodes ran the old rules (D-189). Reporting
  // the disk's view would have shown a live precompile that did not exist.
  //
  // So the view is computed from the node, and the divergence is reported rather than hidden.
  const nodeList = cfg?.upgrades?.precompileUpgrades ?? [];
  const precompiles = activePrecompiles(cfg, nodeList, at);
  const diskDiffersFromNode = upgradeShape(disk.list) !== upgradeShape(nodeList);
  // An upgrade whose moment has passed on the clock but not yet in a block. Naming this state is
  // the whole point — "scheduled" and "live" are different, and a page that shows the second when
  // the truth is the first is lying to the person who has to act on it.
  const waitingForABlock = [];
  for (const n of UPGRADABLE_PRECOMPILES) {
    const p = precompiles[n];
    if (!p.enabled && p.pending && chainHead && now >= p.pending.at) waitingForABlock.push(n);
  }

  const adminRoles = { feeManager: (await docVaiTro(rpcPath, PRECOMPILE_ADDRESS.feeManager, chain.admin)).name };
  for (const n of UPGRADABLE_PRECOMPILES) if (precompiles[n].enabled) adminRoles[n] = (await docVaiTro(rpcPath, PRECOMPILE_ADDRESS[n], chain.admin)).name;
  return {
    name: chain.name, chainId: chain.chainId, admin: chain.admin, adminRoles, precompiles,
    addresses: PRECOMPILE_ADDRESS, upgradable: UPGRADABLE_PRECOMPILES,
    upgradeFile: disk.list, upgrades: chain.upgrades ?? [], previousAdmins: chain.previousAdmins ?? [],
    lead: { min: MIN_LEAD_SECONDS, max: MAX_LEAD_SECONDS }, now,
    // `chainHead` is what `precompiles` was computed against; `now` is this server's clock. They
    // are both returned so a page can say "scheduled, waiting for the chain's next block" instead
    // of picking one and being wrong.
    chainHead,
    waitingForABlock,
    // 🔴 True means the file on disk is not the file the nodes are running. Never a normal state:
    // it is either a rollout that did not restart anything (D-189) or an edit nobody rolled out.
    // `scripts/check-l1-upgrades.mjs` measures the same thing across all nine nodes and every chain.
    diskDiffersFromNode,
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

/**
 * Chặn nếu vượt hạn mức; trả true nghĩa là ĐÃ trả lời lỗi, caller dừng lại.
 *
 * `khoa` cho phép đếm theo thứ khác IP. Với người đăng nhập bằng ví thì **địa chỉ
 * ví mới là danh tính thật**, còn IP thì vừa quá rộng vừa quá hẹp cùng lúc: quá
 * rộng vì cả một văn phòng / một nhà mạng di động dùng chung một IP nên họ chặn
 * lẫn nhau; quá hẹp vì đổi IP là chuyện rẻ tiền nên kẻ muốn lách thì lách được.
 */
function blockedByRate(req, res, limiter, khoa = null) {
  const r = limiter(khoa || clientIp(req, TRUST_PROXY));
  if (r.ok) return false;
  res.writeHead(429, { "content-type": "application/json", "retry-after": String(r.retryAfter) });
  res.end(JSON.stringify({ error: `rate limit exceeded (${r.name}), try again in ${r.retryAfter}s` }));
  return true;
}

/**
 * Ai đang gọi? Trả `{kieu:"vanHanh"}` · `{kieu:"vi", diaChi}` · hoặc `null`.
 *
 * Hai đường đi qua CÙNG một header `Authorization: Bearer`. Thử token vận hành
 * trước vì nó là một phép so duy nhất; phiên ví phải duyệt kho nên đắt hơn.
 */
function danhTinh(req) {
  if (checkToken(req)) return { kieu: "vanHanh" };
  const diaChi = dangNhapVi.diaChiCuaPhien(req);
  return diaChi ? { kieu: "vi", diaChi } : null;
}

/** Chặn nếu chưa xác thực. Trả `null` nghĩa là ĐÃ trả lời lỗi, caller dừng lại. */
function blockedByAuth(req, res) {
  const ai = danhTinh(req);
  if (ai) return ai;
  // 401 kèm WWW-Authenticate để client biết cách gửi lại.
  res.writeHead(401, { "content-type": "application/json", "www-authenticate": "Bearer" });
  res.end(JSON.stringify({
    error: "not authenticated — use the operator token (Authorization: Bearer <A1_CONSOLE_TOKEN>) " +
           "or sign in with a wallet via /api/siwe/nonce then /api/siwe/login",
  }));
  return null;
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
      const ai = blockedByAuth(req, res);
      if (!ai) return;
      const [ver, cid] = await Promise.all([
        rpc("/ext/info", "info.getNodeVersion").then(v => v.version).catch(() => "?"),
        rpc("/ext/bc/C/rpc", "eth_chainId").then(x => parseInt(x, 16)).catch(() => null),
      ]);
      // defaultAdmin để giao diện nói rõ chain sẽ về tay ai nếu bỏ trống ô admin.
      const st = loadState();
      return send(res, 200, {
        node: ver, cChainId: cid, defaultAdmin: L1_ADMIN,
        chains: st.chains, retired: st.retired,
        // Giao diện phải nói rõ người dùng đang là AI. Đăng nhập bằng ví thì ô
        // admin không còn ý nghĩa (bị ép bằng địa chỉ ký) — hiện nhầm là mời họ
        // gõ một địa chỉ sẽ bị bỏ qua.
        dangNhap: ai.kieu, viDangNhap: ai.diaChi || null,
        // Người vận hành cần thấy còn bao nhiêu chỗ TRƯỚC khi bấm nút, không phải
        // sau khi bị từ chối: trần này là trần giao thức, không nới được.
        tran: MAX_L1, tranGiaoThuc: TRAN_SUBNET_GIAO_THUC,
        presets: danhSachPreset(),
        // Deep options (L1-CUSTOM): the rails and the choices, served from the SAME constants
        // the create path enforces, so a front-end never carries a second copy that drifts.
        // bigint rails go out as decimal strings.
        limits: JSON.parse(JSON.stringify(LIMITS, (_, v) => typeof v === "bigint" ? v.toString() : v)),
        selectablePrecompiles: SELECTABLE_PRECOMPILES,
        rewardModes: REWARD_MODES,
        // P-59: what `contracts: true` would install, so a page can name the addresses and the
        // size instead of hard-coding them. `bytes` is the honest cost of the option.
        contractLibrary: Object.fromEntries(Object.entries(GENESIS_CONTRACTS).map(([k, c]) => [k, { address: c.address, bytes: c.bytes }])),
      });
    }

    /**
     * Tiến trình của lượt đang chạy (hoặc lượt vừa xong).
     *
     * Chỉ ĐỌC, và cố ý rẻ: giao diện gọi nó mỗi vài giây suốt ~170 giây, nên nó
     * không được chạm vào docker hay RPC — chỉ trả lại thứ đã ghi sẵn trong bộ nhớ.
     *
     * `conLai` là ước lượng THÔ dựa trên số bước còn lại × nhịp thật đã đo
     * (~33s/node). Có nó thì thanh tiến trình nói được "còn khoảng 2 phút" thay vì
     * chỉ đếm bước — mà "còn bao lâu" mới là câu người bấm nút thật sự hỏi.
     */
    /**
     * 🔴 RANH GIỚI DỊCH THUẬT — KHOÁ JSON TIẾNG ANH, ĐỊNH DANH MÃ NGUỒN TIẾNG VIỆT.
     *
     * David chốt 2026-08-26: URL, tên tệp và **khoá JSON** phải là tiếng Anh. Nhưng
     * `tienTrinh` là state NỘI BỘ, và mã nguồn dự án này vốn đặt tên bằng tiếng Việt
     * — đổi hết định danh là một cuộc mổ khác hẳn, rủi ro hơn nhiều, và David không
     * yêu cầu. Nên chỗ dịch nằm ĐÚNG ở đây, một chỗ duy nhất: state giữ tên cũ, thứ
     * đi ra dây là tiếng Anh.
     *
     * Giá trị enum cũng dịch, không chỉ khoá: `"cho"|"chay"|"xong"|"hong"` là thứ
     * client `switch` lên, để nguyên thì hợp đồng vẫn nửa Việt nửa Anh.
     */
    if (req.method === "GET" && req.url === "/api/progress") {
      if (blockedByRate(req, res, limitRead)) return;
      const ai = blockedByAuth(req, res);
      if (!ai) return;
      const conBuoc = tienTrinh.buoc.filter(b => b.trangThai === "cho" || b.trangThai === "chay").length;
      const KIND = { tao: "create", thuHoi: "revoke", nangCap: "upgrade" };
      const STATUS = { cho: "pending", chay: "running", xong: "done", hong: "failed" };
      return send(res, 200, {
        running: tienTrinh.dangChay,
        kind: tienTrinh.loai ? (KIND[tienTrinh.loai] ?? tienTrinh.loai) : null,
        name: tienTrinh.ten,
        secondsElapsed: tienTrinh.batDau ? Math.round((Date.now() - tienTrinh.batDau) / 1000) : 0,
        steps: tienTrinh.buoc.map(({ ma, nhan, trangThai, ms }) => ({
          code: ma, label: nhan, status: STATUS[trangThai] ?? trangThai, ms,
        })),
        error: tienTrinh.loi,
        etaSeconds: tienTrinh.dangChay ? conBuoc * 33 : 0,
      });
    }

    if (req.method === "GET" && req.url === "/api/chains") {
      if (blockedByRate(req, res, limitRead)) return;
      if (!blockedByAuth(req, res)) return;
      return send(res, 200, loadState());
    }

    // ── Đăng nhập bằng ví ──────────────────────────────────────────────────
    // Hai endpoint này KHÔNG cần xác thực (chúng chính là cửa xác thực), nên
    // chúng là bề mặt công khai duy nhất của console — hạn mức là lớp bảo vệ duy nhất.
    if (req.method === "GET" && req.url.startsWith("/api/siwe/nonce")) {
      if (blockedByRate(req, res, limitNonce)) return;
      const diaChi = new URL(req.url, "http://x").searchParams.get("address");
      try {
        return send(res, 200, dangNhapVi.moiKy(diaChi));
      } catch (e) {
        return send(res, 400, { error: String(e.message || e) });
      }
    }

    if (req.method === "POST" && req.url === "/api/siwe/login") {
      if (blockedByRate(req, res, limitNonce)) return;
      try {
        const { nonce, signature } = JSON.parse((await docBody(req)) || "{}");
        // KHÔNG nhận `message` từ client — server dựng lại từ kho của mình.
        // Xem ghi chú đầu siwe.mjs; đây là chỗ chặn kiểu tấn công "dụ ký chỗ khác".
        return send(res, 200, dangNhapVi.xacThuc({ nonce, signature }));
      } catch (e) {
        return send(res, 401, { error: String(e.message || e) });
      }
    }

    /**
     * ═══ PREVIEW — the dry run of `/api/create` (P-62, console half) ═══
     *
     * Same body as `/api/create`, same code path (`planChain`), same refusals in the same words —
     * and it spends nothing: no file, no P-Chain transaction, no node restart, no progress, no
     * slot. Returns the genesis the node WOULD run, the effective options, and the plain
     * sentences "this chain can / cannot" that a person should read before signing under an
     * immutable artefact.
     *
     * Open to every authenticated identity, invited or not: a wallet that is not on the invite
     * list may still want to see what it would get, and the invite gate is applied at CREATE,
     * where it matters. A wallet's own address is forced as `admin` exactly as at create time,
     * so the preview shows the owner the chain would really have. Read-rate limited: it makes
     * two cheap RPC calls (the generation check) and no more.
     *
     * ⚠️ A preview is not a reservation. The chainId it shows is the one that is free NOW.
     */
    if (req.method === "POST" && req.url === "/api/preview") {
      if (blockedByRate(req, res, limitRead)) return;
      const ai = blockedByAuth(req, res);
      if (!ai) return;
      try {
        const tham = JSON.parse((await docBody(req)) || "{}");
        if (ai.kieu === "vi") tham.admin = ai.diaChi;
        const plan = await planChain(tham);
        return send(res, 200, {
          preview: true,
          name: plan.name, chainId: plan.chainId, admin: plan.ADMIN,
          symbol: plan.SYMBOL ?? symbolFromName(plan.name),
          symbolIsFallback: !plan.SYMBOL,
          preset: plan.presetDaAp.id, presetName: plan.presetDaAp.name,
          options: plan.options,
          description: plan.description,
          genesis: plan.tpl,
        });
      } catch (e) {
        return send(res, 400, { error: String(e.message || e) });
      }
    }

    // ═══ GOVERNANCE OF AN EXISTING L1 (P-61 · owner transfer · governance view) ═══
    if (req.method === "GET" && req.url.startsWith("/api/governance")) {
      if (blockedByRate(req, res, limitRead)) return;
      if (!blockedByAuth(req, res)) return;
      try {
        const name = new URL(req.url, "http://x").searchParams.get("name");
        return send(res, 200, await quanTri(name));
      } catch (e) { return send(res, e.status ?? 400, { error: String(e.message || e) }); }
    }

    // Dry run of `/api/upgrade` — same body, same plan, nothing written, nothing restarted.
    if (req.method === "POST" && req.url === "/api/upgrade-preview") {
      if (blockedByRate(req, res, limitRead)) return;
      const ai = blockedByAuth(req, res);
      if (!ai) return;
      try {
        const tham = JSON.parse((await docBody(req)) || "{}");
        const { chain, plan } = await planUpgradeForChain(tham, ai);
        return send(res, 200, { preview: true, name: chain.name, chainId: chain.chainId, admin: chain.admin, ...plan });
      } catch (e) { return send(res, e.status ?? 400, { error: String(e.message || e) }); }
    }

    // The real thing: writes upgrade.json, rolls every node, verifies on the public node,
    // records. Shares the serial queue with create/revoke — it IS a rolling restart.
    if (req.method === "POST" && req.url === "/api/upgrade") {
      if (blockedByRate(req, res, limitFlood)) return;
      const ai = blockedByAuth(req, res);
      if (!ai) return;
      if (ai.kieu === "vi" && blockedByRate(req, res, limitUpgrade, `vi:${ai.diaChi}`)) return;
      try {
        const tham = JSON.parse((await docBody(req)) || "{}");
        let kq;
        try { kq = await queue.run(() => napCapChain(tham, ai)); }
        catch (e) { dongTienTrinh(e); throw e; }
        dongTienTrinh(null);
        return send(res, 200, kq);
      } catch (e) { return send(res, e.status ?? 400, { error: String(e.message || e) }); }
    }

    // Ledger follows the chain: accepted only after readAllowList(newAdmin) says Admin everywhere.
    if (req.method === "POST" && req.url === "/api/transfer-owner") {
      if (blockedByRate(req, res, limitFlood)) return;
      const ai = blockedByAuth(req, res);
      if (!ai) return;
      if (ai.kieu === "vi" && blockedByRate(req, res, limitTransfer, `vi:${ai.diaChi}`)) return;
      try {
        const tham = JSON.parse((await docBody(req)) || "{}");
        return send(res, 200, await doiChu(tham, ai));
      } catch (e) { return send(res, e.status ?? 400, { error: String(e.message || e) }); }
    }

    // Đẻ chain và thu hồi chain đi chung một cửa: cả hai đều restart lần lượt cả
    // từng node, nên cả hai PHẢI đi qua cùng một hàng đợi tuần tự. Chạy chồng nhau
    // là hai đợt rollout đá nhau giữa chừng và hỏng cả hai.
    if (req.method === "POST" && (req.url === "/api/create" || req.url === "/api/revoke")) {
      const laThuHoi = req.url === "/api/revoke";
      // Cửa ngoài trước, cửa trong SAU xác thực — xem ghi chú ở limitFlood.
      if (blockedByRate(req, res, limitFlood)) return;
      const ai = blockedByAuth(req, res);
      if (!ai) return;
      // Đăng nhập bằng ví ⇒ đếm theo VÍ. Người vận hành thì vẫn theo IP (họ không
      // có ví, và họ là một người duy nhất). Tiền tố `vi:` để hai không gian khoá
      // không đụng nhau — một địa chỉ IPv6 và một địa chỉ EVM đều là chuỗi hex.
      // Ngân sách nghiêm ngặt CHỈ áp cho ví. Token vận hành là người sở hữu chính
      // cái máy chủ này — họ có shell, họ chạy được bộ nghiệm thu, họ dọn được sự
      // cố. Siết 3 lượt/giờ với họ không chặn được ai mà lại **chặn đúng lúc cần
      // dùng nhất**: bộ kiểm thử M5.3 (4 preset × 1 chain) tự khoá mình ở lượt thứ
      // tư và 3/4 preset không bao giờ được nghiệm thu.
      // Cửa ngoài chống lụt (60 lượt/giờ) vẫn áp cho MỌI người, nên vòng lặp chạy
      // loạn vẫn bị chặn — và trần 15 L1 chặn nốt phần còn lại.
      if (ai.kieu === "vi" &&
          blockedByRate(req, res, laThuHoi ? limitRevoke : limitCreate, `vi:${ai.diaChi}`)) return;

      // 🔴 The invite list — CREATION ONLY. Revocation must stay open to the chain's owner, or
      // removing a wallet from the list would trap that wallet's chain (see mayCreateL1).
      // Placed after authentication (there is no identity to judge before it) and before any
      // money is spent or any node is touched.
      if (!laThuHoi) {
        // 🔴 PASS THE LIST EXPLICITLY. An earlier version called `mayCreateL1(ai)` and relied on a
        // default binding that no longer existed once the rule moved to `lib/l1-allowlist.mjs`,
        // so every wallet was refused with "A1_L1_ALLOWLIST is unset" while it was demonstrably
        // set. The library now THROWS on a missing list rather than treating it as empty — the
        // two are not the same thing, and collapsing them is what let this ship.
        const phep = mayCreateL1(ai, L1_ALLOWLIST);
        if (!phep.ok) {
          return send(res, 403, {
            error: `Chain creation is by invitation while the network has only ${MAX_L1} L1 slots in total: ${phep.why}.`,
          });
        }
      }
      try {
        const tham = JSON.parse((await docBody(req)) || "{}");

        if (ai.kieu === "vi") {
          // ═══ ĐÂY LÀ ĐIỂM CỦA CẢ M4.1 ═══
          // Đăng nhập bằng ví ⇒ `admin` là địa chỉ ĐÃ KÝ, không phải thứ client
          // gửi lên. Ghi đè, không phải kiểm rồi báo lỗi: không có kịch bản hợp lệ
          // nào mà người ký lại muốn chain về tay địa chỉ khác, còn để họ tự gõ là
          // giữ nguyên lớp lỗi tệ nhất của dự án — sai một ký tự, genesis bất biến,
          // chain vô chủ vĩnh viễn, không lỗi, không dấu hiệu.
          if (laThuHoi) {
            // Thu hồi thì chỉ được đụng chain CỦA MÌNH. Token vận hành vẫn thu hồi
            // được mọi chain (đó là vai trò của nó), nhưng một ví lạ thì không.
            const ten = String(tham.name || "").trim();
            const chain = loadState().chains.find(c => c.name === ten);
            const chu = typeof chain?.admin === "string" ? chain.admin.trim() : "";
            if (chain && chu !== ai.diaChi) {
              return send(res, 403, {
                error: chu
                  ? `"${ten}" thuộc về ${chu}, không phải ví đang đăng nhập (${ai.diaChi}).`
                  : `"${ten}" là chain mặc định của hệ thống — chỉ người vận hành thu hồi được.`,
              });
            }
          } else {
            tham.admin = ai.diaChi;
          }
        }

        // Đóng tiến trình ở ĐÂY, không ở trong createChain: đường lỗi cũng phải
        // đóng, mà lỗi có thể ném ra từ bất kỳ bước nào. Đóng ở một chỗ duy nhất
        // thì không có nhánh nào để quên.
        let kq;
        try {
          kq = await queue.run(() => laThuHoi ? thuHoiChain(tham) : createChain(tham));
        } catch (e) {
          dongTienTrinh(e);
          throw e;
        }
        dongTienTrinh(null);
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
  // In TRẠNG THÁI CỔNG, không chỉ in khi nó đóng. Một chính sách chặn người dùng mà im
  // lặng ở log là một chính sách không ai biết mình đang chạy — kể cả lúc nó chạy SAI.
  console.log(DE_CHAIN_MO
    ? `  đẻ chain: 🔓 MỞ (A1_DE_CHAIN_MO=1)`
    : `  đẻ chain: 🔒 ĐÓNG — mọi lượt tạo bị từ chối. Mở sau ngày G bằng A1_DE_CHAIN_MO=1 (D-087)`);
  // Same rule, for the invite list: print the STATE, not only the interesting half. An empty
  // list is the fail-closed default and it is indistinguishable from a forgotten variable
  // anywhere except here — so here it says so in words.
  console.log(L1_ALLOWLIST.size
    ? `  mời tạo : ✉️  ${L1_ALLOWLIST.size} ví trong danh sách (A1_L1_ALLOWLIST) · token vận hành không bị chặn`
    : `  mời tạo : 🔒 TRỐNG — KHÔNG ví nào tạo được chain (chỉ token vận hành). Đặt A1_L1_ALLOWLIST=0x…,0x… để mời`);
  // Đo thế hệ NGAY lúc khởi động để người vận hành thấy, nhưng KHÔNG dùng kết quả
  // này làm quyết định: `createChain` đo lại mỗi lượt. Một con số nhớ từ lúc boot
  // sống sót qua đúng thứ nó sinh ra để bắt.
  kiemTheHeMang().then((t) => {
    if (t.trangThai === "khop") console.log(`  thế hệ : ✅ khớp node đang chạy — ${t.vi}`);
    else console.warn(`  thế hệ : 🔴 ${t.trangThai.toUpperCase()} — ĐẺ CHAIN SẼ BỊ TỪ CHỐI.\n           ${t.vi}`);
  });
  console.log(`  auth   : token vận hành (Bearer <A1_CONSOLE_TOKEN>) HOẶC chữ ký ví (SIWE)`);
  console.log(`  ví     : /api/siwe/nonce → /api/siwe/login · domain ${SIWE_DOMAIN}`);
  console.log(`           đăng nhập bằng ví thì admin bị ÉP = địa chỉ ký (không ai gõ tay)`);
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
  } else if (HOST === "127.0.0.1") {
    // Bật TRUST_PROXY khi CHƯA có proxy là đi lùi về mặt an toàn, không phải đi
    // trước: console sẽ tin header `X-Forwarded-For` / `CF-Connecting-IP` do chính
    // client đặt, tức là ai cũng tự khai IP của mình để thoát hạn mức. Chỉ bật
    // ĐỒNG THỜI với lúc đặt Caddy ra trước (M4.5), không bật sớm "cho sẵn".
    console.warn(`  ⚠️  A1_TRUST_PROXY=1 nhưng đang nghe loopback (chưa có proxy nào phía trước).`);
    console.warn(`      Client tự đặt X-Forwarded-For là thoát được hạn mức. Kiểm bằng /whoami.`);
  }
});
