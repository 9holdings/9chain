import type { Metadata, Viewport } from 'next';
import { Sora, Instrument_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { LoadTestBanner } from '@/components/LoadTestBanner';
import { EarlyHints } from '@/components/EarlyHints';
import { LocalisedTitle } from '@/components/LocalisedTitle';
import { SiteFooter } from '@/components/SiteFooter';
import { ThemeScript } from '@/components/ThemeScript';
import { EN } from '@/lib/i18n/en';
import { LanguageProvider } from '@/lib/i18n';
import { SkipToContent } from '@/components/SkipToContent';
import { CHAIN } from '@/lib/chain';

// The same three fonts and the same variable names as 9Scan-A1 — `tokens.css` points at
// `--font-sora/--font-instrument/--font-jetbrains`, and renaming them here drops all the
// text back to system fonts with no error reported anywhere.
// 🔴 MEASURED 2026-08-27, DO NOT TRY AGAIN: `subsets: ['latin','vietnamese']` does NOT work.
// `next/font` says so outright: "Unknown subset `vietnamese` for font `Sora` / `Instrument
// Sans`. Available subsets: `latin`, `latin-ext`". These two typefaces simply HAVE no
// Vietnamese cut on Google Fonts — this is not a missing declaration, it is a font that does not cover it.
//
// What that does live today: `latin-ext` covers 1e00–1e9f and 1ef2–1eff but MISSES 1ea0–1ef1,
// exactly the range holding ạ ả ấ ầ ậ ắ ẻ ế ề ệ ị ọ ố ồ ộ ớ ờ ợ ụ ứ ừ ự. The browser
// substitutes character by character ⇒ the FONT CHANGES MID-WORD, on every heading of every page.
// Only JetBrains Mono carries that range (measured by grepping 1ea0 in the exported CSS).
//
// ⇒ Fixing it means CHANGING THE TYPEFACE, and these three fonts are shared with 9Scan-A1
// (see the comment below), so that is a two-project brand decision, not something to change here alone.
const sora = Sora({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-sora', display: 'swap' });
const instrument = Instrument_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-instrument', display: 'swap' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetbrains', display: 'swap' });

export const metadata: Metadata = {
  // This must ship AT THE SAME TIME as the Caddy front door, never before: this tag emits a
  // REAL `<link rel="canonical">` into the exported HTML, so pointing it at a domain that is
  // not being served yet writes a falsehood into the live product.
  metadataBase: new URL('https://a1.9chain.org'),
  applicationName: EN.common.productName,
  title: `${EN.common.productName} — ${EN.common.tagline}`,
  description: EN.home.subtitle,
  alternates: { canonical: '/' },
  // The site previously had no favicon at all. Use the LOVE9 mark David supplied.
  // Absolute path from the site root — `/brand/*` has its own route in Caddy.
  icons: {
    icon: [
      { url: '/brand/love9-navy-inverse-32px.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/love9-navy-inverse.svg', type: 'image/svg+xml' },
    ],
    apple: '/brand/love9-navy-inverse-256px.png',
  },
  // 🔴 THE MANIFEST LIVES IN `/brand/`, NOT AT THE ROOT — DELIBERATELY.
  // The root `/` is Blockscout, so every file placed at the root of `public/` needs ITS OWN
  // LINE in the Caddyfile, and forgetting that line is a silent 404. `/brand/*` already has
  // a route ⇒ putting the manifest here means not touching infrastructure. `scope` and
  // `start_url` state `/` explicitly, because by default they would inherit THE FOLDER THE
  // MANIFEST IS IN. (`robots.txt` and `sitemap.xml` must be at the root by standard — both
  //  have been added to `@trangmoi` in the Caddyfile.)
  manifest: '/brand/manifest.webmanifest',
  openGraph: {
    type: 'website',
    // 🔴 `en_US`, NOT `vi_VN` (fixed 2026-09-03).
    // `og:locale` declares the language OF THIS METADATA BLOCK ITSELF, and every string around
    // it comes from `EN.*` — so `vi_VN` was the page making a false statement about itself. A
    // leftover from when the site was Vietnamese only, and it survived the whole move to 30
    // languages because no gate measured the RELATIONSHIP between `og:locale` and the actual language of the metadata.
    //
    // ⚠️ This is NOT where the 30 languages are declared. With `output: 'export'` each page has
    // exactly ONE HTML file, generated at build time, so the share card can only carry one
    // language — and that language is English. Multilingual share cards would need a separate
    // URL per language; that is an architectural change, not a one-line one.
    locale: 'en_US',
    url: '/',
    siteName: EN.common.productName,
    title: `${EN.common.productName} — ${EN.common.tagline}`,
    description: EN.home.subtitle,
    // 🔴 MUST BE A REAL PNG. Telegram, X, Zalo and Facebook all refuse to render SVG in a
    // preview card — declaring an SVG here means an empty share card, and no error is
    // reported. The image is generated by `node web/scripts/gen-og.mjs` (the chainId is read
    // straight from `lib/chain.ts`, so no hand-copied number is left behind).
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
    // 🔴 `lang` is required, not decoration: screen readers pick their voice from this
    // attribute. Missing it, or getting it wrong, has the whole page read out in the
    // phonetics of another language.
    //
    // The value HERE is `en` because with `output: 'export'` each page has exactly ONE HTML
    // file, generated at build time, and the site default is English. `LanguageProvider`
    // overrides both `lang` and `dir` on `<html>` as soon as hydration finishes, following the
    // reader's saved choice. `suppressHydrationWarning` was already here (originally for the
    // theme), so that override does not produce a mismatch warning.
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <EarlyHints />
      </head>
      <body className={`${sora.variable} ${instrument.variable} ${jetbrains.variable} flex min-h-dvh flex-col`}>
        {/* 🔴 THE PROVIDER WRAPS THE WHOLE <body>, NOT INDIVIDUAL SECTIONS.
            If each region loaded its own dictionary they would change state on different
            beats, and the user would see a page that is HALF ENGLISH, HALF VIETNAMESE for a
            few frames. The whole tree must flip at once — see `lib/i18n/index.tsx`. */}
        <LanguageProvider>
          {/* Changes `<title>` to follow the chosen language — the `metadata` above is
              generated at build time, so it is PERMANENTLY English for all 30. Renders
              nothing; must sit INSIDE the provider to read the dictionary. See
              `lib/pageTitle.ts` for the share-card half that this approach CANNOT fix. */}
          <LocalisedTitle />
          <SkipToContent />
          {/* 🔴 `ReGenesisBanner` WAS REMOVED ON `2026-09-03` — David's decision.
              That strip said "A1 will be rebuilt on 2026-09-01, everything created before
              then will be erased". G-day has passed, so the sentence spoke in the future
              tense about something that **has already happened** — exactly what the comment
              in that file said to remove by hand once G-day arrived (nothing in the code
              knows on its own that G-day is past).
              The dictionary still holds `reGenesis.*` and `reGenesisXong.*`, and the
              `/re-genesis/` page is still live and still linked in the footer: someone who
              opens their wallet and sees a zero balance still has to be able to find the
              explanation. What was removed is the **strip on every page**, not the explanation.

              The load-test strip STAYS: it disappears BY ITSELF when the load test stops —
              no manual step; see `components/LoadTestBanner.tsx`. */}
          <LoadTestBanner />
          <SiteHeader />
          {/* `scroll-mt-20`: the header is `sticky top-0` and ~65px tall, so following the skip
              link landed the start of the content UNDERNEATH it — the one link whose entire job is
              to put the reader at the top of the content. Costs nothing on any other screen. */}
          <main id="noi-dung" className="flex-1 scroll-mt-20">
            {children}
          </main>
          <SiteFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}
