#!/usr/bin/env node
/**
 * check-interpolate.mjs — mọi lời gọi `interpolate()` phải cấp ĐÚNG bộ chỗ giữ chỗ
 * mà chuỗi của nó khai.
 *
 * Ra 0 = khớp. Ra 1 = lệch. Ra 2 = không đo được.
 *
 * ═══ VÌ SAO CỔNG NÀY PHẢI CÓ TRƯỚC KHI ĐỔI TÊN CHỖ GIỮ CHỖ ═══
 * `interpolate(s, o)` chỉ thay những khoá nó tìm thấy trong `o`. Khoá lệch một chữ
 * thì nó **không báo gì**: chuỗi đi ra nguyên văn `{date}` giữa câu, người đọc thấy
 * một dấu ngoặc lạ, và không có gì trong cây này bắt được —
 *   • `tsc` không thấy: tham số thứ hai là `Record<string, …>`, mọi khoá đều hợp kiểu.
 *   • `i18n-shape` không thấy: nó so chỗ giữ chỗ GIỮA 30 TỪ ĐIỂN với nhau, tức nó
 *     bắt được "bản dịch làm mất `{ngay}`" nhưng mù với "chỗ gọi truyền `{date}`".
 *   • axe/build/test không thấy: chuỗi vẫn là chuỗi.
 * Đây đúng lớp lỗi mà lát đổi tên `2026-09-03` sắp đi vào, nên đo trước rồi mới sửa.
 *
 * ═══ ĐO HAI CHIỀU ═══
 *   • chuỗi khai `{x}` mà lời gọi KHÔNG cấp  ⇒ người dùng đọc thấy `{x}`
 *   • lời gọi cấp `y` mà chuỗi KHÔNG khai    ⇒ dữ liệu bị bỏ im lặng (thường là
 *     dấu vết của một lượt đổi tên nửa vời)
 *
 * ⚠️ RANH GIỚI, ĐỌC TRƯỚC KHI TIN: cổng này chỉ đọc được lời gọi mà đối số thứ nhất
 * là một ĐƯỜNG KHOÁ TĨNH (`t.faucet.quotaFormat`, `EN.rebuild.title`). Lời gọi với
 * chuỗi dựng động hoặc biến trung gian thì nó BỎ QUA và **nói ra là đã bỏ qua** —
 * một cổng im lặng bỏ qua thứ nó không hiểu là một cổng nói dối về độ phủ.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EN = path.join(GOC, 'lib', 'i18n', 'en.ts');

if (!existsSync(EN)) {
  console.log('   ✗ không thấy lib/i18n/en.ts');
  process.exit(2);
}

/** Đọc `en.ts` thành bản đồ `đường.khoá` -> chuỗi. Đủ cho việc lấy `{…}`. */
function docEn() {
  const src = readFileSync(EN, 'utf8');
  const ra = new Map();
  let nhom = null;
  for (const dong of src.split('\n')) {
    const mNhom = dong.match(/^  ([a-zA-Z][A-Za-z0-9]*): \{/);
    if (mNhom) {
      nhom = mNhom[1];
      continue;
    }
    if (/^  \},/.test(dong)) {
      nhom = null;
      continue;
    }
    if (!nhom) continue;
    const mKhoa = dong.match(/^    ([a-zA-Z][A-Za-z0-9]*):\s*(.*)$/);
    if (!mKhoa) continue;
    // Chuỗi có thể nối nhiều dòng bằng `+`; ở đây chỉ cần các `{…}`, nên gom thô:
    // lấy phần còn lại của khối cho tới dòng có khoá kế tiếp.
    ra.set(`${nhom}.${mKhoa[1]}`, mKhoa[2]);
  }
  // Lượt hai: gộp phần nối dòng vào giá trị
  const dong = src.split('\n');
  for (let i = 0; i < dong.length; i++) {
    const m = dong[i].match(/^    ([a-zA-Z][A-Za-z0-9]*):\s*$/);
    if (!m) continue;
    let j = i + 1;
    let gom = '';
    while (j < dong.length && !/^    [a-zA-Z][A-Za-z0-9]*:/.test(dong[j]) && !/^  \},/.test(dong[j])) {
      gom += dong[j];
      j++;
    }
    // tìm nhóm gần nhất phía trên
    for (let k = i; k >= 0; k--) {
      const mn = dong[k].match(/^  ([a-zA-Z][A-Za-z0-9]*): \{/);
      if (mn) {
        ra.set(`${mn[1]}.${m[1]}`, gom);
        break;
      }
    }
  }
  return ra;
}

