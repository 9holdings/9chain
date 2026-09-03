'use client';

import { useNetworkStats } from '@/lib/stats';
import { Skeleton, Badge } from './ui';
import { cx } from '@/lib/cx';
import { useT, useLanguage } from '@/lib/i18n';
import { formatNumber } from '@/lib/numbers';

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
  const { code } = useLanguage();
  const { state, reload } = useNetworkStats();
  const dark = tren === 'toi';

  const labelClass = cx('text-xs font-semibold uppercase tracking-wide', dark ? 'text-on-dark-3' : 'text-muted');
  const valueClass = cx('font-display text-2xl font-extrabold md:text-3xl', dark ? 'text-on-dark' : 'text-ink');

  if (state.phase === 'hong') {
    return (
      <div className={cx('mt-8 text-sm', dark ? 'text-on-dark-3' : 'text-muted')}>
        <button type="button" onClick={reload} className="underline">
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
  const s = state.phase === 'xong' ? state.so : null;
  const o: { label: string; value: string | null | undefined }[] = !s
    ? [{ label: t.stats.validators }, { label: t.stats.l1Count }, { label: t.stats.blockHeight }].map((x) => ({
        ...x,
        value: undefined, // chưa đo xong ⇒ cả ba ô là khung xương
      }))
    : [
        {
          label: t.stats.validators,
          value: s.validatorsTotal === null ? null : `${s.validatorsConnected}/${s.validatorsTotal}`,
        },
        { label: t.stats.l1Count, value: s.l1Count === null ? null : String(s.l1Count) },
        {
          label: t.stats.blockHeight,
          value: s.blockHeight === null ? null : formatNumber(s.blockHeight, code),
        },
      ];

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2">
        <Badge tone="good">{t.stats.title}</Badge>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-4 sm:max-w-lg">
        {o.map((x) => (
          <div key={x.label}>
            <dt className={labelClass}>{x.label}</dt>
            <dd className={valueClass}>
              {x.value !== undefined && x.value !== null ? (
                x.value
              ) : x.value === null ? (
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
                  <Skeleton className="h-8 w-16" />
                </>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
