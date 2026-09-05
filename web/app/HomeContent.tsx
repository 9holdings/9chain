'use client';

import { Badge } from '@/components/ui';
import { NetworkStats } from '@/components/NetworkStats';
import { CeremonyCallout } from '@/components/CeremonyCallout';
import { SlotsLeft } from '@/components/SlotsLeft';
import { ChainTable } from './ChainTable';
import { useT } from '@/lib/i18n';

/**
 * The home page body — split out of `page.tsx` because `page.tsx` has to be a server
 * component (`export const metadata` is only valid there), and a server component runs
 * at BUILD time so it cannot know which language the reader picked. See
 * `components/PageHeader.tsx`.
 */
export function HomeContent() {
  const t = useT();
  return (
    <>
      <section className="bg-navy">
        <div className="khung py-14 md:py-20">
          <Badge tone="warn">{t.home.testnetBadge}</Badge>
          {/* Lead line: the string "A1" in the `<h1>` has to mean something BEFORE it
              is used. `shortDesc` is an existing, already-reviewed string — do not
              invent a new one. */}
          <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-on-dark-2">
            {t.common.shortDesc}
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-3xl font-extrabold leading-tight text-on-dark md:text-5xl">
            {t.home.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-on-dark-2 md:text-lg">{t.home.subtitle}</p>
          <NetworkStats on="dark" />
          {/* 🔴 THESE TWO LINES SIT DIRECTLY UNDER THE NUMBERS, ON PURPOSE (Đ1-4).
              Putting them in the footer or on a page of their own is how the numbers
              go back to standing alone in the place people actually read. The
              explanation "a block height that stays still is normal" ALREADY EXISTED
              in this project — but only inside a code comment
              (`MyChainsScreen.tsx`), which is precisely where no user ever goes. */}
          <div className="mt-6 flex max-w-2xl flex-col gap-2 border-s-2 border-line-dark ps-4 text-sm text-on-dark-2">
            <p>{t.home.disclosure}</p>
            <p>{t.home.idleBlocksNote}</p>
          </div>
          {/* Time-limited by construction: it removes itself once the ceremony's record is
              published. See the comment in the component for why nothing here waits on a
              human to remember. */}
          <CeremonyCallout />
        </div>
      </section>

      <section className="khung py-10 md:py-14">
        <ChainTable />
        {/* The ceiling next to the button that spends one. Before this, a visitor learned
            how many permanent slots were left only AFTER connecting a wallet and signing. */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <SlotsLeft />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/create-chain/"
            className="inline-flex h-13 items-center justify-center rounded-btn-lg bg-gold px-6 text-base font-semibold text-navy shadow-cta hover:bg-gold-hover"
          >
            {t.home.primaryCta}
          </a>
          <a
            href="/faucet/"
            className="inline-flex h-13 items-center justify-center rounded-btn-lg border border-line-strong px-6 text-base font-semibold text-ink hover:bg-surface-alt"
          >
            {t.home.secondaryCta}
          </a>
        </div>
      </section>
    </>
  );
}
