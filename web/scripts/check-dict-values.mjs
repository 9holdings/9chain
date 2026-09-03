#!/usr/bin/env node
/**
 * check-dict-values.mjs — GIÁ TRỊ bản dịch chỉ được đổi khi có người CỐ Ý đổi nó.
 *
 * Ra 0 = khớp sổ. Ra 1 = có bản dịch đổi mà không khai. Ra 2 = không đo được.
 * Ghi lại sổ sau khi đã cố ý sửa bản dịch:  node scripts/check-dict-values.mjs --accept
 *
 * ═══ VÌ SAO CÓ CỔNG NÀY — NÓ ĐÃ ĐỎ THẬT ═══
 * Ngày `2026-09-03`, ba lượt đổi định danh Việt→Anh chạy trên toàn cây `web/`. Từ
 * điển cũng là `.ts`, nên bộ đổi tên coi chúng như mã và đổi **năm** chỗ trong bản
 * tiếng Tây Ban Nha: `Tu monedero` (ví CỦA BẠN) thành `Dict monedero` — vì `tu` nằm
 * trong bảng ánh xạ `tuDien → dict`. Người đọc tiếng Tây Ban Nha nhận một câu vô
 * nghĩa ở bốn màn, trong đó có nhãn ô nhập địa chỉ ví của faucet.
 *
 * 🔴 **Không một cổng nào trong cây này thấy được**, vì không cổng nào đọc NỘI DUNG
 * bản dịch:
 *   • `tsc` xanh — `'Dict monedero'` là một chuỗi hợp lệ y như mọi chuỗi khác.
 *   • `i18n-shape` xanh — nó so BỘ KHOÁ và BỘ CHỖ GIỮ CHỖ giữa 30 từ điển, không so chữ.
 *   • `check-interpolate` xanh — chuỗi này không có chỗ giữ chỗ nào.
 *   • build/axe/budget xanh — chữ vẫn là chữ, dài ngắn không đổi.
 * Đây đúng lớp lỗi "mọi cổng xanh vì cùng đo sai đại lượng". Cổng duy nhất bắt được
 * là cổng đọc chính chữ mà người ta sẽ đọc, và nhớ nó từng là chữ gì.
 *
 * ═══ NÓ LÀ BÁNH CÓC, KHÔNG PHẢI ĐÓNG BĂNG ═══
 * Thêm khoá mới thì **cho qua** (in ra để biết) — vì `i18n-shape` đã canh bộ khoá 30
 * ngôn ngữ phải khớp `en`, và một lượt đổi tên không bao giờ THÊM khoá. Đổi giá trị
 * một khoá đã có thì **chặn**, cho tới khi có người chạy `--accept`. Chiều đó có chủ
 * ý: việc tôi làm hằng ngày (thêm khoá) không bị hỏi, còn việc hiếm và nguy hiểm
 * (chữ đã dịch tự nhiên khác đi) thì phải có người ký.
 *
 * ⚠️ RANH GIỚI: cổng đọc được chuỗi một dòng VÀ chuỗi nối nhiều dòng (`'…' + '…'`).
 * Nó **không** đọc được giá trị dựng bằng biến hay hàm. Bản quét đầu tiên tôi viết
 * chỉ đọc một dòng, và đúng vì thế nó bỏ sót 1 trong 5 chỗ hỏng tiếng Tây Ban Nha —
 * chỗ duy nhất nằm trong chuỗi nối. Cổng đếm và KHAI RA số giá trị nó không đọc nổi;
 * một cổng im lặng bỏ qua thứ nó không hiểu là cổng nói dối về độ phủ.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const I18N = path.join(WEB, 'lib/i18n');
const DICTS = path.join(I18N, 'dicts');
const LOCK = path.join(I18N, 'values.lock.json');
const ACCEPT = process.argv.includes('--accept');
// `--list-skipped` in ra ĐÍCH DANH những giá trị bộ đọc không dựng lại được, để người
// đọc tự thẩm phần cổng này KHÔNG canh — thay vì tin một con số tổng.
const LIST_SKIPPED = process.argv.includes('--list-skipped');

const fail = (m) => {
  console.error(`✗ ${m}`);
  process.exitCode = 1;
};
const cannotMeasure = (m) => {
  console.error(`? KHÔNG ĐO ĐƯỢC — ${m}`);
  process.exitCode = 2;
};

/**
 * Đọc một tệp từ điển thành `{ "group.key": value }`.
 *
 * Cắt chú thích trước, rồi đi theo dòng: `  group: {` mở nhóm, `key: 'giá trị'` là
 * một mục, và một dòng kết thúc bằng `+` thì nối tiếp dòng sau. Trả kèm `skipped`:
 * số mục có giá trị mà bộ đọc này không dựng lại được thành chuỗi thuần.
 */
