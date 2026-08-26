/**
 * check-links.mjs — mọi liên kết nội bộ trên trang đã deploy phải sống.
 *
 * ═══ VÌ SAO CẦN MỘT PHÉP ĐO RIÊNG ═══
 * Trang này trỏ sang ba loại đích khác nhau, và chỉ MỘT loại được Next kiểm:
 *   1. route của chính bản export (`/faucet/`, `/create-chain/`) — build sẽ đỏ nếu thiếu;
 *   2. đường do **Caddy** phục vụ từ dịch vụ khác (`/console/`, `/chains/`) — Next
 *      không biết chúng tồn tại, nên gõ sai là **404 im lặng**;
 *   3. tên miền ngoài (9Scan) — đổi bên kia thì bên này không hay biết.
 * Loại (2) là chỗ nguy hiểm: nó trông y hệt loại (1) trong mã.
 *
 * Chạy SAU khi deploy, đo qua tên miền công khai:
 *   node web/scripts/check-links.mjs [https://a1.9chain.org]
 *
 * ⚠️ Trang mới hiện phục vụ dưới tiền tố `/moi/` (gốc `/` vẫn là Blockscout cho tới
 * khi M10.3 chốt). Nên đường dẫn tuyệt đối trong HTML được thử ở CẢ hai chỗ: nguyên
 * gốc và có tiền tố. Chỉ cần một trong hai sống là đủ — bỏ vế thứ hai thì mọi liên
 * kết nội bộ sẽ báo đỏ oan.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RA = path.join(GOC, 'out');
const NEN = (process.argv[2] || 'https://a1.9chain.org').replace(/\/$/, '');
const TIEN_TO = process.env.A1_TIEN_TO ?? '/moi';

if (!existsSync(RA)) {
  console.error('✗ chưa có out/ — chạy `pnpm build` trước');
  process.exit(1);
}

function quet(dir, ra = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) quet(p, ra);
    else if (e.name.endsWith('.html')) ra.push(p);
  }
  return ra;
}

const dich = new Map(); // đường dẫn -> [trang nguồn]
for (const f of quet(RA)) {
  const tu = path.relative(RA, f).replace(/\\/g, '/');
  for (const m of readFileSync(f, 'utf8').matchAll(/href="(\/[^"#?]*)"/g)) {
    const d = m[1];
    // Bỏ tài nguyên tĩnh: chúng đã được `web-deploy.sh` kiểm bằng một chunk thật.
    if (d.startsWith('/_next/') || /\.(css|js|png|svg|ico|webmanifest)$/.test(d)) continue;
    if (!dich.has(d)) dich.set(d, []);
    dich.get(d).push(tu);
  }
}

/**
 * 🔴 ĐO NỘI DUNG, KHÔNG ĐO MÃ TRẠNG THÁI.
 *
 * Gốc `/` là Blockscout, và nó là SPA: mọi đường dẫn lạ đều trả **HTTP 200** kèm
 * khung rỗng, không phải 404. Nên một bài kiểm liên kết chỉ nhìn mã sẽ **toàn màu
 * xanh** trong khi người dùng bấm vào và thấy trang trắng — đã ra xanh giả đúng thế
 * 2026-08-25 với `/tc-a/` và `/create-chain/`.
 *
 * Dấu hiệu "đúng trang": có `<title>` KHÔNG rỗng. Trang của ta luôn có; khung rỗng
 * của Blockscout thì không.
 */
async function thu(url) {
  try {
    const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000) });
    if (r.status < 200 || r.status >= 400) return { ma: r.status, ok: false };
    const html = await r.text();
    const tieuDe = /<title>([^<]*)<\/title>/.exec(html)?.[1]?.trim() ?? '';
    return { ma: r.status, ok: tieuDe.length > 0, tieuDe };
  } catch {
    return { ma: 0, ok: false };
  }
}

let hong = 0;
for (const [d, nguon] of [...dich].sort()) {
  const thuCac = [`${NEN}${d}`, ...(TIEN_TO && !d.startsWith(TIEN_TO) ? [`${NEN}${TIEN_TO}${d}`] : [])];
  let dat = null;
  const daThu = [];
  for (const u of thuCac) {
    const kq = await thu(u);
    daThu.push(`${kq.ma}${kq.ok ? '' : kq.ma === 200 ? '(khung rỗng)' : ''}`);
    if (kq.ok) { dat = kq; break; }
  }
  if (dat) {
    console.log(`  ✓ ${d.padEnd(18)} ${dat.ma}  · ${dat.tieuDe.slice(0, 46)}`);
  } else {
    hong++;
    console.log(`  ✗ ${d.padEnd(18)} ${daThu.join(' / ')}  · dẫn từ: ${[...new Set(nguon)].join(', ')}`);
  }
}

console.log(hong ? `\n✗ ${hong}/${dich.size} liên kết chết` : `\n✓ ${dich.size}/${dich.size} liên kết sống`);
process.exit(hong ? 1 : 0);
