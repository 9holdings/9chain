'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, Badge, Copyable, Button, ErrorState, EmptyState, Skeleton, Note } from '@/components/ui';
import { useT, useLanguage } from '@/lib/i18n';
import { interpolate } from '@/lib/i18n/interpolate';
import { formatNumber } from '@/lib/numbers';
import { rpcOrigin, addNetworkParams } from '@/lib/chain';
import { fetchJson, READ_TIMEOUT_MS } from '@/lib/net';
import { readDirectory, type ChainRecord } from '@/lib/directory';

/**
 * The L1 directory. Ported into the Next app on 2026-09-03.
 *
 * ═══ WHY IT MOVED ═══
 * It used to be a hand-written HTML file served by its own nginx container, and it was
 * the only public page outside the 30-language system: `lang="vi"` hard-coded, a
 * hard-coded `toLocaleString('vi-VN')`, and its own COPY of the site header and
 * footer. A reader who picked English and clicked "L1 directory" landed on a page they
 * could not read. Inside the app it gets the dictionary, the theme, the chrome and
 * every existing gate for free — and the chrome copy, plus the drift gate written to
 * watch that copy, both stop being necessary.
 *
 * ⚠️ WHAT DID NOT MOVE: `/chains/data/*.json`. Those files are written by the console
 * process into that container's directory, so the container stays and Caddy keeps
 * routing the data path to it. Only the PAGE moved.
 *
 * 🔴 THE VERDICT LOGIC IS THE POINT OF THIS PAGE — DO NOT SIMPLIFY IT.
 * A chain with no validators still answers RPC, still serves balances, and wallets
 * still connect. Judging liveness by block height or by "RPC replied" reports a dead
 * chain as healthy. The measurement that separates them is the subnet's validator
 * count read from the P-Chain, and that is what decides the badge here.
 */

type Probe = {
  rpc: string;
  chainIdHex?: string;
  chainId?: number;
  blocks?: number;
  validators?: number | null;
  rpcOk: boolean;
  /** `true` khi KHÔNG THỂ đo (thiếu `blockchainID`) — khác hẳn "đo và thất bại". */
  unknown?: boolean;
};

type Phase =
  | { phase: 'loading' }
  | { phase: 'done'; chains: ChainRecord[]; retired: ChainRecord[]; probes: Probe[]; error: string | null }
  | { phase: 'failed'; why: string };

/** Chain record shape for retired entries — they carry a revocation timestamp. */
type RetiredRecord = ChainRecord & { revokedAt?: string; thuHoiLuc?: string };

const POLL_MS = 10_000;

