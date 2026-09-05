/**
 * The page header (`<h1>` + lead line) for the four screens that share this shape.
 * (i18n, 2026-08-27)
 *
 * ═══ WHY THE TEXT HAS TO COME FROM BELOW A CLIENT BOUNDARY ═══
 * `page.tsx` is a **server component** — it has to be, because `export const metadata` is only
 * valid in one. But a server component runs at BUILD time, when there is no browser and no
 * "currently chosen" language. Any text that must change with the language has to live below a
 * client boundary.
 *
 * ⇒ The boundary for the whole site: **`metadata` on the server (English, fixed at build time) ·
 * displayed text on the client (following the reader's choice).**
 *
 * ═══ 🔴 IT TAKES TWO STRINGS NOW, AND IS RENDERED BY THE SCREEN, NOT BY `page.tsx` (2026-09-05) ═══
 * Until the per-page split of English (`lib/i18n/en/`) this component took the NAME of a key
 * group (`group="faucet"`) and looked the pair up in the dictionary itself. That was the right
 * shape while the dictionary was one object: the server could pass a string, and the client
 * resolved it. After the split it is the wrong shape — resolving `t[group]` for four possible
 * groups means importing four screens' English into one component that four pages share, i.e.
 * the faucet page would carry the launch screen's sentences again.
 *
 * So the screen that already holds its own English renders this header itself, as the first
 * child of a fragment (no extra DOM), and passes the two translated strings. The `page.tsx`
 * files keep only the frame `<div>` and `metadata`. This component has no client-only code
 * left in it, so it is no longer marked `'use client'`; it inherits whichever side renders it.
 */
export function PageHeader({ title, desc, width }: { title: string; desc: string; width?: 'narrow' | 'wide' }) {
  return (
    <header className={width === 'wide' ? 'max-w-3xl' : 'max-w-2xl'}>
      <h1 className="font-display text-2xl font-extrabold text-ink md:text-3xl">{title}</h1>
      <p className="mt-3 text-base text-body">{desc}</p>
    </header>
  );
}
