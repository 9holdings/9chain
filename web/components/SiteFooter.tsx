'use client';

import { useT } from '@/lib/i18n';
import { CHAIN, explorerOrigin } from '@/lib/chain';
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
      <span className="sr-only"> {t.footer.opensNewTab}</span>
    </a>
  );
}

export function SiteFooter() {
  const t = useT();
  const cot = [
    {
      title: t.footer.tryIt,
      items: [
        { href: '/faucet/', label: t.nav.faucet },
        { href: '/create-chain/', label: t.nav.launch },
        { href: '/my-chains/', label: t.nav.myChains },
      ],
    },
    {
      title: t.footer.explore,
      items: [
        { href: '/chains/', label: t.nav.directory },
        { href: '/compare/', label: t.nav.compare },
        { href: explorerOrigin(), label: t.footer.explorer, external: true },
      ],
    },
    {
      title: t.footer.about,
      items: [
        { href: 'https://9chain.org/', label: t.footer.mainSite, external: true },
        { href: '/re-genesis/', label: t.footer.rebuildPlan },
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
            {/* 26 → 34 cùng lượt với header (`2026-09-03`) — giữ nguyên nếp cũ là
                chân trang nhỏ hơn header một bậc, chứ không phóng to riêng một chỗ. */}
            <BrandLockup background="theo-theme" height={34} label={t.common.productName} />
            <p className="max-w-xs">{t.common.shortDesc}</p>
          </div>

          <nav aria-label={t.footer.navLabel} className="grid grid-cols-2 gap-x-10 gap-y-7 sm:grid-cols-3">
            {cot.map((c) => (
              <div key={c.title} className="flex flex-col gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted">{c.title}</h2>
                <ul className="flex flex-col gap-2">
                  {c.items.map((m) => (
                    <li key={m.href}>
                      {'ngoai' in m && m.external ? (
                        <NgoaiTrang href={m.href}>{m.label}</NgoaiTrang>
                      ) : (
                        <a href={m.href} className="hover:text-ink hover:underline">
                          {m.label}
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
