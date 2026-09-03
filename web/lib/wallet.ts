'use client';

/**
 * Wallet connection + signature login (SIWE) against the console.
 *
 * ═══ WHY SIGNING IN WITH A WALLET IS A SAFEGUARD, NOT A CONVENIENCE ═══
 * Signing in with a wallet lets the console **force** `admin` to be the address that
 * signed. That removes the worst class of failure this project has: genesis is
 * **immutable**, so one mistyped character in a chain owner's address means the chain
 * is born **permanently ownerless** — no error, no sign, nobody can recover it. A
 * signature cannot be mistyped.
 *
 * ⇒ The UI must present that address as a **fact**, not as an input field.
 *
 * ═══ THE SERVER OWNS THE MESSAGE, THE CLIENT ONLY SIGNS ═══
 * `/api/siwe/nonce` returns **the message too**; the client signs exactly that string
 * and posts back `{nonce, signature}`. The client does NOT build the message itself:
 * building it opens the door to the two sides disagreeing about what was just signed,
 * and at that point the signature proves the wrong thing.
 */
import { faucetOrigin } from './chain';
import type { FailureKind } from './net';

/**
 * Timeout for SHORT console calls (`/api/status`, `/api/progress`). (Đ1-8)
 *
 * 🔴 NOT for `/api/create` / `/api/revoke` — see the comment on `callConsole`.
 * The generous 15s is deliberate: these are reads that run IN THE MIDDLE of a long
 * operation, when the network really is busy. Too tight a limit turns an ordinary
 * slow beat into a fake error at exactly the moment the user is most anxious.
 */
export const CONSOLE_TIMEOUT_S = 15;

export type BrowserWallet = {
  request(a: { method: string; params?: unknown[] }): Promise<unknown>;
};

export type WalletInfo = { uuid: string; name: string; rdns: string; icon?: string };
type ViDaKhai = { info: WalletInfo; provider: BrowserWallet };

/**
 * ═══ WHY NOT JUST USE `window.ethereum` ═══
 *
 * 🔴 PAID FOR ON 2026-08-26. When a user has several wallet extensions installed they
 * **fight over the same variable** `window.ethereum`, and the winner is whichever
 * loaded last — nobody chooses. David's machine has ~10 wallets, and that day's winner
 * did NOT implement `wallet_addEthereumChain`.
 *
 * The symptom reads in exactly the wrong direction. The wallet returns
 *     -32601 the method wallet_addEthereumChain does not exist/is not available
 * — which reads as "MetaMask dropped this method" or "we called it by the wrong name",
 * when the truth is that **we are talking to the wrong wallet**. (The same -32601 trap
 * this project already fell into once with the Warp API: the error code talks about the
 * METHOD NAME while the cause is the LISTENER.)
 *
 * And it does not only break the add-network button: `getWallet()` is the SIWE login
 * path for both `/create-chain/` and `/my-chains/`, so "wrong wallet" means signing
 * with a different wallet than the user believes — and a chain's `admin` is FORCED to
 * follow the signing address.
 *
 * ⇒ Use **EIP-6963**: wallets announce themselves through an event instead of racing
 * for a global. We collect them all and CHOOSE, instead of accepting whoever loaded last.
 *
 * Listen for the life of the page, not for one beat: a wallet that loads late (or that
 * the user unlocks halfway through) still announces, and we accept it whenever it does.
 */
const viDaKhai = new Map<string, ViDaKhai>();
let viChonTay: string | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('eip6963:announceProvider', (e: Event) => {
    const d = (e as CustomEvent<ViDaKhai>).detail;
    if (d?.info?.rdns && d.provider) viDaKhai.set(d.info.rdns, d);
  });
  window.dispatchEvent(new Event('eip6963:requestProvider'));
}

/** Every wallet that announced itself. Empty means no EIP-6963 wallet (or none yet). */
export function listWallets(): WalletInfo[] {
  return [...viDaKhai.values()].map((v) => v.info);
}

/** The user's chosen wallet, by `rdns`. Existence is not checked — `getWallet()` falls back. */
export function pickWallet(rdns: string | null): void {
  viChonTay = rdns;
}

