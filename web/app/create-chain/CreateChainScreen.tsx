'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Nut, The, O, Nhan, Xuong, CoLoi, LuuY, ChepDuoc, CacBuoc, type MotBuoc } from '@/components/ui';
import { rutGon } from '@/lib/eip55';
import { dien, useT } from '@/lib/i18n';
import {
  layVi, noiVi, dangNhapSiwe, goiConsole, themL1VaoVi, kichHoatChain, choTienTrinhXong, LoiConsole,
  docLoiVi, type PhienVi, HAN_CONSOLE_GIAY} from '@/lib/wallet';

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
type KetQua = { name: string; chainId: number; rpc: string; blockchainID: string; luuY?: { tieuDe: string; cachLam: string } };
type TienTrinh = { running: boolean; name: string | null; steps: MotBuoc[]; error: string | null; etaSeconds: number };

type Pha = 'vi' | 'nhap' | 'soat' | 'chay' | 'xong';
const TEN_HOP_LE = /^[A-Za-z0-9 ]{2,32}$/;

export function CreateChainScreen() {
  const t = useT();
  const [pha, datPha] = useState<Pha>('vi');
  const [phien, datPhien] = useState<PhienVi | null>(null);
  const [loiVi, datLoiVi] = useState<string | null>(null);
  const [dangNoi, datDangNoi] = useState(false);

  const [tt, datTt] = useState<TrangThai | null>(null);
  const [ten, datTen] = useState('');
  // Giá trị khởi tạo chỉ sống tới lượt `/api/status` đầu tiên: nếu id này không có trong
  // danh sách console trả về thì hiệu ứng bên dưới thay nó bằng preset đầu tiên. Vẫn phải
  // đúng — `'chuan'` là id thời preset còn tiếng Việt (D-108), và API **không có bí danh**
  // cho id cũ, nên một lượt gửi trước khi status kịp về sẽ bị từ chối thẳng.
  const [preset, datPreset] = useState('standard');

  const [tienTrinh, datTienTrinh] = useState<TienTrinh | null>(null);
  const [ketQua, datKetQua] = useState<KetQua | null>(null);
  const [loiDe, datLoiDe] = useState<string | null>(null);

  const [daThemVi, datDaThemVi] = useState(false);
  const [kichHoat, datKichHoat] = useState<'chua' | 'dang' | 'xong'>('chua');
  // Hai ô lỗi này thay cho `catch {}` trắng của bản trước. Giữ RIÊNG cho từng nút:
  // gộp chung thì bấm nút này lại xoá lời giải thích của nút kia.
  const [loiThemVi, datLoiThemVi] = useState<string | null>(null);
  const [loiKichHoat, datLoiKichHoat] = useState<string | null>(null);

  // Tên gợi ý từ trang chủ bản B (`/console/?ten=…`) — nhận cả ở đây để hai bản
  // dùng chung một đường. Không tự điền nếu tên xấu: điền một giá trị sai rồi bắt
  // người ta sửa còn tệ hơn để trống.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('ten');
    if (q && TEN_HOP_LE.test(q.trim())) datTen(q.trim());
  }, []);

  const napTrangThai = useCallback(async (token: string) => {
    const s = await goiConsole<TrangThai>('/api/status', token, undefined, HAN_CONSOLE_GIAY);
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
        m === 'KHONG_CO_VI' ? t.deChain.khongCoVi
          : /user rejected|denied|4001/i.test(m) ? t.deChain.tuChoiKy
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
        datTienTrinh(await goiConsole<TienTrinh>('/api/progress', phien.token, undefined, HAN_CONSOLE_GIAY));
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
    //
    // 🔴 NHƯNG "không kết luận được" ≠ "chờ tới cùng trong mọi trường hợp".
    // Đo 2026-08-27: POST với token hỏng bị từ chối **401 trong 0,831 giây**, mà màn
    // hình vẫn đứng im tới trần chờ, vì `choTienTrinhXong` chỉ thoát khi đã thấy
    // `running` rồi lại thấy hết chạy — mà từ chối sớm thì `running` không bao giờ
    // bật. Người dùng nhìn một thanh tiến trình cho một việc **chưa hề bắt đầu**.
    // `tuChoiSom` vá đúng ca đó và CHỈ ca đó: 4xx = server đã trả lời và trả lời
    // "không". 524/5xx/đứt mạng vẫn chờ tới cùng, vì đó mới là ca Cloudflare cắt.
    let kqPost: KetQua | null = null;
    let loiPost: string | null = null;
    let biTuChoi = false;
    const post = goiConsole<KetQua>('/api/create', phien.token, { name: ten.trim(), preset })
      .then((k) => { kqPost = k; })
      .catch((e) => {
        loiPost = String((e as Error).message ?? e);
        if (e instanceof LoiConsole && e.laTuChoiThat) biTuChoi = true;
      });

    const tt2 = await choTienTrinhXong(phien.token, { tuChoiSom: () => biTuChoi });
    await post.catch(() => {});

    if (kqPost) {
      datKetQua(kqPost);
      datPha('xong');
      void napTrangThai(phien.token);
      return;
    }

    // POST không về được ⇒ hỏi DANH BẠ xem chain có thật sự tồn tại không.
    try {
      const st = await goiConsole<{ chains: KetQua[] } & TrangThai>('/api/status', phien.token, undefined, HAN_CONSOLE_GIAY);
      datTt(st);
      const co = st.chains.find((c) => c.name === ten.trim());
      if (co) {
        // Danh bạ không mang `luuY` (nó do `/api/create` sinh ra), nên dựng lại lời
        // dặn ở đây thay vì im lặng bỏ mất nó.
        datKetQua({ ...co, luuY: { tieuDe: t.deChain.luuYTieuDe, cachLam: t.deChain.luuYCachLam } });
        datPha('xong');
        return;
      }
    } catch { /* đọc danh bạ hỏng — rơi xuống nhánh báo lỗi bên dưới */ }

    datLoiDe(dien(t.deChain.loiDe, { chiTiet: tt2?.error ?? loiPost ?? t.deChain.loiKhongRo }));
    datPha('nhap');
  }

  /* ─────────────────────────────────────────────────────────────── giao diện */

  if (pha === 'vi') {
    return (
      <The className="mt-8 max-w-xl p-5 md:p-6">
        <h2 className="font-display text-lg font-bold text-ink">{t.deChain.noiVi}</h2>
        <p className="mt-2 text-sm text-body-2">{t.deChain.laChuChain}</p>
        <div className="mt-5">
          <Nut co="to" onClick={vao} dangChay={dangNoi}>
            {dangNoi ? t.deChain.dangKy : t.deChain.noiVi}
          </Nut>
        </div>
        {loiVi && (
          <div className="mt-4">
            <CoLoi tieuDe={loiVi} moTa="" thuLai={vao} />
          </div>
        )}
        {!layVi() && (
          <div className="mt-4">
            <LuuY kieu="canhBao">{t.deChain.khongCoVi}</LuuY>
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
              <h2 className="font-display text-lg font-bold text-ink">{t.deChain.tieuDe}</h2>
              {/* 🔴 Trần hiện TRƯỚC khi người ta bỏ công, không phải lúc bị từ chối. */}
              <Nhan kieu={hetCho ? 'canhBao' : 'tot'}>
                {hetCho ? t.deChain.hetCho : dien(t.deChain.conCho, { con: tran - soChain, tong: tran })}
              </Nhan>
            </div>

            {hetCho && (
              <div className="mt-4">
                <LuuY kieu="canhBao">{t.deChain.hetChoMoTa}</LuuY>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-5">
              <O
                nhan={t.deChain.nhanTen}
                moTa={t.deChain.moTaTen}
                placeholder={t.deChain.goiYTen}
                value={ten}
                onChange={(e) => datTen(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                loi={tenSach && !tenOk ? t.deChain.tenXau : undefined}
              />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="kieu-chain" className="text-sm font-semibold text-ink">
                  {t.deChain.nhanKieu}
                </label>
                <p id="kieu-chain-mota" className="text-sm text-muted">
                  {t.deChain.moTaKieu}
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
                        {p.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Xuong className="h-12 w-full" />
                )}
                {presetHienTai?.desc && (
                  // Mô tả hiện NGAY DƯỚI ô chọn: genesis bất biến nên người dùng chỉ
                  // có đúng một lần đọc.
                  <p className="text-sm text-body-2">{presetHienTai.desc}</p>
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
                {t.deChain.soatLai}
              </Nut>
            </div>
          </>
        )}

        {pha === 'soat' && (
          <>
            <h2 className="font-display text-lg font-bold text-ink">{t.deChain.soatTieuDe}</h2>
            <div className="mt-3 flex flex-col gap-3">
              <LuuY kieu="canhBao">{t.deChain.soatMoTa}</LuuY>
              {/* Cảnh báo re-genesis đặt ở ĐÂY chứ không chỉ ở dải trên đầu trang:
                  đây là giây cuối trước cửa một chiều, và là chỗ duy nhất chắc chắn
                  người dùng đang đọc. Gỡ cùng lúc với dải banner sau ngày G. */}
              <LuuY kieu="canhBao">
                {dien(t.deChain.soatReGenesis, { ngay: t.reGenesis.ngay })}
              </LuuY>
            </div>
            <dl className="mt-5 flex flex-col gap-3">
              {[
                { k: t.deChain.soatTen, v: tenSach },
                { k: t.deChain.soatKieu, v: presetHienTai?.name ?? preset },
                { k: t.deChain.soatChu, v: phien?.diaChi ?? '' },
              ].map((x) => (
                <div key={x.k} className="flex flex-col gap-1 border-b border-line-soft pb-3 last:border-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{x.k}</dt>
                  <dd className="break-all font-mono text-sm text-ink">{x.v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <Nut co="to" onClick={de}>
                {t.deChain.soatDongY}
              </Nut>
              <Nut co="to" kieu="vien" onClick={() => datPha('nhap')}>
                {t.deChain.soatQuayLai}
              </Nut>
            </div>
          </>
        )}

        {pha === 'chay' && (
          <>
            <h2 className="font-display text-lg font-bold text-ink">
              {dien(t.deChain.dangDe, { ten: tenSach })}
            </h2>
            <p className="mt-2 text-sm text-body-2">{t.deChain.dangDeMoTa}</p>
            <div className="mt-5">
              {tienTrinh?.steps?.length ? (
                <CacBuoc
                  buoc={tienTrinh.steps}
                  ghiChu={
                    tienTrinh.etaSeconds
                      ? dien(t.deChain.conKhoang, { phut: Math.max(1, Math.ceil(tienTrinh.etaSeconds / 60)) })
                      : undefined
                  }
                />
              ) : (
                <p className="text-sm text-muted">{t.deChain.dangChuanBi}</p>
              )}
            </div>
          </>
        )}

        {pha === 'xong' && ketQua && (
          <>
            <h2 className="font-display text-lg font-bold text-success-ink">
              {dien(t.deChain.xongTieuDe, { ten: ketQua.name })}
            </h2>
            <dl className="mt-4 flex flex-col gap-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{t.deChain.xongChainId}</dt>
                <dd className="mt-1">
                  <ChepDuoc giaTri={String(ketQua.chainId)} nhan={t.deChain.xongChainId} />
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{t.deChain.xongRpc}</dt>
                <dd className="mt-1">
                  <ChepDuoc giaTri={ketQua.rpc} nhan={t.deChain.xongRpc} />
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
                  datLoiThemVi(null);
                  try {
                    await themL1VaoVi({
                      chainIdHex: '0x' + ketQua.chainId.toString(16),
                      name: ketQua.name,
                      rpc: ketQua.rpc,
                      kyHieu: 'LOVE9',
                    });
                    datDaThemVi(true);
                  } catch (e) {
                    const l = docLoiVi(e);
                    datLoiThemVi(
                      l.tuChoi ? t.chung.viTuChoi : dien(t.deChain.xongThemViLoi, { chiTiet: l.chu ?? '' }),
                    );
                  }
                }}
              >
                {daThemVi ? t.deChain.xongDaThem : t.deChain.xongThemVi}
              </Nut>

              <Nut
                dangChay={kichHoat === 'dang'}
                disabled={kichHoat === 'xong'}
                onClick={async () => {
                  if (!phien) return;
                  datKichHoat('dang');
                  datLoiKichHoat(null);
                  try {
                    await kichHoatChain('0x' + ketQua.chainId.toString(16), phien.diaChi);
                    datKichHoat('xong');
                  } catch (e) {
                    datKichHoat('chua');
                    const l = docLoiVi(e);
                    datLoiKichHoat(
                      l.tuChoi ? t.chung.viTuChoi : dien(t.deChain.xongKichHoatLoi, { chiTiet: l.chu ?? '' }),
                    );
                  }
                }}
              >
                {kichHoat === 'xong' ? t.deChain.xongDaKichHoat
                  : kichHoat === 'dang' ? t.deChain.xongDangKichHoat
                  : t.deChain.xongKichHoat}
              </Nut>

              <Nut
                kieu="tron"
                onClick={() => {
                  datKetQua(null);
                  datTienTrinh(null);
                  datTen('');
                  datDaThemVi(false);
                  datKichHoat('chua');
                  datLoiThemVi(null);
                  datLoiKichHoat(null);
                  datPha('nhap');
                }}
              >
                {t.deChain.deTiep}
              </Nut>
            </div>

            {/* 🔴 Vùng live THƯỜNG TRÚ, không phải sinh ra cùng nội dung. Trình đọc
                màn hình chỉ theo dõi vùng live đã có sẵn trong DOM — chèn cả vùng
                lẫn chữ vào cùng lúc thì nó không đọc gì. Đây là khuôn `ChepDuoc`
                đang làm đúng, và là khuôn `CacBuoc` đang làm sai. */}
            <div role="status" aria-live="polite" className="mt-4 flex flex-col gap-2 empty:hidden">
              {loiThemVi && <p className="text-sm text-danger">{loiThemVi}</p>}
              {loiKichHoat && <p className="text-sm text-danger">{loiKichHoat}</p>}
            </div>
          </>
        )}
      </The>

      <The className="h-max p-5">
        <h2 className="font-display text-base font-bold text-ink">{t.deChain.viCuaBan}</h2>
        <p className="mt-2 break-all font-mono text-sm text-ink">{phien ? rutGon(phien.diaChi, 10, 8) : ''}</p>
        <p className="mt-2 text-sm text-body-2">{t.deChain.laChuChain}</p>
      </The>
    </div>
  );
}
