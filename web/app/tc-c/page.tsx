import type { Metadata } from 'next';
import { vi } from '@/lib/i18n/vi';
import { Nhan } from '@/components/ui';
import { SoLieuMang } from '@/components/SoLieuMang';
import { ThanhChon } from '@/components/ThanhChon';
import { BangChain } from './BangChain';

export const metadata: Metadata = { title: `${vi.bienThe.cTen} — ${vi.chung.tenSanPham}` };

/**
 * BIẾN THỂ C — dẫn bằng CHAIN NGƯỜI KHÁC ĐÃ ĐẺ.
 *
 * Đặt cược: bằng chứng thắng lời hứa. Người ta tin "đẻ được chain" khi thấy chain
 * có thật đang chạy, có chủ thật.
 *
 * 🔴 Điểm yếu phải nói thẳng, và nó là điểm yếu THẬT hôm nay: danh bạ đang có **2
 * L1** (OmegaChain + OwnerTest, cả hai của hệ thống). Bản này mạnh dần theo số
 * chain, nên chọn nó bây giờ là đặt cược vào tương lai — và màn phải chịu được
 * trạng thái vắng mà không trông như hỏng. Đó là lý do `BangChain` có trạng thái
 * rỗng viết như một LỜI MỜI ("bạn sẽ là người đầu tiên"), không phải một ô trống.
 */
export default function BienTheC() {
  return (
    <>
      <ThanhChon dang="c" />
      <section className="bg-navy">
        <div className="khung py-14 md:py-20">
          <Nhan kieu="canhBao">{vi.trangChu.nhanTestnet}</Nhan>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-extrabold leading-tight text-on-dark md:text-5xl">
            {vi.trangChu.cTieuDe}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-on-dark-2 md:text-lg">{vi.trangChu.cPhu}</p>
          <SoLieuMang tren="toi" />
        </div>
      </section>

      <section className="khung py-10 md:py-14">
        <BangChain />
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="/console/"
            className="inline-flex h-13 items-center justify-center rounded-btn-lg bg-gold px-6 text-base font-semibold text-navy shadow-cta hover:bg-gold-hover"
          >
            {vi.trangChu.nutChinh}
          </a>
          <a
            href="/faucet/"
            className="inline-flex h-13 items-center justify-center rounded-btn-lg border border-line-strong px-6 text-base font-semibold text-ink hover:bg-surface-alt"
          >
            {vi.trangChu.nutPhu}
          </a>
        </div>
      </section>
    </>
  );
}
