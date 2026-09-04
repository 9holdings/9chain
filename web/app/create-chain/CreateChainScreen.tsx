'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, Field, Badge, Skeleton, ErrorState, Note, Copyable, Steps, type Step } from '@/components/ui';
import { shortenAddress } from '@/lib/eip55';
import { OpenInWallet } from '@/components/OpenInWallet';
import { presetText, localiseSteps } from '@/lib/serverText';
import { symbolOf } from '@/lib/l1-symbol';
import { interpolate, useT } from '@/lib/i18n';
import { describeFailure } from '@/lib/net';
import {
  getWallet, connectWallet, siweSignIn, callConsole, addL1ToWallet, activateChain, waitForProgress, ConsoleError,
  readWalletError, NO_WALLET, type WalletSession, CONSOLE_TIMEOUT_S} from '@/lib/wallet';

/**
 * The chain-launch screen — the hardest screen in M10, and three PRODUCT truths force its
 * shape, not aesthetics:
 *
 * 1. 🔴 **One run takes ~170 seconds, and that is DELIBERATE** (5 nodes restart one at a
 *    time so the network never loses quorum; in exchange the public RPC is interrupted for
 *    0.5s instead of 6.0s).
 *    ⇒ **progress shown as STEPS**, not a spinner. A 170-second spinner reads as "it broke",
 *    and the retry is a surplus chain eating one of the 15 slots.
 * 2. 🔴 **Genesis is IMMUTABLE** ⇒ this is a **one-way door**, so there must be a review step.
 * 3. 🔴 **Signing in with a wallet FORCES `admin` = the signing address** ⇒ the address is
 *    presented as a **fact**, not as an input field. A manual field exists only on the
 *    operator-token path — and that path does not go through this page.
 */

// 🔴 THESE FIELDS ARE A CONTRACT WITH THE CONSOLE'S `/api/status` — not names of our choosing.
// The console (`local-net/lib/presets.mjs`) returns `{ id, name, desc }`. Before 2026-08-30
// this file declared `{ id, ten, moTa }`, i.e. the OLD names from when preset ids were still
// Vietnamese (D-108) — so `p.ten` was always `undefined` and **every row in the picker
// rendered BLANK**: users had to choose their chain's PERMANENT configuration by clicking
// blindly on white space. TypeScript could not catch it because the data comes off the network, not out of the code.
type Preset = { id: string; name: string; desc?: string };
type TrangThai = {
  tran: number;
  chains: unknown[];
  presets: Preset[];
  dangNhap: string;
  viDangNhap: string | null;
};
type KetQua = { name: string; chainId: number; rpc: string; blockchainID: string; symbol?: string; luuY?: { title: string; cachLam: string } };
type Progress = { running: boolean; name: string | null; steps: Step[]; error: string | null; etaSeconds: number };

type Pha = 'vi' | 'nhap' | 'soat' | 'chay' | 'xong';
const TEN_HOP_LE = /^[A-Za-z0-9 ]{2,32}$/;

