#!/usr/bin/env node
/**
 * check-logical-css.mjs — no physical left/right utilities in the component tree.
 *
 * Exit 0 = clean. Exit 1 = a physical-direction class is back.
 *
 * ═══ WHY THIS GATE EXISTS ═══
 * Three of the thirty languages are right-to-left (`ar`, `fa`, `ur`), and the project
 * has been telling itself since 2026-08-28 that this costs nothing: *"bộ component vốn
 * dùng thuộc tính logic (`ms-`, `end-`, `text-start`) nên không phải sửa một dòng nào
 * cho hướng viết. Giữ nếp đó."*
 *
 * That claim was false when it was written, and nothing could tell. The i18n audit of
 * 2026-09-03 measured the RUNNING site in Persian and Arabic and found ELEVEN physical
 * classes, three of them plainly wrong on screen:
 *
 *   · `border-l-2 pl-4` on the home page self-disclosure block — measured
 *     `border-left: 2px; padding-left: 16px; padding-right: 0` inside `dir: rtl`, so
 *     the accent bar sat on the far side from where the text begins.
 *   · `text-left` on 5/5 table headers — left-aligned headings in a right-to-left table.
 *   · `pl-5` on four `<ul>` in `/re-genesis/` — measured `padding-left: 20px;
 *     padding-right: 0`, so the bullets lost their gutter and the text gained a stray
 *     20px on the wrong side. That is the page telling a stranger their assets are
 *     about to be erased.
 *
 * ═══ WHY IT COULD NOT BE CAUGHT BEFORE ═══
 * Every existing gate is blind to it BY CONSTRUCTION, and each for its own reason:
 *   · `tsc` — a class name is a string.
 *   · `i18n-shape` — compares the 30 dictionaries against each other; it knows nothing
 *     about layout.
 *   · `check-a11y` (axe under jsdom) — jsdom has no layout engine, so no rule that
 *     depends on computed position can fire.
 *   · a human looking at the site — only if they read one of the three RTL languages.
 * Direction is a property nothing in the pipeline was measuring. This gate measures it.
 *
 * ⚠️ WHAT IT DOES NOT CLAIM. Passing means no PHYSICAL class is present. It does not
 * mean the RTL layout is correct — a logical class can still be pointed the wrong way,
 * and only a person reading the language can tell. This closes one mechanical hole; it
 * does not replace reading the page.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const QUET = ['app', 'components'];

/**
 * Mỗi lớp vật lý đi kèm lớp logic thay thế — thông báo phải NÓI ĐƯỢC phải đổi thành
 * gì. Một cổng chỉ hô "sai rồi" thì người đọc nó vẫn phải đi tra tài liệu Tailwind,
 * và lần thứ ba thì họ tắt cổng.
 */
const LUAT = [
  [/\btext-left\b/g, 'text-start'],
  [/\btext-right\b/g, 'text-end'],
  [/\bml-([\w.[\]/-]+)/g, 'ms-$1'],
  [/\bmr-([\w.[\]/-]+)/g, 'me-$1'],
  [/\bpl-([\w.[\]/-]+)/g, 'ps-$1'],
  [/\bpr-([\w.[\]/-]+)/g, 'pe-$1'],
  [/\bborder-l(-[\w.[\]/-]+)?\b/g, 'border-s$1'],
  [/\bborder-r(-[\w.[\]/-]+)?\b/g, 'border-e$1'],
  [/\brounded-l(-[\w.[\]/-]+)?\b/g, 'rounded-s$1'],
  [/\brounded-r(-[\w.[\]/-]+)?\b/g, 'rounded-e$1'],
  [/\bleft-([\w.[\]/-]+)/g, 'start-$1'],
  [/\bright-([\w.[\]/-]+)/g, 'end-$1'],
];

/**
 * Miễn trừ — phải ghi LÝ DO, và lý do phải là "chỗ này thật sự vật lý", không phải
 * "chỗ này sửa phiền". Rỗng là trạng thái đúng; mỗi dòng thêm vào đây là một chỗ RTL
 * sẽ sai và ta chấp nhận nó một cách có ý thức.
 */
const MIEN_TRU = [];

function tepTsx(dir, ra = []) {
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e);
    if (statSync(p).isDirectory()) tepTsx(p, ra);
    else if (e.endsWith('.tsx')) ra.push(p);
  }
  return ra;
}

let hong = 0;
for (const goc of QUET) {
  for (const p of tepTsx(path.join(GOC, goc))) {
    const rel = path.relative(GOC, p).replace(/\\/g, '/');
    if (MIEN_TRU.some((m) => m.tep === rel)) continue;
    const src = readFileSync(p, 'utf8');
    // 🔴 CHỈ ĐỌC TRONG `className` — không quét cả tệp.
    // Quét cả tệp thì mọi chú thích nhắc tới `pl-5` (kể cả chú thích GIẢI THÍCH luật
    // này) đều thành vi phạm, và một cổng kêu về chính tài liệu của nó là cổng sắp
    // bị gỡ. Chuỗi trong `className` mới là thứ tới được trình duyệt.
    for (const m of src.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\}|\{'([^']*)'\})/g)) {
      const lop = m[1] ?? m[2] ?? m[3] ?? '';
      const dong = src.slice(0, m.index).split('\n').length;
      for (const [re, thay] of LUAT) {
        for (const v of lop.matchAll(re)) {
          hong++;
          console.log(`  ✗ ${rel}:${dong}  \`${v[0]}\`  →  \`${v[0].replace(re, thay)}\``);
        }
      }
    }
  }
}

if (hong) {
  console.log(`\n✗ ${hong} lớp theo hướng VẬT LÝ — chúng sai ở 3/30 ngôn ngữ (ar · fa · ur).`);
  console.log('  Lớp logic (`ps-`, `me-`, `border-s`, `text-start`, `start-`) tự lật theo `dir`,');
  console.log('  nên chúng đúng ở CẢ HAI chiều mà không cần một luật riêng nào cho RTL.');
  console.log('  Thật sự cần hướng vật lý? Thêm vào `MIEN_TRU` KÈM LÝ DO trong file này.');
  process.exit(1);
}

console.log('✓ không lớp CSS nào theo hướng vật lý — bố cục lật đúng ở cả 3 bản RTL.');
console.log('  (Chỉ đo SỰ VẮNG MẶT của lớp vật lý. Bản RTL đọc có xuôi không thì phải có');
console.log('   người đọc được thứ tiếng đó xem — xem chú thích đầu tệp.)');
process.exit(0);
