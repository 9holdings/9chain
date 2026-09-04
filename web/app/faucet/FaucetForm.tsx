'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, Field, Badge, Skeleton, ErrorState, Copyable, Note } from '@/components/ui';
import { checkAddress, shortenAddress, toChecksumAddress } from '@/lib/eip55';
import { CHAIN, faucetOrigin, rpcCChain, explorerOrigin, addNetworkParams } from '@/lib/chain';
import { interpolate, useT } from '@/lib/i18n';
import { fetchJson, READ_TIMEOUT_MS } from '@/lib/net';
import {
  connectWallet,
  getWallet,
  readWalletAccount,
  readWalletError,
  watchWalletAccount,
} from '@/lib/wallet';
import { OpenInWallet, useMobileNoWallet } from '@/components/OpenInWallet';

type ThongTin = {
  amount: string;
  symbol: string;
  cooldownSeconds: number;
  perIp: { remaining: number; max: number; windowHours: number; retryAfter: number };
  global: { remaining: number; max: number };
};

type TrangThaiTin = { phase: 'tai' } | { phase: 'xong'; quota: ThongTin } | { phase: 'hong' };

// 🔴 `getWallet` comes from `@/lib/wallet` — this file USED to have its own hand-copied
// version, and that one grabbed `window.ethereum` directly. Two parallel versions means two
// different ways of choosing a wallet inside one product: the faucet talks to one wallet, the
// launch screen to another, and neither screen tells the user. One source; see lib/wallet.

