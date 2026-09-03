import { describe, expect, it, vi as vitest, beforeEach, afterEach } from 'vitest';
import { ConsoleError } from '../lib/wallet';

/**
 * `waitForProgress` — the function that decides how long a user must stare at a progress bar.
 * (Đ1-6, 2026-08-27)
 *
 * ═══ THE BUG BEING LOCKED DOWN ═══
 * Measured 2026-08-27: `POST /console/api/create` with a junk token was refused **401 in 0.831
 * seconds**. But the screen sat frozen to the **wait ceiling** (900 seconds at the time), because
 * this function only exits on `daThayChay && !running` — and on an early refusal `running` NEVER
 * turns on. The user watches the progress of work that never started, and quite likely presses
 * again — and each retry is a surplus chain permanently eating one of the 15 slots, holding its
 * name and chainId with it.
 *
 * 🔴 THREE CASES MUST BE HANDLED DIFFERENTLY, and this is the easiest place to over-fix:
 *   a real 4xx     → stop immediately (the work never started)
 *   524 / 5xx      → KEEP WAITING (Cloudflare cut at ~100s, the server runs to completion)
 *   network drop   → KEEP WAITING (we know nothing)
 * "Fixing" it to "stop whenever the POST fails" recreates exactly the 2026-08-25 bug: the UI
 * reported "could not revoke" while the directory had already written the chain into `retired`.
 */

// The function calls `callConsole` internally (same module), so intercept at the `fetch` layer.
const gocThat = globalThis.fetch;

function datFetch(chuoi: Array<{ ok?: boolean; status?: number; body: unknown }>) {
  let i = 0;
  globalThis.fetch = vitest.fn(async () => {
    const b = chuoi[Math.min(i, chuoi.length - 1)];
    i += 1;
    return {
      ok: b.ok ?? true,
      status: b.status ?? 200,
      text: async () => JSON.stringify(b.body),
    } as unknown as Response;
  }) as typeof fetch;
  return () => i;
}

let waitForProgress: typeof import('../lib/wallet')['waitForProgress'];

beforeEach(async () => {
  ({ waitForProgress } = await import('../lib/wallet'));
});
afterEach(() => {
  globalThis.fetch = gocThat;
  vitest.restoreAllMocks();
});

const CHAY = { running: true, kind: 'create', name: 'X', steps: [], error: null, etaSeconds: 170 };
const XONG = { running: false, kind: 'create', name: 'X', steps: [], error: null, etaSeconds: 0 };

describe('waitForProgress', () => {
  it('thoát ngay khi POST bị TỪ CHỐI THẬT (4xx) và chưa từng thấy running', async () => {
    // This is the case that hung for 900 seconds. `running` is always false because the work never queued.
    datFetch([{ body: XONG }]);
    const t0 = Date.now();
    const check = await waitForProgress('token', { moiMs: 5, tranGiay: 30, tuChoiSom: () => true });
    expect(Date.now() - t0, 'phải thoát gần như tức thì, không chờ hết trần').toBeLessThan(2000);
    expect(check).not.toBeNull();
  });

  it('KHÔNG thoát sớm khi chưa có tín hiệu từ chối — 524 phải chờ tới cùng', async () => {
    // Cloudflare cuts at ~100s but the server carries on: this is the case that MUST be patient.
    // Sequence: running → running → done. If the function exits early it returns while still `running`.
    datFetch([{ body: CHAY }, { body: CHAY }, { body: XONG }]);
    const check = await waitForProgress('token', { moiMs: 5, tranGiay: 30, tuChoiSom: () => false });
    expect(check?.running, 'phải chờ tới khi running=false').toBe(false);
  });

  it('đã thấy running rồi thì tín hiệu từ chối KHÔNG còn được nghe', async () => {
    // A token expiring midway is a late 4xx — but the work really is running on the server.
    // Giving up there recreates the "the UI lies" bug of 2026-08-25.
    datFetch([{ body: CHAY }, { body: CHAY }, { body: XONG }]);
    let batDauTuChoi = false;
    const p = waitForProgress('token', { moiMs: 5, tranGiay: 30, tuChoiSom: () => batDauTuChoi });
    setTimeout(() => { batDauTuChoi = true; }, 12); // turns on AFTER running has been seen
    const check = await p;
    expect(check?.running, 'đã thấy chạy thì phải theo tới cùng').toBe(false);
  });

  it('không kết luận "xong" trước khi thấy running lần nào', async () => {
    // `running=false` on the first beat is the state of the PREVIOUS run, not of ours.
    let solan = 0;
    globalThis.fetch = vitest.fn(async () => {
      solan += 1;
      const b = solan <= 2 ? XONG : solan <= 4 ? CHAY : XONG;
      return { ok: true, status: 200, text: async () => JSON.stringify(b) } as unknown as Response;
    }) as typeof fetch;
    const check = await waitForProgress('token', { moiMs: 5, tranGiay: 30 });
    expect(solan, 'phải đọc quá 2 nhịp đầu chứ không kết luận ngay').toBeGreaterThan(4);
    expect(check?.running).toBe(false);
  });
});

describe('ConsoleError', () => {
  it('phân biệt từ chối thật với Cloudflare cắt và với đứt mạng', () => {
    expect(new ConsoleError('unauthorized', 401).laTuChoiThat, '401 = từ chối thật').toBe(true);
    expect(new ConsoleError('trùng tên', 409).laTuChoiThat, '409 = từ chối thật').toBe(true);
    expect(new ConsoleError('timeout', 524).laTuChoiThat, '524 = Cloudflare cắt, KHÔNG phải từ chối').toBe(false);
    expect(new ConsoleError('bad gateway', 502).laTuChoiThat, '5xx = chưa kết luận được').toBe(false);
    // 🔴 `0` = no HTTP response at all. Treating it like a 4xx means giving up while the
    // server is still launching the chain — the worst case there is.
    expect(new ConsoleError('failed to fetch', 0).laTuChoiThat, '0 = đứt mạng, KHÔNG kết luận').toBe(false);
  });
});
