'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Nut, The, O, Nhan, Xuong, CoLoi, LuuY, ChepDuoc, CacBuoc, type MotBuoc } from '@/components/ui';
import { rutGon } from '@/lib/eip55';
import { vi, dien } from '@/lib/i18n/vi';
import {
  layVi, noiVi, dangNhapSiwe, goiConsole, themL1VaoVi, kichHoatChain, choTienTrinhXong,
  type PhienVi,
} from '@/lib/wallet';

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

type Preset = { id: string; ten: string; moTa?: string };
type TrangThai = {
  tran: number;
  chains: unknown[];
  presets: Preset[];
  dangNhap: string;
  viDangNhap: string | null;
};
type KetQua = { name: string; chainId: number; rpc: string; blockchainID: string; luuY?: { tieuDe: string; cachLam: string } };
type TienTrinh = { running: boolean; name: string | null; steps: MotBuoc[]; error: string | null; etaSeconds: number };

type Pha = 'vi' | 'nhap' | 'soat' | 'chay' | 'xong';
const TEN_HOP_LE = /^[A-Za-z0-9 ]{2,32}$/;

export function CreateChainScreen() {
  const [pha, datPha] = useState<Pha>('vi');
  const [phien, datPhien] = useState<PhienVi | null>(null);
  const [loiVi, datLoiVi] = useState<string | null>(null);
  const [dangNoi, datDangNoi] = useState(false);

  const [tt, datTt] = useState<TrangThai | null>(null);
  const [ten, datTen] = useState('');
  const [preset, datPreset] = useState('chuan');

  const [tienTrinh, datTienTrinh] = useState<TienTrinh | null>(null);
  const [ketQua, datKetQua] = useState<KetQua | null>(null);
  const [loiDe, datLoiDe] = useState<string | null>(null);

  const [daThemVi, datDaThemVi] = useState(false);
  const [kichHoat, datKichHoat] = useState<'chua' | 'dang' | 'xong'>('chua');

  // Tên gợi ý từ trang chủ bản B (`/console/?ten=…`) — nhận cả ở đây để hai bản
  // dùng chung một đường. Không tự điền nếu tên xấu: điền một giá trị sai rồi bắt
  // người ta sửa còn tệ hơn để trống.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('ten');
    if (q && TEN_HOP_LE.test(q.trim())) datTen(q.trim());
  }, []);

  const napTrangThai = useCallback(async (token: string) => {
    const s = await goiConsole<TrangThai>('/api/status', token);
    datTt(s);
    if (s.presets?.length && !s.presets.some((p) => p.id === preset)) datPreset(s.presets[0].id);
  }, [preset]);

  async function vao() {
    datLoiVi(null);
    datDangNoi(true);
    try {
      const dc = await noiVi();
      const p = await dangNhapSiwe(dc);
      datPhien(p);
      await napTrangThai(p.token);
      datPha('nhap');
    } catch (e) {
      const m = String((e as Error).message ?? e);
      datLoiVi(
        m === 'KHONG_CO_VI' ? vi.deChain.khongCoVi
          : /user rejected|denied|4001/i.test(m) ? vi.deChain.tuChoiKy
          : m,
      );
    } finally {
      datDangNoi(false);
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
    if (pha !== 'chay' || !phien) return;
    const doc = async () => {
      try {
        datTienTrinh(await goiConsole<TienTrinh>('/api/progress', phien.token));
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
  }, [pha, phien]);

  async function de() {
    if (!phien) return;
    datLoiDe(null);
    datPha('chay');

    // 🔴 KHÔNG kết luận từ cái POST này. Đẻ chain mất ~170 giây; Cloudflare cắt kết
    // nối ở ~100 giây và trả HTTP 524, nên qua tên miền công khai lượt POST **luôn**
    // hỏng trong khi chain vẫn được đẻ xong. Báo "không đẻ được" lúc đó là mời người
    // dùng bấm lại một việc đã xong — và chain thừa ăn mất một slot trong trần 15,
    // vĩnh viễn giữ luôn tên và chainId. Xem `choTienTrinhXong`.
    let kqPost: KetQua | null = null;
    let loiPost: string | null = null;
    const post = goiConsole<KetQua>('/api/create', phien.token, { name: ten.trim(), preset })
      .then((k) => { kqPost = k; })
      .catch((e) => { loiPost = String((e as Error).message ?? e); });

    const tt2 = await choTienTrinhXong(phien.token);
    await post.catch(() => {});

    if (kqPost) {
      datKetQua(kqPost);
      datPha('xong');
      void napTrangThai(phien.token);
      return;
    }

    // POST không về được ⇒ hỏi DANH BẠ xem chain có thật sự tồn tại không.
    try {
      const st = await goiConsole<{ chains: KetQua[] } & TrangThai>('/api/status', phien.token);
      datTt(st);
      const co = st.chains.find((c) => c.name === ten.trim());
      if (co) {
        // Danh bạ không mang `luuY` (nó do `/api/create` sinh ra), nên dựng lại lời
        // dặn ở đây thay vì im lặng bỏ mất nó.
        datKetQua({ ...co, luuY: { tieuDe: vi.deChain.luuYTieuDe, cachLam: vi.deChain.luuYCachLam } });
        datPha('xong');
        return;
      }
    } catch { /* đọc danh bạ hỏng — rơi xuống nhánh báo lỗi bên dưới */ }

    datLoiDe(dien(vi.deChain.loiDe, { chiTiet: tt2?.error ?? loiPost ?? vi.deChain.loiKhongRo }));
    datPha('nhap');
  }

  /* ─────────────────────────────────────────────────────────────── giao diện */

  if (pha === 'vi') {
    return (
      <The className="mt-8 max-w-xl p-5 md:p-6">
        <h2 className="font-display text-lg font-bold text-ink">{vi.deChain.noiVi}</h2>
        <p className="mt-2 text-sm text-body-2">{vi.deChain.laChuChain}</p>
        <div className="mt-5">
          <Nut co="to" onClick={vao} dangChay={dangNoi}>
            {dangNoi ? vi.deChain.dangKy : vi.deChain.noiVi}
          </Nut>
        </div>
        {loiVi && (
          <div className="mt-4">
            <CoLoi tieuDe={loiVi} moTa="" thuLai={vao} />
          </div>
        )}
        {!layVi() && (
          <div className="mt-4">
            <LuuY kieu="canhBao">{vi.deChain.khongCoVi}</LuuY>
          </div>
        )}
      </The>
    );
  }

  const soChain = tt?.chains?.length ?? 0;
  const tran = tt?.tran ?? 15;
  const hetCho = soChain >= tran;
  const tenSach = ten.trim();
  const tenOk = TEN_HOP_LE.test(tenSach);
  const presetHienTai = tt?.presets?.find((p) => p.id === preset);

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <The className="p-5 md:p-6">
        {pha === 'nhap' && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-ink">{vi.deChain.tieuDe}</h2>
              {/* 🔴 Trần hiện TRƯỚC khi người ta bỏ công, không phải lúc bị từ chối. */}
              <Nhan kieu={hetCho ? 'canhBao' : 'tot'}>
                {hetCho ? vi.deChain.hetCho : dien(vi.deChain.conCho, { con: tran - soChain, tong: tran })}
              </Nhan>
            </div>

            {hetCho && (
              <div className="mt-4">
                <LuuY kieu="canhBao">{vi.deChain.hetChoMoTa}</LuuY>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-5">
              <O
                nhan={vi.deChain.nhanTen}
                moTa={vi.deChain.moTaTen}
                placeholder={vi.deChain.goiYTen}
                value={ten}
                onChange={(e) => datTen(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                loi={tenSach && !tenOk ? vi.deChain.tenXau : undefined}
              />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="kieu-chain" className="text-sm font-semibold text-ink">
                  {vi.deChain.nhanKieu}
                </label>
                <p id="kieu-chain-mota" className="text-sm text-muted">
                  {vi.deChain.moTaKieu}
                </p>
                {/* Danh sách do SERVER cấp, không cắm cứng ở client: cắm cứng là hai
                    nơi phải giữ cho khớp, và bên trôi lệch sẽ là bên người dùng thấy. */}
                {tt ? (
                  <select
                    id="kieu-chain"
                    aria-describedby="kieu-chain-mota"
                    value={preset}
                    onChange={(e) => datPreset(e.target.value)}
                    className="h-12 w-full rounded-btn border border-line-strong bg-surface px-3 text-sm text-ink"
                  >
                    {tt.presets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.ten}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Xuong className="h-12 w-full" />
                )}
                {presetHienTai?.moTa && (
                  // Mô tả hiện NGAY DƯỚI ô chọn: genesis bất biến nên người dùng chỉ
                  // có đúng một lần đọc.
                  <p className="text-sm text-body-2">{presetHienTai.moTa}</p>
                )}
              </div>
            </div>

            {loiDe && (
              <div className="mt-5">
                <CoLoi tieuDe={loiDe} moTa="" />
              </div>
            )}

            <div className="mt-6">
              <Nut co="to" disabled={!tenOk || hetCho || !tt} onClick={() => datPha('soat')}>
                {vi.deChain.soatLai}
              </Nut>
            </div>
          </>
        )}

        {pha === 'soat' && (
          <>
            <h2 className="font-display text-lg font-bold text-ink">{vi.deChain.soatTieuDe}</h2>
            <div className="mt-3 flex flex-col gap-3">
              <LuuY kieu="canhBao">{vi.deChain.soatMoTa}</LuuY>
              {/* Cảnh báo re-genesis đặt ở ĐÂY chứ không chỉ ở dải trên đầu trang:
                  đây là giây cuối trước cửa một chiều, và là chỗ duy nhất chắc chắn
                  người dùng đang đọc. Gỡ cùng lúc với dải banner sau ngày G. */}
              <LuuY kieu="canhBao">
                {dien(vi.deChain.soatReGenesis, { ngay: vi.reGenesis.ngay })}
              </LuuY>
            </div>
            <dl className="mt-5 flex flex-col gap-3">
              {[
                { k: vi.deChain.soatTen, v: tenSach },
                { k: vi.deChain.soatKieu, v: presetHienTai?.ten ?? preset },
                { k: vi.deChain.soatChu, v: phien?.diaChi ?? '' },
              ].map((x) => (
                <div key={x.k} className="flex flex-col gap-1 border-b border-line-soft pb-3 last:border-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{x.k}</dt>
                  <dd className="break-all font-mono text-sm text-ink">{x.v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <Nut co="to" onClick={de}>
                {vi.deChain.soatDongY}
              </Nut>
              <Nut co="to" kieu="vien" onClick={() => datPha('nhap')}>
                {vi.deChain.soatQuayLai}
              </Nut>
            </div>
          </>
        )}

        {pha === 'chay' && (
          <>
            <h2 className="font-display text-lg font-bold text-ink">
              {dien(vi.deChain.dangDe, { ten: tenSach })}
            </h2>
            <p className="mt-2 text-sm text-body-2">{vi.deChain.dangDeMoTa}</p>
            <div className="mt-5">
              {tienTrinh?.steps?.length ? (
                <CacBuoc
                  buoc={tienTrinh.steps}
                  ghiChu={
                    tienTrinh.etaSeconds
                      ? dien(vi.deChain.conKhoang, { phut: Math.max(1, Math.ceil(tienTrinh.etaSeconds / 60)) })
                      : undefined
                  }
                />
              ) : (
                <p className="text-sm text-muted">{vi.deChain.dangChuanBi}</p>
              )}
            </div>
          </>
        )}

        {pha === 'xong' && ketQua && (
          <>
            <h2 className="font-display text-lg font-bold text-success-ink">
              {dien(vi.deChain.xongTieuDe, { ten: ketQua.name })}
            </h2>
            <dl className="mt-4 flex flex-col gap-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{vi.deChain.xongChainId}</dt>
                <dd className="mt-1">
                  <ChepDuoc giaTri={String(ketQua.chainId)} nhan={vi.deChain.xongChainId} />
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{vi.deChain.xongRpc}</dt>
                <dd className="mt-1">
                  <ChepDuoc giaTri={ketQua.rpc} nhan={vi.deChain.xongRpc} />
                </dd>
              </div>
            </dl>

            {/* 🔴 `luuY` là một VIỆC BẤM ĐƯỢC, không phải một đoạn văn cảnh báo.
                Bẫy: `eth_estimateGas` ước lượng THIẾU cho giao dịch ĐẦU TIÊN của
                chain vừa đẻ (D-025) và hỏng câm. Cách rẻ nhất để mở block 1 là một
                giao dịch chuyển tiền thường — 21.000 gas là hằng số EVM nên không
                cần ước lượng. Nút dưới đây làm đúng việc đó. */}
            {ketQua.luuY && (
              <div className="mt-5">
                <LuuY>
                  <strong className="block font-semibold">{ketQua.luuY.tieuDe}</strong>
                  <span className="mt-1 block">{ketQua.luuY.cachLam}</span>
                </LuuY>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <Nut
                kieu="vien"
                onClick={async () => {
                  try {
                    await themL1VaoVi({
                      chainIdHex: '0x' + ketQua.chainId.toString(16),
                      name: ketQua.name,
                      rpc: ketQua.rpc,
                      kyHieu: 'LOVE9',
                    });
                    datDaThemVi(true);
                  } catch { /* ví từ chối — không có gì hỏng, để người dùng thử lại */ }
                }}
              >
                {daThemVi ? vi.deChain.xongDaThem : vi.deChain.xongThemVi}
              </Nut>

              <Nut
                dangChay={kichHoat === 'dang'}
                disabled={kichHoat === 'xong'}
                onClick={async () => {
                  if (!phien) return;
                  datKichHoat('dang');
                  try {
                    await kichHoatChain('0x' + ketQua.chainId.toString(16), phien.diaChi);
                    datKichHoat('xong');
                  } catch {
                    datKichHoat('chua');
                  }
                }}
              >
                {kichHoat === 'xong' ? vi.deChain.xongDaKichHoat
                  : kichHoat === 'dang' ? vi.deChain.xongDangKichHoat
                  : vi.deChain.xongKichHoat}
              </Nut>

              <Nut
                kieu="tron"
                onClick={() => {
                  datKetQua(null);
                  datTienTrinh(null);
                  datTen('');
                  datDaThemVi(false);
                  datKichHoat('chua');
                  datPha('nhap');
                }}
              >
                {vi.deChain.deTiep}
              </Nut>
            </div>
          </>
        )}
      </The>

      <The className="h-max p-5">
        <h2 className="font-display text-base font-bold text-ink">{vi.deChain.viCuaBan}</h2>
        <p className="mt-2 break-all font-mono text-sm text-ink">{phien ? rutGon(phien.diaChi, 10, 8) : ''}</p>
        <p className="mt-2 text-sm text-body-2">{vi.deChain.laChuChain}</p>
      </The>
    </div>
  );
}
