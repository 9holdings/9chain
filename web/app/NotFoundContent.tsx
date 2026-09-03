'use client';

import { useT } from '@/lib/i18n';

/** Thân trang 404 — tách khỏi `not-found.tsx` (server, giữ `metadata` + `noindex`). */
export function NotFoundContent() {
  const t = useT().notFound;
  return (
    <div className="khung flex min-h-[60vh] flex-col justify-center py-14 md:py-20">
      <div className="max-w-xl">
        <p className="font-mono text-sm font-bold tracking-[0.18em] text-muted">{t.code}</p>
        <h1 className="mt-3 font-display text-2xl font-extrabold text-ink md:text-3xl">{t.title}</h1>
        <p className="mt-4 text-base text-body">{t.desc}</p>
        <p className="mt-2 text-base text-body">{t.lookingForTx}</p>

        <p className="mt-8 text-sm font-semibold text-muted">{t.topPagesTitle}</p>
        <nav aria-label={t.navLabel} className="mt-3 flex flex-wrap gap-3">
          <a
            href="/"
            className="tap-target inline-flex items-center rounded-[10px] bg-gold px-4 py-2.5 font-semibold text-navy transition-colors hover:bg-gold-hover"
          >
            {t.goHome}
          </a>
          <a
            href="/faucet/"
            className="tap-target inline-flex items-center rounded-[10px] border border-line px-4 py-2.5 font-semibold text-ink transition-colors hover:border-gold"
          >
            {t.goFaucet}
          </a>
          <a
            href="/create-chain/"
            className="tap-target inline-flex items-center rounded-[10px] border border-line px-4 py-2.5 font-semibold text-ink transition-colors hover:border-gold"
          >
            {t.goLaunch}
          </a>
        </nav>
      </div>
    </div>
  );
}
