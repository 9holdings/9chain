'use client';

import { useState } from 'react';
import { Card, Badge, Skeleton, Note, cx } from '@/components/ui';
import { useNetworkStats } from '@/lib/stats';
import { useT, useLanguage } from '@/lib/i18n';
import { formatNumber } from '@/lib/numbers';

/**
 * Bảng so sánh A1 ↔ C1.
 *
 * 🔴 HAI LUẬT CỦA MÀN NÀY, cả hai đều về TÍNH TRUNG THỰC chứ không về giao diện:
 *
 * 1. **Tự chấm thì phải ghi rõ là tự chấm.** Điểm A1/C1 dưới đây do đội đặt, không
 *    phải đo độc lập. Một bảng điểm không khai điều đó thì nó không phải bằng chứng,
 *    nó là quảng cáo có bảng biểu — và A1 là bên đang trình bày.
 *
 * 2. **C1 vắng mặt phải trông như VẮNG MẶT, không như HỎNG.** Số C1 cần URL Cosmos
 *    REST mà dự án chưa có (H-5). Vẽ một khối lỗi đỏ ở chỗ đó là nói sai về C1; để
 *    trống cũng vậy. Nói thẳng "chưa nối được" + vì sao, rồi phần còn lại vẫn dùng
 *    được bình thường.
 */

/**
 * Một tiêu chí: ĐIỂM ở lại trong mã, CHỮ nằm trong từ điển.
 *
 * 🔴 Ranh giới đó có chủ ý và đã trả giá. Trước `2026-09-03` cả tên tiêu chí lẫn ghi
 * chú đều là chuỗi tiếng Việt cắm cứng trong mảng dưới đây — tức toàn bộ THÂN bảng
 * so sánh, phần dài nhất và mang nhiều lập luận nhất của màn này, hiện ra bằng tiếng
 * Việt cho người đọc ở cả 30 ngôn ngữ. Bộ soát chuỗi cũ mù với nó vì nó chỉ đọc văn
 * bản JSX và thuộc tính, còn đây là chữ nằm trong DỮ LIỆU.
 *
 * `id` là khoá tra trong `t.compare` (`crit<Id>` và `note<Id>`) — nối bằng ghép chuỗi
 * chứ không tra động ở chỗ gọi, để `check-dict-values` và `tsc` còn thấy được liên hệ.
 */
type Criterion = { id: string; kind: 'kienTruc' | 'song'; a: number; c: number; w: number };

// Giữ nguyên bộ tiêu chí + điểm của bản dashboard cũ (`local-net/dashboard/index.html`)
// và của `docs/A1-vs-C1-SCORECARD.md`. KHÔNG chấm lại ở đây: đổi điểm là một quyết
// định về sản phẩm, phải đi qua tài liệu, không lẫn vào một lượt dựng giao diện.
const GOC: Criterion[] = [
  { id: 'Decentralisation', kind: 'kienTruc', a: 5, c: 2, w: 4 },
  { id: 'Finality', kind: 'kienTruc', a: 5, c: 3, w: 3 },
  { id: 'EvmMaturity', kind: 'kienTruc', a: 5, c: 2, w: 4 },
  { id: 'WalletCompat', kind: 'kienTruc', a: 5, c: 3, w: 4 },
  { id: 'LaunchUx', kind: 'song', a: 4, c: 4, w: 3 },
  { id: 'Interop', kind: 'song', a: 3, c: 5, w: 4 },
  { id: 'OpCost', kind: 'kienTruc', a: 4, c: 3, w: 2 },
  { id: 'Bootstrap', kind: 'kienTruc', a: 2, c: 4, w: 3 },
  { id: 'EconSecurity', kind: 'kienTruc', a: 4, c: 3, w: 3 },
  { id: 'SwitchCost', kind: 'kienTruc', a: 2, c: 5, w: 2 },
];

