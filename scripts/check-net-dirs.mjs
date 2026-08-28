#!/usr/bin/env node
/**
 * check-net-dirs.mjs — **cổng canh: thư mục `local-net/net*` nào thuộc thế hệ nào, và
 * thư mục nào đang giữ TIỀN THẬT.**
 *
 * 🔴 VÌ SAO CÓ. Đo `2026-08-28` trên máy dev: **9 thư mục `net*`, 3 thế hệ trộn lẫn**, và
 * cách đặt tên nói ngược sự thật:
 *
 *   - `net-public/` — nghe như *"mạng công khai"* — genesis khai `networkID 9001`,
 *     **thế hệ đã chết từ 27/08**. Nhưng `chain-factory-key.txt` **cùng thư mục** là khoá
 *     `g0` **đang giữ 89,899 LOVE9 thật** (sha256 khoá `1dc334145c8a1abc`, khớp D-092).
 *   - `net-public-dead-720m/` — tên tự khai là đồ chết — giữ **bản TRÙNG BYTE** của chính
 *     khoá đó.
 *   - `net-that-g0/` — thư mục **duy nhất** khai `999999999` = mạng đang chạy — **KHÔNG**
 *     có `chain-factory-key.txt`.
 *
 * ⇒ Một lượt dọn *"xoá mấy thư mục 9001 đi"* **shred mất khoá sống**. Đó đúng là lớp lỗi
 * gotcha 17 / D-107: *"đã có bản lưu rồi nên xoá được"* là một **PHÉP ĐO**, không phải câu
 * trấn an — và ở đây phép đo đó chưa ai chạy.
 *
 * ## Cổng này đo ĐẠI LƯỢNG NÀO
 *
 * **Không tin tên thư mục, không tin `allocation.md`, không tin trí nhớ.** Hai phép đo độc lập:
 *
 * | Câu hỏi | Đo bằng | Ở đâu |
 * |---|---|---|
 * | Thư mục này thuộc thế hệ nào? | `genesis.json → networkID` | ĐĨA |
 * | Tệp này có giữ tiền thật không? | `platform.getBalance` trên **RPC mạng đang chạy** | CHAIN |
 *
 * Hai phép đo **cắt nhau** mới ra được cái bẫy: *địa chỉ CÓ TIỀN nằm trong thư mục KHÔNG
 * thuộc thế hệ đang chạy*. Chỉ đo một vế thì thư mục chết trông sạch để xoá.
 *
 * 🔴 **KHÔNG ĐỌC, KHÔNG IN, KHÔNG GỬI ĐI KHOÁ RIÊNG NÀO.** Chỉ bốc địa chỉ `P-…`/`X-…` ra
 * khỏi tệp rồi hỏi chain. Dòng nào trông giống khoá riêng bị **loại bỏ trước khi in**.
 *
 * ## Mã thoát (quy ước dùng chung cả bộ)
 *
 *   0  ĐẠT          — mọi thư mục khai được thế hệ, và không thư mục "chết" nào giữ tiền
 *   1  SAI          — có ít nhất một BẪY: tiền thật nằm trong thư mục không phải thế hệ sống
 *   2  CHƯA KẾT LUẬN — không đọc được genesis, hoặc không hỏi được chain (⚠️ KHÔNG phải "sạch")
 *
 * Dùng:
 *   node scripts/check-net-dirs.mjs
 *   node scripts/check-net-dirs.mjs --rpc https://rpc-a1.9chain.org
 *   node scripts/check-net-dirs.mjs --offline     # bỏ vế chain ⇒ tối đa là exit 2
 *   node scripts/check-net-dirs.mjs --self-test   # đối chứng ngược — cổng phải biết báo ĐỎ
 */
