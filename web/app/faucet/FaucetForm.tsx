'use client';

import { useCallback, useEffect, useState } from 'react';
import { Nut, The, O, Nhan, Xuong, CoLoi, ChepDuoc, LuuY } from '@/components/ui';
import { kiemDiaChi, rutGon } from '@/lib/eip55';
import { CHAIN, faucetGoc, rpcCChain, explorerGoc, thamSoThemMang } from '@/lib/chain';
import { dien, useT } from '@/lib/i18n';
import { docJson, HAN_DOC_MS } from '@/lib/mang';
import { layVi, docLoiVi } from '@/lib/wallet';

type ThongTin = {
  amount: string;
  symbol: string;
  cooldownSeconds: number;
  perIp: { remaining: number; max: number; windowHours: number; retryAfter: number };
  global: { remaining: number; max: number };
};

type TrangThaiTin = { pha: 'tai' } | { pha: 'xong'; tin: ThongTin } | { pha: 'hong' };

// 🔴 `layVi` đến từ `@/lib/wallet` — TRƯỚC ĐÂY tệp này có bản chép tay riêng, và bản
// đó bốc thẳng `window.ethereum`. Hai bản song song nghĩa là hai cách chọn ví khác
// nhau trong cùng một sản phẩm: faucet nói chuyện với ví này, màn đẻ chain với ví
// kia, và không màn nào nói cho người dùng biết. Một nguồn duy nhất, xem lib/wallet.