export function FaucetForm() {
  const t = useT();
  const [diaChi, datDiaChi] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ txHash: string; amount: string } | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [quota, setQuota] = useState<TrangThaiTin>({ phase: 'tai' });
  const [walletState, setWalletState] = useState<'chua' | 'xong' | 'errors' | 'tuChoi' | 'khongCo'>('chua');
  // The wallet's code and message verbatim. Shown, not swallowed — see the comment on `themMang`.
  const [walletFailure, setWalletFailure] = useState<string | null>(null);
  // On a phone with no wallet, "install MetaMask and reload" is a dead end — `<OpenInWallet />`
  // below offers the deep link instead, and the desktop sentence is suppressed.
  const mobileNoWallet = useMobileNoWallet();

  /**
   * ═══ THE ADDRESS FIELD FILLS ITSELF FROM THE WALLET (David, 2026-09-04, from his phone) ═══
   * He had just pressed "Add network to wallet", the button already read "Added to wallet" — and
   * the page still asked him to paste the address of the very wallet he was standing inside.
   * Inside the MetaMask app's browser, typing a 42-character address by hand is also the single
   * most error-prone thing this page can ask for.
   *
   * Two rules hold it honest:
   * ① **Never overwrite the person.** `daSuaTay` latches the moment the user types, and from
   *    then on nothing — not a wallet connecting, not an account switch — touches the field.
   *    The faucet sends to whatever this field holds; a field that rewrites itself under the
   *    reader would send tokens somewhere they never chose.
   * ② **Never prompt unasked.** Page load uses the silent `eth_accounts`; the popup only ever
   *    follows a press (`themMang`, or the button under the field).
   */
  const [viDiaChi, datViDiaChi] = useState<string | null>(null);
  const [coVi, datCoVi] = useState(false);
  // A ref, not state: it is read inside a callback that must see the LATEST value, and it must
  // not schedule a render of its own. (Reading it from a `useState` updater would fire a setState
  // inside a reducer — which StrictMode runs twice.)
  const daSuaTay = useRef(false);

  const dienTuVi = useCallback((dc: string | null) => {
    if (!dc) return;
    // Checksummed, because that is the form the field validates against and the form a person
    // can compare against their wallet screen character by character.
    const chuan = toChecksumAddress(dc);
    datViDiaChi(chuan);
    if (!daSuaTay.current) datDiaChi(chuan);
  }, []);

  useEffect(() => {
    let song = true;
    // The account watcher is re-attached on every read, because the wallet it should listen to
    // may not have existed at the first one.
    let thoiTheoDoi = () => {};
    const doc = (cho = 0) => {
      if (!song) return;
      datCoVi(!!getWallet());
      thoiTheoDoi();
      thoiTheoDoi = watchWalletAccount((dc) => song && dienTuVi(dc));
      void readWalletAccount(cho).then((dc) => song && dienTuVi(dc));
    };
    doc(1200);
    // 🔴 A wallet may announce itself LATER than any deadline we pick — the user unlocks it, or
    // the extension is simply slow. Waiting once and concluding "no wallet" is how the manual
    // button below would end up permanently hidden for exactly the people who need it. Listening
    // costs nothing and has no deadline to get wrong.
    const khiKhai = () => doc(0);
    window.addEventListener('eip6963:announceProvider', khiKhai);
    return () => {
      song = false;
      window.removeEventListener('eip6963:announceProvider', khiKhai);
      thoiTheoDoi();
    };
  }, [dienTuVi]);

  // Only validate once the user has typed something — flashing red at an empty field they have
  // not touched is scolding before asking.
  const check = diaChi.trim() ? checkAddress(diaChi) : null;
  // 🔴 The wording is looked up HERE, not inside `lib/eip55.ts`. A pure function cannot call
  // `useT()`, so every sentence it builds itself is frozen in one language — see the comment on
  // the `errors` block in `lib/i18n/en.ts`.
  const CHECK_MSG = {
    empty: t.errors.addressEmpty,
    format: t.errors.addressFormat,
    checksum: t.errors.addressChecksum,
    zero: t.errors.addressZero,
  } as const;
  const hopLe = check?.ok === true;

  const napTin = useCallback(async () => {
    setQuota({ phase: 'tai' });
    try {
      // Timeout (Đ1-8) — safe here: `/api/info` is a READ of the quota, it spends nothing and does
      // not touch the chain. (The spending path is `/api/drip` below.)
      const quota = await fetchJson<ThongTin>(`${faucetOrigin()}/api/info`, {}, READ_TIMEOUT_MS / 1000);
      setQuota({ phase: 'xong', quota });
    } catch {
      // Failing to read the quota is NOT a blocking error: the user can still request, they just do
      // not know in advance how many attempts remain. Say exactly that rather than build an error screen.
      setQuota({ phase: 'hong' });
    }
  }, []);

  useEffect(() => {
    void napTin();
  }, [napTin]);

  /**
   * 🔴 NO `catch {}` HERE. The previous version swallowed every error and showed one sentence,
   * "The wallet refused or is not installed" — merging two completely different causes under an
   * "or", so when this button genuinely broke neither the user nor whoever was fixing it had
   * anything to follow. Paid for on 2026-08-26.
   *
   * Reading the error code has moved into `readWalletError()` in `lib/wallet.ts` — three other
   * buttons on the site need exactly this shape, and before that they had an empty `catch {}`.
   */
  /**
   * Ask the wallet for its address. Prompts — so it only ever runs from a press.
   *
   * 🔴 A refusal here is NOT an error and must not paint one: declining to share an address is
   * an ordinary answer, and the user can still type an address by hand. It also must not stop
   * whatever the press was really about — adding the network does not need an account at all.
   */
  async function xinDiaChi() {
    try {
      dienTuVi(await connectWallet());
    } catch {
      /* declined, or no wallet — the field stays the user's to fill */
    }
  }

  async function themMang() {
    const v = getWallet();
    if (!v) return setWalletState('khongCo');
    // Ask for the address as part of THIS press rather than as a second errand later: the user
    // is already looking at their wallet, and it is what makes "Added to wallet" mean the field
    // below is filled. If they decline, the network is still added.
    if (!viDiaChi) await xinDiaChi();
    try {
      await v.request({ method: 'wallet_addEthereumChain', params: [addNetworkParams()] });
      setWalletState('xong');
      setWalletFailure(null);
    } catch (e) {
      const l = readWalletError(e);
      setWalletState(l.rejected ? 'tuChoi' : 'errors');
      setWalletFailure(l.noWallet ? t.errors.noWallet : l.detail);
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
        body: JSON.stringify({ address: check.address }),
      });
      const j = (await r.json()) as { txHash?: string; amount?: string; error?: string };
      if (!r.ok || !j.txHash) throw new Error(j.error || `HTTP ${r.status}`);
      setResult({ txHash: j.txHash, amount: j.amount ?? '?' });
      // After a successful request the quota has changed — re-read it so the number on screen matches the truth.
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
          {walletState === 'khongCo' && !mobileNoWallet && <p className="text-sm text-body-2">{t.faucet.noWallet}</p>}
          <OpenInWallet />
        </div>

        <div className="mt-6">
          <Field
            label={t.faucet.addressLabel}
            desc={t.faucet.addressHelp}
            placeholder={t.faucet.addressPlaceholder}
            value={diaChi}
            onChange={(e) => {
              // The latch. From the first keystroke the field belongs to the user, and no wallet
              // event writes into it again.
              daSuaTay.current = true;
              datDiaChi(e.target.value);
            }}
            spellCheck={false}
            autoComplete="off"
            inputMode="text"
            failure={check && !check.ok ? interpolate(CHECK_MSG[check.code], { label: t.faucet.addressLabel }) : undefined}
            hint={check && !check.ok && check.hint ? check.hint : undefined}
          />
          {/* Say WHERE the address came from. An input that fills itself without a word is a
              field the reader has to double-check anyway — the note is what makes it a saved
              step instead of one more thing to verify. */}
          {viDiaChi && diaChi === viDiaChi && !daSuaTay.current && (
            <p className="mt-1.5 text-sm text-muted">{t.faucet.addressFromWallet}</p>
          )}
          {coVi && !diaChi.trim() && (
            <button
              type="button"
              onClick={xinDiaChi}
              className="tap-target mt-1.5 text-sm font-semibold text-gold-ink-strong underline"
            >
              {t.faucet.useWalletAddress}
            </button>
          )}
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
            // `role="status"` so a screen reader announces the result immediately, without the user
            // having to go looking for what just happened.
            role="status"
            className="mt-5 rounded-card border border-success-line bg-success-bg px-4 py-3"
          >
            <p className="text-sm font-semibold text-success-ink">
              {interpolate(t.faucet.sentOk, {
                count: result.amount,
                symbol: CHAIN.kyHieu,
                address: shortenAddress(check?.ok ? check.address : diaChi),
              })}
            </p>
            <a
              className="tap-target mt-2 inline-block text-sm font-semibold text-gold-ink-strong underline"
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
      <button type="button" onClick={onRetry} className="tap-target text-sm text-muted underline">
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
  // Derived from `location` at runtime — NOT hard-coded. A public page with `localhost` in it
  // has the visitor's browser resolve that to their own machine; both this project's explorer
  // and its dashboard hit exactly that fault.
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
              className="tap-target text-sm font-semibold text-gold-ink-strong underline"
            >
              9Scan-A1 ↗
            </a>
          </dd>
        </div>
      </dl>
      {/* Why this line earns its space on screen: a reader of `docs/TOKENOMICS.md` who sees
          "LOVE9 has 9 decimals" and then opens their wallet and sees 18 will conclude the
          document is wrong. Both are correct — P/X-Chain count in nano, C-Chain is EVM — but
          nobody works that out on their own. One sentence here is cheaper than a
          misunderstanding about the tokenomics. */}
      <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-muted">
        {t.faucet.decimalsHelp}
      </p>
    </Card>
  );
}
