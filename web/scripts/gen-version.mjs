#!/usr/bin/env node
/**
 * gen-version.mjs — mỏ neo phiên bản cho bản dựng tĩnh. (Đ1-11b, phần 1)
 *
 * ═══ SỰ CỐ CÓ THẬT MÀ TỆP NÀY ĐÓNG ═══
 * `/version.txt` đã được thêm vào `@trangmoi` của Caddyfile từ **Đ1-1** — nhưng
 * không có gì sinh ra tệp đó. Đo `27/08` trên mạng công khai:
 *
 *     https://a1.9chain.org/version.txt  →  404, nginx, content-type: text/html
 *
 * Tức là **route lên trước sản phẩm**, và kết quả là một đường chết đang phục vụ
 * công khai. `check-routes.mjs` xanh suốt vì nó hỏi *"mọi tệp trong out/ đã có route
 * chưa?"* — chiều ngược lại (*"mọi route đã có tệp chưa?"*) không ai hỏi.
 * ⇒ Cùng họ với `/moi/` che một trang 404 thật, và với `og:*` dùng chung: **cổng
 *   xanh vì nó đo một chiều của một quan hệ hai chiều.** Chiều kia nay đã có cổng.
 *
 * ═══ MỎ NEO NÀY DÙNG ĐỂ LÀM GÌ ═══
 * Trả lời được một câu mà không phép đo nào khác trên site trả lời được:
 * **"cái đang phục vụ ngoài kia có đúng là cái tôi vừa dựng không?"**
 * `curl https://a1.9chain.org/version.txt` phải khớp từng byte với
 * `cat web/out/version.txt`. Lệch = HTML cũ còn trong cache/đĩa, hoặc lượt chép hụt.
 *
 * 🔴 PHẢI CÓ `dirty` — và đó là nửa quan trọng hơn của tệp này.
 * Một mỏ neo chỉ mang SHA sẽ nói dối rất tự tin khi ai đó dựng từ cây làm việc còn
 * sửa dở: SHA trỏ vào một commit KHÔNG chứa thứ vừa lên sóng. Khai `dirty` biến câu
 * "bản này là commit X" thành "bản này là commit X **cộng thứ chưa commit**" — câu
 * thứ hai đúng, câu thứ nhất là một lời khai sai có chữ ký.
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const GOC = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const OUT = path.join(GOC, 'out');

function git(...args) {
  try {
    return execFileSync('git', args, { cwd: GOC, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    // Không có git (container dựng sạch) không phải lỗi — nhưng KHÔNG bịa một SHA.
    return null;
  }
}

if (!existsSync(OUT)) {
  console.log(`✗ chưa có ${OUT} — gen-version phải chạy SAU \`next build\``);
  process.exit(1);
}

const sha = git('rev-parse', '--short=12', 'HEAD') ?? 'khong-co-git';
const nhanh = git('rev-parse', '--abbrev-ref', 'HEAD') ?? '?';
// `status --porcelain` rỗng = cây sạch. Bất kỳ dòng nào = có thứ chưa commit.
const bo = git('status', '--porcelain');
const dirty = bo === null ? 'khong-biet' : bo.length > 0 ? 'co' : 'khong';

// Đếm chunk để lượt deploy có một con số đối chiếu rẻ (Đ1-11b phần 2 sẽ so DANH SÁCH,
// không chỉ số đếm — số đếm bằng nhau vẫn có thể là hai bộ tệp khác nhau).
const thuMucChunk = path.join(OUT, '_next', 'static', 'chunks');
const soChunk = existsSync(thuMucChunk) ? readdirSync(thuMucChunk).filter((f) => f.endsWith('.js')).length : 0;

const noiDung =
  [
    `commit=${sha}`,
    `nhanh=${nhanh}`,
    `con-sua-chua-commit=${dirty}`,
    `dung-luc=${new Date().toISOString()}`,
    `so-chunk-js=${soChunk}`,
  ].join('\n') + '\n';

// LF tường minh: repo chạy trên Windows, và CRLF ở đây làm mọi phép so byte-đối-byte
// giữa `curl` và `cat` lệch mà không ai hiểu vì sao (cùng bẫy đã cắn `sha256sum -c`).
writeFileSync(path.join(OUT, 'version.txt'), noiDung, { encoding: 'utf8' });

console.log(`✓ version.txt — ${sha} (${nhanh}) · chưa commit: ${dirty} · ${soChunk} chunk`);
if (dirty === 'co') {
  console.log('   ⚠️ cây làm việc CÒN SỬA CHƯA COMMIT — bản dựng này không tái lập được từ SHA trên.');
}