/** The wallet actually in use, so the UI can say so rather than leave the user guessing. */
export function activeWalletName(): string | null {
  const chon = viChonTay ? viDaKhai.get(viChonTay) : null;
  if (chon) return chon.info.name;
  const mm = [...viDaKhai.values()].find((v) => v.info.rdns === 'io.metamask');
  if (mm) return mm.info.name;
  const dau = [...viDaKhai.values()][0];
  return dau ? dau.info.name : null;
}

export function getWallet(): BrowserWallet | null {
  if (typeof window === 'undefined') return null;

  // 1. A manual choice by the user is honoured absolutely.
  if (viChonTay) {
    const v = viDaKhai.get(viChonTay);
    if (v) return v.provider;
  }
  // 2. Prefer MetaMask: it is the wallet the project points at everywhere ("Add to
  //    MetaMask" buttons, every screenshot, every document), so the default has to
  //    match what we have already taught people to expect.
  const mm = [...viDaKhai.values()].find((v) => v.info.rdns === 'io.metamask');
  if (mm) return mm.provider;
  // 3. Any wallet that announced itself properly — still far better than grabbing a global.
  const dau = [...viDaKhai.values()][0];
  if (dau) return dau.provider;

  // 4. Fallback for OLD wallets without EIP-6963. `window.ethereum.providers` is
  //    MetaMask's older convention for the multi-wallet case; look for MetaMask in
  //    there before settling for whatever `window.ethereum` happens to be.
  const w = window as unknown as {
    ethereum?: BrowserWallet & { isMetaMask?: boolean; providers?: (BrowserWallet & { isMetaMask?: boolean })[] };
  };
  const list = w.ethereum?.providers;
  if (Array.isArray(list)) return list.find((p) => p.isMetaMask) ?? list[0] ?? null;
  return w.ethereum ?? null;
}

/** Console API origin. Same domain as the page ⇒ a relative path is enough, and correct. */
export function consoleOrigin(): string {
  if (typeof window === 'undefined') return '/console';
  const h = window.location.hostname;
  // Local dev: the page is on localhost:3901 while the console is on tunnel :8091.
  if (h === 'localhost' || h === '127.0.0.1') return 'http://127.0.0.1:8091';
  return `${window.location.protocol}//${h}/console`;
}

export type WalletSession = { diaChi: string; token: string };

export async function connectWallet(): Promise<string> {
  const v = getWallet();
  if (!v) throw new Error(NO_WALLET);
  const list = (await v.request({ method: 'eth_requestAccounts' })) as string[];
  if (!list?.length) throw new Error('KHONG_CHON_VI');
  return list[0];
}

