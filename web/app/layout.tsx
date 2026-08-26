import type { Metadata, Viewport } from 'next';
import { Sora, Instrument_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { ThemeScript } from '@/components/ThemeScript';
import { vi } from '@/lib/i18n/vi';

// Cùng ba font và cùng tên biến với 9Scan-A1 — `tokens.css` trỏ vào
// `--font-sora/--font-instrument/--font-jetbrains`, đổi tên ở đây là chữ rơi hết về
// font hệ thống mà không có lỗi nào báo.
const sora = Sora({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-sora', display: 'swap' });
const instrument = Instrument_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-instrument', display: 'swap' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetbrains', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://testnet-a1.9chain.org'),
  applicationName: vi.chung.tenSanPham,
  title: `${vi.chung.tenSanPham} — ${vi.chung.moTaNgan}`,
  description: vi.trangChu.cPhu,
  alternates: { canonical: '/' },
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
        <SiteHeader />
        <main id="noi-dung" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