export function CreateChainScreen() {
  const t = useT();
  const [phase, setPhase] = useState<Pha>('vi');
  const [session, setSession] = useState<WalletSession | null>(null);
  const [walletFailure, setWalletFailure] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const [state, setState] = useState<TrangThai | null>(null);
  const [ten, datTen] = useState('');
  // The initial value only lives until the first `/api/status`: if this id is not in the list
  // the console returns, the effect below replaces it with the first preset. It still has to
  // be right — `'chuan'` is the id from when presets were Vietnamese (D-108), and the API has
  // **no alias** for old ids, so a submit before status arrives would be refused outright.
  const [preset, datPreset] = useState('standard');

  const [progress, setProgress] = useState<Progress | null>(null);
  const [result, setResult] = useState<KetQua | null>(null);
  const [launchError, setLaunchError] = useState<string | null>(null);

  const [walletAdded, setWalletAdded] = useState(false);
  const [activated, setActivated] = useState<'chua' | 'dang' | 'xong'>('chua');
  // These two error slots replace the previous version's empty `catch {}`. Kept SEPARATE per
  // button: merging them means pressing one button erases the other one's explanation.
  const [addWalletError, setAddWalletError] = useState<string | null>(null);
  const [activateError, setActivateError] = useState<string | null>(null);

  // A suggested name from home-page variant B (`/console/?ten=…`) — accepted here too so both
  // variants share one path. Not auto-filled if the name is bad: filling in a wrong value and
  // making someone correct it is worse than leaving it empty.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('ten');
    if (q && TEN_HOP_LE.test(q.trim())) datTen(q.trim());
  }, []);

  const napTrangThai = useCallback(async (token: string) => {
    const s = await callConsole<TrangThai>('/api/status', token, undefined, CONSOLE_TIMEOUT_S);
    setState(s);
    if (s.presets?.length && !s.presets.some((p) => p.id === preset)) datPreset(s.presets[0].id);
  }, [preset]);

  async function vao() {
    setWalletFailure(null);
    setConnecting(true);
    try {
      const dc = await connectWallet();
      const p = await siweSignIn(dc);
      setSession(p);
      await napTrangThai(p.token);
      setPhase('nhap');
    } catch (e) {
      const m = String((e as Error).message ?? e);
      setWalletFailure(
        m === NO_WALLET ? t.launch.noWallet
          : /user rejected|denied|4001/i.test(m) ? t.launch.signRejected
          : m,
      );
    } finally {
      setConnecting(false);
    }
  }

  /* ── The progress polling loop ─────────────────────────────────────────────
     Poll every 2 seconds WHILE a launch is running, and only then. This is the only
     polling anywhere on the site: it has a clear end (the launch finishes), quite unlike
     a home page that polls forever.
     `/api/progress` is deliberately cheap — it touches neither docker nor RPC, it just
     returns what the console already holds in memory. */
  const dongHo = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (phase !== 'chay' || !session) return;
    const doc = async () => {
      try {
        setProgress(await callConsole<Progress>('/api/progress', session.token, undefined, CONSOLE_TIMEOUT_S));
      } catch {
        /* One failed read is NOT a reason to give up: the launch is still running on the
           server. Keep the last known step and read again on the next beat. */
      }
    };
    void doc();
    dongHo.current = setInterval(doc, 2000);
    return () => {
      if (dongHo.current) clearInterval(dongHo.current);
    };
  }, [phase, session]);

  async function de() {
    if (!session) return;
    setLaunchError(null);
    setPhase('chay');

    // 🔴 DO NOT conclude anything from this POST. Launching a chain takes ~170 seconds;
    // Cloudflare closes the connection at ~100 seconds and returns HTTP 524, so over the
    // public domain the POST **always** fails while the chain is created successfully anyway.
    // Reporting "could not launch" at that point invites the user to redo something already
    // done — and the surplus chain eats one of the 15 slots, permanently holding its name and chainId. See `waitForProgress`.
    //
    // 🔴 BUT "inconclusive" ≠ "wait to the end in every case".
    // Measured 2026-08-27: a POST with a bad token was refused **401 in 0.831 seconds**, and
    // the screen still sat frozen to the full wait ceiling, because `waitForProgress` only
    // exits once it has seen `running` and then seen it stop — and on an early refusal
    // `running` never turns on at all. The user watches a progress bar for work that **never started**.
    // `tuChoiSom` fixes that case and ONLY that case: 4xx = the server answered and the answer
    // was "no". 524/5xx/network drop still waits to the end, because that is the Cloudflare-cut case.
    let kqPost: KetQua | null = null;
    let loiPost: string | null = null;
    let biTuChoi = false;
    const post = callConsole<KetQua>('/api/create', session.token, { name: ten.trim(), preset })
      .then((k) => { kqPost = k; })
      .catch((e) => {
        loiPost = describeFailure(e, t.errors);
        if (e instanceof ConsoleError && e.laTuChoiThat) biTuChoi = true;
      });

    const tt2 = await waitForProgress(session.token, { tuChoiSom: () => biTuChoi });
    await post.catch(() => {});

    if (kqPost) {
      setResult(kqPost);
      setPhase('xong');
      void napTrangThai(session.token);
      return;
    }

    // The POST never came back ⇒ ask the DIRECTORY whether the chain actually exists.
    try {
      const st = await callConsole<{ chains: KetQua[] } & TrangThai>('/api/status', session.token, undefined, CONSOLE_TIMEOUT_S);
      setState(st);
      const co = st.chains.find((c) => c.name === ten.trim());
      if (co) {
        // The directory does not carry `luuY` (that is produced by `/api/create`), so rebuild the
        // instruction here rather than silently losing it.
        setResult({ ...co, luuY: { title: t.launch.noteTitle, cachLam: t.launch.noteHow } });
        setPhase('xong');
        return;
      }
    } catch { /* reading the directory failed — fall through to the error branch below */ }

    setLaunchError(interpolate(t.launch.launchError, { detail: tt2?.error ?? loiPost ?? t.launch.unknownError }));
    setPhase('nhap');
  }

  /* ──────────────────────────────────────────────────────────────────── UI */

  if (phase === 'vi') {
    return (
      <Card className="mt-8 max-w-xl p-5 md:p-6">
        <h2 className="font-display text-lg font-bold text-ink">{t.launch.connectWallet}</h2>
        <p className="mt-2 text-sm text-body-2">{t.launch.youWillOwn}</p>
        <div className="mt-5">
          <Button size="lg" onClick={vao} isRunning={connecting}>
            {connecting ? t.launch.signing : t.launch.connectWallet}
          </Button>
        </div>
        {walletFailure && (
          <div className="mt-4">
            <ErrorState title={walletFailure} desc="" onRetry={vao} />
          </div>
        )}
        {!getWallet() && (
          <div className="mt-4">
            <OpenInWallet fallback={<Note tone="warn">{t.launch.noWallet}</Note>} />
          </div>
        )}
      </Card>
    );
  }

  const soChain = state?.chains?.length ?? 0;
  const tran = state?.tran ?? 15;
  const hetCho = soChain >= tran;
  const tenSach = ten.trim();
  const tenOk = TEN_HOP_LE.test(tenSach);
  const presetHienTai = state?.presets?.find((p) => p.id === preset);

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <Card className="p-5 md:p-6">
        {phase === 'nhap' && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-ink">{t.launch.title}</h2>
              {/* 🔴 Show the ceiling BEFORE someone invests effort, not when they are refused. */}
              <Badge tone={hetCho ? 'warn' : 'good'}>
                {hetCho ? t.launch.slotsFull : interpolate(t.launch.slotsLeft, { left: tran - soChain, total: tran })}
              </Badge>
            </div>

            {hetCho && (
              <div className="mt-4">
                <Note tone="warn">{t.launch.slotsFullDesc}</Note>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-5">
              <Field
                label={t.launch.nameLabel}
                desc={t.launch.nameHelp}
                placeholder={t.launch.namePlaceholder}
                value={ten}
                onChange={(e) => datTen(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                failure={tenSach && !tenOk ? t.launch.nameInvalid : undefined}
              />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="kieu-chain" className="text-sm font-semibold text-ink">
                  {t.launch.typeLabel}
                </label>
                <p id="kieu-chain-mota" className="text-sm text-muted">
                  {t.launch.typeHelp}
                </p>
                {/* The list comes from the SERVER, not hard-coded on the client: hard-coding
                    means two places to keep in step, and the one that drifts is the one users see. */}
                {state ? (
                  <select
                    id="kieu-chain"
                    aria-describedby="kieu-chain-mota"
                    value={preset}
                    onChange={(e) => datPreset(e.target.value)}
                    className="h-12 w-full rounded-btn border border-line-strong bg-surface px-3 text-sm text-ink"
                  >
                    {state.presets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {presetText(t, p.id, p).name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Skeleton className="h-12 w-full" />
                )}
                {presetHienTai?.desc && (
                  // The description shows DIRECTLY UNDER the picker: genesis is immutable, so the
                  // user gets exactly one chance to read it.
                  <p className="text-sm text-body-2">{presetText(t, presetHienTai.id, presetHienTai).desc}</p>
                )}
              </div>
            </div>

            {launchError && (
              <div className="mt-5">
                <ErrorState title={launchError} desc="" />
              </div>
            )}

            <div className="mt-6">
              <Button size="lg" disabled={!tenOk || hetCho || !state} onClick={() => setPhase('soat')}>
                {t.launch.reviewCta}
              </Button>
            </div>
          </>
        )}

        {phase === 'soat' && (
          <>
            <h2 className="font-display text-lg font-bold text-ink">{t.launch.reviewTitle}</h2>
            <div className="mt-3 flex flex-col gap-3">
              <Note tone="warn">{t.launch.reviewDesc}</Note>
              {/* The re-genesis warning sits HERE and not only in the strip at the top of
                  the page: this is the last second before a one-way door, and the one place we
                  know for certain the user is reading. Remove it together with the banner strip after G-day. */}
              <Note tone="warn">
                {interpolate(t.launch.reviewRebuild, { date: t.rebuild.date })}
              </Note>
            </div>
            <dl className="mt-5 flex flex-col gap-3">
              {[
                { k: t.launch.reviewName, v: tenSach },
                { k: t.launch.reviewType, v: presetText(t, preset, presetHienTai).name },
                { k: t.launch.reviewOwner, v: session?.diaChi ?? '' },
              ].map((x) => (
                <div key={x.k} className="flex flex-col gap-1 border-b border-line-soft pb-3 last:border-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{x.k}</dt>
                  <dd className="break-all font-mono text-sm text-ink">{x.v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" onClick={de}>
                {t.launch.reviewConfirm}
              </Button>
              <Button size="lg" variant="outline" onClick={() => setPhase('nhap')}>
                {t.launch.reviewBack}
              </Button>
            </div>
          </>
        )}

        {phase === 'chay' && (
          <>
            <h2 className="font-display text-lg font-bold text-ink">
              {interpolate(t.launch.launching, { name: tenSach })}
            </h2>
            <p className="mt-2 text-sm text-body-2">{t.launch.launchingDesc}</p>
            <div className="mt-5">
              {progress?.steps?.length ? (
                <Steps
                  steps={localiseSteps(t, progress.steps)}
                  footnote={
                    progress.etaSeconds
                      ? interpolate(t.launch.etaRemaining, { minutes: Math.max(1, Math.ceil(progress.etaSeconds / 60)) })
                      : undefined
                  }
                />
              ) : (
                <p className="text-sm text-muted">{t.launch.preparing}</p>
              )}
            </div>
          </>
        )}

        {phase === 'xong' && result && (
          <>
            <h2 className="font-display text-lg font-bold text-success-ink">
              {interpolate(t.launch.doneTitle, { name: result.name })}
            </h2>
            <dl className="mt-4 flex flex-col gap-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{t.launch.doneChainId}</dt>
                <dd className="mt-1">
                  <Copyable value={String(result.chainId)} label={t.launch.doneChainId} />
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{t.launch.doneRpc}</dt>
                <dd className="mt-1">
                  <Copyable value={result.rpc} label={t.launch.doneRpc} />
                </dd>
              </div>
            </dl>

            {/* 🔴 `luuY` is a CLICKABLE ACTION, not a paragraph of warning.
                The trap: `eth_estimateGas` under-estimates for the FIRST transaction of a
                freshly launched chain (D-025) and fails silently. The cheapest way to open
                block 1 is an ordinary transfer — 21,000 gas is an EVM constant, so no estimate
                is needed. The button below does exactly that. */}
            {result.luuY && (
              <div className="mt-5">
                <Note>
                  <strong className="block font-semibold">{result.luuY.title}</strong>
                  <span className="mt-1 block">{result.luuY.cachLam}</span>
                </Note>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={async () => {
                  setAddWalletError(null);
                  try {
                    await addL1ToWallet({
                      chainIdHex: '0x' + result.chainId.toString(16),
                      name: result.name,
                      rpc: result.rpc,
                      // P-55: the L1's OWN ticker — `LOVE9` here made MetaMask print "50.00M LOVE9"
                      // for a freshly launched chain's test balance. See `lib/l1-symbol.ts`.
                      kyHieu: symbolOf(result),
                    });
                    setWalletAdded(true);
                  } catch (e) {
                    const l = readWalletError(e);
                    setAddWalletError(
                      l.rejected
                        ? t.common.walletRejected
                        : l.noWallet
                          ? t.errors.noWallet
                          : interpolate(t.launch.doneAddWalletError, { detail: l.detail ?? '' }),
                    );
                  }
                }}
              >
                {walletAdded ? t.launch.doneAdded : t.launch.doneAddWallet}
              </Button>

              <Button
                isRunning={activated === 'dang'}
                disabled={activated === 'xong'}
                onClick={async () => {
                  if (!session) return;
                  setActivated('dang');
                  setActivateError(null);
                  try {
                    await activateChain('0x' + result.chainId.toString(16), session.diaChi);
                    setActivated('xong');
                  } catch (e) {
                    setActivated('chua');
                    const l = readWalletError(e);
                    setActivateError(
                      l.rejected
                        ? t.common.walletRejected
                        : l.noWallet
                          ? t.errors.noWallet
                          : interpolate(t.launch.doneActivateError, { detail: l.detail ?? '' }),
                    );
                  }
                }}
              >
                {activated === 'xong' ? t.launch.doneActivated
                  : activated === 'dang' ? t.launch.doneActivating
                  : t.launch.doneActivate}
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  setResult(null);
                  setProgress(null);
                  datTen('');
                  setWalletAdded(false);
                  setActivated('chua');
                  setAddWalletError(null);
                  setActivateError(null);
                  setPhase('nhap');
                }}
              >
                {t.launch.launchAnother}
              </Button>
            </div>

            {/* 🔴 A PERMANENT live region, not one created along with its content. Screen
                readers only watch a live region that was already in the DOM — insert the
                region and the text together and nothing gets announced. This is the shape
                `Copyable` gets right, and the shape `Steps` gets wrong. */}
            <div role="status" aria-live="polite" className="mt-4 flex flex-col gap-2 empty:hidden">
              {addWalletError && <p className="text-sm text-danger">{addWalletError}</p>}
              {activateError && <p className="text-sm text-danger">{activateError}</p>}
            </div>
          </>
        )}
      </Card>

      <Card className="h-max p-5">
        <h2 className="font-display text-base font-bold text-ink">{t.launch.yourWallet}</h2>
        <p className="mt-2 break-all font-mono text-sm text-ink">{session ? shortenAddress(session.diaChi, 10, 8) : ''}</p>
        <p className="mt-2 text-sm text-body-2">{t.launch.youWillOwn}</p>
      </Card>
    </div>
  );
}
