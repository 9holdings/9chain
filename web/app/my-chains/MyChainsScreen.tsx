'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Nut, The, O, Nhan, Xuong, CoLoi, LuuY, ChepDuoc, TrongRong, CacBuoc, type MotBuoc } from '@/components/ui';
import { rutGon } from '@/lib/eip55';
import { rpcGoc } from '@/lib/chain';
import { dien, useT } from '@/lib/i18n';
import { layVi, noiVi, dangNhapSiwe, goiConsole, themL1VaoVi, choTienTrinhXong, docLoiVi, LoiConsole, type PhienVi } from '@/lib/wallet';

type Chain = {
  name: string; chainId: number; subnetID: string; blockchainID: string;
  admin?: string; presetName?: string; presetTen?: string; rpc?: string;
};
type TrangThai = { tran: number; chains: Chain[]; retired: Chain[]; viDangNhap: string | null };
type TienTrinh = { running: boolean; steps: MotBuoc[]; etaSeconds: number };

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
  const r = await fetch(`${rpcGoc()}/ext/bc/P`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1, method: 'platform.getCurrentValidators', params: { subnetID },
    }),
    cache: 'no-store',
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message);
  return (j.result?.validators ?? []).length;
}

export function MyChainsScreen() {
  const t = useT();
  const [phien, datPhien] = useState<PhienVi | null>(null);
  const [dangNoi, datDangNoi] = useState(false);
  const [loiVi, datLoiVi] = useState<string | null>(null);

  const [tt, datTt] = useState<TrangThai | null>(null);
  const [loiTai, datLoiTai] = useState(false);
  const [vld, datVld] = useState<Record<string, number | 'dang' | 'loi'>>({});

  // Kết quả bấm "Thêm vào ví", THEO TỪNG CHAIN — màn này vẽ nhiều chain một lúc, nên
  // một ô lỗi dùng chung sẽ dán lỗi của chain này lên thẻ của chain khác.
  // Bản trước `catch {}` trắng: bấm xong không có gì đổi, cả lúc được lẫn lúc hỏng.
  const [themVi, datThemVi] = useState<Record<number, { xong: true } | { xong: false; chu: string }>>({});

  const [dangThuHoi, datDangThuHoi] = useState<Chain | null>(null);
  const [goTen, datGoTen] = useState('');
  const [chay, datChay] = useState<{ ten: string } | null>(null);
  const [tienTrinh, datTienTrinh] = useState<TienTrinh | null>(null);
  const [xong, datXong] = useState<string | null>(null);
  const [loiThuHoi, datLoiThuHoi] = useState<string | null>(null);

  const nap = useCallback(async (token: string) => {
    datLoiTai(false);
    try {
      datTt(await goiConsole<TrangThai>('/api/status', token));
    } catch {
      datLoiTai(true);
    }
  }, []);

  async function vao() {
    datLoiVi(null);
    datDangNoi(true);
    try {
      const dc = await noiVi();
      const p = await dangNhapSiwe(dc);
      datPhien(p);
      await nap(p.token);
    } catch (e) {
      const m = String((e as Error).message ?? e);
      datLoiVi(m === 'KHONG_CO_VI' ? t.deChain.khongCoVi : /rejected|denied|4001/i.test(m) ? t.deChain.tuChoiKy : m);
    } finally {
      datDangNoi(false);
    }
  }

  const cuaToi = (tt?.chains ?? []).filter(
    (c) => phien && typeof c.admin === 'string' && c.admin.toLowerCase() === phien.diaChi.toLowerCase(),
  );
  const cuaToiDaThuHoi = (tt?.retired ?? []).filter(
    (c) => phien && typeof c.admin === 'string' && c.admin.toLowerCase() === phien.diaChi.toLowerCase(),
  );

  // Đo validator cho từng chain SỐNG, mỗi chain một lần. Đo song song vì chúng độc
  // lập; một chain đo hỏng không được kéo cả bảng xuống.
  useEffect(() => {
    for (const c of cuaToi) {
      if (c.subnetID in vld) continue;
      // 🔴 Sentinel là `'dang'`, KHÔNG phải 0. **0 validator là một trạng thái
      // THẬT và nguy hiểm**: subnet mới đẻ có tập validator RỖNG, chain đó vẫn trả
      // lời `eth_chainId`, vẫn đọc được số dư, MetaMask vẫn kết nối — chỉ là **giao
      // dịch không bao giờ chốt**. Dùng 0 làm "đang tải" là che đúng cái trạng thái
      // không có dấu hiệu bề ngoài nào khác để nhận ra.
      datVld((v) => ({ ...v, [c.subnetID]: 'dang' }));
      demValidator(c.subnetID)
        .then((n) => datVld((v) => ({ ...v, [c.subnetID]: n })))
        .catch(() => datVld((v) => ({ ...v, [c.subnetID]: 'loi' })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tt, phien]);

  // Poll tiến trình CHỈ trong lúc thu hồi — có điểm dừng rõ.
  const dongHo = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!chay || !phien) return;
    const doc = async () => {
      try {
        datTienTrinh(await goiConsole<TienTrinh>('/api/progress', phien.token));
      } catch { /* một nhịp hỏng không phải lý do bỏ cuộc — server vẫn đang chạy */ }
    };
    void doc();
    dongHo.current = setInterval(doc, 2000);
    return () => { if (dongHo.current) clearInterval(dongHo.current); };
  }, [chay, phien]);

  async function thucHienThuHoi(c: Chain) {
    if (!phien) return;
    datLoiThuHoi(null);
    datDangThuHoi(null);
    datChay({ ten: c.name });

    // 🔴 KHÔNG `await` cái POST này để kết luận. Thao tác mất ~170 giây, Cloudflare
    // cắt kết nối ở ~100 giây (HTTP 524) ⇒ qua tên miền công khai, POST **luôn**
    // hỏng trong khi server vẫn làm xong. Xem `choTienTrinhXong`.
    // 🔴 Nhưng 4xx thì KHÁC 524 — xem chú thích dài ở `CreateChainScreen.de()` và ở
    // `LoiConsole`. Server trả lời "không" (token hết hạn, tên không khớp xác nhận…)
    // nghĩa là việc chưa bắt đầu, và bắt người dùng nhìn thanh tiến trình thêm vài
    // phút cho một việc không tồn tại là nói dối theo một kiểu khác.
    let loiPost: string | null = null;
    let biTuChoi = false;
    const post = goiConsole('/api/revoke', phien.token, { name: c.name, xacNhan: c.name })
      .catch((e) => {
        loiPost = String((e as Error).message ?? e);
        if (e instanceof LoiConsole && e.laTuChoiThat) biTuChoi = true;
      });

    const kq = await choTienTrinhXong(phien.token, { tuChoiSom: () => biTuChoi });
    await post.catch(() => {});

    // Sự thật nằm ở DANH BẠ, không ở mã HTTP: thu hồi thành công ⇔ chain không còn
    // trong `chains`.
    let conSong = true;
    try {
      const st = await goiConsole<TrangThai>('/api/status', phien.token);
      datTt(st);
      conSong = st.chains.some((x) => x.name === c.name);
      if (!conSong) {
        datXong(dien(t.chainCuaToi.thuHoiXong, {
          ten: c.name, con: st.tran - st.chains.length, tong: st.tran,
        }));
      }
    } catch {
      datLoiTai(true);
    }
    if (conSong) {
      datLoiThuHoi(dien(t.chainCuaToi.thuHoiLoi, {
        chiTiet: kq?.error ?? loiPost ?? t.chainCuaToi.thuHoiKhongRo,
      }));
    }

    datChay(null);
    datTienTrinh(null);
    datGoTen('');
  }

  /* ───────────────────────────────────────────────────────────── giao diện */

  if (!phien) {
    return (
      <The className="mt-8 max-w-xl p-5 md:p-6">
        <h2 className="font-display text-lg font-bold text-ink">{t.chainCuaToi.noiVi}</h2>
        <div className="mt-4">
          <Nut co="to" onClick={vao} dangChay={dangNoi}>
            {dangNoi ? t.deChain.dangKy : t.deChain.noiVi}
          </Nut>
        </div>
        {loiVi && <div className="mt-4"><CoLoi tieuDe={loiVi} moTa="" thuLai={vao} /></div>}
        {!layVi() && <div className="mt-4"><LuuY kieu="canhBao">{t.deChain.khongCoVi}</LuuY></div>}
      </The>
    );
  }

  if (chay) {
    return (
      <The className="mt-8 max-w-2xl p-5 md:p-6">
        <h2 className="font-display text-lg font-bold text-ink">
          {dien(t.chainCuaToi.thuHoiDangChay, { ten: chay.ten })}
        </h2>
        <div className="mt-4">
          {tienTrinh?.steps?.length ? (
            <CacBuoc
              buoc={tienTrinh.steps}
              ghiChu={tienTrinh.etaSeconds
                ? dien(t.deChain.conKhoang, { phut: Math.max(1, Math.ceil(tienTrinh.etaSeconds / 60)) })
                : undefined}
            />
          ) : (
            <p className="text-sm text-muted">{t.deChain.dangChuanBi}</p>
          )}
        </div>
      </The>
    );
  }

  if (loiTai) return <div className="mt-8 max-w-xl"><CoLoi thuLai={() => nap(phien.token)} /></div>;
  if (!tt) {
    return (
      <The className="mt-8 p-5">
        <span className="sr-only">{t.chung.dangTai}</span>
        <div className="flex flex-col gap-3">{[0, 1].map((i) => <Xuong key={i} className="h-12 w-full" />)}</div>
      </The>
    );
  }

  return (
    <div className="mt-8 flex max-w-3xl flex-col gap-6">
      {xong && (
        <div role="status" className="rounded-card border border-success-line bg-success-bg px-4 py-3 text-sm font-semibold text-success-ink">
          {xong}
        </div>
      )}
      {loiThuHoi && <CoLoi tieuDe={loiThuHoi} moTa="" />}

      {!cuaToi.length && !cuaToiDaThuHoi.length ? (
        <TrongRong
          tieuDe={t.chainCuaToi.trongTieuDe}
          moTa={t.chainCuaToi.trongMoTa}
          hanhDong={
            <a href="/create-chain/" className="inline-flex h-11 items-center rounded-btn bg-gold px-4 text-sm font-semibold text-navy hover:bg-gold-hover">
              {t.chainCuaToi.trongNut}
            </a>
          }
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {cuaToi.map((c) => {
            const v = vld[c.subnetID];
            return (
              <li key={c.chainId}>
                <The className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-lg font-bold text-ink">
                        {c.name}
                        <span className="ms-2 font-mono text-xs font-normal text-muted">#{c.chainId}</span>
                      </h2>
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                        {(c.presetName ?? c.presetTen) && <Nhan>{c.presetName ?? c.presetTen}</Nhan>}
                        {v === undefined || v === 'dang' ? (
                          <span className="text-muted">{t.chainCuaToi.songDangDo}</span>
                        ) : v === 'loi' ? (
                          <span className="text-muted">{t.chainCuaToi.songKhongDo}</span>
                        ) : v === 0 ? (
                          <Nhan kieu="canhBao">{t.chainCuaToi.khongValidator}</Nhan>
                        ) : (
                          <Nhan kieu="tot">{dien(t.chainCuaToi.songDo, { so: v })}</Nhan>
                        )}
                      </p>
                      <p className="mt-1 text-xs text-muted">{t.chainCuaToi.songGiaiThich}</p>
                      {v === 0 && (
                        <p className="mt-2 max-w-prose text-sm font-semibold text-dev-ink">
                          {t.chainCuaToi.khongValidatorMoTa}
                        </p>
                      )}
                    </div>
                    <Nut kieu="vien" onClick={() => { datDangThuHoi(c); datGoTen(''); }}>
                      {t.chainCuaToi.thuHoi}
                    </Nut>
                  </div>

                  <dl className="mt-4 flex flex-col gap-2">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{t.chainCuaToi.thongSo}</dt>
                    <dd className="flex flex-wrap gap-2">
                      {c.rpc && <ChepDuoc giaTri={c.rpc} nhan="RPC" />}
                      <ChepDuoc giaTri={String(c.chainId)} nhan="Chain ID" />
                    </dd>
                  </dl>

                  {c.rpc && (
                    <div className="mt-3">
                      <Nut
                        kieu="tron"
                        onClick={async () => {
                          try {
                            await themL1VaoVi({ chainIdHex: '0x' + c.chainId.toString(16), name: c.name, rpc: c.rpc!, kyHieu: 'LOVE9' });
                            datThemVi((s) => ({ ...s, [c.chainId]: { xong: true } }));
                          } catch (e) {
                            const l = docLoiVi(e);
                            datThemVi((s) => ({
                              ...s,
                              [c.chainId]: {
                                xong: false,
                                chu: l.tuChoi
                                  ? t.chung.viTuChoi
                                  : dien(t.chainCuaToi.themViLoi, { chiTiet: l.chu ?? '' }),
                              },
                            }));
                          }
                        }}
                      >
                        {themVi[c.chainId]?.xong ? t.chainCuaToi.daThemVaoVi : t.chainCuaToi.themVaoVi}
                      </Nut>
                      {/* Vùng live thường trú cho TỪNG thẻ chain — xem chú thích cùng
                          loại ở CreateChainScreen. */}
                      <div role="status" aria-live="polite" className="mt-2 empty:hidden">
                        {themVi[c.chainId]?.xong === false && (
                          <p className="text-sm text-danger">
                            {(themVi[c.chainId] as { chu: string }).chu}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </The>
              </li>
            );
          })}

          {cuaToiDaThuHoi.map((c) => (
            <li key={`r-${c.chainId}`}>
              {/* Chain đã thu hồi vẽ từ mảng `retired` với NHÃN RIÊNG — tuyệt đối
                  không đem đo bằng heuristic chain sống (xem demValidator). */}
              <The className="border-dashed p-5 opacity-80">
                <h2 className="font-display text-base font-bold text-muted">
                  {c.name}
                  <span className="ms-2 font-mono text-xs font-normal">#{c.chainId}</span>
                </h2>
                <p className="mt-1 text-sm">
                  <Nhan kieu="xau">{t.chainCuaToi.daThuHoi}</Nhan>
                  <span className="ms-2 text-muted">{t.chainCuaToi.daThuHoiMoTa}</span>
                </p>
              </The>
            </li>
          ))}
        </ul>
      )}

      {dangThuHoi && (
        <The className="border-dev-line p-5">
          <h2 className="font-display text-lg font-bold text-ink">
            {dien(t.chainCuaToi.thuHoiTieuDe, { ten: dangThuHoi.name })}
          </h2>
          <ul className="mt-3 flex list-disc flex-col gap-2 ps-5 text-sm text-body">
            <li>{t.chainCuaToi.thuHoiY1}</li>
            {/* Hai điều người dùng KHÔNG đoán được — phải nói thẳng, không rút gọn. */}
            <li className="font-semibold">{t.chainCuaToi.thuHoiY2}</li>
            <li className="font-semibold">{t.chainCuaToi.thuHoiY3}</li>
            <li>{t.chainCuaToi.thuHoiY4}</li>
          </ul>
          <div className="mt-4 max-w-sm">
            {/* Gõ lại tên: cùng luật với đường API (`xacNhan`). Một nút "Xoá" bấm
                nhầm được thì cửa một chiều trở thành một cú trượt tay. */}
            <O
              nhan={t.chainCuaToi.thuHoiGoNhan}
              placeholder={dangThuHoi.name}
              value={goTen}
              onChange={(e) => datGoTen(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              loi={goTen && goTen !== dangThuHoi.name ? t.chainCuaToi.thuHoiSaiTen : undefined}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Nut disabled={goTen !== dangThuHoi.name} onClick={() => thucHienThuHoi(dangThuHoi)}>
              {t.chainCuaToi.thuHoiXacNhan}
            </Nut>
            <Nut kieu="tron" onClick={() => { datDangThuHoi(null); datGoTen(''); }}>
              {t.chainCuaToi.thuHoiHuy}
            </Nut>
          </div>
        </The>
      )}
    </div>
  );
}
