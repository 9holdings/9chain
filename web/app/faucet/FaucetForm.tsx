'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Field, Badge, Skeleton, ErrorState, Copyable, Note } from '@/components/ui';
import { checkAddress, shortenAddress } from '@/lib/eip55';
import { CHAIN, faucetOrigin, rpcCChain, explorerOrigin, addNetworkParams } from '@/lib/chain';
import { interpolate, useT } from '@/lib/i18n';
import { fetchJson, READ_TIMEOUT_MS } from '@/lib/net';
import { getWallet, readWalletError } from '@/lib/wallet';

type ThongTin = {
  amount: string;
  symbol: string;
  cooldownSeconds: number;
  perIp: { remaining: number; max: number; windowHours: number; retryAfter: number };
  global: { remaining: number; max: number };
};

type TrangThaiTin = { phase: 'tai' } | { phase: 'xong'; quota: ThongTin } | { phase: 'hong' };

// 🔴 `getWallet` đến từ `@/lib/wallet` — TRƯỚC ĐÂY tệp này có bản chép tay riêng, và bản
// đó bốc thẳng `window.ethereum`. Hai bản song song nghĩa là hai cách chọn ví khác
// nhau trong cùng một sản phẩm: faucet nói chuyện với ví này, màn đẻ chain với ví
// kia, và không màn nào nói cho người dùng biết. Một nguồn duy nhất, xem lib/wallet.

