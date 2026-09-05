'use client';

import { Card, Note } from '@/components/ui';
import { usePageT } from '@/lib/i18n';
import { EN_NINE_YEARS } from '@/lib/i18n/en/nine-years';
import { EN_DOCS } from '@/lib/i18n/en/docs';
import { MOMENT_ISO } from '@/lib/ceremony';
import { DOCS } from '@/lib/docs';

/**
 * Body of `/nine-years/`.
 *
 * ═══ WHAT THIS PAGE IS ═══
 * The manifesto's argument, in the reader's own language, ending with the manifesto itself.
 * The document is 190 lines and exists in two languages; this is its spine in thirty. Nothing
 * here is invented for the web — every section is one of the document's own, condensed, and
 * `lib/i18n/en/nine-years.ts` says so where a translator might otherwise soften it.
 *
 * 🔴 THE FULL DOCUMENT IS LINKED FROM `lib/docs.ts`, NOT RETYPED HERE. One catalogue of where
 * the documents live; a second copy of those URLs on this page would be a second thing to keep
 * correct, and `check-doc-links.mjs` measures the catalogue.
 */

const STAGES: { year: string; key: 'stage2027' | 'stage2028' | 'stage2029' | 'stage2030' | 'stage2031' | 'stage2032' | 'stage2033' | 'stage2034' | 'stage2035' }[] = [
  { year: '2027', key: 'stage2027' },
  { year: '2028', key: 'stage2028' },
  { year: '2029', key: 'stage2029' },
  { year: '2030', key: 'stage2030' },
  { year: '2031', key: 'stage2031' },
  { year: '2032', key: 'stage2032' },
  { year: '2033', key: 'stage2033' },
  { year: '2034', key: 'stage2034' },
  { year: '2035', key: 'stage2035' },
];

/** Its own groups, plus `docs.*` for the link to the full manifesto document. The page links are labelled from `nav.*` (core). */
const SECTIONS = { ...EN_NINE_YEARS, ...EN_DOCS };

export function NineYearsContent() {
  const t = usePageT(SECTIONS);
  const n = t.nineYears;
  const manifesto = DOCS.find((d) => d.id === 'manifesto');

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
      <h1 className="font-display text-3xl font-extrabold text-ink md:text-4xl">{n.title}</h1>
      <p className="mt-4 text-base text-body">{n.lede}</p>

      {/* The date is the ceremony's, so it points at the page that owns it rather than
          restating a moment that lives in `lib/ceremony.ts`. */}
      <p className="mt-4">
        <a href="/ceremony/" className="tap-target font-mono text-sm text-gold-ink-strong underline underline-offset-2">
          {MOMENT_ISO}
        </a>
      </p>

      <blockquote className="mt-8 border-s-4 border-gold-line ps-4 font-display text-lg font-bold text-ink md:text-xl">
        {n.oneLine}
      </blockquote>

      {/* ── What is happening ─────────────────────────────────────────────── */}
      <h2 className="mt-12 font-display text-xl font-bold text-ink">{n.whatTitle}</h2>
      <div className="mt-3 flex flex-col gap-3 text-sm text-body md:text-base">
        <p>{n.what1}</p>
        <p>{n.what2}</p>
        <p className="font-semibold text-ink">{n.what3}</p>
      </div>

      {/* ── Five promises ─────────────────────────────────────────────────── */}
      <h2 className="mt-12 font-display text-xl font-bold text-ink">{n.promisesTitle}</h2>
      <ol className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3">
        {[n.promise1, n.promise2, n.promise3, n.promise4, n.promise5].map((p, i) => (
          <li key={i} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 text-sm text-body">
            <span className="font-mono text-xs font-semibold text-gold">{i + 1}</span>
            <span>{p}</span>
          </li>
        ))}
      </ol>
      <div className="mt-4">
        <Note tone="info">{n.promiseNot}</Note>
      </div>

      {/* ── The constitution ──────────────────────────────────────────────── */}
      <h2 className="mt-12 font-display text-xl font-bold text-ink">{n.constitutionTitle}</h2>
      <p className="mt-3 text-sm text-body md:text-base">{n.constitutionDesc}</p>
      <p className="mt-3 text-sm text-muted">{n.constitutionStd}</p>

      {/* ── The tree ──────────────────────────────────────────────────────── */}
      <h2 className="mt-12 font-display text-xl font-bold text-ink">{n.treeTitle}</h2>
      <p className="mt-3 text-sm text-body md:text-base">{n.treeDesc}</p>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-2">
        {[n.treeRoot, n.treeTrunk, n.treeBranch, n.treeLeaf].map((tang, i) => (
          <Card key={i} className="p-3 md:p-4">
            {/* Indented by depth: the shape of the sentence is the shape of the tree, and it
                uses a logical property so the three RTL languages lean the other way. */}
            <p className="text-sm text-body" style={{ paddingInlineStart: `${i * 0.9}rem` }}>
              {tang}
            </p>
          </Card>
        ))}
      </div>

      {/* ── Nine stages ───────────────────────────────────────────────────── */}
      <h2 className="mt-12 font-display text-xl font-bold text-ink">{n.stagesTitle}</h2>
      <ol className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3">
        {STAGES.map((s) => (
          <li key={s.year} className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3 text-sm text-body">
            <span className="font-mono text-xs font-semibold tabular-nums text-gold">{s.year}</span>
            <span>{n[s.key]}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm text-muted">{n.stagesNote}</p>

      {/* ── What we commit not to do ──────────────────────────────────────── */}
      <h2 className="mt-12 font-display text-xl font-bold text-ink">{n.commitTitle}</h2>
      <ul className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3">
        {[n.commit1, n.commit2, n.commit3, n.commit4, n.commit5].map((c, i) => (
          <li key={i} className="border-s-2 border-line ps-4 text-sm text-body">
            {c}
          </li>
        ))}
      </ul>

      {/* ── The invitation ────────────────────────────────────────────────── */}
      <h2 className="mt-12 font-display text-xl font-bold text-ink">{n.joinTitle}</h2>
      <p className="mt-3 text-sm text-body md:text-base">{n.joinDesc}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href="/validators/"
          className="inline-flex h-13 items-center justify-center rounded-btn-lg bg-gold px-6 text-base font-semibold text-navy shadow-cta hover:bg-gold-hover"
        >
          {t.nav.validators}
        </a>
        <a
          href="/create-chain/"
          className="inline-flex h-13 items-center justify-center rounded-btn-lg border border-line-strong px-6 text-base font-semibold text-ink hover:bg-surface-alt"
        >
          {t.nav.launch}
        </a>
        <a
          href="/docs/"
          className="inline-flex h-13 items-center justify-center rounded-btn-lg border border-line-strong px-6 text-base font-semibold text-ink hover:bg-surface-alt"
        >
          {t.nav.docs}
        </a>
      </div>

      {manifesto ? (
        <p className="mt-8 text-sm text-muted">
          {n.fullDoc}:{' '}
          <a className="font-semibold text-gold-ink-strong underline underline-offset-2" href={manifesto.href} target="_blank" rel="noopener noreferrer">
            {t.docs.title}
            <span className="sr-only"> ({t.docs.opensGithub})</span>
          </a>
        </p>
      ) : null}
    </div>
  );
}
