'use client';

import { useSoLieu } from '@/lib/stats';
import { Xuong, Nhan } from './ui';
import { gop } from '@/lib/gop';
import { useT } from '@/lib/i18n';

/**
 * Dải số liệu sống — thứ làm trang "trông như sản phẩm đang chạy" thay vì mockup.
 *
 * 🔴 Ba trạng thái, và trạng thái HỎNG phải nói được rằng **trang vẫn dùng được**.
 * Một con số trống ở trang chủ đọc như mạng chết; một khối lỗi đỏ to cũng vậy. Đây
 * là phần trang trí của sự thật, không phải đường đi của người dùng — hỏng thì lùi
 * xuống một dòng chữ nhạt, đừng dựng một màn lỗi.
 */
export function NetworkStats({ tren = 'sang' }: { tren?: 'sang' | 'toi' }) {
  const t = useT();
  const { tt, napLai } = useSoLieu();
  const toi = tren === 'toi';

  const nhanLop = gop('text-xs font-semibold uppercase tracking-wide', toi ? 'text-on-dark-3' : 'text-muted');
  const soLop = gop('font-display text-2xl font-extrabold md:text-3xl', toi ? 'text-on-dark' : 'text-ink');

  if (tt.pha === 'hong') {
    return (
      <div className={gop('mt-8 text-sm', toi ? 'text-on-dark-3' : 'text-muted')}>
        <button type="button" onClick={napLai} className="underline">
          {t.soLieu.khongDo}
        </button>
        <span className="ms-2">{t.soLieu.khongDoMoTa}</span>
      </div>
    );
  }

  const o = [
    {
      nhan: t.soLieu.validator,
      gt: tt.pha === 'xong' ? `${tt.so.validatorKetNoi}/${tt.so.validatorTong}` : null,
    },
    { nhan: t.soLieu.soL1, gt: tt.pha === 'xong' ? String(tt.so.soL1) : null },
    {
      nhan: t.soLieu.chieuCao,
      gt: tt.pha === 'xong' ? tt.so.chieuCaoBlock.toLocaleString('vi-VN') : null,
    },
  ];

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2">
        <Nhan kieu="tot">{t.soLieu.tieuDe}</Nhan>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-4 sm:max-w-lg">
        {o.map((x) => (
          <div key={x.nhan}>
            <dt className={nhanLop}>{x.nhan}</dt>
            <dd className={soLop}>
              {x.gt ?? (
                <>
                  {/* Khung xương có nhãn cho trình đọc màn hình — nếu không, người
                      dùng nghe một danh sách rỗng và không biết đang chờ gì. */}
                  <span className="sr-only">{t.soLieu.dangDo}</span>
                  <Xuong className="h-8 w-16" />
                </>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
