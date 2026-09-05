'use client';

import { Card, Note } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { LANGUAGES } from '@/lib/i18n/languages';
import { DOCS, type DocLang } from '@/lib/docs';

/**
 * Body of `/docs/`.
 *
 * Rendered from data, not from prose, so `check-doc-links.mjs` can walk the same list and
 * fetch every URL before a deploy. A hand-written list of links is a list nothing measures.
 */

/** The endonym for a language code — "Tiếng Việt", not "Vietnamese". */
function tenNgonNgu(code: DocLang): string {
  return LANGUAGES.find((l) => l.code === code)?.ten ?? code.toUpperCase();
}

function Ngoai({ href, children }: { href: string; children: React.ReactNode }) {
  const t = useT();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="tap-target font-semibold text-gold-ink-strong underline underline-offset-2 hover:text-ink"
    >
      {children}
      <span className="sr-only"> ({t.docs.opensGithub})</span>
    </a>
  );
}

export function DocsContent() {
  const t = useT();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
      <h1 className="font-display text-3xl font-extrabold text-ink md:text-4xl">{t.docs.title}</h1>
      <p className="mt-3 text-base text-muted">{t.docs.desc}</p>

      <div className="mt-6">
        <Note tone="info">{t.docs.langNote}</Note>
      </div>

      {/* `grid-cols-[minmax(0,1fr)]` for the reason measured on /ceremony/: a grid item's
          default `min-width: auto` lets one long unbreakable string widen the whole document. */}
      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-4">
        {DOCS.map((d) => (
          <Card key={d.id} className="p-5">
            <h2 className="font-display text-lg font-bold text-ink">
              <Ngoai href={d.href}>{d.title}</Ngoai>
            </h2>
            <p className="mt-2 text-sm text-body">{d.summary}</p>

            <dl className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2 text-sm">
              <div className="flex items-baseline gap-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{t.docs.langLabel}</dt>
                <dd className="text-ink">{tenNgonNgu(d.lang)}</dd>
              </div>

              {d.also ? (
                <div className="flex items-baseline gap-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{t.docs.alsoIn}</dt>
                  <dd>
                    <Ngoai href={d.also.href}>{tenNgonNgu(d.also.lang)}</Ngoai>
                  </dd>
                </div>
              ) : null}

              {d.pdf?.length ? (
                <div className="flex items-baseline gap-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{t.docs.pdfLabel}</dt>
                  <dd className="flex flex-wrap gap-x-3">
                    {d.pdf.map((p) => (
                      <Ngoai key={p.href} href={p.href}>
                        {tenNgonNgu(p.lang)}
                      </Ngoai>
                    ))}
                  </dd>
                </div>
              ) : null}

              {d.onSite ? (
                <div className="flex items-baseline gap-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{t.docs.onSiteLabel}</dt>
                  <dd>
                    <a href={d.onSite} className="tap-target font-semibold text-gold-ink-strong underline underline-offset-2 hover:text-ink">
                      {d.onSite}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          </Card>
        ))}
      </div>
    </div>
  );
}