import { readFileSync, existsSync, readdirSync, statSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { A1_ID_GOC, A1_GEN, TEN_MANG } from "../local-net/lib/chainid.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};
const RPC = flag("--rpc", "https://rpc-a1.9chain.org");
const OFFLINE = argv.includes("--offline");
const SELF_TEST = argv.includes("--self-test");

/** networkID của mạng ĐANG CHẠY, suy ra từ nguồn sự thật — không chép tay. */
const LIVE_NETWORK_ID = A1_ID_GOC - A1_GEN;
/** Đỉnh băng TẬP. Băng tập không bao giờ bắt tay được băng thật. */
const TEST_BAND_TOP = 899_999_999;
const BAND_WIDTH = 999; // A1Gen chạy 0…999

/** Bí danh tài sản X-Chain. DỨT KHOÁT là `LOVE9`, không có `AVAX` (D-084 · patch 0022). */
const ASSET_ALIAS = "LOVE9";
const SECRET_NAMES = /^(keys\.txt|faucet\.env|staker\.(key|crt)|.*key.*\.txt)$/i;
/** Hình dạng khoá riêng — dùng để LOẠI BỎ khỏi mọi thứ sẽ in ra. */
const PRIVATE_KEY_SHAPE = /(PrivateKey-[A-Za-z0-9]+|0x[0-9a-fA-F]{64})/g;
const BECH32_ADDR = /\b([PX]-[a-z0-9]{1,20}1[02-9ac-hj-np-z]{20,})\b/g;

/** Bốc địa chỉ ra khỏi văn bản, sau khi đã xoá mọi thứ mang hình dạng khoá riêng. */
export function extractAddresses(text) {
  const scrubbed = text.replace(PRIVATE_KEY_SHAPE, "<KHOÁ-ĐÃ-LOẠI>");
  return [...new Set([...scrubbed.matchAll(BECH32_ADDR)].map((m) => m[1]))];
}

/**
 * Thân bech32 (bỏ tiền tố chain). `X-love9abc…` và `P-love9abc…` cùng một ví ⇒ cùng một
 * thân ⇒ hỏi chain **một lần**, không hai. Gộp ở đây tránh đếm trùng một ví thành hai bẫy.
 */
export function addressBody(addr) {
  return addr.replace(/^[PX]-/, "");
}

/** Phân loại một networkID về ba băng. Không đoán theo tên thư mục. */
export function classifyNetworkId(networkId) {
  if (networkId === LIVE_NETWORK_ID) return "live";
  if (networkId <= A1_ID_GOC && networkId > A1_ID_GOC - BAND_WIDTH - 1) return "real-band-other-gen";
  if (networkId <= TEST_BAND_TOP && networkId > TEST_BAND_TOP - BAND_WIDTH - 1) return "test-band";
  return "dead";
}

const LABEL = {
  live: "✅ THẾ HỆ ĐANG CHẠY",
  "real-band-other-gen": "🟡 băng THẬT, thế hệ khác",
  "test-band": "🧪 băng TẬP",
  dead: "⚫ ngoài mọi băng — đã chết",
};

/** Đọc một thư mục net*: thế hệ + tệp bí mật + địa chỉ tìm được. */
export function readNetDir(dir) {
  const out = { dir, networkId: null, band: null, secrets: [], addresses: [], error: null };
  const genesis = path.join(dir, "genesis.json");
  if (!existsSync(genesis)) {
    out.error = "không có genesis.json";
    return out;
  }
  try {
    const g = JSON.parse(readFileSync(genesis, "utf8"));
    if (typeof g.networkID !== "number") throw new Error("genesis.json không có networkID kiểu số");
    out.networkId = g.networkID;
    out.band = classifyNetworkId(g.networkID);
  } catch (e) {
    out.error = e.message;
    return out;
  }
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (!statSync(full).isFile()) continue;
    if (SECRET_NAMES.test(name)) out.secrets.push(name);
    if (/\.(txt|md|env)$/i.test(name)) {
      try {
        for (const addr of extractAddresses(readFileSync(full, "utf8"))) {
          const body = addressBody(addr);
          // Cùng một ví xuất hiện ở nhiều tệp/nhiều tiền tố ⇒ giữ MỘT mục, ghi kèm mọi
          // tệp khai nó. Đếm trùng làm một ví hoá thành nhiều "bẫy" và thổi phồng báo động.
          const seen = out.addresses.find((a) => a.body === body);
          if (seen) { if (!seen.files.includes(name)) seen.files.push(name); }
          else out.addresses.push({ body, files: [name] });
        }
      } catch { /* tệp nhị phân — bỏ qua, không phải lỗi */ }
    }
  }
  return out;
}