export function FaucetForm() {
  const t = useT();
  const [diaChi, datDiaChi] = useState('');
  const [dangGui, datDangGui] = useState(false);
  const [ketQua, datKetQua] = useState<{ txHash: string; amount: string } | null>(null);
  const [loiGui, datLoiGui] = useState<string | null>(null);
  const [tin, datTin] = useState<TrangThaiTin>({ pha: 'tai' });
  const [viTrangThai, datViTrangThai] = useState<'chua' | 'xong' | 'errors' | 'tuChoi' | 'khongCo'>('chua');
  // Nguyên văn mã + thông điệp của ví. Hiện ra chứ không nuốt — xem chú thích ở `themMang`.
  const [viLoi, datViLoi] = useState<string | null>(null);

  // Chỉ kiểm khi người dùng đã gõ gì đó — báo đỏ vào một ô trống mà họ chưa chạm
  // tới là mắng trước khi hỏi.
  const kq = diaChi.trim() ? kiemDiaChi(diaChi, t.faucet.addressLabel) : null;
  const hopLe = kq?.ok === true;

  const napTin = useCallback(async () => {
    datTin({ pha: 'tai' });
    try {
      // Hạn giờ (Đ1-8) — an toàn ở đây: `/api/info` là lượt ĐỌC hạn mức, không tiêu
      // suất và không đụng chain. (Đường tiêu suất là `/api/drip` bên dưới.)
      const tin = await docJson<ThongTin>(`${faucetGoc()}/api/info`, {}, HAN_DOC_MS / 1000);
      datTin({ pha: 'xong', tin });
    } catch {
      // Không đọc được hạn mức KHÔNG phải lỗi chặn: người dùng vẫn xin được, chỉ là
      // không biết trước còn mấy lượt. Nói đúng điều đó thay vì dựng một màn lỗi.
      datTin({ pha: 'hong' });
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
   * Cách đọc mã lỗi đã rút sang `docLoiVi()` trong `lib/wallet.ts` — ba nút khác
   * trong site cần đúng khuôn này, và trước đó chúng `catch {}` trắng.
   */
  async function themMang() {
    const v = layVi();
    if (!v) return datViTrangThai('khongCo');
    try {
      await v.request({ method: 'wallet_addEthereumChain', params: [thamSoThemMang()] });
      datViTrangThai('xong');
      datViLoi(null);
    } catch (e) {
      const l = docLoiVi(e);
      datViTrangThai(l.tuChoi ? 'tuChoi' : 'errors');
      datViLoi(l.chu);
    }
  }

  async function gui() {
    if (!kq?.ok) return;
    datDangGui(true);
    datLoiGui(null);
    datKetQua(null);
    try {
      const r = await fetch(`${faucetGoc()}/api/drip`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ address: kq.diaChi }),
      });
      const j = (await r.json()) as { txHash?: string; amount?: string; error?: string };
      if (!r.ok || !j.txHash) throw new Error(j.error || `HTTP ${r.status}`);
      datKetQua({ txHash: j.txHash, amount: j.amount ?? '?' });
      // Xin xong thì hạn mức đã đổi — đọc lại để con số trên màn khớp sự thật.
      void napTin();
    } catch (e) {
      datLoiGui(dien(t.faucet.genericError, { chiTiet: String((e as Error).message ?? e) }));
    } finally {
      datDangGui(false);
    }
  }

  const hetSuat = tin.pha === 'xong' && tin.tin.perIp.remaining === 0;

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <The className="p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-ink">{t.faucet.title}</h2>
          <HanMuc tin={tin} thuLai={napTin} />
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <Nut kieu="vien" onClick={themMang}>
            {viTrangThai === 'xong' ? t.faucet.addNetworkDone : t.faucet.addNetwork}
          </Nut>
          {viTrangThai === 'tuChoi' && <p className="text-sm text-body-2">{t.faucet.addNetworkRejected}</p>}
          {viTrangThai === 'errors' && (
            <div className="text-sm text-body-2">
              <p>{t.faucet.addNetworkError}</p>
              {viLoi && <p className="mt-1 break-words font-mono text-xs text-muted">{viLoi}</p>}
            </div>
          )}
          {viTrangThai === 'khongCo' && <p className="text-sm text-body-2">{t.faucet.noWallet}</p>}
        </div>

        <div className="mt-6">
          <O
            nhan={t.faucet.addressLabel}
            moTa={t.faucet.addressHelp}
            placeholder={t.faucet.addressPlaceholder}
            value={diaChi}
            onChange={(e) => datDiaChi(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            inputMode="text"
            loi={kq && !kq.ok ? kq.loi : undefined}
            goiY={kq && !kq.ok && kq.goiY ? kq.goiY : undefined}
          />
        </div>

        {hetSuat && (
          <div className="mt-4">
            <LuuY kieu="canhBao">
              {dien(t.faucet.quotaExhausted, {
                phut: Math.max(1, Math.ceil((tin.pha === 'xong' ? tin.tin.perIp.retryAfter : 60) / 60)),
              })}
            </LuuY>
          </div>
        )}

        <div className="mt-5">
          <Nut co="to" onClick={gui} dangChay={dangGui} disabled={!hopLe || hetSuat}>
            {dangGui ? t.faucet.sending : t.faucet.requestCta}
          </Nut>
        </div>

        {ketQua && (
          <div
            // `role="status"` để trình đọc màn hình đọc kết quả ngay, không cần
            // người dùng tự đi tìm xem chuyện gì vừa xảy ra.
            role="status"
            className="mt-5 rounded-card border border-success-line bg-success-bg px-4 py-3"
          >
            <p className="text-sm font-semibold text-success-ink">
              {dien(t.faucet.sentOk, {
                so: ketQua.amount,
                kyHieu: CHAIN.kyHieu,
                diaChi: rutGon(kq?.ok ? kq.diaChi : diaChi),
              })}
            </p>
            <a
              className="mt-2 inline-block text-sm font-semibold text-gold-ink-strong underline"
              href={`${explorerGoc()}/tx/${ketQua.txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              {t.faucet.viewTransaction} ↗
            </a>
          </div>
        )}

        {loiGui && (
          <div className="mt-5">
            <CoLoi tieuDe={loiGui} moTa="" thuLai={gui} />
          </div>
        )}
      </The>

      <ThongSoMang />
    </div>
  );
}

function HanMuc({ tin, thuLai }: { tin: TrangThaiTin; thuLai: () => void }) {
  const t = useT();
  if (tin.pha === 'tai') {
    return (
      <span className="flex items-center gap-2">
        <span className="sr-only">{t.common.loading}</span>
        <Xuong className="h-6 w-32" />
      </span>
    );
  }
  if (tin.pha === 'hong') {
    return (
      <button type="button" onClick={thuLai} className="text-sm text-muted underline">
        {t.faucet.quotaUnreadable}
      </button>
    );
  }
  const { perIp } = tin.tin;
  return (
    <span className="flex items-center gap-2 text-sm text-body-2">
      {t.faucet.quotaLabel}
      <Nhan kieu={perIp.remaining > 0 ? 'tot' : 'canhBao'}>
        {dien(t.faucet.quotaFormat, { con: perIp.remaining, tong: perIp.max, gio: perIp.windowHours })}
      </Nhan>
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
    { nhan: t.faucet.settingsRpc, gt: rpc },
    { nhan: t.faucet.settingsChainId, gt: `${CHAIN.chainId} (${CHAIN.chainIdHex})` },
    { nhan: t.faucet.settingsSymbol, gt: CHAIN.kyHieu },
    { nhan: t.faucet.settingsDecimals, gt: String(CHAIN.thapPhan) },
  ];

  return (
    <The className="h-max p-5">
      <h2 className="font-display text-base font-bold text-ink">{t.faucet.settingsTitle}</h2>
      <dl className="mt-4 flex flex-col gap-3">
        {dong.map((d) => (
          <div key={d.nhan} className="flex flex-col gap-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{d.nhan}</dt>
            <dd className="min-w-0">
              {d.gt ? <ChepDuoc giaTri={d.gt} nhan={d.nhan} /> : <Xuong className="h-6 w-full" />}
            </dd>
          </div>
        ))}
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
            {t.faucet.settingsExplorer}
          </dt>
          <dd>
            <a
              href={explorerGoc()}
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
    </The>
  );
}
