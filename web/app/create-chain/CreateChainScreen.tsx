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
type KetQua = { name: string; chainId: number; rpc: string; blockchainID: string; luuY?: { tieuDe: string; cachLam: string } };
type Progress = { running: boolean; name: string | null; steps: Step[]; error: string | null; etaSeconds: number };

type Pha = 'vi' | 'nhap' | 'soat' | 'chay' | 'xong';
const TEN_HOP_LE = /^[A-Za-z0-9 ]{2,32}$/;

export function CreateChainScreen() {
  const t = useT();
  const [pha, datPha] = useState<Pha>('vi');
  const [phien, datPhien] = useState<WalletSession | null>(null);
  const [loiVi, datLoiVi] = useState<string | null>(null);
  const [dangNoi, datDangNoi] = useState(false);

  const [tt, datTt] = useState<TrangThai | null>(null);
  const [ten, datTen] = useState('');
  // Giá trị khởi tạo chỉ sống tới lượt `/api/status` đầu tiên: nếu id này không có trong
  // danh sách console trả về thì hiệu ứng bên dưới thay nó bằng preset đầu tiên. Vẫn phải
  // đúng — `'chuan'` là id thời preset còn tiếng Việt (D-108), và API **không có bí danh**
  // cho id cũ, nên một lượt gửi trước khi status kịp về sẽ bị từ chối thẳng.
  const [preset, datPreset] = useState('standard');

  const [tienTrinh, datTienTrinh] = useState<Progress | null>(null);
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
    const s = await callConsole<TrangThai>('/api/status', token, undefined, CONSOLE_TIMEOUT_S);
    datTt(s);
    if (s.presets?.length && !s.presets.some((p) => p.id === preset)) datPreset(s.presets[0].id);
  }, [preset]);

  async function vao() {
    datLoiVi(null);
    datDangNoi(true);
    try {
      const dc = await connectWallet();
      const p = await siweSignIn(dc);
      datPhien(p);
      await napTrangThai(p.token);
      datPha('nhap');
    } catch (e) {
      const m = String((e as Error).message ?? e);
      datLoiVi(
        m === 'KHONG_CO_VI' ? t.launch.noWallet
          : /user rejected|denied|4001/i.test(m) ? t.launch.signRejected
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
        datTienTrinh(await callConsole<Progress>('/api/progress', phien.token, undefined, CONSOLE_TIMEOUT_S));
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
    const post = callConsole<KetQua>('/api/create', phien.token, { name: ten.trim(), preset })
      .then((k) => { kqPost = k; })
      .catch((e) => {
        loiPost = String((e as Error).message ?? e);
        if (e instanceof ConsoleError && e.laTuChoiThat) biTuChoi = true;
      });

    const tt2 = await waitForProgress(phien.token, { tuChoiSom: () => biTuChoi });
    await post.catch(() => {});

    if (kqPost) {
      datKetQua(kqPost);
      datPha('xong');
      void napTrangThai(phien.token);
      return;
    }

    // POST không về được ⇒ hỏi DANH BẠ xem chain có thật sự tồn tại không.
    try {
      const st = await callConsole<{ chains: KetQua[] } & TrangThai>('/api/status', phien.token, undefined, CONSOLE_TIMEOUT_S);
      datTt(st);
      const co = st.chains.find((c) => c.name === ten.trim());
      if (co) {
        // Danh bạ không mang `luuY` (nó do `/api/create` sinh ra), nên dựng lại lời
        // dặn ở đây thay vì im lặng bỏ mất nó.
        datKetQua({ ...co, luuY: { tieuDe: t.launch.noteTitle, cachLam: t.launch.noteHow } });
        datPha('xong');
        return;
      }
    } catch { /* đọc danh bạ hỏng — rơi xuống nhánh báo lỗi bên dưới */ }

    datLoiDe(interpolate(t.launch.launchError, { chiTiet: tt2?.error ?? loiPost ?? t.launch.unknownError }));
    datPha('nhap');
  }

  /* ─────────────────────────────────────────────────────────────── giao diện */

  if (pha === 'vi') {
    return (
      <Card className="mt-8 max-w-xl p-5 md:p-6">
        <h2 className="font-display text-lg font-bold text-ink">{t.launch.connectWallet}</h2>
        <p className="mt-2 text-sm text-body-2">{t.launch.youWillOwn}</p>
        <div className="mt-5">
          <Button co="to" onClick={vao} isRunning={dangNoi}>
            {dangNoi ? t.launch.signing : t.launch.connectWallet}
          </Button>
        </div>
        {loiVi && (
          <div className="mt-4">
            <ErrorState tieuDe={loiVi} moTa="" thuLai={vao} />
          </div>
        )}
        {!getWallet() && (
          <div className="mt-4">
            <Note kieu="canhBao">{t.launch.noWallet}</Note>
          </div>
        )}
      </Card>
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
      <Card className="p-5 md:p-6">
        {pha === 'nhap' && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-ink">{t.launch.title}</h2>
              {/* 🔴 Trần hiện TRƯỚC khi người ta bỏ công, không phải lúc bị từ chối. */}
              <Badge kieu={hetCho ? 'canhBao' : 'tot'}>
                {hetCho ? t.launch.slotsFull : interpolate(t.launch.slotsLeft, { con: tran - soChain, tong: tran })}
              </Badge>
            </div>

            {hetCho && (
              <div className="mt-4">
                <Note kieu="canhBao">{t.launch.slotsFullDesc}</Note>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-5">
              <Field
                nhan={t.launch.nameLabel}
                moTa={t.launch.nameHelp}
                placeholder={t.launch.namePlaceholder}
                value={ten}
                onChange={(e) => datTen(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                loi={tenSach && !tenOk ? t.launch.nameInvalid : undefined}
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
                  <Skeleton className="h-12 w-full" />
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
                <ErrorState tieuDe={loiDe} moTa="" />
              </div>
            )}

            <div className="mt-6">
              <Button co="to" disabled={!tenOk || hetCho || !tt} onClick={() => datPha('soat')}>
                {t.launch.reviewCta}
              </Button>
            </div>
          </>
        )}

        {pha === 'soat' && (
          <>
            <h2 className="font-display text-lg font-bold text-ink">{t.launch.reviewTitle}</h2>
            <div className="mt-3 flex flex-col gap-3">
              <Note kieu="canhBao">{t.launch.reviewDesc}</Note>
              {/* Cảnh báo re-genesis đặt ở ĐÂY chứ không chỉ ở dải trên đầu trang:
                  đây là giây cuối trước cửa một chiều, và là chỗ duy nhất chắc chắn
                  người dùng đang đọc. Gỡ cùng lúc với dải banner sau ngày G. */}
              <Note kieu="canhBao">
                {interpolate(t.launch.reviewRebuild, { ngay: t.rebuild.date })}
              </Note>
            </div>
            <dl className="mt-5 flex flex-col gap-3">
              {[
                { k: t.launch.reviewName, v: tenSach },
                { k: t.launch.reviewType, v: presetHienTai?.name ?? preset },
                { k: t.launch.reviewOwner, v: phien?.diaChi ?? '' },
              ].map((x) => (
                <div key={x.k} className="flex flex-col gap-1 border-b border-line-soft pb-3 last:border-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{x.k}</dt>
                  <dd className="break-all font-mono text-sm text-ink">{x.v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button co="to" onClick={de}>
                {t.launch.reviewConfirm}
              </Button>
              <Button co="to" kieu="vien" onClick={() => datPha('nhap')}>
                {t.launch.reviewBack}
              </Button>
            </div>
          </>
        )}

        {pha === 'chay' && (
          <>
            <h2 className="font-display text-lg font-bold text-ink">
              {interpolate(t.launch.launching, { ten: tenSach })}
            </h2>
            <p className="mt-2 text-sm text-body-2">{t.launch.launchingDesc}</p>
            <div className="mt-5">
              {tienTrinh?.steps?.length ? (
                <Steps
                  buoc={tienTrinh.steps}
                  ghiChu={
                    tienTrinh.etaSeconds
                      ? interpolate(t.launch.etaRemaining, { phut: Math.max(1, Math.ceil(tienTrinh.etaSeconds / 60)) })
                      : undefined
                  }
                />
              ) : (
                <p className="text-sm text-muted">{t.launch.preparing}</p>
              )}
            </div>
          </>
        )}

        {pha === 'xong' && ketQua && (
          <>
            <h2 className="font-display text-lg font-bold text-success-ink">
              {interpolate(t.launch.doneTitle, { ten: ketQua.name })}
            </h2>
            <dl className="mt-4 flex flex-col gap-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{t.launch.doneChainId}</dt>
                <dd className="mt-1">
                  <Copyable giaTri={String(ketQua.chainId)} nhan={t.launch.doneChainId} />
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{t.launch.doneRpc}</dt>
                <dd className="mt-1">
                  <Copyable giaTri={ketQua.rpc} nhan={t.launch.doneRpc} />
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
                <Note>
                  <strong className="block font-semibold">{ketQua.luuY.tieuDe}</strong>
                  <span className="mt-1 block">{ketQua.luuY.cachLam}</span>
                </Note>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                kieu="vien"
                onClick={async () => {
                  datLoiThemVi(null);
                  try {
                    await addL1ToWallet({
                      chainIdHex: '0x' + ketQua.chainId.toString(16),
                      name: ketQua.name,
                      rpc: ketQua.rpc,
                      kyHieu: 'LOVE9',
                    });
                    datDaThemVi(true);
                  } catch (e) {
                    const l = readWalletError(e);
                    datLoiThemVi(
                      l.tuChoi ? t.common.walletRejected : interpolate(t.launch.doneAddWalletError, { chiTiet: l.chu ?? '' }),
                    );
                  }
                }}
              >
                {daThemVi ? t.launch.doneAdded : t.launch.doneAddWallet}
              </Button>

              <Button
                isRunning={kichHoat === 'dang'}
                disabled={kichHoat === 'xong'}
                onClick={async () => {
                  if (!phien) return;
                  datKichHoat('dang');
                  datLoiKichHoat(null);
                  try {
                    await activateChain('0x' + ketQua.chainId.toString(16), phien.diaChi);
                    datKichHoat('xong');
                  } catch (e) {
                    datKichHoat('chua');
                    const l = readWalletError(e);
                    datLoiKichHoat(
                      l.tuChoi ? t.common.walletRejected : interpolate(t.launch.doneActivateError, { chiTiet: l.chu ?? '' }),
                    );
                  }
                }}
              >
                {kichHoat === 'xong' ? t.launch.doneActivated
                  : kichHoat === 'dang' ? t.launch.doneActivating
                  : t.launch.doneActivate}
              </Button>

              <Button
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
                {t.launch.launchAnother}
              </Button>
            </div>

            {/* 🔴 Vùng live THƯỜNG TRÚ, không phải sinh ra cùng nội dung. Trình đọc
                màn hình chỉ theo dõi vùng live đã có sẵn trong DOM — chèn cả vùng
                lẫn chữ vào cùng lúc thì nó không đọc gì. Đây là khuôn `Copyable`
                đang làm đúng, và là khuôn `Steps` đang làm sai. */}
            <div role="status" aria-live="polite" className="mt-4 flex flex-col gap-2 empty:hidden">
              {loiThemVi && <p className="text-sm text-danger">{loiThemVi}</p>}
              {loiKichHoat && <p className="text-sm text-danger">{loiKichHoat}</p>}
            </div>
          </>
        )}
      </Card>

      <Card className="h-max p-5">
        <h2 className="font-display text-base font-bold text-ink">{t.launch.yourWallet}</h2>
        <p className="mt-2 break-all font-mono text-sm text-ink">{phien ? shortenAddress(phien.diaChi, 10, 8) : ''}</p>
        <p className="mt-2 text-sm text-body-2">{t.launch.youWillOwn}</p>
      </Card>
    </div>
  );
}