async function rpc(chainPath, method, params) {
  const res = await fetch(`${RPC}${chainPath}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();
  if (j.error) throw new Error(j.error.message ?? "lỗi RPC");
  return j.result;
}

/**
 * Số dư của MỘT ví, đo trên CẢ HAI chain.
 *
 * 🔴 Thân bech32 giống nhau ở mọi chain — `X-love9abc…` và `P-love9abc…` là **cùng một ví**.
 * Nhưng mỗi chain giữ sổ riêng, và `platform.getBalance` **từ chối thẳng** một địa chỉ `X-`
 * (`mismatched chainIDs`). Chỉ hỏi P rồi kết luận "0" là **đo sai đại lượng**: một ví chỉ có
 * tiền trên X sẽ đọc ra sạch, và thư mục chứa nó trông an toàn để xoá.
 */
export async function walletBalance(body, ask = rpc) {
  let total = 0n;
  const errors = [];
  // `balance` của P-Chain ĐÃ GỘP phần khoá — đo được trên quỹ Community: `balance` =
  // `lockedStakeable` = 2.600.000.001. Nên không cần cộng tay từng ô, và cũng KHÔNG được
  // đọc riêng `unlocked` (quỹ khoá sẽ ra 0 và thư mục giữ nó trông sạch để xoá).
  try {
    const r = await ask("/ext/bc/P", "platform.getBalance", { addresses: [`P-${body}`] });
    total += BigInt(r?.balance ?? "0");
  } catch (e) { errors.push(`P: ${e.message}`); }
  try {
    const r = await ask("/ext/bc/X", "avm.getBalance", { address: `X-${body}`, assetID: ASSET_ALIAS });
    total += BigInt(r?.balance ?? "0");
  } catch (e) { errors.push(`X: ${e.message}`); }
  // 🔴 MỘT vế hỏng cũng KHÔNG được cộng thành một con số. Quỹ Foundation g0 đo được P = 0
  // và X = 70.999.918 ⇒ nếu vế X hỏng mà ta vẫn trả `0`, thư mục giữ khoá đó đọc ra SẠCH.
  // "Không đo được" là CHƯA KẾT LUẬN, không phải "không có tiền". (null ≠ [])
  if (errors.length) throw new Error(errors.join(" · "));
  return total;
}

async function main() {
  if (SELF_TEST) return selfTest();

  console.log(`\n══ THƯ MỤC MẠNG — ${ROOT}/local-net ══`);
  console.log(`   mạng đang chạy: networkID ${LIVE_NETWORK_ID} · ${TEN_MANG} (A1Gen ${A1_GEN})`);
  console.log(`   ${OFFLINE ? "⚠️  --offline: BỎ vế đo trên chain" : `RPC: ${RPC}`}\n`);

  const base = path.join(ROOT, "local-net");
  const dirs = readdirSync(base)
    .filter((n) => n === "net" || n.startsWith("net-"))
    .map((n) => path.join(base, n))
    .filter((p) => statSync(p).isDirectory())
    .sort();

  if (dirs.length === 0) {
    console.log("  (không có thư mục net* nào — máy này chưa sinh mạng)");
    return 0;
  }

  const reports = dirs.map(readNetDir);
  let unresolved = reports.filter((r) => r.error).length;
  const traps = [];
  const decoys = [];

  for (const r of reports) {
    const name = path.basename(r.dir);
    if (r.error) {
      console.log(`  ⁇ ${name.padEnd(26)} CHƯA KẾT LUẬN — ${r.error}`);
      continue;
    }
    console.log(`  ${name.padEnd(26)} networkID ${String(r.networkId).padEnd(11)} ${LABEL[r.band]}`);
    if (r.secrets.length) console.log(`     bí mật: ${r.secrets.join(" · ")}`);

    if (OFFLINE) {
      if (r.addresses.length) {
        unresolved++;
        console.log(`     ⁇ ${r.addresses.length} địa chỉ CHƯA đo trên chain (--offline)`);
      }
      continue;
    }

    let funded = 0;
    for (const { body, files } of r.addresses) {
      let bal;
      try {
        bal = await walletBalance(body);
      } catch (e) {
        unresolved++;
        console.log(`     ⁇ ${body.slice(0, 18)}… KHÔNG hỏi được chain (${e.message})`);
        continue;
      }
      if (bal === 0n) continue;
      funded++;
      const love9 = Number(bal) / 1e9;
      const where = `${files.join("+")} → ${body.slice(0, 18)}…`;
      if (r.band === "live") {
        console.log(`     ✓ ${where} giữ ${love9.toLocaleString("vi-VN")} LOVE9 (đúng thư mục)`);
      } else {
        traps.push({ dir: name, files, body, love9, band: r.band });
        console.log(`     🔴 BẪY — ${where} giữ ${love9.toLocaleString("vi-VN")} LOVE9`);
        console.log(`             …trong thư mục ${LABEL[r.band]}. Xoá thư mục này là MẤT TIỀN.`);
      }
    }
    if (r.addresses.length && funded === 0) {
      if (r.band === "live") {
        // 🔴 MỒI NHỬ. Thư mục khai ĐÚNG networkID của mạng đang chạy nhưng không ví nào
        // có tiền ⇒ đây là bộ khoá của một lượt sinh mạng KHÁC ở cùng băng. Nguy hiểm hơn
        // bộ 9001 đã chết: ở đó `networkID` lệch nên còn có thứ để cảnh báo, còn ở đây
        // networkID KHỚP — `kiem-khoa` sẽ chấm 6/6 ✓ và không cổng nào kêu. Đúng thứ bị
        // cất nhầm thành "bản sao lưu khoá quỹ" của O1/B-16.
        decoys.push({ dir: name, wallets: r.addresses.length });
        console.log(`     🔴 MỒI NHỬ — networkID KHỚP mạng đang chạy nhưng ${r.addresses.length} ví đều 0đ`);
        console.log(`             ⇒ bộ khoá của một lượt sinh mạng KHÁC. ĐỪNG cất cái này làm bản sao lưu quỹ.`);
      } else {
        console.log(`     · ${r.addresses.length} ví, tất cả số dư 0 trên mạng đang chạy`);
      }
    }
  }

  console.log();
  if (decoys.length) {
    console.log(`🔴 SAI — ${decoys.length} thư mục là MỒI NHỬ (networkID khớp mạng sống, tiền = 0):`);
    for (const d of decoys) console.log(`   ${d.dir}/ — ${d.wallets} ví, không ví nào có tiền`);
    console.log(`\n   ⇒ Bộ khoá quỹ THẬT của g0 nằm ở C:\\Users\\abc\\9chain-a1-keys\\g0\\.`);
    console.log(`     Nghiệm thu bằng \`node scripts/o1-kiem.mjs <thư-mục>\`, đừng chấm bằng tên thư mục.`);
  }
  if (traps.length) {
    console.log(`🔴 SAI — ${traps.length} tệp giữ TIỀN THẬT nằm ngoài thư mục của thế hệ đang chạy:`);
    for (const t of traps) console.log(`   ${t.dir}/${t.files.join("+")} — ${t.love9.toLocaleString("vi-VN")} LOVE9`);
    console.log(`\n   ⇒ ĐỪNG xoá theo thư mục. Di dời khoá về thư mục thế hệ sống TRƯỚC,`);
    console.log(`     đối chứng \`sha256\` TỪNG TỆP, rồi mới dọn. (gotcha 17 · D-107)`);
    return 1;
  }
  if (decoys.length) return 1;
  if (unresolved) {
    console.log(`⁇ CHƯA KẾT LUẬN — ${unresolved} mục không đo được.`);
    console.log(`   "không đo được" KHÔNG phải "sạch". Chạy lại khi hỏi được chain.`);
    return 2;
  }
  console.log(`✅ ĐẠT — ${reports.length} thư mục đều khai được thế hệ, không thư mục chết nào giữ tiền.`);
  return 0;
}

