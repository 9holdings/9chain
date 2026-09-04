/**
 * serve-out.mjs — phục vụ `web/out/` tại chỗ để ĐO bản đã build.
 *
 * Vì sao cần: bản xuất tĩnh trỏ tài nguyên bằng đường TUYỆT ĐỐI (`/_next/…`), nên
 * mở thẳng tệp bằng `file://` là CSS và font không phân giải được — trang trông
 * như hỏng trong khi nó không hỏng, và tệ hơn, một trang thật sự hỏng cũng trông
 * y như vậy. Phải phục vụ qua HTTP mới đo được.
 *
 * Chỉ dùng để đo tại chỗ. Không phải đường deploy — deploy là
 * `local-net/deploy/web-deploy.sh`.
 *
 * `A1_DIRECTORY_FIXTURE=<tệp json>` (hoặc `--fixture=<tệp>`): phục vụ tệp đó tại `/chains/data/console-chains.json`
 * (2026-09-04). Trên máy dev không có console nào ghi danh bạ, nên `/chains/` chỉ hiện
 * mạng chính — không đo được bố cục ở 108 chain. Biến này CHỈ máy chủ đo đọc; bản
 * xuất tĩnh không biết gì về nó, nên không có đường nào để dữ liệu giả lên sản phẩm.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';

const GOC = resolve(import.meta.dirname, '../web/out');
const CONG = Number(process.env.PORT ?? 3902);
// `--fixture=<tệp>` làm việc y hệt biến môi trường — vì `.claude/launch.json` chỉ truyền
// được tham số dòng lệnh, không truyền được env.
const FIXTURE_ARG = process.argv.find((a) => a.startsWith('--fixture='))?.slice('--fixture='.length);
const FIXTURE = FIXTURE_ARG || process.env.A1_DIRECTORY_FIXTURE
  ? resolve(FIXTURE_ARG || process.env.A1_DIRECTORY_FIXTURE)
  : null;

const KIEU = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (FIXTURE && p === '/chains/data/console-chains.json') {
      res.writeHead(200, { 'content-type': KIEU['.json'], 'cache-control': 'no-store' });
      res.end(await readFile(FIXTURE));
      return;
    }
    let f = join(GOC, p);
    // Chặn đi ngược ra ngoài thư mục gốc.
    if (!f.startsWith(GOC)) {
      res.writeHead(403).end('403');
      return;
    }
    const st = await stat(f).catch(() => null);
    if (st?.isDirectory()) f = join(f, 'index.html');
    else if (!st && !extname(f)) f = join(GOC, p, 'index.html');

    const noi = await readFile(f);
    res.writeHead(200, { 'content-type': KIEU[extname(f)] ?? 'application/octet-stream' });
    res.end(noi);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('404');
  }
}).listen(CONG, () =>
  console.log(`phục vụ web/out tại http://localhost:${CONG}${FIXTURE ? ` · danh bạ giả: ${FIXTURE}` : ''}`),
);
