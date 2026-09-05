'use client';

import { useT } from '@/lib/i18n';
import { CHAIN, explorerOrigin } from '@/lib/chain';
import { BrandLockup } from './BrandLockup';

/**
 * The site footer (Đ1-13, 2026-08-27).
 *
 * The previous version had **0 links** — just a logo and two lines of text. Every path through
 * the site lived in the top nav bar, so a reader reaching the bottom of the page reached a dead end.
 *
 * 🔴 ONLY LINKS MEASURED TO BE ALIVE. Measured `27/08`:
 *     https://a1.9scan.org      → 200
 *     https://9chain.org/       → 200
 *     https://9chain.org/docs/  → 404  ⇒ no documentation entry pointed THERE
 * ✅ `2026-09-05`: there is now a documentation entry, and it points at `/docs/` on this
 * site — a catalogue of the real guides, whose every outbound URL is fetched by
 * `scripts/check-doc-links.mjs` before each deploy. The 404 above is still a 404; what
 * changed is that the project finally has an address of its own for this.
 * A footer full of broken links is worse than an empty one: it makes a promise and breaks it on
 * the spot. (The 9Scan-A1 home page currently has exactly two dead links into `/docs/` — they
 * have been told, and it is not being copied here.)
 *
 * ⚠️ A "contact / report a bug" entry is DELIBERATELY absent — the real channel is question **D2**,
 * which David has not answered. Inventing an address to make the footer look complete is the worst
 * thing here: people would write to it and nobody would read it.
 *
 * 🔴 `/re-genesis/` IS HERE ON PURPOSE, not as filler. Today it has EXACTLY ONE way in — the
 * banner strip — and that strip is **scheduled to be removed on G-day**. Once it goes, the warning
 * page loses its last entrance, exactly when people most need to read it again.
 */

/** An external link: always a safe `rel`, and it tells screen readers it opens a new tab. */
function NgoaiTrang({ href, children }: { href: string; children: React.ReactNode }) {
  const t = useT();
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="tap-target hover:text-ink hover:underline">
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
        { href: '/docs/', label: t.docs.title },
        { href: '/validators/', label: t.validators.title },
        { href: '/ceremony/', label: t.nav.ceremony },
        { href: '/re-genesis/', label: t.footer.rebuildPlan },
      ],
    },
  ];

  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="khung py-10 text-sm text-body-2">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="flex flex-col gap-3">
            {/* The footer uses `bg-surface` — a background that CHANGES with the theme (white in
                light, #131c33 in dark) ⇒ the logo has to follow, hence `nen="theo-theme"`.
                Unlike the header: the header is always navy, so it always uses the dark version. */}
            {/* 26 → 34 in the same pass as the header (`2026-09-03`) — keeping the existing convention
                that the footer sits one step below the header, rather than enlarging one place alone. */}
            <BrandLockup background="auto" height={34} label={t.common.productName} />
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
                        // `tap-target` (see `globals.css`) gives these 44px of height on a
                        // touch screen and nothing at all on a desktop — measured at 19px tall
                        // before, i.e. under half a fingertip, in a two-column grid.
                        <a href={m.href} className="tap-target hover:text-ink hover:underline">
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
