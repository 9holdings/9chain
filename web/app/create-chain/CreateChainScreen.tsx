'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, Field, Badge, Skeleton, ErrorState, Note, Copyable, Steps, type Step } from '@/components/ui';
import { shortenAddress } from '@/lib/eip55';
import { interpolate, useT } from '@/lib/i18n';
import {
  getWallet, connectWallet, siweSignIn, callConsole, addL1ToWallet, activateChain, waitForProgress, ConsoleError,
  readWalletError, type WalletSession, CONSOLE_TIMEOUT_S} from '@/lib/wallet';

/**
 * Màn đẻ chain — màn khó nhất của M10, và ba sự thật của SẢN PHẨM ép hình dạng nó,
 * không phải thẩm mỹ:
 *
 * 1. 🔴 **Một lượt mất ~170 giây, và đó là CHỦ Ý** (5 node restart lần lượt để mạng
 *    không mất quorum; đổi lại RPC công khai chỉ gián đoạn 0,5s thay vì 6,0s).
 *    ⇒ **tiến trình theo BƯỚC**, không phải vòng xoay. Vòng xoay 170 giây đọc là
 *    "hỏng rồi", và lần bấm lại là một chain thừa ăn mất một slot trong trần 15.
 * 2. 🔴 **Genesis là BẤT BIẾN** ⇒ đây là **cửa một chiều**, phải có bước soát lại.
 * 3. 🔴 **Đăng nhập bằng ví thì `admin` bị ÉP = địa chỉ đã ký** ⇒ địa chỉ hiện ra
 *    như một **sự thật**, không phải một ô nhập. Ô nhập tay chỉ có ở đường token
 *    vận hành — mà đường đó không đi qua trang này.
 */