/** Đối chứng ngược — cổng này phải ĐỎ khi đáng đỏ, và ĐỎ VÌ ĐÚNG LÝ DO. */
async function selfTest() {
  let pass = 0;
  let fail = 0;
  const ok = (name, cond, seen) => {
    if (cond) { pass++; console.log(`  ✓ ${name}`); }
    else { fail++; console.log(`  ✗ ${name}  — đo được: ${seen}`); }
  };

  console.log("\n══ ĐỐI CHỨNG NGƯỢC — check-net-dirs ══\n");

  console.log("── 1. Phân băng ──");
  ok("networkID mạng đang chạy ⇒ live", classifyNetworkId(LIVE_NETWORK_ID) === "live", classifyNetworkId(LIVE_NETWORK_ID));
  ok("🔴 9001 (thế hệ đã chết) ⇒ KHÔNG phải live", classifyNetworkId(9001) !== "live", classifyNetworkId(9001));
  ok("🔴 9001 rơi vào 'dead', không lọt băng nào", classifyNetworkId(9001) === "dead", classifyNetworkId(9001));
  ok("🔴 899999999 ⇒ băng TẬP, KHÔNG phải live", classifyNetworkId(899_999_999) === "test-band", classifyNetworkId(899_999_999));
  ok("🔴 999999998 (thế hệ SAU) ⇒ băng thật nhưng KHÔNG live", classifyNetworkId(999_999_998) === "real-band-other-gen", classifyNetworkId(999_999_998));

  console.log("\n── 2. Không bao giờ để lọt khoá riêng ra ngoài ──");
  const leaky = `P-love91vgh2whn746dzzvg0dj4w9rsqvlalcldvpueuvj\nPrivateKey-abcDEF123\n0x${"a".repeat(64)}`;
  const got = extractAddresses(leaky);
  ok("🔴 chuỗi PrivateKey-… KHÔNG lọt vào kết quả", !got.some((a) => a.includes("PrivateKey")), got.join(","));
  ok("🔴 khoá EVM 0x+64hex KHÔNG lọt vào kết quả", !got.some((a) => /^0x/.test(a)), got.join(","));
  ok("địa chỉ P- thì VẪN bốc ra được", got.length === 1 && got[0].startsWith("P-love9"), got.join(","));

  console.log("\n── 3. Một vế chain hỏng KHÔNG được cộng thành 0 ──");
  // Ca có thật: quỹ Foundation g0 đo được P = 0 và X = 70.999.918 LOVE9. Nếu vế X hỏng mà
  // cổng vẫn trả `0`, thư mục giữ khoá đó đọc ra SẠCH và bị dọn đi.
  const askBoth = async (p) => (p === "/ext/bc/P" ? { balance: "0" } : { balance: "70999918989000000" });
  const askXBroken = async (p) => {
    if (p === "/ext/bc/P") return { balance: "0" };
    throw new Error("giả vờ X sập");
  };
  const results = [];
  await walletBalance("love9test", askBoth).then((v) => results.push(["ca-lanh", v]), (e) => results.push(["ca-lanh-LOI", e.message]));
  await walletBalance("love9test", askXBroken).then((v) => results.push(["x-hong", v]), (e) => results.push(["x-hong-NEM", e.message]));
  ok("hai vế lành ⇒ cộng đúng tổng (tiền nằm bên X vẫn thấy)",
    results[0][0] === "ca-lanh" && results[0][1] === 70999918989000000n, String(results[0][1]));
  ok("🔴 vế X sập ⇒ NÉM LỖI, KHÔNG trả 0 (không đo được ≠ không có tiền)",
    results[1][0] === "x-hong-NEM", String(results[1][1]));

  console.log("\n── 4. Đọc thư mục — ca dựng tay ──");
  const tmp = mkdtempSync(path.join(os.tmpdir(), "a1-netdirs-"));
  try {
    const dead = path.join(tmp, "net-looks-official");
    const live = path.join(tmp, "net-that-g0");
    for (const d of [dead, live]) mkdirSync(d, { recursive: true });
    writeFileSync(path.join(dead, "genesis.json"), JSON.stringify({ networkID: 9001 }));
    writeFileSync(path.join(dead, "chain-factory-key.txt"),
      "PrivateKey-KHONGCOTHAT\n  P-addr : P-love91vgh2whn746dzzvg0dj4w9rsqvlalcldvpueuvj\n");
    writeFileSync(path.join(live, "genesis.json"), JSON.stringify({ networkID: LIVE_NETWORK_ID }));

    const rDead = readNetDir(dead);
    ok("🔴 thư mục TÊN nghe chính thức vẫn bị chấm theo genesis, không theo tên",
      rDead.band === "dead", `${rDead.band}`);
    ok("bắt được tệp bí mật trong thư mục chết",
      rDead.secrets.includes("chain-factory-key.txt"), rDead.secrets.join(","));
    ok("bốc được địa chỉ P- để đem đi hỏi chain",
      rDead.addresses.some((a) => a.body.startsWith("love9")), JSON.stringify(rDead.addresses));
    ok("🔴 và KHÔNG bốc kèm khoá riêng nằm ngay dòng trên",
      !JSON.stringify(rDead.addresses).includes("PrivateKey"), JSON.stringify(rDead.addresses));

    const rLive = readNetDir(live);
    ok("ĐỐI CHỨNG — thư mục khớp networkID sống ⇒ live", rLive.band === "live", rLive.band);

    const broken = path.join(tmp, "net-broken");
    mkdirSync(broken, { recursive: true });
    writeFileSync(path.join(broken, "genesis.json"), "{ khong phai json");
    ok("🔴 genesis hỏng ⇒ CHƯA KẾT LUẬN, KHÔNG chấm là sạch",
      readNetDir(broken).error !== null, String(readNetDir(broken).error));

    const noGenesis = path.join(tmp, "net-no-genesis");
    mkdirSync(noGenesis, { recursive: true });
    ok("🔴 thiếu genesis.json ⇒ CHƯA KẾT LUẬN, KHÔNG chấm là sạch",
      readNetDir(noGenesis).error !== null, String(readNetDir(noGenesis).error));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  console.log(`\n${fail === 0 ? "✅" : "🔴"} ${pass} đạt · ${fail} hỏng`);
  return fail === 0 ? 0 : 1;
}

main().then((code) => process.exit(code)).catch((e) => {
  console.error(`\n🔴 ${e.stack ?? e.message}`);
  process.exit(2);
});
