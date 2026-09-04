import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

/**
 * The 404 page written DIRECTLY into the Caddyfile — catching it drifting from the design system.
 * (Đ1-2, path (b), 2026-08-27)
 *
 * ═══ WHY THIS SUITE EXISTS ═══
 * David chose path (b): a self-contained 404 page written straight into
 * `local-net/deploy/Caddyfile`, because the running Caddy build has no `replace_status` and so
 * cannot serve `out/404.html` with a 404 status, and serving it with a 200 makes it a soft 404.
 *
 * 🔴 THE COST WAS STATED BEFORE THE CHOICE WAS MADE: the content is duplicated, and the copy in
 * the Caddyfile **does not read `tokens.css`**. Which means the day 9Scan changes a brand colour →
 * A1 runs `sync-tokens.mjs` → `tokens.css` changes → and the 404 page **keeps the old colours,
 * silently**. Nobody opens the 404 page to look after a colour change.
 *
 * This suite turns that exact trap into a measurement: extract every colour code from the 404
 * block in the Caddyfile, and require each one to BE PRESENT in `tokens.css`. Drift ⇒ red.
 *
 * ⚠️ It does NOT require the two to match in layout or wording — only that the **palette is a
 * subset**. Asking for more turns a useful gate into one that cries wolf.
 */
const CADDY = path.resolve(__dirname, '..', '..', 'local-net', 'deploy', 'Caddyfile');
const TOKENS = path.resolve(__dirname, '..', 'app', 'tokens.css');

const coCaddy = existsSync(CADDY);

/** Extract exactly the `respond <<HTML … HTML 404` block. */
function khoi404(): string | null {
  const s = readFileSync(CADDY, 'utf8');
  const i = s.indexOf('respond <<HTML');
  if (i < 0) return null;
  const j = s.indexOf('HTML 404', i);
  return j < 0 ? null : s.slice(i, j);
}

describe.skipIf(!coCaddy)('trang 404 trong Caddyfile', () => {
  it('is still in the Caddyfile and returns a real 404', () => {
    const s = readFileSync(CADDY, 'utf8');
    // `respond … 404` is what separates a real error page from a soft 404. If someone removes
    // that number the page still renders identically — and the error becomes invisible.
    expect(s, 'the respond block returning 404 is missing').toContain('HTML 404');
    expect(s, 'the 404 status matcher is missing').toMatch(/@loi404\s+status\s+404/);
  });

  it('pulls in NO external resources — it has to work when everything else is broken', () => {
    const k = khoi404();
    expect(k).toBeTruthy();
    // People land on this page while something else is broken. Every external resource is one more
    // way for it to die at the same moment as the thing it is standing in for.
    expect(k!, 'must have no <script>').not.toMatch(/<script/i);
    expect(k!, 'must have no <link rel=…>').not.toMatch(/<link\s/i);
    expect(k!, 'must have no <img>').not.toMatch(/<img\s/i);
    expect(k!, 'must not fetch fonts or assets over http').not.toMatch(/https?:\/\//i);
  });

  it('every colour code is one that REALLY exists in tokens.css', () => {
    const k = khoi404();
    const tokens = readFileSync(TOKENS, 'utf8').toLowerCase();
    const mau = [...new Set((k!.toLowerCase().match(/#[0-9a-f]{6}\b/g) ?? []))];
    expect(mau.length, 'the 404 block has no colour codes at all — it has certainly been broken').toBeGreaterThan(4);

    const lac = mau.filter((m) => !tokens.includes(m));
    expect(
      lac,
      `The 404 page in the Caddyfile uses colours NOT in tokens.css: ${lac.join(', ')}\n` +
        '  This is exactly the drift path (b) was warned about before it was chosen:\n' +
        '  the Caddyfile does not read tokens.css, so one `sync-tokens.mjs` run changing a\n' +
        '  brand colour leaves this page behind, silently.\n' +
        '  Fix: open local-net/deploy/Caddyfile, the `respond <<HTML` block, and update the colours.',
    ).toEqual([]);
  });

  it('has all three ways out, and they are REAL paths of this site', () => {
    const k = khoi404()!;
    // A 404 page with no way out only changes the language of the dead end.
    for (const d of ['href="/"', 'href="/faucet/"', 'href="/create-chain/"']) {
      expect(k, `the way out ${d} is missing`).toContain(d);
    }
    // 🔴 These three paths must be in `@trangmoi`, otherwise the 404 page itself leads into a
    // 404 — `check-routes.mjs` guards that part; this only guards the wording.
    const s = readFileSync(CADDY, 'utf8');
    const dsTrangMoi = s.match(/@trangmoi\s+path\s+([^\n]*)/)?.[1] ?? '';
    expect(dsTrangMoi, '/faucet/* must have a route').toContain('/faucet/*');
    expect(dsTrangMoi, '/create-chain/* must have a route').toContain('/create-chain/*');
  });

  it('carries no [?] voice-review mark out to the public network', () => {
    // The Caddyfile does not pass through `pnpm build`, so the `[?]` gate over `out/` cannot reach
    // here. And this is the page a stranger most often meets after a typo.
    expect(khoi404()!).not.toContain('[?]');
  });
});