export async function siweSignIn(diaChi: string): Promise<WalletSession> {
  const v = getWallet();
  if (!v) throw new Error(NO_WALLET);

  const rn = await fetch(`${consoleOrigin()}/api/siwe/nonce?address=${encodeURIComponent(diaChi)}`, {
    cache: 'no-store',
  });
  const jn = await rn.json();
  if (!rn.ok) throw new Error(jn.error || `nonce HTTP ${rn.status}`);

  // `personal_sign` takes (message, address) — IN THAT ORDER. Reversed, the wallet
  // either raises a confusing error, or signs the wrong string and the server rejects it.
  const signature = (await v.request({
    method: 'personal_sign',
    params: [jn.message, diaChi],
  })) as string;

  const rl = await fetch(`${consoleOrigin()}/api/siwe/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ nonce: jn.nonce, signature }),
  });
  const jl = await rl.json();
  if (!rl.ok) throw new Error(jl.error || `login HTTP ${rl.status}`);
  return { diaChi, token: jl.token };
}

/**
 * An error from the console, CARRYING its HTTP status (Đ1-6, 2026-08-27).
 *
 * ═══ WHY THE STATUS IS NEEDED, NOT JUST THE WORDS ═══
 * On the two long paths (`/api/create`, `/api/revoke`) there are **three** failures
 * that look identical at the `catch` layer but demand completely different handling:
 *
 *   401/400/409…  the server REALLY refused, the work **never started** → stop NOW
 *   524 / 5xx     Cloudflare cut at ~100s, the server **is still working** → KEEP waiting
 *   network error we know nothing at all                                 → KEEP waiting
 *
 * Before this change all three became `new Error(string)`, so the caller could not tell
 * them apart and had to pick one behaviour for all three. It picked "keep waiting" —
 * right for the last two, but for the first it left the screen frozen for **900 seconds**
 * after a refusal that took **0.83 seconds**.
 *
 * 🔴 `status = 0` means there was NO HTTP response at all (dropped network, DNS, CORS).
 * Do not treat `0` like a 4xx — that is exactly the "we know nothing" case, and waiting
 * quietly is the right answer there.
 */
export class ConsoleError extends Error {
  readonly status: number;
  /**
   * Same shape as `NetworkError` so `describeFailure()` can read both.
   *
   * ⚠️ `message` is text FOR DEVELOPERS. It gets spliced into `{detail}` on the launch
   * and revoke screens, so while it was still Vietnamese, readers in all thirty
   * languages got Vietnamese the moment the console timed out. The render site calls
   * `describeFailure(e, t.errors)`.
   */
  readonly kind: FailureKind;
  readonly timeoutSeconds: number;
  constructor(message: string, status: number, kind: FailureKind = 'http', timeoutSeconds = 0) {
    super(message);
    this.name = 'ConsoleError';
    this.status = status;
    this.kind = kind;
    this.timeoutSeconds = timeoutSeconds;
  }
  /** The server answered and the answer was "no" ⇒ the work never started, we can stop. */
  get laTuChoiThat(): boolean {
    return this.status >= 400 && this.status < 500;
  }
}

/**
 * @param hanGiay Timeout in **seconds**. Omitted = **NO timeout**, and that default is
 *   DELIBERATE (Đ1-8).
 *
 * 🔴 `/api/create` and `/api/revoke` must NEVER be passed `hanGiay`.
 * They genuinely take ~170–300 seconds; aborting the request midway means **the server
 * finishes launching the chain anyway** while the user sees an "error" and goes and
 * presses the button again. Cloudflare already cuts at ~100s (524) and this code was
 * written to LIVE WITH that — see `waitForProgress`.
 *
 * ⇒ The default points this way on purpose: **forgetting to switch it on** costs at
 *   worst the slowness we have today; **forgetting to switch it off** breaks a path
 *   that cannot be repaired. Only switch it on for calls known to be short
 *   (`/api/status`, `/api/progress`).
 */
export async function callConsole<T = unknown>(
  urlPath: string,
  token: string,
  body?: unknown,
  hanGiay?: number,
): Promise<T> {
  let r: Response;
  try {
    r = await fetch(`${consoleOrigin()}${urlPath}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
      ...(hanGiay ? { signal: AbortSignal.timeout(hanGiay * 1000) } : {}),
    });
  } catch (e) {
    // 🔴 `status: 0` IS THE IMPORTANT PART. A timeout or a dropped network means we do
    // **not know** what the server did — it may be finishing right now. `laTuChoiThat`
    // reads `status >= 400`, so 0 keeps it `false` and the screen KEEPS WAITING instead
    // of concluding "refused". Getting this backwards is the most expensive failure
    // there is: abandoning work that is running correctly.
    const ten = (e as Error)?.name;
    const het = ten === 'TimeoutError' || ten === 'AbortError';
    throw new ConsoleError(
      het ? `no answer after ${hanGiay}s` : String((e as Error)?.message ?? e),
      0,
      het ? 'timeout' : 'offline',
      het ? (hanGiay ?? 0) : 0,
    );
  }
  const t = await r.text();
  let j: unknown;
  try {
    j = JSON.parse(t);
  } catch {
    // 🔴 This error sentence earns its keep: if the console path resolves wrongly (a
    // missing trailing slash, a bad proxy) the request lands on Blockscout at the root
    // and we get HTML back. Without saying so, the error surfaces as "JSON parse error"
    // — which reads as a data problem rather than a routing one, and sends whoever is
    // fixing it to look in exactly the place where nothing is wrong.
    throw new ConsoleError(
      `answer was not JSON (HTTP ${r.status}) — check the console path`,
      r.status,
      'notJson',
    );
  }
  if (!r.ok) throw new ConsoleError((j as { error?: string }).error || `HTTP ${r.status}`, r.status);
  return j as T;
}