export function ComparisonTable() {
  const t = useT();
  // Tra theo `id`. Khoá GHÉP nên `tsc` không kiểm được, và `i18n-shape` cũng mù —
  // nó so 30 từ điển VỚI NHAU, nên "cả 30 cùng thiếu" là hợp lệ với nó. Thứ canh
  // đúng chuyện này là `test/compare-criteria.test.ts`, nối mảng dưới đây với từ
  // điển theo CẢ HAI CHIỀU.
  const ten = (c: Criterion) => (t.compare as Record<string, string>)[`crit${c.id}`];
  const ghiChu = (c: Criterion) => (t.compare as Record<string, string>)[`note${c.id}`];
  const { code } = useLanguage();
  const [ts, datTs] = useState<number[]>(GOC.map((c) => c.w));
  const { state } = useNetworkStats();

  const diemA = GOC.reduce((t, c, i) => t + c.a * ts[i], 0);
  const diemC = GOC.reduce((t, c, i) => t + c.c * ts[i], 0);
  const tong = diemA + diemC || 1;

  return (
    <div className="mt-8 flex flex-col gap-6">
      <Note tone="warn">
        <strong className="block font-semibold">{t.compare.selfScoreTitle}</strong>
        <span className="mt-1 block">{t.compare.selfScoreDesc}</span>
      </Note>

      <Card className="p-5">
        <h2 className="font-display text-base font-bold text-ink">{t.compare.liveDataTitle}</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          {/* Ba trạng thái MỖI Ô (Đ1-8): `undefined` đang đo · `string` đo được ·
              `null` ô này vắng. Xem `lib/stats.ts` cho vì sao một nguồn hỏng không
              còn kéo theo hai ô kia. */}
          {(() => {
            const s = state.phase === 'done' ? state.numbers : null;
            return [
              {
                n: t.compare.a1Validators,
                v: !s ? undefined : s.validatorsTotal === null ? null : `${s.validatorsConnected}/${s.validatorsTotal}`,
              },
              { n: t.compare.a1Chains, v: !s ? undefined : s.l1Count === null ? null : String(s.l1Count) },
              {
                n: t.compare.a1Blocks,
                v: !s ? undefined : s.blockHeight === null ? null : formatNumber(s.blockHeight, code),
              },
            ];
          })().map((x) => (
            <div key={x.n}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{x.n}</dt>
              <dd className="font-display text-2xl font-extrabold text-ink">
                {x.v !== undefined && x.v !== null ? (
                  x.v
                ) : x.v === null || state.phase === 'failed' ? (
                  <span className="font-sans text-sm font-normal text-muted">{t.compare.cannotMeasure}</span>
                ) : (
                  <><span className="sr-only">{t.compare.measuring}</span><Skeleton className="h-8 w-16" /></>
                )}
              </dd>
            </div>
          ))}
        </dl>
        {/* C1 vắng mặt: nói thẳng là VẮNG, không vẽ khối lỗi. */}
        <div className="mt-5 rounded-card border border-dashed border-line-strong bg-surface-alt px-4 py-3">
          <p className="text-sm font-semibold text-body">{t.compare.c1Unreachable}</p>
          <p className="mt-1 text-sm text-body-2">{t.compare.c1UnreachableDesc}</p>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-sm">
            <caption className="sr-only">{t.compare.title}</caption>
            {/* `text-start` on each `<th>` — same issue as documented in
                `app/ChainTable.tsx`. The two `text-center` cells are DELIBERATE. */}
            <thead>
              <tr className="border-b border-line bg-surface-alt text-start">
                <th scope="col" className="px-3 py-3 text-start font-semibold text-ink">{t.compare.colNo}</th>
                <th scope="col" className="px-3 py-3 text-start font-semibold text-ink">{t.compare.colCriterion}</th>
                <th scope="col" className="px-3 py-3 text-start font-semibold text-ink">{t.compare.colKind}</th>
                <th scope="col" className="px-3 py-3 text-center font-semibold text-ink">{t.compare.colA1}</th>
                <th scope="col" className="px-3 py-3 text-center font-semibold text-ink">{t.compare.colC1}</th>
                <th scope="col" className="px-3 py-3 text-start font-semibold text-ink">{t.compare.colWeight}</th>
              </tr>
            </thead>
            <tbody>
              {GOC.map((c, i) => (
                <tr key={c.id} className="border-b border-line-soft last:border-0">
                  <td className="px-3 py-3 font-mono text-xs text-muted">{i + 1}</td>
                  <th scope="row" className="px-3 py-3 text-start font-semibold text-ink">
                    {ten(c)}
                    <span className="mt-0.5 block text-xs font-normal text-body-2">{ghiChu(c)}</span>
                  </th>
                  <td className="px-3 py-3">
                    <Badge tone={c.kind === 'song' ? 'good' : 'neutral'}>
                      {c.kind === 'song' ? t.compare.kindLiveData : t.compare.kindArchitecture}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-center font-mono font-bold text-ink">{c.a}</td>
                  <td className="px-3 py-3 text-center font-mono font-bold text-ink">{c.c}</td>
                  <td className="px-3 py-3">
                    <label className="flex items-center gap-2">
                      {/* Nhãn ẩn: một thanh trượt không nhãn thì trình đọc màn hình
                          chỉ đọc "slider" — trong bảng 10 dòng là vô nghĩa. */}
                      <span className="sr-only">{`${t.compare.colWeight}: ${ten(c)}`}</span>
                      <input
                        type="range" min={0} max={5} step={1} value={ts[i]}
                        onChange={(e) => datTs((v) => v.map((x, j) => (j === i ? +e.target.value : x)))}
                        className="w-24"
                      />
                      <span className="w-4 font-mono text-sm text-ink">{ts[i]}</span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-display text-base font-bold text-ink">{t.compare.totalScore}</h2>
        <div className="mt-4 flex flex-wrap items-baseline gap-6">
          {[
            { t: 'A1', d: diemA, mau: 'text-gold-ink-strong' },
            { t: 'C1', d: diemC, mau: 'text-vision-ink' },
          ].map((x) => (
            <p key={x.t} className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-muted">{x.t}</span>
              <span className={cx('font-display text-3xl font-extrabold', x.mau)}>{x.d}</span>
            </p>
          ))}
          <p className="text-sm font-semibold text-body">
            {diemA === diemC ? t.compare.tied : `${diemA > diemC ? 'A1' : 'C1'} ${t.compare.leads}`}
          </p>
        </div>
        {/* Thanh tỉ lệ chỉ là hình minh hoạ cho hai con số ĐÃ hiện ở trên — nên nó
            aria-hidden, không phải một thông tin thứ hai phải đọc lại. */}
        <div aria-hidden="true" className="mt-4 flex h-5 overflow-hidden rounded-chip">
          <div className="bg-gold" style={{ width: `${(diemA / tong) * 100}%` }} />
          <div className="bg-vision-dot" style={{ width: `${(diemC / tong) * 100}%` }} />
        </div>
      </Card>
    </div>
  );
}
