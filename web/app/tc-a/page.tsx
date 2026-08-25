import type { Metadata } from 'next';
import { vi } from '@/lib/i18n/vi';
import { The, Nhan } from '@/components/ui';
import { SoLieuMang } from '@/components/SoLieuMang';
import { ThanhChon } from '@/components/ThanhChon';

export const metadata: Metadata = { title: `${vi.bienThe.aTen} — ${vi.chung.tenSanPham}` };

/**
 * BIẾN THỂ A — dẫn bằng LỜI HỨA.
 *
 * Đặt cược: người muốn có chain riêng cần hiểu **mình nhận được gì** trước khi bấm.
 * Ít thứ trên màn nhất, đọc nhanh nhất.
 * Điểm yếu phải nói thẳng: bắt người ta tin trước khi thấy — không có bằng chứng
 * nào trên màn ngoài dải số liệu.
 */
const Y = [
  { ten: vi.trangChu.aY1Ten, noi: vi.trangChu.aY1 },
  { ten: vi.trangChu.aY2Ten, noi: vi.trangChu.aY2 },
  { ten: vi.trangChu.aY3Ten, noi: vi.trangChu.aY3 },
];

export default function BienTheA() {
  return (
    <>
      <ThanhChon dang="a" />
      <section className="bg-navy">
        <div className="khung py-16 md:py-24">
          <Nhan kieu="canhBao">{vi.trangChu.nhanTestnet}</Nhan>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-extrabold leading-tight text-on-dark md:text-5xl">
            {vi.trangChu.aTieuDe}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-on-dark-2 md:text-lg">{vi.trangChu.aPhu}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/console/"
              className="inline-flex h-13 items-center justify-center rounded-btn-lg bg-gold px-6 text-base font-semibold text-navy shadow-cta hover:bg-gold-hover"
            >
              {vi.trangChu.nutChinh}
            </a>
            <a
              href="/faucet/"
              className="inline-flex h-13 items-center justify-center rounded-btn-lg border border-line-dark-2 px-6 text-base font-semibold text-on-dark hover:bg-navy-hover"
            >
              {vi.trangChu.nutPhu}
            </a>
          </div>
          <SoLieuMang tren="toi" />
        </div>
      </section>

      <section className="khung py-12 md:py-16">
        <ul className="grid gap-4 md:grid-cols-3">
          {Y.map((y) => (
            <li key={y.ten}>
              <The className="h-full p-5">
                <h2 className="font-display text-lg font-bold text-ink">{y.ten}</h2>
                <p className="mt-2 text-sm text-body-2">{y.noi}</p>
              </The>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
