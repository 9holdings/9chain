import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fetchJson, NetworkError, READ_TIMEOUT_MS } from '../lib/net';

/**
 * The network safety net (Đ1-8).
 *
 * The acceptance condition for this item was *"simulate a dead/slow/garbage API and the screen
 * must not hang"*. Those three cases are below. But the **most valuable** part of this file is
 * the last block: the gate guarding the constraint *"NO timeout on `/api/create` and
 * `/api/revoke`"*.
 */
afterEach(() => vi.unstubAllGlobals());

/** Build a fake `fetch` returning exactly what we want to test. */
function gia(opts: { status?: number; body?: string; treo?: boolean; nem?: Error }) {
  vi.stubGlobal('fetch', (_u: string, init?: RequestInit) => {
    if (opts.nem) return Promise.reject(opts.nem);
    if (opts.treo) {
      // A REAL hang, but one that respects the signal — exactly like a server that never answers.
      return new Promise<Response>((_res, rej) => {
        init?.signal?.addEventListener('abort', () => {
          const e = new Error('timed out');
          e.name = 'TimeoutError';
          rej(e);
        });
      });
    }
    return Promise.resolve({
      ok: (opts.status ?? 200) < 400,
      status: opts.status ?? 200,
      text: () => Promise.resolve(opts.body ?? '{}'),
    } as Response);
  });
}

describe('fetchJson — the three failures must be tellable apart', () => {
  it('a SLOW/hung server ⇒ timeout, not a hang forever', async () => {
    gia({ treo: true });
    // A 0.05s limit so the test itself is not slow.
    await expect(fetchJson('/x', {}, 0.05)).rejects.toMatchObject({ kind: 'timeout' });
  });

  it('a DEAD server (500) ⇒ http, and retrying is NOT pointless', async () => {
    gia({ status: 500, body: '{"error":"vo"}' });
    const e = (await fetchJson('/x').catch((x) => x)) as NetworkError;
    expect(e.kind).toBe('http');
    expect(e.status).toBe(500);
    expect(e.retryPointless).toBe(false);
  });

  it('a server that REALLY refuses (401) ⇒ retrying is pointless', async () => {
    gia({ status: 401, body: '{"error":"not authenticated"}' });
    const e = (await fetchJson('/x').catch((x) => x)) as NetworkError;
    expect(e.retryPointless).toBe(true);
    expect(e.message).toContain('not authenticated');
  });

  it('a server returning GARBAGE (HTML) ⇒ notJson, and the error must suspect ROUTING', async () => {
    // The real case: the request falls through to Blockscout at the root `/` and we get an HTML shell.
    gia({ status: 200, body: '<!DOCTYPE html><html><body>Blockscout</body></html>' });
    const e = (await fetchJson('/x').catch((x) => x)) as NetworkError;
    expect(e.kind).toBe('notJson');
    // 🔴 Compare the SHAPE of the failure, not the wording (changed 2026-09-03).
    // `NetworkError.message` is now text FOR DEVELOPERS — the user reads the sentence
    // `describeFailure()` looks up in the dictionary. A string comparison here would both pin one
    // language and go red whenever someone edits the wording, i.e. it measures the wrong quantity.
    expect(e.status).toBe(200);
    expect(e.message).toMatch(/not JSON/i);
  });

  it('a dropped network ⇒ offline, NOT mistaken for a timeout', async () => {
    gia({ nem: new TypeError('Failed to fetch') });
    await expect(fetchJson('/x')).rejects.toMatchObject({ kind: 'offline' });
  });

  it('no hanGiay passed ⇒ NO signal attached (the default is no timeout)', async () => {
    let thay: RequestInit | undefined;
    vi.stubGlobal('fetch', (_u: string, init?: RequestInit) => {
      thay = init;
      return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve('{}') } as Response);
    });
    await fetchJson('/x');
    expect(thay?.signal).toBeUndefined();

    await fetchJson('/x', {}, READ_TIMEOUT_MS / 1000);
    expect(thay?.signal).toBeDefined(); // only present when asked for
  });
});

/**
 * 🔴 THE MOST IMPORTANT GATE IN THIS FILE.
 *
 * `/api/create` and `/api/revoke` genuinely take ~170–300 seconds. An `AbortSignal.timeout` there
 * **cancels the browser's request while the server is still launching the chain**: the user sees
 * an "error", the chain is created anyway, they press again — and on this network **a name once
 * used is never reissued**, not even for a revoked chain.
 *
 * This is a class of failure a runnable test CANNOT catch: reproducing it would require a real
 * 170-second operation. So this gate reads the **source code** — it is cheap, and it guards
 * exactly what a human will accidentally break while "tidying up for consistency".
 */
describe('NO timeout on /api/create and /api/revoke', () => {
  const GOC = path.resolve(__dirname, '..');
  const BO_QUA = new Set(['node_modules', 'out', '.next', 'test']);

  function quet(d: string, ra: string[] = []): string[] {
    for (const m of readdirSync(d, { withFileTypes: true })) {
      if (BO_QUA.has(m.name)) continue;
      const p = path.join(d, m.name);
      if (m.isDirectory()) quet(p, ra);
      else if (/\.tsx?$/.test(m.name)) ra.push(p);
    }
    return ra;
  }

  /**
   * Count the arguments at the OUTERMOST level of a call.
   *
   * ⚠️ The first version of this gate counted commas with a regex — and it **falsely accused** on
   * its very first run: `callConsole('/api/revoke', token, { name, xacNhan })` has only 3
   * arguments, but the commas INSIDE the object literal made the regex see 4. A gate that
   * false-accuses is more dangerous than no gate: people learn to ignore it.
   * ⇒ Balance the braces properly; do not count characters.
   */
  function demThamSo(src: string, dict: number): number {
    let sau = 0, so = 1, i = dict, trong: string | null = null;
    for (; i < src.length; i++) {
      const c = src[i], truoc = src[i - 1];
      if (trong) { if (c === trong && truoc !== '\\') trong = null; continue; }
      if (c === "'" || c === '"' || c === '`') { trong = c; continue; }
      if ('([{'.includes(c)) sau++;
      else if (')]}'.includes(c)) { if (sau === 0) break; sau--; }
      else if (c === ',' && sau === 0) so++;
    }
    return so;
  }

  it('no call to either path passes a timeout argument', () => {
    const pham: string[] = [];
    for (const p of quet(GOC)) {
      const s = readFileSync(p, 'utf8');
      const re = /callConsole\s*(?:<[^>]*>)?\s*\(\s*['"]\/api\/(create|revoke)['"]/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(s))) {
        // Start counting immediately after the call's opening `(`.
        const opened = s.indexOf('(', m.index);
        if (demThamSo(s, opened + 1) >= 4) pham.push(`${path.relative(GOC, p)} (${m[1]})`);
      }
    }
    expect(
      pham,
      `A timeout must NEVER be set on /api/create or /api/revoke — they take ~170–300s, ` +
        `and cancelling midway leaves the server finishing while the user believes it broke. Offenders: ${pham.join(', ')}`,
    ).toEqual([]);
  });

  it('`callConsole` still defaults to NO timeout (the safe direction)', () => {
    const s = readFileSync(path.join(GOC, 'lib', 'wallet.ts'), 'utf8');
    // The parameter must be optional (`hanGiay?:`) and the signal only attached when it is present.
    expect(s).toMatch(/hanGiay\?\s*:\s*number/);
    expect(s).toMatch(/hanGiay\s*\?\s*\{\s*signal:\s*AbortSignal\.timeout/);
  });
});