function readDict(file) {
  const src = readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '');
  const lines = src.split(/\r?\n/);
  const out = {};
  let group = '?';
  let skipped = 0;

  for (let i = 0; i < lines.length; i++) {
    const g = /^ {2}(\w+): \{/.exec(lines[i]);
    if (g) {
      group = g[1];
      continue;
    }
    const m = /^\s*(\w+):\s*(.*)$/.exec(lines[i]);
    if (!m || m[2].startsWith('{')) continue;

    // Gom cả biểu thức giá trị. Hai kiểu xuống dòng đều phải đọc được:
    //   • `key:` rồi giá trị bắt đầu ở DÒNG SAU  (prettier làm thế khi dòng quá dài)
    //   • `'…' +` nối sang dòng sau
    // 🔴 Bản đầu bỏ hẳn kiểu thứ nhất — và đúng chỗ đó là nơi lỗi `Dict monedero`
    // thứ năm nằm, nên cổng XANH khi tôi tiêm lại lỗi thật để thử. Một cổng bỏ qua
    // im lặng thứ nó không đọc được thì không chứng minh gì.
    let expr = m[2];
    let j = i;
    while ((expr.trim() === '' || /\+\s*$/.test(expr)) && j + 1 < lines.length) {
      expr += lines[++j].trim();
    }
    i = j;
    expr = expr.replace(/,\s*$/, '').trim();

    // Chỉ nhận chuỗi thuần và phép nối chuỗi thuần. CẢ HAI kiểu nháy: bản dịch dùng
    // nháy kép mỗi khi trong câu có dấu nháy đơn (`"9Chain's public testnet…"`), và
    // bản đầu chỉ đọc nháy đơn nên bỏ trắng 8 câu — một trong số đó là
    // `common.shortDesc`, câu đứng ngay dưới `<h1>` của trang chủ.
    const LIT = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g;
    const parts = [...expr.matchAll(LIT)].map((x) => x[0].slice(1, -1));
    const noiSach = parts.length > 0 && expr.replace(LIT, '').replace(/[+\s]/g, '') === '';
    if (!noiSach) {
      if (/^['"`]/.test(expr)) {
        skipped++;
        if (LIST_SKIPPED) console.log(`  … ${path.basename(file)}  ${group}.${m[1]}  ${expr.slice(0, 72)}`);
      }
      continue;
    }
    out[`${group}.${m[1]}`] = parts.join('');
  }
  return { values: out, skipped };
}

const short = (s) => createHash('sha1').update(s, 'utf8').digest('hex').slice(0, 12);

// ── đọc cả 30 ────────────────────────────────────────────────────────────────
if (!existsSync(DICTS)) {
  cannotMeasure(`không thấy ${path.relative(WEB, DICTS)}`);
  process.exit(process.exitCode);
}
const files = [
  ['en', path.join(I18N, 'en.ts')],
  ...readdirSync(DICTS)
    .filter((f) => f.endsWith('.ts'))
    .map((f) => [f.slice(0, -3), path.join(DICTS, f)]),
];

const now = {};
let tongSkipped = 0;
let tongKey = 0;
for (const [lang, file] of files) {
  const { values, skipped } = readDict(file);
  if (Object.keys(values).length === 0) {
    cannotMeasure(`${lang}: đọc ra 0 chuỗi — bộ đọc không hiểu tệp này`);
    process.exit(process.exitCode);
  }
  now[lang] = values;
  tongSkipped += skipped;
  tongKey += Object.keys(values).length;
}

// ── ghi sổ ───────────────────────────────────────────────────────────────────
if (ACCEPT) {
  const lock = {};
  for (const lang of Object.keys(now).sort()) {
    lock[lang] = {};
    for (const k of Object.keys(now[lang]).sort()) lock[lang][k] = short(now[lang][k]);
  }
  writeFileSync(LOCK, JSON.stringify(lock, null, 1) + '\n', 'utf8');
  console.log(`✓ đã ghi sổ ${path.relative(WEB, LOCK)} — ${files.length} ngôn ngữ · ${tongKey} chuỗi`);
  process.exit(0);
}

// ── đối chiếu ────────────────────────────────────────────────────────────────
if (!existsSync(LOCK)) {
  cannotMeasure(`chưa có sổ ${path.relative(WEB, LOCK)} — chạy \`--accept\` một lần để lập`);
  process.exit(process.exitCode);
}
const lock = JSON.parse(readFileSync(LOCK, 'utf8'));

let doi = 0;
let them = 0;
let mat = 0;
for (const lang of Object.keys(now)) {
  const cu = lock[lang];
  if (!cu) {
    console.log(`  + ${lang}: ngôn ngữ mới, chưa có trong sổ`);
    them += Object.keys(now[lang]).length;
    continue;
  }
  for (const [k, v] of Object.entries(now[lang])) {
    if (!(k in cu)) {
      them++;
      continue;
    }
    if (cu[k] !== short(v)) {
      doi++;
      fail(`${lang}  ${k}  — bản dịch đã đổi mà không ai khai`);
      console.error(`      nay: ${JSON.stringify(v.slice(0, 90))}`);
    }
  }
  for (const k of Object.keys(cu)) if (!(k in now[lang])) mat++;
}

if (doi) {
  console.error(
    `\n${doi} bản dịch đổi ngoài sổ. Nếu đó là CỐ Ý: \`node scripts/check-dict-values.mjs --accept\`.\n` +
      `Nếu KHÔNG: nhiều khả năng một lượt đổi tên/thay chuỗi vừa chạy trúng \`lib/i18n/\` — xem đầu tệp này.`,
  );
} else {
  console.log(
    `✓ ${tongKey} chuỗi khớp sổ (${files.length} ngôn ngữ)` +
      `${them ? ` · ${them} khoá mới chưa ghi sổ` : ''}` +
      `${mat ? ` · ${mat} khoá trong sổ nay không còn` : ''}` +
      `${tongSkipped ? ` · ${tongSkipped} giá trị bộ đọc KHÔNG đọc được` : ''}`,
  );
}