async function rpcCall(path: string, method: string, params: unknown = []) {
  const j = await fetchJson<{ result?: unknown; error?: { message?: string } }>(
    `${rpcOrigin()}${path}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    },
    READ_TIMEOUT_MS / 1000,
  );
  if (j.error) throw new Error(j.error.message ?? 'RPC error');
  return j.result;
}

/**
 * Validator count of one subnet. This is the measurement that tells a live chain from
 * a dead one — an RPC that answers proves nothing on its own.
 */
async function subnetValidators(subnetID: string): Promise<number> {
  const r = (await rpcCall('/ext/bc/P', 'platform.getCurrentValidators', { subnetID })) as {
    validators?: unknown[];
  };
  return (r?.validators ?? []).length;
}

/**
 * 🔴 `blockchainID` CÓ THỂ THIẾU, và ca đó KHÔNG được báo là "không phản hồi".
 * Một bản ghi thiếu khoá này thì không có gì để hỏi — ta chưa hề gọi RPC. Báo
 * "không phản hồi" là khai một phép đo đã thực hiện và thất bại, trong khi phép đo
 * chưa từng chạy. Trả `validators: undefined` để thẻ rơi vào nhánh "chưa rõ", đúng
 * thứ đã xảy ra.
 */
async function probeChain(c: { blockchainID?: string; subnetID?: string | null }): Promise<Probe> {
  if (!c.blockchainID) return { rpc: '—', rpcOk: false, validators: undefined, unknown: true };
  const path = `/ext/bc/${c.blockchainID}/rpc`;
  const out: Probe = { rpc: `${rpcOrigin()}${path}`, rpcOk: false };
  try {
    const [cid, blk] = await Promise.all([
      rpcCall(path, 'eth_chainId') as Promise<string>,
      rpcCall(path, 'eth_blockNumber') as Promise<string>,
    ]);
    out.chainIdHex = cid;
    out.chainId = parseInt(cid, 16);
    out.blocks = parseInt(blk, 16);
    out.rpcOk = true;
  } catch {
    out.rpcOk = false;
  }
  if (c.subnetID) {
    try {
      out.validators = await subnetValidators(c.subnetID);
    } catch {
      out.validators = null;
    }
  }
  return out;
}

export function DirectoryContent() {
  const t = useT();
  const { ma: code } = useLanguage();
  const [state, setState] = useState<Phase>({ phase: 'loading' });
  const [round, setRound] = useState(0);

  /** The C-Chain pseudo-record. `subnetID: null` so it is never probed for validators. */
  const MAIN = { name: t.common.productName + ' (C-Chain)', blockchainID: 'C', subnetID: null };

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function refresh() {
      let chains: ChainRecord[] = [];
      let retired: ChainRecord[] = [];
      let error: string | null = null;
      try {
        const d = await readDirectory();
        chains = Array.isArray(d?.chains) ? d.chains : [];
        // `retired` is an ADDED key — older files do not have it, and its absence is
        // a valid state, not an error.
        retired = Array.isArray((d as { retired?: ChainRecord[] })?.retired)
          ? (d as { retired: ChainRecord[] }).retired
          : [];
      } catch (e) {
        error = e instanceof Error ? e.message : String(e);
      }

      const all = [MAIN, ...chains];
      const probes = await Promise.all(all.map((c) => probeChain(c).catch(() => ({ rpc: '—', rpcOk: false }))));
      if (cancelled) return;
      setState({ phase: 'done', chains, retired, probes, error });
      // Chain the next read from the END of this one rather than on an interval: an
      // interval on a slow network stacks requests, and a hidden tab throttles them
      // into a burst when it comes back.
      if (!cancelled) timer = setTimeout(refresh, POLL_MS);
    }

    refresh();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [round]); // eslint-disable-line react-hooks/exhaustive-deps

  const retry = useCallback(() => setRound((n) => n + 1), []);

  if (state.phase === 'loading') {
    return (
      <div className="flex flex-col gap-4">
        <span className="sr-only">{t.common.loading}</span>
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }
  if (state.phase === 'failed') return <ErrorState thuLai={retry} />;

  const { chains, retired, probes, error } = state;

  return (
    <>
      <header className="max-w-2xl">
        <h1 className="font-display text-2xl font-extrabold text-ink md:text-3xl">{t.nav.directory}</h1>
        <p className="mt-3 text-base text-body">{t.directory.lede}</p>
      </header>

      <div className="mt-6" />

      {/* The two explanatory paragraphs. The lead-in phrase is bold and the body is
          plain — see the dictionary comment for why there is no inline markup. */}
      <Note>
        <p>
          <strong>{t.directory.howToTitle}</strong> {t.directory.howToBody}
        </p>
        <p className="mt-3">
          <strong>{t.directory.ownerTitle}</strong> {t.directory.ownerBody}
        </p>
      </Note>

      {error !== null && (
        <div className="mt-4">
          <ErrorState moTa={interpolate(t.directory.listError, { error })} />
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {probes.map((p, i) => (
          <ChainCard
            key={i === 0 ? 'main' : chains[i - 1].chainId}
            record={i === 0 ? MAIN : chains[i - 1]}
            probe={p}
            isMain={i === 0}
            code={code}
          />
        ))}
      </div>

      {chains.length === 0 && (
        <div className="mt-4">
          <EmptyState tieuDe={t.home.emptyTitle} moTa={t.home.emptyDesc} />
        </div>
      )}

      {retired.length > 0 && (
        <>
          <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider text-muted">
            {interpolate(t.directory.revokedGroup, { count: retired.length })}
          </h2>
          <div className="mt-3 flex flex-col gap-4">
            {(retired as RetiredRecord[]).map((c) => (
              <RetiredCard key={c.chainId} record={c} code={code} />
            ))}
          </div>
        </>
      )}

      <p className="mt-8 font-mono text-xs text-muted">
        {interpolate(t.directory.footSummary, { count: chains.length })}
        {retired.length > 0 ? ` · ${interpolate(t.directory.footRevoked, { count: retired.length })}` : ''}
        {` · ${interpolate(t.directory.footUpdated, { time: new Date().toLocaleTimeString(code) })}`}
        {` · ${t.launch.doneRpc}: ${rpcOrigin()}`}
      </p>
    </>
  );
}

/* ────────────────────────────────────────────────────────────── one live chain */

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-b border-line-2 py-1.5 text-sm last:border-0">
      <span className="whitespace-nowrap text-muted">{k}</span>
      <span className="break-all text-end font-mono font-semibold text-ink">{children}</span>
    </div>
  );
}

function ChainCard({
  record,
  probe,
  isMain,
  code,
}: {
  record: {
    name: string;
    chainId?: number;
    admin?: string;
    presetName?: string;
    presetTen?: string;
    subnetID?: string | null;
    blockchainID?: string;
  };
  probe: Probe;
  isMain: boolean;
  code: string;
}) {
  const t = useT();

  /** Badge + one-line reason. See the file header: validators decide, not RPC. */
  const [kieu, label, why]: ['tot' | 'xau' | 'canhBao' | 'trungTinh', string, string] = isMain
    ? ['trungTinh', t.directory.mainNetwork, t.directory.mainNetworkDesc]
    : probe.unknown
      ? ['canhBao', t.directory.unclear, t.directory.unclearDesc]
      : !probe.rpcOk
      ? ['xau', t.directory.notAnswering, t.directory.notAnsweringDesc]
      : probe.validators === 0
        ? ['xau', t.myChains.noValidators, t.myChains.noValidatorsDesc]
        : probe.validators === null || probe.validators === undefined
          ? ['canhBao', t.directory.unclear, t.directory.unclearDesc]
          : ['tot', t.directory.running, interpolate(t.myChains.validatorCount, { so: probe.validators })];

  const admin = typeof record.admin === 'string' ? record.admin.trim() : '';
  const preset = (record.presetName ?? record.presetTen ?? '').trim();

  return (
    <Card className="p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <h2 className="text-base font-bold text-ink">{record.name}</h2>
        <Badge kieu={kieu}>{label}</Badge>
      </div>
      <p className="-mt-1.5 mb-3 text-sm text-muted">{why}</p>

      {!isMain && (
        <>
          <Row k={t.directory.ownerAdmin}>
            {admin ? (
              <span className="text-success-ink">{admin}</span>
            ) : (
              <span className="font-sans font-normal text-muted">{t.home.systemDefault}</span>
            )}
          </Row>
          <Row k={t.myChains.colType}>{preset || <span className="text-muted">—</span>}</Row>
        </>
      )}
      <Row k={t.launch.doneChainId}>
        {probe.chainId != null ? `${probe.chainId} (${probe.chainIdHex})` : '—'}
      </Row>
      <Row k={t.directory.blocks}>{probe.blocks != null ? formatNumber(probe.blocks, code) : '—'}</Row>
      {!isMain && (
        <>
          <Row k={t.directory.subnetValidators}>{probe.validators ?? '—'}</Row>
          <Row k="subnetID">{record.subnetID || '—'}</Row>
          <Row k="blockchainID">{record.blockchainID || '—'}</Row>
        </>
      )}
      <Row k={t.launch.doneRpc}>{probe.rpc}</Row>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {probe.rpcOk && probe.chainIdHex && (
          <AddToWallet name={record.name} chainIdHex={probe.chainIdHex} rpc={probe.rpc} />
        )}
        <Copyable giaTri={probe.rpc} nhan={t.launch.doneRpc} />
        {admin && <Copyable giaTri={admin} nhan={t.directory.copyOwner} />}
      </div>
    </Card>
  );
}

function AddToWallet({ name, chainIdHex, rpc }: { name: string; chainIdHex: string; rpc: string }) {
  const t = useT();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <>
      <Button
        co="vua"
        onClick={async () => {
          const eth = (window as { ethereum?: { request: (a: unknown) => Promise<unknown> } }).ethereum;
          if (!eth) {
            setMsg(t.launch.noWallet);
            return;
          }
          try {
            // 🔴 MetaMask accepts ONLY a hex chainId — a decimal is an immediate error.
            // Reuse the wallet-params shape from `lib/chain.ts` so the native currency
            // and decimals cannot drift from what the faucet page declares.
            const base = addNetworkParams();
            await eth.request({
              method: 'wallet_addEthereumChain',
              params: [{ ...base, chainId: chainIdHex, chainName: name, rpcUrls: [rpc], blockExplorerUrls: [] }],
            });
            setMsg(t.myChains.addedToWallet);
          } catch (e) {
            setMsg(interpolate(t.myChains.addWalletError, { chiTiet: e instanceof Error ? e.message : '' }));
          }
        }}
      >
        {t.myChains.addToWallet}
      </Button>
      {msg && (
        <span role="status" className="text-xs text-muted">
          {msg}
        </span>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────── a revoked chain */

/**
 * 🔴 REVOKED CHAINS ARE NOT PROBED, AND THAT IS NOT A SHORTCUT.
 * Revoking only removes the subnet from what nodes track; it does NOT remove those
 * nodes from the subnet's validator set on the P-Chain. So
 * `platform.getCurrentValidators({subnetID})` still returns a full validator set for a
 * chain that is completely dead — the exact measurement the rest of this page relies
 * on to tell live from dead. Running the verdict logic over a revoked chain would make
 * it lie, and lie convincingly. The state here comes from the directory file, not from
 * a measurement.
 */
function RetiredCard({ record, code }: { record: RetiredRecord; code: string }) {
  const t = useT();
  const admin = typeof record.admin === 'string' ? record.admin.trim() : '';
  const created = record.createdAt;
  const revoked = record.revokedAt ?? record.thuHoiLuc;

  return (
    <Card className="p-5 opacity-75">
      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <h2 className="text-base font-bold text-muted line-through">{record.name}</h2>
        <Badge kieu="trungTinh">{t.directory.revoked}</Badge>
      </div>
      <p className="-mt-1.5 mb-3 text-sm text-muted">{t.directory.revokedDesc}</p>
      <Row k={t.directory.ownerAdmin}>
        {admin ? admin : <span className="font-sans font-normal text-muted">{t.home.systemDefault}</span>}
      </Row>
      <Row k={t.launch.doneChainId}>
        {record.chainId}{' '}
        <span className="font-sans font-normal text-muted">({t.directory.neverReissued})</span>
      </Row>
      <Row k="blockchainID">{record.blockchainID || '—'}</Row>
      {created && <Row k={t.directory.created}>{new Date(created).toLocaleString(code)}</Row>}
      {revoked && <Row k={t.directory.revokedAt}>{new Date(revoked).toLocaleString(code)}</Row>}
    </Card>
  );
}
