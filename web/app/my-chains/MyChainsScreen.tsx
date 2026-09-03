'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, Field, Badge, Skeleton, ErrorState, Note, Copyable, EmptyState, Steps, type Step } from '@/components/ui';
import { shortenAddress } from '@/lib/eip55';
import { rpcOrigin } from '@/lib/chain';
import { interpolate, useT } from '@/lib/i18n';
import { fetchJson, describeFailure, READ_TIMEOUT_MS } from '@/lib/net';
import { getWallet, connectWallet, siweSignIn, callConsole, addL1ToWallet, waitForProgress, readWalletError, ConsoleError, NO_WALLET, type WalletSession, CONSOLE_TIMEOUT_S} from '@/lib/wallet';

type Chain = {
  name: string; chainId: number; subnetID: string; blockchainID: string;
  admin?: string; presetName?: string; presetTen?: string; rpc?: string;
};
type TrangThai = { tran: number; chains: Chain[]; retired: Chain[]; viDangNhap: string | null };
type Progress = { running: boolean; steps: Step[]; etaSeconds: number };

/** Số validator của một subnet — PHÉP ĐO SỐNG/CHẾT ĐÚNG.
 *
 * 🔴 KHÔNG đo bằng chiều cao block: **Avalanche không đẻ block rỗng**, nên một chain
 * hoàn toàn khoẻ mà chưa ai giao dịch vẫn đứng ở block 0 — số block đứng yên là
 * BÌNH THƯỜNG, không phải chain chết.
 *
 * 🔴 Và chỉ dùng phép đo này cho chain ĐANG SỐNG. Thu hồi **không** rút node khỏi
 * tập validator P-Chain, nên `getCurrentValidators` **vẫn trả đủ 5 validator cho
 * chain đã chết hẳn** — đem nó đo chain đã thu hồi thì nó nói dối rất thuyết phục.
 * Chain đã thu hồi vẽ từ mảng `retired` với nhãn riêng.
 */
async function demValidator(subnetID: string): Promise<number> {
  // Hạn giờ (Đ1-8) — an toàn: đây là lượt ĐỌC số validator của một subnet, không
  // phải `/api/create` hay `/api/revoke`. Không có hạn thì một RPC treo để cột
  // "tình trạng" quay mãi, và người dùng ngồi nhìn một cái vòng không bao giờ dừng.
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

  // Kết quả bấm "Thêm vào ví", THEO TỪNG CHAIN — màn này vẽ nhiều chain một lúc, nên
  // một ô lỗi dùng chung sẽ dán lỗi của chain này lên thẻ của chain khác.
  // Bản trước `catch {}` trắng: bấm xong không có gì đổi, cả lúc được lẫn lúc hỏng.
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

  // Đo validator cho từng chain SỐNG, mỗi chain một lần. Đo song song vì chúng độc
  // lập; một chain đo hỏng không được kéo cả bảng xuống.
  useEffect(() => {
    for (const c of cuaToi) {
      if (c.subnetID in validators) continue;
      // 🔴 Sentinel là `'dang'`, KHÔNG phải 0. **0 validator là một trạng thái
      // THẬT và nguy hiểm**: subnet mới đẻ có tập validator RỖNG, chain đó vẫn trả
      // lời `eth_chainId`, vẫn đọc được số dư, MetaMask vẫn kết nối — chỉ là **giao
      // dịch không bao giờ chốt**. Dùng 0 làm "đang tải" là che đúng cái trạng thái
      // không có dấu hiệu bề ngoài nào khác để nhận ra.
      setValidators((v) => ({ ...v, [c.subnetID]: 'dang' }));
      demValidator(c.subnetID)
        .then((n) => setValidators((v) => ({ ...v, [c.subnetID]: n })))
        .catch(() => setValidators((v) => ({ ...v, [c.subnetID]: 'errors' })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, session]);

  // Poll tiến trình CHỈ trong lúc thu hồi — có điểm dừng rõ.
  const dongHo = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!running || !session) return;
    const doc = async () => {
      try {
        setProgress(await callConsole<Progress>('/api/progress', session.token, undefined, CONSOLE_TIMEOUT_S));
      } catch { /* một nhịp hỏng không phải lý do bỏ cuộc — server vẫn đang chạy */ }
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

    // 🔴 KHÔNG `await` cái POST này để kết luận. Thao tác mất ~170 giây, Cloudflare
    // cắt kết nối ở ~100 giây (HTTP 524) ⇒ qua tên miền công khai, POST **luôn**
    // hỏng trong khi server vẫn làm xong. Xem `waitForProgress`.
    // 🔴 Nhưng 4xx thì KHÁC 524 — xem chú thích dài ở `CreateChainScreen.de()` và ở
    // `ConsoleError`. Server trả lời "không" (token hết hạn, tên không khớp xác nhận…)
    // nghĩa là việc chưa bắt đầu, và bắt người dùng nhìn thanh tiến trình thêm vài
    // phút cho một việc không tồn tại là nói dối theo một kiểu khác.
    let loiPost: string | null = null;
    let biTuChoi = false;
    const post = callConsole('/api/revoke', session.token, { name: c.name, xacNhan: c.name })
      .catch((e) => {
        loiPost = describeFailure(e, t.errors);
        if (e instanceof ConsoleError && e.laTuChoiThat) biTuChoi = true;
      });

    const check = await waitForProgress(session.token, { tuChoiSom: () => biTuChoi });
    await post.catch(() => {});

    // Sự thật nằm ở DANH BẠ, không ở mã HTTP: thu hồi thành công ⇔ chain không còn
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

  /* ───────────────────────────────────────────────────────────── giao diện */

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
        {!getWallet() && <div className="mt-4"><Note tone="warn">{t.launch.noWallet}</Note></div>}
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
                            await addL1ToWallet({ chainIdHex: '0x' + c.chainId.toString(16), name: c.name, rpc: c.rpc!, kyHieu: 'LOVE9' });
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
                      {/* Vùng live thường trú cho TỪNG thẻ chain — xem chú thích cùng
                          loại ở CreateChainScreen. */}
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
              {/* Chain đã thu hồi vẽ từ mảng `retired` với NHÃN RIÊNG — tuyệt đối
                  không đem đo bằng heuristic chain sống (xem demValidator). */}
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
            {/* Hai điều người dùng KHÔNG đoán được — phải nói thẳng, không rút gọn. */}
            <li className="font-semibold">{t.myChains.revokeWarn2}</li>
            <li className="font-semibold">{t.myChains.revokeWarn3}</li>
            <li>{t.myChains.revokeWarn4}</li>
          </ul>
          <div className="mt-4 max-w-sm">
            {/* Gõ lại tên: cùng luật với đường API (`xacNhan`). Một nút "Xoá" bấm
                nhầm được thì cửa một chiều trở thành một cú trượt tay. */}
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
