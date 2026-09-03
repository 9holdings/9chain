'use client';

import { Nhan } from '@/components/ui';
import { NetworkStats } from '@/components/NetworkStats';
import { ChainTable } from './ChainTable';
import { useT } from '@/lib/i18n';

/**
 * Thân trang chủ — tách khỏi `page.tsx` vì `page.tsx` phải là server component
 * (`export const metadata` chỉ hợp lệ ở đó), mà server component chạy lúc BUILD nên
 * không biết người đọc chọn ngôn ngữ nào. Xem `components/DauTrang.tsx`.
 */
export function NoiDungTrangChu() {
  const t = useT();
  return (
    <>
      <section className="bg-navy">
        <div className="khung py-14 md:py-20">
          <Nhan kieu="canhBao">{t.trangChu.nhanTestnet}</Nhan>
          {/* Dòng dẫn: chữ "A1" trong <h1> phải có nghĩa TRƯỚC khi được dùng.
              `moTaNgan` là chuỗi đã có sẵn và đã duyệt — không sinh chuỗi mới. */}
          <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-on-dark-2">
            {t.chung.moTaNgan}
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-3xl font-extrabold leading-tight text-on-dark md:text-5xl">
            {t.trangChu.cTieuDe}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-on-dark-2 md:text-lg">{t.trangChu.cPhu}</p>
          <NetworkStats tren="toi" />
          {/* 🔴 HAI DÒNG NÀY ĐỨNG NGAY DƯỚI SỐ LIỆU, CÓ CHỦ Ý (Đ1-4).
              Đặt chúng ở chân trang hay trang riêng là để con số tiếp tục đứng một
              mình ở chỗ người ta thật sự đọc. Lời giải "block đứng yên là bình
              thường" vốn ĐÃ TỒN TẠI trong dự án — nhưng chỉ nằm trong chú thích mã
              (`MyChainsScreen.tsx`), tức đúng chỗ người dùng không bao giờ tới. */}
          <div className="mt-6 flex max-w-2xl flex-col gap-2 border-s-2 border-line-dark ps-4 text-sm text-on-dark-2">
            <p>{t.trangChu.tuTo}</p>
            <p>{t.trangChu.blockDungYen}</p>
          </div>
        </div>
      </section>

      <section className="khung py-10 md:py-14">
        <ChainTable />
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="/create-chain/"
            className="inline-flex h-13 items-center justify-center rounded-btn-lg bg-gold px-6 text-base font-semibold text-navy shadow-cta hover:bg-gold-hover"
          >
            {t.trangChu.nutChinh}
          </a>
          <a
            href="/faucet/"
            className="inline-flex h-13 items-center justify-center rounded-btn-lg border border-line-strong px-6 text-base font-semibold text-ink hover:bg-surface-alt"
          >
            {t.trangChu.nutPhu}
          </a>
        </div>
      </section>
    </>
  );
}
