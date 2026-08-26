import { vi } from '@/lib/i18n/vi';
import { Nhan } from '@/components/ui';
import { NetworkStats } from '@/components/NetworkStats';
import { ChainTable } from './ChainTable';

/**
 * TRANG CHỦ — **David chọn bản C ngày 2026-08-26** (M10.3, U-3).
 *
 * Cách dẫn: **bằng chứng trước, lời mời sau**. Cho thấy L1 có thật đang chạy, có chủ
 * thật, rồi mới mời người ta đẻ chain của mình. Hai bản còn lại (A — dẫn bằng lời
 * hứa; B — đặt thẳng ô đặt tên lên trang chủ) đã gỡ cùng thanh chọn biến thể; lịch
 * sử nằm trong git nếu cần đọc lại.
 *
 * 🔴 **Điểm yếu đã biết của bản này, ghi ra để đừng ai ngạc nhiên:** nó mạnh dần
 * theo số chain trong danh bạ, mà hôm nay danh bạ đang **vắng** (2 L1, cả hai của hệ
 * thống). Vì vậy `ChainTable` có trạng thái rỗng viết như một **lời mời** ("bạn sẽ là
 * người đầu tiên"), không phải một ô trống — chọn bản C là đặt cược vào việc danh bạ
 * sẽ đầy lên, và màn phải chịu được quãng chờ đó mà không trông như hỏng.
 */
export default function TrangChu() {
  return (
    <>
      <section className="bg-navy">
        <div className="khung py-14 md:py-20">
          <Nhan kieu="canhBao">{vi.trangChu.nhanTestnet}</Nhan>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-extrabold leading-tight text-on-dark md:text-5xl">
            {vi.trangChu.cTieuDe}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-on-dark-2 md:text-lg">{vi.trangChu.cPhu}</p>
          <NetworkStats tren="toi" />
        </div>
      </section>

      <section className="khung py-10 md:py-14">
        <ChainTable />
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="/create-chain/"
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
