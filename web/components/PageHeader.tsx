'use client';

import { useT } from '@/lib/i18n';

/**
 * The page header (`<h1>` + lead line) for the four screens that share this shape.
 * (i18n, 2026-08-27)
 *
 * ═══ WHY THIS HAD TO BECOME A CLIENT COMPONENT ═══
 * `page.tsx` is a **server component** — it has to be, because `export const metadata` is only
 * valid in one. But a server component runs at BUILD time, when there is no browser and no
 * "currently chosen" language. Any text that must change with the language has to live below a
 * client boundary.
 *
 * ⇒ The boundary for the whole site: **`metadata` on the server (English, fixed at build time) ·
 * displayed text on the client (following the reader's choice).**
 *
 * 🔴 THE PROP IS A STRING, NOT A FUNCTION. A server component cannot pass a function to a client
 * component (it is not serialisable). So this one takes the **name of a key group** and looks it
 * up itself, rather than receiving two already-translated strings — receiving translated strings
 * would require the server to know the language, and it does not.
 *
 * The four groups below each have exactly a `title` + `desc` pair. The `HeaderGroup` type locks
 * that in: adding a group missing either key is `tsc`-red right here.
 */
type HeaderGroup = 'faucet' | 'launch' | 'myChains' | 'compare';

export function PageHeader({ group, width }: { group: HeaderGroup; width?: 'narrow' | 'wide' }) {
  const t = useT();
  const g = t[group];
  return (
    <header className={width === 'wide' ? 'max-w-3xl' : 'max-w-2xl'}>
      <h1 className="font-display text-2xl font-extrabold text-ink md:text-3xl">{g.title}</h1>
      <p className="mt-3 text-base text-body">{g.desc}</p>
    </header>
  );
}