// 🔴 CÁC TRƯỜNG NÀY LÀ HỢP ĐỒNG VỚI `/api/status` CỦA CONSOLE — không phải tên ta tự đặt.
// Console (`local-net/lib/presets.mjs`) trả `{ id, name, desc }`. Trước 2026-08-30 tệp này
// khai `{ id, ten, moTa }`, tức tên CŨ từ thời id preset còn tiếng Việt (D-108) — nên
// `p.ten` luôn `undefined` và **mọi dòng trong ô chọn hiện ra TRỐNG**: người dùng phải
// chọn cấu hình VĨNH VIỄN cho chain của mình bằng cách bấm mù vào ô trắng.
// TypeScript không bắt được vì dữ liệu đến từ mạng, không từ mã.
type Preset = { id: string; name: string; desc?: string };
type TrangThai = {
  tran: number;
  chains: unknown[];
  presets: Preset[];
  dangNhap: string;
  viDangNhap: string | null;
};
type KetQua = { name: string; chainId: number; rpc: string; blockchainID: string; luuY?: { title: string; cachLam: string } };
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
  // Giá trị khởi tạo chỉ sống tới lượt `/api/status` đầu tiên: nếu id này không có trong
  // danh sách console trả về thì hiệu ứng bên dưới thay nó bằng preset đầu tiên. Vẫn phải
  // đúng — `'chuan'` là id thời preset còn tiếng Việt (D-108), và API **không có bí danh**
  // cho id cũ, nên một lượt gửi trước khi status kịp về sẽ bị từ chối thẳng.
  const [preset, datPreset] = useState('standard');

  const [progress, setProgress] = useState<Progress | null>(null);
  const [result, setResult] = useState<KetQua | null>(null);
  const [launchError, setLaunchError] = useState<string | null>(null);

  const [walletAdded, setWalletAdded] = useState(false);
  const [activated, setActivated] = useState<'chua' | 'dang' | 'xong'>('chua');
  // Hai ô lỗi này thay cho `catch {}` trắng của bản trước. Giữ RIÊNG cho từng nút:
  // gộp chung thì bấm nút này lại xoá lời giải thích của nút kia.
  const [addWalletError, setAddWalletError] = useState<string | null>(null);
  const [activateError, setActivateError] = useState<string | null>(null);

  // Tên gợi ý từ trang chủ bản B (`/console/?ten=…`) — nhận cả ở đây để hai bản
  // dùng chung một đường. Không tự điền nếu tên xấu: điền một giá trị sai rồi bắt
  // người ta sửa còn tệ hơn để trống.
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
        m === 'KHONG_CO_VI' ? t.launch.noWallet
          : /user rejected|denied|4001/i.test(m) ? t.launch.signRejected
          : m,
      );
    } finally {
      setConnecting(false);
    }
  }

  /* ── Vòng đọc tiến trình ──────────────────────────────────────────────────
     Poll 2 giây một lần TRONG LÚC đang đẻ, và chỉ khi đó. Đây là chỗ duy nhất
     trong cả trang có polling: nó có điểm dừng rõ (lượt đẻ kết thúc), khác hẳn
     một trang chủ poll mãi mãi.
     `/api/progress` cố ý rẻ — nó không chạm docker hay RPC, chỉ trả lại thứ đã
     ghi sẵn trong bộ nhớ console. */
  const dongHo = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (phase !== 'chay' || !session) return;
    const doc = async () => {
      try {
        setProgress(await callConsole<Progress>('/api/progress', session.token, undefined, CONSOLE_TIMEOUT_S));
      } catch {
        /* Một nhịp đọc hỏng KHÔNG phải lý do để bỏ cuộc: lượt đẻ vẫn đang chạy ở
           server. Giữ nguyên bước cuối đã biết và đọc lại ở nhịp sau. */
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

    // 🔴 KHÔNG kết luận từ cái POST này. Đẻ chain mất ~170 giây; Cloudflare cắt kết
    // nối ở ~100 giây và trả HTTP 524, nên qua tên miền công khai lượt POST **luôn**
    // hỏng trong khi chain vẫn được đẻ xong. Báo "không đẻ được" lúc đó là mời người
    // dùng bấm lại một việc đã xong — và chain thừa ăn mất một slot trong trần 15,
    // vĩnh viễn giữ luôn tên và chainId. Xem `waitForProgress`.
    //
    // 🔴 NHƯNG "không kết luận được" ≠ "chờ tới cùng trong mọi trường hợp".
    // Đo 2026-08-27: POST với token hỏng bị từ chối **401 trong 0,831 giây**, mà màn
    // hình vẫn đứng im tới trần chờ, vì `waitForProgress` chỉ thoát khi đã thấy
    // `running` rồi lại thấy hết chạy — mà từ chối sớm thì `running` không bao giờ
    // bật. Người dùng nhìn một thanh tiến trình cho một việc **chưa hề bắt đầu**.
    // `tuChoiSom` vá đúng ca đó và CHỈ ca đó: 4xx = server đã trả lời và trả lời
    // "không". 524/5xx/đứt mạng vẫn chờ tới cùng, vì đó mới là ca Cloudflare cắt.
    let kqPost: KetQua | null = null;
    let loiPost: string | null = null;
    let biTuChoi = false;
    const post = callConsole<KetQua>('/api/create', session.token, { name: ten.trim(), preset })
      .then((k) => { kqPost = k; })
      .catch((e) => {
        loiPost = String((e as Error).message ?? e);
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

    // POST không về được ⇒ hỏi DANH BẠ xem chain có thật sự tồn tại không.
    try {
      const st = await callConsole<{ chains: KetQua[] } & TrangThai>('/api/status', session.token, undefined, CONSOLE_TIMEOUT_S);
      setState(st);
      const co = st.chains.find((c) => c.name === ten.trim());
      if (co) {
        // Danh bạ không mang `luuY` (nó do `/api/create` sinh ra), nên dựng lại lời
        // dặn ở đây thay vì im lặng bỏ mất nó.
        setResult({ ...co, luuY: { title: t.launch.noteTitle, cachLam: t.launch.noteHow } });
        setPhase('xong');
        return;
      }
    } catch { /* đọc danh bạ hỏng — rơi xuống nhánh báo lỗi bên dưới */ }

    setLaunchError(interpolate(t.launch.launchError, { chiTiet: tt2?.error ?? loiPost ?? t.launch.unknownError }));
    setPhase('nhap');
  }

  /* ─────────────────────────────────────────────────────────────── giao diện */

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
            <Note tone="warn">{t.launch.noWallet}</Note>
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
              {/* 🔴 Trần hiện TRƯỚC khi người ta bỏ công, không phải lúc bị từ chối. */}
              <Badge tone={hetCho ? 'warn' : 'good'}>
                {hetCho ? t.launch.slotsFull : interpolate(t.launch.slotsLeft, { con: tran - soChain, tong: tran })}
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
                {/* Danh sách do SERVER cấp, không cắm cứng ở client: cắm cứng là hai
                    nơi phải giữ cho khớp, và bên trôi lệch sẽ là bên người dùng thấy. */}
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
                        {p.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Skeleton className="h-12 w-full" />
                )}
                {presetHienTai?.desc && (
                  // Mô tả hiện NGAY DƯỚI ô chọn: genesis bất biến nên người dùng chỉ
                  // có đúng một lần đọc.
                  <p className="text-sm text-body-2">{presetHienTai.desc}</p>
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
              {/* Cảnh báo re-genesis đặt ở ĐÂY chứ không chỉ ở dải trên đầu trang:
                  đây là giây cuối trước cửa một chiều, và là chỗ duy nhất chắc chắn
                  người dùng đang đọc. Gỡ cùng lúc với dải banner sau ngày G. */}
              <Note tone="warn">
                {interpolate(t.launch.reviewRebuild, { ngay: t.rebuild.date })}
              </Note>
            </div>
            <dl className="mt-5 flex flex-col gap-3">
              {[
                { k: t.launch.reviewName, v: tenSach },
                { k: t.launch.reviewType, v: presetHienTai?.name ?? preset },
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
              {interpolate(t.launch.launching, { ten: tenSach })}
            </h2>
            <p className="mt-2 text-sm text-body-2">{t.launch.launchingDesc}</p>
            <div className="mt-5">
              {progress?.steps?.length ? (
                <Steps
                  steps={progress.steps}
                  footnote={
                    progress.etaSeconds
                      ? interpolate(t.launch.etaRemaining, { phut: Math.max(1, Math.ceil(progress.etaSeconds / 60)) })
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
              {interpolate(t.launch.doneTitle, { ten: result.name })}
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

            {/* 🔴 `luuY` là một VIỆC BẤM ĐƯỢC, không phải một đoạn văn cảnh báo.
                Bẫy: `eth_estimateGas` ước lượng THIẾU cho giao dịch ĐẦU TIÊN của
                chain vừa đẻ (D-025) và hỏng câm. Cách rẻ nhất để mở block 1 là một
                giao dịch chuyển tiền thường — 21.000 gas là hằng số EVM nên không
                cần ước lượng. Nút dưới đây làm đúng việc đó. */}
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
                      kyHieu: 'LOVE9',
                    });
                    setWalletAdded(true);
                  } catch (e) {
                    const l = readWalletError(e);
                    setAddWalletError(
                      l.tuChoi ? t.common.walletRejected : interpolate(t.launch.doneAddWalletError, { chiTiet: l.ownerAddr ?? '' }),
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
                      l.tuChoi ? t.common.walletRejected : interpolate(t.launch.doneActivateError, { chiTiet: l.ownerAddr ?? '' }),
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

            {/* 🔴 Vùng live THƯỜNG TRÚ, không phải sinh ra cùng nội dung. Trình đọc
                màn hình chỉ theo dõi vùng live đã có sẵn trong DOM — chèn cả vùng
                lẫn chữ vào cùng lúc thì nó không đọc gì. Đây là khuôn `Copyable`
                đang làm đúng, và là khuôn `Steps` đang làm sai. */}
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
