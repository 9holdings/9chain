'use client';

import { useCallback, useEffect, useState } from 'react';
import { Nut, The, O, Nhan, Xuong, CoLoi, ChepDuoc, LuuY } from '@/components/ui';
import { kiemDiaChi, rutGon } from '@/lib/eip55';
import { CHAIN, faucetGoc, rpcCChain, explorerGoc, thamSoThemMang } from '@/lib/chain';
import { vi, dien } from '@/lib/i18n/vi';
import { layVi, dsVi, tenViDangDung } from '@/lib/wallet';

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
  const [diaChi, datDiaChi] = useState('');
  const [dangGui, datDangGui] = useState(false);
  const [ketQua, datKetQua] = useState<{ txHash: string; amount: string } | null>(null);
  const [loiGui, datLoiGui] = useState<string | null>(null);
  const [tin, datTin] = useState<TrangThaiTin>({ pha: 'tai' });
  const [viTrangThai, datViTrangThai] = useState<'chua' | 'xong' | 'loi' | 'tuChoi' | 'khongCo'>('chua');
  // Nguyên văn mã + thông điệp của ví. Hiện ra chứ không nuốt — xem chú thích ở `themMang`.
  const [viLoi, datViLoi] = useState<string | null>(null);

  // Chỉ kiểm khi người dùng đã gõ gì đó — báo đỏ vào một ô trống mà họ chưa chạm
  // tới là mắng trước khi hỏi.
  const kq = diaChi.trim() ? kiemDiaChi(diaChi, vi.faucet.nhanDiaChi) : null;
  const hopLe = kq?.ok === true;

  const napTin = useCallback(async () => {
    datTin({ pha: 'tai' });
    try {
      const r = await fetch(`${faucetGoc()}/api/info`, { cache: 'no-store' });
      if (!r.ok) throw new Error(String(r.status));
      datTin({ pha: 'xong', tin: (await r.json()) as ThongTin });
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
   * gì để lần. Đã trả giá 2026-08-26: nút báo lỗi, và không ai biết là ví từ chối,
   * ví đang khoá, hay tham số mình gửi sai.
   *
   * EIP-1193 quy định `4001` = NGƯỜI DÙNG TỪ CHỐI — đó là hành vi bình thường,
   * không phải sự cố, nên nó có câu riêng. Mọi mã khác là lỗi thật và phải hiện
   * NGUYÊN VĂN mã + thông điệp của ví: đó là thứ duy nhất phân biệt được
   * "tham số của ta sai" với "ví không chịu".
   */
  async function themMang() {
    const v = layVi();
    if (!v) return datViTrangThai('khongCo');
    try {
      await v.request({ method: 'wallet_addEthereumChain', params: [thamSoThemMang()] });
      datViTrangThai('xong');
      datViLoi(null);
    } catch (e) {
      const err = e as { code?: number; message?: string };
      if (err?.code === 4001) {
        datViTrangThai('tuChoi');
        datViLoi(null);
      } else {
        datViTrangThai('loi');
        // 🔴 `-32601` = ví ĐANG NGHE không có hàm này. Đọc như "sai tên hàm", thật ra
        // là "nhầm ví" — nên câu trả lời phải nói RÕ ví nào đang nghe và còn ví nào
        // khác. Đã trả giá 2026-08-26: máy có ~10 extension ví, kẻ thắng
        // `window.ethereum` là một ví không thêm được mạng EVM.
        const ten = tenViDangDung();
        const khac = dsVi().map((x) => x.name).filter((n) => n !== ten);
        const them =
          err?.code === -32601
            ? ` — ví đang dùng: ${ten ?? 'không rõ'}${khac.length ? `; ví khác đang cài: ${khac.join(', ')}` : ''}`
            : '';
        datViLoi(`${err?.code ?? '?'} · ${err?.message ?? String(e)}${them}`);
      }
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
      datLoiGui(dien(vi.faucet.loiChung, { chiTiet: String((e as Error).message ?? e) }));
    } finally {
      datDangGui(false);
    }
  }

  const hetSuat = tin.pha === 'xong' && tin.tin.perIp.remaining === 0;

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <The className="p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-ink">{vi.faucet.tieuDe}</h2>
          <HanMuc tin={tin} thuLai={napTin} />
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <Nut kieu="vien" onClick={themMang}>
            {viTrangThai === 'xong' ? vi.faucet.themMangXong : vi.faucet.themMang}
          </Nut>
          {viTrangThai === 'tuChoi' && <p className="text-sm text-body-2">{vi.faucet.themMangTuChoi}</p>}
          {viTrangThai === 'loi' && (
            <div className="text-sm text-body-2">
              <p>{vi.faucet.themMangLoi}</p>
              {viLoi && <p className="mt-1 break-words font-mono text-xs text-muted">{viLoi}</p>}
            </div>
          )}
          {viTrangThai === 'khongCo' && <p className="text-sm text-body-2">{vi.faucet.khongCoVi}</p>}
        </div>

        <div className="mt-6">
          <O
            nhan={vi.faucet.nhanDiaChi}
            moTa={vi.faucet.danChoDiaChi}
            placeholder={vi.faucet.goiYDiaChi}
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
              {dien(vi.faucet.hanMucHet, {
                phut: Math.max(1, Math.ceil((tin.pha === 'xong' ? tin.tin.perIp.retryAfter : 60) / 60)),
              })}
            </LuuY>
          </div>
        )}

        <div className="mt-5">
          <Nut co="to" onClick={gui} dangChay={dangGui} disabled={!hopLe || hetSuat}>
            {dangGui ? vi.faucet.dangGui : vi.faucet.nutXin}
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
              {dien(vi.faucet.thanhCong, {
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
              {vi.faucet.xemGiaoDich} ↗
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
  if (tin.pha === 'tai') {
    return (
      <span className="flex items-center gap-2">
        <span className="sr-only">{vi.chung.dangTai}</span>
        <Xuong className="h-6 w-32" />
      </span>
    );
  }
  if (tin.pha === 'hong') {
    return (
      <button type="button" onClick={thuLai} className="text-sm text-muted underline">
        {vi.faucet.hanMucKhongDoc}
      </button>
    );
  }
  const { perIp } = tin.tin;
  return (
    <span className="flex items-center gap-2 text-sm text-body-2">
      {vi.faucet.hanMucConLai}
      <Nhan kieu={perIp.remaining > 0 ? 'tot' : 'canhBao'}>
        {dien(vi.faucet.hanMucCachDoc, { con: perIp.remaining, tong: perIp.max, gio: perIp.windowHours })}
      </Nhan>
    </span>
  );
}

function ThongSoMang() {
  // Suy từ `location` lúc chạy — KHÔNG cắm cứng. Trang public cắm `localhost` là
  // trình duyệt người xem phân giải thành máy họ; explorer và dashboard của dự án
  // này đều đã dính đúng lỗi đó.
  const [rpc, datRpc] = useState('');
  useEffect(() => datRpc(rpcCChain()), []);

  const dong = [
    { nhan: vi.faucet.thongSoRpc, gt: rpc },
    { nhan: vi.faucet.thongSoChainId, gt: `${CHAIN.chainId} (${CHAIN.chainIdHex})` },
    { nhan: vi.faucet.thongSoKyHieu, gt: CHAIN.kyHieu },
  ];

  return (
    <The className="h-max p-5">
      <h2 className="font-display text-base font-bold text-ink">{vi.faucet.thongSoMang}</h2>
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
            {vi.faucet.thongSoExplorer}
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
    </The>
  );
}
