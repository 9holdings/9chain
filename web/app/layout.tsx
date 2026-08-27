import type { Metadata, Viewport } from 'next';
import { Sora, Instrument_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { ReGenesisBanner } from '@/components/ReGenesisBanner';
import { SiteFooter } from '@/components/SiteFooter';
import { ThemeScript } from '@/components/ThemeScript';
import { vi } from '@/lib/i18n/vi';
import { CHAIN } from '@/lib/chain';

// Cùng ba font và cùng tên biến với 9Scan-A1 — `tokens.css` trỏ vào
// `--font-sora/--font-instrument/--font-jetbrains`, đổi tên ở đây là chữ rơi hết về
// font hệ thống mà không có lỗi nào báo.
// 🔴 ĐÃ ĐO 2026-08-27, ĐỪNG THỬ LẠI: `subsets: ['latin','vietnamese']` KHÔNG chạy.
// `next/font` báo thẳng: "Unknown subset `vietnamese` for font `Sora` / `Instrument
// Sans`. Available subsets: `latin`, `latin-ext`". Hai bộ chữ này KHÔNG CÓ bản tiếng
// Việt trên Google Fonts — đây không phải lỗi khai thiếu, mà là bộ chữ không phủ.
//
// Hệ quả đang chạy thật: `latin-ext` phủ 1e00–1e9f và 1ef2–1eff nhưng HỤT 1ea0–1ef1,
// đúng dải chứa ạ ả ấ ầ ậ ắ ẻ ế ề ệ ị ọ ố ồ ộ ớ ờ ợ ụ ứ ừ ự. Trình duyệt thay từng ký
// tự một ⇒ chữ LẪN FONT NGAY GIỮA MỘT TỪ, trên mọi tiêu đề của mọi trang.
// Chỉ JetBrains Mono có dải này (đo bằng: grep 1ea0 trong CSS đã xuất).
//
// ⇒ Vá được thì phải ĐỔI BỘ CHỮ, mà ba font này dùng chung với 9Scan-A1 (xem chú
// thích dưới) nên đó là quyết định thương hiệu hai dự án, không sửa một mình ở đây.
const sora = Sora({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-sora', display: 'swap' });
const instrument = Instrument_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-instrument', display: 'swap' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetbrains', display: 'swap' });

export const metadata: Metadata = {
  // Phải đi CÙNG LÚC với cửa trước ở Caddy, không được đi trước: thẻ này đẻ ra
  // `<link rel="canonical">` THẬT trong HTML đã xuất, nên trỏ nó vào một tên miền
  // chưa phục vụ là ghi một điều sai vào sản phẩm đang chạy.
  metadataBase: new URL('https://a1.9chain.org'),
  applicationName: vi.chung.tenSanPham,
  title: `${vi.chung.tenSanPham} — ${vi.chung.tagTitle}`,
  description: vi.trangChu.cPhu,
  alternates: { canonical: '/' },
  // Trước đây trang KHÔNG có favicon nào. Dùng luôn dấu LOVE9 David đưa.
  // Đường dẫn tuyệt đối theo gốc site — `/brand/*` có route riêng trong Caddy.
  icons: {
    icon: [
      { url: '/brand/love9-navy-inverse-32px.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/love9-navy-inverse.svg', type: 'image/svg+xml' },
    ],
    apple: '/brand/love9-navy-inverse-256px.png',
  },
  // 🔴 MANIFEST NẰM TRONG `/brand/`, KHÔNG Ở GỐC — CÓ CHỦ Ý.
  // Gốc `/` là Blockscout, nên mọi tệp đặt ở gốc `public/` đều cần MỘT DÒNG RIÊNG
  // trong Caddyfile, và quên dòng đó là 404 câm. `/brand/*` đã có route sẵn ⇒
  // đặt manifest ở đây là không phải đụng vào hạ tầng. `scope` và `start_url`
  // khai tường minh `/` vì mặc định chúng sẽ ăn theo THƯ MỤC CHỨA manifest.
  // (`robots.txt` và `sitemap.xml` thì buộc ở gốc theo chuẩn — hai tệp đó ĐÃ được
  //  thêm vào `@trangmoi` trong Caddyfile.)
  manifest: '/brand/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/',
    siteName: vi.chung.tenSanPham,
    title: `${vi.chung.tenSanPham} — ${vi.chung.tagTitle}`,
    description: vi.trangChu.cPhu,
    // 🔴 PHẢI LÀ PNG THẬT. Telegram, X, Zalo và Facebook đều KHÔNG render SVG
    // trong thẻ preview — khai SVG ở đây là thẻ chia sẻ trống trơn, và không có
    // lỗi nào báo. Ảnh sinh bằng `node web/scripts/gen-og.mjs` (chainId đọc
    // thẳng từ `lib/chain.ts` nên không có con số chép tay nào nằm lại).
    images: [
      {
        url: '/brand/og-9chain-a1.png',
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: `${vi.chung.tenSanPham} — chainId ${CHAIN.chainId}, ${CHAIN.kyHieu}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${vi.chung.tenSanPham} — ${vi.chung.tagTitle}`,
    description: vi.trangChu.cPhu,
    images: ['/brand/og-9chain-a1.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#0D1733',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // `lang="vi"` là bắt buộc, không phải trang trí: trình đọc màn hình chọn giọng
    // theo thuộc tính này. Thiếu nó thì tiếng Việt bị đọc bằng ngữ âm tiếng Anh.
    <html lang="vi" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${sora.variable} ${instrument.variable} ${jetbrains.variable} flex min-h-dvh flex-col`}>
        {/* Liên kết bỏ qua điều hướng — thứ đầu tiên nhận tiêu điểm khi bấm Tab.
            Ẩn cho tới khi được focus. Người đi bằng bàn phím không phải đi qua cả
            thanh nav ở mỗi trang. */}
        <a
          href="#noi-dung"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-btn focus:bg-gold focus:px-4 focus:py-2 focus:font-semibold focus:text-navy"
        >
          {vi.chung.boQuaToiNoiDung}
        </a>
        {/* Dải cảnh báo đứng SAU lối tắt bàn phím, TRƯỚC header: người đi bàn phím
            vẫn nhảy thẳng được vào nội dung, còn người đọc bằng mắt thì thấy nó
            trước mọi thứ khác. Gỡ dải này sau ngày G — xem chú thích trong file. */}
        <ReGenesisBanner />
        <SiteHeader />
        <main id="noi-dung" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
