import { vi } from '@/lib/i18n/vi';
import { The, Nhan } from '@/components/ui';

/**
 * Trang chủ TẠM cho M10.1 — đủ để khung đứng được và mọi cửa vào có đích thật.
 *
 * Trang chủ THẬT là M10.3: **2–3 biến thể để David chọn**, đối tượng đã chốt là
 * "người muốn có chain riêng". Dựng sẵn một bản ở đây rồi coi như xong sẽ lấy mất
 * đúng lựa chọn mà mốc kia sinh ra để đưa cho David.
 */

const CUA_VAO = [
  { chu: vi.dieuHuong.faucet, moTa: vi.trangChu.cuaVaoFaucet, href: '/faucet/' },
  { chu: vi.dieuHuong.console, moTa: vi.trangChu.cuaVaoConsole, href: '/console/' },
  { chu: vi.dieuHuong.danhBa, moTa: vi.trangChu.cuaVaoDanhBa, href: '/chains/' },
];

export default function TrangChu() {
  return (
    <>
      <section className="bg-navy">
        <div className="khung py-16 md:py-24">
          <Nhan kieu="canhBao">{vi.trangChu.nhanTestnet}</Nhan>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-extrabold leading-tight text-on-dark md:text-5xl">
            {vi.trangChu.tieuDe}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-on-dark-2 md:text-lg">{vi.trangChu.moTa}</p>
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
        </div>
      </section>

      <section className="khung py-12">
        <h2 className="font-display text-xl font-bold text-ink">{vi.trangChu.dangDung}</h2>
        <p className="mt-2 max-w-2xl text-sm text-body-2">{vi.trangChu.dangDungMoTa}</p>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CUA_VAO.map((c) => (
            <li key={c.href}>
              <The className="h-full p-5">
                <a href={c.href} className="font-display text-lg font-bold text-ink hover:text-gold-ink-strong">
                  {c.chu}
                </a>
                <p className="mt-2 text-sm text-body-2">{c.moTa}</p>
              </The>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
