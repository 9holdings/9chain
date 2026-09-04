'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, Field, Badge, Skeleton, ErrorState, Note, Copyable, EmptyState, Steps, type Step } from '@/components/ui';
import { shortenAddress } from '@/lib/eip55';
import { OpenInWallet } from '@/components/OpenInWallet';
import { symbolOf } from '@/lib/l1-symbol';
import { rpcOrigin } from '@/lib/chain';
import { interpolate, useT } from '@/lib/i18n';
import { fetchJson, describeFailure, READ_TIMEOUT_MS } from '@/lib/net';
import { getWallet, connectWallet, siweSignIn, callConsole, addL1ToWallet, waitForProgress, readWalletError, ConsoleError, NO_WALLET, type WalletSession, CONSOLE_TIMEOUT_S} from '@/lib/wallet';

type Chain = {
  name: string; chainId: number; subnetID: string; blockchainID: string;
  admin?: string; presetName?: string; presetTen?: string; rpc?: string; symbol?: string;
};
type TrangThai = { tran: number; chains: Chain[]; retired: Chain[]; viDangNhap: string | null };
type Progress = { running: boolean; steps: Step[]; etaSeconds: number };

/** A subnet's validator count — THE CORRECT ALIVE/DEAD MEASUREMENT.
 *
 * 🔴 Do NOT measure by block height: **Avalanche does not produce empty blocks**, so a
 * perfectly healthy chain nobody has transacted on still sits at block 0 — a block count that
 * does not move is NORMAL, not a dead chain.
 *
 * 🔴 And only use this measurement on a LIVE chain. Revoking does **not** remove the nodes from
 * the P-Chain validator set, so `getCurrentValidators` **still returns all 5 validators for a
 * chain that is thoroughly dead** — pointed at a revoked chain it lies very convincingly.
 * Revoked chains are rendered from the `retired` array with their own label.
 */
async function demValidator(subnetID: string): Promise<number> {
  // Timeout (Đ1-8) — safe here: this is a READ of a subnet's validator count, not
  // `/api/create` or `/api/revoke`. Without a limit, one hung RPC leaves the "status" column
  // spinning forever, and the user sits watching a wheel that never stops.
  const j = await fetchJson<{ result?: { validators?: unknown[] }; error?: { message?: string } }>(
    `${rpcOrigin()}/ext/bc/P`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1, method: 'platform.getCurrentValidators', params: { subnetID },
      }),
    },
    READ_TIMEOUT_MS / 1000,
  );
  if (j.error) throw new Error(j.error.message);
  return (j.result?.validators ?? []).length;
}

