'use client';

import { useEffect, useState } from 'react';
import { The, Xuong, CoLoi, TrongRong, Nhan } from '@/components/ui';
import { rutGon } from '@/lib/eip55';
import { useT } from '@/lib/i18n';
import { readDirectory } from '@/lib/directory';

/**
 * Danh sách L1 đã có, đọc từ hợp đồng dữ liệu `console-chains.json`.
 *
 * 🔴 KHOÁ THIẾU LÀ TRẠNG THÁI HỢP LỆ, KHÔNG PHẢI LỖI. Chain đẻ trước khi console có
 * trường `admin`/`presetName` sẽ không có hai khoá đó (OmegaChain là một). Bản chép
 * tay cũ của trang danh bạ từng để `undefined` lọt ra mặt người dùng. Ở đây: thiếu
 * chủ ⇒ "mặc định của hệ thống"; thiếu kiểu ⇒ để trống, không bịa.
 *
 * ⚠️ Trang này CHỈ ĐỌC. Danh bạ đầy đủ (đo sống/chết bằng số validator của subnet)
 * là của 9Scan-A1 — A1 không lấn sân, chỉ mượn dữ liệu để dẫn người dùng.
 */
/**
 * `presetTen` là khoá CŨ, viết bởi console trước lần chuẩn hoá tên tiếng Anh
 * (2026-08-26). Bản ghi đẻ trước mốc đó vẫn mang nó, và bản ghi ĐÃ ĐẺ thì không
 * viết lại — nên đọc cả hai. Bỏ nhánh cũ đi được khi không còn bản ghi nào trước
 * mốc, nhưng nhớ rằng phục hồi từ backup cũ sẽ mang chúng quay lại.
 */
type Chain = { name: string; chainId: number; admin?: string; presetName?: string; presetTen?: string };
type TT = { pha: 'tai' } | { pha: 'xong'; ds: Chain[] } | { pha: 'hong' };

export function ChainTable() {
  const t = useT();
  const [tt, datTt] = useState<TT>({ pha: 'tai' });
  const [lan, datLan] = useState(0);

  useEffect(() => {
    let huy = false;
    datTt({ pha: 'tai' });
    // Hạn giờ (Đ1-8) vẫn còn, nay nằm trong `lib/directory.ts` cùng với lượt đọc:
    // đây là một lượt ĐỌC tệp tĩnh, và không có hạn thì một kết nối treo để bảng ở
    // khung xương vĩnh viễn — trang trông như đang tải mãi mãi, và người dùng không
    // có gì để bấm. Lượt đọc đó DÙNG CHUNG với `useSoLieu` ở cùng trang này.
    readDirectory()
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
        <span className="sr-only">{t.common.loading}</span>
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
    return (
      <TrongRong
        tieuDe={t.home.emptyTitle}
        moTa={t.home.emptyDesc}
        hanhDong={
          <a
            href="/create-chain/"
            className="inline-flex h-11 items-center justify-center rounded-btn-lg bg-gold px-5 text-sm font-semibold text-navy shadow-cta hover:bg-gold-hover"
          >
            {t.home.primaryCta}
          </a>
        }
      />
    );
  }

  return (
    <>
      {/* 🔴 CHÚ THÍCH NÀY CHỈ HIỆN KHI BẢNG CÓ DÒNG (Đ1-4).
          Trước 2026-08-27 câu "Mỗi dòng là một chain thật đang chạy" nằm ở `<p>` dưới
          `<h1>` — tức nó hiện ra KỂ CẢ khi bảng rỗng, và lúc đó nó trỏ vào những dòng
          không tồn tại. Đặt ở đây thì câu chỉ tồn tại cùng lúc với thứ nó mô tả. */}
      <p className="mb-3 text-sm text-body">{t.home.tableCaption}</p>
      <The className="overflow-hidden">
      {/* Bảng rộng phải cuộn TRONG khung của nó — để cả trang cuộn ngang là hỏng
          bố cục ở điện thoại, và đó là lỗi hay gặp nhất với bảng. */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <caption className="sr-only">{t.home.tableCaption}</caption>
          {/* 🔴 `text-start` MUST BE ON EVERY `<th>`, NOT ONLY ON THE `<tr>`.
              Measured on the deployed site 2026-09-03: with `text-left` on the `<tr>`
              the column headers picked it up, but switching to `text-start` moved them
              to `center` — so the inheritance path from `<tr>` down to `<th>` is NOT
              equivalent between those two utilities, and the RTL fix had silently
              re-aligned the table in English too. Putting it on the `<th>` itself
              depends on no inheritance at all, so it is right in both writing
              directions. `text-start` stays on the `<tr>` for the `<td>`s below. */}
          <thead>
            <tr className="border-b border-line bg-surface-alt text-start">
              <th scope="col" className="px-4 py-3 text-start font-semibold text-ink">
                {t.home.colChain}
              </th>
              <th scope="col" className="px-4 py-3 text-start font-semibold text-ink">
                {t.home.colType}
              </th>
              <th scope="col" className="px-4 py-3 text-start font-semibold text-ink">
                {t.home.colOwner}
              </th>
            </tr>
          </thead>
          <tbody>
            {tt.ds.map((c) => (
              <tr key={c.chainId} className="border-b border-line-soft last:border-0">
                <th scope="row" className="px-4 py-3 text-start font-semibold text-ink">
                  {c.name}
                  <span className="ms-2 font-mono text-xs font-normal text-muted">#{c.chainId}</span>
                </th>
                <td className="px-4 py-3 text-body-2">
                  {(c.presetName ?? c.presetTen) ? <Nhan>{c.presetName ?? c.presetTen}</Nhan> : <span className="text-muted">—</span>}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-body-2">
                  {typeof c.admin === 'string' && c.admin.trim() ? (
                    rutGon(c.admin)
                  ) : (
                    <span className="font-sans text-muted">{t.home.systemDefault}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </The>
    </>
  );
}