export type Progress = {
  running: boolean;
  kind: string | null;
  name: string | null;
  steps: { code: string; label: string; status: 'pending' | 'running' | 'done' | 'failed'; ms?: number }[];
  error: string | null;
  etaSeconds: number;
};

/**
 * ═══ 🔴 DO NOT TRUST THE LONG POST — CLOUDFLARE CUTS IT AT ~100 SECONDS ═══
 *
 * Launching and revoking a chain each take **~170 seconds**. Cloudflare (on the current
 * plan) closes the proxied connection at about **100 seconds** and returns **HTTP 524**.
 * So over the public domain the POST **always** fails — while the operation on the
 * server **runs to completion and succeeds**.
 *
 * Measured for real on 2026-08-25: revoking `ViThuTest` from the UI → the browser got
 * 524 → the screen said *"Could not revoke"*, while `console-chains.json` had already
 * written that chain into `retired`. The UI **lied in the worst possible direction**:
 * it invited the user to retry something already done, and for a launch the retry is a
 * surplus chain eating one of the 15 slots.
 *
 * ⇒ The result of the POST is **INCONCLUSIVE**. The truth lives in two other places:
 *   1. `/api/progress` — has the run finished, and did it fail?
 *   2. `/api/status` — does the directory afterwards show the chain existing / gone?
 *
 * This function handles (1). Part (2) is each screen's own business, because "success"
 * means opposite things for a launch and for a revoke.
 */
export async function waitForProgress(
  token: string,
  {
    moiMs = 2000,
    tranGiay = 420,
    tuChoiSom,
  }: {
    moiMs?: number;
    tranGiay?: number;
    /**
     * `true` once the POST was REALLY refused by the server (4xx) ⇒ the work never
     * started ⇒ there is nothing to wait for. Only consult it while `running` has
     * **never** been seen: once we have seen it running the server really is working,
     * and a late 4xx at that point (an expired token, say) does NOT mean the work was
     * cancelled.
     */
    tuChoiSom?: () => boolean;
  } = {},
): Promise<Progress | null> {
  const hetLuc = Date.now() + tranGiay * 1000;
  let cuoi: Progress | null = null;
  let daThayChay = false;
  while (Date.now() < hetLuc) {
    try {
      const t = await callConsole<Progress>('/api/progress', token, undefined, CONSOLE_TIMEOUT_S);
      cuoi = t;
      if (t.running) daThayChay = true;
      // Only conclude "done" AFTER seeing it run: asking too early means the queue has
      // not picked the work up yet and `running` is still the false of the PREVIOUS run —
      // concluding then is reading the result of a different operation.
      if (daThayChay && !t.running) return t;
    } catch {
      /* One failed read is no reason to give up — the server is still working. */
    }
    // 🔴 PLACED AFTER the read, not at the top of the loop. There is a real race: the
    // POST can be refused within ~0.8s while the first progress read may already have
    // seen the `running` of a LEGITIMATE run someone else just started. Reading first
    // and only then consulting `tuChoiSom` is what gives `daThayChay` a chance to be right.
    if (!daThayChay && tuChoiSom?.()) return cuoi;
    await new Promise((r) => setTimeout(r, moiMs));
  }
  return cuoi;
}

/** Add a freshly launched L1 to the user's wallet, in the EIP-3085 shape. */
/**
 * Turn an EIP-1193 error into text a person can read — ONE shape for the whole site.
 *
 * ═══ WHY THIS FUNCTION EXISTS ═══
 * This shape used to live inside `FaucetForm`, written carefully after a real cost on
 * `2026-08-26`. Three other buttons (`Add chain to wallet`, `Activate chain` on the
 * launch screen, `Add to wallet` on my-chains) had an EMPTY `catch {}` — the same
 * action, the same product, two standards of handling. Wherever the error is swallowed,
 * the button fails without a single word appearing, and the user presses it forever.
 *
 * 🔴 `4001` = THE USER DECLINED. That is normal behaviour, NOT an incident ⇒
 * `tuChoi: true`, and no red text. Lumping it in with real errors teaches users to
 * ignore warnings.
 *
 * 🔴 `-32601` = the wallet THAT IS LISTENING does not have this method. It reads as
 * "wrong method name"; it actually means "WRONG WALLET" — so the answer must say WHICH
 * wallet is listening and which others are installed. Paid for on `2026-08-26`: a
 * machine with ~10 wallet extensions, and the winner of `window.ethereum` was a wallet
 * that cannot add an EVM network.
 *
 * Every other code: show the wallet's code and message VERBATIM. That is the only thing
 * that distinguishes "our parameters are wrong" from "the wallet refuses".
 */
