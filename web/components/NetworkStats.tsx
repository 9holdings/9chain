'use client';

import { useSoLieu } from '@/lib/stats';
import { Xuong, Nhan } from './ui';
import { gop } from '@/lib/gop';
import { useT, useNgonNgu } from '@/lib/i18n';
import { dinhDangSo } from '@/lib/so';

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
  const { ma } = useNgonNgu();
  const { tt, napLai } = useSoLieu();
  const toi = tren === 'toi';

  const nhanLop = gop('text-xs font-semibold uppercase tracking-wide', toi ? 'text-on-dark-3' : 'text-muted');
  const soLop = gop('font-display text-2xl font-extrabold md:text-3xl', toi ? 'text-on-dark' : 'text-ink');

  if (tt.pha === 'hong') {
    return (
      <div className={gop('mt-8 text-sm', toi ? 'text-on-dark-3' : 'text-muted')}>
        <button type="button" onClick={napLai} className="underline">
          {t.stats.cannotMeasure}
        </button>
        <span className="ms-2">{t.stats.cannotMeasureDesc}</span>
      </div>
    );
  }

  /**
   * Ba trạng thái MỖI Ô, không phải ba trạng thái cả dải (Đ1-8):
   *   `undefined` — đang đo    ⇒ khung xương
   *   `string`    — đo được    ⇒ con số
   *   `null`      — ô này vắng ⇒ gạch ngang + lời khai cho trình đọc màn hình
   *
   * 🔴 Gạch ngang, KHÔNG phải `0`. `0` là một con số, và ở đây nó sẽ là một con số
   * SAI: "0 validator" đọc như mạng chết, trong khi sự thật là ta chưa hỏi được.
   * Đó đúng thứ luật cũ của tệp này cấm — và nó vẫn được giữ nguyên.
   */
  const s = tt.pha === 'xong' ? tt.so : null;
  const o: { nhan: string; gt: string | null | undefined }[] = !s
    ? [{ nhan: t.stats.validators }, { nhan: t.stats.l1Count }, { nhan: t.stats.blockHeight }].map((x) => ({
        ...x,
        gt: undefined, // chưa đo xong ⇒ cả ba ô là khung xương
      }))
    : [
        {
          nhan: t.stats.validators,
          gt: s.validatorTong === null ? null : `${s.validatorKetNoi}/${s.validatorTong}`,
        },
        { nhan: t.stats.l1Count, gt: s.soL1 === null ? null : String(s.soL1) },
        {
          nhan: t.stats.blockHeight,
          gt: s.chieuCaoBlock === null ? null : dinhDangSo(s.chieuCaoBlock, ma),
        },
      ];

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2">
        <Nhan kieu="tot">{t.stats.title}</Nhan>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-4 sm:max-w-lg">
        {o.map((x) => (
          <div key={x.nhan}>
            <dt className={nhanLop}>{x.nhan}</dt>
            <dd className={soLop}>
              {x.gt !== undefined && x.gt !== null ? (
                x.gt
              ) : x.gt === null ? (
                /* Ô này vắng: gạch ngang thấy được + lời khai nghe được. Trình đọc
                   màn hình phải NGHE ĐƯỢC sự khác nhau giữa "—" và một con số, nếu
                   không thì với họ ô vắng và ô bằng 0 là một. */
                <>
                  <span aria-hidden="true">—</span>
                  <span className="sr-only">{t.stats.cannotMeasure}</span>
                </>
              ) : (
                <>
                  {/* Khung xương có nhãn cho trình đọc màn hình — nếu không, người
                      dùng nghe một danh sách rỗng và không biết đang chờ gì. */}
                  <span className="sr-only">{t.stats.measuring}</span>
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
