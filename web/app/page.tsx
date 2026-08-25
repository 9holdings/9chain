import { vi } from '@/lib/i18n/vi';
import { The, Nhan } from '@/components/ui';
import { SoLieuMang } from '@/components/SoLieuMang';

/**
 * Trang CHỌN BIẾN THỂ — tạm thời, chỉ sống trong lúc chờ David chọn (M10.3).
 *
 * Khi chốt: nội dung của biến thể được chọn thay chỗ file này, hai biến thể còn lại
 * và `components/ThanhChon.tsx` bị gỡ. Để cả ba lại sau khi đã chốt là để một bộ
 * điều khiển nội bộ nằm trên trang chủ công khai.
 *
 * 🔴 Ba bản khác nhau ở **CÁCH DẪN**, không ở nhắm ai — đối tượng đã chốt là
 * "người muốn có chain riêng". Mô tả mỗi bản nói cả **điểm yếu**, vì một danh sách
 * chỉ toàn điểm mạnh thì không giúp chọn được gì.
 */
const BAN = [
  { ten: vi.bienThe.aTen, moTa: vi.bienThe.aMoTa, href: '/tc-a/' },
  { ten: vi.bienThe.bTen, moTa: vi.bienThe.bMoTa, href: '/tc-b/' },
  { ten: vi.bienThe.cTen, moTa: vi.bienThe.cMoTa, href: '/tc-c/' },
];

export default function TrangChon() {
  return (
    <>
      <section className="bg-navy">
        <div className="khung py-12 md:py-16">
          <Nhan kieu="canhBao">{vi.trangChu.nhanTestnet}</Nhan>
          <h1 className="mt-4 font-display text-2xl font-extrabold text-on-dark md:text-4xl">
            {vi.bienThe.tieuDe}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-on-dark-2">{vi.bienThe.moTa}</p>
          <SoLieuMang tren="toi" />
        </div>
      </section>

      <section className="khung py-10 md:py-14">
        <ul className="grid gap-4 md:grid-cols-3">
          {BAN.map((b) => (
            <li key={b.href}>
              <The className="flex h-full flex-col p-5">
                <h2 className="font-display text-lg font-bold text-ink">{b.ten}</h2>
                <p className="mt-2 flex-1 text-sm text-body-2">{b.moTa}</p>
                <a
                  href={b.href}
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-btn border border-line-strong px-4 text-sm font-semibold text-ink hover:bg-surface-alt"
                >
                  {vi.bienThe.xemBan}
                </a>
              </The>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