/**
 * 🔴 RETURNS A FLAG + TECHNICAL DETAIL, NOT A TRANSLATED SENTENCE (changed 2026-09-03).
 * `noWallet` is a SITUATION, not a sentence: the render site looks up `t.errors.noWallet`.
 * `detail` is the opposite — it is the error code plus the wallet's VERBATIM message,
 * the only thing that separates "our parameters are wrong" from "the wallet refuses",
 * so it must NOT be translated.
 */
/**
 * Internal sentinel, NEVER reaches the user's eyes — see `WalletError.noWallet`.
 *
 * 🔴 EXPORTED ON PURPOSE. Two screens compare a caught error's `message` against it, and
 * while this was a bare literal they each held their own hand-copied copy of the string.
 * When it was renamed on 2026-09-03 both copies silently stopped matching: `tsc` compares
 * two `string`s and is happy, so the "no wallet in this browser" branch simply became
 * unreachable and users without a wallet got the raw technical message instead of the
 * translated sentence. One exported constant is the only version of this `tsc` can check.
 */
export const NO_WALLET = 'NO_WALLET_IN_BROWSER';

export type WalletError = { rejected: boolean; noWallet: boolean; detail: string | null };

export function readWalletError(e: unknown): WalletError {
  const err = e as { code?: number; message?: string };
  if (err?.code === 4001) return { rejected: true, noWallet: false, detail: null };
  if ((e as Error)?.message === NO_WALLET) {
    return { rejected: false, noWallet: true, detail: null };
  }
  const active = activeWalletName();
  const others = listWallets()
    .map((x) => x.name)
    .filter((n) => n !== active);
  // This suffix is DIAGNOSTIC DATA, deliberately untranslated: it copies the extension
  // name and error code verbatim so the user can paste it straight to the team.
  // Translating it destroys the only thing separating "wrong wallet" from "wallet refused".
  const extra =
    err?.code === -32601
      ? ` — active wallet: ${active ?? 'unknown'}${others.length ? `; also installed: ${others.join(', ')}` : ''}`
      : '';
  return {
    rejected: false,
    noWallet: false,
    detail: `${err?.code ?? '?'} · ${err?.message ?? String(e)}${extra}`,
  };
}

export async function addL1ToWallet(p: {
  chainIdHex: string;
  name: string;
  rpc: string;
  kyHieu: string;
}): Promise<void> {
  const v = getWallet();
  if (!v) throw new Error(NO_WALLET);
  await v.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: p.chainIdHex,
        chainName: p.name,
        nativeCurrency: { name: p.kyHieu, symbol: p.kyHieu, decimals: 18 },
        rpcUrls: [p.rpc],
      },
    ],
  });
}

/** Send an ORDINARY TRANSFER to open block 1 of a freshly launched chain. */
export async function activateChain(chainIdHex: string, tuDiaChi: string): Promise<string> {
  const v = getWallet();
  if (!v) throw new Error(NO_WALLET);
  await v.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: chainIdHex }] });
  // 🔴 21,000 gas is an EVM CONSTANT for a plain transfer ⇒ no `eth_estimateGas` is
  // needed, so we avoid the "estimate comes up SHORT for the first transaction of a
  // freshly launched chain" trap (D-025) — a silent failure whose only trace is `status: 0`.
  return (await v.request({
    method: 'eth_sendTransaction',
    params: [{ from: tuDiaChi, to: tuDiaChi, value: '0x0', gas: '0x5208' }],
  })) as string;
}

export { faucetOrigin };