const cho = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

const EN_MAP = docEn();
const BO_QUA_DIR = new Set(['node_modules', '.next', '.next-dev', 'out', 'dicts']);

function tep(dir, ra = []) {
  for (const e of readdirSync(dir)) {
    if (BO_QUA_DIR.has(e)) continue;
    const p = path.join(dir, e);
    if (statSync(p).isDirectory()) tep(p, ra);
    else if (/\.tsx?$/.test(e)) ra.push(p);
  }
  return ra;
}

let hong = 0;
let daDo = 0;
let boQua = 0;

for (const goc of ['app', 'components', 'lib']) {
  for (const p of tep(path.join(GOC, goc))) {
    const rel = path.relative(GOC, p).replace(/\\/g, '/');
    if (rel === 'lib/i18n/en.ts' || rel === 'lib/i18n/interpolate.ts') continue;
    const src = readFileSync(p, 'utf8');
    // `interpolate(<đường khoá>, { a: …, b: … })`
    const re = /interpolate\(\s*(?:t|EN)\.([A-Za-z0-9.]+)\s*,\s*\{([^{}]*)\}/g;
    for (const m of src.matchAll(re)) {
      const duong = m[1];
      const chuoi = EN_MAP.get(duong);
      const dong = src.slice(0, m.index).split('\n').length;
      if (chuoi === undefined) {
        boQua++;
        continue;
      }
      const can = cho(chuoi);
      // 🔴 PHẢI ĐỌC CẢ CÚ PHÁP VIẾT TẮT `{ error }`, KHÔNG CHỈ `{ error: x }`.
      // Bản đầu của cổng này chỉ khớp dạng `khoá:` và lập tức tố ba lời gọi HOÀN TOÀN
      // ĐÚNG (`interpolate(t.rebuild.title, { ngay })`) là thiếu chỗ giữ chỗ. Một cổng
      // báo động giả ở lượt chạy đầu tiên là cổng sắp bị vô hiệu hoá bằng tay — và
      // đúng ở đây thì mất luôn phép đo duy nhất bắt được lớp hỏng im lặng này.
      const cap = [
        ...[...m[2].matchAll(/(?:^|,)\s*([A-Za-z0-9_]+)\s*:/g)].map((x) => x[1]),
        ...[...m[2].matchAll(/(?:^|,)\s*([A-Za-z0-9_]+)\s*(?=,|$)/g)].map((x) => x[1]),
      ].sort();
      daDo++;
      const thieu = can.filter((k) => !cap.includes(k));
      const thua = cap.filter((k) => !can.includes(k));
      if (thieu.length || thua.length) {
        hong++;
        console.log(`  ✗ ${rel}:${dong}  interpolate(t.${duong}, …)`);
        if (thieu.length) console.log(`      chuỗi cần {${thieu.join('} {')}} — lời gọi KHÔNG cấp`);
        if (thua.length) console.log(`      lời gọi cấp ${thua.join(', ')} — chuỗi KHÔNG khai`);
      }
    }
  }
}

console.log(`   đã đo ${daDo} lời gọi có đường khoá tĩnh${boQua ? ` · bỏ qua ${boQua} lời gọi không tra được đường khoá` : ''}`);
if (hong) {
  console.log(`\n✗ ${hong} lời gọi \`interpolate()\` lệch với chuỗi của nó.`);
  console.log('  Hỏng này KHÔNG có ai báo: `interpolate` chỉ thay khoá nó biết, nên chỗ giữ chỗ');
  console.log('  không được cấp sẽ đi thẳng ra màn hình dưới dạng `{tên}` giữa câu.');
  console.log('  Sửa cả hai đầu — chuỗi trong CẢ 30 từ điển và khoá ở lời gọi — trong một lượt.');
  process.exit(1);
}
console.log('✓ mọi lời gọi `interpolate()` cấp đúng bộ chỗ giữ chỗ chuỗi của nó khai.');
process.exit(0);
