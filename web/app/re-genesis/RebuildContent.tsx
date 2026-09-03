'use client';

import { Note } from '@/components/ui';
import { CHAIN } from '@/lib/chain';
import { interpolate, useT } from '@/lib/i18n';

/**
 * The re-genesis page body — split out of `page.tsx` (a server component, which keeps `metadata`).
 * Full reasoning: `components/PageHeader.tsx`.
 *
 * 🔴 Every comment about WHY each sentence is worded as it is lives in the `reGenesis` block in
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

  return (
    <div className="khung max-w-3xl py-10 md:py-14">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-ink md:text-3xl">
          {interpolate(t.rebuild.title, { date: ngay })}
        </h1>
        <p className="mt-3 text-base text-body">{t.rebuild.desc}</p>
      </header>

      {/* 🔴 BEFORE EVERYTHING ELSE, INCLUDING THE "why" (D-081, 2026-08-27).
          The public network HAS already been reborn once TODAY, before G-day. The warning about
          01/09 below is still correct and still needed — there will be one more — but anyone who
          held tokens before today and comes back sees a zero balance while the page talks only
          about the future. They will conclude their wallet is broken.
          ⚠️ This morning's baseline proves NO user chain was lost. The faucet has NO durable
          ledger (only an in-memory `Map`), so it CANNOT prove nobody lost tokens — which is why
          the wording says "if you held tokens before then", not "nobody lost anything". */}
      <div className="mt-6">
        <Note tone="warn">
          <p className="font-semibold">{t.rebuild.alreadyTitle}</p>
          <p className="mt-1">{t.rebuild.alreadyDesc}</p>
        </Note>
      </div>

      <Item title={t.rebuild.whyTitle}>
        <p>{t.rebuild.why1}</p>
        <p>{t.rebuild.why2}</p>
        <p>{t.rebuild.why3}</p>
      </Item>

      <Item title={t.rebuild.lostTitle}>
        <p>{t.rebuild.lostDesc}</p>
        <ul className="flex list-disc flex-col gap-2 ps-5">
          <li>{t.rebuild.lost1}</li>
          <li>{t.rebuild.lost2}</li>
          <li>{t.rebuild.lost3}</li>
          <li>{t.rebuild.lost4}</li>
        </ul>
      </Item>

      <Item title={t.rebuild.keptTitle}>
        <p>{t.rebuild.keptDesc}</p>
      </Item>

      <Item title={t.rebuild.toDoTitle}>
        <p className="font-semibold text-ink">{t.rebuild.toDoBefore}</p>
        <ul className="flex list-disc flex-col gap-2 ps-5">
          <li>{t.rebuild.toDo1}</li>
        </ul>
        <p className="mt-2 font-semibold text-ink">{t.rebuild.toDoAfter}</p>
        <ul className="flex list-disc flex-col gap-2 ps-5">
          <li>{t.rebuild.toDo2}</li>
          <li>{t.rebuild.toDo3}</li>
          <li>{t.rebuild.toDo4}</li>
        </ul>
        {/* 🔴 A WAY THROUGH, NOT A WALLET BUTTON (Đ1-13, 2026-08-27).
            Measured `27/08`: this page says the word "faucet" **13 times** while its body has
            **0 `href`s** — the only two `/faucet/` links in the HTML belong to the nav bar. The
            page tells people to go and do something and then gives them no directions.
            ⚠️ DELIBERATELY only an `<a>` tag; the "Add network to wallet" button is NOT copied
            here. The existing rule in `vi.ts` is right and stands: this is a READING page, and
            every wallet-invoking action belongs on a screen that has the error handling for it. */}
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

      {/* Placed DIRECTLY AFTER "What you need to do": that section says what to do, this one
          says what you will see if you do not. Reversing the order asks the reader to remember an
          abstract warning before knowing which action it leads to. */}
      <Item title={t.rebuild.silentTitle}>
        <p>{interpolate(t.rebuild.silentDesc, { chainId: CHAIN.chainId })}</p>
        <ul className="flex list-disc flex-col gap-2 ps-5">
          <li>{t.rebuild.silent1}</li>
          <li>{t.rebuild.silent2}</li>
        </ul>
      </Item>

      <Item title={t.rebuild.repeatTitle}>
        <p>{t.rebuild.repeatDesc}</p>
      </Item>

      <div className="mt-10">
        <Note tone="warn">
          <p className="font-semibold">{t.rebuild.dateNote}</p>
          <p className="mt-1">{interpolate(t.rebuild.dateNoteDesc, { date: ngay })}</p>
        </Note>
      </div>
    </div>
  );
}
