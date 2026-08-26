'use client';

import { useEffect, useState } from 'react';
import { The, Xuong, CoLoi, TrongRong, Nhan } from '@/components/ui';
import { rutGon } from '@/lib/eip55';
import { vi } from '@/lib/i18n/vi';

/**
 * Danh sách L1 đã có, đọc từ hợp đồng dữ liệu `console-chains.json`.
 *
 * 🔴 KHOÁ THIẾU LÀ TRẠNG THÁI HỢP LỆ, KHÔNG PHẢI LỖI. Chain đẻ trước khi console có
 * trường `admin`/`presetTen` sẽ không có hai khoá đó (OmegaChain là một). Bản chép
 * tay cũ của trang danh bạ từng để `undefined` lọt ra mặt người dùng. Ở đây: thiếu
 * chủ ⇒ "mặc định của hệ thống"; thiếu kiểu ⇒ để trống, không bịa.
 *
 * ⚠️ Trang này CHỈ ĐỌC. Danh bạ đầy đủ (đo sống/chết bằng số validator của subnet)
 * là của 9Scan-A1 — A1 không lấn sân, chỉ mượn dữ liệu để dẫn người dùng.
 */
type Chain = { name: string; chainId: number; admin?: string; presetTen?: string };
type TT = { pha: 'tai' } | { pha: 'xong'; ds: Chain[] } | { pha: 'hong' };

export function BangChain() {
  const [tt, datTt] = useState<TT>({ pha: 'tai' });
  const [lan, datLan] = useState(0);

  useEffect(() => {
    let huy = false;
    datTt({ pha: 'tai' });
    fetch('/chains/data/console-chains.json', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((j) => {
        if (huy) return;
        datTt({ pha: 'xong', ds: Array.isArray(j?.chains) ? j.chains : [] });
      })
      .catch(() => {
        if (!huy) datTt({ pha: 'hong' });
      });
    return () => {
      huy = true;
    };
  }, [lan]);

  if (tt.pha === 'tai') {
    return (
      <The className="p-5">
        <span className="sr-only">{vi.chung.dangTai}</span>
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Xuong key={i} className="h-10 w-full" />
          ))}
        </div>
      </The>
    );
  }

  if (tt.pha === 'hong') return <CoLoi thuLai={() => datLan((n) => n + 1)} />;

  if (!tt.ds.length) {
    return <TrongRong tieuDe={vi.trangChu.cTrong} moTa={vi.trangChu.cTrongMoTa} />;
  }

  return (
    <The className="overflow-hidden">
      {/* Bảng rộng phải cuộn TRONG khung của nó — để cả trang cuộn ngang là hỏng
          bố cục ở điện thoại, và đó là lỗi hay gặp nhất với bảng. */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <caption className="sr-only">{vi.trangChu.cTieuDe}</caption>
          <thead>
            <tr className="border-b border-line bg-surface-alt text-left">
              <th scope="col" className="px-4 py-3 font-semibold text-ink">
                {vi.trangChu.cCot}
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-ink">
                {vi.trangChu.cCotKieu}
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-ink">
                {vi.trangChu.cCotChu}
              </th>
            </tr>
          </thead>
          <tbody>
            {tt.ds.map((c) => (
              <tr key={c.chainId} className="border-b border-line-soft last:border-0">
                <th scope="row" className="px-4 py-3 text-left font-semibold text-ink">
                  {c.name}
                  <span className="ms-2 font-mono text-xs font-normal text-muted">#{c.chainId}</span>
                </th>
                <td className="px-4 py-3 text-body-2">
                  {c.presetTen ? <Nhan>{c.presetTen}</Nhan> : <span className="text-muted">—</span>}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-body-2">
                  {typeof c.admin === 'string' && c.admin.trim() ? (
                    rutGon(c.admin)
                  ) : (
                    <span className="font-sans text-muted">{vi.trangChu.cMacDinh}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </The>
  );
}