export function MyChainsScreen() {
  const t = useT();
  const [session, setSession] = useState<WalletSession | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [walletFailure, setWalletFailure] = useState<string | null>(null);

  const [state, setState] = useState<TrangThai | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [validators, setValidators] = useState<Record<string, number | 'dang' | 'errors'>>({});

  // The result of pressing "Add to wallet", PER CHAIN — this screen renders several chains at
  // once, so a single shared error slot would paste one chain's error onto another's card.
  // The previous version had an empty `catch {}`: pressing it changed nothing, on success or failure.
  const [addedToWallet, setAddedToWallet] = useState<Record<number, { finished: true } | { finished: false; message: string }>>({});

  const [revoking, setRevoking] = useState<Chain | null>(null);
  const [typedName, setTypedName] = useState('');
  const [running, setRunning] = useState<{ ten: string } | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [finished, setFinished] = useState<string | null>(null);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  const nap = useCallback(async (token: string) => {
    setLoadError(false);
    try {
      setState(await callConsole<TrangThai>('/api/status', token, undefined, CONSOLE_TIMEOUT_S));
    } catch {
      setLoadError(true);
    }
  }, []);

  async function vao() {
    setWalletFailure(null);
    setConnecting(true);
    try {
      const dc = await connectWallet();
      const p = await siweSignIn(dc);
      setSession(p);
      await nap(p.token);
    } catch (e) {
      const m = String((e as Error).message ?? e);
      setWalletFailure(m === NO_WALLET ? t.launch.noWallet : /rejected|denied|4001/i.test(m) ? t.launch.signRejected : m);
    } finally {
      setConnecting(false);
    }
  }

  const cuaToi = (state?.chains ?? []).filter(
    (c) => session && typeof c.admin === 'string' && c.admin.toLowerCase() === session.diaChi.toLowerCase(),
  );
  const cuaToiDaThuHoi = (state?.retired ?? []).filter(
    (c) => session && typeof c.admin === 'string' && c.admin.toLowerCase() === session.diaChi.toLowerCase(),
  );

  // Measure validators for each LIVE chain, once each. In parallel because they are independent;
  // one chain failing to measure must not drag the whole table down.
  useEffect(() => {
    for (const c of cuaToi) {
      if (c.subnetID in validators) continue;
      // 🔴 The sentinel is `'dang'`, NOT 0. **0 validators is a REAL and dangerous state**:
      // a freshly created subnet has an EMPTY validator set — that chain still answers
      // `eth_chainId`, balances still read, MetaMask still connects — it is only that
      // **transactions never finalise**. Using 0 as "loading" hides precisely the state that has
      // no other outward sign to recognise it by.
      setValidators((v) => ({ ...v, [c.subnetID]: 'dang' }));
      demValidator(c.subnetID)
        .then((n) => setValidators((v) => ({ ...v, [c.subnetID]: n })))
        .catch(() => setValidators((v) => ({ ...v, [c.subnetID]: 'errors' })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, session]);

  // Poll progress ONLY while a revoke is running — it has a clear end.
  const dongHo = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!running || !session) return;
    const doc = async () => {
      try {
        setProgress(await callConsole<Progress>('/api/progress', session.token, undefined, CONSOLE_TIMEOUT_S));
      } catch { /* one failed beat is no reason to give up — the server is still working */ }
    };
    void doc();
    dongHo.current = setInterval(doc, 2000);
    return () => { if (dongHo.current) clearInterval(dongHo.current); };
  }, [running, session]);

  async function thucHienThuHoi(c: Chain) {
    if (!session) return;
    setRevokeError(null);
    setRevoking(null);
    setRunning({ ten: c.name });

    // 🔴 Do NOT `await` this POST to reach a conclusion. The operation takes ~170 seconds,
    // Cloudflare closes the connection at ~100 seconds (HTTP 524) ⇒ over the public domain the
    // POST **always** fails while the server finishes anyway. See `waitForProgress`.
    // 🔴 But a 4xx is NOT a 524 — see the long comment in `CreateChainScreen.de()` and on
    // `ConsoleError`. The server answering "no" (expired token, name not matching the
    // confirmation…) means the work never started, and making the user watch a progress bar for
    // several more minutes for work that does not exist is lying in a different way.
    let loiPost: string | null = null;
    let biTuChoi = false;
    const post = callConsole('/api/revoke', session.token, { name: c.name, xacNhan: c.name })
      .catch((e) => {
        loiPost = describeFailure(e, t.errors);
        if (e instanceof ConsoleError && e.laTuChoiThat) biTuChoi = true;
      });

    const check = await waitForProgress(session.token, { tuChoiSom: () => biTuChoi });
    await post.catch(() => {});

    // The truth lives in the DIRECTORY, not in the HTTP status: a revoke succeeded ⇔ the chain
    // trong `chains`.
    let conSong = true;
    try {
      const st = await callConsole<TrangThai>('/api/status', session.token, undefined, CONSOLE_TIMEOUT_S);
      setState(st);
      conSong = st.chains.some((x) => x.name === c.name);
      if (!conSong) {
        setFinished(interpolate(t.myChains.revokeDone, {
          name: c.name, left: st.tran - st.chains.length, total: st.tran,
        }));
      }
    } catch {
      setLoadError(true);
    }
    if (conSong) {
      setRevokeError(interpolate(t.myChains.revokeError, {
        detail: check?.error ?? loiPost ?? t.myChains.revokeUnknown,
      }));
    }

    setRunning(null);
    setProgress(null);
    setTypedName('');
  }

  /* ──────────────────────────────────────────────────────────────────── UI */

  if (!session) {
    return (
      <Card className="mt-8 max-w-xl p-5 md:p-6">
        <h2 className="font-display text-lg font-bold text-ink">{t.myChains.connectWallet}</h2>
        <div className="mt-4">
          <Button size="lg" onClick={vao} isRunning={connecting}>
            {connecting ? t.launch.signing : t.launch.connectWallet}
          </Button>
        </div>
        {walletFailure && <div className="mt-4"><ErrorState title={walletFailure} desc="" onRetry={vao} /></div>}
        {!getWallet() && <div className="mt-4"><OpenInWallet fallback={<Note tone="warn">{t.launch.noWallet}</Note>} /></div>}
      </Card>
    );
  }

  if (running) {
    return (
      <Card className="mt-8 max-w-2xl p-5 md:p-6">
        <h2 className="font-display text-lg font-bold text-ink">
          {interpolate(t.myChains.revoking, { name: running.ten })}
        </h2>
        <div className="mt-4">
          {progress?.steps?.length ? (
            <Steps
              steps={progress.steps}
              footnote={progress.etaSeconds
                ? interpolate(t.launch.etaRemaining, { minutes: Math.max(1, Math.ceil(progress.etaSeconds / 60)) })
                : undefined}
            />
          ) : (
            <p className="text-sm text-muted">{t.launch.preparing}</p>
          )}
        </div>
      </Card>
    );
  }

  if (loadError) return <div className="mt-8 max-w-xl"><ErrorState onRetry={() => nap(session.token)} /></div>;
  if (!state) {
    return (
      <Card className="mt-8 p-5">
        <span className="sr-only">{t.common.loading}</span>
        <div className="flex flex-col gap-3">{[0, 1].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      </Card>
    );
  }

  return (
    <div className="mt-8 flex max-w-3xl flex-col gap-6">
      {finished && (
        <div role="status" className="rounded-card border border-success-line bg-success-bg px-4 py-3 text-sm font-semibold text-success-ink">
          {finished}
        </div>
      )}
      {revokeError && <ErrorState title={revokeError} desc="" />}

      {!cuaToi.length && !cuaToiDaThuHoi.length ? (
        <EmptyState
          title={t.myChains.emptyTitle}
          desc={t.myChains.emptyDesc}
          action={
            <a href="/create-chain/" className="inline-flex h-11 items-center rounded-btn bg-gold px-4 text-sm font-semibold text-navy hover:bg-gold-hover">
              {t.myChains.emptyCta}
            </a>
          }
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {cuaToi.map((c) => {
            const v = validators[c.subnetID];
            return (
              <li key={c.chainId}>
                <Card className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-lg font-bold text-ink">
                        {c.name}
                        <span className="ms-2 font-mono text-xs font-normal text-muted">#{c.chainId}</span>
                      </h2>
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                        {(c.presetName ?? c.presetTen) && <Badge>{c.presetName ?? c.presetTen}</Badge>}
                        {v === undefined || v === 'dang' ? (
                          <span className="text-muted">{t.myChains.measuring}</span>
                        ) : v === 'errors' ? (
                          <span className="text-muted">{t.myChains.cannotMeasure}</span>
                        ) : v === 0 ? (
                          <Badge tone="warn">{t.myChains.noValidators}</Badge>
                        ) : (
                          <Badge tone="good">{interpolate(t.myChains.validatorCount, { count: v })}</Badge>
                        )}
                      </p>
                      <p className="mt-1 text-xs text-muted">{t.myChains.statusHelp}</p>
                      {v === 0 && (
                        <p className="mt-2 max-w-prose text-sm font-semibold text-dev-ink">
                          {t.myChains.noValidatorsDesc}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" onClick={() => { setRevoking(c); setTypedName(''); }}>
                      {t.myChains.revoke}
                    </Button>
                  </div>

                  <dl className="mt-4 flex flex-col gap-2">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{t.myChains.walletSettings}</dt>
                    <dd className="flex flex-wrap gap-2">
                      {c.rpc && <Copyable value={c.rpc} label="RPC" />}
                      <Copyable value={String(c.chainId)} label="Chain ID" />
                    </dd>
                  </dl>

                  {c.rpc && (
                    <div className="mt-3">
                      <Button
                        variant="ghost"
                        onClick={async () => {
                          try {
                            // P-55: the L1's OWN ticker, never `LOVE9` — see `lib/l1-symbol.ts`.
                            await addL1ToWallet({ chainIdHex: '0x' + c.chainId.toString(16), name: c.name, rpc: c.rpc!, kyHieu: symbolOf(c) });
                            setAddedToWallet((s) => ({ ...s, [c.chainId]: { finished: true } }));
                          } catch (e) {
                            const l = readWalletError(e);
                            setAddedToWallet((s) => ({
                              ...s,
                              [c.chainId]: {
                                finished: false,
                                message: l.rejected
                                  ? t.common.walletRejected
                                  : l.noWallet
                                    ? t.errors.noWallet
                                    : interpolate(t.myChains.addWalletError, { detail: l.detail ?? '' }),
                              },
                            }));
                          }
                        }}
                      >
                        {addedToWallet[c.chainId]?.finished ? t.myChains.addedToWallet : t.myChains.addToWallet}
                      </Button>
                      {/* A permanent live region for EACH chain card — see the comment of the
                          same kind in CreateChainScreen. */}
                      <div role="status" aria-live="polite" className="mt-2 empty:hidden">
                        {addedToWallet[c.chainId]?.finished === false && (
                          <p className="text-sm text-danger">
                            {(addedToWallet[c.chainId] as { message: string }).message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              </li>
            );
          })}

          {cuaToiDaThuHoi.map((c) => (
            <li key={`r-${c.chainId}`}>
              {/* Revoked chains are rendered from the `retired` array with THEIR OWN LABEL —
                  never measured with the live-chain heuristic (see demValidator). */}
              <Card className="border-dashed p-5 opacity-80">
                <h2 className="font-display text-base font-bold text-muted">
                  {c.name}
                  <span className="ms-2 font-mono text-xs font-normal">#{c.chainId}</span>
                </h2>
                <p className="mt-1 text-sm">
                  <Badge tone="bad">{t.myChains.revokedBadge}</Badge>
                  <span className="ms-2 text-muted">{t.myChains.revokedDesc}</span>
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {revoking && (
        <Card className="border-dev-line p-5">
          <h2 className="font-display text-lg font-bold text-ink">
            {interpolate(t.myChains.revokeTitle, { name: revoking.name })}
          </h2>
          <ul className="mt-3 flex list-disc flex-col gap-2 ps-5 text-sm text-body">
            <li>{t.myChains.revokeWarn1}</li>
            {/* The two things a user cannot guess — say them plainly, do not abbreviate. */}
            <li className="font-semibold">{t.myChains.revokeWarn2}</li>
            <li className="font-semibold">{t.myChains.revokeWarn3}</li>
            <li>{t.myChains.revokeWarn4}</li>
          </ul>
          <div className="mt-4 max-w-sm">
            {/* Retype the name: the same rule as the API path (`xacNhan`). A "Delete" button
                that can be pressed by accident turns a one-way door into a slip of the hand. */}
            <Field
              label={t.myChains.revokeTypeLabel}
              placeholder={revoking.name}
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              failure={typedName && typedName !== revoking.name ? t.myChains.revokeNameMismatch : undefined}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button disabled={typedName !== revoking.name} onClick={() => thucHienThuHoi(revoking)}>
              {t.myChains.revokeConfirm}
            </Button>
            <Button variant="ghost" onClick={() => { setRevoking(null); setTypedName(''); }}>
              {t.myChains.revokeCancel}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
