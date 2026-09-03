'use client';

import { Note } from '@/components/ui';
import { CHAIN } from '@/lib/chain';
import { interpolate, useT } from '@/lib/i18n';

/**
 * The re-genesis page body — split out of `page.tsx` (a server component, which keeps `metadata`).
 * Full reasoning: `components/PageHeader.tsx`.
 *
 * 🔴 SWITCHED FROM THE FUTURE-TENSE BLOCK TO THE PAST-TENSE ONE ON `2026-09-04`.
 * G-day ran on `2026-09-01`. For three days after it, this page still said *"A1 is being rebuilt
 * on 2026-09-01"* — the future tense about something that had already happened — to a reader who
 * had just opened their wallet and found a zero balance. Nothing in the code knows on its own
 * that G-day has passed; the switch is a manual step, and `check-links.mjs` under
 * `A1_SAU_NGAY_G=1` is the measurement that says whether it has been done. It was red.
 *
 * The page now reads `t.rebuildDone.*`. That block was written and voice-approved in advance
 * (0 `[?]` marks in all 30 dictionaries), so nothing here is newly authored prose.
 *
 * 🔴 THE FUTURE-TENSE `rebuild` BLOCK IS DELIBERATELY KEPT, not deleted. This network will be
 * rebuilt again, and that text is already approved in 30 languages; deleting it means writing it
 * again under time pressure. `rebuild.date` is also still the single source for the date shown
 * here — `rebuildDone` has no `date` key of its own, by design, so the two can never disagree
 * about which day it was.
 *
 * 🔴 Every comment about WHY each sentence is worded as it is lives in the `rebuildDone` block in
 * `lib/i18n/dicts/vi.ts` and `lib/i18n/en.ts`. Read there before editing the words.
 */
function Item({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-extrabold text-ink md:text-2xl">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-base text-body">{children}</div>
    </section>
  );
}

export function RebuildContent() {
  const t = useT();
  const ngay = t.rebuild.date;

  // The archive section only exists once both values are real. That was the plan from the day
  // this block was written: G-day should be "paste two values", never "write prose in a hurry".
  // 🔴 Showing the heading with an empty URL would be worse than showing nothing — it would
  // promise a published hash that a reader then cannot find, on the one page whose entire job is
  // to be believed about something that cannot be undone.
  const coBanLuu = Boolean(t.rebuildDone.archiveUrl && t.rebuildDone.archiveSha256);

  return (
    <div className="khung max-w-3xl py-10 md:py-14">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-ink md:text-3xl">
          {interpolate(t.rebuildDone.title, { date: ngay })}
        </h1>
        <p className="mt-3 text-base text-body">{t.rebuildDone.desc}</p>
      </header>

      {/* 🔴 "WHAT YOU WILL SEE" COMES BEFORE "WHAT TO DO", and that order is the whole point of a
          past-tense announcement. A reader arrives here already confused — the balance is zero and
          the wallet says nothing is wrong. Explaining the symptom first is what lets them trust
          the instructions that follow; the future-tense version had the opposite order because it
          was warning about something that had not happened yet. `desc` says as much in its own
          words: "explains what you are seeing and what to do". */}
      <Item title={t.rebuildDone.willSeeTitle}>
        <ul className="flex list-disc flex-col gap-2 ps-5">
          <li>{interpolate(t.rebuildDone.willSee1, { chainId: CHAIN.chainId })}</li>
          <li>{t.rebuildDone.willSee2}</li>
          <li>{t.rebuildDone.willSee3}</li>
        </ul>
      </Item>

      <Item title={t.rebuildDone.toDoTitle}>
        <ul className="flex list-disc flex-col gap-2 ps-5">
          <li>{t.rebuildDone.toDo1}</li>
          <li>{t.rebuildDone.toDo2}</li>
          <li>{t.rebuildDone.toDo3}</li>
        </ul>
        {/* 🔴 A WAY THROUGH, NOT A WALLET BUTTON (Đ1-13, 2026-08-27).
            Measured `27/08`: this page says the word "faucet" **13 times** while its body had
            **0 `href`s** — the only two `/faucet/` links in the HTML belonged to the nav bar. The
            page told people to go and do something and then gave them no directions. It matters
            more now, not less: every instruction above is an action on another screen.
            ⚠️ DELIBERATELY only `<a>` tags; the "Add network to wallet" button is NOT copied here.
            The existing rule stands: this is a READING page, and every wallet-invoking action
            belongs on a screen that has the error handling for it. */}
        <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-base">
          <a href="/faucet/" className="font-semibold text-ink underline underline-offset-4 hover:text-gold-ink">
            {t.nav.faucet}
          </a>
          <a href="/create-chain/" className="font-semibold text-ink underline underline-offset-4 hover:text-gold-ink">
            {t.nav.launch}
          </a>
          <a href="/my-chains/" className="font-semibold text-ink underline underline-offset-4 hover:text-gold-ink">
            {t.nav.myChains}
          </a>
        </p>
      </Item>

      {coBanLuu ? (
        <Item title={t.rebuildDone.archiveTitle}>
          <p>{t.rebuildDone.archiveDesc}</p>
          <p className="flex flex-col gap-1 break-all font-mono text-sm">
            <a
              href={t.rebuildDone.archiveUrl}
              className="font-semibold text-ink underline underline-offset-4 hover:text-gold-ink"
            >
              {t.rebuildDone.archiveUrl}
            </a>
            <span className="text-body-2">sha256 {t.rebuildDone.archiveSha256}</span>
          </p>
        </Item>
      ) : null}

      {/* 🔴 NO CLOSING RESTATEMENT. The first draft ended with a `Note` carrying `title` + `banner`,
          which put the sentence "A1 was rebuilt on 2026-09-01" on the page THREE times — as the
          `<h1>`, as a bold heading, and again inside the note — while `banner` says roughly what
          `desc` already says two lines under the `<h1>`. Repetition on a page about losing assets
          does not make it more believed; it makes it read as filler and gets skimmed.
          `banner`, `bannerLink` and `badge` therefore have no reader: they belonged to the
          site-wide strip removed on 2026-09-03. They stay in the dictionary because the strip is
          the obvious thing to bring back for the next rebuild, and re-approving that text in 30
          languages is the expensive half. */}
    </div>
  );
}
