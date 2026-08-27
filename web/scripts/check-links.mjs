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
 * 🔴 ĐƯỜNG LUI `/moi/` ĐÃ TỪNG BIẾN BÀI NÀY THÀNH BÀI KIỂM VÔ DỤNG — 2026-08-27.
 *
 * Bản cũ: thử `/x/`, hỏng thì thử `/moi/x/`, đạt một trong hai là **in ra đường dẫn
 * gốc** kèm ✓. Đường lui đó có từ thời gốc `/` còn là Blockscout và site sống dưới
 * `/moi/`. M10.3 đã đưa site lên gốc, nhưng đường lui ở lại — và `/moi/*` vẫn phục
 * vụ TOÀN BỘ site tĩnh, nên nó **luôn luôn đạt**. Hệ quả: một trang chết ở đường
 * canonical vẫn được báo ✓ kèm đúng `<title>`, vì cái title đó lấy từ alias.
 *
 * Đã trả giá thật: `/re-genesis/` **404 trên mạng công khai** (rơi xuống Blockscout,
 * bị strip trailing slash rồi 404) suốt từ lúc trang ra đời, trong khi mọi lượt
 * `web-deploy.sh` đều in `✓ /re-genesis/ 200`. Dải cảnh báo ngày G nằm trên MỌI
 * trang và trỏ vào đúng đường đó. Nguyên nhân gốc ở `Caddyfile:328` — danh sách
 * `@trangmoi` không có `/re-genesis/*`.
 *
 * Nay: **đường canonical là thứ được chấm.** Alias chỉ dùng để CHẨN ĐOÁN — sống ở
 * alias mà chết ở canonical là một loại hỏng RIÊNG, và nó được gọi đúng tên như
 * vậy, vì nó chỉ thẳng vào một route còn thiếu trong Caddyfile.
 * Đặt `A1_TIEN_TO=` (rỗng) để tắt hẳn phần chẩn đoán này.
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
let chiSongOAlias = 0;
for (const [d, nguon] of [...dich].sort()) {
  const goc = await thu(`${NEN}${d}`);
  const tuDau = [...new Set(nguon)].join(', ');

  if (goc.ok) {
    console.log(`  ✓ ${d.padEnd(18)} ${goc.ma}  · ${goc.tieuDe.slice(0, 46)}`);
    continue;
  }

  // Canonical đã chết. Hỏi alias MỘT câu duy nhất: đây là "chưa deploy" hay là
  // "thiếu route"? Hai thứ đó sửa ở hai nơi khác nhau, nên phải phân biệt được —
  // nhưng cả hai đều là HỎNG, alias sống không cứu được đường canonical.
  const alias = TIEN_TO && !d.startsWith(TIEN_TO) ? await thu(`${NEN}${TIEN_TO}${d}`) : null;
  hong++;
  const maGoc = `${goc.ma}${goc.ma === 200 ? '(khung rỗng)' : ''}`;
  if (alias?.ok) {
    chiSongOAlias++;
    console.log(`  ✗ ${d.padEnd(18)} ${maGoc}  · SỐNG ở ${TIEN_TO}${d} — THIẾU ROUTE, không phải thiếu tệp`);
  } else {
    console.log(`  ✗ ${d.padEnd(18)} ${maGoc}  · dẫn từ: ${tuDau}`);
  }
}

if (chiSongOAlias) {
  console.log(
    `\n🔴 ${chiSongOAlias} đường sống ở "${TIEN_TO}" nhưng chết ở đường canonical.\n` +
      `   Tệp ĐÃ lên server — thiếu là dòng route. Xem \`@trangmoi\` trong Caddyfile:\n` +
      `   danh sách đó phải lớn lên theo mỗi trang mới, và đó đúng là chỗ hay bị quên.`,
  );
}
console.log(hong ? `\n✗ ${hong}/${dich.size} liên kết chết` : `\n✓ ${dich.size}/${dich.size} liên kết sống`);

/* ═══════════════════════════════════════════════════════════════════════════
   CỔNG NGÀY G — chỉ bật bằng `A1_SAU_NGAY_G=1` (Đ1-12, 2026-08-27)

   🔴 VÌ SAO PHẢI CÓ, DÙ ĐÃ CÓ RUNBOOK: bộ đo hiện tại chỉ đòi `<title>` khác rỗng.
   Sau `01/09`, title `A1 sinh lại ngày 01/09/2026` **vẫn khác rỗng** — nên nó xanh
   trên một trang nói ở THÌ TƯƠNG LAI về một việc ĐÃ XẢY RA. Xanh giả, đúng lúc đắt
   nhất, và không ai nhìn ra vì con số cổng vẫn đẹp.

   Cổng này đo NỘI DUNG, và đo ở HAI trang khác nhau có chủ ý: dải banner nằm trong
   layout gốc, nên "trang này đúng, trang kia còn bản cũ" là dấu hiệu `web/out` chép
   thiếu — đúng bẫy inode bind-mount đã cắn `25/08`. Đo một trang thì không thấy.

   Bật bằng biến môi trường chứ không bật mặc định: hôm nay nó PHẢI đỏ (trang đang
   đúng ở thì tương lai), và một cổng đỏ mặc định trong 5 ngày sẽ bị bỏ qua.
   Chạy thử hôm nay để xác nhận nó biết đỏ:
       A1_SAU_NGAY_G=1 node scripts/check-links.mjs
   ═══════════════════════════════════════════════════════════════════════════ */
let hongNgayG = 0;
if (process.env.A1_SAU_NGAY_G === '1') {
  console.log('\n── CỔNG SAU NGÀY G (A1_SAU_NGAY_G=1) ──');
  const doNoiDung = async (duong, chuoi, phaiCo) => {
    let html = '';
    try {
      const r = await fetch(`${NEN}${duong}`, { redirect: 'follow', signal: AbortSignal.timeout(20000) });
      html = await r.text();
    } catch (e) {
      console.log(`  ✗ ${duong} — không tải được: ${e.message}`);
      hongNgayG++;
      return;
    }
    const co = html.includes(chuoi);
    if (co === phaiCo) {
      console.log(`  ✓ ${duong.padEnd(16)} ${phaiCo ? 'CÓ' : 'KHÔNG có'} "${chuoi}"`);
    } else {
      console.log(
        `  ✗ ${duong.padEnd(16)} ${phaiCo ? 'THIẾU' : 'VẪN CÒN'} "${chuoi}"` +
          (phaiCo ? ' — trang chưa được thay bằng bản công bố' : ' — dải banner cũ chưa gỡ'),
      );
      hongNgayG++;
    }
  };
  // Bản công bố đã lên: trang re-genesis nói ở thì QUÁ KHỨ…
  await doNoiDung('/re-genesis/', 'đã sinh lại', true);
  // …và ĐỐI CHỨNG NGƯỢC: dải cảnh báo thì tương lai không còn ở trang khác.
  await doNoiDung('/faucet/', 'sẽ bị xoá', false);
  console.log(hongNgayG ? `\n✗ cổng ngày G: ${hongNgayG} phép đo chưa đạt` : '\n✓ cổng ngày G đạt');
}

process.exit(hong || hongNgayG ? 1 : 0);