export function FaucetForm() {
  const t = useT();
  const [diaChi, datDiaChi] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ txHash: string; amount: string } | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [quota, setQuota] = useState<TrangThaiTin>({ phase: 'tai' });
  const [walletState, setWalletState] = useState<'chua' | 'xong' | 'errors' | 'tuChoi' | 'khongCo'>('chua');
  // Nguyên văn mã + thông điệp của ví. Hiện ra chứ không nuốt — xem chú thích ở `themMang`.
  const [walletFailure, setWalletFailure] = useState<string | null>(null);

  // Chỉ kiểm khi người dùng đã gõ gì đó — báo đỏ vào một ô trống mà họ chưa chạm
  // tới là mắng trước khi hỏi.
  const check = diaChi.trim() ? checkAddress(diaChi, t.faucet.addressLabel) : null;
  const hopLe = check?.ok === true;

  const napTin = useCallback(async () => {
    setQuota({ phase: 'tai' });
    try {
      // Hạn giờ (Đ1-8) — an toàn ở đây: `/api/info` là lượt ĐỌC hạn mức, không tiêu
      // suất và không đụng chain. (Đường tiêu suất là `/api/drip` bên dưới.)
      const quota = await fetchJson<ThongTin>(`${faucetOrigin()}/api/info`, {}, READ_TIMEOUT_MS / 1000);
      setQuota({ phase: 'xong', quota });
    } catch {
      // Không đọc được hạn mức KHÔNG phải lỗi chặn: người dùng vẫn xin được, chỉ là
      // không biết trước còn mấy lượt. Nói đúng điều đó thay vì dựng một màn lỗi.
      setQuota({ phase: 'hong' });
    }
  }, []);

  useEffect(() => {
    void napTin();
  }, [napTin]);

  /**
   * 🔴 KHÔNG `catch {}` Ở ĐÂY. Bản trước nuốt sạch lỗi rồi hiện đúng một câu
   * "Ví từ chối hoặc chưa cài" — gộp hai nguyên nhân khác hẳn nhau vào một chữ
   * "hoặc", nên khi nút này hỏng thật thì cả người dùng lẫn người sửa đều không có
   * gì để lần. Đã trả giá 2026-08-26.
   *
   * Cách đọc mã lỗi đã rút sang `readWalletError()` trong `lib/wallet.ts` — ba nút khác
   * trong site cần đúng khuôn này, và trước đó chúng `catch {}` trắng.
   */
  async function themMang() {
    const v = getWallet();
    if (!v) return setWalletState('khongCo');
    try {
      await v.request({ method: 'wallet_addEthereumChain', params: [addNetworkParams()] });
      setWalletState('xong');
      setWalletFailure(null);
    } catch (e) {
      const l = readWalletError(e);
      setWalletState(l.tuChoi ? 'tuChoi' : 'errors');
      setWalletFailure(l.ownerAddr);
    }
  }

  async function gui() {
    if (!check?.ok) return;
    setSending(true);
    setSendError(null);
    setResult(null);
    try {
      const r = await fetch(`${faucetOrigin()}/api/drip`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ address: check.diaChi }),
      });
      const j = (await r.json()) as { txHash?: string; amount?: string; error?: string };
      if (!r.ok || !j.txHash) throw new Error(j.error || `HTTP ${r.status}`);
      setResult({ txHash: j.txHash, amount: j.amount ?? '?' });
      // Xin xong thì hạn mức đã đổi — đọc lại để con số trên màn khớp sự thật.
      void napTin();
    } catch (e) {
      setSendError(interpolate(t.faucet.genericError, { detail: String((e as Error).message ?? e) }));
    } finally {
      setSending(false);
    }
  }

  const hetSuat = quota.phase === 'xong' && quota.quota.perIp.remaining === 0;

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <Card className="p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-ink">{t.faucet.title}</h2>
          <HanMuc quota={quota} onRetry={napTin} />
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <Button variant="outline" onClick={themMang}>
            {walletState === 'xong' ? t.faucet.addNetworkDone : t.faucet.addNetwork}
          </Button>
          {walletState === 'tuChoi' && <p className="text-sm text-body-2">{t.faucet.addNetworkRejected}</p>}
          {walletState === 'errors' && (
            <div className="text-sm text-body-2">
              <p>{t.faucet.addNetworkError}</p>
              {walletFailure && <p className="mt-1 break-words font-mono text-xs text-muted">{walletFailure}</p>}
            </div>
          )}
          {walletState === 'khongCo' && <p className="text-sm text-body-2">{t.faucet.noWallet}</p>}
        </div>

        <div className="mt-6">
          <Field
            label={t.faucet.addressLabel}
            desc={t.faucet.addressHelp}
            placeholder={t.faucet.addressPlaceholder}
            value={diaChi}
            onChange={(e) => datDiaChi(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            inputMode="text"
            failure={check && !check.ok ? check.failure : undefined}
            hint={check && !check.ok && check.hint ? check.hint : undefined}
          />
        </div>

        {hetSuat && (
          <div className="mt-4">
            <Note tone="warn">
              {interpolate(t.faucet.quotaExhausted, {
                minutes: Math.max(1, Math.ceil((quota.phase === 'xong' ? quota.quota.perIp.retryAfter : 60) / 60)),
              })}
            </Note>
          </div>
        )}

        <div className="mt-5">
          <Button size="lg" onClick={gui} isRunning={sending} disabled={!hopLe || hetSuat}>
            {sending ? t.faucet.sending : t.faucet.requestCta}
          </Button>
        </div>

        {result && (
          <div
            // `role="status"` để trình đọc màn hình đọc kết quả ngay, không cần
            // người dùng tự đi tìm xem chuyện gì vừa xảy ra.
            role="status"
            className="mt-5 rounded-card border border-success-line bg-success-bg px-4 py-3"
          >
            <p className="text-sm font-semibold text-success-ink">
              {interpolate(t.faucet.sentOk, {
                count: result.amount,
                symbol: CHAIN.kyHieu,
                address: shortenAddress(check?.ok ? check.diaChi : diaChi),
              })}
            </p>
            <a
              className="mt-2 inline-block text-sm font-semibold text-gold-ink-strong underline"
              href={`${explorerOrigin()}/tx/${result.txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              {t.faucet.viewTransaction} ↗
            </a>
          </div>
        )}

        {sendError && (
          <div className="mt-5">
            <ErrorState title={sendError} desc="" onRetry={gui} />
          </div>
        )}
      </Card>

      <ThongSoMang />
    </div>
  );
}

function HanMuc({ quota, onRetry }: { quota: TrangThaiTin; onRetry: () => void }) {
  const t = useT();
  if (quota.phase === 'tai') {
    return (
      <span className="flex items-center gap-2">
        <span className="sr-only">{t.common.loading}</span>
        <Skeleton className="h-6 w-32" />
      </span>
    );
  }
  if (quota.phase === 'hong') {
    return (
      <button type="button" onClick={onRetry} className="text-sm text-muted underline">
        {t.faucet.quotaUnreadable}
      </button>
    );
  }
  const { perIp } = quota.quota;
  return (
    <span className="flex items-center gap-2 text-sm text-body-2">
      {t.faucet.quotaLabel}
      <Badge tone={perIp.remaining > 0 ? 'good' : 'warn'}>
        {interpolate(t.faucet.quotaFormat, { left: perIp.remaining, total: perIp.max, hours: perIp.windowHours })}
      </Badge>
    </span>
  );
}

function ThongSoMang() {
  const t = useT();
  // Suy từ `location` lúc chạy — KHÔNG cắm cứng. Trang public cắm `localhost` là
  // trình duyệt người xem phân giải thành máy họ; explorer và dashboard của dự án
  // này đều đã dính đúng lỗi đó.
  const [rpc, datRpc] = useState('');
  useEffect(() => datRpc(rpcCChain()), []);

  const dong = [
    { label: t.faucet.settingsRpc, value: rpc },
    { label: t.faucet.settingsChainId, value: `${CHAIN.chainId} (${CHAIN.chainIdHex})` },
    { label: t.faucet.settingsSymbol, value: CHAIN.kyHieu },
    { label: t.faucet.settingsDecimals, value: String(CHAIN.decimals) },
  ];

  return (
    <Card className="h-max p-5">
      <h2 className="font-display text-base font-bold text-ink">{t.faucet.settingsTitle}</h2>
      <dl className="mt-4 flex flex-col gap-3">
        {dong.map((d) => (
          <div key={d.label} className="flex flex-col gap-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{d.label}</dt>
            <dd className="min-w-0">
              {d.value ? <Copyable value={d.value} label={d.label} /> : <Skeleton className="h-6 w-full" />}
            </dd>
          </div>
        ))}
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
            {t.faucet.settingsExplorer}
          </dt>
          <dd>
            <a
              href={explorerOrigin()}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-gold-ink-strong underline"
            >
              9Scan-A1 ↗
            </a>
          </dd>
        </div>
      </dl>
      {/* Vì sao dòng này đáng chỗ trên màn: người đọc `docs/TOKENOMICS.md` thấy
          "LOVE9 có 9 chữ số thập phân" rồi mở ví thấy 18 sẽ kết luận tài liệu sai.
          Cả hai đều đúng — P/X-Chain đếm nano, C-Chain là EVM — nhưng không ai tự
          suy ra được điều đó. Một câu ở đây rẻ hơn một hiểu nhầm về tokenomics. */}
      <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-muted">
        {t.faucet.decimalsHelp}
      </p>
    </Card>
  );
}
