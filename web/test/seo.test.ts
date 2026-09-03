import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

/**
 * Catch drift on the SHARE SURFACE (Đ1-5, 2026-08-27).
 *
 * ═══ WHY THIS SUITE EXISTS ═══
 * Before the fix, `og:title` / `og:description` / `twitter:*` were **identical across all 6
 * pages** — all of them the home page's content. Pasting `/re-genesis/` into a group chat
 * surfaced the invitation "launching your chain takes about three minutes", the exact opposite of
 * what the page says.
 *
 * 🔴 NOT ONE GATE CAUGHT IT, and the reason is worth remembering: every existing gate measured
 * `<title>`, and `<title>` had been per-page for a long time. Measuring the right quantity means
 * measuring `og:title`, not something correlated with it.
 *
 * 🔴 THIS SUITE READS `out/`, NOT THE SOURCE. It has to prove what was ACTUALLY EXPORTED —
 * correct `metadata` in a `.tsx` that Next then fails to emit as tags is broken all the same.
 * It skips (rather than failing) when `out/` is absent: going red on a machine that has not built
 * teaches people to ignore test results — far more expensive than one missing measurement.
 */
const OUT = path.resolve(__dirname, '..', 'out');
const coOut = existsSync(OUT);

/** Read every top-level `index.html` in `out/`, plus the `404.html` at the root. */
function cacTrang(): { urlPath: string; html: string }[] {
  const list: { urlPath: string; html: string }[] = [];
  const goc = path.join(OUT, 'index.html');
  if (existsSync(goc)) list.push({ urlPath: '/', html: readFileSync(goc, 'utf8') });
  for (const t of readdirSync(OUT, { withFileTypes: true })) {
    if (!t.isDirectory() || t.name.startsWith('_')) continue;
    const p = path.join(OUT, t.name, 'index.html');
    if (existsSync(p)) list.push({ urlPath: `/${t.name}/`, html: readFileSync(p, 'utf8') });
  }
  return list;
}

function thePropertyContent(html: string, khoa: string): string | null {
  // Next can emit `property="og:title" content="…"` with the attributes in either order.
  const a = html.match(new RegExp(`<meta[^>]+(?:property|name)="${khoa}"[^>]+content="([^"]*)"`, 'i'));
  if (a) return a[1];
  const b = html.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]+(?:property|name)="${khoa}"`, 'i'));
  return b ? b[1] : null;
}

describe.skipIf(!coOut)('bề mặt chia sẻ', () => {
  /**
   * `/404/` DELIBERATELY has no `og:url` — and no `canonical` either.
   * An error page has no canonical URL: it is the answer to **every** wrong path, not a document
   * at one address. Declaring `og:url` for it invites crawlers to treat it as a real page (it
   * already carries `noindex`, but two layers saying the same thing is cheap). This exemption is
   * narrow and reasoned — do not widen it into "skip the 404".
   */
  const KHONG_CAN_URL = new Set(['/404/']);

  it('mọi trang đều có og:title và og:description', () => {
    for (const { urlPath, html } of cacTrang()) {
      expect(thePropertyContent(html, 'og:title'), `${urlPath} thiếu og:title`).toBeTruthy();
      expect(thePropertyContent(html, 'og:description'), `${urlPath} thiếu og:description`).toBeTruthy();
    }
  });

  it('mọi trang THẬT đều có og:url (404 là ngoại lệ có chủ ý)', () => {
    for (const { urlPath, html } of cacTrang()) {
      if (KHONG_CAN_URL.has(urlPath)) {
        // The reverse check for the exemption itself: if the 404 ever gains an og:url, almost
        // certainly somebody attached `pageMeta` to it without reading the reason.
        expect(thePropertyContent(html, 'og:url'), `${urlPath} KHÔNG được có og:url`).toBeNull();
        continue;
      }
      expect(thePropertyContent(html, 'og:url'), `${urlPath} thiếu og:url`).toBeTruthy();
    }
  });

  it('og:title KHÁC NHAU giữa các trang — đây là phần hôm qua còn đỏ', () => {
    const list = cacTrang();
    const theo = new Map<string, string[]>();
    for (const { urlPath, html } of list) {
      const t = thePropertyContent(html, 'og:title') ?? '(thiếu)';
      theo.set(t, [...(theo.get(t) ?? []), urlPath]);
    }
    const trung = [...theo.entries()].filter(([, ds2]) => ds2.length > 1);
    expect(
      trung,
      `og:title bị dùng chung:\n${trung.map(([t, ds2]) => `  "${t}"\n    ← ${ds2.join(', ')}`).join('\n')}`,
    ).toEqual([]);
  });

  it('og:url của mỗi trang trỏ đúng đường dẫn của chính nó', () => {
    for (const { urlPath, html } of cacTrang()) {
      if (KHONG_CAN_URL.has(urlPath)) continue;
      const u = thePropertyContent(html, 'og:url') ?? '';
      expect(u, `${urlPath} có og:url = "${u}"`).toContain(urlPath);
    }
  });

  it('không một thẻ meta nào mang dấu [?] chờ duyệt giọng', () => {
    // The `[?]` mark is an INTERNAL review mechanism. Leaking into a meta tag means other machines
    // read it and reproduce it verbatim in the share card — beyond the reach of any later edit.
    for (const { urlPath, html } of cacTrang()) {
      for (const k of ['og:title', 'og:description', 'twitter:title', 'twitter:description']) {
        const v = thePropertyContent(html, k) ?? '';
        expect(v, `${urlPath} — ${k} còn dấu [?]`).not.toContain('[?]');
      }
    }
  });
});

describe('sitemap.xml', () => {
  const P = path.resolve(__dirname, '..', 'public', 'sitemap.xml');

  it('khai đúng namespace sitemaps.org (CÓ chữ "s")', () => {
    // A wrong namespace does not break XML syntax, so no measurement at the transport layer
    // catches it — the search engine simply ignores the whole file in silence. The version before
    // 2026-08-27 declared `www.sitemap.org`, one character short.
    const s = readFileSync(P, 'utf8');
    const ns = s.match(/<urlset[^>]+xmlns="([^"]+)"/)?.[1];
    expect(ns).toBe('http://www.sitemaps.org/schemas/sitemap/0.9');
  });

  it('mọi <loc> đều là URL tuyệt đối trên đúng tên miền', () => {
    const s = readFileSync(P, 'utf8');
    const locs = [...s.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBeGreaterThan(0);
    for (const l of locs) expect(l, `<loc> lạ: ${l}`).toMatch(/^https:\/\/a1\.9chain\.org\//);
  });
});
