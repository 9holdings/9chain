import type { Metadata, Viewport } from 'next';
import { Sora, Instrument_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { LoadTestBanner } from '@/components/LoadTestBanner';
import { EarlyHints } from '@/components/EarlyHints';
import { TieuDeTheoNgonNgu } from '@/components/TieuDeTheoNgonNgu';
import { SiteFooter } from '@/components/SiteFooter';
import { ThemeScript } from '@/components/ThemeScript';
import { EN } from '@/lib/i18n/en';
import { NhaCungCapNgonNgu } from '@/lib/i18n';
import { BoQuaToiNoiDung } from '@/components/BoQuaToiNoiDung';
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
  applicationName: EN.common.productName,
  title: `${EN.common.productName} — ${EN.common.tagline}`,
  description: EN.home.subtitle,
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
    // 🔴 `en_US`, KHÔNG phải `vi_VN` (sửa 2026-09-03).
    // `og:locale` khai ngôn ngữ CỦA CHÍNH KHỐI METADATA NÀY, và mọi chuỗi quanh nó
    // đều lấy từ `EN.*` — nên `vi_VN` là trang tự khai sai về mình. Sót lại từ thời
    // site chỉ có tiếng Việt, và sống qua cả lượt lên 30 ngôn ngữ vì không cổng nào
    // đo QUAN HỆ giữa `og:locale` và thứ tiếng thật của metadata.
    //
    // ⚠️ Đây KHÔNG phải chỗ khai 30 ngôn ngữ. Với `output: 'export'` mỗi trang chỉ có
    // MỘT bản HTML, sinh lúc build, nên thẻ chia sẻ chỉ có thể mang một thứ tiếng —
    // và tiếng đó là tiếng Anh. Muốn thẻ chia sẻ đa ngôn ngữ thì phải có URL riêng
    // cho từng ngôn ngữ; đó là đổi kiến trúc, không phải đổi một dòng.
    locale: 'en_US',
    url: '/',
    siteName: EN.common.productName,
    title: `${EN.common.productName} — ${EN.common.tagline}`,
    description: EN.home.subtitle,
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
        alt: `${EN.common.productName} — chainId ${CHAIN.chainId}, ${CHAIN.kyHieu}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${EN.common.productName} — ${EN.common.tagline}`,
    description: EN.home.subtitle,
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
    // 🔴 `lang` là bắt buộc, không phải trang trí: trình đọc màn hình chọn giọng
    // theo thuộc tính này. Thiếu nó, hoặc để sai, thì cả trang bị đọc bằng ngữ âm
    // của một thứ tiếng khác.
    //
    // Giá trị ở ĐÂY là `en` vì với `output: 'export'` mỗi trang chỉ có MỘT bản HTML,
    // sinh lúc build, và mặc định của site là tiếng Anh. `NhaCungCapNgonNgu` ghi đè
    // cả `lang` lẫn `dir` trên `<html>` ngay sau khi hydrate xong, theo lựa chọn đã
    // lưu của người đọc. `suppressHydrationWarning` đã có sẵn ở đây (vốn cho theme)
    // nên việc ghi đè đó không đẻ ra cảnh báo lệch.
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <EarlyHints />
      </head>
      <body className={`${sora.variable} ${instrument.variable} ${jetbrains.variable} flex min-h-dvh flex-col`}>
        {/* 🔴 PROVIDER BỌC TOÀN BỘ <body>, KHÔNG BỌC TỪNG PHẦN.
            Nếu mỗi vùng tự nạp từ điển thì chúng đổi trạng thái ở những nhịp khác
            nhau, và người dùng thấy một trang NỬA ANH NỬA VIỆT trong vài khung
            hình. Cả cây phải lật cùng một lúc — xem `lib/i18n/index.tsx`. */}
        <NhaCungCapNgonNgu>
          {/* Đổi `<title>` theo ngôn ngữ đã chọn — `metadata` ở trên sinh lúc build
              nên nó VĨNH VIỄN tiếng Anh cho cả 30 bản. Không vẽ gì; phải nằm TRONG
              provider mới đọc được từ điển. Xem `lib/tieuDe.ts` cho cả phần thẻ chia
              sẻ mà cách này KHÔNG vá được. */}
          <TieuDeTheoNgonNgu />
          <BoQuaToiNoiDung />
          {/* 🔴 `ReGenesisBanner` ĐÃ GỠ `2026-09-03` — David chốt.
              Dải đó nói "A1 sẽ sinh lại ngày 01/09/2026, mọi thứ tạo trước đó sẽ bị
              xoá". Ngày G đã qua, nên câu đó nói ở thì tương lai về một việc **đã
              xảy ra rồi** — đúng thứ chú thích trong chính file đó dặn phải gỡ bằng
              tay khi qua ngày G (không có gì trong mã tự biết ngày G đã tới).
              Từ điển vẫn giữ `reGenesis.*` và `reGenesisXong.*`, và trang
              `/re-genesis/` vẫn sống + vẫn có liên kết ở chân trang: người mở ví
              thấy số dư 0 vẫn phải tìm được lời giải. Thứ bị gỡ là **dải trên mọi
              trang**, không phải lời giải thích.

              Dải bài bơm tải thì Ở LẠI: nó TỰ BIẾN MẤT khi bài bơm dừng — không
              phải việc tay; xem `components/LoadTestBanner.tsx`. */}
          <LoadTestBanner />
          <SiteHeader />
          <main id="noi-dung" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </NhaCungCapNgonNgu>
      </body>
    </html>
  );
}
