import type { Metadata } from 'next';
import { vi } from '@/lib/i18n/vi';
import { Nhan } from '@/components/ui';
import { SoLieuMang } from '@/components/SoLieuMang';
import { ThanhChon } from '@/components/ThanhChon';
import { OTenChain } from './OTenChain';

export const metadata: Metadata = { title: `${vi.bienThe.bTen} — ${vi.chung.tenSanPham}` };

/**
 * BIẾN THỂ B — đặt thẳng MÀN ĐẺ CHAIN lên trang chủ.
 *
 * Đặt cược: đường ngắn nhất tới hành động thắng lời giải thích.
 * Điểm yếu phải nói thẳng: hỏi người lạ một câu (đặt tên) **trước khi** họ hiểu
 * mình đang mua gì. Nếu đối tượng thật sự đã biết mình muốn gì thì đây là bản
 * nhanh nhất; nếu chưa, đây là bản dễ làm người ta quay ra nhất.
 *
 * 🔴 Ô này KHÔNG tạo gì cả — nó chỉ mang tên chain sang màn đẻ. Genesis là bất
 * biến, nên bước ký + soát lại phải nằm ở màn đẻ (M10.4), không phải ở trang chủ.
 */
export default function BienTheB() {
  return (
    <>
      <ThanhChon dang="b" />
      <section className="bg-navy">
        <div className="khung py-16 md:py-24">
          <Nhan kieu="canhBao">{vi.trangChu.nhanTestnet}</Nhan>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-extrabold leading-tight text-on-dark md:text-5xl">
            {vi.trangChu.bTieuDe}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-on-dark-2 md:text-lg">{vi.trangChu.bPhu}</p>
          <OTenChain />
          <SoLieuMang tren="toi" />
        </div>
      </section>
    </>
  );
}
