'use client';

import { useT } from '@/lib/i18n';
import { CHAIN, explorerGoc } from '@/lib/chain';
import { BrandLockup } from './BrandLockup';

/**
 * Chân trang (Đ1-13, 2026-08-27).
 *
 * Bản trước có **0 liên kết** — chỉ logo + hai dòng chữ. Mọi đường đi của site nằm
 * hết ở thanh điều hướng trên cùng, nên người đọc tới cuối trang là tới ngõ cụt.
 *
 * 🔴 CHỈ ĐẶT LIÊN KẾT ĐÃ ĐO LÀ SỐNG. Đo `27/08`:
 *     https://a1.9scan.org      → 200
 *     https://9chain.org/       → 200
 *     https://9chain.org/docs/  → 404  ⇒ CỐ Ý không có mục tài liệu ở đây
 * Một chân trang đầy liên kết hỏng tệ hơn một chân trang rỗng: nó hứa rồi nuốt lời
 * ngay tại chỗ. (Trang chủ 9Scan-A1 hiện đang có đúng hai liên kết chết vào
 * `/docs/` — đã báo họ, không chép sang đây.)
 *
 * ⚠️ Mục "liên hệ / báo lỗi" CỐ Ý chưa có — kênh thật là câu hỏi **D2** David chưa
 * trả lời. Bịa một địa chỉ để chân trang trông đầy đủ là thứ tệ nhất ở đây: người ta
 * sẽ viết vào đó và không ai đọc.
 *
 * 🔴 `/re-genesis/` NẰM Ở ĐÂY LÀ CÓ CHỦ Ý, không phải cho đủ chỗ. Hôm nay nó có ĐÚNG
 * MỘT đường vào — dải banner — mà dải đó **được lên lịch gỡ vào ngày G**. Gỡ xong là
 * trang cảnh báo mất luôn đường vào cuối cùng, đúng lúc người ta cần đọc lại nó nhất.
 */

/** Một liên kết ngoài: luôn `rel` an toàn, và nói cho trình đọc màn hình biết nó mở tab mới. */
function NgoaiTrang({ href, children }: { href: string; children: React.ReactNode }) {
  const t = useT();
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-ink hover:underline">
      {children}
      <span className="sr-only"> {t.chanTrang.moTabMoi}</span>
    </a>
  );
}

export function SiteFooter() {
  const t = useT();
  const cot = [
    {
      tieuDe: t.chanTrang.dungThu,
      muc: [
        { href: '/faucet/', nhan: t.dieuHuong.faucet },
        { href: '/create-chain/', nhan: t.dieuHuong.console },
        { href: '/my-chains/', nhan: t.dieuHuong.chainCuaToi },
      ],
    },
    {
      tieuDe: t.chanTrang.kham,
      muc: [
        { href: '/chains/', nhan: t.dieuHuong.danhBa },
        { href: '/compare/', nhan: t.dieuHuong.bang },
        { href: explorerGoc(), nhan: t.chanTrang.explorer, ngoai: true },
      ],
    },
    {
      tieuDe: t.chanTrang.veDuAn,
      muc: [
        { href: 'https://9chain.org/', nhan: t.chanTrang.trangChinh, ngoai: true },
        { href: '/re-genesis/', nhan: t.chanTrang.reGenesis },
      ],
    },
  ];

  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="khung py-10 text-sm text-body-2">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="flex flex-col gap-3">
            {/* Chân trang dùng `bg-surface` — nền ĐỔI theo theme (trắng ở bản sáng,
                #131c33 ở bản tối) ⇒ logo phải đổi theo, nên `nen="theo-theme"`.
                Khác header: header luôn navy nên luôn dùng bản nền tối. */}
            <BrandLockup nen="theo-theme" cao={26} nhan={t.chung.tenSanPham} />
            <p className="max-w-xs">{t.chung.moTaNgan}</p>
          </div>

          <nav aria-label={t.chanTrang.nhanNav} className="grid grid-cols-2 gap-x-10 gap-y-7 sm:grid-cols-3">
            {cot.map((c) => (
              <div key={c.tieuDe} className="flex flex-col gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted">{c.tieuDe}</h2>
                <ul className="flex flex-col gap-2">
                  {c.muc.map((m) => (
                    <li key={m.href}>
                      {'ngoai' in m && m.ngoai ? (
                        <NgoaiTrang href={m.href}>{m.nhan}</NgoaiTrang>
                      ) : (
                        <a href={m.href} className="hover:text-ink hover:underline">
                          {m.nhan}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <p className="mt-8 border-t border-line pt-5 font-mono text-xs text-muted">
          Chain ID {CHAIN.chainId} · {CHAIN.kyHieu} · networkID {CHAIN.networkId}
        </p>
      </div>
    </footer>
  );
}
