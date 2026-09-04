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
  });

  /**
   * 🔴 THIS ASSERTION REPLACES ONE THAT DEMANDED `@loi404 status 404` — i.e. it demanded the very
   * mechanism that failed (changed 2026-09-04).
   *
   * The page used to be built inside `handle_response @loi404` on the root `reverse_proxy`, so it
   * only ever appeared when the upstream ANSWERED with a 404. When Blockscout was removed there
   * was nothing left to answer: Caddy failed at the dial, returned a plain **502**, and the
   * branded page — carefully written, colour-checked by this very suite — was dead for days while
   * every test here stayed green, because they all read the file and none read the SHAPE.
   *
   * The invariant that actually matters: an error page must not be a branch of some other
   * service's reply. So the `respond … 404` must sit directly in a `handle`, not nested inside a
   * `handle_response`.
   */
  it('does not hide the 404 page inside a handle_response branch', () => {
    const s = readFileSync(CADDY, 'utf8');
    const i = s.indexOf('respond <<HTML');
    // Look at what encloses it: walk back to the nearest block opener and require it not to be a
    // `handle_response` (which only runs when an upstream replied).
    const truoc = s.slice(0, i);
    const moiNhat = Math.max(truoc.lastIndexOf('handle_response'), truoc.lastIndexOf('reverse_proxy'));
    const dongHandle = truoc.lastIndexOf('\thandle {');
    expect(
      dongHandle > moiNhat,
      'the branded 404 is nested under a reverse_proxy/handle_response again — it will vanish the ' +
        'day that upstream is unreachable, exactly as it did on 2026-09-04',
    ).toBe(true);
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

/**
 * Legacy explorer links `/tx/<hash>` — the ONE thing allowed to jump the 404 page (2026-09-04).
 *
 * Blockscout used to live at the root of a1.9chain.org, so every link it emitted is of the form
 * `a1.9chain.org/tx/<hash>`. Those are out in chats, docs and screenshots and cannot be recalled.
 * David decided they should be handed to a1.9scan.org rather than die on the branded 404.
 *
 * 🔴 WHAT THIS SUITE GUARDS is the *narrowness* of that hand-off. Measured on 9Scan 2026-09-04:
 * only `/tx/<64 hex>`, `/address/<40 hex>` and `/block/<number>` resolve there; `/block/<hash>`
 * and truncated hashes are 404s on their side. Widening the regex to `0x[0-9a-fA-F]+` would look
 * like a tidy-up and would silently trade OUR 404 page for a STRANGER'S 404 page — same dead end
 * for the visitor, but now with wording and exits we do not control.
 *
 * The far end (does 9Scan still answer?) cannot be measured from a file, so `caddy-deploy.sh`
 * follows the whole chain to a real 200 after every deploy. These two halves are deliberate: this
 * one catches a careless edit, that one catches the other project moving house.
 */
/**
 * Drop comment lines. This Caddyfile carries more prose than config — the comments discuss
 * `reverse_proxy`, `handle_response` and `handle {` at length — so any structural assertion made
 * against the raw text is really measuring the prose.
 */
function khongChuThich(s: string): string {
  return s
    .split('\n')
    .map((d) => (/^\s*#/.test(d) ? '' : d))
    .join('\n');
}

describe.skipIf(!coCaddy)('liên kết explorer cũ → 9Scan', () => {
  const doc = () => readFileSync(CADDY, 'utf8');

  it('still hands the three measured shapes to 9Scan', () => {
    const s = doc();
    expect(s, 'the @explorer_cu matcher is gone — legacy /tx/ links now dead-end on the 404 page').toContain('@explorer_cu');
    expect(s, 'the redirect no longer points at 9Scan').toMatch(/redir\s+https:\/\/a1\.9scan\.org\{uri\}/);
  });

  it('demands EXACT hash lengths, so malformed links keep our own 404 page', () => {
    const dong = doc().match(/@explorer_cu\s+path_regexp\s+\S+\s+(\S+)/)?.[1] ?? '';
    expect(dong, 'the @explorer_cu regex could not be read at all').not.toBe('');
    expect(dong, 'the transaction hash length (64) is no longer pinned').toContain('{64}');
    expect(dong, 'the address length (40) is no longer pinned').toContain('{40}');
    expect(
      /0x\[0-9a-fA-F\]\+/.test(dong),
      'the regex was widened to `0x[0-9a-fA-F]+`. Measured 2026-09-04: 9Scan 404s on truncated ' +
        'hashes and on /block/<hash>. Handing those over swaps our 404 page for theirs — the ' +
        'visitor is just as stuck, but now on a page whose wording and exits we do not own.',
    ).toBe(false);
    // /block/ takes a NUMBER. `/block/<hash>` is a 404 on their side, so it must not match here.
    expect(dong, '/block/ must be restricted to digits').toMatch(/block\/\[0-9\]/);
  });

  it('is not nested inside a reverse_proxy or handle_response', () => {
    // Same invariant, same reason as the 404 page above: a redirect that only fires when some
    // other service answers dies the day that service is removed — and dies quietly.
    //
    // 🔴 READ DIRECTIVES, NOT PROSE. The first draft searched the raw text, so it matched the words
    // `reverse_proxy` / `handle_response` inside the long comments this file is full of — and went
    // red when the block was merely MOVED past a comment that discusses them. Measuring the wrong
    // quantity is the failure mode this repo pays for most often, so strip comments first.
    const s = khongChuThich(doc());
    const i = s.indexOf('@explorer_cu');
    expect(i, 'the explorer redirect is gone').toBeGreaterThan(-1);
    const truoc = s.slice(0, i);
    const upstream = Math.max(truoc.lastIndexOf('handle_response'), truoc.lastIndexOf('reverse_proxy'));
    const blockDong = truoc.lastIndexOf('\thandle');
    expect(blockDong > upstream, 'the explorer redirect got nested under an upstream reply').toBe(true);
  });

  it('sits BEFORE the catch-all handle, or the 404 page eats it', () => {
    // Caddy evaluates sibling `handle` blocks in written order and the first match wins. Move this
    // below the bare `handle {` and every legacy link silently goes back to the 404 page — with no
    // config error, and with this file still containing a perfectly correct redirect rule.
    //
    // 🔴 SCOPE THIS TO THE `a1.9chain.org` SITE BLOCK. The first draft searched the whole file and
    // found the catch-all belonging to the *rpc-a1* block (which has its own bare `handle {`), so
    // it went red on a correct config. A gate that is red for the wrong reason is worse than no
    // gate: the next person deletes it instead of reading it.
    const s = khongChuThich(doc());
    const batDau = s.indexOf('\na1.9chain.org {');
    expect(batDau, 'the a1.9chain.org site block could not be located').toBeGreaterThan(-1);
    // The site block ends where the next one starts (a domain at column 0 followed by ` {`).
    const sau = s.slice(batDau + 1);
    const ketThuc = sau.search(/\n[a-z0-9][a-z0-9.,\- ]*\{\s*\n/);
    const khoi = ketThuc > -1 ? sau.slice(0, ketThuc) : sau;

    const redirect = khoi.indexOf('@explorer_cu');
    const batTatCa = khoi.indexOf('\n\thandle {\n');
    expect(redirect, 'the explorer redirect is not in the a1.9chain.org site block').toBeGreaterThan(-1);
    expect(batTatCa, 'the catch-all handle of a1.9chain.org could not be located').toBeGreaterThan(-1);
    expect(
      redirect < batTatCa,
      'the explorer redirect now sits AFTER the catch-all `handle {` — Caddy takes the first ' +
        'matching handle, so the 404 page swallows every legacy /tx/ link, silently.',
    ).toBe(true);
  });
});
